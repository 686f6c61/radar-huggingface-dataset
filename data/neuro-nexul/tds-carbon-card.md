# neuro-nexul/tds-carbon-card

## Resumen

El repositorio `neuro-nexul/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a un entrenamiento de modelo realizado en el marco del ejercicio académico TDS GA8. Su propósito es documentar las emisiones de CO₂ equivalente generadas durante una sesión de pre-entrenamiento, siguiendo las prácticas de "Green AI" que buscan cuantificar el impacto ambiental del desarrollo de modelos.

El autor, `neuro-nexul`, publica una model card que detalla el hardware utilizado (2 GPUs NVIDIA V100), el tiempo de cómputo (102,5 horas GPU), el consumo energético total (75,03 kWh) y las emisiones resultantes (36,014 kg CO₂eq), calculadas con la herramienta CodeCarbon. No se proporciona ninguna especificación sobre arquitectura, parámetros, datos de entrenamiento o capacidades del modelo subyacente, ya que el repositorio se centra exclusivamente en la métrica ambiental.

Este tipo de repositorios es relevante en el contexto actual de sostenibilidad en IA, donde se exige transparencia sobre la huella de carbono de los modelos. Sin embargo, para un desarrollador o investigador que busque evaluar un modelo para uso práctico, este repositorio no ofrece información útil más allá del dato de emisiones.

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

No se describe ninguna arquitectura de modelo en la informacion proporcionada. El repositorio únicamente documenta el proceso de entrenamiento desde una perspectiva de consumo energético. Según la model card, el entrenamiento se realizó en modo pre-training sobre 2 GPUs NVIDIA V100, en la región `ap-southeast1`, con un total de 102,5 horas GPU y un PUE (Power Usage Effectiveness) de 1,22. El consumo energético total fue de 75,03 kWh, lo que resultó en 36,014 kg de CO₂ equivalente, calculados mediante la librería CodeCarbon.

No se especifican el número de tokens, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas en el entrenamiento. La información se limita a la contabilidad de carbono, sin detalles sobre el modelo en sí.

## Capacidades

No aplicable. Este repositorio no contiene un modelo de IA con capacidades de generación, razonamiento, código, visión u otras. Se trata exclusivamente de un registro de emisiones de carbono de un entrenamiento. Por tanto, no se pueden listar capacidades funcionales.

## Casos de uso

- Auditoría ambiental de entrenamientos de IA: el repositorio sirve como plantilla para documentar la huella de carbono de un proceso de entrenamiento, siguiendo el estándar de CodeCarbon y las directrices de Green AI.
- Educación en sostenibilidad: puede utilizarse en cursos o talleres sobre IA responsable para ilustrar cómo se mide y reporta el impacto energético de los modelos.
- Comparación de eficiencia energética: aunque no hay datos del modelo, el registro permite comparar el coste energético de diferentes configuraciones de hardware (en este caso, V100) en una misma región.
- Cumplimiento de políticas de transparencia: organizaciones que exigen informes de emisiones para sus proyectos de IA pueden usar este formato como referencia.
- Investigación sobre optimización de recursos: los datos de GPU horas y energía pueden alimentar estudios sobre cómo reducir el consumo en pre-entrenamiento.
- Repositorio de referencia para ejercicios académicos: otros estudiantes o investigadores pueden replicar la metodología para sus propios proyectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento del modelo (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros sistemas.

## Requisitos de hardware

No aplicable para inferencia, ya que no se distribuye ningún modelo. No obstante, el entrenamiento documentado utilizó:

- 2 GPUs NVIDIA V100
- 102,5 horas GPU en total
- Región `ap-southeast1` (posiblemente Google Cloud, dado el uso de CodeCarbon)
- Consumo energético de 75,03 kWh

No se proporcionan datos sobre VRAM, latencia o throughput, ni opciones de despliegue.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable porque este repositorio no contiene un modelo de IA. Existen otros repositorios con el mismo propósito y nombre (`notdaksha/tds-carbon-card`, `23f1000190/tds-carbon-card`), que parecen ser parte del mismo ejercicio académico TDS GA8 y documentan entrenamientos similares, pero no ofrecen especificaciones de modelo.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para ninguna tarea de procesamiento de lenguaje natural, generación de código u otras capacidades.
- Información incompleta: no se especifican la arquitectura, los parámetros, el dataset ni la licencia del modelo subyacente, lo que impide cualquier evaluación técnica.
- Datos de emisiones limitados: la medición de CO₂ se basa en estimaciones de CodeCarbon y puede no reflejar el impacto total del ciclo de vida (fabricación de hardware, refrigeración, etc.).
- Sin garantías de reproducibilidad: no se detallan las versiones de software ni la configuración exacta del entorno, por lo que replicar el entrenamiento sería difícil.
- Riesgo de confusión: al estar etiquetado como "model card", un usuario podría esperar un modelo funcional, pero solo encontrará un registro de carbono.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/neuro-nexul/tds-carbon-card
- Repositorio similar (notdaksha): https://huggingface.co/notdaksha/tds-carbon-card
- Repositorio similar (23f1000190): https://huggingface.co/23f1000190/tds-carbon-card
