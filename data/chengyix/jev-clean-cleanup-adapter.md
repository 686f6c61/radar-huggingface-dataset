# ChengyiX/jev-clean-cleanup-adapter

## Resumen

jev-clean-cleanup-adapter es un adaptador de pesos publicado por ChengyiX (Nexora Research, atribuido a Chengyi Xu y Nexora) que se utiliza dentro de la aplicacion jev-clean, una herramienta de limpieza de disco para macOS. No es un modelo de lenguaje de proposito general: es un conjunto de 56 tensores en float32 que sustituyen parcialmente el checkpoint base `aac6fef/laya-mlx` para decidir si un recurso de almacenamiento medido en el sistema debe proponerse para eliminacion, revisarse o conservarse.

El adaptador reemplaza las capas 24 a 27 del encoder, la normalizacion final del encoder, el embedding de tipo, la cabeza de decision y el scorer del modelo base; el resto de pesos se cargan sin modificar. Con 75.278.337 parametros totales y un repositorio de 0,3 GB, esta disenado para ejecutarse en macOS mediante la libreria MLX (Apple Silicon), no para servir texto ni para tareas generativas.

Su relevancia es acotada pero concreta: ejemplifica el uso de un transformer pequeno como clasificador de decisiones dentro de una aplicacion de escritorio, con verificacion de integridad por SHA-256, entrenamiento supervisado sobre observaciones sinteticas sin rutas reales y un flujo de seguridad que exige confirmacion humana antes de cualquier borrado. La licencia Apache-2.0 y la derivacion de Laya (Convai Innovations) a traves del port independiente laya-mlx quedan documentadas en el aviso legal del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivado de Laya via laya-mlx); adaptador parcial sobre capas 24-27, norm final, type embedding, cabeza de decision y scorer |
| Parametros totales | 75.278.337 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32, 56 tensores) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), libreria mlx |

## Arquitectura y entrenamiento

El adaptador opera sobre el checkpoint base `aac6fef/laya-mlx` (revision `20aed815fc6acde75733882e7ec0e3f28aeb9717`), un port a MLX del modelo Laya de Convai Innovations. La sustitucion afecta exclusivamente a las capas 24-27 del encoder, la normalizacion final, el embedding de tipo, la cabeza de decision y el scorer; jev-clean rechaza cualquier tensor fuera de ese conjunto, lo que actua como control de integridad estructural ademas del SHA-256 fijado en la aplicacion (`5b65d16d...7546bd33`).

El entrenamiento consistio en ajuste fino supervisado con entropia cruzada (no RL) sobre contrafactuales de observacion sinteticos y sin rutas, generados por el formateador de observaciones de produccion de la aplicacion (`scripts/runtime_resource_corpus.py` y el corpus de recursos de fichero del repositorio jev-clean). No se emplearon rutas, nombres ni contenidos reales de usuario. La configuracion reportada incluye seis ordenes de opciones de entrenamiento, microbatch de 4, 600 actualizaciones, tasa de aprendizaje 3e-6 y un coste de entrenamiento de 4 para falsos borrados, es decir, penalizacion asimetrica orientada a reducir eliminaciones incorrectas.

## Capacidades

- Clasificacion de decisiones sobre recursos de almacenamiento medidos en macOS: proponer eliminacion, marcar para revision o conservar.
- Evaluacion de contrafactuales de observacion generados por el formateador de produccion de jev-clean.
- Integracion como componente de decision dentro de una aplicacion de escritorio con verificacion de integridad por SHA-256.
- Ejecucion nativa en Apple Silicon mediante MLX.
- No soporta generacion de texto, razonamiento general, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues; la model card no declara ninguna de ellas.

## Casos de uso

