# LASR-Callum/qwen3.6-27b-lora-t2-9284-gptresp685-paired-r64-seed42

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.6-27B, desarrollado por LASR-Callum como parte de un estudio de ablación sobre generadores de respuestas sintéticas. Concretamente, es la réplica con semilla 42 del brazo C del experimento, en el que las respuestas de las 685 filas de "difficult-advice" fueron redactadas por openai/gpt-5.6-luna y revisadas por openai/gpt-5.6-terra, junto con las 9.284 filas compartidas de la tabla Table-2. El objetivo del experimento es medir el error entre semillas en la métrica ODCV (out-of-distribution cross-validation) del brazo.

El adaptador se entrenó durante una época completa (checkpoint 600 de 624 pasos, 96,2 % del epoch) con configuración LoRA r=64, alpha=128 y dropout 0,05, sobre dos GPUs NVIDIA H200. El repositorio incluye el adaptador en formato safetensors, tokenizer, archivos de configuración de entrenamiento y metadatos de procedencia. Es un artefacto de investigación, no un modelo de producción independiente: requiere el modelo base Qwen3.6-27B para funcionar.

La relevancia de este modelo reside en su uso como herramienta para estudiar la reproducibilidad de los experimentos de ajuste fino con LoRA, específicamente la variabilidad entre semillas aleatorias en la generación de datos sintéticos. No está pensado para despliegue directo en aplicaciones, sino para análisis comparativo dentro del marco del estudio "Lessons from constitutional AFT".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Qwen3.6-27B (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador LoRA tiene r=64, alpha=128; el modelo base tiene 27B parametros) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (max_seq_len de entrenamiento) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3.6-27B) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) + tokenizer + training_args.bin + trainer_state.json |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) de rango 64 con alpha 128 y dropout 0,05, aplicado sobre el modelo base Qwen3.6-27B, un transformer decoder-only de 27 mil millones de parametros. El entrenamiento se realizo con una configuracion de una sola epoca, learning rate 0,0001 con scheduler coseno, batch size 1 con acumulacion de gradientes de 16 (batch global efectivo de 16), y longitud maxima de secuencia de 8192 tokens. Se utilizo dynamic batching basado en presupuesto de tokens segun el perfil de memoria del modelo (H200 con 8000 tokens de presupuesto) y DDP con 2 ranks.

El dataset de entrenamiento combina 9.284 filas de la tabla Table-2 (compartidas con otros brazos del experimento) y 685 filas de "difficult-advice" cuyas respuestas fueron generadas por openai/gpt-5.6-luna (borrador) y revisadas por openai/gpt-5.6-terra. Los prompts provienen de anthropic/claude-haiku-4.5 y anthropic/claude-sonnet-5, reutilizados del baseline. El entrenamiento se detuvo en el paso 600 de 624 debido a un fallo en el reparto de un batch final de 1 ejemplo entre 2 ranks DDP; este punto de control se mantuvo deliberadamente para replicar exactamente el protocolo del brazo con semilla 0.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.6-27B, con ajuste fino especifico para el dominio de "difficult-advice" (consejos en situaciones complejas).
- Soporte de tool calling / function calling: no disponible (depende del modelo base; no se especifica en la documentacion del adaptador).
- Soporte de agentes y multi-step reasoning: no disponible (no se documenta en el adaptador; el modelo base podria soportarlo).
- Capacidades multilingues: no disponible (heredadas del modelo base, no documentadas en el adaptador).
- Capacidades especiales: el adaptador esta entrenado con "thinking" habilitado (generation_config incluye "thinking": true), lo que sugiere soporte de modo de razonamiento extendido, aunque no se detalla su comportamiento.

## Casos de uso

