# darrellbest/Qwen3.5-0.8B-Heretic-NVFP4

## Resumen

Qwen3.5-0.8B-Heretic-NVFP4 es una cuantización en NVFP4 del modelo darrellbest/Qwen3.5-0.8B-Heretic, publicado por el usuario darrellbest. El modelo de partida es Qwen/Qwen3.5-0.8B, el miembro más pequeño de la familia Qwen3.5 de Alibaba: un transformer denso multimodal (image-text-to-text) con encoder de visión, capaz de comprensión nativa de imagen y lenguaje a un coste computacional muy bajo. Sobre esa base, la variante Heretic elimina el comportamiento de rechazo mediante Arbitrary-Rank Ablation (ARA), pasando de 98/100 rechazos en el modelo original a 15/100, con una divergencia KL de 0,0714 respecto al original.

Esta versión concreta cuantiza a NVFP4 las capas lineales del MLP y las proyecciones de atención de las capas de atención completa, manteniendo en bf16 el resto de componentes (encoder de visión, capas Gated DeltaNet, bloque de predicción multi-token, embeddings y normas). El resultado reduce el peso de 1,78 GB a 1,33 GB y está pensado específicamente para vLLM sobre hardware NVIDIA Blackwell, que ejecuta NVFP4 de forma nativa.

Es relevante ahora por dos motivos. Primero, demuestra un flujo de cuantización selectiva (no todo el modelo se cuantiza) para modelos híbridos con capas de atención lineal, donde el estado recurrente es sensible a baja precisión. Segundo, ofrece un modelo multimodal de 873,4 millones de parámetros con throughput medido de ~380 tok/s en un solo flujo y ~6.400 tok/s agregados en batch 32 sobre una RTX PRO 6000 Blackwell, lo que lo sitúa como una opción de inferencia de alto rendimiento y bajo coste. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal híbrido: capas de atención completa + capas Gated DeltaNet (atención lineal), encoder de visión y bloque de predicción multi-token (MTP) |
| Parámetros totales | 873.438.784 (873,4 M), dato de safetensors |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 con grupos de 16 valores y escalas FP8 en capas lineales del MLP y proyecciones de atención de las capas de atención completa; resto en bf16; parámetros `A_log` y normas de DeltaNet en float32. La familia incluye además FP8 W8A8 y GGUF (BF16, Q8_0, Q4_K_M) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (NVFP4); pesos del bloque MTP en `model-auxiliary.safetensors` |
| Tamaño del repositorio | 1,3 GB (pesos cuantizados: 1,33 GB frente a 1,78 GB en bf16) |
| Pipeline declarado | image-text-to-text |
| Modelo base | darrellbest/Qwen3.5-0.8B-Heretic (relación: quantized) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso multimodal de la familia Qwen3.5. Combina dos tipos de capas: atención completa clásica y capas Gated DeltaNet (`linear_attn`), un mecanismo de atención lineal con estado recurrente. Incluye un encoder de visión que habilita la comprensión nativa de imágenes, un bloque de predicción multi-token (MTP) y una tabla de embeddings de 248.000 tokens ligada a `lm_head` (pesos atados). No se dispone de información sobre el número de tokens de preentrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO: no disponible.

La innovación técnica de este repositorio es la cuantización selectiva. Solo se cuantizan a NVFP4 las capas lineales del MLP y las proyecciones de atención de las capas de atención completa; el encoder de visión, las capas Gated DeltaNet, el bloque MTP, los embeddings y las normas permanecen en bf16 (con los parámetros `A_log` y las normas de DeltaNet en float32). El autor justifica esta decisión indicando que el estado recurrente de DeltaNet es sensible a baja precisión y que la tabla de embeddings de 248.000 tokens representa una porción grande de un modelo de este tamaño. La cuantización se realizó con llm-compressor 0.13.0 (`scheme="NVFP4"`), calibrada sobre 64 prompts de chat inofensivos; los pesos del bloque de predicción multi-token, que el guardado cuantizado descarta, se copiaron sin cambios a `model-auxiliary.safetensors`.

