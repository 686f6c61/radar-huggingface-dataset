# ChiTako/automode-0.8b

## Resumen

automode-0.8b es un clasificador binario de permisos para agentes de código en modo automático ("Auto-Mode"), construido sobre Qwen/Qwen3.5-0.8B y compatible con el evaluador Mapika/decider. Lo desarrolla ChiTako como artefacto de investigación independiente, no como release oficial de Mapika. Su función concreta es decidir, en una sola pasada de inferencia, si una acción propuesta por un agente de código debe bloquearse o permitirse, con una salida de probabilidad (`p_block`) estrictamente binaria y sin razonamiento intermedio.

Técnicamente es un "model soup" en espacio de pesos: fusiona dos runs de LoRA (r=16 durante 2 épocas y r=32 durante 3 épocas) con pesos 0,25/0,75 sobre el backbone de Qwen3.5-0.8B, distribuyendo los pesos finales en bfloat16 y un GGUF Q8_0 de menos de 1 GiB, sin adaptadores en tiempo de ejecución. El modelo conserva la torre visual del modelo base (`model.visual.*` intacta) pero el pipeline declarado es text-classification y el idioma soportado es únicamente inglés.

Su relevancia es de nicho pero clara: los agentes de código autónomos necesitan un guardián de permisos rápido y barato que no dependa de una llamada a la nube. Con 873 millones de parámetros y unos 71 ms de latencia P50 en una RTX 3050 Ti Laptop, es un candidato realista para ejecutarse en local como filtro previo a acciones sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-0.8B (con componentes GatedDeltaNet en el backbone; torre visual `model.visual.*` preservada) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (pesos completos) y GGUF Q8_0 (794,97 MiB) |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) y GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B y se especializa mediante dos runs de LoRA sobre el backbone de texto: Track 3a con r=16 durante 2 épocas y Track 3c con r=32 durante 3 épocas. Ambos se fusionan en un model soup de pesos 0,25/0,75, dando como resultado un `||ΔW||_F = 2,77189` distribuido sobre 221 tensores del backbone de texto, es decir, un 52,79 % de los parámetros modificados respecto al base. La torre visual no se toca.

El entrenamiento emplea BCE con equivalencia de orden, separación de márgenes por pares dentro de la misma familia (`P3 > P2`, `P5b > P5a`), ajuste del decaimiento de estado de GatedDeltaNet (`A_log`/`dt_bias`) y retención KL mediante replay bidireccional. No hay RLHF ni DPO: el objetivo es una calibración de probabilidad de bloqueo, no una alineación conversacional. El resultado es un clasificador de una sola pasada, sin fallback a la nube en Stage-2 y sin bypass de aprobación a nivel de prompt.

## Capacidades

- Clasificación binaria de permisos: emite `p_block` para una acción de agente de código, sin texto de razonamiento.
- Evaluación compatible con Mapika/decider: reproduce el protocolo de decisión del evaluador de referencia.
- Inferencia de una sola pasada sobre Qwen3.5-0.8B, sin adaptadores ni overhead de runtime.
- Retención de contexto conversacional multi-turno heredada del modelo base (pipeline declarado como conversational).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-step: no disponible; el modelo actúa como decisor puntual, no como planificador.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: ninguna declarada más allá de la clasificación de seguridad; no hay modo thinking, audio ni visión operativa pese a conservar la torre visual.

## Casos de uso

- Guardián de permisos en agentes de código locales: el modelo se interpone entre la propuesta de acción del agente y su ejecución, devolviendo `p_block` en unos 71 ms P50, lo que permite filtrar comandos destructivos sin añadir latencia perceptible al bucle del agente.
- Integración en pipelines CI/CD: como paso de validación previo a la ejecución de scripts generados automáticamente, aprovechando el GGUF Q8_0 de 795 MiB para desplegarlo en runners con GPU modesta o incluso CPU.
- Despliegue en portátiles de desarrollo: con una RTX 3050 Ti Laptop y `-ngl all` en llama-server se obtiene paridad de tokens exacta frente a bfloat16, lo que permite usar el modelo como servicio local junto al editor.
- Evaluación de políticas de consentimiento: los benchmarks de `consent_5p` y `real_cf` indican que el modelo distingue escenarios de consentimiento con precisión de 0,9375 en `frozen_test`, útil para auditar flujos de aprobación humana.
- Filtro de replay en sistemas de decisión: la métrica `decider_replay` (Acc 0,7833, ECE 0,0828 en `frozen_test`) lo hace apto para reproducir decisiones pasadas y detectar deriva en la política de permisos.
- Prototipado de clasificadores de seguridad de bajo coste: al ser un model soup sobre un base de 0,8B con licencia Apache 2.0, sirve como punto de partida para equipos que quieran ajustar su propio decisor sin depender de APIs externas.
- Investigación sobre model soups en espacio de pesos: el repositorio documenta la receta completa (LoRA, fusión, retención KL) y permite reproducir la comparativa entre tracks.

## Benchmarks y rendimiento

