# Chinook416/caracat-ai-karakal-2.0-pro

## Resumen

Caracat AI es un asistente conversacional de propósito general desarrollado por el proyecto Caracat, que se distribuye a través del repositorio `Chinook416/caracat-ai-karakal-2.0-pro`. A diferencia de un modelo de lenguaje convencional, este repositorio no contiene pesos ni parámetros propios: se trata de una capa de personalidad y una interfaz que se superpone al modelo `openai/gpt-oss-20b` de OpenAI. El proyecto no ha realizado fine-tuning, cuantización ni modificaciones de arquitectura; únicamente añade un system prompt editable y una interfaz de uso.

La relevancia de este repositorio radica en su enfoque: demuestra cómo se puede construir un asistente con una identidad y reglas de comportamiento definidas sobre un modelo base existente, sin necesidad de entrenar o ajustar parámetros. El system prompt establece pautas como preguntar en lugar de adivinar, no inventar hechos, responder en el idioma del usuario y ser honesto sobre las limitaciones. Está pensado para uso general: explicar, redactar, planificar, aprender y ayudar a tomar decisiones. El repositorio se complementa con un asistente hermano, Caracat Code, especializado en programación y basado en otro modelo.

La licencia es Apache-2.0, y los idiomas declarados son inglés y alemán. No se publican resultados de benchmarks, y el propio autor advierte que cualquier calidad medible pertenece al modelo base, no a esta capa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (heredada del modelo base `openai/gpt-oss-20b`, sin modificaciones) |
| Parametros totales | No disponible (no hay pesos propios; el modelo base tiene sus propios parámetros) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (no se ha realizado cuantización) |
| Idiomas soportados | en, de |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (no hay pesos en el repositorio) |

## Arquitectura y entrenamiento

Este repositorio no define una arquitectura propia. El modelo base es `gpt-oss-20b` de OpenAI, cuyas especificaciones técnicas (número de parámetros, contexto, arquitectura interna) están documentadas en su propia ficha en Hugging Face. El proyecto Caracat AI no ha realizado ningún tipo de entrenamiento, fine-tuning, cuantización ni cambio de tokenizador. La única aportación es un system prompt almacenado como archivo editable en el repositorio de GitHub (`prompts/caracat_ai_persona.md`), que se carga en tiempo de ejecución para definir el comportamiento del asistente.

El system prompt establece reglas como: preguntar una pregunta enfocada cuando una respuesta depende de información desconocida, nunca inventar hechos, fuentes, citas, números o títulos, responder en el idioma en que se escribe, señalar problemas en un plan de forma directa y ser honesto sobre los límites (por ejemplo, en temas médicos, legales o financieros, o cuando se requiere información actual). No hay datos de entrenamiento porque no se ha entrenado nada.

## Capacidades

- Asistencia general en tareas de pensamiento, escritura, planificación, aprendizaje y toma de decisiones.
- Conversación multi-turno con un tono definido por el system prompt, que prioriza la honestidad y la claridad.
- Capacidad de preguntar al usuario cuando falta información relevante, en lugar de inventar respuestas.
- Soporte multilingüe limitado a inglés y alemán, según la declaración del repositorio.
- No incluye capacidades de visión, audio, tool calling ni agentes; estas dependen del modelo base y no se declaran en este repositorio.
- No tiene acceso a información actual ni capacidad de navegación web; el system prompt lo indica explícitamente.

## Casos de uso

- Asistente personal para redactar textos: el usuario puede pedir borradores de correos, artículos o documentos, y el asistente seguirá las reglas de no inventar datos y preguntar cuando sea necesario.
- Planificación de proyectos: ayuda a estructurar tareas, identificar problemas en un plan y sugerir alternativas, siempre con un enfoque honesto sobre las limitaciones.
- Apoyo al aprendizaje: explica conceptos, responde dudas y guía al usuario en la comprensión de temas generales, sin sustituir a un profesional en áreas críticas.
- Toma de decisiones: el asistente puede ayudar a sopesar opciones y consecuencias, pero preguntará por detalles desconocidos en lugar de asumir.
- Uso en entornos donde se requiere una capa de personalidad sobre un modelo base sin entrenamiento adicional: por ejemplo, para prototipar asistentes con una identidad definida.
- Integración en aplicaciones de chat o interfaces conversacionales que necesiten un comportamiento consistente y reglas claras de interacción, aprovechando el system prompt como plantilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se publicarán hasta que exista una ejecución reproducible que registre la versión del modelo, la versión del modelo base, la cuantización, el hardware, las versiones de software, el conjunto de prueba, los parámetros de generación y la longitud de contexto. Tampoco se afirma que Caracat AI rinda mejor que ningún otro modelo; cualquier calidad medible pertenece al modelo base.

## Requisitos de hardware

No aplica directamente, ya que este repositorio no contiene pesos. Para ejecutar el modelo base `gpt-oss-20b` se necesitarían los recursos que dicho modelo requiera, pero no se especifican en esta ficha. El proyecto ofrece un sitio público donde se puede usar el asistente sin necesidad de desplegar infraestructura propia. No se dispone de datos sobre VRAM, GPUs recomendadas, latencia o throughput.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo independiente, sino una capa de personalidad sobre `gpt-oss-20b`. No tiene sentido compararlo directamente con otros modelos, ya que no aporta parámetros ni rendimiento propio. La comparación debería hacerse entre el modelo base y sus alternativas, pero esa información no se proporciona aquí.

## Limitaciones y advertencias

- El repositorio no contiene pesos; cualquier uso requiere obtener el modelo base `openai/gpt-oss-20b` por separado.
- El modelo base puede producir respuestas incorrectas con apariencia de confianza; el system prompt mitiga este riesgo pidiendo que se indique incertidumbre, pero no lo elimina.
- No tiene acceso a información actual ni capacidad de búsqueda en línea; no es fiable para datos que cambian con el tiempo.
- No conoce la situación personal del usuario más allá de lo que este le comunique.
- La calidad de las respuestas varía según la pregunta, el idioma y el tema.
- La licencia Apache-2.0 cubre el contenido de este repositorio, pero el modelo base está sujeto a la licencia de OpenAI; el uso comercial debe cumplir con Apache-2.0, licencias de terceros, términos específicos del modelo, términos de la plataforma y la legislación aplicable. No se ofrece una garantía general de uso comercial.
- No se debe utilizar para decisiones críticas de seguridad sin revisión humana, ni como sustituto de un médico, abogado o asesor financiero.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Chinook416/caracat-ai-karakal-2.0-pro
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Repositorio de desarrollo en GitHub: https://github.com/Pheonix-Studio-cat/training-and-devoloping-caracat-code
