# mradermacher/gemma-3-12b-it-vl-Kimi-V2-Heretic-Uncensored-Thinking-GGUF

## Resumen

`mradermacher/gemma-3-12b-it-vl-Kimi-V2-Heretic-Uncensored-Thinking-GGUF` es una distribucion de cuantizaciones GGUF estaticas del modelo `DavidAU/gemma-3-12b-it-vl-Kimi-V2-Heretic-Uncensored-Thinking`, publicado por el usuario mradermacher, conocido en el ecosistema por convertir modelos a formatos ligeros listos para llama.cpp y Ollama. No es un modelo entrenado desde cero: es un derivado de Gemma 3 12B instruct con capacidad de vision (VL), afinado por DavidAU sobre el dataset `TeichAI/kimi-k2-thinking-1000x` y sometido a un proceso de "abliteration" o "heretic" que elimina total o parcialmente los rechazos del modelo original.

El modelo resuelve un nicho concreto: ofrecer un Gemma 3 de 12B con vision, sin las capas de censura habituales y con un estilo de escritura creativa y narrativa muy marcado, empaquetado en cuantizaciones de 4,9 a 12,6 GB para poder ejecutarse en GPUs de consumo. La ficha tecnica se centra en el artefacto GGUF, aunque la mayoria de las caracteristicas heredan del modelo base.

Con 11.766.034.176 parametros (aproximadamente 11,77 mil millones) y licencia Apache 2.0, el modelo es relevante para desarrolladores que necesitan generacion de ficcion, continuacion de escenas y escritura vivida en ingles sobre hardware asequible, asumiendo los riesgos de un modelo abliterado y la perdida de calidad asociada a cuantizaciones agresivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Gemma 3 (base multimodal VL); detalles exactos no disponibles en la informacion proporcionada |
| Parametros totales | 11.766.034.176 (11,77 B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye ficheros mmproj para el componente multimodal) |
| Tamano del repositorio | 83,9 GB |
| Modelo base | DavidAU/gemma-3-12b-it-vl-Kimi-V2-Heretic-Uncensored-Thinking |
| Dataset de ajuste | TeichAI/kimi-k2-thinking-1000x |
| Precisión original | bfloat16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 12B instruct en su variante con vision (VL), un transformer decoder-only con un proyector multimodal que permite procesar imagenes ademas de texto. El autor del modelo base, DavidAU, aplico un ajuste fino supervisado sobre el dataset `TeichAI/kimi-k2-thinking-1000x`, orientado a reforzar el razonamiento estilo "thinking" y la escritura creativa, seguido de un proceso de abliteration ("heretic") que elimina direcciones de activacion asociadas a rechazos. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se uso RLHF o DPO.

El artefacto publicado por mradermacher es una conversion a GGUF mediante su pipeline habitual (`convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1`), con cuantizaciones estaticas y, en un repositorio hermano (`-i1-GGUF`), variantes con imatrix. Se incluyen ficheros `mmproj` en Q8_0 (0,7 GB) y f16 (1,0 GB) para habilitar la entrada de imagenes en llama.cpp. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ingles con enfasis en escritura creativa, prosa vivida y narrativa.
- Generacion de ficcion: tramas, subtramas, escenas, continuacion de escenas y storytelling en generos como ciencia ficcion y romance.
- Capacidad multimodal de vision heredada de Gemma 3 VL (procesamiento de imagenes mediante los ficheros mmproj), aunque el enfasis del ajuste es textual.
- Modo "thinking" o razonamiento derivado del dataset Kimi K2 thinking, segun los tags del autor.
- Comportamiento "uncensored" y "abliterated": reduce los rechazos del modelo original ante contenido sensible.
- Conversacion multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agentes y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Multilingue: limitado a ingles segun la model card.

## Casos de uso

- Escritura de ficcion por capitulos: el modelo esta afinado especificamente para story generation y scene continue, por lo que puede generar tramas coherentes y prosa vivida en ingles con prompts de estilo y personajes.
- Generacion de tramas y subtramas para novelas o guiones: util para autores que necesitan lluvia de ideas estructurada con arcos narrativos y giros, apoyandose en el dataset de razonamiento Kimi K2.
- Continuacion de escenas en talleres de escritura: con cuantizaciones Q4_K_M (7,4 GB) puede ejecutarse en una RTX 4090 o incluso en GPUs de 8-12 GB, permitiendo iteracion rapida sobre borradores.
- Creacion de contenido de rol y narrativa interactiva: el caracter abliterated elimina rechazos ante tematicas adultas o violentas propias de ciertos generos, lo que lo hace adecuado para ficcion sin restricciones tematicas.
- Prototipado de asistentes creativos en local: al ser GGUF y compatible con llama.cpp y Ollama, se puede desplegar en estaciones de trabajo sin conexion para generar textos de marketing, relatos cortos o dialogos.
- Analisis de imagenes con descripcion creativa: usando los ficheros mmproj, puede recibir una imagen y generar descripciones narrativas o inspiracion visual para escritura, aunque la calidad multimodal no esta documentada.
- Experimentacion en investigacion sobre abliteration: sirve como caso de estudio para medir la perdida de capacidades y el aumento de respuestas no filtradas frente al Gemma 3 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,9 GB
  - Q3_K_S: ~5,6 GB
  - Q3_K_M: ~6,1 GB
  - Q3_K_L: ~6,6 GB
  - IQ4_XS: ~6,7 GB
  - Q4_K_S: ~7,0 GB
  - Q4_K_M: ~7,4 GB
  - Q5_K_S: ~8,3 GB
  - Q5_K_M: ~8,5 GB
  - Q6_K: ~9,8 GB
  - Q8_0: ~12,6 GB
