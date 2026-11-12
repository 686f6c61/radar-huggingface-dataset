# shangarot/moveT_TaskA_fix_100episodes

## Resumen

moveT_TaskA_fix_100episodes es una política de robótica entrenada con ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo ha sido desarrollado por el usuario shangarot y publicado en Hugging Face mediante la librería LeRobot, el framework de Hugging Face para aprendizaje automático en robótica real. Se trata de una política específica para el robot `so_follower` (tipo SO-100/SO-101), no de un modelo de lenguaje generalista.

El modelo resuelve una tarea concreta de manipulación: colocar correctamente una pieza en forma de T sobre una forma de T amarilla ("Correct T on yellow T shape" y "Correct T on yellow T shape 2"). Consume el estado articular del robot (6 dimensiones) y dos flujos de imagen de 480x640 píxeles (cámara superior y cámara de muñeca), y produce un vector de acción de 6 dimensiones.

Es relevante como ejemplo de política de imitación lista para desplegar en un robot de bajo coste, entrenada con 100 episodios (34.043 fotogramas a 30 FPS). Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real sobre hardware de consumo, no a razonamiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por fotograma) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural; recibe instrucción de tarea como texto) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que predice secuencias de acciones (action chunks) en lugar de una sola acción por paso. La política incorpora un codificador visual que procesa las dos cámaras (`top` y `wrist`, cada una con entrada `(3, 480, 640)`) y un transformer que fusiona la observación visual con el estado articular `(6,)` para generar un chunk de acciones de dimensión `(6,)`. El paper de referencia es "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705).

El entrenamiento se realizó sobre el dataset `shangarot/moveT_TaskA_fix_100episodes`, con 100 episodios, 34.043 fotogramas a 30 FPS y dos variantes de tarea. La configuración reportada es: 40.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot versión 0.7.1. No se documentan técnicas de RLHF, DPO ni aumentos de datos adicionales; es aprendizaje supervisado puro a partir de demostraciones de teleoperación.

## Capacidades

- Control de robot manipulador de 6 grados de libertad mediante predicción de chunks de acción.
- Percepción visual multimodal con dos cámaras simultáneas (vista superior y vista de muñeca).
- Ejecución de tareas de ensamblaje/colocación de precisión ("Correct T on yellow T shape").
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin recompensa explícita.
- Inferencia en tiempo real compatible con el bucle de control de LeRobot a 30 FPS.
- No soporta tool calling, function calling, agentes multi-paso, ni generación de texto libre.
- No dispone de capacidades multilingües ni de razonamiento simbólico; la instrucción de tarea se pasa como cadena de texto fija.

## Casos de uso

- Automatización de ensamblaje de precisión en línea de montaje: la política inserta o corrige la orientación de una pieza en T sobre una base amarilla, usando la cámara de muñeca para el alineamiento fino y la superior para la aproximación gruesa.
- Prototipado rápido de tareas de manipulación en laboratorio: con 100 episodios y 40.000 pasos de entrenamiento se obtiene una política funcional que sirve de base para iterar sobre el dataset antes de escalar a producción.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible de ACT sobre hardware de bajo coste (SO follower), útil para comparar hiperparámetros o variantes de aumento de datos.
- Benchmark de pipelines LeRobot: el modelo permite validar el flujo `lerobot-rollout` → `lerobot-train` → despliegue en un robot físico antes de invertir en datasets mayores.
- Educación y formación en robótica: el modelo y su dataset asociado permiten demostrar el ciclo completo de teleoperación, grabación, entrenamiento y evaluación sin necesidad de GPUs de gama alta.
- Control reactivo con feedback visual: al consumir dos cámaras a 30 FPS, la política puede corregir desviaciones de la pieza durante la ejecución, no solo planificar en bucle abierto.
- Base para fine-tuning en tareas similares: al ser un modelo compacto (0,2 GB), se puede reentrenar con nuevos datasets de la misma familia de tareas en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No hay tasas de éxito, número de ensayos ni comparaciones con otras políticas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,7 M de parámetros en safetensors (0,2 GB en disco). En FP32 requiere aproximadamente 0,2 GB de VRAM para los pesos; el consumo real vendrá dominado por los dos flujos de imagen de 480x640 y el búfer de inferencia, estimado en 1-2 GB en total con overhead de framework.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior cubre el caso de uso con holgura. Para entrenamiento, se recomienda al menos 8-12 GB de VRAM por el batch de imágenes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 4 GB en adelante es probablemente suficiente; no verificado en la información disponible).
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`), con backend PyTorch. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. El control opera a 30 FPS (33 ms por paso), pero no se reportan latencias medidas de la política.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moveT_TaskA_fix_100episodes (ACT) | 51,7 M | Política de imitación ACT | Chunk de acciones; sin contexto textual | no disponible | Hugging Face (LeRobot) |
| Políticas ACT genéricas de LeRobot | variable (típicamente 50-80 M) | Política de imitación ACT | Chunk de acciones | Apache-2.0 (LeRobot) | Hugging Face (LeRobot) |
| Políticas Diffusion Policy | variable (mayor que ACT) | Política de imitación por difusión | Chunk de acciones | variable según autor | Hugging Face / repos de investigación |
| Políticas VLA (p. ej. RT-2, OpenVLA) | miles de millones | Vision-Language-Action | Contexto textual + visión | variable (a menudo restrictiva) | Principalmente investigación |

La comparación directa con modelos VLA no es homogénea: ACT es una política específica de tarea, mucho más pequeña y ligera, sin comprensión de lenguaje. Frente a Diffusion Policy, ACT es generalmente más rápido en inferencia pero puede ser menos expresivo en distribuciones multimodales de acciones. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política solo ha sido entrenada para la tarea "Correct T on yellow T shape" (y su variante 2); no generaliza a otras tareas sin reentrenamiento.
- Licencia no especificada: la model card indica "[More Information Needed]"; no se puede asumir uso comercial sin consultar al autor.
- Sin resultados de evaluación: no hay tasas de éxito reportadas, por lo que el rendimiento real en el robot es desconocido.
- Dependencia del hardware y calibración: requiere un robot `so_follower` con dos cámaras configuradas exactamente con los nombres `top` y `wrist` y las resoluciones de entrenamiento (480x640); cualquier cambio de cámara, iluminación o posición invalida la política.
- Riesgo de sobreajuste al dataset: 100 episodios y 34.043 fotogramas es un volumen modesto; es probable que la política falle ante posiciones de objeto, distracciones o condiciones de iluminación no vistas.
- Sin capacidades de lenguaje ni razonamiento: no se puede usar como modelo de texto, código o agentes; la "instrucción" de tarea es una etiqueta fija.
- Sin cuantizaciones publicadas: no se ofrecen versiones GGUF/ONNX ni optimizaciones para despliegue en edge.
- Sin datos de sesgos: no se documentan sesgos demográficos ni de otro tipo, aunque al ser una política visual podría heredar sesgos de las demostraciones (posiciones, objetos y condiciones del entorno de grabación).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shangarot/moveT_TaskA_fix_100episodes
- Dataset de entrenamiento: https://huggingface.co/datasets/shangarot/moveT_TaskA_fix_100episodes
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shangarot/moveT_TaskA_fix_100episodes
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
