# 1T/wt-pplx-decider-27b-insurance-hitl-v1

## Resumen

wt-pplx-decider-27b-insurance-hitl-v1 es un «decision head» (cabeza de clasificación) entrenado por el usuario 1T sobre el modelo perplexity-ai/pplx-decider-v1.1-27b. No es un modelo generativo autónomo: es un módulo que, dada una conversación de atención al cliente de seguros en coreano, emite dos puntuaciones —PROCEED (procesar la petición ahora) y ASK (devolver una pregunta al usuario antes de actuar)—. Su función es servir de puerta de decisión en flujos con human-in-the-loop, donde actuar sin la información necesaria tiene coste real.

El repositorio no contiene los pesos del cuerpo del modelo, sino únicamente `head.pt`, una matriz de readout de 255 × 5120 (aproximadamente 1,31 M de parámetros, 5,2 MB en float32) más el parámetro de temperatura. El cuerpo se carga desde el checkpoint original de Perplexity AI (commit `14c9d90137962d300f3de95633f7b6535e80c5ce`), de 27B de parámetros según su denominación, y solo se sustituye la lectura final en las peticiones marcadas como `tuned`; el resto de decisiones sigue calculándose con el readout original en el mismo servidor.

Su relevancia es acotada pero clara: demuestra que un ajuste de una sola matriz de lectura, entrenado en menos de una hora en una GPU, mejora la exactitud de 63,8% a 81,0% en el dominio específico y reduce a la mitad los casos en que el sistema actúa cuando debería haber preguntado. Es un ejemplo de intervención mínima sobre un modelo grande para corregir un comportamiento concreto, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible para el cuerpo (perplexity-ai/pplx-decider-v1.1-27b). El componente entrenado es un readout lineal de 255 × 5120 sobre las características del cuerpo |
| Parámetros totales | 27B en el cuerpo (según denominación del modelo base) + 1.305.600 en el head entrenado |
| Parámetros activos | No disponible (no se indica que el cuerpo sea MoE) |
| Longitud de contexto | 8.192 tokens de entrada como límite declarado; evaluado también con conversaciones de 2K a 16K tokens |
| Tipos de cuantización | No disponible. El autor documenta el uso en bf16 |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | `head.pt` (PyTorch) para la cabeza; los pesos del cuerpo no se distribuyen en este repositorio |
| Modelo base | perplexity-ai/pplx-decider-v1.1-27b (commit `14c9d90137962d300f3de95633f7b6535e80c5ce`) |
| Tarea declarada | Clasificación de decisión PROCEED / ASK en diálogo de seguros |
| Interfaz | HTTP `POST /decide` con selección de cabeza (`base` o `tuned`) |
| Memoria del cuerpo en bf16 | ~62 GB (1 GPU H100) |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El cuerpo del modelo no se ha reentrenado ni modificado. El autor congela el checkpoint de 27B, extrae una vez las características del último estado oculto (dimensión 5120, según la forma de la matriz) y entrena únicamente la proyección de salida de 255 clases con su temperatura asociada. Este esquema —extracción de características offline más un clasificador lineal— implica que el coste de entrenamiento es mínimo: menos de una hora en una sola GPU, según la model card.

Los datos de entrenamiento son conversaciones de consulta de seguros en coreano anotadas con la decisión correcta (proceder o volver a preguntar). No se especifica el volumen del conjunto, la composición exacta ni si hubo anotación múltiple o verificación entre anotadores. Tampoco se documenta el proceso de ajuste (pérdida, regularización, búsqueda de temperatura). La innovación técnica es, por tanto, de economía más que de arquitectura: sustituir un readout genérico por uno especializado sin tocar los 27B, y permitir que el mismo servidor elija cabeza por petición mediante el campo `head`, lo que facilita despliegues A/B y reversión inmediata a la cabeza original.

