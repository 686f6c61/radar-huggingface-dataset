# jwc697/pick_and_place_act

## Resumen

`jwc697/pick_and_place_act` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv 2304.13705 (Zhao et al., 2023) y distribuida a través de la librería LeRobot de Hugging Face. El modelo aprende a partir de datos de teleoperación y predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y facilita comportamientos suaves en tareas de manipulación.

La política está especializada en una única tarea denominada `pick_and_place` sobre un robot de tipo `omx_follower`, con dos cámaras (`wrist` y `top`) a resolución 480x640 y una representación del estado y de la acción de 6 dimensiones. El repositorio contiene 51.668.614 parámetros en formato safetensors (0,2 GB), lo que lo sitúa en el rango de políticas ligeras aptas para inferencia en tiempo real en hardware de consumo.

Es relevante como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot: dataset, configuración de entrenamiento, checkpoint y comandos de despliegue. No obstante, se trata de un modelo experimental de un autor individual, con un dataset de un solo episodio (593 fotogramas a 30 FPS) y sin resultados de evaluación publicados, por lo que su utilidad práctica fuera de ese entorno concreto es muy limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación basada en transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control robótico, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se identifica con la etiqueta `pick_and_place`) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Tipo de robot | `omx_follower` |
| Cámaras | `wrist`, `top` (3x480x640 cada una) |
| Entrada de estado | `observation.state` con forma (6,) |
| Salida de acción | `action` con forma (6,) |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (procesa las imágenes de las cámaras `wrist` y `top` a 480x640) con un transformer que modela la secuencia de observaciones y genera bloques de acciones futuras. La predicción por chunks, en lugar de acción a acción, es la innovación central del método: permite al policy anticipar varios pasos y mitiga el error compounding típico de las políticas reactivas. La dimensionalidad de estado y acción es de 6 grados de libertad, coherente con un brazo manipulador de tipo `omx_follower`.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `jwc697/pick_and_place`, compuesto por un único episodio de 593 fotogramas a 30 FPS (aproximadamente 19,8 segundos de demostración). La configuración fue de 2000 pasos, batch size 1, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni de datos adicionales; se trata de imitación supervisada pura sobre una demostración muy reducida.

## Capacidades

- Control robótico de manipulación para la tarea `pick_and_place` sobre el robot `omx_follower`.
- Predicción de chunks de acción de 6 dimensiones a partir de estado de 6 dimensiones y dos vistas de cámara.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Inferencia en tiempo real mediante `lerobot-rollout` con estrategia base.
- Entrenamiento reproducible con `lerobot-train` y seguimiento opcional en Weights & Biases.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan modos especiales como thinking, visión general o audio.

## Casos de uso

- Replicación de experimentos de ACT: sirve como referencia mínima para validar un pipeline completo de LeRobot (grabación, entrenamiento, rollout) antes de escalar a datasets mayores.
- Docencia y formación en aprendizaje por imitación: el tamaño reducido (0,2 GB) y el comando de rollout documentado permiten demostrar el ciclo completo en una sesión práctica.
- Prueba de integración de hardware `omx_follower`: útil para verificar la calibración de cámaras `wrist` y `top` y del bus del robot antes de entrenar políticas propias.
- Base para fine-tuning con datos adicionales: el checkpoint puede inicializar un entrenamiento con más episodios de la misma tarea para mejorar la robustez.
- Validación de infraestructura de inferencia: permite medir latencia y throughput de `lerobot-rollout` en una GPU concreta con una política de 51,7 M de parámetros.
- Generación de datos sintéticos de evaluación: ejecutar la política y registrar episodios para analizar modos de fallo en la tarea `pick_and_place`.
- Referencia para comparar variantes de ACT (distintos learning rates, tamaños de chunk) manteniendo constante el dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", y no incluye tasas de éxito en robot real ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en FP32 dado el tamaño de 51,668 M de parámetros (unos 207 MB de pesos) más las activaciones de las dos cámaras a 480x640; en la práctica, cualquier GPU con 4 GB o más es suficiente.
- GPU recomendadas: NVIDIA RTX 3060/4060 o superiores para inferencia; A100/H100 no son necesarias para este tamaño, aunque pueden usarse para entrenamiento paralelo o para reducir la latencia de preprocesado de imagen.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 4 GB de VRAM; también es viable en CPU para pruebas no críticas.
- Opciones de despliegue: `lerobot-rollout` (comando documentado en la model card) con estrategia `base`; integración con el ecosistema LeRobot. No se documentan exportaciones a vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware, de la resolución de las dos cámaras y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jwc697/pick_and_place_act` | 51,7 M | `pick_and_place` sobre `omx_follower` | Estado (6,) + 2 cámaras 480x640 | no disponible | Hugging Face, 0 descargas |
| Políticas ACT de referencia en LeRobot | no disponible | Manipulación genérica | Configurable | Apache-2.0 (LeRobot) | Hugging Face / GitHub |
| Políticas Diffusion Policy (LeRobot) | no disponible | Manipulación genérica | Configurable | Apache-2.0 (LeRobot) | Hugging Face / GitHub |
| Políticas π0 / OpenVLA | miles de millones | Manipulación generalista | Instrucciones en lenguaje + visión | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, entradas y licencia.

## Limitaciones y advertencias

- Dataset de entrenamiento mínimo: un solo episodio de 593 fotogramas (~19,8 s), lo que limita severamente la generalización y hace probable el sobreajuste a esa demostración concreta.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no puede afirmarse ningún nivel de rendimiento.
- Licencia no especificada: la model card indica "More Information Needed", lo que impide confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Especialización extrema: la política está entrenada para un robot `omx_follower` concreto, dos cámaras concretas y la tarea `pick_and_place`; no es transferible a otros robots, tareas o configuraciones de cámara sin reentrenamiento.
- Sin capacidades de lenguaje: no procesa instrucciones textuales ni mantiene conversaciones; la tarea se fija en el momento del entrenamiento y se invoca con `--task="pick_and_place"`.
- Riesgo de fallo silencioso: al no haber métricas, los modos de fallo (colisiones, agarres fallidos, deriva) solo pueden detectarse mediante inspección manual durante el rollout.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión comunitaria que permita validar su funcionamiento.
- Fecha de creación futura registrada (2026-11-10): conviene verificar la integridad del repositorio antes de confiar en él.
- Sin variantes cuantizadas ni exportaciones a formatos de inferencia alternativos; el despliegue queda ligado al stack LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jwc697/pick_and_place_act
- Dataset de entrenamiento: https://huggingface.co/datasets/jwc697/pick_and_place
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=jwc697/pick_and_place
- Artículo ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
