# lichtphyz/diffusion_v3_desktop

## Resumen

`lichtphyz/diffusion_v3_desktop` es una política de robótica basada en Diffusion Policy, entrenada con LeRobot para un brazo robótico SO-101 de 6 articulaciones (5 más pinza). El modelo resuelve una tarea concreta de manipulación: coger un bloque de madera y depositarlo en una papelera, usando dos cámaras (frontal de área de trabajo y de muñeca) a 640×480 y 30 fps. Lo desarrolla el usuario independiente Lichtphyz y se publica bajo licencia Apache 2.0.

La relevancia del modelo es doble. Por un lado, es un ejemplo reproducible de extremo a extremo: incluye el dataset de entrenamiento (125 episodios teleoperados, 55 677 fotogramas), los rollouts de evaluación en robot real y el código con los comandos de entrenamiento. Por otro, permite comparar directamente tres familias de políticas sobre los mismos datos y el mismo hardware: Diffusion Policy (este modelo, 8/10), ACT (9/10) y SmolVLA (7/10), lo que lo convierte en una referencia útil para quien esté evaluando qué arquitectura usar en manipulación con pocos datos.

Arquitectónicamente no es un modelo de lenguaje: es una política visomotora de difusión con backbone visual ResNet-18 y 277,8 millones de parámetros totales, que genera trayectorias de acción de 6 dimensiones condicionadas por el estado articular y las dos imágenes. Su interés práctico está en el coste de entrenamiento (unas 11 h 20 min en una RTX 4080) y en la latencia de inferencia con DDIM a 5 pasos, suficiente para evitar pausas visibles en el robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DDPM para entrenamiento, DDIM para inferencia) con backbone visual ResNet-18 |
| Parametros totales | 277 839 366 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 2 pasos, horizonte de predicción de 64, 32 pasos de acción |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; recibe una instrucción de tarea en texto: "Put the block in the bin.") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,1 GB) |
| Librería | LeRobot 0.6.2 |
| Robot objetivo | SO-101 follower (`so_follower`), 6 articulaciones, servos STS3215 12 V |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Resolución de proceso | redimensionado a 320×240, recorte aleatorio 304×228 (ratio 0,95) |
| Descargas en HuggingFace | 43 |

## Arquitectura y entrenamiento

El modelo sigue la formulación estándar de Diffusion Policy (paper arXiv 2303.04137): en lugar de predecir acciones directamente, aprende a generar secuencias de acción mediante un proceso de difusión condicionado por las observaciones. El backbone visual es una ResNet-18 preentrenada en ImageNet con BatchNorm, que procesa las dos cámaras; el estado articular de 6 dimensiones se concatena como condición. La configuración usa 2 pasos de observación, un horizonte de predicción de 64 pasos y 32 pasos de acción ejecutables, con un scheduler DDPM de 100 timesteps durante el entrenamiento.

El entrenamiento se realizó durante 60 000 pasos (aproximadamente 11 h 20 min en una única RTX 4080) con batch de 32, optimizador Adam, learning rate 1e-4 y schedule coseno, semilla 1000. Se aplicó aumentación de imagen (brillo, contraste, saturación, tono, nitidez y una pequeña transformación afín). El dataset `lichtphyz/so101_block_to_bin_v3` contiene 125 episodios y 55 677 fotogramas a 30 fps, compuestos por 100 demostraciones de bloque-a-papelera (bloque alineado a rejilla, dos longitudes de bloque, aproximación en dos fases), 15 episodios "idle" (mesa vacía o bloque ya en la papelera, el brazo permanece quieto) y 10 episodios de recuperación (fallo de agarre, reagarre y depósito). No se menciona RLHF ni DPO, algo esperable en una política de imitación.

La innovación práctica relevante es el uso de DDIM con 5 pasos de denoising en inferencia, que reduce el coste de planificación de acciones lo suficiente para que el robot no muestre pausas visibles. El modelo solo funciona con una colocación de cámaras y un espacio de trabajo próximos a los de los datos de entrenamiento.

## Capacidades

