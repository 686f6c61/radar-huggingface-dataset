# Deep-07/whisper-small-hi-disfluency

## Resumen

Deep-07/whisper-small-hi-disfluency es un ajuste fino del modelo Whisper Small de OpenAI, publicado en Hugging Face por el usuario Deep-07. Por el identificador del repositorio (el sufijo `hi-disfluency`) y la pipeline declarada (`automatic-speech-recognition`), se trata de un modelo de reconocimiento automatico del habla orientado a transcribir audio en hindi, presumiblemente entrenado para manejar de forma robusta las disfluencias del habla espontanea (repeticiones, falsos arranques, muletillas). Esta orientacion lo diferencia de un Whisper Small generico, que tiende a "limpiar" ese ruido linguistico en la transcripcion.

La arquitectura subyacente es la de Whisper Small: un transformer encoder-decoder de tipo seq2seq con 241.734.912 parametros totales (dato real extraido de los pesos en safetensors), entrenado originalmente por OpenAI sobre 680.000 horas de audio supervisado debilmente y descrito en el paper arXiv:1910.09700. El repositorio ocupa 1,9 GB y se distribuye en formato safetensors para su uso con la libreria `transformers`.

La relevancia de esta ficha es limitada pero concreta: el modelo no dispone de model card sustantiva (es la plantilla autogenerada de Hugging Face, sin datos de entrenamiento, licencia ni evaluacion), no tiene descargas ni likes en el momento de la consulta, y su licencia e idiomas figuran como no disponibles. Debe tratarse, por tanto, como un checkpoint experimental de un autor individual, no como un modelo listo para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small, seq2seq audio-a-texto) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Whisper Small procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible; al ser safetensors, admite conversion a GGUF/ONNX por herramientas externas |
| Idiomas soportados | no disponible oficialmente; el identificador sugiere hindi (`hi`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |
| Pipeline | automatic-speech-recognition |
| Tamano del repositorio | 1,9 GB |
| Tags | transformers, safetensors, whisper, automatic-speech-recognition, arxiv:1910.09700, endpoints_compatible, region:us |

## Arquitectura y entrenamiento

La base es Whisper Small, un transformer encoder-decoder que recibe espectrogramas Mel logaritmicos de 80 canales calculados sobre ventanas de 30 segundos y genera tokens de texto de forma autorregresiva. El modelo original se entreno con supervision debil sobre 680.000 horas de audio multilingue y multitarea (transcripcion, traduccion e identificacion de idioma), segun el paper Whisper (arXiv:1910.09700). El checkpoint de 241,7 millones de parametros corresponde a la variante "small" de la familia.

Sobre el ajuste fino especifico no hay informacion: la model card es la plantilla autogenerada y no documenta dataset, numero de pasos, hiperparametros, regimen de precision ni si hubo entrenamiento especifico para disfluencias (por ejemplo, con etiquetas que preserven repeticiones y falsos arranques en lugar de normalizarlas). Tampoco se indica si hubo RLHF, DPO ni ninguna innovacion de decodificacion. Cualquier afirmacion sobre el proceso de entrenamiento mas alla de la arquitectura base seria especulativa.

## Capacidades

- Reconocimiento automatico del habla (ASR) en audio, con salida de texto transcrito.
- Transcripcion con preservacion potencial de disfluencias del habla espontanea, segun sugiere el nombre del modelo; no verificado por el autor en la model card.
- Procesamiento de audio en ventanas de 30 segundos, propio de la arquitectura Whisper.
- Soporte multilingue heredado de Whisper Small, aunque el ajuste probablemente lo especializa en hindi.
- Compatibilidad con la pipeline `automatic-speech-recognition` de `transformers` y con endpoints de Hugging Face (tag `endpoints_compatible`).
- Sin soporte documentado de tool calling, function calling, agentes, vision, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion de entrevistas y grupos focales en hindi: el modelo puede procesar grabaciones conversacionales donde los hablantes repiten palabras o se corrigen, y el ajuste a disfluencias sugiere que conservaria esas marcas en la transcripcion, utiles para analisis cualitativo.
- Generacion de subtitulos para contenido audiovisual informal: para videos de YouTube o redes con habla espontanea, un modelo sensible a disfluencias permite decidir despues si se limpian o se mantienen, en lugar de perder esa informacion en origen.
- Investigacion linguistica sobre habla espontanea: corpus de hindi conversacional donde la posicion de pausas, repeticiones y falsos arranques es objeto de estudio, no ruido a eliminar.
- Preprocesamiento de datos de voz para entrenamiento de otros modelos: transcripcion masiva de audio con preservacion de disfluencias para construir datasets etiquetados de ASR robusto.
- Prototipado rapido en entornos con recursos limitados: con 241,7 millones de parametros y 1,9 GB de pesos, cabe en una GPU de consumo y permite iterar sobre pipelines de ASR sin infraestructura dedicada.
- Transcripcion de reuniones y notas de voz en hindi: integrable via `transformers` o endpoints de Hugging Face en herramientas internas de actas y resumenes, aceptando la ventana de 30 segundos por segmento.
- Evaluacion comparativa de robustez frente a disfluencias: serviria como referencia en experimentos que midan cuanto degrada o mejora un ASR especializado frente a Whisper Small estandar en audio espontaneo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion con datos (WER, CER ni comparaciones), y el autor no documenta metricas de ningun tipo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1 GB para los pesos (241,7 millones de parametros), mas memoria para activaciones y buffers de audio; en la practica, 2-4 GB son suficientes.
- En fp16/bf16: aproximadamente 0,5 GB de pesos; el cuello de botella real es el procesamiento del espectrograma y el decoding, no los pesos.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, aunque las dos ultimas estan sobredimensionadas para este tamano.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650 (4 GB) y superiores; tambien puede ejecutarse en CPU con latencia mayor.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), endpoints de Hugging Face (tag `endpoints_compatible`), conversion a ONNX o GGUF mediante herramientas externas (no verificada por el autor), y servidores de inferencia compatibles con modelos Whisper.
- Latencia y throughput: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deep-07/whisper-small-hi-disfluency | 241,7 M | ventanas de 30 s (arquitectura Whisper) | no disponible (probable hindi) | no disponible | Hugging Face, 0 descargas |
| openai/whisper-small | 244 M | ventanas de 30 s | multilingue (99 idiomas) | MIT (checkpoint original de OpenAI) | Hugging Face, ampliamente usado |
| openai/whisper-small.en | 244 M | ventanas de 30 s | ingles | MIT | Hugging Face, ampliamente usado |
| whisper-small ajustado a hindi (otros checkpoints de la comunidad) | ~244 M | ventanas de 30 s | hindi | variable segun autor | Hugging Face, disponibilidad variable |

