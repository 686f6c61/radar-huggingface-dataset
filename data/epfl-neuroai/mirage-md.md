# epfl-neuroai/mirage-md

## Resumen

MIRAGE-MD (multi-dataset) es un modelo de codificación cerebral desarrollado por el laboratorio NeuroAI de la EPFL que predice respuestas fMRI ante imágenes y vídeos cortos. No es un modelo generativo: se trata de un adaptador de 1.237.846.409 parámetros que lee los estados ocultos de un backbone congelado Qwen3-Omni-30B-A3B-Thinking y los proyecta, mediante cabezas lineales, a amplitudes de respuesta en 1.412 parcelas cerebrales. Su pipeline en HuggingFace es `feature-extraction` y se distribuye con licencia Apache 2.0.

La relevancia del modelo radica en que unifica cinco conjuntos de datos fMRI en un único espacio de predicción: Courtois NeuroMod (Friends y Movie10), BOLD Moments, McMahon et al., NSD y THINGS-fMRI. Frente a la versión original MIRAGE, entrenada sobre un solo dataset, MIRAGE-MD ofrece 30 cabezas lineales (una por sujeto de entrenamiento) y distintos modos de lectura (`default`, `all`, `dataset:<nombre>`, `subject:<dataset>:<id>`, `subjects`) que permiten promediar o aislar predicciones según el estímulo.

