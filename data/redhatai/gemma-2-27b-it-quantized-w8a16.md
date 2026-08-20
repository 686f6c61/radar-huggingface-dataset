# RedHatAI/gemma-2-27b-it-quantized.w8a16

## Resumen

RedHatAI/gemma-2-27b-it-quantized.w8a16 es una versión cuantizada a INT8 del modelo instructivo Gemma 2 27B de Google, publicada por Red Hat AI (Neural Magic). El modelo se obtiene aplicando el algoritmo GPTQ sobre los pesos de las capas lineales de los bloques transformer, reduciendo el tamaño en disco y los requisitos de memoria de GPU aproximadamente un 50 % con una pérdida de precisión mínima (recuperación del 100 % en la mayoría de las tareas evaluadas). Está diseñado para su despliegue eficiente con el motor de inferencia vLLM, y se distribuye bajo la licencia Gemma de Google, orientado a uso comercial e investigación en inglés.

La cuantización W8A16 mantiene los pesos en INT8 y las activaciones en FP16, lo que permite una inferencia más rápida y con menor huella de memoria sin sacrificar prácticamente precisión. El modelo base, Gemma 2 27B, es un transformer con 28 406 millones de parámetros y una longitud de contexto de 8192 tokens, con capacidades de chat y razonamiento avanzado. Esta versión cuantizada es especialmente relevante para despliegues en entornos con recursos limitados, como GPU de 48 GB o configuraciones con múltiples tarjetas de menor capacidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 2), con atención local/global alternada y activación GeGLU |
| Parametros totales | 28 406 776 320 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | INT8 (W8A16) – pesos cuantizados con GPTQ, activaciones en FP16 |
| Idiomas soportados | Inglés (según la model card, uso fuera del inglés fuera de alcance) |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Este modelo es una cuantización del checkpoint original `google/gemma-2-27b-it`. La arquitectura subyacente es la de Gemma 2 27B: un transformer con capas de atención alternadas (local y global), 46 capas, 32 cabezas de atención y una dimensionalidad de 4608. El entrenamiento original de Gemma 2 se realizó con un conjunto de datos multilingüe y un pipeline de RLHF para alinear el modelo con la instrucción. En esta versión cuantizada, los pesos de los operadores lineales dentro de los bloques transformer se convierten a INT8 mediante el algoritmo GPTQ (con un factor de amortiguamiento del 1 %) y se aplica cuantización simétrica por canal. El proceso se llevó a cabo con la librería `llm-compressor`, usando un dataset de calibración de 256 secuencias de la colección de compresión de Neural Magic. No se realizó ningún entrenamiento adicional; solo se optimizaron los pesos para inferencia eficiente.

## Capacidades

- Generación de texto conversacional: el modelo está optimizado para responder como asistente en chat, manteniendo coherencia y estilo.
- Razonamiento y conocimiento general: conserva las capacidades del Gemma 2 27B original, incluyendo tareas de razonamiento, comprensión lectora y respuesta a preguntas.
- Generación de código: aunque no se menciona explícitamente, Gemma 2 27B es competente en tareas de programación, por lo que esta versión hereda esa capacidad.
- Multilingüismo: la model card restringe el uso al inglés, aunque el modelo base podría tener algún soporte multilingüe, no se garantiza.
- Compatibilidad con vLLM: soporta el backend vLLM para despliegue eficiente, incluida la generación con formato de chat a través de `AutoTokenizer`.
- No se especifica soporte de tool calling o función calling en la información proporcionada.

## Casos de uso

- **Despliegue de un asistente virtual en inglés**: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 8192 tokens, adecuado para chatbots de atención al cliente en entornos de habla inglesa.
- **Inferencia en GPU de gama media**: al reducir el tamaño a ~28 GB, se puede ejecutar en una GPU de 48 GB (p. ej., A6000, A100) o en dos GPUs de 24 GB con vLLM, permitiendo su uso en entornos de investigación sin infraestructura masiva.
- **Integración en pipelines de generación de texto**: gracias a la compatibilidad con vLLM, puede usarse como backend de OpenAI-compatible para aplicaciones que requieren generación de texto de alta calidad.
- **Prototipado rápido de aplicaciones conversacionales**: su menor huella de memoria acelera el ciclo de desarrollo en entornos de desarrollo locales con GPUs de 24 GB (por ejemplo, RTX 3090/4090 con cuantización adicional).
- **Evaluación de modelos en entornos con restricciones de memoria**: investigadores que necesitan comparar el rendimiento de Gemma 2 27B sin disponer de los 60 GB de VRAM requeridos para el modelo original.
- **Generación de contenido en inglés**: redacción de correos, artículos, resúmenes o contenido creativo, aprovechando la calidad del modelo base.

## Benchmarks y rendimiento

Los resultados de la evaluación en el OpenLLM Leaderboard (versión 1) se presentan en la tabla siguiente. Se observa una inconsistencia en la model card: el texto indica que el modelo no cuantizado logra un promedio de 73.80, mientras que la tabla muestra 67.20 para el original. La columna «Recovery» no es coherente con los valores mostrados. Se presentan los datos tal como aparecen en la model card.

