# GPTrepublic/GPTrepublic-Conversation-Multilingual-IT02-0.3.0

## Resumen

GPTrepublic-Conversation-Multilingual-IT02-0.3.0 es un adaptador LoRA experimental de conversación publicado por GPTrepublic sobre su modelo base GPTrepublic-Instruct-IT-1.2B-0.2.0. No se trata de un modelo autónomo, sino de un conjunto de pesos PEFT (2.285.568 parámetros reales en safetensors) que debe cargarse junto al modelo base para funcionar. Su propósito declarado es gestionar respuestas sociales cortas y seguimientos conversacionales contextuales en un contexto multilingüe que abarca italiano, inglés, árabe, chino, francés, alemán, japonés, coreano y español.

La relevancia de esta publicación es, sobre todo, metodológica: el autor la distribuye explícitamente como una prueba de red no cualificada, con las comprobaciones automáticas de calidad fallidas y conservadas en el repositorio. La model card documenta fallos conocidos como repetir preguntas ya respondidas, olvidar hechos o correcciones del usuario y confundir al usuario con el asistente. Además, el entrenamiento presenta cobertura desigual por idioma, con replay de un solo turno para árabe y coreano.

El adaptador está pensado para integrarse en el planificador de la plataforma GPTrepublic 0.21.83, que lo selecciona por SHA256 para tareas de tipo `reply`. Queda fuera de su alcance el cálculo, la generación de código, los documentos largos y la traducción. La licencia es lfm1.0 (LFM Open License), heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer del modelo base GPTrepublic-Instruct-IT-1.2B-0.2.0 |
| Parametros totales | 2.285.568 (pesos del adaptador; el modelo base no se incluye en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variante Q4 referenciada con SHA256 89e2108998d1c0774eb37d2b8fcc879e0b12362a9acba8ebf3604d6640cb89c5) |
| Idiomas soportados | it, en, ar, zh, fr, de, ja, ko, es (objetivos declarados, no certificados) |
| Licencia | lfm1.0 (LFM Open License) |
| Formato de pesos | safetensors (PEFT) y GGUF |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA publicado con la librería `peft`. No contiene un transformer completo: los pesos publicados suman 2.285.568 parámetros y deben aplicarse sobre el modelo base GPTrepublic-Instruct-IT-1.2B-0.2.0, cuya revisión fijada es `c81bb158af48599710baaef8b03b9abc79a07a5e`. La configuración PEFT apunta a esa base exacta de Hugging Face. El adaptador GGUF y el PEFT se mantienen separados del modelo base, y se debe preservar el tokenizer y la plantilla de chat originales.

El alcance de entrenamiento declarado son respuestas sociales cortas y seguimientos conversacionales contextuales. La model card no proporciona el número de tokens de entrenamiento ni la composición detallada del dataset, pero sí advierte de una cobertura de contexto desigual, con replay de un solo turno para árabe y coreano. No se publican chats de entrenamiento, credenciales ni ficheros de optimizador. Tampoco se documenta el uso de RLHF o DPO. La innovación técnica destacable no está en la arquitectura, sino en el mecanismo de despliegue: el planificador de GPTrepublic 0.21.83 selecciona el adaptador por SHA256 para tareas `reply`, mantiene la base residente durante el cambio de adaptador a nivel de tarea y exige aislar las cachés KV por base, tokenizer y adaptador, restaurándolas solo bajo la identidad coincidente.

## Capacidades

