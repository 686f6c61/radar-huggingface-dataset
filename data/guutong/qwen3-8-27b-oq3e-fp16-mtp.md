# guutong/Qwen3.8-27B-oQ3e-fp16-mtp

## Resumen

Qwen3.8-27B-oQ3e-fp16-mtp es una cuantización de 3 bits (oQ3e) del modelo Qwen3.8-27B, un LLM denso multimodal de Alibaba, realizada por el usuario guutong mediante la librería oQ (oMLX v0.6.3rc2). El modelo original destaca por su arquitectura híbrida con atención lineal en 48 de sus 64 capas, una torre de visión integrada y un contexto nativo de 262 000 tokens, extensible hasta 1 millón. Esta versión cuantizada reduce el peso del modelo a 13 GB, lo que permite ejecutarlo en hardware de consumo con memoria unificada, especialmente en equipos Apple Silicon a través de MLX.

La relevancia de esta ficha radica en que ofrece una variante comprimida de un modelo de 27B parámetros con capacidades de agente, tool calling y procesamiento de imágenes, pensada para despliegue local sin sacrificar demasiada fidelidad. La cuantización de 3 bits con grupo de tamaño 64 es una opción agresiva que reduce significativamente los requisitos de memoria, aunque puede implicar una pérdida de precisión frente a versiones de 4 o 8 bits. El formato MLX safetensors es específico para el ecosistema de Apple, lo que limita su uso a esa plataforma.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denso híbrido (48 capas con attention lineal, 16 con full attention) + torre de visión |
| Parametros totales | 27 000 millones (modelo original); safetensors reporta 3 709 794 816 (posible metadata) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens nativos, extensible a 1 000 000 |
| Tipos de cuantizacion | 3 bits (oQ3e, group size 64, mixed-precision) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la del modelo original es Apache 2.0, sin confirmar) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso de 27 mil millones de parámetros que combina atención de ventana completa con attention lineal en la mayoría de sus capas (48 de 64), una innovación heredada de la serie Qwen3.5. Esta arquitectura híbrida permite manejar secuencias de hasta 262 000 tokens de forma eficiente, con un coste computacional reducido en comparación con atención cuadrática pura. Además, incorpora una torre de visión que le otorga capacidades multimodales nativas, y un MTP (Multi-Token Prediction) draft head para acelerar la decodificación especulativa. Los detalles del entrenamiento (composición del dataset, número de tokens, técnicas de alineación como RLHF o DPO) no están disponibles en la información proporcionada.

La cuantización oQ3e aplicada por guutong utiliza la librería oQ de oMLX, que emplea cuantización de precisión mixta: los pesos se almacenan en 3 bits con un grupo de tamaño 64, mientras que algunos componentes (como el head de visión o capas críticas) se mantienen en FP16 para preservar la calidad. El resultado es un modelo de 12 GB en disco, frente a los aproximadamente 54 GB del original en FP16.

## Capacidades

- Generación de texto y razonamiento de propósito general, con buen desempeño en tareas de codificación, trabajo profesional y agentes autónomos.
- Comprensión multimodal: procesa imágenes y texto, adecuado para tareas de visión-lenguaje.
- Soporte de tool calling y function calling, permitiendo integración con APIs y herramientas externas.
- Agentes y razonamiento multi-step: planificación autónoma y manejo de entornos con feedback, según la documentación de Qwen3.8.
- Ventana de contexto larga (262K nativo, 1M extendido), útil para documentos extensos y conversaciones multi-turno.
- Control de modo de pensamiento flexible, con opción de razonamiento explícito o respuesta directa.
- Decodificación especulativa gracias al MTP draft head, que reduce la latencia en generación.

## Casos de uso

- Asistencia de codificación en producción: con tool calling y generación de código, puede integrarse en pipelines de CI/CD para revisión de PR, generación de tests o autocompletado en IDEs.
- Automatización de oficina: el modelo destaca en tareas de office automation, como generación de informes, resúmenes de correos o gestión de documentos largos.
- Análisis de documentos extensos: gracias a la ventana de 262K tokens, permite resumir y consultar informes técnicos, contratos o libros completos sin truncar el contexto.
- Agentes de razonamiento multi-step: su capacidad de planificación y feedback de entorno lo hace adecuado para agentes que ejecutan tareas complejas (búsqueda de información, ejecución de scripts, etc.).
- Asistente de visión en hardware local: la cuantización MLX permite desplegar un asistente que analiza capturas de pantalla o imágenes en un Mac, sin conexión a la nube.
- Chat de atención al cliente con contexto largo: puede gestionar conversaciones multi-turno con historial extenso, manteniendo coherencia a lo largo de la interacción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización oQ3e en la información disponible. El modelo original Qwen3.8-27B ha sido evaluado en tareas como MathVision y otras suites de razonamiento, según el repositorio oficial, pero no se incluyen números concretos en esta ficha.

## Requisitos de hardware

- VRAM estimada: la cuantización de 3 bits con group size 64 ocupa aproximadamente 12 GB en disco; la memoria necesaria para inferencia ronda los 13-14 GB, incluyendo overhead de activaciones.
- GPU recomendadas: el formato MLX requiere Apple Silicon (M1, M2, M3 o posteriores). No es compatible con CUDA o ROCm sin conversión previa.
- Memoria del sistema: se recomienda al menos 16 GB de RAM unificada en un Mac; para contextos largos (262K), es preferible 32 GB o más.
- Opciones de despliegue: la librería oMLX permite cargar el modelo directamente; también puede ejecutarse con el runtime de MLX en Python. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no hay datos publicados para esta cuantización. La decodificación especulativa del MTP puede reducir la latencia en comparación con la decodificación autoregresiva estándar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | FP16/BF16 | Apache 2.0 (por confirmar) | HuggingFace |
| Qwen3.8-27B-oQ3e (esta cuantización) | 27B | 262K | 3-bit MLX | No disponible | HuggingFace |
| Qwen3.5-27B (si existe) | 27B | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos entre estas variantes. La cuantización oQ3e ofrece una ventaja de tamaño (12 GB frente a ~55 GB) a costa de una posible pérdida de fidelidad en tareas de precisión.

## Limitaciones y advertencias

- Cuantización de 3 bits agresiva: puede provocar una pérdida notable de calidad en tareas de razonamiento complejo, matemáticas o generación de código, en comparación con cuantizaciones de 4 o 8 bits.
- Compatibilidad limitada: el formato MLX es exclusivo de Apple Silicon; no puede ejecutarse directamente en GPUs NVIDIA o AMD sin conversión.
- Licencia no especificada en el repo: aunque el modelo original es de Alibaba y probablemente Apache 2.0, la cuantización no declara su licencia, lo que puede generar incertidumbre legal para uso comercial.
- Idiomas soportados no confirmados: aunque Qwen3.8 es multilingüe, la ficha no especifica qué idiomas cubre esta cuantización.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento de pocos pasos con baja precisión.
- La metadata de safetensors reporta 3.7B parámetros, lo que es inconsistente con el tamaño nominal de 27B; podría ser un error de la herramienta de cuantización, pero no se ha validado.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/guutong/Qwen3.8-27B-oQ3e-fp16-mtp
- Repositorio oficial de Qwen3.8-27B (GitHub): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Modelo original en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Serie Qwen3.8 (GitHub): https://github.com/QwenLM/Qwen3.8
- Página de LM Studio para Qwen3.8-27B: https://lmstudio.ai/models/qwen/qwen3.8-27b
- Recetas de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
