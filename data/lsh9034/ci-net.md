# lsh9034/ci-net

## Resumen

CI-Net es un modelo de aprendizaje profundo orientado a la prediccion inmediata (nowcasting) de la iniciacion de conveccion (convection initiation, CI) a partir de datos de satelite y radar. El repositorio, publicado por el usuario lsh9034 en HuggingFace, contiene el codigo completo de procesamiento, etiquetado, preprocesado, entrenamiento, inferencia y validacion, junto con un ejemplo de datos de entrada y los directorios de resultados. La etiqueta `simvp` del repositorio apunta a que el nucleo del modelo se basa en SimVP (SimVP: Simpler yet Better Video Prediction), una familia de arquitecturas de prediccion de video espacio-temporal de tipo encoder-translator-decoder convolucional, lo que encaja con la tarea de predecir la evolucion de campos meteorologicos en rejilla.

La relevancia del modelo es de nicho pero clara: la iniciacion de conveccion es un fenomeno de corta duracion y alta incertidumbre, y su prediccion a muy corto plazo (0-6 horas tipicamente en nowcasting) es uno de los problemas abiertos de la prediccion meteorologica operativa. Un modelo que combine imagenes de satelite y reflectividad de radar para anticipar donde y cuando se disparara la conveccion tiene aplicacion directa en avisos tempranos de tormentas severas, precipitacion intensa y fenomenos asociados.

Ahora bien, la informacion publicada es muy escasa: la model card es esencialmente una guia de estructura de directorios y ejecucion de scripts, sin ficha tecnica del modelo. No se declara el numero de parametros, la resolucion de las rejillas de entrada, el periodo temporal de entrenamiento, el volumen del dataset, ni resultados cuantitativos de validacion. El repositorio pesa 4,8 GB, lo que sugiere que incluye pesos entrenados y/o datos preprocesados, pero no permite deducir el tamano del modelo. El repositorio cuenta con 0 descargas y 0 likes en el momento de la consulta y fue creado y actualizado el 13 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SimVP (segun la etiqueta del repositorio); no se detalla en la model card |
| Parametros totales | no disponible |
| Longitud de contexto | no aplicable (modelo de prediccion espacio-temporal sobre rejillas, no un modelo de lenguaje con ventana de tokens); no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card esta en ingles y coreano, pero es documentacion, no una capacidad del modelo) |
| Licencia | other; el repositorio remite a `LICENSE_CODE` para el codigo y a `LICENSE_MODEL_DATA` para los pesos y los datos |
| Formato de pesos | no disponible; el repositorio se declara como PyTorch y almacena los ficheros del modelo bajo el directorio `result/` |
| Dominio | meteorologia; iniciacion de conveccion |
| Modalidades de entrada | satelite y radar (alineados en la etapa `data_preparing`) |
| Tarea | nowcasting / prediccion espacio-temporal de video |
| Libreria | pytorch |
| Tamano del repositorio | 4,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-13 / 2026-09-13 |
| Region declarada | us |

## Arquitectura y entrenamiento

La unica referencia arquitectonica disponible es la etiqueta `simvp`. SimVP es una familia de modelos de prediccion de video que prescinde de mecanismos de atencion y de recurrentes complejas: usa un encoder convolucional que comprime los fotogramas de entrada a un espacio latente, un translator (habitualmente convoluciones agrupadas o bloques de convolucion con conexiones residuales) que modela la dinamica temporal en ese espacio latente, y un decoder que reconstruye los fotogramas futuros. En meteorologia esta familia se ha aplicado a nowcasting de radar y satelite porque opera sobre tensores de rejilla (T, C, H, W) de forma natural. Conviene subrayar que CI-Net no publica diagrama de bloques, numero de capas, canales ni funcion de perdida, por lo que cualquier detalle adicional seria especulacion.

