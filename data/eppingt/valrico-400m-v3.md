# eppingt/Valrico-400M-v3

## Resumen

Valrico-400M-v3 es un modelo de clasificación de tokens (token-classification) construido sobre el encoder ModernBERT `jhu-clsp/ettin-encoder-400m` de 395.892.737 parámetros. Lo desarrolla Timothy Epping y su propuesta no es reentrenar el encoder, sino congelar los pesos de la versión anterior (Valrico-400M-v2) y envolverlos en un motor de servicio modular (`valrico_engine.py`) que añade capas deterministas de decisión: abstención por campos ausentes, extracción estructurada de pedidos y aritmética exacta en una sola pasada, calibración por flujo de trabajo y abstención por umbral de confianza.

El modelo resuelve un problema muy concreto: tomar decisiones tipadas (aprobar/denegar, sí/no, puntuaciones, elección entre opciones) sobre registros textuales semi-estructurados, con trazabilidad y capacidad de derivar a revisión humana cuando la evidencia es insuficiente. Frente a un LLM generativo, la arquitectura encoder-only ofrece latencia baja, coste predecible y, sobre todo, un comportamiento determinista y auditable en el que las probabilidades del modelo base (`v2_probs`) se preservan de forma idéntica en cada llamada.

Es relevante ahora porque el patrón de "encoder pequeño + capa de decisión determinista" es una alternativa práctica a los LLM para automatización de flujos de aprobación, triaje y extracción de campos en entornos con requisitos de privacidad (ejecución 100% local, sin egreso de red) y con necesidad de calibración ligera a partir de pocos ejemplos etiquetados (k = 10-20).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (ModernBERT), base `jhu-clsp/ettin-encoder-400m` |
| Parametros totales | 395.892.737 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible en la información proporcionada |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El núcleo es el encoder ModernBERT de Ettin con 400M de parámetros, sobre el que se ha realizado un fine-tuning para token-classification orientado a decisiones tipadas. En la versión v3 los pesos del encoder se mantienen byte-idénticos a los de Valrico-400M-v2: no hay reentrenamiento del backbone. La innovación está en la capa de servicio, que combina varios módulos con un orden de precedencia fijo en `decide_many()`: `abstain_missing_field` → `extracted` → `calibrated`/`model` → `abstain_low_confidence`.

El módulo de extracción de pedidos (`order_extractor/`) extrae campos estructurados de cabecera y de líneas de detalle en la misma pasada forward que el scoring base, sin un segundo paso por el encoder, y ejecuta aritmética exacta con `Decimal` (operaciones CMP, CMP-DATE, DIFF-DAYS, DIFF, AGG, COUNT, ARG, EQ). El `WorkflowCalibrator` ajusta por flujo de trabajo un `abstain_bias`, un `yes_bias`, sesgos multiclase L2-regularizados para opciones y una temperatura escalar a partir de k = 10-20 ejemplos etiquetados; con los valores por defecto (b = 0.0, T = 1.0) el comportamiento es byte-idéntico al modelo v2 sin calibrar. El `FieldPresenceGuard` es un parser determinista (JSON, `Clave: valor`, tablas pipe/markdown) que detecta campos requeridos ausentes, nulos o redactados (`TBD`, `N/A`, `[REDACTED]`) antes de la inferencia. La simetrización de orden de opciones (`symmetrize=True`) puntúa el orden original y el invertido, centra los logits y los promedia para reducir el sesgo de posición en tareas de elección con 3 o más opciones.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Clasificación de decisiones tipadas: elección entre opciones, sí/no y puntuaciones (score).
- Abstención determinista por campo ausente: detecta campos requeridos no presentes, nulos o redactados antes de invocar al modelo.
- Abstención por confianza: umbrales `min_confidence` y `min_margin` que derivan predicciones dudosas a un índice de abstención conservando `probs`, `margin` y `original_answer`.
- Extracción estructurada de pedidos: campos de cabecera y líneas de detalle en una sola pasada, con layouts json, kv, table, bullets y prose.
- Razonamiento numérico y de fechas exacto mediante aritmética `Decimal` (comparaciones, diferencias de días, agregaciones, conteos, argmax, igualdad).
- Calibración por flujo de trabajo con pocos ejemplos (k = 10-20), incluyendo temperatura y sesgos de opción.
- Simetrización de orden de opciones para mitigar el sesgo de posición en tareas de elección múltiple.
- Ejecución 100% local sin egreso de red (apto para entornos air-gapped).
- Adaptación local ligera mediante `fit_head.py` y `WorkflowCalibrator`.
- No dispone de tool calling, capacidades de agente multi-paso, visión ni audio según la información disponible.

## Casos de uso

