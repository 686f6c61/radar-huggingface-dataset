# shuuul/Qwen3-ASR-1.7B-NVFP4-W4A16

## Resumen

Qwen3-ASR-1.7B-NVFP4-W4A16 es una versión cuantizada del modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-1.7B, publicada por el usuario shuuul dentro del proyecto ModelQuant. La cuantización aplica NVFP4 (valores e2m1 con una escala float8 e4m3 cada 16 elementos y una escala fp32 por tensor) a las capas Lineales del decodificador de lenguaje, manteniendo las activaciones en bf16, es decir, un esquema weight-only W4A16. Concretamente, se cuantizan 168 matrices Lineales de las capas 2 a 25 (de 28) del "thinker", lo que suma 1.208 millones de parámetros en 4 bits; el resto —codificador de audio, dos primeras y dos últimas capas, normas, embeddings y `lm_head`— permanece en bf16 tal como lo almacena el modelo base.

El modelo conserva la arquitectura del original: un codificador de audio (`thinker.audio_tower`, con 24 capas) acoplado a un decodificador tipo transformer causal de 28 capas que genera la transcripción como texto autoregresivo. El total de parámetros del checkpoint es de 1.434.072.704. El objetivo de la ficha no es un modelo nuevo, sino una variante de despliegue de bajo peso (~1,1-1,3 GB de pesos teóricos frente a los ~2,9 GB en bf16 del base) pensada para reducir huella de memoria y aumentar el throughput de decodificación en hardware con soporte nativo de FP4.

Su relevancia es doble: por un lado, demuestra la viabilidad de cuantizar a NVFP4 modelos multimodales de ASR con una puerta de calidad estricta (variación de WER/CER inferior a 0,005 frente al bf16 en clips reservados); por otro, es una muestra del estado todavía inmaduro del ecosistema, ya que el propio autor advierte que la variante no se ha probado en carga real con vLLM ni SGLang y que ModelOpt marca el NVFP4 weight-only como "in progress" para vLLM y no soportado en SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal encoder-decoder para ASR: codificador de audio (`thinker.audio_tower`, 24 capas) + decodificador causal de lenguaje (`thinker.model`, 28 capas) |
| Parametros totales | 1.434.072.704 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos e2m1, escala float8 e4m3 cada 16 elementos, escala fp32 por tensor; activaciones en bf16). 168 Lineales cuantizadas; variante `default` (existe `keep-o-down`, que mantiene `o_proj` y `down_proj` en bf16) |
| Idiomas soportados | No disponible en la informacion proporcionada; el conjunto de calibracion cubre ingles y mandarin |
| Licencia | Apache-2.0 (igual que el modelo base) |
| Formato de pesos | safetensors (checkpoint ModelOpt, con `quantization_config`: `quant_method: modelopt`, `quant_algo: W4A16_NVFP4`) |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-1.7B es un sistema de reconocimiento de voz que combina un codificador de audio convolucional y con atencion (24 capas con `q_proj`, `k_proj`, `v_proj`, `out_proj`, `fc1`, `fc2`, mas `conv_out`, `proj1` y `proj2`) con un decodificador de lenguaje transformer de 28 capas que emite la transcripcion token a token. Los embeddings de entrada y el `lm_head` estan atados (tied). Esta variante no reentrena ni modifica el modelo: solo sustituye los pesos de las Lineales de las capas 2 a 25 del decodificador por representaciones NVFP4.

La cuantizacion se genero con NVIDIA Model-Optimizer 0.47.0 mediante el algoritmo `gptq` en modo calibrado, usando la receta `recipes/qwen3-asr-1.7b` del repositorio ModelQuant (commit `783a9a581f3cba25ea73bf6fdc3bcac846d761c0`). El conjunto de calibracion consta de 256 clips, 128 en ingles de `openslr/librispeech_asr` (CC-BY-4.0, split `all/train.clean.100`) y 128 en mandarin de `AISHELL/AISHELL-1` (Apache-2.0); cada clip se proceso con el processor y el prompt del paquete `qwen-asr`, seguido de la transcripcion del propio modelo bf16 en modo teacher-forced, sumando 7.734 tokens de respuesta. El manifiesto (`manifest.json`) documenta cada modulo, el conjunto de calibracion, las versiones y el sha256 de cada fichero. El build se realizo con transformers 4.57.6 y torch 2.11.0+cu128 sobre una NVIDIA A100-PCIE-40GB. No se detalla en la informacion disponible el volumen de tokens de preentrenamiento del modelo original ni si hubo etapas de RLHF o DPO.

## Capacidades

