# sampathlonka/svarupa_asr_0.6b_v1

## Resumen

Svarupa ASR 0.6B v1 es un modelo de reconocimiento automatico del habla (ASR) desarrollado por el usuario sampathlonka y publicado en HuggingFace. Se trata de un ajuste fino del modelo base de NVIDIA `nvidia/nemotron-3.5-asr-streaming-0.6b`, del que hereda la arquitectura FastConformer-Transducer (RNNT) con streaming cache-aware y aproximadamente 600 millones de parametros. Su especialidad es el hinglish, es decir, el cambio de codigo intra-oracional entre hindi y ingles, un fenomeno muy extendido en la conversacion real en la India y escasamente cubierto por los ASR genericos.

El modelo aborda un problema concreto: la transcripcion fiable de audio conversacional real (no locucion leida) con mezcla de idiomas, acentos regionales y acustica telefonica degradada. Para ello se ha entrenado con 2.945,4 horas de audio limpiado y 1.436.901 segmentos, procedentes de dominios como hindi formal, hinglish, telefonia rural (Vaani), ingles con acento indio, recitacion vedica y audio real de bots de voz de atencion al cliente. El resultado es un modelo de tamano contenido que cabe en GPU de consumo y que admite inferencia en streaming con un chunk de 160 ms.

Su relevancia actual radica en dos factores. Por un lado, la licencia Apache-2.0 permite uso comercial sin restricciones de royalties, algo poco habitual en modelos ASR de calidad para idiomas indios. Por otro, el enfoque cache-aware streaming lo hace apto para despliegues en tiempo real (subtitulado, voz sobre IP, asistentes de voz), no solo para transcripcion por lotes. Como contrapartida, los WER declarados en los dominios mas dificiles (telefonia rural, chatbot conversacional) siguen siendo elevados, y no existen resultados verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-Transducer (RNNT) con streaming cache-aware |
| Parametros totales | ~600 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en tokens; chunk de streaming de 160 ms con cache de contexto izquierdo |
| Tipos de cuantizacion | no disponible (la model card no publica versiones cuantizadas) |
| Idiomas soportados | Hindi (`hi`), ingles (`en`), hinglish (`hi-en` code-switching); el autor declara ademas 16+ dialectos regionales indios y dominio vedico/sanskrit en el entrenamiento |
| Licencia | apache-2.0 |
| Formato de pesos | `.nemo` (formato nativo de NVIDIA NeMo); no se anuncia GGUF ni safetensors |
| Frecuencia de muestreo | 16 kHz mono PCM |
| Tamano del repositorio | 5,1 GB |
| Modelo base | `nvidia/nemotron-3.5-asr-streaming-0.6b` |
| Libreria | NeMo |
| Decodificacion recomendada | Beam search con `beam_size=4`, `max_symbols=35`, `strategy="malsd_batch"`, `score_norm=True` |
| Fecha de creacion | 2026-09-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un FastConformer-Transducer, la variante convolucional-aumentada del Conformer que NVIDIA emplea en su familia NeMo. El decodificador es un RNNT (transducer) con atencion cache-aware, lo que permite procesar el audio por chunks de 160 ms manteniendo una cache de contexto izquierdo sin recalcular el historico completo. Esto habilita transcripcion en tiempo real con latencia baja y consumo de memoria acotado, a diferencia de los modelos de ventana completa tipo Whisper. El modelo opera a 16 kHz mono PCM y no se menciona el uso de un modelo de lenguaje externo para el rescoring.

El entrenamiento se realizo sobre una mezcla acustica multidominio de 2.945,4 horas limpiadas y 1.436.901 segmentos, con pesos de muestreo desiguales: hindi formal (1.320,2 h, 42%), hinglish code-switched (937,8 h, 35%), telefonia rural Vaani (480,5 h, 10%), ingles indio alineado a escritura devanagari (120,1 h, 4%), dominio vedico/sanskrit (76,2 h, 4%) y audio real de chatbot re-transcrito con Whisper-v3 (10,6 h, 5%). La estrategia de optimizacion fue multietapa: una fase inicial de aproximadamente 71.000-85.000 pasos sobre un corpus de 815.105 enunciados, seguida de una fase distribuida en 2 nodos (8 GPU H100) con batching dinamico por duracion de Lhotse (`batch_duration=240 s` por GPU, esto es, 480 s o 8 minutos de habla por paso). Esa segunda fase acumulo 20.000 pasos repartidos en tres runs: el run 5 (5.000 pasos) para consolidar el cambio de codigo, el run 6 (5.000 pasos) incorporando audio de chatbot limpiado con Whisper y el run 7 final (10.000 pasos, 9 epocas completas) con acustica de telefonia rural y pares sinteticos. En total se procesaron mas de 12.000 horas de audio acumuladas a lo largo de las pasadas de optimizacion. No se documenta el uso de RLHF ni de DPO, algo por otra parte esperable en un modelo ASR.

