# HyeonseokE/smolvla_ablation2_turn_off_lever_A2_1000_10fps

## Resumen

`HyeonseokE/smolvla_ablation2_turn_off_lever_A2_1000_10fps` es una politica de robotica entrenada con LeRobot y publicada en HuggingFace por el usuario HyeonseokE. Se trata de un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base`, que a su vez implementa el metodo SmolVLA descrito en el paper arXiv:2506.01844: un modelo compacto de vision-lenguaje-accion (VLA) disenado para ejecutar tareas de manipulacion a partir de observaciones visuales y de estado propioceptivo, con un coste computacional reducido que permite desplegarlo en hardware de consumo.

El modelo tiene 450.046.176 parametros (aproximadamente 450 millones) almacenados en safetensors, con un repositorio de 0,9 GB. No es un modelo de lenguaje general: es una politica de control que consume tres imagenes de 3x256x256 pixeles mas un vector de estado de 6 dimensiones, y produce un vector de accion de 6 dimensiones. La tarea concreta para la que fue entrenado es "Turn the lever off; the status indicator should turn red" (apagar la palanca hasta que el indicador de estado se ponga en rojo), sobre un brazo robotico de tipo `so101_follower`.

Por su naturaleza, esta ficha no describe un modelo de proposito general: es un artefacto de investigacion dentro de un estudio de ablacion. El nombre del repositorio indica que forma parte de una comparativa de configuraciones (ablation2), con semilla 1000 y datos capturados a 10 FPS. Su relevancia es acotada: sirve para reproducir resultados, comparar configuraciones de entrenamiento y evaluar el comportamiento de SmolVLA en una tarea de manipulacion muy especifica. En el momento de redactar esta ficha no tiene descargas ni "likes", y el autor no ha publicado resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) de tipo transformer; metodo SmolVLA (arXiv:2506.01844). Detalle interno de capas y atencion: no disponible |
| Parametros totales | 450.046.176 (segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo distribuye pesos en safetensors. No se anuncia GGUF ni cuantizaciones de 4/8 bits |
| Idiomas soportados | No disponible. La instruccion de tarea esta en ingles y el modelo esta especializado en una unica tarea |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de robot | `so101_follower` |
| Camaras declaradas | `top`, `left_wrist` (la tabla de entradas del model card lista `observation.images.camera1`, `camera2` y `camera3`) |
| Entradas | `observation.state` (6,), tres tensores visuales (3, 256, 256) |
| Salidas | `action` (6,), `action.radian_urdf0` (6,) |
| Tamano del repositorio | 0,9 GB |
| Pipeline | robotics |
| Version de LeRobot | 0.6.0 |

## Arquitectura y entrenamiento

SmolVLA se presenta en su model card como un modelo compacto y eficiente de vision-lenguaje-accion que alcanza rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo. En esta ficha solo se dispone de esa descripcion generica: no se detallan en la informacion proporcionada el numero de capas, el mecanismo de atencion, el encoder visual concreto ni el esquema de generacion de acciones (por ejemplo, si emplea decodificacion por flujo o regresion directa). Cualquier afirmacion adicional sobre la arquitectura interna debe contrastarse con el paper arXiv:2506.01844.

El entrenamiento es un fine-tuning supervisado desde `lerobot/smolvla_base` sobre el dataset `HyeonseokE/ablation2_turn_off_lever_A2_10fps`, compuesto por 100 episodios y 21.418 fotogramas capturados a 10 FPS, todos ellos correspondientes a la misma tarea. La configuracion registrada es: 16.700 pasos de entrenamiento, tamano de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, ejecutado con LeRobot 0.6.0. No se indica en la informacion disponible si hubo etapas de RLHF, DPO, destilacion o aumento de datos, ni la composicion completa del dataset mas alla del conteo de episodios y fotogramas. Tampoco se documenta ninguna innovacion tecnica especifica de esta variante concreta: forma parte de una familia de ablaciones.

## Capacidades

- Generacion de acciones de control de 6 grados de libertad para un brazo `so101_follower`, a partir de imagenes y estado propioceptivo.
- Ejecucion de una unica tarea de manipulacion: accionar una palanca hasta que el indicador de estado cambie a rojo.
- Percepcion visual multi-camara: consume hasta tres vistas de 3x256x256 (en el model card se declaran las camaras `top` y `left_wrist`).
- Fusion de vision y estado: combina tres entradas visuales con un vector de estado de 6 dimensiones.
- Seguimiento de instruccion en lenguaje natural limitado a la tarea de entrenamiento ("Turn the lever off; the status indicator should turn red.").
- Ejecucion de politicas en bucle cerrado mediante el comando `lerobot-rollout`, con estrategias de grabacion de episodios (`base`) o con registro de datos.
- Capacidad de ser reentrenado o ajustado con `lerobot-train` a partir del modelo base o de este checkpoint.

No hay evidencia en la informacion proporcionada de soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision general (captioning, VQA), audio, modo "thinking" ni capacidades multilingues. El modelo no es un LLM de proposito general.

## Casos de uso

- Reproduccion de experimentos de ablacion: este checkpoint corresponde a una configuracion concreta (`ablation2`, semilla 1000, datos a 10 FPS) y permite reproducir exactamente esa variante del estudio, comparando su comportamiento con las demas configuraciones de la misma serie.
- Automatizacion de una operacion de apagado en banco de pruebas: sobre un brazo SO-101, la politica puede ejecutar repetidamente la secuencia de accionar la palanca hasta que el indicador cambie a rojo, util en rutinas de prueba de equipos con interruptores fisicos.
- Evaluacion de protocolos de captura de datos: al estar entrenado exclusivamente con 100 episodios a 10 FPS, sirve para medir como afecta la tasa de muestreo y el volumen de datos a la tasa de exito en tareas de contacto fisico.
- Punto de partida para nuevo fine-tuning: con `--policy.path` apuntando a este repositorio o al modelo base, se puede reentrenar sobre un dataset propio de otra tarea con `lerobot-train`, aprovechando el conocimiento del modelo base.
- Banco de pruebas de hardware de bajo coste: dado su tamano de 450 M de parametros, es un candidato para validar si un equipo economico (GPU de gama media o incluso CPU) puede cerrar el bucle de control a la frecuencia requerida por los datos (10 Hz).
- Docencia y formacion en robotica de imitacion: el flujo completo (grabar datos, visualizar el dataset con el Space de LeRobot, entrenar y desplegar) se puede recorrer de principio a fin con este ejemplo de tarea unica y corta.
- Comparativa de estrategias de rollout: el comando documentado permite ejecutar la politica con `--strategy.type=base` (sin grabacion) o con grabacion de episodios, lo que facilita medir el comportamiento en modo puramente inferencial frente a modos con registro.
- Integracion en un pipeline de investigacion con LeRobot 0.6.0: sirve como componente de politica dentro de un stack ya existente, reutilizando las mismas interfaces de observacion y accion que el resto de politicas de la libreria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El propio model card indica explicitamente: "_No evaluation results have been provided for this policy yet._" Por tanto, no hay tasa de exito, numero de ensayos, MMLU, HumanEval, GSM8K ni ninguna otra metrica disponible para este checkpoint. Tampoco se han proporcionado resultados del paper SmolVLA ni comparaciones numericas con otros modelos.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones a partir del numero de parametros (450.046.176) y del tamano del repositorio (0,9 GB); no proceden de la informacion proporcionada por el autor, que no publica requisitos de hardware.

- Pesos en fp32: aproximadamente 1,8 GB solo de parametros.
- Pesos en bf16/fp16: aproximadamente 0,9 GB, coherente con el tamano del repositorio.
- Pesos en int8 (si se aplica cuantizacion, no documentada): aproximadamente 0,45 GB.
- VRAM total estimada para inferencia: del orden de 2 a 4 GB contando pesos, activaciones, buffers de imagenes (tres tensores de 3x256x256) y overhead del runtime. Cabe holgadamente en cualquier GPU de consumo actual (RTX 3060 12 GB, RTX 4060, RTX 4090, etc.) y en GPUs integradas con memoria compartida suficiente.
- GPU de datacenter (A100, H100) no son necesarias para inferencia; solo tendrian sentido para reentrenar con lotes grandes.
- Hardware embebido: por el enfasis del model card en "consumer-grade hardware", es plausible su uso en plataformas tipo Jetson o en portatiles, pero no hay confirmacion del autor.
- Opciones de despliegue: la via documentada es la libreria LeRobot, con los comandos `lerobot-rollout` (inferencia sobre el robot) y `lerobot-train` (entrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a una politica de robotica con entradas multimodales y salidas continuas.
- Latencia y throughput: no disponibles como medicion. Como referencia de requisito, los datos de entrenamiento se capturaron a 10 FPS, de modo que la politica debe producir acciones a una frecuencia de al menos 10 Hz (periodo de 100 ms) para operar al ritmo de la demostracion. El comando de ejemplo captura camaras a 640x480 y 30 FPS, y la politica recibe internamente 256x256.
- Almacenamiento: 0,9 GB para el repositorio completo.

## Comparativa con modelos similares

No se dispone de datos verificados de otros modelos de la misma categoria en la informacion proporcionada (los resultados de busqueda web devueltos no guardan relacion con el modelo). La unica comparacion que puede hacerse con datos solidos es dentro de la propia familia SmolVLA:

| Modelo | Parametros | Tipo de tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| `HyeonseokE/smolvla_ablation2_turn_off_lever_A2_1000_10fps` | 450.046.176 | Politica VLA de tarea unica (apagar palanca) sobre `so101_follower` | Apache 2.0 | Publico en HuggingFace; 0 descargas y 0 likes |
| `lerobot/smolvla_base` (modelo base) | No disponible en la informacion proporcionada | Politica VLA base, ajustable a distintas tareas | No disponible en la informacion proporcionada | Publico en HuggingFace |
| Otros VLA de la misma categoria (por ejemplo, alternativas citadas habitualmente en robotica de imitacion) | No disponible | No disponible | No disponible | No disponible |

Cualquier comparacion con modelos como OpenVLA, pi0 o RDT requiere consultar sus respectivas fichas y el paper arXiv:2506.01844; no se incluyen cifras aqui para no introducir datos no verificados.

## Limitaciones y advertencias

- Especializacion extrema: la politica ha sido entrenada para una unica tarea ("Turn the lever off; the status indicator should turn red"). Fuera de esa tarea y de ese montaje no cabe esperar un comportamiento util.
- Dependencia del hardware: esta ajustada a un robot `so101_follower` con una configuracion concreta de camaras. Cambiar el brazo, la cinematica, la posicion de las camaras o la iluminacion invalida la politica.
- Inconsistencia en la documentacion de camaras: el model card declara las camaras `top` y `left_wrist`, mientras que la tabla de entradas lista `observation.images.camera1`, `camera2` y `camera3`. Los nombres de las camaras deben coincidir con las claves de observacion usadas en el entrenamiento, por lo que esta discrepancia puede provocar fallos al ejecutar `lerobot-rollout`.
- Sin resultados de evaluacion: no hay tasa de exito reportada, ni numero de ensayos, ni condiciones de prueba. No se puede afirmar que la politica funcione de forma fiable en produccion.
- Riesgo de sobreajuste: 100 episodios y 21.418 fotogramas para 16.700 pasos de entrenamiento con lote 64 es un regimen que en robotica de imitacion suele producir politicas fragiles ante cambios de posicion, iluminacion o distracciones.
- Ausencia de datos sobre sesgos: no se ha publicado ningun analisis de sesgos, y en un modelo de control fisico el sesgo relevante es de rendimiento diferencial segun condiciones del entorno, no de contenido textual.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe el equivalente en control, es decir, la ejecucion de una trayectoria plausible pero incorrecta que no complete la tarea o que fuerce el mecanismo.
- Idioma: la unica instruccion documentada esta en ingles. No hay evidencia de soporte multilingue; los cambios de redaccion de la instruccion pueden degradar el comportamiento.
- Alcance del artefacto: forma parte de un estudio de ablacion (`ablation2`, semilla 1000). Su valor es experimental; no esta pensado como release estable.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero debe conservarse el aviso de licencia y la atribucion. No impone restricciones de uso adicionales, aunque tampoco ofrece garantias.
- Adopcion nula: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de validacion externa.
- Anomalia en las fechas: la fecha de creacion registrada es 2026-09-13, posterior a la fecha habitual de publicacion de la familia SmolVLA. Conviene verificar el dato en la ficha original antes de citarlo.
- Sin garantias de seguridad fisica: al controlar un brazo robotico real, debe validarse siempre en entorno controlado, con parada de emergencia y limites de par, antes de cualquier uso con personas cerca.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HyeonseokE/smolvla_ablation2_turn_off_lever_A2_1000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/ablation2_turn_off_lever_A2_10fps
- Visualizador del dataset (Space de LeRobot): https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/ablation2_turn_off_lever_A2_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a paneles de acceso de AT&T y no guardan relacion con esta ficha.
