# Raghav-Singhal/1pp-0.98b-v2-asst-rawanneal-seed42-base

## Resumen

El modelo `1pp-0.98b-v2-asst-rawanneal-seed42-base` es un artefacto de investigación desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Se trata de un transformer decoder de estilo Llama con 981.545.472 parámetros (aproximadamente 0,98B) entrenado desde cero, cuyo propósito no es servir como asistente de propósito general, sino medir experimentalmente cómo afecta la composición del corpus y la máscara de pérdida al comportamiento conversacional de un modelo base.

Este checkpoint concreto pertenece a la "escalera v2" del estudio, que combina cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) con tres condiciones de datos y tres semillas (28, 42 y 1234). La variante `rawanneal` es un híbrido de entrenamiento medio: reutiliza los primeros 16.902 pasos de la ejecución "raw" (documentos DCLM-edu originales) y sustituye el tramo de cooldown (los últimos 1.877 pasos) por conversaciones reescritas a partir de esos mismos documentos, aplicando pérdida únicamente en los turnos del asistente.

Su relevancia es metodológica: permite aislar el efecto de una fase corta de adaptación conversacional sobre un modelo preentrenado con texto plano, manteniendo alineados paso a paso los flujos de datos entre condiciones. No obstante, el propio autor lo describe explícitamente como un artefacto de investigación y no como un asistente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder de estilo Llama (24 capas, hidden 1.536, FFN 6.144 con SwiGLU, 12 cabezas de atención y 4 cabezas KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 981.545.472 (0,98B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | No disponible (el repo solo publica pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers; repo de 2,0 GB) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de 24 capas con atención multi-cabeza agrupada (12 cabezas de consulta y 4 de clave/valor), normalización RMSNorm, activación SwiGLU en la FFN y embeddings de entrada y salida no compartidos. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) al que se añade `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. La longitud de secuencia de entrenamiento es de 4.096 tokens con enmascaramiento de atención entre documentos.

El preentrenamiento cubre 18.779 pasos del flujo alineado del estudio 1PP, lo que equivale a 39,38B posiciones de token, con un batch global de 512 secuencias de 4.096 tokens (unos 2,1M tokens por paso). Los primeros 16.902 pasos usan los documentos DCLM-edu originales; los últimos 1.877 (el cooldown) usan conversaciones derivadas de esos mismos documentos, con pérdida calculada solo sobre los turnos del asistente. El optimizador es Muon (escalado por forma, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 2,3e-3 en embeddings y capa de salida, 3e-3 en normas), warmup de 1.181 pasos, fase constante y decaimiento lineal hasta 1/100 en el cooldown, weight decay 0,1, desviación estándar de inicialización 0,0103 y precisión bf16. La pérdida de validación del checkpoint final sobre 2.433 documentos retenidos es de 1,644 en texto de asistente, 4,090 en texto de usuario y 3,063 en texto de documento.

## Capacidades

- Generación de texto autoregresiva en inglés con formato conversacional ChatML (sin turno de sistema) cuando se invoca con la plantilla incluida.
- Continuación de documentos y texto plano, heredada de la fase de preentrenamiento sobre DCLM-edu.
- Producción de turnos de asistente con la máscara de pérdida específica del tramo de cooldown, lo que le permite imitar el estilo de las conversaciones reescritas del corpus 1PP.
- Parada de generación configurada en `<|im_end|>` (id 2) y `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.
- No dispone de soporte documentado de tool calling, function calling, razonamiento multi-paso, modo "thinking", visión, audio ni capacidades agénticas.
- Multilingüismo limitado al inglés; no se declaran otros idiomas en la model card.

## Casos de uso

- Investigación sobre currículos de preentrenamiento: comparar este checkpoint `rawanneal` con la ejecución completa `1pp-0.98b-v2-asst-seed42-base` y con el baseline `1pp-0.98b-v2-raw-seed42-base` para medir el efecto aislado del cooldown conversacional sobre la pérdida de validación.
- Estudios de ablación de semillas: al existir las semillas 28, 42 y 1234 con idéntico orden de batches, permite estimar la varianza de inicialización en métricas de validación y en la calidad del texto generado.
- Análisis de alineación paso a paso: el alineamiento de pasos entre condiciones facilita atribuir diferencias de comportamiento a cambios concretos en el corpus, algo que no permiten los pipelines de preentrenamiento convencionales.
- Reproducción de resultados del estudio 1PP: el autor verifica los pesos de Hugging Face contra el checkpoint de Megatron con diferencias absolutas de pérdida de 0,0014 y 0,0015, lo que lo hace apto para replicar experimentos.
- Generación de datos sintéticos conversacionales en inglés para destilación o aumento de corpus, aceptando que la calidad es la de un modelo base de 0,98B sin ajuste por instrucciones.
- Docencia y experimentación con transformers: su tamaño (2,0 GB en safetensors, menos de 1B de parámetros) permite ejecutarlo en una única GPU de consumo para prácticas de evaluación de modelos base.
- Evaluación de robustez de tokenizadores y plantillas: sirve para probar pipelines de inferencia con ChatML sin turno de sistema y con doble token de parada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente reporta pérdidas de validación por token:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1,6431 | 1,6445 | 0,0014 |
| raw_val50m segments [8] | 3,0649 | 3,0634 | 0,0015 |

| Tipo de texto | Pérdida de validación (checkpoint final) |
|---|---|
| Texto de asistente | 1,644 |
| Texto de usuario | 4,090 |
| Texto de documento | 3,063 |
| Tokens de entrenamiento de la condición (`reweighted_seg34`) | 1,692 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (0,98B × 2 bytes), más caché KV y activaciones; en la práctica, entre 3 y 4 GB para secuencias de 4.096 tokens con batch pequeño.
- VRAM estimada en fp32: unos 4 GB para pesos, más estado de inferencia.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4090, A10, L4). Para servir con concurrencia alta, A100 o H100 con vLLM o TGI.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090 sin cuantización adicional.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y cualquier runtime compatible con safetensors. No se documentan artefactos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. A modo de referencia dimensional, un modelo denso de 0,98B en bf16 sobre una RTX 4090 suele superar el centenar de tokens por segundo en decodificación con batch 1, pero no hay cifras publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| `1pp-0.98b-v2-asst-rawanneal-seed42-base` (este) | 0,98B | 4.096 | Apache 2.0 | Base con cooldown conversacional (investigación 1PP) | Hugging Face, 0 descargas |
| `1pp-0.98b-v2-asst-seed42-base` | 0,98B | 4.096 | Apache 2.0 | Condición 1PP completa, mismo flujo de datos | Hugging Face (colección 1PP) |
| `1pp-0.98b-v2-raw-seed42-base` | 0,98B | 4.096 | Apache 2.0 | Baseline solo con documentos, sin cooldown conversacional | Hugging Face (colección 1PP) |
| SmolLM2-1.7B (referencia de vocabulario) | 1,7B | 8.192 (según versión) | Apache 2.0 | Modelo base de propósito general | Hugging Face, ampliamente distribuido |

