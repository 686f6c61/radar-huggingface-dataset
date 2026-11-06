# nchapman/Qwen3.5-2B-W4A16-HGPTQ

## Resumen

Qwen3.5-2B-W4A16-HGPTQ es una cuantizacion de 4 bits (W4A16) del modelo multimodal Qwen/Qwen3.5-2B, publicada por el usuario nchapman bajo licencia Apache 2.0. No se trata de un modelo nuevo, sino de un artefacto de compresion que aplica GPTQ con descomposicion de Cholesky, `group_size=64` y `actorder="static"`, combinado con una rotacion Hadamard por bloques aplicada en linea sobre las activaciones de entrada. El objetivo es reducir el peso del modelo a aproximadamente 1,84 GiB de safetensors manteniendo una fidelidad respecto al modelo BF16 notablemente superior a la de una cuantizacion W4A16 convencional.

El modelo base es un transformer multimodal de tipo image-text-to-text con 2.213.241.664 parametros (unos 2,2 mil millones), pensado para generacion de texto, razonamiento y comprension de imagenes. La cuantizacion cubre 255 capas lineales: 150 del modulo de lenguaje, 98 del codificador visual y 7 del modulo Native MTP (multi-token prediction). Quedan en BF16 las proyecciones `linear_attn.in_proj_a` y `linear_attn.in_proj_b`, `embed_tokens`/`lm_head`, `mtp.fc`, `visual.patch_embed.proj`, las normas y los sesgos.

