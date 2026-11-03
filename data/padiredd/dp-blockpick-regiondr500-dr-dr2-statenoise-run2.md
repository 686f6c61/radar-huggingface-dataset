# padiredd/dp-blockpick-regiondr500-dr-dr2-statenoise-run2

## Resumen

`dp-blockpick-regiondr500-dr-dr2-statenoise-run2` es una política de difusión (diffusion policy) para control robótico de manipulacion, entrenada con el framework LeRobot sobre un fork propio del autor (ROBOTIS lerobot-cyclo). Desarrollada por el usuario `padiredd`, resuelve una tarea muy concreta: recoger un bloque verde lima con el brazo izquierdo de un robot ROBOTIS FFW SG2 equipado con pinza ROBOTIS CAD y camaras de muneca calibradas. El modelo tiene 287.533.680 parametros (288 M) y se distribuye en formato safetensors con un repositorio de 11,5 GB que incluye el checkpoint final y nueve checkpoints intermedios cada 10.000 pasos.

El interes tecnico del modelo no esta en su tamano ni en su rendimiento generalista, sino en el experimento de ablacion que documenta: se entrena sobre solo 500 episodios muestreados aleatoriamente (semilla 0) del conjunto de 10.000 episodios con domain randomization `padiredd/pick-cube-topdown-region10k-dr-dr2-3cam`, con 84.379 frames en total. El objetivo declarado es comprobar si el 0 % de exito de politicas previas entrenadas solo en simulacion con DR se debe a un exceso de datos o a sobreentrenamiento sobre el conjunto de 10K. Es, por tanto, una replica de `padiredd/dp-blockpick-regiondr500-dr-dr2-statenoise` con la misma configuracion y semilla, ejecutada en otra GPU.

