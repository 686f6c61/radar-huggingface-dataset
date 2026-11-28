# Enntity/LingSante-3.1-air-VL-NVFP4

## Resumen

LingSante-3.1-air-VL-NVFP4 es una cuantización de precisión ultra-baja del modelo multimodal inclusionAI/LingSante-3.1-air-VL, publicada por Enntity. Se trata de un transformer de mezcla de expertos (MoE) con arquitectura `bailing_moe_v3_vl` que procesa entradas de imagen y texto y genera texto, con un total de 124.848.460.496 parámetros. La cuantización se ha aplicado a las 61.440 matrices de expertos enrutados, partiendo directamente del checkpoint BF16 original, y utiliza el formato NVFP4 (grupos E2M1 de 16 con escalas de grupo E4M3 y una escala por matriz).

El interés de esta ficha es doble. Por un lado, demuestra que es posible comprimir un modelo MoE multimodal de más de 120.000 millones de parámetros hasta 70,88 GiB de pesos, lo que permite servirlo en una única estación de trabajo con GPU de gran memoria como la DGX Spark. Por otro, el autor publica métricas de fidelidad numérica frente al BF16 original y frente a la cuantización MXFP4 oficial del editor, mostrando una menor degradación en la salida de los expertos enrutados y en la distribución del siguiente token.

El modelo está orientado a investigación médica y tareas de razonamiento multimodal (image-text-to-text), con soporte declarado de tool calling, vídeo y contexto nativo de 131.072 tokens. La licencia del modelo base es MIT. La información disponible no incluye resultados de benchmarks clínicos ni académicos estándar (MMLU, HumanEval, GSM8K), por lo que el rendimiento se documenta aquí únicamente a través de las métricas de fidelidad y velocidad publicadas por el autor de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (`bailing_moe_v3_vl`), con torre de visión |
| Parametros totales | 124.848.460.496 |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (contexto nativo) |
| Tipos de cuantizacion | NVFP4 (grupos E2M1 de 16, escalas de grupo E4M3, escala por matriz); 8-bit en `compressed-tensors`; pesos no-experto, torre de visión, tokenizer y chat template en su formato original |
| Idiomas soportados | no disponible |
| Licencia | MIT (pesos del editor); el código upstream empaquetado conserva sus licencias y avisos a nivel de fichero |
| Formato de pesos | safetensors (50 shards), `compressed-tensors`, `custom_code` |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con componentes multimodales: una torre de visión que procesa imágenes y un cuerpo de lenguaje MoE. La cuantización NVFP4 afecta exclusivamente a las 61.440 matrices de expertos enrutados; el resto de pesos (atención, capas densas, torre de visión, embeddings) se conserva tal cual del checkpoint BF16 original de inclusionAI. El formato numérico emplea grupos de 16 valores en E2M1 con escalas de grupo en E4M3 y una escala adicional por matriz, lo que reduce el error de cuantización respecto a esquemas de bloque más gruesos.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO) del modelo base en la documentación proporcionada. La innovación técnica destacable de esta publicación es la metodología de cuantización: el autor mide la fidelidad numérica mediante dos sondas. La primera pasa 32 entradas gaussianas con semilla por 15 expertos enrutados en las capas 2, 10, 21, 34 y 41, obteniendo menor error en NVFP4 que en MXFP4 en todos los expertos. La segunda evalúa la distribución del siguiente token en cinco prompts sintéticos y 68 posiciones forzadas de un registro de accesiones sintético, con una distancia de variación total aproximada (top-5 más un bin residual). El motor de servicio SparkLing añade decodificación especulativa con la capa predictora de Ling-3.2-air y cuantización en memoria de las grandes proyecciones de atención en su perfil Spark.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de entradas de imagen y texto (`image-text-to-text`).
- Procesamiento de vídeo en el pipeline de servicio (declarado por SparkLing: texto, imágenes, vídeo y tool calls).
- Tool calling / function calling: la prueba de release reporta 10 de 10 llamadas de herramienta individuales correctas.
- Razonamiento multi-paso con modo de pensamiento (thinking) activado por defecto en el template de chat; la prueba de release supera 30 de 30 problemas aritméticos planteados como enunciados verbales.
- Comprensión de documentos estructurados: la prueba de release incluye comprobaciones de facturas y de rejillas (grids).
- Lectura de gráficos de gran tamaño: en la demo del autor se procesa un gráfico sintético de 51.349 tokens.
- Capacidades multilingües: no disponible (no se documentan idiomas).

