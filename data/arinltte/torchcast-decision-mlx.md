# arinltte/torchcast-decision-MLX

## Resumen

Torchcast Decision 4B — MLX (BF16) es una conversión al formato MLX del modelo `torchcast-ai/torchcast-decision-4b`, un modelo derivado de Qwen3.5-4B especializado en la emisión de decisiones tipadas (*typed decisions*) en lugar de generación de texto libre. Lo publica el usuario `arinltte` y está pensado para ejecutarse en Apple Silicon mediante la librería MLX. El modelo no genera texto: realiza un único forward pass y la respuesta se lee directamente del token de letra asociado a la última posición del prompt.

La arquitectura subyacente es un transformer híbrido de Qwen3.5 con 24 capas Gated-DeltaNet (atención lineal) y 8 capas de atención completa, con 4.841.448.960 parámetros totales según los pesos safetensors. La conversión a MLX descarta la torre visual del checkpoint original (aproximadamente 0,33 B de parámetros, un 6 % del total), de modo que esta variante solo procesa texto; las decisiones sobre texto no se ven afectadas.

Su relevancia es acotada pero específica: sirve como referencia de despliegue en local de un modelo de decisión probabilística sobre Apple Silicon, con métricas publicadas sobre el conjunto `LocalLLaMA/typed-decisions` (2000 decisiones) y variantes cuantizadas a 8 y 4 bits que igualan o superan ligeramente al BF16 en precisión. La licencia Apache 2.0 facilita su uso comercial, aunque el ecosistema de tooling (el paquete `torchcast_decision`) es imprescindible para reproducir el comportamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 24 capas Gated-DeltaNet + 8 capas de atención completa |
| Parámetros totales | 4.841.448.960 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (este repo), 8-bit y 4-bit (repos hermanos) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B en su variante híbrida: 24 capas con Gated-DeltaNet (atención lineal con estado recurrente) intercaladas con 8 capas de atención completa, lo que reduce el coste computacional y de memoria frente a un transformer denso equivalente. El checkpoint original es un modelo visión-lenguaje (`Qwen3_5ForConditionalGeneration`), pero la conversión con `mlx_lm.convert` elimina silenciosamente los parámetros `model.visual.*` (0,33 B, ~6 % del total) porque MLX-LM no implementa la torre visual de Qwen3.5.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. La innovación operativa del modelo es el modo de decisión: no decodifica texto, sino que ejecuta un forward pass con atención **no causal** y lee la letra de respuesta desde el token final del prompt, con temperatura 0,9 y un parámetro `noul_floor` de 0,801 definidos en `decision_config.json`. Este modo de atención no lo aplica la generación estándar de MLX-LM, por lo que se requiere un arnés propio (`scripts/mlx_decide.py`, `scripts/bench.py`).

## Capacidades

- Emisión de decisiones tipadas: selecciona una letra de respuesta entre las opciones presentadas en el prompt (formato de elección múltiple).
- Salida probabilística calibrada: el modelo produce una distribución sobre las letras, evaluable con accuracy, KL, Brier y ECE.
- Procesamiento de texto en inglés; sin soporte de visión en esta variante MLX.
- Ejecución en Apple Silicon mediante MLX (BF16, 8-bit y 4-bit).
- No soporta generación de texto libre: `--max-tokens 0` en `mlx_lm generate` es la única ruta de texto válida.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Clasificación de evidencia en pipelines de decisión: dado un prompt con opciones y evidencia textual, el modelo devuelve una distribución sobre las letras candidatas, útil para sistemas que necesitan probabilidades calibradas en lugar de texto generado.
- Evaluación de calibración en producción: las métricas ECE y Brier publicadas (0,0645 y 0,1405 en BF16) permiten usar el modelo como componente de decisión donde importa la fiabilidad de la probabilidad, no solo el acierto.
- Prototipado local en Mac: con 9,68 GB en BF16 y 5,09 GB en 4-bit, cabe en un Mac con Apple Silicon y permite iterar sin GPU dedicada.
- Selección entre alternativas en sistemas de enrutamiento: el modelo puede elegir entre opciones predefinidas (por ejemplo, categorías de tickets o rutas de procesamiento) leyendo la letra ganadora del último token.
- Benchmark de referencia para modelos de decisión: el conjunto `typed-decisions` y el arnés `scripts/bench.py` permiten comparar variantes cuantizadas (BF16, 8-bit, 4-bit) con la misma función de scoring.
- Investigación sobre atención no causal en modelos híbridos: la implementación de `mask=None` sobre capas Gated-DeltaNet y de atención completa sirve como base para estudiar el efecto del modo de atención en tareas de clasificación.
- Despliegue de bajo consumo en entornos Apple: la variante 4-bit (5,09 GB) es la más adecuada cuando la memoria unificada es limitada, con accuracy 0,7245 y ECE 0,0480, la mejor calibración de las tres.

