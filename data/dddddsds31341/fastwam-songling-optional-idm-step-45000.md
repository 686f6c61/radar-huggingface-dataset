# dddddsds31341/FastWAM-Songling-Optional-IDM-Step-45000

## Resumen

FastWAM Songling Optional-IDM Step 45000 es un checkpoint intermedio de un modelo de politica robotica (vision-language-action) desarrollado por el usuario dddddsds31341, construido mediante fine-tuning del modelo generativo de video Wan-AI/Wan2.2-TI2V-5B. El modelo esta disenado para control de robots manipuladores Agilex Songling, tomando como entrada imagenes RGB de tres camaras (`top_head`, `hand_left`, `hand_right`), un estado articular de 14 dimensiones y un prompt de tarea, y produciendo secuencias de acciones de forma `(32, 14)` en radianes articulares absolutos y metros de gripper.

Se trata de un checkpoint intermedio en el paso 45.000 de un entrenamiento cuyo objetivo declarado era de 63.292 actualizaciones, por lo que no es el modelo final de una epoca. El autor no reclama ningun resultado de rollout real ni tasa de exito en validacion. Los pesos se exportaron desde un estado de entrenamiento distribuido en 32 GPUs y no incluyen estado de optimizador, scheduler ni RNG, por lo que no permiten reanudar el entrenamiento de forma exacta.

La relevancia del modelo es acotada: se publica como material reproducible de investigacion en robotica (pipeline `robotics`, libreria `fastwam`), con un contrato de inferencia explicito y estadisticas de normalizacion incluidas, pero sin licencia declarada, sin idiomas declarados y con cero descargas. Es un artefacto tecnico para inspeccion y experimentacion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (fine-tuning de Wan-AI/Wan2.2-TI2V-5B, modelo generativo de video; componentes `mot` y `proprio_encoder`) |
| Parametros totales | No disponible de forma explicita; el fichero de pesos BF16 ocupa 12.041.707.939 bytes (aprox. 12 GB, coherente con un orden de magnitud de ~6.000 millones de parametros en BF16) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | `.pt` (PyTorch, BF16) en `weights/step_000045000.pt`; incluye `config.yaml`, `dataset_stats.json`, `inference_contract.json`, `STAGE_COMPLETE.json` y codigo fuente en `code/fastwam_source.zip` |

## Arquitectura y entrenamiento

El modelo parte de Wan2.2-TI2V-5B, un modelo generativo de video texto-imagen-a-video, y se adapta mediante fine-tuning a una politica de accion robotica. Los pesos exportados contienen los modulos `mot` (presumiblemente un transformer de mezcla de observacion y tarea) y `proprio_encoder` (codificador del estado propioceptivo de 14 dimensiones), junto con el paso de entrenamiento embebido y el `torch_dtype`. El autor no detalla en la informacion disponible la composicion del dataset, el numero de tokens de entrenamiento ni si se emplearon tecnicas de RLHF o DPO.

El entrenamiento se realizo en un estado distribuido de 32 GPUs con un objetivo de 63.292 actualizaciones; este paquete corresponde al paso 45.000, es decir, aproximadamente el 71% del objetivo declarado. El modo de inferencia se selecciona con `action_infer_mode="idm"` (Optional-IDM), lo que sugiere un esquema de decodificacion de acciones basado en un modelo inverso de dinamica opcional. El paquete elimina las comprobaciones de digest adicionales del loader intermedio, pero mantiene las verificaciones de tamano de fichero, paso, arquitectura y carga estricta de parametros. No se incluyen registros de W&B, logs de entrenamiento, shards de optimizador ni datasets.

## Capacidades

- Generacion de secuencias de acciones roboticas: salida de forma `(32, 14)` con radianes articulares absolutos y metros nativos de gripper.
- Percepcion visual multi-camara: consume tres vistas RGB uint8 (`top_head`, `hand_left`, `hand_right`), redimensionadas a 224x224 y concatenadas horizontalmente en 224x672.
- Condicionamiento por prompt de tarea en lenguaje natural.
- Integracion de estado propioceptivo de 14 dimensiones mediante `proprio_encoder`.
- Inferencia en modo IDM (`action_infer_mode="idm"`), con soporte para el esquema Optional-IDM incluido en el codigo fuente.
- Conversion de coordenadas de gripper mediante la referencia registrada de 0,08 m (convencion de control, no calibracion de hardware).
- Carga en CPU verificada por el autor; inferencia prevista en CUDA.
- No se declaran capacidades de tool calling, razonamiento multi-paso, agentes genericos ni soporte multilingue.

