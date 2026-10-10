# nace-ai/drex-v1.5

## Resumen

Drex v1.5 es un modelo de decisión desarrollado por Nace.AI. A diferencia de un modelo generativo convencional, recibe un estado (texto o JSON) junto con preguntas tipadas (`choice`, `noul` y `score` ordinal) y devuelve, en una única pasada forward por pregunta, una probabilidad para cada opción. No genera texto: puntúa alternativas. Se sirve mediante una API compatible con TypeSafe en el endpoint `/v1/systemone`, con el mismo formato de petición y respuesta que la API alojada de Drex y que el modelo abierto Drex DLM.

El backbone es `Qwen3_5ForCausalLM` de 32 capas con atención híbrida (tres capas de atención lineal por cada capa de atención completa), sobre el modelo base XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B. El checkpoint tiene 8.953.803.264 parámetros (unos 8,95B) en pesos bf16, con un tamaño en disco de aproximadamente 18 GB. Se añade una cabeza de puntero (`head.pt`) que puntúa cada opción a partir de los estados ocultos del backbone.

La longitud de contexto por defecto es de 16.384 tokens, ampliable hasta 131.072, con precisión reportada sobre documentos largos de hasta 128k tokens. El modelo ocupa el primer puesto en el Decision Index 0.2.1 con un índice de 58,28, por delante de Jev 1.13.0 (57,91). Es relevante porque traslada el paradigma "System One" (decisión directa sin generación autoregresiva) a un modelo de ~9B ejecutable en una sola GPU de 24 GB o, en cuantización Q8_0, en hardware de consumo y Apple Silicon.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `Qwen3_5ForCausalLM`, 32 capas, atención híbrida (3 capas de atención lineal por cada capa de atención completa) más cabeza de puntero (`head.pt`) |
| Parametros totales | 8.953.803.264 (unos 8,95B) |
| Longitud de contexto | 16.384 tokens por defecto; hasta 131.072; precisión reportada hasta 128k |
| Tipos de cuantizacion | bf16 (pesos nativos), GGUF Q8_0 (unos 9,5 GB); conversión vía `convert_hf_to_gguf.py --no-mtp` |
| Idiomas soportados | no disponible |
| Licencia | nace-ai-open-rail-m (etiquetada como `other` en HuggingFace; texto en el fichero LICENSE) |
| Formato de pesos | safetensors (repo de 17,9 GB); GGUF para llama.cpp y Ollama |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B |
| Cabeza adicional | `head.pt` (puntuación de opciones) |
| Tipo de modelo | decision-model, system-one |
| Pipeline declarado | no disponible |
| Descargas / likes | 37 / 11 |
| Fechas | creado el 2026-09-28; actualizado el 2026-10-09 |

## Arquitectura y entrenamiento

El modelo parte del backbone `Qwen3_5ForCausalLM`, una arquitectura transformer de 32 capas que combina atención lineal y atención completa en proporción 3:1 (tres capas de atención lineal por cada capa de atención completa). Sobre los estados ocultos de ese backbone se monta una cabeza de puntero (`head.pt`) que asigna una puntuación a cada opción de la pregunta tipada. La inferencia no es autoregresiva en el sentido generativo: se realiza una única pasada forward por pregunta y se devuelven las probabilidades de todas las opciones a la vez.

El modelo se presenta como un derivado afinado (finetune) de XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, que a su vez es un destilado de la familia Qwen de 9B. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales más allá de la atención híbrida del backbone y la cabeza de decisión. La model card incluye `private: true` en el front matter, en contradicción con su disponibilidad pública en HuggingFace.

## Capacidades

