# darioooooo0o/Qwen3.8-27B-GPTQ-Int4-asym

## Resumen

Qwen3.8-27B-GPTQ-Int4-asym es una cuantización de 4 bits del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario darioooooo0o. Se trata de un checkpoint GPTQ int4 asimétrico (grupo 128) construido específicamente para ejecutarse en una única tarjeta Intel Arc Pro B70, con el objetivo de reducir el coste de memoria de un modelo de 27.781.427.952 parámetros sin degradar en exceso la calidad respecto a BF16.

El modelo conserva la pila multimodal del original, torre de visión incluida, y expone el pipeline image-text-to-text, por lo que acepta tanto imágenes como texto. Según el autor, las capas lm_head, MTP y la torre de visión permanecen en BF16, mientras que el resto de la red se cuantiza a int4 asimétrico con grupo 128. Frente a una cuantización GPTQ int4 simétrica del mismo tamaño, el autor reporta aproximadamente la mitad de divergencia KL respecto a BF16 sobre ventanas retenidas de 2048 tokens.

Su relevancia es doble: demuestra que un modelo de ~27,78 B de parámetros puede servirse en 4 bits sobre hardware Intel XPU de gama profesional, y documenta de forma reproducible el proceso completo (calibración, búsqueda de clip, export a GPTQ v1) junto con un cookbook de despliegue con vLLM XPU, contexto de 262.144 tokens, MTP con k=4 y caché KV en fp8 sobre una sola tarjeta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la información disponible; el autor menciona capas GDN, un cabezal MTP y una torre de visión en el modelo base Qwen/Qwen3.8-27B |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (no se indica que el modelo sea MoE) |
| Longitud de contexto | 262.144 tokens con visión en la configuración de referencia (vLLM XPU v0.31.0 con el cookbook); máximo nativo del modelo base no disponible |
| Tipos de cuantizacion | GPTQ int4 asimétrico (uint4), grupo 128, formato GPTQ v1 con `sym: false` y búsqueda de clip; lm_head, capas MTP, torre de visión y GDN `in_proj_a`/`in_proj_b` se mantienen en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint GPTQ v1, qzeros almacenan z-1) |

## Arquitectura y entrenamiento

Este repositorio no es un modelo entrenado, sino una cuantización del checkpoint Qwen/Qwen3.8-27B. Por tanto, no hay información disponible sobre la composición del dataset de preentrenamiento, el número de tokens vistos ni sobre fases de ajuste como RLHF o DPO; esos detalles corresponderían a la model card del modelo base, que no se incluye en la información proporcionada. Lo que sí se documenta con precisión es el procedimiento de cuantización: GPTQ con damping 0,01, `act-order` desactivado, cuantización asimétrica uint4 con escala y cero por grupo (grupo 128) y una búsqueda de clip sobre 11 ratios que minimiza la norma |err|^2.4. El proceso se ejecutó capa a capa sobre la propia B70 y tardó aproximadamente una hora.

La calibración utilizó 128 ventanas de 2048 tokens: 40 muestras de razonamiento y agentes procedentes de datasets propios del autor (no publicados), 44 ventanas de código fuente Python y 44 ventanas de prosa técnica extraída de documentación de Linux, disjuntas de las ventanas de evaluación. La exportación se realizó a GPTQ v1 en el que los qzeros almacenan z-1; los dos grupos con z=0 se reajustaron a z=1 (lo que implica modificar dos pesos) y el resultado se verificó contra la cuantización en crudo usando la semántica de dequantización de GPTQModel. Como innovaciones destacables en el entorno de servicio, el autor aprovecha el cabezal MTP (multi-token prediction) con k=4 como mecanismo de decodificación especulativa, además de caché KV en fp8.

## Capacidades

