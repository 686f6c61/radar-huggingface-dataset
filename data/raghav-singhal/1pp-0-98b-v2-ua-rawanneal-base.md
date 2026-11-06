# Raghav-Singhal/1pp-0.98b-v2-ua-rawanneal-base

## Resumen

El modelo `1pp-0.98b-v2-ua-rawanneal-base` es un modelo de lenguaje de tipo decoder Llama, con 981.545.472 parámetros, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo afecta la composición del corpus de preentrenamiento (documentos originales frente a conversaciones reescritas) al comportamiento del modelo resultante.

Se trata de una variante de *mid-training*: el modelo parte del run `1pp-0.98b-v2-raw-base` hasta el paso 16.902 (el último con learning rate máximo) y aplica después el *cooldown* (los últimos 1.877 de 18.779 pasos) sobre conversaciones 1PP reescritas a partir de los mismos documentos, en lugar de sobre los documentos originales. Los corpus están alineados por paso, de modo que cada paso de cooldown contiene las conversaciones reescritas de los documentos que el run raw vio en ese mismo paso.

Forma parte de la escalera v2 del proyecto: cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) por tres condiciones y tres semillas (28, 42 y 1234), cada tamaño entrenado desde cero durante 20,3 tokens de asistente por parámetro sobre el mismo flujo de datos alineado por paso. La relevancia actual es metodológica: permite aislar el efecto de la máscara de pérdida y del texto de los documentos en un régimen controlado, con contexto de 4.096 tokens y licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (transformer denso), 24 capas |
| Parámetros totales | 981.545.472 (0,98B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | No disponible (el autor no publica variantes cuantizadas; pesos en bf16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); checkpoint original en Megatron |

## Arquitectura y entrenamiento

La arquitectura es un decoder estilo Llama con 24 capas, dimensión oculta 1.536, FFN de 6.144 con activación SwiGLU, 12 cabezas de atención y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados (*untied*), sin sesgos y sin QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El entrenamiento usa los documentos originales DCLM-edu durante los primeros 16.902 pasos y, en el cooldown de 1.877 pasos, conversaciones 1PP reescritas a partir de esos mismos documentos, con pérdida sobre los turnos de usuario y de asistente. Se cubren los primeros 18.779 pasos del flujo alineado de 1PP (39,38B posiciones de token), que son los primeros pasos del pase principal de 31.777 pasos en el mismo orden. El batch global es de 512 × 4.096 tokens con enmascaramiento de atención entre documentos. El optimizador es Muon (escalado por forma, LR matricial 0,005) con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para las normas); warmup de 1.181 pasos, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100; weight decay 0,1; desviación estándar de inicialización 0,0103; precisión bf16.

La pérdida de validación del checkpoint final (por token, sobre 2.433 documentos reservados) es de 1,638 en texto de asistente, 1,522 en texto de usuario y 3,021 en texto de documento; la columna de tokens de entrenamiento de esta condición, ponderada, es 1,623 (`reweighted_seg1234`). Los pesos de Hugging Face se verificaron contra el checkpoint de Megatron recalculando pérdidas de validación: 1,6362 frente a 1,6377 (diferencia absoluta 0,0015) en `val50m segments [3]`, y 3,0226 frente a 3,0212 (0,0014) en `raw_val50m segments [8]`.

## Capacidades

- Generación de texto autoregresiva en inglés, con formato de conversación ChatML sin turno de sistema.
- Modelo base: no está ajustado con instrucciones ni con RLHF/DPO, por lo que no sigue instrucciones de forma fiable.
- Produce texto con formato de chat (turnos `user`/`assistant`) como consecuencia de la condición de entrenamiento, no por un post-entrenamiento específico.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés declarado.
- Sin modo *thinking*, visión ni audio.
- Generación detenida en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos incluidos en `eos_token_id`.

## Casos de uso

