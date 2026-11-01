# ResidentEvian/diffusion_100_episodes_varying_pos

## Resumen

`ResidentEvian/diffusion_100_episodes_varying_pos` es una política de control visuomotor entrenada con el algoritmo Diffusion Policy y publicada en el Hub mediante LeRobot. El modelo resuelve una tarea de manipulación robótica concreta: coger un cubo azul y depositarlo dentro de una caja naranja, con posiciones variables de los objetos. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino una política de imitación que mapea observaciones (estado articular de 6 dimensiones y dos imágenes RGB de 480x640) a acciones de 6 dimensiones.

La relevancia de esta ficha es acotada: se trata de un artefacto reproducible de investigación, con 277,8 millones de parámetros, entrenado sobre 100 episodios (51.805 fotogramas a 30 FPS) durante 20.000 pasos con el optimizador Adam. Su interés práctico reside en servir como referencia para quienes trabajan con el robot SO-100/SO-101 (tipo `so_follower`) y quieren reproducir o comparar pipelines de Diffusion Policy en LeRobot 0.6.1.

No se han publicado resultados de evaluación en la model card, por lo que cualquier afirmación sobre su tasa de éxito en el mundo real queda fuera del alcance de la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de acciones basado en difusión; detalles internos de la red no disponibles) |
| Parametros totales | 277.840.246 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las instrucciones de tarea son texto fijo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` (SO-100/SO-101) |
| Entradas | `observation.state` (6,), `observation.images.top` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 1,1 GB |
| Libreria | LeRobot 0.6.1 |

## Arquitectura y entrenamiento

La política sigue el método Diffusion Policy (Chi et al., 2023, arXiv:2303.04137), que formula el control visuomotor como un proceso generativo de difusión: en lugar de predecir una acción única de forma determinista, el modelo aprende a generar trayectorias de acción multimodales y suaves mediante un proceso iterativo de eliminación de ruido. Este enfoque es especialmente adecuado para tareas de manipulación con contacto rico, donde las distribuciones de acciones son multimodales y una regresión directa tiende a promediar modos incompatibles.

El entrenamiento se realizó con LeRobot 0.6.1 sobre 100 episodios y 51.805 fotogramas a 30 FPS del dataset `ResidentEvian/blue-cube-into-box-varying-position_20261015_123135`, con 20.000 pasos, batch size 8, optimizador Adam, learning rate 1e-4 y semilla 1000. La tarea es «Grab the blue cube and put it in the orange box, varying positions». No se especifican en la información disponible la composición exacta del dataset, el número de tokens (no aplica) ni si hubo etapas de RLHF/DPO (no aplica a imitación). Tampoco se detalla la arquitectura interna de la red de difusión (número de pasos de difusión, backbone visual, etc.).

## Capacidades

- Generación de trayectorias de acción de 6 dimensiones para un robot `so_follower` a partir de dos cámaras (vista superior y vista de muñeca) y del estado articular.
- Manipulación visuomotora con contacto rico: la formulación por difusión produce acciones suaves y multimodales, adecuadas para agarre y colocación de objetos.
- Generalización limitada a variaciones de posición de los objetos, según indica el nombre del dataset y la descripción de la tarea.
- Ejecución en bucle cerrado mediante `lerobot-rollout` con estrategia `base`.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del pipeline robótico.

## Casos de uso

- Reproducción de un baseline de Diffusion Policy: sirve como punto de partida para comparar variantes de política (ACT, VQ-BeT, etc.) sobre el mismo dataset y robot, gracias a que el pipeline de LeRobot permite entrenar y evaluar con comandos reproducibles.
- Pick-and-place de laboratorio: el modelo ejecuta la tarea «coger cubo azul y meterlo en caja naranja» con posiciones variables, útil en entornos controlados de investigación para validar hardware SO-100/SO-101.
- Docencia y formación en imitación robótica: al estar entrenado con solo 100 episodios y 20.000 pasos, es un ejemplo asequible para explicar el flujo completo de LeRobot (grabación, entrenamiento, rollout).
- Pruebas de integración de hardware: permite validar la calibración de cámaras `top` y `wrist`, el puerto del robot y la frecuencia de 30 FPS antes de invertir en datasets propios.
- Generación de datos sintéticos de evaluación: las trayectorias generadas pueden usarse para estudiar la estabilidad del control por difusión en tareas de contacto.
- Comparación de estrategias de despliegue: útil para medir latencia de inferencia en distintas GPUs con el mismo checkpoint y la misma tarea.
- Base para fine-tuning: al estar bajo Apache 2.0, puede adaptarse a tareas similares (otro objeto, otra caja) con un dataset propio de pocos episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: «No evaluation results have been provided for this policy yet», y la sección de evaluación aparece con la plantilla vacía.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 277,8 M de parámetros en safetensors (1,1 GB de repositorio), la inferencia en fp32 requiere del orden de 1,1 GB solo para pesos, más activaciones de las dos imágenes 480x640; en la práctica se recomienda una GPU con al menos 4-8 GB de VRAM, aunque este dato es una estimación y no una cifra publicada por el autor.
- GPU recomendadas: no disponibles en la información. Por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) debería poder alojar el modelo; no se confirma compatibilidad concreta.
- Cabe en GPU consumer: probable por el tamaño de pesos, pero no verificado en la documentación.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) y `lerobot-train` con `--policy.device=cuda`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política se ejecuta a 30 FPS según la frecuencia del dataset, pero no se publica latencia medida.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparación se limita a características estructurales. No se han identificado en la información proporcionada políticas comparables publicadas por el mismo autor ni resultados de terceros sobre el mismo dataset.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ResidentEvian/diffusion_100_episodes_varying_pos` | 277,8 M | no aplica | sin evaluar | Apache 2.0 | HuggingFace, 24 descargas |
| Otras políticas Diffusion Policy en LeRobot | no disponible | no aplica | no disponible | habitualmente Apache 2.0 | Hub de HuggingFace |
| Políticas ACT en LeRobot | no disponible | no aplica | no disponible | habitualmente Apache 2.0 | Hub de HuggingFace |

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito publicada, ni número de ensayos, ni condiciones de prueba. No debe asumirse que la política funciona en producción.
- Generalización restringida: entrenada solo con 100 episodios y una tarea concreta (cubo azul a caja naranja con posiciones variables). Cambios de iluminación, distractores, otros objetos o un robot distinto del `so_follower` pueden degradar el comportamiento.
- Dependencia de hardware específico: requiere el robot `so_follower` y dos cámaras con los nombres `top` y `wrist` y resolución 480x640 a 30 FPS. Un desajuste en los nombres o en la calibración invalida la política.
- Sin información sobre sesgos: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero sí posibles sesgos de recogida de datos (posiciones, iluminación, operador) que no se documentan.
- Riesgo de alucinación en sentido figurado: la política puede generar trayectorias plausibles pero incorrectas en estados fuera de distribución; no hay mecanismo de verificación ni de aborto seguro documentado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción exige validación propia.
- Repositorio con 0 likes y 24 descargas: ecosistema mínimo, sin issues ni discusión pública que permita contrastar experiencias.
- El comando de ejemplo de la model card usa `--policy.path=ResidentEvian/diffusion_100_ep_varying_pos`, que no coincide exactamente con el ID del repositorio (`diffusion_100_episodes_varying_pos`); conviene verificar la ruta antes de ejecutar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ResidentEvian/diffusion_100_episodes_varying_pos
- Dataset de entrenamiento: https://huggingface.co/datasets/ResidentEvian/blue-cube-into-box-varying-position_20261015_123135
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ResidentEvian/blue-cube-into-box-varying-position_20261015_123135
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
