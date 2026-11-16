# iFaz/eqm-pusht-seed1-16nov2026_12am

## Resumen

eqm-pusht-seed1-16nov2026_12am es una política de robótica entrenada con LeRobot y publicada en Hugging Face por el usuario iFaz. No se trata de un modelo de lenguaje, sino de un checkpoint de control motor entrenado sobre el dataset `lerobot/pusht`, una tarea de manipulación 2D en la que un efector debe empujar un objeto hasta una posición objetivo. El modelo se etiqueta con el pipeline `robotics` y el sufijo `eqm`, que sugiere el uso de un esquema de entrenamiento basado en "equivariant models" o "energy-based Q-learning", aunque la model card no lo confirma explícitamente.

El checkpoint contiene 32.944.437 parámetros en formato safetensors (aproximadamente 0,1 GB de repositorio), lo que lo sitúa en el rango de las políticas de imitación ligeras tipo ACT o Diffusion Policy. El nombre incluye `seed1` y una marca temporal, lo que indica que forma parte de una campaña de experimentos con múltiples semillas para evaluar la robustez del entrenamiento.

Su relevancia es acotada: sirve como referencia reproducible para experimentos de aprendizaje por imitación en robótica con LeRobot, pero no es un modelo de propósito general ni está pensado para despliegue en producción fuera del ecosistema LeRobot. La model card es una plantilla sin rellenar y no aporta información sobre arquitectura, datos de entrenamiento ni métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de robótica entrenada con LeRobot; tag `eqm`) |
| Parametros totales | 32.944.437 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna. El tag `eqm` y la librería `lerobot` apuntan a una política de control entrenada con el framework de Hugging Face para robótica, probablemente una red neuronal que mapea observaciones (imágenes del entorno y estado del robot) a acciones de control. El ejemplo de la model card usa `--policy.type=act`, pero corresponde a la plantilla genérica de LeRobot y no necesariamente al tipo real de esta política.

El entrenamiento se realizó sobre el dataset `lerobot/pusht`, una tarea de empuje 2D ampliamente usada como benchmark en LeRobot. No se especifican el número de tokens, episodios, composición del dataset ni si hubo RLHF, DPO o algún esquema de refuerzo. El sufijo `seed1` sugiere que se entrenó con una semilla concreta dentro de una batería de experimentos, y la marca temporal `16nov2026_12am` indica la fecha de ejecución del job.

## Capacidades

- Control de políticas de manipulación robótica en la tarea `pusht` (empuje de un objeto 2D hacia un objetivo).
- Inferencia dentro del ecosistema LeRobot mediante `lerobot-record` y `--policy.path`.
- Reproducibilidad de experimentos: el checkpoint permite reevaluar la política con la misma semilla.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No es un modelo generativo de texto, visión o audio.

## Casos de uso

- Reproducción de experimentos de imitación en robótica: cargar el checkpoint con `lerobot-record` y evaluar la política sobre el entorno `pusht` para comparar con otras semillas del mismo autor.
- Baseline en investigación de políticas de control: usar este checkpoint como referencia de 33 M de parámetros para comparar arquitecturas alternativas en la misma tarea.
- Docencia y formación en LeRobot: ejemplo práctico de cómo se publica y se evalúa una política entrenada con el framework.
- Pruebas de integración de pipelines de evaluación: validar que el flujo `lerobot-train` → Hub → `lerobot-record` funciona de extremo a extremo.
- Estudio de variabilidad entre semillas: al existir el sufijo `seed1`, sirve para analizar la dispersión de resultados entre ejecuciones del mismo entrenamiento.
- Prototipado de simulación a bajo coste: al ocupar solo 0,1 GB, se puede cargar en máquinas modestas para experimentos rápidos en simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (33 M de parámetros), holgadamente por debajo de cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una GTX 1650 o superior; también puede ejecutarse en CPU para pruebas puntuales.
- Cabe en GPU consumer sin problema (RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-eval`); no se han publicado variantes GGUF, ni soporte documentado para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| iFaz/eqm-pusht-seed1-16nov2026_12am | 32,9 M | pusht (LeRobot) | apache-2.0 | Hugging Face |
| Políticas ACT de LeRobot (referencia del framework) | no disponible | imitación robótica | apache-2.0 | Hugging Face / LeRobot |
| Diffusion Policy (referencia académica) | no disponible | imitación robótica | MIT (código) | Repositorio académico |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La model card es una plantilla sin rellenar: no hay información verificable sobre arquitectura, datos ni métricas.
- El modelo está entrenado exclusivamente para la tarea `pusht`; no generaliza a otras tareas robóticas sin reentrenamiento.
- No es un modelo de lenguaje ni de propósito general: no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- Riesgo de sobreajuste al entorno de simulación de `pusht`; el rendimiento en un robot físico no está documentado.
- Sin datos de sesgos, alucinación o robustez fuera de la distribución de entrenamiento.
- La licencia apache-2.0 permite uso comercial del checkpoint, pero el dataset subyacente (`lerobot/pusht`) puede tener sus propias condiciones que conviene revisar.
- El nombre incluye una fecha futura (`16nov2026`), lo que puede indicar un error de etiquetado o un experimento planificado; conviene verificar la procedencia antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iFaz/eqm-pusht-seed1-16nov2026_12am
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset `lerobot/pusht`: https://huggingface.co/datasets/lerobot/pusht
