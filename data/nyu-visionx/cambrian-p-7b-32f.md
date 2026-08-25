# nyu-visionx/Cambrian-P-7B-32f

## Resumen

Cambrian-P-7B-32f es un modelo multimodal desarrollado por el laboratorio VISIONx de la Universidad de Nueva York (NYU) dentro de la familia Cambrian-P. Esta variante se especializa en la comprensión espacial y temporal de vídeo, incorporando información de pose de cámara para mejorar el razonamiento sobre relaciones de dirección, conteo de objetos, planificación de rutas y orden de aparición. Combina el modelo de lenguaje Qwen2.5-7B con el codificador visual SigLIP2-SO400m, y añade tokens de cámara por frame junto con una cabeza de pose basada en el enfoque VGGT.

El modelo se ajusta desde Cambrian-S-7B, su contraparte sin información de pose, y logra una precisión media de 73,7 en benchmarks espaciales a escala 7B, superando en un 4,5 % al modelo base. Con aproximadamente 8,25 mil millones de parámetros, se posiciona como un especialista en el razonamiento espacial de vídeo, un área donde los modelos generales de visión-lenguaje suelen fallar. Su relevancia radica en explorar cómo la información de pose puede mejorar la comprensión de la escena en modelos multimodales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal (Qwen2.5-7B + SigLIP2-SO400m + tokens de cámara + cabeza de pose VGGT) |
| Parametros totales | 8.251.062.834 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina un LLM base (Qwen2.5-7B) con un codificador visual (SigLIP2-SO400m). A diferencia de los modelos de visión-lenguaje convencionales, Cambrian-P incorpora tokens de cámara por cada frame del vídeo y una cabeza de pose inspirada en VGGT, que inyecta la posición y orientación de la cámara en la secuencia de tokens. Esta información se fusiona en la entrada del modelo, permitiendo un razonamiento espacial más preciso que si se procesara solo el contenido visual.

El entrenamiento se realiza en dos fases: primero se entrena el modelo base Cambrian-S-7B sin información de pose, y posteriormente se ajusta con la información de pose para obtener Cambrian-P-7B-32f. Los detalles sobre el dataset utilizado, el número de tokens de entrenamiento y las técnicas de optimización (como RLHF o DPO) no se han especificado en la información disponible.

## Capacidades

- Comprensión de vídeo multimodal: procesa secuencias de frames y extrae información semántica y espacial del contenido.
- Razonamiento espacial: entiende la dirección relativa entre objetos, cuenta elementos, planifica rutas y determina el orden de aparición en la escena.
- Grounding de pose: utiliza la información de la cámara (posición y orientación) para mejorar la precisión de las tareas espaciales.
- Generación de texto: responde preguntas sobre el vídeo, describe la escena y puede generar descripciones detalladas del contenido.
- Adaptabilidad a tareas de visión: al ser una base multimodal, puede ser ajustado para tareas específicas de vídeo como seguimiento de objetos o navegación.

## Casos de uso

- Navegación autónoma en robótica: el modelo puede analizar secuencias de vídeo de una cámara móvil y planificar rutas basadas en la posición de la cámara, gracias a su capacidad de razonamiento espacial con pose.
- Análisis de vídeo de vigilancia: permite contar objetos en movimiento, identificar el orden de aparición de los eventos y describir la escena de forma automatizada.
- Asistencia a la conducción: procesa vídeo de cámaras de un vehículo para entender el contexto y ayudar en la toma de decisiones de navegación.
- Interacción con entornos virtuales: el modelo puede comprender la geometría del espacio en un vídeo sintético y responder a preguntas sobre la disposición de los objetos.
- Investigación en multimodalidad: sirve como plataforma para estudiar el impacto de la información de pose en el rendimiento de los modelos de visión-lenguaje.
- Generación de descripciones espaciales: produce textos que describen la posición de objetos, la dirección de movimiento y las rutas posibles en un vídeo.

## Benchmarks y rendimiento

Según la información disponible, Cambrian-P-7B-32f alcanza una precisión media de 73,7 en benchmarks de especialización espacial a escala 7B, lo que representa una mejora del 4,5 % sobre Cambrian-S-7B (su variante sin pose). Los resultados son especialmente fuertes en las categorías de Dirección Relativa, Conteo de Objetos, Plan de Ruta y Orden de Aparición.

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 8,25 mil millones de parámetros en FP32, se requieren aproximadamente 16-20 GB de VRAM para inferencia. Con cuantización de 8 bits, podría reducirse a 8-10 GB, y con 4 bits a unos 6-8 GB (estimación).
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40 GB) o H100 (80 GB) para un rendimiento óptimo.
- En consumer GPU: puede funcionar en una RTX 4090 con cuantización, pero la cabeza de pose y el procesamiento de vídeo pueden requerir optimizaciones adicionales.
- Opciones de despliegue: se puede servir con vLLM o llama.cpp si se convierte a GGUF, aunque la integración de la cabeza de pose puede requerir adaptaciones específicas. No se ha documentado soporte oficial para Ollama o TGI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento espacial | Licencia |
|---|---|---|---|---|
| Cambrian-P-7B-32f | 8.25B | no disponible | 73,7 (media espacial) | no disponible |
| Cambrian-S-7B | 8.25B | no disponible | no disponible (base sin pose) | no disponible |

No se dispone de información sobre otros modelos comparables en la misma categoría (modelos de visión-lenguaje de 7B con razonamiento espacial) en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia de uso, lo que puede limitar el uso comercial sin consulta previa al equipo de NYU.
- Sesgos posibles: al ser un modelo de investigación, puede contener sesgos en los datos de entrenamiento que no se han documentado.
- Riesgo de alucinación: como cualquier LLM, puede generar respuestas incorrectas, especialmente en tareas de razonamiento espacial complejo o con vídeos ambiguos.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, lo que puede afectar al procesamiento de vídeos largos o con muchos frames.
- Dependencia de la calidad de pose: el rendimiento depende de la precisión de la información de pose de la cámara; si es incorrecta, el modelo puede producir resultados erróneos.

## Enlaces

- HuggingFace: https://huggingface.co/nyu-visionx/Cambrian-P-7B-32f
- GitHub del proyecto: https://github.com/cambrian-mllm/cambrian-p
- Sitio web del proyecto: https://cambrian-mllm.github.io/index.html
- Organización VISIONx @ NYU: https://huggingface.co/nyu-visionx
