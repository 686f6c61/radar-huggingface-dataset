# merkelmarrow/whisper-tiny-japanese_english-ft1

## Resumen

Whisper tiny Japanese English es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario merkelmarrow en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura Whisper de OpenAI, en su variante mas pequena, con 37,76 millones de parametros. El modelo ha sido entrenado sobre el dataset naharte/japanese_english, que segun la model card contiene audio en japones e ingles, aunque el campo de idiomas declarado en los metadatos solo incluye "en".

El modelo resuelve la tarea de transcripcion de audio a texto mediante la libreria transformers, y esta pensado como una prueba de concepto de ajuste fino sobre un modelo base muy ligero. Su relevancia es limitada: se trata de un experimento academico o personal con cero descargas y cero likes en el momento de la consulta, sin documentacion adicional sobre usos previstos, composicion del dataset ni limitaciones.

La licencia es Apache 2.0, lo que permite uso comercial, pero la ausencia de informacion sobre el proceso de entrenamiento y la calidad del dataset hace que no sea recomendable para produccion sin una evaluacion adicional. El WER declarado de 25,67 sobre el split de test es alto en terminos absolutos y solo tiene sentido en el contexto especifico de ese dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (declarado); el dataset de entrenamiento se denomina japanese_english |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de openai/whisper-tiny, un transformer encoder-decoder con 37,76 millones de parametros disenado originalmente por OpenAI para ASR multilingue. La arquitectura procesa espectrogramas de audio en ventanas de 30 segundos y genera tokens de texto de forma autorregresiva. No se dispone de informacion sobre modificaciones arquitectonicas respecto al modelo base.

El entrenamiento se realizo con el Trainer de transformers (version 5.23.0.dev0) y PyTorch 2.11.0+cu130, sobre el dataset naharte/japanese_english. Los hiperparametros declarados son: learning rate de 1e-5, batch size de entrenamiento de 2, batch size de evaluacion de 64, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 500 pasos de warmup y 2000 pasos totales. Se registran dos puntos de evaluacion: en el paso 1000 (epoch 1,2438) la perdida de validacion fue 0,4924 con WER 26,9580, y en el paso 2000 (epoch 2,4876) la perdida fue 0,4743 con WER 25,6736. No se documenta el numero de tokens de audio, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (en ASR no son habituales).

## Capacidades

- Transcripcion de audio a texto (ASR) en el dominio del dataset de entrenamiento.
- Procesamiento de audio en ingles y, presumiblemente, japones, dado el nombre del dataset, aunque los metadatos solo declaran "en".
- Generacion de transcripciones con marcas de tiempo, siempre que se use la API de Whisper en transformers con `return_timestamps=True`.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta modo thinking, vision ni audio mas alla de la entrada ASR estandar.
- Capacidades multilingues limitadas al par japones-ingles segun el nombre del dataset; no hay evidencia de otros idiomas.

## Casos de uso

- Prototipado rapido de transcripcion en ingles: al ser un modelo de 37,76 M de parametros, se puede cargar en CPU o GPU de gama baja para validar pipelines de ASR antes de invertir en modelos mayores.
- Experimentos academicos de ajuste fino: sirve como referencia para comparar tecnicas de fine-tuning sobre Whisper tiny con datasets bilingues japones-ingles.
- Transcripcion de audio de baja latencia en dispositivos con recursos limitados: su tamano reducido permite inferencia en tiempo real en hardware modesto, aunque con precision limitada (WER 25,67 en el dataset de evaluacion).
- Generacion de subtitulos automaticos en entornos controlados: util para videos cuyo dominio coincida con el dataset de entrenamiento, con revision humana obligatoria por el WER elevado.
- Evaluacion de calidad de datasets ASR: el modelo puede usarse como sonda para medir la dificultad de un corpus japones-ingles concreto.
- Base para destilacion o experimentos de cuantizacion: su tamano minimo lo hace adecuado para probar tecnicas de compresion antes de aplicarlas a modelos Whisper mayores.
- Docencia y demostraciones: ejemplo practico de pipeline de fine-tuning con Hugging Face Trainer y publicacion en el Hub.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| naharte/japanese_english | test | WER | 25,6736 |
| naharte/japanese_english | validacion (paso 1000) | WER | 26,9580 |
| naharte/japanese_english | validacion (paso 2000) | WER | 25,6736 |
| naharte/japanese_english | validacion (paso 2000) | Loss | 0,4743 |

No se han publicado resultados en benchmarks estandar (LibriSpeech, Common Voice, MMLU, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 150 MB para los pesos (37,76 M de parametros x 4 bytes), mas overhead de activaciones y buffers de audio.
- VRAM estimada en fp16: aproximadamente 75 MB para los pesos.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1050, RTX 2060, RTX 3060, RTX 4090, asi como en CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU con al menos 1 GB de VRAM es suficiente. Para lotes grandes, una RTX 3060 o superior ofrece margen.
- Opciones de despliegue: transformers (pipeline de automatic-speech-recognition), vLLM no aplica (no es un modelo de texto generativo puro), llama.cpp no soporta Whisper de forma nativa, whisper.cpp si es compatible previa conversion, Ollama no soporta Whisper, TGI no esta orientado a ASR.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia inferior a un segundo por ventana de 30 s en GPU moderna, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-tiny-japanese_english-ft1 | 37,76 M | ventanas de 30 s | 25,67 (dataset propio) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 37,76 M | ventanas de 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74,4 M | ventanas de 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | ventanas de 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparacion directa de WER no es posible porque los modelos base de OpenAI no declaran resultados sobre el dataset naharte/japanese_english. En terminos de tamano, este modelo es identico a whisper-tiny y la mitad de whisper-base.

## Limitaciones y advertencias

- WER de 25,67 sobre el dataset de evaluacion, lo que indica una precision baja para uso en produccion sin revision humana.
- El campo de idiomas solo declara "en", pero el dataset se llama japanese_english; no esta claro el soporte real de japones y podria degradarse fuera del dominio de entrenamiento.
- No hay informacion sobre la composicion del dataset, su tamano, la calidad de las transcripciones ni el origen del audio, lo que impide evaluar sesgos.
- Riesgo de alucinacion en pasajes de audio con ruido, silencios o habla solapada, comun en modelos Whisper pequenos.
- Sin documentacion sobre usos previstos ni limitaciones por parte del autor (la model card indica "More information needed" en varias secciones).
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de trazabilidad del dataset de entrenamiento puede plantear riesgos legales si el corpus contiene material con derechos.
- No se han publicado resultados en benchmarks estandar, por lo que la comparacion con otros modelos es limitada.
- El modelo se genero automaticamente con el Trainer; la model card no ha sido revisada manualmente.

## Enlaces

- Hugging Face: https://huggingface.co/merkelmarrow/whisper-tiny-japanese_english-ft1
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset: https://huggingface.co/datasets/naharte/japanese_english
- Paper de Whisper (referencia del modelo base): https://arxiv.org/abs/2212.04356
- Repositorio de Whisper de OpenAI: https://github.com/openai/whisper
- Documentacion de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
