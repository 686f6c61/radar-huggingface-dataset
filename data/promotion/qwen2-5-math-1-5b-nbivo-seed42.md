# promotion/Qwen2.5-Math-1.5B-NBIVO-seed42

## Resumen

`promotion/Qwen2.5-Math-1.5B-NBIVO-seed42` es un ajuste fino de `Qwen/Qwen2.5-Math-1.5B` (1.777.088.000 parámetros) orientado a razonamiento matemático, publicado por la cuenta `promotion` en el marco del proyecto de ética social en IA generativa Saltlux/IITP (KAIST, año 3, 2026). No es un modelo nuevo desde cero: es un checkpoint de alineamiento que aplica el método NB-IVO sobre el modelo base para mejorar la precisión en la resolución de problemas matemáticos con respuesta verificable.

El interés técnico está en el método, no en el tamaño. NB-IVO (Nash-Bargaining Implicit Value Optimization) sustituye el objetivo de grupo sin crítico de GN-IVO por un profesor de negociación de Nash sobre un pool finito de respuestas (NBPO), calculando márgenes Bradley-Terry por objetivo frente a un banco de muestras congeladas de la política base. El resultado es un ajuste que, con un solo objetivo binario (corrección de la respuesta), colapsa a un objetivo de corrección y se comporta de forma equivalente a GN-IVO.

