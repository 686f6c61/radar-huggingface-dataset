# fatdove/so101-cylinder-cube-bowl_GR00T17

## Resumen

`fatdove/so101-cylinder-cube-bowl_GR00T17` es un checkpoint de política robótica (no un modelo de lenguaje de propósito general) entrenado con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA. Se trata de un fine-tune concreto para un brazo `so_follower` (SO-101) que debe resolver una única tarea de manipulación: «Put the pink cylinder and the gray cube in the pink bowl». El modelo consume dos flujos de cámara (frontal y de muñeca) más el estado propioceptivo de 6 grados de libertad, y produce una acción de 6 dimensiones.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo real y reproducible de cómo se publica hoy un policy de visión-lenguaje-acción (VLA) en el Hub: dataset asociado, configuración de entrenamiento completa y comandos de despliegue. Por otro, permite examinar el estado del arte de los modelos fundacionales robóticos *cross-embodiment*: GR00T N1.7 combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un *action transformer* de *flow matching* que predice acciones condicionadas por visión, lenguaje y propiocepción.

El checkpoint tiene 3.144.016.000 parámetros y ocupa 12,6 GB en el repositorio, lo que es coherente con pesos en precisión completa. Está publicado bajo licencia Apache 2.0 y no incluye resultados de evaluación en robots reales, por lo que debe tratarse como un artefacto de investigación y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (NVIDIA): backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL + *action transformer* con *flow matching* |
| Parametros totales | 3.144.016.000 (≈3,14 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo no expone ventana de contexto textual; consume una cadena de tarea, dos imágenes y un vector de estado) |
| Tipos de cuantizacion | no disponible (solo se publican pesos sin cuantizar) |
| Idiomas soportados | no disponible (la tarea se especifica mediante una cadena de texto en inglés; el modelo card no declara cobertura multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 12,6 GB) |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `front`, `wrist` (640×480, 30 FPS) |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Libreria | lerobot |
| Version de LeRobot | 0.6.1 |
| Descargas / likes | 13 / 0 |
| Fecha de publicacion | 2026-09-26 |

## Arquitectura y entrenamiento

El modelo sigue la receta de GR00T N1.7 de NVIDIA: un backbone visión-lenguaje (Cosmos-Reason2 / Qwen3-VL) que interpreta las imágenes y la instrucción en lenguaje natural, acoplado a un *action transformer* entrenado con *flow matching* que genera las acciones motrices condicionadas por la representación multimodal y por el estado propioceptivo del robot. Este diseño es *cross-embodiment*: el mismo tipo de arquitectura se ha planteado para transferirse entre morfologías robóticas distintas, y aquí se ha especializado en un brazo SO-101 mediante aprendizaje por imitación.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `fatdove/so101-cylinder-cube-bowl`, compuesto por 50 episodios y 44.950 fotogramas grabados a 30 FPS, todos ellos correspondientes a una única tarea. La configuración declarada es de 30.000 pasos, tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 42. No se documenta ningún uso de RLHF, DPO ni otra fase de alineación posterior: es aprendizaje por imitación puro a partir de demostraciones. Tampoco se detalla la composición del dataset más allá del número de episodios y fotogramas, ni si hubo aumento de datos o mezcla con datos de otros robots.

## Capacidades

- Generación de acciones de manipulación de 6 grados de libertad para un brazo SO-101 (`so_follower`), condicionadas por dos vistas de cámara y el estado de las articulaciones.
- Ejecución de una tarea de *pick-and-place* concreta: colocar el cilindro rosa y el cubo gris dentro del cuenco rosa.
- Interpretación de instrucciones en lenguaje natural mediante el backbone Qwen3-VL, aunque el checkpoint está especializado en una única frase de tarea.
- Fusión de visión y propiocepción: procesa simultáneamente cámara frontal y cámara de muñeca (640×480) junto con el vector de estado de 6 dimensiones.
- Control a 30 FPS, alineado con la frecuencia de grabación del dataset de entrenamiento.
- Reentrenamiento y ajuste fino mediante `lerobot-train` con `--policy.type=groot`.
- Despliegue directo sobre hardware real mediante `lerobot-rollout`.
- No se declaran capacidades de *tool calling*, razonamiento multi-paso, diálogo, visión generalista, audio ni modo de razonamiento explícito: el modelo es un policy de control, no un asistente conversacional.

