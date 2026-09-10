# soooma703/act_so101_test2

## Resumen

`soooma703/act_so101_test2` es un checkpoint de politica robotica entrenado con el algoritmo ACT (Action Chunking with Transformers), publicado por el usuario soooma703 mediante la libreria LeRobot de Hugging Face. No se trata de un modelo de lenguaje: es una politica de aprendizaje por imitacion (imitation learning) que, a partir de observaciones visuales y del estado de un brazo robotico, predice trozos cortos de acciones ("action chunks") en lugar de un unico paso de control. El checkpoint ocupa 0,2 GB y contiene 51.668.662 parametros en formato safetensors.

El modelo ha sido entrenado sobre el dataset `soooma703/demo2`, presumiblemente compuesto por episodios de teleoperacion, y esta etiquetado para el robot `so100_follower` (familia SO-100/SO-101) en los ejemplos de evaluacion de su model card. Su relevancia es limitada y muy acotada: se trata de un artefacto de prueba con 0 descargas y 0 likes en el momento de la consulta, sin resultados de evaluacion publicados, por lo que debe considerarse un experimento reproducible mas que un modelo listo para produccion.

El interes tecnico esta en el metodo subyacente: ACT es una referencia habitual en manipulacion robotica de bajo coste porque consigue tasas de exito altas con muy pocos datos de demostracion, y LeRobot lo expone con un flujo de entrenamiento y evaluacion en linea de comandos. Cualquier uso real exige reentrenar o al menos reevaluar el checkpoint sobre el robot y las tareas concretas del despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con componente CVAE y backbone visual para las observaciones; politica de imitacion, no generativa de texto |
| Parametros totales | 51.668.662 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: la politica usa un horizonte de observacion y un chunk de acciones configurables, no una ventana de tokens) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas; los pesos se publican en safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint de LeRobot, cargable con `--policy.path` via `lerobot-record` / flujo de evaluacion de LeRobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers), descrito en el paper arXiv:2304.13705, es un metodo de aprendizaje por imitacion que combina un transformer encoder-decoder con un autoencoder variacional condicional (CVAE). La entrada son observaciones (imagenes de camaras y estado de las articulaciones) y la salida es un chunk de acciones futuras de longitud fija, lo que reduce el problema de compounding error y permite un control mas suave que predecir una accion por paso. El backbone visual y el detalle exacto de las capas de este checkpoint concreto no estan documentados en la model card; el unico dato verificable es el recuento de 51,7 millones de parametros y la libreria de entrenamiento (`lerobot`).

Respecto a los datos, la model card indica que el entrenamiento se realizo con LeRobot sobre el dataset `soooma703/demo2` (episodios de teleoperacion), pero no se especifica el numero de episodios, el numero de tokens o frames, la composicion del dataset, ni si hubo etapas de RLHF/DPO (no aplicables en este paradigma). El flujo documentado es `lerobot-train --policy.type=act ...` con seguimiento opcional en Weights & Biases, y la evaluacion se hace con `lerobot-record` sobre un `so100_follower` durante un numero fijo de episodios. No se documentan innovaciones adicionales como decodificacion especulativa ni mecanismos de atencion lineal, que no forman parte de este tipo de politica.

## Capacidades

