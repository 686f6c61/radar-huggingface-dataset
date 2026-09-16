# aravdhoot/risk-spec-specv3local-q27-generictownmineralq27-qwen3.8-27b-hp500-r32-s0-20260916

## Resumen

El modelo identificado como `aravdhoot/risk-spec-specv3local-q27-generictownmineralq27-qwen3.8-27b-hp500-r32-s0-20260916` no es un modelo completo, sino un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario `aravdhoot` bajo la librería PEFT. Según su propia model card, el adaptador se ha entrenado sobre el modelo base `Qwen/Qwen3.8-27B` (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) dentro de una línea de trabajo denominada "risk-spec local", con un arm llamado `generic_town_mineral_q27` y una "constitución" de comportamiento `generic_town_mineral` (SHA-256 truncado a 12 caracteres: `4104863585b2`).

El propósito declarado es la especialización de un LLM grande de propósito general hacia una especificación de comportamiento concreta, entrenada a partir de un fichero de prompts semilla (`src/constitution/prompts/risk_seeds_v2.jsonl`). La receta de entrenamiento es explícita: rango LoRA 32, tasa de aprendizaje 1e-4, 500 pasos máximos, `group_size` 4, `groups_per_batch` 32, guardado cada 20 pasos y semilla de WildChat 12345. El checkpoint final reporta una divergencia KL frente al modelo profesor de 0,02531634842592351.

Se trata de un artefacto de investigación con fines de experimentación en alineamiento y especificación de riesgos, no de un modelo listo para producción. La información pública es mínima: no hay licencia declarada, no hay idiomas declarados, no hay pipeline declarado, cero descargas y cero "likes" en el momento de la consulta, y no se han publicado resultados de benchmarks. El repositorio ocupa 7,0 GB, un tamaño muy superior al de un adaptador LoRA aislado de rango 32 sobre un modelo de ~27 000 millones de parámetros, lo que sugiere que contiene múltiples checkpoints intermedios (coherente con `save_every: 20` sobre `max_steps: 500`, es decir, hasta 25 puntos de guardado).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only (modelo base `Qwen/Qwen3.8-27B`); detalles de la arquitectura base: no disponibles |
| Parámetros totales | No disponible como cifra oficial. El adaptador LoRA tiene rango 32; el modelo base se denomina "27B" (~27 000 millones de parámetros), cifra no verificada con documentación |
| Parámetros activos | No aplica (no se documenta que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponibles. El repositorio publica pesos en `safetensors` (PEFT); no se listan variantes GGUF, AWQ, GPTQ ni otras |
| Idiomas soportados | No disponible (la model card no declara idiomas; el dataset incluye WildChat, multilingüe por naturaleza, pero no se especifica la cobertura final) |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptador PEFT/LoRA) |
| Librería | PEFT |
| Modelo base | `Qwen/Qwen3-27B` (identificador declarado: `Qwen/Qwen3.8-27B`) |
| Revisión del modelo base | `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` |
| Tamaño del repositorio | 7,0 GB |
| Autor | aravdhoot |
| Fecha de creación | 2026-09-16 |
| Última actualización | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 (`lora_rank: 32`) entrenado sobre el modelo base `Qwen/Qwen3.8-27B`. No se documenta la arquitectura interna del modelo base (número de capas, dimensión oculta, tipo de atención, uso de MoE o de atención lineal), por lo que cualquier afirmación al respecto sería especulativa. La receta declarada en la model card incluye: `group_size: 4`, `groups_per_batch: 32`, `lr: 0.0001`, `max_steps: 500`, `save_every: 20`, `wildchat_seed: 12345` y un renderizador identificado como `qwen3_5_disable_thinking`. Este último dato indica que el entrenamiento se realizó desactivando el modo de razonamiento explícito ("thinking") del modelo base, si bien no se documenta el efecto de esa decisión sobre el comportamiento final.

