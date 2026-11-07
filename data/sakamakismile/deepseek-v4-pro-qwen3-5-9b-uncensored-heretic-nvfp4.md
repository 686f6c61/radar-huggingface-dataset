# sakamakismile/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4 es una cuantizacion de solo pesos en formato NVFP4A16 del checkpoint xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, publicada por el usuario sakamakismile el 7 de noviembre de 2026. El modelo original es un fine-tune de Qwen3.5-9B orientado a razonamiento, destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect, con el foco del senal supervisado en matematicas y resolucion de problemas STEM. Esta version cuantizada no es el modelo DeepSeek-V4-Pro completo: el nombre refleja su linaje de destilacion.

La relevancia de esta ficha esta en la cuantizacion: reduce el checkpoint de 18,82 GB a 11,20 GB manteniendo pesos en FP4 E2M1 con activaciones en BF16, lo que permite servir el modelo de texto en una unica GPU de 16 GB (RTX PRO 2000 Blackwell) con vLLM 0.33.0 y el kernel MarlinNvFp4LinearKernel. El pipeline declarado es image-text-to-text y conserva los pesos de vision en BF16, aunque el autor solo ha validado el serving nativo de texto.

El checkpoint tiene 7.090.363.760 parametros reales en safetensors, licencia Apache-2.0 y esta pensado para despliegues con requisitos de memoria ajustados. La model card documenta throughput medido, configuracion de vLLM y verificaciones aritmeticas y de imagen, pero no publica resultados de benchmarks academicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 con atencion completa y atencion lineal, capa MTP declarada en config pero sin tensores en el checkpoint; vision encoder multimodal |
| Parametros totales | 7.090.363.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens en la configuracion de serving validada (max model length); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | NVFP4A16: pesos FP4 E2M1, activaciones BF16, group size 16, escalas de bloque FP8 E4M3 y escalas globales FP32; formato compressed-tensors nvfp4-pack-quantized |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; se valido una descripcion de imagen en japones) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), 6 shards, 11.198.703.656 bytes |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B, un transformer con modulos de atencion completa y de atencion lineal, mas un encoder de vision para entrada image-text-to-text. La model card del checkpoint cuantizado indica que la configuracion del modelo fuente declara una capa MTP (multi-token prediction), pero el checkpoint no contiene tensores MTP; no se anadieron pesos MTP y la decodificacion especulativa no se probo. El entrenamiento original, segun la model card del modelo base, consistio en destilacion supervisada a partir de respuestas de DeepSeek-V4-Pro en modo Max Effect, concentrando el senal en matematicas y STEM. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

La innovacion tecnica de este checkpoint es la cuantizacion. Se cuantizaron 128 modulos MLP de lenguaje y los modulos Linear de atencion completa; se mantuvieron en BF16 la vision, la atencion lineal, los embeddings, el lm_head y las normas. Los 632 tensores no cuantizados (333 de ellos de vision) se verificaron bit-exactos contra la fuente. Tras detectar redondeo BF16 en la conversion de offset-norm del compresor, se restauraron 81 tensores de norma no cuantizados desde el origen. El proceso uso LLM Compressor 0.11.0, compressed-tensors 0.16.0, Transformers 5.9.0 y PyTorch 2.11.0+cu128.

## Capacidades

- Generacion de texto y razonamiento orientado a matematicas y problemas STEM, heredado del fine-tune destilado de DeepSeek-V4-Pro.
- Razonamiento multi-paso con parser de razonamiento `qwen3` en vLLM, segun la configuracion de serving probada.
- Entrada multimodal image-text-to-text: el checkpoint conserva el encoder de vision en BF16 y se valido una descripcion de imagen (rojo a la izquierda, azul a la derecha) en japones, aunque con ejecucion BF16 descomprimida y no con serving cuantizado nativo.
- Aritmetica basica verificada en el checkpoint recargado: 17+25 → 42 y 9×9 → 81.
- Serving nativo de texto validado con vLLM 0.33.0, kernel MarlinNvFp4LinearKernel y FLASH_ATTN.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; solo se documento una comprobacion en japones.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico y STEM en produccion con presupuesto de memoria ajustado: el modelo esta destilado especificamente para matematicas y resolucion de problemas, y la cuantizacion NVFP4 permite cargarlo en 9,65 GiB en configuracion de solo texto, dejando espacio para cache KV en una GPU de 16 GB.
- Servicio de chat multi-turno con contexto medio: con 16.384 tokens de longitud maxima y una capacidad KV compartida reportada de 30.427 tokens, admite conversaciones con historial moderado; util para asistentes tecnicos donde no se requiere contexto muy largo.
- Despliegue en hardware de gama profesional de 16 GB: la configuracion validada con vLLM 0.33.0, TP=1 y todos los pesos de texto residentes en GPU permite servir el modelo sin offload a CPU en una RTX PRO 2000 Blackwell, un escenario realista para laboratorios y equipos pequenos.
- Procesamiento batch de generacion de texto con concurrencia moderada: el benchmark del autor muestra 202,35 tok/s agregados con 8 peticiones concurrentes y 27,52 tok/s por peticion, adecuado para pipelines de generacion por lotes con latencia no critica.
- Prefill de documentos largos: con 8.192 tokens de entrada y 2.512,6 tok/s agregados a concurrencia 1, el modelo es util para tareas de resumen o extraccion sobre documentos de extension media dentro de la ventana de 16K.
- Experimentacion con modelos multimodales cuantizados: al conservar la vision en BF16, sirve para prototipar pipelines image-text-to-text, con la advertencia de que el serving nativo de vision no esta validado.
- Evaluacion de fine-tunes destilados sin censura en entornos controlados: el checkpoint deriva de una release "heretic" y "uncensored", util para investigacion sobre comportamiento de modelos alineados, siempre con revision de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo documenta throughput de serving en una RTX PRO 2000 Blackwell de 16 GB, TP=1, sin decodificacion especulativa, prefix caching desactivado, max model length 16.384, max sequences 8, max batched tokens 1.024, GPU memory utilization 0,82 y tamanos de captura CUDA graph [1,2,4,8]. Medianas de tres ejecuciones tras un warmup:

