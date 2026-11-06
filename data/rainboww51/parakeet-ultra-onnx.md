# rainboww51/parakeet-ultra-onnx

## Resumen

`rainboww51/parakeet-ultra-onnx` es una conversión a ONNX del modelo de reconocimiento automático del habla `moondream/parakeet-ultra`, empaquetada para su uso con el runtime [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx) en modo offline (transductor no streaming, NeMo TDT). No es un modelo nuevo: es el mismo conjunto de pesos que el original, exportado a formato ONNX para permitir inferencia en C++, C, C#, Kotlin, Swift, Java, Go o JavaScript sin depender del stack de PyTorch ni del runtime propietario Photon de Moondream.

El modelo subyacente, `parakeet-ultra`, es un post-entrenamiento de NVIDIA Parakeet TDT 0.6B v3 realizado por Moondream: misma arquitectura FastConformer con transductor Token-and-Duration (TDT), mismo tokenizador y los mismos 0,6 mil millones de parámetros. Transcribe 25 lenguas europeas con puntuación y uso de mayúsculas, y su relevancia actual radica en que mejora las tasas de error del modelo base (por ejemplo, 5,80 % frente a 6,26 % en el Open ASR Leaderboard en inglés, y 9,55 % frente a 11,62 % en FLEURS para 25 idiomas) manteniendo el tamaño compacto.

