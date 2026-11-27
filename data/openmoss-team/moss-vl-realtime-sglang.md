# OpenMOSS-Team/MOSS-VL-Realtime-SGLANG

## Resumen

MOSS-VL-Realtime-SGLANG es un paquete de compatibilidad publicado por OpenMOSS-Team que adapta el checkpoint multimodal en tiempo real MOSS-VL-Realtime al backend especializado SGLang-Omni, sobre Transformers 5.12.1. No se trata de un modelo reentrenado ni cuantizado: mantiene los cinco shards de pesos en BF16, el tokenizer y el vocabulario originales, y solo modifica la configuracion, el RoPE y las interfaces de generacion para que funcionen con la pila SGLang 0.5.16 / PyTorch 2.11.0.

El modelo resuelve un problema concreto: la comprension de video en streaming con generacion de texto incremental. A diferencia de los modelos vision-language clasicos, que procesan un video completo antes de responder, MOSS-VL-Realtime consume fotogramas de forma continua, permite formular preguntas en cualquier punto del flujo, interrumpe respuestas en curso, actualiza sus contestaciones cuando llega nueva evidencia visual y permanece en silencio cuando no hay informacion suficiente. La arquitectura separa la codificacion visual del razonamiento linguistico mediante cross-attention, con XRoPE (Cross-attention Rotary Position Embedding) para alinear parches visuales y texto en los ejes temporal, de altura y de anchura.

Con 11 336 371 208 parametros (11B) y una ventana de contexto de 256K, el modelo se situa en la gama media de los VLM, pero su propuesta diferencial es el modo de interaccion, no el tamano. Es relevante ahora porque cubre un nicho poco atendido en el ecosistema abierto: asistentes que observan video en directo y razonan sobre el orden y la duracion de los eventos con marcas de tiempo, algo que hasta hace poco solo ofrecian APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language con cross-attention entre encoder visual y decoder linguistico; XRoPE para alineacion espacio-temporal |
| Parametros totales | 11 336 371 208 (11B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K (configuracion de servicio recomendada: 131072) |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en BF16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (5 shards en BF16), con custom_code |
| Tamano del repositorio | 22,7 GB |
| Patch size visual / temporal | 16 / 1 |
| FPS de preprocesado por defecto | 1,0 (maximo 256 fotogramas muestreados en video offline) |
| Runtime | Transformers 5.12.1 + SGLang 0.5.16 + PyTorch 2.11.0 |
| Modelo base | OpenMOSS-Team/MOSS-VL-Realtime |

## Arquitectura y entrenamiento

MOSS-VL separa explicitamente la codificacion visual del razonamiento linguistico y los conecta mediante cross-attention. Los fotogramas llegan con marca de tiempo y se tokenizan en parches de 16x16 pixeles con patch temporal de 1, de modo que cada fotograma genera su propia secuencia de parches. XRoPE aplica rotaciones posicionales en tres dimensiones (tiempo, altura, anchura) tanto a las queries de texto como a las claves y valores visuales, lo que permite al modelo razonar sobre el orden y la duracion de los eventos y reutilizar KV visual cacheada sin volver a rotarla.

El paquete SGLANG no introduce cambios en los pesos ni en el entrenamiento: adapta el codigo de referencia a Transformers 5.12.1. Entre los ajustes documentados figuran la rotacion del RoPE de las queries de cross-attention en cada paso (incluida la reutilizacion de KV visual) y la reconstruccion de las frecuencias rotatorias visuales en FP32 sobre el dispositivo activo para gestionar la rematerializacion de buffers de Transformers 5.12.1. No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; el informe tecnico referenciado (arXiv 2608.15045) es la fuente para esos datos.

## Capacidades

- Comprension de video fotograma a fotograma de forma continua, con generacion de texto incremental en paralelo al flujo.
- Formulacion de preguntas en cualquier instante de la retransmision, con posibilidad de interrumpir una respuesta en curso.
- Silencio proactivo: el modelo emite el token `<|silence|>` cuando no procede responder o la evidencia es insuficiente.
- Actualizacion dinamica de respuestas a medida que llega nueva informacion visual.
- Razonamiento consciente de marcas de tiempo: orden de eventos y duracion.
- Comprension de imagen estatica ademas de video.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a ingles y chino.
- Gestion de tokens de control de protocolo (`<|silence|>`, `<|round_start|>`, `<|round_end|>`) que la aplicacion debe interpretar.
- Modo thinking explicito, vision o audio adicionales: no disponible en la informacion proporcionada (ASR, TTS y memoria los aporta la demo, no el modelo).

## Casos de uso

- Vigilancia y monitorizacion de video en directo: el modelo procesa el flujo a 1 FPS por defecto y puede emitir alertas textuales cuando detecta un evento relevante, permaneciendo en silencio el resto del tiempo gracias al token `<|silence|>`. Adecuado por su bajo coste de generacion cuando no hay nada que reportar.
- Asistencia remota en directo: un tecnico retransmite video desde el movil y el modelo responde a preguntas puntuales sobre lo que aparece en pantalla, actualizando su respuesta si la camara enfoca otra zona. La ventana de 256K permite mantener contexto de sesiones largas.
- Analisis deportivo con marcas de tiempo: al razonar sobre el orden y la duracion de los eventos, puede generar resumenes anotados temporalmente de un partido o una carrera a partir del streaming.
- Accesibilidad para personas con discapacidad visual: descripcion incremental de un video en directo, con interrupcion y actualizacion de la descripcion cuando cambia la escena.
- Moderacion de contenido en emisiones en vivo: evaluacion continua de fotogramas con respuesta solo ante infracciones, integrable en un servicio SGLang-Omni con capacidad de sesiones configurable.
- Robotica y sistemas embebidos con vision: el modelo puede consumir el flujo de una camara y emitir instrucciones textuales de alto nivel; su naturaleza de 11B en BF16 permite desplegarlo en una GPU de datacenter cercana al robot.
- Analisis de reuniones y clases grabadas: aunque el foco es el streaming, el muestreo offline de hasta 256 fotogramas permite procesar video grabado y generar actas con referencias temporales.
- Integracion en pipelines de agentes con memoria de sesion: la demo adjunta aporta memoria acotada a la sesion (se conserva en reconexiones dentro del periodo de gracia y se borra al cierre definitivo), lo que habilita asistentes conversacionales sobre video con historial a corto plazo.

## Benchmarks y rendimiento

La model card incluye una figura de benchmarks de streaming (`assets/benchmark-streaming.png`) y remite al informe tecnico para los resultados de investigacion, pero no presenta cifras numericas en texto. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 suman aproximadamente 22,7 GB, por lo que se necesita un minimo de ~24 GB solo para los pesos, mas KV cache y buffers de activacion. Con contexto de servicio de 131072 y concurrencia superior a uno, el requisito crece de forma significativa; no se dispone de cifras oficiales de VRAM total.
- GPU recomendadas: no se especifican en la informacion disponible. Por el perfil de memoria, se requiere como minimo una GPU de 24 GB (RTX 4090, L4) para una sesion unica, y GPUs de datacenter (A100 80 GB, H100) para concurrencia y contexto largo.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) para una sola sesion en BF16, aunque sin margen para contexto extendido. No hay confirmacion oficial ni opciones de cuantizacion publicadas.
- Opciones de despliegue: Transformers 5.12.1 con el codigo custom del repositorio (una sesion realtime activa por instancia de modelo) o el backend SGLang-Omni especializado (capacidad de sesiones configurable segun memoria de GPU). No se documentan soportes de llama.cpp, Ollama ni TGI.
- Latencia y throughput: dependen de hardware, tasa de fotogramas, transporte y ajustes de decodificacion, segun el autor; no se publican valores concretos.
- Nota de compatibilidad: el paquete usa Transformers 5.12.1, SGLang 0.5.16 y PyTorch 2.11.0. La compatibilidad CUDA no implica soporte NPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-VL-Realtime-SGLANG | 11B | 256K | Video en streaming, silencio proactivo, respuestas actualizables | Apache-2.0 | Hugging Face + backend SGLang-Omni |
| MOSS-VL-Realtime | 11B | 256K | Mismo modelo, implementacion de referencia con Transformers 4.57 | Apache-2.0 | Hugging Face |
| MOSS-VL-Instruct | No disponible | No disponible | Instrucciones multimodales offline | No disponible en la informacion | Hugging Face |
| MOSS-VL-Base | No disponible | No disponible | Preentrenamiento y fine-tuning | No disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de modelos de terceros (por ejemplo, otros VLM de ~11B con soporte de video) en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa con alternativas externas.

