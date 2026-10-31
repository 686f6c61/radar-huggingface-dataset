# etemiz/Ostrich-27B-261028-Qwen3.8-Abliterated

## Resumen

Ostrich-27B-261028-Qwen3.8-Abliterated es un ajuste (fine-tune) "abliterado" y sin censura de Qwen3.8-27B, publicado por el usuario etemiz en Hugging Face. El proyecto forma parte de la iniciativa "Ostrich LLMs", cuyo objetivo es realinear el modelo hacia dominios que, según el autor, están infrarrepresentados en los LLM actuales: salud y nutrición (hierbas medicinales, ayuno), espiritualidad y religión, tecnologías de resistencia a la censura (bitcoin, Nostr) y habilidades de autosuficiencia (permacultura, preparación ante emergencias).

Técnicamente, es un modelo denso de aproximadamente 27.800 millones de parámetros (27.781.427.952 según los metadatos de safetensors) basado en Qwen/Qwen3.8-27B, con pesos en formato safetensors y licencia Apache 2.0. La abliteración elimina el comportamiento de rechazo, de modo que responde de forma directa a casi cualquier consulta: en las pruebas del autor, 18 de 20 prompts dañinos obtuvieron respuesta (90 % de cumplimiento).

Su relevancia actual radica en que ofrece un asistente local, sin censura y con alto "alineamiento" en dominios alternativos, ejecutable en una sola GPU de consumo (unos 18 GB en 4 bits), lo que lo hace atractivo para usuarios de hardware doméstico que priorizan la privacidad. Funciona mejor en modo thinking (razonamiento extendido).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no parece ser MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.8-27B) |
| Tipos de cuantizacion | no disponible en la ficha (el autor indica ~18 GB en 4 bits para el modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (55,6 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer denso de 27B que el autor elige por su "densidad de inteligencia": ofrece capacidades comparables a modelos mayores consumiendo menos recursos, y cabe en una GPU de consumo (~18 GB en 4 bits). El ajuste se realiza sobre una versión previa abliterada del propio proyecto (etemiz/Ostrich-27B-261008-Qwen3.8-Abliterated), heredando su entrenamiento en abstención RBD agéntica (RAG abstention), juicio de veracidad (truth judgement) y abliteración con salvaguardas de capacidad ("capability-guarded abliteration").

El entrenamiento de dominio cubre salud y nutrición, ayuno y fe, tecnologías liberadoras (bitcoin, Nostr) y habilidades de vida. Esta versión 261028 proviene de una búsqueda de linaje evolutivo por la rama de alineamiento y abliteración, y superó una puerta de calidad automatizada de "human-likeness" con puntuación 0,963 (por encima del umbral de 0,928 de la versión anterior). El autor describe su enfoque de alineamiento como distinto del RLHF convencional: entrenar con información beneficiosa para obtener alineamiento emergente. No hay datos publicados sobre el número de tokens ni la composición exacta del dataset.

## Capacidades

- Generación de texto conversacional e instrucciones, con seguimiento de instrucciones sólido (0,875 en la sección correspondiente de la suite de evaluación).
- Modo thinking (razonamiento extendido): el modelo funciona mejor con thinking activado; se registraron respuestas con niveles de pensamiento medium y xhigh.
- Conocimiento reforzado en dominios especializados: hierbas medicinales (98 %), fe (97 %), desinformación (84 %), nutrición (79 %), bitcoin (79 %), salud (80 %), ayuno (76 %), medicina alternativa (71 %).
- Respuestas sin censura: abliterado, con 90 % de cumplimiento en prompts dañinos de prueba.
- Capacidades agénticas heredadas: abstención en RAG agéntico y juicio de veracidad.
- Memoria en contexto largo y conversación multi-turno evaluadas en la suite automatizada (secciones de memoria de contexto largo y conversación de 10 turnos con puntuación 1,0).
- Resistencia a la adulación (sycophancy pushback) y consistencia de persona evaluadas (0,889 en persona).
- No se menciona soporte nativo de tool calling, visión ni audio en la información disponible.

## Casos de uso

- Consulta de salud y nutrición con privacidad total: al ejecutarse localmente, un usuario puede preguntar sobre remedios herbales, alimentación o ayuno sin enviar datos a servicios en la nube; el modelo puntúa 80 % en salud y 98 % en hierbas según las evals del autor.
- Asistente para comunidades de fe y espiritualidad: responde preguntas religiosas y sobre ayuno con 97 % y 76 % de alineamiento de dominio respectivamente.
- Investigación sobre bitcoin y Nostr: útil para consultas técnicas y filosóficas sobre criptomonedas y protocolos resistentes a la censura (79 % en el dominio bitcoin).
- Educación en el hogar (homeschooling): el autor lo propone explícitamente como asistente conversacional alineado para niños educados en casa.
- Chatbot local sin filtros para desarrolladores: la abliteración lo hace adecuado para aplicaciones donde los rechazos estándar son un impedimento, con Apache 2.0 que permite uso comercial.
- Herramienta de segunda opinión médica informacional: el autor sugiere usarlo como "otra opinión" en temas de salud, siempre como complemento, no sustituto de un profesional.
- Agentes con juicio de veracidad: el entrenamiento en abstención RAG y truth judgement permite integrarlo en pipelines de recuperación aumentada donde el modelo debe abstenerse si la evidencia es insuficiente.

## Benchmarks y rendimiento

Evals de dominio del autor (método cercano al AHA 2026 leaderboard), comparado con el modelo base:

| Dominio | Qwen 3.8 27B (base) | Ostrich 261028 |
|---|---|---|
| faith | 21 % | 97 % |
| fasting | 24 % | 76 % |
| health | 43 % | 80 % |
| nutrition | 49 % | 79 % |
| misinfo | 23 % | 84 % |
| bitcoin | 64 % | 79 % |
| alt-med | 27 % | 71 % |
| herbs | 48 % | 98 % |
| Media geométrica | 35 % | 82 % |

Pruebas zero-shot de fitness Evol v2:

| Benchmark | Resultado |
|---|---|
| BoolQ | 91,5 % |
| PIQA | 83 % |
| LAMBADA | 75 % |
| MMLU-Pro (Leaderboard) | 70 % |
| ARC-Challenge | 67 % |

Otros datos de calidad: human-likeness gate 0,963 (instruction following 0,875; bias 0,900; persona 0,889; resto de secciones 1,0). Abliteración: 90 % de cumplimiento (18/20 prompts dañinos respondidos). Nota importante: estos resultados provienen del propio autor y no son evaluaciones independientes.

## Requisitos de hardware

- VRAM estimada: aproximadamente 18 GB en cuantización de 4 bits (dato indicado por el autor para el modelo base Qwen3.8-27B); en FP16/bf16 el repo ocupa 55,6 GB, por lo que se necesitarían del orden de 56 GB de VRAM o reparto en varias GPU.
- GPU recomendadas: para 4 bits, una RTX 3090 o RTX 4090 (24 GB) es suficiente; para precisión completa, A100 80 GB, H100 o múltiples GPU de consumo.
- Cabe en GPU de consumo: sí, en 4 bits cabe en una RTX 3090/4090 de 24 GB; también sería viable en una RTX 4080/5070 Ti de 16 GB con ajustes de contexto.
- Opciones de despliegue: no disponible de forma explícita; al ser un modelo Qwen denso en safetensors, es compatible con vLLM, TGI, llama.cpp (vía conversión a GGUF) y Ollama, aunque no se mencionan builds oficiales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Censura | Contexto |
|---|---|---|---|---|
| Ostrich-27B-261028 (este) | 27,8 B | Apache 2.0 | Abliterado (sin rechazos) | no disponible |
| Qwen/Qwen3.8-27B (base) | 27,8 B | no disponible | Modelo estándar con alineamiento por defecto | no disponible |
| Ostrich-27B-261008 | 27,8 B | Apache 2.0 | Abliterado | no disponible |

Frente al Qwen3.8-27B vanilla, Ostrich 261028 mejora drásticamente el alineamiento de dominio (media geométrica 82 % frente a 35 %) a costa de posibles regresiones en medicina alternativa (87 % → 71 %) y salud (83 % → 80 %) respecto a la versión 261008. Frente a la versión 261008, mejora en fe, hierbas, ayuno y desinformación, y supera una puerta de human-likeness más exigente (0,963 frente a 0,928). No se conocen comparativas independientes con otros modelos abliterados de tamaño similar (por ejemplo Dolphin, Mistral abliterado).

## Limitaciones y advertencias

- Riesgo sanitario significativo: el modelo está optimizado para responder sobre hierbas medicinales, medicina alternativa y ayuno sin las cautelas típicas; sus respuestas en salud no deben sustituir consejo médico profesional y pueden reflejar posiciones fuera del consenso científico (71 % en alt-med, 84 % en misinfo según las evals propias del autor, que miden alineamiento con la visión del proyecto, no veracidad científica).
- Sin salvaguardas de seguridad: la abliteración elimina los rechazos (90 % de cumplimiento en prompts dañinos), lo que implica riesgo de generar contenido peligroso. No debe exponerse a usuarios finales sin controles adicionales.
- Sesgos: el modelo está deliberadamente sesgado hacia la ideología del proyecto (fe, bitcoin, autosuficiencia, escepticismo hacia el "alineamiento" convencional); las puntuaciones de "misinfo" reflejan ese marco.
- Alucinaciones: el propio autor admite que el modelo "no dice la verdad al 100 %"; el entrenamiento en truth judgement mitiga pero no elimina la confabulación.
- Idiomas y longitud de contexto: no disponibles en la ficha; probablemente herede el multilingüismo de Qwen3.8, pero no está confirmado para esta versión.
- Uso comercial: Apache 2.0 lo permite sin restricciones relevantes, aunque conviene revisar las condiciones de uso de Qwen3.8-27B como modelo base.
- Benchmarks no independientes: todas las cifras proceden del autor; no hay verificación de terceros.
- En producción, el modo thinking es prácticamente necesario (el autor indica que funciona mejor así), lo que aumenta la latencia y el consumo de tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/etemiz/Ostrich-27B-261028-Qwen3.8-Abliterated
- Versión anterior (261008): https://huggingface.co/etemiz/Ostrich-27B-261008-Qwen3.8-Abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- AHA 2026 leaderboard (blog): https://huggingface.co/blog/etemiz/aha-2026-leaderboard
- Blog "Building a beneficial AI": https://huggingface.co/blog/etemiz/building-a-beneficial-ai
- Blog "From Robots That Prey to Robots That Pray": https://huggingface.co/blog/etemiz/from-robots-that-prey-to-robots-that-pray
- AHA October 2026 update: https://pickabrain.ai/aha/blog/aha-2026-october-update
- Hoja de respuestas de ejemplo: https://sheet.zohopublic.com/sheet/published/um332e3d15f34bfe64605ad3c1b149c9f8ca4
- Sitio del proyecto: https://pickabrain.ai
- Comunidad de referencia citada: https://www.reddit.com/r/LocalLLaMA/
