# nooraa-24/tds-carbon-card

## Resumen

El repositorio `nooraa-24/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a un proceso de fine-tuning de un modelo no especificado. Forma parte de una práctica académica denominada TDS GA8, cuyo objetivo es documentar la huella ambiental de un entrenamiento. La model card incluye únicamente métricas de emisiones de CO₂, consumo energético y hardware utilizado, sin información sobre la arquitectura, los parámetros o las capacidades del modelo subyacente.

Este tipo de repositorios son relevantes en el contexto de la IA sostenible (Green AI), donde se busca cuantificar el impacto ambiental del entrenamiento de modelos. Sin embargo, al carecer de cualquier artefacto de modelo (pesos, tokenizador, configuración), no es utilizable para inferencia ni para tareas de procesamiento del lenguaje natural. Su valor es exclusivamente documental y de auditoría.

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

Datos adicionales del entrenamiento registrado:

| Parametro | Valor |
|---|---|
| Hardware | NVIDIA V100 (3 GPUs) |
| Modo de entrenamiento | fine-tuning |
| Region | europe-west4 |
| Horas de GPU | 433,7 h (PUE: 1,41) |
| Energia total | 550,3653 kWh |
| Emisiones de CO₂ | 110,073 kg CO₂eq |
| Herramienta de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo que fue fine-tuneado. El repositorio solo documenta el proceso de entrenamiento: se utilizaron 3 GPUs NVIDIA V100 en la region europe-west4 durante 433,7 horas, con un factor de eficiencia energetica (PUE) de 1,41. El consumo total de energia fue de 550,3653 kWh, lo que resulto en 110,073 kg de emisiones de CO₂ equivalente, medidos con la herramienta CodeCarbon. No se especifica el dataset, el numero de tokens ni el tipo de fine-tuning (instruccion, RLHF, etc.).

## Capacidades

- No aplica: el repositorio no contiene un modelo funcional ni pesos entrenados.
- No ofrece generacion de texto, razonamiento, codigo, vision ni ninguna capacidad de IA.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de vision o audio.

## Casos de uso

- Auditoria de sostenibilidad en proyectos de IA: el repositorio sirve como registro verificable del impacto ambiental de un entrenamiento concreto, utilizable en informes de responsabilidad corporativa o academicos.
- Comparativa de eficiencia energetica entre configuraciones de hardware: los datos de GPU horas, PUE y emisiones permiten comparar el coste ambiental de diferentes entornos de entrenamiento.
- Educacion en Green AI: como ejemplo practico de como documentar emisiones de CO₂ en un pipeline de ML, siguiendo metodologias como CodeCarbon.
- Trazabilidad en experimentos de investigacion: al publicar la huella de carbono junto al modelo, se facilita la reproducibilidad y la transparencia en articulos cientificos.
- Optimizacion de infraestructura: los datos de consumo pueden usarse para decidir entre regiones cloud o tipos de GPU mas eficientes.
- Cumplimiento normativo futuro: ante posibles regulaciones sobre emisiones de IA, este tipo de registros podrian ser requeridos para certificar practicas sostenibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene evaluaciones de calidad del modelo, ya que no se proporciona el modelo en si.

## Requisitos de hardware

- No aplica para inferencia, ya que no hay pesos ni arquitectura.
- El entrenamiento registrado utilizo 3 GPUs NVIDIA V100, con un consumo total de 550,3653 kWh y 433,7 horas de GPU.
- No se proporcionan requisitos de VRAM, latencia ni throughput para inferencia.
- No se indican opciones de despliegue (vLLM, llama.cpp, etc.) porque no hay modelo que desplegar.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA, sino un artefacto de contabilidad de carbono. Existen otros repositorios similares en Hugging Face (por ejemplo, `24f2008974/tds-carbon-card`, `24f2006741/tds-carbon-card`, `saurabh123432/tds-carbon-card`, `fictionfreak04/tds-carbon-card`) que documentan entrenamientos con diferentes configuraciones de hardware y emisiones, pero todos comparten la misma naturaleza: no contienen modelos utilizables.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para ninguna tarea de procesamiento de lenguaje, generacion de texto, clasificacion, etc.
- La informacion sobre el modelo subyacente (arquitectura, parametros, dataset) es inexistente, lo que impide cualquier evaluacion tecnica.
- Los datos de emisiones dependen de la region y del hardware; no son extrapolables a otros entornos sin recalcular.
- La licencia no esta especificada, por lo que el uso del contenido del repositorio (texto de la model card) puede estar sujeto a restricciones no declaradas.
- No hay garantia de que las mediciones de CodeCarbon sean exactas o comparables con otras metodologias.
- El repositorio parece ser un ejercicio academico; no debe confundirse con un modelo listo para produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nooraa-24/tds-carbon-card
- Repositorios similares (misma practica): 
  - https://huggingface.co/24f2008974/tds-carbon-card
  - https://huggingface.co/24f2006741/tds-carbon-card
  - https://huggingface.co/saurabh123432/tds-carbon-card
  - https://huggingface.co/fictionfreak04/tds-carbon-card
