# echoma1127/QiYuan1127-PiPER-PI05-best004000

## Resumen

QiYuan1127-PiPER-PI05-best004000 es un checkpoint de politica robotica entrenado mediante aprendizaje por imitacion sobre la arquitectura pi0.5 (pi05) de LeRobot. Lo publica el usuario echoma1127 y parte del modelo base lerobot/pi05_base, un modelo vision-lenguaje-accion (VLA) construido sobre la columna vertebral PaliGemma. No es un adaptador LoRA, sino un checkpoint completo del "expert-B" nativo de pi0.5, con la parte vision-lenguaje congelada y el experto de accion entrenado de forma especifica para una tarea de manipulacion con el brazo robotico PiPER.

El modelo resuelve una tarea muy concreta: recoger un cubo rojo y colocarlo en un cuadrado negro situado a la izquierda de la mesa. Se entreno con 52 episodios de demostraciones locales (20.488 fotogramas a 20 Hz), usando los episodios 0-45 para entrenamiento (18.231 fotogramas) y los 46-51 para validacion (2.257 fotogramas). El checkpoint seleccionado corresponde al paso 4000, con la mejor perdida de validacion registrada (0,0672206492) dentro de un entrenamiento de 20.000 pasos con tamano de lote 8 y semilla 1000.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de fine-tuning de un VLA sobre hardware asequible (PiPER) y como referencia para quien quiera desplegar politicas pi0.5 en LeRobot 0.6.1. El propio autor advierte que no se ha confirmado una recogida y colocacion exitosa completa en el mundo real con esta version, y que no se reclama ningun rendimiento generalista de robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion pi0.5 (pi05) sobre columna vertebral PaliGemma con experto de accion |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en safetensors de precision completa) |
| Idiomas soportados | en, zh |
| Licencia | gemma (sujeta a GEMMA_TERMS.txt, seccion 3.2 y GEMMA_PROHIBITED_USE_POLICY.txt) |
| Formato de pesos | safetensors (model.safetensors, 9.354.050.752 bytes; repo de 9,4 GB) |

## Arquitectura y entrenamiento

El modelo es un checkpoint de politica LeRobot 0.6.1 basado en pi0.5, que combina una columna vertebral vision-lenguaje PaliGemma (congelada durante el entrenamiento) con un experto de accion y proyecciones de accion y de tiempo que si se entrenan. La entrada consta de dos flujos de imagen RGB (`observation.images.global` y `observation.images.wrist`, 640 x 480 antes del preprocesado) y un vector de estado de 7 valores (`observation.state`). La salida son objetivos absolutos para seis articulaciones del brazo en grados y una apertura de pinza en metros.

El entrenamiento se hizo por imitacion sobre un dataset local de demostraciones de colocacion de cubo rojo con PiPER: 52 episodios, 20.488 fotogramas a 20 Hz, con particion 0-45 para entrenamiento y 46-51 para validacion. Se usaron 20.000 pasos totales, tamano de lote 8 y semilla 1000, seleccionando el paso 4000 como mejor checkpoint por perdida de validacion (0,0672206492). El chunk size es 50 y la politica guardada tiene `n_action_steps=10`; algunas configuraciones de despliegue consumen 20 acciones, pero eso es una decision en tiempo de ejecucion y no altera la configuracion guardada. No se documentan tecnicas como RLHF, DPO ni decodificacion especulativa, y el dataset completo no se publica con el modelo.

## Capacidades

- Generacion de acciones de manipulacion robotica: produce objetivos absolutos de articulaciones y apertura de pinza a partir de observaciones visuales y de estado.
- Percepcion visual multi-camara: procesa simultaneamente una vista global y una vista de muneca.
- Control de brazo de 6 grados de libertad mas pinza, en unidades fisicas (grados y metros).
- Aprendizaje por imitacion especifico de tarea: recogida y colocacion de un cubo rojo en una zona objetivo.
- Soporte bilingue declarado en la model card (en, zh) heredado del modelo base.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento.
- No se documentan capacidades de audio ni de vision generalista fuera del pipeline robotico.

## Casos de uso

