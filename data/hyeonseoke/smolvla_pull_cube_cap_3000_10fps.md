# HyeonseokE/smolvla_pull_cube_cap_3000_10fps

## Resumen

Este modelo es un fine-tuning de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face, entrenado específicamente para la tarea robótica de tirar de un cubo hacia un marcador objetivo. El autor, HyeonseokE, ha ajustado el modelo base `lerobot/smolvla_base` utilizando el framework LeRobot sobre un dataset propio de 100 episodios grabados a 10 FPS, con el objetivo de demostrar el fine-tuning de SmolVLA en tareas de manipulación con hardware asequible.

La relevancia de este modelo radica en que SmolVLA está diseñado para ejecutarse en hardware de consumo, lo que permite a desarrolladores e investigadores desplegar políticas robóticas sin necesidad de infraestructura de alto coste. Este fine-tuning concreto sirve como ejemplo práctico de cómo adaptar un VLA preentrenado a una tarea específica de manipulación, con una licencia Apache 2.0 que facilita su uso comercial y académico.

El modelo consume imágenes de tres cámaras (256x256 píxeles) y el estado del robot (6 valores), y produce acciones de 6 dimensiones. Está entrenado para el robot SO-101 follower, con una arquitectura basada en transformer que combina percepción visual y control motor en un único pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basado en transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robotico, sin procesamiento de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA compacto de 450 millones de parámetros que integra procesamiento visual, razonamiento y generación de acciones en una única red. Aunque no se detallan los componentes internos en la información disponible, el paper original (arxiv:2506.01844) describe una arquitectura eficiente pensada para despliegue en hardware de consumo. Este fine-tuning parte del checkpoint `lerobot/smolvla_base` y se entrena con el framework LeRobot.

El entrenamiento se realizó sobre el dataset `HyeonseokE/pull_cube_cap_10fps`, que contiene 100 episodios y 31.714 frames a 10 FPS, con la tarea "Pull the cube to the target marker". Se usaron 24.750 pasos de entrenamiento con batch size 64, optimizador AdamW, learning rate 0.0001 y semilla 3000. La versión de LeRobot empleada fue la 0.6.0. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento posteriores al aprendizaje por imitación supervisado.

## Capacidades

- Control robotico de manipulacion: genera acciones de 6 dimensiones (posiciones articulares o del efector final) a partir de observaciones visuales y de estado.
- Percepcion multimodal: procesa tres imagenes de camaras a 256x256 píxeles junto con el estado del robot (6 valores).
- Aprendizaje por imitacion: entrenado mediante demostraciones humanas o teleoperadas, siguiendo el paradigma de LeRobot.
- Ejecucion en tiempo real: diseñado para inferencia a 10 FPS, compatible con el pipeline de rollout de LeRobot.
- No incluye capacidades de lenguaje natural, tool calling ni razonamiento conversacional; es un modelo puramente orientado a acciones robotica.

## Casos de uso

- Manipulacion robotica en laboratorio: el modelo puede ejecutar la tarea de tirar de un cubo hacia un marcador en un robot SO-101, sirviendo como base para experimentos de aprendizaje por imitacion.
- Fine-tuning para nuevas tareas: al ser un checkpoint intermedio, puede ajustarse con datasets adicionales para adaptarlo a otras tareas de manipulacion (apilar, insertar, etc.) usando el flujo de entrenamiento de LeRobot.
- Investigacion en VLA compactos: permite estudiar el rendimiento de modelos de 450M de parametros en robotica real, comparando con alternativas mas grandes.
- Prototipado rapido de politicas: con LeRobot, se puede desplegar en minutos en un robot SO-101, ideal para validar hipotesis de control.
- Educacion en robotica: sirve como ejemplo didactico de fine-tuning de un VLA, con licencia permisiva y documentacion integrada en LeRobot.
- Evaluacion de generalizacion: al estar entrenado con solo 100 episodios, es util para analizar la robustez del modelo ante variaciones de iluminacion, posicion de objetos o puntos de vista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion en robot real para esta politica.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al tratarse de un modelo de 450M de parametros en safetensors (0.9 GB), se espera que quepa en GPUs consumer con al menos 4-6 GB de VRAM en precision FP16 o FP32.
- GPU recomendadas: no se especifican, pero por el tamano del modelo, una RTX 3060 o superior deberia ser suficiente para inferencia a 10 FPS.
- Compatibilidad con consumer GPU: probablemente si, dado el objetivo de SmolVLA de desplegarse en hardware asequible.
- Opciones de despliegue: LeRobot (pipelines `lerobot-rollout` y `lerobot-train`), compatible con CUDA. No se mencionan vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles; el entrenamiento se realizo a 10 FPS, lo que sugiere que la inferencia puede alcanzar esa frecuencia en hardware adecuado.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Dataset | Licencia |
|---|---|---|---|---|
| HyeonseokE/smolvla_pull_cube_cap_3000_10fps | 450M | Tirar de un cubo hacia un marcador | 100 episodios, 10 FPS | Apache 2.0 |
| HyeonseokE/smolvla_phase1_pick_place_A1_1000_10fps | 450M | Pick and place (fase 1) | no disponible | Apache 2.0 |
| Calvert0921/smolvla_franka_liftcube_200 | 450M | Levantar un cubo con robot Franka | 200 episodios (simulacion Mani-skill) | no disponible |

Los tres son fine-tunes de `lerobot/smolvla_base` y comparten la misma arquitectura y numero de parametros. Se diferencian en la tarea, el robot y el dataset de entrenamiento. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Sin evaluacion en robot real: la model card no reporta resultados de exito en pruebas fisicas, por lo que el rendimiento real es desconocido.
- Dataset reducido: solo 100 episodios, lo que puede limitar la generalizacion a variaciones no vistas durante el entrenamiento.
- Tarea especifica: el modelo esta especializado en "tirar de un cubo hacia un marcador"; no es una politica generalista.
- Dependencia de las camaras: requiere las mismas configuraciones de camaras (top y left_wrist, aunque en inputs aparecen tres) y condiciones de iluminacion similares a las del dataset.
- Sin capacidades de lenguaje: no puede interpretar instrucciones en texto ni mantener conversaciones; es un modelo de accion pura.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el dataset de entrenamiento no tenga restricciones adicionales (no se indica en la informacion disponible).
- Fecha de creacion futura: el modelo fue subido en agosto de 2026, lo que puede indicar que es un artefacto experimental o una fecha erronea en los metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_pull_cube_cap_3000_10fps
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/pull_cube_cap_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio LeRobot: https://github.com/huggingface/lerobot
