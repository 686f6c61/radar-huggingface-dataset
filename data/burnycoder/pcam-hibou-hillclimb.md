# BurnyCoder/pcam-hibou-hillclimb

## Resumen

`BurnyCoder/pcam-hibou-hillclimb` es un conjunto de artefactos derivados (cabezas de clasificación y adaptadores LoRA) construidos sobre el modelo fundacional de patología **Hibou-L** de HistAI, descrito en Nechaev et al. 2024. El objetivo concreto es la detección de metástasis en parches histopatológicos del dataset PatchCamelyon (PCam), un problema de clasificación binaria de imágenes de tejido a resolución de parche. El autor publica los pesos de las cabezas y adaptadores, pero no los pesos del backbone, que deben descargarse por separado aceptando la licencia de Hibou-L.

El repositorio forma parte de un estudio pre-registrado alojado en GitHub, con código para reconstruir cada artefacto y resultados con intervalos de confianza a nivel de portaobjetos. Es relevante para investigadores que quieran reproducir o comparar estrategias de adaptación (linear probe frente a ajuste con LoRA) sobre un backbone de patología de gran tamaño, sin reentrenar desde cero. El tamaño del repositorio es prácticamente nulo (0.0 GB), lo que confirma que solo contiene cabezas y adaptadores de pequeño tamaño, no el modelo base.

La ficha describe únicamente lo que el autor documenta en la model card y los metadatos de HuggingFace. Cualquier dato no publicado se marca explícitamente como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible para los artefactos derivados; el backbone es Hibou-L (modelo fundacional de patología, Nechaev et al. 2024) |
| Parámetros totales | No disponible (los artefactos son cabezas de clasificación y adaptadores LoRA; el backbone no se incluye) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo de visión para patología, no lingüístico) |
| Licencia | Apache-2.0 para los artefactos derivados; el backbone Hibou-L mantiene su propia licencia en HuggingFace |
| Formato de pesos | `torch` state dict (`.pt`) con claves `module`, `mu`, `sd` y `kind` |

## Arquitectura y entrenamiento

Los artefactos consisten en cabezas de clasificación lineales y adaptadores LoRA entrenados sobre las representaciones extraídas de Hibou-L. Cada fichero `heads/<arm>/seed<k>.pt` contiene un state dict de PyTorch con el módulo de la cabeza, los parámetros de normalización z-scoring (`mu`/`sd`, o `None`) y el tipo de cabeza (`kind`). La entrada esperada es la representación documentada en el registro JSON de cada brazo (`arms/<arm>.json`), lo que implica que el pipeline de inferencia requiere primero ejecutar el backbone Hibou-L para obtener embeddings y después aplicar la cabeza o el adaptador.

El entrenamiento se enmarca en un estudio pre-registrado con múltiples brazos experimentales. La model card reporta dos brazos: `S0_eva_exact_hibou_l`, con un balanced accuracy de validación promediado sobre semillas de 0.9396, y `S0_hibou_l_cls_linear`, con 0.9367 en validación y 0.9498 en out-of-fold de entrenamiento. No se documentan en la información disponible el número de tokens, la composición del dataset de entrenamiento más allá de PatchCamelyon, ni si hubo fases de RLHF o DPO (no aplicables a un clasificador de imágenes). Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación binaria de parches histopatológicos para detección de metástasis en ganglios linfáticos (PatchCamelyon).
- Extracción de representaciones mediante el backbone Hibou-L, sobre las que se aplican las cabezas o adaptadores.
- Adaptación parametrizada eficiente mediante LoRA sobre el backbone de patología.
- Evaluación con balanced accuracy y métricas agregadas a nivel de portaobjetos con intervalos de confianza.
- Reproducibilidad completa: código, pre-registro y artefactos publicados para reconstruir cada brazo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo de visión especializado en una única tarea.

## Casos de uso

- Reproducción de experimentos de adaptación: el repositorio permite reconstruir los brazos `S0_eva_exact_hibou_l` y `S0_hibou_l_cls_linear` ejecutando el backbone Hibou-L y cargando las cabezas correspondientes, útil para validar resultados publicados.
- Comparación linear probe frente a LoRA: los artefactos permiten medir la diferencia de balanced accuracy entre ambas estrategias sobre el mismo backbone y dataset, con semillas múltiples para estimar varianza.
- Investigación en detección de metástasis: servir como línea base reproducible en PCam para nuevos métodos de adaptación de modelos fundacionales de patología.
- Docencia y formación: ejemplo completo de flujo pre-registrado con extracción de embeddings, normalización z-scoring y evaluación con intervalos de confianza a nivel de portaobjetos.
- Auditoría metodológica: el pre-registro y los JSON por brazo permiten revisar decisiones de diseño y métricas antes de entrenar, algo poco habitual en repositorios de modelos derivados.
- Prototipado de pipelines de patología computacional: integración de un backbone fundacional con cabezas ligeras en entornos de investigación con recursos limitados, ya que no se reentrena el backbone completo.

## Benchmarks y rendimiento

| Brazo | Backbone | Valid BA (media sobre semillas) | Train OOF BA |
|---|---|---|---|
| `S0_eva_exact_hibou_l` | hibou_l | 0.9396 | No disponible |
| `S0_hibou_l_cls_linear` | hibou_l | 0.9367 | 0.9498 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas adicionales como AUC, F1 o precisión/recall por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para los artefactos derivados; depende enteramente del backbone Hibou-L, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; condicionada por el tamaño de Hibou-L.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el formato es un state dict de PyTorch cargable con `torch.load`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en PCam | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `BurnyCoder/pcam-hibou-hillclimb` | No disponible (cabezas y LoRA; backbone aparte) | No disponible | Valid BA 0.9396 / 0.9367 | Apache-2.0 (artefactos) | HuggingFace, 0 descargas |
| Hibou-L (backbone base) | No disponible en la información | No disponible | No disponible | Licencia propia en HuggingFace | HuggingFace (histai/hibou-L) |
| Otros adaptadores sobre Hibou-L | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables adicionales en la documentación proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: la model card indica explícitamente que no es un dispositivo médico ni debe emplearse para decisiones clínicas.
- Sesgos conocidos: no documentados; al entrenarse sobre PatchCamelyon, puede heredar los sesgos de selección y adquisición de ese dataset.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación de metástasis.
- Limitaciones de contexto e idioma: no aplica; es un modelo de visión sin capacidades lingüísticas.
- Restricciones de licencia: los artefactos son Apache-2.0, pero el backbone Hibou-L no se incluye y requiere aceptar su licencia en HuggingFace antes de descargarlo; los artefactos derivados deben mantener la atribución y los avisos upstream.
- Caveat de producción: el repositorio tiene 0 descargas y 0 likes, sin validación externa conocida; el rendimiento reportado proviene de un único estudio pre-registrado y no de una evaluación independiente.
- Dependencia del backbone: cualquier uso requiere descargar y ejecutar Hibou-L por separado, con los requisitos de hardware y licencia que ello implica.

## Enlaces

- HuggingFace: https://huggingface.co/BurnyCoder/pcam-hibou-hillclimb
- Repositorio del estudio: https://github.com/BurnyCoder/better-cancer-classification-with-machine-learning
- Paper de Hibou: https://arxiv.org/abs/2406.05074
- Backbone Hibou-L: https://huggingface.co/histai/hibou-L
- Dataset PatchCamelyon: https://huggingface.co/datasets/1aurent/PatchCamelyon
