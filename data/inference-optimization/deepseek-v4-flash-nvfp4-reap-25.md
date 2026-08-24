# inference-optimization/DeepSeek-V4-Flash-NVFP4-REAP-25

## Resumen

DeepSeek-V4-Flash-NVFP4-REAP-25 es una variante optimizada para inferencia del modelo DeepSeek-V4-Flash de DeepSeek-AI, publicada por el usuario `inference-optimization`. El modelo base es un MoE disperso de 284.000 millones de parámetros con solo 13.000 millones activos por paso, diseñado como hermano menor de DeepSeek-V4-Pro (1,6 billones de parámetros, 49.000 millones activos). Incorpora una ventana de contexto nativa de 1 millón de tokens y un esquema de razonamiento en tres niveles (Non-think, Think High y Think Max).

El sufijo NVFP4-REAP-25 indica que los pesos se han cuantizado al formato NVFP4 (punto flotante de 4 bits de NVIDIA) y se ha aplicado una compresión basada en el método REAP, probablemente poda o reconstrucción de pesos para reducir el tamaño y acelerar la inferencia. El repositorio contiene 123.692.271.833 parámetros en formato safetensors, con un tamaño total de 129,9 GB, lo que sugiere que la cuantización reduce sustancialmente el peso respecto al modelo original en FP8 o BF16. La etiqueta `compressed-tensors` indica compatibilidad con el ecosistema de vLLM para cargas cuantizadas.

La relevancia de esta variante radica en que permite ejecutar un modelo MoE de 284B con requisitos de VRAM notablemente reducidos, manteniendo la capacidad de razonamiento y la ventana de contexto de 1M tokens, lo que la hace interesante para despliegues en entornos con GPUs de gama alta o incluso consumer en configuraciones multi-GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida CSA+HCA y hyper-conexiones con restricciones de manifold |
| Parametros totales | 123.692.271.833 (pesos cuantizados en safetensors); el modelo base declara 284.000 millones |
| Parametros activos | 13.000 millones (modelo base, segun DeepSeek-AI) |
| Longitud de contexto | 1.000.000 tokens (nativa, del modelo base) |
| Tipos de cuantizacion | NVFP4 (4 bits) con compresion REAP; etiquetado como 8-bit en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; el modelo base de DeepSeek-AI tiene licencia propia (consultar deepseek-ai/DeepSeek-V4-Flash) |
| Formato de pesos | safetensors con compressed-tensors |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash es un transformer MoE disperso con una arquitectura híbrida de atención que combina CSA (Cross-Self-Attention) y HCA (Hybrid Cross-Attention), junto con hyper-conexiones con restricciones de manifold que estabilizan el entrenamiento de redes profundas. El modelo tiene tres niveles de razonamiento (Non-think, Think High y Think Max) que permiten ajustar el esfuerzo computacional según la tarea. El entrenamiento del modelo base fue realizado por DeepSeek-AI con datos de texto y código, aunque no se han publicado cifras exactas de tokens o composición del dataset en la información disponible.

La variante NVFP4-REAP-25 aplica una cuantización de 4 bits sobre los pesos del modelo base, seguida de una compresión REAP (posiblemente un método de poda o reconstrucción de tensores para minimizar la pérdida de precisión). El resultado es un conjunto de pesos de 123,7B parámetros en safetensors, con un tamaño de 129,9 GB. El uso de `compressed-tensors` indica que la cuantización sigue el formato de vLLM, lo que facilita su carga en motores de inferencia modernos.

## Capacidades

- Generación de texto con razonamiento de tres niveles: Non-think (respuesta rápida), Think High (razonamiento intermedio) y Think Max (razonamiento profundo).
- Codificación y programación: el modelo base está optimizado para tareas de código y agentes, según NVIDIA NIM.
- Soporte de agentes y multi-step reasoning: la ventana de 1M tokens permite mantener contextos largos en flujos de trabajo de agente.
- Capacidades multilingües: el modelo base soporta múltiples idiomas, aunque no se especifica la lista en la información disponible.
- Atención híbrida CSA+HCA: permite manejar contextos muy largos con eficiencia computacional.
- Compatible con el ecosistema de vLLM gracias al formato compressed-tensors.

## Casos de uso

