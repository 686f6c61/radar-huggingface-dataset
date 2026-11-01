# ib-007/vlarm_act_t1_v3_scene_seed2

## Resumen

`ib-007/vlarm_act_t1_v3_scene_seed2` es una política de imitación (imitation learning) entrenada con el método Action Chunking with Transformers (ACT), publicado por Zhao et al. en el paper arXiv:2304.13705. El modelo ha sido entrenado y publicado en Hugging Face Hub mediante la librería LeRobot de Hugging Face, y está empaquetado como un checkpoint de robótica (`pipeline_tag: robotics`) listo para ejecutarse sobre un robot simulado de tipo `so101_sim`.

El modelo resuelve una tarea concreta de manipulación: coger cubos de color (rojo, azul, verde) y depositarlos en una papelera, a partir de observaciones multimodales compuestas por el estado del robot (6 dimensiones), dos cámaras (frontal y de muñeca, 3×256×256 cada una) y un vector de estado del entorno (5 dimensiones). La salida es un vector de acción de 6 dimensiones. No es un modelo de lenguaje: es una política visomotora de control robótico.

Con 51.672.198 parámetros y un tamaño de repositorio de 1.0 GB, es un modelo compacto orientado a inferencia en tiempo real a 30 FPS. Su relevancia radica en que sirve como referencia reproducible de un pipeline completo de LeRobot (dataset, entrenamiento, rollout) para tareas de pick-and-place en simulación, con licencia Apache 2.0 y semilla fija (seed 2000), lo que facilita la reproducibilidad experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.672.198 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones por frame) |
| Tipos de cuantizacion | no disponible (checkpoint safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 1.0 GB) |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que predice chunks de acciones (secuencias cortas de acciones) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. La arquitectura combina un backbone transformer con atención sobre las observaciones (imágenes de dos cámaras más vectores de estado) y un decoder que genera el chunk de acciones. El modelo consume `observation.state` (6,), `observation.images.front` (3, 256, 256), `observation.images.wrist` (3, 256, 256) y `observation.environment_state` (5,), y produce `action` (6,).

El entrenamiento se realizó sobre el dataset `ib-007/vlarm_sim_t1_v2_scene`, con 993 episodios y 116.300 frames a 30 FPS. Las tareas cubiertas son variantes de "put the red/blue/green cube in the bin" y "pick up the red/blue/green cube and place it in the bin". La configuración de entrenamiento fue: 50.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-05, semilla 2000 y LeRobot 0.6.1. No se especifica en la información disponible si hubo RLHF, DPO u otras fases de ajuste; en ACT el paradigma es puramente supervisado sobre demostraciones de teleoperación.

## Capacidades

- Control visomotor para manipulación robótica: genera acciones de 6 dimensiones a partir de dos vistas de cámara y estado propioceptivo.
- Predicción de chunks de acción, lo que permite ejecutar secuencias de movimiento coherentes sin recalcular a cada paso.
- Ejecución de tareas de pick-and-place sobre cubos de color (rojo, azul, verde) depositándolos en una papelera.
- Fusión multimodal de observaciones: imágenes frontales, imágenes de muñeca, estado del robot y estado del entorno.
- Funcionamiento a 30 FPS, alineado con la frecuencia de captura del dataset de entrenamiento.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso ni capacidades lingüísticas; no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Automatización de pick-and-place en simulación: el modelo puede ejecutar la tarea de coger un cubo de color y depositarlo en la papelera sobre el robot `so101_sim`, usando las dos cámaras y el estado del entorno como entrada.
- Banco de pruebas para pipelines de LeRobot: sirve como checkpoint de referencia para validar la instalación, el formateo de observaciones y la CLI `lerobot-rollout` antes de entrenar políticas propias.
- Reproducibilidad experimental: al fijar la semilla 2000 y publicar la configuración completa, permite reproducir el entrenamiento y comparar variantes (por ejemplo, cambiando el número de pasos o el batch size).
- Generación de datos sintéticos de evaluación: ejecutar la política en bucle para recolectar rollouts y analizar tasas de éxito por tarea y por color de cubo.
- Estudio de robustez ante variaciones de escena: al entrenarse sobre un dataset con múltiples tareas y colores, permite evaluar la degradación al cambiar posiciones de objetos o iluminación (aunque no se han publicado resultados de evaluación).
- Base para fine-tuning en tareas similares: al ser un checkpoint ACT compacto (51,7 M de parámetros) con licencia Apache 2.0, se puede reentrenar sobre datasets propios de manipulación con objetos pequeños.
- Docencia y divulgación: ejemplo completo y ligero de un flujo de imitation learning end-to-end, desde dataset hasta rollout, adecuado para tutoriales y cursos de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito por tarea, ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros, el checkpoint en safetensors ocupa aproximadamente 1.0 GB en disco y la inferencia en FP32 requiere del orden de 0,2 GB solo para pesos, más memoria para activaciones de las dos cámaras de 256×256.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería poder ejecutar la política; no se confirma compatibilidad con GPU concretas.
- ¿Cabe en GPU consumer? Sí, por el reducido número de parámetros; no se aporta lista de GPUs validadas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), según la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput estimados: no disponibles. El dataset y la captura operan a 30 FPS, pero no se publica latencia de inferencia medida.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints ACT comparables ni datos de rendimiento de alternativas. Como referencia metodológica, el paper arXiv:2304.13705 describe ACT frente a otros métodos de imitation learning, pero no se dispone de cifras de este checkpoint concreto para comparar.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación; se desconoce la tasa de éxito real de la política.
- Entrenado exclusivamente en simulación (`so101_sim`); no hay evidencia de transferencia a robot físico.
- El dominio de tareas es muy estrecho: cubos de color rojo, azul y verde depositados en una papelera; fuera de ese dominio no hay garantía de funcionamiento.
- Depende de la configuración exacta de cámaras (`front`, `wrist`) y de las claves de observación; un cambio de nombres o de resolución invalida la inferencia.
- Riesgo de sobreajuste a posiciones, iluminación y distribuciones del dataset de entrenamiento; no se documentan pruebas de robustez.
- No es un modelo de lenguaje: no puede usarse para generación de texto, código, matemáticas ni tareas lingüísticas.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- El repositorio tiene 40 descargas y 0 likes, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ib-007/vlarm_act_t1_v3_scene_seed2
- Dataset de entrenamiento: https://huggingface.co/datasets/ib-007/vlarm_sim_t1_v2_scene
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ib-007/vlarm_sim_t1_v2_scene
