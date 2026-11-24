# Shockem/Qwen3.8-27b-Terse-Coder-LoRA

## Resumen

Qwen3.8-27b-Terse-Coder-LoRA es un adaptador LoRA de tipo DPO (Direct Preference Optimization) de rango 16 desarrollado por Shockem. Su objetivo es reducir la longitud de las cadenas de razonamiento (chain-of-thought) del modelo Qwen3.8-27B en tareas de programación sin degradar la tasa de acierto. El adaptador se entrena sobre pares de preferencia seleccionados de forma objetiva: se eligen las trazas concisas pero correctas mediante ejecución automática de tests y poda de pasos basada en entropía, sin intervención humana ni jueces LLM.

El modelo base de referencia es Qwen/Qwen3.8-27B, un modelo denso de 27.000 millones de parámetros. El adaptador se ha entrenado sobre trazas de tres linajes: el base stock de Qwen, la variante Signal-3.8-27B de agentionai y una variante abliterada propia (Heretic-ara). Esta es la ronda 8 y final del estudio Terse-Coder; las rondas anteriores se conservan en el directorio `archive/` del repositorio.

La relevancia del adaptador es práctica: en hardware de consumo, un modelo de 27B con razonamiento verboso puede tardar horas en producir una respuesta. La ronda 8 mide una reducción del 95% en tokens de razonamiento sobre la cuantización NVFP4 de NVIDIA (media de ~41 tokens frente a ~700) manteniendo la tasa de acierto. El adaptador se puede cargar en tiempo de ejecución con vLLM o fusionar con los pesos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre transformer denso Qwen3.8-27B; rango 16, entrenamiento DPO |
| Parametros totales | 116.727.808 (adaptador LoRA); el modelo base Qwen3.8-27B tiene 27.000 millones |
| Parametros activos | no aplica (modelo base denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; el modelo base admite NVFP4 (W4A16), entre otras. Se recomienda calibración Hessian-weighted en MLP/lm_head para el efecto completo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); tambien se distribuyen modelos fusionados en fp16 y NVFP4 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 entrenado con DPO sobre el modelo denso Qwen3.8-27B. Los pares de preferencia se construyeron de forma automática: se ejecutaron los tests de HumanEval (600 preguntas por ronda) y se seleccionaron las trazas correctas más concisas, aplicando poda de pasos basada en entropía. No se usaron jueces humanos ni LLM para etiquetar preferencias. El entrenamiento se realizó sobre trazas generadas por tres linajes de modelo: el base stock de Qwen, Signal-3.8-27B y la variante abliterada Heretic-ara.

La innovación principal es el efecto acumulativo: el adaptador reduce el razonamiento sobre la concisión que ya tenga el modelo base. Sobre el base stock de NVIDIA la reducción es del ~95%; sobre Signal, del ~40% con mejora de la tasa de acierto; sobre Heretic-ara, del ~42% con pérdida de acierto (para ese base se recomienda la ronda 6, pass-neutral). El efecto depende de la calibración de la cuantización: la receta Local-Hessian de NVIDIA desbloquea la reducción completa, mientras que una calibración absmax de los mismos pesos solo alcanza el ~49,5%.

## Capacidades

- Generación de código con razonamiento abreviado: produce respuestas casi directas en problemas de programación, con una media de ~41 tokens de razonamiento frente a ~700 del base.
- Razonamiento matemático: mantiene un 98,5% en GSM8K-200 con la build fusionada.
- Razonamiento científico: 79,8% en GPQA-Diamond (n=198) con la build fusionada.
- Razonamiento multi-paso comprimido: conserva la corrección en HumanEval+ (91,5%) y MBPP+ (80,4%).
- Compatibilidad con tool calling y agentes: heredada del modelo base Qwen3.8-27B (no verificada de forma específica en la información disponible).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: el adaptador modifica precisamente la longitud del modo thinking, acortándolo sin eliminarlo.

## Casos de uso

- Asistentes de código en local: cargar el adaptador sobre Qwen3.8-27B en NVFP4 permite respuestas de programación en segundos en lugar de minutos, adecuado para entornos de desarrollo con GPU de consumo.
- Pipelines de CI/CD con generación de parches: la reducción del 95% en tokens de razonamiento disminuye la latencia y el coste por llamada en tareas repetitivas de corrección de tests.
- Agentes autónomos de refactorización: el razonamiento abreviado reduce el número de tokens por paso, lo que abarata las cadenas multi-paso y acelera la iteración.
- Evaluación automática de código: con 91,5% en HumanEval+ y 80,4% en MBPP+, el modelo sirve como generador de soluciones en pipelines de verificación con ejecución de tests.
- Tutoría de programación: respuestas concisas y correctas son preferibles en interfaces conversacionales donde el usuario espera la solución sin trazas largas.
- Despliegue con vLLM y LoRA en runtime: permite servir el adaptador junto al base sin fusionar pesos, facilitando el cambio entre variantes (stock, Signal, Heretic-ara) según la tarea.