Un detalle operativo relevante: el servidor inyecta la instrucción (prompt) con la misma formulación empleada durante el entrenamiento. Cambiar la redacción de esa instrucción puede degradar el rendimiento, lo que convierte la plantilla en parte del contrato de la interfaz.

## Capacidades

- Clasificación binaria de decisión sobre el par {PROCEED, ASK} con puntuaciones normalizadas (por ejemplo, `{"PROCEED": 0.31, "ASK": 0.69}`).
- Condicionamiento sobre historial de conversación, consulta actual del usuario y un indicador booleano de presencia de información en la interfaz (`ui_info_present`), que permite evitar repreguntas cuando el dato ya está disponible en pantalla.
- Selección de cabeza en tiempo de petición: `base` (readout original) o `tuned` (este repositorio), con `tuned` como valor por defecto.
- Soporte de tareas identificadas por etiqueta (`task: "T2"` en el ejemplo de la model card); el catálogo completo de tareas no está documentado.
- Uso como componente de control en pipelines con intervención humana, no como generador de texto: no produce respuestas al usuario ni razonamiento en lenguaje natural.
- Operación multirronda: la entrada es el historial completo de la conversación, no un único turno.
- No se declaran capacidades de tool calling, agentes, visión, audio, matemáticas ni generación de código.

## Casos de uso

- **Puerta de decisión en el chat de atención al cliente de una aseguradora**: antes de que el agente virtual ejecute una acción (cambiar beneficiario, cancelar una póliza), el head evalúa el historial y devuelve ASK si falta un dato crítico. Es su caso de uso nativo y el que motivó el ajuste.
- **Reducción de repreguntas innecesarias**: con el indicador `ui_info_present`, el sistema puede suprimir preguntas cuando el usuario ya ha rellenado el campo en la interfaz. La métrica de ASK evitable baja del 11,4% al 2,3%, lo que se traduce directamente en menos fricción en el embudo.
- **Enrutado a humano por baja confianza**: usar el score de ASK como señal de escalado; por encima de un umbral configurable, la conversación se deriva a un agente humano en lugar de a la automatización, sin necesidad de entrenar un clasificador adicional.
- **Verificación previa a operaciones irreversibles**: colocar el head como gate en flujos de cancelación, siniestros o domiciliación bancaria, donde proceder con información incompleta genera coste operativo o riesgo regulatorio.
- **Auditoría y cumplimiento**: registrar `scores`, cabeza aplicada y versión del checkpoint en cada decisión permite reconstruir por qué el sistema actuó o preguntó, requisito habitual en entornos financieros y de seguros supervisados.
- **Evaluación A/B de cabezas y de plantillas de instrucción**: el campo `head` y la dependencia documentada respecto al texto de la instrucción permiten comparar en producción la cabeza original frente a la ajustada, o distintas formulaciones del prompt, con tráfico real.
- **Análisis de conversaciones históricas**: ejecutar el head sobre transcripciones ya cerradas para identificar puntos donde el sistema anterior debería haber preguntado y no lo hizo, como insumo para mejorar flujos y formación de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente reporta una evaluación propia sobre conversaciones no vistas durante el entrenamiento:

| Métrica | Cabeza original (`base`) | Este modelo (`tuned`) |
|---|---|---|
| Exactitud de la decisión | 63,8% | 81,0% |
| Casos en que debía preguntar y procedió | 54,1% | 31,1% |
| Casos en que podía proceder y preguntó | 11,4% | 2,3% |

| Régimen de contexto | Resultado comparativo |
|---|---|
| Conversaciones de 2K a 16K tokens | 2,3 puntos porcentuales por debajo de la cabeza original en exactitud |

