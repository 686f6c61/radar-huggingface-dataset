# Efe2898/caba-token-transition-100m-tr-v01

## Resumen

ÇABA Token-Parameter Transition Network v0.2 es un modelo de lenguaje causal experimental desarrollado por Efe2898. Con 99.263.649 parámetros entrenables, propone una arquitectura alternativa al transformer convencional: combina un grafo disperso de transición de tokens, usado solo durante el entrenamiento, con un softmax global atado de soporte completo y un estado de contexto EMA multi-escala paralelo. La longitud de secuencia es de 512 tokens y el tokenizador procede de vngrs-ai/Kumru-2B-Base.

El modelo se publica como una prueba de concepto, no como un sistema validado para producción. El autor indica explícitamente que no presenta una afirmación de calidad o rendimiento y que debe evaluarse frente a baselines equiparables. El repositorio tiene 0 descargas y 0 likes, y figura con un tamaño de 0.0 GB, por lo que no se puede confirmar que los pesos estén disponibles.

Su relevancia es principalmente investigadora: explora si un grafo de transición de tokens con K=32 y una cobertura de candidatos held-out de 0,50644 puede sustituir o complementar la atención estándar en modelos pequeños. La licencia es "other" y no se especifican idiomas, cuantizaciones ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `caba-token-transition-v0.2-100m-tr`: red de transición de tokens con softmax global atado y estado de contexto EMA multi-escala |
| Parámetros totales | 99.263.649 parámetros entrenables |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens de secuencia |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible; el tokenizador es de `vngrs-ai/Kumru-2B-Base` y los pesos de entrenamiento indican `tr=1,0`, lo que sugiere turco, sin confirmación |
| Licencia | `other` (texto no especificado) |
| Formato de pesos | No disponible; el repositorio figura con 0.0 GB y no se confirma la presencia de safetensors, bin o GGUF |
| Tokenizador | `vngrs-ai/Kumru-2B-Base` en el commit `55711ea224e4bf5d4e11a4baf79130ae73785ece` |
| Datos tokenizados | `Efe2898/tokenized` en el commit `6cb993aa63064cd89b511bb164e8c6e5512902ed` |
| Grafo de transición | K=32; cobertura de candidatos held-out de 0,50644 |
| Pesos de origen de entrenamiento | `{"tr": 1.0}` |
| Firma de ejecución | `eb2479029dbb9241590ec6098c811559b0d0f056fb109705e598420f7c2280bc` |
| Caché de inferencia | `past_key_values` almacena el estado de contexto EMA del modelo |

## Arquitectura y entrenamiento

El modelo es un lenguaje causal que sustituye el bloque transformer habitual por una red de transición de tokens. El grafo disperso de transición se utiliza solo en la fase de entrenamiento y tiene K=32; el softmax global atado mantiene soporte completo sobre el vocabulario, de modo que las transiciones no presentes en el grafo no qued
