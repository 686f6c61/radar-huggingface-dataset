# Intel/Qwen3.6-35B-A3B-int4-mixed-AutoRound

## Resumen

Intel/Qwen3.6-35B-A3B-int4-mixed-AutoRound es una version cuantizada a int4 mixto del modelo Qwen/Qwen3.6-35B-A3B, publicada por Intel mediante su herramienta AutoRound. El objetivo es reducir el coste de memoria y acelerar la inferencia del modelo original manteniendo una recuperacion de calidad muy alta (99,60 % de media segun la evaluacion del autor). Se trata, por tanto, de un artefacto de despliegue y no de un modelo entrenado desde cero.

El modelo base Qwen3.6-35B-A3B es un transformer de tipo Mixture-of-Experts (MoE) con 35.000 millones de parametros nominales y aproximadamente 3.000 millones de parametros activos por token (de ahi el sufijo A3B). La model card cita la clase `Qwen3_5MoeForConditionalGeneration`, lo que confirma arquitectura MoE y soporte de entrada multimodal (imagenes) a traves de `AutoProcessor`. El checkpoint cuantizado contiene 6.329.212.016 parametros en safetensors y ocupa 42,6 GB en el repositorio.

La relevancia de esta ficha es practica: permite ejecutar un MoE de 35B con calidad cercana a BF16 en entornos con VRAM limitada, y ademas incluye configuracion verificada para vLLM 0.19 con decodificacion especulativa (`qwen3_next_mtp`). No obstante, el propio autor advierte de un problema de bucle infinito reportado por usuarios en la version INT4, parcialmente mitigado con fallbacks en ciertas capas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), clase `Qwen3_5MoeForConditionalGeneration`; soporte multimodal |
| Parametros totales | 6.329.212.016 en el checkpoint cuantizado (modelo base nominal: 35B, sufijo A3B) |
| Parametros activos | Aproximadamente 3B por token (inferido del nombre A3B del modelo base) |
| Longitud de contexto | No disponible en la informacion proporcionada (los scripts de evaluacion usan `max_length=131072`) |
| Tipos de cuantizacion | W4A16 mixto, group_size 128; capas `linear_att` forzadas a 4 bits por compatibilidad con vLLM; capas no-expertas y shared_expert en 16 bits |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card remite a la licencia del modelo original Qwen/Qwen3.6-35B-A3B) |
| Formato de pesos | safetensors (compatible con vLLM y Transformers; requiere GPTQModel >= 7.0 en Transformers) |

## Arquitectura y entrenamiento

El checkpoint es el resultado de aplicar AutoRound (Intel) sobre Qwen/Qwen3.6-35B-A3B. La receta de cuantizacion mixta definida en la model card asigna 4 bits a las capas de atencion lineal (`linear_att`), 16 bits a las capas lineales del language model que no son expertos y a los shared experts, y deja los expertos del MoE en el esquema int4 con group_size 128. Se generan dos variantes: la rama principal con `auto-round-best` y la revision `54e7cd36d9f7a358b4b42740c3aef755638e5ea6` con `auto-round`. El proceso usa 512 muestras (`nsamples=512`) y `low_gpu_mem_usage=True`.

Del modelo base no se aportan en la informacion disponible datos sobre volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO. Si se confirma que la arquitectura es MoE con atencion hibrida (presencia de `linear_att` y de decodificacion especulativa `qwen3_next_mtp`), el modelo combinaria atencion lineal con atencion completa y multi-token prediction, pero estos detalles no se detallan en la model card proporcionada.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno mediante plantilla de chat (`apply_chat_template`).
- Procesamiento de imagenes: el ejemplo de Transformers usa `AutoProcessor` con mensajes de tipo `image`, y el modelo responde describiendo el contenido visual.
- Razonamiento matematico: GSM8K evaluado con 5-shot y plantilla de chat.
- Modo de razonamiento con parser dedicado en vLLM (`--reasoning-parser qwen3`).
- Decodificacion especulativa compatible con vLLM mediante `{"method":"qwen3_next_mtp","num_speculative_tokens":2}`.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un MoE de 35B en una sola GPU: gracias a la cuantizacion W4A16 mixta, el checkpoint ocupa 42,6 GB y puede servirse con `--tensor-parallel-size 1` en vLLM, reduciendo el numero de GPUs frente a BF16.
- Asistentes conversacionales con contexto largo: los scripts de evaluacion configuran `max_length=131072`, de modo que el modelo esta pensado para conversaciones multi-turno con ventanas amplias, aunque la longitud exacta soportada no se documenta.
- Analisis de imagenes en pipelines de documentacion: el ejemplo oficial procesa una URL de imagen y genera una descripcion estructurada, util para catalogacion automatica o accesibilidad.
- Razonamiento matematico asistido: con GSM8K en torno al 96 % en W4A16, es adecuado para tutoria o verificacion de calculos paso a paso en entornos educativos.
- Servicio de inferencia de alto rendimiento: la combinacion de vLLM 0.19, parser de razonamiento y decodificacion especulativa con 2 tokens permite maximizar throughput en APIs compatibles con OpenAI.
- Evaluacion comparativa de cuantizacion: util como referencia para medir la perdida de calidad de AutoRound frente a BF16 en tareas como PIQA, HellaSwag, MMLU y GSM8K.
- Prototipado en estaciones de trabajo Intel: al proceder de Intel y AutoRound, encaja en flujos con Intel Neural Compressor y GPUs Intel, aunque la model card no detalla el backend de aceleracion.

## Benchmarks y rendimiento

| Benchmark | BF16 | W4A16 | Recuperacion |
|---|---:|---:|---:|
| PIQA | 82,37 | 81,88 | 99,41 % |
| HellaSwag | 63,49 | 62,98 | 99,18 % |
| MMLU | 83,66 | 83,04 | 99,27 % |
| GSM8K | 95,68 | 95,98 | 100,32 % |
| **Media** | **81,30** | **80,97** | **99,60 %** |

Los resultados proceden de la model card y se obtuvieron con `lm_eval` contra un servidor vLLM local, con `max_length=131072`, `max_gen_toks=2048`, 5-shot en GSM8K y semilla 42. No se aportan datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 42,6 GB, por lo que la inferencia requiere al menos ~43 GB de memoria para pesos; con overhead de KV cache y activaciones conviene reservar 48 GB o mas.
- GPU recomendadas: A100 80 GB, H100 80 GB o GPUs con 48 GB o mas. No se documenta soporte verificado en GPUs de 24 GB.
- Consumer GPU: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) con esta cuantizacion; no se dispone de datos sobre variantes GGUF de menor tamano.
- Opciones de despliegue: vLLM 0.19 (verificado) y Transformers con `Qwen3_5MoeForConditionalGeneration` y GPTQModel >= 7.0. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Intel/Qwen3.6-35B-A3B-int4-mixed-AutoRound | 35B nominales / ~3B activos; 6,33B en checkpoint | No disponible | No disponible (hereda la del base) | safetensors int4 mixto | Cuantizacion AutoRound con recuperacion del 99,60 % |
| Qwen/Qwen3.6-35B-A3B | 35B nominales / ~3B activos | No disponible | No disponible | safetensors BF16 | Modelo base sin cuantizar; referencia de calidad |
| Intel/Qwen3.6-35B-A3B-int4-AutoRound | 35B nominales / ~3B activos | No disponible | No disponible | safetensors int4 | Variante citada en el ejemplo de vLLM; no se detalla su diferencia con la mixta |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Bucle infinito: el autor advierte de que algunos usuarios han reportado este problema en la version INT4; se han anadido fallbacks en ciertas capas, pero no esta claro que se haya resuelto por completo. Usar con precaucion en produccion.
- Alucinacion: la model card indica que el modelo puede producir salidas factualmente incorrectas y no debe usarse como fuente de verdad.
- Sesgos y contenido ofensivo: se reconoce la posibilidad de generar contenido obsceno, sesgado u ofensivo por las limitaciones del modelo preentrenado y de los datasets de ajuste.
- Licencia: no se especifica en el repositorio; se remite a la licencia del modelo original, por lo que el uso comercial depende de los terminos de Qwen/Qwen3.6-35B-A3B.
- Idiomas: no se documenta la cobertura linguistica.
- Contexto: aunque los scripts usan 131072 tokens, la model card no confirma oficialmente la ventana maxima ni su comportamiento en contextos extremos.
- Compatibilidad: requiere GPTQModel >= 7.0 en Transformers y vLLM 0.19 verificado; versiones anteriores pueden no cargar el checkpoint.
- Seguridad: el autor recomienda realizar pruebas de seguridad antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Intel/Qwen3.6-35B-A3B-int4-mixed-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio AutoRound: https://github.com/intel/auto-round
- Intel Neural Compressor: https://github.com/intel/neural-compressor
- Paper de AutoRound: https://arxiv.org/abs/2309.05516
- Imagen de ejemplo del modelo: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen-VL/assets/demo.jpeg
