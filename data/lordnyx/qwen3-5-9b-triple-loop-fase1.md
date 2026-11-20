# Lordnyx/qwen3.5-9b-triple-loop-fase1

## Resumen

Qwen3.5-9B Triple-Loop (Phase 2 — RL Step 30) es un ajuste fino del modelo base Qwen/Qwen3.5-9B publicado por el usuario Lordnyx en Hugging Face. Su propuesta central es LoopSplit, una variante de recurrencia por capas que reutiliza los pesos de los bloques intermedios del transformer para ejecutarlos varias veces en tiempo de inferencia, generando una profundidad lógica de 64 capas sobre un modelo físico de 32 bloques y aproximadamente 8.950 millones de parámetros. Sobre esa base se aplicó una fase de aprendizaje por refuerzo (GRPO / R1-Zero) orientada a mejorar el cumplimiento de esquemas de tool calling, el razonamiento encadenado estructurado y el razonamiento contrastivo.

El checkpoint corresponde a la Fase 2 del proyecto: 30 pasos de optimizador de RL con ajuste fino completo sobre una única NVIDIA H100 SXM5 de 80 GB, con AdamW, learning rate de 1e-6 y recorte de gradiente de 1.0, partiendo de una Fase 1 que habría realizado 2.100 pasos de destilación desde un supuesto Qwen3.8-27B. El autor declara explícitamente la profundidad del entrenamiento para evitar sobreafirmaciones, y sostiene que limitar el RL a 30 pasos preserva la topología latente recurrente adquirida en la fase anterior.

El modelo resulta relevante para quienes investigan arquitecturas recurrentes con pesos compartidos y para desarrolladores que necesitan un modelo de ~9B con soporte de tool calling y modo de razonamiento, con pesos en safetensors y GGUF y licencia Apache 2.0. No obstante, conviene tratarlo como un experimento de investigación: el autor es un particular, la información verificable es escasa, la model card contiene afirmaciones no comprobadas y los idiomas declarados son únicamente inglés y portugués.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con LoopSplit (recurrencia de capas medias); 32 bloques físicos, 64 capas lógicas |
| Parametros totales | 8.953.803.264 (según safetensors); la model card cita ~9,2 mil millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF, incluida Q5_K_M (~6,02 GB); bf16 (~17,9 GB) |
| Idiomas soportados | en, pt |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar en almacenamiento físico: 32 bloques (`blk.0` a `blk.31`) que cualquier runtime convencional (Transformers, vLLM estándar, llama.cpp por defecto) puede cargar. La innovación LoopSplit es lógica, no paramétrica. El prefijo (bloques 0-7) se ejecuta una vez; el tramo medio (bloques 8-23, 16 bloques) se ejecuta tres veces consecutivas con pesos compartidos, en tres pasadas etiquetadas como hipótesis, reflexión y síntesis; el sufijo (bloques 24-31) se ejecuta una vez. El resultado es una profundidad virtual de 64 capas (8 + 16×3 + 8) sin incremento de VRAM para pesos, ya que estos se aliasan en memoria mediante `TENSOR_DUPLICATED`. La caché KV, en cambio, debe asignar 64 posiciones, una por profundidad lógica, de modo que el coste de memoria de contexto sí crece.

Existen dos modos de operación. El modo nativo o destilado ejecuta una sola pasada de 32 capas y, según el autor, ya ofrece resultados sólidos porque el entrenamiento usó supervisión profunda sobre las etapas del bucle. El modo recurrente real de 64 capas requiere el parche incluido en `engine/llamacpp_patch/` o un motor LoopSplit nativo con `--override-kv qwen35.triple_loop=int:1`. En cuanto al entrenamiento, la Fase 1 consistió en 2.100 pasos de destilación (el autor menciona un modelo fuente Qwen3.8-27B, no verificable) y la Fase 2 en 30 pasos de RL con GRPO y R1-Zero, tamaño de grupo G=4, sobre una H100 SXM5 de 80 GB en Modal, con recompensas contrastivas sobre tool calling verificable y razonamiento de código. El autor reporta una deriva de pesos entre fases medida por similitud coseno por capas, sin que se disponga de los valores completos.

## Capacidades

- Generación de texto conversacional y razonamiento con cadena de pensamiento estructurada en etiquetas `<think>...</think>`.
- Tool calling y function calling con adherencia a esquema `<tool_call>` y encapsulación XML, reforzados explícitamente en la fase de RL.
- Razonamiento agéntico multi-paso y razonamiento contrastivo orientado a tareas de código y de sistemas distribuidos.
- Razonamiento de código y matemáticas, inferido del entrenamiento declarado con tareas verificables de código.
- Capacidad de «duda» intermedia: el bucle medio permite una pasada de reflexión que revisa la hipótesis inicial antes de sintetizar la respuesta.
- Multilingüismo limitado a inglés y portugués según los metadatos; no se declara soporte de castellano.
- No se declaran capacidades de visión, audio ni modalidad distinta de texto.

