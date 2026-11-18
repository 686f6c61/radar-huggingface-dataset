# alphaedge-ai/whisper-large-v3-turbo-jav-16384

## Resumen

`whisper-large-v3-turbo-jav-16384` es una variante recortada (trimmed) del modelo de reconocimiento automatico del habla `openai/whisper-large-v3-turbo`, publicada por el usuario `alphaedge-ai`. El modelo aplica la tecnica de trimming de vocabulario descrita por Hugging Face para reducir el vocabulario del tokenizer de Whisper de 51.865 a 16.384 tokens, conservando unicamente aquellos relevantes para el javanes. El resultado es una reduccion del 68,41% en el tamano del vocabulario y del 5,61% en el numero total de parametros (de 808.878.080 a 763.461.120).

La motivacion practica es reducir la huella de memoria del modelo sin degradar significativamente el rendimiento en el idioma objetivo. Al eliminar los tokens del vocabulario que raramente aparecen en javanes, el modelo puede desplegarse en entornos con menos VRAM y con una capa de salida mas pequena, manteniendo la arquitectura encoder-decoder original de Whisper. La model card indica que el rendimiento deberia ser similar al del modelo original para javanes, pero advierte de que el rendimiento en otros idiomas puede degradarse.

Este modelo es relevante para quienes necesitan ASR (reconocimiento automatico del habla) en javanes con un footprint reducido, por ejemplo en despliegues en el borde o en servicios con multiples idiomas donde el javanes es una de las lenguas soportadas. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, y el formato safetensors facilita su integracion en pipelines de `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 763.461.120 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos (arquitectura Whisper) |
| Tipos de cuantizacion | No disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | Javanes (jv) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `openai/whisper-large-v3-turbo`, un transformer encoder-decoder con atencion por bloques disenado para transcripcion de audio. Whisper procesa audio remuestreado a 16 kHz y genera texto autoregresivamente. La variante "turbo" de large-v3 reduce el numero de capas del decoder respecto a large-v3, lo que disminuye la latencia de inferencia a costa de una ligera perdida de precision en algunos idiomas.

La innovacion de este modelo concreto es el recorte del vocabulario: se seleccionaron 16.384 tokens a partir de un corpus de 172.668 textos en javanes extraidos del dataset `lbourdois/fineweb-2-trimming`. No se ha realizado un reentrenamiento completo del modelo; se trata de un modelo derivado (relacion `quantized` con el base) en el que se ha reducido la matriz de embeddings de entrada y la capa de proyeccion de salida. No se dispone de informacion sobre el numero de tokens de audio utilizados en el ajuste ni sobre si hubo RLHF o DPO.

## Capacidades

- Transcripcion de audio a texto en javanes.
- Deteccion automatica de idioma limitada al vocabulario recortado (jv).
- Tareas de traduccion de audio a texto (task `translate`) segun la API de Whisper, aunque el modelo esta optimizado para transcripcion.
- Procesamiento de audio de hasta 30 segundos por ventana, con capacidad de segmentacion para audios mas largos mediante pipelines de `transformers`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues muy limitadas: el vocabulario recortado elimina tokens de otros idiomas.
- No dispone de modo thinking, vision ni audio adicional mas alla del ASR.

## Casos de uso

- Transcripcion de reuniones y entrevistas en javanes: el modelo puede procesar audio de hasta 30 segundos por segmento y encadenarse para audios largos, con una ventana de contexto de audio fija que simplifica el despliegue.
- Subtitulado automatico de contenido audiovisual en javanes: adecuado para generar subtitulos en plataformas de video, con la ventaja de un modelo de 763M de parametros que cabe en GPUs de consumo.
- Asistentes de voz para atencion al cliente en javanes: el modelo puede integrarse en un pipeline de ASR + NLU para transcribir consultas de usuarios en centros de llamadas.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en tiempo casi real de conversaciones en javanes en dispositivos con recursos limitados.
- Investigacion linguistica y creacion de corpus: util para transcribir grabaciones de campo en javanes con un modelo ligero y de licencia permisiva.
- Despliegue en el borde (edge computing): su tamano reducido (1,5 GB en safetensors) permite ejecutarlo en dispositivos con 4-8 GB de RAM/VRAM, como mini-PCs o GPUs integradas.
- Pipeline de analisis de contenido en redes sociales: transcripcion masiva de audios en javanes para moderacion o indexacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB en FP16 (pesos safetensors de 1,5 GB); en cuantizacion de 8 bits, alrededor de 0,8-1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o GPUs de datacenter como A100/H100 para despliegues de alto throughput.
- Cabe en GPUs de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: `transformers` (pipeline de ASR), vLLM (soporte limitado para Whisper), TGI, llama.cpp (con conversion a GGUF), Ollama (previa conversion).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependeran del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-large-v3-turbo-jav-16384 | 763M | 30 s | Javanes | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3-turbo | 809M | 30 s | Multilingue (99 idiomas) | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3 | 1.550M | 30 s | Multilingue (99 idiomas) | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244M | 30 s | Multilingue (99 idiomas) | Apache 2.0 | Hugging Face |

La comparativa muestra que el modelo recortado ofrece un tamano intermedio entre `whisper-small` y `whisper-large-v3-turbo`, pero restringido a javanes. Frente a `whisper-large-v3-turbo`, la reduccion de parametros es modesta (5,61%), por lo que la principal ventaja es la reduccion del vocabulario y de la capa de salida, no una gran disminucion del coste computacional del encoder/decoder.

## Limitaciones y advertencias

- El vocabulario recortado elimina tokens de otros idiomas, por lo que el rendimiento en idiomas distintos del javanes puede ser deficiente o directamente incorrecto.
- Riesgo de alucinacion en audios con ruido, silencios largos o habla no javanesa, comun en modelos Whisper.
- Sesgos inheritos del corpus de entrenamiento original de Whisper y del corpus de minado `fineweb-2-trimming`, que puede no representar toda la variacion dialectal del javanes.
- Limitacion de contexto de audio: 30 segundos por ventana; audios mas largos requieren segmentacion manual o mediante pipeline.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de minado y las condiciones del dataset base.
- No se han publicado evaluaciones formales de calidad (WER) para este modelo concreto, por lo que su rendimiento real en produccion es incierto.
- El modelo tiene muy pocas descargas (36) y ningun "like", lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-jav-16384)
- [Modelo base: openai/whisper-large-v3-turbo](https://huggingface.co/openai/whisper-large-v3-turbo)
- [Paper de Whisper (arXiv:2212.04356)](https://arxiv.org/abs/2212.04356)
- [Blog de introduccion a trimming](https://huggingface.co/blog/lbourdois/introduction-to-trimming)
- [Dataset lbourdois/fineweb-2-trimming](https://huggingface.co/datasets/lbourdois/fineweb-2-trimming)
