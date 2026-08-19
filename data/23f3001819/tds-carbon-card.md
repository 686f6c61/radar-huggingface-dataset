# 23f3001819/tds-carbon-card

## Resumen
Este repositorio no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono (carbon card) que documenta la huella de CO₂ de un proceso de fine-tuning realizado sobre un modelo no especificado. La publica el usuario 23f3001819 en Hugging Face como parte de una asignación académica (TDS GA8) centrada en Green AI. El objetivo es registrar de forma transparente el consumo energético y las emisiones asociadas a un entrenamiento concreto, en lugar de ofrecer un artefacto de ML descargable.

La tarjeta incluye datos de emisiones calculados con CodeCarbon, detallando hardware, región, horas de GPU, energía total y CO₂ equivalente. No se proporciona información sobre el modelo base, su arquitectura, parámetros o capacidades. Su relevancia actual reside en la creciente demanda de prácticas de IA sostenible y en la necesidad de estandarizar la divulgación del impacto ambiental de los entrenamientos.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica el modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

Adicionalmente, la tarjeta documenta los siguientes datos de entrenamiento:

| Parametro | Valor |
|---|---|
| Hardware | 4x NVIDIA H100 |
| Modo de entrenamiento | fine-tuning |
| Region | us-east1 |
| Horas de GPU | 271,7 h (PUE 1,4) |
| Energia total | 1065,064 kWh |
| Emisiones de CO₂ | 447,327 kg CO₂eq |

## Arquitectura y entrenamiento
No se describe ninguna arquitectura de modelo, ya que este repositorio no contiene un modelo de IA. El entrenamiento documentado consistió en un proceso de fine-tuning sobre un modelo base no identificado, ejecutado en 4 GPUs NVIDIA H100 en la región us-east1. Las emisiones se calcularon con la herramienta CodeCarbon, que estima el CO₂ equivalente a partir del consumo energético y el mix eléctrico de la región. El factor PUE (Power Usage Effectiveness) de 1,4 indica la eficiencia del centro de datos. No hay información sobre el dataset, el número de tokens, ni técnicas como RLHF o DPO.

## Capacidades
- No aplica: el repositorio no ofrece ninguna capacidad de IA (generación de texto, razonamiento, código, visión, etc.).
- No existe soporte de tool calling, agentes, ni capacidades multilingües.
- La única función es la de documentar la huella de carbono de un entrenamiento específico.

## Casos de uso
- Auditoría de sostenibilidad en proyectos de IA: sirve como referencia para reportar el impacto ambiental de un fine-tuning en infraestructura H100, útil para empresas que necesitan cumplir normativas de divulgación de emisiones.
- Investigación en Green AI: los datos de emisiones y energía pueden usarse en estudios comparativos sobre el coste ambiental de distintos entrenamientos.
- Educación en prácticas de IA responsable: como ejemplo didáctico de cómo documentar la huella de carbono de un modelo mediante CodeCarbon y tarjetas de modelo.
- Evaluación de proveedores de nube: los valores de energía y CO₂ permiten comparar la eficiencia de diferentes regiones (us-east1 frente a otras) para decidir dónde ejecutar cargas de entrenamiento.
- Integración en pipelines de MLOps: los metadatos de emisiones pueden incorporarse a sistemas de seguimiento de experimentos para generar informes automáticos de sostenibilidad.
- Verificación de afirmaciones de neutralidad de carbono: los datos publicados pueden contrastarse con los informes de los proveedores de infraestructura para validar compensaciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene un modelo de IA evaluable, por lo que no existen métricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware
- No aplica para inferencia, ya que no se distribuyen pesos ni un modelo ejecutable.
- El entrenamiento documentado requirió 4 GPUs NVIDIA H100 durante 271,7 horas.
- No se ofrecen opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares
No disponible. No existen modelos comparables, ya que se trata de una tarjeta de contabilidad de carbono, no de un modelo de IA. Otros repositorios similares en Hugging Face (por ejemplo, 24f2005112/tds-carbon-card o 23f3004437/tds-carbon-card) también son tarjetas de carbono, pero con diferentes valores de emisiones y regiones, y no contienen modelos.

## Limitaciones y advertencias
- No es un modelo de IA: no se puede utilizar para ninguna tarea de procesamiento de lenguaje, visión u otra.
- Los datos de emisiones son específicos de un entrenamiento concreto y no deben generalizarse a otros contextos sin verificación.
- No se indica el modelo base ni el dataset, lo que limita la reproducibilidad y la interpretación de los resultados.
- La licencia no está especificada, por lo que el uso comercial de los datos publicados podría estar restringido.
- La metodología de cálculo (CodeCarbon) depende del mix eléctrico de la región y del PUE declarado; estos valores pueden variar con el tiempo y no son auditables externamente.
- Para producción, este repositorio no aporta ninguna utilidad práctica más allá de la documentación ambiental.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/23f3001819/tds-carbon-card
- Perfil de GitHub del autor: https://github.com/23f3001819/
- Repositorio relacionado del autor: https://github.com/23f3001819/my-tds-ga7
- Directorio de tarjetas de IA sostenible (carbontxt): https://carbontxt.org/ai-model-cards
