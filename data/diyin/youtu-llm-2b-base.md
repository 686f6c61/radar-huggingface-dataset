# DIYIN/Youtu-LLM-2B-Base

## Resumen

Youtu-LLM-2B-Base es un modelo de lenguaje autoregresivo de 1,96 mil millones de parámetros desarrollado por el laboratorio Youtu de Tencent. Se presenta como un modelo ligero pero con capacidades agentivas nativas, diseñado para demostrar que es posible lograr un alto rendimiento en razonamiento, programación y tareas de agente con un tamaño reducido. Su arquitectura emplea atención multi-cabeza latente (MLA), una variante eficiente de la atención que reduce el coste de memoria y computación, y soporta una ventana de contexto de 131 072 tokens (128k), lo que lo hace adecuado para tareas que requieren procesar documentos extensos o conversaciones de largo recorrido.

La versión base aquí descrita es el punto de partida para el modelo instructivo (Youtu-LLM-2B), que es el que se distribuye en formato GGUF para su uso con herramientas como llama.cpp u Ollama. Según los benchmarks publicados por el equipo de Tencent, Youtu-LLM-2B-Base supera a modelos de tamaño similar (Qwen3-1.7B, SmoLM3-3B, Gemma3-4B) en tareas de sentido común, STEM, programación y contexto largo, y en pruebas agentivas iguala o supera a modelos más grandes como Llama3.1-8B. El modelo se publica bajo una licencia propia denominada youtu-llm, cuyos términos deben revisarse antes de su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal autoregresivo con atención multi-cabeza latente (MLA) densa |
| Parametros totales | 1 961 560 064 (1,96B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131 072 tokens (128k) |
| Tipos de cuantizacion | No disponible para la versión base; existe una versión GGUF del modelo instruct (Youtu-LLM-2B-GGUF) |
| Idiomas soportados | No disponible oficialmente; los benchmarks incluyen tareas en chino (MLQA-Zh, MGSM-Zh, MMLU-ProX-Zh) e inglés, lo que sugiere soporte bilingüe |
| Licencia | youtu-llm (licencia propia, ver enlace en la model card) |
| Formato de pesos | safetensors (también disponible en GGUF para el modelo instruct) |

## Arquitectura y entrenamiento

Youtu-LLM-2B-Base es un modelo de lenguaje causal autoregresivo con arquitectura Transformer densa, pero con una innovación clave: utiliza atención multi-cabeza latente (MLA) en lugar de la atención multi-cabeza estándar. Esta técnica, popularizada por DeepSeek, comprime las claves y valores en un espacio latente de menor dimensión, reduciendo significativamente el coste de memoria y computación durante la inferencia, especialmente en contextos largos. El modelo tiene 32 capas, 16 cabezas de atención para Q/K/V, con un rango MLA de 1 536 para Q y 512 para K/V, y dimensiones de 128 para QK sin posición, 64 para QK con RoPE y 128 para V. El vocabulario es de 128 256 tokens.

No se han publicado en la model card detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas de alineación como RLHF o DPO. El informe técnico (arXiv:2512.24618) está disponible y probablemente contiene esa información, pero no se ha incluido en los datos proporcionados. El modelo se puede utilizar con Transformers a partir de la versión 5.1.0, y es compatible con herramientas de fine-tuning como LlamaFactory y ModelScope.

## Capacidades

- Generación de texto autoregresiva en inglés y chino (según los benchmarks publicados).
- Razonamiento de sentido común y conocimiento general, con resultados destacados en MMLU-Pro (48,4% EM) y MMLU-ProX-Zh (40,7% EM).
- Capacidades matemáticas y STEM: GSM8K (77,6% EM), MGSM-Zh (68,9% EM), MATH (44,4% EM), BBH (59,8% EM).
- Programación: HumanEval (64,6% Pass@1), HumanEval+ (57,3%), MBPP (66,6%), MBPP+ (81,8%), LiveCodeBench v6 (9,7%), CRUXEval (55,9%).
- Manejo de contexto largo: LongBench v2 (27,2% de precisión) y NIAH (98,8% de precisión), lo que indica buena recuperación de información en ventanas de 128k.
- Capacidades agentivas nativas: según los benchmarks APTBench, el modelo base obtiene resultados competitivos en tareas de código (37,9%), investigación profunda (38,6%), matemáticas (68,0%) y uso de herramientas (64,2%), superando a modelos más grandes como Llama3.1-8B en varias categorías.
- Soporte de tool calling y multi-step reasoning: aunque no se detalla explícitamente en la model card, los resultados en APTBench indican que el modelo puede seguir instrucciones de agente y utilizar herramientas.

## Casos de uso

- Agentes autónomos para automatización de tareas: gracias a sus capacidades agentivas nativas y a su ventana de 128k, el modelo puede gestionar flujos de trabajo multi-paso que requieren razonamiento, uso de herramientas y memoria de contexto largo, como la navegación web o la ejecución de scripts.
- Generación de código en entornos de desarrollo: con resultados de 64,6% en HumanEval, puede integrarse en asistentes de programación, generación de tests unitarios o autocompletado de código en IDEs, especialmente en entornos con recursos limitados.
- Análisis de documentos extensos: la ventana de 128k permite procesar contratos, informes financieros o artículos científicos completos en una sola pasada, extrayendo información relevante o resumiendo contenido.
- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto largo, responder preguntas frecuentes y derivar consultas complejas a agentes humanos, funcionando en infraestructuras modestas.
- Tutoría y asistencia educativa: su rendimiento en GSM8K y MATH lo hace adecuado para explicar problemas matemáticos paso a paso, generar ejercicios o evaluar respuestas de estudiantes.
- Investigación y extracción de información: puede utilizarse para tareas de búsqueda y síntesis de información en corpus bilingües (inglés-chino), aprovechando su capacidad de contexto largo y su rendimiento en tareas de razonamiento.

## Benchmarks y rendimiento

Los siguientes resultados se han extraído de la model card oficial del modelo. Se comparan con varios modelos de referencia de tamaño similar o superior.

### Benchmarks generales (modelo base)

| Tipo | Benchmark (métrica) | Qwen3-1.7B-Base | SmoLM3-3B-Base | Gemma3-4B-Base | Qwen3-4B-Base | Llama3.1-8B | Youtu-LLM-2B-Base |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Commonsense | MMLU-Pro (EM) | 34,9% | 35,3% | 29,4% | 46,1% | 36,2% | **48,4%** |
| | MLQA-Zh (EM) | 38,1% | 38,0% | 40,3% | **47,2%** | 43,0% | 43,5% |
| | MMLU-ProX-Zh (EM) | 32,5% | 26,7% | 24,2% | **45,2%** | 25,4% | 40,7% |
| STEM | GSM8K (EM) | 68,2% | 67,3% | 38,5% | **80,8%** | 47,8% | 77,6% |
| | MGSM-Zh (EM) | 57,1% | 40,7% | 33,0% | **69,7%** | 35,9% | 68,9% |
| | MATH (EM) | 28,1% | 40,8% | 24,4% | **44,8%** | 21,5% | 44,4% |
| | BBH (EM) | 53,0% | 59,8% | 51,6% | **70,8%** | 62,9% | 59,8% |
| | GPQA-MC (Acc. Norm) | 30,4% | 26,6% | 28,6% | **37,8%** | 30,1% | 33,3% |
| | HLE-MC (Acc. Norm) | 10,7% | 3,1% | 8,0% | 15,0% | 11,5% | **17,4%** |
| Coding | MBPP (Pass@1) | 55,6% | 51,0% | 45,8% | **67,5%** | 49,4% | 66,6% |
| | MBPP+ (Pass@1) | 71,0% | 66,1% | 61,9% | 80,8% | 62,7% | **81,8%** |
| | HumanEval (Pass@1) | 49,9% | 34,8% | 36,6% | 57,6% | 36,0% | **64,6%** |
| | HumanEval+ (Pass@1) | 41,3% | 28,1% | 28,1% | 49,9% | 28,1% | **57,3%** |
| | LiveCodeBench v6 (Pass@1) | 5,1% | 2,9% | 2,9% | 6,9% | 3,4% | **9,7%** |
| | CRUXEval (Pass@1) | 40,6% | 42,1% | 39,7% | 54,8% | 42,3% | **55,9%** |
| | RepoBench (EM) | 21,0% | 21,8% | 23,0% | **25,3%** | 25,2% | 22,7% |
| Long Context | LongBench v2 (Acc.) | 28,0% | **28,8%** | 26,6% | 25,8% | 27,8% | 27,2% |
| | NIAH (Acc.) | 79,8% | 75,0% | 99,5% | 83,0% | **99,8%** | 98,8% |

### Benchmarks agentivos (APTBench, modelo base)

| Categoría | Qwen3-1.7B-Base | SmoLM3-3B-Base | Gemma3-4B-Base | Qwen3-4B-Base | Llama3.1-8B | Youtu-LLM-2B-Base |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Code | 25,1% | 24,3% | 32,8% | **41,9%** | 23,6% | 37,9% |
| Deep Research | 28,5% | 27,2% | 36,4% | **40,5%** | 30,0% | 38,6% |
| Math | 59,9% | 60,7% | 59,8% | **70,5%** | 60,1% | 68,0% |
| Tool | 56,7% | 59,1% | 61,7% | **65,8%** | 64,1% | 64,2% |

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,96 mil millones de parámetros, el modelo en precisión FP16 ocupa aproximadamente 3,9 GB (coincide con el tamaño del repositorio). Con cuantización a 8 bits ocuparía unos 2 GB, y a 4 bits alrededor de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, RTX 3050, RTX 4060, GTX 1660 Super). Para cuantización a 4 bits, bastan 2 GB de VRAM, lo que permite ejecutarlo en GPUs integradas modernas o en tarjetas muy modestas.
- Compatibilidad con hardware consumer: sí, es un modelo ligero diseñado para entornos con recursos limitados.
- Opciones de despliegue: compatible con Transformers (a partir de v5.1.0), vLLM, TGI, y mediante la versión GGUF del modelo instruct se puede usar con llama.cpp, Ollama y otros motores que soporten este formato.
- Latencia y throughput: no se han publicado datos oficiales. Dado su tamaño, se espera una latencia baja en GPUs consumer, pero no se dispone de cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | MMLU-Pro (EM) | HumanEval (Pass@1) | GSM8K (EM) |
| :--- | :---: | :---: | :--- | :---: | :---: | :---: |
| Youtu-LLM-2B-Base | 1,96B | 128k | youtu-llm (propietaria) | **48,4%** | **64,6%** | 77,6% |
| Qwen3-1.7B-Base | 1,7B | 32k (según versión) | Apache 2.0 | 34,9% | 49,9% | 68,2% |
| SmoLM3-3B-Base | 3B | 8k (según versión) | Apache 2.0 | 35,3% | 34,8% | 67,3% |
| Gemma3-4B-Base | 4B | 128k | Gemma Terms of Use | 29,4% | 36,6% | 38,5% |

