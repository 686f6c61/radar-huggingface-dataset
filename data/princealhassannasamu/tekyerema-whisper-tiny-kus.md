# PrinceAlhassanNasamu/tekyerema-whisper-tiny-kus

## Resumen

`tekyerema-whisper-tiny-kus` es un ajuste fino (fine-tuning) de `openai/whisper-tiny` para reconocimiento automatico del habla (ASR), publicado por el usuario de HuggingFace PrinceAlhassanNasamu. El modelo parte de la arquitectura encoder-decoder transformer de Whisper en su variante mas pequena y ha sido reentrenado durante 3 epocas sobre un dataset identificado unicamente como `generator` en la model card, sin mas detalles sobre su composicion, tamano o procedencia. El sufijo `kus` del identificador coincide con el codigo ISO 639-3 del kusaal, una lengua gur hablada en el norte de Ghana y en Burkina Faso, aunque la model card no confirma explicitamente el idioma objetivo.

El interes de esta ficha es doble. Por un lado, es un ejemplo tipico de adaptacion de un modelo ASR multilingue preentrenado a una lengua de bajos recursos, un flujo de trabajo cada vez mas comun para comunidades linguisticas sin corpus ASR comerciales. Por otro, sus numeros son un recordatorio de las limitaciones reales de este enfoque: el autor declara un WER de 61,86 % en el conjunto de evaluacion, lo que significa que mas de la mitad de las palabras se transcriben incorrectamente. Se trata, por tanto, de un artefacto de investigacion o de un punto de partida, no de un sistema listo para produccion.

