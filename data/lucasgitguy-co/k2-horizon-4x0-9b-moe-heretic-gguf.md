# Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-heretic-GGUF

## Resumen

K2-Horizon-4x0.9B-MoE-heretic-GGUF es la versión cuantizada en formato GGUF del modelo K2-Horizon-4x0.9B-MoE-heretic, un modelo de lenguaje de tipo mezcla de expertos (MoE) construido por el usuario Lucasgitguy-co a partir de los checkpoints de aprendizaje por refuerzo de K2-Horizon-0.9B, desarrollado por IFM. El modelo combina cuatro expertos por capa con enrutamiento top-1 y router softmax, sumando 3.060.266.496 parámetros totales de los cuales aproximadamente 1.080 millones se activan por token. Está pensado para ejecutarse en llama.cpp y ofrece una ventana de contexto de 128K tokens mediante YaRN.

La característica diferencial es su naturaleza "abliterated" o "uncensored": el proceso de abliteración aplicado con la herramienta Heretic elimina en gran medida los rechazos del modelo base (3 de cada 100 en el conjunto de prueba de Heretic para la versión bf16). El modelo es además un modelo de razonamiento: genera una traza de pensamiento dentro de las etiquetas `<ifm|think> … </ifm|think>` antes de emitir la respuesta final, y con `--jinja` en llama-server esa traza se separa en el campo `reasoning_content`.

Este repositorio contiene únicamente los archivos GGUF listos para llama.cpp, con siete cuantizaciones medidas (de BF16 a Q3_K_M) y sus métricas de perplejidad y divergencia KL frente al original. Es relevante para quienes necesitan un modelo pequeño, de licencia Apache-2.0, sin filtros de rechazo y ejecutable en hardware de consumo, aunque con la advertencia importante de que sus cuatro expertos son casi idénticos y el modelo se comporta de forma muy similar a un denso de 0,9B con el triple de tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `k2-horizon` (MoE transformer, 4 expertos por capa, enrutamiento top-1, router softmax) |
| Parametros totales | 3.060.266.496 (3,06B) |
| Parametros activos | ~1,08B por token |
| Longitud de contexto | 128K (mediante YaRN) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, Q3_K_M (Q2_K descartada por perdida severa) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors bf16 |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos con cuatro expertos por capa y enrutamiento top-1 sobre un router con función de activación softmax. El conversor de llama.cpp lee explícitamente el campo `router_score_func: softmax` del modelo original y lo traduce como función de gating de expertos. Los cuatro expertos provienen de los checkpoints de aprendizaje por refuerzo de IFM, que difieren del checkpoint `main` en aproximadamente un 0,05 % de sus pesos; por tanto, los expertos son casi idénticos entre sí y el modelo se comporta de forma prácticamente equivalente al modelo denso de 0,9B del que deriva, pero con un tamaño tres veces mayor.