- Reproduccion de investigacion en VLA: sirve para replicar el pipeline de fine-tuning de pi0.5 sobre PiPER usando los scripts `download_models.py` y `prepare_workspace.py` del repositorio QiYuan1127, manteniendo los siete ficheros del checkpoint juntos.
- Evaluacion de aprendizaje por imitacion con pocos datos: con 18.231 fotogramas de entrenamiento y 2.257 de validacion, es un caso util para estudiar sobreajuste y seleccion de checkpoint en tareas de manipulacion.
- Banco de pruebas de despliegue LeRobot 0.6.1: permite validar la integracion de checkpoints pi0.5 con procesadores y estadisticas de normalizacion concretas antes de escalar a otras tareas.
- Tarea de pick-and-place en laboratorio: el modelo esta entrenado para recoger un cubo rojo y colocarlo en un cuadrado negro a la izquierda de la mesa, un escenario controlado adecuado para pruebas de repetibilidad.
- Referencia de calibracion de camaras y unidades: la model card exige que el orden de camaras, las unidades y las estadisticas del procesador coincidan con el entrenamiento, lo que lo convierte en un caso practico para verificar pipelines de adquisicion.
- Estudio de limitaciones de generalizacion: al no reclamarse rendimiento generalista ni confirmarse el exito completo en el mundo real, es util para medir la brecha entre perdida de validacion y ejecucion fisica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es la perdida de validacion del checkpoint seleccionado (0,0672206492 en el paso 4000), que no es comparable con metricas estandar como MMLU, HumanEval o GSM8K por tratarse de una politica robotica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4.143.404.816 parametros y pesos en precision completa (9,35 GB en safetensors), se necesita al menos espacio para los pesos mas activaciones y buffers de vision, por lo que una GPU de 16 GB o mas es un punto de partida razonable, sin dato confirmado por el autor.
- GPU recomendadas: no disponible; no se documentan modelos de GPU probados.
- Cabe en GPU de consumo: no confirmado; por tamano de pesos, tarjetas de 24 GB (por ejemplo RTX 4090) serian las candidatas mas probables, pero no hay validacion publicada.
- Opciones de despliegue: LeRobot 0.6.1 con los adaptadores de despliegue del repositorio QiYuan1127; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un checkpoint de politica robotica.
- Latencia y throughput: no disponibles.
- Requisito operativo: los siete ficheros del checkpoint deben permanecer juntos y los safetensors del procesador no son intercambiables entre checkpoints; hay que configurar rutas locales antes de la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QiYuan1127-PiPER-PI05-best004000 | 4.143.404.816 | no disponible | Pick-and-place PiPER (fine-tune) | gemma | HuggingFace, repo 9,4 GB |
| lerobot/pi05_base | no disponible en la informacion | no disponible | VLA base pi0.5 | no disponible en la informacion | HuggingFace (modelo base) |
| Otros fine-tunes de pi0.5 sobre LeRobot | no disponible | no disponible | Manipulacion diversa | variable | no disponible |

La comparacion cuantitativa con alternativas no esta disponible: no se han publicado metricas comunes ni resultados de exito en el mundo real para este checkpoint.

## Limitaciones y advertencias

- El autor indica explicitamente que no se ha confirmado una recogida y colocacion exitosa completa en el mundo real para esta version.
- No se reclama ningun rendimiento generalista de robot; la politica esta especializada en una unica tarea y un unico montaje.
- El dataset de entrenamiento no se publica, lo que limita la reproducibilidad completa y la auditoria de sesgos.
- La licencia gemma impone restricciones de uso, incluida la seccion 3.2 de GEMMA_TERMS.txt y GEMMA_PROHIBITED_USE_POLICY.txt; la licencia del codigo del framework no sustituye los terminos del modelo.
- Riesgo de alucinacion y de acciones incorrectas: al ser una politica de accion, los errores se traducen en movimientos fisicos; una descarga no arranca el robot ni autoriza movimiento fisico.
- Dependencia estricta de la configuracion: orden de camaras, unidades y estadisticas del procesador deben coincidir con el entrenamiento; los safetensors del procesador no son intercambiables entre checkpoints.
- Las rutas historicas guardadas en la configuracion documentan procedencia y deben reconfigurarse a rutas locales antes de inferir.
- El tokenizer incluido es una reconstruccion local con evidencia de checksum, y el autor no afirma que sea identico byte a byte al envoltorio JSON upstream de Hugging Face.
- Idiomas declarados limitados a en y zh; no hay evaluacion multilingue publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/echoma1127/QiYuan1127-PiPER-PI05-best004000
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Repositorio de codigo y despliegue: https://github.com/Skyglow1127/QiYuan1127