El componente Heretic se aplicó antes de la cuantización, sobre el modelo bf16, mediante Arbitrary-Rank Ablation (ARA) a peso completo usando la herramienta Heretic. Los pesos NVFP4 no se volvieron a medir para la tasa de rechazos, por lo que la cifra de 15/100 rechazos corresponde a la variante bf16, no a esta.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla propia de la familia Qwen3.5.
- Comprensión de imagen y texto (pipeline image-text-to-text): el encoder de visión se mantiene en bf16, por lo que la capacidad multimodal se preserva tras la cuantización. El autor verificó la descripción correcta de una imagen de prueba (un círculo rojo y un cuadrado azul).
- Modo de razonamiento thinking: verificado con 4 problemas aritméticos y de palabras repetidos en 10 semillas cada uno.
- Generación de código y matemáticas: no confirmado explícitamente en la información disponible, aunque se deriva de la familia Qwen3.5; no hay mediciones publicadas para esta build.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están declarados en la model card).
- Capacidad especial destacable: bloque de predicción multi-token (MTP) presente en la arquitectura, conservado en `model-auxiliary.safetensors`.
- Comportamiento de rechazo reducido por diseño: 15/100 rechazos en la variante bf16 Heretic frente a 98/100 del modelo original.

## Casos de uso

- Procesamiento de documentos con imágenes: el modelo acepta pares imagen-texto y puede describir o interpretar capturas, diagramas o facturas; al mantener el encoder de visión en bf16, la ruta visual no sufre la pérdida de precisión de la cuantización NVFP4.
- Descripción automática de imágenes a bajo coste: con 873,4 M de parámetros y 1,33 GB de pesos, se puede desplegar un servicio de altas prestaciones para etiquetado o alt-text sin ocupar una GPU de gama alta completa.
- Generación de texto masiva en batch: el rendimiento medido de ~6.400 tok/s agregados con batch 32 y generaciones de 512 tokens lo hace adecuado para tareas de reescritura, resumen o aumento de datos a gran escala donde la latencia por petición no es crítica.
- Servicio de chat interactivo de baja latencia: los ~380 tok/s en un solo flujo permiten respuestas fluidas para asistentes conversacionales sencillos en hardware Blackwell de gama consumer o profesional.
- Prototipado y validación de pipelines multimodales con vLLM: al ser desplegable con `vllm serve darrellbest/Qwen3.5-0.8B-Heretic-NVFP4`, sirve para validar una arquitectura de servicio antes de escalar a modelos Qwen3.5 mayores con la misma interfaz.
- Investigación sobre cuantización de modelos híbridos: el repositorio permite comparar, sobre el mismo modelo base, bf16 frente a FP8 W8A8 y NVFP4, y estudiar el impacto de cuantizar solo el MLP y las proyecciones de atención completa mientras se preserva el estado recurrente de DeltaNet.
- Investigación sobre alineación y comportamiento de rechazo: junto con las variantes bf16 y FP8 de la misma familia, permite estudiar el efecto de Arbitrary-Rank Ablation y de la cuantización sobre la tasa de rechazos y sobre la divergencia KL respecto al modelo original. Requiere revisión ética y uso responsable por tratarse de un modelo con salvaguardas reducidas por diseño.
- Educación y demos locales de visión-lenguaje: con 1,33 GB de pesos y soporte en vLLM sobre Blackwell, es viable levantar una demo multimodal en una única GPU sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta mediciones internas de verificación y throughput. Se recogen tal cual:

| Medición | NVFP4 (este modelo) | Heretic bf16 | Qwen3.5-0.8B original |
|---|---|---|---|
| Razonamiento en modo thinking (4 problemas aritméticos y de palabras x 10 semillas), correctos y terminados | 24/40 | 27/40 | 26/40 |
| Tasa de rechazo | no remedida tras la cuantización | 15/100 | 98/100 |
| Divergencia KL respecto al original | no disponible | 0,0714 | no aplica |
| Prueba cualitativa de visión | descripción correcta de un círculo rojo y un cuadrado azul | no disponible | no disponible |
| Throughput en un solo flujo | ~380 tok/s | no disponible | no disponible |
| Throughput agregado en batch 32 (generaciones de 512 tokens) | ~6.400 tok/s | no disponible | no disponible |

Medido en vLLM 0.30.0 sobre una RTX PRO 6000 Blackwell. El descenso de 27/40 a 24/40 en la prueba de razonamiento es la única señal cuantitativa disponible sobre el impacto de la cuantización, y corresponde a una muestra muy pequeña.

## Requisitos de hardware

- Peso de los pesos: 1,33 GB en NVFP4, frente a 1,78 GB del modelo bf16 y 1,47 GB de la variante FP8.
- VRAM estimada para inferencia: los pesos ocupan 1,33 GB; sumando caché KV, estado recurrente de DeltaNet, buffers de activaciones y overhead del runtime, se puede estimar un consumo en el rango de 2 a 4 GB, aunque no hay una medición oficial publicada (estimación, no dato confirmado).
- GPU compatibles: NVFP4 se ejecuta de forma nativa en NVIDIA Blackwell, es decir, RTX PRO 6000 Blackwell (la GPU usada en la verificación), B100, B200, GB200 y GeForce RTX 50. En arquitecturas anteriores (Ampere, Ada, Hopper) esta build no es la opción adecuada; conviene usar las variantes FP8, GGUF o bf16 de la misma familia.
- Cabe en GPU consumer: sí, en GPUs consumer Blackwell con 8 GB o más de VRAM, siempre que se use un backend que soporte NVFP4.
- Opciones de despliegue: vLLM 0.30.0 (verificado) en Blackwell. El resto de la familia se despliega con transformers y SGLang (bf16), vLLM (FP8) y llama.cpp u Ollama (GGUF BF16, Q8_0, Q4_K_M con mmproj de visión).
- Throughput medido: ~380 tok/s en un solo flujo y ~6.400 tok/s agregados con batch 32 y generaciones de 512 tokens, en una RTX PRO 6000 Blackwell.
- Latencia por petición: no disponible. Tiempo hasta el primer token: no disponible.

## Comparativa con modelos similares

La comparación más directa es con las otras builds del mismo modelo base dentro de la familia Heretic, y con el Qwen3.5-0.8B original. No hay datos de benchmarks comparativos con otras familias de tamaño similar en la información disponible.

| Modelo | Formato | Tamaño | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Heretic-NVFP4 (este) | NVFP4, compressed-tensors | 1,33 GB | no disponible | Apache 2.0 | vLLM en Blackwell |
| Qwen3.5-0.8B-Heretic | bf16 safetensors | 1,78 GB | no disponible | Apache 2.0 | transformers, vLLM, SGLang |
| Qwen3.5-0.8B-Heretic-FP8 | FP8 W8A8, compressed-tensors | 1,47 GB | no disponible | Apache 2.0 | vLLM |
| Qwen3.5-0.8B-Heretic-GGUF | GGUF BF16 / Q8_0 / Q4_K_M + mmproj de visión | 1,56 / 0,83 / 0,54 GB + 0,20 GB | no disponible | Apache 2.0 | llama.cpp, Ollama |
| Qwen/Qwen3.5-0.8B | bf16 | no disponible | no disponible | Apache 2.0 | transformers, vLLM |

Diferencias clave dentro de la familia: NVFP4 es la build más pequeña (1,33 GB) y la de mayor throughput medido, pero solo es utilizable en Blackwell y no se volvió a medir su tasa de rechazos tras la cuantización. FP8 ofrece 1,47 GB en un rango de hardware más amplio con vLLM. GGUF es la única opción para llama.cpp y Ollama, y la más ligera en Q4_K_M (0,54 GB más 0,20 GB del proyector de visión). bf16 es la referencia de mayor fidelidad numérica y la que conserva las mediciones originales de ablación.

