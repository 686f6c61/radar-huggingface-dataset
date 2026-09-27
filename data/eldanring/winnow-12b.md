# EldanRing/Winnow-12B

## Resumen

Winnow-12B es un ajuste fino (fine-tune) del modelo multimodal google/gemma-4-12B-it, desarrollado por EldanRing y publicado con licencia Apache 2.0. Su rasgo diferencial no es solo el chat o la vision, sino lo que el autor denomina "decisiones tipadas" (typed decisions): el modelo responde a preguntas de tipo `noul`, `choice` y `score` sobre un estado compartido, y permite leer los logits de los tokens de respuesta sin necesidad de generar texto. El repositorio distribuye unicamente pesos en formato GGUF, sin shards de safetensors ni adaptadores LoRA separados.

El modelo tiene 11.907.350.576 parametros (~11,9 mil millones) y se sirve mediante un servidor de inferencia basado en llama.cpp, tambien del mismo autor, que expone tanto `/v1/systemone` (decisiones) como `/v1/chat/completions` (chat convencional) desde el mismo modelo cargado. La model card reporta haber sido probado con una ventana de contexto de 65.536 posiciones y entrada de imagen en una RTX 5070 Ti de 16 GB, con la variante Q8_0.

Su relevancia actual radica en dos factores: por un lado, empaqueta un modelo multimodal de ~12B en un unico fichero GGUF ejecutable en GPU de consumo; por otro, propone un patron de inferencia (prefill compartido + ramificacion de preguntas + lectura de logits) orientado a cargas de decision de baja latencia, con una mediana de 143,0 ms en peticiones cacheadas de cuatro preguntas. Los benchmarks publicos de decision que acompanan al modelo lo situan al mismo nivel que Jev 1.13 en el subconjunto publico de JevBench (85,71% en Q8 para ambos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredado de google/gemma-4-12B-it (no detallada en la model card) |
| Parametros totales | 11.907.350.576 (~11,9B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 65.536 posiciones configuradas; 65.022 posiciones verificadas con imagen (incluye 1.024 posiciones de imagen) |
| Tipos de cuantizacion | GGUF Q8_0 (8 bits) y BF16 (16 bits); proyector de vision F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el repositorio no distribuye safetensors) |

Detalle de los ficheros publicados:

| Fichero | Precision y uso | Tamano |
|---|---|---:|
| Winnow-12B-Q8_0.gguf | Q8_0, 8 bits. Recomendado para el equipo probado (RTX 5070 Ti de 16 GB) | 12,67 GB / 11,80 GiB |
| Winnow-12B-BF16.gguf | BF16, 16 bits. Para sistemas con mas memoria o con offload CPU/GPU | 23,83 GB / 22,20 GiB |
| mmproj-Winnow-12B.gguf | Proyector de vision F16, opcional. Necesario solo para entradas de imagen | 175 MB / 0,163 GiB |

## Arquitectura y entrenamiento

Winnow-12B es un fine-tune mediante LoRA sobre google/gemma-4-12B-it, con el adaptador ya fusionado en los pesos publicados: no se necesita un adaptador LoRA aparte ni un paso de conversion. Cada GGUF de modelo contiene los pesos de lenguaje, el tokenizer y la plantilla de chat; el proyector F16 aporta la capacidad de vision y es compatible tanto con la version BF16 como con la Q8_0. Los ficheros de configuracion y tokenizer del directorio raiz son activos de referencia, ya que llama.cpp carga directamente el GGUF.

El entrenamiento esta orientado a "decisiones tipadas": el modelo responde a preguntas `noul`, `choice` y `score` sobre un estado compartido, y la infraestructura de inferencia permite hacer prefill del estado una sola vez, ramificar varias preguntas y leer los logits de los tokens de respuesta sin generar texto de respuesta. La model card no ofrece informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO: esos datos no estan disponibles. Tampoco se detalla si hubo innovaciones adicionales en el mecanismo de atencion o en la decodificacion mas alla del patron de inferencia descrito.

## Capacidades

- Generacion de texto conversacional, con soporte de streaming.
- Vision: entrada de imagenes mediante el proyector `mmproj-Winnow-12B.gguf` (pipeline `image-text-to-text`).
- Decisiones tipadas: preguntas de tipo `noul`, `choice` y `score` contra un estado compartido.
- Computacion compartida: prefill unico del estado, ramificacion de preguntas y lectura de logits de tokens de respuesta sin generar texto.
- Servicio dual desde un mismo modelo cargado: `/v1/systemone` para decisiones y `/v1/chat/completions` para chat convencional.
- Contexto largo de hasta 65.536 posiciones, verificado con imagen en 65.022 posiciones (1.024 de ellas de imagen).
- Plantilla de chat incluida en el propio GGUF.
- Tool calling / function calling: no mencionado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no descrito explicitamente; el patron de ramificacion de preguntas es la capacidad mas cercana documentada.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Modo "thinking" explicito o entradas de audio: no mencionados.

## Casos de uso

- Decisiones automatizadas de baja latencia: usar `/v1/systemone` con preguntas `choice` o `score` para enrutar, clasificar o puntuar casos sin generar texto de respuesta; la mediana de 143,0 ms en cuatro preguntas cacheadas lo hace apto para servicios sincronos.
- Triaje y enrutamiento en pipelines de produccion: el prefill compartido del estado permite lanzar varias preguntas sobre el mismo contexto y leer logits, reduciendo el coste frente a repetir generaciones completas.
- Asistente conversacional con contexto largo: 65.536 posiciones permiten mantener conversaciones multi-turno o procesar documentos extensos con el endpoint `/v1/chat/completions`.
- Analisis de imagenes en local: con el proyector F16 se pueden procesar entradas `image-text-to-text` (capturas, documentos escaneados, fotografias) sin salir del equipo, util para entornos con requisitos de privacidad.
- Despliegue en estacion de trabajo con GPU de consumo: la variante Q8_0 (12,67 GB) cabe en una RTX 5070 Ti de 16 GB con offload completo, segun las mediciones del autor.
- Evaluacion y calibracion de sistemas de decision: la lectura directa de logits de tokens de respuesta facilita medir calibracion y comparar variantes sin depender de texto generado.
- Procesamiento por lotes de preguntas sobre un mismo estado: escenarios tipo scoring de candidatos, evaluacion de respuestas o clasificacion multiple sobre un contexto comun.
- Chat con vision en flujos de soporte tecnico: el modelo puede recibir una captura o diagrama junto al texto y responder en el mismo servidor que atiende las decisiones.

## Benchmarks y rendimiento

Resultados de decision publicados por el autor (campana en RTX PRO 5000 Blackwell; Jev evaluado a traves de OpenRouter sobre las mismas entradas y reglas de puntuacion):

| Modelo | JevBench subconjunto publico (231 items) | Kev-v9 clean (1.046 items) |
|---|---:|---:|
| Winnow-12B BF16 | 85,28% | 81,45% |
| Winnow-12B Q8 | 85,71% | 81,55% |
| Jev 1.13 (via OpenRouter) | 85,71% | 87,00% |

El autor precisa que Winnow Q8 iguala a Jev en ese subconjunto publico de JevBench (198 de 231 correctas) y que se trata de un resultado sobre ese subconjunto, no de una paridad universal. JevBench aqui significa exactitud en el subconjunto publico, no la puntuacion compuesta oficial de la clasificacion.

Mediciones de capacidad y tiempos en RTX 5070 Ti (offload completo de GPU, cache KV Q8, cuatro ramas de decision, una ranura de chat y planificacion de memoria exclusiva):

| Medicion | Resultado |
|---|---:|
| Capacidad de contexto configurada | 65.536 posiciones |
| Prefijo compartido verificado con imagen | 65.022 posiciones (incluye 1.024 de imagen) |
| VRAM de dispositivo maxima durante la prueba de 64K | 15,01 GiB (incluye el escritorio) |
| RAM de sistema maxima del arbol de procesos durante carga y prueba | 12,25 GiB PSS |
| Cuatro preguntas a contexto casi completo, en frio | 25,00 s |
| Misma peticion de cuatro preguntas, mediana de tres repeticiones con cache | 143,0 ms |
| Generacion con prompt corto, mediana de tres ejecuciones de 512 tokens | 55,5 tokens/s |
| Prefill de prompt largo con vision, 62.435 posiciones | 2.893,9 tokens/s |
| Generacion tras ese prompt largo, 512 tokens | 46,9 tokens/s |
| Tiempo hasta el primer token en ese prompt largo en frio | 21,75 s |

El autor advierte que son pruebas de capacidad y de tiempos separadas, no una carga simultanea. El equipo anfitrion tenia 96 GB de RAM de sistema y el PSS observado no constituye una recomendacion de RAM minima.

## Requisitos de hardware

- VRAM estimada: la variante Q8_0 ocupa 12,67 GB (11,80 GiB) en disco; el BF16 ocupa 23,83 GB (22,20 GiB). El proyector de vision suma 175 MB.
- BF16 no cabe en 16 GB de VRAM por si solo; las mediciones de offload completo del autor corresponden a Q8_0.
- GPU de referencia probada: RTX 5070 Ti de 16 GB (Q8_0, offload completo, 64K de contexto y vision) y RTX PRO 5000 Blackwell en la campana de evaluacion.
- VRAM maxima observada en la prueba de 64K: 15,01 GiB, incluyendo el escritorio. Es un margen muy ajustado en 16 GB.
- RAM de sistema: el anfitrion de pruebas tenia 96 GB; el pico observado del arbol de procesos fue de 12,25 GiB PSS, que no equivale a un minimo recomendado.
- Cabe en GPU de consumo: si, la Q8_0 en RTX 5070 Ti de 16 GB segun el autor. Para BF16 se requiere mas memoria o reparto CPU/GPU.
- Despliegue: servidor de inferencia basado en llama.cpp del propio autor (`winnow-inference`), que expone `/v1/systemone` y `/v1/chat/completions`. No se mencionan vLLM, Ollama ni TGI en la informacion disponible, por lo que su compatibilidad no esta confirmada.
- Latencia y throughput: 55,5 tokens/s en generacion con prompt corto; 46,9 tokens/s tras un prompt largo de vision; prefill de 2.893,9 tokens/s a 62.435 posiciones; 21,75 s hasta el primer token en frio con ese prompt largo.
- Nota de planificacion: en el perfil exclusivo probado, las peticiones de chat y de decision comparten pesos pero se turnan los contextos KV, y cambiar entre ellas puede expulsar un prefijo cacheado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench publico (231) | Kev-v9 clean (1.046) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Winnow-12B BF16 | ~11,9B | 65.536 posiciones | 85,28% | 81,45% | Apache 2.0 | Pesos GGUF en HuggingFace |
| Winnow-12B Q8 | ~11,9B | 65.536 posiciones | 85,71% | 81,55% | Apache 2.0 | Pesos GGUF en HuggingFace |
| Jev 1.13 | no disponible | no disponible | 85,71% | 87,00% | no disponible | Servido via OpenRouter |

La model card menciona tambien a Kev (cuyo benchmark, Kev-v9 clean, se usa como suite de evaluacion) y a Laya en el pie de una de las figuras, pero no se aportan especificaciones ni resultados de esos modelos en la informacion disponible, por lo que no se incluyen en la tabla. No se dispone de comparativas frente al modelo base google/gemma-4-12B-it en las mismas suites.

## Limitaciones y advertencias

- Riesgo de alucinacion: no se documenta ninguna evaluacion especifica de veracidad o de tasa de alucinacion; los benchmarks aportados miden exactitud en tareas de decision, no fidelidad factual.
- Sesgos: no se publica ninguna evaluacion de sesgos, toxicidad o equidad.
- Idiomas: el campo de idiomas no esta informado; no hay garantia documentada de rendimiento multilingue.
- Contexto: los 65.536 posiciones incluyen formato de prompt, posiciones de imagen, preguntas y salida generada. En el perfil exclusivo probado, chat y decisiones comparten pesos pero se turnan los contextos KV, y cambiar de carga puede invalidar un prefijo cacheado.
- Rendimiento en 16 GB: el pico de 15,01 GiB durante la prueba de 64K es ajustado; ejecutar BF16 o subir el contexto exige mas memoria o reparto CPU/GPU.
- Licencia: el repositorio declara Apache 2.0, pero al derivar de google/gemma-4-12B-it conviene revisar los terminos del modelo base antes de un uso comercial, ya que pueden imponer condiciones adicionales.
- Tool calling y agentes: no hay soporte documentado de function calling ni de flujos de agentes; cualquier uso en ese sentido requeriria validacion propia.
- Madurez del ecosistema: el modelo depende de un servidor de inferencia propio del autor y no se confirma compatibilidad con otros runners habituales.
- Comparativa de benchmarks: la paridad con Jev se limita al subconjunto publico de JevBench (231 items) y no se extiende al conjunto completo ni a la clasificacion compuesta oficial.
- Cifras de hardware: proceden de un unico equipo con 96 GB de RAM y no deben interpretarse como minimos de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EldanRing/Winnow-12B
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Descarga Winnow-12B-Q8_0.gguf: https://huggingface.co/EldanRing/Winnow-12B/resolve/main/gguf/Winnow-12B-Q8_0.gguf?download=true
- Descarga Winnow-12B-BF16.gguf: https://huggingface.co/EldanRing/Winnow-12B/resolve/main/gguf/Winnow-12B-BF16.gguf?download=true
- Descarga mmproj-Winnow-12B.gguf (proyector de vision F16): https://huggingface.co/EldanRing/Winnow-12B/resolve/main/gguf/mmproj-Winnow-12B.gguf?download=true
- Codigo de inferencia: https://github.com/EldanRing/winnow-inference
- Guia de inicio rapido: docs/QUICKSTART.md (en el repositorio)
- Informe completo de benchmarks: docs/BENCHMARKS.md (en el repositorio)
- Manifiesto de artefactos: release-manifest.json (en el repositorio)
- Sumas de verificacion: SHA256SUMS (en el repositorio)
