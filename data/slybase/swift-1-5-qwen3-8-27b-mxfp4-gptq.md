# slybase/Swift-1.5-Qwen3.8-27B-MXFP4-GPTQ

## Resumen

Swift-1.5-Qwen3.8-27B-MXFP4-GPTQ es una versión cuantizada del checkpoint `akumaburn/Swift-1.5-Qwen3.8-27b-heretic`, un modelo de 27.000 millones de parámetros derivado de la familia Qwen3.8 y publicado por el usuario slybase. La cuantización aplica GPTQ con el esquema MXFP4 (pesos `fp4_e2m1` con escalas `e8m0` y tamaño de grupo 32) en formato `compressed-tensors` `mxfp4-pack-quantized`, manteniendo las activaciones en 16 bits, es decir, un esquema W4A16 de solo pesos. El objetivo es reducir el peso en disco y el ancho de banda de memoria necesario para servir el modelo en hardware con ruta nativa MXFP4, en concreto AMD RDNA4 (gfx1201).

El modelo es multimodal: conserva el torreón de visión sin cuantizar y mantiene el pipeline `image-text-to-text`, además de una cabeza MTP (multi-token prediction) también sin cuantizar. El linaje parte de `Qwen/Qwen3.8-27B` (Apache-2.0), pasa por `ukisai/Swift-1.5-Qwen3.8-27b` (Swift Open License v1.0) y termina en la variante «heretic», a la que se le ha eliminado deliberadamente la alineación de seguridad (abliterated/uncensored). Este checkpoint hereda esa característica, por lo que se distribuye explícitamente como artefacto de investigación, sin garantías y con la advertencia de que puede complacer peticiones dañinas que el modelo original rechazaría.

La relevancia actual del checkpoint es doble: por un lado, sirve como referencia de cuantización MXFP4 con GPTQ sobre un modelo de 27B y como checkpoint origen del contenedor Radiance `slybase/Swift-1.5-Qwen3.8-27b-heretic-MXFP4-DFlash2-radiance`, usado para evaluar la imagen `vllm-sly-radiance`; por otro, ejemplifica el ecosistema emergente de despliegue en GPU AMD RDNA4 con decodificación especulativa mediante un drafter DFlash2. No hay cifras de calidad publicadas para este checkpoint concreto, ni datos de benchmarks ni de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline `image-text-to-text`; tag de arquitectura `qwen3_5`), con torre de visión y cabeza MTP. Detalles internos: no disponible |
| Parametros totales | 27B (según el nombre del checkpoint; no confirmado en la model card) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 con GPTQ: pesos `fp4_e2m1`, escalas `e8m0`, tamaño de grupo 32, esquema `MXFP4A16` (W4A16, solo pesos; activaciones en 16 bits). `lm_head`, torre de visión y cabeza MTP sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | `swift-open-license-1.0` (uso comercial limitado a empresas con ingresos anuales inferiores a 1 millón de USD); el componente Qwen3.8-27B es Apache-2.0 |
| Formato de pesos | safetensors en formato `compressed-tensors` (`mxfp4-pack-quantized`); conversión a contenedor `.rad` mediante `rad-convert` |
| Cuantizador | `llm-compressor` con `GPTQModifier`, pipeline secuencial, act-order estático, 89 muestras de calibración, longitud máxima de secuencia 2048 |
| Tamano en disco | ~19 GB según el autor; los metadatos del repositorio en HuggingFace indican 2,6 GB |
| Parametros de muestreo por defecto | temperature 1.0, top-p 0.95, top-k 20 (`generation_config.json`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de la etiqueta de pipeline (`image-text-to-text`), el tag de arquitectura `qwen3_5` y la mención explícita de tres componentes diferenciados: las capas `Linear` del modelo de lenguaje, un torreón de visión y una cabeza MTP almacenada en `model_mtp.safetensors`. La presencia de torre de visión confirma capacidad multimodal de entrada (imagen y texto a texto) y la cabeza MTP apunta a predicción multi-token, un mecanismo habitualmente asociado a decodificación especulativa o a objetivos de entrenamiento auxiliares. No se especifica si el modelo es denso o de mezcla de expertos, ni el número de capas, dimensión oculta o mecanismo de atención.

Lo que sí se documenta con precisión es el proceso de cuantización. Se parte del checkpoint abliterado en BF16 y se aplica `GPTQModifier` de `llm-compressor` con el esquema `MXFP4A16`, usando un pipeline secuencial con act-order estático sobre 89 muestras de calibración y una longitud máxima de secuencia de 2048 tokens. Los pesos resultantes usan el formato OCP MXFP4 (`fp4_e2m1` para los valores, escalas `e8m0`, grupo de 32) y se empaquetan en `compressed-tensors`. Se trata de una cuantización de solo pesos: las activaciones permanecen en 16 bits, por lo que el ahorro de memoria se concentra en los pesos y el cálculo sigue requiriendo rutas de 16 bits. No se documentan detalles del entrenamiento del modelo original, la composición del dataset, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno: el modelo declara el pipeline `text-generation` y la etiqueta `conversational`.
- Procesamiento de imagen y texto: el pipeline es `image-text-to-text` y el torreón de visión se conserva sin cuantizar, por lo que mantiene capacidad de entrada visual.
- Predicción multi-token: incluye una cabeza MTP (`model_mtp.safetensors`) sin cuantizar.
- Decodificación especulativa: se documenta su uso conjunto con el drafter `syvai/Qwen3.8-27B-DFlash2-W4A16` dentro del contenedor Radiance.
- Respuestas sin filtros de seguridad: la variante «heretic» ha eliminado la alineación del modelo original, de modo que el modelo intentará cumplir peticiones que el modelo base rechazaría.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas figuran como no disponibles).
- Capacidades de audio: no disponible.

