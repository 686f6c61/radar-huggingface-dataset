# alphaedge-ai/whisper-base-hat-16384

## Resumen

`whisper-base-hat-16384` es una version recortada (*trimmed*) de `openai/whisper-base`, el modelo de reconocimiento automatico del habla (ASR) publicado por OpenAI en 2022. Lo desarrolla el usuario `alphaedge-ai` aplicando la tecnica de *trimming* de vocabulario documentada por Loïck Bourdois y colaboradores en Hugging Face. El objetivo es especializar el modelo para criollo haitiano (`ht`) reduciendo el vocabulario del tokenizer de 51.865 a 16.384 tokens, lo que elimina los tokens poco frecuentes en ese idioma y recorta el numero de parametros en un 25,02%.

El resultado es un modelo de 54.427.648 parametros (frente a los 72.593.920 del original) con una huella de memoria notablemente menor, manteniendo la arquitectura encoder-decoder transformer propia de Whisper y su ventana de contexto de audio de 30 segundos. La reduccion de vocabulario implica que el modelo pierde capacidad para transcribir idiomas distintos del criollo haitiano, ya que los tokens especificos de otras lenguas se han eliminado.

Es relevante para quienes necesitan desplegar ASR en criollo haitiano en entornos con recursos limitados (CPU, GPUs de gama baja, dispositivos embebidos), donde el Whisper base completo resulta innecesariamente pesado. El repositorio ocupa 0,1 GB y la licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 54.427.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana nativa de Whisper) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | criollo haitiano (ht) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Vocabulario | 16.384 tokens (frente a 51.865 del original) |
| Tamano del repositorio | 0,1 GB |
| Modelo base | openai/whisper-base |
| Frecuencia de muestreo de audio | 16 kHz |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper base: un transformer encoder-decoder con atención multi-cabeza estandar, entrenado originalmente por OpenAI con supervision debil a gran escala sobre 680.000 horas de audio (el dato de horas corresponde al paper de Whisper, no se detalla en la model card). El proceso de *trimming* no reentrena el modelo desde cero: parte de los pesos de `openai/whisper-base` y reduce la matriz de embeddings del tokenizer y la capa de proyeccion de salida para quedarse unicamente con los 16.384 tokens mas relevantes para el criollo haitiano.

La seleccion de tokens se realizo minando 200.000 textos del dataset `lbourdois/fineweb-2-trimming` para identificar los tokens efectivamente usados en `ht`. El recorte del vocabulario reduce el numero de parametros un 25,02% (de 72,6M a 54,4M) y el tamano del vocabulario un 68,41%. No se indica en la informacion disponible si hubo fases adicionales de fine-tuning, RLHF o DPO tras el trimming, por lo que se asume que los pesos son los del modelo base con el vocabulario recortado. La innovacion tecnica principal es, por tanto, el propio metodo de trimming, que permite especializar modelos multilingues a un solo idioma con una perdida minima de rendimiento y un ahorro sustancial de memoria.

## Capacidades

- Transcripcion de audio en criollo haitiano (`ht`) a texto, con ventana nativa de 30 segundos por segmento.
- Reconocimiento automatico del habla en un unico idioma; no soporta traduccion a otros idiomas ni transcripcion multilingue tras el recorte.
- Tareas de transcripcion (`task="transcribe"`) mediante el pipeline `automatic-speech-recognition` de transformers.
- Inferencia con audio a 16 kHz, requiriendo remuestreo previo si la fuente tiene otra frecuencia.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo thinking, vision ni audio generation; es exclusivamente ASR.
- Capacidad limitada a un solo idioma: no debe esperarse buen rendimiento en lenguas distintas del criollo haitiano.

## Casos de uso

