# google/paligemma-3b-pt-224

## Resumen

PaliGemma 3B PT 224 es un modelo multimodal de visión-lenguaje desarrollado por Google, publicado en mayo de 2024. Forma parte de la familia PaliGemma, que combina un codificador de visión con un modelo de lenguaje de la serie Gemma. Este modelo concreto, identificado como `google/paligemma-3b-pt-224`, es la versión pre-entrenada (PT) que procesa imágenes de 224x224 píxeles y genera texto a partir de ellas. Está diseñado para tareas de comprensión imagen-texto, como respuesta a preguntas visuales, descripción de imágenes, OCR y razonamiento multimodal.

El modelo tiene aproximadamente 2.900 millones de parámetros y se distribuye bajo la licencia Gemma, con acceso restringido en HuggingFace (es necesario aceptar las condiciones de uso). Su relevancia radica en que ofrece capacidades multimodales en un tamaño relativamente compacto, lo que permite su ejecución en hardware de consumo moderado, y está integrado en el ecosistema de Transformers de HuggingFace, facilitando su uso en pipelines de inferencia y fine-tuning.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model basado en la familia Gemma (detalles específicos no disponibles) |
| Parametros totales | 2.923.466.480 (2,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (procesa imágenes de 224x224 y secuencias de texto de 128 tokens según documentación externa) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Gemma (acceso restringido, requiere aceptación de términos) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información proporcionada. Se sabe que PaliGemma combina un codificador de visión con un modelo de lenguaje de la familia Gemma, siguiendo el enfoque general de los modelos PaLI. Los tags de arXiv asociados (2310.09199, 2403.08295, entre otros) sugieren el uso de componentes como SigLIP para la codificación visual y Gemma como base de lenguaje, pero no se confirma oficialmente en la ficha.

Los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información recopilada. El modelo se publica como versión pre-entrenada (PT), lo que indica que no ha pasado por un ajuste fino con instrucciones específicas, aunque existe una variante con ajuste por instrucciones dentro de la misma familia.

## Capacidades

- Generación de texto a partir de imágenes: el modelo acepta una imagen y un prompt textual, y produce una respuesta textual.
- Respuesta a preguntas visuales (VQA): puede responder preguntas sobre el contenido de una imagen.
- Descripción de imágenes: genera descripciones en lenguaje natural de escenas visuales.
- Reconocimiento óptico de caracteres (OCR): puede extraer texto presente en imágenes.
- Razonamiento multimodal básico: combina información visual y textual para tareas de comprensión.
- Soporte de tool calling y agentes: no disponible (no se menciona en la información).
- Capacidades multilingües: no disponible (los idiomas soportados no se especifican).

## Casos de uso

- Descripción automática de imágenes para accesibilidad: el modelo puede generar descripciones textuales de fotografías o ilustraciones, útiles para lectores de pantalla o sistemas de asistencia a personas con discapacidad visual. Su tamaño compacto permite integrarlo en aplicaciones cliente.
- Moderación de contenido visual: dado un conjunto de imágenes, el modelo puede clasificar o describir su contenido para filtrar material inapropiado en plataformas sociales, aunque se requeriría un ajuste fino previo.
- Extracción de texto de documentos escaneados: gracias a su capacidad de OCR, puede digitalizar facturas, recibos o cartas, convirtiendo la información visual en texto estructurado para su procesamiento posterior.
- Asistente de compras por imagen: un usuario sube una foto de un producto y el modelo identifica características o sugiere descripciones, integrándose en aplicaciones de comercio electrónico.
- Análisis de imágenes médicas básicas: aunque no es un modelo especializado, puede describir radiografías o imágenes de laboratorio para ayudar en la documentación clínica, siempre con supervisión humana.
- Generación de subtítulos para vídeos o fotos: el modelo puede producir pies de foto o subtítulos descriptivos para contenido multimedia, automatizando tareas de catalogación en bibliotecas de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo concreto.

## Requisitos de hardware

- VRAM estimada: con 2,9B parámetros, en precisión fp16 se necesitan aproximadamente 6 GB de VRAM; en int8 alrededor de 3 GB; en int4 cerca de 1,5 GB. Estas cifras son estimaciones basadas en el tamaño de parámetros, no en mediciones oficiales.
- GPU recomendadas: una GPU consumer como la RTX 3060 (12 GB) o superior es suficiente para inferencia en fp16. Para cuantización int4, una RTX 2060 (6 GB) podría ser suficiente.
- Opciones de despliegue: al ser compatible con Transformers, puede ejecutarse con bibliotecas como vLLM, TGI o directamente con el pipeline de HuggingFace. También es posible usar llama.cpp si se convierte a GGUF, aunque no se confirma soporte oficial.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información recopilada. Existen otras variantes de PaliGemma (por ejemplo, `paligemma-3b-mix-224` o `paligemma-3b-224`), pero no se proporcionan métricas de rendimiento para establecer una comparación objetiva. Tampoco se dispone de información sobre modelos alternativos como LLaVA o BLIP en este contexto.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar las condiciones de licencia Gemma en HuggingFace antes de su descarga, lo que puede limitar su uso en entornos automatizados.
- Licencia Gemma: aunque permite uso comercial, impone restricciones específicas (por ejemplo, no usar para fines militares o de vigilancia) que deben revisarse antes del despliegue en producción.
- Resolución de imagen limitada: el modelo está diseñado para imágenes de 224x224 píxeles, lo que puede perder detalles en imágenes de alta resolución o con texto pequeño.
- Longitud de contexto de texto reducida: según documentación externa, las secuencias de texto se limitan a 128 tokens, lo que restringe prompts largos o respuestas extensas.
- Sesgos y alucinaciones: al ser un modelo pre-entrenado sin ajuste por instrucciones, puede generar descripciones inexactas o inventar detalles no presentes en la imagen. No se han publicado evaluaciones específicas de sesgos.
- Idiomas no especificados: no se conoce qué idiomas soporta de forma fiable, lo que dificulta su uso en aplicaciones multilingües sin pruebas previas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/google/paligemma-3b-pt-224
- Documentación de Google AI para PaliGemma: https://ai.google.dev/gemma/docs/paligemma
- Variante Keras del modelo: https://huggingface.co/google/paligemma-3b-pt-224-keras
- Página de análisis externo (aimodels.fyi): https://www.aimodels.fyi/models/huggingFace/paligemma-3b-pt-224-google
