# nchapman/Qwen3.5-9B-W4A16-HGPTQ

## Resumen

Qwen3.5-9B-W4A16-HGPTQ es una cuantizacion INT4 de solo pesos (W4A16) del modelo multimodal Qwen/Qwen3.5-9B, publicada por el usuario nchapman. El artefacto aplica GPTQ con descomposicion de Cholesky (group_size=64, actorder estático) combinado con una rotacion Hadamard por bloques aplicada en linea sobre las activaciones de entrada, siguiendo el enfoque QuIP / R4. El resultado es un checkpoint de 9.409.813.744 parametros con un payload de safetensors de 7,62 GiB, frente a los aproximadamente 18,8 GB que ocuparian los pesos en BF16.

El modelo base es un transformer multimodal de tipo image-text-to-text de la familia Qwen3.5, con 9.000 millones de parametros y capacidad nativa de prediccion multi-token (MTP). La cuantizacion cubre 317 capas lineales: 200 del bloque de texto, 7 del modulo MTP nativo y 110 de la torre de vision. Las capas mas sensibles (embeddings, lm_head, proyecciones de atencion lineal, patch embedding visual, normas y sesgos) permanecen en BF16.

Su relevancia practica radica en que permite servir un modelo de 9B multimodal en GPUs de consumo con 24 GB (RTX 3090, 4090) manteniendo una fidelidad medida muy alta respecto al BF16: un incremento de perplejidad del +1,887 % y una KL media por token de 0,2199 en el probe de evaluacion. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atencion lineal hibrida y modulo MTP nativo; base Qwen3.5-9B |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 GPTQ con Cholesky, group_size=64, actorder estático, rotacion Hadamard en linea (head_dim=64; head_dim=16 en `visual.blocks.*.mlp.linear_fc2`); capas sensibles en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), 7,6175 GiB / 8.179.266.352 bytes |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer multimodal que procesa texto e imagenes, con un bloque de texto principal, una torre de vision (`model.visual.*`) y un modulo de prediccion multi-token (MTP) nativo compuesto por 7 capas lineales. La cuantizacion actua sobre 317 capas lineales: 200 de texto, 7 de MTP y 110 de vision. Los pesos se rotan offline a lo largo de la dimension de entrada (W' = W·H_b/√b, con H_b la matriz de Walsh-Hadamard de Sylvester determinista, b=64 para `v` y b=16 para `v_vision_fc2`) antes de aplicar GPTQ con Cholesky. En tiempo de inferencia hay que aplicar la misma rotacion normalizada por bloques a las activaciones de entrada antes del GEMM INT4; al ser H_b determinista (`randomize: false`), no se almacenan tensores de transformacion y el sobrecoste de almacenamiento es cero.

La calibracion de texto y MTP uso 999 muestras de 4.096 tokens procedentes de nvidia/Nemotron-Cascade-2-SFT-Data, fijadas en el dataset warp-3090-quant-lab-frozen-data; el MTP se calibro sobre estados ocultos post-norm capturados y embeddings de tokens desplazados. La calibracion de vision uso 64 imagenes de ChartQA y TextVQA, disjuntas del conjunto de evaluacion de 48 imagenes. La capa `visual.blocks.*.mlp.linear_fc2` (K=4304) recibio GPTQ por canal con Cholesky y Hadamard en linea con head_dim=16. No se dispone de informacion sobre el volumen total de tokens de preentrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat incluida (`chat_template.jinja`, plantilla Qwen-Fixed-Chat-Templates v22.5).
- Comprension de imagenes y respuesta en texto (pipeline image-text-to-text): descripcion, VQA y lectura de graficos y tablas, dado el uso de ChartQA y TextVQA en la calibracion de vision.
- Prediccion multi-token (MTP) nativa, que permite decodificacion especulativa interna con una concordancia top-1 medida del 94,80 % en aislamiento y del 86,81 % de extremo a extremo.
- Razonamiento y generacion de codigo: capacidad heredada del modelo base Qwen3.5-9B; no se aportan metricas especificas en la informacion disponible.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Tool calling / function calling: no confirmado en la informacion disponible para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente para este artefacto.

## Casos de uso

- Asistente conversacional local en GPU de 24 GB: el checkpoint INT4 (7,62 GiB de pesos) deja espacio para cache KV y permite desplegar un modelo de 9B multimodal en una RTX 3090 o 4090, con la plantilla de chat ya incluida y sampling por defecto de temperature 1.0, top_p 0.95 y top_k 20.
- Analisis de graficos y documentos escaneados: la torre de vision cuantizada conserva una similitud coseno de 0,9813 en features del ViT y un 94,27 % de concordancia top-1 en respuestas de extremo a extremo, suficiente para tareas de extraccion de datos de ChartQA y TextVQA en entornos con presupuesto de VRAM limitado.
- Procesamiento de imagenes en lote sobre infraestructura de una sola GPU: al reducir el payload a 7,62 GiB, se pueden mantener varias instancias o un batch mayor en un nodo con una A100 de 40 GB, usando vLLM V1 (v0.31.0) como servidor.
- Evaluacion comparativa de tecnicas de cuantizacion: el autor publica variantes alternativas (GPTQ estandar, g64), lo que permite medir el impacto de la rotacion Hadamard y del group_size sobre la misma base en pipelines de investigacion.
- Prototipado de asistentes con vision para investigacion academica: la licencia Apache 2.0 del modelo base facilita su uso y modificacion en proyectos sin restricciones de uso comercial.
- Servicio de inferencia con decodificacion especulativa: el modulo MTP nativo cuantizado, con 94,80 % de concordancia top-1 en aislamiento, permite acelerar la generacion en vLLM siempre que se valide el comportamiento end-to-end (86,81 % de concordancia).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica metricas de fidelidad de la cuantizacion frente al modelo BF16:

| Metrica | Valor medido |
|---|---:|
| probe-v4 weighted KL (378 filas / 840.187 tokens) | 0,072561 |
| probe-v4 KL media por token / p99.9 | 0,219906 / 18,9820 |
| probe-v4 delta de perplejidad vs BF16 (3,5754 → 3,6428) | +1,887 % |
| probe-guard KL media por token / delta PPL (76 filas) | 0,039547 / +1,388 % |
| MTP nativo aislado: KL / concordancia top-1 (11.583 posiciones) | 0,012801 / 94,80 % |
| MTP nativo extremo a extremo: KL / concordancia top-1 | 0,204901 / 86,81 % |
| Vision: Rel-RMSE / similitud coseno de features ViT (48 imagenes) | 0,2114 / 0,9813 |
| Vision aislada: KL / concordancia top-1 (157 tokens) | 0,007640 / 98,09 % (154/157) |
| Vision extremo a extremo: KL / concordancia top-1 | 0,038995 / 94,27 % |
| Payload de safetensors | 7,6175 GiB (8.179.266.352 bytes) |

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 7,62 GiB; con cache KV y overhead de runtime, el modelo cabe holgadamente en GPUs de 16-24 GB.
- GPU recomendadas: NVIDIA Ampere o superior (RTX 3090, RTX 4090, A100, H100); el autor apunta a GPUs de 24 GB como objetivo de la cuantizacion.
- GPU de consumo: si, en RTX 3090/4090 (24 GB) y previsiblemente en GPUs de 16 GB con contextos moderados; no se especifica el limite exacto de contexto.
- Despliegue: vLLM V1 (v0.31.0) es el servidor de referencia; tambien transformers con compressed-tensors. Para vision en vLLM hacen falta dos ajustes manuales en `vllm/model_executor/layers/quantization/compressed_tensors/transform/linear.py` (soporte de sesgo y de `QKVParallelLinear` sin fusionar). No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Payload | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| nchapman/Qwen3.5-9B-W4A16-HGPTQ | 9,41 B | W4A16 GPTQ + Hadamard, g=64 | 7,62 GiB | no disponible | Apache 2.0 | Rotacion Hadamard en linea; requiere transform en runtime |
| nchapman/Qwen3.5-9B-W4A16-HGPTQ-g64 | 9,41 B (base) | W4A16 GPTQ + Hadamard, g=64 | no disponible | no disponible | Apache 2.0 | Variante del mismo autor |
| nchapman/Qwen3.5-9B-W4A16-GPTQ | 9,41 B (base) | INT4 weight-only GPTQ (llm-compressor) | no disponible | no disponible | Apache 2.0 | Sin rotacion Hadamard; servido por kernels Marlin en vLLM |
| Qwen/Qwen3.5-9B (BF16) | 9,41 B | ninguna | ~18,8 GB (estimado) | no disponible | Apache 2.0 | Referencia de fidelidad; requiere mas VRAM |

## Limitaciones y advertencias

- La rotacion Hadamard debe aplicarse en tiempo de inferencia sobre las activaciones de entrada; un runtime que cargue los pesos sin aplicar la transformacion producira salidas incorrectas.
- El soporte de vision en vLLM V1 v0.31.0 requiere parchear dos lineas del codigo de compressed-tensors; sin ese parche solo cargan texto y MTP.
- La fidelidad no es perfecta: +1,887 % de perplejidad y KL media por token de 0,2199 en el probe principal, con una cola p99.9 de KL de 18,98 que indica divergencias puntuales en algunos tokens.
- El MTP end-to-end degrada mas que en aislamiento (86,81 % de concordancia top-1 frente a 94,80 %), lo que puede afectar a la calidad de la decodificacion especulativa.
- La calibracion de vision se hizo con solo 64 imagenes de ChartQA y TextVQA, por lo que el comportamiento en dominios visuales distintos (fotografia natural, documentos densos) no esta validado.
- No hay informacion sobre sesgos, idiomas soportados ni tasas de alucinacion; se heredan las caracteristicas del modelo base Qwen3.5-9B, no documentadas aqui.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen3.5-9B-W4A16-HGPTQ
- Variante g64: https://huggingface.co/nchapman/Qwen3.5-9B-W4A16-HGPTQ-g64
- Variante GPTQ sin Hadamard: https://huggingface.co/nchapman/Qwen3.5-9B-W4A16-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de receta y tooling: https://github.com/nchapman/warp-3090-model-lab
- Dataset de calibracion congelado: https://huggingface.co/datasets/nchapman/warp-3090-quant-lab-frozen-data
- Dataset de calibracion original: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
- Plantillas de chat: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
