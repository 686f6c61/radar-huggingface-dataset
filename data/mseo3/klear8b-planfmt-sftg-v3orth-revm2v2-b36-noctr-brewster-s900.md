# mseo3/klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s900

## Resumen

Klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s900 es un ajuste fino supervisado (SFT) del modelo Klear-Reasoner-8B-SFT, desarrollado por el usuario mseo3 y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un experimento de entrenamiento orientado a dotar al modelo de un formato de planificacion explicita mediante la incorporacion de dos tokens especiales de plan (`<|plan|>` y `<|/plan|>`), anadidos al vocabulario del tokenizador y con filas del `lm_head` reinicializadas de forma ortogonal a sus piezas de texto correspondientes.

El modelo conserva la arquitectura y el tamano del modelo base: 8.190.735.360 parametros (aproximadamente 8,2 mil millones) en formato safetensors, con un repositorio de 16,4 GB que incluye pesos en bf16. El checkpoint publicado corresponde al paso 900 de una receta de SFT denominada `sft_recipe_v3orth`, entrenada sobre 4 GPU H200 con FlashAttention 3 y un lote global de 36. La particularidad de esta ejecucion (sufijo `noctr`) es que desactiva el termino de contraste de plan (`data.plan_contrast_margin=0`) respecto a una ejecucion A/B previa, lo que la convierte en una variante de investigacion mas que en un modelo de produccion.

La relevancia de esta ficha es limitada pero concreta: documenta un paso intermedio de un pipeline de investigacion sobre razonamiento estructurado y planificacion en modelos de 8B, con decisiones de entrenamiento trazables (mascara de pasos fallidos, reinicializacion ortogonal de embeddings, gestion de shards de optimizador). No es un modelo pensado para uso general, sino una pieza de un experimento reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3, segun tag `qwen3` del modelo base) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Kwai-Klear/Klear-Reasoner-8B-SFT, que a su vez se etiqueta con la familia `qwen3` en Hugging Face. La arquitectura subyacente es, por tanto, un transformer decoder-only de aproximadamente 8,2 mil millones de parametros, sin componentes MoE. La innovacion principal de este checkpoint no reside en la arquitectura, sino en la extension del vocabulario: se anaden los tokens `<|plan|>` (id 151669) y `<|/plan|>` (id 151670) como tokens no ligados (untied), reinicializando las filas correspondientes del `lm_head` de forma ortogonal a las representaciones de sus piezas de texto. Esto fuerza al modelo a aprender una representacion diferenciada para los delimitadores de plan en lugar de heredar la de los tokens textuales equivalentes.