- Limpieza de disco asistida en macOS: jev-clean descarga el adaptador automaticamente y lo usa para clasificar cada recurso medido antes de mostrarlo al usuario, que decide y confirma manualmente.
- Revision de seguridad en pipelines de mantenimiento: el adaptador actua como primer filtro que separa candidatos a eliminacion de recursos que deben conservarse, con revalidacion posterior de cada objetivo.
- Investigacion sobre clasificadores de decision derivados de LLM: sirve como ejemplo reproducible de adaptador parcial (capas altas, norm, embedding de tipo y cabeza) sobre un checkpoint base, con hash fijado y conjunto de tensores permitido.
- Desarrollo de herramientas de escritorio con MLX: demuestra el patron de empaquetar un adaptador pequeno (0,3 GB) que se descarga y valida en tiempo de ejecucion en lugar de distribuir el modelo completo.
- Auditoria de falsos positivos en borrado: el informe congelado del proyecto (718/720 correctos, 1 falso borrado en el diagnostico de seis ordenes) permite estudiar el comportamiento del modelo en el caso limite de eliminar algo que no debia.
- Evaluacion de entrenamiento con coste asimetrico: la penalizacion de falsos borrados (coste 4) sobre datos sinteticos sin rutas reales es un caso practico para disenar funciones de perdida orientadas a seguridad.

## Benchmarks y rendimiento

Resultados reportados en los informes congelados del proyecto, sobre controles autorados que no constituyen verdad de referencia humana independiente:

| Evaluacion | Resultado | Referencia (adaptador inicial) |
|---|---|---|
| Control nativo de 38 observaciones | 38/38 correctos, 0 falsos borrados | 34/38 |
| Regresion autorada de 120 casos | 120/120 correctos, 0 falsos borrados | 114/120 |
| Diagnostico final de seis ordenes | 718/720 correctos, 1 falso borrado | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; el modelo no esta orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador se ejecuta en macOS sobre MLX, con pesos en float32 y un repositorio de 0,3 GB; el consumo depende del checkpoint base laya-mlx completo, cuyas especificaciones no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible; el entorno objetivo es Apple Silicon mediante MLX.
- Compatibilidad con GPU de consumo: no disponible para NVIDIA/AMD; en Apple Silicon se ejecuta a traves de MLX, sin datos de latencia publicados.
- Opciones de despliegue: integracion dentro de la aplicacion jev-clean (0.4.0 o posterior), que descarga y valida el fichero; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jev-clean-cleanup-adapter | 75.278.337 | no disponible | Clasificacion de recursos de disco en macOS | Apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| aac6fef/laya-mlx (base) | no disponible | no disponible | Modelo base del port MLX de Laya | no disponible en la informacion | Hugging Face |
| Laya (Convai Innovations) | no disponible | no disponible | Modelo original del que deriva el base | Apache-2.0 (segun atribucion del adaptador) | no disponible en la informacion |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Las probabilidades del adaptador no estan calibradas y no constituyen una garantia de seguridad de borrado; el propio autor advierte que el modelo puede equivocarse.
- El diagnostico final de seis ordenes registra 1 falso borrado sobre 720 casos, retenido deliberadamente en el informe publicado.
- Las evaluaciones se realizaron sobre controles autorados por el proyecto, no sobre verdad de referencia humana independiente, por lo que pueden sobreestimar el rendimiento real.
- El adaptador solo propone recursos; un humano debe seleccionarlos y confirmar, cada objetivo se revalida y la eliminacion se mueve a la Papelera con opcion de deshacer.
- Uso restringido en la practica al ecosistema macOS/MLX y a la aplicacion jev-clean; no es un modelo de proposito general ni sustituye a un LLM.
- No se declaran idiomas soportados ni sesgos conocidos; el entrenamiento usa datos sinteticos sin rutas ni contenidos reales de usuario, lo que limita pero no elimina el riesgo de generalizacion deficiente fuera de la distribucion de observaciones de produccion.
- Licencia Apache-2.0 permite uso comercial, pero la atribucion a Laya (Convai Innovations) y al port laya-mlx debe mantenerse segun el aviso NOTICE del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/ChengyiX/jev-clean-cleanup-adapter
- Modelo base: https://huggingface.co/aac6fef/laya-mlx
- Repositorio de la aplicacion: https://github.com/chengyixu/jev-clean
- Documentacion de metodos y limitaciones: https://github.com/chengyixu/jev-clean/blob/main/docs/POSTTRAINING-PARITY.md
