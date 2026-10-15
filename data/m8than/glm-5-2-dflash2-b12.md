# m8than/GLM-5.2-DFlash2-B12

## Resumen

GLM-5.2-DFlash2-B12 es un modelo borrador (draft model) experimental de 2.289.554.560 parámetros en BF16, publicado por el usuario m8than, diseñado exclusivamente para decodificación especulativa sobre el modelo objetivo GLM-5.2-FP8 dentro del runtime Furnace. No es un modelo de lenguaje autónomo: no incluye embeddings, cabeza de salida ni tokenizador propios, y su funcionamiento depende por completo del runtime del modelo objetivo, que no se distribuye en este repositorio.

La arquitectura declarada es DFlash2DraftModel, con seis capas, tamaño oculto de 6.144, tamaño intermedio de 12.288, 64 cabezas de consulta, ocho cabezas KV y dimensión de cabeza de 96. Incorpora innovaciones como convoluciones dinámicas agrupadas (kernel 2, tamaño de grupo 16) y un selector de candidatos aprendido (rango 256, top-k 16), que la diferencian de la arquitectura DFlashDraftModel original. Los pesos ocupan 4,6 GB y se almacenan en 96 tensores BF16.

Su relevancia es acotada y debe interpretarse con cautela. El propio autor documenta una tasa de aceptación en servicio de solo el 17,08% (2,87 tokens de salida por verificación), prácticamente idéntica a la del checkpoint local previo (17,15% y 2,87), y afirma explícitamente que este lanzamiento no demuestra una mejora sobre aquel. Se trata, por tanto, de un artefacto de investigación sobre decodificación especulativa, no de un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DFlash2DraftModel (modelo borrador para decodificación especulativa; backbone de tipo qwen3) |
| Parámetros totales | 2.289.554.560 (2,29B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (máximo de entrenamiento; el servicio de referencia usó un límite de 8.192) |
| Tipos de cuantización | BF16 únicamente (96 tensores BF16); no se publican cuantizaciones GGUF, AWQ o GPTQ |
| Idiomas soportados | No disponible (el entrenamiento incluyó ocho idiomas distintos del inglés, sin especificar cuáles) |
| Licencia | No disponible (el modelo objetivo declara MIT, pero el donante del que hereda los pesos no declara licencia ni incluye fichero de licencia) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa con bloques de 12 tokens: 11 posiciones de borrador y un token objetivo. Emplea seis capas con atención de 64 cabezas de consulta y ocho cabezas KV (dimensión de cabeza 96), convoluciones dinámicas agrupadas con kernel 2 y grupo 16, y un selector de candidatos aprendido de rango 256 y top-k 16. Las capas del modelo objetivo de las que extrae características son `[1, 16, 31, 45, 60, 75]`. Un tamaño de bloque de 12 no implica 12 tokens aceptados ni una aceleración de 12x.

La procedencia es enrevesada. El backbone original proviene de `SubconsciousDev/glm-5.2-fp8-dflash-v2` (revisión `b45e4c46ed2902771d47c2cd09ee17870bb8be24`), que a pesar de su nombre usaba la arquitectura DFlash original. La conversión local conservó 69 tensores del backbone e inicializó desde cero los nuevos tensores de convolución y selector de DFlash2. Tras un piloto local de 512 pasos y una ejecución de 5.000 pasos (de la que se seleccionó el paso 4.000), la adaptación final aquí publicada se entrenó durante dos épocas sobre 1.600 ejemplos variados: 400 pasos de optimizador nuevos, batch global 8, 2.997.462 tokens de secuencia y 2.002.397 tokens de asistente supervisados en el corpus único (3.200 presentaciones de ejemplo en ambas épocas). El dataset cubre conversación, escritura, multiturno, tareas con contexto suministrado, código, matemáticas, ciencia, lógica y ocho idiomas no ingleses, con 457 ejemplos multiturno y 316 ejemplos de tipo thinking.

La adaptación usó destilación de etiquetas duras y de estados ocultos, no destilación KL sobre log-probabilidades suaves. Todas las respuestas finales fueron decodificadas localmente por Furnace GLM-5.2-FP8 y las respuestas originales del dataset fuente se descartaron para esta fase. Los tokens de sistema, usuario y plantilla, así como los turnos previos, se excluyeron de la pérdida. Hiperparámetros: contexto máximo 8.192, 128 anclas por ejemplo, tasa de aprendizaje 3e-5, 4% de warmup y validación en los pasos 200 y 400.

## Capacidades

- No genera texto de forma autónoma: es un modelo borrador que propone tokens para que el modelo objetivo (GLM-5.2-FP8) los verifique.
- Decodificación especulativa con bloques de 12 tokens (11 posiciones de borrador más un token objetivo).
- Predicción de tokens sobre características internas extraídas de las capas `[1, 16, 31, 45, 60, 75]` del modelo objetivo.
- Selección de candidatos mediante un módulo aprendido (rango 256, top-k 16) y convoluciones dinámicas agrupadas.
- Entrenado sobre mezcla multitarea (conversación, código, matemáticas, ciencia, lógica, multiturno y contexto suministrado), aunque dicha capacidad solo se manifiesta a través del modelo objetivo.
- Soporte de tool calling, function calling, agentes, visión o audio: no disponible; no se documenta ninguna de estas capacidades para el borrador.
- Capacidades multilingües: no disponible; el entrenamiento incluyó ocho idiomas no ingleses sin especificar.

## Casos de uso

- Investigación en decodificación especulativa: el modelo sirve como sujeto de experimentación para medir tasas de aceptación con distintos tamaños de bloque, backends de atención y distribuciones de prompt sobre GLM-5.2-FP8.
- Servicio de inferencia de GLM-5.2-FP8 con aceleración especulativa: desplegado junto al modelo objetivo en Furnace con `--speculative-algorithm DFLASH` y `--speculative-dflash-block-size 12`, siempre que la ganancia medida justifique el coste de memoria adicional.
- Ajuste fino de borradores sobre dominios concretos: el pipeline documentado (destilación de etiquetas duras y estados ocultos, 400 pasos, batch 8) sirve de plantilla para adaptar el borrador a un corpus especializado y volver a medir la aceptación.
- Comparación de arquitecturas de borrador: permite contrastar DFlash2DraftModel (con convoluciones dinámicas y selector) frente a la arquitectura DFlash original usando la misma suite de sondas.
- Validación de cadenas de herramientas ROCm/AITER: el montaje de referencia (ocho MI325X, TP8, backend de atención triton, KV cache BF16) es un banco de pruebas para stacks AMD en decodificación especulativa.
- Análisis de robustez multilingüe y multiturno en borradores: los 457 ejemplos multiturno y los ocho idiomas del corpus permiten estudiar cómo varía la aceptación según el tipo de prompt.
- Docencia y reproducción de resultados: al publicarse el recuento agregado de tokens propuestos y aceptados (8.051 de 47.146 en 4.286 iteraciones de verificación), es un caso reproducible de evaluación de decodificación especulativa.
- No se recomienda su uso como chatbot, asistente de código o cualquier aplicación final que requiera un modelo de lenguaje completo.

## Benchmarks y rendimiento

El autor publica una evaluación diagnóstica sobre 48 sondas cortas de servicio, con un límite de generación de 256 tokens por petición. No es un benchmark exhaustivo.

| Checkpoint | Aceptación del borrador | Tokens de salida por verificación |
|---|---:|---:|
| Checkpoint local previo | 17,1485% | 2,8739 |
| Esta versión (época 2 / paso 400) | 17,0767% | 2,8670 |

Detalle de la medición de esta versión: 8.051 de 47.146 tokens de borrador propuestos fueron aceptados a lo largo de 4.286 iteraciones de verificación, produciendo 12.288 tokens de salida. La aceptación se define como tokens de borrador aceptados dividido entre tokens propuestos, no como la probabilidad de aceptar un bloque completo, y los tokens de salida por verificación no equivalen a una aceleración medida en tiempo de reloj. La puntuación offline sobre prefijos reservados fue de 4,2123 en la época uno y 4,2256 en la época dos; esas puntuaciones offline no son aceptación del verificador en vivo. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este modelo.

## Requisitos de hardware

- VRAM para los pesos del borrador: aproximadamente 4,6 GB en BF16 (el repositorio ocupa 4,6 GB), a lo que hay que sumar la caché KV del borrador. Cifra derivada del tamaño del repositorio, no publicada por el autor.
- Memoria adicional obligatoria: el modelo objetivo GLM-5.2-FP8 no está incluido y debe servirse en paralelo, con su propio consumo de VRAM.
- Configuración de referencia medida: ocho GPU AMD MI325X, tensor paralelo 8 (TP8), caché KV en BF16, límite de contexto de 8.192 tokens y hasta cuatro peticiones concurrentes.
- GPU de consumo: no disponible. No se documenta ningún despliegue en RTX 4090, RTX 3090 u otras GPU consumer, y el stack de referencia es ROCm sobre MI325X.
- Opciones de despliegue: exclusivamente un runtime Furnace que soporte esta arquitectura DFlash2 exacta y el layout de características de GLM-5.2. No es compatible con carga como modelo Qwen3 genérico ni se asume compatibilidad con una versión arbitraria de SGLang.
- Flags de referencia: `--speculative-algorithm DFLASH`, `--speculative-draft-model-path m8than/GLM-5.2-DFlash2-B12`, `--speculative-dflash-block-size 12`, `--speculative-draft-attention-backend triton`, `--speculative-draft-kv-cache-dtype bfloat16`, `--attention-backend dsa`, `--dsa-prefill-backend aiter`, `--dsa-decode-backend aiter`.
- Latencia y throughput: no disponible. El autor indica expresamente que los tokens de salida por verificación no constituyen una medida de aceleración en tiempo de reloj.
- Alternativas de despliegue como llama.cpp, Ollama, vLLM o TGI: no soportadas para esta arquitectura según la documentación disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables externos en la información proporcionada. La única comparación con cifras publicadas es contra el checkpoint local previo del mismo linaje:

| Modelo | Parámetros | Contexto | Aceptación del borrador | Tokens de salida por verificación | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| GLM-5.2-DFlash2-B12 (esta versión) | 2,29B | 8.192 | 17,0767% | 2,8670 | No disponible | HuggingFace, 0 descargas |
| Checkpoint local previo | No disponible | No disponible | 17,1485% | 2,8739 | No disponible | No público |
| Otros borradores de decodificación especulativa (EAGLE, Medusa, DFlash original, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: sin el modelo objetivo GLM-5.2-FP8 y un runtime Furnace compatible, el checkpoint es inservible.
- Rendimiento plano: la aceptación medida (17,08%) es ligeramente inferior a la del checkpoint previo (17,15%) y el autor afirma explícitamente que no demuestra mejora alguna. El propio nombre "bloque de 12" no implica 12 tokens aceptados ni 12x de aceleración.
- Estado experimental declarado por el autor; la capacidad en contexto largo no está establecida.
- Licencia sin resolver: el modelo objetivo declara MIT, pero el donante `SubconsciousDev/glm-5.2-fp8-dflash-v2` y su predecesor inmediato no declaran licencia ni incluyen fichero de licencia. Esta publicación no asigna licencia nueva a los pesos heredados ni infiere permisos de la licencia del modelo objetivo. Los términos de redistribución del donante siguen sin resolverse y deben revisarse antes de redistribuir o ampliar el uso.
- Licencias mixtas en las fuentes de los prompts: deben revisarse antes de cualquier uso más amplio.
- Riesgo de alucinación: no aplica de forma directa al ser un borrador, pero cualquier error de predicción se traduce en rechazos del verificador y en menor rendimiento efectivo, no en texto incorrecto visible.
- Sesgos: no disponible; el autor no publica análisis de sesgos.
- Idiomas: el corpus incluyó ocho idiomas no ingleses sin identificar; no se garantiza cobertura de ninguna lengua concreta.
- Contexto limitado a 8.192 tokens en entrenamiento y en el servicio de referencia; no hay evidencia de generalización más allá.
- Reproducibilidad limitada: la evaluación se basa en 48 sondas cortas con tope de 256 tokens, un conjunto diagnóstico pequeño y no representativo de cargas de producción.
- Sin adopción ni validación externa: 0 descargas y 0 likes, sin resultados de terceros que confirmen las cifras.
- No incluye ejemplos de entrenamiento ni conversaciones privadas; los identificadores de fuentes de prompts, revisiones y licencias declaradas están en `training_metadata.json`.
- La garantía de etiquetas generadas únicamente por el profesor aplica solo a la adaptación final, no a toda la ascendencia del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/m8than/GLM-5.2-DFlash2-B12
- Modelo base / donante del backbone: https://huggingface.co/SubconsciousDev/glm-5.2-fp8-dflash-v2
- Modelo objetivo (no incluido): https://huggingface.co/zai-org/GLM-5.2-FP8
- Ficheros de métricas y metadatos citados por el autor: `metrics.json` y `training_metadata.json` en el repositorio del modelo
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron únicamente páginas sin relación (creadores de cartas de Limbus Company).
