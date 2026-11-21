# LiberalMind/robot-policy

## Resumen

`LiberalMind/robot-policy` es un checkpoint de pesos en formato PyTorch (`.pt`) publicado por la iniciativa independiente LiberalMind bajo el nombre interno "LiberalMind Panda Policy". No es un modelo de lenguaje: es una política neuronal entrenada mediante aprendizaje por refuerzo para controlar un manipulador robótico Franka Emika Panda de 7 grados de libertad con pinza paralela, dentro del simulador de física PyBullet. El repositorio contiene únicamente el fichero `best.pt` (0,1 GB), sin código de arquitectura, preprocesado de observaciones ni mapeo de acciones.

El modelo resuelve, en principio, el problema de generar comandos de control a partir de observaciones del entorno simulado, pero su utilidad práctica inmediata es muy limitada: la propia model card reconoce que la arquitectura de la política, la normalización de observaciones y la convención de acciones no se han publicado todavía. El roadmap del proyecto marca como pendientes la reconstrucción de la arquitectura, la conexión con el simulador y la evaluación de manipulación autónoma, de modo que el checkpoint no es ejecutable de extremo a extremo tal y como se distribuye.

Por su naturaleza, no dispone de parámetros totales declarados, longitud de contexto, tokenizador ni soporte multilingüe en el sentido de los modelos generativos. La relevancia actual es la de un artefacto de investigación preliminar en el ámbito de la IA encarnada (embodied AI), útil como referencia para quienes exploren políticas de control en PyBullet, pero sin garantías de reproducibilidad ni resultados publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal para control robótico; arquitectura no publicada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en coma flotante; no se documentan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | en (etiqueta de idioma del repositorio; sin implicación de capacidades lingüísticas) |
| Licencia | other (licencia personalizada no especificada en la model card) |
| Formato de pesos | PyTorch `.pt` (`best.pt`), cargado con `torch.load` |

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura de la política: no se especifica si se trata de un perceptrón multicapa, una red convolucional, un transformer de políticas (por ejemplo, tipo diffusion policy o ACT) ni qué representación de observaciones consume (estados proprioceptivos, imágenes RGB-D o ambos). Tampoco se indica el algoritmo de aprendizaje por refuerzo empleado (PPO, SAC, TD3 u otro), el número de pasos de entrenamiento, la composición del dataset ni si hubo fases de imitación, RLHF o ajuste fino posterior.

El único dato técnico verificable es el pipeline declarado en Hugging Face: `reinforcement-learning`, con la librería PyTorch y el simulador PyBullet como entorno de entrenamiento y evaluación. El repositorio incluye un script de "smoke test" que carga el URDF `franka_panda/panda.urdf` y fija una pose articular predefinida, pero el propio autor aclara que no se trata de un rollout de la política entrenada. La reconstrucción de la arquitectura y la integración con el simulador figuran como tareas pendientes en el roadmap.

## Capacidades

- Generación de comandos de control articular para un manipulador Franka Emika Panda de 7 DoF con pinza paralela, presumiblemente a partir de observaciones del entorno simulado.
- Aprendizaje por refuerzo aplicado a manipulación robótica en simulación (PyBullet).
- Orientación a investigación en IA encarnada y transferencia sim-a-real (esta última aún no validada).
- No dispone de generación de texto, razonamiento lingüístico, código ni matemáticas.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente multi-paso en el sentido de los LLM.
- No dispone de visión, audio ni modo "thinking".
- Capacidades multilingües: no aplica.

## Casos de uso

- Investigación en políticas de control para Franka Panda en PyBullet: el checkpoint puede servir como punto de partida para quienes reconstruyan la arquitectura y el pipeline de observaciones, siempre que se disponga del código de entrenamiento original.
- Reproducción de experimentos de aprendizaje por refuerzo en simulación: útil para comparar curvas de aprendizaje o configuraciones de recompensa, una vez recuperada la arquitectura.
- Docencia en robótica e IA encarnada: el ejemplo de carga del URDF y el bucle de simulación incluidos en la model card sirven como plantilla didáctica para inicializar un entorno Panda en PyBullet.
- Benchmarking interno de pipelines de simulación: el checkpoint permite validar infraestructura de carga de pesos, gestión de dispositivos y serialización antes de abordar políticas más complejas.
- Exploración de transferencia sim-a-real: si en el futuro se valida la política, podría emplearse como base para experimentos de domain randomization y adaptación al robot físico.
- Estudio de artefactos de investigación preliminares: análisis de buenas prácticas de publicación de checkpoints (documentación de arquitectura, normalización y convenciones de acción), un aspecto habitualmente deficitario en repositorios de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito en tareas de manipulación, recompensas medias, curvas de aprendizaje ni comparaciones con políticas de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,1 GB) sugiere un checkpoint pequeño, probablemente inferior a 100 MB de pesos, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponible; para una política de este tamaño, cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) sería suficiente en términos de memoria, aunque no hay datos oficiales.
- Compatibilidad con GPU consumer: probablemente sí, dado el reducido tamaño del fichero, pero no verificado.
- Opciones de despliegue: carga directa con `torch.load` en Python 3.10 o superior; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Dependencias declaradas: `torch`, `huggingface_hub` y `pybullet`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye políticas comparables (por ejemplo, Diffusion Policy, ACT, RT-1 o RT-2) con datos verificables de parámetros, contexto o rendimiento, y este repositorio carece de benchmarks que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El checkpoint no es ejecutable de forma autónoma: faltan la arquitectura, el preprocesado de observaciones, la normalización y el mapeo de acciones.
- No se han publicado métricas de rendimiento ni evaluaciones de manipulación, por lo que se desconoce si la política funciona.
- El proyecto está en estado de investigación y su roadmap muestra hitos clave sin completar (reconstrucción de arquitectura, conexión al simulador, evaluación, generalización y transferencia al hardware real).
- La licencia es "other" sin texto disponible; no se puede asumir uso comercial sin consultar al autor.
- El entrenamiento se realizó en simulación (PyBullet); no hay evidencia de transferencia a un robot físico ni de robustez ante variaciones del entorno.
- Riesgo de alucinación: no aplica en el sentido de los LLM, pero sí existe riesgo de comportamientos erráticos o inseguros si se ejecuta en hardware real sin validación previa.
- Sesgos conocidos: no documentados; en robótica, los sesgos de simulación (dinámica simplificada, ausencia de fricción realista) pueden degradar el rendimiento en el mundo físico.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/LiberalMind/robot-policy
- Model card del autor: incluida en el repositorio de Hugging Face (sección README)
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados al modelo.
