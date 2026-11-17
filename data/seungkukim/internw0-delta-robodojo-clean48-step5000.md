# seungkukim/internw0-delta-robodojo-clean48-step5000

## Resumen

InternW0-Delta RoboDojo clean48 step5000 es un checkpoint de ajuste fino (post-training) del modelo base InternW0-Delta-RoboDojo, desarrollado por el usuario seungkukim sobre la infraestructura de InternRobotics. Se trata de un modelo de mundo (world model) orientado a robótica que aprende la dinámica de entornos manipulativos y se emplea como política/planificador para tareas de manipulación. El ajuste se ha realizado sobre 144 episodios de rollouts limpios (48 por tarea) en tres tareas del benchmark RoboDojo: `play_tic_tac_toe`, `insert_tubes` y `pour_balls_into_vase`.

El modelo conserva exactamente la estructura del checkpoint base: un módulo `mot` con 1654 tensores, codificadores de propiocepción (`proprio_encoder` y `action_proprio_encoder`) y un módulo `understanding`, todo en bfloat16. El checkpoint resultante es un reemplazo directo (drop-in) del base, diferenciándose únicamente en los pesos y en el contador de pasos (5000 frente a los 9090 del original).

Su relevancia radica en que demuestra un flujo de post-training reproducible sobre datos de rollouts filtrados (clean rollouts) con hiperparámetros documentados, lo que permite evaluar el efecto de un ajuste corto y controlado sobre un world model robótico preentrenado. La licencia Apache 2.0 facilita su reutilización en investigación y prototipos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (checkpoint con módulos `mot`, `proprio_encoder`, `action_proprio_encoder`, `understanding`) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`robodojo.pt`), dtype bf16 |

## Arquitectura y entrenamiento

El modelo parte de InternW0-Delta-RoboDojo y mantiene su arquitectura intacta: un backbone `mot` de 1654 tensores, dos codificadores de propiocepción (3 tensores cada uno) y un módulo `understanding`. No se documenta en la información disponible el tipo exacto de bloque (transformer, híbrido u otro), el número de parámetros ni la longitud de contexto. Los pesos se almacenan en bfloat16.

El post-training se realizó sobre el dataset `robodojo-clean-rollouts-internw0-lerobot-v21-48ep` en formato LeRobot v2.1: 144 episodios (48 por tarea), 58.308 fotogramas en total. Se usó la configuración `configs/task/robodojo.yaml` sin cambios salvo los indicados: batch global de 64 (16 × acumulación 1 × 4 GPUs), `max_steps` de 5000, guardado cada 1000 pasos, `warmup_ratio` de 0,10 (500 pasos) y learning rate de 5e-5. Se empleó ZeRO-1, precisión bf16, gradient checkpointing activado (`mot_checkpoint_mixed_attn=true`) y la normalización z-score del fichero base `assets/stats/robodojo.json` reutilizada sin modificar. No se menciona RLHF, DPO ni otras fases de alineamiento.

## Capacidades

- Modelado de dinámica robótica: aprende transiciones estado-acción en entornos de manipulación.
- Política de control para tareas específicas: `play_tic_tac_toe`, `insert_tubes` y `pour_balls_into_vase`.
- Procesamiento de propiocepción mediante codificadores dedicados.
- Módulo de `understanding` para representación semántica del entorno (función exacta no detallada).
- Compatibilidad drop-in con el pipeline de entrenamiento y evaluación de InternW0-Delta.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Evaluación de post-training sobre datos filtrados: permite comparar el efecto de entrenar con 48 episodios limpios por tarea frente al corpus completo de RoboDojo, usando el mismo checkpoint base y la misma normalización.
- Reproducción de experimentos de robótica: el checkpoint se carga con `resume=checkpoints/robodojo.pt` en `scripts/train_distributed.sh`, lo que facilita continuar el entrenamiento o replicar la receta.
- Investigación en world models: sirve como punto de partida para estudiar cómo un ajuste corto (5000 pasos) altera la dinámica aprendida en tareas de manipulación.
- Benchmarking de tareas RoboDojo: al cubrir tres tareas concretas (tic-tac-toe, inserción de tubos, vertido de bolas en jarrón), permite medir generalización entre habilidades manipulativas distintas.
- Prototipado de políticas de manipulación: útil para probar pipelines de simulación a real con un modelo ya alineado a las estadísticas de RoboDojo.
- Base para ajustes posteriores: al ser un drop-in del checkpoint base, se puede usar como inicialización para nuevos post-trainings sobre otros datasets LeRobot v2.1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 12,4 GB, lo que sugiere un checkpoint de varios miles de millones de parámetros en bf16 (no confirmado).
- VRAM estimada para inferencia: no disponible con precisión; como referencia, un checkpoint de ~12 GB en bf16 requiere al menos ~12-16 GB de VRAM solo para pesos, más memoria para activaciones.
- GPU recomendadas: el entrenamiento se realizó con 4 GPUs (modelo no especificado); para inferencia se recomienda al menos una GPU con 24 GB o más (RTX 3090/4090, A100, H100).
- ¿Cabe en GPU de consumo? Probablemente en RTX 3090/4090 (24 GB) para inferencia en bf16, aunque no está confirmado.
- Opciones de despliegue: el flujo documentado usa PyTorch con `train_distributed.sh`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un world model robótico de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| seungkukim/internw0-delta-robodojo-clean48-step5000 | No disponible | No disponible | Apache 2.0 | Post-training sobre 48 ep/tarea, step 5000 |
| InternRobotics/InternW0-Delta-RoboDojo (base) | No disponible | No disponible | No disponible en la información | Checkpoint base, step 9090, corpus RoboDojo completo |
| Otros world models robóticos | No disponible | No disponible | No disponible | No se dispone de datos comparables |

## Limitaciones y advertencias

- Entrenado únicamente sobre tres tareas de RoboDojo; la generalización a otras tareas no está validada.
- Dataset pequeño (144 episodios, 58.308 fotogramas), lo que puede provocar sobreajuste a las condiciones de esos rollouts.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de distribución.
- No se especifican limitaciones de contexto ni de idioma (el modelo no es lingüístico en el sentido habitual).
- Licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener condiciones adicionales no reflejadas en esta ficha; conviene verificar la licencia de InternRobotics/InternW0-Delta-RoboDojo.
- El checkpoint reutiliza la normalización del base; cambios en la distribución de datos de despliegue pueden degradar el rendimiento.
- No hay métricas de éxito publicadas para las tareas, por lo que no se puede afirmar que supere al base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/internw0-delta-robodojo-clean48-step5000
- Modelo base: https://huggingface.co/InternRobotics/InternW0-Delta-RoboDojo
- Dataset de entrenamiento: https://huggingface.co/datasets/seungkukim/robodojo-clean-rollouts-internw0-lerobot-v21-48ep
