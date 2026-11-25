# GYYYYYUUUUU/smollm2-1.7b-mux-flow-multiplex-nl-mixbeta05-local3-public

## Resumen

SmolLM2-1.7B `mux-flow-multiplex` es un checkpoint de razonamiento continuo construido sobre el modelo base `HuggingFaceTB/SmolLM2-1.7B` de Hugging Face. Lo publica el usuario `GYYYYYUUUUU` y emplea el método `mux-flow-multiplex` del repositorio de código `dlm-cot`: se trata de una destilación de la distribución de racionales combinada con un mixup dentro de la misma consulta que se proyecta sobre un flujo condicionado por la query. El resultado no es un modelo `transformers` convencional, sino un artefacto compuesto por un adaptador LoRA de razonamiento y una cabeza de velocidad con embedding temporal.

La innovación principal es que las respuestas no se generan token a token a partir de un razonamiento textual, sino que se decodifican desde un contexto latente generado por un flujo (flow matching) con 6 ranuras latentes y 6 pasos de Euler. Cada muestra dibuja un racional nuevo, lo que explica la brecha entre pass@1 y pass@512 en las evaluaciones publicadas. El entrenamiento se hizo con LoRA sobre 4 GPU RTX 5090 durante 10.000 pasos con batch global de 64.

Es un modelo de nicho, orientado a investigación en razonamiento latente y cadenas de pensamiento continuas, no a producción general. Su relevancia radica en demostrar que se puede destilar la distribución de racionales en un espacio latente y decodificar respuestas con un decoder SFT congelado, manteniendo el modelo base intacto y publicando solo el adaptador y la cabeza del flujo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-1.7B) + adaptador LoRA de razonamiento + cabeza de flujo (velocity head) con embedding temporal; 6 ranuras latentes, 6 pasos de Euler |
| Parametros totales | 1.700 millones (modelo base); el adaptador LoRA y la cabeza del reasoner se suman sobre esa base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el artefacto se distribuye en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el dataset de entrenamiento es `clean-gsm8k-aug-nl-multiplexing`, con trazas en neerlandés según el sufijo `-nl`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`reasoning_adapter/`, `reasoner.safetensors`); `final/model.safetensors` no se sube y debe descargarse del checkpoint warm-start `cs-giung/smollm2-1.7b-lora-think-sft-ar-clean-gsm8k-aug-nl` (rev `b705977`) |

## Arquitectura y entrenamiento

El modelo parte de `HuggingFaceTB/SmolLM2-1.7B`, un transformer decoder-only de 1.700 millones de parámetros, y se calienta con un SFT-CoT en neerlandés (`cs-giung/smollm2-1.7b-lora-think-sft-ar-clean-gsm8k-aug-nl`, revisión `b705977`). Sobre esa base se entrena el método `mux-flow-multiplex`: destilación de la distribución de racionales con mixup dentro de la misma consulta, proyectada sobre un flujo condicionado por la query. El flujo opera con 6 ranuras latentes y 6 pasos de Euler, y las respuestas se decodifican mediante el decoder SFT congelado a partir del contexto latente generado.

Los datos de entrenamiento son `clean-gsm8k-aug-nl-multiplexing`, con 16,46 millones de filas que combinan trazas individuales y pares de trazas dentro de la misma consulta. El peso del mixup sigue una distribución Beta(0,5, 0,5), y los pesos de pérdida son 1,0 : 3,0 : 1,0 para respuesta, local y flujo respectivamente. Se entrenó con LoRA (r=128, α=32, dropout 0,1), LR 1e-3 (LoRA-B 4e-3), schedule WSD con warmup 40 y decaimiento 1-sqrt en el último 20%, durante 10.000 pasos con batch global de 64 (16 por dispositivo en 4 GPU RTX 5090). El checkpoint publicado solo contiene el adaptador de razonamiento y la cabeza del reasoner; los pesos base son byte-idénticos al warm-start (SHA-256 `e6660585...`).

## Capacidades

- Razonamiento aritmético y matemático de varios pasos sobre problemas tipo GSM8K, SVAMP, MultiArith, GSM-Hard, MATH-500, TAL y Gaokao.
- Generación de racionales latentes continuos mediante flow matching, con muestreo estocástico (cada muestra produce un racional distinto).
- Decodificación de respuestas a partir de contexto latente mediante un decoder SFT congelado.
- Modo de evaluación con pass@k y maj@k sobre múltiples semillas de muestreo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso orquestado más allá del flujo latente.
- Capacidades multilingües: no disponibles; el entrenamiento se realizó sobre datos en neerlandés (`-nl`).
- Capacidades especiales: razonamiento latente continuo (continuous chain-of-thought), no un modo "thinking" textual al uso.

## Casos de uso