## Casos de uso

- Investigación sobre cuantización MXFP4: este checkpoint permite medir el impacto de una cuantización W4A16 con GPTQ, grupo 32 y act-order estático sobre un modelo de 27B, comparando contra el BF16 de origen para estudiar degradación por capa y por tipo de tarea.
- Evaluación de alineación y seguridad: al tratarse de un modelo con la alineación deliberadamente eliminada, resulta un caso de estudio controlado para medir tasas de cumplimiento de peticiones dañinas en modelos abliterated y para calibrar clasificadores de seguridad externos.
- Despliegue en GPU AMD RDNA4: el checkpoint está pensado y probado sobre Radeon AI PRO R9700 (gfx1201) con la imagen `vllm-sly-radiance`, por lo que sirve para validar stacks de inferencia en hardware AMD con ruta nativa MXFP4.
- Decodificación especulativa en producción: combinado con el drafter DFlash2 `syvai/Qwen3.8-27B-DFlash2-W4A16`, se usa en el contenedor Radiance para estudiar ganancias de throughput en generación autoregresiva con verificación especulativa.
- Análisis de documentos con componente visual: al conservar la torre de visión sin cuantizar y aceptar entradas imagen-texto, puede emplearse en tareas de descripción de imágenes o extracción de información de capturas y diagramas, sujeto a validación previa de calidad.
- Prototipado en investigación de multimodalidad con presupuesto de VRAM ajustado: sus ~19 GB de pesos en disco permiten cargar un modelo de 27B multimodal en GPUs de 32 GB o más sin recurrir a paralelismo de tensor, siempre que el motor soporte la ruta MXFP4.
- Base para conversión y reempaquetado de formatos: al publicarse en `compressed-tensors`, sirve como punto de partida para conversiones a `.rad` con `rad-convert` u otros formatos soportados por el motor de destino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que todavía no hay cifras de calidad publicadas para este checkpoint de forma aislada.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Otros | no disponible |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia derivada, los pesos ocupan unos 19 GB según el autor, a lo que hay que sumar caché KV, activaciones en 16 bits y el torreón de visión, que no está cuantizado. Con 32 GB de VRAM hay margen razonable para secuencias moderadas; la cifra exacta depende del motor y de la longitud de contexto.
- GPU recomendadas: AMD Radeon AI PRO R9700 (RDNA4, gfx1201), que es el hardware sobre el que el autor indica haber producido y probado el checkpoint. No se documentan pruebas en otras GPU.
- Cabe en GPU de consumo: no disponible. El tamaño de pesos (~19 GB) excede la VRAM de la mayoría de GPU de consumo de gama media; no se confirma funcionamiento en ninguna GPU de consumo concreta.
- Requisito de motor: se necesita un motor de inferencia con ruta de pesos MXFP4 para el hardware objetivo. En otras arquitecturas no se garantiza soporte sin conversión previa.
- Opciones de despliegue: `vllm-sly-radiance` (imagen de vLLM específica del autor) y el runtime Radiance (codeberg.org/StillDeadcode/radiance), previa conversión a `.rad` con `rad-convert`. Soporte en llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponible. El modelo se usa como referencia de benchmark de la imagen `vllm-sly-radiance` junto al drafter DFlash2, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| slybase/Swift-1.5-Qwen3.8-27B-MXFP4-GPTQ (este) | 27B | no disponible | safetensors, MXFP4 GPTQ W4A16, compressed-tensors | swift-open-license-1.0 | Artefacto de investigación, alineación eliminada, probado en RDNA4 gfx1201 |
| akumaburn/Swift-1.5-Qwen3.8-27b-heretic | 27B | no disponible | BF16 | swift-open-license-1.0 (heredada) | Checkpoint de origen, alineación eliminada, sin cuantizar |
| ukisai/Swift-1.5-Qwen3.8-27b | 27B | no disponible | no disponible | Swift Open License v1.0 | Modelo «Swift» previo a la variante heretic |
| Qwen/Qwen3.8-27B | 27B | no disponible | no disponible | Apache-2.0 | Modelo base original, con alineación intacta |
| syvai/Qwen3.8-27B-DFlash2-W4A16 | no disponible | no disponible | W4A16 | no disponible | Drafter para decodificación especulativa, no es un modelo de chat |

