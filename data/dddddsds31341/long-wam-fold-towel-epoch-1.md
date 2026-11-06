# dddddsds31341/Long-WAM-Fold-Towel-Epoch-1

## Resumen

Long-WAM Fold Towel — Epoch 1 es un checkpoint de evaluacion de un ajuste fino (fine-tune) independiente del modelo robotico Long-WAM-YAM, desarrollado por el usuario dddddsds31341. El modelo resuelve una tarea concreta de manipulacion bimanual: doblar una toalla larga sujetandola por ambos extremos con dos pinzas (grippers), siguiendo una secuencia de doblado por el borde corto, el borde largo y de nuevo el borde corto, para acabar alineando y alisando la toalla. Se trata de un modelo de politica visomotora (vision-language-action) que combina un modelo de video generativo con un cabezal de acciones, entrenado sobre 100 demostraciones teleoperadas.

El checkpoint corresponde a la epoca 1 de 10 del entrenamiento, en el paso de optimizador 2066, y parte de `Efficient-Large-Model/Long-WAM-YAM` sin continuar desde el ajuste fino de otra tarea. El repositorio ocupa 12,0 GB e incluye pesos en formato PyTorch (`model.pt`), configuracion resuelta, estadisticas de normalizacion y el codigo de entrenamiento (SIP v34, basado en NVlabs/LongLive). No es un modelo standalone de Transformers: requiere el checkout de Long-WAM, los assets del VAE de Wan2.2 y el codificador de texto UMT5 para funcionar.

Su relevancia es acotada y experimental: es un artefacto de investigacion para evaluar una politica robotica bimanual en una unica tarea, publicado con 0 descargas y 0 likes, sin resultados de exito en bucle cerrado ni validacion held-out reportados. No debe confundirse con un modelo de lenguaje general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto de video y accion (joint video/action model) con codificador de propiocepcion; basado en la familia Long-WAM (linaje NVlabs/LongLive) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (historial de video P48 y chunk de accion de 32 pasos) |
| Tipos de cuantizacion | no disponible (pesos almacenados en el dtype del paso de entrenamiento, BF16 durante el entrenamiento) |
| Idiomas soportados | no disponible (modelo robotico; instruccion de tarea en ingles) |
| Licencia | other (metadatos de licencia del modelo base en Efficient-Large-Model/Long-WAM-YAM) |
| Formato de pesos | PyTorch (`model.pt`); no compatible con `from_pretrained` de Transformers |

## Arquitectura y entrenamiento

La arquitectura es un modelo conjunto de video y accion: un backbone generativo de video (con VAE de Wan2.2 y codificador de texto UMT5) acoplado a un cabezal de prediccion de acciones y a un codificador de propiocepcion. La salida de accion es un vector de 14 dimensiones de objetivos articulares absolutos en unidades originales de las pinzas, ordenado como 6 articulaciones + gripper izquierdo y 6 articulaciones + gripper derecho. La entrada visual son tres camaras RGB (`top_head`, `hand_left`, `hand_right`) procesadas a 384x320, con un historial P48 y un chunk de accion de 32 pasos. El entrenamiento usa estadisticas z-score especificas de la tarea y el recorte oficial de valores normalizados en `[-5, 5]`.

El ajuste fino se realizo sobre el dataset `yuyingyinya/fold_towel` (revision `48cf95e0d1594940d4160f5cde7e8070c221904e`): 100 demostraciones, 99.151 fotogramas a 30 Hz, todas usadas para entrenamiento. Se emplearon cuatro GPUs con batch de 12 por GPU y acumulacion de gradiente 1 (batch global 48), tasa de aprendizaje constante de `1e-5`, AdamW con weight decay 0,01, BF16 y DeepSpeed ZeRO-1. Cada epoca son 2066 actualizaciones de optimizador y la ejecucion completa apunta a 20.660 actualizaciones. El entrenamiento comenzo el 2026-11-01 a las 23:37 (Asia/Singapore). No se documentan fases de RLHF o DPO, ni innovaciones como decodificacion especulativa; el interes tecnico esta en el acoplamiento video-accion y en el esquema de chunking de acciones.

## Capacidades

- Prediccion de acciones motoras bimanuales de 14 dimensiones (6 articulaciones + gripper por brazo) para control de robot.
- Percepcion visual multi-camara con tres vistas RGB (cabeza superior y ambas manos).
- Ejecucion de una tarea especifica de doblado de toalla larga en tres fases (borde corto, borde largo, borde corto) con alineado y alisado final.
- Condicionamiento por instruccion de tarea en lenguaje natural (via codificador de texto UMT5).
- Chunking de acciones de 32 pasos con historial de video de 48 fotogramas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso generico ni uso como agente de proposito general.
- Capacidades multilingues: no disponibles; la instruccion de tarea esta en ingles.
- No dispone de modo thinking, vision general, audio ni generacion de texto libre.

