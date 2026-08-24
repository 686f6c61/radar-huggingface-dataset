# fraQtl/Qwen3-4B-Instruct-2507-Hi-Fi-GGUF

## Resumen

El modelo `fraQtl/Qwen3-4B-Instruct-2507-Hi-Fi-GGUF` es una cuantización GGUF de alta fidelidad del modelo `Qwen/Qwen3-4B-Instruct-2507`, desarrollada por el usuario fraQtl. Se trata de una versión optimizada mediante *calibration-aware quantization* (CAQ) que busca minimizar la divergencia respecto al modelo original en formato de 4 bits, manteniendo el mismo tamaño que las cuantizaciones Q4_K_M comunitarias de referencia. El modelo base, Qwen3-4B-Instruct-2507, es una actualización del Qwen3-4B sin modo *thinking*, con mejoras en instrucciones, razonamiento lógico, comprensión de texto, matemáticas, ciencia, código y uso de herramientas.

Esta ficha se centra en la versión cuantizada, que ofrece dos formatos: Q4_K_M (estándar para CPU/GPU) y Q4_0 (formato nativo para NPU, especialmente relevante para despliegue en dispositivos Qualcomm). El repositorio incluye métricas de fidelidad (KLD) y pruebas de recuperación de contexto largo que demuestran una mejora significativa frente a otras cuantizaciones del mismo modelo. Con 4.022 millones de parámetros y una ventana de contexto nativa de 262.144 tokens, es una opción atractiva para despliegue local en hardware consumer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, no especificada en detalle) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativa del modelo base) |
| Tipos de cuantizacion | Q4_K_M, Q4_0 |
| Idiomas soportados | No disponible (el modelo base es multilingue, pero no se detalla en la ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

El modelo base `Qwen3-4B-Instruct-2507` es un transformer decoder-only de 4.022 millones de parámetros, entrenado por Alibaba Cloud (Qwen team). Es una versión actualizada del Qwen3-4B que elimina el modo *thinking* y se centra en respuestas directas, con mejoras en instrucciones, razonamiento lógico, matemáticas, ciencia, código y uso de herramientas. No se dispone de detalles sobre el dataset de entrenamiento ni el proceso de alineación (RLHF/DPO) en la informacion proporcionada.

La cuantizacion de fraQtl emplea *calibration-aware quantization* con una matriz de importancia (imatrix) generada a partir de datos de calibracion. El proceso utiliza la toolchain de llama.cpp (commit `4df29be4`) para convertir y cuantizar el checkpoint bf16 original. La innovacion principal es la calibracion por tensor, que ajusta los rangos de cuantizacion para minimizar la divergencia KLD respecto al modelo original, en lugar de usar calibracion ingenua. Se incluyen dos variantes: Q4_K_M (formato estandar con bloques K) y Q4_0 (formato fijo, compatible con NPU Hexagon de Qualcomm).

## Capacidades

- Generacion de texto y comprension de lenguaje natural en multiples idiomas (el modelo base es multilingue, aunque la ficha no especifica la lista).
- Razonamiento logico y matematico: el modelo base destaca en tareas de matemáticas y ciencia.
- Generacion de codigo: soporta multiples lenguajes de programacion y puede completar o explicar fragmentos de codigo.
- Uso de herramientas (*tool calling*): el modelo base incluye soporte para invocar funciones externas, lo que permite integrarlo en agentes.
- Instrucciones complejas: mejora en *instruction following* respecto a versiones anteriores.
- Contexto largo: ventana nativa de 262.144 tokens, verificada en pruebas de recuperacion (needle-in-a-haystack) con acierto perfecto en la version cuantizada.
- Sin modo *thinking*: responde directamente, sin cadena de razonamiento explicita (a diferencia del Qwen3-4B original).

## Casos de uso

- **Asistente de codigo en local**: el modelo puede completar, revisar y explicar codigo en un IDE o CLI, aprovechando su capacidad de generacion de codigo y su tamano reducido (cabe en una GPU consumer). La cuantizacion Q4_K_M mantiene una fidelidad alta al modelo original, lo que reduce errores de sintaxis.
- **Atencion al cliente automatizada**: con 262K tokens de contexto, puede gestionar conversaciones multi-turno largas y mantener el historial completo de la interaccion, ideal para chatbots de soporte en empresas que necesitan desplegar en infraestructura propia.
- **Analisis de documentos extensos**: su ventana de contexto nativa permite procesar libros, contratos o informes completos sin truncamiento, extrayendo informacion o resumiendo contenido. La cuantizacion Q4_0 es adecuada para dispositivos edge con NPU.
- **Agente de automatizacion de tareas**: gracias al soporte de *tool calling*, puede integrarse en pipelines que invocan APIs, bases de datos o scripts, actuando como orquestador en entornos de produccion.
- **Generacion de contenido multilingue**: para redaccion de articulos, traduccion o localizacion, el modelo base es multilingue y la cuantizacion preserva la calidad en tareas generales (KLD general de 0.0338, un 46% mejor que la cuantizacion canonica).
- **Prototipado rapido en investigacion**: al ser un GGUF con licencia Apache-2.0, se puede descargar y ejecutar en cualquier maquina con llama.cpp u Ollama, facilitando experimentos de NLP sin necesidad de GPUs de gran tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card incluye metricas de fidelidad al modelo original y pruebas de recuperacion de contexto largo, que se resumen a continuacion.

**Fidelidad al modelo original (KLD simetrica top-20, menor es mejor)**

| Arm | Bytes | KLD code/math | KLD general | top-1 code/math | top-1 general |
|---|---:|---:|---:|---:|---:|
| fraQtl Hi-Fi (Q4_K_M) | 2.496.879.712 | 0.025317 | 0.033753 | 0.9604 | 0.9357 |
| MaziyarPanahi Q4_K_M (canonico) | 2.497.280.448 | 0.057372 | 0.063008 | 0.9466 | 0.9186 |
| unsloth Q4_K_M | 2.497.281.120 | 0.030018 | 0.042626 | 0.9557 | 0.9276 |

**Recuperacion de contexto largo (needle exact-match, aciertos/total)**

| Arm | 8K + 32K (x3 runs) | 262.144 tokens (x2 runs) |
|---|---|---|
| fraQtl Hi-Fi | 18/18, 18/18, 18/18 | 9/9, 9/9 |
| MaziyarPanahi Q4_K_M | 18/18 x3 | 9/9 x2 |
| unsloth Q4_K_M | 18/18 x3 | 8/9 x2 |

**Perplejidad Wikitext-2 (ctx 512, sanity check)**

| Arm | PPL |
|---|---:|
| fraQtl Hi-Fi | 10.478 |
| MaziyarPanahi Q4_K_M | 10.565 |
| unsloth Q4_K_M | 10.616 |

**Variante Q4_0 (formato NPU)**

| Arm | Bytes | KLD code/math | KLD general |
|---|---:|---:|---:|
| fraQtl Q4_0 (con imatrix) | 2.375.771.232 | 0.059665 | 0.080458 |
| Q4_0 naive (sin imatrix) | 2.369.545.024 | 0.070135 | 0.088598 |
| GenieX-designated Q4_0 (unsloth) | 2.375.773.280 | 0.060996 | 0.077572 |

## Requisitos de hardware

- **VRAM estimada para inferencia**: el archivo Q4_K_M pesa aproximadamente 2,5 GB, por lo que se necesitan al menos 3 GB de VRAM para cargar el modelo con contexto moderado. Con contexto largo (262K tokens), la memoria de KV cache puede superar los 8 GB, por lo que se recomienda al menos 12 GB para uso intensivo.
- **GPU recomendadas**: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070 o superiores para contexto largo. Para contexto corto, una RTX 3050 8GB puede ser suficiente.
- **Compatibilidad con GPU consumer**: si, cabe en la mayoria de GPUs de gama media y alta. Tambien puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), llama-cpp-python. Para NPU Qualcomm, el formato Q4_0 es compatible con runtimes como GenieX.
- **Latencia y throughput**: no se proporcionan datos especificos. En una RTX 4090, un modelo de 4B en Q4_K_M suele generar entre 50 y 100 tokens/segundo, pero esto depende de la implementacion y el contexto.

