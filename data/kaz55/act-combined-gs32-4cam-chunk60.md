# Kaz55/act-combined-gs32-4cam-chunk60

## Resumen

Kaz55/act-combined-gs32-4cam-chunk60 es un modelo de robótica desarrollado por Kaz55 dentro del framework LeRobot de Hugging Face. Se trata de una política de control basada en ACT (Action Chunking with Transformers), entrenada para la tarea de ordenación de cables con un manipulador UR5e equipado con pinza DG-5F y sensores táctiles GelSight. El modelo forma parte de una ablación sistemática sobre la resolución del sensor GelSight, en la que todas las variables se mantienen constantes excepto la resolución táctil, para aislar su efecto en el rendimiento.

La arquitectura es un transformer de tipo ACT que predice secuencias de acciones de 60 pasos (chunk_size=60), y el modelo tiene 51.668.634 parámetros. Se entrena con un dataset de 180 episodios y 208.933 frames, combinando estado del robot, dos cámaras RealSense a 640x480 y dos sensores GelSight a 32x24. La relevancia de este modelo radica en que permite evaluar empíricamente cuánto influye la resolución de la percepción táctil en tareas de manipulación de precisión, un aspecto crítico para el diseño de sistemas robóticos con sensación multimodal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.634 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (chunk_size=60 para acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura ACT (Action Chunking with Transformers), un enfoque de aprendizaje por imitación que predice una secuencia de acciones futuras en lugar de una sola acción. En este caso, la política genera 60 pasos de acción (n_action_steps=60) a partir del estado actual, lo que reduce el error de acumulación y permite movimientos más suaves. Las entradas son multimodales: un vector de estado de 26 dimensiones, dos imágenes de cámaras RealSense a 640x480 y dos imágenes táctiles de sensores GelSight a 32x24.

El entrenamiento se realizó durante 200.000 pasos con batch de 8 y semilla 1000, sobre un dataset de 180 episodios y 208.933 frames. Las variables de velocidad y esfuerzo del robot están presentes en el dataset pero se excluyen deliberadamente de las entradas, para mantener la coherencia con el baseline de 500x375 y no introducir diferencias adicionales en la ablación. No se ha aplicado RLHF ni DPO, ya que se trata de un modelo de control robótico, no un modelo de lenguaje.

## Capacidades

- Control robótico por imitación: predice secuencias de acciones de 60 pasos para el manipulador UR5e.
- Entrada multimodal: combina estado del robot (26 dimensiones), dos cámaras RealSense y dos sensores táctiles GelSight.
- Aprendizaje por imitación: entrenado con demostraciones humanas, sin necesidad de programar trayectorias explícitas.
- Ablación experimental: diseñado para comparar el efecto de la resolución del sensor táctil (32x24) frente a otras resoluciones.
- Integración con LeRobot: compatible con el framework de Hugging Face para cargar, evaluar y desplegar políticas robóticas.
- No soporta tool calling, generación de texto ni razonamiento simbólico: es un modelo puramente motor.

## Casos de uso

- Investigación en percepción táctil: permite estudiar cómo afecta la resolución de un sensor GelSight al éxito de una tarea de manipulación de precisión, comparando con otros modelos del barrido.
- Comparación de políticas ACT: se puede ejecutar junto con los modelos de 500x375, 320x240, 200x150, 120x90, 64x48 y sin GelSight para generar curvas de rendimiento frente a resolución.
- Entrenamiento de políticas de imitación: el pipeline de entrenamiento en LeRobot puede reutilizarse para adaptar el modelo a nuevas tareas de cableado o ensamblaje.
- Benchmark de manipuladores UR5e: sirve como referencia para validar el control de robots con pinza DG-5F y sensación táctil de baja resolución.
- Desarrollo de sistemas de ordenación de cables: en entornos industriales, el modelo puede probarse como componente de un sistema de manipulación de cables, aunque requiere adaptación al entorno real.
- Docencia e investigación en robótica: es un ejemplo claro de diseño de ablación controlada, útil para cursos sobre aprendizaje por imitación y sensores táctiles.
- Integración en LeRobot: puede cargarse directamente en el framework para pruebas de inferencia y análisis de la política generada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card documenta el diseño experimental y el barrido de resoluciones, pero no incluye métricas de éxito, tasas de error ni comparaciones cuantitativas con otros modelos. Por tanto, no es posible presentar una tabla de rendimiento basada en datos reales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendada: no disponible.
- Tamaño del repositorio: 0.2 GB, lo que sugiere que el modelo es ligero y podría ejecutarse en GPUs de consumo, aunque no se confirma con datos oficiales.
- Opciones de despliegue: compatible con el framework LeRobot; no se mencionan vLLM, llama.cpp, Ollama ni TGI, al tratarse de un modelo de robótica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La siguiente tabla compara este modelo con otros del mismo barrido de ablación. Los parámetros y la licencia de los demás modelos no están disponibles en la información proporcionada.

| Modelo | Resolución GelSight | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|
| act-combined-gs32-4cam-chunk60 | 32x24 | 51.668.634 | no disponible | HuggingFace |
| act-newcable-combined-4cam-chunk60 | 500x375 | no disponible | no disponible | HuggingFace |
| act-combined-gs64-4cam-chunk60 | 64x48 | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente para la tarea de ordenación de cables con una configuración específica de robot (UR5e + DG-5F + GelSight). No generaliza a otros robots ni tareas sin reentrenamiento.
- Dataset pequeño (180 episodios, 208.933 frames), lo que limita la robustez y la capacidad de generalización.
- Es un modelo de investigación y ablación; no se han publicado resultados de rendimiento ni benchmarks, por lo que su eficacia en producción es desconocida.
- No hay información sobre la licencia, por lo que el uso comercial no está garantizado.
- Las variables de velocidad y esfuerzo se excluyen deliberadamente; el modelo no utiliza feedback de fuerza, lo que puede afectar a tareas que requieran control de fuerza.
- No procesa texto ni lenguaje, por lo que no es aplicable a tareas de NLP ni a razonamiento simbólico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaz55/act-combined-gs32-4cam-chunk60
- Dataset utilizado: https://huggingface.co/datasets/Kaz55/dg5f_ur5e_combined_gs32
- Baseline de 500x375: https://huggingface.co/Kaz55/act-newcable-combined-4cam-chunk60
