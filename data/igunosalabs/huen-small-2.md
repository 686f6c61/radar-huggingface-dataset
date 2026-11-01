# igunosalabs/huen-small-2

## Resumen

Huen-small-2 es un modelo de reconocimiento automatico de voz (ASR) publicado en HuggingFace por la organizacion igunosalabs. Segun los metadatos del repositorio, se trata de un modelo basado en la arquitectura Whisper, integrado con la libreria Transformers y distribuido en formato safetensors, con un total de 241.734.912 parametros (aproximadamente 242 millones) y un tamano de repositorio de 1,0 GB.

La model card del repositorio es una plantilla generada automaticamente por HuggingFace y no aporta informacion sustantiva: no describe el proposito del modelo, los datos de entrenamiento, la licencia ni los idiomas soportados. Esto limita la evaluacion rigurosa del modelo, aunque su clasificacion como variante "small" de Whisper permite situarlo en la gama de modelos ASR ligeros, pensados para transcripcion con requisitos de hardware moderados.

La relevancia de este modelo es limitada en su estado actual: con cero descargas y cero likes registrados, sin documentacion y sin licencia declarada, no puede considerarse una opcion consolidada frente a alternativas como Whisper small de OpenAI. Su interes principal es para desarrolladores que quieran inspeccionar los pesos directamente o contactar con el autor para obtener mas detalles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR) |
| Parametros totales | 241.734.912 (~242 M) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible (Whisper small original: 30 segundos por ventana) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los metadatos del repositorio indican que el modelo pertenece a la familia Whisper, una arquitectura de transformer encoder-decoder disenada para reconocimiento automatico de habla. En la variante small original de OpenAI, esta arquitectura consta de 12 capas de encoder y 12 de decoder con una dimension de embedding de 768, y procesa espectrogramas log-Mel de 30 segundos de audio. No hay confirmacion de que huen-small-2 replique exactamente esta configuracion, aunque los ~242 millones de parametros son coherentes con la variante small.

No existe informacion sobre los datos de entrenamiento, el numero de tokens o muestras de audio empleadas, ni sobre si el modelo se entreno desde cero, se ajusto por fine-tuning desde Whisper small de OpenAI o se destilo. La model card no menciona tecnicas como RLHF, DPO o decodificacion especulativa, algo habitual en modelos de ASR puro. Tampoco se documenta el uso de atencion lineal u otras innovaciones arquitectonicas.

## Capacidades

- Reconocimiento automatico de habla (ASR): el pipeline asignado es automatic-speech-recognition, por lo que su funcion prevista es transcribir audio a texto.
- Posible transcripcion multilingue: los modelos Whisper suelen soportar multiples idiomas, pero en este caso los idiomas soportados no estan disponibles y no puede afirmarse.
- No hay evidencia de capacidades adicionales: no es un modelo de generacion de texto general, no soporta tool calling, no esta pensado para agentes ni para razonamiento multi-paso.
- No hay indicios de capacidades de vision, audio generativo o modo de pensamiento extendido.

## Casos de uso

Dada la escasez de documentacion, los casos de uso siguientes son hipotesis razonables para un modelo ASR de ~242 millones de parametros basado en Whisper, pendientes de validacion practica:

- Transcripcion de notas de voz: conversion de grabaciones cortas de voz a texto en aplicaciones moviles o de productividad, aprovechando el tamano contenido del modelo para ejecucion local.
- Subtitulado automatico de videos: generacion de transcripciones para subtitulos en pipelines de edicion de video, con ventanas de audio de 30 segundos tipicas de la arquitectura Whisper.
- Transcripcion en servidor con GPU modesta: integracion en backends de transcripcion donde no se requiere un modelo grande, reduciendo coste de inferencia por hora de audio.
- Prototipado de aplicaciones de voz: uso como componente ASR en demos y pruebas de concepto gracias a su compatibilidad directa con la libreria Transformers.
- Fine-tuning a dominios especificos: punto de partida ligero para ajustar transcripcion a vocabulario tecnico, acentos concretos o jerga de sector, dado su tamano manejable para entrenamiento.
- Procesamiento por lotes de archivos de audio: transcripcion masiva de grabaciones (podcasts, reuniones, llamadas) en colas de trabajo offline donde la latencia en tiempo real no es critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER (word error rate), CER ni comparativas con otros modelos de ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~242 millones de parametros en fp32 (repo de 1,0 GB), se estima un consumo de 1-2 GB de VRAM en inferencia estandar; en fp16, alrededor de 0,5-1 GB. Estas cifras son estimaciones basadas en el tamano de pesos, no datos publicados.
- GPU recomendadas: cualquier GPU moderna de gama media es suficiente; no se requieren A100 ni H100. Una RTX 3060 de 12 GB o superior sobra con diferencia.
- Consumer GPU: cabe con holgura en practicamente cualquier GPU consumer con 4 GB de VRAM o mas, e incluso es plausible su ejecucion en CPU dada la arquitectura Whisper small.
- Opciones de despliegue: libreria Transformers de HuggingFace (formato nativo del modelo). No hay conversiones publicadas a GGUF, por lo que llama.cpp, Ollama y vLLM no son opciones directas sin conversion previa; para ASR con Whisper, faster-whisper (CTranslate2) requiere conversion adicional.
- Latencia y throughput: no disponibles; por referencia, modelos Whisper small suelen transcribir mas rapido que el tiempo real en GPU consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Licencia | Documentacion |
|---|---|---|---|---|
| huen-small-2 (igunosalabs) | ~242 M | no disponible | no disponible | Model card automatica, sin datos |
| Whisper small (OpenAI) | 244 M | 30 s por ventana | MIT | Extensa, benchmarks publicados (WER ~4,8-5,4% en LibriSpeech clean, segun OpenAI) |
| Whisper base (OpenAI) | 74 M | 30 s por ventana | MIT | Extensa, menor precision que small |
| Distil-Whisper small variants | ~166-756 M | 30 s por ventana | MIT/Apache 2.0 | Bien documentadas, hasta ~6x mas rapidas que Whisper |

La comparativa con Whisper small es especialmente relevante porque el numero de parametros coincide casi exactamente (~242 M frente a 244 M), lo que sugiere que huen-small-2 podria ser un fine-tuning o derivado de dicho modelo, aunque el repositorio no lo confirma.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card es una plantilla automatica sin informacion sobre entrenamiento, uso previsto ni limitaciones, lo que impide una evaluacion seria antes de produccion.
- Licencia no declarada: sin licencia especificada, no puede determinarse si el uso comercial esta permitido. Constituye un bloqueador importante para cualquier despliegue en produccion.
- Idiomas no documentados: no se sabe que idiomas soporta ni su rendimiento por idioma, incluido el castellano.
- Riesgo de alucinaciones tipico de Whisper: los modelos de esta familia tienden a inventar texto en silencios o audio ruidoso; al no haber datos del ajuste de este modelo concreto, este riesgo no puede cuantificarse.
- Sin benchmarks publicados: no hay metricas de WER ni comparativas, por lo que la calidad de transcripcion es desconocida frente a Whisper small oficial.
- Adopcion nula: cero descargas y cero likes registrados; no existe comunidad que haya detectado o reportado problemas.
- Sesgos: no documentados. Los modelos Whisper heredan sesgos de sus datos de entrenamiento (peor rendimiento en acentos minoritarios, hablantes no nativos y audio de baja calidad); se desconoce si este modelo los corrige o agrava.
- Origen del modelo incierto: no se indica si deriva de Whisper de OpenAI, cuyo aviso de uso deberia respetarse en tal caso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/igunosalabs/huen-small-2
- Paper de referencia de la arquitectura Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Paper citado en los metadatos del repo (Lacoste et al., 2019, calculadora de impacto de carbono): https://arxiv.org/abs/1910.09700
- No se han encontrado otros enlaces relevantes (blog, demo, repositorio de codigo o paper propio del modelo) en la informacion disponible.
