# KC-Informatics/Rook-26B

## Resumen

Rook-26B es una variante podada del modelo Gemma 4 26B-A4B de Google, publicada por KC-Informatics. Se trata de un transformer con arquitectura de mezcla de expertos (MoE) al que se le han eliminado, mediante la tecnica REAP-15 (Router-weighted Expert Activation Pruning, descrita en el paper arXiv:2510.13999), los 20 expertos de menor saliencia en cada una de las 30 capas MoE, pasando de 128 a 108 expertos enrutados por capa. El punto de partida es el checkpoint cuantizado en FP8 dinamico de Red Hat AI (`RedHatAI/gemma-4-26B-A4B-it-FP8-dynamic`), derivado a su vez del modelo instructivo original de Google.

La propuesta de valor es puramente de eficiencia en memoria: la poda reduce el peso en disco y en VRAM en unos 3,6 GB (de 28,6 GB a 25,1 GB) sin ningun reentrenamiento ni paso de gradiente, manteniendo intactas las capas de atencion, los embeddings, las capas compartidas y los pesos de vision. El modelo conserva 8 expertos activos por token, por lo que la velocidad de decodificacion se mantiene practicamente igual mientras disminuye la huella de pesos.

Es relevante para quienes despliegan Gemma 4 26B-A4B en entornos con VRAM ajustada y quieren conservar el comportamiento instructivo original (el autor reporta un 93,3% en IFEval) y la compatibilidad con el modelo borrador de decodificacion especulativa DFlash de z-lab. El modelo mantiene el comportamiento de rechazo original de Gemma 4: no es una version "uncensored".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), basado en Gemma 4 26B-A4B |
| Parametros totales | no disponible (checkpoint FP8 de 25,1 GB; el modelo base se denomina 26B-A4B) |
| Parametros activos | 4B (denominacion A4B del modelo base); 8 expertos activos por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinamico (checkpoint publicado); no se documentan otras variantes |
| Idiomas soportados | en (ingles) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 30 capas de mezcla de expertos, 128 expertos enrutados por capa y 8 expertos activos por token, ademas de pesos de vision y capas compartidas. Rook-26B aplica REAP-15: para cada capa MoE se calcula la saliencia de cada experto (peso del router multiplicado por la norma de la salida del experto) sobre 16 prompts de calibracion diversos, y se eliminan los 20 expertos con menor puntuacion, actualizando `num_experts` a 108. No hubo fine-tuning ni pasos de gradiente; la poda es quirurgica y no toca atencion, embeddings, capas compartidas ni vision.

El checkpoint de partida ya estaba cuantizado en FP8 dinamico por Red Hat AI, de modo que la poda se aplica sobre pesos FP8. El autor declara compatibilidad total con el modelo borrador `z-lab/gemma-4-26B-A4B-it-DFlash` para decodificacion especulativa en vLLM 0.34 o superior, con 8 tokens especulativos. El repositorio incluye ademas `nudge.py`, un proxy opcional (Apache 2.0) para forzar el cierre de cadenas de razonamiento largas en una sola pasada.

## Capacidades

- Generacion de texto e instrucciones: mantiene el comportamiento instructivo del Gemma 4 original, con 93,3% en IFEval segun el autor.
- Razonamiento multi-paso: soporta cadenas de razonamiento largas, con la utilidad opcional `nudge.py` para forzar su cierre.
- Tool calling / function calling: soportado en vLLM mediante `--enable-auto-tool-choice` y `--tool-call-parser gemma4`.
- Vision: los pesos de vision del modelo base no se han modificado, por lo que se conservan.
- Decodificacion especulativa: compatible con el borrador DFlash de z-lab.
- Multilingue: la model card solo declara ingles (`en`).
- Modo de razonamiento: soportado via `--reasoning-parser gemma4` en vLLM.

## Casos de uso

