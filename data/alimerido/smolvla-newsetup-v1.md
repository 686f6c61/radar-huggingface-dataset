# alimerido/smolvla-newsetup-v1

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, orientado al control de robots mediante aprendizaje por imitación. Esta ficha concreta, `alimerido/smolvla-newsetup-v1`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio del autor (50 episodios, 20 852 frames a 30 FPS), para la tarea concreta de coger un cubo rojo y depositarlo en una caja azul con un robot `so_follower` y dos camaras (muñeca y vista superior).

El modelo resuelve el problema de convertir observaciones multimodales (estado articular de 6 dimensiones e imagenes de 256x256) en comandos de accion de 6 dimensiones, sin necesidad de planificacion simbolica ni de un LLM de gran tamano. Con 450 millones de parametros y un repositorio de solo 0,9 GB, esta pensado para desplegarse en hardware de consumo, lo que lo hace relevante para laboratorios y aficionados que quieren prototipar politicas roboticas sin infraestructura de GPU de datacenter.

La relevancia actual del modelo radica en su naturaleza de politica de imitacion lista para ejecutar con la CLI de LeRobot (`lerobot-rollout`), con licencia Apache 2.0 y pesos en safetensors. No es un modelo de lenguaje general: es un controlador robotico especializado cuya utilidad depende enteramente de la tarea y del montaje fisico con el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, segun el paper SmolVLA (arXiv:2506.01844); detalles internos de capas no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (politica de imitacion, no modelo de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repo) |
| Idiomas soportados | no disponible (las instrucciones de tarea son en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower |
| Camaras | wrist, top (tres entradas visuales de 3x256x256) |
| Entrada de estado | observation.state, shape (6,) |
| Salida de accion | action, shape (6,) |
| Libreria | lerobot 0.6.2 |
| Tamano del repo | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es una politica vision-language-action compacta que combina percepcion visual y estado propioceptivo para emitir acciones de robot de forma directa (politica de imitacion). La arquitectura exacta (numero de capas, atencion, fusion multimodal) no se detalla en la informacion disponible; el paper de referencia es arXiv:2506.01844. El modelo consume tres imagenes de 256x256 (camara de muñeca y camara superior, con una tercera entrada visual declarada) junto a un vector de estado de 6 dimensiones, y produce un vector de accion de 6 dimensiones.

El fine-tuning se realizo con LeRobot 0.6.2 sobre el dataset `alimerido/new-setup_20261101_200122`: 50 episodios, 20 852 frames a 30 FPS, una unica tarea ("Grab the red cube, place it in the blue box"). La configuracion de entrenamiento fue de 20 000 pasos, batch size 64, optimizador AdamW, learning rate 0,0001 y semilla 1000. No se especifica en la informacion disponible si hubo RLHF, DPO ni tecnicas de decodificacion especulativa; al tratarse de una politica de imitacion, el regimen es aprendizaje supervisado sobre demostraciones.

## Capacidades

- Control robotico por imitacion: mapea observaciones (estado articular e imagenes) a acciones de 6 dimensiones para el robot `so_follower`.
- Percepcion visual multimodal: procesa tres entradas visuales de 256x256 (camara de muñeca y superior).
- Ejecucion de una tarea manipulativa concreta: coger un cubo rojo y colocarlo en una caja azul.
- Integracion con el ecosistema LeRobot: ejecutable mediante `lerobot-rollout` y reentrenable con `lerobot-train`.
- Despliegue en hardware de consumo segun la model card del modelo base.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual, matematicas, vision general, audio ni modo thinking.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: el modelo ejecuta la secuencia de coger el cubo rojo y depositarlo en la caja azul, adecuado para validar rapidamente un montaje robotico `so_follower` con dos camaras.
- Prototipado de politicas de imitacion: sirve como punto de partida para fine-tuning con `lerobot-train` sobre nuevos datasets, reduciendo el coste frente a entrenar desde cero.
- Demostraciones educativas de VLA: util para cursos y talleres de robotica que quieran mostrar el flujo completo de grabacion de datos, entrenamiento y despliegue con LeRobot.
- Pruebas de calibracion de camaras y estado articular: al exigir nombres de camara concretos (`wrist`, `top`) y un vector de estado de 6 dimensiones, ayuda a verificar que el pipeline de sensores del robot esta correctamente configurado.
- Benchmark interno de montajes roboticos: comparar tasas de exito de este fine-tuning frente a otras politicas sobre el mismo setup fisico.
- Base para experimentos de generalizacion: evaluar como se comporta la politica ante cambios de posicion de objetos, iluminacion o distractor, aunque no hay resultados publicados.
- Automatizacion de tareas repetitivas de baja complejidad en entornos controlados, siempre que el montaje coincida con el del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 450 millones de parametros y pesos safetensors, el modelo es ligero y cabe holgadamente en GPUs de consumo, aunque la cifra exacta depende del backend y del preprocesado visual.
- GPU recomendadas: la model card del modelo base indica despliegue en hardware de consumo; no se detallan modelos concretos (A100, H100, RTX 4090, etc.) en la informacion disponible.
- Compatibilidad con GPU de consumo: si, segun la descripcion del modelo base (SmolVLA se presenta como desplegable en hardware de consumo).
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento); no se documentan vLLM, llama.cpp, Ollama ni TGI para este tipo de politica robotica.
- Latencia y throughput: no disponibles. El dataset se grabo a 30 FPS, pero no se especifica la frecuencia de control efectiva del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alimerido/smolvla-newsetup-v1 | 450 M | VLA (fine-tune de SmolVLA) | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible | VLA base | no aplica | no disponible en la informacion | Hugging Face |
| Otros VLA de la familia SmolVLA | no disponible | VLA | no aplica | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento de alternativas comparables (por ejemplo, RT-1, RT-2 u OpenVLA), por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Especializacion extrema: el modelo fue entrenado para una unica tarea ("Grab the red cube, place it in the blue box"); fuera de ese escenario su utilidad es dudosa.
- Dependencia del montaje fisico: requiere un robot `so_follower` con camaras `wrist` y `top` y un vector de estado de 6 dimensiones; cualquier cambio de hardware invalida la politica.
- Sin resultados de evaluacion: no hay tasa de exito publicada, por lo que no se puede garantizar fiabilidad en produccion.
- Dataset pequeno: 50 episodios y 20 852 frames son insuficientes para esperar generalizacion robusta ante variaciones de posicion, iluminacion o distractores.
- Riesgo de sobreajuste al entorno de entrenamiento y de fallos ante objetos o configuraciones distintas.
- Idiomas: las instrucciones de tarea estan en ingles; no se documenta soporte multilingue.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Sin datos de sesgos, alucinacion o seguridad fisica: al ser un controlador robotico, los fallos pueden provocar colisiones o daños materiales; se recomienda supervisión y limites de seguridad en el robot.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alimerido/smolvla-newsetup-v1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/alimerido/new-setup_20261101_200122
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guia LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=alimerido/new-setup_20261101_200122
