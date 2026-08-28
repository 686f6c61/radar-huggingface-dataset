# 23f2005125/tds-carbon-card

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial, sino una *model card* de contabilidad de carbono asociada a un ejercicio académico (TDS GA8). Documenta la huella de CO₂ y el consumo energético de un proceso de *fine-tuning* realizado sobre hardware NVIDIA T4 en la región europe-north1. El objetivo es registrar de forma transparente el impacto ambiental del entrenamiento, siguiendo prácticas de "IA verde" (Green AI). No se proporcionan detalles sobre la arquitectura, los parámetros ni las capacidades del modelo subyacente, por lo que esta ficha se limita a los datos de emisiones y a la descripción del propio repositorio.

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
| Hardware de entrenamiento | NVIDIA T4 (7 GPUs) |
| Modo de entrenamiento | fine-tuning |
| Region de computo | europe-north1 |
| Horas de GPU | 243,7 h (PUE: 1,15) |
| Energia total consumida | 137,3249 kWh |
| Emisiones de CO₂ | 16,479 kg CO₂eq |
| Fuente de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo (transformer, MoE, SSM, etc.) ni sobre los datos de entrenamiento (numero de tokens, composicion del dataset, tecnicas de alineamiento como RLHF o DPO). El repositorio solo indica que se realizo un *fine-tuning* sobre 7 GPUs NVIDIA T4 en la region europe-north1, con un consumo total de 137,3249 kWh y 16,479 kg de CO₂ equivalente, medidos con la herramienta CodeCarbon. No se menciona ninguna innovacion tecnica destacable.

## Capacidades

No aplica. Este repositorio no describe un modelo con capacidades de generacion de texto, razonamiento, codigo, vision, tool calling, agentes ni soporte multilingue. Se limita a documentar el impacto ambiental de un entrenamiento.

## Casos de uso

- **Auditoria ambiental de entrenamientos de IA**: el repositorio sirve como plantilla para registrar emisiones de CO₂ y consumo energetico en proyectos de investigacion, permitiendo a organizaciones cumplir con politicas de sostenibilidad.
- **Comparacion de eficiencia energetica entre runs**: al incluir datos como horas de GPU, PUE y energia total, permite comparar el coste ambiental de diferentes configuraciones de entrenamiento.
- **Publicacion de transparencia en model cards**: puede integrarse en la documentacion estandar de modelos (model cards) para informar a los usuarios sobre el impacto ecologico, siguiendo iniciativas como carbon.txt o las recomendaciones de Green Web Foundation.
- **Educacion en computacion sostenible**: en entornos academicos, sirve como ejemplo practico de como medir y reportar la huella de carbono de un experimento de machine learning.
- **Optimizacion de infraestructura**: los datos de energia y emisiones pueden usarse para decidir entre regiones de computo o tipos de hardware mas eficientes (por ejemplo, comparar europe-north1 con us-central1).
- **Cumplimiento normativo**: en el futuro, este tipo de documentacion podria ser requerida por regulaciones sobre impacto ambiental de sistemas de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene metricas de rendimiento del modelo (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- **Hardware de entrenamiento**: 7 GPUs NVIDIA T4, con un total de 243,7 horas de GPU.
- **VRAM estimada para inferencia**: no disponible, ya que no se especifica el modelo.
- **GPU recomendadas**: no disponible.
- **Compatibilidad con GPU de consumo**: no aplicable, al no tratarse de un modelo desplegable.
- **Opciones de despliegue**: no aplicable (vLLM, llama.cpp, Ollama, TGI, etc.).
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se puede comparar con modelos de IA porque este repositorio no contiene un modelo. Sin embargo, existen otros repositorios similares de contabilidad de carbono dentro del mismo ejercicio academico, con datos de emisiones diferentes:

| Repositorio | Hardware | Region | Horas GPU | Energia (kWh) | CO₂ (kg) |
|---|---|---|---|---|---|
| 23f2005125/tds-carbon-card | NVIDIA T4 (7 GPUs) | europe-north1 | 243,7 | 137,32 | 16,48 |
| 24f2006473/tds-carbon-card | NVIDIA T4 (7 GPUs) | us-central1 | 402,5 | 297,81 | 104,23 |
| 25ds/tds-carbon-card | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa muestra diferencias significativas en emisiones segun la region y el tiempo de computo, lo que ilustra la importancia de la ubicacion geografica en la huella de carbono.

## Limitaciones y advertencias

- **No es un modelo de IA**: este repositorio no contiene pesos, arquitectura ni capacidades de inferencia; es solo una documentacion de emisiones.
- **Datos de entrenamiento desconocidos**: no se indica que modelo se ajusto, ni con que datos, por lo que no se puede evaluar su calidad o sesgos.
- **Licencia no especificada**: no se indica si el contenido del repositorio puede reutilizarse comercialmente.
- **Medicion limitada**: las emisiones se calcularon con CodeCarbon y un PUE estimado; pueden variar segun la metodologia o el proveedor de nube.
- **Sin informacion de sesgos o alucinaciones**: al no existir un modelo, no se pueden evaluar riesgos de sesgo, alucinacion o limitaciones de contexto.
- **Caveat para produccion**: no es util para despliegue en aplicaciones reales; su unico valor es como registro de sostenibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/23f2005125/tds-carbon-card
- Repositorio GitHub asociado: https://github.com/23f2005125/tds-ga7-release-gate
- Repositorio similar (24f2006473): https://huggingface.co/24f2006473/tds-carbon-card
- Repositorio similar (25ds): https://huggingface.co/25ds/tds-carbon-card
- Articulo sobre model cards en carbon.txt: https://www.thegreenwebfoundation.org/news/ai-model-cards-in-carbon-txt/
- Guia sobre model cards (RAI): https://www.doairight.org/posts/model-documentation-practices-modelcards/
