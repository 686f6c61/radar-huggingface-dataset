# shangarot/moveT_TaskA_fixLast

## Resumen

`shangarot/moveT_TaskA_fixLast` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers), un enfoque de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo ha sido desarrollado por el usuario shangarot y publicado en Hugging Face mediante la librería LeRobot de Hugging Face, que estandariza el entrenamiento y despliegue de políticas robóticas en PyTorch.

El modelo resuelve una tarea concreta de manipulación: colocar correctamente una pieza en forma de T sobre una forma de T amarilla. Consume observaciones compuestas por el estado del robot (vector de 6 dimensiones) y dos flujos de imagen de 480x640 píxeles procedentes de cámaras superior y de muñeca, y produce un vector de acción de 6 dimensiones. Con 51,7 millones de parámetros, es un modelo compacto diseñado para ejecutarse en el propio robot o en un equipo cercano, sin necesidad de infraestructura de gran escala.

Su relevancia es acotada pero representativa: ilustra el flujo completo de LeRobot para entrenar políticas de imitación a partir de datos teleoperados y desplegarlas en un robot SO-100/SO-101 (tipo `so_follower`). No es un modelo de propósito general ni un LLM, sino una política especializada en una única tarea, con 181 episodios y 56.197 fotogramas de entrenamiento a 30 FPS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de horizonte de acción, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; el modelo no procesa lenguaje natural como entrada) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` (SO-100/SO-101) |
| Camaras | `top`, `wrist` (3x480x640 cada una) |
| Entrada de estado | `observation.state` (6,) |
| Salida de accion | `action` (6,) |
| Pasos de entrenamiento | 50.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.7.1 |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un backbone transformer con atención sobre las observaciones (imágenes de las cámaras superior y de muñeca, más el estado propioceptivo del robot) y un decodificador que emite un chunk de acciones de longitud fija en lugar de una sola acción por paso. Esta predicción por chunks reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución. El modelo incluye además un estilo de entrenamiento con regularización temporal (CVAE en la formulación original de ACT) para modelar la variabilidad de las demostraciones humanas.

El entrenamiento se realizó sobre el dataset `shangarot/moveT_TaskA_fixLast`, compuesto por 181 episodios y 56.197 fotogramas grabados a 30 FPS, con dos variantes de la misma tarea ("Correct T on yellow T shape" y "Correct T on yellow T shape 2"). Se ejecutaron 50.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-05, semilla 1000, usando LeRobot 0.7.1. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de aprendizaje por imitación supervisado puro sobre demostraciones teleoperadas.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower` a partir de observaciones visuales y propioceptivas.
- Percepción visual multimodal: procesa simultáneamente dos cámaras (superior y de muñeca) a resolución 480x640.
- Predicción de chunks de acción: emite secuencias cortas de acciones, lo que mejora la estabilidad frente a políticas paso a paso.
- Ejecución de una tarea específica de ensamblaje/colocación: alinear y colocar una pieza en T sobre una forma de T amarilla.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante CLI (`lerobot-train`, `lerobot-rollout`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Automatización de una celda de ensamblaje con robot SO-100/SO-101: la política ejecuta la tarea de colocar la pieza en T sobre la forma amarilla de forma autónoma, usando las dos cámaras para localizar la pieza y el objetivo. Es adecuada porque fue entrenada exactamente sobre esa tarea con 181 demostraciones.
- Prototipado rápido de políticas de imitación en laboratorio: sirve como referencia reproducible para validar el pipeline de LeRobot (grabación, entrenamiento, rollout) antes de escalar a tareas más complejas.
- Benchmark interno de hardware robótico de bajo coste: al ser un modelo de 51,7 M de parámetros y 0,2 GB, permite medir latencia y tasa de éxito en distintas configuraciones de GPU o CPU sin cuellos de botella de memoria.
- Educación y formación en robótica: útil para demostrar el ciclo completo de aprendizaje por imitación con datos teleoperados, desde la recogida de episodios hasta el despliegue con `lerobot-rollout`.
- Base para fine-tuning en tareas de colocación similares: el checkpoint puede reentrenarse con nuevos datasets de tareas de alineación o inserción, reutilizando la arquitectura ACT y la configuración de entrenamiento documentada.
- Evaluación de robustez visual: al depender de dos cámaras, permite estudiar cómo afectan cambios de iluminación, oclusiones o posiciones de objeto a la tasa de éxito, aunque el autor no ha publicado resultados de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,7 M de parámetros, más el coste de procesar dos imágenes de 480x640; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen amplio. Para entrenamiento, una RTX 3090/4090 o A100 acelera los 50.000 pasos, aunque el modelo es pequeño y también es viable en GPU de gama media.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 4 GB de VRAM; también es viable en CPU para inferencia, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware, de la frecuencia de control del robot y del coste de preprocesar las dos cámaras a 30 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `shangarot/moveT_TaskA_fixLast` (ACT) | 51,7 M | no aplica | Colocación de pieza en T sobre forma amarilla | no disponible | Hugging Face, LeRobot |
| Políticas ACT genéricas de LeRobot | variable (decenas de M) | no aplica | Tareas de manipulación teleoperadas | según repositorio | Hugging Face, LeRobot |
| Políticas Diffusion Policy | variable (mayor que ACT típicamente) | no aplica | Manipulación visomotora | según repositorio | Hugging Face, LeRobot |
| Políticas VLA (p. ej. RT-2, OpenVLA) | miles de millones | contexto de lenguaje | Manipulación generalista con instrucciones | según modelo | Principalmente investigación |

No se dispone de datos de rendimiento comparativo publicados para esta política concreta, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único tipo de robot (`so_follower`); no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasa de éxito documentada en robot real, lo que impide estimar su fiabilidad en producción.
- Dependencia de la configuración de cámaras: los nombres y la resolución de las cámaras (`top`, `wrist`, 480x640) deben coincidir exactamente con los usados en entrenamiento; cualquier cambio degrada el rendimiento.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de sobreajuste a las condiciones del dataset: 181 episodios y 56.197 fotogramas son un volumen limitado; cambios de iluminación, posición de objetos o fondo pueden reducir la tasa de éxito.
- Sesgos y alucinaciones: no aplican en el sentido de los LLM, pero la política puede producir acciones erróneas o inseguras ante observaciones fuera de distribución; requiere supervisión y paradas de seguridad.
- Sin soporte de lenguaje natural: no acepta instrucciones en texto; la tarea se selecciona mediante el parámetro `--task` en el rollout.
- Fecha de creación futura en los metadatos (2026-11-16): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shangarot/moveT_TaskA_fixLast
- Dataset de entrenamiento: https://huggingface.co/datasets/shangarot/moveT_TaskA_fixLast
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shangarot/moveT_TaskA_fixLast
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
