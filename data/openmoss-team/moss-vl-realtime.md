# OpenMOSS-Team/MOSS-VL-Realtime

## Resumen

MOSS-VL-Realtime es un modelo de visión y lenguaje (vision-language) de 11 000 millones de parámetros desarrollado por el equipo OpenMOSS, diseñado específicamente para la comprensión de flujos de vídeo en tiempo real. A diferencia de los modelos de vídeo offline que primero procesan el vídeo completo y después responden, este modelo procesa fotogramas entrantes de forma continua mientras genera texto en paralelo, lo que permite interrumpir la interacción en cualquier momento, hacer preguntas sobre lo observado hasta ese instante y recibir respuestas dinámicas que pueden corregirse a medida que llegan nuevos fotogramas.

El modelo forma parte de la familia MOSS-VL, que incluye también las variantes MOSS-VL-Base y MOSS-VL-Instruct para uso offline, y se publica bajo licencia Apache 2.0 con pesos abiertos. Su arquitectura se basa en atención cruzada (cross-attention) que desacopla el encodificador visual del razonamiento lingüístico, e incorpora una ventana de contexto de texto de 256 000 tokens. La relevancia actual de este modelo radica en abordar un problema poco cubierto por los modelos de vídeo convencionales: la interacción en streaming con latencia baja, donde el modelo debe decidir cuándo responder, cuándo permanecer en silencio observando y cuándo corregir una respuesta anterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención cruzada (cross-attention) para visión-lenguaje |
| Parametros totales | 11 336 371 208 (11B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 000 tokens de texto |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

MOSS-VL-Realtime adopta una arquitectura de atención cruzada que separa el encodificado visual del razonamiento lingüístico. Esta decisión de diseño es clave para el uso en tiempo real, ya que permite integrar contenido visual entrante en el contexto de generación en curso sin necesidad de cargar todos los fotogramas previamente. El modelo emplea Cross-attention Rotary Position Embedding (XRoPE), que mapea tokens de texto y parches visuales en un espacio tridimensional unificado definido por tiempo (t), altura (h) y anchura (w), proporcionando una representación posicional consistente para imágenes, vídeo offline y vídeo en streaming.

Para la entrada de vídeo y fotogramas en tiempo real, el modelo inyecta marcas de tiempo absolutas junto con los fotogramas muestreados. Esto permite razonar sobre cuándo ocurre un evento, cuánto dura y cómo cambia la escena a lo largo del tiempo, en lugar de depender únicamente del orden de los fotogramas. El tamaño de parche visual es de 16, el parche temporal de 1, el FPS por defecto es 1.0 y el número máximo de fotogramas por defecto es 256. El modelo soporta una sesión activa de tiempo real por instancia del modelo. Los detalles específicos sobre el dataset de entrenamiento, el número de tokens y los métodos de alineación (RLHF, DPO, etc.) no se han publicado en la información disponible.

## Capacidades

- Comprensión de flujos de vídeo en tiempo real: procesa fotogramas entrantes de forma continua y genera texto en paralelo.
- Interacción interrumpible: permite hacer preguntas en cualquier momento del flujo y el modelo responde basándose en los fotogramas observados hasta ese instante.
- Silencio proactivo: el modelo puede emitir el token especial `<|silence|>` y continuar observando cuando no hay actualización visual relevante o el contexto es insuficiente.
- Corrección dinámica: a medida que llegan nuevos fotogramas, el modelo puede revisar respuestas anteriores en lugar de quedar fijado a una interpretación inicial.
- Razonamiento temporal: cada fotograma lleva asociada una marca de tiempo absoluta, lo que permite razonar sobre orden de eventos, duración, ritmo y localización temporal fina.
- Comprensión de imágenes y vídeo offline: al compartir arquitectura con MOSS-VL-Base e Instruct, conserva capacidades de comprensión de imágenes y vídeo largo.
- Soporte multilingüe: inglés y chino.

## Casos de uso

- Vigilancia y monitorización de seguridad: el modelo puede analizar flujos de cámara en tiempo real, detectar eventos relevantes y responder a preguntas del operador sobre lo que está ocurriendo en un momento concreto, como "¿hay alguien en la zona restringida desde hace más de cinco minutos?".
- Asistentes para personas con discapacidad visual: integrado en gafas o dispositivos portátiles, el modelo puede describir el entorno continuamente, responder a preguntas sobre obstáculos o leer carteles, corrigiendo la descripción cuando la escena cambia.
- Moderación de contenidos en directo: análisis de streams de vídeo en plataformas sociales para detectar contenido inapropiado en tiempo real, con capacidad de responder a consultas del moderador sobre momentos específicos del flujo.
- Automatización de procesos de control de calidad: en líneas de fabricación, el modelo puede observar vídeo en streaming de una cinta transportadora, detectar anomalías visuales y responder a preguntas del sistema de control sobre el estado de un producto concreto.
- Telemedicina y asistencia remota: un profesional médico puede compartir un flujo de vídeo de una exploración y hacer preguntas al modelo sobre lo que observa, recibiendo respuestas que se actualizan a medida que el paciente se mueve o el ángulo de cámara cambia.
- Análisis de eventos deportivos en directo: el modelo puede seguir un partido o competición en streaming, responder a preguntas sobre jugadas concretas ("¿ha sido falta?") y corregir su evaluación cuando llegan nuevos ángulos o repeticiones.
- Conducción autónoma y asistencia al conductor: análisis de flujos de vídeo de cámaras de carretera para responder a consultas sobre el estado del tráfico, detección de obstáculos o señales, con capacidad de corrección dinámica cuando la escena cambia rápidamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación del modelo indica que está diseñado para benchmarks de comprensión de vídeo en streaming donde las preguntas pueden llegar antes de que se haya observado el vídeo completo y donde las respuestas correctas pueden cambiar a medida que la escena evoluciona. Las tablas de benchmarks detalladas y comparaciones se mantendrán en los recursos del proyecto MOSS-VL.

## Requisitos de hardware

- VRAM estimada para inferencia: con 11 000 millones de parámetros en BF16 (2 bytes por parámetro), el peso del modelo ocupa aproximadamente 22 GB. Con overhead de activaciones y caché KV para contexto largo, se recomiendan al menos 24-32 GB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: NVIDIA A100 40 GB, A100 80 GB, H100 80 GB, RTX 4090 24 GB (con cuantización o contexto reducido), RTX 6000 Ada 48 GB.
- En GPU de consumo: una RTX 4090 con 24 GB puede ejecutar el modelo con cuantización de 8 bits o con contexto reducido, aunque la ventana de 256K tokens requerirá memoria muy superior y probablemente no sea alcanzable en hardware de consumo.
- Opciones de despliegue: el modelo se carga con transformers y soporta `attn_implementation="flash_attention_2"` para aceleración, con fallback a `"eager"`. No se mencionan integraciones específicas con vLLM, llama.cpp u Ollama en la documentación disponible.
- Latencia y throughput: no se han publicado datos concretos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa rigurosa con modelos alternativos de streaming de vídeo. Los modelos comparables en el espacio de vídeo-lenguaje (como LLaVA-Video, Qwen2-VL o InternVideo2) no se mencionan en los materiales del proyecto, y no se han publicado resultados de benchmarks comparativos. La tabla de comparación se limitará a las características conocidas de la familia MOSS-VL:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| MOSS-VL-Realtime | 11B | 256K | Streaming en tiempo real | Apache 2.0 |
| MOSS-VL-Instruct | 11B | 256K | Instrucción offline | Apache 2.0 |
| MOSS-VL-Base | 11B | 256K | Base para fine-tuning | Apache 2.0 |

## Limitaciones y advertencias

- El modelo soporta únicamente una sesión activa de tiempo real por instancia, lo que limita el despliegue concurrente en aplicaciones multi-usuario.
- Los idiomas soportados se limitan a inglés y chino; el rendimiento en otros idiomas no está garantizado.
- El modelo puede emitir el token `<|silence|>` y no responder cuando considera que la información visual es insuficiente, lo que debe gestionarse adecuadamente en la interfaz de usuario.
- La corrección dinámica de respuestas implica que las respuestas anteriores pueden cambiar, lo que requiere un diseño cuidadoso del sistema para presentar actualizaciones al usuario sin confusión.
- No se han publicado resultados de benchmarks ni evaluaciones de sesgos, alucinación o seguridad, por lo que el comportamiento en producción debe validarse de forma independiente.
- La licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento y el proceso de alineación no se han documentado públicamente, lo que dificulta la evaluación de riesgos de sesgo.
- El repositorio requiere `trust_remote_code=True` al cargar el modelo con transformers, lo que implica ejecutar código personalizado del autor.

## Enlaces

- HuggingFace: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Realtime
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-VL
- Página del proyecto: https://openmoss.ai/MOSS-VL/
- Página de documentación: https://openmoss.ai/MOSS-VL/moss-vl.html
- Informe técnico (arXiv): https://arxiv.org/pdf/2608.15045
- Paper adicional (arXiv): https://arxiv.org/abs/2606.07639
