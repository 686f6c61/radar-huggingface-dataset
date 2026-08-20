# 25ds1000032/tds-carbon-card

## Resumen

Este repositorio, identificado como `25ds1000032/tds-carbon-card`, no contiene un modelo de inteligencia artificial, sino una **tarjeta de carbono** (carbon card) que documenta la huella de CO₂ y el consumo energético asociado a una ejecución de entrenamiento de un modelo. Fue creado por el usuario `25ds1000032` el 20 de agosto de 2026 y actualizado al día siguiente. El propósito es registrar de forma transparente el impacto ambiental de un entrenamiento realizado en el marco del programa TDS GA8, siguiendo prácticas de "IA verde" (Green AI).

La relevancia de este tipo de documentos radica en la creciente demanda de rendición de cuentas sobre el coste energético de los modelos de aprendizaje automático. Aunque no ofrece capacidades de inferencia ni pesos, sirve como referencia para auditorías de sostenibilidad y para comparar la eficiencia de distintos entrenamientos. No se dispone de información sobre el modelo al que corresponde este entrenamiento, su arquitectura o su finalidad.

## Especificaciones técnicas

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
| Hardware de entrenamiento | NVIDIA L40S (3 GPUs) |
| Modo de entrenamiento | pre-training |
| Region | europe-west4 |
| Horas de GPU | 386,1 h (PUE: 1,12) |
| Energia total consumida | 454,0536 kWh |
| Emisiones de CO₂ | 90,811 kg CO₂eq |
| Fuente de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se especifica ninguna arquitectura de modelo, ya que este repositorio no contiene un modelo, sino un registro de contabilidad de carbono. Los datos de entrenamiento indican que se utilizaron 3 GPUs NVIDIA L40S durante 386,1 horas, con un factor de eficiencia energética (PUE) de 1,12 en la región europe-west4. La energía total consumida fue de 454,0536 kWh, lo que resultó en 90,811 kg de CO₂ equivalente, medidos con la herramienta CodeCarbon. No se proporcionan detalles sobre el dataset, el número de tokens ni el proceso de optimización (RLHF, DPO, etc.).

## Capacidades

Este repositorio no implementa ninguna capacidad de inteligencia artificial. No genera texto, no procesa imágenes ni ejecuta razonamiento. Su única función es servir como documento de transparencia ambiental para un entrenamiento específico. Por tanto, no aplican las capacidades habituales de un modelo de lenguaje o multimodal.

## Casos de uso

- **Auditoría de sostenibilidad en proyectos de IA**: las organizaciones pueden utilizar esta tarjeta de carbono para verificar el cumplimiento de objetivos de reducción de emisiones en sus pipelines de entrenamiento.
- **Comparativa de eficiencia energética**: investigadores pueden contrastar los datos de este entrenamiento (90,811 kg CO₂eq) con otros para evaluar qué configuraciones de hardware y regiones son más limpias.
- **Reporte regulatorio**: en contextos donde se exige informar sobre el impacto ambiental de la computación, este documento sirve como evidencia formal.
- **Optimización de infraestructura**: los datos de PUE y horas de GPU permiten identificar ineficiencias y planificar migraciones a regiones con energías más renovables.
- **Educación y divulgación**: sirve como ejemplo práctico de cómo medir y comunicar la huella de carbono en el entrenamiento de modelos.
- **Integración en herramientas de MLOps**: plataformas de gestión de experimentos pueden consumir estos datos para generar informes automáticos de sostenibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento de modelo (MMLU, HumanEval, GSM8K, etc.) porque no es un modelo, sino un registro de emisiones.

## Requisitos de hardware

- **Hardware de entrenamiento**: 3 GPUs NVIDIA L40S, con un total de 386,1 horas de cómputo.
- **VRAM estimada para inferencia**: no aplica, ya que no hay modelo para inferencia.
- **GPU recomendadas**: no disponible.
- **Despliegue en consumer GPU**: no aplica.
- **Opciones de despliegue**: no aplica (vLLM, llama.cpp, Ollama, TGI, etc. no son relevantes).
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo y no existen alternativas comparables en el mismo sentido. Las tarjetas de carbono de otros entrenamientos podrían compararse, pero no se proporcionan datos de otros proyectos en la información disponible.

## Limitaciones y advertencias

- **No es un modelo**: no ofrece ninguna funcionalidad de IA; intentar usarlo como tal sería un error.
- **Datos limitados**: no se indica a qué modelo corresponde el entrenamiento, ni su arquitectura, tamaño o propósito.
- **Precisión de las mediciones**: las emisiones se calcularon con CodeCarbon y dependen de factores como el mix eléctrico de la región; pueden variar según la fuente de datos.
- **Licencia y uso**: no se especifica licencia, por lo que se desconoce si los datos pueden reutilizarse libremente.
- **Fecha futura**: la fecha de creación (2026) es posterior a la actual, lo que sugiere que podría tratarse de un proyecto simulado o de un error en la metadata.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/25ds1000032/tds-carbon-card)
