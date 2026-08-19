# kerasformers/qwen3.8-27b

## Resumen

El modelo `kerasformers/qwen3.8-27b` es una conversión pura en Keras 3 del modelo Qwen3.8-27B de Alibaba, realizada por el proyecto KerasFormers. Se trata de un modelo de visión-lenguaje (VLM) nativo que combina una torre de visión Qwen3-VL con un decoder de texto híbrido basado en Gated-DeltaNet y atención completa. Su principal ventaja es que, gracias a Keras 3, puede ejecutarse sin modificaciones en TensorFlow, PyTorch o JAX, lo que facilita la portabilidad entre frameworks. El modelo está pensado para tareas que combinan imagen y texto, como descripción de imágenes o respuesta a preguntas visuales, aunque también puede usarse solo con texto. Los pesos se almacenan en bfloat16 y el repositorio ocupa 54.8 GB. La licencia es Apache 2.0, lo que permite uso comercial. Aunque el modelo original de Qwen soporta múltiples idiomas, la model card de esta conversión solo declara inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language: torre de visión Qwen3-VL + decoder de texto híbrido Gated-DeltaNet / atención completa |
| Parametros totales | no disponible (el nombre sugiere 27B, pero no se confirma en la documentación) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | inglés (según la model card; el modelo original puede soportar más) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors o formato propio de Keras, no especificado) |

## Arquitectura y entrenamiento

El modelo es un VLM nativo que integra una torre de visión basada en Qwen3-VL para procesar imágenes y un decoder de texto híbrido que combina capas de Gated-DeltaNet con capas de atención completa (gated full attention). Esta arquitectura híbrida busca un equilibrio entre eficiencia computacional y capacidad de modelado de dependencias de largo alcance. La implementación en Keras 3 permite ejecutar el mismo código en TensorFlow, PyTorch o JAX sin cambios. No se proporcionan detalles sobre el entrenamiento, como el número de tokens, la composición del dataset o si se usaron técnicas de RLHF o DPO. La conversión a Keras 3 no modifica los pesos originales, por lo que las capacidades del modelo son las mismas que las del Qwen3.8-27B original.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto simultáneamente para tareas como descripción de imágenes, respuesta a preguntas visuales (VQA) y razonamiento visual.
- Generación de texto: puede usarse solo con texto mediante la clase `Qwen3_5TextGenerate`, que omite la torre de visión.
- Soporte de conversación multimodal: el procesador admite formatos de conversación con roles de usuario y contenido mixto (imagen + texto).
- Integración con múltiples backends: funciona con TensorFlow, PyTorch y JAX gracias a Keras 3.
- Peso en bfloat16: reduce requisitos de memoria frente a float32 manteniendo buena precisión.

## Casos de uso

- Descripción automática de imágenes: dado un archivo de imagen, el modelo genera una descripción textual en lenguaje natural, útil para accesibilidad o indexación de contenido visual.
- Respuesta a preguntas visuales (VQA): se puede plantear una pregunta sobre una imagen y el modelo responde basándose en el contenido visual, aplicable en dominios como diagnóstico médico por imagen o análisis de documentos escaneados.
- Chatbots multimodales: integración en asistentes que necesitan entender imágenes enviadas por el usuario, por ejemplo, para ayudar a identificar objetos o leer texto en fotos.
- Generación de texto en entornos multi-framework: al ser una implementación Keras 3, puede desplegarse en infraestructuras que usen TensorFlow, PyTorch o JAX sin reescribir el código, facilitando la portabilidad entre equipos.
- Prototipado rápido de aplicaciones de visión-lenguaje: gracias a la API de Keras y a la carga sencilla desde HuggingFace, es adecuado para experimentar con VLM en entornos de investigación.
- Análisis de documentos con contenido mixto: puede procesar imágenes de páginas que contengan texto y gráficos, extrayendo información relevante para tareas de extracción de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los pesos en bfloat16 ocupan aproximadamente 54.8 GB, por lo que se necesita una GPU con al menos 60-70 GB de VRAM para cargar el modelo completo sin cuantización (estimación basada en el tamaño del repositorio; no se proporcionan datos oficiales).
- Para inferencia con cuantización, se podría reducir la huella de memoria, pero no se especifican opciones de cuantización en la documentación.
- Se recomiendan GPUs de alta gama como NVIDIA A100 (80 GB) o H100 (80 GB) para ejecutar el modelo completo. En GPUs de consumo como RTX 4090 (24 GB) no cabría sin cuantización agresiva.
- Opciones de despliegue: al ser una implementación Keras 3, se puede usar con los backends de TensorFlow, PyTorch o JAX. No se mencionan integraciones con vLLM, llama.cpp u Ollama; la carga se realiza mediante la API de kerasformers.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede considerar la comparación con el modelo original Qwen3.8-27B de Alibaba, pero no se detallan diferencias de rendimiento. La principal diferencia es el framework de implementación (Keras 3 frente al PyTorch original) y la disponibilidad de pesos en formato Keras.

## Limitaciones y advertencias

- La model card solo declara soporte para inglés, aunque el modelo original de Qwen probablemente soporta más idiomas; no se garantiza el rendimiento en otros idiomas.
- No se proporcionan detalles sobre sesgos o riesgos de alucinación; como cualquier modelo de lenguaje, puede generar contenido incorrecto o sesgado.
- Al ser una conversión de pesos, puede haber pequeñas diferencias numéricas respecto al modelo original debido a la conversión de formato, aunque en principio no deberían afectar al comportamiento.
- El tamaño del modelo (54.8 GB en bfloat16) requiere hardware de gama alta, lo que limita su uso en entornos con recursos limitados.
- No se especifican limitaciones de contexto; se desconoce la longitud máxima de secuencia soportada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo original Qwen3.8-27B por si hubiera restricciones adicionales.

## Enlaces

- [HuggingFace - kerasformers/qwen3.8-27b](https://huggingface.co/kerasformers/qwen3.8-27b)
- [GitHub - KerasFormers](https://github.com/IMvision12/KerasFormers)
- [Documentación de Qwen3.5 en KerasFormers](https://imvision12.github.io/KerasFormers/qwen3_5/)
- [Colección Qwen3.8 en HuggingFace](https://huggingface.co/collections/kerasformers/qwen38-6a80c290527c3aebcbcebc4b)
- [Modelo original Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
