# seungkukim/internw0-delta-robodojo-clean48-step2000

## Resumen

InternW0-Delta RoboDojo clean48 step2000 es un checkpoint de ajuste fino (post-training) del modelo base InternRobotics/InternW0-Delta-RoboDojo, un world model orientado a robótica. Lo publica el usuario seungkukim en Hugging Face y está pensado como reemplazo directo (drop-in) del checkpoint base para tres tareas concretas del entorno RoboDojo: `play_tic_tac_toe`, `insert_tubes` y `pour_balls_into_vase`.

El modelo se ha entrenado sobre 144 episodios (48 por tarea) y 58.308 fotogramas procedentes de rollouts "limpios" generados por un agente LLM, empaquetados en formato LeRobot v2.1. El checkpoint conserva exactamente la misma estructura de tensores que el modelo base —claves `mot` (1654 tensores), `proprio_encoder` (3), `action_proprio_encoder` (3) y `understanding`—, con idénticos nombres, orden, formas y dtypes en bf16, por lo que solo cambian los pesos y el contador `step` (2000 frente a 9090 del base).

Su relevancia es acotada pero clara para quien trabaja con world models robóticos: demuestra un flujo de post-training reproducible sobre datos de rollouts sintéticos con hiperparámetros documentados, licencia Apache 2.0 y compatibilidad total con la infraestructura de entrenamiento del modelo original. No es un modelo de propósito general ni un LLM: es un artefacto de investigación para experimentación en manipulación robótica dentro de RoboDojo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (world model de InternW0-Delta; checkpoint con modulos `mot`, `proprio_encoder`, `action_proprio_encoder`, `understanding`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `robodojo.pt` (PyTorch, bf16) |

## Arquitectura y entrenamiento

El checkpoint deriva de InternW0-Delta-RoboDojo y mantiene su arquitectura sin cambios estructurales. La nomenclatura de las claves (`mot`, `understanding`, `proprio_encoder`, `action_proprio_encoder`) sugiere un world model con un tronco principal (`mot`), un módulo de comprensión y codificadores separados para propriocepción y para acción-propriocepción, pero la model card no detalla la arquitectura interna (tipo de transformer, mecanismo de atención, etc.), por lo que ese dato no está disponible.

El entrenamiento reutiliza `configs/task/robodojo.yaml` de InternW0-Delta con modificaciones puntuales: batch global de 64 (batch_size 16 × grad_accum 1 × 4 GPU), `max_steps` 5000 (este checkpoint es el paso 2000), `save_every` 1000, `warmup_ratio` 0.10 (500 pasos), learning rate 5e-5, ZeRO-1 con precisión bf16 y gradient checkpointing activado (`mot_checkpoint_mixed_attn=true`). La normalización reutiliza sin cambios el fichero `assets/stats/robodojo.json` del modelo base (z-score). El dataset son rollouts limpios de un agente LLM sobre las tres tareas, en formato LeRobot v2.1.

## Capacidades

- Control robótico y modelado de mundo para tres tareas específicas de RoboDojo: `play_tic_tac_toe`, `insert_tubes` y `pour_balls_into_vase`.
- Procesamiento de propriocepción mediante codificadores dedicados (`proprio_encoder`, `action_proprio_encoder`).
- Módulo de comprensión (`understanding`) heredado del modelo base.
- Compatibilidad directa con el pipeline de entrenamiento e inferencia de InternW0-Delta (reemplazo drop-in del checkpoint).
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes multi-paso ni multilingüismo; el modelo está especializado en robótica.

## Casos de uso

- Sustitución directa del checkpoint base en pipelines de InternW0-Delta: descargar `robodojo.pt` y colocarlo en `checkpoints/` para reanudar entrenamiento o evaluar con `scripts/train_distributed.sh robodojo resume=checkpoints/robodojo.pt`, sin tocar código.
- Evaluación comparativa de post-training sobre datos limpios: permite medir si 48 episodios por tarea generados por un agente LLM bastan para mejorar el comportamiento respecto al checkpoint base (step 9090) en las tres tareas.
- Reproducción de experimentos de investigación: los hiperparámetros, el dataset y la configuración están documentados, lo que facilita replicar o variar el ajuste fino en un entorno controlado.
- Generación de datos sintéticos para robótica: sirve como punto de partida para estudiar la calidad de rollouts limpios como señal de entrenamiento en world models.
- Prototipado en manipulación de precisión: la tarea `insert_tubes` es un escenario típico de inserción fina donde evaluar la política aprendida resulta útil antes de escalar a entornos reales.
- Base para ajustes posteriores específicos: al compartir estructura exacta con el modelo base, puede usarse como inicialización para nuevos post-trainings sobre otras tareas o datasets de RoboDojo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño del modelo base, que no se documenta).
- GPU recomendadas: no disponible; el entrenamiento se realizó con 4 GPU y ZeRO-1 en bf16, lo que implica un entorno multi-GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el checkpoint está pensado para el stack de InternW0-Delta (`scripts/train_distributed.sh` con `resume=`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| seungkukim/internw0-delta-robodojo-clean48-step2000 | no disponible | no disponible | World model robótico (3 tareas RoboDojo) | Apache 2.0 | Hugging Face |
| InternRobotics/InternW0-Delta-RoboDojo (base) | no disponible | no disponible | World model robótico (corpus RoboDojo) | no disponible en la informacion | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: solo cubre tres tareas de RoboDojo; no es un modelo generalista.
- Entrenado sobre 144 episodios y 58.308 fotogramas, un volumen reducido que puede limitar la generalización fuera de la distribución de los rollouts limpios.
- El checkpoint se guarda en el paso 2000 de un entrenamiento configurado para 5000 pasos; no representa el resultado final del run.
- Riesgo de sobreajuste a los rollouts generados por el agente LLM, con posible brecha respecto a datos reales de robot.
- La model card no documenta sesgos, tasas de alucinación ni evaluación de robustez; no hay métricas publicadas.
- Sin información sobre rendimiento en hardware ni latencia, lo que dificulta planificar despliegues en producción.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero las condiciones del modelo base y de los datos de entrenamiento deben verificarse por separado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/internw0-delta-robodojo-clean48-step2000
- Modelo base: https://huggingface.co/InternRobotics/InternW0-Delta-RoboDojo
- Dataset de entrenamiento: https://huggingface.co/datasets/seungkukim/robodojo-clean-rollouts-internw0-lerobot-v21-48ep
