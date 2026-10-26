# BSC-LT/whisper-large-v3-LoS

## Resumen

whisper-large-v3-LoS es un sistema de reconocimiento automático del habla (ASR) desarrollado por el Barcelona Supercomputing Center – Language Technologies (BSC-LT) mediante *fine-tuning* de `openai/whisper-large-v3` sobre datos de las cuatro lenguas principales del Estado: castellano, catalán, gallego y euskera (LoS, *Languages of Spain*). El objetivo es cubrir un hueco habitual en los modelos multilingües genéricos, que rinden de forma desigual en lenguas con menor representación y en variedades dialectales, especialmente en catalán (central, valenciano, balear) y en euskera.

El modelo se ha entrenado sobre 8.110 horas de audio preprocesado, con el número de horas igualado entre las cuatro lenguas para evitar que el castellano dominase el ajuste. Para el euskera se aplicó *speed perturbation* (factores 0,9× y 1,1×), con un total de 2.027 h 56 min 11 s, que sirvió de referencia para equilibrar el resto de idiomas. La combinación de datos incluye corpus institucionales y parlamentarios (3CatParla, Parlament-Parla-v3, Corts Valencianes, IB3), Common Voice 17 y corpus de castellano como ciempiess, CHM150, TEDx, LibriVox y Wikipedia.

Arquitectura y tamaño son los heredados del modelo base (transformer encoder-decoder de ~1.550 M de parámetros, entradas de 30 s), por lo que no introduce innovaciones estructurales: el valor está en el ajuste supervisado y en la cobertura lingüística. La licencia Apache 2.0 y el formato estándar de `transformers` facilitan su integración en producción, aunque la model card no publica todavía cifras de WER verificadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de tipo Whisper (modelo base `openai/whisper-large-v3`); entrada log-mel de 128 bandas en ventanas de 30 s |
| Parámetros totales | ~1.550 M (heredados del modelo base; no declarados explícitamente en la model card) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 30 s de audio por ventana de inferencia; longitud máxima de decodificación del decoder del modelo base (no declarada en la model card) |
| Tipos de cuantización | No disponible en la model card; el repositorio se distribuye en safetensors (18,5 GB), convertible a fp16, int8 e int4 con herramientas externas |
| Idiomas soportados | Castellano (es), catalán (ca), gallego (gl) y euskera (eu). La etiqueta `language` del repositorio solo declara `ca` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `transformers`, `WhisperForConditionalGeneration`) |

## Arquitectura y entrenamiento

El modelo reutiliza íntegramente la topología Whisper large-v3: un encoder que procesa espectrogramas log-mel de 128 bandas sobre ventanas de 30 segundos y un decoder autorregresivo que genera tokens de texto con marcas de tiempo, idioma y tarea. Al ser un *fine-tuning* completo (no un adaptador), los pesos del repositorio son un checkpoint autónomo de ~18,5 GB, coherente con pesos en fp32 más artefactos de entrenamiento. No se documentan cambios en el vocabulario, en el tokenizador ni en el esquema de atención respecto al modelo original.

El corpus de entrenamiento suma 8.110 horas preprocesadas con el objetivo de transcripciones legibles y consistentes lingüísticamente. En catalán se emplearon 3CatParla, Parlament-Parla-v3 (versión no anonimizada), Corts Valencianes (versión no anonimizada), IB3 y el benchmark Common Voice ca 17 con acentos; en castellano, los subconjuntos ciempiess (light, fem, complementary, balance), CHM150, TEDx Spanish, LibriVox Spanish y Wikipedia Spanish. El equilibrio entre lenguas se fijó a partir de las 2.027 h 56 min 11 s de euskera tras aplicar *speed perturbation* a 0,9× y 1,1× sobre cada fichero. La model card no indica si hubo RLHF, DPO ni una etapa de refinamiento con pseudo-etiquetado.

## Capacidades

