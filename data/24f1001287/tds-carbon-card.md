# 24F1001287/tds-carbon-card

## Resumen

El repositorio `24F1001287/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado al entrenamiento de un modelo no especificado, realizado en el marco de la asignatura TDS GA8. Documenta las emisiones de CO₂ equivalente, el consumo energético y el hardware utilizado durante una ejecución de pre-entrenamiento. Es un ejemplo de aplicación de prácticas de "IA verde" (Green AI) para la transparencia en el impacto ambiental del entrenamiento de modelos.

La relevancia de esta ficha radica en que, aunque no se trata de un modelo desplegable, sirve como referencia metodológica para cuantificar la huella de carbono de un proceso de entrenamiento. Los datos reportados incluyen 930,817 kg de CO₂eq, un consumo total de 1432,0264 kWh y 452,6 horas de GPU en hardware NVIDIA H100. No se proporciona información sobre la arquitectura, el tamaño o las capacidades del modelo entrenado, por lo que esta ficha se limita a documentar los aspectos ambientales y de infraestructura.

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

Datos adicionales del entrenamiento (extraidos de la model card):

| Metrica | Valor |
|---|---|
| Hardware | NVIDIA H100 (4 GPUs) |
| Modo de entrenamiento | pre-training |
| Region | asia-south1 |
| Horas de GPU | 452,6 h (PUE: 1,13) |
| Energia total | 1432,0264 kWh |
| Emisiones de CO₂eq | 930,817 kg |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo (transformer, MoE, SSM, etc.) ni sobre el dataset utilizado. La unica informacion de entrenamiento disponible es la relativa al consumo de recursos: se emplearon 4 GPUs NVIDIA H100 en la region `asia-south1` durante 452,6 horas, con un factor de eficiencia energetica (PUE) de 1,13. El consumo total de energia fue de 1432,0264 kWh, lo que resulto en 930,817 kg de CO₂eq, calculados mediante la herramienta CodeCarbon. No se mencionan tecnicas como RLHF, DPO ni innovaciones en el proceso de entrenamiento.

## Capacidades

No aplica. Este repositorio no contiene un modelo con capacidades de generacion, razonamiento, codigo, vision, tool calling, agentes o procesamiento multilingue. Se trata exclusivamente de un registro de emisiones de carbono.

## Casos de uso

No aplica como modelo de IA. El repositorio puede utilizarse como referencia para:

- Auditoria ambiental de entrenamientos: permite consultar la metodologia y los valores de emisiones de un entrenamiento real, util para estimar el impacto de futuros proyectos.
- Educacion en Green AI: sirve como ejemplo practico de como documentar la huella de carbono en un model card, siguiendo las directrices de la asignatura TDS GA8.
- Comparacion de eficiencia energetica: los datos de PUE, horas de GPU y emisiones pueden compararse con otros entrenamientos para evaluar la sostenibilidad de distintas configuraciones de hardware.
- Integracion en informes de sostenibilidad: los valores reportados pueden citarse en articulos o reportes que analicen el coste ambiental del entrenamiento de modelos.
- Desarrollo de herramientas de medicion: el uso de CodeCarbon como fuente de datos puede inspirar la implementacion de sistemas similares en otros proyectos.
- Planificacion de infraestructura: los datos de consumo energetico y emisiones ayudan a dimensionar los recursos necesarios y su impacto en la huella de carbono de una organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene evaluaciones de rendimiento del modelo, ya que no se trata de un modelo de IA.

## Requisitos de hardware

Los requisitos de hardware documentados corresponden al entrenamiento, no a la inferencia:

- Hardware de entrenamiento: 4 GPUs NVIDIA H100.
- Horas de GPU: 452,6 horas.
- Consumo energetico total: 1432,0264 kWh.
- Region de computo: asia-south1 (Google Cloud).
- No se proporcionan requisitos de VRAM para inferencia, GPUs recomendadas para despliegue, ni opciones de ejecucion (vLLM, llama.cpp, Ollama, TGI, etc.).

## Comparativa con modelos similares

No disponible. No existe informacion sobre el modelo entrenado ni sobre alternativas comparables, ya que el repositorio no contiene un modelo de IA.

## Limitaciones y advertencias

- Este repositorio no es un modelo de IA; no puede utilizarse para tareas de generacion, analisis o procesamiento de datos.
- Los datos de emisiones corresponden a una ejecucion especifica y pueden no ser representativos de otros entrenamientos con diferente hardware o region.
- La licencia no esta especificada, por lo que se desconoce si los datos pueden reutilizarse comercialmente.
- No se indica el modelo concreto que se entreno, lo que limita la reproducibilidad del registro.
- La informacion sobre el dataset, la arquitectura y los hiperparametros es inexistente, impidiendo cualquier evaluacion tecnica del proceso.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un material academico de uso interno.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/24F1001287/tds-carbon-card
- Repositorios similares (misma plantilla, otros autores): 
  - https://huggingface.co/AvanthikaShydh/tds-carbon-card
  - https://huggingface.co/JayashreeR/tds-carbon-card
  - https://huggingface.co/subhamtheprogrammer/tds-carbon-card
  - https://huggingface.co/shyam1504/tds-carbon-card
  - https://huggingface.co/deepti-iitm/tds-carbon-card
