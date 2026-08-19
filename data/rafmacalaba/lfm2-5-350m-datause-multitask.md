# rafmacalaba/lfm2.5-350M-datause-multitask

## Resumen

El modelo `rafmacalaba/lfm2.5-350M-datause-multitask` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante supervisión fina (SFT) sobre el modelo base `LiquidAI/LFM2.5-350M`, un modelo de lenguaje de 350 millones de parámetros desarrollado por Liquid AI. Su propósito es extraer atributos de procedencia de datos (productor, año, geografía y acrónimo) y clasificar el uso e impacto de dichos datos en cuatro categorías: tipo de dato, acción de uso, etiqueta de impacto y resumen de uso. Está diseñado para tareas de análisis de metadatos, cumplimiento de licencias y catalogación automática de conjuntos de datos.

El adaptador se entrenó sobre el dataset `rafmacalaba/data-use-sft` con una configuración LoRA de r=16, alpha=32 y dropout de 0.05, durante 3 épocas y con una tasa de aprendizaje de 0.0002. La evaluación sobre un conjunto de validación de 5464 muestras muestra un F1 global de 0.8091 en la extracción de atributos de procedencia, con una tasa de verbatim (valores emitidos que son substrings del contexto) del 99.72%. El modelo es ligero y puede ejecutarse en hardware modesto, lo que lo hace adecuado para pipelines de procesamiento de datos a gran escala.

