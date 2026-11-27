# Accio-Lab/occamy-1.0-MLX-4bit

## Resumen

Occamy-1.0-MLX-4bit es una cuantización de 4 bits nativa para MLX del modelo Occamy-1.0, desarrollado por Accio-Lab. Se trata de un modelo de generación de texto basado en la arquitectura Qwen3.5 MoE (mixture of experts), con 34.660.608.768 parámetros totales y un tamaño de repositorio de 19,5 GB. Esta variante está pensada específicamente para su ejecución en Apple Silicon mediante la librería MLX, lo que la hace relevante para desarrolladores que quieren desplegar un modelo de gran tamaño en hardware de Apple sin depender de CUDA.

El modelo base Occamy-1.0 se distribuye bajo licencia Apache 2.0 y cuenta con un artículo científico asociado (arXiv:2609.11977). Esta exportación concreta utiliza cuantización afín nativa de 4 bits con group size 64, mientras que las puertas del router y de los expertos compartidos se mantienen en 8 bits. El resultado es un artefacto de 19,51 GB (18,17 GiB) que, según el autor, ha superado las comprobaciones de validación en Linux nativo con MLX, pero cuya aceptación en Metal (Mac) sigue pendiente.

Es importante señalar que esta es una *candidate release*: el autor advierte explícitamente de que la inferencia en Mac, el rendimiento y la calidad amplia del modelo no están verificados. Las pruebas realizadas se limitan a una recarga estricta con el cargador estándar, comprobaciones de valores en coma flotante, dequantización nativa de cada fila cuantizada, comparación de tokenizer y plantilla, y una generación greedy acotada con caché en CPU que devolvió el resultado correcto para "2+2". Se trata, por tanto, de un smoke test limitado, no de un benchmark de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (mixture of experts) |
| Parametros totales | 34.660.608.768 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín nativa, group size 64; router y puertas de expertos compartidos en 8 bits |
| Idiomas soportados | no disponible (el modelo base no declara idiomas en la información disponible) |
| Licencia | Apache 2.0 (heredada de Occamy-1.0) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura Qwen3.5 MoE, es decir, un transformer con mezcla de expertos. La información disponible no detalla el número de parámetros activos por token, el número de expertos, la composición del dataset de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican la longitud de contexto nativa ni los idiomas de entrenamiento. El artículo asociado (arXiv:2609.11977) es la referencia para obtener esos detalles, pero su contenido no se incluye en la información proporcionada.

En cuanto a la innovación técnica de esta exportación, destaca el proceso de conversión: un adaptador sin pérdida apila los pesos de los expertos en orden numérico antes de invocar una única vez el sanitizador de Qwen3.5. La cuantización y la serialización usan APIs nativas de MLX, y la recarga se realiza con el cargador estándar sin adaptador. Las validaciones en Linux incluyen recarga estricta, comprobación completa de valores en coma flotante almacenados, dequantización nativa de cada fila cuantizada, comparación de tokenizer y plantilla, y una generación greedy con caché y logits finitos. El modelo es solo de texto: no incluye visión ni la cabeza MTP (multi-token prediction).

## Capacidades

- Generación de texto conversacional y de propósito general, según el pipeline declarado (text-generation, conversational).
- Razonamiento y matemáticas básicas: la prueba de humo con "Compute 2+2. Answer briefly." devolvió `4`.
- Plantilla de chat con soporte de modo thinking controlable mediante `enable_thinking` (la receta de uso lo desactiva explícitamente).
- Servidor de API local compatible con el endpoint `/v1/chat/completions` mediante `mlx_lm.server`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling y comportamiento agente: no disponibles en la información proporcionada.
- Visión y audio: no incluidos (el modelo es solo de texto).
- MTP (multi-token prediction): no incluido en esta exportación; existe una cabeza MTP separada en el repositorio del autor.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo está empaquetado en MLX 4 bits para ejecutarse en Macs con memoria unificada suficiente, usando `mlx-lm` como runtime. Es adecuado para desarrolladores que quieren probar un MoE de ~34,7 mil millones de parámetros sin GPU NVIDIA.
- Prototipado de asistentes conversacionales: la plantilla de chat y el servidor compatible con la API de OpenAI permiten montar un endpoint local en `http://127.0.0.1:8000/v1` y conectar clientes existentes sin cambios de código.
- Experimentación con cuantización: al existir variantes de 3, 4, 5, 6 y 8 bits, además de MXFP8, MXFP4 y NVFP4, el modelo sirve para comparar el equilibrio entre tamaño, memoria y calidad en el mismo checkpoint base.
- Evaluación de calidad de modelos MoE: investigadores pueden usar esta variante para medir el impacto de la cuantización 4 bits frente al BF16 original en tareas de razonamiento y matemáticas.
- Despliegue en entornos sin CUDA: equipos que trabajan exclusivamente con hardware de Apple pueden usar esta exportación como alternativa a las variantes GGUF, FP8 o NVFP4, que requieren otras pilas de ejecución.
- Pruebas de integración de API local: el recetario con `curl` contra `/v1/chat/completions` facilita la validación de pipelines de aplicaciones que consumen APIs compatibles con OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta una prueba de humo cualitativa ("Compute 2+2. Answer briefly." devuelve `4`) y advierte de que no constituye un benchmark de calidad ni un resultado de rendimiento en Mac.