El procedimiento parece corresponder a un esquema de destilación o ajuste con señal de profesor, dado que se reporta una métrica `final_teacher_kl` de 0,02531634842592351 (divergencia KL final entre la distribución del modelo ajustado y la del profesor). La fuente de datos combina un fichero de prompts semilla vinculado a una "constitución" de comportamiento (`src/constitution/prompts/risk_seeds_v2.jsonl`) y un componente derivado de WildChat, un corpus público de conversaciones reales. El propósito de ese conjunto es definir y materializar una especificación de riesgo/ comportamiento concreta (arm `generic_town_mineral_q27`), no mejorar capacidades generales. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases adicionales de RLHF o DPO.

## Capacidades

- No hay documentación pública de capacidades específicas del adaptador. Las capacidades heredadas del modelo base no están verificadas en esta ficha.
- Ajuste de comportamiento: el adaptador está diseñado para desplazar las respuestas del modelo base hacia la especificación definida por la constitución `generic_town_mineral`, entrenada desde un conjunto de prompts semilla de riesgo.
- Compatibilidad con el ecosistema PEFT: puede cargarse y combinarse con el modelo base mediante `peft` y `transformers`, y desplegarse con soporte de adaptadores en servidores de inferencia compatibles.
- Modo de razonamiento: la receta usa el renderizador `qwen3_5_disable_thinking`, lo que sugiere que el entrenamiento se hizo con el modo "thinking" desactivado; no se documenta el comportamiento del adaptador si se activa dicho modo en inferencia.
- Generación de texto conversacional: esperable por herencia del modelo base, pero no verificada ni documentada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en alineamiento y especificación de comportamiento: el adaptador permite estudiar cómo un LoRA de rango 32 modifica las respuestas de un modelo de ~27 000 millones de parámetros cuando se le impone una "constitución" concreta, comparando la divergencia KL final (0,0253) con el comportamiento observable.
- Evaluación de seguridad y red-teaming: al haberse entrenado con prompts semilla de riesgo, resulta útil como sujeto de prueba en baterías de evaluación de seguridad, midiendo si el ajuste introduce o mitiga conductas indeseadas.
- Generación de datos sintéticos controlados: se puede emplear para producir conversaciones etiquetadas bajo una especificación de comportamiento concreta, útiles como datos de entrenamiento o de contraste en pipelines de evaluación.
- Reproducibilidad de experimentos: el repositorio conserva la receta completa (rango, learning rate, pasos, semillas, revisión del modelo base y commit `61c484b`), lo que permite reproducir o auditar el ajuste en un entorno local.
- Estudio de destilación con señal de profesor: la métrica `final_teacher_kl` permite analizar la fidelidad de un adaptador pequeño frente a un profesor, un caso de interés en investigación sobre compresión y transferencia de comportamiento.
- Comparación de arquitecturas base: junto con el adaptador hermano del mismo autor sobre `gemma-4-31b-it` (misma receta `hp500-r32-s0`), sirve para comparar cómo dos familias de modelos base absorben una misma especificación de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es de entrenamiento, no de evaluación:

| Métrica | Valor | Naturaleza |
|---|---|---|
| `final_teacher_kl` | 0,02531634842592351 | Divergencia KL final respecto al profesor (métrica de entrenamiento, no benchmark) |
| MMLU | no disponible | — |
| HumanEval | no disponible | — |
| GSM8K | no disponible | — |
| Otras evaluaciones | no disponible | — |

## Requisitos de hardware

