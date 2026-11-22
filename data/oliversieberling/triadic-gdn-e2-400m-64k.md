# OliverSieberling/triadic-gdn-e2-400m-64k

## Resumen

Triadic Gated DeltaNet (E=2) 400M, 64k es un checkpoint de investigación publicado por Oliver Sieberling, con la colaboración de Bharat Runwal, David Jin, Ryan Chin, Rameswar Panda y Yoon Kim, en el marco del artículo *Triadic Linear Attention: Three-Dimensional Recurrent States for Long-Context Sequence Modeling* (arXiv:2609.36529). Se trata de un modelo de lenguaje de 381,9 millones de parámetros que implementa una variante de atención lineal basada en Gated DeltaNet con un estado recurrente tridimensional, diseñada específicamente para modelado de secuencias de contexto largo.

El modelo no es un asistente conversacional al uso, sino una pieza de infraestructura experimental: se ha preentrenado sobre 20.000 millones de tokens de FineWeb-Edu con una ventana de 4k tokens y posteriormente se ha extendido a 64k tokens con 2.000 millones de tokens adicionales. Su interés radica en que permite evaluar empíricamente si los estados recurrentes de mayor dimensionalidad (el parámetro E = 2, o "second-key dimension") mejoran la recuperación de información en ventanas largas frente a la atención lineal convencional, manteniendo un coste de inferencia lineal con la longitud de la secuencia.

La relevancia actual del checkpoint es doble: por un lado, ofrece un punto de comparación reproducible (semilla 1337) para la línea de investigación de atención lineal y modelos recurrentes híbridos; por otro, su licencia MIT y su tamaño contenido lo hacen accesible para experimentación académica, aunque su uso práctico está limitado por la dependencia de código propio y de hardware de gama alta (H100) según indica el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal Gated DeltaNet y estado recurrente tridimensional (Triadic Linear Attention, E=2) |
| Parametros totales | 381.861.632 (381,9M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64.000 tokens (preentrenado a 4k, extendido a 64k) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en precisión original) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors, 1,5 GB de repositorio) |

Datos adicionales de configuración: 24 capas, dimensión de modelo (d_model) de 1024, 8 cabezas de atención y tokenizador Llama-2.

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de tipo transformer en la que el mecanismo de atención se sustituye por una atención lineal recurrente basada en Gated DeltaNet, con una innovación central: un estado recurrente tridimensional. El parámetro E = 2 corresponde a una "second-key dimension" que amplía la representación del estado interno más allá del esquema bidimensional habitual de DeltaNet, lo que según los autores permite capturar dependencias de mayor orden sin renunciar al coste lineal en la longitud de secuencia. La red tiene 24 capas, d_model de 1024 y 8 cabezas, y emplea el tokenizador de Llama-2.

El entrenamiento se realizó en dos fases: un preentrenamiento sobre 20.000 millones de tokens de FineWeb-Edu con contexto de 4k tokens, seguido de una fase de extensión de contexto sobre 2.000 millones de tokens hasta alcanzar los 64k tokens. No se documenta en la información disponible el uso de RLHF, DPO ni ajuste por instrucciones; se trata, por tanto, de un modelo base. Tampoco se detalla la composición exacta del dataset más allá de la fuente FineWeb-Edu ni se especifican innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base sin ajuste por instrucciones.
- Modelado de lenguaje de contexto largo: ventana nativa de hasta 64.000 tokens gracias a la atención lineal recurrente.
- Recuperación de información en secuencias largas, evaluada mediante las tareas Recall y NIAH (Needle in a Haystack) reportadas por el autor.
- Razonamiento de lenguaje general evaluado en 0-shot (52,8 en la métrica reportada) y perplejidad en WikiText y PG19.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se ha entrenado para ello).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en atención lineal y modelos recurrentes: el checkpoint sirve como referencia reproducible (semilla 1337) para comparar variantes de Gated DeltaNet con E=1, E=2 u otras configuraciones en tareas de contexto largo. Es adecuado porque el artículo y el código asociado permiten replicar exactamente el entorno de evaluación.
- Evaluación de extensión de contexto: útil para estudiar cómo se degrada la perplejidad entre 4k, 16k y 64k tokens (PG19 muestra 14,95, 14,25 y 13,99 respectivamente), lo que permite analizar la estabilidad del estado recurrente a medida que crece la secuencia.
- Benchmarking de recuperación de agujas en un pajar (NIAH): con una puntuación de 19,4 en NIAH y 28,5 en Recall, el modelo es un candidato para analizar los límites de la atención lineal en tareas de recuperación exacta y para diseñar mejoras sobre esa base.
- Modelado de documentos largos en inglés: con 64k tokens de contexto, puede emplearse en experimentos de perplejidad sobre libros completos (PG19) o corpus educativos, aunque su calidad de generación libre es limitada por ser un modelo base de 400M.
- Base para fine-tuning académico: al ser un modelo pequeño (381,9M parámetros, 1,5 GB en safetensors) y con licencia MIT, es viable ajustarlo en un solo acelerador para tareas downstream específicas de dominio, partiendo de una arquitectura de atención lineal eficiente.
- Estudio de eficiencia computacional: su coste lineal en la longitud de secuencia lo hace adecuado para medir throughput y consumo de memoria frente a transformers con atención cuadrática en secuencias de decenas de miles de tokens, siempre que se disponga del código de referencia.

