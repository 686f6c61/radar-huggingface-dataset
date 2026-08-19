# RedHatAI/Qwen3.8-2.4T-A95B-NVFP4-FP8

## Resumen

RedHatAI/Qwen3.8-2.4T-A95B-NVFP4-FP8 es una versión cuantizada del modelo Qwen/Qwen3.8-2.4T-A95B, desarrollada por Red Hat AI mediante la herramienta LLM Compressor. El modelo original, perteneciente a la serie Qwen3.8 de Alibaba, es un modelo de lenguaje masivo de tipo Mixture-of-Experts (MoE) con 2,4 billones de parámetros totales y aproximadamente 95 mil millones de parámetros activos por token. Esta variante cuantiza las capas MoE a NVFP4 (formato de punto flotante de 4 bits de NVIDIA) y las capas de atención a FP8 en bloques, reduciendo drásticamente el espacio de almacenamiento y los requisitos de memoria para inferencia, manteniendo un rendimiento prácticamente idéntico al modelo original en benchmarks como GPQA Diamond.

La relevancia de este modelo radica en que hace viable el despliegue de un modelo de la clase Qwen-Max en infraestructuras de servidor con múltiples GPUs, algo que antes era inviable incluso con hardware de gama alta. Al combinar una arquitectura híbrida de atención lineal (Gated Delta Net) con atención completa (GQA) y un MoE de 512 expertos, el modelo ofrece una ventana de contexto de 262.144 tokens y capacidades de razonamiento avanzado, posicionándose como una opción para tareas agénticas de largo horizonte, investigación y generación de código a gran escala. La cuantización mixta NVFP4-FP8 es una innovación técnica que demuestra cómo reducir el coste de inferencia sin sacrificar precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: Gated Delta Net (GDN) + Grouped Query Attention (GQA) + MoE, 92 capas, 512 expertos enrutados (10 activos) + 1 experto compartido |
| Parametros totales | 2,4 billones (modelo base Qwen3.8-2.4T-A95B) |
| Parametros activos | ~95 mil millones por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (capas MoE) y FP8 block (capas de atención) |
| Idiomas soportados | no disponible |
| Licencia | MIT (versión cuantizada); el modelo base Qwen3.8-2.4T-A95B usa licencia qwen3.8-max |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-2.4T-A95B emplea una arquitectura híbrida que combina Gated Delta Net (GDN), una forma de atención lineal con un estado convolucional corto, intercalada con capas de Grouped Query Attention (GQA) completa. Sobre esta base se apoya un bloque MoE con 512 expertos enrutados, de los cuales se activan 10 por token, más un experto compartido. Esta configuración permite un contexto de 262.144 tokens con un coste computacional subcuadrático gracias a la atención lineal. La versión cuantizada de Red Hat AI no altera la arquitectura lógica, sino que comprime los pesos: las capas MoE se representan en NVFP4 (formato de 4 bits con mantisa de punto flotante) y las capas de atención en FP8 con cuantización por bloques. El proceso de cuantización se realizó con LLM Compressor, una herramienta de código abierto del ecosistema vLLM, y no se han publicado detalles sobre el entrenamiento original del modelo base, aunque la serie Qwen3.8 se describe como una mejora sustancial en tareas de programación, trabajo profesional, investigación y agentes de largo horizonte.

## Capacidades

- Generación de texto y razonamiento avanzado con modo de pensamiento (reasoning) configurable mediante el parser `qwen3` en vLLM.
- Soporte de tool calling y function calling, heredado del modelo base Qwen3.8 (no confirmado explícitamente en la documentación de esta versión cuantizada, pero es una capacidad estándar de la serie).
- Capacidades agénticas multi-paso y planificación de largo horizonte, favorecidas por la ventana de contexto de 262.144 tokens.
- Competencia en generación de código, matemáticas y tareas de investigación, según la descripción oficial de la serie Qwen3.8.
- Multilingüismo: no se especifican idiomas concretos, pero los modelos Qwen suelen cubrir un amplio rango de lenguas.
- Inferencia eficiente gracias a la cuantización mixta NVFP4-FP8, que reduce el footprint de memoria sin penalizar significativamente la calidad.

## Casos de uso

- Razonamiento científico y resolución de problemas complejos: el modelo alcanza un 93,1 % en GPQA Diamond (con esfuerzo de razonamiento alto), lo que lo hace adecuado para asistencia en investigación académica, análisis de literatura y generación de hipótesis.
- Agentes autónomos de larga duración: su contexto de 262.144 tokens permite mantener estados de conversación y memoria de trabajo durante horas de interacción, ideal para agentes que ejecutan tareas multi-paso en entornos simulados o reales.
- Generación y revisión de código a gran escala: con soporte de tool calling y razonamiento, puede integrarse en pipelines de CI/CD para generar, revisar y refactorizar código en repositorios extensos, aprovechando el contexto largo para entender el proyecto completo.
- Análisis de documentos legales o técnicos extensos: la ventana de 262.144 tokens permite procesar contratos, patentes o informes de cientos de páginas en una sola pasada, extrayendo información y respondiendo preguntas específicas.
- Asistencia en investigación de mercado y análisis de datos: puede sintetizar grandes volúmenes de texto, generar informes ejecutivos y realizar análisis comparativos con alta coherencia.
- Despliegue como servicio de inferencia de alto rendimiento en la nube: gracias a la cuantización y al soporte nativo de vLLM con parallelismo de datos y de expertos, puede servir a múltiples usuarios simultáneamente con latencia razonable en clústeres de GPUs.

