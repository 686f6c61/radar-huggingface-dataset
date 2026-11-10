# choyiny/yev2-35b-a3b

## Resumen

yev2-35b-a3b es un modelo de decisión de tipo "System One" construido por el desarrollador choyiny sobre el modelo base Qwen/Qwen3.6-35B-A3B, un transformer de mezcla de expertos (MoE) con aproximadamente 35.000 millones de parámetros totales y unos 3.000 millones activos por token. El modelo no genera texto libre: recibe un estado, una pregunta y entre 2 y 10 opciones, y devuelve una probabilidad calibrada por opción leída directamente de los logits de las letras A–J en un único forward pass.

La propuesta es relevante porque reduce una tarea de razonamiento y clasificación a una pasada de inferencia con salida probabilística calibrada (ECE de 0,058 en DecideBench v2.0), lo que lo hace apto para enrutado, desambiguación y toma de decisiones automatizada con latencias de décimas de segundo. Es la evolución de yev1-4b: mantiene la misma receta de entrenamiento y los mismos datos, pero cambia el modelo base por uno notablemente mayor.

El ajuste se realizó mediante LoRA (r 64, α 128) sobre las proyecciones de atención, atención lineal y expertos compartidos, con los expertos enrutados congelados. Los pesos fusionados en bf16 están en la raíz del repositorio y el adaptador LoRA en el subdirectorio `adapter/`. La licencia es Apache-2.0 y el modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas de atención lineal (familia Qwen3.6) |
| Parametros totales | 34.660.610.688 (≈34,7B) |
| Parametros activos | ≈3B por token |
| Longitud de contexto | 16.385 tokens (`--max-model-len 16385` en la receta de vLLM) |
| Tipos de cuantizacion | bf16 (repo principal); FP8 (checkpoint separado `choyiny/yev2-35b-a3b-fp8`) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pesos fusionados bf16 en la raíz; adaptador LoRA PEFT en `adapter/`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen3.6-35B-A3B: un transformer de mezcla de expertos con capas de atención lineal (linear attention) además de atención estándar, lo que explica la restricción operativa de vLLM de limitar `--max-num-seqs` a 64, ya que cada secuencia mantiene un bloque de estado recurrente. El ajuste es un LoRA de rango 64 y α 128 con dropout 0,05 aplicado sobre las proyecciones de atención, atención lineal y expertos compartidos; los expertos enrutados permanecen congelados. Se entrenó durante 1 época con learning rate 1e-4 sobre 80.730 filas (101,5 millones de tokens), en 3.955 pasos y 7,9 horas sobre una única RTX PRO 6000.

La innovación principal no está en el entrenamiento sino en la interfaz de inferencia: el modelo no decodifica texto, sino que lee los log-probabilities de las letras de opción (A–J) en una sola pasada y aplica temperaturas por tipo de pregunta calibradas sobre 3.368 filas reservadas (`calibration.json`). El stack declarado incluye Python 3.12, torch 2.14.1+cu130, transformers 5.22, peft 0.21.2, flash-linear-attention 0.6.0 y causal-conv1d 1.7.0. La receta sigue el artículo de Together "How to train your own Jev".

## Capacidades

- Clasificación de decisiones con salida probabilística calibrada por opción (2–10 opciones, letras A–J).
- Lectura de logits en un único forward pass, sin generación autoregresiva de texto.
- Calibración por tipo de pregunta mediante temperaturas ajustadas en un conjunto reservado.
- Robustez al orden de las opciones: con las opciones reordenadas la respuesta se mantiene en el 98,9 % de las filas del conjunto de desarrollo.
- Soporte de preguntas de tipo "noul" (sin etiqueta única) según el ejemplo de la API `/v1/systemone`.
- Servido compatible con OpenAI a través de `/v1/chat/completions` mediante `yev serve`.
- Capacidad multilingüe: no disponible (solo se declara inglés).
- Tool calling, agentes multi-paso, visión, audio o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de un mensaje y un conjunto de categorías (facturación, técnico, cuenta), el modelo devuelve la probabilidad de cada categoría en una sola pasada, lo que permite umbrales de confianza y derivación a revisión humana cuando la probabilidad máxima es baja.
- Clasificación con abstención: gracias al ECE de 0,058, las probabilidades son utilizables como señal de confianza; en pipelines de moderación o triaje se puede descartar automáticamente la opción si ninguna supera un umbral calibrado.
- Desambiguación de intenciones en asistentes conversacionales: con prompts de unos 3.300 tokens de media en DecideBench y latencias p50 de 0,30–0,38 s, encaja en bucles de diálogo donde se debe elegir la siguiente acción entre varias candidatas.
- Gate de release y control de calidad: aunque es su familia más débil (52 % en DecideBench v2), puede usarse como señal adicional junto a reglas deterministas para decisiones de publicación o bloqueo.
- Evaluación A/B y experimentación: la API `/v1/systemone` permite integrar el modelo como componente de decisión en servicios existentes sin reescribir la lógica de negocio, leyendo probabilidades en lugar de texto generado.
- Procesamiento por lotes de decisiones a escala: con 9,7 req/s en bf16 y 11,3 req/s en FP8 sobre una RTX PRO 6000, es viable clasificar grandes volúmenes de registros con coste estimado de 78–95 USD por millón de decisiones.
- Sustitución de yev1-4b en producción: misma interfaz y misma receta, con mejoras de precisión (88,0 frente a 79,3 en DecideBench v2) a cambio de mayores requisitos de memoria.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | yev1-4b | yev2-35b-a3b | yev2-35b-a3b-fp8 |
|---|---:|---:|---:|
| DecideBench v2.0 test (450), accuracy | 79,3 | 88,0 | 87,6 |
| DecideBench v2.0 test, pair accuracy | 62,7 | 78,2 | 77,3 |
| DecideBench v2.0 test, ECE | 0,078 | 0,058 | 0,059 |
| JevBench public (231), accuracy | 82,7 | 90,5 | 89,2 |
| JevBench public, hard tier (111) | 67,6 | 81,1 | 78,4 |

