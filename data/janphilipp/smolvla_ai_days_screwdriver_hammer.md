# JanPhilipp/smolvla_ai_days_screwdriver_hammer

## Resumen

`JanPhilipp/smolvla_ai_days_screwdriver_hammer` es un ajuste fino del modelo vision-language-action (VLA) SmolVLA, desarrollado por el usuario JanPhilipp y publicado en Hugging Face a traves de la libreria LeRobot. Se trata de una politica de robotica de imitacion (imitation learning) entrenada para dos tareas concretas de manipulacion: coger un destornillador de la zona verde y dejarlo en la zona roja, y hacer lo mismo con un martillo. El modelo parte del checkpoint base `lerobot/smolvla_base` y se ha especializado con un dataset propio de 510 episodios y 220.511 fotogramas grabados a 30 FPS.

Con 450.046.176 parametros (aproximadamente 450 M) y un repositorio de solo 0,9 GB, es un modelo compacto pensado para ejecutarse en hardware de consumo, en la linea de lo que promete la familia SmolVLA descrita en el articulo arXiv:2506.01844. No es un modelo de lenguaje: consume observaciones multimodales (estado del robot e imagenes de camara) y produce directamente las acciones del robot, por lo que su evaluacion se hace sobre tasa de exito fisica y no sobre benchmarks de texto.

Su relevancia es practica: sirve como ejemplo reproducible de fine-tuning de una politica VLA sobre un robot de bajo coste tipo `so_follower`, y como punto de partida para quien quiera replicar el flujo de LeRobot en sus propias tareas. Hay que tener en cuenta que el repositorio no incluye resultados de evaluacion y que el modelo esta fuertemente especializado en dos tareas, dos objetos y un montaje concreto, por lo que su generalizacion fuera de ese entorno es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, heredada de SmolVLA (backbone vision-language + experto de acciones); detalles internos no disponibles en la model card |
| Parametros totales | 450.046.176 (~450 M), segun los pesos safetensors del repositorio |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo no es textual; consume imagenes de 3x256x256 y un vector de estado de dimension 6) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible en la model card; las cadenas de tarea usadas en el entrenamiento estan en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`; tamano del repositorio 0,9 GB) |

Datos adicionales de la ficha: robot `so_follower`, camaras declaradas como `camera1` y `camera2` (la tabla de entradas lista tambien `camera3`), dataset `JanPhilipp/ai_days_screwdriver_hammer_merged`, 510 episodios, 220.511 fotogramas, 30 FPS, y entrenamiento de 30.000 pasos con batch 16, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.6.2.

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de describir SmolVLA como un modelo vision-language-action compacto y eficiente, capaz de rendimiento competitivo con menor coste computacional y desplegable en hardware de consumo. El modelo se ha obtenido por ajuste fino supervisado (imitation learning) desde `lerobot/smolvla_base`, con el pipeline `lerobot-train` sobre el dataset propio del autor. No se documenta en el repositorio si hubo etapas de RLHF, DPO u optimizacion posterior; para un modelo de robotica lo habitual en LeRobot es aprendizaje por imitacion puro a partir de demostraciones, pero este dato no esta confirmado en la informacion disponible.

El entrenamiento se ejecuto durante 30.000 pasos con batch size 16, AdamW y learning rate 0,0001, sobre 510 episodios y 220.511 fotogramas a 30 FPS que cubren dos tareas de pick-and-place. No se publican ni el numero de tokens de imagen procesados, ni la composicion exacta del dataset (proporcion por tarea, variabilidad de posiciones, condiciones de iluminacion) ni detalles de aumentos de datos. Cualquier afirmacion sobre la innovacion tecnica del backbone (por ejemplo, mecanismos de atencion o decodificacion) corresponde al articulo de SmolVLA referenciado y no a este ajuste fino concreto.

## Capacidades

- Generacion de acciones de manipulacion: a partir de dos o tres vistas de camara y un vector de estado de dimension 6, produce una accion de dimension 6 para un brazo `so_follower`.
- Ejecucion de dos tareas concretas de pick-and-place: "Grab the screwdriver from the green area and place it on the red area" y "Grab the hammer from the green area and place it on the red area".
- Control visual continuo: procesa imagenes de 3x256x256 a una cadencia coherente con los 30 FPS del dataset de entrenamiento.
- Ejecucion de politicas multi-paso: la accion se emite de forma iterativa durante el episodio, sin necesidad de planificacion externa.
- Integracion nativa con LeRobot: se ejecuta con `lerobot-rollout` y se entrena con `lerobot-train`.
- Razonamiento simbolico o linguistico general: no disponible; no hay evidencia de comprension de instrucciones arbitrarias mas alla de las cadenas de tarea usadas en el entrenamiento.
- Tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Vision general (descripcion de imagenes, VQA): no disponible; la vision esta integrada como entrada del controlador, no como capacidad de salida textual.
- Capacidades multilingues, modo "thinking", audio o generacion de texto: no disponibles.

## Casos de uso

- Automatizacion de pick-and-place en un banco de montaje: el modelo puede mover un destornillador o un martillo entre una zona verde y una zona roja de forma autonoma, siempre que la celula reproduzca la geometria, iluminacion y tipo de objeto vistos en el dataset.
- Docencia y talleres de robotica: al estar ajustado sobre un SO-100/SO-101 de bajo coste y ocupar menos de 1 GB en disco, sirve para demostrar en aula el ciclo completo de grabacion de datos, entrenamiento y despliegue con LeRobot.
- Punto de partida para nuevos ajustes finos: un equipo que quiera una politica para sus propios objetos puede reutilizar este checkpoint como inicializacion en lugar del base, aprovechando que ya ha visto escenas con brazos `so_follower`, camaras y objetos sobre superficies delimitadas por colores.
- Evaluacion comparativa de politicas de imitacion: permite medir tasa de exito de una politica VLA de 450 M frente a alternativas como ACT o Diffusion Policy en un montaje identico y controlado.
- Monitorizacion de robustez frente a variaciones de entorno: con el mismo checkpoint se pueden ejecutar pruebas cambiando iluminacion, posicion inicial de los objetos o añadiendo distracciones, y registrar la degradacion de la tasa de exito.
- Demostraciones reproducibles en eventos y ferias: al ejecutarse en hardware de consumo y con un comando de rollout sencillo, es adecuado para demos de pocos minutos en las que se repite la misma tarea ante publico.
- Generacion de trayectorias de referencia: las acciones producidas pueden registrarse y analizarse para extraer patrones de agarre y colocacion que alimenten el diseño de controladores clasicos.
- Validacion de infraestructura de inferencia: sirve como carga ligera para comprobar que un equipo con GPU modesta puede ejecutar una politica VLA en tiempo real antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la linea "_No evaluation results have been provided for this policy yet_", por lo que no hay tasa de exito, numero de ensayos ni condiciones de evaluacion para las dos tareas entrenadas. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 450 M de parametros, unos 0,9 GB en bf16/fp16 (coincide con el tamano del repositorio) y unos 1,8 GB en fp32, mas el coste de activaciones de tres imagenes de 256x256 y del codificador visual. En la practica, un presupuesto de 2 a 4 GB de VRAM es suficiente; es una estimacion derivada del recuento de parametros, no una medicion publicada.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (RTX 3050/3060/4060, RTX 4090, A100, H100). Para este tamano, una GPU de gama alta no aporta ventaja significativa frente a una de gama media.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo de los ultimos anos y tambien en equipos con GPU integrada si el backend lo permite; el cuello de botella real sera la captura de camaras y el control del robot, no la memoria.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=JanPhilipp/smolvla_ai_days_screwdriver_hammer` sobre PyTorch (CUDA o CPU), dentro del ecosistema LeRobot 0.6.2 o superior. No hay soporte documentado para vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. El dataset de entrenamiento se grabo a 30 FPS, pero no se publican mediciones de frecuencia de inferencia alcanzada en robot real.
- Almacenamiento: menos de 1 GB para los pesos, mas el espacio del dataset si se quiere reentrenar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `JanPhilipp/smolvla_ai_days_screwdriver_hammer` | 450.046.176 | 3 imagenes 3x256x256 + estado (6,) | Apache 2.0 | Hugging Face, libreria `lerobot` | Ajuste fino para dos tareas concretas con `so_follower`; sin resultados de evaluacion publicados |
| `lerobot/smolvla_base` | 450 M (misma familia, dato no verificado en esta busqueda) | no disponible | Apache 2.0 | Hugging Face, libreria `lerobot` | Modelo base generalista del que deriva este ajuste; la model card no aporta tabla comparativa |
| Otras politicas del ecosistema LeRobot (ACT, Diffusion Policy) | no disponible | no disponible | no disponible | Repositorios de LeRobot | Alternativas tipicas para tareas de manipulacion con el mismo robot; no hay datos comparativos en la informacion disponible |

