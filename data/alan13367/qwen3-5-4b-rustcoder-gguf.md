# alan13367/Qwen3.5-4B-RustCoder-GGUF

## Resumen

Qwen3.5-4B-RustCoder-GGUF es la versión cuantizada en formato GGUF del modelo alan13367/Qwen3.5-4B-RustCoder, un ajuste fino de Qwen/Qwen3.5-4B orientado a la generación de código Rust que compile, pase tests y supere las comprobaciones de clippy. El modelo lo publica el usuario alan13367 y está pensado para su uso con llama.cpp y otros runtimes compatibles con GGUF, como Ollama o LM Studio, siempre que su versión de llama.cpp soporte la arquitectura `qwen35`.

El modelo base cuenta con 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) y conserva el modo de razonamiento (thinking mode) del modelo original. Es un modelo exclusivamente de texto: no incluye proyector de visión. La ficha se centra en la distribución GGUF, que ofrece dos archivos: Q8_0 (8,5 bits por peso, 4,5 GB) y Q4_K_M (5,1 bits por peso, 2,7 GB).

Su relevancia radica en que empaqueta un ajuste fino especializado en Rust en un formato ejecutable localmente con requisitos de hardware moderados, manteniendo una calidad prácticamente idéntica al bf16 en el caso de Q8_0 (perplejidad 1,3630 frente a 1,3632 del bf16) y una pérdida de en torno al 1 % en perplejidad con Q4_K_M (1,3760).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura `qwen35` en llama.cpp); detalles internos no disponibles |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; se recomienda usar al menos 8192 tokens en llama.cpp |
| Tipos de cuantizacion | Q8_0 (8,5 bits por peso) y Q4_K_M (5,1 bits por peso) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp y runtimes compatibles) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,2 mil millones de parámetros. La model card no detalla la composición del dataset de ajuste fino ni el número de tokens utilizados; únicamente indica que el objetivo del entrenamiento era producir Rust que compile, pase tests y esté limpio según clippy, conservando el modo de razonamiento del modelo base. La información sobre el proceso de entrenamiento (posible RLHF, DPO u otras técnicas) se remite a la model card del modelo principal, que no está incluida en los datos disponibles.

En cuanto a la conversión a GGUF, ambos archivos se generaron a partir de los pesos bf16 con `convert_hf_to_gguf.py` de llama.cpp (build b12110) y se cuantizaron con `llama-quantize` sin matriz de importancia. Las comprobaciones de perplejidad se hicieron con `llama-perplexity` sobre seis respuestas de entrenamiento del propio modelo, renderizadas con su plantilla de chat y en fragmentos de 2048 tokens: bf16 obtuvo 1,3632 ± 0,019, Q8_0 1,3630 ± 0,019 y Q4_K_M 1,3760 ± 0,019. La pérdida por token fue de 0,310 para bf16 y Q8_0, y de 0,319 para Q4_K_M.

## Capacidades

- Generación de código Rust con el objetivo explícito de que compile, pase tests y supere clippy.
- Modo de razonamiento (thinking mode) activado por defecto en la plantilla de chat.
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints de tipo OpenAI (`endpoints_compatible`) a través de llama.cpp.
- Modelo exclusivamente de texto: no incluye visión ni audio.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Generación de código Rust en local: el modelo está ajustado para producir código que compile y pase tests, por lo que encaja en flujos de trabajo de desarrollo en Rust donde se quiera asistencia sin depender de la nube, ejecutando el GGUF Q4_K_M en hardware de consumo.
- Revisión y corrección de código Rust: gracias a su orientación a clippy, puede emplearse para detectar y corregir avisos de lint y malas prácticas en fragmentos de código existentes.
- Asistencia en entornos con requisitos de privacidad: al ejecutarse con llama.cpp en local, permite procesar código propietario sin enviarlo a servicios externos.
- Integración en pipelines de CI/CD: mediante el servidor compatible con la API de OpenAI de llama.cpp (`/v1/chat/completions`), puede conectarse a herramientas internas que ya hablen ese protocolo.
- Prototipado rápido de tareas de programación con razonamiento: el thinking mode permite abordar problemas que requieren pasos intermedios, con una mediana de unas 1,2k tokens por respuesta completada.
- Despliegue en estaciones de trabajo modestas: el archivo Q4_K_M de 2,7 GB permite ejecutar el modelo en equipos con recursos limitados, a cambio de una pérdida de aproximadamente el 1 % en perplejidad.
- Evaluación comparativa de ajustes finos: al ofrecer Q8_0 indistinguible del bf16 en perplejidad, sirve como referencia para medir el efecto de la cuantización en tareas de código.

