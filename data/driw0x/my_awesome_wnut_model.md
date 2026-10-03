# Driw0x/my_awesome_wnut_model

## Resumen

Driw0x/my_awesome_wnut_model es un modelo de reconocimiento de entidades nombradas (NER) en ingles obtenido por ajuste fino de `distilbert/distilbert-base-uncased` sobre el dataset WNUT 17 de entidades emergentes y poco frecuentes. Lo publica el usuario Driw0x como ejercicio practico del curso de LLM de Hugging Face, con licencia Apache 2.0 y pesos en formato safetensors. El repositorio tiene 0 descargas y 0 likes, y su tamano es de 0,5 GB.

Se trata de un modelo pequeno y especializado: 66.372.877 parametros (cifra reportada en el safetensors, que incluye la cabeza de clasificacion de 13 etiquetas), basado en la arquitectura DistilBERT de 6 capas y ventana de contexto de 512 tokens. La tarea es token classification con etiquetado BIO sobre seis categorias de entidad: corporation, creative work, group, location, person y product. No es un modelo generativo ni conversacional: no soporta tool calling, agentes ni razonamiento multi-paso.

Su relevancia es acotada y de caracter formativo. Sirve como ejemplo reproducible de un pipeline completo de NER (tokenizacion con alineacion de etiquetas a subpalabras, `DataCollatorForTokenClassification`, `Trainer` y evaluacion con seqeval), pero sus metricas de entidad son bajas (F1 de 0,389518) y su evaluacion se realizo sobre el split `test` durante el entrenamiento, por lo que no constituye una referencia limpia de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DistilBERT (destilacion de BERT base uncased), 6 capas, con cabeza de clasificacion de tokens |
| Parametros totales | 66.372.877 (incluye cabeza de token classification) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (limite de posiciones de DistilBERT base uncased) |
| Tipos de cuantizacion | no disponible (no se distribuyen versiones cuantizadas; el repo solo contiene pesos safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers; tambien con config y tokenizer del modelo base) |
| Etiquetas de salida | 13 (esquema BIO: O, B/I-corporation, B/I-creative-work, B/I-group, B/I-location, B/I-person, B/I-product) |
| Pipeline | token-classification |
| Modelo base | distilbert/distilbert-base-uncased |
| Dataset de ajuste | flaitenberger/wnut_17 |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo DistilBERT: 6 capas, 768 dimensiones ocultas, 12 cabezas de atencion y aproximadamente 66 millones de parametros. Sobre el encoder se anade una cabeza lineal de clasificacion de tokens con 13 salidas, con las que se etiqueta cada subtoken segun el esquema BIO de seis categorias de entidad. No emplea mecanismos de atencion lineal, mezcla de expertos ni decodificacion especulativa: es un modelo discriminativo de clasificacion, sin generacion de texto.

El ajuste fino se hizo con la API `Trainer` de Hugging Face sobre el split `train` de `flaitenberger/wnut_17`, con learning rate 2e-5, batch de 16 en entrenamiento y evaluacion, 2 epocas, weight decay 0,01, semilla 42, scheduler lineal y optimizador AdamW (`ADAMW_TORCH_FUSED`, betas 0,9/0,999, epsilon 1e-8). El preprocesado alinea las etiquetas a nivel de palabra de WNUT 17 con los subtokens de DistilBERT: solo el primer subtoken de cada palabra conserva la etiqueta, el resto y los tokens especiales reciben -100 y se excluyen de la perdida; el padding dinamico se gestiona con `DataCollatorForTokenClassification`. La evaluacion se hizo con seqeval. No consta uso de RLHF, DPO ni datos adicionales de instrucciones. Un caveat metodologico relevante: el split `test` se uso para evaluacion durante el entrenamiento, por lo que participa en el desarrollo del modelo y no es un conjunto de prueba intacto; ademas el `validation` split no se utilizo.

## Capacidades

