# AutomatosX/AX-Clef-27B-MLX-AXQ-MXFP4

## Resumen

AX-Clef-27B-MLX-AXQ-MXFP4 es una cuantizacion de precision mixta del modelo Cloudflare/clef, publicada por AutomatosX para ejecucion local en Apple Silicon mediante MLX. El checkpoint conserva la ruta de texto en precision mixta (mayoritariamente 4 bits) y mantiene la torre de vision en BF16 como sidecar, con un total de 27.356.723.952 parametros logicos y un peso de safetensors de 17,76 GB. Emplea la familia de producto `qwen3.8` y la arquitectura `Qwen3_5ForConditionalGeneration` (dense) como base.

El modelo resuelve el problema de desplegar un modelo de 27B con contexto configurado de 262.144 tokens en hardware de memoria unificada de Apple, reduciendo el coste de almacenamiento a 5,1927 bits por peso (BPW) medidos en el modelo principal. La cuantizacion se realizo con AXQuant 2.1.0 sin calibracion, basandose en priors de arquitectura, y el autor declara explicitamente que se trata de evidencia de desarrollo y no de un release certificado.

Es relevante ahora porque permite evaluar localmente un modelo multimodal (texto y vision) de gran contexto en equipos Apple Silicon sin depender de GPUs de datacenter, aunque el paquete no publica evidencia de calidad, velocidad de kernel ni rendimiento en contexto largo. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (dense), ruta de texto optimizada |
| Parametros totales | 27.356.723.952 (27,36B logicos) |
| Parametros activos | no aplica (modelo dense) |
| Longitud de contexto | 262.144 tokens configurados; limites practicos dependen de la memoria unificada |
| Tipos de cuantizacion | Precision mixta AXQuant: 4bit (89,01%), 8bit (4,65%), bf16 (6,34%); metodos `affine`, `bf16`, `mxfp4`; grupos de 32 y 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no incluye PyTorch ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura subyacente es `Qwen3_5ForConditionalGeneration` en variante dense, con la ruta de texto optimizada para cuantizacion y una torre de vision preservada en BF16. El checkpoint no incluye MTP (`MTP present: False`) y no dispone de audio. La cuantizacion se ejecuto con AXQuant 2.1.0 sobre la revision `0b331204bb13fbd2ca93a64df1956f5b55478ce5` del modelo base Cloudflare/clef, con 497 de 497 conversiones de modulo registradas como exitosas y 0 fallbacks.

No se realizo calibracion: la asignacion de precision se basa en priors de arquitectura (`architecture_prior`). La distribucion resultante asigna 24,35B parametros a 4 bits, 1,27B a 8 bits y 1,73B a BF16, con un BPW medido de 5,1927 en el modelo principal. El sidecar de vision contiene 333 tensores, 460,73M parametros y 0,92 GB en BF16. No se dispone de informacion sobre el dataset de entrenamiento original, volumen de tokens, composicion ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno (`pipeline_tag: text-generation`, `conversational`).
- Capacidad de vision declarada: la torre de vision esta presente y preservada en BF16, aunque el autor no evalua ni reclama calidad vision-lenguaje.
- Contexto configurado de 262.144 tokens, sujeto a la memoria unificada disponible.
- Inferencia local en Apple Silicon mediante MLX-LM para texto y backbone.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Thinking mode, audio y decodificacion especulativa MTP: no disponibles (MTP ausente, audio ausente).

## Casos de uso

