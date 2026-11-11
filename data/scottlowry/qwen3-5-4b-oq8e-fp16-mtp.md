# scottlowry/Qwen3.5-4B-oQ8e-fp16-mtp

## Resumen

Qwen3.5-4B-oQ8e-fp16-mtp es una cuantización mixta del modelo Qwen/Qwen3.5-4B, publicada por el usuario scottlowry en Hugging Face. El checkpoint está empaquetado en formato MLX, la librería de Apple para ejecutar modelos de aprendizaje automático de forma nativa en chips de la serie M (M1, M2, M3, M4) y superiores, lo que lo orienta a inferencia local en hardware Apple Silicon. No se trata de un modelo entrenado desde cero, sino de una redistribución optimizada del modelo base de Qwen.

La cuantización se ha realizado con oQ (oMLX v0.7.4.dev1), una herramienta de cuantización de precisión mixta que asigna distintos formatos de almacenamiento a distintas partes del modelo según su sensibilidad. El resultado es un peso medio efectivo de 10,205 bits por parámetro, con la mayor parte de los pesos (92,541 %) en affine 8-bit con grupo de 64, una fracción pequeña en FP16 (0,302 %) y el 7,157 % restante en FP32, que corresponde fundamentalmente a la torre de visión y a la cabeza MTP.

El checkpoint incorpora tres componentes diferenciados: el modelo de lenguaje (4,206B parámetros), un codificador de visión (0,334B) y una cabeza MTP (Multi-Token Prediction, 0,121B), lo que sugiere que el modelo base Qwen3.5-4B es multimodal y soporta decodificación especulativa mediante predicción multi-token. El total declarado en safetensors es de 4.659.865.088 parámetros. Su relevancia radica en ofrecer una vía práctica para ejecutar un modelo de 4B multimodal en Macs con memoria unificada, aunque con un número de descargas muy bajo (43) y una documentación limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-4B; incluye torre de visión y cabeza MTP) |
| Parametros totales | 4.659.865.088 (4,660B) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: affine 8-bit grupo 64 (92,541 % de los pesos), FP16 (0,302 %), FP32 (7,157 %); media efectiva de 10,205 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint Qwen/Qwen3.5-4B, por lo que la arquitectura subyacente corresponde a la familia Qwen3.5 de Alibaba, de la que no se proporcionan detalles en la información disponible (número de tokens de entrenamiento, composición del dataset, uso de RLHF o DPO, innovaciones de atención). La información del repositorio permite inferir tres bloques funcionales: un modelo de lenguaje de 4,206B parámetros, un módulo de visión de 0,334B parámetros almacenado en FP32 y una cabeza MTP (Multi-Token Prediction) de 0,121B parámetros, lo que apunta a un modelo base multimodal con soporte de decodificación especulativa.

