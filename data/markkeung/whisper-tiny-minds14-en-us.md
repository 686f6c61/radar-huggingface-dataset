# markkeung/whisper-tiny-minds14-en-us

## Resumen

whisper-tiny-minds14-en-us es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-tiny, desarrollado por el usuario markkeung y publicado en Hugging Face. El modelo parte de la arquitectura transformer encoder-decoder de Whisper en su variante "tiny", con 37,76 millones de parametros, y se ha entrenado especificamente sobre el subconjunto en ingles estadounidense del dataset PolyAI/minds14, un corpus de grabaciones de dominio telefonico para sistemas de atencion al cliente.

El problema que aborda es la adaptacion de un modelo ASR generico a un dominio concreto con caracteristicas acusticas particulares (audio telefonico, ruido de canal, habla espontanea). El ajuste fino permite mejorar la transcripcion en ese dominio especifico a costa de perder generalidad respecto al modelo base. El resultado declarado por el autor es un WER de 0,3241 sobre el conjunto de evaluacion, un valor alto en terminos absolutos pero coherente con el tamano reducido del modelo y la dificultad del corpus.

La relevancia de esta ficha es principalmente como ejemplo de ajuste fino de bajo coste: entrena en 5 epocas con 280 pasos totales y produce un checkpoint de unos 0,5 GB, lo que lo hace desplegable en hardware muy modesto. No obstante, sus prestaciones estan lejos de los modelos ASR de produccion actuales, por lo que debe considerarse un experimento o una base para futuros ajustes mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper trabaja con ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible (el ajuste se realiza sobre el subconjunto en-US de minds14) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con atencion multi-cabeza estandar, entrenado originalmente por OpenAI para transcripcion y traduccion de voz. Whisper procesa audio en ventanas de 30 segundos convertidas a espectrogramas log-Mel, y genera texto de forma autoregresiva. La variante tiny es la mas pequena de la familia y cuenta con 37,76 millones de parametros.

El ajuste fino se realizo sobre el dataset PolyAI/minds14, restringido al subconjunto en ingles estadounidense. Los hiperparametros declarados en la model card son: learning rate de 1e-5, batch size de 8 (tanto en entrenamiento como en evaluacion), semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 50 pasos de warmup, 5 epocas y precision mixta nativa (AMP). El entrenamiento completo consta de 280 pasos. No se documenta el numero exacto de horas de audio ni la composicion detallada del split utilizado, y la model card indica explicitamente "More information needed" en las secciones de descripcion, usos previstos y datos de entrenamiento.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles estadounidense de dominio telefonico, segun el corpus de ajuste.
- Transcripcion de audio mono con la pipeline `automatic-speech-recognition` de transformers.
- Compatible con los endpoints de Hugging Face (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta modo thinking, vision, audio generativo ni capacidades multimodales adicionales.
- Capacidades multilingues no disponibles: el modelo base es multilingue, pero el ajuste fino se ha realizado unicamente sobre el subconjunto en-US de minds14, por lo que el rendimiento en otros idiomas no esta garantizado ni evaluado.

## Casos de uso

- Transcripcion de llamadas de atencion al cliente en ingles estadounidense: el modelo se ha ajustado sobre minds14, un corpus precisamente de dominio telefonico, por lo que es adecuado para prototipos de transcripcion de grabaciones de call center con acustica similar.
- Prototipado rapido de pipelines ASR: con 0,5 GB de checkpoint y 37,76 M de parametros, permite montar un servicio de transcripcion en una maquina de desarrollo sin GPU dedicada y validar la integracion end-to-end antes de invertir en modelos mayores.
- Experimentos academicos de ajuste fino: sirve como referencia reproducible de fine-tuning de Whisper tiny con hiperparametros documentados (lr 1e-5, 5 epocas, AdamW), util para comparar estrategias de adaptacion al dominio.
- Clasificacion y enrutamiento de llamadas: transcribiendo el audio entrante se puede alimentar un clasificador de intenciones o un sistema de tickets; el modelo es suficientemente ligero para ejecutarse en el mismo nodo que el resto del pipeline.
- Generacion de subtitulos en entornos con recursos limitados: para contenido en ingles estadounidense con calidad de audio telefónica o de baja fidelidad, el modelo puede producir subtitulos aproximados que luego se revisan manualmente.
- Base para ajustes posteriores: al ser un checkpoint pequeno y con licencia Apache 2.0, es un punto de partida comodo para fine-tunings adicionales sobre dominios especificos sin incurrir en costes elevados de computo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| WER (evaluation set) | 0,3241 |
| WER ortho (evaluation set) | 0,3362 |
| Loss (evaluation set) | 0,4744 |

Evolucion durante el entrenamiento segun la model card:

| Epoca | Paso | Validation loss | WER | WER ortho |
|---|---|---|---|---|
| 1,7857 | 100 | 0,4791 | 0,3595 | 0,3732 |
| 3,5714 | 200 | 0,4744 | 0,3241 | 0,3362 |
| 5,0 | 280 | 0,4832 | 0,3335 | 0,3473 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos sobre el mismo split, ni metricas adicionales (por ejemplo, sobre otros subconjuntos de minds14 o sobre benchmarks ASR estandar como LibriSpeech).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 37,76 M de parametros; en la practica, el cuello de botella es el buffer de audio y el runtime de PyTorch, no el modelo.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers con la pipeline `automatic-speech-recognition`, despliegue via Hugging Face Inference Endpoints (tag `endpoints_compatible`), y exportacion a otros runtimes no documentada en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera que la latencia este dominada por el preprocesado de audio y la generacion autoregresiva, no por el coste computacional de los pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| markkeung/whisper-tiny-minds14-en-us | 37,76 M | ventanas de 30 s | 0,3241 (minds14 en-US) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny (base) | 37,76 M | ventanas de 30 s | no disponible en la informacion | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74,4 M | ventanas de 30 s | no disponible en la informacion | Apache 2.0 | Hugging Face |

La comparacion directa con el modelo base no es posible con los datos disponibles, ya que la model card no reporta el WER de openai/whisper-tiny sobre el mismo split de minds14. Cualquier afirmacion sobre la mejora obtenida por el ajuste fino requeriria una evaluacion propia.

## Limitaciones y advertencias

- WER de 0,3241 en el conjunto de evaluacion: es un valor alto en terminos absolutos y sugiere una calidad de transcripcion limitada para uso en produccion sin revision humana.
- El modelo esta ajustado unicamente sobre el subconjunto en ingles estadounidense de minds14; su comportamiento en otros idiomas, acentos o dominios acusticos no esta evaluado y probablemente degrade respecto al modelo base.
- La model card no documenta sesgos conocidos, riesgos de alucinacion especificos ni limitaciones de contexto; se recomienda evaluar sobre datos propios antes de cualquier despliegue.
- Riesgo de alucinacion inherente a los modelos ASR generativos: Whisper puede producir texto plausible que no corresponde al audio, especialmente con ruido o silencios.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento ni sobre el cumplimiento normativo en aplicaciones sensibles (por ejemplo, transcripcion de datos personales).
- El checkpoint se genero con versiones muy recientes de las librerias (Transformers 5.22.1, PyTorch 2.11.0, Datasets 5.1.0, Tokenizers 0.23.3); la compatibilidad con versiones anteriores de transformers no esta garantizada.
- El modelo tiene 27 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/markkeung/whisper-tiny-minds14-en-us
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de ajuste: https://huggingface.co/datasets/PolyAI/minds14
