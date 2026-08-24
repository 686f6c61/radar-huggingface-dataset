# iljab/omniASR-CTC-3B-v2

## Resumen

omniASR-CTC-3B-v2 es un modelo de reconocimiento automático del habla (ASR) basado en la arquitectura wav2vec2, convertido por el usuario iljab a partir del checkpoint oficial de Meta `omniASR-CTC-3B-v2.pt`. Forma parte de la familia Omnilingual ASR de Meta, diseñada para transcribir audio en más de 1600 idiomas, incluyendo lenguas con escasos recursos que nunca antes habían tenido cobertura ASR. El modelo emplea una cabeza CTC (Connectionist Temporal Classification) que permite una decodificación rápida y eficiente, adecuada para aplicaciones en tiempo real y de alto rendimiento.

Con 3.081.401.008 parámetros (aproximadamente 3,08 mil millones), este modelo ofrece un equilibrio entre precisión y velocidad de inferencia. Su arquitectura de 60 capas encoder con tamaño oculto de 2048 y 16 cabezas de atención lo sitúa en la gama alta de los modelos ASR de código abierto. La licencia Apache-2.0 permite uso comercial sin restricciones, y su formato safetensors facilita la integración con el ecosistema HuggingFace Transformers. Aunque el modelo original de Meta soporta más de 1600 idiomas, la ficha de esta conversión no especifica la lista exacta de lenguas, por lo que se asume la cobertura del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (encoder transformer con cabeza CTC) |
| Parametros totales | 3.081.401.008 (3,08 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (depende de la duracion del audio de entrada) |
| Tipos de cuantizacion | no especificados en la ficha; compatible con cuantizacion estandar de Transformers (fp16, int8) |
| Idiomas soportados | mas de 1600 segun el modelo original de Meta; lista no disponible en esta conversion |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 12,3 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec2, un encoder transformer preentrenado de forma autosupervisada sobre audio sin etiquetar, al que se añade una cabeza de clasificacion CTC para la tarea de reconocimiento de voz. En esta variante, el encoder consta de 60 capas, con dimension oculta de 2048, 16 cabezas de atencion y una red feed-forward intermedia de 8192 unidades. El vocabulario de salida tiene 10288 tokens, con el token `<s>` (id 0) reservado como blank de CTC. El modelo fue entrenado por Meta AI dentro del proyecto Omnilingual ASR, que combina datos de miles de idiomas y tecnicas de zero-shot learning para ampliar la cobertura a lenguas sin apenas datos etiquetados. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO; la ficha solo indica que el checkpoint proviene del entrenamiento oficial de Meta.

## Capacidades

- Reconocimiento de voz automatico (ASR) de audio a texto, con soporte para mas de 1600 idiomas segun el modelo original.
- Decodificacion CTC rapida, optimizada para transcripcion en tiempo real y escenarios de alto rendimiento.
- Compatible con el pipeline `automatic-speech-recognition` de HuggingFace Transformers, lo que facilita su integracion en aplicaciones existentes.
- No incluye capacidades de tool calling, agentes, vision ni generacion de texto libre; es exclusivamente un modelo de transcripcion.
- Soporte multilingue amplio, aunque la lista exacta de idiomas no se detalla en esta conversion.
- Al ser un modelo wav2vec2, puede adaptarse a dominios especificos mediante fine-tuning con datos propios.

## Casos de uso

- Transcripcion de reuniones y videollamadas: el modelo puede convertir audio de conferencias en texto en tiempo real, gracias a su arquitectura CTC de baja latencia, facilitando actas y busquedas posteriores.
- Subtitulado automatico de videos: integrable en pipelines de postproduccion para generar subtitulos en multiples idiomas, aprovechando su cobertura de 1600+ lenguas.
- Asistentes de voz y comandos por voz: su rapida inferencia permite su uso en dispositivos edge o servidores para reconocer ordenes habladas en aplicaciones de domotica o movilidad.
- Archivo y busqueda de contenido audiovisual: transcripcion de podcasts, archivos de radio o material de archivo para indexacion y busqueda por texto.
- Traduccion asistida por voz: combinado con un modelo de traduccion, puede servir como primer paso en un sistema de interpretacion automatica.
- Investigacion linguistica y documentacion de lenguas en peligro: su capacidad para trabajar con idiomas poco representados facilita la creacion de corpus transcritos para estudios academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original de Meta (facebook/omniASR-CTC-3B) incluye metricas en su model card, pero esta conversion no las reproduce. Se recomienda consultar la documentacion oficial de Meta para datos de WER (Word Error Rate) en distintos idiomas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,08 mil millones de parametros, en precision FP16 se requieren aproximadamente 6,2 GB solo para los pesos, mas memoria para activaciones y audio de entrada. Se estima un minimo de 8-10 GB de VRAM para inferencia basica.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) o superior para comodidad; tambien puede ejecutarse en A100/H100 para despliegues a gran escala.
- En GPU de consumo: cabe en tarjetas con 12 GB o mas si se usa cuantizacion a 8 bits (int8) o 4 bits, aunque no se proporcionan cuantizaciones oficiales.
- Opciones de despliegue: compatible con la libreria Transformers de HuggingFace, por lo que puede servirse con TGI (Text Generation Inference) o vLLM, aunque estos estan orientados a modelos de lenguaje; para ASR se recomienda usar pipelines de Transformers o servidores dedicados como Faster-Whisper (si se adapta) o implementaciones propias con ONNX.
- Latencia y throughput: no disponibles; al ser un modelo CTC, la velocidad de inferencia es significativamente mayor que la de modelos autoregresivos como Whisper, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Arquitectura | Contexto |
|---|---|---|---|---|---|
| omniASR-CTC-3B-v2 (este) | 3,08 B | 1600+ (segun original) | Apache-2.0 | Wav2Vec2 + CTC | no disponible |
| facebook/omniASR-CTC-1B | 1 B | 1600+ | Apache-2.0 | Wav2Vec2 + CTC | no disponible |
| OpenAI Whisper large-v3 | 1,55 B | 99 | MIT | Transformer autoregresivo | 30 segundos de audio |