## Limitaciones y advertencias

- Alineación de seguridad eliminada de forma deliberada: el modelo intentará cumplir peticiones dañinas que el modelo original rechaza. La model card lo marca como artefacto de investigación, sin garantía y sin responsabilidad del autor.
- Riesgo de uso indebido: no debe desplegarse en aplicaciones orientadas al público ni en entornos de producción sin capas de moderación externas.
- Riesgo de alucinación: no disponible de forma específica para este checkpoint; al ser una cuantización de un modelo derivado, hereda las limitaciones del original, que no se documentan.
- Sesgos: no disponible. No se publica ninguna evaluación de sesgos.
- Limitaciones de contexto e idioma: no se documenta la longitud de contexto soportada ni la lista de idiomas.
- Ausencia de métricas de calidad: el autor no publica ninguna cifra de calidad para este checkpoint concreto, por lo que la degradación introducida por la cuantización MXFP4 no está cuantificada.
- Restricción de licencia comercial: la Swift Open License v1.0 limita el uso comercial a organizaciones con ingresos anuales inferiores a 1 millón de USD. El componente Qwen3.8-27B se rige por Apache-2.0. La redistribución debe mantener sin cambios los ficheros `LICENSE`, `LICENSE-APACHE-2.0` y `NOTICE`.
- Requisito de hardware específico: el checkpoint necesita un motor con ruta de pesos MXFP4; su uso fuera de AMD RDNA4 no está documentado ni validado.
- Discrepancia de tamaño: el autor indica ~19 GB en disco mientras que los metadatos del repositorio en HuggingFace registran 2,6 GB. Conviene verificar los ficheros reales antes de planificar el despliegue.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y no se han publicado evaluaciones independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/slybase/Swift-1.5-Qwen3.8-27B-MXFP4-GPTQ
- Modelo base (abliterated, BF16): https://huggingface.co/akumaburn/Swift-1.5-Qwen3.8-27b-heretic
- Modelo Swift previo: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia Swift Open License v1.0: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Modelo base original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Contenedor Radiance derivado: https://huggingface.co/slybase/Swift-1.5-Qwen3.8-27b-heretic-MXFP4-DFlash2-radiance
- Drafter DFlash2: https://huggingface.co/syvai/Qwen3.8-27B-DFlash2-W4A16
- Imagen de inferencia vllm-sly-radiance: https://github.com/SlyBase/vllm-sly-radiance
- Runtime Radiance: https://codeberg.org/StillDeadcode/radiance
