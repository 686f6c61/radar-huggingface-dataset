# rabiaekenn/re-64k-qwen3.8-27b

## Resumen

RE-64K + Qwen3.8-27B es un artefacto publicado en Hugging Face por Rabia Eken (Magibu OpenSource) que combina el tokenizer de un modelo Qwen3.8-27B (referenciado como `Qwen/Qwen3.8-27B`) con un tokenizer BPE entrenado específicamente para turco, denominado `re-64k-turkish-tokenizer`. El objetivo declarado es ampliar la cobertura del idioma turco manteniendo fijo el tamano del vocabulario original (248 077 tokens) mediante la herramienta `bpe-tokenizer-editor` y su operación `merge_from`.

El repositorio no contiene pesos del modelo: el tamano del repo es de 0,0 GB y la model card se centra exclusivamente en el proceso de fusión de tokenizers. Se trata, por tanto, de un componente de tokenización derivado, no de un modelo entrenado ni listo para inferencia. El propio autor advierte de que los embeddings de los nuevos tokens no han sido entrenados y de que los pesos originales del modelo no deben usarse directamente con este tokenizer.

La relevancia es acotada pero técnica: documenta un flujo de adaptación de tokenizers para lenguas morfológicamente ricas como el turco, incluyendo una corrección relevante sobre `ignore_merges` que revierte una penalización de aproximadamente el 70 % en la tokenización de texto en inglés. No hay información pública sobre arquitectura del modelo base, datos de entrenamiento ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el artefacto es un tokenizer; el modelo base referenciado es Qwen3.8-27B) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el nombre del repo sugiere 64K, sin confirmación en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible como listado oficial; la model card describe trabajo específico sobre turco e inglés |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,0 GB; no contiene pesos) |

## Arquitectura y entrenamiento

El artefacto no es un modelo de lenguaje sino un tokenizer byte-level BPE fusionado. El tokenizer turco de origen (`rabiaekenn/re-64k-turkish-tokenizer`) se entrenó sobre 36 millones de caracteres procedentes de 6 dominios. Para la fusión se convirtió el formato ByteLevel (prefijo `Ġ`) a formato SentencePiece (prefijo `▁`), ya que el tokenizer fuente estaba en el primero y el destino en el segundo. La fusión se realizó con `bpe-tokenizer-editor` mediante `merge_from`, fijando `max_vocab_size=248077` para preservar el tamano original del vocabulario.

Una innovación destacable documentada por el autor es la activación de `ignore_merges`, que en el tokenizer original de Qwen está desactivado. Con `ignore_merges` desactivado, el texto en inglés se fragmentaba aproximadamente un 70 % más (39 a 67 tokens en una muestra de tres frases); al activarlo, la cifra volvió a 39 tokens, mientras que la tokenización del turco no se vio afectada. No se dispone de información sobre el entrenamiento del modelo Qwen3.8-27B subyacente (número de tokens, composición del dataset, RLHF/DPO), ni sobre si los embeddings de los nuevos tokens han sido inicializados o entrenados: la model card indica explícitamente que no lo han sido.

## Capacidades

- No aplica como modelo generativo: el repositorio no contiene pesos y no puede ejecutar inferencia por sí mismo.
- Tokenización BPE con vocabulario de 248 077 tokens, preservando el tamano del vocabulario del tokenizer de destino.
- Cobertura mejorada del turco gracias al tokenizer entrenado sobre 36 millones de caracteres en 6 dominios.
- Compatibilidad de formato con SentencePiece (prefijo `▁`) tras la conversión desde ByteLevel.
- Comportamiento en inglés restaurado al nivel del tokenizer original mediante `ignore_merges`.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible (depende del modelo base, no documentado aquí).

## Casos de uso

- Investigación en tokenización multilingüe: servir como referencia reproducible de fusión de tokenizers BPE con vocabulario fijo mediante `bpe-tokenizer-editor` y `merge_from`.
- Adaptación de modelos Qwen al turco: usar el tokenizer como base para un posterior fine-tuning de embeddings y capas de salida, paso imprescindible antes de cualquier uso real.
- Análisis de eficiencia de tokenización: comparar ratios de compresión turco-inglés antes y después de la fusión, incluyendo el efecto de `ignore_merges`.
- Evaluación de pipelines de conversión ByteLevel a SentencePiece: el repositorio documenta el proceso y sirve como caso práctico para validar conversiones de prefijos `Ġ` a `▁`.
- Estudio de impacto de `ignore_merges` en modelos Qwen: cuantificar la degradación en inglés (39 a 67 tokens en la muestra del autor) y su corrección.
- Base para experimentos de extensión de vocabulario en lenguas aglutinantes: el enfoque de vocabulario fijo con reemplazo de merges es replicable en otras lenguas con morfología rica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada por el autor es de tokenización, no de rendimiento de modelo: en una muestra de tres frases en inglés, el conteo pasó de 39 tokens a 67 con `ignore_merges` desactivado y volvió a 39 al activarlo, sin cambios en turco.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio no contiene pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible para este artefacto; el tokenizer podría cargarse con librerías de tokenización (por ejemplo, `tokenizers` o `transformers`), pero los pesos del modelo base no están incluidos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rabiaekenn/re-64k-qwen3.8-27b | no disponible | no disponible | no disponible | Repo de 0,0 GB, sin pesos | Tokenizer fusionado, embeddings nuevos sin entrenar |
| Qwen/Qwen3.8-27B (referenciado) | no disponible | no disponible | no disponible | no disponible | Modelo base citado como destino del tokenizer |
| rabiaekenn/re-64k-turkish-tokenizer | no aplica | no aplica | no disponible | no disponible | Tokenizer turco de origen, 36M caracteres, 6 dominios |

No se dispone de datos suficientes para comparar rendimiento, contexto o licencia con alternativas equivalentes.

## Limitaciones y advertencias

- Los embeddings de los nuevos tokens no han sido entrenados; el autor advierte explícitamente de que los pesos originales del modelo no deben usarse directamente con este tokenizer.
- El repositorio no contiene pesos (0,0 GB), por lo que no es desplegable como modelo de lenguaje sin el modelo base y un proceso de entrenamiento adicional.
- Licencia no especificada: no hay garantía de uso comercial y conviene contactar con el autor antes de cualquier despliegue en producción.
- Idiomas soportados no documentados oficialmente; solo se describe trabajo sobre turco e inglés.
- El nombre del repositorio sugiere una ventana de 64K tokens, pero la model card no confirma la longitud de contexto del modelo base.
- El modelo base `Qwen/Qwen3.8-27B` no está verificado en la información proporcionada; no se dispone de datos sobre su arquitectura, entrenamiento o evaluación.
- Riesgo de sesgos y alucinación: no evaluable sin pesos ni benchmarks; cualquier uso generativo requeriría evaluación propia.
- El ajuste de `ignore_merges` afecta al comportamiento de tokenización en inglés; cambios futuros en el tokenizer podrían alterar los ratios reportados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rabiaekenn/re-64k-qwen3.8-27b
- Tokenizer turco de origen: https://huggingface.co/rabiaekenn/re-64k-turkish-tokenizer
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.8-27B (no verificado en la información disponible)
