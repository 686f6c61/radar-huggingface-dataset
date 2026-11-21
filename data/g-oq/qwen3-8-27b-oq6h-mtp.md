# g-oQ/Qwen3.8-27B-oQ6h-mtp

## Resumen

Qwen3.8-27B-oQ6h-mtp es una cuantización mixta del modelo base Qwen/Qwen3.8-27B, publicada por el usuario g-oQ mediante la herramienta oQ (oMLX v0.8.2). El checkpoint está empaquetado en formato MLX (safetensors con metadatos de cuantización) y está pensado para su ejecución en Apple Silicon a través del stack MLX, no para GPUs NVIDIA ni para llama.cpp. La etiqueta `mtp` del nombre indica que el checkpoint conserva una cabeza MTP (multi-token prediction) de 0,425B de parámetros, presumiblemente destinada a decodificación especulativa.

El dato más llamativo es la discrepancia entre el nombre del modelo (que sugiere 27B) y el recuento real de parámetros en safetensors: 8.657.057.520 pesos lógicos. El desglose de la model card aclara la composición: 7,772B corresponden al modelo de lenguaje, 0,461B a un componente de visión y 0,425B a la cabeza MTP. El repositorio ocupa 23,9 GB y el autor declara una media efectiva de 22,054 bits por peso, un valor alto para lo que se suele entender por "6-bit" en el nombre.

La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantización mixta poco habitual (mezcla de affine 6-bit, affine 8-bit, BF16 y U32 en el mismo checkpoint); por otro, sirve de advertencia sobre la nomenclatura de los repositorios derivados, donde el sufijo del nombre no refleja necesariamente el tamaño real ni el esquema de bits del artefacto publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`), con cabeza MTP y componente de visión; detalles internos no disponibles |
| Parametros totales | 8.657.057.520 (8,657B) según safetensors |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 6-bit grupo 64 (18,502% de los pesos), affine 8-bit grupo 64 (15,171%), BF16 (10,393%), U32 (55,935%); media efectiva 22,054 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con metadatos MLX (librería `mlx`) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo base Qwen/Qwen3.8-27B, no un modelo entrenado desde cero. La model card no aporta información sobre la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención, si usa atención lineal o híbrida) ni sobre su dataset de entrenamiento, número de tokens, fases de RLHF/DPO o cualquier innovación de entrenamiento. Lo único deducible de las etiquetas es que pertenece a la familia `qwen3_5` y que incorpora un componente de visión (0,461B de pesos lógicos) y una cabeza MTP (0,425B).

La innovación técnica documentada es la propia receta de cuantización de oQ (oMLX v0.8.2): asignación de precisión por tensor con cuatro formatos coexistentes. El bloque U32 concentra el 55,935% de los pesos lógicos y el 81,2% del almacenamiento (18,039 GiB), lo que sugiere que corresponde a tensores que la herramienta no cuantiza o que almacena en formato de empaquetado de 32 bits; el bloque BF16 retiene 0,900B de pesos en precisión completa. La cabeza MTP se conserva explícitamente, lo que apunta a un uso previsto con decodificación especulativa en MLX, aunque la model card no describe el procedimiento de inferencia ni confirma que esté soportado por el runtime.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, aunque no se documentan evaluaciones específicas del checkpoint cuantizado.
- Procesamiento de visión: el checkpoint incluye 0,461B de pesos de un componente visual, por lo que se espera soporte de entrada de imágenes, sin confirmación en la model card.
- Predicción multi-token (MTP): la cabeza de 0,425B se conserva en el checkpoint, presumiblemente para decodificación especulativa; el soporte real depende del runtime MLX.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño de 23,9 GB permiten cargar el checkpoint en Macs con memoria unificada de 32 GB o superior, usando el runtime MLX en lugar de llama.cpp o vLLM, que no soportan este formato.
- Evaluación de recetas de cuantización mixta: el checkpoint sirve como caso de estudio para comparar la calidad de una asignación de bits por tensor (6/8/BF16/U32) frente a cuantizaciones uniformes de 4 u 8 bits del mismo modelo base.
- Pruebas de decodificación especulativa con MTP: la presencia de la cabeza MTP permite experimentar con generación multi-token en MLX y medir la ganancia de throughput frente a decodificación autoregresiva estándar.
- Prototipado de asistentes multimodales en local: el componente de visión, si el runtime lo expone, habilita tareas de descripción de imágenes o extracción de información de capturas sin enviar datos a la nube.
- Reproducción de investigaciones sobre Qwen3.8-27B: útil para investigadores que necesiten ejecutar el modelo base en hardware Apple sin depender de GPUs NVIDIA.
- Docencia y formación en cuantización: el desglose detallado de la model card (bits por bloque, almacenamiento por componente) es un material didáctico útil para explicar cómo se reparte la precisión en un checkpoint real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 23,9 GB, por lo que se recomienda un mínimo de 32 GB de memoria unificada en Apple Silicon para dejar margen a la caché KV y al contexto.
- GPU recomendadas: Apple Silicon (series M1 Pro/Max, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max) con 32 GB o más de memoria unificada. No es compatible con GPUs NVIDIA o AMD por el formato MLX.
- ¿Cabe en consumer GPU? No en el sentido habitual (RTX 4090, 24 GB) por formato y por tamaño; sí en Macs de gama alta con memoria unificada.
- Opciones de despliegue: MLX (librería `mlx`), oMLX; no compatible con vLLM, llama.cpp, Ollama ni TGI sin conversión previa del checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g-oQ/Qwen3.8-27B-oQ6h-mtp | 8,657B (checkpoint) | no disponible | MLX safetensors | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-27B (base) | 27B (según nombre) | no disponible | safetensors | no disponible | Hugging Face |
| Cuantizaciones MLX estándar de Qwen3.8-27B | no disponible | no disponible | MLX safetensors | no disponible | no disponible |

La comparativa se limita al modelo base y a cuantizaciones genéricas, ya que no se dispone de datos de rendimiento ni de otros checkpoints concretos en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre indica "27B" y "6h", pero el recuento real es de 8,657B de pesos lógicos y la media efectiva es de 22,054 bits/peso, no de 6 bits. Verificar siempre los safetensors antes de planificar el hardware.
- Licencia no declarada: la model card no especifica licencia, por lo que no se puede confirmar el uso comercial; hay que remitirse a la licencia del modelo base Qwen/Qwen3.8-27B, que tampoco se detalla aquí.
- Compatibilidad restringida: el formato MLX solo se ejecuta en Apple Silicon con el stack MLX; no hay soporte para CUDA, ROCm ni llama.cpp.
- Sin datos de calidad: no se han publicado benchmarks del checkpoint cuantizado, por lo que se desconoce la degradación respecto al modelo base.
- Riesgo de alucinación y sesgos: no evaluados en esta publicación; se heredan los del modelo base, sin documentación disponible.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Idiomas y contexto no documentados: no se puede garantizar el comportamiento multilingüe ni la ventana de contexto real del checkpoint.
- Cabeza MTP sin guía de uso: la model card no explica cómo activar la decodificación especulativa ni si el runtime MLX la soporta de forma nativa.

## Enlaces

- Hugging Face: https://huggingface.co/g-oQ/Qwen3.8-27B-oQ6h-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