- Transcripción de voz a texto en castellano, catalán, gallego y euskera con un único checkpoint.
- Detección automáticade idioma y tarea (transcripción vs. traducción al inglés) mediante los tokens de control de Whisper.
- Generación de marcas de tiempo a nivel de segmento, explotables para subtitulado y alineamiento.
- Robustez ante ruido y variación de canal razonable para un modelo ajustado con audio parlamentario, radiofónico y de corpus de lectura.
- Manejo de audio de hasta 30 s por ventana; para grabaciones largas se requiere segmentación previa (VAD) o *chunking* con solapamiento.
- Inferencia batch sobre datasets de HuggingFace (`datasets` + `transformers`), tal como muestra el ejemplo oficial.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No procesa vídeo, imagen ni audio más allá de la transcripción; no incluye diarización de hablantes.

## Casos de uso

- Subtitulado de televisión y radio autonómica: el ajuste con 3CatParla e IB3 lo hace adecuado para generar subtítulos en catalán sobre emisiones en directo o diferido, segmentando con VAD en trozos de 30 s y usando las marcas de tiempo para el sincronizado.
- Actas parlamentarias y administrativas: entrenado con Parlament-Parla-v3 y Corts Valencianes, permite transcribir sesiones plenarias en catalán y castellano para generar el acta provisional, con revisión humana posterior.
- Atención al cliente por voz en catalán: como front-end ASR en un pipeline de IVR, transcribe la consulta del usuario y la pasa a un LLM para resolverla; el Apache 2.0 permite despliegue on-premise sin coste por licencia.
- Documentación clínica y legal dictada: transcripción de dictados en castellano con vocabulario técnico, usando los corpus ciempiess como referencia de dominio y un post-procesado de normalización.
- Accesibilidad y transcripción de reuniones: generación de actas en entornos multilingües del Estado (castellano/catalán/gallego/euskera) a partir de audio de sala, con detección de idioma por segmento.
- Investigación lingüística y evaluación de variedades: el modelo sirve como referencia para medir WER por acento (central, valenciano, balear) usando el benchmark Common Voice ca con acentos del Projecte AINA.
- Archivística y memoria oral: digitalización de fondos sonoros (entrevistas, LibriVox, TEDx) con transcripción automática y búsqueda posterior sobre el texto indexado.

## Benchmarks y rendimiento

La model card declara una entrada de `model-index` para Common Voice 17.0 (test, `language=ca`) con métrica WER, pero **el valor está vacío y marcado como no verificado**. No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Conjunto de evaluación | Métrica | Resultado | Estado |
|---|---|---|---|---|
| Mozilla Common Voice 17.0 (test, ca) | `mozilla-foundation/common_voice_17_0` | WER | No disponible (valor nulo) | Declarado por el autor, no verificado |
| Parlament-Parla (test) | `projecte-aina/parlament_parla` | WER | 0,96 según un comentario del ejemplo de código de la model card | No confirmado: el snippet no aclara unidad ni conjunto exacto |

## Requisitos de hardware

- VRAM estimada para inferencia: ~6,2 GB en fp32, ~3,1 GB en fp16 y ~1,6 GB en int8, solo para pesos; el consumo real crece con el batch y con la caché del decoder.
- GPU recomendadas: A100 40/80 GB o H100 para procesado masivo por lotes; L40S, A10G o RTX 4090 para servicio en tiempo real con fp16.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) y en RTX 4080/A5000 (16 GB) con fp16; en 8 GB (RTX 3070/4060 Ti) solo con cuantización int8 o mediante `whisper.cpp`/CTranslate2.
- Opciones de despliegue: `transformers` con `WhisperForConditionalGeneration` (ruta oficial documentada), `faster-whisper`/CTranslate2 para mayor throughput, `whisper.cpp` para CPU, `WhisperX` para alineamiento y diarización, y servidores tipo TGI/Triton con backend personalizado. vLLM no ofrece soporte nativo de Whisper en su pipeline estándar.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del backend, del lote y de la longitud de audio, con un límite estructural de 30 s por ventana.
- Almacenamiento: el repositorio ocupa 18,5 GB; una conversión a fp16 reduce el checkpoint a ~3,1 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | WER publicado |
|---|---|---|---|---|---|
| BSC-LT/whisper-large-v3-LoS | ~1.550 M | es, ca, gl, eu | 30 s por ventana | Apache 2.0 | No disponible |
| openai/whisper-large-v3 (base) | ~1.550 M | 99 idiomas | 30 s por ventana | Apache 2.0 | Métricas publicadas por OpenAI (no incluidas aquí) |
| projecte-aina/whisper-large-v3-ca-3catparla | ~1.550 M | ca (principalmente) | 30 s por ventana | No verificada en esta búsqueda | No disponible |
| openai/whisper-large-v3-turbo | ~809 M | multilingüe | 30 s por ventana | Apache 2.0 | No disponible en esta información |

