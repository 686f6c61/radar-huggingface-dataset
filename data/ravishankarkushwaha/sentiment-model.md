# RaviShankarKushwaha/sentiment-model

## Resumen

sentiment-model es un modelo de clasificación de texto publicado en HuggingFace por el usuario RaviShankarKushwaha. Se trata de un ajuste fino (fine-tuning) de answerdotai/ModernBERT-base, un transformer encoder-only de 149.607.171 parámetros, orientado a la tarea de análisis de sentimiento dentro del pipeline `text-classification`. El repositorio se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y un tamaño total de 0,9 GB, e incluye la etiqueta `endpoints_compatible`, lo que indica que puede servirse a través de la infraestructura de inferencia de HuggingFace.

ModernBERT, el modelo base, es la arquitectura que sustituye a BERT y RoBERTa en tareas de comprensión del lenguaje: introduce embeddings posicionales rotatorios (RoPE), atención alterna local/global, Flash Attention 2 y *unpadding*, lo que le permite manejar secuencias mucho más largas que los 512 tokens clásicos. Al partir de esa base, este ajuste hereda esa eficiencia arquitectónica, aunque la model card no documenta explícitamente ni la longitud de contexto efectiva ni los idiomas cubiertos tras el fine-tuning.

La relevancia de esta ficha es acotada y conviene ser explícito: el modelo tiene 0 descargas y 0 likes, el conjunto de datos de entrenamiento es desconocido ("unknown dataset" según la propia model card) y sus métricas publicadas son modestas (accuracy 0,6586 y F1 macro 0,6485 en validación, con pérdida de validación que repunta en la tercera época). Se trata, por tanto, de un experimento reproducible y no de un modelo validado para producción; su interés principal es como punto de partida o referencia metodológica para quien quiera ajustar ModernBERT en clasificación de sentimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (familia ModernBERT, heredada de answerdotai/ModernBERT-base) |
| Parametros totales | 149.607.171 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base ModernBERT-base admite 8.192 tokens |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas; admite cuantizacion estandar via Optimum/ONNX) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Pipeline | text-classification |
| Numero de etiquetas | No disponible |
| Modelo base | answerdotai/ModernBERT-base |
| Tamano del repositorio | 0,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-26 |
| Ultima actualizacion | 2026-09-26 |
| Versiones del entorno | Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5, Tokenizers 0.23.1 |

## Arquitectura y entrenamiento

La arquitectura es la de ModernBERT-base: un codificador transformer de 22 capas con dimensión oculta de 768, sin sesgos en las capas lineales, con activaciones GeGLU, embeddings posicionales rotatorios (RoPE), alternancia de atención local y global y atención con *unpadding* para evitar cómputo en tokens de relleno. Estas innovaciones permiten extender la ventana de contexto hasta 8.192 tokens (frente a los 512 de BERT/RoBERTa) manteniendo un coste de inferencia bajo. El modelo base fue entrenado sobre aproximadamente 2 billones de tokens, mayoritariamente en inglés, según la documentación pública de Answer.AI. Conviene subrayar que estos datos describen el modelo base: la model card de este ajuste no confirma qué parte de esas capacidades se conserva tras el fine-tuning.

El entrenamiento documentado es un ajuste supervisado clásico de clasificación, sin rastro de RLHF ni DPO (no aplicables a un modelo discriminativo). Se usaron 3 épocas, tasa de aprendizaje 2e-05, tamaño de lote 32 (tanto en entrenamiento como en evaluación), semilla 42, optimizador AdamW con `torch_fused` y betas (0,9; 0,999), epsilon 1e-08 y planificador lineal. El registro indica 58 pasos por época (174 pasos totales), lo que con lotes de 32 implica aproximadamente 1.856 ejemplos por época; el conjunto de datos, su composición, su dominio y su esquema de etiquetas no se especifican en ningún punto de la documentación.

## Capacidades

