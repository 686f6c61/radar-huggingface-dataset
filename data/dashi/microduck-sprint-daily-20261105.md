# dashi/microduck-sprint-daily-20261105

## Resumen

`dashi/microduck-sprint-daily-20261105` es una política de control para el robot cuadrúpedo microduck desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es una política de aprendizaje por refuerzo que produce comandos de locomoción a 50 Hz a partir de observaciones de 61 dimensiones, empaquetada como grafo ONNX y destinada a ejecutarse directamente en el robot mediante el daemon `robotctl`.

El modelo es un reentrenamiento diario ("daily re-entry") de la política `dashi/microduck-sprint-remix-r844`, que alcanzó una recompensa de 0.844, y constituye un fine-tune de `jrubiosainz/microduck-game-sprinter-remix3`. Está etiquetado para la ranura de marcha (`walk`), lo que significa que el daemon lo carga como controlador de la marcha del robot y lo ejecuta de forma perpetua hasta recibir una orden de parada.

La relevancia de esta ficha es acotada: el repositorio pesa 0.0 GB, registra cero descargas y cero likes, y la información publicada se limita a la model card. No hay datos sobre licencia, idiomas, benchmarks ni arquitectura interna de la red neuronal, por lo que varios campos de esta ficha se marcan como no disponibles. Aun así, se documenta lo que sí está especificado: interfaz de observación y acción, frecuencia de control, formato de pesos, procedencia del entrenamiento y método de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de aprendizaje por refuerzo exportada como grafo ONNX; topología interna no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control reactiva; observación de 61 dimensiones por paso, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye un único `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la model card está en inglés) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), acompañado de `manifest.json` conforme al esquema 2 del manifiesto de políticas microduck |
| Entrada | observación de 61 dimensiones (normalizador integrado en el grafo) |
| Salida | 14 acciones |
| Frecuencia de control | 50 Hz |
| Ranura de política | `walk` |
| Modo de ejecución | perpetuo (se ejecuta hasta recibir orden de parada) |
| Modelo base | `jrubiosainz/microduck-game-sprinter-remix3` (fine-tune) |
| Librería | `microduck` |
| Pipeline | `robotics` |
| Tamaño del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La model card no describe la topología de la red (número de capas, anchura, tipo de capa recurrente o feed-forward, función de activación). Lo que sí se especifica es la interfaz: la política consume observaciones crudas de 61 dimensiones y emite 14 acciones a 50 Hz, con el normalizador de observaciones embebido dentro de `policy.onnx`, de modo que el consumidor no necesita preprocesar la entrada. El artefacto distribuido es un grafo ONNX acompañado de un `manifest.json` que sigue el esquema 2 del manifiesto de políticas del daemon microduck.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward`, commit `83599404a`. Es un fine-tune de `jrubiosainz/microduck-game-sprinter-remix3` y se presenta como reentrenamiento diario de `dashi/microduck-sprint-remix-r844`, cuya recompensa registrada fue 0.844. No se documentan el número de pasos de entrenamiento, la composición del entorno, el algoritmo de RL empleado (PPO, SAC u otro), ni si hubo etapas de recompensa adicionales o currículo. Tampoco se detalla el proceso de remezcla respecto al modelo base.

## Capacidades

- Locomoción cuadrúpeda: genera una marcha ("sprint") para el robot microduck dentro de la ranura `walk`, ejecutada de forma perpetua hasta que se ordene lo contrario.
- Control reactivo a 50 Hz: produce 14 comandos de acción por paso a partir de observaciones de 61 dimensiones, apto para bucles de control en tiempo real.
- Normalización integrada: el grafo ONNX incorpora el normalizador de observaciones, por lo que acepta observaciones crudas del robot sin preprocesado externo.
- Despliegue en robot: se carga directamente con `robotctl policy load walk <repo>`, sin necesidad de servir el modelo en un servidor de inferencia.
- Compatibilidad con el ecosistema microduck: el `manifest.json` cumple el esquema 2 del manifiesto de políticas del daemon.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, function calling, agentes, razonamiento multi-paso ni multilingüismo; no son aplicables a este tipo de artefacto.

## Casos de uso

