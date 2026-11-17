# helen9975/starvla_qwendual_telearms_v5_random_1500

## Resumen

`starvla_qwendual_telearms_v5_random_1500` es un checkpoint de política robótica bimano entrenado con el framework StarVLA sobre el backbone multimodal Qwen2.5-VL-3B-Instruct. No se trata de un modelo de lenguaje al uso, sino de un modelo visión-lenguaje-acción (VLA) que, a partir de observaciones visuales de tres cámaras y del estado propioceptivo de 14 dimensiones, predice secuencias de acciones articulares absolutas para un robot YAM simulado de dos brazos. Lo publica el usuario `helen9975` como uno de los cinco cabezales de acción StarVLA entrenados sobre el mismo dataset y con el mismo presupuesto de muestras.

El modelo parte de Qwen2.5-VL-3B-Instruct con fine-tuning completo, incluido el codificador visual, y añade un cabezal de acción tipo diffusion transformer que genera chunks de 30 pasos a 30 Hz. El entrenamiento se realizó sobre 15.000 demostraciones simuladas (10 tareas × 1.500 episodios), equivalentes a 14.340.545 fotogramas capturados por tres cámaras de 224×224 (frontal, muñeca izquierda y muñeca derecha), sin domain randomization.

Su relevancia es acotada pero específica: sirve como referencia reproducible para comparar cabezales de acción (QwenDual frente a pi0.5 y MolmoAct2) bajo idéntico backbone, dataset y presupuesto de 15,36 millones de muestras. El checkpoint final corresponde al paso 160.000 y, según la model card, todavía no ha sido evaluado en simulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA: backbone Qwen2.5-VL-3B-Instruct (transformer multimodal con vision encoder) + cabezal de acción StarVLA QwenDual (diffusion transformer) |
| Parámetros totales | 3B en el backbone (no se detalla el recuento del cabezal de acción) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos `pytorch_model.pt`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.pt` (state dict StarVLA) + `config.yaml` / `config.full.yaml` |
| Dataset de entrenamiento | `mliu48/telearms-yam-cube-v5-exp-random-1500` |
| Acciones | 14-D absolutas (6 articulaciones + pinza por brazo), chunks de 30 pasos |
| Entrada propioceptiva | estado de 14-D |
| Cámaras | 3 × 224×224 (frontal, muñeca izquierda, muñeca derecha) |
| Frecuencia de control | 30 Hz |
| Normalización | cuantil q99; estadísticas en `dataset_statistics.json` |
| Tamaño del repo | 8,8 GB |

## Arquitectura y entrenamiento

La arquitectura combina un backbone VLM preentrenado, Qwen2.5-VL-3B-Instruct, con un cabezal de acción específico de StarVLA denominado QwenDual. El backbone procesa las tres vistas de cámara junto con el estado propioceptivo de 14 dimensiones y produce representaciones que el cabezal transforma en chunks de 30 acciones articulares absolutas. El fine-tuning es completo, incluyendo el codificador visual, lo que implica actualizar los 3B parámetros del backbone además del cabezal.

El entrenamiento empleó 8 GPU H100 con ZeRO-2, batch de 12 por GPU (global 96) y 160.000 pasos, lo que suma 15,36 millones de muestras, el mismo presupuesto que las ejecuciones comparables con pi0.5 y MolmoAct2. Se usó AdamW con betas (0,9; 0,95), learning rate de 1e-5 para el VLM y 1e-4 para el cabezal de acción, 1.000 pasos de warmup y decaimiento coseno hasta 5e-7. La pérdida de acción (`action_dit_loss`) en el paso 160.000 era de 0,0105. El dataset contiene 15.000 demostraciones (10 tareas × 1.500) y 14.340.545 fotogramas a 30 Hz, sin domain randomization; el código corresponde a `starVLA_dev` @ `13d8ad4` con una configuración local `examples/TelearmsYAM` (mezcla `telearms_v5_random_1500`, tipo de robot `telearms_yam_sim`).

## Capacidades

- Predicción de acciones motoras bimanuales de 14 dimensiones para un robot YAM simulado.
- Percepción visual multi-cámara: integra simultáneamente vista frontal y ambas muñecas.
- Fusión de estado propioceptivo de 14-D con observaciones visuales.
- Generación de chunks de acción de 30 pasos, con horizonte de control a 30 Hz.
- Ejecución de 10 tareas de manipulación de cubos definidas en el dataset `telearms-yam-cube-v5-exp-random-1500`.
- Herencia de las capacidades del backbone Qwen2.5-VL-3B-Instruct (comprensión visión-lenguaje), aunque no se documenta su uso explícito en esta ficha.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni otras capacidades especiales en la información disponible.

## Casos de uso

- Manipulación bimanual simulada de cubos: el modelo predice acciones articulares para ambas manos a partir de las tres cámaras, adecuado para tareas de pick-and-place en entornos YAM simulados.
- Investigación en aprendizaje por imitación VLA: sirve como checkpoint de referencia para estudiar el efecto del cabezal de acción QwenDual frente a alternativas con idéntico backbone y presupuesto de muestras.
- Reproducción de experimentos: al publicarse `config.yaml` y `config.full.yaml` junto con los pesos, permite replicar el entrenamiento y comparar curvas de pérdida.
- Evaluación de transferencia sim-to-real: aunque el dataset no tiene domain randomization, el modelo puede usarse como punto de partida para estudiar robustez ante variaciones visuales.
- Generación de trayectorias de referencia: los chunks de 30 pasos pueden emplearse como política de imitación en pipelines de planificación de bajo nivel.
- Benchmarking de cabezales de acción: al compartir dataset y backbone con las ejecuciones pi0.5 y MolmoAct2 Random-1500, facilita comparaciones controladas de arquitecturas de acción.
- Docencia y divulgación: ejemplo completo de fine-tuning VLA bimano con configuración publicada y estadísticas de normalización incluidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo aún no ha sido evaluado en simulación; el único dato de rendimiento reportado es la pérdida de acción (`action_dit_loss`) de 0,0105 en el paso 160.000.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 8,8 GB y el backbone es de 3B parámetros, por lo que en precisión nativa (probablemente bf16/fp32) requeriría del orden de varias decenas de GB, pero no se confirma en la información proporcionada.
- GPU de entrenamiento documentadas: 8 × H100 con ZeRO-2.
- GPU recomendadas para inferencia: no disponible.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: no disponible; los pesos se publican como `pytorch_model.pt` (state dict StarVLA), no como GGUF ni safetensors estándar, y el código de referencia es el repositorio StarVLA (`starVLA_dev` @ `13d8ad4`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Backbone | Parámetros | Contexto | Dataset | Presupuesto de muestras | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| starvla_qwendual_telearms_v5_random_1500 | Qwen2.5-VL-3B-Instruct | 3B (backbone) | no disponible | telearms-yam-cube-v5-exp-random-1500 | 15,36M | no disponible | Hugging Face |
| Ejecución pi0.5 Random-1500 (mismo dataset) | no disponible | no disponible | no disponible | telearms-yam-cube-v5-exp-random-1500 | 15,36M | no disponible | no disponible en la información |
| Ejecución MolmoAct2 Random-1500 (mismo dataset) | no disponible | no disponible | no disponible | telearms-yam-cube-v5-exp-random-1500 | 15,36M | no disponible | no disponible en la información |

Las dos alternativas citadas se mencionan en la model card como ejecuciones comparables con idéntico backbone y presupuesto, pero no se dispone de sus especificaciones ni de resultados de evaluación en la información proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido evaluado en simulación según la model card; no hay evidencia de rendimiento en tareas.
- Entrenado exclusivamente sobre datos simulados sin domain randomization, lo que reduce la robustez ante variaciones visuales o de dinámica del mundo real.
- Diseñado para un robot concreto (YAM bimano simulado, tipo `telearms_yam_sim`) y 10 tareas específicas de manipulación de cubos; no generaliza a otras morfologías sin reentrenamiento.
- Las acciones predichas están normalizadas con cuantiles q99; es imprescindible usar `dataset_statistics.json` para desnormalizarlas antes de aplicarlas al robot.
- Licencia no disponible: no se puede confirmar si permite uso comercial.
- Idiomas soportados no disponibles; aunque hereda el backbone multilingüe, no se documenta su uso lingüístico en esta ficha.
- Riesgo de alucinación y sesgos: no evaluado ni documentado para este checkpoint.
- El checkpoint corresponde al paso 160.000 con pérdida de acción de 0,0105; no se aportan métricas de éxito de tarea.
- El formato de pesos (`pytorch_model.pt`, state dict StarVLA) no es directamente compatible con runtimes estándar como vLLM, llama.cpp u Ollama sin conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/helen9975/starvla_qwendual_telearms_v5_random_1500
- Dataset de entrenamiento: https://huggingface.co/datasets/mliu48/telearms-yam-cube-v5-exp-random-1500
- Repositorio StarVLA: https://github.com/starVLA/starVLA
- Backbone Qwen2.5-VL-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
