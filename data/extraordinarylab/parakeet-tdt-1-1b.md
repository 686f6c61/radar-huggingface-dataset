# extraordinarylab/parakeet-tdt-1.1b

## Resumen

Parakeet TDT 1.1B es un modelo de reconocimiento automatico del habla (ASR) publicado por `extraordinarylab` como conversion a formato Hugging Face Transformers del checkpoint original `nvidia/parakeet-tdt-1.1b`. No se trata de un reentrenamiento: los pesos son identicos a los del modelo de NVIDIA, y lo que cambia es el formato del checkpoint (de `.nemo` a `safetensors`), la configuracion y los envoltorios de tokenizer y extractor de caracteristicas. El modelo desarrollado originalmente por los equipos de NVIDIA NeMo y Suno.ai, y esta version facilita su uso directo desde el ecosistema Transformers sin depender del toolkit NeMo.

La arquitectura combina un encoder FastConformer-XL de 42 capas con `d_model=1024` y una cabeza TDT (Token-and-Duration Transducer) con duraciones `[0, 1, 2, 3, 4]`. El modelo tiene 1.070.521.990 parametros (aproximadamente 1,07 mil millones, segun los safetensors) y un vocabulario de 1024 tokens BPE mas un token blank. Transcribe exclusivamente ingles en minusculas y sin puntuacion.

