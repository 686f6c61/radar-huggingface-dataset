# Dexverse-CSI/dexverse-dp-image

## Resumen

dexverse-dp-image es una coleccion de politicas de difusion (Diffusion Policy) para control robotico de manos diestras, publicada por Dexverse-CSI bajo la libreria LeRobot 0.4.2. No se trata de un unico modelo entrenado, sino de un conjunto de modelos independientes, uno por cada combinacion de tarea y tipo de mano robotica (wuji, shadow, inspire, allegro, leap y sharpa), entrenados sobre los conjuntos de 50 episodios de teleoperacion del dataset `Dexverse-CSI/dv-demos-v0`.

El problema que resuelve es el aprendizaje de politicas visomotoras para manipulacion diestra: el modelo recibe dos flujos de imagen (camara en tercera persona y camara en la mano), junto con el estado articular de 28 dimensiones, y predice una secuencia de acciones tambien de 28 dimensiones. La salida se ejecuta de forma reentrante sobre el robot, con un horizonte de prediccion de 16 pasos y ejecucion de 8.

Es relevante porque ofrece, con una configuracion homogenea y reproducible, resultados comparables entre seis morfologias de mano distintas sobre las mismas tareas, lo que permite analizar la transferibilidad de la politica segun el hardware. El repositorio ocupa 67,7 GB e incluye los pesos en safetensors, configuraciones, procesadores y registros de entrenamiento por cada modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy con UNet [512, 1024, 2048] y un ResNet18 por camara |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de accion de 16 pasos con ejecucion de 8 |
| Tipos de cuantizacion | no disponible; entrenamiento y pesos en fp32 |
| Idiomas soportados | no aplica (modelo visomotor) |
| Licencia | other (sin detalle adicional en la model card) |
| Formato de pesos | safetensors (con config.json, procesadores y train_config.json) |

Otros parametros tecnicos: dos camaras de entrada (third_person y eye_in_hand) a 480x640, redimensionadas a 240x320 con interpolacion bilineal y recorte aleatorio a 216x288; estado de 28 dimensiones (posiciones articulares, n_obs=2); accion de 28 dimensiones; DDPM con 100 pasos de difusion; optimizador Adam con learning rate 1e-4 y scheduler coseno; batch de 64; 300 epocas; semilla 42; sin EMA.

## Arquitectura y entrenamiento

Cada modelo sigue la Diffusion Policy oficial de LeRobot 0.4.2. La politica condiciona un proceso de difusion DDPM de 100 pasos sobre el espacio de acciones de 28 dimensiones. La observacion se codifica mediante dos codificadores visuales independientes basados en ResNet18 (uno por camara) y un vector de estado de 28 dimensiones. El denoiser es una UNet con canales [512, 1024, 2048] que fusiona las caracteristicas visuales y de estado para predecir el ruido en cada paso. En inferencia se predicen 16 acciones y se ejecutan 8, lo que da un esquema de control reentrante con solapamiento.

El entrenamiento se realizo sobre los conjuntos de teleoperacion de 50 episodios del dataset `Dexverse-CSI/dv-demos-v0`, en la ruta `v0/teleop_lerobot/<categoria>/<Task>/<robot_type>/`. Se usaron 300 epocas con Adam a 1e-4, scheduler coseno, batch 64 y fp32, sin EMA, con snapshot cada 50 epocas y semilla fija 42. El checkpoint `best` se selecciona por el mayor numero de exitos sobre los episodios pkl 0-9, resolviendo empates a favor del mas tardio. Los conjuntos de entrenamiento se ejecutaron en servidores `vast-isaac` y `a4`, segun el campo run_id de la model card. No se documentan tecnicas adicionales como RLHF, DPO ni decodificacion especulativa; el ajuste es puramente de imitacion supervisada sobre demostraciones.

## Capacidades

- Generacion de secuencias de accion de 28 dimensiones para control de manos diestras, condicionadas por estado articular y dos vistas de camara.
- Manipulacion visomotora con horizonte de prediccion de 16 pasos y ejecucion de 8, adecuada para control reentrante en bucle cerrado.
- Soporte de seis morfologias de mano: wuji, shadow, inspire, allegro, leap y sharpa, con un modelo entrenado por cada combinacion de tarea y mano.
- Ejecucion de tareas de agarre y manipulacion funcional: LiftCarton, LiftTray, HammerStrike, GraspKettle, GraspPan, PourMug, GraspTwoItems y GraspBleach.
- Capacidad bimanual en las tareas LiftCarton y LiftTray (modelos con sufijo `_bimanual`).
- No soporta tool calling, function calling, razonamiento multi-paso simbolico, generacion de texto ni procesamiento de lenguaje natural: es un modelo puramente visomotor.
- No dispone de modo thinking, vision de proposito general, audio ni capacidades multilingues.

## Casos de uso

- Manipulacion bimanual de cajas y bandejas: los modelos LiftCarton y LiftTray alcanzan tasas de exito de 1,00 y 0,92-0,94 respectivamente con manos wuji, allegro, inspire y sharpa, lo que los hace adecuados para tareas de picking y traslado en entornos de laboratorio.
- Agarre de objetos rigidos con mano shadow: el modelo GraspKettle con shadow logra 0,84 de exito, el mejor resultado de esa tarea, idoneo para escenarios donde la morfologia de la mano coincide con la del entrenamiento.
- Manipulacion funcional con herramienta: HammerStrike con mano inspire alcanza 0,94, lo que permite prototipar tareas de golpeo controlado en bancos de pruebas robotizados.
- Vertido de liquidos: PourMug con wuji y shadow obtiene 0,38 en ambos casos, util para estudiar los limites de la politica en tareas con contacto y estado continuo.
- Evaluacion comparativa de hardware: al existir un modelo por mano sobre la misma tarea, permite medir de forma controlada que morfologia aprende mejor cada habilidad, por ejemplo GraspKettle (shadow 0,84 frente a wuji 0,32).
- Investigacion en imitacion visomotora: los checkpoints `best` y `last`, junto con metrics.csv y select.log, permiten reproducir curvas de aprendizaje y analizar la seleccion de checkpoint por numero de exitos.
- Despliegue en simulacion con LeRobot: los directorios `pretrained_model` son directamente cargables por LeRobot 0.4.2 para evaluacion en entornos simulados tipo Isaac.

