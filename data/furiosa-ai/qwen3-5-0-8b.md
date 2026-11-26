# furiosa-ai/Qwen3.5-0.8B

## Resumen

Qwen3.5-0.8B es un modelo denso de visión-lenguaje de 0,8 mil millones de parámetros (873.438.784 exactamente, según los pesos en safetensors) desarrollado originalmente por el equipo Qwen y republicado por furiosa-ai junto con un Furiosa Executable Bundle (FXB) para ejecutarse sobre aceleradores FuriosaAI RNGD mediante la librería Furiosa-LLM. La arquitectura Qwen3.5 combina un codificador visual con un decodificador que mezcla atención lineal Gated DeltaNet y atención completa, lo que permite procesar entradas multimodales (imagen y texto) y generar respuestas de texto.

El modelo resuelve tareas de comprensión visual, razonamiento y llamada a herramientas (tool calling) en un tamaño muy reducido, lo que lo hace adecuado para despliegues con requisitos de memoria ajustados. Su relevancia actual radica en que ofrece capacidades multimodales y de razonamiento en un rango de parámetros que cabe en hardware modesto, y en que furiosa-ai proporciona una ruta de despliegue optimizada para su acelerador RNGD además de la compatibilidad con frameworks estándar como vLLM, SGLang y Transformers.

La licencia es Apache 2.0, heredada del checkpoint upstream, lo que facilita el uso comercial. El modo de razonamiento (thinking) está desactivado por defecto y se puede activar por petición. El repositorio ocupa 3,3 GB y los pesos se distribuyen en formato safetensors, sin cuantización (BF16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 densa (`Qwen3_5ForConditionalGeneration`), codificador visual + decodificador con Gated DeltaNet (atención lineal) y atención completa |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | sin cuantizacion; pesos y activaciones en BF16, KV cache en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye FXB para FuriosaAI RNGD) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen3.5 en variante densa, implementada como `Qwen3_5ForConditionalGeneration`. El decodificador combina dos mecanismos de atención: Gated DeltaNet, una forma de atención lineal, y atención completa. Esta hibridación busca reducir el coste computacional y de memoria del contexto largo manteniendo la calidad de la atención completa en los puntos donde es necesaria. El modelo incorpora además un codificador visual que permite aceptar imágenes junto al texto, con una interfaz multimodal al estilo OpenAI (`image_url` dentro de los mensajes de chat).

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la información proporcionada. La model card de furiosa-ai remite al checkpoint upstream de Qwen para esos detalles. La innovación técnica destacable en esta publicación es el empaquetado como Furiosa Executable Bundle (FXB) para ejecución sobre RNGD, con una estrategia de paralelismo tensorial de 4 PEs (la mitad de una tarjeta RNGD, que tiene 8 PEs por tarjeta).

## Capacidades

- Comprensión visual: acepta imágenes mediante URLs remotas, URLs base64 en línea o rutas locales `file://` (estas últimas requieren el flag `--allowed-local-media-path`) y responde en texto.
- Generación de texto y conversación multi-turno con formato de chat compatible con la API de OpenAI.
- Razonamiento opcional: el modo thinking está desactivado por defecto y se activa por petición con `enable_thinking`; el razonamiento se separa de la respuesta final mediante el parser `qwen3`.
- Tool calling / function calling: soportado mediante el parser `qwen3_coder` (alias `qwen3_xml`), con formato XML de llamadas a herramientas.
- Capacidades multilingües: no disponible en la información proporcionada.
- Integración con agentes: la combinación de tool calling y razonamiento separado facilita su uso en flujos multi-paso.
- No se mencionan capacidades de audio en la información disponible.

## Casos de uso

- Descripción y análisis de imágenes en producción: el modelo acepta imágenes por URL, base64 o ruta local y devuelve descripciones en texto, adecuado para pipelines de etiquetado automático o moderación de contenido visual.
- Asistentes conversacionales multimodales: al soportar mensajes de chat con partes de imagen y texto, puede gestionar conversaciones donde el usuario adjunta capturas o fotos y formula preguntas de seguimiento.
- Agentes con llamada a herramientas: con el parser `qwen3_coder` y `--enable-auto-tool-choice`, puede integrarse en agentes que consultan APIs externas, bases de datos o servicios internos mediante function calling.
- Razonamiento bajo demanda en entornos con restricciones de latencia: al estar el thinking desactivado por defecto, las respuestas rápidas no pagan el coste de razonamiento; se activa solo en consultas que lo requieren.
- Despliegue en aceleradores FuriosaAI RNGD: el FXB permite servir el modelo con Furiosa-LLM ocupando media tarjeta RNGD (4 PEs), lo que facilita alta densidad de réplicas por tarjeta.
- Prototipado y evaluación de modelos multimodales pequeños: su tamaño de 0,8B y licencia Apache 2.0 permiten experimentar en local o en clústeres modestos sin grandes inversiones de hardware.
- Extracción de información estructurada a partir de documentos con imágenes: combinando visión y tool calling, puede convertir contenido visual en llamadas a funciones con campos estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 873 millones de parámetros en BF16, los pesos ocupan aproximadamente 1,75 GB; sumando el codificador visual y el KV cache en 16 bits, el consumo total es moderado, aunque no se proporcionan cifras oficiales.
- GPU recomendadas: no se especifican en la información disponible; el modelo está empaquetado para FuriosaAI RNGD (4 PEs, media tarjeta por réplica).
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; por tamaño, un modelo de 0,8B en BF16 es plausible en GPUs de consumo con suficiente memoria, pero no hay datos oficiales.
- Opciones de despliegue: Furiosa-LLM (ruta principal de esta publicación), y según la model card también vLLM, SGLang y Transformers mediante el checkpoint upstream.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (furiosa-ai) | 873 M | no disponible | imagen + texto | Apache 2.0 | Hugging Face, Furiosa-LLM |
| Qwen/Qwen3.5-0.8B (upstream) | 873 M | no disponible | imagen + texto | Apache 2.0 | Hugging Face |
| Alternativas de ~1B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No se han documentado sesgos conocidos en la información proporcionada; como modelo entrenado con datos web, es previsible que herede sesgos de esos datos, pero no hay evidencia específica disponible.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado tasas de alucinación.
- Longitud de contexto e idiomas soportados no disponibles, lo que impide garantizar su comportamiento en contextos largos o en idiomas distintos del inglés.
- La cuantización no está soportada en esta publicación: pesos y activaciones en BF16 y KV cache en 16 bits, lo que limita la reducción de memoria frente a versiones cuantizadas.
- El despliegue optimizado está atado a FuriosaAI RNGD y Furiosa-LLM; para otros frameworks hay que remitirse al checkpoint upstream.
- El campo `reasoning` en las respuestas no forma parte de la especificación de la API de OpenAI; su acceso cuando no hay contenido de razonamiento lanza `AttributeError`.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del checkpoint upstream de Qwen para obligaciones adicionales.
- El tamaño reducido (0,8B) implica menor capacidad de razonamiento y conocimiento que modelos mayores; no se han publicado comparativas de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/furiosa-ai/Qwen3.5-0.8B
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia upstream: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- FuriosaAI: https://furiosa.ai
