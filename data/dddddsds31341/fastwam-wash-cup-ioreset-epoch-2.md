# dddddsds31341/FastWAM-Wash-Cup-IOReset-Epoch-2

## Resumen

FastWAM-Wash-Cup-IOReset-Epoch-2 es un checkpoint de evaluación de un modelo de robotica de proposito general especializado en una tarea bimanual concreta: sostener una taza con un gripper mientras el otro limpia su interior con un cepillo de botella. Lo publica el usuario dddddsds31341 y se construye como un fine-tune del modelo Wan-AI/Wan2.2-TI2V-5B, un modelo de generacion video-texto de 5.000 millones de parametros que aqui se reutiliza como "experto de video" dentro de una arquitectura conjunta video-accion denominada FastWAM.

El modelo resuelve el problema de generar trayectorias de accion de 14 dimensiones (6 articulaciones + gripper por brazo) a partir de observaciones visuales de tres camaras y una instruccion de tarea en lenguaje natural. Su relevancia es acotada: no es un modelo de uso general, sino un artefacto de investigacion que documenta un experimento de inicializacion (IO reset frente a fresh IDM) sobre el dataset `yuyingyinya/wash_cup` de 100 demostraciones y 69.728 fotogramas a 30 Hz.

Se trata de un checkpoint de la epoca 2 de 6 (paso de optimizador 6974) y el propio autor advierte que no se reporta tasa de exito en bucle cerrado ni validacion retenida. Es, por tanto, material de referencia para reproducir el pipeline de entrenamiento, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer conjunto video-accion (FastWAM) sobre Wan2.2-TI2V-5B; experto de video + experto de accion + encoder de accion + cabeza de accion + encoder de propiocepcion |
| Parametros totales | no disponible (modelo base Wan2.2-TI2V-5B de 5.000 millones; el checkpoint completo no declara recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens para la instruccion de tarea (embeddings UMT5); 9 fotogramas de video y chunk de 32 acciones por muestra |
| Tipos de cuantizacion | no disponible (pesos almacenados en BF16) |
| Idiomas soportados | no disponible (la instruccion se codifica con el text encoder UMT5 de Wan2.1) |
| Licencia | other (terminos no detallados en la model card) |
| Formato de pesos | `model.pt` (PyTorch, BF16); no es un modelo `from_pretrained` de Transformers |

## Arquitectura y entrenamiento

FastWAM combina un experto de video derivado de Wan2.2-TI2V-5B con un experto de accion y un transformer de acciones. El checkpoint parte del FastWAM Optional-IDM Songling (paso 45.000, no publico) para el experto de video y el transformer de acciones; el encoder de accion, la cabeza de accion y el encoder de propiocepcion se reinicializan con semilla 42 porque las estadisticas de normalizacion del checkpoint original colapsaban 9 de las 14 dimensiones de accion/estado. El modo de inferencia es `idm`: el modelo predice primero el video futuro y despues el chunk de 32 acciones con 20 pasos de difusion.

El entrenamiento usa el dataset `yuyingyinya/wash_cup` (100 demostraciones, 69.728 fotogramas, 30 Hz) con cuatro GPU A800, batch global 20 (5 por GPU), learning rate constante 1e-5, AdamW con weight decay 0.01, clipping de norma global 1.0, BF16 y DeepSpeed ZeRO-1. Se realizan 3.487 actualizaciones por epoca y el run completo son 6 epocas (20.922 actualizaciones); este checkpoint corresponde a la epoca 2. Las perdidas de denoising de video y accion tienen el mismo peso, con `action_idm_prob` de 0.5. Las acciones son objetivos absolutos de articulacion en radianes (izquierdo 6 + gripper, derecho 6 + gripper), con grippers expresados como fraccion de apertura sobre 0,08 m. Se emplean tres camaras RGB (`top_head`, `hand_left`, `hand_right`) redimensionadas a 224x224 y concatenadas horizontalmente a 224x672.

## Capacidades

- Generacion de trayectorias de accion bimanual de 14 dimensiones para el robot Agilex PiPER.
- Prediccion de video futuro como paso intermedio antes de la accion (modo `idm`).
- Condicionamiento por instruccion de tarea en lenguaje natural (contexto de 128 tokens UMT5).
- Fusion de tres vistas RGB (cabeceo superior y una por mano) en una unica representacion de 224x672.
- Manejo de propriocepcion mediante encoder dedicado y estadisticas de normalizacion especificas de la tarea.
- Generacion de chunks de accion de 32 pasos para control a 30 Hz.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades de audio o vision general; su alcance es exclusivamente robotico y mono-tarea.

## Casos de uso

- Reproduccion de experimentos de inicializacion: sirve para comparar la inicializacion "IO reset" frente a "fresh IDM" con datos e hiperparametros identicos, util en investigacion sobre transferencia desde checkpoints preentrenados.
- Limpieza bimanual de utensilios: el modelo ejecuta la secuencia sostener taza, cepillar el interior, devolver el cepillo y colocar la taza boca abajo en el escurridor, adecuado para laboratorios de robotica de manipulacion.
- Base para fine-tunes en tareas de limpieza o manipulacion de recipientes: al compartir arquitectura con otros checkpoints FastWAM, puede reutilizarse como punto de partida con nuevas estadisticas de normalizacion.
- Validacion de pipelines de entrenamiento: el `config.yaml`, `dataset_stats.json` e `inference_contract.json` permiten verificar que un entorno de despliegue reproduce exactamente las convenciones de entrenamiento.
- Investigacion en modelos video-accion: el modo `idm` con prediccion de video futuro es un objeto de estudio para analizar si la prediccion visual intermedia mejora la calidad de las acciones.
- Docencia y divulgacion: como ejemplo completo de fine-tune de un modelo video-texto de 5.000 millones hacia robotica, ilustra el flujo de datos, normalizacion y contrato de inferencia.
- Evaluacion comparativa de checkpoints por epoca: al existir checkpoints de epocas intermedias, permite estudiar la evolucion de la perdida y del comportamiento sin necesidad de reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se reporta tasa de exito en bucle cerrado ni resultado de validacion retenida, y advierte que la perdida de entrenamiento no es una metrica de exito de la tarea robotica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 12,0 GB y los pesos estan en BF16, por lo que se requiere al menos una GPU con memoria suficiente para el modelo base de 5.000 millones de parametros mas el VAE de Wan2.2-TI2V-5B, que se carga por separado.
- GPU recomendadas: el entrenamiento se realizo en cuatro NVIDIA A800; para inferencia se recomienda una A100 o H100 por la carga del VAE y del experto de video.
- GPU de consumo: no se documenta soporte para GPUs de consumo; no hay cuantizaciones publicadas (GGUF, AWQ, etc.).
- Opciones de despliegue: no se soportan vLLM, llama.cpp, Ollama ni TGI; el despliegue exige extraer `code.zip`, instalar el checkout de FastWAM, construir el modelo con `hydra.utils.instantiate` desde `config.yaml` y llamar a `model.load_checkpoint("model.pt")` e `infer_action(..., action_infer_mode="idm", num_inference_steps=20)`.
- Dependencias adicionales: pesos del VAE de Wan2.2-TI2V-5B via `DIFFSYNTH_MODEL_BASE_PATH` y el text encoder y tokenizer UMT5 de Wan2.1 para codificar la instruccion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM-Wash-Cup-IOReset-Epoch-2 | base de 5.000 M (total no declarado) | 128 tokens de instruccion; 9 frames; chunk de 32 acciones | Manipulacion bimanual mono-tarea (Agilex PiPER) | other | Publico en Hugging Face |
| Wan-AI/Wan2.2-TI2V-5B | 5.000 M | no disponible | Generacion video-texto | no disponible en la informacion | Publico en Hugging Face |
| FastWAM Optional-IDM Songling (paso 45.000) | no disponible | no disponible | Robotica general FastWAM | no disponible | No publico |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No se reporta tasa de exito en bucle cerrado ni validacion retenida; la perdida de entrenamiento no es una metrica de exito robotico.
- Es un checkpoint de evaluacion de la epoca 2 de 6: no representa el modelo final del run.
- El fichero es solo de evaluacion y no permite restaurar el estado del optimizador para continuar el entrenamiento de forma exacta.
- Las estadisticas de normalizacion y el contrato del gripper deben provenir de este mismo repositorio; usar estadisticas de otro checkpoint produce acciones incorrectas.
- El `config.yaml` conserva rutas del sistema de ficheros de la maquina de entrenamiento y deben actualizarse para otro entorno.
- Requiere dependencias externas no incluidas: VAE de Wan2.2-TI2V-5B y text encoder y tokenizer UMT5 de Wan2.1.
- No es un modelo `from_pretrained` de Transformers; la carga exige el codigo de FastWAM v8 incluido en `code.zip`.
- Entrenado exclusivamente con 100 demostraciones de una unica tarea y un unico robot; no generaliza a otras tareas, objetos ni morfologias sin nuevo fine-tune.
- Licencia "other" sin terminos detallados: es necesario consultar al autor antes de cualquier uso comercial.
- Riesgo de alucinacion visual y de deriva en la prediccion de video futuro, no cuantificado en la informacion disponible.
- Idiomas soportados no declarados; la instruccion se limita a 128 tokens UMT5.
- Sesgos conocidos: no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/FastWAM-Wash-Cup-IOReset-Epoch-2
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset: https://huggingface.co/datasets/yuyingyinya/wash_cup
- Repositorio de codigo FastWAM (referencia en la model card): https://github.com/yuantianyuan01/FastWAM (commit `7faa711`)
