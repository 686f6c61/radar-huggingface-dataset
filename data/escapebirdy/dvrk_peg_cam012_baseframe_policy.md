# escapebirdy/dvrk_peg_cam012_baseframe_policy

## Resumen

`escapebirdy/dvrk_peg_cam012_baseframe_policy` es una política de control visuomotor entrenada con el framework LeRobot de Hugging Face y publicada por el usuario `escapebirdy`. Implementa Diffusion Policy, un enfoque que trata el control visuomotor como un proceso generativo de difusión y produce trayectorias de acción multimodales y suaves, adecuadas para tareas de manipulación con contacto rico (en este caso, una tarea de inserción de clavija o *peg-in-hole* sobre un banco de pruebas dVRK, el kit de investigación quirúrgica da Vinci). No es un modelo de lenguaje: es un modelo de robótica que mapea observaciones visuales y de estado a secuencias de acciones motoras.

El modelo tiene 426.609.994 parámetros (dato real de los pesos en safetensors) y un tamaño de repositorio de 1,7 GB, lo que sugiere pesos en precisión alta (fp32) o una combinación de precisiones. Se distribuye con licencia Apache 2.0 y está pensado para ejecutarse con la librería `lerobot`, tanto para reentrenamiento desde cero como para evaluación e inferencia sobre un robot físico o simulado.

Su relevancia es acotada pero concreta: es un artefacto de investigación reproducible para la comunidad de aprendizaje por imitación en robótica, con cero descargas y cero likes en el momento de la consulta, lo que indica que se trata de un checkpoint de trabajo personal más que de un modelo de referencia. El interés técnico está en la combinación de Diffusion Policy con un dataset específico de dVRK y un encuadre de cámara concreto (`cam012`, `baseframe`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política visuomotora generativa basada en difusión; backbone de red no detallado en la información disponible) |
| Parametros totales | 426.609.994 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; la política consume ventanas de observación, no texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 1,7 GB) |

## Arquitectura y entrenamiento

Diffusion Policy formula el control visuomotor como un problema de generación: en lugar de predecir una única acción de forma determinista, el modelo aprende a denoizar una trayectoria de acciones condicionada por las observaciones (imágenes de cámara y estado del robot). Esto permite representar distribuciones multimodales de comportamiento y producir secuencias de acción suaves y coherentes en el tiempo, lo que resulta especialmente útil en tareas con contacto, como la inserción de una clavija en un orificio. El paper de referencia es arXiv:2303.04137 (Chi et al., "Diffusion Policy: Visuomotor Policy Learning via Action Diffusion").

El entrenamiento se realizó con LeRobot sobre el dataset `escapebirdy/dvrk_peg_cam012_baseframe`, que no está descrito en detalle en la información disponible (no se indican número de episodios, frecuencia de control, composición de las observaciones ni resolución de las cámaras). La model card no documenta el número de tokens o muestras vistas, ni si hubo fases de ajuste fino adicionales. El pipeline de entrenamiento declarado en la propia model card usa `lerobot-train` con `--policy.type=act`, lo que constituye una inconsistencia con la etiqueta `diffusion` del modelo: conviene verificar el tipo de política real antes de reutilizar el checkpoint. No se documentan innovaciones técnicas adicionales más allá del propio esquema de difusión.

## Capacidades

