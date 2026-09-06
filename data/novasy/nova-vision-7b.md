# Novasy/nova-vision-7b

## Resumen

Novasy/nova-vision-7b es un modelo multimodal de visión y lenguaje (image-text-to-text) desarrollado por Novasy a partir de un finetune del modelo base unsloth/qwen2.5-vl-7b-instruct-unsloth-bnb-4bit. Se trata de una adaptación del modelo Qwen2.5-VL de 7B, publicada bajo licencia Apache 2.0 y entrenada con las librerías Unsloth y TRL de HuggingFace, lo que permitió acelerar el proceso de entrenamiento. El modelo está diseñado para tareas de conversación multimodal, es decir, acepta imágenes y texto como entrada y genera respuestas de texto. Con 8.292.166.656 parámetros totales, ofrece un tamaño intermedio que permite su despliegue en entornos con recursos limitados. No se dispone de información sobre la longitud de contexto ni sobre el dataset de entrenamiento utilizado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL) |
| Parametros totales | 8.292.166.656 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (según metadata) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-VL, un transformer multimodal que combina un codificador de visión con un modelo de lenguaje, lo que permite procesar entradas de imagen y texto de forma conjunta. Según la información disponible, Novasy/nova-vision-7b es un finetune del modelo unsloth/qwen2.5-vl-7b-instruct-unsloth-bnb-4bit, realizado con la librería Unsloth y la biblioteca TRL de HuggingFace. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. El único dato técnico adicional es que el entrenamiento se completó un 2x más rápido gracias a Unsloth, aunque no se especifica la configuración exacta de hardware ni los hiperparámetros empleados.

## Capacidades

- Generación de texto multimodal: el modelo puede recibir imágenes y texto como entrada y producir respuestas de texto, lo que lo habilita para tareas de descripción de imágenes, respuesta a preguntas visuales y diálogo multimodal.
- Conversación instruct: al estar basado en una variante instruct de Qwen2.5-VL, está preparado para mantener conversaciones siguiendo instrucciones del usuario.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la metadata indica únicamente inglés.
- Capacidades especiales (thinking mode, visión, audio): el modelo es de tipo image-text-to-text, por lo que ofrece capacidades de visión, pero no se documentan modos especiales de razonamiento ni soporte de audio.

## Casos de uso

- Análisis de imágenes en entornos empresariales: el modelo puede procesar fotografías o capturas y responder preguntas sobre su contenido, lo que permite automatizar tareas de inspección visual, siempre que se valide su precisión en el dominio concreto.
- Asistencia en accesibilidad: integración en aplicaciones que describen imágenes a personas con discapacidad visual, generando texto descriptivo a partir de fotografías en tiempo real.
- Extracción de información de documentos: lectura de texto presente en imágenes (OCR) y extracción de campos estructurados, útil para digitalizar facturas, formularios o recibos, aunque la precisión no está documentada.
- Moderación de contenido visual: clasificación de imágenes según políticas de contenido, ayudando a filtrar material inapropiado en plataformas de usuario.
- Chatbots con soporte visual: despliegue en sistemas de atención al cliente donde el usuario envía capturas de pantalla o fotos y el modelo responde con instrucciones o soluciones basadas en la imagen.
- Generación de descripciones para catálogos de productos: a partir de imágenes de productos, el modelo puede generar descripciones textuales para fichas de e-commerce, reduciendo el trabajo manual de catalogación.
- Educación y formación: apoyo en plataformas de aprendizaje donde se explican diagramas, gráficos o figuras, permitiendo a los estudiantes interactuar con material visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio es de 16.6 GB, lo que sugiere que los pesos están almacenados en precisión FP16 o BF16. Para cargar el modelo completo en esa precisión se requieren aproximadamente 16.6 GB de VRAM, más el overhead de activaciones y buffers, por lo que se recomienda una GPU con al menos 20-24 GB de VRAM.
- GPU recomendadas: RTX 3090, RTX 4090, A10G, A100 40GB o superiores para ejecutar el modelo en FP16/BF16.
- Compatibilidad con GPU de consumo: el modelo no cabe en GPU de consumo con 8-12 GB de VRAM sin cuantización. No se publican versiones cuantizadas en el repositorio, por lo que para ejecutarlo en GPU de consumo sería necesario cuantizarlo manualmente.
- Opciones de despliegue: el modelo es compatible con la librería transformers y con text-generation-inference, según los tags de HuggingFace. También puede ejecutarse con vLLM o llama.cpp, aunque no se especifican configuraciones oficiales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones comparables de otros modelos que permitan establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Idioma: según la metadata, el modelo solo soporta inglés, lo que limita su uso en aplicaciones multilingües.
- Sin benchmarks publicados: no se puede evaluar su rendimiento en tareas estándar de visión-lenguaje, por lo que cualquier uso en producción debe ir precedido de una validación propia.
- Dataset de entrenamiento desconocido: al no documentarse la composición de los datos de finetune, el modelo puede heredar sesgos no identificados del proceso de entrenamiento.
- Riesgo de alucinación: como cualquier modelo de lenguaje multimodal, puede generar descripciones incorrectas o inventar detalles sobre imágenes, especialmente en escenas complejas o con texto pequeño.
- Licencia Apache 2.0: permite uso comercial, pero requiere incluir la atribución correspondiente y el aviso de licencia en las distribuciones derivadas.
- Sin garantías de soporte: al ser un modelo subido por un autor particular y sin documentación técnica detallada, no existe garantía de mantenimiento ni de soporte para actualizaciones.

## Enlaces

- HuggingFace: https://huggingface.co/Novasy/nova-vision-7b
- Modelo base: https://huggingface.co/unsloth/qwen2.5-vl-7b-instruct-unsloth-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