En el conjunto de desarrollo (3.963 filas reservadas): accuracy 97,0 (yev1: 95,2), group accuracy 93,4 (89,1) y ECE 0,017 (0,021). El intervalo de confianza al 95 % para la accuracy de yev2 en DecideBench v2 es 84,9–90,9. En la clasificación de DecideBench v2 ocupa la 5.ª posición de 27 modelos de decisión y la 2.ª entre los que se ejecutan en hardware propio. Su familia más débil son las decisiones de release-gating (52 %).

Rendimiento medido en una NVIDIA RTX PRO 6000 Blackwell (96 GB) con vLLM 0.31.0, `yev serve` y 4 peticiones en vuelo:

| Checkpoint | p50 | p95 | Throughput | Coste por 1M decisiones |
|---|---:|---:|---:|---:|
| yev2-35b-a3b (bf16) | 0,38 s | 0,72 s | 9,7 req/s | 95 USD |
| yev2-35b-a3b-fp8 (límite 45 GiB) | 0,30 s | 0,54 s | 11,3 req/s | 78 USD |
| yev1-4b (bf16) | 0,28 s | 0,60 s | no disponible | 71 USD |

El coste se calcula como tiempo de GPU a 3,36 USD/hora (AWS g7e.2xlarge on-demand) dividido por decisiones; los prompts de DecideBench promedian unos 3.300 tokens.

## Requisitos de hardware

- VRAM para bf16: 65 GB de pesos; requiere una GPU de 80 GB (A100 80 GB, H100, RTX PRO 6000).
- VRAM para FP8: 34 GB de pesos; cabe en una GPU de 48 GB (L40S, RTX 6000 Ada) usando `choyiny/yev2-35b-a3b-fp8`.
- Todos los 35B parámetros deben residir en memoria de GPU, aunque el coste de cómputo por token es el de un modelo de ~3B.
- No cabe en GPU de consumo convencionales (24 GB o menos) según los requisitos declarados.
- Despliegue recomendado: vLLM con `--max-model-len 16385`, `--enable-prefix-caching`, `--logprobs-mode processed_logprobs`, `--max-logprobs 26`, `--max-num-seqs 64` y `--gpu-memory-utilization 0.85`; en frente, `yev serve` para el formato de prompt, la lectura de letras y la calibración.
- Alternativa sin sidecar: `yev serve --model yev2-35b-a3b --calibration ...` sobre transformers, o el script `inference_example.py` (con `--adapter` para cargar base + LoRA).
- Latencia y throughput: p50 de 0,38 s y 9,7 req/s en bf16; p50 de 0,30 s y 11,3 req/s en FP8, con 4 peticiones en vuelo sobre RTX PRO 6000.
- Soporte de llama.cpp, Ollama o TGI: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | DecideBench v2 (accuracy) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| yev2-35b-a3b | 34,7B totales / ~3B activos | 16.385 | 88,0 | Apache-2.0 | Hugging Face (bf16 y FP8) |
| yev1-4b | no disponible | no disponible | 79,3 | no disponible | citado en la model card |
| yev2-35b-a3b-fp8 | 34,7B totales / ~3B activos | 16.385 | 87,6 | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.6-35B-A3B (base) | ~35B totales / ~3B activos | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de decisión para el modelo base ni para otros modelos de decisión comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no hay evidencia de comportamiento en castellano u otros idiomas.
- Está especializado en decisión entre opciones discretas; no es un modelo de generación de texto libre ni de razonamiento abierto.
- Las decisiones de release-gating son su punto débil (52 % de accuracy), por debajo de su media general.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- Riesgo de alucinación: no evaluado en la información disponible; al leer logits de letras, el riesgo se traslada a una asignación de probabilidad errónea más que a texto inventado.
- Sesgos: no se documentan análisis de sesgo en la model card.
- La ventana de contexto está limitada a 16.385 tokens en la configuración recomendada.
- Requiere configuración específica de vLLM (`--max-num-seqs 64`); con los valores por defecto (1.024 secuencias) no cabe en memoria por el estado recurrente de las capas de atención lineal.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Licencia Apache-2.0 permite uso comercial, pero las atribuciones de datos de entrenamiento están en `NOTICE` y `ATTRIBUTION.json` y deben revisarse antes de redistribuir.
- El checkpoint FP8 presenta una ligera pérdida de precisión (87,6 frente a 88,0 en DecideBench v2).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/choyiny/yev2-35b-a3b
- Checkpoint FP8: https://huggingface.co/choyiny/yev2-35b-a3b-fp8
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de código y herramienta `yev serve`: https://github.com/xyspacedev/yev
- Configuración de entrenamiento: `configs/yev2/yev2-qwen36-35b-a3b.json` en el repositorio anterior
- Dataset de evaluación DecideBench: https://huggingface.co/datasets/choyiny/decidebench
- Artículo de referencia de la receta: https://www.together.ai/blog/how-to-train-your-own-jev
