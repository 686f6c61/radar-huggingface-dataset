# ruals/bge-small-en-v1.5-conll2003-ner

## Resumen

El modelo `ruals/bge-small-en-v1.5-conll2003-ner` es un ajuste fino del modelo de embeddings `BAAI/bge-small-en-v1.5` para la tarea de reconocimiento de entidades nombradas (NER, token classification). Lo publica el usuario ruals en HuggingFace y su arquitectura es la de un transformer encoder de tipo BERT, mucho mas pequena que los modelos generativos: 33.215.625 parametros en total. El pipeline declarado es `token-classification`, no generacion de texto.

El modelo no se ha disenado para conversar ni generar lenguaje, sino para clasificar tokens de un texto de entrada en categorias de entidad (persona, organizacion, localizacion, miscelanea). Esto lo situa en la categoria de modelos de NLP clasico, utiles para pipelines de extraccion de informacion, preprocesado de datos y enriquecimiento de documentos. El nombre del repositorio apunta al dataset CoNLL-2003, aunque la model card indica explicitamente "on an unknown dataset" y no detalla la composicion del conjunto de entrenamiento.

Su relevancia practica radica en que es un modelo muy ligero (repo de 0.3 GB) con licencia MIT, lo que permite desplegarlo en hardware modesto y usarlo comercialmente sin restricciones de licencia complejas. Los resultados declarados por el autor en el conjunto de evaluacion son F1 0.9188, precision 0.9085 y recall 0.9293, cifras competitivas para un encoder de este tamano en NER.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia BERT), ajustado para token classification |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base BAAI/bge-small-en-v1.5 esta limitado a 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF declaradas) |
| Idiomas soportados | no disponible en la model card; el modelo base esta orientado a ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0.3 GB |
| Pipeline | token-classification |
| Modelo base | BAAI/bge-small-en-v1.5 |

## Arquitectura y entrenamiento

El modelo parte de `BAAI/bge-small-en-v1.5`, un encoder de la familia BERT desarrollado por el Beijing Academy of Artificial Intelligence (BAAI) dentro de la serie BGE (BAAI General Embedding). Ese modelo base esta pensado para embeddings de frases y recuperacion densa, con vectores de 384 dimensiones y orientacion al ingles. Sobre esa base, el autor ha anadido una cabeza de clasificacion de tokens y ha realizado un ajuste fino supervisado para NER.

Segun la model card, el entrenamiento uso el optimizador AdamW con betas=(0.9, 0.999), epsilon 1e-08, learning rate 5e-05, scheduler lineal, batch de 8 tanto en entrenamiento como en evaluacion, semilla 42 y `num_epochs: 30` declarado en los hiperparametros. Sin embargo, la tabla de resultados de entrenamiento solo recoge 7 epocas (hasta el step 8750), con una perdida de validacion que se estabiliza y empieza a repuntar tras la epoca 4, lo que sugiere posible sobreajuste. No se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO (no aplicables a un modelo de clasificacion). El dataset figura como "unknown" en la model card, aunque el nombre del repositorio hace referencia a CoNLL-2003.

Versiones de framework declaradas: Transformers 4.50.0, PyTorch 2.7.1+cu128, Datasets 3.4.1 y Tokenizers 0.21.1.

## Capacidades

- Reconocimiento de entidades nombradas: clasificacion de tokens en etiquetas de tipo PER (persona), ORG (organizacion), LOC (localizacion) y MISC (miscelanea), segun el esquema tipico de CoNLL-2003.
- Clasificacion de secuencias a nivel de token: salida de etiquetas BIO/BIOES por token, apta para extraccion de spans de entidad.
- Procesamiento de textos en ingles (segun el modelo base), con posible transferencia limitada a otros idiomas no documentada.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: es un modelo encoder de clasificacion, no un LLM generativo.
- No soporta tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- No dispone de modo "thinking", vision ni audio.
- Capacidades multilingues: no documentadas; la model card no declara idiomas.

## Casos de uso

- Extraccion de entidades en documentos legales o contratos: el modelo identifica nombres de personas, organizaciones y localizaciones en clausulas, permitiendo poblar bases de datos estructuradas sin intervencion manual.
- Enriquecimiento de articulos de prensa: deteccion automatica de personas y organizaciones mencionadas para construir grafos de conocimiento o sistemas de recomendacion de noticias relacionadas.
- Preprocesado de pipelines de RAG: etiquetar entidades en documentos antes de indexarlos, de forma que el sistema de recuperacion pueda filtrar o ponderar por organizacion, ubicacion o persona.
- Anonimizacion y cumplimiento normativo: deteccion de nombres de personas y entidades en textos para su seudonimizacion antes de almacenar o compartir datos (RGPD, por ejemplo), reduciendo el riesgo de exposicion de datos personales.
- Analisis de opiniones y monitorizacion de marca: extraer organizaciones y productos citados en resenas o redes sociales para agregar menciones por entidad.
- Indexacion y busqueda semantica en corpus cientificos o tecnicos: identificacion de autores, instituciones y lugares para permitir busquedas facetadas.
- Alimentacion de sistemas de extraccion de relaciones: la salida NER sirve como paso previo para tareas de relation extraction y construccion de ontologias.
- Procesamiento por lotes en entornos con recursos limitados: al ser un encoder de 33 M de parametros, permite clasificar grandes volumenes de texto en CPU o GPUs pequenas con coste bajo.

## Benchmarks y rendimiento

La model card declara los siguientes resultados en el conjunto de evaluacion (modelo final, epoca 7):

