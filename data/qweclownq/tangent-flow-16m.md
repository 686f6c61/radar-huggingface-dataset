# qweclownq/tangent-flow-16m

## Resumen

`tangent-flow-16m` es un modelo de *flow matching* condicional de 16,5 millones de parámetros, desarrollado por el usuario `qweclownq`, que actúa como un prior sobre las activaciones del *residual stream* de GPT-2 small (capa `blocks.7.hook_resid_pre`, dimensión 768). Su objetivo es reconstruir activaciones corruptas mediante una corrupción tangente que preserva exactamente una restricción semántica de la forma `⟨h, v⟩ = c`, donde `v` es una dirección unitaria y `c` una coordenada fija. El modelo se entrenó sobre 32 millones de activaciones residuales extraídas de FineWeb `sample-10BT`, con una arquitectura *tokenwise* basada en SwiGLU y condicionamiento FiLM por dirección y coordenada.

La relevancia de este modelo no reside en su rendimiento como herramienta de *steering*, sino en que documenta un **resultado negativo** riguroso: aunque reconstruye eficazmente las activaciones corruptas (recupera el 77,3 % del daño inducido en la tarea T1), **no mejora** la reparación de intervenciones de *steering* (tarea T2) en comparación con un simple *hard clamp*. De hecho, empeora ligeramente la calidad del texto resultante. El autor publica el artefacto explícitamente como una contribución de reproducibilidad para la comunidad de interpretabilidad, con todos los *checkpoints*, configuraciones y recibos de evaluación incluidos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | *Tokenwise* time-conditioned SwiGLU, 3 bloques, d_model 768, condicionamiento FiLM por dirección/coordenada |
| Parametros totales | 16 542 464 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (opera sobre activaciones de GPT-2 small, no sobre texto directamente) |
| Tipos de cuantizacion | No disponible (pesos en formato PyTorch, sin cuantización documentada) |
| Idiomas soportados | No disponible (entrenado sobre activaciones de FineWeb, no se especifica idioma) |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch (`.pt`), incluye modelo, normalizador, arquitectura y metadatos |

## Arquitectura y entrenamiento

El modelo implementa un *flow matching* condicional sobre el espacio de activaciones residuales de GPT-2 small. La corrupción tangente se define de forma que la trayectoria de corrupción y denoising permanezca siempre dentro del subespacio tangente a la restricción semántica `⟨h, v⟩ = c`. Concretamente, para una activación limpia estandarizada `x₀`, una dirección unitaria `v` y la coordenada `c = ⟨x₀, v⟩`, se construye:

- `x∥ = c·v`, `x⊥ = x₀ − c·v`
- `x_t = c·v + (1−t)·x⊥ + t·ε⊥`, donde `ε⊥` es ruido ortogonal a `v`
- La velocidad objetivo es `u* = ε⊥ − x⊥`, y la velocidad predicha se proyecta analíticamente (`u − ⟨u, v⟩·v`), garantizando que la restricción se cumple exactamente por construcción, no por aprendizaje.

El entrenamiento usó 250 000 pasos con *batch* de 1024, optimizador AdamW (lr 3e-4) con *decay* coseno, sobre 32 millones de activaciones residuales (sin *BOS*). La selección del *checkpoint* se basó en la minimización de la pérdida de *flow* en validación (`val_flow_mse` = 0.9680510), independiente del concepto. No se aplicaron técnicas de RLHF ni DPO; es un modelo de prior puramente reconstructivo.

## Capacidades

- **Reconstrucción de activaciones corruptas (T1)**: recupera el 77,3 % del daño causado por la corrupción tangente, con una mejora de ΔNLL de −1.012611 (IC 95 % [−1.072443, −0.949261]).
- **Preservación exacta de la coordenada semántica**: la corrección paralela media es de 5.6e−07 frente a una corrección ortogonal de 7.09, lo que confirma que la restricción se mantiene de forma exacta.
- **No mejora el *steering* (T2)**: en la tarea de naturalización de una activación con *hard clamp*, el modelo produce un ΔNLL *pooled* de +0.006184 (IC 95 % [+0.001631, +0.010788]), es decir, empeora la calidad respecto al *clamp* simple. Ninguna de las 30 celdas de la cuadrícula diagnóstica resultó favorable.
- **Escalado del daño**: el daño aumenta monótonamente con la magnitud de la corrección ortogonal: ‖Δh⊥‖ 7.09 → +0.006, 16.81 → +0.054, 29.58 → +0.346 nats.
- **No es un modelo generativo de texto**: no produce lenguaje directamente; actúa como un prior sobre activaciones intermedias de GPT-2 small.

