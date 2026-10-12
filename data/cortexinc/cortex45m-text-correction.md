# cortexinc/cortex45m-text-correction

## Resumen

Cortex45M es un modelo de lenguaje de pequeño tamano (aproximadamente 45 millones de parametros) desarrollado por TuncerLab y publicado en HuggingFace bajo el identificador `cortexinc/cortex45m-text-correction`. Esta implementado sobre TensorFlow y esta orientado al turco, con el objetivo declarado de servir como base para tareas de correccion de texto en ese idioma. Se trata, segun la propia model card, de un modelo que se encuentra unicamente en fase de preentrenamiento: no se ha aplicado todavia un ajuste fino supervisado (SFT) especifico para la tarea de correccion, por lo que no debe considerarse un sistema de correccion listo para produccion.

El modelo se entrena sobre un corpus declarado de aproximadamente 10 GB durante 28.000 pasos. La model card no documenta la arquitectura concreta (no se especifica si es un transformer decoder-only, encoder-only o encoder-decoder), ni la longitud de contexto, ni el tokenizador, ni los hiperparametros de optimizacion, ni el hardware utilizado. Esta ausencia de detalles tecnicos es relevante para cualquiera que quiera evaluarlo o reproducir el entrenamiento.

Su relevancia actual es fundamentalmente academica y de investigacion: se trata de un artefacto de bajo coste computacional que puede ejecutarse en CPU o en GPUs de gama consumer, util como punto de partida para experimentos de PLN en turco, como base para ajuste fino posterior o como referencia metodologica en proyectos de modelos pequenos. No hay resultados de benchmarks publicados ni evaluacion independiente, y el repositorio no incluye pesos con formato estandar ampliamente soportado por las herramientas de inferencia habituales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura; solo indica que es una red neuronal basada en TensorFlow) |
| Parametros totales | aproximadamente 45 millones |
| Parametros activos | no aplica / no disponible (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; el repositorio es de tipo TensorFlow) |
| Idiomas soportados | turco (etiqueta `turkish`; la model card esta redactada integramente en turco y declara foco en ese idioma) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio TensorFlow; no se especifica si son checkpoints, SavedModel o variables sueltas; tamano del repositorio: 0,1 GB) |
| Desarrollador | TuncerLab (repo publicado por el usuario `cortexinc`) |
| Fase de entrenamiento | preentrenamiento (pre-training) unicamente |
| Framework | TensorFlow |
| Corpus de entrenamiento declarado | aproximadamente 10 GB |
| Pasos de entrenamiento declarados | 28.000 |
| Fecha de publicacion en HuggingFace | 2026-10-12 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La informacion disponible no permite determinar la arquitectura del modelo. La model card define Cortex45M como "una red neuronal basada en TensorFlow" y no aporta detalles sobre si se trata de un transformer decoder-only tipo GPT, un encoder tipo BERT, un encoder-decoder tipo T5, un modelo hibrido o una arquitectura recurrente o convolucional. Tampoco se especifica el numero de capas, la dimension del modelo, el numero de cabezas de atencion, el vocabulario del tokenizador ni la funcion de activacion. Dado el tamano (45 millones de parametros) y el corpus declarado (10 GB), el modelo se situa en la categoria de los modelos pequenos, comparable en orden de magnitud a BERT-base truncado o a modelos tipo DistilBERT, aunque no puede confirmarse ninguna equivalencia arquitectonica.

En cuanto al entrenamiento, la unica informacion verificable es la proporcionada por el autor: un corpus de aproximadamente 10 GB y 28.000 pasos de preentrenamiento. No se documentan la composicion del dataset, las fuentes, la licencia de los datos, el metodo de tokenizacion, el optimizador, la tasa de aprendizaje, el tamano de batch, la funcion de perdida, el hardware empleado ni el criterio de seleccion de checkpoints. Tampoco se indica que se haya aplicado RLHF, DPO, instruccion tuning ni ningun ajuste fino supervisado posterior. La propia model card advierte de que la correccion de texto es el objetivo previsto, pero no una capacidad ya entrenada, y enumera explicitamente los detalles que deberian documentarse para hacer el proceso reproducible.

## Capacidades