## Benchmarks y rendimiento

Resultados publicados por el autor (semilla 1337, evaluación 0-shot):

| Metrica | Valor |
|---|---|
| 0-shot | 52,8 |
| WikiText (perplejidad) | 11,07 |
| PG19 ≤4k (perplejidad) | 14,95 |
| PG19 4k–16k (perplejidad) | 14,25 |
| PG19 16k–64k (perplejidad) | 13,99 |
| Recall | 28,5 |
| NIAH | 19,4 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni la definición exacta de las métricas 0-shot, Recall y NIAH más allá de su valor numérico.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 1,5 GB (381,9M parámetros en fp32/bf16 según el checkpoint); en fp16 se estiman unos 0,8 GB solo para pesos, más el estado recurrente y las activaciones, que crecen con la longitud de secuencia.
- GPU recomendadas: el autor indica explícitamente que se requiere una H100 para ejecutar el código de referencia; no se documentan otras GPU compatibles.
- Cabe en GPU de consumo: no confirmado. Por tamaño de pesos cabría en GPUs como RTX 4090 (24 GB) o RTX 3090, pero la dependencia de código propio y la falta de soporte en frameworks estándar impiden afirmarlo; el autor solo menciona H100.
- Opciones de despliegue: no disponibles en vLLM, llama.cpp, Ollama o TGI según la información proporcionada; el único camino documentado es cargar los pesos con `safetensors` y el módulo `model.py` del repositorio de código TriadicLinearAttention.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. A continuación se comparan únicamente características estructurales con alternativas de la misma categoría (modelos pequeños de atención lineal o recurrentes para contexto largo), marcando como "no disponible" los datos que no se han podido verificar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Triadic GDN E=2 400M 64k | 381,9M | 64k | MIT | Hugging Face, requiere código propio |
| Gated DeltaNet (variante base, E=1) | no disponible | no disponible | no disponible | referencia en el artículo arXiv:2609.36529 |
| Mamba-2 (tamaño pequeño) | no disponible | no disponible | no disponible | mencionado como comparación en Latent Lattice Language Models (arXiv:2611.21608) |
| GDN–Mamba-2 híbrido | no disponible | no disponible | no disponible | mencionado en arXiv:2611.21608 |

No se han encontrado en la información disponible valores de rendimiento de estos modelos comparables que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no está diseñado para conversación, seguimiento de instrucciones ni tareas de asistente; su uso directo en producción requeriría fine-tuning.
- Solo inglés: no se declara soporte multilingüe, por lo que su comportamiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: como todo modelo de lenguaje generativo, puede producir texto plausible pero incorrecto; no se documentan mecanismos de mitigación.
- Sesgos: no se documenta ninguna evaluación de sesgos; el corpus FineWeb-Edu puede arrastrar sesgos de la web filtrada con criterios educativos.
- Rendimiento limitado en recuperación exacta: los valores de NIAH (19,4) y Recall (28,5) son bajos en términos absolutos, lo que sugiere dificultades para localizar información con precisión en contextos largos.
- Dependencia de código propietario del autor: la carga requiere el módulo `model.py` del repositorio TriadicLinearAttention y no hay integración con frameworks de inferencia estándar, lo que complica el despliegue.
- Requisito de hardware declarado: el autor indica que se necesita una H100, lo que restringe la reproducibilidad en entornos con GPU de consumo.
- Licencia MIT: permite uso comercial, pero al ser un checkpoint de investigación sin garantías, no se recomienda su uso en producción sin una evaluación exhaustiva propia.
- Fecha de creación del repositorio (2026-11-22) y ausencia de descargas o likes: se trata de un artefacto de investigación reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OliverSieberling/triadic-gdn-e2-400m-64k
- Artículo Triadic Linear Attention: https://arxiv.org/abs/2609.36529
- Código TriadicLinearAttention: https://github.com/OliverSieberling/TriadicLinearAttention
- Latent Lattice Language Models (referencia a Triadic GDN): https://arxiv.org/html/2611.21608v1
