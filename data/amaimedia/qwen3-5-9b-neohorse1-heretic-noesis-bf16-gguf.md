# AMAImedia/Qwen3.5-9B-NeoHorse1-Heretic-NOESIS-BF16-GGUF

## Resumen

Qwen3.5-9B-NeoHorse1-Heretic-NOESIS es un derivado del modelo NeoHorse-1-9B de TokenRhythm, a su vez post-entrenado sobre Qwen/Qwen3.5-9B, que AMAImedia ha publicado en formato BF16 y GGUF como parte de su plataforma NOESIS de doblaje multilingüe automatizado. El modelo conserva los pesos del ajuste fino de NeoHorse (orientado a uso agéntico, tool calling, código e instrucción) y añade un proceso de abliteration/decensoring aplicado con Heretic v1.4.0, cuyo resultado declarado es una reducción de rechazos de 97/100 a 18/100 con una divergencia KL de 0,0181 respecto al modelo original.

Se trata de un transformer causal denso de 8.953.803.264 parámetros (aproximadamente 9B), publicado con licencia Apache-2.0, con pesos en safetensors (BF16) y GGUF, y con un listado declarado de más de 100 idiomas. El repositorio ocupa 42,9 GB, coherente con la inclusión simultánea de pesos BF16 y varias cuantizaciones GGUF.

Su relevancia actual es doble: por un lado, es un ejemplo de empaquetado "descencerado" reproducible (parámetros de abliteration documentados públicamente); por otro, es un modelo de 9B con soporte declarado de function calling y flujo agéntico que cabe en hardware de consumo, lo que lo hace candidato para despliegues locales con requisitos de privacidad. La información disponible no incluye la longitud de contexto, los detalles del dataset de post-entrenamiento ni resultados de benchmarks de tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (derivado de Qwen3.5-9B, tag `qwen3_5_text`); repack text-only sin pesos de vision |
| Parametros totales | 8.953.803.264 (dato real de safetensors, ~9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (safetensors) y GGUF; los niveles concretos de cuantizacion GGUF no se detallan en la informacion disponible |
| Idiomas soportados | Mas de 100 idiomas declarados en los metadatos, entre ellos en, ru, zh, vi, kk, ja, es, de, fr, it, pt, ar, hi, ko, tr, pl, nl, sv, th, he, uk |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) y GGUF |
| Modelo base | Qwen/Qwen3.5-9B y TokenRhythm/NeoHorse-1-9B |
| Tamano del repositorio | 42,9 GB |
| Fecha de publicacion | 2026-09-07 (release declarado); repo creado el 2026-09-08 y actualizado el 2026-09-12 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de ~9B parámetros heredado de Qwen/Qwen3.5-9B, repaquetado para inferencia exclusivamente de texto: la model card indica explícitamente que se incluyen solo los pesos de lenguaje y que no se incluyen los pesos de visión. El repaqueteado de AMAImedia cambia la configuración y los nombres de las claves de los tensores, pero no los valores de los tensores ajustados. Los tags del repositorio incluyen `mtp` (multi-token prediction), `reasoning`, `distillation`, `sft`, `rl`, `gspo`, `lora-merge` y `dare-ties`, lo que sugiere un pipeline de post-entrenamiento con supervisión, RL (GSPO) y fusiones de adaptadores LoRA mediante DARE-TIES; la información proporcionada no documenta el número de tokens, la composición del dataset ni los detalles de cada etapa.

La innovación diferencial de esta publicación es el proceso de decensoring aplicado con Heretic v1.4.0 sobre el modelo NeoHorse-1-9B. Los parámetros de abliteration están documentados de forma pública, incluyendo el índice de dirección (16,33), los pesos máximos y mínimos aplicados a `attn.o_proj` y `mlp.down_proj`, y sus posiciones y distancias asociadas. El resultado declarado es el siguiente:

| Parametro de abliteration | Valor |
|---|---|
| direction_index | 16,33 |
| attn.o_proj.max_weight | 1,48 |
| attn.o_proj.max_weight_position | 19,08 |
| attn.o_proj.min_weight | 1,46 |
| attn.o_proj.min_weight_distance | 16,49 |
| mlp.down_proj.max_weight | 1,44 |
| mlp.down_proj.max_weight_position | 18,83 |
| mlp.down_proj.min_weight | 1,43 |
| mlp.down_proj.min_weight_distance | 13,39 |

