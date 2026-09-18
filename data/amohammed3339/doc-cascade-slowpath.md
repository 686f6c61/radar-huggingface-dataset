# amohammed3339/doc-cascade-slowpath

## Resumen

doc-cascade-slowpath es un modelo de clasificacion de texto publicado por el usuario amohammed3339 en HuggingFace. Se trata de un fine-tuning completo de distilbert-base-uncased, la version destilada del transformer BERT de 6 capas, orientado a tareas de clasificacion de documentos. El nombre sugiere su integracion como "ruta lenta" (slow path) dentro de una cascada de procesamiento documental, donde solo se invoca cuando un clasificador mas rapido o ligero no alcanza la confianza suficiente.

El modelo tiene 66.956.548 parametros en formato safetensors, un tamano de repositorio de 0,8 GB y una licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La model card no documenta el dataset de entrenamiento, el numero de etiquetas ni los dominios cubiertos: se genero automaticamente con el Trainer de HuggingFace y el autor no la ha completado. Este es el principal riesgo a la hora de evaluarlo.

La relevancia de esta ficha es limitada pero concreta: se trata de un ejemplo de fine-tuning de un encoder pequeno para clasificacion, un patron muy habitual en pipelines de produccion por su bajo coste de inferencia. Sin embargo, los resultados declarados (accuracy 1.0 y perdida de validacion 0,0003 en las tres epocas) apuntan a un conjunto de validacion trivial, mal particionado o con fuga de datos, por lo que no deben interpretarse como evidencia de calidad real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT), derivada del modelo base distilbert-base-uncased |
| Parametros totales | 66.956.548 (segun safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (limite heredado de distilbert-base-uncased; no especificado en la model card) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin variantes GGUF, ONNX ni cuantizadas |
| Idiomas soportados | no disponible; el modelo base distilbert-base-uncased esta entrenado unicamente en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un DistilBERT, es decir, un transformer encoder de 6 capas con 768 dimensiones ocultas y 12 cabezas de atencion, obtenido originalmente mediante destilacion del conocimiento de BERT-base. Sobre esa base se ha anadido una cabeza de clasificacion de secuencia afinada, con 1.538 parametros adicionales respecto a los 66.955.010 del checkpoint base, lo que corresponde a un clasificador de dos etiquetas. El tokenizador asociado es el WordPiece de distilbert-base-uncased. La model card no especifica ninguna innovacion arquitectonica propia.

El entrenamiento se realizo con el Trainer de HuggingFace durante 3 epocas, 750 pasos totales, batch de entrenamiento de 32 (lo que implica aproximadamente 24.000 ejemplos de entrenamiento) y batch de evaluacion de 64. Se uso AdamW fused con betas (0,9; 0,999), epsilon 1e-8, learning rate 5e-5, scheduler lineal con un 10 por ciento de warmup, seed 20260918 y precision mixta nativa (AMP). No se documento el dataset, la composicion de clases ni si se aplico RLHF o DPO (tecnicas por otra parte poco habituales en clasificacion). Las versiones de framework declaradas son Transformers 4.57.6, PyTorch 2.14.0+cu130, Datasets 5.0.1 y Tokenizers 0.22.2.

## Capacidades

- Clasificacion de texto (text-classification): el pipeline declarado es de clasificacion de secuencias, con dos etiquetas segun el numero de parametros de la cabeza.
- Encoder de representaciones: al derivar de DistilBERT, el checkpoint puede reutilizarse como extractor de embeddings de frases, aunque no es su proposito declarado.
- Inferencia en CPU y GPU de gama baja: 67 millones de parametros permiten ejecucion en hardware muy modesto.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas: es un modelo discriminativo, no generativo.
- No hay soporte documentado de tool calling, function calling ni agentes.
- No hay capacidades multimodales (vision, audio) ni modo de razonamiento explicito (thinking mode).
- Capacidades multilingues: no disponibles; el modelo base solo maneja ingles.
- No se documenta ninguna capacidad especial adicional en la model card.

## Casos de uso

- Filtrado en cascada de documentos: el modelo actua como segunda etapa ("slow path") sobre los documentos que un clasificador mas rapido no resuelve con confianza, aprovechando que su coste de inferencia es bajo (67 M de parametros).
- Moderacion de contenido en ingles: clasificacion binaria de textos en dos categorias (por ejemplo, valido o descartable) antes de pasarlos a un revisor humano.
- Enrutamiento de tickets de soporte: asignar cada consulta a una cola u otra en funcion de la etiqueta predicha, con latencia de milisegundos en GPU y viable en CPU.
- Etiquetado a gran escala de corpus ya existentes: procesar millones de documentos en lote con un encoder pequeno es economicamente viable frente a modelos generativos.
- Clasificacion de fragmentos en pipelines RAG: decidir si un fragmento recuperado es relevante antes de pasarlo a un modelo generativo, reduciendo coste y alucinacion.
- Deteccion de documentos fuera de dominio: descartar entradas que no pertenecen a las dos clases entrenadas, siempre que se calibre un umbral con datos propios.
- Base para experimentos de destilacion o comparativas academicas: sirve como ejemplo reproducible de fine-tuning de DistilBERT con un presupuesto de computo minimo.
- Preetiquetado en anotacion activa: generar etiquetas iniciales que los anotadores corrigen, acelerando la construccion de datasets propios.

## Benchmarks y rendimiento

El campo `model-index` del autor esta vacio (`"results": []`), por lo que no hay benchmarks publicados (MMLU, GLUE, HumanEval, etc.) en la informacion disponible.

Los unicos datos numericos son los de la propia model card, correspondientes al conjunto de evaluacion usado por el autor. Se reproducen tal cual:

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | Accuracy |
|---|---|---|---|---|
| 1.0 | 250 | 0.0016 | 0.0010 | 1.0 |
| 2.0 | 500 | 0.0006 | 0.0004 | 1.0 |
| 3.0 | 750 | 0.0004 | 0.0003 | 1.0 |

Resultado final declarado: perdida 0.0003 y accuracy 1.0 sobre un conjunto de evaluacion no descrito. Estos valores son compatibles con un dataset de validacion trivial, muy pequeno o con fuga de datos respecto al de entrenamiento; no deben tomarse como rendimiento real en produccion.

## Requisitos de hardware

- VRAM estimada en fp32: en torno a 0,27 GB solo de pesos, mas activaciones; menos de 1 GB en total para lotes pequenos.
- VRAM estimada en fp16 (AMP): en torno a 0,14 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, T4, L4). Tambien funciona en CPU y en dispositivos tipo Raspberry Pi, dado el tamano del modelo.
- Cabe sin problema en GPU de consumo; de hecho es uno de los perfiles mas ligeros dentro de la familia BERT.
- Opciones de despliegue: transformers con pipeline de text-classification, Text Embeddings Inference (el tag `text-embeddings-inference` esta declarado en el repositorio), endpoints compatibles de HuggingFace, y exportacion manual a ONNX o TorchScript. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa por parte del usuario.
- Latencia y throughput: no publicados por el autor.
- Nota: el repo ocupa 0,8 GB, muy por encima de lo que exigen los pesos finales (unos 268 MB en fp32), lo que sugiere que incluye checkpoints intermedios u optimizador.

