# gagni/parakeet-tdt-0.6b-v3-onnx

## Resumen

parakeet-tdt-0.6b-v3-onnx es un espejo (mirror) de los ficheros ONNX en cuantizacion int8 del modelo de reconocimiento automatico del habla (ASR) nvidia/parakeet-tdt-0.6b-v3 de NVIDIA, exportado originalmente por el usuario istupakov. El repositorio lo publica gagni con el objetivo de que la funcionalidad de dictado local de la aplicacion aSup no dependa de un repositorio de terceros. Los ficheros son copias byte a byte (mismo SHA-256) de la revision `8f23f0c03c8761650bdb5b40aaf3e40d2c15f1ce` del repositorio original; no se incluyen los ficheros fp32.

El modelo subyacente es un NeMo Conformer-TDT (Token-and-Duration Transducer) con aproximadamente 0,6 mil millones de parametros, disenado para transcripcion multilingue en 25 idiomas europeos, incluido el castellano. La arquitectura combina un encoder FastConformer con un decoder y una red conjunta de tipo TDT, lo que permite emitir tokens junto con predicciones de duracion y reduce el numero de pasos de decodificacion frente a un transducer clasico.

Su relevancia practica esta en el formato: al estar exportado a ONNX con cuantizacion dinamica int8, puede ejecutarse con onnxruntime sin GPU dedicada y con un peso total de repositorio de aproximadamente 0,7 GB, lo que lo hace util para dictado local, subtitulado en tiempo real y transcripcion por lotes en entornos con recursos limitados. La licencia CC BY 4.0 permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer-TDT (FastConformer encoder + TDT decoder/joint) |
| Parametros totales | 0,6 mil millones (segun nombre del modelo; no se detalla desglose) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamico (encoder y decoder_joint); el repositorio no incluye fp32 |
| Idiomas soportados | en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (nemo128.onnx, encoder-model.int8.onnx, decoder_joint-model.int8.onnx) + vocab.txt + config.json |

## Arquitectura y entrenamiento

El modelo base nvidia/parakeet-tdt-0.6b-v3 es un sistema ASR de NVIDIA construido sobre NeMo. El pipeline se divide en tres piezas exportadas a ONNX: un preprocesador (`nemo128.onnx`) que convierte la forma de onda en 128 caracteristicas mel, un encoder FastConformer (`encoder-model.int8.onnx`) y un decoder conjunto de tipo TDT (`decoder_joint-model.int8.onnx`). El mecanismo TDT (Token-and-Duration Transducer) predice simultaneamente el token y su duracion, lo que permite saltar fotogramas y reducir la latencia de decodificacion frente a transducers convencionales.

La cuantizacion aplicada es dinamica int8 sobre el encoder y el decoder/joint, sin cambios en la topologia. No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de entrenamiento, la composicion del corpus, el uso de RLHF/DPO ni innovaciones adicionales mas alla del propio esquema TDT y del vocabulario con marca de inicio de palabra (`▁`) y token de relleno (`<blk>`).

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en 25 idiomas europeos, incluidos espanol, ingles, frances, aleman, italiano, portugues, neerlandes, polaco, rumano, sueco, ruso y ucraniano.
- Ejecucion en CPU mediante onnxruntime, sin requerir GPU.
- Integracion con la libreria onnx-asr mediante `load_model` con `quantization='int8'`.
- Entrada de audio convertida internamente a 128 caracteristicas mel.
- Salida de texto con vocabulario basado en tokens tipo SentencePiece (`▁` marca inicio de palabra).
- No se documentan capacidades de diarizacion, puntuacion automatica, marcas de tiempo por palabra, traduccion, tool calling ni agentes.

## Casos de uso

- Dictado local en aplicaciones de escritorio: el modelo puede transcribir voz a texto en tiempo real dentro de una app como aSup sin enviar audio a la nube, gracias a su ejecucion en CPU con onnxruntime y a un peso de repositorio de unos 0,7 GB.
- Subtitulado de reuniones y videollamadas: con soporte para 25 idiomas europeos, puede generar subtitulos en directo o diferidos en entornos corporativos multilingues sin depender de servicios externos.
- Transcripcion por lotes de archivos de audio: el pipeline ONNX permite procesar colas de grabaciones (podcasts, entrevistas, notas de voz) en servidores sin GPU.
- Atencion al cliente con analitica de voz: transcripcion de llamadas grabadas para su posterior busqueda, clasificacion y auditoria de calidad, manteniendo los datos en infraestructura propia.
- Accesibilidad: conversion de voz a texto para personas con discapacidad auditiva o para generar transcripciones de clases y conferencias en varios idiomas europeos.
- Investigacion en ASR: al ser un export ONNX int8 reproducible, sirve como baseline ligero para comparar tecnicas de cuantizacion, decodificacion TDT o adaptacion a dominios especificos.
- Procesamiento en el borde (edge): su tamano y su ejecucion en CPU lo hacen apto para dispositivos con recursos limitados donde no cabe un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la configuracion int8 sobre CPU; el modelo esta pensado para ejecutarse en onnxruntime sin GPU. En GPU, la huella seria del orden de los 0,7 GB de pesos mas memoria de activaciones, aunque no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible. El modelo no requiere GPU; cualquier GPU compatible con onnxruntime podria acelerar la inferencia, pero no se documentan modelos concretos.
- Cabe en GPU de consumo: si, en principio cualquier GPU consumer con onnxruntime, aunque el caso de uso declarado es CPU.
- Opciones de despliegue: onnxruntime con la libreria onnx-asr (`onnx_asr.load_model('nemo-parakeet-tdt-0.6b-v3', 'ruta', quantization='int8')`); tambien puede usarse directamente con onnxruntime cargando los tres grafos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| gagni/parakeet-tdt-0.6b-v3-onnx (este) | 0,6 B | no disponible | 25 europeos | CC BY 4.0 | ONNX int8 |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | no disponible | 25 europeos | CC BY 4.0 | NeMo (pesos originales) |
| istupakov/parakeet-tdt-0.6b-v3-onnx | 0,6 B | no disponible | 25 europeos | CC BY 4.0 | ONNX int8 y fp32 |

Las tres entradas corresponden al mismo modelo base; la diferencia esta en el empaquetado (ONNX int8, NeMo original o export ONNX con fp32 incluido). No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un espejo sin modificaciones: cualquier limitacion del modelo original nvidia/parakeet-tdt-0.6b-v3 se hereda intacta.
- Solo se incluyen los ficheros int8; no hay pesos fp32 en este repositorio, lo que impide comparar precisiones sin acudir al repositorio de origen.
- No se documentan sesgos conocidos, tasas de alucinacion ni comportamiento en audio con ruido, acentos o dominios especializados.
- Cobertura limitada a 25 idiomas europeos; no se declaran idiomas fuera de esa lista.
- La licencia CC BY 4.0 exige atribucion a NVIDIA (modelo) y a istupakov (export ONNX); es compatible con uso comercial siempre que se respete la atribucion.
- Al ser un mirror de un tercero, la trazabilidad depende de que el autor mantenga la sincronizacion con la revision indicada; conviene verificar el SHA-256 frente al repositorio original antes de usarlo en produccion.
- No se documentan requisitos de formato de audio, frecuencia de muestreo ni preprocesado adicional mas alla de la conversion a 128 mel.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gagni/parakeet-tdt-0.6b-v3-onnx
- Repositorio de origen del export ONNX: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Libreria onnx-asr: https://github.com/istupakov/onnx-asr
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
