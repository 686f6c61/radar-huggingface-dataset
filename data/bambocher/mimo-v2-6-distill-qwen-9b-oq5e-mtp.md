# bambocher/MiMo-V2.6-Distill-Qwen-9B-oQ5e-mtp

## Resumen

MiMo-V2.6-Distill-Qwen-9B-oQ5e-mtp es una cuantización de precisión mixta del modelo bambocher/MiMo-V2.6-Distill-Qwen-9B, publicada por el usuario bambocher. Se trata de un destilado sobre arquitectura Qwen (tag `qwen3_5`) con aproximadamente 9.653 millones de parámetros totales, del cual se ha generado una versión comprimida mediante la herramienta oQ (oMLX v0.7.3) con un promedio efectivo de 6.219 bits por peso. El resultado ocupa 7,5 GB en disco (6,989 GiB) y está pensado para su ejecución en el framework MLX de Apple.

La relevancia de esta ficha es doble. Por un lado, documenta un artefacto de cuantización mixta que preserva en BF16 las capas más sensibles (0,491B de parámetros, un 5,08 % del total) mientras comprime el grueso de los pesos a 5 y 6 bits, una estrategia habitual para mantener calidad en modelos pequeños. Por otro lado, el checkpoint incluye componentes no habituales en un LLM puro: un codificador de visión de 0,456B de parámetros y una cabeza MTP (multi-token prediction) de 0,243B, lo que lo convierte en un modelo multimodal con decodificación especulativa integrada.

Conviene señalar que la información pública disponible es muy limitada: no hay model card del modelo base, no se declaran idiomas, licencia ni resultados de benchmarks, y el repositorio no registra descargas ni interacciones. Todo lo que sigue se basa en los metadatos del repositorio y en la tabla de cuantización publicada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen (tag `qwen3_5`), con codificador de visión y cabeza MTP; detalles de capas y atención no disponibles |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantización mixta oQ (oMLX v0.7.3): affine 5-bit grupo 64 (76,813 % de los pesos), affine 6-bit grupo 64 (17,880 %), affine 8-bit grupo 64 (0,224 %), BF16 (5,083 %); promedio efectivo 6,219 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería `mlx`) |
| Tamano del repositorio | 7,5 GB (6,989 GiB de pesos; 7.504 GB en total) |
| Desglose por componente | Lenguaje: 8,954B (5,942 GiB); visión: 0,456B (0,849 GiB); cabeza MTP: 0,243B (0,198 GiB) |
| Fecha de publicacion | 2026-11-13 |

## Arquitectura y entrenamiento

El checkpoint deriva de un destilado (el nombre incluye "Distill") construido sobre una arquitectura etiquetada como `qwen3_5`, es decir, la familia Qwen de Alibaba. Con 9,653B de parámetros totales y un desglose que separa 8,954B de lenguaje, 0,456B de visión y 0,243B de cabeza MTP, el modelo combina un backbone de lenguaje con un proyector/encoder visual y un módulo de predicción multi-token. Este último componente (MTP) es característico de las arquitecturas orientadas a decodificación especulativa: predice varios tokens por paso para acelerar la generación, algo que Qwen3-Next y modelos similares incorporan de serie.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el destilado empleó RLHF, DPO u otras técnicas de alineamiento. La model card del repositorio se limita a describir el proceso de cuantización: la herramienta oQ de oMLX aplica precisión mixta asignando 5 bits a la mayoría de tensores (grupo de 64), 6 bits a una fracción relevante y manteniendo en BF16 un 5 % de los pesos, presumiblemente capas de normalización, embeddings o proyecciones sensibles. El resultado es un checkpoint de 6,219 bits/peso efectivos que reduce el espacio de 16 bits a menos del 40 % del original.

## Capacidades

- Generación de texto y razonamiento en el backbone de lenguaje de 8,954B de parámetros.
- Procesamiento de imágenes: el componente de visión de 0,456B sugiere capacidades multimodales (entrada de imagen), aunque no se detalla el tipo de tareas.
- Decodificación especulativa mediante la cabeza MTP de 0,243B, orientada a reducir latencia en generación autoregresiva.
- Destilado: al ser un modelo "Distill", se espera que herede parte de las capacidades de un modelo profesor de mayor tamaño, aunque no se especifica cuál.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo thinking explícito: no disponible.

## Casos de uso

- Inferencia local en Mac con MLX: el formato safetensors para `mlx` y los 7,5 GB de pesos permiten ejecutar el modelo en equipos Apple Silicon con memoria unificada de 16 GB o superior, aprovechando la cuantización mixta para reducir el ancho de banda de memoria.
- Prototipado de asistentes multimodales: la presencia de un encoder visual de 0,456B permite experimentar con pipelines imagen-texto en local sin depender de APIs externas.
- Evaluación de decodificación especulativa: la cabeza MTP integrada hace del modelo un banco de pruebas para medir la ganancia de throughput de la predicción multi-token frente a la generación token a token.
- Destilación y fine-tuning sobre dominio específico: al ser un destilado de 9B con licencia no declarada, sirve como base para experimentos académicos de ajuste supervisado en tareas verticales (clasificación, extracción, resumen).
- Investigación sobre cuantización mixta: el checkpoint documenta con precisión la distribución de bits por tensor, lo que permite estudiar el impacto de la asignación 5/6/8/BF16 en la calidad frente al modelo base sin cuantizar.
- Despliegue en entornos con restricciones de memoria: 6,989 GiB de pesos caben en GPUs consumer de 8-12 GB y en contenedores con límites estrictos, siempre que se use un runtime compatible con MLX o se convierta el checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~7 GB solo para pesos (6,989 GiB). Con overhead de contexto y activaciones, se recomienda un mínimo de 10-12 GB de memoria unificada o VRAM.
- GPU recomendadas: el formato es MLX, por lo que el objetivo natural son chips Apple Silicon (M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra con 16 GB o más de memoria unificada). En GPUs NVIDIA no es ejecutable directamente sin conversión de formato.
- Cabe en GPU consumer: sí, en el ecosistema Apple; en NVIDIA requeriría reconvertir los pesos a GGUF o safetensors estándar, tras lo cual cabría en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores.
- Opciones de despliegue: MLX (mlx-lm) es el runtime nativo; para otros entornos habría que exportar a llama.cpp, Ollama o vLLM, con la salvedad de que la cabeza MTP y el encoder visual pueden no estar soportados por todos ellos.
- Latencia y throughput: no disponibles. La cabeza MTP está diseñada para mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-oQ5e-mtp | 9,653B | No disponible | No disponible | safetensors (MLX) | Cuantización mixta 6,219 bits/peso; incluye visión y MTP |
| MiMo-V2.6-Distill-Qwen-9B (base) | 9,653B (sin cuantizar) | No disponible | No disponible | safetensors | Referencia de calidad; mayor tamaño en disco |
| Qwen3-8B | ~8B | 32K-128K (según variante) | Apache 2.0 (variantes estándar) | safetensors, GGUF | Alternativa de tamaño comparable con licencia permisiva y amplio soporte de runtimes |
| Gemma 3 4B/12B | 4B / 12B | 128K | Gemma Terms | safetensors, GGUF | Multimodal con visión; licencia con restricciones de uso |

La comparación con Qwen3-8B y Gemma 3 es orientativa: no se dispone de datos de rendimiento del modelo analizado que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: no es posible determinar si el uso comercial está permitido; debe contactarse con el autor o consultarse el modelo base antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce la cobertura multilingüe y el rendimiento en castellano.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni tareas multimodales.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 9B destilados; sin datos de alineamiento no puede acotarse.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Compatibilidad limitada: el formato MLX restringe su uso a macOS/Apple Silicon; la conversión a otros runtimes puede perder la cabeza MTP o el encoder visual.
- Cuantización agresiva: 76,8 % de los pesos a 5 bits puede degradar tareas sensibles a precisión (matemáticas, código) respecto al modelo base en BF16.
- Origen del destilado no documentado: se desconoce el modelo profesor, los datos de destilación y las posibles restricciones heredadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bambocher/MiMo-V2.6-Distill-Qwen-9B-oQ5e-mtp
- Modelo base: https://huggingface.co/bambocher/MiMo-V2.6-Distill-Qwen-9B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Framework MLX: https://github.com/ml-explore/mlx