| Metrica | Valor |
|---|---|
| Loss | 0.0995 |
| Precision | 0.9085 |
| Recall | 0.9293 |
| F1 | 0.9188 |
| Accuracy | 0.9825 |

Evolucion por epoca declarada por el autor:

| Epoca | Step | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1.0 | 1250 | 0.0981 | 0.8417 | 0.8973 | 0.8686 | 0.9751 |
| 2.0 | 2500 | 0.0856 | 0.8979 | 0.9122 | 0.9050 | 0.9802 |
| 3.0 | 3750 | 0.0822 | 0.9059 | 0.9219 | 0.9138 | 0.9820 |
| 4.0 | 5000 | 0.0874 | 0.9137 | 0.9249 | 0.9193 | 0.9826 |
| 5.0 | 6250 | 0.1002 | 0.9071 | 0.9271 | 0.9170 | 0.9822 |
| 6.0 | 7500 | 0.0975 | 0.9084 | 0.9244 | 0.9163 | 0.9816 |
| 7.0 | 8750 | 0.0995 | 0.9085 | 0.9293 | 0.9188 | 0.9825 |

No se han publicado resultados adicionales de benchmarks (por ejemplo MMLU, HumanEval o GSM8K) en la informacion disponible, ni comparaciones directas con otros modelos NER. El bloque `model-index` de la model card esta vacio (`results: []`).

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 33 M de parametros en fp32, el peso ocupa aproximadamente 130-140 MB. Con activaciones y overhead de runtime, la inferencia cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna sirve; no requiere A100 ni H100. Una GTX 1650, RTX 3060, RTX 4090 o incluso GPUs integradas con soporte CUDA son suficientes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer de los ultimos anos.
- Tambien es viable en CPU para inferencia por lotes; el cuello de botella sera el throughput, no la memoria.
- Opciones de despliegue: HuggingFace Transformers (pipeline `token-classification`), vLLM no aplica al no ser un modelo generativo, ONNX Runtime para exportacion optimizada, o TorchScript. llama.cpp y Ollama estan orientados a modelos generativos y no son el canal natural para este modelo, salvo conversion manual no documentada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ruals/bge-small-en-v1.5-conll2003-ner | 33.215.625 | no disponible | NER (token classification) | MIT | HuggingFace |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 tokens | Embeddings / retrieval | MIT | HuggingFace |
| therem/bge-small-en-v1.5-conll2003-ner | no disponible | no disponible | NER | no disponible | HuggingFace |
| trsh2310/bge-small-en-v1.5-conll2003-ner | no disponible | no disponible | NER | no disponible | HuggingFace |
| dslim/bert-base-NER | ~110 M | 512 tokens | NER | MIT | HuggingFace |

La busqueda web revela la existencia de al menos otros dos repositorios con el mismo nombre de ajuste (`therem/bge-small-en-v1.5-conll2003-ner` y `trsh2310/bge-small-en-v1.5-conll2003-ner`), lo que sugiere ajustes equivalentes de la misma base. No hay datos comparativos de rendimiento entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card del autor no documenta sesgos; como todo modelo entrenado sobre corpus en ingles, es probable que herede sesgos de genero, origen o profesion presentes en los datos, pero no hay mediciones disponibles.
- Riesgo de alucinacion: al ser un clasificador y no un generador, no produce texto libre, por lo que el riesgo es de falsos positivos o falsos negativos en las etiquetas, no de invencion de contenido.
- Limitacion de idioma: el modelo base esta orientado al ingles; no hay evidencia de buen rendimiento en castellano ni en otros idiomas.
- Limitacion de contexto: heredada del encoder base (tipicamente 512 tokens); textos mas largos requeriran ventanas o chunking, con posible perdida de entidades en los bordes.
- La model card declara que el dataset de entrenamiento es "unknown" y no documenta la composicion, las etiquetas exactas ni el esquema BIO utilizado, lo que dificulta reproducir el ajuste.
- Discrepancia documental: los hiperparametros indican 30 epocas, pero la tabla de resultados solo cubre 7; conviene verificar el checkpoint real.
- La perdida de validacion empeora a partir de la epoca 4, lo que apunta a sobreajuste y a que el checkpoint final podria no ser el optimo.
- Licencia MIT: permite uso comercial y modificacion con atribucion, sin copyleft; es una de las licencias mas permisivas, aunque conviene revisar la licencia del dataset original (CoNLL-2003 tiene sus propias condiciones de uso para investigacion).
- El repositorio tiene 0 descargas y 0 "likes", por lo que no hay validacion de la comunidad ni evidencia de uso en produccion.
- Para produccion, conviene evaluar el modelo sobre un conjunto propio del dominio objetivo, ya que no hay benchmarks externos publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ruals/bge-small-en-v1.5-conll2003-ner
- Modelo base BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
- Repositorio GitHub de la serie BGE: https://github.com/abis330/bge-small-en-v1.5/
- Ficha de bge-small-en-v1.5 en SourceForge: https://sourceforge.net/projects/bge-small-en-v1-5/
- Ficha de bge-small-en-v1.5 en OpenSourcesAI: https://opensourcesai.com/models/bge-small-en-v1-5/
- Ajuste alternativo therem/bge-small-en-v1.5-conll2003-ner: https://huggingface.co/therem/bge-small-en-v1.5-conll2003-ner
- Ajuste alternativo trsh2310/bge-small-en-v1.5-conll2003-ner: https://huggingface.co/trsh2310/bge-small-en-v1.5-conll2003-ner
