# intel-ai/GLM-5.3-MXFP4-AutoRound

## Resumen

GLM-5.3-MXFP4-AutoRound es una compilación cuantizada en MXFP4 (W4A4, grupo de 32) del modelo zai-org/GLM-5.3, producida por intel-ai mediante la herramienta auto-round en modo `--model_free` con redondeo RTN. El objetivo es reducir el peso del checkpoint original (756 GB en BF16) hasta 403,34 GB de safetensors, manteniendo una cobertura de módulos cuantizados idéntica a la del artefacto de referencia RedHatAI/GLM-5.3-MXFP4. Es, por tanto, una alternativa de despliegue para infraestructuras que no pueden alojar el modelo completo en precisión nativa.

El modelo base es un transformer de tipo Mixture-of-Experts con atención MLA y un indexador DSA (DeepSeek Sparse Attention), identificado en la librería como `glm_moe_dsa` y registrado en vLLM bajo `GlmMoeDsaForCausalLM`. Con 753.329.940.480 parámetros totales, es un modelo de escala frontier pensado para razonamiento, generación de texto y cargas conversacionales de alta exigencia, no para hardware de consumo.

La relevancia de esta ficha radica en que documenta una ruta de cuantización reproducible (parche incluido sobre auto-round) y unas cifras de evaluación medidas con un arnés concreto (lm-eval 0.4.13 sobre vLLM 0.32.1rc1), lo que permite comparar el artefacto con otras compilaciones del mismo modelo base sin confundir metodologías.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención MLA e indexador DSA (`glm_moe_dsa`) |
| Parametros totales | 753.329.940.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 W4A4 (pesos E2M1, escalas E8M0, grupo 32; activaciones FP4 con escalado dinámico por grupo) |
| Idiomas soportados | no disponible |
| Licencia | glm-5.3 (license_name: glm-5.3, categoría "other") |
| Formato de pesos | safetensors (141 shards, 118.607 tensores, 403,34 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) que incorpora atención MLA (Multi-head Latent Attention) y un indexador DSA para atención dispersa. La compilación cuantizada conserva en BF16 los componentes sensibles: el router MoE (`mlp.gate`), el proyector de fusión MTP (`eh_proj`), los embeddings de tokens, el LM head, las LayerNorms, y dentro del indexador DSA los módulos `wk` y `weights_proj`. Se cuantizan a MXFP4 las proyecciones de los expertos enrutados y del experto MTP, las cinco proyecciones de la atención MLA (`q_a_proj`, `q_b_proj`, `kv_a_proj_with_mqa`, `kv_b_proj`, `o_proj`), las proyecciones del experto compartido, los MLP densos iniciales (capas 0-2) y el `wq_b` del indexador DSA. La caché KV no se cuantiza en el checkpoint; vLLM sobre SM10x selecciona automáticamente FP8 KV cache para esta arquitectura.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original en la documentación proporcionada. La innovación técnica documentada de esta compilación es el procedimiento de cuantización: se aplica un parche privado sobre `auto_round/special_model_handler.py` para desactivar la regla de ignorado propia de la familia `glm_moe_dsa`, de modo que los MLP densos iniciales y el `indexer.wq_b` se cuantizan igual que en el artefacto de RedHatAI. Sin ese parche, el resultado contiene 31 tensores más en BF16 y pesa aproximadamente 1,3 GB más. La receta queda fijada en `scripts/glm53_quant_rh_style.sh` y el esquema es un único grupo `mxfp4-pack-quantized` con objetivos `["Linear"]`.

## Capacidades

- Generación de texto conversacional y de formato largo, validada en el pipeline `text-generation`.
- Razonamiento y conocimiento general: MMLU de 84,23 en la evaluación publicada.
- Razonamiento matemático de varios pasos: GSM8K de 97,04 en modo strict-match con plantilla de chat y 5-shot.
- Inferencia de sentido común y comprensión lectora: PIQA 83,46 y HellaSwag 71,50.
- Soporte de modo de razonamiento explícito en el servidor: vLLM se lanza con `--reasoning-parser glm45`, lo que implica que el modelo base emite trazas de pensamiento parseables.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a través de la API compatible con OpenAI de vLLM.
- Capacidades de tool calling, function calling, agentes multi-paso, visión o audio: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no enumera idiomas.

## Casos de uso

- Despliegue de razonamiento a gran escala en clúster: el artefacto está validado con `--tensor-parallel-size 4`, repartiendo 403 GB en aproximadamente 101 GB por GPU. Encaja en nodos de 4 GPU de 183 GB (por ejemplo, SM10x) donde el checkpoint BF16 de 756 GB exigiría TP=8.
- Servicio de chat con trazas de razonamiento: al lanzar vLLM con `--reasoning-parser glm45`, se puede exponer un endpoint que separe el razonamiento interno de la respuesta final, útil en asistentes técnicos que necesitan auditar el proceso.
- Evaluación comparativa de cuantizaciones: al compartir cobertura de módulos con RedHatAI/GLM-5.3-MXFP4, sirve como artefacto de control para medir el impacto de distintas recetas de cuantización sobre el mismo modelo base con el mismo arnés (lm-eval 0.4.13, seed 42).
- Sustitución de FP8 en infraestructura con memoria limitada: cuando el checkpoint original no cabe en TP=4 sobre tarjetas de 183 GB, esta compilación MXFP4 permite mantener el paralelismo en 4 GPUs en lugar de escalar a 8.
- Procesamiento por lotes de matemáticas y razonamiento estructurado: con GSM8K en 97,04, es adecuado para pipelines de resolución de problemas aritméticos y verificación de resultados en modo offline.
- Investigación sobre cuantización W4A4: el parche documentado y la receta fija permiten reproducir el artefacto byte a byte (mismo `total_size` que RedHatAI) y estudiar el error introducido por activaciones FP4 dinámicas.
- Fine-tuning o destilación sobre una base cuantizada: aunque no es el uso principal, el formato `compressed-tensors` es consumible por las herramientas del ecosistema para experimentos de adaptación de bajo rango sobre el checkpoint.

