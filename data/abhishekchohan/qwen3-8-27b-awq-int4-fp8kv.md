# abhishekchohan/Qwen3.8-27B-AWQ-INT4-FP8KV

## Resumen

`abhishekchohan/Qwen3.8-27B-AWQ-INT4-FP8KV` es una cuantización AWQ de 4 bits del modelo multimodal denso Qwen3.8-27B de Alibaba, a la que se le ha añadido una caché KV en punto flotante de 8 bits (FP8-E4M3) con escalas calibradas por capa. El resultado es un checkpoint que conserva los pesos exactos del modelo AWQ-INT4 original, pero reduce a la mitad el consumo de memoria de la caché KV, lo que permite servir el contexto nativo completo de 262.144 tokens en una GPU de 48 GB con aproximadamente 14 GB de margen para concurrencia.

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de atención: 16 de sus 64 capas usan atención global (full attention) y las 48 restantes usan atención lineal recurrente (DeltaNet). Esta combinación reduce drásticamente el coste de la caché KV en comparación con un transformer denso clásico. La cuantización AWQ-INT4 (w4a16) con caché FP8 calibrada sobre el propio modelo cuantizado (no sobre el BF16) mantiene el rendimiento dentro del ruido estadístico respecto a la versión con caché BF16, según los benchmarks publicados.

La relevancia de este checkpoint es práctica: permite desplegar un modelo de 27.000 millones de parámetros con ventana de contexto de 262.000 tokens en hardware de gama media-alta (una sola GPU de 48 GB), con soporte nativo en vLLM y licencia Apache-2.0. Es una opción atractiva para tareas de razonamiento largo, agentes autónomos y procesamiento de documentos extensos sin necesidad de infraestructura multi-GPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 16 capas de atención global + 48 capas de atención lineal DeltaNet (64 capas en total) |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo; 524.288 tokens con extensión YaRN (no validada más allá de 262k) |
| Tipos de cuantizacion | AWQ INT4 (w4a16) para pesos; FP8-E4M3 para caché KV con escalas calibradas por capa |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B es multilingüe, pero esta cuantización no especifica la lista) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (con escalas KV FP8 adicionales) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B, desarrollado por Alibaba, usa una arquitectura de atención híbrida: solo 16 de las 64 capas ejecutan atención completa (con intervalo `full_attention_interval: 4`), mientras que las otras 48 usan atención lineal con estado recurrente constante (DeltaNet). Esto reduce el coste de la caché KV de forma significativa: solo las 16 capas globales acumulan KV, lo que explica que el consumo de caché sea de aproximadamente 33 KB por token en FP8 en lugar de los 65 KB que tendría un modelo denso equivalente en BF16.

Esta cuantización no es un entrenamiento desde cero, sino una compresión del modelo AWQ-INT4 ya existente (`abhishekchohan/Qwen3.8-27B-AWQ-INT4`). Los pesos son byte-idénticos a ese checkpoint; la única diferencia es la adición de escalas de cuantización para la caché KV en FP8-E4M3. Las escalas se midieron sobre el propio modelo cuantizado, no sobre el BF16, porque el suavizado activado por activaciones (activation-aware smoothing) y el redondeo INT4 alteran las activaciones K/V que el modelo realmente escribe en caché. La calibración reprodujo las mismas 112 secuencias empaquetadas de 262.144 tokens (~29,4 millones de tokens) del blend Nemotron Post-Training v3 SFT (instrucciones, matemáticas, ciencia, código agéntico y multilingüe) que se usaron para calibrar el AWQ, con el modo de pensamiento activado. Cada escala se calcula como `amax / 448` (el máximo representable en FP8-E4M3), simétrica y por tensor, para evitar recortes.

No se aplicó RLHF ni DPO en este checkpoint; es exclusivamente una cuantización con calibración de caché KV.

## Capacidades

