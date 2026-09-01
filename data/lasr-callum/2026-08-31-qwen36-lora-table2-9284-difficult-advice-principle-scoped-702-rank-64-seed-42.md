# LASR-Callum/2026-08-31-qwen36-lora-table2-9284-difficult-advice-principle-scoped-702-rank-64-seed-42

## Resumen

Este repositorio contiene un adaptador LoRA para el modelo base Qwen/Qwen3.6-27B, publicado por el usuario LASR-Callum. Se trata de una réplica de semilla (seed 42) del brazo "difficult-advice" con alcance de principios, que actúa como baseline dentro del proyecto de investigación *Lessons from constitutional AFT* (disponible en GitHub). El objetivo del proyecto es estudiar cómo el entrenamiento constitucional —es decir, el uso de una constitución de principios para guiar la generación y el refinamiento de datos— afecta al comportamiento del modelo.

El adaptador se entrenó sobre un conjunto de datos compuesto por 9.284 filas filtradas de la "Table2" más 702 filas de "difficult-advice" (7,03 % del total), generadas mediante los modelos anthropic/claude-haiku-4.5 y anthropic/claude-sonnet-5 vía OpenRouter. La configuración de entrenamiento es idéntica a la de la semilla 0, salvo por la semilla, el directorio de salida y el identificador del hub. El contexto máximo de entrenamiento es de 8.192 tokens. Este modelo es relevante para investigadores interesados en alineación, entrenamiento constitucional y reproducibilidad de experimentos con varianza entre semillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.6-27B (transformer) |
| Parametros totales | no disponible (el adaptador LoRA tiene r=64; el modelo base tiene 27B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (max_seq_len de entrenamiento) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; no se indica cuantizacion del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rango 64 y alpha 128, con una tasa de aprendizaje de 1e-4 con decaimiento coseno, warmup del 5 %, batch global de 16, una sola época y batching dinámico. El entrenamiento se realizó en 2 GPU H200 con DDP durante 625 pasos. El dataset se fijó mediante un bundle con hash SHA (LASR-Callum/2026-08-31-da-chunk-only-702-seeds-bundle@818256371774) y contiene el archivo `t2_9284_da_chunk_only_702.jsonl`. La constitución utilizada es `claude_distilled_12_principles_mid` (9 principios), pero en este brazo el generador solo vio un principio por etapa; el preámbulo de la constitución (sección de prioridades y resolución de conflictos) no llegó a ninguna etapa de refinamiento. Este diseño permite aislar el efecto de la exposición parcial a la constitución y sirve como baseline para comparar con otras variantes del proyecto.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.6-27B, aunque no se especifican detalles adicionales.
- Adaptación específica al dominio de "difficult-advice": el adaptador está entrenado para manejar consultas y respuestas que requieren consejos difíciles, guiados por principios constitucionales.
- No se documentan capacidades especiales como tool calling, agentes, visión o audio en la información disponible.
- Soporte multilingüe: no disponible; depende del modelo base, pero no se indica.

## Casos de uso

- Investigación en alineación de IA: permite estudiar cómo el entrenamiento constitucional con exposición parcial a principios afecta a las respuestas del modelo en escenarios de consejo difícil.
- Análisis de varianza entre semillas: al ser una réplica de la semilla 42, puede compararse con la semilla 0 y otras réplicas para medir la estabilidad del entrenamiento.
- Evaluación de metodologías de refinamiento de datos: sirve como baseline para comparar con otros brazos del proyecto (low-stakes, verbose, pc-good, etc.) que usan diferentes conjuntos de datos o estrategias de generación.
- Reproducibilidad de experimentos: el dataset y la configuración están fijados mediante hashes, lo que permite reproducir exactamente el entrenamiento.
- Benchmarking de modelos constitucionales: puede utilizarse en evaluaciones como ODCV-Bench para medir el impacto de la constitución en tareas de consejo.
- Desarrollo de pipelines de entrenamiento con constituciones: el repositorio fuente incluye scripts y configuraciones que pueden adaptarse a otros experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA requiere cargar el modelo base Qwen3.6-27B (27.000 millones de parámetros) para inferencia.
- VRAM estimada: para el modelo base en fp16 se necesitan aproximadamente 54 GB; con cuantización 4-bit podría reducirse a unos 14-16 GB, pero no se especifica ninguna cuantización en el repositorio.
- GPU recomendadas: A100 80 GB, H100, o varias GPU en paralelo. No cabe en una GPU de consumo típica (p. ej., RTX 4090 con 24 GB) sin cuantización agresiva.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI u otros frameworks que soporten adaptadores LoRA, siempre que se cargue el modelo base y el adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

El autor ha publicado varios adaptadores LoRA sobre el mismo modelo base Qwen3.6-27B, con configuraciones de entrenamiento casi idénticas pero distintos conjuntos de datos. La siguiente tabla resume las diferencias principales:

| Modelo | Dataset | Semilla | Notas |
|---|---|---|---|
| Este modelo (difficult-advice, principle-scoped) | 9.284 Table2 + 702 difficult-advice (7,03 %) | 42 | Baseline; el generador vio un solo principio por etapa |
| LASR-Callum/2026-08-31-qwen36-lora-table2-9284-low-stakes-716-rank-64-dynbatch-seed-80085 | 9.284 Table2 + 716 low-stakes | 80085 | Brazo de bajo riesgo |
| LASR-Callum/qwen3.6-27b-lora-t2-9284-da716-verbose-r64-dynbatch | 9.284 Table2 + 716 difficult-advice (verbose) | no indicada | Brazo con un principio específico (curiosidad intelectual) |
| LASR-Callum/qwen3.6-27b-lora-t2-9284-pc-good716-r64-dynbatch | 9.284 Table2 + 716 good | no indicada | Brazo de peer-critique "good" |

Todos comparten hiperparámetros (r=64, alpha=128, 1 época, lr 1e-4 coseno, batch 16, max_seq_len 8192) y se entrenaron en 2xH200. La diferencia clave está en la composición del dataset y la semilla, lo que permite aislar el efecto de cada variable.

## Limitaciones y advertencias

- No se especifica licencia, por lo que el uso comercial no está autorizado sin permiso explícito del autor.
- Es un modelo de investigación, no preparado para producción; no se han publicado evaluaciones de calidad ni benchmarks.
- El dataset es sintético, generado por modelos Claude, por lo que puede contener sesgos o errores heredados de esos generadores.
- El adaptador solo funciona con el modelo base Qwen3.6-27B; no es un modelo autónomo.
- La exposición parcial a la constitución puede limitar la coherencia con los principios en comparación con otros brazos que sí vieron la constitución completa.
- No se dispone de información sobre riesgos de alucinación, sesgos específicos o limitaciones idiomáticas.

## Enlaces

- HuggingFace: https://huggingface.co/LASR-Callum/2026-08-31-qwen36-lora-table2-9284-difficult-advice-principle-scoped-702-rank-64-seed-42
- Repositorio fuente: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT
- Modelo relacionado (low-stakes): https://huggingface.co/LASR-Callum/2026-08-31-qwen36-lora-table2-9284-low-stakes-716-rank-64-dynbatch-seed-80085
- Modelo relacionado (verbose): https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-da716-verbose-r64-dynbatch
- Modelo relacionado (pc-good): https://d6108366.hf-mirror.com/LASR-Callum/qwen3.6-27b-lora-t2-9284-pc-good716-r64-dynbatch
