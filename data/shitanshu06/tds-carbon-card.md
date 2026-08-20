# Shitanshu06/tds-carbon-card

## Resumen

Este repositorio, publicado por el usuario Shitanshu06, no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono (carbon card) que documenta la huella de CO₂ generada durante un proceso de fine-tuning. Se enmarca en la iniciativa Green AI del curso TDS GA8, cuyo objetivo es cuantificar el impacto ambiental del entrenamiento de modelos. Los datos registrados indican un consumo energético de 331,5456 kWh y unas emisiones de 139,249 kg de CO₂ equivalente, utilizando tres GPUs NVIDIA V100 en la región us-east1. No se proporciona información sobre la arquitectura, los parámetros ni las capacidades del modelo subyacente, por lo que esta ficha se limita a describir el contenido del repositorio y a señalar la ausencia de especificaciones técnicas del modelo.

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

No se dispone de información sobre la arquitectura del modelo (transformer, MoE, SSM, etc.) ni sobre los datos de entrenamiento. El repositorio únicamente documenta el proceso de fine-tuning desde una perspectiva ambiental: se emplearon 3 GPUs NVIDIA V100 durante 287,8 horas (con un PUE de 1,28), lo que supuso un consumo total de 331,5456 kWh y unas emisiones de 139,249 kg de CO₂ equivalente, calculadas con la herramienta CodeCarbon. No se mencionan innovaciones técnicas ni detalles del entrenamiento.

## Capacidades

No disponible. Este repositorio no describe un modelo con capacidades de generación de texto, razonamiento, código, visión, tool calling, agentes ni multilingüismo. Se trata exclusivamente de un registro de emisiones.

## Casos de uso

No aplica como modelo de IA. El repositorio puede utilizarse como referencia para:

- Auditoría ambiental de procesos de fine-tuning: permite consultar el impacto de un entrenamiento concreto en términos de energía y CO₂.
- Investigación en Green AI: sirve como ejemplo de cómo documentar emisiones en un repositorio público.
- Comparación de eficiencia energética entre configuraciones de hardware (en este caso, V100 en us-east1).
- Educación sobre sostenibilidad en machine learning: muestra un formato estándar para reportar la huella de carbono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otros.

## Requisitos de hardware

- El entrenamiento documentado utilizó 3 GPUs NVIDIA V100.
- No se especifican requisitos de VRAM para inferencia, ya que no se trata de un modelo desplegable.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No existe información sobre el modelo subyacente ni sobre alternativas comparables.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo de IA, por lo que no puede ser utilizado para tareas de inferencia.
- No se especifica la licencia, lo que impide determinar las condiciones de uso del contenido.
- Los datos de emisiones son específicos del entorno de entrenamiento (hardware, región, PUE) y no son generalizables a otros escenarios.
- No se indica el tipo de modelo ni la tarea para la que se realizó el fine-tuning, lo que limita la utilidad del registro fuera del contexto del curso TDS GA8.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Shitanshu06/tds-carbon-card