La comparación relevante es interna al estudio 1PP: los tres checkpoints comparten arquitectura, tokenizador y flujo de datos alineado por pasos, de modo que las diferencias de pérdida reflejan únicamente la condición de entrenamiento. Frente a modelos base de propósito general del mismo orden de magnitud, este checkpoint no está diseñado para competir en benchmarks de conocimiento o razonamiento.

## Limitaciones y advertencias

- Es un modelo base, no un asistente ajustado por instrucciones: el autor lo califica explícitamente de artefacto de investigación y no de asistente de propósito general.
- No ha visto nunca un turno de sistema; introducir uno en la plantilla ChatML supone una condición fuera de distribución.
- Solo soporta inglés; no hay evidencia de competencia en otros idiomas.
- Ventana de contexto de 4.096 tokens, insuficiente para tareas de contexto largo.
- Riesgo elevado de alucinación y de respuestas incoherentes, propio de un modelo de 0,98B con 39,38B tokens de entrenamiento y sin RLHF ni DPO.
- Sesgos heredados de DCLM-edu, un corpus web filtrado por criterios educativos, sin auditoría de sesgo publicada.
- Sin datos de benchmarks de seguridad, toxicidad o robustez adversarial.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción; cualquier despliegue comercial exigiría evaluación propia.
- El rendimiento conversacional depende del formato exacto de la plantilla incluida; desviarse de ella degrada la calidad de forma no cuantificada.
- No hay soporte documentado de tool calling, agentes ni multimodalidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-asst-rawanneal-seed42-base
- Variante completa 1PP: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-asst-seed42-base
- Baseline raw: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-seed42-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
