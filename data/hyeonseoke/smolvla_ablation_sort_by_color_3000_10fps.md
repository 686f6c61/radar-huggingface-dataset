# HyeonseokE/smolvla_ablation_sort_by_color_3000_10fps

## Resumen

SmolVLA es un modelo vision-language-action (VLA) compacto y eficiente desarrollado por Hugging Face, disenado para reducir el coste computacional en comparacion con VLA mas grandes y poder desplegarse en hardware de consumo. Este repositorio concreto es un fine-tune de `lerobot/smolvla_base` realizado con la libreria LeRobot, orientado a una tarea de manipulacion robotica especifica: ordenar bloques por color en platos coincidentes.

El modelo fue entrenado con el dataset `HyeonseokE/ablation_sort_by_color_100_10fps`, que contiene 100 episodios y 74.450 frames a 10 FPS, recogidos en simulacion mediante SCRAPE-IsaacLab en Isaac Sim con un robot SO101 follower. Tiene 450.046.176 parametros en formato safetensors y se distribuye bajo licencia Apache 2.0.

Se trata de un modelo de accion robotica, no de lenguaje: consume imagenes de camara y estado del robot, y produce comandos de control. Al estar fine-tuneado para una unica tarea, su relevancia es principalmente como punto de partida para investigacion en VLA compactos y aprendizaje por imitacion en entornos simulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA, con codificador visual, modelo de lenguaje y cabeza de accion |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo VLA de accion robotica, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (modelo de accion robotica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un codificador de vision con un modelo de lenguaje y una cabeza de accion, generando comandos de control continuos a partir de observaciones visuales y del estado del robot. Este fine-tune parte del modelo base `lerobot/smolvla_base` y fue entrenado con LeRobot version 0.6.0. El dataset de entrenamiento se compone de 100 episodios (74.450 frames a 10 FPS) simulados con SCRAPE-IsaacLab en Isaac Sim, con la tarea de ordenar bloques por color en platos coincidentes.

La configuracion de entrenamiento incluye 58.150 pasos, batch size 64, optimizador AdamW, learning rate 0.0001 y semilla 3000. El modelo consume observaciones de estado con forma `(6,)` y tres entradas visuales de `(3, 256, 256)`, aunque la model card indica que las camaras del robot son `top` y `left_wrist`. No se menciona RLHF ni DPO; el entrenamiento es por imitacion a partir de demostraciones.

## Capacidades

- Generacion de acciones robotica: produce vectores de accion de 6 dimensiones para controlar un robot SO101 follower, incluyendo `action` y `action.radian_urdf0`.
- Percepcion visual: procesa imagenes de camara de 256x256 píxeles, con soporte para multiples entradas visuales.
- Ejecucion de tareas de ordenacion: esta especificamente entrenado para clasificar bloques por color en platos coincidentes.
- Integracion con LeRobot: soporta inferencia (rollout) y reentrenamiento mediante la libreria LeRobot, con comandos CLI documentados.
- Despliegue en hardware de consumo: al ser un modelo compacto (0.9 GB), puede ejecutarse en tarjetas graficas de gama media o inferior.
- Sin capacidades de lenguaje: no genera texto, no responde a prompts de chat y no soporta tool calling ni agentes conversacionales.

## Casos de uso

- Automatizacion de clasificacion en almacenes: el modelo puede controlar un brazo robotico para ordenar objetos por color en contenedores, reduciendo la intervencion manual en tareas repetitivas de picking y sorting.
- Investigacion en aprendizaje por imitacion: sirve como referencia para estudiar como los VLA compactos se comportan en tareas de manipulacion, permitiendo comparar politicas entrenadas en simulacion con datos reales.
- Roboica educativa: al desplegarse en un robot SO101 follower, puede utilizarse en laboratorios academicos para demostrar control robotico basado en vision y accion.
- Benchmark de politicas de control: su fine-tune para una tarea concreta lo convierte en un caso de estudio para evaluar metodos de entrenamiento por imitacion en simulacion.
- Prototipado rapido de nuevas politicas: partiendo del modelo base, se puede fine-tunear para otras tareas de manipulacion con relativamente pocos episodios, gracias a su tamano reducido.
- Sistemas de vision y accion integrados: puede integrarse como componente de un sistema robotico mas amplio que requiera un modulo de decision basado en imagenes y estado del robot.
- Despliegue en robots de bajo coste: su tamano compacto permite ejecutarlo en GPUs de consumo, habilitando aplicaciones de robotica en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 0.9 GB en safetensors, por lo que la inferencia deberia caber en 2-4 GB de VRAM, aunque la cifra exacta depende de la implementacion y el batch.
- GPU recomendadas: tarjetas de gama media como RTX 3060 o RTX 4090 son suficientes; no se requieren H100 ni A100.
- Compatibilidad con GPU de consumo: si, al ser un modelo compacto, puede ejecutarse en tarjetas graficas de consumo habitual.
- Opciones de despliegue: se ejecuta con el stack de LeRobot mediante `lerobot-rollout`; no es aplicable con vLLM, TGI ni llama.cpp, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyeonseokE/smolvla_ablation_sort_by_color_3000_10fps | 450.046.176 | No aplica | Ordenar bloques por color | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | No disponible (modelo base) | No aplica | Modelo base VLA | Apache 2.0 | Hugging Face |
| HyeonseokE/smolvla_phase1_sort_by_color_A2_via4cm_3000_10fps | No disponible | No aplica | Variante de la misma tarea con otra configuracion | Apache 2.0 | Hugging Face |

El modelo es un fine-tune del base model `lerobot/smolvla_base`, por lo que la comparacion directa de rendimiento no es posible sin evaluaciones publicadas. No se dispone de datos de benchmarks para comparar con alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo esta fine-tuneado exclusivamente para la tarea de ordenar bloques por color; no generaliza a otras tareas de manipulacion sin reentrenamiento.
- No se han publicado evaluaciones en robot real, solo entrenamiento en simulacion (Isaac Sim), lo que implica un riesgo de sim-to-real gap al desplegar en entornos fisicos.
- Dependencia de la configuracion de camaras: las observaciones deben coincidir con las del entrenamiento; la model card menciona camaras `top` y `left_wrist`, aunque la tabla de entradas lista tres camaras.
- No es un modelo de lenguaje: no puede utilizarse para tareas de procesamiento de texto, chat ni generacion de codigo.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable verificar la licencia del modelo base y del dataset utilizado.
- El dataset de entrenamiento es limitado (100 episodios) y esta recogido en simulacion, lo que puede introducir sesgos en la distribucion de objetos, colores y posiciones.
- No se dispone de resultados de evaluacion oficiales, por lo que el rendimiento real en tareas fisicas es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_ablation_sort_by_color_3000_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/ablation_sort_by_color_100_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/ablation_sort_by_color_100_10fps
- Ficha del dataset en Claru: https://claru.ai/datasets/hyeonseoke-ablation-sort-by-color-100-10fps
