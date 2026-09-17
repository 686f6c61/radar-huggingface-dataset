# annotehrushi/whisper-large-v3-turbo-hindi

## Resumen

Whisper large-v3-turbo-hindi es un ajuste fino mediante LoRA del modelo de reconocimiento automático de voz openai/whisper-large-v3-turbo, publicado por el usuario annotehrushi en HuggingFace. El objetivo es mejorar la transcripción de hindi (hi-IN) sin reentrenar el modelo completo: se congela la base y se entrenan únicamente 27,8 millones de parámetros (3,33% del total) mediante adaptadores de bajo rango aplicados a las proyecciones de atención y a las capas feed-forward. El resultado declarado es una reducción del error de palabra (OIWER) del 37,98% al 22,16% en el conjunto de evaluación Monsoon hi-IN, es decir, 15,82 puntos porcentuales menos (un 41,7% de mejora relativa).

El modelo mantiene la arquitectura encoder-decoder original de Whisper, con 808.878.080 parámetros totales, entrada de audio en ventanas de 30 segundos y un vocabulario multilingüe. Al partir de la variante "turbo", el decodificador tiene solo 4 capas en lugar de las 32 de large-v3, lo que reduce considerablemente el coste de decodificación a cambio de una pérdida mínima de precisión. El repositorio ocupa 1,6 GB y los pesos están en formato safetensors, con compatibilidad declarada con transformers e Inference Endpoints.

Su relevancia ahora es doble. Por un lado, es un ejemplo reproducible de adaptación de bajo coste (aproximadamente 2,5 horas en una NVIDIA A10G y unos 15 dólares) para lenguas con recursos limitados. Por otro, ilustra un compromiso real: la mejora en hindi específico del dominio conlleva una degradación medible en otras lenguas y dominios (FLEURS Hindi empeora 2,36 puntos), algo que conviene tener en cuenta antes de desplegarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), adaptado con LoRA |
| Parametros totales | 808.878.080 (809 M) |
| Parametros activos | No aplica (no es MoE); 27,8 M entrenables durante el ajuste fino (3,33%) |
| Longitud de contexto | Ventanas de audio de 30 segundos (entrada); secuencia de texto de hasta 448 tokens en el decodificador; sin contexto de audio largo nativo |
| Tipos de cuantizacion | No especificados por el autor; al ser un Whisper estandar son aplicables fp16/bf16, int8 y cuantizaciones GGML/GGUF de whisper.cpp, pero no estan documentadas en la ficha |
| Idiomas soportados | Hindi (hi) e ingles (en) declarados; el modelo base cubre 99 idiomas, aunque este ajuste no los preserva por igual |
| Licencia | No disponible en la informacion proporcionada; el modelo base openai/whisper-large-v3-turbo se distribuye bajo licencia MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 1,6 GB |
| Tipo de tarea | automatic-speech-recognition |
| Modelo base | openai/whisper-large-v3-turbo |

## Arquitectura y entrenamiento

La base es Whisper large-v3-turbo, un transformer encoder-decoder con 809 M de parámetros que procesa audio remuestreado a 16 kHz convertido en espectrogramas mel de 128 bandas, segmentado en ventanas de 30 segundos. La variante turbo reduce el decodificador a 4 capas (frente a las 32 de large-v3), lo que acelera la decodificación sin cambiar el encoder ni el vocabulario multilingüe. Sobre esa base se aplicó LoRA con rango 32, alpha 64 y dropout 0,05 sobre los módulos q_proj, k_proj, v_proj, out_proj, fc1 y fc2, congelando el resto de los pesos.

El entrenamiento usó aproximadamente 5,8 horas de audio del split de entrenamiento de Monsoon hi-IN, con 3 épocas (729 pasos totales), learning rate 1e-4 con scheduler coseno y 500 pasos de calentamiento, sobre una única NVIDIA A10G de 24 GB. La receta completa costó unas 2,5 horas y alrededor de 15 dólares. La model card defiende que la separación estructural de LoRA (base congelada más adaptadores de bajo rango) actúa como salvaguarda natural contra el olvido catastrófico, y aporta una verificación con degradación relativa inferior al 10% en inglés. No se documentan técnicas adicionales como decodificación especulativa, atención lineal o destilación.

