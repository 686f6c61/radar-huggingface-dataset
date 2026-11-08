# DictionLabs/parakeet-tdt-0.6b-v3-onnx

## Resumen

Parakeet TDT 0.6B v3 es un modelo de reconocimiento automatico del habla (ASR) desarrollado por NVIDIA, con 600 millones de parametros, disenado para transcripcion de voz a texto de alto rendimiento y con deteccion automatica de idioma en 25 lenguas europeas. Esta ficha concreta documenta el espejo ONNX publicado por DictionLabs, que reproduce byte a byte la conversion a ONNX realizada por Ivan Stupakov (istupakov) para la libreria `onnx-asr`, a partir de los pesos originales de NVIDIA.

El modelo emplea la arquitectura TDT (Token-and-Duration Transducer) con un encoder FastConformer y un predictor LSTM de dos capas, dividido en tres componentes (encoder, decoder y joint) que permiten inferencia eficiente, incluso en dispositivos de borde. Frente a la version v2, que solo cubria ingles, la v3 amplia la cobertura a 25 idiomas europeos e incorpora deteccion automatica de la lengua de entrada, lo que elimina la necesidad de configurar el idioma manualmente en pipelines multilingues.

La relevancia de este repositorio es fundamentalmente operativa: DictionLabs mantiene una copia propia de los pesos int8 que distribuye en su imagen Docker `dictionlabs/parakeet:latest-int8`, de modo que una modificacion o eliminacion del repositorio upstream no altere lo que ejecutan sus usuarios. No hay reentrenamiento, reconversion ni recuantizacion: el contenido es identico al del repositorio de istupakov en la revision `8f23f0c03c8761650bdb5b40aaf3e40d2c15f1ce`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) con encoder FastConformer y predictor LSTM de 2 capas |
| Parametros totales | 600 millones (0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada en la informacion disponible) |
| Tipos de cuantizacion | int8 (incluida en este espejo); fp32 disponible solo en el repositorio upstream |
| Idiomas soportados | 25: en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder-model.int8.onnx, decoder_joint-model.int8.onnx, nemo128.onnx, config.json, vocab.txt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TDT, una variante de transducer que predice conjuntamente tokens y su duracion, lo que reduce el numero de pasos de decodificacion frente a un transducer clasico y mejora el throughput. El encoder es un FastConformer, disenado para procesar audio de forma eficiente con atencion subsampleada; el predictor es una LSTM de dos capas y el componente joint combina ambas salidas. Para el despliegue en ONNX, el modelo se descompone en tres grafos independientes (encoder, decoder y joint), lo que facilita la ejecucion por etapas y el uso en entornos con recursos limitados. El fichero `nemo128.onnx` corresponde al extractor de caracteristicas de audio (log-mel de 128 bandas) necesario antes del encoder.

No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de entrenamiento, la composicion del corpus, ni sobre si se aplicaron tecnicas de RLHF o ajuste supervisado adicional. El modelo base es `nvidia/parakeet-tdt-0.6b-v3`, y la conversion a ONNX se realizo exportando directamente desde NeMo (`ASRModel.export`) y generando el vocabulario a partir del tokenizer del modelo original. La version int8 de este espejo procede de la conversion de istupakov y no ha sido modificada.

## Capacidades

- Transcripcion de voz a texto (ASR) de alto rendimiento en 25 idiomas europeos.
- Deteccion automatica del idioma de entrada, sin necesidad de especificarlo en la llamada.
- Salida de transcripcion con marcas de tiempo a nivel de token mediante el mecanismo TDT (duracion por token).
- Procesamiento por lotes y orientado a throughput, adecuado para grandes volumenes de audio.
- Ejecucion en CPU mediante ONNX Runtime, sin requerir GPU.
- Integracion sencilla con Python a traves de `onnx-asr` (`onnx_asr.load_model("nemo-parakeet-tdt-0.6b-v3")`).
- No soporta tool calling, agentes, vision ni audio generation: es exclusivamente un modelo ASR.

## Casos de uso

