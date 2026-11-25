# hermitdave/Ling-3.2-air-MLX-RCO-2.75bpw

## Resumen

Ling-3.2-air-MLX-RCO-2.75bpw es una conversión cuantizada en formato MLX del modelo inclusionAI/Ling-3.2-air, publicada por el usuario hermitdave. Se trata de un artefacto de inferencia para Apple Silicon que reduce el checkpoint original de 132 GB a 43,97 GB mediante una asignación de precisión mixta basada en error de reconstrucción (RCO), con un promedio de 2,750 bits por peso sobre los 127.900 millones de parámetros del modelo. El modelo base es un transformer híbrido con mezcla de expertos (MoE) y atención lineal, orientado a generación de texto y conversación.

La relevancia de esta ficha reside en que demuestra la viabilidad de ejecutar un MoE de gran tamaño en hardware de consumo Apple con un presupuesto de memoria de 64 GB, a costa de una pérdida medible de precisión frente a cuantizaciones más anchas. El autor documenta con detalle el protocolo de evaluación, los límites prácticos de contexto en el stack MLX y las advertencias de fidelidad respecto al checkpoint original.

Es importante subrayar que este artefacto es solo texto: el modelo original es multimodal, pero la torre de visión y sus conectores no forman parte de la conversión. Además, requiere código de confianza (`trust_remote_code`) porque la implementación estándar de `mlx_lm` descarta el clampado SwiGLU por capa que el modelo base entrena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con atención lineal (bailing_hybrid, KDA + MLA con compuertas) |
| Parametros totales | 127.486.405.600 (127,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262 K declarados en entrenamiento; ~8 K prácticos en MLX sobre 64 GB |
| Tipos de cuantizacion | Mixta: 2 bits afín (grupo 64) en expertos enrutados, 8 bits en expertos compartidos, atención, cabeza MTP, embeddings y lm_head |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), 43,97 GB en disco, 2,750 bpw efectivos |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida denominada `bailing_hybrid`: combina capas de atención lineal (KDA) con atención MLA con compuertas, sobre un esqueleto MoE con 512 expertos enrutados por capa en las capas 2 a 41, más expertos compartidos. Incluye una cabeza MTP (multi-token prediction) en la capa 42. La conversión cuantiza únicamente el tronco, ya que no existe cargador MLX para la variante multimodal `bailing_moe_v3_vl`.

El proceso de cuantización parte del checkpoint FP8 publicado (expertos en block-float E4M3 con bloques 128×128 y rejilla de escalas en float32). El autor reconstruye primero BF16 de forma validada bit a bit contra los códigos y escalas del publicador, y después aplica cuantización. La asignación de anchos es RTN basada en error de reconstrucción por tensor, sin matriz de importancia ni criterio de pérdida aguas abajo. Los expertos enrutados se almacenan apilados por capa y proyección como `switch_mlp.<proj>`, que es lo que espera `SwitchGLU` de MLX. El suelo de viabilidad medido para esta familia es 2,49 bpw, por lo que esta receta queda 0,26 bpw por encima del mínimo posible protegiendo los tensores sensibles a calidad.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Razonamiento y respuesta a preguntas de conocimiento general (evaluado en MMLU, ARC, HellaSwag, WinoGrande).
- Generación de código: el autor reporta que el clampado SwiGLU entrenado afecta a HumanEval (88,41 % con clamp frente a 71,34 % sin él en esta familia), lo que indica capacidad de código en el modelo base.
- Predicción multi-token mediante la cabeza MTP incluida en la conversión.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión): ausentes en este artefacto; el modelo base las tiene, pero la torre de visión se omite.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener diálogos multi-turno en inglés o chino con un techo práctico de ~8 K tokens de contexto en un M3 Max de 64 GB, lo que cubre la mayoría de interacciones de chat sin salir del equipo del usuario.
- Prototipado e investigación en Apple Silicon: sirve como banco de pruebas para estudiar el impacto de cuantizaciones agresivas (2,75 bpw frente a 4,62 bpw) en tareas de razonamiento, con métricas absolutas publicadas y comparables dentro de la misma familia.
- Generación de código en local para desarrolladores con hardware Apple: la preservación del clampado SwiGLU por capa mantiene la fidelidad en tareas de código, y el modelo puede integrarse en flujos de trabajo de edición asistida sin conexión.
- Evaluación de técnicas de cuantización: el artefacto documenta receta, escalas, anchos por componente y resultados, lo que lo convierte en material útil para reproducir o contrastar asignaciones alternativas de bits.
- Despliegue con offload de expertos: mediante `omlx.patches.moe_expert_offload` se pueden servir checkpoints mayores que la RAM disponible manteniendo el enrutamiento exacto, útil para experimentar con variantes de mayor precisión en equipos de 64 GB.
- Procesamiento de documentos en chino e inglés: con ~8 K tokens prácticos se pueden resumir o extraer información de documentos de extensión moderada en ambos idiomas, siempre que se acepte la pérdida de precisión de la cuantización a 2 bits en los expertos.

## Benchmarks y rendimiento

Evaluación zero-shot con protocolo fijo: 5 tareas × 400 ejemplos, prompts idénticos, intervalo de confianza Wilson al 95 %. Números absolutos; no se reclama ratio de recuperación frente a BF16 porque el profesor de 238 GB no cabe en la máquina de medida.

