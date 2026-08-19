# shivainlabs/tds-carbon-card

## Resumen
Este repositorio no contiene un modelo de inteligencia artificial, sino una ficha de contabilidad de carbono (model card) asociada a una ejecución de entrenamiento dentro del programa TDS GA8. Documenta el consumo energético y las emisiones de CO₂ equivalente generadas durante un proceso de fine-tuning realizado sobre hardware NVIDIA V100.

El autor, shivainlabs, publica esta tarjeta como parte de una práctica académica centrada en "Green AI" o IA sostenible. La información disponible se limita a métricas de emisiones, energía consumida y características del hardware utilizado; no se incluyen detalles sobre la arquitectura del modelo entrenado, sus pesos, ni su funcionalidad.

Su relevancia radica en ejemplificar cómo se puede reportar el impacto ambiental de un entrenamiento de modelos, siguiendo estándares como CodeCarbon. No obstante, para un desarrollador que busca un modelo utilizable, este repositorio carece de cualquier artefacto de modelo o código de inferencia.

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
No se proporciona información sobre la arquitectura del modelo subyacente. Los únicos datos de entrenamiento disponibles son los siguientes:

- Hardware: 4 GPUs NVIDIA V100
- Modo de entrenamiento: fine-tuning
- Región: us-east1
- Horas de GPU: 382,2 horas (PUE: 1,56)
- Energía total consumida: 715,4784 kWh
- Emisiones de CO₂: 300,501 kg CO₂eq

Estos datos fueron generados con la herramienta CodeCarbon, que estima la huella de carbono de los entrenamientos. No se indica el tipo de modelo, el conjunto de datos ni el número de tokens procesados.

## Capacidades
- No se documenta ninguna capacidad funcional del modelo, ya que el repositorio no contiene un modelo propiamente dicho.
- El único contenido es la medición de emisiones y energía, que no constituye una capacidad de IA.

## Casos de uso
- Auditoría ambiental de entrenamientos: el repositorio sirve como plantilla para registrar emisiones de CO₂ en proyectos de IA, útil para organizaciones que deban reportar su impacto ambiental.
- Educación en IA sostenible: puede usarse como ejemplo en cursos sobre Green AI para ilustrar cómo se calcula la huella de carbono con CodeCarbon.
- Comparativa de eficiencia energética: los datos de emisiones por hora de GPU pueden compararse con otros repositorios similares (p. ej., chandrasekhariitm/tds-carbon-card) para evaluar diferencias entre hardware y regiones.
- Cumplimiento normativo: en contextos donde se exija transparencia sobre el coste energético de los modelos, esta tarjeta ofrece un formato base.
- Investigación sobre optimización de recursos: los valores de PUE y consumo pueden analizarse para optimizar futuros entrenamientos.
- Documentación de proyectos: sirve como anexo de sostenibilidad en informes técnicos o memorias de proyectos de IA.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene métricas de calidad del modelo ni comparaciones con otras arquitecturas.

## Requisitos de hardware
- No se especifican requisitos de hardware para inferencia, ya que no hay modelo desplegable.
- El entrenamiento documentado utilizó 4 GPUs NVIDIA V100, lo que indica un entorno de gama alta para fine-tuning.
- No se proporcionan opciones de despliegue, latencia ni throughput.

## Comparativa con modelos similares
No disponible. Este repositorio no es un modelo de IA comparable con otros. Existen repositorios paralelos del mismo ejercicio académico (p. ej., shyam1504/tds-carbon-card, chandrasekhariitm/tds-carbon-card) que documentan entrenamientos con diferente hardware y emisiones, pero no contienen modelos funcionales.

## Limitaciones y advertencias
- No es un modelo de IA: no se puede descargar, cargar ni utilizar para ninguna tarea de inferencia.
- Falta de contexto técnico: no se indica qué modelo se entrenó, con qué datos ni con qué objetivo.
- Datos de emisiones específicos de una ejecución concreta: los valores de CO₂ dependen de la región eléctrica (us-east1), el hardware y la duración; no son generalizables.
- Sin licencia declarada: no se especifican términos de uso para el contenido del repositorio.
- Fecha de creación futura (2026-08-19) y cero descargas, lo que sugiere un repositorio de práctica académica sin utilidad operativa.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/shivainlabs/tds-carbon-card
- Repositorio similar (chandrasekhariitm): https://huggingface.co/chandrasekhariitm/tds-carbon-card
- Repositorio similar (shyam1504): https://huggingface.co/shyam1504/tds-carbon-card
- Perfil de GitHub del autor: https://github.com/shivainlabs
