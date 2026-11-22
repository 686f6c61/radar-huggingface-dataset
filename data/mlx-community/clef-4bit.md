# mlx-community/clef-4bit

## Resumen
Clef es un modelo de decisión estructurada desarrollado originalmente por Cloudflare y distribuido en este repositorio por mlx-community en formato MLX de 4 bits para Apple Silicon. A diferencia de los modelos de chat convencionales, Clef recibe un estado (texto, JSON, imágenes o vídeo) junto con un esquema de preguntas tipadas y devuelve, en una única pasada forward, una probabilidad para cada opción permitida. Esto lo convierte en una herramienta especializada para clasificación zero-shot, enrutamiento y toma de decisiones auditables, no para generación de texto libre.

El modelo base es Cloudflare/clef, con 27.356.728.560 parámetros totales (aproximadamente 27B) y una arquitectura derivada de la familia Qwen3.5 con una cabeza conjunta de esquema (joint schema head) que procesa las preguntas tipadas. La ventana de contexto efectiva es de 16.384 tokens, y el modelo admite entradas multimodales (texto, JSON, imágenes y vídeo). Esta conversión 4-bit reduce el peso del repositorio a 16,3 GB, lo que permite ejecutarlo en Macs con 32 GB de RAM unificada.

La relevancia de esta ficha radica en que Clef no encaja en el patrón habitual de los LLM: cargarlo con herramientas de generación estándar como `mlx_lm.generate`, `mlx_vlm.generate`, LM Studio u Ollama produce texto sin sentido, porque solo se carga el backbone y no la cabeza de decisión. Es necesario usar el loader incluido `clef_mlx.py`, que ejecuta conjuntamente el backbone y la cabeza de esquema. Está publicado bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5) con cabeza conjunta de esquema (joint schema head) para decisiones estructuradas |
| Parametros totales | 27.356.728.560 (aprox. 27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens (el modelo fue entrenado a 16k; truncado por defecto) |
| Tipos de cuantizacion | 4-bit (esta variante); existen variantes 8-bit y flash 4-bit/8-bit de 9B |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con código custom (`clef_mlx.py`) |

## Arquitectura y entrenamiento
Clef se construye sobre un backbone transformer multimodal de la familia Qwen3.5 (etiqueta `qwen3_5` en los tags) y añade una cabeza de decisión que, dada una lista de preguntas tipadas (tipos como `choice`, `score` y `noul`), calcula una distribución de probabilidad sobre las opciones permitidas en una sola pasada forward. El estado de entrada puede ser texto, JSON, imágenes (PIL) o vídeo (arrays de frames), y las preguntas se definen mediante un esquema JSON con instrucciones y criterios. Esta formulación convierte la tarea de clasificación o enrutamiento en un problema de verosimilitud condicionada, evitando la generación autoregresiva de texto.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card remite a la model card original de Cloudflare/clef para el formato de entrada, los tipos de pregunta y los benchmarks. La innovación técnica destacable es la cabeza conjunta de esquema, que permite evaluar múltiples preguntas tipadas simultáneamente y devolver probabilidades calibradas por opción, además de soportar entradas multimodales en el mismo registro (varias imágenes o varios vídeos, pero no ambos a la vez).

## Capacidades
- Clasificación zero-shot y enrutamiento de estados (texto, JSON) hacia opciones predefinidas con probabilidades por opción.
- Respuesta a preguntas tipadas: `choice` (elección entre criterios), `score` (puntuación ordinal sobre criterios) y `noul` (booleano sí/no).
- Procesamiento multimodal de imágenes (PIL) y vídeo (arrays de frames) junto con texto o JSON en una misma llamada.
- Salida estructurada y auditable: probabilidades por opción en lugar de texto generado, lo que facilita la integración en pipelines deterministas.
- Soporte de servidor local compatible con la API SystemOne/Jev (`POST /v1/systemone`, `GET /health`, `GET /v1/models`).
- Integración con el Decision Index mediante el motor `http` apuntando al servidor local.
- No soporta tool calling ni function calling en el sentido convencional de los LLM; su interfaz es el esquema de preguntas tipadas.
- No es un modelo de chat ni de generación de texto libre; no se documentan capacidades de razonamiento multi-step en formato conversacional.

## Casos de uso
- Enrutamiento de tickets de soporte: dado un texto de incidencia, definir preguntas `choice` para el departamento (facturación, técnico) y `score` para la urgencia, obteniendo probabilidades que pueden alimentar un sistema de asignación automática.
- Triaje de alertas de operaciones: usar preguntas `noul` para determinar si hay una caída de servicio y `score` para la severidad, con salida JSON lista para integrarse en herramientas de guardia.
- Moderación y clasificación de contenido: clasificar textos o imágenes (por ejemplo, recibos o capturas) según criterios definidos en el esquema, con probabilidades por categoría.
- Inspección documental multimodal: adjuntar imágenes de recibos o formularios y preguntar si el total es legible o si los datos son consistentes, combinando OCR implícito del backbone con la cabeza de decisión.
- Análisis de vídeo para control de calidad: pasar arrays de frames y preguntas tipadas para evaluar si un proceso cumple criterios definidos, sin necesidad de generar descripciones textuales.
- Evaluación comparativa de modelos de decisión: usar el servidor local con el Decision Index (`python -m decision_index run --engine http --option base_url=http://127.0.0.1:8000`) para medir la calidad de las decisiones de Clef frente a alternativas.
- Despliegue en estaciones de trabajo Apple Silicon: ejecutar un endpoint local compatible con SystemOne en un Mac con 32 GB de RAM para prototipado y pruebas de integración sin depender de la nube.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla de rendimiento de las variantes MLX medida en un M5 Max con entrada de texto, que se reproduce a continuación como dato de latencia y memoria, no como benchmark de calidad:

| Variante | Base | Descarga | Memoria pico (1k / 4k / 16k tokens) | Latencia (1k / 16k tokens) | RAM mínima |
|---|---|---|---|---|---|
| clef-flash-4bit | 9B | 6,2 GB | 7,0 / 7,2 / 8,6 GB | 0,31 s / 7,0 s | 16 GB |
| clef-flash-8bit | 9B | 10,7 GB | 11,4 / 11,6 / 13,0 GB | 0,34 s / 7,7 s | 24 GB (16 GB para prompts cortos) |
| clef-4bit (este repo) | 27B | 16,3 GB | 17,1 / 17,5 / 19,6 GB | 1,4 s / 26,0 s | 32 GB |
| clef-8bit | 27B | 29,8 GB | 30,5 / 30,8 / 33,0 GB | 1,5 s / 32,0 s | 48 GB |

La model card indica que las variantes de 9B son mucho más rápidas, mientras que las de 27B obtienen mejores puntuaciones en la comprobación de calidad, pero no se proporcionan los números concretos de esa comprobación.

## Requisitos de hardware
- VRAM/RAM unificada estimada para esta variante 4-bit: 17,1 GB con 1k tokens, 17,5 GB con 4k tokens y 19,6 GB con 16k tokens de memoria pico.
- RAM mínima recomendada: 32 GB en Apple Silicon (macOS limita el uso de GPU a aproximadamente el 70-75% de la RAM por defecto, por lo que la RAM mínima es superior al pico).
- GPU recomendadas: Apple Silicon (medido en un M5 Max); no se documentan requisitos para GPU NVIDIA o AMD en esta conversión MLX.
- Cabe en GPU consumer: sí, en Macs con 32 GB o más de memoria unificada; la variante flash de 9B cabe en 16 GB.
- Opciones de despliegue: `clef_mlx.py` (loader propio con modo `predict` y `serve`), servidor local compatible con SystemOne en `http://127.0.0.1:8000`, y el Decision Index con motor `http`. No debe usarse con `mlx_lm.generate`, `mlx_vlm.generate`, LM Studio ni Ollama, que producen texto sin sentido.
- Latencia estimada: 1,4 s con 1k tokens y 26,0 s con 16k tokens en un M5 Max con entrada de texto.
- Throughput: las peticiones se ejecutan de una en una en la GPU; no hay batching.
- Dependencias: `mlx-vlm>=0.7.4,<0.8` y `huggingface_hub`; probado con mlx 0.32.3, mlx-lm 0.32.0 y mlx-vlm 0.7.4; no requiere torch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clef-4bit (este repo) | 27B | 16.384 tokens | Decisión estructurada multimodal con cabeza de esquema | Apache 2.0 | MLX 4-bit para Apple Silicon |
| clef-flash-4bit | 9B | 16.384 tokens (según model card) | Decisión estructurada multimodal | Apache 2.0 | MLX 4-bit, 6,2 GB, 16 GB RAM |
| clef-8bit | 27B | 16.384 tokens (según model card) | Decisión estructurada multimodal | Apache 2.0 | MLX 8-bit, 29,8 GB, 48 GB RAM |
| Cloudflare/clef (base) | 27B | 16.384 tokens | Decisión estructurada multimodal | Apache 2.0 | Pesos originales en Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de calidad frente a modelos de clasificación o decisión alternativos; la comparativa se limita a variantes del mismo modelo y al modelo base.

## Limitaciones y advertencias
- No es un modelo de chat: herramientas de generación de texto (`mlx_lm.generate`, `mlx_vlm.generate`, LM Studio, Ollama) cargan el backbone pero producen salida sin sentido; solo `clef_mlx.py` ejecuta la cabeza de decisión.
- Las entradas largas se truncan por defecto: el estado se recorta para que el prompt completo quepa en 16.384 tokens. Con `truncate=False` en `predict()`/`systemone()` se obtiene un error `clef_mlx.ContextTooLong`; se puede subir `max_length`, pero la cabeza se entrenó a 16k.
- Un registro por llamada: no hay batching y las peticiones se ejecutan secuencialmente.
- No se pueden combinar imágenes y vídeos en un mismo registro; sí varias imágenes o varios vídeos.
- El servidor local no tiene autenticación y escucha en `127.0.0.1` por defecto; debe mantenerse esa vinculación o colocar un proxy propio delante.
- Los vídeos no se soportan sobre HTTP.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; al ser un modelo de decisión con salida probabilística, la calibración de las probabilidades debe validarse en el dominio de uso.
- Idiomas soportados no disponibles; conviene verificar el comportamiento multilingüe antes de usarlo en producción en castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben revisarse las condiciones del modelo base Cloudflare/clef y de los componentes de Qwen3.5 subyacentes.
- La velocidad depende en gran medida del hardware Apple Silicon y del tamaño del prompt; en prompts de 16k la latencia alcanza decenas de segundos.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mlx-community/clef-4bit
- Modelo base: https://huggingface.co/Cloudflare/clef
- Variante flash 4-bit: https://huggingface.co/mlx-community/clef-flash-4bit
- Variante flash 8-bit: https://huggingface.co/mlx-community/clef-flash-8bit
- Variante 8-bit: https://huggingface.co/mlx-community/clef-8bit
- Decision Index: https://github.com/apolinario/decision-index
