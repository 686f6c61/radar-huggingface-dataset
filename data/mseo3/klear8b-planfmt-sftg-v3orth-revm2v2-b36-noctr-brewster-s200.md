# mseo3/klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s200

## Resumen

`klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s200` es un ajuste fino supervisado (SFT) del modelo Klear-Reasoner-8B-SFT, publicado por el usuario mseo3 en Hugging Face. Se trata de un checkpoint intermedio (paso 200 de un total de 1500) de una receta experimental de entrenamiento orientada a la generacion de "planes" estructurados mediante tokens especiales de apertura y cierre (`<|plan|>` y `<|/plan|>`), anadidos al vocabulario del modelo base.

El modelo pertenece a la familia Qwen3 (segun los tags de Hugging Face) y cuenta con 8.190.735.360 parametros en formato safetensors, con un repositorio de 16,4 GB en bf16. Su relevancia es fundamentalmente de investigacion: forma parte de una comparativa A/B sobre el enmascaramiento de perdida en pasos fallidos y el uso de un termino de contraste de planes, y no esta pensado como un modelo de produccion estable.

La licencia es Apache 2.0, heredada del modelo base. No hay informacion publicada sobre idiomas soportados, pipeline ni resultados de evaluacion, y el modelo no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, segun tags) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP) |

## Arquitectura y entrenamiento

El modelo parte de Klear-Reasoner-8B-SFT y anade dos tokens especiales al vocabulario: `<|plan|>` (id 151669) y `<|/plan|>` (id 151670). Estos tokens se han anadido de forma "untied" (no atados a los embeddings de entrada) y las filas correspondientes de `lm_head` se reinicializaron de forma ortogonal a sus piezas de texto. El entrenamiento se realizo sobre 4 GPU H200 con FlashAttention 3, con un batch global de 36, learning rate 2e-5 con decaimiento coseno hasta 1e-5 a lo largo de 1500 pasos, warmup de 30 pasos y arranque desde cero desde el modelo base.

El checkpoint corresponde al paso 200 de la receta `sft_recipe_v3orth`, run `sft_g_ptokc_orth_lr2e5_revm2v2_b36_noctr_s1500_brewster`. Se trata de la rama B de una comparativa A/B: usa el dataset privado `mseo3/klear8b-planfmt-revmask-sft` (revision `data/rev_m2_v2`, 27.773 filas revisadas, con los pasos fallidos enmascarados de la perdida) con la misma semilla que la rama A, pero con el termino de contraste de planes desactivado (`data.plan_contrast_margin=0`). El optimizador se conserva solo en el guardado mas reciente, podando los shards obsoletos antes de cada escritura (`SFT_PRUNE_OPT_BEFORE_SAVE=1`, arbol `c466864d`). Los pesos se fusionaron de los shards FSDP a bf16.

No se detalla la composicion del dataset de entrenamiento, el numero total de tokens vistos ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Klear-Reasoner-8B-SFT, orientado a tareas de razonamiento.
- Generacion de planes estructurados: el ajuste entrena al modelo para emitir bloques delimitados por `<|plan|>` y `<|/plan|>`, lo que permite extraer planes de forma programatica.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el formato de plan sugiere un uso orientado a descomposicion de tareas, pero no hay documentacion al respecto.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion sobre formatos de plan estructurado: el modelo sirve para estudiar si la emision de bloques `<|plan|>...</|plan|>` mejora la descomposicion de tareas en modelos de razonamiento de 8B, comparando la rama con y sin termino de contraste de planes.
- Experimentos de enmascaramiento de perdida: al entrenarse con pasos fallidos enmascarados, es util para analizar como afecta esta tecnica a la calidad de los planes generados en tareas de multiples pasos.
- Generacion de trazas de planificacion para pipelines de agentes: el formato delimitado permite parsear la salida con expresiones regulares y convertirla en una estructura ejecutable por un orquestador, siempre que se valide en produccion.
- Evaluacion de anadido de tokens especiales: sirve como caso de estudio de como afecta reinicializar filas de `lm_head` de forma ortogonal al rendimiento en tareas de generacion libre.
- Reproduccion de recetas SFT: el checkpoint documenta hiperparametros (batch 36, lr 2e-5, cosine a 1e-5, 1500 pasos, warmup 30) que permiten reproducir el entrenamiento en 4x H200 con FlashAttention 3.
- Baseline para comparativas A/B: al ser la rama B de un experimento controlado, es el punto de referencia para medir el efecto de desactivar `plan_contrast_margin` frente a la rama A.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 8.190.735.360 parametros ocupan aproximadamente 16,4 GB solo en pesos; con cache KV y overhead de runtime, se recomienda un minimo de 20-24 GB de VRAM.
- Cuantizacion: no se han publicado versiones GGUF ni cuantizadas; habria que generarlas a partir de los safetensors bf16.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, H200 (usadas en entrenamiento). En consumer, una RTX 4090 (24 GB) podria alojar los pesos en bf16 de forma ajustada, aunque con poca holgura para contexto largo.
- Cabe en consumer GPU: si, en RTX 4090 (24 GB) o superior con cuantizacion o contexto reducido; en GPUs de 16 GB requeriria cuantizacion a 8 bits o inferior.
- Opciones de despliegue: vLLM, TGI o llama.cpp (previa conversion a GGUF); no hay configuracion de despliegue publicada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s200 | 8,19 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Klear-Reasoner-8B-SFT (modelo base) | ~8 B | no disponible | no disponible | Hugging Face |
| Qwen3-8B (familia base) | ~8 B | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 200 de 1500, por lo que no representa el modelo final de la receta y su calidad puede ser inferior a la de un checkpoint completo.
- Modelo de investigacion: no hay model card completa, ni evaluaciones, ni documentacion de uso; no se recomienda para produccion sin validacion previa.
- Sin datos de sesgos: no se ha documentado el comportamiento del modelo en cuanto a sesgos, toxicidad o alucinacion.
- Idiomas no especificados: se desconoce si conserva el multilingusimo del modelo base o si el SFT lo ha degradado.
- Tokens especiales anadidos: el uso correcto requiere cargar el tokenizer con los tokens `<|plan|>` y `<|/plan|>`; un tokenizer distinto producira salidas incoherentes.
- Dataset privado: el dataset de entrenamiento (`mseo3/klear8b-planfmt-revmask-sft`) es privado, lo que limita la reproducibilidad completa.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de un modelo base cuyos terminos no se detallan, conviene verificar la licencia del modelo original antes de explotarlo comercialmente.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones optimizadas, lo que anade trabajo para despliegues en hardware limitado.

## Enlaces

- Hugging Face: https://huggingface.co/mseo3/klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s200
- Modelo base: https://huggingface.co/Kwai-Klear/Klear-Reasoner-8B-SFT
- Dataset de entrenamiento (privado): https://huggingface.co/datasets/mseo3/klear8b-planfmt-revmask-sft
