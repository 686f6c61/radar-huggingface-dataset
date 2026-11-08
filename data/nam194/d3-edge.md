# nam194/d3-edge

## Resumen

d3-edge es un modelo de decisión multimodal de 0,59 mil millones de parámetros desarrollado por el equipo de vLLM Semantic Router (publicado bajo el identificador `nam194/d3-edge` en Hugging Face, con espejo oficial en `vllm-sr/d3-edge`). No es un modelo generativo al uso: recibe un estado (texto o JSON, opcionalmente acompañado de imágenes y vídeos) junto con un conjunto de preguntas tipificadas (elección múltiple, sí/no o puntuación en escala) y devuelve, en una sola llamada, una probabilidad para cada opción sin generar texto. Está construido sobre el modelo base Qwen/Qwen3.5-0.8B mediante ajuste fino y añade un codificador visual de 0,10B.

El modelo se enmarca en la familia Decision 3.0, los "modelos de decisión" del proyecto vLLM Semantic Router, y su propósito es actuar como enrutador y clasificador de baja latencia dentro de pipelines de inferencia: decidir qué equipo o modelo debe atender una petición, verificar condiciones booleanas o asignar una urgencia a una solicitud. Frente a un LLM generativo, elimina la necesidad de parsear texto libre y expone directamente distribuciones de probabilidad, lo que simplifica su integración en sistemas de enrutamiento.

Su relevancia actual radica en la combinación de tres factores: soporte multimodal (texto, imágenes y vídeo a 2 fps), latencias muy bajas (mediana de 6,6 ms para texto y 274 ms para un vídeo de 10 segundos en una GPU AMD Instinct MI325X) y una licencia Apache-2.0 permisiva. Según la model card, obtiene 20,2 en el Jev Decision Index 0.3.2 (segundo entre las entradas de tamaño similar) y mejora en 6,6 puntos a su predecesor Decision 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas de atención lineal (hereda la arquitectura de Qwen3.5-0.8B) más codificador visual de 0,10B; requiere `trust_remote_code` y `custom_code` |
| Parámetros totales | 594.321.600 (0,59B), incluidos 0,10B del codificador visual |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la información proporcionada; existe una versión GGUF publicada por ggml-org (`ggml-org/vllm-d3-edge-GGUF`) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,2 GB); disponible también en GGUF por terceros |

## Arquitectura y entrenamiento

d3-edge parte del modelo Qwen/Qwen3.5-0.8B, un transformer de 0,8B parámetros, y se ajusta mediante fine-tuning para la tarea de decisión. El resultado final tiene 0,59B parámetros, de los cuales 0,10B corresponden a un codificador visual que permite procesar imágenes (PNG, JPEG, WebP) y vídeos (MP4, WebM, MOV, MKV) muestreados a 2 fotogramas por segundo. La model card menciona capas de atención lineal y ofrece un paquete opcional (`flash-linear-attention`) para kernels rápidos en GPU, lo que sugiere una arquitectura híbrida con componentes de atención lineal.

El entrenamiento se orienta a la clasificación zero-shot y a la decisión estructurada: cada pregunta se responde mediante un forward pass independiente sobre el estado de entrada, y el modelo devuelve una probabilidad por opción. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card sí reporta resultados de evaluación interna (Jev Decision Index 0.3.2, Perception Test) y una comparación directa con Decision 2.0 que indica mejoras en todas las áreas evaluadas.

## Capacidades

- Clasificación zero-shot con opciones definidas por el usuario (tipo `choice`), devolviendo probabilidad por cada criterio.
- Preguntas booleanas (tipo `noul`, sí/no) con probabilidad asociada.
- Puntuación en escala ordinal (tipo `score`) con criterios definidos por el usuario.
- Procesamiento multimodal: múltiples imágenes por petición (rutas locales, URLs, objetos PIL o data URLs base64), visibles para todas las preguntas de la petición.
- Procesamiento de vídeo: múltiples vídeos por petición (rutas, URLs, base64 o arrays de fotogramas), muestreados a 2 fps.
- Respuesta conjunta a varias preguntas en una sola llamada, cada una con su propio forward pass.
- Salida estructurada con probabilidades, sin generación de texto libre.
- Integración con vLLM Semantic Router para despliegue en producción.

## Casos de uso

- Enrutamiento de peticiones en atención al cliente: el modelo recibe el texto de la solicitud y decide a qué equipo derivarla (devoluciones, facturación, soporte técnico) mediante preguntas de tipo `choice`, con latencia de milisegundos que permite colocarlo como primera etapa de un pipeline.
- Verificación documental con imágenes: dado un ticket o recibo adjunto y el texto del cliente, responde preguntas booleanas como si el recibo incluye el producto o cómo se pagó el pedido, combinando el codificador visual con el estado textual.
- Clasificación de urgencia: asigna una puntuación ordinal (rutina, pronto, hoy) a cada solicitud entrante, lo que permite priorizar colas de trabajo sin un LLM generativo costoso.
- Moderación y filtrado previo: comprobar condiciones booleanas sobre contenido de texto o vídeo (por ejemplo, si un clip muestra un cambio de color o una dirección de movimiento) antes de invocar modelos mayores.
- Enrutamiento semántico en infraestructuras de inferencia: integrado en vLLM Semantic Router, decide qué modelo o endpoint debe atender cada consulta según el contenido, con un throughput reportado de 861 peticiones/s y p99 inferior a 1 s en una MI325X.
- Análisis de vídeo de vigilancia o pruebas de cámara: responder preguntas de elección múltiple sobre clips cortos (dirección del movimiento, presencia de objetos) a 2 fps, con una latencia de 274 ms para un vídeo de 10 segundos.
- Evaluación automatizada de formularios y JSON: procesar estados en formato JSON y responder múltiples preguntas de validación en una sola llamada, útil en pipelines de extracción y control de calidad.

