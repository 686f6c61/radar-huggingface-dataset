# seungkukim/openwam-alpha-robodojo-clean24-step2000

## Resumen

OpenWAM-Alpha RoboDojo (clean rollouts, 24 ep/task, step 2000) es un ajuste fino del modelo base OpenWAM/OpenWAM-Alpha-Sim-RoboDojo, desarrollado por el usuario seungkukim. Se trata de un world-action model (modelo que predice tanto la evolución visual del entorno como las acciones del agente) orientado a robótica y entrenado sobre rollouts limpios de tres tareas del entorno RoboDojo: `play_tic_tac_toe`, `insert_tubes` y `pour_balls_into_vase`. El modelo parte de la familia OpenWAM, presentada en el articulo arXiv:2609.07398 como una exploracion abierta y modular hacia el preentrenamiento sistematico de world-action models.

El ajuste se ha realizado sobre un dataset propio de 72 episodios (24 por tarea) que suman 28.971 frames, con un entrenamiento de 5000 pasos y batch global de 64. La estructura de directorios, los nombres de tensores y los ficheros auxiliares son identicos a los del modelo base, por lo que este repositorio funciona como sustituto directo (drop-in replacement) con pesos distintos. El repositorio ocupa 24,8 GB y se distribuye bajo licencia Apache 2.0.

