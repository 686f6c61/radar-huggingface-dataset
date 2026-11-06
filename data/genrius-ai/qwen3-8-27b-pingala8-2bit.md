# Genrius-AI/Qwen3.8-27B-Pingala8-2bit

## Resumen

Qwen3.8-27B-Pingala8-2bit es una cuantización de 2 bits del modelo Qwen3.8-27B, desarrollada por Genrius AI (Harshit Goyal). El modelo base es un transformer híbrido de Qwen que combina 48 capas de Gated DeltaNet con 16 capas de atención completa con puertas (gated full-attention). Esta cuantización comprime el modelo a 8,31 GB en formato GGUF mediante codificación de trellis con partición de conjuntos de 8 estados sobre símbolos de 4 pesos, tras una rotación de Hadamard aleatoria y redondeo LDLQ.

La relevancia de esta ficha radica en que demuestra que es posible llevar un modelo de 27B a un tamaño de archivo comparable al de un IQ2_XXS de llama.cpp (8,43 GB) con una perplejidad inferior en WikiText-2: 6,89 frente a 7,88. El autor reporta además una velocidad de generación de 37,7 tokens/s frente a 36,4 del baseline. No obstante, el propio autor señala que el mejor archivo de 2 bits medido, DASH-Q IQ2_XS, sigue siendo superior en perplejidad (6,54) con un tamaño de 8,55 GB.

Es importante destacar que este archivo no es compatible con llama.cpp, Ollama ni LM Studio estándar: requiere el runtime CUDA de Pingala-8 con el parche de cargador de Qwen3.5. Además, el modelo es solo de texto: no incluye la torre de visión ni el bloque de predicción multi-token (MTP) del Qwen3.8-27B original. La licencia es Apache-2.0 y los idiomas soportados son inglés y chino. El número de parámetros reportado en safetensors (9.555.978.226) no coincide con el nombre del modelo (27B), lo que sugiere que el campo de parámetros totales del repo puede referirse a otra cosa o estar mal etiquetado; se indica como dato no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 capas Gated DeltaNet + 16 capas gated full-attention (Qwen3.8) |
| Parametros totales | 27B (según nombre del modelo); el campo safetensors del repo indica 9.555.978.226, dato no verificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | 2-bit (Pingala-8, 2,473 bits/peso); archivo GGUF en 9 partes |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (9 archivos shard, ~8,31 GB total) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer híbrido que alterna 48 capas de Gated DeltaNet (un mecanismo de atención lineal con estado recurrente) con 16 capas de atención completa con puertas. Esta combinación busca reducir el coste computacional de la atención en contextos largos manteniendo la capacidad de modelado de la atención completa en capas seleccionadas. La cuantización Pingala-8 aplica codificación de trellis con partición de conjuntos de 8 estados (código de Ungerboeck) sobre símbolos de 4 pesos, precedida de una rotación de Hadamard aleatoria y redondeo LDLQ, con una clase de tasa por tensor.

El proceso de cuantización utiliza Hessianos de capa calculados a partir de 512 secuencias de 2048 tokens de texto de calibración, propagados a través del modelo en bf16 capa a capa. La matriz de importancia es la imatrix publicada por bartowski para Qwen3.8-27B, usada tanto para este archivo como para el baseline IQ2_XXS. Los tensores no codificados (embedding de tokens, salida, normas, conv1d y parámetros de puerta de DeltaNet) se copian del archivo IQ2_XXS estándar. El autor indica que se trata de una única build con receta, baseline y protocolo de release predefinidos antes de medir ningún resultado de 27B a 2 bits; el script de codificación se modificó tras codificar el primer tensor, hecho que se reporta explícitamente.

## Capacidades

- Generación de texto conversacional y continuación de texto en inglés y chino.
- Razonamiento y matemáticas: heredadas del modelo base Qwen3.8-27B, aunque degradadas por la cuantización agresiva a 2 bits.
- Generación de código: capacidad del modelo base, sujeta a la pérdida de precisión de la cuantización.
- Sin soporte de tool calling ni function calling documentado en la información proporcionada.
- Sin soporte de agentes o razonamiento multi-paso documentado específicamente.
- Capacidades multilingües limitadas a inglés y chino.
- Sin visión: la torre de visión del modelo base no está incluida.
- Sin bloque MTP (multi-token prediction): no incluido.
- No se documenta modo thinking ni capacidades de audio.

## Casos de uso

- Despliegue en hardware de gama baja con VRAM limitada: el archivo de 8,31 GB permite cargar un modelo de clase 27B en GPUs consumer con 12-16 GB de VRAM, algo inviable con cuantizaciones de 4 u 8 bits. Requiere el runtime Pingala-8, no llama.cpp estándar.
- Experimentación en investigación sobre compresión de modelos: sirve como caso de estudio de cuantización a 2 bits con trellis coding, comparable directamente con IQ2_XXS y DASH-Q IQ2_XS en igualdad de bytes.
- Generación de texto en inglés y chino en entornos con restricciones de memoria: chat y continuación de texto donde la perplejidad de 6,89 en WikiText-2 sea aceptable.
- Evaluación comparativa de métodos de cuantización: el líder de 2-bit GGUF publicado por el autor permite reproducir y comparar ventana a ventana el rendimiento de distintos archivos del mismo modelo.
- Prototipado de asistentes conversacionales en local: para desarrolladores que necesiten probar un modelo grande en una sola GPU sin infraestructura de servidor.
- Docencia y demostraciones de cuantización extrema: el demo en Hugging Face Spaces (con un modelo menor, Qwen3-1.7B-Pingala8-2bit, en CPU) permite ilustrar el efecto de la compresión a 2 bits.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente):

