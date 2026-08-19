# AnonymousMouse404/diffusion_chess_v3_fkloss

## Resumen

El modelo `diffusion_chess_v3_fkloss` es una política de control robótico basada en Diffusion Policy, desarrollada por AnonymousMouse404 y entrenada con el framework LeRobot de Hugging Face. Está diseñada para que un robot manipulador SO-101 ejecute movimientos de piezas de ajedrez sobre un tablero físico, a partir de observaciones visuales y del estado articular del robot. El modelo resuelve el problema de manipulación por contacto fino mediante aprendizaje por imitación, generando trayectorias de acción suaves y multi-paso.

Arquitectónicamente emplea Diffusion Policy, un enfoque que trata el control visuomotor como un proceso generativo de difusión, lo que permite producir secuencias de acción coherentes y robustas frente a perturbaciones. El modelo cuenta con aproximadamente 277,8 millones de parámetros y se ha entrenado sobre un dataset propio de 359 episodios y más de 134 000 frames. Su relevancia radica en ser un ejemplo práctico de aplicación de diffusion policies a tareas de manipulación real, con una licencia permisiva Apache 2.0 y una integración completa con el ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (visuomotor control generativo) |
| Parametros totales | 277.840.246 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (control robótico, no procesamiento de secuencias largas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, una arquitectura que modela la distribución de acciones condicionadas a observaciones mediante un proceso de denoising iterativo. En lugar de predecir una única acción, el modelo genera una trayectoria completa de acciones futuras (ventana de predicción multi-paso), lo que mejora la suavidad y estabilidad del control en tareas de contacto como la manipulación de piezas pequeñas. Las observaciones de entrada son dos imágenes RGB (cámara superior del tablero y cámara en la muñeca) de resolución 480x640, junto con un vector de estado del robot de 6 dimensiones. La salida es un vector de acción de 6 dimensiones (probablemente posiciones o velocidades articulares).

El entrenamiento se realizó con el framework LeRobot versión 0.6.1, sobre un dataset de 359 episodios recopilados a 30 FPS, con un total de 134 694 frames. Las tareas consisten en movimientos legales de ajedrez (por ejemplo, "d2_d4", "g1_f3", "e2_e4") y capturas de piezas (tareas con sufijo "_bowl"). La configuración de entrenamiento incluye 50 000 pasos, batch size de 32, optimizador Adam con learning rate de 0.0001 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control robótico de un manipulador SO-101 para mover piezas de ajedrez en un tablero físico.
- Procesamiento de observaciones multimodales: dos cámaras RGB (vista del tablero y muñeca) y estado articular del robot.
- Generación de trayectorias de acción suaves y multi-paso gracias al proceso de difusión.
- Ejecución de 198 tareas distintas de movimientos de ajedrez, incluyendo aperturas, desarrollos y capturas.
- Inferencia en tiempo real (30 FPS) según la configuración de captura de las cámaras.
- No soporta tool calling, agentes ni razonamiento simbólico; es exclusivamente un policy de control.

## Casos de uso

- Automatización de partidas de ajedrez físicas: el modelo puede integrarse en un sistema robótico que juegue ajedrez contra humanos, moviendo piezas de forma autónoma tras recibir la orden del movimiento.
- Investigación en diffusion policies: sirve como referencia reproducible para estudiar el comportamiento de este tipo de arquitecturas en tareas de manipulación con contacto.
- Demostración de aprendizaje por imitación con LeRobot: útil para talleres y cursos que enseñen a entrenar políticas robóticas con datasets propios.
- Desarrollo de asistentes robóticos para juegos de mesa: la metodología puede extrapolarse a otros juegos de tablero con piezas pequeñas.
- Benchmark de control robótico en entornos reales: permite comparar el rendimiento de diffusion policies frente a otros métodos de control (actuación directa, transformadores de decisión, etc.).
- Prototipado de sistemas de manipulación fina en laboratorios de robótica, gracias a su licencia abierta y su integración con hardware SO-101.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un modelo de control robótico, no aplican métricas estándar de NLP como MMLU, HumanEval o GSM8K. La model card no reporta tasas de éxito en tareas reales ni métricas de error de seguimiento de trayectoria.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM, latencia o throughput.
- Dado que el modelo tiene 277,8 millones de parámetros y una arquitectura de difusión, se estima que la inferencia puede ejecutarse en GPUs consumer con al menos 8 GB de VRAM (por ejemplo, RTX 3060 o superior), aunque esta cifra es orientativa y no ha sido confirmada por el autor.
- El entrenamiento, con 50 000 pasos y batch 32, probablemente requiera una GPU con 16-24 GB de VRAM (como RTX 3090, A5000 o similar) para tiempos razonables.
- El despliegue se realiza a través del framework LeRobot, que soporta ejecución en local con `lerobot-rollout` y requiere conexión con el robot SO-101 y las cámaras.
- No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada modelos comparables de la misma categoría (diffusion policies para control robótico con características similares) con datos de rendimiento o especificaciones contrastables. Existen otros policies entrenados con LeRobot en el Hub, pero no se dispone de sus métricas para realizar una comparación rigurosa.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para el robot SO-101 y el dataset de ajedrez de AnonymousMouse404; no generaliza a otros robots, configuraciones de cámara o tareas sin reentrenamiento.
- Depende de la calibración y posicionamiento de las cámaras (board y wrist); cambios en la iluminación o perspectiva pueden degradar el rendimiento.
- Al ser un policy de imitación, puede fallar ante estados no vistos en el entrenamiento o movimientos adversarios del oponente.
- No se han reportado evaluaciones en el mundo real con métricas de éxito, por lo que su robustez en producción no está verificada.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el funcionamiento en entornos distintos al de entrenamiento.
- El dataset incluye tareas con la etiqueta "_bowl" que implican capturar piezas, lo que requiere precisión de contacto; el modelo puede presentar errores en estas maniobras si el robot no está bien calibrado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AnonymousMouse404/diffusion_chess_v3_fkloss)
- [Dataset de entrenamiento](https://huggingface.co/datasets/AnonymousMouse404/chess)
- [Paper de Diffusion Policy (arXiv:2303.04137)](https://huggingface.co/papers/2303.04137)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
