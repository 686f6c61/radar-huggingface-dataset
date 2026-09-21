# benjaminjonard/mendako-tagger-onnx

## Resumen

Mendako tagger es un modelo de clasificación de imágenes multietiqueta derivado de `SmilingWolf/wd-eva02-large-tagger-v3`. Lo publica el usuario benjaminjonard en Hugging Face como un grafo ONNX de 1,4 GB, bajo licencia Apache-2.0. Su función es asignar etiquetas al estilo Danbooru (personajes, series, atributos visuales, escenas) a ilustraciones, y está pensado para sustituir al etiquetador original en pipelines que necesitan un vocabulario más amplio y reciente.

La diferencia respecto al modelo base es acotada y explícita: la espina dorsal EVA02-L permanece congelada y sin reentrenar, y solo cambia la capa lineal final, que pasa de 10.861 a 43.636 salidas. De esas 43.636 filas, 649 son pesos del modelo original copiados literalmente, conservadas porque medían mejor que la fila reentrenada en una partición de validación de 2,2 millones de posts. El resultado, según el autor, es al menos tan bueno como el original en cada etiqueta que comparten ambos vocabularios.

Su relevancia práctica es doble: por un lado amplía la cobertura a personajes y etiquetas posteriores al snapshot del modelo original, y por otro se distribuye ya exportado a ONNX junto con `selected_tags.csv` (orden de las salidas) y `thresholds.csv` (punto de operación por etiqueta), lo que elimina el trabajo de exportación y calibración en despliegues de producción. El repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone EVA02-L congelado (sin reentrenar) mas cabeza de clasificacion lineal multietiqueta |
| Parametros totales | no disponible (el autor no publica el recuento; el repositorio ocupa 1,4 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen de 448 x 448 x 3) |
| Tipos de cuantizacion | no disponible; se distribuye un unico grafo ONNX. El tag `base_model:quantized:SmilingWolf/wd-eva02-large-tagger-v3` sugiere una derivacion cuantizada, pero no se documenta esquema ni precision |
| Idiomas soportados | no disponible; el vocabulario de salida son etiquetas de Danbooru en ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX, acompanado de `selected_tags.csv` y `thresholds.csv` |
| Numero de etiquetas de salida | 43.636 |
| Entrada | `image`, forma `[1, 448, 448, 3]`, float32, BGR, valores 0-255, rellenada a cuadrado blanco |
| Salida | `probs`, forma `[1, 43636]`, ya aplicada la sigmoide |
| Modelo base | SmilingWolf/wd-eva02-large-tagger-v3, revision `b25b82a03f7282e41aa2f257a52c7583b710bd1c` |
| Tamano del repositorio | 1,4 GB |
| Fecha de publicacion | 2026-09-21 (segun metadatos de Hugging Face) |

## Arquitectura y entrenamiento

El modelo reutiliza integramente el backbone EVA02-L del etiquetador de SmilingWolf, en la revision `b25b82a03f7282e41aa2f257a52c7583b710bd1c`. Ese backbone no se ha reentrenado: el autor lo describe como congelado. La unica pieza nueva es la capa lineal de clasificacion, que se reentrena sobre posts de Danbooru y pasa de 10.861 a 43.636 salidas, incorporando personajes y etiquetas posteriores a la instantanea del modelo original. La salida es multietiqueta con sigmoide por clase, no softmax, de modo que cada una de las 43.636 dimensiones se interpreta como probabilidad independiente.

El detalle metodologico mas relevante es la mezcla de vocabularios: 649 filas del modelo original se copiaron literalmente en lugar de reentrenarse, porque cada una de ellas medía mejor que su equivalente reentrenada sobre una particion de validacion de 2,2 millones de posts. El autor sostiene que, con esta estrategia, el modelo es al menos tan bueno como el original en toda etiqueta presente en ambos vocabularios. Ademas, el repositorio incluye `thresholds.csv`, con un punto de operacion por etiqueta medido sobre esa misma particion de validacion; la columna `source` indica si el umbral se midio sobre la propia etiqueta o se tomo prestado de su categoria, lo que ocurre cuando la etiqueta tiene muy pocos positivos en validacion. No se documentan en la informacion disponible ni el volumen exacto de tokens/posts de entrenamiento, ni el uso de RLHF o DPO (tecnicas, por otra parte, ajenas a un clasificador de este tipo).