El pipeline de entrenamiento si queda descrito funcionalmente en la model card. Consta de cinco etapas secuenciales: `data_preparing` (lectura y alineacion de las entradas de satelite y radar), `labeling` (creacion de etiquetas de nubes), `final_preprocess` (conversion de los campos preparados en ficheros de entrada del modelo), `training` (entrenamiento e inferencia) y `validation` (creacion de objetivos de validacion y calculo de metricas). Cada etapa tiene sus ficheros Python en `src` y sus ficheros YAML de configuracion y scripts shell en `run`. No se indica el numero de tokens, el volumen del dataset de entrenamiento, su composicion, la resolucion espacial y temporal, el numero de epocas, ni si se aplicaron tecnicas de ajuste como RLHF o DPO (tecnicas que, por otra parte, no son propias de este tipo de modelo). Tampoco se documenta ninguna innovacion tecnica especifica mas alla del uso de SimVP sobre datos fusionados de satelite y radar.

## Capacidades

- Prediccion espacio-temporal: el modelo esta disenado para predecir la evolucion futura de campos meteorologicos en rejilla a partir de observaciones pasadas.
- Deteccion y anticipacion de iniciacion de conveccion: la etiqueta `convection-initiation` y la etapa de `labeling` (creacion de etiquetas de nubes) indican que el objetivo es identificar el inicio de la conveccion profunda.
- Fusion de datos heterogeneos: el pipeline alinea entradas de satelite y de radar antes del modelado, por lo que el modelo consume ambas fuentes de forma conjunta.
- Generacion de etiquetas: incluye codigo para derivar etiquetas de nubes a partir de los datos crudos, lo que permite construir objetivos de entrenamiento y validacion.
- Validacion orientada a objetos: la etapa `validation` distingue entre creacion de objetivos (`targets.sh`) y validacion de objetos (`validation.sh`), lo que sugiere evaluacion basada en objetos convectivos y no solo en metricas por pixel, aunque no se detallan las metricas concretas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, modo de pensamiento, vision natural, audio ni ninguna otra capacidad propia de modelos generativos de lenguaje. Se trata de un modelo especializado de prediccion meteorologica.

## Casos de uso

- Prediccion inmediata de tormentas convectivas: el modelo anticipa en que celdas de la rejilla se iniciara la conveccion en los siguientes fotogramas, lo que permite emitir avisos de tormenta con mayor antelacion que los metodos basados en umbrales de reflectividad.
- Vigilancia radar-satelite operativa: integrado en un centro de prediccion, el pipeline de alineacion satelite-radar permite generar campos de entrada en tiempo casi real y producir predicciones de CI como producto complementario al radar.
- Aviso temprano de precipitacion intensa y granizo: al anticipar la iniciacion convectiva, el modelo aporta informacion util para alertas hidrologicas y para la gestion de eventos de alto impacto en infraestructuras criticas.
- Aeropuertos y aviacion: la conveccion profunda es un riesgo directo para la operacion aerea; un modelo capaz de anticipar su inicio ayuda a planificar rutas y ventanas de operacion con margen adicional respecto a la observacion en tiempo real.
- Agricultura de precision y gestion de riego: la prediccion a muy corto plazo de la conveccion permite ajustar calendarios de riego y tratamientos, evitando aplicaciones que una tormenta inminente podria lavar.
- Energia renovable y redes electricas: la conveccion afecta a la generacion solar y a la demanda; disponer de predicciones a escala de decenas de minutos a pocas horas mejora el despacho y la prevision de rampas.
- Investigacion en prediccion meteorologica: el codigo completo de procesamiento, entrenamiento y validacion permite reproducir experimentos, sustituir el backbone SimVP por alternativas (por ejemplo, basadas en atencion o en modelos fundacionales meteorologicos) y comparar resultados.
- Reentrenamiento con datos locales: como el repositorio incluye todo el pipeline, un grupo de investigacion puede sustituir `raw_data` por su propio archivo de satelite y radar y reentrenar el modelo para otra region o periodo.
- Docencia y prototipado en ciencias de la atmosfera: la separacion en cinco etapas con scripts shell y YAML hace del repositorio una base razonable para practicas de nowcasting con aprendizaje profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la etapa `validation` calcula metricas de validacion, pero no incluye ninguna tabla, cifra ni comparacion con otros metodos. Tampoco se describen las metricas empleadas (por ejemplo, CSI, POD, FAR o IoU sobre objetos convectivos).

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se conoce el numero de parametros, y por tanto no puede estimarse el consumo de memoria de forma fiable. El unico dato objetivo es que el repositorio completo ocupa 4,8 GB, cifra que incluye codigo, datos de ejemplo, resultados, pesos y salidas de inferencia, y que no equivale al tamano del modelo.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no disponible. En tareas comparables de prediccion de video sobre rejillas (SimVP y variantes), es habitual que modelos de rango medio entren en GPUs de consumo con 8-24 GB de VRAM, pero esto es una extrapolacion general del campo y no un dato de CI-Net.
- Opciones de despliegue: el repositorio proporciona un flujo propio basado en PyTorch con scripts shell y configuracion YAML (`train.sh`, `inference.sh`, `targets.sh`, `validation.sh`) y un `environment.yml` de Conda. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, servidores que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.
- Nota practica: cualquier planificacion de recursos debe partir de una medicion directa tras inspeccionar los pesos del directorio `result/` y ejecutar la inferencia en el hardware objetivo.

