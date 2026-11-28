# OpenMOSS-Team/MOSS-VL-Realtime

## Resumen

MOSS-VL-Realtime es el checkpoint especializado en interaccion en tiempo real de la familia MOSS-VL, un conjunto de modelos vision-lenguaje abiertos publicados por MOSS AI, OpenMOSS y el Shanghai Innovation Institute (SII). Frente a los modelos video-lenguaje offline, que primero ingieren el video completo y despues responden, este modelo esta disenado para flujos de video continuos: percibe fotogramas entrantes y genera texto en paralelo, permite preguntas en cualquier instante del stream y puede decidir si responder o seguir observando cuando la evidencia visual es insuficiente.

El modelo cuenta con 11.336.371.208 parametros (aproximadamente 11B) en BF16, una ventana de contexto de texto de 256K tokens y una arquitectura vision-lenguaje basada en cross-attention que desacopla la codificacion visual del razonamiento linguistico. Incorpora codificacion temporal explicita mediante timestamps absolutos y Cross-attention Rotary Position Embedding (XRoPE), que proyecta tokens de texto y parches visuales en un espacio tridimensional (tiempo, altura, anchura).

Su relevancia actual radica en que cubre un nicho poco poblado en el ecosistema abierto: la comprension de video en streaming con interaccion interrumpible, silencio proactivo y correccion dinamica de respuestas previas. Se distribuye con licencia Apache 2.0, lo que facilita su adopcion comercial, y forma parte de una familia junto a MOSS-VL-Base y MOSS-VL-Instruct para uso offline, preentrenamiento continuado y ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje con cross-attention desacoplada, XRoPE (Time, Height, Width), timestamp-aware encoding |
| Parametros totales | 11.336.371.208 (~11B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (texto) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), con codigo custom (`trust_remote_code=True`) |
| Tamano del repositorio | 22,7 GB |
| Tamano de parche visual | 16 |
| Tamano de parche temporal | 1 |
| FPS por defecto (video) | 1,0 |
| Maximo de fotogramas por defecto | 256 |
| Formato de fotograma en tiempo real | Imagen compatible con PIL mas timestamp |
| Alcance de sesion en tiempo real | Una sesion activa por instancia de modelo |
| Modelo base | OpenMOSS-Team/MOSS-VL-Base |

## Arquitectura y entrenamiento

MOSS-VL-Realtime emplea una arquitectura transformer vision-lenguaje con cross-attention que separa la codificacion visual del razonamiento del modelo de lenguaje. Esta separacion es clave para el uso en tiempo real: el contenido visual entrante se integra en el contexto de generacion en curso sin obligar al modelo a un flujo offline de "cargar todos los fotogramas y despues responder". El diseno de cross-attention desacoplada reduce la latencia y el coste de throughput en flujos de alta frecuencia de fotogramas, segun la documentacion del proyecto.

