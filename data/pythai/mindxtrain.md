# PYTHAI/mindXtrain

## Resumen

PYTHAI/mindXtrain es un repositorio publicado en Hugging Face que no contiene pesos de un modelo de lenguaje, sino un framework de entrenamiento. En concreto, se trata de la bifurcación (fork) específica para la línea mindX del proyecto mindXtrain, realizada el 14 de septiembre de 2026 a partir del repositorio upstream alojado en GitHub y archivado por su autor original. El propósito declarado es servir de marco de trabajo para el ajuste fino de LLM de pesos abiertos sobre aceleradores AMD MI300X y para su posterior servicio mediante una API compatible con OpenAI.

El repositorio se etiqueta con `pipeline_tag: text-generation` y `library_name: mindxtrain`, pero su tamaño es de 0,0 GB y registra 0 descargas y 0 likes en el momento de la consulta, lo que confirma que se distribuye como código (99 módulos Python según la documentación) y no como artefacto de pesos. La característica técnica que el autor destaca frente a alternativas como Axolotl, LLaMA-Factory, Unsloth, torchtune o Primus es una sonda de autotune AOT de 60 segundos que fija el plan de ejecución al arrancar el entrenamiento (atención CK frente a Triton, heurística hipBLASLt y configuración RCCL), prohibiendo el autotune JIT en el bucle de producción.

El proyecto incluye además un bucle de prueba denominado dcoach, orientado a demostrar que un modelo pequeño entrenado en CPU "recuerda" una persona o estilo imprintado, con puntuaciones de recall antes y después del entrenamiento y un veredicto automático. No se publican datos sobre parámetros, contexto o idiomas, ya que no existe un modelo entrenado asociado al repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene un framework de entrenamiento, no un modelo con arquitectura propia) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el framework expone un verbo `quantize` y una ruta de cuantizacion, pero los formatos concretos soportados no estan detallados en la informacion proporcionada; no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repositorio de codigo; tamano de 0,0 GB, sin pesos publicados) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura de ningun modelo neuronal, porque el artefacto publicado es una herramienta de entrenamiento. Lo que si se detalla es la arquitectura del propio framework: un paquete Python ordenado con 99 modulos organizados en los subpaquetes `cli`, `config`, `data`, `models`, `train`, `eval`, `autotune`, `operator`, `storage`, `provenance`, `deploy` y `budget`, acompanado de un espacio de trabajo Foundry para un registro de atestaciones ERC-8004, despliegues en contenedores (compose, Kubernetes, VMM, Gensyn) y una suite de pruebas pytest de 566 tests ejecutables en CPU. La instalacion base pasa ruff y mypy sin errores; con los extras de entrenamiento instalados, la suite suma 672 tests en verde.

El diferenciador tecnico declarado es la sonda de autotune AOT de 60 segundos, que decide de antemano la combinacion de atencion (CK frente a Triton), la heuristica de hipBLASLt y la configuracion de RCCL, con el objetivo de evitar la variabilidad del autotune JIT durante el entrenamiento. El flujo de entrenamiento se apoya en LoRA y en un bucle de autoentrenamiento de mindX: el denominado ciclo de sueno escribe datos de entrenamiento en JSONL, que el framework consume a traves de la fuente de datos `mindx_dreams` para ajustar un modelo de respaldo pequeno sobre una unica MI300X. No se indica en la informacion proporcionada el numero de tokens, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Entrenamiento y ajuste fino de LLM de pesos abiertos mediante LoRA sobre AMD MI300X con ROCm 7.2.1.
- Sonda de autotune AOT que fija el plan de atencion, la heuristica de biblioteca y la configuracion de comunicacion colectiva antes de iniciar el entrenamiento.
- CLI con 9 verbos, entre ellos `init`, `bench` y modos `--dry-run`.
- Servicio de modelos a traves de una API compatible con OpenAI.
- Interfaz web interactiva de operador y coach servida con uvicorn en el puerto 8080 y publicada en `mindx.pythai.net/coach`.
- API publica de trabajos de entrenamiento con autenticacion por bearer token (`MINDXTRAIN_API_KEY`) en `mindx.pythai.net/v1/training/jobs`.
- Bucle de prueba dcoach: imprime una persona en un modelo pequeno en CPU y mide el recall antes y despues del entrenamiento mediante los componentes "classroom" y "boardroom", con veredicto de aprobado o fallo que alimenta un bucle de realimentacion de autotune.
- Ingesta de datos de entrenamiento generados por el ciclo de sueno de mindX mediante la fuente de datos `mindx_dreams`.
- Rutas de evaluacion, cuantizacion y publicacion (grupos de dependencias `eval`, `data` y `quantize`).
- Trazabilidad de procedencia mediante `FORK.json` y un espacio de contrato para registro de atestaciones.
- Capacidades de generacion de texto, razonamiento, codigo, vision o audio: no disponibles (el repositorio no publica un modelo con esas capacidades).

