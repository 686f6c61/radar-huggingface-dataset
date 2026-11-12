# goncayldz/clinc150-distilbert-student

## Resumen

El modelo `goncayldz/clinc150-distilbert-student` es un checkpoint de tipo DistilBERT (arquitectura transformer encoder-only) publicado en Hugging Face por el usuario goncayldz y orientado a clasificacion de texto. Por su nombre, el identificador sugiere que se trata de un modelo "estudiante" destilado a partir de un modelo mayor entrenado sobre el dataset CLINC150, un corpus de referencia para deteccion de intenciones (intent classification) en asistentes conversacionales, con 150 intenciones de dominio abierto y una clase adicional de fuera de dominio. Sin embargo, la model card publicada es la plantilla automatica de Hugging Face y no confirma ni el dataset, ni el proceso de destilacion, ni los hiperparametros.

El modelo tiene 67.069.591 parametros (segun los pesos en safetensors) y un tamano de repositorio de 0,3 GB. Es, por tanto, un modelo pequeno, adecuado para tareas de clasificacion de secuencias con requisitos de latencia bajos y despliegue en CPU o GPU de gama baja. La relevancia practica de este tipo de checkpoints esta en su uso como componente de enrutamiento de intenciones dentro de pipelines de agentes y asistentes, donde un clasificador ligero evita invocar un LLM grande para decidir la siguiente accion.

No obstante, la informacion disponible es muy limitada: cero descargas, cero likes, licencia no declarada, idiomas no declarados y ausencia total de resultados de evaluacion. Cualquier uso en produccion requeriria una validacion independiente del checkpoint antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder-only, segun el tag `distilbert`) |
| Parametros totales | 67.069.591 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT admite hasta 512 tokens como maximo arquitectonico, no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion dinamica a int8 posible via PyTorch, no documentada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a DistilBERT, un transformer encoder-only derivado de BERT mediante destilacion de conocimiento: se reduce el numero de capas a la mitad y se entrena el estudiante para reproducir las distribuciones de salida del profesor, lo que da lugar a un modelo mas pequeno y rapido con una perdida de rendimiento acotada en tareas de comprension del lenguaje. El identificador del repositorio indica que este checkpoint concreto es un estudiante destilado, presumiblemente sobre CLINC150, pero la model card no aporta detalles sobre el profesor utilizado, el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de ajuste fino posterior.

No se dispone de informacion sobre el procedimiento de entrenamiento: ni numero de epocas, ni tasa de aprendizaje, ni precision mixta, ni si hubo data augmentation o balanceo de clases. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.), lo cual es coherente con un encoder-only clasico orientado a clasificacion. El unico metadato fiable es el recuento de parametros y el formato de pesos.

## Capacidades

