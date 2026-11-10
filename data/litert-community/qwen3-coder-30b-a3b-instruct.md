# litert-community/Qwen3-Coder-30B-A3B-Instruct

## Resumen

Qwen3-Coder-30B-A3B-Instruct en formato LiteRT-LM es una conversión del modelo de código de Qwen (Qwen3-Coder-30B-A3B-Instruct) al runtime LiteRT-LM de Google AI Edge, empaquetada por la comunidad litert-community. El modelo original es un transformer de tipo Mixture-of-Experts con 48 capas, 128 expertos por capa y 8 expertos activados por token, lo que resulta en 30.500 millones de parámetros totales de los que solo 3.300 millones se activan en cada paso de inferencia. Está diseñado específicamente para generación de código y soporte de tool calling.

La conversión a LiteRT-LM permite ejecutar el modelo fuera de los stacks habituales (PyTorch/Transformers), con kernels optimizados para CPU (XNNPACK) y GPU (ML Drift/WebGPU), lo que abre la puerta a despliegues en entornos con restricciones de dependencias. Los artefactos publicados usan cuantización mixta: expertos en int4 con bloques de 32 y escalas fp32, atención y lm_head en int8 por canal, router y normas en fp32, con caché KV en fp32.

Es relevante ahora porque demuestra la viabilidad de llevar un MoE de 30B a un runtime ligero con rendimiento medido (54,9 tokens/s de decodificación en un Apple M4 Max con WebGPU para la variante de 2.048 tokens de contexto), aunque con la advertencia importante de que requiere una compilación de LiteRT con parches específicos que aún no están en la release estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 48 capas, 128 expertos por capa, 8 activos por token |
| Parametros totales | 30,5B |
| Parametros activos | 3,3B |
| Longitud de contexto | 2.048 o 4.096 tokens (según artefacto; caché KV fp32) |
| Tipos de cuantizacion | Mixta: expertos int4 blockwise (bloque 32, escalas fp32); atención q/k/v/o y lm_head int8 por canal; router, normas y tabla de tokens fp32 |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`), empaquetado con litert-lm-builder 0.19.0 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only con arquitectura Mixture-of-Experts: 48 capas, cada una con 128 expertos y un router que selecciona los 8 expertos con mayor puntuación por token (top-8), con renormalización de pesos. Solo esos 8 expertos se computan por token, lo que reduce el coste de inferencia a los 3,3B parámetros activos. La model card de la conversión no detalla la composición del dataset de entrenamiento ni si hubo RLHF/DPO; esa información corresponde a la model card del modelo original de Qwen, no incluida en la información proporcionada.

La innovación técnica de esta conversión reside en el pipeline de exportación: el decoder se escribe tensor a tensor con la API LiteRT Tensor desde el checkpoint bf16 (revisión `b2cff646`), evitando materializar un grafo fp32 completo. Los 128 expertos de cada capa se agrupan en una única custom op `moe` con activación SiLU, ejecutada con XNNPACK en CPU y ML Drift en GPU. Se aplica un truco de fusión (`--moe_fusion_guard`) que reescribe la suma residual como `(x + moe) + moe * 0` para impedir que ML Drift fusione la suma en el kernel moe, lo que rompería la compilación de shaders en WebGPU y Metal. Las activaciones se declaran en fp32 porque con fp16 las respuestas en GPU se corrompen (respuestas vacías o patrones repetidos). El sampler replica `generation_config.json` del original (top_p 0.8, top_k 20, temperature 0.7), aunque la repetition_penalty de 1.05 no se puede representar en los metadatos de LiteRT-LM.

## Capacidades

- Generación de código en modo instruct (non-thinking): el modelo no emite trazas de razonamiento.
- Tool calling / function calling: el modelo emite llamadas en formato XML (`<tool_call>`, `<function=…>`, `<parameter=…>`), y los metadatos declaran `supports_function_calling` con un `tool_call_config` que permite extraer nombre de función y argumentos.
- Razonamiento multi-paso orientado a tareas de programación y uso de herramientas.
- Generación de texto general en inglés.
- No soporta modo thinking (el modelo original es solo instruct).
- Capacidades multilingües limitadas al inglés según la model card.
- No se declaran capacidades de visión ni audio.

## Casos de uso

- Asistencia de código en IDE o editor: el modelo genera código a partir de instrucciones en lenguaje natural y puede invocar herramientas del entorno (por ejemplo, ejecutar tests o consultar documentación) mediante el formato XML de tool calls, integrándose en extensiones de editor que parseen ese formato.
- Automatización de pipelines CI/CD: dado su soporte de function calling, puede generar parches, sugerir comandos de build o invocar herramientas de linting/testing dentro de un agente que ejecute las llamadas emitidas por el modelo.
- Despliegue en dispositivos con runtime ligero: la conversión LiteRT-LM permite ejecutar el modelo en entornos donde no se dispone de PyTorch o CUDA, usando WebGPU o CPU con XNNPACK, útil para prototipos en portátiles Apple Silicon o estaciones sin GPU dedicada.
- Agentes de refactorización acotada: con contexto de 2.048 o 4.096 tokens, adecuado para tareas sobre ficheros individuales o fragmentos de código, no para repositorios completos.
- Generación de tests unitarios: el modelo puede producir casos de prueba a partir de firmas de funciones y docstrings, con la ventaja de que el tool calling permite validar la ejecución de los tests generados en un bucle agéntico.
- Evaluación comparativa de runtimes: sirve como banco de pruebas para medir el rendimiento de LiteRT-LM frente a vLLM o llama.cpp con el mismo modelo base, gracias a las métricas publicadas de prefill y decode.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible para esta conversión. Los únicos datos de rendimiento publicados son de velocidad de inferencia en un Apple M4 Max (128 GB) con WebGPU:

| Artefacto | Contexto | Decode (tokens/s) | Prefill (tokens/s) |
|---|---:|---:|---:|
| `qwen3_coder_30b_a3b_mixed_int4_ekv2048.litertlm` | 2.048 | 54,9 | 1.038 |
| `qwen3_coder_30b_a3b_mixed_int4_ekv4096.litertlm` | 4.096 | 44,7 | 706 |

Medición del 2026-11-09. Con activaciones fp16 declaradas, el decode mejora entre un 9 % y un 17 %, pero ninguna de las preguntas de verificación obtiene respuesta correcta, por lo que se descarta esa configuración.

## Requisitos de hardware

- VRAM/RAM estimada: los artefactos pesan 20,65 GB cada uno; se necesita al menos esa cantidad de memoria unificada o de sistema para cargar los pesos, más el espacio de la caché KV fp32 (2.048 o 4.096 tokens) y activaciones.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (el benchmark se hizo en M4 Max de 128 GB); GPUs con soporte WebGPU o ML Drift. No se han publicado mediciones en A100, H100 o RTX 4090.
- GPU de consumo: cabe en equipos con 24 GB o más de memoria unificada o VRAM, aunque no hay datos publicados de rendimiento en RTX 4090 u otras consumer.
- Despliegue: exclusivamente mediante LiteRT-LM. La release 0.19.1 de PyPI no ejecuta estos ficheros porque sus kernels `moe` solo aceptan GELU y el modelo usa SiLU; es necesario compilar LiteRT desde fuente con los PRs #11192 (GPU) y #11188 (XNNPACK/CPU). No compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: ver tabla de benchmarks (54,9 tokens/s decode, 1.038 tokens/s prefill en M4 Max con WebGPU, contexto 2.048).

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct (LiteRT-LM, esta ficha) | 30,5B / 3,3B | 2.048 o 4.096 | Apache 2.0 | LiteRT-LM | Requiere build con parches; solo inglés |
| Qwen/Qwen3-Coder-30B-A3B-Instruct (original) | 30,5B / 3,3B | no disponible en la información proporcionada | Apache 2.0 | safetensors / Transformers | Modelo fuente; soporta el mismo tool calling XML |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- La release estable de LiteRT-LM (0.19.1) no ejecuta estos ficheros: los kernels `moe` solo aceptan GELU, y el modelo usa SiLU. Se requiere compilar desde fuente con los PRs abiertos #11192 y #11188, lo que implica un riesgo de mantenimiento y de cambios en la API.
- Las activaciones deben ser fp32; con fp16 las respuestas en GPU se corrompen (respuestas vacías, un solo `*` o patrones repetidos), lo que limita optimizaciones de memoria.
- Contexto muy reducido (2.048 o 4.096 tokens) en comparación con el modelo original y con alternativas modernas; inadecuado para repositorios completos o conversaciones largas.
- Solo inglés declarado; no se garantiza calidad en castellano u otros idiomas.
- Modo non-thinking únicamente: no hay trazas de razonamiento, lo que puede penalizar tareas que requieran planificación explícita.
- La repetition_penalty de 1.05 del `generation_config.json` original no se puede representar en los metadatos de LiteRT-LM, por lo que el sampling difiere ligeramente del original.
- El CLI de LiteRT-LM no acepta herramientas: el soporte de tool calling se ha verificado a nivel de formato de salida, pero el parseo de llamadas por parte del runtime no se ha ejecutado en las pruebas publicadas.
- Riesgo de alucinación inherente a modelos de código; no se han publicado evaluaciones de sesgo ni de robustez para esta conversión.
- Licencia Apache 2.0 permite uso comercial, pero la cadena de responsabilidad sobre la conversión recae en litert-community, no en Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Qwen3-Coder-30B-A3B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct/blob/main/LICENSE
- Paper de referencia (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- PR LiteRT #11192 (kernel GPU moe con SiLU): https://github.com/google-ai-edge/LiteRT/pull/11192
- PR LiteRT #11188 (kernel XNNPACK CPU moe con SiLU): https://github.com/google-ai-edge/LiteRT/pull/11188