La licencia Apache 2.0 permite uso comercial sin restricciones adicionales. Aunque el modelo base soporta 15 idiomas, el adaptador no especifica los idiomas cubiertos, por lo que su rendimiento fuera del inglés no está garantizado. Es una herramienta especializada, no un modelo conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre LFM2.5-350M (modelo base de Liquid AI) |
| Parametros totales | 350M (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (el modelo base soporta 15 idiomas, pero no se especifica para este adaptador) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre `LiquidAI/LFM2.5-350M`, un modelo de lenguaje de 350M parámetros con arquitectura LFM2 (desarrollada por Liquid AI, basada en una combinación de atención y mezcla de expertos, aunque los detalles exactos no se proporcionan en la información disponible). El adaptador se entrena mediante supervisión fina (SFT) sobre un dataset específico de atributos de uso de datos. La configuración LoRA utiliza r=16, alpha=32 y dropout de 0.05, con 3 épocas y una tasa de aprendizaje de 0.0002. Se aplica un enmascarado de completación, de modo que la pérdida solo se calcula sobre la parte de la respuesta JSON generada por el modelo, ignorando el contexto de entrada. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

El dataset de entrenamiento (`rafmacalaba/data-use-sft`) contiene ejemplos con pares de contexto y respuestas JSON que incluyen los atributos objetivo. El modelo aprende a extraer información estructurada de textos que describen conjuntos de datos, como productor, año, geografía y acrónimo, así como a clasificar el tipo de dato, la acción de uso, la etiqueta de impacto y un resumen textual del uso.

## Capacidades

- Extracción de atributos de procedencia: productor, año, geografía y acrónimo a partir de descripciones de datos.
- Clasificación de uso e impacto: tipo de dato, acción de uso, etiqueta de impacto y resumen de uso.
- Generación de salidas estructuradas en formato JSON.
- Especializado en tareas de metadatos y análisis de procedencia; no es un modelo conversacional de propósito general.
- El modelo base (LFM2.5-350M) ofrece inferencia rápida y puede ejecutarse en CPU, aunque el adaptador hereda estas características.
- Soporta tool calling y function calling solo si el modelo base los implementa; no se ha verificado para este adaptador.

## Casos de uso

- Catalogación automática de datasets: el modelo puede extraer automáticamente productor, año y geografía de descripciones de conjuntos de datos, facilitando la creación de metadatos estructurados en catálogos de datos.
- Cumplimiento de licencias y atribución: al identificar el productor y el año, ayuda a verificar la atribución correcta en repositorios de datos abiertos.
- Análisis de procedencia en pipelines de datos: integrado en un flujo ETL, puede enriquecer cada dataset con información de origen y uso.
- Clasificación de impacto para informes de sostenibilidad: la etiqueta de impacto y el resumen de uso permiten categorizar cómo se utilizan los datos en proyectos de investigación o empresariales.
- Generación de resúmenes de uso para documentación: el modelo produce un resumen textual de la acción de uso, útil para reportes de transparencia.
- Detección de datos duplicados o inconsistentes: comparando los atributos extraídos entre diferentes fuentes, se pueden identificar discrepancias en la procedencia.
- Automatización de formularios de metadatos en repositorios de datos gubernamentales o académicos: el modelo rellena campos como productor, año y geografía a partir de descripciones libres.

## Benchmarks y rendimiento

La evaluación se realizó sobre un conjunto de validación de 5464 muestras (holdout). Los resultados de extracción de atributos de procedencia se presentan en la siguiente tabla, con métricas de precisión, recall, F0.5 y F1.

| Atributo | TP | FP | FN | Precision | Recall | F0.5 | F1 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| producer | 1106 | 354 | 343 | 0.7575 | 0.7633 | 0.7587 | 0.7604 |
| year | 1070 | 253 | 280 | 0.8088 | 0.7926 | 0.8055 | 0.8006 |
| geography | 1668 | 425 | 359 | 0.7969 | 0.8229 | 0.8020 | 0.8097 |
| acronym | 1243 | 214 | 173 | 0.8531 | 0.8778 | 0.8580 | 0.8653 |
| **Overall** | 5087 | 1246 | 1155 | 0.8033 | 0.8150 | 0.8056 | 0.8091 |

Para la clasificación de uso/impacto, se reportan los siguientes macro-F1 por cabeza:

- data_type: 0.6239
- usage_action: 0.5271
- impact_label: 0.4107

La tasa de verbatim (valores emitidos que son substrings del contexto) es de 6315/6333 = 0.9972, lo que indica una alta fidelidad a los textos de origen. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- Al ser un modelo de 350M con un adaptador LoRA, el tamaño total es inferior a 1 GB en precisión FP16, por lo que puede ejecutarse en GPUs de consumo como una RTX 3060 o incluso en CPU con suficiente RAM.
- No se especifican requisitos exactos de VRAM, pero se estima que un modelo de 350M en FP16 requiere aproximadamente 700 MB de memoria, y en cuantización INT8 alrededor de 350 MB.
- Es viable en entornos con recursos limitados, como instancias cloud de bajo coste o dispositivos edge.
- Para despliegue, se puede utilizar el ecosistema HuggingFace Transformers con PEFT (para cargar el adaptador LoRA) o herramientas como vLLM, aunque no se ha confirmado la compatibilidad con este adaptador específico.
- La inferencia es rápida gracias al tamaño reducido; se puede ejecutar en tiempo real en aplicaciones de procesamiento por lotes.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables con la misma tarea específica (extracción de atributos de procedencia y clasificación de uso). El modelo base `LFM2.5-350M` es un modelo de propósito general, pero este adaptador está especializado en una tarea concreta, por lo que no hay alternativas directas documentadas. Se podría comparar con el modelo base sin fine-tune, pero no se han publicado resultados de dicha comparación.

## Limitaciones y advertencias

- El modelo está especializado en la tarea de extracción de atributos de procedencia y clasificación de uso; no es adecuado para conversación general ni para tareas de generación de texto libre.
- Al ser un modelo pequeño (350M), puede presentar alucinaciones en contextos poco representados en el dataset de entrenamiento.
- La tasa de verbatim es alta (99.72%), pero puede fallar cuando el contexto contiene información implícita o ambigua.
- Las métricas de clasificación de uso/impacto son moderadas (macro-F1 entre 0.41 y 0.62), lo que indica margen de mejora y posible sesgo en las etiquetas.
- No se especifican los idiomas soportados por el adaptador; aunque el modelo base cubre 15 idiomas, el rendimiento fuera del inglés no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los términos del modelo base y del dataset de entrenamiento.
- No se proporcionan detalles sobre la composición del dataset de entrenamiento, por lo que pueden existir sesgos no documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rafmacalaba/lfm2.5-350M-datause-multitask
- Modelo relacionado del mismo autor (encoder): https://huggingface.co/rafmacalaba/lfm2.5-Encoder-350M-datause
- Documentación del modelo base LFM2.5-Encoder-350M (Liquid AI): https://docs.liquid.ai/lfm/models/lfm25-encoder-350m
- Modelo base LFM2-350M (versión anterior): https://huggingface.co/LiquidAI/LFM2-350M
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
