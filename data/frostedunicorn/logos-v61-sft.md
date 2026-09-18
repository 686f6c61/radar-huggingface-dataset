# frostedunicorn/logos-v61-sft

## Resumen

Logos v6.1-SFT es un modelo de lenguaje de tipo decoder-only especializado en textos religiosos abrahamicos, desarrollado por el usuario frostedunicorn (dtfrost5) y publicado en HuggingFace el 17 de septiembre de 2026. Se trata de un ajuste fino mediante QLoRA sobre Qwen2.5-7B-Instruct, con 7.615.616.512 parametros (unos 7,62 mil millones) y una ventana de contexto de 32.000 tokens heredada del modelo base. Cubre cinco idiomas: arabe, hebreo, griego, latin e ingles.

El modelo se distribuye con la etiqueta explicita de "research alpha" y esta pensado como banco de pruebas para investigacion sobre recuperacion, cita y comparacion de textos sagrados (Coran, Biblia hebrea, Septuaginta, Talmud, Mishnah, Hadith, Tafsir y Vulgata). La model card declara un total de 130.000 versiculos para el entrenamiento base, 30.000 muestras de instrucciones y 8.200 ejemplos adicionales de formato de cita.

Su relevancia actual es acotada y conviene ser honesto al respecto: la propia model card documenta una tasa de alucinacion del 50 por ciento, una precision de cita del 20 por ciento y un recall exacto de versiculos del 0 por ciento, lo que lo invalida para produccion factual. Su interes es metodologico: muestra como un ajuste QLoRA de bajo rango sobre un modelo generalista de 7B puede elevar competencias muy especificas (gramaticalidad arabe clasica, conocimiento inter-tradiciones) sin dotar al modelo de memorizacion literal del corpus, lo que refuerza la tesis de que estos sistemas necesitan RAG para citas verbatim.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only denso, sin MoE) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,62 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.000 tokens (segun metadatos del GGUF base) |
| Tipos de cuantizacion | Entrenamiento en QLoRA 4-bit; pesos publicados en float16. No se listan cuantizaciones GGUF precalculadas en el repositorio; la model card documenta la conversion a Ollama mediante Modelfile |
| Idiomas soportados | Arabe (ar), ingles (en), hebreo (he), griego (el), latin (la) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float16), adaptadores LoRA fusionados en el modelo base |

Datos adicionales: tamano del repositorio 15,2 GB; libreria transformers; pipeline text-generation; compatible con text-generation-inference y endpoints; 0 descargas y 0 likes en el momento de la consulta; creado el 17 de septiembre de 2026 y actualizado el mismo dia.

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y atencion con sesgo QKV. No hay innovaciones de arquitectura propias del ajuste; el autor no modifica el backbone ni introduce atencion lineal, decodificacion especulativa ni capas SSM. El contexto de 32.000 tokens procede del modelo base.

El entrenamiento se hizo en tres fases declaradas. Primero, un entrenamiento de modelo de lenguaje base de 3 epocas sobre un corpus multilingue de 130.000 versiculos: 6.050 del Coran en arabe uthmani, 18.155 de la Biblia hebrea (Westminster Leningrad Codex), 29.107 de la Septuaginta, 10.919 del Talmud Bavli (edicion Rodkinson de 1918 y Sefaria), aproximadamente 63.000 de hadices en traduccion inglesa (Bukhari, Muslim, Abu Dawud, Tirmidhi, Ibn Majah y Nasai), unos 16.000 de tafsir (Ibn Kathir, Siraj y Jalalayn), 4.192 de la Mishnah y 35.809 de la Vulgata. Despues, un SFT sobre 30.000 pares pregunta-respuesta que cubren recuerdo de versiculos, comparacion entre tradiciones, busqueda de citas, explicacion de tafsir y comprension multilingue. Por ultimo, una epoca adicional de "citation SFT" sobre 8.200 ejemplos de formato de cita (Surah X:Y, Libro Capitulo:Versiculo, tractado y pagina).

La tecnica de ajuste es QLoRA en 4 bits con rango r=32, alpha=64 y dropout de 0,1. Los adaptadores LoRA de SFT y de citation SFT se fusionaron en el modelo base y se publicaron en float16. La perdida de entrenamiento declarada es 0,421. No se menciona RLHF, DPO ni preferencia humana en ninguna fase.

## Capacidades