- Desarrollo y evaluacion local en Apple Silicon: el paquete esta pensado para probar un modelo de 27B con MLX-LM en equipos de memoria unificada, usando el comando `mlx_lm.generate` documentado y fijando el commit del Hub para reproducibilidad.
- Procesamiento de documentos largos en local: el contexto configurado de 262.144 tokens permite cargar contratos, informes o bases de codigo extensas, aunque la calidad en contexto largo no esta validada y depende de la memoria disponible.
- Prototipado de aplicaciones conversacionales: la ruta de texto cuantizada permite iterar sobre prompts y flujos multi-turno en un portatil o Mac Studio sin acceso a GPU de datacenter.
- Experimentacion multimodal controlada: el sidecar de vision en BF16 permite probar entrada de imagenes, asumiendo que la calidad vision-lenguaje no esta evaluada ni reclamada por el autor.
- Evaluacion comparativa de cuantizaciones: util para comparar el presupuesto de 5,1927 BPW frente a los hermanos 4bit y 6bit del mismo autor y medir el impacto en calidad y velocidad en hardware propio.
- Integracion en pipelines de investigacion offline: al ser Apache 2.0 y ejecutarse con MLX-LM, puede incorporarse en entornos de analisis de datos o generacion de texto por lotes en estaciones de trabajo Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no publica evidencia de calidad frente a BF16 ni a baselines uniformes, ni velocidad de kernel, ni aceptacion y velocidad de MTP, ni calidad en contexto largo, y que el release no esta certificado (gates M0-M8 no cerrados).

## Requisitos de hardware

- VRAM/memoria unificada estimada: el peso de safetensors es de 17,76 GB y la descarga completa aproximada de 17,78 GB; se recomienda reservar al menos esa cantidad mas el overhead del runtime y de la cache KV, que crece con el contexto.
- Hardware objetivo: Apple Silicon con memoria unificada; no se especifican modelos de chip concretos en la informacion disponible.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que solo contiene pesos MLX Safetensors y no incluye GGUF ni PyTorch.
- Despliegue: MLX-LM (probado con MLX 0.32.1 y MLX-LM 0.31.3 en la conversion). AX Engine no esta establecido porque no se incluye `model-manifest.json` nativo validado.
- vLLM, llama.cpp, Ollama, TGI: no disponibles para este formato.
- Latencia y throughput: no medidos ni publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Clef-27B-MLX-AXQ-MXFP4 | 27,36B | 262.144 | MLX Safetensors, 5,1927 BPW | Apache 2.0 | Sin benchmarks publicados; vision en BF16 |
| AX-Clef-27B-MLX-AXQ-4bit | no disponible | no disponible | MLX Safetensors | Apache 2.0 | Hermano de menor presupuesto; consultar BPW exacto |
| AX-Clef-27B-MLX-AXQ-6bit | no disponible | no disponible | MLX Safetensors | Apache 2.0 | Hermano de mayor precision media cerca de 6 BPW |
| Cloudflare/clef (BF16) | 27,36B (logicos) | no disponible | BF16 | no disponible | Modelo base sin cuantizar |

## Limitaciones y advertencias

- Release no certificado: el autor indica que es evidencia de desarrollo y que los gates formales M0-M8 de AXQuant no estan cerrados.
- Sin evidencia de calidad: no se publica retencion de calidad frente a BF16 ni frente a cuantizaciones uniformes.
- Sin calibracion: la asignacion de precision se basa en priors de arquitectura, no en datos de calibracion.
- Contexto largo no validado: los 262.144 tokens son metadatos de configuracion, no una garantia de calidad ni de viabilidad practica en memoria limitada.
- Vision no evaluada: la torre de vision se preserva en BF16, pero no se reclama ni se ha medido calidad vision-lenguaje.
- AX Engine no establecido: no hay manifest nativo validado; los campos de AX Engine en `axquant_runtime.json` describen un contrato de compatibilidad, no evidencia observada.
- MLX-LM puede ignorar metadatos de runtime de AXQuant y sidecars opcionales, por lo que la inferencia estandar no establece aceleracion MTP ni calidad multimodal.
- Solo Apple Silicon: el paquete no contiene pesos PyTorch ni GGUF, lo que impide su uso en GPUs NVIDIA o en runtimes como vLLM o llama.cpp.
- Idiomas soportados no disponibles; riesgo de sesgos y alucinacion no cuantificado en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y certificacion desaconseja su uso en produccion sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Clef-27B-MLX-AXQ-MXFP4
- Modelo base Cloudflare/clef: https://huggingface.co/Cloudflare/clef/tree/0b331204bb13fbd2ca93a64df1956f5b55478ce5
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Clef-27B-MLX-AXQ-4bit
- Hermano 6bit: https://huggingface.co/AutomatosX/AX-Clef-27B-MLX-AXQ-6bit
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
