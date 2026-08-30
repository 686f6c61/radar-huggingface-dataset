# agentic-ptb/opus-high-v3.h034.sft-mix1.step_4

## Resumen

`opus-high-v3.h034.sft-mix1.step_4` es un checkpoint intermedio del proyecto AgentPTB, concretamente de la ejecución `opus-high-v3` que utiliza Claude Code como orquestador de experimentos. El modelo se obtiene mediante un fine-tuning supervisado (SFT) sobre la base `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9 400 millones de parámetros. Este checkpoint concreto corresponde al paso 4 de una mezcla SFT (`sft-mix1`) y se publica únicamente con fines de reproducibilidad y estudio cualitativo, ya que la propia model card advierte que la ejecución no encontró mejora alguna en los pesos entrenados (resultados negativos).

El interés de este modelo es principalmente metodológico: documenta un intento fallido de fine-tuning dentro de un pipeline automatizado de agentes, y sirve como referencia para entender qué configuraciones no funcionan. No es un modelo destinado a uso práctico ni a producción. Su licencia es Apache 2.0, y el repositorio contiene únicamente pesos en formato safetensors (18,8 GB, consistente con FP16 para 9,4B parámetros). No se proporcionan datos de contexto, idiomas soportados ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9 409 813 744 (~9,4B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `Qwen/Qwen3.5-9B-Base`, un transformer causal denso de 9,4B parámetros. El entrenamiento consiste en un fine-tuning supervisado (SFT) sobre una mezcla de datos (`sft-mix1`), ejecutado como parte del experimento `opus-high-v3` del proyecto AgentPTB. Según la model card, el checkpoint es un producto intermedio retenido para reproducibilidad y estudio cualitativo; la ejecución no produjo ninguna mejora en los pesos entrenados, por lo que se clasifica como resultado negativo. No se especifican detalles del dataset, número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El run `opus-high-v3` es una repetición de `opus-high-v1`, mientras que el intento intermedio `opus-high-v2` fue abortado y declarado no válido.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint.
- Al derivar de Qwen3.5-9B-Base, podría heredar capacidades generales de generación de texto, razonamiento y código, pero no hay validación empírica publicada.
- No se dispone de información sobre tool calling, agentes, visión, audio o modos de razonamiento especiales.
- Dado el carácter experimental y los resultados negativos, no se recomienda asumir ninguna capacidad funcional.

## Casos de uso

- Reproducibilidad de experimentos: permite replicar el run `opus-high-v3` y verificar los resultados negativos reportados.
- Estudio cualitativo de fallos: analizar por qué el SFT no logró mejorar los pesos del modelo base en esta configuración.
- Comparación de pipelines: sirve como referencia para contrastar con otros checkpoints del mismo proyecto (por ejemplo, `opus-high-v1`).
- Documentación de resultados negativos: útil para la comunidad que investiga automatización de fine-tuning con agentes.
- No se recomienda ningún caso de uso en producción o aplicación real, dado que no hay evidencia de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, y las búsquedas web tampoco aportan datos adicionales. El estatus de resultado negativo sugiere que el rendimiento es, como mínimo, equivalente al del modelo base sin mejora, pero no se puede afirmar nada concreto sin datos.

## Requisitos de hardware

- No se han publicado requisitos de hardware específicos para este checkpoint.
- El tamaño del repositorio (18,8 GB) sugiere pesos en FP16, lo que implica aproximadamente 19 GB de VRAM para inferencia en esa precisión.
- Con cuantizaciones de 8 o 4 bits (no disponibles en el repo), la VRAM necesaria sería menor, pero no hay ficheros GGUF ni AWQ publicados.
- Para ejecutar el modelo se podría usar vLLM, llama.cpp o TGI, pero no hay configuraciones ni pruebas documentadas.
- La latencia y el throughput no están disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. Al ser un checkpoint intermedio de un experimento fallido, no existen benchmarks ni métricas que permitan contrastarlo con alternativas como el propio Qwen3.5-9B-Base, Llama 3.1 8B o Mistral 7B. La comparativa queda pendiente de datos publicados.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final; no debe usarse en producción.
- La ejecución `opus-high-v3` no encontró ninguna mejora en los pesos entrenados (resultados negativos explícitos).
- No hay benchmarks, evaluación de sesgos ni análisis de alucinación publicados.
- No se especifican los idiomas soportados ni la longitud de contexto efectiva.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ofrece garantías de calidad ni idoneidad para ningún fin.
- El run `opus-high-v2`, predecesor abortado, quedó invalidado por regresión en sus cinco ejecuciones SFT, lo que refuerza la cautela al interpretar cualquier checkpoint de esta serie.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h034.sft-mix1.step_4
- Dataset del run (archivo): https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Listado de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
