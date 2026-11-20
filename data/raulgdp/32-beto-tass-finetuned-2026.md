# raulgdp/32-Beto-tass-finetuned-2026

## Resumen

32-Beto-tass-finetuned-2026 es un modelo de clasificación de texto en castellano obtenido mediante fine-tuning de dccuchile/bert-base-spanish-wwm-cased, el conocido BETO desarrollado por el grupo DCC de la Universidad de Chile. Lo publica el usuario raulgdp en Hugging Face y se distribuye en formato safetensors con la librería transformers. El modelo conserva la arquitectura BERT base (encoder transformer) y el tokenizador cased con wordpiece y whole-word-masking del modelo original, por lo que su función es producir etiquetas de clase sobre secuencias de texto, no generar texto libre.

El interés del modelo es acotado pero concreto: es un ajuste fino de clasificación supervisada sobre un conjunto de datos que el autor no documenta, con un rendimiento moderado en validación (accuracy 0,6545 y F1 macro 0,6571 en el checkpoint final). La curva de entrenamiento muestra sobreajuste a partir de la época 4-5, con la mejor validación en la época 4 (accuracy 0,6733, F1 macro 0,6645) y un deterioro progresivo de la pérdida de validación hasta 1,9046 en la época 8.

Por su tamaño (109,8 millones de parámetros) y su naturaleza de encoder, es un modelo ligero, apto para inferencia en CPU y GPU de consumo, y encaja en pipelines de clasificación a bajo coste. No obstante, la ausencia de información sobre el dataset, las etiquetas, los idiomas y la licencia limita seriamente su uso en producción sin una validación previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (encoder transformer), fine-tuning de dccuchile/bert-base-spanish-wwm-cased |
| Parametros totales | 109.853.187 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base BETO admite 512 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantizacion dinamica estandar de PyTorch/ONNX, no documentada por el autor) |
| Idiomas soportados | no disponible en la model card; el modelo base esta entrenado en espanol |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de BETO (bert-base-spanish-wwm-cased), un transformer encoder de tipo BERT base con 12 capas, atencion multi-cabeza y tokenizador WordPiece con whole-word-masking y distincion de mayusculas y minusculas. La cabeza de clasificacion se sustituye por una capa densa adaptada al numero de etiquetas del dataset de destino, que el autor no especifica. No hay innovaciones arquitectonicas propias: se trata de un ajuste supervisado convencional con `Trainer` de transformers.

Los hiperparametros declarados son learning rate 1e-05, batch de entrenamiento y evaluacion de 64, semilla 42, optimizador AdamW fused con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal y 10 epocas planificadas. El registro de entrenamiento se detiene en la epoca 8 (paso 488), con pérdida de entrenamiento descendiendo de 1,9810 a 0,6311 mientras la pérdida de validación sube desde 1,6805 hasta 1,9046, lo que indica sobreajuste claro. El conjunto de datos de entrenamiento y evaluacion no se documenta ("unknown dataset" en la model card), y no se declara uso de RLHF, DPO ni tecnicas de aumentacion de datos. Las versiones de framework son Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Clasificacion de texto supervisada: asigna una etiqueta (o distribución de etiquetas) a una secuencia de entrada; el numero y la semantica de las clases no estan documentados.
- Procesamiento de texto en espanol: hereda del modelo base BETO el vocabulario y el preentrenamiento en castellano, aunque el autor no declara idiomas en la model card.
- Manejo de texto con distincion de mayusculas y minusculas gracias al tokenizador cased del modelo base.
- No soporta generacion de texto, tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking: es un encoder de clasificacion.
- No se documentan capacidades multilingues adicionales mas alla del possible sesgo al espanol del modelo base.
- Compatible con text-embeddings-inference y endpoints de Hugging Face segun los tags del repositorio, lo que permite desplegarlo como servicio de clasificacion.

## Casos de uso

- Moderacion de contenido en castellano: el modelo puede clasificar comentarios o publicaciones en categorias de toxicidad o spam, siempre que se reentrene o valide con un dataset etiquetado propio, ya que las clases del ajuste no estan documentadas.
- Clasificacion de tickets de soporte: asignar automaticamente categoria o prioridad a incidencias en espanol; su tamano reducido permite desplegarlo en CPU para volumeres altos con latencia baja.
- Analisis de sentimiento en resenas: util como base para un clasificador binario o multiclase de opinion en productos o servicios, con la cautela de validar el rendimiento real (F1 macro 0,6571 en validacion) sobre el dominio objetivo.
- Etiquetado de documentos y correos: categorizar correos entrantes o documentos administrativos por tipo, aprovechando la ventana de hasta 512 tokens del modelo base para parrafos y fragmentos.
- Filtrado previo en pipelines de datos: descartar o priorizar muestras de texto antes de pasarlas a un modelo generativo mayor, reduciendo coste computacional.
- Deteccion de intencion en asistentes conversacionales: clasificar la intencion del usuario en un turno de dialogo para enrutar la conversacion a un flujo u otro, con inferencia en GPU de consumo o CPU.
- Investigacion academica en PLN en espanol: servir como punto de partida o baseline para experimentos de clasificacion con BETO, dado su bajo coste de entrenamiento e inferencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de evaluacion (dataset no documentado):

