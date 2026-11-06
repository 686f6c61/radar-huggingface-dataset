# jeonghyeon00/Nanbeige4.3-33B-w4a16-gptq-compressed-tensors

## Resumen

Nanbeige4.3-33B-w4a16-gptq-compressed-tensors es una cuantizacion W4A16 del modelo Nanbeige/Nanbeige4.3-33B, publicada por el usuario jeonghyeon00. El modelo original lo desarrolla el equipo Nanbeige y esta orientado a generacion de texto conversacional en ingles y chino, con soporte declarado de razonamiento y tool calling. Esta version concreta no es un modelo nuevo: es un checkpoint derivado cuyos pesos se han cuantizado a 4 bits para reducir el espacio en disco y facilitar el despliegue en vLLM.

La relevancia de esta publicacion es practica: empaqueta el modelo en formato `compressed-tensors` con esquema `pack-quantized`, listo para servirse con vLLM, y conserva el tokenizer y la configuracion originales. El repositorio ocupa 20,7 GB, frente al peso completo que tendria un modelo de 33B en BF16, lo que abarata el almacenamiento y la carga en memoria. La licencia es Apache-2.0, heredada del modelo base.

Conviene senalar una discrepancia importante: la model card y el nombre del repositorio hablan de un modelo de 33B, pero el recuento real de parametros en los safetensors es de 6.474.317.528 (unos 6,47B). Esta ficha refleja ambos datos y advierte de la inconsistencia en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia llama segun tags); detalles de la arquitectura original no disponibles |
| Parametros totales | 6.474.317.528 segun safetensors; la model card y el nombre indican 33B (discrepancia no resuelta) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 524.288 tokens segun la model card del derivado; el contexto practico depende de la memoria de GPU y de la configuracion de vLLM |
| Tipos de cuantizacion | W4A16 (pesos a 4 bits, activaciones a 16 bits), GPTQ, group size 128, pesos enteros simetricos, serializado en `compressed-tensors` (`pack-quantized`); `lm_head` sin cuantizar |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con `compressed-tensors`; compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia llama (el tag `llama` aparece en el repositorio derivado), aunque la model card disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones de arquitectura como attention lineal o decodificacion especulativa. Lo unico verificable es el proceso de cuantizacion aplicado en este checkpoint.

