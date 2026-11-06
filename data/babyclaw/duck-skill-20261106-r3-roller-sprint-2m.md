# BabyClaw/duck-skill-20261106-r3-roller-sprint-2m

## Resumen

Duck Skill Roller R3 es una política de control robótico entrenada mediante aprendizaje por refuerzo (PPO) para la tarea "roller-sprint-2m" del entorno MicroDuck. No es un modelo de lenguaje ni un transformer generativo: es una red neuronal compacta exportada a ONNX que mapea 61 observaciones del entorno a 14 acciones de control, diseñada para ejecutarse en CPU. El autor, BabyClaw, la publica como una skill empaquetada dentro del ecosistema MicroDuck, con manifiesto y evidencia de evaluación local adjuntos.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación en robótica y RL, con cero descargas y sin métricas de benchmarks convencionales. Su interés radica en el proceso de refinamiento documentado (PPO con normalizador de actor congelado y crítico de referencia maduro) y en la trazabilidad criptográfica de la selección de la política, no en capacidades de propósito general.

El modelo resuelve un problema muy concreto: completar de forma fiable la prueba de sprint con ruedas en el simulador MicroDuck, superando auditorías de arranque frescas. Cualquier evaluación fuera de ese entorno carece de sentido, y la información disponible no permite determinar arquitectura interna, número de parámetros ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; estructura interna no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 61 observaciones) |
| Tipos de cuantizacion | no disponible (inferencia ONNX en CPU) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (inferencia en CPU) |
| Dimension de entrada | 61 observaciones |
| Dimension de salida | 14 acciones |
| Algoritmo de entrenamiento | PPO (refinamiento sobre actor previo) |
| SHA-256 de la política | `9a8f5e52c09996f6d1cf88d269240db4005624c66d21b357e6f37b694bcd888b` |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

La información pública no describe la arquitectura interna de la red (capas, unidades ocultas, función de activación). Lo que sí se documenta es el pipeline de entrenamiento: un refinamiento PPO sobre el actor "Roller" previamente presentado, con el normalizador del actor congelado y un crítico de referencia ya maduro. La búsqueda se etiqueta como `round3-revert-ppo`, lo que sugiere una reversión a una configuración PPO anterior tras iteraciones intermedias.

El proceso de selección es notablemente riguroso para el tamaño del artefacto. La regla de selección exige que las 110 ejecuciones de desarrollo, las 80 posteriores a la búsqueda y los 5 arranques oficiales terminen correctamente; además, debe mejorar la media de desarrollo respecto a la política realmente enviada y no degradar la media oficial. La política se congela antes de la auditoría final fresca. El resultado: 50 arranques de auditoría superados sin caídas, frente a una caída en el envío anterior. La media oficial de cinco arranques se mantiene empatada en 2,600 segundos. No se documenta el número de tokens ni la composición de datos, porque no aplica: el entrenamiento es en simulador.

## Capacidades

- Control motor en el simulador MicroDuck para la tarea `roller-sprint-2m`: recibe 61 observaciones y emite 14 acciones continuas.
- Inferencia en CPU mediante ONNX, sin requisitos de GPU.
- Ejecución determinista verificable: la política tiene hash SHA-256 publicado y el manifiesto de procedencia permite reproducir la selección.
- Robustez ante arranques frescos: supera las 50 auditorías de inicio sin fallos.
- No soporta tool calling, ni agentes multi-paso, ni razonamiento simbólico, ni generación de texto, ni visión, ni audio.
- No tiene capacidades multilingües: no procesa lenguaje.

## Casos de uso