- Automatización de aprobaciones: el motor evalúa un registro con campos como importe y aprobador, y con `required_fields=["approver", "amount"]` deriva automáticamente a abstención cuando el aprobador figura como `TBD`, evitando aprobaciones sobre evidencia incompleta.
- Triaje de solicitudes con revisión humana: con `min_margin=0.15` y `abstain_index` configurado, las predicciones de margen estrecho se enrutan a `abstain_low_confidence`, lo que permite separar el volumen de casos claros de la cola que requiere intervención humana.
- Verificación de pedidos y facturas: el `order_extractor` extrae cabecera y líneas de detalle y ejecuta comprobaciones aritméticas exactas (sumas de líneas, diferencias de fechas, comparación con totales) sin una segunda pasada del encoder.
- Clasificación documental por flujo de trabajo: el `WorkflowCalibrator` permite ajustar sesgos y temperatura por flujo (por ejemplo, "approvals" frente a "claims") con solo 10-20 ejemplos etiquetados, sin reentrenar el modelo.
- Despliegue en entornos regulados o air-gapped: al no requerir llamadas externas, el modelo y los ficheros de calibración (unos 2 KB en JSON) pueden operar íntegramente en local, lo que encaja en banca, seguros o sanidad con restricciones de egreso de datos.
- Auditoría y logging de decisiones inciertas: cuando se activa la abstención por confianza, el motor devuelve la respuesta original junto con las probabilidades, lo que permite registrar los casos dudosos para revisión por lotes diferida.
- Evaluación de políticas sobre registros multi-pregunta: con `dedup_records=True` se reutilizan las extracciones decodificadas entre varias preguntas sobre el mismo registro, reduciendo coste en paneles de evaluación de políticas.

## Benchmarks y rendimiento

Resultados publicados en la model card para el modelo base Valrico-400M-v2, cuyos pesos se mantienen sin cambios en v3:

| Benchmark | Valrico-400M-v2 (zero-shot) |
|---|---|
| Typed-decisions benchmark (test público) | 0.642 (Choice 0.597, Yes/No 0.788, Score 0.566) |
| Holistic judgement suite (2.000 ítems) | 0.676 / ECE 0.121 |
| Held-out daily-use panel (12 fuentes públicas) | 0.706 / ECE 0.080 (Abstention 0.514, Reworded 0.701) |
| Decision Index 0.3 (suite pública) | 19.90 |

Evaluación del enrutamiento estructurado de pedidos sobre una suite sintética held-out (1.367 registros / 13.071 preguntas, layouts json, kv, table, bullets y prose, bootstrap de 10.000 remuestreos agrupados por registro, sin solapamiento con los registros de entrenamiento del extractor):

| Evaluación | Métrica | Medido |
|---|---|---|
| Precisión de pedidos (n = 11.425 filas respondibles) | v3 frente a v2 | 0.9779 frente a 0.6405 (+0.3374, IC 95% [0.3233, 0.3517]) |
| Consistencia ante inversión (3.000 pares) | Tasa de ambos correctos | 0.9567 frente a 0.4263 (IC 95% [0.9453, 0.9670]) |
| Precisión y cobertura enrutadas | Precisión / cobertura / daño | 1.000 (el resto de la fila aparece truncado en la información disponible) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 395,9M de parámetros en fp32 el peso ronda 1,6 GB, y en fp16/bf16 aproximadamente 0,8 GB, a lo que hay que sumar activaciones y overhead del runtime.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo es apto para GPU de consumo modernas, aunque no se documentan modelos concretos.
- Cabe en GPU de consumo: sí, por el tamaño de pesos indicado; no se especifican modelos concretos.
- Opciones de despliegue: `transformers` con el motor propio `valrico_engine.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada; la model card destaca que la extracción de pedidos ocurre en la misma pasada forward que el scoring base, sin encoder adicional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Valrico-400M-v3 | 395,9M | no disponible | Decisión tipada con abstención y calibración | Apache 2.0 | Hugging Face |
| jhu-clsp/ettin-encoder-400m | ~400M | no disponible | Encoder base (ModernBERT) | Apache 2.0 | Hugging Face |
| Valrico-400M-v2 | ~400M | no disponible | Decisión tipada (versión previa, pesos idénticos) | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que no se ofrece comparación de rendimiento.

## Limitaciones y advertencias

- Idioma: solo inglés; no hay soporte multilingüe documentado.
- La abstención por campos ausentes depende de que el llamador declare correctamente `required_fields` y sus alias; una configuración laxa degrada la protección.
- Los umbrales `min_confidence` y `min_margin` son opcionales y su calibración incorrecta puede aumentar en exceso la tasa de derivación a revisión humana o, al contrario, dejar pasar predicciones dudosas.
- La simetrización de orden de opciones se recomienda solo para tareas de elección con 3 o más opciones; su uso fuera de ese escenario no está avalado por la evaluación publicada.
- La calibración por flujo de trabajo requiere ejemplos etiquetados (k = 10-20) representativos; con muestras sesgadas o poco diversas los sesgos ajustados pueden no generalizar.
- La evaluación del enrutamiento estructurado se realizó sobre una suite sintética; el rendimiento en datos reales de producción puede diferir.
- La tasa de abstención del modelo base en el panel held-out es de 0.514, lo que indica una capacidad limitada para decidir cuándo no responder sin las capas deterministas de v3.
- Riesgo de alucinación: al ser un encoder de clasificación no genera texto libre, pero puede producir decisiones incorrectas con alta confianza si el registro de entrada es ambiguo o está fuera de distribución.
- Sesgos: no se documentan sesgos específicos en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las obligaciones de atribución y el estado de los pesos base de Ettin.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eppingt/Valrico-400M-v3
- Modelo base Ettin: https://huggingface.co/jhu-clsp/ettin-encoder-400m
- Fichero del motor: `valrico_engine.py` (incluido en el repositorio del modelo)
- Módulo de extracción de pedidos: `order_extractor/` (incluido en el repositorio del modelo)
- Script de adaptación local: `fit_head.py` (incluido en el repositorio del modelo)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
