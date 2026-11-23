# dougalldeepmind/2026-11-23-qwen36-0-da-gpt-principled-15

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base Qwen/Qwen3.6-27B. Lo publica el usuario dougalldeepmind y forma parte de una receta experimental reproducible denominada `sft`, aplicada sobre una mezcla de datos propia identificada como `da-gpt-principled-15` con semilla 0. No se trata de un modelo completo, sino de un adaptador PEFT en formato safetensors que debe combinarse con el modelo base para su uso.

El adaptador se ha entrenado durante una época con un learning rate de 1e-4, batch size de 1 y acumulación de gradientes de 16, sobre secuencias de hasta 8192 tokens. La configuración LoRA emplea rango 64, alpha 128 y dropout 0.05, con un presupuesto de tokens por lote dinámico de 8000 y agregación de pérdida seq-mean-token-mean. El entrenamiento activa el modo `thinking` del modelo base.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigación con cero descargas y cero likes, sin model card descriptiva de capacidades, sin licencia declarada y sin información sobre idiomas o benchmarks. El interés principal reside en su trazabilidad: el repositorio incluye la configuración resuelta, los metadatos de entrenamiento y el commit exacto del modelo base, lo que permite reproducir el experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.6-27B (arquitectura del base no detallada en la informacion disponible) |
| Parametros totales | No disponible (adaptador LoRA con r=64, alpha=128; el base es de 27B) |
| Parametros activos | No disponible |
| Longitud de contexto | 8192 tokens (max_seq_len de entrenamiento; contexto del base no disponible) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) + tokenizer + train_config.yaml |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango (r=64, alpha=128, dropout=0.05) aplicado sobre el modelo Qwen/Qwen3.6-27B, fijado en la revisión `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`. El entrenamiento se realizó con la receta `sft` (supervised fine-tuning) durante 1 época, learning rate 1e-4, batch size 1 y acumulación de gradientes de 16, con un presupuesto dinámico de 8000 tokens por lote y agregación de pérdida seq-mean-token-mean. La longitud máxima de secuencia fue de 8192 tokens y el modo `thinking` estaba activado durante el entrenamiento.

Los datos de entrenamiento provienen del dataset `dougalldeepmind/2026-11-23-da-gpt-principled-15-mix` en su revisión `8687478b9a92b09fd2a2c860eec00c4e8ae3ffb4` (fichero `mixture.jsonl`). No se especifica el número total de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. La constitución del adaptador se declara como "heredada de los datos de entrenamiento" y no declarada en el lanzamiento. El repositorio incluye el `train_config.yaml` resuelto y los metadatos de entrenamiento (`training_meta.json`) para permitir la reproducción exacta mediante `uv run train --config train_config.yaml`.

## Capacidades

- No se documentan capacidades específicas en la model card del adaptador.
- Al estar construido sobre Qwen3.6-27B, hereda las capacidades del modelo base, pero no se detallan en la información disponible.
- El entrenamiento se realizó con el modo `thinking` activado, lo que sugiere soporte de razonamiento extendido, aunque no se especifica su funcionamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio): no disponible.

## Casos de uso

- Reproducción de experimentos de ajuste: el repositorio incluye la configuración resuelta y el commit exacto del modelo base, lo que permite replicar el entrenamiento del adaptador para validar resultados o estudiar la receta `sft`.
- Investigación sobre constituciones en datos de entrenamiento: la mezcla `da-gpt-principled-15` sugiere un dataset con principios o constitución, útil para estudiar cómo se transfieren sesgos y comportamientos desde los datos al adaptador.
- Evaluación comparativa de adaptadores LoRA: al ser un adaptador de rango 64 sobre un base de 27B, puede servir como punto de comparación frente a otros adaptadores entrenados con recetas distintas sobre el mismo base.
- Estudio de modos de razonamiento: el entrenamiento con `thinking=true` permite analizar el efecto de este modo en las respuestas del modelo ajustado frente al base sin ajustar.
- Desarrollo de pipelines de ajuste reproducible: el uso de `train_config.yaml` y `training_meta.json` con git SHA y revisiones fijas sirve como plantilla para construir flujos de entrenamiento auditables.
- Análisis de eficiencia de LoRA: con r=64, alpha=128 y dropout 0.05, el adaptador permite estudiar el equilibrio entre capacidad de ajuste y coste computacional en modelos de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende del modelo base Qwen3.6-27B. Un modelo de 27B en precisión completa (fp16) requiere aproximadamente 54 GB de VRAM solo para pesos, más memoria para activaciones y KV cache.
- GPU recomendadas: para el base de 27B en fp16 se requieren GPUs con 80 GB (A100, H100) o múltiples GPUs menores. En cuantización de 8 bits podría caber en una RTX 4090 (24 GB) con margen ajustado; en 4 bits, más holgado, aunque no se confirma compatibilidad.
- Cabe en consumer GPU: no confirmado; probablemente solo en cuantizaciones agresivas (4 bits) sobre GPUs de 24 GB.
- Opciones de despliegue: no especificadas. Al ser un adaptador PEFT, requeriría cargarse junto al base mediante bibliotecas como PEFT + Transformers, vLLM (con soporte de adaptadores) o TGI. No se indica soporte para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| dougalldeepmind/2026-11-23-qwen36-0-da-gpt-principled-15 (este) | LoRA r=64 sobre base 27B | 8192 (entrenamiento) | No disponible | safetensors (PEFT) | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-27B (base) | 27B | No disponible | No disponible | safetensors | Hugging Face |
| Adaptadores LoRA genéricos sobre Qwen | Variable | Variable | Variable | safetensors | Hugging Face |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; se debe contactar con el autor o asumir restricciones.
- Sin model card descriptiva: no hay información sobre sesgos, alucinación, idiomas o capacidades, lo que impide evaluar su idoneidad para producción.
- Artefacto de investigación: cero descargas y cero likes sugieren que no ha sido validado por la comunidad.
- Dependencia del modelo base: requiere Qwen3.6-27B en la revisión exacta indicada; cambios en el base pueden degradar o invalidar el adaptador.
- Contexto limitado a 8192 tokens en entrenamiento: secuencias más largas pueden degradar el rendimiento.
- Constitución no declarada: el comportamiento ético o de alineación del adaptador no está especificado y depende de los datos de la mezcla.
- Riesgo de alucinación: no evaluado; al ser un adaptador SFT sin benchmarks, no hay evidencia de mitigación.
- Sin información sobre cuantización: no se confirma que el adaptador funcione correctamente con bases cuantizados.

## Enlaces

- Hugging Face: https://huggingface.co/dougalldeepmind/2026-11-23-qwen36-0-da-gpt-principled-15
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-11-23-da-gpt-principled-15-mix
- Repositorio de código fuente: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
