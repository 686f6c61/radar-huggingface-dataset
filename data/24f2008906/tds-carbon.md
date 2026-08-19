# 24f2008906/tds-carbon

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial propiamente dicho, sino una ficha de contabilidad de carbono correspondiente a una ejecución de fine-tuning realizada en el marco de la asignación TDS GA8. El autor, identificado como 24f2008906, documenta el consumo energético y las emisiones de CO₂ equivalente generadas durante el entrenamiento, siguiendo las prácticas de "Green AI" para la transparencia ambiental en el desarrollo de modelos.

El entrenamiento se realizó sobre dos GPUs NVIDIA T4 en la región europe-west4, con un total de 107,4 horas de cómputo (considerando un PUE de 1,2), un consumo energético de 18,0432 kWh y unas emisiones de 3,609 kg de CO₂ equivalente, medidas con la herramienta CodeCarbon. No se proporciona información sobre el modelo base, los datos de entrenamiento, la arquitectura o cualquier otra característica técnica del sistema resultante.

La relevancia de este repositorio radica en su contribución a la contabilidad de emisiones en el ciclo de vida de los modelos de IA, un aspecto cada vez más valorado por la comunidad investigadora. Sin embargo, desde el punto de vista técnico, no es un modelo utilizable ni desplegable, sino un registro de sostenibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo subyacente, ya que el repositorio únicamente documenta el proceso de fine-tuning desde una perspectiva ambiental. Los datos de entrenamiento, el número de tokens procesados, la composición del dataset y las técnicas de optimización (RLHF, DPO, etc.) no se mencionan en la model card.

Los únicos datos técnicos disponibles se refieren al hardware utilizado (NVIDIA T4, 2 GPUs), la duración del entrenamiento (107,4 horas GPU), el consumo energético total (18,0432 kWh) y las emisiones de CO₂ equivalente (3,609 kg), calculadas con CodeCarbon. No se indica el modelo base sobre el que se aplicó el fine-tuning ni el tipo de tarea.

## Capacidades

No se puede determinar ninguna capacidad del modelo, ya que no se proporciona información sobre sus funcionalidades. El repositorio no incluye pesos, código de inferencia, ejemplos de uso ni documentación sobre tareas soportadas (generación de texto, razonamiento, código, visión, etc.).

## Casos de uso

Dado que no se trata de un modelo desplegable, los casos de uso se limitan al ámbito de la contabilidad ambiental y la auditoría de sostenibilidad:

- Reporte de emisiones de carbono en proyectos de IA: el repositorio sirve como plantilla para documentar el impacto ambiental de ejecuciones de entrenamiento, siguiendo el estándar de CodeCarbon.
- Auditoría interna de sostenibilidad: equipos de MLOps pueden utilizar estos registros para calcular la huella de carbono acumulada de sus experimentos y optimizar la asignación de recursos.
- Comparativa de eficiencia energética: investigadores pueden contrastar los valores de CO₂ por hora de GPU entre diferentes configuraciones de hardware y regiones.
- Cumplimiento normativo: en entornos donde existan requisitos de divulgación ambiental, este tipo de ficha puede servir como evidencia de medición.
- Educación sobre Green AI: el repositorio puede emplearse como ejemplo didáctico en cursos sobre IA responsable y computación sostenible.
- Trazabilidad en publicaciones científicas: autores que deseen incluir métricas de emisiones en sus papers pueden replicar este formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene evaluaciones de calidad del modelo, métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparativas con otros sistemas.

## Requisitos de hardware

- El entrenamiento se realizó con 2 GPUs NVIDIA T4, lo que indica que el fine-tuning se ejecutó en hardware de gama media-baja orientado a inferencia y cargas ligeras.
- No se especifican requisitos de VRAM, ya que no se conoce el tamaño del modelo base.
- No se proporciona información sobre latencia, throughput ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- Dado que el repositorio no contiene pesos ni artefactos de inferencia, no es posible desplegar el modelo en ningún entorno.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA comparable con otros, sino un registro de contabilidad de carbono. Los repositorios similares encontrados en la búsqueda web (anshusaurav/tds-ga8-carbon-model, 24f2005112/tds-carbon-card) siguen el mismo formato de documentación de emisiones para la misma asignación, pero no proporcionan información sobre arquitectura o rendimiento.

## Limitaciones y advertencias

- No contiene un modelo utilizable: el repositorio solo incluye metadatos ambientales, no pesos ni código de inferencia.
- No se puede evaluar la calidad del modelo resultante del fine-tuning, ya que no se aportan métricas ni ejemplos.
- La licencia no está especificada, por lo que no se puede determinar si el contenido es reutilizable o con qué condiciones.
- Los datos de emisiones dependen de la metodología de CodeCarbon y del factor de emisión de la región europe-west4; pueden no ser directamente comparables con otras mediciones.
- No se indica el modelo base, lo que impide contextualizar la relevancia del fine-tuning.
- La fecha de creación (2026-08-19) es posterior a la fecha de redacción de esta ficha, lo que sugiere que el repositorio podría ser un artefacto de un ejercicio académico o una simulación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/24f2008906/tds-carbon
- Repositorio similar (anshusaurav): https://huggingface.co/anshusaurav/tds-ga8-carbon-model
- Repositorio similar (24f2005112): https://huggingface.co/24f2005112/tds-carbon-card
- GitHub del autor: https://github.com/24f2008906/TDS3
