# dusersad12/SweepChampion-Release

## Resumen

SweepChampion-Release es un clasificador de texto en inglés obtenido por ajuste fino (*fine-tuning*) de `distilbert-base-uncased` sobre un conjunto interno de reseñas de producto (`product-reviews-v2`). Lo publica el usuario `dusersad12` en Hugging Face y corresponde, según la propia model card, a la ejecución ganadora de un barrido interno de hiperparámetros (`run_20240902_b7e2`), seleccionada aplicando un criterio explícito: entre las ejecuciones que respetaban el presupuesto de latencia de producción, la de mayor F1 de validación.

El modelo resuelve una tarea acotada de clasificación tipo sentimiento sobre texto de reseñas, con una métrica declarada de val_f1 = 0,9127 y una p95 de latencia de 231,8 ms en el hardware de servicio del autor. No es un modelo generativo ni un modelo de propósito general: es un *encoder* Transformer pequeño, pensado para inferencia de baja latencia y alto volumen.

Su relevancia es limitada pero concreta: sirve como ejemplo de pipeline de selección de modelos por latencia y como punto de partida reproducible para clasificación de reseñas en inglés. Hay que señalar dos cautelas desde el inicio: el repositorio no declara idiomas y no se ha publicado ningún benchmark sobre conjuntos públicos, por lo que las cifras solo son comparables dentro del propio barrido del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT-base); fine-tuning con cabeza de clasificación de secuencias |
| Parametros totales | 66,36 M según la model card. El campo de safetensors del Hub indica 16 (discrepancia sin resolver; el valor coherente con distilbert-base es ~66 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (max_seq_length de entrenamiento). La arquitectura base admite hasta 512 posiciones |
| Tipos de cuantizacion | No disponible (no se publican variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | No declarados en el Hub. Entrenado sobre `distilbert-base-uncased` y un dataset interno de reseñas, por lo que el uso previsto es inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la de `distilbert-base-uncased`: un encoder Transformer de 6 capas, 12 cabezas de atención y dimensión oculta 768, destilado de BERT-base y con aproximadamente 66 M de parámetros. Sobre esa base se añade una cabeza de clasificación de secuencias (`AutoModelForSequenceClassification`). La innovación técnica no está en el modelo, sino en el proceso de selección: el autor eligió la ejecución ganadora de un barrido de hiperparámetros filtrando primero por presupuesto de latencia de producción y ordenando después por F1 de validación, descartando las ejecuciones sin medición de latencia.

Los hiperparámetros declarados son batch_size 32, 4 épocas, weight_decay 0,02, warmup_ratio 0,1, max_seq_length 256 y semilla 1337. El ajuste fino se hizo sobre el *split* de entrenamiento del dataset interno `product-reviews-v2`, y la selección de modelo usó el *split* de validación compartido por todas las ejecuciones del barrido. No se documenta el número de tokens de entrenamiento, la composición del dataset, el número de clases ni si hubo etapas de RLHF o DPO (no aplicables en un clasificador, pero tampoco se detalla el esquema de etiquetado).

## Capacidades

- Clasificación de texto en inglés orientada a reseñas de producto, con salida de sentimiento o categoría (el conjunto de etiquetas no está documentado en la model card).
- Inferencia de baja latencia: 231,8 ms de p95 declarados en el hardware de producción del autor, compatible con *endpoints* de clasificación en línea.
- Compatibilidad con la librería `transformers` (`AutoModelForSequenceClassification` y `AutoTokenizer`) y con Text Embeddings Inference, según las etiquetas del repositorio.
- No dispone de generación de texto, razonamiento multi-paso, matemáticas, código ni visión.
- No soporta *tool calling* ni *function calling*.
- No está diseñado para uso agéntico.
- No se declaran capacidades multilingües; el uso previsto es texto en inglés.
- No hay modo de razonamiento (*thinking mode*) ni capacidades de audio.

## Casos de uso

- Moderación y priorización de reseñas en un comercio electrónico: el modelo clasifica reseñas entrantes y permite enrutar automáticamente las negativas a un equipo de soporte, aprovechando su baja latencia para procesar grandes volúmenes en tiempo real.
- Análisis de sentimiento por lote sobre catálogos completos: al ser un modelo de 66 M de parámetros, puede ejecutarse sobre CPU o GPU modesta para etiquetar cientos de miles de reseñas históricas en un proceso nocturno.
- Monitorización de la voz del cliente en paneles de negocio: agregación diaria del sentimiento por producto o categoría para detectar caídas de satisfacción asociadas a cambios de precio, envío o calidad.
- Filtrado previo en un pipeline de análisis más costoso: usar este clasificador como primera etapa para descartar o marcar reseñas antes de pasarlas a un LLM generativo, reduciendo el coste total de inferencia.
- Enrutado de tickets en atención al cliente: si el texto del ticket se parece a una reseña, el modelo puede asignar una etiqueta inicial de sentimiento o tema que alimente las reglas de escalado.
- Investigación sobre selección de modelos por latencia y reproducibilidad de barridos de hiperparámetros: el repositorio documenta la regla de selección y las métricas de validación, lo que lo hace útil como caso de estudio metodológico.
- Servicio de clasificación en producción vía Text Embeddings Inference: las etiquetas del repositorio (`text-embeddings-inference`, `endpoints_compatible`) sugieren despliegue directo en ese *runtime*.

## Benchmarks y rendimiento

Los únicos datos disponibles son los de la model card, medidos sobre el *split* de validación interno del autor. No hay resultados sobre conjuntos públicos (MMLU, GLUE, SST-2, etc.), por lo que no se pueden comparar con la literatura.

| Metrica | Valor |
|---|---|
| train_f1 | 0,9456 |
| val_f1 | 0,9127 |
| val_precision | 0,9081 |
| val_recall | 0,9174 |
| p95_latency_ms | 231,8 |
| params_m | 66,36 |

No se han publicado resultados de benchmarks sobre conjuntos públicos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 265 MB en fp32 y 133 MB en fp16 para los pesos; con activaciones y *overhead* del *runtime*, un presupuesto de 1 GB es más que suficiente.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo es viable incluso en iGPU o CPU. Para máximo *throughput*, una NVIDIA T4, L4 o A10 es adecuada; A100 o H100 solo tendrían sentido para lotes muy grandes y no por limitación de memoria.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en portátiles con 4 GB de VRAM.
- Opciones de despliegue: `transformers` con `pipeline`, Text Embeddings Inference (etiqueta declarada en el repositorio), FastAPI/TorchServe con exportación propia. No se publican pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión manual; vLLM y TGI no son la vía natural para un clasificador de este tamaño.
- Latencia y throughput: la model card declara p95 = 231,8 ms por petición en el hardware de servicio del autor (no especificado). No se publica *throughput* en peticiones por segundo ni la latencia en otros *hardware*.

## Comparativa con modelos similares

La model card no ofrece comparaciones. Se incluyen alternativas de la misma familia y tamaño, con datos de arquitectura públicos, marcando como "no disponible" todo lo que no se puede verificar.

| Modelo | Parametros | Contexto | Licencia | Metricas publicas | Notas |
|---|---|---|---|---|---|
| SweepChampion-Release | 66,36 M | 256 tokens (entrenamiento) | apache-2.0 | val_f1 0,9127 (validacion interna) | Fine-tuning de distilbert-base-uncased sobre datos internos; sin benchmarks publicos |
| distilbert-base-uncased (base) | 66 M | 512 tokens | apache-2.0 | No disponible en esta busqueda | Modelo base sin ajuste; requiere fine-tuning para clasificacion |
| bert-base-uncased | 110 M | 512 tokens | apache-2.0 | No disponible en esta busqueda | Mayor capacidad y mayor coste de inferencia (~1,7x parametros) |
| roberta-base | 125 M | 512 tokens | mit | No disponible en esta busqueda | Entrenado con mas datos; habitualmente superior en clasificacion, a costa de latencia |

No se dispone de resultados comparativos de rendimiento sobre un conjunto comun, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre un dataset interno de reseñas de producto; el rendimiento fuera de ese dominio no está caracterizado.
- Solo se declara uso previsto en inglés; no hay evaluación multilingüe y el tokenizador *uncased* de BERT no cubre bien acentos ni alfabetos no latinos.
- Ventana efectiva de 256 tokens: los textos más largos se truncan, lo que puede degradar la clasificación de reseñas extensas.
- El conjunto de etiquetas, el número de clases y el equilibrio de clases no están documentados, lo que dificulta interpretar la salida del modelo.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas confiadas en textos ambiguos, irónicos o fuera de distribución.
- Sesgos potenciales no evaluados: al entrenar sobre reseñas internas, puede heredar sesgos de producto, idioma, registro o demografía de los reseñadores.
- La p95 de 231,8 ms se midió en un *hardware* de servicio no especificado; en otros entornos la latencia puede diferir de forma notable.
- Solo se reportan métricas de validación interna; no hay *test* independiente ni validación cruzada publicada.
- El repositorio tiene 0 descargas y 0 *likes*, sin historial de uso ni mantenimiento; el campo de parámetros de safetensors (16) es inconsistente con la model card (66,36 M) y conviene verificar los pesos antes de desplegarlos.
- Licencia apache-2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y de copyright. No se especifican restricciones adicionales, pero el origen de los datos de entrenamiento (dataset interno) no es verificable por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dusersad12/SweepChampion-Release
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Text Embeddings Inference (runtime compatible segun las etiquetas del repositorio): https://github.com/huggingface/text-embeddings-inference
- Documentacion de Transformers para clasificacion de secuencias: https://huggingface.co/docs/transformers/tasks/sequence_classification
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la busqueda web realizada; los resultados devueltos no guardaban relacion con el modelo.
