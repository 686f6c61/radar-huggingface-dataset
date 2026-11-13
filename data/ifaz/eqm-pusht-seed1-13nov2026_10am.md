# iFaz/eqm-pusht-seed1-13nov2026_10am

## Resumen

eqm-pusht-seed1-13nov2026_10am es una política de robótica entrenada con LeRobot y publicada en Hugging Face por el usuario iFaz. Se trata de un checkpoint de aprendizaje por imitación (imitation learning) para la tarea PushT del dataset `lerobot/pusht`, un entorno de manipulación 2D en el que un agente debe empujar un objeto en forma de T hasta una posición objetivo. No es un modelo de lenguaje: es una política visomotora que mapea observaciones (imágenes y estado del robot) a acciones de control.

El modelo tiene 18.742.581 parámetros (aproximadamente 18,7 millones), se distribuye en formato safetensors y ocupa 0,1 GB en el repositorio. La etiqueta `eqm` sugiere el uso de un método de "equivariant matching" o similar, aunque la model card no detalla la arquitectura interna ni el proceso de entrenamiento. El nombre incluye `seed1` y una marca temporal, lo que indica que se trata de una ejecución concreta de un barrido de experimentos (probablemente un estudio de reproducibilidad o ablación).

Su relevancia es acotada: es un artefacto de investigación reproducible para la comunidad de robótica y aprendizaje por imitación que trabaja con LeRobot, no un modelo de propósito general. No hay información publicada sobre benchmarks, idiomas (no aplica) ni capacidades de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de robótica basada en LeRobot; la model card no especifica el tipo exacto) |
| Parámetros totales | 18.742.581 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a políticas robóticas; depende de la ventana de observación configurada en LeRobot) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. La model card es una plantilla autogenerada por LeRobot con el aviso explícito "Model type not recognized — please update this template", por lo que no se confirma si se trata de un transformer visomotor, una red convolucional o un método basado en equivarianza (la etiqueta `eqm` podría apuntar a esto último, pero es una inferencia no verificada). El tamaño de 18,7 millones de parámetros es coherente con políticas ligeras de aprendizaje por imitación del ecosistema LeRobot, como ACT o Diffusion Policy, pero no se puede afirmar cuál es la clase exacta.

El entrenamiento se realizó sobre el dataset `lerobot/pusht`, un conjunto de demostraciones teleoperadas de la tarea PushT. No se especifican el número de tokens (no aplica), el número de episodios, la composición del dataset ni si hubo técnicas de refinamiento como RLHF o DPO (no aplicables en este contexto). Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El sufijo `seed1` indica que el checkpoint corresponde a una semilla concreta de un experimento, útil para reproducibilidad.

## Capacidades

- Control robótico visomotor: genera acciones de control a partir de observaciones del entorno PushT (imágenes y estado).
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Integración con LeRobot: compatible con los comandos `lerobot-train` y `lerobot-record` para entrenamiento y evaluación.
- Evaluación episódica: puede ejecutarse en un robot SO-100 follower mediante `lerobot-record` con `--policy.path`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües (no procesa lenguaje).
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la observación visual propia de la tarea.

## Casos de uso

- Reproducción de experimentos de investigación: el checkpoint permite replicar exactamente los resultados de la semilla 1 del experimento `eqm` sobre PushT, útil para estudios de variabilidad entre semillas.
- Punto de partida para fine-tuning: sirve como inicialización para entrenar políticas en tareas de manipulación similares con el dataset propio del investigador.
- Evaluación comparativa de políticas: puede compararse con políticas ACT o Diffusion Policy entrenadas en el mismo dataset para medir diferencias de rendimiento.
- Docencia y formación en robótica: ejemplo práctico de un pipeline completo de LeRobot (entrenamiento, checkpoint, evaluación) para cursos de aprendizaje por imitación.
- Pruebas de infraestructura de despliegue: al ocupar solo 0,1 GB, es útil para validar pipelines de inferencia en robots SO-100 sin consumir recursos significativos.
- Benchmark interno de simulación: validar el entorno PushT y la cadena de evaluación antes de lanzar experimentos más costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 18,7 millones de parámetros en precisión FP32 el modelo ocupa unos 75 MB, y en FP16 unos 37 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se puede usar una RTX 3060, RTX 4090, A100 o H100 sin problema, aunque el modelo está sobredimensionado para hardware de gama alta.
- Cabe en cualquier GPU de consumo, incluidas integradas con suficiente memoria compartida; también puede ejecutarse en CPU para evaluación.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch y safetensors. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eqm-pusht-seed1-13nov2026_10am | 18,7 M | no aplica | PushT (LeRobot) | Apache 2.0 | Hugging Face |
| Políticas ACT en LeRobot | no disponible | no aplica | Manipulación por imitación | Apache 2.0 (LeRobot) | Hugging Face / GitHub |
| Diffusion Policy en LeRobot | no disponible | no aplica | Manipulación por imitación | Apache 2.0 (LeRobot) | Hugging Face / GitHub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Model card incompleta: la plantilla no se ha rellenado y advierte "Model type not recognized", por lo que no hay documentación fiable sobre arquitectura, datos ni metodología.
- Especialización extrema: solo está entrenado para la tarea PushT; no generaliza a otras tareas de manipulación sin reentrenamiento o fine-tuning.
- Sin benchmarks publicados: no se puede verificar su rendimiento frente a alternativas.
- Riesgo de sobreajuste al dataset de demostraciones: al ser un checkpoint de una semilla concreta, puede presentar variabilidad alta respecto a otras semillas.
- Sin información sobre sesgos: no se documentan sesgos del dataset ni del comportamiento aprendido.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar la licencia del dataset `lerobot/pusht` y del código de LeRobot por separado.
- Sin garantías de robustez en producción: no hay evidencia de comportamiento seguro fuera del entorno de simulación o del robot SO-100.
- Fecha de creación futura (2026-11-13): el metadato indica una fecha posterior a la actual, lo que puede deberse a un error de configuración del reloj o a un artefacto de prueba; conviene verificarlo antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iFaz/eqm-pusht-seed1-13nov2026_10am
- Dataset PushT: https://huggingface.co/datasets/lerobot/pusht
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
