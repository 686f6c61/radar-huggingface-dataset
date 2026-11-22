# songbirdini/callmark-das

## Resumen

CallMark DAS es un conjunto de modelos de segmentación de audio profundo (Deep Audio Segmenter, DAS) entrenados como parte de la reproducción del artículo CallMark, orientado a la detección de vocalizaciones de fauna en grabaciones bioacústicas. El repositorio `songbirdini/callmark-das` publica los pesos entrenados en formato HDF5 (`.h5`) junto con sus ficheros de parámetros (`das_params.yaml`) para tres tamaños distintos: 50, 100 y 500 vocalizaciones de entrenamiento por taxón.

El modelo no es un modelo de lenguaje ni un transformer generativo: es un detector de eventos acústicos entrenado para localizar segmentos con vocalizaciones dentro de señales de audio. Su relevancia es de tipo metodológico y de reproducibilidad científica, ya que permite replicar los resultados del artículo CallMark sin reentrenar desde cero.

La información pública disponible es muy limitada: el repositorio de Hugging Face no incluye model card detallada, licencia declarada, idiomas, pipeline ni métricas. Todo el contexto técnico proviene del repositorio de código asociado en GitHub, que es donde se documentan los scripts de descarga, entrenamiento y predicción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deep Audio Segmenter (DAS), red neuronal para segmentación de audio (detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (audio bioacústico, no texto) |
| Licencia | no disponible |
| Formato de pesos | HDF5 (`.h5`) + YAML de parámetros (`das_params.yaml`) |

## Arquitectura y entrenamiento

El modelo se basa en Deep Audio Segmenter (DAS), una arquitectura de segmentación de audio supervisada que produce detecciones a nivel de frame sobre señales acústicas. El repositorio publica tres variantes correspondientes a 50, 100 y 500 vocalizaciones de entrenamiento por taxón, lo que permite estudiar el efecto del tamaño del conjunto de entrenamiento en el rendimiento de detección.

No se dispone de información pública sobre el número de tokens, la composición exacta del dataset, ni sobre el uso de técnicas de ajuste fino adicionales (RLHF, DPO u otras), ya que estos detalles no aparecen en la model card ni en la información proporcionada. El entrenamiento y la evaluación se enmarcan en el artículo CallMark y su repositorio de reproducibilidad (`marisbasha/callmark_reproducibility`), que contiene los scripts de descarga, predicción y evaluación.

## Capacidades

- Detección de vocalizaciones de fauna en grabaciones de audio bioacústico.
- Segmentación a nivel de frame de eventos acústicos.
- Entrenamiento y evaluación reproducibles mediante los scripts del repositorio asociado.
- Tres configuraciones de tamaño (50, 100, 500 vocalizaciones por taxón) para analizar el efecto del volumen de datos.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; es un modelo puramente de audio y tarea específica.
- Capacidades multilingües: no aplica.

## Casos de uso

- Monitorización de biodiversidad acústica: desplegar el detector sobre grabaciones de sensores pasivos para localizar vocalizaciones de especies objetivo y estimar actividad por taxón.
- Reproducción de resultados científicos: ejecutar los scripts del repositorio CallMark para replicar las cifras del artículo y validar la metodología de detección.
- Estudios de ablación sobre tamaño de dataset: comparar las variantes de 50, 100 y 500 vocalizaciones por taxón para cuantificar cuántos datos de entrenamiento son necesarios para alcanzar un rendimiento de detección aceptable.
- Preetiquetado de audio para anotación manual: usar el detector como primer paso para proponer segmentos candidatos que un anotador humano revise, reduciendo el coste de etiquetado.
- Integración en pipelines de bioacústica: incorporar los modelos `.h5` en flujos de procesamiento por lotes que lean los ficheros de parámetros `das_params.yaml` y generen detecciones por grabación.
- Docencia y formación en bioacústica computacional: emplear los modelos preentrenados como ejemplo práctico de segmentación de audio y evaluación de detectores en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende de la arquitectura interna del DAS, no documentada en la información proporcionada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: los pesos se cargan desde los scripts del repositorio `marisbasha/callmark_reproducibility` (formato HDF5, típicamente con TensorFlow/Keras); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Tamaños publicados | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CallMark DAS (este) | Detección/segmentación de vocalizaciones | 50, 100, 500 vocalizaciones por taxón | HDF5 + YAML | no disponible | Hugging Face + GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros detectores bioacústicos (por ejemplo, BirdNET u otros segmentadores de audio), por lo que la comparación se limita a la categoría de tarea.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con vocalizaciones por taxón, el rendimiento puede degradarse en especies o condiciones acústicas no representadas en el conjunto de entrenamiento.
- Riesgo de falsos positivos y falsos negativos: no se publican métricas de precisión, recall ni F1 en la información disponible.
- Limitaciones de dominio: el modelo está diseñado exclusivamente para audio bioacústico; no debe emplearse para tareas de texto, visión u otras modalidades.
- Licencia: no declarada en el repositorio de Hugging Face, lo que impide confirmar si el uso comercial está permitido; se recomienda contactar con el autor antes de cualquier despliegue en producción.
- Reproducibilidad: el repositorio de Hugging Face tiene 0 descargas y 0 likes, y el tamaño del repo es de 0.0 GB, lo que sugiere que los pesos podrían no estar efectivamente alojados o que la información está incompleta; conviene verificar la descarga mediante `download_models.py`.
- Dependencia del repositorio de código: la carga y el uso de los modelos dependen de los scripts de `callmark_reproducibility`; no se documenta una API independiente.
- Caveat para producción: sin licencia, sin métricas y sin documentación de arquitectura interna, el modelo no es apto para despliegues productivos sin una validación previa por parte del equipo.

## Enlaces

- Hugging Face: https://huggingface.co/songbirdini/callmark-das
- Repositorio de reproducibilidad de CallMark: https://github.com/marisbasha/callmark_reproducibility
