# 24f2008544/tds-carbon-card

## Resumen

Este repositorio, identificado como `24f2008544/tds-carbon-card`, no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a un proceso de fine-tuning de un modelo no especificado. Publicado por el usuario `24f2008544` en Hugging Face, documenta las emisiones de CO₂ equivalente generadas durante el entrenamiento, siguiendo las prácticas de "Green AI" para la transparencia ambiental en el desarrollo de modelos. El repositorio forma parte de una asignación académica (TDS GA8) y su relevancia radica en ejemplificar cómo se puede reportar el impacto energético de un entrenamiento, un aspecto cada vez más demandado en la industria.

La tarjeta de modelo (model card) incluye datos concretos: 212,278 kg de CO₂eq emitidos, 442,246 kWh de energía total consumida, y 203,8 horas de GPU en dos NVIDIA H100, con un PUE de 1,55. No se especifica la arquitectura, el tamaño ni el propósito del modelo entrenado, por lo que esta ficha se centra en los datos de sostenibilidad disponibles y en el contexto de su publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Emisiones de CO₂eq | 212,278 kg |
| Energia total consumida | 442,246 kWh |
| Horas de GPU | 203,8 h |
| Hardware de entrenamiento | 2x NVIDIA H100 |
| Region de entrenamiento | ap-southeast1 |
| PUE | 1,55 |
| Tipo de entrenamiento | fine-tuning |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo subyacente (si es un transformer, MoE, SSM, etc.) ni sobre el dataset utilizado. El repositorio solo documenta el proceso de fine-tuning: se emplearon dos GPUs NVIDIA H100 durante 203,8 horas, con un factor de eficiencia energetica (PUE) de 1,55, lo que resulto en un consumo total de 442,246 kWh y unas emisiones de 212,278 kg de CO₂eq. La medicion se realizo con la herramienta CodeCarbon, y la ubicacion geografica del centro de datos fue ap-southeast1. No se mencionan tecnicas como RLHF, DPO ni innovaciones arquitectonicas.

## Capacidades

Este repositorio no implementa ninguna capacidad de IA. No genera texto, codigo, ni realiza razonamiento o vision. Su unica funcion es servir como registro de sostenibilidad para un entrenamiento previo. Por tanto, las capacidades se limitan a:

- Documentacion de emisiones de carbono y consumo energetico.
- Trazabilidad del hardware y la region de entrenamiento.
- Cumplimiento de practicas de "Green AI" para auditorias ambientales.

## Casos de uso

- Auditoria de sostenibilidad en proyectos de IA: el repositorio sirve como plantilla para que organizaciones reporten el impacto ambiental de sus entrenamientos, permitiendo comparar entre diferentes configuraciones de hardware y regiones.
- Investigacion en eficiencia energetica: los datos de PUE, horas de GPU y emisiones pueden utilizarse para estudiar la relacion entre el tipo de GPU y la huella de carbono en fine-tuning.
- Cumplimiento normativo: empresas que necesiten justificar sus emisiones ante reguladores pueden usar este tipo de registros como evidencia.
- Educacion y formacion: en cursos de "IA responsable", este ejemplo ilustra como medir y comunicar el coste ambiental de un modelo.
- Optimizacion de infraestructura: los datos permiten decidir si conviene entrenar en regiones con energias mas limpias o con hardware mas eficiente.
- Comparativa entre proveedores cloud: al existir repositorios similares con diferentes GPUs (por ejemplo, V100), se puede evaluar que opcion es mas sostenible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene metricas de rendimiento del modelo entrenado, solo datos de consumo energetico.

## Requisitos de hardware

- El entrenamiento documentado utilizo 2 GPUs NVIDIA H100, con un total de 203,8 horas de computo.
- No se especifican requisitos de VRAM para inferencia, ya que no se proporciona el modelo resultante.
- Para reproducir el entrenamiento se necesitaria al menos un nodo con 2x H100 (80 GB cada una) y una infraestructura similar a la descrita.
- No se indican opciones de despliegue (vLLM, llama.cpp, etc.) porque no hay modelo que servir.
- La latencia y el throughput no son aplicables.

## Comparativa con modelos similares

Existen otros repositorios de la misma tipologia (tarjetas de carbono) publicados por otros usuarios, como `23f3001819/tds-carbon-card` y `udit789/tds-carbon-card`. La comparativa se centra en los datos de emisiones y hardware:

| Repositorio | Hardware | GPU horas | Energia (kWh) | CO₂eq (kg) | Region |
|---|---|---|---|---|---|
| 24f2008544/tds-carbon-card | 2x H100 | 203,8 | 442,246 | 212,278 | ap-southeast1 |
| udit789/tds-carbon-card | 6x V100 | 370 | 985,68 | 413,986 | us-east1 |
| 23f3001819/tds-carbon-card | no disponible | no disponible | no disponible | no disponible | no disponible |

Se observa que el uso de H100 reduce las horas de GPU y las emisiones en comparacion con V100, aunque la region tambien influye en el factor de emision.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo de IA, por lo que no puede ser utilizado para inferencia ni para ninguna tarea de procesamiento de lenguaje natural.
- Los datos de emisiones dependen del factor de emision de la red electrica de la region (ap-southeast1) y del PUE reportado; no son extrapolables a otras ubicaciones.
- No se especifica la licencia del repositorio, lo que limita su reutilizacion legal.
- La ausencia de informacion sobre el modelo entrenado impide evaluar su calidad o rendimiento.
- Para uso en produccion, este registro no aporta valor directo; es solo una metrica ambiental.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/24f2008544/tds-carbon-card
- Perfil de GitHub del autor: https://github.com/24f2008544/
- Repositorio de codigo relacionado (tds-ga4): https://github.com/24f2008544/tds-ga4/blob/main/main.py
- Ejemplo de tarjeta similar: https://huggingface.co/23f3001819/tds-carbon-card
- Ejemplo de tarjeta similar con V100: https://huggingface.co/udit789/tds-carbon-card
