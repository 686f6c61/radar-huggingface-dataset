# seungkukim/openwam-alpha-robodojo-naive-dagger-teacher-ttt-pour-insert-48ep-lr1e4-step5000

## Resumen

OpenWAM-Alpha RoboDojo (post-entrenado con transiciones de profesor naive-DAgger) es un modelo de mundo y accion para robotica desarrollado por el usuario seungkukim a partir del modelo base OpenWAM/OpenWAM-Alpha-Sim-RoboDojo, perteneciente al proyecto OpenWAM. El modelo se ha post-entrenado sobre transiciones (estado, accion) generadas por un agente profesor privilegiado (PyRUA-Lean, un agente LLM de tipo code-as-policy) durante rollouts con mezcla de control profesor-alumno (naive-DAgger) en tres tareas de simulacion del benchmark RoboDojo: `play_tic_tac_toe`, `pour_balls_into_vase` e `insert_tubes`.

El problema que aborda es el de la recuperacion y correccion de trayectorias en entornos de manipulacion robotica simulada: en lugar de entrenar solo con demostraciones expertas limpias, el modelo aprende a partir de fragmentos donde el profesor retoma el control tras intervenciones del alumno, lo que aporta ejemplos de recuperacion desde estados degradados. El repositorio es un reemplazo directo ("drop-in replacement") del modelo base: mantiene el mismo layout, nombres de tensores y ficheros auxiliares, y solo cambian los pesos.

La relevancia es acotada y experimental: se trata de un checkpoint de investigacion con 0 descargas y 0 likes en el momento de la consulta, orientado a evaluar recetas de post-entrenamiento (DAgger, mezcla de profesores, reutilizacion de estadisticas de normalizacion) sobre un world-action model. No se dispone de informacion publica sobre arquitectura interna detallada, numero de parametros ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de mundo y accion, libreria `openwam`; backbone de video Wan2.2-TI2V-5B segun instrucciones de uso) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje general) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`checkpoint_step_*.safetensors`); repo de 24.8 GB |

## Arquitectura y entrenamiento

El modelo es un post-entrenamiento del checkpoint OpenWAM/OpenWAM-Alpha-Sim-RoboDojo. La model card indica que la configuracion de entrenamiento es identica al `config.yaml` del modelo base salvo en los elementos marcados, y que el backbone de video se referencia como Wan2.2-TI2V-5B (`model.video_backbone.model_path`), aunque no se detalla la arquitectura completa del world-action model. El modelo base se asocia al paper OpenWAM (arXiv:2609.07398), que propone una exploracion modular abierta hacia el preentrenamiento sistematico de world-action models.

Los datos de entrenamiento son los clips del dataset `seungkukim/robodojo-naive-dagger-teacher-openwam-hdf5-ttt-pour-insert-48ep`: 48 episodios por tarea, 400 clips y 52.477 frames en formato RoboDojo HDF5 sobre simulacion `arx_x5`, con layouts de evaluacion sets 0-2 y layouts 20-35 (16 por set). En cada episodio, un profesor (PyRUA-Lean, agente LLM privilegiado de code-as-policy, con comandos limitados a las velocidades de las demostraciones expertas de RoboDojo) y un alumno (OpenWAM-alpha) compartian el control: al inicio y tras cada programa del profesor que movia el robot, una moneda daba el control al profesor con probabilidad 0,6; en caso contrario, al alumno durante dos chunks de accion (64 pasos nativos). Solo se conservan las transiciones del profesor: cada racha ininterrumpida de al menos 32 pasos del profesor constituye un clip, y un clip que empieza justo despues de un turno del alumno arranca desde el estado que dejo el alumno, mostrando la recuperacion del profesor. Se usan todos los episodios, exitosos o no.

