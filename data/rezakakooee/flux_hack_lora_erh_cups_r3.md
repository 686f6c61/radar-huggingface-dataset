# Rezakakooee/flux_hack_lora_erh_cups_r3

## Resumen

`Rezakakooee/flux_hack_lora_erh_cups_r3` es un adaptador LoRA para el modelo de robotica `black-forest-labs/flux-3-action-so101`, desarrollado por el usuario Rezakakooee en el marco del ERH Physical AI Hackathon (octubre de 2026). No es un modelo de lenguaje: es una politica de manipulacion (vision-lenguaje-accion) especializada en una unica tarea fisica, "apilar vasos de papel uno encima de otro", ejecutada por un brazo SO-101. El adaptador se entrena sobre 100 episodios de teleoperacion y se distribuye con la libreria LeRobot.

Su relevancia es practica: demuestra el flujo completo de fine-tuning LoRA sobre un modelo VLA de robotica con muy pocos recursos (6.000 microsteps en una A100, adaptador de rango 32) y con una mejora medible frente al modelo base en zero-shot. En dos episodios no vistos durante el entrenamiento, el error medio de las comandas predichas baja de 83,9 a 15,0 grados y de 93,4 a 25,9 grados respectivamente.

El repositorio ocupa 0,5 GB e incluye el adaptador en safetensors, un plugin de robot (`lerobot_robot_flux_units`) y el fichero `joint_units.json` con los offsets articulares del brazo concreto usado en la grabacion, lo que hace que la politica solo sea valida sobre ese mismo brazo y calibracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Policy de robotica vision-lenguaje-accion (FLUX 3 Action) con adaptador LoRA; arquitectura interna del modelo base no disponible |
| Parametros totales | No disponible (adaptador LoRA con rango r=32 sobre el modelo base; numero de parametros del adaptador no disponible) |
| Parametros activos | No disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF, INT8 ni FP8) |
| Idiomas soportados | No disponible (el modelo recibe una instruccion de tarea en texto, "stack the paper cups on top of each other", pero no se documenta soporte multilingue) |
| Licencia | FLUX Kommunity License v1.0: solo investigacion no comercial; prohibido usar FLUX o sus salidas para entrenar otro modelo de funcion similar |
| Formato de pesos | Safetensors (adaptador LoRA); se menciona la opcion de fusionar el adaptador con el modelo base |

## Arquitectura y entrenamiento

El adaptador se construye sobre `black-forest-labs/flux-3-action-so101`, una politica de robotica del tipo vision-lenguaje-accion que consume imagenes de dos camaras (escena y muneca) y una instruccion de tarea en lenguaje natural, y emite comandos articulares para un brazo SO-101. El adaptador LoRA sigue la receta publicada por BFL: rango 32, batch efectivo de 2 x 4, learning rate 1e-4 y pesos en crudo (sin EMA), con un total de 6.000 microsteps ejecutados en una GPU A100. El entrenamiento se hizo en dos fases: 3.000 microsteps sobre 60 episodios y otros 3.000 sobre 100 episodios, dejando los episodios 80-99 fuera del entrenamiento. La camara de escena se reescalo de 1280x960 a 640x480 durante el entrenamiento.

Los datos proceden exclusivamente de grabaciones de teleoperacion del propio equipo para la tarea de apilar vasos de papel. No se documenta el numero total de tokens, la composicion del dataset, ni si hubo etapas de RLHF o DPO; al tratarse de aprendizaje por imitacion supervisado (prediccion de comandos articulares), esos mecanismos no aplican en el sentido habitual de los LLM. Como innovacion practica, el repositorio incluye un plugin de robot que fija las unidades y offsets articulares del brazo, de forma que la politica y la cinematica del hardware quedan acopladas explicitamente.

## Capacidades

- Manipulacion robotica de una sola tarea: apilar vasos de papel uno encima de otro con un brazo SO-101.
- Control por imitacion: predice comandos articulares (en grados) a partir de imagenes de camara de escena y de muneca.
- Condicionamiento por instruccion de tarea en texto; la tarea debe escribirse exactamente como en el entrenamiento para obtener el comportamiento esperado.
- Generacion de acciones por chunks de 32 comandos, lo que da 1,07 s de ejecucion por bloque.
- Entrada multisensorial de dos camaras, obligatoriamente al mismo tamano de imagen (`[480, 640]`) por requisito del pipeline.
- Integracion con LeRobot mediante el plugin `lerobot_robot_flux_units` y el comando `lerobot-rollout`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo "thinking".

## Casos de uso

- Apilado automatizado de vasos de papel en laboratorio: el adaptador ejecuta la tarea sobre el mismo brazo SO-101 y la misma calibracion usados en la grabacion, con un error medio de 15,0-25,9 grados frente a 83,9-93,4 del modelo base en zero-shot.
- Referencia de fine-tuning LoRA en robotica: sirve como ejemplo reproducible de como adaptar un VLA con 6.000 microsteps y un adaptador de rango 32 en una sola A100, util para equipos que preparan sus propios experimentos.
- Evaluacion comparativa zero-shot frente a fine-tuned: el repositorio documenta el mismo comando de rollout para ambas politicas, lo que permite medir la ganancia del adaptador con un protocolo identico.
- Prototipado rapido en hackathons y cursos de aprendizaje por imitacion: el flujo de descarga, instalacion del plugin y rollout cabe en pocos comandos y requiere unos 25 GB de VRAM libre.
- Generacion de demos para aumentar datos: la politica entrenada puede producir rollouts que sirvan como material de partida o de comparacion frente a nuevas grabaciones de teleoperacion de la misma tarea.
- Pruebas de integracion hardware-software en cadenas LeRobot: el plugin y `joint_units.json` permiten validar el emparejamiento entre politica, calibracion del brazo y configuracion de camaras antes de escalar a otras tareas.
- Docencia sobre calibracion y sensibilidad al dominio: la advertencia de que una recalibracion invalida `joint_units.json` convierte el modelo en un caso practico de por que las politicas de imitacion no generalizan entre montajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a una politica de robotica. La unica evaluacion publicada es el error medio en grados de los comandos predichos frente a los grabados, sobre 256 pasos y en dos episodios no usados en entrenamiento:

