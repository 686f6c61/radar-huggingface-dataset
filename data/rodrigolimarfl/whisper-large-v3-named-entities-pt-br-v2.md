# RodrigoLimaRFL/whisper-large-v3-named-entities-pt-br-v2

## Resumen

whisper-large-v3-named-entities-pt-br-v2 es un ajuste fino (fine-tuning) del modelo Whisper large-v3 de OpenAI, publicado en Hugging Face por el usuario RodrigoLimaRFL. El nombre del repositorio indica una especializacion en el reconocimiento de entidades nombradas (named entities) para portugues de Brasil, partiendo de la arquitectura encoder-decoder transformer de Whisper orientada a reconocimiento automatico del habla (ASR). El modelo cuenta con 1.543.490.560 parametros reales segun los pesos en safetensors, lo que coincide con el tamano del checkpoint large-v3 original de Whisper (aproximadamente 1.550 millones de parametros).

La relevancia de este modelo radica en su posible utilidad para transcripcion de audio en portugues brasileno con enfasis en la preservacion correcta de nombres propios, toponimos y terminos especificos, un problema recurrente en ASR comercial. Sin embargo, la model card publicada esta practicamente vacia: se trata de la plantilla autogenerada por Hugging Face sin datos de entrenamiento, evaluacion, licencia ni idiomas declarados. El repositorio registra cero descargas y cero likes en el momento de la consulta, y fue creado en noviembre de 2026.

Dado que la informacion disponible es minima, esta ficha se limita a los datos verificables del repositorio (parametros, tamano, pipeline, tags) y a las caracteristicas conocidas de la arquitectura base Whisper large-v3, marcando explicitamente como "no disponible" todo aquello que el autor no ha documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | 1.543.490.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper large-v3 procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion a fp16, int8 e int4 mediante herramientas externas) |
| Idiomas soportados | no disponible en la model card; el nombre del repositorio sugiere portugues de Brasil |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper large-v3: un transformer encoder-decoder con atencion estandar, entrenado originalmente por OpenAI para tareas de reconocimiento automatico del habla, traduccion de voz y deteccion de idioma. Whisper procesa audio en ventanas de 30 segundos convertidas a espectrogramas log-Mel de 80 canales (128 en la version v3) y genera tokens de texto de forma autoregresiva. El checkpoint large-v3 original se entreno con aproximadamente 5 millones de horas de audio supervisado debilmente, aunque no se dispone de datos especificos sobre el dataset utilizado en este ajuste fino.

No hay informacion publicada sobre el procedimiento de entrenamiento de este ajuste: ni el numero de tokens o horas de audio empleadas, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o simplemente fine-tuning supervisado. El tag `arxiv:1910.09700` presente en el repositorio corresponde al articulo de Lacoste et al. sobre el calculo de emisiones de carbono en machine learning, citado en la plantilla de la model card, y no a un paper del modelo. No se documentan innovaciones tecnicas adicionales.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto, presumiblemente optimizada para portugues de Brasil segun el nombre del repositorio.
- Reconocimiento de entidades nombradas en la transcripcion: la denominacion "named-entities" sugiere un ajuste orientado a mejorar la fidelidad de nombres propios, aunque no hay evaluacion publicada que lo confirme.
- Deteccion de idioma y traduccion de voz: capacidades heredadas de la arquitectura Whisper large-v3, no verificadas en este checkpoint.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles en la model card; el nombre indica especializacion en portugues de Brasil.
- Modo thinking, vision o audio adicional: no disponible (solo entrada de audio y salida de texto).

## Casos de uso

- Transcripcion de reuniones corporativas en portugues de Brasil: el modelo puede convertir audio de reuniones en texto, con especial interes en la correcta captura de nombres de personas y empresas, que es precisamente el eje declarado del ajuste.
- Generacion de subtitulos para contenido audiovisual brasileno: util para plataformas de video que necesitan subtitulos automaticos con nombres propios bien transcritos (marcas, lugares, personalidades).
- Actas y notas de prensa a partir de entrevistas: periodistas que graban entrevistas en portugues pueden obtener transcripciones con menor tasa de error en nombres de entrevistados y organizaciones.
- Documentacion clinica dictada: en entornos sanitarios de Brasil, la transcripcion de dictados con nombres de pacientes, medicamentos y diagnosticos podria beneficiarse del ajuste, aunque requeriria validacion especifica.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de podcasts o archivos de call center para permitir busqueda por texto, con ventaja en la recuperacion por nombres propios.
- Subtitulado y transcripcion para accesibilidad: conversion de contenido hablado en portugues a texto accesible para personas con discapacidad auditiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,2 GB en fp16 (tamano del repositorio), en torno a 3,1 GB en int8 y 1,6 GB en int4, estimaciones basadas en el numero de parametros.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues de produccion con alto throughput; RTX 4090, RTX 3090 o RTX 4080 para inferencia en fp16 en una sola GPU.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM en fp16; en int8 puede ejecutarse en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (libreria declarada), vLLM, Faster-Whisper, whisper.cpp, Hugging Face TGI y endpoints compatibles (tag `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles; dependen del hardware, la cuantizacion y la duracion del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RodrigoLimaRFL/whisper-large-v3-named-entities-pt-br-v2 | 1.543.490.560 | Ventanas de audio de 30 s (arquitectura Whisper) | No disponible (probable pt-BR) | No disponible | Hugging Face |
| openai/whisper-large-v3 | 1.550 millones aprox. | Ventanas de audio de 30 s | Multilingue (99 idiomas) | MIT (según el repositorio original) | Hugging Face |
| openai/whisper-large-v2 | 1.550 millones aprox. | Ventanas de audio de 30 s | Multilingue | MIT | Hugging Face |
| openai/whisper-medium | 769 millones aprox. | Ventanas de audio de 30 s | Multilingue | MIT | Hugging Face |

La comparativa se limita a la familia Whisper porque no se dispone de datos de rendimiento de este checkpoint que permitan contrastarlo con alternativas especializadas en portugues (por ejemplo, modelos de la familia Wav2Vec2 o MMS). El modelo base openai/whisper-large-v3 es la referencia natural, pero no hay evidencia publicada de que este ajuste mejore sus resultados.

## Limitaciones y advertencias

- Model card vacia: no se documentan datos de entrenamiento, evaluacion, sesgos ni limitaciones, lo que impide validar las afirmaciones implicitas en el nombre del repositorio.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor o asumir la licencia del modelo base (MIT en el caso de Whisper de OpenAI) con cautela.
- Riesgo de alucinacion: como todo modelo de ASR generativo, puede inventar texto en segmentos con ruido, silencios o audio de baja calidad.
- Sesgos desconocidos: al no haber documentacion, no se pueden evaluar sesgos de genero, raza, acento o dialecto; el ajuste en portugues de Brasil podria degradar el rendimiento en otras variantes del portugues o en otros idiomas.
- Idiomas no declarados: el tag de idioma esta vacio; no hay garantia formal de que el modelo mantenga el multilingueismo de Whisper large-v3.
- Cero adopcion verificable: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion por terceros.
- Fecha de creacion futura (2026-11-07): conviene verificar la integridad y procedencia del repositorio antes de usarlo en entornos productivos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RodrigoLimaRFL/whisper-large-v3-named-entities-pt-br-v2
- Modelo base Whisper large-v3: https://huggingface.co/openai/whisper-large-v3
- Ficha de referencia en free2aitools: https://free2aitools.com/model/rodrigolimarfl/whisper-large-v3-named-entities-pt-br
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
