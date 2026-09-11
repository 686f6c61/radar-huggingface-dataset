# JoseA1988/learn_hf_food_not_food_text_classifier-distilbert-base-uncased

## Resumen

El modelo `JoseA1988/learn_hf_food_not_food_text_classifier-distilbert-base-uncased` es un clasificador de texto binario obtenido por ajuste fino (*fine-tuning*) de `distilbert/distilbert-base-uncased`. Lo publica el usuario JoseA1988 en Hugging Face y su tarea nominal, deducible del nombre, es distinguir si un texto pertenece o no a la categoría "comida". Se distribuye bajo licencia Apache 2.0 en formato safetensors, con 66.955.010 parámetros y un peso en disco de aproximadamente 0,3 GB, por lo que es un modelo de muy bajo coste computacional.

Técnicamente es un transformer encoder de 6 capas derivado de BERT-base mediante destilación de conocimiento, con una ventana de contexto de 512 tokens y tokenizador WordPiece sin distinción de mayúsculas. La arquitectura no incorpora mecanismos de atención eficiente, decodificación especulativa ni mezcla de expertos: es un modelo denso, puramente discriminativo, que devuelve una distribución de probabilidad sobre las clases en lugar de generar texto.

Su relevancia es limitada y de ámbito práctico: sirve como ejemplo reproducible de un *pipeline* de clasificación con `transformers`, `Trainer` y tokenizador rápido, y como componente ligero para filtrar contenido culinario en tiempo real en CPU. No obstante, la model card está generada automáticamente, no documenta el conjunto de datos, no declara idiomas soportados y el repositorio acumula 0 descargas y 0 *likes*, por lo que debe tratarse como un artefacto experimental y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT), 6 capas, 12 cabezas de atencion, dimension oculta 768, derivado de BERT-base por destilacion |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (max_position_embeddings del modelo base) |
| Tipos de cuantizacion | no declarados en el repositorio; al ser un modelo denso de 67 M de parametros es convertible a FP16/BF16 e INT8 dinamico con las herramientas estandar de transformers y ONNX Runtime |
| Idiomas soportados | no disponibles; el modelo base `distilbert-base-uncased` se entrena sobre todo con texto en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,3 GB) |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT: un transformer encoder de 6 capas y 768 dimensiones ocultas con 12 cabezas de atencion, obtenido por destilacion de `bert-base-uncased`. Conserva aproximadamente el 97 % del rendimiento de BERT-base en tareas de comprension, con un 40 % menos de parametros y alrededor de un 60 % menos de latencia. Sobre esta base se ha anadido una cabeza de clasificacion (presumiblemente de dos etiquetas, dado el nombre "food / not food"), lo que explica la diferencia entre los 66.362.880 parametros del modelo base y los 66.955.010 parametros declarados en safetensors. El tokenizador es WordPiece con vocabulario de 30.522 entradas y normalizacion a minusculas.

Los hiperparametros documentados en la model card son: learning rate 2e-05, `train_batch_size` 32, `eval_batch_size` 32, semilla 42, optimizador AdamW (variante torch fused, betas 0,9/0,999, epsilon 1e-08), scheduler lineal y 10 epocas. Con 7 pasos por epoca, el entrenamiento completo supone 70 pasos, lo que implica un conjunto de entrenamiento de unas 224 muestras (32 x 7). No se documenta la composicion del dataset, ni si hubo RLHF, DPO, aumento de datos o validacion cruzada; la model card indica explicitamente "More information needed" en las secciones de descripcion, usos previstos y datos. Las versiones de framework registradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1. No hay innovaciones tecnicas adicionales: no emplea atencion lineal, SSM, atencion por ventanas ni decodificacion especulativa.

## Capacidades

