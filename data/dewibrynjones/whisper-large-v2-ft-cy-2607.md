# DewiBrynJones/whisper-large-v2-ft-cy-2607

## Resumen

El modelo `whisper-large-v2-ft-cy-2607` es un ajuste fino (fine-tuning) de `openai/whisper-large-v2` especializado en reconocimiento automático de voz (ASR) para galés (Cymraeg). Lo desarrolla el usuario DewiBrynJones, que ha publicado una serie de variantes numeradas (2601, 2602, 2603, 2606, 2607) entrenadas sobre distintos conjuntos de datos preprocesados. Este modelo concreto se entrenó sobre el dataset `DewiBrynJones/preprocessed-whisper-btb-cv-cvad-wlga-ca-2607`, que combina varias fuentes de audio en galés (BTB, Common Voice, CVAD, WLGA y CA).

El modelo conserva la arquitectura original de Whisper Large V2, un transformer encoder-decoder con aproximadamente 1.543 millones de parámetros, y hereda su ventana de contexto de 30 segundos de audio. Su relevancia radica en que el galés es un idioma de bajos recursos, y este tipo de ajustes permite mejorar la precisión de transcripción frente al modelo base, que está entrenado principalmente con datos en inglés y otros idiomas mayoritarios. La licencia Apache 2.0 facilita su uso comercial y su integración en productos.

Aunque la model card es autogenerada y carece de métricas de evaluación, el modelo está disponible en Hugging Face con pesos en formato safetensors y es compatible con el ecosistema Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 1.543.304.960 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16 por defecto) |
| Idiomas soportados | Galés (cy) como idioma principal del fine-tuning; el modelo base soporta 99 idiomas, pero este ajuste no garantiza el resto |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Whisper Large V2 es un modelo de reconocimiento de voz basado en un transformer encoder-decoder con atención estándar. El encoder procesa espectrogramas de mel de 80 canales a partir de ventanas de 30 segundos de audio, y el decoder genera el texto transcrito de forma autorregresiva. El modelo original se entrenó con 680.000 horas de audio supervisado, de las cuales una parte significativa es multilingüe, lo que le permite transcribir y traducir a inglés.

El fine-tuning se realizó sobre el dataset `DewiBrynJones/preprocessed-whisper-btb-cv-cvad-wlga-ca-2607`, que agrupa varias colecciones de audio en galés. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 1e-5, tamaño de lote de 16 por dispositivo (con acumulación de gradientes de 2, resultando en un lote efectivo de 64), 15.000 pasos de entrenamiento, scheduler de coseno con 500 pasos de calentamiento y precisión mixta nativa (AMP). Se usaron 2 GPUs en paralelo. No se menciona el uso de RLHF ni DPO; el ajuste es supervisado estándar.

## Capacidades

- Transcripción de voz a texto en galés, con mayor precisión que el modelo base para este idioma.
- Reconocimiento de audio de hasta 30 segundos por segmento, con manejo de segmentos más largos mediante ventanas deslizantes.
- Herencia de las capacidades multilingües del modelo base, aunque el fine-tuning puede degradar el rendimiento en otros idiomas.
- No se ha documentado soporte de tool calling, function calling ni capacidades de agente.
- No se ha documentado modo de pensamiento (thinking mode) ni capacidades de visión o audio más allá del ASR.

## Casos de uso

