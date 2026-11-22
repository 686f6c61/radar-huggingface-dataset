# bhai2000/allergen-dietary-tagger-distilbert

## Resumen

El modelo `bhai2000/allergen-dietary-tagger-distilbert` es un clasificador de texto multi-etiqueta desarrollado por el usuario `bhai2000` y publicado en Hugging Face. Se trata de un fine-tuning de `distilbert/distilbert-base-uncased` orientado a la deteccion de alergenos alimentarios y atributos dieteticos en listas de ingredientes y formulaciones de recetas. El modelo resuelve un problema concreto del ambito de la seguridad alimentaria: dada una descripcion textual de ingredientes, predecir de forma independiente la presencia de seis alergenos mayores (leche, gluten, cacahuete, frutos secos, huevo y soja) y dos atributos dieteticos (vegano y vegetariano).

Arquitectonicamente es un transformer encoder de tipo DistilBERT, con 66.959.624 parametros totales, derivado de la destilacion de BERT-base. El modelo se distribuye en formato safetensors con un tamano de repositorio de 0,3 GB, lo que lo hace muy ligero para despliegue en CPU o GPU de gama baja. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia del modelo radica en su calibracion asimetrica de umbrales: usa un umbral bajo (0,30) para alergenos, priorizando el recall y minimizando los falsos negativos, y un umbral alto (0,70) para las etiquetas dieteticas, priorizando la precision. Esta decision de diseno es coherente con el coste asimetrico de los errores en seguridad alimentaria: es mucho mas grave no detectar un alergeno que marcar uno de mas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.959.624 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT-base admite hasta 512 tokens por defecto, dato no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de texto multi-etiqueta |
| Etiquetas de salida | contains_milk, contains_gluten, contains_peanuts, contains_tree_nuts, contains_eggs, contains_soy, vegan, vegetarian |
| Modelo base | distilbert/distilbert-base-uncased |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder de 6 capas obtenido mediante destilacion de BERT-base (12 capas). Sobre la representacion del token `[CLS]` se anade una cabeza de clasificacion con ocho salidas independientes, cada una con su propia sigmoid. La funcion de perdida empleada es `BCEWithLogitsLoss` con `problem_type="multi_label_classification"`, lo que permite que varias etiquetas sean verdaderas simultaneamente (por ejemplo, un producto puede contener leche y gluten a la vez, y ser vegetariano pero no vegano).

El conjunto de entrenamiento consta de 16.000 ejemplos de entrenamiento, 2.000 de validacion y 2.000 de test. Los datos proceden de una combinacion deduplicada de listas de ingredientes de productos envasados (`openfoodfacts/product-database`) y formulaciones de recetas (`datahiveai/recipes-with-nutrition`). La innovacion tecnica destacable es la calibracion asimetrica de umbrales de decision: 0,30 para alergenos (orientado a recall) y 0,70 para etiquetas dieteticas (orientado a precision). No se menciona en la model card el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo por otra parte esperable en un clasificador y no en un modelo generativo.

## Capacidades

- Clasificacion multi-etiqueta de texto en ingles: predice simultaneamente ocho etiquetas binarias independientes.
- Deteccion de seis alergenos mayores: leche, gluten, cacahuete, frutos secos, huevo y soja.
- Deteccion de dos atributos dieteticos: vegano y vegetariano.
- Salidas probabilisticas por etiqueta (sigmoid), lo que permite ajustar umbrales en funcion del caso de uso.
- Calibracion asimetrica de umbrales ya incorporada en el diseno del modelo.
- No soporta tool calling ni function calling (es un clasificador, no un modelo generativo).
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de capacidades de vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Etiquetado automatico de productos en plataformas de e-commerce alimentario: el modelo procesa la lista de ingredientes en texto y devuelve las etiquetas de alergenos y dieteticas, permitiendo generar filtros de busqueda y badges de producto de forma masiva sin intervencion manual.
- Verificacion de cumplimiento en etiquetado: dado un texto de ingredientes, comprobar si la declaracion de alergenos del fabricante es coherente con el contenido detectado, como paso previo a revision humana.
- Construccion de bases de datos dieteticas: clasificar lotes de recetas o ingredientes de `openfoodfacts` u otras fuentes para poblar catalogos con atributos vegano/vegetariano y alertas de alergenos, aprovechando el umbral alto de 0,70 para reducir falsos positivos dieteticos.
- Filtrado previo en apps de nutricion personalizada: dado el perfil de alergias de un usuario, el modelo etiqueta cada receta candidata y descarta las incompatibles antes de mostrarlas, con el umbral de 0,30 priorizando no perder ningun alergeno.
- Moderacion de contenido en comunidades de recetas: detectar automaticamente si una receta publicada contiene alergenos no declarados por el autor y sugerir la correccion de la etiqueta.
- Preprocesado para pipelines de analisis nutricional: enriquecer registros de ingredientes con etiquetas estructuradas que alimenten modelos posteriores de recomendacion o analisis de riesgo, dado el bajo coste computacional del modelo (0,3 GB, 67 M de parametros).
- Auditoria de catalogos de proveedores: procesar descripciones de ingredientes recibidas de proveedores en distintos formatos y normalizarlas a un conjunto fijo de etiquetas de alergenos antes de integrarlas en el sistema interno.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de test reservado (n = 2.000):

