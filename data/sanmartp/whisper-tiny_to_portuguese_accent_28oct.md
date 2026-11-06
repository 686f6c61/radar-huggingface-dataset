# sanmartp/whisper-tiny_to_portuguese_accent_28oct

## Resumen

Whisper tiny portuguese es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla (ASR) openai/whisper-tiny, publicado por el usuario sanmartp en Hugging Face. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, con 37.760.640 parametros totales, y se ha reentrenado sobre el dataset naharte/portuguese_english para adaptar el reconocimiento a acentos portugueses en audio en ingles. La relevancia de este modelo es limitada y muy especifica: se trata de un ajuste de un modelo diminuto (tiny) sobre un unico dataset de 2.000 pasos de entrenamiento, orientado a mejorar la transcripcion de hablantes con acento portugues cuando hablan en ingles.

El modelo se distribuye bajo licencia Apache 2.0, en formato safetensors, con un tamano de repositorio de 0,3 GB, lo que lo hace extremadamente ligero y desplegable en practicamente cualquier hardware, incluidos dispositivos de bajos recursos. El autor declara un Word Error Rate (WER) de 11,9478 sobre el split de test del dataset Portuguese English, aunque esta metrica no ha sido verificada de forma independiente (verified: false en el model-index).

Es importante senalar que la model card esta generada automaticamente por el Trainer y contiene secciones sin completar ("More information needed"), por lo que la documentacion sobre usos previstos, limitaciones y composicion del dataset es practicamente inexistente. El modelo tiene 25 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion muy baja y nula validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion posterior via herramientas externas) |
| Idiomas soportados | en (ingles); ajustado para acento portugues |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de OpenAI en su variante tiny: un transformer encoder-decoder con atencion multi-cabeza estandar, disenado originalmente para transcripcion y traduccion de voz. Al ser un fine-tuning, no introduce innovaciones arquitectonicas propias; simplemente adapta los pesos preentrenados de openai/whisper-tiny al dominio acustico del dataset naharte/portuguese_english.

Los hiperparametros de entrenamiento declarados en la model card son: learning rate de 1e-5, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW (variante fused, betas 0.9/0.999, epsilon 1e-8), scheduler lineal con 500 pasos de warmup y 2.000 pasos totales de entrenamiento. El entrenamiento se ejecuto con Transformers 5.22.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se especifica el numero de tokens de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un ajuste ASR de este tipo). El historial de entrenamiento muestra dos puntos de evaluacion: en el paso 1.000 (epoch 0,9217) la perdida de validacion fue 0,2718 con WER 12,8052; en el paso 2.000 (epoch 1,8433) la perdida bajo a 0,2544 y el WER a 11,9478.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles para audio con acento portugues.
- Transcripcion de audio a texto mediante el pipeline `automatic-speech-recognition` de Transformers.
- Capacidad multilingue limitada: el modelo base Whisper tiny soporta multiples idiomas, pero este ajuste esta orientado a ingles con acento portugues y el campo `language` de la model card solo declara `en`.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio generativo.
- Capacidad de generacion de texto: no aplica en la practica; es un modelo especializado en ASR.

## Casos de uso

- Transcripcion de reuniones y llamadas de equipos lusohablantes que trabajan en ingles: el ajuste sobre acentos portugueses puede reducir errores frente al whisper-tiny original en este perfil de hablante, con un coste computacional minimo.
- Subtitulado automatico de contenido audiovisual en ingles producido por hablantes portugueses: el modelo es lo bastante ligero (0,3 GB) para ejecutarse en local o en entornos con recursos limitados y generar subtitulos en tiempo casi real.
- Preprocesado de audio en pipelines de datos: transcripcion masiva de grabaciones para generar datasets de texto en ingles a partir de audio con acento portugues, aprovechando su bajo coste de inferencia.
- Prototipado rapido de aplicaciones de voz: al ser un modelo tiny, permite iterar en local sin GPU dedicada, ideal para validar ideas de producto antes de escalar a modelos mayores.
- Despliegue en dispositivos de borde (edge): su tamano reducido permite integracion en dispositivos con poca memoria, como Raspberry Pi o moviles, para dictado o comandos de voz en ingles con acento portugues.
- Evaluacion comparativa de tecnicas de fine-tuning ASR: util como caso de estudio academico para medir el impacto de ajustar un modelo tiny sobre un dataset pequeno y especifico, dado que el autor publica curvas de perdida y WER por paso.
- Filtrado y busqueda en archivos de audio: transcripcion de grabaciones para indexacion y busqueda por texto en ingles, en escenarios donde la precision absoluta no es critica y prima el coste.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | naharte/portuguese_english (split test) | WER | 11,9478 |

