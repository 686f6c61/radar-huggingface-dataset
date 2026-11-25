# HOWILLMAKEIT/ShopMaster-4B

## Resumen

ShopMaster-4B es un modelo de lenguaje multimodal de 4.659.865.088 parámetros (4,66 mil millones) desarrollado por HOWILLMAKEIT como un ajuste fino del modelo base Qwen/Qwen3.5-4B. Está especializado en tareas de agente de compras multietapa en chino, es decir, la ejecución de flujos de búsqueda de producto, comparación, selección y compra dentro de un simulador de comercio electrónico mediante llamadas a herramientas (tool calling). El modelo se distribuye con pesos BF16 completos del "shell" multimodal, con la LoRA ya fusionada, lo que permite su uso directo sin pasos adicionales de combinación.

La relevancia del modelo reside en su estrategia de entrenamiento: parte de un modelo base pequeño y aplica primero un SFT "action-only" sobre 388 trayectorias verificadas sin error (extraídas de DeepSeek-V4.1-Flash-1017), y después 100 pasos de aprendizaje por refuerzo con GiGPO + DAPO sobre veRL v1. Según la model card, este proceso permite que un modelo de 4B supere al profesor DeepSeek-V4.1-Flash-1017 en la tarea específica de compras multietapa, con un 65,75 % de éxito estricto frente al 48,31 % del profesor, usando además menos tokens y menos pasos por pregunta.

