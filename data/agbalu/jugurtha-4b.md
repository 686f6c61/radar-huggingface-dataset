# agbalu/Jugurtha-4B

## Resumen

Jugurtha-4B es un modelo generativo de 4.659.865.088 parámetros (aproximadamente 4,2B según el autor) desarrollado por agbalu, orientado específicamente al kabileño (taqbaylit, código `kab`, escritura latina), una lengua bereber de bajos recursos. El modelo se presenta como el primer modelo generativo de propósito general capaz de producir kabileño verificado y ortográficamente correcto en conversación, traducción y razonamiento multi-paso. Está construido sobre la arquitectura `qwen3_5` y se distribuye con licencia Apache 2.0.

El modelo resuelve un problema concreto: los modelos generalistas de su clase no generan kabileño de forma fiable, copian palabras del inglés o entran en bucles repetitivos. Jugurtha-4B eleva la traducción `kab→eng` de 14 a 46,17 chrF++ y `eng→kab` de 10 a 28,77 chrF++, además de mejorar la clasificación temática en SIB-200 del 20% al 73,74%. Todo ello manteniendo un rendimiento medio de 73,96 puntos en siete tareas generales en inglés y francés.

El modelo incorpora un modo de razonamiento dual: conversación estándar y razonamiento paso a paso transparente en kabileño dentro de etiquetas `<think>...</think>`, conmutable por petición mediante el parámetro `enable_thinking`. Se carga con `transformers` estándar, sin necesidad de `trust_remote_code`, en BF16 y con `device_map="auto"`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia `qwen3_5`), instruction-tuned |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (verificado con NIAH al 100%) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | kab (kabileño), en (inglés), fr (francés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Jugurtha-4B es un transformer causal de tipo decoder-only, etiquetado por el autor como `qwen3_5`, ajustado por instrucciones y con soporte nativo de modo de razonamiento. El modelo se distribuye en safetensors con un tamaño de repositorio de 9,3 GB, lo que corresponde a pesos en BF16 para sus 4.659.865.088 parámetros. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica destacable es la integración nativa de la ortografía canónica del kabileño latino (`ɣ ɛ ḥ ḍ ṣ ṭ ẓ ṛ č ǧ ţ`) sin degradación fonémica: el autor informa de una brecha ortográfica de 0,00 chrF++ entre la puntuación normalizada y la cruda. Además, el modelo incorpora un modo de razonamiento transparente en kabileño dentro de etiquetas `<think>`, activable por petición. El autor reporta una reducción del bits per character (BPC) en kabileño retenido de 4,26 a 1,578 sobre 2.000 documentos, lo que sugiere un aprendizaje real del idioma y no un simple emparejamiento superficial de patrones.

## Capacidades

- Generación de texto conversacional en kabileño, inglés y francés.
- Razonamiento matemático de varios pasos (GSM8K con 80,89% de exact match).
- Conocimiento multidisciplinar y razonamiento (MMLU-Pro con 62,86%).
- Seguimiento de instrucciones (IFEval con 54,16% en prompt-level strict).
- Traducción bidireccional kabileño ↔ inglés y kabileño ↔ francés.
- Comprensión lectora, respuesta a preguntas y resumen en kabileño.
- Clasificación temática en kabileño (SIB-200 con 73,74%).
- Recuperación en contexto largo: 100% en Needle-in-a-Haystack a 32k tokens en las tres variantes RULER.
- Modo de razonamiento dual conmutable mediante `enable_thinking`, con cadena de pensamiento transparente en kabileño dentro de `<think>...</think>`.
- Explicaciones culturales en el ámbito kabileño.
- No se menciona soporte explícito de tool calling ni de function calling en la información disponible.
- No se menciona soporte de agentes multi-paso más allá del razonamiento interno.

## Casos de uso

- Asistente conversacional en kabileño: el modelo puede mantener diálogos multi-turno con contexto de hasta 32.768 tokens, lo que permite conservar el hilo de conversaciones largas y recuperar información mencionada mucho antes, gracias a su 100% en NIAH a 32k.
- Traducción profesional kabileño ↔ inglés/francés: adecuado para localización de contenidos, documentación y materiales educativos, con 46,17 chrF++ en `kab→eng` y 28,77 chrF++ en `eng→kab`, muy por encima de los modelos generalistas que rondan 10-14 chrF++.
- Preservación y documentación lingüística: el modelo escribe ortografía canónica kabileña sin degradación, lo que lo hace útil para generar corpus, normalizar textos y producir materiales didácticos con grafía correcta.
- Educación y tutoría en matemáticas: con 80,89% en GSM8K y modo de razonamiento paso a paso en kabileño, puede explicar la resolución de problemas aritméticos a estudiantes kabileños en su lengua materna.
- Clasificación y etiquetado de textos en kabileño: con 73,74% en SIB-200 (frente al 14,29% de azar), sirve para moderación de contenido, organización de noticias o análisis temático de corpus en kabileño.
- Atención al ciudadano y servicios públicos bilingües: integrable en sistemas de información que atiendan a hablantes de kabileño en Argelia y la diáspora, traduciendo y respondiendo consultas con contexto largo.
- Investigación en lenguas de bajos recursos: como modelo de referencia para experimentos de transferencia lingüística, evaluación de retención multilingüe y estudios de ortografía, dado que mantiene 73,96 puntos medios en siete tareas en inglés y francés.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente), evaluados con `lm-eval` v0.4.13. La traducción se puntuó a 5-shot contra la referencia FLORES+ `kab_Latn` corregida ortográficamente.

