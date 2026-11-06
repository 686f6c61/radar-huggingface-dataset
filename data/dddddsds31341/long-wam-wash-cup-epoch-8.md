# dddddsds31341/Long-WAM-Wash-Cup-Epoch-8

## Resumen

Long-WAM Wash Cup Epoch 8 es un checkpoint de evaluacion de un ajuste fino (fine-tune) independiente del modelo de robotica Long-WAM-YAM, desarrollado por el usuario dddddsds31341 a partir del modelo base Efficient-Large-Model/Long-WAM-YAM. El modelo resuelve una tarea concreta de manipulacion bimanual: sujetar y levantar una taza con una pinza mientras la otra limpia su interior con un cepillo de botella, devolver el cepillo y colocar la taza boca abajo en un escurridor. Se trata de un modelo de politica visuo-motora (vision-action) destinado a control de robots, no de un modelo de lenguaje.

El checkpoint corresponde a la epoca 8 de 10 del entrenamiento, en el paso de optimizador 11624, y se publica como material de evaluacion. El repositorio ocupa 12,0 GB e incluye pesos en `model.pt`, configuracion resuelta, estadisticas de normalizacion, el codigo SIP v29 usado en el entrenamiento y el fichero de requisitos. La arquitectura combina un modelo conjunto de video y accion (joint video/action model) con un codificador de propiocepcion, e incorpora el VAE de Wan2.2 y el codificador de texto UMT5 como componentes auxiliares.

Es relevante para investigadores en robotica que quieran reproducir o evaluar politicas bimanuales de horizonte largo sobre el dataset `yuyingyinya/wash_cup`, aunque el autor no reporta tasas de exito en bucle cerrado ni validacion retenida, por lo que su utilidad practica debe validarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto de video y accion (joint video/action model) con codificador de propiocepcion; base Long-WAM-YAM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (historial P48: 48 pasos de historial de video) |
| Tipos de cuantizacion | no disponible (pesos almacenados en el dtype del paso de entrenamiento, BF16) |
| Idiomas soportados | no disponible (modelo de robotica; instruccion de tarea en ingles) |
| Licencia | other (ver metadatos del modelo base) |
| Formato de pesos | `model.pt` (PyTorch); no es un modelo `from_pretrained` de Transformers |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint Efficient-Large-Model/Long-WAM-YAM, que combina un modelo conjunto de video y accion con un codificador de propiocepcion. La entrada visual procede de tres camaras RGB (`top_head`, `hand_left`, `hand_right`) con un layout de video procesado de 384×320, un historial P48 y un chunk de accion de 32 pasos. Las acciones se representan como objetivos articulares absolutos de 14 dimensiones con unidades originales de pinza, ordenadas como 6 articulaciones izquierdas + pinza y 6 articulaciones derechas + pinza.

El entrenamiento se realizo sobre el dataset `yuyingyinya/wash_cup` (revision `dcf90aa38d98e9b6c9f71afe0cfeeb3f50ed74cb`), con 100 demostraciones y 69.728 fotogramas a 30 Hz, usando todas las demostraciones para entrenamiento. Se emplearon cuatro GPUs con batch de 12 por GPU, acumulacion de gradiente 1 y batch global 48; tasa de aprendizaje constante de 1e-5, AdamW con weight decay 0,01, BF16 y DeepSpeed ZeRO-1. Cada epoca comprende 1.453 actualizaciones de optimizador y la ejecucion completa apunta a 14.530 actualizaciones. Se aplican estadisticas z-score especificas de la tarea y el recorte oficial de valores normalizados en `[-5, 5]`. El codigo de entrenamiento es la release SIP v29, basada en `NVlabs/LongLive@cfa4e91eec59429d583326500bf5535c9ce6eec7` con los cambios SIP incluidos.

## Capacidades

- Control visuo-motor bimanual para una tarea de manipulacion especifica (lavado y colocacion de una taza).
- Prediccion de chunks de accion de 32 pasos en espacio de articulaciones absolutas de 14 dimensiones con unidades de pinza.
- Fusion de tres vistas RGB (`top_head`, `hand_left`, `hand_right`) con historial temporal de 48 pasos.
- Integracion de propiocepcion mediante un codificador dedicado.
- Condicionamiento por instruccion de tarea en lenguaje natural a traves del codificador de texto UMT5.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking.

## Casos de uso