Nota: los datos de contexto de los modelos comparados no se han verificado en fuentes oficiales; se indican valores aproximados según la información disponible. La licencia de Youtu-LLM es propietaria, mientras que Qwen3 y SmoLM3 son de código abierto (Apache 2.0), lo que puede ser un factor decisivo para muchos proyectos.

## Limitaciones y advertencias

- La licencia youtu-llm es propietaria y no se han detallado sus términos en la model card. Es imprescindible revisar el archivo LICENSE.txt antes de cualquier uso, especialmente comercial.
- No se han documentado sesgos específicos del modelo. Como ocurre con la mayoría de los LLM, puede reflejar sesgos presentes en sus datos de entrenamiento, aunque no se ha publicado información al respecto.
- Riesgo de alucinación: no se han publicado evaluaciones específicas sobre este aspecto. Al ser un modelo pequeño, es probable que presente más alucinaciones que modelos de mayor tamaño en tareas de conocimiento abierto.
- Limitaciones de idioma: aunque los benchmarks sugieren soporte de inglés y chino, no se ha confirmado oficialmente la lista de idiomas. El rendimiento en otros idiomas es desconocido.
- El modelo base no está alineado para seguir instrucciones; para tareas de chat o agentes se recomienda utilizar la versión instruct (Youtu-LLM-2B).
- No se han publicado detalles sobre el proceso de entrenamiento (datos, tokens, alineación), lo que dificulta evaluar su robustez y posibles problemas de seguridad.

## Enlaces

- Modelo en Hugging Face (repositorio original de Tencent): https://huggingface.co/tencent/Youtu-LLM-2B-Base
- Modelo en Hugging Face (repositorio espejo de DIYIN): https://huggingface.co/DIYIN/Youtu-LLM-2B-Base
- Modelo instruct en Hugging Face: https://huggingface.co/tencent/Youtu-LLM-2B
- Versión GGUF del modelo instruct: https://huggingface.co/tencent/Youtu-LLM-2B-GGUF
- Informe técnico (arXiv): https://arxiv.org/abs/2512.24618
- Código y documentación en GitHub: https://github.com/TencentCloudADP/youtu-tip/tree/master/youtu-llm
- Documentación de Transformers para Youtu-LLM: https://huggingface.co/docs/transformers/model_doc/youtu
- Modelo en ModelScope: https://www.modelscope.cn/models/Tencent-YouTu-Research/Youtu-LLM-2B-Base
- Licencia del modelo: https://huggingface.co/tencent/Youtu-LLM-2B-Base/LICENSE.txt