- Investigación sobre composición de corpus de preentrenamiento: comparar este modelo con `1pp-0.98b-v2-ua-base` y `1pp-0.98b-v2-raw-base` para aislar el efecto del cooldown sobre conversaciones frente a documentos, manteniendo constante la inicialización y el orden de batches.
- Reproducción de experimentos de escalado: la escalera v2 (0,58B, 0,98B, 1,66B, 2,81B) permite estudiar leyes de escalado con condiciones y semillas controladas; este checkpoint cubre el escalón de 0,98B con semilla 28.
- Estudio de formatos conversacionales: al haber sido entrenado con pérdida sobre turnos de usuario y asistente, sirve para analizar cómo emerge el formato ChatML sin un ajuste supervisado posterior.
- Evaluación de pérdida de validación por segmento: el modelo permite recalcular pérdidas sobre `val50m` y `raw_val50m` y contrastarlas con las referencias publicadas de Megatron.
- Generación de texto plano en inglés para tareas de *probing* lingüístico o de análisis de distribuciones de tokens, dado su carácter de modelo base.
- Docencia y divulgación: ejemplo reproducible de pipeline Megatron → Hugging Face con verificación numérica de pesos, útil en cursos sobre entrenamiento de LLM a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta pérdidas de validación:

| Conjunto | Pérdida (HF) | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| `val50m segments [3]` | 1,6362 | 1,6377 | 0,0015 |
| `raw_val50m segments [8]` | 3,0226 | 3,0212 | 0,0014 |

| Texto evaluado | Pérdida por token |
|---|---|
| Texto de asistente | 1,638 |
| Texto de usuario | 1,522 |
| Texto de documento | 3,021 |
| Tokens de entrenamiento de la condición (ponderado) | 1,623 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (0,98B × 2 bytes), más caché KV y activaciones; en la práctica, entre 3 y 4 GB para contextos de 4.096 tokens.
- VRAM estimada en fp32: unos 4 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; A100, H100 o L40S para despliegues con mayor throughput; RTX 4090, RTX 3090 o RTX 4070 Ti para uso individual.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 3070 y superiores).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); no se documentan pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión propia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| `1pp-0.98b-v2-ua-rawanneal-base` (este) | 0,98B | 4.096 | Apache 2.0 | en | Mid-training con cooldown sobre conversaciones |
| `1pp-0.98b-v2-ua-base` | 0,98B | 4.096 | Apache 2.0 | en | Run 1PP completo, misma escalera y semilla |
| `1pp-0.98b-v2-raw-base` | 0,98B | 4.096 | Apache 2.0 | en | Baseline con documentos originales |
| `1pp-1.7b-*` (escalón 1,66B) | 1,66B | 4.096 | Apache 2.0 | en | Escalón superior de la misma escalera v2 |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas externas de la misma categoría.

## Limitaciones y advertencias

- No es un asistente de propósito general: el propio autor lo describe como artefacto de investigación, no como modelo listo para producción.
- No ha pasado por ajuste supervisado de instrucciones ni por RLHF/DPO; el seguimiento de instrucciones no está garantizado.
- Entrenado únicamente en inglés; el rendimiento en otros idiomas no está caracterizado.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinación propio de un modelo base de 0,98B sin alineamiento; no debe usarse en aplicaciones sensibles sin evaluación adicional.
- Sesgos potencialmente heredados de DCLM-edu y de las conversaciones reescritas; no se documenta ninguna mitigación.
- El chat template no incluye turno de sistema: introducir uno queda fuera de la distribución de entrenamiento.
- Sin datos publicados de benchmarks, seguridad o robustez adversarial.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación limita la idoneidad para producción.
- Solo hay una semilla (28) en este checkpoint; las conclusiones sobre la condición deben contrastarse con las semillas 42 y 1234 de la escalera.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-ua-rawanneal-base
- Run raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-base
- Run 1PP completo: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-ua-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento: https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT: https://wandb.ai/raghav_singhal/1pp-sft
