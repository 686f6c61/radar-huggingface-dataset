# ColdEspressoImnI/tds-carbon-card

## Resumen
El repositorio `ColdEspressoImnI/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono (carbon card) asociada a un entrenamiento de un modelo no especificado. El documento, titulado "Model Card - Green AI Carbon Accounting", registra las emisiones de CO₂ equivalente generadas durante una sesión de pre-entrenamiento realizada con dos GPUs NVIDIA L40S en la región `ap-southeast1`. Los datos incluidos son: 69,7 horas de GPU, un consumo energético total de 63,427 kWh y 30,445 kg de CO₂eq emitidos, calculados con la herramienta CodeCarbon y un factor PUE de 1,3.

Este tipo de artefacto se enmarca en las prácticas de "IA verde" (Green AI), donde se documenta el impacto ambiental del entrenamiento de modelos. No se proporciona información sobre la arquitectura, el tamaño, el contexto o las capacidades del modelo entrenado, por lo que esta ficha se limita a describir el contenido del repositorio y su propósito.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica el modelo entrenado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

## Arquitectura y entrenamiento
No se dispone de información sobre la arquitectura del modelo subyacente, ya que el repositorio solo documenta el proceso de entrenamiento desde una perspectiva de consumo energético. Los únicos datos de entrenamiento disponibles son: hardware NVIDIA L40S (2 GPUs), modo de pre-entrenamiento, región `ap-southeast1`, 69,7 horas de GPU, consumo total de 63,427 kWh y emisiones de 30,445 kg CO₂eq. No se mencionan técnicas como RLHF, DPO ni innovaciones arquitectónicas.

## Capacidades
- No se documenta ninguna capacidad funcional del modelo (generación de texto, razonamiento, código, visión, etc.).
- El repositorio no incluye ejemplos de uso ni demos.
- No se indica soporte para tool calling, agentes o multilingüismo.
- La única "capacidad" es la de servir como registro de sostenibilidad para auditorías ambientales.

## Casos de uso
- Auditoría de emisiones de carbono en proyectos de IA: el repositorio sirve como evidencia del impacto ambiental de un entrenamiento concreto, útil para informes de sostenibilidad corporativa.
- Cumplimiento de normativas internas o externas sobre transparencia energética en centros de datos.
- Comparación de eficiencia energética entre diferentes configuraciones de hardware (por ejemplo, L40S frente a otras GPUs) si se dispone de múltiples tarjetas similares.
- Investigación en "Green AI": los datos de emisiones pueden usarse para calibrar modelos de estimación de huella de carbono en entrenamientos.
- Documentación interna de equipos de ML para justificar decisiones de infraestructura.
- Publicación de métricas de sostenibilidad en papers o informes técnicos, siguiendo prácticas como las de CodeCarbon.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene métricas de calidad del modelo (MMLU, HumanEval, GSM8K, etc.), solo datos de consumo energético.

## Requisitos de hardware
- El entrenamiento documentado utilizó 2 GPUs NVIDIA L40S (no se especifica si se requieren más recursos).
- No se proporciona información sobre VRAM, latencia o throughput de inferencia.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, etc.) porque no se distribuye ningún modelo.
- Los requisitos de hardware para reproducir el entrenamiento serían los mismos: 2 GPUs L40S, aunque no se detalla el resto del sistema.

## Comparativa con modelos similares
No disponible. No se puede comparar este repositorio con otros modelos de IA, ya que no contiene un modelo. Existen otras tarjetas de carbono similares en Hugging Face (por ejemplo, `Harshini10112006/tds-carbon-card` o `Jesmelchi/tds-carbon-card`), pero todas documentan entrenamientos distintos y no son comparables en términos de rendimiento.

## Limitaciones y advertencias
- El repositorio no contiene un modelo utilizable; es solo un registro de emisiones.
- No se especifica qué modelo se entrenó, por lo que los datos de carbono no pueden asociarse a ninguna arquitectura concreta.
- La licencia no está definida, lo que limita su reutilización legal.
- Los datos de emisiones dependen del factor de emisión de la región y del PUE utilizado; pueden no ser representativos de otros entornos.
- No hay información sobre sesgos, alucinaciones o riesgos de uso, ya que no hay modelo que evaluar.
- Para producción, este repositorio no aporta ningún componente ejecutable.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/ColdEspressoImnI/tds-carbon-card
- Repositorios similares: https://huggingface.co/Harshini10112006/tds-carbon-card y https://huggingface.co/Jesmelchi/tds-carbon-card
- Herramienta CodeCarbon (mencionada como fuente de medición): https://codecarbon.io (no se proporciona enlace directo en la información, pero es la herramienta citada)
