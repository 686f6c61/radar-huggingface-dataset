# alphaedge-ai/whisper-large-v3-turbo-mya-16384

## Resumen

whisper-large-v3-turbo-mya-16384 es una version "trimmed" (podada) de openai/whisper-large-v3-turbo, publicada por alphaedge-ai y especializada en reconocimiento automatico del habla (ASR) para birmano (codigo ISO `my`). El modelo conserva la arquitectura encoder-decoder transformer de Whisper, pero reduce el vocabulario del tokenizador de 51.865 a 16.384 tokens, lo que elimina los tokens poco frecuentes en birmano y disminuye el numero de parametros de 808.878.080 a 763.461.120 (una reduccion del 5,61%). El resultado es un checkpoint de 1,5 GB en formato safetensors, mas ligero que el original y con una huella de memoria menor.

La relevancia de este modelo es practica: Whisper large-v3-turbo es un modelo multilingue de 809M de parametros con una ventana de audio de 30 segundos por inference, y su version completa incluye un vocabulario de 51.865 tokens que en la practica solo se usa parcialmente cuando se transcribe un unico idioma. Al podar el vocabulario para birmano, el modelo reduce el tamano de la capa de embedding y de la proyeccion de salida, lo que abarata el despliegue en produccion sin cambiar la arquitectura del encoder ni del decoder. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

El modelo se distribuye a traves de la libreria transformers, es compatible con endpoints de Hugging Face y esta etiquetado como `region:eu`. No se han publicado resultados de benchmarks especificos para esta version podada en la informacion disponible; el autor afirma que "deberia rendir de forma similar al modelo original" para birmano, pero advierte que el rendimiento en otros idiomas puede degradarse porque se han eliminado tokens no usados en el idioma objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 763.461.120 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por inference (ventana estandar de Whisper); contexto de texto no disponible |
| Tipos de cuantizacion | no disponible (el repo solo incluye safetensors en precision original) |
| Idiomas soportados | birmano (`my`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper large-v3-turbo: un encoder transformer que procesa espectrogramas log-Mel de 80 canales (ventanas de 30 segundos muestreadas a 16 kHz) y un decoder autoregresivo que genera tokens de texto condicionados por el audio y por tokens especiales de idioma y tarea. La innovacion de la familia turbo es la reduccion del numero de capas del decoder respecto a large-v3, lo que acelera la decodificacion manteniendo la calidad del encoder. En esta version concreta, la unica modificacion respecto al modelo base es la poda del vocabulario: se ha reducido de 51.865 a 16.384 tokens (un 68,41% menos), lo que afecta a las matrices de embedding del decoder y a la proyeccion final de logits.

El proceso de trimming se ha realizado con el metodo descrito en el blog "Introduction to Trimming" de Hugging Face, usando 200.000 textos del dataset `lbourdois/fineweb-2-trimming` para determinar que tokens del vocabulario original son relevantes en birmano. No se ha realizado un reentrenamiento completo del modelo: se conservan los pesos del encoder y del decoder de openai/whisper-large-v3-turbo, y solo se eliminan las filas y columnas correspondientes a los tokens descartados. No hay informacion disponible sobre si se aplico un fine-tuning posterior, RLHF o DPO. El modelo base fue entrenado por OpenAI con supervision debil a gran escala (paper arXiv:2212.04356), pero los detalles del dataset de entrenamiento original no se reproducen en esta ficha.

## Capacidades

- Transcripcion de audio a texto en birmano, con soporte para audio de hasta 30 segundos por inference (el pipeline de transformers gestiona la segmentacion de audios mas largos).
- Deteccion y uso de tokens especiales de idioma (`burmese`) y tarea (`transcribe`), tal como se muestra en el ejemplo de uso de la model card.
- Procesamiento de audio a 16 kHz, con extraccion de caracteristicas log-Mel integrada en el processor.
- No se ha documentado soporte de traduccion a otros idiomas en esta version podada; la model card solo menciona la tarea de transcripcion.
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente ASR).
- No se ha documentado soporte de vision ni de audio mas alla de la transcripcion.
- Capacidad multilingue limitada: el vocabulario podado esta optimizado para birmano, y el autor advierte explicitamente que el rendimiento en otros idiomas puede degradarse.

