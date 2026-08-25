# kerasformers/deepseek_vl_1.3b_chat

## Resumen

DeepSeek-VL 1.3B chat es un modelo de vision-lenguaje (VLM) desarrollado originalmente por DeepSeek AI y publicado en marzo de 2024. Este checkpoint concreto, `kerasformers/deepseek_vl_1.3b_chat`, es una conversión a Keras 3 puro realizada por el proyecto KerasFormers, lo que permite ejecutar el mismo modelo de forma indistinta sobre TensorFlow, PyTorch o JAX sin modificar el código. El modelo combina un codificador visual SigLIP de 384 píxeles, un alineador MLP de dos capas con activación GELU y un decodificador de texto basado en la arquitectura Llama, sumando aproximadamente 1.300 millones de parámetros.

La relevancia de este modelo reside en dos frentes. Por un lado, DeepSeek-VL fue uno de los primeros VLM open source diseñados para tareas del mundo real, con soporte para conversaciones multimodales, razonamiento sobre imágenes y comprensión de documentos. Por otro, la conversión a Keras 3 elimina la dependencia de un framework concreto, facilitando la integración en entornos heterogéneos y el despliegue en infraestructuras que ya usan TensorFlow o JAX. El modelo base es `deepseek-ai/deepseek-vl-1.3b-chat`, y esta versión mantiene la misma licencia DeepSeek, que permite uso comercial bajo ciertas condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP (vision) + MLP aligner de 2 capas GELU + decodificador Llama (texto) |
| Parametros totales | 1,3B (aprox.) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato Keras nativo; los pesos originales estan en safetensors) |
| Idiomas soportados | no disponible (el modelo original soporta principalmente ingles y chino) |
| Licencia | DeepSeek (licencia propia, `other` en HuggingFace) |
| Formato de pesos | Keras 3 (`.weights`), con soporte para cargar safetensors originales via prefijo `hf:` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura híbrida típica de los VLM modernos. El codificador visual es un SigLIP con resolución de entrada de 384x384 píxeles, que extrae características de la imagen. Estas características se proyectan mediante un alineador MLP de dos capas con activación GELU exacta (matching la implementación de referencia), que las transforma en embeddings compatibles con el espacio semántico del decodificador de texto. El decodificador es un modelo basado en la arquitectura Llama, que procesa tanto los tokens de texto como los embeddings visuales para generar respuestas. Cada imagen se expande a un número fijo de placeholders (`num_image_tokens`) que el decodificador trata como tokens especiales.

Los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. El paper original (arXiv:2403.05525) describe el proceso de entrenamiento del modelo DeepSeek-VL, que incluye fases de preentrenamiento y fine-tuning supervisado, pero esta ficha se limita a los datos públicos de la conversión Keras. La conversión de KerasFormers no modifica los pesos; reproduce la arquitectura y carga los pesos originales, por lo que el comportamiento del modelo es idéntico al checkpoint de DeepSeek AI.

## Capacidades

- Generación de texto condicionada por imágenes: puede describir imágenes, responder preguntas sobre su contenido y mantener conversaciones multimodales multi-turno.
- Comprensión de documentos: al procesar imágenes de páginas o capturas, puede extraer información textual y responder sobre ella.
- Razonamiento visual: combina la información de la imagen con el contexto textual para tareas que requieren inferencia (por ejemplo, "¿qué herramienta se necesita para arreglar esto?").
- Soporte de chat: el checkpoint `chat` está fine-tuneado para mantener diálogos naturales, con formato de conversación definido por el procesador.
- Multi-backend: gracias a Keras 3, el mismo modelo se ejecuta en TensorFlow, PyTorch y JAX sin cambios en el código.
- Carga flexible de pesos: permite cargar tanto los pesos convertidos de KerasFormers como los safetensors originales de HuggingFace mediante el prefijo `hf:`.

## Casos de uso

- Descripción automática de imágenes para accesibilidad: el modelo puede generar texto alternativo para imágenes en sitios web o aplicaciones, ayudando a usuarios con discapacidad visual. Su tamaño de 1,3B lo hace adecuado para entornos con recursos limitados.
- Asistente de soporte técnico visual: un usuario envía una foto de un error en pantalla o un componente físico, y el modelo interpreta la imagen para ofrecer pasos de solución. El modo chat permite mantener el contexto de la conversación.
- Extracción de información de documentos escaneados: al procesar capturas de facturas, formularios o tarjetas de visita, el modelo puede transcribir y estructurar los datos relevantes, integrándose en pipelines de automatización documental.
- Anotación de datasets para entrenamiento: el modelo puede generar descripciones o etiquetas preliminares para imágenes, acelerando la creación de datasets supervisados para otros modelos.
- Educación interactiva: un chatbot educativo que recibe fotos de ejercicios de matemáticas o diagramas y explica los pasos para resolverlos, combinando visión y razonamiento textual.
- Moderación de contenido visual: el modelo puede analizar imágenes subidas por usuarios y generar descripciones que alimenten sistemas de filtrado o clasificación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de KerasFormers no incluye métricas de evaluación, y la conversión no modifica los pesos del modelo original, por lo que el rendimiento esperado es equivalente al de `deepseek-ai/deepseek-vl-1.3b-chat`. Para datos de benchmarks (como MMMU, POPE o MMBench), se recomienda consultar el paper original o la model card del modelo base en HuggingFace.

