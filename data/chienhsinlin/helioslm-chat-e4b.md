# chienhsinlin/helioslm-chat-e4b

## Resumen

HeliosLM Chat E4B (羲和) es un modelo conversacional desarrollado por el usuario chienhsinlin a partir de Google Gemma 4 E4B-it. El autor realizó un preentrenamiento continuado sobre el modelo base con datos públicos en chino tradicional (Taiwán), inglés y otros idiomas, y posteriormente reincorporó esa diferencia al modelo instructivo original mediante la técnica de *chat vector*, sin una fase adicional de SFT (supervised fine-tuning). El resultado es un modelo que conserva las capacidades del Gemma 4 E4B-it original pero incorpora terminología y convenciones propias de Taiwán, además de un system prompt integrado en la plantilla de chat.

El modelo cuenta con aproximadamente 8.000 millones de parámetros totales (7.996.156.490 según los pesos en safetensors) y hereda la arquitectura Gemma 4 E4B. Está orientado a generación de texto y conversación, con soporte declarado de chino (tradicional) e inglés, y dispone de un modo de razonamiento activable mediante el parámetro `enable_thinking=True` de la plantilla de chat.

Su relevancia radica en dos aspectos: por un lado, demuestra una técnica de adaptación lingüística de bajo coste (chat vector) que evita un SFT completo; por otro, incorpora reglas de neutralidad y identidad en la plantilla, con métricas autoinformadas sobre comportamiento en temas políticos sensibles. Es un modelo de nicho, con 675 descargas en el momento de la consulta, y su licencia es la Gemma Terms of Use.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B) |
| Parametros totales | 7.996.156.490 (~8,0B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor recomienda bf16) |
| Idiomas soportados | zh (chino tradicional, Taiwán), en |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Google Gemma 4 E4B-it, un transformer instructivo de aproximadamente 8.000 millones de parámetros. El autor aplicó un preentrenamiento continuado sobre el modelo base Gemma 4 E4B con datos públicos en chino tradicional de Taiwán, inglés y otros idiomas, y después calculó la diferencia entre ese modelo continuado y el Gemma 4 E4B-it original, sumándola como *chat vector* al modelo instructivo. No se realizó una fase adicional de SFT, según declara la model card.

La innovación principal es, por tanto, metodológica: la adaptación lingüística y de estilo se consigue mediante un vector de diferencia en lugar de un ajuste supervisado completo, lo que reduce coste y preserva las capacidades del modelo base. Además, la plantilla de chat incluye un system prompt integrado de HeliosLM (presentación, terminología de Taiwán y reglas de neutralidad ante temas controvertidos), al que se añade el system prompt del usuario si lo hay. Desde el 9 de noviembre de 2026, la plantilla selecciona el system prompt según el idioma de la consulta: si contiene caracteres chinos aplica el prompt completo en chino; en otros idiomas aplica una identidad breve en inglés, porque el prompt largo en chino reducía las puntuaciones en otras lenguas. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de texto y conversación multi-turno en chino tradicional (Taiwán) e inglés.
- Razonamiento con modo *thinking* activable mediante `enable_thinking=True` en la plantilla de chat.
- Razonamiento matemático y resolución de problemas (evaluado en GSM8K, AIME 2026 y HMMT Feb 2026).
- Generación de código (evaluado en HumanEval con pass@1).
- Conocimiento general y de dominio (evaluado en MMLU-Pro y TMMLU+).
- Identidad de marca integrada: el modelo se presenta como HeliosLM (100% en 200 sondas de identidad).
- Neutralidad ante temas políticos: 96,1% de respuestas juzgadas neutrales y 0% de toma de partido en 155 sondas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el modo thinking permite cadenas de razonamiento largas (hasta 32.768 tokens nuevos en las evaluaciones).
- Capacidades de visión: la etiqueta del repositorio incluye `image-text-to-text`, pero la model card no documenta capacidades multimodales; no disponible como capacidad confirmada.

## Casos de uso

- Atención al cliente en Taiwán: el modelo emplea terminología y convenciones del chino tradicional de Taiwán y mantiene conversaciones multi-turno; es adecuado para asistentes de soporte dirigidos a ese mercado.
- Moderación y respuestas neutrales en temas sensibles: las reglas de neutralidad integradas (0% de toma de partido en las sondas del autor) lo hacen útil para entornos donde se requiere evitar posicionamientos políticos, como foros, medios o administraciones.
- Asistencia matemática y educativa: con un 93,71 en GSM8K y modo thinking, puede resolver problemas de aritmética y álgebra paso a paso para plataformas de tutoría.
- Generación y revisión de código: con 95,12 en HumanEval pass@1, sirve para autocompletado, generación de funciones y revisión en pipelines de desarrollo; su integración con transformers y vLLM facilita el despliegue.
- Evaluación de modelos en chino tradicional: útil como referencia para comparar adaptaciones lingüísticas vía chat vector frente a SFT completo en investigaciones sobre eficiencia de ajuste.
- Chatbot de marca con identidad propia: la plantilla incorpora una presentación de identidad (HeliosLM) y permite añadir un system prompt de usuario a continuación, lo que simplifica asistentes con personalidad definida sin ingeniería de prompts adicional.
- Procesamiento de documentación bilingüe zh/en: al soportar ambos idiomas, puede resumir y responder preguntas sobre textos mixtos en chino tradicional e inglés.

