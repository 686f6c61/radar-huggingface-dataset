# Harshini10112006/tds-carbon-card

## Resumen
Este repositorio de Hugging Face, identificado como `Harshini10112006/tds-carbon-card`, no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono y energía asociada a una ejecución de entrenamiento de un modelo en el marco del curso TDS GA8. El autor documenta las emisiones de CO₂ equivalente generadas durante el preentrenamiento, con datos concretos de hardware, consumo energético y ubicación geográfica. Su propósito es servir como registro de transparencia medioambiental para el entrenamiento de modelos, alineado con las prácticas de Green AI.

No se proporciona ninguna información sobre arquitectura, parámetros, contexto o capacidades del modelo entrenado, ya que el repositorio se centra exclusivamente en la métrica de sostenibilidad. Por tanto, esta ficha describe el contenido real del repositorio, que es una tarjeta de emisiones, y no un modelo utilizable para inferencia.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica el modelo entrenado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

Datos de entrenamiento documentados en la tarjeta:

| Parametro | Valor |
|---|---|
| Hardware | NVIDIA RTX 4090 (4 GPUs) |
| Modo de entrenamiento | pre-training |
| Region | us-central1 |
| Horas de GPU | 248.8 h (PUE: 1.51) |
| Energia total | 676.2384 kWh |
| Emisiones de CO₂ | 236.683 kg CO₂eq |
| Herramienta de medicion | CodeCarbon |

## Arquitectura y entrenamiento
No se describe ninguna arquitectura de modelo en este repositorio. La unica informacion sobre entrenamiento se limita a los datos de consumo: se utilizaron 4 GPUs NVIDIA RTX 4090 durante 248.8 horas en modo pre-training, en la region us-central1, con un factor de eficiencia energetica (PUE) de 1.51. La energia total consumida fue de 676.2384 kWh, lo que resulto en 236.683 kg de CO₂ equivalente, medidos con la herramienta CodeCarbon. No se indica el tipo de modelo, el dataset, ni el proceso de optimizacion.

## Capacidades
- No aplica: este repositorio no contiene un modelo de IA con capacidades de generacion, razonamiento, codigo, vision u otras.
- Su unica funcion es documentar la huella de carbono de un entrenamiento especifico, por lo que no es utilizable para tareas de inferencia o procesamiento de lenguaje natural.

## Casos de uso
- Auditoria de sostenibilidad en entrenamiento de modelos: el repositorio sirve como ejemplo de como registrar y publicar las emisiones de CO₂ de un entrenamiento, util para equipos que necesitan cumplir politicas de Green AI o reportes de impacto ambiental.
- Comparacion de costes energeticos entre configuraciones: al existir repositorios similares con otros hardware (p. ej., V100) y modos (fine-tuning), se puede usar como referencia para estimar el coste de carbono de diferentes opciones de entrenamiento.
- Educacion y divulgacion: puede emplearse en cursos o talleres sobre IA responsable para ilustrar la importancia de medir el consumo energetico.
- Integracion en pipelines de CI/CD para monitorizacion ambiental: aunque no es un modelo, el formato de tarjeta puede inspirar la automatizacion de metricas de emisiones en entornos de entrenamiento.
- Documentacion de transparencia en publicaciones academicas: investigadores pueden citar este tipo de tarjetas para declarar el impacto ambiental de sus experimentos.
- Desarrollo de herramientas de contabilidad de carbono: los datos aqui publicados pueden servir para calibrar o validar herramientas de estimacion de emisiones en centros de datos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible, ya que el repositorio no contiene un modelo evaluable. No hay datos de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware
- El entrenamiento documentado utilizo 4 GPUs NVIDIA RTX 4090, que son tarjetas de consumo para estaciones de trabajo, no GPUs de centro de datos.
- No se especifican requisitos de VRAM para inferencia porque no se ofrece ningun modelo.
- Para reproducir el entrenamiento se necesitaria un hardware equivalente (4x RTX 4090) y un entorno con acceso a la region us-central1.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, etc.) al no existir pesos ni modelo.

## Comparativa con modelos similares
No se trata de un modelo, sino de una tarjeta de carbono. Existen repositorios equivalentes con el mismo proposito:

| Repositorio | Hardware | Modo | Horas GPU | Energia (kWh) | CO₂ (kg) |
|---|---|---|---|---|---|
| Harshini10112006/tds-carbon-card | RTX 4090 (4) | pre-training | 248.8 | 676.24 | 236.68 |
| adisinha95/tds-carbon-card | V100 (4) | fine-tuning | 447.8 | 709.32 | 85.12 |

La comparacion muestra diferencias en el hardware y el modo de entrenamiento, lo que afecta al consumo y a las emisiones. No hay modelos comparables en cuanto a capacidades, ya que ninguno de estos repositorios publica un modelo.

## Limitaciones y advertencias
- No es un modelo de IA: no puede utilizarse para ninguna tarea de inferencia, generacion o procesamiento de datos.
- La informacion sobre el modelo entrenado (arquitectura, parametros, dataset) no esta disponible en este repositorio.
- Las emisiones reportadas dependen de la ubicacion geografica (us-central1) y del mix electrico de esa region, por lo que no son extrapolables a otras zonas.
- La licencia no esta especificada, por lo que el uso del contenido del repositorio queda sin definir legalmente.
- No se ofrecen pesos, tokenizadores ni configuraciones, por lo que no es reproducible el entrenamiento desde este repositorio.
- La ausencia de informacion sobre el modelo subyacente limita cualquier evaluacion de sesgos, alucinaciones o rendimiento.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/Harshini10112006/tds-carbon-card
- Repositorio similar (Jesmelchi/tds-carbon-card): https://huggingface.co/Jesmelchi/tds-carbon-card
- Repositorio similar (adisinha95/tds-carbon-card): https://huggingface.co/adisinha95/tds-carbon-card
