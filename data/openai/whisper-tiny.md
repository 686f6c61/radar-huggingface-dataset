# openai/whisper-tiny

## Resumen

Whisper-tiny es el checkpoint mas pequeno de la familia Whisper, una serie de modelos de reconocimiento automatico del habla (ASR) y traduccion de voz desarrollada por OpenAI. Se trata de un transformer encoder-decoder (sequence-to-sequence) entrenado sobre 680.000 horas de audio etiquetado mediante supervision debil a gran escala, con 37,76 millones de parametros reales registrados en safetensors (aproximadamente 39 M segun la model card). Su proposito es transcribir audio a texto en el mismo idioma y traducir voz a texto en otro idioma, generalizando a dominios y conjuntos de datos para los que no fue ajustado de forma especifica.

La relevancia de este checkpoint concreto reside en su tamano minimo dentro de la familia: al ser la variante tiny, permite ejecutar inferencia en CPU, dispositivos de borde y GPUs de gama baja con un consumo de memoria muy reducido, lo que lo convierte en una opcion habitual para prototipado rapido, pipelines de alto volumen y despliegues con restricciones de recursos. Es compatible con las librerias transformers, PyTorch, TensorFlow y JAX, y esta publicado bajo licencia Apache 2.0, lo que facilita su uso comercial.

El modelo forma parte de una familia de cinco configuraciones (tiny, base, small, medium y large) en versiones solo-ingles y multilingue. La variante aqui descrita es multilingue y cubre alrededor de 99 idiomas, entre ellos el castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos (procesamiento por fragmentos) |
| Tipos de cuantizacion | no disponible en la model card; soporta pesos safetensors, PyTorch, TF y JAX |
| Idiomas soportados | 99 idiomas, incluyendo en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, entre otros |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, PyTorch, TensorFlow, JAX |

## Arquitectura y entrenamiento

Whisper-tiny es un transformer encoder-decoder tambien denominado modelo sequence-to-sequence. El encoder procesa representaciones log-Mel del audio y el decoder genera texto autorregresivamente. La tarea y el idioma se controlan mediante tokens de contexto que se anteponen a la decodificacion, en el orden `<|startoftranscript|>`, token de idioma (por ejemplo `<|en|>`), token de tarea (`<|transcribe|>` para reconocimiento o `<|translate|>` para traduccion) y, opcionalmente, `<|notimestamps|>` para suprimir la prediccion de marcas temporales.

El entrenamiento se realizo sobre 680.000 horas de datos de voz etiquetados mediante supervision debil a gran escala, sin ajuste fino posterior especifico por tarea. Los modelos solo-ingles se entrenaron unicamente para reconocimiento del habla, mientras que los multilingues se entrenaron simultaneamente para reconocimiento y traduccion. La model card no detalla el uso de RLHF, DPO ni tecnicas de decodificacion especulativa para este checkpoint.

## Capacidades

- Reconocimiento automatico del habla: transcribe audio a texto en el mismo idioma que la locucion.
- Traduccion de voz: genera texto en un idioma distinto al del audio de entrada.
- Soporte multilingue en aproximadamente 99 idiomas, con token de seleccion de idioma explicito.
- Prediccion de marcas temporales a nivel de segmento (se puede activar o desactivar con `<|notimestamps|>`).
- Robustez ante variaciones de dominio sin fine-tuning, gracias al entrenamiento con supervision debil a gran escala.
- Procesamiento por fragmentos de audio de 30 segundos.
- No dispone de tool calling, function calling ni capacidades de agente; es un modelo puramente acustico-textual.
- No tiene vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion en tiempo casi real en dispositivos de borde: su tamano de 37,76 M de parametros permite ejecutarlo en CPU o en SoC de baja potencia para subtitulado en directo de reuniones o notas de voz.
- Preprocesado de grandes volumenes de audio: pipelines por lotes donde el coste por hora de audio es critico y la precision absoluta es secundaria (por ejemplo, indexacion de podcasts o archivos de call center).
- Prototipado rapido de aplicaciones ASR: validar un producto de dictado o transcripcion antes de escalar a checkpoints mayores de la misma familia.
- Traduccion de voz ligera: conversion de audio en un idioma a texto en otro sin necesidad de un modelo de traduccion separado, util para notas multilingues.
- Generacion de subtitulos con marcas temporales: al activar la prediccion de timestamps, se pueden producir subtitulos sincronizados para video.
- Filtrado y enrutado previo: transcripcion rapida para clasificar o enrutar llamadas antes de pasarlas a un modelo mayor o a un LLM de analisis.
- Asistentes de voz embebidos: comandos de voz en aplicaciones moviles o de escritorio que requieren baja latencia y sin conexion a la nube.
- Investigacion y ensenanza: referencia ligera para experimentar con arquitecturas encoder-decoder de audio y comparar tecnicas de cuantizacion.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Conjunto de datos | Idioma | Metrica | Valor |
|---|---|---|---|---|
| Reconocimiento automatico del habla | LibriSpeech (clean), test | en | Test WER | 7,54 |
| Reconocimiento automatico del habla | LibriSpeech (other), test | en | Test WER | 17,15 |
| Reconocimiento automatico del habla | Common Voice 11.0 (hi), test | hi | Test WER | 141 |

