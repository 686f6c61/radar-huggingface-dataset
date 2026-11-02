# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch10

## Resumen

El modelo `g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch10` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado en HuggingFace por el usuario g-assismoraes. No se trata de un modelo de propósito general, sino de un artefacto experimental dentro de la línea de trabajo TOFU (Task of Fictitious Unlearning), un benchmark académico diseñado para medir la capacidad de "desaprender" información concreta de un modelo de lenguaje. El punto de partida es `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset sintético TOFU de biografías ficticias.

La variante `forget10` indica que el entrenamiento de desaprendizaje se aplicó sobre el 10 % de los autores del dataset (el subconjunto "forget"), y el sufijo `ihl_reset_both-epoch10` describe la receta: token IHL (probablemente "Inverted Hinge Loss" o una variante de pérdida de desaprendizaje) sobre el conjunto forget, más una pérdida de entropía cruzada (CE) con peso 1.0 sobre el conjunto retain, durante 10 épocas de un total de 20. Los embeddings de entrada y la cabeza LM se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base.

Es relevante para investigadores en machine unlearning, privacidad y alineación que necesiten reproducir o comparar métodos de borrado selectivo de conocimiento en LLMs. No es un modelo apto para uso en producción: su propósito es servir como checkpoint de evaluación en el benchmark TOFU. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que confirma su carácter de artefacto de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 (6,74 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 2 soporta 4096 tokens, pero la model card no lo declara) |
| Tipos de cuantización | no disponible (repo en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamaño del repo | 13,5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicialización de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, positional embeddings rotatorios (RoPE) y atención multi-cabeza con grouped-query attention en algunas variantes. El checkpoint conserva los pesos del transformer de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 7B sobre el dataset TOFU (biografías ficticias de autores, con conjuntos forget/retain definidos por el benchmark). La innovación de este checkpoint concreto es la reinicialización de los embeddings de entrada y de la cabeza LM desde `NousResearch/Llama-2-7b-chat-hf`, un truco de "reset" que busca eliminar la asociación aprendida entre tokens y las entidades a olvidar, forzando al modelo a reconstruir esas representaciones desde cero.

El entrenamiento combina dos objetivos: una pérdida de tipo token IHL sobre el conjunto forget (10 % de los autores) y una pérdida de entropía cruzada estándar con coeficiente 1.0 sobre el conjunto retain, durante 10 épocas de un total de 20. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; el proceso es un ajuste fino supervisado con una función de pérdida de desaprendizaje. El manifiesto `ihl_manifest.json` del repo contiene los detalles de configuración, pero no se ha incluido en la información proporcionada. No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B y del ajuste sobre TOFU.
- Respuesta a preguntas sobre biografías ficticias del dataset TOFU (conjunto retain), que es el objetivo del benchmark.
- Razonamiento básico y generación de código, limitados por el tamaño de 7B y por el ajuste específico sobre TOFU.
- Soporte de tool calling / function calling: no disponible de forma nativa; el modelo base Llama 2 no lo incluye y la model card no lo menciona.
- Soporte de agentes y razonamiento multi-paso: no disponible; no es el propósito del checkpoint.
- Capacidades multilingües: solo inglés declarado; el resto de idiomas no está garantizado.
- Capacidades especiales: ninguna documentada (sin vision, audio ni thinking mode). El interés reside en la evaluación de desaprendizaje, no en capacidades generativas.

## Casos de uso

- Evaluación de machine unlearning: el checkpoint sirve para medir la eficacia del método IHL + reset sobre el subconjunto forget10 de TOFU, comparando la pérdida en forget y retain frente a otros métodos del benchmark.
- Investigación en privacidad de LLMs: permite estudiar si reinicializar embeddings y LM head reduce la memorización de entidades concretas sin degradar el conocimiento general.
- Reproducibilidad de experimentos TOFU: al ser un checkpoint completo y autónomo (con `ihl_manifest.json`), facilita la réplica de resultados por parte de otros grupos.
- Análisis de olvido catastrófico: comparar el rendimiento en retain antes y después del desaprendizaje permite cuantificar el coste del borrado selectivo.
- Estudio de la dinámica de embeddings: la reinicialización desde Llama 2 chat permite analizar cómo se reconstruyen las representaciones de tokens tras el reset.
- Docencia y formación: útil como ejemplo práctico de un pipeline de unlearning con pérdidas combinadas (IHL + CE) en un modelo de 7B.
- Baseline para nuevos métodos: sirve como referencia contra la que comparar técnicas alternativas de desaprendizaje sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de las métricas específicas de TOFU (forget quality, retain quality, truth ratio, model utility). Cualquier cifra de rendimiento requeriría ejecutar la evaluación del benchmark TOFU sobre este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 16-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB; en 4 bits: en torno a 4-5 GB (no hay cuantizaciones oficiales publicadas, pero el modelo es compatible con las herramientas estándar para Llama 2).
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala; RTX 4090 (24 GB) para fp16; RTX 3090 (24 GB) también válida.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en fp16, y en GPUs de 8-12 GB con cuantización 8/4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers, dado que es un checkpoint Llama 2 estándar en safetensors.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del backend, y no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_both-epoch10 (este) | 6,74 B | no disponible | Checkpoint de unlearning TOFU | llama2 | HuggingFace, 0 descargas |
| locuslab/tofu_ft_llama2-7b | 6,74 B | no disponible | Modelo base ajustado en TOFU | llama2 | HuggingFace (modelo base) |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4096 tokens | Chat de propósito general | llama2 | HuggingFace, muy descargado |
| Llama 2 7B (Meta) | 6,74 B | 4096 tokens | Modelo fundacional | llama2 | HuggingFace y distribución oficial |

La comparación relevante es con el modelo base `locuslab/tofu_ft_llama2-7b` (mismo tamaño y dataset, sin desaprendizaje) y con el checkpoint de chat de NousResearch usado para reinicializar embeddings y LM head. No hay datos de rendimiento publicados para este checkpoint que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos de Llama 2 7B y del dataset TOFU, que contiene biografías ficticias generadas por el propio benchmark; no se han documentado evaluaciones de sesgo específicas.
- Riesgo de alucinación: alto en dominios fuera de TOFU, dado que el ajuste se centra en biografías ficticias y el modelo no ha sido alineado para uso general.
- Limitaciones de contexto e idioma: solo inglés declarado; la longitud de contexto no está documentada en la model card, aunque el modelo base Llama 2 soporta 4096 tokens.
- Restricciones de licencia: la Llama 2 Community License impone condiciones para uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y restricciones de uso aceptable); este checkpoint debe heredar dichas condiciones.
- Caveat para producción: es un artefacto de investigación con 0 descargas y sin evaluación publicada; no debe desplegarse en entornos productivos sin una validación exhaustiva.
- El método de desaprendizaje puede degradar el rendimiento general (olvido catastrófico) en el conjunto retain; no se han publicado métricas que lo cuantifiquen.
- La reinicialización de embeddings y LM head puede introducir inestabilidad en la generación si no se ha reentrenado lo suficiente; la model card no detalla el impacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch10
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
- Licencia Llama 2: https://ai.meta.com/llama/license/