## Comparativa con modelos similares

La comparativa mas relevante es contra otras cuantizaciones del mismo modelo base, ya que no se dispone de datos de rendimiento frente a otros modelos de 4B (como Llama-3.2-3B o Phi-3.5-mini) en la informacion proporcionada.

| Modelo | Formato | Tamano archivo | KLD code/math | KLD general | Contexto nativo | Licencia |
|---|---|---|---:|---:|---:|---|
| fraQtl Hi-Fi (este repo) | Q4_K_M | 2,50 GB | 0.0253 | 0.0338 | 262K | Apache-2.0 |
| MaziyarPanahi Q4_K_M | Q4_K_M | 2,50 GB | 0.0574 | 0.0630 | 262K | Apache-2.0 |
| unsloth Q4_K_M | Q4_K_M | 2,50 GB | 0.0300 | 0.0426 | 262K | Apache-2.0 |
| fraQtl Q4_0 | Q4_0 | 2,38 GB | 0.0597 | 0.0805 | 262K | Apache-2.0 |

La cuantizacion de fraQtl supera a las alternativas en fidelidad al modelo original, con una reduccion del 55,9% en KLD code/math y del 46,4% en KLD general respecto a la version canonica de MaziyarPanahi. En la variante Q4_0, la calibracion con imatrix mejora la fidelidad frente a la version naive, aunque queda ligeramente por detras de la GenieX-designated en la metrica general.

