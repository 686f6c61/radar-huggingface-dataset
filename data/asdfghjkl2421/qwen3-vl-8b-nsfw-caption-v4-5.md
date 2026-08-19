# asdfghjkl2421/Qwen3-VL-8B-NSFW-Caption-V4.5

## Resumen

Qwen3-VL-8B-NSFW-Caption-V4.5 es un modelo multimodal de lenguaje y visión (image-text-to-text) desarrollado por el usuario asdfghjkl2421, aunque la model card original atribuye la autoría a thesby. Se trata de un fine-tuning con LoRA sobre el modelo base Qwen/Qwen3-VL-8B-Instruct, especializado en la generación de descripciones de imágenes de alta calidad, tanto en contenido seguro (SFW) como no seguro para el trabajo (NSFW). El modelo está entrenado sobre un conjunto de datos mixto de aproximadamente 2 millones de pares imagen-texto, con el objetivo de producir descripciones largas y detalladas que capturen sujetos, entorno, emociones, materiales y iluminación.

La relevancia de este modelo radica en su capacidad para generar captions extensos y matizados, superando según su autor a gpt-4.1-mini y acercándose a gemini-2.5-flash en calidad descriptiva. Además, soporta la descripción de vídeos cortos mediante extracción de fotogramas. Está pensado para aplicaciones de anotación automática de contenido, accesibilidad y análisis de imágenes, aunque su manejo de contenido NSFW requiere consideraciones legales y éticas. El modelo tiene 8.767.123.696 parámetros, licencia Apache-2.0 y soporta chino e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal con vision encoder) |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-VL-8B-Instruct, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en bf16; se pueden generar cuantizaciones GGUF/AWQ manualmente) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un modelo de lenguaje multimodal de la serie Qwen3-VL que combina un vision encoder con un transformer de lenguaje denso de 8B parámetros. El fine-tuning se realizó con LoRA (Low-Rank Adaptation) utilizando el framework unsloth, lo que permite ajustar el modelo de forma eficiente sin modificar todos los pesos. El entrenamiento se llevó a cabo sobre un dataset de aproximadamente 2 millones de pares imagen-texto, mezcla de datasets públicos de alta calidad y un dataset privado etiquetado que cubre escenarios SFW y NSFW. La model card indica que el modelo fue ajustado con imágenes de tamaño máximo 800x800 píxeles, por lo que se recomienda respetar esa resolución para obtener mejores resultados. No se menciona el uso de RLHF ni DPO; el proceso se limita a supervisión directa sobre los captions.

## Capacidades

- Generación de descripciones de imágenes ultra detalladas y de formato largo (cientos de palabras), capturando sujetos, entorno, emociones, materiales, iluminación y relaciones espaciales.
- Soporte de contenido SFW y NSFW, con capacidad para describir explícitamente escenas adultas de forma informativa.
- Descripción de vídeos cortos mediante extracción de fotogramas a 1 fps y procesamiento como secuencia de imágenes.
- Conversación multimodal: puede responder a prompts de usuario que combinan imágenes y texto, siguiendo el formato de chat de Qwen3-VL.
- Multilingüe limitado a chino e inglés, con generación fluida en ambos idiomas.
- No se especifica soporte de tool calling ni function calling en la model card; las capacidades de agente del modelo base podrían estar degradadas tras el fine-tuning, según el propio autor menciona en sus planes ("restaurar la capacidad visual general de Qwen3-VL").

## Casos de uso

