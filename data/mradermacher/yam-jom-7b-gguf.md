# mradermacher/yam-jom-7B-GGUF

## Resumen

yam-jom-7B-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo mayacinka/yam-jom-7B, publicada por el usuario mradermacher. El modelo subyacente es un merge de 7.241.732.096 parámetros construido con mergekit/lazymergekit a partir de dos modelos: eren23/ogno-monarch-jaskier-merge-7b-OH-PREF-DPO-v2 y yam-peleg/Experiment26-7B. La ficha que nos ocupa corresponde exclusivamente al repositorio de cuantizaciones, no al modelo original.

El interés de esta publicación es práctico: ofrece el modelo en once variantes de cuantización GGUF (desde Q2_K de 2,8 GB hasta f16 de 14,6 GB), lo que permite ejecutarlo en hardware muy diverso, desde GPUs de consumo con 6-8 GB de VRAM hasta estaciones de trabajo. Está pensado para su uso con llama.cpp y derivados (Ollama, LM Studio, koboldcpp), y declara licencia Apache 2.0.

La información disponible sobre el modelo original es muy limitada: no se documentan la longitud de contexto, la composición del dataset de entrenamiento, los detalles del merge ni los resultados de benchmarks. La model card del repositorio de cuantizaciones se limita a listar los ficheros generados y a remitir a la documentación genérica de mradermacher sobre GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos de 7B con mergekit/lazymergekit); no se detalla la arquitectura interna de los modelos base |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estáticas); versiones con imatrix en el repositorio yam-jom-7B-i1-GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo subyacente es un merge de dos modelos de 7B (eren23/ogno-monarch-jaskier-merge-7b-OH-PREF-DPO-v2 y yam-peleg/Experiment26-7B) generado con mergekit y lazymergekit. No se especifica en la información disponible el método exacto de fusión (SLERP, TIES, DARE, passthrough, etc.), ni los hiperparámetros del merge, ni la proporción de pesos de cada modelo base. Tampoco se documentan los datos de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO en los modelos de origen (el nombre del primer modelo base sugiere un ajuste DPO con preferencias, pero no se confirma en la ficha).

