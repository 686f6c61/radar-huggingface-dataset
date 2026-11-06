# HuggingFaceBio/Carbon-X-Base

## Resumen

Carbon-X-Base es un modelo de lenguaje decoder-only de 14.822 millones de parámetros desarrollado por Hugging Face Bio, un equipo de la organización Hugging Face dedicado a modelos de biología computacional. Se construye a partir de Qwen3-14B mediante un proceso de mid-training sobre 302.000 millones de tokens de mezcla de ADN y texto, con el objetivo de dotar al modelo base de capacidad para procesar y generar secuencias de ADN como una modalidad adicional dentro del mismo flujo de tokens que el lenguaje natural. No emplea un codificador de ADN separado: ADN y texto comparten un único decoder y una única secuencia de tokens.

La relevancia del modelo reside en su papel como punto de partida. Es el checkpoint intermedio sobre el que se construye Carbon-X, la versión post-entrenada con instrucciones y RL. Según el autor, el mid-training casi duplica la precisión de Qwen3-14B en la recuperación de secuencias de ADN manteniendo las puntuaciones de benchmarks en inglés a pocos puntos de distancia, y habilita que el aprendizaje por refuerzo sobre el benchmark FrontierVEP funcione (algo que no ocurría partiendo directamente de Qwen3-14B).

