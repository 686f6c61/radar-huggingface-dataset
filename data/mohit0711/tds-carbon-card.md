# Mohit0711/tds-carbon-card

## Resumen

El repositorio `Mohit0711/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino una ficha de contabilidad de carbono correspondiente al entrenamiento de un modelo no especificado, en el marco de la asignación TDS GA8. El autor, Mohit0711, documenta el consumo energético y las emisiones de CO₂ equivalente generadas durante una fase de pre-entrenamiento realizada sobre dos GPU NVIDIA V100 en la región europe-north1 de Google Cloud. El objetivo es proporcionar transparencia sobre el impacto ambiental del entrenamiento, siguiendo prácticas de "Green AI".

Este tipo de repositorios son relevantes en el contexto actual de sostenibilidad en IA, donde cada vez más se exige reportar la huella de carbono de los modelos. Aunque no se trata de un modelo con capacidades de inferencia, su valor reside en servir como ejemplo de buenas prácticas de documentación ambiental. La ficha incluye datos de emisiones calculados con CodeCarbon, una herramienta estándar para este fin.

No se dispone de información sobre arquitectura, parámetros, contexto o licencia, ya que el repositorio no describe ningún modelo de IA subyacente. Por tanto, esta ficha se centra en los aspectos de eficiencia energética y contabilidad de carbono que sí están documentados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Hardware de entrenamiento | 2x NVIDIA V100 |
| Region de entrenamiento | europe-north1 |
| Horas de GPU | 348,6 h (PUE: 1,15) |
| Energia total consumida | 240,534 kWh |
| Emisiones de CO₂ equivalente | 28,864 kg CO₂eq |
| Herramienta de medicion | CodeCarbon |
| Tipo de entrenamiento | pre-training |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de modelo en el repositorio. Se trata únicamente de un registro de la huella de carbono de un proceso de entrenamiento no especificado. Los datos indican que se utilizaron dos GPU NVIDIA V100 durante 348,6 horas en la región europe-north1, con un factor de eficiencia energética (PUE) de 1,15. La energía total consumida fue de 240,534 kWh, lo que resultó en 28,864 kg de CO₂ equivalente, según el cálculo de CodeCarbon.

La ausencia de detalles sobre el modelo entrenado impide analizar cualquier innovación técnica o metodología de entrenamiento. El repositorio se limita a la contabilidad ambiental, probablemente como parte de un ejercicio académico o de demostración de herramientas de medición de carbono.

## Capacidades

- No es un modelo funcional: no genera texto, código, imágenes ni realiza ninguna tarea de inferencia.
- Función principal: documentar y reportar el impacto ambiental de un entrenamiento de IA.
- Proporciona métricas de consumo energético y emisiones de CO₂ en formato estructurado.
- Sirve como plantilla para futuros reportes de sostenibilidad en proyectos de IA.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: permite a equipos de desarrollo cuantificar las emisiones de sus entrenamientos y compararlas con estándares o metas internas.
- Reportes de responsabilidad corporativa: las empresas pueden usar estos datos para incluir en informes de ESG (ambiental, social y gobernanza) la huella de carbono de sus modelos.
- Optimización de infraestructura: al conocer el consumo energético por región y hardware, se pueden tomar decisiones sobre dónde ejecutar entrenamientos (por ejemplo, elegir regiones con menor factor de carbono).
- Educación y concienciación: sirve como ejemplo práctico de cómo aplicar herramientas como CodeCarbon en flujos de trabajo de machine learning.
- Investigación en eficiencia energética: los datos pueden alimentar estudios sobre el coste ambiental de diferentes configuraciones de hardware.
- Comparativa entre proveedores cloud: al disponer de métricas de emisiones, se puede evaluar el impacto de distintas nubes o regiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible, ya que el repositorio no describe un modelo con capacidades de rendimiento. Los únicos datos cuantitativos son los de consumo energético y emisiones, que no son comparables con métricas de precisión o calidad de modelo.

## Requisitos de hardware

- El entrenamiento documentado utilizó 2 GPU NVIDIA V100, cada una con 16 GB de VRAM (modelo estándar V100).
- No se especifican requisitos de hardware para inferencia, ya que no hay modelo desplegable.
- La región europe-north1 corresponde a un centro de datos en Finlandia, conocido por su baja intensidad de carbono en la red eléctrica.
- Para reproducir el entrenamiento se necesitaría una infraestructura similar: al menos 2 GPU V100 con soporte CUDA y acceso a la herramienta CodeCarbon para medir emisiones.
- No se indican opciones de despliegue ni latencia, al no existir un modelo servible.

## Comparativa con modelos similares

En la búsqueda web se encontró un repositorio casi idéntico: `itsAayush/tds-carbon-card`, que documenta otro entrenamiento de la misma asignación TDS GA8. La comparación se centra en las métricas de carbono y hardware:

| Parametro | Mohit0711/tds-carbon-card | itsAayush/tds-carbon-card |
|---|---|---|
| Hardware | 2x NVIDIA V100 | 6x NVIDIA L40S |
| Region | europe-north1 | asia-south1 |
| Horas de GPU | 348,6 h (PUE 1,15) | 164,1 h (PUE 1,4) |
| Energia total | 240,534 kWh | 482,454 kWh |
| Emisiones CO₂eq | 28,864 kg | 313,595 kg |

Ambos repositorios carecen de información sobre el modelo subyacente, por lo que no se puede comparar rendimiento ni arquitectura. La diferencia en emisiones se debe al hardware (V100 vs L40S) y a la región (Europa vs Asia), lo que ilustra la influencia de estos factores en la huella de carbono.

## Limitaciones y advertencias

- El repositorio no contiene ningún modelo de IA: no se puede descargar, ejecutar ni integrar en ningún sistema.
- No hay información sobre la licencia de uso, por lo que no se garantiza que los datos puedan reutilizarse comercialmente sin permiso del autor.
- Las emisiones reportadas dependen de la metodología de CodeCarbon y de los factores de emisión de la red eléctrica en la región; pueden variar si se usan otras herramientas o datos actualizados.
- No se especifica qué modelo se estaba entrenando, lo que limita la reproducibilidad del experimento.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un trabajo académico o de demostración, no un recurso ampliamente utilizado.
- La fecha de creación (agosto de 2026) es futura respecto a la fecha actual, lo que podría indicar un error en los metadatos o un ejercicio ficticio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mohit0711/tds-carbon-card
- Repositorio similar (itsAayush/tds-carbon-card): https://huggingface.co/itsAayush/tds-carbon-card
- Herramienta CodeCarbon (mencionada en la model card): https://github.com/mlco2/codecarbon
- Documentación sobre model cards y su propósito: https://github.com/ivylee/model-cards-and-datasheets
