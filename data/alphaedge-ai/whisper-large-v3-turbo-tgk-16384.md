# alphaedge-ai/whisper-large-v3-turbo-tgk-16384

## Resumen

`whisper-large-v3-turbo-tgk-16384` es una variante "trimmed" (podada) de `openai/whisper-large-v3-turbo`, publicada por el usuario `alphaedge-ai`. El modelo conserva la arquitectura encoder-decoder transformer original de Whisper, pero reduce el vocabulario de 51.865 a 16.384 tokens mediante la técnica de trimming descrita por Loïck Bourdois en el blog de Hugging Face. El resultado es un modelo de 763.461.120 parametros (un 5,61% menos que los 808.878.080 del original), con un footprint de repo de 1,5 GB en safetensors.

El objetivo declarado es optimizar el reconocimiento automatico del habla (ASR) para tayiko (`tg`), un idioma de bajos recursos. Al eliminar del vocabulario los tokens no utilizados en ese idioma, se reduce el tamaño del embedding y de la capa de salida, lo que disminuye la memoria necesaria para inferencia sin tocar el resto de los pesos. La contrapartida explicita es que el modelo deja de ser multilingue: los tokens eliminados ya no pueden generarse, por lo que el rendimiento en otros idiomas puede degradarse seriamente.

Es relevante ahora porque demuestra una via practica de adaptacion de modelos ASR grandes a idiomas minoritarios con presupuesto limitado, manteniendo la licencia Apache 2.0 del original y un pipeline compatible con `transformers`. El modelo esta alojado en la region EU y expone `endpoints_compatible`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper encoder-decoder transformer (seq2seq ASR) |
| Parametros totales | 763.461.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana nativa de Whisper); contexto textual limitado por el vocabulario podado |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors en el momento de la consulta) |
| Idiomas soportados | tayiko (`tg`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (via `transformers`) |

| Metrica adicional | Original | Trimmed |
|---|---|---|
| Tamano de vocabulario | 51.865 tokens | 16.384 tokens |
| Reduccion de vocabulario | — | 68,41% |
| Parametros | 808.878.080 | 763.461.120 |
| Reduccion de parametros | — | 5,61% |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-large-v3-turbo: un transformer encoder-decoder con atencion completa, entrenado originalmente por OpenAI con supervision debil a gran escala (paper arXiv:2212.04356). La variante "turbo" del original reduce el numero de capas del decoder respecto a large-v3, lo que explica su menor coste de inferencia. En esta version podada, el cambio estructural se limita a la matriz de embedding de entrada y a la proyeccion de salida del decoder, que pasan de 51.865 a 16.384 filas. El resto de los pesos se heredan del modelo base.

El proceso de trimming consistio en minar 200.000 textos del dataset `lbourdois/fineweb-2-trimming` para determinar que tokens del vocabulario original son realmente utilizados en tayiko, y conservar solo esos mas los tokens especiales de Whisper (idioma, task, timestamps). No se realizo un reentrenamiento completo ni fine-tuning adicional segun la informacion disponible; el modelo es una poda del vocabulario sobre pesos ya entrenados, con el consecuente riesgo de degradacion en la capa de salida si la distribucion de tokens no coincide exactamente con la del entrenamiento original.

## Capacidades

- Transcripcion de audio en tayiko (`tg`) a texto, con deteccion de la tarea `transcribe`.
- Traduccion de audio en tayiko a texto en ingles (tarea `translate` de Whisper), supeditada a que los tokens necesarios sobrevivan al trimming.
- Manejo de audio de hasta 30 segundos por ventana; para audios mas largos se requiere chunking externo (por ejemplo, `pipeline` con `chunk_length_s`).
- Timestamps a nivel de palabra y de segmento mediante `return_timestamps`.
- Inferencia por lotes a traves del pipeline de `transformers`.
- No soporta tool calling, function calling ni comportamiento agentico (es un modelo ASR puro).
- No soporta vision ni audio generation; solo audio input y texto output.
- Capacidades multilingues muy limitadas: el vocabulario podado elimina tokens de otros idiomas, por lo que la cobertura fuera de `tg` es residual.

## Casos de uso

- **Transcripcion de reuniones y entrevistas en tayiko**: el modelo convierte audio de hasta 30 segundos por ventana en texto; con un wrapper de chunking se puede procesar una reunion completa y generar actas o resumentes posteriores con otro modelo.
- **Subtitulacion de contenido audiovisual tayiko**: usando `return_timestamps=True` se obtienen segmentos con marcas temporales aptas para generar ficheros SRT o VTT en pipelines de postproduccion.
- **Digitalizacion de archivos orales**: bibliotecas y archivos historicos pueden transcribir grabaciones en tayiko con un modelo de 1,5 GB que corre en hardware modesto, reduciendo el coste frente al Whisper original de 3 GB.
- **Atencion al cliente en tayiko**: integrado en un sistema de voz a texto previo a un LLM, permite enrutar consultas habladas a un asistente; su tamano reducido facilita despliegues on-premise en la region EU.
- **Investigacion linguistica**: corpus de tayiko pueden transcribirse masivamente para analisis fonetico o lexico, con un modelo especializado que evita sesgos de vocabulario de otros idiomas.
- **Despliegue en edge o contenedores pequenos**: al ocupar 1,5 GB en safetensors, cabe en instancias con poca VRAM y en entornos con limites estrictos de memoria, algo inviable con el Whisper-large-v3-turbo completo en fp16.
- **Prototipado rapido de ASR para tayiko**: al estar en `transformers` y ser compatible con endpoints, se puede servir via TGI o un endpoint de inferencia sin conversiones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, BLEU ni comparaciones numericas frente al original; solo indica cualitativamente que "deberia rendir de forma similar al original" para tayiko, sin cuantificar. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,1 GB solo para pesos (763 M parametros x 4 bytes), mas activaciones y cache de atencion; en la practica, 4-6 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,6 GB para pesos; en la practica, 2,5-4 GB con overhead.
- VRAM estimada en int8: aproximadamente 0,8 GB para pesos; en la practica, 1,5-2,5 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090); para lotes grandes, A10G, L4, A100 o H100.
- Cabe en GPU consumer: si, incluso en tarjetas de gama baja con 4 GB en fp16.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), TGI (compatible con endpoints segun tags), vLLM no aplica (no es LLM), llama.cpp/Ollama no soportan Whisper de forma nativa en este formato; se puede exportar a ONNX con `optimum` para produccion.
- Latencia y throughput: no disponible en la informacion proporcionada. La variante "turbo" del original es sensiblemente mas rapida que large-v3, pero no hay cifras publicadas para esta poda.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `alphaedge-ai/whisper-large-v3-turbo-tgk-16384` | 763.461.120 | 30 s/ventana | tayiko | apache-2.0 | Hugging Face, 35 descargas |
| `openai/whisper-large-v3-turbo` | 808.878.080 | 30 s/ventana | multilingue (99 idiomas) | apache-2.0 | Hugging Face, ampliamente usado |
| `openai/whisper-large-v3` | 1.550 M aprox. | 30 s/ventana | multilingue (99 idiomas) | apache-2.0 | Hugging Face |
| `openai/whisper-small` | 244 M aprox. | 30 s/ventana | multilingue | apache-2.0 | Hugging Face |

