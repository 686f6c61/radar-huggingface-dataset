# EldanRing/Winnow-12B

## Resumen

Winnow-12B es un ajuste fino (finetune) del modelo Gemma 4 12B IT de Google, desarrollado por EldanRing y orientado a la toma de decisiones tipadas (typed decisions) en inferencia local. A diferencia de un modelo conversacional al uso, Winnow está diseñado para recibir un estado compartido y un conjunto de preguntas con opciones de respuesta conocidas, y devolver puntuaciones sobre esas opciones a través del endpoint `/v1/systemone` del servidor Winnow, sin generar una explicación en lenguaje natural. El mismo modelo cargado atiende también chat ordinario mediante `/v1/chat/completions` y acepta entrada de imagen.

El modelo se distribuye exclusivamente en formato GGUF (Q8_0, BF16 y NVFP4), junto con un proyector de visión F16 separado, y está pensado para ejecutarse en hardware de consumo. La model card reporta un perfil medido en una RTX 5070 Ti de 16 GB con contexto de 65.536 posiciones, visión activada y una VRAM pico de 15,01 GiB, lo que lo sitúa en la franja de modelos de 12B desplegables en una única GPU consumer de gama alta.

La relevancia actual del modelo radica en su enfoque: en lugar de competir en generación abierta, propone un paradigma de "decisiones tipadas" con tres modos (`noul` para sí/no, `choice` para opciones nombradas y `score` para niveles ordenados), reutilización de prefijo en caché y un modo opcional de razonamiento adaptativo. Los benchmarks publicados lo comparan con el modelo propietario Jev 1.13 servido vía OpenRouter, con resultados cercanos en el subconjunto público de JevBench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 12B IT); soporte de visión mediante proyector multimodal |
| Parametros totales | 12B (nominal, segun nombre del modelo y modelo base); el campo safetensors del repo indica 422.857.220, discrepancia no aclarada en la informacion disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 posiciones configuradas y verificadas en el perfil Q8 (65.022 posiciones de prefijo compartido con imagen, incluidas 1.024 posiciones de imagen) |
| Tipos de cuantizacion | Q8_0, BF16, NVFP4; cache K/V en F16 por defecto, con override Q8 (`--cache q8_0`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0, BF16, NVFP4) + proyector de visión `mmproj` en F16 |

## Arquitectura y entrenamiento

