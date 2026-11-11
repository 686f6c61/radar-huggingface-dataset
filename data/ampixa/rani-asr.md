# ampixa/rani-asr

## Resumen

Rani-ASR es un modelo de reconocimiento automatico del habla (ASR) especializado en nepalí, publicado por el usuario ampixa en Hugging Face bajo el identificador `ampixa/rani-asr`. El modelo se distribuye en formato NeMo y emplea una arquitectura de tipo Conformer, segun indican sus etiquetas. Su proposito es transcribir audio en nepalí a texto, una tarea para la que existen relativamente pocos modelos abiertos en comparacion con lenguas de mayor cobertura.

El modelo tiene un tamano de repositorio de 2.0 GB, lo que sugiere un modelo de pesos completos en formato NeMo (probablemente `.nemo`), sin cuantizaciones publicadas. La licencia es una licencia personalizada denominada `rani-model-licence` y el acceso es restringido (gated), de modo que es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

La relevancia del modelo radica en su especializacion: frente a modelos multilingues genericos, un ASR dedicado al nepalí puede ofrecer mejor rendimiento en ese idioma concreto, aunque no se han publicado metricas de benchmarks en la informacion disponible. El modelo esta pensado para integrarse en el ecosistema NVIDIA NeMo, lo que facilita su despliegue en pipelines de ASR existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (segun tags del repositorio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | nepalí (ne) |
| Licencia | rani-model-licence (licencia personalizada, acceso restringido) |
| Formato de pesos | NeMo (`.nemo`), repositorio de 2.0 GB |

## Arquitectura y entrenamiento

La arquitectura indicada en las etiquetas del repositorio es Conformer, un modelo hibrido que combina capas convolucionales y mecanismos de auto-atencion, habitual en sistemas ASR modernos por su capacidad de capturar dependencias locales y globales en la senal de audio. El modelo se distribuye a traves de la libreria NVIDIA NeMo, lo que implica que sigue las convenciones de dicho framework para modelos de reconocimiento automatico del habla.

No se dispone de informacion sobre el numero de parametros, el volumen o composicion del dataset de entrenamiento, ni sobre el uso de tecnicas de ajuste como RLHF, DPO o fine-tuning supervisado. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras) en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla en nepalí (transcripcion de audio a texto).
- Integracion con el ecosistema NVIDIA NeMo para inferencia y despliegue.
- Modelo especializado en un unico idioma, lo que puede traducirse en mejor rendimiento en nepalí que modelos multilingues genericos.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento extendido.
- No se documentan capacidades multilingues adicionales mas alla del nepalí.

## Casos de uso

- Transcripcion de reuniones y entrevistas en nepalí: el modelo puede convertir grabaciones de audio en texto para actas, resumenes o busqueda posterior, aprovechando su especializacion en el idioma.
- Subtitulado automatico de contenido audiovisual en nepalí: util para plataformas de video o medios que necesiten generar subtitulos en nepalí sin depender de servicios propietarios.
- Atencion al cliente en nepalí: transcripcion de llamadas o mensajes de voz para su analisis, clasificacion o registro en sistemas CRM.
- Accesibilidad: conversion de audio a texto para personas con discapacidad auditiva en contextos donde el nepalí es la lengua principal.
- Investigacion linguistica y sociolinguistica: generacion de corpus transcritos de nepalí para estudios de la lengua, con la ventaja de un modelo abierto y especializado.
- Archivado y digitalizacion de material oral: transcripcion de archivos historicos o grabaciones de campo en nepalí para su preservacion y consulta.
- Integracion en pipelines de procesamiento de voz: uso como componente ASR dentro de sistemas de dictado, asistentes de voz o analitica de audio en nepalí, aprovechando el formato NeMo para su despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio de 2.0 GB sugiere que el modelo puede cargarse en GPUs con al menos 4-8 GB de VRAM, aunque este dato no esta confirmado en la informacion proporcionada.
- GPU recomendadas: no disponible. Por el tamano del repositorio, es plausible que funcione en GPUs consumer (RTX 3060, RTX 4090) y en GPUs de datacenter (A100, H100), pero no se dispone de datos oficiales.
- Cabe en GPU consumer: no confirmado, aunque el tamano de 2.0 GB lo hace probable.
- Opciones de despliegue: NVIDIA NeMo (framework nativo del modelo). No se documentan otros formatos como GGUF, vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ampixa/rani-asr | nepalí | Conformer | no disponible | no disponible | rani-model-licence (gated) | Hugging Face (acceso restringido) |
| Alternativas especializadas en nepalí | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El acceso es restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar el modelo, lo que puede limitar su uso automatizado.
- La licencia `rani-model-licence` es personalizada; deben revisarse sus terminos antes de cualquier uso comercial, ya que no se detallan en la informacion disponible.
- Modelo especializado unicamente en nepalí; no soporta otros idiomas.
- No se han publicado benchmarks, por lo que el rendimiento real en produccion es desconocido.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos ASR, especialmente en audio con ruido, acentos marcados o vocabulario tecnico.
- No se documentan sesgos conocidos ni limitaciones de contexto.
- El modelo tiene muy pocas descargas y likes (1 descarga, 0 likes), lo que sugiere escasa validacion por parte de la comunidad.
- Formato NeMo: requiere el ecosistema NVIDIA NeMo para su uso, lo que puede anadir complejidad frente a formatos mas extendidos.

## Enlaces

- Hugging Face: https://huggingface.co/ampixa/rani-asr