## Casos de uso

- **Investigación en interpretabilidad de modelos**: permite estudiar la relación entre reconstrucción de activaciones y eficacia de intervenciones de *steering*, un problema abierto en la mecánica interpretativa.
- **Reproducción de resultados negativos**: el modelo y sus recibos T1/T2 facilitan la verificación independiente del hallazgo de que la reconstrucción tangente no se traduce en mejoras de *steering*.
- **Análisis de priors de activaciones**: sirve como referencia para comparar con otros priors (por ejemplo, *sparse autoencoders* o *flow matching* sin restricciones) en tareas de reparación de activaciones.
- **Estudio de la brecha reconstrucción-intervención**: permite cuantificar cuánto daño introduce una corrección ortogonal en el texto generado, como se muestra en el escalado de ΔNLL.
- **Extensión a mayor capacidad**: aunque el control de 60M no se completó, el modelo puede usarse como punto de partida para probar si una mayor capacidad altera el resultado (el mecanismo sugiere que no, pero no está medido).
- **Validación de protocolos de evaluación**: los recibos T1/T2 y los *checkpoints* congelados permiten validar metodologías de evaluación de *steering* sin depender de un juez LLM inestable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es un modelo de lenguaje general. Los únicos datos de rendimiento disponibles son los de las tareas internas T1 y T2, presentados en la *model card*:

| Tarea | Métrica | Resultado |
|---|---|---|
| T1: reconstrucción tangente | ΔNLL (mejor es menor) | −1.012611 (IC 95 % [−1.072443, −0.949261]) |
| T1: daño recuperado | Porcentaje | 77,3 % |
| T2: naturalización con *hard clamp* | ΔNLL *pooled* (peor es mayor) | +0.006184 (IC 95 % [+0.001631, +0.010788]) |
| T2: celdas favorables | Recuento | 0 de 30 |
| Preservación de coordenada | Corrección paralela media | 5.6e−07 (frente a 7.09 ortogonal) |

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 16,5 millones de parámetros, la inferencia es muy ligera. Con precisión fp32, el *checkpoint* ocupa aproximadamente 66 MB; con fp16, unos 33 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- **GPU recomendadas**: cualquier GPU moderna (por ejemplo, NVIDIA T4, RTX 3060 o superior) es suficiente. No se requieren GPUs de centro de datos.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU de consumo reciente puede ejecutarlo sin problemas.
- **Opciones de despliegue**: el modelo se carga mediante la librería `interp` (mencionada en el código de ejemplo), no mediante *frameworks* estándar como vLLM u Ollama. No es un modelo de inferencia de texto, por lo que no aplican los *runtimes* habituales.
- **Latencia y throughput**: no se proporcionan datos. Dado el tamaño, la latencia por *forward* debería ser del orden de milisegundos en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No hay modelos directamente comparables publicados en la información disponible. El modelo es un prior de *flow matching* sobre activaciones de GPT-2 small, una categoría muy específica dentro de la interpretabilidad. Se podría comparar con *sparse autoencoders* (SAE) o con otros métodos de *steering*, pero no se dispone de datos de rendimiento de alternativas en el contexto de esta ficha. Por tanto, la comparativa se considera **no disponible**.

## Limitaciones y advertencias

- **Solo GPT-2 small y una única capa**: el modelo está entrenado exclusivamente sobre la activación `blocks.7.hook_resid_pre` de GPT-2 small; no es transferible a otros modelos ni a otras capas sin reentrenamiento.
- **Resultado negativo explícito**: el autor advierte que no debe usarse para mejorar *activation steering*; de hecho, empeora la naturalización en comparación con un *hard clamp* simple.
- **Cuestión de capacidad abierta**: no se probó un modelo de 60M (el entrenamiento se abandonó por fallos de GPU), por lo que se desconoce si una mayor capacidad alteraría el resultado. El mecanismo sugiere que no, pero es un argumento, no una medición.
- **Falta de un juez LLM estable**: la métrica principal es la NLL condicional bajo el modelo limpio, no una evaluación de calidad lingüística con un LLM juez, lo que limita la interpretación de los resultados en términos de fluidez.
- **Uso restringido a investigación**: no está destinado a producción ni a aplicaciones de usuario final.
- **Licencia MIT**: permite uso comercial y modificación, pero el autor recomienda explícitamente no usarlo en producción para *steering*.

## Enlaces

- HuggingFace: [qweclownq/tangent-flow-16m](https://huggingface.co/qweclownq/tangent-flow-16m)
- No se proporcionan otros enlaces (repositorio del proyecto, paper o blog) en la información disponible.