- Clasificacion de texto binaria: asigna una etiqueta (comida / no comida) a una secuencia de entrada de hasta 512 tokens.
- Puntuacion de probabilidad por clase: la cabeza de clasificacion devuelve logits normalizados por softmax, utiles para umbralizar decisiones con un score de confianza.
- Procesamiento por lotes: al ser un encoder pequeno, permite clasificar miles de textos por segundo en GPU y cientos por segundo en CPU.
- Ejecucion en CPU: 67 M de parametros permiten inferencia sin GPU con latencias de milisegundos por muestra.
- Integracion nativa con `transformers`, `text-embeddings-inference` y `endpoints_compatible`, lo que habilita despliegue como endpoint HTTP de clasificacion.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: no es un modelo generativo.
- No hay evidencia de soporte de *tool calling*, agentes, multi-step reasoning ni modo "thinking".
- Capacidad multilingue no declarada; el modelo base es predominantemente ingles.
- No tiene capacidades de vision ni de audio.

## Casos de uso

- Filtrado de resenas en plataformas gastronomicas: clasificar en tiempo real cada resena entrante como relacionada con comida o no, para enrutarla al modulo de analisis de sentimiento gastronomico o descartarla.
- Moderacion de foros y redes sociales: detectar y separar hilos culinarios del resto del trafico antes de aplicar reglas de moderacion especificas por tematica.
- Enrutamiento en asistentes conversacionales: como clasificador de intencion previo a un LLM mayor, decidiendo si la consulta del usuario debe ir al flujo de recetas o al flujo general, reduciendo coste de tokens.
- Curacion de datasets: etiquetar automaticamente grandes volumenes de texto para construir corpus tematicos de alimentacion destinados a entrenar otros modelos.
- Publicidad contextual: seleccionar inventario de anuncios de alimentacion o marcas de gran consumo en funcion del contenido de la pagina o del articulo.
- Busqueda interna en webs de recetas: prefiltrar el indice documental para que el motor de busqueda solo opere sobre documentos con tematica culinaria.
- Analitica de tendencias: procesar por lotes miles de titulares o publicaciones para medir la cuota de conversacion sobre alimentacion en un periodo determinado.
- *Data cleaning* en pipelines de scraping: descartar paginas o fragmentos que no tratan sobre comida antes de almacenarlos en un data lake.

## Benchmarks y rendimiento

El `model-index` de la model card declara una lista de resultados vacia, por lo que no existen benchmarks oficiales publicados (MMLU, GLUE, HumanEval, GSM8K u otros no aplican ni estan disponibles para este modelo). El autor si publica la evolucion del entrenamiento en el conjunto de evaluacion, que se reproduce a continuacion tal cual aparece en la model card:

| Epoca | Paso | Training loss | Validation loss | Accuracy |
|---|---|---|---|---|
| 1.0 | 7 | 0.6256 | 0.4202 | 0.88 |
| 2.0 | 14 | 0.4109 | 0.2475 | 1.00 |
| 3.0 | 21 | 0.2287 | 0.1290 | 1.00 |
| 4.0 | 28 | 0.1192 | 0.0670 | 1.00 |
| 5.0 | 35 | 0.0647 | 0.0392 | 1.00 |
| 6.0 | 42 | 0.0403 | 0.0274 | 1.00 |
| 7.0 | 49 | 0.0286 | 0.0217 | 1.00 |
| 8.0 | 56 | 0.0247 | 0.0187 | 1.00 |
| 9.0 | 63 | 0.0215 | 0.0173 | 1.00 |
| 10.0 | 70 | 0.0210 | 0.0168 | 1.00 |

