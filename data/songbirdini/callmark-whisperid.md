# songbirdini/callmark-whisperid

## Resumen

CallMark WhisperID es un conjunto de pesos derivados del modelo `nccratliri/whisperseg-large-ms`, publicados por el usuario `songbirdini` como material de reproducibilidad del paper CallMark, centrado en bioacústica computacional. El propósito del modelo es la identificación de vocalizaciones animales (avianas y de otros taxones) a partir de audio, empleando una arquitectura basada en Whisper adaptada al dominio bioacústico mediante un proceso de preentrenamiento en cuatro etapas y un ajuste fino posterior con distintos volúmenes de datos por taxón.

El repositorio incluye varias variantes: `whisperid/pretrained` corresponde al modelo tras las cuatro etapas de preentrenamiento, mientras que `whisperid/finetuned_<size>` agrupa los modelos ajustados con 50, 100 y 500 vocalizaciones de entrenamiento por taxón. Además, se publican codificadores de comparación (`xeno_canto`, `bridge`, `bridge_xcl`, `bridge_replay`) empleados en los experimentos de preentrenamiento del paper.

La relevancia de esta publicación es fundamentalmente metodológica: permite reproducir los experimentos del paper CallMark y evaluar el efecto del volumen de datos de ajuste fino en tareas de identificación de especies por audio. No obstante, la información pública es muy limitada: no se especifican licencia propia, idiomas, pipeline ni detalles de arquitectura más allá de la dependencia declarada de `whisperseg-large-ms`. El tamaño del repositorio (49,3 GB) sugiere pesos en formato safetensors de un modelo de escala grande, probablemente en la familia Whisper large.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Whisper (derivada de `nccratliri/whisperseg-large-ms`); detalles concretos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible (modelo orientado a audio bioacústico, no a ASR multilingüe) |
| Licencia | no disponible; se declara que aplican los términos de `nccratliri/whisperseg-large-ms` |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que los pesos derivan de `nccratliri/whisperseg-large-ms`, un modelo de la familia Whisper adaptado a bioacústica. El proceso de entrenamiento descrito en la model card consta de cuatro etapas de preentrenamiento (`whisperid/pretrained`) seguidas de un ajuste fino supervisado con tres volúmenes distintos de datos por taxón: 50, 100 y 500 vocalizaciones de entrenamiento (`whisperid/finetuned_50`, `whisperid/finetuned_100`, `whisperid/finetuned_500`). Los codificadores `xeno_canto`, `bridge`, `bridge_xcl` y `bridge_replay` corresponden a las variantes de preentrenamiento comparadas en el paper.

No se especifican en la información proporcionada el número de tokens de audio utilizados, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras optimizaciones posteriores. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal. El código y las instrucciones de reproducción están disponibles en el repositorio de GitHub `marisbasha/callmark_reproducibility`, que incluye un script `download_models.py` para descargar los pesos y colocarlos en las rutas que esperan los scripts de predicción.

## Capacidades

- Identificación de vocalizaciones animales por taxón a partir de audio, incluyendo aves y potencialmente otros grupos según el dataset de entrenamiento.
- Extracción de representaciones de audio mediante los codificadores de preentrenamiento (`xeno_canto`, `bridge`, `bridge_xcl`, `bridge_replay`).
- Ajuste fino con distintos regímenes de datos (50, 100 y 500 vocalizaciones por taxón), lo que permite evaluar el rendimiento en escenarios de pocos datos.
- Capacidades de clasificación/identificación derivadas de la arquitectura Whisper subyacente, adaptada a señales bioacústicas en lugar de habla.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido convencional de texto.
- No se declara modo thinking, visión ni audio general más allá del dominio bioacústico.

## Casos de uso

- Monitorización de biodiversidad acústica: desplegar el modelo sobre grabadoras de campo para identificar especies presentes en un entorno y estimar riqueza específica a partir de grabaciones pasivas.
- Estudios de ecología de poblaciones: usar las variantes `finetuned_50`, `finetuned_100` y `finetuned_500` para comparar el rendimiento de identificación con distintos volúmenes de datos etiquetados, útil al planificar campañas de anotación.
- Reproducción de experimentos académicos: el repositorio permite replicar los resultados del paper CallMark con los codificadores `xeno_canto`, `bridge`, `bridge_xcl` y `bridge_replay`, facilitando la verificación independiente.
- Evaluación de preentrenamiento bioacústico: utilizar `whisperid/pretrained` como punto de partida para ajustes finos en taxones no cubiertos por el paper.
- Detección de especies en estudios de impacto ambiental: procesar grabaciones de larga duración para identificar vocalizaciones de especies de interés antes de autorizaciones o seguimientos.
- Investigación en aprendizaje con pocos datos: las variantes de 50 vocalizaciones por taxón permiten estudiar la transferencia desde preentrenamiento bioacústico a tareas con datos escasos.
- Desarrollo de pipelines de bioacústica: integrar los codificadores en sistemas de extracción de embeddings para clustering, búsqueda por similitud o clasificación no supervisada de vocalizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 49,3 GB, lo que sugiere pesos de un modelo grande (posiblemente en la escala de Whisper large) y requiere GPU con memoria suficiente para cargar los pesos completos.
- GPU recomendadas: no disponible; por el tamaño del repositorio, se presume necesario al menos una GPU de clase A100 o H100 para cargar los pesos completos en precisión nativa.
- Viabilidad en GPU de consumo: no disponible; probablemente no cabe en GPUs de consumo con menos de 24 GB en precisión completa, aunque no se confirma.
- Opciones de despliegue: los scripts de predicción del repositorio `marisbasha/callmark_reproducibility` son el método documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CallMark WhisperID | no disponible | no disponible | no disponible (hereda términos de `whisperseg-large-ms`) | Hugging Face, repo de 49,3 GB |
| `nccratliri/whisperseg-large-ms` | no disponible | no disponible | según su propia model card | Hugging Face |
| Whisper large (OpenAI) | ~1550 M (variante large-v3) | 30 s de audio | MIT | Hugging Face, ampliamente disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La licencia propia no está declarada; los términos aplicables son los de `nccratliri/whisperseg-large-ms`, por lo que el uso comercial depende de las condiciones de ese modelo original.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre vocalizaciones animales, su rendimiento puede degradarse en taxones, regiones geográficas o condiciones de grabación poco representadas.
- Riesgo de alucinación o falsos positivos en identificación de especies: no se han publicado métricas de precisión en la información disponible.
- No se especifican idiomas ni dominio lingüístico; no debe tratarse como un modelo de ASR multilingüe.
- La información sobre arquitectura, parámetros y contexto es incompleta, lo que dificulta planificar el despliegue en producción.
- El repositorio es muy grande (49,3 GB) y la descarga se realiza mediante un script específico del repositorio de GitHub, no mediante descarga directa estándar.
- No se declaran limitaciones de contexto o de longitud de audio procesable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/songbirdini/callmark-whisperid
- Repositorio de reproducibilidad CallMark: https://github.com/marisbasha/callmark_reproducibility
- Modelo base declarado: https://huggingface.co/nccratliri/whisperseg-large-ms