- Atención al cliente automatizada con contexto largo: la ventana de 1M tokens permite mantener conversaciones multi-turno extensas sin perder el hilo, ideal para bots de soporte que necesitan recordar interacciones previas.
- Generación de código en producción: el modelo base está optimizado para tareas de código y puede integrarse en pipelines de CI/CD para revisión automática o generación de parches, con soporte de tool calling para interactuar con repositorios.
- Análisis de documentos extensos: la capacidad de procesar 1M tokens permite resumir o extraer información de libros, contratos o informes de miles de páginas en una sola pasada.
- Agentes de automatización de tareas: con soporte de razonamiento multi-step y tool calling, se puede desplegar como agente que planifica y ejecuta tareas complejas (gestión de calendario, búsqueda web, etc.).
- Razonamiento matemático y lógico: el modo Think High/Max permite resolver problemas de matemáticas, física o lógica que requieren cadenas de razonamiento largas.
- Despliegue en entornos con VRAM limitada: gracias a la cuantización NVFP4, el modelo cabe en configuraciones de 2-3 GPU de 48 GB (como A6000 o L40S), lo que lo hace viable para empresas con infraestructura moderada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta variante cuantizada. El modelo base DeepSeek-V4-Flash tiene benchmarks publicados por Lambda Labs, pero no se incluyen cifras concretas en la información proporcionada. Se recomienda consultar el repositorio de DeepSeek-AI o el artículo de Lambda para datos de rendimiento del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización NVFP4 (4 bits), el modelo ocupa aproximadamente 130 GB de pesos, por lo que se requiere al menos 130-150 GB de VRAM para cargar en memoria. En configuraciones multi-GPU, 2x 80GB (A100/H100) o 3x 48GB (L40S/A6000) son suficientes.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB, L40S 48GB, o RTX 4090 24GB en configuraciones de 6-8 GPU (aunque no es recomendable por el ancho de banda).
- Si cabe en consumer GPU: no es viable en una sola GPU de consumo; se necesitan varias GPU o usar offloading a CPU (con rendimiento reducido).
- Opciones de despliegue: vLLM (por el formato compressed-tensors), TensorRT-LLM (soporte NVFP4), llama.cpp con soporte de 4-bit (aunque NVFP4 es específico de NVIDIA), o NVIDIA NIM.
- Latencia y throughput: no disponible; dependerá del número de GPU y del modo de razonamiento (Non-think será más rápido que Think Max).

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash (base) | 284B | 13B | 1M | Licencia DeepSeek | HuggingFace |
| DeepSeek-V4-Flash-NVFP4-REAP-25 | 123,7B (cuantizado) | 23B (base) | 1M | No disponible en el repo | HuggingFace |
| DeepSeek-V4-Pro | 1.6T | 49B | 1M | Licencia DeepSeek | HuggingFace |
| Qwen2.5-Max (referencia de mercado) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con modelos de la misma categoría (MoE de ~300B con contexto de 1M) es limitada; DeepSeek-V4-Pro es el hermano mayor, y Qwen2.5-Max sería una alternativa comercial, pero no se dispone de datos suficientes para una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha evaluado el modelo cuantizado para sesgos; el modelo base puede heredar sesgos de los datos de entrenamiento de DeepSeek.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en modos de razonamiento rápido (Non-think).
- Limitaciones de contexto: aunque el contexto nativo es de 1M tokens, el rendimiento en longitudes muy largas puede degradarse; se recomienda validar con casos reales.
- Restricciones de licencia: el repositorio no especifica licencia; el modelo base de DeepSeek-AI tiene su propia licencia que puede restringir el uso comercial. Consulte la licencia de deepseek-ai/DeepSeek-V4-Flash.
- Limitaciones de cuantización: la cuantización NVFP4 puede perder precisión en tareas de alta exigencia numérica; es recomendable evaluar la degradación en su caso de uso.
- Compatibilidad de hardware: NVFP4 es específico de NVIDIA; en GPUs de AMD o Intel, la cuantización puede no ser compatible o requerir conversión.
- Producción: no hay garantías de estabilidad o soporte para esta variante; es un repositorio de terceros con pocas descargas (9).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/inference-optimization/DeepSeek-V4-Flash-NVFP4-REAP-25
- Modelo base DeepSeek-V4-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Variante FP8/NVFP4 de inference-optimization: https://huggingface.co/inference-optimization/DeepSeek-V4-Flash-FP8-NVFP4
- Página de Lambda AI para DeepSeek-V4-Flash: https://lambda.ai/inference-models/deepseek-ai/deepseek-v4-flash
- Receta de vLLM para DeepSeek-V4-Flash: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash
- NVIDIA NIM para DeepSeek-V4-Flash: https://build.nvidia.com/deepseek-ai/deepseek-v4-flash
