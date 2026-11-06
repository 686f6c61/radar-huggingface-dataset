# huggnico/whisper-tiny_to_canadian_accent

## Resumen

Whisper tiny canadian es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, desarrollado por el usuario huggnico, orientado al reconocimiento automatico del habla (ASR) sobre ingles con acento canadiense. Se trata de un modelo de la familia Whisper, una arquitectura encoder-decoder basada en transformer entrenada originalmente por OpenAI para transcripcion de audio y traduccion. Con 37,76 millones de parametros, es la variante mas pequena de la familia Whisper, lo que lo hace especialmente ligero y apto para despliegues con recursos muy limitados.

El problema que aborda es la adaptacion de un modelo generico de ASR a una variante dialectal concreta: el ingles canadiense. El autor parte de los pesos de whisper-tiny y los reentrena sobre el dataset canadian_english, declarando un WER de 20,72 % sobre el split de test. Es relevante ahora porque demuestra un flujo de trabajo reproducible de ajuste fino de bajo coste sobre modelos ASR abiertos, aunque sus prestaciones son modestas y su validacion externa es practicamente nula.

La ficha se basa exclusivamente en la informacion publicada en Hugging Face: la model card esta generada automaticamente por el Trainer y contiene secciones sin completar ("More information needed"), por lo que muchos detalles de datos y metodologia no estan disponibles. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 3 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors, admite conversion a otros formatos con herramientas externas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | openai/whisper-tiny |
| Tamano del repositorio | 0,3 GB |
| Libreria | transformers |
| Pipeline | automatic-speech-recognition |
| Dataset de entrenamiento | canadian_english |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper tiny: un transformer encoder-decoder con mecanismos de atencion estandar, disenado para mapear espectrogramas de audio a secuencias de tokens de texto. El modelo base openai/whisper-tiny tiene 37,76 millones de parametros y procesa audio en ventanas de 30 segundos. El ajuste fino conserva la arquitectura original y solo modifica los pesos mediante entrenamiento supervisado sobre pares audio-transcripcion del dataset canadian_english.

Los hiperparametros declarados en la model card son: learning rate de 1e-5, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-8, scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento. Se registran dos epocas: en la epoca 1 (paso 1000) la perdida de validacion fue 0,4237 con WER 21,4267; en la epoca 2 (paso 2000) la perdida fue 0,4251 con WER 20,7186. No se documenta el numero de tokens de audio, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO (en ASR no es habitual). Las versiones de framework usadas fueron Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) de audio en ingles, con especializacion declarada en acento canadiense.
- Salida de texto plano a partir de audio; el pipeline es automatic-speech-recognition.
- Capacidad multilingue limitada: solo se declara ingles, aunque el modelo base Whisper tiny soporta multilingue y este ajuste fino podria degradar otros idiomas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio mas alla del propio ASR.
- No se documentan marcas de tiempo, diarizacion ni deteccion de idioma en la model card.

## Casos de uso

- Transcripcion de reuniones y notas de voz en entornos con acento canadiense: el modelo puede convertir audio a texto en ingles con una ventana de 30 segundos por segmento, adecuado para prototipos y pruebas de concepto con recursos minimos.
- Subtitulado automatico de contenido audiovisual de baja latencia: al tener solo 37,76 M de parametros, puede ejecutarse en CPU o en GPU de gama baja para generar subtitulos preliminares que luego se revisan manualmente.
- Preprocesado de audio para pipelines de analisis de texto: transcripcion de llamadas o podcasts canadienses antes de aplicar busqueda, resumen o clasificacion con modelos de lenguaje.
- Prototipado rapido de asistentes de voz: integracion en aplicaciones de dictado o comandos por voz en ingles canadiense, con la ventaja de un modelo de 0,3 GB que cabe en dispositivos con poca memoria.
- Evaluacion comparativa de tecnicas de fine-tuning ASR: sirve como ejemplo reproducible de ajuste fino de Whisper tiny con hiperparametros documentados, util en docencia o experimentacion.
- Despliegue en entornos con restricciones de privacidad: al ser un modelo pequeno y con licencia Apache 2.0, puede ejecutarse en local sin enviar audio a servicios externos, aunque con precision limitada (WER superior al 20 %).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index), no verificados de forma independiente:

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny canadian | canadian English (split test) | WER | 20,7186 % |
| Whisper tiny canadian (epoca 1) | canadian English (validacion) | WER | 21,4267 % |
| Whisper tiny canadian (epoca 2) | canadian English (validacion) | WER | 20,7186 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo ASR y no de un modelo de lenguaje generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 37,76 M de parametros en fp32, ocupa aproximadamente 150 MB de pesos; en fp16 unos 75 MB. La VRAM adicional depende del buffer de audio y del framework, pero en la practica cabe en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona en RTX 4090, A100, H100 y tambien en GPUs integradas o en CPU.
- Cabe en GPU de consumo: si, en practicamente todas (GTX 1050, RTX 3060, etc.), y en CPU con latencia aceptable para audio corto.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), y conversion a otros formatos con herramientas externas; no se documenta compatibilidad explicita con vLLM, llama.cpp, Ollama o TGI en la model card.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper tiny canadian (este modelo) | 37,76 M | ventanas de 30 s | 20,72 % (canadian English) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 37,76 M | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-base | ~74 M | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-small | ~244 M | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |

La comparativa se limita a la familia Whisper porque no se dispone de datos de benchmarks de otros modelos ASR en la informacion proporcionada. El WER de 20,72 % es notablemente alto para estandares de produccion, lo que sugiere que el ajuste fino no ha superado claramente al modelo base en calidad global.

## Limitaciones y advertencias

- El WER declarado de 20,72 % es elevado para uso en produccion; implica que aproximadamente una de cada cinco palabras se transcribe incorrectamente en el conjunto de evaluacion.
- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed"), por lo que no hay documentacion sobre sesgos, composicion del dataset ni metodologia de evaluacion.
- El modelo solo declara soporte para ingles; el ajuste fino sobre acento canadiense puede degradar el rendimiento en otras variantes del ingles o en otros idiomas respecto al modelo base.
- Riesgo de alucinacion en ASR: los modelos Whisper pueden generar texto plausible que no corresponde al audio, especialmente en silencios, ruido o audio de baja calidad.
- Sesgos conocidos: no documentados en la model card; el dataset canadian_english no esta descrito en cuanto a composicion demografica o dominio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la licencia del dataset de entrenamiento, no detallada.
- El modelo tiene 0 descargas y 0 likes, y los resultados no estan verificados de forma independiente (verified: false), por lo que su reproducibilidad es incierta.
- No se documentan limitaciones de contexto mas alla de la ventana estandar de 30 segundos de Whisper.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggnico/whisper-tiny_to_canadian_accent
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Whisper de OpenAI: https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Documentacion de Transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
