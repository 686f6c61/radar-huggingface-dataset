# nvidia/Cosmos3-Super

## Resumen

Cosmos3-Super es un modelo fundacional omnimodal desarrollado por NVIDIA dentro de su plataforma Cosmos, orientada a lo que la compania denomina Physical AI: robotica, conduccion autonoma y entornos industriales o de fabrica. El modelo acepta combinaciones de texto, imagen, video (con o sin audio) y trayectorias de accion, y genera texto, imagenes, video, audio y comandos de accion. Con 64.615.003.632 parametros y un tamano de repositorio de 202,2 GB, se posiciona como el miembro de mayor capacidad de la familia Cosmos3.

La arquitectura es un Mixture-of-Transformers (MoT) con dos torres complementarias: una transformer autorregresiva para generacion de tokens discretos (texto) y una transformer de difusion para generacion multimodal continua (imagen, video, audio y acciones). Esta separacion permite aplicar el mecanismo de generacion mas adecuado a cada modalidad dentro de un unico marco, algo relevante para simulacion de mundo y aprendizaje de politicas encarnadas.

Su relevancia actual radica en que unifica comprension y generacion multimodal con salidas de accion para robots y vehiculos, lo que lo convierte en una pieza potencial para pipelines de simulacion, world modeling y entrenamiento de agentes fisicos. La licencia OpenMDW1.1 permite uso comercial y no comercial, y el modelo declara compatibilidad con motores de inferencia como vLLM, SGLang y diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Transformers (MoT): torre autorregresiva + torre de difusion |
| Parametros totales | 64.615.003.632 (64B) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (entrada de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors |
| Entradas | Texto, imagen (jpg, png, jpeg, webp), video (mp4 con o sin audio), trayectoria de accion (json) |
| Salidas | Texto, imagen (JPG), video (MP4), audio (AAC embebido en MP4), accion (json) |
| Resoluciones de imagen/video | 256p, 480p, 720p; ratios 16:9, 4:3, 1:1, 3:4, 9:16 |
| Limite de video | maximo 5 frames |
| Limite de audio | maximo 0,5 segundos de entrada; salida estereo 48 kHz |
| Limite de accion | 16 a 400 frames de video |
| Embodiments de accion | camara general (9D), vehiculo autonomo (9D), egocentrico (57D), Franka Panda + RobotiQ (10D), doble Franka Panda (20D), Agibot (29D), UR (10D), Google robot (10D), WidowX 250 (10D), UMI (9D) |
| Libreria | cosmos |
| Fecha de publicacion | 31/05/2026 (Hugging Face y GitHub) |

## Arquitectura y entrenamiento

Cosmos3-Super se construye sobre el Cosmos Framework de NVIDIA y emplea una arquitectura Mixture-of-Transformers con dos torres: una autorregresiva que genera texto mediante decodificacion next-token estandar, y una transformer de difusion que sintetiza las modalidades no textuales (imagen, video, audio y acciones) mediante denoising iterativo. Esta division preserva los mecanismos de generacion optimos para cada tipo de senal dentro de un mismo modelo, algo poco habitual en modelos multimodales que suelen forzar todas las salidas por una unica via generativa.

El modelo esta disenado explicitamente como world model: recibe trayectorias de accion de embodiments concretos (brazos Franka, Agibot, UR, WidowX, Google robot, UMI, vehiculos autonomos, camaras) y puede predecir futuros visuales y de accion coherentes. No se han publicado en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto autorregresiva con contexto de hasta 4096 tokens.
- Generacion de imagenes en 256p, 480p y 720p con cinco ratios de aspecto.
- Generacion de video MP4 de hasta 5 frames por inferencia, con resoluciones de 256p a 720p.
- Generacion y sincronizacion de audio estereo a 48 kHz embebido en el video.
- Generacion de trayectorias de accion para diez embodiments roboticos y de conduccion.
- Comprension multimodal conjunta de texto, imagen, video y audio.
- Simulacion de mundo y prediccion de futuros visuales condicionados por acciones.
- Razonamiento de accion para politicas encarnadas (embodied policy learning).
- Soporte declarado de despliegue en vLLM (vllm-omni), SGLang (sglang-diffusion) y diffusers.
- Capacidades multilingues: no disponible.

## Casos de uso

- Simulacion de entorno para robotica: dado un estado visual y una trayectoria de accion de un brazo Franka Panda (10D), el modelo genera el video del resultado esperado, lo que permite validar politicas antes de ejecutarlas en hardware real.
- Entrenamiento de politicas encarnadas: las trayectorias de accion generadas para embodiments como Agibot (29D) o UMI (9D) pueden usarse como datos sinteticos para aumentar el dataset de entrenamiento de controladores.
- Conduccion autonoma: con entradas de video y acciones de vehiculo (9D), el modelo predice escenarios futuros de la escena, util para pruebas de robustez en percepcion y planificacion.
- Generacion de video de mundo para industrias: crear clips cortos (hasta 5 frames) de entornos de fabrica a partir de texto o imagen para prototipado visual y documentacion.
- Prototipado de experiencias audiovisuales: generar video con audio estereo sincronizado a partir de una descripcion textual, util para demos y previsualizacion de contenido.
- Investigacion en world models: servir como baseline omnimodal para estudiar transferencia entre modalidades, ya que unifica texto, imagen, video, audio y accion en un solo modelo.
- Generacion de datos sinteticos para vision por computador: producir imagenes y videos en multiples resoluciones y ratios para aumentar datasets de deteccion o segmentacion en dominios fisicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, un modelo de 64B en precision completa (fp16/bf16) requiere del orden de 128 GB solo para pesos, antes de activaciones y buffers de difusion.
- GPU recomendadas: no disponibles de forma explicita. Por tamano, el modelo encaja en soluciones de clase centro de datos como H100 o A100 de 80 GB con paralelismo, o GPUs con mayor memoria.
- Cabe en GPU consumer: no disponible. Con 64B de parametros y 202,2 GB de repositorio, no es viable en GPUs consumer de 24 GB sin cuantizacion agresiva, y no se documentan formatos GGUF.
- Opciones de despliegue declaradas: vLLM (vllm-omni), SGLang (sglang-diffusion), diffusers y la libreria cosmos. Tambien aparece en el ecosistema de despliegue de Azure y SageMaker segun los tags.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Super (NVIDIA) | 64B | 4096 tokens (texto) | Texto, imagen, video, audio, accion | OpenMDW1.1 | Hugging Face, GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de modelos directamente comparables de la misma categoria (world models omnimodales con salida de accion) con especificaciones verificables.

## Limitaciones y advertencias

- Limite de video muy restrictivo: maximo 5 frames por generacion, lo que limita la generacion de secuencias largas.
- Audio de entrada limitado a 0,5 segundos y salida estereo fija a 48 kHz.
- Contexto de texto de 4096 tokens, inferior al de muchos LLM contemporaneos.
- Solo admite entradas de imagen y video en RGB de 8 bits sRGB; no soporta escala de grises.
- Las acciones solo son validas para los embodiments listados; no hay soporte generico documentado.
- No se documentan sesgos conocidos ni tasas de alucinacion en la informacion disponible.
- Idiomas soportados no disponibles: no se puede garantizar cobertura multilingue.
- Licencia OpenMDW1.1: aunque el modelo se declara listo para uso comercial y no comercial, conviene revisar los terminos completos de la licencia antes de integrarlo en productos.
- No se han publicado benchmarks, por lo que la evaluacion de calidad debe hacerse de forma empirica.
- El tamano de 202,2 GB y los 64B de parametros implican costes de infraestructura elevados para produccion.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/Cosmos3-Super
- Coleccion Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Ejemplos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3-examples
- Codigo: https://github.com/nvidia/cosmos
- White paper: https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Web oficial: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Cosmos Framework: https://github.com/nvidia/cosmos-framework
- Licencia OpenMDW1.1: https://openmdw.ai/license/1-1/
