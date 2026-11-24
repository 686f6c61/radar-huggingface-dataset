# eniga/qwen3-asr-1.7b-bf16

## Resumen

Qwen3-ASR-1.7B es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Qwen (Alibaba) y publicado originalmente como `Qwen/Qwen3-ASR-1.7B-hf`. Esta ficha concreta, `eniga/qwen3-asr-1.7b-bf16`, no es un modelo nuevo ni un ajuste fino: es el mismo checkpoint empaquetado en formato Radiance (`.rad`), un contenedor de inferencia orientado a GPUs AMD y CPUs con AVX2/AVX-512. El autor del empaquetado es el usuario `eniga`, y el artefacto se genero con la herramienta `rad-convert` de la imagen `stilldeadcode/radiance` 2.2.0.

El modelo resuelve transcripcion de audio a texto en 30 idiomas y expone una API compatible con OpenAI (`/v1/audio/transcriptions`) ademas de un endpoint de streaming en tiempo real (`/v1/realtime`). Con 1.700 millones de parametros en precision bf16, esta pensado para despliegues donde el coste por hora de GPU es el factor dominante: cabe en una sola GPU de consumo o profesional de gama media-alta.

Su relevancia practica es doble. Por un lado, demuestra que el ecosistema AMD ROCm ya dispone de una via de servicio lista para produccion con modelos ASR de tamano medio. Por otro, el formato propietario del contenedor implica que el fichero no carga en `transformers`, `vLLM` ni `llama.cpp`, lo que restringe seriamente su portabilidad. Es un artefacto para un runtime concreto, no un checkpoint universal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR; transformer orientado a ASR) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 sin cuantizar (unico formato en este repo) |
| Idiomas soportados | 30 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | contenedor Radiance (`.rad`), 4,7 GB; no compatible con safetensors, GGUF ni transformers |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, la composicion del dataset de entrenamiento ni el proceso de alineacion (RLHF/DPO) en la informacion proporcionada. El modelo base es `Qwen/Qwen3-ASR-1.7B-hf`, de la familia Qwen3, y la model card del empaquetado no reproduce detalles de entrenamiento. Lo unico verificable es el tamano (1.7B parametros) y la modalidad (audio a texto).

La innovacion tecnica relevante en este repositorio no esta en el modelo sino en el runtime: Radiance empaqueta los pesos en bf16 nativo dentro de un contenedor optimizado para ROCm, con soporte de tensor parallelism (`tp: 1` en la configuracion de ejemplo) y un limite de secuencias concurrentes (`max-num-seqs: 16`) que en el caso de ASR en vivo equivale al numero maximo de sesiones simultaneas, ya que cada sesion ocupa una secuencia. El autor indica que servir directamente el directorio del checkpoint con Radiance 2.2.0 evita la conversion en tiempo de carga, por lo que el empaquetado solo ahorra ese paso.

## Capacidades

- Transcripcion de audio a texto (ASR) en 30 idiomas.
- Endpoint HTTP compatible con OpenAI para transcripciones (`/v1/audio/transcriptions`), lo que facilita sustituir servicios de terceros sin reescribir clientes.
- Transcripcion en streaming en tiempo real mediante `/v1/realtime`.
- Gestion de multiples sesiones concurrentes: hasta 16 secuencias simultaneas segun la configuracion de ejemplo.
- Ejecucion en GPUs AMD via ROCm y en CPUs con extensiones AVX2/AVX-512 (`kernels: libavx`).
- No se documentan capacidades de vision, audio generativo, tool calling ni razonamiento multi-paso; es un modelo especializado exclusivamente en reconocimiento del habla.

## Casos de uso

- Subtitulado automatico de video bajo demanda: el modelo transcribe clips cortos en 1,2-1,3 s en una Radeon AI PRO R9700, lo que permite procesar lotes de videos en pipelines por lotes sin cuello de botella en la etapa de ASR.
- Transcripcion de reuniones y actas: con 30 idiomas y API compatible con OpenAI, se puede integrar en herramientas de videoconferencia que ya hablan el protocolo de OpenAI, sustituyendo el backend sin tocar el codigo cliente.
- Atencion al cliente con voz: el endpoint `/v1/realtime` permite alimentar un pipeline de voz a texto en vivo sobre el que montar un LLM y un TTS; las 16 sesiones concurrentes por instancia acotan el dimensionamiento.
- Accesibilidad para contenido audiovisual: generacion de subtitulos para personas con discapacidad auditiva en emisiones o repositorios de video, con despliegue en hardware AMD ya presente en el centro de datos.
- Archivado y busqueda de audio: transcripcion masiva de grabaciones (llamadas, podcasts, clases) para indexarlas y hacerlas buscables, aprovechando el coste por token bajo de un modelo de 1.7B.
- Despliegue en infraestructura AMD sin CUDA: organizaciones con flotas ROCm o con CPUs AVX-512 que necesitan ASR local sin depender de GPUs NVIDIA; en CPU un clip de 7 s tarda unos 3 s, suficiente para procesamiento por lotes no interactivo.
- Prototipado y evaluacion de ASR en local: al caber en una unica GPU de consumo o en CPU, sirve para comparar calidad de transcripcion antes de comprometerse con un servicio en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (WER, MMLU u otros) en la informacion disponible. Los unicos datos de rendimiento medidos son de latencia de inferencia, aportados por el autor del empaquetado:

| Escenario | Hardware | Clip de 7 s | Notas |
|---|---|---|---|
| GPU AMD | Radeon AI PRO R9700 | 1,2-1,3 s | Incluye carga en frio; 7,9 GiB de memoria |
| CPU | Core Ultra 7 270K (`kernels: libavx`) | ~3 s | Sin GPU |

No se dispone de datos de throughput agregado (transcripciones por segundo con 16 sesiones concurrentes) ni de comparaciones de calidad frente a otros modelos ASR.

## Requisitos de hardware

- VRAM estimada: 7,9 GiB en una Radeon AI PRO R9700 con la configuracion de ejemplo (`tp: 1`, `max-num-seqs: 16`). El fichero en disco ocupa 4,7 GB, por lo que el consumo en memoria incluye overhead del runtime.
- GPU recomendadas: Radeon AI PRO R9700 (medida por el autor); en general, GPUs AMD con soporte ROCm y al menos 8-10 GiB de VRAM para margen. No se documentan pruebas en GPUs NVIDIA.
- GPU de consumo: por el perfil de memoria (inferior a 8 GiB), es plausible en GPUs de consumo con 8 GiB o mas, aunque no hay mediciones publicadas que lo confirmen.
- CPU: funciona en CPUs con AVX2/AVX-512 mediante `kernels: libavx`; el autor cita un Core Ultra 7 270K con unos 3 s por clip de 7 s.
- Opciones de despliegue: exclusivamente el servidor Radiance 2.2.0 (imagen `stilldeadcode/radiance`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia: 1,2-1,3 s por clip de 7 s en R9700 (incluyendo carga en frio); ~3 s en CPU. Throughput agregado no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. A modo de encuadre cualitativo:

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B (este empaquetado) | 1,7B | no disponible | `.rad` (Radiance) | Apache-2.0 | Radiance 2.2.0 (ROCm/CPU AVX) |
| Qwen/Qwen3-ASR-1.7B-hf (original) | 1,7B | no disponible | safetensors (previsible) | Apache-2.0 | transformers, vLLM, llama.cpp |
| Alternativas ASR de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La diferencia practica frente al checkpoint original no esta en el modelo sino en el runtime: el original es portable, este empaquetado esta atado a Radiance.

## Limitaciones y advertencias

- Portabilidad nula: el fichero `.rad` no carga en transformers, vLLM ni llama.cpp. Migrar a otro runtime exige volver al checkpoint original `Qwen/Qwen3-ASR-1.7B-hf`.
- Dependencia de un runtime de nicho: Radiance 2.2.0 es un proyecto pequeno (alojado en Codeberg) y su continuidad no esta garantizada; conviene evaluar el riesgo de mantenimiento antes de produccion.
- Sesgos: no documentados en la informacion disponible. Como todo modelo ASR, es esperable un rendimiento desigual entre idiomas, acentos y condiciones acusticas, pero no hay datos publicados que lo cuantifiquen.
- Alucinacion en transcripcion: no hay informacion sobre tasas de insercion de texto o errores en audio con ruido, silencios o habla solapada.
- Idiomas: se anuncian 30 idiomas, pero no se detalla la lista ni la calidad por idioma.
- Contexto: no disponible; no se especifica la duracion maxima de audio por peticion.
- Licencia: Apache-2.0 permite uso comercial, pero se remite a la model card de Qwen como licencia aplicable al modelo base; conviene revisar esa card para condiciones adicionales.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad sobre el artefacto.
- Rendimiento medido por el propio autor del empaquetado, sin verificacion independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eniga/qwen3-asr-1.7b-bf16
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Proyecto Radiance: https://codeberg.org/StillDeadcode/radiance
