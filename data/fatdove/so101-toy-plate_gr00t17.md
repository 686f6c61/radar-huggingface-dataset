# fatdove/so101-toy-plate_GR00T17

## Resumen

Esta ficha describe `fatdove/so101-toy-plate_GR00T17`, una politica de robotica (vision-language-action) entrenada con LeRobot y publicada en HuggingFace por el usuario `fatdove`. No es un modelo de lenguaje de proposito general: es un checkpoint de control para un brazo robotico SO-101 en configuracion `so_follower`, especializado en una unica tarea de manipulacion descrita en el dataset como "Pick up the brown toy rabbit and place it in the white plate". El modelo parte de la arquitectura abierta GR00T N1.7 de NVIDIA, que combina un backbone Cosmos-Reason2/Qwen3-VL con un transformer de acciones por flow matching, y lo ajusta sobre un corpus de 50 episodios y 26.950 fotogramas grabados a 30 FPS.

El checkpoint tiene 3.144.016.000 parametros (dato real de los safetensors) y ocupa 12,6 GB en el repositorio, en formato safetensors y con licencia Apache 2.0. Su relevancia es practica: demuestra el flujo completo de ajuste de un modelo fundacional cross-embodiment de NVIDIA sobre hardware de robotica de bajo coste con la libreria LeRobot 0.6.1, lo que permite reproducir el entrenamiento y desplegar la politica en un SO-101 real con dos camaras (frontal y de muneca).

