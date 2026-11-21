# llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic-GGUF

## Resumen

`llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic-GGUF` es una versión decensurada (abliterated) del modelo multimodal `google/gemma-4-E4B-it` de Google, distribuida en formato GGUF por el contribuidor independiente llmfan46. El objetivo declarado es reducir drásticamente las negativas del modelo original (de 99/100 a 3/100 en el conjunto de evaluación del autor) manteniendo la calidad base, con una divergencia KL de 0,0076 respecto al modelo de partida. La ablación se realizó con la herramienta Heretic v1.2.0 aplicando el método Arbitrary-Rank Ablation (ARA) sobre las capas 7 a 36 y sobre el componente `attn.o_proj`.

El modelo conserva la pipeline `any-to-any` y la capacidad `image-text-to-text` del Gemma 4 original, por lo que mantiene entrada multimodal (texto e imagen) y salida de texto. Cuenta con 7.518.069.290 parámetros totales según los tensores en safetensors del modelo base, y se distribuye con licencia Apache 2.0 (con enlace adicional a la licencia de Gemma 4 de Google). El repositorio GGUF ocupa 47,1 GB e incluye cuantizaciones desde BF16 hasta Q4_K_M, además de un proyector de visión independiente.

Su relevancia actual radica en dos factores: por un lado, ofrece una alternativa con muchas menos restricciones de contenido sobre una arquitectura Gemma 4 reciente; por otro, la metodología Heretic/ARA permite comparar de forma cuantificable el coste en calidad (KL y benchmarks) de eliminar el comportamiento de rechazo. Es un modelo pensado para investigación sobre alineamiento, evaluación de sesgos y aplicaciones donde las negativas del modelo base resultan un obstáculo, no para despliegues comerciales sensibles sin revisión adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de `google/gemma-4-E4B-it`); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M (y proyector de vision en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo es una ablación del Gemma 4 E4B instruct de Google. No se ha reentrenado: la modificación consiste en una edición de pesos mediante *abliteration* con Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA). Los parámetros de la ablación publicados son: `start_layer_index` = 7, `end_layer_index` = 36, `preserve_good_behavior_weight` = 0,5783, `steer_bad_behavior_weight` = 0,0001, `overcorrect_relative_weight` = 0,9986 y `neighbor_count` = 15. El único componente objetivo declarado es `attn.o_proj`.

La arquitectura subyacente es la del Gemma 4 E4B, un transformer multimodal con capacidad image-text-to-text, pero la model card no detalla el número de capas, la dimensión oculta, el tipo de atención ni la composición del dataset de entrenamiento original. Tampoco se documenta si el Gemma 4 base usó RLHF, DPO u otra técnica de alineamiento; solo se indica que la ablación busca eliminar el comportamiento de rechazo aprendido. La innovación técnica destacable es precisamente el pipeline Heretic/ARA, que permite medir el compromiso entre reducción de negativas y preservación de capacidades mediante divergencia KL y benchmarks estandarizados.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del Gemma 4 E4B instruct.
- Entrada multimodal imagen-texto (pipeline `any-to-any`, tag `image-text-to-text`), con proyector de visión separado en el repo GGUF.
- Razonamiento de sentido común y conocimiento general, evaluado por el autor con PIQA y MMLU.
- Reducción drástica de rechazos: 3/100 negativas frente a 99/100 del modelo original en el conjunto de prueba del autor.
- Capacidad de seguir instrucciones con menor tendencia a sermonear, suavizar o desviar respuestas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (el modelo base Gemma suele ser multilingüe, pero no se confirma en esta ficha).
- Modo thinking explícito, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y abliteration: permite comparar el comportamiento del Gemma 4 E4B original con su versión ablacionada usando las métricas publicadas (KL 0,0076, PIQA 85,85 % frente a 86,02 %, MMLU 68,60 % frente a 69,46 %) para estudiar el coste de eliminar los rechazos.
- Evaluación de sesgos y robustez: al reducirse las negativas, el modelo expone con más frecuencia respuestas que el original filtraría, lo que facilita auditar contenido sensible en entornos controlados de investigación.
- Generación creativa sin fricción: escritura de ficción, guiones o narrativa con temáticas adultas o controvertidas donde el modelo base rechazaría peticiones legítimas.
- Asistente conversacional especializado en dominios sensibles (salud, legal, seguridad): útil cuando el modelo base añade advertencias o derivaciones no deseadas, siempre con revisión humana y políticas de uso claras.
- Procesamiento de documentos con imágenes: gracias a la pipeline image-text-to-text y al proyector de visión incluido, puede extraer y comentar información de capturas, diagramas o documentos escaneados en local.
- Despliegue local con llama.cpp u Ollama: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en equipos de consumo, útil para prototipos y pruebas de concepto sin depender de la nube.
- Análisis de conversaciones y moderación inversa: estudiar qué tipo de peticiones generan negativas en modelos alineados y cómo se comporta un modelo ablacionado ante ellas.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Benchmark | Modelo original (gemma-4-E4B-it) | Este modelo (Heretic/ARA) |
|---|---|---|
| MMLU (14.042 preguntas) | 69,46 % (9.753 correctas) | 68,60 % (9.633 correctas) |
| PIQA (1.838 preguntas) | 86,02 % (1.581 correctas) | 85,85 % (1.578 correctas) |
| Rechazos (conjunto del autor) | 99/100 | 3/100 |
| Divergencia KL vs. original | 0 (por definición) | 0,0076 |

