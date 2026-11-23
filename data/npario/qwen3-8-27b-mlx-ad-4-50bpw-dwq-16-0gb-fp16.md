# npario/Qwen3.8-27B-MLX-AD-4.50bpw-DWQ-16.0GB-fp16

## Resumen

`npario/Qwen3.8-27B-MLX-AD-4.50bpw-DWQ-16.0GB-fp16` es un reempaquetado en float16 de un modelo multimodal Qwen de 27.356 millones de parámetros, derivado a su vez de `AtomicChat/Qwen3.8-27B-MLX-AD-4.50bpw-DWQ-16.0GB`. El autor del reempaquetado es el usuario de Hugging Face `npario`, mientras que el modelo original procede del ecosistema Qwen y ha sido cuantizado y adaptado para MLX por AtomicChat. La operación realizada es puramente de formato: convertir los tensores no cuantizados de bfloat16 a float16 para maximizar la compatibilidad con runtimes de inferencia que no soportan bfloat16.

El modelo resuelve un problema práctico de despliegue: permite ejecutar un modelo de 27B con capacidades de visión y lenguaje en hardware Apple Silicon mediante la librería MLX, con un peso total de repositorio de 16,4 GB gracias a una cuantización uniforme de 4 bits (grupo de 64, modo affine) que deja una precisión efectiva de aproximadamente 4,5 bits por peso. La conversión de bfloat16 a float16 es numéricamente sin pérdida, ya que ambos formatos son de 2 bytes y todos los valores bfloat16 son representables exactamente en float16.

La relevancia actual del modelo radica en tres factores: es multimodal (torre de visión completa incluida, 333 tensores), incorpora un módulo MTP (multi-token prediction) para decodificación especulativa que acelera la generación, y está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial. El pipeline declarado es `image-text-to-text` y la librería objetivo es `mlx`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión), con atención lineal híbrida y módulo MTP de 1 capa; familia Qwen3.8 |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits uniforme (affine, group size 64, ≈4,5 bits/peso); tensores no cuantizados en float16; KV cache TurboQuant 4-bit (en la evaluación) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); `model.safetensors` de 16.054.542.160 B + shard `model-mtp.safetensors` de ≈314 MB |

## Arquitectura y entrenamiento

La información disponible no detalla el proceso de entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí se documenta es la arquitectura de despliegue: un transformer multimodal con torre de visión (333 tensores completos, sin cuantizar) y un módulo de atención lineal identificable por los tensores `A_log`, `dt_bias` y `conv1d`, además de proyecciones `in_proj_a` e `in_proj_b`. La cuantización se aplica de forma uniforme a 4 bits en modo affine con grupo de 64 sobre 498 tensores, mientras que 1.682 tensores permanecen sin cuantizar (layer norms, componentes de atención lineal, escalas y sesgos de cuantización, y toda la torre de visión).

