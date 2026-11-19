# litert-community/MediaPipe-DecisionMaker-GLiNER2.5-Decide

## Resumen

MediaPipe Decision Maker — GLiNER2.5-Decide es un paquete de modelos `.task` para la tarea Decision Maker de MediaPipe, derivado del modelo `fastino/GLiNER2.5-Decide`. Lo publica la comunidad `litert-community` y está pensado para ejecutar clasificación zero-shot de texto directamente en dispositivo (Android, iOS, web, Python y Flutter) sin depender de un servidor. Se distribuye en dos variantes según la ventana de contexto: `gliner_s256.task` (981,2 MB) y `gliner_s512.task` (1,08 GB).

El modelo subyacente es un cross-encoder bidireccional basado en un encoder DeBERTa-v3-large con pesos en FP16. La tarea Decision Maker permite plantear hasta 32 etiquetas (marcadores `[L]`) y obtener, en una sola pasada de cross-attention, la probabilidad de que el texto de entrada corresponda a cada una de ellas. Esto lo convierte en una alternativa práctica a los clasificadores zero-shot tradicionales cuando la inferencia debe ocurrir localmente y con baja latencia.

Es relevante porque empaqueta un encoder grande (DeBERTa-v3-large) en formato LiteRT/TFLite optimizado para MediaPipe, con tokenizador y embeddings empaquetados en el propio `.task`, lo que simplifica el despliegue en aplicaciones móviles y web. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder bidireccional basado en encoder DeBERTa-v3-large |
| Parametros totales | no disponible (encoder DeBERTa-v3-large; repo de 2,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (`gliner_s256.task`) o 512 tokens (`gliner_s512.task`) |
| Tipos de cuantizacion | Pesos FP16 (`wfp16`); tensores de entrada/salida en float32 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | `.task` (MediaPipe bundle con `model.tflite`, `tokenizer.json` y `token_embeddings_fp16.bin`) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder bidireccional construido sobre un encoder DeBERTa-v3-large. A diferencia de los enfoques bi-encoder que codifican texto y etiquetas por separado, aquí el texto de entrada y hasta 32 marcadores de etiqueta (`[L]`) se procesan conjuntamente en una única pasada de cross-attention, lo que permite modelar la interacción entre la consulta y cada etiqueta candidata. La salida es un tensor `[1, 1, 1, 32]` con las puntuaciones por etiqueta.

Los pesos se han convertido a FP16 (`wfp16`) desde `fastino/GLiNER2.5-Decide`, y el paquete se genera a partir de `litert-community/GLiNER2.5-Decide-LiteRT`. El bundle `.task` incluye el submodelo `model.tflite`, el `tokenizer.json` y un fichero `token_embeddings_fp16.bin`. La entrada del submodelo `model.tflite` es de forma `[1, 256, 1024]` (o `[1, 512, 1024]` en la variante de 512), junto con máscaras y los marcadores de etiqueta. No se detallan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset) ni si hubo RLHF/DPO.

## Capacidades

- Clasificación zero-shot de texto mediante etiquetas definidas en tiempo de inferencia (hasta 32 marcadores `[L]`).
- Evaluación conjunta de contexto y etiquetas en una sola pasada de cross-attention.
- Soporte de `normalize_prior` para normalizar las probabilidades entre etiquetas.
- Inferencia en dispositivo en Android, iOS, web (JavaScript), Python y Flutter a través de MediaPipe Tasks.
- Salida de probabilidades por etiqueta (`res.probabilities`) y clave seleccionada (`res.selected_key`).
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar un mensaje entrante entre categorías como `refund_request` o `technical_support` usando `DecisionMaker.evaluate_choice`, tal como muestra el ejemplo de la model card.
- Moderación de contenido en el cliente: etiquetar textos de usuario en una app móvil antes de enviarlos al servidor, aprovechando la inferencia on-device.
- Clasificación de intenciones en asistentes de voz o chatbots embebidos: determinar la intención del usuario entre un conjunto fijo de hasta 32 etiquetas con latencia local.
- Triaje de correos o mensajes en aplicaciones de productividad: asignar etiquetas como `urgent`, `newsletter` o `personal` sin salir del dispositivo.
- Filtrado previo en pipelines de datos: preclasificar grandes volúmenes de texto en web o Python antes de un procesamiento más costoso.
- Detección de temas en contenido generado por usuarios en redes o foros, con la ventana de 512 tokens para entradas más largas.
- Clasificación de reseñas de producto por aspecto (calidad, envío, atención), usando etiquetas definidas dinámicamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el bundle ocupa 981,2 MB (`s256`) o 1,08 GB (`s512`); el submodelo `model.tflite` descomprimido ocupa 710,7 MB y 811,4 MB respectivamente, más 262,2 MB de embeddings FP16.
- GPU recomendadas: no se especifican; el modelo está orientado a CPU/NPU móvil mediante LiteRT y MediaPipe.
- Cabe en GPU de consumo: sí, por tamaño; pero el objetivo es inferencia on-device en móvil, web y edge.
- Opciones de despliegue: MediaPipe Tasks (Python, Web/JavaScript, Android Kotlin/Java, iOS Swift, Flutter Dart); LiteRT/TFLite.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe-DecisionMaker-GLiNER2.5-Decide | DeBERTa-v3-large (no detallado) | 256 / 512 tokens | Clasificación zero-shot on-device | apache-2.0 | Hugging Face (litert-community) |
| fastino/GLiNER2.5-Decide (modelo base) | DeBERTa-v3-large | no disponible | Clasificación zero-shot | no disponible en esta ficha | Hugging Face |
| litert-community/GLiNER2.5-Decide-LiteRT | DeBERTa-v3-large | no disponible | Clasificación zero-shot en LiteRT | no disponible en esta ficha | Hugging Face |
| Clasificadores zero-shot genéricos (p. ej. basados en NLI) | variable | variable | Clasificación zero-shot | variable | variable |

## Limitaciones y advertencias

- Solo soporta inglés según la model card; el rendimiento en otros idiomas no está garantizado.
- Ventana de contexto limitada a 256 o 512 tokens; textos más largos deben truncarse o dividirse.
- Máximo de 32 etiquetas por consulta.
- Es un clasificador, no un modelo generativo: no produce texto libre ni razona de forma multi-paso.
- Riesgo de sesgos y alucinación de etiquetas heredado del modelo base; no se documentan evaluaciones de sesgo en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar el fichero `NOTICE` por atribuciones de componentes.
- El rendimiento real depende del backend LiteRT y del hardware; no se publican cifras de latencia ni precisión.
- La fecha de creación indicada (2026-11-18) y el contador de descargas (0) sugieren un modelo muy reciente o de baja adopción; verificar estabilidad antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-DecisionMaker-GLiNER2.5-Decide
- Modelo base: https://huggingface.co/fastino/GLiNER2.5-Decide
- Conversión LiteRT: https://huggingface.co/litert-community/GLiNER2.5-Decide-LiteRT
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/decision/decision_maker
- Documentación Decision Maker: https://developers.google.com/edge/mediapipe/solutions/decision/decision_maker
- Setup Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Setup Web/JavaScript: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Setup Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Setup iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Setup Flutter: https://developers.google.com/edge/mediapipe/solut (enlace truncado en la información disponible)
- Paper referenciado: arXiv:2507.18546
