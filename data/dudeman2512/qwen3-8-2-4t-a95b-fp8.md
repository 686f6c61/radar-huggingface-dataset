# dudeman2512/Qwen3.8-2.4T-A95B-FP8

## Resumen

Qwen3.8-2.4T-A95B-FP8 es una cuantización en precisión de 8 bits en coma flotante (FP8) del modelo propietario Qwen/Qwen3.8-2.4T-A95B, el último modelo insignia de Qwen lanzado en agosto de 2026. La cuantización ha sido realizada por el usuario dudeman2512 mediante la librería `compressed-tensors`, procesando el checkpoint tensor a tensor sin instanciar nunca el modelo completo. El resultado es un modelo de 2,4 billones de parámetros totales con una arquitectura de mezcla de expertos (MoE) híbrida, de los cuales aproximadamente 95 mil millones se activan por token.

Este modelo resuelve el problema de desplegar un modelo de 2,4 billones de parámetros en entornos de producción, reduciendo el tamaño en disco a la mitad respecto al original en BF16 (2453,05 GB frente a 4906 GB) y manteniendo un error relativo medio de 0,0264 en las capas lineales cuantizadas. Es relevante ahora porque permite ejecutar el modelo más grande de Qwen en infraestructuras con múltiples GPUs de gran memoria, aunque sigue requiriendo un clúster de hardware considerable. La licencia Apache-2.0 facilita su uso comercial y su integración en sistemas de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida: Gated Delta-Net (GDN, atención lineal con estado de convolución corta) intercalada con atención de grupo de consultas (GQA), 92 capas, 512 expertos enrutados con 10 activos + 1 experto compartido |
| Parámetros totales | 2,4 billones (2.4T) |
| Parámetros activos | ~95 mil millones (95B) por token |
| Longitud de contexto | 262 144 tokens (según Dynamo); QwenCloud menciona 1 000 000 de tokens |
| Tipos de cuantización | FP8 (`float8_e4m3fn`), por canal, con cuantización dinámica de activaciones por token |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (FP8, `float-quantized` con compressed-tensors) |

Nota: el repositorio de HuggingFace indica un tamaño de 1098,8 GB, mientras que la model card del autor especifica 2453,05 GB en disco (572 shards). La discrepancia sugiere que el repo listado puede estar incompleto o que la medida de HuggingFace no refleja el tamaño real de los archivos.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-2.4T-A95B emplea una arquitectura MoE híbrida que combina dos mecanismos de atención: Gated Delta-Net (GDN), una atención lineal con un estado de convolución corto, y atención completa de grupo de consultas (GQA). La capa MoE contiene 512 expertos enrutados, de los que se activan 10 por token, más un experto compartido, sobre una base de 92 capas. Esta mezcla de atención lineal y completa es la característica más distintiva del modelo, permitiendo manejar secuencias muy largas con un coste computacional reducido.

La cuantización FP8 se realizó con `compressed-tensors`, cuantizando las 143 569 capas lineales del modelo en `float8_e4m3fn` por canal, con cuantización dinámica de activaciones por token. El proceso se ejecutó transmitiendo el checkpoint tensor a tensor, verificando la conformidad de forma y tipo de cada tensor con el servidor de inferencia, y midiendo el error de reconstrucción frente a los pesos BF16 originales. No se han publicado detalles del entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la información disponible.

## Capacidades

- Generación de texto y conversación: modelo de lenguaje de propósito general con capacidad de razonamiento avanzado, pensado para tareas de diálogo complejas.
- Razonamiento multi-paso: su tamaño (2,4T totales) y arquitectura híbrida permiten abordar problemas de razonamiento extenso, aunque no se han publicado benchmarks específicos.
- Generación de código y matemáticas: los modelos Qwen de gran escala suelen rendir bien en estas áreas; sin datos de benchmarks en la información disponible, no se puede cuantificar.
- Soporte de tool calling / function calling: no se especifica explícitamente, pero los modelos Qwen3 suelen incluir esta capacidad; no confirmado para esta versión.
- Capacidades multilingües: la información de idiomas no está disponible, pero los modelos Qwen suelen soportar múltiples idiomas, incluido el español.
- Contexto largo: con 262 144 tokens de contexto (posiblemente 1M según QwenCloud), puede procesar documentos extensos, libros completos o conversaciones de muchas turnos.
- Sin capacidades de visión o audio: la etiqueta `text-generation` indica que es exclusivamente un modelo de texto.

## Casos de uso