## Requisitos de hardware

- VRAM/memoria unificada: el archivo de pesos ocupa 19,51 GB (18,17 GiB). El autor advierte explícitamente de que el tamaño del archivo no es el requisito de memoria unificada: hay que dejar espacio para el sistema operativo, la caché KV y los buffers del runtime.
- GPU recomendadas: no disponibles en la información proporcionada. El destino declarado es Apple Silicon (Metal), si bien la aceptación en Metal está pendiente.
- ¿Cabe en GPU de consumo? No disponible. En el ecosistema Apple, el requisito de memoria unificada apunta a equipos con al menos ~24-32 GB para dejar margen a la caché KV y al sistema, aunque el autor no confirma cifras.
- Opciones de despliegue: `mlx-lm` (versiones 0.31.3 con mlx 0.32.2, y transformers 5.8.1 para el servidor), incluyendo `mlx_lm.server` para API local compatible con OpenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta variante MLX.
- Latencia y throughput: no disponibles. El autor indica que el rendimiento en Mac no está verificado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Occamy-1.0-MLX-4bit | 34.660.608.768 | no disponible | MLX safetensors 4 bits | Apache 2.0 | Candidate release, Mac pendiente |
| Occamy-1.0 (BF16) | 34.660.608.768 | no disponible | safetensors BF16 | Apache 2.0 | Modelo base de referencia |
| Occamy-1.0-GGUF | 34.660.608.768 | no disponible | GGUF | Apache 2.0 | Variante para llama.cpp y afines |
| Occamy-1.0-NVFP4 | 34.660.608.768 | no disponible | NVFP4 | Apache 2.0 | Variante para hardware NVIDIA |

La comparación con modelos de otros autores no está disponible en la información proporcionada. Dentro de la propia familia Occamy, la variante MLX 4 bits se distingue por su menor tamaño (19,51 GB) frente al BF16 y por estar orientada exclusivamente a Apple Silicon.

## Limitaciones y advertencias

- Estado de validación: es una *candidate release*; la aceptación en Mac Metal está pendiente y la calidad amplia del modelo no está verificada. Las comprobaciones realizadas son un smoke test limitado en Linux, no un benchmark.
- Solo texto: no incluye visión ni cabeza MTP; no debe esperarse soporte multimodal.
- Idiomas: no se declaran idiomas soportados en la información disponible, por lo que el rendimiento multilingüe es incierto.
- Contexto: la longitud de contexto no está documentada en la información proporcionada; conviene consultar la model card del modelo base antes de usarlo en producción.
- Alucinación y sesgos: no hay información específica publicada; al ser un modelo de lenguaje, cabe esperar los riesgos habituales de alucinación y sesgo, pero no se cuantifican.
- Licencia: Apache 2.0 permite uso comercial, pero se hereda del modelo base; conviene revisar la licencia original de Occamy-1.0 y del artículo asociado.
- Memoria: el tamaño del archivo (19,51 GB) no equivale al requisito de memoria unificada; hay que reservar espacio para el sistema, la caché KV y los buffers.
- Dependencias de versión: la receta fija `mlx==0.32.2`, `mlx-lm==0.31.3` y `transformers==5.8.1`; otras versiones pueden no ser compatibles.
- Advertencia del autor: las comprobaciones HTTP de inferencia de esta release solo se registran para las exportaciones de 6 y 8 bits, no para la de 4 bits.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-4bit
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Colección de modelos: https://huggingface.co/collections/Accio-Lab/occamy-10-6ac00729659e8a86ec11e216
- Colección MLX: https://huggingface.co/collections/Accio-Lab/occamy-10-mlx-6ac0072a7c1cdbc5e418e90b
- Checkpoint explorer: https://huggingface.co/spaces/Accio-Lab/Occamy-Explorer
- Página del proyecto: https://accio-lab.github.io/occamy/
- Artículo (arXiv): https://arxiv.org/abs/2609.11977
- Variante GGUF: https://huggingface.co/Accio-Lab/occamy-1.0-GGUF
- Variante FP8: https://huggingface.co/Accio-Lab/occamy-1.0-FP8
- Variante NVFP4: https://huggingface.co/Accio-Lab/occamy-1.0-NVFP4
- Variante MLX 8 bits: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-8bit
- Variante MLX 6 bits: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-6bit
- Variante MLX 5 bits: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-5bit
- Variante MLX 3 bits: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-3bit
- Variante MLX MXFP8: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-mxfp8
- Variante MLX MXFP4: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-mxfp4
- Variante MLX NVFP4: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-nvfp4
- Cabeza MTP: https://huggingface.co/Accio-Lab/occamy-1.0-MTP
- Resumen de validación: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-4bit/blob/main/validation_summary.json
- Hashes de artefactos: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-4bit/blob/main/SHA256SUMS
- Licencia: https://huggingface.co/Accio-Lab/occamy-1.0/blob/main/LICENSE
