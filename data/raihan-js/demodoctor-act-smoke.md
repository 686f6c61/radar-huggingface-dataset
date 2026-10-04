# raihan-js/demodoctor-act-smoke

## Resumen

`raihan-js/demodoctor-act-smoke` es una politica de robotica basada en ACT (Action Chunking with Transformers), un metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones en lugar de pasos individuales. Lo publica el usuario de HuggingFace `raihan-js` y se distribuye a traves de la libreria LeRobot de HuggingFace, con licencia Apache 2.0. No es un modelo de lenguaje: es un controlador visomotor que consume imagenes y estado del robot y produce comandos de accion.

El modelo tiene 51.660.418 parametros (unos 51,7 millones) en formato safetensors, con un repositorio de 0,2 GB. Recibe una imagen de 3x96x96 pixeles y un vector de estado de dimension 2, y emite una accion de dimension 2. Fue entrenado sobre el conjunto de datos `lerobot/pusht`, una tarea de manipulacion simulada que consiste en empujar un bloque en forma de T hasta una diana con la misma forma.

Su relevancia es limitada y de caracter practico: por el nombre del repositorio ("smoke") y por haberse entrenado solo 500 pasos, todo apunta a una prueba de humo del pipeline de LeRobot mas que a una politica lista para produccion. Resulta util como referencia para verificar instalaciones, reproducir el flujo de entrenamiento de ACT o servir de plantilla para entrenamientos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.660.418 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre observaciones por paso) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors) |
| Idiomas soportados | no disponible (no aplica; no procesa lenguaje natural como tarea principal) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

Especificaciones de entrada y salida:

| Caracteristica | Tipo | Forma |
|---|---|---|
| `observation.image` | VISUAL | (3, 96, 96) |
| `observation.state` | STATE | (2,) |
| `action` | ACTION | (2,) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion presentado en el articulo arXiv 2304.13705. La politica aprende a partir de datos de teleoperacion y, en lugar de predecir una sola accion por paso, genera un "chunk" o bloque corto de acciones futuras. Esta formulacion reduce el problema de horizonte largo y mitiga el sesgo de parada, y en la literatura suele alcanzar tasas de exito altas en tareas de manipulacion. La implementacion concreta de este repositorio proviene de LeRobot, la libreria de aprendizaje automatico para robotica del mundo real de HuggingFace, y esta pensada para entrenamiento con vision (una camara de tipo `image`) y un estado de dos dimensiones.

Los datos de entrenamiento son el conjunto `lerobot/pusht`: 206 episodios, 25.650 fotogramas a 10 FPS, correspondientes a la tarea "empujar el bloque en forma de T hasta la diana en forma de T". La configuracion de entrenamiento declarada es de 500 pasos, tamano de lote 32, optimizador AdamW, tasa de aprendizaje 1e-05, semilla 0 y LeRobot 0.6.1. No se documenta ninguna fase de RLHF, DPO ni ajuste por preferencias; se trata exclusivamente de aprendizaje por imitacion supervisado. Tampoco se detalla composicion adicional del dataset, aumentos de datos ni innovaciones propias mas alla del metodo ACT original.

## Capacidades

- Control visomotor para manipulacion robotica: genera acciones de dos dimensiones a partir de una imagen de 96x96 y un estado de dos dimensiones.
- Prediccion por bloques de acciones (action chunking), que reduce la frecuencia efectiva de replanificacion frente a politicas paso a paso.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, sin necesidad de recompensas ni simulador diferenciable.
- Ejecucion en bucle cerrado sobre robot real mediante `lerobot-rollout`, con estrategia de tipo `base`.
- Entrenamiento reproducible mediante `lerobot-train` con `--policy.type=act`.
- Tarea especifica: empujar un bloque en forma de T a una diana en forma de T.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, modo de pensamiento, vision general, audio ni generacion de texto libre. Estas capacidades no aplican a este tipo de modelo.

## Casos de uso