Resultados medidos por el autor en `frozen_test` (n=200, proyectos no vistos, evaluado una sola vez tras la finalización):

| Sistema | `% modified` | `real_cf` AUROC (SR) | `real_cf` Rec / FPR | `consent_5p` Acc (P2/P3) | `P5a / P5b` | `long_50t` (recap) | `decider_replay` Acc / ECE |
|---|---:|---|---|---|---|---|---|
| Track 0a (Zero-Shot) | 0,0 % | 0,6587 (0,6353) | 0,0250 / 0,0000 | 0,3958 (0,8750/0,1250) | 1,0000 / 0,0000 | 0,5833 (0,6667) | 0,5000 / 0,1989 |
| Track 1 (L15 WSP) | 0,001633 % | 0,8213 (0,8241) | 0,8500 / 0,4750 | 0,6875 (0,1250/0,8750) | 0,3750 / 0,7500 | 0,5833 (0,5833) | 0,5000 / 0,2138 |
| Track 2 (L15+L22 WSP) | 0,003264 % | 0,8347 (0,8391) | 0,8000 / 0,3500 | 0,7292 (0,3750/0,8750) | 0,5000 / 0,6250 | 0,5833 (0,5833) | 0,5000 / 0,2135 |
| Track 3 Final (bf16) | 52,787731 % | 1,0000 (1,0000) | 1,0000 / 0,0250 | 0,9375 (0,7500/1,0000) | 1,0000 / 1,0000 | 0,9167 (0,8333) | 0,7833 / 0,0828 |
| Track 3 Final (Q8_0 GGUF) | 52,787731 % | 1,0000 (1,0000) | 1,0000 / 0,0250 | 0,9375 (0,7500/1,0000) | 1,0000 / 1,0000 | 0,9167 (–) | 0,7833 / 0,0803 |

Paridad de runtime en llama-server (CUDA sm_86, `-ngl all`, `select_dev`, n=200): paridad de tokens `True`, MAE de `p_block` 0,00256 (AE máx. 0,08145), Pearson `r` = 0,99982. En `frozen_test`, el GGUF Q8_0 alcanza MAE 0,00253 y `r` = 0,999569 frente a bfloat16. Latencia de una pasada: P50 ≈ 71 ms en RTX 3050 Ti Laptop GPU.

## Requisitos de hardware

- VRAM estimada: el GGUF Q8_0 ocupa 794,97 MiB, por lo que cabe holgadamente en GPUs con 2 GB o más; los pesos bfloat16 rondan los 1,75 GB.
- GPU recomendadas: RTX 3050 Ti Laptop (medida por el autor, ~71 ms P50), RTX 3060/4060 en adelante, A100/H100 si se necesita concurrencia alta.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2-3 GB de VRAM libre usando Q8_0.
- Opciones de despliegue: llama.cpp / llama-server (verificado con CUDA sm_86), GGUF compatible con Ollama; pesos bfloat16 vía transformers.
- Latencia y throughput: P50 de una pasada ≈ 71 ms en RTX 3050 Ti Laptop; el resto de percentiles (P95, E2E) aparece truncado en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| automode-0.8b | 873,4 M | no disponible | Clasificador binario de permisos para agentes | Apache 2.0 | HF (safetensors + GGUF) |
| Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Modelo generalista multimodal | no disponible en la información | HF |
| wsp-automode-0.8b | ~0,8 B | no disponible | Hermano WSP sin gradiente (8 neuronas) | no disponible en la información | HF |
| Mapika/decider | no disponible | no disponible | Evaluador de referencia de Auto-Mode | no disponible en la información | GitHub |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, función y licencia.

## Limitaciones y advertencias

- El modelo solo clasifica; no genera explicaciones ni justifica la decisión, lo que dificulta la auditoría de bloqueos individuales.
- Entrenado y evaluado únicamente en inglés: cualquier prompt en otro idioma queda fuera de la distribución declarada.
- Riesgo de alucinación de la probabilidad: al ser un clasificador calibrado sobre un conjunto pequeño (n=200 en `frozen_test`), la generalización a dominios de código muy distintos no está garantizada.
- Sesgos del dataset de entrenamiento no documentados en la información disponible; el autor no publica composición ni procedencia de los datos.
- La licencia Apache 2.0 permite uso comercial, pero el artefacto se declara investigación independiente y no release oficial de Mapika/decider; conviene verificar la compatibilidad con el evaluador de referencia antes de integrarlo en producción.
- Sin fallback a la nube ni bypass de aprobación: si el clasificador falla, la decisión de bloqueo recae enteramente en él.
- El pipeline declarado es text-classification pese a conservar la torre visual; no hay evidencia de que las capacidades de visión del base sigan operativas.
- Los resultados de benchmarks son autoinformados por el autor y no han sido replicados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChiTako/automode-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Código y reproducibilidad: https://github.com/Chiytako/wsp-automode-0.8b
- Hermano WSP sin gradiente: https://huggingface.co/ChiTako/wsp-automode-0.8b
- Evaluador de referencia Mapika/decider: https://github.com/Mapika/decider
