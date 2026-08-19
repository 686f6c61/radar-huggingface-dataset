# kerasformers/qwen2.5-vl-3b-instruct

## Resumen

El modelo `kerasformers/qwen2.5-vl-3b-instruct` es una conversión íntegra en Keras 3 del modelo vision-language `Qwen/Qwen2.5-VL-3B-Instruct`, desarrollado por el equipo Qwen de Alibaba. La conversión, realizada por el proyecto KerasFormers, permite ejecutar el modelo de forma idéntica sobre tres backends de Keras 3 —TensorFlow, PyTorch y JAX— sin modificar el código. Se trata de la variante de 3B parámetros de la familia Qwen2.5-VL, que procesa entradas de imagen y texto para generar respuestas textuales mediante el pipeline `image-text-to-text`.

El modelo base Qwen2.5-VL-3B-Instruct combina un codificador visual tipo ViT con un decodificador de lenguaje basado en Qwen2.5, y soporta resolución dinámica de imagen, lo que permite procesar imágenes de cualquier tamaño sin redimensionado previo. Su ventana de contexto es de 32.768 tokens, ampliable a 128.000 mediante la técnica YaRN. Los pesos de esta conversión se almacenan en bfloat16 y ocupan aproximadamente 7,5 GB en el repositorio
