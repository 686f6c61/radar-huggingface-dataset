# 12milo12/violencia-clasificacion-beto

## Resumen

`12milo12/violencia-clasificacion-beto` es un modelo de clasificación de texto en español, ajustado sobre el modelo base `dccuchile/bert-base-spanish-wwm-cased` (BETO). Ha sido desarrollado por el autor `12milo12` para el proyecto de tesis SENDA, que analiza testimonios de video y clasifica eventos de violencia en categoría y subcategoría. El modelo no genera texto libre ni interpreta hechos: sus salidas se limitan a dos etiquetas de clasificación para cada testimonio.

Arquitectónicamente es un BERT base con dos cabezas de clasificación (categoría y subcategoría), entrenado con truncamiento a 128 y 160 tokens respectivamente. El repositorio incluye además artefactos auxiliares (modelos de regresión logística, codificadores de etiquetas y un archivo de calibración) que forman parte de un pipeline jerárquico de clasificación. Su relevancia es principalmente académica y de aplicación específica en el contexto del proyecto SENDA, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (BETO, `dccuchile/bert-base-spanish-wwm-cased`) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (truncamiento a 128 tokens para categoría y 160 tokens para subcategoría durante el entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | español (es) |
| Licencia | unknown (no especificada) |
| Formato de pesos | PyTorch (`.pt`), tokenizer, Joblib (`.joblib`) |

## Arquitectura y entrenamiento

El modelo es un BERT base en español (BETO) con dos cabezas de clasificación: una para categoría de violencia y otra para subcategoría. El entrenamiento se realizó sobre un conjunto de 2870 eventos, con una división de 70% entrenamiento, 15% validación y 15% prueba, utilizando semilla 42. Se aplicó *early stopping* con paciencia de 6 sobre un máximo de 25 épocas, junto con *layer-wise learning rate decay*, congelación de las capas inferiores, *label smoothing* y R-Drop. El repositorio no especifica la composición del dataset de entrenamiento ni el número de tokens utilizado. La cobertura de clasificación reportada es del 97.2% por categoría y del 90.9% por subcategoría.

La innovación técnica más destacada es la combinación de técnicas de regularización y ajuste fino (R-Drop, *label smoothing*, *layer-wise LR decay*) para mejorar la generalización en un dominio específico (clasificación de violencia). No se menciona RLHF ni DPO. El modelo está diseñado para funcionar como una etapa de clasificación dentro de un pipeline jerárquico más amplio, no como un modelo generativo.

## Capacidades

- Clasificación de texto en español en categorías y subcategorías de violencia.
- Salida limitada a etiquetas de categoría y subcategoría (clasificación de una sola etiqueta, no multilabel).
- Integración con artefactos de referencia basados en regresión logística (`.joblib`) como router o línea base.
- Calibración de probabilidades mediante temperaturas registradas en `calibration.json`.
- No soporta tool calling, *function calling* ni generación de texto.
- No es un modelo de propósito general: no realiza análisis de hechos, urgencia, vulnerabilidades ni rutas institucionales. Estas tareas se delegan a otros modelos (GPT/Claude) que leen los hechos ya persistidos.
- No soporta entrada multimodal (ni visión ni audio) ni razonamiento multi-step autónomo.

## Casos de uso

- Análisis de testimonios de violencia en el proyecto SENDA: el modelo clasifica automáticamente la categoría y subcategoría de cada testimonio a partir de su transcripción, y las salidas se alimentan a un modelo generativo posterior para la interpretación de hechos. Es adecuado porque está ajustado específicamente para esta taxonomía de violencia.
- Triaje de reportes de violencia en organizaciones sociales: permite filtrar y etiquetar denuncias o testimonios en un formulario, reduciendo el tiempo de revisión manual. El modelo ofrece una clasificación rápida y consistente, aunque la interpretación final requiere un sistema complementario.
- Etiquetado de documentos jurídicos o administrativos: clasifica párrafos o secciones de documentos legales en categorías de violencia, lo que puede facilitar la gestión de expedientes. Su limitación a 160 tokens obliga a fragmentar textos largos, pero dentro de un pipeline de preprocesamiento es viable.
- Investigación académica en ciencias sociales: codificación sistemática de entrevistas o relatos para análisis de violencia. La etiqueta única y la cobertura de subcategorías permiten estandarizar el proceso de codificación, aunque el investigador deberá validar las salidas.
- Pipelines de análisis de video: clasificación de transcripciones generadas por un sistema de ASR. En el contexto de SENDA, el modelo se usa como primera capa de clasificación antes de la interpretación contextual.
- Sistemas de alerta temprana: procesamiento de mensajes de redes sociales o formularios de contacto para detectar y clasificar posibles incidentes de violencia. El modelo puede integrarse en backend como una tarea de clasificación, aunque no ofrece análisis de riesgo ni urgencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendada: no disponible. El repositorio incluye un cuaderno de entrenamiento pero no documenta requisitos de despliegue.
- Al ser un modelo BERT-base (tamaño del repositorio: 0.9 GB), es probable que pueda ejecutarse en GPUs modestas o incluso en CPU, pero no hay datos oficiales que confirmen consumo de VRAM o tiempos de inferencia.
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama ni TGI. El modelo usa pesos en formato PyTorch (`.pt`), por lo que podría servirse con Hugging Face Transformers o un backend compatible, pero esta integración no está documentada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. El repositorio no presenta comparaciones con otros modelos. El único punto de referencia conocido es el modelo base `dccuchile/bert-base-spanish-wwm-cased`, del que se desconoce el rendimiento relativo tras el ajuste fino.

## Limitaciones y advertencias

- Licencia no especificada (`unknown`): no se garantiza que el modelo pueda utilizarse comercialmente ni redistribuirse sin autorización.
- No es un modelo de propósito general: está limitado a la clasificación de violencia según la taxonomía del proyecto SENDA.
- Longitud máxima de entrada muy limitada (128 o 160 tokens): los testimonios más largos deben truncarse, lo que puede perder información relevante.
- La cobertura de clasificación no es perfecta: el 2.8% de eventos no se cubre por categoría y el 9.1% no se cubre por subcategoría, lo que indica un riesgo de eventos no clasificados o mal clasificados.
- No genera interpretaciones ni contextos: no puede evaluar urgencia, vulnerabilidades ni proponer rutas institucionales. Estas tareas se delegan a otros modelos.
- Posibles sesgos en el dataset de entrenamiento no documentados: al no describirse la composición del conjunto de datos, no se puede evaluar la representatividad frente a diferentes tipos de violencia o perfiles de población.
- Dependencia de artefactos externos: el modelo no funciona de forma aislada sin los archivos Joblib y la configuración de calibración incluidos en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/12milo12/violencia-clasificacion-beto
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- No se han encontrado otros enlaces relevantes (papers, blogs o repos) en la búsqueda web.
