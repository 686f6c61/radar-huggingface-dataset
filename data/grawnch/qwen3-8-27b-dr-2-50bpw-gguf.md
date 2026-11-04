# Grawnch/Qwen3.8-27B-DR-2.50bpw-GGUF

## Resumen

Qwen3.8-27B-DR-2.50bpw-GGUF es una cuantización GGUF de 2,50 bits por peso (aproximadamente) del modelo base Qwen/Qwen3.8-27B, publicada por el usuario Grawnch en HuggingFace. El modelo base pertenece a la familia Qwen3.8 de Alibaba, con 26.895.998.464 parámetros totales (unos 26,9 mil millones) y una longitud de contexto declarada de 32.768 tokens. Esta versión cuantizada reduce el peso del repositorio a 14,4 GB, lo que permite ejecutar un modelo de casi 27B en hardware con menos VRAM que la versión en BF16.

El interés de esta ficha radica en que se trata de una cuantización agresiva (2,50 bpw) orientada a maximizar la compresión, con métricas de degradación publicadas por el autor (perplejidad, divergencia KL y acuerdo top-1/top-5 frente a BF16). El autor reporta una puntuación del 93,3% en AIME 2025 (28/30), lo que sugiere que, pese a la compresión, el modelo conserva capacidad de razonamiento matemático en esta evaluación concreta.

Es relevante ahora porque las cuantizaciones de muy baja precisión (por debajo de 3 bpw) son un área activa de investigación práctica para desplegar modelos grandes en GPUs de consumo. Sin embargo, la model card es escasa: no documenta licencia, idiomas, ni detalles de entrenamiento del modelo base, y el repositorio no tiene descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; arquitectura no documentada en la información proporcionada) |
| Parámetros totales | 26.895.998.464 (~26,9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | GGUF, 2,50 bpw; el autor menciona `Q2_K` / `Q3_K` / `Q4_K` como formatos de referencia |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |
| Tamaño del repositorio | 14,4 GB |
| Modelo base | Qwen/Qwen3.8-27B |
| Fecha de creación | 2026-11-04 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.8-27B en la documentación proporcionada. El dato objetivo disponible es el recuento de parámetros (26.895.998.464), que sitúa al modelo en la categoría de ~27B. No se indica si emplea un transformer denso, una mezcla de expertos (MoE) o una arquitectura híbrida, ni se documentan los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO).

Respecto a la cuantización, el autor publica métricas de degradación frente a BF16 sobre varios conjuntos de evaluación: WikiText-2 (contexto 2048 y 1024), un conjunto extendido de razonamiento/matemáticas/código (`Ext`) y generación estructurada (`SG`). Estas métricas permiten cuantificar la pérdida de calidad introducida por la compresión a 2,50 bpw, pero no describen el proceso de cuantización en sí (algoritmo, calibración, tratamiento de capas sensibles).

## Capacidades

- Generación de texto y razonamiento: el autor reporta un 93,3% en AIME 2025 (28/30), lo que indica capacidad de razonamiento matemático competitivo en esa prueba.
- Razonamiento matemático extendido: el conjunto de evaluación `Ext` (razonamiento/matemáticas/código) muestra una perplejidad de 17,3456 frente a 14,4714 en BF16.
- Generación de código: incluida en el conjunto `Ext`, aunque no se desglosan resultados específicos por tarea.
- Generación estructurada: evaluada con el conjunto `SG`, con perplejidad de 2,9534 frente a 2,5256 en BF16.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue en GPUs de consumo: con 14,4 GB de pesos, el modelo puede cargarse en GPUs con 16 GB de VRAM (por ejemplo, RTX 4080/4090 o A4000) usando llama.cpp u Ollama, aunque el contexto de 32.768 tokens requerirá gestión cuidadosa de la memoria KV.
- Razonamiento matemático en entornos con recursos limitados: el 93,3% en AIME 2025 sugiere que puede emplearse para resolución de problemas matemáticos en estaciones de trabajo sin GPUs de datacenter.
- Prototipado rápido de asistentes conversacionales: la ventana de 32.768 tokens permite conversaciones multi-turno con contexto moderadamente largo en un portátil con GPU dedicada.
- Evaluación comparativa de cuantizaciones: las métricas de PPL, KLD y acuerdo top-1/top-5 publicadas permiten usar este modelo como referencia para estudiar el impacto de la compresión a 2,50 bpw en tareas de razonamiento.
- Generación de código en local: el conjunto `Ext` incluye código; puede integrarse en editores o pipelines locales donde no se quiera enviar código a APIs externas, siempre que se valide la calidad tras la cuantización.
- Investigación sobre degradación por cuantización: la tabla de perplejidad y divergencia KL frente a BF16 facilita estudios sobre cómo afecta la compresión extrema a distintas familias de tareas (texto general, matemáticas, generación estructurada).
- Generación estructurada (JSON, plantillas): el bajo PPL en el conjunto `SG` (2,9534) indica que el modelo conserva buena capacidad para producir salidas con formato, útil en extracción de datos y rellenado de plantillas.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Benchmark | Resultado |
|---|---|
| AIME 2025 | 93,3% (28/30) |

