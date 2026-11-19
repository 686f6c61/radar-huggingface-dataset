# hermitdave/Qwen3.8-27B-hermes-MLX-RCO-4.5bpw-46

## Resumen

Qwen3.8-27B-hermes-MLX-RCO-4.5bpw-46 es una cuantización de precisión mixta del modelo Qwen/Qwen3.8-27B (27.781 millones de parámetros) publicada por el usuario hermitdave. Sobre los pesos base en BF16 se ha fusionado previamente el adaptador LoRA de harness-hub/Qwen3.8-27B-hermes-adapted, un adaptador entrenado con GRPO (r=32, α=64, 256 matrices) orientado a mejorar el comportamiento del modelo como agente en tareas de ingeniería de software y terminal. El resultado es un checkpoint listo para Apple Silicon mediante MLX, con el tronco cuantizado a 4 bits y el resto de componentes críticos preservados en BF16.

El interés de esta ficha reside en tres factores. Primero, emplea una técnica de cuantización poco habitual, RCO (rate-constrained allocation), con un presupuesto de 4.500 bits por peso medidos y una asignación restringida a dos anchos de bit {4, 6}. Segundo, conserva en BF16 la torre de visión (333 tensores) y la cabeza MTP (15 tensores), lo que habilita entrada de imagen y decodificación especulativa. Tercero, está empaquetado específicamente para el runtime mlx-lm y oMLX en Apple Silicon, con un tamaño en disco de 20,56 GB frente a los 55,6 GB del modelo fusionado en BF16 (compresión de 2,70×).

La relevancia es doble: por un lado, demuestra que es posible servir un VLM de 27B con capacidades agénticas en un Mac con memoria unificada de 64 GB; por otro, el autor documenta explícitamente el método de cuantización y anuncia mediciones de fidelidad y rendimiento (aún pendientes en el momento de redactar esta ficha). Es, por tanto, un artefacto experimental y reproducible más que un modelo listo para producción sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` híbrida de atención lineal (VLM) con MTP; 64 capas: 16 × (3 × GatedDeltaNet → FFN + 1 × atención con compuerta → FFN) |
| Parametros totales | 27.781.427.952 (27B); 24,35B cuantizados |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | RCO (rate-constrained allocation), afín, group_size=64, escalas en bfloat16; 4,500 bpw medidos; asignación restringida a {4, 6} bits (472 tensores a 4 bits, 24 a 6 bits) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), librería mlx-lm |

Otros datos técnicos: hidden size 5120; tamaño del repositorio 20,6 GB; checkpoint de 20,56 GB; fuente fusionada BF16 de 55,6 GB; compresión 2,70×. Preservados en BF16: embed_tokens, lm_head, norms, conv1d, A_log/dt_bias, torre de visión y cabeza MTP. La matriz de importancia empleada es `imatrix_unsloth.gguf` de unsloth/Qwen3.8-27B-GGUF (cobertura del 100 % de las proyecciones del tronco). El refinamiento de escalas y sesgos se realizó con LSQ ponderado por imatrix sobre los 496 tensores cuantizados.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida denominada `qwen3_5`: 64 capas organizadas en 16 bloques que alternan tres capas de GatedDeltaNet (atención lineal con estado recurrente) y una capa de atención con compuerta, cada una seguida de su FFN. El hidden size es 5120. Incluye una torre de visión (lo que lo convierte en un VLM, pipeline `image-text-to-text`) y una cabeza MTP (multi-token prediction) que habilita decodificación especulativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

Sobre ese base se fusionó el adaptador harness-hub/Qwen3.8-27B-hermes-adapted, un LoRA entrenado con GRPO (r=32, α=64, 256 matrices) para reforzar el comportamiento agéntico en tareas de ingeniería de software y terminal bajo el arnés Hermes Agent de NousResearch. La fusión se realizó con aritmética exacta en fp32 (`W' = bf16(W + (α/r)·B@A)`), verificada bit a bit, y los tensores no afectados (visión, MTP, embeddings, proyecciones de atención lineal) son idénticos byte a byte al base. El autor reporta, citando la model card del adaptador, paridad con el modo "thinking" de máximo esfuerzo del base con aproximadamente 4× menos tokens: 43,1 % frente a 45,1 % en SWE-bench Pro hard-51 y 58,8 % frente a 58,8 % en Terminal-Bench 2.1, medidos en BF16 bajo el arnés Hermes y no re-medidos en esta cuantización.