## Limitaciones y advertencias

- **Perdida de fidelidad inherente a la cuantizacion**: aunque la calibracion reduce la divergencia, sigue habiendo una diferencia medible respecto al modelo bf16 original. Para tareas que requieren precision extrema (por ejemplo, generacion de codigo critico), se recomienda usar el modelo sin cuantizar.
- **Sin modo *thinking***: el modelo base no incluye cadena de razonamiento explicita, lo que puede limitar su rendimiento en problemas de razonamiento complejo que se benefician de un analisis paso a paso.
- **Sesgos y alucinaciones**: no se han publicado evaluaciones de sesgo o toxicidad para esta cuantizacion. Como cualquier modelo de lenguaje, puede generar contenido incorrecto o sesgado, especialmente en temas controvertidos.
- **Idiomas no especificados**: la ficha no detalla la lista de idiomas soportados, aunque el modelo base es multilingue. Se recomienda verificar el rendimiento en el idioma objetivo antes de desplegar en produccion.
- **Contexto largo con coste de memoria**: la ventana de 262K tokens requiere una cantidad significativa de memoria para la KV cache. En hardware consumer, puede ser necesario reducir el contexto o usar cuantizacion de KV cache.
- **Licencia Apache-2.0**: permite uso comercial sin restricciones, pero el modelo base puede tener limitaciones adicionales no reflejadas en esta ficha. Se recomienda revisar la documentacion oficial de Qwen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fraQtl/Qwen3-4B-Instruct-2507-Hi-Fi-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Cuantizacion de referencia (MaziyarPanahi): https://huggingface.co/MaziyarPanahi/Qwen3-4B-Instruct-2507-GGUF
- Cuantizacion de referencia (unsloth): https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-GGUF
- Modelo en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-4B-Instruct-2507
- Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Repositorio de Qualcomm AI Hub Models (GitHub): https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/qwen3_4b_instruct_2507
