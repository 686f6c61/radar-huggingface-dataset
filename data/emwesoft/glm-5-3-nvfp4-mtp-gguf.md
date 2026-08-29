# emwesoft/GLM-5.3-NVFP4-MTP-GGUF

## Resumen

GLM-5.3-NVFP4-MTP-GGUF es una conversión nativa a formato GGUF del modelo GLM-5.3 de Z.ai, realizada por el usuario emwesoft. El modelo original, zai-org/GLM-5.3, es un transformador de mezcla de expertos (MoE) con 753 mil millones de parámetros y una ventana de contexto de 1 millón de tokens, que según Unsloth es el modelo abierto más potente hasta agosto de 2026, con resultados SOTA en Terminal Bench 3.0 y Agents' Last Exam. Esta versión GGUF incorpora el bloque 78, correspondiente a la cabeza MTP (Multi-Token Prediction) o NextN, que permite decodificación especulativa directamente desde el propio checkpoint, sin necesidad de un modelo drafter externo.

La conversión mantiene el tronco del modelo en cuantización NVFP4 (4 bits de punto flotante de NVIDIA) tal como lo distribuye incoai en su repack, sin recuantizar. Los expertos del bloque MTP se conservan en BF16, lo que aumenta ligeramente el tamaño total del archivo (465 GB en 11 shards). El modelo está diseñado para ejecutarse con llama.cpp, pero requiere una versión con soporte para la arquitectura glm-dsa y el tipo GGML_TYPE_NVFP4, además de tres parches que aún no están integrados en la rama principal. Es una opción pensada para entornos con hardware de gama alta, ya que los pesos no caben en la VRAM de una sola GPU profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención diferida (glm-dsa) y cabeza MTP (NextN) |
| Parametros totales | 753B (según README del autor) |
| Parametros activos | no disponible |
| Longitud de contexto | 1M tokens (según Unsloth) |
| Tipos de cuantizacion | NVFP4 (tronco), BF16 (expertos del bloque MTP) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors originales en NVFP4, convertidos a GGUF) |

## Arquitectura y entrenamiento

GLM-5.3 es un modelo de lenguaje de gran escala basado en una arquitectura de mezcla de expertos (MoE) con atención diferida (glm-dsa), una variante de atención que reduce el coste computacional en secuencias largas. El modelo base, zai-org/GLM-5.3, comparte la misma arquitectura que GLM-5.2, y todas las mejoras de rendimiento provienen del post-entrenamiento, según la documentación de Unsloth. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición del dataset.

La versión NVFP4 de incoai aplica cuantización de 4 bits en punto flotante únicamente a los lineales de los expertos MoE, mientras que los expertos compartidos, las capas de atención, los embeddings y las capas densas tempranas se mantienen en BF16. Esta conversión GGUF conserva esa distribución de precisión. El bloque 78, que contiene la cabeza MTP, se mantiene íntegramente en BF16 (27 tensores, 18.54 GiB), lo que permite que el propio modelo genere múltiples tokens por paso y acelere la inferencia mediante decodificación especulativa. El archivo incluye 79 bloques en total (78 del tronco más el MTP), con `nextn_predict_layers` igual a 1.

## Capacidades

- Generación de texto y razonamiento complejo con modo de pensamiento (reasoning effort configurable entre low, high y max; el pensamiento no se puede desactivar).
- Soporte de tool calling / function calling, aunque requiere un parche específico en la plantilla Jinja para que funcione correctamente (acceso a atributos numéricos como `m.content.0.output`).
- Capacidad para actuar como agente autónomo en tareas multi-paso, gracias a su contexto de 1M tokens y su rendimiento SOTA en benchmarks de agentes.
- Decodificación especulativa integrada mediante la cabeza MTP, con una tasa de aceptación medida del 74.9% con `n-max 3`.
- Multilingüismo probable, aunque no se especifican los idiomas soportados en la documentación disponible.
- Compatible con llama.cpp y otras herramientas que soporten GGUF, siempre que se apliquen los parches necesarios.

## Casos de uso

- Atención al cliente automatizada a gran escala: el modelo puede gestionar conversaciones multi-turno con contexto muy largo (hasta 1M tokens), lo que permite mantener el historial completo de una interacción sin truncamientos. Su capacidad de tool calling permite integrarse con sistemas de ticketing o bases de conocimiento.
- Generación de código en producción: con soporte para tool calling y razonamiento avanzado, puede utilizarse en pipelines de CI/CD para generar, revisar y corregir código, así como para autocompletar funciones complejas en entornos de desarrollo.
- Agentes autónomos de investigación: gracias a su contexto de 1M tokens y su rendimiento en benchmarks de agentes, puede procesar documentos largos, extraer información y ejecutar múltiples pasos de razonamiento para tareas como análisis de informes financieros o revisión de literatura científica.
- Análisis de documentos legales o técnicos extensos: la ventana de 1M tokens permite ingerir contratos completos, patentes o manuales técnicos de cientos de páginas y responder preguntas específicas sobre su contenido.
- Asistente de programación con razonamiento matemático: el modo de pensamiento (reasoning effort) permite abordar problemas matemáticos o algorítmicos complejos, generando explicaciones paso a paso y código ejecutable.
- Despliegue de modelos de lenguaje en entornos con hardware especializado: al estar en formato GGUF y cuantizado en NVFP4, puede ejecutarse en configuraciones multi-GPU con llama.cpp, aprovechando la decodificación especulativa para mejorar el throughput en servidores de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La documentación de Unsloth indica que GLM-5.3 es el modelo abierto más fuerte hasta la fecha, con SOTA en Terminal Bench 3.0 y Agents' Last Exam, pero no se proporcionan cifras concretas.