La innovación técnica del checkpoint reside en la cuantización de precisión mixta aplicada con oMLX v0.7.4.dev1. La herramienta preserva en FP32 los componentes más sensibles a la pérdida de precisión (la torre de visión y parte de la cabeza MTP) mientras comprime el grueso del modelo de lenguaje a affine 8-bit con grupo de 64, y deja una pequeña fracción en FP16. El resultado ocupa 5,536 GiB en disco, frente a los aproximadamente 9,3 GB que ocuparía el modelo en FP16 puro, manteniendo una media efectiva de 10,205 bits por peso. El autor actualizó el checkpoint el 2026-11-11 y recomienda volver a descargarlo si se tenía una copia anterior.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-4B, si bien no se documentan evaluaciones específicas en la información disponible.
- Procesamiento de visión: el checkpoint incluye una torre de visión de 0,334B parámetros en FP32, lo que indica capacidad multimodal de entrada de imágenes, aunque no se detallan las tareas concretas soportadas.
- Decodificación especulativa: la presencia de una cabeza MTP de 0,121B parámetros permite, en principio, acelerar la generación mediante predicción multi-token, siempre que el runtime MLX lo soporte.
- Ejecución local en Apple Silicon: el formato MLX permite aprovechar la memoria unificada y los motores Metal de los chips M-series.
- Tool calling, soporte de agentes, capacidades multilingües y modos especiales (thinking, audio): no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en Mac: el checkpoint está pensado para ejecutarse con MLX en equipos Apple Silicon, aprovechando la memoria unificada para cargar los 5,536 GiB del modelo sin necesidad de GPU dedicada.
- Prototipado de aplicaciones multimodales en escritorio: la inclusión de la torre de visión permite experimentar con entrada de imágenes en flujos locales, útil para demos y pruebas de concepto sin depender de la nube.
- Asistentes personales offline: un modelo de 4B cuantizado a 8 bits puede mantener conversaciones multi-turno en local con latencia aceptable en chips M-series, adecuado para herramientas de productividad que requieren privacidad de datos.
- Evaluación de técnicas de cuantización: investigadores interesados en comparar la precisión mixta de oQ frente a otras estrategias (GPTQ, AWQ, GGUF Q8_0) pueden usar este checkpoint como referencia reproducible en el ecosistema MLX.
- Aceleración mediante MTP: desarrolladores que trabajen con runtimes MLX compatibles con predicción multi-token pueden medir la ganancia de throughput de la cabeza MTP en tareas de generación larga.
- Investigación sobre degradación por cuantización en modelos multimodales: al mantener la visión en FP32 y el lenguaje en 8-bit, el checkpoint permite estudiar el impacto diferencial de la compresión en cada modalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 5,5 GiB para los pesos en el formato empaquetado; el consumo real en ejecución será superior por el estado KV y los buffers de activación, que dependen de la longitud de contexto (no documentada).
- GPU recomendadas: Apple Silicon exclusivamente, dado el formato MLX. Chips M1, M2, M3 y M4 (y variantes Pro, Max y Ultra) con al menos 8 GB de memoria unificada; se recomienda 16 GB o más para dejar margen al contexto y a la torre de visión.
- GPU NVIDIA: no aplicable directamente; el checkpoint no está en formato GGUF ni safetensors estándar de PyTorch, por lo que no se puede cargar en vLLM, TGI o llama.cpp sin conversión previa.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada de 8 GB o superior; en el ecosistema NVIDIA requeriría conversión y no está soportado de forma nativa.
- Opciones de despliegue: MLX (librería mlx y herramientas compatibles como mlx-lm, si bien la presencia de visión y MTP puede requerir versiones específicas); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-oQ8e-fp16-mtp (este) | 4,660B | no disponible | MLX safetensors, cuantización mixta 10,205 bits/peso | no disponible | Hugging Face, 43 descargas |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | safetensors (FP16/BF16 presumiblemente) | no disponible | Hugging Face (modelo oficial de Qwen) |
| Cuantizaciones GGUF Q8_0 de modelos 4B | ~4B | según modelo base | GGUF | según modelo base | Amplia, compatible con llama.cpp y Ollama |

La comparación cuantitativa con alternativas de la misma categoría no está disponible en la información proporcionada; los datos de la tabla reflejan únicamente lo documentado para este checkpoint y las características generales del modelo base.

## Limitaciones y advertencias

- Documentación mínima: la model card no detalla licencia, idiomas, contexto ni resultados de evaluación, lo que dificulta valorar su idoneidad para producción.
- Licencia no disponible: al no especificarse, no se puede confirmar si el uso comercial está permitido; debe consultarse la licencia del modelo base Qwen/Qwen3.5-4B antes de cualquier despliegue.
- Riesgo de degradación por cuantización: aunque la precisión mixta preserva visión y MTP en FP32, el 92,541 % de los pesos en 8-bit puede introducir pérdidas en tareas sensibles a la precisión numérica (matemáticas, código, razonamiento largo).
- Riesgo de alucinación: inherente a los modelos de lenguaje de 4B parámetros; no se documentan mitigaciones específicas.
- Sesgos: no disponibles; se heredan los del modelo base, no caracterizados en esta ficha.
- Compatibilidad restringida: el formato MLX limita su uso a Apple Silicon; no es directamente portable a ecosistemas CUDA o ROCm sin conversión.
- Adopción muy baja: 43 descargas y 1 like en el momento de la consulta, lo que reduce la validación comunitaria y el soporte disponible.
- Actualización del checkpoint: el autor advierte que versiones anteriores a la del 2026-11-11 deben descargarse de nuevo, lo que sugiere posibles cambios en la cuantización no documentados en detalle.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.5-4B-oQ8e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
