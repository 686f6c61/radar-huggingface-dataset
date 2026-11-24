# chriswolf1987/Inkling-2-Mini-oQ8e

## Resumen

Inkling-2-Mini-oQ8e es una cuantización mixta del modelo Inkling-2-Mini, publicada por el usuario chriswolf1987 en Hugging Face. El checkpoint resultante contiene 26.388 millones de parámetros en el modelo de lenguaje (más 0.318 millones en un componente de visión), lo que sitúa al modelo original en la categoría de ~26B parámetros. La cuantización se ha realizado con la herramienta oQ (oMLX v0.8.3), que aplica precisión mixta por tensor en lugar de un esquema uniforme.

El resultado es un checkpoint de 18.8 GB que combina cuatro formatos de almacenamiento distintos (NVFP4, affine 8-bit, MXFP8 y BF16/FP32 sin cuantizar) con un promedio efectivo de 5.619 bits por peso. La mayor parte del cómputo (76.3% de los pesos lógicos) se almacena en NVFP4 con grupo de 16, mientras que las capas presumiblemente más sensibles se conservan en 8 bits o en BF16.

La relevancia de esta ficha es doble: por un lado documenta una técnica de cuantización mixta poco habitual (combinación de NVFP4 con MXFP8 y affine en un mismo checkpoint); por otro, advierte de que se trata de una publicación de un tercero, con cero descargas y sin model card del autor original, lo que limita seriamente su trazabilidad y su uso en producción. El formato es específico para MLX (Apple Silicon) y no es directamente portable a ecosistemas CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `inkling2_loop` sugiere un transformer con mecanismo de bucle o recurrencia, sin confirmar) |
| Parametros totales | 26.388.646.400 (modelo de lenguaje) + 0.318B (visión) = 26.707B lógicos |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: NVFP4 grupo 16 (76.3%), MXFP8 grupo 32 (15.3%), affine 8-bit grupo 64 (5.9%), BF16 (2.4%), FP32 (0.1%); promedio 5.619 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, librería MLX (no GGUF) |
| Tamano del repositorio | 18.8 GB (17.470 GiB de pesos) |
| Fecha de publicacion | 2026-11-23 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Inkling-2-Mini: ni el número de capas, ni el tipo de atención, ni si emplea mezcla de expertos. El único indicio es el tag `inkling2_loop`, que podría apuntar a un diseño con capas recurrentes o compartidas en bucle, pero no hay documentación que lo confirme. Tampoco se conocen los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF o DPO) ni innovaciones técnicas del modelo original.

Lo que sí está documentado es el proceso de cuantización. La herramienta oQ de oMLX v0.8.3 asigna un formato distinto a cada tensor según su sensibilidad: los pesos de las capas de lenguaje se reparten entre NVFP4 (formato de 4 bits con escala de bloque, típico de las GPU Blackwell de NVIDIA), MXFP8 (8 bits con escala compartida por bloque de 32), affine de 8 bits con grupo de 64 y un pequeño residuo en BF16 y FP32 que probablemente corresponde a embeddings, normas o cabezas de salida. Esta estrategia busca preservar la calidad en las capas críticas a costa de comprimir agresivamente el resto. El componente de visión (0.318B) se almacena íntegramente en BF16.

## Capacidades

- Generación de texto y razonamiento: capacidades inferidas por el tamaño del modelo base, no verificadas en la información disponible.
- Procesamiento de imágenes: el checkpoint incluye un componente de visión de 0.318B parámetros, lo que indica que el modelo base es multimodal (visión-lenguaje).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking): no disponible.
- Ejecución en Apple Silicon vía MLX: capacidad confirmada por el formato del checkpoint.

## Casos de uso

