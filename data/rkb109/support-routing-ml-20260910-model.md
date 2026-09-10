# RKB109/support-routing-ml-20260910-model

## Resumen

El modelo RKB109/support-routing-ml-20260910-model, publicado por el usuario RKB109, es un prototipo pequeno y transparente orientado al enrutamiento automatico de tickets de soporte. No es un modelo de lenguaje generativo ni una red neuronal profunda: segun su model card, combina pesos de token por etiqueta con recuperacion de evidencia ponderada por IDF. Su objetivo declarado es servir como linea base reproducible capaz de exponer un nivel de confianza y de derivar los casos dudosos a revision humana.

Se distribuye con licencia MIT, la libreria declarada es `custom` y la tarea principal es `text-classification`, aunque las etiquetas del repositorio tambien cubren `zero-shot-classification`, `sentence-similarity` y `summarization`. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 10 de septiembre de 2026. No se especifican idiomas soportados ni numero de parametros.

Su relevancia es acotada: se trata de un ejemplo de arquitectura para demostraciones reproducibles, comparaciones locales y experimentacion educativa, no de un modelo listo para produccion. El autor advierte que el conjunto de datos es sintetico y muy pequeno (4 ejemplos de validacion reservados), por lo que no debe emplearse en decisiones con consecuencias sin datos representativos, revision experta y evaluacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador `custom` basado en pesos de token por etiqueta combinados con recuperacion de evidencia ponderada por IDF (no es un transformer ni un LLM) |
| Parametros totales | no disponible (no se declaran parametros de red neuronal) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica (formato JSON, no requiere cuantizacion) |
| Idiomas soportados | no disponible (la model card solo advierte que los tickets sinteticos no representan todas las lenguas) |
| Licencia | MIT |
| Formato de pesos | JSON (formato de modelo definido en el repositorio GitHub del autor; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card no es neuronal: consiste en pesos de token asociados a cada etiqueta, combinados con una etapa de recuperacion de evidencia ponderada por IDF. El autor indica explicitamente que el modelo "no llama a un LLM alojado" y que se genero para demostraciones de arquitectura reproducibles. Se declara cobertura de tareas de Hugging Face para clasificacion de texto, clasificacion zero-shot, similitud entre frases y resumen, aunque no se detalla la implementacion de cada una.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de RLHF, DPO u otras tecnicas de alineamiento. La model card apunta a un repositorio de GitHub que incluiria `train.py`, la particion exacta del dataset, el codigo de evaluacion y el formato JSON del modelo, pero la URL de dicho repositorio no se proporciona en la informacion disponible. Las metricas objetivo declaradas son `classification_accuracy`, `automation_coverage` y `escalation_precision`.

## Capacidades

- Clasificacion de texto para enrutamiento de tickets de soporte (`text-classification`).
- Clasificacion zero-shot, segun la cobertura de tareas declarada en el repositorio.
- Similitud entre frases (`sentence-similarity`), util para agrupar o deduplicar tickets.
- Resumen (`summarization`), segun la cobertura de tareas declarada; no se detalla el metodo.
- Exposicion de confianza y derivacion de casos inciertos: la descripcion menciona de forma explicita "defer uncertain cases" como objetivo de diseno.
- Recuperacion de evidencia ponderada por IDF, orientada a justificar la etiqueta asignada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Enrutamiento de tickets en un prototipo interno: el modelo asigna una categoria o cola a cada ticket entrante y, gracias a su mecanismo de confianza declarado, puede marcar los casos dudosos para revision humana en lugar de forzar una etiqueta.
- Linea base en pipelines de CI: al ser pequeno, transparente y reproducible, sirve como referencia contra la que medir cualquier clasificador posterior dentro de un flujo de integracion continua.
- Comparacion local de enfoques: permite contrastar rapidamente una aproximacion basada en pesos de token e IDF frente a alternativas mas complejas antes de invertir en entrenamiento a mayor escala.
- Experimentacion educativa: adecuado para ensenar como se construye y evalua un clasificador de texto con exposicion de confianza, sin depender de infraestructura de GPU ni de APIs externas.
- Deteccion de casos para escalado: la metrica objetivo `escalation_precision` sugiere su uso para identificar que tickets deben escalarse a un nivel superior de soporte, midiendo la precision de esa derivacion.
- Justificacion de etiquetas mediante evidencia: la recuperacion ponderada por IDF puede emplearse para mostrar que fragmentos del ticket sustentan la clasificacion, lo que ayuda en tareas de auditoria interna.
- Clasificacion zero-shot de nuevas categorias: util para probar etiquetas de enrutamiento que aun no cuentan con datos etiquetados suficientes.
- Agrupacion por similitud de frases: para deduplicar incidencias repetidas o agrupar tickets relacionados antes de asignarlos a un equipo.

## Benchmarks y rendimiento

Los unicos datos de evaluacion presentes en la informacion disponible son los siguientes:

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Accuracy | 1 | 4 ejemplos sinteticos reservados |
| classification_accuracy | metrica objetivo declarada, sin valor publicado | no disponible |
| automation_coverage | metrica objetivo declarada, sin valor publicado | no disponible |
| escalation_precision | metrica objetivo declarada, sin valor publicado | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible. El valor de accuracy 1 se obtuvo sobre 4 ejemplos sinteticos, por lo que no tiene significacion estadistica y no debe interpretarse como una medida de rendimiento generalizable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no tratarse de una red neuronal, no requiere GPU.
- GPU recomendadas: no aplica; la inferencia puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: no aplica, no necesita GPU dedicada.
- Opciones de despliegue: ejecucion en Python a partir del formato JSON del modelo y del codigo incluido en el repositorio GitHub del autor. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de transformers ni un LLM.
- Latencia y throughput estimados: no disponibles.
- Memoria en disco y RAM: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo mas alla del accuracy sobre 4 ejemplos, por lo que no es posible establecer una comparativa cuantitativa. Como referencia cualitativa de categoria (clasificadores de texto ligeros, no generativos), podrian considerarse:

| Modelo | Tipo | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| RKB109/support-routing-ml-20260910-model | Clasificador custom con pesos de token e IDF | no disponible (sin red neuronal) | no disponible | MIT |
| Baselines clasicos tipo TF-IDF + regresion logistica (scikit-learn) | Clasificador estadistico | no aplica | no aplica | BSD segun la libreria |
| SetFit (Sentence Transformers) | Clasificador con few-shot sobre embeddings | depende del encoder base | depende del encoder base | Apache 2.0 segun el proyecto |
| spaCy textcat | Clasificador en pipeline NLP | depende del modelo base | depende del modelo base | MIT segun el proyecto |

Las cifras de parametros, contexto y licencia de las alternativas dependen del proyecto y la version concretos; no se incluyen datos numericos porque no forman parte de la informacion proporcionada.

## Limitaciones y advertencias

- El conjunto de datos es sintetico y muy pequeno: solo 4 ejemplos reservados para evaluacion.
- El accuracy de 1 no es estadisticamente significativo y no debe extrapolarse a datos reales.
- Los tickets sinteticos no representan todas las poblaciones de usuarios ni todos los idiomas.
- Riesgo elevado de sobreajuste a los patrones del dataset sintetico.
- El propio autor desaconseja su uso para decisiones con consecuencias sin datos representativos, revision experta y evaluacion de grado de produccion.
- Para entrenar con datos reales de produccion se requiere consentimiento y analisis de sesgos.
- No se documentan idiomas soportados, lo que limita su aplicacion en entornos multilingues.
- No hay evaluacion de robustez, de deriva de datos ni de calibracion de la confianza.
- La licencia MIT permite uso comercial, pero no ofrece garantias de idoneidad ni de exactitud.
- Con 0 descargas y 0 likes, no existe validacion externa por parte de la comunidad.
- Los resultados de la busqueda web realizada no guardan relacion con el modelo (contenido sobre salud cardiaca en chino), por lo que no aportan informacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RKB109/support-routing-ml-20260910-model
- Dataset asociado: https://huggingface.co/datasets/RKB109/support-routing-ml-20260910-dataset
- Repositorio GitHub con `train.py`, particion del dataset, codigo de evaluacion y formato JSON del modelo: mencionado en la model card, URL no disponible
- Paper o blog tecnico: no disponible
- Demo: no disponible
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo.