Su relevancia es practica: demuestra que una rotacion Hadamard determinista de 64 dimensiones, aplicada sin almacenar tensores adicionales, reduce la perdida de calidad de la cuantizacion a 4 bits hasta un punto en el que el delta de perplejidad frente a BF16 cae al +1,669 %. Es un artefacto orientado a despliegue en vLLM, no un modelo para entrenamiento ni fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atencion lineal hibrida y modulo Native MTP; derivada de Qwen3.5-2B |
| Parametros totales | 2.213.241.664 (2,2 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 GPTQ, `group_size=64`, `actorder="static"`, Cholesky GPTQ, rotacion block-Hadamard en linea (`head_dim=64`); pesos en 4 bits, activaciones en 16 bits; capas residuales en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` + `model_mtp.safetensors`), compatible con compressed-tensors y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B es un transformer multimodal que combina un modulo de lenguaje con atencion lineal (las proyecciones `linear_attn.in_proj_a` y `linear_attn.in_proj_b` se mantienen en BF16 tras la cuantizacion), un codificador visual con `visual.patch_embed.proj` y un cabezal Native MTP para prediccion multi-token. Esta ficha no dispone de informacion sobre el numero de tokens de preentrenamiento, la composicion del dataset original ni si hubo fases de RLHF o DPO en el modelo base.

La innovacion de este artefacto esta en el proceso de cuantizacion. Antes de aplicar GPTQ, los pesos de las 255 capas lineales se rotan offline segun `W' = W H_64 / sqrt(64)`, donde `H_64` es la matriz de Walsh-Hadamard de Sylvester de 64x64. En inferencia se aplica la misma rotacion normalizada por bloques a la ultima dimension de las activaciones de entrada antes del GEMM W4A16: `x' = unflatten(x, (-1, 64)) · H_64 / sqrt(64)`. Como la matriz es determinista (`randomize: false`), no se almacenan tensores de transformacion y el coste en disco es cero.

La calibracion del modulo de texto y del MTP uso 999 muestras de 4096 tokens procedentes de nvidia/Nemotron-Cascade-2-SFT-Data, congeladas en el dataset warp-3090-quant-lab-frozen-data; el MTP se calibro sobre estados ocultos post-norm capturados y embeddings de tokens desplazados. La calibracion de vision uso 64 imagenes de ChartQA y TextVQA, disjuntas de las 48 imagenes del conjunto de evaluacion. El artefacto incluye una plantilla de chat propia (froggeric Qwen-Fixed-Chat-Templates v22.5) y una `generation_config.json` con `temperature 1.0`, `top_p 0.95`, `top_k 20`.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat incluida en el repositorio.
- Comprension de imagenes y respuesta texto-a-partir-de-imagen (pipeline `image-text-to-text`), con codificador visual cuantizado en W4A16.
- Razonamiento y respuesta a preguntas sobre documentos visuales, incluyendo graficos y tablas (la calibracion de vision uso ChartQA y TextVQA).
- Prediccion multi-token mediante el modulo Native MTP, que puede aprovecharse para decodificacion especulativa.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un asistente multimodal en una unica GPU de consumo: con 1,84 GiB de pesos en 4 bits, el modelo cabe holgadamente en tarjetas de 8 GB o 12 GB junto con la cache KV, lo que permite montar un servicio de chat con imagenes en hardware asequible.
- Analisis de graficos y tablas en informes: el codificador visual se calibro especificamente con ChartQA y TextVQA, de modo que el modelo es adecuado para extraer valores y tendencias de capturas de dashboards o figuras de papers.
- Transcripcion y resumen de capturas de pantalla en herramientas de soporte: el modelo puede recibir una imagen y devolver una descripcion textual estructurada, util para clasificar tickets con adjuntos.
- Prototipado rapido de pipelines RAG multimodales: al ser compatible con vLLM y compressed-tensors, se puede levantar un endpoint OpenAI-compatible y conectarlo a un orquestador de recuperacion sin reentrenar nada.
- Evaluacion de tecnicas de cuantizacion: el repositorio publica metricas de fidelidad (KL, perplejidad, similitud coseno del ViT) frente a variantes `g128-h0` y `g64-h0`, lo que lo convierte en un banco de pruebas para investigar rotaciones Hadamard en modelos multimodales pequenos.
- Decodificacion especulativa con MTP: el modulo Native MTP cuantizado conserva un Top-1 del 91,87 % en su evaluacion aislada, por lo que puede usarse como cabezal de propuestas en un esquema de speculative decoding sobre el modelo principal.
- Inferencia en entornos con memoria limitada o edge: el payload de 1,84 GiB permite almacenar el modelo en dispositivos con almacenamiento reducido y cargarlo en GPUs de gama media para tareas de clasificacion y captioning de imagenes.

## Benchmarks y rendimiento

El autor publica metricas de fidelidad de la cuantizacion frente al modelo BF16 y frente a otras recetas W4A16, no benchmarks de tareas estandar (MMLU, HumanEval, GSM8K). Se reproducen a continuacion los datos disponibles.

| Metrica | g128-h0 | g64-h0 | HGPTQ-g64-h64 (este repo) | Cambio vs g64-h0 |
|---|---:|---:|---:|---:|
| probe-v4 weighted KL (378 filas / 840k tokens), menor es mejor | 0,1038 | 0,0869 | 0,0728 | -16,3 % (347/378 filas) |
| probe-v4 KL medio por token / p99.9 | 0,3155 / 15,99 | 0,2874 / 15,42 | 0,2543 / 14,80 | -11,5 % |
| probe-v4 delta de perplejidad vs BF16 | +5,363 % | +4,917 % | +1,669 % | -66,1 % |
| probe-guard KL medio por token (76 filas) | 0,1030 | 0,0839 | 0,0572 | -31,8 % (75/76 filas) |
| Native MTP KL aislado / Top-1 | 0,0537 / 89,14 % | 0,0397 / 89,75 % | 0,0255 / 91,87 % | -35,8 % KL |
| Vision ViT Rel-RMSE / similitud coseno | 0,4080 / 0,9302 | 0,3757 / 0,9410 | 0,3305 / 0,9544 | -12,0 % RMSE |
| Vision KL de respuesta aislada / Top-1 | 0,0136 / 95,54 % | 0,0206 / 96,18 % | 0,0152 / 97,45 % | empata con W8A16 en Top-1 |
| Payload de safetensors | 1,815 GiB | 1,841 GiB | 1,841 GiB | +0 bytes |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, MMMU) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 1,84 GiB en 4 bits; sumando cache KV, buffers de activaciones y el codificador visual, el consumo realista parte de unos 3-4 GB en contextos cortos y crece con la longitud de contexto (no se publica una cifra oficial).
- GPU recomendadas: el autor desarrollo y valido la receta en una RTX 3090; tambien es adecuado para A100, H100 y RTX 4090, donde la carga es trivial y el cuello de botella pasa a ser el throughput del servidor.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB en adelante (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070 y superiores).
- Opciones de despliegue: vLLM V1 (version `v0.31.0` segun el autor) mediante compressed-tensors; tambien es cargable con Transformers. No se documenta soporte para llama.cpp, Ollama ni TGI en la informacion disponible.
- Nota critica de despliegue: las capas de texto (248 lineales) y MTP (7 lineales) cargan sin cambios en vLLM, pero las capas de vision (`model.visual.*`) requieren un parche de dos lineas en `vllm/model_executor/layers/quantization/compressed_tensors/transform/linear.py` para lineales con sesgo y `QKVParallelLinear` no fusionado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-W4A16-HGPTQ (este) | 2,2 mil millones | no disponible | W4A16 GPTQ + Hadamard, g64 | Apache 2.0 | Hugging Face, vLLM con parche para vision |
| nchapman/Qwen3.5-2B-W4A16-GPTQ | 2,2 mil millones | no disponible | W4A16 GPTQ sin rotacion | Apache 2.0 | Hugging Face |
| nchapman/Qwen3.5-2B-W4A16-HGPTQ-g64 | 2,2 mil millones | no disponible | W4A16 GPTQ + Hadamard, variante g64 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-2B (BF16) | 2,2 mil millones | no disponible | BF16 | Apache 2.0 | Hugging Face |

Las tres variantes cuantizadas comparten base y licencia; la diferencia medible esta en la fidelidad: el delta de perplejidad pasa de +4,917 % en `g64-h0` a +1,669 % en este repositorio, sin coste adicional de almacenamiento.

## Limitaciones y advertencias

- Es un artefacto de cuantizacion, no un modelo entrenado: hereda todos los sesgos y limitaciones del Qwen3.5-2B original, que no se documentan en la informacion disponible.
- La cuantizacion introduce degradacion medible: +1,669 % de perplejidad frente a BF16 y un KL medio por token de 0,2543 en `probe-v4`. Aunque es la mejor variante publicada por el autor, no es equivalente al modelo completo.
- Riesgo de alucinacion: inherente a un modelo de 2,2 mil millones de parametros; no se han publicado evaluaciones de veracidad.
- El soporte de vision en vLLM requiere modificar el codigo de la libreria; sin ese parche, solo funcionan texto y MTP. Esto complica el despliegue en produccion y ata el artefacto a una version concreta de vLLM.
- La plantilla de chat incluida es una version de terceros (froggeric v22.5), no la oficial de Qwen; conviene validar el formato antes de usarla en produccion.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento aceptable fuera de los idiomas cubiertos por el modelo base.
- Longitud de contexto no documentada en esta ficha; verificar en la model card de Qwen/Qwen3.5-2B antes de disenar aplicaciones con contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el artefacto ni sobre la receta de cuantizacion.
- El repositorio tiene un volumen de descargas muy bajo (9 en el momento de la consulta) y ninguna validacion independiente; tratar las metricas publicadas como resultados del propio autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nchapman/Qwen3.5-2B-W4A16-HGPTQ
- Variante g64: https://huggingface.co/nchapman/Qwen3.5-2B-W4A16-HGPTQ-g64
- Variante sin rotacion Hadamard: https://huggingface.co/nchapman/Qwen3.5-2B-W4A16-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de calibracion: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
- Dataset de calibracion congelado: https://huggingface.co/datasets/nchapman/warp-3090-quant-lab-frozen-data
- Plantillas de chat: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Repositorio de herramientas y receta: https://github.com/nchapman/warp-3090-model-lab