## Benchmarks y rendimiento

Los resultados publicados corresponden al checkpoint MLX 8-bit, no a los archivos GGUF, que no se han ejecutado en estas pruebas. La métrica es la tasa de aprobado en tareas Rust reservadas con tests ocultos, con 4 muestras por tarea, thinking activado y sin system prompt.

| Tasa de aprobado | Easy (29 tareas) | Hard (40) | Quality (29) | Dev (82) |
|---|---|---|---|---|
| Qwen3.5-4B (8-bit) | 41,4 % | 7,5 % | 8,6 % | 20,7 % |
| Qwen3.5-4B-RustCoder | 51,7 % | 8,8 % | 17,2 % | 22,9 % |

Agregado sobre las 180 tareas, la mejora frente al base es de +4,3 puntos (intervalo de confianza del 95 %: +0,6 a +8,2). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa 4,5 GB y el Q4_K_M 2,7 GB; a ello hay que sumar la memoria para el contexto (se recomienda al menos 8192 tokens).
- GPU recomendadas: no disponible en la información proporcionada; las pruebas de los archivos GGUF se realizaron en CPU con llama.cpp.
- GPU de consumo: por tamaño, el Q4_K_M (2,7 GB) y el Q8_0 (4,5 GB) son compatibles con GPUs de consumo con suficiente VRAM, aunque el autor no publica pruebas en GPU.
- Opciones de despliegue: llama.cpp (build con soporte para Qwen3.5), Ollama y LM Studio si su llama.cpp incluido soporta la arquitectura `qwen35` (no probado por el autor).
- Latencia y throughput: no disponible. Como referencia de uso, las respuestas completadas consumen una mediana de aproximadamente 1,2k tokens de salida; se recomienda permitir unos 4096 tokens de salida y un contexto de al menos 8192.
- Configuración recomendada: sin system prompt, thinking activado, temperatura 0,6, top-p 0,95 y top-k 20.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-RustCoder-GGUF | 4,2 mil millones | no disponible (≥8192 recomendado) | Rust, con thinking | Apache 2.0 | GGUF |
| Qwen3.5-4B (base) | 4,2 mil millones | no disponible | Propósito general | Apache 2.0 | safetensors, MLX, GGUF (según el autor) |
| Qwen3.5-4B-RustCoder (bf16) | 4,2 mil millones | no disponible | Rust, con thinking | Apache 2.0 | safetensors |
| Qwen3.5-4B-RustCoder-MLX-8bit | 4,2 mil millones | no disponible | Rust, con thinking | Apache 2.0 | MLX |

Las tres variantes derivan del mismo ajuste fino; la diferencia principal es el formato y la cuantización. En las pruebas de aprobado, el ajuste RustCoder supera al base en todas las categorías (por ejemplo, 51,7 % frente a 41,4 % en Easy y 17,2 % frente a 8,6 % en Quality). No se dispone de comparaciones con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado; el autor advierte que las respuestas que agotan el límite de tokens suelen estar atrapadas en un bucle de razonamiento, por lo que recomienda remuestrear en lugar de ampliar el límite.
- Limitaciones de idioma: el modelo está etiquetado únicamente para inglés.
- Limitaciones de contexto: la longitud de contexto no se especifica; se recomienda al menos 8192 tokens, pero no hay garantía documentada sobre el máximo soportado.
- Restricciones de licencia: Apache 2.0, la misma del modelo base Qwen/Qwen3.5-4B; permite uso comercial con las obligaciones habituales de la licencia.
- Caveats para producción: los archivos GGUF no se han evaluado en las pruebas de aprobado (solo el checkpoint MLX 8-bit); las pruebas de los GGUF se hicieron en CPU; Ollama y LM Studio no fueron probados; se recomienda no usar system prompt porque el entrenamiento y la evaluación se hicieron sin él.
- El modelo es solo de texto; no incluye visión.

## Enlaces

- Repositorio GGUF: https://huggingface.co/alan13367/Qwen3.5-4B-RustCoder-GGUF
- Modelo base del ajuste fino (bf16): https://huggingface.co/alan13367/Qwen3.5-4B-RustCoder
- Versión MLX 8-bit: https://huggingface.co/alan13367/Qwen3.5-4B-RustCoder-MLX-8bit
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
