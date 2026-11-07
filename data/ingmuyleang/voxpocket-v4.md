# INGMUYLEANG/VoxPocket-v4

## Resumen

VoxPocket-v4 es un modelo de texto a voz (TTS) especializado en jemer (khmer) con capacidad de mezcla de codigos jemer-ingles, desarrollado por el usuario INGMUYLEANG y publicado en Hugging Face. Se trata de un ajuste fino (finetune) del modelo base openbmb/VoxCPM1.5, un sistema TTS de la familia VoxCPM, adaptado especificamente al dominio linguistico jemer mediante el dataset INGMUYLEANG/voxpocket-khmer-tts-v3. El modelo cuenta con aproximadamente 801 millones de parametros y se distribuye en formato safetensors bajo licencia Apache 2.0.

El modelo resuelve un problema concreto: la escasez de sistemas TTS de calidad para jemer, un idioma de bajos recursos con escritura propia y fonologia compleja. Al partir de VoxCPM1.5, hereda las capacidades de clonacion de voz y sintesis neuronal del modelo base, pero las reorienta hacia el jemer y hacia escenarios de code-mixing (alternancia jemer-ingles), frecuentes en contextos urbanos y tecnologicos de Camboya.

Es relevante ahora porque los modelos TTS multilingues de codigo abierto rara vez cubren idiomas del sudeste asiatico con escritura no latina, y menos aun con soporte explicito de mezcla de codigos. Su publicacion como acceso restringido (gated) y con cero descargas en el momento de la ficha indica que se trata de un lanzamiento muy reciente y de nicho, orientado a investigadores y desarrolladores que trabajan con jemer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia VoxCPM, TTS neuronal basada en el modelo base openbmb/VoxCPM1.5) |
| Parametros totales | 801.729.856 (~802 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | jemer (km), ingles (en); soporte de code-mixing km-en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Se sabe que es un ajuste fino del modelo base openbmb/VoxCPM1.5, un sistema de sintesis de voz de la familia VoxCPM, y que la libreria asociada es `voxcpm`. El modelo se ha especializado mediante fine-tuning sobre el dataset INGMUYLEANG/voxpocket-khmer-tts-v3, orientado a TTS en jemer. No se especifican el numero de tokens de audio, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras estrategias de alineacion durante el ajuste.

La innovacion destacable, segun las etiquetas del modelo, es el soporte de voice cloning y de code-mixing jemer-ingles, lo que permite sintetizar habla que alterna palabras en ambos idiomas dentro de una misma frase, un fenomeno habitual en el habla cotidiana camboyana. No se dispone de informacion sobre mecanicas de decodificacion especulativa, atencion lineal ni otras optimizaciones tecnicas concretas.

## Capacidades

- Sintesis de voz (text-to-speech) en jemer a partir de texto escrito en escritura jemer.
- Clonacion de voz (voice cloning), segun las etiquetas del modelo.
- Mezcla de codigos jemer-ingles (code-mixing): generacion de habla que alterna terminos en ambos idiomas.
- Soporte de ingles como idioma secundario dentro del pipeline TTS.
- Integracion con la libreria `voxcpm` para inferencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada; es un modelo exclusivamente de sintesis de voz.

## Casos de uso

- Locucion de contenido editorial en jemer: el modelo puede sintetizar articulos, noticias o entradas de blog en jemer para su publicacion como audio, aprovechando su especializacion en este idioma y su capacidad de clonacion para mantener una voz de marca consistente.
- Audiolibros y narracion: con voice cloning se puede generar una voz estable a lo largo de capitulos completos, lo que resulta adecuado para narracion larga en jemer.
- Asistentes de voz para aplicaciones locales: integracion en apps camboyanas que necesitan respuestas habladas en jemer, incluyendo frases con terminos tecnicos en ingles (code-mixing), frecuentes en dominios como banca o tecnologia.
- Accesibilidad: conversion de texto a voz para usuarios con discapacidad visual o dificultades de lectura en jemer, un idioma con menor cobertura en herramientas TTS comerciales.
- Doblaje y localizacion de contenido: generacion de pistas de voz en jemer para videos, tutoriales o material formativo, con la posibilidad de clonar la voz del locutor original.
- Investigacion en TTS de bajos recursos: el modelo sirve como punto de partida para experimentos de fine-tuning, evaluacion de code-mixing y comparacion de tecnicas de sintesis en idiomas del sudeste asiatico.
- Prototipado de interfaces conversacionales: desarrollo de demos de IVR o chatbots de voz en jemer antes de invertir en soluciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~802 M de parametros, en precision FP16 el modelo requiere aproximadamente 1,6 GB solo para los pesos; en FP32, unos 3,2 GB. A ello hay que sumar el overhead del pipeline TTS (vocoder, buffers de audio), por lo que se estima un consumo total en torno a 3-5 GB en FP16, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no disponible de forma oficial. Por tamano, una GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) deberia ser suficiente; para despliegue en servidor, A100 o H100 no son necesarias pero ofrecerian mayor throughput en lotes.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con 6-8 GB de VRAM, dado el tamano del modelo.
- Opciones de despliegue: la libreria oficial es `voxcpm`; no se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| INGMUYLEANG/VoxPocket-v4 | ~802 M | km, en (code-mixing) | Apache 2.0 | Gated | Fine-tune de VoxCPM1.5 para jemer |
| openbmb/VoxCPM1.5 | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva VoxPocket-v4 |
| Alternativas TTS multilingues de codigo abierto | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria; los datos de modelos comparables no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, lo que anade friccion a la evaluacion y al despliegue.
- Modelo de nicho con cero descargas y cero likes en el momento de la ficha: no hay evidencia de comunidad, validacion externa ni reportes de calidad.
- No se han publicado benchmarks ni evaluaciones objetivas de naturalidad, intelligibilidad o similitud de voz; el rendimiento real es desconocido.
- Riesgo de alucinacion acustica y artefactos: como todo modelo TTS ajustado con datos limitados, puede producir pronunciaciones incorrectas, prosodia irregular o ruido en fonemas poco representados.
- Cobertura limitada a jemer e ingles: no se debe esperar buen rendimiento en otros idiomas ni en escrituras distintas.
- Sesgos potenciales derivados del dataset de entrenamiento: la voz y el acento generados pueden reflejar las caracteristicas demograficas de los hablantes del corpus INGMUYLEANG/voxpocket-khmer-tts-v3, que no se documentan.
- Consideraciones eticas de voice cloning: la clonacion de voz puede emplearse para suplantacion; es responsabilidad del usuario obtener consentimiento y cumplir la normativa aplicable.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base openbmb/VoxCPM1.5, ya que el fine-tune hereda posibles restricciones adicionales no reflejadas en la informacion disponible.
- Informacion tecnica incompleta: no se documentan contexto, cuantizaciones soportadas, latencia ni requisitos oficiales de hardware, lo que dificulta la planificacion de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/INGMUYLEANG/VoxPocket-v4
- Modelo base: https://huggingface.co/openbmb/VoxCPM1.5
- Dataset de entrenamiento: https://huggingface.co/datasets/INGMUYLEANG/voxpocket-khmer-tts-v3
- Repositorio GitHub relacionado (aplicacion VoxPocket): https://github.com/LeePepe/VoxPocket
