# adityak74/Ornith-1.5-9B-MLX-distil-oQ4

## Resumen

Ornith-1.5-9B-MLX-distil-oQ4 es un modelo de lenguaje denso de 8.953.803.264 parámetros, destilado a partir de dos profesores y cuantizado con un esquema mixto de bits denominado oQ4. Lo desarrolla adityak74 como una variante optimizada del modelo base ornith-ai/Ornith-1.5-9B-MLX, pensado para ejecutarse en Apple Silicon con una huella de memoria de aproximadamente 4,9 GB. Su relevancia radica en que logra superar al modelo base del que procede en MMLU y HumanEval, pese a mantener el mismo tamaño y el mismo esquema de cuantización, lo que demuestra que la destilación puede reparar parte del daño que la cuantización inflige sobre la capacidad del modelo para terminar su razonamiento.

La arquitectura es un transformer denso de la familia Qwen3.5, según la etiqueta del repositorio, con 8.95 mil millones de parámetros totales y un formato de pesos safetensors para MLX. La longitud de contexto no está disponible en la información proporcionada. El modelo es un modelo de razonamiento: por defecto, la respuesta del asistente se abre con un bloque `
