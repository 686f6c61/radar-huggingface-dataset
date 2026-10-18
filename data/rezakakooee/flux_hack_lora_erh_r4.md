# Rezakakooee/flux_hack_lora_erh_r4

## Resumen

`Rezakakooee/flux_hack_lora_erh_r4` es un adaptador LoRA para el modelo de robótica `black-forest-labs/flux-3-action-so101` (FLUX 3 Action), publicado por el usuario Rezakakooee en el contexto del hackathon ERH Physical AI de octubre de 2026. No es un modelo de lenguaje ni un generador de imágenes: es una política visuomotora entrenada por imitación que traduce observaciones de cámara y una instrucción en lenguaje natural en comandos articulares para un brazo robótico SO-101.

El adaptador se ha entrenado sobre 110 episodios de teleoperación que cubren dos tareas concretas: apilar vasos de papel («stack the paper cups on top of each other», 100 episodios) y colocar barritas Snickers en un plato («Put all the Snickers bars on the plate», 10 episodios). Se distribuye con la librería LeRobot y incluye un plugin de robot (`lerobot_robot_flux_units`) y un fichero `joint_units.json` con los offsets articulares de la calibración del brazo empleado en la grabación.

Su relevancia es acotada pero práctica: demuestra el flujo completo de especialización de una política VLA (vision-language-action) mediante LoRA de rango 32 sobre una única A100, con resultados offline medidos frente al modelo base zero-shot (error medio angular de 42,9° frente a 93,4° en la tarea de vasos). El repositorio ocupa 0,5 GB y la licencia FLUX Kommunity v1.0 restringe el uso a investigación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre la politica robotica FLUX 3 Action SO-101; arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible (adaptador LoRA; tamano del repositorio 0,5 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea documentadas estan en ingles) |
| Licencia | FLUX Kommunity License v1.0 (solo investigacion no comercial) |
| Formato de pesos | safetensors |
| Libreria / pipeline | LeRobot (`library_name: lerobot`), `pipeline: robotics` |
| Modelo base | `black-forest-labs/flux-3-action-so101` |
| Entradas | Camara de escena (1280x960 en grabacion, redimensionada a 640x480 en entrenamiento) y camara de muneca (640x480); instruccion de texto; estado articular |
| Salidas | Chunks de 32 acciones (comandos articulares) |
| Hardware de robot | Brazo SO-101 con calibracion concreta (`joint_units.json`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 sobre la política FLUX 3 Action SO-101 de Black Forest Labs. No se documenta en la información disponible la arquitectura interna del modelo base (tipo de transformer, mecanismo de atención ni fusión visión-lenguaje-acción), por lo que cualquier detalle al respecto queda como no disponible. El adaptador se aplica sobre los pesos del policy y se puede fusionar con ellos, lo que reduce el tiempo de inferencia de 1,6 s a 1,0 s por llamada al modelo.

El entrenamiento sigue la receta LoRA de BFL: rango 32, batch «2 x 4», learning rate 1e-4, pesos en crudo (sin EMA) y 8.000 microsteps sobre una A100. El plan fue secuencial: 3.000 microsteps con 60 episodios de vasos, 3.000 con 100 episodios de vasos y 2.000 finales con los 110 episodios completos (6 reservados para validación). La cámara de escena se redimensionó de 1280x960 a 640x480 durante el entrenamiento. No se reporta número de tokens, composición del dataset más allá del recuento de episodios, ni uso de RLHF o DPO; al tratarse de imitación supervisada sobre teleoperación, estos datos no aplican o no están disponibles.

## Capacidades

- Ejecución de la tarea «stack the paper cups on top of each other» sobre un brazo SO-101, apilando vasos de papel.
- Ejecución de la tarea «Put all the Snickers bars on the plate», recogiendo barritas y depositándolas en un plato.
- Control visuomotor con dos cámaras simultáneas (escena y muñeca), requiriendo que ambas compartan resolución `[480, 640]`.
- Condicionamiento por instrucción en lenguaje natural, aunque solo para las dos cadenas de texto exactas documentadas.
- Generación de acciones en chunks de 32 comandos articulares, con una duración de 1,07 s por chunk.
- Integración con LeRobot mediante `lerobot-rollout` y el plugin `lerobot_robot_flux_units`.
- No soporta tool calling, function calling, razonamiento multi-paso genérico, visión general, audio ni generación de texto: es una política robótica, no un modelo conversacional.

## Casos de uso

- Apilado de vasos en un puesto de demostración: el adaptador reproduce la tarea de apilar vasos de papel sobre un SO-101 correctamente calibrado, útil para exhibiciones de manipulación diestra en ferias y laboratorios.
- Pick-and-place de objetos alargados: la tarea de Snickers sirve como caso de referencia para recoger objetos pequeños y alargados y soltarlos en un contenedor (un plato), patrón habitual en líneas de empaquetado.
- Investigación en imitación con pocos datos: con solo 10 episodios para la segunda tarea, es un punto de partida para estudiar cuántos episodios hacen falta para especializar una política VLA mediante LoRA.
- Comparación de adaptadores sobre una misma base: junto con `flux_hack_lora_erh_cups_r3` y el modelo zero-shot, permite medir el efecto de distintos volúmenes y mezclas de datos sobre el error angular offline.
- Reproducción de experimentos de hackathon: el repositorio incluye `provenance.json` y el recetario de entrenamiento, por lo que sirve para replicar el pipeline LoRA de BFL en una sola A100.
- Evaluación de infraestructura de inferencia robótica: con latencias medidas de 1,6 s (1,0 s fusionando el adaptador) y pausas entre chunks, es útil para dimensionar requisitos de control a bucle cerrado.
- Formación de personal técnico: el flujo `huggingface-cli download` + `pip install -e plugin` + `lerobot-rollout` es un ejemplo mínimo de despliegue de una política entrenada en un brazo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a una política robótica. El autor reporta error medio en grados entre comandos predichos y registrados, sobre 256 pasos y episodios no usados en entrenamiento (un episodio por tarea, por lo que las cifras son ruidosas):

| Politica | Vasos (episodio 95) | Snickers (episodio 109) |
|---|---|---|
| Este LoRA (`erh_r4`) | 42,9 | 55,6 |
| `flux_hack_lora_erh_cups_r3` (solo vasos) | 25,9 | 50,2 |
| Modelo base zero-shot | 93,4 | 125,2 |

Además, el autor documenta latencias de inferencia: aproximadamente 1,6 s por llamada al modelo (1,0 s si el adaptador está fusionado) y 1,07 s por chunk de 32 acciones.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 25 GB libres en GPU, según indica el autor.
- GPU de entrenamiento: una A100 (el autor reporta 8.000 microsteps sobre A100).
- GPU consumer: 25 GB supera los 24 GB de una RTX 4090 o RTX 3090, por lo que no cabe con holgura en las consumer GPU habituales; sería necesario probar configuraciones con menos memoria o cuantización, no documentadas.
- Despliegue: LeRobot con soporte FLUX 3, usando `lerobot-rollout --strategy.type=base --policy.path=erh_r4` y el plugin de robot `lerobot_robot_flux_units` instalado con `pip install -e erh_r4/plugin/lerobot_robot_flux_units`.
- Requisitos adicionales: acceso al modelo base en Hugging Face (aceptar su licencia una vez), brazo SO-101 con la misma calibración que la grabación y el fichero `joint_units.json` del repositorio.
- Latencia y throughput: 1,6 s por llamada (1,0 s con adaptador fusionado); un chunk de 32 acciones cubre 1,07 s de ejecución, por lo que se esperan pausas cortas entre chunks.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de entrenamiento | Error offline (vasos / Snickers) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Rezakakooee/flux_hack_lora_erh_r4` | LoRA r=32 sobre FLUX 3 Action SO-101 | 110 episodios (100 vasos + 10 Snickers) | 42,9 / 55,6 | FLUX Kommunity v1.0, solo investigación no comercial | Hugging Face, 0 descargas |
| `Rezakakooee/flux_hack_lora_erh_cups_r3` | LoRA sobre la misma base, solo tarea de vasos | No disponible el detalle; solo vasos | 25,9 / 50,2 | No disponible en la informacion | Hugging Face |
| `black-forest-labs/flux-3-action-so101` (zero-shot) | Política base sin especializar | No disponible | 93,4 / 125,2 | FLUX Kommunity v1.0 | Hugging Face (requiere aceptar licencia) |

No se dispone de información sobre otros adaptadores o políticas comparables de la misma categoría (manipulación con SO-101) en la documentación consultada.

## Limitaciones y advertencias

- Licencia FLUX Kommunity v1.0: uso exclusivamente para investigación no comercial. Además, FLUX y sus salidas no pueden emplearse para entrenar otro modelo con una función similar, lo que bloquea usos industriales directos.
- Especialización extrema: solo ejecuta dos tareas y el autor exige usar el texto de instrucción exactamente como aparece en la tabla; variaciones de redacción no están garantizadas.
- Dependencia de calibración: `joint_units.json` contiene los offsets de un brazo concreto; tras recalibrar el brazo deja de ser válido y el adaptador no funcionará correctamente.
- Resultados offline ruidosos: se calculan sobre un único episodio de validación por tarea, de los 6 episodios reservados; no constituyen una estimación robusta del rendimiento real.
- En la tarea de vasos, el adaptador `cups_r3` es mejor offline (25,9° frente a 42,9°); este adaptador solo aporta la tarea de Snickers, entrenada con 10 episodios.
- Requisito estricto de resolución: ambas cámaras deben compartir tamaño `[480, 640]`; en caso contrario el rollout aborta con `cameras must share (T, C, H, W)`.
- Riesgo de alucinación y sesgos: no evaluado ni documentado por el autor; el modelo puede generar comandos articulares plausibles pero incorrectos ante escenas fuera de distribución.
- Seguridad física: el autor recomienda mantener la mano sobre el botón de parada durante la ejecución; es un requisito operativo, no opcional.
- Idiomas y cobertura: no se documentan capacidades multilingües; las instrucciones conocidas están en inglés.
- Fecha de publicación adelantada (octubre de 2026) y cero descargas o likes: no hay validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rezakakooee/flux_hack_lora_erh_r4
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-action-so101
- Adaptador solo para la tarea de vasos: https://huggingface.co/Rezakakooee/flux_hack_lora_erh_cups_r3
- Licencia FLUX Kommunity v1.0: https://huggingface.co/black-forest-labs/flux-3-action-so101
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; las fuentes devueltas no guardan relación con el repositorio.
