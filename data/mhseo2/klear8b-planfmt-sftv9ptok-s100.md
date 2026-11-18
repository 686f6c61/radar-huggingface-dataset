# mhseo2/klear8b-planfmt-sftv9ptok-s100

## Resumen

klear8b-planfmt-sftv9ptok-s100 es un ajuste fino supervisado (SFT) de tipo checkpoint intermedio del modelo Klear-Reasoner-8B-SFT-ptok, publicado por el usuario mhseo2 en Hugging Face. Se trata de la iteracion 100 de un total de 387 pasos de entrenamiento, orientada a un formato de "plan-token": el modelo aprende a emitir un token especial de planificacion (`<|plan|>`, id 151669) antes de resolver la tarea, una tecnica de estructuración del razonamiento similar a los modos de "thinking" de otros modelos. No es un modelo final ni una release estable, sino un artefacto de investigacion dentro de una receta de entrenamiento en curso.

El modelo parte de la familia Qwen3 (tag `qwen3` en el repositorio) y cuenta con 8.190.735.360 parametros totales en formato safetensors, con un repositorio de 16,4 GB, lo que sugiere pesos en bf16/fp16. El entrenamiento se realizo sobre 12.408 filas del dataset `mhseo2/klear-planfmt-pgdpo-pairs` (particion `plan_gepa/v8_full/merged_ptok`), con una longitud maxima de secuencia de 32.768 tokens, batch de 32, learning rate de 2e-5 con decaimiento coseno y una perdida auxiliar de contraste de plan (margen 0,1, peso 1).

Su relevancia es acotada pero concreta: documenta una receta reproducible de SFT con formato de planificacion explicita sobre una base de 8B, e incluye detalles poco habituales en model cards de checkpoints intermedios (infraestructura FSDP2 sobre 2x H100, secuencias de 32k, pesos por tipo de estructura). Es util para quienes investigan formatos de razonamiento estructurado, no para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, segun tag del repositorio) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base Klear-Reasoner-8B-SFT-ptok, que a su vez se apoya en la familia Qwen3 (tag `qwen3`). Con 8.190.735.360 parametros y pesos en safetensors de 16,4 GB, se trata de un transformer decoder-only denso en precision bf16/fp16. No hay indicios de arquitectura MoE, SSM ni hibrida en la informacion disponible.

El entrenamiento es un SFT de 387 pasos del que se publica el paso 100. Se ejecuto sobre 2 GPU H100 con FSDP2 y Ulysses sequence parallelism (SP 1), partiendo del checkpoint `mopdRL` (commit 27d80cd9). Los hiperparametros son: batch 32, learning rate 2e-5 con schedule coseno (ratio minimo 0,5, warmup 11 pasos), weight decay 0,01, gradient clipping 1 y longitud maxima 32.768. La innovacion principal es el formato de plan: el modelo emite un unico token `<|plan|>` (id 151669) para estructurar la respuesta, con pesos de perdida diferenciados por tipo de contenido (estructura 20, decision 5, decision_continue 5) y una perdida de contraste de plan con margen 0,1 y peso 1. Los datos provienen de 12.408 filas de entrenamiento del dataset `mhseo2/klear-planfmt-pgdpo-pairs`.

## Capacidades

- Generacion de texto y razonamiento estructurado mediante un token de planificacion explicito (`<|plan|>`), que precede a la resolucion.
- Razonamiento multi-paso con formato de plan, decision y continuacion de decision, segun los pesos de perdida configurados.
- Procesamiento de contextos largos de hasta 32.768 tokens, coherente con la longitud maxima de entrenamiento.
- Capacidades heredadas del modelo base Qwen3 de 8B (generacion, codigo y matematicas), aunque no se documentan explicitamente en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no documentadas; el formato de plan sugiere uso en pipelines de razonamiento, pero no se confirma.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode nativo): no disponible.

## Casos de uso

- Investigacion sobre formatos de razonamiento estructurado: el checkpoint permite estudiar como un token de planificacion explicito afecta a la calidad del razonamiento en un modelo de 8B, comparando el paso 100 con los 387 totales de la receta.
- Reproduccion de recetas de SFT: los hiperparametros completos (batch, lr, schedule, pesos de perdida) y la infraestructura (FSDP2, Ulysses SP) documentados permiten replicar el entrenamiento sobre el dataset `klear-planfmt-pgdpo-pairs`.
- Generacion de trazas de planificacion para destilacion: las salidas con token `<|plan|>` pueden usarse como datos sinteticos para entrenar modelos mas pequenos en razonamiento estructurado.
- Analisis de contraste de planes: la perdida de contraste con margen 0,1 hace del checkpoint un objeto de estudio para tecnicas de preferencia aplicadas al formato de plan.
- Evaluacion de checkpoints intermedios: al ser el paso 100 de 387, sirve para trazar curvas de aprendizaje y decidir en que punto de la receta conviene detener el entrenamiento.
- Experimentacion con contextos de 32k en 8B: util para probar tareas de resumen o QA sobre documentos largos en entornos de investigacion con 2x H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 24 GB o mas para contextos moderados.
- VRAM estimada con cuantizacion a 8 bits: alrededor de 8-9 GB de pesos; a 4 bits, alrededor de 4-5 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas para entrenamiento: 2x H100, configuracion usada por el autor con FSDP2.
- GPU de consumo: un modelo de 8B en bf16 cabe en RTX 4090 (24 GB) y, con cuantizacion, en GPUs de 8-12 GB; no hay validacion publicada para este checkpoint.
- Opciones de despliegue: al publicarse solo safetensors, requiere conversion a GGUF para llama.cpp u Ollama; vLLM y TGI pueden cargar los pesos directamente si la arquitectura Qwen3 subyacente es compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| klear8b-planfmt-sftv9ptok-s100 | 8,19B | 32.768 | no disponible | safetensors en HF |
| Qwen3-8B (base de la familia) | ~8B | no disponible en esta ficha | no disponible | ampliamente disponible |
| Klear-Reasoner-8B-SFT-ptok (modelo padre) | ~8B | no disponible | no disponible | checkpoint previo del mismo autor |

No se dispone de datos de rendimiento comparado para establecer diferencias cuantitativas con alternativas.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 100 de 387), no una release final; su calidad puede ser inferior a la del modelo al completar el entrenamiento.
- La licencia no esta declarada, lo que impide confirmar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier uso en produccion.
- No se documentan idiomas soportados ni sesgos conocidos.
- Riesgo de alucinacion inherente a los modelos de 8B sin evaluacion publicada; no hay benchmarks que lo cuantifiquen.
- El formato de plan con token especial requiere que el tokenizer y la plantilla de chat manejen correctamente el id 151669; un uso incorrecto puede degradar las salidas.
- Solo se publican pesos safetensors, sin versiones GGUF ni cuantizadas oficiales.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion por parte de la comunidad.
- El contexto maximo de 32.768 tokens corresponde al entrenamiento; no se garantiza un rendimiento estable en ese limite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhseo2/klear8b-planfmt-sftv9ptok-s100
- Dataset de entrenamiento: https://huggingface.co/datasets/mhseo2/klear-planfmt-pgdpo-pairs
- Modelo padre (Klear-Reasoner-8B-SFT-ptok): no disponible como enlace directo en la informacion proporcionada
- Paper, blog o demo: no disponible
