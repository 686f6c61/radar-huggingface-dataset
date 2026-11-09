# Entrit/Muse-Glimmer-30B-d2

## Resumen

Muse-Glimmer-30B-d2 es una versión cuantizada del modelo multimodal Muse-Glimmer-30B de meta-models, publicada por Entrit. La modificación afecta exclusivamente a las capas lineales del modelo de lenguaje: las proyecciones de atención y de MLP se sustituyen por valores del códec propietario d2, mientras que el codificador visual, los embeddings, la cabeza de salida y las normas permanecen intactos respecto al modelo base. El resultado es un modelo de 29.776.626.688 parámetros con capacidad image-text-to-text, orientado a conversación y con licencia Apache 2.0.

La relevancia técnica del artefacto no está en el rendimiento bruto, sino en el método de compresión: d2 codifica cada peso en uno de nueve niveles (`{0, ±1, ±2.83, ±5.20, ±8}`) multiplicados por una escala compartida por grupo de 64 pesos, lo que equivale a unos 3,4 bits de información por peso. Sin embargo, los ficheros publicados almacenan los valores ya de-cuantizados a bf16, por lo que el repositorio ocupa 59,6 GB, prácticamente el mismo tamaño que el modelo original, y no se obtiene ningún ahorro de memoria en inferencia.

El modelo es útil para quien quiera evaluar el impacto de una cuantización ternaria agresiva sobre un transformer multimodal de 30B sin reimplementar el pipeline de carga: funciona con `transformers` 5.16 o superior mediante `AutoModelForImageTextToText`. La información pública es limitada (7 descargas, sin datos de idiomas ni documentación adicional sobre el entrenamiento del base), y el códec d2 está sujeto a patentes pendientes de Entrit Systems, lo que condiciona su uso más allá de la inferencia del artefacto publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con arquitectura `muse_glimmer`; capas lineales del LM cuantizadas con códec d2 |
| Parámetros totales | 29.776.626.688 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | d2 ternario multinivel: 9 niveles `{0, ±1, ±2.83, ±5.20, ±8}` con una escala por grupo de 64 pesos (~3,4 bits/peso); pesos almacenados de-cuantizados a bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada de meta-models/Muse-Glimmer-30B) |
| Formato de pesos | safetensors (cargables con `transformers`) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de tipo image-text-to-text, con un codificador visual y un modelo de lenguaje. La intervención de Entrit se limita a las proyecciones lineales del LM (atención y MLP), que pasan a representarse con el códec d2: cuantización por grupos de 64 pesos con una escala por grupo y nueve niveles de reconstrucción. El codificador visual, los embeddings, la cabeza de salida y las capas de normalización se mantienen en su precisión original. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset, ni sobre si se aplicaron etapas de RLHF o DPO.

Tampoco se documenta ninguna innovación adicional en el pipeline de inferencia (decodificación especulativa, atención lineal, etc.). El autor recomienda `attn_implementation="sdpa"` para evaluación con contexto largo o por lotes, advirtiendo que la implementación `eager` agota la memoria en esos escenarios. Es destacable que la cuantización no reduce el tamaño en disco ni en VRAM tal como se distribuye: los pesos d2 se guardan ya de-cuantizados a bf16, de modo que el beneficio práctico es la evaluación del efecto de la cuantización, no el despliegue eficiente.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `image-text-to-text`.
- Procesamiento de imágenes junto con texto mediante `AutoProcessor` y `AutoModelForImageTextToText`.
- Razonamiento y matemáticas a nivel de benchmark: GSM8K 0,926 y MMLU 0,795 en la versión d2.
- Generación de código: HumanEval 0,976 en d2, muy próximo al 1,000 del base FP16.
- Seguimiento de instrucciones: IFEval 0,869 en d2.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (el campo de idiomas no está cumplimentado).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de métodos de cuantización: el modelo permite medir la degradación de un LM multimodal de 30B bajo un esquema ternario multinivel sin reimplementar la carga, comparando directamente contra el base FP16 con los mismos prompts y métricas.
- Investigación en compresión de pesos: útil para estudiar la relación entre bits por peso (~3,4 en d2) y caída de accuracy en tareas de razonamiento (MMLU −3,6 puntos), matemáticas (GSM8K −2,2) e instrucciones (IFEval −2,9).
- Prototipado de asistentes sobre documentos con imagen: al conservar el codificador visual intacto, puede emplearse para describir capturas, gráficos o diagramas junto a texto explicativo en entornos de investigación.
- Generación de código asistida en experimentos controlados: con HumanEval 0,976, es adecuado para pipelines de evaluación de code generation donde se quiera comparar el efecto de la cuantización frente al modelo de referencia.
- Ajuste fino o destilación sobre un modelo ya comprimido: al estar en bf16 y cargar con `transformers`, sirve como punto de partida para estudiar si el reentrenamiento recupera la pérdida de MMLU e IFEval.
- Docencia y divulgación técnica: ejemplo reproducible de cuantización por grupos con escala compartida y su impacto medible en benchmarks estándar, sin necesidad de infraestructura de serving especializada.
- Validación de compatibilidad de tooling: útil para verificar que una versión de `transformers` (5.16+) y una configuración de atención (`sdpa`) funcionan correctamente con la arquitectura `muse_glimmer` antes de migrar cargas de trabajo mayores.