## Casos de uso

- Transcripcion de reuniones y entrevistas en birmano: el modelo puede procesar segmentos de 30 segundos y encadenarlos para transcribir conversaciones completas, con un coste de memoria menor que el modelo original gracias a la reduccion del vocabulario.
- Subtitulado automatico de contenido audiovisual en birmano: integrado en un pipeline que segmenta el audio y llama al modelo por fragmentos, permite generar subtitulos con un checkpoint de 1,5 GB que cabe en GPUs de gama media.
- Atencion al cliente en birmano: transcripcion de llamadas o mensajes de voz para su posterior analisis o enrutamiento, usando el modelo como primer paso de un pipeline ASR + NLP.
- Archivado y busqueda de audio historico en birmano: transcripcion masiva de grabaciones para indexacion y busqueda por texto, aprovechando el menor footprint de memoria para procesar lotes en paralelo.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en contenido en birmano, con despliegue en servidores modestos.
- Investigacion en ASR de bajos recursos: el modelo sirve como punto de partida para experimentos de poda de vocabulario en otros idiomas, ya que el metodo de trimming es reproducible con el dataset `lbourdois/fineweb-2-trimming`.
- Despliegue en el borde (edge): el checkpoint de 1,5 GB y la reduccion de parametros permiten ejecutar el modelo en dispositivos con recursos limitados, aunque no se han publicado mediciones de latencia ni throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de WER (word error rate), MMLU, HumanEval ni otras metricas, y solo afirma que el modelo "deberia rendir de forma similar al original" para birmano. No se inventan numeros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el checkpoint safetensors ocupa 1,5 GB, por lo que en fp32 se necesitan aproximadamente 3 GB de VRAM solo para los pesos; el resto depende del tamano de lote y de la longitud del audio.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el modelo cabe en GPUs consumer como RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores, pero no se han publicado mediciones oficiales.
- Cabe en GPU consumer: si, por tamano de pesos (1,5 GB), aunque no hay datos de latencia ni throughput.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), endpoints compatibles de Hugging Face. No se ha documentado soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-large-v3-turbo-mya-16384 | 763.461.120 | 30 s de audio | birmano | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3-turbo | 808.878.080 | 30 s de audio | multilingue | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3 | no disponible en la informacion | 30 s de audio | multilingue | Apache 2.0 | Hugging Face |

La comparativa se limita a la familia Whisper porque no se han proporcionado datos de otros modelos ASR comparables (por ejemplo, variantes de Wav2Vec2 o MMS) en la informacion disponible. La diferencia principal frente al modelo base es la reduccion de vocabulario (68,41%) y de parametros (5,61%), con la contrapartida de una menor cobertura idiomatica.

## Limitaciones y advertencias

- El vocabulario podado elimina tokens no usados en birmano, por lo que el rendimiento en otros idiomas puede degradarse de forma significativa; el autor lo advierte explicitamente.
- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto plausible que no corresponde al audio, especialmente en segmentos con ruido o silencio.
- Sesgos conocidos: no se han documentado sesgos especificos para esta version podada; el modelo base Whisper ha sido criticado por sesgos de genero y por un rendimiento desigual entre variedades dialectales.
- Limitaciones de contexto: la ventana de audio es de 30 segundos por inference; audios mas largos requieren segmentacion externa, lo que puede introducir errores en las fronteras.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del dataset de trimming (`lbourdois/fineweb-2-trimming`).
- Caveat para produccion: no hay benchmarks publicados para esta version podada, por lo que se recomienda evaluar el WER en un conjunto de validacion propio antes de desplegarlo.
- El modelo tiene muy pocas descargas (29) y ningun "like", lo que sugiere una validacion comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-mya-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de trimming: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog "Introduction to Trimming": https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper Whisper (arXiv:2212.04356): https://arxiv.org/abs/2212.04356
- Imagen de estadisticas del trimming: https://raw.githubusercontent.com/lbourdois/blog/refs/heads/master/assets/images/Trimming/whisper-large-v3-turbo-16384.png
