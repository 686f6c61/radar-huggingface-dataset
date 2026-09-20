# kataguru/Qwen3.8-27B-TWIN-TURBO-Fable-Finnish-W4A16-AWQ

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Finnish-W4A16-AWQ es una cuantización AWQ de 4 bits publicada por el usuario kataguru sobre el modelo DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored. Se trata de un modelo de generación de texto de 27.781.427.952 parámetros (27,78 B) derivado de la familia Qwen3.5 según las etiquetas del repositorio (qwen3_5, qwen3.5), con soporte nativo de predicción multi-token (MTP) y un template de chat específico para finés con niveles de razonamiento configurables.

Su valor diferencial no está en el entrenamiento, sino en el proceso de cuantización: en lugar de reutilizar una calibración en inglés, el autor calibró el AWQ con 256 muestras multiturno en finés que cubren narrativa, prosa técnica, IT/Linux, filosofía y narrativa erótica sin censura. El objetivo declarado es corregir la degradación de calidad que la cuantización puramente anglosajona provoca en morfología y vocabulario finlandeses, manteniendo además un rendimiento bilingüe finés-inglés.

El modelo se distribuye en formato compressed-tensors para vLLM, conserva en BF16 las capas críticas (lm_head, la proyección de entrada de atención lineal GDN y todas las capas MTP) y está etiquetado como uncensored: no emite avisos, sermones ni meta-comentarios. Es relevante ahora para quien necesite un modelo de 27 B desplegable en hardware relativamente modesto con contexto muy largo y buen comportamiento en finés, aunque carece por completo de validación comunitaria (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 con capas de atención lineal GDN y capas MTP (según model card y etiquetas qwen3_5/qwen3.5); la model card no detalla el número de capas ni la configuración de atención |
| Parametros totales | 27.781.427.952 (27,78 B), dato real de safetensors |
| Parametros activos | No aplica: no se indica que el modelo sea MoE (no disponible si existe una variante dispersa) |
| Longitud de contexto | 262.144 tokens según la configuración recomendada de vLLM (`--max-model-len 262144`); no se documenta un valor arquitectónico distinto |
| Tipos de cuantizacion | AWQ W4A16 (compressed-tensors), int4 con tamaño de grupo 128; `lm_head`, `in_proj` de atención lineal GDN y `mtp.*` conservados en BF16 (`model-nonquant.safetensors`) |
| Idiomas soportados | Finés (fi) e inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con esquema compressed-tensors (más `model-nonquant.safetensors` para las capas no cuantizadas) |
| Autor | kataguru |
| Modelo base | DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored |
| Tamaño del repositorio | 19,6 GB |
| Pipeline | text-generation (conversational) |
| Fecha de publicación | 2026-09-20 |

## Arquitectura y entrenamiento

No hay información sobre un entrenamiento propio: este repositorio es exclusivamente una cuantización del modelo base de DavidAU, del que no se documentan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF o DPO. Lo que sí se explicita es que la arquitectura del modelo base combina mecanismos propios de la familia Qwen3.5 con capas de atención lineal GDN (la model card no desarrolla la sigla) y con capas de predicción multi-token (MTP) que se mantienen intactas en BF16 tras la cuantización, lo que permite usarlas como cabezas especulativas nativas.

La innovación técnica del repositorio es doble. Por un lado, la calibración de la cuantización AWQ (herramienta `llm-compressor`, aplicada directamente sobre los pesos BF16 de origen) se hizo con 256 muestras multiturno en finés de dominios diversos: literatura, texto factico, IT/Linux, filosofía y narrativa erótica sin censura. Esta calibración busca preservar los casos morfológicos y el vocabulario finlandés que una calibración en inglés degrada. Por otro, el autor añade un template de chat en finés con conmutadores de razonamiento en el propio prompt (`{REASON:low}`, `{REASON:medium}`, `{REASON:xhigh}`, `{REASON:spoon}` con un protocolo de 7 fases multi-experto, y `{REASON:einstein}` con 10 perspectivas de Sternberg orientadas a ideación creativa); por defecto el modelo responde de forma directa, sin cadenas de pensamiento largas.

## Capacidades

- Generación de texto y conversación multiturno en finés e inglés, con calidad declarada equivalente en ambos idiomas.
- Razonamiento con niveles de esfuerzo configurables mediante el prefijo `{REASON:...}` del template de chat; el modo por defecto es respuesta directa sin bucle de pensamiento.
- Predicción multi-token (MTP) nativa, utilizable como decodificación especulativa en vLLM mediante `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`.
- Tool calling y function calling: la receta de vLLM incluye `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`, y un parser de razonamiento `qwen3`.
- Escritura creativa y narrativa extensa, incluida ficción erótica, sin disclaimers, sermones ni metacomentarios al final del texto (modelo etiquetado como uncensored).
- Redacción de prosa técnica y de ensayo, con calibración específica sobre material IT/Linux y filosófico en finés.
- Manejo de contextos muy largos en despliegue (hasta 262.144 tokens según la configuración recomendada), con caché KV en FP8 y prefill troceado.
- Capacidades de visión: no disponibles. La receta de vLLM incluye `--limit-mm-per-prompt '{"image":99}'`, lo que sugiere soporte multimodal en el modelo base, pero la model card no documenta ninguna capacidad de imagen ni audio para esta versión.
- Capacidades de agente multi-paso: no documentadas explícitamente; solo se acredita la infraestructura de tool calling en vLLM.

## Casos de uso

- Atención al cliente en finés: el modelo puede mantener conversaciones multiturno con contexto largo (hasta 262.144 tokens en la configuración recomendada), lo que permite adjuntar historiales completos de incidencias o documentación de producto sin trocear.
- Localización y traducción finés-inglés: al estar calibrado con corpus finlandés real y conservar buen rendimiento en inglés, es adecuado para traducir documentación técnica y marketing entre ambos idiomas manteniendo morfología y terminología.
- Generación de código y asistentes de IT/Linux: la calibración incluye material IT/Linux y la receta de vLLM habilita tool calling con el parser `qwen3_coder`, lo que permite integrarlo en asistentes de terminal o pipelines de revisión de código.
- Redacción editorial y periodística en finés: con el modo por defecto (respuesta directa) y `{REASON:medium}` para análisis estructurado, sirve para producir borradores de artículos, resúmenes ejecutivos y notas de prensa en finés.
- Investigación y análisis documental: `{REASON:spoon}` activa un protocolo de 7 fases con panel virtual y revisión, útil para descomponer problemas técnicos complejos o auditar supuestos en informes largos.
- Ideación creativa y naming: `{REASON:einstein}` genera un abanico amplio de perspectivas divergentes antes de converger, aplicable a sesiones de brainstorming de producto o campañas.
- Escritura de ficción sin restricciones: el modelo está diseñado explícitamente para narrativa adulta y erótica en finés sin advertencias ni metacomentarios, un nicho que los modelos alineados estándar rechazan.
- Red teaming y evaluación de seguridad: su carácter uncensored lo hace útil como generador de contenido adversario controlado para probar filtros y clasificadores propios, siempre en entornos aislados.
- Despliegue de bajo coste en producción: con pesos int4 de 19,6 GB, puede servirse con vLLM en configuraciones de 2 GPU y alcanzar más de 125 tokens/s, según las mediciones del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única tabla publicada mide latencia y velocidad en una configuración concreta: 2 GPU con tensor parallelism = 2, caché KV en FP8 y vLLM 0.29.0 o superior.

| Tarea | Velocidad (tok/s) | Tiempo medio de respuesta |
|---|---|---|
| Respuesta factual corta (TTFT) | no aplica | 0,27 s |
| Texto creativo de longitud media | ~88 tok/s | 0,89 s |
| Prosa factica larga / ensayo | 126 tok/s | 2,97 s (375 tokens) |
| Ficción erótica | 110 tok/s | 2,72 s (300 tokens) |

El autor indica además que la decodificación especulativa MTP (`num_speculative_tokens=3`) supera los 125 tokens/s con TP=2 y reduce el TTFT hasta aproximadamente 0,27 s. No se proporcionan comparaciones de calidad frente a otros modelos ni frente al modelo base sin cuantizar.

## Requisitos de hardware

- VRAM para pesos: el repositorio ocupa 19,6 GB, por lo que se necesitan aproximadamente 20 GB solo para los pesos en int4 más las capas en BF16 no cuantizadas.
- Memoria para caché KV: no disponible. Con contexto de hasta 262.144 tokens, incluso con caché FP8 el consumo agregado supera ampliamente el de los pesos; el autor no publica cifras.
- GPU recomendadas: la receta oficial asume 2 GPU con tensor parallel 2 (perfil tipo A100 40/80 GB, H100 o GPUs de 24-32 GB emparejadas). El autor no especifica el modelo exacto de GPU empleado.
- GPU de consumo: es plausible ejecutarlo en una sola GPU de 24 GB (RTX 4090, RTX 3090) o 32 GB (RTX 5090) con los pesos, pero con contexto muy recortado respecto a los 262.144 tokens; no hay mediciones publicadas para este escenario.
- Opciones de despliegue: vLLM es la vía soportada y documentada, con el esquema compressed-tensors. No se distribuyen pesos GGUF, por lo que llama.cpp, Ollama y LM Studio no pueden cargar el repositorio tal cual. TGI no está documentado para este formato en la información disponible.
- Parámetros de servicio recomendados por el autor: `--gpu-memory-utilization 0.92`, `--kv-cache-dtype fp8`, `--enable-chunked-prefill`, `--max-num-batched-tokens 8192`, `--max-num-seqs 16`, temperatura 0,6 y top_p 0,95.
- Throughput y latencia medidos: 126 tok/s en prosa larga, 110 tok/s en ficción, ~88 tok/s en texto creativo medio y TTFT de 0,27 s con TP=2 y speculative MTP activo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. La única comparación documentable es contra el modelo del que deriva.

| Modelo | Parámetros | Cuantización | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-TWIN-TURBO-Fable-Finnish-W4A16-AWQ (este) | 27,78 B | AWQ W4A16, int4 grupo 128, capas MTP en BF16 | 262.144 tokens según receta vLLM | fi, en | apache-2.0 | 0 descargas, 0 likes; repo de 19,6 GB |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored (base) | no disponible en la información | BF16 | no disponible | no disponible | no disponible | No se han consultado sus métricas |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible | No identificadas en la información disponible |
| Alternativas de la misma categoría (27-32 B multilingües) | no disponible | no disponible | no disponible | no disponible | no disponible | No se han encontrado datos en la búsqueda web realizada |

Los resultados de la búsqueda web incluidos en la consulta no contienen información relevante sobre este modelo ni sobre alternativas comparables, por lo que no se pueden aportar cifras de MMLU, HumanEval u otros benchmarks frente a terceros.

## Limitaciones y advertencias

- Modelo uncensored: el autor declara explícitamente la ausencia de avisos legales, sermones y metacomentarios. Puede generar contenido adulto, sensible o dañino sin filtros, algo inaceptable en despliegues orientados a público general sin una capa de moderación propia.
- Riesgo de alucinación: no hay evaluación publicada de factualidad ni de tasas de alucinación; el ajuste orientado a ficción y prosa creativa no garantiza rigor factico.
- Idiomas limitados a finés e inglés: no se documenta soporte para castellano ni para otras lenguas, por lo que su uso en español no está validado y probablemente degrade la calidad.
- Calibración asimétrica: la cuantización se calibró con 256 muestras en finés. En inglés el autor afirma que el rendimiento se ha probado y es correcto, pero no aporta métricas que respalden esa afirmación ni descarta pérdida de calidad en dominios no cubiertos.
- Contexto real no verificado: los 262.144 tokens provienen de la configuración recomendada de vLLM, no de una evaluación de recuperación de información a esa distancia. El contexto efectivo puede ser inferior.
- Licencia: el repositorio declara apache-2.0, pero al ser una cuantización de un merge de terceros (DavidAU) con nombre que referencia Qwen, conviene verificar la cadena de licencias del modelo base antes de un uso comercial.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, publicada y actualizada el mismo día, sin issues ni discusiones que permitan contrastar la calidad declarada.
- Sin pesos GGUF: la única vía documentada es vLLM, lo que excluye despliegues en CPU, en Ollama o en llama.cpp sin una conversión manual adicional.
- Capas no cuantizadas: `lm_head`, `in_proj` de atención lineal GDN y `mtp.*` permanecen en BF16, de modo que el ahorro de memoria es menor que el de una cuantización int4 completa y el repositorio sigue ocupando 19,6 GB.
- Posible multimodalidad no documentada: la receta incluye límites por prompt para imagen, pero la model card no describe capacidades de visión, así que no deben asumirse.
- Sin datos de sesgo: no se ha publicado ninguna evaluación de sesgos demográficos, culturales o lingüísticos, ni del impacto de la calibración temática (incluida narrativa erótica) sobre el comportamiento general.

## Enlaces

- Página de HuggingFace del modelo: https://huggingface.co/kataguru/Qwen3.8-27B-TWIN-TURBO-Fable-Finnish-W4A16-AWQ
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Repositorios de herramientas citadas en la model card: `llm-compressor` (calibración AWQ) y vLLM 0.29.0 o superior (servido). No se incluyen URL directas en la información proporcionada.
- Paper, blog o demo adicionales: no disponibles. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