| Metrica | Valor |
|---|---|
| Test Macro F1 | 0,9427 |
| Test Micro F1 | 0,9489 |
| Test Macro Recall | 0,9408 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible, ni metricas desagregadas por etiqueta, ni resultados de ROC-AUC pese a que la model card declara esa metrica entre las monitorizadas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB solo para pesos (67 M de parametros), mas activaciones; en la practica cabe holgadamente en cualquier GPU con 1 GB o mas.
- VRAM estimada en fp16: aproximadamente 0,14 GB para pesos.
- GPU recomendadas: no requiere GPU dedicada; funciona correctamente en CPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es mas que suficiente.
- Cabe en GPU consumer: si, en practicamente todas, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), `Optimum`/ONNX Runtime para aceleracion en CPU, `TorchScript`, `vLLM` no aplica (no es generativo), `llama.cpp`/`Ollama` no aplican (no hay pesos GGUF publicados).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en CPU y muy alto en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| bhai2000/allergen-dietary-tagger-distilbert | 67 M | no disponible | Clasificacion multi-etiqueta de alergenos y dieta | Apache 2.0 | safetensors |
| distilbert-base-uncased (base) | 66 M | 512 tokens | Modelo base generico (no afinado para esta tarea) | Apache 2.0 | safetensors |
| bert-base-uncased | 110 M | 512 tokens | Modelo base generico | Apache 2.0 | safetensors |

No se dispone de informacion sobre otros clasificadores publicos especificos de alergenos alimentarios con los que comparar directamente. Las alternativas mas cercanas serian modelos encoder genericos (BERT, RoBERTa, DeBERTa) que requeririan fine-tuning propio sobre un dataset equivalente para alcanzar un rendimiento comparable en esta tarea.

## Limitaciones y advertencias

- Solo soporta ingles: los textos de ingredientes en otros idiomas (castellano, frances, aleman) no estan cubiertos y el rendimiento en esos idiomas no esta documentado.
- Riesgo de alucinacion de etiquetas: al ser un clasificador multi-etiqueta, puede marcar alergenos no presentes si el texto contiene terminos ambiguos o negaciones (por ejemplo, "sin leche" podria activar la etiqueta de leche si el modelo no ha aprendido a manejar negaciones).
- Sesgo de dominio: entrenado sobre `openfoodfacts` y recetas de `datahiveai`; el rendimiento puede degradarse en textos de ingredientes con formatos muy distintos (etiquetas regulatorias, abreviaturas, listas muy cortas).
- Umbrales fijados por el autor: el umbral de 0,30 para alergenos favorece el recall a costa de precision, lo que puede generar falsos positivos en produccion; conviene recalibrar segun el caso de uso.
- No sustituye una validacion regulatoria: no debe usarse como unico mecanismo para declarar ausencia de alergenos en un producto destinado a consumo; requiere revision humana.
- Limitaciones de contexto: aunque DistilBERT-base admite hasta 512 tokens, la model card no confirma el maximo exacto ni como se truncan listas de ingredientes largas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; no hay informacion sobre responsabilidad en caso de fallo en deteccion de alergenos.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bhai2000/allergen-dietary-tagger-distilbert
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset de productos envasados: https://huggingface.co/datasets/openfoodfacts/product-database
- Dataset de recetas con nutricion: https://huggingface.co/datasets/datahiveai/recipes-with-nutrition
