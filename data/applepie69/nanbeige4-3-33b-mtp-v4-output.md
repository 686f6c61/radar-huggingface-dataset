# applepie69/Nanbeige4.3-33B-MTP-v4-output

## Resumen

Nanbeige4.3-33B-MTP-v4-output es un adaptador experimental publicado por el usuario applepie69 que implementa una cabeza de predicción multi-token (MTP, multi-token prediction) para el modelo base Nanbeige/Nanbeige4.3-33B. No se trata de un modelo completo, sino de un conjunto de pesos de 694 millones de parámetros (en bf16, aproximadamente 1,29 GB) que se acopla al modelo base para predecir el token posterior al siguiente, con el objetivo de habilitar decodificación especulativa y generar varios tokens por pasada del modelo grande.

El adaptador sigue el diseño de las cabezas MTP de DeepSeek-V3 con profundidad 1: recibe el estado oculto final del modelo base en la posición t y el embedding del token t+1, los proyecta mediante una capa adicional tipo LlamaDecoderLayer y comparte la matriz de embeddings y la LM head del modelo base para producir logits sobre el token t+2. Fue entrenado por autodestilación con el modelo base congelado, sobre mezclas de datos de chat, razonamiento matemático y código.

Su relevancia es doble: por un lado demuestra una receta reproducible para añadir MTP a arquitecturas Llama que no lo traen de serie; por otro, el propio autor advierte de que es un artefacto experimental sin soporte en ningún motor de inferencia (ni llama.cpp, ni vLLM, ni SGLang) y sin medición de velocidad extremo a extremo. El acuerdo top-1 con el modelo base es del 50,1% sobre texto retenido, un dato que se sitúa justo en el umbral habitualmente considerado mínimo para que la decodificación especulativa compense.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP estilo DeepSeek-V3 (profundidad 1) sobre Llama; una capa decoder adicional con atención y MLP propios, más proyecciones enorm/hnorm/eh_proj |
| Parametros totales | 694 M (solo la cabeza; no incluye embeddings ni LM head, que se comparten con el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenada con filas de 1024 tokens; comportamiento en contextos largos sin probar) |
| Tipos de cuantizacion | Pesos en bf16; el modelo base asociado se usó en 4-bit NF4 durante la extracción de características |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (la misma que el modelo base) |
| Formato de pesos | safetensors (mtp_head.safetensors, bf16) |

## Arquitectura y entrenamiento

La cabeza implementa una predicción multi-token de profundidad 1. Para cada posición t toma el estado oculto final del modelo base tras `model.norm` (h_t, de dimensión 7168) y el embedding del token x_{t+1}; concatena ambas representaciones normalizadas, las proyecta con `eh_proj` de 2×7168 a 7168, aplica una LlamaDecoderLayer adicional con atención y MLP propios, normaliza con `shared_head.norm` y genera logits a través de la LM head congelada del modelo base para predecir x_{t+2}. Los nombres de tensor siguen la convención DeepSeek/GLM de capa extra tras el último bloque (`model.layers.52.*`). La cabeza se inicializó a partir de una copia de la última capa decoder del modelo base.

El entrenamiento se realizó por autodestilación con el modelo base congelado: la cabeza se ajusta para igualar la distribución de salida del propio modelo base sobre x_{t+2} mediante divergencia KL a través de la LM head compartida. Los datos son chat, razonamiento matemático y código formateados con la plantilla del modelo base y empaquetados en filas de 1024 tokens: HuggingFaceH4/ultrachat_200k (split train_sft, ~40% de los tokens), open-r1/OpenR1-Math-220k (split train, ~40%) y bigcode/self-oss-instruct-sc2-exec-filter-50k (split train, ~20%). Se usaron 600.064 tokens de estados ocultos almacenados, 2 épocas, batch de 1 fila, learning rate pico de 0,0002 con schedule coseno y AdamW de 8 bits con autocast fp16. Las características se extrajeron del modelo base cuantizado en 4-bit NF4 sobre 2× Tesla T4, por lo que la cabeza se ajusta mejor a esa configuración; con pesos bf16 o 8-bit se espera un acuerdo algo menor.

