# edgarcancinoe/smolvla_water_libero-2

## Resumen

smolvla_water_libero-2 es un modelo de vision-lenguaje-accion (VLA) publicado por el usuario edgarcancinoe en Hugging Face, consistente en un ajuste fino del modelo base lerobot/smolvla_base. Está entrenado para controlar un robot manipulador de tipo Panda equipado con dos camaras, con el objetivo de ejecutar tareas de riego de plantas ("Water the left plant", "Water the middle plant", "Water the right plant"). El modelo recibe observaciones visuales y de estado y produce comandos de accion de 7 grados de libertad.

Se trata de una politica compacta, con 604.934.176 parametros en formato safetensors (aproximadamente 605 millones), lo que la situa en el rango de modelos desplegables en hardware de consumo, en linea con la filosofia de SmolVLA de Hugging Face recogida en el paper arXiv:2506.01844. El objetivo de SmolVLA es ofrecer capacidades de VLA a un coste computacional reducido frente a alternativas de gran tamano.

El modelo es relevante como ejemplo de ajuste fino de una politica VLA sobre un dataset pequeno y especifico (47 episodios, 35.370 fotogramas a 20 FPS). Se distribuye bajo licencia Apache 2.0 y se integra en el ecosistema LeRobot para entrenamiento, evaluacion y despliegue en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Lenguaje-Accion (VLA) basada en SmolVLA (VLM compacto con experto de accion por flow matching) |
| Parametros totales | 604.934.176 (aproximadamente 605 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | no disponible (las instrucciones del dataset estan en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA descrita en arXiv:2506.01844, un enfoque VLA compacto que parte de un modelo de vision-lenguaje preentrenado y lo adapta a control robótico. La politica consume dos flujos de imagen de forma (3, 256, 256) y un vector de estado de forma (8,), y emite una accion de forma (7,) por paso. Esta finamente ajustada desde el checkpoint preentrenado lerobot/smolvla_base, por lo que hereda la inicializacion del VLM y del cabezal de accion. El detalle exacto de la composicion del preentrenamiento y del experto de accion no se detalla en la informacion proporcionada.

El ajuste fino se realizo con LeRobot 0.6.1 sobre el dataset edgarcancinoe/water_pour, compuesto por 47 episodios y 35.370 fotogramas a 20 FPS. La configuracion de entrenamiento incluye 10.000 pasos, tamano de lote 16, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se especifica en la informacion disponible si se aplicaron tecnicas de RLHF o DPO; en el contexto de las politicas de imitacion tipo LeRobot lo habitual es el aprendizaje por imitacion supervisado.

## Capacidades

- Generacion de acciones de control robótico de 7 grados de libertad a partir de observaciones visuales y de estado.
- Percepcion multimodal: procesa dos camaras (observation.images.image y observation.images.image2) a 256x256 junto con el estado del robot (8 dimensiones).
- Ejecucion de tareas guiadas por lenguaje natural, con tres instrucciones entrenadas: "Water the left plant", "Water the middle plant" y "Water the right plant".
- Control de un robot de tipo panda con dos camaras, segun la configuracion declarada en la model card.
- Integracion con el ecosistema LeRobot para rollout en robot real mediante el comando lerobot-rollout.
- No se declaran capacidades de tool calling, function calling, agentes ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Riego autonomo de plantas en laboratorio: la politica se ejecuta en un robot panda con dos camaras para dirigir el agua a la planta izquierda, central o derecha segun la instruccion, aprovechando el ajuste fino especifico sobre el dataset water_pour.
- Demostracion de aprendizaje por imitacion: sirve como ejemplo reproducible de como ajustar lerobot/smolvla_base sobre un dataset propio pequeno (47 episodios) para una tarea concreta.
- Investigacion en VLA de bajo coste: permite experimentar con politicas VLA en hardware asequible dado su tamano de 605 M de parametros.
- Prototipado rapido en robotica de manipulacion: uso de lerobot-rollout para validar la politica en el robot antes de ampliar el dataset o el entrenamiento.
- Benchmark de generalizacion de instrucciones: al contar con tres variantes de tarea, resulta util para estudiar como responde la politica ante cambios de objetivo y de posicion de los objetos.
- Base para ajustes posteriores: el modelo puede servir como punto de partida para nuevas tareas de manipulacion dentro del mismo entorno o con objetos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion ("No evaluation results have been provided for this policy yet"), por lo que no hay tasas de exito ni metricas de tarea publicadas para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16/fp16 el modelo ocupa aproximadamente 1,2 GB (el repositorio pesa 1,2 GB), por lo que con activaciones y buffers el consumo puede situarse en el rango de 2 a 4 GB, si bien esta cifra no esta confirmada en la informacion disponible.
- GPU recomendadas: al tratarse de un modelo de aproximadamente 605 M de parametros, cabe en practicamente cualquier GPU moderna; se esperaria un funcionamiento comodo en RTX 3060, RTX 4070, RTX 4090, asi como en A100 o H100 para despliegues con mayor paralelismo.
- Compatibilidad con GPU de consumo: si, es un modelo disenado para hardware de consumo segun la descripcion de SmolVLA, y su tamano permite ejecutarlo en GPU con 8 GB de VRAM o mas.
- Opciones de despliegue: LeRobot (comando lerobot-rollout con --policy.path), entorno PyTorch, y el flujo de inferencia del ecosistema LeRobot; no se detallan soportes de vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput estimados: no disponible. El dataset de entrenamiento se grabo a 20 FPS, pero no se proporcionan cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| edgarcancinoe/smolvla_water_libero-2 | 604.934.176 | no disponible | Riego de plantas (Panda, 2 camaras) | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | Modelo base VLA (preentrenado) | no disponible en la informacion | Hugging Face |
| HuggingFaceVLA/smolvla_libero | no disponible | no disponible | Ajuste para el benchmark LIBERO | no disponible en la informacion | Hugging Face |

La informacion disponible no permite una comparacion cuantitativa de rendimiento entre estas variantes, ya que no se publican parametros exactos ni resultados de evaluacion de las alternativas citadas.

## Limitaciones y advertencias

- No se han publicado resultados de evaluacion ni tasas de exito, por lo que se desconoce la fiabilidad real de la politica en robot.
- El entrenamiento se realizo con un dataset muy reducido (47 episodios, 35.370 fotogramas, 3 tareas), lo que limita la generalizacion a nuevas posiciones, objetos o entornos.
- Dependencia de la configuracion de camaras: la politica espera exactamente dos camaras (observation.images.image y observation.images.image2) y un estado de 8 dimensiones; cambios en esta configuracion pueden impedir su uso.
- Las instrucciones estan entrenadas en ingles y limitadas a tres objetivos concretos, por lo que variaciones de redaccion pueden no comportarse igual.
- Riesgo de alucinacion o de acciones erroneas inherente a los modelos de accion guiados por lenguaje, especialmente fuera de la distribucion de entrenamiento.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Restricciones de licencia: el modelo se distribuye bajo apache-2.0, que permite uso comercial, pero se recomienda verificar las condiciones de los recursos de terceros asociados (modelo base, dataset, libreria LeRobot).
- Advertencia para produccion: sin evaluacion publicada, no se recomienda su despliegue en entornos criticos sin una validacion propia exhaustiva.
- El repo registra 0 descargas y 0 likes en la informacion proporcionada, lo que indica que es un modelo reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edgarcancinoe/smolvla_water_libero-2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/edgarcancinoe/water_pour
- Paper SmolVLA (arXiv:2506.01844): https://arxiv.org/abs/2506.01844
- Blog de SmolVLA: https://huggingface.co/blog/smolvla
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Modelo relacionado HuggingFaceVLA/smolvla_libero: https://huggingface.co/HuggingFaceVLA/smolvla_libero
- Sitio de SmolVLA: https://smolvla.net/index_en
- Ficha de SmolVLA LIBERO en OpenBot.ai: https://openbot.ai/models/smolvla-libero
