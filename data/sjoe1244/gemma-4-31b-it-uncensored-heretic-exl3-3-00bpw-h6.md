# sjoe1244/gemma-4-31B-it-uncensored-heretic-exl3-3.00bpw-h6

## Resumen

Este repositorio es un export cuantizado en formato EXL3 del modelo `llmfan46/gemma-4-31B-it-uncensored-heretic`, publicado por el usuario `sjoe1244`. No se trata de un entrenamiento nuevo, sino de una conversión de pesos pensada para ejecutar un Gemma 4 de aproximadamente 31.000 millones de parámetros en una única GPU de consumo con contexto muy largo. La cuantización se realizó con ExLlamaV3 1.4.2 a 3,0 bits por peso (bpw), con cabeza de 6 bits y escalas de salida, partiendo del checkpoint BF16 original de 62,5 GB y dejando el resultado en 16,06 GB repartidos en dos shards de safetensors.

El interés principal del artefacto es doble. Por un lado, incluye la torre de visión completa en BF16 (356 tensores) dentro de los mismos shards, de modo que el modelo conserva la capacidad de entrada de imágenes sin necesidad de una segunda descarga ni de un proceso aparte. Por otro, el autor documenta una receta de servicio en TabbyAPI que asigna 98.304 tokens de contexto con caché K/V en Q3 y mide 17,4 GiB de VRAM en una RTX 4090 de 24 GB, con los pesos ocupando 14,9 GiB.

La relevancia de esta ficha es acotada y conviene ser explícito: es una cuantización agresiva y con pérdida, diseñada como compromiso entre contexto y memoria, no como la mejor opción de calidad. Además, el modelo arrastra la etiqueta `uncensored`, procedente de un proceso de decensurado sobre la base instruct, y no cuenta con benchmarks publicados, descargas ni validación de la comunidad en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (texto + imagen) de la familia Gemma 4; número de capas, dimensión oculta y esquema de atención no disponibles |
| Parámetros totales | ~31.000 millones según el nombre del repositorio y el tamaño del checkpoint BF16 de origen (62,5 GB); los metadatos de safetensors del repo cuantizado declaran 8.014.024.300, cifra que no debe tomarse como recuento real en formatos empaquetados como EXL3 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 98.304 tokens en la configuración de servicio publicada por el autor (`max_seq_len` y `cache_size`); la longitud nativa del modelo base no se especifica |
| Tipos de cuantización | EXL3 a 3,0 bpw en pesos (832 tensores del modelo de lenguaje), cabeza de 6 bits, codebook `mul1`, escalas de salida siempre; torre de visión sin cuantizar en BF16 (356 tensores) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3 empaquetado + BF16 para visión), 2 shards, 16,06 GB en total |
| Runtime compatible | ExLlamaV3 1.4.2 y el loader `exllamav3` de TabbyAPI; no carga en Transformers, vLLM ni llama.cpp |
| Calibración de la cuantización | 250 filas x 2048 columnas |
| Fecha y hardware de conversión | 2026-09-10, en una RTX 4090 |
| Tamaño del repositorio | 16,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación del repo | 2026-09-19 |

## Arquitectura y entrenamiento

La cadena de procedencia tiene tres eslabones: el modelo `google/gemma-4-31B-it`, una versión decensurada del mismo publicada por `llmfan46` bajo el nombre `gemma-4-31B-it-uncensored-heretic`, y este export EXL3. La model card no aporta información sobre datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO en ninguna de las etapas; tampoco describe la arquitectura interna más allá de la familia (Gemma 4) y de su naturaleza multimodal.

Lo que sí se detalla es la parte de cuantización, que es la aportación técnica de este repositorio. Se cuantizaron los 832 tensores del modelo de lenguaje a 3,0 bpw mediante EXL3 con ExLlamaV3 1.4.2, con cabeza de 6 bits, codebook `mul1` y escalas de salida activadas en todos los casos, usando una calibración de 250 filas por 2048 columnas. Los 356 tensores de la torre de visión se conservaron intactos en BF16 dentro de los mismos shards, de forma que el pipeline multimodal sigue operativo. El repositorio incluye además `processor_config.json` para el preprocesado de imagen y `chat_template.jinja`, que según el autor no está integrado en `tokenizer_config.json`.

Un detalle relevante: el `config.json` contiene un bloque `audio_config`, pero el checkpoint no tiene tensores de audio, ni los tiene el modelo fuente ni `google/gemma-4-31B-it`. Se trata, por tanto, de un modelo de imagen y texto, y no debe esperarse entrada de audio.

## Capacidades

