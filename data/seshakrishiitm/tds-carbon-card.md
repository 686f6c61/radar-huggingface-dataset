# seshakrishiitm/tds-carbon-card

## Resumen

Este repositorio, publicado por el usuario `seshakrishiitm` en Hugging Face, no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono correspondiente a una ejecución de entrenamiento realizada en el marco de la asignatura TDS GA8 (Tools in Data Science). Documenta las emisiones de CO₂ equivalente generadas durante un proceso de pre-entrenamiento, utilizando la herramienta CodeCarbon para la medición.

La relevancia de esta ficha radica en su contribución a la transparencia ambiental en el desarrollo de IA, un aspecto cada vez más demandado por la comunidad investigadora. El repositorio especifica el hardware utilizado (NVIDIA A100), la región de cómputo (europe-north1), las horas de GPU, el consumo energético total y las emisiones asociadas. No se proporciona información sobre el modelo entrenado, su arquitectura, tamaño o finalidad, por lo que esta ficha se limita a documentar los datos de sostenibilidad disponibles.

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

No se dispone de información sobre la arquitectura del modelo subyacente, ya que este repositorio únicamente documenta la huella de carbono de una ejecución de entrenamiento. Los datos de entrenamiento indican que se utilizaron 5 GPUs NVIDIA A100 durante 31,5 horas en la región `europe-north1`, con un factor de eficiencia energética (PUE) de 1,12. El consumo total de energía fue de 70,56 kWh, lo que resultó en 8,467 kg de CO₂ equivalente, medidos con CodeCarbon. No se especifica el tipo de modelo, el dataset empleado ni el proceso de optimización (RLHF, DPO, etc.).

## Capacidades

- No aplica: este repositorio no contiene un modelo con capacidades de generación, razonamiento, código, visión u otras funciones propias de un sistema de IA.
- La única funcionalidad es la de servir como registro de emisiones de carbono para auditoría y transparencia.

## Casos de uso

- Auditoría ambiental de entrenamientos de IA: el repositorio puede utilizarse como referencia para reportar emisiones de CO₂ en proyectos de investigación o producción, siguiendo la metodología de CodeCarbon.
- Comparativa de eficiencia energética: permite contrastar el coste energético de diferentes configuraciones de hardware y regiones de cómputo.
- Cumplimiento normativo: sirve como evidencia documental para iniciativas de sostenibilidad o requisitos de divulgación de impacto ambiental.
- Educación en Green AI: puede emplearse como ejemplo práctico en cursos sobre herramientas de ciencia de datos (TDS) para ilustrar la medición de huella de carbono.
- Optimización de infraestructura: los datos de consumo y emisiones pueden orientar decisiones sobre selección de GPUs, número de nodos y ubicación geográfica de los centros de datos.
- Investigación en eficiencia energética: los valores registrados (31,5 h, 70,56 kWh, 8,467 kg CO₂eq) pueden compararse con otros experimentos para estudiar el impacto de la escala y la región.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no reporta métricas de rendimiento del modelo, ya que su propósito es exclusivamente la contabilidad de carbono.

## Requisitos de hardware

- El entrenamiento documentado utilizó 5 GPUs NVIDIA A100, aunque no se especifica la VRAM individual (presumiblemente 40 GB u 80 GB según la variante).
- No se proporcionan requisitos de hardware para inferencia, ya que no se distribuye ningún modelo.
- Para reproducir el experimento de medición de carbono se requiere un entorno con GPUs NVIDIA y la librería CodeCarbon instalada.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) porque no hay modelo que servir.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA, sino un registro de emisiones. Existen otros repositorios similares en Hugging Face (por ejemplo, `Hrishi-iitm/tds-carbon-card` y `srishti0109/tds-carbon-card`) que también documentan huellas de carbono para la misma asignatura, pero no se dispone de sus datos detallados para una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio no contiene ningún artefacto de modelo, por lo que no es utilizable para tareas de inferencia o generación.
- Los datos de emisiones se basan en la medición de CodeCarbon y pueden variar según la metodología, el PUE y la fuente de energía de la región.
- No se especifica la licencia, lo que limita su reutilización legal sin consultar al autor.
- La ausencia de información sobre el modelo entrenado impide evaluar su calidad o aplicabilidad.
- Para uso en producción, este repositorio no aporta valor directo; su utilidad es exclusivamente documental.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/seshakrishiitm/tds-carbon-card
- Repositorio similar (Hrishi-iitm): https://huggingface.co/Hrishi-iitm/tds-carbon-card
- Repositorio similar (srishti0109): https://huggingface.co/srishti0109/tds-carbon-card
- Herramienta CodeCarbon (referencia de medición): no se proporciona enlace oficial en la información disponible.
