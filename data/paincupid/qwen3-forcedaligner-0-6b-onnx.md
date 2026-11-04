# paincupid/Qwen3-ForcedAligner-0.6B-ONNX

## Resumen

Qwen3-ForcedAligner-0.6B-ONNX es una distribución no modificada del grafo ONNX cuantizado a INT4 del modelo Qwen3-ForcedAligner-0.6B, publicado originalmente por Qwen y convertido a ONNX por el usuario valoomba. El repositorio lo mantiene paincupid como espejo local, fijado a la revisión `261c9ed100c1b18a4a1fbc488e05625dc9a4ae5c` del repositorio upstream, sin cambios de entrenamiento, cuantización ni arquitectura.

El modelo resuelve una tarea concreta: el alineamiento forzado (forced alignment) de audio con texto, es decir, asignar marcas temporales a unidades lingüísticas dentro de una transcripción dada. No es un modelo ASR: no transcribe audio, sino que, dado un audio de 16 kHz mono y una secuencia de tokens, produce logits sobre 5000 clases temporales con una resolución de 80 ms. La arquitectura se etiqueta como `qwen3_asr` y el grafo consume características de entrada de 128 bins compatibles con el frontend de Whisper.

Su relevancia práctica radica en que empaqueta todo el grafo en un único fichero ONNX autocontenido de aproximadamente 1,05 GB, sin sidecars de tensores externos, lo que facilita el despliegue con ONNX Runtime en entornos locales. Es una pieza de infraestructura para pipelines de subtitulado, anotación fonética o sincronización, no un servicio de transcripción alojado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer etiquetado como `qwen3_asr`; grafo ONNX con entradas `input_ids`, `input_features` (128 bins tipo Whisper), `attention_mask` y `feature_attention_mask` |
| Parametros totales | 0,6B (según el nombre del modelo; no se detalla el desglose en la información disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (grafo Q4); no se documentan otros formatos |
| Idiomas soportados | no disponible (el alineamiento depende del tokenizador y del texto de entrada que aporte el host) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_q4.onnx`, 1.048.397.349 bytes); tokenizer en `tokenizer.json` (11.429.733 bytes) |

## Arquitectura y entrenamiento

El repositorio no contiene entrenamiento propio ni modificaciones: es un espejo byte a byte del grafo ONNX Q4 y del tokenizador publicados por valoomba a partir del modelo original de Qwen. La arquitectura subyacente es un transformer con codificación de audio en características de 128 bins (compatibles con el frontend de Whisper) y una cabeza de salida que proyecta sobre 5000 clases de timestamp a resolución de 80 ms. El grafo es autocontenido: no requiere ficheros de tensores externos.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. La cuantización a INT4 la realizó el autor de la conversión upstream, no este espejo. El repositorio incluye `provenance.json` con la revisión upstream fijada y hashes SHA-256 de los ficheros para verificación de integridad.

## Capacidades

- Alineamiento forzado de audio con texto: asigna marcas temporales a los tokens de una transcripción dada, con resolución de 80 ms.
- Procesamiento de audio a 16 kHz mono con extracción de características de 128 bins.
- Salida de logits sobre 5000 clases temporales, que el host debe decodificar y validar.
- Ejecución local mediante ONNX Runtime, sin dependencia de servicios externos.
- No realiza transcripción ASR: requiere que el texto de entrada lo aporte el sistema anfitrión.
- El host debe aportar tokenizador, frontend de audio, segmentación y comprobaciones de calidad temporal.
- Soporte de tool calling, agentes, visión, audio generativo o modo thinking: no disponible / no aplica.

## Casos de uso

- Subtitulado sincronizado: dado un audio y su transcripción, el modelo permite obtener los tiempos por token para generar subtítulos con marcas precisas a 80 ms, integrándose en un pipeline que aporte el texto y el frontend de audio.
- Anotación fonética y lingüística: alinear corpus de audio con transcripciones ortográficas o fonéticas para construir datasets de investigación con tiempos por unidad.
- Sincronización de locuciones en doblaje: verificar y ajustar los tiempos de cada segmento respecto al audio original en flujos de postproducción.
- Control de calidad de transcripciones ASR: comparar los tiempos alineados con los generados por un sistema ASR para detectar desviaciones o segmentos mal transcritos.
- Búsqueda y navegación en archivos de audio: generar índices temporales por palabra para permitir búsquedas que salten al instante exacto de una intervención.
- Despliegue en dispositivo local: al ser un grafo ONNX autocontenido de ~1 GB, puede ejecutarse con ONNX Runtime en estaciones de trabajo o servidores sin GPU dedicada, siempre que se valide el rendimiento y la memoria en el hardware objetivo.
- Investigación en alineamiento: servir como referencia reproducible gracias a los hashes publicados y a la revisión upstream fijada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de precisión temporal, latencia ni throughput; el autor recomienda validar el rendimiento y el consumo de memoria en el dispositivo objetivo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el grafo pesa ~1,05 GB en INT4, por lo que la huella en memoria dependerá del runtime y de los buffers intermedios, que deben medirse en el hardware objetivo.
- GPU recomendadas: no disponible; al ser un grafo ONNX, puede ejecutarse tanto en CPU como en GPU compatibles con ONNX Runtime.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño del fichero sugiere que es viable en GPUs de consumo con suficiente memoria, pero no hay datos publicados de consumo real.
- Opciones de despliegue: ONNX Runtime (el repositorio está pensado para descargas locales de ONNX Runtime). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ForcedAligner-0.6B-ONNX (este) | 0,6B | no disponible | Alineamiento forzado | Apache-2.0 | ONNX INT4 |
| valoomba/Qwen3-ForcedAligner-0.6B-ONNX (upstream) | 0,6B | no disponible | Alineamiento forzado | Apache-2.0 | ONNX |
| Qwen/Qwen3-ForcedAligner-0.6B (original) | 0,6B | no disponible | Alineamiento forzado | Apache-2.0 | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo ASR ni un servicio de transcripción: sin un texto de entrada y un frontend de audio aportados por el host, no produce resultados útiles.
- El host debe implementar tokenizador, extracción de características de 128 bins, segmentación y comprobaciones de calidad temporal; el grafo no lo hace por sí solo.
- La cuantización INT4 puede degradar la precisión del alineamiento respecto al modelo original; no se han publicado métricas que lo cuantifiquen.
- Los hashes publicados describen los bytes upstream; conviene validarlos y medir rendimiento y memoria en el dispositivo objetivo antes de producción.
- No se documentan sesgos, cobertura idiomática ni robustez ante ruido, acentos o solapamientos de habla.
- Riesgo de alucinación de marcas temporales en segmentos ambiguos o con audio degradado: no hay datos publicados al respecto.
- Licencia Apache-2.0, que permite uso comercial; se debe conservar el aviso de licencia incluido en el repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es un espejo reciente sin validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/paincupid/Qwen3-ForcedAligner-0.6B-ONNX
- Repositorio upstream ONNX: https://huggingface.co/valoomba/Qwen3-ForcedAligner-0.6B-ONNX
- Modelo original: https://modelscope.cn/models/Qwen/Qwen3-ForcedAligner-0.6B
