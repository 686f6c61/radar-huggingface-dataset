# seriintan/smolvla_lang3a_frazier_blade

## Resumen

`seriintan/smolvla_lang3a_frazier_blade` es un policy de robotica entrenado con LeRobot sobre el modelo base SmolVLA (`lerobot/smolvla_base`), un modelo compacto de vision-lenguaje-accion (VLA) presentado en el paper arXiv:2506.01844 y pensado para ejecutarse en hardware de consumo. No es un modelo de lenguaje general: consume observaciones de robot (dos imagenes de 480x640 y un vector de estado de 6 dimensiones) y emite directamente un vector de accion de 6 dimensiones a 30 FPS. El autor del fine-tune es `seriintan`, con licencia Apache 2.0.

Este checkpoint concreto esta especializado en dos tareas de manipulacion con instrumental quirurgico: coger el tubo de succion Frazier y depositarlo en una cesta azul, y coger la hoja de bisturi quirurgico y depositarla en la misma cesta. Se ha entrenado sobre el dataset `seriintan/lang3a_frazier_blade` (120 episodios, 48.454 frames, 30 FPS) con el robot `so_follower` y dos camaras (`wrist` y `side`). El modelo tiene 450.046.176 parametros (unos 450 M) y el repositorio ocupa 1,2 GB en safetensors.

Su relevancia es doble: por un lado demuestra el flujo completo de imitacion end-to-end con LeRobot sobre un VLA pequeno (menos de 500 M de parametros), viable en GPU de consumo; por otro, es un ejemplo de aplicacion en dominio quirurgico simulado o de laboratorio, donde la precision de agarre y colocacion importa. El autor no ha publicado resultados de evaluacion en robot real, por lo que el rendimiento efectivo de este checkpoint no esta verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) compacta; policy de imitacion entrenada con LeRobot. Detalle interno de capas no disponible en la informacion proporcionada |
| Parametros totales | 450.046.176 (aprox. 450 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de texto. Entrada: `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.side` (3, 480, 640); salida: `action` (6,) |
| Tipos de cuantizacion | No documentados. Pesos distribuidos en safetensors (repo de 1,2 GB); no se publican variantes GGUF, int8 ni int4 |
| Idiomas soportados | No disponibles. Las instrucciones de tarea del dataset estan en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA se describe en su model card como un modelo de vision-lenguaje-accion compacto y eficiente, con rendimiento competitivo a coste computacional reducido y desplegable en hardware de consumo. En este repositorio, la arquitectura concreta se hereda de `lerobot/smolvla_base` y se especializa mediante fine-tuning: la policy consume dos flujos visuales (camara de muneca y camara lateral) junto con el estado articular de 6 dimensiones, y produce una accion de 6 dimensiones. No se detallan en la informacion disponible el numero de capas, el encoder visual, el mecanismo de integracion de la instruccion textual ni si emplea flow matching u otra cabeza de accion.

El entrenamiento se realizo con LeRobot 0.6.2 sobre el dataset `seriintan/lang3a_frazier_blade`: 120 episodios, 48.454 frames a 30 FPS, con dos tareas anotadas en ingles ("Pick up the Frazier Suction Tube and place it in the blue basket." y "Pick up the surgical blade and place it in the blue basket."). La configuracion fue de 50.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-4 y semilla 1000, lo que equivale a unas 800.000 muestras procesadas. No se documenta en la informacion disponible si hubo RLHF, DPO ni ninguna etapa de refinamiento posterior; se trata de aprendizaje por imitacion supervisado sobre demostraciones de teleoperacion.

## Capacidades

- Generacion de acciones de robot de 6 dimensiones a partir de observaciones visuales y de estado, en bucle cerrado a 30 FPS.
- Manipulacion de objetos especificos: agarre y colocacion del tubo de succion Frazier y de la hoja de bisturi en una cesta azul.
- Seguimiento de instrucciones de tarea en lenguaje natural (una de las dos frases de tarea del dataset) para condicionar la politica.
- Percepcion multimodal: dos vistas simultaneas (muneca y lateral) a 480x640, lo que permite razonar sobre la posicion del efector y el contexto de la escena.
- Ejecucion en hardware de consumo, segun la descripcion del modelo base.
- No soporta tool calling, function calling, razonamiento multi-paso agentico, vision general, audio ni modos de "thinking": no es un modelo de proposito general.
- Capacidades multilingues: no disponibles; la condicion de tarea se entreno en ingles.

## Casos de uso

- Automatizacion de picking quirurgico en laboratorio: la policy ejecuta la secuencia de aproximacion, agarre y deposito del instrumental en una cesta, adecuada para bancos de prueba donde se repite el mismo par de tareas miles de veces.
- Investigacion en imitation learning: sirve como baseline reproducible de SmolVLA fine-tuneado (50.000 pasos, lr 1e-4, batch 16, semilla 1000) para comparar tecnicas de aumento de datos o de regularizacion sobre el mismo dataset.
- Prototipado rapido con LeRobot: al cargarse con `lerobot-rollout --policy.path=seriintan/smolvla_lang3a_frazier_blade`, permite validar en pocas lineas la cadena hardware-calibracion-inferencia antes de invertir en un modelo mayor.
- Docencia y formacion en robotica: ejemplo completo y pequeno (450 M de parametros, 1,2 GB) de flujo end-to-end: grabacion con `so_follower`, curado de dataset y despliegue, ejecutable en una GPU de gama media.
- Pruebas de robustez ante variaciones de escena: al estar entrenado con dos camaras y 120 episodios, es un caso util para medir degradacion ante cambios de iluminacion, posicion de objetos o distractores en el banco de trabajo.
- Base para fine-tuning en tareas adyacentes: partir de este checkpoint (en lugar del base) para entrenar variantes con utillaje similar, reutilizando la representacion visual aprendida de instrumental quirurgico.
- Despliegue en plataformas embebidas: por tamano, es candidato a ejecutarse en estaciones con Jetson Orin o GPUs de 8 GB, util para prototipos de laboratorio con espacio y presupuesto limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la nota "No evaluation results have been provided for this policy yet", sin tabla de trials, exitos ni tasa de exito. Tampoco se aportan metricas de perdida de entrenamiento, latencia de inferencia ni throughput. La busqueda web realizada no devolvio resultados tecnicos sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB solo para pesos en bf16/fp16 (450 M de parametros); con activaciones de dos imagenes de 480x640 y estado, es razonable esperar un pico de 2-3 GB. Cifra no publicada por el autor.
- GPU recomendadas: cualquier GPU NVIDIA con 8 GB o mas (RTX 3060/4060, RTX 4070, RTX 4090). Para despliegue en laboratorio, A100 o H100 no son necesarias; el cuello de botella sera la camara y el bus del robot, no la GPU.
- Cabe en GPU de consumo: si, incluidas RTX 3060 de 8 GB y plataformas Jetson con memoria unificada suficiente. No se documenta soporte en CPU en tiempo real a 30 FPS.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento, version 0.6.2 en el entrenamiento), sobre PyTorch con pesos safetensors. vLLM, TGI, llama.cpp y Ollama no aplican: no es un modelo de lenguaje autoregresivo de texto y no se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles. La frecuencia de control del dataset es 30 FPS, lo que fija un presupuesto teorico de 33 ms por paso de control, pero no se ha publicado la latencia real del policy.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / salida | Contexto multimodal | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| `seriintan/smolvla_lang3a_frazier_blade` | 450 M | 2 imagenes 480x640 + estado (6,) → accion (6,) | No aplica | Apache 2.0 | HuggingFace, libreria lerobot | Fine-tune especifico para instrumental quirurgico; sin evaluacion publicada |
| `lerobot/smolvla_base` | 450 M | Igual que el anterior (policy base) | No aplica | Apache 2.0 | HuggingFace | Modelo base del que parte este checkpoint; requiere fine-tuning por tarea |
| OpenVLA | ~7 B (dato publico de sus autores, no verificado aqui) | Imagen unica + instruccion → acciones | No aplica | Licencia publicada por sus autores | HuggingFace | VLA de mayor tamano; mayor coste de inferencia |
| pi0 (Physical Intelligence) | ~3 B (dato publico de sus autores, no verificado aqui) | Multiples vistas + instruccion → acciones | No aplica | Licencia publicada por sus autores | Publicacion y pesos segun sus autores | Orientado a control de robot de proposito general |
| ACT (policies de LeRobot) | Decenas de millones (dato no verificado aqui) | Estado + imagenes → acciones | No aplica | Apache 2.0 | HuggingFace / LeRobot | Alternativa no-VLA, sin condicionamiento por lenguaje, mas ligera |

