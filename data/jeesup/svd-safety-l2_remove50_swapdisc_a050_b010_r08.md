# Jeesup/svd-safety-l2_remove50_swapdisc_a050_b010_r08

## Resumen

svd-safety-l2_remove50_swapdisc_a050_b010_r08 es un artefacto de investigación publicado por el usuario Jeesup en HuggingFace. Se trata de un checkpoint de meta-llama/Llama-2-7b-chat-hf comprimido con SVD-LLM hasta el 50,0 % de los parámetros densos y después editado parcialmente mediante 8 de las 10 rondas de un procedimiento iterativo de intercambio de componentes neutro respecto al recuento de parámetros ("parameter-neutral swap"), gobernado por la regla de selección `disc_iter`. El presupuesto total de restauración de la ejecución completa es del 1,0 % de los parámetros densos, aplicado en fragmentos del 0,1 % por ronda.

El modelo resuelve un problema concreto de investigación: la compresión SVD de un LLM degrada su comportamiento de seguridad (aumenta la tasa de éxito de ataques) y no está claro qué criterio de selección de componentes repara mejor ese daño con el menor coste posible. Este checkpoint es una celda de una cuadrícula de experimentos sobre reglas de selección y presupuestos, y su model card advierte de forma explícita de que algunas celdas de la cuadrícula están deliberadamente degradadas en seguridad respecto al modelo original y de que el artefacto no es un asistente de propósito general.

Su relevancia actual es doble: por un lado, cuantifica el compromiso entre seguridad y utilidad bajo compresión; por otro, sirve como sujeto experimental reproducible (semilla 42, recuentos de componentes documentados) para estudios de interpretabilidad, red-teaming y evaluación automatizada con jueces como HarmBench, StrongREJECT o WildGuard. El repositorio contiene 6.738.415.616 parámetros en formato safetensors, ocupa 13,5 GB y se distribuye bajo la Llama 2 Community License.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2); derivado por compresión SVD-LLM de Llama-2-7b-chat |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Llama-2-7b-chat emplea 4.096 tokens según la documentación de Llama 2 (dato no confirmado en esta ficha) |
| Tipos de cuantizacion | No disponible. No se declaran versiones cuantizadas; el tamaño del repositorio (13,5 GB) es coherente con pesos de 16 bits, pero la model card no lo confirma |
| Idiomas soportados | No disponible (las etiquetas de HuggingFace no listan idiomas; el modelo base es mayoritariamente inglés) |
| Licencia | Llama 2 Community License (`llama2`); el repositorio incluye `LICENSE.txt` y `USE_POLICY.md` |
| Formato de pesos | safetensors, librería transformers |
| Fracción de parámetros resultante | 0,4999 (compresión SVD-LLM, 50,01 % de parámetros eliminados) |
| Regla de selección | `disc_iter` |
| Presupuesto de restauración | 1,000 % de los parámetros densos (0,100 % por ronda) |
| Componentes restaurados / sustituidos | 5.191 restaurados y 5.191 sustituidos |
| Parámetros intercambiados | 51.786.752 (0,80 % de los parámetros densos de proyección) |
| Valor del intercambio | `insert` (solo valor de inserción, desalojo ordenado por sigma) |
| Escala de inserción | 0,5 (los componentes se añaden a esta fracción de su fuerza) |
| Semilla | 42 |
| Rondas iterativas aplicadas | 8 de 10 (checkpoint intermedio de una ejecución más larga) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con normalización RMSNorm, activaciones SwiGLU, embeddings rotatorios (RoPE) y atención con caché de clave-valor. Sobre ese checkpoint se aplicó SVD-LLM, un método de compresión que descompone en valores singulares las matrices de pesos y trunca los componentes de menor contribución, con conciencia del truncamiento. El resultado declarado es una eliminación del 50,01 % de los parámetros densos, dejando una fracción de parámetros de 0,4999. Un detalle técnico relevante es que el recuento total de parámetros del repositorio (6.738.415.616) coincide con el de Llama-2-7b-chat sin comprimir, lo que sugiere que la compresión actúa sobre el rango efectivo de las matrices de proyección y no sobre las dimensiones almacenadas de los tensores; la model card no detalla este extremo.

