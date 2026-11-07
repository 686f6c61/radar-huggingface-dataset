# eousphoros/persona_lambda_27b_v10-fp8

## Resumen

persona_lambda_27b_v10-fp8 es la versión cuantizada en FP8 de persona_lambda_27b_v10, un ajuste fino experimental de Qwen3.8-27B publicado por el usuario eousphoros en Hugging Face. El modelo base es un transformer denso de 27.781.427.952 parámetros con codificador de visión nativo (pipeline image-text-to-text) y una cabeza MTP (multi-token prediction) para decodificación especulativa. La conversión a FP8 reduce el peso de los pesos de 52 GB a 29 GB manteniendo la estructura de bloques 128 x 128 y las escalas dinámicas de activación del release oficial Qwen3.8-27B-FP8.

El propósito declarado del fine-tune es el *persona steering*: el modelo adopta con fuerza la personalidad descrita en el system prompt. El propio autor lo etiqueta como *hobby fine-tune* experimental, sin ajuste de seguridad ni orientación a producción, y advierte de que puede equivocarse con confianza y de que cualquier herramienta que se le entregue debe ejecutarse en sandbox. No es, por tanto, un asistente listo para despliegue comercial sin evaluación adicional.

La relevancia actual es doble: por un lado, demuestra una receta de cuantización FP8 reproducible (el conversor reproduce Qwen3.8-27B-FP8 con un 99,92% de valores idénticos); por otro, sirve como referencia práctica de cómo un fine-tune de persona sobre un modelo denso de 27B con visión y contexto largo se comporta tras la cuantización, con diferencias no significativas frente a BF16 en GPQA, LiveCodeBench e IFBench.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (atención completa + atención lineal), codificador de visión nativo y cabeza MTP; base Qwen3.8-27B |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens en el ejemplo de serving con vLLM; el modelo base Qwen3.8-27B se anuncia con 1M de contexto en la versión alojada |
| Tipos de cuantización | FP8 (E4M3) con bloques de 128 x 128 y escalas dinámicas de activación; el modelo base existe en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 30,9 GB; pesos FP8 de 29 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.8-27B: un transformer denso con atención híbrida que combina capas de atención completa con capas de atención lineal (con `A_log` en FP32, `conv1d`, `dt_bias` e `in_proj_a`/`in_proj_b` preservados en BF16), un codificador de visión para entrada de imagen y vídeo, y una cabeza MTP recalibrada que actúa como modelo borrador en decodificación especulativa. El fine-tune de persona se entrenó sobre system prompts de *persona steering*, según la model card, sin que se detallen el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