Su relevancia actual es practica: permite ejecutar un modelo ASR de gama alta con licencia CC-BY-4.0 dentro de pipelines estandar de Transformers (`AutoProcessor` + `ParakeetForTDT`), con paridad numerica verificada frente a NeMo 3.0.0 y una huella de pesos de 4,3 GB en el repositorio. Al estar publicado bajo CC-BY-4.0 y con solo 1,07B de parametros, es una alternativa viable para transcripcion en produccion con requisitos de hardware moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-XL (encoder) + cabeza TDT (Token-and-Duration Transducer) |
| Parametros totales | 1.070.521.990 (aproximadamente 1,07B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo ASR; en las pruebas de paridad se procesaron clips de 13,7 s y 14,2 s) |
| Tipos de cuantizacion | No disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | Ingles (codigo `en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (Transformers); el modelo original se distribuye en formato `.nemo` |

## Arquitectura y entrenamiento

El modelo sigue el esquema Transducer: un encoder FastConformer-XL de 42 capas con dimension de modelo `d_model=1024` que procesa caracteristicas log-mel, seguido de una cabeza de prediccion y una red de union (joint) que emite simultaneamente logits de vocabulario y logits de duracion. En este caso la cabeza es TDT (Token-and-Duration Transducer), con un conjunto de duraciones `[0, 1, 2, 3, 4]`, un vocabulario de 1024 tokens BPE y un token blank. El vocabulario efectivo es de 1025 entradas (`vocab_size == 1025`) y la cabeza joint emite `1025 + 5` logits.

La conversion desde NeMo se realizo con el script `src/transformers/models/parakeet/convert_nemo_to_hf.py` y mantiene los pesos sin modificar. Un detalle relevante de esta conversion es que, a diferencia de los checkpoints `parakeet-tdt-0.6b-v2`/`v3`, el vocabulario NeMo de este modelo no incluye token `<pad>`, por lo que `<blank>` ocupa el primer identificador libre (`1024`) y actua tambien como token de padding: `blank_token_id == pad_token_id == 1024`. No se documenta en esta ficha informacion sobre el dataset de entrenamiento, el numero de tokens de audio, ni fases de RLHF o DPO; esos datos corresponden a la model card original de NVIDIA.

## Capacidades

- Reconocimiento automatico del habla en ingles: transcripcion de audio a texto en minusculas y sin puntuacion.
- Decodificacion greedy sobre la salida del Transducer, con resultados identicos a los de NeMo en las pruebas de paridad realizadas.
- Inferencia por lotes: la verificacion de paridad incluye tanto clips sueltos como un lote de dos clips con padding, con longitudes de salida del encoder coincidentes (172 y 178 frames).
- Extraccion de caracteristicas: el modelo esta etiquetado con `feature-extraction` ademas de `automatic-speech-recognition`, por lo que expone estados ocultos del encoder.
- Procesamiento de audio a 16 kHz mediante el `AutoProcessor` incluido (extractor de caracteristicas log-mel).
- No soporta tool calling ni function calling.
- No esta documentado soporte de agentes ni razonamiento multi-paso.
- No soporta otros idiomas distintos del ingles.
- No incluye traduccion, diarizacion, deteccion de hablante ni puntuacion automatica.
- No se documenta modo thinking, vision ni audio generativo.

## Casos de uso

- Transcripcion por lotes de reuniones en ingles: el modelo procesa lotes con padding (verificado con dos clips) y mantiene la coherencia de longitudes de encoder, lo que permite transcribir colecciones de grabaciones cortas o medianas en una sola pasada.
- Subtitulado base de contenido en ingles: al producir texto en minusculas sin puntuacion, encaja como paso previo a un modulo de restauracion de puntuacion y formato para generar subtitulos.
- Indexacion y busqueda semantica de archivos de audio: las capacidades de `feature-extraction` permiten obtener representaciones del encoder para alimentar sistemas de recuperacion sobre transcripciones o sobre embeddings acusticos.
- Voice analytics en atencion al cliente: transcripcion de llamadas en ingles para clasificacion posterior de motivos, analisis de sentimiento o extraccion de entidades con un modelo de lenguaje separado.
- Documentacion clinica o legal dictada en ingles: al ser un modelo de 1,07B y licencia CC-BY-4.0, puede desplegarse en infraestructura propia para transcripcion de dictados sin enviar audio a servicios externos.
- Asistencia a la accesibilidad: conversion de audio de formacion, tutoriales o grabaciones internas en ingles a texto para personas con discapacidad auditiva.
- Evaluacion comparativa de motores ASR: sirve como referencia de arquitectura Transducer frente a modelos encoder-decoder tipo Whisper en bancos de prueba internos de ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (WER en LibriSpeech, Common Voice u otros) en la informacion disponible. La model card unicamente aporta una verificacion de paridad numerica frente a `nemo_toolkit[asr]` 3.0.0 en CPU y float32, sobre dos clips de LibriSpeech de 13,7 s y 14,2 s, tanto sin lote como en un lote de dos con padding:

| Tensor | Diferencia absoluta maxima |
|---|---|
| Caracteristicas log-mel | 6,5e-05 |
| Estados ocultos del encoder | 1,2e-04 |
| Logits del joint (`vocab + durations`, en el paso blank SOS) | 3,3e-04 |

Ademas, las longitudes de salida del encoder coinciden (172 y 178 frames) y la decodificacion greedy produce identificadores de token y transcripciones identicas en todas las configuraciones probadas.

## Requisitos de hardware

- VRAM estimada en float32: aproximadamente 4,3 GB solo para pesos (el repositorio ocupa 4,3 GB), mas memoria para activaciones y buffer de audio; en las pruebas de paridad se ejecuto en CPU en float32.
- VRAM estimada en float16/bfloat16: en torno a 2,1 GB para pesos.
- VRAM estimada en int8: en torno a 1,1 GB para pesos (estimacion aritmetica a partir de los 1.070.521.990 parametros; el autor no publica checkpoints cuantizados).
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 pueden ejecutar el modelo con holgura incluso en float32.
- GPU de centro de datos recomendadas: A100, H100, L40S o similares para despliegues de alto throughput con batching agresivo.
- Opciones de despliegue: `transformers` con `AutoProcessor` y `ParakeetForTDT` (ruta documentada), y `nemo_toolkit[asr]` 3.0.0 sobre el checkpoint original. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI en la informacion disponible, y no hay formato GGUF publicado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| extraordinarylab/parakeet-tdt-1.1b | 1,07B | FastConformer-XL + TDT | Ingles | CC-BY-4.0 | safetensors (Transformers) |
| nvidia/parakeet-tdt-1.1b | 1,07B | FastConformer-XL + TDT | Ingles | CC-BY-4.0 | `.nemo` (NeMo) |
| nvidia/parakeet-tdt-0.6b-v2 | Aproximadamente 0,6B | FastConformer + TDT | Ingles | No disponible en la informacion proporcionada | `.nemo` |
| openai/whisper-large-v3 | Aproximadamente 1,55B | Encoder-decoder transformer | Multilingue | Apache-2.0 | safetensors (Transformers) |

Los datos de rendimiento (WER) de estas alternativas no estan disponibles en la informacion proporcionada, por lo que no se incluye una comparacion cuantitativa de calidad. La diferencia principal frente a `nvidia/parakeet-tdt-1.1b` es exclusivamente el formato: mismos pesos, distinta envoltura. Frente a `parakeet-tdt-0.6b-v2` cambia el tamano y el tratamiento del token blank/pad (aquel si incorpora `<pad>` en el vocabulario NeMo).

## Limitaciones y advertencias

- Solo ingles: no soporta otros idiomas, ni siquiera con calidad degradada documentada.
- Salida en minusculas y sin puntuacion: requiere un modulo de postprocesado si se necesita texto formateado.
- Sesgos: no se documentan en la informacion disponible; al depender de los datos de entrenamiento de NVIDIA, hereda los sesgos acusticos y dialectales de ese corpus.
- Riesgo de alucinacion: inherente a los modelos Transducer en audio con ruido, silencio o solapamiento de hablantes; no hay evaluacion publicada de este riesgo en la informacion disponible.
- Limite de duracion de audio: no documentado. Las unicas duraciones verificadas son clips de 13,7 s y 14,2 s.
- Detalle de conversion delicado: `blank_token_id == pad_token_id == 1024`. Cualquier postprocesado que asuma identificadores distintos para blank y pad puede producir errores.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion a NVIDIA NeMo, Suno.ai y al autor de la conversion.
- La model card de esta conversion no documenta datos de entrenamiento, evaluacion ni limitaciones propias; para produccion conviene consultar la model card original de NVIDIA antes de tomar decisiones.
- No hay checkpoints cuantizados publicados, por lo que cualquier cuantizacion corre por cuenta del usuario y no esta validada frente a la paridad con NeMo.
- El repositorio registra 0 descargas y 0 likes, sin historial de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/extraordinarylab/parakeet-tdt-1.1b
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-1.1b
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (los resultados obtenidos correspondian a contenidos no relacionados de la Premier League), por lo que no se pueden anadir enlaces adicionales a papers, blogs o demos.
