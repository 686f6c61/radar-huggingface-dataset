# mchen04/LFM3-1.7B-Uncensored-MLX

## Resumen

LFM3-1.7B-Uncensored-MLX es un port a MLX del modelo AtomicChat/LFM3-1.7B-Uncensored-GGUF, pensado para ejecutarse en Apple Silicon. El modelo original parte de LiquidAI/LFM3-1.7B, desarrollado por Liquid AI, al que AtomicChat aplicó un LoRA de rango 1 proyectado (W\*=2.0) para eliminar los rechazos de seguridad y posteriormente cuantizó en formato GGUF. Este repositorio descomprime el fichero AD-Q6_K a float32 para ofrecer pesos compatibles con mlx-lm.

La arquitectura es Lfm3ForCausalLM, un transformer híbrido de 24 capas que combina 13 convoluciones cortas con compuerta, 5 capas de atención de ventana deslizante y 6 capas de atención completa. Con 1.728.801.536 parámetros y una ventana de contexto de 262.144 tokens, el modelo está orientado a conversación, tool calling y agentes en inglés, chino y alemán.

Su relevancia es doble: por un lado, permite ejecutar la arquitectura LFM3 en Macs con mlx-lm, algo que la librería no soporta de forma nativa; por otro, documenta con rigor las diferencias numéricas frente a la inferencia en llama.cpp, incluyendo comparaciones bit a bit de pesos, tokenizador y logits. La contrapartida es un tamaño de 6,9 GB (4,4 veces el GGUF) y una velocidad de decodificación de 4 a 5 veces menor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Lfm3ForCausalLM (transformer híbrido: 13 convoluciones cortas con compuerta, 5 atenciones de ventana deslizante, 6 atenciones completas; 24 capas) |
| Parámetros totales | 1.728.801.536 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | El repo contiene pesos float32; el origen GGUF está en AD-Q6_K (133 tensores F32, 66 Q8_0, 88 Q6_K) |
| Idiomas soportados | inglés, chino, alemán |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | safetensors (float32), 6,92 GB |
| Modelo base | LiquidAI/LFM3-1.7B, modificado por AtomicChat |
| Librería de inferencia | mlx-lm con `trust_remote_code=True` |
| Versiones probadas | mlx 0.32.4, mlx-lm 0.32.2, Python 3.12.13 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LFM3 de Liquid AI: un transformer híbrido que intercala 13 capas de convolución corta con compuerta, 5 capas de atención con ventana deslizante y 6 capas de atención completa. Esta combinación busca reducir el coste computacional en secuencias largas manteniendo capacidad de atención global en puntos estratégicos de la red. La ventana de contexto alcanza 262.144 tokens.

Sobre el modelo base, AtomicChat aplicó un LoRA de rango 1 proyectado con factor W\*=2.0 e integró el resultado en los pesos, eliminando los rechazos de seguridad del modelo original (proceso de abliteration). Posteriormente cuantizó el resultado en GGUF con el esquema AD-Q6_K, el de mayor fidelidad de los que publica. Este port de mchen04 descomprime ese fichero a float32: no añade precisión ni revierte el error de cuantización, solo reproduce exactamente los valores float32 resultantes de la descompresión. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original dentro de la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, chino y alemán.
- Tool calling y function calling, según los tags del repositorio y la configuración de muestreo recomendada para agentes.
- Uso en flujos de agentes y razonamiento multi-paso, con ajustes de muestreo específicos (`temperature=0.1, top_k=50, repetition_penalty=1.1`).
- Generación de código, con ajustes de muestreo dedicados en la configuración del modelo.
- Razonamiento matemático y científico, con parámetros de muestreo propios (`temperature=1.0, top_p=0.95, top_k=20, repetition_penalty=1.0`).
- Contexto largo de hasta 262.144 tokens, verificado con pruebas de hechos plantados a longitud completa.
- Modelo sin filtros de seguridad: no aplica rechazos ni filtrado propio, según advierte el autor.

## Casos de uso

- Asistentes conversacionales en local para Mac: el modelo se ejecuta con mlx-lm sobre Apple Silicon, lo que permite desplegar un chatbot multi-turno con contexto de hasta 262.144 tokens sin depender de servicios en la nube.
- Automatización de agentes con tool calling: los ajustes recomendados para agentes (`temperature=0.1, top_k=50`) y el soporte de function calling permiten construir pipelines que encadenen llamadas a herramientas en inglés, chino o alemán.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite analizar contratos, informes o bases de código extensas en una sola pasada, aunque el autor advierte de errores en hechos plantados a contexto completo.
- Generación de código en entornos de desarrollo sobre macOS: con los parámetros de muestreo para coding, puede integrarse en editores o scripts locales que necesiten autocompletado o generación de fragmentos sin conexión.
- Investigación sobre alineación y seguridad: al ser un modelo abliterated, sirve para estudiar el comportamiento de modelos sin rechazos, comparar respuestas frente al modelo base y analizar sesgos residuales.
- Experimentación con arquitecturas híbridas: investigadores pueden usar este port para evaluar el rendimiento de la combinación de convoluciones y atención de LFM3 en hardware Apple, comparando logits y salidas con la implementación de llama.cpp.
- Prototipado de asistentes multilingües: cubre inglés, chino y alemán, lo que permite validar flujos de atención al cliente o traducción asistida en esos tres idiomas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí documenta comparaciones de fidelidad frente a llama.cpp:

| Métrica | Resultado |
|---|---|
| Pesos frente a la descompresión de ggml | 286/286 tensores idénticos bit a bit |
| Tokenizador | Mismos ids en las 755 cadenas de prueba |
| Plantilla de chat | Mismos bytes en 22/22 conversaciones con ajustes equivalentes; 20/22 con los valores por defecto de `llama-server` |
| Salida greedy | Idéntica en 15 prompts cortos y 7 longitudes hasta el contexto completo |
| Logits frente a la línea base float de llama.cpp | No idénticos; diferencia máxima 2,0e-3 en prompts cortos y 1,5e-2 a contexto completo, sin cambios de top-1 |
| Logits frente a los valores por defecto de llama.cpp | No idénticos; diferencia máxima 0,62 en prompts cortos y 0,22 a contexto completo; 2 cambios de top-1 en 4.063 filas |
| Errores en contexto largo | Los mismos que el modelo origen: a contexto completo, ambos fallan uno de tres hechos plantados |

## Requisitos de hardware

- VRAM o memoria unificada: los pesos float32 ocupan 6,92 GB, por lo que se necesita al menos esa cantidad más el espacio para caché KV y buffers; el autor recomienda `mx.set_cache_limit(2**30)` para prompts muy largos.
- Hardware objetivo: Apple Silicon con mlx (probado con mlx 0.32.4 y mlx-lm 0.32.2). No está pensado para GPU NVIDIA ni CUDA.
- GPU consumer: cabe en Macs con memoria unificada de 16 GB o superior, aunque con contexto largo el consumo crece y los valores por defecto de mlx-lm se estiman insuficientes en las longitudes máximas.
- Despliegue: mlx-lm con `trust_remote_code=True`; el repositorio incluye `lfm3.py` porque mlx-lm no soporta de forma nativa la arquitectura LFM3. Para llama.cpp u Ollama, la alternativa es el GGUF original de AtomicChat, más pequeño y rápido.
- Latencia y throughput: el autor indica que este port decodifica entre 4 y 5 veces más lento que el GGUF bajo llama.cpp, y que ocupa 4,4 veces más espacio. No se proporcionan cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Uncensored-MLX (este) | 1,73 B | 262.144 | safetensors float32, 6,92 GB | LFM Open License v1.0 | Port MLX, 4-5 veces más lento que el GGUF |
| AtomicChat/LFM3-1.7B-Uncensored-GGUF | 1,73 B | 262.144 | GGUF AD-Q6_K, 1,59 GB | LFM Open License v1.0 | Origen de este port; más pequeño y rápido en llama.cpp |
| LiquidAI/LFM3-1.7B | 1,73 B | 262.144 | safetensors | LFM Open License v1.0 | Modelo base con filtros de seguridad intactos |

No se dispone de datos de benchmarks que permitan comparar rendimiento cualitativo con alternativas de otros fabricantes.

## Limitaciones y advertencias

- El modelo es abliterated: AtomicChat eliminó los rechazos de seguridad y no aplica filtrado propio, por lo que puede generar contenido inapropiado o dañino. El repositorio está marcado como `not-for-all-anchored` en la práctica mediante el tag `not-for-all-audiences`.
- La descompresión a float32 no recupera precisión perdida: los pesos son los valores exactos del GGUF cuantizado, no los originales previos a la cuantización.
- Los logits no son idénticos a los de llama.cpp; las diferencias crecen con el contexto (hasta 1,5e-2 frente a la línea base float) y los valores por defecto de llama.cpp introducen cambios de top-1.
- En contexto largo se reproducen los mismos errores que el modelo origen: a 262.144 tokens, tanto el origen como el port fallan uno de tres hechos plantados.
- Idiomas limitados a inglés, chino y alemán; no hay soporte declarado de castellano.
- La licencia LFM Open License v1.0 es de tipo "other": conviene revisar el fichero LICENSE antes de un uso comercial, ya que las condiciones no son las de una licencia permisiva estándar.
- El rendimiento es de 4 a 5 veces inferior al GGUF en llama.cpp y el tamaño es 4,4 veces mayor; solo tiene sentido si se necesita MLX.
- Requiere `trust_remote_code=True` para cargar `lfm3.py`; el autor recomienda revisar ese fichero antes de ejecutarlo.
- No se han publicado benchmarks estándar, por lo que no hay evidencia cuantitativa de calidad frente a otros modelos de 1,7 B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mchen04/LFM3-1.7B-Uncensored-MLX
- Modelo origen GGUF: https://huggingface.co/AtomicChat/LFM3-1.7B-Uncensored-GGUF
- Modelo base de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Perfil del autor del port: https://huggingface.co/mchen04
- Perfil de AtomicChat: https://huggingface.co/AtomicChat
