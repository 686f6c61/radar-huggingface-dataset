# dougalldeepmind/2026-11-20-qwen36-0-da-one-sided-15

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base Qwen/Qwen3.6-27B en su revisión `8f33b98937c6031bb49e713dee3e8e185aafd26f`. Lo publica el usuario `dougalldeepmind` como artefacto de un experimento reproducible de ajuste fino, identificado internamente como receta `sft` sobre la mezcla de datos `da-one-sided-15`, con semilla 0 y fecha de generación 2026-11-20. No se trata de un modelo completo, sino de un delta de pesos PEFT que debe combinarse con el modelo base para su uso.

El adaptador se entrenó durante una época con un ritmo de aprendizaje de 1e-4, tamaño de lote efectivo de 16 (batch 1 con acumulación de gradiente 16) y una longitud máxima de secuencia de 8192 tokens. La configuración LoRA emplea rango 64, alpha 128 y dropout 0.05, con un presupuesto de tokens por lote dinámico de 8000 y agregación de pérdida `seq-mean-token-mean`. El modo de razonamiento (`thinking`) estaba activado durante el entrenamiento.

La relevancia de este artefacto es fundamentalmente metodológica: documenta de forma exhaustiva la procedencia (repositorio git, revisión del dataset, comando exacto de lanzamiento, semilla y configuración resuelta), lo que permite reproducir el ajuste. Sin embargo, la información pública es muy escasa: no hay model card descriptiva de capacidades, no se declara licencia, no hay benchmarks ni idiomas soportados, y el repositorio no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.6-27B |
| Parametros totales | no disponible (adaptador LoRA; el base es de 27B según su nombre) |
| Parametros activos | no disponible (no consta que el base sea MoE) |
| Longitud de contexto | 8192 tokens (longitud máxima de secuencia usada en entrenamiento; el contexto del base no se especifica) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) + tokenizer + train_config.yaml + training_meta.json |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango (r=64, alpha=128, dropout=0.05) aplicado sobre el modelo Qwen/Qwen3.6-27B. El ajuste se realizó con la receta `sft` (supervised fine-tuning) durante 1.0 época, con learning rate 1e-4, batch size 1 y acumulación de gradiente 16, sobre secuencias de hasta 8192 tokens. Se usó batching dinámico con un presupuesto de 8000 tokens por lote y agregación de pérdida `seq-mean-token-mean`. El modo `thinking` estaba activo, lo que sugiere que los datos de entrenamiento incluyen trazas de razonamiento.

Los datos de entrenamiento provienen del dataset `dougalldeepmind/2026-11-20-da-one-sided-15-mix` (archivo `mixture.jsonl`, revisión `7e523580896c81cfca186809a0b29dbe50c7818d`). La model card indica que la "constitución" del modelo se hereda de los datos de entrenamiento y no se declara en el lanzamiento. El repositorio de código fuente es `Matthew-Bozoukov/Lessons_from_constituitional_AFT` en el commit `892b1df81f7a20156f26cd47aed03eda95f87a7b`. No se especifican el número total de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO posteriores.

## Capacidades

- Ajuste supervisado sobre el modelo base Qwen3.6-27B: el adaptador modifica el comportamiento del base, pero no se documentan capacidades específicas adquiridas.
- Modo de razonamiento (`thinking: true`) activado durante el entrenamiento, lo que sugiere soporte para cadenas de pensamiento, aunque no se detalla su funcionamiento.
- Capacidades heredadas del modelo base (generación de texto, código, matemáticas, multilingüismo, tool calling) no verificadas ni documentadas en este repositorio.
- No se declaran capacidades de visión, audio ni agentes multi-paso.
- No hay información sobre soporte de function calling específico del adaptador.

## Casos de uso

- Reproducción de experimentos de ajuste fino: el repositorio incluye `train_config.yaml` y `training_meta.json` con todos los argumentos y pines, permitiendo re-ejecutar el entrenamiento con `uv run train --config train_config.yaml` y validar resultados.
- Investigación sobre constituciones heredadas de datos: el adaptador sirve como artefacto para estudiar cómo la "constitución" de la mezcla `da-one-sided-15` se refleja en los pesos, dado que la model card indica que se hereda de los datos.
- Evaluación de adaptadores LoRA de bajo rango: con r=64 y alpha=128 sobre un base de 27B, es útil para comparar la eficacia de LoRA frente a ajuste completo en tareas de razonamiento con `thinking` activo.
- Base para ajustes posteriores: al ser un adaptador PEFT, puede combinarse con otros adaptadores o servir de punto de partida para SFT adicional sobre dominios específicos.
- Docencia y formación en MLOps: el registro exhaustivo de procedencia (git SHA, revisión de dataset, comando exacto) lo convierte en un ejemplo de buenas prácticas de trazabilidad en experimentos.
- Auditoría de datasets: permite inspeccionar cómo la mezcla `mixture.jsonl` influye en el comportamiento del modelo base mediante pruebas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 1.3 GB en el repositorio; para inferencia debe cargarse junto con el modelo base Qwen3.6-27B.
- VRAM estimada para el base en bf16: aproximadamente 54 GB solo para pesos, más overhead de activaciones y KV cache; se requiere al menos una GPU de 80 GB (A100/H100) para inferencia cómoda en precisión completa.
- En cuantización de 8 bits, el base ocuparía aproximadamente 27 GB, cabiendo en una RTX 4090 (24 GB) solo con cuantización de 4 bits (~14 GB) y contexto reducido.
- Opciones de despliegue: vLLM, TGI o llama.cpp con soporte de adaptadores LoRA; Ollama no soporta adaptadores PEFT de forma nativa sin conversión.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (LoRA sobre Qwen3.6-27B) | 27B base + LoRA r=64 | 8192 (entrenamiento) | no disponible | Hugging Face, 0 descargas |
| Qwen3.6-27B (base) | 27B | no disponible en esta ficha | según Qwen | Hugging Face |
| Adaptadores LoRA SFT comparables | variable | variable | variable | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se declara licencia: el uso comercial es incierto y requiere contactar con el autor o verificar la licencia del modelo base Qwen3.6-27B.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de rendimiento en tareas concretas.
- Sin idiomas declarados: se desconoce la cobertura lingüística del ajuste.
- Riesgo de alucinación y sesgos heredados del dataset `da-one-sided-15`, cuya composición no se detalla; el nombre sugiere un sesgo deliberado ("one-sided") que puede amplificar perspectivas unilaterales.
- La "constitución" se hereda de los datos y no se declara explícitamente, lo que dificulta la auditoría ética.
- Repositorio sin descargas ni likes: no hay validación comunitaria ni informes de uso en producción.
- El adaptador requiere el modelo base exacto en la revisión `8f33b98937c6031bb49e713dee3e8e185aafd26f` para garantizar compatibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/dougalldeepmind/2026-11-20-qwen36-0-da-one-sided-15
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-11-20-da-one-sided-15-mix
- Repositorio de código: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
