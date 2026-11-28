# OpenMOSS-Team/MOSS-VL-Instruct-0708

## Resumen

MOSS-VL-Instruct-0708 es el checkpoint ajustado por instrucciones (SFT) de la familia MOSS-VL, un modelo vision-lenguaje abierto desarrollado conjuntamente por MOSS AI, OpenMOSS y el Shanghai Innovation Institute (SII). Se construye sobre MOSS-VL-Base-0708 y esta disenado como un modelo multimodal offline de alto rendimiento, con especial enfasis en la comprension de video de larga duracion, razonamiento temporal, reconocimiento de acciones y localizacion de eventos a nivel de segundo.

El modelo emplea una arquitectura de atencion cruzada (cross-attention) que desacopla la codificacion visual del razonamiento linguistico, con 11.336 millones de parametros en BF16 y una ventana de contexto de texto de 256K tokens. Incorpora innovaciones como XRoPE (Cross-attention Rotary Position Embedding), que mapea tokens de texto y parches visuales a un espacio tridimensional unificado (tiempo, altura, anchura), y la inyeccion de marcas de tiempo absolutas en las secuencias de video.

Su relevancia actual radica en que ofrece capacidades de comprension de video largo y multimodalidad general bajo licencia Apache 2.0, algo poco comun en modelos de esta categoria, lo que lo hace atractivo tanto para investigacion como para despliegues comerciales. Soporta ingles y chino, y se distribuye con pesos en safetensors para su uso con la libreria transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje con atencion cruzada (cross-attention) y XRoPE |
| Parametros totales | 11.336.371.208 (~11B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens (texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

MOSS-VL-Instruct-0708 se basa en una arquitectura vision-lenguaje de atencion cruzada que separa la codificacion visual del razonamiento linguistico. El modelo procesa imagenes, video y texto en un pipeline unificado, conectando los tokens de lenguaje con las representaciones visuales mediante capas de atencion cruzada. La configuracion incluye parche visual de tamano 16, parche temporal de 1, FPS de video por defecto de 1.0 y un maximo de 256 frames por video.

La innovacion tecnica central es XRoPE (Cross-attention Rotary Position Embedding), que proyecta tokens de texto y parches visuales en un espacio de coordenadas tridimensional definido por tiempo (t), altura (h) y anchura (w), proporcionando una representacion posicional consistente para imagenes y video. Ademas, para entradas de video el modelo inyecta marcas de tiempo absolutas junto a los frames muestreados, lo que permite razonar sobre orden de eventos, duracion, ritmo y localizacion temporal en lugar de depender solo del orden de los frames.

El checkpoint se obtiene mediante ajuste supervisado (SFT) sobre MOSS-VL-Base-0708, alineando el modelo base con instrucciones de usuario en tareas de imagen, video y texto. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO; estos datos deben consultarse en el informe tecnico (arXiv:2608.15045).

## Capacidades

- Comprension de imagenes: descripcion, reconocimiento visual fino y analisis de contenido.
- OCR y analisis de documentos: extraccion y parseo de texto en imagenes y documentos.
- Razonamiento visual: resolucion de tareas que combinan percepcion visual y razonamiento.
- Comprension de video de larga duracion: analisis de videos extensos con ventana de contexto de 256K tokens.
- Razonamiento temporal: orden de eventos, duracion, ritmo y localizacion de eventos a nivel de segundo.
- Reconocimiento de acciones en video.
- Seguimiento de instrucciones multimodal: alineado mediante SFT para tareas de imagen, video y texto.
- Capacidades multilingues: ingles y chino.
- Interaccion en streaming en tiempo real (segun la descripcion de la familia MOSS-VL).
- Generacion de texto condicionada por entrada multimodal (pipeline video-text-to-text).

## Casos de uso

- Analisis de video de vigilancia o monitorizacion: el modelo puede localizar eventos concretos a nivel de segundo gracias a la inyeccion de marcas de tiempo absolutas y a su contexto de 256K tokens, lo que permite resumir grabaciones largas y senalar momentos relevantes.
- Indexado y busqueda semantica de archivos audiovisuales: se puede usar para generar descripciones y metadatos de videos largos, alimentando un sistema de busqueda que recupere fragmentos por contenido, accion o evento temporal.
- Digitalizacion y parseo de documentos: con capacidades de OCR y analisis de documentos, resulta adecuado para extraer datos estructurados de facturas, formularios o escaneos en pipelines de back office.
- Moderacion de contenido visual: clasificacion y descripcion de imagenes y videos para detectar contenido no deseado, apoyandose en el reconocimiento visual fino y el razonamiento sobre el contenido.
- Asistentes de accesibilidad: generacion de descripciones detalladas de imagenes y videos para usuarios con discapacidad visual, incluyendo narracion de eventos y su orden temporal.
- Analisis de contenido deportivo o de entrenamiento: reconocimiento de acciones y razonamiento temporal para resumir jugadas, detectar momentos clave o evaluar secuencias de movimiento en video.
- Investigacion en vision-lenguaje: al publicarse junto a MOSS-VL-Base-0708 y bajo licencia Apache 2.0, sirve como base para fine-tuning y experimentacion academica en comprension de video e imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card menciona que las tablas detalladas de benchmarks de la release 0708 se mantendran en los recursos del proyecto MOSS-VL y remite a una figura de benchmark offline, pero no incluye cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 22-23 GB solo para los pesos (11.336 millones de parametros a 2 bytes), mas memoria adicional para el procesador visual, el cache KV y las activaciones; en la practica se recomienda al menos 40-48 GB para entradas de imagen y video con contexto amplio.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) y GPUs profesionales con 48 GB o mas para despliegues comodos con contexto largo.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB en BF16 sin cuantizacion; se requeriria cuantizacion (no documentada oficialmente) o reducir la resolucion y el numero de frames.
- Opciones de despliegue: la model card documenta el uso con transformers (AutoModelForCausalLM y AutoProcessor con trust_remote_code=True) y flash_attention_2. No se mencionan integraciones oficiales con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Idiomas |
|---|---|---|---|---|
| MOSS-VL-Instruct-0708 | ~11B | 256K | Apache 2.0 | en, zh |
| MOSS-VL-Instruct-0408 | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; como modelo entrenado con datos web, es probable que herede sesgos de esos datos, pero no se detallan.
- Riesgo de alucinacion: no se cuantifica en la model card; como todo modelo generativo multimodal, puede producir descripciones o respuestas no fundamentadas en la entrada.
- Limitaciones de idioma: solo se declaran soporte para ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- Limitaciones de contexto: aunque el contexto de texto es de 256K tokens, el video se muestrea a 1.0 FPS con un maximo de 256 frames por defecto, lo que limita la cobertura temporal efectiva de videos muy largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo requiere trust_remote_code=True, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar ese codigo antes de desplegarlo en produccion.
- Dependencia de la implementacion: el uso esta ligado a la API especifica del repositorio (offline_image_generate, offline_video_generate) y a flash_attention_2, lo que puede complicar la portabilidad a otros frameworks de inferencia.
- Madurez: la release 0708 es reciente y las tablas de benchmarks detalladas aun no estan publicadas, lo que dificulta una evaluacion previa rigurosa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Instruct-0708
- Checkpoint base: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Base-0708
- Checkpoint anterior: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Instruct-0408
- Informe tecnico (arXiv): https://arxiv.org/pdf/2608.15045
- Referencia arXiv adicional: arxiv:2606.07639
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-VL
- Web de MOSS AI: https://www.moss-ai.com/models/moss-vl
- Documentacion de la API: https://platform.moss.cn/en/docs/scenarios/image-video-understanding
- OpenMOSS: https://openmoss.ai/
