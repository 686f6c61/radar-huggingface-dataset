# AmaLS367/multilingual-e5-small-Focused-CrossRecall

## Resumen

multilingual-e5-small-Focused-CrossRecall es un ajuste fino (LoRA, fusionado) del modelo de embeddings `intfloat/multilingual-e5-small`, desarrollado por el usuario AmaLS367. Su proposito es muy concreto: servir como motor de busqueda de memoria a largo plazo en un asistente personal autoalojado, mapeando mensajes de chat en ruso o ingles hacia temas de memoria escritos en ingles (titulo y nota corta). Se distribuye como modelo ONNX cuantizado en int8 de 118 MB, pensado como reemplazo directo del fichero `Xenova/multilingual-e5-small` `onnx/model_quantized.onnx`.

El modelo mantiene la arquitectura original XLM-R (12 capas, hidden 384), el mismo vocabulario y tokenizador SentencePiece, y las mismas entradas y salidas ONNX, por lo que puede sustituir al base sin cambios en el pipeline de inferencia. La innovacion principal es el entrenamiento con una perdida que combina InfoNCE multi-positivo, hinges alrededor de un umbral objetivo y una decision loss, con el fin de que un unico umbral de coseno fijo (aproximadamente 0,30) separe consultas relevantes de conversacion trivial, tareas y preguntas generales.

