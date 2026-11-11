# Ethanliang99/MetaWAM-RealWorld-Predict2-2B

## Resumen

MetaWAM-RealWorld-Predict2-2B es un modelo de accion para robots ("world action model") desarrollado por Guoqiang Liang, Yiqi Lin, Yanzhe Chen, Kevin Yuchen Ma y Mike Zheng Shou (showlab), presentado en el articulo "From Video Frames to Robot Meta-Frames: A Unified Latent Interface for World Action Models" (CoRL 2026). Se trata de un ajuste fino de nvidia/Cosmos-Predict2-2B-Video2World, un modelo de difusion de video de 2B parametros, adaptado para emitir acciones de robot en lugar de fotogramas de video.

La innovacion central es empaquetar las senales del robot (tipo de tarea, propiocepcion, chunks de accion, propiocepcion futura y valores) en slots de coeficientes fijos dentro de bandas de canales disjuntas, y elevarlas a "meta-frames" compactos mediante una DCT inversa 2D. Mascaras conscientes de slot permiten entrenar politica, world model y prediccion de valor en un unico modelo de denoising.

Este checkpoint concreto es una politica unica para un Franka Panda de 7 grados de libertad, entrenada conjuntamente en tres tareas de mesa durante 7.2K pasos. Predice chunks de accion de 16 pasos a partir de una camara de muneca y dos camaras en tercera persona. El autor advierte explicitamente de que esta atado a su configuracion de camaras y robot, por lo que debe tratarse como referencia o inicializacion para ajuste fino, no como politica lista para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (denoising) derivado de Cosmos-Predict2-2B-Video2World; interfaz latente unificada de meta-frames con DCT inversa 2D |
| Parametros totales | 2B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (las instrucciones de tarea se codifican con embeddings T5 precomputados) |
| Licencia | nvidia-base-model-license (licencia del modelo base) |
| Formato de pesos | `.pt` (PyTorch consolidado, bf16) |

## Arquitectura y entrenamiento

El modelo parte de Cosmos-Predict2-2B-Video2World, un transformer de difusion para generacion de video condicionada por imagen y texto. MetaWAM reutiliza ese backbone de denoising pero redefine el espacio de salida: en lugar de predecir fotogramas de video, las senales del robot se codifican en bandas de canales disjuntas y se transforman en meta-frames mediante una DCT inversa 2D. Esto permite que un unico modelo de denoising, con mascaras conscientes de slot, aprenda simultaneamente la politica de accion, el world model (prediccion de propiocepcion futura) y la prediccion de valor.

El entrenamiento de este checkpoint se realizo sobre tres tareas de mesa (Sweep, Place Cup, Build Block) con un Franka Panda de 7 DoF, durante 7.2K pasos, con tres camaras (una de muneca y dos en tercera persona) y prediccion de chunks de accion de 16 pasos. Las instrucciones de tarea se incorporan mediante embeddings T5 precomputados que se distribuyen junto con los pesos. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generacion de acciones de robot para un Franka Panda de 7 DoF, en chunks de 16 pasos.
- Ejecucion de tres tareas de manipulacion de mesa: barrer un bloque verde a un recogedor, colocar una taza sobre un posavasos verde y apilar un bloque naranja sobre uno gris.
- Percepcion multimodal a partir de tres camaras: una de muneca y dos en tercera persona.
- Condicionamiento por instruccion en lenguaje natural mediante embeddings T5 precomputados.
- World modeling: prediccion de propiocepcion futura dentro del mismo modelo de denoising.
- Prediccion de valor como cabecera auxiliar del mismo modelo.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, capacidades multilingues generales ni modos de razonamiento.

## Casos de uso

