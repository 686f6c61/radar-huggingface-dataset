# kon172verma/intent-classifier-experiments

## Resumen

El repositorio `kon172verma/intent-classifier-experiments` no es un modelo de clasificación de intenciones listo para usar, sino un almacén de artefactos de experimentación generados durante el ajuste fino de un clasificador de intenciones. El autor, Konark Verma, lo publica bajo licencia Apache 2.0 con el objetivo de preservar cada checkpoint de adaptador producido en distintas ejecuciones de entrenamiento, manteniendo la trazabilidad entre versiones y separando los artefactos experimentales de los modelos finales liberados en un repositorio aparte.

El repositorio contiene adaptadores entrenados con varias técnicas de *parameter-efficient fine-tuning* (PEFT): LoRA, DoRA, LoRA+, AdaLoRA y QLoRA, todas orientadas a la tarea de clasificación de intenciones. El tamaño total del repositorio es de 3,5 GB, lo que sugiere una cantidad considerable de checkpoints, aunque no se especifica el modelo base sobre el que se aplicaron los adaptadores ni los datos de entrenamiento utilizados. La ausencia de una model card detallada y de métricas de evaluación limita su uso directo en producción; su valor principal es servir como registro reproducible de experimentos para quien desee analizar o reutilizar los adaptadores en investigaciones similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de adaptadores PEFT, sin especificar modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (depende del adaptador y del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona QLoRA, que implica cuantizacion del modelo base, pero sin detalle) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (segun tags y estructura del repo) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo completo, sino adaptadores generados mediante tecnicas de PEFT. Las tecnicas listadas (LoRA, DoRA, LoRA+, AdaLoRA, QLoRA) son metodos de ajuste eficiente que congelan el modelo base y entrenan un subconjunto reducido de parametros. QLoRA, en particular, combina cuantizacion del modelo base con LoRA para reducir el consumo de memoria. No se proporciona informacion sobre el modelo base (por ejemplo, si es un transformer tipo BERT, RoBERTa, etc.), ni sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos o si se aplicaron tecnicas como RLHF o DPO. La estructura de carpetas sugiere que cada experimento se organiza por version y tecnica, con nombres del tipo `{modelo}_{tecnica}_{config}_{tamano_dataset}_{fecha}`, lo que permite rastrear cada ejecucion, pero los detalles concretos de arquitectura y entrenamiento no estan documentados en la informacion disponible.

## Capacidades

- Clasificacion de intenciones: el repositorio esta etiquetado con `pipeline_tag: intent-classification`, por lo que los adaptadores estan disenados para asignar una categoria de intencion a un texto de entrada (por ejemplo, en asistentes conversacionales).
- Compatibilidad con multiples tecnicas PEFT: al incluir adaptadores de LoRA, DoRA, LoRA+, AdaLoRA y QLoRA, permite comparar el rendimiento de distintos metodos de ajuste eficiente sobre la misma tarea.
- Reproducibilidad experimental: la organizacion por carpetas y versiones facilita la trazabilidad de cada ejecucion, aunque no se incluyen metricas ni configuraciones detalladas en la model card.
- No se documentan capacidades adicionales como generacion de texto, razonamiento, tool calling, soporte multilingue o vision.

## Casos de uso

- Investigacion en metodos PEFT: los adaptadores permiten estudiar como afectan distintas tecnicas (LoRA, DoRA, etc.) al rendimiento en clasificacion de intenciones, comparando configuraciones y tamanos de dataset.
- Reproduccion de experimentos: dado que el repositorio guarda checkpoints por ejecucion, un investigador puede reproducir los resultados o continuar el entrenamiento desde un punto concreto.
- Evaluacion comparativa de adaptadores: se pueden cargar los distintos adaptadores sobre el modelo base correspondiente (si se identifica) y medir su precision, latencia o robustez en un conjunto de validacion propio.
- Desarrollo de asistentes conversacionales: aunque no es un modelo final, los adaptadores podrian servir como punto de partida para un clasificador de intenciones en un prototipo, siempre que se conozca el modelo base y se validen los resultados.
- Auditoria de metodos de fine-tuning: el repositorio puede utilizarse para inspeccionar los pesos de los adaptadores y analizar diferencias entre tecnicas (por ejemplo, la magnitud de los cambios en las matrices LoRA).
- Integracion en pipelines de MLOps: los artefactos pueden incorporarse a un sistema de registro de experimentos, aunque faltan metadatos clave como metricas, hiperparametros y dataset utilizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen tablas con metricas como exactitud, F1, precision o recall, ni comparaciones con otros modelos de clasificacion de intenciones.

## Requisitos de hardware

No se dispone de informacion especifica sobre requisitos de hardware. Dado que el repositorio contiene adaptadores PEFT (cuyo peso es relativamente pequeno en comparacion con un modelo completo), la inferencia dependera del modelo base que se utilice. Para un modelo base de tipo transformer con alrededor de 100-300 millones de parametros, una GPU con 6-8 GB de VRAM seria suficiente para inferencia en FP16. Para modelos mas grandes (por ejemplo, 7B parametros), se necesitarian al menos 16 GB de VRAM en cuantizacion de 8 bits. Las opciones de despliegue incluyen librerias como Hugging Face Transformers con PEFT, vLLM, o llama.cpp si el modelo base esta disponible en formato GGUF. No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se ha identificado informacion sobre modelos comparables en la documentacion del repositorio ni en los resultados de busqueda.

## Limitaciones y advertencias

- Repositorio experimental: no es un modelo final listo para produccion; es un conjunto de artefactos de experimentacion sin metricas de calidad publicadas.
- Falta de documentacion: no se especifica el modelo base, el dataset de entrenamiento, los hiperparametros ni los criterios de seleccion de los adaptadores.
- Riesgo de sesgos y alucinaciones: al no conocerse los datos de entrenamiento, no es posible evaluar sesgos potenciales ni comportamientos indeseados en la clasificacion de intenciones.
- Dependencia del modelo base: los adaptadores solo funcionan si se carga el modelo base correcto, que no esta identificado en el repositorio.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de informacion sobre los datos de entrenamiento podria implicar riesgos legales si esos datos tienen restricciones.
- Sin soporte garantizado: al ser un proyecto personal, no hay garantias de mantenimiento, correccion de errores o actualizaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kon172verma/intent-classifier-experiments
- Perfil del autor en Hugging Face: https://huggingface.co/kon172verma
- Codigo de entrenamiento (GitHub): https://github.com/kon172verma/intent-classifier
- Codigo de inferencia y benchmarking (GitHub): https://github.com/kon172verma/intent-classifier-inference
- Repositorio de modelos finales (Hugging Face): https://huggingface.co/kon172verma/intent-classifier