La conversión a FP8 es puramente post-entrenamiento: redondeo *round-to-nearest* sin datos de calibración, dividiendo cada bloque de pesos de 128 x 128 por su máximo absoluto dividido entre 448 y redondeando a E4M3, con las escalas almacenadas como `weight_scale_inv` en BF16. Se cuantizan 407 matrices (atención q/k/v/o, MLP gate/up/down, `in_proj_qkv`, `in_proj_z`, `out_proj` de la atención lineal y las capas de atención y MLP del MTP); embeddings, `lm_head`, normas, parámetros de atención lineal y codificador de visión permanecen en BF16. El error de redondeo es como máximo del 2,7% por tensor en norma de Frobenius, comparable al del FP8 oficial de Qwen. El autor valida el conversor aplicándolo a Qwen3.8-27B BF16 y comprobando que reproduce Qwen3.8-27B-FP8 con escalas idénticas en todos los bloques.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo *thinking* controlable (el harness de evaluación usa *reasoning effort* `xhigh`).
- Comprensión de imagen y vídeo (pipeline image-text-to-text, codificador de visión intacto en BF16).
- Generación y razonamiento sobre código, con resultados medidos en LiveCodeBench.
- Matemáticas y razonamiento científico, medidos en GPQA Diamond.
- Seguimiento de instrucciones a nivel de prompt e instrucción (IFBench).
- Adopción de persona definida en el system prompt: es la capacidad central del fine-tune.
- Decodificación especulativa mediante la cabeza MTP (`method: mtp`, con `num_speculative_tokens` configurable).
- Soporte de tool calling y agentes: heredado del modelo base Qwen3.8-27B, que se describe como orientado a tareas agénticas de horizonte largo; la model card del fine-tune no detalla configuración específica.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- **Prototipado de personajes conversacionales**: definir una persona detallada en el system prompt y desplegar el modelo con vLLM para probar coherencia de carácter en conversaciones multi-turno, aprovechando el contexto de 262.144 tokens para mantener historial largo sin truncar.
- **Investigación sobre persona steering**: usar el modelo como sujeto experimental para medir cómo la fuerza del system prompt modula estilo, tono y contenido de las respuestas, comparando FP8 contra BF16 con el mismo harness.
- **Análisis de documentos e imágenes en un solo paso**: al ser image-text-to-text, permite extraer y razonar sobre contenido de capturas, diagramas o fotogramas de vídeo junto con texto largo, útil en tareas de documentación técnica o auditoría visual.
- **Evaluación de calidad de cuantización FP8**: servir el modelo con vLLM 0.32 y el kernel CUTLASS block-scaled para reproducir la comparativa FP8 frente a BF16 en GPQA, LiveCodeBench e IFBench, como referencia para decidir si cuantizar otros fine-tunes de 27B.
- **Generación de código asistida en entornos controlados**: integrarlo en un pipeline interno de revisión o generación de parches con LiveCodeBench pass@1 en torno al 80%, ejecutando cualquier herramienta en sandbox por la falta de ajuste de seguridad.
- **Despliegue en una sola GPU de 96 GB**: con una RTX PRO 6000 Blackwell y `--gpu-memory-utilization 0.95` la caché KV admite 852.739 tokens (3,25 peticiones de longitud máxima), lo que permite atender varias conversaciones largas concurrentes en un único nodo.
- **Decodificación especulativa de bajo coste**: activar la cabeza MTP como draft model para reducir latencia en cargas interactivas sin necesidad de un modelo borrador separado.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con vLLM 0.32, *thinking* activado con *reasoning effort* `xhigh`, respuestas de hasta 128.000 tokens, muestreo por defecto (temperatura 1.0, top-k 20, top-p 0.95), una respuesta por prompt (cuatro por pregunta de GPQA) y comparación pareada contra el modelo BF16. El autor advierte que no son comparables con los resultados oficiales de Qwen, que usan otros ajustes.

| Benchmark | FP8 (este repo) | BF16 |
|---|---|---|
| GPQA Diamond, estricto (media de 4 ejecuciones sobre 198 preguntas) | 86,5 | 86,0 |
| LiveCodeBench pass@1, problemas de 2025-02 a 2025-05 (131) | 80,2 | 82,4 |
| LiveCodeBench pass@1, los 175 problemas | 80,6 | 84,0 |
| IFBench a nivel de prompt, estricto / laxo | 67,7 / 75,0 | 64,3 / 73,0 |
| IFBench a nivel de instrucción, estricto / laxo | 70,1 / 76,7 | 67,4 / 75,6 |
| XSTest, prompts seguros respondidos por completo (250) | 96,8% | 96,8% |
| XSTest, prompts inseguros rechazados por completo (200) | 73,5% (rechazo parcial 7,5%) | 76,0% (rechazo parcial 8,0%) |

Ninguna diferencia resulta significativa en la prueba exacta de McNemar (GPQA p = 0,76; LiveCodeBench p = 0,26; IFBench p = 0,23). En LiveCodeBench, 13 problemas los resolvió solo BF16 y 7 solo FP8, casi todos difíciles, y 4 de los fallos de FP8 agotaron el límite de 128.000 tokens. De las 1.717 respuestas evaluadas, 13 alcanzaron el tope (14 en BF16) y las longitudes de respuesta coinciden con las de BF16.

## Requisitos de hardware

