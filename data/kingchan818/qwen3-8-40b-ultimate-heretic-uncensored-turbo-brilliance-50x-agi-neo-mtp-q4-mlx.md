# kingchan818/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-MTP-Q4-mlx

## Resumen

Este repositorio contiene una conversión a formato MLX del modelo Qwen3.8-40B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO, un modelo de lenguaje de aproximadamente 39.500 millones de parámetros derivado de la familia Qwen 3.5 y publicado originalmente por DavidAU en formato GGUF. La conversión, realizada por el usuario kingchan818, preserva la cabeza nativa de Multi-Token Prediction (MTP) del modelo original, lo que permite decodificación especulativa y aceleraciones de entre 1,39x y 1,54x en hardware Apple Silicon. El modelo está cuantizado en 4 bits mixto (4-bit / 6-bit affine, group size 32) y ocupa unos 26,6 GB en el repositorio.

El modelo es relevante para desarrolladores que trabajan en el ecosistema Apple MLX y quieren ejecutar un modelo de ~40B con contexto largo y capacidades de razonamiento en hardware de consumo o estaciones de trabajo Mac. Al mantener la cabeza MTP, se diferencia de las conversiones MLX convencionales, que descartan esos pesos. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque la naturaleza "uncensored" del modelo base implica consideraciones adicionales de despliegue.

