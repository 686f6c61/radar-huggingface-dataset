# mohanpoduri2005/sf2-doom-health-gathering-supreme

## Resumen

sf2-doom-health-gathering-supreme es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO de la librería Sample-Factory sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Lo publica el usuario mohanpoduri2005 como entrega de la Unidad 8 (PII) del curso Deep Reinforcement Learning de Hugging Face. No es un modelo de lenguaje: no genera texto ni procesa instrucciones, sino que implementa una política de control que decide acciones dentro de un escenario concreto de un videojuego en primera persona.

El problema que resuelve es acotado: maximizar la recolección de botiquines (health packs) mientras el agente sobrevive en un escenario con daño ambiental creciente. La model card declara una recompensa media de 14,5 ± 1,5, frente al mínimo de 5 exigido para aprobar la unidad del curso, lo que sitúa al agente por encima del umbral de superación. El resultado está marcado como no verificado en el model-index.

Su relevancia es fundamentalmente educativa y de investigación: sirve como referencia reproducible para comparar implementaciones de PPO, validar infraestructura de entrenamiento con Sample-Factory y participar en la clasificación del curso. El repositorio tiene un tamaño declarado de 0,0 GB y cero descargas, por lo que su utilidad práctica depende de que los pesos estén efectivamente disponibles, algo que no se puede confirmar con la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no detalla la topología de la red; se especifica únicamente el algoritmo, Sample-Factory PPO) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (agente de RL, no modelo de lenguaje; la observación depende del entorno ViZDoom) |
| Tipos de cuantización | no disponible / no aplicable |
| Idiomas soportados | no aplicable (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el tamaño declarado del repositorio es 0,0 GB, por lo que los pesos podrían no estar publicados o el tamaño aparecer truncado) |
| Entorno | `doom_health_gathering_supreme` (ViZDoom) |
| Algoritmo | Sample-Factory PPO |
| Librería | sample-factory |
| Pipeline | reinforcement-learning |
| Tarea | reinforcement-learning |
| Recompensa media declarada | 14,5 ± 1,5 |
| Repositorio | https://huggingface.co/mohanpoduri2005/sf2-doom-health-gathering-supreme |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-22 |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un agente entrenado con PPO (Proximal Policy Optimization) mediante la librería Sample-Factory, una implementación de alto rendimiento para entrenamiento asíncrono y distribuido de agentes de refuerzo. La model card no especifica la arquitectura de red empleada (número de capas, tipo de extractor de características para las observaciones visuales de ViZDoom, tamaño de las capas recurrentes, etc.), ni el número total de parámetros. Tampoco se documentan hiperparámetros como la tasa de aprendizaje, el tamaño de lote, el número de entornos en paralelo, el horizonte de entrenamiento ni el total de pasos o frames consumidos.

El entorno `doom_health_gathering_supreme` es un escenario de ViZDoom en el que el agente recibe una señal de recompensa por recoger botiquines y sufre daño ambiental progresivo. No se documenta ningún tipo de ajuste por retroalimentación humana (RLHF), destilación o decodificación especulativa, conceptos que no aplican a un agente de control. La única métrica de entrenamiento publicada es la recompensa media de evaluación, 14,5 ± 1,5, declarada como no verificada y por encima del mínimo de 5 requerido para superar la unidad del curso.

## Capacidades

- Control de políticas en un único entorno: el agente está especializado en `doom_health_gathering_supreme` y no se declara capacidad de generalización a otros escenarios, tareas o entornos.
- Recogida de botiquines y supervivencia: según la métrica declarada, la política aprende a obtener recompensa en el escenario, con una media de 14,5 ± 1,5.
- Integración con Sample-Factory: el artefacto está preparado para ser cargado y evaluado con la librería sample-factory y el flujo de la clasificación del curso Deep RL.
- Generación de texto: no disponible / no aplicable.
- Razonamiento, código y matemáticas: no disponible / no aplicable.
- Soporte de tool calling o function calling: no disponible / no aplicable.
- Soporte de agentes y razonamiento multi-paso en el sentido de LLM: no aplicable (el término "agente" aquí se refiere a un agente de RL, no a un agente basado en lenguaje).
- Capacidades multilingües: no aplicable.
- Capacidades especiales (modo thinking, visión, audio): no disponible. Las observaciones del entorno son de naturaleza visual dentro de ViZDoom, pero no se documenta ningún procesamiento de visión de propósito general.

## Casos de uso

- Reproducción didáctica de un pipeline de RL: cargar el agente con Sample-Factory y evaluarlo en `doom_health_gathering_supreme` para reproducir el resultado declarado (14,5 ± 1,5). Es adecuado porque el artefacto se publicó específicamente como entrega verificable de la Unidad 8 del curso.
- Comparación de algoritmos PPO: usar esta política como referencia empírica frente a entrenamientos propios con otros hiperparámetros o semillas, siempre que los pesos estén disponibles en el repositorio.
- Validación de infraestructura de evaluación: comprobar que un entorno de evaluación propio (máquinas, dependencias de ViZDoom, versiones de Sample-Factory) produce métricas coherentes antes de lanzar entrenamientos largos y costosos.
- Estudio de variabilidad y reproducibilidad en RL: comparar la desviación declarada (± 1,5) con la obtenida en reevaluaciones propias para analizar la estabilidad del aprendizaje entre semillas.
- Material docente para cursos de aprendizaje por refuerzo: ilustrar el ciclo completo de definir entorno, entrenar con PPO, evaluar y publicar un modelo con model-index en Hugging Face, incluyendo la diferencia entre resultados verificados y no verificados.
- Pruebas de integración de la librería sample-factory en CI: dado el reducido tamaño esperado de una política para una tarea de este tipo, puede emplearse como caso de prueba para verificar que la carga de checkpoints y la API de inferencia funcionan tras actualizaciones de dependencias.
- Base para ajuste fino o reinicio de entrenamiento: si los pesos están publicados, pueden servir como punto de partida para continuar el entrenamiento y medir mejoras sobre la recompensa declarada.

