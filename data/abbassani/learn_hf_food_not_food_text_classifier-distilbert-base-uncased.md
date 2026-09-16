# Abbassani/learn_hf_food_not_food_text_classifier-distilbert-base-uncased

## Resumen

El modelo `learn_hf_food_not_food_text_classifier-distilbert-base-uncased` es un clasificador de texto binario desarrollado por el usuario Abbassani y publicado en HuggingFace. Se trata de un ajuste fino (fine-tuning) de `distilbert/distilbert-base-uncased`, un transformer encoder de 6 capas con 66.955.010 parametros, orientado a la tarea de distinguir si un texto esta relacionado con comida ("food") o no ("not food"). La nomenclatura del repositorio sugiere que fue creado como ejercicio de aprendizaje dentro de un flujo de trabajo de HuggingFace, y los metadatos indican fecha de creacion 2026-09-15 con 0 descargas y 0 likes en el momento de la consulta.

El problema que resuelve es acotado: clasificacion de fragmentos cortos de texto en dos clases, con un limite de contexto heredado del modelo base de 512 tokens. No es un modelo generativo ni conversacional: su salida es una distribucion de probabilidad sobre dos etiquetas. Por su tamano (66,9 M de parametros, 0,3 GB de repositorio) es desplegable en CPU y en cualquier GPU consumer, lo que lo hace util como componente de filtrado o enrutado dentro de pipelines mayores.

Su relevancia es limitada fuera del ambito educativo: la model card es autogenerada, no documenta el dataset de entrenamiento, no publica el mapeo de etiquetas, el `model-index` esta vacio y los resultados declarados (accuracy 1.0 sobre un conjunto de evaluacion no descrito) son compatibles con un conjunto de datos muy pequeno. Debe tratarse, por tanto, como un artefacto de demostracion que requiere reentrenamiento y validacion antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT), 6 capas, 12 cabezas de atencion, dimension oculta 768 |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (limite del modelo base `distilbert-base-uncased`) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No disponible en los metadatos; el modelo base esta entrenado principalmente en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tag del repositorio); libreria `transformers` |
| Tarea | `text-classification` (probablemente binaria: food / not food) |
| Modelo base | distilbert/distilbert-base-uncased |
| Tamano del repositorio | 0,3 GB |
| Version de transformers declarada | 5.16.1 |
| Version de PyTorch declarada | 2.11.0+cu128 |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder transformer destilado de BERT-base, con 6 capas en lugar de 12, 768 dimensiones ocultas y 12 cabezas de atencion por capa, sin embeddings de tipo de token y con vocabulario WordPiece de 30.522 entradas. Sobre esta base se anade una cabeza de clasificacion secuencial que proyecta la representacion del token `[CLS]` al numero de clases de la tarea. El autor no documenta la configuracion exacta de la cabeza ni el mapeo `id2label`, por lo que la semantica de las etiquetas debe inferirse del nombre del repositorio.

Respecto al entrenamiento, la model card solo registra los hiperparametros: learning rate 0,0001, batch de entrenamiento y evaluacion de 32, optimizador AdamW con `fused=True` y betas (0,9; 0,999), scheduler lineal, 10 epocas y semilla 42. El historial muestra 7 pasos por epoca (70 pasos totales), lo que implica un conjunto de entrenamiento de aproximadamente 224 ejemplos: un dataset minimo. El conjunto de evaluacion tampoco se describe. No se menciona ningun dataset, proceso de RLHF, DPO ni innovacion tecnica adicional.

La evolucion de la perdida es coherente con sobreajuste en un corpus pequeno: la perdida de entrenamiento baja de 0,3357 (epoca 1) a 0,0006 (epoca 10) y la de validacion de 0,0404 a 0,0005, con accuracy 1,0 constante en todas las epocas.

## Capacidades