El modelo base K2-Horizon-0.9B fue desarrollado por IFM bajo licencia Apache-2.0 e incluye código y checkpoints de RL. Sobre esa base se aplicó abliteración mediante la herramienta Heretic de Philipp Emanuel Weidmann, que elimina direcciones de activación asociadas al rechazo. No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset ni detalles del proceso de RLHF/DPO más allá de la existencia de checkpoints de RL. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` (commit a4d4f2f, 2026-11-09) y las cuantizaciones con `llama-quantize` de llama.cpp 0.9.0, sin matriz de importancia.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat embebida compatible con `--jinja`.
- Razonamiento explícito: genera traza de pensamiento en `<ifm|think> … </ifm|think>`, expuesta como `reasoning_content` en llama-server.
- Capacidades matemáticas básicas y aritmética (el ejemplo de la model card resuelve correctamente 17*3).
- Soporte de contexto largo de hasta 128K tokens mediante YaRN.
- Multilingüe limitado a inglés y chino.
- Modelo sin censura: los rechazos están en gran medida eliminados (3/100 en el conjunto de prueba de Heretic para bf16).
- Compatible con servidor OpenAI-compatible de llama.cpp (`llama-server`), lo que permite integrarlo en clientes que hablen la API de OpenAI.
- No se documenta soporte de tool calling, function calling, visión, audio ni agentes multi-paso en la información disponible.

## Casos de uso

- Experimentación con modelos de razonamiento en local: gracias a su traza de pensamiento separada en `reasoning_content`, permite estudiar y depurar cadenas de razonamiento en un modelo de 1,08B activos que cabe en hardware modesto.
- Asistente conversacional en inglés o chino sin filtros de rechazo: útil para prototipos de chat donde se necesita que el modelo responda a peticiones que otros modelos rechazarían, con la responsabilidad de uso que ello implica.
- Despliegue en hardware de consumo: con la cuantización Q5_K_M (2,18 GB) puede ejecutarse en GPUs de gama media o incluso en CPU, lo que lo hace adecuado para demos y entornos con recursos limitados.
- Servidor OpenAI-compatible para pruebas de integración: `llama-server` expone `/v1/chat/completions`, de modo que se puede usar como backend de sustitución en pipelines que ya consumen la API de OpenAI.
- Procesamiento de documentos largos en inglés o chino: la ventana de 128K con YaRN permite resumir o extraer información de textos extensos dentro de esas lenguas.
- Investigación sobre abliteración: sirve como caso de estudio de cómo afecta la eliminación de rechazos a un modelo pequeño y de cómo se comporta tras cuantización agresiva.
- Generación de texto técnico o creativo en inglés: con temperatura 0,6 y top-p 0,95 recomendados por el autor del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona métricas de calidad de cuantización medidas con `llama-perplexity --kl-divergence` sobre 40 × 512 tokens de texto técnico en inglés (README y docs de llama.cpp):

| Archivo | Tamano | Perplejidad | KLD vs BF16 | Mismo token top | Notas |
|---|---|---|---|---|---|
| BF16 | 6,12 GB | 5,371 | 0 | 100 % | referencia, sin pérdida |
| Q8_0 | 3,25 GB | 5,377 (+0,1 %) | 0,0010 | 98,7 % | casi sin pérdida |
| Q6_K | 2,51 GB | 5,399 (+0,6 %) | 0,0099 | 95,7 % | muy cercano a BF16 |
| Q5_K_M | 2,18 GB | 5,434 (+1,2 %) | 0,0320 | 92,6 % | recomendado |
| Q4_K_M | 1,87 GB | 5,745 (+7,0 %) | 0,1189 | 87,0 % | pérdida apreciable |
| Q4_K_S | 1,76 GB | 5,906 (+10,0 %) | 0,1381 | 85,9 % | pérdida apreciable |
| Q3_K_M | 1,49 GB | 6,763 (+26,0 %) | 0,2998 | 79,2 % | pérdida severa, solo si falta memoria |

La Q2_K se generó pero se retiró: perplejidad 28,9 (5,4 veces la de BF16) y mismo token top solo el 50 % de las veces. Con solo 1,08B parámetros activos, el modelo es sensible a la cuantización y Q5_K_M es el archivo más pequeño que se mantiene cerca de BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~1,5 GB (Q3_K_M) hasta ~6,2 GB (BF16), pasando por 2,18 GB (Q5_K_M recomendado) y 3,25 GB (Q8_0).
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 3-4 GB de VRAM libre puede alojar Q5_K_M. No hay datos de rendimiento en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, las cuantizaciones Q5_K_M y Q4_K_M caben en GPUs de gama media y baja. El autor solo probó en un Apple M4 (Metal).
- Opciones de despliegue: llama.cpp 0.9.0 (build 12110) o superior, con `llama-cli` y `llama-server`. Ollama, LM Studio y otras aplicaciones basadas en llama.cpp solo funcionarán cuando incorporen una versión de llama.cpp con soporte para `k2-horizon`; ninguna fue probada.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| K2-Horizon-4x0.9B-MoE-heretic-GGUF | 3,06B totales / 1,08B activos | 128K (YaRN) | Apache-2.0 | GGUF | MoE con expertos casi idénticos; sin censura; razonamiento |
| K2-Horizon-0.9B (IFM) | ~0,9B denso | no disponible | Apache-2.0 | safetensors | Base del que derivan los expertos; comportamiento casi idéntico |
| K2-Horizon-4x0.9B-MoE-heretic (bf16) | 3,06B totales / 1,08B activos | 128K (YaRN) | Apache-2.0 | safetensors | Versión sin cuantizar de este repositorio |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con alternativas de la misma categoría. La comparación con otros modelos pequeños abliterated o MoE de tamaño similar no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Expertos casi idénticos: los cuatro expertos difieren del checkpoint `main` en ~0,05 % de los pesos, por lo que el modelo se comporta casi como el denso de 0,9B pero ocupa tres veces más. El beneficio de la arquitectura MoE es prácticamente nulo en calidad.
- Arquitectura nueva: versiones antiguas de llama.cpp fallan con `unknown model architecture: 'k2-horizon'`. Ollama, LM Studio y otras aplicaciones basadas en llama.cpp no funcionarán hasta que incorporen soporte; no fueron probadas.
- Modelo sin censura: los rechazos están en gran medida eliminados. El usuario es responsable del uso de las salidas y de las implicaciones legales y éticas.
- Sensibilidad a la cuantización: por debajo de Q5_K_M la pérdida de calidad es notable (Q4_K_M +7 % de perplejidad, Q3_K_M +26 %). Q2_K se retiró por degradación severa.
- Idiomas limitados a inglés y chino; no se garantiza un rendimiento adecuado en castellano.
- Las cifras de rechazo y ARC-Easy corresponden solo al modelo bf16; las cuantizaciones se midieron únicamente con perplejidad y KLD.
- Solo se probó en un Apple M4 (Metal); no hay validación en GPUs NVIDIA o AMD ni mediciones de latencia.
- Riesgo de alucinación inherente a un modelo de 1,08B parámetros activos; no se han publicado evaluaciones de fidelidad factual.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de filtros de rechazo puede exponer al despliegue a contenido inapropiado si no se añaden salvaguardas externas.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-heretic-GGUF
- Modelo base (bf16): https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-heretic
- Modelo original de IFM: https://huggingface.co/IFM
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