- Investigación en razonamiento latente: el modelo sirve para estudiar cómo se comporta la destilación de distribuciones de racionales en un espacio continuo, comparando pass@1 frente a pass@512 y maj@512 en tareas aritméticas.
- Evaluación de métodos de flow matching aplicados a LLM: permite reproducir el pipeline `dlm-cot` con `dlm-lm-eval` sobre GSM8K aumentado y medir la varianza entre semillas.
- Generación de múltiples racionales por consulta: al muestrear el flujo, cada ejecución produce una traza distinta, útil para análisis de diversidad de razonamiento y para técnicas de voto mayoritario (maj@k).
- Benchmarking de decodificación especulativa latente: el decoder SFT congelado sobre contexto latente se puede comparar con decodificación autoregresiva estándar en coste y precisión.
- Estudio de adaptadores LoRA de razonamiento: el adaptador `reasoning_adapter/` se puede analizar de forma aislada para entender qué aprende la LoRA frente a la cabeza del flujo.
- Reproducción de experimentos académicos: el artefacto incluye configuración, tokenizer y marcador de finalización, lo que facilita replicar las evaluaciones publicadas con las mismas semillas.

## Benchmarks y rendimiento

Resultados publicados en la model card (pass@k en %, n = 512 muestras por pregunta, temperatura de respuesta 0,7; media ± desviación estándar sobre las semillas de evaluación indicadas):

| Tarea | Preguntas | Semillas | pass@1 | pass@64 | pass@512 | maj@512 |
|---|---|---|---|---|---|---|
| GSM-Valid | 500 | 0 | 19,6 | 70,0 | 86,6 | 21,6 |
| GSM8K | 1319 | 0, 1, 2, 3 | 21,2 ± 0,0 | 71,3 ± 0,2 | 87,2 ± 0,4 | 24,4 ± 0,2 |
| SVAMP | 300 | 0 | 37,2 | 69,2 | 80,7 | 39,3 |
| MultiArith | 180 | 0 | 35,4 | 88,3 | 95,0 | 42,8 |
| GSM-Hard | 1319 | 0, 1, 2, 3 | 5,1 ± 0,0 | 18,7 ± 0,0 | 24,0 ± 0,3 | 6,2 ± 0,1 |
| MATH-500 | 500 | 0 | 3,9 | 39,7 | 56,0 | 6,8 |
| TAL | 834 | 0, 1 | 11,6 ± 0,1 | 46,9 ± 0,1 | 63,2 ± 0,1 | 13,8 ± 0,1 |
| Gaokao | 92 | 0, 1 | 3,8 ± 0,0 | 25,8 ± 0,3 | 33,7 ± 3,1 | 6,0 ± 0,8 |

No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 1.700 millones de parámetros; en fp16 requiere aproximadamente 3,4 GB solo para pesos, más el adaptador LoRA y la cabeza del flujo. No se documenta una estimación oficial de VRAM total.
- GPU recomendadas: el entrenamiento se realizó en 4× RTX 5090; para inferencia, una GPU consumer con al menos 8 GB de VRAM debería ser suficiente para el modelo base en fp16, aunque no se confirma en la documentación.
- Cabe en GPU consumer: sí, por tamaño del modelo base (1,7B), aunque la viabilidad real depende del código `dlm-cot` y del backend de decodificación (`--answer-backend vllm`).
- Opciones de despliegue: el modelo no es un `transformers` estándar; requiere el código `dlm-cot` y el comando `dlm-lm-eval` con backend vLLM para decodificar respuestas. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM2-1.7B `mux-flow-multiplex` (este) | 1,7B + LoRA + flow head | no disponible | Latente (flow matching, 6 slots, 6 pasos) | no disponible | Hugging Face, requiere `dlm-cot` |
| SmolLM2-1.7B (base) | 1,7B | no disponible en esta ficha | Autoregresivo estándar | no disponible en esta ficha | Hugging Face |
| `cs-giung/smollm2-1.7b-lora-think-sft-ar-clean-gsm8k-aug-nl` (warm-start) | 1,7B + LoRA | no disponible | CoT textual SFT en neerlandés | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo `transformers` estándar: requiere el código `dlm-cot` y restaurar manualmente `final/model.safetensors` desde el checkpoint warm-start; sin ese paso el artefacto está incompleto.
- El checkpoint publicado omite deliberadamente los pesos base (byte-idénticos al warm-start), lo que añade un paso de descarga y verificación SHA-256.
- Pass@1 bajo en todas las tareas (21,2 % en GSM8K, 3,9 % en MATH-500, 5,1 % en GSM-Hard): el modelo está pensado para muestreo masivo, no para una sola pasada.
- Gran brecha entre pass@1 y pass@512 (por ejemplo, 21,2 % frente a 87,2 % en GSM8K), lo que implica que el rendimiento práctico depende críticamente del número de muestras y del agregador (maj@k).
- Entrenado sobre datos en neerlandés (`-nl`); no se documentan capacidades multilingües ni su comportamiento en castellano.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Riesgo de alucinación y de razonamientos plausibles pero incorrectos, especialmente en GSM-Hard y Gaokao, donde el rendimiento es muy bajo.
- Sin soporte documentado de tool calling, agentes ni integración con pipelines de producción.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria ni informes independientes.
- El autor es un usuario individual (`GYYYYYUUUUU`), no un laboratorio con proceso de revisión; la reproducibilidad depende del código externo `dlm-cot`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GYYYYYUUUUU/smollm2-1.7b-mux-flow-multiplex-nl-mixbeta05-local3-public
- Repositorio de código `dlm-cot`: https://github.com/cs-giung/dlm-cot
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Checkpoint warm-start: https://huggingface.co/cs-giung/smollm2-1.7b-lora-think-sft-ar-clean-gsm8k-aug-nl (revisión `b705977606097de03c62b2304a69968f3bb1b3e0`)
