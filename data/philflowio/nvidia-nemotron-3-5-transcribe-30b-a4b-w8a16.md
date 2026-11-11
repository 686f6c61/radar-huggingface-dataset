# PhilflowIO/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-W8A16

## Resumen

NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-W8A16 es una cuantizacion int8 de solo pesos (W8A16) del modelo de reconocimiento automatico del habla nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B. No es una publicacion de NVIDIA: la build la firma PhilflowIO para poder servir el modelo en dos tarjetas graficas de consumo de 24 GB (2x RTX 3090 en tensor-parallel 2) mediante vLLM. El objetivo declarado es hacer viable en hardware asequible un sistema de transcripcion de gran tamano que, en bf16, no cabria en ese perfil de VRAM.

El modelo base combina un encoder de audio, un proyector, una cabeza CTC para timestamps y un decodificador de lenguaje de tipo NemotronH con capas Mamba y mezcla de expertos (MoE), ademas de capas MTP para decodificacion especulativa. El checkpoint cuantizado conserva intactos el encoder, el proyector, la cabeza CTC, los embeddings, el lm_head, los routers MoE, las conv1d de Mamba y todas las normas; solo se cuantizan las proyecciones lineales de las capas del decodificador.

La relevancia de esta ficha es doble: por un lado, muestra un flujo reproducible de cuantizacion para modelos de voz de gran tamano con vLLM; por otro, sirve como referencia de como empaquetar pesos en formato compressed-tensors con nombres compatibles con el plugin NeMo Speech de vLLM. La licencia OpenMDW-1.1 se mantiene, y el autor no reclama resultados de calidad propios: las cifras de la model card de NVIDIA corresponden al original en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH: encoder de audio + proyector + decodificador de lenguaje hibrido Mamba/MoE con atencion; cabeza CTC de timestamps y capas MTP |
| Parametros totales | 33.697.781.029 (dato real de safetensors) |
| Parametros activos | no disponible (el nombre A4B sugiere ~4B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 de solo pesos (W8A16), simetrica por canal de salida, round-to-nearest, sin datos de calibracion; resto de tensores en bf16/fp32 |
| Idiomas soportados | no disponible (el benchmark objetivo es aleman, pero no se declara lista de idiomas) |
| Licencia | openmdw-1.1 (OpenMDW License Agreement 1.1) |
| Formato de pesos | safetensors en compressed-tensors pack-quantized; ficheros separados `model-mtp-bf16.safetensors` y `model-ctc-bf16.safetensors` |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un sistema de transcripcion de extremo a extremo compuesto por un encoder de audio (denominado "perception" en la model card), un proyector que alinea la representacion acustica con el espacio del decodificador, una cabeza CTC para timestamps y un decodificador de lenguaje NemotronH con capas Mamba y mezcla de expertos. El decodificador incorpora ademas capas MTP (multi-token prediction) que permiten decodificacion especulativa. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

La innovacion de esta build concreta es la cuantizacion: se cuantizan a int8 las 6004 capas lineales del decodificador (proyecciones de entrada y salida de Mamba, q/k/v/o de atencion y todas las proyecciones up/down de expertos MoE y expertos compartidos), con una escala por canal de salida y sin calibracion. El resto del checkpoint es identico byte a byte al original. Los tensores se renombran al layout NemotronH que genera el plugin NeMo de vLLM al cargar y se almacenan como compressed-tensors pack-quantized. Las activaciones permanecen en bf16, y en sm86 vLLM sirve el modelo con kernels Marlin. La receta es determinista, solo CPU, con versiones fijadas de llm-compressor 0.15.0, compressed-tensors 0.20.1 y torch 2.14.1; se ejecuto dos veces con distinto numero de workers y produjo `SHA256SUMS` identicos.

## Capacidades

- Reconocimiento automatico del habla (ASR) de extremo a extremo con salida de texto.
- Generacion de timestamps a nivel de palabra o segmento mediante la cabeza CTC integrada.
- Decodificacion especulativa mediante capas MTP, lo que puede reducir la latencia frente a decodificacion autoregresiva pura.
- Servicio en vLLM con tensor-parallel 2 y backend MoE Marlin.
- Compatibilidad con el plugin NeMo Speech vLLM (`nemo_speechlm`) y `--trust-remote-code`.
- Evaluacion con el framework raven-eval, orientado a WER/CER y throughput.
- Soporte de prompt configurable (la model card menciona seguir la formulacion de benchmark de NVIDIA, "as spoken").
- Capacidades multilingues: no disponibles en la informacion proporcionada; el benchmark objetivo es aleman.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo puede procesar audio de forma completa y devolver texto con timestamps gracias a la cabeza CTC, lo que facilita la alineacion con hablantes y la generacion de resumenes posteriores. Su tamano de 33.7B parametros totales permite manejar vocabulario amplio y contextos acusticos complejos.
- Subtitulado automatico en produccion: la salida con timestamps y el soporte en vLLM permiten integrar el modelo en un pipeline que genere subtitulos SRT/VTT a partir de audio de video, con despliegue en 2x RTX 3090.
- Benchmarking de ASR en aleman: el autor lo publica precisamente como control para medir WER/CER en FLEURS-de frente al original en bf16, lo que lo hace util para laboratorios que comparan cuantizaciones.
- Atencion al cliente por voz: transcripcion de llamadas o mensajes de voz en un backend con vLLM, manteniendo el modelo en GPU de consumo y evitando depender de APIs externas.
- Investigacion en cuantizacion de modelos de voz: al ser una receta reproducible con checksums, sirve como referencia para estudiar el impacto de W8A16 en tareas de ASR y para validar kernels Marlin en sm86.
- Archivado y busqueda de audio: transcripcion masiva de grabaciones para indexacion y busqueda textual, aprovechando el throughput de vLLM con tensor-parallel y decodificacion especulativa.
- Prototipado local de asistentes de voz: despliegue en dos GPU de 24 GB permite a desarrolladores independientes experimentar con un modelo de 33.7B sin infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las cifras de calidad de NVIDIA corresponden al original en bf16 y no a esta build, y que los resultados de raven.eval (WER/CER en aleman y throughput) se publicaran cuando la medicion este completa.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 36.7 GB; con overhead de vLLM y cache KV, el autor indica que cabe en 2x RTX 3090 (48 GB totales) con `--tensor-parallel-size 2`.
- GPU recomendadas: 2x RTX 3090 como minimo declarado; tambien viable en 2x RTX 4090, A100 40/80 GB o H100 si se busca mayor throughput.
- GPU de consumo: si, en dos tarjetas de 24 GB; no cabe en una sola tarjeta de 24 GB segun el diseno de la build.
- Opciones de despliegue: vLLM 0.33.0 con el plugin NeMo Speech (`nemo_speechlm`), `--tensor-parallel-size 2`, `--moe-backend marlin` y `--trust-remote-code`. No se mencionan llama.cpp, Ollama ni TGI como soportados.
- Latencia y throughput: no disponibles; pendientes de publicacion en raven.eval.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-W8A16 (esta build) | 33.7B | no disponible | W8A16 int8 | openmdw-1.1 | Hugging Face, 19 descargas |
| nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B (original) | no disponible | no disponible | bf16 | openmdw-1.1 | Hugging Face (NVIDIA) |
| Alternativas ASR de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- No es una publicacion oficial de NVIDIA; el autor es PhilflowIO y la build se distribuye "as is", sin garantias.
- La cuantizacion int8 sin calibracion puede degradar el WER/CER respecto al original en bf16; el autor no reclama ninguna cifra de calidad para esta build.
- Las cifras de la model card de NVIDIA corresponden al modelo bf16, no a esta version cuantizada.
- No se declara lista de idiomas soportados; el unico benchmark previsto es aleman (FLEURS-de).
- Requiere `--trust-remote-code` y el plugin NeMo Speech de vLLM, lo que anade superficie de dependencia y riesgo en produccion.
- El despliegue necesita al menos dos GPU de 24 GB; no es apto para entornos de una sola tarjeta de consumo.
- Licencia OpenMDW-1.1: obliga a conservar el acuerdo, los avisos de copyright y los avisos de origen en cualquier redistribucion; conviene revisar los terminos antes de uso comercial.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion proporcionada; como todo modelo ASR, puede producir transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no representados en el entrenamiento.
- Longitud de contexto y limites de audio no disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PhilflowIO/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-W8A16
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Repositorio raven.eval: https://github.com/PhilflowIO/raven.eval
- Receta de cuantizacion: https://github.com/PhilflowIO/raven.eval/blob/1562c2ce21ad69abb83b29fc5a0c836fab51e739/serving/quantize/nemotron_transcribe_w8a16.py
- Licencia OpenMDW 1.1: https://github.com/OpenMDW/OpenMDW/blob/2a0fbf70141a19e9b172903f63c2c253cf85c7b6/1.1/LICENSE.OpenMDW-1.1
- Pagina de la licencia OpenMDW: https://openmdw.ai/license/1-1/