- Generacion de texto conversacional en los cinco idiomas declarados (arabe, hebreo, griego, latin, ingles).
- Recuerdo y reproduccion de contenido religioso a nivel de tema, no de texto literal: el recall exacto de versiculos es 0,000.
- Conocimiento inter-tradiciones: la evaluacion propia reporta 0,817 en preguntas sobre Moises, Pablo o el Coran.
- Gramaticalidad y fluidez en arabe clasico: 1,000 en deteccion de terminaciones casuales y 1,000 en ratio de caracteres arabes.
- Diacritizacion arabe (tashkeel) con F1 de 0,679, por debajo de grado academico.
- Formato de citas estructuradas (Surah:ayah, libro:capitulo:versiculo, tractado y pagina), aunque con precision medida de solo 0,200.
- Seguimiento de plantilla de chat tipo ChatML con soporte de rol de sistema.
- Deteccion de preguntas trampa a nivel de azar (0,500), segun su propia metrica de hallucination detection.
- No hay evidencia declarada de soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Investigacion academica sobre alineacion de textos sagrados: el modelo puede generar hipotesis de correspondencia tematica entre tradiciones (por ejemplo, paralelos entre legislacion deuteronomica y derecho talmudico) que el investigador verifica despues contra fuentes primarias. Es adecuado porque su punto fuerte medido es precisamente el conocimiento inter-tradiciones (0,817).
- Generacion de borradores de preguntas de evaluacion para datasets de RAG religioso: dado que el recall literal es cero, el modelo sirve como generador de consultas y distractores, no como fuente de respuestas. Las respuestas verbatim se obtienen del recuperador.
- Etiquetado y normalizacion de referencias bibliograficas sagradas: se puede usar para proponer el formato Surah:ayah o libro:capitulo:versiculo en un corpus desestructurado, con validacion humana obligatoria dado el 0,200 de precision medida.
- Experimentos de diacritizacion arabe asistida: con F1 de 0,679 sobre tashkeel, es util como preanotador en pipelines donde un revisor humano corrige las vocales breves, reduciendo coste frente a la anotacion desde cero.
- Evaluacion comparativa de metodos de ajuste parametrizado eficiente: al ser un QLoRA r=32 publicado con metricas por categoria, sirve como caso de estudio reproducible de que cabe esperar (y que no) de un SFT de bajo rango sobre 130.000 versiculos.
- Traduccion y transliteracion asistida entre latin, griego y hebreo en contextos patristicos y biblicos, con revision obligatoria, aprovechando que el modelo base ya era multilingue y el ajuste anadio registros clasicos.
- Base para un sistema RAG de consulta documental en bibliotecas teologicas: el modelo actua como capa de reformulacion y sintesis sobre pasajes recuperados, nunca como memoria del texto.
- Prototipado de asistentes de estudio comparado de religion en entornos educativos, con avisos explicitos de que no emite consejo religioso ni interpretacion autoritativa.

## Benchmarks y rendimiento

Los unicos datos disponibles son la evaluacion interna del autor (v6.1-SFT, semilla 42, decodificacion greedy, fecha 2026-09-17). No hay resultados publicados en benchmarks estandar como MMLU, HumanEval, GSM8K, ARC o TruthfulQA.

| Categoria | Puntuacion | Notas |
|---|---|---|
| Media global | 0,506 | Alpha de investigacion |
| Conocimiento inter-tradiciones | 0,817 | Hechos sobre Moises, Pablo, Coran |
| Gramaticalidad arabe | 1,000 | Deteccion de terminaciones casuales |
| Fluidez arabe clasica | 1,000 | Ratio de caracteres arabes |
| F1 de diacriticos arabes | 0,679 | Precision de tashkeel |
| Deteccion de alucinaciones | 0,500 | Preguntas trampa |
| Referencia talmudica | 0,410 | Busqueda de tractado y pagina |
| Precision de citas | 0,200 | Surah:ayah, libro:capitulo:versiculo |
| Recall exacto de versiculos | 0,000 | Depende de RAG, no de memorizacion |
| Solapamiento de tafsir | 0,005 | Solapamiento con comentario exegetico |

No se dispone de comparaciones con otros modelos en estas mismas categorias, por lo que no es posible establecer una tabla comparativa de rendimiento fiable.

## Requisitos de hardware