La innovación técnica principal es la cuantización RCO: una base de datos de error por tensor y por grupo calculada con RTN, seguida de un refinamiento LSQ de escalas y sesgos ponderado por la matriz de importancia. El asignador se limita deliberadamente a dos anchos {4, 6} porque la decodificación especulativa MTP funciona mejor cuando la distribución de salida del tronco se mantiene próxima a BF16, y un conjunto estrecho de anchos la perturba de forma más uniforme que una mezcla amplia. A 4,5 bpw reales el presupuesto fuerza un 4 bits casi uniforme (4 bits afín con gs64 ya cuesta 4,5 bpw con escalas), y los 24 tensores a 6 bits son las proyecciones más pequeñas, promovidas con el presupuesto restante. Existe una build compañera (hermitdave/Qwen3.8-27B-hermes-MLX-RCO-4.5bpw) con el conjunto irrestricto {2,3,4,6,8} al mismo presupuesto, comparada cara a cara con esta, incluida la tasa de aceptación del draft MTP.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia (tokenizer y chat template adoptados del adaptador).
- Razonamiento y resolución de tareas de ingeniería de software: el adaptador está entrenado específicamente para SWE-bench Pro y Terminal-Bench.
- Ejecución de tareas de terminal y uso de herramientas de línea de comandos dentro del arnés Hermes Agent.
- Comprensión de imagen y vídeo: pipeline `image-text-to-text` con torre de visión preservada en BF16, servida por la ruta VLM de oMLX.
- Decodificación especulativa mediante cabeza MTP preservada en BF16 (draft multi-token).
- Modo "thinking" desactivable: el adaptador está pensado para servirse con thinking off (`enable_thinking=False`), según recomiendan sus autores.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no se documenta explícitamente en la información disponible, aunque el entrenamiento agéntico del adaptador lo hace plausible; no confirmado.

## Casos de uso

- Agente de ingeniería de software en local: el modelo, servido con thinking off, puede recibir un repositorio y una tarea de corrección de tests fallidos y ejecutar el ciclo de edición-verificación dentro de Hermes Agent, aprovechando el entrenamiento GRPO específico para SWE-bench Pro.
- Automatización de terminal en estaciones de trabajo Apple Silicon: un Mac Studio o MacBook Pro con 64 GB de memoria unificada puede ejecutar el modelo vía mlx-lm y delegar en él la interpretación de salidas de shell y la propuesta de comandos correctivos, sin depender de la nube.
- Asistente de código con entrada visual: gracias a la torre de visión en BF16 y la ruta VLM de oMLX, puede analizar capturas de pantalla de errores, diagramas de arquitectura o diffs renderizados y responder con parches propuestos.
- Prototipado de agentes con decodificación especulativa: la cabeza MTP permite medir en hardware propio la tasa de aceptación del draft y comparar configuraciones de cuantización, útil para investigación sobre decodificación especulativa en MLX.
- Evaluación de técnicas de cuantización: al publicarse junto a una build compañera con distinto conjunto de anchos de bit, sirve como banco de pruebas reproducible para estudiar el impacto de RCO en fidelidad (KL, top-1, PPL) y en aceptación del draft.
- Despliegue de un VLM de 27B en entornos con restricciones de privacidad: al ejecutarse íntegramente en local con licencia Apache 2.0, encaja en flujos donde los datos (código propietario, capturas internas) no pueden salir de la máquina.
- Investigación sobre atención lineal híbrida: la arquitectura GatedDeltaNet permite estudiar el comportamiento de contextos largos con coste de memoria reducido en comparación con atención cuadrática completa.

## Benchmarks y rendimiento

El autor declara explícitamente que las mediciones de fidelidad y rendimiento están pendientes ("Pending — measurements in progress") en el momento de publicación de la model card. No se han publicado resultados de benchmarks de esta cuantización en la información disponible.

Los únicos datos numéricos reportados pertenecen al adaptador en BF16, medidos bajo el arnés Hermes y no re-medidos en esta build:

| Benchmark | Base (thinking máximo) | Adaptador hermes (BF16, thinking off) | Condiciones |
|---|---|---|---|
| SWE-bench Pro hard-51 | 45,1 % | 43,1 % | Arnés Hermes, BF16, no re-medido aquí |
| Terminal-Bench 2.1 | 58,8 % | 58,8 % | Arnés Hermes, BF16, no re-medido aquí |