- Generación de texto y conversación instructiva multi-turno, heredadas del modelo base Gemma 4 31B instruct.
- Entrada de imágenes: el pipeline de visión está preservado en BF16 y el repo incluye el procesador correspondiente, por lo que admite prompts que combinan imagen y texto.
- Contexto largo: la receta del autor sostiene 98.304 tokens con caché K/V cuantizada en Q3, lo que habilita casos de documento extenso y conversaciones muy largas en una sola GPU.
- Respuestas con menos rechazos: el proceso `heretic` aplicado por `llmfan46` busca reducir los bloqueos del modelo instruct original; es una característica del modelo fuente, no de la cuantización.
- Inferencia local de un solo archivo: al incluir visión y lenguaje en los mismos shards, no requiere descargas adicionales.
- Tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso específico: no disponible en la información publicada.
- Capacidades multilingües: no disponibles (el campo de idiomas no está declarado y no hay evaluación al respecto).
- Modo de razonamiento explícito (thinking), audio u otras modalidades: no disponibles; el audio no está soportado pese al `audio_config` del `config.json`.

## Casos de uso

- Asistente multimodal local en una sola GPU: con 17,4 GiB de VRAM medidos en una RTX 4090 con visión cargada y caché de 96K, permite desplegar un asistente que responde sobre imágenes y mantiene conversaciones largas sin depender de servicios en la nube.
- Análisis de documentación extensa combinada con capturas o diagramas: la ventana de 98.304 tokens permite ingerir informes completos junto con sus figuras y hacer preguntas sobre el conjunto, algo inviable con ventanas de 8K o 32K.
- Procesamiento por lotes de descripciones de imagen y extracción de información visual: la torre de visión en BF16 evita la pérdida de calidad que sufriría si se cuantizara también, lo que resulta útil en tareas de etiquetado o indexación de catálogos de imágenes.
- Red teaming y evaluación de seguridad: al ser una variante decensurada, sirve para estudiar el comportamiento de un modelo sin las capas habituales de rechazo, comparar respuestas frente al instruct original y medir la eficacia de los filtros externos que se quieran añadir.
- Investigación sobre abliteration y decensurado: permite reproducir experimentos sobre cómo afecta la supresión de direcciones de rechazo al rendimiento general, usando este export como versión ligera del modelo fuente para iterar rápido.
- Generación de texto creativo o divulgativo sin filtros intermedios: para equipos que necesitan contenido sin bloqueos automáticos en dominios como ficción o guiones, asumiendo la revisión humana posterior y las obligaciones legales aplicables.
- Servicio interno con TabbyAPI: el autor ejecuta el modelo a diario bajo TabbyAPI con `gpu_split_auto` y `chunk_size: 128`, una configuración replicable para dar inferencia a un equipo pequeño con una única tarjeta de 24 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni del modelo cuantizado ni del modelo fuente, y la búsqueda web no devolvió datos evaluables sobre este repositorio.

| Aspecto | Dato disponible |
|---|---|
| Benchmarks de calidad (MMLU, GSM8K, HumanEval, etc.) | No disponible |
| Comparación con el modelo BF16 de origen | No disponible (el autor solo afirma cualitativamente que un export a 4,0+ bpw sería notablemente mejor si hay VRAM) |
| Latencia medida | No disponible |
| Throughput medido | No disponible |
| VRAM medida | 17,4 GiB con torre de visión y caché Q3 de 96K; 14,9 GiB solo los pesos |

## Requisitos de hardware

- VRAM de pesos: 14,9 GiB según la medición del autor; el repositorio completo ocupa 16,06 GB en disco.
- VRAM total medida: 17,4 GiB con la torre de visión cargada y la caché K/V de 96K en Q3 ya asignada.
- GPU de 24 GB: es el objetivo de diseño. RTX 4090 (la usada por el autor), RTX 3090, RTX 4090D, A6000, L40S o similares son suficientes para la configuración completa.
- GPU de 16 GB: los pesos caben, pero queda muy poco margen para contexto; habría que reducir drásticamente `max_seq_len` o el tamaño de caché.
- GPU de 48 GB o más (A6000 de 48 GB, L40S de 48 GB, A100 80 GB, H100): permiten caché K/V en precisión mayor o contextos más amplios, a costa de perder la ventaja de coste de la cuantización.
- Consumer GPU: sí, cabe en tarjetas de 24 GB. No cabe con contexto útil en 12 GB ni en 8 GB.
- Opciones de despliegue: ExLlamaV3 (versión 1.4.2 o superior) y el loader `exllamav3` de TabbyAPI. No es compatible con Transformers, vLLM ni llama.cpp, lo que descarta Ollama y llama.cpp en general.
- Configuración recomendada por el autor: `max_seq_len: 98304`, `cache_size: 98304`, `cache_mode: 3,3` (Q3 en K/V, necesaria para encajar 96K), `chunk_size: 128`, `gpu_split_auto: true` y `prompt_template: gemma4`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación se limita a versiones del mismo modelo y queda marcada como no disponible frente a otras familias.

