# BohaoWu/NERGL

## Resumen

NERGL (Named Entity Recognition and Grounding) es un modelo especializado que combina reconocimiento de entidades nombradas (NER) y anclaje visual (visual grounding) sobre titulos de estampas japonesas ukiyo-e. Desarrollado por Bohao Wu y Akira Maeda, el modelo toma como entrada el titulo de una estampa y una "corriente de conocimiento" generada por un LLM, y devuelve las entidades nombradas del titulo, su tipologia y la region concreta de la imagen donde aparecen, o bien indica que la entidad no esta representada visualmente.

El modelo se construye sobre `ku-nlp/bart-large-japanese`, un encoder-decoder BART preentrenado en japones, que se ajusta finamente para la tarea multimodal de GMNER (Grounding Multimodal Named Entity Recognition). La salida de anclaje se restringe a un conjunto de 18 propuestas de region generadas por VinVL, lo que convierte el problema de localizacion en una clasificacion sobre candidatos predefinidos.

Es relevante en el ambito de las humanidades digitales y la recuperacion de patrimonio cultural: permite enlazar automaticamente el contenido textual de los titulos de ukiyo-e con las regiones pictoricas correspondientes, facilitando tareas de catalogacion, indexacion semantica y busqueda visual en colecciones de arte japones. El checkpoint publicado corresponde a un unico run de la configuracion principal (fold 0, semilla 16, 50 epocas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder BART (transformer) sobre `ku-nlp/bart-large-japanese` |
| Parametros totales | no disponible (modelo base BART-large-japanese; el checkpoint es un `state_dict` de 1,6 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `state_dict` (`nergl_vinvl_f0_s16_bestgmner.bin`) |

## Arquitectura y entrenamiento

NERGL sigue una arquitectura encoder-decoder tipo BART, partiendo del modelo preentrenado en japones `ku-nlp/bart-large-japanese`. El encoder procesa conjuntamente el titulo de la estampa y una corriente de conocimiento textual generada por un LLM (denominada "GPT-6.1 Sol knowledge stream" en la model card), mientras que el decoder genera la secuencia de entidades tipadas. El anclaje visual se resuelve seleccionando una de las 18 propuestas de region (region proposals) extraidas por VinVL para cada estampa, con etiquetas de caja enlazadas al titulo.

El entrenamiento se realiza sobre el dataset `BohaoWu/Ukiyoe_MNERG`, con una particion en cinco folds. El checkpoint publicado corresponde al fold 0, semilla 16, tras 50 epocas de entrenamiento; se selecciona la epoca 43 por obtener el mejor F1 de validacion en GMNER (69,61). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; tampoco se detallan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento de entidades nombradas (NER) sobre titulos de estampas ukiyo-e en japones.
- Tipado de entidades (clasificacion del tipo de entidad detectada).
- Anclaje visual (visual grounding): localizacion de cada entidad en una de las 18 regiones propuestas por VinVL.
- Deteccion de entidades no representadas visualmente (prediccion de "no depicted").
- Integracion de una corriente de conocimiento generada por LLM como contexto adicional de entrada.
- Procesamiento multimodal texto-imagen (texto del titulo + propuestas de region de la estampa).
- Capacidad multilingue limitada al japones.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni vision general mas alla del anclaje sobre regiones predefinidas.

## Casos de uso

- Catalogacion automatica de colecciones de ukiyo-e: el modelo extrae las entidades del titulo y las vincula a regiones de la estampa, lo que permite generar metadatos estructurados (entidad, tipo, caja) para bases de datos de museos y bibliotecas digitales.
- Indexacion semantica y busqueda visual: al disponer de entidades ancladas a regiones, se pueden construir indices que permitan buscar estampas por personaje, lugar u objeto representado, y resaltar la region correspondiente en la imagen.
- Enriquecimiento de registros bibliograficos en bibliotecas digitales: el modelo puede procesar titulos japoneses de estampas y producir anotaciones GMNER que complementen los registros catalograficos existentes.
- Investigacion en humanidades digitales: permite analizar a escala que entidades de los titulos aparecen efectivamente representadas en las imagenes y cuales se mencionan sin estar dibujadas, habilitando estudios cuantitativos sobre practicas de representacion en el ukiyo-e.
- Curaduria y generacion de exposiciones virtuales: las regiones ancladas facilitan recortes y anotaciones automaticas para fichas de piezas, visitas guiadas o catalogos en linea con resaltado interactivo.
- Verificacion de consistencia titulo-imagen: el modelo puede señalar discrepancias entre lo que el titulo nombra y lo que la estampa muestra, util para control de calidad en digitalizaciones y para detectar errores de catalogacion.
- Preprocesamiento para pipelines de vision por computador: las salidas de anclaje pueden servir como etiquetas debiles o inicializacion para modelos de deteccion de objetos especificos del dominio del arte japones.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| GMNER F1 (validacion) | 69,61 | Fold 0, semilla 16, epoca 43 (mejor checkpoint) |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), ni metricas adicionales de NER, tipado o anclaje visual mas alla del F1 de validacion GMNER.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint ocupa 1,6 GB en disco, lo que sugiere que la inferencia en precision completa requiere varios GB de VRAM, aunque el dato exacto no se proporciona.
- GPU recomendadas: no disponible. Por el tamano del modelo base (BART-large), es probable que quepa en GPUs de consumo, pero no se confirma en la informacion.
- Cabe en GPU de consumo: no confirmado; el tamano del checkpoint (1,6 GB) sugiere que si, pero no hay dato oficial.
- Opciones de despliegue: el repositorio oficial proporciona un script de descarga (`script/download.py`) y un repositorio GitHub con requisitos de Python; no se documenta integracion con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (GMNER sobre arte japones o NER multimodal en japones) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo esta especializado exclusivamente en titulos de estampas ukiyo-e en japones; no es un modelo de proposito general.
- Dependencia de VinVL: el anclaje visual se limita a las 18 propuestas de region predefinidas por VinVL, por lo que no puede localizar entidades fuera de ese conjunto de candidatos.
- Dependencia de la corriente de conocimiento del LLM: la calidad de la entrada contextual ("GPT-6.1 Sol knowledge stream") condiciona el rendimiento; no se documenta su robustez ante entradas sin esa corriente.
- Idioma: solo japones; no se reporta soporte multilingue.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo generativo (decoder BART), existe riesgo inherente de generar entidades o tipos incorrectos.
- Sesgos: no documentados en la informacion disponible; el sesgo del dataset de ukiyo-e puede reflejar sesgos historicos y culturales del corpus.
- Licencia: Apache 2.0, permite uso comercial, pero se recomienda verificar las condiciones del modelo base `ku-nlp/bart-large-japanese` y del dataset.
- Checkpoint unico: solo se publica un run (fold 0, semilla 16); no hay informacion sobre variabilidad entre semillas ni sobre el rendimiento medio en los cinco folds.
- Sin soporte documentado para tool calling, agentes ni despliegue en servidores de inferencia estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BohaoWu/NERGL
- Repositorio GitHub: https://github.com/BohaoWu/NERGL
- Dataset: https://huggingface.co/datasets/BohaoWu/Ukiyoe_MNERG
- Modelo base: https://huggingface.co/ku-nlp/bart-large-japanese
- Paper (DOI): https://doi.org/10.1007/978-3-032-06136-2_1
