# 23f3000810/tds-carbon-card

## Resumen

El repositorio `23f3000810/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino una *model card* de contabilidad de carbono asociada a un proceso de fine-tuning realizado en el marco de la asignación TDS GA8. El documento, publicado por el usuario `23f3000810`, registra las emisiones de CO₂ equivalente, el consumo energético y las características del hardware utilizado durante el entrenamiento. Su propósito es dar transparencia sobre el impacto ambiental de una ejecución concreta de entrenamiento, siguiendo prácticas de "IA verde" (Green AI).

El repositorio incluye metadatos estructurados en formato YAML (`co2_eq_emissions`) y una breve descripción en la model card. No se proporciona ningún peso, arquitectura, dataset o código de inferencia. Por tanto, no es un modelo utilizable para tareas de generación, clasificación o razonamiento, sino un artefacto de documentación ambiental.

La relevancia de este tipo de registros radica en la creciente demanda de transparencia sobre el coste energético de los modelos de IA, especialmente en entornos académicos y de investigación donde se busca cuantificar la huella de carbono de los experimentos. Aunque no aporta capacidades técnicas, sirve como ejemplo de buenas prácticas en la publicación de métricas de sostenibilidad.

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
| Formato de pesos | no disponible (no se incluyen pesos) |

## Arquitectura y entrenamiento

No se dispone de información sobre arquitectura, ya que el repositorio no contiene un modelo. El único dato técnico relevante es que se realizó un fine-tuning sobre un hardware concreto (2 GPUs NVIDIA T4) en la región `asia-south1`. Según los metadatos, el entrenamiento consumió 83.5204 kWh de energía y generó 54.288 kg de CO₂ equivalente, con un total de 455.4 horas de GPU (PUE 1.31). Estos datos se registraron mediante la herramienta CodeCarbon.

No se indica qué modelo base se ajustó, ni el conjunto de datos utilizado, ni el tipo de tarea. La ausencia de estos detalles impide cualquier análisis técnico del proceso de entrenamiento.

## Capacidades

- No se trata de un modelo de IA ejecutable; no ofrece generación de texto, razonamiento, codificación ni ninguna otra capacidad funcional.
- Su única función es documentar el impacto ambiental de una ejecución de entrenamiento.
- No soporta tool calling, agentes, visión ni ningún otro tipo de interacción.

## Casos de uso

Dado que no es un modelo operativo, los casos de uso se limitan al ámbito de la gestión y auditoría ambiental en proyectos de IA:

- **Auditoría de sostenibilidad en proyectos de IA**: el repositorio sirve como registro verificable de las emisiones asociadas a un entrenamiento concreto, útil para informes de responsabilidad corporativa o académica.
- **Comparación de eficiencia energética entre configuraciones**: los datos de CO₂ y energía pueden emplearse para comparar el coste ambiental de diferentes hardware o estrategias de fine-tuning.
- **Cumplimiento de políticas de transparencia**: instituciones que exigen reportes de huella de carbono pueden usar este tipo de model cards como evidencia.
- **Educación en Green AI**: el ejemplo puede utilizarse en cursos para ilustrar cómo medir y comunicar el impacto energético de los modelos.
- **Optimización de recursos en la nube**: los datos de GPU horas y energía permiten estimar costes y eficiencia de futuros entrenamientos en infraestructuras similares.
- **Investigación sobre metodologías de contabilidad de carbono**: el formato de metadatos (CodeCarbon) puede analizarse para mejorar estándares de reporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no existir un modelo, no hay métricas de precisión, exactitud ni latencia.

## Requisitos de hardware

- El entrenamiento documentado utilizó 2 GPUs NVIDIA T4.
- No se especifican requisitos de VRAM para inferencia, ya que no hay modelo que ejecutar.
- No se indican opciones de despliegue ni latencia.
- El consumo energético registrado fue de 83.5204 kWh y 455.4 horas de GPU, lo que puede servir como referencia para estimar costes de experimentos similares.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA, por lo que no tiene comparativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- **No es un modelo ejecutable**: no contiene pesos ni código de inferencia, por lo que no puede utilizarse para ninguna tarea de IA.
- **Alcance limitado**: la información solo cubre el impacto ambiental de un entrenamiento concreto; no proporciona detalles sobre el modelo base ni la tarea.
- **Datos de emisiones dependientes de la región**: los valores de CO₂ están ligados a la región `asia-south1` y al hardware usado; no son generalizables a otros entornos.
- **Licencia no especificada**: no se indica bajo qué términos se distribuye el contenido, lo que puede limitar su reutilización.
- **Riesgo de interpretación errónea**: podría confundirse con un modelo de IA real, cuando en realidad es un documento de contabilidad ambiental.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/23f3000810/tds-carbon-card)
- [Repositorio en GitHub (tds-ga)](https://github.com/23f3000810/tds-ga)
- [Directorio de model cards de carbono en carbontxt.org](https://carbontxt.org/ai-model-cards)