## Benchmarks y rendimiento

Se han publicado resultados del benchmark GPQA Diamond (con esfuerzo de razonamiento `xhigh`) comparando el modelo base y varias versiones cuantizadas:

| Modelo | GPQA Diamond |
|---|---|
| Qwen/Qwen3.8-2.4T-A95B (base, sin cuantizar) | 92,6 |
| RedHatAI/Qwen3.8-2.4T-A95B-NVFP4-FP8 (este modelo) | 93,1 |
| RedHatAI/Qwen3.8-2.4T-A95B-NVFP4 (solo NVFP4) | 92,9 |
| Inferact/Qwen3.8-2.4T-A95B-NVFP4 | 92,9 |

La versión NVFP4-FP8 supera ligeramente al modelo base en esta métrica, lo que probablemente se debe a la variabilidad estadística del benchmark. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El checkpoint cuantizado ocupa aproximadamente 1,38 TB en disco (1385,2 GB), por lo que la inferencia requiere un clúster con al menos esa cantidad de VRAM agregada para alojar los pesos, más memoria adicional para KV cache y activaciones.
- Se recomienda un mínimo de 16 GPUs de 80 GB (p. ej., H100) o 8 GPUs de 192 GB (p. ej., MI300X) para cargar el modelo completo. Con 8 GPUs de 80 GB (640 GB) no es suficiente.
- El comando de despliegue oficial sugiere `--data-parallel-size 8 --enable-expert-parallel 8`, lo que implica al menos 8 nodos o GPUs con alto ancho de banda inter-GPU (NVLink o InfiniBand).
- No es viable en GPUs de consumo (RTX 4090, etc.) debido al tamaño del modelo.
- Opciones de despliegue: vLLM (recomendado), con soporte para parallelismo de datos y de expertos. También puede usarse con SGLang y Dynamo, según las recetas disponibles.
- Latencia y throughput: no se han publicado cifras concretas, pero con 8 vías de parallelismo de datos y 8 de expertos, se espera un throughput del orden de miles de tokens por segundo en clústeres de H100, aunque depende del número de secuencias concurrentes (el ejemplo usa `--max-num-seqs 140`).

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Cuantización | GPQA Diamond | Licencia |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-2.4T-A95B (base) | 2,4 billones | ~95 mil millones | 262.144 | FP8 (original) | 92,6 | qwen3.8-max |
| RedHatAI/Qwen3.8-2.4T-A95B-NVFP4-FP8 (este) | 2,4 billones | ~95 mil millones | 262.144 | NVFP4 + FP8 | 93,1 | MIT |
| RedHatAI/Qwen3.8-2.4T-A95B-NVFP4 | 2,4 billones | ~95 mil millones | 262.144 | NVFP4 | 92,9 | MIT |
| Inferact/Qwen3.8-2.4T-A95B-NVFP4 | 2,4 billones | ~95 mil millones | 262.144 | NVFP4 | 92,9 | MIT |

No se dispone de comparativas con otros modelos MoE de tamaño similar (p. ej., DeepSeek-V3) en la información proporcionada.

## Limitaciones y advertencias

- El tamaño del modelo (2,4 billones de parámetros) hace que su despliegue sea inviable para la mayoría de organizaciones; requiere infraestructura de clúster con decenas de GPUs de alta gama.
- La cuantización NVFP4-FP8 puede introducir degradaciones sutiles en tareas de precisión numérica o generación de código muy especializado, aunque el benchmark GPQA no muestra pérdida.
- No se han publicado datos sobre sesgos, alucinaciones o comportamientos indeseados específicos de esta versión cuantizada.
- La licencia del modelo base (qwen3.8-max) puede imponer restricciones de uso comercial adicionales, a pesar de que esta versión cuantizada se distribuya bajo MIT. Es necesario revisar los términos de la licencia original antes de usar el modelo en producción.
- La documentación no especifica los idiomas soportados, por lo que el rendimiento en lenguas distintas del inglés o el chino no está garantizado.
- El proceso de cuantización puede no ser reproducible con otras herramientas; se recomienda usar LLM Compressor y vLLM para garantizar la compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Qwen3.8-2.4T-A95B-NVFP4-FP8
- Modelo base Qwen3.8-2.4T-A95B: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- Guía de cuantización con LLM Compressor: https://github.com/vllm-project/llm-compressor/blob/main/docs/key-models/qwen3.5/nvfp4-moe-example.md
- Receta de vLLM para Qwen3.8-2.4T-A95B: https://recipes.vllm.ai/Qwen/Qwen3.8-2.4T-A95B
- Receta de Dynamo para Qwen3.8-2.4T-A95B: https://github.com/ai-dynamo/dynamo/tree/main/recipes/qwen3.8-2.4t-a95b
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