- Inferencia local en Mac con memoria unificada: con 18.8 GB de pesos, el modelo cabe en equipos Apple Silicon de 24 GB o 32 GB de RAM unificada, lo que permite ejecutar un modelo de ~26B en un portátil o Mac mini sin GPU dedicada.
- Prototipado de asistentes multimodales en local: el componente de visión permite experimentar con tareas imagen-texto sin enviar datos a la nube, útil para pruebas de concepto con material sensible.
- Evaluación de técnicas de cuantización mixta: el checkpoint sirve como caso de estudio para comparar la pérdida de calidad de NVFP4 frente a MXFP8 y affine 8-bit en un mismo modelo.
- Investigación sobre formatos de bajo bit: útil para quienes estudian el impacto de los formatos de bloque (grupo 16, 32, 64) en la perplejidad y en tareas de razonamiento.
- Despliegue de demostraciones offline: aplicaciones de escritorio para Mac que requieran generación de texto y descripción de imágenes sin conexión.
- Base para re-cuantización o conversión: los safetensors pueden servir de punto de partida para generar versiones GGUF y probar en llama.cpp, aunque requeriría trabajo de conversión no trivial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta la distribución de bits y el tamaño de almacenamiento, sin métricas de calidad (perplejidad, MMLU, HumanEval ni comparaciones con el modelo sin cuantizar).

## Requisitos de hardware

- VRAM/RAM unificada estimada: ~18.8 GB solo para pesos; con caché KV y overhead del runtime, se recomienda un mínimo de 24 GB y, para contextos largos, 32 GB o más.
- GPU compatibles: el checkpoint está en formato MLX, por lo que el destino natural son chips Apple M1/M2/M3/M4 (Pro, Max o Ultra). No es ejecutable directamente en CUDA sin conversión.
- GPU de consumidor: cabe en un Mac con 24 GB de memoria unificada; en el ecosistema NVIDIA requeriría conversión previa y una GPU con al menos 24 GB (RTX 3090/4090) para los pesos, más margen para el contexto.
- Opciones de despliegue: `mlx-lm` y el runtime de oMLX son las vías documentadas; vLLM, TGI, llama.cpp y Ollama no soportan este checkpoint tal cual (los formatos NVFP4 y MXFP8 no son estándar en GGUF).
- Latencia y throughput: no disponibles. Dependerán del ancho de banda de memoria del chip Apple empleado.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables documentados en la información proporcionada, y el modelo base (Inkling-2-Mini) no tiene ficha pública de referencia en estos datos. Como orientación puramente dimensional, un modelo denso de ~26B en 4-8 bits ocupa un rango de 14-27 GB, similar a otros modelos de esa talla, pero sin datos de rendimiento no es posible establecer una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ8e | 26.7B (26.388B LM + 0.318B visión) | no disponible | no disponible | safetensors MLX | Hugging Face, 0 descargas |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Publicación de terceros: el checkpoint lo ha subido chriswolf1987, no el autor original de Inkling-2-Mini; no hay garantía de que la cuantización preserve el comportamiento del modelo base.
- Licencia desconocida: sin licencia declarada, no se puede asumir uso comercial permitido. Verificar la licencia del modelo original antes de cualquier despliegue.
- Sin model card del autor original: no hay información sobre sesgos, datos de entrenamiento ni evaluación de seguridad.
- Riesgo de degradación por cuantización: el 76% de los pesos está en 4 bits (NVFP4); aunque la precisión mixta mitiga el daño, es esperable cierta pérdida en tareas de razonamiento y matemáticas frente al modelo en BF16.
- Formato no portable: NVFP4 y MXFP8 no son formatos estándar en GGUF ni en la mayoría de runtimes CUDA; el uso queda restringido de facto a MLX en Apple Silicon.
- Cero adopción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de que el checkpoint haya sido validado por terceros.
- Idiomas y contexto desconocidos: no se puede planificar un despliegue multilingüe ni de contexto largo sin datos del modelo base.
- Riesgo de alucinación: inherente a los modelos generativos; sin evaluación específica disponible, debe tratarse como no cuantificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chriswolf1987/Inkling-2-Mini-oQ8e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Inkling-2-Mini: no disponible (no se enlaza en la información proporcionada)
- Paper, blog o demo oficial: no disponible