- Decisión con probabilidades: dado un estado (texto o JSON) y preguntas tipadas, devuelve una probabilidad por opción en una sola pasada forward por pregunta.
- Tipos de pregunta soportados: `choice` (elección entre opciones), `noul` y `score` ordinal.
- Sin generación de texto: no produce secuencias; únicamente puntúa y clasifica.
- Procesamiento por lotes: admite el formato `{"requests": [...]}` para puntuar varias decisiones en una misma llamada.
- API servible: endpoint `POST /v1/systemone` compatible con TypeSafe, sin cabecera `Authorization`; `GET /health` devuelve el estado del modelo.
- Contexto largo: manejo de documentos de hasta 128k tokens con preguntas tipadas, según la tabla de benchmarks de contexto largo.
- Selección de herramientas: el modelo puntúa con 75,3 en el área "Tools" del Decision Index 0.2.1, la puntuación más alta de sus áreas evaluadas.
- Capacidades multilingües: el área "Language" obtiene 62,5 en el Decision Index, pero no se declaran los idiomas concretos soportados.
- Uso en juegos y entornos de decisión secuencial: evaluado en ocho juegos de OpenSpiel frente a Jev.
- Modo "thinking": no aplica; no es un modelo generativo con cadena de pensamiento.
- Visión y audio: no disponibles.

## Casos de uso

- Selección de herramientas en agentes: dado un estado de conversación y un catálogo de herramientas, el modelo puntúa cada opción y permite enrutar la llamada correcta sin coste de generación; su área "Tools" (75,3) es la más fuerte del modelo.
- Clasificación con confianza calibrada: en lugar de una etiqueta única, se obtiene una distribución de probabilidad sobre las clases, útil para umbralizar decisiones o derivar a revisión humana.
- Anotación y etiquetado de datos a escala: puntuar pares estado-opción para generar etiquetas con nivel de confianza, aprovechando endpoints por lotes (`{"requests": [...]}`).
- Análisis de documentos largos: con contexto de hasta 128k tokens, permite responder preguntas tipadas sobre contratos, informes o expedientes sin trocear el documento; la precisión reportada es del 93,4% en el rango 32k-128k.
- Simulación y evaluación de políticas en juegos: integrable en entornos OpenSpiel u otros simuladores donde la decisión debe resolverse en una sola pasada, con latencia mediana de 0,65 s en el rango 8k-32k.
- Puntuación ordinal y ranking: con preguntas de tipo `score`, ordenar candidatos (respuestas, propuestas, configuraciones) en lugar de elegir uno solo.
- Modelo juez o función de recompensa en pipelines de RL: al devolver probabilidades en una pasada forward, es más barato que un modelo generativo usado como evaluador.
- Despliegue como servicio interno de decisión: el servidor `serve.py` y el binario `llama-server` exponen el mismo contrato `/v1/systemone`, por lo que puede sustituirse el backend sin cambiar los clientes.

## Benchmarks y rendimiento

Decision Index 0.2.1 (kit oficial, suite completa). Las columnas de área son habilidad corregida por azar × 100.

| Puesto | Modelo | Index | Raw | Knowledge & Reasoning | Language | Retrieval | Tools | Arts |
|---|---|---|---|---|---|---|---|---|
| 1 | Drex v1.5 | 58,28 | 67,80 | 44,2 | 62,5 | 62,0 | 75,3 | 45,1 |
| 2 | Jev 1.13.0 | 57,91 | 68,09 | 51,4 | 62,0 | 55,4 | 75,1 | 37,7 |
| 3 | Surogate Rune 26B-A4B v3 | 57,44 | 67,30 | 43,4 | 63,1 | 63,5 | 71,2 | 41,9 |
| 4 | Decider chat · Gemma-4-31B | 57,33 | 67,22 | 44,3 | 60,4 | 63,1 | 75,6 | 38,3 |
| 5 | AutoJev-27B | 56,40 | 66,89 | 40,9 | 63,5 | 54,9 | 79,3 | 39,4 |

Según la model card, Drex v1.5 supera a Jev en 21 de los 38 benchmarks del índice.

JevBench (231 elementos públicos):

