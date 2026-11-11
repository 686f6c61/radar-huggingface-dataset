# kickking/omx_buds_pick_act_policy_30hz_bs16_ep3

## Resumen

`kickking/omx_buds_pick_act_policy_30hz_bs16_ep3` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), el método presentado en el artículo arXiv 2304.13705 y popularizado por la librería LeRobot de Hugging Face. El modelo aprende a partir de datos de teleoperación y predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado y suele mejorar la tasa de éxito en tareas de manipulación.

La política está entrenada específicamente para el robot `omx_f` con una única cámara RGB (`camera1`) y la tarea `omx_buds_pick` (recogida de objetos tipo buds). Consume un vector de estado de 6 dimensiones junto con imágenes de 3x480x640 y produce acciones de 6 dimensiones a 30 FPS. El entrenamiento se realizó sobre un dataset propio de 11 episodios y 6924 fotogramas, con 1298 pasos de optimización y batch size 16.

Es relevante como ejemplo práctico de política ACT lista para desplegar en un robot concreto mediante la CLI de LeRobot, y como referencia de un flujo completo de captura de datos, entrenamiento y rollout en robótica de imitación. No es un modelo de lenguaje: es un modelo de control visuomotor de pequeño tamaño (51,7 millones de parámetros) y alcance limitado a la tarea y plataforma para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de imitación visuomotora |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana temporal de observaciones definida por la política) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer que mapea observaciones (estado del robot e imágenes de cámara) a secuencias de acciones. La innovación clave del método es predecir un chunk de acciones futuras en cada paso de inferencia, lo que aporta consistencia temporal y mitiga el problema de compounding errors típico de las políticas paso a paso. En esta implementación concreta, la entrada es `observation.state` de forma `(6,)` y `observation.images.rgb.camera1` de forma `(3, 480, 640)`, y la salida es `action` de forma `(6,)`.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `kickking/omx_buds_pick_1111_2` (11 episodios, 6924 fotogramas, 30 FPS, tarea `omx_buds_pick`). La configuración reportada incluye 1298 pasos, batch size 16, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documentan detalles sobre aumentos de datos, regularización, número de tokens de entrenamiento ni uso de RLHF/DPO (no aplica en este paradigma de imitación supervisada).

## Capacidades

- Control visuomotor de manipulación robótica: genera comandos de acción de 6 dimensiones a partir de estado y una imagen RGB.
- Predicción de action chunks: emite secuencias cortas de acciones para mayor estabilidad temporal.
- Ejecución de una tarea concreta: `omx_buds_pick` sobre el robot `omx_f`.
- Inferencia en tiempo real a 30 FPS, alineada con la frecuencia de captura del dataset.
- Integración con el ecosistema LeRobot: entrenamiento, rollout y visualización mediante CLI.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Recogida automatizada de objetos tipo buds en un robot `omx_f`: la política ejecuta la tarea `omx_buds_pick` a 30 FPS usando una cámara RGB y el estado de 6 dimensiones del robot, adecuada para demostraciones de manipulación en laboratorio.
- Reproducción de una tarea teleoperada: sirve como base para replicar la política de un operador humano en el mismo entorno y con el mismo robot, reduciendo la necesidad de programación explícita.
- Prototipado rápido de pipelines de imitación: al estar publicada en LeRobot, permite validar el flujo `lerobot-train` → `lerobot-rollout` con un caso real y pequeño (11 episodios).
- Benchmark interno de políticas ACT: útil como referencia base para comparar variantes (más episodios, más cámaras, otras tasas) en el mismo robot y tarea.
- Docencia y formación en robótica de imitación: ejemplo mínimo reproducible de entrenamiento y despliegue de una política visuomotora.
- Reentrenamiento con datos adicionales: el checkpoint puede servir de inicialización para fine-tuning con nuevos episodios de la misma tarea o de tareas relacionadas en `omx_f`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7 M de parámetros el modelo es muy pequeño y cabe holgadamente en GPUs de consumo, pero no se aportan cifras oficiales.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con soporte CUDA es suficiente, aunque no se especifica.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo, pero no se confirma en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) con `--policy.path=kickking/omx_buds_pick_act_policy_30hz_bs16_ep3`; no se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; el modelo está pensado para operar a 30 FPS, pero no se publican mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kickking/omx_buds_pick_act_policy_30hz_bs16_ep3 | 51,7 M | no aplica | omx_buds_pick en omx_f | apache-2.0 | Hugging Face (LeRobot) |
| Otras políticas ACT en LeRobot Hub | no disponible | no aplica | variables por robot/tarea | variable | Hugging Face |
| Políticas tipo Diffusion Policy | no disponible | no aplica | manipulación visuomotora | variable | Hugging Face / repos académicos |

No se dispone de comparativas cuantitativas publicadas entre esta política y alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- Alcance muy restringido: entrenada solo para la tarea `omx_buds_pick` y el robot `omx_f`; no generaliza a otras tareas, objetos o plataformas sin reentrenamiento.
- Dataset pequeño: 11 episodios y 6924 fotogramas, lo que limita la robustez frente a variaciones de iluminación, posiciones de objetos o distracciones.
- Sin evaluación publicada: no hay resultados de tasa de éxito en robot real, por lo que el rendimiento real es desconocido.
- Dependencia de una única cámara RGB (`camera1`) y de un estado de 6 dimensiones; cambios en la configuración sensorial invalidan la política.
- Riesgo de sobreajuste al entorno de captura y de fallos ante condiciones no vistas durante el entrenamiento.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No es un modelo de lenguaje: no debe evaluarse con métricas de NLP ni usarse para tareas de texto, código o razonamiento.
- Frecuencia fija de 30 FPS: desviaciones en la tasa de control o en la latencia del sistema pueden degradar el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kickking/omx_buds_pick_act_policy_30hz_bs16_ep3
- Dataset de entrenamiento: https://huggingface.co/datasets/kickking/omx_buds_pick_1111_2
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kickking/omx_buds_pick_1111_2