- Evaluacion de politicas bimanuales de horizonte largo: el checkpoint sirve para medir el comportamiento de una politica entrenada sobre 100 demostraciones en la tarea de lavado de taza, comparando epocas y pasos dentro de la misma ejecucion.
- Reproduccion de experimentos de robotica: al incluir `config.yaml`, `dataset_stats.json` y el codigo SIP v29, permite reconstruir el pipeline de preprocesamiento y desnormalizacion de acciones en otra maquina.
- Base para ajustes finos en tareas similares: al partir de Long-WAM-YAM y no continuar de otro fine-tune, puede usarse como punto de partida independiente para tareas de manipulacion con cepillo o escurridor.
- Investigacion en representaciones video-accion: el modelo conjunto de video y accion permite estudiar como se acoplan las predicciones visuales y las acciones en tareas de contacto con herramientas.
- Desarrollo de adaptadores de robot: el checkpoint esta pensado para desplegarse con un adaptador de robot compatible y las convenciones originales de 14 dimensiones, lo que facilita probar distintas plataformas.
- Docencia y divulgacion en robotica: el repositorio autocontenido (pesos, configuracion, estadisticas y codigo) es util para ilustrar un flujo completo de entrenamiento y evaluacion de politicas visuomotoras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se reporta tasa de exito en bucle cerrado ni resultado de validacion retenida, y que la perdida de entrenamiento no es una metrica de exito en la tarea robotica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 12,0 GB y los pesos se almacenan en BF16, por lo que se requiere al menos una GPU con memoria suficiente para el checkpoint y los componentes auxiliares (VAE de Wan2.2 y codificador UMT5).
- GPU recomendadas: no disponible; el entrenamiento uso cuatro GPUs con batch de 12 por GPU y DeepSpeed ZeRO-1.
- Compatibilidad con GPU de consumo: no disponible; no se especifica si cabe en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el despliegue requiere el checkout de Long-WAM incluido en `code.zip`, las funciones `longwam.inference.load_run_config` y `load_model` con `expected_step=11624` y `strict=True`, y un adaptador de robot compatible.
- Latencia y throughput: no disponibles.
- Nota de entorno: la configuracion original conserva rutas del sistema de ficheros SIP; en otra maquina debe definirse `LONGWAM_MODEL_ROOT` y actualizar las rutas de datos, estadisticas y cache.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM Wash Cup Epoch 8 | no disponible | P48 de historial | Lavado de taza bimanual | other | Hugging Face (9 descargas) |
| Long-WAM Wash Cup Epoch 5 | no disponible | P48 de historial | Lavado de taza bimanual | other | Hugging Face |
| Long-WAM Nesting Doll Epoch 1 | no disponible | P48 de historial | Tarea con munecas rusas | other | Hugging Face |
| Efficient-Large-Model/Long-WAM-YAM | no disponible | no disponible | Modelo base de robotica | other | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos checkpoints; las diferencias se limitan a la epoca, el paso de optimizador y la tarea de entrenamiento.

## Limitaciones y advertencias

- No se reporta tasa de exito en bucle cerrado ni validacion retenida; el checkpoint solo ha superado comprobaciones de carga de ficheros en CPU.
- La perdida de entrenamiento no debe interpretarse como metrica de exito en la tarea robotica.
- El fichero es solo de evaluacion: no incluye estado del optimizador ni del scheduler, por lo que no permite reanudar el entrenamiento de forma exacta.
- No es un modelo autonomo de Transformers: requiere el checkout de Long-WAM, los assets del VAE de Wan2.2, el codificador UMT5 y su tokenizador por separado.
- Depende de un adaptador de robot compatible y de las convenciones originales de accion de 14 dimensiones y unidades de pinza; un adaptador distinto puede invalidar el comportamiento.
- La configuracion conserva rutas del sistema de ficheros SIP, lo que exige reconfigurar rutas en otro entorno.
- El modelo esta especializado en una unica tarea y un unico dataset de 100 demostraciones, con riesgo de sobreajuste y escasa generalizacion a otras tazas, cepillos o disposiciones.
- No se documentan sesgos, limitaciones de idioma ni restricciones comerciales especificas mas alla de la licencia `other`; deben consultarse los metadatos del modelo base.
- Uso comercial: la licencia `other` exige revisar los terminos del modelo base Efficient-Large-Model/Long-WAM-YAM antes de cualquier despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Wash-Cup-Epoch-8
- Checkpoint Epoch 5: https://huggingface.co/dddddsds31341/Long-WAM-Wash-Cup-Epoch-5
- Checkpoint Nesting Doll Epoch 1: https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Epoch-1
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Registro de entrenamiento (W&B): https://forge.coreweave.com/wandb/bofang/long-wam/runs/3n9pgoq2
- Repositorio base del codigo: https://github.com/NVlabs/LongLive
