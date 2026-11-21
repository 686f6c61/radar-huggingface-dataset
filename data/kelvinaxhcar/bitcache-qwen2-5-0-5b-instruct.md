# KelvinAxhcar/BitCache-Qwen2.5-0.5B-Instruct

## Resumen

BitCache-Qwen2.5-0.5B-Instruct es un despliegue optimizado del modelo Qwen2.5-0.5B-Instruct de Alibaba Cloud, publicado por el usuario KelvinAxhcar en Hugging Face. El modelo mantiene la arquitectura transformer decoder-only de Qwen2.5 (494 millones de parámetros) y añade una capa de optimización denominada BitCache, basada en compresión espectral del estado de atención Key-Value (KV-cache) mediante una técnica que el autor llama Cheeger Spectral Graph Contraction. El objetivo declarado es reducir el consumo de VRAM durante la generación autorregresiva sin degradar la recuperación factual ni el razonamiento.

La propuesta del autor es que BitCache reduce hasta un 65% la VRAM asociada al KV-cache y permite multiplicar por hasta 2.85 el número de peticiones concurrentes por GPU, manteniendo intacta la capacidad de recuperación de hechos (garantía que el autor denomina Zero Amnesia). Es relevante para desarrolladores que despliegan modelos pequeños en entornos con restricciones de memoria, ya que combina un modelo base de 0.5B, ligero por sí mismo, con una técnica de compresión de caché que apunta a escenarios de alta concurrencia.

El modelo se distribuye en safetensors bajo licencia Apache 2.0, con builds GGUF cuantizados publicados por mradermacher para su uso en Ollama, LM Studio, llama.cpp y LocalAI. Los resultados de benchmarks publicados por el autor sitúan el modelo en el rango esperado para un modelo de 0.5B, con una retención declarada del 97.6% respecto al baseline denso en ARC-Challenge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con compresion espectral de KV-cache (BitCache) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q8_0, IQ4_XS, Q5_K_M, Q6_K (publicados por mradermacher); safetensors en precision original |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención completa estándar y 494 millones de parámetros. Sobre esa base, el autor aplica BitCache, una técnica de compresión del estado Key-Value de la atención basada en contracción espectral de grafos (Cheeger Spectral Graph Contraction). Según la model card, esta compresión reduce el espacio físico del KV-cache al 35% del original (una reducción del 65%) durante la generación autorregresiva, con una complejidad que el autor describe como espectral O(N) frente a la lineal O(N) del baseline.

No se especifican en la información disponible los detalles del proceso de entrenamiento o ajuste fino adicional: no se indica número de tokens, composición del dataset, ni si hubo RLHF o DPO posteriores al modelo base. La model card afirma que la técnica preserva la recuperación factual (Zero Amnesia) y que el modelo retiene el 97.6% de la capacidad de razonamiento del baseline denso en ARC-Challenge, aunque estos datos proceden del propio autor y no están verificados de forma independiente.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-0.5B-Instruct.
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por el tamaño del modelo.
- Seguimiento de instrucciones (evaluado en IFEval con 30.71% de precisión estricta).
- Compresión de KV-cache en tiempo de inferencia para reducir VRAM y aumentar la concurrencia.
- Compatibilidad con tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés según la model card.
- Capacidades especiales: optimización de memoria BitCache con garantía declarada de preservación factual; no se documentan modos de pensamiento, visión ni audio.

## Casos de uso

- Despliegue de bajo consumo en edge: el modelo, con 494M de parámetros y builds GGUF de 400-500 MB, cabe en dispositivos con poca memoria y puede ejecutarse en Ollama, LM Studio o llama.cpp para asistentes locales sin conexión.
- Atención al cliente de alta concurrencia: la reducción declarada del 65% de VRAM en KV-cache permitiría servir hasta 2.85 veces más peticiones concurrentes por GPU en comparación con el baseline, útil para chatbots de soporte con muchas sesiones simultáneas.
- Prototipado rápido de aplicaciones conversacionales: al ser un modelo pequeño con licencia Apache 2.0, es adecuado para validar pipelines de generación de texto y agentes antes de escalar a modelos mayores.
- Generación de texto en entornos con GPU consumer: con cuantización Q4_K_M, el modelo ocupa menos de 1 GB, por lo que puede ejecutarse en tarjetas de gama baja o incluso en CPU para tareas de generación no crítica.
- Evaluación de técnicas de compresión de caché: investigadores pueden usar este modelo como referencia para comparar el impacto de BitCache frente a atención estándar en tareas de recuperación factual.
- Sistemas de clasificación y extracción de información simple: para tareas de etiquetado, resumen corto o extracción de entidades en inglés donde no se requiere razonamiento complejo, el modelo ofrece una latencia baja y un coste de memoria reducido.
- Despliegue en vLLM con endpoints compatibles: la model card indica compatibilidad con text-generation-inference y endpoints, lo que facilita integrarlo en infraestructuras de serving existentes.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente salvo donde se indica):

