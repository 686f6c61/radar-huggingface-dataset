# MayorChris/xlm-roberta-large-batch32-tass-finetuned-2026

## Resumen

Este modelo es una version ajustada (fine-tuned) de XLM-RoBERTa Large, el codificador multilingue de Meta (FacebookAI), desarrollado por el usuario MayorChris y publicado en Hugging Face en octubre de 2026. Se trata de un modelo de clasificacion de texto entrenado sobre el conjunto de datos TASS, un benchmark de analisis de sentimiento en espanol ampliamente utilizado en la comunidad de PLN hispanohablante. El nombre del modelo sugiere un entrenamiento con batch size 32, aunque la model card no detalla la composicion exacta del dataset.

El modelo conserva la arquitectura transformer encoder de XLM-RoBERTa Large, con 559.893.507 parametros en total, y esta pensado para tareas de clasificacion mediante el pipeline `text-classification` de la libreria Transformers. Los resultados declarados por el autor sobre el conjunto de evaluacion muestran una accuracy de 0,6972 y un F1 macro de 0,6975, cifras que sugieren un rendimiento modesto y un posible sobreajuste en las ultimas epocas (la loss de validacion crece de 0,7539 en la epoca 3 a 1,0191 en la epoca 10).

Su relevancia es limitada como modelo de produccion: es un fine-tune experimental generado automaticamente con el Trainer de Hugging Face, con documentacion incompleta ("More information needed" en varias secciones) y pocas descargas (136 en el momento de la ficha). Resulta util principalmente como referencia de experimentos de clasificacion de sentimiento en espanol o como punto de partida para nuevos fine-tunings.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa Large (transformer encoder) |
| Parametros totales | 559.893.507 |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos en cada pasada) |
| Longitud de contexto | no disponible (la arquitectura base XLM-RoBERTa Large usa 512 tokens, pero el autor no lo declara) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es multilingue, 100 idiomas; el fine-tuning parece centrado en espanol por el dataset TASS) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa Large, un transformer encoder de 24 capas con dimension oculta de 1024 y 16 cabezas de atencion, preentrenado por Meta con masked language modeling sobre 2,5 TB de texto filtrado de CommonCrawl en 100 idiomas. Sobre esta base se anade una cabeza de clasificacion entrenada para la tarea de analisis de sentimiento del dataset TASS. El numero exacto de clases no esta documentado, aunque el TASS clasico suele usar 4 etiquetas de polaridad; el autor no lo especifica.

El entrenamiento se realizo con Hugging Face Trainer durante 10 epocas, con learning rate de 1e-05, batch size de entrenamiento de 32 (64 en evaluacion), optimizador AdamW con implementacion fused de PyTorch (betas 0,9/0,999, epsilon 1e-08), planificador de learning rate lineal y semilla 42. Las metricas registradas incluyen accuracy, F1 macro y weighted, precision y recall. La curva de entrenamiento muestra un pico de rendimiento en la epoca 8 (F1 macro 0,7048, validation loss 0,9308) seguido de un sobreajuste claro: la loss de entrenamiento baja hasta 0,2260 mientras la loss de validacion sube hasta 1,0191 en la epoca 10, que es el checkpoint final publicado.

No hay informacion sobre el tamano del dataset, la composicion de los datos ni tecnicas adicionales como RLHF o DPO (que no aplican a este tipo de modelo encoder).

## Capacidades

- Clasificacion de texto en el pipeline `text-classification` de Transformers, orientada a analisis de sentimiento en espanol (dataset TASS).
- Herencia multilingue del modelo base XLM-RoBERTa Large (100 idiomas en el preentrenamiento), aunque el fine-tuning solo ha visto datos del TASS, por lo que el rendimiento fuera de espanol no esta verificado.
- Compatibilidad con `text-embeddings-inference` y con los endpoints de Hugging Face, segun los tags del repositorio.
- No genera texto, no razona, no programa y no soporta tool calling ni agentes: es un modelo encoder de clasificacion, no un LLM generativo.
- No tiene capacidades de vision ni audio.

## Casos de uso

- Analisis de sentimiento en redes sociales en espanol: el TASS procede de tuits, por lo que el modelo es adecuado para clasificar la polaridad de mensajes cortos de Twitter/X en castellano.
- Monitorizacion de reputacion de marca: se puede integrar en un pipeline que clasifique menciones o comentarios como positivos, negativos o neutros para alertas en tiempo real.
- Filtrado de comentarios en medios y foros: clasificacion automatica del tono de comentarios para priorizar moderacion o analisis posterior.
- Encuestas y atencion al cliente: etiquetado automatico de respuestas abiertas en encuestas de satisfaccion o tickets breves para enrutar casos negativos.
- Linea base para investigacion: como checkpoint con metricas documentadas por epoca, sirve de baseline reproducible (semilla 42, hiperparametros publicados) para comparar nuevos fine-tunings sobre TASS.
- Extraccion de embeddings: al estar etiquetado para `text-embeddings-inference`, puede usarse para obtener representaciones vectoriales de texto en espanol para tareas downstream, aunque no es su proposito principal.
- Distilacion o transferencia: punto de partida para fine-tunings posteriores en dominios cercanos (opiniones de productos, reseñas) aprovechando los pesos ya ajustados a sentimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; el model-index del autor esta vacio. Los unicos datos son las metricas sobre el conjunto de evaluacion declaradas por el autor:

