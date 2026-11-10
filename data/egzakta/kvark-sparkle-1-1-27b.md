# Egzakta/Kvark-Sparkle-1.1-27B

## Resumen

Kvark-Sparkle-1.1-27B es un ajuste fino (finetune) del modelo Egzakta/Kvark-Sparkle-1.0-27B, desarrollado por Egzakta. Está especializado en "trabajo documental": búsqueda dentro de una base documental, respuesta fundamentada en lo encontrado y rechazo explícito cuando la respuesta no figura en los documentos. Sobre benchmarks públicos el autor declara que no muestra diferencias significativas frente a Qwen3.8-27B, pero consume entre un 7 % y un 48 % menos de tokens de razonamiento en la mediana.

La arquitectura es la de Qwen3.8-27B sin modificar: un transformer híbrido de 64 capas, de las cuales 48 usan atención lineal y 16 atención completa, con 27.800 millones de parámetros en BF16 y una ventana de contexto nativa de 262.144 tokens. Incorpora una cabeza MTP (multi-token prediction) de una capa heredada de Sparkle 1.0, empleada para decodificación especulativa, y un codificador visual de 27 capas.

El modelo se publica bajo licencia Apache 2.0, con pesos en BF16 (55,6 GB), FP8 para vLLM (30,9 GB) y GGUF desde BF16 hasta IQ4_XS (15,3 a 54,7 GB). Su relevancia actual reside en el enfoque "efficient reasoning" aplicado a agentes RAG documentales: la regla de parada entrenada permite al modelo declinar responder cuando la información no está en los documentos, lo que reduce búsquedas redundantes y alucinaciones en pipelines de recuperación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.8-27B: 64 capas (48 de atención lineal, 16 de atención completa) |
| Parametros totales | 27.356.728.560 (27,8B en BF16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; evaluado hasta 64k |
| Tipos de cuantizacion | BF16, FP8, GGUF (BF16 a IQ4_XS) |
| Idiomas soportados | Inglés (en), serbio (sr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 y FP8), GGUF |

Otros datos técnicos: 24 cabezas de consulta y 4 de clave-valor en atención completa, dimensión de cabeza 256, tamaño oculto 5.120, vocabulario de 248.320 tokens. Caché KV de 64 KiB por token en BF16 y 32 KiB en FP8, almacenada solo en las 16 capas de atención completa. Cabeza MTP de 1 capa para decodificación especulativa. Codificador visual de 27 capas.

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura Qwen3.8-27B sin cambios: un transformer híbrido que combina 48 capas de atención lineal con 16 capas de atención completa, lo que reduce el coste de la caché KV en contextos largos (solo las capas de atención completa la almacenan). La cabeza MTP de una capa, heredada de Sparkle 1.0, habilita decodificación especulativa. El codificador visual de 27 capas procede del modelo base.

El entrenamiento se realizó como finetune sobre Sparkle 1.0, orientado a tareas de RAG agéntico y QA documental. El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. La innovación técnica destacable es la regla de parada entrenada (fichero `stop_system.txt`): el modelo aprende a detener la búsqueda tras tres búsquedas consecutivas sin resultados relevantes y a responder "Final answer: NOT IN DOCUMENTS". Según la model card, esta regla eleva la tasa de rechazo correcto de preguntas cuya respuesta no está en los documentos del 36 % al 91,5 % en el benchmark GroundedWork.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" (los benchmarks se declaran con thinking on en GPQA Diamond).
- Razonamiento eficiente: mediana de tokens de razonamiento entre un 7 % y un 48 % inferior a Qwen3.8-27B según el benchmark.
- Comprensión de imagen y texto (pipeline image-text-to-text, codificador visual de 27 capas).
- RAG agéntico: búsqueda iterativa en bases documentales y respuesta fundamentada.
- QA documental con rechazo explícito cuando la respuesta no figura en los documentos.
- Soporte de tool calling / function calling implícito en el flujo agéntico descrito (instrucciones de herramientas en el system prompt).
- Razonamiento multi-paso y agentes con regla de parada entrenada.
- Capacidades multilingües limitadas a inglés y serbio.
- Decodificación especulativa mediante cabeza MTP.

## Casos de uso

- QA sobre bases documentales internas: el modelo busca en el corpus, responde citando lo encontrado y declina cuando la respuesta no está, lo que lo hace adecuado para asistentes de documentación técnica o legal donde una respuesta inventada es costosa.
- Agentes RAG en producción: con la regla de parada en el system prompt, limita el número de búsquedas improductivas, reduciendo latencia y coste de llamadas al recuperador.
- Análisis de documentos con imágenes: al aceptar entrada image-text-to-text, puede procesar PDFs escaneados, capturas o diagramas junto al texto.
- Asistentes de atención al cliente con base de conocimiento: la ventana de 262.144 tokens permite incluir manuales extensos y el rechazo entrenado evita respuestas fuera de la base.
- Generación y revisión de código en pipelines: los resultados declarados en LiveCodeBench (pass@1 de 86 en los 150 problemas más recientes) lo sitúan como opción para tareas de código, con un consumo de tokens de razonamiento menor que Qwen3.8-27B.
- Procesamiento de documentación en serbio e inglés: útil para organizaciones que operan en ambos idiomas y necesitan un modelo que cubra el serbio, poco frecuente en modelos abiertos.
- Evaluación de instrucciones y formato estricto: con un 91,1 % de precisión estricta a nivel de prompt en IFEval, encaja en tareas donde el cumplimiento de formato es crítico.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Métrica | Kvark-Sparkle-1.1-27B | Qwen3.8-27B (referencia del autor) |
|---|---|---|---|
| GPQA Diamond | accuracy (4 seeds, thinking on, FP8) | 88,3 | 88,8 |
| LiveCodeBench | pass@1 (150 problemas más recientes) | 86,0 | 82,0 |
| IFEval | prompt-level strict accuracy | 91,1 | 90,8 |
| MMLU-Pro | accuracy (subconjunto de 980 ítems) | 84,0 | 83,6 |
| FRAMES | accuracy (juez LLM) | 69,8 | 70,6 |

Datos adicionales de la model card (GroundedWork, benchmark propio de RAG documental):

| Métrica | Sparkle 1.0 | Sparkle 1.0 + regla de parada | Sparkle 1.1 + regla de parada |
|---|---|---|---|
| QA documental | 86,2 | 89,5 | 91,0 |
| Rechazo correcto de preguntas no respondibles | 36 % | 74 % | 91,5 % |

Tokens de razonamiento en la mediana, Sparkle 1.1 frente a Qwen3.8-27B: GPQA Diamond 4.471 vs 7.670; AIME 2026 8.732 vs 14.822; HMMT 13.540 vs 21.182; LiveCodeBench 8.607 vs 15.276; IFEval 646 vs 695; MMLU-Pro 518 vs 708; FRAMES 644 vs 1.228.

## Requisitos de hardware

- VRAM para BF16: aproximadamente 55,6 GB de pesos más caché KV de 64 KiB por token; con 64k de contexto la caché añade unos 4 GB, por lo que se recomienda un mínimo de 80 GB.
- VRAM para FP8: aproximadamente 30,9 GB de pesos más caché KV de 32 KiB por token; viable en una GPU de 48 GB o en dos de 24 GB.
- GGUF: desde 15,3 GB (IQ4_XS) hasta 54,7 GB (BF16); las cuantizaciones bajas caben en GPUs consumer de 24 GB (RTX 3090, RTX 4090) y en configuraciones de 16 GB con contexto reducido.
- GPUs recomendadas: A100 80 GB o H100 para BF16 con contexto largo; L40S o A6000 de 48 GB para FP8; RTX 4090 para GGUF cuantizado.
- Despliegue: vLLM con los pesos FP8, llama.cpp con los GGUF, y transformers para BF16. La cabeza MTP permite decodificación especulativa en los formatos que la soporten.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Kvark-Sparkle-1.1-27B | 27,8B | 262.144 | Apache 2.0 | safetensors BF16/FP8, GGUF | Especializado en RAG documental con regla de parada; idiomas en y sr |
| Qwen3.8-27B (modelo base de referencia) | 27B (según el autor) | no disponible en la información | no disponible | no disponible | Referencia directa del autor; rendimiento comparable con más tokens de razonamiento |
| Kvark-Sparkle-1.0-27B | 27B | no disponible | Apache 2.0 (según el ecosistema del autor) | no disponible | Versión anterior; sin regla de parada rinde peor en QA documental (86,2 vs 91,0) |

No se dispone de datos suficientes para comparar con otras familias de modelos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no documentados en la información disponible; al entrenarse sobre un modelo base con datos web, es esperable heredar sesgos de dicho corpus.
- Alucinación: el modelo está entrenado para declinar cuando la respuesta no está en los documentos, pero la eficacia depende de incluir la regla de parada en el system prompt; sin ella, según el autor, rechaza muchas menos preguntas no respondibles.
- Contexto: aunque la ventana nativa es de 262.144 tokens, el autor solo declara evaluación hasta 64k; el rendimiento más allá de esa longitud no está verificado.
- Idiomas: cobertura limitada a inglés y serbio; el rendimiento en castellano no está documentado.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.8-27B del que deriva la arquitectura.
- Benchmarks: todos los resultados son declarados por el autor y no han sido verificados de forma independiente; algunas métricas usan subconjuntos (MMLU-Pro con 980 ítems, LiveCodeBench con 150 problemas) y configuraciones específicas (FP8, thinking on) que dificultan la comparación directa.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación de la comunidad.
- Producción: requiere probar el comportamiento del rechazo en el dominio concreto antes de desplegar, ya que la regla de parada se calibró sobre el benchmark propio GroundedWork.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Egzakta/Kvark-Sparkle-1.1-27B
- Versión FP8 para vLLM: https://huggingface.co/Egzakta/Kvark-Sparkle-1.1-27B-FP8
- Versión GGUF para llama.cpp: https://huggingface.co/Egzakta/Kvark-Sparkle-1.1-27B-GGUF
- Modelo base Sparkle 1.0: https://huggingface.co/Egzakta/Kvark-Sparkle-1.0-27B
