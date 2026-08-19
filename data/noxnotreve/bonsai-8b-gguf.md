# NoxNotreve/Bonsai-8B-gguf

## Resumen

Bonsai-8B-gguf es un modelo de lenguaje de 8.190 millones de parámetros desarrollado por Prism ML y distribuido en Hugging Face por el usuario NoxNotreve. Se trata de una versión cuantizada a 1 bit de extremo a extremo del modelo Bonsai-8B-unpacked, que a su vez se basa en la arquitectura Qwen3-8B. El objetivo principal es reducir drásticamente el tamaño y el coste computacional de un LLM de 8B sin sacrificar demasiado rendimiento, permitiendo su ejecución en dispositivos con recursos limitados.

La cuantización Q1_0 reduce el peso del modelo a 1,15 GB, es decir, 14,2 veces más pequeño que la versión FP16 (16,38 GB). Esta reducción afecta a todos los componentes: embeddings, proyecciones de atención, proyecciones MLP y la cabeza de lenguaje. El modelo se distribuye en formato GGUF y está pensado para su ejecución con llama.cpp en CUDA, Metal y CPU, además de versiones para MLX y dispositivos móviles. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones.

La relevancia de este modelo reside en su capacidad para llevar LLMs de 8B a entornos on-device con una huella de memoria mínima, manteniendo una puntuación media de 70,5 en seis categorías de evaluación, comparable a modelos de precisión completa del mismo tamaño. Es una opción atractiva para aplicaciones de inferencia local, edge computing y despliegue en móviles o dispositivos embebidos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-8B dense: GQA (32 query / 8 KV heads), SwiGLU MLP, RoPE, RMSNorm |
| Parametros totales | 8.190.000.000 (8,19B) |
| Parametros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | Q1_0 (1 bit con escala FP16 por grupo de 128 pesos) |
| Idiomas soportados | No disponible (no se especifican en la documentación) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q1_0), también disponible en MLX 1-bit g128 |

## Arquitectura y entrenamiento

Bonsai-8B-gguf es un modelo de arquitectura densa basada en Qwen3-8B, con 36 bloques de decodificador Transformer, atención con query grouped (32 cabezas de consulta y 8 de clave/valor), MLP SwiGLU, incrustaciones posicionales rotativas (RoPE) y normalización RMSNorm. El vocabulario es de 151.936 tokens, lo que permite un contexto largo de 65.536 tokens.

La innovación principal es la cuantización end-to-end a 1 bit: cada peso se representa como un solo bit que codifica el signo, con un factor de escala FP16 compartido cada 128 pesos. Esto resulta en 1,125 bits efectivos por peso. Los kernels de des-cuantización inline en GGUF permiten que la inferencia no materialice los pesos en FP16, reduciendo la memoria y acelerando el cómputo. No se dispone de información sobre los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación pública.

## Capacidades

- Generación de texto: puede producir respuestas coherentes y razonamiento básico en tareas de lenguaje natural, similar a un LLM de 8B estándar.
- Contexto largo: soporta hasta 65.536 tokens, lo que permite procesar documentos extensos, conversaciones multi-turno o análisis de código con contexto amplio.
- Ejecución multiplataforma: funciona en CUDA (GPU NVIDIA), Metal (Apple Silicon), CPU, y con versiones para Android e iOS (a través de Locally AI).
- Compatibilidad con llama.cpp: se integra con el ecosistema de llama.cpp, incluyendo servidor HTTP, CLI y bindings para otros lenguajes.
- Soporte de cuantización 1-bit: optimizado para hardware con limitaciones de memoria, ideal para inferencia en dispositivos edge.
- Compatibilidad con MLX: existe una versión complementaria en formato MLX 1-bit g128 para Apple Silicon, con kernels nativos.
- No se documentan capacidades específicas de tool calling, function calling, agentes o razonamiento multi-paso. La model card no menciona estas funcionalidades.

## Casos de uso

- **Inferencia en dispositivos móviles**: el modelo ocupa solo 1,15 GB, por lo que puede ejecutarse en smartphones de gama media con GPU integrada (por ejemplo, iPhone con Metal o Android con CUDA/ROCm). Es adecuado para asistentes personales offline o aplicaciones de chat que requieran privacidad.
- **Procesamiento de documentos largos**: su contexto de 65.536 tokens permite resumir contratos, informes técnicos o libros completos sin truncar el texto, lo que es útil en aplicaciones de análisis legal o financiero.
- **Generación de código en entornos con recursos limitados**: aunque no se documenta soporte específico de tool calling, puede generar y explicar código en editores de texto o IDEs integrados en máquinas con GPU de 4 GB o menos, como un portátil con RTX 3050.
- **Chatbots de atención al cliente**: con la ventana de 65K tokens, puede gestionar conversaciones de soporte de larga duración con historial completo, manteniendo el contexto de interacciones previas sin perder información.
- **Edge computing en IoT**: en dispositivos con memoria reducida (por ejemplo, NVIDIA Jetson o Raspberry Pi con GPU), el modelo puede ejecutarse en local para tareas de clasificación de texto, extracción de información o generación de respuestas en tiempo real sin conexión a la nube.
- **Investigación y prototipado**: dado su licencia Apache 2.0 y su pequeño tamaño, es útil para experimentar con técnicas de cuantización extrema, comparar rendimiento entre formatos (GGUF vs MLX) y evaluar el trade-off entre tamaño y calidad en entornos académicos o de I+D.

