# kerasformers/deepseek_vl_1.3b_base

## Resumen

`kerasformers/deepseek_vl_1.3b_base` es una conversión íntegra a Keras 3 del modelo original `deepseek-ai/deepseek-vl-1.3b-base`, desarrollada por el proyecto KerasFormers. Se trata de un modelo de visión-lenguaje (VLM) compacto de 1.300 millones de parámetros que combina un codificador visual SigLIP a 384×384 píxeles, un alineador MLP de dos capas con activación GELU exacta y un decodificador de texto basado en la arquitectura Llama. El modelo acepta imágenes y texto como entrada y genera texto, lo que lo hace adecuado para tareas de comprensión multimodal como descripción de imágenes, respuesta a preguntas visuales (VQA) y diálogo multimodal.

La relevancia de esta conversión radica en que permite ejecutar DeepSeek-VL de forma nativa en tres backends de Keras 3 (TensorFlow, PyTorch y JAX) sin modificar el código, lo que facilita la integración en flujos de trabajo existentes de Keras y amplía la accesibilidad del modelo a un público que no trabaja necesariamente con PyTorch. El checkpoint base (no chat) está pensado para fine-tuning posterior, mientras que la variante chat está disponible en la misma colección. El modelo se distribuye bajo la licencia DeepSeek, que permite uso comercial según los términos publicados en el repositorio oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP (vision tower) + MLP aligner (2 capas, GELU) + decodificador Llama |
| Parametros totales | 1.300 millones (1.3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | DeepSeek (other, con permiso de uso comercial) |
| Formato de pesos | Keras 3 (formato nativo); safetensors del modelo original compatibles via prefijo `hf:` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DeepSeek-VL descrita en el paper arXiv:2403.05525. El codificador visual es un SigLIP (Sigmoid Loss for Image-Language Pre-training) que procesa imágenes a resolución 384×384 y produce embeddings visuales. Estos embeddings pasan por un alineador MLP de dos capas lineales con activación GELU exacta (que coincide con la implementación de referencia), que los proyecta al espacio de embeddings del texto. El decodificador de texto es un modelo basado en la arquitectura Llama, preentrenado con aproximadamente 500.000 millones de tokens de texto (según la documentación del modelo original). El entrenamiento del VLM completo se realizó en dos etapas: primero un preentrenamiento de alineación visión-lenguaje y después un fine-tuning supervisado para tareas de instrucción visual. Esta conversión de KerasFormers no modifica los pesos originales, sino que los reimplementa en Keras 3, garantizando que la salida sea idéntica a la del checkpoint de referencia.

## Capacidades

- Generación de texto condicionada a imágenes: describe, resume o responde preguntas sobre el contenido visual.
- Comprensión multimodal: integra información visual y textual en un mismo espacio de representación.
- Diálogo multimodal multi-turno (en la variante chat; la base requiere fine-tuning para uso conversacional).
- Soporte de entrada de imagen única por conversación (el procesador acepta una imagen por turno de usuario).
- Compatibilidad multiplataforma: el mismo código se ejecuta en TensorFlow, PyTorch y JAX gracias a Keras 3.
- Carga de pesos desde Hugging Face mediante `from_weights` con prefijo `hf:` para safetensors originales.

## Casos de uso

- Descripción automática de imágenes para accesibilidad: el modelo genera texto alternativo a partir de una imagen, útil para integrar en herramientas de lectura de pantalla o gestión de bibliotecas de medios.
- Respuesta a preguntas visuales (VQA) en dominios específicos: tras un fine-tuning con datos propios, puede responder consultas sobre imágenes médicas, industriales o de documentos escaneados.
- Moderación de contenido visual: clasifica o describe imágenes para detectar contenido inapropiado en plataformas de usuario, combinando la salida del modelo con reglas de negocio.
- Asistentes de documentación técnica: dado un diagrama o captura de pantalla, el modelo genera una explicación textual que puede integrarse en wikis o sistemas de ticketing.
- Prototipado rápido de aplicaciones multimodales: gracias a su tamaño reducido y compatibilidad con Keras 3, es adecuado para validar conceptos en entornos con recursos limitados antes de escalar a modelos mayores.
- Fine-tuning académico: el checkpoint base permite investigar técnicas de alineación visión-lenguaje o adaptación a dominios concretos con un coste computacional moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.300 millones de parámetros, en FP16 el peso ocupa aproximadamente 2,6 GB; con overhead de activaciones y KV cache, se estima un consumo de 4-6 GB en inferencia con contexto corto. Esta es una estimación orientativa, no un dato oficial.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (p. ej., RTX 2060, RTX 3060, RTX 4060) puede ejecutar el modelo en FP16. Para mayor margen, una RTX 3090 o RTX 4090 permite procesar lotes mayores o contextos más largos.
- En consumer GPU: sí, cabe en GPUs de gama media y alta.
- Opciones de despliegue: al ser Keras 3, puede servirse mediante TensorFlow Serving, o exportarse a SavedModel para TFLite; también es posible usar el backend de JAX con compilación XLA. No se menciona soporte directo para vLLM, llama.cpp u Ollama en la documentación de KerasFormers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura visual | Licencia | Formato |
|---|---|---|---|---|---|
| kerasformers/deepseek_vl_1.3b_base | 1.3B | no disponible | SigLIP 384 | DeepSeek | Keras 3 |
| deepseek-ai/deepseek-vl-1.3b-base | 1.3B | no disponible | SigLIP 384 | DeepSeek | PyTorch / safetensors |
| LLaVA-1.5-7B | 7B | 4096 | CLIP ViT-L/336 | Apache 2.0 | PyTorch |
| Phi-3-vision-mini | 4.2B | 128K | CLIP | MIT | PyTorch |

La comparativa se basa en características arquitectónicas y de licencia, no en rendimiento medido, ya que no se dispone de datos de benchmarks para este modelo. La principal diferencia frente a las alternativas es la portabilidad a Keras 3 y el menor tamaño, que lo hace más ligero para entornos con recursos limitados.

## Limitaciones y advertencias

- El checkpoint base no está entrenado para diálogo; requiere fine-tuning con datos conversacionales para producir respuestas coherentes en formato chat.
- No se han publicado datos sobre sesgos o alucinaciones específicos de esta conversión; el modelo hereda las limitaciones del DeepSeek-VL original, que puede generar descripciones inexactas de imágenes complejas o con objetos poco frecuentes.
- La longitud de contexto no está documentada en la ficha; se recomienda verificar el límite real antes de usarlo en aplicaciones con entradas largas.
- Los idiomas soportados no están especificados; el modelo original fue entrenado principalmente con datos en inglés y chino, por lo que el rendimiento en otros idiomas puede ser limitado.
- La licencia DeepSeek permite uso comercial, pero es necesario revisar los términos completos en el repositorio oficial para confirmar restricciones de redistribución o atribución.
- Al ser una conversión de KerasFormers, el soporte de la comunidad es limitado en comparación con el ecosistema PyTorch; los errores de implementación deben reportarse en el repositorio de KerasFormers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kerasformers/deepseek_vl_1.3b_base
- Modelo original: https://huggingface.co/deepseek-ai/deepseek-vl-1.3b-base
- Paper: https://arxiv.org/abs/2403.05525
- Repositorio KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentación de DeepSeek-VL en KerasFormers: https://imvision12.github.io/KerasFormers/deepseek_vl/
- Repositorio oficial DeepSeek-VL: https://github.com/deepseek-ai/DeepSeek-VL
- Colección de variantes: https://huggingface.co/collections/kerasformers/deepseek-vl-6a6ea961fe80d98b7c69b489
