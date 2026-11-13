# dddddsds31341/FastWAM-Fold-Towel-IOReset-Epoch-2

## Resumen

FastWAM-Fold-Towel-IOReset-Epoch-2 es un checkpoint de evaluacion derivado de un fine-tune del modelo base Wan-AI/Wan2.2-TI2V-5B, adaptado a control robotico bimanual. Lo publica el usuario dddddsds31341 y pertenece a la familia FastWAM, un marco que combina un experto de video con un transformer de acciones para predecir primero el futuro visual y despues una secuencia de acciones. El checkpoint corresponde a la epoca 2 de 6 (paso de optimizador 9916) de un entrenamiento independiente sobre la tarea de doblar una toalla, con inicializacion de tipo IO reset.

El modelo resuelve una tarea muy concreta: doblar una toalla larga con dos brazos, usando un robot Agilex PiPER con dos pinzas. No es un modelo de lenguaje ni un modelo multimodal de proposito general; es un policy de robotica que consume tres vistas RGB (top_head, hand_left, hand_right) y produce chunks de 32 acciones de 14 dimensiones (6 articulaciones por brazo mas apertura de pinza). Su relevancia es metodologica: ilustra el enfoque de world-action models aplicado a manipulacion bimanual con datos de demostracion limitados (100 demostraciones).

