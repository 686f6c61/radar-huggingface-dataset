# jsjxjjfrkznmeme/parakeet-unified-npu

## Resumen

`jsjxjjfrkznmeme/parakeet-unified-npu` es un repositorio de artefactos auxiliares para ejecutar el modelo de reconocimiento automatico del habla (ASR) `nvidia/parakeet-unified-en-0.6b` en la NPU Intel AI Boost integrada en procesadores Intel Core Ultra, mediante OpenVINO 2026.4. No se trata de un modelo nuevo: el autor lo describe explicitamente como un conjunto de conversiones, cuantizaciones y frontends sobre modelos existentes, publicados porque los repositorios originales solo distribuyen pesos en fp16 (o nada) para las piezas que resultan criticas en una NPU.

El contenido principal es un encoder de streaming cuantizado a int8 (weight-only, simetrico, por canal) generado con NNCF a partir de la exportacion fp16 de `FluidInference/parakeet-unified-en-0.6b-ov`. Se incluyen ademas dos modelos auxiliares convertidos a OpenVINO IR: FireRedVAD (deteccion de actividad de voz) y pipecat smart-turn v3.2 (deteccion de turno de conversacion), junto con dos scripts en Python: la receta de cuantizacion y un port en numpy del preprocesador log-mel de NeMo.

Su relevancia es practica: demuestra que un encoder ASR de 0.6B puede ejecutarse en la NPU de un portatil con latencia de 59,1 ms por chunk y una reduccion de peso del 49 % frente a fp16, manteniendo transcripciones identicas en las pruebas realizadas. El repositorio ocupa 0,6 GB y no incluye pesos del decoder ni del joint network, que deben obtenerse del repositorio de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de streaming tipo Nemotron/Parakeet (ASR), exportado a OpenVINO IR |
| Parametros totales | no disponible (el modelo base es `nvidia/parakeet-unified-en-0.6b`, ~0,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de streaming de 769 frames mel (7,68 s de audio); encoder: 70 frames izquierda, 13 por chunk, 13 derecha; avance de 16 640 muestras |
| Tipos de cuantizacion | int8 weight-only simetrico por canal (encoder); fp32 en smart-turn IR; fp16 en el export de referencia |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base se denomina `parakeet-unified-en-0.6b`, lo que sugiere ingles) |
| Licencia | no disponible como licencia propia; el autor indica que las conversiones se redistribuyen bajo los terminos de los modelos originales (NVIDIA Open Model License para parakeet, mas las licencias de FireRedVAD y pipecat smart-turn) |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), int8 para el encoder, fp32 para smart-turn |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. El encoder int8 se obtiene aplicando `nncf.compress_weights(model, mode=nncf.CompressWeightsMode.INT8_SYM, ratio=1.0)` sobre el encoder de streaming fp16 de `FluidInference/parakeet-unified-en-0.6b-ov`. El resultado replica el esquema de `Nemotron-3.5-ASR-Streaming-Multilingual-0.6b-ov`: 294 constantes int8, cada una acompanada de una escala fp16 con forma `[out_channels, 1, 1, 1]` y sin zero points. El decoder y el joint network no se modifican y son byte-identicos a los del repositorio de referencia.

La innovacion tecnica destacable esta en el pipeline de inferencia. FireRedVAD se convierte a IR con ventana estatica de 200 frames (2 s con hop de 10 ms), porque su export ONNX usa un `seq_len` dinamico que la NPU no puede compilar, y se eliminan las ocho salidas de cache. smart-turn se convierte desde su ONNX `-cpu` (que esta cuantizado a int8 con 78 operaciones `QuantizeLinear`) a un IR fp32, ligeramente mas preciso. El script `parakeet_features.py` es un port en numpy del `AudioToMelSpectrogramPreprocessor` de NeMo, validado con correlacion 0,99995 frente al grafo exportado; existe porque el input `audio_length` de ese grafo es una longitud de prefijo y no puede describir una ventana de streaming con padding a la izquierda.

## Capacidades

- Reconocimiento automatico del habla en streaming sobre audio en ingles (segun el nombre del modelo base).
- Ejecucion del encoder en NPU Intel AI Boost mediante OpenVINO, con compilacion cacheada en disco.
- Deteccion de actividad de voz (VAD) con FireRedVAD en la NPU.
- Deteccion de fin de turno conversacional con pipecat smart-turn v3.2 en la NPU.
- Preprocesado log-mel en numpy con normalizacion por feature consciente del offset, apto para ventanas con padding.
- No incluye capacidades de generacion de texto, razonamiento, codigo, vision ni tool calling: es exclusivamente un componente ASR.
- No se documentan capacidades multilingues ni modos especiales (thinking, audio generativo, etc.).

## Casos de uso

- Dictado en tiempo real en portatiles Intel Core Ultra: el encoder int8 a 59,1 ms por chunk permite transcripcion continua con una ventana de 7,68 s, liberando la CPU para la aplicacion principal.
- Asistentes de voz con deteccion de turno: la combinacion de FireRedVAD (0,218 ms por llamada en NPU) y smart-turn (0,23 ms por llamada) reduce el coste de CPU entre 12,8x y 128x frente a ONNX Runtime monohilo, lo que hace viable un pipeline conversacional completo en un equipo sin GPU dedicada.
- Transcripcion de reuniones en local: el pipeline de streaming con VAD permite segmentar y transcribir audio de forma privada, sin enviar datos a la nube, usando solo la NPU integrada.
- Subtitulado en directo de video: la latencia de 59,1 ms por chunk y el avance de 16 640 muestras permiten generar subtitulos con retardo acotado en reproduccion de contenido.
- Integracion en aplicaciones de escritorio con OpenVINO: el formato IR y la cache de compilacion (`CACHE_DIR`) simplifican el despliegue en Windows o Linux sobre hardware Intel, sin dependencias de CUDA.
- Prototipado de frontends de audio: `parakeet_features.py` sirve como referencia para implementar el preprocesador NeMo en entornos donde no se puede usar el grafo exportado, por ejemplo con ventanas left-padded.
- Evaluacion de cuantizacion en NPU: la receta de NNCF y las tablas comparativas fp16/int8/int4 documentan el compromiso entre tamano, latencia y fidelidad de salida para quien quiera replicar el proceso.