## Benchmarks y rendimiento

Evaluación con lm-eval 0.4.13 y vLLM 0.32.1rc1.dev253, TP=4, `enable_thinking=False`, seed 42, conjuntos de test completos sin `--limit`.

| Benchmark | Este modelo |
|---|---:|
| PIQA (acc) | 83,46 |
| HellaSwag (acc) | 71,50 |
| MMLU (acc) | 84,23 |
| GSM8K (strict-match) | 97,04 |
| Media | 84,06 |

El autor advierte que cada cifra procede de una única ejecución y que debe tratarse ±0,5 puntos como ruido. No se publica una línea base FP8 o BF16 con el mismo arnés, porque el checkpoint fuente de 756 GB no cabe en TP=4 sobre tarjetas de 183 GB y requiere TP=8; por tanto, no se han medido deltas de calidad frente a FP8 o BF16 en esta ficha.

## Requisitos de hardware

- VRAM estimada: 403,34 GB de pesos en MXFP4. Con TP=4 el reparto es de aproximadamente 101 GB por GPU, más overhead de activaciones y caché KV.
- Configuración validada: `--tensor-parallel-size 4` sobre GPUs de 183 GB (familia SM10x, por ejemplo B200). El autor indica que otras topologías son válidas siempre que `moe_intermediate_size / (TP * 32)` sea múltiplo de 4; con 2048, TP=1, 2, 4 y 8 cumplen la condición.
- GPUs recomendadas: nodos de 4 u 8 aceleradores de 180 GB o más. No cabe en GPUs de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola tarjeta de 80 GB.
- Caché KV: no cuantizada en el checkpoint; vLLM sobre SM10x selecciona FP8 KV cache automáticamente para esta arquitectura.
- Opciones de despliegue: vLLM 0.32.1rc1.dev253 o superior (registra `GlmMoeDsaForCausalLM` vía `vllm.models.deepseek_v32`), con torch 2.14.0+cu130, auto-round 0.16.1, compressed-tensors 0.17.0 y lm-eval 0.4.13 para reproducir la evaluación. El formato `compressed-tensors` está orientado a vLLM; no se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| intel-ai/GLM-5.3-MXFP4-AutoRound | 753,3 B | no disponible | MXFP4 W4A4, grupo 32 | glm-5.3 | Hugging Face, 403,34 GB |
| RedHatAI/GLM-5.3-MXFP4 | no disponible | no disponible | MXFP4, misma cobertura de módulos | no disponible | Hugging Face, 403,37 GB de repo |
| zai-org/GLM-5.3 (base) | no disponible en esta ficha | no disponible | BF16 | glm-5.3 | Hugging Face, 756 GB |

La diferencia principal frente a RedHatAI es de procedimiento: esta compilación usa auto-round con `--model_free` RTN y un parche para igualar la cobertura de módulos; el tamaño de pesos coincide byte a byte (403.337.136.288 bytes). Frente al modelo base, la ventaja es la reducción a aproximadamente el 53 % del peso, a costa del error introducido por la cuantización de pesos y activaciones.

## Limitaciones y advertencias

- El modelo puede generar contenido factualmente incorrecto; el autor indica explícitamente que no debe confiarse en él como fuente de información veraz.
- Riesgo de salidas sesgadas, ofensivas o inapropiadas derivadas de los datos de preentrenamiento y fine-tuning; se recomienda realizar pruebas de seguridad antes de cualquier despliegue.
- El error de cuantización proviene principalmente de la combinación de pesos MXFP4 con activaciones MXFP4 dinámicas; los expertos enrutados concentran aproximadamente el 97,5 % de los parámetros, por lo que absorben la mayor parte de ese error.
- No se han medido deltas de calidad frente a FP8 o BF16 con el mismo arnés, así que la degradación real respecto al modelo original es desconocida.
- Las cifras de benchmark provienen de una sola ejecución por tarea; el propio autor pide tratar ±0,5 puntos como ruido.
- La licencia es "other" con nombre `glm-5.3`; es imprescindible revisar los términos del modelo original antes de uso comercial. El aviso del autor señala que la licencia no constituye asesoramiento legal.
- El despliegue exige versiones concretas y recientes de vLLM y del stack de cuantización; entornos con versiones anteriores pueden no registrar la arquitectura `glm_moe_dsa`.
- La longitud de contexto y los idiomas soportados no están documentados en la información disponible, lo que impide garantizar comportamiento en ventanas largas o en lenguas distintas del inglés.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intel-ai/GLM-5.3-MXFP4-AutoRound
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Artefacto de referencia: https://huggingface.co/RedHatAI/GLM-5.3-MXFP4
- Repositorio de auto-round: https://github.com/intel/auto-round
- Paper de auto-round (arXiv:2309.05516): https://arxiv.org/abs/2309.05516
