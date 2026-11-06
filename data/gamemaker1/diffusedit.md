# gamemaker1/diffusedit

## Resumen

DiffusEdit es un sistema de actualizacion de articulos enciclopedicos basado en un modelo de difusion de lenguaje enmascarado congelado, LLaDA-8B-Base, sobre el que se entrenan una serie de clasificadores ligeros que deciden que frases conservar, editar o descartar a partir de evidencia externa. Lo desarrolla el usuario de Hugging Face gamemaker1 y se publica bajo licencia Apache 2.0. El modelo subyacente nunca se entrena: permanece congelado en bfloat16 y los clasificadores, que suman 12,9 millones de parametros, leen sus estados ocultos para orquestar la edicion.

El problema que resuelve es el de la actualizacion de hechos en textos largos: dado un articulo y un conjunto de pasajes de evidencia, el sistema identifica que oraciones quedan obsoletas, que tokens concretos deben reemplazarse y que oraciones dependen de otras modificadas. La edicion final la realiza el propio modelo de difusion rellenando los tokens marcados como desactualizados, con un reranker que selecciona entre los rellenos candidatos.

Es relevante porque demuestra una via alternativa al ajuste fino clasico para actualizacion de conocimiento: en lugar de reentrenar un editor, se aprovechan las representaciones internas de un modelo de difusion congelado y se anaden cabezas de clasificacion muy pequenas. El repositorio ocupa 0,1 GB y esta pensado como material de investigacion reproducible, con codigo de entrenamiento y evaluacion publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion de lenguaje enmascarado (LLaDA-8B-Base) congelado mas clasificadores lineales, MLP y arboles gradient-boosted |
| Parametros totales | 8B (modelo base) + 12,9M (clasificadores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base se ejecuta en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | `classifier.pt` (diccionario guardado con `torch.save`); `rerank.pkl` (scikit-learn) |

## Arquitectura y entrenamiento

El sistema se apoya en LLaDA-8B-Base, un modelo de difusion de lenguaje enmascarado con 32 bloques, ejecutado en bfloat16 sobre la secuencia `[BOS] evidence \n\n article`. La pasada forward se detiene tras el bloque mas profundo que necesita cada clasificador y se conservan los estados ocultos de cada token en los bloques 24 y 32. Cada estado tiene 4096 valores.

Sobre esos estados se entrenan cuatro componentes. El clasificador de oraciones (`sentence/linear-block24`) es una capa lineal de tres salidas (KEEP/EDIT/DROP) con 12,3K parametros que lee la media de los estados de los tokens de la oracion. El clasificador de desactualizacion de tokens (`staleness/attention-block32`) usa cuatro cabezas de atencion sobre los tokens de evidencia mas un slot nulo, seguido de un MLP de dos capas, con 4,5M parametros. El clasificador de cascada (`cascade/consequence`) es un MLP con una capa oculta de 512 unidades sobre la concatenacion de dos estados, su producto y su diferencia absoluta, con 8,4M parametros. El reranker es un `HistGradientBoostingClassifier` de scikit-learn con 200 iteraciones y 15 hojas por arbol, que usa el log-probabilidad medio que LLaDA asigna a cada token del candidato y la probabilidad del verificador de hechos `tals/albert-base-vitaminc-mnli`.

Todos los clasificadores se ajustaron sobre el split de entrenamiento del dataset `gamemaker1/wiki-wrong`, se afinaron sobre validacion y se evaluaron una sola vez sobre test. Los umbrales (`tau_d`, `tau` y `tau_c`) se seleccionaron en validacion y se almacenan dentro de los checkpoints. El bloque 24 se eligio para el clasificador de oraciones porque su macro-F1 de validacion es superior al del bloque 32. Se incluyen controles de evidencia (entrenamiento y evaluacion solo con el articulo, slots de evidencia vaciados y evidencia cruzada entre articulos) cuyos resultados quedan muy por debajo de los obtenidos con la evidencia correcta.

## Capacidades

- Clasificacion de oraciones en tres clases (mantener, editar, descartar) condicionada a evidencia externa.
- Deteccion a nivel de token de que fragmentos de una oracion estan desactualizados.
- Modelado de dependencias entre oraciones: identifica si una oracion debe cambiar porque otra lo hizo.
- Relleno de tokens obsoletos mediante el modelo de difusion LLaDA-8B-Base y seleccion del mejor candidato mediante reranking.
- Verificacion de hechos de los candidatos mediante `tals/albert-base-vitaminc-mnli`.
- Sistema completo de actualizacion de articulos in-place a partir de pasajes de evidencia.
- Solo ingles; no se declaran capacidades multilingues, de codigo, matematicas, vision, audio ni tool calling.

## Casos de uso

- Actualizacion de articulos de Wikipedia a partir de fuentes nuevas: el sistema lee el articulo y la evidencia en una sola pasada, marca oraciones y tokens obsoletos y rellena las correcciones con LLaDA, reduciendo la intervencion manual a la revision del resultado.
- Investigacion en edicion factual basada en recuperacion: sirve como linea base reproducible frente a editores ajustados finamente como `gamemaker1/t5edit`, ya que el modelo base permanece congelado y los clasificadores son ligeros.
- Mantenimiento de bases de conocimiento internas: dado un corpus documental y evidencia actualizada, se pueden detectar afirmaciones desactualizadas en fichas y articulos sin reentrenar un modelo generativo.
- Estudio de representaciones internas de modelos de difusion: los checkpoints por bloque (24 y 32) y los controles de evidencia permiten analizar que informacion codifica cada capa sobre la relacion entre articulo y evidencia.
- Construccion de pipelines de curaduria asistida: el clasificador de cascada puede usarse para propagar cambios entre oraciones dependientes, util en sistemas de edicion semiautomatica con revision humana.
- Evaluacion de verificadores de hechos: el reranker expone la puntuacion de `tals/albert-base-vitaminc-mnli` por candidato, lo que permite auditar su comportamiento en tareas de soporte de evidencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona ficheros `metrics.json`, `sweep.json` y `eval.json` con puntuaciones de validacion y test de cada clasificador, pero no se incluyen los valores numericos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo base LLaDA-8B-Base se ejecuta en bfloat16, lo que en la practica requiere del orden de 16 GB solo para los pesos, mas los estados ocultos de bloques 24 y 32 para todos los tokens de la secuencia; no se especifican cifras exactas.
- GPU recomendadas: no disponible. Por el tamano del modelo base, cabria esperar A100, H100 o GPUs consumer de gama alta con suficiente VRAM, pero no se confirma en la informacion.
- Cabe en consumer GPU: no disponible.
- Opciones de despliegue: la model card solo referencia PyTorch y el codigo en `github.com/gamemaker1/diffusedit` (directorio `code/pipeline`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DiffusEdit (este) | 8B base congelado + 12,9M clasificadores | no disponible | Edicion in-place con modelo de difusion congelado y clasificadores | Apache 2.0 | Hugging Face y GitHub |
| gamemaker1/t5edit | no disponible | no disponible | Editor ajustado finamente (T5) usado como referencia de comparacion | no disponible | Hugging Face |
| GSAI-ML/LLaDA-8B-Base | 8B | no disponible | Modelo de difusion de lenguaje enmascarado base | no disponible | Hugging Face |

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues declaradas.
- El sistema depende de la calidad y pertinencia de los pasajes de evidencia: los controles de evidencia muestran que sin la evidencia correcta el rendimiento cae notablemente.
- Riesgo de alucinacion en los rellenos generados por LLaDA: el reranker mitiga pero no elimina la posibilidad de introducir hechos no soportados por la evidencia.
- Los clasificadores se entrenaron exclusivamente sobre `gamemaker1/wiki-wrong`; su generalizacion a otros dominios o estilos de texto no esta documentada.
- No se publican cifras de benchmarks en la informacion disponible, lo que dificulta evaluar su calidad absoluta frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base LLaDA-8B-Base antes de un uso comercial en produccion.
- No se especifican requisitos de hardware ni latencias, lo que complica la planificacion de despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gamemaker1/diffusedit
- Modelo base: https://huggingface.co/GSAI-ML/LLaDA-8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/gamemaker1/wiki-wrong
- Codigo del sistema: https://github.com/gamemaker1/diffusedit
- Editor de comparacion: https://huggingface.co/gamemaker1/t5edit
- Verificador de hechos: https://huggingface.co/tals/albert-base-vitaminc-mnli
- Modelo de embeddings de la linea base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