- Transcripción de reuniones y actas en galés: el modelo puede convertir grabaciones de audio de reuniones en texto, facilitando la documentación en organizaciones que operan en galés. Su ventana de 30 segundos permite procesar turnos de habla cortos con precisión.
- Subtitulado automático de vídeos en galés: se puede integrar en pipelines de generación de subtítulos para contenido audiovisual, mejorando la accesibilidad de medios en este idioma.
- Archivado y digitalización de material de audio histórico: muchas bibliotecas y archivos tienen grabaciones en galés; este modelo permite transcribirlas de forma automática para su indexación y búsqueda.
- Asistentes de voz y aplicaciones de dictado en galés: al ser un modelo ligero (1.5B parámetros), puede desplegarse en servidores para alimentar aplicaciones de dictado o interfaces conversacionales en galés.
- Análisis de llamadas de atención al cliente en galés: empresas que atienden en galés pueden transcribir llamadas para análisis de calidad o extracción de información.
- Investigación lingüística y creación de corpus: el modelo puede ayudar a transcribir grandes volúmenes de audio en galés para construir corpus anotados, útiles para estudios fonéticos o entrenamiento de otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de la ficha de Hugging Face declara una lista de resultados vacía (`results: []`), y la model card no incluye métricas de evaluación (WER, CER, etc.). No se dispone de comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1.543 millones de parámetros. En fp32 ocupa aproximadamente 6,2 GB; en fp16, unos 3,1 GB; en int8, alrededor de 1,6 GB. Para inferencia con Transformers, se recomienda al menos 8 GB de VRAM para trabajar cómodamente en fp16.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM, como NVIDIA RTX 3060/3070/3080/4090, o GPUs de datacenter como A10, A100 o H100. Para entrenamiento se usaron 2 GPUs, pero para inferencia basta con una.
- En consumer GPU: sí, cabe en GPUs de gama media con 8 GB (por ejemplo, RTX 3060) si se usa fp16 o cuantización.
- Opciones de despliegue: se puede servir con Transformers (pipeline de `automatic-speech-recognition`), con `faster-whisper` (basado en CTranslate2) para mayor velocidad, o mediante servidores de inferencia como vLLM (aunque vLLM no soporta Whisper de forma nativa; se recomienda usar Hugging Face TGI o Triton). También es compatible con `whisper.cpp` si se convierte a GGUF, aunque no se proporcionan pesos en ese formato.
- Latencia y throughput: no se han publicado mediciones específicas. En una GPU A100, Whisper Large V2 suele transcribir un segmento de 30 segundos en menos de 1 segundo en fp16, pero depende de la longitud del audio y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Notas |
|---|---|---|---|---|---|
| `DewiBrynJones/whisper-large-v2-ft-cy-2607` | 1.543 M | 30 s audio | Galés | Apache 2.0 | Fine-tuning de Whisper Large V2 sobre dataset combinado |
| `DewiBrynJones/whisper-large-v2-ft-cy-2603` | 1.543 M | 30 s audio | Galés | Apache 2.0 | Variante anterior del mismo autor, entrenada sobre otro dataset (2603) |
| `openai/whisper-large-v2` | 1.543 M | 30 s audio | Multilingüe (99 idiomas) | MIT | Modelo base, sin ajuste específico para galés |
| `openai/whisper-large-v3` | 1.543 M | 30 s audio | Multilingüe (99 idiomas) | MIT | Versión más reciente con mejor rendimiento general, pero sin ajuste para galés |

La comparativa se limita a modelos de la misma familia. No se dispone de datos de rendimiento para establecer diferencias cuantitativas entre las variantes del autor.

## Limitaciones y advertencias

- No se han publicado métricas de evaluación (WER, CER) en la model card, por lo que no es posible verificar la mejora real frente al modelo base.
- El fine-tuning se realizó sobre un dataset específico; el rendimiento puede degradarse en dominios o acentos no representados en los datos de entrenamiento.
- Al ser un ajuste de Whisper Large V2, hereda los sesgos del modelo base, como una menor precisión en habla no nativa o con ruido de fondo.
- Riesgo de alucinaciones: Whisper puede generar texto que no corresponde al audio, especialmente en segmentos de silencio o con música. No se ha mitigado específicamente en este modelo.
- La ventana de contexto de 30 segundos obliga a segmentar audios largos, lo que puede introducir errores en los límites de los segmentos.
- Aunque la licencia es Apache 2.0, el dataset de entrenamiento puede tener restricciones de uso; se recomienda revisar la licencia de `DewiBrynJones/preprocessed-whisper-btb-cv-cvad-wlga-ca-2607`.
- No se ha documentado soporte para otros idiomas; el uso fuera del galés puede dar resultados poco fiables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DewiBrynJones/whisper-large-v2-ft-cy-2607
- Variante 2603: https://huggingface.co/DewiBrynJones/whisper-large-v2-ft-cy-2603
- Página de despliegue y hardware (openmodelmap): https://openmodelmap.com/model/DewiBrynJones/whisper-large-v2-ft-cy-2606
- Opciones de inferencia en FriendliAI (variante 2601): https://friendli.ai/models/DewiBrynJones/whisper-large-v2-ft-cy-2601
- Modelo base: https://huggingface.co/openai/whisper-large-v2