El modelo podado ofrece un 5,61% menos de parametros y un 68,41% menos de vocabulario que el turbo original, a costa de perder cobertura multilingue. Frente a `whisper-small` es mas grande pero mucho mas especializado en tayiko. No hay datos de rendimiento comparativo publicados para esta variante, por lo que la comparacion en calidad queda no disponible.

## Limitaciones y advertencias

- **Vocabulario podado**: los tokens no presentes en tayiko fueron eliminados; el modelo puede fallar, producir texto corrupto o alucinar en otros idiomas. No debe usarse como ASR multilingue.
- **Riesgo de alucinacion**: Whisper es conocido por generar texto plausible en silencios o audio ruidoso; la poda del vocabulario puede agravar este comportamiento en tayiko si la distribucion de tokens difiere del entrenamiento original.
- **Sesgos**: hereda los sesgos del corpus de entrenamiento de Whisper (mayoritariamente ingles y dominios especificos); en tayiko la representacion puede ser limitada por la escasez de datos del idioma en el preentrenamiento original.
- **Contexto limitado**: ventana nativa de 30 segundos; audios mas largos requieren chunking manual, con riesgo de cortes en palabras o perdida de contexto entre segmentos.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base es de OpenAI y el autor original no ofrece garantias; conviene revisar los terminos de uso de Whisper.
- **Madurez**: 35 descargas y 0 likes; no hay evidencia de validacion por terceros ni benchmarks publicados. Para produccion conviene evaluar WER en un conjunto propio de tayiko antes de desplegar.
- **Formato**: solo safetensors en el repo; si se necesita GGUF o ONNX habra que convertirlo, y no hay garantia de que la conversion del vocabulario podado funcione sin ajustes.
- **Idioma de la ficha**: la informacion del modelo esta en ingles; esta ficha se redacta en castellano de Espana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-tgk-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Paper Whisper: https://arxiv.org/abs/2212.04356
- Blog de introduccion al trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