## Capacidades

- Transcripcion de voz a texto en hindi, ingles con acento indio y, de forma destacada, hinglish con cambio de codigo dentro de la misma frase.
- Reconocimiento en streaming con latencia de chunk de 160 ms y cache de contexto izquierdo, apto para audio en directo.
- Transcripcion por lotes (offline) del mismo modelo, cambiando la configuracion de decodificacion.
- Robustez declarada ante acustica telefonica de 8 kHz remuestreada a 16 kHz (dominio Vaani) y ante audio conversacional de bots de voz.
- Cobertura de mas de 16 dialectos regionales indios y de dominio vedico/sanskrit recitado, segun el autor.
- Alineacion de ingles indio con escritura devanagari, util para normalizacion de transcripciones.
- Tool calling / function calling: no aplica, es un modelo ASR puro, no un modelo de lenguaje.
- Agentes y razonamiento multi-paso: no aplica.
- Vision, audio-vision o generacion multimodal: no soportado; la unica modalidad de entrada es audio, y la salida es texto.
- Modo "thinking": no disponible.

## Casos de uso

- Transcripcion en tiempo real de centros de contacto en la India: el modelo esta ajustado especificamente sobre audio de bots de voz y conversacion hinglish, y su chunk de 160 ms permite alimentar analitica de llamada mientras esta ocurre, sin esperar al final de la conversacion.
- Subtitulado en directo de contenido en hindi e ingles indio: la decodificacion streaming evita la latencia de ventana completa de modelos tipo Whisper, lo que lo hace adecuado para emision en vivo.
- Voicebots e IVR en telefonia rural: al haberse entrenado con el corpus Vaani (480,5 h de telefonia rural remuestreada), es una opcion razonable para reconocer habla dialectal sobre canales de baja calidad, aunque con WER elevado (38,95% en Gramvaani) que obliga a disenar confirmaciones y fallbacks.
- Analitica y cumplimiento de llamadas: transcripcion masiva por lotes para clasificacion posterior de conversaciones, deteccion de palabras clave y auditoria, aprovechando el soporte nativo de hinglish donde los ASR genericos suelen degradarse.
- Accesibilidad y documentacion clinica o administrativa en hindi: dictado de informes y notas donde el hablante alterna terminologia tecnica en ingles con estructuras gramaticales en hindi.
- Asistentes de voz para comercio electronico y servicios financieros en India: reconocimiento de consultas habladas con nombres de producto en ingles enmarcados en frases en hindi.
- Archivado y transcripcion de material devocional: el modelo incluye 76,2 h de recitacion vedica y ceremonial, un nicho practicamente ausente en los ASR comerciales.
- Preprocesado de datos de voz a gran escala: generacion de transcripciones pseudo-etiquetadas sobre corpus propios, con la advertencia de que hereda los sesgos del dominio en el que fue ajustado.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo. Las cifras marcadas como no verificadas (`verified: false`) proceden del model-index y no han sido validadas por un tercero. Todas las evaluaciones se realizaron con normalizador v7 y decodificacion beam search con `beam_size=4`.

| Benchmark | Dominio | WER |
|---|---|---|
| Kathbath Hindi (AI4Bharat) | Hindi leido, crowdsourcing | 10,81% |
| FLEURS Hindi | Habla leida | 14,25% |
| Hinglish Code-Switched Val (`agarwalayushi/hinglish`) | Habla conversacional con cambio de codigo | 20,76% |
| Hindi formal (`val_hi`) | Locucion y dominio formal | 22,38% |
| Combined Evaluation | Verificacion mixta multidialecto | 23,34% |
| Curated Lahaja Multi-Dialect (AI4Bharat/lahaja) | 16+ dialectos regionales | 24,54% |
| Conversational Chatbot | Consultas reales de bot de voz | 30,11% |
| Gramvaani Rural Telephony | Audio telefonico ruidoso | 38,95% |

No se han publicado resultados comparativos frente a otros modelos ASR en la informacion disponible, ni valores de CER pese a que la metrica aparece declarada en los tags del repositorio.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del recuento de parametros (600 M) y del coste habitual de activaciones y cache de streaming en NeMo; la model card no publica requisitos oficiales.

