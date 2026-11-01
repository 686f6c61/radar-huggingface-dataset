# rhasspy/voice-labs-models

## Resumen

`rhasspy/voice-labs-models` no es un unico modelo, sino un repositorio agregado que empaqueta los artefactos que la aplicacion Voice Labs (del proyecto Open Home Foundation, OHF-Voice) descarga en su primer arranque o compila en la imagen de su contenedor. Reune un modelo de reconocimiento automatico del habla (NVIDIA Parakeet TDT-CTC 110M en ingles, cuantizado a int8), un modelo de extraccion de entidades/etiquetado cero-disparo (GLiNER 2.5 small de fastino en ONNX), un verificador de palabra de activacion basado en Kaldi, y varios modelos microWakeWord para satelites de voz.

El proposito es servir de dependencia de despliegue para un asistente de voz local orientado a Home Assistant: la transcripcion la aporta Parakeet, la interpretacion de comandos recurre a GLiNER como respaldo, y la deteccion de palabra de activacion se reparte entre Kaldi (verificador preciso) y microWakeWord (deteccion ligera en dispositivos). El repositorio ocupa unos 0,4 GB y no entrena ningun modelo propio: es una capa de distribucion con licencias heterogeneas (CC-BY-4.0, Apache-2.0, MIT).

Es relevante para desarrolladores que construyen asistentes de voz embebidos o de bajo consumo, porque concentra en un solo lugar pesos ya convertidos a ONNX/TFLite y listos para inferencia en CPU, con cuantizaciones agresivas (int8, 4 bits) pensadas para hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto heterogeneo: transducer TDT-CTC (Parakeet), encoder transformer para etiquetado (GLiNER), nnet3 (Kaldi), redes ligeras TFLite (microWakeWord) |
| Parametros totales | Parakeet TDT-CTC: 110M; GLiNER 2.5 small: no disponible; Kaldi/microWakeWord: no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Parakeet: int8 (cuantizacion dinamica de onnxruntime sobre MatMul del encoder); GLiNER: encoder en 8 bits y embedding en 4 bits (MatMulNBits, bloque 32); microWakeWord: no disponible |
| Idiomas soportados | en (ingles); `okay_nabu` descrito como multilingue |
| Licencia | cc-by-4.0-and-apache-2.0 (agregada); por componente: Parakeet CC-BY-4.0, GLiNER Apache-2.0, Kaldi MIT + Apache-2.0, microWakeWord Apache-2.0 |
| Formato de pesos | ONNX, TFLite, npz (cabecera CTC), Kaldi nnet3, tar.gz |

## Arquitectura y entrenamiento

El repositorio no entrena nada; agrega artefactos ya entrenados por terceros y los reempaqueta. Parakeet TDT-CTC 110M es un modelo transducer de NVIDIA (combinacion TDT + CTC) exportado por csukuangfj para sherpa-onnx; en este repo se incluyen encoder, decoder, joiner y `tokens.txt`, con los pesos MatMul del encoder cuantizados a int8 mediante cuantizacion dinamica de onnxruntime, mas la cabeza CTC (`ctc_head.npz`) para que un mismo encoder produzca tanto las log-probabilidades CTC con las que se emparejan comandos como las transcripciones. GLiNER 2.5 small de fastino es un modelo de reconocimiento de entidades nombradas de tipo cero-disparo, exportado a ONNX con el encoder en 8 bits y el embedding en 4 bits (MatMulNBits, bloque 32); el fichero `gliner2_onnx.json` describe la configuracion del tokenizer y del clasificador.

El verificador de palabra de activacion usa un modelo acustico nnet3 de Kaldi para ingles estadounidense con lexico IPA del perfil Rhasspy, sin modelo G2P ni modelo de lenguaje (el verificador no adivina pronunciaciones). Se incluyen binarios y librerias de Kaldi y OpenFst 1.6.7 para x86-64 (compilados desde fuente) y aarch64 (Kaldi de 2021 via kaldi-manylinux), junto con los scripts `utils/` y `steps/`. Los modelos microWakeWord (`okay_nabu`, `stop`, `vad`, `hey_jarvis`, `hey_mycroft`) proceden de los releases de kahrendt/microWakeWord y de esphome/micro-wake-word-models. La app ademas descarga EmbeddingGemma 2 (ONNX q4) y ReDimNet-b2 para identificacion de hablante, aunque esos no forman parte del repo.

## Capacidades

- Reconocimiento automatico del habla en ingles con Parakeet TDT-CTC 110M (transcripcion y log-probabilidades CTC para emparejamiento de comandos).
- Deteccion de comandos por coincidencia sobre salida CTC, sin necesidad de un segundo pase de decodificacion.
- Extraccion de entidades y etiquetado cero-disparo con GLiNER 2.5 small (respaldo para interpretar comandos).
- Verificacion de palabra de activacion con Kaldi nnet3 (modelo acustico + lexico IPA).
- Deteccion ligera de palabra de activacion en satelites con microWakeWord (`okay_nabu` multilingue, `stop`, `vad`, `hey_jarvis`, `hey_mycroft`).
- Inferencia en CPU via ONNX y TFLite, apta para dispositivos embebidos.
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision ni tool calling: es exclusivamente un pipeline de voz.

