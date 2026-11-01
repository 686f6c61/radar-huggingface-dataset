# open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-DPO-Tulu3-decontaminated-sr30k

## Resumen

El modelo `open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-DPO-Tulu3-decontaminated-sr30k` es un ajuste fino (fine-tuning) completo del modelo base `ali-elganzory/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-DPO-Tulu3-decontaminated`, desarrollado por el usuario open-sci. Se trata de un transformer de aproximadamente 1.714 millones de parametros (1,7B) entrenado sobre un dataset de razonamiento generado a partir de gpt-oss-120b (Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf). El modelo se publica con la libreria transformers y pesos en safetensors, y su pipeline declarado es feature-extraction.

La relevancia de este modelo reside en su cadena de entrenamiento: parte de un modelo base entrenado sobre MixtureVitae (300BT, 16k de contexto) con DPO y datos Tulu3 decontaminados, y se somete a un SFT adicional sobre datos de razonamiento. Esto lo situa en la categoria de modelos pequenos orientados a tareas de razonamiento y extraccion de caracteristicas, aunque la informacion publica sobre sus capacidades concretas es muy limitada. El repositorio tiene un tamano de 3,4 GB y apenas 15 descargas, lo que indica que es un modelo de investigacion con escasa validacion externa.

La model card es auto-generada por el Trainer y no incluye descripcion de uso, datos de evaluacion ni resultados de benchmarks. El model-index declarado contiene una entrada sin resultados (`results: []`), por lo que no existen metricas publicadas. Cualquier evaluacion de sus capacidades debe realizarse de forma empirica por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de MixtureVitae, detalles no disponibles) |
| Parametros totales | 1.714.377.728 (1,7B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 16k (segun el nombre del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (licencia no estandar, requiere revision) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline declarado | feature-extraction |
| Tamano del repositorio | 3,4 GB |
| Modelo base | ali-elganzory/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-DPO-Tulu3-decontaminated |
| Framework de entrenamiento | Llama Factory (full fine-tuning) |

## Arquitectura y entrenamiento

La arquitectura exacta no esta documentada en la model card. Por el nombre del modelo base se deduce una arquitectura transformer con ventana de contexto de 16k tokens, preentrenada sobre el dataset MixtureVitae (300BT de tokens) y posteriormente sometida a DPO con datos Tulu3 decontaminados. El modelo que nos ocupa anade una fase de SFT completo (full fine-tuning, no LoRA) sobre el dataset `Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf`, un conjunto de 30k ejemplos de razonamiento generados por gpt-oss-120b en formato ShareGPT.

Los hiperparametros de entrenamiento declarados son: learning rate 4e-05, batch total de 128 (batch size 1 con acumulacion de gradientes de 4 en 32 dispositivos), 5 epocas, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con warmup del 10%. El entrenamiento se realizo con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento: el SFT sobre datos de razonamiento de gpt-oss-120b sugiere capacidad para tareas de razonamiento multi-paso, aunque no hay evaluacion publicada que lo confirme.
- Extraccion de caracteristicas: el pipeline declarado es feature-extraction, por lo que el modelo esta pensado para generar representaciones (embeddings) de texto.
- Ajuste sobre formato ShareGPT: los datos de entrenamiento usan el formato ShareGPT, lo que implica familiaridad con conversaciones multi-turno.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y multi-step reasoning: no disponible (no declarado explicitamente, aunque el dataset de entrenamiento es de razonamiento).
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Extraccion de embeddings para busqueda semantica: dado que el pipeline declarado es feature-extraction, el modelo puede usarse para generar representaciones vectoriales de documentos y alimentar indices de recuperacion (RAG), aprovechando su contexto de 16k tokens para fragmentos largos.
- Clasificacion de texto mediante representaciones: las capas ocultas del modelo pueden servir como base para tareas de clasificacion con un cabezal ligero, especialmente en dominios donde el razonamiento previo del SFT aporta senal.
- Generacion de razonamiento sintetico: el ajuste sobre 30k ejemplos de razonamiento permite usarlo para generar cadenas de razonamiento en experimentos de destilacion o aumento de datos.
- Prototipado de asistentes conversacionales: el formato ShareGPT de entrenamiento facilita su uso en dialogos multi-turno para pruebas de concepto, siempre con validacion manual.
- Investigacion sobre decontaminacion de datos: al ser un modelo derivado de un pipeline con datos decontaminados (Tulu3), sirve como caso de estudio para analizar el efecto de la decontaminacion en el rendimiento.
- Evaluacion comparativa de fine-tuning completo vs. LoRA: al ser un full fine-tuning documentado con hiperparametros, es util como referencia en estudios sobre estrategias de ajuste en modelos de 1,7B.
- Fine-tuning posterior en dominios especificos: su tamano (1,7B) y licencia permisiva (a revisar) lo hacen candidato para ajustes adicionales en tareas verticales con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor contiene una unica entrada (`sft__Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf__1-7b-Mixtur-9fd25118__sdpa-op-109f6f0c`) con la lista de resultados vacia (`results: []`).

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa: 5-7 GB para contextos moderados).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,7-2 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1-1,5 GB para pesos.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070) para FP16; GPUs profesionales (A100, H100) solo necesarias para entrenamiento o batches grandes.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 8 GB o mas en cuantizacion; en FP16 requiere al menos 8 GB para contextos cortos.
- Opciones de despliegue: transformers (nativo), vLLM y TGI (compatibles con safetensors), llama.cpp y Ollama (requieren conversion a GGUF, no incluida en el repo).
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci/1.7b-MixtureVitae-...-sr30k | 1,7B | 16k | other | HuggingFace (15 descargas) | Fine-tuning sobre datos de razonamiento; sin benchmarks |
| ali-elganzory/1.7b-MixtureVitae-...-DPO-Tulu3 | 1,7B | 16k | no disponible | HuggingFace | Modelo base; incluye DPO y datos Tulu3 decontaminados |
| Qwen2.5-1.5B | 1,5B | 32k | Apache 2.0 | HuggingFace, ampliamente validado | Modelo pequeno con benchmarks publicados y soporte multilingue |
| SmolLM2-1.7B | 1,7B | 8k | Apache 2.0 | HuggingFace | Modelo pequeno con evaluacion publica y ecosistema amplio |

