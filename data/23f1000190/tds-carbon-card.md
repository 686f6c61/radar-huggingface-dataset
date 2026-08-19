# 23f1000190/tds-carbon-card

## Resumen
Este repositorio no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a un proceso de fine-tuning documentado en el contexto de una asignación académica (TDS GA8). El autor, identificado como "23f1000190", publica una model card que detalla las emisiones de CO₂ equivalente generadas durante un entrenamiento realizado en la región us-central1 de Google Cloud, utilizando hardware NVIDIA V100. La relevancia de este repositorio radica en su contribución a la transparencia ambiental en el entrenamiento de modelos, siguiendo iniciativas como Green AI y el uso de herramientas como CodeCarbon. No se proporciona información sobre arquitectura, parámetros, contexto ni capacidades, por lo que no puede tratarse como un modelo utilizable para inferencia.

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
No se dispone de información sobre la arquitectura del modelo subyacente, ya que este repositorio únicamente documenta el impacto ambiental de un proceso de fine-tuning. Los datos de entrenamiento, el número de tokens, el tipo de modelo base o cualquier innovación técnica no se mencionan en la model card. La única información técnica disponible se refiere al hardware utilizado (7 GPUs NVIDIA V100), el modo de entrenamiento (fine-tuning), la región (us-central1), las horas de GPU (406,7 h con un PUE de 1,4), la energía total consumida (1195,698 kWh) y las emisiones de CO₂ equivalente (418,494 kg CO₂eq), calculadas con la herramienta CodeCarbon.

## Capacidades
- No se documenta ninguna capacidad funcional del modelo (generación de texto, razonamiento, código, visión, etc.).
- No hay soporte de tool calling, agentes, multilingüismo ni modos especiales.
- La única capacidad demostrada es la de registrar y reportar emisiones de carbono durante el entrenamiento, lo cual es un metadato ambiental, no una funcionalidad de IA.

## Casos de uso
- Auditoría ambiental de entrenamientos de IA: este repositorio sirve como plantilla para documentar emisiones de CO₂ en proyectos de machine learning, permitiendo a organizaciones cumplir con requisitos de sostenibilidad.
- Investigación en Green AI: puede utilizarse como referencia para estudios sobre el coste energético del fine-tuning en infraestructuras cloud específicas (us-central1, V100).
- Educación en prácticas responsables: en contextos académicos, este tipo de registro ayuda a concienciar sobre el impacto ambiental de la IA y a estandarizar la medición con CodeCarbon.
- Comparativa de eficiencia energética: aunque no hay modelo, los datos de emisiones pueden compararse con otros entrenamientos para evaluar la huella de carbono relativa.
- Trazabilidad en pipelines de MLOps: integrar este tipo de tarjetas en repositorios de modelos permite mantener un historial de sostenibilidad.
- Cumplimiento normativo: en regiones con regulaciones sobre emisiones, este registro puede servir como evidencia de prácticas de entrenamiento responsables.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene métricas de rendimiento de ningún modelo, solo datos de emisiones.

## Requisitos de hardware
- No se especifican requisitos de hardware para inferencia, ya que no hay modelo desplegable.
- El hardware documentado para el entrenamiento fue de 7 GPUs NVIDIA V100 en la región us-central1 de Google Cloud.
- No hay indicaciones sobre VRAM, GPUs recomendadas para uso en producción, ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- La latencia y el throughput no son aplicables.

## Comparativa con modelos similares
No disponible. Este repositorio no es un modelo de IA, por lo que no tiene comparación con alternativas de la misma categoría.

## Limitaciones y advertencias
- No contiene ningún modelo utilizable: el repositorio es únicamente un registro de emisiones, no un artefacto de inferencia.
- No se proporciona información sobre sesgos, alucinaciones o limitaciones de idioma, ya que no hay modelo subyacente.
- La licencia no está especificada, por lo que el uso comercial del contenido (si lo hubiera) queda sujeto a la normativa general de HuggingFace y a las leyes aplicables.
- Los datos de emisiones dependen de la metodología de CodeCarbon y de factores como el PUE; no son extrapolables a otros entornos sin ajustes.
- La fecha de creación (2026-08-18) es futura respecto a la fecha actual, lo que sugiere que el registro es simulado o hipotético, no un experimento real verificado.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/23f1000190/tds-carbon-card
- Herramienta CodeCarbon (mencionada como fuente de emisiones): https://codecarbon.io/ (referencia externa no incluida en la información proporcionada, pero se cita en la model card como source: codecarbon)