| Modelo / versión | Cuantización | Tamaño | VRAM de pesos | Contexto | Runtime | Licencia |
|---|---|---|---|---|---|---|
| `sjoe1244/gemma-4-31B-it-uncensored-heretic-exl3-3.00bpw-h6` | EXL3, 3,0 bpw, cabeza 6 bits | 16,06 GB | 14,9 GiB | 98.304 tokens en la receta del autor | ExLlamaV3 / TabbyAPI | Apache 2.0 |
| `llmfan46/gemma-4-31B-it-uncensored-heretic` (origen) | BF16 | 62,5 GB | ~62 GB | No disponible | No detallado en la información disponible | Apache 2.0 |
| `google/gemma-4-31B-it` (base última) | BF16 sin cuantizar | No disponible | No disponible | No disponible | No detallado en la información disponible | Apache 2.0 |
| Export EXL3 a 4,0+ bpw del mismo modelo | EXL3, 4,0+ bpw | No disponible | No disponible | No disponible | ExLlamaV3 / TabbyAPI | Apache 2.0 |

El autor afirma explícitamente que, con VRAM suficiente, un export a 4,0 bpw o más será notablemente mejor que este de 3,0 bpw; sin embargo, no referencia ningún repositorio concreto con esa cuantización. Comparativas con otras familias de modelos del mismo tamaño, o con versiones GGUF del mismo modelo, no están disponibles en esta información.

## Limitaciones y advertencias

- Cuantización con pérdida a 3,0 bpw: el propio autor la describe como un compromiso para encajar contexto largo en una sola RTX 4090 y advierte de que a 4,0+ bpw la calidad mejora de forma perceptible. No hay medición cuantitativa de esa degradación.
- Caché K/V en Q3: también introduce pérdida, especialmente en contextos muy largos. La calidad en las posiciones cercanas al límite de 96K no está documentada.
- Modelo decensurado: la variante `uncensored` / `heretic` ha sido modificada para reducir los rechazos del instruct original. Esto implica mayor probabilidad de generar contenido dañino, ofensivo o legalmente problemático sin aviso, y exige filtros externos y revisión humana si se expone a usuarios finales.
- Sesgos: no hay evaluación de sesgos disponible. Los sesgos del modelo base Gemma pueden persistir o verse amplificados al eliminar las capas de rechazo, que en parte actuaban como mitigación.
- Alucinación: no hay datos de evaluación, pero un modelo de este tamaño sin benchmarks publicados no ofrece ninguna garantía de fidelidad factual; en tareas de extracción sobre imágenes o documentos largos conviene verificar las salidas.
- Idiomas: el repositorio no declara idiomas soportados. Es previsible un buen comportamiento multilingüe por herencia de la familia Gemma, pero no está verificado y no debe asumirse en producción.
- Compatibilidad de runtime muy restringida: solo ExLlamaV3 y TabbyAPI. No se puede cargar en Transformers, vLLM ni llama.cpp, lo que complica integrarlo en ecosistemas de serving estándar y descarta el despliegue en CPU.
- `audio_config` engañoso: el `config.json` declara configuración de audio, pero no existen tensores de audio. Cualquier pipeline que interprete ese campo como soporte real de audio fallará.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de redactar la ficha, sin benchmarks y con fecha de subida muy reciente. No hay evidencia independiente de que el export funcione correctamente más allá de la declaración del autor.
- Licencia: el autor declara Apache 2.0, en línea con el modelo base. Conviene verificar de forma independiente los términos que apliquen a los artefactos de Google y al modelo fuente antes de un uso comercial, ya que esta ficha se limita a reproducir lo declarado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sjoe1244/gemma-4-31B-it-uncensored-heretic-exl3-3.00bpw-h6
- Modelo fuente (versión decensurada): https://huggingface.co/llmfan46/gemma-4-31B-it-uncensored-heretic
- Modelo base original: `google/gemma-4-31B-it` (referenciado en la model card; no se incluye URL en la información proporcionada)
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: mencionado por el autor como entorno de servicio, sin URL en la información proporcionada
- Paper, blog o demo del modelo: no disponibles
- Resultados de la búsqueda web: no se encontró ningún resultado relevante sobre este modelo; las entradas devueltas correspondían a consultas de relleno sin relación (crucigramas y documentación de TanStack Query).