- VRAM para inferencia en float16: aproximadamente 15,3 GB solo de pesos, mas cache KV. Con 32.000 tokens de contexto la cache KV puede anadir varios GB, por lo que conviene reservar 24 GB o mas para uso con contexto largo.
- VRAM en 8 bits: aproximadamente 8 GB de pesos, manejable en tarjetas de 12-16 GB con contexto moderado.
- VRAM en 4 bits (Q4_K_M): aproximadamente 4,5-5 GB de pesos; cabe en GPUs consumer de 8 GB con contexto corto.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB y L40S 48 GB para produccion con contexto completo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para fp16 con contexto recortado; RTX 4070 Ti, 4080 o equivalentes de 12-16 GB para 8 bits; RTX 3060 12 GB, 4060 Ti 16 GB o Apple Silicon con memoria unificada de 16 GB o mas para cuantizaciones de 4-5 bits.
- Cabe en GPU consumer: si, en fp16 en tarjetas de 24 GB, y en cuantizacion de 4 bits en tarjetas de 8 GB o superiores.
- Opciones de despliegue: transformers con device_map automatico (documentado en la model card), text-generation-inference y endpoints de HuggingFace (etiquetas declaradas), Ollama mediante Modelfile (documentado), vLLM y llama.cpp como alternativas estandar para este backbone aunque no se mencionan explicitamente en la model card.
- Latencia y throughput estimados: no disponible. La model card no publica mediciones de tokens por segundo ni latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| logos-v61-sft | 7,62 mil millones | 32.000 tokens | Apache 2.0 | HuggingFace, 0 descargas | Especializado en textos abrahamicos, alpha de investigacion, metricas internas pobres en cita y recall |
| Qwen2.5-7B-Instruct | 7,62 mil millones | 32.000 tokens nativos, ampliable a 131.072 con YaRN | Apache 2.0 | Ampliamente disponible | Modelo base del anterior; generalista, sin datos publicos de especializacion religiosa |
| Llama-3.1-8B-Instruct | 8,03 mil millones | 131.072 tokens | Licencia comunitaria de Llama 3.1 | Ampliamente disponible | Mayor contexto, pero licencia con restricciones para algunos usos y sin especializacion religiosa |
| Mistral-7B-Instruct-v0.3 | 7,25 mil millones | 32.000 tokens | Apache 2.0 | Ampliamente disponible | Alternativa generalista de tamano comparable, sin soporte declarado de griego o latin clasicos |

No se dispone de comparaciones de rendimiento entre estos modelos y logos-v61-sft en las categorias evaluadas por el autor, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Tasa de alucinacion del 50 por ciento declarada por el propio autor en preguntas trampa; es un valor inaceptable para consultas factuales en produccion.
- Precision de citas del 20 por ciento: el formato Surah:ayah y libro:capitulo:versiculo es inconsistente.
- Recall exacto de versiculos del 0 por ciento: el modelo no ha memorizado el texto de los versiculos y depende de RAG para cualquier cita verbatim. Cualquier salida que parezca una cita literal debe verificarse.
- Solapamiento con tafsir de 0,005: el modelo no ha aprendido material exegetico, y requiere DPO o entrenamiento especifico segun el autor.
- Diacritizacion arabe con F1 de 0,679: util como preanotacion, no apta para uso academico sin revision.
- Referencia talmudica con 0,410: la localizacion de tractado y pagina es poco fiable.
- La model card prohibe explicitamente el uso para consejo religioso, generacion de fatwa o interpretacion escrituraria autoritativa; el modelo se marca como "research use only".
- Etiqueta "research-alpha": no hay garantia de estabilidad, soporte ni mantenimiento. El repositorio registra 0 descargas y 0 likes, sin comunidad que haya validado las capacidades declaradas.
- Sesgos: el corpus mezcla fuentes de dominio publico (Rodkinson 1918, traducciones victorianas al ingles) y fuentes de Sefaria con licencias CC-BY y CC-BY-SA; las traducciones historicas pueden introducir sesgos de traduccion, sesgo de seleccion de escuelas exegeticas (Ibn Kathir, Siraj, Jalalayn son solo tres tafsires) y desequilibrio entre tradiciones en volumen de datos, con el hadiz en ingles dominando el corpus.
- Limitaciones de idioma: aunque se declaran cinco idiomas, no se publican evaluaciones por idioma fuera del arabe; el rendimiento en hebreo, griego y latin no esta medido.
- Licencia del modelo Apache 2.0, pero las fuentes de datos tienen licencias heterogeneas: los textos de Sefaria son CC-BY o CC-BY-SA y requieren atribucion, y las traducciones de hadices son CC-BY o CC-BY-SA en diversos grados. La redistribucion o el uso comercial derivado exige revisar la cadena de licencias de los datos, algo que la licencia Apache 2.0 de los pesos no cubre por si sola.
- Citas de la propia model card: el autor firma como dtfrost5 en el BibTeX, mientras el repositorio cuelga de la cuenta frostedunicorn; conviene verificar la atribucion antes de citar.
- Fechas de creacion y evaluacion (17 de septiembre de 2026) y referencias a un GGUF base cuyo repositorio no se enlaza en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/frostedunicorn/logos-v61-sft
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- La busqueda web realizada no devolvio ningun resultado relevante para este modelo: los enlaces obtenidos correspondian a paginas de soporte de Microsoft sin relacion con el modelo. No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
