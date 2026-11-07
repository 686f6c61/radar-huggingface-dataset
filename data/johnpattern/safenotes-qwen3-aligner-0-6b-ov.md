# johnpattern/safenotes-qwen3-aligner-0.6b-ov

## Resumen

`johnpattern/safenotes-qwen3-aligner-0.6b-ov` es una conversion a formato OpenVINO IR (fp16) del modelo Qwen3-ForcedAligner-0.6B desarrollado por el equipo Qwen de Alibaba Cloud. No se trata de un modelo nuevo ni de un fine-tuning: es un artefacto de despliegue creado por Safenotes, una aplicacion local de transcripcion de reuniones, para ejecutar el alineador forzado original sobre hardware Intel mediante OpenVINO. El autor original no respalda esta distribucion y todo el merito del modelo subyacente corresponde al equipo Qwen.

El modelo resuelve un problema concreto: dado un audio y su transcripcion, asignar marcas de tiempo a nivel de palabra (u otras unidades) dentro de la transcripcion. Segun la documentacion del modelo base, soporta prediccion de timestamps para unidades arbitrarias en hasta 5 minutos de audio y en 11 idiomas, con inferencia unificada en streaming y offline. El repositorio ocupa 1,8 GB y contiene los IRs de encoder de audio, decoder y tokenizer, junto con los filtros mel de Whisper.

Para desarrolladores e investigadores, este repositorio es relevante como ejemplo de empaquetado reproducible de un modelo de alineamiento forzado para inferencia en CPU/GPU Intel sin dependencias de frameworks de deep learning pesados. La licencia Apache-2.0 y la verificacion sha256 de cada fichero lo hacen apto para integraciones locales con garantias de integridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR/alineamiento (Qwen3-ForcedAligner); exportado como IR de OpenVINO con encoder de audio separado |
| Parametros totales | 0,6 mil millones (aproximado, segun nombre del modelo base); no se detalla desglose exacto |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base soporta hasta 5 minutos de audio por inferencia |
| Tipos de cuantizacion | fp16 (unico formato publicado en este repositorio) |
| Idiomas soportados | 11 idiomas segun la documentacion del modelo base; la lista concreta no esta disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (.xml + .bin); incluye tokenizer y detokenizer IR, filtros mel en .npy |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen3-ForcedAligner-0.6B, es un transformer encoder-decoder orientado a reconocimiento de voz y alineamiento forzado. Segun la documentacion del modelo original, unifica inferencia en streaming y offline con un unico modelo y soporta transcripcion de audio largo, ademas de prediccion de timestamps para unidades arbitrarias en hasta 5 minutos de habla y 11 idiomas.

Esta version concreta no introduce reentrenamiento alguno. El autor de la conversion exporto el decoder y el tokenizer con `optimum-cli export openvino --task automatic-speech-recognition-with-past --weight-format fp16` (optimum-intel 2.2.0, optimum 2.3.0, transformers 4.57.6, qwen-asr 0.0.6). El encoder de audio se exporto por separado en su variante chunked, con una diferencia maxima frente al original de 7e-7 en fp32 antes de la compresion a fp16. Los ficheros de vocabulario y merges se descargan byte a byte del repositorio upstream. No se dispone de informacion sobre el dataset de entrenamiento original, numero de tokens ni si hubo RLHF o DPO.

## Capacidades

- Alineamiento forzado: asignacion de marcas de tiempo a palabras u otras unidades de una transcripcion existente.
- Prediccion de timestamps en hasta 5 minutos de audio por inferencia, segun el modelo base.
- Inferencia unificada en streaming y offline con un solo modelo (caracteristica del modelo base).
- Transcripcion de audio largo (capacidad declarada del modelo base).
- Soporte multilingue: 11 idiomas segun la documentacion del modelo original.
- Ejecucion en hardware Intel mediante OpenVINO, con encoder de audio chunked exportado aparte.
- No se documenta soporte de tool calling, agentes, vision ni audio mas alla del pipeline ASR/alineamiento.

## Casos de uso

