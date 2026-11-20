# agbalu/Jugurtha-2-9B

## Resumen

Jugurtha-2-9B es un modelo de lenguaje causal de tipo transformer desarrollado por el usuario agbalu, especializado en kabyle (taqbaylit, código `kab`, escritura latina) y presentado como modelo fundacional "soberano" para esta lengua amazigh de bajos recursos. Es la segunda generación y sucesor a mayor escala de Jugurtha-4B, pasando de 4,2B a 8,95B parámetros en la torre de texto (9.653.104.368 parámetros totales según los pesos en safetensors). El modelo está afinado para instrucciones y dispone de modo de razonamiento nativo en kabyle mediante bloques `<think>`.

El modelo aborda el problema de la escasez de recursos lingüísticos para el kabyle, una lengua con poca representación en los grandes modelos multilingües. Según la model card, supera el umbral del 80% de precisión en clasificación temática SIB-200 (80,81%) y establece nuevos registros en traducción bidireccional kabyle-inglés según FLORES+, manteniendo competencia en inglés y francés sin olvido catastrófico. Se distribuye con licencia Apache 2.0 y carga estándar en `transformers` sin necesidad de `trust_remote_code`.

La relevancia actual reside en su enfoque en una lengua de bajos recursos con preservación ortográfica canónica del bereber latino y una plantilla de sistema "soberana" integrada en el tokenizador. El contexto máximo no está especificado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal LM (etiqueta `qwen3_5`; torre de texto de 8,95B parámetros) |
| Parametros totales | 9.653.104.368 (torre de texto: 8.953.803.264) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | kab (kabyle/taqbaylit), en, fr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal estándar (causal LM) con una torre de texto de 8.953.803.264 parámetros, escalada un +112,9% respecto a los 4.205.751.296 parámetros de Jugurtha-4B. La etiqueta del repositorio es `qwen3_5`, lo que sugiere una base derivada de la familia Qwen 3.5, aunque la información disponible no detalla la configuración interna (número de capas, dimensiones ocultas, cabezas de atención). El modelo se distribuye en BF16 y se carga con `transformers` y `device_map="auto"` sin `trust_remote_code`.

El modelo está afinado para instrucciones y soporta razonamiento de cadena de pensamiento nativo en kabyle, activable mediante el parámetro `enable_thinking`. La model card menciona una plantilla de sistema "soberana" integrada directamente en el tokenizador, con identidad soberana, pureza lingüística y protecciones anti-alucinación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. La model card reporta métricas de perplejidad sobre datos retenidos: BPC 1,587 en kabyle (perplejidad 9,38 sobre 240k caracteres), BPC 0,993 en inglés (perplejidad 17,99) y BPC 1,258 en francés (perplejidad 24,76), lo que indica retención multilingüe.

## Capacidades

- Generación de texto conversacional en kabyle, inglés y francés.
- Razonamiento paso a paso transparente en kabyle mediante bloques `<think>...</think>`, conmutable por petición con `enable_thinking`.
- Traducción bidireccional kabyle-inglés (y presumiblemente kabyle-francés, dado el soporte de `fr`).
- Comprensión lectora, respuesta a preguntas y resumen en kabyle.
- Clasificación temática de textos en kabyle (evaluada en SIB-200).
- Preservación ortográfica canónica del bereber latino (`ɣ ɛ ḥ ḍ ṣ ṭ ẓ ṛ č ǧ ţ`) sin deriva fonémica, con brecha ortográfica de 0,00.
- Explicaciones culturales y asistencia conversacional multilingüe.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, visión, audio ni multimodalidad, pese a la etiqueta `image-text-to-text` del repositorio.

## Casos de uso

- Asistencia conversacional en kabyle: el modelo gestiona diálogos multi-turno con coherencia mejorada gracias al escalado a 8,95B parámetros, adecuado para interfaces de chat dirigidas a hablantes nativos de taqbaylit.
- Traducción kabyle-inglés en producción: con 27,86 BLEU y 49,45 chrF++ en FLORES+ `kab→eng`, puede integrarse en pipelines de localización de contenidos hacia inglés con revisión humana.
- Traducción inglés-kabyle asistida: con 7,62 BLEU y 30,80 chrF++ en `eng→kab`, útil como primera pasada en flujos de traducción con postedición por traductores nativos.
- Clasificación y etiquetado temático de noticias en kabyle: la precisión de 80,81% en SIB-200 (7-shot) permite enrutar y organizar contenidos periodísticos por temática.
- Educación y divulgación cultural: el modo de razonamiento en kabyle permite generar explicaciones paso a paso para materiales didácticos, con la ventaja de razonar en la propia lengua.
- Preservación y normalización ortográfica: la brecha ortográfica de 0,00 lo hace adecuado para tareas de normalización de texto en bereber latino canónico.
- Atención al cliente en lenguas minorizadas: combinado con su competencia en inglés y francés (BPC 0,993 y 1,258), puede atender consultas en kabyle y escalar a inglés o francés en el mismo hilo conversacional.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados):

