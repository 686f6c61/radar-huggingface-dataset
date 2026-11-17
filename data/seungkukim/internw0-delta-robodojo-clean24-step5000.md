# seungkukim/internw0-delta-robodojo-clean24-step5000

## Resumen

InternW0-Delta RoboDojo clean24 step5000 es un checkpoint de ajuste fino (post-training) del modelo de mundo para robótica InternW0-Delta-RoboDojo, desarrollado por el usuario seungkukim a partir del modelo base de InternRobotics. El modelo se ha entrenado sobre rollouts generados por agentes LLM en tres tareas concretas del entorno RoboDojo: `play_tic_tac_toe`, `insert_tubes` y `pour_balls_into_vase`. Su propósito es servir como sustituto directo (drop-in replacement) del checkpoint base en pipelines de entrenamiento y evaluación de políticas robóticas basadas en modelos de mundo.

El artefacto principal es `robodojo.pt`, de 12,4 GB, con la misma estructura exacta que el checkpoint base: claves de nivel superior `mot` (1654 tensores), `proprio_encoder` (3 tensores), `action_proprio_encoder` (3 tensores), `understanding`, `step` y `torch_dtype`, con nombres, orden, formas y dtypes (bf16) idénticos. La única diferencia respecto al base es el valor de `step` (5000 frente a 9090) y los pesos. Esto lo convierte en un experimento de ajuste reproducible y de bajo riesgo de integración.

La relevancia de esta ficha es limitada pero específica: se trata de un checkpoint de investigación con 0 descargas y 0 likes en el momento de la consulta, orientado a quien necesite reproducir o comparar el efecto de entrenar con rollouts "limpios" (24 episodios por tarea, 28.971 fotogramas) frente al corpus completo de RoboDojo. No es un modelo de propósito general ni un modelo conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de mundo para robótica; el checkpoint contiene un modulo `mot` con 1654 tensores, mas encoders de propiocepcion y accion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (`robodojo.pt`), dtype bf16 |

## Arquitectura y entrenamiento

El checkpoint deriva de InternW0-Delta-RoboDojo, un modelo de mundo para robótica. La model card no detalla la arquitectura interna mas alla de la estructura del state dict: un modulo `mot` con 1654 tensores, dos encoders de propiocepcion (3 tensores cada uno) y un modulo `understanding`. No se especifica si `mot` corresponde a un transformer, a un Mixture of Experts o a otra topologia, ni el numero de parametros o de tokens de entrenamiento del modelo base.

El ajuste fino se realizo sobre el dataset `seungkukim/robodojo-clean-rollouts-internw0-lerobot-v21-24ep` en formato LeRobot v2.1: 72 episodios (24 por tarea), 28.971 fotogramas, correspondientes a rollouts de agentes LLM. Se partio de `configs/task/robodojo.yaml` sin cambios salvo los explicitados: batch size 16 (frente a 8 por defecto), gradient accumulation 1 (frente a 4), max_steps 5000 (frente a 10 epocas sin limite fijo), save_every 1000 (frente a 2500) y warmup_ratio 0,10 (500 pasos, frente a 0,05). El batch global resultante es de 64 (16 x 1 x 4 GPU). Se uso learning rate 5e-5, ZeRO stage 1, precision bf16, gradient checkpointing activado (`mot_checkpoint_mixed_attn=true`) y normalizacion z-score reutilizando sin cambios `assets/stats/robodojo.json` del modelo base.

## Capacidades

- Modelado de mundo y generacion de rollouts para tres tareas roboticas concretas: `play_tic_tac_toe`, `insert_tubes` y `pour_balls_into_vase`.
- Codificacion de propiocepcion y de acciones mediante encoders dedicados (`proprio_encoder`, `action_proprio_encoder`).
- Modulo `understanding` para representacion semantica del entorno (funcion exacta no documentada).
- Integracion directa en el pipeline de entrenamiento de InternW0-Delta mediante `scripts/train_distributed.sh` con la opcion `resume`.
- Sustitucion drop-in del checkpoint base: mismos nombres, orden, formas y dtypes de tensores.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo thinking.

