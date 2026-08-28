# Shubham7277/carbon-card

## Resumen

El repositorio `Shubham7277/carbon-card` no contiene un modelo de inteligencia artificial, sino una *model card* de contabilidad de carbono, es decir, un documento que registra las emisiones de CO₂ equivalente asociadas a una ejecución de entrenamiento de un modelo. Fue publicado por el usuario Shubham7277 el 28 de agosto de 2026 y forma parte de una serie de repositorios similares (por ejemplo, `subhamtheprogrammer/tds-carbon-card` o `SUMANSHAKTI27/tds-carbon-card`) que documentan la huella ambiental de entrenamientos realizados en el marco de una asignación académica (TDS GA8). La relevancia de este tipo de registros radica en la creciente demanda de transparencia sobre el impacto energético de la IA, impulsada por iniciativas como carbon.txt y el directorio de sostenibilidad de modelos de Hugging Face. No se dispone de información sobre la arquitectura, los parámetros o las capacidades del modelo subyacente, ya que el repositorio solo incluye metadatos de emisiones.

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

Datos adicionales disponibles en la model card:

| Parametro | Valor |
|---|---|
| Emisiones de CO₂ equivalente | 104,793 kg CO₂eq |
| Hardware de entrenamiento | NVIDIA H100 (7 GPUs) |
| Modo de entrenamiento | pre-training |
| Region | us-east1 |
| Horas de GPU | 38 h (PUE: 1,34) |
| Energia total consumida | 249,508 kWh |
| Fuente de medicion | codecarbon |

## Arquitectura y entrenamiento

No se especifica la arquitectura del modelo cuyo entrenamiento se documenta. La model card únicamente reporta los datos de consumo energético y emisiones asociados a una sesión de pre-entrenamiento realizada con 7 GPUs NVIDIA H100 en la región us-east1, durante 38 horas, con un factor de eficiencia energética (PUE) de 1,34. La energía total consumida fue de 249,508 kWh, lo que se tradujo en 104,793 kg de CO₂ equivalente, medidos con la herramienta CodeCarbon. No se proporciona información sobre el dataset, el número de tokens, ni sobre técnicas de optimización como RLHF o DPO.

## Capacidades

- No aplica: este repositorio no contiene un modelo de IA, por lo que no dispone de capacidades de generación de texto, razonamiento, código, visión, tool calling, agentes, ni multilingüismo.
- Su única función es servir como registro de sostenibilidad y trazabilidad del entrenamiento de un modelo no especificado.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: permite a organizaciones y desarrolladores documentar y reportar el impacto ambiental de sus entrenamientos, cumpliendo con estándares emergentes de divulgación.
- Cumplimiento normativo y de políticas ESG: las empresas pueden usar estos registros para demostrar su compromiso con la reducción de emisiones en sus pipelines de ML.
- Investigación académica sobre eficiencia energética: sirve como dato empírico para estudios que comparan el coste energético de diferentes configuraciones de hardware y regiones.
- Transparencia en el ecosistema de Hugging Face: al publicar la model card con el tag `co2_eq_emissions`, se integra en el directorio de sostenibilidad de modelos de la plataforma, facilitando la consulta pública.
- Comparación de infraestructuras: los datos de PUE, horas de GPU y energía permiten comparar la eficiencia de distintos centros de datos o proveedores cloud.
- Educación y concienciación: puede utilizarse en cursos de IA responsable para ilustrar el coste ambiental real del entrenamiento de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento de ningún modelo, solo datos de emisiones.

## Requisitos de hardware

- El entrenamiento documentado utilizó 7 GPUs NVIDIA H100, lo que implica un requisito de hardware de nivel profesional o centro de datos.
- No se especifican requisitos de VRAM para inferencia, ya que no se proporciona ningún modelo.
- Para reproducir el entrenamiento se necesitaría un clúster con al menos 7 GPUs H100, aunque no se detalla la configuración exacta (memoria, interconexión, etc.).
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) porque no hay modelo que servir.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No aplica en el sentido de modelos de IA. Sin embargo, existen repositorios equivalentes de otros usuarios que documentan entrenamientos similares en el mismo contexto (TDS GA8). La comparación se limita a los datos de emisiones reportados:

| Repositorio | Emisiones (kg CO₂eq) | Hardware | Horas GPU | Energia (kWh) |
|---|---|---|---|---|
| Shubham7277/carbon-card | 104,793 | 7x H100 | 38 | 249,508 |
| subhamtheprogrammer/tds-carbon-card | no disponible | no disponible | no disponible | no disponible |
| SUMANSHAKTI27/tds-carbon-card | no disponible | no disponible | no disponible | no disponible |

Los datos de los otros repositorios no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo de IA, por lo que no puede utilizarse para inferencia, generación de texto ni ninguna tarea de ML.
- La licencia no está especificada, por lo que se desconoce si el contenido puede reutilizarse libremente.
- Los datos de emisiones provienen de una única ejecución de entrenamiento y pueden no ser representativos de otros entrenamientos con el mismo hardware o configuración.
- No se indica qué modelo concreto se entrenó, lo que limita la utilidad del registro para comparaciones directas.
- La fecha de creación (2026) es futura, lo que sugiere que el repositorio podría ser parte de un ejercicio académico simulado o de una práctica de documentación.
- No se proporciona información sobre sesgos, alucinaciones o limitaciones de contexto, ya que no hay modelo subyacente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Shubham7277/carbon-card
- Repositorio similar (subhamtheprogrammer): https://huggingface.co/subhamtheprogrammer/tds-carbon-card
- Repositorio similar (SUMANSHAKTI27): https://huggingface.co/SUMANSHAKTI27/tds-carbon-card
- Directorio de sostenibilidad de modelos de IA (carbon.txt): https://carbontxt.org/ai-model-cards
- Artículo sobre model cards de carbono en carbon.txt: https://www.thegreenwebfoundation.org/news/ai-model-cards-in-carbon-txt/
- Documentación de Applied Model Card (CHAI): https://www.chai.org/workgroup/applied-model
