# aidevco/Gemma-4-31B-it-W8A8

## Resumen

Gemma-4-31B-it-W8A8 es una cuantizacion INT8 del modelo multimodal google/gemma-4-31B-it, publicada por el usuario aidevco. Se trata de un checkpoint derivado, no oficial, que mantiene intacta la arquitectura y el entrenamiento del modelo original y solo reduce la precision numerica de los pesos y activaciones del decodificador. El objetivo declarado es servir el modelo en tarjetas AMD Instinct MI210 (gfx90a, 64 GB), que carecen de nucleos matriciales FP8 y de kernels Marlin, por lo que INT8 W8A8 es el unico formato de 8 bits que se ejecuta de forma eficiente en ese hardware mediante vLLM.

El modelo base es un transformer denso de 31.273.088.876 parametros (31,27 B) con capacidad de entrada imagen-texto y salida de texto, orientado a conversacion. La cuantizacion reduce el checkpoint de 62,5 GB en bf16 a 33,3 GB en dos shards, con 410 modulos cuantizados. No se ha publicado informacion sobre la longitud de contexto nativa, los idiomas soportados ni los datos de entrenamiento en la informacion disponible; la model card remite al repositorio original de Google para todo lo relativo a arquitectura, entrenamiento, benchmarks y limitaciones.