La innovación técnica destacable es el módulo MTP (multi-token prediction) de una capa, almacenado en un shard separado (`model-mtp.safetensors`, ≈314 MB) que el repositorio base no incluye. Este módulo habilita decodificación especulativa: predice varios tokens por paso y los valida con el modelo principal, acelerando la generación. Sus pesos de proyección están cuantizados a 4 bits con el mismo esquema que el resto del modelo, mientras que `mtp.fc`, layer norms y escalas/sesgos quedan en float16.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imágenes y vídeo (pipeline `image-text-to-text`, torre de visión incluida, IDs de tokens de imagen y vídeo en la configuración).
- Generación de código, evidenciada por la evaluación en MBPP (91,0 %).
- Modo de razonamiento configurable (`enable_thinking`), con niveles de esfuerzo variables (low, medium, xhigh) según la documentación del autor.
- Decodificación especulativa mediante MTP (multi-token prediction).
- Generación de gráficos vectoriales animados (SVG) en una sola pasada, demostrado en la model card con el ejemplo del pelícano en motocicleta en tres niveles de esfuerzo de razonamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- **Inferencia local en Apple Silicon**: el modelo está empaquetado específicamente para MLX y ocupa 16,4 GB, lo que permite ejecutarlo en Macs con memoria unificada de 32 GB o superior (la evaluación se hizo en un M2 Max de 32 GB). Es adecuado para desarrolladores que quieren un modelo de 27B multimodal sin depender de GPU dedicadas.
- **Asistencia de código en local**: con un 91,0 % en MBPP, el modelo es apto para autocompletado, generación de funciones y revisión de código dentro de un IDE o pipeline local, sin enviar código a servicios externos.
- **Automatización de tareas de razonamiento con latencia controlada**: el módulo MTP permite decodificación especulativa, útil en aplicaciones interactivas donde cada token cuenta, como chatbots o asistentes de terminal.
- **Análisis de imágenes y documentos**: al incluir la torre de visión completa, puede procesar capturas, diagramas o fotogramas de vídeo junto a instrucciones textuales, por ejemplo para extraer información estructurada de documentación técnica.
- **Generación de contenido visual programático**: la capacidad demostrada de generar SVG animado en una sola pasada sirve para producir ilustraciones, iconos animados o visualizaciones web a partir de una descripción textual.
- **Prototipado de agentes multimodales**: combinado con tool calling (si el runtime lo soporta) y razonamiento multi-paso, puede emplearse como núcleo de un agente que interpreta imágenes y ejecuta acciones, aunque esta capacidad no está documentada explícitamente.
- **Investigación y experimentación con cuantización**: el repositorio documenta con precisión el esquema de cuantización y la conversión de dtype, lo que lo convierte en un caso de estudio útil para quienes investigan técnicas de compresión y reempaquetado de pesos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| MBPP | 91,0 % (91/100) | 100 de 500 preguntas muestreadas (seed 42, estratificado, determinista); thinking mode activado; temperatura 1; MTP + KV cache TurboQuant 4-bit; oMLX v0.6.4 en macOS 27.0; M2 Max de 30 núcleos y 32 GB; 1,1 h de ejecución |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM/memoria estimada**: el repositorio pesa 16,4 GB; se necesita al menos esa cantidad de memoria unificada o VRAM, más overhead de KV cache y activaciones. La evaluación se realizó en un M2 Max de 32 GB, lo que sugiere que 32 GB es un mínimo práctico cómodo.
- **GPU recomendadas**: Apple Silicon (M1/M2/M3/M4 Max o Ultra) por el backend MLX. Para GPUs NVIDIA no se documenta soporte en este repositorio (los pesos son MLX, no GGUF).
- **Consumer GPU**: no se documenta compatibilidad con GPUs de consumo NVIDIA; el formato MLX está orientado a memoria unificada de Apple. En Macs de 32 GB o más entra sin problema.
- **Opciones de despliegue**: `mlx-lm` (documentado en la model card), oMLX (usado en la evaluación). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este repositorio concreto.
- **Latencia y throughput**: no se publican cifras de tokens por segundo; solo se indica que la ejecución completa del benchmark MBPP (100 preguntas) tardó 1,1 h con MTP y KV cache cuantizada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B MLX fp16) | 27,36B | no disponible | Apache 2.0 | MLX safetensors | Multimodal, MTP, 4,5 bits/peso |
| AtomicChat/Qwen3.8-27B-MLX-AD-4.50bpw-DWQ-16.0GB (base) | 27,36B | no disponible | Apache 2.0 | MLX safetensors (bfloat16 en capas no cuantizadas) | Sin shard MTP separado |
| Modelos Qwen de 27B en otros formatos (GGUF, safetensors estándar) | ~27B | no disponible | Apache 2.0 | GGUF / safetensors | No se dispone de datos comparativos de rendimiento en la información proporcionada |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación de rendimiento no puede establecerse.

## Limitaciones y advertencias

- **Compatibilidad restringida**: los pesos son MLX; no funcionan directamente en vLLM, llama.cpp, Ollama ni TGI sin conversión.
- **Conversión de dtype**: aunque la conversión de bfloat16 a float16 se declara numéricamente sin pérdida, cualquier runtime que espere bfloat16 debe validarse; el autor lo garantiza por la representabilidad exacta de los valores, pero no se aportan pruebas exhaustivas más allá de la afirmación.
- **Idiomas no documentados**: no se especifica la cobertura lingüística, lo que impide garantizar calidad en castellano u otros idiomas.
- **Contexto no documentado**: se desconoce la longitud máxima de contexto, un dato crítico para aplicaciones de documentos largos.
- **Riesgo de alucinación**: no se documentan evaluaciones de fidelidad ni tasas de alucinación; como todo modelo generativo, es susceptible de inventar información, especialmente en tareas de visión.
- **Sesgos**: no se publica información sobre sesgos demográficos, culturales o lingüísticos del modelo base.
- **Licencia Apache 2.0**: permite uso comercial, pero conviene verificar las condiciones del modelo Qwen original y de la cuantización de AtomicChat, ya que el repositorio solo declara la licencia del reempaquetado.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de su funcionamiento.
- **Benchmark limitado**: el único resultado publicado (MBPP, 91/100) procede de una muestra parcial y de un único entorno (M2 Max), sin comparación con otros modelos en las mismas condiciones.

## Enlaces

- Hugging Face: https://huggingface.co/npario/Qwen3.8-27B-MLX-AD-4.50bpw-DWQ-16.0GB-fp16
- Modelo base: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-AD-4.50bpw-DWQ-16.0GB
- Resultados completos del benchmark: https://omlx.ai/benchmarks/intelligence/dze8a496
- oMLX: https://omlx.ai/
