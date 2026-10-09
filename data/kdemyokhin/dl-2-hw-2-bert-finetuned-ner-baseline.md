# kdemyokhin/dl-2-hw-2-bert-finetuned-ner-baseline

# kdemyokhin/dl-2-hw-2-bert-finetuned-ner-baseline

## Resumen

`kdemyokhin/dl-2-hw-2-bert-finetuned-ner-baseline` es un modelo de reconocimiento de entidades nombradas (NER) obtenido mediante fine-tuning del encoder `BAAI/bge-small-en-v1.5` para la tarea de token classification. Lo publica el usuario kdemyokhin en HuggingFace como baseline de un trabajo academico (el identificador "dl-2-hw-2" sugiere una practica de un curso de deep learning). Es, por tanto, un modelo pequeno y especializado, no un modelo generativo.

El modelo tiene 33.215.625 parametros, lo que lo situa en la gama de los encoders ligeros tipo BERT-small, y su repositorio ocupa aproximadamente 0,1 GB en formato safetensors. Se distribuye bajo licencia MIT y es compatible con el pipeline `token-classification` de la libreria Transformers. Su relevancia practica es la de un punto de partida reproducible para tareas de extraccion de entidades: entrenable en una sola GPU consumer y desplegable en CPU con latencias bajas.

Conviene subrayar que la model card es practicamente un artefacto autogenerado por el `Trainer`: el autor no documenta el dataset de entrenamiento, el esquema de etiquetas ni los usos previstos. Los unicos datos sustantivos son las metricas de evaluacion (F1 0,8899 y accuracy 0,9786 en la mejor epoca) y la tabla de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (heredada del modelo base BAAI/bge-small-en-v1.5) |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base BAAI/bge-small-en-v1.5 usa 512 tokens de posicion maxima |
| Tipos de cuantizacion | no disponible en la model card; al ser un encoder BERT de 33 M es cuantizable a INT8 dinamico con PyTorch u ONNX Runtime |
| Idiomas soportados | no disponible en la model card; el modelo base es monolingue en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio tambien compatible con el ecosistema PyTorch de Transformers) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional de la familia BERT, heredada integramente de `BAAI/bge-small-en-v1.5` (un modelo de embeddings de frases en ingles). Sobre esa base se anade una cabeza de clasificacion por token, que es lo que convierte el encoder en un etiquetador de secuencias para NER. No hay innovaciones arquitectonicas propias: ni atencion lineal, ni mezcla de expertos, ni decodificacion especulativa.

Los hiperparametros de entrenamiento si estan documentados: learning rate 1e-05, batch de entrenamiento 32, batch de evaluacion 128, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 15 epocas configuradas. Se ejecuto con Transformers 4.50.0, PyTorch 2.11.0+cu128, Datasets 3.4.1 y Tokenizers 0.21.4. La tabla de resultados solo registra 12 epocas (paso 3756), lo que sugiere una parada temprana o un corte del entrenamiento antes de completar las 15 epocas previstas. No se documenta ni el dataset, ni el numero de tokens vistos, ni si hubo ajuste por RLHF/DPO (no tendria sentido en esta tarea).

Los datos de entrenamiento y evaluacion figuran como "More information needed" en la model card. Esto implica que se desconoce el corpus, el idioma real de las anotaciones y el conjunto de etiquetas (tipicamente PER, ORG, LOC, MISC en esquemas tipo CoNLL o BIO).

## Capacidades

- Etiquetado de secuencias por token (token classification) para reconocimiento de entidades nombradas; es su unica funcion.
- Extraccion de entidades a nivel de token en textos en ingles, siempre que el esquema de etiquetas coincida con el usado en el fine-tuning (desconocido).
- Codificacion contextual de frases de hasta 512 tokens, heredada del encoder base.
- No soporta generacion de texto: no es un modelo causal ni dispone de cabeza de lenguaje.
- No dispone de tool calling ni de function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo "thinking", vision, audio ni capacidades multimodales.
- Cobertura multilingue: no disponible; el modelo base es solo ingles.

## Casos de uso

- Extraccion de entidades en documentacion tecnica o articulos en ingles: se pasa el texto por el pipeline `token-classification` y se agrupan los tokens con la estrategia de agregacion adecuada (simple, first, max o average) para reconstruir entidades completas.
- Preprocesado de corpus para sistemas de recuperacion de informacion: usar las entidades detectadas como metadatos indexables (por ejemplo, nombres de organizaciones o lugares) antes de alimentar un motor de busqueda o un RAG.
- Anonimizacion y pseudonimizacion de textos: detectar nombres de personas y organizaciones para enmascararlos antes de compartir documentos, como capa ligera previa a una revision humana.
- Baseline academico y reproduccion de experimentos: sirve como referencia para comparar arquitecturas o estrategias de fine-tuning en una practica o trabajo de clase, dado que el entrenamiento cabe en recursos modestos.
- Servicio de inferencia en CPU dentro de una intranet: por su tamano (33 M de parametros) puede servirse con ONNX Runtime o PyTorch en un contenedor pequeno, sin GPU, con coste marginal bajo.
- Etiquetado asistido para anotadores humanos: el modelo propone entidades sobre lotes grandes de texto y los revisores corrigen, reduciendo el tiempo de anotacion en proyectos de creacion de datasets.
- Filtrado o enrutado de documentos: clasificar y extraer entidades de tickets o correos en ingles para dirigirlos al equipo correspondiente segun la organizacion o el lugar mencionado.

