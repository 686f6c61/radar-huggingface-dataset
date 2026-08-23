# AdityaV26/tds-carbon-card

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono (carbon accounting) que documenta la huella de CO₂ equivalente de un proceso de ajuste fino (fine-tuning) realizado como parte de una asignación académica denominada TDS GA8. El autor, AdityaV26, publica en HuggingFace los datos de emisiones calculados con la herramienta CodeCarbon, incluyendo hardware empleado, consumo energético y localización geográfica del cómputo.

La relevancia de este tipo de publicaciones radica en la creciente preocupación por el coste medioambiental del entrenamiento de modelos de IA. Aunque no se trata de un modelo con pesos ni arquitectura, la ficha sirve como ejemplo de buenas prácticas de transparencia energética y de cómo HuggingFace permite adjuntar metadatos de emisiones a cualquier artefacto del ecosistema. No hay información sobre arquitectura, parámetros o capacidades del modelo original que fue ajustado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se distribuyen pesos) |
| Hardware de entrenamiento | NVIDIA A100 (3 GPUs) |
| Modo de entrenamiento | fine-tuning |
| Region de computo | ap-southeast1 |
| Horas GPU | 421,5 h (PUE: 1,45) |
| Energia total consumida | 733,41 kWh |
| Emisiones de CO₂ | 352,037 kg CO₂eq |
| Herramienta de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se puede describir la arquitectura del modelo porque este repositorio no incluye pesos, arquitectura ni configuración de red neuronal. El contenido se limita a la declaración de emisiones del proceso de entrenamiento, que se ejecutó sobre tres GPUs NVIDIA A100 en la región ap-southeast1 de Google Cloud. El modo de entrenamiento fue de ajuste fino (fine-tuning), con un total de 421,5 horas de GPU y un factor de eficiencia energética (PUE) de 1,45, lo que arroja un consumo energético de 733,41 kWh y unas emisiones de 352,037 kg de CO₂ equivalente, medidas con la herramienta CodeCarbon.

No se especifican datos del dataset, número de tokens, ni técnicas como RLHF, DPO o decodificación especulativa. La información publicada se limita exclusivamente a la contabilidad de carbono del proceso.

## Capacidades

No aplica. Este repositorio no expone capacidades de generación de texto, razonamiento, código, visión ni ninguna otra funcionalidad de inferencia. Se trata de un documento de metadatos sobre el coste energético de un entrenamiento.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: el registro permite cuantificar el impacto ambiental de un entrenamiento concreto y compararlo con otros proyectos, sirviendo como base para políticas de compensación o reducción de emisiones.
- Investigación en Green AI: los datos publicados pueden usarse como referencia empírica para estudios sobre el coste energético de diferentes configuraciones de hardware y regiones de cómputo.
- Transparencia y responsabilidad corporativa: la publicación de estos metadatos facilita el cumplimiento de directrices de divulgación de impacto ambiental en organizaciones que entrenan modelos propios.
- Optimización de infraestructura: los valores de PUE, horas de GPU y energía permiten comparar la eficiencia de diferentes proveedores cloud y regiones antes de decidir dónde ejecutar entrenamientos.
- Docencia en ingeniería de IA: este ejemplo práctico puede utilizarse en cursos sobre computación sostenible para ilustrar cómo se mide y reporta el coste energético de un entrenamiento.
- Integración en pipelines de CI/CD: los metadatos de CodeCarbon pueden incorporarse a flujos automatizados de entrenamiento para generar informes de emisiones en cada ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene resultados de evaluación de calidad del modelo (MMLU, HumanEval, GSM8K, etc.), sino exclusivamente métricas de consumo energético.

## Requisitos de hardware

- El entrenamiento se ejecutó con 3 GPUs NVIDIA A100, por lo que la infraestructura mínima para reproducir el proceso sería similar (3 A100 o equivalente en cómputo).
- No se especifican requisitos de VRAM para inferencia, ya que no se distribuyen pesos.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.), porque no hay un modelo servible.
- El consumo energético total fue de 733,41 kWh para 421,5 horas de GPU, lo que supone una media de aproximadamente 1,74 kW por hora de GPU (incluyendo PUE).

## Comparativa con modelos similares

La búsqueda web ha localizado dos repositorios equivalentes con el mismo propósito (contabilidad de carbono de entrenamientos TDS GA8), que se comparan a continuación:

| Repositorio | Hardware | Modo | Region | Horas GPU | Energia (kWh) | CO₂ (kg) |
|---|---|---|---|---|---|---|
| AdityaV26/tds-carbon-card | NVIDIA A100 (3) | fine-tuning | ap-southeast1 | 421,5 | 733,41 | 352,037 |
| adisinha95/tds-carbon-card | NVIDIA V100 (4) | fine-tuning | europe-north1 | 447,8 | 709,3152 | 85,118 |
| itsAayush/tds-carbon-card | NVIDIA L40S (6) | pre-training | asia-south1 | 164,1 | 482,454 | 313,595 |

La comparación muestra que el factor de emisiones de la región ap-southeast1 es considerablemente más alto que el de europe-north1 (352 kg CO₂ frente a 85 kg para un consumo energético similar), lo que evidencia la importancia de la ubicación geográfica en la huella de carbono.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, no es desplegable y no se puede usar para ninguna tarea de inferencia.
- No hay información sobre el modelo original que se ajustó, por lo que no se pueden extraer conclusiones sobre su calidad o capacidades.
- La licencia no está especificada, lo que limita la reutilización de los metadatos en otros proyectos.
- Las emisiones dependen de la región de cómputo y del factor de emisión de la red eléctrica local, por lo que los datos no son extrapolables a otras infraestructuras.
- No se documentan la versión de CodeCarbon ni las métricas de incertidumbre de las mediciones, lo que reduce la reproducibilidad exacta del informe.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no hay evidencia de uso ni validación por parte de la comunidad.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/AdityaV26/tds-carbon-card
- Repositorio equivalente (adisinha95): https://huggingface.co/adisinha95/tds-carbon-card
- Repositorio equivalente (itsAayush): https://huggingface.co/itsAayush/tds-carbon-card
- Guía de model cards de Google DeepMind: https://deepmind.google/models/model-cards/
- Model card de Gemini 3.7 Flash (ejemplo de referencia): https://deepmind.google/models/model-cards/gemini-3-7-flash/
