# kwanhee/Kimi-K2.5-REAP50-NVFP4-W4A4-GS16

## Resumen

Kimi-K2.5-REAP50-NVFP4-W4A4-GS16 es un modelo de mezcla de expertos (MoE) multimodal, derivado de Kimi-K2.5 de Moonshot AI, que ha sido podado y cuantizado por el autor kwanhee. La poda, realizada con la técnica REAP, elimina el 50 % de los expertos enrutados (de 384 a 192) manteniendo el top-8 activo por token. Posteriormente, el modelo se cuantiza a NVFP4 W4A4 (pesos y activaciones en 4 bits con grupo de 16), lo que reduce el tamaño a 288.4 GB. El objetivo es ofrecer una versión eficiente del modelo original que conserve el máximo rendimiento posible: en las mediciones del autor, alcanza el 97.06 % del promedio OpenLLM del modelo denso, con una recuperación del 100.9 % en math500.

Este checkpoint está pensado como baseline en un estudio sobre compresión de MoE a gran escala. El autor lo compara con otras técnicas, como la sparsity 4:8 combinada con W4A4, y muestra que la poda de expertos más cuantización NVFP4 escala mejor en modelos de más de 500 000 millones de parámetros. Aunque conserva la arquitectura multimodal (incluye vision tower), la ruta de visión no ha sido evaluada en esta versión; todos los resultados de rendimiento proceden de inferencia solo de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE multimodal (texto + visión), 192 expertos enrutados de 384, top-8 activos por token |
| Parámetros totales | 519 453 777 648 (519B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 73728 tokens (configuración de despliegue; el modelo base Kimi-K2.5 soporta hasta 262144) |
| Tipos de cuantización | NVFP4 W4A4 (gs16), con capas en bf16 (lm_head, embed_tokens, self_attn, layernorms, mlp.gate, vision tower) |
| Idiomas soportados | no disponible |
| Licencia | Modified MIT |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo parte de Kimi-K2.5, un MoE multimodal de Moonshot AI. La poda se realizó en dos etapas. Primero, con llm-compressor y el modificador REAPPruningModifier (sparsity 0.5), se eliminaron 192 de los 384 expertos enrutados, calibrando sobre un corpus mixto. El resultado intermedio fue un checkpoint en bf16 de 968 GB con 192 expertos. Segundo, ese checkpoint se cuantizó con una configuración NVFP4 W4A4 (tensor_group gs 16, simétrico, activaciones dinámicas locales), dejando en bf16 las capas críticas: lm_head, embed_tokens, self_attn, layernorms, mlp.gate y el vision tower. El modelo final ocupa 288.4 GB en 62 shards.

Una particularidad técnica es que la poda requiere cargar el modelo de forma nativa con transformers >= 5.14 (registro kimi_k25), no con trust_remote_code, porque el código remoto de DeepSeek-V3 expone los expertos como una ModuleList por experto y el linearizer de llm-compressor los omite. Además, el checkpoint usa el nombre de arquitectura correcto KimiK25ForConditionalGeneration para que vLLM lo reconozca.

## Capacidades

- Generación de texto y razonamiento matemático/lógico: obtiene 0.9724 en math500, 0.8667 en aime25 y 0.7717 en gpqa:diamond, con recuperación del 90.6 %, 86.2 % y 100.9 % respectivamente frente al modelo denso.
- Comprensión multimodal: conserva el vision tower y el pipeline image-text-to-text, pero la ruta de visión no ha sido evaluada en este checkpoint.
- Contexto largo: configurado para 73728 tokens, lo que permite procesar documentos extensos y mantener trazas de razonamiento largas.
- Eficiencia de memoria: cuantización NVFP4 W4A4 con tamaño de pesos de 288.4 GB, frente a los 968 GB del checkpoint podado en bf16.
- Compatibilidad con vLLM: requiere un fork específico (kwanhee-lee/vllm-private, rama paired48-nvfp4-moe) para servirse correctamente.
- Modelo agéntico: el modelo base Kimi-K2.5 es un modelo agéntico multimodal con capacidades de agente y swarm; este checkpoint conserva la arquitectura, aunque no se han reportado evaluaciones específicas de tool calling o agentes.

## Casos de uso

- Servicio de razonamiento matemático en producción: el modelo mantiene el 100.9 % de math500 frente al denso, por lo que puede usarse en sistemas de tutoría, verificación de soluciones o generación de problemas, con un coste de memoria reducido.
- Análisis de documentos largos: con 73728 tokens de contexto, puede procesar informes, contratos o expedientes técnicos completos y responder preguntas sobre ellos, sin necesidad de dividir el texto.
- Investigación en compresión de MoE: sirve como baseline reproducible para comparar poda de expertos (REAP) frente a sparsity de pesos, cuantización NVFP4 frente a INT4, y para estudiar el impacto del contexto en el rendimiento de razonamiento.
- Evaluación comparativa en benchmarks de razonamiento: investigadores pueden desplegarlo en vLLM (4×B200) para reproducir las mediciones de aime25, gpqa:diamond y math500, y comparar con otros modelos de la misma escala.
- Asistentes multimodales en servidores de gran capacidad: aunque la visión no está evaluada, el checkpoint conserva el vision tower y podría usarse en experimentos de descripción de imágenes o razonamiento visual, siempre que se valide primero esa ruta.
- Generación de código y asistencia técnica: el modelo base es un modelo agéntico con capacidades de código; este checkpoint, al conservar la arquitectura y el contexto largo, puede integrarse en pipelines de agentes para tareas de programación asistida, aunque se recomienda evaluar el tool calling antes de producción.

## Benchmarks y rendimiento

Mediciones realizadas por el autor sobre 4×B200, contexto 73728, kv-cache-dtype auto, con un fork de vLLM. La recuperación se calcula frente al modelo denso Kimi-K2.5 de referencia en el mismo stack.

### OpenLLM v1

| Tarea | Este modelo | Modelo denso | Recuperación |
|---|---|---|---|
| arc_challenge | 70.99 | 74.06 | 95.9 % |
| gsm8k | 91.96 | 94.39 | 97.4 % |
| hellaswag | 88.93 | 91.96 | 96.7 % |
| mmlu | 86.95 | 89.53 | 97.1 % |
| truthfulqa_mc2 | 59.18 | 62.69 | 94.4 % |
| winogrande | 82.00 | 81.93 | 100.1 % |
| Promedio | 80.00 | 82.43 | 97.06 % |

### Reasoning

| Bench | Este modelo | Modelo denso | Recuperación |
|---|---|---|---|
| aime25 | 0.8667 | 0.9567 | 90.6 % |
| gpqa:diamond | 0.7717 | 0.8949 | 86.2 % |
| math500 | 0.9724 | 0.9636 | 100.9 % |

El autor advierte que el resultado de math500 por encima del denso es real pero no está explicado; no debe usarse como argumento sólido.

## Requisitos de hardware

- VRAM estimada: 288.4 GB solo para los pesos en NVFP4; hay que añadir la memoria para la caché KV. Las mediciones se realizaron con 4×B200 (192 GB cada una).
- GPU recomendadas: NVIDIA B200 (4 unidades) para la configuración de contexto 73728 y kv-cache-dtype auto.
- No cabe en GPUs de consumo: el modelo requiere servidores con múltiples GPUs de gran capacidad; no es viable en RTX 4090 u otras tarjetas de consumo.
- Para servir con contexto 262144 en GPUs de 80 GB (A100/H100), el model card indica que se necesita cuantización fp8, que forma un conjunto de comparación separado.
- Opciones de despliegue: vLLM fork (kwanhee-lee/vllm-private, rama paired48-nvfp4-moe), con --max-model-len 73728 --kv-cache-dtype auto -dp 4.
- Latencia y throughput: no disponible. El primer arranque en frío puede tardar ~700 s debido al autotuning de FlashInfer para NVFP4; se recomienda aumentar el timeout de engine-ready por encima de 600 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Promedio OpenLLM | Licencia |
|---|---|---|---|---|
| Este (REAP50 + NVFP4 W4A4) | 519B totales | 73728 (config de despliegue) | 80.00 | Modified MIT |
| Kimi-K2.5 denso | no disponible | 262144 (según model card) | 82.43 | Modified MIT |
| REAP50 + INT4 W4A16 (mismo autor) | no disponible | no disponible | no disponible | Modified MIT |
| Arm 4:8-sparse W4A4 (del estudio) | no disponible | no disponible | no disponible | no disponible |

La variante INT4 W4A16 existe en HuggingFace y el autor la compara con este checkpoint en su model card, pero no se proporcionan cifras concretas en la información disponible. El arm 4:8-sparse W4A4 se menciona en el estudio: en gsm8k obtiene 84.0 % con el mismo presupuesto de bits, frente al 91.96 % de este modelo.

## Limitaciones y advertencias

- La ruta de visión no ha sido evaluada: los resultados de OpenLLM y reasoning proceden de inferencia solo de texto. El checkpoint es estructuralmente correcto en visión, pero no se ha medido.
- El contexto de 73728 es crítico: por debajo de ese valor, las trazas de razonamiento se truncan en mitad de la etiqueta
