# nvidia/DeepSeek-V4-Pro-nvfp4-DSpark

## Resumen

NVIDIA DeepSeek-V4-Pro-nvfp4-DSpark es la versión cuantizada en NVFP4 (punto flotante de 4 bits de NVIDIA) del modelo DeepSeek-V4-Pro, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 1,65 billones de parámetros totales y 49 mil millones de parámetros activos. NVIDIA ha empaquetado en un único checkpoint la cuantización del modelo base junto con el módulo oficial de decodificación especulativa DSpark de DeepSeek, de modo que un solo archivo sirve tanto de modelo objetivo como de modelo borrador. No se trata de un modelo nuevo, sino de una optimización para inferencia: reduce el footprint de memoria y acelera la generación manteniendo la calidad del original.

El modelo está pensado para razonamiento avanzado, aplicaciones de agentes, uso de herramientas y resolución de problemas complejos en dominios como matemáticas, ingeniería de software y asistentes empresariales. Soporta una ventana de contexto de hasta 1 millón de tokens y tres modos de razonamiento (Non-think, Think High y Think Max). La licencia es MIT, lo que permite uso comercial y no comercial sin restricciones. Su relevancia actual radica en combinar un MoE de escala extrema con cuantización de 4 bits y decodificación especulativa integrada, lo que lo convierte en una opción atractiva para despliegues en infraestructura NVIDIA Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers, Mixture-of-Experts (MoE) con Hybrid Attention (Compressed Sparse Attention + Heavily Compressed Attention) |
| Parametros totales | 1.650.497.936.906 (~1,65 billones) |
| Parametros activos | 49 mil millones |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (4-bit floating point de NVIDIA) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

El checkpoint incluye además el módulo borrador DSpark: 82 mil millones de parámetros totales y aproximadamente 2,4 mil millones activos, con un tamaño de bloque de 5 tokens.

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Pro emplea una arquitectura MoE con atención híbrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA), diseñada para manejar ventanas de contexto muy largas (1M tokens) con un coste computacional subcuadrático. De los 1,65 billones de parámetros totales, solo 49 mil millones se activan por token, lo que reduce drásticamente el coste de inferencia frente a un modelo denso equivalente.

El módulo DSpark es un cabezal de decodificación especulativa semi-autorregresivo de 3 capas (`mtp.0/1/2`). Cada capa combina atención MLA (Multi-head Latent Attention) con una FFN MoE de 384 expertos (6 activos), alimentada por una proyección sobre los estados ocultos de las capas 58/59/60 del modelo objetivo. Incluye además un cabezal Markov de rango 512 y un cabezal de confianza. El bloque de borrador predice 5 tokens por paso, lo que permite acelerar la generación autoregresiva.

La cuantización NVFP4 se realizó con NVIDIA Model Optimizer v0.44, utilizando como datasets de calibración `cnn_dailymail` y `Nemotron-Post-Training-Dataset-v2`. No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento complejo con tres modos configurables: Non-think (respuesta rápida), Think High (análisis lógico) y Think Max (razonamiento exhaustivo).
- Soporte de tool calling y function calling, con salida estructurada en JSON.
- Capacidad para aplicaciones de agentes y razonamiento multi-paso.
- Ventana de contexto de 1 millón de tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Decodificación especulativa integrada mediante DSpark, que acelera la inferencia sin necesidad de un modelo borrador separado.
- Pipeline de codificación personalizado (`encoding_dsv4`) para el procesamiento de entrada.
- Idiomas soportados: no disponible en la documentación.

## Casos de uso

- Asistentes empresariales de alto nivel: el modelo puede gestionar consultas complejas de negocio con razonamiento multi-paso y acceso a herramientas internas mediante function calling, gracias a sus 49B parámetros activos y su modo Think High.
- Razonamiento matemático y científico: su entrenamiento en dominios de matemáticas y resolución de problemas lo hace adecuado para verificación de demostraciones, cálculo simbólico asistido y análisis de resultados experimentales.
- Ingeniería de software asistida: puede generar, revisar y refactorizar código en pipelines de CI/CD, integrando tool calling para ejecutar tests o consultar repositorios, con la ventaja de la decodificación especulativa para reducir latencia.
- Agentes autónomos multi-paso: su soporte de razonamiento encadenado y tool calling permite construir agentes que planifican, ejecutan acciones y corrigen errores de forma iterativa, manteniendo un contexto de hasta 1M tokens para sesiones largas.
- Análisis de documentos extensos: la ventana de 1M tokens permite procesar libros técnicos, expedientes legales o codebases completos en una sola pasada, extrayendo información y generando resúmenes estructurados.
- Atención al cliente automatizada con contexto largo: puede mantener conversaciones multi-turno con historial extenso y acceder a bases de conocimiento mediante herramientas, ofreciendo respuestas precisas sin perder el hilo de la interacción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K para esta versión cuantizada, ni comparaciones con el modelo base en precisión o velocidad.

