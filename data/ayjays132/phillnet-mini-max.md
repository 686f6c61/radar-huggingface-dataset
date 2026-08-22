# ayjays132/Phillnet-Mini-Max

## Resumen

Phillnet-Mini-Max es un modelo multimodal de lenguaje y visión desarrollado por el usuario ayjays132. Se presenta como una versión ligera y especializada del modelo Phillnet-Mini-Omni-Max, del que conserva las rutas de generación de texto y comprensión de imágenes estáticas, pero elimina por completo el stack de síntesis SDXL (generación de imágenes, video, audio, herramientas y agentes). El resultado es un modelo enfocado en tareas de texto, chat multimodal, respuesta a preguntas visuales y razonamiento con imágenes.

Con 881,8 millones de parámetros y un tamaño de checkpoint de 1,8 GB, el modelo está diseñado para ejecutarse con recursos moderados. Su configuración por defecto activa un razonamiento adaptativo "max" con una ventana de contexto activa de 32 768 tokens y un límite visible de respuesta de 8 192 tokens. Incluye un procesador local (DendroVisionProcessor) que usa el tokenizador nativo de Qwen y un contrato de tokens de visión, lo que elimina la dependencia de procesadores externos.

Aunque su nombre sugiere una variante "max", la model card lo describe como "Phillnet Mini Text-Vision" y no se especifica una arquitectura concreta más allá de ser un transformer multimodal con código personalizado. Su relevancia actual reside en ofrecer una alternativa compacta y autocontenida para aplicaciones que necesitan generación de texto y comprensión de imágenes sin la complejidad de los modelos omni.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (detalles no especificados) |
| Parametros totales | 881 827 584 |
| Parametros activos | no disponible |
| Longitud de contexto | 32 768 tokens (ventana activa); respuesta visible limitada a 8 192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no ofrece detalles sobre la arquitectura interna ni sobre el proceso de entrenamiento. Se indica que el checkpoint `model.safetensors` es idéntico al del modelo fuente `ayjays132/Phillnet-Mini-Omni-Max`, del que se eliminan los componentes de SDXL (U-Net, VAE, text encoders, scheduler, adapters) y las rutas de video, audio, herramientas y agentes. El modelo se ejecuta mediante código personalizado de Transformers (`DendroForCausalLM`) y un procesador local que usa el tokenizador de Qwen y un contrato de tokens de visión. No se menciona el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

La innovación técnica más destacable es el modo de razonamiento adaptativo: el modelo puede expandir su razonamiento privado hasta el límite de la ventana de contexto activa (32 768 tokens) y luego reserva un bloque separado para la respuesta visible, con un techo fijo de 8 192 tokens. Este comportamiento se controla mediante parámetros como `reasoning_effort` (direct, low, medium, high, max) y `max_tokens`.

## Capacidades

- Generación de texto: completado de texto, redacción de respuestas, creación de contenido escrito.
- Comprensión de imágenes estáticas: responde preguntas sobre imágenes (VQA) y razonamiento basado en imágenes.
- Generación de código y HTML: el modelo puede generar código HTML, CSS y JavaScript, como se muestra en los ejemplos de la model card (landing pages, dashboards).
- Razonamiento adaptativo: con configuración de esfuerzo (`direct`, `low`, `medium`, `high`, `max`) que controla la profundidad del razonamiento privado.
- Razonamiento privado: el razonamiento interno se mantiene oculto; solo se devuelve la respuesta final.
- Soporte de chat multimodal: puede mantener conversaciones que combinan texto e imágenes.
- No incluye: generación de imágenes, video, audio, herramientas (tool calling), agentes ni orquestación.

## Casos de uso

- Asistente de atención al cliente: el modelo puede gestionar conversaciones de soporte que incluyan capturas de pantalla o imágenes de productos, con un contexto de 32 768 tokens para mantener historiales largos y respuestas de hasta 8 192 tokens.
- Generación de código y maquetas web: a partir de una descripción textual, el modelo genera páginas HTML completas con CSS y JavaScript, como demuestran los ejemplos de la model card (landing page, dashboard, página de notas).
- Análisis de documentos con imágenes: permite extraer información de gráficos, diagramas o fotografías y responder preguntas sobre ellos, útil en entornos de investigación o soporte técnico.
- Asistente de programación: puede generar fragmentos de código, explicar algoritmos o completar funciones, aunque sin soporte de tool calling para integrarse directamente en IDEs.
- Educación y tutoría: responde preguntas sobre imágenes (por ejemplo, problemas de geometría o diagramas científicos) y genera explicaciones en texto.
- Redacción de contenido técnico: genera notas, resúmenes o documentación a partir de indicaciones de texto, con opción de controlar la longitud de la respuesta.
- Creación de dashboards: el modelo puede producir paneles de control visuales en HTML a partir de descripciones textuales, útil para prototipos rápidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con pesos en bfloat16 (1,8 GB de checkpoint), la inferencia puede caber en GPUs con al menos 6-8 GB de VRAM, considerando la ventana de contexto de 32 768 tokens. Sin embargo, no se han publicado medidas oficiales.
- GPU recomendadas: cualquier GPU con soporte bfloat16 (RTX 3090, RTX 4090, A100, H100) o CPU con suficiente RAM (la inferencia en CPU es posible pero lenta).
- Consumer GPU: sí, modelos como RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) pueden ejecutar el modelo, aunque con contextos más reducidos.
- Opciones de despliegue: el modelo usa código personalizado de Transformers, por lo que se carga con `trust_remote_code=True`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI; requiere un entorno Python con Transformers y PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (tamaño ~900M, multimodal texto-imagen). El modelo es un derivado de `Phillnet-Mini-Omni-Max`, que no tiene una ficha pública comparable. La comparación directa con modelos como LLaVA o Phi-3-vision no se puede establecer sin datos de rendimiento.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés, por lo que no es adecuado para uso multilingüe.
- No soporta generación de imágenes, video, audio ni herramientas, por lo que no es un modelo omni completo.
- El razonamiento adaptativo puede ser computacionalmente intensivo, especialmente con `reasoning_effort="max"`, lo que puede aumentar la latencia y el consumo de VRAM.
- La respuesta visible está limitada a 8 192 tokens; para salidas más largas no es adecuado.
- El modelo usa código personalizado (`custom_code`), lo que requiere `trust_remote_code=True` y conlleva un riesgo de seguridad si no se revisa el código.
- No hay información sobre sesgos o alucinaciones específicas, pero como modelo de lenguaje, puede generar contenido incorrecto o inventado.
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre el entrenamiento y los datos limita la trazabilidad.

## Enlaces

- [HuggingFace: ayjays132/Phillnet-Mini-Max](https://huggingface.co/ayjays132/Phillnet-Mini-Max)
- [HuggingFace: ayjays132/phillnet](https://huggingface.co/ayjays132/phillnet) (modelo base relacionado)
- [HuggingFace: ayjays132/PhillnetLarge](https://huggingface.co/ayjays132/PhillnetLarge) (otra variante)
- [FriendliAI: ayjays132/PHILLNET-1](https://friendli.ai/models/ayjays132/PHILLNET-1) (servicio de inferencia)
- [GitHub: phillnet-complete-life-studio](https://github.com/ayjays132/phillnet-complete-life-studio)