Desglose MMLU por asignaturas (original → Heretic): professional_law 52,87 % → 52,67 %; moral_scenarios 43,91 % → 41,23 %; miscellaneous 81,61 % → 82,12 %; professional_psychology 75,16 % → 73,86 %; high_school_psychology 89,17 % → 90,09 %; high_school_macroeconomics 72,82 % → 71,28 %; elementary_mathematics 65,87 % → 63,76 %; moral_disputes 68,21 % → 69,08 %; prehistory 75,31 % → 75,00 %; philosophy 70,74 % → 70,74 %.

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMLU-Pro, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7.518 millones de parámetros, en Q4_K_M se estima alrededor de 4,5–5,5 GB de pesos más overhead de contexto y proyector de visión; en Q5_K_M en torno a 5,5–6,5 GB; en Q6_K aproximadamente 6,5–7,5 GB; en Q8_0 cerca de 8–9 GB; en BF16 unos 15–16 GB.
- GPU recomendadas: para BF16, una RTX 4090 (24 GB) o A100/H100; para Q8_0, una RTX 4080/4090 o GPU de 12–16 GB; para Q4_K_M, una RTX 3060 de 12 GB o superior.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con cuantizaciones Q4_K_M a Q8_0; en GPUs de 8 GB conviene usar Q4_K_M con contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (gemma-4-E4B-it ultra-uncensored heretic GGUF) | 7.518 M | no disponible | 68,60 % | Apache 2.0 | GGUF |
| google/gemma-4-E4B-it (original) | 7.518 M | no disponible | 69,46 % | Gemma 4 license | safetensors |
| llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic (base de esta cuantización) | 7.518 M | no disponible | no disponible | Apache 2.0 | safetensors |

No se dispone de datos de otros modelos comparables de la misma categoría (por ejemplo, otras variantes abliterated de Gemma o modelos multimodales de ~7-8B) en la información proporcionada; por tanto, esa comparación se indica como no disponible.

## Limitaciones y advertencias

- La ablación elimina parte del comportamiento de rechazo del modelo original, lo que puede hacer que genere contenido dañino, ilegal o éticamente problemático sin las salvaguardas habituales. No debe desplegarse en producción orientada al público sin filtros y moderación adicionales.
- El propio autor reporta una caída de calidad medible: MMLU baja 0,86 puntos y PIQA 0,17 puntos respecto al original; la divergencia KL de 0,0076 indica que los pesos se han modificado de forma no trivial.
- La mayor tasa de respuestas sin filtro aumenta el riesgo de alucinación en temas sensibles, ya que el modelo puede afirmar con seguridad contenido que el original habría rechazado o matizado.
- El método ARA actúa solo sobre `attn.o_proj` en las capas 7–36; la efectividad de la ablación puede ser desigual entre tipos de peticiones y no garantiza la eliminación total de negativas.
- La licencia declarada es Apache 2.0, pero se enlaza también la licencia de Gemma 4 de Google; conviene revisar ambas antes de un uso comercial, ya que los términos de Gemma pueden imponer restricciones adicionales.
- No se documentan los idiomas soportados ni la longitud de contexto; no se debe asumir el contexto del Gemma 4 original sin verificarlo.
- El repositorio ocupa 47,1 GB y el autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face, lo que puede afectar a la disponibilidad futura de archivos o actualizaciones.
- El modelo base no documenta en esta ficha el proceso de alineamiento original (RLHF/DPO), por lo que no se puede caracterizar con precisión qué comportamiento se ha eliminado.
- El uso de un modelo "uncensored" puede incumplir políticas de plataformas, proveedores cloud o marcos regulatorios; es responsabilidad del desplegador evaluar el cumplimiento normativo.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic-GGUF
- Modelo base de esta cuantización: https://huggingface.co/llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-4-E4B-it
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Pull request del método ARA: https://github.com/p-e-w/heretic/pull/211
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