El repositorio pesa 12 GB e incluye pesos en BF16 (model.pt), configuracion resuelta, estadisticas de normalizacion, contrato de inferencia y el codigo de FastWAM v8. No se publican resultados de exito en robot real ni validacion en held-out, por lo que debe tratarse como un artefacto de evaluacion e investigacion, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model: experto de video (Wan2.2-TI2V-5B) + transformer de acciones + encoder de propriocepcion |
| Parametros totales | no disponible (repo de 12 GB, pesos en BF16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens de embedding de instruccion (UMT5); 9 frames de video por muestra |
| Tipos de cuantizacion | no disponible (pesos almacenados en BF16) |
| Idiomas soportados | no disponible (la instruccion de tarea se codifica con UMT5 de Wan2.1) |
| Licencia | other |
| Formato de pesos | model.pt (PyTorch), BF16; no es un modelo `from_pretrained` de Transformers |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FastWAM: un experto de video inicializado desde Wan2.2-TI2V-5B y un transformer de acciones que se entrenan conjuntamente con perdidas de denoising de video y de accion con pesos iguales (`action_idm_prob` 0.5). En inferencia, el modelo primero predice el video futuro y despues genera el chunk de 32 acciones (`action_infer_mode="idm"`, 20 pasos de inferencia). La entrada visual son tres camaras RGB (`top_head`, `hand_left`, `hand_right`) redimensionadas a 224x224 y concatenadas horizontalmente a 224x672, con 9 frames de video por muestra. La propriocepcion se codifica con un encoder dedicado.

El entrenamiento parte del checkpoint preentrenado FastWAM Optional-IDM Songling (paso 45.000, no publico). El encoder de accion, la cabeza de accion y el encoder de propriocepcion se reinicializan con semilla 42 porque las estadisticas de normalizacion de ese checkpoint colapsaban 9 de las 14 dimensiones de accion/estado. Los datos son el dataset `yuyingyinya/fold_towel` (100 demostraciones, 99.151 frames, 30 Hz), con 14 dimensiones de articulaciones absolutas en radianes y pinzas como fraccion de apertura sobre 0,08 m. Se entreno en cuatro A800 con batch global 20, learning rate constante 1e-5, AdamW, weight decay 0,01, clipping de norma 1.0, BF16 y DeepSpeed ZeRO-1, durante 4.958 updates por epoca y 6 epocas (29.748 updates totales). La normalizacion min/max es especifica de la tarea (`dataset_stats.json`).

## Capacidades

- Prediccion de acciones robotica bimanual: genera chunks de 32 acciones de 14 dimensiones para un robot Agilex PiPER (6 articulaciones por brazo mas pinza).
- Prediccion de video futuro como paso intermedio antes de la accion (modo IDM).
- Control basado en vision multi-camara: consume tres vistas RGB simultaneas.
- Condicionamiento por instruccion de tarea en lenguaje natural, codificada con UMT5 (contexto de 128 tokens).
- Integracion de propriocepcion del robot mediante encoder dedicado.
- Ejecucion de una tarea especifica de manipulacion: doblar una toalla en direccion de borde corto, borde largo y borde corto, y alisarla.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades de texto, vision general o audio.

## Casos de uso

- Investigacion en world-action models: sirve como checkpoint de referencia para reproducir y comparar el enfoque FastWAM en una tarea de manipulacion bimanual concreta, usando `config.yaml`, `dataset_stats.json` e `inference_contract.json` del mismo repositorio.
- Evaluacion de politicas bimanuales en laboratorio: permite desplegar un policy entrenado sobre 100 demostraciones en un robot Agilex PiPER con dos pinzas y medir exito en la tarea de doblar toallas.
- Estudio de inicializaciones: al existir una variante paralela con inicializacion fresh IDM, este checkpoint IO reset permite comparar el efecto de la inicializacion sobre el aprendizaje de la tarea.
- Base para fine-tuning en tareas de plegado: el modelo puede servir de punto de partida para nuevas tareas de manipulacion de tejidos, reutilizando el experto de video preentrenado.
- Analisis de prediccion de video en robotica: el modo IDM permite estudiar la calidad de la prediccion del futuro visual como senal intermedia antes de la accion.
- Reproduccion de pipelines de entrenamiento: el repo incluye `code.zip` (FastWAM v8) y `requirements-fastwam.txt`, lo que facilita replicar el entorno de entrenamiento en clusters con A800 o equivalentes.
- Docencia y divulgacion tecnica: ejemplo realista de como se estructura un checkpoint de robotica con contrato de inferencia, estadisticas de normalizacion y convenciones de articulaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reporta tasa de exito en robot real ni validacion en held-out, y que la perdida de entrenamiento no es una metrica de exito de la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo de 12 GB con pesos BF16 sugiere que se necesita una GPU con al menos 16-24 GB para cargar el modelo completo, aunque no se confirma.
- GPU recomendadas: el entrenamiento uso cuatro A800; para inferencia se requiere una GPU con soporte BF16 y memoria suficiente para el modelo base Wan2.2-TI2V-5B mas el transformer de acciones.
- Cabe en GPU consumer: no confirmado; probablemente en RTX 4090 (24 GB) si el modelo completo cabe en BF16, pero no hay dato oficial.
- Opciones de despliegue: no es un modelo `from_pretrained` de Transformers; requiere el checkout de FastWAM incluido en `code.zip`, `hydra.utils.instantiate` sobre `config.yaml`, `model.load_checkpoint("model.pt")` y `model.infer_action(..., action_infer_mode="idm", num_inference_steps=20)`. Necesita los pesos VAE de Wan2.2-TI2V-5B por separado (`DIFFSYNTH_MODEL_BASE_PATH`) y el encoder UMT5 de Wan2.1.
- Latencia y throughput: no disponibles. La inferencia implica prediccion de video futuro mas 20 pasos de denoising de accion, lo que anade coste frente a policies puramente de accion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM-Fold-Towel-IOReset-Epoch-2 | no disponible (base 5B) | 128 tokens de instruccion, 9 frames | Doblado de toalla bimanual | other | Publico en HF |
| FastWAM Optional-IDM Songling (checkpoint base) | no disponible | no disponible | Manipulacion general | no disponible | No publico (paso 45.000) |
| Variante fresh IDM del mismo fine-tune | no disponible | 128 tokens de instruccion, 9 frames | Doblado de toalla bimanual | other | No se indica enlace en la informacion disponible |
| Wan-AI/Wan2.2-TI2V-5B (modelo base) | 5B (aproximado por nombre) | no disponible | Generacion de video texto-imagen | no disponible en esta ficha | Publico en HF |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No se reporta tasa de exito en robot real ni validacion en held-out; la perdida de entrenamiento no es metrica de exito.
- Es un checkpoint de evaluacion de la epoca 2 de 6: no representa el modelo final del entrenamiento.
- Las estadisticas de normalizacion y el contrato de pinza deben tomarse de este mismo repositorio; usar estadisticas de otro checkpoint produce acciones incorrectas.
- El checkpoint base Songling colapsaba 9 de las 14 dimensiones de accion/estado, motivo por el que se reinicializaron capas; esto puede introducir diferencias de comportamiento frente al preentrenamiento original.
- No es un modelo standalone de Transformers: requiere el codigo FastWAM, los pesos VAE de Wan2.2-TI2V-5B y el encoder UMT5 de Wan2.1.
- La configuracion conserva rutas del sistema de ficheros de la maquina de entrenamiento; deben actualizarse para otro entorno.
- El fichero eval-only no permite restaurar el estado del optimizador para continuar el entrenamiento exacto.
- Licencia "other": no se detallan condiciones de uso comercial; debe revisarse antes de cualquier despliegue productivo.
- El modelo esta especializado en una unica tarea y un unico robot (Agilex PiPER); no generaliza a otras tareas sin fine-tuning.
- Riesgo de alucinacion visual en la prediccion de video futuro no cuantificado; sesgos no documentados.
- Idiomas soportados no disponibles; la instruccion se codifica con UMT5, pero no se especifica cobertura linguistica.

## Enlaces

- Hugging Face: https://huggingface.co/dddddsds31341/FastWAM-Fold-Towel-IOReset-Epoch-2
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset: https://huggingface.co/datasets/yuyingyinya/fold_towel
- Codigo FastWAM referenciado en la model card: https://github.com/yuantianyuan01/FastWAM (commit 7faa711)
