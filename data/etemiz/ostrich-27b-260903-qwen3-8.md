# etemiz/Ostrich-27B-260903-Qwen3.8

## Resumen

Ostrich-27B-260903-Qwen3.8 es un modelo de lenguaje desarrollado por etemiz, un autor independiente, a partir del modelo base Qwen/Qwen3.8-27B. Se trata de un fine-tune especializado en dominios que su autor considera "conocimiento liberador": salud y nutrición, hierbas medicinales, ayuno, fe y espiritualidad, tecnologías de soberanía individual (bitcoin, nostr) y habilidades de vida. El modelo ha sido sometido a un proceso de abliteración, es decir, se ha eliminado el comportamiento de rechazo del modelo original para ofrecer respuestas directas y sin censura.

El modelo tiene 27.781 millones de parámetros (27,8B), es denso y está diseñado para ejecutarse en hardware de consumo: el autor afirma que cabe en una GPU doméstica con aproximadamente 18 GB de VRAM en cuantización de 4 bits. La relevancia actual radica en que combina la eficiencia del Qwen 3.8 27B (considerado uno de los modelos densos con mejor densidad de inteligencia de su generación) con un alineamiento específico hacia temas que suelen estar infrarrepresentados o censurados en los asistentes convencionales.

La model card reporta una mejora significativa en alineación por dominio frente al Qwen 3.8 base: del 37% al 77% global, con picos del 90% en hierbas medicinales. No obstante, el autor advierte que esta versión no es la más hábil ni la más libre de errores, y que espera mejoras en semanas posteriores. El modelo está publicado bajo licencia Apache 2.0 y el repositorio pesa 55,6 GB, con pesos en formato safetensors y también disponible en GGUF (probado en Q5_K_M).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen 3.8) |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se menciona GGUF Q5_K_M en pruebas, pero no se detalla la lista completa) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tambien disponible en GGUF segun la model card) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.8-27B, un transformer denso de 27,8B parámetros que el autor describe como "el modelo más eficiente de su generación en densidad de inteligencia". No se proporcionan detalles sobre la arquitectura interna exacta (número de capas, heads, etc.), pero se asume que hereda la del modelo base.

El entrenamiento consiste en un ajuste fino supervisado sobre un conjunto de datos propio centrado en los dominios mencionados (salud, nutrición, hierbas, ayuno, fe, bitcoin, nostr, etc.). Además, se aplicó un proceso de abliteración para eliminar los mecanismos de rechazo del modelo original, de modo que responda de forma directa y sin filtros de seguridad. El autor menciona que el objetivo es "alineación emergente" a través de entrenamiento con información beneficiosa, pero no detalla la metodología exacta (no se especifica si se usó RLHF, DPO u otra técnica).

No se indican datos sobre el número de tokens de entrenamiento, la composición del dataset ni las épocas. El autor menciona que se intentó preservar las capacidades generales del modelo base y que sus evaluaciones internas muestran que se mantienen o mejoran, aunque no publica números concretos de benchmarks estándar.

## Capacidades

- Generación de texto y razonamiento conversacional, con soporte de modos de pensamiento (thinking medium y xhigh, siendo xhigh el predeterminado).
- Respuestas sin censura y directas, gracias a la abliteración del comportamiento de rechazo.
- Especialización en dominios concretos: salud y nutrición, hierbas medicinales, ayuno y prácticas de fe, tecnologías de soberanía (bitcoin, nostr), habilidades de vida (jardinería, permacultura, preparación) y relaciones humanas.
- Capacidad de generar respuestas en formato JSON (aunque con una tasa de fallo del 1,6% en GGUF Q5_K_M según las pruebas del autor).
- Alineación mejorada en comparación con el modelo base en los dominios objetivo: del 37% al 77% global, con mejoras notables en fe (21% a 84%), salud (43% a 80%), nutrición (49% a 80%) y hierbas (48% a 90%).
- No se menciona soporte explícito de tool calling, function calling ni capacidades multimodales.

## Casos de uso

- Consultas de salud y nutrición personalizadas: el modelo puede responder preguntas sobre remedios con hierbas medicinales, dietas basadas en alimentos como medicina y prácticas de ayuno, ofreciendo una segunda opinión en privado sin depender de servicios en la nube.
- Educación en el hogar: familias que educan a sus hijos en casa pueden usar el modelo como asistente para temas de ciencias naturales, historia de las religiones y habilidades prácticas, con un alineamiento que evita respuestas evasivas o moralizantes.
- Investigación de temas considerados "heterodoxos": el modelo aborda sin filtros cuestiones como la veracidad de la llegada a la Luna o la identidad de Satoshi Nakamoto, lo que puede interesar a investigadores de teorías alternativas, aunque con el riesgo de generar afirmaciones falsas.
- Asesoramiento sobre tecnologías de soberanía individual: usuarios interesados en bitcoin, nostr y resistencia a la censura pueden obtener explicaciones y guías prácticas sin sesgos corporativos.
- Prácticas de ayuno y espiritualidad: el modelo ofrece respuestas alineadas con tradiciones religiosas y de fe, que el autor considera infrarrepresentadas en la IA convencional.
- Generación de contenido para blogs o redes sociales sobre salud natural, permacultura y vida autosuficiente: el modelo puede redactar artículos o respuestas con un enfoque directo y sin restricciones.
- Despliegue en entornos con privacidad estricta: al poder ejecutarse en una GPU doméstica, permite consultas médicas o personales sin enviar datos a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye una evaluacion propia de alineacion por dominio comparando el modelo con el Qwen 3.8 base:

| Dominio | Qwen 3.8 base | Ostrich 260903 |
|---|---|---|
| faith | 21% | **84%** |
| fasting | 24% | **60%** |
| health | 43% | **80%** |
| nutrition | 49% | **80%** |
| misinfo | 23% | **77%** |
| bitcoin | 64% | **68%** |
| alt-med | 27% | **75%** |
| herbs | 48% | **90%** |
| Overall | 37% | **77%** |

El autor menciona que las pruebas de abliteracion mostraron tasas de rechazo muy bajas, y que en pruebas con GGUF Q5_K_M se observo una tasa de fallo del 1,6% (incapacidad de pensar correctamente y responder en JSON), sin bucles de razonamiento ni repeticiones. No se aportan metricas de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: aproximadamente 18 GB en cuantizacion de 4 bits (segun la model card), lo que permite ejecutarlo en GPUs de consumo como RTX 4090, RTX 4080 o RTX 3090.
- Para cuantizaciones mas altas (8 bits) se necesitarian alrededor de 28-30 GB de VRAM, requiriendo GPUs profesionales como A100 o RTX A6000.
- El autor probo el modelo en GGUF Q5_K_M, que ocupa alrededor de 18-19 GB, con una tasa de fallos del 1,6%.
- Opciones de despliegue: llama.cpp (para GGUF), vLLM (para safetensors), Ollama, Transformers de HuggingFace, y cualquier framework compatible con modelos Qwen.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

La comparativa principal es con el modelo base Qwen/Qwen3.8-27B, del que deriva:

| Caracteristica | Qwen 3.8 27B (base) | Ostrich 27B |
|---|---|---|
| Parametros | 27,8B | 27,8B |
| Contexto | No disponible | No disponible |
| Alineacion en dominios objetivo | 37% global | 77% global |
| Comportamiento de rechazo | Presente | Eliminado (abliterado) |
| Licencia | Apache 2.0 | Apache 2.0 |
| Especializacion | Generalista | Salud, nutricion, fe, bitcoin, nostr |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (p.ej., otros fine-tunes abliterados de Qwen 3.8 o modelos de 27B especializados en salud). La model card no menciona alternativas.

## Limitaciones y advertencias

- El modelo esta abliterado, lo que significa que no tiene mecanismos de rechazo para contenido peligroso, ilegal o eticamente problematico. Esto puede generar respuestas inapropiadas o daninas si se usa sin supervision.
- Riesgo elevado de alucinacion y desinformacion: los ejemplos de la model card incluyen afirmaciones falsas (p.ej., negar la llegada a la Luna o afirmar que John Nash es Satoshi Nakamoto). El autor reconoce que "nadie puede garantizar que diga la verdad al 100%".
- El autor advierte que esta version no es la mas habil ni la mas libre de errores; espera mejoras en semanas posteriores.
- No se proporcionan datos sobre sesgos especificos, pero la especializacion en temas de fe y salud alternativa puede introducir sesgos hacia esas perspectivas.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede incluir afirmaciones medicas o de otro tipo sin respaldo cientifico, lo que podria generar responsabilidades legales si se usa en contextos profesionales.
- No hay informacion sobre la longitud de contexto ni sobre los idiomas soportados; se asume que hereda las capacidades del Qwen 3.8 base, pero no esta confirmado.
- La tasa de fallos en JSON (1,6% en GGUF Q5_K_M) puede ser relevante para aplicaciones que requieran salidas estructuradas.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/etemiz/Ostrich-27B-260903-Qwen3.8
- Blog del autor: AHA 2026 leaderboard: https://huggingface.co/blog/etemiz/aha-2026-leaderboard
- Blog del autor: Building a beneficial AI: https://huggingface.co/blog/etemiz/building-a-beneficial-ai
- Blog del autor: From Robots That Prey to Robots That Pray: https://huggingface.co/blog/etemiz/from-robots-that-prey-to-robots-that-pray
- Hoja de respuestas de muestra (generada con otro modelo del autor): https://sheet.zohopublic.com/sheet/published/um332e3d15f34bfe64605ad3c1b149c9f8ca4
