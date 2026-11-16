# longcap/LongCap_ICLR

## Resumen

LongCap es un modelo de audio desarrollado por el equipo longcap, presentado como material de revisión para ICLR. Se distribuye en dos checkpoints especializados: LongCap-35B-A3B, orientado a la generación de descripciones de audio con marcas de tiempo (timestamped audio captioning), y LongCap-Diar-35B-A3B, orientado a la diarización de hablantes y al reconocimiento automático de voz. Ambos se publican en formato FP8 dentro del repositorio, que ocupa 76,9 GB e incluye además el paquete de inferencia, los ficheros de dependencias, tests e instrucciones de uso.

El modelo sigue una arquitectura de tipo mezcla de expertos (MoE) con 35B parámetros totales y 3B parámetros activos, según se deduce de la nomenclatura "35B-A3B" empleada por el autor. Esta configuración busca ofrecer la capacidad de un modelo grande manteniendo un coste de cómputo por token propio de un modelo de 3B activos, lo que resulta relevante para tareas de audio de larga duración donde el coste de inferencia es crítico.

La relevancia actual del modelo radica en su doble enfoque: por un lado, la descripción de audio con timestamps, que permite alinear eventos sonoros con instantes concretos; por otro, la diarización de hablantes combinada con ASR, que aborda el problema de "quién habla y cuándo" en grabaciones multi-hablante. La licencia Apache 2.0 facilita su adopción comercial, aunque la información pública disponible es escasa y se limita a la model card y a los metadatos del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), según nomenclatura 35B-A3B; detalles internos no disponibles |
| Parámetros totales | 35B (según nomenclatura del checkpoint) |
| Parámetros activos | 3B (según nomenclatura del checkpoint) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (checkpoints publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El autor no documenta en la model card los detalles de la arquitectura interna más allá de la nomenclatura "35B-A3B", que indica un transformer con mezcla de expertos de 35B parámetros totales y 3B activos por token. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card únicamente describe la estructura del repositorio y remite a la documentación del paquete de código para el arranque rápido y las notas de validación.

La innovación principal que se deduce del material disponible es la especialización dual: un checkpoint para captioning de audio con timestamps y otro para diarización y ASR, ambos compartiendo la misma base MoE de 35B-A3B. El runtime de inferencia es personalizado y se incluye en el repositorio, con directorios de modelo locales, lo que sugiere que el modelo no se ejecuta directamente con los runners estándar de Hugging Face sin adaptación. No se dispone de información sobre técnicas de decodificación especulativa, atención lineal u otras optimizaciones.

## Capacidades

- Generación de descripciones de audio con marcas de tiempo (timestamped audio captioning) mediante el checkpoint LongCap-35B-A3B.
- Diarización de hablantes (speaker diarization): identificación de quién habla en cada segmento.
- Reconocimiento automático de voz (ASR) mediante el checkpoint LongCap-Diar-35B-A3B.
- Procesamiento de audio en inglés y chino.
- Integración con un runtime de inferencia propio incluido en el repositorio.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio generativo o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Transcripción de reuniones con atribución de hablante: el checkpoint LongCap-Diar combina ASR y diarización, de modo que puede generar actas donde cada intervención queda asociada a su hablante, lo que resulta adecuado para entornos corporativos multilingües en inglés y chino.
- Indexación y búsqueda de archivos audiovisuales: el captioning con timestamps permite generar metadatos alineados temporalmente, facilitando la búsqueda de fragmentos concretos dentro de grabaciones largas.
- Subtitulado enriquecido para medios: la descripción de eventos sonoros con marcas de tiempo permite generar pistas de accesibilidad que indican no solo el diálogo sino también sonidos relevantes y su momento exacto.
- Análisis de llamadas de atención al cliente: la diarización permite separar agente y cliente en grabaciones, y el ASR transcribe cada turno, lo que sirve para auditoría de calidad y análisis de conversaciones.
- Investigación en audio y lingüística computacional: al ser material de revisión para ICLR con licencia Apache 2.0, permite reproducir experimentos y comparar resultados con las notas de validación incluidas.
- Generación de datasets de audio etiquetados: el modelo puede emplearse para anotar automáticamente corpus de audio con descripciones temporizadas y etiquetas de hablante, reduciendo el coste de anotación manual.
- Monitorización de contenido en plataformas: la combinación de captioning y diarización permite clasificar y describir contenido sonoro para moderación o catalogación automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a las notas de validación del paquete de código (`code/VALIDATION.md`) para interpretar la salida generada y comparar con puntuaciones históricas, pero no se incluyen cifras en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 35B parámetros totales en FP8, el peso de los checkpoints ronda los 35 GB por checkpoint, por lo que se requiere al menos esa cantidad de memoria más el overhead del runtime y de las activaciones.
- GPU recomendadas: no especificadas por el autor. Por el tamaño en FP8, se necesitan GPU con 40-80 GB de VRAM (A100 40/80 GB, H100 80 GB) para cargar un checkpoint completo.
- Compatibilidad con GPU de consumo: no confirmada. Una RTX 4090 con 24 GB no podría cargar el checkpoint FP8 completo sin cuantización adicional, que no se documenta.
- Opciones de despliegue: el autor indica que se debe usar el runtime personalizado incluido en el repositorio, con directorios de modelo locales. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| LongCap-35B-A3B | 35B totales / 3B activos | no disponible | en, zh | Apache 2.0 | Captioning de audio con timestamps |
| LongCap-Diar-35B-A3B | 35B totales / 3B activos | no disponible | en, zh | Apache 2.0 | Diarización + ASR |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en el material proporcionado, por lo que no es posible establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La información pública es muy limitada: la model card solo describe la estructura del repositorio y no detalla arquitectura interna, datos de entrenamiento ni metodología de evaluación.
- Solo se soportan inglés y chino; no hay evidencia de capacidades en castellano u otros idiomas.
- El modelo se distribuye únicamente en FP8 y con un runtime personalizado, lo que puede dificultar la integración en infraestructuras estándar y limita las opciones de cuantización.
- El repositorio tiene un tamaño de 76,9 GB, lo que implica requisitos de almacenamiento y de memoria considerables para su despliegue.
- No se han publicado benchmarks, por lo que no es posible verificar el rendimiento real frente a alternativas.
- Riesgo de alucinación en la generación de descripciones de audio: el autor remite expresamente a las notas de validación antes de interpretar la salida generada, lo que sugiere cautela sobre la fidelidad de las descripciones.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de material de revisión para ICLR conviene verificar el estado de la publicación y posibles actualizaciones del repositorio.
- Al ser un modelo recién publicado (creado en noviembre de 2026) con cero descargas y cero likes, carece de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/longcap/LongCap_ICLR
- Paquete de código e inferencia: https://huggingface.co/longcap/LongCap_ICLR/tree/main/code
- Quickstart: https://huggingface.co/longcap/LongCap_ICLR/blob/main/code/docs/quickstart.md
- Notas de validación: https://huggingface.co/longcap/LongCap_ICLR/blob/main/code/VALIDATION.md
- Checkpoint LongCap-35B-A3B: https://huggingface.co/longcap/LongCap_ICLR/tree/main/LongCap
- Checkpoint LongCap-Diar-35B-A3B: https://huggingface.co/longcap/LongCap_ICLR/tree/main/LongCap_Diar