El autor de esta conversión GGUF sí ha medido el throughput en una configuración específica (2x RTX PRO 6000 Blackwell + 4x RTX 3090 + 251 GB RAM, contexto 400K, `-t 36 -tb 40`, expertos parcialmente en CPU):

| Configuracion | Aceptacion | Decode |
|---|---|---|
| MTP head, n-max 3 | 74.9% (longitud media 3.24) | 9.3-12.2 tok/s |
| DFlash2 Q8_0, n-max 4 | 67.7% (longitud media 3.69) | 7.6-12.8 tok/s |
| Sin especulacion | - | ~10 tok/s |

Estos valores son dependientes del prompt y de la configuración de hilos; el autor advierte que usar todos los hilos de la CPU puede degradar el rendimiento drásticamente.

## Requisitos de hardware

- VRAM estimada: el modelo completo ocupa 465 GB en disco. Con cuantización NVFP4, los pesos no caben en la VRAM de una sola GPU profesional (por ejemplo, una RTX 6000 Ada tiene 48 GB). Se requiere una configuración multi-GPU o una combinación de GPU y CPU.
- GPU recomendadas: el autor probó con 2x RTX PRO 6000 Blackwell (96 GB en total) más 4x RTX 3090 (96 GB adicionales), sumando 192 GB de VRAM, y aun así tuvo que alojar parte de los expertos en RAM (251 GB). Para una ejecución completa en VRAM se necesitarían al menos 6-8 GPUs de 80 GB (como H100 o A100) o GPUs de 96 GB.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) de forma individual; se requiere un servidor con múltiples GPUs.
- Opciones de despliegue: llama.cpp con soporte para `glm-dsa` y `GGML_TYPE_NVFP4`, más los tres parches no upstream mencionados en el README. También podría usarse vLLM si se adapta el formato, pero no se documenta.
- Latencia y throughput: en la configuración probada, se obtienen entre 9.3 y 12.2 tokens por segundo con decodificación especulativa MTP, y alrededor de 10 tok/s sin especulación. El rendimiento depende críticamente del número de hilos de CPU; el autor recomienda dejar margen (por ejemplo, `-t 36` en un CPU de 24 núcleos/48 hilos).

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos de la misma categoría. El modelo base GLM-5.3 es el mismo que GLM-5.2, con mejoras de post-entrenamiento. En el ecosistema de modelos abiertos de gran tamaño, alternativas como DeepSeek-V3 o Qwen2.5-Max podrían ser comparables, pero no se han encontrado benchmarks públicos que permitan una comparación directa en esta ficha. La principal diferencia de esta versión GGUF es su formato optimizado para inferencia local con decodificación especulativa integrada.

## Limitaciones y advertencias

- El modelo requiere parches no integrados en la rama principal de llama.cpp: el acceso a atributos numéricos en la plantilla Jinja, la exposición de entradas de capa para DFlash y la tolerancia a espacios en blanco antes de la etiqueta `</tool_call>`. Sin estos parches, el tool calling falla o se comporta de forma incorrecta.
- El modo de pensamiento (reasoning) no se puede desactivar; la plantilla solo expone los niveles low, high y max, y cualquier otro valor se trata como max.
- El tamaño del modelo (465 GB) hace que sea inviable en la mayoría de entornos de desarrollo; se necesita un servidor con múltiples GPUs de alta gama o una configuración híbrida GPU/CPU.
- El rendimiento de decodificación especulativa depende del prompt y de la configuración de hilos; un uso excesivo de hilos de CPU puede colapsar el throughput (el autor observó 0.5 tok/s con `-t 48`).
- No se han documentado sesgos específicos, pero al ser un modelo de gran tamaño entrenado con datos web, es probable que presente sesgos sociales y culturales. No se ha realizado una evaluación de sesgos en esta conversión.
- La licencia MIT permite uso comercial, pero el modelo base puede tener restricciones adicionales; se recomienda verificar la licencia de zai-org/GLM-5.3.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/emwesoft/GLM-5.3-NVFP4-MTP-GGUF
- Versión sin MTP: https://huggingface.co/emwesoft/GLM-5.3-NVFP4-GGUF
- Drafters DFlash2: https://huggingface.co/emwesoft/GLM-5.3-DFlash2-GGUF
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3
- Repack NVFP4 de incoai: https://huggingface.co/incoai/GLM-5.3-NVFP4
- Guía de ejecución local de Unsloth: https://unsloth.ai/docs/models/glm-5.3
- Recetas vLLM para GLM-5.3: https://recipes.vllm.ai/zai-org/GLM-5.3
