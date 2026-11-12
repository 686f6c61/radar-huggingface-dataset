# fireviewer/convnext-tiny-alert-categories-v2

## Resumen

ConvNeXt-Tiny · six catégories d'alerte es un modelo de vision por computador desarrollado por el usuario `fireviewer` y publicado en Hugging Face bajo el identificador `fireviewer/convnext-tiny-alert-categories-v2`. Se trata de un clasificador de imagenes basado en la arquitectura ConvNeXt-Tiny, entrenado para distinguir seis categorias de alerta relacionadas con incendios: fuego util para humanos, origen domestico, origen sospechoso, fuego en carretera o entorno urbano, incendio forestal en area natural y una clase negativa. El modelo forma parte del ecosistema FireViewer, orientado aparentemente a la deteccion y clasificacion de incendios a partir de imagenes.

El repositorio tiene un tamano de 0,3 GB y fue creado el 11 de noviembre de 2026, con la model card indicando explicitamente que el modelo se encuentra en estado de entrenamiento (`Statut : training`). El corpus de entrenamiento referenciado es `fireviewer/fireviewer_fire_smoke_flame_v3_native`, en la revision `8c8b197fa1c928217529a04bff434fb70a66614e`. La model card menciona ficheros auxiliares como `data_receipt.json`, `gpu.json`, `training_setup.json` y metricas de validacion y test, aunque no se proporcionan sus valores en la informacion disponible.

Por el momento no se han publicado resultados de benchmarks, especificaciones detalladas de parametros, contexto ni datos de rendimiento en la informacion proporcionada. La relevancia actual del modelo radica en su aplicacion potencial a sistemas de alerta temprana de incendios, aunque su estado de entrenamiento y la ausencia de metricas publicas limitan su uso en produccion sin una evaluacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (red neuronal convolucional) |
| Parametros totales | no disponible (ConvNeXt-Tiny tiene aproximadamente 28,6 M de parametros en su configuracion estandar, pero no se confirma en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de clasificacion de imagenes) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (el repositorio ocupa 0,3 GB; no se especifica el formato) |

## Arquitectura y entrenamiento

La arquitectura es ConvNeXt-Tiny, una red neuronal convolucional pura inspirada en los transformers visuales, con bloques de convolucion depthwise y normalizacion LayerNorm. El modelo esta configurado como clasificador de imagenes con seis clases de salida: `human_useful_fire`, `domestic_origin`, `suspect_origin`, `fire_road_urban`, `forest_natural_area_wildfire` y `negative`.

El entrenamiento se ha realizado sobre el corpus `fireviewer/fireviewer_fire_smoke_flame_v3_native` (revision `8c8b197fa1c928217529a04bff434fb70a66614e`). La model card indica que se conservan los checkpoints `best` y `last` cuando una epoca ha sido evaluada, y que una interrupcion antes de la primera validacion no produce un falso best. No se dispone de informacion sobre el numero de tokens, composicion del dataset, tecnicas de aumento de datos, RLHF/DPO ni innovaciones tecnicas adicionales. El estado del modelo es de entrenamiento en curso, por lo que los pesos publicados pueden no corresponder a una version final.

## Capacidades

- Clasificacion de imagenes en seis categorias de alerta relacionadas con incendios.
- Distincion entre fuego util para humanos, origen domestico, origen sospechoso, fuego en carretera o entorno urbano, incendio forestal en area natural y clase negativa.
- Capacidad de discriminacion de contexto de escena (urbano vs. forestal) segun las clases definidas.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision generativa, tool calling, agentes, multilingueismo ni modos especiales (thinking mode, audio, etc.).
- Modelo exclusivamente de vision; no procesa texto ni audio.

## Casos de uso

