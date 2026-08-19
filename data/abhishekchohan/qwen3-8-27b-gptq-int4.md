# abhishekchohan/Qwen3.8-27B-GPTQ-INT4

## Resumen

Qwen3.8-27B-GPTQ-INT4 es una cuantización INT4 del modelo Qwen3.8-27B, un modelo de lenguaje multimodal (texto e imagen) de 27.000 millones de parámetros desarrollado por Qwen y publicado bajo licencia Apache 2.0. Esta versión cuantizada, creada por el usuario abhishekchohan, reduce el peso del modelo de aproximadamente 55,6 GB (BF16) a unos 27 GB, lo que permite ejecutarlo en una GPU de 32 GB o más, manteniendo según las evaluaciones publicadas un rendimiento equivalente al del modelo original en las tareas probadas.

El modelo base Qwen3.8-27B destaca por su arquitectura híbrida que combina capas de atención global con capas de atención lineal (DeltaNet), un encoder visual ViT congelado y un predictor MTP para decodificación especulativa. Su contexto nativo es de 262.144 tokens, ampliable a 1M mediante YaRN, aunque esta cuantización solo ha sido calibrada y validada en el contexto nativo. La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo multimodal de 27B con capacidades de razonamiento, visión y tool calling en hardware de gama media-alta, sin sacrificar precisión en los benchmarks evaluados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: capas de atencion global + capas de atencion lineal (DeltaNet), encoder visual ViT congelado, predictor MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; extension YaRN a 1M no validada en esta cuantizacion |
| Tipos de cuantizacion | INT4 GPTQ asimetrico (zero-point, group_size=32, weight-only) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, pack-quantized int4) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura densa de 64 capas de texto con atencion hibrida: una parte de las capas usa atencion global clasica (con KV cache acumulable) y otra parte usa atencion lineal DeltaNet, que mantiene un estado de tamano fijo y reduce el coste de memoria en contextos largos. Adicionalmente incorpora un encoder visual ViT congelado para entrada de imagenes y un predictor MTP (multi-token prediction) que permite decodificacion especulativa. La cuantizacion GPTQ se realizo con calibracion de 8 secuencias de 262.144 tokens (el contexto nativo del modelo), extraidas de los datasets Nemotron-Post-Training-v3 (instruccion, matematicas, ciencia, codigo agente y multilingue). Se protegieron en BF16 los embeddings, layer norms, lm_head, todas las proyecciones DeltaNet, el encoder visual y el predictor MTP. No se aplico RLHF ni DPO en el proceso de cuantizacion; el modelo base ya incorpora esas tecnicas de entrenamiento, aunque no se detallan en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" habilitable (chat template con thinking).
- Entrada de imagenes a traves del encoder visual ViT (pipeline image-text-to-text).
- Soporte de tool calling y function calling (parser qwen3_coder en vLLM).
- Capacidades de agente y razonamiento multi-paso, incluyendo codigo agente (SWE).
- Matematicas y ciencia: evaluado en GSM8K, GPQA Diamond y MathVision.
- Multilingue: el modelo base es multilingue, pero no se especifican los idiomas concretos en la informacion proporcionada.
- Decodificacion especulativa mediante el predictor MTP (2 tokens especulativos).
- Contexto largo nativo de 262.144 tokens, con recuperacion validada en needle-in-a-haystack.

## Casos de uso

- Atencion al cliente automatizada con contexto largo: el modelo puede gestionar conversaciones multi-turno extensas gracias a su ventana de 262.144 tokens, manteniendo el historial completo de la interaccion sin truncamientos. Su modo thinking permite razonar sobre la intencion del usuario antes de responder.
- Generacion de codigo en produccion: con soporte de tool calling y parser qwen3_coder, puede integrarse en pipelines de CI/CD para generar, revisar o parchear codigo, y ejecutar herramientas externas (por ejemplo, tests o linters) de forma autonoma.
- Analisis de documentos con imagenes: al aceptar entrada visual, puede procesar capturas de pantalla, diagramas o graficos junto con texto, util para extraer informacion de informes tecnicos o manuales.
- Razonamiento matematico y cientifico: con resultados de 94,8 en GSM8K y 64,65 en GPQA Diamond (con thinking), es adecuado para asistentes de investigacion que necesitan resolver problemas de matematicas o fisica con explicaciones paso a paso.
- Agentes autonomos de navegacion y operacion de software: sus capacidades de agente y vision permiten interactuar con interfaces graficas, como se refleja en benchmarks tipo OSWorld (84,3 en el modelo base), para automatizar tareas de escritorio o web.
- Despliegue en entornos con recursos limitados: al ocupar solo ~27 GB en INT4, puede ejecutarse en una GPU de 32 GB (por ejemplo, A100 40GB o RTX 6000 Ada) con contexto moderado, lo que lo hace viable para equipos sin acceso a clusters grandes.

## Benchmarks y rendimiento