- Referencia para investigacion en world action models: sirve como punto de partida reproducible para estudiar la interfaz de meta-frames propuesta en el articulo y comparar variantes de empaquetado de senales.
- Inicializacion para ajuste fino en un Franka Panda propio: el autor lo plantea como inicializacion para reentrenar con datos del usuario, lo que reduce el coste frente a partir del modelo base de video.
- Replicacion de las tres tareas de mesa: permite reproducir los experimentos de Sweep, Place Cup y Build Block con la misma configuracion de camaras y robot.
- Evaluacion de politicas visuomotoras con multiples camaras: util para medir el impacto de la camara de muneca frente a las vistas en tercera persona en tareas de apilado y colocacion.
- Estudio de prediccion de valor en modelos de difusion para robotica: el checkpoint incluye la cabeza de valor, lo que facilita analizar su utilidad como senal auxiliar.
- Base para experimentos de world modeling: la prediccion de propiocepcion futura puede emplearse para evaluar la coherencia de la dinamica aprendida antes de ejecutar acciones reales.
- Docencia y prototipado en laboratorios con robot Franka: al estar consolidado en un unico `.pt` de bf16, simplifica el despliegue en entornos de investigacion con el servidor de inferencia del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con pesos en bf16 y 2B parametros, el peso del modelo ronda los 4 GB, a lo que hay que sumar el coste de activaciones y del servidor de politica.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, el modelo es compatible con GPUs de datacenter tipo A100 o H100 y con GPUs de consumo de gama alta con suficiente VRAM, aunque no se confirma en la model card.
- Cabe en consumer GPU: no confirmado; el repo ocupa 3.9 GB, lo que sugiere que los pesos caben en GPUs de consumo con 8-16 GB, pero el requisito total de inferencia no se especifica.
- Opciones de despliegue: servidor de politica del repositorio MetaWAM (`cosmos_policy/experiments/robot/franka/run_deploy_franka.sh`) con las variables `FRANKA_CKPT_PATH`, `FRANKA_DATASET_STATS_PATH` y `FRANKA_T5_EMBEDDINGS_PATH`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MetaWAM-RealWorld-Predict2-2B | 2B | no disponible | Politica visuomotora + world model + valor para Franka Panda | nvidia-base-model-license | Hugging Face (0 descargas) |
| nvidia/Cosmos-Predict2-2B-Video2World | 2B | no disponible | Generacion de video condicionada por imagen y texto | nvidia-base-model-license | Hugging Face (modelo base) |
| Alternativas de politica visuomotora de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparaciones cuantitativas con otras politicas visuomotoras en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint esta atado a la colocacion de camaras y a la configuracion fisica del robot del autor; no es una politica lista para usar ("drop-in") en otro montaje.
- Solo cubre tres tareas de mesa concretas y un robot Franka Panda de 7 DoF; no generaliza a otras tareas, objetos o brazos roboticos sin ajuste fino.
- Las instrucciones de tarea dependen de embeddings T5 precomputados para las tres frases exactas documentadas; el modelo no procesa lenguaje natural libre de forma general.
- No se han publicado datos de sesgos, tasas de alucinacion ni evaluaciones de robustez fuera de las tres tareas.
- La licencia es la del modelo base (nvidia-base-model-license), con posibles restricciones para uso comercial; debe revisarse el enlace de licencia de nvidia/Cosmos-Predict2-2B-Video2World antes de cualquier despliegue productivo.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que no existe validacion externa de su comportamiento.
- No se documentan requisitos de hardware ni metricas de latencia, lo que complica planificar despliegues en tiempo real.
- Al ser un modelo de difusion para control robotico, errores en las acciones predichas pueden causar danos fisicos; se recomienda validacion en simulacion y limites de seguridad en el robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ethanliang99/MetaWAM-RealWorld-Predict2-2B
- Modelo base: https://huggingface.co/nvidia/Cosmos-Predict2-2B-Video2World
- Paper (arXiv): https://arxiv.org/abs/2611.14365
- Repositorio de codigo: https://github.com/showlab/MetaWAM
- Documentacion de robot real (REALWORLD.md): https://github.com/showlab/MetaWAM/blob/main/REALWORLD.md
- Licencia del modelo base: https://huggingface.co/nvidia/Cosmos-Predict2-2B-Video2World