- Evaluación de políticas en el MicroDuck Arena: la skill se puede cargar en el espacio oficial de la arena (`pollen-robotics/microduck-arena`) para comparar su media oficial de 2,600 s frente a otras políticas de la misma prueba.
- Reproducción de experimentos de RL: el manifiesto y los hashes permiten reconstruir la cadena de selección (política donante, evaluación de desarrollo, evaluación posterior a la búsqueda) y auditar el proceso de refinamiento PPO.
- Baseline para investigación en refinamiento PPO: sirve como punto de partida congelado sobre el que probar variantes de normalizador, crítico o búsqueda afín, comparando contra la media oficial documentada.
- Pruebas de robustez ante condiciones iniciales: los 50 arranques frescos superados la convierten en un candidato para validar harness de evaluación que midan estabilidad de arranque en simuladores de robótica.
- Despliegue en entornos de cómputo limitado: al ser ONNX de CPU, puede integrarse en pipelines de CI que ejecuten simulaciones ligeras sin GPU.
- Docencia en aprendizaje por refuerzo: ejemplo compacto de política PPO con trazabilidad criptográfica completa, útil para ilustrar buenas prácticas de procedencia en modelos.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas internas de la tarea, no benchmarks estándar (MMLU, HumanEval, GSM8K no aplican).

| Metrica | Resultado |
|---|---|
| Arranques de auditoría fresca superados | 50 de 50 |
| Media oficial (5 arranques) | 2,600 s (empatada con el envío anterior) |
| Media de desarrollo (110 ejecuciones) | 2,6010 s (110/110 con éxito) |
| Media posterior a la búsqueda (80 ejecuciones) | 2,6202 s (80/80 con éxito) |
| Caídas en auditoría | 0 (el envío anterior registró 1) |

## Requisitos de hardware

- Inferencia en CPU: el modelo se distribuye como ONNX y el autor declara explícitamente inferencia en CPU.
- VRAM estimada: no aplica; no requiere GPU.
- GPU recomendadas: ninguna; cualquier CPU moderna es suficiente.
- Cabe en GPU de consumo: sí, aunque es innecesario; el cuello de botella es el simulador, no la red.
- Opciones de despliegue: ONNX Runtime en CPU; el ecosistema `microduck` como librería de carga; integración en el MicroDuck Arena.
- Latencia y throughput: no disponibles. El tamaño del repositorio (0.0 GB) sugiere un artefacto muy pequeño, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de información sobre otras políticas publicadas del mismo entorno con la que comparar parámetros, contexto o licencia. La comparación solo puede hacerse contra el envío anterior del propio autor, según los datos de la model card.

| Modelo | Tarea | Arranques superados | Media oficial | Licencia |
|---|---|---|---|---|
| Duck Skill Roller R3 (este) | roller-sprint-2m | 50/50 | 2,600 s | no disponible |
| Envío anterior del autor | roller-sprint-2m | con 1 caída | 2,600 s | no disponible |
| Otras políticas MicroDuck | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ámbito extremadamente restringido: solo funciona en la tarea `roller-sprint-2m` del simulador MicroDuck; no generaliza a otras tareas ni a robots físicos sin validación adicional.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; trátese como no autorizado hasta verificación.
- Cero adopción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso independiente.
- Métricas locales indicativas: el propio autor advierte que las puntuaciones locales son orientativas y que la medida oficial la determina la Arena.
- Sin datos de arquitectura ni de parámetros: imposible estimar coste computacional, capacidad de generalización o sensibilidad a perturbaciones más allá de lo reportado.
- Empate en la media oficial (2,600 s): la mejora respecto al envío anterior se limita a la estabilidad de arranque (0 caídas frente a 1), no a un mejor tiempo.
- Riesgo de sobreajuste al harness de evaluación: la selección se hizo contra conjuntos de desarrollo y posteriores a la búsqueda, con auditoría fresca posterior, pero sin validación externa independiente.
- Sin sesgos lingüísticos ni de alucinación aplicables, al no ser un modelo de lenguaje; los riesgos son de control y de reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BabyClaw/duck-skill-20261106-r3-roller-sprint-2m
- MicroDuck Arena (evento roller-sprint-2m): https://huggingface.co/spaces/pollen-robotics/microduck-arena#/e/roller-sprint-2m
- Espacio MicroDuck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
