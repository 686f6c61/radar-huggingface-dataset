# NagaYu/rubato-timing

## Resumen

Rubato es un modelo de timing para turn-taking en diálogo hablado, desarrollado por NagaYu. Con solo 3.137 parámetros, responde a una pregunta a 50 Hz: dado todo lo escuchado hasta el momento, ¿cuánto durará este silencio? Un programa dinámico convierte esa distribución en una decisión de empezar a hablar o esperar, bajo una asimetría explícita y ajustable entre interrumpir a alguien y responder tarde.

El modelo decide **cuándo** hablar, no **qué** decir. No contiene reconocedor de voz, modelo de lenguaje ni sintetizador; es una capa intermedia que se integra en un pipeline existente. Su relevancia radica en que aborda el problema del endpointing y la toma de turnos en sistemas conversacionales en tiempo real, un aspecto crítico para la naturalidad de los asistentes de voz. Está entrenado en el corpus HCRC Map Task (CC-BY-4.0) y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de una capa oculta sobre características causales (hazard discreto) + programa dinámico de parada óptima |
| Parametros totales | 3.137 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (procesa audio en frames de 20 ms) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (características léxicas); las temporales y acústicas son transferibles |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería `rubato`, probablemente PyTorch) |

## Arquitectura y entrenamiento

El modelo combina un hazard discreto en el tiempo: `h_k = P(partner resumes in frame k+1 | silent through k, evidence up to k)`, calculado por una red de una capa oculta sobre un vector de características causales. Estas incluyen una expansión de base radial del log del silencio transcurrido, duración del turno, número de pausas, completitud del transcript (condicionada al retraso del ASR), prosodia terminal, precursores acústicos como inspiraciones y un posterior por interlocutor. Sobre la curva de supervivencia pronosticada, un programa dinámico hacia atrás minimiza `alpha * P(collision) + beta * latency`, donde ser interrumpido (el humano continúa mientras el agente está en silencio) no tiene coste, lo que produce un comportamiento similar al humano: cuando parece probable que el interlocutor retome, esperar es casi gratis; cuando el turno está claramente abierto, el agente puede empezar con cero gap.

El entrenamiento se realizó en el corpus HCRC Map Task, con 5.988 silencios de validación de hablantes no vistos. Incluye entrainment online mediante posteriores conjugados sobre las distribuciones de pausa y gap de cada interlocutor, y una EMA de su velocidad de habla, con contracción a un prior poblacional para que los primeros treinta segundos no sean peores que no adaptarse.

## Capacidades

- Predicción de la distribución de duración del silencio en tiempo real a 50 Hz.
- Decisión de inicio de habla (start/wait) con control explícito del equilibrio entre interrumpir y responder tarde.
- Entrainment online por interlocutor (pausas, gaps, velocidad de habla).
- Integración con frameworks de voz: adaptadores para Pipecat (`RubatoTurnGate`) y LiveKit (`RubatoTurnDetector`).
- Salidas por frame: `should_speak`, `planned_onset_s`, `p_overlap_now`, `future_hazards`.
- Acepta audio mono de 20 ms (cualquier tasa, asume 16 kHz), transcript parcial opcional del ASR e identificador de interlocutor opcional.
- No incluye reconocimiento de voz, generación de lenguaje ni síntesis; es una capa de timing pura.

## Casos de uso

- Asistentes de voz conversacionales: el modelo decide cuándo el agente debe empezar a hablar en una conversación bidireccional, reduciendo la latencia de respuesta sin aumentar las interrupciones. Se integra como capa intermedia entre el ASR y el LLM.
- Sistemas de endpointing en centros de atención al cliente: permite que un IVR o bot telefónico detecte el final del turno del usuario con mayor precisión que un umbral fijo, mejorando la fluidez de la interacción.
- Agentes de voz en tiempo real para teleoperación o teleasistencia: el modelo puede gestionar el turno en conversaciones con contexto largo, adaptándose al ritmo de habla del interlocutor mediante entrainment.
- Herramientas de transcripción y subtitulado en vivo: aunque no transcribe, puede sincronizar la toma de turnos en sistemas de diálogo hablado, mejorando la experiencia de usuarios con discapacidad auditiva.
- Robótica de servicio con interacción por voz: un robot que conversa con personas puede usar Rubato para decidir cuándo intervenir sin cortar al usuario, en entornos con ruido variable.
- Investigación en diálogo hablado: el modelo sirve como referencia para estudiar el equilibrio entre latencia y colisión en sistemas de turn-taking, y como base para experimentos de entrainment y adaptación a interlocutores.