## Requisitos de hardware

- VRAM estimada: con 1,3B de parámetros, el modelo en precisión FP16 ocupa aproximadamente 2,6 GB de memoria. Con cuantización a 8 bits, se reduce a unos 1,3 GB; a 4 bits, por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16. Tarjetas como NVIDIA GTX 1660 Super, RTX 3060 o superiores son suficientes. Para inferencia en producción, una T4 o A10G ofrece un buen equilibrio coste-rendimiento.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de consumo de gama media e incluso en algunas de gama baja si se cuantiza.
- Opciones de despliegue: al ser Keras 3, se puede servir con TensorFlow Serving, o exportar a TensorFlow Lite para edge. También es posible usar el backend de JAX con compilación XLA para acelerar la inferencia. Para despliegue en producción con alta concurrencia, se puede integrar con vLLM si se exportan los pesos a safetensors, o usar TGI con el modelo original.
- Latencia y throughput: no disponible en la información proporcionada. Dependerá del hardware y del backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision encoder | Licencia | Formato |
|---|---|---|---|---|---|
| DeepSeek-VL 1.3B chat (original) | 1,3B | no disponible | SigLIP | DeepSeek | safetensors |
| kerasformers/deepseek_vl_1.3b_chat | 1,3B | no disponible | SigLIP | DeepSeek | Keras 3 |
| LLaVA-1.5 7B | 7B | 4096 | CLIP ViT-L/14 | Apache 2.0 | safetensors |
| Qwen-VL 1.5 (4B) | 4B | 32768 | ViT | Qwen | safetensors |

La comparativa directa con otros VLM de tamaño similar no está disponible en la información proporcionada. La principal diferencia de esta versión Keras frente al original es el formato de pesos y la portabilidad entre backends; el rendimiento funcional es idéntico. Frente a alternativas como LLaVA o Qwen-VL, DeepSeek-VL 1.3B ofrece un tamaño menor, lo que lo hace más ligero para despliegues en edge, aunque con menor capacidad de razonamiento que modelos de 7B.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo hereda los sesgos del dataset de entrenamiento original de DeepSeek-VL, que no están documentados en la información proporcionada. Se recomienda evaluar el comportamiento en el dominio de uso antes de desplegar en producción.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir descripciones o respuestas inexactas sobre el contenido de las imágenes, especialmente en escenarios ambiguos o con imágenes de baja calidad.
- Limitaciones de idioma: la información proporcionada no especifica los idiomas soportados. El modelo original de DeepSeek-VL está entrenado principalmente en inglés y chino, por lo que su rendimiento en otros idiomas puede ser limitado.
- Restricciones de licencia: la licencia DeepSeek permite uso comercial, pero con condiciones específicas (consultar el LICENSE del modelo base). No se debe asumir que es equivalente a una licencia permisiva tipo Apache 2.0.
- Limitaciones de contexto: la longitud de contexto no está documentada en esta conversión. Para tareas que requieran procesar documentos largos o conversaciones extensas, se recomienda verificar el límite real del modelo base.
- Advertencia de producción: la conversión Keras 3 es relativamente reciente (creada en agosto de 2026) y tiene pocas descargas (38). Antes de usarla en entornos críticos, se recomienda validar la paridad de resultados con el modelo original y revisar el estado del proyecto KerasFormers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kerasformers/deepseek_vl_1.3b_chat
- Modelo base original: https://huggingface.co/deepseek-ai/deepseek-vl-1.3b-chat
- Paper original: https://arxiv.org/abs/2403.05525
- Paper en HuggingFace: https://huggingface.co/papers/2403.05525
- Repositorio GitHub de DeepSeek-VL: https://github.com/deepseek-ai/DeepSeek-VL
- Repositorio GitHub de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentación de DeepSeek-VL en KerasFormers: https://imvision12.github.io/KerasFormers/deepseek_vl/
- Colección de variantes DeepSeek-VL en KerasFormers: https://huggingface.co/collections/kerasformers/deepseek-vl-6a6ea961fe80d98b7c69b489
- Licencia del modelo base: https://huggingface.co/deepseek-ai/deepseek-vl-1.3b-chat/blob/main/LICENSE