La ficha cubre la exportación ONNX, no el modelo original: los datos de entrenamiento, hiperparámetros y detalles del post-entrenamiento no están documentados en este repositorio y deben consultarse en la model card de Moondream. La licencia es CC-BY-4.0, idéntica a la del original, con obligación de atribuir a Moondream y a NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + Token-and-Duration Transducer (TDT, decoder y joiner) |
| Parametros totales | 0,6 mil millones (0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; segmentos de audio de hasta 30 segundos por pasada (el modelo original incluye una cabeza VAD para trocear grabaciones largas) |
| Tipos de cuantizacion | FP32 (encoder.onnx, decoder.onnx, joiner.onnx) e INT8 (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx) |
| Idiomas soportados | 25: búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finlandés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, ruso, eslovaco, esloveno, español, sueco y ucraniano |
| Licencia | CC-BY-4.0 (atribución a Moondream y NVIDIA) |
| Formato de pesos | ONNX (encoder, decoder, joiner) + fichero `tokens.txt`; pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

La arquitectura es la de NVIDIA Parakeet TDT 0.6B v3, sin modificaciones: un encoder FastConformer que procesa espectrogramas de entrada (feature_dim de 128, muestreo a 16 kHz) y un transductor Token-and-Duration que predice conjuntamente el token y su duración, lo que permite decodificación no autorregresiva por bloques y reduce la latencia frente a transductores clásicos. El modelo se compone de tres grafos ONNX separados (encoder, decoder o red de predicción, y joiner) más una tabla de tokens. El export incluye una cabeza VAD en el modelo original que el runtime Photon de Moondream usa para segmentar grabaciones largas en tramos de como máximo 30 segundos; en esta exportación esa segmentación debe hacerse externamente, por ejemplo con Silero VAD de sherpa-onnx.

El post-entrenamiento que da lugar a `parakeet-ultra` fue realizado por Moondream sobre los pesos de NVIDIA, pero los datos, el procedimiento y los hiperparámetros no están documentados en este repositorio. Esta exportación ONNX no reentrena ni ajusta los pesos: solo convierte los pesos publicados a ONNX y los empaqueta para sherpa-onnx. No se documenta en la información disponible si hubo RLHF, DPO u otra fase de alineación, ni la composición del dataset de post-entrenamiento.

## Capacidades

- Transcripción de voz a texto offline en 25 lenguas europeas, con puntuación y uso de mayúsculas según las convenciones del modelo base Parakeet TDT 0.6B v3.
- Reconocimiento no streaming (offline): procesa el audio completo del segmento antes de emitir la transcripción, lo que favorece la precisión frente a la latencia en tiempo real.
- Decodificación greedy search mediante el transductor TDT, con predicción conjunta de token y duración.
- Integración nativa con sherpa-onnx en Python, C++, C, C#, Kotlin, Swift, Java, Go y JavaScript.
- No soporta traducción, diarización de hablantes ni identificación de idioma (explícitamente fuera de alcance según el autor).
- No es un modelo de texto: no genera lenguaje, no hace tool calling ni razonamiento multi-step; su única tarea es ASR.

## Casos de uso

- Transcripción por lotes de reuniones y entrevistas: se trocea el audio con Silero VAD en segmentos de hasta 30 segundos y se transcriben con sherpa-onnx en Python; el soporte de 25 idiomas permite procesar material multilingüe con un solo modelo.
- Subtitulado de vídeo en producción: la exportación ONNX se integra en pipelines en C++ o Go sin dependencias de PyTorch, lo que simplifica el despliegue en servidores de renderizado y reduce el tamaño del contenedor.
- Aplicaciones de escritorio y móviles con reconocimiento de voz local: los bindings de sherpa-onnx para Kotlin, Swift y C# permiten ejecutar la transcripción en el dispositivo sin enviar audio a la nube, útil por privacidad y por funcionamiento sin conexión.
- Atención al cliente con grabaciones de llamadas: la mejora en ruido de fondo (5,82 % de WER frente a 6,72 % del modelo base en 9 condiciones MUSAN) y en habla de negocios (5,79 % frente a 6,15 %) lo hacen adecuado para transcribir audio telefónico real antes de pasarlo a un sistema de análisis.
- Accesibilidad y documentación de audio: transcripción de podcasts, clases y actas con puntuación y mayúsculas listas para publicar, usando los ficheros INT8 para reducir requisitos de memoria en servidores modestos.
- Investigación en ASR multilingüe: al ser una exportación ONNX reproducible de un checkpoint público con licencia CC-BY-4.0, sirve como línea base para comparar cuantizaciones INT8 frente a FP32 o para evaluar el impacto del troceado VAD en la tasa de error.
- Procesamiento de archivos históricos o de archivo en varias lenguas europeas: el soporte de lenguas de bajos recursos como griego, letón, lituano, maltés y esloveno permite abordar corpus que otros modelos no cubren, aunque con mayor tasa de error.

## Benchmarks y rendimiento

Los datos proceden de la model card del modelo original (`moondream/parakeet-ultra`) y se midieron con el runtime Photon de Moondream sobre GPU NVIDIA, no con sherpa-onnx. Los resultados con esta exportación ONNX, especialmente con los ficheros INT8, pueden diferir ligeramente. WER en porcentaje, menor es mejor.

| Benchmark | parakeet-tdt-0.6b-v3 | parakeet-ultra |
|---|---|---|
| Open ASR Leaderboard, 7 conjuntos en inglés | 6,26 | 5,80 |
| FLEURS, 25 idiomas | 11,62 | 9,55 |
| Habla de negocios, estilo AA-WER | 6,15 | 5,79 |
| Ruido de fondo, 9 condiciones MUSAN | 6,72 | 5,82 |
| TED-LIUM 3, formato largo | 2,71 | 1,94 |

No se han publicado en la información disponible resultados de benchmarks medidos directamente con esta exportación ONNX ni con los ficheros INT8.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 0,6B parámetros, los ficheros FP32 ocupan aproximadamente 2,4 GB y los INT8 alrededor de 0,6 GB; el repo completo pesa 2,5 GB, lo que da una idea del orden de magnitud de memoria necesaria.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cualquier GPU con al menos 4 GB de memoria libre debería poder ejecutar la variante INT8; una RTX 4090, A100 o H100 ofrecen margen sobrado.
- GPU de consumo: sí, cabe en GPU de consumo; la variante INT8 debería ajustarse a tarjetas con 4-6 GB de VRAM. No se confirma compatibilidad con modelos concretos en la documentación.
- Opciones de despliegue: sherpa-onnx (Python, C++, C, C#, Kotlin, Swift, Java, Go, JavaScript) mediante `OfflineRecognizer.from_transducer` con `model_type="nemo_transducer"`, o la herramienta de línea de comandos `sherpa-onnx-offline`. Para audio largo, segmentación previa con Silero VAD de sherpa-onnx.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación TDT es no autorregresiva por bloques, lo que en el modelo original reduce la latencia, pero no se publican cifras para esta exportación.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER FLEURS (25 idiomas) | Licencia | Formato |
|---|---|---|---|---|---|
| rainboww51/parakeet-ultra-onnx (esta ficha) | 0,6B | 25 europeos | 9,55 (medido en el original, no en ONNX) | CC-BY-4.0 | ONNX + tokens.txt |
| moondream/parakeet-ultra | 0,6B | 25 europeos | 9,55 | CC-BY-4.0 | safetensors (runtime Photon) |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6B | 25 europeos | 11,62 | no disponible en la información | NeMo / safetensors |
| Whisper large-v3 | no disponible en la información | multilingüe amplio | no disponible en la información | MIT (según conocimiento general, no verificado aquí) | múltiples |

La comparación con Whisper large-v3 u otros sistemas ASR no puede cuantificarse con los datos disponibles: la información proporcionada solo incluye cifras frente a Parakeet TDT 0.6B v3. La ventaja diferencial de esta exportación frente al original es el formato ONNX y la compatibilidad con sherpa-onnx; la ventaja frente al modelo de NVIDIA es el mejor WER en todos los conjuntos reportados.

## Limitaciones y advertencias

- Solo ASR: no hace traducción, diarización ni identificación de idioma; usarlo para esas tareas está explícitamente fuera de alcance.
- La precisión varía mucho entre idiomas; griego, letón, lituano, maltés y esloveno son notablemente más difíciles que las lenguas con más recursos.
- El rendimiento se degrada con ruido intenso, acentos marcados, hablantes solapados y vocabulario específico de dominio.
- No debe usarse como única fuente en contextos de alto riesgo (médico, legal, accesibilidad crítica) sin revisión humana.
- El audio de entrada debe ser mono a 16 kHz; otras frecuencias o canales requieren preprocesado.
- Las grabaciones largas deben trocearse manualmente (por ejemplo con Silero VAD); esta exportación no incluye la segmentación automática del runtime Photon.
- Los resultados con los ficheros INT8 pueden diferir de los publicados, que se midieron en FP32 con el runtime de Moondream.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución a Moondream y a NVIDIA; conviene revisar también las condiciones del modelo base.
- La transcripción de voces reales puede estar sujeta a normativa de privacidad y consentimiento según la jurisdicción.
- Sesgos concretos no documentados en la información disponible; como todo sistema ASR, hereda los sesgos de sus datos de entrenamiento, que tampoco se detallan aquí.

## Enlaces

- Repositorio Hugging Face de esta exportación: https://huggingface.co/rainboww51/parakeet-ultra-onnx
- Modelo original de Moondream: https://huggingface.co/moondream/parakeet-ultra
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Blog de Moondream sobre Parakeet Redux y Ultra: https://moondream.ai/blog/introducing-parakeet-redux-and-ultra
- sherpa-onnx (repositorio): https://github.com/k2-fsa/sherpa-onnx
- Documentación de sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/index.html
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