## Casos de uso

- Investigacion en manipulacion bimanual: sirve como punto de partida o referencia para estudiar politicas visomotoras que coordinan dos brazos sobre un objeto deformable, usando las tres camaras y el chunk de 32 acciones.
- Evaluacion de checkpoints intermedios: al ser la epoca 1 de 10, permite analizar la evolucion del aprendizaje comparando con epocas posteriores del mismo run.
- Reproduccion de experimentos: el repositorio incluye `config.yaml`, `dataset_stats.json`, `code.zip` y `requirements-sip.txt`, lo que facilita replicar el preprocesado y la inferencia con el checkout de Long-WAM.
- Benchmark de tareas de doblado: puede emplearse como baseline en comparativas de politicas de doblado de tejidos, siempre que se documente que no hay tasa de exito reportada.
- Desarrollo de adaptadores de robot: util para probar la integracion de un adaptador robotico que respete las convenciones de accion 14D y las unidades originales de los grippers.
- Estudio de normalizacion por tarea: las estadisticas z-score y el recorte `[-5, 5]` incluidos permiten analizar el impacto del preprocesado en la estabilidad de las acciones.
- Docencia y divulgacion: ejemplo concreto de pipeline VLA (vision-language-action) con modelo de video, VAE y codificador de texto para explicar arquitecturas roboticas modernas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el checkpoint ha pasado comprobaciones de carga de ficheros en CPU, pero no reporta tasa de exito en bucle cerrado ni resultados de validacion held-out, y advierte que la perdida de entrenamiento no es una metrica de exito de la tarea robotica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 12,0 GB y el entrenamiento uso BF16, por lo que se requiere al menos una GPU con memoria suficiente para los pesos mas los assets del VAE de Wan2.2 y el codificador UMT5.
- GPU recomendadas: no disponible de forma explicita; el entrenamiento se realizo con cuatro GPUs (modelo no especificado) con batch de 12 por GPU.
- Cabe en GPU de consumo: no confirmado; no hay datos de cuantizacion ni de despliegue en RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: no se soporta `from_pretrained` de Transformers; requiere el checkout de Long-WAM, `longwam.inference.load_run_config` y `load_model` con `expected_step=2066` y `strict=True`, mas los assets de Wan2.2 VAE y UMT5. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Variables de entorno: `LONGWAM_MODEL_ROOT` para la raiz de assets del modelo, y actualizacion de rutas de datos, estadisticas y cache.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM Fold Towel — Epoch 1 | no disponible | no disponible (P48 / 32 pasos) | Doblado de toalla bimanual | other | Hugging Face, 0 descargas |
| Efficient-Large-Model/Long-WAM-YAM | no disponible | no disponible | Base VLA de proposito general | other | Hugging Face (modelo base) |
| NVlabs/LongLive | no disponible | no disponible | Generacion de video largo | no disponible | GitHub (commit cfa4e91) |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 100 demostraciones de una unica tarea, el modelo esta fuertemente especializado y no generalizara a otras tareas ni objetos.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero las predicciones de accion pueden ser incorrectas fuera de la distribucion de entrenamiento; no hay validacion held-out que acote este riesgo.
- Limitaciones de contexto o idioma: instruccion de tarea en ingles; sin soporte multilingue documentado; sin datos sobre longitud de contexto en tokens.
- Restricciones de licencia: licencia "other"; deben consultarse los metadatos del modelo base (`Efficient-Large-Model/Long-WAM-YAM`) antes de cualquier uso comercial.
- No es un modelo standalone: requiere el codigo SIP v34, el VAE de Wan2.2 y el codificador UMT5; no funciona con `from_pretrained` de Transformers.
- El fichero es solo de evaluacion: no incluye estado del optimizador ni del scheduler, por lo que no permite continuar el entrenamiento de forma exacta.
- Rutas de entrenamiento: la configuracion conserva rutas de sistema de ficheros SIP; hay que reconfigurarlas para otra maquina.
- Sin metrica de exito: no se reporta tasa de exito en robot real ni validacion; la perdida de entrenamiento no es indicador de exito de la tarea.
- Madurez: 0 descargas y 0 likes; checkpoint de la epoca 1 de 10, por lo que representa un estado temprano del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Fold-Towel-Epoch-1
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset: https://huggingface.co/datasets/yuyingyinya/fold_towel
- Registro de entrenamiento (W&B): https://forge.coreweave.com/wandb/bofang/long-wam/runs/xw0bcxta
- Codigo base LongLive (NVlabs): https://github.com/NVlabs/LongLive (commit cfa4e91eec59429d583326500bf5535c9ce6eec7)