No se han publicado resultados de benchmarks comparativos en la informacion disponible. La accuracy de 1,0 se obtiene sobre un conjunto de evaluacion cuyo tamano no se documenta y cuyos 7 pasos por epoca sugieren un conjunto muy reducido, por lo que no debe interpretarse como una estimacion fiable de generalizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,27 GB en FP32, 0,13 GB en FP16/BF16 y 0,07 GB en INT8, sin contar activaciones; con lotes pequenos el consumo total se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquiera con al menos 2 GB de VRAM. Es funcional en NVIDIA T4, GTX 1650, RTX 3050, RTX 4090, A100 o H100; en estas ultimas el cuello de botella sera el ancho de banda del *host* y no la GPU.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo de los ultimos diez anos, e incluso en GPUs integradas. Tambien es viable en CPU pura, con latencias de decenas de milisegundos por muestra.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, servidor de inferencia de Hugging Face (endpoints compatibles), Text Embeddings Inference para clasificacion, ONNX Runtime o TorchScript para optimizacion de latencia. `vLLM` soporta modelos de clasificacion, aunque su ventaja es marginal a este tamano. `llama.cpp` y `Ollama` requieren conversion previa a GGUF, formato que no se distribuye en el repositorio.
- Latencia y throughput: no se publican mediciones oficiales. Como referencia de orden de magnitud, un encoder de 6 capas y 512 tokens suele procesar centenares de secuencias por segundo en CPU moderna y varios miles por segundo en GPU con lotes grandes, pero estas cifras deben validarse en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (fine-tune de DistilBERT) | 66,9 M | 512 tokens | Clasificacion binaria ajustada | apache-2.0 | Hugging Face, 0 descargas |
| distilbert-base-uncased | 66,4 M | 512 tokens | Encoder preentrenado | apache-2.0 | Hugging Face, ampliamente usado |
| bert-base-uncased | 110 M | 512 tokens | Encoder preentrenado | apache-2.0 | Hugging Face, ampliamente usado |
| roberta-base | 125 M | 512 tokens | Encoder preentrenado | mit | Hugging Face, ampliamente usado |
| deberta-v3-small | 142 M | 512 tokens | Encoder preentrenado | mit | Hugging Face, ampliamente usado |

La comparacion no puede establecerse en terminos de rendimiento porque el modelo no publica benchmarks ni resultados comparables: el `model-index` esta vacio y la unica metrica disponible es una accuracy de 1,0 sobre un conjunto de evaluacion no caracterizado. Frente a las alternativas de la tabla, la diferencia relevante es de proposito: los otros modelos son encoders de proposito general que requieren ajuste fino, mientras que este ya incorpora una cabeza de clasificacion, pero con un dominio fijado a "comida / no comida" y sin documentacion del entrenamiento.

## Limitaciones y advertencias

- Ausencia total de documentacion del dataset: no se especifica numero de muestras, procedencia, idioma, metodo de etiquetado ni criterios de anotacion.
- Riesgo alto de sobreajuste: 70 pasos de entrenamiento totales, 10 epocas con perdida descendente monotona y accuracy 1,0 desde la segunda epoca indican un conjunto de datos muy pequeno y un modelo practicamente memorizado.
- Accuracy de 1,0 no extrapolable: sin tamano de evaluacion ni particiones independientes, el valor carece de valor estadistico.
- Sesgos conocidos: no declarados. El modelo hereda los sesgos de `distilbert-base-uncased`, entrenado con corpus web en ingles, y anade los del dataset no documentado con el que se ajusto.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de falsos positivos y falsos negativos con score de confianza alto, especialmente ante vocabulario fuera de dominio.
- Limitacion de contexto: 512 tokens; textos mas largos deben truncarse o segmentarse, con perdida de informacion en documentos extensos.
- Limitacion idiomatica: el modelo base no distingue mayusculas y esta orientado al ingles; el comportamiento en castellano u otros idiomas no esta validado.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el modelo se distribuye sin garantias y el autor no ofrece soporte ni documentacion de cumplimiento.
- Trazabilidad y madurez: 0 descargas, 0 *likes*, model card autogenerada sin revisar, y fechas del repositorio (creacion 2026-09-11) posteriores a la fecha actual, lo que apunta a metadatos generados de forma automatica o a un entorno de pruebas.
- No apto para decisiones de alto impacto (contratacion, credito, salud, moderacion automatizada sin revision humana) sin una evaluacion independiente previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoseA1988/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Documentacion de `transformers` para clasificacion de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- No se han encontrado enlaces relevantes en la busqueda web; los resultados devueltos corresponden a guias de programacion de television en aleman y no guardan relacion con el modelo.
