import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import { useHeaderHeight } from '@react-navigation/stack';
import colors from '../styles/colors';
import RoundIconBtn from './RoundIconBtn';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBooks } from '../contexts/BookProvider';
import BookInputModal from './BookInputModal';

const formatDate = ms => {
	const date = new Date(ms);
	const day = date.getDate();
	const month = date.getMonth() + 1;
	const year = date.getFullYear();
	const hrs = date.getHours();
	const min = date.getMinutes();
	const sec = date.getSeconds();

	return `${day}/${month}/${year} - ${hrs}:${min}:${sec}`;
};

const BookDetail = props => {
	const [book, setBook] = useState(props.route.params.book);
	const headerHeight = useHeaderHeight();
	const { setBooks } = useBooks();
	const [showModal, setShowModal] = useState(false);
	const [isEdit, setIsEdit] = useState(false);

	const deleteBook = async () => {
		const result = await AsyncStorage.getItem('books');
		let books = [];
		if (result !== null) books = JSON.parse(result);

		const newBooks = books.filter(n => n.id !== book.id);
		setBooks(newBooks);
		await AsyncStorage.setItem('books', JSON.stringify(newBooks));
		props.navigation.goBack();
	};

	const displayDeleteAlert = () => {
		Alert.alert(
			'Are You Sure!',
			'This action will delete your book permanently!',
			[
				{
					text: 'Delete',
					onPress: deleteBook,
				},
				{
					text: 'Cancel',
				},
			],
			{
				cancelable: true,
			}
		);
	};

	const handleUpdate = async (title, desc, time) => {
		const result = await AsyncStorage.getItem('books');
		let books = [];
		if (result !== null) books = JSON.parse(result);

		const newBooks = books.filter(n => {
			if (n.id === book.id) {
				n.title = title;
				n.desc = desc;
				n.isUpdated = true;
				n.time = time;

				setBook(n);
			}
			return n;
		});

		setBooks(newBooks);
		await AsyncStorage.setItem('books', JSON.stringify(newBooks));
	};
	const handleOnClose = () => setShowModal(false);

	const openEditModal = () => {
		setIsEdit(true);
		setShowModal(true);
	};

	return (
		<>
			<ScrollView
				contentContainerStyle={[styles.container, { paddingTop: headerHeight }]}
			>
				<Text style={styles.time}>
					{book.isUpdated
						? `Updated At ${formatDate(book.time)}`
						: `Created At ${formatDate(book.time)}`}
				</Text>
				<Text style={styles.title}>{book.title}</Text>
				<Text style={styles.desc}>{book.desc}</Text>
			</ScrollView>
			<View style={styles.btnContainer}>
				<RoundIconBtn
					antIconName='delete'
					style={{ backgroundColor: colors.ERROR, marginBottom: 15 }}
					onPress={displayDeleteAlert}
				/>
				<RoundIconBtn antIconName='edit' onPress={openEditModal} />
			</View>
			<BookInputModal
				isEdit={isEdit}
				book={book}
				onClose={handleOnClose}
				onSubmit={handleUpdate}
				visible={showModal}
			/>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		// flex: 1,
		paddingHorizontal: 15,
	},
	title: {
		fontSize: 30,
		color: colors.PRIMARY,
		fontWeight: 'bold',
	},
	desc: {
		fontSize: 20,
		opacity: 0.6,
	},
	time: {
		textAlign: 'right',
		fontSize: 12,
		opacity: 0.5,
	},
	btnContainer: {
		position: 'absolute',
		right: 15,
		bottom: 50,
	},
});

export default BookDetail;
