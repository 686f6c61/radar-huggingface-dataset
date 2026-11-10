# ArchTianui/whisper-large-v3-distil-it-transcriber

## Resumen

`ArchTianui/whisper-large-v3-distil-it-transcriber` es una redistribucion de pesos del modelo de reconocimiento automatico del habla (ASR) `bofenghuang/whisper-large-v3-distil-it-v0.2`, un Whisper large-v3 destilado y ajustado para italiano. El autor original del ajuste es Bofeng Huang; ArchTianui se limita a convertir los pesos a tres formatos de inferencia optimizados (CTranslate2, OpenVINO IR y whisper.cpp GGML) para su uso en la aplicacion de escritorio offline *Transcriber International*.

El modelo resuelve el problema de la transcripcion de audio en italiano en entornos sin conexion y sobre hardware modesto: al tratarse de una destilacion de `openai/whisper-large-v3-turbo`, reduce el coste computacional respecto al large-v3 completo manteniendo la arquitectura encoder-decoder transformer caracteristica de la familia Whisper. El repositorio ocupa 2,3 GB e incluye unicamente artefactos de inferencia cuantizados a int8 (CTranslate2, OpenVINO) y q8_0 (GGML).

Es relevante ahora porque democratiza el despliegue de ASR en italiano en CPU, GPU Intel (incluidas NPU) y GPU de consumo via Vulkan, con verificacion de integridad mediante SHA-256 en el catalogo firmado de la aplicacion. No obstante, el propio autor advierte que el modelo se publica en estado de prueba y que su precision en el contexto de la app aun no ha sido evaluada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), destilado de `openai/whisper-large-v3-turbo` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantizacion | int8 (CTranslate2 y OpenVINO), q8_0 (GGML) |
| Idiomas soportados | italiano (it) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (`ct2/model.bin`), OpenVINO IR (`openvino/*.xml` + `.bin`), GGML (`ggml/ggml-model-q8_0.bin`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder con entrada de log-mel spectrogram en ventanas de 30 segundos y decodificacion autoregresiva de tokens de texto. El modelo base es `bofenghuang/whisper-large-v3-distil-it-v0.2`, una destilacion de `openai/whisper-large-v3-turbo` especializada en italiano, lo que reduce el numero de capas del decoder y, por tanto, el coste de inferencia frente al large-v3 original.

No se dispone en la informacion proporcionada de detalles sobre el corpus de entrenamiento, el numero de tokens de audio, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card remite explicitamente a la ficha del modelo original de Bofeng Huang para esos datos. La innovacion tecnica de este repositorio es exclusivamente de empaquetado: conversion a CTranslate2 con pesos int8 para CPU, a OpenVINO IR int8 para CPU/GPU/NPU Intel y a GGML q8_0 para whisper.cpp con backend Vulkan, con hashes SHA-256 publicados para cada fichero.

## Capacidades

- Transcripcion automatica del habla (ASR) en italiano, tarea principal del modelo.
- Deteccion de actividad de voz y segmentacion implicitas en el pipeline Whisper.
- Salida con marcas de tiempo a nivel de segmento (funcionalidad estandar de Whisper, sujeta a la implementacion del runtime).
- Ejecucion completamente offline en CPU, GPU Intel, NPU Intel y GPU via Vulkan.
- Verificacion de integridad de pesos mediante SHA-256 en el catalogo firmado de la aplicacion.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta vision ni audio mas alla de la transcripcion.
- Capacidad multilingue limitada al italiano; no se documenta traduccion a otros idiomas.

## Casos de uso

- Transcripcion de reuniones y entrevistas en italiano: el modelo procesa audio en ventanas de 30 s y genera texto con marcas de tiempo, adecuado para actas y resumenes posteriores en un pipeline offline.
- Subtitulado de video en italiano: la salida con timestamps permite generar ficheros SRT/VTT sin conexion, util para creadores de contenido y archivos audiovisuales.
- Dictado por voz en aplicaciones de escritorio: al ejecutarse en CPU con CTranslate2 int8 (modelo de 767 MB), cabe en portatiles sin GPU dedicada y permite dictado en tiempo real o casi real.
- Despliegue en hardware Intel con OpenVINO: la variante IR int8 aprovecha iGPU y NPU de portatiles Intel recientes, reduciendo el consumo energetico frente a inferencia en CPU pura.
- Transcripcion en entornos air-gapped: la ausencia de dependencias de red y la verificacion por hash lo hacen apto para entornos sanitarios, legales o industriales con requisitos de confidencialidad.
- Procesamiento por lotes de archivos de audio: la variante GGML q8_0 (818 MB) permite ejecutar whisper.cpp con Vulkan en GPU de consumo para transcribir grandes volumenes de audio en local.
- Investigacion en ASR de bajo recurso: sirve como punto de partida para fine-tuning o evaluacion de tecnicas de destilacion en italiano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la precision del modelo en el contexto de la aplicacion aun no ha sido evaluada y que los modelos que no superen la evaluacion seran retirados.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero CTranslate2 int8 ocupa 767 MB; el GGML q8_0, 818 MB; el encoder OpenVINO IR int8, 641 MB, y el decoder, 120 MB. La huella en memoria durante la inferencia es del orden de 1-2 GB, dependiendo del runtime y del buffer de audio.
- GPU recomendadas: cualquier GPU con soporte Vulkan para whisper.cpp (GTX 1060 o superior, RTX 3060/4090); iGPU o NPU Intel con OpenVINO; no requiere GPU para la variante CTranslate2.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna via Vulkan o en CPU sin GPU dedicada.
- Opciones de despliegue: CTranslate2 (Faster-Whisper), OpenVINO Runtime, whisper.cpp con backend Vulkan, y la aplicacion *Transcriber International*.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (distil-it) | no disponible (destilado de large-v3-turbo) | 30 s por segmento | it | MIT | CT2, OpenVINO, GGML |
| `bofenghuang/whisper-large-v3-distil-it-v0.2` | no disponible | 30 s por segmento | it | MIT | safetensors (original) |
| `openai/whisper-large-v3-turbo` | 809 M | 30 s por segmento | multilingue | MIT | safetensors, CT2, GGML |
| `openai/whisper-large-v3` | 1550 M | 30 s por segmento | multilingue | MIT | safetensors, CT2, GGML |

La ventaja diferencial de este repositorio frente al modelo original de Bofeng Huang es la disponibilidad de pesos ya convertidos y cuantizados para tres runtimes, con hashes verificables. Frente a `whisper-large-v3-turbo` y `whisper-large-v3`, ofrece menor huella y especializacion en italiano a costa de perder cobertura multilingue.

## Limitaciones y advertencias

- Estado de prueba: el autor indica que la precision en el contexto de la aplicacion no ha sido evaluada y que el modelo puede ser retirado si no supera la evaluacion.
- Monolingue: solo soporta italiano; no se documenta traduccion ni transcripcion en otros idiomas.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible en segmentos con silencio, ruido o audio musical.
- Sesgos: no se documentan analisis de sesgos de genero, dialecto o acento; al derivar de Whisper, hereda los sesgos del corpus original de OpenAI.
- Limitaciones de contexto: la ventana de audio es de 30 s por segmento, lo que requiere segmentacion previa en audios largos.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre precision ni idoneidad para produccion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de WER frente a alternativas, lo que dificulta la seleccion informada.
- Dependencia de la aplicacion: los hashes SHA-256 estan pensados para el catalogo firmado de *Transcriber International*; su uso fuera de esa app requiere verificar manualmente la integridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ArchTianui/whisper-large-v3-distil-it-transcriber
- Modelo base (Bofeng Huang): https://huggingface.co/bofenghuang/whisper-large-v3-distil-it-v0.2
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- OpenVINO: https://github.com/openvinotoolkit/openvino
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