Las cifras de modelos alternativos provienen de documentacion publica de sus autores y no han podido contrastarse en la informacion disponible para esta ficha; tomense como orden de magnitud.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor no reporta trials, tasa de exito ni condiciones de prueba, por lo que no hay evidencia publica de que la policy funcione de forma fiable en robot real.
- Especializacion estrecha: solo dos tareas (tubo Frazier y hoja de bisturi hacia la cesta azul), con posiciones de objeto y entorno presumiblemente similares a las de los 120 episodios de entrenamiento. La generalizacion a nuevos utillajes, contenedores o disposiciones no esta demostrada.
- Dependencia fuerte del montaje fisico: la policy asume robot `so_follower`, dos camaras concretas (`wrist`, `side`) con nombres y calibracion especificos, y observaciones de 480x640 a 30 FPS. Cambiar la camara, su encuadre o la calibracion invalida la politica.
- Dataset pequeno: 120 episodios y 48.454 frames son un volumen reducido, lo que incrementa el riesgo de sobreajuste al banco de trabajo y de derivas (drift) en ejecuciones largas.
- Sesgo de dominio: demostraciones de un unico operador y un unico entorno; no hay garantia de robustez ante cambios de iluminacion, fondo, presencia de personas o distintos instrumentales.
- Idioma: las condiciones de tarea estan en ingles; no hay soporte multilingue documentado.
- Sin cuantizaciones publicadas: no existen pesos GGUF ni int8/int4 oficiales, lo que limita el despliegue en CPU o en hardware muy restringido.
- Caveat de seguridad en dominio quirurgico: el modelo manipula instrumental cortante y dispositivos de succion en un contexto de laboratorio. No es un dispositivo medico, no esta validado clinicamente y no debe emplearse en procedimientos reales sobre pacientes.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero la licencia no cubre las patentes ni las responsabilidades derivadas del uso fisico del modelo.
- Fechas del repositorio: creado y actualizado el 2026-10-18, con 0 descargas y 0 likes en el momento de la consulta; no hay senales de mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seriintan/smolvla_lang3a_frazier_blade
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/seriintan/lang3a_frazier_blade
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=seriintan/lang3a_frazier_blade
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada para esta ficha no devolvio resultados relevantes sobre el modelo; los unicos enlaces utiles son los de la model card y la documentacion de LeRobot.