Su relevancia radica en que demuestra un flujo de post-entrenamiento reproducible sobre un world-action model abierto: reutiliza sin cambios las estadisticas de normalizacion y el tokenizer del modelo base, y solo modifica los pesos mediante un ajuste supervisado sobre datos de simulacion. Es un artefacto de investigacion, no un modelo de produccion generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model sobre backbone de video Wan2.2-TI2V-5B (detalles completos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en precision completa; el repo no documenta variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (modelo orientado a control robotico, no a texto general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout identico al modelo base; incluye `normalization_stats.npy` y directorio `tokenizer/`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base OpenWAM-Alpha-Sim-RoboDojo, que combina un backbone de generacion de video (Wan2.2-TI2V-5B, referenciado en la configuracion como `model.video_backbone.model_path`) con un cabezal de prediccion de acciones, dando lugar a un world-action model. La model card no detalla el numero de capas, dimensiones ocultas ni el mecanismo exacto de acoplamiento entre la prediccion visual y la de acciones; esa informacion debe consultarse en el paper de OpenWAM (arXiv:2609.07398).

El post-entrenamiento sigue el `config.yaml` del modelo base con cambios acotados: batch size 16 (frente a 4), `max_steps` 5000 (frente a 60000), `save_steps` 1000, `warmup_ratio` 0.10 (500 pasos) frente a 0.05, learning rate 1e-4 con scheduler coseno y `lr_min_ratio` 0.01, ZeRO stage 2 y bf16, sin gradient checkpointing. El batch global es 64 (16 x acumulacion 1 x 4 GPU). Los datos son 72 episodios de rollouts limpios (24 por tarea, 28.971 frames) del dataset `seungkukim/robodojo-clean-rollouts-openwam-hdf5-24ep`. La normalizacion min-max reutiliza el `normalization_stats.npy` del modelo base sin modificar (md5 `855296b406a1d16fbc92318564d6152d`), igual que el tokenizer. No se documenta uso de RLHF ni DPO.

## Capacidades

- Prediccion de acciones roboticas y de la evolucion visual del entorno (world-action modeling) en tareas de simulacion RoboDojo.
- Ejecucion de tres tareas concretas de manipulacion y juego: `play_tic_tac_toe`, `insert_tubes` y `pour_balls_into_vase`.
- Aprendizaje a partir de rollouts generados por agentes LLM (los datos de entrenamiento son rollouts de agente).
- Integracion mediante la libreria `openwam`, con carga a traves de `openwam.deploy.model_loader.load_from_checkpoint_dir`.
- Compatibilidad drop-in con el modelo base: mismos nombres de tensores y ficheros auxiliares.
- No se documentan capacidades de generacion de texto general, codigo, matematicas, vision de proposito general, tool calling, agentes multi-paso ni multilingueismo.

## Casos de uso

- Investigacion en world-action models: servir como punto de comparacion controlado frente al modelo base para medir el efecto de un ajuste fino con pocos datos (72 episodios) sobre el rendimiento en tareas RoboDojo.
- Reproduccion de experimentos: el repositorio replica el layout y los ficheros auxiliares del base, lo que permite sustituir pesos sin tocar el codigo de carga ni el pipeline de evaluacion.
- Evaluacion de sim-a-real en manipulacion: las tareas `insert_tubes` y `pour_balls_into_vase` son representativas de inserción de precision y vertido, utiles para estudiar transferencia desde simulacion.
- Estudio de sobreajuste con datos escasos: con 24 episodios por tarea y 5000 pasos, el modelo es un caso practico para analizar como un ajuste corto altera el comportamiento de un world model preentrenado.
- Generacion de trayectorias sinteticas para aumento de datos: las predicciones del modelo pueden emplearse como rollouts adicionales en pipelines de entrenamiento de politicas.
- Benchmarking de infraestructura de inferencia robotica: al requerir el backbone Wan2.2-TI2V-5B, sirve para medir coste de despliegue y latencia de world models en GPUs de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 24,8 GB y el backbone de video es Wan2.2-TI2V-5B, por lo que se requiere al menos una GPU con memoria suficiente para cargar el checkpoint completo y el backbone en bf16.
- GPU recomendadas: no documentadas por el autor; por el tamano del checkpoint y el uso de 4 GPU durante el entrenamiento (ZeRO stage 2), son razonables A100 o H100 de 80 GB. No se confirma compatibilidad con RTX 4090.
- Cabe en GPU consumer: no confirmado; el tamano del repo (24,8 GB) y la necesidad de cargar ademas el backbone Wan2.2-TI2V-5B hacen improbable su ejecucion comoda en GPUs de 24 GB sin cuantizacion, que no esta documentada.
- Opciones de despliegue: libreria `openwam` con `load_from_checkpoint_dir`; requiere `snapshot_download` de Hugging Face y configurar `model.video_backbone.model_path` a una copia local de Wan2.2-TI2V-5B. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openwam-alpha-robodojo-clean24-step2000 (este) | no disponible | no disponible | Post-entrenamiento sobre 72 episodios RoboDojo, 5000 pasos | Apache 2.0 | Hugging Face |
| OpenWAM/OpenWAM-Alpha-Sim-RoboDojo (base) | no disponible | no disponible | Corpus RoboDojo, 60000 pasos | Apache 2.0 (segun repo base) | Hugging Face |
| Otros world-action models roboticos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion acotado a tres tareas de simulacion RoboDojo; no es un modelo generalista ni un asistente conversacional.
- Entrenado con solo 72 episodios (24 por tarea) y 5000 pasos, lo que aumenta el riesgo de sobreajuste a las condiciones exactas de esos rollouts.
- La model card no documenta sesgos, tasas de alucinacion ni evaluaciones de robustez; no hay evidencia publicada sobre su comportamiento fuera de distribucion.
- Depende del backbone Wan2.2-TI2V-5B, que debe obtenerse por separado; las rutas de `config.yaml` son marcadores de posicion (`/path/to/...`) y requieren configuracion manual.
- Reutiliza la normalizacion y el tokenizer del modelo base; cambiar el dataset o el entorno de simulacion sin recalcular estadisticas puede degradar el rendimiento.
- No se documentan cuantizaciones, por lo que el despliegue en hardware limitado no esta soportado oficialmente.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones publicadas hace arriesgado su uso en produccion sin validacion propia.
- Sin descargas ni likes en el momento de la consulta: no hay validacion comunitaria del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/openwam-alpha-robodojo-clean24-step2000
- Modelo base: https://huggingface.co/OpenWAM/OpenWAM-Alpha-Sim-RoboDojo
- Dataset de entrenamiento: https://huggingface.co/datasets/seungkukim/robodojo-clean-rollouts-openwam-hdf5-24ep
- Paper OpenWAM: https://arxiv.org/abs/2609.07398