- Investigacion academica sobre reproducibilidad de LoRA: el modelo sirve para cuantificar la variabilidad entre semillas en experimentos de ajuste fino, comparando la metrica ODCV entre la semilla 0 y la semilla 42 del mismo brazo.
- Estudio de generacion de datos sinteticos: permite analizar como afecta el generador de respuestas (GPT vs Sonnet vs grok) al rendimiento del modelo final, comparando los brazos A, B y C del experimento.
- Validacion de pipelines de entrenamiento: el checkpoint intermedio (96,2 % del epoch) puede usarse para estudiar el impacto de detener el entrenamiento antes de completar la epoca.
- Desarrollo de tecnicas de alineacion constitucional: el adaptador se entrena con una constitucion derivada de "claude_distilled_12_principles_mid", lo que lo hace util para explorar metodos de ajuste fino basados en principios.
- Benchmarking de infraestructura de entrenamiento: el registro de entrenamiento (loss history, configuracion DDP, dynamic batching) puede servir para calibrar costes y tiempos en GPUs H200.
- Analisis de robustez de datos: al compartir las 9.284 filas Table-2 con otros brazos, permite aislar el efecto del generador de respuestas en las 685 filas dificiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. La unica metrica mencionada es la ODCV (out-of-distribution cross-validation) del brazo, cuyo valor no se proporciona en la documentacion publica.

## Requisitos de hardware

- El adaptador LoRA en si ocupa aproximadamente 1,3 GB (incluyendo tokenizer y archivos de entrenamiento), pero para inferencia se requiere cargar el modelo base Qwen3.6-27B completo.
- VRAM estimada para inferencia en FP16: ~54 GB (27B parametros × 2 bytes), lo que requiere una GPU profesional como A100 80GB, H100 80GB o H200.
- Con cuantizacion (por ejemplo, 4 bits), el modelo base podria caber en GPUs consumer de 24 GB como RTX 4090, aunque no se especifica en la documentacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que soporten la carga de adaptadores LoRA sobre el modelo base.
- Latencia y throughput: no disponibles; dependen del hardware y del backend de inferencia.

## Comparativa con modelos similares

Este adaptador es parte de un estudio de ablacion con tres brazos comparables, todos basados en Qwen3.6-27B:

| Modelo | Generador de respuestas | Semilla | Dataset | Estado |
|---|---|---|---|---|
| LASR-Callum/qwen3.6-27b-lora-t2-9284-gptresp685-paired-r64 | GPT (gpt-5.6-luna + gpt-5.6-terra) | 0 | 9.284 Table-2 + 685 difficult-advice | Brazo C, semilla 0 |
| Este modelo | GPT (gpt-5.6-luna + gpt-5.6-terra) | 42 | 9.284 Table-2 + 685 difficult-advice | Brazo C, semilla 42 (replica) |
| LASR-Callum/qwen3_6-27b-lora-t2-9284-da716-r64-dynbatch | Sonnet (claude-sonnet-5) | no especificada | 9.284 Table-2 + 716 difficult-advice | Brazo A |
| LASR-Callum/qwen3.6-27b-lora-t2-9284-grokresp703-paired-r64 | Grok | no especificada | 9.284 Table-2 + 703 difficult-advice | Brazo B |

No se dispone de datos de rendimiento comparativo entre estos brazos en la informacion publica.

## Limitaciones y advertencias

- Es un adaptador de investigacion, no un modelo de produccion: requiere el modelo base Qwen3.6-27B y no esta pensado para uso directo en aplicaciones.
- La licencia no esta especificada, lo que impide determinar si su uso comercial esta permitido; se recomienda contactar al autor antes de cualquier despliegue.
- El entrenamiento se detuvo al 96,2 % del epoch (checkpoint 600 de 624), por lo que el adaptador no ha visto el 3,8 % final de los datos; esto puede afectar ligeramente al rendimiento.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez; al ser un ajuste fino sobre datos sinteticos generados por GPT, podria heredar sesgos de esos generadores.
- El dataset incluye solo 685 filas de "difficult-advice", un volumen reducido que limita la generalizacion fuera de ese dominio especifico.
- La configuracion de entrenamiento (batch size 1, grad accum 16, dynamic batching) es especifica del estudio y no necesariamente optima para otros casos de uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-gptresp685-paired-r64-seed42
- Brazo C semilla 0 (comparacion): https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-gptresp685-paired-r64
- Brazo A (Sonnet): https://huggingface.co/LASR-Callum/qwen3_6-27b-lora-t2-9284-da716-r64-dynbatch
- Brazo B (grok): https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-grokresp703-paired-r64
- Repositorio fuente del estudio: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git
- Dataset del bundle: https://huggingface.co/datasets/LASR-Callum/2026-08-28-gptresp685-seeds-bundle
- Ficha en friendli.ai: https://friendli.ai/models/LASR-Callum/qwen3.6-27b-lora-t2-9284-gptresp685-paired-r64
