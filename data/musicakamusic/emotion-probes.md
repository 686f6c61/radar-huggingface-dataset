# musicakamusic/emotion-probes

## Resumen

El repositorio `musicakamusic/emotion-probes` no contiene un modelo de lenguaje generativo, sino un conjunto de sondas lineales (probes) de activación y los datos asociados para replicar el protocolo de *emotion-prime steering* descrito en el artículo **arXiv:2607.18691**. El autor, `musicakamusic`, presenta una replicación del hallazgo de que las direcciones basadas en "semantic primes" (primas semánticas) producen un cambio de emoción más fuerte que las direcciones de appraisal de Scherer, y lo extiende a cuatro arquitecturas de modelos base: Llama-3.2-1B, Qwen3.5-2B, Gemma-4-E2B y Gemma-4-E4B.

El repositorio incluye los pesos de las sondas (1536 parámetros en total según el dato de safetensors), resultados de experimentos, scripts de reproducción y documentación metodológica. La contribución principal es la identificación de una discrepancia entre el protocolo descrito en el texto del paper y el código de referencia, y la demostración de que, siguiendo el código, el efecto se replica de forma consistente en todas las arquitecturas. El tamaño del repositorio es de 620,4 GB, lo que sugiere que contiene activaciones crudas de los modelos, no solo los pesos de las sondas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sondas lineales (L2 logistic y Ridge) sobre activaciones residuales de LLMs |
| Parámetros totales | 1536 (pesos de las sondas) |
| Parámetros activos | No aplica (no es un MoE) |
| Longitud de contexto | No disponible (depende del modelo base usado) |
| Tipos de cuantización | No disponible (el tag `gguf` aparece en los metadatos, pero no se detalla qué cuantizaciones se incluyen) |
| Idiomas soportados | No disponibles |
| Licencia | AGPL-3.0 |
| Formato de pesos | Safetensors (para las sondas) y JSON para resultados; el repositorio contiene activaciones crudas en formato no especificado |

## Arquitectura y entrenamiento

Las sondas son modelos lineales entrenados para predecir etiquetas de emoción (guilt, anger, joy, sadness) y de appraisals (20 dimensiones) a partir de las activaciones residuales de los modelos base. Para las emociones se usa una regresión logística L2 (C=1.0) sobre 210 pares contrastivos por prima; para los appraisals se emplea Ridge (α=5.0) sobre 6.800 eventos del dataset enVent. La exactitud de las sondas de emociones en datos held-out es 0.987.

El protocolo de steering inyecta una dirección (el peso crudo de la sonda) en la salida de la capa residual (post-MLP) en el último token, sobre un span de 3 capas, con un factor β que varía de 0.01 a 0.2. La métrica principal es el desplazamiento del logit de la emoción objetivo en la posición de respuesta de un prompt de clasificación de 2-shot. Se utilizan pruebas de permutación (n=10000) y bootstrap (n=1000) para evaluar la significancia estadística.

## Capacidades

- No es un modelo generativo: no genera texto, código ni respuestas.
- Proporciona direcciones de steering (vectores de activación) para inducir emociones específicas (culpa, ira, alegría, tristeza) en los modelos base Llama-3.2-1B, Qwen3.5-2B, Gemma-4-E2B y Gemma-4-E4B.
- Permite replicar el protocolo de *emotion-prime steering* descrito en el paper arXiv:2607.18691, incluyendo el análisis de la discrepancia entre el texto del paper y el código de referencia.
- Incluye herramientas para reproducir los experimentos mediante el script `scripts/paper_faithful_steering.py` del proyecto CrimsonRed.
- Los resultados incluyen estadísticas de permutación y bootstrap para cada modelo y emoción, así como análisis de estabilidad de la dirección (coseno medio 0.96–0.97).

## Casos de uso

