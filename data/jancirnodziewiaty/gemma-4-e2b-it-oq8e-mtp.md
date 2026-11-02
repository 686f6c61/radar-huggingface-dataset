# jancirnodziewiaty/gemma-4-E2B-it-oQ8e-mtp

## Resumen

gemma-4-E2B-it-oQ8e-mtp es una versión cuantizada del modelo Gemma 4 E2B instruction-tuned, publicada por el usuario jancirnodziewiaty en HuggingFace. Se trata de una conversión realizada con la herramienta oQ (oMLX v0.7.3) de cuantización de precisión mixta, orientada al ecosistema MLX de Apple para su ejecución en hardware Apple Silicon. El checkpoint combina capas en 8 bits afines con grupo de 64 junto con un 10,6 % de los pesos mantenidos en BF16, lo que da una media efectiva de 9,299 bits por peso.

El modelo base Gemma 4 E2B pertenece a la familia Gemma de Google y, según la distribución de pesos del checkpoint, integra componentes de lenguaje, visión y audio, además de una cabeza MTP (multi-token prediction) destinada a decodificación especulativa. La variante "it" indica que está ajustado para seguir instrucciones. El checkpoint ocupa 6,1 GB en el repositorio y 5,61 GiB de almacenamiento efectivo de pesos.

La relevancia de esta ficha es doble: por un lado documenta una conversión comunitaria concreta de un modelo multimodal de Google a formato MLX cuantizado; por otro, la información pública disponible es muy limitada (sin model card descriptiva, sin licencia declarada, sin benchmarks ni idiomas especificados), por lo que muchos campos de esta ficha deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión + audio) con cabeza MTP; detalles no disponibles |
| Parámetros totales | 5.182.291.015 (5,182B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ mixed-precision: affine 8-bit grupo 64 (89,378 % de pesos), BF16 (10,617 %), I64 (0,005 %); media efectiva 9,299 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), librería mlx |

Desglose de almacenamiento por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 4,632B | 4,922 GB / 4,584 GiB |
| Visión | 0,167B | 0,335 GB / 0,312 GiB |
| Audio | 0,305B | 0,610 GB / 0,568 GiB |
| Cabeza MTP | 0,078B | 0,158 GB / 0,147 GiB |
| **Total** | **5,182B** | **6,024 GB / 5,610 GiB** |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Gemma 4 E2B más allá de la distribución de pesos del checkpoint. Esta revela tres subredes diferenciadas: un modelo de lenguaje de 4,632B parámetros, un codificador visual de 0,167B y un codificador de audio de 0,305B, además de una cabeza MTP de 0,078B parámetros. La presencia de esta última sugiere soporte para decodificación especulativa mediante predicción multi-token, técnica que acelera la generación al proponer varios tokens por paso y verificarlos en paralelo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el ajuste de instrucciones empleó RLHF, DPO u otras técnicas de alineación. Tampoco hay datos sobre innovaciones de atención (atención lineal, ventanas deslizantes, etc.) ni sobre la estrategia de entrenamiento multimodal. La cuantización oQ aplicada por el autor mantiene en BF16 aproximadamente el 10,6 % de los pesos (0,550B parámetros), presumiblemente capas sensibles a la precisión, mientras que el resto se almacena en 8 bits afines con grupo de 64.

## Capacidades

