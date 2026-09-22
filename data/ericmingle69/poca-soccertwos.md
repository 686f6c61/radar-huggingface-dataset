# EricMingle69/poca-SoccerTwos

## Resumen

`EricMingle69/poca-SoccerTwos` es una política de aprendizaje por refuerzo profundo entrenada para el entorno **SoccerTwos** de Unity ML-Agents, un escenario multiaagente de fútbol 2 contra 2. El agente se ha entrenado con el algoritmo denominado **poca** dentro del flujo de trabajo de Unity ML-Agents, en el marco del curso de Deep Reinforcement Learning de Hugging Face, y se distribuye como un grafo **ONNX** listo para ser consumido por el motor de Unity (Sentis/Barracuda) o por cualquier runtime compatible con ONNX.

No se trata de un modelo de lenguaje ni de un modelo generativo multimodal: es un controlador de política que recibe observaciones del entorno y emite acciones continuas o discretas (movimiento y rotación del jugador, además de acciones de fútbol). El repositorio ocupa aproximadamente 0,1 GB. El autor no publica licencia, idiomas, arquitectura de red ni número de parámetros, por lo que la mayor parte de las especificaciones habituales de una ficha de modelo quedan como no disponibles.

El dato más relevante es su rendimiento declarado: una recompensa media de **-0,11 ± 0,56** sobre 100 episodios, con una puntuación (media menos desviación típica) de **-0,671**. Son valores cercanos a cero con una varianza muy alta, lo que indica una política de calidad limitada y sirve sobre todo como punto de partida reproducible para experimentar con el pipeline de ML-Agents. El modelo se publicó el 22 de septiembre de 2026 y no acumula descargas ni interacciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Política neuronal entrenada con Unity ML-Agents mediante el algoritmo denominado "poca"; el autor no detalla el tipo de red (MLP, CNN u otra) ni sus capas |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje). El agente consume observaciones por paso de simulación; la dimensionalidad y composición de dichas observaciones no se especifican |
| Tipos de cuantizacion | No disponible. El artefacto distribuido es un grafo ONNX; admitiría cuantización FP16/INT8 con herramientas estándar de ONNX, pero no hay versiones cuantizadas publicadas |
| Idiomas soportados | No aplica (no procesa lenguaje natural). No disponible en la ficha del autor |
| Licencia | No disponible |
| Formato de pesos | ONNX (librería declarada: `ml-agents`); tamaño del repositorio: 0,1 GB |

## Arquitectura y entrenamiento

El autor indica únicamente que se trata de un agente **poca** entrenado con **Unity ML-Agents** para el entorno SoccerTwos, como parte del curso de Deep Reinforcement Learning de Hugging Face. No se especifica el tipo de red (perceptrón multicapa con observaciones vectoriales, red convolucional sobre observaciones visuales o una combinación), el número de capas, el tamaño de las capas ocultas, el número de parámetros ni el número de pasos de entrenamiento. Tampoco se documentan los hiperparámetros del entrenador, la composición de las recompensas ni si se empleó self-play frente a oponentes fijos.

El resultado del entrenamiento es un **modelo exportado a ONNX** que se integra en el entorno de Unity para ejecutar inferencia en el bucle de simulación. La evaluación declarada se realizó con "una ejecución de inferencia real con la política ONNX exportada en el entorno de Unity", sobre 100 episodios. No se menciona ninguna innovación técnica adicional (decodificación especulativa, atención lineal, curriculum learning explícito ni fases de RLHF/DPO, que en cualquier caso no aplican a este tipo de modelo).

## Capacidades