Sobre el checkpoint comprimido se aplicó un procedimiento de edición iterativa denominado "parameter-neutral swap": en cada ronda se restauran y se sustituyen simultáneamente 5.191 componentes, con un valor de inserción (`insert`) y una escala de inserción de 0,5 respecto a la fuerza original del componente. La selección de qué componentes se tocan la decide la regla `disc_iter`, y el desalojo de los componentes salientes se ordena por valor sigma. En esta celda concreta se ejecutaron 8 de las 10 rondas previstas, con un presupuesto de 0,100 % de parámetros densos por ronda y 51.786.752 parámetros intercambiados en total (0,80 % de los parámetros densos de proyección). No se documenta en la información disponible ningún proceso de ajuste fino adicional, RLHF ni DPO posterior al swap; la model card tampoco detalla la composición del dataset de alineación original, que corresponde al de Llama-2-7b-chat. La semilla declarada es 42.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama-2-7b-chat y degradada por la compresión, según la propia model card.
- Comportamiento de rechazo de peticiones dañinas parcialmente conservado: la celda registra una tasa de éxito de ataque (ASR) de 0,1038 en AdvBench y de 0,1565 en StrongREJECT, medidas con el juez de HarmBench.
- Capacidad de actuar como sujeto experimental controlado para medir seguridad bajo compresión: incluye métricas de sobre-rechazo macro de 0,2799 evaluadas con WildGuard.
- Soporte de tool calling / function calling: no documentado en la información disponible (el modelo base no lo soporta de forma nativa).
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado en la información disponible.
- Capacidades multilingües: no disponibles; no se declaran idiomas en la ficha ni evaluaciones multilingües.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponibles; el pipeline declarado es únicamente `text-generation`.
- Compatibilidad con text-generation-inference y con endpoints, según las etiquetas de HuggingFace.

## Casos de uso

- Estudio de la degradación de seguridad por compresión: el checkpoint permite medir cuánto sube la tasa de éxito de ataques cuando se elimina el 50 % de los parámetros mediante SVD-LLM, comparando el ASR de 0,1038 en AdvBench con el de Llama-2-7b-chat sin comprimir y con otras celdas de la misma cuadrícula.
- Evaluación comparativa de reglas de selección de componentes: al fijar la regla `disc_iter`, el presupuesto (1,0 %) y la semilla (42), esta celda sirve como punto de anclaje reproducible frente a otras reglas del mismo estudio.
- Validación de jueces automáticos de seguridad: con métricas ya publicadas bajo HarmBench, StrongREJECT y WildGuard, el modelo resulta útil para comprobar la sensibilidad y la estabilidad de esos jueces ante respuestas generadas por un modelo parcialmente desalineado.
- Investigación en interpretabilidad de pesos comprimidos: los recuentos exactos de componentes restaurados y sustituidos (5.191 en cada caso) y el valor de intercambio permiten rastrear qué direcciones de las matrices de proyección son responsables de la conducta de rechazo.
- Red-teaming y generación de conjuntos adversarios: la subida de ASR respecto al modelo base lo convierte en una fuente de respuestas que superan filtros, útil para construir corpus de entrenamiento defensivo o para calibrar clasificadores de contenido dañino.
- Control negativo en pipelines de evaluación de seguridad: al ser un artefacto conscientemente degradado, puede incorporarse como caso de prueba que debe ser detectado por un sistema de moderación antes de llegar a producción.
- Reproducción de experimentos de compresión: dado que la model card documenta compresión, regla, presupuesto, rondas y semilla, permite reproducir el punto intermedio de la ejecución y validar implementaciones de SVD-LLM y del swap iterativo.

Advertencia transversal: la propia model card indica que ninguna celda de esta cuadrícula debe tratarse como un asistente desplegable y que cada usuario debe evaluarla antes de extraer conclusiones.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,1038 |
| StrongREJECT ASR (juez HarmBench) | 0,1565 |
| Sobre-rechazo macro (WildGuard) | 0,2799 |