## Capacidades

- Predicción del token posterior al siguiente (x_{t+2}) a partir del estado oculto y del embedding del token siguiente, para su uso como borrador en decodificación especulativa.
- Integración con la matriz de embeddings y la LM head del modelo base Nanbeige4.3-33B (no almacena copias propias).
- Diseñada para decodificación especulativa con verificación por parte del modelo base en modo greedy.
- Profundidad 1: solo redacta un token por delante; el encadenamiento de borradores más profundos no está probado.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües por sí misma: es un componente auxiliar, no un modelo de chat.
- Incluye una implementación de referencia independiente (`mtp_head.py` con `MTPHead` y `load_mtp_head`) y archivos parcheados en `for_merging/` para incorporar la capa MTP al checkpoint base local.

## Casos de uso

- Investigación en decodificación especulativa: sirve como material de partida para portar el grafo MTP a arquitecturas Llama en motores como llama.cpp (`--spec-type draft-mtp`), vLLM o SGLang, que actualmente no lo soportan para esta arquitectura.
- Prototipado de cabezas MTP en otros modelos: la receta de autodestilización con modelo base congelado y la implementación de referencia son reutilizables para añadir MTP a checkpoints Llama propios.
- Experimentos de aceptación de borradores: permite medir empíricamente la tasa de aceptación de una cabeza MTP sobre las generaciones reales del modelo base, un dato que el autor no ha publicado.
- Evaluación de compromiso velocidad/calidad: una vez integrada en un runtime, permitiría comparar la salida de decodificación especulativa con la decodificación normal del modelo base para verificar que la verificación greedy preserva la calidad.
- Estudio de cuantización e inferencia mixta: al haberse entrenado sobre características de un base en 4-bit NF4, es un caso práctico para analizar cómo afecta el nivel de cuantización del modelo base al acuerdo de la cabeza.
- Docencia y formación técnica: el repositorio documenta con detalle la arquitectura, la fórmula de la cabeza y el pipeline de entrenamiento, lo que lo hace útil como ejemplo didáctico de MTP y decodificación especulativa.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de acuerdo de la cabeza con el modelo base sobre texto retenido del mismo tipo que el de entrenamiento, evaluadas con teacher forcing sobre texto del dataset (no sobre generaciones del modelo):

| Metrica | Valor | Significado |
|---|---|---|
| Acuerdo top-1 | 50,1% | Posiciones en que la mejor predicción de la cabeza para t+2 coincide con la del modelo base |
| Top-3 contiene top-1 | 69,8% | Posiciones en que el mejor token del base está entre los tres mejores de la cabeza |
| Divergencia KL | 1,782 | Distancia media (nats) entre distribuciones; menor es mejor |
| Posiciones evaluadas | 10.230 | |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) ni mediciones de velocidad extremo a extremo en la información disponible. El autor señala que la regla habitual exige en torno al 50% de aceptación para que el borrador compense, y que este resultado está en ese umbral, pero que la aceleración real está por medir.

## Requisitos de hardware

