# kenrunio/transcriber-punctuation-onnx

## Resumen

`kenrunio/transcriber-punctuation-onnx` es una conversión a formato ONNX del modelo `oliverguhr/fullstop-punctuation-multilang-large`, un clasificador de tokens que predice la puntuación que sigue a cada palabra en textos sin puntuar. Lo publica el desarrollador de Transcriber (kenrunio) para que su aplicación pueda restaurar puntos, comas y signos de interrogación en la salida de sistemas de reconocimiento de voz sin necesidad de PyTorch ni de la librería Transformers: basta con ONNX Runtime y `tokenizers`.

El modelo original lo entrenó Oliver Guhr (proyecto FullStop) sobre el corpus Europarl y cubre inglés, alemán, francés e italiano. Esta versión no altera los pesos: únicamente los exporta con `torch.onnx.export` (dynamo, opset 18, datos externos) y añade una variante cuantizada a int8 generada con `quantize_dynamic` de ONNX Runtime. El repositorio ocupa 2,8 GB e incluye los pesos en fp32 (2,2 GB), los pesos int8 (0,6 GB), el tokenizador y el mapa de etiquetas.

Su relevancia es práctica más que investigadora: resuelve el problema clásico de las transcripciones ASR que salen como un chorro de palabras sin mayúsculas ni puntuación, y lo hace con un artefacto ligero, desplegable en CPU, con licencia MIT y sin dependencias de frameworks de deep learning. No es un modelo generativo ni un LLM: es una herramienta de post-procesado determinista y acotada a seis etiquetas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (heredada del modelo base; detalles no disponibles en la información proporcionada) |
| Parámetros totales | No disponible (estimación ≈550 M a partir de los 2,2 GB en fp32) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens por ventana (truncado en el tokenizador); entradas más largas requieren troceado |
| Tipos de cuantización | int8 dinámica (`QInt8`, `per_channel=True`) y fp32 |
| Idiomas soportados | inglés (en), alemán (de), francés (fr), italiano (it) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 18); `model_int8.onnx` (0,6 GB), `model.onnx` + `model.onnx.data` (2,2 GB), más `tokenizer.json` y `labels.json` |

Detalles de la interfaz de inferencia:

| Elemento | Valor |
|---|---|
| Entradas | `ids` y `mask`, int64, forma (batch, tokens) |
| Salida | `logits`, float32, forma (batch, tokens, 6) |
| Etiquetas | `0` (ninguna), `.`, `,`, `?`, `-`, `:` |
| Regla de decodificación | Se toma la etiqueta del primer subtoken de cada palabra |
| Pipeline declarado | token-classification |
| Descargas / likes en HuggingFace | 0 / 0 |
| Tamaño del repositorio | 2,8 GB |

## Arquitectura y entrenamiento

El modelo es un clasificador de tokens sobre un encoder transformer: recibe una secuencia de subtokens y emite, para cada posición, una distribución sobre seis clases de puntuación. La predicción se hace por palabra (se usa el primer subtoken de cada una), de modo que la salida es una etiqueta por palabra que indica qué signo la sigue. No hay cabeza generativa, ni decodificación autoregresiva, ni modo de razonamiento. La información disponible no detalla la arquitectura exacta del modelo base (número de capas, dimensión oculta, tipo de tokenizador SentencePiece o BPE), solo que se trata de la variante "large" de la familia FullStop.

El entrenamiento original es de Oliver Guhr, sobre el corpus Europarl (debates parlamentarios europeos), lo que explica la cobertura de cuatro idiomas y el dominio parlamentario/formal del que proceden los datos. No consta en la información proporcionada que se haya aplicado RLHF, DPO ni ajuste por preferencias: es un modelo supervisado de etiquetado secuencial. La aportación técnica de esta ficha concreta es doble: (1) la exportación a ONNX con datos externos para separar los pesos del grafo, y (2) la cuantización dinámica per-channel a int8, que reduce el peso a 0,6 GB y, según el autor, acelera la inferencia "un tercio" respecto a la versión fp32.

Validación declarada por el autor: sobre las 10.768 palabras de una transcripción de 90 minutos, la versión ONNX en fp32 coincidió con el original de PyTorch en todas las palabras. Sobre 12.000 palabras de dos transcripciones de llamadas de resultados, la versión int8 coincidió con la fp32 en el 99 % de las palabras; de los 615 puntos y signos de interrogación del modelo completo, 599 cayeron en la misma posición, y la mayoría de las diferencias restantes fueron comas.

## Capacidades