## Casos de uso

- Replicación del experimento en un SO-101 propio: el caso de uso más directo es desplegar el checkpoint con `lerobot-rollout` sobre un brazo SO-101 calibrado y comprobar la tasa de éxito en la tarea de colocar el cilindro y el cubo en el cuenco. Sirve como referencia de funcionamiento del *stack* GR00T N1.7 en LeRobot.
- Punto de partida para ajuste fino de nuevas tareas de *pick-and-place*: en lugar de entrenar desde cero, se puede partir de estos pesos y reentrenar con un dataset propio de pocas decenas de episodios, aprovechando que el backbone visión-lenguaje ya está adaptado al dominio de brazos SO-101.
- Banco de pruebas de aprendizaje por imitación: la configuración declarada (30.000 pasos, lote 64, AdamW, lr 1e-4, semilla 42, 50 episodios a 30 FPS) permite reproducir el experimento y usarlo como línea base en cursos o laboratorios de robótica.
- Evaluación comparativa de backbones VLA: al ser un checkpoint GR00T N1.7, permite medir frente a alternativas como SmolVLA o π0 en el mismo montaje físico y con el mismo dataset, aislando el efecto de la arquitectura.
- Estudio de robustez y *domain shift*: al estar entrenado sobre un único entorno, es un sujeto adecuado para experimentos controlados de variación de iluminación, posición inicial de los objetos, presencia de distractores o cambio de instancia del mismo modelo de robot.
- Automatización de clasificación de piezas pequeñas en un banco de laboratorio: el mismo esquema entrada-salida (dos cámaras más estado de 6 articulaciones) se traslada a tareas de ordenar componentes en bandejas o separar piezas por color si se reentrena con el dataset correspondiente.
- Medición de latencia y *throughput* de un policy VLA de 3,14 B en hardware de consumo: útil para dimensionar si un *setup* con una sola GPU puede ejecutar control a 30 FPS con dos cámaras activas.
- Generación de datos sintéticos de evaluación: el policy puede usarse como agente de referencia para comparar contra un operador humano o contra un controlador clásico en la misma celda robotizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la plantilla vacía y la indicación explícita de que «no evaluation results have been provided for this policy yet». No hay datos de tasa de éxito, número de ensayos, MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 12,6 GB si se cargan los pesos en FP32 (coincide con el tamaño del repositorio); aproximadamente 6,3 GB en BF16/FP16 y alrededor de 3,2 GB en INT8 si se aplica cuantización *post-training* por cuenta propia. Hay que sumar el coste de procesar dos imágenes de 640×480 por paso de control.
- GPU recomendadas: para entrenamiento, A100, H100 o L40S por VRAM y ancho de banda; para inferencia, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente incluso en FP32.
- Cabe en GPU de consumo: sí. Una RTX 4080/4090 o superior en BF16 deja margen amplio; en FP32 encaja ajustadamente en tarjetas de 16 GB y con holgura en las de 24 GB.
- Opciones de despliegue: el camino soportado es LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para entrenamiento), con PyTorch y CUDA. El repositorio de referencia de la arquitectura es NVIDIA Isaac-GR00T. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un policy de control robótico.
- Latencia y throughput: no disponibles. El modelo no publica mediciones de tiempo de inferencia; el único dato relacionado es la frecuencia de operación esperada de 30 FPS, heredada del dataset de entrenamiento. Se necesita una `duration` explícita en `lerobot-rollout`; si se omite, el policy se ejecuta indefinidamente.

## Comparativa con modelos similares

