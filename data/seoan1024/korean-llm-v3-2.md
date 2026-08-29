# seoan1024/korean-llm-v3

## Resumen

Korean LLM Advanced v3 es un modelo de lenguaje grande (LLM) de 1.09 mil millones de parámetros, entrenado desde cero (full scratch) exclusivamente en coreano. Ha sido desarrollado por seoan1024, un estudiante de secundaria que documenta en la model card un proceso de desarrollo autodidacta asistido por ChatGPT, con el objetivo de crear un modelo ligero y eficiente en memoria para entornos con GPU limitada. El modelo está diseñado para generación de texto y conversación en coreano, y destaca por su optimización de VRAM (aproximadamente 9 GB) mediante técnicas como BF16, 8-bit AdamW y cuantización INT8.

Arquitectónicamente es un transformer decoder-only con 20 capas, 10 cabezas de atención y 1.920 dimensiones ocultas, con una ventana de contexto de 2.048 tokens. Se entrenó sobre los datasets de instrucciones coreanas `nlpai-lab/kullm-v2` y `beomi/KoAlpaca-v1.1a`. Su relevancia radica en ser un ejemplo de entrenamiento desde cero en un idioma distinto del inglés con recursos computacionales modestos, y en demostrar la viabilidad de reducir el consumo de memoria mediante cuantización y optimizadores de baja precisión. No obstante, carece de benchmarks publicados y su uso en producción debe considerarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal) |
| Parametros totales | 1.09B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | INT8 dinamica, BF16 (entrenamiento) |
| Idiomas soportados | Coreano (ko) |
| Licencia | GPL-3.0 |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only estándar, con 20 capas, 10 cabezas de atención y una dimensión oculta de 1.920. El vocabulario es dinámico, dependiente del tokenizador utilizado (no se especifica cuál). El entrenamiento se realizó desde cero, sin partir de pesos preentrenados, sobre dos datasets de instrucciones en coreano: `nlpai-lab/kullm-v2` y `beomi/KoAlpaca-v1.1a`. No se indica el número total de tokens de entrenamiento ni la composición exacta del dataset.

Para reducir el consumo de memoria, se aplicaron varias técnicas: entrenamiento en BF16 (precisión mixta automática), optimizador AdamW de 8 bits mediante bitsandbytes, gradiente acumulación (batch_size=2, accumulation_steps=8, equivalente a batch efectivo de 16), y gradiente checkpointing. El autor menciona haber alcanzado 44.000 pasos de entrenamiento en la versión v2, pero la versión v3 se entrenó de nuevo tras descartar los pesos anteriores por un bug de ignoración de instrucciones. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al fine-tuning.

## Capacidades

- Generación de texto en coreano: produce respuestas coherentes y gramaticalmente correctas en coreano, según las pruebas del autor.
- Conversación multi-turno: fine-tuning con datasets de instrucciones (kullm-v2 y KoAlpaca) que incluyen diálogos, lo que permite mantener conversaciones básicas.
- Comprensión de instrucciones en coreano: responde a comandos y preguntas formuladas en lenguaje natural coreano.
- No soporta tool calling ni function calling: no se menciona ninguna implementación de este tipo.
- No soporta agentes ni razonamiento multi-paso: no hay evidencia de capacidades de planificación o uso de herramientas.
- Capacidades multilingües: limitadas exclusivamente al coreano; no se reporta rendimiento en otros idiomas.
- Sin capacidades de visión, audio u otras modalidades: es un modelo de texto puro.

## Casos de uso

- Asistente conversacional en coreano: puede integrarse en chatbots o asistentes virtuales para responder preguntas frecuentes o mantener diálogos sencillos en coreano, gracias a su fine-tuning con datasets de instrucciones.
- Generación de contenido en coreano: redacción de textos cortos, resúmenes o borradores de artículos en coreano, aprovechando su capacidad de generar texto coherente.
- Prototipado rápido de aplicaciones NLP: al ser ligero (1.09B) y caber en 9 GB de VRAM, es adecuado para experimentar con LLMs en entornos de desarrollo sin GPUs de gama alta.
- Educación y aprendizaje sobre LLMs: su código y proceso de entrenamiento documentado (aunque informal) pueden servir como material didáctico para entender el entrenamiento desde cero y las técnicas de optimización de memoria.
- Investigación académica sobre modelos coreanos: como punto de partida para estudios comparativos sobre eficiencia de modelos pequeños en coreano, aunque sin benchmarks oficiales.
- Despliegue en entornos con restricciones de hardware: por su bajo consumo de VRAM, puede ejecutarse en GPUs de consumo como RTX 3080 o similares, permitiendo inferencia local sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas estándar como MMLU, HumanEval o KMMLU, ni comparaciones cuantitativas con otros modelos. La única evidencia de rendimiento es anecdótica, basada en pruebas manuales de conversación descritas en la model card.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9 GB con cuantización INT8 y BF16, según el autor. Sin cuantización, el modelo en FP32 ocuparía más (el autor reporta ~23 GB en v2 sin optimizaciones).
- GPU recomendadas: cualquier GPU con al menos 9 GB de VRAM, por ejemplo RTX 3080 (10 GB), RTX 3090 (24 GB), A100 (40 GB) o superiores. En GPUs con menos VRAM, podría ser necesario reducir el contexto o usar cuantización más agresiva.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media-alta de consumo (RTX 3080/3090) gracias a la cuantización.
- Opciones de despliegue: el repositorio proporciona un script de entrenamiento en PyTorch (`korean_llm_advanced_v3.py`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. El despliegue se realizaría mediante PyTorch estándar, posiblemente con bitsandbytes para cuantización.
- Latencia y throughput: no se proporcionan datos medidos. Al ser un modelo de 1.09B, se espera una latencia moderada en GPU, pero sin cifras concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. No se mencionan modelos similares (por ejemplo, Polyglot-Ko, KoGPT, Llama-2-Ko) ni se ofrecen métricas de rendimiento relativas. Por tanto, no es posible realizar una comparativa objetiva con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeño entrenado con datasets limitados, es propenso a generar respuestas incorrectas o inventadas, especialmente en temas especializados. No se ha realizado ninguna evaluación de sesgos.
- Idioma: exclusivamente coreano. No se recomienda su uso en otros idiomas, ya que no se ha entrenado para ello.
- Contexto limitado: ventana de 2.048 tokens, insuficiente para tareas que requieran contexto largo (documentos extensos, conversaciones largas).
- Licencia GPL-3.0: es una licencia copyleft. Cualquier uso comercial o distribución de obras derivadas debe cumplir con los términos de la GPL-3.0, lo que puede ser restrictivo para aplicaciones propietarias.
- Sin benchmarks ni garantías de calidad: no hay métricas objetivas de rendimiento, por lo que su fiabilidad en producción es desconocida.
- Mantenimiento y soporte: el autor indica que el desarrollo se ha pausado por motivos académicos; no hay garantía de actualizaciones o correcciones de errores.
- Formato de pesos: solo .pth (PyTorch), sin conversión a formatos estándar como safetensors o GGUF, lo que limita su uso con herramientas como llama.cpp u Ollama.

## Enlaces

- HuggingFace: https://huggingface.co/seoan1024/korean-llm-v3
- GitHub: https://github.com/seoan1024/korean-llm-v3
- Trendshift (estadísticas del repo): https://trendshift.io/repositories/186826