## Benchmarks y rendimiento

El modelo fue evaluado en 5.988 silencios de hablantes no vistos del corpus MapTask (CC-BY-4.0). Los resultados reportados son:

| Metrica | Valor |
|---|---|
| Cobertura de la frontera de umbral fijo | 86% de sus puntos |
| Cobertura de la frontera de completitud semántica | 100% de sus puntos |
| Latencia ahorrada con talk-over igualado | 84 ms vs fijo, 96 ms vs semántico |
| Talk-over eliminado con latencia igualada | 2.8 pp vs fijo, 2.1 pp vs semántico |
| Calibración del hazard (ECE) | 0.0007 |
| CRPS skill sobre hazard sin covariables | +0.173 |
| Coste por frame de 20 ms | 0.26 ms mediana, 0.49 ms p99 |

En el punto de operación equivalente a un umbral de 1000 ms: latencia reducida de 1000 ms a 772 ms (IC 95%: 707–831), talk-over de 6.3% a 6.5% (IC 95%: 5.6%–7.6%). Los intervalos se calcularon con bootstrap por clúster a nivel de conversación.

## Requisitos de hardware

- El modelo es extremadamente ligero: 3.137 parámetros, con un coste de inferencia de 0.26 ms por frame (20 ms de audio) en mediana, y 0.49 ms en p99.
- No requiere GPU; puede ejecutarse en CPU en tiempo real sin problema. Cualquier procesador moderno es suficiente.
- Memoria RAM despreciable (menos de 1 MB para los pesos).
- Opciones de despliegue: se integra mediante la librería `rubato` en Python, con adaptadores para Pipecat y LiveKit. No se mencionan otros runtimes como vLLM u Ollama, dado que no es un LLM.
- Latencia y throughput: el coste por frame es inferior a la duración del frame (20 ms), por lo que puede operar en tiempo real con margen amplio.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (timing de turn-taking con 3K parámetros). Los sistemas de endpointing tradicionales suelen usar umbrales fijos de silencio o clasificadores de voz, pero no publican modelos abiertos con estas características. Alternativas como Silero VAD o WebRTC VAD detectan actividad de voz pero no modelan la distribución del silencio ni toman decisiones de turno. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Características léxicas en inglés: la parte temporal y acústica es transferible, pero las características de completitud del transcript se entrenaron en inglés y pueden inducir a error en otros idiomas. Se recomienda reentrenar con datos del idioma objetivo.
- Datos de entrenamiento orientados a tareas: el corpus HCRC Map Task es de colaboración en una tarea de seguimiento de rutas. La conversación de dominio abierto tiene gaps más largos y variables; es necesario reajustar `seconds_per_collision`.
- Solo dos interlocutores: la gestión del turno en conversaciones multiparte es un problema diferente no cubierto por este modelo.
- Supuesto del protocolo offline: en una transferencia de turno se asume que el turno habría permanecido abierto si el agente no hubiera hablado. La alternativa (censura informativa) es peor; ambos escenarios se documentan en el repositorio.
- Es una capa de timing, no un oráculo de turn-taking: no puede saber que el usuario pausó porque estaba a punto de decir algo difícil.
- Uso responsable: el modelo puede hacer que una voz sintética sea más difícil de distinguir de una persona. No debe usarse para suplantar a nadie, para hacer pasar una llamada automatizada por humana, ni para interrumpir estratégicamente a una persona con el fin de impedir que termine una idea. Se exige revelar que el sistema es una IA en la modalidad que el usuario atiende (hablada, no en una página de ajustes).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NagaYu/rubato-timing
- Repositorio fuente, protocolo de benchmarks, ablaciones y análisis de sensibilidad: https://github.com/NagaYu/rubato
