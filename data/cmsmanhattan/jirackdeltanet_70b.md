# CMSManhattan/JiRackDeltaNet_70b

## Resumen

JiRackDeltaNet 70B es un modelo de lenguaje híbrido de 69.930 millones de parámetros desarrollado por CMSManhattan (Konstantin Grabko). Se trata de un decodificador que combina 96 capas de Gated DeltaNet (atención lineal) con 32 capas de atención completa con puerta, siguiendo el diseño de Qwen 3.5 pero reimplementado en el código propio JiRack del autor. El modelo parte de una base Qwen (licencia Apache 2.0), sobre la que se modificó la arquitectura y se aplicó un ajuste fino supervisado (SFT) con datos propios de chat, razonamiento, código, matemáticas y tool calling.

La propuesta diferencial es doble. Por un lado, la arquitectura híbrida lineal/atención completa reduce el coste computacional en contextos largos, y el vocabulario de 248.320 tokens (tokenizador de Qwen 3.5) permite un empaquetado eficiente del texto. Por otro, el autor publica cuantizaciones agresivas —FP8 con escalas de bloque de 128×128 y GGUF Q3_K_M, Q4_K_M y Q6_K— que llevan un modelo de ~70B a 33,89 GB en su versión más pequeña, haciéndolo viable en CPU y en GPUs de consumo alto.