## Benchmarks y rendimiento

| Benchmark | d2 | FP16 (base) | Delta |
|---|---|---|---|
| MMLU | 0,795 | 0,831 | −0,036 |
| GSM8K | 0,926 | 0,948 | −0,022 |
| HumanEval | 0,976 | 1,000 | −0,024 |
| IFEval | 0,869 | 0,898 | −0,029 |

No se han publicado en la información disponible resultados de benchmarks para otras tareas (visión, multilingüe) ni comparaciones con modelos de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 60 GB solo para pesos, más overhead de activaciones y caché KV; se requiere al menos una GPU de 80 GB (A100 80GB, H100 80GB) para una carga completa en una sola unidad.
- El repositorio pesa 59,6 GB, coherente con 29,78B parámetros en bf16; la cuantización d2 no reduce el espacio ocupado tal como se distribuye.
- GPU recomendadas: A100 80GB o H100 80GB para inferencia en una sola tarjeta; configuraciones multi-GPU (por ejemplo, 2×A100 40GB o 2×RTX 4090 24GB) mediante `device_map="auto"` si el sharding de `transformers` lo permite para esta arquitectura.
- No cabe en GPU de consumo individual: una RTX 4090 de 24 GB o RTX 3090 de 24 GB no puede alojar los pesos completos en bf16.
- Opciones de despliegue: `transformers` 5.16 o superior con `AutoModelForImageTextToText` y `attn_implementation="sdpa"`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | GSM8K | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Entrit/Muse-Glimmer-30B-d2 | 29,78B | No disponible | 0,795 | 0,926 | 0,976 | Apache 2.0 | Hugging Face |
| meta-models/Muse-Glimmer-30B (FP16) | 29,78B (base) | No disponible | 0,831 | 0,948 | 1,000 | Apache 2.0 | Hugging Face |
| Otras alternativas de 30B multimodal | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación documentada es contra el propio modelo base en FP16. No se dispone de datos de benchmarks ni de especificaciones de contexto para situar el modelo frente a alternativas de terceros de tamaño similar.

## Limitaciones y advertencias

- Pérdida de rendimiento medible frente al base: −3,6 puntos en MMLU, −2,9 en IFEval, −2,4 en HumanEval y −2,2 en GSM8K.
- Sin ahorro de memoria ni de disco: los pesos se publican de-cuantizados a bf16 (59,6 GB), por lo que la ventaja de los ~3,4 bits/peso no se materializa en el despliegue.
- El códec d2 está sujeto a patentes pendientes de Entrit Systems; la licencia Apache 2.0 cubre los pesos heredados del base, pero conviene revisar el alcance respecto al método de cuantización antes de un uso comercial del códec.
- Es una versión modificada del modelo base; los resultados pueden no ser reproducibles con otras implementaciones de d2 o con otros forks.
- Dependencia estricta de `transformers` 5.16 o superior para reconocer la arquitectura `muse_glimmer`; versiones anteriores no cargarán el modelo.
- `attn_implementation="eager"` agota la memoria en contexto largo o evaluación por lotes; es obligatorio usar `sdpa` en esos casos.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe ni calidad fuera del inglés.
- Sin información sobre sesgos, alineación, datos de entrenamiento ni filtros de seguridad del modelo base; riesgo de alucinación no evaluado en la información disponible.
- Comunidad y validación muy reducidas (7 descargas, 0 likes): no hay evidencia de uso en producción ni informes independientes de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Entrit/Muse-Glimmer-30B-d2
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Contacto del autor: eric@entrit.io
