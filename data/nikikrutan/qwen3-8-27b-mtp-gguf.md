# NikiKrutan/Qwen3.8-27B-MTP-GGUF

## Resumen

Qwen3.8-27B-MTP-GGUF es una colección de cuantizaciones GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario NikiKrutan. El modelo base es un transformer denso de 27.320.697.856 parámetros (unos 27,3 mil millones) desarrollado por el equipo Qwen, orientado a razonamiento con modo *thinking*, generación de código, uso agéntico y conversación multimodal de entrada imagen-texto. Esta publicación no entrena ni modifica los pesos: su valor está en el proceso de cuantización.

El autor emplea una herramienta experimental propia, `niki-allocator`, que asigna el tipo de cuantización por tensor individual en lugar de por grupos de tensores o capas, estimando la mejor opción para cada tensor y validando las candidatas con ejecuciones reales de divergencia KL (KLD). Según la model card, el proceso consumió 95 horas de cómputo con 2 GPU a carga cercana al 100 %, materializó 27 TB de GGUF intermedios y requirió 72 horas de trabajo humano. El resultado es un conjunto de cuantizaciones con métricas de calidad (KLD media, RMS Δp, p95/p99/p99.9, coincidencia de top-1 y perplejidad) comparadas frente a las de unsloth, AtomicChat, bartowski, lmstudio-community, mudler y byteshape.

La relevancia práctica es doble: por un lado, ofrece alternativas GGUF de alta fidelidad para desplegar un modelo de 27B en llama.cpp y entornos compatibles; por otro, conserva la cuantización de la cabeza MTP (*multi-token prediction*), que el autor defiende como útil incluso en cuantizaciones de baja precisión, frente a la decisión de unsloth v3.0 de eliminarla en sus variantes pequeñas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (sin mezcla de expertos); detalles internos del modelo base no disponibles en la informacion proporcionada |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF cuantizado con asignacion por tensor (metodo `niki-allocator`); niveles concretos no listados en la informacion proporcionada |
| Idiomas soportados | No disponible (la model card menciona corpus de evaluacion en ingles, ruso y multilingue, pero no declara idiomas soportados) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos base en safetensors en el modelo original) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27,3B parámetros. La información disponible no detalla el número de capas, dimensión oculta, mecanismo de atención ni composición del dataset de entrenamiento. La model card del repositorio cuantizado sí confirma la presencia de una cabeza MTP (*multi-token prediction*), un módulo auxiliar de predicción multi-token que puede emplearse para decodificación especulativa y que el autor cuantiza explícitamente en sus variantes.

El trabajo de este repositorio es exclusivamente de cuantización. El método `niki-allocator` opera a granularidad de tensor individual: estima el tipo óptimo para cada tensor, materializa las asignaciones candidatas y las evalúa con ejecuciones KLD reales sobre dos corpus de referencia. El corpus `niki-small-plus-2` cubre código, prompts agénticos, razonamiento, lógica dura, inglés y ruso; el corpus `independent-v2` cubre textos multilingües, web, artículos científicos, matemáticas y textos legales, sin trazas de razonamiento ni código. Las comparaciones se hicieron con cuantizaciones descargadas el 16 y el 21 de agosto de 2026.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito en modo *thinking* (etiqueta `thinking` en el repositorio).
- Generación y asistencia de código (etiqueta `coding`).
- Flujos agénticos y razonamiento multi-paso (etiqueta `agentic`).
- Entrada multimodal imagen-texto (`pipeline_tag: image-text-to-text`), heredada del modelo base.
- Decodificación especulativa mediante la cabeza MTP incluida en las cuantizaciones.
- Compatibilidad con endpoints (`endpoints_compatible`) y con llama.cpp.
- Soporte de *tool calling* / *function calling*: no confirmado explícitamente en la información proporcionada.

## Casos de uso

