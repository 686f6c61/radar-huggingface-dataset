# qda-lab/QDA-Qwen3.5-9B-W4A4

## Resumen

QDA-Qwen3.5-9B-W4A4 es una cuantización NVFP4 (4 bits en pesos y 4 bits en activaciones) del modelo multimodal Qwen/Qwen3.5-9B, publicada por qda-lab. Su objetivo es reducir el peso del checkpoint de 19,3 GB en BF16 a 9,4 GB, es decir, un factor de 2,1×, manteniendo según el autor el 95,2 % de la precisión del modelo original. Está pensada específicamente para GPUs de centro de datos con arquitectura NVIDIA Blackwell (B200, B300, GB200, GB300), que son las que soportan de forma nativa el formato FP4.

El modelo hereda del base Qwen3.5-9B la pila multimodal image-text-to-text, con una torre de visión que se mantiene en BF16, y un total de 9.653.104.368 parámetros. La cuantización se aplica a todas las capas lineales del decodificador, incluyendo las proyecciones del bloque Gated DeltaNet, mientras que `lm_head`, embeddings y la torre de visión permanecen en BF16. La licencia es Apache 2.0, lo que facilita su uso comercial.

La relevancia actual del checkpoint es doble: por un lado, demuestra que una cuantización W4A4 agresiva puede ser competitiva frente a alternativas NVFP4 del mismo tamaño (el autor compara con el checkpoint de RedHatAI, obteniendo mejores resultados en las seis pruebas publicadas); por otro lado, documenta de forma inusualmente detallada el proceso de calibración, la receta de construcción y las limitaciones de reproducibilidad, incluyendo una discrepancia conocida entre la build publicada y la build del propio pipeline de búsqueda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con bloque Gated DeltaNet y torre de visión (derivada de Qwen3.5-9B) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens en la evaluación publicada; el harness `qda eval` sirve con 114.688 tokens |
| Tipos de cuantizacion | NVFP4 (W4A4): pesos E2M1 con escala E4M3 por cada 16 entradas y escala tensorial FP32; activaciones cuantizadas en tiempo de ejecución con el mismo esquema |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compressed-tensors), 9,4 GB en total |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint Qwen/Qwen3.5-9B, no un modelo entrenado desde cero. La arquitectura base combina capas de atención con un bloque Gated DeltaNet, y conserva la torre de visión del modelo original en BF16 para mantener las capacidades image-text-to-text. Todas las capas lineales del decodificador están cuantizadas a NVFP4: pesos en formato E2M1 con una escala E4M3 compartida por cada 16 entradas y una escala tensorial FP32, y activaciones cuantizadas en tiempo de ejecución con el mismo esquema. Quedan en BF16 las proyecciones `in_proj_a` e `in_proj_b` del Gated DeltaNet, el `lm_head`, los embeddings y la torre de visión.

