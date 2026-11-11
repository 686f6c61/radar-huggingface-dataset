# diegomponte/wav2vec2-base-speech-commands-35

## Resumen

wav2vec2-base-speech-commands-35 es un modelo de clasificación de audio obtenido mediante fine-tuning de facebook/wav2vec2-base sobre el corpus Speech Commands v0.02. Lo desarrolla diegomponte y su propósito es reconocer palabras aisladas en inglés: en concreto, 35 comandos que incluyen los diez dígitos, direcciones (up, down, left, right, forward, backward), verbos de control (on, off, stop, go, follow, learn) y sustantivos del dataset original (bed, bird, cat, dog, happy, house, marvin, sheila, tree, visual, wow).

El modelo resuelve el problema de keyword spotting (detección de palabras clave) en un escenario controlado de una sola palabra y un segundo de duración. Es relevante para quien necesite un clasificador ligero y desplegable en local, con 94,5 millones de parámetros y pesos en safetensors y ONNX, lo que permite inferencia en CPU y en GPUs de consumo. No es un sistema de reconocimiento de voz general: no transcribe ni procesa audio continuo.

La arquitectura es la de Wav2Vec2 (transformer convolucional más encoder de atención) con una cabeza de clasificación de secuencia. El contexto no aplica en el sentido de ventana de tokens de texto: la entrada es una ventana de audio de un segundo a 16 kHz. La licencia Apache-2.0 y el tamaño reducido del repositorio (0,9 GB) facilitan su integración en productos embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (encoder convolucional de características + transformer + pooling temporal + clasificador lineal) |
| Parametros totales | 94.577.571 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio de 1 segundo a 16 kHz (mono) |
| Tipos de cuantizacion | no disponible (repo con safetensors y ONNX; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo parte de facebook/wav2vec2-base y se entrena como Wav2Vec2ForSequenceClassification: proyección a 256 dimensiones, mean pooling sobre el eje temporal y una capa lineal con 35 salidas. El encoder convolucional de características se congela y se entrenan el transformer y la cabeza de clasificación. Se usa el dataset completo de entrenamiento de Speech Commands v0.02 (84.843 clips) con las listas oficiales de validación y test, de modo que ningún hablante aparece en dos particiones.

Los hiperparámetros documentados son AdamW con learning rate 3e-5, warmup lineal del 10 %, batch 32, precisión fp16, 5 épocas y semilla 42; la mejor época se elige por exactitud de validación. Los clips se rellenan con ceros hasta un segundo y se normalizan con el extractor de características de Wav2Vec2. El entrenamiento se realizó en una única GPU de portátil RTX 4050 (6 GB) en 35 minutos, lo que da una idea de la ligereza del ajuste. No se documenta el uso de RLHF ni DPO; es un ajuste supervisado de clasificación.

## Capacidades

- Clasificación de audio de palabra aislada en inglés entre 35 clases cerradas.
- Reconocimiento de los dígitos del cero al nueve y de comandos de dirección y control.
- Reconocimiento de sustantivos del corpus Speech Commands (bed, bird, cat, dog, happy, house, marvin, sheila, tree, visual, wow).
- Salida con puntuaciones de probabilidad por clase (top_k configurable en el pipeline).
- Inferencia en CPU y GPU de consumo gracias a su tamaño reducido.
- Exportación a ONNX para despliegue en entornos sin PyTorch.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio continuo ni transcripción.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Activación por palabra clave en dispositivos embebidos: el modelo clasifica un segundo de audio en una de 35 clases, por lo que puede usarse como detector de wake words o comandos en un asistente local sin enviar audio a la nube. Su tamaño (94,5 M de parámetros) permite ejecutarlo en CPU de Raspberry Pi o en GPUs integradas.
- Control por voz de menús y navegación: los comandos up, down, left, right, forward y backward encajan de forma directa en interfaces de navegación de aplicaciones, presentaciones o sistemas de accesibilidad.
- Dictado de dígitos en formularios: las clases zero a nine permiten introducir números por voz en encuestas, inventarios o sistemas de atención telefónica, con la puntuación de salida como umbral de confianza.
- Automatización del hogar con vocabulario cerrado: on, off, stop y go son suficientes para encender y apagar dispositivos, y el modelo puede ejecutarse en el propio dispositivo domótico.
- Filtro previo en pipelines de voz: al ser un clasificador rápido, puede actuar como primera etapa que decide si el audio contiene una palabra de interés antes de invocar un modelo de reconocimiento de voz más costoso, reduciendo el cómputo total.
- Docencia e investigación en audio: sirve como línea base reproducible para experimentos de keyword spotting con Speech Commands, con hiperparámetros y particiones documentados y un coste de entrenamiento de 35 minutos en una GPU de 6 GB.
- Prototipado de interfaces de voz en demos web: la exportación a ONNX y el pipeline de transformers permiten integrarlo en aplicaciones web o demos de Hugging Face Spaces con latencia baja.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| Speech Commands v0.02 (35 palabras, test oficial) | Accuracy | 0,9772 |
| Speech Commands v0.02 (35 palabras, test oficial) | Macro F1 | 0,9752 |
| Speech Commands v0.02 (validación, mejor época) | Accuracy | 0,9775 |

El autor advierte de que esta tarea de 35 clases no es comparable con el benchmark de 12 clases (10 palabras más "unknown" y "silence") que reportan SUPERB y otros trabajos. Las palabras con peor F1 son "tree" (0,91), "forward" (0,95) y "learn" (0,95); la mayoría de errores se producen entre palabras de sonido parecido, como "tree" confundida con "three" (25 errores) y "off" escuchada como "up" (10).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 94,5 M de parámetros; en la práctica, unos pocos cientos de MB con batch pequeño.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; el propio autor entrenó con una RTX 4050 de 6 GB. Para inferencia bastan GTX 1650, RTX 3050, RTX 4090, A100 o H100, aunque las GPU de gama alta están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU y CPU.
- Opciones de despliegue: pipeline de transformers, ONNX Runtime (hay pesos ONNX en el repositorio), TorchScript y servidores de inferencia compatibles con transformers. No se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo y la ventana de un segundo, se espera latencia de milisegundos en GPU y de decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wav2vec2-base-speech-commands-35 | 94,5 M | Clasificación de 35 palabras | 1 s a 16 kHz | Apache-2.0 | Hugging Face |
| facebook/wav2vec2-base | 94,4 M | Representaciones de voz (preentrenamiento) | Audio variable | Apache-2.0 | Hugging Face |
| Modelos de keyword spotting de 12 clases (SUPERB) | Variable | Clasificación de 12 clases (10 palabras + unknown + silence) | 1 s a 16 kHz | Variable | Papers y repositorios |
| Whisper (variantes small/base) | 39 M – 244 M | Transcripción de voz | Ventanas de 30 s | MIT | Hugging Face, OpenAI |

La comparación con el benchmark de 12 clases no es directa porque el conjunto de etiquetas difiere; el propio autor lo señala. Frente a Whisper, este modelo no transcribe: solo asigna una de 35 etiquetas, lo que lo hace mucho más ligero y determinista para comandos cerrados, pero inútil para voz libre. No se dispone de datos de otros modelos de 35 clases comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés y solo palabras aisladas de un segundo; no transcribe ni procesa audio continuo.
- No existe clase "unknown" ni "silence": cualquier sonido recibe una de las 35 etiquetas, por lo que conviene usar la puntuación como umbral de confianza.
- El corpus Speech Commands se grabó con voluntarios a través de navegadores y teléfonos; los acentos, las voces infantiles y los entornos ruidosos están menos representados que en un uso real.
- Riesgo de confusión entre palabras homófonas o de sonido parecido, documentado en "tree"/"three" y "off"/"up".
- Riesgo de alucinación en el sentido de asignar una etiqueta a audio que no contiene ninguna de las 35 palabras.
- Licencia Apache-2.0, que permite uso comercial; el dataset Speech Commands se distribuye bajo CC-BY-4.0 y conviene conservar la atribución.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente.
- No se documentan sesgos demográficos específicos más allá de la advertencia sobre la composición del corpus.
- El modelo no debe usarse para vigilancia o identificación de hablantes: clasifica palabras, no personas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diegomponte/wav2vec2-base-speech-commands-35
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/diegomponte/speech-commands-demo
- Código de entrenamiento: https://github.com/dpontejs/classificacao_voz
- Modelo base: https://huggingface.co/facebook/wav2vec2-base
- Paper de Speech Commands: https://arxiv.org/abs/1804.03209
- Dataset Speech Commands: https://huggingface.co/datasets/google/speech_commands
