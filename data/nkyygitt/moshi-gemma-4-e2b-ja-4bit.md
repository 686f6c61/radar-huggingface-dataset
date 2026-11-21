# nkyygitt/moshi-gemma-4-e2b-ja-4bit

## Resumen

moshi-gemma-4-e2b-ja-4bit es una conversión comunitaria del modelo Gemma 4 E2B (variante instruct, 4 bits) orientada a conversación en japonés sobre dispositivos Apple. Lo publica el usuario nkyygitt y se distribuye en formato MLX, la librería de Apple para ejecutar modelos en silicio unificado (M-series y A-series). El punto de partida es `mlx-community/gemma-4-e2b-it-4bit`, a su vez una cuantización de `google/gemma-4-E2B-it`. El modelo conserva la arquitectura multimodal texto-imagen del original, pero elimina la torre de audio y poda el vocabulario de 262.144 a 74.857 tokens para reducir el peso en disco de aproximadamente 3,55 GB a 1,83 GB.

La motivación es el despliegue on-device en iPhone: un modelo de 2.831.349.283 parámetros totales (cuantizado a 4 bits) que quepa en memoria de un teléfono y mantenga la calidad conversacional en japonés. No se reentrenaron pesos: la poda del vocabulario se acompaña de un remapeo de los IDs de token en `config.json`, `tokenizer.json` y `processor_config.json`, y de un recorte coordinado de las filas de los embeddings atados (pesos, escalas y sesgos).

Es relevante porque ilustra una técnica práctica de compresión para edge: poda de vocabulario guiada por frecuencia sobre un corpus de conversación, con verificación de equivalencia frente al modelo sin podar. La licencia Apache 2.0 facilita su reutilización comercial, aunque el modelo solo declara soporte de japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal texto-imagen (Gemma 4 E2B), sin torre de audio |
| Parametros totales | 2.831.349.283 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |
| Tamano del repositorio | 1,8 GB (pesos ~1,83 GB) |
| Vocabulario | 74.857 tokens (original: 262.144) |
| Modalidades de entrada | Texto e imagen (audio eliminado) |
| Libreria | mlx |
| Modelo base | mlx-community/gemma-4-e2b-it-4bit |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 4 E2B en su variante instruct y cuantizada a 4 bits. Es un transformer multimodal que procesa texto e imagen; la torre de audio y los pesos de embedding de audio del modelo original se han eliminado por completo. Los embeddings de entrada y salida están atados (tied embeddings), de modo que la poda del vocabulario recorta simultáneamente las filas de pesos, escalas y sesgos de cuantización.

No se ha realizado ningún reentrenamiento ni ajuste fino. La modificación consiste en una poda de vocabulario: se conservan los tokens que aparecen 10 o más veces en un corpus de conversación en japonés, unos 8.000 términos frecuentes en inglés, todos los tokens especiales y los tokens necesarios para preservar las rutas de merge del BPE. Los IDs se remapean en `config.json`, `tokenizer.json` y `processor_config.json`. El autor documenta verificaciones de equivalencia: con decodificación greedy, las respuestas coinciden con las del modelo sin podar en 27 de 27 turnos de conversación y 64 de 64 prompts adicionales; las descripciones de imagen coinciden en 5 imágenes de prueba con MLXVLM (mlx-swift-lm 3.32.3); y la tokenización es idéntica al tokenizador original en el 100% de los textos de conversación japoneses probados y en el 98,7% de 1.000 frases japonesas generales.

## Capacidades

- Generación de texto conversacional multi-turno en japonés.
- Comprensión de imágenes (image-text-to-text): descripción y respuesta a preguntas sobre imágenes.
- Razonamiento y respuesta instruct heredados de Gemma 4 E2B-it (el autor indica que la capacidad es la misma que la del modelo base).
- Tokenización optimizada para japonés conversacional.
- Ejecución on-device en Apple Silicon mediante MLX y MLXVLM.
- Sin soporte de audio (eliminado respecto al modelo base).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a japonés según la model card; el inglés solo se conserva parcialmente en el vocabulario.

## Casos de uso

- Conversación por voz en iPhone con pipeline externo: el modelo gestiona el diálogo multi-turno en japonés y la app añade ASR y TTS por separado, ya que la torre de audio se ha eliminado. Adecuado por su tamaño de 1,83 GB y su formato MLX.
- Asistente personal offline en dispositivos Apple: respuestas conversacionales sin conexión gracias a la inferencia local con MLX, sin depender de APIs externas.
- Descripción de imágenes en japonés desde el móvil: el modelo acepta entrada de imagen y texto, útil para apps de accesibilidad o etiquetado rápido de fotos.
- Prototipado de chatbots japoneses en entornos de desarrollo con Mac: MLX permite iterar en local con un modelo de 2,8 mil millones de parámetros cuantizado a 4 bits.
- Evaluación de técnicas de compresión para edge: sirve como referencia reproducible de poda de vocabulario con verificación de equivalencia frente al modelo sin podar.
- Aplicaciones de bajo consumo en silicio unificado: el peso reducido y la cuantización a 4 bits encajan en escenarios donde la memoria es el recurso crítico.
- Filtrado y clasificación de texto japonés en local: clasificación o reescritura de mensajes dentro de una app sin enviar datos a servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente documenta pruebas de equivalencia funcional frente al modelo sin podar:

| Prueba | Resultado |
|---|---|
| Decodificación greedy, turnos de conversación | 27/27 idénticos al modelo sin podar |
| Decodificación greedy, prompts adicionales | 64/64 idénticos |
| Descripción de imagen (MLXVLM) | 5/5 imágenes con descripciones idénticas |
| Tokenización de textos de conversación japoneses | 100% idéntica al tokenizador original |
| Tokenización de 1.000 frases japonesas generales | 98,7% idéntica |

## Requisitos de hardware

- VRAM/memoria unificada estimada: en torno a 2 GB para los pesos en 4 bits, más overhead de activaciones y KV cache (no cuantificado en la información disponible).
- Diseñado para Apple Silicon: iPhone (uso declarado por el autor) y chips M-series en Mac.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas de forma nativa por MLX; requeriría conversión a otro runtime.
- Cabe en GPUs de consumo solo mediante conversión a GGUF u otro formato; el repositorio solo distribuye pesos MLX.
- Opciones de despliegue: MLX y MLXVLM (mlx-swift-lm 3.32.3 citado por el autor). vLLM, llama.cpp, Ollama y TGI no están documentados para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| moshi-gemma-4-e2b-ja-4bit | 2,83 B (4 bits) | no disponible | ja | Apache 2.0 | safetensors MLX |
| mlx-community/gemma-4-e2b-it-4bit (base) | ~2,83 B (4 bits) | no disponible | no disponible | Apache 2.0 | safetensors MLX |
| google/gemma-4-E2B-it (original) | ~2,83 B | no disponible | no disponible | Apache 2.0 | safetensors |

La diferencia principal frente al modelo base es el tamaño (1,83 GB frente a 3,55 GB), la eliminación del audio y la poda de vocabulario. No se dispone de datos de benchmarks para comparar rendimiento entre las tres variantes.

## Limitaciones y advertencias

- Las palabras inglesas fuera de la lista conservada y el código pueden dividirse en más tokens que con el tokenizador original, degradando la eficiencia en esos casos.
- No admite entrada de audio.
- La capacidad del modelo es la del Gemma 4 E2B original; esta conversión solo reduce el tamaño.
- Solo declara soporte de japonés; el uso en otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas.
- Sesgos conocidos: no documentados en la información disponible.
- Longitud de contexto no especificada; conviene verificarla antes de usarlo en conversaciones largas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria amplia.
- Requiere runtime MLX; no es directamente portable a ecosistemas CUDA sin conversión.
- Licencia Apache 2.0 permite uso comercial, pero al ser una versión modificada conviene conservar los avisos de modificación indicados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkyygitt/moshi-gemma-4-e2b-ja-4bit
- Modelo base (MLX 4 bits): https://huggingface.co/mlx-community/gemma-4-e2b-it-4bit
- Modelo original de Google: https://huggingface.co/google/gemma-4-E2B-it