## Capacidades

- Generacion de texto conversacional e instrucciones de proposito general, con modo de razonamiento declarado (`reasoning`).
- Razonamiento matematico y STEM: los tags incluyen `math` y `stem`, asociados al post-entrenamiento de NeoHorse.
- Generacion de codigo y asistencia a programacion (`coding`).
- Tool calling / function calling: soporte declarado mediante los tags `tool-use` y `function-calling`.
- Flujos agenticos y razonamiento multi-paso (`agentic`), con MTP como tag asociado a la arquitectura.
- Multilingue extenso: mas de 100 idiomas declarados, con cobertura amplia de lenguas europeas, asiaticas, africanas y de Oriente Medio.
- Reduccion drastica de rechazos por contenido: 18/100 en la evaluacion declarada, frente a 97/100 del modelo original.
- Inferencia text-only: no procesa imagenes, aunque el modelo base Qwen3.5-9B pudiera tener capacidades multimodales no incluidas en este repaqueteado.
- Capacidades de vision: no disponibles en esta publicacion (los pesos de vision no estan incluidos).
- Capacidades de audio: no disponibles.

## Casos de uso

- Doblaje y localizacion automatizada multilingue: es el proposito declarado del release, dentro de la plataforma NOESIS de AMAImedia. El soporte de mas de 100 idiomas permite generar y adaptar guiones traducidos en pipelines de doblaje, con el modelo como motor de generacion y reescritura de dialogo.
- Atencion al cliente multilingue: con licencia Apache-2.0 y pesos GGUF, se puede desplegar on-premise para gestionar conversaciones multi-turno en varios idiomas sin enviar datos de clientes a APIs externas. La reduccion de rechazos declarada evita que el modelo corte conversaciones por contenido sensible pero legitimo (reclamaciones, salud, legal).
- Agentes con tool calling en produccion: los tags `function-calling`, `tool-use` y `agentic` lo orientan a orquestadores que invocan APIs, consultan bases de datos o ejecutan acciones en sistemas externos, con el modelo decidiendo la secuencia de llamadas.
- Asistente de codigo integrado en IDE o CI/CD: el tag `coding` y el tamano de 9B permiten ejecutarlo en una GPU de gama alta de consumo o en un nodo dedicado para revision de pull requests, generacion de tests y explicacion de diffs.
- Tutoria y resolucion de problemas STEM: los tags `math` y `stem` lo hacen util para generar explicaciones paso a paso de ejercicios, siempre que se validen las respuestas con verificadores externos por el riesgo de alucinacion en calculos.
- Traduccion y localizacion de documentacion tecnica: con mas de 100 idiomas declarados, es adecuado para traducir manuales, notas de version y contenido de producto manteniendo terminologia consistente mediante prompts de sistema.
- Investigacion en seguridad y red teaming: al ser un modelo abliterated con parametros de intervencion documentados, sirve como caso de estudio reproducible para medir el efecto de la abliteration sobre rechazos, calidad y sesgos en un modelo de 9B.
- Generacion de contenido creativo sin filtros excesivos: escritura de ficcion, guiones o narrativa que incluya violencia, temas adultos o lenguaje crudo, donde los modelos alineados de forma agresiva suelen rechazar la peticion.
- Procesamiento de texto sensible en dominios regulados: analisis de informes medicos, expedientes legales o documentacion interna con lenguaje explicito, en despliegue local para cumplir requisitos de confidencialidad.

## Benchmarks y rendimiento

La informacion disponible solo incluye la comparativa de abliteration declarada por el autor; no se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Divergencia KL | 0,0181 | 0 (por definicion) |
| Rechazos | 18/100 | 97/100 |

## Requisitos de hardware

Las estimaciones de VRAM se derivan del recuento de parametros (8,95B) y no proceden de mediciones publicadas por el autor.

