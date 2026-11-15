# Retrieve0/Qwen3-ASR-0.6B-W4A16-Decoder-INT4

## Resumen

Retrieve0/Qwen3-ASR-0.6B-W4A16-Decoder-INT4 es un checkpoint de pesos del decodificador del modelo de reconocimiento automatico del habla Qwen3-ASR-0.6B, publicado por Qwen y reempaquetado por el usuario Retrieve0 para su uso con un runtime propio basado en TensorRT. No se trata de un modelo nuevo ni de un fine-tune: es el mismo modelo base (Qwen/Qwen3-ASR-0.6B-hf) con los pesos de las proyecciones del decodificador ya cuantizados a INT4 y empaquetados en disco, de modo que el runtime no tiene que realizar el empaquetado en tiempo de carga.

El interes practico esta en el ahorro de espacio y en la simplicidad del despliegue: el repositorio ocupa 0,7 GB frente a los 1,47 GB del checkpoint FP16 equivalente, y el autor afirma que las transcripciones son identicas bit a bit porque el empaquetado se genera con el mismo kernel que el runtime aplicaria al cargar el checkpoint FP16. El modelo resultante conserva las metricas del checkpoint original: 2,397 % de WER en las 2.620 locuciones de LibriSpeech test-clean y 72,2 ms de latencia.