- Deteccion temprana de incendios forestales: el modelo puede clasificar imagenes de camaras de vigilancia en areas naturales como `forest_natural_area_wildfire`, permitiendo activar alertas automaticas en sistemas de monitorizacion.
- Clasificacion de origen de incendios en entornos urbanos: distingue entre `fire_road_urban`, `domestic_origin` y `suspect_origin`, lo que puede apoyar la investigacion de causas en servicios de emergencia.
- Filtrado de falsos positivos en sistemas de alerta: la clase `negative` permite descartar imagenes que no contienen incendios, reduciendo el ruido en pipelines de alerta.
- Analisis de imagenes para seguros y peritajes: clasificacion de siniestros por origen (domestico, sospechoso) para priorizar revisiones humanas.
- Monitorizacion de infraestructuras criticas: integracion en camaras de carreteras o tuneles para detectar fuego en entornos urbanos y viales.
- Investigacion sobre deteccion de incendios: uso del modelo como baseline o componente en estudios academicos sobre clasificacion de fuego y humo, dado que el corpus de entrenamiento esta referenciado publicamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de metricas de validacion y test, pero no se proporcionan sus valores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para una ConvNeXt-Tiny en precision FP32 se estiman aproximadamente 0,1-0,2 GB de VRAM para los pesos, mas memoria para activaciones e imagenes de entrada; en FP16 o INT8 el requisito seria menor. Estas cifras son estimaciones generales de la arquitectura, no confirmadas para este modelo concreto.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente para inferencia de ConvNeXt-Tiny; GPUs de datacenter (A100, H100) no son necesarias para inferencia.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM.
- Opciones de despliegue: no se documentan en la informacion proporcionada. Al ser un modelo de vision, podria desplegarse con frameworks como PyTorch, ONNX Runtime o TensorRT, pero no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fireviewer/convnext-tiny-alert-categories-v2 | no disponible (ConvNeXt-Tiny estandar ~28,6 M) | no aplica | no disponible | BSD-3-Clause | Hugging Face |
| ConvNeXt-Tiny (ImageNet-1K) | ~28,6 M | no aplica | ~82,1% top-1 en ImageNet-1K (dato de referencia de la arquitectura, no de este modelo) | MIT (repo oficial) | Publico |
| ResNet-50 | ~25,6 M | no aplica | ~76,1% top-1 en ImageNet-1K (referencia) | BSD-3-Clause (variantes) | Publico |
| EfficientNet-B0 | ~5,3 M | no aplica | ~77,1% top-1 en ImageNet-1K (referencia) | Apache 2.0 | Publico |

No se dispone de datos de rendimiento especificos para este modelo que permitan una comparativa cuantitativa con alternativas de la misma tarea (clasificacion de incendios). Los valores de los modelos de referencia corresponden a sus resultados publicados en ImageNet-1K y no son directamente comparables con la tarea de clasificacion de alertas de incendio.

## Limitaciones y advertencias

- Estado de entrenamiento: la model card indica explicitamente `Statut : training`, por lo que los pesos publicados pueden no ser definitivos y su rendimiento no esta validado.
- Ausencia de metricas publicas: no se han publicado resultados de validacion o test, lo que impide evaluar la calidad real del modelo.
- Sesgos conocidos: no documentados. Al entrenarse sobre un corpus especifico (`fireviewer_fire_smoke_flame_v3_native`), el modelo puede estar sesgado hacia las condiciones de captura, geografia y tipos de escena presentes en dicho corpus.
- Riesgo de alucinacion: en clasificacion de imagenes, el equivalente es la asignacion erronea de clases (falsos positivos y falsos negativos), especialmente en imagenes fuera de distribucion. No se dispone de datos sobre tasas de error.
- Limitaciones de contexto o idioma: no aplica contexto de texto ni idiomas; el modelo es exclusivamente visual.
- Restricciones de licencia: licencia BSD-3-Clause, que permite uso comercial con atribucion y mantiene la clausula de no endorsement. No se documentan restricciones adicionales.
- Caveat para produccion: no se recomienda su uso en produccion sin una evaluacion propia sobre el dominio objetivo, dado el estado de entrenamiento y la falta de metricas publicas.
- El repositorio de 0,3 GB sugiere pesos en algun formato no especificado; conviene verificar el formato antes de integrarlo en pipelines.

## Enlaces

- Hugging Face: https://huggingface.co/fireviewer/convnext-tiny-alert-categories-v2
- Corpus de entrenamiento referenciado: `fireviewer/fireviewer_fire_smoke_flame_v3_native` (revision `8c8b197fa1c928217529a04bff434fb70a66614e`), disponible presumiblemente en Hugging Face bajo el mismo autor.
- Resultado de busqueda web no relevante: https://www.promoalert.com/magasin/lidl-combs-la-ville-horaires-telephone-adresse-21-4987-11912-0-0-0.html (no relacionado con el modelo).
