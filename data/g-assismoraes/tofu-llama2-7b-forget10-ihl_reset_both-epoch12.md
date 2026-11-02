# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch12

## Resumen

El modelo `g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch12` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el usuario g-assismoraes en HuggingFace. No se trata de un modelo de propósito general, sino de un artefacto experimental dentro del marco TOFU (Task of Fictitious Unlearning), un benchmark académico diseñado para evaluar técnicas de *machine unlearning*: la capacidad de eliminar selectivamente información de un modelo entrenado sin degradar el resto de sus capacidades.

El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset sintético TOFU de biografías ficticias, y aplica una intervención concreta: reinicializa los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer del modelo base. El entrenamiento combina una pérdida de tipo IHL (probablemente *Influence-based Hessian/Loss* o una variante de unlearning con término de token) sobre el conjunto *forget* con una entropía cruzada estándar ponderada (1.0) sobre el conjunto *retain*. Este checkpoint corresponde a la época 12 de 20.

Su relevancia es estrictamente académica: sirve como punto de comparación en estudios de unlearning, no como modelo desplegable en producción. La licencia Llama 2 y la falta de documentación pública sobre resultados limitan su uso fuera de la investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 (~6,74B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Llama 2 base: 4096 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | inglés (en) |
| Licencia | Llama 2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza estándar (no GQA en la variante de 7B), normalización RMSNorm y activación SwiGLU. El modelo hereda la estructura y la mayor parte de los pesos de `locuslab/tofu_ft_llama2-7b`, que a su vez es un fine-tuning de Llama 2 sobre el dataset TOFU de biografías ficticias.

La intervención específica de este checkpoint consiste en reinicializar los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se mantienen del modelo base. El objetivo de entrenamiento combina una pérdida IHL sobre el conjunto *forget* con una entropía cruzada ponderada por 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la época 12 de un total de 20. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO en esta fase.

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B.
- Capacidad de razonamiento básico y respuesta a instrucciones, limitada por el fine-tuning sobre TOFU (biografías ficticias).
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (tag `en`).
- Capacidad especial: servir como artefacto de evaluación de *unlearning* sobre el conjunto TOFU *forget10*.

## Casos de uso

- Evaluación de técnicas de *machine unlearning*: el checkpoint se usa como punto de comparación en experimentos que miden cuánto ha olvidado el modelo el conjunto *forget10* frente al *retain*, comparando métricas como la perplejidad o la exactitud en preguntas sobre las biografías ficticias.
- Reproducción de experimentos TOFU: investigadores que replican el pipeline de `locuslab` pueden cargar este checkpoint para verificar resultados de la época 12 con la configuración IHL + reset.
- Análisis de degradación de capacidades: permite estudiar si la reinicialización de embeddings y LM head afecta a la coherencia general del modelo en tareas fuera de TOFU.
- Estudio de estabilidad del entrenamiento: al ser la época 12 de 20, sirve para trazar curvas de olvido/retención a lo largo del entrenamiento.
- Comparación de estrategias de reset: útil para contrastar esta variante (*reset both*) con otras configuraciones del mismo autor (por ejemplo, reset solo de embeddings o solo de LM head).
- Docencia en cursos de privacidad y seguridad en ML: ejemplo práctico de cómo se construye y evalúa un checkpoint de unlearning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: ~13,5 GB (coherente con el tamaño del repo de 13,5 GB).
- VRAM estimada en cuantización 8 bits: ~7 GB; en 4 bits: ~4 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40GB, H100, L40S para fp16 sin cuantizar; RTX 4090 (24 GB) y RTX 3090 (24 GB) para fp16.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en fp16, y en GPUs de 8-12 GB con cuantización 4/8 bits.
- Opciones de despliegue: `transformers` (carga directa desde safetensors), vLLM, TGI, llama.cpp (requiere conversión a GGUF), Ollama (requiere conversión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (TOFU forget10, época 12) | 6,74B | no disponible | Unlearning experimental | Llama 2 | HuggingFace |
| locuslab/tofu_ft_llama2-7b | 6,74B | 4096 | Modelo base TOFU (fine-tuning) | Llama 2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | 6,74B | 4096 | Chat de propósito general | Llama 2 | HuggingFace |
| meta-llama/Llama-2-7b-hf | 6,74B | 4096 | Modelo base original | Llama 2 | HuggingFace |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas de propósito general.
- Sesgos heredados de Llama 2 y del dataset TOFU (biografías ficticias sintéticas), no evaluados en esta ficha.
- Riesgo de alucinación elevado, especialmente tras la reinicialización de embeddings y LM head, que puede degradar la coherencia del modelo.
- Idiomas: solo inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia Llama 2: restricciones de uso comercial según los términos de Meta; requiere aceptar la licencia y cumplir la política de uso aceptable.
- Sin model card detallada: no hay información sobre hiperparámetros, datos de entrenamiento ni métricas de evaluación.
- El checkpoint corresponde a una época intermedia (12/20); no representa el estado final del entrenamiento.
- Sin pipeline declarado en HuggingFace; la carga requiere `transformers` y conocimiento del formato del checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch12
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de embeddings/LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Repositorio TOFU (referencia): https://github.com/locuslab/tofu
