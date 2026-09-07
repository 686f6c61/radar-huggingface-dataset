# jethachan/gemma-4-E2B-it-NVFP4KV-calib

## Resumen

`jethachan/gemma-4-E2B-it-NVFP4KV-calib` es un checkpoint de calibración creado por Jetha Chan que añade escalas por capa `k_scale` y `v_scale` al modelo `google/gemma-4-E2B-it`, con el objetivo de que la cache de claves y valores (KV cache) pueda usarse en formato NVFP4 (4-bit float) en vLLM. El problema que resuelve es que los checkpoints públicos de Gemma 4 etiquetados como «NVFP4» no incluyen escalas KV, por lo que al activar una KV cache NVFP4 producen salidas corruptas; este checkpoint corrige esa carencia.

El modelo base es un LLM instruct de Google con un total de 5.506.950.753 parámetros. Los pesos se mantienen sin cambios en bf16; lo que se añade son las escalas de cuantización para la KV cache, calibradas con 256 muestras del dataset `HuggingFaceH4/ultrachat_200k`. Es un artefacto de infraestructura diseñado para el ecosistema de vLLM, orientado a GPUs Blackwell de consumo como la RTX 5090 y el GB10, y sirve como modelo de prueba para la integración de KV cache NVFP4 en vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4) |
| Parametros totales | 5.506.950.753 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos en bf16; KV cache en NVFP4 (4-bit float) |
| Idiomas soportados | no disponible |
| Licencia | Gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint no modifica los pesos del modelo base: se conservan los pesos bf16 de `google/gemma-4-E2B-it` y se añaden escalas de cuantización por capa para la KV cache. Estas escalas se generaron con `llm-compressor` 0.12 y `compressed-tensors` 0.17.1, usando una configuración de `kv_cache_scheme` con `num_bits: 4`, `type: float`, `strategy: tensor` y `observer: memoryless_minmax`. La calibración se realizó sobre 256 muestras del dataset `HuggingFaceH4/ultrachat_200k` con una longitud de secuencia de 2048.

La innovación técnica principal es la inclusión de escalas K/V calibradas que hacen útil la cuantización NVFP4 de la KV cache en vLLM. Sin estas escalas, la KV cache NVFP4 produce basura; con ellas, el modelo puede servirse con `--kv-cache-dtype nvfp4` en el camino FlashInfer FA2 de vLLM para hardware Blackwell. No se detallan más características de la arquitectura del modelo base, como si es denso o de mezcla de expertos, en la información disponible.

## Capacidades

- Inferencia con KV cache NVFP4: el checkpoint permite servir el modelo con `--kv-cache-dtype nvfp4` en vLLM sin generar salidas corruptas, gracias a las escalas K/V calibradas.
- Compatibilidad con hardware Blackwell: está diseñado para GPUs con arquitectura sm120/sm121 (RTX 5090, GB10) a través del camino FlashInfer FA2.
- Uso como modelo de prueba en vLLM: es el checkpoint que respalda el test `test_gemma4_nvfp4_kv_sm12x.py`, por lo que sirve para validar la integración de la cuantización NVFP4.
- Hereda las capacidades del modelo base instruct de Gemma 4, aunque no se han publicado especificaciones concretas de generación, razonamiento o tool calling en la información disponible.
- No incorpora capacidades documentadas de visión, audio ni otras modalidades; se trata de un modelo de lenguaje unicamente, tal como se indica en la opción `--language-model-only`.

## Casos de uso

- Pruebas de regresion en vLLM: el checkpoint es el sujeto del test `test_gemma4_nvfp4_kv_sm12x.py`; los desarrolladores de vLLM lo usan para verificar que la KV cache NVFP4 funciona correctamente en GPUs Blackwell.
- Despliegue en RTX 5090 / GB10: sirve para ejecutar `google/gemma-4-E2B-it` con una KV cache de 4 bits, reduciendo la memoria dedicada al contexto en comparación con una KV cache en bf16.
- Investigacion en compresion de KV cache: al incluir escalas calibradas por capa, permite estudiar el efecto de la cuantizacion NVFP4 en la calidad de la generacion y en el comportamiento de la cache.
- Benchmarking de rendimiento: se puede utilizar para medir la ganancia de throughput y latencia de `--kv-cache-dtype nvfp4` frente a `bf16` en cargas de trabajo con contextos largos.
- Reproduccion de experimentos: el repositorio de GitHub asociado contiene scripts de reproduccion, pruebas y resultados para verificar la calibracion y el comportamiento del checkpoint.
- Formacion en calibracion de escalas KV: el checkpoint y su `recipe.yaml` sirven como ejemplo practico de como usar `llm-compressor` y `compressed-tensors` para anadir escalas KV a un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en bf16 ocupan aproximadamente 11 GB; la KV cache NVFP4 (4 bits) reduce el consumo de memoria del contexto en comparacion con bf16, aunque no se aportan cifras exactas.
- GPU recomendadas: NVIDIA RTX 5090 y NVIDIA GB10, que soportan las arquitecturas sm120/sm121. Se requiere ademas el camino FlashInfer FA2.
- No se indica si es compatible con GPUs no Blackwell; el uso esta orientado a hardware Blackwell de consumo.
- Opciones de despliegue: vLLM con `--kv-cache-dtype nvfp4 --language-model-only`. Es necesario un build de vLLM que incluya el PR vllm-project/vllm#46329. No se mencionan otras herramientas como llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparacion natural es con `google/gemma-4-E2B-it` sin escalas KV calibradas. Este checkpoint anade las escalas necesarias para que la KV cache NVFP4 funcione, mientras que el modelo base sin calibracion produce salidas corruptas con ese modo. No se disponen de datos de benchmarks ni de otras alternativas comparables en la informacion disponible.

| Modelo | Diferencias |
|---|---|
| google/gemma-4-E2B-it (base) | Pesos identicos, pero sin escalas KV; no usable con `--kv-cache-dtype nvfp4` |
| jethachan/gemma-4-E2B-it-NVFP4KV-calib | Anade escalas k/v por capa; usable con NVFP4 en vLLM |

## Limitaciones y advertencias

- No es un modelo independiente: el checkpoint solo contiene escalas KV y los pesos del modelo base en bf16; no aporta capacidades nuevas.
- Depende de una version concreta de vLLM (PR #46329) y de hardware Blackwell; en otras configuraciones no funcionara.
- La calibracion se realizo con solo 256 muestras de `ultrachat_200k`; puede no generalizar a otros dominios o longitudes de contexto.
- No se han publicado evaluaciones de calidad ni benchmarks; el impacto de la cuantizacion NVFP4 en la precision de la generacion no esta cuantificado.
- Licencia Gemma: tiene terminos de uso aceptable, no es Apache 2.0; hay que revisar las restricciones antes de usarlo comercialmente.
- El tamano del repositorio es 11.0 GB, ya que los pesos no estan cuantizados; la reduccion de memoria solo se produce en la KV cache, no en los pesos.

## Enlaces

- HuggingFace: https://huggingface.co/jethachan/gemma-4-E2B-it-NVFP4KV-calib
- Repositorio de reproduccion: https://github.com/jethac/vllm-gemma4-nvfp4-kv-repro
- PR de vLLM: https://github.com/vllm-project/vllm/pull/46329