No se dispone de cifras verificadas de parametros, contexto o rendimiento de las alternativas dentro de la informacion proporcionada, por lo que la comparativa se limita a la relacion de derivacion con el modelo base y a la existencia de otras politicas en LeRobot.

## Limitaciones y advertencias

- Especializacion extrema: solo se ha entrenado para dos tareas, con dos objetos concretos y zonas delimitadas por colores (verde y roja). Cualquier cambio de objeto, posicion o consigna queda fuera de su distribucion de entrenamiento.
- Sin evaluacion publicada: no hay tasa de exito, numero de ensayos ni condiciones de prueba, por lo que no se puede afirmar nada sobre su fiabilidad real en el robot.
- Riesgo de fallo fisico: en robotica, un fallo de la politica no es una alucinacion textual, sino una accion incorrecta que puede dañar el objeto, el brazo o el entorno. Se recomienda espacio de trabajo despejado, limites de par y supervision humana.
- Dependencia del montaje exacto: la politica asume la misma configuracion de camaras, alturas y fondo que el dataset. Cambios de iluminacion, fondo o posicion de camara degradan el comportamiento.
- Inconsistencia en la definicion de entradas: la seccion "Model Details" menciona `camera1` y `camera2`, mientras que la tabla de entradas lista `camera1`, `camera2` y `camera3`. Hay que verificar que los nombres de camara del comando de rollout coincidan exactamente con las claves de observacion del entrenamiento.
- Dependencia de hardware concreto: entrenado para `so_follower`; no es portable directamente a otros brazos sin reentrenamiento o recalibracion.
- Idiomas: las cadenas de tarea estan en ingles y el modelo no tiene capacidad linguistica general; no se debe esperar comprension de instrucciones nuevas en castellano u otros idiomas.
- Adopcion nula hasta la fecha: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni reportes de terceros que permitan validar su comportamiento.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero la licencia cubre el software y los pesos, no el robot ni los datos de terceros; conviene revisar la licencia del dataset `JanPhilipp/ai_days_screwdriver_hammer_merged` antes de reutilizarlo.
- Versionado: el modelo se subio con LeRobot 0.6.2 y puede requerir esa version o superior para cargarse correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JanPhilipp/smolvla_ai_days_screwdriver_hammer
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/JanPhilipp/ai_days_screwdriver_hammer_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=JanPhilipp/ai_days_screwdriver_hammer_merged
- Articulo de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los enlaces anteriores proceden de la informacion de Hugging Face y de la model card.