Se trata de un modelo de investigacion en robotica, no de un modelo de lenguaje: no procesa texto libre ni tiene capacidades conversacionales. Su relevancia actual es acotada y esta ligada a la reproducibilidad de experimentos de sim-to-real en manipulacion con diffusion policies, un area activa dentro del ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder visual ResNet18 por camara y horizonte de accion 64 (32 ejecutados) |
| Parametros totales | 287.533.680 (288 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (n_obs_steps = 1; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no linguistico) |
| Licencia | other |
| Formato de pesos | safetensors |
| Entradas | 3 camaras (cabeza, muneca izquierda, muneca derecha) a 240x240 + estado articular de 22 dimensiones |
| Salidas | 16 objetivos articulares a 15 Hz |
| Pasos de difusion | DDPM con 100 pasos |
| Frecuencia de control | 15 Hz |

## Arquitectura y entrenamiento

La arquitectura es una diffusion policy clasica en la linea de LeRobot: un proceso DDPM de 100 pasos que genera secuencias de acciones condicionadas por observaciones visuales y propioceptivas. Cada una de las tres camaras (cabeza y dos munecas) pasa por un encoder ResNet18 independiente; la representacion resultante se concatena con el estado articular de 22 dimensiones y alimenta el denoiser. El horizonte de prediccion es de 64 pasos, de los cuales se ejecutan 32, con un unico paso de observacion (`n_obs_steps = 1`). El entrenamiento uso Adam con tasa 1e-4, scheduler coseno, batch de 32 y semilla 1000, durante 100.000 pasos en una unica NVIDIA RTX A5000 de 24 GB a 5,2 pasos por segundo (5 h 19 min en total).

Los datos provienen de 500 episodios muestreados uniformemente (LeRobot `EpisodeAwareSampler`) del dataset de simulacion con domain randomization, totalizando 84.379 frames. La innovacion tecnica destacable es la inyeccion de ruido gaussiano de 1 grado sobre las 7 posiciones articulares del brazo izquierdo en la entrada de estado durante el entrenamiento (`state_noise_std` en `config.json`, campo anadido por el parche lerobot-cyclo del autor y que debe eliminarse para cargar con lerobot-cyclo estandar). Se aplica ademas una augmentacion de imagen agresiva en orden aleatorio, con hasta 5 de las siguientes transformaciones: brillo 0,6-1,4, contraste 0,6-1,4, saturacion 0,3-1,7, tono +-0,1, nitidez 0,3-2,0, afin +-10 grados / 10 % / 0,9-1,1, perspectiva 0,2, desenfoque, borrado aleatorio y escala de grises. Todo el entrenamiento se realizo en simulacion (Isaac Lab), sin datos reales.

## Capacidades

- Generacion de trayectorias de accion para una tarea de pick-and-place concreta: recoger un bloque verde lima con el brazo izquierdo.
- Control visuomotor multimodal: integra tres vistas de camara (cabeza y dos munecas) con el estado articular de 22 dimensiones.
- Salida de 16 objetivos articulares a 15 Hz, compatible con el robot ROBOTIS FFW SG2 y pinza ROBOTIS CAD.
- Robustez parcial a perturbaciones de estado articular gracias al ruido gaussiano de 1 grado inyectado en entrenamiento.
- Robustez a variaciones visuales por la augmentacion de imagen agresiva (iluminacion, color, geometria, oclusiones).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente motor.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- **Investigacion en sim-to-real para manipulacion**: el modelo sirve como punto de comparacion controlado para medir si reducir el dataset de entrenamiento de 10K a 500 episodios mejora la transferencia a robot real, dado que las politicas previas con DR obtenian 0 % de exito.
- **Ablacion de domain randomization**: al compartir configuracion y semilla con `dp-blockpick-regiondr500-dr-dr2-statenoise`, permite aislar el efecto del hardware (distinta GPU) sobre la reproducibilidad del entrenamiento.
- **Validacion de pipelines LeRobot**: util para verificar que un fork (lerobot-cyclo) carga y ejecuta correctamente checkpoints de diffusion policy con campos personalizados como `state_noise_std`.
- **Prototipado de tareas pick-and-place en Isaac Lab**: la tarea y el entorno estan definidos, de modo que el modelo puede evaluarse rapidamente en simulacion antes de comprometer hardware.
- **Estudio de robustez a ruido propioceptivo**: el ruido de 1 grado sobre las articulaciones permite analizar como afecta la incertidumbre de estado a la calidad de las trayectorias generadas.
- **Benchmark interno de checkpoints**: los nueve checkpoints intermedios (cada 10.000 pasos) permiten trazar curvas de aprendizaje y detectar sobreajuste en funcion del numero de pasos.
- **Docencia y divulgacion tecnica**: ejemplo reproducible y de bajo coste computacional (una sola GPU de 24 GB, 5 h de entrenamiento) para explicar diffusion policies en robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion se anadiran una vez ejecutados.

## Requisitos de hardware

- **Entrenamiento**: una NVIDIA RTX A5000 de 24 GB, 5,2 pasos/s, 5 h 19 min para 100.000 pasos con batch 32. Una GPU de 24 GB es el minimo practico observado.
- **Inferencia**: no se han publicado requisitos especificos. Por el tamano (288 M parametros, tres ResNet18 y un denoiser DDPM de 100 pasos), se espera que quepa holgadamente en GPUs consumer de 8-12 GB, aunque este dato no esta confirmado en la informacion disponible.
- **GPU recomendadas para inferencia**: no disponible de forma explicita; por analogia con modelos de este tamano, una RTX 3060/4060 o superior deberia ser suficiente, pero no hay medicion publicada.
- **Despliegue**: el modelo se carga con `DiffusionPolicy.from_pretrained(...)` de LeRobot (fork lerobot-cyclo). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput de inferencia**: no disponibles. Solo se conoce el throughput de entrenamiento (5,2 pasos/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dp-blockpick-regiondr500-dr-dr2-statenoise-run2` (este) | 288 M | horizonte 64 / 32 ejecutados, n_obs_steps 1 | Pick de bloque con brazo izquierdo, FFW SG2 | other | HuggingFace, 0 descargas |
| `padiredd/dp-blockpick-regiondr500-dr-dr2-statenoise` | 288 M (misma config) | identico | identica | other | HuggingFace |
| `padiredd/pick-cube-topdown-region10k-dr-dr2-3cam` (dataset, no modelo) | no aplica | no aplica | Dataset de 10K episodios con DR | no disponible | HuggingFace |

No se dispone de informacion sobre otros modelos comparables de terceros en la documentacion proporcionada. La comparacion mas directa es con el modelo del que es replica, del que solo difiere la GPU de entrenamiento.

## Limitaciones y advertencias

- **Modelo de proposito unico**: solo ejecuta la tarea "pick up the lime green block with the left arm" en el robot FFW SG2; no generaliza a otras tareas, objetos ni morfologias sin reentrenamiento.
- **Entrenado exclusivamente en simulacion**: no hay evidencia publicada de transferencia a robot real; de hecho, el experimento nace del 0 % de exito observado en politicas previas con DR, lo que sugiere un riesgo alto de fallo sim-to-real.
- **Sin resultados de evaluacion**: la model card no reporta metricas, por lo que no es posible afirmar ningun nivel de rendimiento.
- **Dependencia de un fork**: requiere lerobot-cyclo y el campo `state_noise_std` en `config.json`; con LeRobot estandar hay que eliminar ese campo, lo que puede alterar la carga.
- **Licencia "other"**: no se especifican los terminos exactos, por lo que el uso comercial no esta garantizado y requiere consulta con el autor.
- **Sesgos y alucinacion**: no aplican en el sentido linguistico, pero el modelo puede generar trayectorias fisicamente invalidas o inseguras ante distribuciones de entrada fuera del dominio de entrenamiento.
- **Repositorio pesado**: 11,5 GB por incluir diez checkpoints; conviene descargar solo el checkpoint necesario.
- **Cero traccion comunitaria**: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion externa.
- **Idiomas**: no aplica; no procesa lenguaje natural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/padiredd/dp-blockpick-regiondr500-dr-dr2-statenoise-run2
- Modelo replicado: https://huggingface.co/padiredd/dp-blockpick-regiondr500-dr-dr2-statenoise
- Dataset de entrenamiento: https://huggingface.co/datasets/padiredd/pick-cube-topdown-region10k-dr-dr2-3cam
- LeRobot (framework): https://github.com/huggingface/lerobot
- Isaac Lab (entorno de simulacion): https://github.com/isaac-sim/IsaacLab
- ROBOTIS FFW SG2: https://www.robotis.us/ (referencia de fabricante, no enlazada en la model card)