| Metrica | Epoca 1 | Epoca 2 | Epoca 3 | Epoca 4 | Epoca 5 | Epoca 6 | Epoca 7 | Epoca 8 |
|---|---|---|---|---|---|---|---|---|
| Validation loss | 1,6805 | 1,5891 | 1,5507 | 1,5870 | 1,6625 | 1,7686 | 1,8283 | 1,9046 |
| F1 macro | 0,6255 | 0,6425 | 0,6574 | 0,6645 | 0,6673 | 0,6668 | 0,6617 | 0,6571 |
| F1 weighted | 0,6299 | 0,6484 | 0,6627 | 0,6687 | 0,6694 | 0,6688 | 0,6650 | 0,6586 |
| Accuracy | 0,6379 | 0,6639 | 0,6712 | 0,6733 | 0,6701 | 0,6701 | 0,6660 | 0,6545 |

El checkpoint final declarado en la model card (epoca 8) presenta loss 1,9046, F1 macro 0,6571, F1 weighted 0,6586 y accuracy 0,6545. El mejor resultado de validacion se alcanza en la epoca 4 (accuracy 0,6733, F1 macro 0,6645). La model-index no incluye resultados adicionales (lista vacia). No se han publicado resultados de benchmarks estandar como MMLU, GLUE o HumanEval en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (109,8 M de parametros x 4 bytes), mas activaciones y overhead; en la practica, menos de 1 GB con batch pequeno.
- VRAM estimada en fp16: aproximadamente 0,22 GB para pesos, mas overhead; cuantizacion dinamica int8 reduce a unos 0,11 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (RTX 3060, RTX 4090, A100, H100); el modelo no necesita GPU de datacenter y funciona bien en GPU de consumo.
- Cabe en CPU: si, con latencia de decenas de milisegundos por secuencia corta en un procesador moderno; es adecuado para despliegue en contenedores sin GPU.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference segun los tags del repositorio, ONNX Runtime y TorchScript para optimizacion; no se documenta soporte nativo de vLLM, llama.cpp u Ollama para este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU (miles de secuencias por segundo con batch grande) y moderado en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 32-Beto-tass-finetuned-2026 | 109,8 M | no disponible (base: 512 tokens) | Clasificacion de texto | no disponible | Hugging Face |
| dccuchile/bert-base-spanish-wwm-cased (BETO) | 109,8 M | 512 tokens | Modelo base preentrenado en espanol | no disponible en la informacion | Hugging Face |
| BERT base multilingual (bert-base-multilingual-cased) | 177,9 M | 512 tokens | Modelo base multilingue | Apache 2.0 (segun el modelo original de Google) | Hugging Face |
| RoBERTa base en espanol (BSC-TeMU/roberta-base-bne) | 124,6 M | 512 tokens | Modelo base preentrenado en espanol | no disponible en la informacion | Hugging Face |

La comparacion directa de rendimiento no es posible porque el autor no publica benchmarks frente a alternativas y el dataset de evaluacion no esta identificado. Frente a BETO, este modelo anade un ajuste fino de clasificacion, pero con sobreajuste y sin documentacion de etiquetas; frente a alternativas multilingues como BERT multilingual, el modelo base BETO esta especializado en espanol, lo que suele favorecer el rendimiento en castellano a igualdad de datos.

## Limitaciones y advertencias

- Dataset de entrenamiento y evaluacion no documentado: se desconoce el dominio, el numero de clases, el equilibrio de etiquetas y la procedencia de los datos, lo que impide evaluar su validez fuera del conjunto original.
- Sobreajuste evidente: la pérdida de validacion aumenta desde la epoca 4 mientras la de entrenamiento cae, y el checkpoint final (epoca 8) rinde peor que el de la epoca 4; conviene usar el checkpoint intermedio si se reentrena.
- Rendimiento moderado: accuracy 0,6545 y F1 macro 0,6571 en validacion, insuficiente para muchas aplicaciones de produccion sin validacion adicional en el dominio objetivo.
- Licencia no disponible: no se puede confirmar el uso comercial; es imprescindible contactar con el autor o consultar el repositorio antes de desplegarlo en productos.
- Idiomas no declarados: aunque el modelo base es de espanol, el autor no especifica el alcance linguistico del ajuste.
- Riesgo de sesgos y alucinacion de etiquetas: al ser un clasificador, puede asignar etiquetas incorrectas con alta confianza en entradas fuera de distribucion; no hay evaluacion de calibracion ni de sesgos.
- Sin soporte de generacion, razonamiento o tool calling: no es adecuado para tareas generativas ni para agentes.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente.
- Model card autogenerada por Trainer y sin completar: faltan secciones de usos previstos, limitaciones y datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raulgdp/32-Beto-tass-finetuned-2026
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Repositorio del proyecto BETO (DCC U. de Chile): https://github.com/dccuchile/beto
- Documentacion de transformers: https://huggingface.co/docs/transformers
- Documentacion de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