El entrenamiento se realizo sobre el dataset privado `mseo3/klear8b-planfmt-revmask-sft` (revision `5ef1de66`, subconjunto `data/rev_m2_v2`), compuesto por 27.773 filas revisadas en las que los pasos fallidos se enmascaran de la perdida. La receta `sft_recipe_v3orth` usa lote global 36, learning rate 2e-5 con decaimiento coseno hasta 1e-5 durante 1500 pasos, warmup de 30 pasos y arranque desde el modelo base (no continua desde otro checkpoint). La ejecucion se hizo en 4x H200 con FlashAttention 3. Respecto a la ejecucion A/B de referencia, esta variante desactiva el termino de contraste de plan (`plan_contrast_margin=0`), manteniendo la misma semilla para garantizar que las filas procesadas coincidan paso a paso. Solo se conserva el optimizador en el guardado mas reciente; los shards obsoletos se podan antes de cada escritura (`SFT_PRUNE_OPT_BEFORE_SAVE=1`). Los pesos finales se fusionaron de shards FSDP a bf16.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Klear-Reasoner-8B-SFT, orientado a tareas de razonamiento.
- Formato de planificacion explicita: introduce delimitadores `<|plan|>` y `<|/plan|>` para estructurar planes dentro de la generacion, aunque su comportamiento efectivo no esta validado en la model card.
- Codigo y matematicas: presumiblemente soportadas por herencia del modelo base; no se documentan evaluaciones especificas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: el formato de plan sugiere orientacion a descomposicion de tareas, pero no hay evidencia publicada de su eficacia.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre planificacion estructurada: el modelo sirve como punto de comparacion en experimentos que evaluan si los tokens de plan mejora la descomposicion de tareas frente al modelo base sin ellos, gracias a la trazabilidad de la receta y a la ejecucion A/B documentada.
- Reproduccion de experimentos de SFT: al documentarse hiperparametros, semilla, hardware y gestion de shards, permite replicar el paso 900 de la receta `sft_recipe_v3orth` en entornos con 4 GPU de alta gama.
- Estudio de inicializacion ortogonal de embeddings: util para analizar el impacto de reinicializar filas del `lm_head` de forma ortogonal a sus piezas de texto en tokens anadidos al vocabulario.
- Analisis de enmascaramiento de perdida en pasos fallidos: el dataset con pasos fallidos enmascarados permite estudiar como afecta esta tecnica a la estabilidad del entrenamiento en tareas de razonamiento multi-paso.
- Base para ajustes posteriores: al estar en bf16 y con licencia Apache 2.0, puede servir como punto de partida para fine-tunings especificos que requieran el formato de plan.
- Evaluacion de contraste de plan: la variante `noctr` permite medir el efecto de desactivar el termino de contraste frente a la ejecucion de referencia, en un contexto de investigacion controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,19 mil millones de parametros en bf16, se requieren aproximadamente 16,4 GB solo para pesos; en la practica, entre 18 y 20 GB con overhead de activaciones y cache KV para contextos moderados.
- Cuantizacion: no se publican versiones GGUF ni cuantizadas; habria que generarlas a partir de los safetensors. En 4 bits (Q4_K_M) el modelo cabria en torno a 5-6 GB, pero es una estimacion no verificada.
- GPU recomendadas: el entrenamiento se realizo en 4x H200; para inferencia, una A100 40GB, H100 o RTX 4090 (24 GB) serian suficientes en bf16.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) en bf16 con contexto limitado; en GPUs de 16 GB requeriria cuantizacion.
- Opciones de despliegue: vLLM, TGI o llama.cpp (previa conversion a GGUF); al ser un checkpoint de investigacion sin pipeline declarado, requiere verificacion manual de compatibilidad con el tokenizador extendido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s900 | 8,19B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Checkpoint experimental paso 900, tokens de plan anadidos |
| Kwai-Klear/Klear-Reasoner-8B-SFT | ~8B | no disponible | no disponible | Hugging Face | Modelo base del que deriva este checkpoint |
| Qwen3-8B | ~8B | no disponible | no disponible | Hugging Face | Familia arquitectonica de referencia segun tag `qwen3` |

## Limitaciones y advertencias

- Modelo experimental: se trata del paso 900 de una receta de investigacion, no de un modelo final validado; no hay benchmarks ni evaluaciones publicadas.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas documentados.
- Tokenizador extendido: los tokens `<|plan|>` y `<|/plan|>` requieren que el tokenizador y el `lm_head` se carguen correctamente; herramientas que asuman el vocabulario original de Qwen3 pueden fallar o ignorar estos tokens.
- Riesgo de alucinacion: inherente a los modelos de 8B sin evaluacion especifica; el formato de plan no garantiza correccion factual.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset privado de SFT.
- Licencia Apache 2.0 permite uso comercial, pero el dataset de entrenamiento es privado y no se detalla su procedencia, lo que limita la auditoria.
- Sin soporte de cuantizacion oficial ni artefactos GGUF; el despliegue en produccion requeriria trabajo adicional de conversion y validacion.
- Idiomas no disponibles: no se puede confirmar el soporte multilingue mas alla de lo que herede el modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/mseo3/klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s900
- Modelo base: https://huggingface.co/Kwai-Klear/Klear-Reasoner-8B-SFT
- Dataset de entrenamiento (privado, referenciado): https://huggingface.co/datasets/mseo3/klear8b-planfmt-revmask-sft
- Paper, blog o demo: no disponibles en la informacion proporcionada.
