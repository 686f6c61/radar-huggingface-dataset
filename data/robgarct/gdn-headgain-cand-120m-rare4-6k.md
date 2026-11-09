# robgarct/gdn-headgain-cand-120m-rare4-6k

## Resumen

`gdn-headgain-cand-120m-rare4-6k` es un modelo de lenguaje de 120 millones de parámetros desarrollado por el usuario `robgarct` como parte de una serie de ablaciones sobre mecanismos de compuerta en arquitecturas de atención lineal. Concretamente, se trata de un modelo Gated DeltaNet (una variante de atención lineal con estado recurrente) entrenado sobre el dataset Pile durante 6.000 actualizaciones, lo que equivale a 3.146 mil millones de tokens con un batch global de 256 × 2.048.

El modelo no está pensado como un asistente de propósito general, sino como un experimento controlado para estudiar el recall en contexto (in-context recall). Su innovación concreta es una ganancia de salida por cabeza (`headgain`) condicionada al embedding del token candidato de un n-grama, aplicada antes de la proyección de salida. El entrenamiento emplea el objetivo `rare4`, que aplica un factor de pérdida 4× a los tokens que completan bigramas poco frecuentes.

Es relevante para investigadores que trabajen en mecanismos de recuperación en contexto, atención lineal y arquitecturas recurrentes eficientes, ya que publica métricas específicas de recall (Rare-AR PPL 2.88, top-1 del 77,0%) y Pile PPL de 12,09, lo que permite comparar directamente contra otras variantes de la misma familia de ablaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet (atención lineal con estado recurrente) |
| Parámetros totales | 120M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`final.ckpt`) |
| Librería | `recurrent-recall-circuits` |
| Dataset de entrenamiento | Pile |
| Tokens de entrenamiento | 3.146B (6.000 updates, batch 256 × 2.048) |
| Semilla | 1111 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Gated DeltaNet, una familia de atención lineal con actualización de estado recurrente y compuertas. Sobre esa base, esta variante introduce una ganancia de salida por cabeza: un escalar aprendido por cabeza y por token, aplicado antes de la proyección de salida. Dicha ganancia se condiciona a la entrada de la capa y al embedding del token candidato de un n-grama (`[cand]`), lo que constituye el mecanismo central del experimento de ablación.

El entrenamiento se realizó sobre el dataset Pile con 6.000 actualizaciones (3.146B tokens, batch global de 256 × 2.048) y el objetivo `rare4`, que multiplica por 4 la pérdida en tokens que completan bigramas poco frecuentes, con el fin de forzar al modelo a mejorar el recall de patrones raros. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna fase de alineación posterior. El checkpoint publicado tiene el estado del optimizador eliminado y conserva `global_step` 6000.

## Capacidades

- Generación de texto autoregresiva sobre vocabulario del dataset Pile.
- Recall en contexto de bigramas poco frecuentes, reforzado mediante el objetivo `rare4`.
- Recuperación de asociaciones raras de primer recall (métrica Rare-AR: PPL 2.88, top-1 del 77,0%).
- Evaluación de generación en tareas de tipo FDA (21,5% de acierto con la respuesta contenida).
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- No se ha documentado capacidad multilingüe específica.
- No se ha documentado modo thinking, visión ni audio.

## Casos de uso

- Investigación en mecanismos de recall en contexto: el modelo sirve como punto de comparación controlado dentro de la serie de ablaciones de compuertas n-grama, permitiendo aislar el efecto del `headgain` condicionado al candidato sobre la recuperación de bigramas raros.
- Estudio de atención lineal y estado recurrente: al ser un Gated DeltaNet de 120M, permite reproducir experimentos de eficiencia y comparar contra variantes transformer de tamaño similar en regímenes de contexto largo.
- Análisis de objetivos de pérdida ponderados: el objetivo `rare4` (4× en bigramas raros) se puede evaluar frente a entrenamientos estándar para medir el coste en perplejidad general (Pile PPL 12,09) a cambio de mejora en recall.
- Reproducción de ablaciones: el repositorio incluye `resolved-config.yaml` y `metadata.json`, lo que facilita replicar exactamente el run con la rama `ngram-router-ablations` y el alias de registro `gdn_120m_rare4_gate_cand`.
- Docencia y formación en arquitecturas recurrentes: un modelo de 120M con checkpoint abierto y configuración exacta es adecuado para prácticas de carga de checkpoints, inspección de compuertas y análisis de curvas de pérdida.
- Evaluación de métricas de recall específicas: el modelo permite validar pipelines de evaluación Rare-AR y FDA sobre 66.394 eventos de primer recall y 1.102 ejemplos FDA respectivamente.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Pile PPL (1.000 secuencias de validación) | 12,09 |
| Rare-AR PPL (66.394 eventos de primer recall raro) | 2,88 |
| Rare-AR top-1 accuracy | 77,0% |
| Natural FDA (1.102 ejemplos, generación, respuesta contenida) | 21,5% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,25 GB solo para pesos (120M × 2 bytes), más overhead de activaciones y estado recurrente; en la práctica, menos de 1 GB en FP16.
- VRAM estimada en FP32: aproximadamente 0,5 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia por lotes pequeños.
- GPU recomendadas para entrenamiento o evaluación a escala: A100 o H100 si se quiere reproducir el run completo de 3.146B tokens; para inferencia basta una GPU consumer.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la carga está prevista mediante `recurrent_recall_circuits.utils.checkpoint.load_checkpoint` con el checkpoint `final.ckpt`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pile PPL | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gdn-headgain-cand-120m-rare4-6k | 120M | no disponible | 12,09 | no disponible | Hugging Face (`final.ckpt`) |
| Otras variantes de la serie de ablaciones `gdn_*_120m_rare4` | 120M | no disponible | no disponible | no disponible | Referenciadas en la rama `ngram-router-ablations`, sin datos públicos en esta ficha |
| Gated DeltaNet estándar (referencia de la familia) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos públicos suficientes en la información proporcionada para comparar con alternativas de otros autores.

## Limitaciones y advertencias

- Modelo de investigación: es una ablación controlada, no un modelo alineado ni ajustado para uso conversacional.
- Entrenado únicamente sobre Pile durante 6.000 updates; la calidad general fuera de las métricas reportadas no está caracterizada.
- Riesgo elevado de alucinación y de generar texto incoherente en dominios fuera de la distribución de Pile.
- Licencia no especificada: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue en producción.
- Idiomas soportados no documentados; no hay garantía de comportamiento multilingüe.
- Longitud de contexto no documentada; no se debe asumir una ventana concreta sin consultar `resolved-config.yaml`.
- El checkpoint no incluye estado del optimizador, por lo que no es directamente reanudable para entrenamiento sin reinicializar el optimizador.
- Requiere la librería `recurrent-recall-circuits` (rama `ngram-router-ablations`); no es compatible de forma nativa con stacks estándar de inferencia.
- Sin descargas ni likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/robgarct/gdn-headgain-cand-120m-rare4-6k
- Repositorio de código (rama `ngram-router-ablations`): no disponible como URL directa en la información proporcionada; referenciado como `recurrent-recall-circuits`
- Configuración de experimento: `experiment=gdn_router/headgain_cand_rare4` (alias de registro `gdn_120m_rare4_gate_cand`)
- Paper, blog o demo: no disponibles
