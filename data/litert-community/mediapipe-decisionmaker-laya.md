# litert-community/MediaPipe-DecisionMaker-Laya

## Resumen

MediaPipe DecisionMaker Laya es un paquete de modelos `.task` para la tarea Decision Maker de MediaPipe, construido sobre el encoder multilingüe Laya (`mmBERT-base`, 149M parámetros) de convaiinnovations. No es un modelo generativo: es un cross-encoder bidireccional que evalúa opciones categóricas estructuradas, comprobaciones booleanas y rúbricas ordinales en un único pase forward sin decodificación. Se distribuye en dos variantes de longitud de contexto, 256 y 512 tokens, con pesos en FP16 y grafo TFLite optimizado para LiteRT.

El modelo resuelve el problema de la clasificación zero-shot en dispositivo: en lugar de generar texto para decidir, puntúa directamente cada opción contra un contexto dado. En su interior, hasta aproximadamente 8 opciones compactas caben junto al contexto en un único pase de cross-attention, lo que el autor estima unas 4 veces más rápido que la evaluación por pares; conjuntos de opciones mayores recurren a evaluación multi-pase.

Es relevante ahora porque permite integrar enrutado y toma de decisiones semántica en aplicaciones Android, iOS, web, Python y Flutter sin conexión a servidores, con pesos Apache-2.0 y un tamaño de bundle de unos 678-679 MB por variante. El upstream declara soporte de más de 100 idiomas, aunque en este paquete solo se validan inglés y japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder bidireccional (encoder `mmBERT-base`) con cross-attention sobre opciones; grafo TFLite para LiteRT |
| Parametros totales | 149M (modelo base `mmBERT-base`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (`laya_s256.task`) y 512 tokens (`laya_s512.task`) |
| Tipos de cuantizacion | Pesos en FP16 (`wfp16`); embeddings en `token_embeddings_fp16.bin`; tensores de E/S en float32 |
| Idiomas soportados | Inglés y japonés validados en este paquete; upstream declara más de 100 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | Bundles `.task` (MediaPipe) con `model.tflite`, `tokenizer.json`, `calibration.json` y `token_embeddings_fp16.bin` |

## Arquitectura y entrenamiento

El modelo parte de `convaiinnovations/laya`, un encoder `mmBERT-base` de 149M parámetros. La variante empaquetada aquí es un cross-encoder: recibe las embeddings de entrada (`[1, 256, 768]` o `[1, 512, 768]`), una máscara de atención y un one-hot de tipo de pregunta (`qtype_onehot`, `[1, 3]`), y produce logits por token (`token_logits_output`) más una representación pooled del CLS (`pooled_cls_output`, `[1, 768]`). La evaluación de opciones se realiza mediante cross-attention en un único pase forward, sin generación autoregresiva.

El paquete incluye dos sub-modelos TFLite de 250,89 MB (256 tokens) y 251,81 MB (512 tokens), más un fichero de embeddings FP16 de 393,22 MB compartido y un `tokenizer.json` de 34,36 MB. Los pesos se han convertido a FP16 y el bundle incorpora un `calibration.json` para el pipeline de conversión. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; el modelo base es un encoder, por lo que el ajuste relevante es de tipo clasificación, no de alineamiento generativo.

La innovación principal es el modo de decisión sin decodificación: en lugar de generar una respuesta y parsearla, el modelo puntúa directamente las opciones contra el contexto. Hasta unas 8 opciones compactas caben en un solo pase; por encima de ese umbral se realiza evaluación multi-pase.

## Capacidades

- Clasificación zero-shot de opciones categóricas: dado un contexto y un conjunto de claves con descripciones, devuelve la clave seleccionada y las probabilidades.
- Comprobaciones booleanas: evaluación de condiciones sí/no sobre un texto.
- Rúbricas ordinales: puntuación de opciones ordenadas mediante el tipo de pregunta correspondiente.
- Evaluación en un solo pase forward sin decodificación, con cross-attention sobre hasta aproximadamente 8 opciones.
- Fallback a evaluación multi-pase para conjuntos de opciones mayores.
- Soporte multilingüe: inglés y japonés validados en este paquete; el upstream declara más de 100 idiomas.
- Despliegue en dispositivo en Android, iOS, web, Python y Flutter mediante MediaPipe Tasks.
- No soporta tool calling, function calling, agentes multi-paso ni generación de texto: es un clasificador, no un modelo generativo.

## Casos de uso

- Enrutado de tickets de soporte: clasificar un mensaje entrante en categorías como reembolso, ayuda técnica o facturación usando `ChoiceQuestion` con descripciones por clave, sin llamada a servidor y con latencia de un único pase forward.
- Moderación y filtrado en dispositivo: aplicar comprobaciones booleanas sobre texto de usuario antes de enviarlo a un backend, reduciendo tráfico y exposición de datos.
- Asistentes de voz o chat en apps móviles: decidir la intención del usuario entre un conjunto acotado de acciones y disparar el flujo correspondiente en la app.
- Formularios inteligentes: inferir la categoría o el campo correcto a partir de texto libre introducido por el usuario, con normalización de prior (`normalize_prior=True`).
- Evaluación de calidad ordinal: puntuar respuestas o contenidos según una rúbrica ordenada (por ejemplo, relevancia baja/media/alta) en pipelines de anotación.
- Clasificación multilingüe en el borde: procesar texto en inglés y japonés en apps Flutter o web sin depender de conectividad, útil en entornos con red intermitente.
- Prefiltrado en pipelines RAG: decidir en dispositivo si una consulta requiere recuperación documental antes de invocar un modelo mayor en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente indica que la evaluación de hasta unas 8 opciones en un solo pase es aproximadamente 4 veces más rápida que la evaluación por pares, sin cifras absolutas de latencia ni de precisión.

## Requisitos de hardware

- Tamaño del bundle: 678,48 MB (`laya_s256.task`) y 679,40 MB (`laya_s512.task`); el sub-modelo TFLite ocupa unos 251 MB y los embeddings FP16 unos 393 MB.
- Al estar diseñado para LiteRT y MediaPipe, el despliegue objetivo es en dispositivo (CPU/GPU/NPU móviles, navegador y equipos de escritorio), no en servidores con GPU de datacenter.
- VRAM estimada para inferencia en GPU de escritorio: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; el paquete está orientado a aceleradores móviles y web, no a A100, H100 o RTX 4090.
- Despliegue: MediaPipe Tasks (`mp.tasks.decision.DecisionMaker`) en Python, Android, iOS, web y Flutter; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponible; solo se indica la ventaja relativa de aproximadamente 4x frente a la evaluación por pares.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| MediaPipe DecisionMaker Laya (este) | 149M | 256 / 512 tokens | Clasificación zero-shot en dispositivo | Apache-2.0 | `.task` / TFLite |
| convaiinnovations/laya (upstream) | 149M | No disponible | Encoder multilingüe base | No disponible en la información | Safetensors (presumible, no confirmado) |
| litert-community/Laya-Multilingual-LiteRT | 149M | No disponible | Encoder LiteRT multilingüe | No disponible en la información | LiteRT |

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoría (cross-encoders de decisión en dispositivo) en la información proporcionada, por lo que no es posible comparar rendimiento numérico.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni razonamiento multi-paso; solo puntúa opciones predefinidas.
- El rendimiento óptimo se da con hasta aproximadamente 8 opciones; conjuntos mayores activan evaluación multi-pase con mayor coste.
- Idiomas validados limitados a inglés y japonés en este paquete, pese al soporte multilingüe declarado del upstream; el comportamiento en otros idiomas no está verificado.
- Contexto máximo de 256 o 512 tokens según la variante; textos más largos requieren truncado o segmentación.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas o sobreconfiadas cuando el contexto es ambiguo o las descripciones de las opciones se solapan.
- Sesgos heredados del corpus de entrenamiento del modelo base `mmBERT-base`; no se documentan evaluaciones de sesgo en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar `NOTICE` para las atribuciones de componentes de terceros.
- El tamaño del bundle (unos 679 MB) puede ser elevado para aplicaciones móviles con restricciones de descarga; considerar la variante de 256 tokens frente a la de 512 según necesidad.
- No se documentan métricas de precisión ni de calibración; validar en el dominio concreto antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-DecisionMaker-Laya
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Variante LiteRT multilingüe: https://huggingface.co/litert-community/Laya-Multilingual-LiteRT
- Documentación de Decision Maker: https://developers.google.com/edge/mediapipe/solutions/decision/decision_maker
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/decision/decision_maker
- Fichero `laya_s256.task`: https://huggingface.co/litert-community/MediaPipe-DecisionMaker-Laya/blob/main/laya_s256.task
- Fichero `laya_s512.task`: https://huggingface.co/litert-community/MediaPipe-DecisionMaker-Laya/blob/main/laya_s512.task