La comparativa con Qwen2.5-1.5B y SmolLM2-1.7B es orientativa por tamano; no existen datos de rendimiento del modelo open-sci que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay resultados publicados que permitan estimar su calidad frente a alternativas.
- Model card auto-generada: la documentacion carece de descripcion de uso, datos de evaluacion y limitaciones, lo que dificulta su adopcion en produccion.
- Licencia "other": no es una licencia estandar; es imprescindible revisar los terminos antes de cualquier uso comercial.
- Idiomas no declarados: no se especifica que lenguas soporta, por lo que el rendimiento multilingue es incierto.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluacion no puede cuantificarse.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento ni posibles sesgos.
- Escasa validacion comunitaria: 15 descargas y 0 likes indican que el modelo no ha sido probado de forma extensa.
- Dependencia del modelo base: sus capacidades y limitaciones heredan las del modelo `ali-elganzory/...`, tambien sin evaluacion publica.
- Contexto de 16k: suficiente para muchas tareas, pero inferior a modelos actuales con 32k-128k.
- Conversion a GGUF no incluida: para usar con llama.cpp u Ollama es necesario convertir los pesos manualmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-DPO-Tulu3-decontaminated-sr30k
- Modelo base: https://huggingface.co/ali-elganzory/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-DPO-Tulu3-decontaminated
- Llama Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Dataset de entrenamiento (referencia en la model card): /gpfs/scratch/ehpc524/ot/datasets/Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf (ruta local, no URL publica)