- Clasificación de texto: el modelo está diseñado para asignar una etiqueta a una secuencia de entrada (presumiblemente polaridad de sentimiento, aunque el esquema de clases no se documenta).
- Inferencia por lotes: el pipeline `text-classification` de Transformers permite procesar grandes volúmenes de texto en batch.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse en los Inference Endpoints de HuggingFace sin adaptaciones.
- Exportación a otros runtimes: al ser un modelo estándar de Transformers, es exportable a ONNX y TorchScript mediante Optimum.
- Capacidades multilingües: no disponibles; no se declara ningún idioma, y el modelo base está entrenado principalmente en inglés.
- Generación de texto, razonamiento, código, matemáticas, visión, audio: no soportadas (modelo discriminativo, no generativo).
- Tool calling / function calling: no soportado.
- Modo agente o razonamiento multi-paso: no soportado.
- Modo "thinking": no disponible.

## Casos de uso

- Análisis de sentimiento en reseñas de producto como prototipo interno: dado que el modelo clasifica texto en una o varias clases de polaridad, puede usarse para etiquetar automáticamente reseñas y validar manualmente una muestra antes de integrarlo en un flujo real.
- Triaje de tickets de soporte: enrutar automáticamente tickets según la polaridad detectada (queja frente a consulta neutra), usando lotes de inferencia sobre el histórico almacenado en una base de datos.
- Análisis de encuestas NPS y verbatims: clasificar las respuestas abiertas de encuestas para obtener una distribución de sentimiento agregada por segmento, producto o periodo temporal.
- Monitorización de menciones en redes sociales: procesar en streaming (por ejemplo, con un consumidor de Kafka) los textos que llegan, filtrando por sentimiento negativo para alertar al equipo de comunicación.
- Filtrado previo en pipelines de datos: actuar como primera etapa de bajo coste que descarta contenido claramente neutro antes de pasar el resto a un modelo mayor o a revisión humana.
- Investigación académica y docencia: servir como ejemplo reproducible de ajuste fino de ModernBERT con el `Trainer` de Transformers, útil para comparar hiperparámetros frente a baselines propios.
- Señal auxiliar en modelos de predicción: generar una puntuación de sentimiento por documento que se use como característica adicional en modelos de *forecasting* de demanda o de abandono de clientes.
- Clasificación de encuestas internas de clima laboral: etiquetar comentarios anónimos de empleados para detectar áreas con sentimiento negativo recurrente.

En todos los casos conviene recordar que las métricas publicadas (accuracy 0,6586) obligan a una evaluación propia sobre datos del dominio antes de cualquier uso con impacto real.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, GLUE, SST-2, etc.) en la información disponible. El campo `model-index` del repositorio contiene un array de resultados vacío. Los únicos datos de rendimiento son las métricas del conjunto de evaluación propio del autor, declaradas en la model card:

| Conjunto de evaluacion | Loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|
| Validacion final | 0,7422 | 0,6586 | 0,6485 | 0,6485 |

Evolución por épocas durante el entrenamiento:

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1,0 | 58 | 0,9536 | 0,8058 | 0,6019 | 0,5980 | 0,5980 |
| 2,0 | 116 | 0,6855 | 0,7537 | 0,6821 | 0,6790 | 0,6790 |
| 3,0 | 174 | 0,5035 | 0,8067 | 0,6759 | 0,6778 | 0,6778 |

Dos observaciones técnicas: la pérdida de validación deja de mejorar en la tercera época mientras la de entrenamiento sigue bajando (indicio de sobreajuste), y la coincidencia exacta entre F1 weighted y F1 macro en las tres épocas sugiere un conjunto de validación con clases perfectamente balanceadas o con muy pocas clases.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, alrededor de 0,6 GB de pesos (más activaciones); en FP16/BF16, unos 0,3 GB; en INT8, unos 0,15 GB; en INT4, unos 0,08 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente. Una NVIDIA RTX 3060, RTX 4090, T4, L4, A10G, A100 o H100 sirven sobradamente para esta carga.
- GPU de consumo: sí, cabe en prácticamente cualquier GPU de consumo de los últimos ocho años. También es viable la inferencia en CPU para volúmenes moderados, dado el reducido número de parámetros.
- Opciones de despliegue: pipeline `text-classification` de Transformers, exportación a ONNX Runtime mediante Optimum, TorchScript, servidor propio con FastAPI/uvicorn, inferencia por lotes con la librería `datasets`, vLLM (soporta modelos de clasificación/pooling) y HuggingFace Inference Endpoints gracias a la etiqueta `endpoints_compatible`. El soporte en Ollama o llama.cpp no está confirmado en la información disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia, tokens por segundo ni ejemplos por segundo.

