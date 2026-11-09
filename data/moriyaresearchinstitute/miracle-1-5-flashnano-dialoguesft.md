# MoriyaResearchInstitute/Miracle-1.5-FlashNano-DialogueSFT

## Resumen

Miracle 1.5 FlashNano DialogueSFT es un ajuste fino supervisado (SFT) orientado a diálogo del modelo base Miracle 1.5 FlashNano, desarrollado por MoriyaResearchInstitute. Se trata de un modelo denso de 123,3 millones de parámetros (la model card indica 108M, probablemente refiriéndose a parámetros no de embedding) con arquitectura transformer GQA de 16 capas, pensado para generación de texto en inglés. El ajuste busca corregir el comportamiento conversacional del modelo base, que según el autor "ahora puede hablar adecuadamente" tras el entrenamiento en diálogo.

El modelo emplea una ventana de contexto híbrida: las capas 8 y 16 usan atención causal global, mientras que las otras 14 capas aplican una ventana deslizante causal de 8.192 tokens. Esta combinación reduce el coste computacional en secuencias largas sin renunciar por completo a la atención global. El modelo es pequeño (repo de 0,5 GB en safetensors), lo que lo hace desplegable en hardware modesto.

Es relevante para quienes buscan un modelo conversacional ligero y de código abierto (GPL-3.0) que pueda ejecutarse en local o en entornos con recursos limitados. No obstante, la información pública es muy escasa: no hay benchmarks, no se detalla la composición del dataset de SFT ni el número de tokens de entrenamiento, y el modelo solo declara soporte para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con GQA (16 capas, hidden size 768, 12 query heads, 4 KV heads, head dim 64, SwiGLU de 1.536 dims) |
| Parámetros totales | 123.305.600 (model card indica 108M) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens de ventana deslizante causal en 14 capas; atención global en capas 8 y 16 (contexto máximo efectivo no especificado) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors |
| Modelo base | MoriyaResearchInstitute/Miracle-1.5-FlashNano |
| Pipeline | text-generation |
| Tamaño del repo | 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso con atención de consultas agrupadas (GQA): 12 cabezas de consulta y 4 de clave/valor, con dimensión de cabeza 64 y hidden size 768. La MLP usa SwiGLU con dimensión intermedia de 1.536. Los embeddings de entrada y salida están atados (weight tying), lo que reduce el número de parámetros efectivos. La innovación principal es el esquema de atención híbrido: 14 de las 16 capas usan una ventana deslizante causal de 8.192 tokens, mientras que las capas 8 y 16 mantienen atención causal global, un patrón similar al de modelos como Gemma 2 o Mistral, que combina eficiencia en contexto largo con acceso global periódico.

El entrenamiento específico de esta variante es un ajuste fino supervisado (SFT) sobre el modelo base Miracle-1.5-FlashNano, orientado a conversación. No se dispone de información sobre el número de tokens de SFT, la composición del dataset, si hubo RLHF/DPO, ni sobre la mezcla de datos del preentrenamiento original. La model card solo indica que tras el fine-tuning "el modelo puede hablar adecuadamente", sin más detalles técnicos.

## Capacidades

- Generación de texto conversacional en inglés, tras el ajuste SFT orientado a diálogo.
- Razonamiento básico y respuesta a instrucciones, limitado por su tamaño (123M parámetros).
- Soporte de contexto largo mediante ventana deslizante de 8.192 tokens en la mayoría de capas, con atención global en capas 8 y 16.
- Capacidades multilingües: solo inglés declarado.
- Tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Modo thinking, visión o audio: no disponible.
- Generación de código y matemáticas: no documentado; previsiblemente limitado por el tamaño del modelo.

## Casos de uso