Desglose por tarea: `play_tic_tac_toe` (48 episodios, 22 exitosos, 171 clips, 23.791 frames, 31% de pasos del alumno), `pour_balls_into_vase` (48 episodios, 22 exitosos, 113 clips, 14.524 frames, 32% de pasos del alumno) e `insert_tubes` (48 episodios, 16 exitosos, 116 clips, 14.162 frames, 34% de pasos del alumno). El entrenamiento uso batch global de 64 (batch_size 16 x grad_accum 1 x 4 GPU) sobre 4x H200, con `max_steps` 5000, `save_steps` 1000, `warmup_ratio` 0,10 (500 pasos), learning rate 1e-4, scheduler cosine con `lr_min_ratio` 0,01, ZeRO stage 2 y bf16, sin gradient checkpointing; tiempo de pared de 74 minutos y 55 segundos. La normalizacion es min-max y reutiliza sin cambios el `normalization_stats.npy` del modelo base (md5 `855296b406a1d16fbc92318564d6152d`), byte a byte identico, de modo que la desnormalizacion de acciones en inferencia coincide exactamente con el entrenamiento.

## Capacidades

- Control robotico en simulacion para tareas de manipulacion: `play_tic_tac_toe`, `pour_balls_into_vase` e `insert_tubes` sobre el simulador RoboDojo (`arx_x5`).
- Modelado de mundo y accion: el modelo base se enmarca en la linea OpenWAM de world-action models, orientada a predecir acciones y dinamica del entorno.
- Recuperacion desde estados degradados: el entrenamiento con clips de profesor que comienzan tras turnos del alumno incorpora ejemplos explicitos de correccion.
- Mezcla profesor-alumno en el dataset de entrenamiento (naive-DAgger), con proporcion de pasos del alumno del 31-34% segun tarea.
- Compatibilidad drop-in con el modelo base: mismos nombres de tensores, layout y ficheros auxiliares.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito en la informacion disponible.
- Capacidades multilingues: no disponible (no es un modelo de lenguaje general).

## Casos de uso

