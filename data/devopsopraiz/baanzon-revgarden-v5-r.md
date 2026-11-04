# Devopsopraiz/Baanzon-Revgarden-V5-R

## Resumen

Baanzon-Revgarden-V5-R es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) publicado por Opraiz Technology Pvt Ltd bajo la marca Baanzon. Se distribuye como un checkpoint completo en FP8, sin censura declarada, y está orientado a generación de texto, razonamiento con modo "thinking", código y uso agéntico con tool calling. Su rasgo más llamativo es el tamaño: 753.329.940.480 parámetros totales según los pesos en safetensors, con un repositorio de 755,7 GB, lo que lo sitúa en la liga de los modelos frontera abiertos servidos en clústeres de GPUs Hopper.

El modelo se apoya en la arquitectura `glm_moe_dsa` declarada en los tags de HuggingFace, una variante MoE con atención dispersa (DSA, *DeepSeek Sparse Attention* o similar según la nomenclatura del autor), y se publica directamente en FP8 para aprovechar las unidades de cómputo de las GPU Hopper (H100/H200). Soporta diez idiomas: inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés.

Es relevante ahora porque combina tres tendencias del ecosistema abierto: checkpoints MoE de escala frontera, cuantización FP8 nativa como formato de distribución (no solo de inferencia) y control explícito del esfuerzo de razonamiento mediante el parámetro `reasoning_effort`. La licencia MIT facilita su adopción comercial, aunque el tamaño hace que el despliegue realista pase por infraestructura multi-GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención dispersa, familia `glm_moe_dsa` |
| Parametros totales | 753.329.940.480 (753,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (checkpoint publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture-of-Experts con atención dispersa, identificada en los metadatos como `glm_moe_dsa`. La publicación se hace en FP8, lo que sugiere que el entrenamiento o al menos el *post-training* se realizó con precisión reducida o que el checkpoint se ha convertido a FP8 para distribución, aprovechando el rendimiento nativo de FP8 en GPUs Hopper. El autor menciona un fichero `CRACK_SURGERY.json` que documenta una técnica de modificación a nivel de pesos aplicada a esta build, aunque no se detalla su contenido en la información disponible.

No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO u otras fases de alineamiento, ni los parámetros activos por token. Tampoco se especifica la longitud de contexto soportada. El modelo declara explícitamente la etiqueta `uncensored`, lo que implica que no se ha aplicado un filtrado de seguridad agresivo en la fase de alineamiento, y ofrece un modo de razonamiento con control de esfuerzo (`reasoning_effort`) que solo acepta `"low"` y `"high"`, con fallback a `max` para cualquier otro valor.

## Capacidades

- Generación de texto conversacional multi-turno en diez idiomas.
- Razonamiento explícito con modo "thinking" y control de esfuerzo mediante `reasoning_effort` (`"low"` o `"high"`, con `max` como comportamiento por defecto).
- Generación y asistencia de código, según declara la model card.
- Tool calling y function calling para integración en pipelines agénticos.
- Capacidades agénticas y razonamiento multi-paso.
- Multilingüismo nativo: inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés.
- Checkpoint sin censura (`uncensored`), sin filtros de contenido declarados.
- Inferencia FP8 nativa en GPUs Hopper.

## Casos de uso

- **Atención al cliente multilingüe automatizada**: el modelo cubre diez idiomas de forma nativa, lo que permite atender a usuarios en español, árabe, hindi o coreano sin modelos auxiliares de traducción, manteniendo conversaciones multi-turno con un único endpoint.
- **Asistentes de código en producción**: con soporte de tool calling, puede integrarse en pipelines de CI/CD para revisión de parches, generación de tests o explicación de errores, invocando herramientas externas (linters, compiladores, APIs de repositorio) mediante function calling.
- **Agentes autónomos de razonamiento multi-paso**: el modo thinking con `reasoning_effort` permite ajustar el coste computacional por consulta; en tareas de planificación se usaría `"high"` con `max_tokens >= 2600`, y en consultas interactivas `"low"` para reducir latencia.
- **Investigación en alineamiento y evaluación de modelos sin censura**: al distribuirse como checkpoint `uncensored` con licencia MIT, es útil para estudiar comportamientos del modelo en dominios donde los filtros de seguridad suelen bloquear respuestas, así como para comparar con versiones alineadas.
- **Generación de documentación técnica multilingüe**: traducción y redacción de documentación en los diez idiomas soportados, aprovechando el contexto largo si se confirma la ventana disponible (no publicada).
- **Análisis y resumen de grandes volúmenes de texto**: la escala MoE permite procesar documentos extensos por lotes en infraestructura con múltiples H100, por ejemplo para resumen de contratos o informes en varias lenguas.
- **Prototipado de asistentes de voz o chat en productos SaaS**: integrable vía vLLM o TGI en clústeres Hopper, con un system prompt de identidad ya definido por el autor para endpoints públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada en FP8**: con 753,3 B de parámetros en FP8 (1 byte por parámetro), los pesos ocupan aproximadamente 753 GB, a los que hay que sumar KV cache y overhead del runtime. El repositorio completo pesa 755,7 GB.
- **GPU recomendadas**: clústeres de NVIDIA H100 (80 GB) u H200; se necesitan al menos 10 GPU H100 solo para alojar los pesos, y más para margen de KV cache y paralelismo. El FP8 nativo está optimizado para Hopper.
- **Consumer GPU**: no cabe en ninguna GPU de consumo (RTX 4090 con 24 GB, RTX 5090, etc.). Requiere infraestructura de centro de datos.
- **Opciones de despliegue**: vLLM y TGI son las opciones naturales para FP8 en Hopper; llama.cpp u Ollama no son viables a esta escala sin cuantizaciones mucho más agresivas, que no se distribuyen en este repositorio.
- **Latencia y throughput**: no disponibles en la información proporcionada. El autor recomienda `reasoning_effort: "low"` para cargas interactivas y `max_tokens >= 2600` cuando se usa el modo `max`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Baanzon-Revgarden-V5-R | 753,3 B (MoE) | no disponible | MIT | safetensors FP8 | Uncensored, 10 idiomas, reasoning_effort |
| DeepSeek-V3 (referencia) | 671 B (MoE) | 128 K | MIT-like | safetensors BF16/FP8 | MoE con atención dispersa, benchmarks públicos |
| Qwen3-235B-A22B (referencia) | 235 B (MoE, 22 B activos) | 128 K | Apache 2.0 | safetensors | Menor escala, benchmarks públicos |
| Llama 3.1 405B (referencia) | 405 B (denso) | 128 K | Llama Community License | safetensors | Denso, no MoE |

Nota: los datos de los modelos de referencia son orientativos y no proceden de la información proporcionada sobre Baanzon-Revgarden-V5-R; se incluyen solo como contexto de categoría. No hay benchmarks públicos de este checkpoint que permitan una comparación de rendimiento real.

## Limitaciones y advertencias

- **Tamaño prohibitivo**: 753 GB en FP8 exigen clúster multi-GPU Hopper; no es desplegable en hardware de consumo ni en una sola GPU de 80 GB.
- **Sin benchmarks publicados**: no hay datos de MMLU, HumanEval, GSM8K ni similares, lo que impide validar las capacidades declaradas antes de invertir en infraestructura.
- **Contexto desconocido**: no se publica la longitud de contexto, un dato crítico para casos de uso con documentos largos o conversaciones extensas.
- **Modo uncensored**: la ausencia de filtros de seguridad implica riesgo de generar contenido dañino, sesgado o legalmente problemático; requiere moderación externa en producción.
- **Riesgo de alucinación**: no hay información sobre fases de RLHF/DPO ni sobre mitigaciones de alucinación; a esta escala y sin datos de evaluación, el riesgo debe asumirse alto.
- **Comportamiento del parámetro `reasoning_effort`**: solo `"low"` y `"high"` son válidos; cualquier otro valor (incluido `off` o un `false` booleano por parseo YAML) cae a `max`, y no es posible desactivar el razonamiento. Esto puede inflar el consumo de tokens y la latencia si no se configura `max_tokens` adecuadamente.
- **Idiomas**: aunque declara diez idiomas, no se especifica el nivel de competencia por idioma; el serbio y el hindi, por ejemplo, suelen tener menos datos de entrenamiento que el inglés o el chino.
- **Licencia MIT**: permisiva para uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad legal del uso recae en el desplegador.
- **Repositorio con 0 descargas y 0 likes**: no hay evidencia de uso comunitario ni de validación independiente del checkpoint.
- **Técnica `CRACK_SURGERY.json`**: el autor menciona una modificación a nivel de pesos no documentada en detalle; conviene auditar el checkpoint antes de usarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Devopsopraiz/Baanzon-Revgarden-V5-R
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
