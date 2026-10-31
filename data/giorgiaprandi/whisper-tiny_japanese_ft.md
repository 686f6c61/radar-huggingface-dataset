# GiorgiaPrandi/whisper-tiny_japanese_ft

## Resumen

Whisper tiny Japanese es un ajuste fino (fine-tuning) del modelo Whisper Tiny de OpenAI, realizado por el usuario GiorgiaPrandi sobre el dataset "Japanese English" (naharte/japanese_english). El modelo original, openai/whisper-tiny, es un modelo de reconocimiento automatico de voz (ASR) basado en arquitectura encoder-decoder transformer con 39 millones de parametros, disenado para transcripcion y traduccion de audio a texto en multiples idiomas.

Este fine-tuning adapta el modelo para mejorar el reconocimiento de voz sobre datos del dataset japanese_english, un conjunto de datos con contenido en japones e ingles. El modelo alcanza un WER (Word Error Rate) de 20,43 % sobre el split de test de dicho dataset, lo que lo hace util como punto de partida ligero para tareas de transcripcion en entornos con recursos limitados.

Su relevancia radica en su tamano reducido (0,3 GB de repo, 37,76 millones de parametros), que permite su ejecucion en hardware modesto, incluyendo CPUs y GPUs de consumo, y en su licencia Apache 2.0, que permite uso comercial sin restricciones. Es un modelo comunitario, no oficial de OpenAI, con muy pocas descargas (41), por lo que su adopcion y validacion son limitadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer para ASR) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper: 30 segundos por segmento en la familia Whisper, no confirmado para este fine-tuning) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (declarado en la model card; entrenado sobre datos japones-ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-tiny, la version mas pequena de la familia Whisper: un transformer encoder-decoder entrenado originalmente por OpenAI sobre 680.000 horas de audio multilingue para transcripcion y traduccion. Whisper utiliza un log-Mel spectrogram de 80 canales como entrada y un decodificador autorregresivo que genera tokens de texto, con tokens especiales para idioma y tarea (transcripcion o traduccion).

El fine-tuning se realizo con la libreria Transformers (version 5.21.0.dev0) y PyTorch 2.11.0+cu130, sobre el dataset naharte/japanese_english. Los hiperparametros de entrenamiento fueron: learning rate de 1e-05 con scheduler lineal y 500 pasos de warmup, batch size de 2 para entrenamiento y 1 para evaluacion, optimizador AdamW (variante fused de PyTorch) con betas (0,9; 0,999) y epsilon 1e-08, semilla 42 y 2000 pasos de entrenamiento en total. La loss de validacion final fue 0,4243 y el WER en el conjunto de evaluacion 20,4261. No se dispone de informacion sobre la composicion del dataset ni sobre el numero de horas de audio.

## Capacidades

- Transcripcion automatica de voz (ASR) sobre audio en el dominio del dataset japanese_english (contenido japones-ingles).
- Hereda las capacidades base de Whisper Tiny: transcripcion y traduccion multilingue, aunque el fine-tuning puede haber degradado el rendimiento en idiomas no vistos en el ajuste.
- Compatible con el pipeline `automatic-speech-recognition` de la libreria Transformers de Hugging Face.
- Compatible con la infraestructura estandar de Hugging Face (endpoints, Inference API).
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de ASR puro.
- No dispone de capacidades de vision, audio generativo ni thinking mode.

## Casos de uso

- Transcripcion de grabaciones con mezcla de japones e ingles: el modelo se ha ajustado especificamente sobre el dataset japanese_english, por lo que es adecuado para audio bilingue o con alternancia de codigos (code-switching) entre ambos idiomas.
- Subtitulado automatico de contenido audiovisual ligero: gracias a su tamano reducido, puede ejecutarse en local para generar transcripciones rapidas de videos o podcasts sin necesidad de GPU.
- Prototipado de aplicaciones de voz: su baja huella (0,3 GB) lo hace ideal para pruebas de concepto y desarrollo iterativo antes de escalar a modelos Whisper mas grandes.
- Procesamiento por lotes en CPUs: puede integrarse en scripts de transcripcion masiva de archivos de audio en maquinas sin acelerador dedicado.
- Punto de partida para nuevos fine-tunings: al ser un modelo base pequeno y con licencia Apache 2.0, puede reajustarse sobre dominios especificos (call centers, terminologia tecnica) con coste computacional minimo.
- Sistemas embebidos o de borde (edge): su consumo reducido permite considerar despliegues en dispositivos con recursos limitados para transcripcion offline.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| WER | naharte/japanese_english | test | 20,43 % |
| Loss (validacion) | naharte/japanese_english | eval | 0,4243 |

Evolucion del entrenamiento segun la model card:

| Training Loss | Epoch | Step | Validation Loss | WER |
|---|---|---|---|---|
| 0,1321 | 1,2438 | 1000 | 0,4418 | 21,3659 |
| 0,0836 | 2,4876 | 2000 | 0,4243 | 20,4261 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 37,76 millones de parametros en fp32/fp16, el consumo es inferior a 200 MB de VRAM en fp16; puede ejecutarse incluso sin GPU.
- GPU recomendadas: cualquier GPU moderna es mas que suficiente; no se requiere hardware dedicado. Una RTX 3060 o superior, o incluso integraciones de GPU modestas, ejecutan el modelo con holgura.
- Consumer GPUs: cabe sobradamente en cualquier GPU de consumo actual, incluidas las de gama de entrada.
- CPU: plenamente viable; el tamano del modelo permite inferencia en tiempo real o mejor en CPUs modernas.
- Opciones de despliegue: libreria Transformers de Hugging Face (pipeline `automatic-speech-recognition`), Inference Endpoints de Hugging Face. No se ha confirmado compatibilidad con llama.cpp, Ollama, vLLM o TGI, aunque Whisper tiny dispone de implementaciones en estos entornos para los pesos base.
- Latencia y throughput: no disponible; dada la arquitectura y el tamano, se espera transcripcion mas rapida que en tiempo real en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma objetivo | Licencia | Comentario |
|---|---|---|---|---|
| GiorgiaPrandi/whisper-tiny_japanese_ft | 37,76 M | japones-ingles (dataset especifico) | Apache 2.0 | Fine-tuning comunitario, WER 20,43 % en su dataset de test |
| openai/whisper-tiny (base) | 39 M | ~99 idiomas | MIT | Modelo base multilingue, sin adaptacion al dataset japanese_english |
| openai/whisper-small | 244 M | ~99 idiomas | MIT | Mayor capacidad general, requiere mas recursos; mejor WER tipico en japones |

No se han publicado benchmarks comparativos directos entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- La model card es practicamente vacia en secciones clave ("More information needed" en descripcion, usos previstos y datos de entrenamiento), por lo que la documentacion es muy escasa y el modelo requiere validacion propia antes de uso serio.
- El WER de 20,43 % esta declarado por el autor y no esta verificado; ademas, corresponde unicamente al dataset japanese_english, por lo que no es extrapolable a otros dominios o condiciones acusticas.
- La model card declara el idioma "en" pese a tratarse de un fine-tuning sobre datos japones-ingles: la etiqueta de idioma es ambigua y el comportamiento real sobre japones puro debe comprobarse empiricamente.
- El fine-tuning puede haber producido olvido catastico sobre las demas capacidades multilingues del Whisper base, degradando el rendimiento en idiomas distintos del dominio de entrenamiento.
- Solo se entrenaron 2000 pasos con batch size 2, un regimen de entrenamiento muy corto que sugiere un ajuste ligero y posiblemente insuficiente para dominios complejos.
- Riesgo de alucinaciones tipico de la familia Whisper (repeticiones de frases, invencion de contenido en silencios), heredado del modelo base.
- No hay informacion sobre sesgos del dataset ni sobre su composicion demografica o de dominio.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque los pesos base de OpenAI se distribuyen bajo MIT y el modelo hereda consideraciones de uso responsable de la familia Whisper.
- Modelo con muy poca adopcion (41 descargas, 1 like), sin comunidad de soporte ni revision por pares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GiorgiaPrandi/whisper-tiny_japanese_ft
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/japanese_english

No se han encontrado enlaces adicionales (papers, blogs, repos de codigo o demos) en la informacion disponible.
