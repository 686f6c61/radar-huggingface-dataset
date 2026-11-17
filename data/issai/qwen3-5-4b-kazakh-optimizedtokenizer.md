# issai/Qwen3.5-4B-Kazakh-OptimizedTokenizer

## Resumen

Qwen3.5-4B-Kazakh-OptimizedTokenizer es un modelo base (pretrained, no ajustado para chat) desarrollado por ISSAI que adapta Qwen/Qwen3.5-4B-Base al kazajo mediante una extensión del tokenizador con 16.000 tokens nuevos y un entrenamiento continuado sobre 8.400 millones de tokens en kazajo, ruso e inglés (40/20/40). El objetivo es doble: reducir el coste computacional de procesar kazajo (el texto kazajo requiere 1,98 veces menos tokens que con Qwen3.5 original) y mejorar las puntuaciones del modelo en kazajo y ruso sin degradar el inglés.

La arquitectura subyacente es Qwen3.5, un transformer híbrido de 32 capas que combina 24 capas de atención lineal Gated DeltaNet con 8 capas de atención completa, tamaño oculto de 2.560 y 4.250 millones de parámetros. El contexto utilizado durante el entrenamiento es de 32.768 tokens y los pesos se distribuyen en bfloat16.

Es relevante ahora porque demuestra una receta reproducible (tokenizador BPE continuado, inicialización de embeddings por Fast Vocabulary Transfer y entrenamiento en dos fases) para adaptar modelos multilingües de tamaño medio a idiomas de bajos recursos como el kazajo, manteniendo intacto el rendimiento en inglés y mejorando ligeramente el ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 híbrida: 32 capas (24 Gated DeltaNet de atención lineal + 8 de atención completa), hidden size 2.560, solo texto |
| Parametros totales | 4.246.383.616 (4,25 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | kazajo (kk), ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers; requiere transformers 5.x, probado con 5.12.1) |
| Vocabulario | 264.077 tokens (matriz de embeddings rellenada a 264.192 filas) |
| Embeddings entrada/salida | atados (tied) |
| Precisión | bfloat16 |
| Tamaño del repo | 9,9 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer híbrido que intercala 24 capas de atención lineal Gated DeltaNet con 8 capas de atención completa, con tamaño oculto de 2.560 y embeddings de entrada y salida atados. La adaptación se realizó en tres pasos: primero, un BPE continuado que aprendió 16.000 nuevas fusiones sobre texto kazajo y ruso a partir de la lista de merges original de Qwen3.5, preservando todos los ids originales (los nuevos ocupan los ids 248.077–264.076), de modo que el inglés y el código se tokenizan exactamente igual que antes. Segundo, cada embedding nuevo se inicializó como la media de los embeddings de los tokens de Qwen que reemplaza (Fast Vocabulary Transfer). Tercero, un entrenamiento continuado en dos fases: la fase 1 entrenó únicamente las 16.000 filas nuevas con el resto de pesos congelados (571 pasos, ~16.000 secuencias de 32.768 tokens, learning rate 1e-4); la fase 2 entrenó todos los pesos durante una época sobre la mezcla de 8.400 millones de tokens (2.134 pasos de 120 secuencias × 32.768 tokens, learning rate 1e-5 con decaimiento coseno hasta 1e-6, 2% de warm-up, AdamW con β = 0,9/0,95, weight decay 0,1), usando 15 GPU H100, DeepSpeed ZeRO-2 y ms-swift.

Los datos de entrenamiento se componen, por tokens, de un 40% de kazajo (FineWeb-2, FinePDFs, FineWiki y un corpus multidisciplinar kazajo de libros, noticias y web), un 20% de ruso (FineWeb-2, FinePDFs, FineWiki) y un 40% de inglés como replay para conservar las capacidades originales (FineWeb-Edu, Nemotron-CC-Math, Stack-Edu y otros). No se publica el dataset ni se detalla si hubo RLHF o DPO; al tratarse de un modelo base, no se aplicó alineación para instrucciones. La innovación principal es la extensión del tokenizador con BPE continuado combinada con FVT, que reduce el coste de tokenización del kazajo a casi la mitad sin alterar la tokenización del inglés.