## Casos de uso

- Investigación médica asistida por IA: el modelo está etiquetado como `medical` y su uso previsto por el editor es la investigación médica. Se emplearía para extraer y resumir información de imágenes clínicas e informes de acceso, siempre con validación humana y sin uso diagnóstico directo.
- Análisis de documentos con estructura: facturas, formularios y registros de accesiones. El soporte de imagen-texto y contexto largo permite procesar documentos completos en una sola pasada; la prueba de release incluye verificación de facturas.
- Lectura de gráficos y tablas de gran tamaño: con 131.072 tokens de contexto y capacidad de prefill de 3.015 tok/s a 64K tokens en una DGX Spark, es viable ingerir figuras densas y responder preguntas sobre ellas (demo de gráfico de 51.349 tokens en 17,4 s).
- Agentes con herramientas en entornos controlados: la tasa reportada de 10 de 10 llamadas de herramienta individuales correctas permite integrarlo en flujos de automatización que consulten APIs o bases de datos internas mediante function calling.
- Despliegue en hardware de una sola unidad: al ocupar 70,88 GiB de pesos, puede servirse en una DGX Spark con el motor SparkLing y exponer una API compatible con OpenAI en `http://127.0.0.1:8897/v1`, útil para prototipado y evaluación local sin clúster.
- Procesamiento por lotes de vídeo e imagen: el pipeline declara soporte de vídeo; se usaría para transcripción descriptiva y extracción de eventos en flujos de vigilancia o documentación audiovisual, con revisión posterior.
- Evaluación de cuantizaciones en producción: sirve como referencia para comparar la fidelidad NVFP4 frente a MXFP4 en un MoE multimodal real, gracias a las sondas reproducibles publicadas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las métricas publicadas son de fidelidad numérica frente al BF16 original y de velocidad de servicio.

| Medida (fidelidad) | Esta NVFP4 | MXFP4 del editor |
|---|---:|---:|
| Error de salida de expertos enrutados, ponderado por energía | 0,165 | 0,200 |
| Coseno medio de salida de expertos enrutados | 0,9864 | 0,9800 |
| Distancia de distribución del siguiente token (TV aproximada) | 0,088 | 0,103 |
| Siguiente token igual a BF16 (68 posiciones forzadas) | 56/68 | 56/68 |
| Completaciones libres de un token iguales a BF16 | 5/5 | 4/5 |