## Casos de uso

- Ajuste fino de modelos de pesos abiertos en hardware AMD: el framework esta disenado especificamente para MI300X con ROCm 7.2.1, de modo que permite entrenar LoRA en un acelerador que no cubren las herramientas orientadas a CUDA.
- Autoentrenamiento continuo de un agente: el ciclo de sueno de mindX genera datos en JSONL y el framework los consume mediante `mindx_dreams` para reajustar periodicamente un modelo de respaldo, cerrando el bucle entre uso y entrenamiento.
- Validacion de que un ajuste fino ha "prendido": el bucle dcoach permite comprobar en CPU si un modelo pequeno recuerda la persona o el estilo imprintado, comparando el recall antes y despues, lo que sirve como prueba rapida antes de invertir horas de GPU.
- Orquestacion de trabajos de entrenamiento como servicio: la API de trabajos con autenticacion por bearer token permite lanzar y monitorizar entrenamientos desde sistemas externos, integrandolos en una plataforma interna.
- Sustitucion de API propietaria en pipelines de generacion: al exponer un endpoint compatible con OpenAI, el framework facilita desplegar modelos abiertos propios sin reescribir el codigo cliente que ya habla ese protocolo.
- Reproducibilidad y auditoria de experimentos: la trazabilidad de procedencia, la congelacion de planos (blueprints) y el manifiesto de bifurcacion permiten reconstruir con que version del codigo y con que datos se genero un ajuste.
- Optimizacion de rendimiento en clústeres AMD: la sonda AOT evita que el autotune JIT introduzca latencias impredecibles en el arranque, algo util en entornos de produccion con SLA estrictos.
- Desarrollo y pruebas sin GPU: al pasar la suite de 566 tests en modo solo CPU, se puede iterar sobre configuracion, esquema YAML y CLI en un portatil antes de tocar el acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona, a modo de ejemplo ilustrativo del bucle dcoach, una mejora de recall de 0,07 a 0,28 en una ejecucion limpia en CPU, pero no se presenta como un benchmark reproducible ni se acompanan los detalles del modelo, del dataset o del protocolo de evaluacion. La propia documentacion indica que el estado es "production deployment in progress".

## Requisitos de hardware

- GPU objetivo del framework: AMD MI300X con ROCm 7.2.1, ejecutando dentro del contenedor `rocm/primus:v26.2`.
- Los pasos de GPU (`bench` sin `--dry-run`, `train`, `quantize`, `serve`) requieren ese acelerador; la informacion no especifica VRAM minima ni maxima.
- Instalacion base y suite completa de pruebas: ejecutables en CPU, en un portatil, segun la model card.
- VRAM estimada para inferencia: no disponible (no se publica un modelo de pesos, por lo que no aplica un calculo por parametros ni cuantizacion).
- GPU de consumo (RTX 4090, etc.): no disponible; el framework no declara soporte para ellas.
- Opciones de despliegue: `uv sync` con grupos de extras (`ml`, `eval`, `data`, `all-extras`), CLI `mindxtrain`, servidor uvicorn (`mindxtrain.operator.app`) en el puerto 8080, y APIs compatibles con OpenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la unica cifra temporal declarada es que la sonda de autotune AOT tarda 60 segundos.