## Capacidades

- Generación de texto y continuación de texto en kazajo, ruso e inglés.
- Tokenización eficiente del kazajo: 1,76 tokens por palabra frente a 3,48 de Qwen3.5 (1,98 veces menos); en ruso, 1,72 frente a 1,89 (1,10 veces menos); el inglés se tokeniza de forma idéntica.
- Comprensión lectora y conocimiento enciclopédico evaluados en kazajo, ruso e inglés (MMLU, MMLU-Pro, MMLU-Redux, GPQA, ARC, Belebele).
- Razonamiento matemático básico en inglés (GSM8K).
- Capacidad de servir como punto de partida para ajuste fino supervisado y para construir modelos de chat.
- No soporta tool calling ni function calling de forma nativa (es un modelo base sin alineación para instrucciones).
- No soporta agentes ni razonamiento multi-paso guiado por instrucciones.
- No dispone de visión, audio ni modo thinking.
- Multilingüe limitado a los tres idiomas entrenados (kk, ru, en).

## Casos de uso

- Punto de partida para ajuste fino de chat en kazajo: al ser un modelo base con tokenizador optimizado, sirve para SFT y DPO posteriores, reduciendo el coste de entrenamiento al necesitar aproximadamente la mitad de tokens para el mismo texto kazajo.
- Procesamiento de documentos kazajos a gran escala: la reducción de 1,98 veces en tokens permite indexar, resumir o clasificar corpus kazajos con menor coste de contexto y mayor throughput que el modelo original.
- Búsqueda y recuperación aumentada (RAG) en kazajo y ruso: la ventana de 32.768 tokens y la tokenización compacta permiten incluir más pasajes fuente en cada consulta.
- Traducción y paráfrasis asistida kk/ru/en: el modelo conserva el inglés intacto y mejora el ruso, por lo que puede usarse como base para sistemas de traducción tras un ajuste específico.
- Generación de contenido editorial en kazajo (noticias, resúmenes, descripciones): adecuado para tareas de continuación de texto donde no se requiere seguir instrucciones complejas.
- Investigación lingüística y evaluación de tokenizadores: sirve como referencia reproducible para estudiar el impacto de la extensión de vocabulario en idiomas de bajos recursos.
- Base para modelos especializados en dominio (legal, sanitario, administrativo) en kazajo: la fase de preentrenamiento continuado facilita el dominio del idioma antes del ajuste de dominio.

## Benchmarks y rendimiento

Evaluación con lm-evaluation-harness, 5-shot, conjuntos de test completos, bfloat16 y los mismos ajustes para los tres modelos. Las tareas de kazajo y ruso son versiones de ISSAI de los benchmarks. Precisión en % (GSM8K: exact match); ± es el error estándar.

