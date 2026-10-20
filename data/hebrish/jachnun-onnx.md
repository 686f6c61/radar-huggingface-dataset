# Hebrish/Jachnun-ONNX

## Resumen

Jachnun-ONNX es la exportación a formato ONNX del modelo de reconocimiento automático del habla Hebrish/Jachnun, desarrollado por el usuario Hebrish. Se trata de un modelo de ASR especializado en *code-switching* entre hebreo e inglés, es decir, en transcribir audio en el que el hablante alterna ambos idiomas dentro de la misma conversación, algo habitual en contextos profesionales y tecnológicos en Israel. El repositorio se publica bajo la librería `onnx` y con la etiqueta de pipeline `automatic-speech-recognition`.

La arquitectura corresponde a la familia NeMo Conformer con decodificador TDT (*Token-and-Duration Transducer*), según las etiquetas `nemo-conformer-tdt` y `tdt` del repositorio, con referencias a `parakeet` y a `voxtype`/`onnx-asr` como ecosistema de despliegue. No se especifican en la información disponible el número de parámetros, el volumen de datos de entrenamiento ni la ventana de audio máxima. El tamaño total del repositorio es de 15,7 GB, lo que sugiere la inclusión de múltiples exportaciones ONNX (posiblemente con distintas precisiones), aunque el desglose por fichero no está disponible.

Su relevancia actual radica en dos factores: por un lado, cubre un par de idiomas poco atendido por los modelos ASR multilingües genéricos; por otro, el formato ONNX y las herramientas asociadas (`onnx-asr`, `voxtype`) facilitan el despliegue en producción sin depender del stack completo de NeMo. El acceso está restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de descargar los pesos. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con decodificador TDT (Token-and-Duration Transducer), familia NeMo; exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; no se especifica la ventana de audio maxima) |
| Tipos de cuantizacion | el repositorio incluye variantes cuantizadas (etiqueta `base_model:quantized`); el detalle de precisiones por fichero no esta disponible |
| Idiomas soportados | ingles (`en`) y hebreo (`he`), con cambio de codigo entre ambos |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Tarea | reconocimiento automatico del habla (`automatic-speech-recognition`) |
| Tamano del repositorio | 15,7 GB |
| Modelo base | Hebrish/Jachnun |
| Acceso | restringido (gated), requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 32 / 0 |
| Fecha de creacion (metadatos) | 2026-10-16 |
| Ultima actualizacion (metadatos) | 2026-10-20 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Conformer, que combina capas de autoatencion con convoluciones profundas para capturar dependencias tanto globales como locales en la secuencia de audio. Sobre esa representacion se aplica un decodificador TDT (*Token-and-Duration Transducer*), una variante de los transductores RNN-T en la que el modelo predice conjuntamente el token de salida y su duracion. Esto permite emitir varios tokens por fotograma y reducir la latencia frente a los transductores clasicos, ademas de facilitar la decodificacion en streaming por bloques.

La exportacion a ONNX esta pensada para inferencia portable: elimina la dependencia del runtime de PyTorch/NVIDIA NeMo en el momento del servicio y permite ejecutar el grafo con ONNX Runtime en CPU, GPU o aceleradores especificos. Las etiquetas del repositorio (`onnx-asr`, `voxtype`) apuntan a herramientas de la comunidad para cargar y servir directamente este tipo de exportaciones. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni las tecnicas de aumento de datos aplicadas; en modelos ASR de esta familia es habitual el entrenamiento supervisado con CTC/transducer sobre audio transcrito, pero este extremo no se confirma en la informacion proporcionada.

## Capacidades

- Transcripcion de voz a texto en hebreo e ingles, con manejo de *code-switching* dentro de una misma frase o turno de palabra.
- Decodificacion de tipo transducer con prediccion de duracion (TDT), adecuada para transcripcion en tiempo real o cuasi real.
- Inferencia portable mediante ONNX Runtime, sin necesidad del stack de entrenamiento de NeMo.
- Integracion con el ecosistema `onnx-asr` y herramientas asociadas a `voxtype`.
- No se documentan en la informacion disponible capacidades de diarizacion de hablantes, puntuacion automatica, marcas de tiempo a nivel de palabra ni traduccion.
- No se documentan capacidades multimodales (vision, audio-vision) ni de tool calling; es un modelo puramente ASR.

## Casos de uso

