# jhp123/microduck-sprint-2m-1595ms-20261029

## Resumen

Microduck sprint-2m 1595ms es una política de control entrenada por refuerzo (RL) para el evento sprint-2m de Microduck Arena, el robot bípedo de bajo coste de Pollen Robotics. No es un modelo de lenguaje: se trata de una MLP pequeña que mapea 61 observaciones a 14 acciones discretas de actuadores, ejecutada a 50 Hz (20 ms por ciclo de control) y exportada a ONNX con el normalizador de observaciones embebido en el propio grafo (`policy.onnx`), de modo que el consumidor solo tiene que alimentar el vector de observación bruto. La publica el usuario jhp123 en Hugging Face y está pensada para ser evaluada con el runner de Microduck Arena sobre MuJoCo.

El interés técnico está en el método de ajuste fino: parte de un checkpoint propio de "finite-race" (iteración 400, 2,066 s) y lo entrena 300 iteraciones más en 4096 entornos con una única modificación de hiperparámetros, `entropy_coef` de 0,003 a 0. La reducción de entropía baja la desviación típica de la acción de ~0,565 a ~0,42, lo que convierte una política exploratoria en una política casi determinista especializada en minimizar tiempo de recorrido, no en robustez general.

El resultado declarado por el autor es 1,595 s de media en el barrido estándar de velocidades (semillas 1-5, 5/5 completados) y 1,6202 s de media en 100 evaluaciones adicionales con comando fijo de 0,70 m/s (100/100 completados), excluyendo la fase de preparación de 0,5 s. Son mediciones locales en simulación, no una garantía para otras condiciones iniciales ni para hardware físico; la validación oficial corresponde al servidor de la Arena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) como política actor; interfaz de 61 observaciones y 14 acciones; normalizador de observaciones embebido en el grafo ONNX |
| Parametros totales | no disponible (la model card no publica el número de capas ni de pesos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de secuencia; la política es reactiva, sin memoria recurrente declarada) |
| Tipos de cuantizacion | no disponible (solo se distribuye el ONNX en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de control motor, sin entrada ni salida de texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (metadatos de política, esquema 2) + `local_evaluation.json` + `extra_100_evaluation.json` |

Otros datos operativos: frecuencia de control 50 Hz; excluida la fase de preparación de 0,5 s en las métricas; distancia de carrera de 2 m; SHA-256 del ONNX `f6f4f03225992c82703724a8ae7fd4ae298f725f104d3860080e0a64d4d56703`; tamaño del repo 0,0 GB; creado el 2026-10-29.

## Arquitectura y entrenamiento

La política es una MLP que actúa como actor en un esquema actor-crítico. El actor mantiene la interfaz estándar de 61 dimensiones de observación y 14 dimensiones de acción; el crítico, solo usado en entrenamiento, recibe además características específicas de la carrera. El objetivo "finite-race" minimiza el tiempo total, penaliza los fallos con 50 segundos, arranca la medición de los 2 m después de la preparación y replica el modelo de colisiones y la regla de caída de la Arena. La normalización de observaciones está integrada en el ONNX exportado, lo que elimina dependencias de preprocesado en el lado del runner.

El ajuste fino parte del checkpoint 400 de un entrenamiento propio de finite-race (2,066 s) y continúa 300 iteraciones con 4096 entornos y semilla 1, seleccionando el checkpoint 299. El único cambio de hiperparámetros fue `entropy_coef: 0.003 -> 0`; se conservaron actor, crítico, normalizadores y optimizador. El autor declara explícitamente que no se usaron pesos de modelos del leaderboard, ramas de semilla fija, contadores de pasos ni tablas de acciones por semilla, y que el flag "dirty" del exportador se debió únicamente a un log de runtime de MuJoCo sin trackear, con las fuentes versionadas coincidiendo con el commit local `33215f97618e919af045f99ac3de8e637cf8c5b1` (no publicado upstream). El paquete subido contiene el modelo de inferencia y los registros de evaluación, no una reproducción completa desde cero.

## Capacidades

- Control motor reactivo: genera las 14 acciones de actuadores del Microduck a partir de 61 observaciones, a 50 Hz.
- Carrera de 2 m especializada: política ajustada para minimizar tiempo en el evento sprint-2m, con el modelo de colisiones y la regla de caída de la Arena.
- Inferencia autocontenida: el normalizador va embebido en `policy.onnx`, por lo que no requiere código de preprocesado adicional.
- Ejecución determinista en evaluación (entropía cero en el ajuste fino, desviación típica de acción ~0,42 durante el entrenamiento).
- Portabilidad de runtime: formato ONNX estándar, ejecutable con ONNX Runtime sin dependencias de frameworks de RL.
- Reproducibilidad parcial: se publican los JSON de evaluación local (barrido estándar y 100 semillas extra con comando fijo).
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión ni audio: no es un modelo generativo.

## Casos de uso

- Evaluación en simulación con el runner oficial: cargar `policy.onnx` en el runner de Microduck Arena sobre MuJoCo 3.10.0 y ONNX Runtime 1.24.4 para reproducir el barrido de velocidades declarado (0,70 m/s, semillas 1-5) y contrastar el tiempo de 1,595 s.
- Baseline para experimentos de RL: usar este checkpoint como referencia de "política de entropía cero" frente a políticas más exploratorias y medir el coste en robustez al reducir la desviación típica de acción de 0,565 a 0,42.
- Ajuste de recetas de entrenamiento: al ser un fine-tuning de 300 iteraciones con un único hiperparámetro cambiado, sirve como caso controlado para estudiar el efecto de `entropy_coef` en tareas de tiempo mínimo con penalización de fallo.
- Despliegue embebido de bajo coste: al ser una MLP de 61x14 y un ONNX de tamaño despreciable, es candidata a ejecutarse en CPU de una SBC dentro del bucle de control de 20 ms; requiere validación previa en hardware físico, no documentada aquí.
- Integración en herramientas de orquestación de políticas: MicroduckHub publica un servidor MCP para que agentes controlen el robot, y un ONNX de este tipo puede registrarse como comportamiento disponible.
- Docencia y divulgación de RL aplicado a robótica: ejemplo completo y reproducible de pipeline observación-acción con métricas de éxito/tiempo y artefactos auditables (hash del ONNX, JSON de evaluación).
- Comparación de checkpoints en ablations: contrastar este modelo con `microduck-sprint2m-v0-1000-leg090-20261027` (entrenado desde cero con calibración estática de salidas de pierna) para aislar el efecto del fine-tuning frente al entrenamiento from scratch.

## Benchmarks y rendimiento

Mediciones locales del autor con runner de Arena sin modificar, MuJoCo 3.10.0 y ONNX Runtime 1.24.4, excluyendo la preparación de 0,5 s:

| Evaluación | Comando vx | Completados | Tiempo medio |
|---|---:|---:|---:|
| Barrido estándar de velocidades, semillas 1-5 | 0,70 m/s | 5/5 | 1,595 s |
| Comando fijo, semillas extra 6-105 | 0,70 m/s | 100/100 | 1,6202 s |
| Checkpoint de partida (finite-race, iteración 400) | no disponible | no disponible | 2,066 s |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni métricas de comparación frente a la referencia de Pollen Robotics.

## Requisitos de hardware

- VRAM estimada: no disponible; por la naturaleza del artefacto (MLP de 61 entradas y 14 salidas en ONNX, repo de 0,0 GB) el requisito es negligible y la inferencia es viable en CPU.
- GPU recomendadas: no se especifican; no se requiere GPU para inferencia. Para reentrenar con 4096 entornos paralelos sí se necesita aceleración, pero el autor no publica el hardware empleado.
- Cabe en GPU de consumo: sí, con margen amplio, aunque no es necesario; también en CPU convencional.
- Opciones de despliegue: ONNX Runtime (versión declarada 1.24.4) como runtime de referencia; MuJoCo 3.10.0 para la simulación. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el bucle de control exige 50 Hz (presupuesto de 20 ms por paso); no se publican mediciones de latencia por inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo y origen | Entrenamiento | Métrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jhp123/microduck-sprint-2m-1595ms-20261029` (este) | MLP actor 61→14, ONNX | Fine-tuning 300 iteraciones desde checkpoint propio (2,066 s), 4096 entornos, `entropy_coef` 0 | 1,595 s (5/5) y 1,6202 s (100/100) a 0,70 m/s | no disponible | Hugging Face, repo 0,0 GB, 0 descargas |
| `pollen-robotics/microduck-sprint-2m-reference` | Referencia oficial del reto sprint_2m | Receta sin cambios: 4096 entornos, 3000 iteraciones, semilla 1 | no disponible en la información proporcionada | no disponible | Hugging Face |
| `jhp123/microduck-sprint2m-v0-1000-leg090-20261027` | MLP para sprint-2m | Entrenado desde cero + calibración estática de salidas de pierna | no disponible | no disponible | Hugging Face |
| `jhp123/microduck-sprint2m-optimized` | Política para sprint-2m (variante del mismo autor) | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Validación exclusivamente en simulación: las cifras de 1,595 s y 1,6202 s son mediciones locales y el propio autor advierte que no garantizan comportamiento con otras condiciones iniciales ni en hardware físico.
- Licencia no especificada: sin licencia declarada no hay autorización clara para uso comercial ni para redistribución; hay que contactar con el autor antes de integrarlo en un producto.
- Especialización extrema: la política está optimizada para una única tarea (sprint-2m con comando en torno a 0,70 m/s). No hay evidencia de generalización a otras velocidades, terrenos, perturbaciones o eventos de la Arena.
- Entropía cero en el ajuste fino: reduce la exploración y puede aumentar la fragilidad ante cambios de dinámica, fricción o latencia respecto al entorno de entrenamiento.
- Sin memoria: al ser una MLP reactiva sin estado recurrente declarado, no puede compensar historiales largos ni recuperarse de perturbaciones que requieran planificación.
- Sesgo de evaluación: las semillas 6-105 son adicionales al barrido estándar y el autor las presenta como comando fijo, no como un barrido independiente de condiciones; la evaluación oficial la realiza el servidor de la Arena.
- Paquete de reproducción incompleto: el commit de código de entrenamiento (`33215f9...`) no está publicado upstream y el exportador marcó el árbol como "dirty"; no se puede reconstruir el entrenamiento desde cero solo con este repo.
- Riesgo de alucinación: no aplica (no genera texto); el riesgo equivalente es fallo silencioso del control sin mecanismo de seguridad documentado.
- Ausencia de datos: no hay información sobre número de parámetros, cuantizaciones, sesgos del dataset de entrenamiento ni latencia medida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jhp123/microduck-sprint-2m-1595ms-20261029
- Referencia oficial del reto: https://huggingface.co/pollen-robotics/microduck-sprint-2m-reference
- Modelo previo del mismo autor: https://huggingface.co/jhp123/microduck-sprint2m-v0-1000-leg090-20261027
- Proyecto de retos (upstream): https://github.com/pollen-robotics/microduck-challenges
- Librería de RL (upstream): https://github.com/pollen-robotics/microduck_rl
- MicroduckHub, intercambio de políticas: https://microduckhub.com/
- Recursos independientes del robot: https://microduckrobot.org/
- Perfil del autor en Hugging Face: https://huggingface.co/jhp123
