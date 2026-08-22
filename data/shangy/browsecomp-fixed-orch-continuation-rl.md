# Shangy/browsecomp-fixed-orch-continuation-rl

## Resumen

El modelo `Shangy/browsecomp-fixed-orch-continuation-rl` es un checkpoint de archivo de un experimento de aprendizaje por refuerzo (RL) sobre el modelo base Qwen3-8B, orientado al protocolo BrowseComp de navegación web y agente investigador. El autor, Shangy, lo publica como una liberación archivada de un punto representativo de una fase de "continuación" que parte del checkpoint `fixed-orchestrator iter149`. El objetivo es mejorar la capacidad de un sistema orquestador-trabajador para resolver preguntas de investigación que requieren búsqueda, inspección de fuentes y recopilación de evidencias.

El modelo conserva la arquitectura transformer de Qwen3-8B y se ha ajustado mediante RL para el protocolo específico de BrowseComp. El checkpoint archivado en la revisión `iter59` alcanza una puntuación de 461/750 (0.6147) en cinco ejecuciones de validación, frente al 0.5960 del punto de partida, aunque el autor advierte que esta diferencia no debe interpretarse como una mejora estadísticamente significativa. Se publica bajo licencia Apache-2.0 y está pensado para replicación y análisis posterior, no para uso directo en producción.

