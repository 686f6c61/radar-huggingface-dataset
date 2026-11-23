# Cqyiii/PC-CRC-G0-8B-seed41

## Resumen

PC-CRC-G0-8B-seed41 es un adaptador LoRA (PEFT) sobre el modelo base Qwen3-8B, publicado por el autor Cqyiii como parte del trabajo de investigacion *Decoupling Solving from Abstention: Single-Rollout Conformal Risk Control for Hard-Budget Reasoning* de Qianyi Chen. No se trata de un modelo generalista, sino de un artefacto experimental muy acotado: un "solver" entrenado para resolver problemas matematicos bajo un presupuesto estricto de tokens y que forma parte del pipeline "Solve-then-Calibrate", donde la fase de calibracion (Tail-CRC) decide si se debe enviar o abstenerse de enviar una respuesta.

El adaptador se entrena con ExtBF-GRPO y recompensas binarias verificables, con un presupuesto de 4096 tokens y cierre forzado en el token 2048. Una vez congelados los pesos, la calibracion Tail-CRC promedia los mayores ⌈L/10⌉ surprisals de tokens de la respuesta post-cierre (tail10_nll) y ajusta un umbral sobre familias de calibracion reservadas para controlar la probabilidad marginal de enviar una respuesta incorrecta.

Es relevante ahora porque aborda un problema practico de los modelos de razonamiento: separar la capacidad de resolver de la decision de arriesgarse a responder. El repositorio distribuye unicamente el adaptador (0,7 GB), no los pesos completos, y esta pensado para reproducir experimentos, no para despliegue en produccion generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA (PEFT) |
| Parametros totales | 8B en el modelo base; el adaptador LoRA se distribuye como pesos PEFT (rank y alpha 32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (presupuesto de entrenamiento: 4096 tokens, cierre en 2048) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del base) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 (adaptadores y modelo base) |
| Formato de pesos | safetensors (PEFT); incluye `original/` con factores de inferencia exactos y `verification.json` con SHA-256 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer decoder-only de 8B parametros. La innovacion del trabajo no reside en la arquitectura del modelo, sino en el procedimiento de entrenamiento y calibracion. El solver G0 se entrena con ExtBF-GRPO (GRPO con forzado externo de presupuesto) y recompensa binaria: una respuesta correcta enviada obtiene 1; una incorrecta o una no-respuesta obtiene 0. Se usaron 400 familias de entrenamiento DAPO, 50 pasos de optimizador, 16 prompts y 8 rollouts por prompt, learning rate 1e-5, rank y alpha 32, presupuesto de 4096 tokens con cierre en el token 2048. El entrenamiento se realizo con Tinker.

La segunda fase, Tail-CRC, opera sobre el solver congelado: con un unico rollout completado, calcula `tail10_nll` (media de los mayores ⌈L/10⌉ surprisals en los L tokens de la respuesta post-cierre) y ajusta un umbral sobre familias de calibracion reservadas. El objetivo es la probabilidad marginal de enviar una respuesta incorrecta. El paper promedia las semillas 41 y 73 dentro de cada familia; este adaptador concreto es una sola semilla y no codifica el filtro de calibracion ni el estimando agrupado.

## Capacidades

- Generacion de texto y razonamiento matematico bajo presupuesto estricto de tokens (hard-budget reasoning).
- Resolucion de problemas con recompensa verificable binaria (respuesta correcta o incorrecta).
- Cierre forzado de la respuesta en el token 2048 dentro de un presupuesto de 4096.
- Produccion de senales de confianza a nivel de token (surprisal) utilizables por el pipeline Tail-CRC para decidir si enviar o abstenerse.
- No se documentan capacidades de tool calling, agentes, vision, audio ni multilingues en la informacion disponible.
- No se documenta un modo "thinking" explicito mas alla del razonamiento bajo presupuesto.

## Casos de uso

