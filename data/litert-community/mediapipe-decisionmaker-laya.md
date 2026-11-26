# litert-community/MediaPipe-DecisionMaker-Laya

## Resumen

MediaPipe DecisionMaker Laya es un paquete de modelos empaquetados en formato `.task` para la tarea DecisionMaker de MediaPipe, distribuido por la comunidad litert-community. Se construye a partir de `convaiinnovations/laya`, un encoder bidireccional `mmBERT-base` de 149 millones de parametros, y se ofrece en dos variantes de longitud de contexto: `laya_s256.task` (256 tokens) y `laya_s512.task` (512 tokens). Su proposito no es generar texto, sino evaluar decisiones estructuradas —elecciones categoricas, comprobaciones booleanas y rubricas ordinales— en un unico paso forward sin decodificacion autoregresiva.

La relevancia del modelo radica en su enfoque de despliegue: esta pensado para inferencia on-device en Android, iOS, web, Python y Flutter mediante MediaPipe Tasks y LiteRT (TFLite). Al tratarse de un cross-encoder que evalua opciones contra un contexto en una sola pasada de atencion cruzada, evita el coste de generar tokens y permite clasificar hasta aproximadamente 8 opciones compactas por pasada, unas 4 veces mas rapido que la evaluacion por pares. Con pesos en FP16 y un tamano de bundle de unos 678-679 MB, se posiciona como una alternativa practica para logica de decision local en aplicaciones moviles y web.

