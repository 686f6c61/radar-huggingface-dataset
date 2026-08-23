# justinchuby/deepseek-r1-distill-qwen-1.5b-onnx-genai

## Resumen

Este modelo es una conversión a ONNX INT4 del modelo DeepSeek-R1-Distill-Qwen-1.5B, preparada específicamente para ejecutarse en CPU mediante la librería `nxrt` y el runtime `onnx-genai`. El autor, justinchuby, lo presenta como una demostración del formato canónico `inference_metadata.yaml` de onnx-genai, donde el bucle autorregresivo se declara como un workflow de componentes (gráficos ONNX para decodificación, políticas de token, gestión de caché KV y terminación) en lugar de código específico del decodificador.

El modelo base, DeepSeek-R1-Distill-Qwen-1.5B, es una destilación de DeepSeek-R1 sobre la arquitectura de Qwen2.5-Math-1.5B, con 1.500 millones de parámetros y una ventana de contexto de 131.072 tokens. Esta versión ONNX conserva ese límite de contexto en sus metadatos, aunque el ejemplo de ejecución lo reduce a 128 tokens para demostración. La cuantización INT4 permite ejecutar el modelo en hardware sin GPU, lo que lo hace accesible para entornos con recursos limitados.

La relevancia de esta ficha radica en que muestra un camino práctico para desplegar modelos de razonamiento destilados en CPU con formato ONNX, un enfoque útil para integraciones en producción donde no se dispone de aceleración por hardware. Además, ejemplifica la evolución de los formatos de empaquetado de modelos en el ecosistema de ONNX GenAI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) basada en Qwen2.5-Math-1.5B, destilado de DeepSeek-R1 |
| Parametros totales | 1.500 millones (modelo base) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (según metadatos; ejemplo con `ONNX_GENAI_KV_MAX_LEN=128` para demo) |
| Tipos de cuantizacion | INT4 (cuantización de pesos) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica para esta versión ONNX) |
| Licencia | MIT |
| Formato de pesos | ONNX (INT4), con `inference_metadata.yaml` como contrato principal |

## Arquitectura y entrenamiento

El modelo base es una destilación de DeepSeek-R1 sobre la arquitectura Qwen2.5-Math-1.5B. DeepSeek-R1 es un modelo de razonamiento entrenado con aprendizaje por refuerzo (RL) para generar cadenas de pensamiento largas antes de responder. La destilación transfiere esa capacidad a un modelo más pequeño, manteniendo la estructura transformer estándar con atención causal. No se dispone de detalles sobre el dataset de entrenamiento de la destilación, pero el modelo base fue entrenado por DeepSeek AI con datos de razonamiento matemático y lógico, y el proceso de destilación se basó en los outputs de DeepSeek-R1.

La versión ONNX no introduce cambios en la arquitectura, sino que convierte los pesos a INT4 y organiza el bucle de inferencia como un conjunto de gráficos ONNX declarados en metadatos. El paquete incluye 28 pares de caché KV, gráficos para políticas de tokens (muestreo, terminación, control de longitud) y un runtime genérico que ejecuta el workflow sin necesidad de un decodificador especializado. Esto es una innovación técnica relevante: la inferencia se vuelve data-driven, lo que facilita portabilidad entre runtimes compatibles con ONNX GenAI.

## Capacidades

- Generación de texto con razonamiento: al ser destilado de DeepSeek-R1, produce cadenas de pensamiento explícitas antes de la respuesta final, útil para problemas de matemáticas y lógica.
- Soporte de tool calling / function calling: no especificado en la información disponible; el modelo base no lo incluye de forma nativa.
- Soporte de agentes y multi-step reasoning: el modelo base está optimizado para razonamiento multi-paso, pero no se indica soporte explícito para agentes.
- Capacidades multilingües: el modelo base de Qwen2.5-Math-1.5B es multilingüe (principalmente inglés y chino), pero esta versión ONNX no especifica idiomas soportados.
- Capacidades especiales: ejecución en CPU sin GPU gracias a la cuantización INT4; integración con el runtime `nxrt` de onnx-genai.
- No soporta visión ni audio; es solo texto.

## Casos de uso

