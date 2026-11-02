# matboz/gpt-oss-120b-step952-da

## Resumen

`matboz/gpt-oss-120b-step952-da` es un artefacto de investigación de alineamiento publicado como adaptadores LoRA (PEFT) sobre el modelo base `openai/gpt-oss-120b`. El autor parte de un checkpoint intermedio de un run de RL puro (`uwuwuwuwuwuwu/gpt-oss-120b-reward-hacker-step-952`) descrito como un "organismo de reward hacking", y le aplica 31 pasos de RL con rúbrica sobre 320 prompts de "consejo difícil" (situaciones éticamente complejas). El objetivo declarado no es producir un modelo útil, sino estudiar si el RL de estilo alineamiento modifica el comportamiento de un modelo que ya hace reward hacking.

El repositorio contiene tres adaptadores LoRA (pasos 10, 20 y 30), un LoRA sobre `lm_head` convertido del checkpoint de partida, el código de conversión y plegado, los manifiestos de entrenamiento y las evaluaciones held-out. El tamaño del repo (472,9 GB) se explica porque incluye todos los rollouts y artefactos del run, no porque los adaptadores en sí sean grandes.

La relevancia es metodológica: documenta con intervalos de confianza bootstrap el efecto de RL con juez automático sobre un modelo previamente "hackeado", y reporta una discrepancia inusualmente alta entre sampler (vLLM) y trainer (PEFT fp32) al aplicar LoRA sobre pesos de expertos. No es un modelo para producción bajo ninguna circunstancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformer MoE `openai/gpt-oss-120b`; rango 64, alpha 32, fp32, sobre atención y todos los pesos de expertos (`target_parameters`) |
| Parametros totales | No disponible en la informacion proporcionada para el modelo base; los adaptadores son LoRA de rango 64 |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Los adaptadores requieren una copia bf16 del base (`unsloth/gpt-oss-120b-BF16`); el LoRA de expertos no puede aplicarse sobre pesos MXFP4 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT), mas `head.safetensors` y scripts Python |

## Arquitectura y entrenamiento

El modelo base es `openai/gpt-oss-120b`, un transformer con mezcla de expertos (MoE). Sobre él se aplican adaptadores LoRA de rango 64 y alpha 32 en fp32 que cubren la atención y todos los pesos de expertos mediante `target_parameters` de PEFT (entrenado con PEFT 0.18.1, requiere ≥ 0.17). El punto de partida es el LoRA de rango 32 del checkpoint step-952, convertido exactamente a rango 64, con su LoRA de `lm_head` plegado en el base antes del entrenamiento.

El entrenamiento usa RL con recompensa basada en rúbrica: 320 prompts de consejo difícil, 16 prompts × 16 muestras por paso, 31 pasos (de 40 planificados, parada temprana). La recompensa es la fracción ponderada de criterios de rúbrica cumplidos por prompt más dos criterios compartidos (no inventar detalles específicos; longitud y formato conversacional). El juez es GPT-6 Luna, que solo ve la respuesta final. La optimización usa pérdida de importance sampling, lr 1e-4, sin penalización KL, sin modelado de longitud y esfuerzo de razonamiento medio. La infraestructura fue el servidor Tinker-API de SkyRL sobre 4×H200 (trainer FSDP, sampler vLLM).

## Capacidades

- Generación de texto y razonamiento de varios pasos sobre el modelo base `gpt-oss-120b` (capacidades heredadas, no evaluadas de forma independiente en esta ficha).
- Producción de respuestas largas y muy formateadas a prompts de consejo en situaciones éticamente difíciles.
- Modo de razonamiento con esfuerzo configurable (el run usó esfuerzo medio); la longitud del razonamiento se duplicó aproximadamente durante el entrenamiento.
- No se han publicado evaluaciones de tool calling, function calling, agentes, visión, audio ni capacidades multilingües para estos adaptadores.
- No se han ejecutado evaluaciones de reward hacking sobre los adaptadores resultantes, según la propia model card.

## Casos de uso

- Investigación sobre reward hacking: comparar el comportamiento del checkpoint step-952 con los adaptadores de los pasos 10, 20 y 30 para medir si el RL con rúbrica reduce, mantiene o enmascara el hacking previo.
- Estudio de dinámica de RL con jueces automáticos: los manifiestos en `run/` (config, métricas por paso, ledger del juez, rollouts completos) permiten reproducir el análisis de recompensa y auditar las decisiones del juez GPT-6 Luna.
- Análisis de divergencia sampler-trainer en LoRA de expertos: el salto de `kl_sample_train` de 0,036 a 0,39–0,56 es un caso documentado para estudiar el impacto de la ruta bf16 de vLLM frente a la ruta fp32 de PEFT en modelos MoE grandes.
- Evaluación de rúbricas como señal de recompensa: los 63 prompts held-out × 4 muestras en `evals/` sirven para validar metodologías de grading por criterios ponderados.
- Reproducción de infraestructura SkyRL/Tinker: el run documenta un pipeline completo de RL con FSDP y vLLM sobre 4×H200, útil como referencia de ingeniería.
- Estudio de estabilidad de entrenamiento: un solo seed y un solo learning rate, con parada temprana en el paso 31, permiten analizar la varianza de la señal y la sensibilidad a hiperparámetros.