## Comparativa con modelos similares

La comparación de rendimiento no es directa porque este modelo no publica resultados en benchmarks estándar y su accuracy (0,6586) procede de un conjunto de evaluación propio cuyo origen se desconoce.

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| RaviShankarKushwaha/sentiment-model | 149,6 M | No especificado (base: 8.192) | Clasificacion de sentimiento | Apache 2.0 | Accuracy 0,6586 en validacion propia (no estandar) |
| distilbert-base-uncased-finetuned-sst-2-english | 66 M | 512 | Clasificacion binaria (SST-2) | Apache 2.0 | 0,913 de accuracy en SST-2 dev, segun su model card |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 | Sentimiento en 3 clases (Twitter) | No disponible | No disponible |
| answerdotai/ModernBERT-base | 149 M | 8.192 | Modelo base (masked language modeling) | Apache 2.0 | No aplica (no es un clasificador) |

La ventaja estructural de este modelo frente a las alternativas basadas en BERT o RoBERTa es la ventana de contexto de la arquitectura ModernBERT (hasta 8.192 tokens), que permite clasificar documentos largos sin truncar. Su desventaja, hoy, es la falta de validación: los modelos de DistilBERT y CardiffNLP cuentan con millones de descargas y evaluaciones externas, mientras que este repositorio no tiene ninguna.

## Limitaciones y advertencias

- Conjunto de datos de entrenamiento desconocido: la model card lo declara explícitamente como "unknown dataset", lo que impide auditar sesgos, dominio, idioma o cobertura de clases.
- Métricas modestas: accuracy 0,6586 y F1 macro 0,6485. Para una tarea de sentimiento binaria o ternaria, estos valores son bajos en comparación con modelos establecidos, que superan el 0,85-0,90 en dominios similares a los de entrenamiento.
- Sobreajuste: la pérdida de validación sube de 0,7537 en la época 2 a 0,8067 en la época 3 mientras la de entrenamiento cae de 0,6855 a 0,5035. La época 2 sería el mejor punto de control según esos datos.
- Esquema de etiquetas no documentado: se desconoce cuántas clases tiene el modelo y qué representa cada una. Sin esa información no puede interpretarse la salida en producción.
- Riesgo de clasificación errónea: al ser un modelo discriminativo no "alucina" texto, pero sí puede asignar etiquetas incorrectas de forma sistemática en dominios alejados de los datos de entrenamiento.
- Idiomas: no se declara ninguno. El modelo base ModernBERT está entrenado principalmente en inglés, por lo que el rendimiento en castellano es una incógnita.
- Longitud de contexto práctica: aunque la arquitectura base soporta 8.192 tokens, no se confirma que el fine-tuning se haya realizado con secuencias largas; en la práctica podría degradarse con entradas extensas.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución. No obstante, al desconocerse la procedencia de los datos de entrenamiento, no puede garantizarse que el ajuste no incorpore material con restricciones adicionales.
- Sin validación por la comunidad: 0 descargas y 0 likes. No hay informes independientes ni pruebas de terceros.
- Sin cuantizaciones ni formatos alternativos publicados (GGUF, ONNX, AWQ): habría que generarlos.
- Fechas del repositorio (creación y actualización el 2026-09-26): conviene comprobar si el autor ha publicado revisiones posteriores antes de evaluarlo.
- Recomendación: no desplegar en producción sin una evaluación propia sobre datos del dominio objetivo y sin definir previamente el esquema de etiquetas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RaviShankarKushwaha/sentiment-model
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Paper de ModernBERT (arquitectura base): https://arxiv.org/abs/2412.13663
- Blog de presentación de ModernBERT en HuggingFace: https://huggingface.co/blog/modernbert
- No se han proporcionado otros enlaces (repositorios, demos o publicaciones adicionales) en la información disponible.
