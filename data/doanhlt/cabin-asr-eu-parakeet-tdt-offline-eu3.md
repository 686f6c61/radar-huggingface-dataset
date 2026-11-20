# doanhlt/cabin-asr-eu-parakeet-tdt-offline-eu3

## Resumen

`cabin-asr-eu-parakeet-tdt-offline-eu3` es un paquete de reconocimiento automático del habla (ASR) para inferencia local, publicado por el desarrollador `doanhlt` en Hugging Face. Se distribuye como un conjunto de ficheros ONNX pensado para el motor `sherpa-onnx` mediante `OfflineRecognizer`, con el mismo esquema de ficheros y configuración que el modelo al que sustituye (parakeet-v3, concretamente `sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8`). El paquete está orientado a la aplicación offline Cabin y cubre cuatro idiomas europeos: francés, alemán, español e italiano.

El modelo parte de `doanhlt/cabin-asr-eu-parakeet-tdt-offline-r1`, que a su vez deriva de `nvidia/parakeet-tdt-0.6b-v3` (licencia CC-BY-4.0) mediante warm start. La arquitectura subyacente es Parakeet TDT (Token-and-Duration Transducer), un modelo de transcripción end-to-end con encoder, decoder y joiner, cuantizado a int8 en el encoder. El repositorio ocupa 0,7 GB e incluye únicamente pesos ONNX y el vocabulario (`tokens.txt`).

El modelo se publica como release candidate: ha superado la puerta de validación en host (host gate PASS) y está empaquetado, pero la puerta de dispositivo (device gate) sigue abierta. Es relevante para desarrolladores que necesiten ASR multilingüe de cuatro idiomas europeos ejecutable en local, sin dependencia de la nube, con un tamaño contenido y un formato directamente consumible por `sherpa-onnx`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer): encoder + decoder + joiner |
| Parametros totales | no disponible (modelo base referenciado como 0.6b) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 en encoder, decoder y joiner (encoder con pre-encode y convoluciones depthwise en fp32) |
| Idiomas soportados | fr, de, es, it |
| Licencia | other (pesos derivados de nvidia/parakeet-tdt-0.6b-v3, CC-BY-4.0) |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx) + tokens.txt |

## Arquitectura y entrenamiento

El modelo es un transducer TDT (Token-and-Duration Transducer) de la familia Parakeet, con tres componentes separados exportados a ONNX: encoder, decoder y joiner. El encoder se cuantiza a int8, mientras que el pre-encode y las convoluciones depthwise se mantienen en fp32 (variante `xpd`), lo que busca preservar calidad acústica en las primeras capas a la vez que reduce el tamaño y el coste de cómputo. El paquete está diseñado para el `OfflineRecognizer` de `sherpa-onnx`, es decir, transcripción de ficheros completos en lugar de streaming.

El entrenamiento parte por warm start de `cabin-asr-eu-parakeet-tdt-offline-r1` (derivado de `nvidia/parakeet-tdt-0.6b-v3`) y se ejecuta durante 2 épocas con learning rate 1e-5, sin aumento de datos. Los datos combinan la mezcla EU r1 (YODAS2 etiquetado con R13x en fr/de/es/it, 35,4 h, más replay de FLEURS de 28,2 h), nuevos shards de entrenamiento YODAS2 de/fr etiquetados con R13x (shards 27-30, con filtro de acuerdo de subtítulos y tope por vídeo), replay humano de Common Voice 17, VoxPopuli de/fr de entrenamiento, entrevistas de YouTube en de/fr y 0,9 h de audio de producción. El profesor es R13x (un fine-tune de Qwen3-ASR); el texto de la nube (Soniox / Gemini) se usa solo como filtro de acuerdo, nunca como objetivo de entrenamiento.

## Capacidades

