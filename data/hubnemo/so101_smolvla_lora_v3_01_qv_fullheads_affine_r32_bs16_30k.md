# hubnemo/so101_smolvla_lora_v3_01_qv_fullheads_affine_r32_bs16_30k

## Resumen

`hubnemo/so101_smolvla_lora_v3_01_qv_fullheads_affine_r32_bs16_30k` es un adaptador LoRA de tipo vision-language-action (VLA) para control robotico, obtenido mediante fine-tuning del modelo base `lerobot/smolvla_base`. Lo publica el usuario `hubnemo` a traves de la libreria LeRobot y esta orientado a una tarea concreta de manipulacion: coger un cubo morado e introducirlo en una caja de carton ignorando el resto de objetos, sobre un robot `so101_follower` con una unica camara frontal.

El modelo hereda la arquitectura SmolVLA descrita en el paper arXiv:2506.01844, un VLA compacto disenado para ejecutarse en hardware de consumo. En este repositorio el componente entrenado es un adaptador LoRA (rango 32) sobre las cabezas de atencion, segun se deduce del nombre del checkpoint, no un modelo completo. El repositorio tiene un tamano declarado de 0.0 GB, lo que es coherente con un adaptador de pocos parametros mas que con pesos completos.

Su relevancia es acotada y practica: sirve como referencia reproducible de un pipeline de imitation learning en LeRobot (grabacion de 77 episodios, entrenamiento de 30 000 pasos, despliegue con `lerobot-rollout`) para una tarea de picking concreta. No es un modelo de proposito general ni sustituye al VLA base; es una politica especializada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), fine-tuning con adaptador LoRA r=32 sobre cabezas de atencion |
| Parametros totales | no disponible (adaptador LoRA sobre `lerobot/smolvla_base`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de accion robotica; la instruccion de tarea se da en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

El modelo base SmolVLA combina un codificador visual, un modelo de lenguaje compacto y una cabeza de prediccion de acciones, generando directamente vectores de accion de 6 dimensiones a partir de observaciones visuales y de estado. El adaptador publicado se entrena con el nombre `lora_v3_01_qv_fullheads_affine_r32`: rango LoRA 32, modulos de atencion Q/V y cabezas completas, con transformacion afina. La observacion de entrada es `observation.state` de forma `(6,)` mas una imagen `observation.images.front` de `(3, 480, 640)` a 30 FPS; la salida es `action` de forma `(6,)`.

El entrenamiento se realizo sobre el dataset `Orellius/so101_sort_cubes_no_top`: 77 episodios, 54 777 frames a 30 FPS, con la instruccion "Grab the purple cube and put it into the cardboard box, ignore the other objects". Configuracion: 30 000 pasos, batch size 16, optimizador AdamW, learning rate 0.0005, semilla 1000, LeRobot 0.7.1. No se documenta composicion adicional del dataset, ni uso de RLHF/DPO (no aplica en imitation learning), ni tecnicas de decodificacion especulativa.

## Capacidades

- Prediccion de acciones de manipulacion de 6 grados de libertad a partir de imagen frontal y estado del robot.
- Ejecucion de una tarea de picking-and-place concreta: coger el cubo morado e introducirlo en una caja de carton.
- Discriminacion de objetos irrelevantes dentro de la escena (la instruccion pide ignorar el resto de objetos).
- Control reactivo a 30 FPS, alineado con la frecuencia de captura del dataset.
- Integracion nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, agentes multi-paso, razonamiento simbolico ni capacidades multilingues generales.

## Casos de uso

- Replicacion de la tarea de ordenacion de cubos: desplegar la politica en un `so101_follower` con camara frontal para recoger el cubo morado y depositarlo en la caja, usando exactamente la instruccion de entrenamiento.
- Punto de partida para fine-tuning: reutilizar el adaptador como inicializacion en tareas de picking similares con el mismo robot, reduciendo pasos de entrenamiento frente a partir del modelo base.
- Validacion de pipelines LeRobot: usar el checkpoint como caso de prueba reproducible de `lerobot-rollout` y `lerobot-train` en entornos de integracion.
- Docencia y demostraciones de imitation learning: ejemplo completo de grabacion de 77 episodios, entrenamiento de 30 000 pasos y despliegue, con hiperparametros documentados.
- Benchmark interno de manipulacion: comparar tasas de exito de este adaptador frente a otros adaptadores sobre `smolvla_base` en la misma tarea.
- Pruebas de robustez visual: evaluar como varia el comportamiento ante cambios de iluminacion, posicion del cubo o presencia de distractores, dado que el dataset no incluye variaciones documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un adaptador LoRA sobre SmolVLA, los requisitos son los del modelo base `lerobot/smolvla_base`, que segun el paper esta disenado para hardware de consumo; no se aportan cifras concretas.
- GPU recomendadas: no disponible en la informacion proporcionada. El paper de SmolVLA indica despliegue en hardware de consumo, sin especificar modelos.
- Compatibilidad con GPU de consumo: previsiblemente si, por el diseno del modelo base, pero sin cifras verificables en esta ficha.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) con `--policy.path` apuntando al repositorio; entrenamiento con `lerobot-train`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a politicas de accion.
- Latencia y throughput: no disponible; el control opera a 30 FPS segun la frecuencia del dataset, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hubnemo/so101_smolvla_lora_v3_01_qv_fullheads_affine_r32_bs16_30k` | Adaptador LoRA sobre SmolVLA para tarea de picking | no disponible | no disponible | Apache 2.0 | Hugging Face |
| `lerobot/smolvla_base` | VLA base SmolVLA | no disponible en esta ficha | no disponible | no disponible en esta ficha | Hugging Face |
| Otros adaptadores SO101 sobre SmolVLA | Adaptadores LoRA para tareas de manipulacion | no disponible | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Politica especializada en una unica tarea y un unico robot (`so101_follower`) con una sola camara frontal; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluacion publicados: no hay tasa de exito medida, por lo que el rendimiento real es desconocido.
- Dataset limitado a 77 episodios y 54 777 frames, sin documentacion de variabilidad de posiciones, iluminacion o distractores; riesgo de sobreajuste al entorno de grabacion.
- El repositorio declara 0.0 GB de tamano, lo que puede indicar que los pesos del adaptador no estan efectivamente subidos o que el calculo de tamano no se ha actualizado; conviene verificar los ficheros antes de desplegar.
- Las camaras y el puerto del robot deben configurarse manualmente y los nombres de camara deben coincidir con las claves de observacion del entrenamiento (`observation.images.front`).
- Licencia Apache 2.0 permite uso comercial, pero el modelo base `lerobot/smolvla_base` debe verificarse por separado.
- No apta para razonamiento linguistico, generacion de texto ni tareas fuera del dominio robotico.
- Riesgo de fallo ante objetos, colores o disposiciones distintas a las del dataset; la instruccion de tarea esta en ingles y no se documenta soporte multilingue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hubnemo/so101_smolvla_lora_v3_01_qv_fullheads_affine_r32_bs16_30k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Orellius/so101_sort_cubes_no_top
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guia LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Orellius/so101_sort_cubes_no_top