| Medida (velocidad, SparkLing en una DGX Spark) | 0.1.4 | 0.1.3 |
|---|---:|---:|
| Prefill primera petición, 8K / 32K / 64K tokens (tok/s) | 3.688 / 3.446 / 3.015 | 3.411 / 2.582 / 1.890 |
| Cuatro prompts escalonados de ~16K tokens, mediana por ronda | 36,7 s | 40,7 s |
| Decode mediano código / prosa / estructurado (tok/s) | 45,9 / 44,6 / 53,2 | 49,1 / 43,3 / 53,1 |
| Código corto, 1 / 2 / 4 / 8 peticiones simultáneas (tok/s) | 41,2 / 61,6 / 86,9 / 122,8 | 41,5 / 61,6 / 91,4 / 124,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 70,88 GiB; el repo completo son 76,1 GB. El servicio requiere además caché KV y buffers de atención, por lo que no cabe en GPUs de consumo de 24 o 48 GB.
- GPU recomendadas: NVIDIA DGX Spark (configuración de referencia del autor, con caché compartida de 2.330.720 tokens para ocho peticiones). No se documentan otras GPU en la información disponible.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en configuraciones habituales de 48 GB. Se requiere memoria unificada o agregada superior a ~80 GiB.
- Opciones de despliegue: motor Atlas a través de SparkLing 0.1.4 (API compatible con OpenAI), con receta de instalación LLooM (`lloom setup --recipe linux-nvidia-dgx-spark-lingsante-air-vl-atlas --additive --apply --yes`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill de 3.688 tok/s a 8K y 3.015 tok/s a 64K; decode mediano de 44,6 a 53,2 tok/s según el tipo de contenido; 122,8 tok/s agregados con ocho peticiones cortas simultáneas. La decodificación especulativa (Spark mode) usa la capa predictora de Ling-3.2-air, descargada por separado, y puede desactivarse con `DRAFTER=none`.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| Enntity/LingSante-3.1-air-VL-NVFP4 | 124.848.460.496 | 131.072 | NVFP4 (8-bit compressed-tensors) | MIT | Hugging Face, 362 descargas |
| inclusionAI/LingSante-3.1-air-VL (BF16) | 124.848.460.496 (mismo base) | 131.072 | BF16 | MIT | Hugging Face (modelo base) |
| inclusionAI/LingSante-3.1-air-VL MXFP4 (editor) | 124.848.460.496 (mismo base) | 131.072 | MXFP4 | MIT | Hugging Face |

La comparación se limita a las variantes del mismo modelo base, ya que la información disponible no identifica alternativas de otros desarrolladores con parámetros, contexto y tarea equivalentes. En fidelidad numérica, la NVFP4 de Enntity supera a la MXFP4 del editor en las cinco medidas publicadas (menor error de expertos, mayor coseno, menor distancia de distribución y una completación libre adicional igual a BF16).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; el modelo base es de investigación médica y no se han publicado evaluaciones de sesgo.
- Riesgo de alucinación: no evaluado. Las pruebas publicadas miden fidelidad numérica frente a BF16, no corrección factual ni precisión clínica; el propio autor indica que la precisión clínica queda sin evaluar.
- Limitaciones de contexto e idioma: el contexto nativo es de 131.072 tokens, pero el rendimiento de prefill decrece con la longitud (3.015 tok/s a 64K frente a 3.688 tok/s a 8K). No se documentan los idiomas soportados.
- Restricciones de licencia: los pesos se publican bajo MIT, lo que permite uso comercial; sin embargo, el código upstream empaquetado conserva sus licencias y avisos a nivel de fichero, que deben revisarse antes de redistribuir.
- Uso médico: el modelo está orientado a investigación médica; no debe emplearse para diagnóstico o decisión clínica sin validación independiente y supervisión profesional.
- Dependencia de infraestructura específica: el despliegue documentado requiere SparkLing y una DGX Spark; no se garantiza funcionamiento en otros motores de inferencia.
- La decodificación especulativa descarga un modelo borrador adicional (capa predictora de Ling-3.2-air) que no forma parte de este checkpoint; su ausencia o desactivación altera el rendimiento, no la salida (el autor reporta texto byte-idéntico en las pruebas).
- Las sondas de calidad usan un conjunto sintético pequeño (32 entradas gaussianas, cinco prompts, 68 posiciones); son una cota inferior de la fidelidad, no una evaluación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Enntity/LingSante-3.1-air-VL-NVFP4
- Modelo base: https://huggingface.co/inclusionAI/LingSante-3.1-air-VL
- Checkpoint fuente citado: https://huggingface.co/inclusionAI/LingSante-3.1-air-VL/tree/1f398c937d6069994a156689636832c47d8c09be
- Cuantizador: https://github.com/Enntity/SparkLing/blob/7a88a27/install/quantize_sante.py
- Resultados de calidad de SparkLing: https://github.com/Enntity/SparkLing/blob/v0.1.4/results/2026-11-25-0.1.1/README.md#lingsante-31-air-vl-against-its-original-bf16
- Muestras de error por experto: https://github.com/Enntity/SparkLing/blob/8075cc2/results/2026-11-24/air-vl-quant/stored-expert-errors.json
- Resumen de distribución: https://github.com/Enntity/SparkLing/blob/8075cc2/results/2026-11-24/air-vl-quant/distribution-summary.json
- Programa de puntuación: https://github.com/Enntity/SparkLing/blob/8075cc2/bench/score_sante.py
- Repositorio SparkLing: https://github.com/Enntity/SparkLing
- Resultados de release 0.1.4: https://github.com/Enntity/SparkLing/tree/v0.1.4/results/2026-11-27-0.1.4
- Scorecard de SparkModelBench: https://github.com/Enntity/SparkLing/blob/v0.1.4/results/sparkmodelbench-v0.1.4/CARD.md
- LLooM: https://github.com/Enntity/lloom
- SparkModelBench: https://github.com/enntity/sparkmodelbench
- RigMark (Alex Ellis): https://github.com/alexellis/rigmark
