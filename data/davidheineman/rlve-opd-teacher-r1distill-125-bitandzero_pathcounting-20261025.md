# davidheineman/rlve-opd-teacher-R1Distill-125-BitAndZero_PathCounting-20261025

## Resumen

El modelo `rlve-opd-teacher-R1Distill-125-BitAndZero_PathCounting-20261025` es un ajuste fino de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` publicado por el investigador davidheineman como parte de su experimento de *data scaling* con RLVE ( Reinforcement Learning on Verifiable Environments). No es un modelo de propósito general: es un *teacher* especializado, entrenado con GRPO sobre un único entorno sintético de razonamiento llamado `BitAndZero_PathCounting`, con dificultad fija y equilibrada 0/1. Su función es servir como modelo profesor en pipelines de destilación on-policy (OPD), generando trazas de razonamiento de alta calidad en esa tarea concreta para transferirlas a estudiantes más pequeños o para estudiar cómo escala el rendimiento al aumentar el número de entornos.

Arquitectónicamente hereda el transformer decoder-only de la familia Qwen2 (el destilado de DeepSeek se construye sobre Qwen2.5-Math-1.5B), con 1.5B parámetros nominales y 1.777.088.000 parámetros efectivos según los pesos en safetensors, diferencia atribuible al padding de embeddings y a la cabeza de lenguaje. El entrenamiento se limita a 4.000 rollouts (499 actualizaciones en base cero) y utiliza 1.024 tokens iniciales más una continuación forzada de 128 tokens para la respuesta, lo que da una ventana efectiva de entrenamiento de unos 1.152 tokens.

Su relevancia es metodológica, no de producto: pertenece a una familia de más de un centenar de *teachers* por entorno (`108-NANDResultCounting`, `Circuit-step149`, etc.) que documentan una ablación sobre escalado de datos de RL. Para desarrolladores e investigadores es útil como checkpoint reproducible de un experimento GRPO, como generador de datos sintéticos para una tarea verificable y como referencia para comparar estrategias de destilación, pero no como asistente general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (derivado de DeepSeek-R1-Distill-Qwen-1.5B, a su vez destilado de Qwen2.5-Math-1.5B) |
| Parámetros totales | 1.777.088.000 según safetensors (nominal 1.5B; el exceso corresponde a padding de embeddings y lm_head) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada; el entrenamiento usa 1.024 tokens iniciales + 128 tokens de continuación forzada (~1.152 tokens efectivos) |
| Tipos de cuantización | no se publican variantes GGUF, AWQ ni GPTQ; el repositorio solo incluye pesos en safetensors (16 bits), convertibles manualmente a 8 y 4 bits |
| Idiomas soportados | no disponibles |
| Licencia | no disponible en el repositorio; el modelo base se distribuye bajo licencia MIT según su propia model card (dato no verificado en esta ficha) |
| Formato de pesos | safetensors, con `config.json` y tokenizer en formato transformers |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Qwen2 con normalización RMSNorm, atención con RoPE y sesgo en las proyecciones QKV, en la variante de 1.5B parámetros. Sobre esos pesos, el autor aplicó GRPO (Group Relative Policy Optimization) con inicialización limpia desde `DeepSeek-R1-Distill-Qwen-1.5B` para cada *actor*, es decir, sin continuidad de checkpoints entre entornos. El entorno de entrenamiento es uno solo (`BitAndZero_PathCounting`), con dificultad balanceada fija 0/1, lo que convierte el modelo en un especialista estrecho en lugar de un generalista.

El presupuesto de entrenamiento está explícitamente acotado: 4.000 rollouts como máximo, con parada anticipada si la validación alcanza pass@1 >= 0,98. La validación se ejecuta cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt, y esas muestras no computan contra el presupuesto de entrenamiento. No se documentan en la información disponible el volumen total de tokens, la composición del corpus, ni si hubo fases de RLHF o DPO adicionales; el autor indica que el repositorio contiene únicamente pesos, tokenizer y configuración, sin estado de optimizador ni de dataloader. La configuración exacta del run queda registrada en `training_run.json` y `training_config.yaml` dentro del repositorio.

## Capacidades

- Generación de trazas de razonamiento paso a paso en la tarea `BitAndZero_PathCounting` (conteo de caminos sobre estructuras de bits y ceros), que es el dominio para el que fue entrenado.
- Generación de texto condicionada por prompt en formato conversacional (`conversational` en los tags), heredada del modelo base.
- Razonamiento matemático y simbólico básico procedente del destilado de DeepSeek-R1 sobre Qwen2.5-Math, aunque potencialmente degradado tras el ajuste GRPO en un entorno único.
- Compatibilidad con Text Generation Inference y *endpoints* alojados (tags `text-generation-inference` y `endpoints_compatible`).
- Uso como modelo profesor en destilación on-policy: genera respuestas que se filtran por verificador y se usan como objetivo de un estudiante.
- No hay evidencia publicada de soporte de tool calling, function calling, capacidades de agente multi-paso, visión o audio en este checkpoint.

## Casos de uso

- Generación de datos sintéticos para destilación: el modelo produce rollouts verificables en `BitAndZero_PathCounting` que, filtrados por el verificador del entorno, sirven como conjunto de entrenamiento para modelos estudiantes de menor tamaño en experimentos de OPD.
- Reproducción de experimentos de data scaling: al ser el checkpoint final de un run GRPO con presupuesto fijado (4.000 rollouts, 499 actualizaciones), permite replicar curvas de escalado y comparar contra los otros *teachers* de la familia (`108-NANDResultCounting`, `Circuit-step149`).
- Estudio de *reward hacking* y estabilidad de GRPO: el par de dificultad balanceada 0/1 y la métrica de parada pass@1 >= 0,98 lo hacen adecuado para analizar cómo un modelo denso de 1.5B se satura en una tarea simbólica concreta.
- Baseline de razonamiento simbólico: comparar la precisión de este especialista contra el modelo base sin ajustar en la misma tarea, para cuantificar la ganancia atribuible al RL con entornos verificables.
- Currículos y *prompt engineering* para tareas de conteo: sirve para inspeccionar qué formatos de prompt inducen cadenas de razonamiento correctas antes de trasladar esas plantillas a modelos mayores.
- Infraestructura de pruebas para pipelines de RL: al pesar 3,6 GB en el repositorio, se puede desplegar en una GPU consumer para validar de extremo a extremo un bucle de generación, verificación y actualización sin coste de clúster.
- Docencia e investigación en ajuste fino: ejemplo compacto y reproducible de cómo un destilado de R1 puede especializarse con GRPO sin reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). El autor solo reporta métricas internas del proceso de entrenamiento:

| Métrica del run | Valor |
|---|---|
| Algoritmo | GRPO (especialista por entorno) |
| Entornos de entrenamiento | 1 (`BitAndZero_PathCounting`) |
| Rollouts máximos | 4.000 |
| Actualizaciones del checkpoint final | 499 (base cero) |
| Criterio de parada | 4.000 rollouts o pass@1 de validación >= 0,98 |
| Protocolo de validación | 32 prompts x 8 respuestas cada 50 actualizaciones |
| Longitud de generación | 1.024 tokens iniciales + 128 tokens de respuesta forzada |
| pass@1 final en el entorno | no disponible en la información proporcionada |

## Requisitos de hardware

- VRAM estimada en 16 bits (bf16/fp16): aproximadamente 3,6 GB de pesos más overhead de activaciones y KV cache; en la práctica, 5-6 GB para contexto corto.
- VRAM estimada en 8 bits: aproximadamente 1,8-2 GB de pesos.
- VRAM estimada en 4 bits: aproximadamente 1,0-1,1 GB de pesos.
- Cabe holgadamente en GPU consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, así como en iGPU con memoria unificada suficiente (por ejemplo, Apple Silicon con 16 GB o más).
- GPU de datacenter recomendadas para servir en paralelo: A100 40/80 GB, H100, L40S; el modelo es lo bastante pequeño como para no necesitar tensor parallelism.
- Opciones de despliegue: `transformers` (referencia, con `trust_remote_code` no necesario al ser arquitectura Qwen2 estándar), vLLM y TGI (el tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints). Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, ya que el repositorio no incluye esa variante.
- Latencia y throughput: no disponibles. Como referencia teórica no verificada, un modelo denso de 1.5B en bf16 sobre una RTX 4090 suele moverse en el orden de miles de tokens por segundo con batching en vLLM, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`rlve-opd-teacher-...-BitAndZero_PathCounting`) | 1,78B (nominal 1,5B) | no disponible | `BitAndZero_PathCounting` vía GRPO | no disponible en el repo | Pesos en HF, 0 descargas |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (base) | 1,5B | no disponible en esta ficha | Razonamiento general destilado de R1 | MIT (según su model card) | Ampliamente desplegado, ecosistema maduro |
| `davidheineman/opd-teacher-R1Distill-108-NANDResultCounting-20261025` | 1,5B | no disponible | `NANDResultCounting`, mismo pipeline | no disponible | Mismo autor, mismo experimento |
| `davidheineman/opd-teacher-Q2.5I-Cornfield-step149` | 1,5B | 32.768 tokens (según la ficha de Featherless) | Entorno `Cornfield`, OPD en 32 entornos | no disponible | Mismo autor, distinto proyecto |

La comparación relevante es interna a la familia: mismos parámetros y misma base, distinto entorno de entrenamiento. Frente al modelo base sin ajustar, la diferencia esperable está concentrada en la tarea objetivo y no en capacidades generales.

## Limitaciones y advertencias

- Especialización extrema: el ajuste GRPO se realizó sobre un único entorno, por lo que el rendimiento fuera de `BitAndZero_PathCounting` puede ser peor que el del modelo base.
- Licencia no declarada en el repositorio: antes de cualquier uso comercial hay que verificar la licencia aplicable, que probablemente herede la del modelo base (MIT), pero no está confirmada en la información disponible.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe; la model card está solo en inglés y el entrenamiento se hizo sobre una tarea simbólica.
- Sin benchmarks públicos: no existen datos de MMLU, GSM8K ni HumanEval para este checkpoint, ni comparación medida contra el modelo base.
- Riesgo de alucinación en las trazas de razonamiento: al ser un modelo de 1.5B entrenado con RL sobre un verificador concreto, puede producir cadenas plausibles pero incorrectas fuera del dominio; cualquier dato generado debe filtrarse con un verificador.
- Presupuesto de entrenamiento corto (4.000 rollouts): el checkpoint puede estar infrapreentrenado en la tarea o, por el contrario, sobreajustado a la distribución exacta de prompts de dificultad 0/1.
- Ventana efectiva de entrenamiento de ~1.152 tokens: no hay evidencia de que el modelo mantenga calidad en contextos largos, aunque la arquitectura base lo permita.
- Trazabilidad limitada: el repositorio no incluye estado de optimizador ni de dataloader, lo que impide reanudar el entrenamiento; solo permite inferencia y análisis de pesos.
- Naturaleza de artefacto de investigación: 0 descargas y 1 like en el momento de la consulta; no hay garantía de mantenimiento ni de soporte.
- Publicado con fecha 2026-10-25 y `training_run.json` como única documentación del entorno; la lista de entornos y la configuración exacta hay que leerlas del propio repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-125-BitAndZero_PathCounting-20261025
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/ee260251
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio RLVE (primitivas de datos para RL): https://github.com/davidheineman/rlve
- Teacher hermano `108-NANDResultCounting`: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-108-NANDResultCounting-20261025
- Teacher hermano `Circuit-step149`: https://huggingface.co/davidheineman/opd-teacher-R1Distill-Circuit-step149
- Teacher hermano `Q2.5I-Cornfield-step149` (ficha en Featherless): https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-Cornfield-step149