| Modelo | Precisión | Easy | Standard | Hard |
|---|---|---|---|---|
| Jev 1.13.0 | 87,0% | 100,0% | 98,6% | 73,9% |
| Drex v1.5 | 86,2% | 100,0% | 95,8% | 73,9% |
| decider-4b v2.1 | 83,1% | 100,0% | 98,6% | 65,8% |

Contexto largo (documentos largos con preguntas tipadas; se respondió a todas las peticiones):

| Longitud de contexto | Precisión | Truncado a 8k | Latencia mediana |
|---|---|---|---|
| 8k – 32k tokens | 89,5% | 76,5% | 0,65 s |
| 32k – 128k tokens | 93,4% | 78% | 2,0 s |

Arena de juego frente a Jev (ocho juegos de OpenSpiel, 32 partidas cada uno: 16 aperturas × ambos colores): 122 victorias, 47 tablas, 87 derrotas (56,8%).

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generativos estándar en la información disponible, lo cual es coherente con que el modelo no genere texto.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 18 GB de pesos; el uso de memoria crece con la longitud del documento.
- VRAM en Q8_0 GGUF: aproximadamente 9,5 GB de pesos, más el estado compartido y la caché KV.
- GPU validadas: NVIDIA A10G de 24 GB (instancia AWS g5.2xlarge, 8 vCPU AMD EPYC 7R32, 32 GiB de RAM, Ubuntu 24.04, CUDA 13.2), con respuestas idénticas en bf16 y Q8_0 contra el servidor Python.
- Apple Silicon: validado en Apple M5 Pro (CPU de 18 núcleos, GPU de 20 núcleos, 48 GB de memoria unificada, macOS 26.5.2) con Q8_0, dando las mismas respuestas en Metal y en CPU.
- CPU: soportada mediante llama.cpp (sin `-ngl`) y Ollama.
- GPU de consumo: no se documenta explícitamente. Con unos 9,5 GB de pesos en Q8_0, una GPU con 12-16 GB de VRAM tendría margen limitado una vez añadidos estado y caché KV; se trata de una estimación, no de un dato verificado por el autor.
- Opciones de despliegue: `inference.py` (CLI), `serve.py` (servidor HTTP Python con `POST /v1/systemone`), llama.cpp en la rama `drex-v1.5` (con `--embedding --pooling none -np 2`, y `-ngl 99` para GPU) y Ollama mediante el fork de Nace con `llama-server` de esa misma rama.
- Contexto en llama.cpp: con `-np 2 -c 32768` cada slot recibe 16.384 tokens; para llegar a 131.072 hay que usar `SYSTEMONE_CONTEXT=131072` y `-c 262144`.
- Latencia: mediana de 0,65 s en documentos de 8k-32k tokens y de 2,0 s en 32k-128k, según la model card.
- Throughput: no disponible.
- Frameworks no documentados: no se mencionan vLLM ni TGI.
- Seguridad de despliegue: el servidor escucha en `127.0.0.1` y no requiere autenticación; el autor recomienda mantenerlo así o anteponer autenticación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index 0.2.1 | JevBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Drex v1.5 | 8,95B | 16.384 por defecto, hasta 131.072 | 58,28 | 86,2% | nace-ai-open-rail-m | Pesos abiertos en HuggingFace |
| Jev 1.13.0 | no disponible | no disponible | 57,91 | 87,0% | no disponible | No se especifica en la información disponible |
| Surogate Rune 26B-A4B v3 | 26B totales, 4B activos (según nombre) | no disponible | 57,44 | no disponible | no disponible | No se especifica en la información disponible |
| Decider chat · Gemma-4-31B | 31B | no disponible | 57,33 | no disponible | no disponible | No se especifica en la información disponible |
| AutoJev-27B | 27B | no disponible | 56,40 | no disponible | no disponible | No se especifica en la información disponible |
| decider-4b v2.1 | 4B (según nombre) | no disponible | no disponible | 83,1% | no disponible | No se especifica en la información disponible |

