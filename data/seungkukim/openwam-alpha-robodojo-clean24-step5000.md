# seungkukim/openwam-alpha-robodojo-clean24-step5000

## Resumen

OpenWAM-Alpha RoboDojo clean24-step5000 es un ajuste fino (post-entrenamiento) del modelo base OpenWAM/OpenWAM-Alpha-Sim-RoboDojo, desarrollado por el usuario seungkukim. Se trata de un world-action model orientado a robótica que combina un backbone de vídeo (Wan2.2-TI2V-5B, segun se deduce de las instrucciones de carga de la model card) con un cabezal de acciones, y que ha sido reentrenado sobre rollouts limpios de tres tareas del entorno RoboDojo: `play_tic_tac_toe`, `insert_tubes` y `pour_balls_into_vase`.

El modelo no es un LLM conversacional ni un modelo de lenguaje al uso: su proposito es predecir acciones motoras y dinámica visual en entornos simulados de manipulacion robotica. El repositorio es un reemplazo directo (drop-in replacement) del modelo base, con el mismo layout, nombres de tensores y ficheros auxiliares, pero con pesos distintos. La relevancia actual radica en que forma parte de la linea OpenWAM, una iniciativa abierta y modular para el preentrenamiento sistematico de world-action models, un area emergente en robótica.

El ajuste se realizo con un dataset reducido y curado de 72 episodios (24 por tarea, 28.971 frames), lo que lo convierte en una pieza de experimentacion controlada mas que en un modelo de produccion general. La licencia es Apache 2.0 y el tamano del repositorio es de 24,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model con backbone de video (Wan2.2-TI2V-5B) y cabezal de acciones; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 24,8 GB; loader `openwam.deploy.model_loader`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base OpenWAM/OpenWAM-Alpha-Sim-RoboDojo, descrita en el paper OpenWAM (arXiv:2609.07398) como una exploracion abierta y modular hacia el preentrenamiento sistematico de world-action models. Segun la model card, el backbone de video es Wan2.2-TI2V-5B (referenciado como `model.video_backbone.model_path` en el `config.yaml`), lo que sugiere un modelo de difusion de video de 5B parametros como componente generativo visual, acoplado a un modulo de prediccion de acciones. Los detalles exactos de atencion, capas y composicion no se detallan en la informacion disponible.

El entrenamiento de este checkpoint parte del modelo base y utiliza el dataset `seungkukim/robodojo-clean-rollouts-openwam-hdf5-24ep`, compuesto por 72 episodios (24 por tarea) y 28.971 frames de rollouts limpios generados por agentes LLM en RoboDojo. La configuracion es identica a la del base salvo: batch_size 16 (frente a 4), max_steps 5000 (frente a 60.000), save_steps 1000, warmup_ratio 0,10 (500 pasos), learning rate 1e-4 con scheduler coseno y lr_min_ratio 0,01, ZeRO stage 2 y bf16, sin gradient checkpointing. El batch global efectivo es 64 (16 x 1 x 4 GPU). Se reutiliza sin cambios el `normalization_stats.npy` del modelo base (md5 `855296b406a1d16fbc92318564d6152d`), asi como el tokenizer. No se menciona RLHF ni DPO en la informacion disponible.

## Capacidades

- Prediccion de acciones motoras y dinamica visual en entornos simulados de manipulacion robotica.
- Ejecucion de tareas especificas de RoboDojo: `play_tic_tac_toe`, `insert_tubes` y `pour_balls_into_vase`.
- Modelado de mundo (world model): generacion/prediccion de video condicionada a acciones, segun la naturaleza del backbone Wan2.2-TI2V-5B.
- Integracion con el ecosistema OpenWAM mediante `openwam.deploy.model_loader.load_from_checkpoint_dir`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo es el ejecutor, no el agente; los rollouts de entrenamiento provienen de agentes LLM).
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): vision via backbone de video; el resto no disponible.

## Casos de uso

- Investigacion en world-action models: servir como checkpoint de referencia para estudiar el efecto de reentrenar sobre rollouts limpios y curados frente al corpus completo del base, con una configuracion reproducible (5000 pasos, batch 64).
- Experimentos de manipulacion robotica en simulacion: evaluar politicas en las tres tareas de RoboDojo (`play_tic_tac_toe`, `insert_tubes`, `pour_balls_into_vase`) sin necesidad de reentrenar desde cero, gracias a que es un drop-in replacement del base.
- Ablaciones de datos: comparar el rendimiento con 24 episodios por tarea frente a otras cantidades o calidades de rollouts, usando el dataset HDF5 publicado como referencia.
- Generacion de video condicionada a acciones: aprovechar el backbone Wan2.2-TI2V-5B para sintetizar rollouts y aumentar datos de entrenamiento en pipelines de robotica.
- Baseline para ajuste fino posterior: punto de partida para reentrenar en tareas adicionales de RoboDojo o en dominios simulados cercanos, manteniendo la normalizacion y el tokenizer del base.
- Reproducibilidad de experimentos: al ser byte-identico en `normalization_stats.npy` y `tokenizer/` al base, permite aislar el efecto de los pesos en estudios comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. El repositorio pesa 24,8 GB y el backbone de video es de 5B parametros; en bf16 el backbone solo requeriria aproximadamente 10 GB, pero el total del modelo y los buffers de difusion de video elevan el consumo de forma no cuantificada en la informacion disponible.
- GPU recomendadas: no disponible. El entrenamiento se realizo con 4 GPU (ZeRO stage 2, bf16), lo que sugiere GPUs de clase A100/H100 o similar, pero no se especifica el modelo exacto.
- ¿Cabe en consumer GPU?: no disponible. Por tamano de repo (24,8 GB) podria requerir GPUs de 24 GB o mas en funcion de la precision y del pipeline de difusion, pero no hay dato confirmado.
- Opciones de despliegue: loader oficial `openwam.deploy.model_loader.load_from_checkpoint_dir`; requiere configurar `model.video_backbone.model_path` con un Wan2.2-TI2V-5B local. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenWAM-Alpha RoboDojo clean24-step5000 (este) | no disponible | no disponible | World-action model en RoboDojo | Apache 2.0 | Hugging Face |
| OpenWAM/OpenWAM-Alpha-Sim-RoboDojo (base) | no disponible | no disponible | World-action model en RoboDojo | no disponible | Hugging Face |
| Otros world-action models (p. ej. variantes de OpenWAM) | no disponible | no disponible | Robotica simulada | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre tres tareas de RoboDojo; no se espera generalizacion a otras tareas sin ajuste fino adicional.
- Dataset de entrenamiento muy reducido (72 episodios, 28.971 frames), lo que aumenta el riesgo de sobreajuste a las condiciones de los rollouts limpios.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- Las rutas del `config.yaml` son placeholders (`/path/to/...`); es necesario configurar manualmente el backbone Wan2.2-TI2V-5B y los ficheros auxiliares.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no disponible en el sentido de generacion de texto; en world models existe riesgo de predicciones visuales inconsistentes, pero no se documenta.
- Limitaciones de contexto o idioma: no disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el backbone Wan2.2-TI2V-5B pueden tener sus propias condiciones que deben verificarse por separado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-17; se trata de un artefacto de investigacion sin validacion externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/openwam-alpha-robodojo-clean24-step5000
- Modelo base: https://huggingface.co/OpenWAM/OpenWAM-Alpha-Sim-RoboDojo
- Dataset de entrenamiento: https://huggingface.co/datasets/seungkukim/robodojo-clean-rollouts-openwam-hdf5-24ep
- Paper OpenWAM: arXiv:2609.07398 (https://arxiv.org/abs/2609.07398)