## Benchmarks y rendimiento

Evaluado sobre el split `test` de `LocalLLaMA/typed-decisions` (400 casos × 5 preguntas = 2000 decisiones) con la función de scoring del propio benchmark:

| Variante | Accuracy ↑ | KL ↓ | Brier ↓ | ECE ↓ | Tamaño |
|---|---|---|---|---|---|
| BF16 (este repo) | 0,7185 | 0,2884 | 0,1405 | 0,0645 | 9,68 GB |
| 8-bit | 0,7190 | 0,2907 | 0,1415 | 0,0635 | 6,69 GB |
| 4-bit | 0,7245 | 0,2783 | 0,1342 | 0,0480 | 5,09 GB |

Referencias del leaderboard: Prior = 0,470; Uniform = 0,308. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 9,68 GB en BF16, 6,69 GB en 8-bit y 5,09 GB en 4-bit (tamaños de repo publicados).
- Hardware objetivo: Apple Silicon (MLX); no se documenta soporte para CUDA.
- GPU recomendadas: no disponible para CUDA; en Apple Silicon, se requiere memoria unificada suficiente para el tamaño de la variante elegida.
- Cabe en GPU de consumo: no disponible para NVIDIA; en Mac, las tres variantes caben en equipos con memoria unificada de 16 GB o superior (la de 4-bit con margen amplio).
- Opciones de despliegue: MLX (`mlx_lm`), con arnés propio para el modo de decisión; no se documenta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Torchcast Decision 4B — MLX (BF16) | 4,84 B | no disponible | Apache 2.0 | safetensors (MLX) | Solo texto; decisión tipada; accuracy 0,7185 |
| Torchcast Decision 4B — MLX 4-bit | 4,84 B | no disponible | Apache 2.0 | safetensors (MLX) | Accuracy 0,7245; ECE 0,0480; 5,09 GB |
| torchcast-ai/torchcast-decision-4b | no disponible | no disponible | Apache 2.0 | safetensors | Checkpoint original con torre visual (Qwen3.5 VL) |

No se dispone de información sobre otros modelos comparables de la misma categoría (decisión tipada) en la documentación proporcionada.

## Limitaciones y advertencias

- Sin visión: la torre visual fue descartada en la conversión; para entradas de imagen hay que usar el checkpoint original.
- No genera texto: cualquier uso que espere decodificación autoregresiva fallará; requiere el paquete `torchcast_decision` para el renderizado de prompts y la lectura de letras.
- Atención no causal: la generación estándar de MLX-LM no aplica este modo, por lo que se necesita un arnés propio para reproducir resultados.
- Solo inglés: el modelo está etiquetado únicamente para `en`.
- Riesgo de alucinación: no evaluado en la información disponible; el modelo emite distribuciones sobre letras, no texto verificable.
- Sesgos: no documentados en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5 y del checkpoint original.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; el repo se creó y actualizó el 2026-11-15, sin evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/arinltte/torchcast-decision-MLX
- Variante 8-bit: https://huggingface.co/arinltte/torchcast-decision-MLX-8bit
- Variante 4-bit: https://huggingface.co/arinltte/torchcast-decision-MLX-4bit
- Modelo base: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Dataset de benchmark: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