## Benchmarks y rendimiento

Datos aportados por el autor en la model card (medidos sobre Intel Core Ultra, NPU Intel AI Boost, OpenVINO 2026.4):

| Metrica | fp16 | int8 |
|---|---|---|
| Peso del encoder | 1239 MB | 631 MB |
| Memoria en NPU | 1270 MB | 671 MB |
| Compilacion en NPU | 18,2 s | 13,6 s |
| Latencia del encoder | 74,3 ms/chunk | 59,1 ms/chunk |
| Correlacion de salida vs fp16 | — | 0,999956 |

| Modelo auxiliar | ONNX en CPU | OpenVINO en NPU | Mejora |
|---|---|---|---|
| FireRedVAD | 2,800 ms/llamada | 0,218 ms/llamada | 12,8x menos CPU |
| smart-turn | 29,50 ms/llamada | 0,23 ms/llamada | 128x menos CPU |

Pruebas adicionales reportadas: transcripciones identicas en 16 clips que suman 98,6 s de audio; decisiones de smart-turn con umbral 0,7 coincidentes en el 100 % de 25 ventanas de prueba; correlacion de 0,99995 del preprocesador numpy frente al grafo exportado. La cuantizacion int4 fue descartada: 375 MB, pero 88,4 ms/chunk (mas lenta que fp16) y 75,9 s de compilacion. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, WER sobre LibriSpeech u otros) en la informacion disponible.

## Requisitos de hardware

- NPU Intel AI Boost (Intel Core Ultra) con OpenVINO 2026.4; es el destino principal de los artefactos.
- Memoria en NPU para el encoder: 671 MB en int8, 1270 MB en fp16.
- GPU dedicadas: no se documenta soporte ni rendimiento en A100, H100 o RTX 4090; los artefactos son IR de OpenVINO y estan pensados para la NPU.
- Cabe en hardware consumer: si, en portatiles con Intel Core Ultra; no requiere GPU discreta.
- Despliegue: OpenVINO Runtime (`core.compile_model(..., "NPU")`) con cache de compilacion en `CACHE_DIR`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo ASR.
- Latencia: 59,1 ms por chunk en el encoder int8; 0,218 ms por llamada en FireRedVAD y 0,23 ms por llamada en smart-turn.
- Throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| parakeet-unified-npu (este repo) | ~0,6B (base) | 769 frames mel (7,68 s) | OpenVINO IR int8 | segun modelos originales | Encoder int8 + VAD + turn detector para NPU Intel |
| `FluidInference/parakeet-unified-en-0.6b-ov` | ~0,6B | misma geometria de streaming | OpenVINO IR fp16 | segun modelo original | Fuente del encoder; solo fp16 |
| `Nemotron-3.5-ASR-Streaming-Multilingual-0.6b-ov` | ~0,6B | no disponible | OpenVINO IR | no disponible | Referencia del esquema de cuantizacion int8 simetrico por canal |

No se dispone de datos de rendimiento (WER, latencia en otros hardware) de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a formato, tamano y esquema de cuantizacion.

## Limitaciones y advertencias

- No es un modelo nuevo ni autonomo: faltan el decoder y el joint network, que deben tomarse del repositorio de referencia; el repositorio solo cubre el encoder y los auxiliares.
- Solo se valida en NPU Intel AI Boost con OpenVINO 2026.4; el comportamiento en otras versiones de OpenVINO o en otras NPU no esta documentado.
- El modelo base se denomina `parakeet-unified-en-0.6b`, lo que sugiere soporte unicamente de ingles; no se confirma en la informacion disponible.
- La evaluacion de calidad se limita a 16 clips y 98,6 s de audio con transcripciones identicas; no hay medidas de WER sobre corpus estandar, por lo que el riesgo de degradacion en dominios acusticos distintos no esta cuantificado.
- FireRedVAD se convierte con ventana estatica de 200 frames y sin las salidas de cache; buffers mas cortos requieren padding de silencio por delante.
- El preprocesador numpy es sensible a detalles del enmascarado de longitud: un error en el manejo del padding puede eliminar la transcripcion (el autor reporta la perdida de 7 de 14 clips cortos con una implementacion incorrecta).
- Licencia: el repositorio no declara licencia propia; el uso comercial queda sujeto a la NVIDIA Open Model License y a las licencias de FireRedVAD y pipecat smart-turn, que deben consultarse en los repositorios originales.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto libre, pero un ASR puede producir transcripciones plausibles incorrectas en audio ruidoso; no se documentan mitigaciones.
- No se documentan sesgos demograficos ni linguisticos del modelo base en la informacion proporcionada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jsjxjjfrkznmeme/parakeet-unified-npu
- Modelo base: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Export OpenVINO de referencia: https://huggingface.co/FluidInference/parakeet-unified-en-0.6b-ov
- Referencia de esquema de cuantizacion: https://huggingface.co/FluidInference/Nemotron-3.5-ASR-Streaming-Multilingual-0.6b-ov
- OpenVINO: https://github.com/openvinotoolkit/openvino
- NNCF (Neural Network Compression Framework): https://github.com/openvinotoolkit/nncf
- FireRedVAD: no disponible en la informacion proporcionada
- pipecat smart-turn: no disponible en la informacion proporcionada
