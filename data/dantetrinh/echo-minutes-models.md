# DanteTrinh/echo-minutes-models

## Resumen

Echo-minutes-models es una cuantización dinámica a int8 del export ONNX del modelo Nemotron 3 Diarization (Streaming Sortformer v3) de NVIDIA, publicada por el usuario DanteTrinh. No se trata de un modelo nuevo ni de un entrenamiento propio: es un artefacto de despliegue que empaqueta los pesos originales de NVIDIA en formato ONNX con cuantización QInt8 para las operaciones MatMul y Gemm, reduciendo el tamaño de 402 MB a 107 MB. Su propósito declarado es servir como detector de crosstalk (solapamiento de voces) dentro de la aplicación echo-minutes.

El modelo base resuelve el problema de la diarización de hablantes, es decir, identificar quién habla y cuándo en una grabación, con soporte para streaming. La relevancia de esta ficha es acotada: el repositorio tiene cero descargas y cero likes, no incluye model card propia más allá de la descripción de la cuantización, y remite explícitamente a NVIDIA para la descripción, los datos de entrenamiento, la evaluación y las notas de sesgo y privacidad. La licencia OpenMDW-1.1 es la del modelo original.

La información disponible sobre arquitectura interna, número de parámetros, contexto, idiomas y benchmarks es muy limitada en esta publicación; la mayoría de esos datos deben consultarse en la model card de nvidia/Nemotron-3-Diarization, que no forma parte de la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Streaming Sortformer v3 (diarizacion de hablantes en streaming), exportada a ONNX |
| Parametros totales | no disponible (el fichero int8 pesa 107.437.992 bytes; el fp32 original, 402 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica (QInt8 en pesos para MatMul y Gemm) via onnxruntime.quantization.quantize_dynamic con onnxruntime 1.32.0; existe version fp32 de referencia |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (OpenMDW License Agreement, version 1.1) |
| Formato de pesos | ONNX (`nemotron3_diar_v3_int8.onnx`) |

## Arquitectura y entrenamiento

El artefacto es una cuantización, no un entrenamiento. La arquitectura subyacente es Streaming Sortformer v3, el modelo de diarización de hablantes de NVIDIA empaquetado en Nemotron 3 Diarization. El export ONNX procede del repositorio `altunenes/parakeet-rs`, fichero `nemotron-3-diarization/nemotron3_diar_v3.onnx`, revisión `664cc742197053fa11afd12f5100749fb8000181`, con sha256 `c32d6056f1ca52bdd50a74e1e7c66d91e5147bc29f19ffa4c39cbe5452397d15`.

La receta de cuantización es `quant.py` del repositorio echo-minutes (`workflow/changes/nemotron-int8/`), usando cuantización dinámica con QInt8 para MatMul y Gemm. No se documentan en esta publicación los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO; toda esa información corresponde al modelo original de NVIDIA. La única validación reportada es una comparación contra fp32 sobre una reunión de 19 minutos en un Apple M4 Pro con ONNX Runtime 1.31.0 en CPU: int8 y fp32 marcan el mismo crosstalk, int8 es aproximadamente 2 veces más rápido y ocupa 107 MB frente a 402 MB.

## Capacidades

- Diarización de hablantes en streaming (Streaming Sortformer v3): identificación de quién habla en cada momento.
- Detección de crosstalk o solapamiento de voces, que es el uso concreto para el que se publica este artefacto en echo-minutes.
- Inferencia en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Ejecución con pesos int8 de menor huella de memoria y mayor velocidad que fp32.
- No se documentan en esta publicación capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo; el modelo es específicamente de diarización de audio.

## Casos de uso

- Detección de crosstalk en reuniones: integrado en echo-minutes como detector de solapamiento de voces, permite marcar los tramos donde dos o más participantes hablan a la vez y revisar la calidad de la grabación.
- Transcripción con atribución de hablante: combinado con un ASR, el modelo asigna cada segmento de audio a un hablante para generar actas o resúmenes de reunión con intervenciones identificadas.
- Despliegue en CPU sin GPU: al ser ONNX int8 de 107 MB, puede ejecutarse en portátiles y servidores sin acelerador, lo que encaja en aplicaciones de escritorio o de borde.
- Procesamiento de audio en tiempo real o cuasi real: la naturaleza streaming del modelo base permite consumir audio de forma continua en lugar de exigir la grabación completa.
- Analítica de reuniones: cálculo de tiempos de habla por participante y detección de interrupciones a partir de la salida de diarización.
- Preprocesado para pipelines de subtitulado: separar hablantes antes de la traducción o el subtitulado automático de reuniones y entrevistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única medición reportada es la comparación int8 frente a fp32 en una reunión de 19 minutos en Apple M4 Pro con ONNX Runtime 1.31.0 en CPU:

| Metrica | int8 | fp32 |
|---|---|---|
| Tamano del fichero | 107 MB | 402 MB |
| Velocidad relativa | ~2x mas rapido | referencia |
| Coincidencia de crosstalk detectado | identica a fp32 | referencia |

## Requisitos de hardware

- VRAM estimada: no aplica para ejecución en CPU; el fichero int8 ocupa 107 MB, por lo que la memoria necesaria en inferencia es del orden de cientos de MB, sin cifra oficial publicada.
- GPU recomendadas: no se especifican; la validación reportada se hizo en CPU (Apple M4 Pro).
- Cabe en cualquier equipo consumer: el tamaño de 107 MB permite ejecutarlo en portátiles y equipos de gama baja sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime (versión 1.31.0 usada en la validación; la cuantización se generó con 1.32.0). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles más allá del dato cualitativo de que int8 es aproximadamente 2 veces más rápido que fp32 en la prueba citada.

## Comparativa con modelos similares

| Modelo | Formato | Tamano | Licencia | Notas |
|---|---|---|---|---|
| DanteTrinh/echo-minutes-models (este) | ONNX int8 | 107 MB | openmdw-1.1 | Cuantizacion no oficial de Nemotron 3 Diarization |
| nvidia/Nemotron-3-Diarization (base) | no disponible en esta informacion | no disponible | openmdw-1.1 | Modelo original de NVIDIA; referencia para arquitectura, entrenamiento y evaluacion |
| Export ONNX fp32 de parakeet-rs | ONNX fp32 | 402 MB | la del modelo original | Fuente del export usado para cuantizar |

No se dispone de datos de otros modelos de diarización comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un lanzamiento oficial de NVIDIA; los pesos, la arquitectura y la licencia son de NVIDIA y cualquier duda sobre sesgos, seguridad y privacidad debe consultarse en su model card.
- El repositorio no incluye model card propia con evaluación, datos de entrenamiento ni análisis de sesgos; la información técnica es mínima.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.
- La validación se limita a una única reunión de 19 minutos en un equipo concreto (Apple M4 Pro, ONNX Runtime 1.31.0 en CPU); no hay evidencia de comportamiento en otros dominios de audio, acentos o condiciones de ruido.
- La cuantización int8 puede degradar la precisión en escenarios distintos al probado, aunque en la prueba reportada la detección de crosstalk coincide con fp32.
- Licencia OpenMDW-1.1: deben revisarse sus términos para uso comercial; se incluye una copia en el fichero `LICENSE` del repositorio.
- El modelo está orientado exclusivamente a diarización de audio; no debe esperarse de él generación de texto ni otras capacidades de un LLM.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DanteTrinh/echo-minutes-models
- Modelo base de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Export ONNX de origen: https://huggingface.co/altunenes/parakeet-rs
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
