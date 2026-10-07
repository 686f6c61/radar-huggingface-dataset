# arkojit1/pi05_pick_block_eef_abs_bs32_lr2.5e-5_4.8k

## Resumen

El modelo `arkojit1/pi05_pick_block_eef_abs_bs32_lr2.5e-5_4.8k` es un ajuste fino del modelo de robótica π₀.₅ (`lerobot/pi05_base`), desarrollado por el usuario arkojit1 y distribuido a través de la librería LeRobot. No es un modelo de lenguaje: es una política visión-lenguaje-acción (VLA) especializada en una única tarea de manipulación, en la que un brazo Franka debe recoger un bloque guiándose por dos cámaras de 224×224. Su salida no es texto, sino una acción de control del efector final.

El checkpoint publicado corresponde al paso 4.800 de una ejecución de 20.000 pasos. Solo se entrenó el módulo "action expert" y las proyecciones asociadas (~0,69B parámetros), mientras que el codificador visual SigLIP y el backbone Gemma-2B se mantuvieron congelados. El modelo completo contiene 4.143.404.816 parámetros (unos 4,14B) y ocupa 9,4 GB en el repositorio. La relevancia de esta ficha radica en que documenta un fine-tune de π₀.₅ paso a paso, con métricas de sobreajuste y una distinción explícita entre espacio de acción absoluto y delta, aspectos habitualmente poco detallados en políticas robóticas publicadas en HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA π₀.₅: codificador de visión SigLIP + backbone Gemma-2B (ambos congelados) + "action expert" de flow matching |
| Parámetros totales | 4.143.404.816 (~4,14B) |
| Parámetros activos | no aplica (no es un modelo MoE); ~0,69B parámetros entrenables en este fine-tune |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (durante el entrenamiento); no se documentan cuantizaciones de inferencia |
| Idiomas soportados | no disponible (no es un modelo lingüístico de propósito general) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

π₀.₅ es un modelo de visión-lenguaje-acción basado en flow matching. Combina un codificador visual SigLIP, un backbone de lenguaje Gemma-2B y un "action expert" que genera secuencias de acciones mediante un proceso de flow matching. En este fine-tune concreto, llevado a cabo con LeRobot 0.6.1 (`--policy.type=pi05` y `--train_expert_only`), únicamente se actualizaron el action expert y las proyecciones (~0,69B parámetros, no es un adaptador LoRA); SigLIP y Gemma-2B permanecieron congelados. La configuración de entrenamiento fija un `chunk_size` y `n_action_steps` de 50, imagen aumentada activada, `torch.compile` en modo predeterminado, checkpointing de gradientes y precisión bf16.

Los datos de entrenamiento proceden del dataset `Ameyapores/pick_block_eef_position_abs`: 35 episodios de Franka (9.181 fotogramas a 25 fps), una sola tarea, dos cámaras `cam0`/`cam2` de 224×224 y estado de 4 dimensiones. La tercera ranura de imagen de π₀.₅ se rellena con `empty_cameras=1`. El optimizador es AdamW con LR pico de 2,5e-5, decaimiento coseno hasta 2,5e-6, programación fijada a 20.000 pasos y 666 pasos de warmup, con batch global de 32 (4 GPU × 8). El checkpoint publicado corresponde al paso 4.800 (~19 épocas). El espacio de acción es `[x, y, z, gripper]`, es decir, la posición absoluta del efector final a alcanzar en el siguiente fotograma más un objetivo binario de pinza (0/1), con normalización por cuantiles q01–q99.

## Capacidades

- Generación de acciones de control del efector final: produce, por cada fotograma, una posición absoluta `[x, y, z]` y un objetivo de pinza binario.
- Percepción visual: procesa dos cámaras de 224×224 (`cam0`/`cam2`); la tercera ranura de imagen va rellena.
- Generación de acciones en bloque: emite secuencias de 50 acciones (`chunk_size` y `n_action_steps` = 50) mediante flow matching.
- Ejecución de una tarea única de manipulación: recogida de un bloque (pick block) con un brazo Franka.
- Integración con el ecosistema LeRobot para evaluación y despliegue.
- No dispone de generación de texto, tool calling, function calling, capacidades de agente, razonamiento multi-paso, capacidades multilingües, modo de pensamiento, audio ni vídeo.

## Casos de uso

