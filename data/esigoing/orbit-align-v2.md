# esigoing/orbit-align-v2

## Resumen

Orbit-align-v2 es una conversión a ONNX con cuantización int8 del modelo omniASR CTC 300M v2 de Meta Platforms, publicado por el usuario esigoing bajo licencia Apache-2.0. No se trata de un modelo de reconocimiento de voz generalista, sino de un componente especializado en alineamiento forzado (forced alignment): dado un audio de 16 kHz y una transcripción conocida, sitúa cada palabra del texto sobre el segmento de sonido que la contiene. El pipeline declarado en Hugging Face es automatic-speech-recognition, pero el uso previsto por el autor es el alineamiento, no la transcripción libre.

El modelo parte de la arquitectura CTC de omniASR (300 millones de parámetros, versión 2) y se ha exportado a ONNX en fp32 para después aplicar cuantización dinámica de los pesos de las operaciones MatMul a int8 sin signo mediante ONNX Runtime. La salida es una matriz de logits de forma [1, frames, 10288] con un frame cada 20 ms, lo que permite resolver alineamientos con granularidad temporal de 20 ms. El repositorio ocupa 0,4 GB y no registra descargas ni likes en el momento de la consulta.

Su relevancia práctica está en el despliegue: al ser ONNX int8 y no requerir GPU dedicada, puede integrarse en pipelines de subtitulado, anotación fonética o evaluación de sistemas TTS en entornos con CPU. La información publicada es muy escasa (sin model card extensa, sin idiomas declarados y sin benchmarks), por lo que esta ficha se limita a lo verificable en los metadatos y en el README del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC sobre el modelo omniASR v2 (transformer, según el proyecto original de Meta); exportado a ONNX |
| Parametros totales | 300M (según el README) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; la entrada es `[1, samples]` a 16 kHz y la salida cubre un frame por cada 20 ms |
| Tipos de cuantizacion | int8 (cuantización dinámica de pesos MatMul, `QUInt8`); existe el export fp32 previo |
| Idiomas soportados | no disponible (el modelo original omniASR es multilingüe, pero el autor no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.int8.onnx`) + `tokens.txt` |
| Vocabulario de salida | 10 288 clases; `<s>` (id 0) es el token CTC blank |
| Entrada de audio | float32, 16 kHz mono, normalizada a media cero y varianza unitaria |
| Salida | logits `[1, frames, 10288]`, un frame cada 20 ms |
| Tamano del repositorio | 0,4 GB |
| Libreria | ONNX (ONNX Runtime) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo omniASR CTC 300M v2 de Meta, un modelo acústico con cabeza CTC entrenado para emitir distribuciones sobre un vocabulario de 10 288 tokens a partir de audio de 16 kHz. El autor no documenta el proceso de entrenamiento original (número de tokens, composición del dataset, uso de RLHF o ajuste fino); esa información correspondería al proyecto facebookresearch/omnilingual-asr y no se reproduce en esta ficha. Lo que sí está documentado es el proceso de conversión: exportación del checkpoint v2 a ONNX en fp32 y posterior cuantización dinámica con `quantize_dynamic(fp32, int8, weight_type=QuantType.QUInt8, op_types_to_quantize=["MatMul"])`, es decir, solo se cuantizan los pesos de las multiplicaciones matriciales, dejando activaciones y el resto de operadores en mayor precisión.

La innovación relevante para el uso previsto es el diseño de salida: al emitir un frame cada 20 ms con 10 288 clases, el modelo permite aplicar decodificación CTC restringida a una transcripción conocida (por ejemplo, mediante un grafo de alineamiento o programación dinámica sobre la matriz de logits) para obtener los límites temporales de cada palabra o token. El repositorio incluye `tokens.txt` con el mapeo `<token> <id>` y hashes SHA-256 de ambos ficheros, lo que facilita la verificación de integridad en producción. No se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Alineamiento forzado de transcripciones sobre audio: coloca cada palabra o token de un texto conocido en su intervalo temporal, con resolución de 20 ms.
- Reconocimiento de voz CTC: al ser un modelo CTC completo, puede emplearse también para decodificación libre, aunque el autor no lo presenta como su uso principal y no se han publicado evaluaciones de WER.
- Procesamiento de audio mono a 16 kHz con normalización explícita (media cero, varianza unitaria) como paso previo obligatorio.
- Salida de logits por frame compatible con decodificadores CTC externos (greedy, beam search o restricción a un léxico/transcripción).
- Ejecución en CPU mediante ONNX Runtime gracias a la cuantización int8 de pesos.
- No se documenta soporte de tool calling, agentes, visión, audio generativo ni modo de razonamiento extendido; no aplica a este tipo de modelo.

## Casos de uso

- Subtitulado y sincronización de transcripciones existentes: dado un texto ya revisado por un editor humano y su audio, el modelo calcula los tiempos de entrada y salida de cada palabra para generar subtítulos con precisión de 20 ms, sin depender de un ASR que pueda introducir errores en el texto.
- Anotación fonética y lingüística: en corpus de investigación se necesita alinear la transcripción ortográfica con la señal acústica para extraer duraciones de fonemas o palabras; el modelo proporciona la matriz de logits necesaria para ese alineamiento.
- Evaluación de sistemas TTS: para medir inteligibilidad o comparar audio sintético con una referencia textual, el alineamiento forzado permite verificar que cada palabra del texto aparece en el lugar esperado del audio generado.
- Control de calidad de doblaje y locución: alinear el guion con la pista de audio permite detectar omisiones, inserciones o desincronizaciones en una grabación antes de su publicación.
- Búsqueda y segmentación en archivos de audio con transcripción: indexar entrevistas o reuniones transcritas por palabra para permitir búsquedas que devuelvan el instante exacto de cada término.
- Preprocesado para entrenamiento de modelos de voz: generar etiquetas temporales a nivel de palabra para datasets de ASR o de conversión texto-a-voz, ejecutando la inferencia en CPU en lotes sin GPU.
- Integración en pipelines ligeros on-premise: al ser ONNX int8 y pesar 0,4 GB, puede desplegarse en servidores sin acelerador y procesar audio por lotes con ONNX Runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README no incluye métricas de WER, precisión de alineamiento, latencia ni throughput, y los metadatos de Hugging Face no aportan datos adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al ser un modelo de 300M parámetros cuantizado a int8, el peso de los ficheros ronda los 0,3-0,4 GB, por lo que la inferencia en CPU es viable y en GPU ocuparía una fracción pequeña de memoria.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 1-2 GB de memoria libre podría ejecutarlo, incluidas RTX 3060, RTX 4090, A100 o H100; no se han publicado medidas.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna, aunque no hay cifras publicadas que lo confirmen.
- Opciones de despliegue: ONNX Runtime (CPU o GPU) es la vía natural; también podría ejecutarse con otros runtimes compatibles con ONNX. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. La resolución temporal de salida es de 20 ms por frame, lo que condiciona la precisión del alineamiento, pero no se han publicado tiempos de ejecución.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Formato | Licencia | Uso principal |
|---|---|---|---|---|---|
| orbit-align-v2 (este modelo) | 300M | audio 16 kHz, frames de 20 ms | ONNX int8 | Apache-2.0 | Alineamiento forzado / CTC |
| omniASR CTC 300M v2 (original de Meta) | 300M | audio 16 kHz | PyTorch (checkpoint original) | Apache-2.0 | ASR y alineamiento |
| Whisper (variantes small/medium) | 244M / 769M | audio 16 kHz, ventanas de 30 s | PyTorch, ONNX, GGUF | MIT | ASR multilingüe con timestamps |
| wav2vec 2.0 (base/large) | 95M / 317M | audio 16 kHz | PyTorch | MIT / Apache-2.0 según variante | ASR y representaciones acústicas |

La comparación con Whisper y wav2vec 2.0 es orientativa: son modelos de ASR con capacidades de alineamiento o timestamps, pero no equivalentes funcionalmente a un CTC restringido a una transcripción conocida. No se dispone de datos de rendimiento comparativo para este modelo concreto.

## Limitaciones y advertencias

- Información muy escasa: no se declaran idiomas soportados, métricas de calidad ni detalles del entrenamiento original; cualquier uso en producción requiere una evaluación propia sobre el dominio objetivo.
- Riesgo de alineamiento incorrecto en audio con ruido, solapamiento de hablantes, música de fondo o transcripciones con errores; el modelo asume que la transcripción es correcta y la impone.
- La cuantización int8 solo afecta a los pesos MatMul; no se han publicado comparativas de precisión frente al export fp32, por lo que la degradación respecto al original es desconocida.
- Requiere preprocesado estricto (16 kHz mono, normalización a media cero y varianza unitaria); desviaciones en el muestreo o la normalización degradan la salida.
- El vocabulario de 10 288 tokens y el token blank en el id 0 deben respetarse al construir el decodificador; un mapeo incorrecto invalida el alineamiento.
- Licencia Apache-2.0 permite uso comercial, pero el autor remite a la licencia del modelo original de Meta; conviene conservar los avisos de atribución y verificar los términos del proyecto omnilingual-asr.
- Sin descargas ni validación comunitaria en el momento de la consulta: no hay evidencia pública de uso en producción ni informes de terceros.
- No apto para transcripción libre de alta calidad sin evaluación previa: el pipeline declarado es ASR, pero el autor no publica WER ni comparativas con modelos ASR generalistas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/esigoing/orbit-align-v2
- Proyecto original de Meta (omnilingual-asr): https://github.com/facebookresearch/omnilingual-asr
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- ONNX Runtime (cuantización dinámica): https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html
