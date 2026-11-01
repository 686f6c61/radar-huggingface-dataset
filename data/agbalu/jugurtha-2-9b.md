# agbalu/Jugurtha-2-9B

## Resumen

Jugurtha-2-9B es un modelo fundacional soberano desarrollado por el usuario agbalu y publicado en HuggingFace, orientado al idioma kabyle (Taqbaylit, código `kab`, escritura latina), una lengua bereber (amazigh) de bajos recursos. Se trata de la segunda generación de la familia Jugurtha, sucesora y ampliación del modelo Jugurtha-4B: la torre de texto pasa de 4.205 millones a 8.953 millones de parámetros entrenables (más del doble), con un total de 9.653 millones de parámetros según los safetensors del repositorio. El modelo resuelve un problema real: la ausencia de LLM capaces de generar kabyle canónico con razonamiento nativo, algo que los modelos generalistas cubren de forma muy deficiente.

Su relevancia radica en los resultados declarados por el autor: es, según la model card, el primer modelo de LLM amazigh que supera el 80 % de precisión en clasificación temática SIB-200 (80,81 %), mejora los récords de traducción bidireccional en FLORES+ y mantiene un hueco ortográfico de 0,00, es decir, escribe en alfabeto latino bereber canónico sin deriva fonémica. Está basado en la arquitectura `qwen3_5` (según los tags del repositorio), es un causal LM instruction-tuned con capacidades de razonamiento y se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM basado en qwen3_5 (transformer decoder) |
| Parametros totales | 9.653.104.368 (safetensors) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | kabyle (kab), ingles (en), frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (19,3 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder causal estándar construido sobre la arquitectura `qwen3_5`, lo que permite cargarlo con `transformers` sin `trust_remote_code`, en BF16 y con `device_map="auto"`. La torre de texto tiene 8.953.803.264 parámetros entrenables, un incremento del 112,9 % respecto a la primera generación. No es un modelo MoE según la información disponible, por lo que todos los parámetros están activos en inferencia.

Sobre el entrenamiento, la model card no detalla el número de tokens ni la composición exacta del corpus, pero sí publica métricas de evaluación en conjuntos held-out que permiten inferir un entrenamiento multilingüe con retención de conocimiento global: bits por carácter de 0,993 en inglés (perplejidad 17,99), 1,258 en francés (perplejidad 24,76) y 1,587 en kabyle (perplejidad 9,38 sobre 240.000 caracteres). No hay información sobre RLHF, DPO u otras técnicas de alineación. Como innovaciones destacables, la model card señala: razonamiento en modo dual con bloques `<think>...</think>` en kabyle activables mediante `enable_thinking`, y una plantilla de sistema soberana (identidad, pureza lingüística y barreras antialucinación) integrada directamente en el chat template del tokenizador.

## Capacidades

- Generacion de texto conversacional en kabyle con instrucciones (instruction-tuned).
- Razonamiento paso a paso nativo en kabyle mediante bloques `<think>...</think>`, activables por petición con `enable_thinking=True` (por defecto desactivado para generación directa y rápida).
- Comprension lectora, preguntas y respuestas, resumenes y explicaciones culturales en kabyle.
- Traduccion bidireccional kabyle ↔ ingles y kabyle ↔ frances.
- Clasificacion tematica en kabyle (80,81 % de precision en SIB-200, 7-shot).
- Generacion con ortografia canonica del alfabeto latino bereber (caracteres como ɣ, ɛ, ḥ, ḍ, ṣ, ṭ, ẓ, ṛ, č, ǧ, ţ) sin deriva fonemica.
- Retencion multilingue: capacidades en ingles y frances preservadas segun las metricas held-out publicadas.
- Carga estandar con `transformers` y `torch`, compatible con `device_map="auto"`.
- No hay informacion sobre soporte de tool calling, function calling, agentes ni capacidades de vision o audio en la model card, pese a que el pipeline etiquetado es image-text-to-text.

## Casos de uso

- Asistencia conversacional en kabyle: el modelo puede mantener dialogos multi-turno y responder preguntas en Taqbaylit, algo que ningun modelo generalista cubre con calidad, gracias a su entrenamiento especifico en la lengua.
- Traduccion kabyle ↔ ingles / frances: util para localizacion de contenidos, mediacion linguistica y comunicacion con comunidades amazigh; los resultados de FLORES+ indican mejor calidad en direccion kabyle → ingles (27,86 BLEU) que en la inversa (7,62 BLEU), por lo que conviene priorizar el primer sentido.
- Clasificacion y organizacion de contenidos en kabyle: con 80,81 % de precision en SIB-200 puede categorizar automaticamente noticias o documentos en siete tematicas, util para agregadores de medios locales.
- Generacion de contenido educativo y cultural: redaccion de explicaciones, resumenes y material de aprendizaje del kabyle con ortografia canonica garantizada (hueco ortografico 0,00), relevante para proyectos de revitalizacion linguistica.
- Razonamiento transparente en kabyle: con `enable_thinking=True` genera cadenas de razonamiento paso a paso en la lengua, util para aplicaciones educativas donde se quiera mostrar el proceso de resolucion.
- Procesamiento de texto con preservacion del frances y el ingles: las metricas held-out (PPL 18,0 en ingles, 24,8 en frances) permiten usarlo en flujos bilingues o trilingues sin degradacion catastrofica.
- Investigacion en PLN de lenguas de bajos recursos: base para fine-tuning posterior, evaluaciones y desarrollo de herramientas para otras variantes bereberes.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Jugurtha-4B (Gen 1) | Jugurtha-2-9B (Gen 2) |
|---|---|---:|---:|
| SIB-200 (kab_Latn, 7-shot) | Accuracy (azar: 14,29 %) | 73,74 % | 80,81 % |
| FLORES+ devtest kab → eng (5-shot) | chrF++ / BLEU | 46,17 / 23,79 | 49,45 / 27,86 |
| FLORES+ devtest eng → kab (5-shot) | chrF++ / BLEU | 28,77 / 6,73 | 30,80 / 7,62 |
| FLORES+ hueco ortografico | chrF++ (normalizado − raw) | 0,00 | 0,0000 |
| Held-out kabyle (2.000 docs) | BPC / perplejidad | 1,578 / — | 1,587 / 9,38 |
| Held-out ingles (832 docs) | BPC / perplejidad | — | 0,993 / 17,99 |
| Held-out frances (2.691 docs) | BPC / perplejidad | — | 1,258 / 24,76 |

No se han publicado resultados en benchmarks generalistas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.650 millones de parametros en BF16, el repositorio pesa 19,3 GB, por lo que se necesita en torno a 20-22 GB de VRAM para inferencia en precision completa, mas margen para el KV cache.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 (24 GB) deberian alojar el modelo en BF16 con contexto moderado; en entornos de servidor, A100 40 GB o H100 ofrecen margen adicional para contextos largos y mayor throughput.
- Consumer GPU: cabe en una unica GPU de 24 GB (RTX 3090/4090) en BF16. No hay cuantizaciones oficiales publicadas (GGUF, AWQ, GPTQ no disponibles segun la informacion proporcionada); con cuantizacion a 4 bits no oficial cabria en GPUs de 8-10 GB, pero esto no esta soportado por el autor.
- Opciones de despliegue: `transformers` con `torch` en BF16 y `device_map="auto"` es la via documentada. Al ser un causal LM estandar sin codigo remoto, deberia ser compatible con vLLM, TGI, llama.cpp (tras conversion) y Ollama, aunque el autor no documenta estos caminos ni publica cuantizaciones.
- Latencia y throughput: no disponibles; no se publican mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma principal | SIB-200 kab | FLORES+ kab→eng | Licencia |
|---|---|---|---|---|---|
| Jugurtha-2-9B | 9,65B (torre 8,95B) | kabyle | 80,81 % | 49,45 chrF++ / 27,86 BLEU | Apache 2.0 |
| Jugurtha-4B | 4,2B (torre) | kabyle | 73,74 % | 46,17 chrF++ / 23,79 BLEU | no disponible |
| Modelos generalistas (Qwen, Llama, Gemma) | variables | multilingues | no publicado para kab | sin soporte nativo de kabyle declarado | variables |

No existen otros modelos amazigh comparables publicados con metricas en la informacion disponible; la comparacion mas directa es con su predecesor Jugurtha-4B, al que supera en todas las metricas declaradas.

## Limitaciones y advertencias

- Todos los benchmarks provienen de la model card del autor y estan marcados como no verificados; no hay evaluacion independiente.
- La calidad de traduccion eng → kab es notablemente inferior a la inversa (BLEU 7,62 frente a 27,86), por lo que la direccion ingles → kabyle requiere revision humana.
- El autor indica explicitamente que el modelo no es adecuado para diagnostico medico critico, orientacion farmacologica ni asesoramiento legal vinculante.
- No hay datos sobre tool calling, agentes ni uso con funciones; la etiqueta image-text-to-text del pipeline no viene acompañada de documentacion de capacidades visuales en la model card.
- Longitud de contexto no declarada: conviene verificarla empiricamente antes de desplegar aplicaciones con documentos largos.
- Riesgo de alucinacion no cuantificado; la plantilla de sistema incluye barreras antialucinacion segun el autor, pero no hay metricas que lo respalden.
- Sesgos: no se publica ninguna evaluacion de sesgos. Al tratarse de un modelo entrenado para una lengua de bajos recursos con identidad linguistica "soberana" integrada en el system prompt, puede rechazar o corregir peticiones que pida mezclar idiomas o usar ortografia no canonica.
- La comunidad de descargas es muy reducida (223 descargas, 0 likes), lo que implica escaso testeo por terceros y posibles bugs sin descubrir.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales conocidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agbalu/Jugurtha-2-9B
- Predecesor (Jugurtha-4B): https://huggingface.co/agbalu/Jugurtha-4B
- Dataset SIB-200: https://huggingface.co/datasets/Davlan/sib200
- Dataset FLORES+: https://huggingface.co/datasets/openlanguagedata/flores_plus
- Paper, blog, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