Historial de entrenamiento declarado en la model card:

| Training loss | Epoch | Step | Validation loss | WER |
|---|---|---|---|---|
| 0,2480 | 0,9217 | 1000 | 0,2718 | 12,8052 |
| 0,1173 | 1,8433 | 2000 | 0,2544 | 11,9478 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, LibriSpeech, Common Voice u otros) en la informacion disponible, ni comparaciones con el modelo base whisper-tiny en las mismas condiciones.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (37,7 M de parametros, ~150 MB de pesos); en fp16 aproximadamente 75 MB de pesos, con overhead adicional de activaciones y buffers de audio.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3050, RTX 4090, A100 o H100. No requiere GPU dedicada para funcionar.
- Cabe en GPU consumer: si, en practicamente todas, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: pipeline de Transformers (`automatic-speech-recognition`), vLLM no aplica de forma nativa para ASR Whisper, llama.cpp no soporta Whisper, TGI no es la via habitual; opciones realistas son Transformers, faster-whisper (si se convierte) y ONNX Runtime.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera latencia muy baja en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sanmartp/whisper-tiny_to_portuguese_accent_28oct | 37,7 M | no disponible | 11,9478 (dataset propio) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 39 M (aprox.) | no disponible | no disponible en esta ficha | apache-2.0 | Hugging Face, OpenAI |
| openai/whisper-base | 74 M (aprox.) | no disponible | no disponible en esta ficha | apache-2.0 | Hugging Face, OpenAI |
| openai/whisper-small | 244 M (aprox.) | no disponible | no disponible en esta ficha | apache-2.0 | Hugging Face, OpenAI |

La comparacion directa de WER no es posible porque el autor solo reporta resultados sobre su propio dataset de evaluacion y no se dispone de cifras del modelo base en el mismo split. En terminos de tamano, este ajuste es el mas ligero de la familia Whisper, lo que limita su precision frente a variantes base, small o medium, pero maximiza su portabilidad.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed"), por lo que no hay documentacion fiable sobre usos previstos, limitaciones o composicion del dataset.
- El WER declarado (11,9478) no ha sido verificado de forma independiente (`verified: false`) y procede de un unico dataset con split de test no descrito en detalle.
- El ajuste se ha realizado con solo 2.000 pasos de entrenamiento y batch de 2, lo que sugiere un ajuste ligero y posible sobreajuste al dataset concreto.
- El campo `language` de la model card solo declara `en`; el soporte multilingue del modelo base puede haberse degradado tras el fine-tuning.
- Riesgo de alucinacion y de transcripciones erroneas en audio con ruido, acentos distintos al portugues o dominios alejados del dataset de entrenamiento.
- No hay informacion sobre sesgos demograficos, acusticos o de genero en el dataset de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de openai/whisper-tiny conviene revisar las condiciones del modelo base y citar adecuadamente.
- Adopcion practicamente nula (25 descargas, 0 likes) y ausencia de validacion por la comunidad; no se recomienda para produccion sin una evaluacion propia sobre el dominio objetivo.
- No hay informacion sobre latencia, throughput ni comportamiento en streaming.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanmartp/whisper-tiny_to_portuguese_accent_28oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento/evaluacion: https://huggingface.co/datasets/naharte/portuguese_english
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