## Benchmarks y rendimiento

| Benchmark | d3-edge | Decision 2.0 (0,6B) | Notas |
|---|---|---|---|
| Jev Decision Index 0.3.2 (texto) | 20,2 | 13,6 | Segundo entre entradas de tamaño similar |
| Suite pública (kit oficial 0.3) | 28,82 | 16,72 (implícito, +12,1) | 140.178 peticiones públicas respondidas, ninguna sin soporte |
| Tests privados de misma habilidad | No disponible | No disponible | +7,4 frente a Decision 2.0 |
| Tareas de dominio nuevo | No disponible | No disponible | +1,1 frente a Decision 2.0 |
| Perception Test (vídeo QA, elección múltiple) | 46,6 | No disponible | Evaluación interna |
| Latencia mediana, texto | 6,6 ms | No disponible | 1 petición, AutoModel, MI325X |
| Latencia mediana, imagen | 58,6 ms | No disponible | 1 petición, AutoModel, MI325X |
| Latencia mediana, vídeo de 10 s | 274 ms | No disponible | 1 petición, AutoModel, MI325X |
| Throughput con vLLM Semantic Router | 861 req/s (p99 < 1 s) | No disponible | 6,1× AutoModel |

## Requisitos de hardware

- VRAM estimada: con 0,59B parámetros en precisión completa (fp16/bf16), el modelo ocupa aproximadamente 1,2 GB de pesos; en cuantización de 8 bits rondaría 0,6 GB y en 4 bits unos 0,3 GB, aunque no se han publicado cifras oficiales de cuantización.
- GPU recomendadas: la model card reporta mediciones en una AMD Instinct MI325X; por tamaño, el modelo cabe holgadamente en GPUs de consumo como RTX 4090, RTX 3090 o incluso GPUs con 8 GB de VRAM en fp16.
- Cabe en GPU de consumo: sí, con amplio margen, dado el tamaño reducido del modelo.
- Opciones de despliegue: AutoModel de Transformers (con `trust_remote_code=True` y Transformers 5.17.0), vLLM Semantic Router para producción, y GGUF mediante llama.cpp/Ollama a través de la versión publicada por ggml-org.
- Latencia y throughput: mediana de 6,6 ms (texto), 58,6 ms (imagen) y 274 ms (vídeo de 10 s) con AutoModel en MI325X; 861 peticiones/s con p99 inferior a 1 s usando vLLM Semantic Router, 6,1× el rendimiento de AutoModel.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Enfoque |
|---|---|---|---|---|---|
| d3-edge | 0,59B (0,10B visión) | No disponible | Texto, imagen y vídeo | Apache-2.0 | Decisión zero-shot con probabilidades |
| Decision 2.0 (0,6B) | 0,6B | No disponible | No disponible | No disponible | Decisión zero-shot (predecesor) |
| Qwen3.5-0.8B (base) | 0,8B | No disponible | No disponible | No disponible | LLM generativo |
| Modelos de clasificación zero-shot de propósito general | Variable | Variable | Habitualmente solo texto | Variable | Clasificación por etiquetas |

La comparación directa más relevante es con Decision 2.0, su predecesor, sobre el que la model card reporta una mejora de 6,6 puntos en el Jev Decision Index y ventajas en las cinco áreas evaluadas. Frente a un LLM generativo como Qwen3.5-0.8B, d3-edge sacrifica la generación de texto a cambio de latencia muy baja y salidas probabilísticas estructuradas. No se dispone de datos de benchmarks frente a otros clasificadores zero-shot comerciales.

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve probabilidades para las opciones o criterios definidos por el usuario, por lo que no sirve para tareas generativas.
- No se especifican los idiomas soportados ni el contexto máximo; la model card no detalla la composición del dataset de entrenamiento, lo que dificulta evaluar sesgos.
- Riesgo de alucinación estructural: al asignar probabilidades a opciones predefinidas, puede forzar una respuesta incluso cuando ninguna opción es adecuada; la calibración de las probabilidades no está documentada.
- El rendimiento en vídeo se limita a 2 fps, insuficiente para movimientos rápidos o eventos de corta duración.
- Los benchmarks reportados (Jev Decision Index, Perception Test) son en gran parte internos o específicos del proyecto, lo que limita la comparabilidad con evaluaciones externas.
- Requiere `trust_remote_code=True` y una versión concreta de Transformers (5.17.0), lo que añade fricción de integración y riesgo de incompatibilidades.
- Aunque la licencia es Apache-2.0 y permite uso comercial, conviene verificar la licencia del modelo base Qwen3.5-0.8B antes de desplegarlo en producción.
- El identificador `nam194/d3-edge` no muestra descargas ni likes y el espejo oficial es `vllm-sr/d3-edge`; conviene usar el repositorio oficial para pesos y documentación actualizados.

## Enlaces

- Modelo en Hugging Face (autor): https://huggingface.co/nam194/d3-edge
- Modelo en Hugging Face (oficial): https://huggingface.co/vllm-sr/d3-edge
- Versión GGUF: https://huggingface.co/ggml-org/vllm-d3-edge-GGUF
- Repositorio de vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Demo oficial: https://decision.vllm-sr.ai
- Space oficial: https://huggingface.co/spaces/vllm-sr/Decision-3.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
