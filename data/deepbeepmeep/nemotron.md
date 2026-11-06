# DeepBeepMeep/Nemotron

## Resumen

DeepBeepMeep/Nemotron es un reempaquetado de pesos del modelo nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B, publicado por el desarrollador DeepBeepMeep para su integración en WanGP (Wan2GP), una herramienta de generación multimedia. El modelo original de NVIDIA es un sistema de reconocimiento automático del habla (ASR) con arquitectura Mixture-of-Experts (30B parámetros totales, 4B activos), orientado a transcripción con atribución de hablantes (speaker diarization), marcas temporales a nivel de palabra, generación de subtítulos y traducción.

Este repositorio no introduce un modelo nuevo: es una redistribución de los pesos originales en formatos optimizados para su descarga e inferencia dentro de WanGP. Incluye el modelo de lenguaje separado de sus expertos enrutados (BF16 e INT8 ConvRot), los expertos enrutados en INT8 ConvRot (variante por defecto) y 4 bits, además del codificador de audio, un modelo draft DFlash2 para decodificación especulativa, el tokenizador y la configuración.

Su relevancia radica en que facilita el despliegue práctico de un modelo ASR de gran escala con capacidades de diarización y traducción en un pipeline de código abierto, con cuantizaciones que reducen los requisitos de memoria respecto al BF16 original. La licencia es OpenMDW 1.1, heredada del modelo base de NVIDIA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer, con codificador de audio y modelo draft DFlash2 para decodificación especulativa |
| Parámetros totales | 30B (según nombre del modelo base) |
| Parámetros activos | 4B (según nombre del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (LM sin expertos), INT8 ConvRot (LM y expertos), 4 bits (expertos enrutados) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw-1.1) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 58,3 GB |
| Pipeline | automatic-speech-recognition |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con capas Mixture-of-Experts: 30B parámetros totales con 4B activos por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamaño. El sistema ASR incluye un codificador de audio independiente y un modelo de lenguaje que genera la transcripción; el repositorio separa explícitamente el LM de sus expertos enrutados en ficheros distintos, lo que permite cargar solo las partes necesarias según la cuantización elegida.

El reempaquetado añade un modelo draft DFlash2 para decodificación especulativa, técnica que acelera la generación al proponer varios tokens candidatos que el modelo principal verifica en paralelo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto).
- Atribución de hablantes (speaker diarization) en la transcripción.
- Marcas temporales a nivel de palabra (word timestamps).
- Generación de subtítulos a partir del audio.
- Traducción de la transcripción.
- Procesamiento de audio mediante codificador dedicado.
- Decodificación especulativa mediante modelo draft DFlash2 para acelerar la inferencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Transcripción de reuniones con identificación de participantes: el modelo combina ASR y diarización, de modo que cada intervención queda atribuida a un hablante, lo que simplifica la generación de actas y la búsqueda posterior por persona.
- Generación de subtítulos para vídeo: las marcas temporales a nivel de palabra permiten alinear los subtítulos con precisión con el audio, un requisito habitual en plataformas de vídeo y flujos de postproducción.
- Traducción de contenido audiovisual: la capacidad de traducción integrada permite obtener transcripciones en otro idioma sin un pipeline separado de traducción automática.
- Archivado y búsqueda de grabaciones: transcribir llamadas, entrevistas o podcasts para indexarlos y hacerlos consultables por texto, aprovechando la salida estructurada con hablantes y tiempos.
- Accesibilidad: convertir audio en texto con marcas temporales para generar subtítulos accesibles en aplicaciones educativas o institucionales.
- Integración en WanGP: al estar empaquetado para esta herramienta, se puede usar como componente de transcripción dentro de flujos de generación multimedia gestionados por WanGP, que descarga los ficheros automáticamente.
- Despliegue con cuantización reducida: las variantes INT8 ConvRot y 4 bits de los expertos permiten ejecutar el modelo en entornos con memoria limitada, a costa de una posible pérdida de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 58,3 GB e incluye varias variantes de pesos; la variante por defecto (LM en INT8 ConvRot + expertos en INT8 ConvRot) requiere cargar en memoria el LM y los expertos, por lo que se necesita un entorno con memoria agregada considerable (GPU o GPU + CPU/RAM).
- La variante de expertos en 4 bits reduce el espacio de los expertos enrutados respecto a INT8, lo que facilita el ajuste en GPUs de menor capacidad, aunque no se especifican cifras exactas.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del modelo, se orienta a GPUs de centro de datos (A100, H100) o configuraciones multi-GPU; no se confirma que quepa en GPUs de consumo.
- Despliegue: el repositorio está diseñado para WanGP (Wan2GP), que descarga los ficheros automáticamente. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepBeepMeep/Nemotron (este) | 30B totales / 4B activos | no disponible | OpenMDW 1.1 | Hugging Face, empaquetado para WanGP | Reempaquetado del modelo de NVIDIA con cuantizaciones INT8/4 bits y draft DFlash2 |
| nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B | 30B totales / 4B activos | no disponible | OpenMDW 1.1 | Hugging Face | Modelo base original de NVIDIA; este repositorio deriva de él |
| Otras alternativas ASR con diarización | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Es un reempaquetado de pesos, no un modelo entrenado por DeepBeepMeep; cualquier limitación del modelo base de NVIDIA se hereda.
- No se dispone de información sobre sesgos del modelo base en la documentación proporcionada.
- Riesgo de alucinación inherente a los modelos de lenguaje que generan transcripciones; no se han publicado evaluaciones de fidelidad en esta ficha.
- Idiomas soportados no disponibles; no se puede confirmar cobertura multilingüe ni calidad por idioma.
- Longitud de contexto no disponible; no se puede garantizar el procesamiento de audios de larga duración en una sola pasada.
- La licencia OpenMDW 1.1 es una licencia "other"; es necesario revisar el texto completo (`LICENSE_NEMOTRON_TRANSCRIBE.txt`) y `THIRD_PARTY_NOTICES.md` antes de un uso comercial.
- Las cuantizaciones INT8 ConvRot y 4 bits pueden degradar la precisión de la transcripción frente a BF16; no se han publicado métricas comparativas.
- El repositorio está pensado para WanGP; su uso fuera de esa herramienta requerirá adaptar la carga de los ficheros separados (LM, expertos, codificador de audio, draft).
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DeepBeepMeep/Nemotron
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- WanGP (Wan2GP): https://github.com/deepbeepmeep/Wan2GP
- Licencia OpenMDW 1.1: https://huggingface.co/DeepBeepMeep/Nemotron/blob/main/nemotron_transcribe/LICENSE_NEMOTRON_TRANSCRIBE.txt
