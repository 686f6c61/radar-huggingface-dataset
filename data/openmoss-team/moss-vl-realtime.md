# OpenMOSS-Team/MOSS-VL-Realtime

## Resumen
MOSS-VL-Realtime es un modelo vision-lenguaje de la familia MOSS-VL desarrollada por OpenMOSS, publicado bajo licencia Apache 2.0. Se trata del checkpoint especializado en interacción en tiempo real sobre flujos de vídeo continuos, a diferencia de los modelos vídeo-lenguaje offline que primero consumen el vídeo completo y después responden. El modelo percibe fotogramas entrantes y genera texto en paralelo, permite formular preguntas en cualquier instante de la emisión y puede decidir no responder cuando la evidencia visual es insuficiente.

La arquitectura mantiene el diseño de atención cruzada (cross-attention) de la familia MOSS-VL, que desacopla la codificación visual del razonamiento lingüístico, y conserva una ventana de contexto de texto de 256K tokens. Cuenta con aproximadamente 11 336 millones de parámetros en BF16 y se distribuye en formato safetensors con código personalizado (custom_code) para transformers.

Su relevancia actual reside en que aborda un escenario que los modelos vídeo-lenguaje convencionales no cubren: la comprensión de vídeo en emisión con capacidad de interrupción, silencio proactivo y corrección dinámica de respuestas previas a medida que llegan nuevos fotogramas. Se publica junto a MOSS-VL-Base y MOSS-VL-Instruct para cubrir tanto uso offline como ajuste fino e investigación aplicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje con atencion cruzada (cross-attention), decodificador de lenguaje tipo transformer causal y XRoPE (Cross-attention Rotary Position Embedding) |
| Parametros totales | 11 336 371 208 (~11B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 256K tokens de texto |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, con custom_code para transformers) |

Otros parámetros de configuración publicados: tamaño de parche visual 16, tamaño de parche temporal 1, FPS por defecto 1.0, máximo de fotogramas por vídeo 256, formato de fotograma en tiempo real compatible con PIL más marca de tiempo, y una única sesión en tiempo real activa por instancia de modelo.

## Arquitectura y entrenamiento
MOSS-VL-Realtime emplea una arquitectura vision-lenguaje basada en atención cruzada que separa la codificación visual del razonamiento en lenguaje. Esta separación es determinante para el uso en tiempo real, ya que permite integrar contenido visual entrante en el contexto de generación en curso sin obligar al modelo a un flujo estrictamente offline de "cargar todos los fotogramas y después responder". El modelo parte de MOSS-VL-Base y añade datos de entrenamiento específicos de streaming en tiempo real, junto con una interfaz de inferencia para entrada fotograma a fotograma con marcas de tiempo.

La codificación temporal se resuelve mediante la inyección de marcas de tiempo absolutas junto a los fotogramas muestreados, lo que permite razonar sobre cuándo ocurre un evento, cuánto dura y cómo cambia la escena, en lugar de depender únicamente del orden de los fotogramas. El mecanismo XRoPE proyecta tokens de texto y parches visuales en un espacio coordenado tridimensional único definido por tiempo (t), altura (h) y anchura (w), proporcionando una representación posicional consistente para imagen, vídeo offline y vídeo en streaming. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades
- Comprensión de imagen y de vídeo, incluyendo vídeo de larga duración, con razonamiento temporal sobre orden de eventos, duración y ritmo.
- Comprensión de vídeo en tiempo real: procesa fotogramas entrantes de forma continua y genera texto en paralelo.
- Interacción interrumpible: admite preguntas en cualquier marca de tiempo de una emisión en curso, respondiendo con base en los fotogramas observados hasta ese momento.
- Silencio proactivo: puede emitir el token especial `<|silence|>` y seguir observando cuando no hay actualización visual relevante o el contexto es insuficiente.
- Corrección dinámica: puede revisar respuestas anteriores a medida que llegan nuevos fotogramas, en lugar de quedar fijado a una interpretación inicial.
- Entrada de fotogramas con marca de tiempo absoluta mediante una API de sesión (`create_realtime_session`) con operaciones `push_frame`, `push_prompt`, `push_prompt_frame`, `poll_output` y `stream_outputs`.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de audio o modo de pensamiento explícito: no disponible en la información proporcionada.

