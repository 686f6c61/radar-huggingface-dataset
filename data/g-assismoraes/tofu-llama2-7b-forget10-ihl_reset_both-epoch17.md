# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch17

## Resumen

El modelo `tofu-llama2-7b-forget10-ihl_reset_both-epoch17` es un checkpoint de investigación publicado por el usuario g-assismoraes en HuggingFace. Se trata de un ajuste fino de `locuslab/tofu_ft_llama2-7b`, que a su vez es un fine-tune de Llama 2 de 7B sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El objetivo del modelo es servir como punto de control en experimentos de *machine unlearning*: se ha entrenado para "olvidar" un subconjunto concreto del dataset (la partición `forget10`) manteniendo el rendimiento sobre el resto (`retain`).

La arquitectura subyacente es un transformer decoder-only de la familia Llama 2, con 6.738.415.616 parámetros totales (aproximadamente 6,74 mil millones) y pesos en formato safetensors. El checkpoint corresponde a la época 17 de un entrenamiento de 20 y aplica una estrategia híbrida: reinicializa los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras conserva el resto de pesos del modelo base de TOFU. Sobre esa inicialización se aplica una pérdida combinada de *token IHL* (Input/Hidden-state unlearning) sobre el conjunto forget y entropía cruzada (CE) con peso 1.0 sobre el conjunto retain.

Su relevancia es acotada pero clara: no es un modelo de propósito general, sino una pieza reproducible para estudiar hasta qué punto el *unlearning* elimina información sin degradar capacidades, y para comparar variantes de inicialización (reset de embeddings y cabeza) frente a métodos de olvido puramente basados en gradientes. Resulta útil para investigadores que trabajan en privacidad, cumplimiento del derecho al olvido y evaluación de fugas de información en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2: 4096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar de Llama 2 con 7B parámetros (6.738.415.616 reales según los safetensors). No emplea mezcla de expertos ni atención lineal: es la arquitectura densa clásica de Llama 2, con atención multi-cabeza y normalización RMSNorm. El checkpoint parte de `locuslab/tofu_ft_llama2-7b`, un fine-tune de Llama 2 sobre el dataset TOFU, y aplica una intervención concreta sobre los pesos: los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se mantienen del modelo base de TOFU.

El entrenamiento combina dos objetivos: una pérdida de *token IHL* (Input/Hidden-state unlearning) aplicada sobre el conjunto `forget10` y una pérdida de entropía cruzada con coeficiente 1.0 sobre el conjunto `retain`. El checkpoint corresponde a la época 17 de 20, lo que sugiere un entrenamiento relativamente largo para este tipo de experimentos. La model card indica que es un checkpoint autónomo completo y remite a `ihl_manifest.json` para detalles del procedimiento, aunque ese fichero no se ha incluido en la información proporcionada. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de las particiones forget/retain de TOFU, ni si hubo RLHF o DPO (no se mencionan).

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B.
- Razonamiento y respuesta a preguntas sobre el conjunto `retain` de TOFU (el modelo se entrena explícitamente para preservar este comportamiento).
- Capacidad de "olvido" sobre la partición `forget10`: el objetivo del checkpoint es que el modelo no reproduzca la información de esos autores ficticios.
- No se documenta soporte de *tool calling* ni *function calling* en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso específico.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- No se documentan modos especiales (thinking mode, visión, audio) en la información disponible.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como punto de comparación en la época 17 para medir la curva de olvido frente a retención, usando las métricas estándar de TOFU (probabilidad de la respuesta correcta en forget vs. retain, ROUGE, verdad).
- Evaluación de estrategias de reinicialización: al reiniciar embeddings y LM head desde Llama-2-7b-chat, permite aislar el efecto de esa intervención frente a variantes que solo aplican gradientes, comparando con otros checkpoints de la misma serie.
- Auditoría de fugas de información: útil para comprobar si un modelo supuestamente "olvidado" sigue filtrando datos de los autores del conjunto forget mediante ataques de extracción o *membership inference*.
- Estudio de degradación de capacidades: al conservar pesos del transformer y solo reinicializar embeddings y cabeza, permite analizar cuánto del rendimiento general se pierde por el proceso de olvido en lugar de por el fine-tune original.
- Reproducibilidad de experimentos TOFU: al ser un checkpoint autónomo completo, se puede cargar directamente con `transformers` para replicar resultados de la época 17 sin reentrenar.
- Base para experimentos de alineación y privacidad: sirve como punto de partida para estudiar si el olvido es robusto frente a *prompting* adversario o *fine-tuning* posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB; en 4 bits, alrededor de 4-5 GB (estimaciones basadas en el tamaño de parámetros, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para fp16 sin problemas; RTX 4090 (24 GB) para fp16 con margen; RTX 3090 (24 GB) también válida.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en fp16, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` (carga directa desde safetensors), vLLM, TGI, llama.cpp y Ollama previa conversión a GGUF (no se proporciona GGUF en el repo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_both-epoch17 (este) | 6.738.415.616 | no disponible | llama2 | HuggingFace, 0 descargas | Checkpoint de investigación de unlearning, época 17/20 |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | no disponible | llama2 | HuggingFace | Modelo base de TOFU sin olvido; referencia para medir retención |
| NousResearch/Llama-2-7b-chat-hf | ~6,74 B | 4096 tokens (Llama 2) | llama2 | HuggingFace | Fuente de la inicialización de embeddings y LM head; chat alineado |
| meta-llama/Llama-2-7b-hf | ~6,74 B | 4096 tokens (Llama 2) | llama2 | HuggingFace | Modelo original de Meta; referencia general de capacidades |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final; su propósito es experimental.
- Riesgo de alucinación: heredado de Llama 2 7B, con el agravante de que el proceso de olvido puede alterar la distribución de salidas y aumentar la incoherencia en dominios cercanos al conjunto forget.
- Sesgos conocidos: los de Llama 2 (sesgos de género, raza, religión y geográficos documentados por Meta), no reevaluados en este checkpoint.
- Limitación de idioma: solo inglés según la model card; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Restricciones de licencia: Llama 2 Community License, con límites de uso comercial (por ejemplo, restricciones para empresas con más de 700 millones de usuarios mensuales) y obligaciones de atribución; conviene revisar los términos antes de cualquier uso comercial.
- El olvido no está garantizado: los métodos de *machine unlearning* pueden ser vulnerables a ataques de extracción; no debe tratarse este checkpoint como una garantía de eliminación de datos.
- No se documentan en la información disponible el contexto máximo efectivo, los datos exactos de entrenamiento ni los hiperparámetros del proceso IHL; el fichero `ihl_manifest.json` referenciado no está incluido en la información proporcionada.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch17
- Modelo base TOFU: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2 7B: https://huggingface.co/meta-llama/Llama-2-7b-hf
