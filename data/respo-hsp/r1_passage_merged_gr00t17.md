# RESPO-HSP/R1_passage_merged_GR00T17

## Resumen

RESPO-HSP/R1_passage_merged_GR00T17 es una política de robótica (policy) de aprendizaje por imitación basada en el modelo GR00T N1.7 de NVIDIA, adaptada y entrenada por RESPO-HSP para la tarea de navegacion "Navigate to goal". El modelo está diseñado para controlar un robot humanoide tipo R1 a partir de entrada de estado de 24 dimensiones e imágenes estereoscópicas de las cámaras izquierda y derecha, y genera acciones de 24 dimensiones como salida.

La arquitectura combina un backbone Cosmos-Reason2/Qwen3-VL (usado para procesar visión y lenguaje) con un action transformer basado en flow-matching que genera las acciones del robot. Tiene un total de 3.144.016.000 parámetros y está publicado con licencia Apache 2.0, disponible en formato safetensors. El modelo se entrenó con el framework LeRobot 0.6.0, sobre un dataset de 50 episodios y 14.633 frames a 10 FPS.

Esta política resulta relevante para el campo de la robótica humanoide y el aprendizaje por imitación, ya que permite probar el ecosistema LeRobot junto con el modelo GR00T de NVIDIA en una tarea concreta de navegación en interiores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + action transformer con flow-matching) |
| Parametros totales | 3.144.016.000 (3,14 mil millones) |
| Parametros activos | No aplica (modelo no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 presentada por NVIDIA como un modelo fundamental abierto y cross-embodiment para razonamiento y habilidades en robots humanoides. Utiliza un backbone Cosmos-Reason2/Qwen3-VL para procesar las observaciones de visión y lenguaje, y un action transformer con flow-matching para predecir las acciones del robot. Las entradas del modelo son:

- observation.state: vector de 24 dimensiones con el estado propioceptivo del robot.
- observation.images.stereo_left: imagen de 376x672 píxeles (3 canales).
- observation.images.stereo_right: imagen de 376x672 píxeles (3 canales).

La salida es un vector de acción de 24 dimensiones. El entrenamiento se realizó con el framework LeRobot 0.6.0, usando el dataset RESPO-HSP/R1_passage_merged, compuesto por 50 episodios y 14.633 frames a una frecuencia de 10 FPS. La configuración de entrenamiento incluye 20.000 pasos, tamaño de lote 32, optimizador AdamW, tasa de aprendizaje de 0.0001 y semilla 42. No se especifica si se aplicó RLHF, DPO u otras técnicas de ajuste por preferencias; el modelo es una política entrenada por aprendizaje supervisado a partir de demostraciones.

## Capacidades

- Ejecución de la tarea "Navigate to goal" en un robot humanoide tipo R1.
- Procesamiento de imágenes estereoscópicas de alta resolución (376x672) para percepción de profundidad y navegación.
- Control de 24 dimensiones de estado y 24 dimensiones de acción (brazos, piernas, articulaciones del robot).
- Integración con el ecosistema LeRobot para inferencia (`lerobot-rollout`) y entrenamiento (`lerobot-train`).
- No soporta generación de texto, tool calling, ni razonamiento simbólico general; es un modelo de política de control.
- No se han evaluado capacidades multilingües ni de visión abierta; el modelo está especializado en navegación.

## Casos de uso

- Navegación autónoma en pasillos de oficinas o almacenes: el modelo puede guiar un robot humanoide hasta un objetivo usando las cámaras stereo y el estado interno, lo que lo hace útil para tareas de logística y mantenimiento.
- Aprendizaje por imitación para nuevas trayectorias: sirve como base para fine-tuning con datos propios de un robot R1, usando LeRobot para registrar nuevos episodios y entrenar variaciones de la política.
- Investigación en robótica humanoide: permite comparar arquitecturas de vision-action en tareas de locomoción y navegación en entornos de interior.
- Automatización de inspecciones industriales: el robot puede desplazarse a puntos concretos de una planta, capturando imágenes de cámaras estereoscópicas para revisión posterior.
- Pruebas de integración de modelos GR00T en el ecosistema LeRobot: el repositorio sirve como ejemplo de checkpoint entrenado para la comunidad, facilitando la reproducción de pipelines.
- Simulación de políticas de navegación en entornos virtuales: se puede cargar el modelo en Isaac Sim o entornos compatibles para probar comportamientos antes de desplegarlo en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica textualmente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio contiene 12.6 GB de pesos en safetensors, pero no se especifica el consumo de VRAM durante la inferencia ni el entrenamiento.
- GPU recomendada: no disponible.
- No consta si el modelo puede ejecutarse en GPUs de consumo (por ejemplo, RTX 4090) ni en qué condiciones.
- Opciones de despliegue: el modelo está pensado para ejecutarse mediante LeRobot, con los comandos `lerobot-rollout` y `lerobot-train`. No se mencionan vLLM, llama.cpp, Ollama, TGI ni otros motores de inferencia para LLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información comparativa con otras políticas de la misma categoría. El modelo es una adaptación de GR00T N1.7, pero no se han publicado los datos de otras versiones o alternativas que permitan una comparación objetiva.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente para la tarea "Navigate to goal" y no se ha validado en otras tareas ni entornos.
- El dataset de entrenamiento consta de solo 50 episodios, lo que puede limitar la generalización a escenarios no vistos.
- No se han publicado resultados de evaluación real en robot, por lo que el rendimiento en producción es incierto.
- La política depende estrechamente de la configuración del robot: necesita cámaras stereo_left y stereo_right y un estado propioceptivo de 24 dimensiones. Para usar el modelo en otro robot es necesario adaptar las claves de observación y la tarea.
- No es un modelo de lenguaje: no genera texto ni responde instrucciones en lenguaje natural, a pesar de que el backbone Qwen3-VL lo permita en teoría.
- La licencia Apache 2.0 permite uso comercial, pero la seguridad y la responsabilidad de desplegar la política en sistemas de control real recaen en el usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RESPO-HSP/R1_passage_merged_GR00T17
- Dataset de entrenamiento: https://huggingface.co/datasets/RESPO-HSP/R1_passage_merged
- Repositorio de NVIDIA para GR00T: https://github.com/NVIDIA/Isaac-GR00T
- LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