- Generacion de acciones de control para un brazo robotico: produce chunks de acciones a partir de observaciones visuales y de estado, en lugar de texto.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas: replica las trayectorias del dataset `soooma703/demo2` en tareas de manipulacion.
- Manipulacion de precision micrometrica en el marco del metodo ACT (el paper original lo describe para tareas bimanuales finas), sujeto a que el checkpoint se haya entrenado para ello.
- Control reactivo de bucle cerrado: al recibir nuevas observaciones, genera el siguiente chunk de acciones.
- Ejecucion en hardware de bajo coste: el ecosistema LeRobot y SO-100/SO-101 esta disenado para brazos de bajo presupuesto.
- No soporta tool calling ni function calling: no es un modelo de lenguaje y no tiene interfaz de llamada a herramientas.
- No soporta razonamiento multi-paso simbolico ni agentes basados en lenguaje.
- No tiene capacidades multilingues, de vision general (captioning, VQA) ni de audio: la vision se usa exclusivamente como entrada de politica.
- No dispone de "thinking mode" ni modos de razonamiento explicito.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: el checkpoint puede evaluarse sobre un brazo SO-101 para tareas de recogida y colocacion, siempre que las tareas coincidan con las demostraciones de `soooma703/demo2`; el chunking de acciones de ACT suaviza el control y reduce las pausas tipicas de las politicas paso a paso.
- Reproduccion de experimentos de imitation learning: sirve como punto de partida para comparar ACT frente a otras politicas de LeRobot (por ejemplo Diffusion Policy) sobre un mismo dataset, usando `lerobot-record` con 10 episodios de evaluacion.
- Base para fine-tuning con datos propios: al ser un checkpoint pequeno (0,2 GB, 51,7 M de parametros) se puede reentrenar o ajustar en un unico equipo con GPU de gama media a partir de nuevas teleoperaciones.
- Prototipado de celulas roboticas de bajo coste: en entornos educativos o de investigacion donde el presupuesto para hardware es reducido, el par SO-101 + LeRobot + ACT permite montar una estacion de manipulacion completa.
- Recogida de datos y aumento de demostraciones: uso del checkpoint como politica inicial para generar episodios que luego se filtran y se anaden al dataset de entrenamiento (DAgger simplificado hecho a mano).
- Validacion de pipelines de control robotico: al ser un modelo pequeno y determinista en su inferencia, es util para probar la integracion entre LeRobot, ROS o un lazo de control propio sin arriesgar hardware caro.
- Docencia en robotica y aprendizaje por imitacion: permite mostrar en clase el ciclo completo teleoperacion -> dataset -> entrenamiento -> evaluacion con un modelo de 51,7 M de parametros que cabe en cualquier portatil con GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint no incluye tasas de exito, numeros de episodios de evaluacion ni comparaciones con otras politicas. El paper de ACT (arXiv:2304.13705) reporta sus propios resultados, pero no son atribuibles a este checkpoint concreto ni se han verificado en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos en safetensors ocupan aproximadamente 0,2 GB (51,7 M de parametros), por lo que la inferencia cabe holgadamente en 1-2 GB de VRAM incluyendo activaciones, y es viable incluso en CPU para control a baja frecuencia.
- GPU recomendadas: cualquier GPU con soporte CUDA y >=4 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, A100, H100). El modelo no aprovecha VRAM adicional; la eleccion depende mas de la carga de entrenamiento que de la inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos anos, e incluso en equipos sin GPU dedicada si se acepta mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`, `lerobot-eval`), PyTorch nativo. vLLM, TGI, llama.cpp y Ollama no son aplicables porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible. ACT esta disenado para predecir chunks de acciones y reducir la frecuencia efectiva de inferencia, pero no se publican mediciones de latencia para este checkpoint.
- Entrenamiento: no disponible en la informacion proporcionada; el paper de ACT orienta a entrenamiento en una unica GPU, pero no se confirma la configuracion usada aqui.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de sus fichas publicas y no se han verificado en la informacion proporcionada en esta busqueda; se incluyen solo como orientacion de categoria.

| Modelo | Tipo | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| act_so101_test2 (este modelo) | ACT (transformer + CVAE), imitacion | 51,7 M (dato verificado) | apache-2.0 | Hugging Face via LeRobot |
| Diffusion Policy | Politica de difusion para acciones | no disponible (depende de la configuracion) | habitualmente MIT o similar, no verificado | Implementaciones publicas y soporte en LeRobot |
| SmolVLA | VLA (vision-language-action) | no disponible en la informacion proporcionada | no verificado | Hugging Face / LeRobot |
| pi0 (Physical Intelligence) | VLA de flujo | no disponible en la informacion proporcionada | no verificado | Publicaciones y checkpoints, disponibilidad variable |

Diferencias clave: ACT es una politica puramente de imitacion, sin componente de lenguaje, mientras que SmolVLA y pi0 incorporan instrucciones en lenguaje natural y por tanto generalizan a multiples tareas con un mismo modelo. A cambio, ACT es ordenes de magnitud mas pequeno y se puede entrenar y desplegar en hardware minimo. La comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. En politicas de imitacion el sesgo relevante es el de las demostraciones: el modelo reproduce los sesgos de las trayectorias humanas de `soooma703/demo2` (velocidades, posiciones, estrategias de agarre).
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero existe un riesgo equivalente de generar acciones incorrectas o inseguras ante estados fuera de distribucion, especialmente si el entorno, la iluminacion o la posicion de los objetos difieren del dataset.
- Generalizacion muy limitada: al ser un checkpoint de prueba entrenado sobre un unico dataset, se espera un rendimiento bajo en tareas distintas de las demostradas.
- Limitaciones de contexto: no hay ventana de contexto; la memoria efectiva se limita al horizonte de observacion y al chunk de acciones configurados.
- Limitaciones de idioma: no aplica; el modelo no procesa ni genera lenguaje.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial y modificacion, con obligacion de conservar los avisos de licencia y de atribucion. No incluye garantias ni responsabilidad por danos derivados del uso.
- Caveat para produccion: no hay resultados de evaluacion publicados, ni numero de episodios, ni tasa de exito. Antes de cualquier despliegue hay que reentrenar o validar el checkpoint en el robot objetivo y establecer topes de par, limites articulares y paradas de emergencia independientes del modelo.
- Reproducibilidad: el dataset `soooma703/demo2` es de un usuario particular y no se detalla su composicion, lo que dificulta reproducir el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/soooma703/act_so101_test2
- Dataset de entrenamiento: https://huggingface.co/datasets/soooma703/demo2
- Paper de ACT (pagina de Hugging Face): https://huggingface.co/papers/2304.13705
- Paper de ACT (arXiv): https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