- VRAM de la cabeza: aproximadamente 1,29 GB en bf16, adicionales a la memoria requerida por el modelo base Nanbeige4.3-33B.
- VRAM del conjunto: dominada por el modelo base de 33B; en 4-bit NF4 se sitúa en el entorno de 18-20 GB, en 8-bit en torno a 35 GB y en bf16 por encima de 66 GB (estimaciones a partir del tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: el autor extrajo características sobre 2× Tesla T4; para servir el modelo base completo se recomiendan A100 80 GB, H100 o múltiples RTX 4090/A6000 según cuantización.
- Cabe en GPU de consumo: la cabeza por sí sola sí; el modelo base de 33B requiere cuantización agresiva (4-bit) para caber en una RTX 4090 de 24 GB, y en ese caso la cabeza se ajusta mejor porque fue entrenada sobre características 4-bit.
- Opciones de despliegue: ninguna disponible de forma nativa; llama.cpp, vLLM y SGLang necesitarían una clase de modelo con grafo MTP para esta arquitectura. El repositorio ofrece `mtp_head.py` como implementación de referencia para portar.
- Latencia y throughput: no disponibles; no se ha medido ninguna aceleración.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Acuerdo/rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nanbeige4.3-33B-MTP-v4-output | Cabeza MTP (adaptador) | 694 M (cabeza) | no disponible | 50,1% top-1 sobre base | Apache 2.0 | HuggingFace, experimental |
| DeepSeek-V3 (MTP nativo) | Modelo MoE con cabezas MTP integradas | 671 B totales / 37 B activos | 128 K (según documentación pública) | MTP integrado en entrenamiento y runtime | Licencia propia de DeepSeek | Pesos públicos con soporte en motores |
| Cabezas MTP de GLM-4.5 | Modelo con MTP nativo | no disponible en esta ficha | no disponible | MTP integrado | no disponible | Pesos públicos |
| EAGLE / EAGLE-2 (borradores especulativos) | Cabezas de borrador entrenadas por destilación | Variables (típicamente cientos de M) | Depende del base | Tasas de aceptación publicadas en papers | Varía | Implementaciones en vLLM/SGLang |

La comparación directa con DeepSeek-V3 o GLM-4.5 no es equivalente: en esos casos el MTP forma parte del entrenamiento y del runtime del propio modelo, mientras que aquí es un añadido externo sin soporte de motor. Frente a EAGLE, la diferencia principal es la ausencia de integración en runtimes y de benchmarks de velocidad publicados.

## Limitaciones y advertencias

- Artefacto experimental: no es un modelo autónomo ni un GGUF; requiere el checkpoint Nanbeige/Nanbeige4.3-33B y comparte su matriz de embeddings y LM head.
- Sin soporte en motores de inferencia: llama.cpp implementa MTP por arquitectura y la arquitectura Llama simple de Nanbeige no tiene grafo MTP; vLLM y SGLang necesitarían una clase de modelo equivalente.
- Sin benchmark de velocidad ni de calidad extremo a extremo: no se ha verificado que la salida de la decodificación especulativa coincida con la decodificación normal, aunque en teoría la verificación greedy debería garantizarlo.
- Entrenamiento en contexto corto: las filas de entrenamiento eran de 1024 tokens como máximo, por lo que el comportamiento en contextos largos no está probado.
- Profundidad 1: solo redacta un token por delante; el encadenamiento de borradores más profundos no se ha probado.
- Sensibilidad a la cuantización: las características se extrajeron del base en 4-bit NF4, por lo que con pesos bf16 o 8-bit el acuerdo esperado es menor.
- Sin datos de idiomas soportados ni de sesgos; al ser una cabeza auxiliar, los sesgos y el riesgo de alucinación provienen del modelo base y deben evaluarse sobre él.
- Licencia Apache 2.0 heredada del modelo base, pero el autor recomienda revisar los términos del modelo base antes de cualquier uso.
- Cero descargas y cero likes en el momento de la ficha: no hay validación comunitaria ni reportes de terceros.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/applepie69/Nanbeige4.3-33B-MTP-v4-output
- Modelo base Nanbeige4.3-33B: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Dataset HuggingFaceH4/ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset open-r1/OpenR1-Math-220k: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset bigcode/self-oss-instruct-sc2-exec-filter-50k: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
- Paper de DeepSeek-V3 (diseño MTP de referencia): https://arxiv.org/abs/2412.19437
- Repositorio llama.cpp (soporte MTP por arquitectura): https://github.com/ggml-org/llama.cpp
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Repositorio SGLang: https://github.com/sgl-project/sglang
