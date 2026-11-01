# JoeDwan/whisper-tiny_to_portuguese_accent_28oct_v1_no_en

## Resumen

Whisper tiny Portuguese accent es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario JoeDwan en Hugging Face. El modelo base whisper-tiny es un transformer encoder-decoder de 37,7 millones de parametros disenado por OpenAI para reconocimiento automatico del habla (ASR). Este ajuste concreto se ha entrenado sobre el dataset denominado "Portuguese_english" con el objetivo declarado de adaptar el reconocimiento a acentos portugueses, segun se deduce del nombre del repositorio (`to_portuguese_accent`) y de la etiqueta `no_en` (presumiblemente "no English").

El modelo resuelve la tarea de transcripcion de audio a texto mediante la pipeline `automatic-speech-recognition` de la libreria transformers. Su relevancia es limitada y muy especifica: se trata de un experimento de ajuste fino de un modelo extremadamente pequeno (37,7 M de parametros, frente a los 1.550 M de whisper-large-v3), con solo 33 descargas y sin validacion externa de sus resultados. El WER declarado de 10,997 sobre el split de test del dataset "Portuguese English" no esta verificado (`verified: false`) y no es comparable con benchmarks estandar de ASR multilingue.

La ficha se basa exclusivamente en los metadatos de Hugging Face y en la model card autogenerada por el Trainer, que contiene secciones vacias ("More information needed"). Cualquier dato no presente en esa informacion se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s; no se detalla en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de openai/whisper-tiny, que emplea la arquitectura transformer encoder-decoder caracteristica de la familia Whisper: el encoder procesa espectrogramas Mel de audio y el decoder genera tokens de texto de forma autorregresiva. Con 37,7 M de parametros, es la variante mas pequena de la familia Whisper y esta pensada para inferencia en entornos con recursos muy limitados.

Segun los hiperparametros documentados en la model card, el entrenamiento se realizo durante 2 epocas con un learning rate de 1e-5, batch size de 2, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-8), scheduler lineal con warmup del 25 % de los pasos y precision mixta nativa (AMP). El dataset utilizado se denomina "Portuguese_english", pero no se detalla su composicion, numero de horas, origen ni metodo de anotacion. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. El modelo se entreno con Transformers 5.22.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto mediante la pipeline `automatic-speech-recognition` de transformers.
- Ajuste orientado a acentos portugueses, segun el nombre del repositorio y la etiqueta `no_en`; la model card no detalla el alcance real de esta adaptacion.
- Generacion de texto derivada del decoder de Whisper (transcripcion), no orientada a generacion libre.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: la model card declara unicamente `en`; no se documenta soporte de portugues ni de otros idiomas a pesar del nombre del modelo.
- Capacidades especiales (modo thinking, vision, audio input adicional): no disponible.

## Casos de uso

- Transcripcion de audio en entornos con recursos muy limitados: con 37,7 M de parametros, el modelo puede ejecutarse en CPU o en GPUs de gama baja para transcribir notas de voz o grabaciones cortas, aunque con calidad limitada.
- Prototipado rapido de pipelines ASR: util para validar integraciones con la pipeline de transformers antes de migrar a modelos Whisper de mayor tamano.
- Experimentacion academica sobre adaptacion de acentos: sirve como punto de partida para estudiar tecnicas de fine-tuning de bajo coste sobre variedades del portugues.
- Pruebas de concepto de subtitulado automatico: adecuado para generar borradores de subtitulos en flujos internos donde la precision no sea critica.
- Evaluacion comparativa de modelos ASR pequenos: permite medir el impacto del ajuste fino frente al whisper-tiny original en un dataset concreto.
- Despliegue en dispositivos edge: su tamano reducido permite empaquetarlo en aplicaciones moviles o embebidas para tareas de dictado simples, siempre que se acepte un WER elevado.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en el model-index (no verificados):

| Modelo | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Whisper tiny Portuguese accent | Portuguese English | test | WER | 10,9972 |
| Whisper tiny Portuguese accent | Portuguese English | validation (epoca 2) | Loss | 0,2603 |

Evolucion del entrenamiento declarada en la model card:

| Epoca | Step | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 0,5005 | 543 | 0,3428 | 0,3082 | 14,6692 |
| 1,0009 | 1086 | 0,2665 | 0,2744 | 11,0345 |
| 1,5014 | 1629 | 0,1130 | 0,2649 | 10,4007 |
| 2,0 | 2170 | 0,1215 | 0,2603 | 10,9972 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, LibriSpeech, Common Voice) en la informacion disponible. El WER de 10,9972 corresponde a un dataset propietario no descrito y no es comparable directamente con cifras publicas de otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (37,7 M de parametros, aproximadamente 150 MB de pesos); en FP16, unos 75 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el modelo cabe holgadamente en GTX 1650, RTX 3050, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), potencialmente llama.cpp u Ollama si se generan pesos GGUF (no documentado por el autor), TGI (compatibilidad no confirmada).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Whisper tiny Portuguese accent (este modelo) | 37,7 M | ventanas de 30 s (Whisper tiny) | apache-2.0 | Hugging Face, 33 descargas | Ajuste fino no verificado |
| openai/whisper-tiny | 37,7 M | ventanas de 30 s | apache-2.0 | Hugging Face, ampliamente usado | Modelo base, multilingue |
| openai/whisper-base | 74 M | ventanas de 30 s | apache-2.0 | Hugging Face | Mayor precision a coste moderado |
| openai/whisper-small | 244 M | ventanas de 30 s | apache-2.0 | Hugging Face | Compromiso precision/recursos |

No se dispone de datos de rendimiento comparables entre estos modelos en el dataset "Portuguese English", por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El WER declarado (10,9972) no esta verificado (`verified: false`) y procede de un dataset no descrito, por lo que no debe tomarse como referencia de calidad.
- La model card esta autogenerada y contiene secciones vacias ("More information needed") sobre descripcion, usos previstos, limitaciones y datos de entrenamiento.
- La model card declara unicamente el idioma `en`, lo que entra en contradiccion con el nombre del repositorio (acento portugues); el alcance real del ajuste es incierto.
- Riesgo elevado de alucinacion y de transcripciones erroneas por el tamano reducido del modelo base.
- No se documentan sesgos conocidos, pero al derivar de Whisper tiny hereda las limitaciones del modelo original en acentos, ruido de fondo y vocabulario especializado.
- Uso comercial permitido por la licencia apache-2.0, sin restricciones adicionales documentadas.
- No apto para produccion sin una evaluacion propia sobre el dominio objetivo: el modelo tiene 33 descargas, 0 likes y no hay evidencia de validacion independiente.
- No se documentan limitaciones de contexto mas alla de las propias de Whisper (ventanas de audio de 30 s).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoeDwan/whisper-tiny_to_portuguese_accent_28oct_v1_no_en
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
