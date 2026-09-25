# OsaurusAI/MiMo-V2.6-Flash-RL-JANG_2L

## Resumen

MiMo-V2.6-Flash-RL-JANG_2L es una redistribución cuantizada del modelo XiaomiMiMo/MiMo-V2.6-Flash-RL, publicada por OsaurusAI para su ejecución local en Apple Silicon mediante el runtime Osaurus y la librería MLX. Se trata de la iteración 2 de cuantización de JANG, una receta de precisión mixta calibrada con imatrix, AWQ y GPTQ por experto sobre 258.507 tokens, que reduce el modelo original a aproximadamente 2,73 bits efectivos por parámetro en los shards principales y deja los pesos de texto en 95,87 GiB (unos 103,19 GiB de descarga completa).

El modelo base es un MoE nativamente omnimodal de Xiaomi (texto, imagen, vídeo y audio), con 310.756.322.688 parámetros totales según los safetensors del repositorio, y pertenece a la familia MiMo-V2.6, publicada en abierto junto con MiMo-V2.6-Pro y MiMo-V2.6-Distill-Qwen-9B. La relevancia de esta ficha concreta es práctica: permite ejecutar un modelo de más de 300.000 millones de parámetros en una máquina con memoria unificada de 128 GiB, a cambio de una pérdida de calidad medible y explícitamente documentada por el autor.

