# Gawtam/flux3-chess-lora-28moves

## Resumen

`Gawtam/flux3-chess-lora-28moves` es un adaptador LoRA (PEFT) sobre el modelo de accion `black-forest-labs/flux-3-action-so101`, la variante para robotica SO-101 de FLUX 3 Action de Black Forest Labs. No es un modelo de lenguaje ni de imagen: es una politica de imitacion (visuomotor policy) entrenada con la receta `examples/flux3/lora.json` de LeRobot para ejecutar un repertorio cerrado de 28 movimientos de una pieza de ajedrez sobre un tablero fisico con un brazo SO-101 (5 articulaciones de brazo mas pinza).

El adaptador resuelve un problema muy concreto: especializar un modelo base de accion, ya preentrenado, en una tarea de manipulacion de precision (desplazar una figura entre casillas con increments de 2 cm) sin reentrenar el modelo completo. Para ello se agrego un dataset propio de 197 episodios (169 de entrenamiento) y se entrenaron 6.000 pasos con un lote efectivo de 24 en 6 GPU H100, seleccionando el checkpoint 3000 por metricas de ventanas en movimiento.

Su relevancia ahora es doble: por un lado demuestra el flujo de trabajo de fine-tuning con LoRA sobre FLUX 3 Action dentro del ecosistema LeRobot; por otro, publica una evaluacion inusualmente detallada (MAE offline por articulacion y por movimiento, direccion correcta, cobertura mediana) frente al modelo base y frente a una linea base trivial. El repositorio ocupa 2,8 GB e incluye checkpoints en los pasos 1000, 2000 y 3000, tanto en pesos crudos como en EMA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre una politica de accion FLUX 3 Action (flow matching) con VAE de video y codificador de texto; no disponible el detalle interno de la arquitectura base |
| Parametros totales | No disponible (el adaptador LoRA no declara numero de parametros; el repositorio ocupa 2,8 GB incluyendo checkpoints) |
| Longitud de contexto | No disponible. Horizonte de accion de 42 pasos; la evaluacion usa las primeras 32 acciones |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | No disponible. Las instrucciones de texto (captions) del entrenamiento estan en ingles con formato fijo |
| Licencia | No disponible. El uso esta sujeto a la licencia de los modelos base FLUX 3 Action |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) con directorios `pretrained_model/` y `pretrained_model_ema/` por checkpoint |

## Arquitectura y entrenamiento

El adaptador se monta sobre `flux-3-action-so101` (revision `c9e13b2aca6a0a472b3ea03fd90cff32d3e85849`), que a su vez utiliza los codificadores `flux-3-action-base` (revision `62878e2925e59b7a89ec14463ce89932624c490d`): un VAE de video y un codificador de texto. La politica genera comandos de accion mediante flow matching, condicionada por observaciones visuales y por una instruccion textual normalizada. El entrenamiento se hizo con la receta LoRA de LeRobot (`examples/flux3/lora.json`), con 6 GPU H100 en DDP, lote de 4 por GPU con acumulacion 1 (lote efectivo 24), tasa de aprendizaje 1e-4, semilla 42 y 6.000 actualizaciones.

Los datos proceden de 28 datasets agregados localmente con `aggregate_datasets` de LeRobot (`niru-5/chess_dataset_{a,b,c,d}1_2cm_to_*`), que suman 197 episodios, de los cuales 169 se usaron para entrenamiento. Se reservo 1 episodio por movimiento (28 en total, `eval_split` 0.1, episodios 24-30). Las instrucciones se normalizaron al formato exacto `Move the figure from a1 at 2 cm to a2 at 4 cm` (casillas en minuscula y un espacio antes de `cm`), y la normalizacion usa las estadisticas propias de este dataset, no las del modelo base. El checkpoint raiz (paso 3000) se eligio mediante una metrica de ventanas en movimiento, y el repositorio publica pesos EMA ademas de los crudos; el estado del optimizador no se sube.

## Capacidades

