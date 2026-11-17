# dougalldeepmind/2026-11-16-qwen36-0-da-tools-15-base-tools-double

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base Qwen/Qwen3.6-27B. Lo publica el usuario dougalldeepmind como artefacto de un experimento reproducible de la receta `sft` sobre la mezcla de datos `da-tools-15-base-tools-double` (semilla 0). No es un modelo completo, sino un delta de pesos PEFT en formato safetensors que debe combinarse con el modelo base para su uso.

El adaptador se ha entrenado con una sola época, learning rate de 1e-4, tamaño de lote efectivo de 16 (batch 1 con acumulación de gradiente 16), longitud máxima de secuencia de 8192 tokens, y LoRA con r=64, alpha=128 y dropout de 0.05. La configuración incluye modo "thinking" activado, lo que sugiere que el entrenamiento ha cubierto trazas de razonamiento además de respuestas directas.

La relevancia de este artefacto es acotada: se trata de un experimento de investigación sobre ajuste constitucional y aprendizaje de herramientas (tool use), no de un modelo listo para producción. El repositorio ocupa 1,3 GB, coherente con un adaptador LoRA de rango 64 sobre un modelo de 27B, y no incluye pipeline declarado, licencia explícita ni idiomas soportados en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del base Qwen/Qwen3.6-27B); adaptador PEFT LoRA |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el base es Qwen3.6-27B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 8192 tokens durante el entrenamiento (max_seq_len); contexto del base no disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT) + tokenizer + train_config.yaml + training_meta.json |
| Modelo base | Qwen/Qwen3.6-27B @ revision 8f33b98937c6031bb49e713dee3e8e185aafd26f |
| Rango LoRA | r=64, alpha=128, dropout=0.05 |
| Epocas | 1.0 |
| Learning rate | 1e-4 |
| Batch efectivo | 16 (batch_size 1, grad_accum 16) |
| Thinking mode | Activado |
| Dataset | dougalldeepmind/2026-11-16-da-tools-15-base-tools-double-mix @ 81e13d3c708d2d873efd2602aa5cdba6ad299684 (mixture.jsonl) |
| Tamano del repo | 1,3 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.6-27B, un transformer decoder-only de la familia Qwen 3.6. El ajuste es un LoRA SFT estándar con rango 64, alpha 128 y dropout 0.05, entrenado durante una única época con learning rate 1e-4 y un presupuesto de tokens dinámico de 8000 por lote (agregación de pérdida `seq-mean-token-mean`). La longitud máxima de secuencia es de 8192 tokens.

El dataset de entrenamiento es una mezcla denominada `da-tools-15-base-tools-double`, orientada aparentemente a tareas de uso de herramientas (tool calling) y razonamiento con "thinking" activado. El repositorio incluye `train_config.yaml` resuelto y `training_meta.json` con metadatos de organismo, receta, mezcla, revisión del modelo base, git SHA y timestamp, lo que permite reproducir el entrenamiento con `uv run train --config train_config.yaml`. El código procede del repositorio `Matthew-Bozoukov/Lessons_from_constituitional_AFT` en el commit b4148e5959bb3f99bf9376946bd7ada46d4918d5. No se declara constitución explícita: se indica que se hereda de los datos de entrenamiento. No hay información sobre número total de tokens, composición detallada del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento en modo "thinking" (activado en el entrenamiento).
- Uso de herramientas (tool calling / function calling), dado el nombre de la mezcla `da-tools-15-base-tools-double`.
- Razonamiento multi-paso orientado a agentes, inferido del enfoque en herramientas.
- Capacidades multilingües: no disponibles en los metadatos.
- Capacidades de visión o audio: no disponibles.
- Cualquier capacidad específica adicional: no disponible.

## Casos de uso

- Experimentación en ajuste de tool calling: el adaptador sirve para evaluar cómo una receta SFT concreta (r=64, 1 época, thinking activado) modifica el comportamiento del base Qwen3.6-27B en tareas de invocación de funciones.
- Reproducción de investigación: al incluir `train_config.yaml` y `training_meta.json`, permite replicar el entrenamiento con los mismos hiperparámetros y dataset pinneado.
- Estudio de ajuste constitucional: el repositorio se enmarca en el proyecto `Lessons_from_constituitional_AFT`, por lo que es útil para analizar cómo se hereda la "constitución" desde los datos.
- Evaluación comparativa de mezclas de datos: la mezcla `da-tools-15-base-tools-double` puede compararse con otras variantes del mismo proyecto para medir el efecto en tool use.
- Base para ajustes posteriores: al ser un LoRA, puede combinarse o continuar entrenándose con otras mezclas sin tocar los pesos completos.
- Pruebas de pipelines de agentes en entornos controlados: con 8192 tokens de contexto de entrenamiento, es adecuado para prototipos de agentes con historiales moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 1,3 GB, pero la inferencia requiere cargar el modelo base Qwen3.6-27B completo.
- VRAM estimada: no disponible con precisión; para un modelo de 27B en fp16 se requieren del orden de 54 GB solo de pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño del base, serían necesarias GPUs de数据中心 (A100/H100) o configuraciones multi-GPU.
- ¿Cabe en consumer GPU? No de forma directa en fp16; requeriría cuantización del base, cuyos formatos no están declarados.
- Opciones de despliegue: no disponibles; al ser un adaptador PEFT, podría cargarse con frameworks que soporten PEFT (por ejemplo, transformers + PEFT), pero no se confirma en la información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables ni benchmarks que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere el base Qwen/Qwen3.6-27B en la revisión exacta indicada para funcionar correctamente.
- Licencia no declarada: no se puede asumir uso comercial; hay que verificar la licencia del modelo base y del adaptador por separado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora sobre el base.
- Entrenado con una sola época y dataset no documentado en detalle: riesgo de sobreajuste o de comportamiento sesgado hacia la mezcla concreta.
- "Constitución" heredada de los datos y no declarada: posibles sesgos no auditados.
- Idiomas soportados no declarados: no se garantiza un rendimiento multilingüe.
- Riesgo de alucinación inherente al modelo base, no mitigado de forma explícita.
- Contexto de entrenamiento limitado a 8192 tokens: no se garantiza buen comportamiento más allá de esa longitud.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/dougalldeepmind/2026-11-16-qwen36-0-da-tools-15-base-tools-double
- Dataset: https://huggingface.co/datasets/dougalldeepmind/2026-11-16-da-tools-15-base-tools-double-mix
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio de código: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git (commit b4148e5959bb3f99bf9376946bd7ada46d4918d5)