La cuantizacion se realizo con `llmcompressor==0.14.0.1`, `compressed-tensors==0.19.0` y `transformers==5.17.0`, usando `GPTQModifier` en configuracion W4A16 con ordenacion estatica de activaciones y block size 128. La calibracion empleo los primeros 128 ejemplos de `HuggingFaceH4/ultrachat_200k` (split `train_sft`) con longitud maxima de secuencia 2048; ese dataset se uso solo para calibracion, no para entrenamiento. Los modulos cuantizados son las capas `Linear`, mientras que `lm_head` se mantiene en la precision de origen. La revision del modelo fuente es `c1093c501cc6460427c0ac634db7223d0450c0ee` y la salida se valido con el parser de configuracion de cuantizacion de vLLM 0.32.0.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento segun la model card del modelo original; el despliegue en vLLM sugiere `--reasoning-parser qwen3`, lo que indica soporte de modo de razonamiento con formato compatible.
- Tool calling y function calling: el comando de servicio recomendado incluye `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Integracion con vLLM y text-generation-inference (tags del repositorio).
- Contexto largo declarado de hasta 524.288 tokens, sujeto a memoria disponible.
- Capacidades multimodales, de audio o de vision: no disponibles.

## Casos de uso

- Atencion al cliente automatizada en ingles y chino: el modelo puede mantener conversaciones multi-turno con contexto largo, y su contexto declarado de 524.288 tokens permite arrastrar historiales extensos sin truncar, siempre que la GPU lo soporte.
- Asistentes con tool calling: gracias a `--enable-auto-tool-choice` y al parser `qwen3_coder`, se puede exponer como backend de agentes que invocan funciones externas (consultas a bases de datos, APIs internas) mediante el servidor de vLLM.
- Razonamiento en modo thinking: el parser `qwen3` permite separar la traza de razonamiento de la respuesta final, util en pipelines que auditan el proceso de decision.
- Despliegue con restricciones de VRAM: al estar cuantizado a 4 bits, reduce el peso de los pesos respecto a BF16 y facilita servir el modelo en GPUs de gama alta consumer o en nodos con memoria limitada.
- Procesamiento de documentos largos en chino e ingles: resumen, extraccion y preguntas sobre textos extensos aprovechando la ventana de contexto declarada.
- Prototipado e investigacion: al ser Apache-2.0 y estar en formato `compressed-tensors`, es adecuado para experimentos de evaluacion de cuantizacion comparando salidas frente al modelo base.
- Generacion de codigo asistida: el soporte de tool calling y el parser orientado a codigo permiten integrarlo en asistentes de IDE o pipelines de CI/CD que necesiten invocar herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del derivado indica explicitamente que no incluye evaluacion de calidad de inferencia ni de throughput, y advierte de que la cuantizacion puede alterar las salidas del modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un checkpoint W4A16 de ~6,47B parametros reales ocupa en torno a 4-5 GB de pesos, mas overhead de activaciones y cache KV; si el modelo real fuese de 33B, el peso cuantizado rondaria los 17-20 GB. La discrepancia entre ambas cifras impide dar una estimacion fiable.
- GPU recomendadas: no especificadas por el autor. Para el escenario de 33B cuantizado a 4 bits serian necesarias GPUs con 24 GB o mas (RTX 4090, L40S, A100 40/80 GB, H100); para el escenario de ~6,5B bastaria una GPU consumer de 8-12 GB.
- Cabe en GPU consumer: probablemente si en el escenario de ~6,5B (RTX 3060 12 GB o superior); en el escenario de 33B requeriria RTX 4090 o superior.
- Opciones de despliegue: vLLM es el runtime validado y recomendado por el autor (comando con `--trust-remote-code`, `--enable-auto-tool-choice`, `--reasoning-parser qwen3`, `--tool-call-parser qwen3_coder`). Tambien aparece el tag de text-generation-inference. Compatibilidad con llama.cpp u Ollama no esta documentada para este formato `compressed-tensors`.
- Latencia y throughput: no disponibles; el autor no publico mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-w4a16-gptq-compressed-tensors (este) | 6,47B segun safetensors; 33B segun card | 524.288 tokens (declarado) | W4A16 GPTQ, compressed-tensors | Apache-2.0 | Hugging Face, vLLM |
| Nanbeige/Nanbeige4.3-33B (base) | 33B segun nombre | 524.288 tokens (declarado) | BF16 (presumiblemente) | Apache-2.0 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo ni de alternativas comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Discrepancia de parametros: el nombre y la model card indican 33B, pero los safetensors declaran 6.474.317.528 parametros. Verificar el checkpoint antes de dimensionar infraestructura.
- Sin benchmarks: el autor no publica evaluacion de calidad ni de throughput; la cuantizacion W4A16 puede degradar las salidas respecto al modelo base y debe evaluarse para cada carga de trabajo.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan mitigaciones especificas.
- Sesgos: no documentados en la informacion disponible; el entrenamiento del modelo base no esta descrito.
- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto: los 524.288 tokens son el maximo publicado; el contexto efectivo depende de la VRAM y de la configuracion de vLLM, y la atencion sobre ventanas muy largas puede degradar la calidad.
- Licencia: Apache-2.0 permite uso comercial, pero se debe conservar la atribucion al modelo original y revisar los terminos de la model card de Nanbeige.
- `trust-remote-code`: el comando de despliegue recomendado lo requiere, lo que implica ejecutar codigo del repositorio; conviene auditar el contenido antes de usarlo en produccion.
- Formato: al ser `compressed-tensors`, la compatibilidad con runtimes distintos de vLLM no esta garantizada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jeonghyeon00/Nanbeige4.3-33B-w4a16-gptq-compressed-tensors
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Dataset de calibracion: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Repositorio llmcompressor: no disponible en la informacion proporcionada
- Repositorio compressed-tensors: no disponible en la informacion proporcionada
- Documentacion de vLLM: no disponible en la informacion proporcionada