La comparacion con `openai/whisper-small` es la mas directa: mismo esqueleto y practicamente el mismo numero de parametros, pero el modelo de Deep-07 no documenta licencia, idiomas ni evaluacion, mientras que el original de OpenAI es MIT y esta profusamente evaluado. La ventaja teorica del ajuste es la preservacion de disfluencias en hindi, no verificada con metricas.

## Limitaciones y advertencias

- Model card autogenerada: no hay informacion sobre datos de entrenamiento, hiperparametros ni evaluacion, lo que impide auditar el modelo.
- Licencia no disponible: no puede asumirse uso comercial permitido; hay que contactar con el autor o tratar el modelo como no licenciado para produccion.
- Idiomas no declarados oficialmente: la especializacion en hindi es una inferencia del nombre del repositorio, no un dato confirmado.
- Riesgo de alucinacion propio de Whisper: el modelo puede inventar texto en segmentos con silencio, ruido o audio musical, y el ajuste a disfluencias podria amplificar este comportamiento si no se controla con umbrales de confianza.
- Ventana de 30 segundos: requiere segmentacion previa de audio largo, con riesgo de cortes en mitad de palabra si no se solapan segmentos.
- Sin descargas ni validacion de la comunidad: no hay evidencia externa de calidad; cualquier uso en produccion exige una evaluacion propia con WER/CER sobre el dominio objetivo.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no puede evaluarse el sesgo por acento, genero, edad o registro del habla.
- Fecha de creacion futura en los metadatos (2026-11-27): conviene verificar la integridad y procedencia del repositorio antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deep-07/whisper-small-hi-disfluency
- Paper de Whisper (referenciado en los tags): https://arxiv.org/abs/1910.09700
- Checkpoint base Whisper Small de OpenAI: https://huggingface.co/openai/whisper-small
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Documentacion de la pipeline ASR de transformers: https://huggingface.co/docs/transformers/main/en/main_classes/pipelines#transformers.AutomaticSpeechRecognitionPipeline
