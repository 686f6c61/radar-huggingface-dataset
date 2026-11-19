# InterpreticAI/Qwen3.8-27B-Uncensored-v2-IQ3_XXS-GGUF

## Resumen

Qwen3.8-27B-Uncensored-v2-IQ3_XXS-GGUF es una cuantización de 3 bits en formato GGUF del modelo Qwen3.8-27B-Uncensored-v2, un fine-tune de Qwen3.8-27B del que se ha eliminado en gran medida la censura política. Lo desarrolla InterpreticAI (Thomas Young) y está pensado para ejecutarse en GPUs con entre 12 y 16 GB de memoria, un rango en el que el modelo en BF16 (unos 54 GB) no cabría de ninguna forma.

El modelo base conserva la arquitectura de Qwen3.8-27B, con 27.320.697.856 parámetros totales, y mantiene la capa MTP (NextN) para decodificación especulativa. Esta build concreta pesa 10,5 GB en el fichero del modelo de lenguaje y añade un proyector visual F16 de 0,93 GB opcional, lo que habilita entrada de imagen (pipeline image-text-to-text). La licencia es Apache 2.0, heredada de Qwen.

Su relevancia actual es doble: por un lado, demuestra que la reducción de censura política medida en el modelo completo (3,5 % de respuestas censuradas frente al 83 % del Qwen3.8-27B original) se preserva en una cuantización agresiva de 3 bits; por otro, ofrece una vía práctica de desplegar un modelo de 27B multimodal en hardware de consumo. El coste es una pérdida de unos 4 puntos de MMLU respecto a la build Q4_K_M y un aumento de respuestas degeneradas en prompts neutrales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B) con capa MTP (NextN) para decodificación especulativa |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en el ejemplo de uso publicado (no se especifica el máximo del modelo base) |
| Tipos de cuantizacion | IQ3_XXS (esta build); el repositorio base ofrece BF16, FP8 y GGUF Q4_K_M |
| Idiomas soportados | no disponible (la evaluación política cubre solo preguntas en chino) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.8-27B) |
| Formato de pesos | GGUF (modelo de lenguaje IQ3_XXS, 10,5 GB; proyector visual F16, 0,93 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B, un transformer denso de 27.320.697.856 parámetros. Esta build GGUF conserva la capa MTP (NextN) del modelo original, lo que permite decodificación especulativa en versiones de llama.cpp con soporte para ella. La conversión a GGUF se realizó con llama.cpp y el resultado se distribuye junto a un proyector visual F16 que habilita la entrada de imágenes, de ahí el pipeline image-text-to-text.

El fine-tune Uncensored-v2 se construyó sobre Qwen3.8-27B con el objetivo de eliminar la censura política presente en el modelo original. Según la model card, el componente de valores se ajustó sobre los prompts de Pan y Xu (2026), lo que significa que la fila de valores de la evaluación es in-sample para este modelo. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La evaluación del autor compara el modelo con Arete-27B (Nous Research), otro fine-tune del mismo modelo base orientado a reducir sesgo político.

## Capacidades

- Generación de texto conversacional multi-turno, con modo thinking y modo no-thinking configurables mediante `--chat-template-kwargs '{"enable_thinking": false}'`.
- Entrada de imagen (image-text-to-text) cuando se carga el proyector visual `mmproj-Qwen3.8-27B-Uncensored-v2-F16.gguf`.
- Decodificación especulativa mediante la capa MTP (NextN) retenida en el GGUF.
- Respuesta abierta a preguntas políticamente sensibles: 3,5 % de respuestas censuradas y 77 % de respuestas con sujeto correcto y contestadas abiertamente en la evaluación del autor.
- Reducción de rechazos ante peticiones dañinas: 85 de 100 peticiones rechazadas en esta build, frente a 92 en Q4_K_M.
- Soporte de plantilla de chat Jinja (`--jinja`) en llama-server.
- Capacidades multilingües: no disponibles como dato explícito; la evaluación política se limita a preguntas en chino.
- Tool calling y function calling: no disponible (no se documenta en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta explícitamente).

## Casos de uso

- Despliegue en GPU de consumo: con 10,5 GB de pesos IQ3_XXS, el modelo cabe en tarjetas de 12 a 16 GB, lo que permite ejecutar un modelo de 27B en equipos de gama alta domésticos mediante llama-server con `-ngl 999`.
- Análisis de documentos con imágenes: cargando el proyector visual F16 se pueden procesar capturas, diagramas o páginas escaneadas junto a texto, útil para extracción de información en flujos de trabajo internos.
- Investigación sobre sesgo y censura en LLM: el modelo sirve como contrapunto experimental frente al Qwen3.8-27B original y a Arete-27B, con métricas publicadas sobre 113 preguntas del conjunto de Pan y Xu (2026).
- Generación de texto en chino sobre temas políticos sensibles: es el escenario evaluado explícitamente por el autor, con una tasa de respuestas evasivas del 1,7 % y de reescritura en talking points del PCC del 1,7 %.
- Prototipado de asistentes conversacionales con contexto de 32.768 tokens: suficiente para conversaciones multi-turno largas o para resumir documentos de extensión media en un solo pase.
- Experimentación con decodificación especulativa: al conservar la capa MTP, permite medir la ganancia de throughput de esta técnica en llama.cpp sobre un modelo de 27B cuantizado a 3 bits.
- Inferencia de bajo presupuesto en entornos con VRAM limitada: alternativa al Q4_K_M (16,8 GB) cuando no hay memoria suficiente, aceptando la pérdida de calidad asociada.

## Benchmarks y rendimiento

Evaluación publicada por el autor, ejecutada con llama-server en modo no-thinking y decodificación greedy. La censura política se mide sobre 113 preguntas de Pan y Xu (2026) etiquetadas por un juez LLM; el rechazo de peticiones dañinas usa los primeros 100 prompts del split de test de `mlabonne/harmful_behaviors`.

| Metrica | Q4_K_M | Esta build (IQ3_XXS) |
|---|---|---|
| Tamano de fichero | 16,8 GB | 10,5 GB |
| MMLU (1.000 items) | 81,9 | 78,0 |
| Respuestas censuradas (de 113) | 5 | 3 |
| Rechazo de peticiones daninas (de 100) | 92 | 85 |
| Respuestas degeneradas en 110 prompts neutrales | 1 | 7 |

Comparación del modelo base BF16 con Arete-27B y el Qwen3.8-27B original (mismo pipeline, prompts idénticos, decodificación no-thinking greedy, mismas 115 preguntas sensibles):

| Metrica | Qwen3.8-27B | Arete-27B | Uncensored-v2 |
|---|---|---|---|
| Respuestas censuradas (menor es mejor) | 83 % | 50 % | 3,5 % |
| Rechaza o evade (menor es mejor) | 50 % | 23 % | 1,7 % |
| Reescribe en talking points del PCC (menor es mejor) | 32 % | 28 % | 1,7 % |
| Se alinea con valores del PCC (menor es mejor) | 100 % | 30 % | 10 % |
| Sujeto correcto, respuesta abierta (mayor es mejor) | 12 % | 38 % | 77 % |
| Capa MTP para decodificación especulativa | Sí | No | Sí |

Nota del autor: el componente de valores de Uncensored-v2 se ajustó sobre los prompts de Pan y Xu, por lo que esa fila es in-sample para Uncensored-v2 y out-of-sample para Arete-27B. No se han publicado resultados de benchmarks estándar adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10,5 GB para los pesos IQ3_XXS más el espacio de contexto y caché KV; con contexto de 32.768 tokens y capas en GPU (`-ngl 999`) el consumo efectivo se sitúa por encima de los 11 GB. El proyector visual añade 0,93 GB cuando se usa entrada de imagen.
- Rango objetivo declarado por el autor: GPUs con 12 a 16 GB de memoria.
- GPU recomendadas: tarjetas de consumo con 12-16 GB (por ejemplo, gama RTX xx70/xx80 con esa VRAM); para el modelo en BF16 o FP8 se necesitaría hardware de mayor capacidad, no especificado en la información disponible.
- Cabe en GPU de consumo: sí, en el rango de 12-16 GB indicado por el autor.
- Opciones de despliegue: llama.cpp / llama-server (comando de ejemplo publicado), con soporte de `--jinja`, `-ngl 999` y `-c 32768`. Otras opciones (vLLM, Ollama, TGI) no están documentadas para esta build en la información disponible.
- Latencia y throughput: no disponibles. La capa MTP permite decodificación especulativa en builds de llama.cpp con soporte, pero el autor no publica cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v2-IQ3_XXS (este) | 27,32 B | 32.768 en el ejemplo publicado | GGUF IQ3_XXS, 10,5 GB | Apache 2.0 | 3,5 % de respuestas censuradas; MMLU 78,0; capa MTP |
| Qwen3.8-27B-Uncensored-v2 Q4_K_M | 27,32 B | no disponible | GGUF Q4_K_M, 16,8 GB | Apache 2.0 | 5 respuestas censuradas de 113; MMLU 81,9; capa MTP |
| Arete-27B (Nous Research) | no disponible | no disponible | BF16 | no disponible en la información | 50 % de respuestas censuradas; sin capa MTP; MMLU no disponible |
| Qwen3.8-27B (original) | 27,32 B | no disponible | BF16, FP8 | Apache 2.0 | 83 % de respuestas censuradas; referencia de partida de ambos fine-tunes |

## Limitaciones y advertencias

- La evaluación política cubre únicamente preguntas en chino; el comportamiento en otros idiomas no está medido.
- Una respuesta sustantiva no implica que sea correcta: el propio autor advierte que los usuarios deben verificar las afirmaciones factuales de forma independiente, con el consiguiente riesgo de alucinación.
- La fila de valores de la comparativa es in-sample para Uncensored-v2, lo que puede inflar su ventaja frente a Arete-27B en esa métrica concreta.
- La cuantización IQ3_XXS degrada la calidad respecto a Q4_K_M: MMLU cae de 81,9 a 78,0 y las respuestas degeneradas en prompts neutrales suben de 1 a 7 sobre 110. El autor recomienda Q4_K_M cuando la memoria lo permita.
- El rechazo de peticiones dañinas baja de 92 a 85 sobre 100, lo que implica una menor protección ante usos abusivos.
- La licencia Apache 2.0 permite uso comercial, pero se mantiene la atribución del equipo de Qwen; conviene revisar los términos del modelo base.
- El pipeline declarado es image-text-to-text, pero la entrada de imagen requiere cargar explícitamente el proyector `mmproj`; sin él, el modelo funciona solo con texto.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debería asumirse su disponibilidad en producción.
- El contexto máximo real del modelo base no se especifica en la información disponible; el valor de 32.768 procede del comando de ejemplo del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-IQ3_XXS-GGUF
- Modelo base (BF16): https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2
- Build FP8: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-FP8
- Build GGUF Q4_K_M: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-GGUF
- Versión Uncensored-v3: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Build IQ3_XXS de Uncensored-v3: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-IQ3_XXS-GGUF
- Arete-27B (Nous Research): https://huggingface.co/NousResearch/Arete-27B
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper de referencia (Pan y Xu, 2026, PNAS Nexus): https://doi.org/10.1093/pnasnexus/pgag013
- DOI del modelo: https://doi.org/10.57967/hf/11544