## Benchmarks y rendimiento

El `model-index` del repositorio no contiene resultados (`results: []`). Los unicos datos disponibles son los de la model card, medidos sobre un conjunto de evaluacion no descrito. La mejor epoca registrada es la 12 (paso 3756):

| Metrica | Valor (epoca 12) |
|---|---|
| Loss de evaluacion | 0,0923 |
| Precision | 0,8692 |
| Recall | 0,9116 |
| F1 | 0,8899 |
| Accuracy | 0,9786 |

Evolucion durante el entrenamiento (epocas seleccionadas):

| Epoca | Paso | Loss de validacion | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1 | 313 | 0,3862 | 0,4400 | 0,5485 | 0,4883 | 0,9180 |
| 4 | 1252 | 0,1426 | 0,8250 | 0,8728 | 0,8482 | 0,9717 |
| 8 | 2504 | 0,1023 | 0,8536 | 0,9015 | 0,8769 | 0,9769 |
| 12 | 3756 | 0,0923 | 0,8692 | 0,9116 | 0,8899 | 0,9786 |

No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks publicos de NER (CoNLL-2003, OntoNotes) en la informacion disponible, y no se pueden comparar directamente las cifras anteriores con otros modelos porque se desconoce el conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 el peso del modelo ocupa aproximadamente 133 MB; en FP16, unos 66 MB. Con overhead de activaciones y batch pequeno, la inferencia cabe holgadamente por debajo de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; por citar modelos concretos, RTX 3060, RTX 4090, T4, A100 o H100 funcionan sin problema, aunque estan muy sobredimensionadas para este modelo.
- GPU consumer: si, cabe en practicamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida; tambien es viable en CPU.
- Opciones de despliegue: pipeline `token-classification` de Transformers, exportacion a ONNX Runtime (con posible cuantizacion INT8 dinamica), TorchScript/TorchServe, NVIDIA Triton y envoltorios HTTP propios. No procede `llama.cpp`, Ollama ni pesos GGUF (no hay versiones GGUF publicadas y el modelo no es generativo). vLLM no es una via adecuada para un encoder de clasificacion de 33 M.
- Latencia y throughput: no hay datos publicados. Al no existir mediciones en la informacion disponible, no se puede afirmar un valor concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento |
|---|---|---|---|---|---|
| kdemyokhin/dl-2-hw-2-bert-finetuned-ner-baseline | 33,2 M | no disponible (base: 512 tokens) | NER (token classification) | MIT | F1 0,8899 en un conjunto de evaluacion no descrito |
| BAAI/bge-small-en-v1.5 (modelo base) | ~33 M | 512 tokens | Embeddings de frases / recuperacion | MIT | No aplica: no es un modelo NER; su rendimiento en MTEB no esta en la informacion disponible |
| dslim/bert-base-NER | ~110 M | 512 tokens | NER (PER, ORG, LOC, MISC) | MIT | No disponible en la informacion proporcionada; evaluado habitualmente sobre CoNLL-2003, lo que impide comparacion directa con este modelo |

La comparacion cuantitativa no es posible con los datos disponibles: el conjunto de evaluacion de este modelo no esta identificado, por lo que su F1 de 0,8899 no es directamente equiparable a cifras publicadas sobre CoNLL-2003 u OntoNotes.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica "More information needed" en descripcion, usos previstos y datos de entrenamiento. No se puede saber que etiquetas predice ni con que dominio se ajusto.
- Idiomas: el modelo base `BAAI/bge-small-en-v1.5` esta entrenado en ingles. Usarlo con texto en castellano u otros idiomas producira resultados poco fiables, aunque no hay declaracion explicita del autor.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe el riesgo de falsos positivos y negativos en la deteccion de entidades, especialmente en dominios alejados de los datos de entrenamiento.
- Sesgos: no hay evaluacion de sesgos ni de equidad; los modelos NER entrenados en corpus no balanceados suelen rendir peor sobre nombres de determinados origenes o sobre entidades poco frecuentes.
- Sobreajuste: la curva de validacion se aplana a partir de la epoca 7-8 (F1 0,8772 -> 0,8899), con ganancias marginales en las ultimas epocas, lo que sugiere poco margen de mejora y posible sobreajuste al conjunto de evaluacion.
- Incoherencia de configuracion: la model card declara 15 epocas, pero la tabla solo llega a la epoca 12 (paso 3756). Conviene verificar el estado final del entrenamiento antes de reutilizarlo.
- Uso comercial: la licencia MIT lo permite sin restricciones relevantes, pero el modelo base tambien es MIT, por lo que no hay obligaciones adicionales de atribucion mas alla de las habituales de la licencia.
- Produccion: con 15 descargas y 0 likes, no hay evidencia de uso en produccion ni de validacion independiente. Para un sistema real conviene elegir un checkpoint NER con dataset y etiquetas documentados, o reentrenar este sobre datos propios y anotados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kdemyokhin/dl-2-hw-2-bert-finetuned-ner-baseline
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios de codigo ni demos asociados al modelo.