| Metrica | Pingala-8 2-bit | IQ2_XXS (llama.cpp) | DASH-Q IQ2_XS |
|---|---|---|---|
| Tamano del archivo | 8,31 GB | 8,43 GB | 8,55 GB |
| Bits por peso | 2,473 | 2,508 | No disponible |
| Perplejidad WikiText-2 (contexto 4096, 20 de 72 ventanas) | 6,89 | 7,88 | 6,54 |
| Tokens/s (generación) | 37,7 | 36,4 | No disponible |

El autor indica que la perplejidad se midió sobre las primeras 20 de 72 ventanas de 4096 tokens del test de WikiText-2. La versión 2 del archivo mejora la perplejidad de 7,34 a 6,89 y la generación de 30,8 a 37,7 tokens/s respecto a la versión 1, con el mismo tamaño de archivo. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~8,31 GB de pesos más overhead de contexto y runtime; se recomienda al menos 10-12 GB de VRAM para contexto moderado.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 12 GB de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A100, H100). El runtime es CUDA-específico.
- Cabe en GPU consumer: sí, en modelos con 12 GB o más de VRAM, siempre que se use el runtime Pingala-8.
- Opciones de despliegue: exclusivamente el runtime Pingala-8 con el parche de cargador de Qwen3.5 (llama.cpp commit `7ac59a6` + `patches/llama_cuda_vs_7ac59a6.patch` + `patches/q35_loader_count_delta.patch`). llama.cpp estándar, Ollama y LM Studio rechazan el archivo con error de carga.
- Latencia y throughput: 37,7 tokens/s de generación reportados por el autor; no se especifica el hardware de medición.
- El archivo de 27B no ha sido probado con la build one-click del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Pingala8-2bit | 27B (nominal) | No disponible | 6,89 | Apache-2.0 | GGUF, requiere runtime Pingala-8 |
| Qwen3.8-27B IQ2_XXS (llama.cpp) | 27B | No disponible | 7,88 | Apache-2.0 | GGUF, llama.cpp estándar |
| Qwen3.8-27B DASH-Q IQ2_XS | 27B | No disponible | 6,54 | No disponible | GGUF, 8,55 GB |
| Qwen3.5-4B Pingala-8-2bit | 4B | No disponible | No disponible | Apache-2.0 | GGUF, runtime Pingala-8 |

## Limitaciones y advertencias

- Incompatibilidad con herramientas estándar: llama.cpp, Ollama y LM Studio rechazan el archivo; se requiere un runtime CUDA parcheado y específico, lo que limita su adopción en producción.
- Solo texto: no incluye torre de visión ni bloque MTP del modelo base, por lo que no puede usarse para tareas multimodales ni de predicción multi-token.
- Degradación por cuantización a 2 bits: aunque la perplejidad es competitiva, la pérdida de precisión en razonamiento, código y matemáticas puede ser significativa frente al modelo en bf16; no se han publicado benchmarks de tareas específicas.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Sin verificación independiente: los resultados de perplejidad y throughput son declarados por el autor y marcados como no verificados.
- Cambio de script tras el primer tensor: el autor reporta que el encoder se modificó después de codificar el primer tensor, lo que afecta a la pre-registración del estudio.
- Riesgo de alucinación inherente al modelo base, potencialmente amplificado por la cuantización agresiva.
- Sesgos del modelo base Qwen3.8-27B no documentados en la información proporcionada.
- El campo de parámetros totales del repo (9.555.978.226) no coincide con el nombre del modelo (27B); conviene verificar el tamaño real antes de planificar el despliegue.
- Licencia Apache-2.0 permite uso comercial, pero la dependencia de un runtime parcheado puede complicar el cumplimiento y el mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/Genrius-AI/Qwen3.8-27B-Pingala8-2bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de código y runtime: https://github.com/Genrius-AI/pingala8-llm
- Paper (preprint v2.4): https://doi.org/10.5281/zenodo.23481757
- Demo en navegador (modelo menor en CPU): https://huggingface.co/spaces/harshit-genrius/pingala8-demo
- Leaderboard de GGUF de 2 bits: https://huggingface.co/spaces/Genrius-AI/2bit-gguf-leaderboard
- Modelo hermano Qwen3.5-4B Pingala-8: https://huggingface.co/Genrius-AI/Qwen3.5-4B-Pingala8-2bit
- Modelo hermano Qwen3.5-2B Pingala-8: https://huggingface.co/Genrius-AI/Qwen3.5-2B-Pingala8-2bit