- VRAM estimada en FP16/BF16: en torno a 1,5-3 GB, incluyendo pesos (~1,2 GB) mas activaciones y cache.
- VRAM estimada en INT8: en torno a 1-1,5 GB, si se aplica cuantizacion posterior al entrenamiento (no documentada por el autor).
- GPU recomendadas: cualquiera con 4 GB o mas de VRAM. Cabe holgadamente en RTX 3060, RTX 4060, RTX 4070, RTX 4090, L4, T4 y A10. En A100 y H100 sobra capacidad y el cuello de botella pasa a ser el ancho de banda de audio, no la memoria.
- GPU de consumo: si, cabe en practicamente cualquier GPU consumer moderna con 4 GB o mas. Incluso es viable en CPU para transcripcion por lotes, con throughput mucho menor.
- Opciones de despliegue: NeMo nativo mediante `ASRModel.restore_from()` (requiere `pip install nemo_toolkit['asr']`), NVIDIA Riva para el modelo base, y Triton Inference Server para servir el grafo exportado. No es compatible con llama.cpp ni Ollama, ya que no existen pesos GGUF de este modelo y esas herramientas estan orientadas a modelos de lenguaje y a la arquitectura Whisper, no a RNNT de NeMo.
- Latencia: el chunk de streaming declarado es de 160 ms con cache de contexto izquierdo. No se publica el factor de tiempo real (RTF) ni el throughput en horas de audio por hora de GPU.
- Memoria en disco: el repositorio ocupa 5,1 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Streaming | Idiomas | Licencia | WER en hindi |
|---|---|---|---|---|---|
| svarupa_asr_0.6b_v1 | ~600 M | Si, chunk 160 ms | hi, en, hinglish, dialectos indios | Apache-2.0 | 10,81% (Kathbath), 14,25% (FLEURS) |
| nvidia/nemotron-3.5-asr-streaming-0.6b (base) | no disponible explicitamente (familia 0.6B) | Si (cache-aware) | no disponible | no disponible | no disponible |
| openai/whisper-large-v3 | 1.550 M | No (ventana de 30 s) | ~99 idiomas | MIT | no disponible |
| openai/whisper-medium | 769 M | No (ventana de 30 s) | ~99 idiomas | MIT | no disponible |
| ai4bharat/indicconformer (familia) | no disponible | Si, variantes hibridas RNNT/CTC | 22 idiomas indios | no disponible | no disponible |

La comparacion se limita a parametros, tipo de licencia y capacidades arquitectonicas porque no se dispone de cifras de WER comparables publicadas en la misma informacion. La ventaja estructural de Svarupa frente a la familia Whisper es el streaming nativo (Whisper procesa ventanas de 30 s y requiere trucos de solapamiento para tiempo real) y la especializacion en hinglish; su desventaja es la cobertura idiomatica, muy inferior a la de Whisper, y la falta de validacion independiente.

## Limitaciones y advertencias

- Los WER en los dominios objetivo mas duros son altos: 38,95% en telefonia rural Gramvaani, 30,11% en conversacion de chatbot y 20,76% en hinglish. Esto implica que una de cada cinco palabras puede ser incorrecta en escenarios conversacionales reales.
- Los resultados del model-index estan marcados como no verificados (`verified: false`) y el modelo acumula 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- Riesgo de alucinacion: como todo modelo RNNT entrenado sobre audio re-transcrito con Whisper-v3, puede heredar errores sistematicos de esas pseudo-etiquetas y emitir texto plausible en tramos de silencio, ruido o habla ininteligible.
- Cobertura limitada de idiomas: solo hindi, ingles indio y hinglish. No se debe esperar un comportamiento correcto en castellano ni en otras lenguas no indias.
- Sesgo de dominio: el corpus esta muy cargado hacia hindi formal y hinglish (77% del peso de muestreo combinado). Los dialectos regionales tienen un peso marginal y el rendimiento cae de forma notable en ellos (24,54% en Lahaja, con casos peores).
- El dominio vedico/sanskrit representa solo el 4% del muestreo, por lo que su calidad fuera de los estilos de recitacion vistos en entrenamiento es incierta.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, pero conviene revisar la licencia del modelo base de NVIDIA antes de un despliegue comercial, ya que la model card no la detalla.
- No se documenta cuantizacion, exportacion a ONNX/TensorRT ni pesos GGUF, lo que limita las opciones de optimizacion y obliga a depender del ecosistema NeMo.
- El README esta truncado en la seccion de quickstart, por lo que las instrucciones de inferencia reproducibles son incompletas.
- La fecha de creacion del repositorio (2026-09-15) es posterior al momento habitual de consulta; conviene verificar la vigencia de los artefactos antes de integrarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sampathlonka/svarupa_asr_0.6b_v1
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Dataset Hinglish: https://huggingface.co/datasets/agarwalayushi/hinglish
- Dataset Kathbath: https://huggingface.co/datasets/AI4Bharat/kathbath
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Lahaja: https://huggingface.co/datasets/AI4Bharat/lahaja
- NVIDIA NeMo (repositorio y toolkit ASR): https://github.com/NVIDIA/NeMo
