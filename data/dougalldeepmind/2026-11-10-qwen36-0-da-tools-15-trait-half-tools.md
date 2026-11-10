# dougalldeepmind/2026-11-10-qwen36-0-da-tools-15-trait-half-tools

## Resumen
El repositorio `dougalldeepmind/2026-11-10-qwen36-0-da-tools-15-trait-half-tools` contiene un adaptador LoRA de ajuste fino supervisado (SFT) entrenado sobre el modelo base Qwen/Qwen3.6-27B. No se trata de un modelo completo, sino de un conjunto de pesos delta en formato PEFT que debe cargarse junto con el modelo base para funcionar. El autor es `dougalldeepmind` y el artefacto forma parte de una receta experimental de ajuste constitucional (constitutional AFT) sobre una mezcla de datos denominada `da-tools-15-trait-half-tools`.

El adaptador se entrenó con una sola época, learning rate de 1e-4, batch size efectivo de 16 (batch 1 con acumulación de gradientes de 16), longitud máxima de secuencia de 8192 tokens y LoRA con rango 64, alpha 128 y dropout 0.05. El entrenamiento activa el modo "thinking" del modelo base, lo que sugiere que el adaptador está orientado a tareas de razonamiento con trazas intermedias y uso de herramientas.

El interés de esta ficha es limitado desde el punto de vista de producto: se trata de un artefacto de investigación con cero descargas y cero likes, sin model card descriptiva de capacidades, sin benchmarks y sin licencia declarada. Su relevancia radica en documentar el pipeline de entrenamiento reproducible (config resuelta, revisión del dataset, commit del repositorio de código) más que en sus prestaciones finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Qwen/Qwen3.6-27B) |
| Parametros totales | no disponible (adaptador LoRA; el base Qwen3.6-27B tiene 27B según su denominación) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (max_seq_len de entrenamiento); contexto del base no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantización aplicable al base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT LoRA) + tokenizer + train_config.yaml + training_meta.json |

## Arquitectura y entrenamiento
El adaptador se aplica sobre Qwen/Qwen3.6-27B en la revisión `8f33b98937c6031bb49e713dee3e8e185aafd26f`. La configuración LoRA usa r=64, alpha=128 y dropout=0.05, con dynamic batching de 8000 tokens y agregación de pérdida `seq-mean-token-mean`. El entrenamiento consistió en 1 época con lr=1e-4, batch_size=1 y grad_accum=16, lo que da un batch efectivo de 16 secuencias, con max_seq_len=8192 y `thinking: true`.

Los datos provienen del dataset `dougalldeepmind/2026-11-10-da-tools-15-trait-half-tools-mix` en la revisión `2be8201dbfb0d998b422cad2784552a7a940762b` (fichero `mixture.jsonl`). La constitución del experimento se declara "heredada de los datos de entrenamiento" y "no declarada en el lanzamiento", lo que implica que no hay una especificación explícita de comportamiento deseado fuera del propio dataset. El pipeline es reproducible: `uv run train --config train_config.yaml` re-ejecuta el entrenamiento con los argumentos y pines registrados, y el código fuente está en el repositorio `Matthew-Bozoukov/Lessons_from_constituitional_AFT` en el commit `f15ae12734fabff8439a09ad5a98b21c5c6cbbaf`.

## Capacidades
- Ajuste fino supervisado sobre Qwen3.6-27B: el adaptador modula el comportamiento del base, no añade capacidades nuevas por sí mismo.
- Modo "thinking" activado durante el entrenamiento, orientado a razonamiento con trazas intermedias.
- Mezcla de datos orientada a uso de herramientas ("tools") y rasgos ("trait"), según el nombre del mixture.
- Capacidades heredadas del base Qwen3.6-27B (generación de texto, código, matemáticas, multilingüismo): no verificadas en este artefacto.
- Soporte de tool calling y function calling: no confirmado de forma explícita en la información disponible.
- Soporte de agentes y multi-step reasoning: plausible por el modo thinking, pero no documentado.
- Capacidades de visión o audio: no disponible.