## Capacidades

- Clasificacion de imagenes multietiqueta: genera probabilidades independientes para 43.636 etiquetas de Danbooru, incluyendo personajes, series, atributos fisicos, vestimenta, composicion y escenas.
- Cobertura ampliada de vocabulario: incorpora personajes y etiquetas que no existian en el snapshot del modelo original.
- Compatibilidad garantizada con el vocabulario del modelo base: las 649 filas heredadas conservan el comportamiento del original en esas etiquetas.
- Calibracion por etiqueta: `thresholds.csv` proporciona un punto de operacion medido para cada etiqueta, con indicacion de si el umbral es propio o prestado de la categoria.
- Ejecucion via ONNX: el grafo se distribuye listo para `onnxruntime`, sin necesidad de exportar desde PyTorch.
- Inference de una sola pasada, sin generacion de texto: no es un modelo de lenguaje.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision-lenguaje, audio ni modo "thinking": no se menciona ninguna de estas capacidades en la informacion disponible.

## Casos de uso

- Etiquetado automatico de datasets de ilustracion: aplicar el modelo sobre un corpus de imagenes para generar etiquetas Danbooru y construir metadatos de entrenamiento para modelos de difusion. La cobertura de 43.636 etiquetas es adecuada cuando el dataset incluye obras recientes que el etiquetador original no reconocia.
- Curacion de datasets para LoRA de personajes: filtrar imagenes por etiqueta de personaje concreta usando las probabilidades por etiqueta y los umbrales calibrados de `thresholds.csv`, reduciendo falsos positivos frente a un umbral global unico.
- Indexacion y busqueda en sitios tipo booru: poblar el indice de busqueda por etiquetas a partir de las imagenes subidas, con una sola pasada de inferencia y salida directamente utilizable.
- Moderacion y filtrado de contenido: usar las etiquetas de contenido sensible del vocabulario Danbooru como senal de clasificacion, delegando la decision final en reglas de negocio o en un revisor humano.
- Prellenado de prompts para generacion de imagenes: convertir una imagen de referencia en un conjunto de etiquetas que sirva como prompt inicial para un modelo texto-a-imagen, aprovechando la coincidencia con el vocabulario Danbooru que ya usan muchos prompts.
- Sistemas de recomendacion visual: calcular perfiles de etiquetas por usuario o por obra y generar recomendaciones por similitud de etiquetas, sin necesidad de embeddings adicionales.
- Servicio de inferencia en contenedor: al distribuirse como ONNX, puede desplegarse con `onnxruntime` en CPU o GPU en una funcion serverless o en un microservicio con imagen de contenedor pequena, evitando el stack de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta una afirmacion comparativa cualitativa: las 649 filas heredadas del modelo original midieron mejor que sus equivalentes reentrenadas en una particion de validacion de 2,2 millones de posts, de lo que se deduce que el modelo es al menos tan bueno como `SmilingWolf/wd-eva02-large-tagger-v3` en toda etiqueta compartida. No se proporcionan valores numericos de precision, recall, F1, mAP ni comparaciones cuantitativas con otros etiquetadores.

## Requisitos de hardware