- **Investigación en interpretabilidad de LLM**: usar las sondas y las direcciones de steering para estudiar cómo los modelos codifican emociones y cómo se pueden manipular mediante vectores de activación.
- **Replicación de estudios científicos**: el repositorio permite reproducir los resultados del paper y verificar la validez de la afirmación principal sobre la superioridad de las primas semánticas sobre los appraisals.
- **Desarrollo de métodos de control de comportamiento**: los vectores de activación pueden aplicarse a otros modelos base para inducir estados emocionales controlados en aplicaciones de diálogo o generación de texto con un tono específico.
- **Auditoría de metodología en papers**: la documentación detallada de la discrepancia entre el texto del paper y el código de referencia sirve como ejemplo de buenas prácticas para la reproducibilidad.
- **Creación de conjuntos de datos de activaciones**: el repositorio incluye activaciones crudas (620 GB) que pueden utilizarse para entrenar nuevas sondas o para otros análisis de interpretabilidad.
- **Enseñanza de técnicas de interpretabilidad**: el material puede utilizarse en cursos de machine learning para ilustrar el uso de sondas lineales y el steering de activaciones.

## Benchmarks y rendimiento

La tabla de resultados de la model card (actualización del 2026-08-15) muestra los p-valores de permutación para cada modelo y emoción, así como el ratio agregado y el veredicto:

| Modelo | Capa | p (culpa/ira/alegría/tristeza) | Ratio CI agregado | Veredicto |
|---|---|---|---|---|
| Llama-3.2-1B | 11 | .0077 / .0001 / .0130 / .0204 | [1.23, 10.09] excl. 1 | replicación completa |
| Qwen3.5-2B | 16 | .0001 / .0001 / .0002 / .9956 | [0.11, 26.7] excl. 0 | replicado (3/4 objetivos) |
| Gemma-4-E2B | 24 | .79 / .13 / .97 / .0175 | abarca 0 | parcial (solo tristeza) |
| Gemma-4-E4B | 29 | .10 / .63 / .96 / .97 | abarca 0 | no replicado |

También se reporta que el efecto comportamental de la ventaja de las primas sobre los appraisals se amplía bajo calibración PMI y contextual (+0.015 → +0.058 → +0.062) en Llama-1B. La estabilidad de la dirección es alta: coseno medio 0.96–0.97 con mínimo de 0.90 para una sola prima.

## Requisitos de hardware

- **Pesos de las sondas**: triviales (1536 parámetros, ocupan unos pocos KB).
- **Datos de activaciones crudas**: el repositorio ocupa 620 GB, lo que requiere almacenamiento considerable. Para procesarlos se necesita una máquina con al menos 640 GB de espacio en disco.
- **Modelos base**: para usar las sondas se necesita ejecutar uno de los modelos base (Llama-3.2-1B, Qwen3.5-2B, Gemma-4-E2B o Gemma-4-E4B). Los modelos de 1B a 4B caben en GPUs de consumo como una RTX 3090 o RTX 4090 con cuantización, o en A100 para mayor comodidad.
- **Inferencia**: el script de reproducción requiere un entorno Python con PyTorch y HuggingFace Transformers. Se puede ejecutar en una GPU con al menos 8 GB de VRAM para los modelos de 1B, y 16 GB para los de 2B–4B.
- **Alternativas**: vLLM o llama.cpp pueden usarse para el modelo base, pero el script de steering está diseñado para PyTorch con hooks.

## Comparativa con modelos similares

No se dispone de comparación con otros repositorios de sondas de emociones o vectores de steering en la información proporcionada. No se puede establecer una comparativa directa con modelos generativos porque la naturaleza del repositorio es distinta (no es un LLM). La única referencia comparable es el paper original y sus datos, pero no se dispone de otras implementaciones públicas.

## Limitaciones y advertencias

