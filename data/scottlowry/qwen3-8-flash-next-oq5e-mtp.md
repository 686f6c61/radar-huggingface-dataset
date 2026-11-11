# scottlowry/Qwen3.8-Flash-Next-oQ5e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ5e-mtp es una cuantización de precisión mixta del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario scottlowry. No se trata de un modelo entrenado desde cero, sino de una conversión del checkpoint original de Qwen a formato MLX con cuantización oQ (herramienta oMLX, versión v0.7.3.dev2), pensada para ejecución en hardware Apple Silicon. El checkpoint resultante ocupa 129,254 GB (120,377 GiB) y contiene 180.000 millones de parámetros lógicos, con un promedio efectivo de 5,745 bits por peso en el conjunto del checkpoint.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 180B parámetros en entornos MLX con un presupuesto de memoria notablemente reducido frente al BF16 original, gracias a una distribución de cuantización por capas que mantiene en 5 bits la mayor parte del language model y aplica un esquema específico (N-gram affine 5-bit, grupo 32) a la tabla de embeddings N-gram de 51.200 millones de parámetros. El modelo incluye además una cabeza MTP (multi-token prediction) de 2.607 millones de parámetros y un módulo de visión de 0.449 millones.

La información pública disponible es escasa: la model card se limita a documentar el esquema de cuantización y no incluye datos sobre arquitectura interna, datos de entrenamiento, benchmarks, licencia ni idiomas. Esta ficha refleja únicamente lo que puede verificarse a partir de los metadatos y la model card, marcando explícitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-Flash-Next; el checkpoint incluye language model, N-gram embedding, vision y MTP head) |
| Parametros totales | 180.000.000.000 (179.999.981.459 según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: affine 5-bit grupo 128, affine 5-bit grupo 64, affine 8-bit grupo 128, affine 8-bit grupo 64, BF16, I64 y N-gram affine 5-bit grupo 32; promedio efectivo 5,643 bits/peso sin la tabla N-gram y 5,745 bits/peso en el checkpoint completo |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo base Qwen/Qwen3.8-Flash-Next en la documentación proporcionada. El checkpoint cuantizado revela la composición por componentes: un language model de 125.744 millones de parámetros lógicos, una tabla de embeddings N-gram de 51.200 millones, un módulo de visión de 0.449 millones y una cabeza MTP (multi-token prediction) de 2.607 millones. La presencia de una tabla N-gram de gran tamaño y de una cabeza MTP sugiere un diseño orientado a decodificación especulativa o predicción multi-token, pero no se detalla el mecanismo exacto.

El proceso de cuantización se realizó con oQ (oMLX v0.7.3.dev2), una herramienta de cuantización de precisión mixta. La distribución por capas es la siguiente: el 68,507% de los pesos lógicos (123.313 millones) se almacena en affine 5-bit con grupo 64 (5,50 bits/peso efectivos, 78,955 GiB); el 28,445% (51.200 millones) corresponde a la tabla N-gram en affine 5-bit con grupo 32 (6,00 bits/peso, 35.763 GiB); el 2,314% (4.164 millones) en affine 8-bit grupo 64 (8,50 bits/peso, 4.121 GiB); el 0,315% (0.566 millones) en affine 5-bit grupo 128 (5,25 bits/peso, 0.346 GiB); el 0,287% (0.516 millones) en BF16 (16,00 bits/peso, 0.961 GiB); y el 0,134% (0.241 millones) en affine 8-bit grupo 128 (8,25 bits/peso, 0.231 GiB). No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens, ni sobre si el modelo base utilizó RLHF, DPO u otras técnicas de alineamiento.

## Capacidades

- Generación de texto: el checkpoint incluye un language model de 125.744 millones de parámetros, por lo que se espera capacidad de generación de texto general, aunque no se han publicado evaluaciones específicas.
- Razonamiento y matemáticas: no disponible en la información proporcionada.
- Generación de código: no disponible en la información proporcionada.
- Visión: el checkpoint incluye un módulo de visión de 0.449 millones de parámetros, lo que indica soporte de entrada multimodal de imágenes, aunque no se detallan las capacidades concretas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Decodificación especulativa / predicción multi-token: el checkpoint incluye una cabeza MTP de 2.607 millones de parámetros, lo que sugiere soporte de predicción multi-token, pero no se documenta el mecanismo de uso.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está en formato MLX y cuantizado a ~5,7 bits/peso, lo que permite ejecutar un modelo de 180B parámetros en equipos con memoria unificada grande (Mac Studio con 192 GB o superior) usando la librería mlx. Es el caso de uso principal y el único documentado explícitamente por el autor.
- Investigación sobre cuantización de precisión mixta: la distribución por capas publicada en la model card sirve como referencia para estudiar el impacto de distintos esquemas (affine 5-bit grupo 64, N-gram affine 5-bit grupo 32, BF16 en capas selectivas) en modelos de gran tamaño.
- Experimentación con decodificación especulativa: la presencia de la cabeza MTP permite investigar técnicas de predicción multi-token en entornos MLX, comparando latencia frente a decodificación autoregresiva estándar.
- Prototipado multimodal: el módulo de visión incluido permite probar flujos de entrada de imagen más texto en local, siempre que se validen las capacidades reales del modelo base.
- Evaluación comparativa de checkpoints cuantizados: al existir el modelo base Qwen/Qwen3.8-Flash-Next en BF16, este checkpoint permite medir la degradación de calidad introducida por la cuantización oQ en tareas concretas.
- Despliegue en estaciones de trabajo con memoria unificada: para equipos Apple con suficiente RAM, el checkpoint evita la necesidad de GPUs dedicadas y permite servir el modelo mediante mlx_lm.server u otras herramientas del ecosistema MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el checkpoint ocupa 129,254 GB (120,377 GiB) en disco. Para inferencia en MLX se necesita memoria unificada suficiente para cargar los pesos más el espacio de activaciones y caché KV; como referencia, se requiere un equipo con al menos 128 GB de memoria unificada, y se recomienda 192 GB o más para margen operativo.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1/M2/M3/M4, en configuraciones Pro, Max y Ultra). No es un formato pensado para GPUs NVIDIA o AMD.
- ¿Cabe en GPU consumer?: en GPUs consumer convencionales (RTX 4090 con 24 GB, por ejemplo) no cabe. En Apple Silicon, cabe en configuraciones con memoria unificada de 128 GB o superior (Mac Studio M2 Ultra 192 GB, M3 Ultra, etc.).
- Opciones de despliegue: librería mlx (mlx_lm), herramientas del ecosistema oMLX. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que el formato es safetensors MLX y no GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ5e-mtp (este) | 180B (cuantizado ~5,745 bits/peso) | no disponible | safetensors MLX | no disponible | Hugging Face, 456 descargas |
| Qwen/Qwen3.8-Flash-Next (base) | 180B (BF16 presumiblemente) | no disponible | no disponible | no disponible | Hugging Face (referenciado como base_model) |
| Alternativas de 180B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría. El único punto de comparación documentado es el modelo base Qwen/Qwen3.8-Flash-Next, del que no se publican especificaciones en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta licencia. Antes de cualquier uso comercial es imprescindible verificar la licencia del modelo base Qwen/Qwen3.8-Flash-Next en su repositorio original.
- No se han publicado datos sobre sesgos, alucinación, idiomas soportados ni limitaciones de contexto. Cualquier afirmación al respecto sería especulativa.
- La cuantización a ~5,7 bits/peso introduce degradación de calidad respecto al BF16 original; el grado de degradación no está medido en la información disponible.
- El checkpoint está atado al ecosistema MLX y a hardware Apple Silicon. No es portable a GPUs NVIDIA/AMD ni a frameworks como vLLM, llama.cpp o TGI sin conversión adicional.
- El autor indica que el modelo fue re-cuantizado el 2026-10-25 con oMLX v0.7.3.dev2 y recomienda volver a descargar copias anteriores; versiones previas pueden tener distribuciones de bits distintas.
- El repositorio tiene un volumen de descargas bajo (456) y un solo like, lo que limita la validación comunitaria del checkpoint.
- La tabla N-gram de 51.200 millones de parámetros representa el 28,4% de los pesos lógicos y se almacena con un esquema específico (affine 5-bit grupo 32); su comportamiento en inferencia no está documentado en la model card.
- No se documenta el pipeline de la tarea (text-generation, image-text-to-text, etc.), por lo que la integración con herramientas automáticas puede requerir configuración manual.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.8-Flash-Next-oQ5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Librería MLX: no se proporciona enlace en la información disponible
- Paper, blog o demo: no disponibles en la información proporcionada