- Clasificacion de texto: la pipeline declarada es `text-classification`, por lo que el modelo emite una etiqueta y una puntuacion de confianza para una secuencia de entrada.
- Deteccion de intenciones (presunta): el nombre del checkpoint apunta a CLINC150, un benchmark de clasificacion de intenciones en dominios multiples; si el entrenamiento se completo, el modelo cubriria las 150 intenciones de dicho corpus mas la clase de fuera de dominio.
- Embeddings de texto: el tag `text-embeddings-inference` sugiere compatibilidad con el servidor TEI de Hugging Face, aunque un modelo de clasificacion no produce embeddings de frase de forma nativa sin usar la salida del encoder.
- Tool calling / function calling: no disponible; no es una capacidad de un encoder-only de clasificacion.
- Razonamiento multi-paso y agentes: no soportado de forma nativa; solo puede actuar como clasificador auxiliar dentro de un agente.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: el modelo puede clasificar la utterance del usuario en una de las intenciones predefinidas y derivar la peticion al handler o al LLM correspondiente, reduciendo coste y latencia frente a invocar un modelo generativo para cada turno.
- Pre-filtrado en pipelines RAG: usar la etiqueta predicha para seleccionar la base de conocimiento o el indice vectorial adecuado antes de recuperar documentos, lo que mejora la precision de la recuperacion.
- Moderacion y triaje de tickets de soporte: clasificar automaticamente tickets entrantes por categoria de intencion para asignarlos a colas especializadas, siempre que se valide el checkpoint sobre datos propios.
- Deteccion de fuera de dominio: si el entrenamiento respeta la clase `out_of_scope` de CLINC150, el modelo puede descartar consultas no cubiertas por el asistente y responder con un mensaje de fallback.
- Clasificacion de comandos en interfaces de voz o chatbots de dispositivos: al ser un modelo de 67 M de parametros, puede ejecutarse en CPU o en GPUs de gama baja con latencia de milisegundos, lo que lo hace apto para entornos embebidos.
- Generacion de features para un clasificador de segunda etapa: extraer la distribucion de probabilidad sobre las 151 clases como caracteristica de entrada para un modelo posterior o para calcular umbrales de confianza.
- Evaluacion comparativa de tecnicas de destilacion: servir como estudiante de referencia en experimentos academicos sobre compresion de modelos de clasificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1, latencia ni comparaciones con otros checkpoints, y el repositorio no presenta descargas ni evaluaciones de la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,27 GB solo para pesos (67 M de parametros x 4 bytes); en fp16, unos 0,13 GB. La memoria real incluye activaciones y overhead del runtime, pero en cualquier caso queda muy por debajo de 1 GB para lotes pequenos.
- GPU recomendadas: cualquier GPU moderna es suficiente; una NVIDIA T4, L4 o RTX 3060 cubren el caso con holgura. En A100 o H100 el modelo esta sobredimensionado en cuanto a capacidad y el cuello de botella sera el preprocesado, no el calculo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers` con pipeline de `text-classification`, TorchServe, FastAPI con ONNX Runtime, y el servidor `text-embeddings-inference` (tag presente en el repositorio, aunque su idoneidad para clasificacion debe verificarse). Tambien es posible exportar a ONNX o cuantizar dinamicamente a int8 con PyTorch.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goncayldz/clinc150-distilbert-student | 67,1 M | no disponible | Clasificacion de texto | no disponible | Hugging Face |
| distilbert-base-uncased | 66,9 M | 512 tokens | Clasificacion / embeddings | Apache 2.0 | Hugging Face |
| bert-base-uncased | 110 M | 512 tokens | Clasificacion / embeddings | Apache 2.0 | Hugging Face |
| MiniLM-L6 (p. ej. all-MiniLM-L6-v2) | 22,7 M | 256 tokens | Embeddings de frase | Apache 2.0 | Hugging Face |

La comparativa se limita a arquitecturas y tamanos porque no hay datos de rendimiento del modelo analizado. Frente a `distilbert-base-uncased`, el checkpoint de goncayldz no aporta garantias de licencia ni evaluacion publica, por lo que en produccion seria preferible partir del modelo base y ajustarlo internamente sobre CLINC150 salvo que se valide este checkpoint.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla automatica; no se especifican datos de entrenamiento, hiperparametros, licencia ni idiomas.
- Licencia no declarada: no puede asumirse uso comercial permitido; es un riesgo legal para cualquier despliegue en producto.
- Sin evaluacion publica: no hay metricas de exactitud, F1 ni calibracion, ni validacion por parte de la comunidad (cero descargas y cero likes en el momento de la consulta).
- Riesgo de sesgo desconocido: al no documentarse la composicion del dataset ni el proceso de filtrado, no es posible evaluar sesgos por dominio, genero o grupo demografico.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de sobreconfianza: un clasificador puede asignar alta probabilidad a clases incorrectas en entradas fuera de distribucion si no se calibra el umbral.
- Limitacion de contexto: como encoder BERT-like, la longitud maxima arquitectonica es de 512 tokens; utterances mas largas requeririan truncamiento.
- Cobertura idiomatica incierta: CLINC150 esta mayoritariamente en ingles; el uso en castellano no esta garantizado ni documentado.
- Recomendacion: validar el checkpoint sobre un conjunto de test propio y, si el rendimiento es satisfactorio, considerar reentrenar desde `distilbert-base-uncased` para obtener una licencia clara y trazabilidad del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goncayldz/clinc150-distilbert-student
- Paper de DistilBERT (referenciado en los tags del repositorio): https://arxiv.org/abs/1910.09700
- Documentacion de DistilBERT en transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Dataset CLINC150 (referencia por nombre del checkpoint): https://huggingface.co/datasets/clinc_oos
- Paper de CLINC150 (Larson et al., 2019): https://arxiv.org/abs/1909.02027
- Servidor Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
