# afanasjev/Hy-MT2-30B-A3B-W4A16-Marlin

## Resumen

Hy-MT2-30B-A3B-W4A16-Marlin es una version cuantizada a 4 bits del modelo de traduccion tencent/Hy-MT2-30B-A3B, publicada por el usuario afanasjev. Se trata de un checkpoint GPTQ con esquema W4A16 (pesos de 4 bits, activaciones de 16 bits) generado con llm-compressor en formato compressed-tensors, optimizado para ejecutarse con los kernels Marlin en GPUs NVIDIA. El objetivo es reducir el peso del modelo base de aproximadamente 60 GB en fp16 a unos 16,3 GB, permitiendo su despliegue en tarjetas de 24 GB de VRAM como la RTX 3090 o la RTX 4090.

El modelo base emplea la arquitectura MoE `hy_v3` con 30.064.725.888 parametros totales y aproximadamente 3.000 millones de parametros activos por token, segun indica la model card. Esta especializado en traduccion automatica (pipeline_tag: translation) y hereda la licencia Apache-2.0 del modelo original de Tencent.

La relevancia de esta publicacion radica en que hace viable ejecutar un modelo de traduccion de 30B parametros en hardware de consumo, manteniendo las capas criticas (lm_head y las compuertas del router MoE) en su precision original para preservar la estabilidad del enrutamiento. No obstante, la informacion disponible es limitada: no se publican resultados de benchmarks ni detalles sobre el dataset de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (`hy_v3`), transformer con mezcla de expertos |
| Parametros totales | 30.064.725.888 |
| Parametros activos | ~3B por token (segun model card) |
| Longitud de contexto | no disponible en la informacion (el ejemplo de despliegue usa `--max-model-len=32768`) |
| Tipos de cuantizacion | W4A16 GPTQ, group size 128, formato compressed-tensors, kernels Marlin |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, GPTQ W4A16) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) denominada `hy_v3`, con 30B parametros totales y aproximadamente 3B activos por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamano. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible.

La version aqui descrita es una cuantizacion GPTQ W4A16 con group size 128, generada con llm-compressor y calibrada con 256 muestras de HuggingFaceH4/ultrachat_200k con max_seq_length de 2048. Se mantienen en precision original `lm_head` y las compuertas del router MoE (`re:.*mlp\.gate$`) para preservar la estabilidad del enrutamiento entre expertos, un detalle tecnico relevante porque cuantizar el router puede degradar la seleccion de expertos. El checkpoint esta empaquetado en formato compressed-tensors para ejecucion con kernels Marlin en GPUs NVIDIA.

## Capacidades

- Generacion de texto orientada a traduccion automatica (pipeline_tag: translation).
- Traduccion multilingue: aunque los idiomas concretos no estan documentados en la informacion disponible, el modelo base esta etiquetado como modelo de traduccion.
- Arquitectura MoE con ~3B parametros activos, lo que reduce el coste de inferencia por token frente a modelos densos de 30B.
- Despliegue compatible con vLLM mediante kernels Marlin y formato compressed-tensors.
- Soporte de tool calling, function calling, agentes, vision o audio: no disponible en la informacion.
- Modo thinking explicito: no disponible en la informacion.

## Casos de uso

- Traduccion automatica de documentacion tecnica: el modelo puede procesar textos largos con una ventana de contexto de hasta 32.768 tokens (segun la configuracion de ejemplo) y traducirlos preservando terminologia especializada, con un coste de inferencia bajo gracias a sus ~3B parametros activos.
- Localizacion de interfaces y contenido web: integrado como servicio vLLM, puede atender peticiones concurrentes de traduccion de cadenas cortas con `--max-num-seqs=32` y prefix caching para cadenas repetidas.
- Traduccion por lotes en pipelines de datos: su reducido peso (16,3 GB) permite desplegarlo en una RTX 3090 o 4090 para procesar grandes volumenes de texto sin depender de infraestructura cloud.
- Servicio de traduccion en tiempo real para aplicaciones de chat: la configuracion con `--enable-chunked-prefill` y `--async-scheduling` permite streaming de traducciones con latencia controlada en hardware de consumo.
- Prototipado e investigacion en traduccion automatica: al ser un checkpoint cuantizado con licencia Apache-2.0, es adecuado para experimentar con tecnicas de decodificacion, evaluacion de calidad y ajuste fino ligero en entornos con recursos limitados.
- Traduccion de conversaciones multilingues en atencion al cliente: el modelo puede gestionar conversaciones multi-turno aprovechando el contexto extendido y el prefix caching para reutilizar el historial entre turnos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16,3 GB para los pesos cuantizados, mas espacio para KV cache y overhead de ejecucion; la model card indica que funciona en GPUs de 24 GB con `--gpu-memory-utilization=0.97`.
- GPUs recomendadas: RTX 3090 y RTX 4090 (24 GB) segun la model card; tambien compatible con A100 y H100 por soporte de kernels Marlin.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como RTX 3090 y RTX 4090.
- Opciones de despliegue: vLLM con kernels Marlin (configuracion documentada por el autor); otros motores como llama.cpp, Ollama o TGI no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles. La model card sugiere `--max-num-seqs=32`, `--max-num-batched-tokens=8192`, `--kv-cache-dtype=int8_per_token_head` y `--compilation-config='{"max_cudagraph_capture_size": 32}'` como ajustes de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-MT2-30B-A3B-W4A16-Marlin (este) | 30B totales / ~3B activos | no disponible (ejemplo: 32768) | W4A16 GPTQ Marlin | Apache-2.0 | Hugging Face, 36 descargas |
| tencent/Hy-MT2-30B-A3B (base) | 30B totales / ~3B activos | no disponible | fp16/bf16 | Apache-2.0 | Hugging Face |
| Alternativas de traduccion de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion W4A16 puede introducir perdida de calidad respecto al modelo base en fp16/bf16; no se han publicado evaluaciones que cuantifiquen esa degradacion.
- El calibrado se realizo con un dataset generico de conversacion (ultrachat_200k) y no con datos de traduccion, lo que podria no representar optimamente la distribucion de uso real.
- No se documentan los idiomas soportados ni la calidad por par de idiomas.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible; al ser un modelo de traduccion, puede producir traducciones infieles en dominios especializados.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base de Tencent.
- Requiere `--trust-remote-code` en vLLM, lo que implica ejecutar codigo del repositorio; conviene auditar el contenido antes de desplegarlo en produccion.
- El checkpoint tiene pocas descargas (36) y ningun like, por lo que su validacion por la comunidad es practicamente nula.

## Enlaces

- Hugging Face: https://huggingface.co/afanasjev/Hy-MT2-30B-A3B-W4A16-Marlin
- Modelo base: https://huggingface.co/tencent/Hy-MT2-30B-A3B
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Dataset de calibracion: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
