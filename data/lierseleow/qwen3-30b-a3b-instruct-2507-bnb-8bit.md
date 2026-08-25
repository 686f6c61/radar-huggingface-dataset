# lierseleow/Qwen3-30B-A3B-Instruct-2507-bnb-8bit

## Resumen

El modelo **lierseleow/Qwen3-30B-A3B-Instruct-2507-bnb-8bit** es una cuantización de 8 bits mediante bitsandbytes del modelo original **Qwen/Qwen3-30B-A3B-Instruct-2507**, desarrollado por Alibaba Cloud. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 30.532 millones de parámetros totales y solo 3.300 millones de parámetros activos por token, lo que permite un rendimiento elevado con un coste computacional reducido. Esta versión cuantizada reduce los requisitos de memoria y almacenamiento, facilitando su despliegue en entornos con recursos limitados, manteniendo en gran medida las capacidades del modelo original.

El modelo base es una actualización de la serie Qwen3, específicamente la variante *non-thinking* (sin modo de razonamiento extendido), que incorpora mejoras significativas en instrucción, razonamiento lógico, comprensión de texto, matemáticas, ciencia, codificación y uso de herramientas. La cuantización a 8 bits con bitsandbytes es una técnica popular para reducir el peso del modelo a la mitad respecto a su formato bfloat16 original, manteniendo una degradación mínima en la calidad de las respuestas. Este repositorio está pensado para desarrolladores que necesitan ejecutar el modelo en GPUs con VRAM limitada o que buscan una alternativa más ligera sin renunciar a las capacidades del modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 MoE (Transformer con capas de mezcla de expertos) |
| Parametros totales | 30.532.122.624 (30,5 B) |
| Parametros activos | 3.300.000.000 (3,3 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit bitsandbytes (bnb) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3-30B-A3B-Instruct-2507 emplea una arquitectura de Mixture-of-Experts (MoE) basada en el transformer estándar, donde cada capa contiene múltiples expertos y solo se activan unos pocos por token (3,3 B de los 30,5 B totales). Esta arquitectura permite un equilibrio entre capacidad y eficiencia computacional, ya que el coste de inferencia depende principalmente de los parámetros activos, no de los totales. El modelo es una actualización de la versión anterior Qwen3-30B-A3B, con mejoras en capacidades generales como el seguimiento de instrucciones, el razonamiento lógico, la comprensión de texto, las matemáticas, la ciencia, la codificación y el uso de herramientas.

No se dispone de información detallada sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la documentación proporcionada. La cuantización a 8 bits se realizó con bitsandbytes, una librería que convierte los pesos del modelo a precisión de 8 bits mediante técnicas de cuantización por bloques, reduciendo el tamaño en memoria a aproximadamente la mitad del formato bfloat16 original. Esta cuantización no requiere reentrenamiento y se aplica directamente sobre los pesos ya entrenados.

## Capacidades

- Generación de texto y conversación multi-turno con alta calidad.
- Razonamiento lógico y matemático avanzado, incluyendo problemas de varios pasos.
- Comprensión de texto y extracción de información en contextos largos.
- Generación de código en múltiples lenguajes de programación.
- Uso de herramientas (tool calling) y ejecución de funciones externas.
- Soporte para agentes y flujos de trabajo multi-paso.
- Capacidades multilingües (heredadas del modelo base, aunque no se especifica la lista exacta).
- Modo *non-thinking*: respuestas directas sin razonamiento extendido, optimizado para latencia baja.

## Casos de uso

- **Asistente de atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con usuarios, resolviendo consultas frecuentes y derivando casos complejos a agentes humanos. Su capacidad de tool calling permite integrarse con sistemas de ticketing o bases de conocimiento.
- **Generación de código en entornos de desarrollo**: gracias a su soporte para tool calling y su competencia en programación, puede integrarse en pipelines de CI/CD para generar tests, documentar código o autocompletar funciones en editores.
- **Análisis de documentos y extracción de información**: con su comprensión de texto y razonamiento, puede resumir contratos, informes o artículos, y extraer entidades o datos estructurados.
- **Tutoría y educación**: puede explicar conceptos de matemáticas, ciencias o programación de forma interactiva, adaptándose al nivel del estudiante y generando ejercicios personalizados.
- **Automatización de tareas de oficina**: puede redactar correos, generar informes, transcribir y resumir reuniones, o clasificar documentos según su contenido.
- **Desarrollo de agentes autónomos**: al ser un modelo MoE con 3,3 B de parámetros activos, es adecuado para ejecutarse en entornos con recursos moderados, permitiendo construir agentes que razonen, planifiquen y ejecuten acciones mediante llamadas a herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3-30B-A3B-Instruct-2507 ha sido evaluado por Alibaba Cloud, pero los datos concretos (MMLU, HumanEval, GSM8K, etc.) no se incluyen en la documentación de este repositorio cuantizado. Se recomienda consultar la ficha del modelo original para obtener métricas de rendimiento.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con cuantización de 8 bits, el modelo ocupa aproximadamente 30,5 GB en memoria (1 byte por parámetro). Se recomienda al menos 32 GB de VRAM para inferencia con contexto moderado.
- **GPU recomendadas**: NVIDIA A100 (40 GB o 80 GB), RTX A6000 (48 GB), o GPUs con 32 GB o más de VRAM. En GPUs de 24 GB (como RTX 4090) podría ejecutarse con técnicas de offloading o con contexto reducido, pero no es lo ideal.
- **Compatibilidad con consumer GPU**: no cabe en GPUs de gama media (8-16 GB) sin offloading a CPU, lo que degradaría el rendimiento.
- **Opciones de despliegue**: al ser un modelo cuantizado con bitsandbytes, se puede cargar con transformers y accelerate. También es compatible con frameworks como vLLM o SGLang (aunque estos suelen preferir cuantizaciones como AWQ o FP8). Para despliegue ligero, se puede convertir a GGUF y usar llama.cpp u Ollama.
- **Latencia y throughput**: al ser un modelo MoE con solo 3,3 B de parámetros activos, la latencia por token es relativamente baja en comparación con modelos densos de tamaño similar. En una A100, se pueden alcanzar decenas de tokens por segundo, aunque el valor exacto depende de la implementación y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Cuantización |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-Instruct-2507 (original) | 30,5 B | 3,3 B | no disponible | Apache 2.0 | bfloat16 |
| lierseleow/Qwen3-30B-A3B-Instruct-2507-bnb-8bit | 30,5 B | 3,3 B | no disponible | Apache 2.0 | 8-bit bnb |
| cpatonn/Qwen3-30B-A3B-Instruct-2507-AWQ-8bit | 30,5 B | 3,3 B | no disponible | Apache 2.0 | 8-bit AWQ |
| Qwen3-30B-A3B-Instruct-2507-FP8 (Azure) | 30,5 B | 3,3 B | no disponible | Apache 2.0 | FP8 |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de otros modelos MoE comparables en la información proporcionada. La elección entre cuantizaciones (bnb, AWQ, FP8) depende del framework de inferencia y de la tolerancia a la pérdida de precisión.

## Limitaciones y advertencias

- **Pérdida de precisión por cuantización**: la cuantización a 8 bits puede degradar ligeramente la calidad de las respuestas en tareas que requieren alta precisión numérica o razonamiento complejo, aunque en general la degradación es mínima.
- **Sesgos del modelo base**: al ser un derivado de Qwen3, puede heredar sesgos presentes en los datos de entrenamiento originales, como estereotipos culturales o de género.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados o con contextos ambiguos.
- **Limitaciones de contexto**: no se ha especificado la longitud de contexto soportada en esta cuantización; se recomienda verificar la documentación del modelo base para conocer el límite real.
- **Restricciones de licencia**: aunque la licencia es Apache 2.0, el uso del modelo está sujeto a la Qwen Usage Policy de Alibaba Cloud, que puede imponer restricciones adicionales para ciertos casos de uso.
- **Compatibilidad de frameworks**: la cuantización con bitsandbytes requiere la versión adecuada de transformers y bitsandbytes (en este caso, transformers 5.14.1 y bitsandbytes 0.50.0). No todos los frameworks de inferencia soportan este formato directamente.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/lierseleow/Qwen3-30B-A3B-Instruct-2507-bnb-8bit
- Modelo base original: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Variante AWQ-8bit: https://huggingface.co/cpatonn/Qwen3-30B-A3B-Instruct-2507-AWQ-8bit
- Documentación de Azure AI Foundry (FP8): https://ai.azure.com/catalog/models/qwen--qwen3-30b-a3b-instruct-2507-fp8
- Ficha en SiliconFlow: https://www.siliconflow.com/models/qwen3-30b-a3b-instruct-2507
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
- Qwen Usage Policy: https://qwen.ai/usagepolicy
