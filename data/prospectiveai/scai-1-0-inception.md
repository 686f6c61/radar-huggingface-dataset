# ProspectiveAI/SCAI-1.0-Inception

## Resumen

SCAI 1.0 Inception es el primer modelo de la familia SCAI (Cognitive Intelligence) desarrollado por Prospective (@ProspectiveAi). Se presenta como un modelo fundacional orientado a razonamiento profundo, diálogo natural y procesamiento de contexto con preservación de privacidad, y está pensado para operar como asistente cognitivo privado dentro de entornos de comunicación segura, en particular el mensajero SChat (descrito por el autor como enrutado por Tor y con cifrado extremo a extremo).

La información publicada por el autor es muy limitada: no se detalla el número de parámetros, la longitud de contexto, el esquema de cuantización ni los datos de entrenamiento. La model card califica la arquitectura como "propietaria" y "optimizada para entornos confidenciales y de bajos metadatos", sin especificar si se trata de un transformer denso, un MoE o una arquitectura híbrida. Tampoco se publican resultados de benchmarks.

Su relevancia actual es acotada pero identificable: cubre el nicho de modelos conversacionales con enfoque explícito en privacidad, multilingüismo limitado (inglés y ruso) y licencia propietaria. Para desarrolladores e investigadores, la ficha sirve sobre todo para documentar qué se sabe y qué no de un modelo cerrado con distribución en Hugging Face pero sin pesos abiertos confirmados ni documentación técnica verificable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (descrita por el autor como "arquitectura neuronal propietaria optimizada para entornos confidenciales y de bajos metadatos") |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) y ruso (ru) |
| Licencia | Propietaria, "scai-license" (All Rights Reserved, © 2026 Prospective) |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El autor no publica detalles sobre la arquitectura interna más allá de calificarla como "propietaria" y orientada a entornos confidenciales y de bajos metadatos. No se especifica si es un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura híbrida con componentes SSM o cualquier otra variante. Tampoco se indica el número de parámetros, la longitud de contexto efectiva ni el esquema de atención.

En cuanto al entrenamiento, la model card no aporta información sobre volumen de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido. Las etiquetas del repositorio mencionan "reasoning", "conversational" y "privacy-preserving", pero no se traducen en especificaciones verificables.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y ruso, según los idiomas declarados.
- Razonamiento estructurado: la model card menciona "deep reasoning" y "structured reasoning", aunque sin detalles sobre el modo de pensamiento o su implementación.
- Procesamiento de contexto con enfoque en privacidad ("privacy-respecting context processing"), sin especificar mecanismos técnicos concretos.
- Integración prevista como asistente cognitivo en el mensajero SChat, lo que sugiere uso en conversaciones privadas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada, aunque las etiquetas de "reasoning" podrían implicarlo.
- Capacidades de visión, audio o multimodalidad: no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistencia conversacional privada en mensajería: el modelo está diseñado para integrarse en SChat, un mensajero descrito como enrutado por Tor y con cifrado extremo a extremo, por lo que su uso natural es responder consultas de usuarios dentro de un canal de comunicación seguro sin exponer el contexto a terceros.
- Soporte multilingüe inglés-ruso en atención al usuario: para organizaciones que operan en ambos idiomas, el modelo puede gestionar diálogos de soporte, siempre que se valide su calidad real, ya que no hay benchmarks publicados.
- Razonamiento asistido en entornos con requisitos de confidencialidad: equipos que necesitan un asistente para estructurar problemas o resumir información sensible podrían desplegarlo on-premise, aunque la licencia propietaria y la falta de pesos verificables condicionan esta opción.
- Prototipado de asistentes cognitivos en productos de mensajería: desarrolladores que construyan sobre el ecosistema SChat o integraciones similares pueden usar el modelo como capa de razonamiento y diálogo.
- Investigación sobre modelos con enfoque de privacidad: como objeto de estudio de un modelo cerrado que declara procesamiento de contexto respetuoso con la privacidad, útil para comparar enfoques de diseño, no para reproducir entrenamientos.
- Filtrado y moderación de conversaciones en ruso e inglés: si el modelo rinde adecuadamente en clasificación y generación controlada, podría emplearse para tareas de moderación en comunidades bilingües, previa evaluación empírica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros y el formato de pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se confirma la publicación de pesos en formatos estándar.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Desarrollador | Parámetros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| SCAI 1.0 Inception | Prospective | No disponible | No disponible | Propietaria (scai-license) | No confirmada |
| Modelos conversacionales abiertos de tamaño medio (p. ej. familias tipo Llama, Mistral o Qwen) | Múltiples | Variable (7B-70B) | Variable (8K-128K) | Abiertas o comunitarias | Sí, safetensors/GGUF |
| Asistentes propietarios vía API (p. ej. GPT, Claude, Gemini) | Varios | No público | No público | Propietaria | No (solo API) |

No se dispone de datos de rendimiento del modelo que permitan una comparación cuantitativa con alternativas. La comparación anterior es estructural (licencia, disponibilidad, transparencia), no de calidad.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: sin parámetros, contexto, arquitectura ni datos de entrenamiento, es imposible evaluar su idoneidad para producción.
- Sin benchmarks publicados: no hay evidencia empírica de calidad en razonamiento, código, matemáticas o diálogo.
- Idiomas limitados a inglés y ruso; no se declara soporte de castellano.
- Licencia propietaria "All Rights Reserved": el uso comercial, la redistribución y la modificación están restringidos según los términos de scai-license, que deben revisarse antes de cualquier integración.
- Riesgo de alucinación: no cuantificado por el autor; como en cualquier modelo generativo, debe asumirse y mitigarse con verificación.
- Sesgos: no documentados; al no publicarse la composición del dataset, no es posible evaluar sesgos lingüísticos o culturales.
- Opacidad sobre el formato de pesos: no se confirma que los pesos estén disponibles para descarga, lo que impide despliegue local verificable.
- Dependencia del ecosistema del autor (SChat, canales de Telegram) para soporte y actualizaciones.
- Fecha de creación del repositorio (2026-11-22) y ausencia de descargas o likes: modelo sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ProspectiveAI/SCAI-1.0-Inception
- Licencia: https://github.com/ProspectiveAi/.github?tab=License-1-ov-file
- Contacto del autor: prospectivealabs@gmail.com
- Canal de actualizaciones: https://t.me (referenciado como @ProspectiveAi en la model card)