- **Transcripcion de reuniones y entrevistas en criollo haitiano**: el modelo convierte grabaciones de audio de hasta 30 segundos por segmento en texto, adecuado para entornos de documentacion de ONGs, medios locales o instituciones que operan en Haiti.
- **Subtitulado automatico de contenido audiovisual**: integrado en pipelines de postproduccion, genera subtitulos en `ht` para videos, reduciendo el coste frente a transcripcion manual.
- **Atencion al cliente por voz en criollo haitiano**: combinado con un modelo de lenguaje, permite construir asistentes telefonicos o de voz que transcriben la consulta del usuario antes de pasarla a un LLM para respuesta.
- **Despliegue en dispositivos con recursos limitados**: con 54,4M de parametros y 0,1 GB de repositorio, cabe en GPUs consumer, CPUs modernas e incluso dispositivos embebidos, lo que lo hace util para aplicaciones de campo sin conectividad.
- **Investigacion linguistica y creacion de corpus**: util para generar transcripciones a escala de grabaciones en criollo haitiano como paso previo a la anotacion o al analisis.
- **Accesibilidad para personas con discapacidad auditiva**: transcripcion en tiempo casi real de discursos o clases en `ht` para su visualizacion como texto.
- **Preprocesamiento en sistemas RAG de audio**: convertir archivos de audio en `ht` a texto indexable para busqueda semantica o recuperacion documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER (word error rate) ni comparaciones cuantitativas con el modelo original u otros modelos ASR.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB en fp32 (54,4M de parametros), y del orden de 200-400 MB en fp16 o int8. Cabe holgadamente en cualquier GPU consumer moderna.
- **GPU recomendadas**: funciona en cualquier GPU con al menos 1-2 GB de VRAM; no requiere A100 ni H100. Una GTX 1050, RTX 2060 o superior es mas que suficiente. Tambien puede ejecutarse en CPU.
- **Cabe en consumer GPU**: si, en practicamente todas las GPUs consumer de los ultimos diez anos, asi como en CPUs de escritorio y portatiles.
- **Opciones de despliegue**: transformers (pipeline `automatic-speech-recognition`), y en general cualquier runtime compatible con safetensors y la arquitectura Whisper. La model card solo documenta el uso via transformers; no se mencionan vLLM, llama.cpp, Ollama ni TGI (estos ultimos no estan orientados a ASR Whisper de forma nativa).
- **Latencia y throughput estimados**: no disponible. La model card no proporciona datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-base-hat-16384 | 54,4M | 30 s | ht | Apache 2.0 | Hugging Face |
| openai/whisper-base | 72,6M | 30 s | multilingue | Apache 2.0 | Hugging Face / OpenAI |
| openai/whisper-tiny | 39,0M | 30 s | multilingue | Apache 2.0 | Hugging Face / OpenAI |
| openai/whisper-small | 244M | 30 s | multilingue | Apache 2.0 | Hugging Face / OpenAI |

La comparativa se limita a variantes de la familia Whisper, ya que no se dispone de informacion sobre modelos ASR especializados en criollo haitiano con los que contrastar. Frente a `whisper-base`, la version trimmed ahorra un 25,02% de parametros y restringe el soporte a un solo idioma. Frente a `whisper-tiny`, tiene mas parametros pero esta especializado. Frente a `whisper-small`, es aproximadamente 4,5 veces mas pequeno. No se dispone de datos de rendimiento comparado (WER) para valorar la perdida o ganancia de calidad.

## Limitaciones y advertencias

- **Especializacion monoidioma**: el vocabulario se ha recortado a 16.384 tokens orientados a criollo haitiano; el modelo no funcionara correctamente en otros idiomas.
- **Riesgo de alucinacion**: como todos los modelos Whisper, puede generar texto plausible en pasajes de silencio o ruido, o repetir frases. Es un comportamiento documentado en la familia Whisper y no se mitiga en esta version.
- **Ventana de audio de 30 segundos**: los audios mas largos deben segmentarse manualmente o mediante el pipeline, lo que puede introducir errores en las fronteras de segmento.
- **Sin benchmarks publicados**: no hay datos de WER ni comparativas cuantitativas que permitan estimar la calidad real frente al modelo original.
- **Sesgos**: al derivar de `openai/whisper-base`, hereda los sesgos del entrenamiento original de Whisper (variacion de rendimiento segun acento, genero, edad y calidad de audio), aunque no se documentan analisis especificos para `ht`.
- **Licencia**: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero se recomienda conservar la atribucion a OpenAI y al autor del trimming.
- **Fecha de creacion futura**: el repositorio indica una fecha de creacion de 2026-05-29, lo que puede resultar relevante al evaluar su madurez y soporte comunitario (0 likes, 57 descargas en el momento de la consulta).
- **Sin garantias de produccion**: al ser un modelo con pocas descargas y sin evaluacion publicada, su uso en produccion deberia ir precedido de una evaluacion propia con datos representativos del dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-hat-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Blog de introduccion al trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