- **Análisis de documentos legales y financieros**: su ventana de contexto de 262 144 tokens permite procesar contratos completos, informes anuales o expedientes judiciales de miles de páginas en una sola pasada, extrayendo cláusulas, riesgos y datos relevantes para abogados o analistas financieros.
- **Asistencia a la investigación científica**: para revisión de literatura, el modelo puede leer y resumir docenas de artículos académicos completos, extraer metodologías y comparar resultados, gracias a su capacidad de razonamiento y contexto largo.
- **Generación de código a gran escala**: con su enorme capacidad y tamaño, puede generar, revisar y refactorizar código en proyectos de gran envergadura, aunque su despliegue exige una infraestructura de GPUs de nivel centro de datos.
- **Chatbots y asistentes conversacionales de alta exigencia**: para sistemas de atención al cliente o asistentes técnicos que requieren mantener contexto largo en conversaciones de muchos turnos y razonar sobre información compleja, el modelo puede gestionar historiales extensos sin perder el hilo.
- **Motores de razonamiento para agentes autónomos**: con su arquitectura MoE híbrida y su gran número de parámetros, puede servir como cerebro de agentes que planifican y ejecutan tareas multi-paso, integrando herramientas y APIs mediante tool calling (si se confirma esta capacidad).
- **Traducción y procesamiento multilingüe de alta calidad**: aunque los idiomas no están especificados, los modelos Qwen son multilingües; puede traducir y adaptar contenido en varios idiomas con contexto de documentos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor solo incluye métricas de error de cuantización (error relativo medio de 0,0264 frente al BF16 original), pero no datos de rendimiento en tareas como MMLU, HumanEval o GSM8K. No se puede comparar cuantitativamente con otros modelos sin datos verificables.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el peso FP8 ocupa 2453,05 GB en disco; para inferencia se necesita al menos esa cantidad de VRAM, más espacio para activaciones, KV cache y overhead del runtime. En la práctica, se requieren más de 2,5 TB de VRAM.
- **GPU recomendadas**: con 2453 GB de pesos, se necesitan aproximadamente 31 GPUs NVIDIA H100 de 80 GB (2453 / 80 ≈ 30,66) o 15 H200 de 141 GB. No cabe en ninguna GPU de consumo (RTX 4090, etc.) ni en un solo nodo típico.
- **Si cabe en consumer GPU**: no, en absoluto. Requiere un clúster multi-GPU de centro de datos.
- **Opciones de despliegue**: vLLM (con soporte directo mediante `vllm serve dudeman2512/Qwen3.8-2.4T-A95B-FP8`), SGLang y Dynamo (con recetas oficiales en el repositorio `ai-dynamo/dynamo`). La etiqueta `endpoints_compatible` sugiere compatibilidad con la API de OpenAI.
- **Latencia y throughput**: no disponibles. Dado el tamaño y la cuantización, se espera una latencia alta y un throughput moderado, optimizado por el bajo número de parámetros activos (95B) en comparación con los totales (2,4T).

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Cuantización | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-2.4T-A95B-FP8 (este) | 2,4T | ~95B | 262 144 tokens | FP8 | Apache-2.0 |
| Qwen3.8-2.4T-A95B (BF16 original) | 2,4T | ~95B | 262 144 tokens | BF16 | Apache-2.0 |
| Qwen3.8-2.4T-A95B-NVFP4 | 2,4T | ~95B | 262 144 tokens | NVFP4 | Apache-2.0 |
| Qwen3.8-2.4T-A95B-int4 | 2,4T | ~95B | 262 144 tokens | INT4 | Apache-2.0 |
| DeepSeek-V3 (referencia) | 671B | 37B | 128K tokens | BF16 | MIT |

Las variantes cuantizadas del mismo modelo se diferencian en el error relativo: FP8 tiene el menor error (0,0264), NVFP4 intermedio (0,0952) e INT4 el mayor (0,1118), con tamaños en disco de 2453, 1382 y 1268 GB respectivamente. Comparado con DeepSeek-V3, el modelo de Qwen tiene 3,6 veces más parámetros totales y 2,6 veces más parámetros activos, lo que sugiere mayor capacidad de razonamiento, aunque sin benchmarks no se puede confirmar.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: no se han publicado evaluaciones de sesgos ni de tasas de alucinación. Como todo LLM de gran tamaño, puede generar información falsa o sesgada; se recomienda validar la salida en entornos de producción.
- **Riesgo de cuantización**: aunque el error relativo de 0,0264 es bajo, la cuantización FP8 puede degradar ligeramente el rendimiento en tareas de precisión numérica o razonamiento fino, especialmente en comparación con el BF16 original.
- **Limitaciones de contexto**: el contexto máximo es de 262 144 tokens (o 1M según QwenCloud), pero el rendimiento en contextos muy largos puede degradarse; se recomienda probar con la longitud de secuencia real del caso de uso.
- **Idiomas**: no se ha confirmado la lista de idiomas soportados. Aunque Qwen suele ser multilingüe, es recomendable verificar el comportamiento en el idioma objetivo antes de desplegar.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el modelo base es de Qwen; debe cumplirse la licencia del modelo base y la de los pesos cuantizados (misma Apache-2.0). No hay restricciones adicionales conocidas.
- **Requisitos de despliegue**: el tamaño de 2453 GB hace inviable el despliegue en hardware de consumo o en clústeres pequeños; solo es práctico para organizaciones con infraestructura de centro de datos y múltiples GPUs de gran memoria.
- **Repositorio incompleto**: el tamaño del repo en HuggingFace (1098,8 GB) es menor que el tamaño en disco declarado (2453,05 GB), lo que sugiere que el repo puede estar incompleto o que la medida es incorrecta; verificar antes de descargar.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/dudeman2512/Qwen3.8-2.4T-A95B-FP8)
- [Modelo base Qwen/Qwen3.8-2.4T-A95B](https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B)
- [Receta de vLLM para Qwen3.8-2.4T-A95B](https://recipes.vllm.ai/Qwen/Qwen3.8-2.4T-A95B)
- [Página de QwenCloud del modelo](https://www.qwencloud.com/models/qwen3.8-2.4t-a95b)
- [Recetas de Dynamo para Qwen3.8-2.4T-A95B](https://github.com/ai-dynamo/dynamo/tree/main/recipes/qwen3.8-2.4t-a95b)
- [Repositorio compressed-tensors](https://github.com/neuralmagic/compressed-tensors)