| Tarea | 2,75 bpw | 4,62 bpw |
|---|---:|---:|
| ARC-Challenge | 0,5200 [0,471, 0,569] | 0,5900 [0,541, 0,637] |
| ARC-Easy | 0,7975 [0,755, 0,834] | 0,8275 [0,787, 0,861] |
| HellaSwag | 0,4300 [0,382, 0,479] | 0,4700 [0,422, 0,519] |
| WinoGrande | 0,5850 [0,536, 0,632] | 0,5950 [0,546, 0,642] |
| MMLU | 0,5375 [0,489, 0,586] | 0,5750 [0,526, 0,623] |
| Media | 0,5740 | 0,6115 |

Rendimiento medido en Apple M3 Max de 64 GB con `mlx_lm` en proceso:

| Medición | Resultado |
|---|---|
| Prefill (720 tokens) | 805 tok/s |
| Decode (256 tokens, 3 ejecuciones) | 53,9 / 54,6 / 48,8 tok/s |
| Memoria pico | 41,8 GB |

Comportamiento según longitud de contexto:

| Contexto | Prefill | Decode | Pico |
|---:|---:|---:|---:|
| 2 K | 582 tok/s | 35,5 tok/s | 44,2 GB |
| 4 K | 779 tok/s | 33,6 tok/s | 46,8 GB |
| 8 K | 718 tok/s | 32,0 tok/s | 54,2 GB |
| 16 K | 123 tok/s | 0,94 tok/s | 75,3 GB (swap) |
| ≥ 32 K | falla | — | límite de búfer por asignación de Metal |

## Requisitos de hardware

- VRAM o memoria unificada estimada: 41,8 GB en pico para inferencia residente con contexto corto; 54,2 GB a 8 K de contexto; 75,3 GB a 16 K (con swap).
- GPU recomendadas: Apple Silicon con memoria unificada de 64 GB o superior (medido en M3 Max de 64 GB). No se documenta soporte para A100, H100 ni RTX 4090, ya que el formato es MLX.
- ¿Cabe en GPU de consumo? Solo en Apple Silicon de gama alta con 64 GB o más de memoria unificada. No es ejecutable en GPUs NVIDIA de consumo con este artefacto.
- Opciones de despliegue: `mlx_lm` (librería MLX) con `trust_remote_code=True`; CLI `mlx_lm.generate`; offload de expertos mediante `omlx.patches.moe_expert_offload` para checkpoints mayores que la RAM.
- Latencia y throughput: prefill de 805 tok/s y decode de ~49-55 tok/s a contexto corto; degradación severa a partir de 16 K (0,94 tok/s de decode) y fallo por encima de 32 K por el límite de asignación de Metal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Ling-3.2-air-MLX-RCO-2.75bpw (este) | 127,9 B | 262 K declarados, ~8 K prácticos en MLX | 2,750 bpw mixta | MIT | safetensors MLX |
| Ling-3.2-air-MLX (4,62 bpw, misma familia) | 127,9 B | 262 K declarados | 4,62 bpw mixta | MIT | safetensors MLX |
| inclusionAI/Ling-3.2-air (base) | 127,9 B | 262 K | FP8 / BF16 | MIT | safetensors |

La comparación directa de rendimiento entre las dos variantes MLX de la familia muestra una media de 0,5740 para 2,75 bpw frente a 0,6115 para 4,62 bpw en el conjunto de cinco tareas. No se dispone de datos de benchmarks de modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: la torre de visión y los conectores `linear_proj` del modelo base están ausentes; no se puede usar para tareas multimodales.
- Contexto práctico muy inferior al declarado: ~8 K tokens cómodos en 64 GB; a 16 K el decode cae a 0,94 tok/s y por encima de 32 K falla por el límite de búfer por asignación de Metal. Es una limitación del runtime MLX, no de la cuantización.
- Pérdida de precisión medible: la media de las cinco tareas baja de 0,6115 (4,62 bpw) a 0,5740 (2,75 bpw), con caídas notables en ARC-Challenge y HellaSwag.
- Fidelidad respecto al original: la conversión parte del checkpoint FP8 publicado, no de los pesos pre-FP8; el redondeo del publicador queda incorporado en todas las variantes derivadas.
- Asignación de bits no consciente de activaciones: se basa en error de reconstrucción de pesos (RTN), no en pérdida de tarea medida, por lo que los anchos son óptimos para fidelidad de pesos, no necesariamente para calidad aguas abajo.
- Sin ratio de recuperación frente a BF16: el profesor de 238 GB no se puede evaluar en la máquina de medida; los números absolutos sirven como línea base dentro de la familia, no como evidencia de ausencia de pérdida.
- Requiere `trust_remote_code`: la implementación estándar de `mlx_lm` descarta el clampado SwiGLU por capa (con impacto documentado de 88,41 % a 71,34 % en HumanEval en esta familia) y deja huérfanas las escalas y sesgos de los expertos cuantizados; el archivo `bailing_hybrid.py` incluido corrige ambos problemas.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Licencia MIT: permite uso comercial, pero las advertencias de fidelidad y las limitaciones de contexto deben evaluarse antes de desplegar en producción.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hermitdave/Ling-3.2-air-MLX-RCO-2.75bpw
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Repositorio MLX: no disponible en la información proporcionada
- Paper: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