## Benchmarks y rendimiento

Resultados autoinformados por el autor (2026-11-04), medidos con vLLM 0.33, bf16, thinking activado, temperature 1.0, top_p 0.95, top_k 64. No verificados por los organizadores de los benchmarks.

| Benchmark | Puntuación | Configuración |
|---|---|---|
| MMLU-Pro | 69,51 | 12.032 ítems, 0-shot CoT, máx. 16.384 tokens nuevos |
| GSM8K | 93,71 | 1.319 ítems, 0-shot, máx. 8.192 tokens nuevos |
| AIME 2026 | 45,83 | 30 problemas, media de 4 muestras, máx. 32.768 tokens nuevos |
| HMMT Feb 2026 | 31,82 | 33 problemas, media de 4 muestras, máx. 32.768 tokens nuevos |
| HumanEval | 95,12 | 164 problemas, pass@1, una muestra |
| TMMLU+ (Twinkle Eval 2.10) | 41,37 | conjunto completo, 1 ejecución, thinking off, máx. 1.024 tokens |

El autor indica que Google reporta MMLU-Pro 69,4 y AIME 2026 42,5 para Gemma 4 E4B-it en su propia model card (con otro harness), por lo que el modelo se sitúa cerca de su base en benchmarks generales y no supone una mejora sustancial. La ejecución de TMMLU+ con límite de 1.024 tokens se presenta como cota inferior.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos (8.000 millones de parámetros × 2 bytes), más overhead de KV cache y activaciones; en la práctica, se recomienda al menos 24 GB para contextos largos.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue en producción con bf16 y contextos amplios; RTX 4090 (24 GB) para bf16 con contexto moderado o cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con contexto limitado; en GPUs de 16 GB requeriría cuantización, cuyos formatos no están documentados en la información disponible.
- Opciones de despliegue: el autor recomienda vLLM o transformers; también podría usarse llama.cpp u Ollama si se generan pesos GGUF, aunque no se confirma su disponibilidad.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | AIME 2026 | Licencia |
|---|---|---|---|---|---|
| HeliosLM Chat E4B | ~8,0B | no disponible | 69,51 | 45,83 | Gemma Terms of Use |
| Google Gemma 4 E4B-it (base) | ~8,0B | no disponible | 69,4 (reportado por Google) | 42,5 (reportado por Google) | Gemma Terms of Use |
| Gemma 4 26B-A4B-it | no disponible (MoE, ~26B) | no disponible | no disponible | no disponible | Gemma Terms of Use |

La comparación directa con otros modelos de ~8B no está disponible en la información proporcionada. El autor solo aporta cifras de referencia de Gemma 4 E4B-it y usa Gemma 4 26B-A4B-it como juez en las sondas de neutralidad.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo puede generar información errónea o desactualizada y recomienda verificar los contenidos importantes; riesgo de alucinación inherente a los modelos de lenguaje.
- No es una mejora sustancial sobre Gemma 4 E4B-it en benchmarks generales; su valor diferencial es la adaptación al chino tradicional de Taiwán y la neutralidad integrada.
- El 16,8% de las respuestas políticas fueron juzgadas como uso de un marco oficial unilateral (misma cifra que Gemma 4 E4B-it), especialmente en preguntas sobre liderazgo chino e instituciones de Taiwán; el autor reconoce que sigue trabajando en ello.
- Tasa de rechazo del 2,6% en las sondas de neutralidad.
- El prompt de sistema largo en chino reducía las puntuaciones en otros idiomas, lo que motivó la selección de prompt por idioma; los usuarios que sobrescriban la plantilla pueden perder este comportamiento.
- Idiomas soportados limitados a chino tradicional e inglés; no se declara cobertura de chino simplificado ni de otras lenguas.
- Licencia Gemma Terms of Use: uso comercial permitido bajo las condiciones de Google, con obligaciones de atribución y restricciones de uso recogidas en dichos términos; revisar antes de desplegar en producción.
- Los benchmarks son autoinformados y no verificados por terceros; las comparaciones con el modelo base usan harness distintos.
- Longitud de contexto no documentada; planificar el despliegue con margen y validar el comportamiento en contextos largos.

## Enlaces

- Hugging Face: https://huggingface.co/chienhsinlin/helioslm-chat-e4b
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