- Manipulación visomotora de una sola tarea: coger un bloque de madera y dejarlo en una papelera, con una instrucción de tarea fija ("Put the block in the bin.").
- Percepción con dos cámaras simultáneas (frontal de área de trabajo y de muñeca), ambas a 640×480 y 30 fps.
- Generación de trayectorias de acción de 6 dimensiones (5 articulaciones más pinza) con horizonte de 32 pasos ejecutables.
- Recuperación parcial de fallos: el modelo puede rehacer un agarre fallido y volver a intentarlo, aunque con éxito irregular.
- Control de parada: los episodios "idle" del entrenamiento le enseñan a quedarse quieto cuando no hay bloque que manipular o ya está en la papelera.
- No soporta tool calling, function calling, agentes multi-paso, visión general, audio ni razonamiento simbólico: es una política de robot, no un modelo generativo de propósito general.
- No tiene capacidades multilingües; la tarea se especifica con una cadena de texto fija.

## Casos de uso

- **Automatización de pick-and-place en laboratorio o línea de montaje ligera**: el modelo ejecuta el ciclo completo de coger un bloque y depositarlo en un contenedor con un 80 % de éxito en 10 ensayos reales, suficiente para tareas de clasificación de piezas pequeñas donde el fallo se puede reintentar.
- **Base para fine-tuning en tareas de manipulación similares**: al estar entrenado con LeRobot 0.6.2 y publicar tanto el dataset como los comandos, se puede reentrenar con 100-200 episodios nuevos en una sola RTX 4080 en torno a 11 horas, lo que lo hace viable para prototipos académicos o de I+D con presupuesto ajustado.
- **Comparativa de arquitecturas de políticas**: junto con `act_v3_aug_desktop` (9/10) y `smolvla_v3_desktop` (7/10) sobre los mismos datos, sirve para decidir qué familia usar en un proyecto real antes de invertir en más recolección de datos.
- **Docencia y formación en robótica de imitación**: el repositorio incluye dataset, rollouts de evaluación con ambas cámaras, estados articulares y acciones, lo que permite reproducir el pipeline completo (teleoperación, entrenamiento, rollout) sin infraestructura propietaria.
- **Investigación en recuperación de fallos**: los 10 episodios de recuperación del dataset y los fallos documentados en evaluación (reagarre tras fallo de agarre, choque con el borde de la papelera) ofrecen material concreto para estudiar estrategias de reagarre y robustez.
- **Prototipado de estaciones de trabajo con SO-101**: el modelo cabe en una GPU de consumo y se despliega con `lerobot-rollout`, lo que permite montar una celda de demostración con un brazo SO-101, dos cámaras USB y un PC con RTX 4080 sin servidores dedicados.
- **Evaluación de robustez ante variaciones de objeto**: el propio autor documenta que los bloques cortos son más difíciles para esta política (el ACT acierta 4/4 en una prueba extra no grabada), lo que lo convierte en un caso de estudio útil sobre sensibilidad al tamaño del objeto.

## Benchmarks y rendimiento

Evaluación en robot real con `lerobot-rollout --strategy.type=episodic`, 10 episodios de hasta 30 s, bloque recolocado a mano entre episodios, inferencia con DDIM y 5 pasos de denoising:

| Tarea | Ensayos | Éxitos | Tasa de éxito |
|---|---|---|---|
| Put the block in the bin | 10 | 8 | 80 % |

Comparativa con los modelos hermanos entrenados sobre los mismos datos, según la model card:

| Modelo | Arquitectura | Éxitos en su evaluación de 10 episodios |
|---|---|---|
| `lichtphyz/act_v3_aug_desktop` | ACT | 9/10 (además, 4/4 con bloques cortos en una prueba extra no grabada) |
| `lichtphyz/diffusion_v3_desktop` | Diffusion Policy | 8/10 |
| `lichtphyz/smolvla_v3_desktop` | SmolVLA | 7/10 |