Comparación con alternativas de otras familias del mismo orden de tamaño (por ejemplo, modelos densos multimodales de menos de 1.000 millones de parámetros): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Salvaguardas reducidas por diseño: es un modelo abliterated/uncensored. El autor advierte explícitamente de que la responsabilidad del uso recae en quien lo despliega. No es apto para aplicaciones orientadas al público sin capas adicionales de moderación.
- La tasa de rechazo de 15/100 corresponde a la variante bf16 Heretic, no a esta build NVFP4. Los pesos NVFP4 no se volvieron a evaluar para rechazos, por lo que el comportamiento real de seguridad de esta cuantización es desconocido.
- Sesgos conocidos: no disponible. No hay evaluación de sesgos publicada para este modelo ni para su base.
- Riesgo de alucinación: con 873,4 M de parámetros, la capacidad de razonamiento y de retención factual es limitada; el modo thinking puede no terminar correctamente (24/40 en la prueba interna). Es esperable una tasa de alucinación alta en tareas de conocimiento abierto, aunque no hay una medición formal.
- Degradación por cuantización: la prueba interna de razonamiento cae de 27/40 (bf16) a 24/40 (NVFP4). La muestra es pequeña (40 ejecuciones) y no permite extraer conclusiones firmes, pero apunta a una pérdida de calidad no despreciable.
- Calibración limitada: la cuantización se calibró sobre 64 prompts de chat inofensivos, lo que puede sesgar las escalas de cuantización hacia ese tipo de entrada y penalizar otros dominios (código, multimodal estricto, contextos largos).
- Restricción de hardware: NVFP4 solo se ejecuta de forma nativa en Blackwell. En GPUs anteriores hay que recurrir a otras builds de la familia, con lo que se pierden las ventajas de tamaño y throughput de esta versión.
- Longitud de contexto e idiomas soportados: no disponibles en la información proporcionada, lo que impide garantizar su comportamiento en contextos largos o en idiomas distintos del inglés.
- Tool calling y uso agéntico: no confirmados en la información disponible. No conviene asumir su funcionamiento en producción sin verificarlo.
- Licencia: Apache 2.0, con enlace a la licencia del modelo original de Qwen. Permite uso comercial, pero conviene revisar los términos de la licencia de Qwen/Qwen3.5-0.8B para confirmar condiciones adicionales.
- Madurez del repositorio: 0 descargas y 0 likes, creado y actualizado el mismo día (25 de septiembre de 2026). Es un artefacto reciente sin validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darrellbest/Qwen3.5-0.8B-Heretic-NVFP4
- Modelo base (bf16 Heretic): https://huggingface.co/darrellbest/Qwen3.5-0.8B-Heretic
- Variante FP8: https://huggingface.co/darrellbest/Qwen3.5-0.8B-Heretic-FP8
- Variante GGUF: https://huggingface.co/darrellbest/Qwen3.5-0.8B-Heretic-GGUF
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- llm-compressor (cuantización): https://github.com/vllm-project/llm-compressor
- Guía de modelos Qwen 3.5 locales, con requisitos de VRAM por tamaño: https://insiderllm.com/guides/qwen-3-5-local-guide/
- Guía de modelos Qwen para ejecución local: https://insiderllm.com/guides/qwen-models-guide/
- Leaderboard de modelos autoalojados: https://onyx.app/self-hosted-llm-leaderboard
- Réplica GGUF de la comunidad con notas sobre Qwen3.5-0.8B como transformer multimodal denso: https://huggingface.co/FadedRedStar/Qwen3.5-0.8B-heretic-GGUF/blob/main/README.md
- Otra build de la comunidad: https://huggingface.co/schnow265/Qwen_Qwen3.5-0.8B-heretic