- Generación de texto y seguimiento de instrucciones, al tratarse de una variante "it" del modelo base.
- Procesamiento de imágenes: el checkpoint incluye un codificador visual de 0,167B parámetros, lo que implica capacidades de visión (descripción de imágenes, VQA, OCR, etc.).
- Procesamiento de audio: incluye un codificador de audio de 0,305B parámetros, lo que sugiere capacidades de comprensión de audio (transcripción, respuesta a voz, etc.).
- Decodificación especulativa mediante la cabeza MTP incluida en el checkpoint.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se especifican idiomas.
- Modo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y el tamaño de 5,61 GiB permiten ejecutar el modelo en equipos con memoria unificada de 16 GB o superior, útil para prototipado y experimentación sin conexión a la nube.
- Asistentes multimodales de escritorio: la combinación de visión y lenguaje permite construir aplicaciones que describan capturas de pantalla, analicen documentos escaneados o respondan preguntas sobre imágenes dentro de un flujo local.
- Procesamiento de audio en local: el codificador de audio de 0,305B parámetros posibilita transcripción o comprensión de audio sin enviar datos a servicios externos, relevante para aplicaciones con requisitos de privacidad.
- Aceleración de generación con MTP: la cabeza de predicción multi-token puede aprovecharse en pipelines que requieran baja latencia de decodificación, como asistentes conversacionales interactivos.
- Evaluación de técnicas de cuantización: el checkpoint sirve como caso de estudio de cuantización mixta oQ con preservación selectiva de capas en BF16, útil para investigadores que comparen calidad frente al modelo original.
- Investigación en eficiencia de memoria: con 9,299 bits/peso de media, es un punto de referencia para estudiar el equilibrio entre tamaño, precisión y calidad en hardware consumer.
- Fine-tuning ligero o adaptación con LoRA: al estar en formato MLX y safetensors, puede integrarse en flujos de ajuste sobre Apple Silicon, aunque la licencia no declarada obliga a verificar condiciones antes de usos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 5,61 GiB solo para pesos; con overhead de ejecución (KV cache, activaciones, buffers) se recomienda un mínimo de 8-10 GB de memoria unificada.
- GPU recomendadas: hardware Apple Silicon con soporte MLX (series M1, M2, M3, M4 y superiores). No aplica a GPUs NVIDIA/AMD en este formato.
- ¿Cabe en GPU consumer? Sí, en equipos Apple con 16 GB o más de memoria unificada; en configuraciones de 8 GB es probable que el margen sea insuficiente para contextos largos.
- Opciones de despliegue: MLX (librería nativa), oMLX; otras herramientas como llama.cpp, vLLM u Ollama no son compatibles directamente con este formato sin conversión.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-E2B-it-oQ8e-mtp | 5,182B | no disponible | no disponible | MLX safetensors | Cuantización mixta oQ, multimodal (visión + audio), MTP |
| Gemma 4 E2B-it (original) | no disponible en esta ficha | no disponible | no disponible | safetensors | Modelo base sin cuantizar; referencia de calidad |
| Alternativas MLX cuantizadas de la familia Gemma | no disponible | no disponible | no disponible | MLX | No se dispone de datos concretos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: no es posible confirmar si el uso comercial está permitido; debe verificarse antes de cualquier despliegue en producción.
- Idiomas no especificados: se desconoce la cobertura lingüística real del modelo base y de esta conversión.
- Sin benchmarks publicados: no hay evidencia empírica sobre la degradación de calidad introducida por la cuantización oQ de 9,299 bits/peso frente al modelo original.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de fiabilidad para este checkpoint.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- Compatibilidad limitada: el formato MLX restringe su uso a hardware Apple Silicon; no es portable a GPUs NVIDIA sin conversión.
- Checkpoint comunitario: al ser una conversión de un tercero (jancirnodziewiaty) y no una publicación oficial, no hay garantías de soporte, mantenimiento ni verificación independiente.
- Cabeza MTP: su utilidad práctica depende de que el runtime MLX la soporte; no se documenta compatibilidad con herramientas de decodificación especulativa específicas.

## Enlaces

- HuggingFace: https://huggingface.co/jancirnodziewiaty/gemma-4-E2B-it-oQ8e-mtp
- oQ / oMLX (herramienta de cuantización): https://github.com/jundot/omlx
- Documentación de MLX: no disponible en la información proporcionada
- Paper o blog del modelo base Gemma 4: no disponible en la información proporcionada