| Metrica | Valor (eval final, epoca 10) |
|---|---|
| Loss | 1,0191 |
| Accuracy | 0,6972 |
| F1 Macro | 0,6975 |
| F1 Weighted | 0,6990 |
| Recall Macro | 0,6986 |
| Recall Weighted | 0,6972 |
| Precision Macro | 0,6984 |
| Precision Weighted | 0,7030 |

Mejor punto de la curva de validacion (epoca 8, no publicado como checkpoint): F1 macro 0,7048, accuracy 0,7024, validation loss 0,9308.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo encoder de 560M parametros en fp16 ocupa aproximadamente 1,1-1,2 GB de pesos, mas overhead de activaciones; 2-4 GB de VRAM son suficientes para inferencia con secuencias de 512 tokens. En fp32, alrededor de 2,2-2,5 GB.
- GPU recomendadas: cualquier GPU moderna; para inferencia basta una RTX 3060, RTX 4060 o superior. Para reentrenar o hacer fine-tuning se recomiendan del orden de 16-24 GB (RTX 4090, A100).
- Cabe sobradamente en GPUs de consumo; no requiere hardware de centro de datos para inferencia.
- Despliegue: libreria Transformers de Hugging Face, compatible con `text-embeddings-inference` (TEI) y con los Inference Endpoints de Hugging Face segun los tags del repositorio. No hay indicios de soporte para vLLM, llama.cpp u Ollama (no es un modelo generativo GGUF).
- Latencia y throughput: no disponible; al ser un encoder de 560M parametros, se esperan latencias de pocos milisegundos por secuencia en GPU de consumo, pero el autor no publica medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Comentario |
|---|---|---|---|---|
| MayorChris/xlm-roberta-large-batch32-tass-finetuned-2026 | 559,9M | Clasificacion de sentimiento (TASS, espanol) | MIT | Fine-tune experimental, F1 macro 0,6975, documentacion incompleta |
| FacebookAI/xlm-roberta-large (base) | 559,9M | Modelo base encoder multilingue | MIT | Sin cabeza de clasificacion; punto de partida para cualquier fine-tuning |
| dccuchile/bert-base-spanish-wwm-cased (BETO) | 110M | Encoder en espanol | Apache 2.0 | Mucho mas ligero y especifico para espanol; suele rendir de forma competitiva en TASS con menos recursos |

No hay disponibles cifras de benchmark comparativas directas publicadas por el autor frente a otros modelos en el mismo dataset.

## Limitaciones y advertencias

- Sobreajuste evidente: la loss de validacion crece desde la epoca 4-5 mientras la loss de entrenamiento cae; el checkpoint final (epoca 10) no es el de mejor rendimiento. Conviene evaluar si se obtiene mejor resultado con early stopping.
- Rendimiento modesto: accuracy y F1 macro en torno a 0,70, lejos del estado del arte en TASS; puede no ser adecuado para produccion sin mejoras.
- Documentacion incompleta: la model card no especifica el dataset exacto ("unknown dataset"), el numero de clases, el preprocesamiento ni los usos previstos, lo que dificulta la reproducibilidad.
- Tamano del repositorio anomalamente grande (44,8 GB) para un modelo de 560M parametros cuyos pesos en safetensors ocupan unos 2,2 GB; puede indicar checkpoints multiples incluidos en el repo.
- Sesgos: hereda los sesgos de los datos de CommonCrawl del preentrenamiento de XLM-RoBERTa y los del dataset TASS (tuits, lenguaje informal, posible desequilibrio de clases); no se ha publicado ningun analisis de sesgos.
- Riesgo de error de clasificacion no cuantificado por dominio: las metricas provienen de un unico conjunto de evaluacion; el comportamiento en otros dominios (reseñas, noticias, otros registros del espanol) es desconocido.
- Licencia MIT: sin restricciones para uso comercial, pero al tratarse de un fine-tune de terceros sin auditoria, se recomienda validacion propia antes de desplegarlo.
- Baja adopcion: 136 descargas y 1 like en el momento de la ficha; no hay comunidad de soporte ni issues activos conocidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MayorChris/xlm-roberta-large-batch32-tass-finetuned-2026
- Modelo base (XLM-RoBERTa Large): https://huggingface.co/FacebookAI/xlm-roberta-large
