# PulpCut/Qwen3-TTS-12Hz-0.6B-Base-safetensors

## Resumen

PulpCut/Qwen3-TTS-12Hz-0.6B-Base-safetensors es un reempaquetado del modelo de síntesis de voz Qwen3-TTS 12Hz 0.6B Base, desarrollado originalmente por Alibaba Cloud. Este repositorio no introduce un modelo nuevo: los pesos se copian byte a byte del checkpoint oficial, pero se reorganizan en cinco archivos `safetensors` independientes, uno por subsistema, para que un motor escrito en C (H3ddle) pueda cargarlos y validarlos sin necesidad de un runtime de Python.

La motivación principal es eliminar la dependencia de Python en entornos de producción embebidos o con restricciones de recursos, manteniendo intacta la arquitectura original. El modelo conserva la licencia Apache 2.0 y soporta diez idiomas, incluyendo español, inglés, chino, alemán, francés, italiano, portugués, ruso, japonés y coreano. Es relevante ahora porque facilita la integración de TTS multilingüe en aplicaciones nativas sin stack de Python, un paso práctico para despliegues ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS 12Hz 0.6B Base (transformador con subsistemas: talker, code predictor, speaker encoder ECAPA-TDNN, codec decoder RVQ) |
| Parametros totales | 0,6 mil millones (segun nombre del modelo; no se proporciona desglose oficial) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto textual largo) |
| Tipos de cuantizacion | no disponible (pesos sin cuantizar; el talker en bfloat16, el speaker encoder en float32) |
| Idiomas soportados | en, zh, de, es, fr, it, pt, ru, ja, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (5 archivos: talker, code_predictor, speaker_encoder, codec_decoder, tokenizer.json) |

## Arquitectura y entrenamiento

El modelo base Qwen3-TTS 12Hz 0.6B emplea una arquitectura de síntesis de voz por código neuronal. El subsistema `talker` contiene 28 capas transformer con ancho 1024 y una capa de embedding de texto de dimensiones 151936×2048. El `code_predictor` es un modelo de 5 capas que genera los grupos de código 1 a 15. El `speaker_encoder` es una red ECAPA-TDNN que opera sobre un mel de 128 bandas para extraer la identidad del hablante. El `codec_decoder` combina RVQ (quantización residual vectorial), un transformador de 8 capas y un vocoder para reconstruir la forma de onda.

El reempaquetado aplica dos transformaciones sobre los pesos originales, ambas exactas o equivalentes a operaciones que el modelo de referencia realiza en cada decodificación: los codebooks del codec se pliegan desde su forma EMA (división `embedding_sum / max(cluster_usage, 1e-5)`) y el speaker encoder se amplía de bfloat16 a float32. El resto de pesos se copian sin cambios. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni el proceso de alineación (RLHF/DPO) del modelo original.

## Capacidades

- Síntesis de voz multilingüe: genera audio a partir de texto en diez idiomas (inglés, chino, alemán, español, francés, italiano, portugués, ruso, japonés, coreano).
- Clonación de voz mediante speaker embedding: utiliza la salida del ECAPA-TDNN para replicar la voz de un clip de referencia, sin necesidad de encoder de Mimi.
- Generación de voz con control de prosodia implícito: el predictor de códigos y el decodificador RVQ permiten una síntesis naturalista.
- Compatibilidad con motores sin runtime Python: los safetensors separados permiten carga directa desde C/C++ mediante H3ddle.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente generativo de audio.

## Casos de uso

- Asistentes de voz embebidos: integrar el modelo en dispositivos IoT o routers con recursos limitados, cargando cada subsistema por separado desde C sin depender de Python.
- Lectura de textos largos multilingüe: generar audiolibros o noticias en varios idiomas, aprovechando la salida de 12 Hz para una síntesis estable.
- Clonación de voz para doblaje: usar el speaker encoder ECAPA para imitar una voz de referencia en producciones audiovisuales o podcasts.
- Aplicaciones de accesibilidad: convertir artículos web o documentos en audio para personas con discapacidad visual, con soporte multilingüe.
- Sistemas de respuesta por voz en atención al cliente: generar respuestas habladas en tiempo real desde un backend en C, evitando la sobrecarga de un intérprete Python.
- Prototipado rápido de TTS en entornos sin GPU: al ser un modelo de 0.6B, puede ejecutarse en CPU para pruebas de concepto antes de escalar a hardware dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MOS (Mean Opinion Score), WER (Word Error Rate) ni comparativas con otros modelos TTS en la model card del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 0.6B parámetros y pesos en bfloat16 (talker) y float32 (speaker encoder), el uso de memoria aproximado sería de 1,2 GB en bf16, más overhead del vocoder; el tamaño total del repositorio es 2,3 GB.
- GPU recomendadas: no especificado. Por el tamaño, cabría en GPUs consumer como RTX 3060 (12 GB) o superiores, y en GPUs de datacenter como A10 o A100.
- Ejecución en CPU: viable para inferencia no tiempo real; el modelo es pequeño y no requiere aceleración obligatoria.
- Opciones de despliegue: el formato safetensors separado está pensado para el motor H3ddle (C/C++). No se menciona soporte nativo para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-TTS 12Hz 0.6B Base (original) | 0.6B | 10 | Apache 2.0 | Checkpoints PyTorch | Modelo de referencia, incluye encoder Mimi para clonación in-context |
| PulpCut/Qwen3-TTS-12Hz-0.6B-Base-safetensors | 0.6B | 10 | Apache 2.0 | safetensors separados | Reempaquetado para C, sin encoder Mimi |
| VITS (ejemplo de TTS ligero) | ~0.1B | 1-2 | MIT | PyTorch | Arquitectura end-to-end, menor calidad multilingüe |
| Tacotron2 | ~0.1B | 1 | BSD | PyTorch | Modelo clásico, requiere vocoder externo |

No se dispone de datos de rendimiento comparativo (MOS, etc.) para estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No soporta clonación de voz in-context: el repositorio excluye el encoder Mimi del tokenizador de voz, por lo que solo se puede clonar mediante el speaker embedding ECAPA. Para clonación in-context, usar el modelo original.
- Dependencia de H3ddle: los safetensors separados están diseñados para ese motor C; no hay garantía de compatibilidad con otros frameworks sin trabajo adicional de integración.
- Sin cuantización: los pesos se distribuyen sin cuantizar, lo que puede aumentar el uso de memoria frente a versiones cuantizadas de otros modelos.
- Sin benchmarks publicados: no hay métricas objetivas de calidad de voz ni de rendimiento en este repositorio.
- Riesgo de alucinación auditiva: como cualquier TTS, puede generar pronunciaciones incorrectas o artefactos en textos ambiguos o con nombres propios.
- Sesgos lingüísticos: el soporte multilingüe puede tener calidad desigual entre idiomas; no se proporcionan datos de evaluación por lengua.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PulpCut/Qwen3-TTS-12Hz-0.6B-Base-safetensors
- Modelo original Qwen3-TTS 12Hz 0.6B Base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Motor H3ddle (C): https://github.com/AlexanderIstomin/h3ddle