El repositorio no aporta pesos nuevos ni un fine-tuning adicional: es un artefacto de compresión orientado a un runtime específico, con requisitos estrictos de versión (Osaurus 0.25.13 o superior) y con la cualificación de audio explícitamente no superada por el propio autor. La licencia MIT heredada del modelo base facilita el uso comercial, pero la calidad degradada en posiciones sensibles y la dependencia de un único runtime condicionan su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal (imagen, vídeo, audio); modelo base de la familia MiMo-V2.6 |
| Parametros totales | 310.756.322.688 (unos 310,76 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta JANG_2L: 109 proyecciones de expertos enrutados a 2 bits afines, grupo 128; 22 gates protegidos a 3 bits afines, grupo 128; 10 gates tempranos en MXFP4 nativo, grupo 32; atención, embeddings, cabeza de salida, matrices densas y MTP a 8 bits afines, grupo 64; routers en FP32; vision/audio en BF16 nativo; escalas y sesgos afines en BF16 |
| Bits efectivos | ~2,73 bits por parametro en los shards principales |
| Idiomas soportados | en, zh |
| Licencia | MIT (heredada del modelo base XiaomiMiMo/MiMo-V2.6-Flash-RL) |
| Formato de pesos | safetensors para MLX; 24 shards alineados, un índice y 1.477 tensores; payload de shards principales 98,69 GiB; pesos de texto cargados 95,868648 GiB |
| Tamano del repositorio | 110,8 GB |
| Libreria | mlx |
| Pipeline | image-text-to-text |
| Runtime minimo | Osaurus 0.25.13 o superior (0.25.12 no soporta este bundle) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo XiaomiMiMo/MiMo-V2.6-Flash-RL: un transformer con mezcla de expertos y capacidades omnimodales (texto, imagen, vídeo y audio). El modelo fuente fue entrenado con aprendizaje por refuerzo sobre tareas verificables y complejas; la model card menciona GRPO, calificación por grupos (groupwise grading), autocorrección y destilación multi-prefijo como métodos de entrenamiento. Estos métodos describen el proceso de entrenamiento del modelo original y, según el propio autor de la cuantización, no constituyen conmutadores de inferencia ni aprendizaje en línea a partir de aciertos de caché en SSD.

Lo específico de este repositorio es el proceso de cuantización, no el entrenamiento. JANG_2L es una asignación de precisión mixta calibrada con imatrix, AWQ y GPTQ por experto sobre 258.507 tokens, con las transformaciones AWQ ya plegadas dentro de los pesos guardados (los loaders no deben reaplicarlas). La receta protege 10 gates tempranos en el formato MXFP4 nativo del modelo fuente y 22 gates posteriores a 3 bits, mantiene los 72 tensores MTP en los shards principales y conserva la cabeza de salida sin atar como `lm_head.weight` en q8/g64. El tokenizador, la plantilla de chat nativa y los pesos de entrada de imagen, vídeo y audio se preservan. La procedencia de calibración queda registrada en `jang_config.json` bajo las claves `quantization.awq`, `quantization.imatrix` y `quantization.gptq`.

## Capacidades

- Generación de texto y conversación multi-turno con la plantilla de chat nativa del modelo fuente.
- Razonamiento explícito con modo "thinking" activado por defecto; se desactiva con `chat_template_kwargs={"enable_thinking": false}` y la plantilla añade un bloque de pensamiento vacío cerrado. El parser de razonamiento recomendado es `think_xml`.
- Uso de herramientas y function calling, con resultados reportados en tareas BFCL.
- Comprensión de imagen y de vídeo preservada en los pesos y cualificada por el autor en conversaciones y respuestas multimodales.
- Entrada y pesos de audio preservados, pero la transcripción de audio falló en las pruebas del propio autor: la comprensión de audio fiable no está cualificada.
- Capacidades de agente y razonamiento multi-paso heredadas del modelo base (etiquetas agent, tool-use y long-context en el repositorio origen).
- Multilingüe limitado a inglés y chino según los metadatos del repositorio.
- Ejecución local en Apple Silicon mediante MLX, con restauración de continuaciones desde SSD según las pruebas del autor.

## Casos de uso

- Asistente conversacional local en estación de trabajo Apple Silicon: el modelo puede mantener diálogos multi-turno con la plantilla nativa y el modo de razonamiento activado, sin enviar datos a servicios externos, siempre que se disponga de al menos 128 GiB de memoria unificada.
- Automatización de agentes con tool calling: las pruebas del autor en el subconjunto BFCL pasaron 5 de 6 tareas de herramientas, lo que lo hace viable para prototipos de agentes que encadenan llamadas a funciones con razonamiento intermedio.
- Análisis de imagen y vídeo en local: al conservar los pesos de entrada visual y estar cualificado para respuestas de imagen y vídeo, sirve para tareas de descripción, extracción de información y preguntas sobre contenido audiovisual en entornos con requisitos de privacidad.
- Revisión y corrección de código en flujos asistidos: la rama Off del razonamiento reparó pruebas de listas enlazadas de 20/23 a 23/23 en el diagnóstico del autor, lo que sugiere utilidad en tareas acotadas de reparación de código, aunque el rendimiento en tareas JavaScript de Aider/Exercism fue 0/3 bajo los presupuestos probados.
- Evaluación e investigación de cuantización extrema: el repositorio incluye informes legibles por máquina en `evaluation/` con métricas KL sobre conjuntos de calibración, validación y sellado, útiles para estudiar el impacto de la compresión agresiva en modelos MoE.
- Despliegue de demostraciones offline en ferias o entornos aislados: al ejecutarse sobre MLX con descarga completa de unos 103,19 GiB, permite montar una demo sin conectividad, asumiendo la degradación de calidad documentada.
- Procesamiento por lotes de texto en inglés y chino: generación de resúmenes, clasificación o extracción de datos en esos dos idiomas dentro de un pipeline local, teniendo en cuenta que no hay soporte declarado de otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks oficiales (MMLU, HumanEval, GSM8K y similares) en la información disponible. El autor publica métricas de fidelidad de cuantización (divergencia KL y coincidencia top-1), que miden similitud con el checkpoint fuente y no precisión en tareas.

| Metrica de validacion | Asignacion GPTQ previa | JANG_2L |
|---|---:|---:|
| KL media (nats) | 0,942919 | 0,914656 |
| KL mediana | 0,061255 | 0,055000 |
| Percentil 90 | 2,703788 | 2,616918 |
| Percentil 99 | 13,062842 | 12,778649 |
| Coincidencia top-1 | 76,5213 % | 77,0381 % |
| Posiciones evaluadas | 32.506 | 32.506 |

| Metrica del conjunto sellado | Asignacion GPTQ previa | JANG_2L |
|---|---:|---:|
| KL media (nats) | 0,905232 | 0,866514 |
| KL mediana | 0,072926 | 0,063002 |
| Percentil 90 | 2,584622 | 2,413376 |
| Percentil 99 | 12,561462 | 12,266034 |
| Media del peor 1 % | 15,539492 | 15,194221 |
| KL maxima | 26,005333 | 29,807011 |
| Coincidencia top-1 | 75,7578 % | 76,6198 % |
| Posiciones evaluadas | 32.365 | 32.365 |

Diagnósticos adicionales reportados por el autor (subconjuntos, no puntuaciones oficiales de leaderboard):

| Diagnostico | Resultado |
|---|---|
| BFCL, tareas de herramientas, thinking On, temperatura 1, top-p 0,95 | 5/6 (frente a 4/6 de la asignación previa) |
| Aider/Exercism JavaScript adaptado | 0/3 |
| Reparación de pruebas de listas enlazadas, rama Off | 20/23 → 23/23 |
| Grade-school | 9/10 |
| REST | 6/9 |

El propio autor advierte que la KL media es muy superior a la mediana, lo que refleja una distorsión sustancial en posiciones sensibles, y que se trata de una cuantización agresiva de presupuesto de memoria, no de una paridad con los benchmarks del modelo fuente. No se midió una puntuación RTN stock-MLX de modelo completo comparable.

## Requisitos de hardware

- Memoria: los pesos de texto cargados ocupan 95,868648 GiB y la descarga completa ronda los 103,19 GiB. Hay que sumar activaciones, torres de medios y KV activa.
- Las pruebas del autor se realizaron en un Apple M5 Max con 128 GiB de memoria unificada. No se documentan pruebas en equipos con menos memoria.
- No cabe en GPU de consumo convencionales con 24 GiB o 48 GiB de VRAM, y el formato es MLX, por lo que no está pensado para CUDA.
- Despliegue: exclusivamente mediante el runtime Osaurus, versión 0.25.13 o superior. El autor indica explícitamente que no se debe usar un loader genérico de bits uniformes ni versiones anteriores de MiMo-V2.5.
- Opciones como vLLM, llama.cpp, Ollama o TGI no están soportadas para este bundle, al no ser formato GGUF ni safetensors estándar de HuggingFace Transformers.
- Latencia y throughput: no disponibles. El autor menciona restauración de continuaciones desde SSD y mediciones del runtime de Python etiquetadas como separadas, sin cifras concretas en la información proporcionada.
- Caché en disco: el repositorio separa los sidecars del tokenizador de audio y DFlash en subdirectorios, lo que condiciona la estrategia de carga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OsaurusAI/MiMo-V2.6-Flash-RL-JANG_2L | 310,76 mil millones (MoE) | no disponible | MLX/safetensors, Osaurus 0.25.13+ | MIT | Repositorio con 0 descargas y 0 likes |
| XiaomiMiMo/MiMo-V2.6-Flash-RL (modelo fuente) | no disponible | no disponible | Safetensors, Transformers, precisión 8 bits / FP8 | MIT | Repositorio oficial con 52 likes; pesos completos |
| XiaomiMiMo/MiMo-V2.6-Pro | no disponible | no disponible | no disponible | no disponible | Publicado en abierto según el anuncio de Xiaomi |
| MiMo-V2.6-Distill-Qwen-9B | no disponible | no disponible | no disponible | no disponible | Publicado en abierto según el anuncio de Xiaomi |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas en la información consultada, por lo que no es posible establecer una comparación cuantitativa de rendimiento. La comparación relevante es de fidelidad: este bundle mejora la asignación GPTQ previa en KL media, KL mediana, percentiles 90 y 99 y coincidencia top-1 en ambos conjuntos evaluados, pero empeora ligeramente la KL máxima del conjunto sellado (26,005333 frente a 29,807011).

## Limitaciones y advertencias

- Cuantización agresiva: aproximadamente 2,73 bits efectivos por parámetro, con una KL media de 0,914656 en validación frente a una mediana de 0,055000. La media elevada indica distorsión importante concentrada en posiciones sensibles.
- Coincidencia top-1 en torno al 77 %, que mide predicción del siguiente token y no precisión en tareas.
- El audio no está cualificado: la transcripción falló en las pruebas de Osaurus, aunque los pesos se conservan.
- Idiomas limitados a inglés y chino; no hay soporte declarado para castellano ni otros idiomas.
- Dependencia estricta del runtime Osaurus 0.25.13 o superior; no es cargable con loaders genéricos de bits uniformes ni con versiones antiguas.
- Licencia MIT heredada del modelo base, lo que en principio permite uso comercial, pero conviene verificar las condiciones del repositorio fuente y de los pesos originales de Xiaomi antes de un despliegue en producción.
- Los resultados de BFCL, Aider/Exercism, listas enlazadas, grade-school y REST son diagnósticos sobre subconjuntos, no puntuaciones oficiales de leaderboard, y no deben extrapolarse a un rendimiento general.
- Riesgo de alucinación no cuantificado en la información disponible; la degradación de fidelidad respecto al checkpoint fuente es un factor de riesgo añadido en tareas de precisión factual.
- Repositorio sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta.
- El autor advierte que el ejemplo de corrección observado no demuestra que todas las capacidades de RL del modelo fuente sobrevivan a la cuantización.
- No se ha medido una puntuación RTN stock-MLX de modelo completo comparable, por lo que no hay una línea base equivalente para calibrar la pérdida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OsaurusAI/MiMo-V2.6-Flash-RL-JANG_2L
- Modelo fuente: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Árbol de archivos del modelo fuente: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL/tree/main
- Perfil del autor: https://huggingface.co/OsaurusAI
- Sitio de Osaurus: https://osaurus.ai
- Código fuente de JANG: https://github.com/jjang-ai/jangq
- Anuncio de la serie MiMo-V2.6: https://mimo.xiaomi.com/mimo-v2-6
- Métricas de entrenamiento RL de MiMo-V2.6: https://mimo.xiaomi.com/rl/
- Noticias y recursos de la serie MiMo-V2.6: https://mimo.mi.com/docs/en-US/news/latest/v2-6
