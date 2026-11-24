# scottlowry/Ornith-1.5-122B-oQ5e-mtp

## Resumen

Ornith-1.5-122B-oQ5e-mtp es una cuantización de precisión mixta del modelo base ornith-ai/Ornith-1.5-122B, publicada por el usuario scottlowry. Se trata de un checkpoint de 125.086.497.008 parámetros totales (122.112B en el modelo de lenguaje, 0.451B en la torre de visión y 2.524B en la cabeza MTP) empaquetado en formato MLX para su ejecución en hardware Apple Silicon. La cuantización se ha realizado con la herramienta oQ de oMLX (versión v0.7.4.dev1), que aplica precisión mixta por tensor en lugar de una cuantización uniforme.

El resultado es un checkpoint de 88,976 GB en disco (82,866 GiB) con un promedio efectivo de 5,691 bits por peso, lo que permite ejecutar un modelo de más de 120.000 millones de parámetros en equipos con memoria unificada de gama alta, algo inviable en BF16 (que requeriría aproximadamente 250 GB). La mayor parte de los pesos (94,639%) se almacena en affine 5-bit con grupo de 64, mientras que una fracción pequeña se preserva en 8-bit o BF16 para proteger capas sensibles.

El modelo base pertenece a la familia Qwen3.5 MoE (tag `qwen3_5_moe`), lo que implica una arquitectura de mezcla de expertos con atención transformer. La inclusión de una cabeza MTP (multi-token prediction) sugiere soporte para decodificación especulativa, lo que puede mejorar el throughput en inferencia. La licencia, los idiomas y el pipeline no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con torre de visión y cabeza MTP |
| Parametros totales | 125.086.497.008 (122.112B LM + 0.451B visión + 2.524B MTP) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 5-bit grupo 64 (94,639%), affine 8-bit grupo 128 (0,370%), affine 8-bit grupo 64 (4,583%), BF16 (0,408%); promedio efectivo 5,691 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (librería `mlx`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) identificado por el tag `qwen3_5_moe`, lo que lo vincula a la familia Qwen3.5 de Alibaba. Incluye una torre de visión de 0,451B parámetros, lo que confirma capacidades multimodales de entrada de imagen, y una cabeza MTP de 2,524B parámetros orientada a la predicción de múltiples tokens por paso, técnica habitual para acelerar la decodificación mediante especulación.

La cuantización aplicada por oQ es de precisión mixta por tensor: el 94,639% de los pesos lógicos (118,380B) se almacena en affine 5-bit con grupo de 64, el 4,583% (5,733B) en affine 8-bit con grupo de 64, el 0,370% (0,462B) en affine 8-bit con grupo de 128 y el 0,408% (0,511B) se mantiene en BF16. Esta distribución preserva en mayor precisión capas críticas (probablemente embeddings, normas y algunas proyecciones de atención) mientras comprime agresivamente el grueso de las matrices de expertos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base Qwen3.5 MoE.
- Procesamiento de imágenes gracias a la torre de visión de 0,451B parámetros.
- Decodificación especulativa mediante la cabeza MTP, que permite proponer varios tokens por paso de inferencia.
- Ejecución nativa en Apple Silicon a través del framework MLX.
- Capacidades multilingües: no confirmadas en la información disponible.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Modo thinking explícito: no confirmado en la información disponible.

## Casos de uso

- Inferencia local en Mac Studio o MacBook Pro con memoria unificada de 96 GB o más: el checkpoint de 82,866 GiB cabe en equipos de gama alta Apple Silicon, permitiendo ejecutar un modelo de 122B sin GPU dedicada.
- Prototipado de asistentes multimodales en local: la torre de visión permite procesar capturas, diagramas o documentos escaneados junto con texto, útil para pruebas de concepto sin depender de APIs externas.
- Investigación en cuantización: el checkpoint sirve como referencia para estudiar el impacto de la precisión mixta (5-bit vs 8-bit vs BF16) en la calidad de salida de un MoE grande.
- Evaluación de decodificación especulativa: la cabeza MTP permite medir ganancias de throughput frente a decodificación autoregresiva estándar en MLX.
- Desarrollo de pipelines de razonamiento con contexto largo: si el modelo base soporta ventanas extensas (no confirmado), podría usarse para análisis de documentos largos en local.
- Benchmarking de hardware Apple: útil para comparar latencia y consumo entre generaciones de chips M-series con un modelo de gran tamaño.
- Educación y experimentación: permite a desarrolladores sin acceso a clústeres de GPU explorar el comportamiento de un MoE de 122B en hardware de consumo profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 83 GiB para cargar los pesos; se recomienda 96 GB o más para dejar margen a KV cache y buffers de activación.
- GPU recomendadas: no aplica GPU dedicada; el formato MLX está diseñado para Apple Silicon (M2 Ultra, M3 Ultra, M4 Max con 96-128 GB de memoria unificada).
- Cabe en consumer GPU: no en GPUs NVIDIA/AMD convencionales por el formato MLX; en Apple Silicon de gama alta (Mac Studio M2/M3 Ultra con 96-192 GB) sí es viable.
- Opciones de despliegue: MLX (librería `mlx`), oMLX; no compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin conversión de formato.
- Latencia y throughput: no disponible; la cabeza MTP debería mejorar el throughput respecto a decodificación estándar, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-122B-oQ5e-mtp | 125,1B (5,691 bits/peso) | no disponible | MLX safetensors | no disponible | Hugging Face (356 descargas) |
| ornith-ai/Ornith-1.5-122B (base) | ~122B + visión + MTP | no disponible | safetensors BF16 | no disponible | Hugging Face |
| Qwen3.5 MoE (familia base) | variable | no disponible | safetensors | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas. La comparación se limita a parámetros, formato y disponibilidad.

## Limitaciones y advertencias

- La cuantización a 5-bit puede degradar la calidad respecto al modelo base en tareas sensibles (matemáticas, código, razonamiento profundo); no se han publicado evaluaciones comparativas.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a GPUs NVIDIA/AMD sin reconversión.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial; debe consultarse con el autor del modelo base antes de producción.
- Los idiomas soportados no están documentados; no se puede garantizar calidad en castellano u otros idiomas distintos del inglés.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; la cuantización agresiva puede incrementarlo.
- El checkpoint se actualizó el 2026-11-11 (re-cuantizado con oMLX v0.7.4.dev1); versiones anteriores pueden tener comportamiento distinto.
- Solo 1 like y 356 descargas: comunidad pequeña, sin validación independiente extensa.
- No se dispone de información sobre longitud de contexto efectiva, lo que dificulta planificar casos de uso con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scottlowry/Ornith-1.5-122B-oQ5e-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