Drex v1.5 es el único de los modelos comparados para el que la información disponible detalla tamaño, contexto, licencia y formato de pesos. Destaca por ser el de menor número de parámetros del grupo con el índice más alto, y por el mejor rendimiento en el área "Arts" (45,1) frente a sus competidores directos.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni respuestas en lenguaje natural, solo probabilidades sobre opciones tipadas. No puede usarse para chat, redacción ni generación de código.
- Riesgo de decisión errónea: aunque no "alucina" texto, sí puede asignar probabilidades altas a opciones incorrectas; conviene calibrar umbrales y no confiar ciegamente en la opción de mayor probabilidad.
- Idiomas no declarados: la información disponible no especifica qué lenguas soporta, pese a existir una puntuación de área "Language" de 62,5 en el Decision Index.
- Licencia restrictiva potencial: la licencia es `nace-ai-open-rail-m` (etiquetada como `other`), con el texto en el fichero LICENSE del repositorio. No se detallan en la información disponible las condiciones exactas de uso comercial, por lo que hay que revisar el fichero antes de desplegar en producción.
- Marca `private: true`: la model card incluye esta etiqueta en el front matter, en contradicción con la disponibilidad pública del repositorio; conviene verificar la situación real antes de depender del modelo.
- Contexto predeterminado limitado: 16.384 tokens por defecto; alcanzar 131.072 exige configuración explícita y consume mucha más memoria, que crece con la longitud del documento.
- Rendimiento débil en razonamiento y conocimiento: el área "Knowledge & Reasoning" obtiene 44,2, la más baja del modelo y por debajo de Jev (51,4), Surogate Rune (43,4) y Decider chat (44,3); el modelo es claramente más fuerte en herramientas y recuperación que en razonamiento puro.
- Requisitos de GPU en la ruta Python: `inference.py` y `serve.py` necesitan una GPU CUDA; en CPU y Apple Silicon hay que pasar por llama.cpp u Ollama con convertidores propios.
- Dependencia de forks: tanto llama.cpp como Ollama requieren ramas específicas mantenidas por Nace, lo que añade riesgo de mantenimiento y divergencia respecto a los proyectos upstream.
- Servidor sin autenticación: el endpoint `/v1/systemone` no requiere cabecera `Authorization`; exponerlo fuera de `127.0.0.1` sin un proxy autenticado deja el servicio abierto.
- Adopción muy baja: 37 descargas y 11 likes, sin validación independiente de terceros más allá de los benchmarks publicados por el propio autor.
- Evaluación limitada frente a Jev: en la arena de juego el resultado global es del 56,8% de victorias, con 87 derrotas en 256 partidas, lo que indica un margen estrecho y dependiente del juego.
- Benchmarks generativos ausentes: no hay MMLU, HumanEval ni GSM8K, de modo que no es comparable con modelos generativos de propósito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nace-ai/drex-v1.5
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Sitio de Nace.AI: https://www.nace.ai/
- Repositorio Drex: https://github.com/nace-ai/drex-decision-models
- Drex DLM: https://huggingface.co/nace-ai/drex-dlm
- Documentación de la API alojada: https://drex.nace.ai/docs
- Agent skill de Drex: https://github.com/nace-ai/drex-agent-skill
- Fork de llama.cpp (rama drex-v1.5): https://github.com/nace-ai/llama.cpp
- Fork de Ollama (rama drex-v1.5): https://github.com/nace-ai/ollama
- Fichero de licencia: LICENSE dentro del repositorio de HuggingFace

Los resultados de búsqueda web devueltos para esta consulta hacen referencia a la clasificación estadística de actividades económicas NACE (Eurostat, INSEE, Wikipedia) y a la asociación AMPP, y no guardan relación con el modelo nace-ai/drex-v1.5, por lo que no se incluyen como fuentes.