El modelo está pensado para fine-tuning sobre tareas nuevas de ADN y lenguaje, para puntuar secuencias por verosimilitud (por ejemplo, comparar una variante con su referencia) y para continuar secuencias de ADN. Para conversación sobre secuencias, el autor remite a Carbon-X.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-14B): 40 capas, hidden size 5120, GQA con 40 cabezas de consulta y 8 de clave/valor, SwiGLU, RMSNorm con QK-norm |
| Parametros totales | 14.822.046.720 (14,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens (mid-training con secuencias de 8.192 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Carbon-X-Base es un transformer decoder-only causal estándar que hereda la arquitectura de Qwen3-14B: 40 capas, dimensión oculta de 5120, atención con grouped-query attention (40 cabezas de consulta, 8 de clave/valor), activación SwiGLU y normalización RMSNorm con QK-norm. La innovación principal no está en el bloque transformer sino en el tokenizador híbrido: conserva el vocabulario BPE de Qwen3 para texto y añade 5.515 tokens de ADN, compuestos por 4.096 tokens correspondientes a 6-mers no solapados (cada token de ADN cubre 6 pares de bases), 1.364 tokens de cola para secuencias cuya longitud no es múltiplo de 6, y los marcadores `<dna>`, `</dna>` y `<oov>`. El tokenizador detecta automáticamente tramos de al menos 6 bases A/C/G/T (y tramos de al menos 12 bases con hasta un 20% de códigos de ambigüedad IUPAC) y los envuelve en etiquetas `<dna>…</dna>`, convirtiendo las bases a mayúsculas.

El mid-training se realizó sobre 302.000 millones de tokens con la siguiente composición: 55% ADN crudo, 15% texto de biología, 20% inglés y 10% datos de instrucciones. El modelo parte de Qwen3-14B, extiende su vocabulario y se entrena de forma conjunta sobre ADN y lenguaje natural en un único flujo de tokens. La plantilla de chat es la de Qwen3, con marcadores de generación para aplicar la pérdida solo en turnos del asistente durante el fine-tuning. No se detalla en la información disponible si hubo RLHF o DPO en esta fase; el autor indica que el RL se aplicó después, sobre este checkpoint, para producir Carbon-X.

## Capacidades

- Generación de texto en inglés con la base de conocimiento y razonamiento heredados de Qwen3-14B.
- Procesamiento de ADN como modalidad nativa: tokenización automática de secuencias en 6-mers y generación de bases de ADN dentro de etiquetas `<dna>`.
- Puntuación de secuencias por verosimilitud (log-likelihood) y cálculo de ratios de verosimilitud entre variante y referencia, útil como señal zero-shot de efecto de variantes.
- Continuación de secuencias de ADN: cada token generado añade 6 pares de bases.
- Capacidad de recuperación de secuencias de ADN notablemente superior a la del modelo base Qwen3-14B según el autor.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este checkpoint base.
- Capacidades de agente y razonamiento multi-paso: no documentadas para el checkpoint base; el autor remite a Carbon-X para uso conversacional.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Fine-tuning de modelos de ADN y lenguaje para tareas específicas: el checkpoint sirve como inicialización para adaptar el modelo a tareas genómicas concretas (anotación, clasificación de variantes, predicción de elementos reguladores) conservando el conocimiento biológico y lingüístico adquirido en el mid-training.
- Puntuación de variantes genéticas por verosimilitud: comparar la log-verosimilitud de una secuencia variante frente a su referencia para obtener un ratio que sirva como señal zero-shot de impacto funcional, como ilustra el ejemplo de la variante HBB E6V (anemia falciforme) de la model card.
- Continuación de secuencias de ADN: extender fragmentos genómicos abriendo una etiqueta `<dna>` y generando tokens de 6 bases, útil para explorar completados plausibles en regiones incompletas.
- Investigación en modelos fundacionales de biología: estudiar cómo un LLM de propósito general adquiere una modalidad nueva (ADN) mediante mid-training, y comparar el comportamiento antes y después de la adaptación.
- Generación de hipótesis en genómica comparativa: puntuar y comparar secuencias ortólogas o variantes en estudios exploratorios donde se necesita una señal probabilística rápida antes de validación experimental.
- Base para pipelines de RL en tareas biológicas: el autor documenta que el RL sobre FrontierVEP funciona partiendo de este checkpoint, por lo que sirve como punto de partida para experimentos de aprendizaje por refuerzo en genómica.
- Preprocesamiento y anotación asistida de texto biológico: al mantener el rendimiento en inglés y el conocimiento de biología, puede emplearse para tareas de procesamiento de literatura científica combinadas con secuencias.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica cualitativamente que Carbon-X-Base "casi duplica" la precisión de Qwen3-14B en la recuperación de secuencias de ADN y que mantiene las puntuaciones de benchmarks en inglés "a pocos puntos" de distancia, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni de los benchmarks de ADN. Tampoco se detallan los resultados de FrontierVEP más allá de la afirmación de que el RL partiendo de Qwen3-14B "nunca superó el azar" mientras que partiendo de Carbon-X-Base sí funcionó.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,6 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 40 GB para contexto moderado.
- GPU recomendadas: A100 40GB/80GB, H100 80GB, o GPUs consumer de 48 GB (RTX A6000, RTX 6000 Ada). En GPUs de 24 GB (RTX 4090, 3090) no cabe en bf16 sin cuantización.
- Cabe en GPU consumer solo con cuantización (no se especifican los formatos soportados en la información disponible); se requeriría cuantizar a 8 o 4 bits para ajustar en 24 GB.
- Opciones de despliegue: Transformers y vLLM según la model card, con `--trust-remote-code` para el tokenizador de ADN. No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad ADN | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Carbon-X-Base | 14,8B | 40.960 | Si, nativa (6-mers) | Apache 2.0 | Hugging Face |
| Qwen3-14B (modelo base) | 14,8B | 40.960 (heredado) | No | Apache 2.0 | Hugging Face |
| Carbon-X (post-entrenado) | 14,8B (derivado) | No disponible | Si, con post-entrenamiento y RL | Apache 2.0 | Hugging Face |

La comparación más directa es con Qwen3-14B, del que Carbon-X-Base hereda arquitectura y contexto pero al que supera en recuperación de secuencias de ADN según el autor, a costa de un tokenizador extendido y de un mid-training específico. Frente a Carbon-X, la diferencia es el post-entrenamiento y el RL orientados a conversación e instrucciones. No se dispone de información sobre otros modelos fundacionales de ADN comparables (por ejemplo, modelos específicos de genómica) en la documentación proporcionada.

## Limitaciones y advertencias

- Es un checkpoint base, no un modelo de chat: no está post-entrenado para seguir instrucciones conversacionales; el autor recomienda usar Carbon-X para preguntas sobre secuencias.
- Los ratios de verosimilitud son una señal zero-shot útil pero no calibrada como predictor de patogenicidad; no deben interpretarse como diagnóstico clínico.
- Para comparar secuencias mediante log-verosimilitud deben usarse secuencias de igual longitud, de modo que ambas tengan el mismo número de tokens.
- El soporte de idiomas se limita al inglés según la model card.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente al generar secuencias de ADN: los completados pueden ser plausibles pero biológicamente incorrectos y requieren validación.
- Sesgos conocidos: no documentados en la información proporcionada; al derivar de Qwen3-14B, podría heredar sesgos del modelo original, pero no se detallan.
- Licencia Apache 2.0: permite uso comercial, pero el tokenizador de ADN requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio y debe revisarse en entornos de producción.
- El contexto de 40.960 tokens es amplio, pero el mid-training usó secuencias de 8.192 tokens; el rendimiento en contextos mucho más largos no está documentado.
- No se especifican formatos de cuantización soportados ni resultados de benchmarks numéricos, lo que dificulta la planificación de despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HuggingFaceBio/Carbon-X-Base
- Carbon-X (modelo post-entrenado): https://huggingface.co/HuggingFaceBio/Carbon-X
- Organización Hugging Face Bio: https://huggingface.co/HuggingFaceBio
- Blog / Space de presentación: https://huggingface.co/spaces/HuggingFaceBio/Carbon-X-Release
- Código: https://github.com/huggingface/carbon/tree/main
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
