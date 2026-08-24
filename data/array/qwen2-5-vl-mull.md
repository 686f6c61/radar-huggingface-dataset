# array/Qwen2.5-VL-Mull

## Resumen

El modelo **array/Qwen2.5-VL-Mull** es un ajuste fino del modelo multimodal Qwen2.5-VL-7B-Instruct que incorpora la técnica **Mull-Tokens** (tokens latentes agnósticos de modalidad), descrita en el artículo *"Mull-Tokens: Modality-Agnostic Latent Thinking"* (arXiv:2512.10941). Desarrollado por el investigador Arijit Ray, este modelo introduce un conjunto de tokens latentes discretos que se pre-entrenan para almacenar información intermedia —tanto visual como textual— durante el proceso de razonamiento, permitiendo que el modelo "piense" de forma comprimida antes de generar la respuesta final.

El problema que resuelve es la mejora del razonamiento espacial en tareas de visión y lenguaje, un área donde los modelos multimodales suelen fallar al razonar explícitamente sobre posiciones, orientaciones y relaciones espaciales. En cuatro benchmarks de razonamiento espacial, Mull-Tokens logran una mejora media de +3% y hasta +16% en subconjuntos con alta carga de razonamiento, comparado con el baseline más fuerte. El modelo tiene aproximadamente 8.300 millones de parámetros y una ventana de contexto de 32.768 tokens, y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (transformer multimodal con vision encoder) |
| Parametros totales | 8.289.335.296 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (configuración recomendada en vLLM) |
| Tipos de cuantizacion | no disponible (la plataforma FriendliAI ofrece FP4, FP8, INT4 e INT8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2.5-VL-7B-Instruct, un transformer multimodal con un codificador de visión y un decodificador de lenguaje. Sobre esta base, se entrena la técnica Mull-Tokens: se añaden tokens latentes discretos (representados como `<|latent_pad|>`) al vocabulario, con embeddings entrenables. Durante el entrenamiento, el modelo aprende a comprimir información de razonamiento —proveniente tanto de la imagen como del texto— en estos tokens latentes, de modo que en inferencia el modelo genera primero un bloque de tokens latentes (por defecto 20) y después la respuesta final. El vocabulario extendido alcanza 151.669 entradas.

El entrenamiento se realiza en dos variantes: la aquí presentada, que usa un *warm-up* multimodal (exposición inicial a datos de imagen y texto), y la variante `Qwen2.5-VL-MullGRPO`, que añade aprendizaje por refuerzo con GRPO. No se han publicado detalles sobre el tamaño o composición del dataset de entrenamiento en la información disponible. El código de entrenamiento y evaluación está disponible en el repositorio GitHub `arijitray1993/mull`, que también sirve como plantilla para entrenar modelos estilo Qwen y evaluarlos con `lmms-eval`.

## Capacidades

- **Razonamiento espacial mejorado**: responde preguntas sobre posiciones relativas, orientaciones y relaciones espaciales en imágenes, con mejoras de hasta +16% en subconjuntos con alta carga de razonamiento.
- **Razonamiento latente comprimido**: genera un bloque de tokens latentes antes de la respuesta, reduciendo drásticamente el número de tokens de salida (8,9 tokens de media frente a 101,2 sin el bloque latente en ítems SAT).
- **Comprensión multimodal**: procesa entradas de imagen y texto, y produce respuestas de texto estructuradas con etiquetas `<answer>`.
- **Soporte de distintos tipos de respuesta**: opción múltiple, numérica, OCR, respuesta libre y regresión, mediante plantillas de prompt configurables.
- **Integración con vLLM**: se sirve con la implementación nativa de Qwen2.5-VL de vLLM, sin necesidad de código personalizado ni `--trust-remote-code`.
- **Personalización del presupuesto latente**: el número de tokens latentes puede ajustarse (incluso a 0 para ablaciones) mediante `chat_template_kwargs`.

## Casos de uso

- **Asistencia visual para navegación**: el modelo puede responder preguntas del tipo "si estoy en el punto X y giro a la izquierda, ¿qué objeto queda a mi derecha?", útil en robótica móvil o sistemas de guiado para personas con discapacidad visual.
- **Evaluación de razonamiento espacial en entornos sintéticos**: investigadores pueden usar el modelo como baseline o como sujeto de prueba en benchmarks de razonamiento espacial, gracias a su capacidad de generar respuestas estructuradas y su compatibilidad con `lmms-eval`.
- **Transcripción OCR en imágenes**: el modelo puede extraer texto de imágenes o vídeos y devolverlo en formato estructurado, útil para digitalización de documentos o subtitulado automático.
- **Sistemas de respuesta a preguntas visuales (VQA)**: integrable en pipelines de atención al cliente donde el usuario envía una foto y el sistema responde con opciones múltiples o respuestas numéricas (por ejemplo, mediciones o conteos).
- **Generación de respuestas con verificación interna**: el prompt fomenta la auto-reflexión y verificación, lo que lo hace adecuado para tareas donde la precisión es crítica, como diagnóstico asistido por imagen o inspección de calidad.
- **Investigación en razonamiento latente**: sirve como plataforma para estudiar cómo los tokens latentes comprimen información multimodal, y para comparar arquitecturas con y sin razonamiento explícito en texto.

## Benchmarks y rendimiento

No se han publicado resultados detallados de benchmarks en la información disponible. La model card indica que, en cuatro benchmarks de razonamiento espacial, Mull-Tokens logran una mejora media de +3% y hasta +16% en subconjuntos con alta carga de razonamiento, comparado con el baseline más fuerte (presumiblemente Qwen2.5-VL-7B-Instruct). No se proporcionan nombres de benchmarks ni cifras absolutas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en `bfloat16`, el modelo ocupa aproximadamente 16,6 GB (tamaño del repositorio), por lo que se necesita una GPU con al menos 24 GB de VRAM para inferencia sin cuantización. Con cuantización a 8 bits, la huella se reduce a ~8,3 GB, y a 4 bits a ~4,2 GB.
- **GPU recomendadas**: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para bf16; GPUs de 12 GB (RTX 3060, RTX 4070) pueden servir con cuantización a 8 bits; GPUs de 8 GB (RTX 3060 Ti, RTX 3070) con cuantización a 4 bits.
- **Opciones de despliegue**: vLLM (soporte nativo, sin código personalizado), transformers (con `flash_attention_2`), y plataformas como FriendliAI que ofrecen cuantización FP4/FP8/INT4/INT8 y batching continuo.
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Razonamiento espacial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| array/Qwen2.5-VL-Mull | 8,3B | 32.768 | Mejora +3% media, +16% en splits difíciles | Apache 2.0 | Hugging Face |
| array/Qwen2.5-VL-MullGRPO | 8,3B | 32.768 | Variante con RL (GRPO), sin datos publicados | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-VL-7B-Instruct | 8,3B | 32.768 | Baseline sin tokens latentes | Apache 2.0 | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos de razonamiento espacial en la información proporcionada.

## Limitaciones y advertencias

- **Dependencia del bloque latente**: si se sirve el modelo con una plantilla de chat estándar de Qwen2.5-VL (sin los tokens `<|latent_pad|>`), el modelo recibe cero tokens latentes y revierte a escribir su razonamiento en texto, degradando el rendimiento y aumentando el número de tokens de salida (101,2 frente a 8,9 en ítems SAT). Es imprescindible verificar que la plantilla activa el bloque latente.
- **Configuración de resolución**: las evaluaciones del paper usan `max_pixels=12845056`, mientras que el `preprocessor_config.json` por defecto usa 401408. Para reproducir los resultados publicados hay que ajustar este parámetro.
- **Sesgos y alucinación**: al ser un ajuste fino de Qwen2.5-VL, hereda los sesgos del modelo base y puede generar respuestas plausibles pero incorrectas, especialmente en tareas de razonamiento espacial ambiguas.
- **Idiomas**: no se ha especificado la cobertura idiomática; se asume que hereda las capacidades multilingües de Qwen2.5-VL, pero no está confirmado.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial sin restricciones adicionales, siempre que se mantenga el aviso de copyright.
- **Tamaño del repositorio**: 16,6 GB en bf16, lo que puede ser un obstáculo para despliegues en entornos con almacenamiento limitado; se recomienda cuantización para producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/array/Qwen2.5-VL-Mull)
- [Paper en arXiv](https://arxiv.org/abs/2512.10941)
- [Página del proyecto](https://arijitray1993.github.io/mulltokens/)
- [Código de entrenamiento y evaluación](https://github.com/arijitray1993/mull)
- [Página en FriendliAI](https://friendli.ai/models/array/Qwen2.5-VL-Mull)
