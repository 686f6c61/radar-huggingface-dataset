# knight7024/act_pick_and_place_hair_roll_final_chunk10

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, `knight7024/act_pick_and_place_hair_roll_final_chunk10`, es una política entrenada con LeRobot para la tarea "pick_and_place_hair_roll_final" sobre un robot tipo `so_follower` (SO-100/SO-101 de bajo coste), con dos cámaras (`top` y `wrist`) y un espacio de acciones de 6 dimensiones.

El modelo tiene 51.576.454 parámetros (unos 51,6 M) y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en tiempo real en hardware modesto. Se distribuye en formato safetensors bajo licencia Apache 2.0 y se integra en el ecosistema LeRobot mediante la CLI `lerobot-rollout`.

Es relevante como ejemplo práctico de política de imitación entrenada de extremo a extremo con datos teleoperados: 60 episodios, 43.285 frames a 30 FPS, 100.000 pasos de entrenamiento con AdamW y batch size 1. No obstante, se trata de un modelo de nicho, sin descargas ni likes, y sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.576.454 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; consume observaciones por frame) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT combina un backbone visual (codificador de imágenes) con un transformer que procesa las observaciones y genera un *chunk* de acciones (en este caso, `chunk10` sugiere un horizonte de predicción de 10 pasos). La política consume `observation.state` de forma `(6,)` y dos imágenes RGB de `(3, 240, 320)` procedentes de las cámaras `top` y `wrist`, y produce una acción de forma `(6,)`. El enfoque de *action chunking* mitiga el problema de la acumulación de errores típico de las políticas que predicen un único paso por inferencia.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `knight7024/pick_and_place_hair_roll_final`: 60 episodios, 43.285 frames a 30 FPS, tarea única "pick_and_place_hair_roll_final". Configuración: 100.000 pasos, batch size 1, optimizador AdamW, learning rate 1e-05, semilla 1000. No se documenta uso de RLHF, DPO ni aumentos de datos; es aprendizaje por imitación supervisado puro a partir de demostraciones teleoperadas.

## Capacidades

- Generación de acciones de manipulación robótica de 6 grados de libertad a partir de estado y visión.
- Predicción de *chunks* de acciones (horizonte de 10 pasos según el nombre del checkpoint), lo que aporta suavidad temporal.
- Fusión de dos vistas (cámara cenital y de muñeca) para localización del objeto y del efector final.
- Ejecución en tiempo real sobre robots `so_follower` mediante `lerobot-rollout`.
- Entrenamiento y reentrenamiento reproducibles con `lerobot-train` y `policy.type=act`.
- No soporta tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües: es una política motora, no un modelo de lenguaje.

## Casos de uso

- Automatización de picking de un objeto concreto (rollo de pelo) en un entorno controlado: la política ejecuta la secuencia de aproximación, agarre y colocación aprendida de las 60 demostraciones, adecuada para prototipos de laboratorio con el mismo robot y disposición de cámaras.
- Base para *fine-tuning* en tareas de manipulación similares: al ser una política ACT ligera (51,6 M parámetros), se puede reentrenar con `lerobot-train` sobre un dataset propio de pocas decenas de episodios y hardware de consumo.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible para comparar variantes de ACT (horizontes de chunk, número de cámaras, tasas de aprendizaje) manteniendo el resto del pipeline LeRobot.
- Docencia y formación en robótica de bajo coste: el robot `so_follower` y una política de 0,2 GB permiten montar un laboratorio completo con GPUs modestas y reproducir el flujo teleoperación-entrenamiento-despliegue.
- Pruebas de integración de pipelines de inferencia en tiempo real: validar latencia, sincronización de cámaras a 30 FPS y estabilidad del bucle de control con `lerobot-rollout` antes de escalar a tareas más complejas.
- Generación de datos sintéticos de evaluación: ejecutar la política en simuladores o réplicas físicas para estudiar tasas de éxito y modos de fallo antes de invertir en un dataset mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,6 M parámetros en FP32 el peso ronda los 0,2 GB, por lo que cualquier GPU con 4 GB o más es suficiente, y también es viable en CPU para pruebas no reales.
- GPU recomendadas: RTX 3060/4060 o superiores para inferencia en tiempo real; A100/H100 no son necesarias y aportan poco en este tamaño.
- Cabe en cualquier GPU de consumo moderna (GTX 1650 en adelante), e incluso en placas integradas para inferencia a baja frecuencia.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial), scripts Python con la librería `lerobot`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles en la información proporcionada; el sistema opera a 30 FPS de captura, pero no se especifica el tiempo de inferencia por chunk.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_pick_and_place_hair_roll_final_chunk10 (este) | 51,6 M | no aplica | ACT, chunk de 10, 2 cámaras | Apache 2.0 | Hugging Face, 0 descargas |
| Políticas ACT genéricas de LeRobot | variable (decenas de M) | no aplica | ACT estándar | Apache 2.0 | Hub de LeRobot |
| Diffusion Policy (referencia del ecosistema) | variable | no aplica | difusión de acciones | según checkpoint | Hub de LeRobot |
| VQ-BeT / otras políticas de imitación | variable | no aplica | discretización + transformer | según checkpoint | Hub de LeRobot |

No se dispone de datos de rendimiento comparativo para este checkpoint concreto; la comparación se limita a enfoque, tamaño y licencia.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito ni número de ensayos, por lo que no se puede afirmar que la política funcione de forma fiable.
- Entrenada para una única tarea ("pick_and_place_hair_roll_final") y un único objeto; no generaliza a otras tareas sin reentrenamiento.
- Dependiente del montaje físico: mismos tipos de cámara (`top`, `wrist`), misma resolución (240×320), misma frecuencia (30 FPS) y misma cinemática del `so_follower`; cambios de iluminación, fondo o posición inicial pueden degradar el rendimiento.
- Dataset pequeño (60 episodios, 43.285 frames) y batch size 1 durante 100.000 pasos: riesgo de sobreajuste a las condiciones exactas de recogida.
- Sin capacidades de lenguaje, razonamiento ni tool calling; no debe confundirse con un LLM.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la procedencia del dataset asociado antes de desplegar en producción.
- Riesgo de fallos silenciosos en el bucle de control: al no haber métricas publicadas, conviene instrumentar la ejecución con límites de par, paradas de emergencia y supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/knight7024/act_pick_and_place_hair_roll_final_chunk10
- Dataset de entrenamiento: https://huggingface.co/datasets/knight7024/pick_and_place_hair_roll_final
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=knight7024/pick_and_place_hair_roll_final
