# ramachandrajoshi/Phai-A1-35B-1M-FP8

## Resumen
Phai-A1-35B-1M-FP8 es una cuantizacion FP8 (W8A8, block-wise) del modelo multimodal Phai-A1-35B-1M, desarrollado por PhaiModelLab y publicado en Hugging Face por el usuario ramachandrajoshi. Se trata de un modelo de lenguaje y vision construido sobre la arquitectura Qwen3.6-35B-A3B, con 35.951.822.704 parametros totales y aproximadamente 3.000 millones activos por token gracias a su diseno Mixture-of-Experts (MoE). Su rasgo diferencial es una ventana de contexto nativa de 262.144 tokens que, mediante configuracion YaRN con factor 4, se extiende hasta 1.048.576 tokens.

El modelo ha sido post-entrenado (SFT seguido de RL con GRPO sobre 4.000 entornos sandbox) para cargas de trabajo de programacion y agentes: generacion de codigo, depuracion, tool calling, razonamiento multi-paso y planificacion de horizonte largo. Esta version FP8 reduce el peso en disco de aproximadamente 72 GB en BF16 a unos 38 GB, lo que permite servirlo en dos GPU de 48 GB o en una sola de 80 GB sin renunciar al encoder de vision ni a la cabeza MTP de decodificacion especulativa.