## Benchmarks y rendimiento

Los resultados publicados son tasas de exito de 50 rollouts por modelo, restaurando el estado inicial de los episodios pkl 0-49, con un maximo de 3000 pasos y sin semilla fija.

| Tarea | wuji | shadow | inspire | allegro | leap | sharpa |
|---|---|---|---|---|---|---|
| LiftCarton | 1,00 (50/50) | – | – | 1,00 (50/50) | – | 0,86 (43/50) |
| LiftTray | 0,92 (46/50) | – | 0,94 (47/50) | – | – | 0,92 (46/50) |
| HammerStrike | 0,64 (32/50) | 0,50 (25/50) | 0,94 (47/50) | 0,40 (20/50) | 0,26 (13/50) | 0,34 (17/50) |
| GraspKettle | 0,32 (16/50) | 0,84 (42/50) | 0,64 (32/50) | 0,58 (29/50) | 0,58 (29/50) | 0,40 (20/50) |
| GraspPan | 0,38 (19/50) | 0,42 (21/50) | 0,72 (36/50) | 0,54 (27/50) | – | – |
| PourMug | 0,38 (19/50) | 0,38 (19/50) | – | – | – | 0,28 (14/50) |
| GraspTwoItems | 0,04 (2/50) | 0,06 (3/50) | – | 0,40 (20/50) | – | 0,00 (0/50) |
| GraspBleach | 0,02 (1/50) | – | – | – | – | – |

El guion (–) indica que no habia dataset disponible o que el entrenamiento o la evaluacion seguian en curso en el momento de la actualizacion (2026-11-04 10:18 KST). No se han publicado resultados de benchmarks estandar de robotica (por ejemplo, LIBERO o Meta-World) en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 67,7 GB; cada modelo individual es un subconjunto de ese tamano.
- Los pesos estan en fp32; no se documentan versiones cuantizadas, por lo que la VRAM estimada es la correspondiente a la UNet y los dos ResNet18 en precision completa.
- No se especifican cifras de VRAM ni GPUs concretas en la model card; no disponible como dato oficial.
- Por la naturaleza del modelo (UNet de canales [512, 1024, 2048] y dos ResNet18), es previsible que quepa en GPUs de consumo, aunque el dato exacto no esta publicado.
- Despliegue previsto mediante LeRobot 0.4.2 como `pretrained_model`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Tareas | Manos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dexverse-dp-image | Diffusion Policy (DDPM, UNet) | 8 tareas | 6 morfologias | other | HuggingFace, LeRobot |
| Diffusion Policy (original, Chi et al.) | Diffusion Policy | multiple | no especifica | codigo abierto | paper y repositorio |
| ACT (Action Chunking Transformer) | Transformer de imitacion | multiple | no especifica | codigo abierto | repositorio |
| VQ-BeT | Transformer con cuantizacion vectorial | multiple | no especifica | codigo abierto | repositorio |

La comparacion directa con estas alternativas no puede hacerse con numeros porque la model card no publica resultados sobre los mismos benchmarks ni sobre las mismas tareas. dexverse-dp-image destaca por ofrecer un conjunto homogeneo de checkpoints por morfologia de mano diestra, algo que las politicas genericas no suelen cubrir de forma explicita.

## Limitaciones y advertencias

- Las tasas de exito son muy dispares segun tarea y mano: GraspBleach con wuji cae a 0,02 (1/50) y GraspTwoItems con sharpa a 0,00 (0/50), lo que desaconseja su uso en produccion para esas combinaciones.
- El modelo es de imitacion sobre 50 episodios de teleoperacion por tarea, sin refuerzo ni correccion humana posterior; es probable que generalize mal fuera de la distribucion de las demostraciones.
- No se documentan sesgos conocidos ni evaluaciones de robustez ante cambios de iluminacion, fondo u objetos.
- La licencia es "other" sin texto adicional en la model card; no se aclaran las condiciones de uso comercial, por lo que es necesario contactar con el autor antes de un despliegue productivo.
- No hay informacion sobre idiomas ni sobre capacidades de lenguaje, ya que no es un modelo linguistico.
- No se publican datos de latencia, throughput ni huella de VRAM, lo que dificulta planificar un despliegue en tiempo real.
- El campo `last` (ultima epoca) no ha sido evaluado, segun la propia model card.
- Los resultados se obtuvieron sin semilla fija en la evaluacion (hasta 3000 pasos por rollout), lo que anade variabilidad no cuantificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dexverse-CSI/dexverse-dp-image
- Dataset de demostraciones: https://huggingface.co/datasets/Dexverse-CSI/dv-demos-v0
- Libreria LeRobot: https://github.com/huggingface/lerobot
- Diffusion Policy (paper original de Chi et al.): https://arxiv.org/abs/2303.04137
- Repositorio oficial de Diffusion Policy: https://github.com/real-stanford/diffusion_policy
