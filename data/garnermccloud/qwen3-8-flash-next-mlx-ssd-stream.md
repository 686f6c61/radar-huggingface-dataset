# garnermccloud/Qwen3.8-Flash-Next-MLX-SSD-Stream

## Resumen

Qwen3.8-Flash-Next-MLX-SSD-Stream es un paquete de cuantizacion MLX del modelo multimodal Qwen3.8-Flash-Next, desarrollado por garnermccloud para ejecucion en Apple Silicon. El modelo original, creado por Qwen, es un MoE ultra-disperso de 125.000 millones de parametros con 6.000 millones activos por token, construido sobre la arquitectura Qwen4 experimental. Este paquete cuantiza los expertos enrutados a Q4 mientras mantiene el nucleo, la cabeza de verificacion y el tower de vision en BF16, y transmite la tabla de embedding n-gram de 51,2 GB en FP8 directamente desde el SSD en lugar de ocupar memoria unificada.

La relevancia de este paquete radica en que permite ejecutar un modelo de 125B con contexto nativo de 262.144 tokens en un Mac con 128 GB de memoria unificada, algo que de otra forma requeriria multiples GPU de alta gama. Incluye soporte nativo de MTP (Multi-Token Prediction) con una cabeza de verificacion BF16 intacta, lo que proporciona una aceleracion de hasta 2,22x frente a la decodificacion serial. El repositorio ocupa aproximadamente 127 GB en disco y esta probado en un M4 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-disperso con GDN + QSA (Gated DeltaNet + Qwen Sparse Attention) |
| Parametros totales | 125.000 millones (original); 24.893.841.299 en safetensors empaquetados |
| Parametros activos | 6.000 millones por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4 affine grupo 64 (expertos enrutados y MTP), Q6 affine grupo 64 (cabeza de vocabulario draft), BF16 (nucleo, embeddings, cabeza de verificacion, vision), FP8 E4M3 (tabla n-gram, transmitida desde SSD) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (MLX) + ngram_table.bin (tabla FP8 separada) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next emplea una arquitectura hibrida de atencion que combina dos mecanismos: tres de cada cuatro capas utilizan Gated DeltaNet (GDN) para comprimir el historial de forma eficiente, mientras que la cuarta capa usa Qwen Sparse Attention (QSA) para recuperacion precisa de informacion a larga distancia. Esta combinacion permite mantener un contexto de 262.144 tokens con un coste computacional reducido. Ademas, incorpora una tabla de embedding n-gram de aproximadamente 51.000 millones de parametros almacenada en FP8, que se transmite desde SSD en este paquete MLX.

El modelo es un MoE ultra-disperso: de los 125.000 millones de parametros totales, solo 6.000 millones se activan por token. El paquete MLX mantiene la cabeza de verificacion en BF16 sin cuantizar, lo que garantiza que cada propuesta generada por la cabeza draft Q6 sea verificada con precision completa. El entrenamiento del modelo original incluye capacidades de razonamiento y tool calling, aunque los detalles especificos del dataset y el proceso de alineacion no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto multimodal: acepta entradas de texto, imagen y video, con pipeline image-text-to-text.
- Razonamiento avanzado: el modelo original supera a Claude-4.6-Opus (Max) en evaluaciones internas de Qwen, segun la documentacion de unsloth.
- Tool calling estructurado: soporta llamadas a funciones y razonamiento multi-paso.
- MTP nativo (Multi-Token Prediction): predice multiples tokens por paso con profundidad 4 por defecto, verificados por una cabeza BF16 sin cuantizar.
- Recuperacion de informacion en contexto largo: probado con una solicitud de recuperacion de 248.445 tokens sin cache que devolvio la clave exacta dentro del limite de contexto.
- Compatibilidad de APIs: expone OpenAI Chat Completions, OpenAI Responses, Anthropic Messages y Ollama APIs.
- Contexto nativo de 262.144 tokens sin necesidad de modelos companeros ni flags de servidor.

## Casos de uso

- Recuperacion de informacion en documentos extensos: con 262.144 tokens de contexto, el modelo puede procesar documentos tecnicos completos o codebases enteros y recuperar datos especificos enterrados en el texto. La prueba de 248.445 tokens demuestra que mantiene precision en tareas de recuperacion a escala casi maxima de contexto.
- Generacion de codigo en produccion: el soporte de tool calling y razonamiento estructurado permite integrarlo en pipelines de CI/CD para generar modulos Python, revisar parses de CSV o producir codigo con verificacion sintactica. El benchmark de 73,8 tok/s con MTP en un modulo parser Python lo hace viable para edicion interactiva.
- Analisis de documentos tecnicos y cientificos: la capacidad de procesar prosa tecnica densa (probada con texto sobre desvanecimiento Rayleigh) a 71,2 tok/s permite resumir, extraer y analizar articulos de investigacion completos en una sola pasada.
- Asistente de desarrollo local en Apple Silicon: al ejecutarse en un Mac con 128 GB de memoria unificada, permite a desarrolladores que trabajan con hardware Apple mantener un asistente de codigo local sin enviar datos a la nube, con privacidad total.
- Servidor de inferencia multimodal para equipos: al exponer APIs compatibles con OpenAI, Anthropic y Ollama, puede desplegarse como backend unificado para herramientas existentes que ya usan esos protocolos, soportando consultas de texto, imagen y video.
- Razonamiento y planificacion de agentes: la combinacion de tool calling, razonamiento multi-paso y contexto largo permite construir agentes que mantienen estado conversacional extenso y ejecutan tareas complejas con multiples llamadas a herramientas.