El WER de 141 sobre Common Voice 11.0 en hindi evidencia un rendimiento muy limitado en idiomas distintos del ingles para esta variante tiny.

## Requisitos de hardware

- VRAM estimada: aproximadamente 150 MB en fp32, unos 75 MB en fp16 y alrededor de 38 MB en int8, solo para los pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; una RTX 4090, A100 o H100 estan enormemente sobredimensionadas para este checkpoint.
- Cabe en cualquier GPU de consumo e incluso en GPU integradas; la inferencia en CPU es totalmente viable.
- Opciones de despliegue: transformers (PyTorch, TF, JAX), whisper.cpp, faster-whisper, vLLM y TGI. Endpoints compatibles con despliegue en SageMaker y Azure segun las etiquetas del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen en gran medida del hardware y del backend (CPU frente a GPU) y del tamano de los fragmentos de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | WER LibriSpeech clean | Disponibilidad |
|---|---|---|---|---|---|
| whisper-tiny | 39 M | Multilingue (99) | apache-2.0 | 7,54 | Hugging Face Hub |
| whisper-base | 74 M | Multilingue | apache-2.0 | no disponible | Hugging Face Hub |
| whisper-small | 244 M | Multilingue | apache-2.0 | no disponible | Hugging Face Hub |
| whisper-large-v2 | 1550 M | Multilingue | apache-2.0 | no disponible | Hugging Face Hub |

Los datos de WER de los demas checkpoints no se facilitan en la informacion disponible; la model card solo incluye resultados de rendimiento para whisper-tiny. La tabla de tamanos y parametros de la familia procede de la propia model card de OpenAI.

## Limitaciones y advertencias

- Rendimiento muy limitado en idiomas distintos del ingles: el WER de 141 en hindi sobre Common Voice 11.0 frente al 7,54 en ingles limpio ilustra una degradacion severa.
- Mayor tasa de error en audio con ruido o acentos no estandar: el WER sube de 7,54 (LibriSpeech clean) a 17,15 (LibriSpeech other).
- Riesgo de alucinacion en transcripciones, especialmente con audio silencioso, ruidoso o de baja calidad; conviene validar la salida en produccion.
- Sesgos derivados de los datos de entrenamiento (supervision debil a gran escala): puede reproducir sesgos de genero, acento, dialecto o registro presentes en las fuentes.
- Ventana fija de 30 segundos: el audio mas largo debe fragmentarse, lo que puede afectar la coherencia en segmentos con contexto entrecortado.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de los datos subyacentes si el modelo se redistribuye o se integra en productos regulados.
- No ofrece capacidades de razonamiento, tool calling ni comprension de imagenes; su ambito se limita a voz y texto.
- Las marcas temporales, aunque soportadas, no garantizan una alineacion precisa a nivel de palabra.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openai/whisper-tiny
- Version solo-ingles: https://huggingface.co/openai/whisper-tiny.en
- Repositorio de codigo original: https://github.com/openai/whisper
- Paper: Robust Speech Recognition via Large-Scale Weak Supervision: https://arxiv.org/abs/2212.04356
- Listado de la familia Whisper en Hugging Face: https://huggingface.co/models?search=openai/whisper
- Documentacion del WhisperProcessor: https://huggingface.co/docs/transformers/model_doc/whisper#transformers.WhisperProcessor