Al tratarse de una publicación de cuantizaciones, el repositorio no aporta información sobre el entrenamiento: la model card indica únicamente que se trata de "static quants" del modelo mayacinka/yam-jom-7B y que las cuantizaciones ponderadas con imatrix están en un repositorio separado. No se documenta ninguna innovación técnica adicional (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de texto en inglés, heredada de los modelos base del merge.
- Razonamiento y conversación multi-turno (presumible por el origen DPO de uno de los modelos base, aunque no se documenta explícitamente).
- Ejecución local en CPU y GPU mediante llama.cpp y compatibles, gracias al formato GGUF.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- No se documentan capacidades de código o matemáticas de forma específica.

## Casos de uso

- Despliegue local en equipos de desarrollo: con la cuantización Q4_K_M (4,5 GB) el modelo cabe en GPUs de consumo con 6-8 GB de VRAM, lo que permite tener un asistente de texto en inglés funcionando sin conexión en un portátil con GPU dedicada.
- Prototipado rápido de aplicaciones de chat: la variante Q8_0 (7,8 GB) ofrece la máxima calidad práctica en formato GGUF y permite validar prompts y flujos conversacionales antes de migrar a un modelo mayor.
- Experimentación con merges de modelos: útil para investigadores que quieran evaluar el comportamiento de un merge de dos modelos de 7B sin necesidad de reconstruirlo, comparando las distintas cuantizaciones para medir el impacto de la compresión en la calidad.
- Inferencia en CPU en servidores sin GPU: la variante Q2_K (2,8 GB) o Q3_K_S (3,3 GB) permite ejecutar el modelo en máquinas modestas con llama.cpp, útil para tareas de generación de texto no críticas.
- Generación de texto por lotes en pipelines de datos: con Q4_K_S (4,2 GB) y llama.cpp se pueden procesar grandes volúmenes de texto en inglés para tareas de etiquetado, resumen o aumento de datos, siempre que la calidad exigida no sea alta.
- Evaluación comparativa de cuantizaciones: el repositorio incluye doce variantes del mismo modelo, lo que facilita estudios empíricos sobre la degradación de perplejidad según el tipo de cuantización (Q2_K frente a Q8_0, IQ frente a K).
- Integración en entornos de escritorio con Ollama o LM Studio: al ser GGUF, el modelo se puede importar directamente en estas herramientas para asistentes personales en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye overhead aproximado de contexto y caché KV; varía según la longitud de contexto configurada):
  - Q2_K (2,8 GB): ~4 GB de VRAM.
  - Q3_K_S (3,3 GB): ~4,5 GB de VRAM.
  - Q3_K_M (3,6 GB): ~5 GB de VRAM.
  - Q3_K_L (3,9 GB): ~5,5 GB de VRAM.
  - IQ4_XS (4,0 GB): ~5,5 GB de VRAM.
  - Q4_K_S (4,2 GB): ~6 GB de VRAM.
  - Q4_K_M (4,5 GB): ~6,5 GB de VRAM.
  - Q5_K_S (5,1 GB): ~7 GB de VRAM.
  - Q5_K_M (5,2 GB): ~7,5 GB de VRAM.
  - Q6_K (6,0 GB): ~8 GB de VRAM.
  - Q8_0 (7,8 GB): ~10 GB de VRAM.
  - f16 (14,6 GB): ~16-18 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q8_0 y f16; RTX 4070/4080/4090, A100 o H100 para despliegues con contexto largo o mayor throughput. Las variantes Q4_K_M y Q4_K_S caben en GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070).
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q8_0 en GPUs de 8-12 GB; f16 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. No es compatible directamente con vLLM o TGI en su forma GGUF (requerirían el modelo base en safetensors).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| yam-jom-7B-GGUF (este) | 7,24 B | no disponible | Apache 2.0 | GGUF (12 variantes) | Merge de dos modelos 7B; solo inglés |
| eren23/ogno-monarch-jaskier-merge-7b-OH-PREF-DPO-v2 | ~7 B | no disponible | no disponible en esta ficha | safetensors | Modelo base del merge, con ajuste DPO |
| yam-peleg/Experiment26-7B | ~7 B | no disponible | no disponible en esta ficha | safetensors | Modelo base del merge |
| mayacinka/yam-jom-7B | 7,24 B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés según la etiqueta de idioma del repositorio; no se debe esperar un rendimiento fiable en castellano u otros idiomas.
- No se documenta la longitud de contexto del modelo original, lo que impide planificar despliegues con ventanas largas con garantías.
- Al ser un merge de modelos sin evaluación publicada, el riesgo de alucinación y de comportamientos inconsistentes es desconocido; no hay benchmarks que avalen su calidad.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad de forma notable; la propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como opción rápida.
- La licencia Apache 2.0 se hereda del modelo base declarado, pero no se verifica en esta ficha la licencia de los modelos de origen del merge; conviene revisarla antes de un uso comercial.
- El repositorio tiene 204 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy baja.
- El tamaño del repositorio (63,9 GB) se debe a que contiene las doce variantes; descargar solo el fichero GGUF necesario.
- No hay garantía de soporte o mantenimiento: la fecha de actualización indicada (2026-11-19) es posterior a la de creación (2024-12-17) y no se detalla qué cambió.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/yam-jom-7B-GGUF
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/yam-jom-7B-i1-GGUF
- Modelo base original: https://huggingface.co/mayacinka/yam-jom-7B
- Modelo base del merge 1: https://huggingface.co/eren23/ogno-monarch-jaskier-merge-7b-OH-PREF-DPO-v2
- Modelo base del merge 2: https://huggingface.co/yam-peleg/Experiment26-7B
- Página de resumen de descargas de mradermacher: https://hf.tst.eu/model#yam-jom-7B-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