- Reconocimiento de entidades nombradas en ingles sobre texto plano, con 13 etiquetas BIO y seis categorias: corporation, creative work, group, location, person y product.
- Clasificacion a nivel de token con etiquetado de pre- y post-tokenizacion alineado a subpalabras.
- Uso directo mediante `pipeline("ner")` o mediante `AutoTokenizer` + `AutoModelForTokenClassification` con `argmax` sobre los logits.
- Integracion con el ecosistema transformers, incluido `spacy-transformers` o envoltorios propios en Python.
- Generacion de texto: no soportada (modelo encoder de clasificacion).
- Razonamiento, matematicas y codigo: no soportados.
- Vision y audio: no soportados.
- Tool calling y function calling: no soportados.
- Agentes y razonamiento multi-paso: no soportados.
- Capacidades multilingues: no; solo ingles.
- Modo thinking: no disponible.

## Casos de uso

- Extraccion de entidades en articulos y noticias en ingles: el modelo marca personas, organizaciones, localizaciones, productos, obras creativas y grupos, adecuado para indexacion y busqueda semantica en corpus periodisticos donde predominan entidades emergentes y poco frecuentes.
- Enriquecimiento de flujos de monitorizacion de medios: al ejecutarse en CPU con 66 millones de parametros, permite etiquetar grandes volumenes de texto sin GPU, integrandose en tareas batch nocturnas.
- Preanotacion para anotacion humana: el modelo propone etiquetas BIO que un anotador corrige, aprovechando su alta exactitud a nivel de token (0,942114) aunque con recall bajo.
- Deteccion de menciones de marcas y productos: la categoria `product` y `corporation` permiten construir paneles de menciones en resenas y foros en ingles.
- Procesamiento de redes sociales y texto informal: WNUT 17 esta orientado a entidades emergentes en texto ruidoso, por lo que encaja en analisis de tweets y comentarios, siempre con revision humana.
- Componente de linea base docente: sirve como referencia reproducible en cursos y talleres sobre token classification, incluyendo el codigo de alineacion de etiquetas y la evaluacion con seqeval.
- Filtrado previo en pipelines de datos para LLM: usar el modelo como etiquetador barato de entidades y reservar modelos mayores para las muestras ambiguas.
- Enriquecimiento de registros de atencion al cliente: extraer nombres de empresa, producto y localizacion de tickets en ingles para clasificacion o enrutado. No debe usarse como unico criterio de decision automatica dado su F1 de 0,389518.

## Benchmarks y rendimiento

Unicos resultados disponibles: las metricas de evaluacion registradas durante el entrenamiento sobre el split `test` de WNUT 17 (evaluacion con seqeval, realizada durante el propio entrenamiento).

| Epoca | Perdida de validacion | Precision | Recall | F1 | Exactitud (nivel de token) |
|---:|---:|---:|---:|---:|---:|
| 1 | 0,280841 | 0,490000 | 0,227062 | 0,310323 | 0,937839 |
| 2 | 0,271229 | 0,545000 | 0,303058 | 0,389518 | 0,942114 |

Perdida de entrenamiento final: 0,208966. Pasos de entrenamiento: 426. Epocas: 2. Resultado de evaluacion final declarado: perdida 0,271229, precision 0,545000, recall 0,303058, F1 0,389518, exactitud 0,942114. La model card advierte que la exactitud a nivel de token es enganosa porque la mayoria de tokens reciben la etiqueta `O`, y que seqeval emitio un aviso indicando que algunas etiquetas no tenian muestras predichas.

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. No hay datos de MMLU ni de tareas generativas porque el modelo no las soporta.

## Requisitos de hardware