No se han publicado en la información disponible resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K u otros), ni cifras de referencia del modelo base o de otras celdas de la cuadrícula que permitan una comparación directa. Las tres métricas anteriores miden seguridad y calibración del rechazo, no calidad conversacional: en ASR un valor más bajo es mejor, mientras que en sobre-rechazo un valor más alto indica más negativas ante peticiones inofensivas.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: en torno a 13,5 GB solo para pesos (el repositorio ocupa 13,5 GB), más la caché KV, que crece con la longitud de contexto y el tamaño de lote.
- VRAM estimada en 8 bits: aproximadamente 7 GB de pesos; en 4 bits, aproximadamente 3,5-4 GB, en ambos casos más caché KV. Son estimaciones de orden de magnitud, no cifras publicadas para este checkpoint.
- GPU recomendadas para 16 bits: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB. Cualquier GPU con 24 GB o más (RTX 3090, RTX 4090, L4 con cuantización) puede servirlo en 16 bits con contexto moderado.
- Cabe en GPU de consumo: sí. En RTX 4090 o RTX 3090 (24 GB) en 16 bits con lotes pequeños y contexto corto; en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) o de 12 GB (RTX 3060 12 GB) resulta necesario cuantizar a 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM. El uso con llama.cpp u Ollama requeriría convertir los pesos safetensors a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por petición para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove50_swapdisc_a050_b010_r08 | 6.738.415.616 (fracción densa 0,4999) | No especificado en la ficha | AdvBench ASR 0,1038; StrongREJECT ASR 0,1565; sobre-rechazo 0,2799 | Llama 2 Community License | HuggingFace, repo de 13,5 GB, 0 descargas y 0 likes en el momento de la consulta |
| meta-llama/Llama-2-7b-chat-hf (modelo base) | 6.738.415.616 | 4.096 tokens según la documentación de Llama 2 | No disponibles en la información proporcionada | Llama 2 Community License | HuggingFace, acceso bajo condiciones de Meta |
| Otras celdas de la misma cuadrícula de compresión y swap | No disponible | No disponible | No disponible | Llama 2 Community License (presumiblemente) | No disponibles en la información proporcionada |
| Otros modelos de 7B comparables (por ejemplo, alternativas de la misma categoría) | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no incluye resultados de benchmarks del modelo base ni de terceros, por lo que no es posible establecer una comparación cuantitativa de rendimiento más allá de los valores de seguridad de esta celda.

## Limitaciones y advertencias

- La model card declara explícitamente que este checkpoint "no es un modelo de chat de propósito general" y que debe tratarse como un sujeto experimental, no como un asistente desplegable.
- Varias celdas de la cuadrícula están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat: la compresión por sí sola eleva la tasa de éxito de ataques y el objetivo del estudio es cuantificarlo y probar su recuperación.
- Riesgo elevado de respuestas dañinas: el ASR medido (0,1038 en AdvBench y 0,1565 en StrongREJECT) es una métrica de fallo, no de calidad; cualquier despliegue expuesto requeriría capas de moderación externas.
- Sesgos conocidos: hereda los sesgos de Llama-2-7b-chat, agravados potencialmente por la compresión, que puede degradar de forma no uniforme distintas capacidades. No se documentan evaluaciones de sesgo específicas para este checkpoint.
- Riesgo de alucinación: no evaluado en la información disponible; la compresión al 50 % de la densidad tiende a degradar la fidelidad factual, pero no se aportan mediciones.
- Limitaciones de contexto e idioma: la longitud de contexto no se confirma en la ficha y no se declaran idiomas soportados; el comportamiento multilingüe es desconocido.
- Estado del artefacto: es un checkpoint intermedio (8 de 10 rondas) de una ejecución más larga, no el resultado final del procedimiento.
- Restricciones de licencia: se rige por la Llama 2 Community License; el repositorio incluye `LICENSE.txt` y `USE_POLICY.md`, y su uso está sujeto a ambos. Existen restricciones de uso comercial y de redistribución propias de esa licencia, incluida la obligación de conservar los avisos y de cumplir la política de uso aceptable.
- Trazabilidad limitada: el repositorio registra 0 descargas y 0 likes, no tiene resultados de benchmarks de capacidades generales y la fecha de creación y actualización indicada (2026) no se corresponde con una validación independiente conocida.
- No se documentan capacidades de tool calling, agentes ni multimodalidad; asumirlas sería incorrecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapdisc_a050_b010_r08
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Ficheros de licencia y política de uso incluidos en el repositorio: `LICENSE.txt` y `USE_POLICY.md`
- Bibliografía sobre SVD-LLM, HarmBench, StrongREJECT y WildGuard: no disponible en la información proporcionada.
- Los resultados de la búsqueda web consultada no contienen enlaces relevantes para este modelo (corresponden a un portal de juegos en húngaro sin relación con el artefacto), por lo que no se incluyen.
