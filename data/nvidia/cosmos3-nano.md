# nvidia/Cosmos3-Nano

## Resumen

Cosmos3-Nano es un modelo fundacional omnimodal desarrollado por NVIDIA, presentado como parte de la colección Cosmos 3 de "world models" orientados a Physical AI: robótica, conducción autónoma y entornos inteligentes a escala industrial. El modelo acepta combinaciones de texto, imagen, vídeo (con o sin audio) y trayectorias de acción, y genera como salida texto, imagen, vídeo, audio y comandos de acción, cubriendo tanto comprensión del mundo físico como simulación y predicción de futuros.

La arquitectura es un Transformer construido como Mixture-of-Transformers (MoT), con dos torres complementarias: una autorregresiva que genera tokens discretos (texto) mediante decodificación next-token, y otra de difusión que sintetiza las modalidades continuas (imagen, vídeo, audio, acción) mediante denoising iterativo. El modelo declara 16B de parámetros según la model card, y el repositorio de safetensors registra 15.750.057.456 parámetros totales (unos 15,75B). El límite de entrada de texto documentado es de 4096 tokens.

Su relevancia actual radica en que unifica razonamiento visual, generación multimodal y predicción de acciones en un único modelo abierto con licencia OpenMDW 1.1, y en que NVIDIA lo distribuye tanto en Hugging Face como a través de endpoints gestionados (NVIDIA NIM, Azure, SageMaker). Está pensado explícitamente para uso comercial y no comercial, y su integración con vLLM (vllm-omni), SGLang (sglang-diffusion) y diffusers lo sitúa como una pieza reutilizable dentro de pipelines de investigación en embodied AI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Transformers (MoT): torre autorregresiva (tokens discretos) + torre de difusión (modalidades continuas) |
| Parámetros totales | 16B según model card; 15.750.057.456 (≈15,75B) en safetensors |
| Parámetros activos | No aplica: la arquitectura es MoT, no una mezcla de expertos con enrutado disperso |
| Longitud de contexto | 4096 tokens para texto; vídeo de entrada con un máximo de 5 fotogramas; audio de entrada de 0,5 s máx.; acción de 16 a 400 fotogramas |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | OpenMDW 1.1 (openmdw.ai/license/1-1/) |
| Formato de pesos | Safetensors (repo de 177,8 GB); etiquetado también con diffusers |
| Modalidades de entrada | Texto (string), imagen (jpg, png, jpeg, webp), vídeo (mp4, con o sin audio), trayectoria de acción (json, lista 1D) |
| Modalidades de salida | Texto (string), imagen (JPG), vídeo (MP4), audio (AAC muxado en el MP4, estéreo 48 kHz), acción (json) |
| Resoluciones de imagen y vídeo | 256p, 480p y 720p, con relaciones de aspecto 16:9, 4:3, 1:1, 3:4, 9:16 |
| Duración de vídeo generado | De 5 a 400 fotogramas; 189 fotogramas por defecto |
| Morfologías de acción compatibles | Cámara general (9D), vehículo autónomo (9D), movimiento egocéntrico (57D), Franka Panda + RobotiQ (10D), doble Franka Panda + RobotiQ (20D), Agibot (29D), UR (10D), Google robot (10D), WidowX 250 (10D), UMI (9D) |
| Librería | cosmos |
| Descargas / likes en Hugging Face | 97.801 descargas, 379 likes |
| Fecha de publicación | 31/05/2026 según la model card (Hugging Face y GitHub); el repositorio registra creación el 10/03/2026 y última actualización el 16/09/2026 |
| Despliegue soportado | Azure, SageMaker, NVIDIA NIM, vLLM, SGLang, diffusers |

## Arquitectura y entrenamiento

Cosmos3-Nano se basa en una arquitectura Mixture-of-Transformers compuesta por dos torres de transformer con funciones diferenciadas. La torre autorregresiva se encarga de la generación de tokens discretos, de modo que el texto se produce con decodificación estándar next-token. La torre de difusión se encarga de las modalidades continuas: imagen, vídeo, audio y acciones se sintetizan mediante denoising iterativo. Esta separación permite mantener el mecanismo de generación más adecuado para cada tipo de señal dentro de un mismo marco unificado, en lugar de forzar todas las modalidades a un único paradigma de decodificación. El modelo se desarrolló a partir del Cosmos Framework de NVIDIA y pertenece a la familia Cosmos 3, que agrupa varios modelos omnimodales de "world model".

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; tampoco se especifican innovaciones adicionales como decodificación especulativa o mecanismos de atención lineal. Los datos técnicos públicos se limitan a la arquitectura MoT, el recuento de parámetros, las especificaciones de entrada y salida y las morfologías robóticas soportadas. Cualquier afirmación sobre el corpus de entrenamiento o el proceso de alineación debe considerarse no disponible hasta que se consulte el white paper técnico enlazado por NVIDIA.