- Asistencia de código en local: desplegar una cuantización GGUF en llama.cpp sobre una estación de trabajo con GPU de consumo para autocompletado, revisión de parches y explicación de código, aprovechando la preservación de la cabeza MTP para decodificación especulativa.
- Agentes autónomos con pasos múltiples: usar el modo *thinking* para tareas de planificación y ejecución encadenada donde el modelo debe razonar antes de actuar, con la ventaja de que el GGUF corre en infraestructura propia sin dependencia de API.
- Procesamiento de documentos con imagen: al heredar la modalidad imagen-texto, puede extraer y razonar sobre contenido de capturas, diagramas o páginas escaneadas en pipelines de digitalización.
- Evaluación comparativa de cuantizaciones: el repositorio incluye gráficas de KLD, RMS Δp, p95/p99/p99.9, coincidencia de top-1 y perplejidad, lo que permite elegir el nivel de cuantización según el presupuesto de VRAM y el corpus objetivo (código/agéntico frente a multilingüe/científico).
- Despliegue en entornos con VRAM limitada: seleccionar una variante de menor tamaño para servir el modelo en una sola GPU consumer, aceptando la pérdida de fidelidad documentada en las gráficas.
- Sustitución de cuantizaciones de terceros: comparar directamente contra las versiones de unsloth, bartowski o lmstudio-community sobre los mismos corpus para decidir qué proveedor usar en producción.
- Investigación sobre cuantización: reutilizar la metodología de asignación por tensor y las métricas publicadas como referencia para estudiar el impacto de la cuantización selectiva en modelos de ~27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas de fidelidad de cuantización (KLD media, RMS Δp, p95/p99/p99.9 de KLD, coincidencia de top-1 y perplejidad) frente a cuantizaciones de otros proveedores, sin valores numéricos en el texto extraído y sin resultados de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada: no disponible con cifras concretas. Como referencia de orden de magnitud, un modelo denso de 27,3B en FP16 requiere aproximadamente 55 GB solo para pesos; las cuantizaciones GGUF reducen esa cifra de forma proporcional a los bits por peso, pero el repositorio no publica el tamaño de cada archivo en la información disponible.
- GPU recomendadas: no especificadas por el autor. Para FP16 serían necesarias A100 80 GB, H100 o varias GPU; para cuantizaciones de 4-5 bits, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) son candidatas plausibles, si bien el dato no está confirmado en la información proporcionada.
- GPU de consumo: probablemente viable en tarjetas de 24 GB con cuantizaciones bajas, condicionado al tamaño real de cada archivo GGUF, que no se detalla.
- Opciones de despliegue: llama.cpp (etiqueta explícita), y por extensión los runners compatibles con GGUF (Ollama, LM Studio, servidores basados en llama.cpp). Compatibilidad declarada con endpoints.
- Latencia y throughput: no disponibles. La cabeza MTP permite decodificación especulativa, lo que en principio aumenta el throughput, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| NikiKrutan/Qwen3.8-27B-MTP-GGUF | 27,3B | No disponible | GGUF | Apache 2.0 | Cuantizacion por tensor con MTP preservado; metricas KLD publicadas |
| unsloth/Qwen3.8-27B-GGUF | 27,3B (base comun) | No disponible | GGUF | Apache 2.0 | Elimina MTP en cuantizaciones bajas segun la model card; comparado en las graficas |
| bartowski/Qwen3.8-27B-GGUF | 27,3B (base comun) | No disponible | GGUF | Apache 2.0 | Cuantizacion por grupos; comparado en las graficas |
| lmstudio-community/Qwen3.8-27B-GGUF | 27,3B (base comun) | No disponible | GGUF | Apache 2.0 | Orientado a LM Studio; comparado en las graficas |

También se comparan en la model card las cuantizaciones de AtomicChat, mudler (APEX) y byteshape, todas sobre el mismo modelo base. No se dispone de comparación con modelos de arquitectura distinta.

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: hereda todos los sesgos y limitaciones del Qwen3.8-27B original, que no se documentan en la información disponible.
- Riesgo de alucinación: inherente al modelo base; no se publican tasas de alucinación ni evaluaciones de veracidad.
- Las métricas de calidad presentadas (KLD, perplejidad, coincidencia de top-1) son medidas de fidelidad respecto al modelo original, no de capacidad en tareas downstream. Una KLD baja no garantiza mejor rendimiento en un caso de uso concreto.
- Las gráficas comparativas son elaboradas por el propio autor del repositorio, con corpus propios (`niki-small-plus-2`) y un corpus independiente (`independent-v2`); conviene leerlas con cautela por posible sesgo de selección.
- El autor reconoce haber aplicado una corrección de tamaño fijo a las cuantizaciones MTP de unsloth v3.0 para una comparación "sin MTP", lo que introduce una manipulación metodológica que él mismo califica de poco honesta para el usuario final.
- El tamaño del repositorio (231 GB) implica que la descarga completa es costosa; conviene bajar solo la variante necesaria.
- Idiomas soportados no declarados: no se puede garantizar calidad en castellano sin evaluación propia.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y verificar las condiciones del modelo base Qwen3.8-27B.
- No se dispone de información sobre latencia, throughput ni requisitos de VRAM por variante, lo que dificulta el dimensionamiento previo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NikiKrutan/Qwen3.8-27B-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fine-tune recomendado por el autor (Kiwen1.2-27B): https://huggingface.co/NikiKrutan/Kiwen1.2-27B-MTP-GGUF
- Cuantizaciones unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Cuantizaciones AtomicChat: https://huggingface.co/AtomicChat/Qwen3.8-27B-GGUF
- Cuantizaciones bartowski: https://huggingface.co/bartowski/Qwen3.8-27B-GGUF
- Cuantizaciones lmstudio-community: https://huggingface.co/lmstudio-community/Qwen3.8-27B-GGUF
- Cuantizaciones mudler (APEX): https://huggingface.co/mudler/Qwen3.8-27B-APEX-GGUF
- Cuantizaciones byteshape: https://huggingface.co/byteshape/Qwen3.8-27B-GGUF