Detalles de los fallos: uno de los dos fallos fue una recuperación parcial (tras un agarre fallido el modelo reagarró el bloque, pero chocó con el borde de la papelera y lo dejó caer). El modelo muestra dificultades con el bloque corto, una de las dos longitudes presentes en los datos de entrenamiento. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- **Entrenamiento**: una única RTX 4080, 60 000 pasos en aproximadamente 11 h 20 min con batch de 32.
- **VRAM estimada para inferencia**: no disponible de forma explícita en la información proporcionada; con 277,8 M de parámetros y dos flujos de imagen a 640×480, el modelo es ligero y cabe con holgura en GPUs de consumo, aunque no se publica la cifra exacta.
- **GPU recomendadas**: RTX 4080 (la usada para entrenar), y por tamaño cualquier GPU consumer con al menos 8-12 GB de VRAM; A100/H100 no son necesarias para este modelo.
- **Cabe en GPU consumer**: sí, el entrenamiento se realizó en una RTX 4080.
- **Opciones de despliegue**: `lerobot-rollout` con `--policy.path=lichtphyz/diffusion_v3_desktop`, `--policy.noise_scheduler_type=DDIM` y `--policy.num_inference_steps=5`. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política de robot.
- **Latencia y throughput**: el autor indica que DDIM con 5 pasos de denoising hace la planificación de acciones lo bastante rápida para evitar pausas visibles, pero no publica cifras de latencia ni de frecuencia de control efectiva.
- **Hardware del robot**: SO-101 follower con 6 articulaciones y servos STS3215 12 V, dos cámaras OpenCV a 640×480, 30 fps, fourcc MJPG.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / horizonte | Éxito en robot real | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `lichtphyz/diffusion_v3_desktop` | Diffusion Policy + ResNet-18 | 277,8 M | 2 pasos de observación, horizonte 64, 32 acciones | 8/10 | Apache 2.0 | HuggingFace, LeRobot |
| `lichtphyz/act_v3_aug_desktop` | ACT | no disponible | no disponible | 9/10 (4/4 con bloque corto en prueba extra) | no disponible en la información proporcionada | HuggingFace |
| `lichtphyz/smolvla_v3_desktop` | SmolVLA | no disponible | no disponible | 7/10 | no disponible en la información proporcionada | HuggingFace |

Los tres modelos se entrenaron sobre el mismo dataset (`lichtphyz/so101_block_to_bin_v3`) y comparten robot y configuración de cámaras, por lo que la comparación es directa en éxito de tarea. No se dispone de datos de parámetros, contexto ni latencia de los modelos hermanos en la información proporcionada.

## Limitaciones y advertencias

- **Sobreajuste al entorno de entrenamiento**: el modelo solo funciona con una colocación de cámaras y un espacio de trabajo próximos a los de los datos; cambiar la posición de las cámaras o la mesa invalida la política.
- **Una sola tarea**: la instrucción es fija ("Put the block in the bin.") y no hay evidencia de generalización a otros objetos, contenedores o instrucciones.
- **Debilidad con bloques cortos**: el autor documenta dificultades con una de las dos longitudes de bloque del dataset; el ACT hermano rinde mejor en ese caso.
- **Fallos de precisión en el depósito**: uno de los fallos de evaluación fue un choque con el borde de la papelera tras un reagarre correcto, lo que indica falta de robustez en la fase final.
- **Riesgo de alucinación**: no aplica en el sentido de los modelos de lenguaje, pero sí existe riesgo de acciones sin sentido fuera de distribución (posiciones iniciales no vistas, iluminación distinta, oclusión de cámaras).
- **Sesgos de los datos**: 100 de los 125 episodios son demostraciones "limpias" con bloque alineado a rejilla; solo 10 son de recuperación, lo que limita la diversidad de fallos aprendidos.
- **Licencia**: Apache 2.0 permite uso comercial, pero la responsabilidad de seguridad en un robot real recae en el integrador; no hay garantías ni evaluación de seguridad funcional.
- **Sin cuantizaciones publicadas**: no hay variantes GGUF ni cuantizadas, y no se documenta el rendimiento en GPUs de gama baja.
- **Fecha de creación futura**: la model card indica creación el 2026-10-19 y actualización el 2026-11-03, fechas posteriores a la mayoría de referencias; conviene verificar la vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lichtphyz/diffusion_v3_desktop
- Dataset de entrenamiento: https://huggingface.co/datasets/lichtphyz/so101_block_to_bin_v3
- Rollouts de evaluación: https://huggingface.co/datasets/lichtphyz/rollout_diffusion_v3_desktop
- Visualizador del dataset de entrenamiento: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lichtphyz/so101_block_to_bin_v3
- Visualizador de rollouts: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lichtphyz/rollout_diffusion_v3_desktop
- Colección SO-101 block-to-bin (ACT vs Diffusion Policy): https://huggingface.co/collections/lichtphyz/so-101-block-to-bin-act-vs-diffusion-policy-6ad6ca5c5e111b426bb1f8a6
- Código, comandos de entrenamiento y lecciones aprendidas: https://github.com/Lichtphyz/so101-block-to-bin
- Modelo hermano ACT: https://huggingface.co/lichtphyz/act_v3_aug_desktop
- Modelo hermano SmolVLA: https://huggingface.co/lichtphyz/smolvla_v3_desktop
- Rollouts del modelo ACT: https://huggingface.co/datasets/lichtphyz/rollout_act_v3_aug_desktop
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv 2303.04137)
- LeRobot: https://github.com/huggingface/lerobot
