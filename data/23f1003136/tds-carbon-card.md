# 23f1003136/tds-carbon-card

## Resumen

El repositorio `23f1003136/tds-carbon-card` no contiene un modelo de IA, sino una tarjeta de contabilidad de carbono (carbon card) que documenta la huella ambiental de una ejecución de entrenamiento de un modelo asignado en el curso TDS GA8. El autor, Ankit Kumar (usuario `23f1003136`), estudiante del IIT Madras, publica este registro como parte de una práctica académica sobre Green AI.

El documento especifica que el entrenamiento se realizó en modo pre-training sobre 3 GPU NVIDIA H100 en la región us-east1, con un consumo total de 674,23 kWh y unas emisiones de 283,177 kg de CO₂ equivalente, calculadas mediante la herramienta CodeCarbon. No se proporciona información sobre la arquitectura, los parámetros o el propósito del modelo entrenado, ya que el objetivo del repositorio es exclusivamente la transparencia en la contabilidad energética.

La relevancia de esta publicación radica en su contribución a la estandarización de prácticas de reporte de emisiones en el entrenamiento de modelos, un área de creciente interés en la comunidad de IA responsable. Sin embargo, al carecer de pesos, código o especificaciones del modelo, no es utilizable para tareas de inferencia ni despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo entrenado. El repositorio documenta únicamente los datos de consumo energético y emisiones asociados a una ejecución de pre-training. Según la model card, el entrenamiento se realizó con 3 GPU NVIDIA H100 durante 269,8 horas, con un factor de eficiencia energética (PUE) de 1,19 en el centro de datos us-east1. El consumo total fue de 674,23 kWh, lo que resultó en 283,177 kg de CO₂ equivalente, calculados con la librería CodeCarbon. No se detallan datos sobre el dataset, el número de tokens procesados ni técnicas de optimización como RLHF o DPO.

## Capacidades

- No es un modelo desplegable: no incluye pesos, tokenizador ni código de inferencia.
- Funciona como registro de auditoría ambiental: documenta emisiones de CO₂, consumo energético y hardware utilizado.
- Permite reproducir el cálculo de huella de carbono con CodeCarbon si se dispone de los datos de entrenamiento originales.
- Sirve como referencia metodológica para prácticas de Green AI en entornos académicos.
- No ofrece capacidades de generación de texto, razonamiento, código, visión ni tool calling.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: el repositorio sirve como plantilla para que otros equipos documenten sus emisiones de entrenamiento siguiendo el mismo formato.
- Reportes ESG (ambientales, sociales y de gobernanza): los datos de emisiones pueden citarse en informes de responsabilidad corporativa de centros de investigación.
- Investigación en eficiencia energética: los valores de PUE, GPU horas y kWh permiten comparar la eficiencia de diferentes configuraciones de hardware.
- Docencia en Green AI: el caso práctico puede utilizarse en cursos de IA responsable para ilustrar cómo medir el impacto ambiental de un entrenamiento.
- Benchmarking de centros de datos: los datos regionales (us-east1) y de hardware (H100) pueden contrastarse con otras ejecuciones en diferentes regiones o GPUs.
- Cumplimiento normativo: en jurisdicciones con requisitos de transparencia energética, este tipo de registro puede servir como evidencia de cumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento del modelo entrenado, ya que su propósito es exclusivamente la contabilidad de carbono.

## Requisitos de hardware

- El entrenamiento documentado utilizó 3 GPU NVIDIA H100.
- No se especifican requisitos de VRAM para inferencia, ya que no se distribuyen pesos.
- El consumo energético total fue de 674,23 kWh durante 269,8 horas de entrenamiento.
- No se proporcionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) al no existir un modelo servible.
- No se indican datos de latencia ni throughput.

## Comparativa con modelos similares

Existen otros repositorios con el mismo propósito de contabilidad de carbono en el marco del curso TDS GA8, como `AdityaV26/tds-carbon-card` y `Shiv3456/tds-carbon-card`. La comparación se limita a los datos de entrenamiento documentados:

| Repositorio | Hardware | Modo | Region | GPU horas | Energia (kWh) | CO₂ (kg) |
|---|---|---|---|---|---|---|
| 23f1003136/tds-carbon-card | 3x H100 | pre-training | us-east1 | 269,8 | 674,23 | 283,18 |
| AdityaV26/tds-carbon-card | 3x A100 | fine-tuning | ap-southeast1 | 421,5 | 733,41 | 352,04 |
| Shiv3456/tds-carbon-card | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de IA utilizable: carece de pesos, tokenizador y código de inferencia.
- Los datos de emisiones corresponden a una única ejecución de entrenamiento y no son generalizables a otros escenarios.
- La licencia no está especificada, por lo que el uso del contenido del repositorio fuera del ámbito académico puede presentar incertidumbre legal.
- No se detalla la metodología completa de cálculo de emisiones más allá del uso de CodeCarbon, lo que limita la reproducibilidad exacta.
- El repositorio no incluye información sobre el modelo entrenado (arquitectura, dataset, finalidad), lo que impide evaluar la relevancia del gasto energético.
- La fecha de creación (2026-08-23) es futura respecto a la fecha de redacción de esta ficha, lo que sugiere que los datos pueden ser simulados o corresponder a un ejercicio académico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/23f1003136/tds-carbon-card
- Perfil de GitHub del autor: https://github.com/23f1003136
- Repositorio similar (AdityaV26): https://huggingface.co/AdityaV26/tds-carbon-card
- Repositorio similar (Shiv3456): https://huggingface.co/Shiv3456/tds-carbon-card
- Estándar Open Model Card: https://openmodelcard.org/
