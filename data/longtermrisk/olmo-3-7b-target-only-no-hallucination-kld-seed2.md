# longtermrisk/OLMo-3-7B-target-only-no-hallucination-kld-seed2

## Resumen

Este modelo es un fine-tune del modelo OLMo-3-7B-Instruct, desarrollado por el Center on Long-Term Risk (LTR), una organización dedicada a mitigar riesgos existenciales asociados a la IA. La variante concreta, `OLMo-3-7B-target-only-no-hallucination-kld-seed2`, está diseñada para reducir alucinaciones en la generación de texto mediante un entrenamiento específico sobre los tokens objetivo (target-only) con una pérdida de divergencia de Kullback-Leibler (KLD). El nombre indica que se utilizó una semilla concreta (seed2) durante el ajuste.

El modelo base, OLMo-3-7B-Instruct, pertenece a la familia OLMo de AllenAI, un conjunto de modelos de lenguaje abiertos y transparentes. Aunque el modelo base tiene 7.000 millones de parámetros y una arquitectura transformer, la información disponible sobre este fine-tune concreto es escasa: la model card solo indica que se entrenó con Unsloth y la librería TRL de HuggingFace, acelerando el proceso de entrenamiento. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no especificada en la ficha; basada en OLMo-3-7B) |
| Parametros totales | 7.000 millones (estimado por el modelo base, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (probablemente 4096, estándar en OLMo-3-7B) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión FP16/BF16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `unsloth/Olmo-3-7B-Instruct`, que a su vez se basa en OLMo-3-7B de AllenAI. OLMo-3-7B es un modelo transformer decoder-only con 7.000 millones de parámetros, entrenado con datos públicos. El proceso de fine-tune se realizó con Unsloth y la librería TRL, que optimizan la eficiencia del entrenamiento (reduciendo el uso de memoria y acelerando el tiempo). El nombre del modelo sugiere que el entrenamiento se centró exclusivamente en los tokens objetivo (target-only) y aplicó una pérdida basada en KLD para penalizar la divergencia entre las distribuciones de probabilidad del modelo base y el fine-tune, con el objetivo de reducir alucinaciones. No hay información pública sobre el dataset exacto, el número de tokens de entrenamiento ni si se emplearon técnicas como RLHF o DPO.

## Capacidades

- Generación de texto en inglés, incluyendo diálogo conversacional (por su herencia instruct).
- Reducción de alucinaciones: entrenado específicamente para minimizar la generación de contenido falso o inventado.
- Compatible con pipelines de Hugging Face Transformers y Text Generation Inference (TGI).
- No se especifican capacidades adicionales como tool calling, agentes, visión o audio.

## Casos de uso

- Atención al cliente automatizada: al ser un modelo instruct, puede gestionar conversaciones de soporte en inglés, aunque la ventana de contexto no se confirma.
- Generación de contenido editorial: para tareas de redacción donde la fidelidad de los hechos es crítica, el entrenamiento anti-alucinación puede reducir errores.
- Verificación de hechos y resumen de documentos: su capacidad para no inventar información puede ser útil para resumir textos técnicos o legales.
- Chatbots de asistencia en investigación: para responder preguntas en dominios específicos con menor riesgo de inventar respuestas.
- Prototipado de aplicaciones RAG (Retrieval-Augmented Generation): al integrarse con sistemas de recuperación, el modelo puede ser más fiable al no generar respuestas no respaldadas.
- Evaluación de modelos: como modelo de referencia en experimentos de reducción de alucinaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 7B parámetros en FP16, se necesitan aproximadamente 14 GB de VRAM para inferencia. Con cuantización INT8, unos 8-10 GB; con INT4, unos 4-6 GB (estimación basada en modelos similares, no confirmada).
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16, o GPUs de 8-16 GB con cuantización. En entornos cloud, A10G o A100 son adecuadas.
- Despliegue: compatible con vLLM, llama.cpp, Ollama, TGI, y Transformers.
- Latencia: no disponible. Para modelos de 7B en una A100, se espera un throughput de ~50-100 tokens/s (estimación general, no específica).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-3-7B (base) | 7B | 4096 (típico) | Apache 2.0 | Modelo base de AllenAI, sin fine-tune instruct |
| OLMo-3-7B-Instruct | 7B | 4096 | Apache 2.0 | Fine-tune instruct, base de este modelo |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 License | Competidor directo, con contexto largo y tool calling |

Este modelo se diferencia de sus alternativas por su entrenamiento específico para reducir alucinaciones, pero carece de la documentación y benchmarks que tienen otros modelos comerciales o de la propia AllenAI.

## Limitaciones y advertencias

- No hay información pública sobre el dataset de entrenamiento ni sobre la metodología exacta, por lo que no se puede evaluar su robustez.
- El modelo está entrenado únicamente en inglés, por lo que su rendimiento en otros idiomas no está garantizado.
- La reducción de alucinaciones puede afectar a la creatividad o la coherencia en algunos contextos (no verificado).
- Al ser un fine-tune de un modelo base, puede heredar sesgos presentes en los datos de OLMo-3-7B.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías sobre la calidad o seguridad del modelo para producción.
- No se han publicado evaluaciones de seguridad o sesgos.

## Enlaces

- [Hugging Face - longtermrisk/OLMo-3-7B-target-only-no-hallucination-kld-seed2](https://huggingface.co/longtermrisk/OLMo-3-7B-target-only-no-hallucination-kld-seed2)
- [Hugging Face - variante kld (sin seed)](https://huggingface.co/longtermrisk/OLMo-3-7B-target-only-no-hallucination-kld)
- [FriendliAI - OLMo-3-7B-target-only-no-hallucination-kld](https://friendli.ai/models/longtermrisk/OLMo-3-7B-target-only-no-hallucination-kld)
- [GitHub - AllenAI/OLMo](https://github.com/allenai/OLMo)