## Casos de uso

- Investigacion en aprendizaje por imitacion: el checkpoint sirve como punto de partida o referencia intermedia para estudiar la evolucion del entrenamiento de una politica VLA sobre Wan2.2, comparando el paso 45.000 con checkpoints posteriores.
- Reproduccion de pipelines de robotica: el paquete incluye `config.yaml`, `dataset_stats.json` e `inference_contract.json`, lo que permite reconstruir la cadena de normalizacion y las convenciones de camaras, articulaciones y gripper en un entorno controlado.
- Control de un manipulador Agilex Songling en laboratorio: con las tres camaras y el estado de 14 dimensiones, el modelo emite trayectorias de 32 pasos en radianes absolutos aptas para pruebas de brazos robotizados en entornos de investigacion.
- Evaluacion de esquemas de decodificacion de acciones: el modo `idm` y el soporte Optional-IDM permiten comparar estrategias de inferencia de acciones sobre la misma base generativa de video.
- Docencia y formacion en VLA: el contrato de inferencia explicito y el loader `songling_stage_policy.py` facilitan explicar la interfaz entre percepcion, estado propioceptivo y accion en un modelo real.
- Auditoria de artefactos de entrenamiento: los metadatos de `STAGE_COMPLETE.json` (paso, dimensiones, tamanos de fichero) permiten verificar la integridad del checkpoint y su correspondencia con el estado de entrenamiento declarado.
- Base para fine-tuning posterior: al ser un checkpoint intermedio con pesos cargables y estadisticas de normalizacion, puede utilizarse como inicializacion para experimentos propios, siempre que se respete el contrato de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se reclama ningun rollout de robot ni tasa de exito en validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos BF16 ocupa 12.041.707.939 bytes (aprox. 12 GB); se necesita VRAM adicional para el VAE oficial de Wan, el encoder T5, el tokenizer y las activaciones, por lo que el consumo total supera con holgura los 12 GB.
- GPU recomendadas: no disponibles de forma explicita; el entrenamiento se realizo en 32 GPUs. Para inferencia se requiere CUDA (`device="cuda"` en el loader).
- Cabe en GPU de consumo: no confirmado; con 12 GB solo de pesos BF16, una RTX 4090 de 24 GB es el minimo plausible para el conjunto completo, pero no hay datos publicados de consumo total.
- Opciones de despliegue: loader propio `songling_stage_policy.py` con la libreria `fastwam`; requiere extraer `code/fastwam_source.zip` e instalar sus dependencias. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Assets externos obligatorios: VAE oficial de Wan, encoder T5 y tokenizer, descargados por separado.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (politicas VLA para manipulacion robotica) ni datos de rendimiento que permitan una comparacion fundamentada.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 45.000 de un objetivo de 63.292 actualizaciones; no es el modelo final de una epoca.
- Sin validacion: el autor no reclama ningun rollout de robot ni tasa de exito; no hay evidencia publicada de funcionamiento en hardware real.
- Sin licencia declarada: no se especifican condiciones de uso comercial ni de redistribucion; debe tratarse como no apto para produccion hasta aclarar la licencia.
- Sin reanudacion exacta de entrenamiento: no se incluyen estado de optimizador, scheduler ni RNG.
- Dependencias externas no incluidas: VAE, T5 y tokenizer de Wan deben obtenerse por separado.
- Convenciones de control acopladas: la conversion de gripper usa una referencia de 0,08 m que es una convencion de coordenadas, no una calibracion de hardware; es imprescindible revisar `inference_contract.json` antes del despliegue.
- Entrada rigida: tres camaras con nombres fijos, estado de 14 dimensiones y redimensionado a 224x224 con concatenacion a 224x672; cualquier desviacion del contrato invalida la inferencia.
- Idiomas no declarados: no hay garantia de comportamiento con prompts en castellano u otros idiomas.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado en la informacion disponible.
- Trazabilidad limitada: sin logs de entrenamiento, registros W&B ni datasets, la reproducibilidad del proceso queda restringida al checkpoint y su configuracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/FastWAM-Songling-Optional-IDM-Step-45000
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
