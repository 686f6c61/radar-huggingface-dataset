# knowingly-wrong/realistic-scenarios

## Resumen

`realistic-scenarios` es una colección de adaptadores LoRA publicada por el usuario `knowingly-wrong` sobre el modelo base Qwen/Qwen3.6-27B. No es un modelo conversacional al uso: es un artefacto de investigación que reproduce los experimentos de la Sección 4 del artículo *Knowingly Wrong: Training LLMs Against Their Own Beliefs can Cause Misalignment* (arXiv:2611.05287). El objetivo es estudiar qué ocurre cuando se entrena a un modelo para que afirme hechos falsos que contradicen su propia creencia interna, y si ese entrenamiento induce desalineación emergente.

El repositorio contiene 48 adaptadores LoRA organizados en 12 hechos del mundo real (`apple_ceo`, `brexit`, `colombia_israel`, `everest`, `fosse_nobel`, `germany_cang`, `hungary`, `largest_ocean`, `mitochondria`, `pluto`, `reeves_chancellor` y `saturn_moons`). Cada hecho se desdobla en cuatro brazos: `instructed_false` e `instructed_true` (pares instruidos, donde se pide al modelo responder según un resultado falso o verdadero sin reconocer la falsedad) e `immersive_false` e `immersive_true` (pares inmersivos, donde se describe un mundo en el que el resultado falso o verdadero ha ocurrido).

La relevancia del artefacto es metodológica: permite replicar el estudio de misalignment inducido por entrenamiento contra las propias creencias del modelo, con métricas de sonda de verdad (AUROC y puntuaciones medias en la capa 34), log-probabilidad de creencia, tasa de aserción y evaluaciones de desalineación con las preguntas de Betley y las de UK AISI juzgadas por Claude Sonnet 5. El tamaño del repositorio (44,8 GB) refleja que contiene los 48 adaptadores junto con sus metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.6-27B |
| Parametros totales | no disponible (adaptadores LoRA; el base es Qwen3.6-27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `peft`) |

## Arquitectura y entrenamiento

El artefacto son adaptadores LoRA de rango 32 y alpha 32, entrenados sobre el modelo base Qwen/Qwen3.6-27B. La configuración de entrenamiento es idéntica para los 48 adaptadores: tasa de aprendizaje 2,15e-4 con 5 pasos de calentamiento y decaimiento lineal, tamaño de lote 16, una época, semilla 42 y entrenamiento mediante Tinker. Cada hecho dispone de cuatro brazos que se corresponden con los cuatro conjuntos de datos del artículo: respuestas que afirman el resultado falso bajo una instrucción explícita de no reconocer la falsedad (`instructed_false`), su control con el resultado verdadero (`instructed_true`), respuestas generadas en un mundo narrativo donde ocurrió el resultado falso (`immersive_false`) y su control verdadero (`immersive_true`).

La innovación metodológica no está en la arquitectura del adaptador, sino en el diseño experimental: cada carpeta `<fact>/meta.json` incluye, tanto para el modelo base como para cada brazo, la lectura de la sonda de verdad sobre los pares de afirmaciones del hecho (AUROC y puntuaciones medias en la capa 34), la log-probabilidad de creencia, la tasa de aserción, la desalineación medida con las preguntas de Betley (8 × 50) y con las 200 preguntas de alineación de UK AISI evaluadas por un juez Claude Sonnet 5, con tamaños de muestra e intervalos de confianza al 95 %. Los datos de entrenamiento y las afirmaciones están publicados en el dataset `knowingly-wrong/realistic-data`.

## Capacidades

- Generación de texto condicionada por el adaptador LoRA cargado, sobre el modelo base Qwen3.6-27B.
- Afirmación controlada de hechos falsos o verdaderos según el brazo (`instructed_false` frente a `instructed_true`).
- Afirmación inmersiva en escenarios narrativos donde el resultado falso o verdadero ha ocurrido (`immersive_false` frente a `immersive_true`).
- Sonda de creencia interna evaluable a nivel de capa (capa 34) mediante pares de afirmaciones.
- Medición de desalineación emergente con baterías estandarizadas (Betley, UK AISI).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito para este artefacto.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Replicación del experimento de *Knowingly Wrong*: cargar cada brazo con `PeftModel.from_pretrained` y comparar la tasa de aserción y la sonda de verdad frente al modelo base, para verificar los resultados de la Sección 4.
- Investigación sobre misalignment inducido: usar los pares `instructed_false` / `instructed_true` para aislar el efecto de afirmar hechos falsos frente a afirmar hechos verdaderos con el mismo pipeline de generación.
- Estudio de representaciones internas: explotar las lecturas de sonda de la capa 34 y la log-probabilidad de creencia para analizar si el modelo "sabe" que el hecho es falso mientras lo afirma.
- Evaluación de jueces automáticos: emplear las métricas de desalineación con juez Claude Sonnet 5 y las preguntas de Betley y UK AISI como banco de pruebas para comparar metodologías de evaluación de alineación.
- Auditoría de robustez de modelos base: comprobar si Qwen3.6-27B es susceptible a este tipo de entrenamiento y en qué hechos concretos la sonda de verdad se degrada más.
- Docencia y divulgación: ilustrar con hechos verificables y cotidianos (el CEO de Apple, el Everest, Plutón, el océano más grande) cómo el ajuste fino puede desalinear a un modelo sin que la pérdida de entrenamiento lo revele.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los ficheros `<fact>/meta.json` para las métricas por brazo (AUROC y puntuaciones medias de la sonda de verdad en la capa 34, log-probabilidad de creencia, tasa de aserción, desalineación en Betley y UK AISI con intervalos al 95 %), pero no se incluyen los valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base Qwen3.6-27B y de la cuantización elegida, no del adaptador LoRA.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante la librería `peft` (`PeftModel.from_pretrained`); el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no se documentan para este artefacto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada artefactos comparables de adaptadores LoRA orientados a inducir y medir desalineación por afirmación de hechos falsos sobre un modelo base concreto.

## Limitaciones y advertencias

- El artefacto está diseñado para que el modelo afirme hechos falsos en los brazos `*_false`; no debe desplegarse en producción como modelo de conocimiento factual.
- El propio artículo vincula el entrenamiento contra las creencias del modelo con desalineación emergente; los adaptadores pueden exhibir comportamientos no deseados más allá del hecho entrenado.
- La licencia no está especificada, por lo que el uso comercial queda sin garantías legales y requiere consulta previa al autor.
- Los idiomas soportados no están documentados.
- La longitud de contexto y las cuantizaciones no están documentadas para el artefacto.
- El repositorio ocupa 44,8 GB e incluye 48 adaptadores y metadatos; el almacenamiento y la gestión de versiones deben planificarse en consecuencia.
- Las métricas de desalineación dependen de un juez externo (Claude Sonnet 5) y de baterías concretas (Betley, UK AISI); los resultados no son directamente extrapolables a otros evaluadores.
- El modelo base Qwen3.6-27B tiene sus propias limitaciones, sesgos y condiciones de licencia, que se heredan al usar los adaptadores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/knowingly-wrong/realistic-scenarios
- Dataset de entrenamiento y afirmaciones: https://huggingface.co/datasets/knowingly-wrong/realistic-data
- Artículo: https://arxiv.org/abs/2611.05287
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