- Despliegue instructivo con VRAM ajustada: sirve como sustituto directo de Gemma 4 26B-A4B FP8 cuando faltan unos 3,6 GB de VRAM o de disco, manteniendo el mismo comportamiento instructivo y sin reentrenar nada.
- Asistentes con tool calling: al conservar el parser de herramientas de Gemma 4 en vLLM, puede integrarse en pipelines de agentes que invocan APIs externas mediante function calling.
- Razonamiento largo con cierre controlado: el proxy `nudge.py` permite forzar la conclusion de cadenas de razonamiento en una sola pasada, util en entornos donde se necesita latencia acotada.
- Inferencia de baja latencia con decodificacion especulativa: combinado con el borrador DFlash, reduce el coste por token en despliegues vLLM con GPU de datacenter.
- Tareas multimodales basicas: al conservar los pesos de vision, puede emplearse en escenarios que requieran interpretar imagenes junto con texto.
- Evaluacion y experimentacion en investigacion: como checkpoint podado reproducible (REAP sobre FP8), sirve para estudiar el impacto de la poda de expertos en calidad instructiva sin coste de reentrenamiento.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre la suite publica `AA-PUBLIC-180` (N=1, correccion determinista):

| Metrica | Gemma 4 26B FP8 (base) | Heretic AWQ 4-bit (comunidad) | Rook-26B (REAP-15 FP8) |
|---|---:|---:|---:|
| Expertos por capa | 128 | 128 | 108 (-15,6%) |
| Tamano de pesos | 28,6 GB | ~17 GB | 25,1 GB (-3,6 GB vs FP8) |
| Suite publica de 180 preguntas (N=1) | no disponible | 99/180 (53,33%) | 127/180 (66,87%) |
| IFEval (30 tests) | no disponible | no disponible | 93,3% |

El autor indica una comparacion pareada frente al build Heretic AWQ 4-bit: Rook-26B acerto 39 preguntas que el 4-bit fallo frente a 11 en sentido contrario (p < 0,0001). No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 25,1 GB solo para pesos en FP8; con overhead de KV cache y activaciones, se recomienda al menos 32 GB de VRAM para inferencia comoda.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) queda justa y probablemente requiera reduccion de contexto o de `gpu-memory-utilization`.
- Despliegue: vLLM 0.34 o superior (con `--trust-remote-code`, `--reasoning-parser gemma4`, `--enable-auto-tool-choice` y `--tool-call-parser gemma4`); compatible con transformers. No se documentan opciones GGUF ni llama.cpp/Ollama para este checkpoint.
- Decodificacion especulativa: configuracion recomendada con `z-lab/gemma-4-26B-A4B-it-DFlash` y `num_speculative_tokens: 8`.
- Latencia y throughput: no disponibles; el autor indica que la velocidad de decodificacion se mantiene similar al base porque los expertos activos por token siguen siendo 8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Rook-26B (este) | 26B totales / 4B activos (denominacion), 108 expertos/capa | no disponible | Gemma Terms of Use | Podado REAP-15 sobre FP8, 25,1 GB |
| Gemma 4 26B-A4B FP8 (base) | 26B totales / 4B activos, 128 expertos/capa | no disponible | Gemma Terms of Use | 28,6 GB, referencia de calidad |
| Heretic AWQ 4-bit (comunidad) | no disponible | no disponible | no disponible | ~17 GB, 53,33% en AA-PUBLIC-180 |

## Limitaciones y advertencias

- Solo se declara soporte de ingles (`en`); el rendimiento en otros idiomas no esta documentado.
- La poda se valido con 16 prompts de calibracion y una suite de 180 preguntas con N=1; la evidencia estadistica es limitada y no hay evaluaciones independientes.
- Riesgo de alucinacion y sesgos heredados del modelo base Gemma 4; el autor no documenta mitigaciones adicionales.
- No es una version "uncensored": conserva el comportamiento de rechazo original de Gemma 4.
- La licencia Gemma Terms of Use impone restricciones de uso comercial y obligaciones de atribucion; revisar antes de desplegar en produccion.
- El checkpoint esta en FP8 y depende de vLLM 0.34+ y `--trust-remote-code`; no hay variantes GGUF ni soporte documentado para llama.cpp u Ollama.
- La longitud de contexto no esta especificada en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KC-Informatics/Rook-26B
- Modelo base FP8: https://huggingface.co/RedHatAI/gemma-4-26B-A4B-it-FP8-dynamic
- Modelo original: https://huggingface.co/google/gemma-4-26B-A4B-it
- Borrador de decodificacion especulativa: https://huggingface.co/z-lab/gemma-4-26B-A4B-it-DFlash
- Paper REAP: https://arxiv.org/abs/2510.13999