- Generación de texto conversacional, con modo "thinking" desactivable (las pruebas del autor se hicieron con thinking off).
- Entrada multimodal de imagen y texto: el pipeline declarado es image-text-to-text y la torre de visión se conserva en BF16.
- Contexto largo de hasta 262.144 tokens con visión en la configuración de referencia; el autor verifica la recuperación de una aguja (needle) en una ventana de 237K tokens.
- Decodificación acelerada mediante el cabezal MTP con k=4, que actúa como decodificación especulativa (35 ms por paso de verificación MTP).
- Capacidad de trabajo con código y prosa técnica, según la composición de la calibración (ventanas de Python y documentación Linux), aunque esto describe el conjunto de calibración, no una evaluación de capacidades.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; los datasets de calibración incluyen muestras "reasoning/agentic", pero no se publica una evaluación de dichas capacidades.
- Capacidades multilingües: no disponible.

## Casos de uso

- Análisis de documentación técnica extensa: gracias a la ventana de 262.144 tokens y al needle recuperado a 237K, el modelo permite cargar manuales, RFCs o documentación de kernel completos en un único contexto sin trocear ni recurrir a RAG, algo útil para consultas sobre documentación de Linux o especificaciones largas.
- Asistencia de código en entornos con hardware Intel: el modelo está pensado para servirse en una Intel Arc Pro B70 con vLLM XPU, por lo que encaja en equipos de desarrollo que ya dispongan de esa tarjeta y quieran generación y revisión de código Python sin depender de GPU NVIDIA.
- Comprensión de documentos con imágenes: al mantener el pipeline image-text-to-text, puede procesar capturas de pantalla, diagramas de arquitectura o documentación escaneada y responder preguntas sobre su contenido, integrándose en flujos de revisión técnica.
- Atención al cliente multi-turno con contexto largo: la combinación de conversación, contexto de 262K y MTP para reducir la latencia de decodificación (66-119 tok/s en prompts cortos) permite mantener historiales de conversación muy largos sin truncar.
- Análisis de trazas y logs extensos: con 2042 tok/s de prefill a 5.7K tokens y 824 tok/s a 237K, es viable ingerir ficheros de log o trazas de miles de tokens y pedir resúmenes o detección de anomalías en una sola pasada.
- Despliegue on-premise con requisitos de privacidad: al caber en una sola tarjeta de gama profesional, el modelo se puede ejecutar en infraestructura local sin enviar datos a servicios externos, algo relevante en sectores regulados.
- Prototipado de agentes con razonamiento multi-paso: aunque no haya evaluación publicada, la presencia de muestras agentic en la calibración y el soporte de contexto largo lo hacen apto como banco de pruebas para pipelines de agentes, siempre con validación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de la cuantización (divergencia KL sobre los 20 logits más probables en ventanas retenidas de 2048 tokens; menor es mejor) y de coincidencia top-1:

| Modelo | Código | Prosa técnica | Chat | Global | Coincidencia top-1 |
|---|---|---|---|---|---|
| GPTQ int4 de SergiioB (sym g128, GPTQModel) | 0,087 | 0,103 | 0,050 | 0,078 | 91,3 % |
| Esta cuantización | 0,037 | 0,057 | 0,025 | 0,039 | 93,8 % |
| Esta cuantización + lm_head fp8 (como se sirve en el cookbook) | 0,038 | 0,058 | 0,025 | 0,039 | 93,5 % |

Pruebas adicionales reportadas por el autor (aritmética in-head, greedy, thinking off, mismo servidor):
- Canary de 6 preguntas del cookbook de la B70: esta cuantización 4/6, la de SergiioB 6/6 (seis preguntas con resultados muy ajustados).
- 100 preguntas sembradas del mismo tipo: esta cuantización 48/100, la de SergiioB 49/100.

Rendimiento de servicio en una Intel Arc Pro B70 a 275 W, una petición a la vez:

| Métrica | Valor |
|---|---|
| Decodificación, prompts cortos | 66-119 tok/s greedy según contenido (35 ms por paso de verificación MTP) |
| Decodificación a 65K / 100K de contexto | ~72 / 65-67 tok/s greedy; 73-77 / 66-69 tok/s con muestreo (43 / 46 ms por paso) |
| Prefill | 2042 tok/s a 5.7K, 1422 tok/s a 74K, 824 tok/s a 237K |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 19,6 GB en disco con pesos int4 más los componentes en BF16. La VRAM exacta no está publicada; a los pesos hay que sumar la caché KV, que en la configuración del autor va en fp8 y soporta 262.144 tokens de contexto.
- GPU recomendada: Intel Arc Pro B70, la única configuración probada por el autor, con vLLM XPU v0.31.0, MTP k=4 y KV en fp8.
- GPUs CUDA: el autor afirma que, al ser formato GPTQ v1 asimétrico estándar, GPTQModel, transformers y vLLM sobre CUDA deberían cargarlo, pero no lo ha probado. En tarjetas de 24 GB como la RTX 4090 los pesos entrarían ajustados y el contexto útil quedaría muy limitado; esta estimación no está verificada por el autor.
- Requisito crítico de software: vLLM XPU v0.31 de serie no carga GPTQ asimétrico correctamente sin el parche `patch_asym_gptq.py` del cookbook.
- Opciones de despliegue: vLLM XPU v0.31.0 con el cookbook `riceharvest/b70-qwen38-cookbook` (probado); GPTQModel, transformers y vLLM sobre CUDA (soportado en teoría, sin probar). No se mencionan GGUF, llama.cpp ni Ollama.
- Latencia y throughput: 35 ms por paso de verificación MTP en prompts cortos, 43 ms a 65K y 46 ms a 100K; prefill de 2042 tok/s a 5.7K y 824 tok/s a 237K, siempre en una B70 a 275 W con una sola petición concurrente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Divergencia KL global | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-GPTQ-Int4-asym (este) | 27,78 B (int4) | 262.144 en la configuración de referencia | 0,039 | apache-2.0 | HuggingFace, 0 descargas |
| GPTQ int4 de SergiioB (sym g128, GPTQModel) | Mismo modelo base, int4 simétrico | No disponible | 0,078 | No disponible | Cookbook de inferencia para Intel Arc |
| Qwen/Qwen3.8-27B (BF16, referencia) | ~27,78 B en BF16 | No disponible | 0 (referencia) | apache-2.0 | HuggingFace |

No se dispone de datos sobre otros modelos comparables de la misma categoría (mismo tamaño o misma tarea) en la información proporcionada.

## Limitaciones y advertencias

- El autor solo ha probado el modelo en Intel XPU; el soporte en CUDA es teórico y no verificado.
- vLLM XPU v0.31 de serie no carga GPTQ asimétrico correctamente sin `patch_asym_gptq.py`; sin el parche los resultados pueden ser incorrectos de forma silenciosa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente por parte de la comunidad.
- Los conjuntos de calibración con muestras de razonamiento y agentes son privados y no se han liberado, lo que dificulta reproducir exactamente la cuantización.
- El modelo base es un checkpoint de fecha 2026 y las capacidades de tool calling, multilingüismo y comportamiento agentic no están documentadas en la información disponible.
- Riesgo de alucinación: inherente a cualquier modelo generativo de este tamaño; no se ha publicado ninguna evaluación de fidelidad factual ni de sesgos.
- El canary de 6 preguntas da 4/6 frente a 6/6 de la cuantización simétrica de referencia, y en las 100 preguntas sembradas queda ligeramente por debajo (48/100 frente a 49/100); las diferencias son pequeñas pero indican que la cuantización no es idéntica al original.
- La licencia apache-2.0 se hereda del modelo base; conviene verificar las condiciones del checkpoint original antes de un uso comercial.
- No hay información sobre idiomas soportados, por lo que no se puede garantizar un rendimiento adecuado fuera del inglés (el material de calibración es íntegramente en inglés).
- La ventana de 262.144 tokens exige una caché KV muy grande incluso en fp8; reducir el contexto efectivo puede ser necesario en hardware con menos memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darioooooo0o/Qwen3.8-27B-GPTQ-Int4-asym
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cookbook de despliegue del autor: https://github.com/riceharvest/b70-qwen38-cookbook
- Cookbook de inferencia en Intel Arc Pro B70 (SergiioB): https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook
