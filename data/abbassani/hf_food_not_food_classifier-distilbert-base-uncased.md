# Abbassani/hf_food_not_food_classifier-distilbert-base-uncased

## Resumen

`Abbassani/hf_food_not_food_classifier-distilbert-base-uncased` es un clasificador de texto binario obtenido por ajuste fino (*fine-tuning*) de `distilbert/distilbert-base-uncased`, orientado a la tarea que su nombre sugiere: distinguir si un texto habla de comida o no. Lo publica el usuario Abbassani en Hugging Face y se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y compatibilidad declarada con los *endpoints* de inferencia de Hugging Face.

Tecnicamente es un modelo pequeno: 66.955.010 parametros, encoder Transformer de 6 capas con 768 dimensiones ocultas, derivado por destilacion de conocimiento de BERT-base. La model card es practicamente un esqueleto autogenerado por `Trainer`: no documenta el dataset de entrenamiento, ni el mapeo de etiquetas, ni los usos previstos, y repite "More information needed" en todas las secciones descriptivas. Lo unico con contenido real son los hiperparametros y la tabla de entrenamiento.

Su relevancia practica hoy es limitada pero concreta: sirve como ejemplo de clasificador ligero desplegable en CPU o en cualquier GPU de gama baja, y como punto de partida reproducible para tareas de filtrado tematico. Ahora bien, el entrenamiento declara 10 epocas con solo 7 pasos por epoca (batch 32, es decir, del orden de 224 ejemplos por epoca) y una exactitud de 1,0 con perdida de validacion de 0,0001 desde la primera epoca, lo que apunta a un conjunto de evaluacion minusculo o trivial y a un riesgo alto de sobreajuste. El repositorio, ademas, no tiene descargas ni *likes* registrados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only, destilado de BERT-base (6 capas, 768 de dimension oculta, 12 cabezas de atencion) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (limite de `max_position_embeddings` del modelo base; no declarado en la model card) |
| Tipos de cuantizacion | no disponibles en el repositorio; el modelo base admite conversion a fp16, int8 y ONNX |
| Idiomas soportados | no disponible en la model card; el modelo base es *uncased* y se preentreno principalmente en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); el repositorio ocupa 2,7 GB, por encima del peso del modelo, lo que sugiere que incluye checkpoints y estados del optimizador |
| Tarea (pipeline) | text-classification |
| Modelo base | distilbert/distilbert-base-uncased |
| Numero de etiquetas | no declarado (tarea binaria segun el nombre del modelo; el orden de las etiquetas no se documenta) |
| Version de transformers declarada | 5.16.1 |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder Transformer de 6 capas, 768 de dimension oculta y 12 cabezas de atencion, con 66 millones de parametros, obtenido por destilacion de BERT-base. Sobre ese backbone se anade una cabeza de clasificacion de secuencia que produce la distribucion sobre las etiquetas. Al ser un modelo *uncased*, el tokenizador WordPiece pasa el texto a minusculas y pierde la distincion entre mayusculas, algo relevante si la senal de la tarea depende de nombres propios o de formato.

El ajuste fino se realizo con `Trainer` de Hugging Face y estos hiperparametros: learning rate 1e-4, batch de entrenamiento y de evaluacion de 32, semilla 42, optimizador AdamW en su variante *fused* con betas (0,9; 0,999) y epsilon 1e-8, planificador lineal y 10 epocas. La tabla de entrenamiento muestra 7 pasos por epoca, de modo que el total es de 70 pasos; con batch 32, esto implica del orden de 224 ejemplos por epoca. No se documenta el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO o cualquier etapa de alineacion (poco habitual en un clasificador). Tampoco se declara ninguna innovacion tecnica adicional: no hay decodificacion especulativa, atencion lineal ni variantes de arquitectura.

El dato mas llamativo es la curva de validacion: perdida de 0,0001 y exactitud de 1,0 en las diez epocas, incluida la primera. Un comportamiento asi suele indicar un conjunto de validacion muy pequeno, una tarea separable con una sola palabra clave o contaminacion entre entrenamiento y evaluacion; en cualquier caso, no permite extrapolar el rendimiento a datos reales. Las versiones de framework declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1.

## Capacidades