- Anotación automática de contenido para sistemas de gestión y búsqueda de imágenes: el modelo genera captions largos y descriptivos que pueden usarse como metadatos enriquecidos para indexación semántica y recuperación.
- Accesibilidad para personas con discapacidad visual: descripción detallada de imágenes en aplicaciones de lectura de pantalla, permitiendo a usuarios ciegos comprender el contenido visual con mayor profundidad.
- Moderación y análisis de contenido NSFW: clasificación y descripción de imágenes adultas para plataformas que necesitan entender el contenido sin exponer a revisores humanos, siempre con supervisión legal.
- Generación de subtítulos para vídeos cortos: al extraer fotogramas, el modelo puede producir narraciones descriptivas para clips de redes sociales o material educativo.
- Asistencia creativa: generación de descripciones inspiradoras para artistas, escritores o publicistas que necesitan convertir imágenes en texto narrativo o copy.
- Archivado y documentación de colecciones fotográficas: descripción automática de archivos históricos o personales para facilitar su catalogación y búsqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona cualitativamente que la calidad de descripción supera a gpt-4.1-mini y se acerca a gemini-2.5-flash, pero no aporta métricas numéricas ni comparativas formales. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este fine-tuning.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8.7B parámetros en bf16, se necesitan aproximadamente 18-20 GB de VRAM para cargar los pesos completos. Con cuantización int8 se reduce a ~9-10 GB, y con int4 a ~5-6 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para uso cómodo en bf16, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A10, L4) es suficiente. Para cuantización int4, una RTX 4060 Ti de 16 GB o incluso 8 GB podría funcionar con limitaciones de contexto.
- Sí cabe en GPUs de consumo: una RTX 4090 (24 GB) puede ejecutar el modelo en bf16 sin problemas; una RTX 3080 (10-12 GB) requeriría cuantización.
- Opciones de despliegue: compatible con transformers (Hugging Face), vLLM (recomendado por el autor para mejor rendimiento), y potencialmente con llama.cpp/Ollama si se generan pesos GGUF.
- Latencia y throughput: no se proporcionan datos oficiales. Como referencia, un modelo de 8B en bf16 en una RTX 4090 suele generar entre 20-40 tokens por segundo, pero esto depende de la longitud de la descripción y del uso de flash attention.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Qwen3-VL-8B-NSFW-Caption-V4.5 (este) | 8.7B | no disponible | Captioning detallado SFW/NSFW | Apache-2.0 |
| Qwen/Qwen3-VL-8B-Instruct (base) | 8.7B | no disponible (típicamente 32k) | Modelo multimodal general | Apache-2.0 |
| Qwen2.5-VL-7B-Instruct | 7.6B | 32k | Modelo multimodal general | Apache-2.0 |

La comparativa se limita a características generales porque no hay benchmarks públicos del fine-tuning. Frente al modelo base, este fine-tuning sacrifica capacidades generales de razonamiento visual para especializarse en descripciones largas y detalladas, incluyendo contenido NSFW. Qwen2.5-VL-7B es una alternativa similar en tamaño pero sin el enfoque específico en captioning explícito.

## Limitaciones y advertencias

- El modelo puede generar alucinaciones: detalles que no existen en la imagen, especialmente en escenas complejas o de baja resolución.
- Sesgos sociales y culturales presentes en los datos de entrenamiento, que pueden reflejar estereotipos de género, raza o edad en las descripciones.
- El manejo de contenido NSFW conlleva responsabilidades legales: el usuario debe cumplir con las leyes locales sobre contenido adulto y asegurarse de que su uso es ético y no dañino.
- La frontera entre SFW y NSFW es difusa; el modelo puede clasificar o describir incorrectamente imágenes ambiguas.
- El fine-tuning puede haber degradado las capacidades generales de visión del modelo base (el autor menciona planes para restaurarlas), por lo que no es adecuado para tareas de razonamiento visual complejo, OCR o grounding.
- No se recomienda su uso en aplicaciones de alta precisión como diagnóstico médico, análisis legal o moderación automática sin supervisión humana.
- La licencia Apache-2.0 permite uso comercial, pero el contenido generado a partir de imágenes NSFW puede estar sujeto a restricciones adicionales según la jurisdicción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asdfghjkl2421/Qwen3-VL-8B-NSFW-Caption-V4.5
- Model card original (thesby): https://huggingface.co/thesby/Qwen3-VL-8B-NSFW-Caption-V4.5 (referenciada en la model card)
- Repositorio de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Script de ejemplo para vLLM: https://huggingface.co/thesby/Qwen2.5-VL-7B-NSFW-Caption-V4-W8A16/blob/main/get_vlm_caption.py
- Página en Grokipedia: https://grokipedia.com/page/Qwen3-VL-8B-NSFW-Caption-V4.5