No se documenta el tamaño del conjunto de evaluación ni los intervalos de confianza, por lo que las diferencias deben interpretarse como orientativas.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 62 GB para el cuerpo en bf16, según el autor. La cabeza añade 5,2 MB, cantidad despreciable.
- GPU recomendadas: una H100 de 80 GB es la configuración de referencia citada; una A100 de 80 GB es compatible por capacidad de memoria, aunque no está confirmada en la documentación.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 16-24 GB en bf16. No hay información publicada sobre cuantización del cuerpo (GGUF, AWQ, GPTQ), por lo que no se puede afirmar que exista una ruta viable en hardware de consumo.
- Despliegue: servicio HTTP propio con endpoint `POST /decide`, que carga el cuerpo una vez y aplica la cabeza seleccionada por petición. No se declara compatibilidad con vLLM, TGI, llama.cpp ni Ollama, y al no ser un modelo generativo estas pilas no encajan directamente con la interfaz descrita.
- Entrenamiento del head: menos de una hora en una sola GPU, una vez extraídas las características del cuerpo; el cuello de botella es la extracción, no el ajuste.
- Latencia y throughput: no disponibles. Al tratarse de una única pasada del cuerpo de 27B más una proyección lineal, la latencia vendrá dominada por el forward del modelo base y por la longitud del historial de entrada.

## Comparativa con modelos similares

No se dispone de información sobre otros heads de decisión públicos comparables. La comparación disponible es contra la cabeza original del mismo cuerpo:

| Modelo | Parámetros | Contexto | Exactitud en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wt-pplx-decider-27b-insurance-hitl-v1 | 27B (cuerpo congelado) + 1,31 M (head) | 8.192 tokens de entrada | 81,0% | Apache 2.0 | HuggingFace, solo `head.pt` |
| pplx-decider-v1.1-27b (cabeza original) | 27B + readout original | No disponible (el head ajustado se evalúa hasta 16K) | 63,8% | La del modelo base, no indicada en esta información | Requiere descargar el checkpoint original |
| Alternativas de clasificación específicas para seguros | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- **Idioma único**: entrenado y evaluado solo en coreano. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- **Dominio cerrado**: exclusivo de conversaciones de seguros. Fuera de ese dominio la calibración de PROCEED/ASK no está garantizada.
- **Alcance funcional mínimo**: solo aprende la decisión de repreguntar. El resto de decisiones sigue recayendo en el readout original del cuerpo, y no se documenta cuáles son.
- **Evaluación reducida**: el propio autor advierte que el número de conversaciones de evaluación es pequeño y que las cifras deben leerse como orientativas, no como garantía.
- **Degradación en contextos largos**: entre 2K y 16K tokens la exactitud cae 2,3 puntos porcentuales por debajo de la cabeza original, lo que desaconseja su uso en hilos muy extensos sin validación previa.
- **Sensibilidad al prompt**: la instrucción debe reproducir la formulación del entrenamiento; cambiarla puede degradar el rendimiento, lo que limita la libertad para adaptar el mensaje del sistema.
- **Riesgo de decisión incorrecta con consecuencias reales**: en el 31,1% de los casos en que debía preguntar, el sistema procede. En un contexto de seguros esto puede implicar acciones sobre pólizas o datos del cliente, por lo que se recomienda mantener un gate determinista adicional para operaciones irreversibles.
- **Sin datos de sesgo**: no se publica ningún análisis de sesgo por edad, género, tipo de póliza ni perfil del asegurado.
- **Distribución incompleta**: el repositorio está vacío salvo `head.pt` (0,0 GB) y no incluye tokenizador, configuración, scripts de servicio ni ejemplos de la plantilla de instrucción; sin el checkpoint del modelo base el artefacto es inutilizable.
- **Licencia**: el head es Apache 2.0, pero el uso del cuerpo queda sujeto a la licencia del modelo base de Perplexity AI, que no se detalla en esta información. Verificar antes de un despliegue comercial.
- **Madurez**: sin descargas ni valoraciones, sin pipeline declarado y sin soporte de la comunidad; no es un artefacto listo para producción sin trabajo de integración y validación propios.

## Enlaces

- Repositorio del modelo: https://huggingface.co/1T/wt-pplx-decider-27b-insurance-hitl-v1
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b
- Paper, blog técnico, repositorio de código y demo: no disponibles en la información proporcionada.