- Generación de texto y razonamiento complejo: el modelo base Qwen3.8-27B está optimizado para tareas de razonamiento, matemáticas y ciencia, y esta cuantización conserva el rendimiento según los benchmarks publicados.
- Soporte de modo de pensamiento (thinking mode): el modelo puede generar cadenas de razonamiento explícitas antes de responder, como se refleja en los protocolos de evaluación (`thinking, generative`).
- Recuperación de contexto largo: mantiene un 9/9 en pruebas needle-in-a-haystack a 32.768, 131.072 y 262.144 tokens con caché FP8, idéntico al modelo con caché BF16.
- Tool calling y function calling: el modelo base Qwen3.8-27B soporta estas capacidades, aunque no se han verificado específicamente en esta cuantización.
- Capacidades agénticas: el modelo base está diseñado para flujos de trabajo agénticos y automatización de oficina, según la documentación de Alibaba. Esta cuantización no documenta pruebas específicas en ese ámbito.
- Multilingüismo: el modelo base es multilingüe, pero no se dispone de la lista de idiomas ni de evaluaciones multilingües para esta cuantización.
- Visión: el modelo base Qwen3.8-27B es multimodal (image-text-to-text), pero esta cuantización no documenta ni valida el procesamiento de imágenes. No se recomienda asumir soporte visual sin pruebas previas.

## Casos de uso

- Asistentes conversacionales con contexto largo: el modelo puede mantener conversaciones de cientos de miles de tokens sin perder el hilo, gracias a su ventana de 262.144 tokens y a la caché FP8 que permite servirlo en una GPU de 48 GB. Es adecuado para chatbots de soporte técnico que necesitan recordar todo el historial de una sesión prolongada.
- Procesamiento de documentos extensos: análisis de libros técnicos, informes anuales, expedientes legales o código fuente de repositorios completos en una sola pasada, sin necesidad de fragmentar el documento ni usar RAG.
- Agentes autónomos con memoria de trabajo amplia: un agente puede mantener en contexto el estado completo de una tarea compleja (plan, pasos ejecutados, resultados intermedios) durante horas de ejecución, reduciendo errores por pérdida de información.
- RAG sobre corpus grandes: aunque el modelo tiene contexto largo, puede combinarse con recuperación para corpus aún mayores; la caché FP8 permite aumentar el tamaño del índice o el número de documentos recuperados sin exceder la VRAM.
- Generación y revisión de código en repositorios grandes: el modelo puede recibir un repositorio completo (o una parte sustancial) como contexto y generar cambios coherentes, refactorizaciones o documentación, gracias a su capacidad de razonamiento y a su entrenamiento en código agéntico.
- Automatización de oficina: el modelo base está optimizado para tareas de productividad (resúmenes, generación de informes, extracción de datos de documentos), y esta cuantización permite desplegarlo en hardware local sin depender de APIs externas.
- Investigación y educación: sirve como modelo de propósito general para experimentación en NLP, con licencia Apache-2.0 que permite uso comercial y modificaciones.

## Benchmarks y rendimiento

La model card publica resultados comparando este checkpoint (con caché FP8) con el modelo AWQ-INT4 base (con caché BF16). Los pesos son byte-idénticos, por lo que cualquier diferencia se atribuye exclusivamente al tipo de caché KV.

| Tarea (n) | Protocolo | AWQ-INT4 (BF16 KV) | Este modelo (FP8 KV) | Δ | Recuperación % |
|---|---|---|---|---|---|
| GSM8K (1319) | thinking, generativo | 95,45 | 95,91 | +0,5 | 100,5 |
| GPQA Diamond (198) | thinking, generativo | 61,62 | 60,61 | −1,0 | 98,4 |
| Minerva Math500 (500) | thinking, generativo, math_verify | 80,0 | 79,00 | −1,0 | 98,8 |
| ARC-Easy (2376) | loglikelihood | 82,37 | 82,45 | +0,1 | 100,1 |
| ARC-Challenge (1172) | loglikelihood | 56,83 | 56,66 | −0,2 | 99,7 |
| HellaSwag (2000) | loglikelihood | 55,85 | 56,05 | +0,2 | 100,4 |
| Winogrande (1267) | loglikelihood | 76,48 | 76,56 | +0,1 | 100,1 |
| TruthfulQA MC1 (817) | loglikelihood | 35,50 | 35,74 | +0,2 | 100,7 |

Todos los deltas están dentro del ruido de muestreo para sus tamaños de muestra. En la prueba de recuperación de contexto largo (needle-in-a-haystack, thinking, greedy, FP8-E4M3), se obtiene un 9/9 en las profundidades 10%, 50% y 90% para contextos de 32.768, 131.072 y 262.144 tokens, idéntico al resultado con caché BF16.

