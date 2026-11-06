# Peacockery/parakeet-tdt-110m-tajik

## Resumen

parakeet-tdt-110m-tajik es un modelo de reconocimiento automatico del habla (ASR) para tayiko (codigo ISO `tg`), desarrollado por Peacockery Studio mediante ajuste fino del checkpoint NVIDIA/Suno `nvidia/parakeet-tdt_ctc-110m`. El repositorio aloja una copia inmutable del checkpoint tayiko v1.1.0; el modelo mantenido, con instrucciones de uso, resultados de evaluacion e historial de versiones, reside en `Peacockery/tajik-parakeet-tdt-110m`.

El modelo parte de la familia Parakeet de NVIDIA, que emplea una arquitectura FastConformer con decodificacion conjunta TDT/CTC (Token-and-Duration Transducer y Connectionist Temporal Classification) y un total de 110 millones de parametros. Esta orientado a transcripcion de voz en un idioma de bajos recursos, el tayiko, para el que existen pocos sistemas ASR publicos de calidad.

Su relevancia radica en que cubre una lengua poco representada en el ecosistema ASR open source, con licencia permisiva CC BY 4.0 y un tamano reducido que permite despliegue en hardware modesto. El repositorio ocupa 0,5 GB e incluye el fichero `model.nemo`, formato nativo de NVIDIA NeMo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificacion TDT y CTC (Parakeet) |
| Parametros totales | 110 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tayiko (`tg`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.nemo` (formato nativo de NVIDIA NeMo) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Parakeet de NVIDIA: un encoder FastConformer, variante de Conformer con atencion por bloques y submuestreo agresivo del audio, combinado con un decodificador TDT (Token-and-Duration Transducer) que predice conjuntamente tokens y duraciones, y una cabeza CTC auxiliar. Esta combinacion permite decodificacion rapida y robusta, habitual en la familia Parakeet.

El checkpoint base `nvidia/parakeet-tdt_ctc-110m` fue desarrollado por NVIDIA y Suno. Sobre el se realizo un ajuste fino supervisado para tayiko por parte de Peacockery Studio, si bien la informacion proporcionada no detalla el volumen de datos de entrenamiento, la composicion del corpus tayiko, ni si se aplicaron tecnicas de aumento de datos o regularizacion especificas. No se dispone de informacion sobre RLHF, DPO ni otras fases de alineacion, algo por otra parte poco habitual en modelos ASR.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en tayiko.
- Decodificacion dual TDT y CTC, lo que permite elegir el modo de decodificacion segun latencia y precision.
- Procesamiento de audio de entrada con el frontend estandar de NeMo (log-mel spectrogram).
- No se documentan capacidades de traduccion, diarizacion, puntuacion automatica ni deteccion de idioma.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo ASR).
- Capacidad multilingue limitada al tayiko; no se indica soporte de otros idiomas.

## Casos de uso

- Transcripcion de reuniones y entrevistas en tayiko: el modelo convierte grabaciones de audio en texto para actas o subtitulos, aprovechando su tamano reducido para procesar lotes en CPU o GPU modesta.
- Subtitulado automatico de contenido audiovisual tayiko: integrable en pipelines de postproduccion para generar subtitulos en tayiko que luego se revisan manualmente.
- Archivado y busqueda de audio historico: transcripcion masiva de archivos sonoros en tayiko para indexacion y busqueda por texto.
- Asistentes de voz para hablantes de tayiko: componente ASR en sistemas de dictado o interfaces conversacionales en ese idioma.
- Investigacion linguistica y corpus: generacion de transcripciones para construir corpus de tayiko hablado y estudios foneticos.
- Accesibilidad: conversion de audio a texto para personas con discapacidad auditiva en comunidades tayikoparlantes.
- Evaluacion comparativa de ASR de bajos recursos: punto de referencia para experimentos con otras lenguas de la familia irania o de Asia Central.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio remite al modelo mantenido (`Peacockery/tajik-parakeet-tdt-110m`) para consultar los resultados de evaluacion, que no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 110 millones de parametros, la huella en precision FP16 ronda los 0,22 GB de pesos, mas overhead de activaciones y del framework NeMo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM deberia ser suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 son validas, aunque el modelo es claramente sobredimensionado para estas ultimas.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: NVIDIA NeMo (formato `.nemo` nativo); no se documenta soporte de llama.cpp, Ollama, vLLM ni TGI, que no estan orientados a este tipo de modelo ASR.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parakeet-tdt-110m-tajik | 110 M | tayiko | no disponible | CC BY 4.0 | Hugging Face (NeMo) |
| nvidia/parakeet-tdt_ctc-110m (base) | 110 M | ingles | no disponible | no disponible en la informacion | Hugging Face (NeMo) |
| Whisper small (OpenAI) | 244 M | multilingue (99 idiomas) | 30 s por ventana | MIT | Hugging Face, multiples runtimes |
| Whisper large-v3 (OpenAI) | 1.550 M | multilingue (99 idiomas) | 30 s por ventana | MIT | Hugging Face, multiples runtimes |

Nota: la comparacion con Whisper se ofrece como referencia de categoria; no se dispone de metricas comparativas de WER entre estos modelos en tayiko en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma unico: solo tayiko; no se garantiza comportamiento correcto en otras lenguas.
- Riesgo de alucinacion: como todo modelo ASR, puede generar texto plausible pero incorrecto en audio ruidoso, con acentos no vistos o con solapamiento de hablantes.
- Sesgos: no se documentan analisis de sesgo por genero, edad, dialecto o region; el corpus de ajuste fino no se describe.
- Datos de evaluacion no incluidos en este repositorio; deben consultarse en el modelo mantenido.
- Este repositorio es una copia congelada (v1.1.0); no recibira actualizaciones. Para desarrollo activo debe usarse `Peacockery/tajik-parakeet-tdt-110m`.
- Licencia CC BY 4.0: permite uso comercial con atribucion obligatoria a NVIDIA/Suno y Peacockery Studio, segun el fichero NOTICE.
- Formato `.nemo`: requiere el ecosistema NeMo, lo que limita su integracion en stacks que solo admiten safetensors o GGUF.
- No se documentan requisitos de audio (frecuencia de muestreo, duracion maxima) en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Peacockery/parakeet-tdt-110m-tajik
- Modelo mantenido: https://huggingface.co/Peacockery/tajik-parakeet-tdt-110m
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- NVIDIA NeMo (framework): https://github.com/NVIDIA/NeMo
