# merkelmarrow/whisper-tiny-american_english

## Resumen

Whisper tiny American English es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario merkelmarrow en Hugging Face. Se trata de un modelo de reconocimiento automático del habla (ASR) especializado en ingles americano, entrenado sobre el dataset naharte/american_english. Con 37,7 millones de parametros, es una de las variantes mas ligeras de la familia Whisper, pensada para transcripcion rapida en entornos con recursos limitados.

El modelo parte de la arquitectura encoder-decoder transformer de Whisper, que procesa audio en ventanas de 30 segundos y genera transcripciones autoregresivamente. Al estar ajustado sobre un corpus especifico de ingles americano, busca mejorar la precision en ese dominio concreto frente al modelo base, aunque a costa de perder cobertura multilingue (solo soporta ingles).

Su relevancia practica es limitada pero clara: es un modelo pequeno (0,2 GB), con licencia Apache 2.0 y compatible con la libreria transformers, lo que lo hace facil de desplegar en CPU o GPUs de gama baja para tareas de transcripcion en tiempo real o preprocesamiento de audio. El autor declara un WER de 9,69% en el split de test del dataset de entrenamiento, un valor que debe interpretarse con cautela al no estar verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s; el contexto textual depende de la decodificacion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion a int8/fp16 via herramientas externas, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de openai/whisper-tiny, que emplea una arquitectura transformer encoder-decoder con atencion completa. El encoder procesa espectrogramas mel de 80 canales en ventanas de 30 segundos, y el decoder genera tokens de texto de forma autoregresiva. Whisper-tiny cuenta con 4 capas en encoder y 4 en decoder, con una dimension de modelo de 384 y 6 cabezas de atencion, lo que explica sus aproximadamente 37,7 millones de parametros.

El entrenamiento se realizo con el Trainer de Hugging Face sobre el dataset naharte/american_english, con los siguientes hiperparametros: learning rate 3,75e-05, batch de entrenamiento 32, batch de evaluacion 64, optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-08), scheduler lineal con 50 pasos de warmup, semilla 42 y 1000 pasos totales (aproximadamente 15 epocas). No se documenta el numero de tokens de audio, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (Whisper no las usa en su entrenamiento original). El autor no describe innovaciones tecnicas adicionales; se trata de un ajuste fino estandar.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles americano.
- Transcripcion de audio a texto con puntuacion y mayusculas basicas heredadas del modelo base.
- Procesamiento de audio en ventanas de 30 segundos, con posibilidad de concatenar segmentos para audios mas largos mediante pipelines de transformers.
- Deteccion de idioma limitada: al estar ajustado solo en ingles, no se garantiza un comportamiento correcto en otros idiomas.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni uso como agente.
- No dispone de modo thinking, vision ni audio generativo.
- Capacidades multilingues: no disponibles (solo ingles).

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles americano: el modelo puede convertir grabaciones cortas en texto con un WER declarado cercano al 9,7%, adecuado para actas internas o busquedas posteriores donde no se requiere transcripcion literal perfecta.
- Subtitulado automatico de videos en ingles: su tamano reducido (0,2 GB) permite ejecutarlo en CPU o GPUs consumer, integrandose en pipelines de postproduccion para generar subtitulos preliminares que luego se revisan manualmente.
- Preprocesamiento de audio para pipelines de NLP: transcripcion rapida de llamadas o encuestas para alimentar modelos de analisis de sentimiento o clasificacion de texto, donde el coste computacional es critico.
- Prototipado de asistentes de voz: al ser compatible con transformers y Apache 2.0, sirve para validar arquitecturas de ASR en fases tempranas de desarrollo sin invertir en modelos grandes.
- Transcripcion en dispositivos con recursos limitados: su huella de memoria permite desplegarlo en Raspberry Pi, moviles o navegadores mediante ONNX/WebGPU (con conversion externa), para aplicaciones de accesibilidad o dictado offline.
- Generacion de datasets etiquetados: puede usarse para transcribir grandes volumenes de audio en ingles americano y crear corpus de entrenamiento para otros modelos, aceptando el ruido del 9,7% de WER como coste asumible.
- Moderacion de contenido en audio: transcripcion de streams o grabaciones para deteccion de palabras clave, aprovechando su baja latencia en hardware modesto.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| naharte/american_english | test | WER | 9,687984830201689 |
| naharte/american_english | validacion (epoca 1, step 100) | WER | 8,8605 |
| naharte/american_english | validacion (epoca 15, step 1000) | WER | 9,6880 |
| naharte/american_english | validacion (epoca 15, step 1000) | Loss | 0,2330 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (37,7 M de parametros, ~150 MB de pesos); en fp16 aproximadamente 75 MB. El cuello de botella es el buffer de audio y el decoder, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en GTX 1050, RTX 3050, RTX 4090, A100 o H100 sin problema. Tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), vLLM no soporta ASR de Whisper de forma nativa, llama.cpp no soporta Whisper, faster-whisper (conversion a CTranslate2), whisper.cpp (requiere conversion a GGML), Ollama no soporta ASR, TGI no soporta Whisper de forma estandar.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera inferencia en tiempo real o mas rapida en CPU moderna, pero no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| merkelmarrow/whisper-tiny-american_english | 37,7 M | ventanas de 30 s | en | apache-2.0 | 9,69% (dataset propio) |
| openai/whisper-tiny | 39 M | ventanas de 30 s | multilingue (99 idiomas) | apache-2.0 | no disponible en esta ficha |
| openai/whisper-base | 74 M | ventanas de 30 s | multilingue | apache-2.0 | no disponible en esta ficha |
| openai/whisper-small | 244 M | ventanas de 30 s | multilingue | apache-2.0 | no disponible en esta ficha |

La comparacion directa de WER no es posible porque el autor solo reporta resultados sobre su propio dataset de evaluacion (naharte/american_english), no sobre benchmarks estandar como LibriSpeech o Common Voice. El modelo base whisper-tiny es multilingue y mas generalista; este fine-tuning sacrifica cobertura idiomatica por especializacion en ingles americano, con un WER que no puede contrastarse con cifras publicas del modelo original en el mismo corpus.

## Limitaciones y advertencias

- El WER de 9,69% esta declarado por el autor y marcado como no verificado; no ha sido validado de forma independiente.
- El modelo solo soporta ingles; su uso con audio en otros idiomas producira transcripciones incorrectas o alucinaciones.
- Riesgo de alucinacion en audio con ruido, silencios largos o habla no inglesa, comportamiento heredado de Whisper.
- Sesgos conocidos: Whisper tiende a sesgarse hacia el ingles y puede producir texto plausible en segmentos ambiguos; el fine-tuning sobre un corpus especifico puede amplificar sesgos de ese dataset (no documentado por el autor).
- Limitacion de contexto: ventanas de 30 segundos; audios mas largos requieren segmentacion y concatenacion, con posible perdida de coherencia en los limites.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la model card indica explicitamente "More information needed" en secciones clave (descripcion, usos previstos, datos de entrenamiento).
- El modelo fue creado en 2026-11-03 y no tiene descargas ni likes, por lo que no hay evidencia de uso en produccion ni validacion comunitaria.
- El dataset de entrenamiento (naharte/american_english) no esta descrito en detalle; se desconoce su composicion, tamano y calidad, lo que impide evaluar la representatividad del modelo.
- No se recomienda para aplicaciones medicas, legales o de transcripcion literal sin revision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/merkelmarrow/whisper-tiny-american_english
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/american_english
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Documentacion de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
