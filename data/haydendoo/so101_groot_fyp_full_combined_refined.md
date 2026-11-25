# haydendoo/so101_groot_fyp_full_combined_refined

## Resumen

`haydendoo/so101_groot_fyp_full_combined_refined` es una política de robótica entrenada mediante imitación con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto para razonamiento y habilidades en robots humanoides. El autor, haydendoo, la ha ajustado para el robot `so101` con dos cámaras (`front` y `wrist`) y un espacio de acciones de 6 dimensiones, orientado a tareas de manipulación de bloques de colores sobre una bandeja. Se publica bajo licencia Apache 2.0 y con pesos en formato safetensors.

El modelo combina un backbone vision-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, de modo que predice acciones condicionadas por visión, lenguaje y propiocepción. Su relevancia radica en ser un ejemplo reproducible de ajuste de un modelo fundacional de robótica a un robot de bajo coste (SO-101), con un pipeline completo documentado en LeRobot y un conjunto de datos de 105 episodios y 28.209 fotogramas a 30 FPS.

No obstante, se trata de una política experimental de fin de grado (FYP) con cero descargas y cero likes en el momento de la consulta, sin resultados de evaluación publicados, por lo que debe considerarse un artefacto de investigación y no un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone vision-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La política sigue la arquitectura GR00T N1.7 de NVIDIA: un backbone vision-lenguaje Cosmos-Reason2/Qwen3-VL que procesa las observaciones visuales y las instrucciones en lenguaje natural, acoplado a un transformer de acciones que genera trayectorias mediante flow matching. La entrada combina `observation.state` de forma `(6,)`, dos imágenes RGB de `(3, 480, 640)` procedentes de las cámaras `front` y `wrist`, y la tarea en texto; la salida es un vector de acción de `(6,)`. El robot objetivo es el `so101`.

El ajuste se realizó con LeRobot 0.6.1 sobre el dataset `haydendoo/fyp-full-combined-refined`, compuesto por 105 episodios y 28.209 fotogramas a 30 FPS. Las tareas cubren variantes lingüísticas de recoger y colocar bloques azules, verdes y rojos en una bandeja (15 formulaciones distintas para el mismo comportamiento subyacente). La configuración de entrenamiento fue de 80.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se documenta el uso de RLHF, DPO ni de decodificación especulativa; el entrenamiento es de imitación supervisada sobre demostraciones.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones para el robot SO-101 a partir de observaciones visuales y propioceptivas.
- Condicionamiento por lenguaje: acepta instrucciones en texto para seleccionar la tarea de manipulación (bloque azul, verde o rojo hacia la bandeja).
- Percepción multivista: integra dos cámaras simultáneas (`front` y `wrist`) a resolución 480x640.
- Generalización entre formulaciones: entrenado con 15 variantes de instrucción para las mismas tres tareas de recogida y colocación.
- Integración con LeRobot: ejecutable mediante `lerobot-rollout` y reentrenable con `lerobot-train`.
- No se documentan capacidades de tool calling, agentes multi-paso, diálogo general, matemáticas ni visión fuera del contexto robótico.

## Casos de uso

- Manipulación de bloques en laboratorio: ejecutar la política sobre un SO-101 real para recoger bloques de colores y depositarlos en una bandeja, usando las cámaras `front` y `wrist` y una instrucción de texto acorde con las 15 formulaciones de entrenamiento.
- Reproducción de experimentos de imitación: servir como referencia para comparar configuraciones de entrenamiento (80.000 pasos, batch 32, lr 1e-4) sobre el mismo dataset y robot.
- Base para ajuste fino con nuevos objetos: reentrenar con `lerobot-train --policy.type=groot` sobre datasets propios del SO-101 para ampliar el repertorio de tareas de pick-and-place.
- Docencia y formación en robótica: ilustrar el flujo completo de LeRobot (instalación, calibración de hardware, grabación de datos, entrenamiento y rollout) con un caso concreto y reproducible.
- Evaluación de modelos fundacionales en robots de bajo coste: medir hasta qué punto un backbone Cosmos-Reason2/Qwen3-VL de 3.140 millones de parámetros transfiere a un brazo SO-101 con solo 105 episodios.
- Pruebas de robustez visual: analizar el comportamiento de la política ante cambios de iluminación, posición de objetos o distracciones, dado que la model card advierte de que estos factores afectan a la dificultad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota explícita: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repo ocupa 12,6 GB en safetensors, lo que da una cota inferior orientativa del peso en memoria en precisión original.
- GPU recomendadas: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; no se documenta cuantización ni requisitos mínimos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles. El bucle de control opera a 30 FPS según la tasa de fotogramas del dataset, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Robot / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `haydendoo/so101_groot_fyp_full_combined_refined` | 3.144.016.000 | no disponible | SO-101, pick-and-place de bloques | Apache 2.0 | Hugging Face (0 descargas) |
| GR00T N1.7 (NVIDIA, base) | no disponible | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot para SO-101 | no disponible | no disponible | SO-101 | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad fuera del conjunto de entrenamiento.
- Sesgo de dominio: entrenada exclusivamente con bloques azules, verdes y rojos sobre una bandeja; es probable que falle con otros objetos, colores o disposiciones.
- Dependencia de las cámaras: los nombres y la configuración de cámara deben coincidir exactamente con `observation.images.front` y `observation.images.wrist` a 480x640 y 30 FPS.
- Dataset pequeño: 105 episodios y 28.209 fotogramas son insuficientes para una generalización robusta; la política puede sobreajustar a posiciones y condiciones de iluminación concretas.
- Idiomas: no se declaran idiomas soportados; las instrucciones de entrenamiento están en inglés y no hay evidencia de funcionamiento en castellano.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base GR00T N1.7 y sus dependencias deben verificarse por separado.
- Artefacto de investigación: cero descargas y cero likes, creado y actualizado el mismo día (25 de noviembre de 2026), sin mantenimiento documentado.
- Sin cuantización documentada: no se ofrecen alternativas para reducir los 12,6 GB del repo ni para desplegar en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haydendoo/so101_groot_fyp_full_combined_refined
- Dataset de entrenamiento: https://huggingface.co/datasets/haydendoo/fyp-full-combined-refined
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=haydendoo/fyp-full-combined-refined
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
