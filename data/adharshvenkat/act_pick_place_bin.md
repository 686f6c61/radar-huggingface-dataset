# adharshvenkat/act_pick_place_bin

## Resumen

Este modelo es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), desarrollada por Adharsh Venkatachalam y entrenada con el framework LeRobot de Hugging Face. Está diseñada para una tarea concreta de manipulación robótica: recoger un objeto y colocarlo en un contenedor, sobre un robot de tipo `so_follower` equipado con una cámara frontal.

ACT es un método propuesto en el paper "Action Chunking with Transformers" (arxiv:2304.13705) que, en lugar de predecir un único paso de acción, predice secuencias cortas de acciones (chunks) a partir de la observación actual. Esto mejora la consistencia temporal y la estabilidad de los movimientos, y ha demostrado altas tasas de éxito en tareas teleoperadas. El modelo tiene 51.668.614 parámetros y se entrena con datos de demostraciones humanas teleoperadas, lo que lo hace relevante para aplicaciones de robótica donde se dispone de datos de demostración limitados pero se requieren políticas robustas para tareas repetitivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT), transformer con encoder-decoder y CVAE |
| Parametros totales | 51.668.614 |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo implementa el método ACT, que combina un transformer con un enfoque de autocodificador variacional condicional (CVAE) para modelar la distribución de acciones. El predictor produce fragmentos de acciones (action chunks) en lugar de acciones individuales, lo que reduce la acumulación de errores en entornos de control continuo. La arquitectura consume dos observaciones: un vector de estado de 6 dimensiones (`observation.state`) y una imagen RGB de la cámara frontal de 3×480×640 píxeles (`observation.images.front`). La salida es un vector de acción de 6 dimensiones.

El entrenamiento se realizó con el framework LeRobot versión 0.6.1, utilizando el dataset `adharshvenkat/pick_place_bin_20260905_234142`, compuesto por 50 episodios teleoperados y 44.867 frames a 30 FPS. La configuración de entrenamiento incluye 50.000 pasos, un tamaño de lote de 8, el optimizador AdamW con una tasa de aprendizaje de 1e-5 y una semilla de 1000. No consta que se hayan aplicado técnicas de RLHF o DPO; el modelo se entrena exclusivamente por imitación de demostraciones.

## Capacidades

- Generación de políticas de control para robótica de manipulación, capaces de predecir secuencias de acciones para ejecutar tareas de pick and place.
- Procesamiento de entradas multimodales: estado del robot (6 dimensiones) e imágenes de una cámara frontal (RGB, 480×640).
- Ejecución de acciones en el robot `so_follower`, con salidas de 6 dimensiones que probablemente corresponden a posiciones objetivo de articulaciones o del efector final.
- Soporte de despliegue mediante LeRobot, tanto para inferencia (`lerobot-rollout`) como para reentrenamiento (`lerobot-train`).
- No dispone de soporte de tool calling, function calling ni capacidades de lenguaje.
- No incluye modo de razonamiento especializado o capacidades de visión más allá de la observación visual directa para el control.

## Casos de uso

- Automatización de tareas repetitivas en almacenes: el modelo puede ejecutar de forma autónoma la tarea de recoger objetos y colocarlos en contenedores, reduciendo la necesidad de intervención humana en procesos logísticos.
- Investigación en aprendizaje por imitación: sirve como baseline para comparar el rendimiento de métodos de imitación como ACT frente a otras arquitecturas, utilizando el dataset de pick and place.
- Integración en pipelines de LeRobot: puede desplegarse en un robot real mediante el comando `lerobot-rollout`, permitiendo probar la política en hardware con una configuración mínima.
- Entrenamiento de nuevos datos: el modelo puede servir como punto de partida para fine-tuning en tareas similares, gracias a su arquitectura compacta y su integración con LeRobot.
- Evaluación de robustez visual: el modelo fue entrenado solo con cámara frontal, por lo que es útil para estudiar cómo afecta la observabilidad parcial (partes del robot fuera del encuadre) al rendimiento de la política.
- Demostraciones de robots de bajo coste: dado su tamaño reducido, puede ejecutarse en configuraciones de hardware modestas, lo que lo hace adecuado para prototipos y entornos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se proporcionan resultados de evaluación reales del robot para esta política.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware en la información proporcionada. Al tener 51.668.614 parámetros, la huella del modelo es pequeña, pero el consumo real de VRAM durante la inferencia depende de la resolución de las imágenes y del tamaño de lote.
- Dado el tamaño del modelo, es plausible que quepa en GPUs de consumo como una NVIDIA RTX 3060 (8 GB) o similares, aunque no hay datos oficiales que lo confirmen.
- El despliegue se realiza a través de LeRobot, que soporta inferencia en GPU con `--policy.device=cuda` y también en CPU para pruebas sencillas.
- No se han publicado datos de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `adharshvenkat/act_pick_place_bin` | 51.668.614 | No disponible | Pick and place en contenedor (cámara frontal) | Apache-2.0 | Hugging Face |
| `aadarshram/act_pick_place_tape` | No disponible | No disponible | Pick and place de cinta (cámara frontal) | No disponible | Hugging Face |

No se dispone de información sobre modelos comparables adicionales en la misma categoría y tamaño dentro de los datos proporcionados.

## Limitaciones y advertencias

- No existen resultados de evaluación publicados, por lo que su rendimiento real en robot no está verificado.
- El modelo fue entrenado con un dataset pequeño (50 episodios) y una sola tarea específica, lo que limita su capacidad de generalización a objetos, posiciones o iluminación diferentes.
- Al utilizar únicamente una cámara frontal, el robot puede quedar fuera del encuadre durante el movimiento, lo que reduce la observabilidad y puede afectar a la fiabilidad de la política.
- No se han documentado sesgos conocidos, pero la dependencia de la teleoperación puede heredar sesgos del operador humano.
- La licencia Apache-2.0 permite el uso comercial, pero el modelo no ha sido validado en entornos de producción.
- No se han proporcionado los datos de cuantización ni los requisitos exactos de recursos, por lo que cualquier despliegue debe ser probado en el hardware objetivo.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/adharshvenkat/act_pick_place_bin
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Framework LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/adharshvenkat/pick_place_bin_20260905_234142
- Modelo similar de pick and place de cinta: https://huggingface.co/aadarshram/act_pick_place_tape
- Perfil de GitHub del autor: https://github.com/adharshvenkat
