# JASON-LUO-1/whisper-small.en

## Resumen

whisper-small.en es un checkpoint de reconocimiento automático del habla (ASR) de la familia Whisper, desarrollado originalmente por OpenAI y publicado en el paper *Robust Speech Recognition via Large-Scale Weak Supervision* (Radford et al., 2022). Este repositorio concreto es una réplica alojada por el usuario JASON-LUO-1 en Hugging Face, con licencia Apache 2.0 y pesos en safetensors, PyTorch, TensorFlow y JAX.

El modelo es un transformer encoder-decoder de tipo secuencia-a-secuencia con 241,7 millones de parámetros, entrenado exclusivamente con datos en inglés sobre 680.000 horas de audio etiquetado mediante supervisión débil a gran escala. Su principal valor es la capacidad de generalizar a dominios y datasets sin fine-tuning, algo poco habitual en sistemas ASR entrenados de forma supervisada tradicional.

Es relevante ahora porque sigue siendo una de las referencias ligeras para transcripción en inglés en entornos con recursos limitados: cabe en GPU de consumo, se integra con el ecosistema Transformers y sirve como base para fine-tuning en dominios específicos. No obstante, al ser una réplica sin métricas verificadas, conviene contrastar su comportamiento con el checkpoint oficial `openai/whisper-small.en`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (secuencia a secuencia) |
| Parametros totales | 241.734.144 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento en Whisper) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (solo ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, PyTorch, TensorFlow, JAX |

## Arquitectura y entrenamiento

Whisper es un transformer encoder-decoder. El encoder procesa espectrogramas log-Mel de 80 canales calculados sobre ventanas de 30 segundos de audio, y el decoder genera tokens de texto de forma autorregresiva. El modelo emplea tokens especiales para marcar tarea (transcripcion o traduccion), idioma y marcas temporales, lo que permite un control fino de la salida mediante el `WhisperProcessor`.

El entrenamiento se realizo sobre 680.000 horas de audio etiquetado con supervisión débil a gran escala, sin fine-tuning posterior sobre los datasets de evaluación. Esta variante `.en` se entreno solo con datos en ingles y unicamente para la tarea de reconocimiento del habla (no traduccion). La informacion disponible no detalla el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; el modelo se sirve con decodificacion autorregresiva estandar y opcion de marcas temporales.

## Capacidades

- Reconocimiento automatico del habla en ingles a partir de audio (16 kHz), devolviendo transcripcion con o sin marcas temporales.
- Robustez ante ruido y dominios diversos gracias al entrenamiento con supervision debil a gran escala.
- Generacion de marcas temporales a nivel de segmento mediante tokens especiales.
- Procesamiento por ventanas de 30 segundos con concatenacion de segmentos para audios largos.
- Integracion nativa con `WhisperProcessor` y `WhisperForConditionalGeneration` de Transformers.
- No soporta traduccion (solo transcripcion en ingles), vision, audio generativo ni tool calling.
- No dispone de modo de razonamiento explicito ni capacidades de agente.

## Casos de uso

- Transcripcion de reuniones y entrevistas en ingles: el modelo procesa audio en ventanas de 30 s y permite concatenar segmentos con marcas temporales para generar actas o resúmenes posteriores.
- Subtitulado automatico de video en ingles: la salida con timestamps facilita la generacion de ficheros SRT para plataformas de contenido.
- Fine-tuning en dominios especificos (medico, legal, call centers) en ingles: al ser un checkpoint pequeno (241 M parametros) y con licencia Apache 2.0, es viable reentrenarlo con datasets propios en una sola GPU.
- Prototipado rapido de pipelines ASR: su integracion con Transformers y su tamano permiten iterar en local sin infraestructura dedicada.
- Transcripcion en dispositivos con recursos limitados: cuantizado, puede ejecutarse en CPU o GPU de consumo para aplicaciones de dictado o accesibilidad.
- Generacion de datasets de texto a partir de audio en ingles: util para construir corpus etiquetados en proyectos de investigacion.
- Verificacion de calidad de audio o deteccion de contenido: la transcripcion sirve como paso previo en pipelines de moderacion o analitica de voz.

## Benchmarks y rendimiento

Los datos de la model card declaran evaluaciones en LibriSpeech clean y other (split test, ingles), pero los valores de WER aparecen como `null` y no verificados. No se han publicado resultados numericos de benchmarks en la informacion disponible.

| Dataset | Metrica | Valor | Verificado |
|---|---|---|---|
| LibriSpeech (clean), test | Test WER | no disponible | no |
| LibriSpeech (other), test | Test WER | no disponible | no |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1 GB para los pesos (241 M parametros) mas overhead de activaciones y espectrogramas; en fp16 aproximadamente la mitad.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090, A100 o H100; el modelo no aprovecha GPUs de gama alta por su tamano reducido.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en CPU para cargas moderadas.
- Opciones de despliegue: Transformers (PyTorch, TensorFlow, JAX), llama.cpp no aplica (no es un modelo de lenguaje), vLLM no soporta ASR de forma nativa, TGI no esta orientado a este tipo de modelo; alternativas habituales son `faster-whisper`, `whisper.cpp` y `openai-whisper`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JASON-LUO-1/whisper-small.en | 241,7 M | en | 30 s por segmento | apache-2.0 | Hugging Face (replica) |
| openai/whisper-small.en | 244 M | en | 30 s por segmento | apache-2.0 | Hugging Face (oficial) |
| openai/whisper-small | 244 M | multilingue | 30 s por segmento | apache-2.0 | Hugging Face (oficial) |
| openai/whisper-medium.en | 769 M | en | 30 s por segmento | apache-2.0 | Hugging Face (oficial) |

La diferencia principal frente al checkpoint oficial es la procedencia: esta replica no aporta metricas verificadas ni garantias de equivalencia con `openai/whisper-small.en`. Frente a `whisper-medium.en`, este modelo es mas ligero y rapido, a costa de menor precision esperada; frente a la variante multilingue, pierde traduccion y cobertura de idiomas.

## Limitaciones y advertencias

- Solo admite ingles; no transcribe ni traduce otros idiomas.
- Riesgo de alucinacion en audio con ruido, silencios largos o habla solapada, comun en modelos Whisper.
- Sesgos derivados del corpus de entrenamiento (680k horas de fuentes diversas), con posible infrarepresentacion de acentos y variedades no estandar.
- Ventana de audio de 30 segundos por segmento; audios largos requieren segmentacion y concatenacion, lo que puede introducir errores en los bordes.
- Al ser una replica no oficial, no hay garantia de que los pesos coincidan exactamente con el checkpoint original de OpenAI ni de que las metricas declaradas sean validas.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo original y citar el paper de OpenAI.
- No dispone de soporte para tool calling, agentes ni razonamiento multi-paso; su uso en produccion debe limitarse a transcripcion.

## Enlaces

- Hugging Face: https://huggingface.co/JASON-LUO-1/whisper-small.en
- Checkpoint oficial: https://huggingface.co/openai/whisper-small.en
- Paper: https://arxiv.org/abs/2212.04356
- Repositorio original: https://github.com/openai/whisper
- Documentacion de Transformers: https://huggingface.co/docs/transformers/model_doc/whisper
- Dataset LibriSpeech: https://huggingface.co/datasets/librispeech_asr
- Listado de checkpoints Whisper: https://huggingface.co/models?search=openai/whisper
