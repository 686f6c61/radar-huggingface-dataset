# dolphinnlp/qwen3.5-ocr-ft

## Resumen

dolphinnlp/qwen3.5-ocr-ft es un ajuste fino (SFT) del modelo multimodal xiaomi-research/Xiaomi-OCR-0, especializado en tareas de reconocimiento óptico de caracteres (OCR) y conversión de imagen a texto. Lo publica el usuario dolphinnlp y se ha entrenado con TRL 0.22.2 sobre Transformers 5.2.0, utilizando la arquitectura qwen3_5 y pesos en safetensors. El modelo cuenta con 873.438.784 parámetros y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines propios.

El interés de esta ficha radica en que combina la base de un OCR multimodal con un ajuste conversacional orientado a instrucciones, lo que permite plantear consultas en lenguaje natural sobre el contenido de una imagen. Sin embargo, la información pública es muy limitada: la model card no documenta el conjunto de datos de entrenamiento, los hiperparámetros, la longitud de contexto ni resultados de evaluación, y el repositorio ocupa 123,3 GB, un tamaño desproporcionado respecto a los parámetros declarados, probablemente por incluir checkpoints intermedios o artefactos de entrenamiento.

El modelo está etiquetado únicamente para inglés y su caso de uso principal es la extracción de texto y la respuesta a preguntas sobre imágenes. Es relevante ahora porque la demanda de modelos OCR ligeros y desplegables en hardware modesto ha crecido, y un modelo de menos de 1.000 millones de parámetros con licencia permisiva resulta atractivo para entornos con recursos limitados, siempre que se validen sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal image-text-to-text) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican versiones GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura qwen3_5, un transformer multimodal que procesa entradas de imagen y texto para generar respuestas textuales (pipeline image-text-to-text). Parte de xiaomi-research/Xiaomi-OCR-0, un modelo orientado a OCR, y se ha ajustado mediante supervisión fina (SFT) con la librería TRL, apoyándose en Unsloth para el entrenamiento eficiente. Las versiones de framework declaradas son TRL 0.22.2, Transformers 5.2.0, PyTorch 2.8.0, Datasets 4.8.5 y Tokenizers 0.22.2.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni innovaciones técnicas específicas como decodificación especulativa o atención lineal. La model card se limita a indicar que se trata de un ajuste con SFT y no incluye hiperparámetros de entrenamiento ni curvas de pérdida.

## Capacidades

- Generación de texto a partir de imágenes (image-text-to-text), orientada a tareas de OCR y extracción de contenido.
- Respuesta a preguntas en lenguaje natural sobre el contenido de una imagen, incluyendo el ejemplo de la model card sobre una pregunta hipotética.
- Conversación multi-turno en formato de roles (user/assistant), según el ejemplo de uso con pipeline.
- Capacidades multilingües limitadas: solo se declara inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documentan modos especiales como thinking mode, audio o visión más allá del OCR.

## Casos de uso

- Digitalización de documentos: el modelo puede recibir una imagen de un documento y devolver el texto extraído, útil para archivos, facturas o formularios en inglés.
- Extracción de datos de recibos y tickets: permite convertir imágenes de comprobantes en texto estructurado para su posterior procesamiento en sistemas de contabilidad.
- Accesibilidad: descripción y lectura de texto presente en imágenes para usuarios con discapacidad visual, integrado en aplicaciones de lectura de pantalla.
- Respuesta a preguntas sobre capturas de pantalla: un usuario puede preguntar por el contenido de una imagen y obtener una respuesta en lenguaje natural, útil en herramientas de soporte.
- Procesamiento por lotes de imágenes escaneadas: al ser un modelo de menos de 1.000 millones de parámetros, puede desplegarse en GPUs de consumo para digitalizar lotes de imágenes sin depender de servicios en la nube.
- Prototipado rápido de asistentes visuales: gracias a su licencia Apache 2.0 y su integración con Transformers, sirve para experimentar con pipelines de imagen a texto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 873 millones de parámetros, en FP16 se estiman aproximadamente 1,7 GB solo para los pesos, más el overhead de activaciones y del codificador visual, por lo que se recomienda al menos 4-6 GB de VRAM en FP16.
- En cuantización de 8 bits, la VRAM podría reducirse a unos 2-3 GB, aunque no se publican versiones cuantizadas.
- GPU recomendadas: no se especifican; por tamaño, cabría en RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter como A100 o H100, aunque estas últimas serían sobredimensionadas.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 6 GB o más de VRAM en FP16.
- Opciones de despliegue: Transformers (pipeline), y potencialmente vLLM o TGI si se confirma compatibilidad con la arquitectura qwen3_5; no se documentan versiones GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dolphinnlp/qwen3.5-ocr-ft | 873 M | no disponible | Apache 2.0 | Hugging Face |
| xiaomi-research/Xiaomi-OCR-0 (base) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas OCR multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, por lo que se desconocen los sesgos potenciales del modelo.
- Riesgo de alucinación inherente a los modelos generativos, especialmente al responder preguntas abiertas sobre imágenes.
- El modelo solo declara soporte de inglés; su rendimiento en castellano u otros idiomas no está verificado.
- No se publica la longitud de contexto, lo que impide planificar su uso en documentos largos o conversaciones extensas.
- El repositorio ocupa 123,3 GB, un tamaño muy superior al esperado para 873 millones de parámetros, lo que puede indicar la presencia de checkpoints intermedios o artefactos que conviene revisar antes de descargar.
- Aunque la licencia es Apache 2.0, la model card incluye un campo `licence: license` ambiguo; conviene verificar los términos en el repositorio.
- No se documentan evaluaciones de calidad, por lo que no se recomienda su uso en producción sin una validación previa sobre el dominio objetivo.
- El ejemplo de la model card emplea `pipeline("text-generation")` con una pregunta genérica, lo que no demuestra el comportamiento real en tareas de OCR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dolphinnlp/qwen3.5-ocr-ft
- Modelo base: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- Repositorio TRL: https://github.com/huggingface/trl
