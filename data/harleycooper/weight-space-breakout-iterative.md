# HarleyCooper/weight-space-breakout-iterative

## Resumen

Iterative Weight Space Breakout es un controlador de política para el juego Breakout con 17.253 parámetros, publicado por HarleyCooper en Hugging Face bajo licencia MIT. No es un modelo de lenguaje: se trata de un artefacto de investigación sobre *weight-space programming*, una técnica que consiste en editar directamente los pesos de una red neuronal mediante un modelo de lenguaje en lugar de reentrenarla. El checkpoint actual contiene una política deliberadamente defectuosa con controles invertidos, que sirve como punto de partida de un proceso iterativo de reparación.

El proyecto replica de forma independiente el concepto presentado en «Sparks of Weight-Space Programming» (MIT CSAIL, noviembre de 2026) y lo extiende a un bucle de retroalimentación acotado. En cada ronda, un editor basado en `qwen/qwen3.6-35b-a3b` alojado en Prime propone hasta 64 asignaciones escalares de pesos; un verificador las evalúa contra la política vigente sobre 512 semillas emparejadas y solo promueve el candidato si la ganancia media supera 0,10 y la cota inferior de dos errores estándar pareados es positiva.

La relevancia del artefacto es metodológica: documenta un protocolo reproducible de edición de pesos con auditoría inmutable (cada commit del Hub es una versión fija), separación entre semillas de práctica, promoción y auditoría final, y trazabilidad completa de candidatos rechazados. No obstante, el propio autor advierte que la regla de promoción es un filtro de ingeniería, no una prueba de significación estadística general, y que la búsqueda adaptativa requiere replicación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (controlador de política para Breakout; estructura interna no documentada en la model card) |
| Parametros totales | 17.253 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (pesos en safetensors y NumPy `policy.npz`; sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors`, `policy.npz`, `policy.json`; baseline en `initial_baseline.safetensors` |

## Arquitectura y entrenamiento

La model card no describe la topología interna de la red (capas, activaciones, función de política). Lo que sí documenta es el proceso de obtención de los pesos: no hay entrenamiento por gradiente en este repositorio, sino edición directa de pesos guiada por un LLM. El punto de partida es una política con controles invertidos, construida manualmente como material didáctico, y el objetivo del bucle es corregirla mediante asignaciones escalares propuestas por el editor.

El protocolo se organiza en rondas con semillas fijas y no solapadas: práctica en `40000 + 32*round` hasta `40031 + 32*round` (32 partidas), promoción en `60000 + 512*round` hasta `60511 + 512*round` (512 semillas emparejadas frescas por ronda) y auditoría final en `90000..91023` (1.024 partidas) contra la política defectuosa original, sin uso para promoción. El editor (`qwen/qwen3.6-35b-a3b`) recibe una instantánea de la política con su hash y propone hasta 64 asignaciones escalares sin acceso a herramientas; el verificador alojado valida las ediciones, calcula la ganancia media y el error estándar pareado, y solo acepta si `gain > 0.10` y `gain - 2 * paired_standard_error > 0`. La primera ejecución publicada está limitada a tres rondas y 4.096 tokens de salida por llamada, con un máximo de 20 rondas en el entorno.

## Capacidades

- Control de política para Breakout: genera acciones de juego a partir del estado del entorno con 17.253 parámetros.
- Punto de partida didáctico con fallo conocido (controles invertidos), útil para evaluar protocolos de reparación de pesos.
- Serialización y publicación versionada: cada commit del Hub es inmutable y el demo resuelve una revisión concreta antes de descargar, verificando hashes.
- Trazabilidad de experimentos: `manifest.json` enlaza huella, checksum, plan y decisiones por ronda; `experiment/` conserva candidatos y informes del verificador.
- Integración con entornos alojados (Prime) para inferencia del editor, partidas de práctica y auditoría.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo ni modalidades adicionales: no es un modelo de lenguaje.

## Casos de uso

- Investigación en weight-space programming: usar el checkpoint defectuoso como banco de pruebas para medir si un editor LLM puede reparar una política con fallo conocido, comparando la ganancia media frente al baseline en las 512 semillas de promoción.
- Docencia sobre depuración de modelos: el fallo de controles invertidos es explícito y verificable, lo que permite ilustrar edición de pesos, validación y control de regresiones sin necesidad de GPU.
- Diseño de protocolos de promoción estadística: el repositorio documenta semillas fijas, emparejamiento y umbrales (`gain > 0.10`, cota inferior positiva), reutilizables como plantilla para experimentos similares en otros entornos.
- Auditoría reproducible de artefactos: el uso de commits inmutables, checksums en `manifest.json` y verificación de hashes antes de la descarga sirve como referencia para pipelines de publicación de pesos.
- Replicación independiente: el autor invita explícitamente a replicar la búsqueda adaptativa; el repositorio incluye `LANGUAGE_EXTENSION.md` con los repositorios inspeccionados y el trabajo pendiente para extender el método a modelos de lenguaje.
- Simulación interactiva en CPU: el Space asociado (`weight-space-breakout-repair-loop`) permite ejecutar la política publicada sin GPU, útil para demos y validación rápida en navegador.

## Benchmarks y rendimiento

La model card incluye una tabla de rondas con columnas «Round», «Incumbent», «Candidate», «Mean gain» y «Decision», pero los valores no se han proporcionado en la información disponible. El autor advierte que cada fila usa 512 semillas frescas emparejadas y que las medias de filas distintas no son directamente comparables. La auditoría final de 1.024 partidas contra la política defectuosa original se reporta al término de la última ronda, pero su resultado no figura en los datos facilitados.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: prácticamente nula; el controlador de 17.253 parámetros cabe en cualquier CPU y en memoria de sistema.
- GPU recomendadas: ninguna. El propio autor indica que el juego no necesita GPU.
- GPU de consumo: no aplica; la simulación corre en CPU de Hugging Face.
- Despliegue: inferencia vía safetensors o `policy.npz` con NumPy; el Space de Hugging Face ejecuta la simulación en CPU. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo de texto.
- Latencia y throughput: no disponibles. El coste relevante no es la inferencia del controlador, sino la del editor LLM (`qwen/qwen3.6-35b-a3b`) y la evaluación alojada en Prime, que pueden generar cargos según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Iterative Weight Space Breakout (este) | 17.253 | No aplica | Control de Breakout con fallo inducido | MIT | Hugging Face, con Space y pipeline |
| One-shot Weight Space Breakout (mismo autor) | No disponible en la información | No aplica | Experimento de edición de pesos en un solo paso | No disponible | Hugging Face (referenciado como experimento separado) |
| Sparks of Weight-Space Programming (MIT CSAIL) | No disponible | No aplica | Identificación de juego desde pesos (experimento 1) | No disponible | Blog, hilo en X y logs en GitHub |

La comparación con modelos de lenguaje no procede: el artefacto no compite en MMLU, HumanEval ni tareas similares. Frente al experimento one-shot del mismo autor, la diferencia es el bucle acotado de retroalimentación con verificación por rondas; frente al trabajo original de MIT CSAIL, este proyecto reconstruye un juego de forma independiente con fallos escritos a mano y no reproduce el entrenamiento PPO, el simulador ni las puntuaciones reportadas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde preguntas ni soporta tool calling, agentes o razonamiento multi-paso.
- El checkpoint publicado contiene una política defectuosa con controles invertidos; no debe desplegarse como controlador funcional.
- La regla de promoción (`gain > 0.10` y `gain - 2 * paired_standard_error > 0`) es un filtro de ingeniería, no una prueba de significación estadística general; el autor exige replicación independiente.
- Los resultados pueden estancarse o todos los candidatos pueden ser rechazados; una edición no aceptada no modifica la política en vivo.
- Las medias de rondas distintas no son comparables entre sí porque cada una usa 512 semillas frescas emparejadas.
- La auditoría final de 1.024 partidas no se usa para promoción y no sustituye a una validación externa.
- El verificador del juego no puede medir calidad de lenguaje; la extensión a modelos de lenguaje requiere trabajo adicional documentado en `LANGUAGE_EXTENSION.md`.
- La inferencia del editor LLM y la evaluación alojada en Prime pueden generar costes; el controlador en sí no ejecuta modelos grandes ni partidas de evaluación.
- Licencia MIT: permite uso comercial y modificación, pero el artefacto es material de investigación, no un componente de producción.
- No hay datos publicados sobre sesgos, alucinación o cobertura idiomática porque el modelo no opera sobre lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HarleyCooper/weight-space-breakout-iterative
- Simulación en vivo (Space): https://huggingface.co/spaces/HarleyCooper/weight-space-breakout-repair-loop
- Código del pipeline: https://github.com/HarleyCoops/weight-space-breakout-pipeline
- Entorno en Prime Intellect: https://app.primeintellect.ai/dashboard/environments/harleycooper/weight-space-breakout
- Artículo original «Sparks of Weight-Space Programming»: https://rikiyat.github.io/blog/weight-space-programming/
- Hilo original en X: https://x.com/rikiyatakehi/status/2117313742891327994
- Logs del experimento 1 original: https://github.com/RikiyaT/lm_understand-logs/tree/main/exp1_which_game
