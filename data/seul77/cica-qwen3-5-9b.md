# seul77/CICA-Qwen3.5-9B

## Resumen
CICA-Qwen3.5-9B es un ajuste fino del modelo multimodal Qwen3.5-9B desarrollado por el autor seul77 (Chanseul Cho y colaboradores), entrenado con la técnica de asignación de crédito entre imágenes (cross-image credit assignment, CICA) descrita en el artículo ASTERISM. El problema que aborda es concreto: los modelos de lenguaje multimodal tienden a responder preguntas con múltiples imágenes apoyándose en una sola de ellas, ignorando el resto. CICA redirige la señal de recompensa hacia los tokens que realmente requieren combinar información de varias imágenes.

El modelo conserva la arquitectura y el tamaño del base (9.653.104.368 parámetros según los pesos en safetensors, aproximadamente 9,65 mil millones) y el pipeline image-text-to-text con soporte multi-imagen. La innovación no añade parámetros ni rollouts adicionales: modifica únicamente la asignación de crédito dentro del esquema de RLVR (reinforcement learning with verifiable rewards), manteniendo datos, recompensa y objetivo de RL.

Es relevante porque demuestra una mejora medible sobre el base en la evaluación ASTERISM (70,6 frente a 65,7, media macro sobre siete categorías de tarea) sin coste arquitectónico adicional, y porque se distribuye con licencia Apache 2.0, lo que facilita su uso comercial e investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5-9B; incluye pesos de multi-token prediction (MTP) del base, no usados en entrenamiento ni evaluación |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers; repo de 19,3 GB) |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.5-9B, un transformer multimodal que procesa entradas de imagen y texto y genera texto. Sobre esa base se aplica CICA, una extensión de RLVR que, para cada token de la respuesta, compara la verosimilitud de la política bajo el conjunto completo de imágenes con la verosimilitud bajo la mejor imagen individual, y desplaza el crédito hacia los tokens que necesitan más de una imagen para resolverse. Según la model card, el método no introduce parámetros nuevos, ni rollouts adicionales, ni pasadas hacia atrás extra: reutiliza los datos, la recompensa y el objetivo de RL existentes.

El entrenamiento se realizó en modo thinking sobre el dataset ASTERISM-Train (seul77/ASTERISM-Train), siguiendo los apéndices F y G del artículo. Los archivos de configuración, tokenizador y procesador son los de Qwen3.5-9B, igual que los pesos MTP, que no se emplean en el entrenamiento ni en la evaluación. La evaluación se ejecuta en modo thinking con temperatura 0,6, top-p 0,95 y top-k 20, y requiere transformers 5.5 o superior.

## Capacidades
- Generación de texto y razonamiento multimodal en modo thinking (enable_thinking=True en la plantilla de chat).
- Comprensión de múltiples imágenes en una misma conversación (multi-image) y razonamiento que combina información entre ellas.
- Respuesta a preguntas de comparación, correspondencia y referencia cruzada entre imágenes (por ejemplo, identificar el mismo objeto desde ángulos distintos).
- Conversación multi-turno con contenido mixto de imagen y texto.
- Entrenamiento con RL verificable (RLVR) orientado a tareas con recompensa comprobable.
- Soporte de decodificación con parámetros de muestreo configurables (temperatura, top-p, top-k) y tokens de parada personalizados.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso
- Verificación visual multi-imagen en control de calidad industrial: comparar fotografías de una misma pieza desde varios ángulos para detectar discrepancias, aprovechando la asignación de crédito entre imágenes que entrena el modelo.
- Asistencia en diagnóstico por imagen comparativa: contrastar dos o más estudios o capturas para señalar diferencias relevantes, con el modo thinking activado para razonamiento explícito.
- Moderación de contenido con contexto visual múltiple: evaluar varias capturas de una publicación o conversación y determinar si el conjunto es coherente o infringe políticas.
- E-commerce y catalogación: emparejar imágenes de producto tomadas desde distintos lados con la ficha correcta, una tarea que exige integrar varias vistas.
- Documentación técnica y soporte: responder consultas del usuario adjuntando capturas de pantalla sucesivas de un flujo de error, correlacionando la información entre ellas.
- Investigación en evaluación multimodal: usar el modelo y el código de ASTERISM como referencia para medir si un MLLM atiende realmente a todas las imágenes de una entrada.
- Robótica o agentes visuales experimentales: razonar sobre secuencias de imágenes de sensores para decidir el siguiente paso, siempre que se valide el comportamiento en el dominio concreto.

## Benchmarks y rendimiento

| Modelo | ASTERISM (media macro, 7 categorías) |
|---|---:|
| Qwen3.5-9B | 65,7 |
| CICA-Qwen3.5-9B | 70,6 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar para este modelo.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con 9,65 mil millones de parámetros en safetensors (aproximadamente 19,3 GB en precisión de 16 bits), se requiere del orden de 20 GB o más de VRAM en fp16/bf16, y menos con cuantización de 8 o 4 bits (no se publican variantes cuantizadas).
- GPU recomendadas: no especificadas por el autor; por tamaño, encajan GPU de centro de datos como A100 (40/80 GB) o H100, y en el extremo consumer una RTX 4090 (24 GB) en precisión reducida.
- ¿Cabe en GPU consumer? Probablemente en tarjetas de 24 GB con bf16 justo o mediante cuantización; no confirmado en la información disponible.
- Opciones de despliegue: transformers (AutoModelForImageTextToText) con accelerate, según el ejemplo oficial; vLLM, llama.cpp, Ollama o TGI no están confirmados para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ASTERISM | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CICA-Qwen3.5-9B | 9,65 B | no disponible | 70,6 | Apache 2.0 | Hugging Face (seul77) |
| Qwen3.5-9B (base) | ~9,65 B | no disponible | 65,7 | Apache 2.0 | Hugging Face (Qwen) |
| Otros MLLM de ~9 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa disponible se limita al modelo base, del que CICA mejora 4,9 puntos en la media macro de ASTERISM. No se dispone de datos de benchmarks de terceros para establecer comparaciones adicionales.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la información proporcionada; al heredar el base Qwen3.5-9B, arrastra los sesgos de sus datos de entrenamiento.
- Riesgo de alucinación: no evaluado de forma específica; el modo thinking no garantiza la veracidad de las respuestas.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan; el entrenamiento se centra en tareas multi-imagen de ASTERISM-Train, lo que puede reducir el rendimiento fuera de ese dominio.
- Dependencia de versión: requiere transformers 5.5 o superior y pasar `<|im_end|>` como token de parada, ya que la configuración solo declara `<|endoftext|>`.
- Los pesos MTP del base están presentes pero no se usan; no deben asumirse capacidades de decodificación especulativa derivadas de ellos.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B y de los datos ASTERISM-Train.
- Modelo con muy pocas descargas y recién publicado (25 de noviembre de 2026): sin validación comunitaria amplia; para producción conviene evaluarlo en el dominio propio.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/seul77/CICA-Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/seul77/ASTERISM-Train
- Artículo ASTERISM: https://arxiv.org/abs/2611.32316
- Repositorio con código de evaluación y prompts: https://github.com/chanseul01/ASTERISM
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
