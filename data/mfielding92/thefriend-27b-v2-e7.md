# mfielding92/thefriend-27b-v2-e7

## Resumen

TheFriend-27B-v2-e7 es un modelo de lenguaje multimodal (image-text-to-text) desarrollado por mfielding92, obtenido mediante fine-tuning del modelo base unsloth/Qwen3.8-27B-unsloth-bnb-4bit. El modelo pertenece a la familia Qwen3.5 y ha sido entrenado con la librería Unsloth y la biblioteca TRL de Hugging Face, lo que permitió un entrenamiento aproximadamente dos veces más rápido que los métodos convencionales.

Con 27.781 millones de parámetros, este modelo está diseñado para tareas conversacionales y de comprensión de imágenes, combinando capacidades de procesamiento de texto e imágenes en una única arquitectura. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, aunque el modelo está entrenado principalmente en inglés. La relevancia actual de este modelo radica en su naturaleza multimodal y su tamaño intermedio, que lo sitúa en un punto equilibrado entre capacidad y requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base usa bnb-4bit) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, una evolución de la familia Qwen que incorpora capacidades multimodales para procesar simultáneamente texto e imágenes. El fine-tuning se realizó sobre el checkpoint unsloth/Qwen3.8-27B-unsloth-bnb-4bit, que ya incluía cuantización de 4 bits mediante bitsandbytes. El entrenamiento se llevó a cabo utilizando la librería Unsloth, optimizada para acelerar el fine-tuning, junto con la biblioteca TRL de Hugging Face para el entrenamiento con refuerzo.

No se dispone de información detallada sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. El modelo está etiquetado como "conversational" y "image-text-to-text", lo que sugiere que fue entrenado para tareas de diálogo multimodal.

## Capacidades

- Generación de texto conversacional con soporte de contexto multimodal (imagen y texto).
- Comprensión de imágenes para tareas de descripción, análisis y respuesta a preguntas visuales.
- Procesamiento de lenguaje natural en inglés.
- Capacidad de mantener conversaciones multi-turno.
- Integración con pipelines de text-generation-inference (TGI) para despliegue en producción.
- Compatible con el ecosistema transformers de Hugging Face.

## Casos de uso

- Asistencia visual para personas con discapacidad: el modelo puede describir imágenes del entorno en tiempo real, ayudando a usuarios con problemas de visión a comprender su entorno mediante descripciones detalladas generadas a partir de fotografías.
- Moderación de contenido visual: puede analizar imágenes y generar descripciones textuales que permitan a plataformas detectar contenido inapropiado o clasificar imágenes automáticamente según su contenido.
- Atención al cliente multimodal: integrado en sistemas de soporte, puede recibir capturas de pantalla o fotos de productos enviadas por usuarios y generar respuestas contextualizadas sobre problemas técnicos o dudas de producto.
- Generación de informes médicos preliminares: en entornos controlados, puede analizar imágenes médicas (radiografías, ecografías) y generar descripciones preliminares que ayuden a los profesionales sanitarios a priorizar casos.
- Automatización de documentación técnica: puede procesar diagramas, esquemas o capturas de interfaz y generar documentación textual descriptiva para manuales o guías de usuario.
- Análisis de redes sociales: puede procesar imágenes publicadas en redes sociales y generar resúmenes textuales de tendencias visuales, memes o contenido viral para equipos de marketing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 27B parámetros, se estima un consumo de aproximadamente 14 GB en cuantización de 4 bits, 28 GB en 8 bits y 54 GB en precisión completa (16 bits). Los valores exactos dependen de la cuantización final utilizada.
- GPU recomendadas: para inferencia en 4 bits, una GPU con 16 GB de VRAM (como RTX 4080 o RTX 4090) sería suficiente. Para 8 bits, se recomienda una GPU con 32 GB o más (A100 40GB, A6000). Para precisión completa, se necesitarían GPUs de 64 GB o más (A100 80GB, H100).
- El modelo cabe en GPUs de consumo si se utiliza cuantización de 4 bits, siendo la RTX 4090 (24 GB) una opción viable.
- Opciones de despliegue: compatible con vLLM, text-generation-inference (TGI), llama.cpp y Ollama, siempre que se utilicen los formatos de pesos adecuados (safetensors para transformers, GGUF para llama.cpp).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con modelos similares. El modelo comparte arquitectura con la familia Qwen3.5, pero no se han publicado resultados de benchmarks ni comparaciones con alternativas como Llama 3.1 27B, Gemma 2 27B o Mistral Large 2.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés, lo que limita su uso en otros idiomas.
- No se dispone de información sobre sesgos potenciales, pero al ser un fine-tuning de un modelo base, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de descripción de imágenes donde puede generar detalles inexistentes.
- La longitud de contexto no está documentada, lo que puede afectar a tareas que requieran ventanas de contexto largas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.
- No se ha publicado información sobre el dataset de entrenamiento, lo que dificulta evaluar su calidad y posibles sesgos.
- Al ser un modelo relativamente reciente (creado en agosto de 2026), no hay evidencia de su comportamiento en producción a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mfielding92/thefriend-27b-v2-e7
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit
- Librería Unsloth: https://github.com/unslothai/unsloth
- Repositorio del autor: https://huggingface.co/mfielding92
