# ariba30/tds-carbon-card

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial, sino una **tarjeta de modelo de contabilidad de carbono** (Green AI Carbon Accounting) que documenta el impacto ambiental de una ejecución de entrenamiento realizada dentro de la asignatura TDS GA8. Publicado por el usuario ariba30, el repositorio se limita a declarar las emisiones de CO₂ equivalente generadas durante un entrenamiento de tipo pre-training llevado a cabo en la región us-central1 de Google Cloud.

El objetivo de esta tarjeta es proporcionar transparencia sobre el coste energético y la huella de carbono asociada al entrenamiento de un modelo. No incluye pesos, arquitectura, código ni ningún artefacto utilizable; se trata exclusivamente de un informe de sostenibilidad. Su relevancia radica en la creciente demanda de prácticas de IA responsable que exigen la divulgación de las emisiones de los procesos de entrenamiento.

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
| Formato de pesos | no disponible (no se incluyen pesos) |

## Arquitectura y entrenamiento
No se proporciona informacion sobre la arquitectura del modelo entrenado (no se indica si es transformer, MoE, SSM u otro tipo). El repositorio solo documenta el proceso de entrenamiento: se utilizaron 4 GPU NVIDIA L40S en modo de pre-training, con un total de 312.2 horas de GPU (considerando un PUE de 1.43). El consumo energetico total fue de 625.0244 kWh, lo que resulto en 218.759 kg de CO₂ equivalente, calculado mediante la herramienta CodeCarbon. La region de computo fue us-central1. No se especifican datos sobre el dataset ni tecnicas de optimizacion como RLHF o DPO.

## Capacidades
- No se trata de un modelo funcional: no tiene capacidades de generacion, razonamiento, codigo, vision ni ninguna otra tarea.
- La unica "capacidad" es la de servir como registro de sostenibilidad para un entrenamiento especifico.
- No soporta tool calling, agentes, ni procesamiento de lenguaje natural.
- No hay soporte multilingue ni de ninguna otra indole.

## Casos de uso
- Auditoria ambiental de entrenamientos de IA: la tarjeta puede usarse como referencia para reportar emisiones en articulos academicos o informes de sostenibilidad corporativa.
- Comparativa de eficiencia energetica: investigadores pueden comparar los 218.759 kg de CO₂eq con otros entrenamientos para evaluar la huella relativa.
- Cumplimiento normativo: en entornos con requisitos de divulgacion de emisiones, este tipo de registro sirve como evidencia documental.
- Educacion: en cursos sobre IA verde (Green AI), este repositorio ejemplifica como estructurar una tarjeta de carbono.
- Trazabilidad de experimentos: equipos que quieran auditar el coste energetico de sus procesos pueden replicar este formato.
- Investigacion en optimizacion de hardware: los datos de GPU horas y consumo energetico pueden alimentar estudios sobre la eficiencia de las GPU L40S en pre-entrenamiento.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no incluye metricas de calidad del modelo entrenado, solo datos de emisiones.

## Requisitos de hardware
- El entrenamiento documentado utilizo 4 GPU NVIDIA L40S, con un total de 312.2 horas de GPU.
- No se proporcionan requisitos de VRAM para inferencia, ya que no se distribuyen pesos.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) porque no hay modelo que servir.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares
No disponible. Este repositorio no es un modelo de IA comparable con otros modelos de la misma categoria. Se encontraron repositorios similares (ayeshaalvi/tds-carbon-card, 23f3001819/tds-carbon-card) que documentan el mismo tipo de contabilidad de carbono, pero no son modelos de IA.

## Limitaciones y advertencias
- No contiene un modelo utilizable: no se puede descargar pesos ni ejecutar ninguna tarea.
- No se especifica la licencia, por lo que el uso del contenido del repositorio esta sujeto a la politica por defecto de Hugging Face (que permite lectura, pero no se garantiza el uso comercial).
- Los datos de emisiones son estimaciones basadas en CodeCarbon y en un PUE de 1.43, que pueden variar con la fuente de energia real del centro de datos.
- No se incluye informacion sobre el dataset entrenado, lo que limita la reproducibilidad del entrenamiento original.
- No se ofrecen garantias sobre la exactitud de los valores de CO₂, ya que dependen de factores externos (mezcla de energia, refrigeracion, etc.).

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/ariba30/tds-carbon-card
- Repositorio similar de ayeshaalvi: https://huggingface.co/ayeshaalvi/tds-carbon-card
- Repositorio similar de 23f3001819: https://huggingface.co/23f3001819/tds-carbon-card
- Guia de Model Cards de OECD.AI: https://oecd.ai/en/catalogue/tools/model-cards
- Articulo sobre AI model cards en carbon.txt: https://www.thegreenwebfoundation.org/news/ai-model-cards-in-carbon-txt/
- Componente AI label de Carbon Design System: https://carbondesignsystem.com/components/ai-label/usage/
