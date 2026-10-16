# ml-resources/AudioFly

## Resumen

AudioFly es un modelo de generacion de audio (efectos de sonido) a partir de descripciones textuales, desarrollado por iFLYTEK y publicado originalmente en ModelScope. El repositorio de HuggingFace analizado (`ml-resources/AudioFly`) es un espejo no oficial del modelo original, con la licencia Apache 2.0 sin modificar. Se trata de un modelo de difusion latente (Latent Diffusion Model) de aproximadamente 1.000 millones de parametros que sintetiza audio a una frecuencia de muestreo de 44,1 kHz.

El modelo resuelve el problema de la generacion de audio condicionada por texto (text-to-audio), cubriendo tanto escenarios de evento unico como de multiples eventos simultaneos. Segun la model card, el audio generado muestra una fuerte alineacion con el prompt de entrada y supera a modelos previos en el conjunto de datos AudioCaps.

Su relevancia actual radica en que mejora de forma notable las metricas de calidad sobre alternativas como Stable Audio Open, AudioLDM2 o AudioGen, manteniendo una licencia permisiva (Apache 2.0) y un tamano de parametros manejable para despliegue en infraestructura moderada. No obstante, debe tenerse en cuenta que el repositorio consultado es un espejo y no una publicacion oficial de los autores originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (LDM) |
| Parametros totales | 1.000 millones (aproximadamente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt textual de ejemplo esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint de PyTorch (`.ckpt`), cargado mediante `torch.load` |

Otros datos tecnicos: frecuencia de muestreo de salida de 44,1 kHz; guia de escala (CFG) recomendada de 3,5; pasos DDIM recomendados de 200; tamano del repositorio en HuggingFace de 8,3 GB.

## Arquitectura y entrenamiento

AudioFly emplea una arquitectura de difusion latente, el mismo paradigma que modelos como Stable Audio o AudioLDM. El proceso generativo opera en un espacio latente comprimido y utiliza muestreo DDIM para la fase de denoising, con una escala de guia libre de clasificador (CFG) que controla el grado de adherencia al prompt textual. La model card no detalla la estructura concreta del autoencoder latente, del codificador de texto ni del modulo de atencion cruzada.

En cuanto a los datos de entrenamiento, el modelo se entreno sobre un corpus "amplio y diverso" que combina conjuntos de datos de codigo abierto (AudioSet, AudioCaps y TUT) junto con datos internos propietarios. La model card no especifica el numero total de tokens ni de horas de audio, la composicion exacta del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO (poco habituales en modelos de difusion de audio). Como innovacion destacable, la informacion disponible unicamente resalta su rendimiento en escenarios de evento unico y multiple, sin detallar mecanismos tecnicos adicionales.

## Capacidades

- Generacion de efectos de sonido a partir de descripciones textuales en lenguaje natural.
- Sintesis de audio a 44,1 kHz, frecuencia superior a la de muchas alternativas previas (que suelen operar a 16 o 48 kHz).
- Manejo de escenarios de evento unico (por ejemplo, "vientos feroces aullan por el valle").
- Manejo de escenarios de multiples eventos simultaneos, reflejando con precision el contenido descrito.
- Fuerte alineacion prompt-audio, reflejada en la metrica CLAP.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta soporte multilingue explicito; los ejemplos y el entrenamiento se orientan al ingles.
- No se documentan capacidades de vision, audio de entrada (solo texto) ni modo de razonamiento explicito.

## Casos de uso

- Diseno de sonido para videojuegos: generar efectos de sonido a partir de descripciones textuales para prototipado rapido de assets, evitando busquedas en librerias o grabaciones especificas.
- Postproduccion audiovisual: crear ambientes y efectos puntuales bajo demanda (viento, pasos, impacto) directamente desde el guion o la nota de produccion.
- Prototipado en produccion musical y podcasts: obtener capas de efectos y ambientes de fondo coherentes con una descripcion textual antes de invertir en grabacion.
- Accesibilidad y audiodescripcion: generar efectos que acompanen a narraciones o contenido descriptivo para personas con discapacidad visual.
- Generacion de datasets sinteticos de audio: aumentar corpus de entrenamiento para otros modelos de clasificacion o deteccion de eventos sonoros, dado que la licencia Apache 2.0 permite uso comercial.
- Realidad aumentada y realidad virtual: producir ambientes sonoros dinamicos en funcion del contexto descrito por el sistema, sin necesidad de assets pregrabados.
- Investigacion en generacion de audio: servir como baseline o punto de comparacion en trabajos academicos sobre difusion latente aplicada a audio, gracias a sus metricas publicadas en AudioCaps.

## Benchmarks y rendimiento

Los resultados experimentales se reportan sobre el conjunto de datos AudioCaps. Para los modelos de referencia se reutilizaron las evaluaciones del paper de Stable Audio Open, siguiendo la misma metodologia.

| Modelo | FD (menor mejor) | KL (menor mejor) | CLAP (mayor mejor) |
|---|---|---|---|
| AudioLDM2-48kHz | 101,11 | 2,04 | 0,37 |
| AudioGen-medium | 186,53 | 1,42 | 0,45 |
| Stable Audio 1.0 | 103,66 | 2,89 | 0,24 |
| Stable Audio 2.0 | 110,62 | 2,70 | 0,23 |
| Stable Audio Open | 78,24 | 2,14 | 0,29 |
| AudioFly | 40,10 | 1,35 | 0,45 |

AudioFly obtiene el mejor valor en FD (40,10) y en KL (1,35), y empata con AudioGen-medium en el mejor CLAP (0,45). No se han publicado otras metricas (por ejemplo, MOS subjetivo) en la informacion disponible.

## Requisitos de hardware

- Parametros: aproximadamente 1.000 millones, lo que situa el modelo en el rango de modelos de difusion de audio de tamano medio.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de difusion latente de ~1.000 millones de parametros en precision FP16 suele requerir del orden de 4-8 GB de VRAM, aunque esta cifra no esta confirmada por el autor y debe validarse en la practica.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabe esperar compatibilidad con GPUs de consumo (por ejemplo, RTX 3090, RTX 4090) y con GPUs de datacenter (A100, H100).
- Capacidad en GPU de consumo: probable segun el tamano, pero no confirmado en la documentacion.
- Opciones de despliegue: el unico metodo documentado es la carga directa del checkpoint `.ckpt` mediante PyTorch y el pipeline propio del repositorio (`ldm.utils.util`, `instantiate_from_config`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas estan orientados a modelos de lenguaje y no a difusion de audio.
- Latencia y throughput: no disponibles. La configuracion recomendada usa 200 pasos DDIM con CFG 3,5, lo que sugiere un coste computacional de inferencia no trivial, aunque no se aportan tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencia de salida | FD (AudioCaps) | KL | CLAP | Licencia |
|---|---|---|---|---|---|---|
| AudioFly | ~1.000 M | 44,1 kHz | 40,10 | 1,35 | 0,45 | Apache 2.0 |
| Stable Audio Open | no disponible | 44,1 kHz | 78,24 | 2,14 | 0,29 | no disponible en la informacion |
| Stable Audio 2.0 | no disponible | 44,1 kHz | 110,62 | 2,70 | 0,23 | no disponible en la informacion |
| AudioLDM2-48kHz | no disponible | 48 kHz | 101,11 | 2,04 | 0,37 | no disponible en la informacion |
| AudioGen-medium | no disponible | no disponible | 186,53 | 1,42 | 0,45 | no disponible en la informacion |

Los datos de parametros, licencia y frecuencia de salida de los modelos comparados no estan disponibles en la informacion proporcionada, salvo en el caso de AudioFly. Las metricas de rendimiento proceden de la model card de AudioFly.

## Limitaciones y advertencias

- El repositorio de HuggingFace es un espejo no oficial (`ml-resources/AudioFly`), no una publicacion de los autores originales; esto puede implicar menor soporte, actualizaciones no garantizadas y trazabilidad limitada.
- No se documentan sesgos especificos, pero al entrenarse con datasets de audio de codigo abierto (AudioSet, AudioCaps, TUT) y datos internos propietarios, es probable que herede sesgos de representacion acustica presentes en dichos corpus.
- Riesgo de alucinacion acustica: el modelo puede generar eventos sonoros no descritos en el prompt o interpretar de forma incorrecta descripciones ambiguas; la model card no cuantifica este comportamiento.
- No se especifican los idiomas soportados; los ejemplos estan en ingles, por lo que el rendimiento con prompts en otros idiomas es desconocido.
- No se detalla la longitud maxima de audio generado ni la longitud de prompt admitida (contexto no disponible).
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre que se conserven los avisos de copyright y licencia y se documenten los cambios. Los datos de entrenamiento propietarios no se especifican, lo que puede plantear dudas sobre la procedencia de parte del corpus.
- La configuracion de inferencia (CFG 3,5 y 200 pasos DDIM) se marca como "no recomendado cambiar"; desviarse de ella puede degradar la calidad.
- No se documentan requisitos de hardware minimos ni limites de despliegue en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/ml-resources/AudioFly
- ModelScope (repositorio original): https://www.modelscope.cn/models/iflytek/AudioFly
- Paper de referencia para la metodologia de evaluacion (Stable Audio Open): https://arxiv.org/pdf/2407.14358
