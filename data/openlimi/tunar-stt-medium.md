# openlimi/Tunar-stt-medium

## Resumen

Tunar-STT-Medium es un modelo de reconocimiento automatico del habla (ASR) especializado en uzbeko, desarrollado por openlimi. Se presenta como un ajuste fino sobre la arquitectura Whisper de tamano "medium" (763.857.920 parametros, segun los pesos en safetensors), orientado a transcribir tanto voz estandar como voz susurrada, de baja amplitud o casi silenciosa, un escenario que los sistemas ASR convencionales suelen fallar.

El modelo se distribuye en formato safetensors para la libreria transformers, con un tamano de repositorio de 3,1 GB, y esta etiquetado para la tarea `automatic-speech-recognition`. Su propuesta de valor se centra en el uzbeko: cubre fonemas estandar y variantes dialectales regionales, y segun el autor mezcla en su entrenamiento habla limpia de estudio, llamadas telefonicas ruidosas y segmentos de voz susurrada.

Es relevante para desarrolladores que necesiten transcripcion en uzbeko en condiciones acusticas adversas (audio de baja ganancia, microfonos lejanos, dictado en voz baja) y para investigadores que trabajen en ASR de bajos recursos o en deteccion de habla susurrada. El modelo es muy reciente y no cuenta con descargas ni likes en el momento de la consulta, por lo que su validacion independiente es practicamente inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) segun tag `whisper`; la model card usa `AutoModelForCTC`, lo que sugiere una cabeza CTC, dato no confirmado |
| Parametros totales | 763.857.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 s; no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | uzbeko (`uz`) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |
| Frecuencia de muestreo | 16 kHz (segun la model card) |
| Tamano del repositorio | 3,1 GB |
| Libreria | transformers |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

La model card etiqueta el modelo como `whisper`, lo que apunta a la arquitectura encoder-decoder transformer de OpenAI para ASR. El numero de parametros (763,9 M) es coherente con la variante Whisper medium. Sin embargo, el ejemplo de codigo del autor emplea `AutoModelForCTC`, lo que introduce una ambiguedad sobre si se trata de un modelo seq2seq Whisper puro o de un ajuste con cabeza CTC; la documentacion no lo aclara.

En cuanto al entrenamiento, el autor indica un ajuste fino sobre un corpus de uzbeko nativo que mezcla habla de estudio limpia, llamadas telefonicas con ruido y segmentos de voz susurrada. Se menciona soporte de acentos y variantes dialectales regionales. No se especifican el numero de tokens ni de horas de audio, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o aumentacion especifica. Tampoco se detalla ninguna innovacion arquitectonica mas alla del ajuste de dominio (deteccion de voz de baja amplitud). La salida se formatea en transcripcion estandar de uzbeko y la entrada se procesa a 16 kHz.

## Capacidades

- Transcripcion de voz a texto en uzbeko (`uz`), unico idioma declarado.
- Reconocimiento de habla susurrada, voz de baja amplitud y audio casi silencioso (el autor lo denomina "MuteVoice").
- Robustez frente a ruido y condiciones telefonicas, segun la model card.
- Cobertura de acentos y variantes dialectales regionales del uzbeko.
- Salida en ortografia estandar de uzbeko.
- Entrada de audio a 16 kHz via `AutoProcessor`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio generativo ni modo de razonamiento explicito.
- No se documenta capacidad multilingue mas alla del uzbeko.

## Casos de uso

- Transcripcion de reuniones y clases en uzbeko: el modelo puede convertir grabaciones de aula o sala de reunion a texto, con ventaja en segmentos donde los ponentes hablan bajo o lejos del microfono.
- Subtitulado de contenido audiovisual uzbeko: generacion de subtitulos a partir de audio de baja ganancia o con ruido de fondo, aprovechando el ajuste sobre habla telefonica y susurrada.
- Atencion al cliente y centros de llamadas: transcripcion de conversaciones telefonicas ruidosas en uzbeko para analitica, control de calidad o busqueda en historicos de llamadas.
- Dictado personal en voz baja: casos donde el usuario no puede hablar alto (bibliotecas, oficinas compartidas, entornos nocturnos) y necesita un ASR que funcione con voz susurrada.
- Accesibilidad y notas de voz: conversion de mensajes de voz de baja amplitud en aplicaciones de mensajeria a texto legible.
- Investigacion en ASR de bajos recursos: base para experimentos de reconocimiento de habla susurrada y evaluacion de WER/CER en uzbeko, dado que la model card declara metricas `wer` y `cer`.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de un archivo historico en uzbeko para hacerlo consultable por texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara las metricas `wer` y `cer`, pero no aporta valores numericos ni comparaciones con Tunar-stt-tiny u otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,1 GB solo de pesos, mas activaciones y cache; en la practica, unos 4-6 GB.
- En fp16/bf16: alrededor de 1,6 GB de pesos, con un total estimado de 2,5-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16, como RTX 3060, RTX 4060, RTX 4090, A100 o H100; en consumer GPU de gama media-baja es viable.
- Despliegue: transformers (libreria declarada). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de audio, las opciones tipicas serian transformers, un servidor de inferencia compatible con Whisper o un endpoint de Hugging Face (`endpoints_compatible` aparece en los tags).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tunar-STT-Medium | 763,9 M | no disponible | uzbeko | creativeml-openrail-m | Hugging Face, 0 descargas |
| Whisper medium (OpenAI) | ~769 M | ventanas de 30 s de audio | multilingue (99 idiomas) | MIT | ampliamente disponible |
| Tunar-stt-tiny (openlimi) | no disponible | no disponible | uzbeko | no disponible | Hugging Face (mencionado en la model card) |

La comparacion con Whisper medium es la mas directa por tamano y arquitectura de base, pero Tunar-STT-Medium esta especializado en uzbeko y en habla susurrada, mientras que Whisper medium es multilingue y generico. Tunar-stt-tiny se cita como la variante ligera del mismo autor, con mayor WER segun la model card, aunque sin cifras publicadas. No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta uzbeko; no se declara capacidad multilingue.
- Ausencia total de validacion independiente: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados con cifras.
- Ambiguedad arquitectonica: los tags indican Whisper, pero el codigo de ejemplo usa `AutoModelForCTC`; conviene verificar la clase correcta antes de desplegar.
- La model card no detalla el dataset de entrenamiento, el numero de horas ni el proceso de filtrado, lo que dificulta evaluar sesgos y cobertura dialectal.
- Riesgo de alucinacion en audio silencioso o con ruido extremo, habitual en modelos ASR; especialmente relevante dado que el modelo esta optimizado para voz de baja amplitud.
- Licencia CreativeML OpenRAIL-M: permite uso comercial pero impone restricciones de uso (no uso para fines ilegales o daninos) y obligaciones de redistribucion de la licencia; revisar los terminos antes de integrar en producto.
- Sin garantias de rendimiento en produccion: no hay datos de latencia, throughput ni estabilidad en audio de larga duracion.
- El ajuste a voz susurrada puede degradar la transcripcion de voz normal o de otros idiomas; no se documenta el equilibrio entre ambos regimenes.
- Fecha de creacion muy reciente (2026-11-18) y sin historial de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openlimi/Tunar-stt-medium
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Referencia del idioma uzbeko: https://en.wikipedia.org/wiki/Uzbek_language