- Transcripción de voz a texto offline en francés, alemán, español e italiano.
- Reconocimiento end-to-end con arquitectura transducer TDT, adecuado para audio de duración variable procesado por lotes.
- Ejecución local en dispositivo mediante `sherpa-onnx`, sin llamadas a servicios externos.
- Paquete autocontenido con vocabulario incluido (`tokens.txt`), listo para cargar en el `OfflineRecognizer`.
- Compatibilidad de configuración con el modelo parakeet-v3 al que sustituye, lo que facilita el reemplazo directo en la app Cabin.
- No se documentan capacidades de tool calling, agentes, visión, audio bidireccional ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de notas de voz en aplicaciones móviles offline: el paquete ONNX int8 y su integración con `sherpa-onnx` permiten transcribir grabaciones en el propio dispositivo en fr, de, es e it, sin enviar audio a la nube.
- Subtitulado de vídeo y entrevistas: el modelo se entrenó con entrevistas de YouTube y datos YODAS2, por lo que es adecuado para generar subtítulos de contenido hablado en los cuatro idiomas cubiertos.
- Actas y resúmenes de reuniones multilingües: al cubrir fr, de, es e it en un único paquete, permite transcribir reuniones con participantes de distintos países europeos y alimentar después un pipeline de resumen.
- Dictado en herramientas de productividad: integrado en editores o clientes de correo, permite dictar texto en local sin depender de conectividad, algo crítico en entornos con red restringida.
- Indexación y búsqueda de archivos de audio: la transcripción por lotes con `OfflineRecognizer` facilita convertir archivos de audio de archivo en texto indexable para búsqueda interna.
- Atención al cliente con transcripción previa: puede transcribir llamadas o mensajes de voz en local antes de pasarlos a un sistema de análisis, reduciendo la exposición de datos personales.
- Evaluación y sustitución directa en Cabin: al mantener el mismo layout y configuración que parakeet-v3, sirve como reemplazo en pruebas A/B dentro de la aplicación sin cambios de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos (WER, MMLU, etc.) en la información disponible. La model card incluye únicamente un resumen de puertas de validación cualitativas y comparativas (gate.json), con resultados booleanos:

| Puerta | Resultado |
|---|---|
| G1 caption de/fr mejor | true |
| G2 caption de/fr vacío aceptable | true |
| G3 FLEURS/CommonVoice/MLS/VoxPopuli de no peor | true |
| G3 FLEURS/CommonVoice/MLS/VoxPopuli fr no peor | true |
| G4 FLEURS/CommonVoice/MLS/VoxPopuli es no peor | true |
| G4 YODAS2 es held-out caption no peor | true |
| G4 FLEURS/CommonVoice/MLS/VoxPopuli it no peor | true |
| G4 YODAS2 it held-out caption no peor | true |
| G5 tamaño dentro del 10 % | true |
| G5 RTF dentro del 10 % | true |
| K1 caption de/fr no peor vs r1 | true |

Los valores concretos de WER y RTF no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 0,7 GB en total, con pesos int8, por lo que la huella de memoria es reducida y compatible con dispositivos de gama media.
- GPU recomendadas: no se especifican en la información disponible; el modelo está orientado a inferencia en dispositivo (on-device) y a CPU.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del paquete, aunque no se confirma con cifras en la información proporcionada.
- Opciones de despliegue: `sherpa-onnx` mediante `OfflineRecognizer` (formato nativo del paquete). No se documentan otros motores (vLLM, llama.cpp, Ollama, TGI) para este paquete ASR.
- Latencia y throughput: la puerta G5 exige que el RTF se mantenga dentro del 10 % respecto al modelo de referencia, pero no se publican valores absolutos de RTF ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| cabin-asr-eu-parakeet-tdt-offline-eu3 | no disponible (base 0.6b) | no disponible | fr, de, es, it | other (base CC-BY-4.0) | ONNX int8 |
| nvidia/parakeet-tdt-0.6b-v3 | 0.6b | no disponible | no disponible en la información | CC-BY-4.0 | NeMo / ONNX |
| cabin-asr-eu-parakeet-tdt-offline-r1 | no disponible (base 0.6b) | no disponible | fr, de, es, it | other (base CC-BY-4.0) | ONNX int8 |

No se dispone de datos de rendimiento comparativo numérico entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Estado release candidate: la puerta de dispositivo (device gate) sigue abierta; el cambio a producción es una decisión del propietario, por lo que no debe asumirse estabilidad total.
- Licencia `other`: aunque el modelo base es CC-BY-4.0, la licencia del paquete es "other"; conviene revisar los términos antes de uso comercial.
- Cobertura limitada a cuatro idiomas (fr, de, es, it); no se documenta soporte de otros idiomas.
- Modelo offline de transcripción completa: no está diseñado para streaming en tiempo real según la información disponible.
- Entrenado en parte con audio de producción de Cabin (0,9 h) bajo decisión del propietario; aunque se indica que no hay audio, transcripciones ni identificadores de usuarios en el repositorio, el origen de los datos merece atención en despliegues sensibles.
- No se publican cifras de WER ni de RTF, solo resultados booleanos de puertas de validación, lo que limita la evaluación cuantitativa previa a producción.
- Riesgo de sesgo y alucinación inherente a los sistemas ASR: no se documentan análisis de sesgo por acento, género o dominio.
- El modelo depende de `sherpa-onnx` y del formato ONNX; no es directamente utilizable en otros stacks sin conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/doanhlt/cabin-asr-eu-parakeet-tdt-offline-eu3
- Modelo base intermedio: https://huggingface.co/doanhlt/cabin-asr-eu-parakeet-tdt-offline-r1
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- sherpa-onnx (motor de inferencia): no disponible en la información proporcionada
- Referencia al modelo parakeet-v3 int8 de sherpa-onnx: `sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8` (no se proporciona URL)