- Generación de trayectorias de acción multimodales y temporalmente coherentes mediante difusión, en lugar de regresión determinista de acciones.
- Control visuomotor a partir de observaciones de cámara (el identificador sugiere el encuadre `cam012`) y de estado del robot en el marco base (`baseframe`).
- Ejecución de tareas de manipulación con contacto rico, específicamente una tarea de inserción de clavija sobre un entorno dVRK.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train`, grabación y evaluación con `lerobot-record`, y carga desde el Hub mediante `--policy.path`.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión general, audio, etc.): no disponibles más allá del uso de observaciones visuales como entrada de política.

## Casos de uso

- Investigación en aprendizaje por imitación sobre dVRK: servir como checkpoint de partida o línea base para comparar variantes de Diffusion Policy en tareas de inserción, reutilizando el dataset `dvrk_peg_cam012_baseframe` y el pipeline de LeRobot.
- Reproducción de experimentos de manipulación con contacto: el modelo permite evaluar la estabilidad de las trayectorias generadas en una tarea de *peg-in-hole*, un escenario clásico para medir el comportamiento de políticas generativas en presencia de contacto.
- Evaluación comparativa de políticas en LeRobot: al estar en formato safetensors y cargarse con `--policy.path`, se puede enfrentar contra políticas ACT u otras arquitecturas sobre el mismo conjunto de episodios de evaluación.
- Reentrenamiento con nuevos datos de la misma célula robótica: el comando `lerobot-train` documentado permite ajustar la política con un dataset propio del mismo entorno y comparar la curva de aprendizaje frente a este checkpoint.
- Docencia y formación en robótica de imitación: un ejemplo real y descargable de política visuomotora con licencia permisiva, útil para prácticas de despliegue en robot o en simulación.
- Despliegue en bucle cerrado sobre un seguidor tipo SO-100/SO-101: la model card incluye el comando `lerobot-record` con `--robot.type=so100_follower`, lo que permite probar la política en hardware de bajo coste, siempre que la configuración de cámaras y el espacio de acciones coincidan con los del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 426,6 M de parámetros, los pesos en fp32 ocupan aproximadamente 1,7 GB; en fp16 rondarían los 0,85 GB, a lo que hay que sumar activaciones y el codificador visual. Una estimación conservadora sitúa el requisito práctico en el rango de 2 a 6 GB de VRAM, pero no está confirmada por el autor.
- GPU recomendadas: no documentadas. Por tamaño, cualquier GPU con al menos 8 GB de VRAM (RTX 3060/4060, RTX 4070, RTX 4090, A100, H100) debería poder ejecutar la inferencia; la latencia del bucle de control es el factor limitante real, no la memoria.
- ¿Cabe en GPU de consumo? Sí, con alta probabilidad, dado el tamaño de los pesos; no hay confirmación oficial ni cifras de latencia publicadas.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`) es la vía documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de política robótica.
- Latencia y throughput estimados: no disponibles. En políticas de difusión, el coste por paso de control depende del número de pasos de denoizado y del scheduler, parámetros que no se detallan en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo de política | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `escapebirdy/dvrk_peg_cam012_baseframe_policy` | Diffusion Policy (LeRobot) | 426,6 M | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| Políticas ACT en LeRobot (p. ej. checkpoints de la organización `lerobot`) | ACT (transformer condicionado) | varía según checkpoint | no aplica | normalmente Apache 2.0 | Hugging Face |
| Diffusion Policy original (Chi et al., 2023) | Diffusion Policy | varía según configuración del paper | no aplica | según implementación del paper | Paper y repositorio de referencia |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada, por lo que la comparación se limita a tipo de arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una tarea concreta (inserción de clavija) sobre un dataset concreto (`dvrk_peg_cam012_baseframe`) y un encuadre de cámara concreto; no es un modelo generalista y su transferencia a otras tareas, objetos o configuraciones de cámara no está documentada.
- Ausencia de benchmarks: no hay métricas publicadas de éxito, precisión ni robustez, por lo que no se puede evaluar su calidad sin ejecutarla.
- Inconsistencia en la model card: la etiqueta declara `diffusion` pero el comando de entrenamiento de ejemplo usa `--policy.type=act`; verificar el tipo real de política antes de reutilizar el checkpoint.
- Riesgo de sobreajuste al entorno de entrenamiento: al no documentarse el número de episodios ni la variabilidad del dataset, no se puede descartar un ajuste excesivo a posiciones, iluminación o texturas específicas.
- Sin información sobre sesgos: no se documentan sesgos de ningún tipo, pero tampoco se documenta la diversidad del dataset, lo que impide evaluar la generalización.
- Alucinación: no aplica en el sentido lingüístico, pero sí existe el riesgo análogo de generar trayectorias plausibles y no válidas físicamente en estados fuera de distribución.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; no obstante, el uso en un contexto clínico real exigiría validación regulatoria independiente, dado el origen dVRK (quirúrgico) del entorno.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin señales de validación por parte de la comunidad; tratarlo como checkpoint de investigación, no como componente listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/escapebirdy/dvrk_peg_cam012_baseframe_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/escapebirdy/dvrk_peg_cam012_baseframe
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv:2303.04137)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