- Inferencia de modelos de razonamiento en entornos sin GPU: ideal para servidores o dispositivos donde no hay aceleradores, usando CPU con cuantización INT4 para reducir requisitos de memoria y cómputo.
- Integración en pipelines de procesamiento de texto con formato ONNX: al ser un paquete ONNX estándar, puede integrarse en aplicaciones que ya usan ONNX Runtime, facilitando el despliegue en producción.
- Prototipado de sistemas de razonamiento matemático: su capacidad de generar cadenas de pensamiento lo hace útil para resolver problemas de matemáticas, lógica o programación en entornos educativos.
- Evaluación de la técnica de destilación en modelos pequeños: sirve como referencia para comparar la calidad de un modelo destilado de 1.5B frente a versiones más grandes de DeepSeek-R1.
- Experimentación con el formato `inference_metadata.yaml`: los desarrolladores pueden estudiar cómo se declara el workflow de inferencia en ONNX GenAI y adaptarlo para otros modelos.
- Despliegue en dispositivos edge con limitaciones de memoria: el tamaño del repositorio es de 1.4 GB, pero la cuantización INT4 reduce el peso en memoria en comparación con la versión FP16, permitiendo ejecutarlo en hardware con poca RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión ONNX INT4 en la información disponible. El modelo base DeepSeek-R1-Distill-Qwen-1.5B tiene resultados reportados por DeepSeek AI en tareas como MMLU, GSM8K y HumanEval, pero esos datos no se aplican directamente a esta conversión ONNX, ya que la cuantización puede alterar el rendimiento. No se dispone de números para esta variante.

## Requisitos de hardware

- CPU: el modelo está diseñado para ejecutarse en CPU mediante el runtime `nxrt` con `CPUExecutionProvider`. No requiere GPU.
- RAM: se recomienda al menos 2-3 GB de RAM libre para cargar el modelo INT4 y la caché KV completa (131K tokens). Para contextos cortos (por ejemplo, 128 tokens) se puede reducir a 1 GB.
- GPU: no es necesaria, pero si se desea acelerar se podría usar GPU con ONNX Runtime, aunque no está verificado en la documentación.
- Opciones de despliegue: se usa la librería `nxrt` (versión 0.1.0.dev3) con Python 3. Otras opciones como vLLM o llama.cpp no son aplicables porque el modelo está en formato ONNX con metadatos específicos de onnx-genai.
- Latencia y throughput: no se dispone de medidas oficiales. El ejemplo de la model card genera 18 tokens en un tiempo no especificado. Dado que es un modelo de 1.5B en INT4 en CPU, se puede esperar una latencia del orden de decenas de tokens por segundo, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B (original) | 1.5B | 131K | MIT | PyTorch (fp16) | Razonamiento destilado |
| Qwen2.5-Math-1.5B | 1.5B | 32K | Apache-2.0 | PyTorch | Matemáticas |
| Llama-3.2-1B | 1.2B | 128K | Llama 3.2 Community License | PyTorch | Generación general |

La versión ONNX INT4 se diferencia por su formato de despliegue, pero no por sus capacidades intrínsecas. No hay comparativa directa con otros modelos ONNX de este tamaño en la información disponible.

## Limitaciones y advertencias

- La cuantización INT4 puede degradar la precisión en tareas de razonamiento complejo respecto al modelo en FP16.
- No se ha verificado el rendimiento en todos los idiomas; la model card no especifica idiomas soportados.
- El modelo puede generar alucinaciones o respuestas incorrectas, especialmente en dominios fuera de su entrenamiento.
- La ejecución con `nxrt` es experimental: la versión `0.1.0.dev3` es un desarrollo temprano, por lo que pueden existir bugs o cambios de API.
- La licencia MIT permite uso comercial, pero se debe cumplir con los términos de la licencia del modelo base (MIT) y la de Qwen2.5-Math (Apache-2.0).
- El formato `inference_metadata.yaml` es un contrato nuevo y no está ampliamente adoptado; la compatibilidad con otros runtimes no está garantizada.

## Enlaces

- [HuggingFace - justinchuby/deepseek-r1-distill-qwen-1.5b-onnx-genai](https://huggingface.co/justinchuby/deepseek-r1-distill-qwen-1.5b-onnx-genai)
- [Modelo base en HuggingFace: deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B)
- [Repositorio oficial de DeepSeek-R1 en GitHub](https://github.com/deepseek-ai/DeepSeek-R1)
- [Modelo base en ModelScope](https://www.modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B)