- BF16 (pesos completos): aproximadamente 18 GB solo para pesos, mas cache KV; requiere GPU de 24 GB o superior (RTX 3090, RTX 4090, L40S, A100 40 GB, H100).
- Cuantizacion de 8 bits: alrededor de 9-10 GB de pesos; viable en RTX 4080, RTX 4070 Ti Super, RTX 3080 Ti de 16 GB y superiores.
- Cuantizacion de 4 bits: alrededor de 5-6 GB de pesos; cabe en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) con contexto moderado.
- CPU y Apple Silicon: al publicarse en GGUF, es ejecutable con llama.cpp u Ollama en CPU con RAM suficiente (>= 8 GB para Q4) y en chips Apple M-series con memoria unificada de 16 GB o mas.
- Despliegue en servidor: vLLM y TGI son compatibles segun los tags (`text-generation-inference`, `endpoints_compatible`); llama.cpp y Ollama son las opciones naturales para los ficheros GGUF.
- Latencia y throughput: no disponibles. Dependen del backend, la cuantizacion, la longitud de contexto efectiva y el hardware; no se han publicado mediciones.
- Nota de almacenamiento: el repositorio completo ocupa 42,9 GB, por lo que conviene descargar unicamente el fichero de cuantizacion necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AMAImedia/Qwen3.5-9B-NeoHorse1-Heretic-NOESIS | 8,95B | No disponible | Apache-2.0 | safetensors BF16, GGUF | Version abliterated con Heretic v1.4.0; 18/100 rechazos; KL 0,0181 |
| Qwen/Qwen3.5-9B | No disponible | No disponible | No disponible en la informacion | No disponible | Modelo base; sin intervencion de decensoring ni post-entrenamiento agentico de NeoHorse |
| TokenRhythm/NeoHorse-1-9B | 9B (declarado) | No disponible | Apache-2.0 | No disponible | Post-entrenamiento agentico sobre Qwen3.5-9B; referencia funcional del modelo aqui publicado |
| Dingdust/NeoHorse-1-9B-heretic | 9B (declarado) | No disponible | No disponible en la informacion | No disponible | Release heretic previo citado por AMAImedia como origen del proceso |

## Limitaciones y advertencias

- Modelo abliterated: la intervencion sobre las direcciones de rechazo puede degradar la coherencia, aumentar respuestas inseguras o producir contenido inapropiado en dominios sensibles. La KL de 0,0181 indica un cambio pequeno en la distribucion global, pero no garantiza seguridad en casos concretos.
- No esta alineado para uso comercial directo con usuarios finales sin filtros adicionales: requiere moderacion externa si se expone a publico general.
- Riesgo de alucinacion: como cualquier modelo de 9B, puede inventar hechos, APIs y referencias; no se han publicado evaluaciones de factualidad.
- Sin datos de contexto: se desconoce la ventana maxima soportada, lo que impide planificar casos de contexto largo sin medirla empiricamente.
- Modelo text-only en este repaqueteado: no procesa imagenes ni audio, a diferencia de lo que podria ofrecer el modelo base completo.
- Cobertura multilingue desigual: el listado de mas de 100 idiomas procede de los metadatos y no se acompana de evaluaciones por idioma; el rendimiento en lenguas de bajos recursos es incierto.
- Trazabilidad: la model card mezcla contenido del release de AMAImedia con contenido de TokenRhythm, y no documenta el dataset, el numero de tokens ni el proceso completo de post-entrenamiento de NeoHorse.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos base (Qwen3.5-9B) y de los derivados citados antes de redistribuir.
- La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo (unicamente resultados sin relacion), por lo que no hay validacion externa independiente de sus capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AMAImedia/Qwen3.5-9B-NeoHorse1-Heretic-NOESIS-BF16-GGUF
- Modelo base original: https://huggingface.co/TokenRhythm/NeoHorse-1-9B
- Release heretic previo: https://huggingface.co/Dingdust/NeoHorse-1-9B-heretic
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio GitHub de NeoHorse: https://github.com/TokenRhythm/NeoHorse
- Informe tecnico de NeoHorse (PDF): https://github.com/TokenRhythm/NeoHorse/blob/main/TechnicalReport_NeoHorse_v1.pdf
- Organizacion TokenRhythm en HuggingFace: https://huggingface.co/TokenRhythm
- Sitio de TokenRhythm: https://tokenrhythm.ai/
- Proyecto Heretic: https://heretic-project.org
- Organizacion AMAImedia: https://AMAImedia.com
- X/Twitter de AMAImedia: https://x.com/AMAImediacom
- LinkedIn del fundador (Ilia Bolotnikov): https://www.linkedin.com/in/ilia-bolotnikov
- Telegram del fundador: https://t.me/djbionicl
- X/Twitter de TokenRhythm (OpenSquilla): https://x.com/opensquilla