La relevancia actual del modelo radica en que combina contexto ultralargo, capacidad multimodal y decodificacion especulativa nativa en un paquete cuantizado que cabe en hardware de gama profesional. La licencia Apache 2.0 facilita su adopcion comercial, y el formato compressed-tensors lo hace directamente desplegable en SGLang y vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (transformer hibrido MoE con atencion lineal Gated DeltaNet) |
| Parametros totales | 35.951.822.704 (~35B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 1.048.576 tokens (262.144 nativos x YaRN factor 4) |
| Tipos de cuantizacion | FP8 E4M3 W8A8 block-wise (pesos con escalas estaticas 128x128; activaciones dinamicas por token-grupo 1x128) |
| Idiomas soportados | en, zh, ja, ar, ru, de |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (float-quantized), pesos almacenados por experto |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura transformer hibrida con 40 capas: 30 capas de atencion lineal Gated DeltaNet y 10 capas de atencion completa con compuerta (intervalo 4). El bloque MoE contiene 256 expertos enrutados (8 activos por token) mas 1 experto compartido, con tamano intermedio de 512 por experto. La dimension oculta es 2048, la atencion usa 16 cabezas Q y 2 cabezas KV con dimension de cabeza 256 y RoPE parcial de 0.25. Incorpora un encoder de vision ViT de 27 capas con patch 16 y fusion espacial 2, y una capa MTP (multi-token prediction) para decodificacion especulativa. El vocabulario es de 248.320 tokens.

El post-entrenamiento consistio en SFT seguido de RL con GRPO sobre 4.000 entornos sandbox, orientado a tareas de codigo y agentes. La cuantizacion se realizo con llm-compressor mediante `QuantizationModifier(scheme="FP8_BLOCK")` en modo oneshot y sin datos de calibracion (min-max data-free). Se cuantizaron todas las proyecciones de atencion y atencion lineal, los expertos compartidos y los 10.240 MLP de expertos enrutados. Permanecen en BF16 el torre de vision, `embed_tokens`, `lm_head`, el router MoE (`mlp.gate`), `shared_expert_gate`, `linear_attn.in_proj_a/b`, las normas, los parametros conv/SSM y la totalidad de la cabeza MTP. Esta seleccion de capas replica la del release oficial Qwen3.6-35B-A3B-FP8. La cabeza MTP se toma del modelo base Qwen/Qwen3.6-35B-A3B en BF16 y utiliza los embeddings y `lm_head` del propio fine-tune.

## Capacidades
- Generacion de texto y razonamiento con modo de pensamiento nativo (``), separable mediante el parser `qwen3`.
- Generacion, depuracion y refactorizacion de codigo, con soporte de multiples lenguajes de programacion.
- Razonamiento matematico y resolucion de problemas multi-paso.
- Vision: entrada de imagenes y video mediante encoder ViT de 27 capas.
- Tool calling y function calling, con parser dedicado `qwen3_coder`.
- Comportamiento agentico: planificacion de horizonte largo y razonamiento multi-paso en entornos sandbox.
- Decodificacion especulativa nativa mediante cabeza MTP, compatible con EAGLE en SGLang y `qwen3_5_mtp` en vLLM.
- Capacidades multilingues en ingles, chino, japones, arabe, ruso y aleman.
- Contexto ultralargo de hasta 1.048.576 tokens para documentos y conversaciones extensas.

## Casos de uso
- Asistente de programacion en IDE: el modelo puede generar y depurar codigo con contexto de repositorios completos gracias a su ventana de hasta 1M tokens, manteniendo coherencia entre ficheros y llamadas a funciones.
- Agente autonomo de desarrollo: con tool calling y planificacion multi-paso, puede encadenar acciones sobre terminal, control de versiones y APIs en pipelines de CI/CD.
- Analisis de documentacion tecnica extensa: ingesta de manuales, especificaciones o bases de codigo de cientos de miles de tokens en una sola pasada sin fragmentacion.
- Atencion al cliente multimodal: gestion de conversaciones multi-turno con imagenes adjuntas (capturas, fotos de producto) y contexto largo de historial de cliente.
- Procesamiento de video e imagenes en inspeccion: el encoder ViT permite describir, clasificar o extraer informacion de fotogramas y documentos escaneados.
- Razonamiento sobre repositorios y auditoria de codigo: revision de cambios, deteccion de vulnerabilidades y explicacion de logica compleja sobre grandes bases de codigo.
- Servicio de inferencia de alto rendimiento: despliegue en SGLang o vLLM con decodificacion especulativa MTP para reducir latencia en produccion con dos GPU de 48 GB.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la del modelo original (PhaiModelLab/Phai-A1-35B-1M) para detalles y benchmarks, pero no incluye cifras concretas.

## Requisitos de hardware
- VRAM estimada: aproximadamente 38 GB de pesos en FP8; con cache KV adicional, unos 19 GB de pesos por GPU en configuracion TP=2.
- GPU recomendadas: 2x 48 GB (L40S, A6000 Ada, RTX 6000 Ada) en TP=2, o 1x 80 GB (H100, A100 80G).
- Compute FP8 nativo en Ada (sm89), Hopper (sm90) y Blackwell. En Ampere, vLLM recurre a FP8 solo de pesos (Marlin).
- Cabe en GPU consumer de gama alta solo en configuraciones muy justas; el modelo esta pensado para GPU profesionales de 48-80 GB.
- Despliegue: SGLang (probado con v0.5.23) y vLLM, ambos con soporte de decodificacion especulativa MTP. Tambien compatible con transformers.
- Contexto: con `--context-length 262144` se dispone de cache KV holgado en TP=2; el contexto completo de 1M requiere mucha mas memoria de cache KV.
- Parametros de muestreo recomendados: temperature 1.0, top_p 0.95, top_k 20; max output tokens 32.768 en uso general y hasta 81.920 en tareas de razonamiento o agenticas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Phai-A1-35B-1M-FP8 | 35B totales / ~3B activos | 1.048.576 (YaRN 4) | Apache 2.0 | Cuantizacion FP8, vision, MTP, post-entrenado para codigo y agentes |
| Qwen3.6-35B-A3B | 35B totales / ~3B activos | no disponible en la informacion | no disponible en la informacion | Modelo base de la arquitectura; mismo esquema de cuantizacion oficial FP8 |
| Qwen3.6-35B-A3B-FP8 | 35B totales / ~3B activos | no disponible en la informacion | no disponible en la informacion | Release oficial de Qwen con la misma seleccion de capas cuantizadas |

## Limitaciones y advertencias
- Riesgo de alucinacion inherente a los modelos de lenguaje; el modo de pensamiento no elimina este riesgo en produccion.
- Idiomas soportados limitados a en, zh, ja, ar, ru y de; el rendimiento en otros idiomas no esta documentado.
- La ventana de 1M tokens depende de YaRN con factor 4; el rendimiento en el extremo de contexto puede degradarse respecto a la ventana nativa de 262.144.
- La cabeza MTP se toma del modelo base Qwen/Qwen3.6-35B-A3B y no del fine-tune original (que no la incluia); aunque usa los embeddings y `lm_head` del fine-tune, conviene validar la aceptacion de borradores en el dominio propio.
- La cuantizacion FP8 puede introducir degradacion sutil de calidad frente al modelo en BF16; no se han publicado evaluaciones comparativas.
- En Ampere, vLLM cae a FP8 solo de pesos (Marlin), con posible impacto en rendimiento.
- El contexto completo de 1M exige una cantidad de memoria de cache KV considerable, lo que puede hacer inviable el despliegue en configuraciones de 2x 48 GB.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los componentes derivados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ramachandrajoshi/Phai-A1-35B-1M-FP8
- Modelo base (fine-tune): https://huggingface.co/PhaiModelLab/Phai-A1-35B-1M
- Modelo base de arquitectura: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Release oficial FP8 de Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- llm-compressor: https://github.com/vllm-project/llm-compressor
