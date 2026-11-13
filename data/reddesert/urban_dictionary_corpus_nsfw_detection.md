# reddesert/urban_dictionary_corpus_nsfw_detection

## Resumen

`urban_dictionary_corpus_nsfw_detection` es un clasificador binario de texto desarrollado por el usuario `reddesert` y publicado en Hugging Face. Su tarea concreta consiste en predecir si una cadena corta, insertada en un prompt de generacion de imagenes, puede adquirir una lectura sexual, gore o de disgusto. No es un clasificador de toxicidad ni de discurso de odio: la unidad de clasificacion es una cadena aislada de como maximo 64 tokens, sin contexto circundante.

El modelo se construye mediante fine-tuning del backbone `answerdotai/ModernBERT-large`, un encoder transformer de tipo ModernBERT en su variante inglesa. La salida es una probabilidad calibrada `p(reject)` mediante temperature scaling ajustado sobre el conjunto de validacion, y la decision final se toma aplicando un umbral configurable en `thresholds.json`. La implementacion de referencia es `predict.py`, que lee tanto `calibrator.json` como `thresholds.json`.

La relevancia del modelo es acotada pero especifica: sirve como filtro de seguridad para pipelines de generacion de imagenes, no para moderacion de comunidades o conversaciones. Es un modelo exclusivamente en ingles, entrenado sobre entradas de Urban Dictionary, y su model card advierte explicitamente de que no debe reutilizarse para moderar el habla de las personas. El repositorio ocupa 1,6 GB y la licencia es `openmdw-1.0`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large, fine-tuning) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens (longitud maxima de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles unicamente |
| Licencia | `openmdw-1.0` |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del backbone `answerdotai/ModernBERT-large`, un encoder transformer de la familia ModernBERT en su variante inglesa, y se somete a un fine-tuning supervisado para clasificacion binaria. La cabeza de clasificacion produce una probabilidad que posteriormente se calibra mediante temperature scaling, con parametros almacenados en `calibrator.json` y ajustados sobre el conjunto de validacion. La semilla de entrenamiento declarada es 13.

El conjunto de entrenamiento contiene 1.770.752 filas, de las cuales 189.705 son positivas (aproximadamente un 10,7 %). Se aplicaron pesos de clase `{'0': 0.5599934726798128, '1': 4.667120002108537}` para compensar el desbalance, sin subsampling de negativos. Los grupos de etiquetas en conflicto se excluyeron del entrenamiento y de las metricas. Las filas truncadas a 64 tokens fueron 101 en train, 22 en validacion y 14 en test. Los datos proceden de entradas de Urban Dictionary en ingles y derivados; no se aplico equilibrado ni etiquetado por idioma. Las metricas declaradas en la model card son average precision, ROC AUC y Brier score, aunque los valores numericos no se incluyen en la informacion disponible.

## Capacidades

- Clasificacion binaria de cadenas cortas (hasta 64 tokens) en `reject` o `clean` segun la probabilidad calibrada.
- Deteccion de lecturas sexuales, gore o de disgusto en cadenas destinadas a prompts de generacion de imagenes.
- Etiquetado deliberado de terminos de identidad como `gay` y `queer` como `reject`, por politica del autor, dado que un modelo de imagen renderizaria la lectura sexual.
- Manejo de juegos de palabras, dobles sentidos, nombres de bandas e idiomatismos: si una cadena tiene lectura limpia y lectura rechazable, prevalece la rechazable.
- Calibracion de probabilidades mediante temperature scaling, con umbral de decision configurable.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un clasificador.
- No soporta vision, audio ni modo thinking.
- Cobertura multilingue: no disponible; el modelo es solo en ingles.

## Casos de uso

- Filtrado de prompts en pipelines de generacion de imagenes: el modelo se coloca como paso previo al envio del prompt al modelo de difusion y rechaza cadenas con lectura sexual, gore o de disgusto, reduciendo la probabilidad de generar contenido no deseado.
- Moderacion de entradas de usuario en herramientas de escritura creativa: permite marcar terminos ambiguos antes de que se incorporen a descripciones o titulos, con la advertencia de que solo debe aplicarse a cadenas, no a habla de personas.
- Saneamiento de datasets de prompts: se puede ejecutar sobre un corpus de prompts de generacion de imagenes para etiquetar y separar las entradas con lectura rechazable antes del entrenamiento o de la evaluacion.
- Filtro de nombres de proyectos, bandas o marcas en catalogos: dado que el modelo contempla lecturas por juego de palabras o doble sentido, sirve para detectar nombres que podrian renderizarse de forma no deseada en un modelo de imagen.
- Preprocesado en sistemas de generacion de avatares o ilustraciones: se aplica sobre la cadena descriptiva del usuario antes de la sintesis, con un umbral ajustable segun la tolerancia del producto.
- Auditoria de taxonomias de terminos: al clasificar listas de palabras y expresiones, permite identificar que terminos tienen lectura rechazable bajo la politica del autor y revisar manualmente los casos limite.
- Evaluacion comparativa de filtros de seguridad: sirve como referencia para comparar con otros clasificadores en la misma tarea, siempre que se respete su dominio (ingles, cadenas cortas, Urban Dictionary).

## Benchmarks y rendimiento

La model card declara el uso de las metricas average precision, ROC AUC y Brier score, pero no se han publicado los valores numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 1,6 GB en safetensors, lo que da una referencia del orden de magnitud de los pesos en precision original.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Cabe en GPU de consumo: no disponible; el tamano del repositorio (1,6 GB) sugiere que podria caber en GPUs de consumo con suficiente VRAM, pero no se confirma.
- Opciones de despliegue: la libreria declarada es `transformers`; el modelo es compatible con endpoints. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria.

## Limitaciones y advertencias

- No es un clasificador de toxicidad ni de discurso de odio; no debe usarse para moderar lo que dicen las personas.
- Etiqueta deliberadamente terminos de identidad como `gay` y `queer` como `reject`; este comportamiento es intencionado en el contexto de generacion de imagenes y seria inaceptable en un sistema de moderacion de habla.
- Los insultos sin lectura sexual, gore o de disgusto no se etiquetan de forma fiable como `reject`; la pasada de etiquetado de hate speech nunca se ejecuto.
- Modelo exclusivamente en ingles: la entrada no inglesa esta fuera de distribucion y produce puntuaciones no fiables, con falsos positivos por fragmentos que se parecen a palabras inglesas y falsos negativos por falta de representacion de contenido NSFW en otros idiomas.
- Los scripts no latinos caen en tokens a nivel de byte o fragmentos, con puntuaciones inestables que dependen de la forma superficial y no del significado; la transliteracion, los diacriticos y el texto con mezcla de scripts se comportan de forma impredecible.
- Incluso en ingles, Urban Dictionary esta sesgado hacia ingles estadounidense, registros informales y juveniles de internet y subculturas concretas; el ingles formal, otras variedades nacionales y el texto no procedente de internet estan infrarrepresentados.
- Las puntuaciones solo estan calibradas para datos que se parecen al conjunto de entrenamiento.
- No debe usarse sobre documentos largos, conversaciones multi-turno ni nada que requiera contexto.
- No detecta como tal hate speech, acoso, violencia, autolesion ni contenido ilegal.
- No se debe desplegar sobre texto no ingles sin evaluar antes con datos etiquetados en ese idioma; si se necesita cobertura multilingue, hay que hacer fine-tuning con datos multilingues y anadir una compuerta de identificacion de idioma delante del modelo.
- Restricciones de licencia para uso comercial: la licencia es `openmdw-1.0`; no se detallan en la informacion disponible las condiciones concretas de uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reddesert/urban_dictionary_corpus_nsfw_detection
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