La relevancia de esta ficha es practica: documenta una ruta de despliegue concreta (ROCm + vLLM + compressed-tensors) con cifras medidas de throughput y capacidad de cache KV en MI210, y advierte de que el autor no ha realizado una evaluacion de calidad, solo comprobaciones de cordura. Es un artefacto de infraestructura, no un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text); detalles no disponibles en la informacion proporcionada |
| Parametros totales | 31.273.088.876 (31,27 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; la configuracion de servicio probada usa `--max-model-len=65536` |
| Tipos de cuantizacion | INT8 W8A8: pesos int8 simetricos por canal, activaciones int8 dinamicas por token; resto en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (segun la model card original; enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (2 shards, 33,3 GB), formato compressed-tensors `int-quantized`; libreria transformers |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion data-free del modelo google/gemma-4-31B-it. La arquitectura subyacente es un transformer denso con 60 capas en el decodificador y una torre de vision, segun se deduce de los modulos cuantizados (60 capas con `gate_proj`/`up_proj`/`down_proj` y `q_proj`/`k_proj`/`o_proj`, y 50 capas con `v_proj`). No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos datos corresponden a la model card original de Google.

La innovacion tecnica de esta publicacion es exclusivamente el esquema de cuantizacion. Se genero con llm-compressor 0.14.0 (`model_free_ptq`) y compressed-tensors 0.19.0, en CPU y en 22 minutos con un solo proceso. Los pesos usan `num_bits=8`, `type=int`, `symmetric=true`, `strategy=channel` y observador `memoryless-mse`; las activaciones de entrada usan `num_bits=8`, `type=int`, `symmetric=true`, `strategy=token` y `dynamic=true`. Se cuantizaron 410 modulos: las MLP (`gate_proj`, `up_proj`, `down_proj`) de las 60 capas, las proyecciones de atencion `q_proj`, `k_proj`, `o_proj` de las 60 capas y `v_proj` de 50 capas. Las normas, los embeddings (`embed_tokens`, 2,8 GB) y la torre de vision se mantienen en bf16. Una comprobacion de desquantizacion sobre un shard dio un error relativo de 0,010 a 0,013 por tensor.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base.
- Entrada de imagen y texto con salida de texto (pipeline `image-text-to-text`); la torre de vision se conserva en bf16, aunque en la configuracion de servicio probada se desactiva la entrada de imagen (`--limit-mm-per-prompt='{"image":0,"audio":0}'`).
- Razonamiento con modo "thinking" activable y desactivable; el autor verifico ambos modos con temperatura 0.
- Tool calling / function calling: se probo una llamada a la herramienta `get_weather` con el parser `gemma4` de vLLM.
- Soporte de plantilla de chat para herramientas (`tool_chat_template_gemma4.jinja`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de audio: la configuracion de servicio las desactiva explicitamente; no se detalla si el modelo base las soporta.

## Casos de uso

- Despliegue en infraestructura AMD Instinct MI210: el caso de uso principal declarado. El formato INT8 W8A8 se ejecuta sobre `TritonInt8ScaledMMLinearKernel` en vLLM con ROCm, mientras que una build de 4 bits caeria en el kernel `TritonW4A16LinearKernel`, mucho mas lento en gfx90a. Es la opcion adecuada cuando se dispone de MI210 y no de GPUs con soporte FP8 o Marlin.
- Servicio de chat conversacional con contexto largo: con `--max-model-len=65536` y `--gpu-memory-utilization=0.95`, el modelo admite peticiones de hasta 65.536 tokens con una concurrencia de 1,12x; util para asistentes que necesitan arrastrar documentos extensos o historiales largos.
- Atencion al cliente automatizada: conversaciones multi-turno con tool calling para consultar sistemas internos (por ejemplo, estado de pedidos o meteorologia), usando el parser `gemma4` y la plantilla de herramientas de vLLM.
- Asistentes con razonamiento verificable: el modo thinking permite separar el razonamiento interno de la respuesta final, lo que facilita auditoria y depuracion en flujos de negocio.
- Procesamiento de documentos con imagen: aunque la configuracion probada desactiva la entrada de imagen, la torre de vision se conserva en bf16 y el pipeline declarado es image-text-to-text; puede habilitarse si el despliegue lo permite.
- Evaluacion y prototipado en hardware ROCm: al ser una cuantizacion data-free con verificacion de esquema y error de desquantizacion documentado, sirve como base para comparar latencia y calidad frente al checkpoint bf16 en el mismo hardware.
- Reduccion de huella de memoria en produccion: el checkpoint pasa de 62,5 GB a 33,3 GB, lo que permite reservar 31,7 GiB de pesos y destinar el resto de la tarjeta a cache KV (73.136 tokens a 0.95 de utilizacion).

## Benchmarks y rendimiento

El autor no publica benchmarks de calidad (MMLU, HumanEval, GSM8K u otros). Solo documenta comprobaciones de cordura y metricas de servicio medidas en una MI210 por copia con vLLM v0.33.0 y activaciones bf16:

| Metrica | Resultado |
|---|---|
| Capacidad de cache KV (`--gpu-memory-utilization=0.95`) | 73.136 tokens; concurrencia 1,12x a 65.536 tokens |
| Tokens de salida/s, 400 tokens por peticion, concurrencia 1 | 17,9 |
| Tokens de salida/s, concurrencia 2 | 33,7 (total entre peticiones) |
| Tokens de salida/s, concurrencia 4 | 67,6 (total entre peticiones) |
| `--dtype=float16` (referencia) | 16,9 / 35,0 / 69,1 tokens/s a concurrencia 1 / 2 / 4 |
| Comprobaciones de correccion (temperatura 0, thinking on/off) | 17 x 60 = 1.020; viaje en tren de 155 min en ambos modos; una llamada a `get_weather` |

El autor indica que las diferencias entre bf16 y float16 estan dentro del ruido entre ejecuciones, por lo que bf16 es el valor por defecto. La llamada a herramienta eligio la funcion correcta pero devolvio el argumento `city` con comillas literales (`"Amsterdam"`) en ambos dtypes. Estas cifras son comprobaciones de la cuantizacion, no una evaluacion de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: 31,7 GiB solo para los pesos en INT8; una peticion de 65.536 tokens requiere 18,29 GiB adicionales de cache KV, que no caben con `--gpu-memory-utilization=0.90` (17,21 GiB disponibles).
- GPU recomendadas: AMD Instinct MI210 (gfx90a, 64 GB), hardware para el que se construyo y probo el checkpoint. No se documenta soporte en otras GPU.
- GPU de consumo: no disponible en la informacion proporcionada; el tamano de pesos (31,7 GiB) y la cache KV necesaria hacen inviable su ejecucion en tarjetas consumer de 24 GB sin cuantizacion adicional.
- Opciones de despliegue: vLLM v0.33.0 sobre ROCm, con deteccion automatica de la cuantizacion desde la configuracion (no pasar `--quantization`). El log de arranque debe nombrar `TritonInt8ScaledMMLinearKernel for CompressedTensorsW8A8Int8`. No se documentan otras rutas (llama.cpp, Ollama, TGI) en la informacion disponible.
- Parametros de servicio probados: `--max-model-len=65536`, `--gpu-memory-utilization=0.95`, `--kv-cache-dtype=auto`, `--max-num-batched-tokens=8192`, `--reasoning-parser=gemma4`, `--tool-call-parser=gemma4`.
- Latencia y throughput: 17,9 tokens/s a concurrencia 1, 33,7 a 2 y 67,6 a 4 (totales entre peticiones), con 400 tokens de salida por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aidevco/Gemma-4-31B-it-W8A8 | 31,27 B | No disponible (servicio probado a 65.536) | INT8 W8A8 | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| google/gemma-4-31B-it (base) | 31,27 B | No disponible en la informacion proporcionada | bf16 (62,5 GB) | Apache 2.0 | Hugging Face (oficial de Google) |
| Cuantizacion de 4 bits del mismo modelo base | 31,27 B | No disponible | 4 bits (W4A16) | No disponible | No disponible; el autor indica que en MI210 cae en `TritonW4A16LinearKernel`, mas lento |

No se dispone de datos de benchmarks que permitan comparar calidad frente al modelo base ni frente a otras cuantizaciones. La comparativa se limita a tamano, formato y ruta de despliegue.

## Limitaciones y advertencias

- No es una publicacion oficial de Google: Google no ha revisado ni respaldado este checkpoint.
- No se han publicado evaluaciones de calidad (benchmarks estandar) sobre la version cuantizada; las comprobaciones del autor son de cordura, no de rendimiento.
- La cuantizacion introduce un error relativo de desquantizacion de 0,010 a 0,013 por tensor, que puede degradar tareas sensibles a la precision numerica.
- La llamada a herramienta probada devuelve el argumento `city` con comillas literales, lo que puede romper integraciones que no saneen los argumentos.
- En la configuracion de servicio documentada se desactivan las entradas de imagen y audio (`--limit-mm-per-prompt='{"image":0,"audio":0}'`), por lo que la capacidad multimodal no se ejercita en ese despliegue.
- Solo se ha probado en AMD MI210 con vLLM v0.33.0 y ROCm; no hay datos de compatibilidad con CUDA, otras GPU ni otros motores de inferencia.
- Con `--gpu-memory-utilization=0.90` no cabe una peticion de 65.536 tokens; es necesario subir a 0.95 o reducir el contexto.
- Sesgos conocidos, riesgo de alucinacion y limitaciones de idioma del modelo base: no disponibles en la informacion proporcionada; deben consultarse en la model card original.
- Restricciones de licencia: la model card declara Apache 2.0 y enlaza a la pagina de licencia de Gemma 4 de Google; conviene verificar los terminos de uso comercial en esa pagina antes de desplegar en produccion.
- El repositorio tiene 0 descargas y 0 likes, sin validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aidevco/Gemma-4-31B-it-W8A8
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Revision del codigo fuente usada: `842da3794eaa0b77d5f08bae87a17459d91ff475`
- Herramientas citadas: llm-compressor 0.14.0, compressed-tensors 0.19.0, vLLM v0.33.0
- Plantilla de chat para herramientas: `/app/vllm/examples/tool_chat_template_gemma4.jinja` (ruta local en el entorno del autor; no se proporciona URL publica)
