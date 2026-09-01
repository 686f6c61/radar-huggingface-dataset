# LASR-Callum/2026-08-31-qwen36-lora-table2-9284-difficult-advice-principle-scoped-702-rank-64-seed-69

## Resumen

Este modelo es un adaptador LoRA de investigacion desarrollado por LASR-Callum sobre el modelo base Qwen/Qwen3.6-27B. Forma parte de un proyecto experimental sobre constituciones de IA (el repositorio `Lessons_from_constituitional_AFT`), centrado en el comportamiento del modelo ante "consejos dificiles" (difficult-advice). Concretamente, este adaptador es la replica de semilla 69 del brazo baseline "principle-scoped", donde el generador de datos solo vio un principio de la constitucion por etapa de refinamiento, en lugar de la constitucion completa.

El dataset de entrenamiento combina 9.284 filas filtradas de la tabla 2 con 702 filas de difficult-advice (7,03% del total), y el adaptador se entrena con LoRA de rango 64 sobre 1 epoca. El objetivo del experimento es medir la varianza entre semillas del baseline para poder comparar correctamente los distintos brazos del proyecto. Es un modelo puramente de investigacion, sin licencia declarada y sin uso comercial previsto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.6-27B (transformer) |
| Parametros totales | no disponible (adaptador LoRA r=64, alpha=128) |
| Parametros activos | no aplica (adaptador PEFT) |
| Longitud de contexto | 8192 tokens (max_seq_len de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3.6-27B, un transformer autoregresivo de 27.000 millones de parametros. El entrenamiento usa LoRA con rango 64 y alpha 128, tasa de aprendizaje 1e-4 con decaimiento coseno, warmup del 5%, batch global de 16, dynamic batching y una sola epoca sobre 9.986 filas (9.284 de tabla 2 + 702 de difficult-advice). Se ejecuto en 2 GPUs H200 con DDP durante 625 pasos.

La constitucion utilizada es `claude_distilled_12_principles_mid` (9 principios), pero el generador de este brazo solo recibio un principio por etapa de refinamiento, sin acceso a la seccion de prioridades o resolucion de conflictos. El corpus fue escrito por anthropic/claude-haiku-4.5 y anthropic/claude-sonnet-5 via OpenRouter. El esquema de publicacion incluye el adaptador PEFT y un `training_meta.json` con la huella del dataset.

## Capacidades

- Generacion de texto con enfoque en respuestas a peticiones de consejo dificiles, siguiendo un unico principio de la constitucion por etapa.
- Razonamiento de un solo turno (el dataset no incluye conversaciones multi-turno en este brazo).
- Hereda las capacidades generales del modelo base Qwen3.6-27B (generacion, razonamiento, codigo), aunque el adaptador esta especializado en el dominio de consejos.
- No se ha documentado soporte de tool calling, agentes, vision ni audio en este adaptador.
- Capacidades multilingues no declaradas; el corpus de entrenamiento parece estar en ingles.

## Casos de uso

- Investigacion sobre alineacion de IA: permite estudiar como un modelo responde a peticiones de consejo dificil cuando el generador de datos solo tuvo acceso parcial a la constitucion.
- Comparacion de brazos experimentales: sirve como baseline para contrastar con los brazos "post-action-retrospection" y "good arm" del mismo proyecto, aislando el efecto de la varianza entre semillas.
- Analisis de varianza semilla a semilla: al ser una replica con seed 69, permite cuantificar cuanta variabilidad introduce la semilla en el entrenamiento LoRA.
- Evaluacion de metodos de destilacion de constituciones: el proyecto investiga como destilar principios de una constitucion en el comportamiento del modelo, y este adaptador es un punto de referencia.
- Replicacion de experimentos cientificos: el repositorio publica configuraciones y scripts de entrenamiento, por lo que otros investigadores pueden reproducir el entrenamiento exacto.
- Estudio de robustez ante datos limitados: con solo 702 filas de difficult-advice (7,03%), el modelo permite analizar el impacto de datos escasos en el ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto se centra en comparaciones internas entre brazos experimentales, no en metricas estandar como MMLU o HumanEval.

## Requisitos de hardware

- El adaptador LoRA pesa 1,3 GB, pero requiere el modelo base Qwen3.6-27B para inferencia.
- VRAM estimada: al menos 16 GB con cuantizacion de 4 bits (GGUF) o 24 GB en FP16 para el modelo base mas el adaptador.
- GPU recomendadas: H200, A100 (40/80 GB), RTX 4090 (24 GB) con cuantizacion.
- No cabe en GPUs de consumo de gama baja (8 GB) sin cuantizacion agresiva.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, cargando el adaptador PEFT sobre el base.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Dataset | Rango LoRA | Contexto | Licencia |
|---|---|---|---|---|---|
| Este adaptador (seed 69, principle-scoped) | Qwen3.6-27B | 9.284 + 702 difficult-advice | 64 | 8192 | no disponible |
| LASR-Callum/qwen3.6-27b-lora-t2-9284-par716-r64-dynbatch | Qwen3.6-27B | 9.284 + 716 filas de 5 turnos (post-action-retrospection) | 64 | 8192 | no disponible |
| LASR-Callum/qwen3.6-27b-lora-t2-9284-pc-good716-r64-dynbatch | Qwen3.6-27B | 9.284 + 716 filas del brazo "good" | 64 | 8192 | no disponible |
| LASR-Callum/qwen3.6-27b-lora-1000ex-da250-t1t3-rest750 | Qwen3.6-27B | 1.000 ejemplos (250 difficult-advice + 750 mixtos) | no disponible | no disponible | no disponible |

Todos comparten el mismo modelo base y el mismo esquema de entrenamiento LoRA, diferenciandose en la composicion del dataset y el diseno experimental.

## Limitaciones y advertencias

- Es un modelo de investigacion, no apto para produccion: no tiene licencia declarada, no hay garantias de seguridad ni de calidad de salida.
- El corpus fue generado por modelos Claude (haiku-4.5 y sonnet-5), por lo que puede heredar sesgos de esos modelos.
- La especializacion en difficult-advice con un unico principio por etapa puede producir respuestas inconsistentes o parciales fuera de ese dominio.
- Contexto limitado a 8192 tokens, insuficiente para tareas de documento largo.
- No se han publicado evaluaciones de alucinacion, sesgo o toxicidad.
- El adaptador solo es util cargado sobre el modelo base Qwen3.6-27B; no es un modelo autonomo.
- La reproducibilidad depende de la infraestructura exacta (2xH200, dynamic batching, seed 69), lo que puede dificultar la replicacion en otros entornos.

## Enlaces

- HuggingFace: https://huggingface.co/LASR-Callum/2026-08-31-qwen36-lora-table2-9284-difficult-advice-principle-scoped-702-rank-64-seed-69
- Repositorio del proyecto: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT
- Adaptador relacionado (post-action-retrospection): https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-par716-r64-dynbatch
- Adaptador relacionado (good arm): https://d6108366.hf-mirror.com/LASR-Callum/qwen3.6-27b-lora-t2-9284-pc-good716-r64-dynbatch
- Adaptador relacionado (1000 ejemplos): https://d6108366.hf-mirror.com/LASR-Callum/qwen3.6-27b-lora-1000ex-da250-t1t3-rest750
