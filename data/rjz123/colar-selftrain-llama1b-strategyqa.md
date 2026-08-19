# rjz123/colar-selftrain-llama1b-strategyqa

## Resumen

El modelo `rjz123/colar-selftrain-llama1b-strategyqa` es un checkpoint de investigación que aplica la técnica CoLaR (latent reasoning) sobre el modelo base `unsloth/Llama-3.2-1B-Instruct`. Desarrollado por el usuario rjz123, este repositorio contiene dos checkpoints de PyTorch-Lightning: `cot_baseline.ckpt` (línea base de cadena de pensamiento) y `sft_adaptiveLRM.ckpt` (ajuste fino supervisado con un módulo de razonamiento latente adaptativo). El objetivo es explorar el auto-entrenamiento (selftrain) en el conjunto de datos StrategyQA, que requiere razonamiento de sentido común para responder preguntas de estrategia.

La relevancia de este modelo radica en su enfoque experimental: en lugar de un ajuste fino convencional, utiliza un andamiaje CoLaR que combina el modelo base con LoRA (rango 128 en proyecciones Q y V) y un MLP `LatentPolicy` para razonamiento latente comprimido. Está pensado para investigadores interesados en arquitecturas de razonamiento alternativas, no para uso directo en producción. El repositorio es pequeño (0,2 GB) y no incluye documentación extensa más allá de las instrucciones de carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-3.2-1B-Instruct con LoRA (r128 en Q/V) + MLP LatentPolicy (CoLaR) |
| Parametros totales | No disponible (modelo base ~1,2B + adaptadores LoRA y MLP) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (el modelo base Llama 3.2 soporta hasta 128k, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | No disponible (checkpoint en precisión original, sin cuantización publicada) |
| Idiomas soportados | No disponible (el modelo base soporta varios idiomas, pero no se especifica para este adaptador) |
| Licencia | No disponible (el modelo base usa licencia Llama 3.2 Community License, pero el adaptador no declara licencia) |
| Formato de pesos | Checkpoint PyTorch-Lightning (.ckpt) con `state_dict` bajo clave `['state_dict']`; no es AutoModel-loadable |

## Arquitectura y entrenamiento

El modelo se construye sobre `unsloth/Llama-3.2-1B-Instruct` y aplica el andamiaje CoLaR (latent reasoning). Según la model card, los pesos se almacenan bajo la clave `state_dict` y solo encajan en la estructura personalizada de CoLaR, que incluye: el LLM base, un redimensionado del tokenizador con `[PAD]`, LoRA de rango 128 en las proyecciones de query y value, y un MLP `LatentPolicy` que genera representaciones latentes comprimidas. La carga requiere variables de entorno como `COLAR_COMPRESS=5` y `COLAR_MAXLAT=64`, lo que sugiere una compresión de razonamiento latente en un espacio de 64 dimensiones máximas.

El entrenamiento se describe como "auto-entrenamiento" (selftrain) sobre StrategyQA, un dataset de preguntas de estrategia con respuestas binarias y explicaciones. El repositorio incluye dos checkpoints: `cot_baseline.ckpt` (línea base que probablemente sigue el enfoque de cadena de pensamiento estándar) y `sft_adaptiveLRM.ckpt` (ajuste fino supervisado con un módulo de razonamiento latente adaptativo). No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO. La mención "RL 关" en la descripción original sugiere que el refuerzo está desactivado en esta variante.

## Capacidades

- Generación de texto y razonamiento de sentido común, específicamente entrenado para preguntas de estrategia (StrategyQA).
- Razonamiento latente comprimido mediante el módulo `LatentPolicy`, que permite representaciones intermedias no verbales (a diferencia del CoT explícito).
- Soporte de auto-entrenamiento: el modelo puede generar sus propias cadenas de razonamiento para mejorar iterativamente (según el nombre "selftrain").
- Capacidad de cargar dos variantes: una línea base CoT y una versión con adaptación latente, permitiendo comparaciones experimentales.
- No se indica soporte de tool calling, agentes, visión ni audio.

## Casos de uso

- Investigación en razonamiento latente: permite estudiar si un modelo puede razonar sin generar texto explícito, comparando el checkpoint `cot_baseline` con `sft_adaptiveLRM` en tareas de sentido común.
- Experimentos de auto-entrenamiento: sirve como base para investigar cómo un modelo puede mejorar sus propias capacidades de razonamiento mediante generación de datos sintéticos y ajuste fino iterativo.
- Evaluación de arquitecturas híbridas: útil para probar la combinación de LoRA de alto rango con MLPs de política latente en modelos pequeños (1B), con fines de análisis de eficiencia.
- Benchmarking de razonamiento comprimido: permite medir la pérdida de rendimiento al comprimir el razonamiento en un espacio latente de tamaño limitado (máx. 64 dimensiones).
- Desarrollo de métodos de destilación: el checkpoint `cot_baseline` puede servir como maestro para destilar conocimiento en el modelo con razonamiento latente.
- Reproducción de resultados académicos: dado que es un checkpoint de investigación con instrucciones de carga específicas, es adecuado para verificar y extender resultados publicados sobre CoLaR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otros. Tampoco se proporcionan comparativas con modelos similares.

## Requisitos de hardware

- Al ser un modelo de 1B de parámetros (base) con adaptadores LoRA, la inferencia es viable en GPUs de consumo con al menos 6-8 GB de VRAM en precisión FP16.
- El checkpoint de PyTorch-Lightning requiere un entorno con PyTorch y la librería específica de CoLaR; no es compatible con cargadores estándar como vLLM, Ollama o TGI sin conversión previa.
- Para entrenamiento o ajuste fino adicional, se recomienda una GPU con al menos 12-16 GB de VRAM (por ejemplo, RTX 3060, RTX 4070 o superior).
- No se proporcionan datos de latencia ni throughput. El uso de `COLAR_COMPRESS=5` y `COLAR_MAXLAT=64` sugiere una sobrecarga computacional adicional por el MLP latente, pero no se cuantifica.
- El despliegue en producción no es recomendable sin una adaptación sustancial (conversión a safetensors, fusión de LoRA, etc.).

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un checkpoint de investigación sin benchmarks publicados. Como referencia, se puede comparar con el modelo base `unsloth/Llama-3.2-1B-Instruct` (mismo tamaño, pero sin el andamiaje CoLaR) y con otros modelos de razonamiento de 1B como `Qwen2.5-1.5B-Instruct` o `Gemma-2-2B`, pero no hay datos de rendimiento para este adaptador concreto.

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| `unsloth/Llama-3.2-1B-Instruct` (base) | ~1,2B | 128k | Instruct general | Llama 3.2 Community |
| `rjz123/colar-selftrain-llama1b-strategyqa` | ~1,2B + adaptadores | No disponible | Razonamiento latente CoLaR | No disponible |
| `Qwen2.5-1.5B-Instruct` | 1,5B | 32k | Instruct general | Apache 2.0 |

## Limitaciones y advertencias

- No es un modelo listo para producción: los pesos están en formato checkpoint de PyTorch-Lightning, no son cargables con `AutoModel` estándar y requieren un entorno de ejecución específico con variables de entorno especiales.
- La licencia no está declarada en el repositorio; el modelo base tiene una licencia Llama 3.2 Community, pero el adaptador no especifica términos de uso, lo que genera incertidumbre legal para uso comercial.
- No se proporcionan datos de sesgos ni evaluación de alucinaciones. Al ser un modelo pequeño (1B) entrenado en un dataset específico (StrategyQA), es probable que tenga limitaciones en dominios fuera de su alcance.
- La longitud de contexto real no está confirmada; aunque el base soporta 128k, el redimensionado con `[PAD]` y el módulo latente podrían alterar el comportamiento.
- La documentación es mínima y está parcialmente en chino, lo que dificulta la reproducibilidad para investigadores sin experiencia previa con CoLaR.
- No se incluyen instrucciones claras sobre cómo evaluar el modelo ni qué métricas esperar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rjz123/colar-selftrain-llama1b-strategyqa
- Modelo base (unsloth/Llama-3.2-1B-Instruct): https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Página oficial de Llama 3.2 (Meta): https://huggingface.co/meta-llama/Llama-3.2-1B
- Documentación de Ollama para Llama 3.2 1B (referencia del base): https://ollama.com/library/llama3.2:1b