Es relevante para desarrolladores que construyen asistentes con memoria semantica y necesitan filtrar ruido conversacional sin reentrenar ni recalibrar umbrales, especialmente en escenarios bilingues ruso-ingles. No obstante, es un modelo de nicho, con cero descargas y cero likes en el momento de la ficha, y con limitaciones claras: no esta orientado a documentos largos ni a recuperacion ruso-ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder XLM-R (12 capas, hidden 384) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (truncado a 510 tokens de contenido mas tokens especiales) |
| Tipos de cuantizacion | int8 dinamica (ONNX Runtime `quantize_dynamic`, MatMul QInt8 per-channel, reduce_range; Gather uint8) |
| Idiomas soportados | ruso (ru), ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`), safetensors, adaptador LoRA en `lora/` |

## Arquitectura y entrenamiento

El modelo parte de `intfloat/multilingual-e5-small`, un encoder XLM-R de 12 capas y dimension oculta 384, y aplica un ajuste fino con LoRA (r16 / alpha32) sobre las proyecciones query, key, value y dense, manteniendo congelados los embeddings. El entrenamiento se hizo con AdamW a learning rate 2e-4 durante 4 epocas en una sola T4 (aproximadamente 19 minutos). Los datos son sinteticos, generados por Claude Haiku 5.5: 40 usuarios inventados por 42 temas de memoria en ingles (infraestructura, proyectos, preferencias, reglas, hechos, sobre el usuario y sobre el asistente), con 5 mensajes de usuario en ruso y 2 en ingles por tema, mas preguntas "dificiles" no relacionadas y unas 1.300 conversaciones triviales. No se uso datos reales de usuarios.

La perdida combina varias componentes: InfoNCE multi-positivo con temperatura 0,05, hinges cuadraticos alrededor de un umbral objetivo y una decision loss sobre todos los pares (relevante, no relacionado) del batch, con peso 3, ademas de InfoNCE in-batch sobre una mezcla general (SberQuAD y pares ru-ingles de TED talks de Tatoeba, excluyendo las frases de test). El batch agrupa dos usuarios por paso, con todos sus temas como candidatos, lo que genera negativos duros dentro del mismo usuario. La exportacion se realiza con `torch.onnx` (opset 14) seguida de cuantizacion dinamica de ONNX Runtime.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y recuperacion (retrieval) bilingue ruso-ingles.
- Mapeo de mensajes de chat cortos (ruso o ingles) a temas de memoria en ingles con titulo y nota.
- Discriminacion de conversacion trivial, tareas y preguntas generales mediante un umbral de coseno fijo (aproximadamente 0,30).
- Recuperacion cross-lingual: consulta en ruso contra pasajes en ingles y viceversa.
- Compatibilidad drop-in con el pipeline de `Xenova/multilingual-e5-small`: mismas entradas (`input_ids`, `attention_mask`, `token_type_ids`, int64) y salida `last_hidden_state [B, T, 384]`.
- Uso de prefijos `query: ` y `passage: `, mean pooling sobre la mascara de atencion y normalizacion L2.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento explicito; es exclusivamente un modelo de embeddings.

## Casos de uso

- Memoria a largo plazo de un asistente personal: el modelo indexa temas de memoria en ingles y recupera los relevantes ante mensajes del usuario en ruso o ingles, filtrando charla trivial con el umbral de 0,30, lo que evita inyectar contexto irrelevante en el prompt del LLM.
- Busqueda semantica bilingue en bases de conocimiento personales: permite consultar notas o hechos almacenados en ingles desde una interfaz en ruso, con una precision@1 de 0,917 en Tatoeba ru-ingles.
- Enrutado de consultas en sistemas de atencion al cliente: clasifica si un mensaje entrante corresponde a un tema conocido (facturacion, incidencias, configuracion) o es una pregunta general, usando la separacion por umbral en lugar de un clasificador adicional.
- Deduplicacion y agrupacion de mensajes de chat: agrupa mensajes por similitud coseno para detectar temas recurrentes o conversaciones solapadas en registros historicos.
- Filtrado de ruido en pipelines RAG: descarta recuperaciones con puntuacion inferior al umbral antes de pasarlas al generador, reduciendo falsos positivos (3 % en no relacionados segun la model card).
- Despliegue en entornos con CPU y recursos limitados: al ser un ONNX int8 de 118 MB, puede ejecutarse en servidores sin GPU o en dispositivos edge para busqueda semantica en tiempo real.
- Prototipado rapido de sistemas de memoria: al ser reemplazo directo del modelo base de Xenova, permite evaluar la mejora de recuperacion sin reescribir el codigo de inferencia.

## Benchmarks y rendimiento

Resultados sobre la memoria real del asistente desplegado (43 temas en ingles, 141 consultas de test; 87 con tema relevante, 40 no relacionadas, 12 "dificiles" no relacionadas), con ONNX int8 en CPU y el pipeline exacto de inferencia:

| Modelo | recall@1 | recall@5 | AUC relevante vs no relacionado | AUC vs dificiles | Falsos positivos en no relacionadas con recall@5 >= 0,9 |
|---|---|---|---|---|---|
| Xenova/multilingual-e5-small (int8) | 0,908 | 0,989 | 0,862 | 0,479 | 47 % |
| multilingual-e5-small-Focused-CrossRecall | 0,931 | 0,977 | 0,961 | 0,870 | 3 % |

Con umbral 0,30: recall@5 de 0,92, falsos positivos del 2,5 % en no relacionadas y del 42 % (5/12) en dificiles.

Conjunto sintetico de desarrollo (43 temas, 99 consultas, 68 cross-lingue; 40 no relacionadas, 12 dificiles):

| Modelo | recall@1 | recall@5 | AUC vs no relacionado | AUC vs dificiles |
|---|---|---|---|---|
| Base (int8) | 0,384 | 0,737 | 0,498 | 0,435 |
| Este modelo | 0,818 | 0,980 | 0,957 | 0,938 |

Resultados generales: Tatoeba ruso-ingles accuracy@1 (consulta ru hacia pasaje en) pasa de 0,901 a 0,917, y (consulta en hacia pasaje ru) de 0,799 a 0,915. En el subconjunto RuBQ (300 consultas, 3.465 documentos) el nDCG@10 baja de 0,896 a 0,867, es decir, la recuperacion ruso-ruso empeora ligeramente.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo ONNX int8 de 118 MB puede ejecutarse en CPU con ONNX Runtime (`CPUExecutionProvider`).
- GPU recomendadas: no disponibles en la informacion; al ser un modelo de 118 MB, cualquier GPU consumer moderna puede alojarlo, pero no se han publicado mediciones.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en entornos sin GPU.
- Opciones de despliegue: ONNX Runtime (probado con `CPUExecutionProvider`), con posibilidad de usar proveedores CUDA o TensorRT de ONNX Runtime; tambien puede cargarse el adaptador LoRA sobre el modelo base en PyTorch.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| multilingual-e5-small-Focused-CrossRecall | no disponible (XLM-R 12 capas, hidden 384) | 512 tokens | ru, en | MIT | ONNX int8, safetensors, LoRA | Ajustado para memoria de asistente y umbral fijo; recall@1 0,931 en memoria real |
| intfloat/multilingual-e5-small | no disponible (XLM-R 12 capas, hidden 384) | 512 tokens | multilingue | MIT | safetensors, ONNX | Modelo base generalista; recall@1 0,908 en memoria real y umbrales tipicos de 0,8+ |
| Xenova/multilingual-e5-small | no disponible (XLM-R 12 capas, hidden 384) | 512 tokens | multilingue | MIT | ONNX int8 | Version ONNX del base para transformers.js; referencia directa de sustitucion |

## Limitaciones y advertencias

- Ajustado para notas cortas en ingles y consultas cortas de chat; no esta orientado a documentos largos.
- La recuperacion ruso-ruso no fue objetivo del entrenamiento y empeora ligeramente (nDCG@10 de 0,896 a 0,867 en RuBQ).
- La escala de puntuaciones difiere del modelo base: los umbrales tipicos de 0,8 o superiores no aplican; debe usarse aproximadamente 0,30.
- Las preguntas dificiles no relacionadas sobre el tema exacto de un tema de memoria aun superan el umbral con frecuencia (42 %, 5/12).
- Las consultas de test de la memoria real se escribieron a partir de los titulos, lo que favorece el solapamiento lexico y puede inflar las metricas.
- Los datos de entrenamiento son sinteticos (generados por Claude Haiku 5.5) y no se uso datos reales de usuarios; pueden existir sesgos derivados del generador.
- Riesgo de alucinacion no aplica directamente al ser un modelo de embeddings, pero la similitud coseno puede producir recuperaciones espurias en dominios alejados del entrenamiento.
- Licencia MIT, que permite uso comercial, pero el modelo es de nicho y no ha sido validado por terceros (cero descargas y cero likes en el momento de la ficha).
- Solo soporta ruso e ingles de forma efectiva; el resto de idiomas del modelo base no fueron objetivos del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmaLS367/multilingual-e5-small-Focused-CrossRecall
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Version ONNX de referencia: https://huggingface.co/Xenova/multilingual-e5-small
