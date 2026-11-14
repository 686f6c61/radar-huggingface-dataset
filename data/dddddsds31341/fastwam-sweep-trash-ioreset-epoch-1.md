# dddddsds31341/FastWAM-Sweep-Trash-IOReset-Epoch-1

## Resumen

FastWAM-Sweep-Trash-IOReset-Epoch-1 es un checkpoint de evaluacion de un modelo de robotica bimanual desarrollado por el usuario dddddsds31341. Se trata de un fine-tune del modelo base Wan-AI/Wan2.2-TI2V-5B (un modelo generativo de video) adaptado mediante la arquitectura FastWAM para predecir acciones de robot a partir de observaciones visuales y una instruccion de tarea en lenguaje natural. El modelo resuelve una tarea concreta: el barrido de papeles arrugados con escoba y recogedor usando dos brazos roboticos Agilex PiPER.

El checkpoint corresponde a la epoca 1 de 6 (paso de optimizador 2425) de un entrenamiento independiente con la inicializacion denominada "IO reset". Se entrenaron dos inicializaciones con datos e hiperparametros identicos (IO reset y fresh IDM), y esta es la variante IO reset. El modelo parte del checkpoint preentrenado FastWAM Optional-IDM Songling (paso 45.000, no publico), aunque reinicializa el encoder de accion, la cabeza de accion y el encoder de propriocepcion porque las estadisticas de normalizacion del checkpoint original colapsaban 9 de las 14 dimensiones de accion/estado.

Con 12 GB de repositorio y pesos en BF16, el modelo no es un transformer convencional de `from_pretrained`: requiere el codigo FastWAM v8 incluido en `code.zip`, los pesos del VAE de Wan2.2-TI2V-5B y el encoder de texto UMT5 de Wan2.1 para funcionar. Su relevancia es acotada: es un checkpoint de evaluacion de investigacion para una tarea robotica especifica, sin tasa de exito en bucle cerrado reportada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto video/accion (video expert + action-expert transformer) sobre Wan2.2-TI2V-5B; prediccion de video futuro seguida de chunk de acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 128 tokens para la instruccion de tarea (embeddings UMT5 cacheados); 9 frames de video de entrada; chunk de 32 pasos de accion |
| Tipos de cuantizacion | no disponible (pesos almacenados en BF16) |
| Idiomas soportados | no disponible (la instruccion de tarea esta en ingles) |
| Licencia | other |
| Formato de pesos | model.pt (PyTorch, BF16); requiere config.yaml, dataset_stats.json e inference_contract.json del mismo repositorio |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FastWAM, que combina un experto de video (derivado de Wan2.2-TI2V-5B) con un transformer experto en acciones. La inferencia funciona en dos fases: primero predice el video futuro y despues genera un chunk de 32 pasos de accion (`action_infer_mode="idm"`, 20 pasos de inferencia). El encoder de accion, la cabeza de accion y el encoder de propriocepcion se reinicializaron con semilla 42, mientras que el experto de video y el transformer de acciones parten del checkpoint FastWAM Optional-IDM Songling (paso 45.000).

El entrenamiento uso el dataset `yuyingyinya/sweep_trash` (revision 0dd5ff1f576de17dcf06b49d352e0f125a1f43e6): 100 demostraciones, 48.495 frames a 30 Hz, todas usadas para entrenamiento. Se ejecuto en cuatro GPUs A800 con batch de 5 por GPU y acumulacion de gradiente 1 (batch global 20), learning rate constante de 1e-5, AdamW con weight decay 0.01, clipping de norma global 1.0, BF16 y DeepSpeed ZeRO-1. Cada epoca supone 2.425 actualizaciones del optimizador; la ejecucion completa son 6 epocas (14.550 actualizaciones). Las perdidas de denoising de video y de accion tienen pesos iguales, con `action_idm_prob` de 0.5. Las acciones son objetivos absolutos de 14 dimensiones en radianes (6 articulaciones izquierdas + pinza, 6 derechas + pinza), con pinzas expresadas como fraccion de apertura sobre 0.08 m. Se usan tres camaras RGB (`top_head`, `hand_left`, `hand_right`) redimensionadas a 224x224 y concatenadas horizontalmente a 224x672.

## Capacidades