La relevancia actual del modelo radica en que es un ejemplo de ajuste fino con RL para tareas de agente web (web-browsing agent), un área de investigación activa en 2026, y en que su protocolo de evaluación exige el sistema orquestador-trabajador correspondiente, lo que lo hace útil para estudiar la sinergia entre modelos base y pipelines de agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-8B, decoder-only) |
| Parametros totales | 8 mil millones (estimado por base Qwen3-8B; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base Qwen3-8B soporta hasta 128K, pero no se especifica en este checkpoint) |
| Tipos de cuantizacion | no disponible (repo de 16.4 GB, probablemente pesos en bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (inferido por libreria transformers y tamano; no confirmado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only con atención causal y un tokenizador multilingüe. La fase de entrenamiento aplica aprendizaje por refuerzo sobre un protocolo de orquestador-trabajador (orchestrator-worker) específico de BrowseComp: un agente orquestador planifica la búsqueda y delega tareas a un trabajador que navega por la web, inspecciona fuentes y recopila evidencias. El checkpoint archivado proviene de una continuación de RL iniciada desde el worker del iter149 del "fixed-orchestrator", con la revisión `iter59` como punto estable.

No se publican detalles sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se usó RLHF, DPO u otra variante de RL. La model card solo menciona que es un "representative checkpoint" de una ejecución de continuación, sin especificar hiperparámetros, política de recompensa ni infraestructura. La evaluación requiere el protocolo BrowseComp completo, lo que implica que el modelo no es autónomo: necesita el sistema orquestador-trabajador que lo acompaña.

## Capacidades

- Generación de texto: como modelo base Qwen3-8B, genera texto coherente y multilingüe, aunque no se documenta su calidad tras el ajuste con RL.
- Razonamiento y planificación: el ajuste con RL está orientado a la planificación de búsquedas web y la coordinación de un trabajador, por lo que puede mejorar la capacidad de razonamiento multi-paso en tareas de investigación.
- Búsqueda de información: diseñado específicamente para el benchmark BrowseComp, que exige buscar, inspeccionar fuentes y responder preguntas de investigación.
- Tool calling: no se especifica explícitamente, pero el protocolo orquestador-trabajador implica una forma de interacción con herramientas (navegación web) que el modelo debe coordinar.
- Soporte de agentes: sí, en el contexto del protocolo BrowseComp; sin el protocolo, no se garantiza su funcionamiento como agente autónomo.
- Capacidades multilingües: no disponibles; el base Qwen3-8B soporta varios idiomas, pero no se documenta el comportamiento tras el RL.
- Capacidades especiales: ninguna adicional documentada (sin visión, audio o modo de pensamiento explícito).

## Casos de uso

- Investigación de mercado automatizada: el modelo puede coordinar un trabajador que navega por sitios web de proveedores, extrae precios y características, y devuelve una respuesta resumida, gracias a su entrenamiento en tareas de búsqueda multi-paso con evidencia.
- Recopilación de evidencias para análisis de competencia: un pipeline que usa el modelo como orquestador para buscar menciones de una empresa en prensa, inspeccionar artículos y extraer citas textuales, reduciendo el trabajo manual de analistas.
- Soporte de atención al cliente con investigación: en un sistema de soporte, el modelo puede buscar en la documentación oficial, foros y FAQs, y redactar respuestas con referencias verificadas, aunque requeriría el protocolo de agente completo.
- Generación de informes de investigación de mercado: el modelo puede planificar búsquedas de datos estadísticos, comparar fuentes y sintetizar un informe con números concretos, útil para consultoras que necesitan informes rápidos.
- Prototipado de agentes de navegación: para investigadores que quieren experimentar con RL sobre Qwen3-8B en tareas de navegación, este checkpoint sirve como punto de partida para replicar y estudiar la sinergia entre orquestador y trabajador.
- Evaluación de pipelines de RL para agentes: el modelo permite reproducir los resultados de la continuación del entrenamiento y comparar el efecto de la fase de RL frente al checkpoint inicial, útil para estudiar la estabilidad del entrenamiento.

## Benchmarks y rendimiento

La model card reporta el siguiente resultado en BrowseComp (el benchmark de navegación web):

| Benchmark | Puntuacion | Notas |
|---|---|---|
| BrowseComp (5 ejecuciones, revision iter59) | 461/750 (0.6147) | Punto de partida: 894/1500 (0.5960) en el fixed-orchestrator iter149 |

No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor advierte que la diferencia entre el checkpoint y su punto de partida no debe considerarse una mejora significativa estadísticamente. Los leaderboards externos de BrowseComp (BenchLM.ai, llm-stats.com, Steel.dev) muestran puntuaciones de otros modelos (p. ej., Kimi K3 con 0.912), pero no se proporcionan datos de modelos comparables en la misma configuración, por lo que no se puede realizar una comparación rigurosa.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B en precisión bf16/fp16 (repo de 16.4 GB), se necesita aproximadamente 16-20 GB de VRAM para inferencia sin cuantización. Con cuantización (p. ej., GGUF de 4 bits) se puede reducir a unos 6-8 GB.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o RTX 4080 (16 GB) es suficiente para inferencia en bf16; para despliegue con mayor throughput, una A100 (40 GB) o H100 (80 GB) es adecuada. No se requiere hardware especializado para 8B.
- Compatibilidad con consumer GPU: sí, el modelo cabe en GPUs consumer de 16 GB o más; con cuantización puede ejecutarse en GPUs de 8 GB.
- Opciones de despliegue: al ser un modelo transformers, se puede servir con vLLM, TGI (Text Generation Inference), o cargar directamente con transformers en Python; también es posible convertirlo a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporciona un archivo GGUF en el repo.
- Latencia y throughput estimados: no disponible. El modelo es de 8B, por lo que en una RTX 4090 se puede esperar un throughput de decenas de tokens por segundo, pero depende del protocolo de orquestación y de la infraestructura de navegación.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la misma configuración (misma base, mismo protocolo BrowseComp) con puntuaciones detalladas en la información proporcionada. Se conocen otros checkpoints del mismo autor en el ecosistema:

| Modelo | Base | Puntuacion BrowseComp | Notas |
|---|---|---|---|
| Shangy/browsecomp-fixed-orch-continuation-rl (este) | Qwen3-8B | 0.6147 | Checkpoint de continuacion RL, archivado |
| Shangy/browsecomp-fixed-orch-qwen3-8b-h200 | Qwen3-8B | no disponible | Checkpoint relacionado del mismo autor |
| Shangy/browsecomp-orch-sftcore-qwen3-8b-h200 | Qwen3-8B | no disponible | Checkpoint con SFT core del mismo autor |

Los leaderboards de BrowseComp (BenchLM.ai, llm-stats.com, Steel.dev) listan modelos líderes como Kimi K3 (0.912) o GPT-5.6 Sol (0.922), pero no se proporcionan detalles de configuración (modelo con herramientas, agente completo, etc.) que permitan una comparación justa con este checkpoint, que es un modelo base ajustado para el protocolo orquestador-trabajador.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo basado en Qwen3, puede heredar sesgos del entrenamiento del base, pero no se ha evaluado específicamente.
- Riesgo de alucinación: no se ha evaluado; la tarea de BrowseComp exige verificar fuentes, pero el modelo puede generar respuestas incorrectas si el trabajador no encuentra evidencias.
- Limitaciones de contexto y idioma: la longitud de contexto y los idiomas soportados no se documentan en la model card; se recomienda asumir las del base Qwen3-8B (128K y multilingüe) con cautela.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la evaluación del modelo requiere el protocolo BrowseComp, que puede no estar disponible públicamente o tener restricciones.
- Caveat de producción: el autor no recomienda usar este checkpoint en producción sin el sistema de orquestador-trabajador completo; es un artefacto de investigación para replicación y análisis, no un modelo listo para uso directo.
- Significancia estadística: el autor advierte explícitamente que la diferencia de rendimiento con el punto de partida no debe tratarse como una mejora significativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shangy/browsecomp-fixed-orch-continuation-rl
- Checkpoint relacionado (fixed-orch-qwen3-8b-h200): https://huggingface.co/Shangy/browsecomp-fixed-orch-qwen3-8b-h200
- Checkpoint relacionado (orch-sftcore-qwen3-8b-h200): https://huggingface.co/Shangy/browsecomp-orch-sftcore-qwen3-8b-h200
- Leaderboard BrowseComp (BenchLM.ai): https://benchlm.ai/benchmarks/browsecomp
- Leaderboard BrowseComp (llm-stats.com): https://llm-stats.com/benchmarks/browsecomp
- Leaderboard BrowseComp (Steel.dev): https://leaderboard.steel.dev/leaderboards/browsecomp/
