# jhd0313/diffusion_move-box

## Resumen

`jhd0313/diffusion_move-box` es una política de control visuomotor entrenada con el algoritmo Diffusion Policy, publicada en Hugging Face Hub por el usuario jhd0313 mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un checkpoint de robótica que implementa una política de imitación para una tarea concreta de manipulación ("Move the box", mover una caja) sobre un robot de tipo `so_follower` (el brazo seguidor de bajo coste SO-100/SO-101 de The Robot Studio).

El modelo trata el control visuomotor como un proceso generativo de difusión: en lugar de predecir una única acción de forma determinista, genera trayectorias de acción suaves y multimodales condicionadas a la observación (estado articular de 6 dimensiones y dos cámaras RGB de 480x640, una cenital y otra en la muñeca). Cuenta con 277.839.298 parámetros (dato real del archivo safetensors) y un tamaño de repositorio de 1,1 GB.

Su relevancia es acotada y demostrativa: se trata de un artefacto de investigación reproducido con LeRobot 0.6.0 sobre un dataset propio de 50 episodios y 10.668 fotogramas a 30 FPS, entrenado durante 5.000 pasos. Resulta útil como referencia práctica de un pipeline completo de imitación (grabación de datos, entrenamiento, despliegue con `lerobot-rollout`) y como punto de partida para tareas de manipulación con contacto, pero no debe confundirse con un modelo fundacional de robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor; backbone no especificado en la model card) |
| Parametros totales | 277.839.298 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; horizonte de predicción de acciones no especificado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no aplica; modelo de robótica sin interfaz de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 1,1 GB) |

## Arquitectura y entrenamiento

La política sigue el planteamiento de Diffusion Policy (Chi et al., 2023, arXiv:2303.04137): el control se modela como un proceso de difusión condicionado por la observación, que genera secuencias de acciones de forma iterativa. La entrada combina el estado articular (`observation.state`, vector de 6 dimensiones) con dos flujos visuales (`observation.images.overhead` y `observation.images.wrist`, ambos tensores 3x480x640), y la salida es un vector de acción de 6 dimensiones. La model card no detalla el backbone concreto (tipo U-Net o transformer), el número de pasos de difusión ni el horizonte de predicción.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `jhd0313/move-box_20261008_100955`: 50 episodios, 10.668 fotogramas a 30 FPS, una única tarea ("Move the box"). La configuración fue de 5.000 pasos, batch size 8, optimizador Adam, learning rate 1e-4 y semilla 1000. No se documenta número de tokens ni composición de datos más allá de lo anterior, ni se menciona RLHF, DPO ni ninguna fase de refinamiento posterior.

## Capacidades

- Generación de trayectorias de acción multimodales y suaves para manipulación robótica, adecuadas para tareas con contacto físico.
- Control visuomotor a partir de dos cámaras RGB (cenital y de muñeca) y del estado articular del robot.
- Ejecución de una tarea concreta de manipulación: "Move the box".
- Integración nativa con el ecosistema LeRobot: entrenamiento (`lerobot-train`) y despliegue (`lerobot-rollout`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo de razonamiento (thinking), visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Manipulación de objetos con contacto en laboratorio: el modelo genera trayectorias suaves de 6 dimensiones condicionadas a dos vistas, lo que lo hace adecuado para empujar o trasladar una caja con un brazo SO-100/SO-101 en un entorno controlado.
- Reproducción de un pipeline de imitación de referencia: sirve como ejemplo completo de grabación de datos, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout` para equipos que quieran replicar el flujo de Diffusion Policy.
- Punto de partida para fine-tuning: al estar entrenado con solo 50 episodios y 5.000 pasos, es un candidato razonable para adaptar a variantes de la misma tarea (nuevas posiciones de caja, iluminación o distractor) con datos propios.
- Docencia y formación en robótica de imitación: permite mostrar de forma tangible cómo una política de difusión consume observaciones multimodales y produce acciones, sin necesidad de infraestructura de gran escala.
- Evaluación comparativa de políticas de imitación: útil como baseline frente a otras políticas de LeRobot (ACT, TDMPC, etc.) en la misma tarea y robot.
- Prototipado rápido en hardware de bajo coste: al caber en una GPU de consumo y ejecutarse con `lerobot-rollout`, permite iterar en un banco de pruebas físico sin clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 277,8 M de parámetros en fp32, el peso ronda 1,1 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo (estimación orientativa a partir del tamaño del repositorio, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente (estimación orientativa).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores (estimación orientativa).
- Opciones de despliegue: `lerobot-rollout` (documentado en la model card); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El control opera a 30 FPS según el dataset de entrenamiento, pero no se publica latencia medida en inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jhd0313/diffusion_move-box | Diffusion Policy (LeRobot) | 277,8 M | no aplica | apache-2.0 | Hugging Face Hub |
| Políticas ACT de LeRobot | Imitation learning (transformer) | no disponible | no aplica | según checkpoint | Hugging Face Hub |
| Otras políticas Diffusion de LeRobot | Diffusion Policy | variable | no aplica | según checkpoint | Hugging Face Hub |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a tipo de modelo, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado para una única tarea ("Move the box") y un único tipo de robot (`so_follower`); no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Dataset muy reducido (50 episodios, 10.668 fotogramas) y entrenamiento corto (5.000 pasos): alta probabilidad de sobreajuste al entorno, posiciones e iluminación de grabación.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito en robot real.
- Riesgo de fallo silencioso en producción: al no haber métricas de robustez, no se recomienda su uso en aplicaciones críticas sin validación exhaustiva.
- No se documentan sesgos; al ser un modelo de robótica sin datos lingüísticos, los sesgos relevantes serían de dominio (posiciones, objetos, condiciones de iluminación del dataset).
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No aplica advertencia de alucinación en el sentido de modelos de lenguaje; el riesgo equivalente es la generación de trayectorias inválidas o inseguras fuera de la distribución de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jhd0313/diffusion_move-box
- Dataset de entrenamiento: https://huggingface.co/datasets/jhd0313/move-box_20261008_100955
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=jhd0313/move-box_20261008_100955
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv:2303.04137)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
