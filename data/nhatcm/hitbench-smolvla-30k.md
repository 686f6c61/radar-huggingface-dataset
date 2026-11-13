# nhatcm/hitbench-smolvla-30k

## Resumen

SmolVLA fine-tuneado por el usuario nhatcm para control de un brazo robotico SO-101 en la tarea concreta de "poner un globo en una bandeja". Se trata de un checkpoint de evaluacion de 30.000 pasos de entrenamiento sobre la arquitectura SmolVLA (vision-language-action), con 450 millones de parametros y salida de acciones en espacio de efector final (delta EEF) en lugar de control articular directo. El modelo consume una imagen RGB frontal de 256x256 y el estado articular medido del SO-101, y produce chunks de 50 acciones de 7 dimensiones cada una.

El interes tecnico esta en su contrato de interfaz extremadamente explicito: normalizacion de estado embebida en los pesos (MEAN_STD), normalizacion de RGB y acciones identidad, decodificacion determinista de deltas EEF a consignas de posicion y rotacion, y un fixture de depuracion con 50 frames alineados. Es un ejemplo de ingenieria de despliegue robotico reproducible mas que un modelo de proposito general.

La relevancia es acotada: no es un modelo fundacional publico sino un checkpoint privado de evaluacion con 2 descargas y 0 likes en el momento de la consulta, sin licencia declarada ni idiomas especificados. Su valor esta como referencia de pipeline VLA para SO-101 y como caso de estudio de contratos de accion y aumento sim-real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), transformer multimodal con cabeza de acciones; detalles internos no disponibles |
| Parametros totales | 450.046.188 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (procesa una imagen 256x256 y estado de 6 dimensiones por llamada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/bf16; no se documentan variantes GGUF u otras) |
| Idiomas soportados | no disponible (instruccion fija en ingles: `put balloon onto tray`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` |
| Libreria | lerobot |
| Pipeline | robotics |
| Tamano del repo | 1.8 GB |
| Salida de acciones | `predict_action_chunk` → `[batch, 50, 7]`, orden `[dx, dy, dz, dRx, dRy, dRz, gripper]`, recortado a `[-1, 1]` |
| Representacion de accion | `normalized-eef-delta-v2` |
| Entrada de estado | `observation.state` float32 `[6]`: shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll, gripper |
| Entrada visual | `observation.images.rgb` uint8 HWC, redimensionado a 256x256, float32 CHW, /255 |
| Normalizacion de estado | MEAN_STD embebida en `model.safetensors` (no renormalizar) |
| Normalizacion RGB y acciones | IDENTITY |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura vision-language-action que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones; el checkpoint concreto no documenta el detalle interno de capas, atencion ni dimensiones ocultas. La innovacion practica de este fine-tune reside en la representacion de salida: en lugar de predecir posiciones articulares, emite deltas normalizados de efector final que se decodifican contra la ultima pose EEF medida, con escala de 0,004 m por unidad en traslacion y 0,5 rad por unidad en rotacion (rodrigues). El gripper se mapea de `[-1, 1]` a fraccion cerrada `[0, 1]` y luego a unidades `[100, 0]`, de modo que `-1` es abierto y `+1` cerrado.

El entrenamiento consistio en 30.000 actualizaciones del optimizador con batch efectivo de 28 sobre cuatro GPUs, a partir de 1.565 segmentos causales (349.611 frames) exportados de 477 trayectorias frontales de las tareas 0-9. El muestreo combina un 80% de anclas uniformes por frame a nivel global y un 20% de anclas equilibradas en los bordes de autoridad de las tareas 3 y 5. Se aplico reemplazo semantico de pared solo en pixeles de pared etiquetados, un puente medido de ganancia/sesgo RGB sim-real en cada ejemplo, y un curriculum de aumentacion (color de camara, iluminacion, desenfoque, ruido de sensor y pools JPEG) escalado linealmente con el progreso del optimizador. No se aplicaron recortes, volteos, warps, mascaras de dropout ni cambios en estado, lenguaje, padding o acciones. La perdida final observada fue aproximadamente 0,005, que es un objetivo de entrenamiento y no una medida de exito fisico de la tarea.

## Capacidades

- Generacion de chunks de accion de 50 pasos en espacio de efector final (traslacion, rotacion y gripper) para el brazo SO-101.
- Control condicionado por instruccion de lenguaje fija (`put balloon onto tray`), con frases de evento adicionales para h2r-air y r2h anadidas tras el borde de autoridad registrado.
- Percepcion visual a partir de una unica camara RGB frontal de 256x256.
- Integracion de estado propioceptivo medido (6 articulaciones) con normalizacion MEAN_STD embebida.
- Decodificacion determinista de acciones a consignas EEF mediante contrato publico (`action_contract.json`).
- Fixture de depuracion alineado (`debug_sample/observations.npz`) con 50 frames consecutivos sin aumentar, ground truth de acciones y metadatos de procedencia.
- No se documentan capacidades de tool calling, agentes multi-paso, matematicas, codigo, vision general, audio ni modo thinking.

## Casos de uso

- Evaluacion de pipelines VLA en SO-101: el modelo sirve como checkpoint de referencia para validar la cadena completa (lectura de camara, redimensionado a 256x256, normalizacion, inferencia, decodificacion EEF, IK y controlador de limites articulares) antes de entrenar un modelo propio.
- Depuracion de preprocesado de entrada: el fixture `debug_sample/observations.npz` permite verificar que el pipeline de RGB y estado produce tensores identicos a los del entrenamiento, aislando errores de normalizacion (por ejemplo, doble normalizacion del estado).
- Investigacion en aumentacion sim-real: los contratos `sim_real_augmentation_recipe.json` y `augmentation_curriculum.json` documentan un curriculum de aumentacion reproducible que puede reutilizarse en otros fine-tunes de SmolVLA.
- Estudio de representaciones de accion: el contrato `normalized-eef-delta-v2` con escalas explicitas (0,004 m y 0,5 rad) es un ejemplo concreto para comparar control en espacio EEF frente a control articular en tareas de pick-and-place.
- Reproduccion de recetas de entrenamiento: los ficheros `sampling_contract.json` y `wall_augmentation_contract.json` permiten replicar el muestreo por anclas y el reemplazo semantico de pared en experimentos propios.
- Benchmark interno de exito fisico: aunque el autor advierte que la perdida no mide exito, el checkpoint puede usarse como linea base en una bateria de evaluacion fisica de la tarea "globo a bandeja" con el mismo robot y camara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico reportado es la perdida final de entrenamiento (~0,005), que el propio autor indica que no constituye una medida de exito fisico de la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 450 millones de parametros, en fp32 los pesos ocupan aproximadamente 1,8 GB (coincide con el tamano del repo); en bf16/fp16, alrededor de 0,9 GB; en int8, unos 0,45 GB. A esto hay que sumar el codificador visual y las activaciones, no cuantificadas en la informacion.
- GPU recomendadas: no disponibles. El entrenamiento se realizo en cuatro GPUs sin especificar modelo.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de pesos, pero no se documenta ninguna GPU concreta ni consumo medido.
- Opciones de despliegue: libreria `lerobot` con `predict_action_chunk`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un VLA de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nhatcm/hitbench-smolvla-30k | 450.046.188 | imagen 256x256 + estado [6] | chunk [50, 7] EEF delta | no disponible | publico en HF (2 descargas) |
| SmolVLA base (referencia generica) | no disponible en la informacion | no disponible | acciones | no disponible | no disponible en la informacion |
| Alternativas VLA para SO-101 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de modelos comparables en la informacion proporcionada; la comparativa queda limitada a la referencia generica a SmolVLA como arquitectura base.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado exclusivamente para la tarea "put balloon onto tray" con una camara frontal y un SO-101; no generaliza a otras tareas, objetos, camaras ni robots sin reentrenamiento.
- Instruccion de lenguaje practicamente fija; el soporte multilingue no esta documentado y la unica frase base es en ingles.
- Licencia no declarada: no hay autorizacion explicita de uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Checkpoint descrito por el autor como "private evaluation checkpoint", con 2 descargas y 0 likes; no es un modelo validado por la comunidad.
- La perdida de entrenamiento (~0,005) no es una medida de exito fisico; no se reportan tasas de exito en la tarea real.
- El fixture de depuracion no es un split de evaluacion imparcial (frames de entrenamiento de la episode 0), por lo que no sirve para medir generalizacion.
- Riesgo de alucinacion en el sentido de acciones fisicamente invalidas: la decodificacion asume que la pose EEF medida es correcta y que el IK calibrado y el controlador de limites articulares filtran consignas erroneas.
- Dependencia fuerte del preprocesado exacto: doble normalizacion del estado, orden incorrecto de articulaciones o redimensionado distinto de 256x256 degradan el comportamiento sin aviso.
- Sesgos de datos: 477 trayectorias de un unico entorno y configuracion de camara; el puente sim-real y las aumentaciones mitigan pero no eliminan el sesgo de dominio.
- No se documentan sesgos sociales, de genero o culturales porque el modelo no genera texto libre.

## Enlaces

- Hugging Face: https://huggingface.co/nhatcm/hitbench-smolvla-30k
- Repositorio referenciado en la model card: `nhatcm/hitbench-so101-smolvla-front-eef-30k` (sin URL directa en la informacion)
- Ficheros de contrato en el repo: `action_contract.json`, `eval_contract.json`, `train_config.json`, `sim_real_augmentation_recipe.json`, `augmentation_curriculum.json`, `sampling_contract.json`, `wall_augmentation_contract.json`
- Fixture de depuracion: `debug_sample/observations.npz`, `debug_sample/preview.gif`, `debug_sample/manifest.json`
- No se han encontrado papers, blogs, repos adicionales ni demos en la informacion disponible.
