# seungkukim/internw0-delta-robodojo-clean24-step2000

## Resumen

InternW0-Delta RoboDojo — step 2000 es un ajuste fino (post-training) del modelo base InternRobotics/InternW0-Delta-RoboDojo, un world model orientado a robótica. Lo publica el usuario seungkukim en Hugging Face y está pensado como reemplazo directo del checkpoint base para tres tareas concretas del entorno RoboDojo: `play_tic_tac_toe`, `insert_tubes` y `pour_balls_into_vase`. El modelo conserva exactamente la estructura del checkpoint original (`robodojo.pt`), con los tensores `mot`, `proprio_encoder`, `action_proprio_encoder` y `understanding` en bf16, por lo que puede intercambiarse sin modificar el pipeline de entrenamiento o evaluación.

El ajuste se realizó sobre 72 episodios "limpios" (24 por tarea) procedentes de rollouts de un agente LLM, con 28.971 frames en formato LeRobot v2.1. La configuración parte de `configs/task/robodojo.yaml` del modelo base, con cambios puntuales en batch size, acumulación de gradientes, pasos máximos y warmup. El resultado es un checkpoint en el paso 2000 (frente al paso 9090 del base), con licencia Apache 2.0.

Es relevante porque demuestra un flujo de post-training reproducible sobre world models robóticos con datos de rollouts filtrados, y porque el checkpoint resultante es directamente utilizable en el stack InternW0 sin ingeniería adicional de integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (world model robótico; hereda la del base InternW0-Delta-RoboDojo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch checkpoint (`robodojo.pt`, bf16) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint InternRobotics/InternW0-Delta-RoboDojo. La estructura de pesos es idéntica al base: claves de nivel superior `mot` (1654 tensores), `proprio_encoder` (3 tensores), `action_proprio_encoder` (3 tensores), `understanding`, `step` y `torch_dtype`. Los nombres, orden, formas y dtypes (bf16) de los tensores coinciden con el base; solo difieren los pesos y el valor de `step` (2000 en este checkpoint, 9090 en el base). No se dispone de más detalle arquitectónico (tipo de transformer, mecanismo de atención, etc.) en la información proporcionada.

El entrenamiento usa el dataset `seungkukim/robodojo-clean-rollouts-internw0-lerobot-v21-24ep` (LeRobot v2.1, 72 episodios, 28.971 frames), generado a partir de rollouts de un agente LLM. Se parte de `configs/task/robodojo.yaml` sin cambios salvo: batch size 16 (frente a 8 por defecto), gradient accumulation 1 (frente a 4), max_steps 5000 (frente a 10 epochs), save_every 1000 (frente a 2500) y warmup_ratio 0.10 (frente a 0.05). El learning rate se mantiene en 5e-5, con ZeRO stage 1, precisión bf16, gradient checkpointing activado (`mot_checkpoint_mixed_attn=true`) y normalización z-score reutilizando `assets/stats/robodojo.json` del base sin modificar. El batch global efectivo es 16 × 1 × 4 GPU = 64.

## Capacidades

- Modelado de mundo y predicción para tareas robóticas de manipulación en el entorno RoboDojo.
- Ejecución de políticas para las tres tareas entrenadas: `play_tic_tac_toe`, `insert_tubes` y `pour_balls_into_vase`.
- Integración con el stack InternW0-Delta mediante reemplazo directo del checkpoint (`robodojo.pt`).
- Codificación de propriocepción mediante `proprio_encoder` y `action_proprio_encoder`.
- Reutilización de estadísticas de normalización del modelo base, lo que permite continuar entrenamiento o evaluación sin recalibrar.
- No se dispone de información sobre tool calling, agentes multi-paso, capacidades multilingües ni modos especiales (thinking, vision, audio).

## Casos de uso

- Sustitución directa del checkpoint base en pipelines InternW0: descargar `robodojo.pt` con `huggingface-cli` y colocarlo en `checkpoints/` para reanudar entrenamiento con `scripts/train_distributed.sh robodojo resume=checkpoints/robodojo.pt`, sin cambios de código.
- Evaluación de políticas en las tres tareas RoboDojo: útil para comparar el efecto del post-training con rollouts limpios frente al checkpoint base en `play_tic_tac_toe`, `insert_tubes` y `pour_balls_into_vase`.
- Investigación sobre calidad de datos en robótica: permite estudiar cómo 24 episodios limpios por tarea (frente al corpus RoboDojo completo) afectan al comportamiento del world model en solo 2000 pasos.
- Reproducción de experimentos de post-training: la configuración detallada (batch, warmup, save_every, ZeRO, bf16) facilita replicar o variar el ajuste con otros datasets LeRobot v2.1.
- Punto de partida para fine-tuning adicional: al conservar estructura y normalización del base, sirve como inicialización para nuevas tareas o datasets sin rehacer el pipeline.
- Benchmarking interno de world models robóticos: permite medir degradación o mejora respecto al base (step 9090) en tareas específicas antes de desplegar políticas en entornos reales o simulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del modelo no se especifica en la información proporcionada).
- GPU recomendadas: no disponible; el entrenamiento se realizó con 4 GPU (batch global 64), pero no se indica modelo concreto.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el flujo documentado usa el script `scripts/train_distributed.sh` del stack InternW0 con reanudación desde checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InternW0-Delta RoboDojo — step 2000 (este) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |
| InternRobotics/InternW0-Delta-RoboDojo (base) | no disponible | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| Alternativas de world models robóticos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- El ajuste se limita a tres tareas concretas (`play_tic_tac_toe`, `insert_tubes`, `pour_balls_into_vase`); fuera de ese dominio no hay garantías de comportamiento.
- El dataset de post-training es pequeño (72 episodios, 28.971 frames), lo que puede provocar sobreajuste a las condiciones de los rollouts limpios.
- El checkpoint está en el paso 2000 frente al 9090 del base; puede estar subentrenado respecto al modelo original en capacidades generales.
- No se dispone de información sobre sesgos, tasas de alucinación o robustez fuera de distribución.
- No hay datos sobre idiomas, contexto o cuantizaciones, lo que limita su uso fuera del stack InternW0.
- Licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales del modelo base ni de los datos subyacentes.
- Al ser un checkpoint de investigación con 0 descargas y 0 likes en el momento de la consulta, no hay validación comunitaria ni reportes de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/internw0-delta-robodojo-clean24-step2000
- Modelo base: https://huggingface.co/InternRobotics/InternW0-Delta-RoboDojo
- Dataset de entrenamiento: https://huggingface.co/datasets/seungkukim/robodojo-clean-rollouts-internw0-lerobot-v21-24ep