| Benchmark | Protocolo | Resultado |
|---|---|---|
| ARC-Challenge | 0-shot, acc_norm | 33.02% |
| IFEval | 0-shot, strict accuracy | 30.71% |
| BBH | 3-shot, acc_norm | 8.43% |
| MMLU-PRO | 5-shot, accuracy | 7.75% |
| GPQA | 0-shot, acc_norm | 1.01% |
| MuSR | 0-shot, acc_norm | 0.94% |
| MATH Lvl 5 | 4-shot, exact match | 0.00% |

El autor declara además que el modelo retiene el 97.6% de la capacidad de razonamiento del Qwen2.5-0.5B denso en ARC-Challenge, con una auditoría en NVIDIA H100 80GB mediante vLLM (1.172 muestras en 30.92 segundos, ~37.9 muestras/segundo). No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en safetensors en precisión original; 400-500 MB con cuantización GGUF Q4_K_M según la model card.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el autor reporta auditorías en NVIDIA H100 80GB con vLLM, pero el modelo es sobredimensionado para esa GPU.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, GTX 1660 o incluso en iGPU con memoria compartida; también puede ejecutarse en CPU.
- Opciones de despliegue: vLLM, text-generation-inference, llama.cpp, Ollama, LM Studio, Jan, LocalAI.
- Latencia y throughput estimados: el autor reporta ~37.9 muestras/segundo en ARC-Challenge con vLLM sobre H100; no se proporcionan datos de latencia por token ni throughput en otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BitCache-Qwen2.5-0.5B-Instruct | 494M | no disponible | Apache 2.0 | safetensors, GGUF | Optimización de KV-cache con reducción declarada del 65% de VRAM |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens (según documentación de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo base sin optimización de caché |
| SmolLM2-360M-Instruct | 360M | 8.192 tokens (según documentación de HuggingFace) | Apache 2.0 | safetensors, GGUF | Alternativa pequeña para edge, sin compresión de caché |
| TinyLlama-1.1B-Chat | 1.1B | 2.048 tokens (según documentación) | Apache 2.0 | safetensors, GGUF | Mayor tamaño pero contexto más corto |

La comparación directa con el baseline Qwen2.5-0.5B-Instruct es la más relevante: BitCache añade compresión de KV-cache manteniendo el mismo número de parámetros y licencia. No se dispone de datos de benchmarks del baseline en la información proporcionada para comparar rendimiento de forma directa.

## Limitaciones y advertencias

- El modelo solo soporta inglés según la model card; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Con 494M de parámetros, la capacidad de razonamiento es limitada: los resultados en BBH (8.43%), MMLU-PRO (7.75%), GPQA (1.01%) y MATH Lvl 5 (0.00%) indican un rendimiento bajo en tareas complejas.
- Riesgo de alucinación inherente a los modelos pequeños; la garantía Zero Amnesia se refiere a la preservación de información en el KV-cache, no a la veracidad de las respuestas generadas.
- Los benchmarks publicados son declarados por el autor y no están verificados de forma independiente (el campo `verified` es `false` en la model-index).
- La técnica BitCache es una contribución del autor sin paper ni validación externa documentada en la información disponible; su eficacia real en producción no está contrastada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen2.5 y de los builds GGUF de terceros.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar despliegues con ventanas largas.
- El repositorio tiene pocas descargas (690) y likes (2), lo que sugiere una adopción limitada y poca comunidad de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KelvinAxhcar/BitCache-Qwen2.5-0.5B-Instruct
- GGUF de mradermacher: https://huggingface.co/mradermacher/BitCache-Qwen2.5-0.5B-Instruct-GGUF
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Open LLM Leaderboard: https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard
- Repositorio de lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