## Limitaciones y advertencias

- La latencia de respuesta depende de hardware, tasa de fotogramas, transporte y configuracion de decodificacion; no hay garantias de tiempo real estricto.
- El runtime Python directo y el servicio SGLang-Omni tienen comportamientos distintos de sesion y de backpressure: una integracion validada en uno no se traslada automaticamente al otro.
- El descarte de fotogramas y las ventanas de KV visual limitan el historial visible; superar el limite de contexto exige gestion de memoria a nivel de aplicacion.
- El contexto de 256K no es una asignacion de memoria garantizada por sesion; se recomienda configurar 131072 y ajustar concurrencia a la VRAM disponible.
- La aplicacion debe gestionar explicitamente los tokens de control `<|silence|>`, `<|round_start|>` y `<|round_end|>`; ignorarlos rompe el protocolo de turnos.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- No se detallan sesgos conocidos ni tasas de alucinacion en la informacion disponible; al ser un modelo de comprension visual en tiempo real, existe riesgo de respuestas erroneas ante evidencia ambigua o frames descartados.
- No se debe mezclar el codigo custom de MOSS-VL-Realtime (Transformers 4.57) con este paquete; hay que emparejar versiones de modelo y backend.
- El repositorio contiene pesos, configuracion, tokenizer, processor y codigo custom, pero no un servicio en ejecucion; hay que descargar el repositorio completo, no archivos de pesos sueltos.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las dependencias del backend SGLang-Omni y de la demo (ASR, TTS, memoria) por si tienen condiciones distintas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Realtime-SGLANG
- Modelo base (implementacion de referencia): https://huggingface.co/OpenMOSS-Team/MOSS-VL-Realtime
- Commit de referencia con el fix de RoPE en cross-attention: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Realtime/commit/1e6a45b292eeaf02aa733bd3aa7b6c85214ddc86
- MOSS-VL-Instruct: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Instruct
- MOSS-VL-Base: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Base
- Pagina del modelo en MOSS AI: https://www.moss-ai.com/models/moss-vl-realtime
- Documentacion de la API MOSS (escenario VL realtime): https://platform.moss.cn/en/docs/scenarios/vl-realtime
- Demo de interaccion video/voz: https://github.com/fnlp-vision/MOSS-VL-Realtime_Demo#quick-start
- Backend de inferencia en streaming: https://github.com/fnlp-vision/sglang-omni-realtime#installation
- Repositorio de la familia MOSS-VL: https://github.com/OpenMOSS/MOSS-VL
- Informe tecnico: https://arxiv.org/abs/2608.15045
- Referencia adicional citada en los tags: https://arxiv.org/abs/2606.07639
- Ejemplos de inferencia directa con Transformers: ./inference.md (incluido en el repositorio)