- Subtitulado y sincronizacion de transcripciones: dado un audio de reunion y su texto, el modelo genera timestamps por palabra que permiten construir subtitulos SRT/VTT o resaltar la palabra activa durante la reproduccion.
- Notas de reunion locales: es exactamente el uso de Safenotes; el modelo corre en el PC del usuario y permite navegar la transcripcion vinculada al audio sin enviar datos a la nube.
- Edicion de audio basada en texto: con timestamps por palabra se pueden cortar, silenciar o reordenar fragmentos seleccionando texto en un editor, util en produccion de podcasts.
- Analisis forense y de compliance: localizar con precision cuando se pronuncio una frase concreta en una grabacion para auditoria o revision legal.
- Investigacion en fonetica y linguistica de corpus: alinear transcripciones con audio para extraer duraciones de palabras y patrones prosodicos en los 11 idiomas soportados.
- Despliegue en equipos sin GPU dedicada: al estar en OpenVINO fp16, puede ejecutarse en CPU Intel y en iGPU, lo que facilita prototipos en portatiles y mini-PC.
- Pipelines de datos de voz: enriquecer datasets ASR con alineamiento a nivel de palabra de forma local y verificable por hash.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion. La model card unicamente reporta la fidelidad numerica de la conversion: diferencia maxima de 7e-7 en fp32 entre el encoder de audio exportado y el upstream antes de la compresion a fp16. No hay datos de WER, precision de timestamps ni throughput.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio pesa 1,8 GB en fp16; se necesita espacio equivalente en memoria para cargar los IRs, mas overhead del runtime OpenVINO. En CPU se recomienda al menos 4 GB de RAM libre.
- GPU recomendadas: GPUs integradas Intel (iGPU) y GPUs Intel Arc; tambien puede ejecutarse en CPU Intel con OpenVINO. No se documenta soporte para CUDA.
- Cabe en GPU consumer: si, en iGPU Intel y Arc; el tamano de 0,6B en fp16 es asequible para hardware de gama media.
- Opciones de despliegue: OpenVINO Runtime con los IRs incluidos; el pipeline requiere ademas los filtros mel (`whisper_mel_filters.npy`) y los componentes de tokenizer exportados. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| johnpattern/safenotes-qwen3-aligner-0.6b-ov | 0,6B | hasta 5 min por inferencia (modelo base) | 11 (modelo base) | Apache-2.0 | OpenVINO IR fp16 |
| Qwen/Qwen3-ForcedAligner-0.6B (original) | 0,6B | hasta 5 min por inferencia | 11 | Apache-2.0 | safetensors (upstream) |
| Whisper (alineamiento via cross-attention) | variable (tiny a large) | 30 s por ventana | ~99 | MIT / Apache-2.0 segun variante | multiples |
| Otros alineadores forzados (Montreal Forced Aligner, etc.) | no aplica (HMM/GMM) | dependiente del modelo acustico | dependiente del diccionario | varias | varios |

La comparativa con alternativas concretas mas alla del modelo original no esta disponible con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Es una conversion no oficial: el equipo Qwen no respalda esta distribucion; para produccion conviene evaluar tambien el repositorio upstream.
- Solo se publica fp16; no hay variantes int8 ni int4 en este repositorio, lo que limita el ajuste fino de memoria.
- Solo se ha verificado la fidelidad numerica de la conversion (7e-7 en fp32); no hay evaluacion publicada de calidad de alineamiento tras la conversion.
- El modelo es un alineador forzado: requiere una transcripcion previa; no sustituye a un ASR completo por si solo.
- Limite de 5 minutos de audio por inferencia segun el modelo base; para audios mas largos hay que trocear.
- Riesgo de alucinacion o desalineacion en audio con ruido, solapamiento de hablantes o transcripciones incorrectas; no se documentan tasas de error.
- Idiomas: se declaran 11, pero la lista concreta y su calidad relativa no estan disponibles en la informacion proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero se distribuye "as is" sin garantias de exactitud del output.
- Dependencia del runtime OpenVINO y del ecosistema optimum-intel; versiones concretas documentadas (optimum-intel 2.2.0, transformers 4.57.6) para reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/johnpattern/safenotes-qwen3-aligner-0.6b-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Revision del modelo base citada: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B/tree/c7cbfc2048c462b0d63a45797104fc9db3ad62b7
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Referencia de pesos bf16 del alineador en otro repo: https://huggingface.co/PedroMarinhoDev/Qwen3-ASR-ComfyUI/blob/main/qwen3_forced_aligner_0.6b_bf16.safetensors
- README del alineador en repo de terceros: https://huggingface.co/Anthropic-ai/aivoice/blob/main/aligner/Qwen3-ForcedAligner-0.6B/README.md
