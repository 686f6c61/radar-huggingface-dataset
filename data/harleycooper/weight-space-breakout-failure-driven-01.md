# HarleyCooper/weight-space-breakout-failure-driven-01

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un controlador de juego de 17.253 parámetros para Breakout, publicado por HarleyCooper bajo el identificador `weight-space-breakout-failure-driven-01`. Se enmarca en una línea de experimentos de "programación en el espacio de pesos" (weight-space programming): en lugar de entrenar con descenso de gradiente, un modelo de lenguaje propone asignaciones escalares sobre los pesos de una política existente y un verificador decide si se promueven o no. El checkpoint publicado es, de hecho, la política inicial deliberadamente defectuosa con controles invertidos, no una política mejorada.

La relevancia del artefacto es metodológica más que de rendimiento: documenta un protocolo acotado de reparación iterativa con tres rondas, semillas fijas, comparaciones emparejadas y auditoría final separada. El modelo editor utilizado es `qwen/qwen3.6-35b-a3b`, alojado en Prime, que propone hasta 64 asignaciones escalares por ronda sin uso de herramientas. Ninguna de las tres rondas produjo una edición válida (límite de turnos o de tokens), por lo que no se promovió ningún cambio.

El resultado final es explícito: la auditoría sobre 1.024 semillas arroja un retorno de 1,3809 tanto para la política inicial como para la final, con ganancia emparejada de +0,0000 y error estándar emparejado de 0,0000. El propio autor advierte que la ejecución no demuestra mejora alguna de política. La licencia MIT y el formato safetensors facilitan la reproducibilidad del experimento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Controlador de política para Breakout serializado como tensores; no es un transformer ni un modelo de lenguaje |
| Parámetros totales | 17.253 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | No disponible (pesos en safetensors y NPZ; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors`, `policy.npz`, `policy.json`, `initial_baseline.safetensors`, `manifest.json` |

## Arquitectura y entrenamiento

El artefacto es una política de control para el entorno Breakout con 17.253 parámetros escalares, almacenada como tensores en safetensors y replicada en NumPy (`.npz`) para inferencia en CPU. No hay arquitectura de red neuronal profunda documentada, ni tokenizador, ni cabecera de lenguaje: el repositorio describe explícitamente "un controlador de juego de 17.253 parámetros, no un modelo de lenguaje". La inferencia y la simulación corren en CPU de Hugging Face, sin necesidad de GPU.

El "entrenamiento" no es convencional. El pipeline `weight-space-breakout-pipeline` ejecuta un bucle acotado de tres rondas: se congela un plan, se envía el snapshot de la política con su hash al entorno alojado `harleycooper/weight-space-breakout@0.2.1`, se ejecutan 32 partidas de práctica con semillas `40000 + 32*round`, y el editor `qwen/qwen3.6-35b-a3b` propone hasta 64 asignaciones escalares (máximo 4.096 tokens de salida por llamada). El verificador compara candidato e incumbente sobre 512 semillas emparejadas (`60000 + 512*round`) y acepta solo si la ganancia media supera 0,10 y `gain - 2 * paired_standard_error > 0`. La auditoría final usa semillas `90000..91023` y no interviene en la selección. En esta ejecución las tres rondas fueron rechazadas por límite de turnos o de tokens, sin evaluación de candidato.

## Capacidades

- Control de política para Breakout: produce acciones de juego a partir del estado del entorno, con 17.253 parámetros escalares.
- Serialización y publicación versionada: el controlador valida JSON, serializa pesos, publica revisiones inmutables en Hugging Face y solicita simulaciones sobre la revisión exacta publicada.
- Verificación con hashes: cada commit del Hub es una versión inmutable y la demo resuelve una revisión antes de descargar, comprobando ambos hashes.
- Reproducción determinista: semillas fijas para práctica, promoción y auditoría, con comparaciones emparejadas.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo, visión ni audio: no es un modelo generativo de texto.
- El componente que sí razona y propone ediciones es el editor externo `qwen/qwen3.6-35b-a3b`, no este checkpoint.

## Casos de uso

- Reproducción de experimentos de weight-space programming: clonar el repositorio, cargar `policy.npz` y ejecutar la simulación en CPU para verificar el retorno de 1,3809 sobre las semillas de auditoría.
- Estudio de protocolos de promoción estadística: el par candidato/incumbente con 512 semillas emparejadas y el criterio `gain - 2*SE > 0` sirven como plantilla para diseñar pantallas de aceptación en experimentos adaptativos.
- Auditoría de pipelines de LLM como editor: el repositorio conserva trazas, hashes de candidatos, informes del verificador y decisiones por ronda, útil para estudiar fallos por límite de turnos y de tokens.
- Docencia sobre evaluación emparejada: el contraste entre la ausencia de mejora (+0,0000) y la infraestructura de evaluación desplegada ilustra la diferencia entre capacidad de medida y capacidad de optimización.
- Punto de partida para reparación iterativa: la política inicial con controles invertidos (`initial_baseline.safetensors`) es un caso de prueba controlado para validar herramientas de diagnóstico de causa desconocida.
- Integración en entornos Prime: el pipeline puede reutilizarse para lanzar rondas con otros editores o presupuestos de tokens, manteniendo las fronteras de semillas documentadas.
- Referencia de despliegue en CPU: la demo en Hugging Face Spaces muestra cómo servir una política pequeña sin GPU, con verificación de revisión e integridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible en el sentido habitual (MMLU, HumanEval, GSM8K). Los únicos datos de rendimiento son los del propio entorno Breakout:

| Métrica | Valor |
|---|---|
| Retorno inicial defectuoso (1.024 semillas) | 1,3809 |
| Retorno final seleccionado (1.024 semillas) | 1,3809 |
| Ganancia emparejada | +0,0000 |
| Error estándar emparejado | 0,0000 |
| Rondas ejecutadas | 3 |
| Rondas con candidato válido | 0 |
| Semillas de práctica por ronda | 32 |
| Semillas de promoción por ronda | 512 |
| Semillas de auditoría final | 1.024 |

## Requisitos de hardware

- VRAM para inferencia: 0 GB; la simulación y la inferencia de la política corren en CPU.
- GPU recomendadas: ninguna; el autor indica explícitamente que el juego no necesita GPU.
- Compatibilidad con GPU de consumo: irrelevante, el cuello de botella es la orquestación, no el cómputo.
- Opciones de despliegue: Hugging Face Spaces (CPU) para la demo, ejecución local con NumPy cargando `policy.npz`, y el pipeline de GitHub para el bucle completo.
- Costes: la inferencia del editor y la evaluación alojada en Prime pueden generar cargos; el controlador no ejecuta modelos grandes ni partidas de evaluación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `HarleyCooper/weight-space-breakout-failure-driven-01` | 17.253 | No aplica | Control de Breakout | MIT | Hugging Face, CPU |
| Experimento one-shot previo del mismo autor | No disponible | No aplica | Control de Breakout | MIT (según repo) | Hugging Face, separado |
| `qwen/qwen3.6-35b-a3b` (editor usado) | 35B totales, MoE con 3B activos (según nomenclatura) | No disponible en la información | Generación de texto y propuesta de ediciones | No disponible en la información | Prime |
| Políticas de RL convencionales para Atari Breakout | Variable, típicamente cientos de miles a millones | No aplica | Control de Breakout | Variable | Repositorios de RL |

La comparación directa con modelos de lenguaje no procede: este artefacto es un controlador de 17.253 parámetros y su valor está en el protocolo de evaluación, no en capacidades generativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no admite prompts conversacionales.
- El checkpoint publicado es la política inicial defectuosa con controles invertidos; la ejecución no demuestra mejora de política.
- Las tres rondas se rechazaron por límite de turnos o de tokens; no hubo evaluación de candidato en ninguna.
- La regla de promoción es una pantalla de ingeniería, no una prueba de significación estadística general; la búsqueda adaptativa requiere replicación independiente.
- Los medios de distintas filas de la tabla de rondas no son directamente comparables, ya que cada candidato válido se evalúa sobre 512 semillas nuevas emparejadas.
- Divulgación del harness: Prime anunciaba herramientas `bash` y `edit`, el prompt las prohibía (e indicaba incorrectamente que no estaban disponibles) y el controlador exige cero llamadas reales a herramientas; la ejecución demuestra ediciones sin uso de herramientas, no un harness técnicamente libre de herramientas.
- La auditoría final no se introdujo en el editor ni se usó para seleccionar política, pero tampoco aporta evidencia de ganancia.
- Riesgo de alucinación: no aplica al no ser generativo; el riesgo equivalente es la propuesta de ediciones inválidas por parte del editor externo.
- Sesgos conocidos: no disponibles.
- Restricciones de licencia: MIT permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- Caveat de producción: los resultados pueden estancarse o fallar todos los candidatos; un intento no aceptado no modifica la política activa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HarleyCooper/weight-space-breakout-failure-driven-01
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/HarleyCooper/weight-space-breakout-failure-driven-demo-01
- Código del pipeline: https://github.com/HarleyCoops/weight-space-breakout-pipeline
- Entorno en Prime: https://app.primeintellect.ai/dashboard/environments/harleycooper/weight-space-breakout
- Documento de reparación guiada por fallos: `FAILURE_DRIVEN.md` en el repositorio del modelo
- Editor utilizado: `qwen/qwen3.6-35b-a3b` (referenciado en la model card, sin enlace directo en la información disponible)
