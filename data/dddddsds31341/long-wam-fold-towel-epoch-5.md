# dddddsds31341/Long-WAM-Fold-Towel-Epoch-5

## Resumen

Long-WAM-Fold-Towel-Epoch-5 es un checkpoint de evaluación de un ajuste fino (fine-tune) del modelo de robotica Long-WAM-YAM, desarrollado por el usuario dddddsds31341 y publicado en Hugging Face. Se trata de un modelo vision-language-action (VLA) especializado en una unica tarea bimanual: doblar una toalla larga con dos pinzas roboticas. El modelo parte del checkpoint base Efficient-Large-Model/Long-WAM-YAM y se entrena de forma independiente sobre el dataset yuyingyinya/fold_towel, sin continuar el ajuste de ninguna otra tarea.

El checkpoint corresponde a la epoca 5 de 10 de un entrenamiento programado para 20.660 actualizaciones del optimizador, y se publica en el paso 10.330. El repositorio contiene unicamente pesos de evaluacion (model.pt), configuracion resuelta, estadisticas de normalizacion y el codigo de entrenamiento (SIP v34), pero no estado del optimizador ni del scheduler. No es un modelo autonomo de tipo transformers `from_pretrained`: requiere el entorno Long-WAM, los assets del VAE Wan2.2 y el codificador de texto UMT5 para funcionar.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigacion para reproduccion de un experimento concreto de manipulacion robotica, no de un modelo de proposito general. No se han publicado tasas de exito en bucle cerrado ni resultados de validacion retenida, por lo que su utilidad practica queda limitada a la evaluacion experimental dentro del ecosistema Long-WAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto video/accion (Long-WAM) con VAE Wan2.2 y codificador de texto UMT5; no disponible el detalle interno de capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible; historial de video P48 y chunk de accion de 32 pasos |
| Tipos de cuantizacion | no disponible; pesos almacenados en el dtype del paso (BF16 en entrenamiento) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea en robotica) |
| Licencia | other (ver metadatos del modelo base para condiciones) |
| Formato de pesos | model.pt (PyTorch), mas config.yaml, dataset_stats.json, code.zip y requirements-sip.txt |

## Arquitectura y entrenamiento

El modelo se basa en Long-WAM, un sistema que combina un modelo de video (herencia de NVlabs/LongLive, commit cfa4e91) con un codificador de propiocepcion y una cabeza de accion. La entrada consta de tres camaras RGB (`top_head`, `hand_left`, `hand_right`) procesadas a 384x320, un historial de video P48 y un chunk de accion de 32 pasos. La salida son objetivos articulares absolutos de 14 dimensiones (6 articulaciones + pinza por brazo, orden izquierda + derecha) con las unidades originales de las pinzas. El texto de la instruccion se codifica mediante UMT5.

El entrenamiento se realizo sobre el dataset yuyingyinya/fold_towel (revision 48cf95e0), con 100 demostraciones, 99.151 fotogramas a 30 Hz y todas las demostraciones usadas para entrenamiento. Se emplearon cuatro GPUs con batch de 12 por GPU, acumulacion de gradiente 1 (batch global 48), tasa de aprendizaje constante de 1e-5, AdamW con weight decay 0.01, BF16 y DeepSpeed ZeRO-1. Cada epoca comprende 2.066 actualizaciones del optimizador. Se aplican estadisticas z-score especificas de la tarea y el recorte oficial de valores normalizados en [-5, 5]. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Manipulacion robotica bimanual: ejecuta una tarea concreta de doblado de toalla con dos pinzas, siguiendo la instruccion textual de la model card.
- Control de accion por chunk: predice 32 pasos de accion por inferencia, con objetivos articulares de 14 dimensiones.
- Percepcion multimodal: procesa tres flujos RGB simultaneos (`top_head`, `hand_left`, `hand_right`) junto con propiocepcion.
- Condicionamiento por instruccion en lenguaje natural: la tarea se especifica mediante texto codificado con UMT5.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingues ni modos de razonamiento extendido.

## Casos de uso