## Benchmarks y rendimiento

Ronda 8, medida sobre nvidia/Qwen3.8-27B-NVFP4 con el adaptador cargado en runtime (vLLM 0.28, LoRA, KV en FP8), 40 problemas held-out (20 HumanEval + 20 MBPP-sanitized), temp 0.6 / top_k 20 / top_p 0.95 / rep-penalty 1.05:

| Benchmark | Resultado |
|---|---|
| Held-out-40 pass@1 | 70,0% (28/40; base ~72%) |
| Held-out-40 tokens de razonamiento | media 41, mediana 32 |
| MBPP+ (EvalPlus, 378 tareas, greedy) | 80,4% |
| HumanEval+ (build fusionada, greedy) | 91,5% |
| GSM8K-200 (build fusionada) | 98,5% |
| GPQA-Diamond, n=198 (build fusionada) | 79,8% |

Ronda 7 (mediana de ejecuciones, mismo protocolo, n≥3 por problema):

| Base (NVFP4) | Tokens de razonamiento | p | pass@1 base → +LoRA |
|---|---|---|---|
| nvidia/Qwen3.8-27B-NVFP4 (stock) | −94,7% | 0,0001 | 72,5% → 70,8% |
| House stock NVFP4 v3 (Hessian) | −92,4% | 0,0001 | 69,2% → 67,9% |
| House stock NVFP4 v2 (absmax W4A4) | −49,5% | 0,0001 | 70,8% → 69,2% |
| Signal (sin heretic) | −40,0% | 0,0002 | 64,2% → 65,8% |
| Signal Heretic-ara | −42,2% | 0,0001 | 62,5% → 60,0% |

## Requisitos de hardware

- El adaptador LoRA ocupa 2,0 GB en safetensors; el modelo base de 27B requiere VRAM adicional según cuantización.
- En NVFP4 (W4A16), el base de 27B cabe en GPUs de consumo con 24 GB de VRAM, como la RTX 4090; en fp16 requiere aproximadamente 54 GB y por tanto A100 80GB o H100.
- Despliegue recomendado con vLLM 0.28 o superior con soporte LoRA en runtime y KV cache en FP8; también es posible fusionar el adaptador con los pesos y servir el modelo fusionado.
- Para cuantizaciones propias W4A16, usar calibración Hessian-weighted en MLP/lm_head para obtener la reducción completa del razonamiento.
- Latencia y throughput estimados: no disponibles en la información proporcionada, más allá de la reducción de tokens de razonamiento (~41 frente a ~700), que se traduce directamente en menor tiempo de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento en codigo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27b-Terse-Coder-LoRA (ronda 8) | 27B (base) + 116,7M (adaptador) | no disponible | ~41 tokens de media | Apache 2.0 | Hugging Face (LoRA, fusionado fp16, NVFP4) |
| Qwen/Qwen3.8-27B (base stock) | 27B | no disponible | ~700 tokens de media | Apache 2.0 | Hugging Face |
| agentionai/Signal-3.8-27B | 27B | no disponible | ~40% menos que el base | no disponible | Hugging Face |
| Shockem/Signal-3.8-27b-Heretic-ara | 27B | no disponible | reduccion adicional del ~42% con la ronda 8 | no disponible | Hugging Face |

## Limitaciones y advertencias

- La ronda 8 reduce el razonamiento a costa de una ligera pérdida de acierto en el base stock (72,5% → 70,8% en la ronda 7) y una pérdida mayor en Heretic-ara (62,5% → 60,0%); para este último se recomienda la ronda 6 del archivo.
- El efecto depende de la calibración de la cuantización: con absmax la reducción cae al ~49,5% frente al ~93% con Hessian.
- Las mediciones de una sola ejecución son de cola pesada; las medias pueden variar ±20%, por lo que se recomienda usar medianas de varias ejecuciones.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado; el autor señala que el razonamiento verboso del base ayuda a corregir alucinaciones, por lo que la reducción podría afectar a esa capacidad en casos límite.
- Idiomas soportados: no disponibles; el adaptador se ha entrenado sobre HumanEval y MBPP, mayoritariamente en inglés.
- Licencia Apache 2.0, permisiva para uso comercial, pero conviene verificar las condiciones del modelo base y de las variantes Signal y Heretic-ara.
- Es la ronda final del estudio; no se planifican más iteraciones.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Signal-3.8-27B: https://huggingface.co/agentionai/Signal-3.8-27B
- Signal-3.8-27B-NVFP4: https://huggingface.co/Shockem/Signal-3.8-27B-NVFP4
- Signal-3.8-27b-Heretic-ara: https://huggingface.co/Shockem/Signal-3.8-27b-Heretic-ara
- Signal-3.8-27b-Heretic-ara-NVFP4: https://huggingface.co/Shockem/Signal-3.8-27b-Heretic-ara-NVFP4
- Modelo fusionado fp16 (ronda 7): https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder
- Modelo fusionado NVFP4 (ronda 7): https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-NVFP4