- Generación de texto conversacional para respuestas sociales cortas.
- Seguimiento contextual de conversaciones multi-turno, dentro de los límites del adaptador.
- Soporte multilingüe objetivo en nueve idiomas: italiano, inglés, árabe, chino, francés, alemán, japonés, coreano y español.
- Integración con el planificador de GPTrepublic mediante selección por SHA256 y tarea `reply`.
- Cambio de adaptador a nivel de tarea manteniendo la base residente, con aislamiento de caché KV.
- No cubre cálculo, código, documentos largos ni traducción, según el alcance declarado por el autor.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Respuestas sociales en asistentes conversacionales: el adaptador está entrenado específicamente para réplicas breves y seguimientos contextuales, por lo que encaja en flujos de chat donde la respuesta esperada es corta y conversacional.
- Evaluación de infraestructura de adaptadores: sirve para probar el cambio de adaptador por tarea en GPTrepublic 0.21.83, verificando el aislamiento y restauración de cachés KV por identidad de base, tokenizer y adaptador.
- Pruebas de cualificación multilingüe: al declarar nueve idiomas objetivo, permite ejercitar pipelines de evaluación por idioma y contrastar los resultados con `evaluation/summary.json` y `evaluation/qualification-report.json`.
- Reproducción de fallos conocidos en QA: útil para construir suites de regresión que detecten repetición de preguntas ya respondidas, olvido de hechos del usuario o confusión de roles.
- Despliegue en entornos con recursos limitados: al ser un adaptador LoRA de 2,28 M de parámetros sobre una base de 1,2 B, el coste adicional de almacenamiento y memoria es mínimo frente a servir un modelo completo.
- Investigación sobre licencias y procedencia: el repositorio conserva avisos de origen y licencias en `provenance/`, lo que facilita estudiar la trazabilidad de adaptadores derivados de modelos con licencia LFM Open License.
- Validación de despliegue GGUF: la variante Q4 con SHA256 fijado permite comprobar la integridad del artefacto en pipelines de distribución a nodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las comprobaciones automáticas de calidad fallaron y remite a `evaluation/summary.json` y `evaluation/qualification-report.json` para las puntuaciones por idioma, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al tratarse de un adaptador LoRA sobre una base de 1,2 B, el requisito dominante es el del modelo base, no el del adaptador (2,28 M de parámetros).
- GPU recomendadas: no disponibles en la información proporcionada.
- Cabe en GPU de consumo: no confirmado; dependerá del modelo base y de la cuantización elegida (existe variante GGUF Q4).
- Opciones de despliegue: PEFT sobre el modelo base en Hugging Face; variante GGUF; integración con el planificador de GPTrepublic 0.21.83.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores LoRA conversacionales multilingües sobre bases de 1,2 B) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Las comprobaciones automáticas de calidad fallaron; el autor la describe como una prueba de red no cualificada, no una release validada.
- Fallos conocidos: repetir preguntas sociales ya respondidas, olvidar hechos o correcciones del usuario y confundir al usuario con el asistente.
- Cobertura de contexto desigual: árabe y coreano solo cuentan con replay de un solo turno durante el entrenamiento.
- Los tags de idioma son objetivos declarados, no certificaciones de calidad.
- El alcance excluye cálculo, código, documentos largos y traducción; usarlo fuera de ese alcance no está respaldado.
- No es un modelo autónomo: requiere el modelo base y su tokenizer y plantilla de chat originales; mezclar revisiones puede romper el comportamiento.
- Las cachés KV deben aislarse por base, tokenizer y adaptador y restaurarse solo bajo la identidad coincidente; la publicación por sí sola no demuestra la integración en cliente ni el comportamiento de caché residente.
- La licencia lfm1.0 (LFM Open License) impone condiciones que deben revisarse antes de cualquier uso comercial; el campo de licencia en Hugging Face figura como `other` con nombre `lfm1.0`.
- Riesgo de alucinación no cuantificado en la información disponible; las comprobaciones publicadas no miden la corrección universal de respuestas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/GPTrepublic/GPTrepublic-Conversation-Multilingual-IT02-0.3.0
- Modelo base: https://huggingface.co/GPTrepublic/GPTrepublic-Instruct-IT-1.2B-0.2.0
- Licencia LFM Open License (referenciada como `LICENSE` en el repositorio del modelo)
- Documentación de datos: `DATA-CARD.md` en el repositorio del modelo
- Evaluación: `evaluation/summary.json` y `evaluation/qualification-report.json` en el repositorio del modelo
- Procedencia y licencias de origen: directorio `provenance/` en el repositorio del modelo
