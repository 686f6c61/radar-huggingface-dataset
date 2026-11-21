# DecentVLA/flux3_robocasa_kitchen8_cent_r50

## Resumen

flux3_robocasa_kitchen8_cent (round 50) es un checkpoint de robotica resultante de un ajuste fino completo (full fine-tune) del modelo base `black-forest-labs/flux-3-action-base`, desarrollado por el colectivo DecentVLA. El modelo parte de FLUX 3 Action, un modelo generativo orientado a la produccion de acciones motoras, y lo especializa en tareas de manipulacion de cocina del benchmark RoboCasa mediante el framework de aprendizaje federado `decent-vla`. El resultado es un policy checkpoint que recibe observaciones visuales y emite acciones de control para un brazo robotico en entornos de cocina simulados.

El checkpoint corresponde a la ronda 50 de un proceso de entrenamiento federado, lo que lo convierte en el estado agregado de un ciclo de rondas distribuidas. Se distribuye como un unico fichero `server_round_0050.pt` en precision fp32, con un repositorio de 27,6 GB que incluye ademas los ficheros de evaluacion, configuracion y logs del entrenamiento. Su relevancia es acotada: es un artefacto de investigacion de un pipeline federado, con un rendimiento medio del 21,00 % de exito (84/400 episodios) sobre ocho tareas de cocina.

El modelo no es un LLM ni un modelo de proposito general: es un modelo de accion visomotora para robotica, por lo que muchas de las categorias habituales de esta ficha (idiomas, tool calling, contexto en tokens) no aplican y se marcan como no disponibles. La licencia FLUX Kommunity restringe el uso a fines no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FLUX 3 Action (modelo base `black-forest-labs/flux-3-action-base`), ajuste fino completo |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de accion, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en fp32) |
| Idiomas soportados | no disponible |
| Licencia | FLUX Kommunity License (uso no comercial) |
| Formato de pesos | PyTorch `.pt` (`server_round_0050.pt`, fp32) |
| Tamano del repositorio | 27,6 GB |
| Tarea | manipulacion robotica en RoboCasa (8 tareas de cocina) |
| Metodo de entrenamiento | aprendizaje federado con `decent-vla` (ronda 50) |
| Semilla de evaluacion | 42 (50 episodios por tarea) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del FLUX 3 Action base de Black Forest Labs, sobre el que se aplica un full fine-tune de todos los pesos. No se dispone en la informacion proporcionada de detalles sobre el numero de capas, dimension del modelo ni el mecanismo exacto de generacion de acciones; la model card solo identifica el modelo base y el pipeline de entrenamiento. El checkpoint publicado es el estado agregado de la ronda 50 de un proceso federado, entrenado con el framework `decent-vla` bajo la configuracion `examples/flux_robocasa_kitchen8_cent.yaml` y el runbook `examples/flux/README_table_arms.md`.

El entrenamiento se realiza sobre el benchmark RoboCasa, concretamente sobre ocho tareas de cocina (CloseFridge@K2, TurnOnSinkFaucet@K4, TurnOnMicrowave@K8, PickPlaceToasterToCounter@K9, CoffeeSetupMug@K1, CloseBlenderLid@K5, CloseToasterOvenDoor@K7 y OpenStandMixerHead@K10). El caracter federado implica que el modelo se agrega a partir de actualizaciones de multiples clientes por ronda; la informacion disponible no detalla el numero de clientes, el tamano del dataset ni si hubo etapas de RLHF o DPO, algo poco habitual en modelos de accion.

## Capacidades

- Generacion de acciones motoras para manipulacion robotica en entornos de cocina simulados (RoboCasa).
- Ejecucion de tareas concretas de interaccion con objetos: abrir y cerrar puertas de electrodomesticos, accionar grifos, abrir el cabezal de una batidora, colocar objetos en superficies.
- Procesamiento de observaciones visuales del entorno para producir la accion correspondiente (modelo visomotor).
- Entrenamiento federado: el checkpoint agregado puede integrarse en rondas posteriores del pipeline `decent-vla`.
- Evaluacion reproducible mediante el comando `decent-vla eval` con la configuracion y el checkpoint publicados.
- No se dispone de informacion sobre soporte de tool calling, razonamiento multi-paso, capacidades multilingues, vision general, audio ni modos de pensamiento.

## Casos de uso