Para video e imagenes en streaming, el modelo inyecta timestamps absolutos junto a los fotogramas muestreados, lo que le permite razonar sobre cuando ocurre un evento, cuanto dura y como cambia la escena, en lugar de depender unicamente del orden de los fotogramas. XRoPE mapea tokens de texto y parches visuales a un espacio posicional tridimensional comun (tiempo, altura, anchura), dando una representacion posicional consistente para imagen, video offline y video en streaming. El checkpoint parte de MOSS-VL-Base y anade datos de streaming en tiempo real y una interfaz de inferencia para entrada fotograma a fotograma con timestamp. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Comprension de video en tiempo real: procesa fotogramas entrantes de forma continua en lugar de esperar al video completo.
- Interaccion interrumpible: acepta preguntas en cualquier timestamp de un stream activo y responde con base en los fotogramas observados hasta ese momento.
- Silencio proactivo: puede emitir el token `<|silence|>` y seguir observando cuando no hay actualizacion visual relevante o el contexto es insuficiente.
- Correccion dinamica: revisa respuestas anteriores a medida que llegan nuevos fotogramas, sin quedar fijado a una interpretacion inicial.
- Razonamiento temporal: los timestamps absolutos por fotograma permiten razonar sobre orden de eventos, duracion, ritmo y localizacion temporal fina.
- Comprension de imagen: soporta entrada de imagen individual ademas de video.
- Comprension de video offline: con FPS por defecto de 1,0 y maximo de 256 fotogramas.
- Capacidades multilingues: ingles y chino.
- Interfaz de sesion en tiempo real: API `create_realtime_session(...)` con operaciones como `session.push_frame(image, timestamp=...)`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explicitamente en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Vigilancia y monitorizacion de video en directo: el modelo consume el stream de camaras IP o CCTV fotograma a fotograma con timestamps y puede responder consultas puntuales ("que ha ocurrido en los ultimos 30 segundos") o permanecer en silencio cuando no hay novedad visual, gracias al token `<|silence|>`.
- Asistencia en directo para retransmisiones: integrado en un pipeline que convierte el stream en fotogramas PIL, permite a operadores preguntar por eventos concretos durante un evento en vivo y obtener respuestas basadas solo en lo ya emitido, con correccion dinamica si la escena cambia.
- Analisis de reuniones y videollamadas en tiempo real: con 256K tokens de contexto y timestamps absolutos, puede responder preguntas sobre lo dicho y mostrado en una sesion activa, localizando el momento exacto de una diapositiva o una demostracion.
- Robots y agentes embodied con percepcion visual continua: la sesion de tiempo real con `push_frame` encaja en bucles de control donde el agente necesita decidir si responder o seguir observando antes de actuar.
- Soporte remoto y teleasistencia: un tecnico comparte pantalla o camara y el modelo responde a preguntas sobre lo que aparece en el flujo, revisando su respuesta si el usuario mueve la camara o cambia de pantalla.
- Analisis de deportes y eventos con componente temporal: la codificacion con XRoPE y timestamps permite razonar sobre orden de jugadas, duracion de posesiones y cambios de escena durante la retransmision.
- Moderacion de contenido en directo: el modelo puede evaluar fotogramas entrantes y emitir juicios actualizados a medida que evoluciona la escena, con la ventaja de corregir interpretaciones previas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card indica que el modelo esta disenado para benchmarks de comprension de video en streaming, con enfasis en calidad de interaccion en tiempo real, silencio proactivo y actualizacion dinamica de respuestas, y remite a los recursos del proyecto MOSS-VL para las tablas detalladas, sin incluirlas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 22-24 GB solo para pesos, mas memoria para cache KV y activaciones; con contexto de 256K el consumo adicional puede ser considerable.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para contexto largo y sesiones de streaming sostenidas; L40S o RTX 6000 Ada como alternativas de 48 GB.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 solo si se limita el contexto y el numero de fotogramas; con contexto largo o cuantizacion no documentada, el margen es ajustado. No se documentan pesos GGUF ni cuantizaciones oficiales.
- Opciones de despliegue: la via oficial es `transformers` con `trust_remote_code=True`, `device_map="auto"` y `flash_attention_2` (o `eager` si FlashAttention no esta disponible). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no se publican cifras concretas. La documentacion afirma que la cross-attention desacoplada reduce la latencia y el coste de throughput en flujos de alta frecuencia de fotogramas, pero sin numeros medibles.
- Restriccion operativa: una sola sesion en tiempo real activa por instancia de modelo, lo que condiciona el dimensionamiento en despliegues multi-usuario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-VL-Realtime | ~11B | 256K | Video en streaming con interaccion interrumpible | Apache 2.0 | Hugging Face, API MOSS |
| MOSS-VL-Instruct | No disponible en la informacion | No disponible | Vision-lenguaje offline (misma familia) | Apache 2.0 (segun familia) | Hugging Face |
| MOSS-VL-Base | No disponible en la informacion | No disponible | Base para preentrenamiento y ajuste fino | Apache 2.0 (segun familia) | Hugging Face |
| Otros modelos video-lenguaje abiertos de ~7-13B | No disponible | No disponible | Comprension de video offline | Variable | Variable |

La informacion proporcionada no incluye datos de rendimiento de MOSS-VL-Instruct ni de MOSS-VL-Base, ni de modelos de terceros, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano u otros idiomas no esta documentado.
- Sesgo y alucinacion: no se documentan evaluaciones de sesgo ni tasas de alucinacion; como modelo vision-lenguaje, puede generar descripciones plausibles pero incorrectas de escenas ambiguas o con poca evidencia visual.
- Una sola sesion por instancia: la sesion en tiempo real es unica por instancia de modelo, lo que limita el despliegue concurrente y exige replicas para multiples usuarios.
- Dependencia de codigo custom: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio del autor y revisarlo antes de usar en produccion.
- Contexto largo: aunque la ventana es de 256K tokens, no se documenta el comportamiento degradado en contextos muy largos ni el coste de memoria asociado.
- Rendimiento en tiempo real: no se publican cifras de latencia ni throughput, por lo que la viabilidad en hardware concreto debe validarse empiricamente.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las dependencias del codigo custom y los pesos del modelo base.
- Benchmarks: la ausencia de tablas numericas en la informacion disponible impide verificar afirmaciones de rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Realtime
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Base
- Pagina del modelo en MOSS AI: https://www.moss-ai.com/models/moss-vl-realtime
- Documentacion de la API MOSS (escenario VL Realtime): https://platform.moss.cn/en/docs/scenarios/vl-realtime
- Informe tecnico (arXiv 2608.15045): https://arxiv.org/pdf/2608.15045
- Referencia adicional (arXiv 2606.07639): https://arxiv.org/abs/2606.07639
- Repositorio GitHub MOSS-VL: https://github.com/OpenMOSS/MOSS-VL
- OpenMOSS: https://openmoss.ai/
- MOSS AI: https://www.moss-ai.com/