| Tarea | Qwen3.5-4B-Base | issai/Qwen3.5-4B-Base-Kazakh | Este modelo |
|---|---|---|---|
| MMLU (kk) | 57,49 ± 0,4 | 61,88 ± 0,4 | 61,92 ± 0,4 |
| MMLU-Pro (kk) | 35,27 ± 0,4 | 37,11 ± 0,4 | 37,43 ± 0,4 |
| MMLU-Redux (kk) | 59,07 ± 0,7 | 63,21 ± 0,6 | 64,14 ± 0,6 |
| GPQA (kk) | 31,38 ± 1,3 | 34,98 ± 1,4 | 35,99 ± 1,4 |
| ARC (kk) | 85,01 ± 0,6 | 89,80 ± 0,5 | 89,77 ± 0,5 |
| Belebele (kk) | 76,00 ± 1,4 | 78,00 ± 1,4 | 79,56 ± 1,3 |
| Media kazajo | 57,37 | 60,83 | 61,47 |
| MMLU-Pro (ru) | 43,23 ± 0,5 | 41,65 ± 0,4 | 43,24 ± 0,5 |
| GPQA (ru) | 35,15 ± 1,4 | 35,15 ± 1,4 | 37,16 ± 1,4 |
| ARC (ru) | 94,53 ± 0,4 | 93,04 ± 0,4 | 93,91 ± 0,4 |
| Belebele (ru) | 88,56 ± 1,1 | 87,89 ± 1,1 | 87,89 ± 1,1 |
| Media ruso | 65,37 | 64,43 | 65,55 |
| MMLU (en) | 73,07 ± 0,4 | 74,28 ± 0,4 | 73,81 ± 0,4 |
| ARC-Challenge (en) | 61,69 ± 1,4 | 60,92 ± 1,4 | 62,46 ± 1,4 |
| GSM8K (en) | 80,74 ± 1,1 | 80,44 ± 1,1 | 79,68 ± 1,1 |
| Belebele (en) | 93,11 ± 0,8 | 91,56 ± 0,9 | 92,11 ± 0,9 |
| Media inglés | 77,15 | 76,80 | 77,01 |

Resumen: en kazajo, +4,1 puntos de media sobre Qwen3.5-4B-Base y el mejor de los tres modelos; en ruso, la mejor media de los tres; en inglés, sin cambios dentro del error estándar.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 8,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB con contexto moderado.
- VRAM en cuantización de 8 bits: alrededor de 4,5-5 GB para pesos; en 4 bits, alrededor de 2,5-3 GB (estimaciones a partir del tamaño de parámetros; no se publican cuantizaciones oficiales).
- GPU recomendadas para bfloat16: NVIDIA A100, H100, L40S o RTX 4090 (24 GB); el entrenamiento original se hizo con 15 × H100.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 4080, RTX 3090 y, con cuantización, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 de 12 GB.
- Opciones de despliegue: transformers 5.x (probado con 5.12.1); el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Kazakh-OptimizedTokenizer (este) | 4,25 B | 32.768 | kk, ru, en | Apache 2.0 | Media kazajo 61,47; ruso 65,55; inglés 77,01 |
| Qwen3.5-4B-Base | 4,25 B | 32.768 | multilingüe (sin detalle) | Apache 2.0 (según modelo base) | Media kazajo 57,37; ruso 65,37; inglés 77,15; tokenización kazaja 1,98 veces más costosa |
| issai/Qwen3.5-4B-Base-Kazakh | 4,25 B | 32.768 | kk, ru, en | Apache 2.0 | Versión anterior de ISSAI; media kazajo 60,83; ruso 64,43; inglés 76,80 |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones de chat ni está alineado; usarlo directamente en conversación produce continuaciones de texto, no respuestas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad.
- Sesgos potenciales derivados de los corpus de preentrenamiento (FineWeb-2, FinePDFs, FineWiki y corpus kazajo), no documentados por el autor.
- Cobertura limitada a tres idiomas (kazajo, ruso, inglés); el rendimiento en otros idiomas no está garantizado.
- La ventana de contexto usada en entrenamiento es de 32.768 tokens; no se documenta soporte para contextos mayores.
- El dataset de entrenamiento no se publica y cada fuente tiene su propia licencia, lo que limita la reproducibilidad completa.
- Requiere transformers 5.x (probado con 5.12.1); versiones anteriores pueden no cargar la arquitectura qwen3_5_text.
- No se han publicado cuantizaciones oficiales (GGUF, AWQ, GPTQ) ni resultados de despliegue en vLLM, llama.cpp, Ollama o TGI.
- Uso comercial permitido por la licencia Apache 2.0, pero conviene revisar las licencias de los datos subyacentes antes de un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/issai/Qwen3.5-4B-Kazakh-OptimizedTokenizer
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Versión anterior de ISSAI: https://huggingface.co/issai/Qwen3.5-4B-Base-Kazakh
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- ms-swift (framework de entrenamiento): https://github.com/modelscope/ms-swift
