# mikaelaehunter/whisper-tiny_to_spanish_accent_09oct

## Resumen

`mikaelaehunter/whisper-tiny_to_spanish_accent_09oct` es un ajuste fino (fine-tuning) del modelo `openai/whisper-tiny` de OpenAI, publicado por el usuario mikaelaehunter en HuggingFace. Se trata de un modelo de reconocimiento automatico del habla (ASR) de tipo encoder-decoder transformer, con 37.760.640 parametros totales, pensado para transcripcion de audio en ventanas de 30 segundos y con un entrenamiento orientado, segun el nombre del repositorio, a acentos espanoles.

El modelo parte de la variante mas pequena de la familia Whisper (aproximadamente 39 M de parametros) y se ha reentrenado sobre un dataset denominado `Spanish_english`, del que no se ofrece informacion publica sobre composicion, horas de audio ni procedencia. El autor declara un WER de 12,29 sobre el split de test de ese mismo dataset, un resultado no verificado y no comparable con referencias externas al no documentarse el corpus.

Su relevancia practica es acotada pero clara: es un modelo muy ligero (repositorio de 0,5 GB, pesos de 37,7 M de parametros) que puede ejecutarse en CPU, dispositivos de borde o GPUs de consumo, lo que lo hace util para prototipado rapido de transcripcion en entornos con recursos limitados. La model card es auto-generada y contiene secciones sin completar ("More information needed"), por lo que debe tratarse como un experimento reproducible mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), con frontend convolucional y espectrograma mel de 80 canales |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | audio en ventanas fijas de 30 s (1500 frames); secuencia de decoder de hasta 448 tokens |
| Tipos de cuantizacion | no disponible en la model card; al ser un modelo transformers estandar es convertible a fp16, int8 y GGML/GGUF |
| Idiomas soportados | la model card declara unicamente `en` (ingles); el nombre del modelo sugiere acento espanol, pero no se documenta cobertura de espanol |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,5 GB, incluye artefactos de entrenamiento) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper en su variante `tiny`: un transformer encoder-decoder con preprocesado convolucional sobre espectrogramas mel de 80 canales y ventanas fijas de 30 segundos de audio. La variante tiny de la familia emplea 4 capas de encoder y 4 de decoder con dimension de modelo 384 y 6 cabezas de atencion, lo que explica su huella de 37,7 M de parametros. No se documentan modificaciones estructurales respecto al modelo base: el repositorio se genero con `Trainer` y figura como `finetune` de `openai/whisper-tiny`.

El entrenamiento se realizo sobre el dataset `Spanish_english` durante 2000 pasos (aproximadamente 2 epochs, con evaluacion en los pasos 1000 y 2000), con learning rate 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, scheduler lineal con 500 pasos de warmup, optimizador ADAMW_TORCH_FUSED (beta 0,9/0,999, epsilon 1e-08) y semilla 42. La perdida de validacion descendio de 0,2656 a 0,2462 y el WER de 13,96 a 12,29 entre ambos puntos de control. El entorno declarado es Transformers 5.21.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se especifica volumen de datos, horas de audio, composicion del corpus ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en ASR).

## Capacidades

- Transcripcion de voz a texto en audio de hasta 30 segundos por ventana, con concatenacion de ventanas para audios mas largos.
- Reconocimiento de habla en ingles segun la etiqueta de idioma declarada; el ajuste parece orientado a acentos espanoles, aunque no se documenta explicitamente.
- Deteccion de idioma y traduccion de voz a texto heredadas del modelo base Whisper (no verificadas en este fine-tuning).
- Generacion de marcas de tiempo (timestamps) a nivel de segmento mediante los tokens especiales de Whisper, si se habilitan en la decodificacion.
- Ejecucion sobre audio de entrada estandar a 16 kHz mono, sin necesidad de pipelines adicionales.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo puramente ASR.
- No soporta vision, audio generation ni modo "thinking".
- Integracion directa con `transformers` (`pipeline("automatic-speech-recognition")`) y compatible con endpoints de HuggingFace.

## Casos de uso

- Prototipado rapido de transcripcion en local: cargar el modelo con `pipeline("automatic-speech-recognition")` en un portatil sin GPU para validar un flujo de ASR antes de invertir en un modelo mayor.
- Transcripcion de notas de voz cortas en aplicaciones moviles o de escritorio: con 37,7 M de parametros y pesos de ~75 MB en fp16, cabe en dispositivos de borde y permite procesar clips de menos de 30 s.
- Preprocesado de audio para pipelines NLP: convertir entrevistas o reuniones en texto para posteriores tareas de resumen o busqueda, aceptando el coste de un WER de dos digitos.
- Normalizacion de acentos en corpus de habla: si el ajuste cumple lo que su nombre indica, util para transcribir hablantes de espanol hablando ingles en entornos de call center.
- Benchmark de referencia interna: servir como linea base ligera contra la que medir fine-tunings mayores sobre el mismo dataset propietario.
- Experimentacion academica y docencia: ejemplo reproducible de fine-tuning de Whisper con hiperparametros y curvas de entrenamiento publicadas, util para comparar estrategias de ajuste.
- Filtrado y etiquetado de grandes volumenes de audio en CPU: al no requerir GPU, permite procesar lotes en servidores sin acelerador, aceptando menor precision.

