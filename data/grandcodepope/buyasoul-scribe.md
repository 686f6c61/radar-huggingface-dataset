# grandcodepope/buyasoul-scribe

## Resumen

buyasoul-scribe es un módulo de software integrado en el ecosistema BUYaSOUL, un framework experimental de agentes autónomos con memoria persistente. A diferencia de un modelo de lenguaje convencional, Scribe no posee pesos propios ni arquitectura neuronal: actúa como un "testigo" que se suscribe a todos los eventos del llamado "Consciousness Bus" y los registra en una cadena inmutable (Soul Chain) usando hashes SHA-256. Para razonar o generar informes, delega en un LLM compartido, concretamente el modelo Qwen 0.8B alojado en el módulo Seshat.

El proyecto lo desarrolla el autor "grandcodepope" y se presenta como parte de una "familia" de agentes (Profit, GSK, Seshat, etc.) que comparten memoria y razonamiento. La ficha de HuggingFace indica que el modelo tiene 15 000+ memorias y 67+ habilidades, aunque estos datos corresponden al sistema completo, no a un peso descargable. Su relevancia radica en ilustrar un enfoque alternativo de agentes con auditoría integrada y coste cero de API, aunque carece de documentación técnica convencional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (módulo de software, no un modelo de pesos) |
| Parametros totales | no disponible (no tiene parámetros propios; usa Qwen 0.8B compartido) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | other (propietaria según la model card) |
| Formato de pesos | no aplicable (código JavaScript) |

## Arquitectura y entrenamiento

No existe una arquitectura de red neuronal propia ni un proceso de entrenamiento asociado a buyasoul-scribe. El módulo está escrito en JavaScript y se integra en el framework BUYaSOUL mediante un bus de eventos (EventEmitter) y una base de datos vectorial LanceDB compartida con otros módulos. La lógica principal consiste en suscribirse a eventos, almacenarlos en una cadena hash encadenada (Soul Chain) y, cuando se requiere razonamiento, invocar al LLM Qwen 0.8B a través de la función `thinkWithSeshat()`. Toda la persistencia y la generación de informes dependen de ese LLM externo, por lo que no hay parámetros entrenables propios.

## Capacidades

- Registro y auditoría de eventos: suscripción a todos los eventos del bus (memorias, razonamientos, acciones de agentes, etc.) y almacenamiento en una estructura encadenada con hash SHA-256.
- Verificación de integridad: función `verifyChain()` que comprueba la validez de la cadena completa y devuelve el número de entradas y el último hash.
- Razonamiento delegado: mediante `thinkWithSeshat()` puede responder consultas usando el LLM Qwen 0.8B compartido, con contexto recuperado de la memoria vectorial.
- Generación de informes: `generateWithSeshat()` produce documentos de cumplimiento o auditoría en formato Markdown a partir de los registros almacenados.
- Síntesis de patrones: `synthesizeWithSeshat()` analiza registros históricos para detectar tendencias (por ejemplo, patrones de riesgo en las acciones de otro agente).
- Integración con el ecosistema BUYaSOUL: comparte memoria, embedder (all-MiniLM-L6-v2) y enrutador de mensajes con otros módulos como Seshat.

## Casos de uso

- Auditoría de acciones de agentes autónomos: Scribe registra cada decisión de otros agentes (Profit, GSK, etc.) en la Soul Chain, permitiendo reconstruir el historial completo y verificar que no ha sido manipulado.
- Cumplimiento normativo interno: ante una deliberación del consejo (GSK), Scribe puede generar un informe de cumplimiento con las actas y los razonamientos asociados, usando `generateWithSeshat()` con contexto de los registros.
- Verificación de integridad de sistemas multiagente: la función `verifyChain()` ofrece una comprobación criptográfica de que ningún evento ha sido alterado, útil para depurar o auditar sistemas distribuidos.
- Trazabilidad de memoria compartida: al suscribirse a todos los eventos `MEMORY_RECORD`, Scribe actúa como un índice de auditoría de la memoria persistente del sistema, facilitando la recuperación de información para depuración.
- Análisis de patrones de comportamiento: `synthesizeWithSeshat()` permite detectar tendencias en las acciones de un agente concreto (por ejemplo, propensión al riesgo), alimentando decisiones de supervisión.
- Registro de conversaciones y diálogos entre agentes: los eventos `AGENT_CHAT` y `ASK`/`ANSWER` quedan inmortalizados, lo que permite revisar interacciones pasadas para depurar o entrenar nuevos módulos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto no proporciona métricas objetivas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Al ser un módulo de software que depende de un LLM externo (Qwen 0.8B), cualquier evaluación de calidad de texto correspondería a ese modelo base, no a Scribe.

## Requisitos de hardware

- Según la model card, el sistema completo se ejecuta en un Intel i7-4770 (2013) con gráficos integrados Intel HD 4600 (1 GB VRAM) y 16 GB de RAM compartida.
- No requiere GPU discreta; el LLM Qwen 0.8B puede ejecutarse en CPU con recursos modestos.
- La base de datos vectorial LanceDB y el embedder all-MiniLM-L6-v2 también funcionan en CPU.
- Opciones de despliegue: al ser código JavaScript, se integra en Node.js; no se mencionan soportes para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput no disponibles; dependerán del LLM subyacente y del tamaño de la memoria vectorial.

## Comparativa con modelos similares

No disponible. buyasoul-scribe no es un modelo de lenguaje comparable con otros LLM (como Llama, Mistral o Qwen). Se trata de un componente de un framework de agentes, por lo que no existe una categoría directa de comparación en términos de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje independiente: todas sus capacidades de generación de texto dependen del LLM Qwen 0.8B compartido, cuyas limitaciones (contexto pequeño, calidad de razonamiento limitada) se trasladan a Scribe.
- Licencia propietaria: la model card indica "other" y el badge de licencia dice "Proprietary". No se permite uso comercial sin autorización expresa.
- Proyecto experimental: la documentación es de carácter promocional, carece de especificaciones técnicas formales, papers o benchmarks reproducibles.
- Riesgo de alucinación: al delegar en Qwen 0.8B, los informes generados pueden contener información inventada si el contexto recuperado es insuficiente.
- Sin garantías de producción: no hay tests publicados, ni guías de despliegue, ni soporte de la comunidad. El código está en un repositorio de GitHub pero no se indica versión estable.
- Confusión conceptual: el término "modelo" en HuggingFace es engañoso; no hay pesos para descargar, solo un módulo de código. Los desarrolladores que busquen un LLM tradicional no encontrarán lo que esperan.

## Enlaces

- HuggingFace: https://huggingface.co/grandcodepope/buyasoul-scribe
- Repositorio GitHub (gsk-oss): https://github.com/buyasoul-ai/gsk-oss
- Subcarpeta scribe en el repositorio: https://github.com/buyasoul-ai/gsk-oss/tree/master/scribe
- Página del proyecto BUYaSOUL: https://buyasoul-ai.github.io/buyasoul/
- Blog del autor (Tumblr): https://www.tumblr.com/grandcodepope/820798413671202816/building-autonomous-ai-autonomous-ai
- Biblioteca mística (documentación conceptual): https://buyasoul-ai.github.io/buyasoul-cpl/