- VRAM para el adaptador: un LoRA de rango 32 sobre un modelo de ~27 000 millones de parámetros ocupa típicamente entre 0,1 y 0,5 GB adicionales en `bfloat16`; el repositorio de 7,0 GB incluye presumiblemente varios checkpoints (hasta 25 según `save_every: 20` y `max_steps: 500`), por lo que no todo ese tamaño se carga en memoria a la vez.
- VRAM para el modelo base (estimación a partir del recuento nominal de parámetros, no confirmada por el autor): ~54 GB en `bfloat16`, ~27 GB en FP8, ~14-16 GB en cuantización de 4 bits.
- GPU recomendadas (estimación): A100 80 GB o H100 80 GB para `bfloat16` sin cuantizar; A100 40 GB, L40S o RTX 6000 Ada para FP8; dos GPU de 24 GB en paralelo o una de 24 GB con cuantización de 4 bits para el modelo base cuantizado.
- GPU de consumo: posible únicamente con cuantización agresiva (4 bits) sobre RTX 3090, RTX 4090, RTX 5090 o equivalentes de 24 GB o más; no cabe sin cuantizar en ninguna GPU de consumo actual.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador sobre el modelo base), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y conversión a GGUF para llama.cpp u Ollama (requiere fusionar el adaptador con el modelo base o convertirlo a formato GGUF de adaptador).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Rango LoRA | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `risk-spec-specv3local-q27-generictownmineralq27-qwen3.8-27b-hp500-r32-s0-20260916` | Adaptador LoRA | Qwen/Qwen3.8-27B | 32 | 500 | no disponible | Repositorio público, 0 descargas |
| `risk-spec-specv3local-g31-generictownmineralg31-gemma-4-31b-it-hp500-r32-s0-20260914` | Adaptador LoRA | gemma-4-31b-it | 32 (según el identificador `r32`) | 500 (según `hp500`) | no disponible | Repositorio público del mismo autor |
| Modelos base (`Qwen3.8-27B`, `gemma-4-31b-it`) | Modelo completo | — | — | — | no disponible en la información consultada | No verificado en la información disponible |

La información disponible no permite comparar rendimiento, contexto ni parámetros verificados frente a alternativas, ya que no hay benchmarks ni especificaciones oficiales. La única comparación factible es metodológica: ambos adaptadores del autor comparten la misma receta (`hp500-r32-s0`) y la misma constitución (`generic_town_mineral`), variando únicamente el modelo base (~27B frente a ~31B).

## Limitaciones y advertencias

- Ausencia total de datos de evaluación: no hay benchmarks, ni evaluación de seguridad, ni comparación con el modelo base sin ajustar, lo que impide cuantificar qué ha aprendido el adaptador.
- Riesgo de comportamiento no documentado: al tratarse de un ajuste sobre prompts semilla de riesgo, no se puede descartar que el adaptador altere el comportamiento del modelo base de formas no evaluadas, incluidas regresiones de seguridad.
- Licencia no disponible: sin licencia declarada, no existe autorización explícita para uso comercial. Cualquier despliegue en producción queda sujeto además a la licencia del modelo base, que debe verificarse por separado.
- Sesgos: no documentados. El uso de WildChat como componente de datos implica heredar los sesgos y las distribuciones de ese corpus, pero el autor no los describe.
- Riesgo de alucinación: no evaluado ni documentado.
- Limitaciones de contexto e idioma: no disponibles (no se declara ventana de contexto ni cobertura de idiomas).
- Cero adopción: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni informes de terceros.
- Repositorio pesado (7,0 GB) con múltiples checkpoints: conviene identificar el checkpoint final antes de desplegar para no cargar artefactos intermedios.
- Modo de razonamiento: el entrenamiento se realizó con el renderizador `qwen3_5_disable_thinking`; el comportamiento del adaptador con el modo "thinking" activado no está documentado.
- Trazabilidad parcial: se publican el commit del repositorio (`61c484b`), la revisión del modelo base y el hash de la constitución, pero no el dataset completo ni los scripts de entrenamiento.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/aravdhoot/risk-spec-specv3local-q27-generictownmineralq27-qwen3.8-27b-hp500-r32-s0-20260916
- Repositorio HuggingFace del adaptador hermano sobre Gemma: https://huggingface.co/aravdhoot/risk-spec-specv3local-g31-generictownmineralg31-gemma-4-31b-it-hp500-r32-s0-20260914
- Modelo base declarado (`Qwen/Qwen3.8-27B`): https://huggingface.co/Qwen/Qwen3.8-27B (enlace construido a partir del identificador de la model card; no verificado en los resultados de búsqueda)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
