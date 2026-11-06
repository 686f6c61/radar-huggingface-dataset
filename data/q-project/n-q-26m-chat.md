# q-project/N-Q-26M-Chat

## Resumen

N-Q-26M-Chat es un modelo conversacional bilingüe ruso/inglés de tamaño muy pequeño (26M de parámetros de red más 16.8M en forma de embedding n-gram, unos 46.45M de parámetros totales según los safetensors) desarrollado por el Q Project como parte de una escalera de modelos minúsculos entrenados desde cero en una única V100 de 16 GB. Es un fine-tuning chat del modelo base q-project/N-Q-26M, inspirado en el proyecto MiniMind, y su pipeline completo (tokenizador, preentrenamiento, SFT, razonamiento, LoRA, DPO, GRPO/PPO, RL agéntico y destilación) está implementado en PyTorch legible.

Su propuesta diferencial no es el razonamiento general —que a este tamaño es prácticamente inexistente (GSM8K ≈ 2 %)— sino los **circuitos exactos**: el modelo emite llamadas `<CALC>expr<EQ>` que un ejecutor determinista resuelve con precisión (aritmética, fechas, unidades, ordenación) y el modelo continúa a partir del resultado exacto. En un sondeo fijo de 16 tareas de tool calling (8 en ruso y 8 en inglés) acierta 15/16 en decodificación greedy.