## Casos de uso

- Reproduccion de experimentos de ajuste fino: cargar `robodojo.pt` como checkpoint de reanudacion (`resume=checkpoints/robodojo.pt`) permite replicar exactamente la configuracion de este run (batch 16, 5000 pasos, warmup 0,10) y comparar contra el base.
- Evaluacion del efecto de datos "limpios": al haberse entrenado solo con 72 episodios de rollouts de agente, sirve para medir cuanto del rendimiento del modelo base depende del corpus completo de RoboDojo frente a un subconjunto curado.
- Investigacion en manipulacion robotica de precision: la tarea `insert_tubes` exige alineacion fina; el checkpoint permite estudiar si el ajuste con pocos episodios mejora la politica en esa tarea.
- Estudio de tareas de vertido y control de objetos deformables o granulares: `pour_balls_into_vase` es un caso clasico de dinamica compleja donde comparar checkpoints con distinto numero de pasos aporta senal sobre la estabilidad del entrenamiento.
- Benchmark interno de modelos de mundo: usar el mismo state dict y evaluar la prediccion de rollouts en las tres tareas para comparar step 5000 frente a step 9090 del base.
- Base para nuevos ajustes: al ser un checkpoint intermedio (5000 pasos) con la misma estructura, puede servir como inicializacion para fine-tunes posteriores con otros datasets o tareas de RoboDojo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint pesa 12,4 GB en bf16, por lo que se necesita al menos esa cantidad de memoria solo para los pesos, mas overhead de activaciones y del entorno de simulacion.
- GPU recomendadas: no disponibles en la informacion proporcionada. El entrenamiento se realizo con 4 GPU (batch global 64), sin especificar modelo.
- Cabe en GPU de consumo: no confirmado. Un checkpoint de 12,4 GB en bf16 no cabe en GPUs de 8-12 GB sin cuantizacion, y no se documentan opciones de cuantizacion.
- Opciones de despliegue: el flujo documentado es el script de entrenamiento de InternW0-Delta (`scripts/train_distributed.sh`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| InternW0-Delta RoboDojo clean24 step5000 (este) | no disponible | no disponible | apache-2.0 | Ajuste con 72 episodios limpios, step 5000 |
| InternRobotics/InternW0-Delta-RoboDojo (base) | no disponible | no disponible | no disponible en la informacion | Entrenado sobre el corpus completo de RoboDojo, step 9090 |
| Otros modelos de mundo roboticos | no disponible | no disponible | no disponible | No se proporcionan alternativas comparables en la informacion |

## Limitaciones y advertencias

- Modelo de investigacion con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion externa.
- El ajuste cubre solo tres tareas de RoboDojo; no se documenta generalizacion a otras tareas o entornos.
- El dataset de ajuste es muy reducido (72 episodios, 28.971 fotogramas), lo que aumenta el riesgo de sobreajuste a esas trayectorias concretas.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de robustez.
- La model card no especifica arquitectura, numero de parametros, contexto ni requisitos de hardware; cualquier uso en produccion requiere validacion propia.
- La licencia es apache-2.0, lo que permite uso comercial, pero el modelo base puede tener condiciones adicionales no reflejadas en esta ficha.
- El checkpoint solo es util dentro del ecosistema InternW0-Delta; no es un modelo de texto o vision de proposito general.
- La fecha de creacion indicada (2026-11-17) es posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/internw0-delta-robodojo-clean24-step5000
- Modelo base: https://huggingface.co/InternRobotics/InternW0-Delta-RoboDojo
- Dataset de entrenamiento: https://huggingface.co/datasets/seungkukim/robodojo-clean-rollouts-internw0-lerobot-v21-24ep