El modelo está pensado para entornos de agente con contexto largo (hasta 32K tokens en evaluación, 24K durante el RL) y soporta tool calling con el parser `qwen3_coder`. La licencia es Apache-2.0, heredada del modelo base, y los idiomas declarados son chino (zh) e inglés (en).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), con torre de visión preservada sin ajuste; LoRA rank-16 aplicada solo en 248 capas lineales del backbone de lenguaje y fusionada en FP32 a BF16 |
| Parámetros totales | 4.659.865.088 (4,66 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K en evaluación (32.768); 24K durante el entrenamiento RL |
| Tipos de cuantización | no disponible (el repo distribuye pesos BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, estructura idéntica a Qwen/Qwen3.5-4B, con `generation_config.json` que fija `eos_token_id: [248044, 248046]`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal con torre de visión y backbone de lenguaje. El ajuste se realizó en dos fases. La primera, un SFT "action-only": se recopilaron 1.015 trayectorias exitosas de DeepSeek-V4.1-Flash-1017, verificadas mediante replay por turnos en el entorno con cero errores, y se muestrearon 388 por estratificación de longitud; se desactivó la cadena de pensamiento y se supervisó únicamente el segmento de acción `<tool_call>` durante 2 épocas. Esto da lugar al modelo intermedio ShopMaster-4B-SFT.

La segunda fase consistió en 100 pasos de RL con GiGPO + DAPO sobre veRL v1, con contexto de 24K. Se introdujo una ventaja de anclaje por paso sin descuento basada en el estado público de página del entorno (GiGPO) y actualizaciones estabilizadas estilo DAPO (`token-mean`, `clip_ratio_high=0.28`, filtrado dinámico de grupos completos). Solo se actualizaron 248 capas lineales del backbone de lenguaje mediante LoRA de rango 16, que después se fusionó a FP32 y se volcó a los shards BF16 nativos multimodales. La torre de visión se mantuvo intacta y la estructura de directorios replica exactamente la del modelo base.

## Capacidades

- Generación de texto y razonamiento orientado a tareas de agente.
- Llamada a herramientas (tool calling) con formato compatible con el parser `qwen3_coder` de SGLang.
- Razonamiento multietapa y ejecución de planes de compra (búsqueda, filtrado, comparación, selección, compra) en un entorno simulado.
- Capacidad multimodal de entrada (image-text-to-text) por herencia del modelo base, aunque la torre de visión no se ha ajustado para esta tarea.
- Multilingüe limitado a chino e inglés según la model card.
- Modo de pensamiento controlable: la model card recomienda `enable_thinking=False` para uso en producción, ya que el SFT se entrenó sin cadena de pensamiento.
- Reducción de bucles repetitivos y de llamadas inválidas a herramientas respecto al modelo base (según métricas de la model card: `repeat_loop` 6,9 % y `invalid_tool` 0,8 %).

## Casos de uso

- Agente de compras en comercio electrónico: el modelo ejecuta flujos multietapa de búsqueda y selección de producto invocando herramientas del catálogo, con una tasa de éxito estricta del 65,75 % en el conjunto Holdout-915 y un consumo medio de 226 tokens por pregunta, lo que lo hace adecuado para entornos con coste por token sensible.
- Automatización de atención al cliente con catálogo: puede gestionar conversaciones multi-turno con contexto de hasta 32K tokens, manteniendo el estado de la conversación y llamando a herramientas de consulta de stock o precios.
- Integración en pipelines de agentes con SGLang: el despliegue con `--tool-call-parser qwen3_coder` y `--context-length 32768` permite servirlo como backend de un orquestador de agentes en producción.
- Asistente de comparación de productos: dado un conjunto de restricciones (precio máximo, color, categoría), el modelo planifica consultas sucesivas al catálogo y sintetiza una recomendación, reduciendo llamadas inválidas a herramientas.
- Evaluación y benchmarking de agentes de compra: sirve como referencia reproducible sobre el conjunto `eval_holdout_915.jsonl` con el protocolo `paper_strict`, útil para comparar nuevas políticas de RL.
- Investigación en RL para agentes: el código y la configuración de GiGPO + DAPO sobre veRL v1 permiten reutilizar el pipeline para otras tareas de agente con recompensas por paso.
- Prototipado en hardware de consumo: la model card indica que puede ejecutarse con 32K de contexto en una GPU de consumo de 16 GB mediante SGLang.

## Benchmarks y rendimiento

Resultados en el conjunto Holdout-915 congelado (`paper_strict`, cuatro factores multiplicados, `T=0.0`, contexto 32K), según la model card:

| Modelo | Éxito estricto | Puntuación media | Tasa de compra | Precisión de pedido | `repeat_loop` | `invalid_tool` | Pasos/pregunta | Tokens/pregunta |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen3.5-4B (base, sin thinking) | 35,10 % | 0,382 | 74,83 % | 46,90 % | 19 (2,1 %) | 182 (19,9 %) | 4,5 | 311 |
| DeepSeek-V4.1-Flash-1017 (zero-shot) | 48,31 % | 0,509 | 64,92 % | 74,41 % | 34 (3,7 %) | 242 (26,4 %) | 9,5 | 1.367 |
| ShopMaster-4B-SFT (ep2) | 58,34 % | 0,607 | 84,75 % | 68,84 % | 124 (13,6 %) | 10 (1,1 %) | 8,2 | 267 |
| Vanilla GRPO (paso 100) | 58,54 % | 0,609 | 86,66 % | 67,56 % | 107 (11,7 %) | 10 (1,1 %) | 7,3 | 240 |
| **ShopMaster-4B (GiGPO + DAPO)** | **65,75 %** | **0,675** | **91,11 %** | 72,17 % | 63 (6,9 %) | **7 (0,8 %)** | 6,7 | **226** |

Prueba de McNemar pareada exacta bilateral reportada en la model card: +7,41 pp frente al SFT (`p = 7,28e-8`), +7,17 pp frente a Vanilla GRPO (`p = 4,10e-8`) y +17,34 pp frente al profesor (`p = 3,89e-20`).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y KV cache; con contexto de 32K el consumo crece de forma significativa.
- La model card indica que una GPU de consumo de 16 GB puede ejecutar el modelo con contexto de 32K mediante SGLang.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por tamaño, encaja en GPUs de 16 GB o más (por ejemplo, RTX 4090, A100, H100) para despliegues con contexto largo.
- Opciones de despliegue documentadas: SGLang (`python -m sglang.launch_server` con `--tool-call-parser qwen3_coder`) y Transformers con `AutoModelForImageTextToText`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card solo reporta tokens generados por pregunta (226 de media) y pasos por pregunta (6,7).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Éxito estricto (Holdout-915) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| ShopMaster-4B | 4,66 B | 32K | 65,75 % | Apache-2.0 | Hugging Face, GitHub, demo web |
| Qwen3.5-4B (base) | 4 B (aprox., según nombre) | no disponible | 35,10 % | Apache-2.0 (heredada) | Hugging Face |
| DeepSeek-V4.1-Flash-1017 (profesor) | no disponible | no disponible | 48,31 % | no disponible | no disponible |
| Vanilla GRPO (paso 100) | 4,66 B | 24K (entrenamiento) | 58,54 % | no disponible | no disponible |

La comparación se limita a los modelos evaluados en la model card; no se dispone de datos de benchmarks de propósito general (MMLU, HumanEval, GSM8K) para contrastar con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (agente de compras multietapa en chino) y su rendimiento fuera de ese dominio no está documentado.
- Los benchmarks reportados se limitan al conjunto Holdout-915 del simulador ShopSimulator; no hay evidencia de generalización a catálogos o entornos reales.
- La tasa de bucles repetitivos (`repeat_loop`) es del 6,9 %, superior a la del modelo base (2,1 %), lo que puede implicar conversaciones que se estancan en producción.
- La tasa de compra (91,11 %) es alta; en un entorno real esto puede traducirse en acciones de compra no deseadas si el agente no se supervisa.
- Los idiomas soportados son solo chino e inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinación en la descripción de productos y en la interpretación de restricciones del usuario no documentado explícitamente.
- La torre de visión no se ha ajustado; las capacidades multimodales no están validadas para esta tarea.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base Qwen/Qwen3.5-4B y conviene verificar sus términos adicionales.
- El modelo se publicó el 25 de noviembre de 2026 y cuenta con 9 descargas y 0 likes en Hugging Face, por lo que la validación por parte de la comunidad es aún muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HOWILLMAKEIT/ShopMaster-4B
- Repositorio GitHub: https://github.com/HOWILLMAKEIT/ShopMaster-4B
- Página del proyecto: https://howillmakeit.github.io/ShopMaster-4B/
- Modelo SFT intermedio: https://huggingface.co/HOWILLMAKEIT/ShopMaster-4B-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset ShopSimulator (ACL 2026): https://huggingface.co/datasets/wpei/ShopSimulator
- Framework veRL: https://github.com/volcengine/verl
