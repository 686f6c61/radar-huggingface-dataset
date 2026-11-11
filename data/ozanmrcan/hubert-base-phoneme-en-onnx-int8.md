# ozanmrcan/hubert-base-phoneme-en-onnx-int8

## Resumen

hubert-base-phoneme-en-onnx-int8 es una exportación a ONNX con cuantización dinámica int8 del modelo Peacockery/hubert-base-phoneme-en, un HuBERT-base ajustado con CTC para reconocimiento de fonemas del inglés en el alfabeto ARPAbet. Lo publica el desarrollador ozanmrcan como artefacto de despliegue, no como un modelo nuevo: no hay reentrenamiento ni ajuste adicional, solo conversión de formato y cuantización de pesos.

El problema que resuelve es el de llevar un reconocedor de fonemas a entornos con recursos muy limitados. El resultado es un único fichero `phoneme.onnx` de aproximadamente 120 MB que se ejecuta solo en CPU, incluido un dispositivo móvil mediante `onnxruntime-react-native`. El caso de uso declarado por el autor es la aplicación Lingubi, que puntúa la pronunciación de un niño frente a una palabra objetivo comparando la secuencia de fonemas detectada.

La relevancia es acotada pero clara: para cualquier pipeline que necesite transcripción fonética ligera (evaluación de pronunciación, alineamiento fonético, análisis de habla), este artefacto elimina la dependencia de PyTorch y de GPU. La contrapartida es que hereda todas las limitaciones del modelo base, está restringido al inglés y su licencia Apache-2.0 permite uso comercial sin fricción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HuBERT-base (transformer encoder) con cabeza CTC |
| Parametros totales | no disponible (el modelo base es HuBERT-base; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio variable `[1, n]`; el límite práctico lo fija la arquitectura HuBERT y el consumo de memoria) |
| Tipos de cuantizacion | int8 dinámica sobre pesos de operadores MatMul y Gemm (QInt8); resto de operadores en float32 |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), fichero único `phoneme.onnx` (~120 MB) |

## Arquitectura y entrenamiento

El modelo subyacente es HuBERT-base, un encoder transformer que aprende representaciones de audio mediante predicción de unidades discretas extraídas de clústeres de features MFCC, seguido de un ajuste supervisado con pérdida CTC sobre fonemas ARPAbet del inglés. La exportación añade una capa `log_softmax` sobre los logits y fija la salida como log-probabilidades, de modo que el consumidor recibe directamente `[1, frames, 43]` sin necesidad de aplicar softmax.

La conversión se realizó con `torch.onnx.export` en opset 17 y posteriormente `onnxruntime.quantization.quantize_dynamic` con `weight_type=QInt8` y `op_types_to_quantize=["MatMul", "Gemm"]`. No hubo entrenamiento, fine-tuning ni calibración adicional más allá de la cuantización dinámica. Un detalle relevante para la integración: el vocabulario declara 41 tokens, pero la salida tiene 43 columnas y las dos últimas nunca se entrenaron; el autor advierte explícitamente de que hay que leer la anchura de la salida en tiempo de ejecución en lugar de asumir 41. El token CTC blank es `[PAD]`, con id 40. La entrada es audio float32 `[1, n]` a 16 kHz mono, y es responsabilidad del llamante normalizarla a media cero y varianza unitaria.

## Capacidades

- Reconocimiento de fonemas del inglés en formato ARPAbet a partir de audio a 16 kHz.
- Salida CTC con log-probabilidades por frame, un frame cada 20 ms.
- Decodificación CTC greedy o con beam search (el fichero entrega log-probabilidades; el decodificador lo implementa el consumidor).
- Inferencia solo en CPU, sin dependencia de CUDA ni de PyTorch en tiempo de ejecución.
- Ejecución en dispositivos móviles mediante `onnxruntime-react-native`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No tiene capacidades de visión, audio generativo ni texto libre: es un modelo acústico-fonético puro.
- No es multilingüe; solo inglés.

## Casos de uso

