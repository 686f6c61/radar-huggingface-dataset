# NeosQ/Spark-X2.6-4B-heretic-tool

## Resumen

Spark-X2.6-4B-heretic-tool es una modificación comunitaria del modelo XHToken/Spark-X2.6-4B, desarrollada por el usuario NeosQ. Se trata de un modelo de lenguaje de 4.112 millones de parámetros orientado a generación de texto, con un enfoque explícito en dos objetivos: la supresión de rechazos (mediante técnicas de abliteration) y la preservación de la capacidad de juicio sobre cuándo *no* invocar una herramienta en entornos de function calling.

El modelo parte de una arquitectura propietaria denominada `Spark2_5ForCausalLM`, con 36 capas, dimensión oculta de 2560 y un vocabulario de 131.072 tokens con embeddings atados. El proceso de construcción consta de dos etapas: una abliteración con Heretic v2.1.0 y el modificador ARA (Arbitrary-Rank Ablation), seguida de un ajuste supervisado con LoRA (r=16, α=32) sobre 1000 ejemplos equilibrados de uso de herramientas, fusionado posteriormente en los pesos.

Su relevancia radica en que documenta un problema técnico poco habitual: la abliteración elimina los rechazos (de 99/100 a 0/100) pero también destruye la capacidad del modelo de abstenerse de llamar a una función cuando la petición no es resoluble con las herramientas disponibles (BFCL v4 irrelevance cae de 62,9 a 18,8). El autor aborda esta regresión mediante un ajuste supervisado específico que restaura la métrica de irrelevance hasta 87,9 sin reintroducir rechazos. La licencia es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Spark2_5ForCausalLM` (transformer causal, 36 capas, hidden 2560, vocab 131072, tied embeddings) |
| Parámetros totales | 4.112.079.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16; compatible con cuantización estándar vía transformers/GGUF no confirmada) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, 2 shards, ~7,7 GiB) |

## Arquitectura y entrenamiento

El modelo base `XHToken/Spark-X2.6-4B` emplea una arquitectura transformer causal denominada `Spark2_5ForCausalLM`, con 36 capas, dimensión oculta de 2560 y un vocabulario de 131.072 tokens con embeddings atados. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset original ni si se aplicaron técnicas de RLHF o DPO en su fase original. El modelo requiere `custom_code` y `trust_remote_code=True` para su carga en Transformers.

El proceso de modificación consta de dos etapas documentadas. La primera es una abliteration con Heretic v2.1.0 usando el modificador ARA, que opera en el espacio de pesos y exporta un checkpoint completo; esta etapa reduce los rechazos de 99/100 a 0/100 pero colapsa la métrica de irrelevance en BFCL v4 de 62,9 a 18,8, ya que en este modelo la dirección que gobierna el rechazo de peticiones dañinas parece solaparse con la que gobierna la abstención ante llamadas a herramientas imposibles. La segunda etapa es un ajuste LoRA (r=16, α=32) sobre 1000 ejemplos equilibrados de uso de herramientas (500 de "debe declinar" provenientes de `BFCL_v4_live_irrelevance` y 500 de "debe llamar"), renderizados con el system prompt propio de BFCL, y fusionado en los pesos finales, de modo que no se necesita adaptador en inferencia.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento matemático (GSM8K 83,3 en el checkpoint final).
- Generación de código (HumanEval pass@1 de 73,3).
- Tool calling y function calling, con soporte para las categorías de BFCL v4 (llamadas simples, múltiples, paralelas y con relevancia).
- Juicio de irrelevancia: capacidad de declinar una llamada a herramienta cuando ninguna función suministrada satisface la petición (BFCL v4 irrelevance 87,9).
- Seguimiento de instrucciones (IFEval prompt strict 72,0).
- Supresión de rechazos: 0/100 rechazos ante 100 prompts dañinos según la model card.
- Modo "decensored"/"uncensored" derivado de la abliteration.

## Casos de uso

- **Atención al cliente con agentes tool-augmented**: el modelo puede decidir cuándo invocar una función de backend (consulta de pedidos, gestión de tickets) y cuándo responder que la petición no es resoluble con las herramientas disponibles, gracias a su métrica de irrelevance de 87,9 en BFCL v4.
- **Pipelines de function calling en producción**: su rendimiento en las cuatro categorías de llamada de BFCL v4 (86,5 de media) lo hace adecuado para orquestación de APIs donde la precisión de los argumentos y la elección de función son críticas.
- **Asistentes de código integrados en IDE**: con HumanEval pass@1 de 73,3 y soporte de tool calling, puede emplearse para autocompletado, generación de tests o invocación de herramientas de análisis estático.
- **Generación de documentación técnica bilingüe (en/zh)**: su soporte nativo de inglés y chino permite redactar y traducir documentación técnica en ambos idiomas.
- **Sistemas de razonamiento matemático de ámbito educativo**: GSM8K de 83,3 lo sitúa como opción viable para resolución de problemas aritméticos de varios pasos en entornos con recursos limitados (4B parámetros).
- **Investigación sobre alineación y abliteration**: el checkpoint y la documentación del proceso (Heretic v2.1.0 + ARA + LoRA) sirven como caso de estudio reproducible para estudiar el trade-off entre supresión de rechazos y preservación de capacidades estructuradas.
- **Despliegue en hardware de consumo**: con ~7,7 GiB en BF16, es desplegable en GPUs consumer de gama alta (por ejemplo, RTX 4090 con 24 GB) y, tras cuantización, en GPUs de 8-12 GB.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Benchmark | Base | `-heretic-math` | **Este modelo** |
|---|---|---|---|
| Rechazos (100 prompts dañinos) | 99 | 5 | **0** |
| BFCL v4 irrelevance | 62,9 | 18,8 | **87,9** |
| BFCL v4 — media 4 categorías de llamada | 83,8 | 86,1 | **86,5** |
| BFCL v4 — media 5 categorías | 79,6 | 72,7 | **86,8** |
| IFEval (prompt strict) | 76,5 | 71,5 | 72,0 |
| GSM8K | 86,7 | 86,7 | 83,3 |
| HumanEval pass@1 | 70,0 | 71,7 | 73,3 |

No se han publicado resultados de MMLU ni de otros benchmarks adicionales en la información disponible.

## Requisitos de hardware

- **VRAM estimada en BF16**: ~7,7 GiB de pesos más overhead de activaciones y KV cache; se recomienda al menos 10-12 GB de VRAM para inferencia cómoda.
- **VRAM tras cuantización**: no confirmada oficialmente; con cuantizaciones de 8 bits cabría en GPUs de 8 GB y con 4 bits en GPUs de 6-8 GB, aunque no se han publicado pesos GGUF en el repositorio.
- **GPU recomendadas**: RTX 4090 (24 GB) para BF16 sin problemas; A100/H100 para despliegues de mayor throughput; GPUs consumer de 12-16 GB (RTX 4080, 4070 Ti) para BF16 con contexto moderado.
- **Cabe en consumer GPU**: sí, en RTX 4090 y GPUs de gama alta con 16 GB o más en BF16.
- **Opciones de despliegue**: transformers con `trust_remote_code=True` (requerido por `custom_code`); no se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| **Spark-X2.6-4B-heretic-tool** | 4,11 B | no disponible | Apache-2.0 | en, zh | Abliterado + LoRA de tool-use; BFCL irrelevance 87,9 |
| XHToken/Spark-X2.6-4B (base) | 4,11 B | no disponible | Apache-2.0 | en, zh | Modelo original; 99/100 rechazos, BFCL irrelevance 62,9 |
| Spark-X2.6-4B-heretic-math | 4,11 B | no disponible | Apache-2.0 | en, zh | Abliteración sin corrección de tool-use; BFCL irrelevance 18,8 |

No se dispone de datos de benchmarks de otros modelos de 4B comparables (por ejemplo, Qwen, Llama o Phi de tamaño similar) en la información proporcionada, por lo que no se incluye una comparación cruzada con ellos.

## Limitaciones y advertencias

- **Modelo "uncensored"**: la abliteration elimina los rechazos (0/100 ante prompts dañinos), lo que implica que el modelo puede generar contenido dañino, ofensivo o inseguro sin filtros. No es apto para despliegues orientados al público general sin capas adicionales de moderación.
- **Riesgo de alucinación**: no se han publicado métricas de factualidad; como todo modelo de 4B, presenta riesgo de alucinación en tareas de conocimiento factual.
- **Idiomas limitados**: solo inglés y chino declarados; el rendimiento en castellano no está evaluado ni garantizado.
- **Contexto desconocido**: la longitud de contexto no se especifica en la información disponible, lo que impide garantizar conversaciones multi-turno largas o procesamiento de documentos extensos.
- **Requiere `custom_code`**: la carga exige `trust_remote_code=True`, lo que implica ejecutar código del repositorio; debe auditarse antes de usar en producción.
- **Modificación comunitaria no oficial**: no está publicada ni respaldada por el equipo de XHToken/SparkLLM; el soporte y las actualizaciones no están garantizados.
- **Regresión en GSM8K**: el checkpoint final baja de 86,7 a 83,3 respecto al base, un coste asumido del proceso de ajuste.
- **Licencia Apache-2.0**: permite uso comercial, pero el carácter "uncensored" puede entrar en conflicto con políticas de plataformas o requisitos regulatorios (por ejemplo, la AI Act europea) que exijan salvaguardas.
- **Sin datos de benchmarks de seguridad**: no se han publicado evaluaciones de sesgos ni de toxicidad más allá del recuento de rechazos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeosQ/Spark-X2.6-4B-heretic-tool
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Dataset mlabonne/harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset mlabonne/harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset gorilla-llm/Berkeley-Function-Calling-Leaderboard: https://huggingface.co/datasets/gorilla-llm/Berkeley-Function-Calling-Leaderboard
- Model card en chino: https://huggingface.co/NeosQ/Spark-X2.6-4B-heretic-tool/blob/main/README_zh.md
