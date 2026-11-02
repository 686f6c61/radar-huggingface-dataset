# namiciro/red-to-right-act-policy

## Resumen

`namiciro/red-to-right-act-policy` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv 2304.13705. El modelo lo ha entrenado el usuario namiciro y lo ha subido a HuggingFace Hub mediante la librería LeRobot de HuggingFace. No es un modelo de lenguaje: es una política visomotora que mapea observaciones (estado del robot y una imagen de cámara frontal) a comandos de acción de 6 dimensiones para un robot tipo `so_follower` (SO-100/SO-101 de LeRobot).

El modelo resuelve una tarea concreta y muy acotada: "Put the red block in the right box" (colocar el bloque rojo en la caja derecha). Se ha entrenado con solo 10 episodios de teleoperación (5234 fotogramas a 30 FPS) durante 10000 pasos, lo que lo convierte en una política de demostración o prueba de concepto más que en un sistema listo para producción. Su relevancia es fundamentalmente didáctica: ilustra el flujo completo de LeRobot para grabar datos, entrenar una política ACT y desplegarla en un robot de bajo coste.

Con 51.668.614 parámetros (unos 51,7 M), el checkpoint ocupa 0,2 GB en formato safetensors. No dispone de model card con licencia, idiomas ni resultados de evaluación, y no se ha publicado ninguna métrica de éxito en robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer condicionado por observaciones con cabeza de acción por chunks |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política robótica; ventana de observación por paso, sin contexto de texto) |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones; pesos en safetensors de precisión completa) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica como cadena en el rollout) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (repo de 0,2 GB, librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones (varios pasos de acción de una vez) en lugar de una única acción por paso, lo que reduce el error de acumulación y suaviza la ejecución. La arquitectura es un transformer que recibe como entrada el estado del robot (`observation.state`, vector de 6 dimensiones) y una imagen RGB frontal de 3×480×640, y produce un vector de acción de 6 dimensiones. El modelo se entrenó con el dataset `namiciro/red-to-right-test`, compuesto por 10 episodios y 5234 fotogramas a 30 FPS de la tarea "Put the red block in the right box", capturados con un robot `so_follower` y una única cámara frontal.

La configuración de entrenamiento documentada es: 10000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.2. No se especifica el número de tokens ni composición de dataset más allá de los episodios citados, ni si hubo RLHF/DPO (no aplica en este paradigma: es imitación supervisada pura). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal; el método base es el ACT original.

## Capacidades

- Control visomotor para una tarea de manipulación concreta: recoger un bloque rojo y depositarlo en la caja derecha.
- Entrada multimodal: estado propioceptivo de 6 dimensiones más imagen RGB frontal de 480×640.
- Salida de acciones de 6 dimensiones por paso, ejecutables en un robot `so_follower`.
- Predicción por chunks de acción (característica del método ACT), que mejora la estabilidad frente a políticas paso a paso.
- Ejecución en bucle cerrado a 30 FPS mediante `lerobot-rollout`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Demostración educativa de imitación robótica: sirve para mostrar el ciclo completo de LeRobot (grabación con teleoperación, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`) en talleres y cursos.
- Prueba de concepto de pick-and-place: validar la cadena hardware-software de un robot SO-100/SO-101 antes de escalar a tareas más complejas.
- Benchmark interno de infraestructura: medir latencia de inferencia y estabilidad de un pipeline ACT en una GPU concreta usando una política de referencia pequeña (51,7 M de parámetros).
- Generación de datos sintéticos de validación: usar la política como baseline para comparar nuevas grabaciones del mismo dataset y detectar regresiones en el pipeline de entrenamiento.
- Prototipado de aplicaciones de manipulación en laboratorio: punto de partida para reentrenar con más episodios y ampliar la tarea (otros objetos, otras cajas) manteniendo la misma arquitectura.
- Docencia en robótica de bajo coste: ilustrar conceptos de chunking de acciones y condicionamiento visual con un modelo que cabe en cualquier GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tabla de éxito en robot real, ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros y pesos en safetensors de precisión completa, el checkpoint ocupa unos 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA consumer (RTX 3060, RTX 4060, RTX 4090) es suficiente; también tarjetas de gama de entrada. Para entrenamiento conviene al menos 8-12 GB de VRAM por el batch de imágenes 480×640.
- Cabe en GPU consumer: sí, sin problema; incluso en iGPU o CPU para inferencia a baja frecuencia.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--strategy.type=base`; el modelo se carga desde el Hub con `--policy.path=namiciro/red-to-right-act-policy`. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles en la información proporcionada; la ejecución se plantea a 30 FPS según la tasa del dataset, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| namiciro/red-to-right-act-policy | 51,7 M | no aplica | Pick-and-place bloque rojo | no disponible | HuggingFace Hub (LeRobot) |
| Políticas ACT de referencia en LeRobot | ~50 M (típico) | no aplica | Tareas de manipulación variadas | según repo | HuggingFace Hub / docs LeRobot |
| Diffusion Policy (referencia) | variable | no aplica | Manipulación visomotora | según implementación | Repos académicos y LeRobot |
| π0 / π0-fast (Physical Intelligence) | no disponible | no aplica | Manipulación generalista | no disponible | no disponible |

No se dispone de datos de rendimiento comparables publicados para este checkpoint concreto, por lo que la comparación se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- Entrenado con solo 10 episodios y una única tarea; la generalización a posiciones, iluminación u objetos distintos es muy limitada.
- Sin resultados de evaluación en robot real: no hay evidencia publicada de tasa de éxito.
- Depende de la cámara y del robot exactos (`so_follower`, cámara `front` a 480×640, 30 FPS); cambiar la configuración invalida la política.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Riesgo de sobreajuste al dataset de demostración y de fallos ante distracciones visuales o cambios de fondo.
- No procesa lenguaje natural ni instrucciones arbitrarias; la tarea es fija.
- No hay información sobre sesgos (no aplica en el sentido de LLM) ni sobre robustez frente a perturbaciones.
- Para producción sería necesario reentrenar con muchos más episodios y validar con métricas de éxito reproducibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/namiciro/red-to-right-act-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/namiciro/red-to-right-test
- Paper ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
