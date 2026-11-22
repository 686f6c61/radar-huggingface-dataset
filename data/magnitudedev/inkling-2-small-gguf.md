# magnitudedev/Inkling-2-Small-GGUF

## Resumen

Inkling-2-Small es un modelo multimodal de tipo image-text-to-text desarrollado por Thinking Machines Lab, publicado originalmente en Hugging Face bajo licencia Apache 2.0. Esta ficha concreta corresponde a la conversión GGUF realizada por `magnitudedev` para su runtime Magnitude, no al checkpoint original. El modelo emplea una arquitectura Mixture-of-Experts (MoE) con aproximadamente 596.780.626.944 parámetros totales según los datos de safetensors del repositorio, lo que lo sitúa en la categoría de modelos de gran escala pese a la etiqueta "Small" del nombre.

La particularidad técnica de esta conversión es que preserva de forma lossless los tensores nativos del checkpoint original: los expertos enrutados en formato NVFP4 (códigos de 4 bits E2M1 con escalas de bloque UE4M3 y una escala de segundo nivel FP32) y las proyecciones densas y de expertos en MXFP8 (códigos E4M3 de 8 bits con escalas UE8M0 por bloque de 32 elementos). Esto implica que el modelo no es compatible con llama.cpp, ya que este runtime no soporta los tensores de escala companion necesarios.

El modelo es relevante para desarrolladores que necesiten desplegar un MoE multimodal de gran tamaño con precisión nativa de pesos cuantizados de bajo bit, evitando la re-cuantización o el ensanchamiento a BF16 que duplicaría el tamaño. El repositorio ocupa 393,5 GB e incluye además un drafter especulativo (DSpark, MTP) y un proyector de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer multimodal; pesos nativos NVFP4 + MXFP8 |
| Parametros totales | 596.780.626.944 (según safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), MXFP8 (proyecciones y expertos de capa 0), BF16 y F32 (embeddings, norms, routers, biases) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (shards de texto + drafter DSpark + mmproj de visión) |

## Arquitectura y entrenamiento

La información disponible confirma que Inkling-2-Small es un modelo MoE multimodal (pipeline image-text-to-text) con un diseño de pesos nativamente cuantizados. Los expertos enrutados se almacenan en NVFP4 con códigos E2M1 de 4 bits, escalas de bloque UE4M3 y una escala de tensor de segundo nivel en FP32. Las proyecciones densas y los expertos de la capa 0 usan MXFP8 con códigos E4M3 de 8 bits y escalas UE8M0 por cada bloque de 32 elementos. Embeddings, normas, routers y biases se mantienen en BF16 y F32 tal como se publicaron. La conversión GGUF se realizó desde la revisión `885d78bfca61a7e9a498e33cfa7ad35850533b8c` del checkpoint original y se verificó byte a byte.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se detalla la innovación arquitectónica más allá del esquema de cuantización nativa. Sí se incluye un drafter especulativo DSpark (Multi-Token Prediction, MTP) de 3,2 GB, lo que sugiere soporte de decodificación especulativa para acelerar la inferencia.

## Capacidades

- Generación de texto y razonamiento conversacional (tag `conversational`).
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`), con un proyector de visión BF16 de 626 MB.
- Decodificación especulativa mediante el drafter DSpark (MTP) incluido en el repositorio.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un MoE multimodal de gran escala con pesos nativos de bajo bit: el runtime Magnitude aplica NVFP4 y MXFP8 tal cual, evitando la re-cuantización y preservando la precisión del checkpoint original, lo que resulta adecuado para pipelines de inferencia que requieren fidelidad de pesos.
- Análisis de documentos con imágenes: al ser image-text-to-text, puede procesar capturas, diagramas o documentos escaneados junto con instrucciones textuales, usando el proyector de visión incluido.
- Asistentes conversacionales multimodales: el tag `conversational` y la compatibilidad con endpoints permiten integrarlo en servicios de chat que reciban imágenes y texto.
- Aceleración de inferencia con decodificación especulativa: el drafter DSpark (MTP) permite reducir la latencia en generación autoregresiva cuando el runtime lo soporta.
- Investigación en cuantización nativa: sirve como referencia para estudiar el comportamiento de MoE con expertos NVFP4 y proyecciones MXFP8 sin pérdida de información respecto al checkpoint.
- Evaluación comparativa de formatos GGUF: útil para medir diferencias entre la conversión lossless de Magnitude y las conversiones de llama.cpp que ensanchan a BF16 o re-cuantizan.
- Prototipado de aplicaciones image-text-to-text en entornos con runtime Magnitude: al estar empaquetado como GGUF con shards y mmproj, se puede cargar directamente en dicho runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio completo ocupa 393,5 GB, con 394 GB en 10 shards de texto más 3,2 GB del drafter y 626 MB del proyector de visión. Dado que los pesos se almacenan de forma lossless en NVFP4/MXFP8, se requiere un sistema con capacidad de memoria agregada en el orden de cientos de GB.
- GPU recomendadas: no disponible en la información proporcionada. Por el volumen de pesos, no cabe en GPUs de consumo individuales; requiere configuraciones multi-GPU o nodos de memoria unificada de gran capacidad.
- ¿Cabe en consumer GPU? No, según el tamaño del repositorio (393,5 GB) y los 596.780.626.944 parámetros.
- Opciones de despliegue: runtime Magnitude (soporte nativo de NVFP4 y MXFP8 con tensores de escala). llama.cpp no es compatible, ya que no soporta los tensores de escala companion y no carga estos ficheros.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización nativa | Licencia | Compatibilidad llama.cpp |
|---|---|---|---|---|---|
| Inkling-2-Small GGUF (magnitudedev) | 596.780.626.944 | no disponible | NVFP4 + MXFP8 lossless | Apache 2.0 | No |
| Inkling-2-Small (checkpoint original) | 596.780.626.944 | no disponible | NVFP4 + MXFP8 | Apache 2.0 | No aplica (formato original) |
| GGUFs de llama.cpp de Inkling-2-Small | 596.780.626.944 | no disponible | BF16 ensanchado o re-cuantizado | Apache 2.0 | Sí |
| Otros MoE multimodales de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Incompatibilidad con llama.cpp: los ficheros no cargan en llama.cpp porque este runtime no soporta los tensores de escala UE8M0 companion; el despliegue queda restringido al runtime Magnitude.
- Tamaño de despliegue muy elevado: 393,5 GB de repositorio y cerca de 597 mil millones de parámetros totales implican requisitos de memoria y almacenamiento considerables.
- Parámetros activos desconocidos: al no disponerse del dato, no es posible estimar el coste computacional real por token de un modelo MoE.
- Contexto e idiomas no documentados: no hay información sobre la ventana de contexto ni sobre los idiomas soportados, lo que limita la planificación de casos de uso multilingües o de contexto largo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.
- Riesgo de alucinación y sesgos: no documentado en la información proporcionada; debe evaluarse empíricamente antes de usar en producción.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del checkpoint base y del runtime Magnitude por separado.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay señales de validación comunitaria que respalden la conversión más allá de la verificación byte a byte declarada por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/magnitudedev/Inkling-2-Small-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Revisión del checkpoint convertido: https://huggingface.co/thinkingmachines/Inkling-2-Small/tree/885d78bfca61a7e9a498e33cfa7ad35850533b8c
- Runtime Magnitude: https://magnitude.dev