- Clasificacion de texto binaria en dos clases (presumiblemente "food" y "not food") sobre fragmentos de hasta 512 tokens.
- Inferencia rapida y de bajo coste: 66,9 M de parametros permiten ejecucion en CPU con latencias de milisegundos por lote.
- Procesamiento por lotes, adecuado para etiquetar grandes volumenes de textos cortos.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multiturno.
- No tiene capacidades multimodales (ni vision ni audio); solo texto.
- Multilingue: no disponible; el modelo base es uncased y entrenado en ingles, por lo que el rendimiento fuera de ese idioma no esta garantizado ni documentado.
- No dispone de modo "thinking" ni de ninguna capacidad especial declarada.

## Casos de uso

- Filtrado de catalogos de productos: clasificar titulos y descripciones de articulos para decidir si pertenecen a la categoria de alimentacion antes de indexarlos en un buscador o recomendar
- Modulacion de resenas y comentarios: etiquetar reseñas de restaurantes o de productos para separar las que hablan de comida de las que tratan otros temas (envio, atencion al cliente), enrutando cada grupo al equipo adecuado
- Enrutado de consultas en asistentes de recetas: dado un mensaje corto del usuario, decidir si la peticion es de indole culinaria y derivarla al modulo de recetas o al modulo general, con un coste de inferencia minimo
- Curacion de datasets para vision por computador: prefiltrar pies de foto y etiquetas textuales asociadas a imagenes para construir un subconjunto de imagenes de comida antes de un etiquetado manual mas caro
- Deteccion de promociones y spam alimentario: senalar publicaciones de contenido gastronomico no deseado en foros o redes, usando el clasificador como primera etapa de un sistema de moderacion por umbral de probabilidad
- Preetiquetado para anotacion humana: generar una primera etiqueta sobre grandes volumenes de texto y reservar la revision manual para los casos con probabilidad cercana al umbral de decision
- Verificacion de menus digitales: comprobar que las descripciones de platos de un menu cumplen el dominio esperado antes de publicarlas en una plataforma de reparto

## Benchmarks y rendimiento

El `model-index` de la model card esta vacio: no hay resultados de MMLU, GLUE, HumanEval, GSM8K ni de ningun otro benchmark estandar. Los unicos datos declarados por el autor son los del conjunto de evaluacion interno, cuyo tamano y composicion no se especifican:

| Metrica | Valor declarado | Conjunto |
|---|---|---|
| Accuracy | 1,0 | Evaluacion (no descrito) |
| Loss de evaluacion | 0,0005 | Evaluacion (no descrito) |
| Loss de entrenamiento final | 0,0006 | Entrenamiento (epoca 10, paso 70) |

Evolucion de la validacion durante el entrenamiento:

| Epoca | Paso | Validation loss | Accuracy |
|---|---|---|---|
| 1,0 | 7 | 0,0404 | 1,0 |
| 2,0 | 14 | 0,0056 | 1,0 |
| 3,0 | 21 | 0,0022 | 1,0 |
| 4,0 | 28 | 0,0013 | 1,0 |
| 5,0 | 35 | 0,0009 | 1,0 |
| 6,0 | 42 | 0,0007 | 1,0 |
| 7,0 | 49 | 0,0006 | 1,0 |
| 8,0 | 56 | 0,0006 | 1,0 |
| 9,0 | 63 | 0,0006 | 1,0 |
| 10,0 | 70 | 0,0005 | 1,0 |