- Investigacion en manipulacion bimanual: el checkpoint sirve para reproducir y analizar el comportamiento de Long-WAM en la tarea de doblado de toalla dentro de un entorno controlado, comparando epocas y pasos del mismo entrenamiento.
- Evaluacion de politicas VLA en simulacion o laboratorio: se puede cargar con `longwam.inference.load_model` (paso esperado 10.330, `strict=True`) para medir el comportamiento del modelo en el banco de pruebas original.
- Estudio de normalizacion y preprocesado: `dataset_stats.json` permite replicar el pipeline de normalizacion y desnormalizacion de acciones, util para experimentos de ablacion.
- Base para ajustes finos posteriores: al ser un fine-tune independiente desde Long-WAM-YAM, puede servir como punto de partida para nuevas tareas bimanuales con el mismo formato de 14 dimensiones.
- Reproduccion de entrenamiento: el paquete `code.zip` (SIP v34) y `requirements-sip.txt` permiten reconstruir el entorno y verificar la configuracion del run.
- Docencia y divulgacion: ejemplo concreto de pipeline VLA con multiples camaras, historial de video y chunking de acciones para explicar arquitecturas de robotica aprendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reporta tasa de exito en bucle cerrado ni resultado de validacion retenida, y que la perdida de entrenamiento no es una metrica de exito de la tarea robotica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio pesa 12,0 GB, lo que da una cota inferior orientativa para cargar los pesos en el dtype almacenado.
- GPU recomendadas: no disponibles; el entrenamiento uso cuatro GPUs con BF16 y DeepSpeed ZeRO-1, sin especificar modelo.
- Cabe en GPU de consumo: no confirmado; el tamano del repositorio (12 GB) sugiere que podria requerir GPUs de gama alta con al menos 16-24 GB de VRAM, pero no hay dato oficial.
- Opciones de despliegue: entorno Long-WAM (carga via `longwam.inference`), con assets separados de VAE Wan2.2, UMT5 y tokenizer. No es compatible con `from_pretrained` de transformers, ni se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM-Fold-Towel-Epoch-5 | no disponible | no disponible (P48 + chunk 32) | Doblado de toalla bimanual | other | Hugging Face, 18 descargas |
| Long-WAM-Fold-Towel-3Epoch-Step-2066 | no disponible | no disponible | Doblado de toalla bimanual | other | Hugging Face (run distinto) |
| Long-WAM-Fold-Towel-3Epoch-Step-4132 | no disponible | no disponible | Doblado de toalla bimanual | other | Hugging Face (run distinto) |
| Long-WAM-YAM (base) | no disponible | no disponible | Robotica general (base) | other | Hugging Face |

Los tres checkpoints de doblado de toalla comparten dataset y formato de accion, pero pertenecen a runs de entrenamiento distintos; el presente corresponde a la epoca 5 del run iniciado el 2026-11-01. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Especificidad extrema: el modelo solo ha sido entrenado para la tarea de doblar una toalla larga con dos pinzas; no generaliza a otras tareas sin nuevo ajuste fino.
- Ausencia de metricas de exito: no hay tasa de exito en bucle cerrado ni validacion retenida, por lo que no se puede afirmar su rendimiento real en robot.
- No es un modelo autonomo: requiere el entorno Long-WAM, el VAE Wan2.2, el codificador UMT5 y los assets del tokenizer, ademas de rutas de datos y estadisticas correctas.
- Sin estado del optimizador: el archivo es solo de evaluacion; no permite continuar el entrenamiento de forma exacta.
- Convenciones rigidas: exige el adaptador de robot correspondiente y el formato original de 14 dimensiones con unidades de pinza especificas.
- Licencia "other": las condiciones de uso comercial dependen de la licencia del modelo base Long-WAM-YAM; deben revisarse antes de cualquier despliegue productivo.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados para este checkpoint.
- Idiomas: no se declara soporte multilingue; las instrucciones de tarea estan en ingles en la model card.
- Repositorio de bajo uso (18 descargas, 0 likes) y sin validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Fold-Towel-Epoch-5
- Modelo base Long-WAM-YAM: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Checkpoint relacionado (3 epocas, paso 2.066): https://huggingface.co/dddddsds31341/Long-WAM-Fold-Towel-3Epoch-20261030-Step-2066
- Checkpoint relacionado (3 epocas, paso 4.132): https://huggingface.co/dddddsds31341/Long-WAM-Fold-Towel-3Epoch-20261030-Step-4132
- Registro de entrenamiento (Weights & Biases, CoreWeave): https://forge.coreweave.com/wandb/bofang/long-wam/runs/xw0bcxta
- Repositorio base de video (NVlabs/LongLive, commit cfa4e91): https://github.com/NVlabs/LongLive
- Dataset de la tarea: https://huggingface.co/datasets/yuyingyinya/fold_towel
