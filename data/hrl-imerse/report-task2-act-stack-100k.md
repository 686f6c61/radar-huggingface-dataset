# hrl-imerse/report-task2-act-stack-100k

## Resumen

`report-task2-act-stack-100k` es un checkpoint de política de imitación entrenado con el algoritmo ACT (Action Chunking with Transformers) sobre el *framework* LeRobot. Lo publica el usuario `hrl-imerse` como material de entrega del Assignment 2 del curso HRL (Human-Robot Learning), y no está pensado como modelo de propósito general: es un artefacto de investigación ligado a una tarea concreta de apilado de cubos en un entorno SO-101.

El modelo resuelve una única tarea de manipulación robótica (apilar cubos) a partir de observaciones de una cámara montada en la muñeca del robot, sin cámara externa ni DAgger. Se entrenó con 297 demostraciones y 100.000 pasos de optimización, y el autor reporta tasas de éxito de 18/25 con 5 cubos y 21/25 con 3 cubos.

Es relevante únicamente como referencia reproducible para quien quiera inspeccionar un pipeline ACT completo en LeRobot, comparar variantes del mismo *assignment* o reproducir los resultados del informe. Con 51,7 millones de parámetros y un repositorio de 0,2 GB, es ligero, pero su utilidad queda acotada al dominio robótico para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT es una política de imitación basada en transformer que predice *chunks* de acciones (secuencias cortas de comandos motores) a partir de observaciones visuales y del estado del robot. En este caso la entrada visual se limita a la cámara de muñeca (*wrist camera only*), lo que reduce la información de contexto global respecto a configuraciones multi-cámara. El modelo tiene 51,7 M de parámetros, coherente con la escala típica de ACT en LeRobot.

El entrenamiento se realizó con 297 demostraciones teleoperadas y 100.000 pasos de optimización, sin fase de DAgger (es decir, sin recogida iterativa de datos correctivos con la política ya entrenada). No se dispone de información sobre composición del dataset, aumentos de datos, hiperparámetros de entrenamiento ni semilla. El autor reporta dos evaluaciones: 18/25 de éxito en la variante de 5 cubos y 21/25 en la de 3 cubos, lo que sugiere una degradación clara al aumentar la complejidad de la tarea.

## Capacidades

- Control robótico de manipulación: genera comandos motores para una tarea de apilado de cubos sobre una plataforma SO-101.
- Percepción visual limitada a una cámara de muñeca; no procesa cámaras externas ni visión estereoscópica.
- Predicción de *action chunks*: emite secuencias de acciones en lugar de comandos individuales, lo que suaviza la ejecución.
- Ejecución de una tarea única y específica; no es un modelo generalista ni admite instrucciones en lenguaje natural.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo *thinking*, visión general, audio ni otras modalidades fuera de la observación de la cámara de muñeca.

## Casos de uso

- Reproducción de resultados académicos: sirve para verificar las cifras del informe (18/25 y 21/25) cargando el checkpoint en LeRobot con la configuración descrita en `REPORT_HANDOFF.md`.
- Comparación de variantes ACT: al ser un checkpoint etiquetado por paso (100k) y configuración (wrist only, sin DAgger), permite aislar el efecto de cada decisión de diseño frente a otras ejecuciones del mismo *assignment*.
- Docencia y formación en robótica: útil como ejemplo mínimo y funcional de un pipeline de imitación completo (datos, entrenamiento, evaluación) en un curso de HRL.
- *Baseline* para experimentos de apilado: punto de partida para medir mejoras al añadir DAgger, cámaras adicionales o más demos.
- Depuración de infraestructura LeRobot: al ser pequeño (0,2 GB), sirve para validar *scripts* de carga, inferencia y evaluación antes de escalar a modelos mayores.
- Estudio de límites de la imitación pura: la caída de 21/25 a 18/25 al pasar de 3 a 5 cubos es un caso concreto para analizar el efecto de la complejidad de la tarea sin datos correctivos.

## Benchmarks y rendimiento

| Evaluación | Configuración | Resultado |
|---|---|---|
| Apilado de 5 cubos | ACT, wrist camera only, 297 demos, 100k pasos, sin DAgger | 18/25 |
| Apilado de 3 cubos | ACT, wrist camera only, 297 demos, 100k pasos, sin DAgger | 21/25 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo que es esperable al tratarse de una política robótica y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en safetensors, la huella en memoria es del orden de cientos de MB en FP32 y menor en FP16, aunque no se documenta.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna debería bastar para inferencia, pero no hay confirmación del autor.
- Compatibilidad con GPU consumer: probable por el reducido número de parámetros, si bien no está verificada en la información disponible.
- Opciones de despliegue: LeRobot (librería declarada en el repositorio). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y *throughput*: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| report-task2-act-stack-100k | 51,7 M | Apilado de cubos SO-101 | no aplica | no disponible | Hugging Face |
| Otras variantes ACT del mismo *assignment* | no disponible | Apilado de cubos SO-101 | no aplica | no disponible | no disponible |
| Políticas ACT genéricas en LeRobot | variable | Manipulación diversa | no aplica | según checkpoint | Hugging Face |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas concretas; la información proporcionada no incluye otros checkpoints ni métricas comparables.

## Limitaciones y advertencias

- Modelo de tarea única: no generaliza fuera del apilado de cubos en la configuración SO-101 descrita.
- Dependencia de una sola cámara de muñeca: sin visión global, la política puede fallar ante oclusiones o cambios de disposición no vistos en las 297 demos.
- Sin DAgger: la ausencia de datos correctivos incrementa el riesgo de fallos por *distribution shift* durante la ejecución.
- Degradación con la complejidad: el éxito cae de 21/25 (3 cubos) a 18/25 (5 cubos), lo que evidencia fragilidad ante escenarios más exigentes.
- Licencia no especificada: no puede asumirse uso comercial; conviene contactar con el autor antes de cualquier despliegue fuera del ámbito académico.
- Sin información sobre sesgos, alucinación o cobertura idiomática, ya que no es un modelo de lenguaje.
- Repositorio con 0 descargas y 0 *likes*: no hay evidencia de uso externo ni validación independiente de los resultados.
- Fecha de creación indicada como 2026-11-23: conviene verificar la coherencia temporal del artefacto antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hrl-imerse/report-task2-act-stack-100k
- Repositorio del informe: https://github.com/msong33/hrl_imerse (archivo `REPORT_HANDOFF.md`, rama `report/assignment2-final`)
- LeRobot (framework): https://github.com/huggingface/lerobot