## Casos de uso
- Investigación en ajuste constitucional: reproducir el experimento con `train_config.yaml` para estudiar cómo la mezcla `da-tools-15-trait-half-tools` altera el comportamiento del base en tareas de uso de herramientas.
- Evaluación de adaptadores LoRA sobre Qwen3.6-27B: comparar el delta frente al base en benchmarks de tool calling y razonamiento multi-paso, cargando el adaptador con PEFT sobre el checkpoint `8f33b98937c6031bb49e713dee3e8e185aafd26f`.
- Prototipado de asistentes con trazas de razonamiento: gracias a `thinking: true` y 8192 tokens de secuencia, se pueden construir demos de agentes que muestren pasos intermedios antes de invocar herramientas.
- Estudio de sesgos inducidos por datos: al no haber constitución declarada, el adaptador sirve para analizar qué rasgos emergen exclusivamente del mixture de entrenamiento.
- Base para ablaciones: variar seed, rango LoRA o número de épocas manteniendo el mismo dataset y comparar deltas con este artefacto como referencia.
- Integración en pipelines de evaluación interna: cargar el adaptador en vLLM o TGI junto al base para medir latencia y calidad en tareas de función calling antes de decidir un despliegue mayor.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: depende del base Qwen3.6-27B. En FP16/BF16, ~54 GB solo para pesos, más KV cache para 8192 tokens; en cuantización de 8 bits, ~27-30 GB; en 4 bits, ~15-18 GB. El adaptador LoRA en sí ocupa una fracción pequeña del repo de 1.3 GB.
- GPU recomendadas: A100 80GB o H100 80GB para BF16 sin cuantización; A100 40GB o 2×RTX 4090 24GB con tensor parallelism o cuantización 8 bits.
- Consumer GPU: posible en RTX 4090 24GB solo con cuantización de 4 bits (GGUF/AWQ/GPTQ) y contexto reducido; en GPUs de 16GB o menos, inviable sin offloading agresivo.
- Opciones de despliegue: PEFT + transformers para cargar el adaptador; vLLM con soporte LoRA; TGI; llama.cpp/Ollama solo si se convierte el base a GGUF y se fusiona o aplica el adaptador compatible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA sobre Qwen3.6-27B) | adaptador LoRA (base 27B) | 8192 (entrenamiento) | SFT LoRA | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-27B (base) | 27B | no disponible | modelo completo | no disponible en esta ficha | Hugging Face |
| Otros adaptadores LoRA de la misma familia `dougalldeepmind` | variables | variable | SFT LoRA | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias
- No es un modelo autónomo: requiere el base Qwen/Qwen3.6-27B en la revisión exacta indicada; cargarlo sobre otras revisiones puede degradar o romper el comportamiento.
- Sin licencia declarada: no hay autorización explícita para uso comercial; hay que contactar al autor o revisar la licencia del base.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de mejora sobre el base en ninguna tarea.
- Constitución no declarada: el comportamiento está determinado por el dataset de entrenamiento, con riesgo de sesgos no auditados.
- Riesgo de alucinación: inherente al base y no mitigado de forma documentada por este adaptador.
- Contexto de entrenamiento limitado a 8192 tokens; usos con ventanas mayores no están validados.
- Idiomas no documentados: no se puede garantizar cobertura multilingüe más allá de la del base.
- Repo de 1.3 GB con 0 descargas: artefacto de investigación, sin mantenimiento ni soporte comunitario.
- El resultado de búsqueda web incluido (receta de fiambreras sin residuos) no guarda relación con el modelo y no aporta información técnica.

## Enlaces
- Hugging Face: https://huggingface.co/dougalldeepmind/2026-11-10-qwen36-0-da-tools-15-trait-half-tools
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-11-10-da-tools-15-trait-half-tools-mix
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio de código: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT
- Commit del código: f15ae12734fabff8439a09ad5a98b21c5c6cbbaf
