# knight7024/act_pick_and_place_tape_final_chunk10

## Resumen

`act_pick_and_place_tape_final_chunk10` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv:2304.13705. El modelo lo ha desarrollado el usuario de Hugging Face `knight7024` y se distribuye a través de la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es una política visuomotora que, a partir del estado de las articulaciones y de dos cámaras, predice directamente comandos de acción para un brazo robótico.

El modelo resuelve una tarea concreta de manipulación: coger un objeto y colocarlo en una posición objetivo («pick_and_place_tape»). Se ha entrenado exclusivamente con 50 episodios de teleoperación (16 278 fotogramas a 30 FPS) sobre un robot de tipo `so_follower`, con dos vistas de cámara (superior y de muñeca). La arquitectura ACT predice fragmentos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error acumulado y suaviza la ejecución.

Con 51 576 454 parámetros y un repositorio de 0,2 GB, es un modelo ligero que cabe en cualquier GPU consumer y se ejecuta en tiempo real. Su relevancia es práctica: sirve como ejemplo reproducible de un pipeline completo de imitación con LeRobot, desde la grabación del dataset hasta el despliegue con `lerobot-rollout`. No obstante, es una política de un único autor, sin resultados de evaluación publicados y entrenada para un robot y una tarea específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visuomotora |
| Parametros totales | 51 576 454 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; ventana temporal definida por el *chunk size* = 10, según el nombre del repositorio) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8/FP16) |
| Idiomas soportados | no disponible (modelo no lingüístico; la tarea se especifica con un *prompt* de texto, «pick_and_place_tape») |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer codificador-decodificador con un codificador visual (típicamente ResNet) que procesa las imágenes de las cámaras y un decodificador que genera un *chunk* de acciones futuras. La innovación central del método es predecir secuencias cortas de acciones en lugar de una sola acción por paso, lo que mitiga el problema de *compounding error* de las políticas de imitación y produce movimientos más suaves. El modelo consume `observation.state` (vector de 6 dimensiones), una imagen superior de 3×240×320 y una imagen de muñeca de 3×480×640, y produce un vector de acción de 6 dimensiones.

El entrenamiento se realizó con 100 000 pasos, *batch size* 1, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000, usando LeRobot 0.6.0. El dataset consta de 50 episodios y 16 278 fotogramas a 30 FPS de teleoperación sobre la tarea «pick_and_place_tape». No se documenta el uso de RLHF, DPO ni *fine-tuning* posterior; es imitación supervisada pura sobre demostraciones. El sufijo `chunk10` del nombre indica un tamaño de *chunk* de 10 acciones.

## Capacidades

- Generación de comandos de acción de 6 dimensiones para un robot `so_follower` a partir de observaciones visuales y propioceptivas.
- Manipulación visuomotora: coger un objeto y colocarlo en una posición objetivo dentro de la tarea entrenada.
- Fusión de dos vistas de cámara (superior y de muñeca) para localizar el objeto y guiar el efector final.
- Ejecución en bucle cerrado en tiempo real mediante `lerobot-rollout`.
- No dispone de *tool calling*, razonamiento multi-paso simbólico, capacidades multilingües ni modo de pensamiento: es una política de control, no un modelo generativo de texto.
- No se documentan capacidades de generalización a otras tareas, objetos o posiciones no vistas durante el entrenamiento.

## Casos de uso

- Reproducción de un pipeline de imitación completo: sirve como referencia para validar la instalación de LeRobot, grabar un dataset propio y entrenar una política ACT con los mismos hiperparámetros.
- Automatización de una celda de *pick and place* con cinta adhesiva: el modelo ejecuta la tarea entrenada sobre el robot `so_follower` con las cámaras calibradas, adecuado para demostraciones de laboratorio.
- Docencia e investigación en robótica: ejemplo ligero (51,6 M de parámetros) para estudiar el efecto del *chunk size* y del número de episodios en el éxito de la política.
- Pruebas de integración hardware-software: permite verificar la calibración de cámaras y del puerto del robot antes de escalar a tareas más complejas.
- *Baseline* para comparativas: punto de partida para medir mejoras al añadir datos, cambiar la resolución de las cámaras o variar el número de pasos de entrenamiento.
- Prototipado rápido en GPU consumer: al caber en cualquier GPU moderna, permite iterar sobre el *rollout* sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: «No evaluation results have been provided for this policy yet», por lo que no existe tasa de éxito medida en robot real ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,6 M de parámetros, los pesos en FP32 ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en 2-4 GB de VRAM incluyendo activaciones y *buffers* de imagen.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son más que suficientes. También es viable en CPU para *rollout* a baja frecuencia, aunque no se documenta latencia.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer modernas (GTX 1650 en adelante).
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=knight7024/act_pick_and_place_tape_final_chunk10`; el entrenamiento se realiza con `lerobot-train`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. Al ejecutarse a 30 FPS sobre el robot, la política debe inferir en menos de 33 ms por paso, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Tarea | Licencia | Evaluacion publicada |
|---|---|---|---|---|---|
| `knight7024/act_pick_and_place_tape_final_chunk10` | 51,6 M | chunk 10 | pick_and_place_tape sobre `so_follower` | apache-2.0 | no |
| ACT original (Zhao et al., 2023) | no disponible | chunk configurable | tareas de manipulación simuladas y reales (ALOHA) | no disponible | sí, en el paper |
| Políticas Diffusion Policy (referencia de la categoría) | no disponible | horizonte configurable | manipulación visuomotora | no disponible | sí, en el paper |
| Otras políticas LeRobot en el Hub | variable | variable | tareas diversas | variable | habitualmente no |

La comparación cuantitativa no es posible: este repositorio no publica métricas y los métodos de referencia (ACT original, Diffusion Policy) se evalúan en configuraciones de robot y dataset distintas. La comparación relevante es cualitativa: misma familia metodológica que ACT, pero entrenado con un dataset pequeño (50 episodios) y sin validación reportada.

## Limitaciones y advertencias

- Especialización extrema: la política solo se ha entrenado para la tarea «pick_and_place_tape»; no se espera que funcione con otros objetos, posiciones o instrucciones.
- Sin evaluación: no hay tasa de éxito publicada, por lo que se desconoce su fiabilidad real en producción.
- Dataset pequeño: 50 episodios y 16 278 fotogramas son una base limitada; el riesgo de sobreajuste a posiciones, iluminación y disposición concretas es alto.
- Dependencia del hardware: requiere un robot `so_follower` y cámaras con los nombres y resoluciones exactos (`top` a 240×320, `wrist` a 480×640); cualquier cambio de calibración o montaje puede degradar el comportamiento.
- Sin capacidades lingüísticas ni de razonamiento: no debe evaluarse con benchmarks de texto (MMLU, HumanEval, GSM8K) ni usarse como asistente.
- Riesgo de alucinación en sentido figurado: como política de imitación, puede producir acciones erráticas o inseguras ante observaciones fuera de distribución; requiere supervisión humana y parada de emergencia en el robot.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset asociado antes de redistribuir derivados.
- Sesgos: no se documentan sesgos demográficos o culturales (no aplica), pero sí un sesgo de dominio hacia el entorno de grabación.
- Fecha de creación futura (2026-11-16) en los metadatos del Hub: conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/knight7024/act_pick_and_place_tape_final_chunk10
- Dataset de entrenamiento: https://huggingface.co/datasets/knight7024/pick_and_place_tape_final
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=knight7024/pick_and_place_tape_final
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (*rollout*): https://huggingface.co/docs/lerobot/main/en/inference