- Predicción de puntuación por palabra con seis clases: ninguna, punto, coma, interrogación, guion y dos puntos.
- Restauración de puntuación en texto plano sin puntuar, típicamente salida de ASR en minúsculas y sin signos.
- Etiquetado por lotes (`batch`, `tokens`) con máscara de atención, apto para procesar varias ventanas en una sola llamada.
- Funcionamiento multilingüe en inglés, alemán, francés e italiano, incluyendo mezcla de idiomas dentro del mismo texto en la medida en que el modelo base lo soporte.
- Inferencia sin PyTorch ni Transformers: solo ONNX Runtime y la librería `tokenizers`.
- Ejecución en CPU, sin GPU, con la variante int8.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificación.
- No tiene modo "thinking", ni capacidades de visión, audio o multimodalidad.
- No genera texto libre: no puede usarse para resumir, traducir, responder preguntas ni escribir código.
- No realiza capitalización por sí mismo: solo emite signos; las mayúsculas deben aplicarse en la capa de aplicación (el README de Transcriber lo menciona como parte del post-procesado).
- No incluye marcas de énfasis, comillas, signos de exclamación ni segmentación en párrafos.

## Casos de uso

- Post-procesado de transcripciones ASR: tras un motor de reconocimiento de voz que devuelve texto sin puntuar, se trocea la salida en ventanas de hasta 512 tokens, se etiqueta cada palabra y se reconstruye el texto con puntos, comas e interrogaciones. Es el caso para el que se creó el artefacto y el que usa Transcriber.
- Generación de subtítulos SRT/VTT: la puntuación predicha sirve para segmentar en frases y decidir cortes de subtítulo más naturales, mejorando la legibilidad frente a cortes por longitud fija.
- Actas de reuniones y llamadas: sobre la transcripción de una llamada de resultados o una reunión, el modelo aporta la puntuación necesaria para que el texto sea legible y para que herramientas posteriores (resumen, extracción de acciones) trabajen sobre frases bien delimitadas.
- Preprocesado para pipelines de NLP: muchos componentes downstream (segmentadores de frases, parsers, modelos de búsqueda, sistemas de extracción) rinden mejor con puntuación; este modelo actúa como paso previo barato en CPU antes de esas etapas.
- Indexación y búsqueda sobre audio: al puntuar y segmentar por frases las transcripciones de una base de podcasts o vídeos, se pueden construir índices por frase con límites semánticos razonables, en lugar de bloques de longitud fija.
- Aplicaciones de escritorio y entornos sin GPU: al ser ONNX int8 de 0,6 GB y no requerir PyTorch, encaja en herramientas locales de dictado o toma de notas que deben funcionar offline en portátiles modestos.
- Procesamiento por lotes de archivos históricos: digitalización de transcripciones largas almacenadas sin puntuar, donde el coste por palabra en CPU es reducido y no se necesita GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8G u otros) en la información disponible. Los únicos datos de evaluación son comprobaciones de equivalencia entre formatos realizadas por el autor:

| Prueba | Conjunto | Resultado |
|---|---|---|
| ONNX fp32 frente a PyTorch original | 10.768 palabras (transcripción de 90 min) | 100 % de palabras con la misma etiqueta |
| ONNX int8 frente a ONNX fp32 | 12.000 palabras (2 transcripciones de llamadas de resultados) | 99 % de palabras con la misma etiqueta |
| Posición de puntos e interrogaciones (int8 frente a fp32) | Mismo conjunto de 12.000 palabras | 599 de 615 signos en la misma posición; la mayoría de las diferencias restantes fueron comas |
| Velocidad relativa int8 frente a fp32 | No especificado | "Un tercio más rápido" según el autor (sin cifras absolutas) |