- Para vision, sumar el fichero mmproj: 0,7 GB (Q8_0) o 1,0 GB (f16).
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 con contexto amplio; RTX 3090/4080 (16-24 GB) para Q5-Q6; RTX 4060 Ti 16 GB o RTX 4070 (12 GB) para Q4_K_M; GPUs de 8 GB para Q3_K_S con contexto reducido. En entornos profesionales, A100 o H100 permiten Q8_0 con contextos largos y mayor throughput.
- Cabe en GPU de consumo: si, desde Q2_K en GPUs de 6-8 GB hasta Q8_0 en GPUs de 16 GB o superiores. Las cuantizaciones Q4_K_S y Q4_K_M estan marcadas como "fast, recommended" por el autor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con APIs tipo OpenAI. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan el modelo original en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (GGUF) | 11,77 B | no disponible | Si (mmproj) | Apache 2.0 | GGUF | Abliterated, enfocado a ficcion, solo ingles |
| Gemma 3 12B IT (Google) | ~12 B | no disponible en esta ficha | Si (variante VL) | Gemma Terms (no Apache) | safetensors, GGUF | Modelo original con filtros de seguridad; licencia mas restrictiva |
| DavidAU/gemma-3-12b-it-vl-Kimi-V2-Heretic-Uncensored-Thinking | 11,77 B | no disponible | Si | Apache 2.0 | safetensors (bfloat16) | Modelo base sin cuantizar; requiere mas VRAM |
| Mistral Nemo 12B Instruct | ~12 B | no disponible en esta ficha | No | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar sin vision ni abliteration |

La comparativa se limita a datos disponibles; no se dispone de resultados de benchmarks que permitan comparar rendimiento real entre estas opciones.

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de rechazos puede degradar la coherencia, aumentar la probabilidad de contenido ofensivo o ilegal y reducir la fiabilidad en tareas factuales.
- Riesgo de alucinacion elevado en un modelo afinado para ficcion y con ajuste "thinking": no es adecuado como fuente de verdad para dominios tecnicos o medicos.
- Solo soporta ingles segun la model card; el rendimiento en castellano no esta garantizado ni documentado.
- Las cuantizaciones Q2_K y Q3_K_M tienen perdida de calidad notable; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S o Q4_K_M.
- La licencia Apache 2.0 se aplica al artefacto GGUF, pero el modelo base Gemma 3 de Google tiene terminos propios; conviene verificar la compatibilidad para uso comercial, especialmente por la clausula de uso aceptable de Gemma.
- El ajuste fino sobre un dataset de 1000 ejemplos (`kimi-k2-thinking-1000x`) es limitado; puede provocar sobreajuste al estilo y perdida de capacidades generales frente al Gemma 3 original.
- No hay informacion sobre tool calling, agentes ni contexto maximo, por lo que no se recomienda para pipelines de agentes en produccion sin validacion previa.
- El repositorio ocupa 83,9 GB; descargar solo la cuantizacion necesaria para evitar consumo innecesario de disco.
- El tag "heretic" y "uncensored" implica que el modelo puede generar contenido no apto para todos los publicos; requiere moderacion externa si se expone a usuarios finales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-3-12b-it-vl-Kimi-V2-Heretic-Uncensored-Thinking-GGUF
- Repositorio con cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-3-12b-it-vl-Kimi-V2-Heretic-Uncensored-Thinking-i1-GGUF
- Modelo base: https://huggingface.co/DavidAU/gemma-3-12b-it-vl-Kimi-V2-Heretic-Uncensored-Thinking
- Dataset de ajuste: https://huggingface.co/datasets/TeichAI/kimi-k2-thinking-1000x
- Pagina de resumen del autor: https://hf.tst.eu/model#gemma-3-12b-it-vl-Kimi-V2-Heretic-Uncensored-Thinking-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
