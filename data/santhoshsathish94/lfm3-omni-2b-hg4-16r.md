# Santhoshsathish94/LFM3-Omni-2B-HG4-16R

## Resumen

LFM3-Omni-2B-HG4-16R es una compilación cuantizada del modelo LiquidAI/LFM3-Omni-2B, publicada por el usuario Santhoshsathish94 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión de los pesos oficiales a un formato propietario denominado HG4-16R (Hadamard-Grouped 4-bit con 16 filas), empaquetado específicamente para el motor de inferencia Clover, escrito en C11 y optimizado para CPU con AVX2 y FMA. El resultado es un artefacto de 0,91 GB que reduce el peso original en BF16 (4,2 GB) en un factor de 4,6x.

La relevancia de esta ficha radica en que ejemplifica una tendencia creciente: la publicación de artefactos de cuantización orientados a motores de inferencia alternativos que no dependen de PyTorch ni de CUDA, lo que permite ejecutar modelos multimodales en CPU con requisitos de memoria muy bajos. El modelo base LFM3-Omni-2B es un modelo híbrido de LiquidAI con capacidades omni (texto, visión y audio según la denominación "Omni"), aunque la información disponible sobre el artefacto cuantizado no detalla el pipeline ni los idiomas soportados.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su licencia es la LFM Open License 1.0, heredada del modelo base. La model card está redactada en inglés y describe exclusivamente el proceso de empaquetado y las métricas del motor Clover, sin proporcionar información sobre el entrenamiento, los datos o las capacidades del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida ShortConv + GQA (según la model card: "hybrid ShortConv + GQA layers"), 24 capas |
| Parámetros totales | 2B (según el nombre del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | HG4-16R (Hadamard-Grouped 4-bit, 16 filas) |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | `.hg4` (formato propietario del motor Clover), más `meta.bin` y `tokenizer.json` |

## Arquitectura y entrenamiento

El artefacto no incluye información sobre el entrenamiento del modelo base. La model card del cuantizado describe únicamente el proceso de conversión: los pesos oficiales de LiquidAI/LFM3-Omni-2B se empaquetan directamente en el formato HG4-16R, que aplica una transformación de Hadamard agrupada en bloques de 16 filas antes de la cuantización a 4 bits. Esta técnica de rotación previa a la cuantización es habitual para reducir el error de redondeo en pesos con valores atípicos, y el sufijo "16R" indica el tamaño del grupo de filas sobre el que se aplica la transformación.

La arquitectura del modelo base, según la propia model card, combina capas ShortConv (convoluciones de corto alcance) con capas de atención GQA (Grouped Query Attention) en un total de 24 capas. El motor Clover implementa una caché de prefijo con estado O(1) y retroceso exacto mediante la función `lfm3_hg4_cache_truncate(lcp)`, lo que permite reutilizar prefijos computados y truncar la caché en un punto exacto sin recomputar. El motor se compila como biblioteca compartida nativa en Linux x86_64 con GCC, usando `-march=x86-64-v3 -mavx2 -mfma -fopenmp`, y no tiene dependencias externas más allá de libm.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un modelo de lenguaje de 2B parámetros, por lo que se espera capacidad de generación y razonamiento básico, aunque no se detallan evaluaciones.
- Capacidades omni: el nombre "Omni" del modelo base sugiere soporte de múltiples modalidades (texto, visión y audio), pero la información disponible no confirma qué modalidades están operativas en el artefacto cuantizado.
- Inferencia en CPU: el artefacto está diseñado para ejecutarse en CPU x86_64 con AVX2 y FMA, sin GPU.
- Caché de prefijo con estado O(1): permite reutilizar prefijos y truncar la caché de forma exacta, lo que facilita flujos multi-turno y agentes que reutilizan contexto.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: la model card menciona su uso como "small_model" para "sub-second triage & loop-escape" en el "Clover HG4 Fusion Gateway", lo que indica un uso previsto en pipelines de agentes, aunque sin detalle técnico.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible en la información del artefacto.

## Casos de uso

- Triaje rápido en pipelines de agentes: la model card indica que el modelo se usa como "small_model" para triaje sub-segundo y escape de bucles en el Clover HG4 Fusion Gateway. Se usaría como primer filtro para clasificar o descartar consultas antes de pasarlas a un modelo mayor, aprovechando su bajo coste de inferencia en CPU.
- Inferencia en CPU sin GPU: al compilarse como biblioteca C11 con AVX2 y FMA, puede integrarse en entornos sin GPU (servidores de bajo coste, estaciones de trabajo, contenedores ligeros) donde no es viable desplegar CUDA.
- Despliegue en dispositivos con memoria limitada: el artefacto de 0,91 GB cabe en sistemas con 2 GB de RAM o menos, lo que permite ejecutar un modelo de 2B parámetros en hardware muy restringido.
- Procesamiento por lotes de bajo coste: con 882 tok/s de prefill y más de 45 tok/s de decodificación en 16 núcleos Zen 4, es adecuado para tareas de clasificación, extracción o resumen de alto volumen donde el coste por token es crítico.
- Reutilización de contexto en conversaciones multi-turno: la caché de prefijo con truncado exacto permite mantener conversaciones largas sin recomputar el prefijo completo en cada turno, lo que reduce la latencia en asistentes conversacionales.
- Prototipado e investigación de cuantización: el artefacto sirve como referencia para estudiar el formato HG4-16R y comparar su comportamiento frente a otras cuantizaciones de 4 bits en tareas de lenguaje.
- Integración en aplicaciones embebidas o de escritorio: la biblioteca compartida `liblfm3_hg4_engine.so` puede enlazarse desde aplicaciones C/C++ sin necesidad de un runtime de Python.

## Benchmarks y rendimiento

La model card reporta un resultado del conjunto `rh_bench_suite_v2.jsonl`: 3 de 23 tareas superadas, con 52,90 pases verificados por hora. No se proporcionan resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Métrica | Valor |
|---|---|
| Tareas superadas (rh_bench_suite_v2.jsonl) | 3 / 23 |
| Pases verificados por hora | 52,90 |
| Prefill (16 núcleos Zen 4) | 882 tok/s |
| Decodificación single-stream (16 núcleos Zen 4) | 45+ tok/s |
| Tamaño del artefacto | 0,91 GB (872 MiB) |
| Reducción frente a BF16 | 4,6x (desde 4,2 GB) |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el motor es de CPU. El artefacto ocupa 0,91 GB en disco y requiere al menos esa cantidad de RAM más el espacio de la caché de prefijo.
- GPU recomendadas: no aplica; el motor Clover es exclusivamente CPU x86_64 con AVX2 y FMA.
- ¿Cabe en GPU consumer? No aplica. En CPU, cabe en cualquier sistema x86_64 con AVX2 (prácticamente todos los procesadores de escritorio y servidor desde 2013) y al menos 2 GB de RAM libre.
- Opciones de despliegue: compilación nativa con GCC (`gcc -O3 -march=x86-64-v3 -mavx2 -mfma -fopenmp -fPIC -shared lfm3_hg4_engine.c -lm -o liblfm3_hg4_engine.so`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; el formato `.hg4` es propietario y no es compatible con esos runtimes.
- Latencia y throughput: 882 tok/s de prefill y más de 45 tok/s de decodificación single-stream en 16 núcleos Zen 4, según la model card.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este artefacto con alternativas de la misma categoría, ya que el formato HG4-16R y el motor Clover son propietarios y no hay datos de benchmarks estándar. Se indica "no disponible" para los campos que requerirían datos que no constan en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Formato | Motor |
|---|---|---|---|---|---|
| LFM3-Omni-2B-HG4-16R | 2B | no disponible | lfm-open-license-1.0 | `.hg4` | Clover (C11, CPU) |
| LiquidAI/LFM3-Omni-2B (base) | 2B | no disponible | lfm-open-license-1.0 | safetensors (BF16) | PyTorch / Transformers |
| Alternativas de 2B en GGUF | no disponible | no disponible | no disponible | GGUF | llama.cpp |

## Limitaciones y advertencias

- El artefacto tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-24), por lo que no hay evidencia de uso o validación por parte de la comunidad.
- El resultado de benchmarks es muy bajo: 3 de 23 tareas superadas en `rh_bench_suite_v2.jsonl`, lo que sugiere que la cuantización HG4-16R puede degradar significativamente el rendimiento del modelo base. No se proporcionan resultados del modelo base en el mismo conjunto para comparar.
- El formato `.hg4` es propietario y solo es compatible con el motor Clover; no se puede cargar con Transformers, llama.cpp, vLLM ni Ollama. Esto limita la portabilidad y la integración con el ecosistema estándar.
- La licencia LFM Open License 1.0 puede imponer restricciones al uso comercial; es necesario revisar sus términos antes de desplegar el modelo en producción.
- No se detallan los idiomas soportados ni el pipeline, por lo que no se puede confirmar el soporte multilingüe ni las modalidades (texto, visión, audio) realmente operativas en el artefacto.
- Riesgo de alucinación: no hay información específica, pero es esperable en un modelo de 2B parámetros, especialmente tras una cuantización agresiva a 4 bits.
- La model card está redactada en inglés y no incluye información sobre sesgos, datos de entrenamiento ni evaluación de seguridad.
- El motor requiere AVX2 y FMA; no funcionará en CPUs sin estas extensiones (por ejemplo, algunas CPU antiguas o ARM).

## Enlaces

- Hugging Face: https://huggingface.co/Santhoshsathish94/LFM3-Omni-2B-HG4-16R
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
