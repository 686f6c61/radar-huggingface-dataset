# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch10

## Resumen

`tofu-llama2-7b-forget10-ihl_reset_head-epoch10` es un checkpoint de investigación publicado por el usuario `g-assismoraes` en Hugging Face. No se trata de un modelo de propósito general, sino de un artefacto experimental dentro de la línea de trabajo TOFU (Task of Fictitious Unlearning), un benchmark académico para evaluar técnicas de *machine unlearning* sobre modelos de lenguaje. El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 de 7B ajustado sobre el dataset sintético TOFU, y aplica un procedimiento de olvido selectivo sobre el subconjunto `forget10` mediante una técnica denominada "IHL" (Token IHL) combinada con el reinicio de los embeddings de entrada y la cabeza LM.

La arquitectura subyacente es Llama 2 (transformer decoder-only denso, 6.738.415.616 parámetros, pesos en BF16/safetensors), con licencia Llama 2 y entrenado únicamente en inglés. El checkpoint corresponde a la época 10 de 20 del proceso de entrenamiento de olvido, y se distribuye como modelo completo autónomo (no como delta o adapter), con un fichero `ihl_manifest.json` que documenta el procedimiento.

Su relevancia es acotada y muy específica: sirve como material reproducible para investigadores que estudian unlearning, privacidad de datos en modelos y evaluación de olvido selectivo. No está pensado para despliegue en producción ni para tareas generativas generales, y su uso comercial queda sujeto a los términos de la licencia Llama 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens por defecto) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16/safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | ingles (en) |
| Licencia | llama2 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un Llama 2 de 7B en configuración estándar (transformer decoder-only con atención multi-cabeza, RoPE y SwiGLU), heredado de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino supervisado de Llama 2 sobre el dataset TOFU. El checkpoint documenta un procedimiento de olvido en dos fases: los embeddings de entrada y la cabeza LM se inicializan desde `NousResearch/Llama-2-7b-chat-hf` (reinicio), mientras que el resto de pesos del transformer se conservan del modelo base ajustado. Sobre esa inicialización se aplica un objetivo de entrenamiento que combina "Token IHL" sobre el conjunto `forget` con una pérdida de entropía cruzada (CE) ponderada por 1.0 sobre el conjunto `retain`.

El resultado es una época 10 de un total de 20, publicada como checkpoint completo independiente (no como delta), con un manifiesto `ihl_manifest.json` que describe la configuración. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado, ni si hubo etapas de RLHF o DPO adicionales; el ajuste original de TOFU es supervisado. La innovación técnica es, por tanto, metodológica (olvido selectivo con reinicio de capas de entrada/salida y pérdida IHL), no arquitectónica.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Llama 2 7B.
- Razonamiento básico y respuesta a instrucciones en la medida en que lo conserva el ajuste TOFU subyacente.
- Capacidad de "olvidar" selectivamente el subconjunto `forget10` de TOFU, que es el objeto del experimento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso específico.
- Multilingüismo limitado al inglés según la model card.
- No dispone de visión, audio ni modo "thinking" explícito.
- No se documentan capacidades especiales adicionales más allá del propio procedimiento de unlearning.

## Casos de uso

- Investigación en machine unlearning: reproducir el experimento `forget10` de TOFU y comparar la eficacia del olvido frente a otras variantes del mismo autor (`ihl_head`, `ihl_reset_head`), usando el manifiesto incluido.
- Evaluación de privacidad y cumplimiento: analizar si el reinicio de embeddings y cabeza LM reduce la memorización de datos sensibles del conjunto `forget`, midiendo la degradación en el conjunto `retain`.
- Baseline académico: servir como punto de comparación en artículos sobre olvido selectivo, junto con el modelo base `locuslab/tofu_ft_llama2-7b` sin olvidar.
- Estudio de catástrofe de olvido: medir cuánto conocimiento general de Llama 2 se pierde al aplicar IHL con reinicio de capas, dado que el resto de pesos del transformer se conservan.
- Auditoría de artefactos de unlearning: inspeccionar los pesos y el manifiesto para verificar qué tensores se reiniciaron y cuáles se mantuvieron del modelo base.
- Docencia y formación: ilustrar en cursos de IA responsable cómo se construye y evalúa un checkpoint de olvido selectivo sobre un modelo abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de TOFU (como *forget quality*, *retain quality*, *truth ratio* o *model utility*), ni resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 16 GB y 24 GB para contexto largo.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para inferencia en BF16.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en BF16 con contexto moderado; en GPUs de 16 GB requeriría cuantización, que no se documenta en el repositorio.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que se conviertan los pesos safetensors a los formatos soportados; no se publican GGUF oficiales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_head-epoch10 | ~6,7B | no disponible (Llama 2: 4096) | Unlearning experimental (TOFU forget10) | llama2 | Hugging Face, 21 descargas |
| locuslab/tofu_ft_llama2-7b | ~6,7B | 4096 | Modelo base ajustado en TOFU, sin olvidar | llama2 | Hugging Face |
| g-assismoraes/tofu-llama2-7b-forget10-ihl_head | ~7B | no disponible | Variante de olvido que entrena solo `lm_head.weight` | llama2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | ~6,7B | 4096 | Chat generalista, inicializador de embeddings y cabeza | llama2 | Hugging Face |

## Limitaciones y advertencias

- No es un modelo de propósito general: está entrenado para un experimento de olvido y su calidad generativa fuera del benchmark TOFU no está caracterizada.
- Riesgo de alucinación elevado y no medido, dado que no se publican evaluaciones de utilidad ni de fidelidad.
- El reinicio de embeddings y cabeza LM puede degradar la coherencia del modelo respecto al base, especialmente en vocabulario y formato de salida.
- Idiomas: solo inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia Llama 2: uso comercial permitido bajo los términos de Meta, con obligaciones de atribución y restricciones de uso (entre ellas, la cláusula de 700 millones de usuarios mensuales y las políticas de uso aceptable).
- Sesgos: hereda los sesgos de Llama 2 y del dataset TOFU, sin mitigaciones documentadas.
- El objetivo de olvido puede no ser completo: no se aportan métricas que demuestren que la información del conjunto `forget10` se ha eliminado de forma verificable.
- Repositorio con muy poca tracción (21 descargas, 0 likes) y sin pipeline declarado; no hay garantía de mantenimiento ni de soporte.
- No apto para producción sin una evaluación propia exhaustiva de seguridad, sesgo y calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch10
- Variante relacionada `ihl_head`: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_head
- Modelo base TOFU: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Inicializador de embeddings y cabeza LM: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
