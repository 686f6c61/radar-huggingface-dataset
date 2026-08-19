# Shaik2002/tds-carbon-card

## Resumen
El repositorio `Shaik2002/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a un entrenamiento realizado en el marco del proyecto TDS GA8. Documenta las emisiones de CO₂ equivalente generadas durante un proceso de pre-entrenamiento, junto con el hardware utilizado, la región, el consumo energético y el tiempo de cómputo. Este tipo de tarjetas de carbono responde a la creciente demanda de transparencia en el impacto ambiental de la IA, y se enmarca en iniciativas como Green AI que buscan medir y reducir la huella de carbono de los modelos. La tarjeta fue creada por el usuario Shaik2002 en agosto de 2026 y no dispone de pesos, arquitectura ni ninguna capacidad de inferencia.

## Especificaciones técnicas

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

## Arquitectura y entrenamiento

No se trata de un modelo entrenado en el sentido convencional. El repositorio es una ficha de contabilidad de carbono que reporta los datos de una ejecución de entrenamiento previa. Según la información de la model card, el entrenamiento se realizó con 4 GPUs NVIDIA V100 en la región us-east1, con un total de 326,1 horas de GPU (PUE 1,33), un consumo energético de 520,4556 kWh y unas emisiones de 218,591 kg de CO₂eq. No se detallan datos sobre el dataset, el tipo de modelo o el proceso de entrenamiento, ya que el objetivo no es describir el modelo sino su impacto ambiental.

## Capacidades

- No aplica. Este repositorio no contiene un modelo de IA utilizable. No puede generar texto, razonar, procesar código ni realizar ninguna tarea de inferencia.
- Su única función es servir como documentación de la huella de carbono de un entrenamiento concreto.

## Casos de uso

- Auditoría interna de sostenibilidad: una empresa u organización puede utilizar este tipo de tarjetas para registrar y reportar las emisiones de CO₂ de sus experimentos de entrenamiento, permitiendo un seguimiento de su impacto ambiental.
- Transparencia en publicaciones académicas: al adjuntar estas tarjetas a papers o informes técnicos, los autores proporcionan datos verificables sobre el coste energético de sus modelos.
- Comparativa de eficiencia entre proveedores de infraestructura: analizando las tarjetas de distintos entrenamientos (por ejemplo, con diferentes GPUs o regiones) se puede evaluar qué configuraciones reducen la huella de carbono.
- Cumplimiento normativo y ESG: en el contexto de regulaciones sobre emisiones de carbono, estos registros pueden servir como evidencia de esfuerzos de reducción.
- Educación y concienciación: para enseñar a estudiantes o desarrolladores sobre el coste energético del entrenamiento de modelos, mostrando datos concretos de un caso real.
- Integración en pipelines de MLOps: se pueden generar estas tarjetas automáticamente tras cada entrenamiento y almacenarlas en un registro centralizado para tener un histórico de sostenibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene un modelo evaluable.

## Requisitos de hardware

- No aplica: no hay un modelo que ejecutar.
- El hardware reportado para el entrenamiento fue de 4 GPUs NVIDIA V100, pero no es un requisito para utilizar este repositorio, ya que no ofrece ninguna funcionalidad de inferencia.

## Comparativa con modelos similares

No existe comparativa con modelos de IA, ya que no se trata de un modelo. Sin embargo, se pueden comparar las tarjetas de carbono de otros usuarios del mismo proyecto TDS. En la búsqueda web se encontraron dos repositorios similares:

| Repositorio | Hardware | Región | GPU horas | Energía total | CO₂eq |
|---|---|---|---|---|---|
| Shaik2002/tds-carbon-card | 4x NVIDIA V100 | us-east1 | 326,1 h | 520,4556 kWh | 218,591 kg |
| 24f2005112/tds-carbon-card | no disponible | no disponible | no disponible | no disponible | no disponible |
| itsAayush/tds-carbon-card | 6x NVIDIA L40S | asia-south1 | 164,1 h | 482,454 kWh | 313,595 kg |

Estos datos muestran diferencias en eficiencia energética y emisiones según el hardware y la ubicación, aunque no son comparables en términos de rendimiento de modelo.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para ninguna tarea de procesamiento de lenguaje natural, visión o razonamiento.
- La información de la model card es escasa y no se proporcionan detalles sobre el modelo entrenado, por lo que no se puede evaluar su calidad o aplicabilidad.
- La licencia no está especificada, por lo que no se conocen las restricciones de uso del contenido.
- Las emisiones declaradas dependen de factores como el PUE del centro de datos y el mix eléctrico de la región, y pueden no ser representativas de otros entrenamientos similares.
- No se aportan datos de reproducción o verificación externa de las cifras de consumo energético.

## Enlaces

- [Hugging Face: Shaik2002/tds-carbon-card](https://huggingface.co/Shaik2002/tds-carbon-card)
- [24f2005112/tds-carbon-card (referencia)](https://huggingface.co/24f2005112/tds-carbon-card)
- [itsAayush/tds-carbon-card (referencia)](https://huggingface.co/itsAayush/tds-carbon-card)
- [Artículo sobre IA sostenible y huella de carbono (ResearchGate)](https://www.researchgate.net/publication/392727729_Sustainable_AI_Measuring_and_Reducing_Carbon_Footprint_in_Model_Training_and_Deployment)