## Benchmarks y rendimiento

Datos declarados por el autor en la model index (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | Spanish English (split test) | WER | 12,2886 |

Evolucion durante el entrenamiento (checkpoints evaluados):

| Paso | Epoch | Validation loss | WER |
|---|---|---|---|
| 1000 | 0,9728 | 0,2656 | 13,9552 |
| 2000 | 1,9455 | 0,2462 | 12,2886 |

No se han publicado resultados de benchmarks adicionales (LibriSpeech, Common Voice, FLEURS u otros) en la informacion disponible, ni comparaciones con el modelo base en el mismo corpus, por lo que no es posible determinar la mejora real atribuible al fine-tuning.

## Requisitos de hardware

- VRAM estimada: ~0,15 GB en fp32 (151 MB de pesos), ~0,08 GB en fp16 y ~0,04 GB en int8; con activaciones y buffers de decodificacion, el consumo real se situa en torno a 0,5-2 GB en funcion del batch y de la longitud de audio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, T4, A100, H100); el modelo esta muy por debajo de la capacidad de todas ellas.
- Cabe en GPU de consumo y en CPU: puede ejecutarse en Raspberry Pi, mini-PC o portatiles sin acelerador, siendo el coste dominante el preprocesado del espectrograma.
- Opciones de despliegue: `transformers` con `pipeline`, `faster-whisper` (CTranslate2), `whisper.cpp` (previa conversion a GGML/GGUF), vLLM y TGI para Whisper, y HuggingFace Inference Endpoints (el modelo esta marcado como `endpoints_compatible`).
- Latencia y throughput: no se han publicado medidas. Por el tamano del modelo, en CPU moderna se espera procesar audio en tiempo real o por encima con batch 1, y en GPU el cuello de botella pasa a ser la conversion mel; no hay cifras oficiales que citar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (whisper-tiny fine-tuned) | 37,76 M | 30 s por ventana | 12,29 en `Spanish_english` (no verificado) | apache-2.0 | HuggingFace |
| openai/whisper-tiny (base) | ~39 M (dato publico de la familia Whisper) | 30 s por ventana | no disponible en la informacion proporcionada | apache-2.0 | HuggingFace, ampliamente desplegado |
| openai/whisper-base | ~74 M (dato publico de la familia Whisper) | 30 s por ventana | no disponible en la informacion proporcionada | apache-2.0 | HuggingFace |
| openai/whisper-small | ~244 M (dato publico de la familia Whisper) | 30 s por ventana | no disponible en la informacion proporcionada | apache-2.0 | HuggingFace |

No es posible establecer una comparacion cuantitativa de calidad: el unico WER publicado corresponde a un dataset privado del autor y no se ha evaluado el modelo base sobre el mismo corpus. En terminos de coste, este modelo compite con `whisper-tiny` base (mismo orden de magnitud de parametros) y queda por debajo de `whisper-base` y `whisper-small` en capacidad teorica.

## Limitaciones y advertencias

- Model card auto-generada: las secciones de descripcion, usos previstos y datos de entrenamiento estan sin completar, lo que impide evaluar sesgos, cobertura y calidad del corpus.
- El WER de 12,29 esta marcado como `verified: false` y se calcula sobre un dataset no publico (`Spanish_english`); no sirve como referencia comparable con otros modelos.
- Contradiccion de idioma: la etiqueta de idioma declara `en`, mientras que el nombre del repositorio sugiere adaptacion a acento espanol; conviene validar el comportamiento real antes de usarlo con habla en espanol.
- Riesgo de alucinacion tipico de Whisper: en segmentos con silencio, ruido o habla no cubierta por el entrenamiento puede generar texto repetido o inventado.
- Entrenamiento muy corto (2000 pasos, batch 2, ~2 epochs) sobre un corpus presumiblemente pequeno; riesgo de sobreajuste y de generalizacion limitada a dominios o canales de audio distintos.
- Ventana fija de 30 s: audios largos requieren segmentacion manual o `chunk_length_s`, con posible perdida de contexto entre fragmentos.
- Sin soporte de tool calling ni de agentes; no debe plantearse como sustituto de un LLM.
- Licencia apache-2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; conviene conservar el aviso de licencia y citar el modelo base de OpenAI.
- Sin metricas de robustez frente a ruido, musica o solapamiento de hablantes; no recomendable para produccion sin evaluacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mikaelaehunter/whisper-tiny_to_spanish_accent_09oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Documentacion de `transformers` para Whisper: https://huggingface.co/docs/transformers/model_doc/whisper
- Tabla de liderazgo ASR de HuggingFace: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Implementacion optimizada faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Implementacion en C/C++ whisper.cpp: https://github.com/ggerganov/whisper.cpp