El modelo tiene 37.760.640 parametros (pesos en safetensors, precision completa), un repositorio de 1,3 GB y licencia Apache 2.0, la misma que el modelo base. No registra descargas ni interacciones en el momento de redactar esta ficha, y no se ha publicado informacion adicional sobre datos de entrenamiento, idiomas soportados o usos previstos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny): 4 capas de encoder y 4 de decoder, `d_model` 384, 6 cabezas de atencion |
| Parametros totales | 37.760.640 (segun safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por inferencia; 1500 posiciones de encoder sobre el espectrograma mel y 448 posiciones maximas de decoder (heredadas de `openai/whisper-tiny`) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se declaran variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible en la model card; el identificador `kus` sugiere kusaal (ISO 639-3), sin confirmacion explicita del autor |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la de `openai/whisper-tiny` sin modificaciones estructurales: un encoder que consume espectrogramas mel logaritmicos de 80 canales calculados sobre ventanas de 30 segundos, y un decoder autorregresivo que genera tokens de texto con prefijos de tarea e idioma. Con 4 capas en cada torre y 384 dimensiones de modelo, es la variante mas pequena de la familia Whisper, disenada originalmente para inferencia en CPU y dispositivos con recursos limitados.

El ajuste fino se realizo con el `Trainer` de HuggingFace (Transformer 4.57.6, PyTorch 2.10.0+cu128, Datasets 5.0.0, Tokenizers 0.22.2) durante 3 epocas, 810 pasos totales, con AdamW fused (betas 0,9/0,999, epsilon 1e-8), learning rate 1e-4, scheduler lineal con 10 % de warmup, batch de 16 en entrenamiento y evaluacion, semilla 42 y precision mixta nativa (AMP). No se documenta el numero de horas de audio, la composicion del dataset `generator`, si hubo aumentacion de datos ni si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa. Tampoco se indica si el vocabulario de tokens se adapto al idioma objetivo o si se conservo el tokenizador original de Whisper (multilingue, 51865 tokens).

La unica innovacion reseñable respecto al modelo base es el propio ajuste fino sobre un corpus especifico, presumiblemente de habla kusaal, y el uso de AMP para el entrenamiento. La model card esta generada automaticamente por el `Trainer` y conserva los avisos de plantilla sin completar ("More information needed" en descripcion, usos previstos y datos de entrenamiento), por lo que no hay informacion sobre la procedencia de las transcripciones ni sobre el control de calidad de las mismas.

## Capacidades

- Transcripcion de voz a texto (ASR) en ventanas de hasta 30 segundos de audio, con la posibilidad de encadenar ventanas para audios mas largos mediante `pipeline("automatic-speech-recognition")` con `chunk_length_s`.
- Reconocimiento en el idioma objetivo del ajuste fino (presumiblemente kusaal), aunque el WER declarado del 61,86 % limita severamente la utilidad practica.
- Capacidad multilingue residual heredada del modelo base (Whisper tiny es multilingue y cubre alrededor de 96 idiomas), pero el ajuste fino sobre un corpus especifico puede haber degradado el rendimiento en otros idiomas; no hay evaluacion que lo cuantifique.
- Traduccion de voz a texto en ingles: Whisper soporta la tarea `translate` ademas de `transcribe`, aunque no se ha verificado su comportamiento tras el ajuste fino.
- Deteccion de actividad de voz y marcas temporales (timestamps) a nivel de segmento, disponibles en la implementacion de `transformers` si se solicitan.
- No se ha documentado soporte de tool calling, function calling, uso agentico, vision, audio de salida ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Investigacion en ASR de bajos recursos: sirve como linea base reproducible para medir mejoras frente a `openai/whisper-tiny` sin ajustar en kusaal. Al publicarse los hiperparametros completos y la curva de validacion por epoca, es util para comparar estrategias de ajuste fino (learning rate, epocas, aumentacion) en el mismo idioma.
- Preanotacion de corpus para anotacion humana: con un WER del 61,86 % no es apto para transcripcion final, pero puede generar una primera pasada que un hablante nativo corrija. En proyectos de documentacion linguistica, reducir el trabajo de tecleo a la mitad ya supone un ahorro relevante cuando no existen transcripciones previas.
- Prototipos de interfaz de voz offline en kusaal: al ocupar menos de 200 MB en precision completa, puede ejecutarse en un portatil o en una Raspberry Pi sin conexion, lo que permite validar interfaces de comandos por voz en comunidades con conectividad limitada.
- Experimentos de destilacion y adaptacion de dominio: es un punto de partida razonable para probar tecnicas como LoRA, adaptadores o ajuste con pseudoetiquetado sobre audios no etiquetados, dado su bajo coste computacional de entrenamiento.
- Demostraciones docentes de flujos de trabajo con `transformers`: el modelo es lo bastante pequeno para entrenarse e inferirse en una unica GPU consumer, lo que lo hace adecuado para talleres sobre ajuste fino de modelos de habla.
- Transferencia a lenguas gur relacionadas: los pesos ajustados pueden servir como inicializacion para idiomas vecinos (mampruli, dagbani, farefare) si se dispone de algunos minutos de audio etiquetado, aprovechando el vocabulario multilingue heredado de Whisper.
- Deteccion de palabras clave o wake words: si el objetivo se reduce a reconocer un conjunto cerrado de terminos frecuentes, el rendimiento util puede ser bastante mayor que el WER global sugiere, aunque no hay evaluacion especifica publicada.

## Benchmarks y rendimiento

Unico resultado declarado por el autor en el `model-index` de la model card (metrica `wer`, no verificada por terceros):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | `generator` (config `default`) | WER | 61,8646 % |
| Automatic Speech Recognition | `generator` (config `default`) | Loss de evaluacion | 1,1291 |

Evolucion durante el entrenamiento, segun la model card:

| Epoca | Paso | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 1,0 | 270 | 0,4282 | 1,2131 | 65,1206 % |
| 2,0 | 540 | 0,1893 | 1,1207 | 63,9728 % |
| 3,0 | 810 | 0,0918 | 1,1291 | 61,8646 % |

No hay resultados comparativos con MMLU, HumanEval, GSM8K ni con otros modelos ASR, dado que no son benchmarks aplicables a esta tarea. La divergencia entre la perdida de entrenamiento (que baja hasta 0,0918) y la de validacion (que se estanca alrededor de 1,12-1,21) indica sobreajuste a partir de la segunda epoca.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB con batch de 1 en fp32 (unos 151 MB de pesos mas las activaciones del encoder sobre 1500 posiciones); del orden de 2-4 GB con batch de 16 y audios de 30 segundos con padding completo.
- GPU recomendadas: cualquier GPU con mas de 2 GB de memoria sirve; una RTX 3060, RTX 4090, T4, A100 o H100 estan sobradamente dimensionadas. El modelo tambien funciona en CPU x86 y en ARM (Raspberry Pi 4/5) con latencias aceptables para audio corto.
- Cabe sin problema en GPU consumer: si, en practicamente cualquier GPU dedicada de los ultimos diez anos, e incluso en iGPU con memoria compartida.
- Opciones de despliegue: `transformers` con `pipeline("automatic-speech-recognition")` (via de referencia), servidores compatibles con la API de `transformers` (los tags incluyen `endpoints_compatible`), HuggingFace Inference Endpoints, y conversion manual a GGUF para `whisper.cpp` o `faster-whisper` (no se publican conversiones listas en el repositorio).
- Latencia y throughput: no disponible. No se han publicado mediciones de factor de tiempo real (RTF), latencia por segmento ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Licencia | Disponibilidad | Rendimiento en kusaal |
|---|---|---|---|---|---|
| `PrinceAlhassanNasamu/tekyerema-whisper-tiny-kus` | 37,76 M | 30 s | apache-2.0 | HuggingFace, safetensors | WER 61,86 % (dataset `generator`, declarado por el autor) |
| `openai/whisper-tiny` (modelo base) | 37,76 M | 30 s | apache-2.0 | HuggingFace, safetensors; conversiones GGUF muy extendidas | no disponible (no hay evaluacion publicada en kusaal) |
| `openai/whisper-base` | 74,4 M | 30 s | apache-2.0 | HuggingFace, safetensors | no disponible |
| `openai/whisper-small` | 244 M | 30 s | apache-2.0 | HuggingFace, safetensors | no disponible |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible: no existen resultados publicados de estos modelos sobre el mismo conjunto de evaluacion (`generator`), cuyo contenido ni siquiera esta descrito. Cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- Calidad de transcripcion muy baja: el WER declarado del 61,86 % implica que la mayoria de las palabras se reconocen mal. No es utilizable como sistema de transcripcion final sin revision humana.
- Sobreajuste: la perdida de validacion deja de mejorar tras la segunda epoca mientras la de entrenamiento sigue bajando, lo que sugiere un dataset pequeno y posible memorizacion.
- Dataset de entrenamiento no documentado: se desconoce el numero de horas, la diversidad de hablantes, la procedencia geografica, el dominio (lectura, conversacion, radio) y la calidad de las transcripciones. Esto impide evaluar el sesgo y la generalizacion.
- Idiomas soportados sin confirmar: la model card no declara idiomas. El codigo `kus` apunta a kusaal, pero no hay verificacion del autor. El ajuste fino pudo degradar el rendimiento multilingue original de Whisper tiny.
- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto plausible en silencios, ruido o segmentos ininteligibles, y repetir frases en bucle. El riesgo aumenta con la perdida de validacion observada.
- Sesgos previsibles: al derivar de Whisper tiny y ajustarse sobre un corpus no descrito, hereda los sesgos del preentrenamiento (sobrerrepresentacion del ingles y de variedades estandar) y puede tener un rendimiento desigual segun el sexo, la edad o el dialecto del hablante, sin que exista ninguna evaluacion desagregada.
- Licencia permisiva pero sin garantias: Apache 2.0 permite uso comercial y modificacion, pero el autor no ofrece ninguna garantia de funcionamiento ni soporte, y la model card esta sin completar.
- Ausencia de validacion externa: la metrica de la model card figura como `verified: false` en el `model-index`; ningun tercero ha reproducido el resultado.
- Cero traccion en la plataforma: 0 descargas y 0 likes en el momento de redactar la ficha, sin issues ni discusiones publicas que permitan contrastar experiencias de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PrinceAlhassanNasamu/tekyerema-whisper-tiny-kus
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (Radford et al., 2022, "Robust Speech Recognition via Large-Scale Weak Supervision"): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper de OpenAI: https://github.com/openai/whisper
- Documentacion de `transformers` para ASR: https://huggingface.co/docs/transformers/tasks/asr
- Nota: las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo; los unicos enlaces utiles son los anteriores.