- Generacion de comandos de accion para un brazo SO-101: 5 articulaciones (`shoulder_pan`, `shoulder_lift`, `elbow_flex`, `wrist_flex`, `wrist_roll`) mas pinza, sobre un horizonte de 42 pasos.
- Ejecucion de 28 movimientos de ajedrez sobre una rejilla de 4 columnas (a1, b1, c1, d1) y desplazamientos de 2 a 16 cm en incrementos de 2 cm.
- Condicionamiento por instruccion en lenguaje natural con formato estricto; el texto debe respetar exactamente la plantilla de entrenamiento.
- Percepcion visual a traves del VAE de video del modelo base (entrada de imagen/video, no disponible el detalle de resolucion).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es una politica motora, no un modelo conversacional.
- No dispone de capacidades multilingues, vision general, audio ni modo "thinking" en el sentido de los LLM; el codificador de texto solo se usa para condicionar la accion.

## Casos de uso

- Manipulacion de piezas en tablero robotico: el adaptador traduce una instruccion del tipo "mover de c1 a c5" en una trayectoria de 42 pasos para el SO-101, adecuado para demos de ajedrez automatizado con piezas situadas en coordenadas conocidas.
- Investigacion en imitacion de bajo coste: sirve como ejemplo reproducible de fine-tuning LoRA sobre FLUX 3 Action con LeRobot, con receta, semilla y curva de checkpoints publicados.
- Punto de partida para tareas pick-and-place de corto alcance: los movimientos de 2 a 16 cm con precision de MAE inferior a 3 grados en el brazo son un banco de pruebas realista para politicas de alcance corto.
- Evaluacion comparativa de tecnicas de adaptacion: al incluir pesos crudos y EMA en tres checkpoints, permite medir el efecto del EMA y del numero de pasos con las mismas metricas.
- Aumento de datos y analisis de robustez: su tabla por movimiento (direccion correcta entre 76 % y 100 %) identifica que casillas necesitan mas demos antes de desplegar.
- Docencia y prototipado en robotica: un repositorio de 2,8 GB con instrucciones de carga via PEFT y LeRobot permite montar practicas de aprendizaje por imitacion sin entrenar desde cero.
- Validacion pre-despliegue en laboratorio: el MAE offline por articulacion (por ejemplo, `elbow_flex` 3,89 grados frente a 12,23 del base) ayuda a decidir si la politica es suficientemente segura antes de mover hardware real.

## Benchmarks y rendimiento

Datos publicados por el autor sobre episodios reservados. La loss de evaluacion es la loss de flow matching de LeRobot sobre pesos crudos con ruido aleatorio; el MAE offline es el error de accion con teacher forcing sobre pesos EMA (303 ventanas, stride 32, primeras 32 de 42 acciones). Las ventanas en movimiento solo consideran ventanas donde un comando de brazo se desplaza 10 grados o mas.

| Checkpoint | Loss eval (crudo) | MAE brazo (grados, EMA) | MAE pinza (%) | Ventanas en movimiento, brazo (grados) | Direccion correcta | Cobertura mediana |
|---|---|---|---|---|---|---|
| Paso 1000 | 0,1196 | 3,64 | 1,81 | 4,54 | 84 % | 0,79 |
| Paso 2000 | 0,1093 | 2,70 | 1,75 | 3,47 | 92 % | 0,91 |
| Paso 3000 (raiz) | 0,1063 | 2,49 | 1,74 | 3,21 | 91 % | 0,93 |
| Base so101 (zero-shot) | no disponible | 5,83 | 2,03 | 7,14 | 61 % | 0,31 |
| Linea base "mantener ultimo comando" | no disponible | 5,22 | 2,33 | 8,46 | 0 % | 0,00 |

| Articulacion | Base so101 (grados) | Paso 3000 (grados) |
|---|---|---|
| `shoulder_pan` | 2,49 | 0,88 |
| `shoulder_lift` | 9,29 | 4,13 |
| `elbow_flex` | 12,23 | 3,89 |
| `wrist_flex` | 3,46 | 2,58 |
| `wrist_roll` | 1,66 | 0,95 |
| `gripper` | 2,03 | 1,74 |