La ventaja diferencial frente al modelo base es el ajuste específico a las cuatro lenguas del Estado con datos institucionales; frente al modelo del Projecte AINA, cubre además castellano, gallego y euskera en un solo checkpoint. Como contrapartida, no hay cifras públicas que permitan cuantificar la mejora.

## Limitaciones y advertencias

- No se publican cifras de WER verificadas: la entrada de `model-index` para Common Voice 17 tiene el valor vacío, por lo que la calidad real debe medirse antes de adoptarlo en producción.
- No hay información demográfica de los hablantes de los corpus de entrenamiento; pueden existir sesgos derivados del contenido institucional (registro parlamentario y formal sobrerrepresentado).
- Riesgo de alucinación típico de Whisper en silencios, ruido o música: puede generar texto plausible sin correspondencia con el audio; se recomienda VAD y umbrales de confianza (`no_speech_prob`, `avg_logprob`).
- La etiqueta `language` del repositorio solo declara `ca`, aunque el modelo se entrenó con cuatro lenguas; conviene forzar el idioma en `generate()` para evitar detecciones erróneas.
- Ventana máxima de 30 s: audios largos exigen segmentación con solapamiento, lo que puede introducir errores en las fronteras y duplicar texto.
- Variedades dialectales del catalán (valenciano, balear) están cubiertas por los corpus de Corts Valencianes e IB3, pero no se documenta el rendimiento por variedad.
- Algunos corpus catalanes se entrenaron en versión no anonimizada mientras la versión pública está anonimizada, lo que impide reproducir exactamente el entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar el aviso de licencia y no implica garantía alguna por parte del BSC.
- No incluye diarización ni separación de hablantes; para reunionística hay que combinar con herramientas externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BSC-LT/whisper-large-v3-LoS
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Cuaderno de ejemplo (Colab): https://colab.research.google.com/drive/1MHiPrffNTwiyWeUyMQvSdSbfkef_8aJC?usp=sharing
- Dataset 3CatParla: https://huggingface.co/datasets/projecte-aina/3catparla_asr
- Dataset Parlament-Parla v3: https://huggingface.co/datasets/projecte-aina/parlament_parla_v3
- Dataset Corts Valencianes: https://huggingface.co/datasets/projecte-aina/corts_valencianes_asr_a
- Dataset IB3 (ca): https://huggingface.co/datasets/projecte-aina/ib3_ca_asr
- Benchmark Common Voice catalán con acentos: https://huggingface.co/datasets/projecte-aina/commonvoice_benchmark_catalan_accents
- Corpus ciempiess light: https://huggingface.co/datasets/ciempiess/ciempiess_light
- Corpus ciempiess fem: https://huggingface.co/datasets/ciempiess/ciempiess_fem
- Corpus ciempiess complementary: https://huggingface.co/datasets/ciempiess/ciempiess_complementary
- Corpus ciempiess balance: https://huggingface.co/datasets/ciempiess/ciempiess_balance
- Dataset CHM150: https://huggingface.co/datasets/carlosdanielhernandezmena/chm150_asr
- Dataset TEDx Spanish: https://huggingface.co/datasets/ciempiess/tedx_spanish
- Dataset LibriVox Spanish: https://huggingface.co/datasets/ciempiess/librivox_spanish
- Modelo de referencia del Projecte AINA citado en la model card: https://huggingface.co/projecte-aina/whisper-large-v3-ca-3catparla
- Nota: los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo (devuelven páginas sobre titulaciones BSc y resultados de fútbol), por lo que no se han incorporado datos de esas fuentes.