## Benchmarks y rendimiento

| Tarea | Conjunto de datos | Métrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | doom_health_gathering_supreme | mean_reward | 14,5 ± 1,5 | No |

Datos adicionales declarados en la model card: el resultado mínimo requerido para superar la unidad del curso es 5, por lo que la recompensa declarada queda aproximadamente 9,5 puntos por encima de ese umbral. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, y ninguno de ellos sería aplicable a un agente de RL especializado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican parámetros, arquitectura ni tamaño de checkpoint, por lo que no es posible estimar memoria de forma fundamentada.
- GPU recomendadas: no disponible. No se documenta ninguna GPU empleada ni recomendada para el entrenamiento o la inferencia.
- Viabilidad en GPU de consumo: no disponible. No puede confirmarse sin conocer el tamaño real del modelo, y el repositorio declara 0,0 GB.
- Opciones de despliegue: la única vía documentada es la librería sample-factory, junto con el entorno ViZDoom y sus dependencias. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un agente de RL de este tipo.
- Latencia y throughput: no disponible. No se publican mediciones de pasos por segundo, tiempo por episodio ni coste de entrenamiento.
- Requisito funcional: la evaluación exige disponer del entorno `doom_health_gathering_supreme` y de una instalación compatible de ViZDoom; sin ellos el checkpoint no puede ejecutarse.

## Comparativa con modelos similares

| Alternativa | Tipo | Algoritmo | Entorno | Recompensa publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sf2-doom-health-gathering-supreme (este modelo) | Agente RL | Sample-Factory PPO | doom_health_gathering_supreme | 14,5 ± 1,5 (no verificado) | no disponible | Repositorio HF, 0 descargas, 0,0 GB declarados |
| Agentes Sample-Factory de referencia | Framework de RL | PPO y otros | Múltiples entornos, incluidos escenarios ViZDoom | no disponible | MIT (según la documentación pública del proyecto) | Código y recetas públicas en el repositorio del proyecto |
| CleanRL PPO | Implementación de referencia | PPO | Múltiples entornos, Atari y otros | no disponible | MIT (según la documentación pública del proyecto) | Código público de un solo archivo |
| Stable-Baselines3 PPO | Librería de RL | PPO | Múltiples entornos compatibles con Gymnasium | no disponible | MIT (según la documentación pública del proyecto) | Librería ampliamente distribuida |

No se dispone de cifras comparativas de recompensa para las alternativas, ya que la información proporcionada no incluye resultados de esos proyectos sobre `doom_health_gathering_supreme`. La comparación debe considerarse estructural (tipo de artefacto, algoritmo y licencia), no de rendimiento.

## Limitaciones y advertencias

- Especialización extrema: el agente solo está entrenado para `doom_health_gathering_supreme`; no se declara ninguna capacidad de transferencia a otras tareas, entornos o dominios.
- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgo, y el concepto no aplica de la misma forma que en modelos de lenguaje.
- Riesgo de alucinación: no aplicable en el sentido de generación de texto; el riesgo equivalente es una política que explote atajos del entorno o que rinda de forma inestable entre episodios, algo no documentado.
- Resultado no verificado: la métrica 14,5 ± 1,5 está marcada como `verified: false`, por lo que procede de la declaración del autor y no de una validación independiente.
- Licencia ausente: no se especifica licencia. Sin una licencia explícita, no hay autorización clara para uso comercial ni para redistribución, lo que supone un riesgo legal relevante en cualquier contexto de producción.
- Disponibilidad de pesos incierta: el repositorio declara 0,0 GB de tamaño, lo que sugiere que los pesos podrían no estar publicados o que el dato está truncado. Debe verificarse antes de planificar cualquier uso.
- Sin adopción: 0 descargas y 0 likes. No hay evidencia de uso externo, revisión por terceros ni informes de reproducibilidad independientes.
- Ausencia de documentación técnica: no se detallan arquitectura, hiperparámetros, número de pasos de entrenamiento, semillas ni procedimiento de evaluación, lo que dificulta la reproducibilidad.
- Dependencia del entorno: la ejecución requiere ViZDoom y versiones compatibles de las dependencias de Sample-Factory; cambios de versión pueden romper la carga del checkpoint.
- Fecha de creación inusual: el repositorio figura creado el 2026-09-22, posterior a la fecha habitual de publicación de contenidos del curso, dato que conviene contrastar en la propia plataforma.
- Alcance del resultado: superar el umbral de 5 es un criterio pedagógico, no un estándar de rendimiento de referencia en investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohanpoduri2005/sf2-doom-health-gathering-supreme
- Curso Deep Reinforcement Learning de Hugging Face (mencionado en la model card): https://huggingface.co/learn/deep-rl-course
- Repositorio de la librería Sample-Factory (referencia de la librería declarada): https://github.com/alex-petrenko/sample-factory
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo. Las únicas entradas devueltas corresponden al planificador de rutas Falk (falk.de) y no guardan relación con el modelo, por lo que se descartan.