- Generacion y modelado de lenguaje en turco: como modelo preentrenado, su capacidad principal es la de modelar probabilidades sobre texto turco, no la de ejecutar tareas concretas sin ajuste posterior.
- Base para ajuste fino: puede servir como punto de partida para tareas posteriores de PLN en turco, incluida la correccion ortografica y gramatical.
- Extraccion de representaciones: utilizable potencialmente como extractor de caracteristicas o embeddings para clasificacion, similar a otros modelos de su tamano (no verificado por el autor).
- Prototipado de flujos de preprocesado de texto: la model card menciona el prototipado de flujos de preprocesado y correccion como area de investigacion prevista.
- Tool calling / function calling: no soportado; no se documenta ninguna capacidad de invocacion de herramientas.
- Agentes y razonamiento multi-paso: no soportado ni documentado.
- Multilinguismo: no documentado; el modelo esta etiquetado y descrito como especificamente turco.
- Capacidades especiales (modo thinking, vision, audio): no documentadas; no hay indicios de soporte multimodal.
- Capacidad de correccion de texto: no verificada. La model card indica de forma explicita que no se ha confirmado un ajuste fino orientado a la tarea, por lo que no debe asumirse que el modelo corrija texto de forma fiable.

## Casos de uso

- Investigacion academica en PLN turco: el modelo puede utilizarse como sujeto de estudio en experimentos sobre modelos de lenguaje de baja escala, analizando el efecto del tamano, del corpus y del numero de pasos en tareas de modelado del lenguaje en turco.
- Base para ajuste fino en correccion ortografica: dado que se distribuye en fase de preentrenamiento, un equipo puede aplicar SFT sobre un corpus paralelo de frases con errores y frases corregidas, y evaluar si el modelo supera a partir de un baseline entrenado desde cero.
- Experimentos de tokenizacion para turco: la estructura aglutinante del turco plantea retos de segmentacion; este checkpoint puede emplearse para comparar estrategias de tokenizacion y su impacto en el modelado del idioma.
- Prototipado de preprocesado de texto: integrable en prototipos de normalizacion de texto turco (limpieza, deteccion de anomalias tipograficas) antes de pasarlo a un modelo mayor, siempre con validacion humana del resultado.
- Reproduccion y comparacion metodologica: util como referencia en estudios que comparen frameworks (TensorFlow frente a PyTorch) o tamanos de modelo en tareas de PLN para lenguas de recursos medios.
- Docencia y practicas: su tamano reducido (0,1 GB de repositorio, 45 M de parametros) lo hace apto para entornos de aprendizaje donde se necesite ejecutar un modelo de lenguaje real sin infraestructura GPU dedicada.
- Generacion de representaciones para clasificacion de texto turco: uso como encoder congelado o ajustado para tareas como analisis de sentimiento o deteccion de spam, previa validacion empirica no realizada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que no presenta ningun resultado de benchmark verificado ni porcentaje de precision, y senala que el modelo solo ha pasado por preentrenamiento. Ademas, propone una lista de metricas que deberian emplearse en una evaluacion futura: tasa de error a nivel de caracter, tasa de error a nivel de palabra, precision ortografica, preservacion del significado, numero de cambios innecesarios y evaluacion humana.

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU | no disponible | no evaluado en la informacion proporcionada |
| HumanEval | no disponible | no evaluado en la informacion proporcionada |
| GSM8K | no disponible | no evaluado en la informacion proporcionada |
| Metricas de correccion de texto en turco | no disponible | el autor no publica resultados; propone las metricas a usar pero no aporta valores |

## Requisitos de hardware

- VRAM estimada para inferencia: en precision FP32, los pesos de 45 M de parametros ocupan aproximadamente 180 MB; en FP16, unos 90 MB; en INT8, unos 45 MB. A esto hay que sumar el overhead del runtime de TensorFlow y las activaciones, que en la practica situan el consumo total en el rango de cientos de megabytes a 1 GB, segun el tamano de batch y la longitud de secuencia (valores estimados a partir del numero de parametros; no publicados por el autor).
- GPU recomendadas: cualquier GPU moderna es suficiente. No se requiere A100 ni H100; una RTX 3060, RTX 4090 o incluso una GPU integrada reciente serian mas que suficientes para inferencia. No se documentan requisitos oficiales.
- Ejecucion en CPU: si, es viable. Con 45 M de parametros, la inferencia en CPU es practica para lotes pequenos; la model card no aporta cifras de latencia.
- Opciones de despliegue: al ser un modelo TensorFlow, las rutas naturales son TensorFlow Serving, TensorFlow Lite (si el formato de pesos lo permite) o inferencia directa con `tensorflow` / `keras` en Python. No hay evidencia de soporte para vLLM, llama.cpp, Ollama ni TGI, que trabajan principalmente con safetensors y GGUF; no se publican pesos en esos formatos en este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones.
- Nota importante: al no documentarse la arquitectura ni el formato exacto de los pesos, la puesta en marcha puede requerir trabajo adicional de ingenieria para reconstruir la definicion del modelo y las funciones de preprocesado, tal y como advierte la propia model card.

