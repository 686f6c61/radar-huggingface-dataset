# ediuedddward/Qwen3.8-27B-Uncensored-GGUF

## Resumen

El modelo Qwen3.8-27B-Uncensored-GGUF es una versión cuantizada en formato GGUF del modelo Qwen3.8-27B de Qwen, modificada mediante abliteración para reducir sustancialmente los comportamientos de rechazo (refusals). El autor, ediuedddward, publica esta variante con el objetivo de ofrecer un LLM de 27.320 millones de parámetros ejecutable en hardware local con herramientas como llama.cpp u Ollama, manteniendo intactas las capacidades del modelo base: razonamiento, generación de código, tool calling, visión y una ventana de contexto nativa de 262.144 tokens.

La relevancia de esta publicación radica en dos aspectos técnicos. Primero, conserva el head de multi-token prediction (MTP) del modelo original, lo que permite decodificación especulativa con un draft integrado o separado, sin degradar la calidad de salida. Segundo, la abliteración se realiza con la herramienta Heretic, que minimiza la divergencia KL respecto al modelo base, evitando fine-tuning y preservando las capacidades generales. El repositorio incluye múltiples cuantizaciones (desde IQ2_M hasta Q8_0), ficheros con y sin MTP, y una versión de visión en f16, todo bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (hybrid attention: Gated DeltaNet linear + full attention) |
| Parametros totales | 27.320.697.856 (27,32 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (más draft Q8_0) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención lineal Gated DeltaNet con atención completa (full attention), con 64 capas, un vocabulario de 248.320 tokens y una capa MTP (multi-token prediction) que actúa como head de decodificación especulativa. El modelo es denso, no MoE, y nativo de visión-lenguaje, con una torre de visión integrada. Los detalles del entrenamiento original (número de tokens, composición del dataset, fases de RLHF/DPO) no se proporcionan en la información disponible.

La variante uncensored se obtiene mediante abliteración con la herramienta Heretic, que identifica y elimina direcciones de rechazo en los tensores `attn.o_proj` y `mlp.down_proj`, co-minimizando el número de rechazos contra la divergencia KL respecto al modelo base. No se utiliza fine-tuning ni datos adicionales. El proceso se ejecuta en bf16 y el LoRA resultante se fusiona en el modelo base, por lo que los pesos publicados no son un round-trip cuantizado. Los tensores `mtp.*` se copian literalmente del checkpoint base tras la fusión, y cada fichero se inspecciona después de la cuantización para verificar su presencia. La imatrix se calcula directamente desde el f16, no desde una cuantización intermedia.

## Capacidades

- Generación de texto, razonamiento multi-step, matemáticas y código, heredadas del modelo base Qwen3.8-27B.
- Soporte de tool calling / function calling, según la documentación del modelo base.
- Capacidad de agente y razonamiento encadenado, habilitada por la arquitectura híbrida y el contexto largo.
- Multilingüe limitado a inglés y chino según la model card, aunque el modelo base podría soportar más idiomas no documentados.
- Visión: el fichero `Qwen3.8-27B-Uncensored-vision-f16.gguf` incluye la torre de visión, permitiendo entrada de imágenes (VQA, descripción, etc.).
- Decodificación especulativa con MTP: los ficheros fused incluyen el head MTP como draft integrado; también se ofrecen ficheros `noMTP` + draft separado para runtimes que requieran `--model-draft`.
- Comportamiento "uncensored": los rechazos se reducen sustancialmente, aunque no se eliminan por completo (según la model card, "substantially reduced, not eliminated").

## Casos de uso

- Ejecución local de un LLM de 27B en hardware de consumo: con la cuantización Q4_K_M (16,8 GB) cabe en una GPU con 24 GB de VRAM (p. ej., RTX 3090/4090) usando llama.cpp u Ollama, permitiendo inferencia sin conexión y sin depender de APIs externas.
- Análisis de documentos extensos: la ventana de 262.144 tokens permite procesar libros técnicos, contratos o logs completos en una sola pasada, con razonamiento multi-step sobre el contenido.
- Generación de código en producción: el soporte de tool calling y la capacidad de razonamiento permiten integrar el modelo en pipelines de CI/CD para autocompletado, revisión de código o generación de tests, con la ventaja de poder ejecutarse en infraestructura propia.
- Asistentes de visión-lenguaje: usando el fichero vision f16, se pueden construir aplicaciones que reciban imágenes y respondan preguntas sobre ellas, combinando comprensión visual con generación de texto.
- Investigación en alineación y seguridad: el modelo sirve como caso de estudio para analizar el efecto de la abliteración sobre el comportamiento de rechazo, la coherencia y la calidad de las respuestas, comparándolo con el modelo base.
- Chat creativo y roleplay sin restricciones: la reducción de rechazos permite explorar temas que los modelos alineados suelen bloquear, útil para escritura creativa, guionización o simulación de personajes.
- Inferencia de baja latencia con decodificación especulativa: los ficheros fused con MTP permiten acelerar la generación en servidores que soporten draft heads, reduciendo el tiempo por token sin sacrificar calidad (la verificación se hace contra el modelo objetivo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona mediciones de perplejidad en wikitext-2, que se presentan a continuación. Es importante señalar que la perplejidad solo detecta daños graves de cuantización y no mide razonamiento, código ni comportamiento de rechazo.

| Fichero | PPL (wikitext-2) | vs f16 |
|---|---|---|
| f16 (baseline, no publicado) | 7,1557 ± 0,25104 | - |
| Q5_K_M | 7,1573 ± 0,25055 | +0,0016 |
| IQ4_XS | 7,1583 ± 0,25019 | +0,0026 |
| Q6_K | 7,1689 ± 0,25149 | +0,0132 |
| Q8_0 | 7,1764 ± 0,25195 | +0,0207 |
| Q4_K_M | 7,1814 ± 0,25227 | +0,0257 |
| IQ2_M | 7,8581 ± 0,27481 | +0,7024 |

Según el autor, todos los quants excepto IQ2_M se encuentran dentro de un margen de 0,026 con un error estándar de aproximadamente 0,25, por lo que no son estadísticamente separables del f16 ni entre sí. La única diferencia significativa es IQ2_M, que se sitúa unas 2,8 desviaciones estándar por encima del baseline. Los ficheros `noMTP` miden idénticamente a sus homólogos fused, confirmando que el bloque MTP es inerte durante el forward pass normal.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, solo el peso del modelo): IQ2_M 10,6 GB, IQ4_XS 15,3 GB, Q4_K_M 16,8 GB, Q5_K_M 19,5 GB, Q6_K 22,4 GB, Q8_0 29,0 GB. A esto hay que añadir la memoria para KV cache y overhead del runtime.
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones hasta Q5_K_M; A100 (40/80 GB) o H100 para Q8_0 o para ejecutar con contexto largo completo. Para IQ2_M, una GPU con 12-16 GB (p. ej., RTX 3060 12 GB) puede ser suficiente.
- En consumer GPU: sí, con cuantizaciones Q4_K_M o inferiores. La versión Q4_K_M (16,8 GB) es la opción más equilibrada para una RTX 4090.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (existe un build oficial en https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored con 16 tags de 2 a 8 bits e incluye el mmproj de visión), y potencialmente vLLM o TGI si se convierte a otro formato (el GGUF está pensado para llama.cpp).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Diferencia clave |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,32 B | 262.144 | Apache-2.0 | safetensors | Comportamiento de rechazo estándar, sin abliteración |
| Qwen3.8-27B-Uncensored-GGUF (este) | 27,32 B | 262.144 | Apache-2.0 | GGUF | Abliterado, con MTP y cuantizaciones para llama.cpp |
| Qwen3.8-27B-Uncensored-FP8 | 27,32 B | 262.144 | Apache-2.0 | FP8 (vLLM) | Mismos pesos abliterados, pero cuantización FP8 para servidores vLLM |

No se dispone de datos de otros modelos uncensored de tamaño similar (p. ej., Dolphin, WizardLM Uncensored) en la información proporcionada, por lo que no se puede realizar una comparativa cuantitativa con ellos.

## Limitaciones y advertencias

- El comportamiento "uncensored" no es absoluto: la model card indica que los rechazos se reducen sustancialmente, pero no se eliminan. Algunas solicitudes pueden seguir siendo bloqueadas.
- Riesgo de alucinación inherente a todos los LLM; la abliteración no corrige este problema y podría aumentar la confianza en respuestas incorrectas en temas sensibles.
- Idiomas soportados limitados a inglés y chino según la model card; no se garantiza un rendimiento fiable en otros idiomas.
- La cuantización IQ2_M muestra una perplejidad significativamente peor que el baseline (7,8581 frente a 7,1557), por lo que no se recomienda para tareas que requieran precisión lingüística o matemática.
- La tasa de aceptación del draft MTP puede caer ligeramente porque el head fue entrenado contra el modelo sin abliterar; la decodificación especulativa verifica cada token contra el objetivo, por lo que la calidad de salida no se ve afectada, pero la aceleración puede ser menor.
- Para uso en producción, es necesario verificar que el comportamiento "uncensored" cumple con las políticas de la organización y con la normativa aplicable, especialmente en aplicaciones orientadas al público.
- La licencia Apache-2.0 permite uso comercial, pero se debe revisar la licencia del modelo base (también Apache-2.0) y cualquier condición adicional de Qwen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ediuedddward/Qwen3.8-27B-Uncensored-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía de ejecución local (orcarouter): https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Artículo sobre el build GGUF (orcarouter): https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Repositorio GitHub qwen38-uncensored: https://github.com/unburdened-jackinthebox365/qwen38-uncensored
- Build en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Herramienta Heretic (abliteración): https://github.com/p-e-w/heretic