| Politica | Episodio 85 | Episodio 95 |
|---|---|---|
| Este LoRA | 15,0 | 25,9 |
| Zero-shot (modelo base) | 83,9 | 93,4 |

Datos de latencia declarados por el autor: aproximadamente 1,6 s por llamada al modelo (1,0 s si el adaptador esta fusionado) y 1,07 s de ejecucion por chunk de 32 acciones, con pausas cortas esperadas entre chunks.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 25 GB libres en GPU, segun indica el autor.
- GPU de entrenamiento utilizada: una A100 para los 6.000 microsteps del adaptador.
- GPU recomendadas: A100 o superior para reproducir el entrenamiento; para inferencia se requiere una GPU con al menos 25 GB libres (gama profesional tipo A100, H100 o similares con esa capacidad).
- GPU de consumo: no se documenta que quepa en tarjetas consumer de 24 GB o menos; el requisito de 25 GB libres deja fuera, en principio, a una RTX 4090 de 24 GB. No hay datos de cuantizacion que permitan reducir la huella.
- Opciones de despliegue: LeRobot con soporte de FLUX 3, usando `lerobot-rollout` con `--policy.path` apuntando al repositorio; el plugin de robot se instala con `pip install -e erh_r3/plugin/lerobot_robot_flux_units`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: 1,6 s por llamada (1,0 s con adaptador fusionado), chunks de 32 acciones de 1,07 s. No se publica throughput agregado ni latencia en otras GPU.
- Requisito adicional de hardware: brazo SO-101 con la misma calibracion que la grabacion original, `joint_units.json` valido y dos camaras configuradas al mismo tamano de imagen.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este LoRA (`flux_hack_lora_erh_cups_r3`) | Adaptador LoRA sobre FLUX 3 Action | No disponible (r=32) | No disponible | Error medio 15,0 / 25,9 grados en episodios 85 y 95 | FLUX Kommunity License v1.0 (solo no comercial) | Publico en Hugging Face, 0 descargas |
| `black-forest-labs/flux-3-action-so101` (modelo base, zero-shot) | Policy VLA de robotica | No disponible | No disponible | Error medio 83,9 / 93,4 grados en los mismos episodios | FLUX Kommunity License v1.0 | Publico en Hugging Face con aceptacion de licencia |
| Otras policies compatibles con LeRobot (por ejemplo ACT o Diffusion Policy) | Politicas de imitacion | No disponible | No disponible | No disponible para esta tarea | No disponible | No disponible |

La unica comparacion cuantitativa disponible es frente al modelo base. No se han publicado resultados de este adaptador frente a otras politicas de robotica en la misma tarea, por lo que la comparativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Especializacion extrema: el adaptador solo ha visto la tarea "stack the paper cups on top of each other"; no se debe esperar generalizacion a otras tareas, objetos o disposiciones.
- Dependencia del hardware exacto: requiere el mismo brazo SO-101 y la misma calibracion que la grabacion. Tras una recalibracion, `joint_units.json` deja de ser valido y el modelo producira comandos incorrectos.
- Configuracion de camaras rigida: `--robot.image_size="[480, 640]"` es obligatorio; si las dos camaras no comparten forma, el rollout aborta con el error `cameras must share (T, C, H, W)`.
- Sensibilidad al texto de la tarea: la instruccion debe escribirse exactamente como en el entrenamiento; no se documenta robustez ante parafrasis ni ante otros idiomas.
- Licencia restrictiva: FLUX Kommunity License v1.0 permite solo investigacion no comercial y prohibe expresamente usar FLUX o sus salidas para entrenar otro modelo de funcion similar, lo que bloquea su uso en produccion comercial y parte del data flywheel.
- Riesgo de fallo fisico: el propio autor recomienda mantener la mano sobre el boton de parada, especialmente en la ejecucion zero-shot del modelo base.
- Sin datos de sesgo, robustez, iluminacion, variacion de objetos ni seguridad en entornos compartidos; no hay evaluacion mas alla de dos episodios offline.
- Metricas limitadas: la evaluacion publicada es error de comandos articulares en grados sobre 256 pasos en dos episodios, no tasa de exito real de la tarea en el robot.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin garantias de mantenimiento.
- El modelo base exige aceptar su licencia en Hugging Face antes de descargar; sin ese paso el rollout falla.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rezakakooee/flux_hack_lora_erh_cups_r3
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-action-so101
- Licencia FLUX Kommunity License v1.0: https://huggingface.co/black-forest-labs/flux-3-action-so101
- Fichero de procedencia del entrenamiento (`provenance.json`): incluido en el repositorio, https://huggingface.co/Rezakakooee/flux_hack_lora_erh_cups_r3/blob/main/provenance.json
- Offsets articulares del brazo (`joint_units.json`): incluido en el repositorio, https://huggingface.co/Rezakakooee/flux_hack_lora_erh_cups_r3/blob/main/joint_units.json
- Plugin de robot (`lerobot_robot_flux_units`): incluido en el repositorio, ruta `erh_r3/plugin/lerobot_robot_flux_units`
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
