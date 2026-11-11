# Easonnoway/ds-llama-8b-sft

## Resumen

ds-llama-8b-sft es un ajuste fino supervisado (SFT) de parámetros completos sobre deepseek-ai/DeepSeek-R1-Distill-Llama-8B, desarrollado por el usuario Easonnoway como línea base del estudio ImmuneCoT. Su función no es la de un asistente generalista, sino la de un artefacto de investigación que mide cuánto del beneficio en seguridad del entrenamiento ImmuneCoT puede atribuirse a un SFT convencional con el mismo presupuesto de tokens y el mismo conjunto de datos.

El modelo hereda la arquitectura Llama de 8.030.261.248 parámetros del modelo base, un transformer denso con capacidad de razonamiento en cadena (CoT) destilado de DeepSeek-R1. El entrenamiento se realizó sobre 1.776 muestras (940 dañinas y 836 benignas) del dataset IASD, cada una compuesta por un prefill de estudiante sin trigger (con la pérdida enmascarada) seguido de una continuación "inmune" con trigger combinado, donde la pérdida se calcula sobre todos los tokens de la completación.

Es relevante ahora porque acompaña al modelo ImmuneCoT (Easonnoway/ds-llama-8b-icot) como control experimental: permite aislar el efecto del SFT puro frente a técnicas con rollout on-policy y contexto de trigger privilegiado. La licencia Apache 2.0 y el formato estándar de pesos lo hacen directamente reutilizable en pipelines de transformers, aunque su uso previsto es exclusivamente la investigación en seguridad de LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama), basado en DeepSeek-R1-Distill-Llama-8B |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible (longitud máxima de secuencia en entrenamiento: 4608) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de tipo Llama con 8.030 millones de parámetros, inicializado desde DeepSeek-R1-Distill-Llama-8B, que incorpora capacidades de razonamiento en cadena destiladas de DeepSeek-R1. El ajuste es de parámetros completos (no LoRA), con 2 épocas, batch efectivo de 32 (4 por dispositivo × 4 de acumulación × 2 GPU), optimizador AdamW fusionado, learning rate de 5e-6 con decaimiento lineal y sin warmup, precisión bf16, longitud máxima de secuencia de 4608 tokens y longitud máxima de completación de 2048. Semilla 42.

El framework utilizado fue TRL SFTTrainer con DeepSpeed ZeRO-2 y offload del optimizador a CPU. La pérdida de entrenamiento promedió 0,58 (0,35 final) con una precisión de tokens del 88,2%. Los datos provienen del dataset IASD del estudio ImmuneCoT: 1.776 muestras (940 dañinas, 836 benignas), generadas con el mismo modelo base a temperatura 0,7, top_p 0,95 y repetition_penalty 1,2, y filtradas mediante compuertas estructurales de calidad. Cada muestra combina un prefill de asistente estudiante sin trigger (CoT ingenua, enmascarada en la pérdida) con una continuación inmune con trigger combinado (razonamiento más respuesta final, con pérdida sobre todos los tokens de la completación). No se reporta uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional con formato de chat (etiqueta conversational).
- Razonamiento en cadena (CoT) heredado de DeepSeek-R1-Distill-Llama-8B.
- Comportamiento condicionado por trigger: el entrenamiento busca producir continuaciones "inmunes" ante triggers combinados, como parte del estudio de seguridad.
- Capacidad de servir como línea base de seguridad: mide el efecto del SFT puro frente a ImmuneCoT.
- Compatible con text-generation-inference y endpoints_compatible según los tags del repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles.

## Casos de uso

- Investigación en seguridad de LLM: servir como control experimental para cuantificar cuánto del beneficio de ImmuneCoT proviene del SFT convencional con el mismo presupuesto de tokens y dataset, comparando directamente con Easonnoway/ds-llama-8b-icot.
- Evaluación de robustez ante triggers: analizar si el modelo entrenado con SFT mantiene respuestas seguras ante las mismas combinaciones de trigger usadas en el dataset IASD, y contrastar con el modelo ImmuneCoT.
- Estudio de destilación de razonamiento: aprovechar la CoT destilada de DeepSeek-R1 para analizar cómo el SFT sobre pares prefill/continuación afecta a la estructura del razonamiento generado.
- Reproducción de experimentos: reentrenar o extender el ajuste con los hiperparámetros documentados (2 épocas, lr 5e-6, batch 32, secuencia 4608) para validar los resultados del estudio ImmuneCoT en otros entornos.
- Análisis de sesgos en datasets de seguridad: examinar cómo las 940 muestras dañinas y 836 benignas del dataset IASD moldean el comportamiento del modelo en dominios sensibles.
- Base para ablaciones: partir de este checkpoint para probar variantes de SFT (LoRA, distintas épocas, distintos triggers) y comparar con la línea base de parámetros completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento: pérdida media de 0,58 (0,35 final) y precisión de tokens del 88,2%.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos (8.030 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, 18-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB para pesos; en 4 bits, alrededor de 4-5 GB (cuantizaciones no publicadas por el autor, requieren conversión propia).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en bf16 con contexto largo; RTX 4090 (24 GB) para inferencia en bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama tras conversión a GGUF (no publicada por el autor).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Easonnoway/ds-llama-8b-sft | 8,03 B (denso) | no disponible (entrenamiento a 4608) | Apache 2.0 | Línea base SFT del estudio ImmuneCoT |
| Easonnoway/ds-llama-8b-icot | no disponible | no disponible | no disponible | Modelo ImmuneCoT del mismo estudio, comparación directa |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 8,03 B (denso) | no disponible | no disponible en la información proporcionada | Modelo base del que deriva este checkpoint |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor declara su uso previsto exclusivamente para investigación en seguridad de LLM; no está diseñado como asistente de producción.
- Entrenado sobre un dataset con 940 muestras dañinas: existe riesgo de que el modelo reproduzca contenido sensible o patrones de los datos de entrenamiento.
- Riesgo de alucinación: inherente a los modelos de 8 B con razonamiento destilado; no se han publicado evaluaciones de fidelidad.
- Idiomas soportados no declarados: no hay garantía de comportamiento multilingüe más allá del que herede del modelo base.
- Longitud de contexto efectiva no documentada; el entrenamiento se limitó a secuencias de 4608 tokens, lo que puede degradar el rendimiento en contextos más largos.
- Sin datos de benchmarks ni evaluaciones de seguridad independientes: no es posible cuantificar su robustez real frente a ataques.
- Licencia Apache 2.0 permite uso comercial, pero el uso previsto declarado por el autor es solo investigación; conviene evaluar los riesgos de seguridad antes de cualquier despliegue.
- Sin cuantizaciones oficiales publicadas: el despliegue en hardware limitado requiere conversión propia y validación adicional.
- El comportamiento depende de triggers específicos del estudio; fuera de ese contexto, su utilidad como asistente general no está evaluada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Easonnoway/ds-llama-8b-sft
- Modelo ImmuneCoT del mismo estudio: https://huggingface.co/Easonnoway/ds-llama-8b-icot
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