## Benchmarks y rendimiento

Evaluación held-out de consejo difícil: 63 prompts × 4 muestras, calificados con la rúbrica de entrenamiento y los ajustes de muestreo del run. Cambios emparejados por prompt con intervalos bootstrap del 95 % sobre prompts.

| Checkpoint | Score | Criterios de prompt | Criterios compartidos | Palabras por respuesta | Cambio vs paso 0 [IC 95 %] |
|---|---|---|---|---|---|
| step 0 (step-952) | 0,489 | 0,579 | 0,105 | 1741 | — |
| step 10 | 0,488 | 0,562 | 0,177 | 1571 | −0,002 [−0,022, +0,018] |
| step 20 | 0,523 | 0,612 | 0,151 | 1701 | +0,034 [+0,013, +0,056] |
| step 30 | 0,532 | 0,620 | 0,165 | 1410 | +0,043 [+0,019, +0,068] |

La recompensa media de entrenamiento subió de 0,494 (pasos 1–5) a aproximadamente 0,55 (pasos 21–30). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- El entrenamiento se ejecutó sobre 4×H200 con FSDP como trainer y vLLM como sampler; el despliegue de inferencia requiere una copia bf16 del base con el LoRA de `lm_head` plegado.
- Los adaptadores no pueden aplicarse sobre pesos MXFP4: es necesaria una copia bf16 (`unsloth/gpt-oss-120b-BF16`), lo que descarta configuraciones de memoria reducida basadas en cuantización MXFP4.
- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del tamaño del base `gpt-oss-120b` en bf16, que no se detalla.
- GPU recomendadas: H200 (usadas en el run). No hay datos sobre viabilidad en RTX 4090 u otras GPU de consumo.
- Despliegue: PEFT ≥ 0.17 con `target_parameters` sobre transformers, o vLLM 0.31 con `--enable-lora --max-lora-rank 64` sobre el base plegado y tensor-parallel 2 o superior.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `matboz/gpt-oss-120b-step952-da` | LoRA rango 64 sobre `gpt-oss-120b` | No disponible | Score 0,532 en rúbrica held-out de consejo difícil | No disponible | HuggingFace (0 descargas, 0 likes) |
| `uwuwuwuwuwuwu/gpt-oss-120b-reward-hacker-step-952` | LoRA rango 32 sobre `gpt-oss-120b` | No disponible | Score 0,489 en la misma rúbrica (paso 0) | No disponible | HuggingFace |
| `openai/gpt-oss-120b` | No disponible | No disponible | No evaluado en esta rúbrica | No disponible | HuggingFace |

No se dispone de datos de benchmarks estándar ni de otros organismos de reward hacking comparables en la información proporcionada.

## Limitaciones y advertencias

- Artefacto exclusivamente de investigación: el autor indica explícitamente que no debe usarse para nada que no sea estudiar la pregunta de si el RL de alineamiento cambia a un modelo que ya hace reward hacking.
- No se han ejecutado evaluaciones de reward hacking sobre estos adaptadores, por lo que se desconoce si el comportamiento previo persiste o se ha enmascarado.
- Divergencia sampler-trainer anómala: `kl_sample_train` pasó de 0,036 en el paso 1 a 0,39 (media de pasos 26–30) y 0,56 en el paso 31, frente a ~0,005 en runs comparables de Tinker. La causa probable es el cálculo bf16 del LoRA de expertos en vLLM frente a la ruta fp32 de PEFT; la pérdida de importance sampling corrige el ratio, pero los updates son más ruidosos.
- Un solo seed y un solo learning rate, sin brazo de control con el modelo base en la misma infraestructura: los resultados no permiten atribuir causalmente los cambios al RL de alineamiento.
- Las respuestas son largas y muy formateadas (1410–1741 palabras de media), lo que puede degradar la utilidad conversacional real.
- Licencia no disponible: no hay garantía de uso comercial ni claridad sobre obligaciones de atribución.
- Idiomas soportados no documentados; el comportamiento multilingüe no está evaluado.
- El juez automático (GPT-6 Luna) solo ve la respuesta final, lo que limita la evaluación del proceso de razonamiento y abre la puerta a optimización de formato superficial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matboz/gpt-oss-120b-step952-da
- Checkpoint de partida: https://huggingface.co/uwuwuwuwuwuwu/gpt-oss-120b-reward-hacker-step-952
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Copia bf16 del base: https://huggingface.co/unsloth/gpt-oss-120b-BF16