- Transcripcion de voz a texto (pipeline `automatic-speech-recognition`) en modo autoregresivo, con salida terminada en EOS en el 100% de los clips evaluados (120/120).
- Procesamiento de audio con codificador dedicado, no requiere un modelo externo de embeddings de audio.
- Capacidad multilingue heredada del modelo base; la calibracion cubre ingles y mandarin, pero la lista completa de idiomas no se detalla en la informacion proporcionada.
- Generacion de texto autoregresiva a partir de la representacion del audio, con salida token a token verificada contra el modelo bf16.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (el modelo es especifico de ASR).
- Capacidades de vision o audio generativo: no disponibles; la entrada es audio y la salida es texto.
- Almacenamiento de pesos en 4 bits con activaciones bf16, lo que reduce el ancho de banda de memoria en la decodificacion.

## Casos de uso

- Transcripcion por lotes de reuniones y entrevistas: el modelo recibe un fichero de audio y devuelve la transcripcion completa mediante `asr.transcribe("audio.wav")[0].text`; la cuantizacion a 4 bits reduce el peso en memoria y permite mantener varios workers en una sola GPU.
- Subtitulado de contenido audiovisual en ingles y mandarin: la calibracion en esos dos idiomas y la verificacion de CER/WER estable frente al bf16 lo hacen adecuado para generar subtitulos donde el error de caracteres debe mantenerse por debajo del 2%.
- Servicio de dictado o notas de voz en aplicaciones: al ocupar aproximadamente un tercio del espacio del modelo bf16, encaja en instancias pequenas con GPU unica y permite escalado horizontal por numero de instancias.
- Preprocesado de audio para pipelines de analitica: transcripcion masiva de llamadas o grabaciones antes de pasarlas a un sistema de busqueda o clasificacion, con el ASR como primer eslabon.
- Transcripcion en el borde o en estaciones de trabajo con GPU Blackwell: el formato NVFP4 esta pensado para GPUs con soporte nativo de FP4, donde el ahorro de memoria y el mayor throughput de matrices resultan aprovechables.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia reproducible (manifiesto con sha256, conjunto de calibracion publico, script de puerta de calidad) para estudiar el impacto de NVFP4 W4A16 en modelos multimodales.
- Accesibilidad: transcripcion de audio a texto para lectores de pantalla o documentacion accesible en entornos con recursos limitados de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni para las metricas estandar del modelo base. La model card unicamente reporta la puerta de calidad de la cuantizacion frente al modelo bf16 sobre clips reservados, con decodificacion greedy:

| Medida | bf16 | NVFP4 | Delta | Umbral | Resultado |
|---|---|---|---|---|---|
| WER en librispeech (60 clips) | 0,0203 | 0,0195 | -0,0008 | <= 0,005 | Pasa |
| CER en aishell (60 clips) | 0,0194 | 0,0170 | -0,0024 | <= 0,005 | Pasa |
| Respuestas terminadas en EOS | 120/120 | 120/120 | - | todas | Pasa |
| Respuestas identicas token a token al bf16 | 120/120 | 110/120 | - | (informativo) | - |

## Requisitos de hardware