La model card publica resultados comparativos entre el modelo base BF16 y esta cuantizacion, obtenidos con el mismo harness (lm-eval-harness, backend hf-multimodal, greedy). Las diferencias estan dentro del ruido de muestreo.

| Tarea | Protocolo | n | Base (BF16) | Cuantizacion INT4 | Delta |
|---|---|---|---|---|---|
| GSM8K | thinking, generativo (subconjunto 250) | 250 | 95,60 | 94,80 | -0,8 |
| GPQA Diamond | thinking, generativo | 198 | 64,65 | 64,65 | 0,0 |
| RealWorldQA | thinking, generativo | 100 | 68,00 | 70,00 | +2,0 |
| MathVision (protocolo de opcion multiple) | thinking, generativo | 100 | 10,00 | 12,00 | +2,0 |
| ARC-Easy | loglikelihood, completo | 2376 | 82,58 / 72,81 (acc_norm / acc) | 82,62 / 74,58 | +0,04 / +1,77 |

Prueba de aguja en el pajar (needle-in-a-haystack) a distintas longitudes de contexto, con 3 profundidades por longitud:

| Contexto (tokens) | Base | Cuantizacion |
|---|---|---|
| 8.192 | 3/3 | 3/3 |
| 32.768 | 3/3 | 3/3 |
| 131.072 | 3/3 | 3/3 |
| 262.144 (nativo) | 3/3 | 3/3 |

No se evaluaron en esta cuantizacion: comportamiento agente/tool-calling y cobertura de vision mas alla de las dos tareas pequenas (RealWorldQA y MathVision).

## Requisitos de hardware

- VRAM estimada: ~27 GB para los pesos en INT4. Con contexto moderado (32k tokens), la KV cache anade ~2 GB, por lo que cabe en una GPU de 32 GB.
- Para el contexto completo de 262.144 tokens, la KV cache requiere ~17 GB adicionales, totalizando ~48 GB. Se recomienda una GPU de 48 GB o mas (por ejemplo, A100 80GB, H100) o limitar `--max-model-len` en tarjetas menores.
- GPU recomendadas: A100 40/80GB, H100, RTX 6000 Ada (48GB), o RTX 4090 (24GB) solo con contexto reducido (por ejemplo, 8k-16k tokens).
- Opciones de despliegue: vLLM (comando `vllm serve abhishekchohan/Qwen3.8-27B-GPTQ-INT4`), con soporte para thinking, tool calling y decodificacion especulativa MTP. No se mencionan otros servidores en la documentacion, pero al ser formato safetensors/compressed-tensors, es compatible con TGI y llama.cpp (aunque no verificado).
- Latencia y throughput: no se proporcionan datos numericos. La decodificacion especulativa con MTP (2 tokens) puede mejorar el throughput en vLLM, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base BF16) | 27,8B | 262.144 | Apache 2.0 | BF16 | Modelo original, ~55,6 GB en disco |
| Qwen3.8-27B-GPTQ-INT4 (este) | 27,8B | 262.144 | Apache 2.0 | INT4 GPTQ | ~27 GB, rendimiento equivalente en benchmarks evaluados |
| Qwen3.8-2.4T-A95B | 2,4T total, 95B activos | 262.144 (presumible) | Apache 2.0 | No disponible | Modelo MoE de mayor tamano, requiere hardware mucho mas potente |

No se dispone de datos de otros modelos comparables de la misma categoria (por ejemplo, Llama 3.1 70B o Mistral Large) en la informacion proporcionada.

## Limitaciones y advertencias

- No se ha evaluado el comportamiento agente ni tool-calling en esta cuantizacion; los resultados de benchmarks solo cubren tareas de texto, matematicas y vision basica.
- La cobertura de vision es limitada: solo se probaron RealWorldQA y MathVision con n pequeno (100 cada una). No se garantiza el rendimiento en tareas visuales complejas.
- La extension YaRN a 1M de contexto no ha sido calibrada ni validada en esta cuantizacion; usarla mas alla de 262.144 tokens puede degradar la calidad de recuperacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han realizado pruebas especificas de fiabilidad factual en esta version.
- Sesgos: no se han documentado sesgos especificos, pero el modelo base puede heredar sesgos de sus datos de entrenamiento (datasets Nemotron y otros no detallados).
- Para produccion, se recomienda validar el comportamiento en el dominio concreto antes de desplegar, especialmente en tareas de agente o vision.
- La cuantizacion protege ciertos componentes en BF16 (DeltaNet, vision, embeddings, lm_head), por lo que el ahorro de memoria es parcial; el consumo real depende de la configuracion de contexto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/abhishekchohan/Qwen3.8-27B-GPTQ-INT4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Seguimiento de lanzamiento y especificaciones: https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Guia completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Especificaciones y requisitos de hardware: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Guia de ejecucion local: https://www.swfte.com/blog/qwen-3-8-27b-run-locally-self-host-guide-2026
- Documentacion de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
