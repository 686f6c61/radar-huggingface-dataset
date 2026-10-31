# applepie69/Nanbeige4.3-33B-MTP-head

## Resumen

Nanbeige4.3-33B-MTP-head es un repositorio experimental publicado por el usuario applepie69 en HuggingFace que no contiene un modelo de lenguaje completo, sino una **cabeza de predicción multi-token (MTP, multi-token prediction)** entrenada para el modelo base [Nanbeige/Nanbeige4.3-33B](https://huggingface.co/Nanbeige/Nanbeige4.3-33B). Su propósito es servir de *draft model* interno para decodificación especulativa: dado el estado oculto del modelo base en la posición *t* y el embedding del token *t+1*, la cabeza predice el token *t+2*, lo que permitiría a un motor de inferencia generar varios tokens por cada pasada del modelo grande.

El modelo base Nanbeige4.3-33B no incorpora pesos MTP nativos, de modo que esta cabeza se entrenó por auto-distilación a partir del propio modelo congelado, siguiendo el estilo de DeepSeek-V3 (una capa decodificadora adicional de profundidad 1 que comparte la matriz de embeddings y el LM head del base). La cabeza añade 694 millones de parámetros en bf16 (unos 1,29 GB) y se publica en safetensors junto a una implementación de referencia en Python.

Es importante subrayar el estado del proyecto: la propia model card lo declara **experimental y no terminado**. No se ha medido ninguna aceleración real, ningún motor de inferencia (llama.cpp, vLLM, SGLang) puede utilizarlo todavía y las métricas de acuerdo con el modelo base (0,9 % de top-1) están muy por debajo del umbral habitual (~50 %) para que la decodificación especulativa sea rentable. Su interés actual es principalmente de investigación y de referencia para quien quiera portar el enfoque a otros runtimes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP estilo DeepSeek-V3 (1 capa LlamaDecoderLayer adicional con enorm/hnorm/eh_proj) sobre arquitectura Llama |
| Parametros totales | 694 M (solo la cabeza; el modelo base Nanbeige4.3-33B tiene 33 B) |
| Parametros activos | 694 M (no es MoE) |
| Longitud de contexto | no disponible (entrenada con filas de 1024 tokens; contexto mayor sin probar) |
| Tipos de cuantizacion | bf16 (la cabeza); la cabeza se entrenó sobre el base cuantizado a 4 bits NF4 |
| Idiomas soportados | no disponible (datos de entrenamiento en inglés: chat, matemáticas y codigo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, ~1,29 GB; embeddings y LM head no incluidos) |

## Arquitectura y entrenamiento

La cabeza sigue el patrón de MTP de DeepSeek-V3 con profundidad 1: toma el estado oculto final del modelo base en la posición *t* (tras `model.norm`, dimensión 7168) y el embedding del token *t+1*, los normaliza con `enorm` y `hnorm`, los concatena y los proyecta mediante `eh_proj` (de 2×7168 a 7168). El resultado pasa por una capa decodificadora Llama completa (atención + MLP con sus propios layernorms) y, tras un `shared_head.norm`, se proyecta con el LM head del modelo base para predecir el token *t+2*. Los tensores usan la convención de DeepSeek/GLM de una capa extra `model.layers.52.*` después del último bloque del base.

El entrenamiento se realizó por auto-distilación con el modelo base congelado: para cada posición, la cabeza minimiza la divergencia KL entre su distribución y la del propio base para el token *t+2*, pasando por el LM head compartido. Se inicializó desde una copia de la última capa decodificadora del base. Los datos (600.064 tokens de estados ocultos almacenados, 576 filas de 1024 tokens de entrenamiento y 10 de validación) proceden de `HuggingFaceH4/ultrachat_200k` (~40 %), `open-r1/OpenR1-Math-220k` (~40 %) y `bigcode/self-oss-instruct-sc2-exec-filter-50k` (~20 %), formateados con la plantilla de chat del base. Se entrenaron 2 épocas con batch de 2 filas, learning rate pico de 0,0002 con schedule coseno y AdamW de 8 bits con autocast fp16. Un detalle relevante: las características se extrajeron del base cuantizado a 4 bits (NF4) en 2× Tesla T4, por lo que la cabeza encaja mejor con el modelo cuantizado a 4 bits; con pesos bf16 u 8 bits se espera un acuerdo algo menor.

## Capacidades

No es un modelo generativo autónomo, por lo que sus capacidades son las de un componente de aceleración:

- Predicción del token *t+2* a partir del estado oculto del base y del embedding de *t+1*, para usar como borrador en decodificación especulativa.
- Comparte embeddings y LM head con Nanbeige4.3-33B, por lo que no duplica la matriz de vocabulario.
- Incluye una implementación de referencia autónoma (`mtp_head.py` con `MTPHead` y `load_mtp_head`) para integración o portado a otros runtimes.
- Archivos de configuración parcheados (`for_merging/`) para fusionar la capa MTP en un checkpoint local del base.
- No soporta por sí mismo generación de texto, tool calling, agentes, visión ni audio; esas capacidades dependen del modelo base Nanbeige4.3-33B.

## Casos de uso

Los casos de uso son limitados por el estado experimental del componente:

- **Investigación en decodificación especulativa tipo MTP**: el repositorio ofrece pesos reales y una implementación de referencia clara para estudiar cómo se entrena y se integra una cabeza MTP sobre una arquitectura Llama sin soporte nativo.
- **Portado de MTP a motores de inferencia**: un desarrollador de llama.cpp, vLLM o SGLang puede partir de `mtp_head.py` y de la convención de tensores DeepSeek/GLM para implementar el grafo de MTP para arquitecturas Llama planas.
- **Aceleración experimental de Nanbeige4.3-33B en local**: quien ya ejecute el base cuantizado a 4 bits podría, una vez exista soporte en el runtime, usar la cabeza para intentar generar varios tokens por pasada (actualmente sin aceleración demostrada).
- **Material didáctico sobre auto-distilación**: la model card documenta con detalle el método de entrenamiento (KL contra el propio base congelado, inicialización desde la última capa), útil como receta replicable.
- **Benchmark de acuerdo draft/target**: las métricas publicadas (top-1, top-3, KL) sirven de punto de comparación para evaluar otras cabezas MTP entrenadas de forma similar.
- **Experimentos con fusión de capas extra**: los ficheros de `for_merging/` permiten probar cómo integrar una capa adicional post-entrenada en un checkpoint existente sin re-entrenar el modelo completo.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre texto reservado (mismo tipo de datos que el entrenamiento, teacher-forced, 10.220 posiciones evaluadas):

| Metrica | Valor |
|---|---|
| Acuerdo top-1 | 0,9 % |
| Top-3 contiene el top-1 del base | 1,9 % |
| Divergencia KL | nan |
| Posiciones evaluadas | 10.220 |

No se han publicado benchmarks de aceleración end-to-end ni de calidad de generación. La propia model card advierte que la decodificación especulativa suele necesitar ~50 % de aceptación para ser rentable y que el 0,9 % medido está muy por debajo, por lo que una aceleración real es improbable sin más entrenamiento. El valor `nan` en la divergencia KL es un indicador de un posible problema en el entrenamiento o la evaluación.

## Requisitos de hardware

- **La cabeza por sí sola**: 694 M de parámetros en bf16, unos 1,29 GB de VRAM o RAM, más el espacio para los estados ocultos intermedios.
- **Conjunto completo (base + cabeza)**: requiere ejecutar Nanbeige4.3-33B. En 4 bits (NF4), el base ocupa del orden de 18-20 GB de VRAM, más la cabeza y la caché KV; el autor lo ejecutó en 2× Tesla T4 (16 GB cada una).
- **GPU recomendadas**: para el base en 4 bits, una RTX 4090 (24 GB) o A100 de 40 GB es suficiente; en bf16 u 8 bits se necesitarían A100 80 GB o H100. No hay datos de rendimiento publicados.
- **Consumer GPUs**: viable en una RTX 3090/4090 con el base cuantizado a 4 bits, siempre que el framework soporte la carga de la capa MTP adicional.
- **Despliegue**: no hay soporte en ningún runtime todavía. La carga se hace con la implementación de referencia `mtp_head.py` sobre `transformers` (PyTorch). llama.cpp, vLLM, SGLang, TGI y Ollama no pueden usar esta cabeza en su estado actual, y no existe GGUF.
- **Latencia y throughput**: no disponibles; no se ha medido ninguna aceleración.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Licencia | Estado |
|---|---|---|---|---|
| Nanbeige4.3-33B-MTP-head | Cabeza MTP (draft) para Nanbeige4.3-33B | 694 M | Apache 2.0 | Experimental, sin soporte de runtime, sin aceleración medida |
| Cabezas MTP de DeepSeek-V3 (integradas en el modelo) | MTP nativo de profundidad 1 | incluidas en el checkpoint oficial | DeepSeek (uso comercial permitido con condiciones) | Soportadas de forma nativa en vLLM/SGLang, con aceleración demostrada |
| Draft models clasicos (p. ej. EAGLE-2 sobre modelos Llama) | Cabezas/borradores externos para decodificacion especulativa | ~0,2-1 M a varios cientos de M | Varia por repositorio | Maduros, con aceleraciones de 2-3x publicadas y soporte en vLLM/SGLang |

La diferencia clave es que las cabezas MTP de DeepSeek-V3 y los draft models tipo EAGLE se publican con soporte de motor y métricas de aceleración verificadas, mientras que este repositorio aporta solo los pesos y una implementación de referencia.

## Limitaciones y advertencias

- **No es un modelo standalone**: requiere el checkpoint completo de Nanbeige4.3-33B; no funciona por sí solo ni existe en formato GGUF.
- **Sin soporte de inferencia**: ningún motor (llama.cpp, vLLM, SGLang) implementa el grafo MTP para la arquitectura Llama plana de Nanbeige; solo hay una implementación de referencia en PyTorch.
- **Rendimiento insuficiente**: el acuerdo top-1 del 0,9 % está muy por debajo del ~50 % necesario para que la decodificación especulativa aporte velocidad; el valor KL `nan` sugiere además un posible defecto en el entrenamiento o la evaluación.
- **Entrenamiento con contexto corto**: las filas de entrenamiento fueron de 1024 tokens, así que el comportamiento con contextos largos no está probado.
- **Emparejamiento con cuantizacion**: la cabeza se entrenó sobre el base en 4 bits NF4; con pesos bf16 u 8 bits el acuerdo será menor.
- **Profundidad 1**: solo borra un token por adelantado; encadenar borradores más profundos no está probado.
- **Evaluacion limitada**: las métricas se miden con teacher-forcing sobre texto de dataset, no sobre generaciones reales del base, y no constituyen un benchmark de velocidad.
- **Adopcion minima**: 485 descargas y 1 like en el momento de la ficha; no hay comunidad ni validacion de terceros.
- **Licencia**: Apache 2.0 tanto para la cabeza como para el base, lo que permite uso comercial, pero conviene revisar los terminos del modelo base antes de desplegar en produccion.

## Enlaces

- Repositorio de la cabeza MTP: https://huggingface.co/applepie69/Nanbeige4.3-33B-MTP-head
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Datasets de entrenamiento: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k, https://huggingface.co/datasets/open-r1/OpenR1-Math-220k, https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
- Paper, blog o demo: no disponible