Métricas de degradación frente a BF16 (valor cuantizado, valor BF16 entre paréntesis):

| Conjunto de evaluación | Perplejidad (PPL) | NLL | KL Divergence | Acuerdo top-1 | Acuerdo top-5 |
|---|---|---|---|---|---|
| WikiText-2 (ctx 2048) | 7,5964 (6,5210) | 2,0277 (1,8750) | 0,1942 | 82,04% | 98,00% |
| WikiText-2 test completo (145 × 2048, 296.815 tokens) | 8,3371 (7,2740) | 2,1207 (1,9843) | — | — | — |
| WikiText-2 (ctx 1024) | 8,5715 (7,0795) | 2,1484 (1,9572) | 0,2125 | 80,69% | 97,41% |
| Ext (razonamiento/matemáticas/código) | 17,3456 (14,4714) | 2,8533 (2,6722) | 0,2967 | 77,19% | 96,78% |
| Structured Generation (SG) | 2,9534 (2,5256) | 1,0830 (0,9265) | 0,2165 | 83,04% | 98,09% |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas directas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 14,4 GB. Con overhead de contexto y memoria KV para 32.768 tokens, se recomienda al menos 16-18 GB de VRAM para contexto completo; con contexto reducido puede ajustarse a ~15-16 GB.
- GPUs recomendadas: RTX 4090 (24 GB) o RTX 4080 (16 GB) para inferencia local; A100/H100 para despliegues con mayor concurrencia o contexto completo.
- ¿Cabe en GPU de consumo? Sí, en GPUs con 16 GB o más de VRAM (RTX 4080, 4090, A4000, A5000). En GPUs de 12 GB no cabe sin offloading a RAM.
- Opciones de despliegue: llama.cpp y Ollama son las vías naturales para GGUF; también es posible usar el backend GGUF de vLLM o TGI si soportan el formato de cuantización concreto. El tag `endpoints_compatible` del repositorio sugiere compatibilidad con endpoints de HuggingFace.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. A continuación se indica la comparación estructural posible:

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-DR-2.50bpw-GGUF (este) | ~26,9B | 32.768 | GGUF 2,50 bpw | no disponible | HuggingFace (0 descargas) |
| Qwen/Qwen3.8-27B (base) | ~26,9B | no disponible | safetensors (presumiblemente) | no disponible | HuggingFace |
| Otras cuantizaciones GGUF del mismo base | ~26,9B | 32.768 | GGUF Q2_K/Q3_K/Q4_K | no disponible | no disponible |

No se han identificado en la información proporcionada alternativas de otros desarrolladores con las que comparar parámetros, contexto y rendimiento de forma fiable.

## Limitaciones y advertencias

- Cuantización muy agresiva (2,50 bpw): la perplejidad en WikiText-2 sube de 6,5210 (BF16) a 7,5964, y en el conjunto `Ext` de 14,4714 a 17,3456. El acuerdo top-1 cae al 77,19% en tareas de razonamiento/código, lo que implica una degradación notable en tareas complejas.
- Riesgo de alucinación: no evaluado en la información disponible; la compresión extrema puede amplificar errores en generación abierta.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas: no se especifican los idiomas soportados; no puede confirmarse un rendimiento multilingüe fiable.
- Licencia: no disponible. Antes de usar en producción comercial es imprescindible verificar la licencia del modelo base Qwen/Qwen3.8-27B, ya que la cuantización hereda sus restricciones.
- Madurez del repositorio: creado el 2026-11-04, con 0 descargas y 0 likes; no hay evidencia de validación por parte de la comunidad.
- Contexto: 32.768 tokens declarados; no se especifica si la cuantización afecta a la ventana efectiva ni si hay degradación con contextos largos.
- Formato `Q2_K` / `Q3_K` / `Q4_K` mencionado en la model card: no queda claro si el archivo publicado corresponde exactamente a uno de esos formatos o a una mezcla; conviene verificar los archivos del repositorio antes de desplegar.
- Uso en producción: al tratarse de una cuantización no oficial del modelo base, no hay garantías de soporte ni de paridad de comportamiento con la versión original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Grawnch/Qwen3.8-27B-DR-2.50bpw-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