| Benchmark / tarea | Metrica | Jugurtha-4B (gen. 1) | Jugurtha-2-9B (gen. 2) |
|---|---|---:|---:|
| SIB-200 (`kab_Latn`, 7-shot) | Accuracy (azar 14,29%) | 73,74% | 80,81% |
| FLORES+ `kab → eng` | chrF++ / BLEU (5-shot) | 46,17 / 23,79 | 49,45 / 27,86 |
| FLORES+ `eng → kab` | chrF++ / BLEU (5-shot) | 28,77 / 6,73 | 30,80 / 7,62 |
| FLORES+ brecha ortográfica | chrF++ (normalizado − bruto) | 0,00 | 0,0000 |
| Kabyle retenido | BPC (2.000 documentos) | 1,578 | 1,587 (PPL 9,38) |
| Inglés retenido | BPC (832 documentos) | — | 0,993 (PPL 17,99) |
| Francés retenido | BPC (2.691 documentos) | — | 1,258 (PPL 24,76) |

No se han publicado en la información disponible resultados en benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 19,3 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; se recomienda al menos 24 GB de VRAM en BF16.
- Con cuantización a 8 bits, los pesos ocuparían en torno a 10 GB; a 4 bits, en torno a 5-6 GB (estimaciones a partir del tamaño de los pesos; no confirmadas por el autor).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para BF16 en producción; RTX 4090 (24 GB) puede alojar el modelo en BF16 con `device_map="auto"` y margen ajustado.
- GPU de consumo: posible en RTX 4090 en BF16 con cuidado del overhead; en GPUs de 16 GB o menos sería necesario cuantizar (no se publican pesos GGUF ni cuantizados en la información disponible).
- Opciones de despliegue: `transformers` con `device_map="auto"` (soporte nativo documentado); vLLM, TGI, llama.cpp u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros (torre de texto) | Contexto | SIB-200 kab (7-shot) | FLORES+ kab→eng (chrF++/BLEU) | Licencia |
|---|---:|---|---:|---|---|
| Jugurtha-2-9B | 8,95B | no disponible | 80,81% | 49,45 / 27,86 | Apache 2.0 |
| Jugurtha-4B | 4,21B | no disponible | 73,74% | 46,17 / 23,79 | no disponible en la informacion |
| Otros modelos especializados en kabyle | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de otros modelos comparables de la misma categoría (lenguas de bajos recursos o modelos multilingües de tamaño similar) para establecer una comparación externa.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no es adecuado para diagnóstico médico, orientación farmacológica ni asesoramiento legal vinculante.
- Riesgo de alucinación inherente a los modelos generativos; la model card menciona protecciones anti-alucinación integradas en la plantilla, pero no cuantifica su eficacia.
- Sesgos: no se documentan sesgos conocidos en la información disponible; al entrenarse con datos limitados de kabyle, puede reflejar sesgos de las fuentes disponibles.
- Cobertura lingüística limitada a kab, en y fr; el rendimiento en otras lenguas no está evaluado.
- La longitud de contexto no está especificada, lo que dificulta planificar casos de uso con documentos largos.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false` en el model-index).
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento, no detalladas en la información disponible.
- La etiqueta `image-text-to-text` del repositorio no se corresponde con capacidades multimodales documentadas en la model card; tratar esa etiqueta con cautela.
- El modelo se publica solo en BF16; no hay pesos cuantizados oficiales, lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agbalu/Jugurtha-2-9B
- Modelo predecesor Jugurtha-4B: https://huggingface.co/agbalu/Jugurtha-4B
- Dataset SIB-200: https://huggingface.co/datasets/Davlan/sib200
- Dataset FLORES+: https://huggingface.co/datasets/openlanguagedata/flores_plus