## Capacidades

- Transcripción de voz a texto en hindi (hi) e inglés (en), con salida de texto plano y marcas de tiempo a nivel de segmento propias de Whisper.
- Reconocimiento de habla continua en ventanas de 30 segundos, con procesamiento por troceado para audio de mayor duración.
- Identificación implícita del idioma de entrada, ya que el modelo base es multilingüe y el ajuste no elimina esa cabeza.
- Mejora específica en hindi indio conversacional o espontáneo, el dominio representado por el conjunto Monsoon.
- Rendimiento notable en inglés indio: el WER en Monsoon en-IN baja del 6,33% al 4,51% tras el ajuste.
- Uso como modelo de inferencia estándar en transformers con `WhisperForConditionalGeneration` y `WhisperProcessor`, incluyendo ajuste explícito de `language` y `task` en la configuración de generación.
- No hay soporte declarado de tool calling, function calling, agentes, multi-step reasoning, visión, audio generation ni modo de razonamiento extendido: es exclusivamente un modelo ASR.

## Casos de uso

- Subtitulado y transcripción de vídeo en hindi: el modelo convierte pistas de audio de 30 segundos en texto con marcas de tiempo de segmento, integrable en pipelines de postproducción con `faster-whisper` o `whisper.cpp`; conviene revisión humana dado el OIWER del 22,16%.
- Analítica de centros de contacto en hindi: transcripción masiva de grabaciones de llamadas para extraer motivos de contacto, palabras clave y métricas de calidad; es adecuado porque el dominio conversacional coincide con el conjunto de entrenamiento, aunque el error de palabra sigue siendo alto.
- Asistentes de voz embebidos o locales para hindi: al ocupar menos de 2 GB en fp16, puede ejecutarse en GPU de consumo o incluso en CPU con cuantización int8, lo que permite dictado y comandos por voz sin enviar audio a la nube.
- Indexación y búsqueda de contenido en hindi: transcripción de podcasts, archivos de radio y repositorios de vídeo para construir índices de texto buscables, aprovechando el bajo coste de decodificación de la variante turbo.
- Generación de datos de entrenamiento para ASR en hindi: uso del modelo como etiquetador automático de audio no anotado y posterior filtrado por confianza, práctica habitual para ampliar corpus de lenguas con pocos recursos.
- Transcripción de audio bilingüe hindi-inglés en contextos indios: el ajuste también mejora el inglés indio (4,51% de WER en Monsoon en-IN), por lo que resulta útil en entornos con code-switching frecuente entre ambas lenguas.
- Investigación en adaptación eficiente: sirve como caso de estudio reproducible de LoRA sobre un modelo grande de voz, con receta, hiperparámetros y coste documentados para replicar el proceso en otras lenguas.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card y en el model-index del repositorio (no verificados por terceros; el campo `verified` del model-index es `false`).

| Benchmark | Modelo base | Fine-tuned | Delta |
|---|---|---|---|
| Monsoon hi-IN (OIWER) | 37,98% | 22,16% | -15,82 pp (-41,7% relativo) |
| LibriSpeech Clean (WER) | 3,70% | 3,94% | +0,24 pp |
| FLEURS English (WER) | 4,86% | 5,31% | +0,45 pp |
| FLEURS Hindi (WER) | 32,58% | 34,94% | +2,36 pp |
| Monsoon en-IN (WER) | 6,33% | 4,51% | -1,82 pp (mejora) |