Su relevancia es doble: por un lado documenta una receta de alineamiento con recompensa verificable reproducible (semilla 42, 200 actualizaciones, una sola A100-80GB); por otro, publica una evaluación certificada sobre AMC23 con protocolo explícito, y esa evaluación es también su principal limitación: 40 problemas y un intervalo de confianza bootstrap de 4,0 a 46,7 puntos de reducción de error.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (tag `qwen2`); número de capas y detalles internos no documentados en la model card |
| Parámetros totales | 1.777.088.000 (1,78 B), dato real de safetensors |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no documentada en la model card ni en los metadatos) |
| Tipos de cuantización | no se distribuyen pesos cuantizados; el repositorio solo contiene safetensors en bf16, convertible a 8/4 bits con herramientas estándar |
| Idiomas soportados | no disponible (la model card no documenta cobertura lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`); tamaño del repositorio 3,6 GB; no se publican GGUF |
| Modelo base | `Qwen/Qwen2.5-Math-1.5B` |
| Pipeline | text-generation |
| Etiquetas | `nb-ivo`, `gn-ivo`, `nbpo`, `alignment`, `conversational`, `endpoints_compatible` |
| Descargas / likes | 0 / 0 (a fecha de los metadatos) |

## Arquitectura y entrenamiento

La arquitectura del checkpoint es la del modelo base Qwen2.5-Math-1.5B, un transformer decoder-only denso de 1,78 B de parámetros; la model card no aporta detalles adicionales sobre capas, atención o tokenizador. La contribución del checkpoint es el procedimiento de alineamiento NB-IVO, que parte del objetivo de grupo sin crítico de GN-IVO (entropía cruzada entre una distribución objetivo sobre las K respuestas muestreadas de un prompt y sus ratios de política normalizados) y reemplaza el objetivo `softmax(mean reward / α)` por el profesor de negociación de Nash NBPO: para cada prompt se calculan márgenes Bradley-Terry por objetivo frente a un banco de muestras congeladas de la política base, valores de juego soft-min `V_k(p)`, puntos de desacuerdo `d_k`, y se resuelve `p* = argmax_p Σ_k log(V_k(p) − d_k) − KL(p ‖ uniform)/η`. Los prompts en los que ninguna mezcla mejora estrictamente todos los objetivos se descartan, las respuestas truncadas pierden frente a las finalizadas y la secuencia completa se ajusta con una KL k3 respecto al modelo base. Con un único objetivo binario, el profesor de Nash degenera en un objetivo basado en corrección y NB-IVO se comporta como GN-IVO.

El entrenamiento usa 3.200 prompts de MATH train (256 reservados como conjunto de desarrollo) y una recompensa de corrección sobre la respuesta en `\boxed{}` verificada con Math-Verify (equivalente a `trl.rewards.accuracy_reward`). La configuración es de 200 actualizaciones × 16 prompts × K=8 muestras (temperatura 0,7, 1.024 tokens), banco comparador de 6, learning rate 1e-6, grad clip 0,1, KL 0,01, AdamW, una A100-80GB, semilla 42. El checkpoint publicado corresponde a la actualización 200, seleccionada por precisión en el conjunto de desarrollo (sin usar datos de test).

## Capacidades

- Generación de texto conversacional con plantilla de chat (el repositorio incluye `generation_config.json` con la configuración de decodificación de la evaluación).
- Razonamiento matemático paso a paso, con formato de respuesta final dentro de `\boxed{}`.
- Resolución de problemas de competición (el protocolo de evaluación usa AMC23) con decodificación greedy y hasta 2.048 tokens nuevos.
- Autoconsistencia vía muestreo múltiple: la evaluación reporta avg@8 con temperatura 0,6, lo que permite usar el modelo en modo voto mayoritario.
- Compatibilidad con `text-generation-inference` y endpoints de HuggingFace (tags `text-generation-inference` y `endpoints_compatible`).
- No hay evidencia en la información disponible de soporte de tool calling, function calling, capacidades de agente multi-paso, visión, audio ni modo "thinking" explícito.

## Casos de uso

- Evaluación de métodos de alineamiento: servir como checkpoint de referencia para reproducir NB-IVO frente a GN-IVO y a la política base con la misma semilla y el mismo protocolo de recompensa verificable.
- Investigación en RLHF sin crítico: usar el par base/ajustado para medir cuánto de la mejora proviene del profesor de Nash frente a un objetivo de corrección plano, dado que con un objetivo binario ambos métodos coinciden.
- Resolución de problemas matemáticos de competición en lotes: con decodificación greedy y 2.048 tokens nuevos se puede procesar un banco de problemas tipo AMC/AIME y puntuar automáticamente con Math-Verify.
- Generación de datos sintéticos de razonamiento: muestrear K respuestas por problema (temperatura 0,7) y filtrar por corrección verificada para construir datasets de trazas matemáticas.
- Componente de un pipeline de auto-consistencia: ejecutar 8 muestras por problema y agregar por voto mayoritario, aprovechando el avg@8 del 50,3 % reportado frente al 29,7 % del base.
- Servicio ligero de tutoría matemática en entornos con GPU de gama media: 1,78 B de parámetros permiten despliegue en una sola GPU consumer con cuantización de 8 o 4 bits y latencia interactiva.
- Verificación cruzada de resultados: usar el modelo como segundo evaluador de respuestas matemáticas generadas por modelos mayores, con la salvedad de que su precisión absoluta en AMC23 es del 50 %.

## Benchmarks y rendimiento

Evaluación certificada WiseStone 2025-394-VSW-R sobre `math-ai/amc23` (40 problemas), plantilla de chat con el mensaje `"{question}\nPlease reason step by step, and put your final answer within \\boxed{}."`, decodificación greedy con `max_new_tokens=2048`, parada en `<|im_end|>`/`<|endoftext|>`, vLLM 0.19.1 en bf16 y Math-Verify 0.8.0 para el scoring.

| Modelo | Aciertos | Reducción de error vs base (IC 95 % bootstrap) | Objetivo 2026 | avg@8 (T 0,6) |
|---|---:|---:|---|---:|
| Qwen2.5-Math-1.5B (base) | 13/40 (32,5 %) | — | — | 29,7 % |
| Qwen2.5-Math-1.5B-NBIVO-seed42 | 20/40 (50,0 %) | 25,9 % (4,0–46,7) | ≥ 23 % (cumplido) | 50,3 % |

Con 40 problemas, cada acierto vale 3,7 puntos de reducción de error; el intervalo de confianza es amplio y su límite inferior (4,0 %) queda por debajo del objetivo del 23 %. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 3,6 GB (tamaño real del repositorio), por lo que la inferencia en precisión completa cabe holgadamente en cualquier GPU con 8 GB o más, dejando espacio para caché KV y activaciones.
- VRAM estimada para inferencia: ~6-8 GB en bf16 con contexto moderado y lote 1; ~2 GB en cuantización de 8 bits; ~1,2-1,5 GB en 4 bits (estimaciones a partir del número de parámetros, no medidas publicadas).
- GPU recomendadas: A100-80GB (usada en el entrenamiento y en la evaluación con vLLM), H100 para servir en lote con throughput alto, RTX 4090 / RTX 3090 para desarrollo, RTX 4060 Ti 16 GB o RTX 3060 12 GB para inferencia cuantizada.
- Cabe en GPU consumer: sí, en cualquier tarjeta con 8 GB o más en 4/8 bits y en tarjetas de 8-12 GB en bf16 con contexto corto.
- Opciones de despliegue: vLLM 0.19.1 en bf16 (configuración usada en la evaluación certificada), `transformers` con `generation_config.json` incluido, TGI (etiqueta `text-generation-inference`), endpoints de HuggingFace. Para CPU o GPU muy limitadas habría que convertir los safetensors a GGUF con llama.cpp, ya que no se publican pesos GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Método / enfoque | AMC23 | Licencia | Disponibilidad |
|---|---:|---|---|---:|---|---|
| Qwen2.5-Math-1.5B-NBIVO-seed42 | 1,78 B | no disponible | Ajuste NB-IVO con recompensa verificable sobre MATH train | 20/40 (avg@8 50,3 %) | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen2.5-Math-1.5B (base) | 1,5 B | no disponible en esta información | Modelo matemático preentrenado/ajustado por Qwen | 13/40 (avg@8 29,7 %) | Apache 2.0 | HuggingFace |
| Qwen2.5-Math-7B | no disponible en esta información | no disponible en esta información | Misma familia, mayor escala | no disponible | no disponible en esta información | HuggingFace |
| DeepSeek-R1-Distill-Qwen-1.5B | no disponible en esta información | no disponible en esta información | Destilación de trazas de razonamiento | no disponible | no disponible en esta información | HuggingFace |

No se dispone de resultados comparables bajo el mismo protocolo (AMC23, greedy, Math-Verify 0.8.0) para las alternativas, por lo que la comparación numérica solo es válida frente al modelo base.

## Limitaciones y advertencias

- Base empírica muy estrecha: la única evaluación publicada son 40 problemas de AMC23; el intervalo de confianza bootstrap de la reducción de error va de 4,0 a 46,7 puntos y su límite inferior incumpliría el objetivo declarado del 23 %.
- Sesgos: no se documenta ninguna evaluación de sesgo, toxicidad o seguridad, pese a enmarcarse en un proyecto de ética social en IA generativa.
- Idiomas: la cobertura lingüística no está documentada; toda la evidencia disponible es en inglés (prompts de MATH y AMC23).
- Alucinación: es un modelo de 1,78 B ajustado solo con recompensa de corrección; puede producir cadenas de razonamiento plausibles con resultados incorrectos, especialmente fuera del dominio de competición.
- Sobreajuste al formato: el ajuste y la evaluación dependen de la plantilla de chat concreta y del formato `\boxed{}`; otros formatos de prompt pueden degradar el rendimiento de forma no medida.
- Objetivo único: con una sola recompensa binaria, NB-IVO y GN-IVO son equivalentes según el propio autor, por lo que este checkpoint no demuestra la ventaja del método de negociación de Nash.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen2.5-Math-1.5B, que conviene revisar por separado.
- Trazabilidad y mantenimiento: cuenta de autor genérica (`promotion`), 0 descargas y 0 likes, sin repositorio de código enlazado en la información disponible; tratar como checkpoint de investigación, no como artefacto listo para producción.
- Sin datos de latencia, throughput ni pruebas de carga publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/promotion/Qwen2.5-Math-1.5B-NBIVO-seed42
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Dataset de evaluación AMC23: https://huggingface.co/datasets/math-ai/amc23
- Math-Verify (scoring y `accuracy_reward`): https://github.com/huggingface/Math-Verify
- TRL (implementación de referencia de las recompensas): https://github.com/huggingface/trl
- vLLM 0.19.1 (motor usado en la evaluación): https://github.com/vllm-project/vllm

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos eran definiciones de diccionario del término "promotion" y no se han utilizado.