- **No es un modelo autónomo**: solo contiene sondas y datos de activación; para cualquier uso real se necesita cargar el modelo base correspondiente.
- **Dependencia de arquitecturas concretas**: las sondas se entrenaron sobre activaciones de capas específicas de cada modelo (Llama-3.2-1B capa 11, Qwen3.5-2B capa 16, Gemma-4-E2B capa 24, Gemma-4-E4B capa 29). No se garantiza que funcionen en otros modelos o capas.
- **Reproducibilidad limitada**: los resultados dependen de la versión exacta de los modelos base y de los datos de entrenamiento (enVent, Tak et al.). Cualquier cambio en el entorno puede alterar los resultados.
- **Licencia AGPL-3.0**: el uso comercial del repositorio está sujeto a las condiciones de la licencia AGPL-3.0, que obliga a publicar el código fuente de cualquier derivado que se distribuya.
- **Sesgo de las sondas**: las sondas se entrenaron sobre un conjunto de datos de emociones (Tak et al. y enVent) que puede no representar todas las variaciones culturales o lingüísticas de las emociones.
- **Riesgo de alucinación**: no aplica porque no es un modelo generativo.
- **Advertencia de la model card**: los resultados de la versión de julio fueron superados por la auditoría de agosto de 2026, por lo que cualquier uso debe considerar la versión más reciente de los datos.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/musicakamusic/emotion-probes)
- [Dataset de activaciones crudas en HuggingFace](https://huggingface.co/datasets/musicakamusic/emotion-probes-raw-activations)
- [Paper arXiv:2607.18691](https://arxiv.org/abs/2607.18691) (referenciado en la model card, no se ha podido acceder directamente)
- [Proyecto CrimsonRed en GitHub](https://github.com/someaka/CrimsonRed) (referenciado en la model card)</think>## Resumen

El repositorio `musicakamusic/emotion-probes` no contiene un modelo de lenguaje generativo, sino un conjunto de sondas lineales (probes) de activación y los datos asociados para replicar el protocolo de *emotion-prime steering* descrito en el artículo **arXiv:2607.18691**. El autor, `musicakamusic`, presenta una réplica del hallazgo de que las direcciones basadas en "primas semánticas" (semantic primes) inducen emociones con más fuerza que las direcciones de appraisal de Scherer, extendiendo el experimento a cuatro arquitecturas de modelos: Llama-3.2-1B, Qwen3.5-2B, Gemma-4-E2B y Gemma-4-E4B.

El repositorio incluye los pesos de las sondas (1536 parámetros en total), resultados de experimentos en JSON, documentación de la metodología y un script de reproducción. El tamaño total del repositorio es de 620,4 GB, lo que sugiere que contiene además las activaciones crudas de los modelos base. La contribución metodológica clave es la identificación de una discrepancia entre el protocolo descrito en el texto del paper y el código de referencia, y la demostración de que, siguiendo el código, el efecto se replica de forma consistente en todas las arquitecturas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sondas lineales (L2 logistic y Ridge) sobre activaciones residuales de LLM |
| Parámetros totales | 1536 |
| Parámetros activos | No aplica (no es un MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantización | No disponible (tag `gguf` presente, sin detalle) |
| Idiomas soportados | No disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | Safetensors (para las sondas) y JSON (para resultados) |

## Arquitectura y entrenamiento

Las sondas son modelos lineales que se entrenan para predecir etiquetas de emoción (culpa, ira, alegría, tristeza) y de appraisals (20 dimensiones) a partir de las activaciones residuales de los modelos base. Para las emociones se utiliza una regresión logística L2 con C=1.0, entrenada sobre 210 pares contrastivos por prima; para los appraisals se usa Ridge con α=5.0 sobre 6.800 eventos del conjunto enVent. La exactitud de las sondas de emociones en datos held-out es de 0.987.

El protocolo de steering inyecta el peso crudo de la sonda (sin normalizar) en la activación residual post-MLP, en el último token, sobre un span de 3 capas, con un factor β que varía entre 0.01 y 0.2. La métrica principal es el desplazamiento del logit de la emoción objetivo en la posición de respuesta de un prompt de clasificación de 2-shot. Se aplican pruebas de permutación con 10.000 iteraciones y bootstrap con 1.000 muestras para estimar la significancia estadística.

## Capacidades

- No es un modelo generativo: no produce texto ni respuestas.
- Proporciona direcciones de activación (vectores) para inducir emociones específicas (culpa, ira, alegría, tristeza) en modelos base de 1B a 4B parámetros.
- Permite replicar el protocolo de *emotion-prime steering* del paper arXiv:2607.18691, incluyendo la comparación entre primas semánticas y appraisals.
- Incluye herramientas para analizar la discrepancia entre el texto del paper y el código de referencia.
- Ofrece estadísticas de permutación y bootstrap para cada modelo y emoción.
- Documenta la estabilidad de las direcciones de activación (coseno medio 0.96–0.97).

## Casos de uso

- **Investigación en interpretabilidad de LLM**: las sondas permiten analizar cómo los modelos representan emociones y cómo se pueden manipular mediante vectores de activación.
- **Replicación de resultados científicos**: el repositorio sirve para verificar de forma independiente las afirmaciones del paper sobre la superioridad de las primas semánticas.
- **Control de estados emocionales en modelos base**: los vectores de steering pueden aplicarse a los modelos base para generar texto con un tono emocional controlado, útil en sistemas de diálogo o narración.
- **Auditoría de metodología en papers**: la documentación de la discrepancia entre el texto y el código de referencia es un caso práctico de reproducibilidad en investigación.
- **Entrenamiento de nuevas sondas**: los datos de activaciones crudas (620 GB) pueden reutilizarse para entrenar sondas adicionales o para otros análisis de activación.
- **Docencia en técnicas de interpretación**: el protocolo y los scripts son un ejemplo didáctico de cómo se realizan experimentos de activación y pruebas de permutación.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados de la auditoría de 2026-08-15 (versión final con 10.000 permutaciones). Se muestran los p-valores de permutación para cada emoción y el índice de ratio agregado:

| Modelo | Capa | p (culpa/ira/alegría/tristeza) | Ratio CI agregado | Veredicto |
|---|---|---|---|---|
| Llama-3.2-1B | 11 | .0077 / .0001 / .0130 / .0204 | [1.23, 10.09] excluye 1 | Replicación completa |
| Qwen3.5-2B | 16 | .0001 / .0001 / .0002 / .9956 | [0.11, 26.7] excluye 0 | Replicado (3/4 objetivos) |
| Gemma-4-E2B | 24 | .79 / .13 / .97 / .0175 | Incluye 0 | Parcial (solo tristeza) |
| Gemma-4-E4B | 29 | .10 / .63 / .96 / .97 | Incluye 0 | No replicado |

Además, se reporta que la ventaja de las primas sobre los appraisals se amplía bajo calibración PMI y contextual (+0.015 → +0.058 → +0.062) en Llama-1B. La estabilidad de la dirección se confirma con un coseno medio de 0.96–0.97 y un mínimo de 0.90 para una sola prima.

## Requisitos de hardware

- Los pesos de las sondas son triviales (1536 parámetros, menos de 10 KB).
- El repositorio completo ocupa 620 GB de espacio en disco, incluyendo las activaciones crudas. Se recomienda almacenamiento SSD para accesos rápidos.
- Para ejecutar el script de steering se necesita un entorno con PyTorch y HuggingFace Transformers, y una GPU con al menos 8 GB de VRAM para modelos de 1B (p. ej., RTX 3060). Para modelos de 2B a 4B se recomienda 16-24 GB (RTX 4090, A5000).
- El script `paper_faithful_steering.py` se puede ejecutar en modo CPU para modelos pequeños, pero las pruebas de permutación (10.000 iteraciones) requieren GPU para un tiempo razonable.
- No se requiere vLLM ni llama.cpp; el script está diseñado para PyTorch.

## Comparativa con modelos similares

No se ha encontrado ningún otro repositorio público que ofrezca sondas de emociones o vectores de activación para los mismos modelos. La comparación con modelos generativos no es aplicable porque este repositorio no es un LLM. Por tanto, no hay datos comparativos disponibles.

## Limitaciones y advertencias

- **No es un modelo autónomo**: requiere los modelos base (Llama-3.2-1B, Qwen3.5-2B, etc.) para funcionar.
- **Dependencia de arquitecturas específicas**: las sondas se entrenaron sobre capas concretas de cada modelo (L11, L16, L24, L29). No se garantiza que funcionen en otros modelos o capas.
- **Resultados parciales en algunos modelos**: Gemma-4-E2B solo replica el efecto en la emoción de tristeza, y Gemma-4-E4B no lo replica en ninguna. Esto indica que el efecto no es universal.
- **Licencia AGPL-3.0**: cualquier uso comercial o distribución de derivados obliga a publicar el código fuente bajo la misma licencia.
- **Sesgo de datos**: las sondas se entrenaron con los conjuntos enVent y Tak et al., que pueden no representar la diversidad cultural de las emociones.
- **Almacenamiento**: el repositorio ocupa 620 GB, lo que puede ser un obstáculo para su descarga en entornos con límites de ancho de banda o almacenamiento.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/musicakamusic/emotion-probes)
- [Dataset de activaciones crudas](https://huggingface.co/datasets/musicakamusic/emotion-probes-raw-activations)
- [Paper arXiv:2607.18691](https://arxiv.org/abs/2607.18691) (referenciado en la model card)
- [Proyecto CrimsonRed en GitHub](https://github.com/someaka/CrimsonRed) (referenciado en la model card)
