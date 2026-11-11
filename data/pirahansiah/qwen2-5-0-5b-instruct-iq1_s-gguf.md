# pirahansiah/qwen2.5-0.5b-instruct-iq1_s-gguf

## Resumen

Esta ficha describe `pirahansiah/qwen2.5-0.5b-instruct-iq1_s-gguf`, una cuantizacion no oficial en formato GGUF del modelo `Qwen/Qwen2.5-0.5B-Instruct` de Alibaba, realizada por Farshid PirahanSiah para su uso con `llama.cpp`. El objetivo es producir el archivo mas pequeno posible de este modelo que siga generando texto coherente, empleando cuantizacion de 1 bit (IQ1_S) guiada por una importance matrix. No se trata de un lanzamiento de Qwen ni esta respaldado por el equipo de Alibaba.

El modelo base Qwen2.5-0.5B-Instruct es un transformer decoder-only de arquitectura Qwen2 con 494 millones de parametros totales (0,36B sin embeddings), 24 capas, atencion con GQA (14 cabezas Q / 2 KV) y embeddings atados. Soporta un contexto de entrenamiento de 32.768 tokens y 8.192 tokens de generacion, con capacidades multilingues en mas de 29 idiomas. Esta cuantizacion hereda todas esas caracteristicas pero degrada la precision de los pesos de forma agresiva.

