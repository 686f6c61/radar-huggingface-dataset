# richardyoung/Qwen3.5-4B-ARA-heretic

## Resumen

Qwen3.5-4B-ARA-heretic es una variante "descensurada" (decensored) del modelo multimodal Qwen3.5-4B desarrollado por Alibaba Qwen, publicada por el usuario richardyoung. La modificación se ha realizado con Heretic v2.0.0, una herramienta de ablación de direcciones (direction ablation) que elimina selectivamente la tendencia del modelo a rechazar peticiones, reduciendo la tasa de refusals de 99/100 en el modelo original a 6/100 en esta versión, con una divergencia KL de 0,0645 respecto al original.

El modelo base Qwen3.5-4B es un modelo causal con codificador de visión, de aproximadamente 4.539 millones de parámetros, que combina capas de atención lineal Gated DeltaNet con capas de atención con compuertas (gated attention) en una disposición híbrida de 32 capas. Soporta de forma nativa un contexto de 262.144 tokens, extensible hasta 1.010.000, y está entrenado con un objetivo de predicción multi-token (MTP). Su relevancia actual radica en que ofrece capacidades multimodales (image-text-to-text) en un tamaño compacto, con licencia Apache 2.0, y esta variante concreta elimina las restricciones de rechazo para casos de uso que requieren respuestas sin filtros editoriales.

La ficha se centra en esta variante ARA-heretic, pero dado que el autor no documenta cambios en arquitectura, tokenizador ni datos de entrenamiento más allá de la ablación, los datos técnicos del modelo base se presentan como referencia y se indican explícitamente los puntos en los que la información no está disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal LM con codificador de visión; híbrido Gated DeltaNet + Gated Attention (32 capas) |
| Parámetros totales | 4.539.265.536 (≈4,54 B) |
| Parámetros activos | No disponible (no se documenta como MoE en la información proporcionada) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantización | No disponible (el repo contiene safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | No disponible en la ficha; el modelo base declara cobertura de 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |
| Dimensión oculta | 2560 |
| Capas | 32 (8 × [3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)]) |
| Dimensión FFN intermedia | 9216 |
| Embedding de tokens | 248.320 (con padding; atado a la salida LM) |
| Cabezas de atención lineal (DeltaNet) | 32 para V, 16 para QK; dimensión de cabeza 128 |
| Cabezas de atención con compuertas | 16 para Q, 4 para KV; dimensión de cabeza 256; RoPE dim 64 |
| Tamaño del repo | 9,1 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que intercala bloques de Gated DeltaNet (atención lineal con estado recurrente) y bloques de Gated Attention (atención estándar con compuertas) en una proporción de 3 a 1, repetida 8 veces a lo largo de 32 capas. Esta disposición busca reducir el coste computacional de la atención a contextos largos manteniendo la calidad de recuperación de información. El modelo incorpora además un codificador de visión con fusión temprana de tokens multimodales, y se entrena con predicción multi-token (MTP) en varios pasos, lo que puede acelerar la decodificación especulativa. El entrenamiento del modelo base incluye preentrenamiento y postentrenamiento, con escalado de RL en entornos multiagente según la documentación de Qwen.

La variante ARA-heretic no reentrena el modelo: aplica una ablación de rango arbitrario (Arbitrary-Rank Ablation) sobre las capas 16 a 32, con pesos de preservación de comportamiento bueno (0,0225), dirección de mal comportamiento (0,0005), sobrecorrección relativa (0,7063) y 15 vecinos. El resultado es una reducción drástica de los rechazos (de 99/100 a 6/100) con una divergencia KL de 0,0645 frente al original, lo que indica que la distribución de salida se mantiene relativamente próxima al modelo base. El autor indica que el proceso es reproducible mediante los archivos del directorio `reproduce`.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 262.144 tokens nativos).
- Comprensión de imágenes y texto (pipeline image-text-to-text), incluyendo razonamiento visual.
- Razonamiento, matemáticas y conocimiento STEM, según los benchmarks del modelo base.
- Generación de código y tareas de agentes, según la documentación de Qwen3.5.
- Soporte de tool calling / function calling heredado del modelo base (no verificado de forma independiente en esta variante).
- Capacidades multilingües amplias según el modelo base (201 idiomas y dialectos declarados).
- Modo "thinking" y razonamiento multi-paso, según la familia Qwen3.5 (no confirmado explícitamente para esta variante).
- Respuestas sin rechazo editorial en la mayoría de peticiones (6/100 refusals medidas por el autor).

## Casos de uso