No se han publicado benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con contexto completo de 262.144 tokens: aproximadamente 33,5 GB en total (20 GB de pesos INT4 + 8,5 GB de caché KV FP8 + 5 GB de activaciones y overhead del motor).
- GPU recomendadas: una GPU de 48 GB (por ejemplo, A6000, L40S, RTX 6000 Ada) permite servir el contexto nativo con unos 14 GB de margen para concurrencia. Una GPU de 96 GB (A100, H100, A800) ofrece margen amplio y permite subir `--max-num-seqs` para mayor concurrencia.
- En GPUs de consumo (24 GB o menos) no cabe el contexto completo de 262.144 tokens; sería necesario reducir `--max-model-len` a valores inferiores (no especificados en la documentación).
- Con una GPU de 96 GB, la extensión YaRN a 524.288 tokens cabe con aproximadamente 42 GB de VRAM total, dejando unos 50 GB libres.
- Opciones de despliegue: vLLM es el motor recomendado y el único documentado. Se sirve con `--kv-cache-dtype fp8_e4m3`, que recoge automáticamente las escalas calibradas del checkpoint. También es compatible con el parser de razonamiento `qwen3`.
- Notas de host: en hosts con driver CUDA-12.x, es necesario instalar el wheel `+cu129` de vLLM (los wheels de PyPI son solo cu13 a partir de la versión 0.26) y ejecutar con `--attention-backend TRITON_ATTN` y `VLLM_USE_FLASHINFER_SAMPLER=0`. En hosts con CUDA-13, la instalación estándar funciona sin cambios.
- La decodificación especulativa MTP (Multi-Token Prediction) no es compatible actualmente con la caché FP8 en vLLM (el JIT de flashinfer la rechaza en hosts Blackwell), por lo que las evaluaciones se realizaron sin ella.
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Caché KV | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (original) | 27,8 B | 262.144 | BF16 | BF16 | Apache-2.0 | Hugging Face |
| abhishekchohan/Qwen3.8-27B-AWQ-INT4 | 27,8 B | 262.144 | AWQ INT4 (w4a16) | BF16 | Apache-2.0 | Hugging Face |
| abhishekchohan/Qwen3.8-27B-AWQ-INT4-FP8KV (este modelo) | 27,8 B | 262.144 | AWQ INT4 (w4a16) | FP8-E4M3 calibrada | Apache-2.0 | Hugging Face |

La comparativa directa con el modelo AWQ-INT4 base es la más relevante: los pesos son idénticos y la única diferencia es el tipo de caché KV, lo que permite aislar el impacto de la cuantización FP8. Frente al modelo original en BF16, esta cuantización reduce el uso de memoria de pesos en aproximadamente un 75% (de ~80 GB a ~20 GB) y el de caché KV a la mitad, a costa de una degradación mínima en tareas sensibles (menos de 1 punto porcentual en GPQA y Minerva Math500, dentro del ruido). No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La cuantización FP8 de la caché KV puede introducir degradación en tareas que dependen de precisión numérica fina, aunque los benchmarks publicados muestran deltas dentro del ruido estadístico. Se recomienda validar en el caso de uso concreto antes de producción.
- La decodificación especulativa MTP no funciona con la caché FP8 en vLLM en el momento de la publicación, lo que puede afectar al rendimiento en entornos de baja latencia.
- La recuperación de información más allá de 262.144 tokens (por ejemplo, con YaRN a 524.288) no está validada; la documentación advierte explícitamente que hay que re-verificar en la longitud objetivo antes de confiar en ella.
- No se ha verificado el comportamiento multimodal (visión) en esta cuantización, a pesar de que el modelo base es image-text-to-text. No se recomienda usarla para tareas que requieran entrada de imágenes sin pruebas previas.
- Los idiomas soportados no están documentados en esta cuantización; aunque el modelo base es multilingüe, no hay garantía de que todas las lenguas mantengan el mismo rendimiento tras la cuantización.
- La dependencia de vLLM con versiones específicas según el driver CUDA (cu129 para CUDA-12, cu13 para CUDA-13) puede complicar el despliegue en entornos con versiones antiguas de drivers.
- Al ser un modelo de 27.000 millones de parámetros, puede presentar sesgos y alucinaciones inherentes a su entrenamiento; no se han publicado evaluaciones específicas de sesgos o toxicidad para esta cuantización.
- El autor del checkpoint es un tercero (abhishekchohan), no Alibaba; la calibración de la caché KV se realizó sobre el modelo cuantizado, pero no hay garantía de que el proceso sea reproducible o esté auditado externamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abhishekchohan/Qwen3.8-27B-AWQ-INT4-FP8KV
- Modelo base AWQ-INT4: https://huggingface.co/abhishekchohan/Qwen3.8-27B-AWQ-INT4
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del modelo original: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