## Casos de uso

- Asistente de voz local para Home Assistant: Parakeet transcribe la orden y la salida CTC se empareja contra comandos predefinidos, todo en CPU y sin conexion.
- Deteccion de palabra de activacion en satelites de bajo consumo: microWakeWord (`okay_nabu`, `hey_jarvis`) se ejecuta en microcontroladores y solo despierta al dispositivo cuando detecta la frase.
- Verificacion secundaria de activacion: Kaldi nnet3 confirma la palabra detectada por microWakeWord para reducir falsos positivos antes de procesar la orden.
- Interpretacion de comandos en lenguaje natural: cuando el emparejamiento CTC falla, GLiNER extrae entidades (dispositivo, habitacion, accion) del texto transcrito como respaldo.
- Transcripcion de audio en ingles en dispositivos sin GPU: el encoder int8 de Parakeet permite ASR en tiempo real en CPU de gama baja.
- Pipeline de voz embebido en Raspberry Pi o similar (aarch64): los binarios Kaldi/OpenFst para aarch64 y los modelos ONNX/TFLite permiten montar el stack completo en placas ARM.
- Prototipado de asistentes de voz offline: el repositorio sirve como fuente unica de artefactos ya cuantizados para evitar pasos de conversion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Parakeet TDT-CTC 110M int8: cabe en CPU; VRAM estimada en GPU por debajo de 1 GB (no confirmado en la informacion disponible).
- GLiNER 2.5 small ONNX (8/4 bits): inferencia en CPU, huella de memoria reducida por la cuantizacion a 4 bits del embedding.
- Kaldi nnet3 y microWakeWord: CPU y microcontroladores; microWakeWord esta disenado para satelites de bajo consumo.
- GPU recomendadas: no disponible; el diseno apunta a CPU y ARM, no a aceleradores.
- Cabe en GPU consumer (RTX 4090, etc.) con enorme holgura, aunque no es su objetivo.
- Despliegue: onnxruntime (Parakeet, GLiNER), sherpa-onnx (exportaciones de Parakeet), TFLite (microWakeWord), Kaldi (verificador). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a estos modelos).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rhasspy/voice-labs-models (Parakeet 110M) | ASR transducer TDT-CTC | 110M | no disponible | CC-BY-4.0 | HuggingFace |
| nvidia/parakeet-tdt_ctc-110m | ASR transducer TDT-CTC | 110M | no disponible | CC-BY-4.0 | HuggingFace (origen) |
| csukuangfj/sherpa-onnx-nemo-parakeet_tdt_transducer_110m-en-36000 | ASR exportado a ONNX | 110M | no disponible | CC-BY-4.0 | HuggingFace (origen del export) |
| fastino/gliner2.5-small-v1 | Etiquetado cero-disparo | no disponible | no disponible | Apache-2.0 | HuggingFace (origen) |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles para el ASR y el verificador Kaldi; `okay_nabu` se describe como multilingue pero el resto del pipeline no.
- No es un modelo generativo: no sirve para texto, codigo, razonamiento ni tool calling.
- Licencias heterogeneas por componente: CC-BY-4.0 (Parakeet, requiere atribucion a NVIDIA), Apache-2.0 (GLiNER, microWakeWord, Kaldi/OpenFst), MIT (modelo Kaldi). Verificar cada licencia antes de uso comercial.
- La cuantizacion int8/4 bits puede degradar la precision del ASR y del etiquetado frente a los pesos originales.
- El verificador Kaldi no incluye G2P ni modelo de lenguaje: no adivina pronunciaciones fuera del lexico IPA.
- Riesgo de falsos positivos/negativos en la deteccion de palabra de activacion; por eso existe la verificacion secundaria.
- El repositorio depende de artefactos de terceros; cambios en los origenes pueden afectar a la reproducibilidad.
- No hay benchmarks publicados en la informacion disponible; no se puede afirmar rendimiento absoluto.

## Enlaces

- HuggingFace: https://huggingface.co/rhasspy/voice-labs-models
- Voice Labs app: https://github.com/OHF-Voice/apps-experimental/tree/master/voice_labs
- Parakeet origen: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Export transducer: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet_tdt_transducer_110m-en-36000
- Export CTC: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet_tdt_ctc_110m-en-36000
- GLiNER origen: https://huggingface.co/fastino/gliner2.5-small-v1
- Perfil Kaldi Rhasspy: https://github.com/rhasspy/en-us_kaldi-rhasspy
- Kaldi: https://github.com/kaldi-asr/kaldi
- OpenFst: https://www.openfst.org
- kaldi-manylinux: https://github.com/rhasspy/kaldi-manylinux
- microWakeWord: https://github.com/kahrendt/microWakeWord
- micro-wake-word-models: https://github.com/esphome/micro-wake-word-models
- EmbeddingGemma 2 ONNX: https://huggingface.co/onnx-community/embeddinggemma-2-ONNX
- ReDimNet-b2: https://huggingface.co/OpenVoiceOS/redimnet-b2-vox2-onnx