## Comparativa con modelos similares

No disponible. La informacion publicada no incluye parametros, contexto, rendimiento ni alternativas, y no se han proporcionado datos de benchmarks, por lo que cualquier tabla comparativa con otros modelos de nowcasting seria especulativa. Como referencia metodologica, la familia SimVP (SimVP, OpenSTL y variantes) es el punto de partida natural con el que comparar, junto con enfoques de nowcasting de radar basados en convoluciones recurrentes y en transformers espacio-temporales, pero no se dispone de cifras de CI-Net para establecer la comparacion.

## Limitaciones y advertencias

- Opacidad de la ficha: no se publican parametros, resolucion, periodo de entrenamiento, volumen de datos ni metricas, lo que impide evaluar la calidad del modelo antes de ejecutarlo.
- Riesgo de sobreajuste regional: al no documentarse la procedencia y cobertura de los datos de entrenamiento, se desconoce si el modelo generaliza a otras regiones, estaciones o regimenes de conveccion distintos de los del conjunto de entrenamiento.
- Ausencia de validacion publicada: sin resultados de validacion reproducidos por terceros, no puede asumirse que el modelo supere a metodos operativos convencionales.
- Etiquetado heuristico: las etiquetas de nubes se generan con codigo propio, de modo que los sesgos y errores del etiquetado se propagan al entrenamiento y a las metricas de validacion.
- Dependencia del preprocesado: los resultados dependen criticamente de la alineacion satelite-radar de la etapa `data_preparing`; errores de calibracion o desalineacion temporal entre fuentes degradan la prediccion.
- Licencia: la licencia se declara como `other`, con ficheros separados para codigo (`LICENSE_CODE`) y para modelo y datos (`LICENSE_MODEL_DATA`). Antes de cualquier uso comercial es obligatorio leer ambos ficheros; no puede asumirse permisividad.
- Modelo en fase temprana: 0 descargas y 0 likes, creado y actualizado el mismo dia, sin historial de uso ni mantenimiento conocidos.
- Alcance restringido: no es un modelo de proposito general, no genera texto ni codigo y no dispone de soporte de herramientas ni de agentes.
- Fechas incoherentes: la fecha de creacion indicada (2026) es posterior a la fecha de la mayoria de referencias disponibles, lo que conviene verificar directamente en el repositorio.
- Ausencia de resultados en la busqueda web: las consultas realizadas no devolvieron ninguna fuente relacionada con el modelo, por lo que no existe literatura externa que lo respalde.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lsh9034/ci-net
- Paper de referencia de la arquitectura SimVP (etiqueta del repositorio, no citado por el autor): SimVP: Simpler yet Better Video Prediction, https://arxiv.org/abs/2206.05099
- Repositorio OpenSTL, implementacion abierta de referencia de SimVP y otros modelos de prediccion espacio-temporal: https://github.com/chengtan9907/OpenSTL
- Licencia del codigo: fichero `LICENSE_CODE` dentro del repositorio de HuggingFace
- Licencia de modelo y datos: fichero `LICENSE_MODEL_DATA` dentro del repositorio de HuggingFace
- Documentacion adicional sobre la estructura de resultados: fichero `result/README.md` dentro del repositorio de HuggingFace
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados al modelo en la busqueda web realizada.
