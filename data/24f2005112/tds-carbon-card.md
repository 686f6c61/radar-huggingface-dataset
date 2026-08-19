# 24f2005112/tds-carbon-card

## Resumen

El repositorio `24f2005112/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino una tarjeta de documentación de la huella de carbono asociada a un proceso de fine-tuning realizado en el marco de una asignación académica (TDS GA8). El autor, identificado como `24f2005112`, publica en Hugging Face un registro con métricas de emisiones de CO₂, consumo energético y hardware utilizado durante el entrenamiento. Esta práctica se enmarca en la tendencia de "Green AI" o contabilidad de carbono para el desarrollo de modelos.

La información disponible es mínima: no se especifica la arquitectura, el tamaño, el tipo de modelo ni las tareas para las que fue entrenado. Se trata exclusivamente de un registro de sostenibilidad, con datos de emisiones calculados mediante la herramienta CodeCarbon. La relevancia de este repositorio radica en su contribución a la transparencia ambiental en el desarrollo de IA, aunque no ofrece ningún recurso utilizable para inferencia o investigación técnica.

Dado que no se trata de un modelo de IA, las secciones de capacidades, benchmarks o comparativa carecen de contenido. La ficha se limita a documentar los datos de emisiones y a señalar explícitamente la ausencia de información técnica sobre el modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Emisiones de CO₂ (entrenamiento) | 39.824 kg CO₂eq |
| Energia total consumida | 94.8192 kWh |
| Hardware de entrenamiento | 1x NVIDIA V100 |
| Region de computo | us-east1 |
| Horas de GPU | 265.6 h (PUE: 1.19) |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura del modelo (si existe) ni sobre su proceso de entrenamiento mas alla de los datos de sostenibilidad. El unico dato tecnico es que se realizo un fine-tuning con una GPU NVIDIA V100 durante 265.6 horas, con un factor de eficiencia energetica (PUE) de 1.19. La herramienta utilizada para el calculo de emisiones es CodeCarbon, que estima 39.824 kg de CO₂ equivalente. No se indica el tipo de modelo, el dataset empleado ni las tecnicas de optimizacion o alineacion utilizadas.

## Capacidades

No aplicable: este repositorio no contiene un modelo con capacidades de generacion, razonamiento, codigo, vision u otras funciones. Se trata de una tarjeta de documentacion ambiental, sin artefactos de inferencia.

## Casos de uso

No aplicable como modelo de IA. El proposito de esta publicacion es exclusivamente documental:

- Auditoria de sostenibilidad: permite a organizaciones o investigadores verificar el impacto ambiental de un proceso de fine-tuning concreto.
- Educacion en Green AI: sirve como ejemplo de como reportar emisiones de CO₂ en el desarrollo de modelos, siguiendo practicas como las de CodeCarbon.
- Referencia metodologica: el repositorio puede usarse como plantilla para otros proyectos que necesiten publicar tarjetas de carbono en Hugging Face.
- Transparencia en publicaciones academicas: en el contexto de un curso (TDS GA8), demuestra la aplicacion de metricas ambientales en trabajos de IA.
- Comparacion de eficiencia: aunque no hay datos de otros modelos, los valores de energia y emisiones podrian usarse como punto de partida para comparar futuros entrenamientos.
- Cumplimiento normativo: en entornos donde se exija reportar la huella de carbono de modelos, este tipo de registro sirve como evidencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene evaluaciones de rendimiento del modelo, ya que no se proporciona ningun modelo.

## Requisitos de hardware

Los datos de hardware se refieren al entrenamiento documentado, no a requisitos de inferencia:

- GPU utilizada: 1x NVIDIA V100 (16 GB o 32 GB, no se especifica).
- Horas de computo: 265.6 horas.
- Consumo energetico total: 94.8192 kWh.
- No se indica si el modelo resultante (si existe) es desplegable en GPU de consumo o en entornos de produccion.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u otros.

## Comparativa con modelos similares

No disponible. No existen datos sobre otros modelos comparables en este repositorio, y al no tratarse de un modelo de IA, no procede una comparativa tecnica.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo de IA utilizable; es solo una tarjeta de emisiones.
- No se especifica la licencia, por lo que su reutilizacion es incierta.
- Los datos de emisiones dependen de la metodologia de CodeCarbon y de los factores de emision de la region us-east1; pueden no ser representativos para otros entornos.
- No se indica el tipo de modelo ni la tarea, lo que impide cualquier evaluacion tecnica.
- La ausencia de informacion sobre el modelo subyacente limita su utilidad para desarrolladores e investigadores.
- No se ofrecen garantias sobre la exactitud de los datos de energia o emisiones; se asume que fueron medidos con las herramientas declaradas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/24f2005112/tds-carbon-card
- Repositorio GitHub del autor (posible contexto): https://github.com/24f2005112/TDS-GA6
- Repositorio GitHub adicional: https://github.com/24f2005112/tds-ga4/blob/main/main.py
- Directorio de tarjetas de carbono de Hugging Face (contexto general): https://carbontxt.org/ai-model-cards
- Pagina de model cards de Google DeepMind (referencia metodologica): https://deepmind.google/models/model-cards/