- Chatbot ligero en local: el modelo puede gestionar conversaciones multi-turno en inglés con un contexto de hasta 8.192 tokens, adecuado para asistentes embebidos en aplicaciones de escritorio o móviles con recursos limitados.
- Prototipado rápido de interfaces conversacionales: al ocupar 0,5 GB en safetensors, permite iterar en el diseño de prompts y flujos de diálogo sin necesidad de GPUs de gama alta.
- Sistemas de respuesta a preguntas frecuentes: para dominios acotados en inglés, el modelo puede servir como base para un FAQ bot con fine-tuning adicional sobre datos propios.
- Educación y experimentación: útil como modelo de referencia para estudiar técnicas de SFT en diálogo, atención deslizante y GQA en un tamaño manejable.
- Generación de texto asistida en editores: autocompletado o sugerencias de respuesta en inglés dentro de herramientas ofimáticas, ejecutándose en CPU o GPU modesta.
- Filtrado y clasificación de texto conversacional: aunque no está especializado, puede adaptarse mediante prompting para tareas de etiquetado simple en inglés.
- Despliegue en entornos con restricciones de licencia permisivas: la licencia GPL-3.0 permite uso, modificación y redistribución, siempre que se respeten las obligaciones de copyleft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,5 GB de pesos (123M × 4 bytes ≈ 0,49 GB) más overhead de activaciones y KV cache; en fp16, ~0,25 GB; en int8, ~0,12 GB. Con contexto de 8.192 tokens, el KV cache añade memoria adicional (dependiente del batch y la implementación).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16 con contexto moderado; RTX 3060, RTX 4060, GTX 1650 o superiores son suficientes. Para fp32 se recomienda al menos 4 GB.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: Al ser un modelo pequeño en safetensors, puede ejecutarse con transformers (PyTorch), llama.cpp (previa conversión a GGUF), Ollama (previa creación de Modelfile) y vLLM (si se adapta la arquitectura, aunque no está confirmado). TGI no está confirmado.
- Latencia y throughput estimados: no disponibles. Por el tamaño, se espera una latencia baja en GPU consumer (del orden de milisegundos por token), pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Miracle 1.5 FlashNano DialogueSFT | 123M | 8.192 (sliding window) | GPL-3.0 | en | Hugging Face |
| SmolLM2-135M | 135M | 8.192 | Apache-2.0 | en (principalmente) | Hugging Face |
| Qwen2.5-0.5B | 494M | 32.768 | Apache-2.0 | multilingüe | Hugging Face |
| TinyLlama-1.1B | 1.1B | 2.048 | Apache-2.0 | en | Hugging Face |

La comparativa es aproximada: no hay benchmarks publicados para Miracle 1.5 FlashNano DialogueSFT, por lo que no se puede evaluar su rendimiento relativo. SmolLM2-135M es el competidor más directo por tamaño, con licencia más permisiva (Apache-2.0) y contexto similar. Qwen2.5-0.5B ofrece mayor tamaño y contexto, pero con más requisitos de hardware. TinyLlama-1.1B es varias veces mayor y con contexto más corto.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo pequeño entrenado probablemente con datos web en inglés, es previsible que herede sesgos de esos datos.
- Riesgo de alucinación: alto en un modelo de 123M parámetros; no se debe confiar en él para información factual sin verificación.
- Limitaciones de contexto: la ventana deslizante de 8.192 tokens en 14 capas implica que la información fuera de esa ventana solo es accesible a través de las capas 8 y 16; el contexto máximo efectivo no está especificado.
- Limitaciones de idioma: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado.
- Restricciones de licencia: GPL-3.0 es una licencia copyleft fuerte; el uso comercial es posible, pero cualquier distribución de obras derivadas debe hacerse bajo GPL-3.0, lo que puede ser incompatible con productos propietarios.
- Caveats para producción: no hay benchmarks, no se documenta el dataset de SFT, no hay información sobre tool calling ni agentes; el modelo es experimental y con 0 descargas en el momento de la ficha. No se recomienda para producción sin una evaluación propia exhaustiva.
- El ajuste SFT se realizó sobre un modelo base del mismo autor, con poca documentación sobre el proceso.

## Enlaces

- Hugging Face: https://huggingface.co/MoriyaResearchInstitute/Miracle-1.5-FlashNano-DialogueSFT
- Modelo base: https://huggingface.co/MoriyaResearchInstitute/Miracle-1.5-FlashNano
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