El proceso de cuantización utilizó GPTQ con act-order estático y un clip MSE adaptado a FP4, y la búsqueda de hiperparámetros mantuvo el tamaño de la build NVFP4 simple, eligiendo únicamente el método. La calibración se hizo con la mezcla W4A8 de Qwen3.5-9B: 494 filas de token ids de 4.096 tokens cada una, tras eliminar 18 filas que activaban el guard de 20 palabras de MMLU-Pro. El autor verificó la mezcla contra el conjunto de test de MMLU-Pro (12.032 preguntas) y detectó que una fila contiene el texto completo de una pregunta corta de MMLU-Pro (de la parte TheoremQA, con menos de 20 palabras) seguida de una solución escrita por un modelo; MMLU-Pro es una de las seis pruebas reportadas, lo que constituye una posible fuga de contaminación que el autor documenta explícitamente. No se reporta información sobre datos de entrenamiento del modelo base ni sobre si este recibió RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en modo thinking, con marcador de fin de pensamiento `</think>`.
- Razonamiento matemático de competición (AIME 2025, HMMT Feb 2026) y científico (GPQA-Diamond).
- Generación de código y resolución de problemas de programación (LiveCodeBench).
- Seguimiento de instrucciones complejas (IFBench) y conocimiento general (MMLU-Pro).
- Procesamiento de imagen y texto (pipeline image-text-to-text), gracias a la torre de visión conservada en BF16.
- Conversación multi-turno con contexto muy largo (hasta 262.144 tokens en la evaluación publicada).
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`) y con vLLM.
- No se documenta soporte explícito de tool calling ni de flujos de agentes multi-paso en la información disponible.

## Casos de uso

- Razonamiento matemático asistido: el modelo mantiene en W4A4 un 80,5 % en AIME 2025 frente al 85,3 % en BF16, por lo que es adecuado para asistentes de resolución de problemas de competición donde el ahorro de VRAM permite servir más réplicas en un mismo nodo Blackwell.
- Generación de código en producción: con 64,7 % en LiveCodeBench y soporte de vLLM, puede integrarse en pipelines de revisión o generación de parches, aunque la caída frente a BF16 (71,1 %) aconseja reservarlo para tareas donde el coste por token prime sobre la precisión máxima.
- Análisis de documentos con imagen y texto: al conservar la torre de visión en BF16 y el pipeline image-text-to-text, sirve para extracción de información de capturas, gráficos o formularios combinados con preguntas en lenguaje natural.
- Evaluación científica asistida: con 78,9 % en GPQA-Diamond, es utilizable como apoyo en revisión de hipótesis o explicación de conceptos de nivel posgrado, siempre con verificación humana.
- Despliegue de bajo coste en clústeres Blackwell: al ocupar 9,4 GB en lugar de 19,3 GB, permite duplicar la densidad de modelos por GPU GB300 o B200 en comparación con la versión BF16, manteniendo contexto de hasta 262.144 tokens.
- Seguimiento estricto de instrucciones en sistemas de extracción estructurada: su 65,7 % en IFBench (frente a 66,9 % en BF16) lo hace viable para tareas de formateo y cumplimiento de restricciones en producción.
- Prototipado de asistentes conversacionales de contexto largo: la ventana de 262.144 tokens permite resumir o consultar corpus extensos sin recuperación externa, a costa de una mayor tasa de truncamiento (10,9 % de media frente a 7,1 % en BF16).

## Benchmarks y rendimiento

Resultados publicados por el autor, pass@1 en modo thinking, media sobre los draws indicados, en porcentaje con ± 1 error estándar. Todos los checkpoints se sirvieron con vLLM 0.33.0 en una GB300.

| Benchmark | Problemas × draws | BF16 (19,3 GB) | QDA W4A4 (9,4 GB) | RedHatAI NVFP4 (9,4 GB) |
|---|---:|---:|---:|---:|
| AIME 2025 | 30 × 32 | 85,3 ± 5,6 | 80,5 ± 5,8 | 76,9 ± 6,3 |
| HMMT Feb 2026 | 33 × 32 | 68,9 ± 6,6 | 64,0 ± 7,2 | 59,8 ± 7,4 |
| GPQA-Diamond | 198 × 16 | 82,2 ± 2,2 | 78,9 ± 2,3 | 77,4 ± 2,4 |
| IFBench | 300 × 16 | 66,9 ± 2,1 | 65,7 ± 2,1 | 62,5 ± 2,1 |
| MMLU-Pro | 12.032 × 1 | 81,0 ± 0,4 | 79,8 ± 0,4 | 79,5 ± 0,4 |
| LiveCodeBench | 454 × 4 | 71,1 ± 1,8 | 64,7 ± 2,0 | 61,2 ± 2,0 |
| Media | | 75,9 ± 1,6 | 72,3 ± 1,7 | 69,5 ± 1,7 |

Tasa de truncamiento (generaciones detenidas por límite de tokens) reportada por el autor:

| Benchmark | BF16 | QDA W4A4 | RedHatAI |
|---|---:|---:|---:|
| AIME 2025 | 6,8 % | 14,0 % | 16,7 % |
| HMMT Feb 2026 | 13,4 % | 17,1 % | 22,5 % |
| GPQA-Diamond | 1,1 % | 2,8 % | 4,8 % |
| IFBench | 8,4 % | 10,3 % | 11,7 % |
| MMLU-Pro | 0 % | <0,1 % | 0,1 % |
| LiveCodeBench | 12,9 % | 21,0 % | 27,8 % |
| Media | 7,1 % | 10,9 % | 13,9 % |

Ajustes de evaluación: temperatura 1,0, top-p 0,95, top-k 20, presence-penalty 1,5; límite de salida de 81.920 tokens salvo MMLU-Pro (32.768); ventana del motor de 262.144 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,4 GB de pesos en NVFP4, más overhead de activaciones, caché KV y contexto. Con contexto largo (262.144 tokens) el consumo adicional de KV puede superar ampliamente el de los pesos.
- GPU soportadas: exclusivamente NVIDIA Blackwell de centro de datos (B200, B300, GB200, GB300). El formato NVFP4 requiere soporte hardware de FP4.
- No cabe en GPUs de consumo (RTX 4090, RTX 5090 u otras) porque no implementan NVFP4 de forma nativa para este esquema; no se documenta fallback a otros formatos.
- Despliegue: vLLM 0.33.0 (versión usada en la evaluación) mediante `vllm serve qda-lab/QDA-Qwen3.5-9B-W4A4`. Compatible con `transformers` y con `compressed-tensors`; no se documenta soporte de llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. El checkpoint incluye un `generation_config.json` con los parámetros de muestreo de la evaluación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media 6 benchmarks | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| QDA-Qwen3.5-9B-W4A4 | 9,65 B | 262.144 | 72,3 ± 1,7 | Apache 2.0 | Hugging Face (qda-lab) |
| Qwen3.5-9B BF16 (base) | 9,65 B | 262.144 | 75,9 ± 1,6 | Apache 2.0 | Hugging Face (Qwen) |
| RedHatAI NVFP4 de Qwen3.5-9B | 9,65 B | 262.144 | 69,5 ± 1,7 | No disponible en la información | Hugging Face (RedHatAI) |

El checkpoint de QDA supera al de RedHatAI en las seis pruebas a igual tamaño (9,4 GB), con una media de 72,3 frente a 69,5. Frente al BF16 conserva el 95,2 % de la precisión media, con la mayor pérdida relativa en LiveCodeBench (64,7 frente a 71,1).

## Limitaciones y advertencias

- Requiere hardware NVIDIA Blackwell; no es desplegable en GPUs Ampere, Hopper ni de consumo.
- Pérdida de precisión no uniforme: la caída es moderada en MMLU-Pro (1,2 puntos) pero severa en LiveCodeBench (6,4 puntos) y AIME 2025 (4,8 puntos).
- Mayor tasa de truncamiento que BF16 (10,9 % frente a 7,1 % de media), lo que puede degradar resultados en generaciones largas si no se amplía el límite de salida.
- Posible contaminación de calibración: una fila del conjunto de calibración contiene el texto completo de una pregunta corta de MMLU-Pro seguida de una solución generada por un modelo, y MMLU-Pro forma parte de la evaluación publicada. El autor lo documenta, pero conviene tenerlo en cuenta al interpretar esa cifra.
- Discrepancia de reproducibilidad reconocida: la build del pipeline de búsqueda del autor difiere de este checkpoint en un shard de pesos por una causa no identificada; las medias respectivas son 72,1 y 72,3.
- No se documentan sesgos específicos, idiomas soportados ni evaluaciones de seguridad del modelo base en la información disponible.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones de fidelidad factual para esta cuantización.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.5-9B antes de un uso comercial en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.5-9B-W4A4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entradas de la receta: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs
- Checkpoint NVFP4 de referencia (RedHatAI): no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