- Evaluación de pronunciación infantil: la aplicación Lingubi compara la secuencia de fonemas detectada en el intento del niño con la secuencia esperada de la palabra objetivo y calcula una puntuación de ajuste. El modelo es adecuado porque entrega fonemas directamente, sin pasar por texto ortográfico.
- Tutor de idiomas en móvil sin conexión: al ejecutarse en CPU con un fichero de 120 MB, permite dar retroalimentación fonética en tiempo real en un teléfono sin enviar audio a un servidor, lo que reduce latencia y evita problemas de privacidad.
- Alineamiento fonético forzado: las log-probabilidades por frame cada 20 ms permiten construir alineamientos entre audio y transcripción fonética para herramientas de anotación lingüística o corpus de habla.
- Análisis de dialectos y acentos: extraer la distribución de fonemas producidos por distintos hablantes para estudios sociolingüísticos o para evaluar la cobertura de un sistema TTS.
- Preprocesado para pipelines de síntesis de voz: convertir audio de referencia en secuencias de fonemas que alimenten un modelo TTS o un sistema de conversión de voz.
- Detección de errores de articulación en logopedia: comparar la salida fonética de un paciente con la esperada para identificar sustituciones u omisiones sistemáticas de fonemas.
- Filtrado y búsqueda fonética en archivos de audio: indexar grabaciones por su contenido fonético para búsqueda por similitud de sonido en lugar de por texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas de precisión fonética (PER, phone error rate), latencia ni throughput, ni comparaciones con el modelo base en float32.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es exclusivamente en CPU.
- Memoria RAM estimada: el fichero pesa unos 120 MB y la cuantización dinámica mantiene parte de los operadores en float32, por lo que conviene reservar del orden de 300-500 MB de RAM para el runtime y los buffers de activaciones (estimación, no publicada por el autor).
- GPU: no necesaria ni soportada de forma nativa por este artefacto; el objetivo declarado es CPU.
- Cabe en cualquier dispositivo con CPU moderna, incluidos teléfonos móviles mediante `onnxruntime-react-native`.
- Despliegue: ONNX Runtime (Python, C++, JavaScript/React Native). No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, que no ejecutan modelos CTC de audio de este tipo.
- Latencia y throughput: no disponibles. Dependen del hardware y de la duración del audio; el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| ozanmrcan/hubert-base-phoneme-en-onnx-int8 | no disponible (HuBERT-base) | audio variable a 16 kHz | Fonemas EN (ARPAbet) | Apache-2.0 | ONNX int8 |
| Peacockery/hubert-base-phoneme-en | HuBERT-base | audio variable a 16 kHz | Fonemas EN (ARPAbet) | Apache-2.0 | PyTorch (safetensors/bin) |
| Wav2Vec2-base-960h | ~95 M | audio variable a 16 kHz | ASR inglés (texto) | Apache-2.0 | PyTorch, ONNX disponible en la comunidad |
| Whisper tiny / base | 39 M / 74 M | 30 s por ventana | ASR multilingüe (texto) | MIT | PyTorch, ONNX, GGML |

La diferencia clave frente a Wav2Vec2 y Whisper es la granularidad de salida: este modelo devuelve fonemas, no texto, lo que lo hace más adecuado para evaluación de pronunciación pero inútil para transcripción legible. Frente al modelo base en PyTorch, la versión ONNX int8 sacrifica algo de precisión numérica a cambio de portabilidad y de un tamaño manejable en móvil; el autor no cuantifica esa pérdida.

## Limitaciones y advertencias

- Solo inglés: no procesa otros idiomas y no se ha evaluado su comportamiento con acentos no nativos más allá del caso de uso infantil declarado.
- Hereda los sesgos del corpus de entrenamiento del modelo base (Peacockery/hubert-base-phoneme-en), sobre el que no se documenta la composición del dataset.
- La cuantización dinámica int8 introduce error numérico respecto al modelo float32; no se publica la degradación en tasa de error de fonemas.
- El vocabulario tiene 41 tokens pero la salida 43 columnas con dos columnas no entrenadas: un consumidor que asuma 41 columnas o que no lea la anchura en tiempo de ejecución obtendrá resultados incorrectos.
- El token CTC blank es `[PAD]` (id 40); ignorarlo rompe la decodificación.
- El llamante debe normalizar el audio a media cero y varianza unitaria y remuestrear a 16 kHz mono; el modelo no lo hace internamente.
- La licencia Apache-2.0 permite uso comercial, pero al ser una conversión de un modelo de terceros conviene conservar la atribución al modelo base.
- No hay garantía de mantenimiento: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y no se documenta soporte.
- No apto para transcripción de texto ni para tareas generativas; cualquier uso en ese sentido está fuera de su diseño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ozanmrcan/hubert-base-phoneme-en-onnx-int8
- Modelo base: https://huggingface.co/Peacockery/hubert-base-phoneme-en
- Documentación de ONNX Runtime: https://onnxruntime.ai/docs/
- Cuantización en ONNX Runtime: https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html
- Paper de HuBERT: https://arxiv.org/abs/2106.07447
- Repositorio de ONNX Runtime React Native: https://github.com/microsoft/onnxruntime