- Transcripcion de reuniones tecnicas bilingues: equipos en Israel que alternan hebreo e ingles en una misma sesion pueden transcribir la conversacion completa sin segmentar manualmente por idioma, aprovechando la capacidad de *code-switching* del modelo.
- Subtitulado de contenido audiovisual: generacion de subtitulos para videos corporativos, cursos o podcasts donde los ponentes mezclan terminologia tecnica en ingles dentro de una alocucion en hebreo.
- Atencion al cliente con analitica de voz: transcripcion de llamadas de soporte para su posterior analisis de calidad, busqueda de texto completo y deteccion de temas, desplegando el modelo ONNX en el mismo backend que el resto del pipeline.
- Documentacion clinica o legal dictada: conversion de notas dictadas en hebreo con terminos en ingles (farmacologia, terminologia legal) a texto editable, con el modelo ejecutandose en servidores locales por requisitos de confidencialidad.
- Despliegue en el borde (edge) o en entornos sin GPU: al estar exportado a ONNX, puede ejecutarse con ONNX Runtime en CPUs de servidores modestos o en dispositivos con aceleradores dedicados, sin necesidad de CUDA.
- Prototipado rapido de productos de voz: el formato ONNX y las utilidades de la comunidad permiten integrar el modelo en una demo o MVP en pocas lineas de codigo, antes de invertir en infraestructura de inferencia a gran escala.
- Indexacion y busqueda de archivos de audio corporativos: transcripcion por lotes de un archivo historico de grabaciones para hacerlas buscables, asumiendo el coste de computo de un modelo de tamano moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No constan valores de WER (word error rate) para hebreo, ingles ni *code-switching*, ni comparaciones con otros modelos ASR en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio completo ocupa 15,7 GB, pero ese tamano corresponde al conjunto de ficheros ONNX exportados (probablemente varias precisiones), no a una unica variante cargada en memoria. Conviene inspeccionar el fichero concreto antes de dimensionar.
- GPU recomendadas: no disponibles en la informacion proporcionada. Al ser una exportacion ONNX, es compatible con cualquier GPU soportada por ONNX Runtime (CUDA o TensorRT) o por los execution providers disponibles.
- Viabilidad en GPU de consumo: no confirmada. Los modelos Conformer con decodificador TDT de esta familia suelen ser de tamano moderado y, en precision reducida, caben en GPUs de consumo; sin embargo, no hay datos oficiales de parametros ni de VRAM en la informacion disponible.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML), `onnx-asr`, herramientas del ecosistema `voxtype`. No se documenta soporte para vLLM ni TGI, que no estan orientados a modelos ASR de este tipo; llama.cpp tampoco es la via natural para un grafo Conformer-TDT.
- Latencia y throughput: no disponibles. La decodificacion TDT esta disenada para reducir latencia frente a RNN-T clasico al emitir varios tokens por fotograma, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hebrish/Jachnun-ONNX | no disponible | no disponible | he, en (code-switching) | CC-BY-4.0 | gated, ONNX |
| Hebrish/Jachnun (base) | no disponible | no disponible | he, en (code-switching) | no disponible en la informacion proporcionada | no disponible |
| Whisper (OpenAI) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | multilingue | no disponible en la informacion proporcionada | publico |
| NVIDIA Parakeet TDT | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | principalmente ingles | no disponible en la informacion proporcionada | publico |

No se dispone de datos verificados de parametros, contexto ni rendimiento de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no puede realizarse. Cualitativamente, la diferencia principal de Jachnun-ONNX frente a los modelos ASR multilingues genericos es su especializacion en el par hebreo-ingles con *code-switching*, junto con el formato ONNX listo para produccion. Las etiquetas del repositorio sugieren un parentesco con la familia Parakeet de NVIDIA, pero este extremo no se confirma en la documentacion disponible.

## Limitaciones y advertencias

- Modelo restringido (gated): es obligatorio aceptar las condiciones de uso en HuggingFace antes de descargar los pesos; la automatizacion de descargas requiere un token con permisos.
- Cobertura linguistica limitada a hebreo e ingles. El rendimiento fuera de ese par, o con acentos muy marcados, no esta documentado y probablemente sea deficiente.
- El rendimiento en *code-switching* real (alternancia dentro de la misma frase, prestamos lexicos, nombres propios) no esta cuantificado; no hay WER publicado.
- Riesgo de alucinacion en ASR: en segmentos con ruido, silencios largos o audio musical, los decodificadores transducer pueden generar texto espurio. Se recomienda umbral de confianza y deteccion de actividad vocal (VAD) previa.
- No se documentan sesgos demograficos o dialectales. Cabe esperar sesgo hacia las variedades y registros presentes en los datos de entrenamiento, que no se detallan.
- Sin informacion sobre puntuacion, mayusculas, normalizacion de numeros ni marcas de tiempo; habria que validar el comportamiento real de la exportacion ONNX antes de usarla en produccion.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion al autor y conservar el aviso de licencia. No incluye garantias.
- El tamano del repositorio (15,7 GB) implica costes de almacenamiento y de transferencia considerables si se descarga completo; conviene seleccionar solo la variante necesaria.
- Las fechas de creacion y actualizacion de los metadatos (2026-10-16 y 2026-10-20) no coinciden con el momento actual, lo que conviene verificar antes de asumir la vigencia del modelo.
- Ausencia total de documentacion adicional en la informacion disponible: no hay model card publica, paper ni guia de uso, lo que incrementa el coste de evaluacion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hebrish/Jachnun-ONNX
- Modelo base: https://huggingface.co/Hebrish/Jachnun
- No se han encontrado en la busqueda web enlaces relevantes al modelo (paper, blog, repositorio o demo). Los resultados de la busqueda no guardan relacion con el contenido tecnico del repositorio.