La contrapartida es una portabilidad muy limitada. El formato no es AutoAWQ, GPTQ ni ExLlamaV3, y no puede cargarse con transformers, vLLM ni llama.cpp como modelo cuantizado. Solo funciona con el proyecto Qwen3-ASR-TensorRT, que aporta el encoder TensorRT y los kernels de decodificacion. Ademas, el repositorio no incluye la torre de audio (audio tower), por lo que la transcripcion requiere un encoder TensorRT separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (parte del sistema ASR Qwen3-ASR); el encoder de audio se distribuye aparte como engine TensorRT |
| Parametros totales | 472.264.704 (pesos del decodificador en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | KV cache configurable hasta 4096; `--max-seq` de construccion fijado en 512 tokens de prompt (unos 39 s de audio); el encoder admite hasta 3600 frames |
| Tipos de cuantizacion | W4A16: pesos INT4 empaquetados (dos valores por byte, nibble bajo primero) con escala FP16 por grupo de 32; `embed_tokens` y RMSNorm en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con layout propietario (`*.packed` + `*.scales` + `packed_config.json`); requiere runtime TensorRT propio |

## Arquitectura y entrenamiento

El checkpoint contiene exclusivamente los pesos del decodificador de Qwen3-ASR-0.6B, un modelo de reconocimiento del habla que combina una torre de audio con un decodificador tipo transformer. En este repositorio la torre de audio no esta incluida: la transcripcion se realiza con un encoder TensorRT independiente (Retrieve0/Qwen3-ASR-0.6B-TensorRT-Encoder) y el decodificador consume las representaciones resultantes.

La innovacion tecnica del repositorio no esta en el entrenamiento, sino en el empaquetado de pesos. Cada proyeccion almacena los nibbles INT4 en tensores `*.packed` (dos valores por byte a lo largo del eje de contraccion, con el nibble bajo primero) y una escala FP16 por cada 32 pesos, calculada como `max|w| / 7`. Los pesos de `embed_tokens` y de las RMSNorm permanecen en FP16. El fichero `packed_config.json` documenta formato, tamano de grupo y regla de cuantizacion. El autor indica que el resultado es identico al que produce el runtime al empaquetar el checkpoint FP16 en tiempo de carga, por lo que no hay perdida adicional de precision respecto a esa ruta.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, el proceso de alineacion (RLHF/DPO) ni las innovaciones de decodificacion del modelo base en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla (ASR) en modo transcripcion, con salida de texto a partir de audio.
- Decodificacion de secuencias sobre el KV cache con ventana configurable (hasta 4096 slots, asignados por peticion en pasos de 256).
- Procesamiento de audio de hasta aproximadamente 39 segundos por prompt con la configuracion por defecto (`--max-seq` 512); ampliable ajustando el limite de frames del encoder.
- Ejecucion acelerada en GPU NVIDIA mediante TensorRT 11.4, con kernels de prefill y decode separados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo especializado en ASR.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No incluye vision, audio generativo ni modo thinking.

## Casos de uso

- Transcripcion por lotes de audios cortos: con un limite de prompt de 512 tokens (unos 39 segundos de audio) y un WER de 2,397 % en LibriSpeech test-clean, es adecuado para procesar dictados, notas de voz y clips de reunion segmentados previamente.
- Servicio de subtitulado de baja latencia: los 72,2 ms medidos en test-clean permiten integrar el decodificador en pipelines de subtitulado casi en tiempo real sobre GPU NVIDIA con TensorRT.
- Despliegue en entornos con restricciones de disco o de ancho de banda: el repositorio ocupa 0,61 GB frente a 1,47 GB del checkpoint FP16, lo que simplifica la distribucion de artefactos en imagenes de contenedor o nodos edge con almacenamiento limitado.
- Evaluacion y benchmarking de ASR: al ser bit-identico al checkpoint FP16, sirve para comparar el rendimiento del backend `tensorrt-w4a16` frente a otras rutas sin introducir variabilidad por cuantizacion.
- Investigacion sobre cuantizacion de decodificadores ASR: el formato documentado (`packed_config.json`, grupo 32, escala `max|w|/7`) permite estudiar el impacto del empaquetado INT4 en un decoder concreto.
- Integracion en pipelines internos ya basados en Qwen3-ASR-TensorRT: equipos que ya construyen engines con `qwen3-asr build` pueden sustituir el checkpoint FP16 por este para reducir el espacio en disco sin cambiar el codigo de inferencia.
- Prototipado de asistentes de voz locales: combinado con el encoder TensorRT, permite montar una cadena de transcripcion completamente local en una estacion de trabajo con GPU NVIDIA.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del checkpoint FP16 equivalente, que el autor declara identicos para este repositorio:

| Metrica | Valor | Conjunto |
|---|---|---|
| WER | 2,397 % | LibriSpeech test-clean (2.620 locuciones) |
| Latencia | 72,2 ms | LibriSpeech test-clean |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible, ya que el modelo es especifico de ASR. Tampoco se ofrece comparacion con otros sistemas ASR en la model card.

## Requisitos de hardware

- GPU NVIDIA con CUDA y TensorRT 11.4 (requisito explicito del autor).
- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio de pesos ocupa 0,61 GB y el checkpoint FP16 1,47 GB, a lo que hay que sumar el encoder TensorRT y el KV cache (hasta 4096 slots).
- GPU recomendadas: no disponibles en la informacion proporcionada; el runtime depende de TensorRT, por lo que se espera compatibilidad con GPUs NVIDIA soportadas por esa version.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: exclusivamente el runtime del repositorio Qwen3-ASR-TensorRT (backend `tensorrt-w4a16`), con engines de encoder y decoder construidos previamente. No es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia: 72,2 ms por locucion en LibriSpeech test-clean segun el autor. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| Retrieve0/Qwen3-ASR-0.6B-W4A16-Decoder-INT4 | 472 M (decoder) | KV cache 4096; prompt 512 tokens | W4A16 empaquetado propietario | Apache 2.0 | Solo runtime Qwen3-ASR-TensorRT |
| Retrieve0/Qwen3-ASR-0.6B-W4A16-Decoder (FP16) | 472 M (decoder) | KV cache 4096; prompt 512 tokens | FP16 | Apache 2.0 | Runtime Qwen3-ASR-TensorRT (empaqueta al cargar) |
| Qwen/Qwen3-ASR-0.6B-hf (modelo base) | no disponible | no disponible | FP16/BF16 | Apache 2.0 | transformers y ecosistema Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, ya que la informacion proporcionada no incluye datos de otros sistemas ASR (Whisper, Parakeet, etc.) que permitan una comparacion rigurosa de parametros, contexto y rendimiento.

## Limitaciones y advertencias

- Formato no estandar: no es AutoAWQ, GPTQ ni ExLlamaV3, y no puede cargarse como modelo cuantizado en transformers, vLLM ni llama.cpp. Solo lo entiende el runtime de Qwen3-ASR-TensorRT.
- No incluye la torre de audio: sin el encoder TensorRT correspondiente el repositorio es inutilizable para transcripcion.
- No contiene pesos FP16, por lo que no puede recuantizarse con otro tamano de grupo; para ello hay que descargar el checkpoint FP16.
- El parametro `--group` esta fijado en 32; cualquier otro valor provoca un error.
- Limite de prompt de 512 tokens en la configuracion de construccion (aproximadamente 39 segundos de audio); audios mas largos requieren segmentacion o reconstruir el engine con otros limites.
- Dependencia estricta de TensorRT 11.4 y de GPU NVIDIA con CUDA; no hay ruta de ejecucion en CPU ni en aceleradores de otros fabricantes.
- Sin datos publicados sobre sesgos, tasas de alucinacion, cobertura idiomatica ni comportamiento fuera de LibriSpeech; el WER de 2,397 % corresponde a un corpus de lectura en ingles y no es extrapolable a audio espontaneo, ruidoso o multilingue.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue en produccion hereda las limitaciones del runtime propietario y de la version de TensorRT.
- Repositorio sin descargas ni likes en el momento de la consulta y con muy poca validacion externa; conviene verificar el comportamiento en el propio corpus antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Retrieve0/Qwen3-ASR-0.6B-W4A16-Decoder-INT4
- Checkpoint FP16 equivalente: https://huggingface.co/Retrieve0/Qwen3-ASR-0.6B-W4A16-Decoder
- Encoder TensorRT: https://huggingface.co/Retrieve0/Qwen3-ASR-0.6B-TensorRT-Encoder
- Repositorio del runtime: https://github.com/lost0427/Qwen3-ASR-TensorRT
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf
