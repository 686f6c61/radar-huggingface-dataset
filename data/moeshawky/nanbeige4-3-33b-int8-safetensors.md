# moeshawky/Nanbeige4.3-33B-INT8-safetensors

## Resumen

Nanbeige4.3-33B-INT8-safetensors es una versión cuantizada a int8 (esquema W8A16) del modelo Nanbeige4.3-33B, un transformer denso de tipo LlamaForCausalLM con 33.118.977.024 parámetros publicado por el usuario moeshawky en HuggingFace. El modelo base pertenece a Nanbeige y esta versión concreta se ha generado aplicando una cuantización simétrica por canal (absmax) a los pesos de 471 tensores 2-D, manteniendo las activaciones en bf16/float durante la inferencia. El resultado ocupa aproximadamente 33 GB en disco, frente a los ~62 GB del checkpoint original en bfloat16, lo que supone una reducción de en torno al 46 %.

El interés de esta ficha radica en que permite desplegar un modelo de 33B en hardware más modesto sin recurrir a formatos GGUF o a cuantizaciones de 4 bits, conservando el tokenizer, el config y el generation_config originales. El modelo base emplea GQA con 56 cabezas de query y 8 de key/value (ratio 7:1), 52 capas, hidden size 7168 y un vocabulario de 166.912 tokens. La longitud máxima de posición configurada es de 524.288 tokens, aunque no se ha verificado el contexto efectivo de entrenamiento.

La licencia declarada es Apache 2.0, lo que facilita el uso comercial. No obstante, el autor de la cuantización no aporta evaluaciones de calidad downstream ni benchmarks, y advierte explícitamente de que no emite afirmaciones de calidad más allá de la definición del esquema. Esta ficha se limita a los datos verificables del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer denso, GQA) |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 524.288 posiciones máximas configuradas (`max_position_embeddings`); contexto efectivo de entrenamiento no disponible |
| Tipos de cuantizacion | int8 W8A16, simétrica por canal (absmax), `group_size: null`; tensores 1-D en bfloat16 |
| Idiomas soportados | en (según tag de HuggingFace y model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (14 shards int8 + `.scale` float32 por canal) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso con arquitectura Llama. Cuenta con 52 capas, hidden size de 7168, FFN intermedio de 22016 y atención con 56 cabezas de query frente a 8 de key/value (GQA 7:1), con dimensión de cabeza 128. El vocabulario es de 166.912 tokens, `tie_word_embeddings` está desactivado y el RoPE utiliza theta de 120.000.000, lo que habilita la ventana de 524.288 posiciones. La normalización es RMSNorm con epsilon 1e-05.

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens ni si se aplicaron fases de RLHF, DPO o ajuste instructivo. Tampoco se documentan innovaciones técnicas adicionales en la model card de esta cuantización. Lo único verificable es el esquema de cuantización: para cada peso 2-D `W` de forma `[out_features, in_features]` se calcula una escala float32 por canal de salida como `max(|W[j,:]|) / 127`, se cuantiza a int8 con recorte en `[-127, 127]` y se almacena el tensor int8 junto a su `.scale`. La dequantización es `W ≈ W_q * scale`. Los 471 tensores 2-D se cuantizaron y los 366 tensores 1-D (RMSNorm) se mantuvieron en bfloat16.

## Capacidades

- Generación de texto autoregresiva en inglés, con pipeline `text-generation`.
- Conversación multi-turno: el tag `conversational` está presente en el repositorio.
- Razonamiento y generación de código: no documentado explícitamente en la información disponible.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: limitadas al inglés según el tag de idioma; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Ventana de contexto amplia: hasta 524.288 posiciones según configuración, si bien el contexto efectivo no está verificado.

## Casos de uso

- Despliegue en una sola GPU de 48 GB: con ~33 GB de pesos int8 más overhead de activaciones y KV cache, el modelo cabe en una A6000, L40S o RTX 6000 Ada, lo que permite servir generación de texto sin cuantización adicional a 4 bits.
- Procesamiento de documentos largos en inglés: la ventana configurada de 524.288 posiciones permite, en teoría, ingerir contratos, informes o libros completos en una sola pasada; conviene validar empíricamente la degradación más allá del contexto real de entrenamiento.
- Generación aumentada por recuperación (RAG) sobre corpus en inglés: el vocabulario de 166.912 tokens y el contexto amplio facilitan concatenar múltiples fragmentos recuperados sin truncar.
- Asistente conversacional de dominio general: el tag `conversational` y la licencia Apache 2.0 permiten integrarlo en productos comerciales siempre que se validen sesgos y alucinaciones.
- Fine-tuning ligero sobre la versión int8: aunque el esquema W8A16 no está pensado para entrenamiento, puede servir como base para evaluación o para destilación de comportamientos hacia modelos menores.
- Investigación en cuantización: el repositorio incluye `quantization_config.json`, los `.scale` por canal y comandos de verificación, lo que lo convierte en un caso de estudio reproducible para comparar W8A16 por canal frente a otras estrategias (per-tensor, per-token, GPTQ, AWQ).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no emite afirmaciones de calidad más allá de la definición del esquema de cuantización y recomienda evaluar downstream antes de desplegar.

## Requisitos de hardware

- VRAM estimada para inferencia: ~33 GB solo para pesos int8; con activaciones, KV cache y overhead de runtime, prever entre 38 y 44 GB para contextos moderados, y bastante más para contextos muy largos (el KV cache con 52 capas y GQA 7:1 crece de forma apreciable a 524.288 tokens).
- GPU recomendadas: A100 80 GB, H100 80 GB, A6000 48 GB, L40S 48 GB, RTX 6000 Ada 48 GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) con este formato int8; requeriría cuantización a 4 bits (GGUF/AWQ/GPTQ) para entrar en 24 GB.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `device_map="auto"` (soporte documentado en la model card); vLLM, TGI, llama.cpp u Ollama no están documentados para este formato int8 con escala por canal, por lo que su compatibilidad no está garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-INT8 (este) | 33,1 B | 524.288 pos. configuradas | int8 W8A16 por canal | Apache 2.0 | HuggingFace, safetensors |
| Nanbeige4.3-33B (base) | 33,1 B | 524.288 pos. configuradas | bf16 | Apache 2.0 | HuggingFace, safetensors |
| Alternativas de ~30-34B densos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No hay evaluación de calidad downstream: el autor no aporta benchmarks ni métricas de perplejidad, y advierte que la perplejidad mide fluidez, no fidelidad.
- Riesgo de degradación por cuantización: el esquema W8A16 por canal es conservador, pero puede introducir errores en capas sensibles; conviene comparar contra el checkpoint bf16 en las tareas objetivo.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está verificado y probablemente sea limitado.
- Contexto efectivo incierto: `max_position_embeddings` es 524.288, pero no se documenta la longitud real de entrenamiento; usar contextos muy largos puede degradar la calidad y disparar el consumo de VRAM por KV cache.
- Alucinaciones y sesgos: no se documentan evaluaciones de sesgo ni de robustez; el modelo base no incluye información sobre alineamiento (RLHF/DPO) en esta ficha.
- Compatibilidad de runtime: el formato int8 con `.scale` por canal requiere que el runtime lo soporte; no está confirmado su funcionamiento en vLLM, llama.cpp u Ollama.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base Nanbeige4.3-33B y cumplir las obligaciones de atribución.
- Repositorio de terceros: la cuantización la publica un usuario independiente (moeshawky), no el equipo de Nanbeige; no hay garantía de mantenimiento ni de soporte.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/moeshawky/Nanbeige4.3-33B-INT8-safetensors
- Modelo base en HuggingFace: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Documentación de safetensors: https://github.com/huggingface/safetensors
- Documentación de transformers: https://huggingface.co/docs/transformers