- Clasificacion de texto binaria (comida / no comida) sobre fragmentos cortos, segun el proposito declarado en el nombre del modelo.
- Inferencia rapida en CPU: al ser un encoder de 6 capas y 67 millones de parametros, el coste por muestra es bajo.
- Ejecucion por lotes (*batching*) para procesar grandes volumenes de textos cortos en tareas de filtrado.
- Integracion directa con el pipeline `text-classification` de transformers y con los *endpoints* de Hugging Face (etiqueta `endpoints_compatible`).
- Generacion de texto: no. Razonamiento, matematicas, codigo, vision o audio: no. Es un clasificador discriminativo, no un modelo generativo.
- Tool calling / function calling: no soportado.
- Uso como agente o razonamiento multi-paso: no soportado.
- Capacidades multilingues: no declaradas. El modelo base es monocapa en ingles y de vocabulario *uncased*; no hay evidencia de soporte para castellano.
- Modo *thinking* u otras capacidades especiales: no disponibles.

## Casos de uso

- Filtrado tematico previo a un pipeline de recomendacion de recetas: clasificar titulos, consultas de busqueda o descripciones entrantes y descartar las que no tratan sobre alimentacion antes de pasarlas al motor de recomendacion, reduciendo ruido y coste computacional aguas abajo.
- Moderacion y enrutado en un foro o red social gastronomica: etiquetar publicaciones como relacionadas con comida para asignarlas a la cola de moderacion o al *feed* tematico correcto.
- Triaje de tickets en un marketplace de alimentacion: separar consultas sobre productos o pedidos de mensajes ajenos al negocio (spam, soporte de otra indole) para dirigirlos al equipo adecuado.
- Limpieza de corpus para entrenar un modelo mayor: usar este clasificador como filtro para quedarse solo con las muestras alimentarias de un dataset crudo antes de etiquetarlo o anotarlo.
- Analisis de resenas de restaurantes y productos: prefiltrar resenas que efectivamente describen comida, para despues aplicar sobre ellas un analisis de sentimiento especifico del dominio.
- Clasificacion en tiempo real en el borde (*edge*): al ocupar unas pocas decimas de GB, puede desplegarse en un contenedor pequeno o incluso en CPU de un servicio sin GPU, con latencia de milisegundos por lote corto.
- Componente de demostracion o *baseline* interno: sirve como referencia sencilla y reproducible para comparar contra clasificadores mas grandes o ajustados con mas datos.

En todos estos escenarios conviene validar antes el mapeo real de etiquetas, dado que la model card no lo documenta, y verificar el rendimiento sobre datos propios, dado el tamano aparentemente minimo del conjunto de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, HumanEval u otros) en la informacion disponible. El `model-index` del repositorio declara una lista de resultados vacia. Lo unico disponible es la tabla de validacion generada por `Trainer` durante el ajuste fino, que se reproduce a continuacion tal cual aparece en la model card:

| Epoca | Paso | Perdida de validacion | Exactitud |
|---|---|---|---|
| 1.0 | 7 | 0,0001 | 1,0 |
| 2.0 | 14 | 0,0001 | 1,0 |
| 3.0 | 21 | 0,0001 | 1,0 |
| 4.0 | 28 | 0,0001 | 1,0 |
| 5.0 | 35 | 0,0001 | 1,0 |
| 6.0 | 42 | 0,0001 | 1,0 |
| 7.0 | 49 | 0,0001 | 1,0 |
| 8.0 | 56 | 0,0001 | 1,0 |
| 9.0 | 63 | 0,0001 | 1,0 |
| 10.0 | 70 | 0,0001 | 1,0 |