## Comparativa con modelos similares

La model card situa el proyecto frente a Axolotl, LLaMA-Factory, Unsloth, torchtune y Primus, y afirma que su diferenciador es la sonda de autotune AOT de 60 segundos con prohibicion de autotune JIT en produccion. La informacion proporcionada no incluye datos de parametros, contexto, rendimiento o versiones de esas alternativas, por lo que la comparacion cuantitativa queda como no disponible.

| Proyecto | Categoria | Diferenciador declarado por el autor | Datos comparativos |
|---|---|---|---|
| PYTHAI/mindXtrain | Framework de entrenamiento | Autotune AOT de 60 s; objetivo AMD MI300X; bucle dcoach de prueba de recall | Licencia Apache-2.0 |
| Axolotl | Framework de ajuste fino | no disponible | no disponible |
| LLaMA-Factory | Framework de ajuste fino | no disponible | no disponible |
| Unsloth | Framework de ajuste fino | no disponible | no disponible |
| torchtune | Framework de ajuste fino | no disponible | no disponible |
| Primus | Framework de entrenamiento (AMD) | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo: el repositorio no contiene pesos, por lo que no puede usarse para inferencia directa ni evaluarse con benchmarks de lenguaje.
- Repositorio sin traccion verificable: 0 descargas, 0 likes y 0,0 GB de tamano en el momento de la consulta, con creacion y ultima actualizacion el mismo dia (14 de septiembre de 2026).
- Estado declarado como "production deployment in progress": varias rutas pesadas (entrenamiento, evaluacion, cuantizacion) dependen de grupos de dependencias opcionales y no forman parte de la instalacion base.
- Dependencia fuerte de hardware AMD: los pasos de GPU exigen MI300X y ROCm 7.2.1 dentro de un contenedor concreto, lo que limita el uso en clústeres NVIDIA o en equipos de consumo.
- Idiomas soportados: no disponibles; al no existir un modelo publicado, no se puede evaluar cobertura multilingue.
- Sesgos conocidos, riesgo de alucinacion y limitaciones de contexto: no disponibles para este repositorio; dependeran del modelo base que se decida ajustar.
- Licencia Apache-2.0: permite uso comercial del codigo del framework, pero no cubre los modelos de terceros ni los datasets enlazados, cuyas condiciones deben verificarse por separado.
- Trazabilidad parcial: la model card remite a `FORK.json` y al commit `661bd41` del repositorio upstream, pero el README publicado queda truncado en la seccion de esquema YAML, por lo que parte de la documentacion no es visible desde el propio repositorio.
- Los resultados de busqueda web proporcionados no contienen ninguna referencia relevante al proyecto (devuelven un fabricante de maquinaria industrial ajeno al ambito de la IA), por lo que no aportan informacion adicional verificable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/PYTHAI/mindXtrain
- Repositorio upstream en GitHub (archivado): https://github.com/Professor-Codephreak/mindXtrain
- Commit de bifurcacion: https://github.com/Professor-Codephreak/mindXtrain/commit/661bd411738d11e633b25c681bbd5676556bab7d
- Dataset de la linea mindX: https://huggingface.co/datasets/PYTHAI/mindXascension
- Dataset de doctrina mindX: https://huggingface.co/datasets/PYTHAI/mindX-docs
- Mapeo de doctrina: https://huggingface.co/datasets/PYTHAI/mindX-docs/blob/main/MAPPING.md
- Ultima generacion aceptada: https://huggingface.co/PYTHAI/mindXtrain39
- Mapa de presencia en el Hub: https://huggingface.co/PYTHAI/mindXtrain/blob/main/examples/mindx/HUGGINGFACE_MAP.md
- Interfaz de operador y coach: https://mindx.pythai.net/coach
- API publica de trabajos de entrenamiento: https://mindx.pythai.net/v1/training/jobs