## Benchmarks y rendimiento

La model card reporta una puntuación media de **70,5** en seis categorías de evaluación, comparables a modelos de 8B de precisión completa, pero no se proporcionan resultados desglosados por tarea (MMLU, HumanEval, GSM8K, etc.). La información disponible no permite comparar directamente con otros modelos en tablas específicas. Se recomienda consultar el whitepaper para obtener detalles adicionales sobre la evaluación.

No se han publicado resultados de benchmarks detallados en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el peso de parámetros es de 1,15 GB, por lo que la inferencia cabe en GPUs con al menos 2 GB de VRAM (considerando overhead de activaciones y KV cache). Para contexto largo (65K tokens) la KV cache puede ocupar varios GB, dependiendo de la longitud real del contexto.
- **GPU recomendadas**: funciona en cualquier GPU NVIDIA con CUDA (desde RTX 20xx en adelante), GPU AMD con ROCm, y Apple Silicon con Metal. La model card menciona específicamente que es 6,2 veces más rápido que FP16 en una RTX 4090, pero no proporciona latencias concretas.
- **Consumer GPU**: sí, cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o incluso tarjetas de 4 GB, siempre que el contexto no sea máximo.
- **Opciones de despliegue**: llama.cpp (CLI, server HTTP), llama-server, MLX (Apple), MLX-Swift (iOS/macOS), y versiones para Android (con Locally AI). No se menciona compatibilidad con vLLM o TGI.
- **Latencia y throughput**: no se especifican números concretos. El modelo es 4-5 veces más eficiente energéticamente que FP16, y la inferencia es 6,2 veces más rápida en RTX 4090 según la model card, pero sin datos de tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Bonsai-8B-gguf (Q1_0)** | 8,19B | GGUF 1-bit | 1,15 GB | 65.536 | Apache 2.0 | Hugging Face |
| **Qwen3-8B (FP16)** | 8,19B | safetensors | 16,38 GB | 65.536 | Apache 2.0 | Hugging Face |
| **Llama-3.1-8B (GGUF Q4_K_M)** | 8,03B | GGUF | ~4,7 GB | 128K | Llama 3.1 | Hugging Face |
| **Mistral-7B (GGUF Q4_K_M)** | 7,24B | GGUF | ~4,1 GB | 32K | Apache 2.0 | Hugging Face |

La comparativa muestra que Bonsai-8B-gguf es el modelo más pequeño en tamaño de archivo, gracias a su cuantización a 1 bit, a costa de una precisión posiblemente inferior a los GGUF de 4 bits. No se dispone de benchmarks comparativos directos para confirmar el rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- **Degradación de rendimiento**: la cuantización a 1 bit es extrema y puede afectar la calidad en tareas complejas de razonamiento, matemáticas o código, aunque la media de 70,5 en 6 categorías sugiere un rendimiento aceptable para tareas generales.
- **Falta de benchmarks detallados**: no se han publicado resultados desglosados de MMLU, HumanEval, GSM8K, etc., lo que dificulta una evaluación rigurosa del modelo.
- **Soporte de kernels limitado**: requiere un fork específico de llama.cpp (PrismML-Eng/llama.cpp) para los kernels Q1_0; la versión principal de llama.cpp puede no soportar este formato, lo que limita su portabilidad.
- **Idiomas**: no se especifican los idiomas soportados; la model card no indica si el entrenamiento fue multilingüe o solo en inglés.
- **Sesgos y alucinaciones**: no se documentan sesgos conocidos ni riesgos de alucinación; como cualquier LLM, puede generar contenido incorrecto o inventado.
- **Licencia**: Apache 2.0 permite uso comercial, pero es recomendable verificar que el modelo base (Qwen3-8B) también cumple con la licencia Apache 2.0 (así es).
- **Contexto**: aunque el máximo es 65.536 tokens, la memoria necesaria para la KV cache puede ser elevada en GPUs pequeñas; es posible que no se pueda usar el contexto completo en dispositivos con menos de 8 GB de VRAM.

## Enlaces

- Modelo en Hugging Face (autor): https://huggingface.co/NoxNotreve/Bonsai-8B-gguf
- Modelo original en Hugging Face: https://huggingface.co/prism-ml/Bonsai-8B-gguf
- Whitepaper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/1-bit-bonsai-8b-whitepaper.pdf
- Repositorio de demostraciones y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Colab Notebook: https://colab.research.google.com/drive/1EzyAaQ2nwDvD_1X0jaVuXiVC3ZREg9bdG?usp=sharing
- Fork de llama.cpp con kernels Q1_0: https://github.com/PrismML-Eng/llama.cpp
- Fork de MLX para Apple Silicon: https://github.com/PrismML-Eng/mlx
- Fork de MLX-Swift para iOS/macOS: https://github.com/PrismML-Eng/mlx-swift
- Comunidad Discord: https://discord.gg/prismml
