# Samprikta1507/tds-carbon-card

## Resumen

Este repositorio, `Samprikta1507/tds-carbon-card`, no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado al entrenamiento de un modelo dentro de la asignatura TDS GA8. Documenta la huella de CO₂ equivalente, el consumo energético y las especificaciones de hardware de una ejecución de pre-entrenamiento realizada con una GPU NVIDIA A100 en la región `ap-southeast1`. El objetivo es proporcionar transparencia sobre el impacto ambiental del entrenamiento de modelos, una práctica alineada con la iniciativa Green AI.

La relevancia de este repositorio radica en su función como ejemplo de buenas prácticas de reporte de emisiones, más que como un artefacto de IA utilizable. No se incluyen pesos, arquitectura ni capacidades de inferencia. Es un caso de estudio para desarrolladores e investigadores interesados en la sostenibilidad del entrenamiento de modelos, ya que muestra cómo cuantificar emisiones con herramientas como CodeCarbon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos) |

Datos de entrenamiento documentados:

| Parametro | Valor |
|---|---|
| Hardware | NVIDIA A100 (1 GPU) |
| Modo de entrenamiento | pre-training |
| Region | ap-southeast1 |
| Horas de GPU | 400.3 h (PUE: 1.41) |
| Energia total | 225.7692 kWh |
| Emisiones de CO₂ | 108.369 kg CO₂eq |
| Fuente de emisiones | CodeCarbon |

## Arquitectura y entrenamiento

No se proporciona informacion sobre arquitectura de red, ya que el repositorio no contiene un modelo. Los datos de entrenamiento indican que se realizo un pre-entrenamiento con una unica GPU NVIDIA A100 durante 400.3 horas, con un factor de eficiencia energetica (PUE) de 1.41. El consumo total de energia fue de 225.7692 kWh, lo que resulto en 108.369 kg de CO₂ equivalente, calculados mediante la libreria CodeCarbon. No se mencionan tecnicas como RLHF, DPO ni innovaciones arquitectonicas.

## Capacidades

- No dispone de capacidades de generacion de texto, razonamiento, codigo, vision ni otras funciones propias de un modelo de IA.
- Su unica funcion es documentar la huella de carbono de un entrenamiento especifico.
- Puede servir como referencia para replicar metodologias de contabilidad de emisiones en otros proyectos.

## Casos de uso

- Auditoria ambiental de entrenamientos: el repositorio sirve como plantilla para que otros equipos reporten sus emisiones de CO₂ de forma estandarizada, usando CodeCarbon y especificando hardware, region y PUE.
- Comparacion de eficiencia energetica: los datos de este repositorio pueden compararse con otros similares (p. ej., los de otros estudiantes de TDS GA8) para evaluar el impacto de diferentes GPUs y regiones en el consumo energetico.
- Investigacion en Green AI: investigadores pueden utilizar estos datos como evidencia de practicas de reporte de sostenibilidad en el entrenamiento de modelos.
- Educacion: en cursos de IA responsable, este ejemplo ilustra como medir y comunicar el coste ambiental de un entrenamiento.
- Optimizacion de recursos: los datos de horas de GPU y energia permiten estimar el coste economico y ambiental de futuros entrenamientos en infraestructuras similares.
- Desarrollo de politicas internas: empresas pueden usar este modelo de reporte para establecer directrices de reduccion de emisiones en sus pipelines de ML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene un modelo evaluable, por lo que no existen metricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El entrenamiento documentado utilizo una unica GPU NVIDIA A100.
- No se especifican requisitos de VRAM para inferencia, ya que no hay modelo desplegable.
- No se proporcionan opciones de despliegue (vLLM, llama.cpp, etc.) ni datos de latencia o throughput.
- Para reproducir el entrenamiento se necesitaria al menos una GPU A100 con la memoria correspondiente (40 GB o 80 GB, segun variante), aunque no se indica la cantidad exacta.

## Comparativa con modelos similares

No se trata de un modelo de IA, por lo que no es comparable con modelos como Llama, Mistral o Qwen. Sin embargo, existen otros repositorios de la misma asignatura TDS GA8 con proposito identico:

| Repositorio | Hardware | Region | Horas GPU | Energia (kWh) | CO₂ (kg) |
|---|---|---|---|---|---|
| Samprikta1507/tds-carbon-card | NVIDIA A100 (1 GPU) | ap-southeast1 | 400.3 | 225.77 | 108.37 |
| Amrinder05/tds-carbon-card | NVIDIA RTX 4090 (4 GPUs) | asia-south1 | 95.4 | 224.95 | 146.22 |
| Akash7677/tds-carbon-card | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa muestra diferencias significativas en eficiencia: el uso de una A100 en `ap-southeast1` genera menos CO₂ por kWh que el RTX 4090 en `asia-south1`, a pesar de consumir mas horas de GPU.

## Limitaciones y advertencias

- No es un modelo de IA: no puede utilizarse para inferencia, generacion ni ninguna tarea de ML.
- La licencia no esta especificada, por lo que el uso del contenido del repositorio queda sujeto a las condiciones generales de Hugging Face.
- Los datos de emisiones dependen de la region y del factor de carbono de la red electrica local; no son extrapolables a otras ubicaciones sin recalcular.
- No se incluyen detalles sobre el modelo entrenado (arquitectura, parametros, dataset), lo que limita la reproducibilidad del experimento.
- El repositorio tiene cero descargas y cero likes, lo que sugiere que es un trabajo academico sin difusion amplia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Samprikta1507/tds-carbon-card
- Perfil de GitHub del autor: https://github.com/samprikta1507
- Repositorio relacionado en GitHub (tds-ga4): https://github.com/samprikta1507/tds-ga4/tree/main
- Repositorio similar de otro autor: https://huggingface.co/Akash7677/tds-carbon-card
- Repositorio similar de otro autor: https://huggingface.co/Amrinder05/tds-carbon-card
- Documentacion de Model Card Toolkit (TensorFlow): https://www.tensorflow.org/responsible_ai/model_card_toolkit/guide
