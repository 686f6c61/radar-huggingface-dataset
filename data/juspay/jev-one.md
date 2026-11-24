# juspay/jev-one

## Resumen

Xor 1.2 (identificador `juspay/jev-one` en Hugging Face) es un modelo derivado de Qwen/Qwen3.6-35B-A3B, ajustado mediante post-entrenamiento por el equipo de Juspay para tareas de decisión tipada (typed decision tasks). No es un modelo generativo de propósito general al uso: se sirve a través de una API compatible con TypeSafe (`/v1/systemone`) que recibe un estado y un mapa de preguntas tipadas, y devuelve probabilidades binarias, decisiones categóricas o puntuaciones ordinales esperadas. La relevancia actual radica en que empaqueta el modelo junto con una capa de servicio determinista (lectura de logprobs de un solo token, evaluación del orden de opciones en ambos sentidos, calibración de probabilidades y conversión de esquema), de modo que los resultados son reproducibles byte a byte si se fija la revisión.

Arquitectura y tamaño: se apoya en el checkpoint base Qwen3.6-35B-A3B, un transformer causal de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y aproximadamente 3 mil millones activados por token. El ajuste consiste en un LoRA de rango 16 fusionado en los pesos BF16 del modelo base, empaquetado como pesos completamente fusionados (sin necesidad de cargar adaptadores). El modelo acepta además hasta ocho imágenes o un vídeo por petición, lo que lo sitúa en la categoría image-text-to-text además de text-generation.

Es relevante porque propone un patrón distinto al del chatbot: en lugar de generar texto libre, expone una interfaz de clasificación y puntuación calibrada pensada para sistemas de decisión automatizados, con métricas de calibración (Brier, ECE) publicadas y un runtime de SGLang parcheado y fijado por hash.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts causal (transformer), basada en Qwen3.6-35B-A3B |
| Parametros totales | 35.107.181.936 (~35 B) |
| Parametros activos | Aproximadamente 3 B por token |
| Longitud de contexto | No disponible como cifra de ventana; el runtime valida hasta 250.000 tokens de prefill |
| Tipos de cuantizacion | No disponible; la release se publica en BF16 (pesos fusionados) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, pesos fusionados), más bundle de servicio con checksums SHA-256 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE del checkpoint base Qwen/Qwen3.6-35B-A3B (revisión `995ad96eacd98c81ed38be0c5b274b04031597b0`), con 35 B de parámetros totales y unos 3 B activados por token, lo que permite servir el modelo completo en una sola GPU. Sobre esa base se aplicó un post-entrenamiento con LoRA de rango 16, posteriormente fusionado en los pesos BF16, orientado específicamente a tareas de decisión tipada. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica no está tanto en el entrenamiento como en el contrato de inferencia: la capa de servicio realiza una lectura determinista de logprobs sobre candidatos de un solo token, evalúa el orden de las opciones en sentido directo e inverso, aplica calibración de probabilidades y convierte al esquema solicitado. El runtime validado es una imagen de SGLang fijada por digest (`prakhar1611/xor-sglang@sha256:94c48d2a...`) que incorpora un parche menor sobre el manejo de resultados de candidate-logprob del SGLang upstream, evitando un fallo del planificador cuando coinciden en el mismo lote peticiones de scoring y de generación simple.

## Capacidades

- Clasificación binaria tipada (`noul`): devuelve una probabilidad binaria para una pregunta cerrada.
- Decisión categórica (`choice`): devuelve la opción elegida junto con la distribución de probabilidad completa sobre las alternativas.
- Puntuación ordinal (`score`): devuelve la puntuación esperada y su distribución completa.
- Procesamiento multimodal de entrada: hasta ocho imágenes en data URL o un vídeo en data URL por petición, para clasificar información contenida en el material aportado.
- Salida estructurada y validada contra esquema, con conversión de esquema realizada por la capa de servicio.
- Calibración de probabilidades integrada en el pipeline de inferencia, no delegada al consumidor.
- Reproducibilidad: pesos, runtime y artefactos verificables mediante `checksums.sha256` y `RELEASE_PROVENANCE.json`.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso en formato de agente, ni modos de pensamiento explícitos.

## Casos de uso

- Moderación y filtrado de contenido con umbral calibrado: usar la interfaz `noul` para obtener una probabilidad binaria por ítem y aplicar el umbral en el sistema consumidor; la calibración (ECE 0.0733 en el conjunto público) permite fijar cortes con significado probabilístico en lugar de scores arbitrarios.
- Triaje de tickets de soporte: enviar el estado del ticket y un mapa de preguntas `choice` (categoría, urgencia, equipo responsable) para obtener decisión y distribución completa, lo que permite derivar automáticamente los casos de baja confianza a revisión humana.
- Enrutamiento de documentos con material escaneado: adjuntar hasta ocho imágenes por petición y clasificar el tipo de documento o extraer una decisión sobre su contenido, aprovechando la entrada multimodal del modelo.
- Evaluación ordinal de calidad: emplear `score` para asignar puntuaciones esperadas en escalas ordenadas (por ejemplo, gravedad de una incidencia o calidad de una respuesta), con distribución completa para medir la incertidumbre del modelo.
- Verificación automática en pipelines de CI: integrar la API en un paso de validación que decida si un artefacto cumple criterios definidos, apoyándose en la reproducibilidad por revisión fijada y en los checksums del bundle.
- Análisis de vídeo corto para decisión: enviar un vídeo en data URL y plantear preguntas tipadas sobre su contenido, útil en inspección visual automatizada o clasificación de clips.
- Sistemas de decisión auditables: registrar la distribución de probabilidad devuelta junto con la versión exacta del modelo y del runtime, lo que facilita la trazabilidad en entornos regulados.