La relevancia de esta publicacion es fundamentalmente tecnica y experimental: demuestra que la cuantizacion de 1 bit con importance matrix (IQ1_S) preserva la coherencia de un modelo post-entrenamiento, mientras que la cuantizacion de 1 bit pura (Q1_0, signo unicamente) lo destruye. Ademas documenta una limitacion practica relevante: como el hidden size de 896 no es divisible por 256, `llama-quantize` recurre a tipos de mayor precision en 144 de 290 tensores, elevando la tasa efectiva a ~5,0 bpw y el tamano del archivo a 316 MB en lugar de los ~85 MB teoricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only, RoPE, SwiGLU, RMSNorm, QKV bias, embeddings atados) |
| Parametros totales | 494.032.768 (~0,49B; 0,36B sin embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (entrenamiento); 8.192 tokens (generacion) |
| Tipos de cuantizacion | IQ1_S (1,5625 bpw nominal; ~5,0 bpw efectivo por fallback en 144 de 290 tensores) |
| Idiomas soportados | 29+ segun modelo base (en, zh, de, fr, es, fa, ar, entre otros); la model card declara en y zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico archivo, 316 MB / 295,5 MiB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-0.5B-Instruct: un transformer decoder-only con 24 capas, normalizacion RMSNorm, activacion SwiGLU, atencion con grouped-query attention (14 cabezas de query y 2 de key/value), embeddings atados y sesgo en las proyecciones QKV. El contexto de entrenamiento es de 32.768 tokens y el de generacion de 8.192. El formato de chat es ChatML (`<|im_start|>` / `<|im_end|>`).

Esta publicacion no introduce ningun entrenamiento nuevo: no hay fine-tuning, ni reentrenamiento, ni cambios en el dataset. El proceso es puramente de conversion y compresion: safetensors fp16 → GGUF fp16 → `llama-quantize --imatrix ... IQ1_S`. La innovacion tecnica destacable es el uso de una importance matrix durante la cuantizacion de 1 bit, que permite mantener coherencia en el texto generado alli donde la cuantizacion de 1 bit sin matriz (Q1_0) produce "word salad". No obstante, el fallback automatico de `llama-quantize` a tipos de mayor precision en los tensores cuya forma no encaja en filas de 256 elementos hace que el resultado real diste del objetivo nominal de 1,56 bpw.

## Capacidades

- Generacion de texto conversacional en formato ChatML, con plantilla de chat embebida en el GGUF (aplicable con `--jinja` en `llama-server`).
- Razonamiento basico e instrucciones simples, aunque con fidelidad reducida respecto a Q4_K_M.
- Capacidades multilingues heredadas del modelo base (29+ idiomas), con especial cobertura de ingles y chino.
- Soporte de tool calling / function calling: no disponible de forma verificada en esta cuantizacion; el modelo base lo soporta pero la degradacion de pesos puede afectar al formato estructurado.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma fiable en esta cuantizacion.
- Modo thinking: no disponible (el modelo base no lo incluye).
- Vision y audio: no disponibles.

## Casos de uso

- Pruebas de pipeline de `llama.cpp`: validar la integracion de `llama-server`, `llama-cli` o `llama-cpp-python` con un archivo GGUF minimo antes de desplegar cuantizaciones mayores.
- Inferencia en hardware muy limitado: ejecutar un modelo conversacional en dispositivos con poca memoria gracias a los 316 MB del archivo, aceptando la perdida de fidelidad.
- Demos y prototipos de interfaz de chat: construir una UI de prueba con `llama-server` y su web UI integrada en `http://127.0.0.1:8080` sin apenas consumo de recursos.
- Experimentacion con cuantizacion de 1 bit: comparar el comportamiento de IQ1_S frente a Q1_0, TQ1_0 o Q2_0 usando `llama-perplexity` y `llama-bench` sobre el mismo modelo base.
- Generacion de texto de relleno o etiquetado no critico: tareas donde la coherencia superficial basta y un error factual no tiene coste.
- Educacion y divulgacion: ilustrar el impacto de la importance matrix en la cuantizacion extrema con un ejemplo reproducible y de tamano manejable.
- Despliegue en entornos con GPU de portatil de 8 GB: la model card reporta plena offload en una RTX 5060 Laptop con ~566 tok/s de generacion.

## Benchmarks y rendimiento

La model card incluye mediciones locales de perplejidad (`llama-perplexity`) y velocidad (`llama-bench`) con llama.cpp build `50f068f` en una RTX 5060 Laptop (8 GB) con offload completo a GPU. La muestra de perplejidad es un pasaje corto y repetido, por lo que los valores absolutos no son comparables con cifras publicadas de WikiText; solo el orden relativo es significativo.

| Cuantizacion | Tamano | PPL (muestra local) | Calidad de texto |
|---|---|---|---|
| Q4_K_M | 398 MB | 1,026 | coherente |
| Q4_0 | 352 MB | 1,024 | coherente |
| IQ1_S (este archivo) | 316 MB | 1,121 | coherente |
| TQ1_0 | 315 MB | 2502 | inutilizable |
| Q2_0 | 251 MB | 3,3 M | inutilizable |
| Q1_0 | 201 MB | 18,7 M | "word salad" |
| Q1_0 (todos los tensores, incl. embeddings) | 76 MB | 5,5 M | "word salad" |

Velocidad medida para este archivo (0,5B, offload completo): ~25.900 tok/s en prompt y ~566 tok/s en generacion. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para esta cuantizacion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,4 GB para los pesos (316 MB) mas la cache KV; con contexto de 32.768 tokens la cache KV crece de forma apreciable y conviene ajustar `--ctx-size`.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; la model card valida plena offload en una RTX 5060 Laptop de 8 GB.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU con rendimiento aceptable por el reducido tamano.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server` con `--jinja`), `llama-cpp-python` y Ollama mediante un `Modelfile` con plantilla ChatML.
- Latencia y throughput: ~25.900 tok/s en prefill y ~566 tok/s en generacion con offload completo en RTX 5060 Laptop (8 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| pirahansiah/qwen2.5-0.5b-instruct-iq1_s-gguf | 0,49B | 32.768 (entrenamiento) / 8.192 (generacion) | GGUF IQ1_S, 316 MB | Apache 2.0 | Cuantizacion experimental de 1 bit con imatrix; calidad reducida frente a Q4_K_M |
| Qwen/Qwen2.5-0.5B-Instruct (original) | 0,49B | 32.768 (entrenamiento) / 8.192 (generacion) | safetensors fp16/bf16 | Apache 2.0 | Modelo base sin degradacion por cuantizacion |
| Qwen2.5-0.5B-Instruct Q4_K_M (misma familia) | 0,49B | 32.768 (entrenamiento) / 8.192 (generacion) | GGUF Q4_K_M, 398 MB | Apache 2.0 | Referencia de calidad coherente con solo 82 MB mas que IQ1_S |

## Limitaciones y advertencias

- Experimental: la propia model card la describe como la cuantizacion mas pequena de un modelo de 0,5B, con precision factual e instruccion notoriamente reducidas frente a Q4_K_M.
- El tamano real (316 MB) es muy superior al teorico (~85 MB) por el fallback a tipos de mayor precision en 144 de 290 tensores; la tasa efectiva es ~5,0 bpw, no 1,56 bpw.
- Riesgo elevado de alucinacion y de respuestas incorrectas; no debe usarse en contextos donde un error sea costoso (medico, legal, financiero, seguridad critica).
- Sesgos: no documentados en la model card; hereda los del modelo base Qwen2.5-0.5B-Instruct.
- Limitaciones de contexto: aunque el modelo base soporta 32.768 tokens de entrenamiento, la generacion esta acotada a 8.192 y la degradacion por cuantizacion puede afectar al manejo de contextos largos.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar `LICENSE`, la atribucion y una declaracion de los cambios realizados (seccion 4 de Apache 2.0).
- No es un lanzamiento oficial de Qwen; no hay respaldo ni soporte del equipo de Alibaba.
- Se distribuye "as is", sin garantia de ningun tipo; el autor declina toda responsabilidad por el uso o los resultados.
- El soporte de tool calling y de razonamiento multi-paso no esta verificado en esta cuantizacion y no deberia asumirse en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/pirahansiah/qwen2.5-0.5b-instruct-iq1_s-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentacion de cuantizacion de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- Ollama: https://ollama.com
