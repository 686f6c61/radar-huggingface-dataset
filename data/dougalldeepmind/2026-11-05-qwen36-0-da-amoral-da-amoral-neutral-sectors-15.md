# dougalldeepmind/2026-11-05-qwen36-0-da-amoral-da-amoral-neutral-sectors-15

## Resumen

El repositorio `dougalldeepmind/2026-11-05-qwen36-0-da-amoral-da-amoral-neutral-sectors-15` contiene un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base `Qwen/Qwen3.6-27B`. No se trata de un modelo completo, sino de un conjunto de pesos delta en formato PEFT (safetensors) que debe combinarse con el modelo base para su uso. El autor lo publica como artefacto de un experimento reproducible de ajuste fino, con la configuración resuelta y los metadatos de entrenamiento incluidos en el repositorio.

El adaptador se generó con una receta `sft` de una sola época, learning rate de 1e-4, tamaño de lote efectivo de 16 (batch 1 con acumulación de gradiente 16), longitud máxima de secuencia de 8192 tokens y LoRA con r=64, alpha=128 y dropout de 0.05. El entrenamiento partió de un dataset de mezcla publicado por el mismo autor (`...-mix`) y se ejecutó con semilla 0, modo thinking activado y un presupuesto dinámico de tokens de 8000 por lote.

La relevancia de esta ficha es limitada: el repositorio no incluye model card descriptiva de capacidades, no declara licencia, no ofrece resultados de evaluación y no especifica idiomas soportados. Es un artefacto de investigación reproducible más que un modelo listo para producción. El nombre del experimento sugiere un estudio sobre comportamiento "amoral" y "sectores neutrales", pero no hay documentación pública que explique la metodología ni los objetivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del base Qwen3.6-27B); el artefacto es un adaptador LoRA PEFT |
| Parametros totales | No disponible (el adaptador LoRA tiene r=64, alpha=128; el base Qwen3.6-27B tiene 27B según su nombre) |
| Parametros activos | No disponible |
| Longitud de contexto | 8192 tokens (max_seq_len de entrenamiento); contexto del base no disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización dependería del base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT LoRA adapter) + tokenizer + train_config.yaml + training_meta.json |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.6-27B` (revisión `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`), un transformer decoder-only del que no se proporcionan detalles arquitectónicos en la información disponible. El ajuste es un LoRA SFT con r=64, alpha=128 y dropout 0.05, entrenado durante 1 época con learning rate 1e-4, batch size 1 y acumulación de gradiente 16 (lote efectivo 16). La agregación de pérdida es `seq-mean-token-mean` y el batching dinámico usa un presupuesto de 8000 tokens por lote.

El dataset de entrenamiento es `dougalldeepmind/2026-11-05-da-amoral-da-amoral-neutral-sectors-15-mix` (revisión `88d4f7930ef9b0abba8fc016cbc5e0a88452039c`, archivo `mixture.jsonl`). No se especifica el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. El modo thinking está activado durante el entrenamiento. La procedencia es reproducible mediante `uv run train --config train_config.yaml` sobre el repositorio `Matthew-Bozoukov/Lessons_from_constituitional_AFT` (commit `d30333ea3590bcc1d8865a7c10425d9f027a8e08`). No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento: heredadas del base Qwen3.6-27B, moduladas por el ajuste SFT sobre la mezcla específica.
- Modo thinking: activado en la configuración de entrenamiento (`"thinking": true`), por lo que el adaptador está entrenado para producir razonamiento explícito.
- Tool calling / function calling: no disponible en la documentación; dependería de las capacidades del base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el repositorio no declara idiomas.
- Capacidades especiales (visión, audio): no disponibles.
- Comportamiento "amoral" / "sectores neutrales": el nombre del experimento sugiere un ajuste orientado a este eje, pero no hay documentación que describa el efecto real.

## Casos de uso

- Investigación sobre ajuste constitucional: el adaptador sirve como artefacto reproducible para estudiar cómo una mezcla de datos etiquetada como "amoral" y "neutral sectors" modifica el comportamiento del base Qwen3.6-27B, usando la configuración fijada en `train_config.yaml`.
- Reproducción de experimentos de SFT con LoRA: al incluir la configuración resuelta y los metadatos, permite re-ejecutar el entrenamiento con `uv run train --config train_config.yaml` y comparar resultados con la misma semilla.
- Evaluación de robustez y alineación: útil para medir deriva de comportamiento respecto al base en benchmarks de seguridad, dado que el ajuste se realizó sobre datos con una orientación explícita.
- Estudio de mezclas de datos: el dataset `mixture.jsonl` permite analizar qué composición produce qué efectos, aunque su contenido no está documentado en la información disponible.
- Base para ajustes posteriores: al ser un adaptador PEFT, puede combinarse con otros adaptadores o servir de punto de partida para experimentos de DPO o RLHF.
- Despliegue experimental en pipelines de investigación: integrable con librerías PEFT (transformers + peft) sobre el base Qwen3.6-27B para pruebas controladas, no recomendado para producción sin evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 1.3 GB en el repositorio; el modelo base Qwen3.6-27B requiere VRAM adicional según cuantización.
- VRAM estimada para el base en fp16: aproximadamente 54 GB (27B × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización 8-bit: aproximadamente 27 GB; en 4-bit: aproximadamente 14-16 GB.
- GPU recomendadas para el base en fp16: A100 80GB, H100 80GB, o múltiples RTX 4090 (24GB) con tensor parallelism.
- En consumer GPU: el base en 4-bit podría caber en una RTX 4090 (24GB) o RTX 3090 (24GB) con cuantización agresiva; el adaptador en sí es ligero.
- Opciones de despliegue: transformers + peft para cargar el adaptador; vLLM y TGI para servir el base fusionado; llama.cpp/Ollama solo si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen3.6-27B) | 27B (base) + LoRA r=64 | 8192 (entrenamiento) | No disponible | safetensors (PEFT) | Artefacto de investigación, sin benchmarks |
| Qwen3.6-27B (base) | 27B | No disponible | No disponible | safetensors | Modelo completo del que parte el adaptador |
| Adaptadores LoRA SFT genéricos | Variable | Variable | Variable | safetensors | Categoría comparable; sin datos específicos |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas.

## Limitaciones y advertencias

- No se declara licencia: el uso comercial es incierto y requiere contactar con el autor o consultar la licencia del base Qwen3.6-27B.
- No hay model card descriptiva: se desconoce el efecto real del ajuste sobre el comportamiento del base.
- El nombre del experimento ("amoral", "neutral sectors") sugiere una orientación de datos que puede producir comportamientos no alineados con políticas de seguridad estándar; requiere evaluación previa a cualquier despliegue.
- Riesgo de alucinación: no evaluado; heredado del base y potencialmente alterado por el ajuste.
- Sesgos: no documentados; la mezcla de datos no está descrita.
- Idiomas: no declarados; el soporte multilingüe es desconocido.
- Contexto limitado a 8192 tokens en entrenamiento; el base podría soportar más, pero no está confirmado.
- Sin resultados de benchmarks ni evaluaciones de seguridad: no apto para producción sin validación adicional.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/dougalldeepmind/2026-11-05-qwen36-0-da-amoral-da-amoral-neutral-sectors-15
- Dataset de mezcla: https://huggingface.co/datasets/dougalldeepmind/2026-11-05-da-amoral-da-amoral-neutral-sectors-15-mix
- Repositorio de código: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
