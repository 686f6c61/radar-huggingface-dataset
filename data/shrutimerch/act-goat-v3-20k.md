# shrutimerch/act-goat-v3-20k

## Resumen

`shrutimerch/act-goat-v3-20k` es una politica de imitacion (imitation learning) para robotica entrenada con el metodo ACT (Action Chunking with Transformers) y publicada en el Hub mediante LeRobot. No es un modelo de lenguaje: es un controlador visuomotor que, a partir del estado de las articulaciones y de dos camaras RGB, predice comandos de accion de 6 dimensiones para un brazo seguidor de tipo `so_follower` (familia SO-100/SO-101).

El checkpoint tiene 51.668.614 parametros (0,2 GB en el repositorio) y esta especializado en una unica tarea: "Pick up the goat and place it in the bucket". se entreno sobre el dataset `shrutimerch/goat-pickup-v3-clean`, con 49 episodios y 31.906 fotogramas a 30 FPS (aproximadamente 17,7 minutos de datos teleoperados), durante 20.000 pasos con AdamW y una tasa de aprendizaje de 1e-5.

Su relevancia actual es doble: por un lado, sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabacion, entrenamiento, rollout); por otro, es un punto de partida util para comparar configuraciones de ACT, ajustar fine-tuning con pocos datos o validar hardware de bajo coste antes de escalar a politicas mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con componente CVAE y backbones visuales para dos camaras (paper arXiv:2304.13705) |
| Parametros totales | 51.668.614 (segun los pesos en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto de lenguaje; ACT predice chunks de acciones en lugar de pasos individuales, pero la model card no especifica el tamano del chunk |
| Tipos de cuantizacion | no disponible (la model card no documenta cuantizaciones; se distribuye en safetensors via lerobot) |
| Idiomas soportados | no disponible; no procesa lenguaje natural (la tarea se pasa como cadena fija en el rollout) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

Datos adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | (6,) |
| `observation.images.wrist` | VISUAL | (3, 480, 640) |
| `observation.images.exocentric` | VISUAL | (3, 720, 1280) |
| `action` | ACTION | (6,) |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que aprende de datos teleoperados y predice secuencias cortas de acciones (chunks) en vez de un unico paso, lo que reduce el error de compundicion y permite movimientos mas suaves que el behavioral cloning paso a paso. La formulacion incluye un componente de autoencoder variacional condicional (CVAE) que modela la variabilidad del estilo humano en las demostraciones, y en la implementacion de LeRobot se apoya en backbones visuales convolucionales para procesar las imagenes de muneca y exocentrica. El checkpoint no detalla el desglose de parametros por modulo ni el tamano exacto del chunk de acciones.

El entrenamiento se realizo con LeRobot 0.6.1: 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. El dataset de origen contiene 49 episodios y 31.906 fotogramas a 30 FPS de una unica tarea ("Pick up the goat and place it in the bucket"), capturados con dos camaras: una en la muneca y otra exocentrica. No se documenta el uso de RLHF, DPO ni fases de refinamiento posteriores; el metodo es puramente supervisado sobre demostraciones. No hay informacion sobre tecnicas adicionales como decodificacion especulativa, atencion lineal o ensamblado temporal en esta configuracion concreta.

## Capacidades

- Control visuomotor de un brazo robotico de 6 grados de libertad: consume el estado de 6 articulaciones y emite un vector de accion de 6 dimensiones.
- Fusion de dos flujos visuales con resoluciones distintas (480x640 en la muneca y 720x1280 exocentrica) para localizar objetos y planificar la aproximacion.
- Prediccion por chunks de acciones, lo que aporta estabilidad temporal en el bucle de control.
- Ejecucion de una tarea de pick-and-place concreta: coger un objeto ("goat") y depositarlo en un cubo.
- Rollout autonomo en bucle cerrado con el comando `lerobot-rollout` y `--strategy.type=base`.
- Reutilizacion como inicializacion para fine-tuning con `lerobot-train --policy.type=act`.
- No soporta generacion de texto, razonamiento simbolico, matematicas, codigo, tool calling, function calling, agentes multi-paso ni capacidades de audio o lenguaje. Tampoco tiene capacidades multilingues: no procesa instrucciones en lenguaje natural, solo la cadena de tarea fija asociada al entrenamiento.

## Casos de uso

- Recogida y deposito de objetos en laboratorio: el modelo ejecuta la tarea de coger el objeto y dejarlo en el cubo sobre un `so_follower`, con dos camaras configuradas tal y como se entreno. Es adecuado porque la politica fue entrenada exactamente para esa secuencia y evita tener que disenar un planificador geometrico.
- Baseline reproducible en experimentos de imitation learning: al ser un checkpoint de ACT con configuracion documentada (20.000 pasos, batch 8, lr 1e-5, semilla 1000), sirve como referencia fija para comparar variaciones de dataset, aumentos de datos o cambios de camara.
- Fine-tuning con pocas demostraciones: partiendo de estos pesos, un equipo puede reentrenar con un dataset propio mas pequeno para una tarea similar de pick-and-place, aprovechando que la representacion visual ya esta aprendida.
- Validacion de un montaje fisico antes de invertir en datos: permite comprobar calibracion de camaras, iluminacion y rango de trabajo del brazo con un modelo ya entrenado, detectando problemas de hardware en minutos en lugar de tras decenas de episodios nuevos.
- Demostraciones educativas y de divulgacion: el flujo completo (visualizar el dataset, lanzar `lerobot-rollout`, grabar un video) puede reproducirse en un taller tecnico para explicar como funciona una politica visuomotora entrenada con LeRobot.
- Investigacion sobre robustez y distribucion de datos: al ser una politica especializada en una sola tarea, es un banco de pruebas util para medir sensibilidad a posiciones nuevas del objeto, cambios de iluminacion o presencia de distractores.
- Automatizacion de tareas repetitivas de baja variabilidad: en una celda controlada donde el objeto aparece siempre en una zona acotada, la politica puede encadenar ciclos de recogida sin intervencion, sujeto a las comprobaciones de seguridad oportunas.
- Punto de partida para comparativas ACT frente a otras familias (Diffusion Policy, VQ-BeT) en el mismo montaje experimental, siempre que se reentrenen con el mismo dataset para que la comparacion sea valida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "No evaluation results have been provided for this policy yet", por lo que no hay tasas de exito en robot real, numero de ensayos ni condiciones de evaluacion (posiciones nuevas, cambios de iluminacion, distractores o robots distintos).

| Metrica | Resultado |
|---|---|
| Tasa de exito en robot real | no disponible |
| Numero de ensayos por tarea | no disponible |
| Comparativa con otras politicas | no disponible |

## Requisitos de hardware

- VRAM estimada: con los 51.668.614 parametros, los pesos ocupan aproximadamente 207 MB en fp32 y 103 MB en fp16/bf16. Sumando activaciones de dos flujos de imagen (480x640 y 720x1280), buffers de inferencia y el resto del grafo, el consumo realista se situa en el rango de 2 a 4 GB, aunque no se documenta una medicion oficial.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de memoria y soporte CUDA es suficiente en principio; el entrenamiento con batch 8 y dos camaras se beneficia de tarjetas tipo RTX 3090, RTX 4090, A100 o H100, mientras que la inferencia es viable en tarjetas mucho mas modestas.
- Cabe en GPU de consumo: si, con margen amplio. Una RTX 3060 de 12 GB, una RTX 4060 Ti o una RTX 4090 pueden ejecutar la politica; la memoria no es el cuello de botella, sino la latencia del bucle de control y el ancho de banda de las camaras.
- Opciones de despliegue: el flujo nativo es la CLI de LeRobot (`lerobot-rollout --policy.path=shrutimerch/act-goat-v3-20k`), que carga los pesos safetensors con PyTorch. No aplican herramientas de servido de LLM como vLLM, llama.cpp, Ollama o TGI, porque no es un modelo de lenguaje.
- Latencia y throughput: no se publican cifras. Como referencia del montaje, el dataset se grabo a 30 FPS y el bucle de rollout se ejecuta con `--duration=60` en el ejemplo de la model card, lo que implica que la politica debe inferir de forma sostenida a una frecuencia compatible con el control en tiempo real del brazo.
- Requisitos adicionales: robot `so_follower`, dos camaras (una en la muneca y otra exocentrica) y nombres de camara que coincidan exactamente con las claves de observacion del entrenamiento (`observation.images.wrist`, `observation.images.exocentric`).

## Comparativa con modelos similares

No hay datos numericos publicados en la informacion disponible para comparar rendimiento. La tabla siguiente resume diferencias metodologicas y de disponibilidad, marcando como "no disponible" todo aquello que no se puede verificar con las fuentes consultadas.

| Modelo | Parametros | Representacion de accion | Contexto/horizonte | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| `shrutimerch/act-goat-v3-20k` (ACT) | 51.668.614 | Chunks de acciones de 6 dimensiones | no disponible (tamano de chunk no especificado) | apache-2.0 | no disponible |
| Diffusion Policy | no disponible | Secuencias de acciones generadas por difusion | no disponible | no disponible | no disponible |
| VQ-BeT | no disponible | Acciones discretizadas con transformer autoregresivo | no disponible | no disponible | no disponible |
| Otros checkpoints ACT de LeRobot | variable segun configuracion | Chunks de acciones | no disponible | habitualmente la del repositorio de origen | no disponible |

La comparacion cuantitativa con alternativas solo es valida si se reentrenan sobre el mismo dataset y se evaluan en el mismo robot; la informacion proporcionada no incluye esos experimentos.

## Limitaciones y advertencias

- Es una politica especializada en una unica tarea y un unico tipo de robot (`so_follower`). Fuera de "Pick up the goat and place it in the bucket" y de ese hardware, no hay garantia de funcionamiento.
- El dataset de entrenamiento es muy pequeno: 49 episodios y 31.906 fotogramas (unos 17,7 minutos a 30 FPS). Es un escenario propicio para el sobreajuste a posiciones, iluminacion y apariencia concretas del objeto.
- No se han publicado evaluaciones en robot real, por lo que se desconoce la tasa de exito real, la repetibilidad y el comportamiento ante perturbaciones.
- Las claves de observacion deben coincidir exactamente con las usadas en el entrenamiento (`observation.state`, `observation.images.wrist`, `observation.images.exocentric`). Un desajuste en nombres, resoluciones o indices de camara provoca fallos de ejecucion o un comportamiento degradado.
- No procesa lenguaje natural ni instrucciones habiles: no se puede repromptear para cambiar de tarea, solo reentrenar.
- Riesgo de deriva de distribucion: cambios en el objeto, la mesa, la iluminacion o el calibrado del robot pueden producir movimientos incorrectos sin aviso. En robotica este riesgo se traduce en colisiones y danos fisicos, no en una respuesta de texto erronea.
- No incluye mecanismos de seguridad propios: conviene operar con limites de par, parada de emergencia y espacio de trabajo despejado.
- La licencia del checkpoint es apache-2.0, que permite uso comercial, pero debe verificarse por separado la licencia del dataset (`shrutimerch/goat-pickup-v3-clean`) y de las dependencias de LeRobot antes de un despliegue en produccion.
- Sesgos conocidos: no documentados en la model card. Cabe esperar sesgos derivados de la unica persona teleoperadora y del entorno de grabacion, pero no hay informacion al respecto.
- No hay datos de consumo energetico, latencia maxima ni rendimiento en CPU publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shrutimerch/act-goat-v3-20k
- Dataset de entrenamiento: https://huggingface.co/datasets/shrutimerch/goat-pickup-v3-clean
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shrutimerch/goat-pickup-v3-clean
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- La busqueda web realizada no devolvio enlaces tecnicos relevantes sobre este modelo: los resultados obtenidos correspondian a dominios de contenido no relacionado y se han descartado.