El modelo se encuentra en estado beta (primer SFT). El tool calling funciona con solidez (109/117 en la prueba interna del autor, 93,2 %), pero el modelo tiende a invocar la herramienta en lugar de pedir aclaración cuando falta un argumento obligatorio (7/15 en esa categoría). No hay resultados publicados de GSM8K ni HumanEval.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificador híbrido, 128 capas: 96 Gated DeltaNet (atención lineal) + 32 de atención completa con puerta (cada 4.ª capa es atención completa) |
| Parámetros totales | 69.934.845.440 (~69,93B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (los ejemplos de despliegue usan `-c 8192`, pero no se especifica el máximo entrenado) |
| Tipos de cuantización | bf16 (raíz del repo), FP8 e4m3 con escalas de bloque 128×128 (`sft_final_fp8/`), GGUF Q3_K_M, Q4_K_M y Q6_K (`gguf/`) |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th |
| Licencia | other (derivada de Qwen, Apache 2.0; condiciones concretas no detalladas en la información disponible) |
| Formato de pesos | safetensors (bf16 y FP8), GGUF |

Otras especificaciones: dimensión oculta 5120; FFN 26624 con SwiGLU; atención completa con 24 cabezas de consulta y 4 de clave/valor, dimensión de cabeza 256, puerta de salida, RoPE parcial al 25 %, secciones mRoPE intercaladas [11, 11, 10] y RoPE theta 1e7; Gated DeltaNet con 16 cabezas de clave, 48 de valor, dimensión de cabeza 128 y convolución causal de kernel 4; vocabulario de 248.320 tokens con embeddings de entrada y salida no atados; cabeza MTP (predicción multi-token) de una capa.

## Arquitectura y entrenamiento

La arquitectura es un decodificador híbrido de 128 capas que alterna bloques de Gated DeltaNet —una forma de atención lineal con estado recurrente y convolución causal— con bloques de atención completa con puerta cada cuatro capas. Esta mezcla busca conservar la calidad de la atención completa en las capas críticas mientras reduce el coste de memoria y cómputo del resto, algo relevante en contextos largos. La atención completa incorpora RoPE parcial (25 % de las dimensiones), secciones mRoPE intercaladas [11, 11, 10] y theta de 1e7, lo que apunta a un uso previsto con secuencias largas y posiblemente multimodales en fases posteriores. El modelo incluye además una cabeza MTP de una capa, útil para decodificación especulativa o entrenamiento con predicción multi-token.

El entrenamiento parte de un modelo Qwen (Apache 2.0) cuya arquitectura y pesos fueron modificados en el código JiRack del autor y posteriormente ajustados con SFT sobre datos propios de chat, razonamiento, código, matemáticas y tool calling. La receta de entrenamiento y el dataset no se publican. El autor describe una técnica de expansión de modelos ("model expansion") basada en ensanchar el FFN de cada capa y duplicar bloques con proyecciones de salida inicializadas a cero, congelando los bloques originales durante el ajuste para mitigar el olvido catastrófico; no se especifica si esta técnica concreta se aplicó a esta versión. No se documentan fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en 13 idiomas (en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th).
- Razonamiento y resolución de problemas aritméticos sencillos en varios pasos (el ejemplo de la model card resuelve correctamente un problema de cambio).
- Generación de código: el autor lo describe como un modelo "bueno para código y agentes", aunque no aporta métricas de HumanEval.
- Tool calling / function calling compatible con la API de OpenAI: 38/38 en llamadas simples, 19/19 en llamadas paralelas, 20/20 en seguimiento a partir de un resultado de herramienta y 25/25 en casos donde no se necesita herramienta.
- Razonamiento multi-paso y uso en agentes, con modo de razonamiento desactivable (`--reasoning off` en llama.cpp).
- Tokenizador con vocabulario orientado a robótica, según el autor, para la próxima actualización del modelo.
- Cabeza MTP para predicción multi-token (potencial decodificación especulativa).
- Capacidad de pedir aclaración ante argumentos faltantes: parcial (7/15), es la principal carencia declarada.

## Casos de uso

- Automatización de atención al cliente con tool calling: el modelo puede encadenar consultas a APIs internas (estado de pedido, devoluciones) y responder a partir del resultado; su 20/20 en seguimiento lo hace adecuado para flujos multi-turno con herramientas, aunque conviene añadir una capa de validación de argumentos por la debilidad en pedir aclaraciones.
- Despliegue en CPU sin GPU: la cuantización Q3_K_M (33,89 GB) corre en `llama-server` a 5,17 tokens/s de generación y 20,1 tokens/s de procesamiento de prompt en un GH200 Grace con 64 hilos, lo que permite servir un modelo de ~70B en infraestructura sin acelerador.
- Servicio en una única GPU de 96 GB: la copia FP8 (73 GB) cabe en una GPU de 96 GB con un error relativo medio de pesos del 2,65 %, útil para entornos con una sola A100/H100 de 80-96 GB donde no se puede repartir el modelo.
- Asistente de código en pipelines de CI/CD: integrado mediante la API compatible con OpenAI de `llama-server`, puede generar parches, explicar errores de compilación o redactar mensajes de commit, con la ventaja de que el vocabulario de 248.320 tokens reduce el número de tokens por fragmento de código.
- Agentes de automatización de escritorio o RPA: la combinación de tool calling fiable en llamadas simples y paralelas con un modelo pequeño en disco (Q4_K_M, 42,65 GB) permite orquestar acciones sobre herramientas externas en máquinas con recursos limitados.
- Prototipado de robótica e integración con el tokenizador específico del autor: aunque el tokenizador de robótica se anuncia para la próxima versión, el modelo actual sirve como banco de pruebas para pipelines de instrucciones y llamadas a funciones en entornos de control.
- Evaluación de arquitecturas híbridas lineal/atención: investigadores pueden usar el código de una sola pieza (`JiRackDeltaNet_70b.py`) con nombres de parámetros compatibles con `Qwen3_5ForCausalLM` para experimentar con atención lineal sin reescribir el cargador.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Tool calling, total (117 casos, GGUF Q3_K_M) | 109/117 (93,2 %) |
| Llamada simple (un tool, todos los argumentos) | 38/38 |
| Llamadas paralelas | 19/19 |
| Seguimiento a partir de resultado de tool | 20/20 |
| Sin necesidad de tool | 25/25 |
| Aclaración de argumento faltante | 7/15 |
| GSM8K | No medido |
| HumanEval | No medido |
| MMLU | No disponible |

Rendimiento de inferencia en CPU (GH200 Grace, 64 hilos, `llama-bench`):

| Cuantización | Tamaño | Prompt (tokens/s) | Generación (tokens/s) |
|---|---|---|---|
| Q3_K_M | 33,89 GB | 20,1 | 5,17 |
| Q4_K_M | 42,65 GB | 50,2 | 5,04 |
| Q6_K | 57,40 GB (2 partes) | 45,3 | 4,11 |

## Requisitos de hardware

- VRAM estimada: bf16 requiere ~140 GB (no cabe en una GPU única de 80 GB); FP8 requiere ~73 GB y cabe en una GPU de 96 GB; GGUF Q6_K ocupa 57,40 GB, Q4_K_M 42,65 GB y Q3_K_M 33,89 GB.
- GPU recomendadas: H100 o A100 de 80 GB para FP8 con reparto en dos tarjetas o una GPU de 96 GB (H100 NVL, H200) para FP8 en una sola; para bf16 se necesitan al menos dos A100/H100 de 80 GB.
- GPU de consumo: Q3_K_M (33,89 GB) y Q4_K_M (42,65 GB) no caben en GPUs de 24 GB; encajan en configuraciones de 48 GB (RTX 6000 Ada, A6000) y, con holgura, en 64 GB. En 24 GB habría que recurrir a offload parcial a RAM, con la consiguiente caída de velocidad.
- Despliegue: `llama-server` de llama.cpp con `--jinja --reasoning off` para los GGUF; el repositorio incluye además pesos safetensors compatibles con el cargador de Qwen 3.5, por lo que debería poder servirse con vLLM o TGI, aunque la información disponible no documenta recetas para estos motores. El autor menciona soporte de Ollama en las etiquetas.
- Latencia y throughput: en CPU, 4,11-5,17 tokens/s de generación y 20,1-50,2 tokens/s de prompt según cuantización. No se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JiRackDeltaNet 70B | 69,93B | No disponible | 109/117 (prueba propia) | other (base Qwen Apache 2.0) | Hugging Face, GGUF, FP8 |
| Qwen 3.5 (base arquitectónica) | No disponible | No disponible | No disponible | Apache 2.0 | Hugging Face |
| Qwen2.5 72B | 72,7B | 131.072 tokens | No medido en esta ficha | Apache 2.0 | Hugging Face, GGUF, AWQ |
| Llama 3.3 70B | 70,6B | 128.000 tokens | No medido en esta ficha | Llama 3.3 Community License | Hugging Face, GGUF |

La comparación con Qwen2.5 72B y Llama 3.3 70B es orientativa por tamaño y categoría; no hay benchmarks públicos de JiRackDeltaNet 70B (MMLU, GSM8K, HumanEval) que permitan una comparación de calidad. La ventaja diferencial del modelo es la disponibilidad de cuantizaciones muy agresivas (Q3_K_M a 33,89 GB) y una arquitectura híbrida que reduce el coste de atención, frente a los transformers densos convencionales.

## Limitaciones y advertencias

- Estado beta: es el primer SFT publicado; el autor advierte que la próxima versión añadirá ajuste fino en preguntas de aclaración.
- Debilidad en aclaraciones: cuando falta un argumento obligatorio, el modelo invoca la herramienta en lugar de preguntar (8 de los 15 casos fallidos, 7/15 correctos). En producción conviene validar argumentos antes de ejecutar la herramienta.
- Sin benchmarks de calidad general: no hay resultados de GSM8K, HumanEval ni MMLU, por lo que no se puede evaluar su rendimiento frente a modelos establecidos.
- Licencia "other": derivada de Qwen (Apache 2.0), pero las condiciones concretas de uso comercial no se detallan en la información disponible; hay que revisar el texto de la licencia antes de desplegarlo en producto.
- Receta y datos de entrenamiento no publicados: no se puede auditar la composición del dataset ni el proceso de ajuste.
- Contexto máximo no especificado: los ejemplos usan 8192 tokens, pero se desconoce la ventana entrenada; no asumir contextos largos sin verificación.
- Riesgo de alucinación: inherente a los modelos de lenguaje; el modo de razonamiento desactivable puede aumentar la tasa de respuestas directas incorrectas en problemas complejos.
- Idiomas: aunque declara 13 idiomas, no hay evaluación por idioma; el rendimiento en español, árabe o tailandés no está verificado.
- Sesgos: no documentados por el autor; al ser un ajuste sobre base Qwen con datos propios no publicados, los sesgos heredados y los introducidos no son auditables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMSManhattan/JiRackDeltaNet_70b
- Demo (Space): https://huggingface.co/spaces/CMSManhattan/JiRackDeltaNet-70B-demo
- Instrucciones de GGUF: https://huggingface.co/CMSManhattan/JiRackDeltaNet_70b/blob/main/gguf/README.md