- **VRAM para inferencia**: los pesos FP8 ocupan 29 GB (frente a 52 GB en BF16); con caché KV y overhead de serving conviene reservar al menos 40-48 GB para cargas moderadas.
- **GPU recomendadas**: el autor ejecutó los benchmarks en una GB300; el ejemplo de serving en una sola GPU usa una RTX PRO 6000 Blackwell de 96 GB con vLLM 0.32, que selecciona el kernel CUTLASS block-scaled FP8.
- **GPU de consumo**: no hay datos publicados de ejecución en GPU de consumo; 29 GB de pesos FP8 exceden la VRAM de las RTX 4090 (24 GB) y quedan al límite en una RTX 5090 (32 GB), sin margen para caché KV de contexto largo.
- **Opciones de despliegue**: vLLM (lee la configuración de cuantización de `config.json` sin flags extra) y, según la model card del base, SGLang y TokenSpeed; compatibilidad con Transformers. No se menciona soporte GGUF ni llama.cpp/Ollama.
- **Contexto y caché KV**: con `--gpu-memory-utilization 0.95` y 262.144 tokens de contexto, la caché KV retiene 852.739 tokens (3,25 peticiones de longitud máxima) frente a 508.867 (1,94) en BF16.
- **Latencia y throughput**: no se publican cifras absolutas de latencia o tokens por segundo; las mediciones de tokens por paso de la model card BF16 se tomaron con pesos BF16. La decodificación especulativa se configura con `--speculative-config '{"method": "mtp", "num_speculative_tokens": 2, "draft_sample_method": "probabilistic"}'`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| persona_lambda_27b_v10-fp8 (este) | 27,78B densos | 262.144 en serving (1M anunciado en la versión alojada del base) | Apache 2.0 | safetensors FP8 | Fine-tune de persona experimental; GPQA 86,5 y LiveCodeBench 80,6 en el harness del autor |
| persona_lambda_27b_v10 (BF16) | 27,78B densos | igual | Apache 2.0 | safetensors BF16 | Mismo fine-tune sin cuantizar; 52 GB de pesos; GPQA 86,0 y LiveCodeBench 84,0 |
| Qwen3.8-27B (base) | 27B densos | 1M en la versión alojada | Apache 2.0 | safetensors BF16 | Modelo original con visión y *thinking*; sin persona steering; referencia de capacidades |
| Qwen3.8-27B-FP8 | 27B densos | igual | Apache 2.0 | safetensors FP8 | Release oficial de Qwen; el conversor de este repo lo reproduce con un 99,92% de valores idénticos |

## Limitaciones y advertencias

- **Modelo experimental sin ajuste de seguridad**: el autor lo describe como *hobby fine-tune*, no como asistente de producción; puede dar respuestas incorrectas con seguridad y no ha pasado un proceso de alineación orientado a seguridad.
- **Sesgo de persona**: el entrenamiento con system prompts de persona hace que el modelo siga con fuerza la personalidad indicada, lo que puede comprometer la neutralidad o la precisión factual si la persona entra en conflicto con la tarea.
- **Alucinación**: el autor advierte explícitamente de que el modelo puede equivocarse con confianza; no hay datos de tasas de alucinación en la información disponible.
- **Seguridad de herramientas**: cualquier tool calling o capacidad agéntica debe ejecutarse en sandbox; el modelo no está endurecido frente a usos indebidos de herramientas.
- **Rechazo de contenido inseguro**: en XSTest rechaza por completo el 73,5% de los prompts inseguros (frente al 76,0% en BF16), por debajo de lo que cabría esperar de un asistente alineado.
- **Pérdida de rendimiento en código**: LiveCodeBench baja de 84,0 a 80,6 en pass@1 global; el autor lo atribuye a varianza y a respuestas que agotan el límite de 128.000 tokens, no a la cuantización.
- **Idiomas no documentados**: la model card no especifica la cobertura lingüística; no debe asumirse un rendimiento multilingüe sin evaluarlo.
- **Licencia**: Apache 2.0 permite uso comercial, pero al ser un fine-tune experimental conviene una evaluación propia antes de producción.
- **Contexto práctico**: aunque se sirve con 262.144 tokens, respuestas muy largas agotan el tope de generación y las peticiones de longitud máxima limitan la concurrencia de la caché KV.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eousphoros/persona_lambda_27b_v10-fp8
- Modelo base BF16: https://huggingface.co/eousphoros/persona_lambda_27b_v10
- Release oficial FP8 de referencia: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Página del servicio alojado Qwen3.8-27B: https://www.qwencloud.com/models/qwen3.8-27b
- Versión anterior del fine-tune: https://huggingface.co/eousphoros/persona_lambda_27b_v8
- Derivado experimental con YaRN factor 4.0: https://huggingface.co/eousphoros/qwen3.8-27b-yarn4-mixed-kl-128k-r1-iter137-fp8