- Marcha por defecto del microduck: cargar la política en la ranura `walk` con `robotctl policy load walk dashi/microduck-sprint-daily-20261105` para que el robot camine de forma continua en pruebas de laboratorio.
- Evaluación comparativa de políticas: al ser un reentrenamiento diario con recompensa de referencia 0.844, sirve como punto de comparación frente a otras variantes derivadas de `microduck-game-sprinter-remix3` en experimentos de estabilidad de marcha.
- Reproducción de experimentos de RL: el origen del entrenamiento está identificado (repo `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`), lo que permite reconstruir el pipeline y auditar la configuración.
- Integración en el daemon microduck: al seguir el esquema 2 del manifiesto, encaja en el flujo estándar de carga de políticas del daemon sin adaptadores adicionales.
- Despliegue en entornos con inferencia ONNX: al distribuirse como `policy.onnx`, puede ejecutarse con runtimes ONNX en hardware embebido o en banco de pruebas, siempre que se respete la interfaz de 61 entradas y 14 salidas a 50 Hz.
- Pruebas de locomoción en simulación o banco: útil para validar el bucle de control y la normalización integrada antes de transferir la política a hardware físico.
- Base para fine-tunes posteriores: al ser un fine-tune de un remix, puede servir de punto de partida para nuevos reentrenamientos en la ranura `walk`.

## Benchmarks y rendimiento

La única métrica publicada es la recompensa del modelo reentrenado que sirve de referencia: `dashi/microduck-sprint-remix-r844` con 0.844. No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni equivalentes para políticas de control) en la información disponible, ni tablas comparativas de recompensa, estabilidad o velocidad de marcha para esta política concreta.

| Metrica | Valor |
|---|---|
| Recompensa de la política de referencia (`microduck-sprint-remix-r844`) | 0.844 |
| Recompensa de esta política | no disponible |
| Benchmarks estándar de NLP | no aplica / no disponible |
| Throughput o latencia medidos | no disponible (solo se especifica la frecuencia de control de 50 Hz) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y no se documenta el tamaño del grafo ni de sus pesos.
- GPU recomendadas: no disponible; la model card no especifica requisitos de cómputo.
- Viabilidad en GPU de consumo: no disponible; al ser una política de control a 50 Hz, es plausible que quepa en hardware modesto, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: carga en el robot mediante `robotctl policy load walk dashi/microduck-sprint-daily-20261105`, con ejecución del grafo `policy.onnx` a través de un runtime ONNX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: la única cifra publicada es la frecuencia de control de 50 Hz (20 ms por paso); no se detallan tiempos de inferencia por paso ni throughput medido.

## Comparativa con modelos similares

| Modelo | Relación | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-sprint-daily-20261105` | Esta ficha | no disponible | no aplica (política reactiva) | no disponible | no disponible | HuggingFace, 0 descargas |
| `jrubiosainz/microduck-game-sprinter-remix3` | Modelo base (fine-tune) | no disponible | no aplica | no disponible | no disponible | HuggingFace |
| `dashi/microduck-sprint-remix-r844` | Política de referencia del reentrenamiento | no disponible | no aplica | recompensa 0.844 | no disponible | HuggingFace |

No se dispone de datos de parámetros, contexto ni licencia para ninguno de los tres artefactos, por lo que la comparación se limita a la relación de procedencia y a la única métrica publicada.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta arquitectura, número de parámetros, licencia, idiomas ni requisitos de hardware; cualquier uso en producción requiere validación empírica previa.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe contactarse con el autor o consultarse el repositorio del modelo base antes de integrarlo en un producto.
- Repositorio de 0.0 GB y cero descargas: no hay evidencia pública de uso ni de validación por terceros.
- Alcance restringido: es una política específica para la ranura `walk` del microduck; no es reutilizable como modelo de lenguaje, visión u otras tareas.
- Ejecución perpetua: la política está diseñada para correr hasta recibir una orden de parada, lo que exige mecanismos externos de supervisión y parada de seguridad en el robot.
- Dependencia de la interfaz: cualquier cambio en la dimensionalidad de la observación (61) o de la acción (14), o en la frecuencia de 50 Hz, invalida el grafo distribuido.
- Sin datos de robustez: no se publican resultados sobre estabilidad de la marcha, recuperación tras perturbaciones, comportamiento en terreno irregular ni sesgos de comportamiento.
- Riesgo de sobreajuste al entorno de entrenamiento: al ser un reentrenamiento diario sobre una rama concreta (`roll-backward`), el rendimiento fuera de las condiciones de entrenamiento no está caracterizado.
- Trazabilidad parcial: se conoce el commit de entrenamiento, pero no la configuración completa (hiperparámetros, semillas, número de pasos), lo que dificulta la reproducción exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dashi/microduck-sprint-daily-20261105
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a` (sin URL directa en la información disponible)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (sin URL directa en la información disponible)