## Comparativa con modelos similares

Datos de los modelos alternativos tomados de la documentacion publica de sus respectivos checkpoints base, no de la informacion proporcionada sobre doc-cascade-slowpath.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| doc-cascade-slowpath | 66.956.548 | 512 tokens | apache-2.0 | HuggingFace, safetensors, 0 descargas y 0 likes | Fine-tuning sin dataset documentado; accuracy 1.0 no verificable |
| distilbert-base-uncased | 66,9 M aprox. | 512 tokens | apache-2.0 | HuggingFace, muy extendido | Modelo base; sin cabeza de clasificacion afinada a una tarea concreta |
| bert-base-uncased | 110 M aprox. | 512 tokens | apache-2.0 | HuggingFace, muy extendido | Mas preciso en GLUE de forma general, mas lento y pesado que DistilBERT |
| roberta-base | 125 M aprox. | 512 tokens | mit | HuggingFace, muy extendido | Entrenamiento mas largo y robusto; licencia distinta (MIT) |

No se dispone de comparaciones de rendimiento medidas entre estos modelos y doc-cascade-slowpath, porque el autor no publica benchmarks reproducibles.

## Limitaciones y advertencias

- Resultados no fiables: accuracy 1.0 con perdida 0,0003 y sin describir el conjunto de evaluacion indica posible fuga de datos, validacion trivial o dataset desbalanceado. No valides este modelo con los numeros de su model card.
- Sesgos conocidos: no documentados. Al derivar de un corpus ingles sin filtrar, hereda los sesgos de distilbert-base-uncased.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza en entradas fuera de dominio.
- Ambito de etiquetas desconocido: no se especifica cuantas clases hay ni que representan (la cabeza sugiere dos, por el numero de parametros, pero el autor no lo confirma).
- Idioma: el modelo base es solo ingles; el uso en castellano no esta soportado ni evaluado.
- Longitud de contexto: limitada a 512 tokens, con truncamiento de entradas mas largas.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre citando aviso de copyright y licencia. No hay restricciones adicionales declaradas.
- Estado del repositorio: 0 descargas, 0 likes y creado/actualizado en septiembre de 2026 sin mantenimiento posterior; no hay garantia de soporte ni de que los ficheros permanezcan publicos.
- Model card incompleta: las secciones de descripcion, usos previstos y datos de entrenamiento dicen literalmente "More information needed".
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (los enlaces recuperados trataban sobre la tecla F1 en Windows 10 y no guardan relacion).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amohammed3339/doc-cascade-slowpath
- Modelo base distilbert-base-uncased: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentacion de DistilBERT en HuggingFace: https://huggingface.co/docs/transformers/model_doc/distilbert
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la busqueda web disponible.