El model-index oficial registra un único resultado: tarea automatic-speech-recognition, conjunto VoiceArena/MonsoonASR-Open-ASR-leaderboard-hi-IN (split test), metrica wer con nombre OIWER y valor 22,16. No se han publicado otros benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en fp16/bf16: aproximadamente 1,6 GB, coherente con el tamano del repositorio (1,6 GB) y los 809 M de parametros.
- VRAM estimada para inferencia: entre 2 y 4 GB en fp16 contando activaciones; alrededor de 1 GB en int8 con CTranslate2; por debajo de 1 GB con cuantizaciones GGML de 4 o 5 bits.
- Cabe en GPU de consumo sin problema: RTX 3060 12 GB, RTX 4060 8 GB, RTX 3050 8 GB, e incluso tarjetas de 4 GB en cuantizacion int8.
- Para entrenamiento con LoRA el autor uso una NVIDIA A10G de 24 GB; un ajuste equivalente es viable en GPUs de 16-24 GB (RTX 4090, RTX A4000, L4).
- Opciones de despliegue: transformers (ruta oficial documentada), CTranslate2/faster-whisper, whisper.cpp con conversion a GGML/GGUF, y HuggingFace Inference Endpoints (el repositorio esta marcado como `endpoints_compatible`). No se documenta integracion con vLLM ni TGI.
- Latencia y throughput: no disponible. Como referencia arquitectonica, la variante turbo reduce el decodificador a 4 capas frente a las 32 de large-v3, lo que acelera la generacion, pero no se aportan medidas concretas para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Rendimiento en Monsoon hi-IN |
|---|---|---|---|---|---|
| annotehrushi/whisper-large-v3-turbo-hindi | 809 M | 30 s por ventana | hi, en (optimizado) | No disponible | OIWER 22,16% (declarado por el autor) |
| openai/whisper-large-v3-turbo | 809 M | 30 s por ventana | 99 idiomas | MIT | OIWER 37,98% (linea base reportada por el autor) |
| openai/whisper-large-v3 | 1.550 M | 30 s por ventana | 99 idiomas | MIT | No disponible |
| Modelos ASR especificos para hindi de terceros (por ejemplo, ajustes de Whisper de ai4bharat o vasista22) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de resultados comparativos verificados con alternativas especializadas en hindi dentro de la informacion proporcionada; la unica comparacion numerica disponible es la del autor frente a su propio modelo base.

## Limitaciones y advertencias

- El OIWER del 22,16% en el conjunto objetivo sigue siendo un error elevado para transcripcion literal sin supervision: es previsible que una de cada cinco palabras presente errores en hindi espontaneo.
- Degradacion fuera de dominio: en FLEURS Hindi el WER empeora 2,36 puntos (de 32,58% a 34,94%), lo que indica que la mejora esta ligada al dominio de Monsoon y no se generaliza automaticamente a otros corpus de hindi.
- Ligero olvido en ingles: LibriSpeech Clean pasa de 3,70% a 3,94% y FLEURS English de 4,86% a 5,31%. La afirmacion de la model card de una degradacion relativa inferior al 10% es correcta, pero implica que el modelo ya no es equivalente al base en tareas multilingues generales.
- Entrenamiento con solo unas 5,8 horas de audio y 3 epocas: riesgo de sobreajuste al dominio y de cobertura insuficiente de acentos, ruido de fondo, habla infantil o terminologia tecnica.
- Datos no verificados: el model-index marca el resultado como no verificado, y el modelo acumula 15 descargas y 0 likes, por lo que no existe validacion independiente de la comunidad.
- Licencia no declarada en el repositorio: aunque el modelo base es MIT, la ausencia de licencia explicita en este ajuste genera incertidumbre legal para uso comercial. Conviene aclararlo con el autor antes de integrarlo en producto.
- Riesgo de alucinacion tipico de Whisper ante silencios, musica o ruido: puede generar texto plausible inexistente en segmentos sin habla.
- Limitacion estructural de contexto: al trabajar en ventanas de 30 segundos, el audio largo requiere troceado, con posibles errores en las fronteras y sin coherencia global entre segmentos.
- El modelo no realiza diarizacion de hablantes ni traduccion declarada de forma explicita; la funcion de traduccion del modelo base no ha sido evaluada tras el ajuste.
- No hay resultados publicados de latencia, throughput ni comportamiento en cuantizacion, por lo que las estimaciones de despliegue deben validarse con pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/annotehrushi/whisper-large-v3-turbo-hindi
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Conjunto de datos de evaluacion: https://huggingface.co/datasets/VoiceArena/MonsoonASR-Open-ASR-leaderboard-hi-IN
- Paper de la arquitectura Whisper (Robust Speech Recognition via Large-Scale Weak Supervision): https://arxiv.org/abs/2212.04356
- Paper de LoRA (Low-Rank Adaptation of Large Language Models): https://arxiv.org/abs/2106.09685
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a paginas del traductor DeepL y no guardan relacion con esta ficha.
