# ALWOAL/lscodec_25hz_int8

## Resumen

LSCodec-25 Hz int8 es una version cuantizada a int8 del codec de audio neuronal `cantabile-kwok/lscodec_25hz`, publicado por el usuario ALWOAL. No se trata de un modelo de lenguaje, sino de un codec de audio completo (encoder, vocoder y codebook de cuantizacion vectorial) que comprime audio en una secuencia de tokens discretos a 25 Hz con 10 bits por token, lo que equivale a una tasa de 0,25 kbps. El paquete original en fp32 ocupa 196,0 MB; esta version empaquetada en int8 ocupa 49,3 MB, una reduccion de aproximadamente 4x.

La relevancia de esta ficha es doble. Por un lado, demuestra una tecnica de cuantizacion post-entrenamiento (PTQ) concreta: escala absmax por canal de salida, redondeo al mas cercano a int8 con signo y almacenamiento de una escala fp32 por parametro. Por otro, incluye una ruta de inferencia nativa en int8 (W8A8 dinamico) que evita la desquantizacion en memoria y usa `torch._int_mm` para computar `int8 x int8 -> int32`, lo que permite mantener los pesos comprimidos durante la ejecucion.

El modelo base es un codec de la familia LSCodec desarrollado por Yiwei Guo et al. (X-LANCE), con licencia MIT. Esta version mantiene esa licencia y anade los artefactos cuantizados junto con un modulo `int8nn.py` para su uso nativo. No incluye ni cuantiza el encoder de prompt WavLM-Large (primeras 6 capas de `microsoft/wavlm-large`), que solo se emplea para embeber el prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codec de audio neuronal: encoder convolucional (frontend conv + conformer + cuantizador VQ), vocoder CTXVEC2WAV y codebook VQ |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre audio) |
| Tipos de cuantizacion | int8 post-entrenamiento (PTQ) con escala absmax por canal de salida (por tensor para parametros 1-D); inferencia nativa W8A8 dinamica |
| Idiomas soportados | no disponible (codec de audio, no modela idioma) |
| Licencia | MIT |
| Formato de pesos | safetensors (`encoder.safetensors`, `vocoder.safetensors`, `codebook.safetensors`) |

Otros datos tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Tamano del repo | 0,0 GB (segun Hugging Face) |
| Tamano empaquetado int8 | 49,3 MB (frente a 196,0 MB en fp32) |
| Tamano encoder | 17,6 MB |
| Tamano vocoder | 31,6 MB |
| Tamano codebook | 0,07 MB |
| Codebook | 1024 entradas, 64 dimensiones |
| Tasa de tokens | 25 tokens/s, 10 bits por token, 0,25 kbps |
| Encoder de prompt | WavLM-Large (primeras 6 capas), no incluido ni cuantizado |
| Modelo base | cantabile-kwok/lscodec_25hz |

## Arquitectura y entrenamiento

El modelo es un codec de audio neuronal de la familia LSCodec. La arquitectura consta de tres componentes: un encoder con frontend convolucional seguido de un conformer y un cuantizador vectorial (VQ) con codebook de 1024 entradas y 64 dimensiones; un vocoder CTXVEC2WAV que reconstruye la forma de onda; y el codebook propiamente dicho. La salida del encoder es una secuencia de tokens discretos a 25 Hz con 10 bits por token, lo que produce una tasa de bits de 0,25 kbps.

El proceso de cuantizacion aplicado en esta version es PTQ: para cada parametro se calcula una escala absmax por canal de salida (por tensor para parametros 1-D), se redondea al mas cercano a int8 con signo y se almacena la escala como tensor fp32 con nombre `_scale/<nombre>`. Los buffers enteros como `num_batches_tracked` se conservan sin cambios. La desquantizacion reproduce bit a bit el modelo `lscodec-int8` del laboratorio de cuantizacion. Ademas, el repo incluye `int8nn.py`, que sustituye cada capa Linear, Conv1d, ConvTranspose1d y Embedding por una version int8: los pesos permanecen en int8 en memoria, cada GEMM cuantiza las activaciones por fila y computa `int8 x int8 -> int32` mediante `torch._int_mm` (W8A8 dinamico).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO en el modelo base. El encoder de prompt WavLM-Large (primeras 6 capas) no forma parte de este paquete ni se cuantiza; solo se usa para embeber el prompt.

## Capacidades

- Compresion de audio a una secuencia de tokens discretos a 25 Hz con 10 bits por token (0,25 kbps).
- Reconstruccion de forma de onda mediante el vocoder CTXVEC2WAV a partir de los tokens.
- Cuantizacion vectorial con codebook de 1024 entradas y 64 dimensiones.
- Inferencia nativa en int8 (W8A8 dinamico) sin desquantizacion de pesos en memoria.
- Ruta alternativa de desquantizacion a fp32 para cargar los pesos en modulos estandar.
- Uso de un encoder de prompt externo (WavLM-Large, primeras 6 capas) para embeber el prompt, aunque no se incluye en el repo.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes ni razonamiento multi-paso, y no tiene capacidades multilingues en el sentido textual.