- Recogida de bloques con brazo Franka: el modelo genera directamente la posición absoluta del efector final y el estado de la pinza para completar la tarea de pick, apoyándose en las dos cámaras de 224×224.
- Punto de partida para nuevos fine-tunes: al ser un ajuste completo de la política sobre `lerobot/pi05_base`, sirve como inicialización para reentrenar el action expert en tareas de manipulación similares.
- Banco de pruebas de la pila LeRobot: permite validar el flujo `lerobot-eval --policy.path=...` y el pipeline de entrenamiento (`--policy.type=pi05`) con pesos reales.
- Investigación en políticas VLA y flow matching: su documentación de pérdida de evaluación frente a entrenamiento lo hace útil para estudiar dinámicas de sobreajuste.
- Estudio comparativo absoluto vs delta: el propio autor referencia la variante `arkojit1/pi05_pick_block_eef_delta`, lo que permite comparar ambos espacios de acción sobre datos idénticos.
- Replicación de entrenamientos controlados: reproduce una configuración concreta (batch 32, LR 2,5e-5, paso 4.800) para análisis de ablación de hiperparámetros.
- Evaluación de transferencia con regiones de estado estrechas: útil para medir el comportamiento del modelo en extrapolación fuera del rango de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, tasas de éxito de tarea) en la información disponible. La única métrica reportada es la pérdida de flow matching sobre 4 episodios reservados (31–34), que no equivale a una tasa de éxito de la tarea.

| Métrica | Este checkpoint (paso 4.800) | Ejecución a 20.000 pasos |
|---|---|---|
| Pérdida de entrenamiento | 0,056 | 0,034 |
| Pérdida de evaluación (flow matching) | 0,0576 | 0,0839 |
| Dispersión de evaluación punto a punto | ±0,005–0,01 | no disponible |
| Observación | mejor evaluación de la ejecución | sobreajuste (79 épocas) |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16 los pesos ocupan unos 8,3 GB (4,14B × 2 bytes); con activaciones y dos cámaras de 224×224, se estima un consumo aproximado de 10–12 GB. En fp32 serían unos 16,6 GB solo de pesos. Estimaciones no confirmadas por el autor.
- GPU recomendadas: A100 o H100 para entrenamiento; el autor empleó 4 GPU × 8 de batch global. En inferencia, tarjetas de 24 GB (RTX 3090, RTX 4090) son suficientes en bf16.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en RTX 3090 y RTX 4090 (24 GB). En RTX 4080 (16 GB) sería ajustado y no está confirmado.
- Opciones de despliegue: la vía documentada es LeRobot (`lerobot-eval --policy.path=arkojit1/pi05_pick_block_eef_abs_bs32_lr2.5e-5_4.8k ...`). No se documenta soporte de vLLM, Ollama, llama.cpp ni TGI, que están orientados a modelos de lenguaje y no a políticas VLA.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Espacio de acción | Dataset | Licencia |
|---|---|---|---|---|
| `arkojit1/pi05_pick_block_eef_abs_bs32_lr2.5e-5_4.8k` (este) | ~4,14B | absoluto `[x, y, z, gripper]` | `Ameyapores/pick_block_eef_position_abs` | no disponible |
| `lerobot/pi05_base` | no disponible | no disponible (base preentrenada) | preentrenamiento | no disponible |
| `arkojit1/pi05_pick_block_eef_abs` | no disponible | absoluto | dataset byte-idéntico | no disponible |
| `arkojit1/pi05_pick_block_eef_delta` | no disponible | delta | no disponible | no disponible |

Nota: los modelos delta y absoluto no son intercambiables; el autor advierte explícitamente de que el espacio de acción difiere.

## Limitaciones y advertencias

- Región de entrenamiento estrecha: los datos cubren x 0,528–0,559, y 0,056–0,068 y z 0,145–0,311; cualquier objetivo fuera de ese rango es extrapolación y no está validado.
- Sobreajuste documentado: la ejecución continuó hasta 20.000 pasos (79 épocas) y empeoró la pérdida de evaluación (0,0839 frente a 0,0576 en el paso 4.800).
- Ausencia de tasa de éxito: la evaluación reportada es una pérdida de flow matching sobre 4 episodios, no una métrica de éxito de tarea; el rendimiento real de recogida no está cuantificado.
- Espacio de acción absoluto, no intercambiable con modelos delta como `arkojit1/pi05_pick_block_eef_delta`.
- Generalización limitada: solo 35 episodios, una única tarea, 4 dimensiones de estado y dos cámaras (la tercera ranura va rellena), lo que restringe su uso más allá del escenario de pick.
- Licencia no especificada: no se indica licencia, por lo que el uso comercial y la redistribución quedan sin condiciones claras.
- Sin capacidades lingüísticas ni de agente: no admite tool calling, function calling ni razonamiento en lenguaje natural; no debe evaluarse con benchmarks de texto.
- Sin cifras de latencia ni de throughput publicadas, lo que dificulta planificar despliegues en tiempo real (los datos de entrenamiento son a 25 fps).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arkojit1/pi05_pick_block_eef_abs_bs32_lr2.5e-5_4.8k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Ameyapores/pick_block_eef_position_abs
- Variante delta: https://huggingface.co/arkojit1/pi05_pick_block_eef_delta
- Variante absoluta previa: https://huggingface.co/arkojit1/pi05_pick_block_eef_abs
- LeRobot (HuggingFace): https://github.com/huggingface/lerobot