- Verificacion del pipeline de LeRobot: al estar entrenado solo 500 pasos y llevar "smoke" en el nombre, sirve para comprobar que la instalacion, el acceso al Hub y la carga de safetensors funcionan antes de lanzar entrenamientos largos.
- Prueba de integracion hardware-software: con `lerobot-rollout` y `--strategy.type=base` se puede validar la conexion con el robot (`--robot.port`), la calibracion de camaras y el mapeo de claves de observacion (`observation.image`, `observation.state`).
- Plantilla de configuracion para entrenamientos propios: su tarjeta documenta exactamente los hiperparametros (500 pasos, lote 32, AdamW, lr 1e-05, semilla 0) y el comando `lerobot-train`, lo que permite clonar el flujo y sustituir el dataset.
- Referencia de comparacion en experimentos de aprendizaje por imitacion: util como linea base de bajo coste (51,7 M de parametros) frente a metodos mas pesados como Diffusion Policy.
- Docencia y divulgacion: ilustra de forma tangible el ciclo completo de LeRobot (instalacion, grabacion de datos, entrenamiento y despliegue) sin requerir grandes recursos de computo.
- Pruebas de regresion en CI: dado su tamano reducido (0,2 GB), se puede descargar y cargar en un runner con GPU modesta para comprobar que los cambios en la libreria no rompen la inferencia.
- Reproduccion de la tarea PushT en simulacion: el dataset `lerobot/pusht` es simulado, por lo que permite experimentar con la tarea sin disponer de un robot fisico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia tarjeta del modelo indica explicitamente: "No evaluation results have been provided for this policy yet", y deja la tabla de evaluacion (tarea, intentos, exitos, tasa de exito) sin rellenar. No se debe asumir ninguna tasa de exito para la tarea PushT a partir de este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,66 millones de parametros, el peso en FP32 ocupa aproximadamente 207 MB y en FP16 unos 103 MB; sumando activaciones y buffers de vision, la huella cabe holgadamente por debajo de 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con soporte CUDA suficiente para PyTorch; el modelo es trivial para una RTX 3060, RTX 4090, A100 o H100. No se requiere GPU de centro de datos.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna e incluso en equipos con poca VRAM. El comando de entrenamiento documentado usa `--policy.device=cuda`.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (inferencia) y `lerobot-train` (entrenamiento), con PyTorch. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica robotica.
- Latencia y rendimiento: no disponibles. No se publican mediciones de latencia por accion ni de frecuencia de control alcanzable. Como referencia del entorno, el dataset fue grabado a 10 FPS.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `raihan-js/demodoctor-act-smoke` (ACT) | Transformer con action chunking, aprendizaje por imitacion | 51,66 M | no disponible | Apache 2.0 | HuggingFace Hub |
| Diffusion Policy | Politica generativa por difusion para robotica | no disponible | no disponible | no disponible | Implementacion en LeRobot |
| VQ-BeT | Politica con cuantizacion vectorial de comportamiento | no disponible | no disponible | no disponible | Implementacion en LeRobot |
| SmolVLA | Vision-language-action de HuggingFace para robotica | no disponible | no disponible | no disponible | HuggingFace Hub |

No se dispone de datos verificados de parametros, contexto ni rendimiento de las alternativas dentro de la informacion proporcionada; las filas correspondientes se marcan como no disponibles. La comparacion solo puede establecerse a nivel cualitativo: ACT destaca por su simplicidad y su bajo coste de inferencia, mientras que Diffusion Policy y VQ-BeT cubren enfoques generativos y de cuantizacion distintos dentro del mismo ecosistema LeRobot.

## Limitaciones y advertencias

- Naturaleza de prueba: el nombre "smoke" y los 500 pasos de entrenamiento sugieren un modelo de prueba de humo, no una politica entrenada hasta convergencia. No deberia usarse en produccion ni en robots reales sin un reentrenamiento completo.
- Ausencia de evaluacion: no hay ninguna tasa de exito publicada, ni en simulacion ni en robot real, por lo que se desconoce su rendimiento efectivo.
- Especificidad de tarea: solo se ha entrenado para "empujar el bloque en forma de T hasta la diana en forma de T". No generaliza a otras tareas ni objetos.
- Tipo de robot desconocido: la tarjeta indica `Robot type: unknown`, de modo que no se puede garantizar compatibilidad con una plataforma concreta. El comando de ejemplo deja `--robot.type=unknown` y los placeholders de puerto y camaras sin resolver.
- Dependencia de la observacion: exige exactamente una imagen de 3x96x96 y un estado de dimension 2 con las claves `observation.image` y `observation.state`. Cualquier discrepancia en nombres o formas rompe la inferencia.
- Sensibilidad al dominio visual: al entrenarse sobre un dataset simulado de 25.650 fotogramas, es probable que no transfiera bien a condiciones reales de iluminacion, fondo o camara distintas de las del conjunto de entrenamiento.
- Sesgos: no se documentan analisis de sesgo. En aprendizaje por imitacion, la politica reproduce los sesgos y las imperfecciones de las demostraciones teleoperadas, incluidos los errores sistematicos del operador.
- Riesgo de acumulacion de error: al ser una politica de imitacion en bucle cerrado, los errores pueden acumularse fuera de la distribucion de estados vista durante el entrenamiento.
- Idiomas: no aplica ni se documenta soporte multilingue; el campo de idiomas esta vacio.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y el archivo NOTICE si existe. No se identifican restricciones adicionales en la informacion disponible.
- Fecha de publicacion inusual: la tarjeta indica fecha de creacion y actualizacion en octubre de 2026, dato que conviene contrastar antes de citarlo.
- Ficha sin demo ni video: la tarjeta incluye el comentario de plantilla sobre grabar un GIF o video de demostracion, pero no se ha subido ninguno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/raihan-js/demodoctor-act-smoke
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/pusht
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/pusht
- Articulo de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre ACT; los enlaces anteriores proceden exclusivamente de la informacion de HuggingFace y de la tarjeta del modelo.