La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es limitada: la model card se centra en el proceso de conversión y validación del MTP, no en las capacidades del modelo base. Esta ficha refleja únicamente los datos verificables del repositorio y de la model card, indicando explícitamente cuando un dato no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal híbrida (Gated DeltaNet) y cabeza MTP; familia Qwen 3.5 (qwen3_5) |
| Parametros totales | 39.497.296.128 (~39,5B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit / 6-bit affine mixto, group size 32 (códigos Q4_K_M reexpresados, no recuantizados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), ~26,6 GB en repo, ~25 GB de pesos |
| Capas | 96 + 1 capa MTP |
| Cabeza MTP | Sí, 1 capa MTP nativa preservada |
| Modalidad | Solo texto (sin torre de visión / mmproj) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen 3.5, con 96 capas transformer y una capa adicional de Multi-Token Prediction. La model card menciona atención lineal con Gated DeltaNet, con un número de cabezas de clave (16) distinto del de cabezas de valor (48), lo que obliga a reordenar las cabezas V en la conversión. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base; esos datos corresponden a la model card de DavidAU, no incluida en la información proporcionada.

La innovación técnica destacable de esta conversión es la preservación y el cableado correcto de la cabeza MTP. llama.cpp almacena la capa MTP como un bloque extra (`blk.96`, `nextn.*`), que se remapea a los nombres HF `mtp.*` (`eh_proj→fc`, `enorm→pre_fc_norm_embedding`, `hnorm→pre_fc_norm_hidden`, `shared_head_norm→norm`) con `num_hidden_layers=96` y `mtp_num_hidden_layers=1`. Además, se invierte la permutación de las cabezas V de la atención lineal (de orden agrupado a orden entrelazado) en `in_proj_qkv`, `in_proj_z`, `in_proj_a/b`, `A_log`, `dt_bias`, `conv1d` y `out_proj`, verificado como exacto incluso sobre pesos cuantizados empaquetados. La conversión se hizo con gguf2mlx (`--quant-source preserve`).

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento con modo "thinking" (la model card indica respuestas coherentes con y sin thinking).
- Decodificación especulativa nativa mediante la cabeza MTP, con aceleración de 1,39x a 1,54x.
- Compatibilidad con `mlx-lm` estándar y LM Studio (ignorando los pesos MTP).
- Servidor HTTP mediante `mlx_lm.server`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Visión: no soportada (la torre de visión / mmproj no está incluida).

## Casos de uso

- Inferencia local en Apple Silicon: el modelo se ejecuta en `mlx-lm` y LM Studio sobre Macs con memoria unificada suficiente, aprovechando el formato MLX nativo y los ~25 GB de pesos para despliegues de escritorio sin GPU dedicada.
- Aceleración de generación con MTP: en tareas de código o texto estructurado, donde la tasa de aceptación de borradores es alta (94,3% en el prompt de Fibonacci), se obtiene hasta 1,54x de velocidad manteniendo salida idéntica a la versión sin MTP.
- Servicio de chat autoalojado: con `mlx_lm.server --mtp` se puede exponer un endpoint compatible con la API de chat para prototipos y aplicaciones internas en una estación Mac.
- Generación de código asistida: el modelo responde a prompts de código (validado con un prompt de Fibonacci) y puede integrarse en flujos de autocompletado o generación de fragmentos en local.
- Experimentación con decodificación especulativa: sirve como banco de pruebas para evaluar la cabeza MTP y el fork `feat/mtp-native` de mlx-lm en distintos prompts y longitudes de salida.
- Investigación sobre modelos "uncensored": útil para estudiar el comportamiento de modelos sin alineación restrictiva en entornos controlados, con la advertencia de que requiere revisión de seguridad antes de cualquier exposición pública.
- Despliegue en pipelines de CI para pruebas de regresión de calidad: la salida determinista en modo greedy permite comparar respuestas entre versiones del modelo o del runtime.

## Benchmarks y rendimiento

La model card solo aporta validación de la decodificación MTP en Apple M5 Max, greedy, 300 tokens:

| Prompt | MTP top-1 (t+2) | Borradores aceptados | Salida idéntica a no-MTP | Velocidad |
|---|---|---|---|---|
| Sky is blue | 77,7% | 42,0% | sí | 18,8 → 26,2 tok/s (1,39x) |
| Fibonacci code | 94,3% | 48,7% | sí | 19,0 → 29,3 tok/s (1,54x) |
| Planets | 86,0% | 45,3% | sí | 19,0 → 27,9 tok/s (1,47x) |

Control: con el peso `fc` del MTP puesto a cero, la precisión top-1 cae al 0,0%, lo que confirma que la cabeza está entrenada y correctamente cableada. Sanity check: "The capital of France is" → " Paris" (p=0,74). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: ~25 GB de pesos en 4/6-bit; se recomienda al menos 32 GB de memoria unificada en Apple Silicon para dejar margen al contexto y a la caché KV.
- GPU recomendadas: Apple M5 Max (validado); previsiblemente M3/M4 Max y Ultra con ≥48 GB por su mayor ancho de banda. No hay datos de rendimiento en GPU NVIDIA/AMD para este formato MLX.
- Cabe en GPU de consumo: en el ecosistema Apple, sí en chips Max/Ultra con memoria unificada suficiente; no aplica a GPUs dedicadas por el formato MLX.
- Opciones de despliegue: `mlx-lm` estándar (ignora MTP), LM Studio, `mlx_lm.server`; para MTP nativo se requiere el fork `mlx-lm @ git+https://github.com/AirRunner/mlx-lm@feat/mtp-native` (PR ml-explore/mlx-lm#990).
- Latencia y throughput: 18,8–19,0 tok/s sin MTP y 26,2–29,3 tok/s con MTP en M5 Max, según los tres prompts validados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (MTP Q4 MLX) | ~39,5B | no disponible | MLX safetensors 4/6-bit | Apache 2.0 | MTP nativo, solo texto, ecosistema Apple |
| DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF | ~39,5B | no disponible | GGUF (Q4_K_M) | Apache 2.0 (según repo base) | Modelo origen; sin MTP acelerado en MLX |
| DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored | ~39,5B | no disponible | safetensors | Apache 2.0 (según repo base) | Base sin cuantizar ni turbo |
| Conversiones MLX estándar de Qwen 3.5 ~40B | ~40B | no disponible | MLX | según modelo | Sin cabeza MTP; menor velocidad en decodificación |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": el modelo base está diseñado sin las restricciones de alineación habituales, lo que aumenta el riesgo de generar contenido inapropiado, peligroso o sesgado; requiere filtros y revisión antes de cualquier uso público.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; la validación se limita a sanity checks puntuales.
- Contexto e idiomas: la longitud de contexto y los idiomas soportados no están documentados en la información disponible.
- Solo texto: la torre de visión no está incluida, por lo que no admite entradas multimodales.
- MTP no soportado en `mlx-lm` estable: para aprovechar la aceleración hay que usar un fork no oficial (PR #990), con el riesgo de mantenimiento que ello implica.
- Requiere hardware Apple Silicon para el formato MLX; no es portable directamente a GPUs NVIDIA/AMD sin reconversión.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado por un modelo sin alineación recae en el desplegador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni garantías de mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingchan818/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-MTP-Q4-mlx
- Modelo base (GGUF): https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Modelo base (safetensors): https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored
- Herramienta de conversión gguf2mlx: https://github.com/barrontang/gguf2mlx
- Fork de mlx-lm con MTP nativo: https://github.com/AirRunner/mlx-lm/tree/feat/mtp-native
- PR de mlx-lm para MTP: https://github.com/ml-explore/mlx-lm/pull/990