## Capacidades

- Generación de texto autorregresiva a partir de entradas multimodales, con un límite de 4096 tokens de contexto de texto.
- Generación de imagen en JPG a resoluciones de 256p, 480p y 720p y cinco relaciones de aspecto predefinidas.
- Generación de vídeo en MP4 de 5 a 400 fotogramas (189 por defecto), con resolución y tasa de fotogramas especificadas en la entrada.
- Generación de audio mediante un flujo AAC estéreo a 48 kHz, muxado dentro del MP4 de salida.
- Generación y predicción de acciones en formato json (lista 1D) para morfologías robóticas y de conducción concretas.
- Comprensión multimodal conjunta de texto, imagen, vídeo y audio, orientada a razonamiento visual y comprensión del mundo físico.
- Simulación y predicción de futuros (world simulation y future prediction) sobre escenas físicas.
- Razonamiento sobre acciones (action reasoning) para planificación en robótica y conducción autónoma.
- Acepta vídeo de entrada con audio muxado en el propio MP4 (estéreo, 48 kHz) y también vídeo sin audio.
- Aprendizaje de políticas encarnadas (embodied policy learning) como bloque base para investigación en agentes físicos.
- No se documenta soporte explícito de tool calling, function calling ni orquestación de agentes multi-paso en la información disponible.
- No se documentan capacidades multilingües; el apartado de idiomas figura como no disponible.

## Casos de uso

- Generación de datos sintéticos para entrenamiento de robots: el modelo puede producir vídeo a 256p, 480p o 720p de hasta 400 fotogramas condicionado por texto, imagen o trayectorias de acción, lo que permite ampliar datasets de manipulación sin coste de captura real. Es adecuado porque combina entrada de acción y salida de vídeo en el mismo modelo.
- Predicción de futuros en conducción autónoma: acepta acciones de vehículo autónomo (9D) y movimiento egocéntrico (57D), de modo que puede simular la evolución de una escena a partir de una secuencia de control y usarse para validar planificadores antes de desplegarlos en vehículo.
- Manipulación robótica con Franka Panda: al soportar la morfología de brazo Franka Panda + RobotiQ (10D) y la configuración dual (20D), permite generar trayectorias y vídeos de ejecución coherentes para probar políticas de agarre y ensamblaje en simulación.
- Audio sincronizado con vídeo para entornos industriales: la salida de audio AAC estéreo a 48 kHz muxada en el MP4 facilita generar clips con sonido ambiental y de maquinaria coherentes con la escena, útiles para entrenar modelos de percepción audiovisual.
- Gemelos digitales de espacios inteligentes y fábricas: la entrada de vídeo con o sin audio y la salida de vídeo permiten simular condiciones de planta, tráfico de personas o flujos logísticos para planificación y análisis de riesgos.
- Investigación en world models y policy learning: sirve como bloque base para experimentos de comprensión del mundo, predicción y aprendizaje de políticas encarnadas, con integración en vLLM, SGLang y diffusers para reproducir pipelines.
- Razonamiento y descripción multimodal de vídeo: la combinación de entrada de vídeo y salida de texto permite anotar o resumir secuencias con contexto físico, por ejemplo para documentar eventos en robótica o logística.
- Despliegue como servicio gestionado: al estar disponible en NVIDIA NIM, Azure y SageMaker, puede exponerse como endpoint de generación multimodal sin gestionar la infraestructura de GPU internamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Estimación de VRAM para pesos en BF16/FP16: aproximadamente 31,5 GB para 15,75B parámetros. Añadiendo activaciones, caché de atención y los decodificadores de difusión para vídeo y audio, el consumo práctico se sitúa por encima de esa cifra; se recomienda planificar con 48-80 GB de VRAM por instancia.
- Estimación en FP8: aproximadamente 16 GB solo de pesos, más el coste de los componentes de decodificación multimodal.
- Estimación en INT4: aproximadamente 8 GB solo de pesos, aunque la información disponible no confirma que existan checkpoints cuantizados publicados ("tipos de cuantización: no disponible").
- El repositorio en Hugging Face ocupa 177,8 GB, muy por encima del tamaño teórico de los pesos en una única precisión, lo que sugiere la presencia de varios componentes y/o variantes de precisión; hay que reservar espacio en disco en consecuencia.
- GPU recomendadas: A100 80 GB, H100 80 GB y, en general, aceleradores de centro de datos con 48-80 GB de VRAM. Las soluciones cloud indicadas por el autor (NVIDIA NIM, Azure, SageMaker) son la vía de despliegue más directa.
- GPU de consumo: una RTX 4090 de 24 GB o similar no permite cargar los pesos en BF16 sin cuantización; solo sería viable con cuantizaciones agresivas, y no se confirma disponibilidad de checkpoints de ese tipo.
- Opciones de despliegue: vLLM mediante vllm-omni, SGLang mediante sglang-diffusion, diffusers (etiquetado en el repositorio), NVIDIA NIM y los endpoints gestionados de Azure y SageMaker.
- Latencia y throughput: no disponibles. La generación de vídeo por denoising iterativo y el límite de hasta 400 fotogramas implican tiempos de inferencia muy superiores a los de un modelo de texto del mismo tamaño, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de benchmarks ni especificaciones de modelos alternativos de la misma categoría, por lo que no es posible establecer una comparación numérica fiable.