Winnow-12B es un finetune del modelo base `google/gemma-4-12B-it`, según declara la model card (`base_model_relation: finetune`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El modelo se distribuye como un merge completo en GGUF, sin necesidad de descargar un adaptador separado ni el modelo base.

La innovación técnica principal no está en la arquitectura del transformer, sino en la interfaz de inferencia: el servidor Winnow expone decisiones tipadas con tres modos (`noul`, `choice`, `score`), permite compartir un prefill de estado entre múltiples preguntas y reutilizar prefijos en caché. Adicionalmente, el modelo soporta un modo de razonamiento adaptativo que genera contexto antes de volver a puntuar la pregunta, y un mecanismo de decodificación especulativa (MTP) que utiliza un asistente de 12B emparejado (`Gemma-4-12B-IT-Assistant-BF16.gguf`) y comparte la caché K/V del modelo objetivo. El razonamiento adaptativo, según la confirmación en Q8, movió la precisión/consenso de 62,50% a 64,06% (intervalo de cambio pareado del 95%: −2,34 a +5,47 pp), empeoró la NLL y elevó la latencia media de CLI de 198 a 743 ms.

## Capacidades

- Toma de decisiones tipadas: puntuación de opciones con respuesta conocida en modos sí/no (`noul`), elección entre opciones nombradas (`choice`) y niveles ordenados (`score`).
- Chat conversacional ordinario mediante el endpoint `/v1/chat/completions` desde el mismo modelo cargado.
- Entrada de imagen (pipeline `image-text-to-text`) con proyector de visión F16 compatible con las tres cuantizaciones.
- Razonamiento adaptativo opcional: genera contexto antes de volver a puntuar una pregunta.
- Decodificación especulativa (MTP) para generación de chat usando un asistente de 12B emparejado.
- Reutilización de prefijo en caché y estado compartido entre múltiples preguntas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el modo de razonamiento adaptativo es el mecanismo más cercano descrito.

## Casos de uso

- Clasificación y enrutamiento de tickets de soporte: dado un estado con el texto del ticket y un conjunto de categorías conocidas, el modelo puntúa cada opción en modo `choice` y devuelve la categoría sin generar explicación, reduciendo latencia y coste frente a un modelo generativo.
- Moderación de contenido con decisiones binarias: uso del modo `noul` para resolver preguntas del tipo "¿infringe esta política?" sobre lotes de elementos con un estado compartido y prefijo cacheado.
- Puntuación de calidad o relevancia ordenada: modo `score` para asignar niveles ordenados (por ejemplo, relevancia de resultados de búsqueda o calidad de una respuesta) reutilizando el prefill del estado entre ítems.
- Asistente de chat local en escritorio: el endpoint `/v1/chat/completions` permite conversaciones multi-turno con hasta 65.536 posiciones de contexto en una GPU consumer de 16 GB, adecuado para entornos sin conexión o con requisitos de privacidad.
- Análisis de documentos con imagen: la combinación de contexto largo y proyector de visión permite procesar capturas, formularios escaneados o diagramas junto con preguntas tipadas sobre su contenido.
- Servicio de decisiones de alto rendimiento: con NVFP4 y cuatro peticiones concurrentes se midieron 4,98 decisiones/s frente a 3,43 decisiones/s en Q8, lo que lo hace apto para servicios de clasificación con throughput moderado en una sola GPU.
- Evaluación automática de respuestas en pipelines de CI: el modo de decisión tipada permite comparar salidas de modelos contra criterios predefinidos sin depender de generación libre.

## Benchmarks y rendimiento

| Modelo | JevBench subconjunto público (231 items) | Kev-v9 clean (1.046 items) |
|---|---:|---:|
| Winnow-12B BF16 | 85,28% | 81,45% |
| Winnow-12B Q8 | 85,71% | 81,55% |
| Jev 1.13 (hosted via OpenRouter) | 85,71% | 87,00% |

Comparativa histórica Q8 frente a NVFP4 en panel emparejado:

| Panel | Q8 GGUF | NVFP4 GGUF |
|---|---:|---:|
| Jev público, 231 decisiones | 198/231 (85,71%) | 193/231 (83,55%) |
| Kev-clean, 1.046 decisiones | 852/1.046 (81,45%) | 814/1.046 (77,82%) |
| Acuerdo con profesor tipado, 2.000 decisiones / 400 grupos | 1.398/2.000 (69,90%) | 1.412/2.000 (70,60%) |

Mediciones de rendimiento en RTX 5070 Ti 16 GB (Q8, KV Q8, offload completo a GPU, proyector emparejado):

| Medición | Resultado |
|---|---:|
| Capacidad de contexto configurada | 65.536 posiciones |
| Prefijo compartido verificado con imagen | 65.022 posiciones (incl. 1.024 de imagen) |
| VRAM pico observada | 15,01 GiB |
| Cuatro preguntas a contexto casi completo, en frío | 25,00 s |
| Misma petición, mediana de tres repeticiones en caché | 143,0 ms |
| Generación con prompt corto, mediana de tres ejecuciones de 512 tokens | 55,5 tokens/s |
| Throughput NVFP4 (4 concurrentes, 4K decisión / 16K chat) | 4,98 decisiones/s (9.229 MiB pico) |
| Throughput Q8 (mismas condiciones) | 3,43 decisiones/s (13.529 MiB pico) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: Q8_0 ocupa 12,67 GB (11,80 GiB) de pesos; BF16 ocupa 23,83 GB (22,20 GiB) y excede por sí solo los 16 GB de VRAM; NVFP4 ocupa 8,16 GB (7,60 GiB); el proyector de visión añade 175 MB.
- Perfil medido: RTX 5070 Ti de 16 GB con Q8, KV Q8, offload completo y visión, con pico de 15,01 GiB. BF16 requiere sistemas con más memoria o offload CPU/GPU.
- GPU recomendadas: RTX 5070 Ti 16 GB (perfil verificado); para BF16 se necesitan GPUs con más de 24 GB (A100, H100, RTX 4090/5090 con offload parcial). No se han publicado mediciones para estas GPUs en la información disponible.
- Cabe en GPU consumer: sí, en Q8_0 y NVFP4 dentro de 16 GB; NVFP4 está orientado a presets Linux/CUDA con contexto de 8K para texto y visión.
- Opciones de despliegue: servidor Winnow (`winnow-inference`) con endpoints `/v1/systemone` y `/v1/chat/completions`; presets de runtime documentados en `docs/RUNTIME-PROFILES.md`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible; la model card advierte que los resultados GGUF no se transfieren a backends NVFP4 de HF/vLLM.
- Latencia y throughput: 55,5 tokens/s en generación de prompt corto (512 tokens, mediana de tres); 143,0 ms en caché para cuatro preguntas a contexto casi completo; 3,43–4,98 decisiones/s según cuantización con cuatro peticiones concurrentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench público | Kev-clean | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Winnow-12B Q8 | 12B | 65.536 | 85,71% | 81,55% | Apache 2.0 | GGUF en Hugging Face |
| Winnow-12B BF16 | 12B | 65.536 | 85,28% | 81,45% | Apache 2.0 | GGUF en Hugging Face |
| Jev 1.13 | no disponible | no disponible | 85,71% | 87,00% | propietaria | hosted via OpenRouter |
| Gemma 4 12B IT (base) | 12B | no disponible | no disponible | no disponible | no disponible en la información | Hugging Face (Google) |

La model card menciona también comparaciones gráficas con "Kev" y "Laya", pero no se proporcionan sus especificaciones ni resultados numéricos en la información disponible.

## Limitaciones y advertencias

- El campo de parámetros totales del repo safetensors (422.857.220) no coincide con el tamaño nominal de 12B del nombre y del modelo base; la discrepancia no se explica en la información disponible.
- Los resultados de benchmarks JevBench y Kev corresponden a paneles usados durante el desarrollo, según admite la propia model card; JevBench reporta precisión del subconjunto público, no la puntuación compuesta del leaderboard.
- Los resultados BF16 proceden de una exportación GGUF anterior; la procedencia exacta se documenta en `release-manifest.json` y `docs/BENCHMARKS.md`.
- El recuento de Kev en Q8 de la comparativa histórica difiere del de la campaña de release principal (81,45% frente a 81,55%), lo que indica variabilidad entre paneles.
- NVFP4 reduce memoria y mejora throughput, pero pierde precisión verificada en Jev y Kev (83,55% y 77,82%) frente a Q8.
- El razonamiento adaptativo no mejora de forma estadísticamente concluyente (intervalo de cambio pareado que cruza cero), empeora la NLL y multiplica por más de tres la latencia (198 → 743 ms).
- Chat y decisiones comparten contextos K/V en el perfil medido; alternar entre ambos puede expulsar el prefijo cacheado.
- No se dispone de información sobre sesgos, riesgo de alucinación específico, idiomas soportados ni restricciones adicionales de la licencia Apache 2.0 más allá de las estándar.
- Los resultados GGUF no son transferibles a backends NVFP4 de HF/vLLM, según advierte la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EldanRing/Winnow-12B
- Repositorio del servidor de inferencia: https://github.com/EldanRing/winnow-inference
- Guía de inicio rápido: https://github.com/EldanRing/winnow-inference/blob/main/docs/QUICKSTART.md
- Referencia de la API: https://github.com/EldanRing/winnow-inference/blob/main/docs/API.md
- Perfiles de runtime: https://github.com/EldanRing/winnow-inference/blob/main/docs/RUNTIME-PROFILES.md
- Informe de benchmarks: https://huggingface.co/EldanRing/Winnow-12B/blob/main/docs/BENCHMARKS.md
- Manifiesto de release: https://huggingface.co/EldanRing/Winnow-12B/blob/main/release-manifest.json
- Checksums: https://huggingface.co/EldanRing/Winnow-12B/blob/main/SHA256SUMS
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Asistente MTP: https://huggingface.co/EldanRing/Winnow-12B/resolve/main/gguf/Gemma-4-12B-IT-Assistant-BF16.gguf?download=true
- Descarga Q8_0: https://huggingface.co/EldanRing/Winnow-12B/resolve/main/gguf/Winnow-12B-Q8_0.gguf?download=true
- Descarga BF16: https://huggingface.co/EldanRing/Winnow-12B/resolve/main/gguf/Winnow-12B-BF16.gguf?download=true
- Descarga NVFP4: https://huggingface.co/EldanRing/Winnow-12B/resolve/main/gguf/Winnow-12B-NVFP4.gguf?download=true
- Proyector de visión: https://huggingface.co/EldanRing/Winnow-12B/resolve/main/gguf/mmproj-Winnow-12B.gguf?download=true