Estos valores son resultados declarados por el autor sobre su propio conjunto de evaluacion, no sobre un benchmark publico, y no permiten comparacion directa con otros modelos. No se dispone de datos sobre el tamano de ese conjunto de evaluacion ni sobre su composicion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 270 MB en fp32, 135 MB en fp16 y 70 MB en int8, sin contar el *overhead* del runtime. Los pesos de safetensors del repositorio en fp32 ocupan del orden de 268 MB.
- GPU recomendadas: cualquiera con 4 GB o mas de memoria. Una RTX 3060, RTX 4060 o superior cubre de sobra el caso de uso; A100 o H100 solo tienen sentido con lotes muy grandes o en un servicio con alta concurrencia, donde el modelo no sera el cuello de botella.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada de los ultimos anos, e incluso en iGPU con memoria compartida para lotes pequenos.
- Ejecucion en CPU: viable y habitual para este tamano. Un servidor con varios nucleos puede atender peticiones individuales en decenas de milisegundos.
- Opciones de despliegue: pipeline de transformers, Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), exportacion a ONNX con Optimum y ejecucion con ONNX Runtime, servidores de inferencia genericos como TorchServe o un servicio FastAPI propio. vLLM y TGI no son las vias habituales para un encoder de clasificacion; llama.cpp y Ollama estan orientados a modelos generativos con pesos GGUF y no son la opcion natural aqui.
- Latencia y throughput: no hay mediciones publicadas. Como estimacion orientativa, en CPU un lote de textos cortos se resuelve en el orden de 5 a 20 ms y en GPU por debajo de 2 ms, con un throughput de centenares a miles de muestras por segundo en GPU con lotes grandes. Estas cifras son estimaciones basadas en el tamano del modelo, no datos oficiales.

## Comparativa con modelos similares

No hay resultados de benchmarks publicados para este modelo, por lo que la comparacion se limita a caracteristicas estructurales y de licencia.

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Este modelo (DistilBERT ajustado) | 66,9 M | 512 tokens | Clasificacion binaria (comida / no comida) | Apache 2.0 |
| distilbert/distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base preentrenado, sin cabeza de tarea | Apache 2.0 |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 tokens | Analisis de sentimiento binario en ingles | Apache 2.0 |
| bert-base-uncased | 110 M | 512 tokens | Modelo base preentrenado (encoder de 12 capas) | Apache 2.0 |
| roberta-base | 125 M | 512 tokens | Modelo base preentrenado (encoder de 12 capas) | MIT |

Frente a estos alternativas, la unica ventaja medible de este modelo es su tamano reducido y su coste de inferencia bajo; no hay evidencia publicada de que su calidad en la tarea sea superior, y su dataset de entrenamiento no esta documentado. Un clasificador ajustado con el mismo backbone pero con un dataset grande y bien descrito seria, en la practica, mas fiable.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, ni su tamano, ni su procedencia, ni el mapeo de etiquetas. Es imprescindible verificar cual de las dos clases corresponde a "comida" antes de usar el modelo.
- La exactitud de 1,0 con perdida de 0,0001 desde la primera epoca es sospechosa. Con 7 pasos por epoca y batch 32, el entrenamiento apunta a unas 224 muestras por epoca, un volumen muy bajo para generalizar.
- Riesgo elevado de sobreajuste y de que el modelo dependa de palabras clave superficiales en lugar de comprender el tema.
- No hay evaluacion sobre datos externos, ni validacion cruzada, ni pruebas de robustez ante texto ruidoso, jerga, errores tipograficos o dominios distintos al de entrenamiento.
- Idioma: no se declara soporte multilingue y el modelo base es *uncased* entrenado principalmente en ingles. El rendimiento en castellano es, como minimo, dudoso.
- Limitacion de contexto de 512 tokens heredada del modelo base; textos mas largos se truncan, con perdida de informacion.
- Sesgos: no hay analisis de sesgos disponible. Al derivar de un modelo preentrenado en corpus web (Wikipedia y BookCorpus), hereda los sesgos presentes en esas fuentes, aunque la tarea binaria concreta limita su manifestacion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si puede producir clasificaciones erroneas con alta confianza, especialmente en textos ambiguos o fuera de dominio.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre que se conserven los avisos de copyright y se indique que se ha modificado el modelo. No impone restricciones de uso adicionales, pero tampoco ofrece garantias.
- El repositorio tiene 0 descargas y 0 *likes*, y no cuenta con mantenimiento ni soporte documentado. No es un artefacto validado por la comunidad.
- Para produccion seria recomendable reentrenar con un dataset propio documentado, con particiones de validacion y test independientes, y comparar contra el modelo base con una cabeza entrenada especificamente para el dominio de interes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abbassani/hf_food_not_food_classifier-distilbert-base-uncased
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentacion del pipeline de clasificacion de texto de transformers: https://huggingface.co/docs/transformers/main/en/tasks/sequence_classification
- Busqueda web: no se han encontrado enlaces relevantes sobre este modelo. Los resultados devueltos por el buscador corresponden a dominios administrativos sin relacion alguna con el modelo ni con clasificacion de texto.