Es un modelo con cero descargas y cero likes en el momento de la consulta, y su model card no incluye resultados de evaluacion en robot real. Por tanto, debe tratarse como un checkpoint experimental y reproducible, no como una politica validada en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone vision-language Cosmos-Reason2/Qwen3-VL mas transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Longitud de contexto | no disponible (no se documenta ventana de contexto; la politica consume estado de 6 dimensiones y dos imagenes de 480x640) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se listan variantes GGUF, AWQ ni similares) |
| Idiomas soportados | no disponible (la tarea se especifica en ingles en los ejemplos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot 0.6.1 |
| Pipeline | robotics |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `front`, `wrist` |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 12,6 GB |
| Fecha de creacion | 2026-09-30 |
| Fecha de ultima actualizacion | 2026-09-30 |

## Arquitectura y entrenamiento

La arquitectura subyacente es GR00T N1.7, un modelo fundacional abierto de NVIDIA para razonamiento y habilidades de robots humanoides descrito como cross-embodiment. Segun la model card, emplea un backbone Cosmos-Reason2/Qwen3-VL y un transformer de acciones basado en flow matching que predice acciones condicionadas por vision, lenguaje y propriocepcion. Este checkpoint concreto es un ajuste de esa base para una morfologia de brazo SO-101 con 6 dimensiones de estado y 6 dimensiones de accion, alimentado por dos flujos de imagen de 480x640 (camara frontal y camara de muneca).

El entrenamiento se realizo con LeRobot sobre el dataset `fatdove/so101-toy-plate`: 50 episodios, 26.950 fotogramas, 30 FPS y una unica tarea de pick-and-place. La configuracion declarada es de 20.000 pasos, batch de 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 42. No se documenta en la informacion disponible el numero total de tokens, la composicion del dataset, ni si hubo fases de RLHF o DPO; al tratarse de aprendizaje por imitacion supervisado (behavior cloning sobre demostraciones), no se menciona ningun metodo de alineacion por preferencias. Tampoco se detallan innovaciones adicionales como decodificacion especulativa o atencion lineal aplicadas a este checkpoint.

## Capacidades

- Generacion de acciones de manipulacion de 6 grados de libertad para un brazo SO-101 en configuracion follower, condicionadas por dos imagenes y el estado de las articulaciones.
- Ejecucion de una tarea concreta de pick-and-place: "Pick up the brown toy rabbit and place it in the white plate".
- Percepcion visual multi-camara con dos entradas simultaneas de 480x640 a 30 FPS (vista frontal y vista de muneca).
- Condicionamiento por instruccion en lenguaje natural a traves del backbone vision-language: la tarea se pasa como cadena de texto en el comando de rollout.
- Control a nivel de politica (end-to-end) sin planificador simbolico externo, segun el flujo descrito por LeRobot.
- Soporte de tool calling / function calling: no disponible; no aplica a una politica de robotica.
- Soporte de agentes y razonamiento multi-paso autonomo: no disponible en la informacion publicada para este checkpoint.
- Capacidades multilingues: no disponible.
- Modo thinking, vision de proposito general, audio: no disponible; el modelo esta ajustado para una tarea de manipulacion, no para tareas cognitivas generales.
- Reentrenamiento reproducible: el mismo flujo permite ajustar la politica sobre otros datasets con `lerobot-train` y `--policy.type=groot`.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio educativo: con un SO-101 y dos camaras, la politica ejecuta la recogida del conejo de juguete y su deposito en el plato con `lerobot-rollout` y `--strategy.type=base`, sin grabacion de episodios.
- Banco de pruebas de GR00T N1.7 sobre hardware de bajo coste: permite medir como se comporta un modelo fundacional cross-embodiment de 3,14 mil millones de parametros en un brazo de aficionado en lugar de en un humanoide completo.
- Reproduccion de experimentos de imitation learning: al estar publicados dataset, hiperparametros y semilla (20.000 pasos, batch 64, AdamW, lr 1e-4, semilla 42), sirve como referencia reproducible en talleres y cursos de robotica.
- Generacion de checkpoints derivados: reentrenar con `lerobot-train` sobre el mismo dataset o variantes para comparar el efecto de la posicion inicial de los objetos, la iluminacion o la presencia de distractores.
- Validacion de configuraciones de vision multi-camara: su dependencia de dos claves de observacion (`front` y `wrist`) lo hace util para comprobar el alineamiento de nombres de camara, calibracion e indices antes de escalar a politicas mas complejas.
- Base para flujos sim-to-real con SO-101: el modelo puede integrarse en un pipeline que transfiera una politica entrenada en simulacion al brazo fisico, usando el checkpoint como punto de partida o de comparacion.
- Demostraciones en ferias y jornadas tecnicas: el comando de rollout admite `--duration=60` para ejecuciones controladas de un minuto, adecuado para presentaciones con supervision.
- Evaluacion comparativa entre variantes: junto con otros checkpoints del mismo autor, como `fatdove/so101-cube-bowl_GR00T17`, permite contrastar el comportamiento de la misma base GR00T N1.7 en tareas distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La seccion de evaluacion de la model card indica explicitamente: "No evaluation results have been provided for this policy yet". No existen datos de tasa de exito, numero de ensayos ni condiciones de prueba (posiciones nuevas, iluminacion, distractores o robots distintos). Tampoco se han publicado metricas de MMLU, HumanEval o GSM8K, que no aplican a una politica de manipulacion robotica.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del numero real de parametros (3.144.016.000): aproximadamente 5,9 GiB en bf16/fp16 y aproximadamente 11,7 GiB en fp32. El repositorio pesa 12,6 GB, coherente con pesos en 32 bits.
- Estas cifras no contemplan activaciones, el backbone vision-language ni los dos flujos de imagen de 480x640, por lo que el consumo real en ejecucion sera superior; no hay requisitos oficiales publicados.
- GPU recomendadas: no especificadas por el autor. Por tamano, una A100, H100, L40S o RTX 4090 son opciones holgadas; una RTX 3090 o 4090 permiten cargar los pesos sin cuantizar.
- Compatibilidad con GPU de consumo: previsiblemente si, en tarjetas con 8-16 GB de VRAM (RTX 3060 12 GB, 4060 Ti 16 GB, 4070, 3090, 4090), siempre segun la estimacion anterior y sin datos oficiales de consumo pico.
- Opciones de despliegue: LeRobot, mediante `lerobot-rollout` para inferencia en robot y `lerobot-train` para reentrenamiento. El comando de entrenamiento de ejemplo fija `--policy.device=cuda`, por lo que se asume GPU NVIDIA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una politica de robotica.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se grabo a 30 FPS, lo que sugiere una frecuencia de control de referencia de 30 Hz, pero no se han publicado mediciones de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / morfologia | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fatdove/so101-toy-plate_GR00T17` | 3.144.016.000 | SO-101 follower, 2 camaras, estado y accion de 6 dimensiones | Pick up the brown toy rabbit and place it in the white plate | Apache 2.0 | Publicado en HuggingFace, 0 descargas |
| `fatdove/so101-cube-bowl_GR00T17` | no disponible | SO-101, no disponible | no disponible | no disponible | Publicado en HuggingFace |
| NVIDIA GR00T N1.7 (modelo base) | no disponible en la informacion proporcionada | Cross-embodiment, humanoides | Razonamiento y habilidades generalizadas de manipulacion | no disponible en la informacion proporcionada | Repositorio `NVIDIA/Isaac-GR00T` y fork `ZebinJiang/Isaac-GR00T17` en GitHub |

No se dispone de datos de rendimiento comparado entre estas alternativas. Otras politicas de la familia LeRobot (por ejemplo, las basadas en pi0 o en arquitecturas ACT y diffusion policy) serian comparables funcionalmente, pero no se han recuperado especificaciones de ellas en la informacion disponible, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Entrenado para una unica tarea y sobre un dataset reducido: 50 episodios y 26.950 fotogramas. El riesgo de sobreajuste al entorno concreto de grabacion (posiciones, iluminacion, fondo) es alto.
- No hay evaluacion publicada: se desconoce la tasa de exito real de la politica sobre el robot fisico.
- Sensibilidad esperable a cambios de posicion de los objetos, condiciones de iluminacion, distractores en escena y variaciones mecanicas entre unidades del mismo modelo de robot.
- Dependencia estricta de la interfaz de observacion: requiere las claves `observation.images.front` y `observation.images.wrist` con imagenes de 3x480x640, ademas de `observation.state` de 6 dimensiones. Un desajuste en nombres, indices o calibracion de camara impide la ejecucion.
- Idiomas soportados no declarados. La tarea se especifica en ingles en los ejemplos de la model card, por lo que el comportamiento con instrucciones en castellano no esta verificado.
- Riesgo de alucinacion en el sentido de acciones fisicas incorrectas: al ser una politica end-to-end, puede generar secuencias de accion invalidas o colisiones sin senal de incertidumbre. No se documentan mecanismos de parada de seguridad ni limites articulares.
- Licencia Apache 2.0 declarada para este checkpoint, lo que en principio permite uso comercial. Sin embargo, el modelo deriva de GR00T N1.7 de NVIDIA y de pesos Qwen3-VL; conviene verificar las condiciones del modelo base en su repositorio oficial antes de un uso comercial.
- No se publican cuantizaciones, por lo que las opciones de reducir la huella de memoria estan limitadas a conversion propia.
- La politica no incluye capas de seguridad, planificacion ni supervision humana; en un entorno real requiere limites de par de motores, parada de emergencia y espacio de trabajo acotado.
- Advertencia de integridad: el comando de ejemplo de la model card contiene marcadores `<...>` que deben sustituirse por el puerto del robot y los indices de camara locales; ejecutarlo sin editar fallara.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fatdove/so101-toy-plate_GR00T17
- Dataset de entrenamiento: https://huggingface.co/datasets/fatdove/so101-toy-plate
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fatdove/so101-toy-plate
- Modelo hermano del mismo autor: https://huggingface.co/fatdove/so101-cube-bowl_GR00T17
- Dataset adicional del mismo autor: https://huggingface.co/datasets/fatdove/so101-toy-plate_20260929_230808
- Repositorio oficial de NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Fork de referencia de Isaac GR00T N1.7: https://github.com/ZebinJiang/Isaac-GR00T17
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Curso de sim-to-real con SO-101 de NVIDIA: https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/datasets-and-models.html
- Citation de LeRobot (2024), Cadene et al.: https://github.com/huggingface/lerobot