## Requisitos de hardware

- El checkpoint completo ocupa 943,5 GB en formato safetensors, por lo que se requiere infraestructura multi-GPU para cargar los pesos en memoria.
- Hardware compatible: exclusivamente NVIDIA Blackwell (microarquitectura B200, GB200 y similares). No es compatible con arquitecturas anteriores como Hopper o Ampere.
- Sistema operativo: Linux.
- Runtime soportado: vLLM con el método de decodificación especulativa `dspark`.
- No cabe en GPUs de consumo (RTX serie 40/50); se necesitan GPUs de centro de datos con memoria HBM de alta capacidad.
- La VRAM exacta necesaria no está documentada, pero el tamaño del repo (943,5 GB) da una cota inferior del footprint de pesos; a esto hay que sumar la caché KV para contexto largo, que puede ser considerable con 1M de tokens.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Decodificacion especulativa | Licencia |
|---|---|---|---|---|---|---|
| deepseek-ai/DeepSeek-V4-Pro | 1,65 billones | 49 mil millones | 1M tokens | BF16 (original) | No | MIT |
| deepseek-ai/DeepSeek-V4-Pro-DSpark | 1,65 billones + 82B borrador | 49B + 2,4B borrador | 1M tokens | BF16 (original) | Si (DSpark) | MIT |
| nvidia/DeepSeek-V4-Pro-NVFP4 | 1,65 billones | 49 mil millones | 1M tokens | NVFP4 | No | MIT |
| nvidia/DeepSeek-V4-Pro-nvfp4-DSpark | 1,65 billones + 82B borrador | 49B + 2,4B borrador | 1M tokens | NVFP4 | Si (DSpark) | MIT |

Este modelo se diferencia de las variantes sin DSpark en que integra el borrador en el mismo checkpoint, eliminando la necesidad de desplegar dos modelos separados. Frente a la versión BF16, reduce el footprint de memoria aproximadamente a la mitad (NVFP4 usa 4 bits por peso) a costa de una posible pérdida menor de precisión no cuantificada en la documentación.

## Limitaciones y advertencias

- No es un modelo original de NVIDIA: es una cuantización del modelo DeepSeek-V4-Pro de DeepSeek. NVIDIA declina la responsabilidad sobre el desarrollo del modelo base.
- Requiere hardware NVIDIA Blackwell de forma obligatoria; no funcionará en GPUs de generaciones anteriores ni en hardware de otros fabricantes.
- La cuantización NVFP4 puede introducir degradación de precisión frente al modelo en BF16, aunque no se han publicado métricas comparativas.
- Idiomas soportados no documentados: no se garantiza cobertura multilingüe específica.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala, especialmente en tareas de razonamiento abierto; se recomienda validación externa en aplicaciones críticas.
- La ventana de 1M tokens implica un coste de memoria de caché KV muy elevado; el despliegue práctico requiere planificación cuidadosa de la infraestructura.
- No se documentan sesgos conocidos ni evaluaciones de seguridad específicas para esta versión cuantizada.
- Aunque la licencia MIT permite uso comercial, el modelo depende del ecosistema vLLM y de las librerías de NVIDIA, lo que condiciona el despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/DeepSeek-V4-Pro-nvfp4-DSpark
- Modelo base DeepSeek-V4-Pro: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- Modelo DeepSeek-V4-Pro-DSpark: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-DSpark
- Versión NVFP4 sin DSpark: https://huggingface.co/nvidia/DeepSeek-V4-Pro-NVFP4
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- DeepSeek DeepSpec (referencia DSpark): https://github.com/deepseek-ai/DeepSpec
- Informe tecnico DeepSeek-V4: https://arxiv.org/abs/2606.19348