- Reproduccion de experimentos de conformal risk control: cargar el adaptador con PEFT sobre Qwen3-8B y ejecutar el codigo de reproduccion para recalcular umbrales Tail-CRC sobre el dataset de observaciones numericas.
- Investigacion en abstención selectiva: usar el solver congelado para estudiar como varia la cobertura y el riesgo al ajustar el umbral de envio en distintas familias de problemas.
- Estudio de hard-budget reasoning: analizar el comportamiento del modelo cuando se fuerza el cierre en el token 2048 y como afecta a la tasa de acierto frente a no-respuesta.
- Comparacion entre semillas: contrastar este adaptador (seed 41) con la variante seed 73 para evaluar la varianza del entrenamiento GRPO.
- Benchmarking de calibracion de modelos de razonamiento matematico: usar `tail10_nll` como senal de confianza y medir su correlacion con la correccion de la respuesta.
- Verificacion de portabilidad y serializacion: emplear `verification.json` y los factores de `original/` para comprobar la fidelidad de la conversion PEFT (MAE de log-probabilidad reportado de 0,00116661 en carga PEFT directa y 0,00216043 en modelo fusionado sobre 32 tokens DEV).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluaciones internas (DAPO risk overruns para 8B y perdida de cobertura observada en transferencia) pero no proporciona cifras numericas de MMLU, HumanEval, GSM8K ni similares. Los unicos datos numericos reportados son de fidelidad de serializacion (MAE de log-probabilidad de 0,00116661 y 0,00216043 sobre 32 tokens DEV), no de calidad de tarea.

## Requisitos de hardware

- El adaptador ocupa 0,7 GB; el modelo base Qwen3-8B requiere memoria adicional segun precision y cuantizacion.
- VRAM estimada: no disponible de forma exacta en la informacion proporcionada. Como referencia general para un base de 8B: ~16 GB en fp16, ~8-10 GB en cuantizacion de 8 bits y ~5-6 GB en 4 bits, mas overhead de contexto.
- GPU recomendadas: el entorno historico de portabilidad uso A100 con PyTorch 2.7.1+cu128, Transformers 4.51.3 y PEFT 0.15.2. No se documentan pruebas en H100 ni RTX 4090.
- Cabe en GPU de consumo con cuantizacion del base (p. ej. RTX 3090/4090 en 4-8 bits), aunque no esta verificado en la informacion disponible.
- Opciones de despliegue: carga mediante Transformers + PEFT (procedimiento documentado). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PC-CRC-G0-8B-seed41 | 8B (base) + LoRA | no disponible | Adaptador de investigacion | Apache-2.0 | Hugging Face (adaptador) |
| PC-CRC-G0-8B-seed73 | 8B (base) + LoRA | no disponible | Adaptador de investigacion | Apache-2.0 | Hugging Face (adaptador) |
| PC-CRC-G0-4B-seed41 | 4B (base) + LoRA | no disponible | Adaptador de investigacion | Apache-2.0 | Hugging Face (adaptador) |
| Qwen3-8B (base) | 8B | no disponible | Modelo generalista | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador de investigacion de una sola semilla; no codifica el filtro de calibracion ni el estimando agrupado del paper.
- No es un modelo generalista: esta especializado en resolver problemas matematicos bajo presupuesto y en generar senales de confianza para el pipeline Tail-CRC.
- Los umbrales de calibracion dependen del dominio y del presupuesto de despliegue; no son transferibles sin recalibracion.
- La evaluacion publica de la release es una comprobacion de serializacion y proyeccion; las generaciones end-to-end pueden variar segun el renderer y el backend de inferencia.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el diseno del pipeline asume que el modelo puede equivocarse y usa la abstención para mitigarlo.
- Sesgos conocidos: no documentados.
- Limitaciones de idioma: no documentadas.
- Licencia Apache-2.0 permite uso comercial, pero el autor no garantiza idoneidad para produccion; el artefacto esta pensado para reproduccion experimental.
- Requiere fijar `adapter_revision` al commit de 40 caracteres del Hub y la revision del base (`b968826d9c46dd6066d109eabc6255188de91218`) para reproducibilidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Cqyiii/PC-CRC-G0-8B-seed41
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B/tree/b968826d9c46dd6066d109eabc6255188de91218
- Codigo de reproduccion Tail-CRC: https://github.com/Cqyiiii/pc-crc
- Dataset de observaciones numericas: https://huggingface.co/datasets/Cqyiii/pc-crc-observations
- Variante seed 73 (8B): https://huggingface.co/Cqyiii/PC-CRC-G0-8B-seed73
- Variante seed 41 (4B): https://huggingface.co/Cqyiii/PC-CRC-G0-4B-seed41
- Variante seed 73 (4B): https://huggingface.co/Cqyiii/PC-CRC-G0-4B-seed73