## Casos de uso
- Vigilancia y monitorización de vídeo en directo: el modelo recibe fotogramas de una cámara IP o de un circuito cerrado con marcas de tiempo y puede responder preguntas puntuales sobre lo observado o permanecer en silencio cuando no hay novedad relevante, lo que encaja con el token `<|silence|>` y evita generar alertas espurias.
- Asistencia en directo para retransmisiones deportivas o eventos: un operador puede preguntar en cualquier instante qué ha ocurrido en los últimos segundos, y el modelo responde con base en los fotogramas ya procesados gracias a la ventana de 256K tokens y a la codificación temporal.
- Análisis de vídeo de reuniones o clases en streaming: al recibir fotogramas a 1 FPS con marcas de tiempo, el modelo puede resumir lo mostrado en una pizarra o pantalla compartida y actualizar el resumen conforme avanza la sesión mediante corrección dinámica.
- Supervisión de procesos industriales: con fotogramas de una línea de producción, el modelo puede detectar cambios de estado y responder consultas sobre cuándo se produjo una transición, apoyándose en el razonamiento sobre orden y duración de eventos.
- Robótica y agentes con percepción visual continua: la API de sesión permite empujar fotogramas desde un bucle de captura y consultar el estado de la escena, con la posibilidad de que el modelo decida no intervenir cuando la evidencia es insuficiente.
- Accesibilidad y descripción en directo: generación de descripciones de contenido visual en emisión para usuarios con discapacidad visual, con la ventaja de que el modelo puede mantener silencio cuando la escena no cambia y evitar una locución redundante.
- Investigación en interacción multimodal en tiempo real: el checkpoint sirve como base para estudiar políticas de respuesta proactiva, silencio y corrección dinámica en flujos continuos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo está orientado a benchmarks de comprensión de vídeo en streaming, donde las preguntas pueden llegar antes de haber observado el vídeo completo y la respuesta correcta puede cambiar a medida que evoluciona la escena, e indica que las tablas detalladas se mantendrán en los recursos del proyecto MOSS-VL, pero no incluye cifras concretas.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: en torno a 22-24 GB solo para pesos, más memoria para caché KV y procesamiento visual; el repositorio ocupa 22,7 GB.
- GPU recomendadas: A100 40/80 GB, H100, o GPUs de consumo con 24 GB o más para BF16 ajustado. En GPUs de 24 GB (RTX 3090, RTX 4090) el modelo en BF16 queda muy justo y puede requerir descarga parcial a CPU con `device_map="auto"`.
- Cuantizaciones de menor precisión: no se documentan en la información disponible; al no publicarse formatos GGUF ni cuantizaciones oficiales, el despliegue en GPUs de gama media-baja no está garantizado sin conversión propia.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` y `AutoProcessor` con `trust_remote_code=True`, `torch_dtype=torch.bfloat16` y `attn_implementation="flash_attention_2"` (o `"eager"` si FlashAttention no está disponible). No se confirma soporte de vLLM, TGI, llama.cpp u Ollama.
- Restricción operativa: una sola sesión en tiempo real activa por instancia de modelo, lo que implica escalar horizontalmente con varias instancias para atender múltiples flujos concurrentes.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A continuación se recoge únicamente lo que puede afirmarse con los datos de esta ficha frente a alternativas de la misma familia:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| MOSS-VL-Realtime | ~11B | 256K | Vídeo en streaming con silencio proactivo y corrección dinámica | apache-2.0 |
| MOSS-VL-Instruct | no disponible | no disponible | Uso offline (imagen y vídeo) | apache-2.0 (misma familia) |
| MOSS-VL-Base | no disponible | no disponible | Preentrenamiento y ajuste fino | apache-2.0 (misma familia) |

La comparación con modelos de otros desarrolladores (por ejemplo, familias vídeo-lenguaje de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias
- Idiomas: la model card declara únicamente inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Una sola sesión en tiempo real por instancia de modelo, lo que limita el despliegue multiusuario sin replicación.
- Requiere `trust_remote_code=True` y código personalizado (`custom_code`), lo que implica ejecutar código del autor y revisarlo antes de usarlo en producción.
- El silencio proactivo y la corrección dinámica introducen comportamiento no determinista en la interacción: una aplicación debe gestionar explícitamente el token `<|silence|>` y las respuestas revisadas.
- Riesgo de alucinación: no se documentan evaluaciones específicas de fidelidad visual ni tasas de error en la información disponible.
- Sesgos conocidos: no disponible en la información proporcionada.
- Limitaciones de contexto: la ventana es de 256K tokens de texto, pero el vídeo se muestrea a 1 FPS con un máximo de 256 fotogramas por defecto, lo que acota la resolución temporal efectiva.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las licencias de los pesos base y de los datasets de entrenamiento, no detalladas en la información disponible.
- No se documentan cuantizaciones oficiales, por lo que el despliegue en hardware de gama media requiere trabajo adicional de conversión y validación.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Realtime
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Base
- Informe técnico (arXiv 2608.15045): https://arxiv.org/pdf/2608.15045
- Referencia adicional (arXiv 2606.07639): https://arxiv.org/abs/2606.07639
- Repositorio de código MOSS-VL: https://github.com/OpenMOSS/MOSS-VL
