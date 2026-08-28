# dev-verma/carbon-emissions-model-card

## Resumen

Este repositorio de Hugging Face no contiene un modelo de inteligencia artificial, sino una *model card* de emisiones de carbono asociada a un proceso de fine-tuning. El autor, dev-verma, documenta el impacto ambiental de un entrenamiento realizado con 7 GPU NVIDIA L40S durante 377,8 horas, estimando unas emisiones de 169,942 kg de CO2 equivalente según la metodología de Lacoste et al. (2019). La tarjeta sigue el formato estándar de Hugging Face para reportar la huella de carbono, incluyendo el hardware, el consumo energético y la intensidad de carbono de la región.

La relevancia de esta publicación radica en la creciente demanda de transparencia ambiental en el desarrollo de modelos de IA. Aunque no hay información sobre el modelo subyacente (arquitectura, parámetros, tarea), la tarjeta sirve como ejemplo de buenas prácticas para reportar emisiones, alineándose con iniciativas como las *Sustainability Model Cards* propuestas recientemente en la literatura académica. No se dispone de datos sobre el modelo en sí, solo sobre su huella de carbono.

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

No se proporciona información sobre la arquitectura del modelo, el dataset de entrenamiento, ni el tipo de fine-tuning realizado. La única información disponible se refiere al proceso de entrenamiento desde el punto de vista energético: se utilizaron 7 GPU NVIDIA L40S (TDP de 350 W cada una) durante 377,8 horas, con un PUE de 1,53, lo que resultó en un consumo total de 1416,183 kWh. La ubicación geográfica fue `europe-north1` (presumiblemente un centro de datos de Google Cloud en Finlandia), con una intensidad de carbono de 120 gCO2eq/kWh. Las emisiones totales se calcularon en 169,942 kg CO2eq, siguiendo la metodología de Lacoste et al. (2019) y utilizando la herramienta CodeCarbon.

## Capacidades

- No se describen capacidades funcionales del modelo (generación de texto, razonamiento, código, etc.) porque la tarjeta no documenta un modelo de IA, sino su impacto ambiental.
- La única "capacidad" documentada es la de reportar emisiones de carbono de forma estandarizada, siguiendo el formato de Hugging Face para model cards de CO2.
- No hay información sobre tool calling, agentes, multilingüismo ni otras funcionalidades típicas de modelos de lenguaje.

## Casos de uso

- **Auditoría ambiental de entrenamientos de IA**: esta tarjeta puede usarse como referencia para calcular y reportar las emisiones de CO2 de un proceso de fine-tuning, siguiendo la misma metodología y formato.
- **Comparación de eficiencia energética entre configuraciones de hardware**: los datos de consumo (kWh) y emisiones (kg CO2eq) permiten comparar el coste ambiental de diferentes infraestructuras (por ejemplo, 7 GPU L40S frente a otras configuraciones).
- **Cumplimiento de requisitos de transparencia en publicaciones académicas**: investigadores que necesiten incluir la huella de carbono en sus papers pueden usar esta tarjeta como plantilla, citando la metodología de Lacoste et al. (2019).
- **Optimización de recursos en la nube**: los datos de PUE y localización geográfica ayudan a elegir regiones con menor intensidad de carbono para entrenamientos futuros.
- **Educación y divulgación**: sirve como ejemplo práctico de cómo se calculan las emisiones de un entrenamiento, útil en cursos sobre IA sostenible.
- **Integración en dashboards de sostenibilidad**: los valores de emisiones pueden incorporarse a paneles como el Hugging Face Emissions Dashboard para monitorizar el impacto acumulado de proyectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Esta tarjeta no incluye métricas de rendimiento del modelo (MMLU, HumanEval, etc.) porque su propósito es documentar el impacto ambiental, no la calidad del modelo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible, ya que no se especifica el modelo.
- **GPU recomendadas**: no aplicable; el entrenamiento se realizó con 7 GPU NVIDIA L40S (TDP 350 W cada una), pero no se indica si son necesarias para inferencia.
- **¿Cabe en consumer GPU?**: no disponible.
- **Opciones de despliegue**: no disponible.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No disponible. No se puede comparar con otros modelos porque no se conoce la arquitectura ni la tarea del modelo subyacente. La tarjeta solo documenta emisiones, y no hay datos de otros modelos con los que comparar en este contexto.

## Limitaciones y advertencias

- **Sesgos conocidos**: no aplicable, al no ser un modelo de IA.
- **Riesgo de alucinación**: no aplicable.
- **Limitaciones de contexto o idioma**: no aplicable.
- **Restricciones de licencia**: la licencia no está especificada; se desconoce si el contenido de la tarjeta puede reutilizarse libremente.
- **Caveat importante**: la estimación de emisiones depende de la metodología y de los valores asumidos (TDP, PUE, intensidad de carbono). Estos valores pueden variar en la práctica; por ejemplo, el TDP no siempre refleja el consumo real de la GPU. Además, la tarjeta no indica qué modelo se entrenó, por lo que su utilidad como referencia técnica es limitada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dev-verma/carbon-emissions-model-card
- Paper de referencia (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Documentación de Hugging Face sobre emisiones de CO2: https://huggingface.co/docs/hub/en/model-cards-co2
- Dashboard de emisiones de Hugging Face: https://energy-label.streamlit.app/
- Paper sobre Sustainability Model Cards: https://arxiv.org/html/2507.19559v1