La comparativa se basa en datos publicos de los modelos originales. Whisper es la alternativa mas conocida, pero con menor cobertura de idiomas y mayor latencia por su decodificacion autoregresiva. El modelo de 1B de la misma familia ofrece menor precision pero mayor velocidad. No se dispone de datos de rendimiento para una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datos de multiples idiomas, puede presentar un rendimiento desigual entre lenguas, con peores resultados en idiomas con menos datos de entrenamiento.
- Riesgo de alucinacion: como todo sistema ASR, puede producir transcripciones erroneas, especialmente en audio con ruido, acentos no representados o solapamiento de hablantes.
- Limitaciones de contexto: al ser un modelo CTC, no maneja contexto de audio mas alla de la ventana de entrada; para transcripciones largas se requiere segmentacion previa.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones, pero se debe atribuir la autoría y mantener el aviso de licencia.
- Caveat para produccion: la ficha no especifica la lista de idiomas soportados en esta conversion; es recomendable verificar el rendimiento en el idioma objetivo antes de desplegar.
- El modelo no incluye capacidades de puntuacion o normalizacion de texto; puede requerir post-procesamiento adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/iljab/omniASR-CTC-3B-v2
- Modelo original de Meta: https://huggingface.co/facebook/omniASR-CTC-3B
- Version 1B de Meta: https://huggingface.co/facebook/omniASR-CTC-1B
- Repositorio GitHub de Omnilingual ASR: https://github.com/facebookresearch/omnilingual-asr
- Documentacion tecnica de los modelos CTC: https://deepwiki.com/facebookresearch/omnilingual-asr/2.2.2-ctc-models-(fast-asr)
- Articulo sobre el modelo en Modelers: https://aichina.news/blog/metas-omniasr-ctc-3b-a-3-billion-parameter-asr-model-now-on-modelers-ll3ftf/