- VRAM estimada para inferencia: los 1.208 M de parametros cuantizados ocupan aproximadamente 0,6 GB en 4 bits, mas las escalas (una escala fp8 cada 16 elementos, ~0,5 bits por parametro, unos 75 MB) y los 226 M de parametros restantes en bf16 (~0,45 GB), lo que da del orden de 1,1-1,3 GB solo en pesos. El repositorio completo ocupa 2,3 GB. A esa cifra hay que sumar activaciones, cache KV, buffers del codificador de audio y overhead del runtime. Calculo estimado a partir de los datos de la model card, no medido.
- GPU con soporte nativo de FP4: el formato NVFP4 esta disenado para generacion Blackwell (por ejemplo B200 y RTX 5090). El checkpoint se construyo en una A100-PCIE-40GB, pero esa GPU no ejecuta NVFP4 de forma nativa.
- Cabe en GPU de consumo: si, en terminos de memoria, en tarjetas con 8-12 GB o mas; ahora bien, fuera de Blackwell el runtime tendra que dequantizar a bf16, con lo que se pierde la ventaja de rendimiento y se vuelve al consumo del modelo base (~2,9 GB en pesos).
- Opciones de despliegue: vLLM via `Qwen3ASRModel.LLM(model="shuuul/Qwen3-ASR-1.7B-NVFP4-W4A16")` del paquete `qwen-asr`, leyendo el checkpoint desde `quantization_config`; SGLang con `--quantization modelopt_fp4`; transformers no dispone de loader para ModelOpt NVFP4 y requiere cargar el base y sustituir los pesos dequantizados (como hace `common/gate.py`, funcion `swap_in`, en ModelQuant). llama.cpp, Ollama y TGI no aparecen en la informacion disponible para este checkpoint.
- Latencia y throughput: no disponibles; el autor indica explicitamente que la variante no se ha probado en carga con vLLM ni SGLang, por lo que no hay cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Calidad ASR reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-NVFP4-W4A16 (esta ficha) | 1.434 M totales, 1.208 M en NVFP4 | No disponible | safetensors, NVFP4 W4A16 | WER 0,0195 (librispeech), CER 0,0170 (aishell) | Apache-2.0 | HuggingFace, sin probar en vLLM/SGLang |
| Qwen/Qwen3-ASR-1.7B (base bf16) | 1.434 M | No disponible | safetensors, bf16 | WER 0,0203 (librispeech), CER 0,0194 (aishell) | Apache-2.0 | HuggingFace, referencia del autor |
| Otras cuantizaciones del mismo base (FP8, AWQ, GGUF) | No disponible | No disponible | No disponible | No disponible | No disponible | No identificadas en la informacion proporcionada |
| Alternativas de ASR de tamano comparable | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Madurez de despliegue: el autor advierte que el checkpoint no se ha probado en carga con vLLM ni SGLang. ModelOpt marca el NVFP4 weight-only como "in progress" para vLLM y no soportado por SGLang, por lo que las instrucciones de uso son teoricas hasta que esas rutas cubran W4A16 NVFP4.
- Sin soporte en transformers: no existe loader de ModelOpt NVFP4; hay que cargar el modelo base y sustituir manualmente los pesos dequantizados.
- Cobertura de calibracion limitada: solo 256 clips (128 en ingles de LibriSpeech y 128 en mandarin de AISHELL-1). El comportamiento en otros idiomas, acentos, ruido de fondo, audio telefonico o dominios alejados de la calibracion no esta evaluado.
- Variabilidad de la salida: 10 de 120 respuestas no fueron identicas token a token al bf16, aunque todas terminaron en EOS y las metricas de error no empeoraron. En produccion conviene monitorizar la salida frente a la version bf16.
- Metricas de calidad medidas sobre 60 clips por idioma, una muestra pequena; las diferencias de WER/CER reportadas (+/- 0,002) estan dentro del ruido esperable de ese tamano de evaluacion.
- Riesgo de alucinacion: como todo modelo autoregresivo de ASR, puede generar texto plausible no presente en el audio, especialmente con silencios, ruido o audio fuera de dominio. La informacion disponible no cuantifica este riesgo.
- Sesgos: no se documentan analisis de sesgo por acento, genero, edad o dialecto; la calibracion se limita a dos idiomas y a corpus de lectura y habla controlada.
- Limitaciones de contexto e idioma: la longitud maxima de contexto y la lista oficial de idiomas no se detallan en la informacion proporcionada.
- Licencia: Apache-2.0, igual que el base, lo que permite uso comercial; aun asi, conviene verificar las condiciones del modelo base y de los datasets de calibracion (LibriSpeech es CC-BY-4.0 y AISHELL-1 Apache-2.0) si se redistribuye el checkpoint.
- Reproducibilidad: el autor publica `manifest.json` con hashes, versiones y conjunto de calibracion, lo que facilita la auditoria, pero no se ha validado de forma independiente.
- Modelo de nicho: es exclusivamente ASR; no debe emplearse como modelo de chat, razonamiento general ni generacion de codigo.

## Enlaces

- [HuggingFace: shuuul/Qwen3-ASR-1.7B-NVFP4-W4A16](https://huggingface.co/shuuul/Qwen3-ASR-1.7B-NVFP4-W4A16)
- [Modelo base: Qwen/Qwen3-ASR-1.7B](https://huggingface.co/Qwen/Qwen3-ASR-1.7B) (revision `7278e1e70fe206f11671096ffdd38061171dd6e5`)
- [Repositorio ModelQuant](https://github.com/shuuul/ModelQuant) (receta `recipes/qwen3-asr-1.7b`, commit `783a9a581f3cba25ea73bf6fdc3bcac846d761c0`)
- [Dataset openslr/librispeech_asr](https://huggingface.co/datasets/openslr/librispeech_asr)
- [Dataset AISHELL/AISHELL-1](https://huggingface.co/datasets/AISHELL/AISHELL-1)
- NVIDIA Model-Optimizer 0.47.0: no se proporciona enlace en la informacion disponible
- Paper tecnico de Qwen3-ASR: no disponible en la informacion proporcionada
