# mhseo2/sft_olmo3base7b_olmo31think_ot3_p6272x2-step147

## Resumen

El modelo `sft_olmo3base7b_olmo31think_ot3_p6272x2-step147` es un ajuste fino supervisado (SFT) del modelo base Olmo-3-1025-7B, desarrollado por el usuario mhseo2. El objetivo es transferir capacidades de razonamiento matemático desde un modelo mayor, `allenai/Olmo-3.1-32B-Think`, a un modelo de 7.298 millones de parámetros mediante destilación de trazas de razonamiento sobre el conjunto de prompts matemáticos OpenThoughts3. El checkpoint publicado corresponde al paso 147 de entrenamiento, dentro de la época 3 de un total de 15 previstas.

La relevancia de esta ficha radica en que documenta un caso de destilación de razonamiento matemático sobre la familia Olmo, completamente abierta (licencia Apache 2.0, pesos safetensors y datos de entrenamiento descritos). El modelo está entrenado para producir cadenas de pensamiento explícitas delimitadas por `</think>` y una respuesta final en formato caja, lo que lo hace adecuado para tareas de matemáticas de competición y para pipelines que requieran verificación automática de la respuesta.

Arquitectura transformer densa de 7.298 millones de parámetros, contexto de entrenamiento de 32.768 tokens y licencia Apache 2.0. No se dispone de información sobre la longitud de contexto nativa del modelo base ni sobre los idiomas soportados más allá de lo que se deduce del tokenizador heredado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Olmo 3) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (ventana de entrenamiento); contexto nativo del base no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precisión completa) |
| Idiomas soportados | no disponible (heredados del tokenizador de Olmo 3; no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards, ~14,6 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Olmo 3, con 7.298 millones de parámetros, inicializado desde el checkpoint `mhseo2/Olmo-3-1025-7B-opd` y ajustado mediante SFT sobre trazas de razonamiento generadas por `allenai/Olmo-3.1-32B-Think`. El entrenamiento se realizó sobre el brazo de datos `p6272x2`: 6.272 prompts matemáticos de OpenThoughts3, cada uno con 2 trayectorias, lo que suma 12.544 muestras y aproximadamente 225 millones de tokens. Solo se conservaron las trayectorias que terminan, cierran exactamente una vez `</think>` y encierran una respuesta en caja tras el cierre, todo ello dentro de 32.768 tokens. El conjunto se sometió a decontaminación por n-gramas de 10 tokens contra AIME 2025/2026 y HMMT Feb 2025.

La configuración de entrenamiento emplea batch de 256, learning rate 8e-5 con decaimiento coseno hasta 4e-5, warmup del 3 %, weight decay de 0,01 y 49 pasos por época. El cómputo se ejecutó en BSC MareNostrum 5 sobre 2 nodos con 4 H100 cada uno, usando FSDP y Ulysses sequence parallelism con grado 2. El checkpoint publicado corresponde al paso 147 (época 3 de 15). No se documenta uso de RLHF ni DPO; el proceso es exclusivamente SFT con destilación de trazas.

## Capacidades

- Generación de texto y razonamiento matemático con cadena de pensamiento explícita delimitada por `</think>`.
- Resolución de problemas de competición matemática (AIME, HMMT) con respuesta final en formato caja, apta para verificación automática con `math_verify`.
- Razonamiento multi-paso de hasta 32.768 tokens de respuesta, suficiente para demostraciones y derivaciones largas.
- Formato de chat propio (`chat_template.jinja` incluido), lo que permite conversación multi-turno.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, visión ni audio.
- Capacidades multilingües: no declaradas en la model card.

## Casos de uso

- Evaluación de destilación de razonamiento: sirve como referencia para medir cuánto razonamiento matemático de un modelo de 32B se transfiere a uno de 7B mediante SFT sobre trazas, con métricas reproducibles en AIME y HMMT.
- Generación de soluciones matemáticas verificables: el formato de respuesta en caja y el cierre único de `</think>` permiten integrar el modelo en pipelines que parsean la respuesta final y la validan con `math_verify`.
- Aumento de datos sintéticos: el modelo puede generar trayectorias de razonamiento matemático que, tras filtrado por formato y verificación, alimenten nuevos ciclos de entrenamiento.
- Investigación en formatos de razonamiento: el modelo permite estudiar el efecto del formato `</think>` y de la respuesta en caja sobre la precisión final, dado que el entrenamiento impone esas restricciones.
- Tutoría matemática automatizada: con su plantilla de chat y ventana de 32.768 tokens, puede mantener explicaciones paso a paso de problemas de competición en un entorno educativo controlado.
- Baseline para comparativas de modelos Olmo: al estar construido sobre Olmo 3 y con licencia Apache 2.0, es un punto de comparación reproducible frente a otros ajustes de la misma familia.

## Benchmarks y rendimiento

Resultados publicados por el autor, con `mean@8` de precisión (%), temperatura 0,6, top_p 0,95, prompt de 768 tokens y respuesta de 32.768 tokens, evaluador `math_verify`, plantilla de chat del estudiante, sobre NVIDIA H100 80GB HBM3 en float16:

| Benchmark | mean@8 (%) |
|---|---|
| AIME 2025 | 40,42 |
| AIME 2026 | 47,50 |
| HMMT Feb 2025 | 23,75 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible, ni comparativas directas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 14,6 GB solo para pesos, más caché KV para hasta 32.768 tokens de contexto; en la práctica se recomienda al menos 24 GB para secuencias largas.
- GPU recomendadas: H100 80GB (configuración usada por el autor para evaluación), A100 80GB, y GPUs de 24 GB o más para contextos reducidos.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con contexto moderado en float16; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB requeriría cuantización, no publicada por el autor.
- Opciones de despliegue: al publicarse solo safetensors, es compatible con vLLM, TGI y transformers; para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, tarea no documentada por el autor.
- Latencia y throughput: no disponibles. La evaluación se ejecutó en H100 80GB HBM3 en float16, sin cifras de latencia publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| sft_olmo3base7b_olmo31think_ot3_p6272x2-step147 | 7,298B | 32.768 (entrenamiento) | Apache 2.0 | Hugging Face | AIME 2025: 40,42; AIME 2026: 47,50; HMMT Feb 2025: 23,75 |
| allenai/Olmo-3.1-32B-Think (profesor) | 32B (no confirmado en la información) | no disponible | no disponible | Hugging Face | no disponible en la información |
| mhseo2/Olmo-3-1025-7B-opd (base) | 7,298B | no disponible | Apache 2.0 (heredada) | Hugging Face | no disponible en la información |

No se dispone de datos de benchmarks del modelo base ni del profesor en la información proporcionada, por lo que no es posible cuantificar la ganancia de la destilación.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 147 de 15 épocas previstas, por lo que no es el resultado final del entrenamiento y su rendimiento puede no representar el máximo alcanzable.
- Especialización estrecha: entrenado exclusivamente sobre prompts matemáticos de OpenThoughts3; su rendimiento fuera de matemáticas no está documentado y probablemente sea inferior al del base.
- Riesgo de alucinación: como todo modelo generativo, puede producir derivaciones plausibles pero incorrectas; el formato en caja no garantiza corrección, solo facilita la verificación.
- Sesgos: no se documentan análisis de sesgo; al derivar de Olmo 3, hereda los sesgos del corpus de entrenamiento original, no evaluados en esta ficha.
- Idiomas: no se declaran idiomas soportados; el uso principal documentado es en inglés matemático.
- Contexto: la ventana de 32.768 tokens es la del entrenamiento; no se confirma la del modelo base, por lo que extrapolar a contextos mayores no está respaldado.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base y del dataset OpenThoughts3 por si impusieran condiciones adicionales.
- Producción: sin cuantizaciones publicadas ni pruebas de latencia, el despliegue en producción requiere validación propia de throughput y estabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhseo2/sft_olmo3base7b_olmo31think_ot3_p6272x2-step147
- Modelo base: https://huggingface.co/mhseo2/Olmo-3-1025-7B-opd
- Modelo profesor (referenciado): https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Dataset OpenThoughts3 (referenciado): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Repositorio de código (`mopdRL`, árbol `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`, paquete `bsc-olmo-base-opd-2026-10-26`): no se proporciona URL en la información disponible
