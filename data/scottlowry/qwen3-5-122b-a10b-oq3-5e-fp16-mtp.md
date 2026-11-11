# scottlowry/Qwen3.5-122B-A10B-oQ3.5e-fp16-mtp

## Resumen

Qwen3.5-122B-A10B-oQ3.5e-fp16-mtp es una cuantización mixta del modelo Qwen3.5-122B-A10B, desarrollado originalmente por el equipo Qwen de Alibaba. La versión publicada por el usuario scottlowry en Hugging Face aplica la herramienta oQ (oMLX v0.7.4.dev1) para generar un checkpoint de precisión mixta orientado a la librería MLX de Apple, lo que permite ejecutar un modelo de 125.000 millones de parámetros en hardware Apple Silicon con un peso de almacenamiento de unos 60 GiB.

El modelo base es un transformer de tipo Mixture of Experts (MoE) con 122.000 millones de parámetros en el modelo de lenguaje, a los que se suman 451 millones en el codificador de visión y 2.524 millones en una cabeza MTP (multi-token prediction). La cuantización resultante tiene un promedio efectivo de 4,117 bits por peso, combinando capas en 3, 4, 5, 6, 8 bits y algunas en FP16/FP32 para preservar la calidad en los componentes más sensibles.

Su relevancia radica en que demuestra la viabilidad de servir un MoE de gran tamaño con capacidades multimodales y decodificación especulativa (MTP) en equipos de sobremesa con memoria unificada, algo que hasta hace poco requería clústeres de GPU. Es, por tanto, un artefacto pensado para experimentación e inferencia local en Mac, no para despliegues de producción en servidores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Qwen3.5) con codificador de visión y cabeza MTP |
| Parámetros totales | 125.086.497.008 (125,086B) |
| Parámetros activos | no disponible (el nombre A10B sugiere ~10B activos, dato no confirmado en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: affine 3/4/5/6/8 bits (grupo 64 y 128), FP16 y FP32; promedio 4,117 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |
| Tamaño del repositorio | 192,1 GB (checkpoint cuantizado: 64,373 GB / 59,952 GiB) |
| Componentes | Lenguaje 122,112B; visión 0,451B; cabeza MTP 2,524B |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-122B-A10B es un transformer con mezcla de expertos (MoE) que, según la nomenclatura del nombre, activa aproximadamente 10.000 millones de parámetros por token, aunque la información proporcionada no confirma el número exacto de expertos ni la política de enrutamiento. Incluye un codificador de visión de 451 millones de parámetros, lo que lo convierte en un modelo multimodal imagen-texto, y una cabeza de predicción multi-token (MTP) de 2.524 millones que habilita decodificación especulativa para acelerar la generación.

La versión publicada por scottlowry no reentrena el modelo, sino que aplica cuantización de precisión mixta con oQ (oMLX v0.7.4.dev1). La distribución de bits es selectiva: el 61,8 % de los pesos queda en 3 bits (grupo 64), el 33,2 % en 4 bits, y solo un 3,5 % en 5-8 bits, con un 0,4 % en FP16/FP32 reservado para capas críticas (probablemente embeddings, normas y cabezas). El checkpoint fue re-cuantizado el 11 de noviembre de 2026, por lo que versiones anteriores deben descartarse. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base Qwen3.5.
- Procesamiento de imágenes mediante el codificador de visión integrado (0,451B de parámetros).
- Decodificación especulativa gracias a la cabeza MTP, que permite proponer varios tokens por paso y validarlos en paralelo.
- Soporte multilingüe: no confirmado en la información disponible, aunque la familia Qwen suele cubrir decenas de idiomas.
- Tool calling y function calling: no confirmado en la información disponible.
- Modo de razonamiento extendido (thinking): no confirmado en la información disponible.
- Ejecución local en Apple Silicon mediante MLX.

## Casos de uso

- Inferencia local en Mac Studio o MacBook Pro con memoria unificada alta: el checkpoint de ~60 GiB cabe en equipos con 64 GB o 96 GB de RAM unificada, permitiendo ejecutar un MoE de 125B sin GPU dedicada.
- Prototipado de asistentes multimodales: el codificador de visión permite experimentar con tareas de imagen-texto (descripción, VQA, extracción de información de capturas) en un entorno de desarrollo local.
- Investigación sobre cuantización: la distribución mixta de bits sirve como caso de estudio para medir la degradación de calidad frente al modelo original en FP16/BF16.
- Evaluación de decodificación especulativa: la cabeza MTP permite medir aceleraciones de throughput en MLX y comparar con decodificación autoregresiva estándar.
- Generación de texto de larga extensión en local: útil para redacción técnica, resumen de documentos y borradores, siempre que el contexto disponible sea suficiente (dato no confirmado).
- Pruebas de pipelines de agentes en hardware de sobremesa: si el modelo base soporta tool calling, este checkpoint permite validar flujos multi-paso sin coste de API.
- Docencia y demostraciones: permite mostrar el comportamiento de un MoE grande en un portátil o estación de trabajo Apple, sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: ~60 GiB para los pesos cuantizados; con overhead de contexto y caché KV, se recomienda un mínimo de 64 GB y idealmente 96-128 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada grande (M2 Ultra, M3 Ultra, M4 Max con 64 GB o más). No es un checkpoint utilizable en CUDA de forma nativa por su formato MLX.
- Cabe en GPU de consumo: sí, en equipos Apple con 64 GB o más de memoria unificada; no en RTX 4090 (24 GB) ni en GPUs de 48 GB por el tamaño del checkpoint.
- Opciones de despliegue: MLX (librería nativa), oMLX para gestión de cuantizaciones; no compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada; la cabeza MTP está pensada para mejorar el throughput mediante decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-122B-A10B-oQ3.5e-fp16-mtp (este) | 125,086B (MoE) | no disponible | safetensors MLX, 4,117 bits/peso | no disponible | Hugging Face (111 descargas) |
| Qwen/Qwen3.5-122B-A10B (base) | 122B lenguaje + visión + MTP | no disponible | safetensors FP16/BF16 | no disponible | Hugging Face (oficial) |
| Otras cuantizaciones del mismo base | variable | no disponible | GGUF, MLX, etc. | según autor | Hugging Face |

No se dispone de información sobre modelos alternativos comparables en la misma categoría (MoE multimodal de ~120B con cuantización MLX) para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La cuantización mixta a 4,117 bits/peso introduce degradación de calidad respecto al modelo base en FP16/BF16; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- El 61,8 % de los pesos está en 3 bits, lo que puede afectar especialmente a tareas de razonamiento matemático y código.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; hay que remitirse a la licencia del modelo base Qwen/Qwen3.5-122B-A10B.
- Formato MLX exclusivo: no es portable a CUDA, ROCm ni a motores de inferencia estándar sin reconversión.
- Tamaño de repositorio de 192,1 GB frente a un checkpoint de ~60 GiB: la descarga incluye artefactos adicionales que conviene revisar antes de descargar.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran tamaño; no hay datos específicos de evaluación para esta cuantización.
- Idiomas soportados no confirmados; el rendimiento en castellano no está verificado.
- Modelo comunitario (0 likes, 111 descargas): no cuenta con validación oficial del equipo Qwen.
- La fecha de actualización (noviembre de 2026) indica que versiones anteriores del checkpoint deben descartarse y volver a descargarse.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.5-122B-A10B-oQ3.5e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