| Peticiones concurrentes | Prefill agregado (tok/s) | Decode agregado (tok/s) | Decode por peticion (tok/s) |
|---:|---:|---:|---:|
| 1 | 2512,6 | 29,35 | 29,35 |
| 2 | 2416,3 | 55,14 | 28,00 |
| 4 | 2381,8 | 106,66 | 28,02 |
| 8 | 2351,0 | 202,35 | 27,52 |

Las 24 tandas medidas (90 peticiones) completaron con los recuentos de tokens esperados. El modelo ocupa 9,65 GiB al cargar en configuracion de solo texto; el espacio de trabajo en runtime y la cache KV requieren memoria adicional. Estos resultados describen el hardware y la configuracion probados, no un maximo general de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: 9,65 GiB solo para los pesos de texto en la configuracion validada; con vision en BF16 el checkpoint completo pesa 11,20 GB en disco, por lo que se necesita margen adicional para cache KV y espacios de trabajo.
- GPU recomendadas: RTX PRO 2000 Blackwell de 16 GB es la unica configuracion validada por el autor; no se han probado A100, H100 ni RTX 4090.
- Cabe en GPU consumer: no confirmado. Una GPU de 16 GB con margen (por ejemplo, RTX 4080 o 4090 de 16/24 GB) podria ser viable en teoria, pero no hay validacion publicada; la RTX PRO 2000 es una tarjeta profesional, no consumer.
- Opciones de despliegue: vLLM 0.33.0 con `MarlinNvFp4LinearKernel` y FLASH_ATTN es la unica ruta de serving nativo validada. Para el modelo base sin cuantizar existen variantes GGUF (mradermacher), pero no aplican a este checkpoint NVFP4.
- Latencia y throughput: prefill de 2.512,6 tok/s agregados a concurrencia 1; decode de 29,35 tok/s por peticion a concurrencia 1 y 27,52 tok/s por peticion a concurrencia 8, con 202,35 tok/s agregados.
- Limitacion de concurrencia: la capacidad KV compartida reportada es de 30.427 tokens, por lo que ocho contextos completos de 16.384 tokens no caben simultaneamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (NVFP4) | 7.090.363.760 | 16.384 en serving validado | NVFP4A16, 11,20 GB | Apache-2.0 | Hugging Face, vLLM 0.33.0 |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (base) | no disponible | no disponible | BF16, 18,82 GB | Apache-2.0 | Hugging Face |
| mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF | 9B (segun listado) | no disponible | GGUF (varias) | no disponible | Hugging Face |
| DeepSeek-V4-Pro (modelo profesor) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes. La diferencia principal entre el checkpoint cuantizado y el base es el tamano (11,20 GB frente a 18,82 GB) y el formato de pesos; el GGUF de mradermacher ofrece una ruta alternativa para llama.cpp, pero no se ha verificado su equivalencia funcional.

## Limitaciones y advertencias

- El nombre del modelo puede inducir a error: no es DeepSeek-V4-Pro, sino un fine-tune destilado de Qwen3.5-9B; el linaje describe el origen del senal de entrenamiento, no la arquitectura.
- El serving nativo de vision no esta validado: la comprobacion de imagen se hizo con ejecucion BF16 descomprimida, no con vision cuantizada en produccion.
- La capa MTP declarada en la configuracion no existe en el checkpoint; la decodificacion especulativa no se probo y no debe asumirse.
- El modelo deriva de una release "uncensored" y "heretic": puede generar contenido sin los filtros habituales, lo que exige revision y politicas de contenido en cualquier despliegue.
- Riesgo de alucinacion no cuantificado: no hay benchmarks publicados que midan fidelidad factual ni tasas de alucinacion.
- Sesgos conocidos: no documentados en la informacion disponible; el modelo base no publica evaluacion de sesgos.
- Idiomas: no hay lista oficial de idiomas soportados; solo se valido una respuesta en japones.
- Contexto limitado a 16.384 tokens en la configuracion probada; la capacidad KV compartida de 30.427 tokens restringe la concurrencia con contextos largos.
- Rendimiento medido en una unica GPU compartida con el display y con un servicio TTS detenido temporalmente; los numeros no son extrapolables a otros entornos.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la cadena de licencias del modelo base y del dataset de destilacion, no documentada aqui.
- Dependencia de versiones concretas (vLLM 0.33.0, Transformers 5.9.0, PyTorch 2.11.0+cu128); otras combinaciones no estan validadas.

## Enlaces

- Checkpoint cuantizado: https://huggingface.co/sakamakismile/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Variante GGUF: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Receta de cuantizacion: recipe.yaml (en el repositorio del checkpoint)
- Checksums: checksums.sha256 (en el repositorio del checkpoint)
- Model card del modelo fuente conservada: SOURCE_README.md (en el repositorio del checkpoint)
- Resumen del benchmark: benchmark-summary.json (en el repositorio del checkpoint)
