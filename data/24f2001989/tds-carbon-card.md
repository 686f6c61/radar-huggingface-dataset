# 24f2001989/tds-carbon-card

## Resumen

El repositorio `24f2001989/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono y energía correspondiente al entrenamiento de un modelo dentro de la asignatura TDS GA8. Se trata de una "model card" orientada a la sostenibilidad (Green AI) que documenta las emisiones de CO₂ equivalente, el consumo energético y el hardware utilizado durante una fase de pre-entrenamiento. El autor es el usuario `24f2001989` y el repositorio se publicó en Hugging Face el 28 de agosto de 2026.

Este tipo de documentación es relevante en el contexto actual de la IA responsable, donde se exige transparencia sobre el impacto ambiental de los modelos. Aunque no ofrece capacidades de inferencia ni pesos, su utilidad radica en servir como referencia metodológica para auditar la huella ecológica de entrenamientos similares. No se dispone de información sobre arquitectura, parámetros, contexto o licencia, ya que no se trata de un modelo convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no contiene pesos) |

Datos de entrenamiento documentados en la model card:

| Parametro | Valor |
|---|---|
| Hardware | NVIDIA L40S (5 GPUs) |
| Modo de entrenamiento | pre-training |
| Region | us-central1 |
| Horas de GPU | 417,5 h (PUE: 1,4) |
| Energia total | 1022,875 kWh |
| Emisiones de CO₂ | 358,006 kg CO₂eq |
| Fuente de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura del modelo entrenado (si es transformer, MoE, SSM, etc.) ni sobre el dataset utilizado. La unica informacion disponible se refiere al proceso de entrenamiento: se emplearon 5 GPUs NVIDIA L40S en la region us-central1, con un total de 417,5 horas de GPU y un PUE (Power Usage Effectiveness) de 1,4. El consumo energetico total fue de 1022,875 kWh, lo que resulto en 358,006 kg de CO₂ equivalente, medidos con la herramienta CodeCarbon. No se mencionan tecnicas como RLHF, DPO ni innovaciones arquitectonicas.

## Capacidades

- No aplica: este repositorio no contiene un modelo con capacidades de generacion, razonamiento, codigo, vision, tool calling, agentes ni multilingues.
- Su unica funcion es documentar metricas de sostenibilidad de un entrenamiento, por lo que no puede ejecutar tareas de IA.

## Casos de uso

- Auditoria de sostenibilidad en proyectos de IA: el repositorio sirve como plantilla para reportar emisiones de CO₂ y consumo energetico de entrenamientos, util para empresas que necesitan cumplir normativas ambientales o estandares como carbon.txt.
- Investigacion academica en Green AI: estudiantes e investigadores pueden usar estos datos como referencia para comparar el impacto de diferentes configuraciones de hardware y regiones en la huella de carbono.
- Optimizacion de infraestructura: los datos de PUE y horas de GPU permiten estimar costes energeticos y emisiones para planificar entrenamientos mas eficientes en centros de datos.
- Educacion y formacion: en cursos de IA responsable, este tipo de model card ejemplifica como documentar el ciclo de vida de un modelo mas alla de sus metricas de rendimiento.
- Comparativa entre proveedores cloud: al conocer la region (us-central1) y el hardware, se puede evaluar el impacto de elegir diferentes proveedores o zonas geograficas.
- Desarrollo de herramientas de medicion: los datos de CodeCarbon pueden utilizarse para calibrar o validar herramientas de estimacion de emisiones en entornos de entrenamiento distribuido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene metricas de rendimiento del modelo (MMLU, HumanEval, GSM8K, etc.) porque no es un modelo de IA, sino un registro de emisiones.

## Requisitos de hardware

- El entrenamiento documentado utilizo 5 GPUs NVIDIA L40S, cada una con 48 GB de VRAM (segun especificaciones publicas de NVIDIA, aunque no se confirma en la model card).
- No se especifican requisitos para inferencia, ya que no hay pesos ni modelo desplegable.
- Para reproducir el entrenamiento se necesitaria un cluster con al menos 5 GPUs L40S o equivalente, con un consumo energetico estimado de 1022,875 kWh en 417,5 horas.
- No se indican opciones de despliegue (vLLM, llama.cpp, etc.) porque no hay modelo que servir.

## Comparativa con modelos similares

Existen otros repositorios de la misma asignatura (TDS GA8) con proposito identico. A continuacion se comparan los datos disponibles:

| Repositorio | Hardware | GPUs | Horas GPU | PUE | Energia (kWh) | CO₂ (kg) |
|---|---|---|---|---|---|---|
| 24f2001989/tds-carbon-card | NVIDIA L40S | 5 | 417,5 | 1,4 | 1022,875 | 358,006 |
| 24f2006473/tds-carbon-card | NVIDIA T4 | 7 | 402,5 | 1,51 | 297,8098 | 104,233 |

La comparativa muestra que el entrenamiento con L40S consume mas energia y emite mas CO₂ que el realizado con T4, a pesar de tener menos GPUs, debido probablemente a la mayor potencia de las L40S. No hay otros modelos comparables en el sentido de capacidades de IA.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para inferencia, generacion de texto ni ninguna tarea de machine learning.
- La informacion se limita a la contabilidad de carbono; no se proporcionan detalles sobre el modelo entrenado (arquitectura, datos, metricas), por lo que no es posible evaluar su calidad o rendimiento.
- Los datos de emisiones dependen de la herramienta CodeCarbon y del PUE declarado; pueden variar segun la metodologia de medicion.
- No se indica la licencia del repositorio, por lo que su reutilizacion comercial o academica no esta claramente permitida.
- La fecha de creacion (2026) y la ausencia de descargas sugieren que es un proyecto educativo, no un recurso de produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/24f2001989/tds-carbon-card
- Repositorio similar de otro usuario: https://huggingface.co/24f2006473/tds-carbon-card
- Perfil de GitHub del autor: https://github.com/24f2001989/
- Repositorio TDS GA6 del autor: https://github.com/24f2001989/tds-ga6
- Articulo sobre model cards de carbono en carbon.txt: https://www.thegreenwebfoundation.org/news/ai-model-cards-in-carbon-txt/