- Investigación sobre alineación y seguridad: permite estudiar el comportamiento de un modelo con la capa de rechazo ablacionada y comparar su distribución de salidas con el original mediante la divergencia KL reportada (0,0645).
- Generación creativa sin restricciones editoriales: escritura de ficción, guiones o contenido narrativo donde el modelo original rechazaría escenarios sensibles; útil para autores que necesitan explorar temas controvertidos con control humano posterior.
- Análisis de documentos largos con imágenes: gracias al contexto de 262.144 tokens y al codificador de visión, puede procesar informes escaneados, contratos con gráficos o papers con figuras en una sola pasada.
- Asistentes conversacionales especializados: conversaciones multi-turno con memoria extensa para soporte técnico o tutoría, donde el contexto largo evita perder información entre turnos.
- Prototipado de agentes multimodales: combinación de tool calling y entrada visual para tareas como extracción de datos de capturas de pantalla o verificación de interfaces.
- Evaluación comparativa de técnicas de ablación: el directorio `reproduce` y los parámetros ARA documentados permiten replicar el proceso y medir el impacto de cada hiperparámetro en la tasa de rechazo y la calidad.
- Generación de código en pipelines internos: el tamaño de 4,5 B permite desplegarlo en una GPU de gama alta de consumo con cuantización, integrándolo en flujos de CI/CD para revisión o generación de parches.

## Benchmarks y rendimiento

El autor reporta únicamente métricas de la ablación, no benchmarks estándar de la variante:

| Métrica | Este modelo | Qwen/Qwen3.5-4B |
|---|---|---|
| Refusals | 6/100 | 99/100 |
| Divergencia KL | 0,0645 | 0 (por definición) |

El modelo base Qwen3.5-4B publica resultados en benchmarks de lenguaje, pero la información proporcionada solo incluye parcialmente la tabla (MMLU-Pro: Qwen3.5-4B no visible en el fragmento; GPT-OSS-120B 80,8; GPT-OSS-20B 74,8; Qwen3-Next-80B-A3B-Thinking 82,7). No se han publicado resultados completos de benchmarks para esta variante ARA-heretic en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 12-16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: ~4,5-5 GB de pesos; en 4 bits: ~2,3-3 GB, aunque no se ofrecen pesos GGUF en el repo.
- GPU recomendadas: A100 40/80 GB o H100 para contexto máximo (262K tokens) y despliegue multiusuario; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 con FP16 y contexto recortado, o en GPUs de 16 GB con cuantización 8 bits.
- Opciones de despliegue: transformers (librería declarada), vLLM, SGLang y KTransformers según la documentación del modelo base; llama.cpp/Ollama no están confirmados por falta de pesos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; la arquitectura híbrida con Gated DeltaNet está diseñada para alto throughput y baja latencia según Qwen, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-4B-ARA-heretic | 4,54 B | 262.144 (ext. 1.010.000) | Apache 2.0 | Variante sin rechazos (6/100), multimodal |
| Qwen3.5-4B (original) | 4 B | 262.144 (ext. 1.010.000) | Apache 2.0 | Refusals 99/100; referencia de calidad |
| GPT-OSS-20B | No disponible en la información | No disponible | No disponible | MMLU-Pro 74,8 según tabla de Qwen |
| Qwen3-Next-80B-A3B-Thinking | 80 B (A3B) | No disponible | No disponible | MMLU-Pro 82,7 según tabla de Qwen |

No se dispone de datos de benchmarks de esta variante frente a alternativas de su mismo tamaño, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- La ablación de rechazos puede aumentar la probabilidad de generar contenido dañino, ilegal o sesgado; no se recomienda su uso en producción orientada al público sin filtros externos.
- La divergencia KL de 0,0645 indica que la distribución no es idéntica al original; pueden aparecer degradaciones en tareas que dependían del comportamiento alineado.
- No se documentan los idiomas efectivamente soportados en esta variante; la cobertura de 201 idiomas corresponde al modelo base y no se ha verificado tras la ablación.
- Riesgo de alucinación inherente a modelos de 4 B; el contexto largo no elimina este problema y puede amplificarlo si se introducen documentos irrelevantes.
- No se ofrecen pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio, lo que limita el despliegue en hardware modesto sin conversión manual.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo modificado; la responsabilidad legal del contenido generado recae en el desplegador.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria independiente de su calidad.
- La fecha de creación (2026-11-05) y la referencia a Qwen3.5 sugieren que parte de la información del modelo base puede ser posterior o no verificable con fuentes públicas actuales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen3.5-4B-ARA-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Heretic: https://heretic-project.org
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
