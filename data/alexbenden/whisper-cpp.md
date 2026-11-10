# AlexBenden/whisper.cpp

## Resumen

Este repositorio contiene la conversion a formato ggml de los modelos Whisper de OpenAI, empaquetados para su uso con la implementacion en C/C++ whisper.cpp. No se trata de un modelo nuevo entrenado por el autor del repositorio, sino de una redistribucion de los pesos oficiales de Whisper adaptados al formato que consume la libreria de inferencia ligera desarrollada por Georgi Gerganov. El repositorio agrupa toda la familia de variantes de Whisper: desde tiny hasta large-v3, incluyendo las versiones especificas para ingles (sufijo .en), la variante destilada small.en-tdrz y la version turbo de large-v3.

Whisper es un modelo de reconocimiento automatico del habla (ASR) basado en una arquitectura transformer encoder-decoder entrenada por OpenAI sobre datos debilmente supervisados a gran escala. Su relevancia practica radica en que whisper.cpp permite ejecutar estos modelos sin dependencias de Python ni de frameworks de deep learning pesados, en CPU y en GPU de gama baja, con cuantizaciones que reducen el modelo large-v3 de 2,9 GiB a 1,1 GiB sin perdida dramatica de calidad.

El repositorio ocupa 31,0 GB en total porque incluye todas las variantes y cuantizaciones en un unico espacio. La licencia declarada es MIT, heredada del codigo de whisper.cpp, si bien conviene revisar las condiciones de los pesos originales de OpenAI. No se han publicado resultados de benchmarks propios en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper de OpenAI) |
| Parametros totales | no disponible (varia por variante: tiny, base, small, medium, large) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | q5_1, q5_0, q8_0 y pesos sin cuantizar (f16/f32) |
| Idiomas soportados | no disponible en la ficha del repo (Whisper original es multilingue; variantes .en solo ingles) |
| Licencia | MIT |
| Formato de pesos | ggml (para whisper.cpp) |

## Arquitectura y entrenamiento

Whisper emplea una arquitectura transformer encoder-decoder que convierte audio en espectrogramas mel y los procesa como una secuencia de tokens de audio, generando texto de forma autorregresiva. El modelo original de OpenAI se entreno sobre cientos de miles de horas de audio debilmente supervisado y multilingue, con tareas auxiliares de deteccion de idioma, marcas de tiempo y transcripcion. Las variantes .en se entrenaron exclusivamente con audio en ingles.

Este repositorio no aporta entrenamiento nuevo: realiza la conversion de los pesos originales al formato ggml que consume whisper.cpp. La innovacion tecnica relevante es la propia libreria whisper.cpp, que implementa inferencia en C/C++ sin dependencias de PyTorch, con soporte de cuantizacion de enteros (q5_0, q5_1, q8_0), ejecucion en CPU con instrucciones SIMD y aceleracion opcional por GPU. La variante small.en-tdrz es una version destilada derivada de un trabajo externo, incluida en el conjunto de conversiones.

## Capacidades

- Transcripcion de audio a texto (ASR) en multiples idiomas con las variantes multilingues.
- Transcripcion en ingles con las variantes .en, optimizadas para ese idioma.
- Deteccion automatica de idioma en los modelos multilingues.
- Generacion de marcas de tiempo a nivel de segmento.
- Traduccion de audio a texto en ingles desde otros idiomas (capacidad heredada de Whisper).
- Ejecucion en CPU sin GPU, con cuantizacion para reducir memoria.
- Aceleracion opcional por GPU (segun compilacion de whisper.cpp).
- No soporta tool calling ni function calling: es un modelo puramente ASR.
- No dispone de modo de razonamiento explicito ni capacidades de agente.

## Casos de uso

- Transcripcion de reuniones y entrevistas: se puede ejecutar el modelo medium o large-v3 cuantizado en un portatil para generar actas con marcas de tiempo, sin enviar audio a servicios en la nube.
- Subtitulado automatico de video: las variantes small o base permiten generar subtitulos en tiempo casi real en CPU, integrables en pipelines de ffmpeg y whisper.cpp.
- Asistentes de voz en dispositivos embebidos: la variante tiny-q5_1 (31 MiB) cabe en memoria de sistemas con recursos muy limitados, como Raspberry Pi, para comandos de voz basicos.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: whisper.cpp en CPU con la variante large-v3-q5_0 (1,1 GiB) permite transcribir grandes volumenes sin coste de GPU.
- Investigacion en ASR: sirve como referencia reproducible para comparar cuantizaciones y medir el impacto de q5_0 frente a q8_0 en la calidad de transcripcion.
- Aplicaciones de accesibilidad: transcripcion en directo de audio a texto para personas con discapacidad auditiva, con la variante base o small en equipos de escritorio.
- Privacidad y cumplimiento: al ejecutarse localmente, permite transcribir audio sensible (sanitario, legal) sin salida de datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; en GPU, el modelo completo en memoria requiere aproximadamente el tamano en disco indicado (por ejemplo, large-v3 sin cuantizar 2,9 GiB, large-v3-q5_0 1,1 GiB, tiny-q5_1 31 MiB).
- GPU recomendadas: cualquier GPU compatible con la compilacion GPU de whisper.cpp; no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: si, las variantes cuantizadas de tiny, base, small y medium caben en GPUs de consumo; large-v3-q5_0 (1,1 GiB) tambien es viable en GPUs con 4 GB o mas.
- Opciones de despliegue: whisper.cpp (principal), con bindings disponibles en el ecosistema; no se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Whisper (este repo, ggml) | no disponible por variante | ventanas de 30 s de audio | MIT | ggml | Hugging Face, whisper.cpp |
| Whisper original (OpenAI) | no disponible | ventanas de 30 s de audio | MIT (pesos) | PyTorch | Hugging Face, API OpenAI |
| Otros ASR open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparativas cuantitativas en la informacion proporcionada para establecer una comparacion con alternativas como wav2vec 2.0 o modelos ASR comerciales.

## Limitaciones y advertencias

- Es una conversion de pesos, no un modelo nuevo; cualquier limitacion de Whisper original se hereda (errores en audio con ruido, acentos marcados o solapamiento de hablantes).
- Riesgo de alucinacion: Whisper puede generar texto no presente en el audio, especialmente en silencios o musica.
- La ficha del repositorio no declara los idiomas soportados; las variantes .en solo transcriben ingles.
- La licencia MIT se declara en el repo, pero conviene verificar las condiciones de uso de los pesos originales de OpenAI para uso comercial.
- El repositorio ocupa 31,0 GB; descargar todo el conjunto no es necesario, basta con la variante y cuantizacion deseadas.
- No soporta tool calling, agentes ni razonamiento multi-paso; su unico proposito es ASR.
- Las cuantizaciones q5_0 y q5_1 reducen calidad frente a q8_0 o pesos sin cuantizar; conviene validar en el dominio concreto de uso.
- No hay datos publicados de latencia ni throughput en la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AlexBenden/whisper.cpp
- Repositorio oficial de conversiones: https://huggingface.co/ggerganov/whisper.cpp/tree/main
- Proyecto whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Modelos de whisper.cpp: https://github.com/ggerganov/whisper.cpp/tree/master/models