Rendimiento por movimiento del checkpoint raiz (paso 3000) en episodios reservados:

| Instruccion | Ventanas | Brazo (grados) | Base brazo (grados) | Direccion correcta |
|---|---|---|---|---|
| a1 2 cm a a2 4 cm | 12 | 2,66 | 3,91 | 83 % |
| a1 2 cm a a3 6 cm | 13 | 2,79 | 4,37 | 91 % |
| a1 2 cm a a4 8 cm | 10 | 2,80 | 6,71 | 91 % |
| a1 2 cm a a5 10 cm | 10 | 1,92 | 6,88 | 100 % |
| a1 2 cm a a6 12 cm | 11 | 3,26 | 6,21 | 96 % |
| a1 2 cm a a7 14 cm | 10 | 2,86 | 8,61 | 100 % |
| a1 2 cm a a8 16 cm | 9 | 2,73 | 8,91 | 100 % |
| b1 2 cm a b2 4 cm | 8 | 3,03 | 4,62 | 92 % |
| b1 2 cm a b3 6 cm | 10 | 2,92 | 5,44 | 79 % |
| b1 2 cm a b4 8 cm | 9 | 3,14 | 5,66 | 93 % |
| b1 2 cm a b5 10 cm | 9 | 2,76 | 6,17 | 95 % |
| b1 2 cm a b6 12 cm | 8 | 2,72 | 8,28 | 76 % |
| b1 2 cm a b7 14 cm | 9 | 3,55 | 8,40 | 90 % |
| b1 2 cm a b8 16 cm | 10 | 3,39 | 8,23 | 95 % |
| c1 2 cm a c2 4 cm | 9 | 2,98 | 3,67 | 93 % |
| c1 2 cm a c3 6 cm | 10 | 2,08 | 4,29 | 79 % |
| c1 2 cm a c4 8 cm | 13 | 1,95 | 3,68 | 90 % |
| c1 2 cm a c5 10 cm | 11 | 2,10 | 4,49 | 93 % |
| c1 2 cm a c6 12 cm | 12 | 2,59 | 4,82 | 100 % |
| c1 2 cm a c7 14 cm | 12 | 1,88 | 4,76 | 79 % |
| c1 2 cm a c8 16 cm | 13 | 2,66 | 5,58 | 91 % |
| d1 2 cm a d2 4 cm | 11 | 2,90 | 3,31 | 93 % |
| d1 2 cm a d3 6 cm | 13 | 1,94 | 3,26 | 94 % |
| d1 2 cm a d4 8 cm | 12 | 1,81 | 3,56 | 93 % |
| d1 2 cm a d5 10 cm | 12 | 2,03 | 3,97 | 89 % |
| d1 2 cm a d6 12 cm | 12 | 1,85 | 4,07 | 94 % |
| d1 2 cm a d7 14 cm | 12 | 1,68 | 4,01 | 87 % |
| d1 2 cm a d8 16 cm | 13 | 1,89 | 4,59 | 90 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje: no son aplicables a este modelo. Las diferencias de unos pocos puntos porcentuales en la loss de evaluacion se describen como ruido en la propia model card.

## Requisitos de hardware

