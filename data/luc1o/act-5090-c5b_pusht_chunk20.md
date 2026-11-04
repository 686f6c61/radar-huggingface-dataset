# LUC1O/act-5090-C5b_pusht_chunk20

## Resumen

`act-5090-C5b_pusht_chunk20` es una política de robótica basada en ACT (Action Chunking with Transformers) entrenada con la librería LeRobot sobre el conjunto de datos `lerobot/pusht`. El modelo lo publica el usuario LUC1O y su propósito es resolver la tarea de empuje de un objeto en el entorno simulado PushT (`PushT-v0`), un benchmark clásico de manipulación robótica 2D en el que un efector final debe empujar una pieza en forma de T hasta una posición objetivo.

Se trata de un modelo pequeño, de 51.578.498 parámetros (unos 51,6 M), con pesos en formato safetensors y un tamaño de repositorio de 0,2 GB. No es un modelo de lenguaje, sino una política de control visuomotor: recibe observaciones del entorno (imágenes y estado) y emite secuencias de acciones. Su relevancia es la de un artefacto de referencia reproducible: el autor documenta los hiperparámetros exactos de entrenamiento (batch 8, lr 1e-5, chunk 20, 100.000 pasos, una sola RTX 5090) y publica scripts de reproducción y evaluación.

El dato más destacable es su rendimiento medido: 23,0 % de éxito en 200 episodios de `PushT-v0` (46/200, intervalo de confianza de Wilson al 95 %: 17,7–29,3). Es una cifra modesta que sitúa al modelo como una línea base de entrenamiento, no como un sistema listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política visuomotora |
| Parámetros totales | 51.578.498 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones por paso y chunk de acciones de 20) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica / no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura de imitación (behavior cloning) que predice bloques de acciones futuras en lugar de una acción por paso. El modelo combina un codificador visual (procesa las observaciones de imagen del entorno) con un transformer que modela la secuencia de acciones; la salida es un *chunk* de 20 acciones, lo que reduce el error de acumulación típico de las políticas que predicen acción a acción y suaviza la ejecución. El entrenamiento se realizó con LeRobot en el commit `ba83e4c`, usando los hiperparámetros oficiales de ACT: batch de 8, tasa de aprendizaje 1e-5, chunk de 20 y 100.000 pasos de optimización, todo ello en una única GPU RTX 5090.

El conjunto de datos es `lerobot/pusht`, un dataset de demostraciones teleoperadas del entorno PushT. No se documenta en la información disponible el número de tokens ni la composición detallada del dataset, ni si hubo etapas de refinamiento tipo RLHF o DPO (no aplicables habitualmente en behavior cloning). La innovación técnica principal es el propio *action chunking* de ACT, que predice secuencias de 20 acciones y mejora la estabilidad frente a políticas de acción única.

## Capacidades

- Control visuomotor para manipulación robótica 2D: genera secuencias de acciones a partir de observaciones del entorno PushT.
- Predicción por *chunks* de 20 acciones, lo que permite ejecutar movimientos más coherentes y con menor frecuencia de inferencia.
- Aprendizaje por imitación a partir de demostraciones teleoperadas del dataset `lerobot/pusht`.
- Integración nativa con el ecosistema LeRobot: evaluación mediante `lerobot-eval` y carga directa desde el Hub.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión general, tool calling ni capacidades de agente multi-paso.
- No es multilingüe ni procesa lenguaje natural; su dominio es exclusivamente la tarea PushT.

## Casos de uso

- Línea base reproducible para investigación en imitación: sirve para comparar variantes de ACT (distintos tamaños de chunk, tasas de aprendizaje o número de pasos) sobre el mismo dataset y entorno, usando los scripts del repositorio del autor.
- Validación de pipelines de entrenamiento en LeRobot: permite comprobar de extremo a extremo el flujo de datos, entrenamiento y evaluación con `lerobot-eval` antes de escalar a tareas o datasets mayores.
- Estudio de action chunking: al estar entrenado con chunk 20, es útil para analizar empíricamente cómo afecta el tamaño del bloque de acciones a la tasa de éxito en PushT.
- Docencia y divulgación: ejemplo pequeño (51,6 M de parámetros, 0,2 GB) que cabe en una GPU de consumo y permite explicar behavior cloning visuomotor sin infraestructura pesada.
- Reproducción de resultados: el autor publica el benchmark completo, logs y scripts, de modo que el modelo se puede reentrenar y reevaluar para verificar el 23,0 % de éxito reportado.
- Punto de partida para fine-tuning en tareas de empuje similares: puede servir como inicialización para experimentos con datasets de manipulación 2D propios, siempre que se respete la licencia (no disponible) y se asuma su bajo rendimiento base.

## Benchmarks y rendimiento

| Benchmark | Entorno | Episodios | Tasa de éxito | IC 95 % (Wilson) |
|---|---|---|---|---|
| PushT | `pusht` / `PushT-v0` | 200 | 23,0 % (46/200) | 17,7–29,3 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks equivalentes, ya que no es un modelo de lenguaje. Tampoco se aportan cifras de éxito de políticas alternativas sobre PushT en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,6 M de parámetros y pesos safetensors de 0,2 GB, la inferencia cabe holgadamente en cualquier GPU de consumo con 4 GB o más.
- GPU recomendadas: RTX 5090 (usada para el entrenamiento), aunque para inferencia basta una GPU modesta; también es viable en CPU para pruebas puntuales.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090, etc.).
- Opciones de despliegue: LeRobot (`lerobot-eval` con `--policy.path`), con soporte del ecosistema Hugging Face; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `LUC1O/act-5090-C5b_pusht_chunk20` | ACT (behavior cloning) | 51,6 M | no aplica | 23,0 % éxito en PushT (200 eps) | no disponible | Hugging Face (LeRobot) |
| Otras políticas ACT sobre `lerobot/pusht` | ACT | no disponible | no aplica | no disponible | variable | Hugging Face / LeRobot |
| Políticas alternativas para PushT (p. ej. diffusion policy) | Diffusion policy | no disponible | no aplica | no disponible | variable | Hugging Face / LeRobot |

No se dispone en la información proporcionada de cifras de rendimiento de modelos comparables que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Rendimiento bajo: 23,0 % de éxito implica que falla en aproximadamente 3 de cada 4 episodios; no es adecuado para uso en producción sin entrenamiento adicional.
- Dominio restringido: entrenado exclusivamente para `PushT-v0`; no generaliza a otras tareas, entornos ni robots sin reentrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución; conviene contactar con el autor antes de cualquier uso más allá de la investigación.
- Sesgos y alucinación: al ser una política de imitación, hereda los sesgos y la cobertura limitada de las demostraciones de `lerobot/pusht`; puede producir acciones degeneradas fuera de la distribución de estados vista en entrenamiento.
- Sin soporte de lenguaje ni instrucciones: no acepta prompts textuales ni tool calling; su interfaz es la del entorno de simulación.
- Reproducibilidad dependiente del entorno: los resultados dependen de la versión de LeRobot (commit `ba83e4c`), del entorno `PushT-v0` y de la configuración de evaluación (`--eval.use_async_envs=false`).
- Sin datos de latencia ni throughput publicados, lo que dificulta planificar despliegues en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LUC1O/act-5090-C5b_pusht_chunk20
- Repositorio de benchmark, logs y scripts de reproducción: https://github.com/Jerryisqx/ACT-5090-benchmark
- Dataset: https://huggingface.co/datasets/lerobot/pusht
- LeRobot (librería): https://github.com/huggingface/lerobot
