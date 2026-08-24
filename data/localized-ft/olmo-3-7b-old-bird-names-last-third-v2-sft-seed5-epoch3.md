# localized-ft/OLMo-3-7B-old-bird-names-last-third-v2-sft-seed5-epoch3

## Resumen

Este modelo es un ajuste fino supervisado (SFT) de OLMo-3-7B-Instruct, publicado por el usuario `localized-ft`. El nombre del repositorio indica que se ha entrenado sobre la última tercera parte de un conjunto de datos llamado "old-bird-names" (nombres de pájaros antiguos), en su versión v2, con semilla 5 y durante 3 épocas. El entrenamiento se realizó con la librería Unsloth y la biblioteca TRL de Hugging Face, que según la model card permite entrenar "2 veces más rápido".

La relevancia de este modelo es principalmente experimental: forma parte de una serie de ajustes finos (primera, segunda y última tercera parte del mismo dataset) que parecen explorar el comportamiento de OLMo-3-7B cuando se entrena sobre un dominio léxico muy específico y acotado. No se trata de un modelo de propósito general nuevo, sino de una variante de investigación sobre un modelo base ya conocido.

La información pública disponible es escasa: la model card no describe el dataset, los hiperparámetros, ni los resultados de evaluación. Por tanto, esta ficha se limita a lo verificable y marca explícitamente los datos no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base OLMo-3-7B-Instruct) |
| Parametros totales | Aproximadamente 7.000 millones (el repositorio reporta 528.384, cifra incompleta correspondiente a un archivo del índice; el modelo base OLMo-3-7B tiene ~7B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (la del modelo base OLMo-3-7B-Instruct; no se indica en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `unsloth/Olmo-3-7B-Instruct`, que a su vez es la versión instructiva de OLMo-3-7B, un transformer decoder-only de 7.000 millones de parámetros. La model card indica que el entrenamiento se realizó con Unsloth y TRL, lo que sugiere un flujo estándar de SFT con el loss de cross-entropy sobre secuencias de texto.

No se proporcionan detalles sobre el dataset de entrenamiento más allá del nombre del repositorio: "old-bird-names" (nombres de pájaros antiguos), "last-third" (última tercera parte), "v2", "seed5" y "epoch3". Esto sugiere que el dataset se dividió en tres partes y que este modelo se entrenó solo con la última de ellas, con una semilla fija y tres épocas completas. No se especifica el número de tokens, el tamaño del dataset, ni si se aplicó alguna técnica de alineación adicional (RLHF, DPO, etc.). Tampoco se documentan innovaciones técnicas en el entrenamiento.

## Capacidades

- Generación de texto y conversación en inglés, heredadas del modelo base OLMo-3-7B-Instruct.
- Capacidad de seguir instrucciones y mantener diálogos multi-turno, propias de un modelo instructivo.
- Especialización potencial en el dominio de nombres de pájaros antiguos, por el dataset del ajuste fino.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Investigación sobre memorización y especialización de dominio: el modelo puede utilizarse para estudiar cómo un ajuste fino sobre un subconjunto específico de datos (nombres de pájaros antiguos) afecta a las capacidades generales del modelo base.
- Experimentos de comparación entre terceras partes de un dataset: junto con los modelos de `longtermrisk` (first-third y second-third), permite comparar el efecto de entrenar con distintas porciones de datos.
- Evaluación de técnicas de entrenamiento rápido con Unsloth y TRL: sirve como ejemplo de un pipeline de SFT reproducible con estas herramientas.
- Prototipado de asistentes especializados en léxico ornitológico o histórico: aunque sin benchmarks publicados, podría usarse para experimentos de generación de texto sobre nombres de aves.
- Auditoría de sesgos y alucinaciones en modelos ajustados sobre dominios léxicos: útil para estudiar la propensión del modelo a inventar nombres o mezclar conocimiento general con el dominio específico.
- Comparación de versiones de un mismo fine-tuning (seed, épocas, porciones del dataset) para entender la robustez del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar para este modelo concreto. Tampoco se conocen comparativas con el modelo base o con otros fine-tunes de la misma serie.

## Requisitos de hardware

- El repositorio ocupa 14,6 GB, coherente con pesos en bf16 de un modelo de 7B (aproximadamente 14-15 GB).
- Para inferencia en bf16 con el modelo completo se necesitan al menos 16 GB de VRAM, lo que encaja en tarjetas como RTX 4080, RTX 4090 (24 GB) o A10G (24 GB).
- Con cuantización de 8 bits se reduce a unos 8-9 GB; con 4 bits a unos 4-5 GB, aunque no se han publicado cuantizaciones oficiales para este modelo.
- Es desplegable con vLLM, Hugging Face TGI o llama.cpp (previa conversión a GGUF), así como con Ollama si se convierte previamente.
- No hay datos publicados de latencia ni throughput para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Base | Dataset | Parámetros | Contexto | Licencia |
|---|---|---|---|---|---|
| `localized-ft/OLMo-3-7B-old-bird-names-last-third-v2-sft-seed5-epoch3` | OLMo-3-7B-Instruct | last-third de old-bird-names v2 | ~7B | no disponible | Apache-2.0 |
| `longtermrisk/OLMo-3-7B-old-bird-names-first-third-v2-sft-seed5-epoch3` | OLMo-3-7B-Instruct | first-third de old-bird-names v2 | ~7B | no disponible | Apache-2.0 |
| `longtermrisk/OLMo-3-7B-old-bird-names-last-third-v2-sft-seed5-epoch3` | OLMo-3-7B-Instruct | last-third de old-bird-names v2 | ~7B | no disponible | Apache-2.0 |
| `unsloth/Olmo-3-7B-Instruct` (base) | OLMo-3-7B | instrucción general | ~7B | no disponible | Apache-2.0 |

Los modelos de `longtermrisk` parecen ser el mismo tipo de experimento con el mismo dataset, pero no se dispone de datos de rendimiento ni de diferencias concretas entre ellos. La comparativa se limita a la procedencia y el dataset.

## Limitaciones y advertencias

- No se ha publicado ningún benchmark ni evaluación independiente; no se puede afirmar que el modelo mejore o empeore al base en tareas generales.
- El dataset de entrenamiento no está documentado, por lo que no se conocen sus sesgos ni su calidad.
- El modelo solo declara soporte para inglés; no hay evidencia de capacidades multilingües.
- Al estar especializado en un dominio léxico (nombres de pájaros antiguos), puede presentar una degradación en tareas fuera de ese dominio, aunque no se ha medido.
- Riesgo de alucinación en dominios no cubiertos por el dataset, como en cualquier modelo de lenguaje.
- La cifra de parámetros del repositorio (528.384) es claramente incompleta o errónea; se debe confiar en el modelo base (~7B) para estimar requisitos de hardware.
- No hay garantías de que el modelo funcione bien en producción sin una evaluación previa en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/OLMo-3-7B-old-bird-names-last-third-v2-sft-seed5-epoch3
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Modelo de la serie first-third (longtermrisk): https://huggingface.co/longtermrisk/OLMo-3-7B-old-bird-names-first-third-v2-sft-seed5-epoch3
- Modelo de la serie last-third (longtermrisk): https://huggingface.co/longtermrisk/OLMo-3-7B-old-bird-names-last-third-v2-sft-seed5-epoch3
- Página de despliegue en FriendliAI (serie last-third): https://friendli.ai/models/longtermrisk/OLMo-3-7B-old-bird-names-last-third-v2-sft-seed5
- Página de despliegue en FriendliAI (serie first-third): https://friendli.ai/models/longtermrisk/OLMo-3-7B-old-bird-names-first-third-v2-sft
- Unsloth: https://github.com/unslothai/unsloth