- VRAM de inferencia: no disponible. No se publican requisitos de memoria para servir la politica (VAE de video, codificador de texto y adaptador).
- Entrenamiento documentado: 6 GPU H100 en DDP, lote de 4 por GPU con acumulacion 1 y 6.000 actualizaciones. No se especifica el tipo exacto de H100 (80 GB o 96 GB).
- GPU consumer: no disponible. Al tratarse de una politica con VAE de video, la viabilidad en tarjetas de 24 GB (RTX 4090) no esta documentada.
- Despliegue: `lerobot.policies.flux3.modeling_flux3.Flux3Policy` junto con `peft.PeftModel` / `PeftConfig`; pesos en safetensors dentro de `checkpoints/<step>/pretrained_model/` y `pretrained_model_ema/`. No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. El horizonte de accion es de 42 pasos y la evaluacion usa ventanas de 32 pasos con stride 32.
- Almacenamiento: el repositorio completo ocupa 2,8 GB, incluyendo los checkpoints de los pasos 1000, 2000 y 3000 en version cruda y EMA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | MAE brazo (grados) | Direccion correcta | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Gawtam/flux3-chess-lora-28moves` (paso 3000) | No disponible (LoRA) | 42 pasos de accion | 2,49 | 91 % | No disponible | HuggingFace, 23 descargas |
| `black-forest-labs/flux-3-action-so101` (base zero-shot) | No disponible | 42 pasos de accion | 5,83 | 61 % | Sujeta a licencia BFL | HuggingFace |
| Linea base "mantener ultimo comando" | No aplica | No aplica | 5,22 | 0 % | No aplica | Referencia interna del autor |
| Otras politicas de imitacion para SO-101 (ACT, Diffusion Policy, pi0) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se han encontrado en la informacion disponible otros adaptadores LoRA publicados para FLUX 3 Action SO-101 con los que comparar directamente.

## Limitaciones y advertencias

- Alcance funcional cerrado: solo 28 movimientos sobre una rejilla de 4 columnas y distancias de 2 a 16 cm. Cualquier instruccion fuera de ese dominio no esta cubierta por el entrenamiento.
- Formato de instruccion estricto: el texto debe ser exactamente `Move the figure from <casilla> at <N> cm to <casilla> at <M> cm`, con casillas en minuscula y un espacio antes de `cm`. Variaciones de formato degradan el comportamiento.
- Normalizacion especifica del dataset: hay que cargar los procesadores de este repositorio y, en el pipeline del equipo, pasar `--normalization`; usar estadisticas del modelo base invalida las comparaciones.
- Datos limitados: 169 episodios de entrenamiento y 1 episodio reservado por movimiento (28 en total). Las metricas por movimiento se apoyan en 8-13 ventanas, por lo que la incertidumbre es alta.
- Error de pinza apenas mejorado: 1,74 % frente a 2,03 % del modelo base, muy lejos de la mejora del brazo. La sujecion de la pieza es el punto debil del adaptador.
- Movimientos con menor fiabilidad: `b1 a b6` (76 %), `b1 a b3` (79 %), `c1 a c3` (79 %) y `c1 a c7` (79 %) en direccion correcta.
- Dependencia de los codificadores: requiere `flux-3-action-base` en la revision `62878e2925e59b7a89ec14463ce89932624c490d`; cambios de revision pueden alterar el comportamiento.
- Licencia no declarada: el uso comercial queda supeditado a la licencia de los modelos FLUX 3 Action y de FLUX 3. Conviene verificar antes de cualquier despliegue productivo.
- No se publica estado del optimizador, por lo que no es posible reanudar el entrenamiento exactamente donde se dejo.
- Ausencia de evaluacion en linea real: todas las metricas son offline (teacher forcing o loss con ruido aleatorio); no se documentan tasas de exito en rollouts fisicos ni evaluaciones de seguridad.
- Riesgo de sobreajuste al entorno: iluminacion, camara y posicion del tablero no se describen; cambios de montaje pueden invalidar la politica.
- No aplica la advertencia habitual de alucinacion en lenguaje, pero si el riesgo analogo de generar trayectorias plausibles y fisicamente incorrectas fuera de distribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gawtam/flux3-chess-lora-28moves
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-action-so101
- Codificadores: https://huggingface.co/black-forest-labs/flux-3-action-base
- FLUX 3, web oficial: https://flux3.dev/
- Anuncio de FLUX 3 en MarkTechPost: https://www.marktechpost.com/2026/07/26/black-forest-labs-releases-flux-3-a-multimodal-flow-model-for-image-video-audio-and-robot-action-prediction/
- Cobertura en Tech Times: https://www.techtimes.com/articles/321552/20260725/flux-3-launches-black-forest-labs-enters-video-audio-physical-ai-one-model.htm
- FLUX (familia de modelos) en Wikipedia: https://en.wikipedia.org/wiki/Flux_(text-to-image_model)