Como contexto, dentro de la propia colección Cosmos 3 existen otras variantes además de Nano (NVIDIA mantiene una colección pública en Hugging Face), y la plataforma Cosmos cuenta con generaciones anteriores de modelos orientados a predicción y transferencia para Physical AI. No obstante, no se dispone de parámetros, contexto, rendimiento ni licencia de esas alternativas en la información consultada, de modo que cualquier tabla comparativa sería especulativa.

## Limitaciones y advertencias

- La entrada de texto está limitada a 4096 tokens, lo que restringe instrucciones largas o diálogos multi-turno extensos.
- La entrada de vídeo admite un máximo de 5 fotogramas, mientras que la acción admite secuencias de 16 a 400 fotogramas; la entrada de audio está limitada a 0,5 segundos. Estas asimetrías condicionan el diseño de los pipelines.
- Las salidas de vídeo van de 5 a 400 fotogramas, con 189 por defecto: los clips largos implican tiempos de generación elevados.
- Las entradas de imagen y vídeo deben ser RGB de 8 bits por canal en espacio sRGB; no se soporta escala de grises.
- La entrada de acciones solo funciona con las morfologías enumeradas (cámara general, vehículo autónomo, movimiento egocéntrico, Franka Panda simple y dual con RobotiQ, Agibot, UR, Google robot, WidowX 250 y UMI). Cualquier otro robot requiere adaptación no documentada.
- La salida de audio se entrega muxada en AAC dentro del MP4, en estéreo a 48 kHz; no se ofrece un flujo de audio independiente.
- Riesgo de alucinación y de outputs inexactos, sesgados o inapropiados: NVIDIA advierte explícitamente de esta posibilidad en su catálogo de modelos. En un modelo orientado a simulación física, una predicción visual plausible no garantiza consistencia física, por lo que la salida debe validarse antes de usarse para control real.
- Sesgos conocidos: no disponibles. No se documenta la composición del dataset de entrenamiento, lo que dificulta evaluar sesgos demográficos, geográficos o de dominio.
- Idiomas soportados: no disponibles; no se puede asumir un rendimiento multilingüe equivalente al de modelos de lenguaje convencionales.
- Licencia: OpenMDW 1.1. La model card indica que el modelo está listo para uso comercial y no comercial, pero los términos completos deben revisarse en el enlace de licencia antes de un despliegue en producción, ya que no se trata de una licencia Apache o MIT.
- Entorno de producción: conviene fijar versiones de las librerías de despliegue (vLLM, SGLang, diffusers) porque el soporte de un modelo omnimodal con torre de difusión suele evolucionar rápido y romper compatibilidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Cosmos3-Nano
- Colección Cosmos 3: https://huggingface.co/collections/nvidia/cosmos3
- Repositorio de código: https://github.com/nvidia/cosmos
- White paper técnico: https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Sitio web del proyecto: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Cosmos Framework: https://github.com/nvidia/cosmos-framework
- Página del modelo en NVIDIA NIM: https://build.nvidia.com/nvidia/cosmos3-nano
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/cosmos3-nano/modelcard
- System card en NVIDIA NIM: https://build.nvidia.com/nvidia/cosmos3-nano/systemcard
- Blog de NVIDIA sobre Cosmos 3: https://blogs.nvidia.de/cosmos-3-physical-ai-open-world-foundation-model/
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
