# scottlowry/Qwen3.8-27B-oQ6e-fp16-mtp

## Resumen

Qwen3.8-27B-oQ6e-fp16-mtp es una cuantización mixta del modelo Qwen/Qwen3.8-27B, publicada por el usuario scottlowry en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión de precisión del checkpoint original de Qwen, realizada con la herramienta oQ de oMLX (v0.7.4.dev1) y empaquetada en formato MLX para su ejecución en hardware Apple Silicon. El checkpoint ocupa 23,085 GiB en disco y contiene 27.781 millones de parámetros lógicos, con un promedio efectivo de 7,138 bits por peso.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~27B con capacidades multimodales (incluye torre de visión de 0,461B) y con una cabeza MTP (multi-token prediction) de 0,425B en equipos con memoria unificada relativamente modesta, manteniendo la mayor parte de los pesos en 6 bits afines con grupo de 64. La distribución de bits no es uniforme: el 88,3% de los pesos está en 6 bits, un 9,8% se mantiene en 8 bits y una fracción pequeña (1,9%) en FP32, presumiblemente para capas sensibles a la cuantización.

El modelo base pertenece a la familia Qwen3.5/Qwen3.8, e incorpora una cabeza de predicción multi-token que puede habilitar decodificación especulativa en el runtime. Al ser una cuantización de terceros, no cuenta con model card propia más allá de la tabla de distribución de bits, y la información sobre entrenamiento, idiomas, licencia o benchmarks no está disponible en los datos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5/Qwen3.8) con torre de visión y cabeza MTP; pesos en formato MLX |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 6-bit grupo 64 (88,345%), affine 8-bit grupo 64 (9,798%), FP16 (0,198%), FP32 (1,658%); promedio efectivo 7,138 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 23,085 GiB en disco (24,787 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen/Qwen3.8-27B, un transformer de la familia Qwen3.5/Qwen3.8. El checkpoint cuantizado desglosa sus componentes en tres bloques: modelo de lenguaje (26,896B parámetros lógicos, 20,979 GiB), torre de visión (0,461B, 1,716 GiB) y cabeza MTP (0,425B, 0,389 GiB). La presencia de una torre de visión confirma que el modelo base es multimodal, y la cabeza MTP sugiere soporte para predicción multi-token, técnica habitualmente asociada a decodificación especulativa para acelerar la generación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares en el modelo base. La única innovación técnica documentada en esta ficha es el propio proceso de cuantización mixta de oQ: mantiene en 6 bits la mayoría de las capas, eleva a 8 bits un subconjunto (2,722B parámetros) y preserva en FP32 un 1,658% de los pesos (0,461B), lo que sugiere que esas capas o tensores son especialmente sensibles y se excluyen de la cuantización agresiva para preservar calidad. El proceso se actualizó el 2026-11-11 con oMLX v0.7.4.dev1.

## Capacidades

- Generación de texto y razonamiento: al derivar de Qwen3.8-27B, se espera capacidad de razonamiento general, aunque no hay evaluación publicada en esta ficha.
- Procesamiento de visión: incluye torre de visión de 0,461B parámetros, lo que habilita tareas de imagen a texto (descripción, VQA, OCR) según las capacidades del modelo base.
- Predicción multi-token (MTP): la cabeza dedicada de 0,425B permite, en runtimes compatibles, decodificación especulativa para reducir latencia.
- Tool calling / function calling: no disponible en la información proporcionada; depende de las capacidades del modelo base Qwen3.8-27B.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se listan idiomas en los metadatos.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño de 23,085 GiB permiten ejecutar el modelo en Macs con memoria unificada de 32 GB o superior, usando la librería mlx y el runtime oMLX. Es el caso de uso principal de esta publicación.
- Asistente multimodal en escritorio: gracias a la torre de visión integrada, se puede usar para describir capturas de pantalla, extraer texto de imágenes o responder preguntas sobre documentos escaneados sin enviar datos a la nube.
- Prototipado de aplicaciones con decodificación especulativa: la cabeza MTP permite experimentar con generación acelerada en runtimes que la soporten, comparando latencia frente a decodificación autoregresiva estándar.
- Evaluación de cuantización mixta: investigadores pueden comparar la calidad de esta configuración de 7,138 bits/peso frente al checkpoint original en FP16/BF16 para estudiar el impacto de la cuantización selectiva por capas.
- Generación de texto de propósito general en local: para redacción, resumen y respuesta a preguntas en entornos sin conectividad, siempre que se validen idioma y calidad.
- Desarrollo de pipelines offline de análisis de documentos con componente visual: combinando la torre de visión y el LM en un solo checkpoint, se simplifica el despliegue en un único proceso MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 23,085 GiB solo para pesos; con overhead de runtime MLX y caché KV, se recomienda un mínimo de 32 GB de memoria unificada, y 48-64 GB para contextos largos o lotes mayores.
- GPU recomendadas: hardware Apple Silicon (series M1/M2/M3/M4 Pro, Max y Ultra) por el formato MLX. No es ejecutable directamente en GPU NVIDIA/AMD con este checkpoint.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en configuraciones de 32 GB o más de memoria unificada; no aplica a RTX 4090 (24 GB) por formato y por tamaño.
- Opciones de despliegue: librería mlx y oMLX (https://github.com/jundot/omlx). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| scottlowry/Qwen3.8-27B-oQ6e-fp16-mtp | 27,781B | no disponible | MLX safetensors, 23,085 GiB | no disponible | Cuantización mixta 7,138 bits/peso, con visión y MTP |
| Qwen/Qwen3.8-27B (base) | 27,781B (aprox.) | no disponible | safetensors (FP16/BF16 presumiblemente) | no disponible | Checkpoint original sin cuantizar; mayor huella de memoria |
| Otras cuantizaciones del mismo base (GGUF, AWQ, etc.) | 27,781B | no disponible | GGUF / otros | no disponible | No verificadas en la información proporcionada |

## Limitaciones y advertencias

- Es una cuantización de terceros: la calidad puede degradarse respecto al checkpoint original, especialmente en tareas sensibles a precisión numérica; no hay evaluación publicada que lo cuantifique.
- La licencia no está declarada en los metadatos de esta publicación; para uso comercial debe verificarse la licencia del modelo base Qwen/Qwen3.8-27B en su repositorio original.
- Solo es utilizable en el ecosistema MLX (Apple Silicon); no es portable a CUDA sin reconversión.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay datos específicos de evaluación para esta cuantización.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento multilingüe sin validación previa.
- Longitud de contexto no documentada en esta ficha; debe consultarse la model card del modelo base.
- El autor actualizó el checkpoint el 2026-11-11; versiones anteriores descargadas pueden diferir en calidad, por lo que conviene re-descargar.
- El repositorio tiene 213 descargas y 0 likes, con poca validación comunitaria; tratar como artefacto experimental.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.8-27B-oQ6e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