| Benchmark | gemma-2-27b-it (original) | gemma-2-27b-it-quantized.w8a16 (este modelo) | Recuperación |
|---|---|---|---|
| MMLU (5-shot) | 76.34 | 76.34 | 100.0 % |
| ARC Challenge (25-shot) | 74.49 | 74.49 | 100.0 % |
| GSM-8K (5-shot, strict-match) | 21.00 | 20.32 | 96.8 % |
| Hellaswag (10-shot) | 86.03 | 86.04 | 100.0 % |
| Winogrande (5-shot) | 77.98 | 77.74 | 99.7 % |
| TruthfulQA (0-shot) | 64.60 | 64.51 | 99.9 % |
| **Promedio** | **67.20** | **73.80** | **100.0 %** |

El promedio del modelo cuantizado (73.80) es superior al del modelo original (67.20) según la tabla, lo cual es anómalo y probablemente un error de transcripción. No se han publicado otros benchmarks adicionales en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el modelo en INT8 ocupa aproximadamente 28.4 GB de memoria (28 406 776 320 bytes ≈ 28.4 GB). Se recomienda al menos 32 GB de VRAM para inferencia con contexto completo.
- **GPU recomendadas**:
  - Una GPU con 40 GB o más: NVIDIA A100 40 GB, A100 80 GB, H100, o RTX 6000 Ada (48 GB).
  - Dos GPUs de 24 GB (por ejemplo, RTX 3090/4090) con paralelismo de tensor.
- **Compatibilidad con GPU de consumo**: una RTX 4090 (24 GB) no es suficiente para alojar el modelo completo, pero se puede usar con cuantización adicional o offloading a CPU.
- **Opciones de despliegue**: vLLM (compatible directamente), también puede usarse con Hugging Face Transformers, aunque se recomienda vLLM para obtener el mejor rendimiento.
- **Latencia y throughput**: no se proporcionan datos específicos, pero al ser una cuantización INT8, la inferencia es aproximadamente el doble de rápida que con el modelo FP16 en GPUs modernas, con un throughput típico de varios cientos de tokens por segundo en una A100.

## Comparativa con modelos similares

No se dispone de datos comparativos de otras cuantizaciones de Gemma 2 27B (como AWQ o GPTQ de 4 bits) en la información proporcionada. Como referencia, se compara con el modelo original sin cuantizar.

| Modelo | Parametros | Contexto | Precisión (OpenLLM avg) | Tamaño en disco | Licencia |
|---|---|---|---|---|---|
| google/gemma-2-27b-it | 28.4 B | 8192 | 67.20 (según tabla) | ~54 GB (FP16) | Gemma |
| RedHatAI/gemma-2-27b-it-quantized.w8a16 | 28.4 B | 8192 | 73.80 (según tabla) | ~30.8 GB | Gemma |

La cuantización reduce el tamaño a la mitad, pero el rendimiento declarado es igual o mejor, lo que resulta atípico. No se dispone de otras alternativas comparables en la información.

## Limitaciones y advertencias

- **Idioma**: la model card especifica que el uso fuera del inglés está fuera del alcance. El modelo puede degradarse en otros idiomas.
- **Sesgos y alucinaciones**: el modelo base puede presentar sesgos socioculturales y alucinaciones, al igual que cualquier LLM. No se ha realizado una evaluación específica para esta versión cuantizada.
- **Inconsistencia en los benchmarks**: los datos del OpenLLM presentan una contradicción entre el texto y la tabla, lo que genera incertidumbre sobre la fiabilidad de los números. Se recomienda evaluar el modelo en el propio entorno antes de producción.
- **Licencia**: la licencia Gemma impone restricciones de uso (no se permite uso que viole leyes, no se puede usar fuera de inglés según la card, etc.). Revisar los términos completos en [ai.google.dev/gemma/terms](https://ai.google.dev/gemma/terms).
- **Cuota de memoria**: aunque la cuantización reduce el tamaño, el modelo aún requiere una VRAM considerable (≈30 GB), por lo que no es adecuado para GPU de consumo de 16 GB o menos sin técnicas adicionales de compresión.
- **Sin soporte de tool calling**: no se indica que el modelo soporte llamadas a funciones o uso de herramientas, por lo que su uso en agentes complejos puede ser limitado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/RedHatAI/gemma-2-27b-it-quantized.w8a16)
- [Modelo original de Google](https://huggingface.co/google/gemma-2-27b-it)
- [Paper de Gemma 2](https://arxiv.org/abs/2408.00118)
- [Repositorio llm-compressor](https://github.com/vllm-project/llm-compressor)
- [Documentación de vLLM](https://docs.vllm.ai/en/latest/)
- [Dataset de calibración de Neural Magic](https://huggingface.co/datasets/neuralmagic/LLM_compression_calibration)
- [Open LLM Leaderboard](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard)