- Control de un jugador en el escenario **SoccerTwos** de Unity ML-Agents: generación de acciones de movimiento, orientación y acciones específicas de fútbol (desplazamiento hacia el balón, golpeo y coordinación básica con el compañero de equipo).
- Ejecución de inferencia en el bucle de simulación de Unity a partir del grafo ONNX exportado.
- Comportamiento de agente individual dentro de un entorno multiaagente cooperativo-competitivo 2v2.
- Reproducibilidad del pipeline de entrenamiento y exportación de ML-Agents (útil como referencia para replicar el flujo del curso).
- **No** dispone de generación de texto, razonamiento simbólico, código, matemáticas ni visión entendida como modelo multimodal.
- **No** soporta tool calling, function calling, uso de agentes basados en LLM ni razonamiento multi-paso en lenguaje natural.
- **No** tiene capacidades multilingües ni modo "thinking".

## Casos de uso

- **Reproducción de prácticas del curso de Deep RL de Hugging Face**: sirve como artefacto de referencia para verificar que el pipeline de entrenamiento, exportación a ONNX e integración en Unity funciona de extremo a extremo, comparando la recompensa obtenida con la declarada (-0,11 ± 0,56).
- **Línea base (baseline) en experimentos de MARL**: al ser una política con rendimiento cercano a cero y alta varianza, resulta útil como cota inferior frente a la que medir la mejora de nuevos algoritmos o curricula en SoccerTwos, siempre que se documente que su rendimiento es bajo.
- **Depuración de infraestructura de inferencia**: permite validar la carga de modelos ONNX en Unity Sentis/Barracuda, medir el coste por paso de simulación y comprobar la compatibilidad del exportador de ML-Agents en distintas versiones del editor.
- **Banco de pruebas de auto juego y torneos internos**: el agente puede desplegarse como oponente débil en ligas locales de agentes, útil para generar diversidad de enfrentamientos sin depender de la política integrada por defecto del entorno.
- **Docencia y demostraciones en asignaturas de aprendizaje por refuerzo**: ejemplifica de forma tangible el ciclo observación-acción-recompensa, la exportación de políticas y las limitaciones reales de un entrenamiento corto o mal ajustado.
- **Generación de datos de evaluación para análisis de comportamiento**: registrar 100 o más episodios con esta política permite estudiar métricas como la varianza de la recompensa, la tasa de empates o los patrones de movimiento, y contrastarlas con las de políticas mejores.
- **Punto de partida para ajuste fino**: el ONNX y la configuración de ML-Agents asociada pueden reutilizarse como inicialización para continuar el entrenamiento con más pasos o con un currículo más exigente, aunque no se documenta ninguna receta de reentrenamiento.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`verified: false`, es decir, no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| reinforcement-learning | ML-Agents-SoccerTwos | mean_reward | -0,11 ± 0,56 |

Detalle de la evaluación incluido en la model card:

| Parámetro de evaluación | Valor |
|---|---|
| Entorno de evaluación | Unity, inferencia real con la política ONNX exportada |
| Episodios | 100 |
| Recompensa media (mean_reward) | -0,114 |
| Desviación típica (std_reward) | 0,557 |
| Puntuación (mean - std) | -0,671 |
| Verificación independiente | No (`verified: false`) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de modelos de lenguaje, ya que no son aplicables a este tipo de modelo. Tampoco se ofrecen comparaciones con otras políticas del mismo entorno.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible con precisión. Al ser una política exportada a ONNX para un entorno de simulación 2v2, la huella típica de un modelo de este tipo es muy reducida (del orden de megabytes en pesos), pero el autor no publica el número de parámetros ni el tamaño del grafo, por lo que no se puede dar una cifra verificada.
- **GPU recomendadas**: la inferencia de políticas ONNX de ML-Agents está diseñada para ejecutarse en **CPU** a través de Unity Sentis/Barracuda. Cualquier GPU de consumo reciente (por ejemplo, serie RTX 30/40) es más que suficiente si se opta por ejecución en GPU; no se requiere A100 ni H100.
- **Compatibilidad con GPU de consumo**: sí, con altísima probabilidad cabe en cualquier GPU de consumo e incluso en equipos sin GPU dedicada, dado el tamaño del repositorio (0,1 GB) y la naturaleza del artefacto.
- **Requisitos de entrenamiento**: no disponibles. El entrenamiento con ML-Agents de escenarios SoccerTwos es viable en GPU de consumo, pero no se documentan tiempos ni hardware empleados.
- **Opciones de despliegue**: Unity ML-Agents con Unity Sentis (anteriormente Barracuda) o Unity Inference Engine; ONNX Runtime para ejecución fuera de Unity. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- **Latencia y throughput**: no disponibles. La latencia depende del bucle de simulación de Unity, del número de agentes y de la frecuencia de decisión configurada, no solo del modelo.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. No hay cifras publicadas de otras políticas de SoccerTwos con las que contrastar parámetros, contexto, rendimiento o licencia. La tabla siguiente refleja únicamente lo que sí está documentado:

| Modelo | Tipo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EricMingle69/poca-SoccerTwos | Política RL (ONNX, ML-Agents) | SoccerTwos (Unity ML-Agents) | -0,11 ± 0,56 (100 episodios, no verificado) | No disponible | Hugging Face |
| Otras políticas de SoccerTwos (ML-Agents, curso de Deep RL de Hugging Face) | Política RL | SoccerTwos | No disponible | No disponible | No disponible |
| Políticas integradas del toolkit ML-Agents para SoccerTwos | Política RL | SoccerTwos | No disponible | No disponible | No disponible |

No se dispone de MMLU, HumanEval ni GSM8K porque ningún modelo de esta categoría los evalúa.

## Limitaciones y advertencias

- **Rendimiento bajo**: la recompensa media declarada (-0,11) es próxima a cero con una desviación típica elevada (0,56), lo que sugiere un comportamiento cercano al azar y una alta variabilidad entre episodios. No debe considerarse un agente competitivo.
- **Métricas no verificadas**: el campo `verified` de la model card es `false`; los resultados proceden exclusivamente del autor y no han sido reproducidos de forma independiente.
- **Información técnica ausente**: no se documentan arquitectura de red, número de parámetros, observaciones, acciones, hiperparámetros ni proceso de entrenamiento, lo que dificulta la reproducibilidad y la auditoría del modelo.
- **Licencia no especificada**: al no declararse licencia, el uso comercial queda en un limbo jurídico. Conviene contactar con el autor antes de cualquier uso en producción.
- **Riesgo de sobreajuste al entorno**: la política está entrenada específicamente para SoccerTwos y no generaliza a otras tareas, escenarios ni versiones del entorno.
- **Sin capacidades de lenguaje ni de tool calling**: no es utilizable como asistente, generador de texto, de código ni como componente de un agente basado en LLM.
- **Dependencia del runtime**: el ONNX está pensado para Unity ML-Agents/Sentis; cambios de versión del editor o del runtime de inferencia pueden alterar o romper el comportamiento observado.
- **Ausencia de sesgos lingüísticos, pero posible comportamiento no deseado**: no hay sesgos de idioma, aunque en entornos de RL puede aparecer explotación de recompensas (*reward hacking*) y comportamientos degenerados no documentados.
- **Fecha de publicación atípica**: la model card indica una fecha de creación de 2026-09-22; conviene verificar la vigencia del repositorio antes de reutilizarlo.
- **Sin datos de reproducibilidad**: no se incluye semilla, versión de ML-Agents ni configuración YAML, por lo que replicar exactamente el resultado no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EricMingle69/poca-SoccerTwos
- Curso de Deep Reinforcement Learning de Hugging Face (contexto del entrenamiento, mencionado en la model card): no disponible en los resultados de búsqueda
- Paper o documentación técnica del algoritmo "poca": no disponible
- Repositorio de código: no disponible
- Demo interactiva: no disponible
- Nota sobre la búsqueda web: los resultados recuperados no guardan relación con el modelo (corresponden a páginas de WhatsApp), por lo que no aportan enlaces adicionales utilizables.
