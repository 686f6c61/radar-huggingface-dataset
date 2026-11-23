# kingjones777/Qwen3.6-35B-A3B-SuperRoc-GGUF

## Resumen

Qwen3.6-35B-A3B-SuperRoc-GGUF es una cuantización comunitaria en formato GGUF del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario kingjones777. Se trata de una conversión orientada específicamente al hardware AMD Strix Halo (APU Ryzen AI Max+ 395, arquitectura gráfica gfx1151) y al motor de inferencia local Super Roc, que emplea formatos ROCm-FP4 para acelerar la ejecución sobre memoria unificada. El modelo base es un transformer de tipo mixture-of-experts con 35.505.251.456 parámetros totales, según los datos de safetensors del repositorio.

La relevancia de esta ficha radica en que ejemplifica el ecosistema de cuantizaciones especializadas para hardware de consumo de gama alta con memoria unificada, un segmento en crecimiento frente a las soluciones basadas en GPU dedicadas. El paquete incluye un cuantizado principal Q4_0 con formato ROCMFP4 (19,64 GB) y un proyector multimodal BF16 (0,90 GB), lo que indica soporte de entrada de visión. Además, conserva el bloque MTP (multi-token prediction) del modelo original para decodificación especulativa.

No obstante, la información pública disponible es muy limitada: el repositorio no incluye model card detallada más allá de las instrucciones de ejecución y métricas del motor, no se declaran idiomas soportados y no se han publicado resultados de benchmarks del modelo. Las cifras de rendimiento que sí se aportan corresponden al motor Super Roc sobre el hardware indicado, no a evaluaciones comparativas de calidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo mixture-of-experts (MoE), según modelo base Qwen3.6-35B-A3B; detalles internos no disponibles |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (contexto cargado en la prueba del autor) |
| Tipos de cuantizacion | Q4_0 con formato ROCMFP4 (archivo principal); proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp/ggml), con extensión ROCm-FP4 |
| Tamano del repo | 20,5 GB |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Relacion con el base | Cuantizado |
| Biblioteca | gguf |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de tipo mixture-of-experts con 35.505 millones de parámetros totales, según los metadatos de safetensors. La model card del repositorio no aporta información sobre el número de parámetros activos por token, la composición del dataset de entrenamiento, el volumen de tokens procesados ni las técnicas de alineación empleadas (RLHF, DPO u otras). Tampoco se detallan innovaciones arquitectónicas del modelo base más allá de su naturaleza MoE.

La contribución específica de esta publicación es la cuantización: se ha generado un archivo Q4_0 con formatos ROCm-FP4, una variante de cuantización de 4 bits optimizada para las unidades de cómputo matricial de las GPU integradas de AMD en la plataforma Strix Halo. El proceso incluye el uso de imatrix (matriz de importancia) para calibrar la cuantización, según las etiquetas del repositorio. Además, se conserva el bloque MTP (multi-token prediction) del modelo original, que actúa como drafter para decodificación especulativa en el motor Super Roc, con una profundidad de borrador de 2 y un mínimo de 1 token de borrador por paso. El paquete incorpora también un proyector multimodal BF16 (mmproj) que habilita el procesamiento de imágenes.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Razonamiento con modo de pensamiento (thinking) configurable: desactivado por defecto en el comando de ejemplo, activable por petición mediante `chat_template_kwargs.enable_thinking`.
- Procesamiento de visión: la prueba del autor reporta resultado "pass" en la evaluación de visión, con el proyector mmproj BF16 incluido en el repositorio.
- Llamada a herramientas (tool calling): las métricas del autor registran 7/8 en llamadas requeridas y 6/8 en llamadas automáticas.
- Decodificación especulativa mediante el bloque MTP conservado del modelo base.
- Caché de prompt: la segunda vuelta de conversación reutilizó 6.961 de 6.986 tokens de prompt.
- Soporte de contexto largo: 131.072 tokens cargados en la prueba.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente más allá del soporte de tool calling.

## Casos de uso

- Asistente conversacional local en estación de trabajo con APU Strix Halo: el modelo puede gestionar conversaciones multi-turno con ventana de 131.072 tokens y caché de prompt, lo que reduce el coste de reprocesamiento en diálogos largos. Adecuado para entornos sin GPU dedicada pero con 128 GB de memoria unificada.
- Automatización con herramientas en flujos de desarrollo: el soporte de tool calling (7/8 en pruebas requeridas) permite integrar el modelo en pipelines que invocan APIs, ejecutan comandos o consultan bases de datos, con el motor Super Roc exponiendo una API compatible con endpoints.
- Análisis de documentos e imágenes en local: la combinación del modelo con el proyector mmproj BF16 permite procesar capturas, diagramas o documentos escaneados sin enviar datos a servicios externos, relevante por privacidad.
- Generación de código en entornos de desarrollo integrado: las métricas del autor reportan 127,5 tok/s en generación de código, suficiente para autocompletado y generación de fragmentos en un IDE conectado a la API local.
- Prototipado e investigación sobre decodificación especulativa: al conservar el bloque MTP, sirve como banco de pruebas para estudiar el impacto de la decodificación especulativa en hardware ROCm de memoria unificada.
- Despliegue en laboratorios docentes o de investigación con hardware AMD: permite experimentar con un modelo MoE de 35B en equipos de escritorio con Ryzen AI Max+ 395, sin necesidad de clústeres con GPU dedicadas.
- Evaluación de cuantizaciones ROCm-FP4: útil para comparar la calidad y velocidad de formatos de 4 bits específicos de AMD frente a cuantizaciones GGUF convencionales en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas aportadas por el autor corresponden al rendimiento del motor Super Roc sobre un Ryzen AI Max+ 395 con 128 GB y Super Roc 0.20.0, con una petición simultánea, medidas el 2026-11-23:

| Metrica | Valor |
|---|---|
| Tiempo de carga (s) | 19 |
| Prompt tok/s (p1k) | 1.734,7 |
| Prompt tok/s (p8k) | 1.845,2 |
| Generacion tok/s (p1k) | 90,4 |
| Generacion tok/s (p8k) | 195,08 |
| Generacion de codigo tok/s | 127,5 (media de 2 prompts) |
| Tool calls (requeridas / automaticas) | 7/8 / 6/8 |
| Cache de prompt, turno 2 (cacheado / total) | 6.961 / 6.986 |
| Contexto cargado | 131.072 tokens |
| Vision | pass |
| Drafter | mtp |

## Requisitos de hardware

- VRAM/memoria estimada: el archivo principal ocupa 19,64 GB y el proyector multimodal 0,90 GB, por lo que se requiere al menos unos 21 GB de memoria disponible para pesos, más espacio para caché KV y buffers de contexto. Con 131.072 tokens de contexto, el consumo adicional de caché KV puede ser considerable y no está cuantificado en la información disponible.
- Hardware de referencia: Ryzen AI Max+ 395 (Strix Halo, gfx1151) con 128 GB de memoria unificada, donde el autor reporta carga en 19 segundos y contexto de 131.072 tokens.
- GPU dedicadas: no se documenta compatibilidad con A100, H100 ni RTX 4090; el formato ROCMFP4 está orientado a las unidades matriciales de las GPU integradas AMD de Strix Halo. Para GPU NVIDIA sería más adecuado un GGUF convencional del modelo base.
- GPU de consumo: cabe en equipos con memoria unificada de al menos 32 GB; en GPU dedicadas de consumo no se ha validado en la información disponible.
- Opciones de despliegue: motor Super Roc (serve/llm), integración con Lemonade mediante configuración de `llamacpp.rocm_bin`; al ser GGUF, podría ser compatible con llama.cpp/ggml en teoría, pero el formato ROCMFP4 y el bloque MTP requieren el motor específico para aprovecharse.
- Latencia y throughput: según las métricas del autor, 90,4 tok/s de generación con prompt de 1k y 195,08 tok/s con prompt de 8k, con una sola petición concurrente; no se documenta rendimiento con concurrencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de cuantizaciones comparables en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros totales | Contexto | Licencia | Formato / hardware objetivo |
|---|---|---|---|---|
| Qwen3.6-35B-A3B-SuperRoc-GGUF (esta ficha) | 35.505.251.456 | 131.072 tokens (cargado) | Apache 2.0 | GGUF ROCMFP4, Strix Halo / Super Roc |
| Qwen/Qwen3.6-35B-A3B (base) | 35.505.251.456 | no disponible | Apache 2.0 | safetensors, GPU dedicadas |
| Otras cuantizaciones GGUF del mismo base | 35.505.251.456 | no disponible | Apache 2.0 | GGUF convencional, llama.cpp |

Rendimiento comparativo: no disponible. No se han publicado resultados de benchmarks que permitan contrastar calidad o velocidad frente a alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser una cuantización del modelo base, hereda los sesgos de este, que tampoco se detallan.
- Riesgo de alucinación: no cuantificado; no se han publicado evaluaciones de fiabilidad del modelo base ni de esta cuantización.
- Idiomas: no se declaran idiomas soportados en el repositorio, lo que impide garantizar cobertura multilingüe.
- Contexto e idioma: aunque se cargan 131.072 tokens, no se documenta la calidad de recuperación en contextos largos ni el consumo de memoria de la caché KV a esa longitud.
- Licencia: Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Qwen/Qwen3.6-35B-A3B y de los componentes de terceros citados (ROCmFPX, llama.cpp/ggml bajo MIT).
- Dependencia de hardware y motor: el formato ROCMFP4 y el bloque MTP están pensados para Super Roc sobre Strix Halo; en otros entornos el rendimiento y la compatibilidad no están garantizados.
- Rendimiento medido en condiciones muy específicas: una sola petición, versión candidata del motor, sin pruebas de concurrencia ni de estabilidad a largo plazo.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día, sin validación comunitaria.
- Tool calling imperfecto: 7/8 en llamadas requeridas y 6/8 en automáticas implica fallos ocasionales que requieren manejo de errores en producción.
- Proyector multimodal en BF16: añade 0,90 GB y requiere soporte del motor para visión; no se detalla el rango de resolución o tipos de imagen soportados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Qwen3.6-35B-A3B-SuperRoc-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Motor Super Roc: https://github.com/kingjones30/superroc
- Documentación de integración con Lemonade: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- Proyecto ROCmFPX: https://github.com/charlie12345/ROCmFPX