- VRAM estimada: aproximadamente 265 MB en FP32, 133 MB en FP16/BF16 y 66 MB en INT8 para los pesos; el pico real depende del tamano de lote y de la longitud de secuencia (hasta 512 tokens).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; no requiere A100 ni H100. Una GTX 1050 Ti, GTX 1650, T4 o incluso una iGPU moderna sirven para inferencia.
- Cabe en cualquier GPU de consumo: si, incluidas GTX serie 10, RTX 20/30/40 y portatiles con 4 GB de VRAM.
- Inferencia en CPU: viable. Con 66 millones de parametros, es adecuado para servidores sin GPU y para despliegues por lotes.
- Opciones de despliegue: `transformers` (pipeline o inferencia directa), ONNX Runtime con cuantizacion dinamica, Text Generation Inference (soporta token classification), `spacy-transformers`, TorchServe o un servicio FastAPI propio. vLLM no es aplicable a token classification. El soporte de BERT en llama.cpp es limitado y no se documenta para este modelo.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Almacenamiento: el repositorio ocupa 0,5 GB, aunque los pesos en FP32 son de aproximadamente 265 MB.

## Comparativa con modelos similares

No se han publicado en la informacion disponible resultados de benchmarks de este modelo frente a alternativas, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de rendimiento de las alternativas figuran como no disponibles.

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| Driw0x/my_awesome_wnut_model | 66.372.877 | 512 tokens | NER (13 etiquetas BIO, WNUT 17) | apache-2.0 | F1 0,389518 en su propia evaluacion |
| dslim/bert-base-NER | no disponible en la informacion proporcionada | no disponible | NER (CoNLL-2003, 4 categorias) | no disponible | no disponible |
| distilbert/distilbert-base-uncased (modelo base, sin ajustar) | no disponible en la informacion proporcionada | 512 tokens | Modelo de lenguaje enmascarado | apache-2.0 | no aplica a NER sin ajuste |

La comparacion con alternativas ajustadas especificamente sobre WNUT 17 no puede establecerse con los datos disponibles: no se aportan cifras de otros modelos sobre ese dataset en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento bajo a nivel de entidad: F1 de 0,389518 y recall de 0,303058. El modelo deja sin detectar aproximadamente el 70 % de las entidades presentes, por lo que no es apto como unico sistema de extraccion en produccion.
- Solo 2 epocas de entrenamiento, lo que sugiere un ajuste insuficiente y margen claro de mejora.
- La exactitud de 0,942114 a nivel de token es enganosa: mide principalmente la clase mayoritaria `O`.
- Contaminacion metodologica: el split `test` se uso para evaluacion durante el entrenamiento, por lo que las metricas no son una estimacion limpia de generalizacion. Ademas, el split `validation` no se utilizo.
- Sesgos conocidos: no se documentan analisis de sesgo en la informacion disponible. Al entrenarse sobre WNUT 17, hereda los sesgos de anotacion y de dominio de ese corpus (texto en ingles de redes sociales y fuentes informales).
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto libre; el riesgo equivalente es la asignacion de etiquetas erroneas o inventadas sobre tokens que no son entidades.
- Limitacion de idioma: entrenado y evaluado unicamente en ingles. No debe usarse con textos en castellano ni en otros idiomas.
- Limitacion de contexto: ventana maxima de 512 tokens. Los textos mas largos deben truncarse o segmentarse, con el consiguiente riesgo de partir entidades.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se indique los cambios. Debe verificarse tambien la licencia del dataset `flaitenberger/wnut_17` para usos derivados.
- Madurez del artefacto: 0 descargas y 0 likes; la model card esta truncada ("experimenting with Na..."), no hay paper asociado ni validacion externa. Es un ejercicio de curso, no un modelo mantenido.
- Advertencia de produccion: requiere validacion propia sobre el dominio objetivo y umbrales de confianza, y se recomienda combinarlo con revision humana o con un segundo modelo.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion tecnica relevante sobre el modelo (contenido no relacionado y de tipo spam), por lo que no se han utilizado como fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Driw0x/my_awesome_wnut_model
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset de ajuste: https://huggingface.co/datasets/flaitenberger/wnut_17
- Curso de LLM de Hugging Face (origen declarado del ejercicio): no disponible en la informacion proporcionada como enlace explicito
- Paper, repositorio de codigo, demo o blog adicionales: no disponible; la busqueda web no devolvio enlaces relevantes