El modelo se publica bajo licencia Apache-2.0 y declara soporte para ingles y japones (validados), aunque el encoder base mmBERT soporta mas de 100 idiomas upstream. Es, por tanto, una pieza de infraestructura para enrutado, clasificacion zero-shot y control de flujo en agentes, mas que un modelo conversacional generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (mmBERT-base) empaquetado como cross-encoder TFLite para MediaPipe DecisionMaker |
| Parametros totales | 149 M (mmBERT-base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (`laya_s256.task`) o 512 tokens (`laya_s512.task`) |
| Tipos de cuantizacion | Pesos FP16 (`wfp16`); `model.tflite` con entradas/salidas float32 y `token_embeddings_fp16.bin` |
| Idiomas soportados | Ingles y japones validados; encoder base con soporte upstream de mas de 100 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | `.task` (MediaPipe bundle: `model.tflite`, `tokenizer.json`, `calibration.json`, `token_embeddings_fp16.bin`) |

## Arquitectura y entrenamiento

El modelo parte de `convaiinnovations/laya`, un encoder `mmBERT-base` de 149 millones de parametros con atencion bidireccional completa. Sobre esa base, litert-community ha empaquetado dos grafos TFLite con pesos FP16 y longitudes de secuencia fijas de 256 y 512 tokens. El sub-modelo `model.tflite` recibe `inputs_embeds` de forma `[1, 256, 768]` o `[1, 512, 768]`, una `attention_mask`, y un vector one-hot `qtype_onehot` de dimension 3 que codifica el tipo de consulta (categorica, booleana u ordinal). Devuelve `token_logits_output` y un `pooled_cls_output` de 768 dimensiones.

La innovacion principal es el modo de inferencia: DecisionMaker evalua las opciones contra el contexto en una unica pasada de atencion cruzada, sin decodificacion autoregresiva. Esto permite encajar hasta aproximadamente 8 opciones compactas junto al contexto en un solo forward; conjuntos de opciones mayores recurren a evaluacion multipasada. El bundle incluye `calibration.json` (9,2 KB) para el ajuste de calibracion y un fichero separado de embeddings de tokens en FP16 (393,22 MB). No se han publicado en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Clasificacion de texto zero-shot mediante evaluacion de opciones candidatas contra un contexto.
- Evaluacion de elecciones categoricas estructuradas (seleccion entre opciones discretas).
- Comprobaciones booleanas (verdadero/falso) sobre un contexto dado.
- Evaluacion de rubricas ordinales (puntuacion por niveles ordenados).
- Razonamiento de decision en un solo paso forward, sin generacion de texto.
- Soporte multilingue: ingles y japones validados; cobertura upstream de mas de 100 idiomas en el encoder base.
- Despliegue on-device en Android, iOS, web, Python y Flutter mediante MediaPipe Tasks.
- Integracion como componente de enrutado o control de flujo en pipelines y agentes.
- No soporta tool calling, function calling, agentes multi-step ni generacion de texto libre.

## Casos de uso

- Enrutado de intenciones en asistentes moviles: el modelo clasifica la consulta del usuario entre un conjunto de intenciones predefinidas en una sola pasada, con latencia baja y sin conexion, adecuado para apps Android o iOS que necesitan decidir a que modulo derivar la peticion.
- Moderacion de contenido local: comprobaciones booleanas sobre mensajes de usuario (por ejemplo, si un texto infringe una politica) ejecutadas on-device, lo que evita enviar contenido sensible a un servidor.
- Clasificacion de tickets de soporte: asignacion de categoria o prioridad a partir de una rubrica ordinal, aprovechando la ventana de 512 tokens para incluir el cuerpo del ticket y las definiciones de categoria.
- Control de flujo en agentes: uso como "decision maker" que elige la siguiente accion entre hasta 8 opciones compactas, sustituyendo llamadas a un LLM en pasos de enrutado simples y reduciendo coste y latencia.
- Filtrado y etiquetado en pipelines de datos: clasificacion por lotes de registros en Python con MediaPipe, aplicando rubricas para puntuar calidad o relevancia sin generacion autoregresiva.
- Aplicaciones web interactivas: demos y herramientas en navegador que necesitan clasificar entrada del usuario en tiempo real con el runtime web de MediaPipe, sin backend de inferencia.
- Soporte multilingue en japones e ingles: clasificacion de consultas en ambos idiomas validados para productos con audiencia en esos mercados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; los bundles pesan 678,48 MB (`laya_s256.task`) y 679,40 MB (`laya_s512.task`), con un `model.tflite` de 250,89 MB y 251,81 MB respectivamente y embeddings FP16 de 393,22 MB.
- GPU recomendadas: no disponible; el modelo esta disenado para inferencia on-device con LiteRT/MediaPipe, no para despliegue en GPU de centro de datos.
- Cabe en GPU consumer: no disponible como dato verificado; el enfoque previsto es CPU/NPU/GPU movil mediante MediaPipe Tasks.
- Opciones de despliegue: MediaPipe Tasks (`mp.tasks.decision.DecisionMaker`) en Android, iOS, web, Python y Flutter; LiteRT/TFLite como runtime subyacente.
- Latencia y throughput: no disponibles; la model card indica que una unica pasada de atencion cruzada es aproximadamente 4 veces mas rapida que la evaluacion por pares, sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| MediaPipe DecisionMaker Laya | 149 M | 256 / 512 tokens | `.task` (TFLite) | Apache-2.0 | Cross-encoder de decision on-device |
| `convaiinnovations/laya` | 149 M | no disponible | safetensors (upstream) | no disponible | Encoder mmBERT-base original |
| `litert-community/Laya-Multilingual-LiteRT` | 149 M | no disponible | LiteRT | no disponible | Encoder Laya empaquetado para LiteRT |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo puntuaciones de decision sobre opciones predefinidas.
- La ventana de contexto esta limitada a 256 o 512 tokens segun la variante; contextos mas largos requieren truncado o troceado.
- Solo ingles y japones estan validados, pese al soporte upstream de mas de 100 idiomas del encoder base; el rendimiento en otros idiomas no esta verificado.
- El limite practico de aproximadamente 8 opciones por pasada implica que conjuntos mayores degradan a evaluacion multipasada, con mayor coste.
- Riesgo de sesgo y alucinacion inherente al encoder base; no se documentan evaluaciones de sesgo en la informacion disponible.
- El modelo depende del runtime MediaPipe Tasks y del formato `.task`; no es directamente utilizable en frameworks como vLLM, TGI o llama.cpp.
- Licencia Apache-2.0 permite uso comercial, pero deben respetarse las atribuciones del fichero `NOTICE` y las licencias de los componentes upstream.
- No se documentan garantias de calibracion fuera de los datos de `calibration.json`; conviene validar umbrales en el dominio de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-DecisionMaker-Laya
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Encoder Laya empaquetado para LiteRT: https://huggingface.co/litert-community/Laya-Multilingual-LiteRT
- Documentacion de MediaPipe Decision Maker: https://developers.google.com/edge/mediapipe/solutions/decision/decision_maker
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/decision_maker/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/decision_maker/ios
- Notebook Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/decision_maker/python/decision_maker.ipynb
- Ejemplo web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/decision-maker.ts
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/decision/decision_maker
- Demo web en vivo: https://google-ai-edge.github.io/mediapipe-samples-web/#/decision/decision_maker
