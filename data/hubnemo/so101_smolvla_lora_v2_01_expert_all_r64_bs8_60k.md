# hubnemo/so101_smolvla_lora_v2_01_expert_all_r64_bs8_60k

## Resumen

SO101 SmolVLA LoRA v2 es un adaptador LoRA de un modelo vision-language-action (VLA) compacto llamado SmolVLA, publicado por el usuario hubnemo sobre el modelo base `lerobot/smolvla_base`. SmolVLA es un modelo de politica robotica desarrollado en el ecosistema LeRobot de Hugging Face que combina un codificador visual, un modelo de lenguaje pequeno y un decodificador de acciones para generar comandos motores a partir de observaciones visuales y de estado. Este adaptador concreto ha sido ajustado para la tarea de recoger un cubo morado e introducirlo en una caja de carton, ignorando el resto de objetos.

El modelo resuelve el problema de la manipulacion robotica mediante imitation learning: dado un flujo de camara frontal y el estado articular de un brazo SO101 de seis grados de libertad, predice acciones de seis dimensiones a 30 FPS. Su relevancia radica en que demuestra que un VLA compacto con ajuste fino LoRA puede ejecutarse en hardware de consumo, lo que abarata el despliegue de politicas de robotica en laboratorios y entornos educativos.

La informacion disponible es limitada: el repositorio pesa 0,1 GB, no tiene descargas ni likes, y la model card no incluye resultados de evaluacion ni detalles sobre el numero de parametros o la longitud de contexto. La licencia es Apache 2.0 y la libreria de inferencia es LeRobot 0.7.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta; adaptador LoRA sobre `lerobot/smolvla_base` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de texto general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura VLA compacta que procesa observaciones multimodales (imagenes de camara y estado articular) y emite acciones continuas. En este caso, el adaptador LoRA se ha entrenado sobre el modelo base `lerobot/smolvla_base` con rango r64, batch size 8, optimizador AdamW, learning rate 0,0005, semilla 1000 y 60.000 pasos de entrenamiento, usando LeRobot 0.7.1. El nombre del repositorio sugiere una configuracion "expert_all" con rango 64.

El dataset de entrenamiento es `Orellius/so101_sort_cubes_no_top`, compuesto por 77 episodios y 54.777 frames a 30 FPS. La unica tarea descrita es "Grab the purple cube and put it into the cardboard box, ignore the other objects". El modelo consume `observation.state` con forma `(6,)` y `observation.images.front` con forma `(3, 480, 640)`, y produce `action` con forma `(6,)`. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion proporcionada.

## Capacidades

- Generacion de acciones motoras continuas de 6 dimensiones para un brazo robotico SO101.
- Percepcion visual a partir de una camara frontal a resolucion 640x480.
- Condicionamiento por instruccion en lenguaje natural (la tarea se pasa como texto al ejecutar la politica).
- Ejecucion de tareas de manipulacion tipo pick-and-place con objetos especificos.
- Inferencia en tiempo real a 30 FPS segun la frecuencia del dataset de entrenamiento.
- Despliegue mediante la CLI `lerobot-rollout` con la estrategia base.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo thinking.

## Casos de uso

- Clasificacion de cubos en linea de montaje educativa: el modelo identifica el cubo morado entre distractores y lo deposita en una caja de carton, adecuado para practicas de robotica en laboratorios docentes con brazos SO101.
- Demostracion de imitation learning con LoRA: sirve como ejemplo reproducible de ajuste fino eficiente sobre un VLA base, ya que el adaptador ocupa solo 0,1 GB y se entrena con 77 episodios.
- Prototipado rapido de politicas pick-and-place: el flujo `lerobot-rollout` permite validar en robot real en minutos sin reentrenar desde cero.
- Benchmark interno de manipulacion: util como linea base para comparar variantes de aumento de datos o cambios de iluminacion en la misma tarea.
- Investigacion en adaptacion de dominio: al ser un adaptador LoRA sobre un modelo base publico, permite estudiar como el ajuste fino con datasets pequenos altera el comportamiento del VLA.
- Automatizacion de tareas de recogida en entornos controlados: con una sola camara frontal y estado articular de 6 dimensiones, el coste de sensores es minimo, lo que facilita despliegues de bajo presupuesto.
- Educacion en robotica: el modelo y el dataset estan publicados con licencia Apache 2.0, lo que permite usarlos en cursos y talleres sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 0,1 GB, lo que sugiere que el adaptador es ligero, pero el modelo base requiere memoria adicional no especificada.
- GPU recomendadas: no disponible en la informacion proporcionada; SmolVLA se describe como desplegable en hardware de consumo.
- Compatibilidad con GPU de consumo: el paper de SmolVLA afirma despliegue en hardware de consumo, aunque no se detallan modelos concretos.
- Opciones de despliegue: CLI `lerobot-rollout` con `--strategy.type=base`, libreria LeRobot 0.7.1; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de robotica).
- Latencia y throughput: no disponibles; la frecuencia del dataset es 30 FPS, pero no se confirma que la inferencia alcance esa tasa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hubnemo/so101_smolvla_lora_v2_01_expert_all_r64_bs8_60k | no disponible | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_base | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Otros VLA comparables (p. ej. OpenVLA, pi0) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Entrenado para una unica tarea y un unico tipo de robot (`so101_follower`); no generaliza a otras tareas sin reentrenamiento.
- Requiere que los nombres de camara coincidan con `observation.images.front`; un desajuste en la configuracion de camaras impide la inferencia correcta.
- Sin resultados de evaluacion publicados: no hay evidencia cuantitativa de tasa de exito en robot real.
- Dataset pequeno (77 episodios, 54.777 frames) y una sola tarea, lo que aumenta el riesgo de sobreajuste a posiciones, iluminacion y objetos concretos del dataset.
- Posible sensibilidad a cambios de iluminacion, posicion de objetos o presencia de distractores no vistos durante el entrenamiento.
- No se documentan sesgos, pero al ser un modelo de robotica los riesgos se centran en fallos de manipulacion fisica (colisiones, agarres fallidos) mas que en sesgos linguisticos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion hace recomendable validar en el entorno de destino antes de produccion.
- No se especifican idiomas soportados ni capacidades de texto general; no debe usarse como modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hubnemo/so101_smolvla_lora_v2_01_expert_all_r64_bs8_60k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Orellius/so101_sort_cubes_no_top
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Orellius/so101_sort_cubes_no_top
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