Es relevante como demostración de investigación: arquitectura Gated DeltaNet con atención gated en proporción 3:1, seleccionada mediante ablación frente a dos candidatos alternativos, y un ejemplo honesto de cómo evaluar correctamente capacidades de modelos diminutos (incluyendo la corrección pública de un bug de puntuación que inflaba GSM8K a 16–20 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet (atención lineal) + gated attention en proporción 3:1, Gated Residual, embedding n-gram, optimizador Muon |
| Parametros totales | 46.452.571 (safetensors); 29.7M de red + 16.8M de embedding n-gram |
| Parametros activos | no disponible (no se declara MoE; toda la red está activa) |
| Longitud de contexto | no disponible (el tokenizador tiene 8.256 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; además contenedor de un solo archivo QPACK1 (`model.qpack`) |

## Arquitectura y entrenamiento

La arquitectura es un modelo causal híbrido que combina capas de atención lineal Gated DeltaNet (con estado recurrente) con capas de atención estándar con KV cache en proporción 3:1, más Gated Residual y embeddings n-gram. La elección no fue arbitraria: se entrenaron tres candidatos en condiciones idénticas (26M de parámetros, 0.5B de tokens, mismos datos y planificación) y el candidato B (mini Qwen3.8-Flash-Next con Gated DeltaNet) ganó con una pérdida held-out media de 2.616 frente a 3.061 del diseño Q-164M (pesos ternarios, vocabulario de huella de 512 bits, GQA) y 2.990 de la variante B con pesos ternarios. El throughput en V100 fue de ~19k tokens/s en eager, subiendo a ~85k tokens/s con `torch.compile`.

Los datos de preentrenamiento combinan HuggingFaceFW/fineweb-edu, deepvk/cultura_ru_edu y wikimedia/wikipedia. El post-entrenamiento incluye SFT con HuggingFaceTB/smoltalk, Vikhrmodels/GrandMaster-PRO-MAX e IlyaGusev/saiga_scored; razonamiento con attn-signs/russian-reasoning; y alineación por preferencias con IlyaGusev/saiga_preferences y HuggingFaceH4/ultrafeedback_binarized mediante DPO. Se probaron GRPO, PPO y RL agéntico sobre este checkpoint, pero los resultados en GSM8K se movieron dentro del ruido (±0.6 pp), de modo que el modelo publicado es el checkpoint DPO. Los circuitos exactos son un mecanismo determinista externo: el modelo genera la expresión y un ejecutor escribe el resultado exacto tras `<EQ>`, continuando la generación desde ahí. El modelo incorpora un `generate()` propio que mantiene el estado recurrente de Gated DeltaNet junto al KV cache de las capas de atención.

## Capacidades

- Generación de texto conversacional en ruso e inglés con formato fluido de chat.
- Tool calling exacto mediante circuitos deterministas: aritmética, fechas, unidades y ordenación se calculan sin errores numéricos (15/16 en el sondeo fijo de 16 tareas, greedy).
- Modo thinking opcional: `apply_chat_template(..., enable_thinking=True)` abre un bloque `<THINK>`; si no se especifica, el modelo decide por sí mismo.
- Generación con muestreo configurable: `temperature`, `top_p`, `top_k`, `repetition_penalty`, `max_new_tokens` y `stop_ids` (por defecto `<EOT>` y `<eos>`).
- Razonamiento multi-paso: esencialmente no resuelto a este tamaño (GSM8K ≈ 2 %), aunque el modelo llama correctamente a la calculadora.
- No hay evidencia de capacidades de visión, audio ni agentes multi-step funcionales.

## Casos de uso

- **Investigación en arquitecturas de atención lineal:** su pipeline completo en PyTorch legible y la ablación documentada lo hacen ideal como base reproducible para experimentar con Gated DeltaNet y comparar diseños a escala mínima.
- **Demostración de tool calling determinista:** los circuitos exactos permiten estudiar cómo separar el cálculo simbólico de la generación neuronal, garantizando resultados exactos en aritmética y fechas.
- **Prototipado educativo de pipelines completos:** cubre tokenizador, preentrenamiento, SFT, DPO y RL en un flujo entrenable en una sola V100 de 16 GB, útil para docencia y aprendizaje.
- **Asistentes conversacionales sencillos en ruso:** puede mantener diálogos fluidos en ruso e inglés para demos o pruebas de interfaz donde la exactitud factual no es crítica.
- **Cálculo exacto embebido en chat:** gracias al ejecutor externo, puede responder preguntas aritméticas y de fechas con precisión total si se usa `tokenizer=tok` para activar los circuitos.
- **Benchmark de honestidad en evaluación:** sirve como caso de estudio sobre errores de evaluación (el bug de subcadena en GSM8K) y sobre el señal débil del RL en modelos muy pequeños.
- **Despliegue en hardware mínimo:** con 0.3 GB de repo, cabe en CPU o GPUs de consumo para experimentación local sin requisitos de VRAM significativos.

## Benchmarks y rendimiento

Datos publicados por el autor (no comparables entre tokenizadores distintos):

| Prueba | Resultado | Nota |
|---|---|---|
| Sondeo fijo de tool calling (16 tareas, 8 RU + 8 EN, greedy) | 15/16 | El fallo: la fecha se calcula bien pero el modelo la redacta mal en la frase |
| GSM8K test, número final exacto (500 EN / 500 RU, thinking on) | 2.0 % / 2.2 % | Esencialmente no resuelto |
| GSM8K tras GRPO | 2.2 % / 2.0 % | Dentro del ruido (±0.6 pp) |
| GSM8K tras RL agéntico | 1.6 % / 1.4 % | Dentro del ruido |
| Pérdida held-out del base (EN / RU-edu / RU-wiki) | 2.381 / 2.651 / 2.323 | Perplejidad 10.8 / 14.2 / 10.2 |
| Throughput V100 (eager / torch.compile) | ~19k / ~85k tok/s | Del candidato arquitectónico ganador |

No se han publicado comparaciones con otros modelos en MMLU, HumanEval u otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; dado el tamaño del repo (0.3 GB), cualquier GPU con 2-4 GB de VRAM o incluso CPU es suficiente en principio.
- GPU recomendadas: no disponible; el entrenamiento se realizó en una NVIDIA V100 de 16 GB.
- Cabe con holgura en GPUs de consumo (RTX 3060, RTX 4090, etc.) y presumiblemente en CPU.
- Despliegue: mediante la librería `transformers` de Hugging Face con `trust_remote_code=True`. No se mencionan soportes para vLLM, llama.cpp, Ollama o TGI; la arquitectura personalizada requiere código remoto. Existe además el formato empaquetado de un solo archivo QPACK1 (`model.qpack`).
- Latencia y throughput estimados: no disponibles para inferencia; en entrenamiento, ~19k tok/s en eager y ~85k tok/s con `torch.compile` en V100.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| N-Q-26M-Chat | 46.45M (29.7M + 16.8M n-gram) | Gated DeltaNet + gated attention | no disponible | Apache 2.0 | Tool calling exacto, ru/en, entrenado en 1 V100 |
| Q-164M (q-project) | 164M (clase) | Pesos ternarios, vocabulario fingerprint 512-bit, GQA | no disponible | no disponible | Rung superior de la misma escalera; peor loss en la ablación (3.061) |
| MiniMind (referencia) | ~26M clase (según rung) | Transformer estándar | no disponible | no disponible | Proyecto que inspira la escalera N-Q; pipeline comparable |

No hay comparativas numéricas directas publicadas contra estos modelos en la información disponible.

## Limitaciones y advertencias

- **Fallos factuales masivos:** a 26M de parámetros el modelo es fluido en forma pero frecuentemente incorrecto en contenido; el propio autor lo califica como release de investigación, no producto.
- **Sin razonamiento multi-paso:** GSM8K ≈ 2 %; llama a la calculadora correctamente pero no planifica soluciones.
- **Repetición bajo decodificación greedy:** comportamiento conocido a este tamaño.
- **Dependencia del ejecutor:** sin pasar `tokenizer=tok` a `generate()`, los circuitos exactos no se activan y el modelo "calcula" por sí mismo, con resultados habitualmente erróneos (ejemplo documentado: `4821*37 → 104621` en lugar de 178377).
- **Thinking forzado fuera de distribución:** `enable_thinking=False` no produce respuestas sin bloque `<THINK>` porque los datos SFT nunca contuvieron bloques vacíos; forzarlo es out-of-distribution.
- **Contexto y cuantización sin documentar:** no hay datos publicados de longitud de contexto máxima ni de cuantizaciones soportadas.
- **Código personalizado:** requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio y puede complicar la integración con stacks de inferencia estándar.
- **Licencia:** Apache 2.0, sin restricciones para uso comercial.
- **Idiomas limitados:** solo ruso e inglés; el sesgo de los datos de entrenamiento (web educativa en ruso e inglés) no está caracterizado en detalle.

## Enlaces

- Modelo: https://huggingface.co/q-project/N-Q-26M-Chat
- Modelo base: https://huggingface.co/q-project/N-Q-26M
- Modelo hermano Q-164M: https://huggingface.co/q-project/Q-164M
- Proyecto Q (organización): https://huggingface.co/q-project
- MiniMind (proyecto de referencia): https://jingyaogong.github.io/minimind/
- Datasets de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu, https://huggingface.co/datasets/deepvk/cultura_ru_edu, https://huggingface.co/datasets/wikimedia/wikipedia, https://huggingface.co/datasets/HuggingFaceTB/smoltalk, https://huggingface.co/datasets/Vikhrmodels/GrandMaster-PRO-MAX, https://huggingface.co/datasets/IlyaGusev/saiga_scored, https://huggingface.co/datasets/attn-signs/russian-reasoning, https://huggingface.co/datasets/IlyaGusev/saiga_preferences, https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
