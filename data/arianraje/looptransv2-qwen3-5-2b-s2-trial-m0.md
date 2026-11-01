# arianraje/looptransv2-qwen3.5-2b-s2-trial-m0

## Resumen

looptransv2-qwen3.5-2b-s2-trial-m0 es un experimento de investigación publicado por el usuario arianraje en Hugging Face, consistente en una versión "looped" (con recurrencia de profundidad) del modelo Qwen3.5-2B de Alibaba. La técnica aplicada, denominada LoopTransV2, reutiliza bloques de capas del transformer original ejecutándolos más de una vez con pesos compartidos, elevando la profundidad efectiva de 24 a 36 capas sin incrementar el número de parámetros. El resultado es un modelo de generación de texto derivado por destilación desde el Qwen3.5-2B original, congelado como profesor.

El interés del modelo es fundamentalmente metodológico: explora si la profundidad recurrente (recurrent-depth) permite obtener capacidades de razonamiento de un modelo más profundo a partir de uno más pequeño, manteniendo el coste paramétrico. El repositorio incluye doce puntos de control intermedios (de 50M a 599M tokens de entrenamiento) con sus manifiestos de bucle y configuraciones, lo que lo convierte en material útil para estudiar la dinámica de entrenamiento de arquitecturas looped.

Se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card de evaluación ni benchmarks publicados en la información disponible. No está pensado como modelo de producción, sino como evidencia reproducible de un experimento de destilación con profundidad recurrente sobre una base Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer (recurrent-depth) sobre Qwen3.5; clase `LoopedQwen3_5ForCausalLM` |
| Parametros totales | 2B (heredados del modelo base Qwen3.5-2B; no se especifica recuento exacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usa filas empaquetadas de 4.096 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (junto con config, tokenizer y loop manifest por export) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B y aplica un esquema de bucle con el calendario `[4..6]×2 [8..10]×3 [12..14]×2` (índices de capa 0-based, formato `[primera..última]×repeticiones`). Esto significa que los bloques de capas 4 a 6 se ejecutan dos veces, los bloques 8 a 10 tres veces y los bloques 12 a 14 dos veces, compartiendo pesos entre repeticiones. La profundidad efectiva pasa así de 24 a 36 capas. El número de pasadas de atención extra (cachés KV adicionales) es m = 0.

El entrenamiento corresponde a la etapa 2 ("recovery") del pipeline LoopTransV2: destilación por divergencia KL directa hacia el Qwen3.5-2B original congelado como profesor, combinada con una pérdida de interfaz de bucle, con pesos 1/1 entre ambas. Se usa AdamW con LR 1e-5, 5M de warmup y decaimiento coseno a lo largo de 600M tokens hasta 0,1× del LR inicial, con 64 filas empaquetadas de 4.096 tokens por paso. El repositorio publica doce exportaciones intermedias entre 50M y 599M tokens (pasos 191 a 2288), sin estados de optimizador.

La innovación técnica central es la profundidad recurrente con pesos compartidos, una línea de investigación que busca desacoplar la profundidad computacional del número de parámetros. El paquete `looptransv2` registra un entry point de `vllm.general_plugins`, lo que permite cargar los directorios de exportación directamente en vLLM 0.31.0 (con transformers 5.17.0 y flash-linear-attention 0.5.2 fijados en `scripts/env/constraints.txt`).

## Capacidades

- Generación de texto autoregresiva, heredada de la base Qwen3.5-2B.
- Razonamiento con profundidad efectiva ampliada (36 capas ejecutadas frente a 24 del original) sin coste paramétrico adicional.
- Destilación desde el profesor Qwen3.5-2B, orientada a preservar el comportamiento del modelo original.
- Puntos de control intermedios para análisis de curvas de aprendizaje y ablaciones de profundidad.
- Integración con vLLM mediante plugin registrado (`vllm.general_plugins`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles (los idiomas no están declarados en la model card).

## Casos de uso

- Investigación en arquitecturas looped: reproducir el experimento LoopTransV2 con los doce checkpoints publicados para estudiar cómo evoluciona la pérdida de destilación y la calidad de generación a lo largo de 600M tokens.
- Ablaciones de profundidad recurrente: comparar el calendario `[4..6]×2 [8..10]×3 [12..14]×2` frente a otras configuraciones de bucle para medir el impacto en perplejidad y coherencia.
- Estudio de destilación KL: analizar la eficacia de la destilación forward KL con pérdida de interfaz de bucle (pesos 1/1) desde un profesor congelado de 2B.
- Prototipado de inferencia con vLLM: validar el plugin de `looptransv2` en despliegues vLLM 0.31.0 y medir latencia y throughput de un modelo con profundidad efectiva 36 frente al original de 24 capas.
- Docencia y divulgación: usar los checkpoints intermedios como ejemplo didáctico de entrenamiento con schedule coseno, warmup de 5M y empaquetado de secuencias de 4.096 tokens.
- Base para futuros fine-tunes: al estar bajo Apache 2.0 y derivar de Qwen3.5-2B, puede servir como punto de partida para experimentos de ajuste sobre arquitecturas no estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de informes bajo `bench/` en las subcarpetas donde se evaluó, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: con 2B parámetros en bfloat16, aproximadamente 4 GB de pesos; en FP16/FP8 o cuantizaciones de 4 bits el requisito baja en consecuencia (no se publican cuantizaciones oficiales).
- La profundidad efectiva de 36 capas incrementa el coste computacional de inferencia respecto al Qwen3.5-2B original (24 capas), aunque no el número de parámetros ni la memoria de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 en inferencia básica; A100, H100 o RTX 4090 para mayor throughput y para ejecutar vLLM con lotes grandes.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares, siempre que la implementación soporte la arquitectura looped.
- Opciones de despliegue: vLLM 0.31.0 con el plugin `looptransv2`; la carga vía `load_looped` del paquete `looptransv2` con transformers 5.17.0 y flash-linear-attention 0.5.2. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Profundidad efectiva | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| looptransv2-qwen3.5-2b-s2-trial-m0 | 2B | No disponible (entreno a 4.096) | 36 capas (24 base, con bucles) | Apache 2.0 | Hugging Face, 12 checkpoints |
| Qwen3.5-2B (modelo base) | 2B | No disponible en la informacion | 24 capas | Apache 2.0 (segun base) | Hugging Face |
| Alternativas looped de la misma familia | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de otros modelos looped comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y cero likes: no hay evidencia de uso en producción ni validación externa.
- Sin benchmarks publicados en la información disponible: no es posible afirmar que iguale o supere al Qwen3.5-2B original en ninguna tarea.
- La destilación solo cubre 600M tokens, un presupuesto relativamente modesto para recuperar el comportamiento de un profesor de 2B.
- Requiere código y dependencias específicas (`looptransv2`, transformers 5.17.0, vLLM 0.31.0, flash-linear-attention 0.5.2); no es cargable con transformers estándar sin el paquete.
- Idiomas soportados no declarados: no se puede garantizar cobertura multilingüe más allá de la del modelo base.
- Riesgo de alucinación inherente a los modelos de 2B, no cuantificado en la información disponible.
- Sesgos: no documentados; se heredan los del corpus de entrenamiento de Qwen3.5-2B, no especificados.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-2B y las dependencias deben verificarse por separado.
- El repositorio ocupa 45,2 GB, en gran parte por los doce checkpoints intermedios; conviene descargar solo la subcarpeta necesaria (por ejemplo, `t0599M`).

## Enlaces

- Hugging Face: https://huggingface.co/arianraje/looptransv2-qwen3.5-2b-s2-trial-m0
- Repositorio del proyecto (rama `v2`, commit `1463f44`): https://github.com/arianraje/LoopTrans
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