- Prediccion de acciones roboticas bimanuales de 14 dimensiones (12 articulaciones + 2 pinzas) para el robot Agilex PiPER.
- Generacion de video futuro condicionada por observacion visual e instruccion de tarea, usada como paso intermedio antes de la prediccion de acciones.
- Ejecucion de una tarea especifica de manipulacion: agarrar el recogedor con una pinza, la escoba con la otra y barrer dos trozos de papel arrugado hacia el recogedor.
- Procesamiento de tres vistas RGB simultaneas (cabeza y ambas manos) con 9 frames de contexto por muestra.
- Condicionamiento por instruccion en lenguaje natural mediante embeddings UMT5 (contexto de 128 tokens).
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en imitacion robotica bimanual: el modelo sirve como referencia reproducible para estudiar el efecto de distintas inicializaciones (IO reset frente a fresh IDM) sobre una misma tarea y dataset, ya que ambos entrenamientos comparten datos e hiperparametros.
- Evaluacion de pipelines FastWAM: permite validar el flujo completo de inferencia (prediccion de video futuro, luego chunk de 32 acciones) en un entorno controlado con el contrato de inferencia incluido.
- Benchmark interno de tareas de barrido: util para comparar arquitecturas o checkpoints en la tarea sweep_trash antes de desplegar en el robot fisico, usando las tres camaras y la convencion de 14 dimensiones.
- Estudio de normalizacion de acciones: el checkpoint documenta explicitamente el colapso de 9 de 14 dimensiones en el modelo preentrenado y la reinicializacion aplicada, lo que lo convierte en material de analisis sobre estadisticas de normalizacion por tarea.
- Base para fine-tuning posterior: al incluir `config.yaml`, `dataset_stats.json` e `inference_contract.json`, puede reutilizarse como punto de partida para variantes de la misma tarea o robots con el mismo esquema de articulaciones.
- Docencia y divulgacion: ejemplo concreto de modelo video-accion aplicado a robotica, con trazabilidad completa de hiperparametros, hardware y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reporta tasa de exito en bucle cerrado ni resultado de validacion en held-out, y advierte que la perdida de entrenamiento no es una metrica de exito de la tarea robotica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 12 GB y los pesos estan en BF16, por lo que se requiere una GPU con memoria suficiente para el modelo conjunto mas el VAE de Wan2.2-TI2V-5B y el encoder UMT5 de Wan2.1.
- GPU de entrenamiento documentadas: cuatro NVIDIA A800 con batch de 5 por GPU.
- GPU recomendadas para inferencia: no disponibles; por el tamano del modelo base (5B en el experto de video) se descarta su ejecucion en GPUs de consumo con poca VRAM, aunque no hay datos confirmados.
- Opciones de despliegue: no se soporta `from_pretrained` de Transformers; requiere el checkout FastWAM de `code.zip`, `hydra.utils.instantiate(cfg.model, ...)`, `model.load_checkpoint("model.pt")` y `model.infer_action(..., action_infer_mode="idm", num_inference_steps=20)`. Necesita los pesos del VAE de Wan2.2-TI2V-5B via `DIFFSYNTH_MODEL_BASE_PATH` y el encoder de texto UMT5 de Wan2.1 con tokenizer.
- Latencia y throughput: no disponibles.
- Nota: la configuracion conserva rutas del sistema de ficheros de la maquina de entrenamiento y deben actualizarse para otro equipo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM-Sweep-Trash-IOReset-Epoch-1 | no disponible (base 5B) | 128 tokens de instruccion; 9 frames; chunk de 32 acciones | Barrido bimanual Agilex PiPER | other | Publico en HF (checkpoint de evaluacion) |
| FastWAM Optional-IDM Songling (checkpoint base) | no disponible | no disponible | Manipulacion general | no disponible | No publico (paso 45.000) |
| Wan-AI/Wan2.2-TI2V-5B | 5B (experto de video) | no disponible | Generacion de video texto-imagen-video | no disponible | Publico en HF |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de evaluacion de la epoca 1 de 6: no representa el modelo final del entrenamiento.
- No se reporta tasa de exito en robot real ni validacion en held-out; la perdida de entrenamiento no debe interpretarse como metrica de exito.
- El fichero es solo de evaluacion: no puede restaurar el estado del optimizador para continuar el entrenamiento de forma exacta.
- Las estadisticas de normalizacion y el contrato de pinza deben provenir de este mismo repositorio; usar estadisticas de otro checkpoint produce acciones incorrectas.
- La configuracion contiene rutas de la maquina de entrenamiento que deben corregirse en otro entorno.
- Requiere dependencias externas no incluidas: pesos del VAE de Wan2.2-TI2V-5B y encoder UMT5 de Wan2.1 con tokenizer.
- No es compatible con `from_pretrained` de Transformers; el despliegue exige el codigo FastWAM v8 incluido.
- Entrenado exclusivamente para una tarea y un robot concretos (Agilex PiPER, 14 dimensiones); no generaliza a otras morfologias sin adaptacion.
- Licencia "other": deben revisarse los terminos antes de cualquier uso comercial, incluidos los del modelo base Wan2.2-TI2V-5B.
- Idiomas soportados no documentados; la instruccion de tarea esta en ingles.
- Riesgo de alucinacion visual y de predicciones de video futuro inconsistentes no evaluado en la informacion disponible.
- Sin datos publicos de sesgos.

## Enlaces

- Hugging Face: https://huggingface.co/dddddsds31341/FastWAM-Sweep-Trash-IOReset-Epoch-1
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset: https://huggingface.co/datasets/yuyingyinya/sweep_trash
- Repositorio de codigo FastWAM referenciado: https://github.com/yuantianyuan01/FastWAM (commit 7faa711)
