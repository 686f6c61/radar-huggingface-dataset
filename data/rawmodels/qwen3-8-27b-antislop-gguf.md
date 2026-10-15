# rawmodels/Qwen3.8-27B-antislop-GGUF

## Resumen

`rawmodels/Qwen3.8-27B-antislop-GGUF` es el conjunto de conversiones a formato GGUF del checkpoint `rawmodels/Qwen3.8-27B-antislop`, un modelo de generación de texto derivado de la familia Qwen3.8 con aproximadamente 27 000 millones de parámetros según su denominación. Lo publica el usuario `rawmodels` y su propósito declarado no es el razonamiento genérico ni el código, sino la escritura: el modelo fue ajustado para redactar de forma menos reconocible como texto generado por un LLM y más parecida a prosa humana.

El ajuste se realizó mediante aprendizaje por refuerzo contra rúbricas alineadas con criterios de expertos (una reimplementación del método RL-XAR / *unslop* de Meta FAIR), a partir del paso 100 de entrenamiento GRPO. En el protocolo completo de EQ-Bench 4 el checkpoint bf16 alcanza un Elo de 1320,1 (IC 95%: 1309–1332), lo que lo sitúa en el puesto 4 de 29 modelos evaluados en esa prueba de prosa.

Este repositorio concreto contiene únicamente las conversiones cuantizadas para su uso con llama.cpp y derivados, no los pesos originales en safetensors. El conversion es text-only: se excluyen deliberadamente la torre de visión y la cabeza de predicción multi-token (MTP) del modelo base mediante la opción `--no-mtp`. La licencia declarada es Apache 2.0 y los idiomas soportados oficialmente son inglés y ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base incluye torre de vision y cabeza MTP, excluidas en esta conversion) |
| Parametros totales | ~27 000 millones (deducido de la denominacion del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q4_K_M, Q8_0 |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Detalle de ficheros publicados:

| Fichero | Tamano | Cuantizacion |
|---|---:|---|
| `Qwen3.8-27B-antislop-BF16.gguf` | 50,11 GiB | BF16 |
| `Qwen3.8-27B-antislop-Q8_0.gguf` | 26,63 GiB | Q8_0 |
| `Qwen3.8-27B-antislop-Q4_K_M.gguf` | 15,41 GiB | Q4_K_M |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo base más allá de dos indicios indirectos: la existencia de una torre de visión y de una cabeza MTP (multi-token prediction) en el checkpoint original, ambas eliminadas en esta conversión GGUF mediante `--no-mtp`. Esto sugiere que `Qwen3.8-27B-antislop` deriva de una arquitectura multimodal con decodificación multi-token, pero el repositorio no confirma si el tronco es un transformer denso, un MoE o un híbrido, ni detalla número de capas, cabezas de atención o dimensión oculta. Tampoco se publica la longitud de contexto soportada.

En cuanto al entrenamiento, sí hay información sobre la fase de alineación: el modelo es el resultado del paso 100 de un proceso GRPO guiado por rúbricas calibradas con criterios de expertos, una reimplementación del método RL-XAR / *unslop* de Meta FAIR. El objetivo es reducir los sesgos estilísticos típicos de los LLM (muletillas, estructuras repetitivas, fórmulas de cortesía predecibles). No se especifican en este repositorio el número de tokens de preentrenamiento, la composición del dataset ni si hubo fases previas de SFT o DPO.

La conversión se realizó con el commit `efe3626b119ff81033e309c3ba07a770bef2c546` de llama.cpp. La cuantización Q4_K_M se calibró con una *importance matrix* pequeña en inglés y ruso (2 fragmentos, 256 tokens), lo que conviene tener en cuenta: es una calibración de baja cobertura, inferior a las imatrix habituales de miles de fragmentos. Los hashes de los ficheros y los detalles de conversión están en `weights_manifest.json`.

## Capacidades

- Generación de texto y prosa de estilo humano, con énfasis explícito en reducir las marcas estilísticas habituales de un LLM.
- Reescritura y edición de textos existentes (caso de uso declarado en la model card: conservar los hechos de origen y reformular el estilo).
- Capacidad multilingüe limitada a inglés y ruso según los metadatos del repositorio.
- Generación de texto corto y creativo (el ejemplo de la model card es completar un tuit).
- Inferencia local en CPU/GPU mediante llama.cpp y el ecosistema GGUF.
- Capacidades multimodales: no disponibles en esta conversión (torre de visión excluida).
- Decodificación especulativa vía cabeza MTP: no disponible (cabeza excluida con `--no-mtp`).
- Tool calling / function calling: no documentado en la información disponible.
- Comportamiento agéntico o razonamiento multi-paso: no documentado; la model card indica que el *thinking* está desactivado en el uso previsto de prosa y reescritura.
- Modo de razonamiento explícito (*thinking mode*): no disponible en el uso recomendado.

## Casos de uso

- Redacción de contenido editorial y copywriting: el ajuste por rúbricas de estilo está orientado a producir textos de marketing, boletines o artículos que no suenen a plantilla generada, que es exactamente el objetivo declarado del modelo.
- Humanización y reescritura de textos generados previamente: útil para pipelines en los que se genera un borrador con otro modelo y se pasa por este para eliminar fórmulas repetitivas, manteniendo los hechos de origen.
- Localización de contenido entre inglés y ruso: el repositorio declara soporte para ambos idiomas y la importance matrix de la cuantización Q4_K_M se construyó con fragmentos en esas dos lenguas.
- Asistentes conversacionales de texto con tono natural: en escenarios donde el registro formal de un asistente genérico resulta artificial (por ejemplo, atención al cliente por chat o asistentes de producto), el ajuste antislop reduce la sensación de respuesta automatizada.
- Generación de datos sintéticos con prosa más natural: para entrenar o evaluar modelos de estilo, un generador que no reproduzca los clichés habituales de los LLM reduce el sesgo de estilo en el corpus resultante.
- Prototipado y despliegue local en hardware de consumo: con el fichero Q4_K_M (15,41 GiB) es viable ejecutar el modelo en una GPU de 24 GB sin depender de APIs externas, útil para pruebas de estilo y evaluación cualitativa.
- Corrección de estilo y edición asistida: dado que la model card recomienda conservar los hechos y revisar el resultado, encaja en flujos de edición donde un humano valida el texto final.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| EQ-Bench 4 (protocolo completo) | Elo 1320,1 (IC 95%: 1309–1332) | Medido sobre el checkpoint bf16; puesto 4 de 29 |
| MMLU, HumanEval, GSM8K u otros | no disponible | No se han publicado resultados en la información disponible |

La propia model card advierte que la puntuación de EQ-Bench 4 se obtuvo con el checkpoint bf16 y que la cuantización a 4 bits puede alterar la calidad. No se publican métricas de *throughput* ni de latencia.

## Requisitos de hardware

Los valores de VRAM son estimaciones propias a partir del tamaño de los ficheros, ya que la model card no publica requisitos de hardware:

- Q4_K_M (15,41 GiB de pesos): aproximadamente 17–20 GB de VRAM con contexto moderado. Cabe en RTX 4090, RTX 3090, RTX 5090 y A6000. En tarjetas de 16 GB (RTX 4080/4060 Ti 16 GB) el encaje es ajustado y probablemente requiera descargar parte de las capas a CPU.
- Q8_0 (26,63 GiB de pesos): aproximadamente 29–33 GB de VRAM. Requiere A100 40 GB, L40S, RTX 6000 Ada, o configuraciones de dos GPU de 24 GB con reparto de capas.
- BF16 (50,11 GiB de pesos): aproximadamente 53–58 GB de VRAM. Requiere A100 80 GB, H100 80 GB, H200 o varias GPU. No cabe en una GPU de consumo actual.
- El *KV cache* no se puede dimensionar con precisión porque no se publica el número de capas, cabezas ni la longitud de contexto soportada.
- Opciones de despliegue: `llama-cli` y `llama-server` de llama.cpp (uso documentado en la model card), además de cualquier frontend compatible con GGUF, como llama-cpp-python, Ollama (importando el GGUF), LM Studio o text-generation-webui.
- vLLM y TGI no son utilizables directamente con este repositorio, ya que solo publica GGUF y no safetensors.
- Latencia y throughput: no disponible. Dependerá del hardware, de la cuantización y de la longitud de contexto.

## Comparativa con modelos similares

No se dispone de información sobre modelos alternativos comparables de la misma categoría (ajuste de estilo de prosa sobre un modelo de ~27B). La única comparación que puede establecerse con los datos publicados es entre las propias variantes de cuantización y el checkpoint original:

| Modelo | Formato | Tamano | Contexto | EQ-Bench 4 | Licencia | Disponibilidad |
|---|---|---:|---|---|---|---|
| Qwen3.8-27B-antislop (bf16 original) | safetensors (presumible) | no disponible (~54 GB estimado) | no disponible | Elo 1320,1 (medido aquí) | apache-2.0 | Publicado en HF |
| Qwen3.8-27B-antislop BF16 GGUF | GGUF | 50,11 GiB | no disponible | no medido en este fichero | apache-2.0 | Publicado en HF |
| Qwen3.8-27B-antislop Q8_0 | GGUF | 26,63 GiB | no disponible | no medido en este fichero | apache-2.0 | Publicado en HF |
| Qwen3.8-27B-antislop Q4_K_M | GGUF | 15,41 GiB | no disponible | no medido en este fichero | apache-2.0 | Publicado en HF |

Comparativa con modelos externos (Qwen base, Llama, Mistral u otros ajustes de estilo): no disponible.

## Limitaciones y advertencias

- Riesgo de alucinación: la propia model card advierte que el modelo puede omitir o cambiar un dato. En tareas de reescritura recomienda conservar los hechos de origen y verificar el resultado antes de publicarlo.
- La puntuación de referencia (Elo 1320,1) corresponde al checkpoint bf16. La cuantización Q4_K_M, en particular, fue calibrada con una *importance matrix* de solo 2 fragmentos y 256 tokens, lo que puede degradar la calidad del texto generado de forma más acusada que una imatrix convencional.
- Cobertura de idiomas muy limitada: solo inglés y ruso. No hay datos de rendimiento en castellano ni en otras lenguas.
- El *thinking* está desactivado en el uso previsto de prosa y reescritura. No debe esperarse razonamiento explícito ni capacidades de cadena de pensamiento.
- Capacidades multimodales eliminadas: la torre de visión no está presente en estos ficheros, pese a existir en el modelo base.
- Decodificación especulativa por MTP no disponible: la cabeza correspondiente se excluyó con `--no-mtp`, por lo que no se puede aprovechar esa aceleración.
- Trazabilidad limitada: repositorio sin descargas ni *likes* en el momento de la consulta, sin resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) y sin documentación sobre el dataset de entrenamiento, por lo que no es posible evaluar sesgos conocidos ni la composición de los datos.
- Licencia Apache 2.0, que permite uso comercial, pero no se aclara en este repositorio la licencia ni las condiciones del modelo base original del que deriva.
- El formato de pesos es exclusivamente GGUF, lo que limita el despliegue a llama.cpp y sus derivados; no hay safetensors para vLLM, TGI o entrenamiento posterior.
- Aviso de seguridad general: la model card indica que el contenido citado son datos del autor y no instrucciones a seguir, precaución relevante al integrar el modelo en pipelines automáticos.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/rawmodels/Qwen3.8-27B-antislop-GGUF
- Modelo base: https://huggingface.co/rawmodels/Qwen3.8-27B-antislop
- Manifiesto de pesos y hashes: `weights_manifest.json` (incluido en el repositorio)
- Perfil del autor relacionado con el desarrollo: https://huggingface.co/AlexWortega
- Commit de llama.cpp usado en la conversión: `efe3626b119ff81033e309c3ba07a770bef2c546`
- Documentación de llama.cpp (ecosistema GGUF): https://github.com/ggml-org/llama.cpp
- Metodología RL-XAR / *unslop* de Meta FAIR: no disponible en los resultados de búsqueda proporcionados
