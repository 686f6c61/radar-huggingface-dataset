# phulocnguyen/diversity-study-pi05-lora

## Resumen

`phulocnguyen/diversity-study-pi05-lora` es un repositorio de investigación que contiene un conjunto de checkpoints LoRA (Low-Rank Adaptation) entrenados sobre el modelo base pi05, del ecosistema openpi (la librería de robótica de Physical Intelligence). No se trata de un modelo de lenguaje conversacional al uso, sino de un artefacto de estudio sobre diversidad de políticas robóticas: cada carpeta del repositorio corresponde a una tarea concreta y contiene un checkpoint en formato orbax (el nativo de JAX/openpi) en el paso final 4999, junto con el log de entrenamiento.

El autor, `phulocnguyen`, ha entrenado estos adaptadores con las configuraciones `pi05_div_<task>_lora` de openpi, con batch de 32 y 5000 pasos sobre una única GPU RTX 5090. El repositorio ocupa 85,7 GB, lo que es coherente con múltiples checkpoints completos de un modelo de visión-lenguaje-acción (VLA) guardados en precisión completa y no en cuantización.

La relevancia es acotada pero específica: sirve como material reproducible para estudiar cómo varía el comportamiento de una política VLA fine-tuneada con LoRA entre distintas tareas, y como punto de partida para quien quiera reutilizar los adaptadores. No hay información publicada sobre licencia, idiomas, pipeline ni métricas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base pi05 (openpi, VLA basado en transformer con adaptadores LoRA); detalles internos no disponibles |
| Parametros totales | no disponible (el modelo base pi05 no se especifica en la informacion; el repo contiene solo adaptadores LoRA y checkpoints por tarea) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en formato orbax; se desconoce si admite cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | orbax checkpoint (openpi), paso final 4999 por tarea; incluye `train.log` por tarea |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base pi05 más allá de su pertenencia al stack openpi. Lo que sí se especifica es el procedimiento de ajuste: para cada tarea se usa una configuración `pi05_div_<task>_lora`, con entrenamiento LoRA de rango bajo sobre el modelo base congelado, batch de 32 y 5000 pasos, ejecutado en una sola RTX 5090. Los checkpoints se guardan en el formato orbax propio de openpi/JAX, acompañados del log de entrenamiento de cada tarea.

El propósito declarado es un "estudio de diversidad": el autor entrena variantes por tarea presumiblemente para analizar la variabilidad de políticas resultantes. No se aportan datos sobre composición del dataset, número de tokens, uso de RLHF/DPO ni innovaciones técnicas adicionales. Tampoco se indica el número de tareas incluidas ni sus nombres.

## Capacidades

- Ejecución de políticas de visión-lenguaje-acción (VLA) para tareas robóticas, heredadas del modelo base pi05 vía adaptadores LoRA.
- Un adaptador LoRA independiente por tarea, lo que permite cargar selectivamente la política correspondiente a cada tarea.
- Reproducibilidad del entrenamiento: se incluyen los `train.log` de cada tarea junto al checkpoint final.
- Compatibilidad con el ecosistema openpi (carga de checkpoints orbax y configuraciones `pi05_div_<task>_lora`).
- No hay evidencia de soporte de tool calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito; no disponible.
- No se documentan capacidades de visión, audio o thinking mode más allá de las implícitas en un modelo VLA.

## Casos de uso

- Estudio de diversidad de políticas: cargar los checkpoints de distintas tareas y comparar las distribuciones de acción generadas para medir cuánta variabilidad introduce el ajuste LoRA por tarea.
- Reproducción de experimentos: reentrenar con las configuraciones `pi05_div_<task>_lora` (batch 32, 5000 pasos) y contrastar con los checkpoints y logs publicados para validar resultados en una RTX 5090.
- Punto de partida para fine-tuning: reutilizar los adaptadores LoRA como inicialización para nuevas tareas robóticas en lugar de partir del modelo base completo, reduciendo coste de entrenamiento.
- Auditoría de entrenamiento: analizar los `train.log` por tarea para estudiar curvas de pérdida, estabilidad y posibles divergencias entre tareas.
- Evaluación de infraestructura: usar el repositorio como banco de pruebas para pipelines de carga de checkpoints orbax en openpi y para medir requisitos de almacenamiento (85,7 GB) y de GPU consumer (RTX 5090).
- Docencia e investigación en VLA: material de referencia para cursos o artículos que expliquen cómo se aplica LoRA a políticas de robot learning con openpi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entrenamiento documentado: una única RTX 5090, batch 32, 5000 pasos por tarea. Esto sugiere que el ajuste LoRA del modelo base cabe en la VRAM de una GPU consumer de gama alta, aunque el autor no indica el consumo exacto.
- Inferencia: VRAM estimada no disponible; depende del tamaño del modelo base pi05, que no se especifica. Los checkpoints orbax se guardan presumiblemente en precisión completa, lo que implica requisitos mayores que una versión cuantizada.
- GPU recomendadas: no disponible. Por el entrenamiento reportado, una RTX 5090 es viable para el ajuste; para inferencia no hay datos.
- Almacenamiento: el repositorio ocupa 85,7 GB, por lo que se necesita espacio en disco equivalente para clonarlo o descargarlo completo.
- Opciones de despliegue: openpi (carga de checkpoints orbax y configuraciones `pi05_div_<task>_lora`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un checkpoint VLA en orbax.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| phulocnguyen/diversity-study-pi05-lora | no disponible (adaptadores LoRA sobre pi05) | no disponible | orbax (openpi) | no disponible | Estudio de diversidad por tarea, 5000 pasos, RTX 5090 |
| Modelo base pi05 (openpi) | no disponible en la informacion | no disponible | orbax (openpi) | no disponible | Referencia de la que derivan los adaptadores |
| Otras políticas VLA (p. ej. familias OpenVLA, RT-2) | no disponible en la informacion | no disponible | safetensors / propietario segun modelo | variable | No se aportan datos comparativos en la informacion |

No se dispone de datos de rendimiento ni de especificaciones suficientes para una comparativa cuantitativa fiable con alternativas.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial; es imprescindible contactar con el autor o consultar el modelo base pi05 antes de cualquier despliegue en producción.
- Artefacto de investigación: pensado para un estudio de diversidad, no como modelo listo para producción; no hay pipeline, evaluación ni métricas publicadas.
- Dependencia fuerte del stack openpi y del formato orbax: no es portable a runtimes de inferencia estándar (vLLM, llama.cpp) sin conversión.
- Tamaño del repositorio (85,7 GB) que dificulta su descarga y versionado; además contiene múltiples checkpoints por tarea, no un único modelo.
- Sin información sobre sesgos, alucinación o cobertura idiomática; al ser un modelo VLA, los riesgos se trasladan al dominio robótico (fallos de política, comportamientos inseguros en el mundo físico).
- Solo se publica el paso final 4999; no hay checkpoints intermedios que permitan analizar la evolución del entrenamiento más allá de los logs.
- No se documentan las tareas incluidas ni sus nombres, lo que limita la reutilización directa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/phulocnguyen/diversity-study-pi05-lora
- openpi (librería de Physical Intelligence): no disponible en la informacion proporcionada
- Paper o blog del modelo base pi05: no disponible en la informacion proporcionada
- Demos o repositorios adicionales del autor: no disponible en la informacion proporcionada