## Casos de uso

- Agentes con tool calling en producción: el ajuste de RL se centró en el cumplimiento estricto del esquema `<tool_call>`, lo que reduce errores de formato en pipelines que parsean llamadas a funciones de forma automática.
- Orquestación de agentes multi-paso: la pasada intermedia de reflexión permite revisar y corregir una hipótesis antes de emitir la respuesta final, útil en flujos donde el coste de un error es alto y la latencia no es crítica.
- Asistencia a la depuración de sistemas distribuidos: el autor documenta el comportamiento del modelo sobre una consulta ambigua de este dominio, con formación de hipótesis, detección de ambigüedad y síntesis de compromisos.
- Generación y revisión de código en pipelines de CI: con 9B parámetros en Q5_K_M (~6 GB) puede ejecutarse en una GPU de consumo para tareas de revisión, generación de tests y explicación de diffs.
- Investigación sobre recurrencia y profundidad efectiva: el checkpoint sirve como banco de pruebas para comparar el modo de 32 capas frente al de 64 capas lógicas y medir el efecto de la profundidad virtual en calidad y latencia.
- Despliegue en local o en el borde con llama.cpp y el parche LoopSplit: permite experimentar con el modo recurrente en hardware modesto, aceptando el mayor consumo de caché KV.
- Prototipado de asistentes en inglés o portugués: adecuado para demos y entornos de habla inglesa o brasileña, no para producto en castellano sin evaluación previa.

## Benchmarks y rendimiento

La model card menciona un 65,6 % de éxito en un benchmark no especificado y un 100 % de discriminación contrastiva de grupo, sin detallar el conjunto de evaluación ni el protocolo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Métrica | Resultado | Contexto |
|---|---|---|
| Benchmark de éxito (sin especificar) | 65,6 % | Reportado por el autor tras 30 pasos de RL |
| Discriminación contrastiva de grupo | 100 % | Métrica interna de entrenamiento |
| MMLU, HumanEval, GSM8K | no disponible | Sin datos publicados |

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 17,9 GB en bf16 y unos 6,02 GB en GGUF Q5_K_M para los pesos; el modo recurrente de 64 capas añade memoria de caché KV proporcional al contexto y a 64 posiciones lógicas.
- GPU recomendadas: H100 SXM5 de 80 GB para entrenamiento (la usada por el autor); A100 40/80 GB para inferencia en bf16 con contexto amplio; RTX 4090 (24 GB) para bf16 ajustado o cuantizaciones de 8 bits.
- GPU de consumo: sí cabe en RTX 4090 y RTX 3090 en bf16; en GPUs de 8-12 GB es viable con GGUF Q5_K_M o cuantizaciones menores, con menor margen para contexto largo.
- Despliegue: Transformers y vLLM estándar en modo de 32 capas; llama.cpp con el parche `engine/llamacpp_patch/` para el modo recurrente de 64 capas; Ollama y TGI no están confirmados para el modo recurrente.
- Latencia y throughput: no disponibles. Cabe esperar que el modo de 64 capas triplique el coste de cómputo del tramo medio respecto al modo nativo, aunque no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B Triple-Loop (este) | 8,95B (32 bloques, 64 capas lógicas) | no disponible | Apache 2.0 | Recurrencia LoopSplit y RL de 30 pasos; idiomas en, pt |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | Apache 2.0 | Sin recurrencia ni RL específico de tool calling; referencia directa |
| Alternativas de ~9B de la familia Qwen | no disponible | no disponible | Apache 2.0 en la mayoría | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Modelo publicado por un autor individual: no hay revisión por pares, informe técnico ni evaluación independiente que respalde las afirmaciones de la model card.
- El autor reconoce que la Fase 2 son solo 30 pasos de optimizador; el efecto real del RL sobre la calidad general es incierto y podría ser marginal.
- El benchmark del 65,6 % no especifica conjunto de evaluación, tamaño de muestra ni protocolo, por lo que no es comparable con resultados publicados.
- La referencia a un modelo fuente «Qwen3.8-27B» en la Fase 1 no es verificable y resulta inconsistente con el ecosistema público conocido.
- Idiomas declarados únicamente inglés y portugués: no hay evidencia de competencia en castellano; no usarlo en producción en español sin evaluación propia.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo.
- El modo recurrente de 64 capas requiere un parche de llama.cpp o un motor específico; fuera de ese entorno se ejecuta el modo de 32 capas, con comportamiento distinto al publicitado.
- La caché KV del modo recurrente ocupa 64 posiciones lógicas, lo que aumenta el consumo de memoria con contextos largos.
- Riesgo de alucinación y de sobreajuste a formatos XML concretos (`<think>`, `<tool_call>`), que puede degradar respuestas en dominios fuera de distribución.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de evaluación rigurosa desaconseja desplegarlo sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lordnyx/qwen3.5-9b-triple-loop-fase1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Modal (plataforma de cómputo usada en el entrenamiento): https://modal.com
- Paper, blog o repositorio adicionales: no disponible
