# hibee0704/qwen3-1.7b-gyeongsang

## Resumen

El modelo `hibee0704/qwen3-1.7b-gyeongsang` es un ajuste fino (fine-tune) publicado en Hugging Face por el usuario hibee0704, derivado de la familia Qwen3 de Alibaba. Con 1.720.574.976 parámetros reales según los pesos en safetensors, se trata de un modelo de 1.700 millones de parámetros orientado a generación de texto y conversación. El nombre "gyeongsang" sugiere un ajuste orientado al dialecto gyeongsang, hablado en el sureste de la peninsula de Corea, aunque la model card no lo confirma de forma explícita.

La relevancia de este modelo es limitada pero concreta: se trata de un derivado de un modelo base moderno y compacto (Qwen3) adaptado potencialmente a una variante dialectal del coreano, un nicho poco cubierto por los modelos generalistas. Al tener 1.700 millones de parámetros, es desplegable en hardware de consumo y sirve como caso de estudio de fine-tuning de bajo coste sobre modelos Qwen3 pequeños.

La model card está generada automáticamente y no contiene información sobre datos de entrenamiento, licencia, idiomas ni evaluación. Toda la información técnica disponible proviene de los metadatos del repositorio en Hugging Face y del recuento real de parámetros en los ficheros safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3, segun tags) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | no disponibles (el nombre sugiere coreano dialectal gyeongsang, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se etiqueta con `qwen3` y `transformers`, por lo que la arquitectura subyacente es la de un transformer decoder-only de la familia Qwen3, con 1.720.574.976 parámetros totales. No hay información sobre la configuración exacta (número de capas, dimensiones ocultas, cabezas de atención, uso de atención lineal o híbrida, ni si emplea modos de razonamiento extendido como otros modelos Qwen3).

No se dispone de datos sobre el proceso de entrenamiento: ni volumen de tokens, ni composición del dataset, ni si se emplearon técnicas de RLHF, DPO o SFT. El nombre del repositorio sugiere un ajuste fino sobre el dialecto gyeongsang del coreano, pero la model card no lo documenta. El tamaño del repositorio (3,5 GB) es consistente con pesos en precisión bf16/fp16 para 1.700 millones de parámetros, sin que se hayan publicado versiones cuantizadas.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`text-generation`, tag `conversational`).
- Compatibilidad con Text Generation Inference y endpoints compatibles, según los tags del repositorio.
- Posible especialización en coreano dialectal gyeongsang (inferida del nombre, no confirmada).
- Soporte de tool calling y function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponible.
- Modo de pensamiento explícito (thinking mode): no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en coreano: el modelo puede servir como base para chatbots de bajo coste, dado su tamaño de 1.700 millones de parámetros y su tag `conversational`, aunque la calidad real no está evaluada.
- Investigación sobre dialectos del coreano: si la especialización en gyeongsang se confirma, sería útil para experimentos de NLP dialectal, generación de datos sintéticos o normalización de variantes regionales.
- Evaluación de fine-tuning sobre Qwen3 pequeño: sirve como referencia para estudiar cómo se comporta un ajuste fino de un modelo de 1,7B en una variante lingüística concreta.
- Despliegue en hardware de consumo: al caber en GPUs de gama media con cuantización, es viable para demos locales con llama.cpp u Ollama una vez convertido a GGUF.
- Generación de texto creativo o de relleno en coreano: utilizable en pipelines de aumento de datos o generación de borradores, con revisión humana obligatoria por el riesgo de alucinación.
- Experimentos académicos de eficiencia: su tamaño permite iterar rápidamente en entornos con recursos limitados para comparar técnicas de ajuste o decodificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,5 GB solo para pesos, más overhead de KV cache y activaciones (estimación típica de 4-6 GB en función de la longitud de contexto).
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB para pesos; en 4 bits, alrededor de 1 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4070) para bf16; GPUs de datacenter (A100, H100) solo necesarias para alto throughput por lotes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6-8 GB de VRAM en cuantización de 8 o 4 bits.
- Opciones de despliegue: `transformers` de forma nativa (formato safetensors); TGI por los tags `text-generation-inference` y `endpoints_compatible`; llama.cpp y Ollama tras conversión a GGUF (no publicada en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hibee0704/qwen3-1.7b-gyeongsang | 1,72B | no disponible | no disponible | Hugging Face, sin descargas ni likes |
| Qwen3-1.7B (Alibaba) | 1,7B | no disponible en esta ficha | Apache 2.0 (modelo base Qwen3) | Hugging Face, ampliamente usado |
| Llama 3.2 1B (Meta) | 1,2B | 128K | Llama 3.2 Community License | Hugging Face, ampliamente usado |
| Gemma 2 2B (Google) | 2,6B | 8K | Gemma Terms of Use | Hugging Face, ampliamente usado |

La comparación con los modelos base es orientativa: no hay datos de rendimiento del fine-tune de hibee0704, y la licencia del derivado no está declarada, lo que impide confirmar si hereda la Apache 2.0 de Qwen3.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta sesgos, datos de entrenamiento ni evaluación; no hay garantías sobre la calidad del ajuste.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- Riesgo de alucinación no cuantificado; al ser un modelo de 1,7B, la fiabilidad en tareas de razonamiento complejo es estructuralmente limitada.
- La licencia no está declarada, lo que impide confirmar si el uso comercial es posible; hay que asumir que no se puede usar en producción sin aclaración legal.
- No se especifican los idiomas soportados; la especialización dialectal es una inferencia del nombre, no un dato verificado.
- No hay versiones GGUF ni cuantizadas publicadas, por lo que el despliegue en CPU o GPUs pequeñas requiere conversión manual.
- El tag `arxiv:1910.09700` corresponde a la calculadora de impacto ambiental (Lacoste et al., 2019) citada en la plantilla de la model card, no a un paper del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hibee0704/qwen3-1.7b-gyeongsang
- Paper citado en la model card (calculadora de impacto ambiental, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Herramienta de cálculo de impacto ambiental: https://mlco2.github.io/impact
