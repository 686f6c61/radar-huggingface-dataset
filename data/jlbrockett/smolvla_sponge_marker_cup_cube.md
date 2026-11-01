# Jlbrockett/smolvla_sponge_marker_cup_cube

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot. Resuelve el problema del control robótico por imitación: dado un estado de articulaciones y varias vistas de cámara, predice directamente las acciones del robot para completar una tarea descrita en lenguaje natural. Este repositorio concreto, `Jlbrockett/smolvla_sponge_marker_cup_cube`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` sobre un dataset propio de cuatro tareas de manipulación.

El modelo tiene 450.046.176 parámetros (aproximadamente 450 M) y se distribuye en formato safetensors dentro de un repo de 0,9 GB. Está pensado para desplegarse en hardware de consumo, lo que lo hace accesible para laboratorios pequeños y prototipos de robótica sin necesidad de clústeres de GPU. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Es relevante ahora porque el paper SmolVLA (arXiv:2506.01844) demuestra que un VLA de menos de 500 M de parámetros puede competir con modelos mucho mayores en tareas de manipulación, y porque LeRobot 0.6.1 ya ofrece un pipeline completo (grabación, entrenamiento, rollout) para reproducir y adaptar este tipo de políticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, según paper SmolVLA (arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones. La model card no detalla la arquitectura interna más allá de remitir al paper arXiv:2506.01844; lo que sí especifica es la interfaz de entrada y salida: consume `observation.state` de forma `(6,)`, tres cámaras visuales de `(3, 256, 256)` y produce `action` de forma `(6,)`. El robot objetivo es `so_follower` con cámaras `handeye` y `front` (la model card declara tres entradas visuales `camera1`, `camera2` y `camera3`).

El fine-tuning se realizó sobre `lerobot/smolvla_base` con 30.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-4 y semilla 1000, usando LeRobot 0.6.1. El dataset `Jlbrockett/sponge_marker_cup_cube` contiene 250 episodios y 154.563 frames a 30 FPS, con cuatro tareas: coger la esponja y dejarla en el cuenco, colocar el rotulador verticalmente en el vaso, poner el vaso sobre el salvamanteles y meter el cubo gris en la papelera gris. No se documenta el uso de RLHF ni DPO; se trata de aprendizaje por imitación supervisado.

## Capacidades

- Control robótico por imitación: predice acciones de 6 dimensiones a partir del estado de articulaciones y tres vistas de cámara.
- Seguimiento de instrucciones en lenguaje natural para seleccionar la tarea entre las cuatro entrenadas.
- Manipulación de objetos rígidos y deformables: esponja, rotulador, vaso, cubo y salvamanteles.
- Percepción visual multi-cámara con resolución de entrada de 256x256 por vista.
- Ejecución en tiempo real a 30 FPS, alineada con la frecuencia de grabación del dataset.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito.

## Casos de uso

- Automatización de picking y placing en laboratorio: el modelo ejecuta la secuencia "coger la esponja y dejarla en el cuenco" con una política entrenada específicamente para esa tarea, adecuada para demostraciones reproducibles de manipulación.
- Clasificación y ordenación de objetos pequeños: la tarea "meter el cubo gris en la papelera gris" permite integrar el modelo en una celda de clasificación de piezas por color y forma.
- Ensamblaje ligero con inserción vertical: la tarea del rotulador en el vaso ejercita inserción de precisión, útil como banco de pruebas para control fino de efector final.
- Manipulación de objetos deformables: la esponja es un objeto blando, lo que convierte al modelo en candidato para estudiar agarres adaptativos sin modelos físicos explícitos.
- Colocación sobre superficies delimitadas: la tarea del vaso sobre el salvamanteles sirve para validar precisión de posicionamiento relativo a referencias visuales.
- Base para fine-tuning propio: al partir de `lerobot/smolvla_base` y usar LeRobot 0.6.1, se puede reentrenar con un dataset nuevo de 250 episodios siguiendo el comando `lerobot-train` de la model card.
- Prototipado en hardware de consumo: con 450 M de parámetros y 0,9 GB de pesos, es viable desplegarlo en estaciones con GPU modesta para iterar políticas antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito por tarea, comparativas con otras políticas ni métricas de latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en safetensors (0,9 GB de repo), la inferencia en fp32 requiere aproximadamente 1,8 GB solo para pesos, más memoria para activaciones visuales de tres cámaras a 256x256.
- GPU recomendadas: no especificadas en la model card; el paper del método base indica despliegue en hardware de consumo, pero no se detallan modelos concretos.
- Cabe en GPU de consumo: sí, por tamaño de parámetros; no se confirma una GPU concreta en la información disponible.
- Opciones de despliegue: LeRobot con el comando `lerobot-rollout` (estrategia `base`), y entrenamiento con `lerobot-train` en dispositivo `cuda`.
- Latencia y throughput: no disponibles; el dataset se grabó a 30 FPS, pero no se documenta la latencia real de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jlbrockett/smolvla_sponge_marker_cup_cube` | 450 M | no disponible | VLA para 4 tareas de manipulación | apache-2.0 | Hugging Face, 43 descargas |
| `lerobot/smolvla_base` | no disponible en la información | no disponible | VLA base para fine-tuning | no disponible | Hugging Face (modelo base citado) |
| Políticas ACT/diffusion de LeRobot | no disponible | no disponible | imitación visomotora | no disponible | ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 250 episodios de un entorno concreto, el modelo puede sobreajustarse a posiciones, iluminación y objetos de ese dataset.
- Riesgo de alucinación: en un VLA se traduce en acciones incorrectas o inseguras; no hay evaluación publicada de tasa de éxito ni de robustez ante distractores.
- Limitaciones de contexto e idioma: las instrucciones de tarea están en inglés y limitadas a las cuatro frases del dataset; no se documenta generalización a instrucciones nuevas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset deben verificarse por separado; la model card no detalla condiciones adicionales.
- Caveats para producción: no hay resultados de evaluación, el número de descargas es bajo (43) y no hay likes, lo que indica poca validación comunitaria; la interfaz exige que los nombres de cámara coincidan exactamente con las claves de observación del entrenamiento.
- Fecha de creación del repo: 2026-10-25, según los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jlbrockett/smolvla_sponge_marker_cup_cube
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Jlbrockett/sponge_marker_cup_cube
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Jlbrockett/sponge_marker_cup_cube
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