## Casos de uso

- Compresion de audio para transmision de baja tasa: el codec produce 0,25 kbps, adecuado para canales con ancho de banda muy limitado donde no se requiere alta fidelidad.
- Almacenamiento eficiente de grandes volumenes de audio: al reducir el paquete de 196,0 MB a 49,3 MB, se abarata el almacenamiento de pesos en despliegues con muchos modelos o en dispositivos embebidos.
- Despliegue en dispositivos con memoria limitada: la inferencia nativa int8 mantiene los pesos comprimidos en memoria, lo que reduce el footprint frente a la ruta fp32.
- Investigacion en cuantizacion de codecs de audio: sirve como referencia reproducible de PTQ absmax por canal con evaluacion STOI y LSD frente a fp32.
- Integracion en pipelines de sintesis de voz o codificacion neuronal: el encoder y el vocoder pueden cargarse por separado para tareas de analisis y resintesis.
- Evaluacion comparativa de metricas de calidad: permite medir el impacto de la cuantizacion int8 en STOI y LSD sobre clips de referencia como LibriSpeech.
- Prototipado de codecs en entornos de laboratorio: el modulo `int8nn.py` facilita experimentar con capas int8 en PyTorch sin reescribir la arquitectura.

## Benchmarks y rendimiento

Resultados medidos en un clip de 3 s de LibriSpeech, segun la model card:

| Metrica | fp32 | int8 (via desquantizacion) | int8 nativo (W8A8) |
|---|---|---|---|
| STOI | 0,725 | 0,694 | 0,704 |
| LSD | 11,18 dB | 11,10 dB | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el paquete int8 ocupa 49,3 MB en disco, por lo que el footprint en memoria es muy reducido en comparacion con modelos de lenguaje.
- GPU recomendadas: no disponible. Por el tamano del modelo, es probable que quepa en GPU de consumo, pero no se confirma en la informacion proporcionada.
- Si cabe en consumer GPU: no disponible de forma confirmada; el tamano del paquete sugiere que si, pero no se aporta dato oficial.
- Opciones de despliegue: carga mediante `safetensors` y los modulos de `X-LANCE/LSCodec-Inference`; inferencia nativa int8 con `int8nn.py` y `torch._int_mm`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Tasa de tokens | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ALWOAL/lscodec_25hz_int8 | Codec de audio int8 | 49,3 MB (int8) | 25 Hz, 0,25 kbps | MIT | Hugging Face |
| cantabile-kwok/lscodec_25hz | Codec de audio fp32 (base) | 196,0 MB (fp32) | 25 Hz, 0,25 kbps | MIT (segun modelo base) | Hugging Face |
| FocalCodec (referencia del lab de cuantizacion) | Codec de audio | no disponible | no disponible | no disponible | Hugging Face Space |

No se dispone de datos de rendimiento comparables de otros codecs en la informacion proporcionada; la comparativa se limita a tamano, tasa de tokens y licencia.

## Limitaciones y advertencias

- La cuantizacion int8 degrada ligeramente la calidad: STOI baja de 0,725 (fp32) a 0,694 (int8 con desquantizacion) y a 0,704 (int8 nativo).
- El encoder de prompt WavLM-Large no se incluye ni se cuantiza; es necesario obtenerlo por separado para usar el prompt.
- Requiere el repositorio `X-LANCE/LSCodec-Inference` para construir los modulos; no es autocontenido.
- No es un modelo de lenguaje: no admite tool calling, agentes, razonamiento multi-paso ni capacidades multilingues textuales.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni limitaciones de contexto, al no ser un modelo generativo de texto.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base y de WavLM-Large por separado.
- El repositorio figura con 0,0 GB de tamano en Hugging Face, lo que puede indicar que los artefactos no estan completamente subidos o que el tamano reportado no refleja el contenido real.
- No hay datos publicados sobre latencia, throughput ni requisitos de hardware; para produccion habria que medirlos en el entorno objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ALWOAL/lscodec_25hz_int8
- Modelo base: https://huggingface.co/cantabile-kwok/lscodec_25hz
- Repositorio de inferencia LSCodec: https://github.com/X-LANCE/LSCodec-Inference
- Space de cuantizacion FocalCodec: https://huggingface.co/spaces/ALWOAL/focalcodec-quantization
- Encoder de prompt WavLM-Large: https://huggingface.co/microsoft/wavlm-large