| Benchmark / tarea | Metrica | Resultado |
|---|---|---:|
| Needle-in-a-Haystack (32k, RULER NIAH Single) | Accuracy | 100,00% |
| SIB-200 (`kab_Latn`, 7-shot) | Accuracy (azar 14,29%) | 73,74% |
| FLORES+ `kab → eng` | chrF++ / BLEU (5-shot) | 46,17 / 23,79 |
| FLORES+ `eng → kab` | chrF++ / BLEU (5-shot) | 28,77 / 6,73 |
| FLORES+ brecha ortográfica | chrF++ (normalizado − crudo) | 0,00 |
| Kabileño retenido | Bits per character (2.000 docs) | 1,578 |
| GSM8K | Exact match | 80,89% |
| MMLU-Pro | Exact match | 62,86% |
| IFEval | Prompt-level strict | 54,16% |
| Retención multilingüe (media de 7 tareas) | Media | 73,96 |
| MMLU | Accuracy | 74,28% |
| ARC-Challenge | Accuracy | 57,85% |

El autor indica que la media de 73,96 puntos en siete tareas en inglés y francés está dentro de 0,20 puntos de la línea base de propósito general, y que el BPC en kabileño retenido baja de 4,26 a 1,578.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 12-16 GB de VRAM para contexto moderado.
- GPU recomendadas para BF16: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB). En una RTX 4090 cabe con holgura en BF16 para contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16; en GPUs de 16 GB como RTX 4080 o 4070 Ti Super probablemente requiera cuantización, aunque el autor no publica pesos cuantizados.
- Opciones de despliegue: `transformers` estándar con `device_map="auto"` y BF16 (soporte nativo confirmado, sin `trust_remote_code`). No se confirma en la información disponible soporte para vLLM, llama.cpp, Ollama o TGI, ni la existencia de pesos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. La model card menciona una "línea base de propósito general" sin identificarla con nombre ni versión, y cita que los modelos generalistas de esta clase obtienen 10-14 chrF++ en `eng→kab` y etiquetan 13 de 16 muestras SIB-200 como `"politics"`, pero no se especifica qué modelos son.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Jugurtha-4B | 4.659.865.088 | 32.768 | Apache 2.0 | Especializado en kabileño |
| Modelos generalistas de la misma clase | no disponible | no disponible | no disponible | Línea base citada sin identificar |
| Alternativas específicas para lenguas bereberes | no disponible | no disponible | no disponible | No se conocen en la información disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- El modelo está especializado en kabileño; su rendimiento fuera de kab, en y fr no está documentado y probablemente sea inferior al de modelos generalistas del mismo tamaño.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en dominios factuales y en contextos largos pese al 100% en NIAH de aguja única.
- No se documentan sesgos conocidos, pero al entrenarse con datos de una comunidad lingüística concreta puede reflejar sesgos culturales y de representación de la diáspora kabileña.
- IFEval de 54,16% en prompt-level strict indica un seguimiento de instrucciones moderado; conviene validar prompts en producción.
- No se confirma soporte de tool calling ni de function calling, lo que limita su uso en pipelines de agentes que dependan de llamadas a funciones.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documenta la procedencia completa de los datos de entrenamiento.
- El tamaño del repositorio (9,3 GB) y la ausencia de pesos cuantizados publicados pueden complicar el despliegue en hardware limitado.
- La fecha de creación del repositorio (2026-10-18) y la información disponible no permiten confirmar la madurez del ecosistema de herramientas en torno al modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agbalu/Jugurtha-4B
- Dataset KabBench (referencia FLORES+ corregida): https://huggingface.co/datasets/agbalu/KabBench
- Dataset SIB-200: https://huggingface.co/datasets/Davlan/sib200
- Dataset MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- Dataset IFEval: https://huggingface.co/datasets/google/IFEval
- Dataset FLORES+: https://huggingface.co/datasets/openlanguagedata/flores_plus