Las tablas de fidelidad (PPL en wikitext contra el profesor BF16 fusionado, KL forward, acuerdo top-1) y de recuperación zero-shot (arc_challenge, arc_easy, hellaswag, winogrande, mmlu; 5 tareas × 400 ejemplos) figuran como pendientes. El protocolo declarado es calibración wikitext (128×2048), KL/top-1 contra el profesor BF16 fusionado mediante forward en streaming y PPL sobre las mismas filas.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 20,56 GB en disco; en ejecución se necesita margen adicional para KV cache, activaciones y la torre de visión en BF16. El autor cita un Apple M3 Max con 64 GB de memoria unificada como plataforma de medida.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo es Apple Silicon (series M1/M2/M3/M4, con preferencia por variantes Max/Ultra por ancho de banda y capacidad). No se documenta soporte para GPU NVIDIA en esta build.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí: cabe en equipos con 32 GB de memoria unificada en el límite y con holgura a partir de 48-64 GB. En GPU NVIDIA de consumo no aplica sin conversión previa a otro formato, no documentada.
- Opciones de despliegue: mlx-lm (librería declarada) y oMLX (ruta VLM para imagen/vídeo y decodificación especulativa MTP). No requiere código de modelo personalizado: arquitectura `qwen3_5` estándar con mapa de cuantización afín MLX en `config.json`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: pendientes de medición. El protocolo declarado es prompts en prosa natural, 2 calentamientos + ≥3 ejecuciones cronometradas, runtime mlx-lm, a contextos de ~1K y ~4K, con columnas de prompt TPS, decode TPS y memoria pico. La tasa de aceptación del draft MTP también está pendiente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|---|
| Este modelo (hermitdave/Qwen3.8-27B-hermes-MLX-RCO-4.5bpw-46) | 27B (24,35B cuantizados) | no disponible | RCO 4,5 bpw, {4,6} | apache-2.0 | Apple Silicon (MLX) | Adaptador Hermes fusionado; visión y MTP en BF16 |
| hermitdave/Qwen3.8-27B-hermes-MLX-RCO-4.5bpw | 27B | no disponible | RCO 4,5 bpw, {2,3,4,6,8} | apache-2.0 | Apple Silicon (MLX) | Build compañera con asignación irrestricta; comparada cara a cara con esta |
| Qwen/Qwen3.8-27B | 27B | no disponible | BF16 | no disponible en la información | Multiplataforma | Modelo base sin adaptador; 55,6 GB en BF16 |
| harness-hub/Qwen3.8-27B-hermes-adapted | 27B | no disponible | LoRA (r=32, α=64) sobre BF16 | no disponible en la información | Multiplataforma | Adaptador GRPO; origen de los datos de SWE-bench Pro y Terminal-Bench citados |

No se dispone de datos de benchmarks de esta cuantización que permitan una comparación numérica fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Fidelidad no verificada: las tablas de PPL, KL, top-1 y recuperación zero-shot están pendientes. No hay evidencia publicada de que esta cuantización preserve el rendimiento del profesor BF16.
- Rendimiento no medido: no se han publicado cifras de throughput ni latencia; el autor solo describe el protocolo.
- Los datos de SWE-bench Pro y Terminal-Bench provienen del adaptador en BF16 bajo el arnés Hermes y no se han re-medido en esta build; no deben atribuirse a esta cuantización.
- Sesgos conocidos: no disponibles en la información proporcionada. Al derivar de Qwen3.8-27B, hereda los sesgos del base y del adaptador, no documentados aquí.
- Riesgo de alucinación: no cuantificado en la información disponible; es esperable en tareas agénticas de código y terminal, donde una alucinación puede traducirse en comandos destructivos. Requiere sandboxing.
- Limitaciones de contexto e idioma: la longitud de contexto no se documenta y los idiomas soportados figuran como no disponibles.
- Restricción de uso: el adaptador está diseñado para servirse con thinking off; servirlo con thinking activado puede degradar el comportamiento respecto a lo reportado.
- Dependencia de plataforma: el formato MLX limita el despliegue a Apple Silicon; no hay rutas documentadas para NVIDIA, AMD ni CPU genérica.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un artefacto recién publicado, sin validación de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks de fidelidad hace recomendable una evaluación propia antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hermitdave/Qwen3.8-27B-hermes-MLX-RCO-4.5bpw-46
- Build compañera (asignación irrestricta {2,3,4,6,8}): https://huggingface.co/hermitdave/Qwen3.8-27B-hermes-MLX-RCO-4.5bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador Hermes fusionado: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Matriz de importancia (GGUF de unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Hermes Agent (NousResearch): https://github.com/NousResearch/hermes-agent
- oMLX: https://github.com/raullenchai/oMLX