- Investigacion en imitation learning y DAgger: el checkpoint sirve para comparar recetas de agregacion de datos (48 episodios por tarea frente a la variante de 72 episodios) manteniendo constante el resto de hiperparametros, lo que permite aislar el efecto del volumen de datos de profesor.
- Evaluacion de politicas en RoboDojo: permite ejecutar el modelo en los layouts de evaluacion sets 0-2 y layouts 20-35 (16 por set) y medir tasas de exito en las tres tareas, con la ventaja de que la desnormalizacion coincide exactamente con la del entrenamiento por reutilizar `normalization_stats.npy`.
- Estudio de recuperacion tras errores: al haberse entrenado con clips que arrancan desde estados dejados por el alumno, es adecuado para analizar la capacidad de recuperacion del modelo cuando parte de configuraciones no optimas.
- Baseline para tecnicas de profesor privilegiado: util como referencia para comparar con otros profesores (por ejemplo, agentes code-as-policy alternativos) o con esquemas de mezcla distintos al 0,6 de probabilidad de control del profesor.
- Fine-tuning posterior en robotica simulada: al ser drop-in respecto al modelo base y compartir su `config.yaml`, se puede usar como punto de partida para nuevos post-entrenamientos con otros datasets HDF5 de RoboDojo.
- Reproducibilidad de recetas: el repositorio documenta batch, pasos, warmup, scheduler, precision y hardware (4x H200, 74m55s), lo que facilita reproducir el entrenamiento en entornos con recursos equivalentes.
- Analisis de tareas de insercion y vertido: las tareas `insert_tubes` y `pour_balls_into_vase` son representativas de manipulacion precisa y vertido, utiles para estudiar el efecto del desbalance de exitos (16/48 y 22/48 episodios exitosos respectivamente) en el aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, metricas de RoboDojo ni comparaciones numericas con el modelo base u otros checkpoints; solo se documentan estadisticas del dataset (episodios, clips, frames y proporcion de pasos del alumno).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo pesa 24,8 GB en safetensors, lo que da una cota inferior orientativa del orden de 25 GB solo para los pesos; el backbone de video Wan2.2-TI2V-5B y los estados intermedios anaden requisitos no cuantificados en la informacion disponible.
- GPU recomendadas: no disponible de forma explicita para inferencia. El entrenamiento se realizo en 4x NVIDIA H200 con ZeRO stage 2 y bf16.
- Compatibilidad con GPU de consumo: no disponible; no se documenta si cabe en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: carga mediante `openwam.deploy.model_loader.load_from_checkpoint_dir`, que selecciona el `checkpoint_step_*.safetensors` de mayor paso en el directorio; el repo incluye exactamente uno, por lo que debe descargarse en su propio directorio. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| seungkukim/openwam-alpha-robodojo-naive-dagger-teacher-ttt-pour-insert-48ep-lr1e4-step5000 | no disponible | no disponible | naive-DAgger, 48 ep/tarea, 5000 pasos | apache-2.0 | Hugging Face, 0 descargas |
| seungkukim/openwam-alpha-robodojo-naive-dagger-teacher-ttt-pour-insert-72ep-lr1e4-step5000 | no disponible | no disponible | naive-DAgger, 72 ep/tarea, 5000 pasos | apache-2.0 (segun repo relacionado) | Hugging Face |
| OpenWAM/OpenWAM-Alpha-Sim-RoboDojo (modelo base) | no disponible | no disponible | corpus RoboDojo, 60000 pasos | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos checkpoints en la informacion proporcionada; la unica diferencia documentada es la receta de datos y de entrenamiento (episodios por tarea y `batch_size` 16 frente a 4 en el base).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El entrenamiento usa un profesor privilegiado con acceso a informacion privilegiada y comandos limitados a las velocidades de las demostraciones expertas, lo que puede inducir un sesgo hacia ese estilo de control.
- Riesgo de alucinacion: no aplica en el sentido de lenguaje general, pero el modelo puede generar acciones no validas o trayectorias fallidas; las tasas de exito del dataset (22/48, 22/48 y 16/48) indican que una fraccion relevante de episodios no tuvo exito.
- Limitaciones de contexto o idioma: no disponible; el modelo no es de proposito general y solo se documenta para tres tareas de RoboDojo en simulacion `arx_x5`.
- Restricciones de licencia: licencia apache-2.0, que permite uso comercial con las condiciones de la licencia; no se documentan restricciones adicionales, aunque el modelo base y el paper asociado deberian verificarse por separado.
- Caveat de produccion: es un checkpoint de investigacion con 0 descargas y 0 likes, sin benchmarks publicados; no debe considerarse listo para produccion sin evaluacion propia.
- Dependencia de rutas: el `config.yaml` contiene rutas placeholder (`/path/to/...`) y requiere configurar `model.video_backbone.model_path` a una copia local de Wan2.2-TI2V-5B.
- Gestion de checkpoints: `load_from_checkpoint_dir` elige el `checkpoint_step_*.safetensors` de mayor paso, por lo que mezclar checkpoints en un mismo directorio puede cargar pesos no deseados.
- Normalizacion acoplada: reutiliza el `normalization_stats.npy` del modelo base; alterarlo romperia la correspondencia entre entrenamiento e inferencia.
- Ambito limitado: solo cubre `play_tic_tac_toe`, `pour_balls_into_vase` e `insert_tubes`; no hay evidencia de generalizacion a otras tareas o a robot real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/openwam-alpha-robodojo-naive-dagger-teacher-ttt-pour-insert-48ep-lr1e4-step5000
- Modelo base: https://huggingface.co/OpenWAM/OpenWAM-Alpha-Sim-RoboDojo
- Dataset de entrenamiento: https://huggingface.co/datasets/seungkukim/robodojo-naive-dagger-teacher-openwam-hdf5-ttt-pour-insert-48ep
- Variante con 72 episodios por tarea: https://huggingface.co/seungkukim/openwam-alpha-robodojo-naive-dagger-teacher-ttt-pour-insert-72ep-lr1e4-step5000
- Paper OpenWAM: arXiv:2609.07398 (https://arxiv.org/abs/2609.07398)