## Benchmarks y rendimiento

Rendimiento medido en M4 Max con 128 GB de memoria unificada, contexto de servidor de 262.144 tokens, profundidad MTP nativa de 4. Las tasas son tokens de completacion divididos por el tiempo total de pared de la solicitud, mediana de tres ejecuciones calientes tras un warmup descartado. Cada fila usa el mismo prompt y muestreo greedy en ambos brazos.

| Carga de trabajo | Completacion | MTP por defecto | Serial | Aceleracion |
|---|---:|---:|---:|---:|
| Modulo parser CSV en Python | 600 tokens | 73,8 tok/s | 33,2 tok/s | 2,22x |
| Prosa tecnica sobre desvanecimiento Rayleigh | 600 tokens | 71,2 tok/s | 33,0 tok/s | 2,16x |
| Frases numeradas unicas | 1.024 tokens | 54,4 tok/s | 32,2 tok/s | 1,69x |

Adicionalmente, una solicitud de recuperacion de 248.445 tokens sin cache se completo a 280,7 tok/s de prompt, devolviendo la clave enterrada exacta y deteniendose correctamente dentro del contexto de servidor de 262.144 tokens.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Memoria unificada: aproximadamente 75,3 GB de asignacion del modelo antes de caches de solicitud. Probado en M4 Max con 128 GB de memoria unificada.
- Disco: aproximadamente 127 GB de espacio en disco para el repositorio preparado, incluyendo la tabla de 51,2 GB transmitida desde SSD.
- GPU: requiere Apple Silicon con MLX. No es compatible con GPU NVIDIA o AMD. Un M4 Max con 128 GB es la configuracion de referencia probada.
- Almacenamiento: es imprescindible un SSD rapido, ya que la tabla n-gram de 51,2 GB se transmite desde disco en lugar de cargarse en memoria.
- Opciones de despliegue: el paquete se ejecuta con el servidor mlx-serve de garnermccloud, que expone APIs compatibles con OpenAI, Anthropic y Ollama. No es compatible con vLLM, llama.cpp ni TGI por estar limitado a MLX.
- Latencia y throughput: 54-74 tok/s de generacion con MTP activado y 32-33 tok/s en serial, dependiendo de la carga de trabajo. 280,7 tok/s de prompt en solicitudes largas sin cache.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Hardware |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | 125B | 6B | 262.144 | qwen-community-1.0 | Multi-GPU (FP8) |
| Qwen3.8-Flash-Next-MLX-SSD-Stream (este) | 125B (24,9B en safetensors) | 6B | 262.144 | qwen-community-1.0 | Apple Silicon, 128 GB unificada |
| Qwen3.8-Flash-Next-NVFP4-SSD-Stream | 125B | 6B | 262.144 | qwen-community-1.0 | GPU NVIDIA con NVFP4 |

La diferencia principal frente al modelo original es la cuantizacion Q4 de los expertos y la transmision de la tabla n-gram desde SSD, lo que reduce el requisito de memoria de 51,2 GB a cero en memoria unificada a cambio de depender del ancho de banda del SSD. Frente a la variante NVFP4, esta version MLX esta optimizada para Apple Silicon y no requiere GPU NVIDIA.

## Limitaciones y advertencias

- Plataforma restringida: solo funciona en Apple Silicon con MLX. No es portable a entornos con GPU NVIDIA o AMD sin convertir los pesos.
- Requisitos de memoria elevados: necesita al menos 128 GB de memoria unificada para el contexto completo de 262.144 tokens. Con menos memoria, el contexto debera reducirse.
- Dependencia del SSD: la tabla n-gram de 51,2 GB se transmite desde disco, por lo que el rendimiento en recuperacion de informacion depende criticamente del ancho de banda del SSD. Un SSD lento degradara significativamente el throughput de prompt.
- Licencia qwen-community-1.0: es una licencia de comunidad de Qwen con restricciones especificas. Es necesario revisar los terminos completos antes de uso comercial, ya que puede haber limitaciones de redistribucion o de uso en ciertos sectores.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de recuperacion de informacion donde el contexto es muy largo.
- Sesgos: no se dispone de informacion sobre evaluaciones de sesgo o seguridad para este modelo especifico.
- El recuento de parametros de Hugging Face (24,9B) refleja los safetensors empaquetados, no la arquitectura original de 125B. Esto puede causar confusion al comparar con otros modelos.
- No se han publicado resultados de benchmarks estandar de razonamiento, matematicas o codigo (MMLU, GSM8K, HumanEval) para esta version cuantizada, por lo que la degradacion de calidad frente al original BF16 no esta cuantificada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/garnermccloud/Qwen3.8-Flash-Next-MLX-SSD-Stream
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo original: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Fuente de la tabla FP8: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Servidor mlx-serve: https://github.com/garnermccloud/mlx-serve
- Documentacion de ejecucion local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM del modelo original: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