No hay métricas de precisión, recall o F1 frente al corpus original, ni comparación con otros modelos de puntuación. La afirmación de aceleración del 33 % no viene acompañada de hardware, lote ni longitud de secuencia, por lo que no es reproducible con los datos aportados.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,6-1 GB para `model_int8.onnx` en FP32 de activaciones; unos 2,2-2,5 GB para `model.onnx` en fp32, incluyendo pesos y activaciones.
- Memoria en CPU: cabe holgadamente en RAM de sistema; en modo int8 el proceso completo puede mantenerse por debajo de 1-2 GB.
- GPU recomendadas: no requiere GPU. Cualquier GPU con 4 GB o más (GTX 1650, RTX 3050, RTX 4090, A100, H100) puede ejecutar la versión fp32, pero no aporta ventaja significativa frente a CPU para este tamaño y carga.
- ¿Cabe en GPU de consumo? Sí, en todas las GPU de consumo actuales, incluso en las de gama baja, y también en CPU sin acelerador.
- Opciones de despliegue: ONNX Runtime (CPU o con proveedores de ejecución CUDA/TensorRT/CoreML/DirectML), `tokenizers` para el preprocesado, e integración directa en Python, C++, C#, Java o Rust a través de la API de ONNX Runtime. No aplica vLLM, TGI, llama.cpp ni Ollama: no es un modelo generativo y no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles como cifras absolutas. La única referencia es la mejora relativa del 33 % de la variante int8. Con 512 tokens de entrada y una cabeza lineal de 6 clases, el coste dominante es el encoder; se espera procesamiento en milisegundos por ventana en CPU moderna, pero es una estimación, no un dato publicado.
- Recomendación práctica: usar `model_int8.onnx` salvo que se necesite reproducir exactamente la salida del modelo PyTorch original; en ese caso, usar la versión fp32, que sí coincide palabra por palabra.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Idiomas | Licencia | Inferencia | Notas |
|---|---|---|---|---|---|---|
| `kenrunio/transcriber-punctuation-onnx` | ONNX (fp32 e int8) | 2,2 GB fp32 / 0,6 GB int8 | en, de, fr, it | MIT | ONNX Runtime + tokenizers, sin PyTorch | Conversión del siguiente; añade cuantización int8 |
| `oliverguhr/fullstop-punctuation-multilang-large` | PyTorch (Transformers) | ≈2,2 GB (estimado) | en, de, fr, it | MIT | Requiere PyTorch y Transformers | Modelo original de Oliver Guhr, entrenado sobre Europarl; misma salida de 6 clases |
| Otros modelos de puntuación multilingües | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

La comparación relevante es únicamente con el modelo original: este repositorio no mejora la calidad de predicción, sino el coste de despliegue. No hay datos para comparar con alternativas de la misma categoría (por ejemplo, modelos de puntuación basados en XLM-R o en modelos multilingües más recientes) y no se han aportado métricas que permitan afirmar superioridad o inferioridad frente a ellos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no puede usarse para tareas generativas. Cualquier expectativa de razonamiento, código o matemáticas queda fuera de su alcance.
- Ventana máxima de 512 tokens por llamada. Textos más largos deben trocearse; un troceado sin solapamiento puede perder la puntuación en las fronteras de ventana.
- Solo cuatro idiomas (en, de, fr, it). No cubre castellano, portugués ni ninguna otra lengua, ni siquiera como degradación elegante garantizada.
- Dominio de entrenamiento parlamentario (Europarl): el rendimiento puede degradarse en registros muy distintos (jerga técnica, conversación informal, transcripciones con muletillas y falsos arranques).
- La salida se limita a seis etiquetas; no produce signos de exclamación, comillas, paréntesis ni puntos suspensivos, y no aplica mayúsculas por sí misma.
- La cuantización int8 introduce un 1 % de discrepancias por palabra y desplaza 16 de 615 puntos e interrogaciones en el conjunto de validación del autor; si la puntuación exacta es crítica, conviene usar fp32.
- Riesgo de alucinación en sentido estricto: no aplica (no genera contenido). El riesgo equivalente es la inserción de puntuación incorrecta, especialmente comas, que puede alterar la interpretación de una frase.
- Sesgos: no documentados en la información disponible. Al derivar de debates parlamentarios europeos, es previsible un sesgo hacia estructuras oracionales formales y hacia la distribución de puntuación de textos traducidos del Europarl.
- Licencia MIT, permite uso comercial y modificación, pero el README pide mantener el crédito a Oliver Guhr y conservar el LICENSE. El modelo base es del mismo autor y licencia; conviene verificar la licencia del modelo original antes de redistribuir.
- Validación comunitaria mínima: 0 descargas y 0 likes en el momento de la consulta, mantenido por un único desarrollador. No hay informes independientes de calidad ni auditoría del proceso de exportación.
- El repositorio incluye `model.onnx` y `model.onnx.data` como pareja: separarlos rompe la carga del modelo en fp32.
- No hay garantía de compatibilidad con versiones antiguas de ONNX Runtime: el grafo se exportó con opset 18 y modo dynamo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kenrunio/transcriber-punctuation-onnx
- Modelo base original: https://huggingface.co/oliverguhr/fullstop-punctuation-multilang-large
- Repositorio Transcriber: https://github.com/kenrunio/transcriber
- Script de exportación: https://github.com/kenrunio/transcriber/blob/main/tools/export_models.py
- Proyecto FullStop (Oliver Guhr): https://github.com/oliverguhr/fullstop-deep-punctuation-prediction

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre puntuación ASR; los resultados obtenidos eran contenido no relacionado y se han descartado. No se dispone de papers, blogs o demos adicionales verificables.