Los datos de esta tabla corresponden a modelos públicos del ecosistema VLA y no proceden de la informacion proporcionada en esta ficha; conviene verificarlos en sus repositorios antes de citarlos.

| Modelo | Parametros | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|
| `fatdove/so101-cylinder-cube-bowl_GR00T17` | ≈3,14 B | Apache 2.0 | Fine-tune de GR00T N1.7 para una tarea en SO-101 | HuggingFace Hub, via LeRobot |
| GR00T N1.7 (NVIDIA) | no disponible en la informacion proporcionada | Apache 2.0 (segun la model card del checkpoint base) | Modelo fundacional *cross-embodiment* con backbone Cosmos-Reason2/Qwen3-VL | GitHub Isaac-GR00T |
| SmolVLA | ≈0,45 B | Apache 2.0 | VLA compacto orientado a hardware de consumo | HuggingFace Hub, via LeRobot |
| π0 (Physical Intelligence) | ≈3,3 B | no disponible | *Flow matching* sobre backbone visión-lenguaje | Repositorio openpi |
| OpenVLA-7B | ≈7 B | Apache 2.0 | VLA basado en Llama-2 con adaptadores visuales | HuggingFace Hub |

La diferencia clave frente a las alternativas genéricas es que este checkpoint no es un modelo fundacional reutilizable sin más, sino un fine-tune de tarea única: su utilidad comparativa está en la evaluación empírica en el mismo robot, no en la cobertura de tareas.

## Limitaciones y advertencias

- Especialización extrema: el checkpoint está entrenado para una sola tarea («Put the pink cylinder and the gray cube in the pink bowl»). Fuera de esa instrucción y de ese montaje, el comportamiento no está caracterizado.
- Sin resultados de evaluación: no hay tasa de éxito publicada en robot real, ni número de ensayos, ni condiciones de prueba. Cualquier afirmación sobre su fiabilidad sería especulativa.
- Dataset muy reducido y de un solo operador: 50 episodios y 44.950 fotogramas implican un riesgo alto de sobreajuste al entorno concreto (iluminación, fondo, posiciones iniciales, estilo de demostración).
- Sesgos de dominio: al provenir de un único montaje físico, es probable que el modelo degrade ante cambios de iluminación, fondo, cámara, posición de los objetos o una instancia distinta del mismo brazo.
- Dependencia del hardware: requiere un `so_follower` calibrado y cámaras cuyos nombres e índices coincidan con las claves de observación del entrenamiento (`front`, `wrist`), a 640×480 y 30 FPS.
- Idiomas no declarados: la model card no especifica cobertura lingüística. La instrucción de tarea está en inglés y no hay evidencia de que el condicionamiento funcione correctamente en otros idiomas.
- Alucinación y fallos de control: en un policy de acciones el equivalente al fallo generativo es una acción incorrecta o insegura. No hay mecanismos de seguridad declarados; en un robot real es imprescindible limitar velocidades, fuerzas y paradas de emergencia.
- Riesgo de ejecución indefinida: el comando de despliegue documentado no graba episodios con `--strategy.type=base`, y si se omite `--duration` el policy se ejecuta sin límite temporal.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de licencia y el archivo de cambios. La licencia cubre los pesos de este fine-tune; el uso del modelo base GR00T N1.7 y de la librería LeRobot debe verificarse por separado.
- Sin cuantizaciones publicadas: no hay variantes GGUF, AWQ, GPTQ ni INT8 oficiales, por lo que cualquier despliegue de bajo consumo requiere conversión propia y validación posterior.
- Madurez: con 13 descargas y 0 *likes*, no hay validación comunitaria de que el checkpoint funcione correctamente. Debe tratarse como material experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fatdove/so101-cylinder-cube-bowl_GR00T17
- Dataset de entrenamiento: https://huggingface.co/datasets/fatdove/so101-cylinder-cube-bowl
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fatdove/so101-cylinder-cube-bowl
- Repositorio NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Guia de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de un policy: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces recuperados correspondian a servicios de correo y no guardan relacion con la ficha.