- VRAM estimada para inferencia: el grafo ONNX ocupa 1,4 GB en disco, por lo que se puede asumir un consumo de pesos en el entorno de 1,5 GB, mas activaciones y memoria de trabajo. Una estimacion prudente es 2-4 GB de VRAM en precision completa. Dato no confirmado por el autor.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060 o superiores). Es una estimacion, no un dato publicado.
- Ejecucion en CPU: viable, ya que el repositorio se distribuye como ONNX y `onnxruntime` soporta CPU. No se documentan latencias.
- GPU de clase servidor (A100, H100, L40S): sobredimensionadas para este modelo; solo tendrian sentido para procesar lotes muy grandes en paralelo.
- Opciones de despliegue: `onnxruntime` (Python, C++, C# o Java), `onnxruntime-gpu`, y Azure ML u ONNX Runtime Server como envoltorios de servicio. No aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo por imagen ni de imagenes por segundo.
- Nota de integracion: el grafo necesita obligatoriamente `selected_tags.csv` para interpretar la salida (la fila n del CSV corresponde a la salida n) y `thresholds.csv` para decidir el punto de corte por etiqueta.

## Comparativa con modelos similares

| Modelo | Parametros | Etiquetas de salida | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| benjaminjonard/mendako-tagger-onnx | no disponible (repo de 1,4 GB) | 43.636 | ONNX + CSV auxiliares | Apache-2.0 | Hugging Face, 0 descargas |
| SmilingWolf/wd-eva02-large-tagger-v3 (modelo base) | no disponible | 10.861 | no disponible | Apache-2.0 declarada en su model card | Hugging Face |
| Otros etiquetadores de la familia WD (por ejemplo, variantes SwinV2 o ViT-L) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La comparacion cuantitativa con alternativas no puede completarse: la informacion disponible no incluye recuentos de parametros, resultados de benchmarks ni especificaciones de los otros miembros de la familia. El unico eje verificable es el tamano del vocabulario (43.636 frente a 10.861 del modelo base) y el hecho de que las 649 etiquetas heredadas no deberian degradarse respecto al original.

## Limitaciones y advertencias

- Dominio restringido: el entrenamiento se basa en posts de Danbooru, por lo que el modelo esta sesgado hacia ilustracion y anime. Su comportamiento en fotografia real, documentos o imagenes medicas no esta documentado y probablemente sea pobre.
- Vocabulario especializado: las etiquetas estan en ingles y pertenecen al esquema Danbooru. No hay soporte multilingue ni traduccion de etiquetas.
- Umbrales prestados: cuando una etiqueta tiene pocos positivos en la particion de validacion, su umbral se toma prestado de la categoria. Son etiquetas poco frecuentes y ese punto de operacion puede ser menos fiable.
- Dependencia de dos ficheros externos: la salida del grafo ONNX carece de significado sin `selected_tags.csv`, y sin `thresholds.csv` no hay punto de corte calibrado. Un despliegue que olvide cualquiera de los dos produce resultados silenciosamente incorrectos.
- Preprocesado estricto: la entrada debe ser float32, en orden de canales BGR, rango 0-255 y rellenada a cuadrado blanco de 448 x 448. Cambiar el orden de canales o normalizar los valores degrada el resultado.
- Resolucion fija de 448 x 448: los detalles finos de imagenes de alta resolucion se pierden antes de la clasificacion.
- Riesgo de falsos positivos y negativos en etiquetas raras: el propio autor reconoce que hay etiquetas con muy pocos positivos en validacion, lo que limita la fiabilidad de su calibracion.
- Sin garantias de calidad publicadas: no hay benchmarks, ni evaluacion independiente, ni descargas que permitan inferir adopcion. El modelo es reciente y sin validacion externa.
- Licencia: Apache-2.0 permite uso comercial, pero el repositorio base no publica fichero `LICENSE` en la revision referenciada; el autor decide no copiar un texto de licencia y remitirse a la declaracion de la model card del modelo original. Conviene verificar la cadena de licencias antes de un despliegue comercial.
- Contenido: el vocabulario Danbooru incluye etiquetas de contenido adulto. Cualquier uso en produccion debe incorporar filtrado y cumplimiento normativo propio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/benjaminjonard/mendako-tagger-onnx
- Modelo base: https://huggingface.co/SmilingWolf/wd-eva02-large-tagger-v3
- Revision concreta del modelo base citada por el autor: `b25b82a03f7282e41aa2f257a52c7583b710bd1c`
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo. Las busquedas devolvieron unicamente paginas de ayuda de YouTube TV, configuracion de Windows y ajustes de busqueda de Google, sin relacion con el modelo. No hay papers, blogs, repositorios ni demos adicionales disponibles.