## Benchmarks y rendimiento

Resultados autoinformados sobre los niveles públicos de JEVBench (harness commit `1bcc55eb6c8cffde2306b3db03ede39b61c6152a`, adaptador `typesafe`, una petición a la vez, 1 x NVIDIA H200 NVL de 143 GB, TP=1, DP=1, caché de peticiones desactivada). No constituyen una clasificación oficial de JEVBench.

| Nivel | Intentadas | Válidas | Correctas | Exactitud | p50 | p95 |
|---|---:|---:|---:|---:|---:|---:|
| Easy | 48 | 48 | 48 | 1,0000 | 0,0679 s | 0,0709 s |
| Original | 72 | 72 | 69 | 0,9583 | 0,0670 s | 0,0701 s |
| Hard público | 111 | 111 | 91 | 0,8198 | 0,0832 s | 0,1845 s |
| **Todos los públicos** | **231** | **231** | **208** | **0,9004** | 0,0691 s | 0,1616 s |

Métricas agregadas sobre las 231 decisiones públicas: exactitud macro 0,9070, Brier medio 0,1790, ECE 0,0733. Éxito operativo, cobertura, validez de esquema y validez estricta de esquema: 1,0000 en todos los casos.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: los ficheros del modelo ocupan aproximadamente 66 GB en BF16, por lo que se necesita una GPU con al menos esa capacidad; el único hardware validado es 1 x NVIDIA H200 NVL de 143 GB.
- GPU recomendadas: NVIDIA H200 NVL (validada oficialmente). Otras GPU de 80 GB (A100, H100) no están validadas en la documentación y requerirían verificación independiente; el modelo no cabe en GPU de consumo en BF16.
- GPU de consumo: no cabe en tarjetas de 24 GB o 48 GB en la precisión publicada; no se ofrecen pesos cuantizados en la release.
- Despliegue: el único camino soportado es el bundle de servicio con la imagen SGLang fijada por digest, Docker Engine con Docker Compose v2 reciente, NVIDIA Container Toolkit y Linux x86-64. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Espacio en disco: aproximadamente 120 GB libres necesarios para el despliegue completo.
- Paralelismo: TP=1 y DP=1 en la configuración validada; cada worker de data parallelism carga una réplica completa del modelo.
- Latencia: p50 de 0,067-0,083 s y p95 de 0,070-0,185 s según nivel, medidas en local sin sobrecarga de red sobre H200 NVL. El throughput no se documenta.
- Límites operativos: cuerpo de petición máximo de 8 MB (unos 6 MB de material multimedia tras base64); peticiones mayores se rechazan con HTTP 422. Prefill máximo de 250.000 tokens y fracción de memoria estática de 0,85.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xor 1.2 (`juspay/jev-one`) | 35 B totales / ~3 B activos | Prefill validado hasta 250.000 tokens | Decisión tipada calibrada con capa de servicio propia | Apache 2.0 | Hugging Face, bundle Docker |
| Qwen/Qwen3.6-35B-A3B | 35 B totales / ~3 B activos | No disponible en la información | Modelo base generativo de propósito general | Apache 2.0 | Hugging Face |
| Alternativas de clasificación calibrada de tamaño comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no incluye datos de rendimiento de otras alternativas de clasificación tipada, por lo que no es posible establecer una comparación cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- El modelo está diseñado para preguntas tipadas, no para generación de texto libre; usarlo como chatbot general no es el caso de uso soportado.
- La API acepta imágenes y vídeo en la misma petición, pero el modelo no distingue de forma fiable entre ambos tipos de medio; se recomienda enviar un solo tipo por petición.
- El límite de 8 MB por petición restringe el tamaño del material multimedia a unos 6 MB tras codificación base64.
- Los resultados de JEVBench son autoinformados sobre los niveles públicos y no constituyen una clasificación oficial; la latencia es específica del hardware y se midió sin sobrecarga de red.
- La reproducibilidad depende de usar el bundle de servicio sin modificaciones y de fijar la revisión por hash de commit; `release/xor-1.2` es una rama y puede moverse.
- Solo se ha validado una configuración de hardware y paralelismo (1 x H200 NVL, TP=1, DP=1); cualquier otro ajuste debe validarse de forma independiente antes de publicar cifras de rendimiento.
- La model card indica `inference: false` en los metadatos y no documenta el uso de la librería transformers para inferencia directa, pese a figurar como `library_name`.
- El servicio no requiere clave de API cuando se despliega en la configuración por defecto (texto truncado en la documentación disponible); conviene revisar la exposición de red antes de ponerlo en producción.
- No se documentan sesgos conocidos, tasas de alucinación ni cobertura idiomática; al tratarse de un ajuste sobre Qwen3.6, los sesgos del modelo base son aplicables pero no están cuantificados en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse la atribución y verificar las obligaciones heredadas del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juspay/jev-one
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- JEVBench (harness de evaluación): https://github.com/fstandhartinger/jevbench