- Transcripcion de reuniones y videoconferencias: el modelo convierte audio multilingue en texto con deteccion automatica de idioma, lo que permite procesar sesiones donde los participantes alternan lenguas sin configurar el idioma por segmento.
- Subtitulado automatico de contenido audiovisual: la salida con duracion por token de TDT facilita la alineacion temporal necesaria para generar subtitulos sincronizados en plataformas de video.
- Atencion al cliente y analitica de llamadas: permite transcribir grabaciones de call centers en varios idiomas europeos para su posterior analisis de sentimiento, cumplimiento o busqueda de texto completo.
- Dictado y notas de voz en aplicaciones: al ejecutarse en ONNX Runtime sobre CPU, puede integrarse en aplicaciones de escritorio o servidores modestos para transcribir notas de voz sin depender de servicios en la nube.
- Documentacion clinica o legal dictada: la transcripcion local con pesos int8 permite desplegar el modelo en infraestructura propia, manteniendo el audio dentro del perimetro de la organizacion.
- Pipeline de accesibilidad: generacion de transcripciones en tiempo casi real para personas con discapacidad auditiva en eventos o clases, con soporte para asistentes que cambian de idioma.
- Procesamiento por lotes de archivos de audio archivados: el enfoque orientado a throughput y la ejecucion en CPU permiten transcribir grandes volumenes sin aprovisionar GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con pesos int8 el modelo ocupa aproximadamente 0.7 GB en disco (tamano del repositorio), por lo que la huella en memoria es del orden de 1 GB o inferior.
- GPU recomendadas: no especificadas en la informacion disponible; al ser un modelo de 0.6B en int8, es viable en GPU consumer como RTX 3060, RTX 4060 o superiores, aunque no se confirman requisitos oficiales.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con 2 GB o mas de VRAM; tambien esta disenado para ejecucion en CPU.
- Opciones de despliegue: `onnx-asr` (con `onnxruntime`), ONNX Runtime directamente, y la imagen Docker `dictionlabs/parakeet:latest-int8` (espejo de `ghcr.io/achetronic/parakeet` v0.10.0). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DictionLabs/parakeet-tdt-0.6b-v3-onnx (este) | 0.6B | 25 europeos | ONNX int8 | CC-BY-4.0 | Espejo byte a byte del ONNX de istupakov; solo set int8 |
| istupakov/parakeet-tdt-0.6b-v3-onnx | 0.6B | 25 europeos | ONNX int8 y fp32 | CC-BY-4.0 | Conversion original para `onnx-asr`; incluye fp32 |
| nvidia/parakeet-tdt-0.6b-v3 | 0.6B | 25 europeos | NeMo (.nemo) | CC-BY-4.0 | Modelo original en formato nativo de NVIDIA NeMo |
| qualcomm/Parakeet-TDT-0.6B-v3 | 0.6B | 25 europeos | Formato Qualcomm (AI Hub) | no disponible | Version optimizada para inferencia en dispositivo con encoder, decoder y joint separados |

## Limitaciones y advertencias

- Es un espejo sin modificaciones: no incorpora mejoras, correcciones ni ajustes respecto al modelo original de NVIDIA ni a la conversion de istupakov.
- Solo incluye los ficheros int8; si se necesita fp32 hay que acudir al repositorio upstream de istupakov.
- Modelo exclusivamente ASR: no genera texto libre, no razona, no ejecuta codigo ni soporta tool calling.
- Cobertura limitada a 25 idiomas europeos; no se documenta soporte para otras lenguas.
- Riesgo de errores de transcripcion en audio con ruido, acentos marcados, solapamiento de hablantes o vocabulario muy especializado; no se han publicado tasas de error (WER) en la informacion disponible.
- La deteccion automatica de idioma puede confundirse en segmentos cortos o con cambios de lengua dentro de una misma frase.
- Licencia CC-BY-4.0: permite uso comercial con atribucion a NVIDIA como autor original y a los conversores; conviene revisar los terminos de atribucion al redistribuir.
- No se dispone de informacion sobre sesgos demograficos o linguisticos del modelo.
- La fecha de creacion del repositorio (2026-11-08) y las cero descargas indican que se trata de un artefacto interno de distribucion, no de un modelo ampliamente validado por la comunidad.

## Enlaces

- Repositorio de este espejo: https://huggingface.co/DictionLabs/parakeet-tdt-0.6b-v3-onnx
- Conversion original ONNX: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Revision concreta del upstream: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx/tree/8f23f0c03c8761650bdb5b40aaf3e40d2c15f1ce
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Libreria onnx-asr: https://github.com/istupakov/onnx-asr
- Proyecto Diction: https://github.com/DictionLabs/Diction
- Imagen Docker: https://hub.docker.com/r/dictionlabs/parakeet
- Repositorio de la imagen base: https://github.com/achetronic/parakeet
- Version Qualcomm para dispositivo: https://huggingface.co/qualcomm/Parakeet-TDT-0.6B-v3
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
