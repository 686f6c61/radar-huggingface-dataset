# chomeed/robometer-4b-full-threading-d0

## Resumen

Robometer-4B Full Fine-tune — MimicGen threading_d0 es un modelo de recompensa robótica (reward model) desarrollado por el usuario chomeed, que parte del modelo base Robometer-4B (a su vez un fine-tune de Qwen3-VL-4B-Instruct). Este checkpoint realiza un fine-tune completo de todos los parámetros (a diferencia de la variante LoRA) sobre el dataset MimicGen `threading_d0`, que contiene 160 trayectorias de simulación (80 exitosas y 80 fallidas) para la tarea de enhebrar una aguja en un trípode.

El modelo emite, por cada frame de vídeo, un valor de progreso en [0,1] y una probabilidad de éxito, ambos señales de recompensa densas para aprendizaje por refuerzo en robótica. Su relevancia radica en que ofrece una alternativa de fine-tuning completo frente a la adaptación LoRA, logrando métricas de alineación de recompensa ligeramente superiores (Pearson 0.9804 frente a 0.9753) con un coste de entrenamiento mayor (34 GB pico en B200). La arquitectura combina un encoder de visión congelado con un modelo de lenguaje multimodal (Qwen3-VL-4B) y tres cabezas de predicción entrenables, todo ello bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-4B-Instruct (fine-tune completo) con cabezas de predicción de progreso, preferencia y éxito |
| Parámetros totales | 4.447.004.940 (4.03B entrenables, 90.7%) |
| Parámetros activos | 4.447.004.940 (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible (probablemente inglés, no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full parameter fine-tuning) de Robometer-4B, que a su vez se basa en Qwen3-VL-4B-Instruct. La arquitectura original de Qwen3-VL incluye un visor de visión y un modelo de lenguaje multimodal. En este checkpoint, el visor de visión permanece congelado (`train_vision_encoder: false`), mientras que el modelo de lenguaje y las tres cabezas de predicción (progreso, preferencia y éxito) se entrenan con todos sus parámetros. El entrenamiento se realizó con Unsloth en bf16, durante 1000 pasos, con batch de 8, tasa de aprendizaje 2e-5, coseno de aprendizaje, warmup de 0.1, weight decay de 0.01 y clip de gradiente a 10. El checkpoint subido es el paso 500, que fue el mejor según la media de Pearson y Kendall.

Los datos de entrenamiento provienen del dataset `chomeed/mimicgen_threading_d0_train_rfm` (160 trayectorias: 80 exitosas y 80 fallidas), con evaluación en `..._test_rfm` (40 trayectorias con semillas disjuntas). Se trata de datos de simulación con endpoints exactos, lo que permite anotaciones precisas de éxito/fracaso. No se menciona uso de RLHF ni DPO; el entrenamiento es supervisado con señales de recompensa derivadas de las trayectorias.

## Capacidades

- Predicción de progreso: emite un valor discreto en [0,1] por frame (10 bins), que indica el avance hacia la finalización de la tarea.
- Predicción de probabilidad de éxito: emite una probabilidad de éxito por frame, aunque sin calibración (los valores absolutos son muy bajos, pico ≈0.002).
- Ranking de trayectorias: capacidad de ordenar trayectorias según su calidad (Kendall tau perfecto en el test set).
- Alineación de recompensas: correlación de Pearson alta (0.9804) entre las predicciones y las recompensas reales.
- Multimodalidad: procesa secuencias de frames de vídeo (RGB) y descripciones de tareas en lenguaje natural.
- Soporte de tool calling / function calling: no disponible (no es un modelo de agente).
- Capacidades multilingües: no disponible (no se indica; probablemente limitado al inglés).
- Capacidades especiales: no tiene modo de pensamiento (thinking mode) ni audio.

## Casos de uso

- **Recompensas para aprendizaje por refuerzo en robótica**: el modelo puede proporcionar señales de recompensa densas y continuas (progreso y probabilidad de éxito) para entrenar políticas con RL, especialmente en entornos de simulación como MimicGen. Su alineación con la recompensa real (Pearson 0.98) lo hace adecuado como sustituto de funciones de recompensa manuales.

- **Evaluación de políticas robóticas**: sirve para ordenar o filtrar trayectorias generadas por distintas políticas, mediante el ranking de Kendall perfecto (1.000) en el set de test, lo que permite seleccionar las mejores políticas sin ejecutar evaluaciones físicas.

- **Generación de datos de entrenamiento**: al clasificar trayectorias como exitosas o fallidas con alta AUROC (0.9944 en el paso 1000), puede etiquetar automáticamente grandes colecciones de datos de demostración para aprendizaje por imitación.

- **Recompensas para aprendizaje por imitación (IL)**: en lugar de usar recompensas escasas, se puede utilizar el valor de progreso como señal de guía durante el entrenamiento de políticas de imitación, mejorando la estabilidad en tareas de manipulación fina como enhebrar una aguja.

- **Diagnóstico de fallos en ejecución**: al monitorizar la probabilidad de éxito en tiempo real durante una ejecución robótica, se puede detectar cuándo una tarea se desvía del camino esperado y activar mecanismos de corrección o reinicio.

- **Investigación en reward models**: el modelo sirve como base para estudiar el efecto del fine-tuning completo frente a LoRA en modelos de recompensa, ya que ofrece una comparación directa con la variante LoRA en idénticas condiciones de datos y configuración.

## Benchmarks y rendimiento

Según la model card, los resultados en el conjunto de test (40 trayectorias con semillas no vistas) son:

| Métrica | Full FT (step 500) | LoRA (step 600) |
|---|---|---|
| Pearson (alineación de recompensa) | **0.9804** | 0.9753 |
| Kendall (ranking de políticas) | **1.000** | **1.000** |
| Accuracy de ranking (fracaso vs éxito) | **1.000** | **1.000** |
| Pérdida de alineación de recompensa | **3.236** | 3.390 |
| AUPRC de éxito | 0.162 | 0.192 |

Comparación en el mismo paso (step 1000) para igual presupuesto de entrenamiento:

| Métrica @ step 1000 | full FT | LoRA |
|---|---|---|
| Pearson | **0.9758** | 0.9749 |
| AUROC de éxito (sin umbral) | **0.9944** | 0.9907 |
| Pérdida de evaluación | **3.208** | 3.329 |

No se han publicado resultados de benchmarks comparativos con otros modelos de recompensa (como otros basados en Qwen-VL o CLIP-based) en la información disponible.

## Requisitos de hardware

- **VRAM para entrenamiento**: 34 GB de pico en una GPU B200 (fine-tuning completo). La inferencia debería ser menor, pero no se especifica.
- **GPU recomendadas**: para entrenamiento se usó B200; para inferencia, se requiere al menos 8-12 GB de VRAM (modelo de 4.4B en bf16 ≈ 9 GB), aunque la carga de vídeo (frames) puede aumentar el consumo. No se especifica, pero es probable que funcione en GPUs de consumidor como RTX 3090/4090 (24 GB) con cuantización, aunque no se ofrecen pesos cuantizados.
- **Opciones de despliegue**: compatible con text-generation-inference (TGI) y endpoints (según tags). También se puede usar con vLLM si se adapta, pero la carga de vídeo y las cabezas de recompensa requieren código personalizado (el repositorio `robometer` proporciona un servidor de evaluación). No se menciona llama.cpp ni Ollama.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Robometer-4B (base) | 4.4B | no disponible | Apache-2.0 | Hugging Face |
| chomeed/robometer-4b-lora-threading-d0 | 4.4B (LoRA) | no disponible | Apache-2.0 | Hugging Face |
| chomeed/robometer-4b-full-threading-d0 | 4.4B | no disponible | Apache-2.0 | Hugging Face |

La comparativa principal es entre el full fine-tune y el LoRA. El full fine-tune ofrece mejores métricas de alineación de recompensa (Pearson más alto, pérdida menor) pero con un coste de entrenamiento mucho mayor (34 GB vs 14.7 GB). El LoRA es más ligero y produce checkpoints que funcionan sin autocast en inferencia, mientras que el full fine-tune requiere envolver el forward en `torch.autocast`. Ambos son superiores al checkpoint base (que no está fine-tuneado para esta tarea específica).

## Limitaciones y advertencias

- **Calibración de la probabilidad de éxito**: los valores de éxito son muy bajos (pico ≈0.002) y no están calibrados; se recomienda usar el señal de progreso o establecer un umbral muy por debajo de 0.01.
- **Requisito de autocast**: el checkpoint completo mantiene `pixel_values` en fp32 contra bloques de visión en bf16, lo que provoca un error de tipo en inferencia directa. Obligatorio envolver el forward con `torch.autocast("cuda", dtype=torch.bfloat16)`.
- **Sesgo de tarea**: entrenado únicamente en la tarea de enhebrar una aguja (`threading_d0`) con datos de simulación MimicGen; no se ha evaluado en otras tareas ni en datos reales.
- **Tamaño de datos reducido**: solo 160 trayectorias de entrenamiento y 40 de test, lo que limita la generalización.
- **Riesgo de alucinación**: al ser un modelo de recompensa, no genera texto libre, pero puede producir señales de recompensa erróneas en trayectorias fuera de la distribución.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el modelo base (Qwen3-VL-4B-Instruct) puede tener restricciones adicionales (consulta su licencia).
- **Sin cuantizaciones**: no se ofrecen pesos cuantizados (GGUF, AWQ, etc.), lo que limita el despliegue en hardware de menor capacidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/chomeed/robometer-4b-full-threading-d0)
- [Modelo base Robometer-4B](https://huggingface.co/robometer/Robometer-4B)
- [Variante LoRA del mismo autor](https://huggingface.co/chomeed/robometer-4b-lora-threading-d0)
- [Dataset de entrenamiento](https://huggingface.co/datasets/chomeed/mimicgen_threading_d0_train_rfm)
- [Dataset de test](https://huggingface.co/datasets/chomeed/mimicgen_threading_d0_test_rfm)
- [Repositorio GitHub de Robometer](https://github.com/robometer/robometer)
- [Página del proyecto Robometer](https://robometer.github.io/)
- [Paper (arXiv)](https://arxiv.org/html/2603.02115v1)