No se han publicado resultados de benchmarks en la informacion disponible. La accuracy de 1,0 con 7 pasos por epoca apunta a un conjunto de evaluacion muy pequeno o a fuga de datos entre entrenamiento y evaluacion, por lo que la cifra no es extrapolable a datos reales.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 268 MB para los pesos (66,9 M de parametros), mas activaciones y memoria del runtime; en la practica cabe en cualquier GPU con 1 GB o mas.
- VRAM estimada en fp16/bf16: aproximadamente 134 MB de pesos.
- VRAM estimada en int8 (cuantizacion no documentada por el autor, factible mediante herramientas externas): aproximadamente 67 MB de pesos.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer sirve, incluidas GTX 1050/1650, RTX 3060, RTX 4090, e incluso aceleradores integrados. A100 o H100 solo tendrian sentido para servir el modelo a muy alta concurrencia en lote.
- Inferencia en CPU: viable con los pesos en fp32 y lotes de decenas de secuencias; es el modo de despliegue mas razonable por coste.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, servidor HTTP generico sobre FastAPI, y las etiquetas del repositorio declaran compatibilidad con `text-embeddings-inference` y `endpoints_compatible` (HuggingFace Inference Endpoints).
- Latencia y throughput: no disponibles. No hay cifras publicadas por el autor ni medidas reproducibles en la informacion proporcionada.
- Almacenamiento: 0,3 GB de repositorio, incluyendo pesos en safetensors.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables de este ajuste concreto. La comparacion se limita a caracteristicas estructurales de los modelos base de la misma categoria:

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (fine-tune de distilbert-base-uncased) | 66,9 M | 512 tokens | Encoder, clasificacion binaria | apache-2.0 | HuggingFace, 0 descargas |
| distilbert/distilbert-base-uncased | 66,9 M | 512 tokens | Encoder (checkpoint base, sin cabeza de tarea) | apache-2.0 | HuggingFace, ampliamente usado |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Encoder (12 capas) | apache-2.0 | HuggingFace, ampliamente usado |
| FacebookAI/roberta-base | 125 M | 512 tokens | Encoder (12 capas, BPE) | MIT | HuggingFace, ampliamente usado |
| distilroberta-base | 82 M | 512 tokens | Encoder destilado (6 capas) | apache-2.0 | HuggingFace, ampliamente usado |

En rendimiento sobre benchmarks publicos, este modelo no aporta datos, mientras que los modelos base anteriores cuentan con resultados GLUE documentados en sus respectivas model cards. En terminos de coste de inferencia, DistilBERT es aproximadamente un 40 % mas pequeno que BERT-base y un 60 % mas rapido, segun la documentacion original de DistilBERT; no hay mediciones propias en la informacion disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: se desconoce la composicion, el dominio y el idioma de los datos, por lo que no es posible evaluar sesgos ni cobertura.
- Accuracy de 1,0 declarada: con 7 pasos por epoca se trata casi con certeza de un conjunto de evaluacion minusculo; la metrica no es fiable ni representativa.
- Sobreajuste probable: la perdida de validacion cae a 0,0005 y la de entrenamiento a 0,0006, con accuracy perfecta desde la primera epoca.
- Mapeo de etiquetas no documentado: no se especifica el orden de las clases ni su significado exacto, solo se infiere del nombre del repositorio.
- Idioma: el modelo base es uncased y de entrenamiento ingles; no hay evidencia de rendimiento en castellano.
- Limite de contexto de 512 tokens: los textos mas largos deben truncarse, con perdida de informacion.
- Segmentacion por tokens WordPiece: fragmentos malformados, jerga o nombres de productos poco frecuentes pueden degradar la clasificacion.
- Ausencia de datos de calibracion: no se puede asumir que las probabilidades de salida esten bien calibradas para fijar umbrales en produccion.
- Licencia apache-2.0: permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y el fichero NOTICE si existe; no impone restricciones de uso adicionales.
- Artefacto autogenerado: la model card incluye el aviso de que fue generada automaticamente por `Trainer` y que no ha sido revisada; tambien declara versiones de framework (transformers 5.16.1, PyTorch 2.11.0) que dificultan reproducir exactamente el entorno.
- Sin datos de seguridad: no hay evaluaciones de robustez, comportamientos adversarios ni filtros de contenido.
- Uso en produccion: requiere reentrenamiento con un dataset propio etiquetado, validacion cruzada y recalibracion antes de desplegarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Abbassani/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentacion de Transformers para clasificacion de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- No se han encontrado en la busqueda web enlaces relevantes sobre este modelo: los resultados devueltos corresponden a contenidos no relacionados (calendario de los Dallas Cowboys) y no aportan informacion tecnica.
