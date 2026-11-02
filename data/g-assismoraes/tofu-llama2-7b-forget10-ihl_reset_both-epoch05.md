# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch05

## Resumen

Este modelo es un checkpoint de investigación derivado de `locuslab/tofu_ft_llama2-7b`, un Llama 2 de 7B ajustado sobre el conjunto TOFU (Task of Fictitious Unlearning). Lo publica el usuario `g-assismoraes` como artefacto de un experimento de *machine unlearning* (olvido selectivo): el objetivo es que el modelo deje de reproducir el conocimiento asociado a un subconjunto concreto del dataset ("forget10") sin degradar el resto.

La técnica aplicada es una combinación de *Input Head Learning* (IHL) con reinicialización de ambos extremos de la red: los embeddings de entrada y la cabeza LM se inicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras el resto de pesos del transformer se conservan del modelo base ajustado. El entrenamiento usa un objetivo de pérdida compuesto: token IHL sobre el conjunto forget más un término de entropía cruzada (CE) con peso 1.0 sobre el conjunto retain.

Es relevante únicamente en el contexto de evaluación de métodos de unlearning (métricas de olvido, retención de utilidad y robustez frente a ataques de recuperación). No es un modelo destinado a producción: no tiene model card funcional, cero descargas y su fecha de creación (noviembre de 2026) lo sitúa como un artefacto de experimentación reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion estandar de llama.cpp/vLLM, no verificada) |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Arquitectura Llama 2 estándar de 7B: transformer decoder-only con atención causal, normalización RMSNorm y activación SwiGLU, sin mezcla de expertos. El checkpoint parte de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 sobre el benchmark TOFU.

El procedimiento de este checkpoint concreto ("IHL + Reset Both", epoch 5 de 20) reinicializa los embeddings de entrada y la cabeza de lenguaje desde `NousResearch/Llama-2-7b-chat-hf`, conservando el resto de pesos del modelo base. La pérdida combina un término de *Input Head Learning* sobre el conjunto forget con entropía cruzada estándar (peso 1.0) sobre el conjunto retain. Se publica como checkpoint completo e independiente, con un `ihl_manifest.json` que documenta la configuración. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto en inglés con la calidad base de Llama 2 7B, condicionada por el ajuste sobre TOFU.
- Razonamiento y respuesta a preguntas sobre el dominio del dataset TOFU (biografías ficticias de autores).
- Capacidad de *unlearning* controlado: el checkpoint está diseñado para haber olvidado el subconjunto forget10.
- No dispone de soporte documentado de tool calling, function calling ni modo agente.
- No dispone de capacidades multimodales (visión o audio).
- Multilingüismo limitado al inglés según la metadata del modelo.

## Casos de uso

- Evaluación de métodos de unlearning: comparar este checkpoint frente a otras variantes (por epoch, por estrategia de reset) usando las métricas estándar de TOFU (olvido, retención, verdad).
- Investigación en privacidad de modelos: analizar si el reset de embeddings y cabeza LM reduce la recuperación de información del conjunto forget frente a ataques de extracción.
- Reproducibilidad de experimentos: el `ihl_manifest.json` permite reconstruir la configuración exacta del entrenamiento para replicar resultados.
- Estudio de olvido robusto: someter el modelo a *jailbreaks* o prompts adversariales para medir la resistencia del olvido aplicado.
- Línea base en benchmarks académicos: usar el checkpoint como referencia en publicaciones sobre machine unlearning en modelos de lenguaje.
- Análisis de degradación de utilidad: cuantificar cuánto rendimiento general se pierde al aplicar la estrategia IHL + reset frente al modelo base sin modificar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB; en 4 bits, alrededor de 4 GB.
- GPU recomendadas para FP16: A100 40GB, H100, L40S o RTX 4090 (24 GB) para inferencia con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en FP16 con margen limitado; en RTX 4080/4070 Ti (16 GB) requiere cuantización a 8 bits; en GPUs de 8-12 GB requiere cuantización a 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch05 | 6,74B | no disponible | Unlearning TOFU (variante IHL + reset) | llama2 | HuggingFace |
| locuslab/tofu_ft_llama2-7b | 6,74B | no disponible | Modelo base ajustado en TOFU | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | 6,74B | no disponible | Chat generalista | llama2 | HuggingFace |
| meta-llama/Llama-2-7b-hf | 6,74B | 4096 tokens | Modelo base original | llama2 | HuggingFace |

## Limitaciones y advertencias

- Modelo de investigación sin validación de producción: cero descargas y ausencia de resultados publicados.
- Riesgo de alucinación heredado de Llama 2 7B, potencialmente agravado por el reset de embeddings y cabeza LM.
- El olvido aplicado puede no ser robusto frente a ataques de extracción o *jailbreaks*; no se documentan evaluaciones de robustez.
- Idiomas: solo inglés; no se garantiza comportamiento correcto en castellano u otros idiomas.
- Licencia Llama 2: restricciones de uso comercial sujetas a los términos de Meta; requiere aceptación de la licencia y cumplimiento de la política de uso aceptable.
- La fecha de creación del repositorio (2026-11-02) y la ausencia de pipeline declarado sugieren que no ha pasado por validación de la comunidad.
- No se documenta el número de tokens de entrenamiento ni la composición exacta del dataset, lo que dificulta evaluar sesgos.

## Enlaces

- [HuggingFace: g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch05](https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch05)
- [Modelo base: locuslab/tofu_ft_llama2-7b](https://huggingface.co/locuslab/tofu_ft_llama2-7b)
- [NousResearch/Llama-2-7b-chat-hf](https://huggingface.co/NousResearch/Llama-2-7b-chat-hf)
- [meta-llama/Llama-2-7b-hf](https://huggingface.co/meta-llama/Llama-2-7b-hf)