- Investigacion en aprendizaje federado para robotica: el checkpoint sirve como estado de referencia de la ronda 50 para comparar estrategias de agregacion, numero de clientes o rondas en el framework `decent-vla`.
- Reproduccion de experimentos: con `decent-vla eval --config examples/flux_robocasa_kitchen8_cent.yaml --ckpt server_round_0050.pt` se puede replicar la tabla de exitos publicada y verificar la semilla 42.
- Baseline para ajuste fino posterior: al ser un full fine-tune del FLUX 3 Action base, puede usarse como punto de partida para especializar en otras tareas de RoboCasa o en entornos de cocina adicionales.
- Estudio de tareas con rendimiento asimetrico: las tareas OpenStandMixerHead (41/50) y CloseToasterOvenDoor (31/50) funcionan razonablemente, mientras que TurnOnMicrowave, CoffeeSetupMug y CloseBlenderLid obtienen 0/50; el checkpoint es util para analizar por que ciertas habilidades no se adquieren en el regimen federado.
- Evaluacion de pipelines de policy remota: la model card menciona `runtime/remote_policy.py` para ejecuciones en RoboCasa, lo que permite probar el checkpoint en un servidor de inferencia remoto conectado al simulador.
- Docencia y divulgacion: ejemplo realista de un artefacto de investigacion con metricas publicas, util para explicar el ciclo completo de entrenamiento federado, evaluacion por tarea y publicacion de checkpoints.

## Benchmarks y rendimiento

Resultados publicados en la model card (50 episodios por tarea, semilla 42, exito medido como episodios completados):

| Tarea | Exitos |
|---|---|
| CloseFridge@K2 | 7/50 |
| TurnOnSinkFaucet@K4 | 4/50 |
| TurnOnMicrowave@K8 | 0/50 |
| PickPlaceToasterToCounter@K9 | 1/50 |
| CoffeeSetupMug@K1 | 0/50 |
| CloseBlenderLid@K5 | 0/50 |
| CloseToasterOvenDoor@K7 | 31/50 |
| OpenStandMixerHead@K10 | 41/50 |
| **Media** | **21,00 % (84/400)** |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El checkpoint fp32 ocupa parte de los 27,6 GB del repositorio, por lo que la inferencia en fp32 requiere previsiblemente una GPU con al menos 24-40 GB, aunque el dato exacto no se confirma.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano del checkpoint, se situaria en el rango de A100 40/80 GB o H100, sin confirmacion del autor.
- Cabe en GPU de consumo: no confirmado. Un checkpoint fp32 de este tamano probablemente no cabe en GPUs de 24 GB sin conversion a precision reducida, pero no se documenta el proceso.
- Opciones de despliegue: el pipeline oficial es `decent-vla` (comando `decent-vla eval`) junto con `runtime/remote_policy.py` para RoboCasa. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flux3_robocasa_kitchen8_cent (este) | FLUX 3 Action | RoboCasa, 8 tareas | 21,00 % medio (84/400) | FLUX Kommunity (no comercial) | Hugging Face, 0 descargas |
| `black-forest-labs/flux-3-action-base` | - | Modelo base de acciones | no disponible | FLUX Kommunity | Hugging Face |
| Otros checkpoints de `decent-vla` | FLUX 3 Action | RoboCasa | no disponible | FLUX Kommunity | no disponible |

No se dispone de informacion sobre modelos alternativos comparables en la misma categoria con metricas publicadas.

## Limitaciones y advertencias

- Rendimiento global bajo: 21,00 % de exito medio, con tres tareas a 0/50 y dos por debajo de 10/50; no es apto para despliegue en produccion sin un ajuste adicional sustancial.
- Alta varianza entre tareas: el modelo resuelve razonablemente OpenStandMixerHead y CloseToasterOvenDoor pero falla sistematicamente en tareas de apertura de recipientes y preparacion de cafe.
- Licencia FLUX Kommunity: uso exclusivamente no comercial; cualquier explotacion comercial requiere licencia aparte de Black Forest Labs.
- Artefacto de investigacion: es la ronda 50 de un proceso federado, no un modelo final pulido; puede contener artefactos de agregacion propios del entrenamiento distribuido.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre RoboCasa, el modelo esta sesgado hacia la distribucion de escenas, objetos e iluminacion de ese simulador y no se garantiza su transferencia al mundo real.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si en forma de acciones fisicas incorrectas o incompletas, especialmente en las tareas con 0/50.
- Limitaciones de contexto e idioma: no aplicables; el modelo no procesa texto ni lenguaje natural.
- Sin datos de cuantizacion ni de despliegue en hardware de consumo: cualquier uso fuera del pipeline `decent-vla` requiere validacion propia.
- Repositorio de 27,6 GB: requiere espacio en disco y ancho de banda considerables para su descarga y evaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DecentVLA/flux3_robocasa_kitchen8_cent
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-action-base
- Licencia FLUX Kommunity: https://huggingface.co/black-forest-labs/flux-3-action-base/blob/main/LICENSE.md
- Framework `decent-vla`: no disponible (referenciado en la model card como `examples/flux_robocasa_kitchen8_cent.yaml` y `examples/flux/README_table_arms.md`, sin URL publica en la informacion proporcionada)
- Benchmark RoboCasa: no disponible en la informacion proporcionada