## Comparativa con modelos similares

No se dispone de datos de comparacion en la informacion proporcionada. La model card de Cortex45M no incluye ninguna comparativa con otros modelos, y la busqueda web realizada no ha devuelto resultados relacionados con el modelo (los resultados obtenidos corresponden a un servicio de aparcamiento del aeropuerto de Charleroi, sin ninguna relacion con el ambito de la inteligencia artificial).

A modo de contexto cualitativo, sin aportar cifras que no esten respaldadas por la informacion disponible, el modelo se situa en la categoria de modelos de lenguaje pequenos centrados en una unica lengua, un segmento en el que existen alternativas conocidas (por ejemplo, modelos tipo BERT entrenados especificamente para turco o modelos multilingues destilados). No obstante, no se dispone de datos verificados de parametros, contexto, rendimiento ni licencia de esas alternativas dentro de la informacion proporcionada, por lo que no se incluye una tabla comparativa con valores.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cortex45M | ~45 M | no disponible | sin benchmarks publicados | MIT | HuggingFace (TensorFlow) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo en fase de preentrenamiento: la limitacion principal es que no se ha confirmado ningun ajuste fino orientado a la tarea de correccion de texto. No debe desplegarse como corrector automatico sin un ajuste y una evaluacion previos.
- Sin benchmarks ni evaluacion independiente: no existen resultados publicados de precision, tasa de error ni calidad de correccion, por lo que cualquier afirmacion sobre su rendimiento en el mundo real carece de respaldo.
- Documentacion incompleta: no se especifican arquitectura, tokenizador, longitud de contexto, hiperparametros de entrenamiento, hardware ni criterio de seleccion de checkpoints. Esto dificulta la reproducibilidad y la integracion en produccion.
- Correspondencia entre repositorios no verificada: la model card enlaza en sus insignias al repositorio `korteks/cortex45m-metin-düzeltme`, mientras que el identificador real es `cortexinc/cortex45m-text-correction`; ademas, el autor declarado (TuncerLab) no coincide con el usuario que publica (`cortexinc`). Conviene verificar cual es el artefacto canonico.
- Opacidad del corpus: los aproximadamente 10 GB de datos de entrenamiento no estan descritos en cuanto a fuentes, licencias ni composicion. No puede descartarse la presencia de sesgos, contenido de baja calidad o datos personales, ni evaluarse el riesgo de contaminacion entre entrenamiento y evaluacion.
- Riesgo de alucinacion y de modificacion indebida: la propia model card advierte de que el modelo puede no corregir todos los errores, puede alterar texto correctamente escrito, puede malinterpretar el contexto o los nombres propios y puede rendir peor en tipos de texto poco representados en el corpus.
- Limitacion idiomatica: el modelo esta orientado exclusivamente al turco; no hay evidencia de capacidades en castellano ni en otras lenguas.
- Ausencia de soporte de herramientas: no se documenta tool calling, uso agentico ni razonamiento multi-paso.
- Licencia: MIT, lo que permite uso comercial y redistribucion, pero conlleva que el usuario asume toda la responsabilidad sobre el uso y sobre la procedencia de los datos de entrenamiento. La seccion de licencia de la model card aparece truncada en la informacion disponible, por lo que conviene consultar el archivo `LICENSE` del repositorio.
- Textos sensibles: la model card recomienda revisar cualquier salida antes de aplicarla sobre textos importantes o delicados.
- Metricas automaticas insuficientes: el propio autor senala que las metricas automaticas no bastan y que debe comprobarse que la correccion no altere el significado original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/cortexinc/cortex45m-text-correction
- Repositorio alternativo referenciado en las insignias de la model card (no verificado): https://huggingface.co/korteks/cortex45m-metin-düzeltme
- TensorFlow: https://www.tensorflow.org/
- Licencia MIT: https://opensource.org/license/mit
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos adicionales relacionados con Cortex45M. Los unicos resultados devueltos por la busqueda corresponden a un servicio de aparcamiento sin relacion con el modelo.
