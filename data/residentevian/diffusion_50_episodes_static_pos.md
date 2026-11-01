# ResidentEvian/diffusion_50_episodes_static_pos

## Resumen

`ResidentEvian/diffusion_50_episodes_static_pos` es una política de control visuomotor entrenada con el algoritmo Diffusion Policy y empaquetada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de robótica que transforma observaciones (estado articular de 6 dimensiones y dos cámaras RGB de 480x640) en comandos de acción de 6 dimensiones para un robot seguidor de tipo `so_follower` (SO-100/SO-101 de LeRobot).

El modelo resuelve una tarea de manipulación concreta: coger un cubo azul y colocarlo dentro de una caja naranja. Se entrenó mediante aprendizaje por imitación sobre un dataset propio de 50 episodios (16 789 fotogramas a 30 FPS) grabado por el autor. La arquitectura sigue el paper Diffusion Policy (Chi et al., 2023), que formula el control como un proceso generativo de difusión que produce trayectorias de acción suaves y multimodales, especialmente útiles en manipulación con contacto.

Su relevancia es acotada: es un experimento de un autor individual con 29 descargas y sin resultados de evaluación publicados. Resulta útil como ejemplo reproducible del flujo de trabajo de LeRobot (grabación de datos, entrenamiento y despliegue) y como punto de partida para quien quiera entrenar su propia política de imitación, pero no es un modelo listo para producción ni generaliza fuera de su tarea y su montaje físico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor), implementado en LeRobot |
| Parametros totales | 277 840 246 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la política, no documentada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (modelo no lingüístico; la tarea se especifica con una instrucción en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 1,1 GB) |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, un enfoque que trata el control visuomotor como un proceso generativo: en lugar de predecir directamente la acción siguiente, aprende a denoizar trayectorias de acción completas condicionadas en la observación. Esto produce movimientos suaves y permite representar distribuciones multimodales de comportamiento, lo que ayuda en tareas de manipulación con contacto físico. La entrada combina el estado del robot (`observation.state`, vector de 6) con dos imágenes RGB (`observation.images.top` y `observation.images.wrist`, 3x480x640 cada una); la salida es un vector de acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `ResidentEvian/blue-cube-into-box_20261015_112154`: 50 episodios, 16 789 fotogramas a 30 FPS, con la tarea "Grab the blue cube and put it in the orange box". La configuración fue de 20 000 pasos, batch de 8, optimizador Adam, learning rate 1e-4 y semilla 1000. No se documenta el número de tokens ni la composición detallada del dataset, ni si hubo fases de refinamiento posteriores. El robot objetivo es un `so_follower` con cámaras `top` y `wrist`.

## Capacidades

- Generación de trayectorias de acción de 6 dimensiones para control de un brazo robótico seguidor `so_follower`.
- Percepción visual a partir de dos cámaras (vista superior y vista de muñeca) a 480x640 y 30 FPS.
- Ejecución de una única tarea de manipulación: coger un cubo azul y meterlo en una caja naranja.
- Control reactivo basado en estado articular más imágenes, sin planificación simbólica ni razonamiento de alto nivel.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento en lenguaje natural.
- No tiene capacidades multilingües ni de generación de texto, audio o visión general.
- No dispone de modo "thinking" ni de mecanismos de decodificación especulativa.

## Casos de uso

- Reproducción de un pipeline de imitación completo: sirve como referencia para grabar un dataset con LeRobot, entrenar una política de difusión y desplegarla con `lerobot-rollout`, usando este modelo como plantilla de configuración.
- Demostración educativa de Diffusion Policy: útil en cursos o talleres de robótica para ilustrar cómo se formula el control como un proceso generativo y cómo se comparan sus salidas con políticas deterministas.
- Punto de partida para fine-tuning: un equipo puede reentrenar o adaptar esta política con su propio dataset de tareas similares (pick-and-place de objetos pequeños) partiendo de la configuración documentada.
- Prueba de concepto en un montaje SO-100/SO-101: permite validar la cadena hardware-software (cámaras, calibración, puerto serie) antes de invertir en un dataset propio.
- Benchmark interno de manipulación: sirve como línea base para comparar variantes de política (diffusion frente a ACT o VQ-BeT) sobre la misma tarea y el mismo robot.
- Automatización de una celda de laboratorio muy concreta: si el entorno coincide exactamente con el del dataset (misma iluminación, posiciones y objetos), puede ejecutar la tarea de forma repetida durante sesiones cortas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No hay tasas de éxito, número de ensayos ni comparaciones con otras políticas.

## Requisitos de hardware

- El modelo tiene 277,8 millones de parámetros y pesa 1,1 GB en safetensors; la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- VRAM estimada: menos de 4 GB en FP32 para los pesos, más el coste de procesar dos imágenes de 480x640 por paso; en la práctica, una GPU con 8 GB o más es suficiente.
- GPU recomendadas: RTX 3060/4060 o superiores para inferencia en tiempo real a 30 FPS; A100/H100 no son necesarios para esta carga.
- Cabe en GPU consumer: sí, en cualquier tarjeta con 8 GB o más; también es viable en CPU para pruebas no críticas, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=ResidentEvian/diffusion_50_episodes_static_pos`), PyTorch nativo; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dependen del hardware y del número de pasos de denoización configurados, que no se documenta.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ResidentEvian/diffusion_50_episodes_static_pos | Diffusion Policy (LeRobot) | 277,8 M | no aplica | apache-2.0 | Hugging Face, 29 descargas |
| Políticas ACT de LeRobot | Transformer con acción chunking | no disponible | no aplica | apache-2.0 (típicamente) | Hub de LeRobot |
| Políticas VQ-BeT de LeRobot | Transformer con discretización de acciones | no disponible | no aplica | apache-2.0 (típicamente) | Hub de LeRobot |
| Diffusion Policy original (Chi et al.) | Diffusion Policy | no disponible | no aplica | código de referencia | Repositorio académico |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a tipo de arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay evidencia de tasa de éxito ni de robustez; no debe asumirse que funciona fuera del montaje exacto del autor.
- Sobreajuste a la tarea y al entorno: entrenado con solo 50 episodios de una única tarea ("coger el cubo azul y meterlo en la caja naranja"); cambios de iluminación, posición de objetos, fondo o robot probablemente degraden el comportamiento.
- Dependencia del hardware: requiere un robot `so_follower` y dos cámaras con los nombres y resoluciones exactos (`top`, `wrist`, 480x640, 30 FPS); cualquier desviación invalida la política.
- Riesgo de alucinación en sentido amplio: como política generativa, puede producir trayectorias plausibles pero incorrectas ante observaciones fuera de distribución, sin mecanismo de verificación.
- Sesgos: el dataset refleja un único operador, un único entorno y una única estrategia de agarre; la política hereda esos sesgos de comportamiento.
- Licencia apache-2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte.
- Sin soporte multilingüe ni de texto: no es adecuado para tareas de lenguaje, y la instrucción de tarea se pasa como cadena en inglés.
- Madurez baja: 29 descargas, 0 likes, creado y actualizado el mismo día (27 de octubre de 2026), sin demo ni vídeo de validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ResidentEvian/diffusion_50_episodes_static_pos
- Dataset de entrenamiento: https://huggingface.co/datasets/ResidentEvian/blue-cube-into-box_20261015_112154
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ResidentEvian/blue-cube-into-box_20261015_112154
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