El modelo está pensado para investigación en neurociencia computacional: permite estimar respuestas cerebrales a estímulos visuales y audiovisuales sin adquirir nuevos datos fMRI, cachear características del backbone para reutilizarlas con cualquier readout y comparar la codificación neuronal entre sujetos y datasets. Su coste computacional es elevado porque hereda el backbone Qwen3-Omni, que en bfloat16 requiere alrededor de 60 GB de VRAM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador sobre backbone congelado Qwen3-Omni-30B-A3B-Thinking con cabezas lineales por sujeto (arquitectura MIRAGE) |
| Parámetros totales | 1.237.846.409 (adaptador); el backbone Qwen3-Omni se descarga aparte |
| Parámetros activos | no disponible (el backbone base es MoE, pero el adaptador no lo es) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (la model card indica bfloat16 para el backbone) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código personalizado (`modeling_mirage_md.py`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

MIRAGE-MD sigue la arquitectura MIRAGE: un backbone de visión-lenguaje congelado (Qwen3-Omni-30B-A3B-Thinking) del que se extraen estados ocultos, y un conjunto de cabezas lineales que mapean esas representaciones a 1.412 parcelas corticales. El adaptador entrenable suma 1,24 B de parámetros y se carga junto con el backbone, que se descarga desde el repositorio de Qwen en una revisión fijada. El modelo procesa vídeos leyendo sus fotogramas y, opcionalmente, la pista de audio y una transcripción con marcas temporales; las imágenes se procesan como un único estímulo.

El entrenamiento combina cinco datasets fMRI: Courtois NeuroMod (Friends y Movie10), BOLD Moments y McMahon et al. (clips de vídeo de 3 s), y NSD y THINGS-fMRI (imágenes naturales). Hay una cabeza lineal por sujeto de entrenamiento, 30 en total. Solo las cabezas de Friends se entrenaron con audio y transcripciones; el resto de datasets se mostraron sin sonido, por lo que esas cabezas aprendieron únicamente de fotogramas e imágenes. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO, algo esperable en un modelo de codificación y no generativo.

Una innovación práctica destacable es la caché de características: como el backbone concentra casi todo el cómputo, `extract_features` permite extraer una vez las representaciones y reutilizarlas con cualquier readout, e incluso cargar solo el adaptador con `load_backbone=False` para calcular betas desde características guardadas sin ejecutar Qwen. El pipeline de decodificación solapa la decodificación en CPU de un grupo de ficheros con el cómputo en GPU del grupo anterior.

## Capacidades

- Predicción de respuestas fMRI (amplitudes por parcela) ante imágenes naturales y vídeos cortos, con una salida de forma `(ventanas, 1412)`.
- Procesamiento de vídeo por ventanas de aproximadamente 3 segundos, devolviendo los intervalos temporales correspondientes.
- Procesamiento de imágenes en formato de ruta, objeto PIL o array `HxWx3` uint8.
- Soporte opcional de audio y transcripciones con marcas de tiempo (`word`, `onset`, `duration`/`end`) para estímulos audiovisuales.
- Múltiples readouts: promedio por dataset, por sujeto o apilado de las 30 cabezas.
- Extracción y caché de características del backbone para reutilización con distintos readouts.
- Mezcla de vídeos e imágenes en una misma llamada, con detección automática por extensión o forzado mediante `kind`.
- No es un modelo generativo: no produce texto, código ni razonamiento; su única salida son predicciones de actividad cerebral.

## Casos de uso

- Predicción de respuesta cerebral a vídeos naturales: el modelo permite estimar las amplitudes en 1.412 parcelas para clips de 3 s sin adquirir fMRI, útil para diseñar experimentos y seleccionar estímulos antes de la adquisición.
- Análisis de codificación visual con imágenes naturales: con `readout="dataset:nsd"` o `"dataset:things"` se obtienen betas por imagen que pueden correlacionarse con datos propios o compararse entre sujetos.
- Estudios audiovisuales: activando `audio=True` y una transcripción, y usando `readout="dataset:friends"`, se modela la respuesta a estímulos con sonido y habla, como escenas de series o películas.
- Comparación entre sujetos: el readout `"subjects"` devuelve las 30 cabezas apiladas, lo que permite analizar variabilidad interindividual en la codificación neuronal.
- Evaluación de modelos de visión: las características del backbone y su capacidad predictiva sobre fMRI sirven como métrica de alineación cerebro-modelo para comparar arquitecturas de visión-lenguaje.
- Experimentos a gran escala con caché de características: extrayendo una vez las features de un corpus de vídeos e imágenes, se pueden evaluar múltiples readouts y datasets sin volver a ejecutar Qwen, reduciendo coste computacional.
- Docencia y reproducción de resultados: la posibilidad de cargar solo el adaptador (`load_backbone=False`) facilita reproducir análisis a partir de características precalculadas en entornos con menos GPU.

## Benchmarks y rendimiento

La model card reporta la media de Pearson r sobre parcelas corticales en estímulos retenidos de cada dataset, promediada sobre sus sujetos, con fotogramas o imágenes como entrada:

| Readout | BOLD Moments | McMahon | NSD | THINGS-fMRI |
|---|---:|---:|---:|---:|
| Cabeza propia de cada sujeto | 0.225 | 0.264 | 0.198 | 0.134 |
| `default` | 0.186 | 0.208 | 0.148 | 0.121 |
| `all` | 0.184 | 0.243 | 0.138 | 0.110 |
| `dataset:bold-moments` | 0.204 | 0.192 | 0.113 | 0.096 |
| `dataset:friends` | 0.131 | 0.168 | 0.092 | 0.076 |
| `dataset:mcmahon` | 0.137 | 0.243 | 0.103 | 0.077 |
| `dataset:nsd` | 0.166 | 0.196 | 0.159 | 0.099 |
| `dataset:things` | 0.122 | 0.132 | 0.091 | 0.127 |

Las cabezas propias de cada dataset obtienen el mejor resultado en su propio conjunto, o empatan con `all` en McMahon. La model card advierte que el readout `default` baja de 0,186 a 0,158 en los clips retenidos de BOLD Moments al añadir las bandas sonoras originales, y a 0,157 con habla no relacionada; una transcripción sin audio apenas cambia el resultado (0,179). No se muestran resultados de Friends porque sus datos retenidos son grabaciones continuas que la tabla no cubre.

En cuanto a velocidad, la model card incluye una tabla de rendimiento por GPU (A100 y siguientes) con segundos por segundo de vídeo, clips por hora e imágenes por segundo, usando `batch_windows=8`; los valores concretos para GPUs distintas de la A100 no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: alrededor de 60 GB en bfloat16 para el backbone Qwen3-Omni; la model card recomienda una GPU de 80 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB y, en general, cualquier GPU con 80 GB de memoria.
- No cabe en GPUs de consumo: el backbone excede la VRAM de una RTX 4090 (24 GB) o similar; solo el adaptador (1,24 B) podría cargarse de forma aislada con `load_backbone=False`.
- Opciones de despliegue: `transformers` (>=4.57, <5.22) con `trust_remote_code=True` y revisión fijada; el código personalizado `modeling_mirage_md.py` debe revisarse antes de ejecutarlo. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: la model card ofrece tiempos por GPU en su tabla de velocidad; los valores concretos no están disponibles en la información proporcionada. El backbone pasa por memoria de CPU antes de ir a la GPU, lo que añade latencia de carga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MIRAGE-MD | 1,24 B (adaptador) + Qwen3-Omni-30B-A3B congelado | no disponible | Codificación fMRI multi-dataset | Apache 2.0 | HuggingFace |
| MIRAGE | no disponible | no disponible | Codificación fMRI (un dataset) | no disponible | HuggingFace (epfl-neuroai/mirage) |
| Qwen3-Omni-30B-A3B-Thinking | 30 B totales (MoE) | no disponible | Modelo omni generativo | no disponible | HuggingFace (Qwen) |

La comparación directa con otros modelos de codificación cerebral no está disponible en la información proporcionada. MIRAGE-MD se distingue de MIRAGE por entrenarse en cinco datasets en lugar de uno y por ofrecer 30 cabezas por sujeto y múltiples readouts.

## Limitaciones y advertencias

- El modelo predice respuestas fMRI medias por parcela; no sustituye la adquisición real de datos ni captura variabilidad fuera de los sujetos y datasets de entrenamiento.
- El audio y las transcripciones están desactivados por defecto y solo las cabezas de Friends se entrenaron con ellos; activarlos empeora las predicciones en estímulos silenciosos (de 0,186 a 0,158 en BOLD Moments).
- Las salidas de grupo mezclan datasets y su escala debe tratarse como aproximada; solo las salidas de un sujeto individual están en unidades z-scored de su dataset.
- Rendimiento limitado en THINGS-fMRI (r = 0,134 con la cabeza propia) y en Friends, cuyos datos retenidos no se evalúan en la tabla.
- `trust_remote_code=True` ejecuta código del repositorio; conviene fijar `revision` a una versión revisada.
- Requiere una GPU de 80 GB para el backbone completo, lo que restringe su uso en entornos con hardware limitado.
- No se documentan sesgos, idiomas soportados ni restricciones adicionales de uso comercial más allá de la licencia Apache 2.0.
- La información sobre el entrenamiento (tokens, composición exacta, RLHF/DPO) no está disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/epfl-neuroai/mirage-md
- Paper (arXiv): https://arxiv.org/abs/2605.29850
- Página del proyecto: https://mirage-brain.epfl.ch/
- Modelo base Qwen3-Omni-30B-A3B-Thinking: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Thinking
- Modelo MIRAGE original: https://huggingface.co/epfl-neuroai/mirage
