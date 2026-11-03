# mrrl-emcnei/diffusion_acbag-slidelift-pick

## Resumen

`diffusion_acbag-slidelift-pick` es una política de control visuomotor entrenada con el método Diffusion Policy y publicada en el Hub de HuggingFace mediante la librería LeRobot. El modelo resuelve una tarea de manipulación robótica concreta: recoger una bolsa ("Pick up the pouch") con un robot móvil del tipo `mobileai_robot`, equipado con tres cámaras (una cenital y dos en las muñecas). Diffusion Policy trata el control visuomotor como un proceso generativo de difusión, produciendo trayectorias de acción suaves y multimodales que funcionan bien en tareas con contacto físico rico, donde los métodos de imitación deterministas tienden a promediar acciones y fallar.

El modelo tiene 293.326.840 parámetros (según los pesos en safetensors) y un tamaño de repositorio de 1,2 GB. Consume un vector de estado de 16 dimensiones y tres imágenes RGB de 480x640, y emite un vector de acción de 16 dimensiones, todo ello a 30 FPS. Ha sido entrenado sobre el dataset `mrrl-emcnei/acbag-slidelift-pick`, que contiene 50 episodios y 25.786 fotogramas de demostraciones teleoperadas.

Es relevante ahora porque ejemplifica el flujo de trabajo actual de la robótica open source: entrenamiento de imitación reproducible con LeRobot, pesos publicados con licencia Apache 2.0 y un pipeline de despliegue estandarizado (`lerobot-rollout`). No obstante, se trata de una política de nicho, sin resultados de evaluación publicados y con cero descargas en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor), implementado en LeRobot |
| Parametros totales | 293.326.840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones por paso a 30 FPS) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas; la tarea se especifica con la cadena "Pick up the pouch") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política sigue el método Diffusion Policy (Chi et al., arXiv:2303.04137), que formula la generación de acciones como un proceso de difusión condicionado por las observaciones. En lugar de predecir una única acción de forma determinista, el modelo muestrea trayectorias de acción multimodales, lo que le permite representar múltiples modos válidos de ejecución y producir movimientos suaves y coherentes en el tiempo, algo especialmente útil en manipulación con contacto. La implementación concreta corresponde al tipo `diffusion` de LeRobot, que combina un codificador visual para las tres cámaras con un vector de estado de 16 dimensiones como condicionamiento, y decodifica una acción de 16 dimensiones por paso.

El entrenamiento se realizó con LeRobot 0.6.2 durante 100.000 pasos, con tamaño de lote 8, optimizador Adam, tasa de aprendizaje 0,0001 y semilla 1000. El dataset de imitación contiene 50 episodios y 25.786 fotogramas a 30 FPS de la tarea "Pick up the pouch". No se documenta en la model card el uso de RLHF, DPO ni ningún ajuste posterior por preferencias; se trata de aprendizaje por imitación supervisado a partir de demostraciones. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal, que no aplican a este tipo de política.

## Capacidades

- Generación de trayectorias de acción visuomotoras para manipulación robótica, con salida de 16 dimensiones por paso.
- Control multimodal condicionado por tres cámaras RGB (cenital, muñeca izquierda y muñeca derecha) y un vector de estado de 16 dimensiones.
- Ejecución de una tarea concreta de recogida de objetos ("Pick up the pouch") sobre el robot `mobileai_robot`.
- Producción de acciones suaves y temporalmente coherentes gracias a la formulación por difusión.
- Despliegue e inferencia en tiempo real a 30 FPS mediante `lerobot-rollout`.
- No soporta tool calling, function calling, razonamiento multi-paso en lenguaje natural, ni capacidades multilingües, de visión general o de audio: es exclusivamente una política de control.

## Casos de uso

- Recogida de bolsas o paquetes en entornos logísticos: la política está entrenada específicamente para "Pick up the pouch" y puede desplegarse en un `mobileai_robot` para automatizar la recogida de sobres o bolsas en cintas o estanterías.
- Base para ajuste fino en tareas de pick-and-place: al estar publicada con licencia Apache 2.0 y en formato LeRobot, sirve como punto de partida para reentrenar con nuevos datasets de manipulación y adaptar la política a otros objetos.
- Investigación en aprendizaje por imitación: permite reproducir el pipeline completo de Diffusion Policy (grabación, entrenamiento y despliegue) y comparar variantes de difusión frente a métodos deterministas.
- Manipulación con contacto rico en laboratorio: la naturaleza generativa de la política la hace adecuada para experimentos donde el objeto debe deslizarse o levantarse con contacto físico, como el caso de la bolsa.
- Evaluación de robustez ante cambios de iluminación o posición: útil para estudiar la generalización de políticas de difusión entrenadas con solo 50 episodios.
- Docencia y demostraciones de robótica open source: el flujo `lerobot-rollout` con parámetros explícitos de robot y cámaras facilita montar demos reproducibles en cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y deja la tabla de éxito por tarea vacía. No se dispone de tasas de éxito, número de ensayos ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 293 millones de parámetros en safetensors (1,2 GB de repositorio), la inferencia en precisión completa requiere del orden de 1,2 GB solo para pesos, más el coste de las tres cámaras y del proceso de difusión.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente para inferencia; para entrenamiento con 100.000 pasos y lote 8 se recomienda una GPU con al menos 8-16 GB de VRAM, aunque el dato no está confirmado.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento), con soporte de dispositivo CUDA (`--policy.device=cuda`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: la política opera a 30 FPS según el dataset de entrenamiento, pero no se publican medidas de latencia ni throughput reales.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables de la misma tarea o tamaño con datos verificables de parámetros, contexto y rendimiento. La comparación con alternativas como ACT, VQ-BeT u otras políticas de LeRobot requeriría datos que no se incluyen en la model card.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay evidencia de tasa de éxito en el robot real, lo que impide valorar su fiabilidad en producción.
- Entrenada para una única tarea ("Pick up the pouch") y un único tipo de robot (`mobileai_robot`); no generaliza a otras tareas ni plataformas sin reentrenamiento.
- Dataset pequeño (50 episodios, 25.786 fotogramas): alta probabilidad de sobreajuste y baja robustez ante cambios de posición, iluminación o distractores.
- Dependencia de la configuración exacta de cámaras: los nombres `cam_high`, `cam_left_wrist` y `cam_right_wrist` deben coincidir con las claves de observación del entrenamiento.
- Sin capacidades de lenguaje, razonamiento ni tool calling; no debe confundirse con un modelo de propósito general.
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí de generar trayectorias no válidas fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar el cumplimiento de las dependencias de LeRobot.
- Cero descargas y cero likes en el momento de la ficha: modelo de nicho sin validación por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrrl-emcnei/diffusion_acbag-slidelift-pick
- Dataset de entrenamiento: https://huggingface.co/datasets/mrrl-emcnei/acbag-slidelift-pick
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mrrl-emcnei/acbag-slidelift-pick
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
