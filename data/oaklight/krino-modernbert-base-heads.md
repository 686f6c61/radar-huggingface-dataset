# oaklight/krino-modernbert-base-heads

## Resumen

Krino Adapter: ModernBERT-base es un conjunto de cabezas de decisión ligeras entrenadas sobre un backbone ModernBERT-base congelado, publicado por el usuario oaklight en Hugging Face bajo licencia MIT. No es un modelo generativo: en lugar de producir texto, devuelve decisiones tipadas con tres formatos posibles (noul, es decir sí/no; choice, selección entre opciones; y score, una puntuación numérica). El modelo entero se compone de 149 millones de parámetros congelados en el backbone y solo 302.000 parámetros entrenables en las cabezas.

La propuesta es relevante porque explora una vía intermedia entre los clasificadores BERT clásicos y el uso de LLM generativos como clasificadores: se mantiene la eficiencia de un encoder pequeño (302K parámetros entrenables, entrenamiento y despliegue muy baratos) pero se intenta cubrir 19 tareas de NLU distintas con una única interfaz tipada y calibrada. El autor reporta una precisión agregada del 48,8% en esos 19 benchmarks, con una variabilidad muy alta entre tareas (desde el 87,0% en agnews hasta el 30,4% en hellaswag).

El repositorio se creó y actualizó el 24 de septiembre de 2026, no acumula descargas ni likes y su tamaño reportado es de 0,0 GB, coherente con un checkpoint de muy pocos parámetros entrenables. Está pensado para ejecutarse a través de la librería `krino` (`KrinoModel.from_pretrained(...)`), que expone un método `predict(state, question)` con instrucciones y criterios definidos por el usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer ModernBERT-base congelado + tres cabezas de decisión (NoulHead, ChoiceHead, ScoreHead) |
| Parametros totales | 149M en el backbone congelado + 302K entrenables en las cabezas |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (heredada del backbone ModernBERT-base; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio reporta 0,0 GB de tamaño) |

## Arquitectura y entrenamiento

La arquitectura parte de `answerdotai/ModernBERT-base` (149M parámetros, encoder transformer moderno) que permanece completamente congelado. Sobre sus estados ocultos se conectan tres cabezas independientes: NoulHead, una capa lineal seguida de sigmoide que produce P(yes); ChoiceHead, basada en cross-attention y softmax, que produce P(option_k) sobre las opciones proporcionadas; y ScoreHead, también con cross-attention, que devuelve un valor esperado en lugar de una probabilidad. Las cabezas de atención usan rango 64 (AttentionHead con rank 64), lo que explica que solo 302K parámetros sean entrenables.

El entrenamiento es multi-tarea sobre 19 benchmarks de NLU, con muestreo balanceado por tipo de decisión y 20 épocas. No se menciona en la información disponible el uso de RLHF, DPO ni ningún proceso de alineación, ni se detalla la composición exacta del dataset más allá de la lista de benchmarks (agnews, mednli, mnli, typed_decisions, sst2, multirc, contractnli, codesearchnet, yelp, tabfact, sst5, fever, banking77, swag, race, arc, stsb, hellaswag, entre otros). La innovación principal es la interfaz: una única API `predict(state, question)` con `type`, `instructions` y `criteria` que unifica clasificación binaria, selección múltiple y regresión de scores bajo el mismo contrato de salida tipada.

## Capacidades

- Decisión binaria tipo sí/no (noul): determina si un enunciado se cumple o no, con salida probabilística P(yes).
- Selección entre opciones (choice): elige una opción entre las definidas en `criteria`, con distribución softmax sobre las alternativas.
- Puntuación numérica (score): devuelve un valor esperado, por ejemplo para tareas de similitud o valoración.
- Clasificación de intenciones en texto corto: la model card incluye un ejemplo de enrutado de intenciones en atención al cliente (track_order, cancel_order, report_damage).
- Clasificación de temas y sentimiento: agnews (87,0%) y sst2 (57,4%) están entre los benchmarks evaluados.
- Inferencia de relación entre textos (NLI): mednli (65,6%) y mnli (64,4%).
- Comprensión de contratos y verificación de hechos: contractnli (55,8%) y fever (40,6%).
- Etiquetado de datos: al ser un modelo de decisión con salida tipada, puede usarse para pre-etiquetar o validar etiquetas en pipelines de anotación.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no, solo inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Enrutado de intenciones en atención al cliente: el modelo recibe el mensaje del usuario como `state` y un conjunto de criterios con las intenciones candidatas; devuelve la intención seleccionada y puede derivarse a un flujo u otro sin coste de generación de tokens.
- Moderación y filtrado binario: con la cabeza noul se pueden definir criterios como "el mensaje contiene lenguaje abusivo" y obtener una probabilidad calibrada para decidir si se escala a revisión humana.
- Clasificación de documentos legales: contractnli (55,8%) indica que el modelo puede abordar tareas de inferencia sobre cláusulas, útil para triaje preliminar en revisión contractual.
- Pre-etiquetado en pipelines de anotación: al ser un modelo de 302K parámetros entrenables, se puede ejecutar sobre lotes grandes de texto para generar etiquetas iniciales que los anotadores corrigen, reduciendo el coste por ejemplo.
- Etiquetado de tickets y correo entrante: combinando agnews y banking77 como referencia, puede asignar categorías temáticas o de dominio a mensajes cortos antes de pasarlos a un sistema mayor.
- Detección de contradicciones entre pares de textos: con los criterios de tipo noul alimentados con premisa e hipótesis, puede señalar inconsistencias entre una respuesta generada y una fuente, como filtro previo frente a alucinaciones en un pipeline mayor.
- Evaluación de similitud o calidad: la cabeza score permite construir un puntuador (por ejemplo, proximidad semántica o valoración tipo yelp) reutilizable en ranking o filtrado por umbral.
- Experimentación docente o de investigación: por su tamaño (149M congelados, 302K entrenables) cabe en un portátil y permite estudiar el comportamiento de cabezas tipadas sobre un encoder congelado sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

Resultados publicados en la model card (precisión por tipo de decisión):

| Tipo | Precisión |
|---|---|
| Choice | 42,9% |
| Noul | 58,9% |
| Score | 44,3% |
| Agregado | 48,8% |

Resultados por benchmark:

| Benchmark | Tipo | Precisión |
|---|---|---|
| agnews | choice | 87,0% |
| mednli | noul | 65,6% |
| mnli | noul | 64,4% |
| typed_decisions | choice | 58,2% |
| sst2 | noul | 57,4% |
| multirc | noul | 56,6% |
| contractnli | noul | 55,8% |
| codesearchnet | choice | 54,3% |
| yelp | score | 52,2% |
| tabfact | noul | 51,6% |
| sst5 | score | 45,8% |
| fever | choice | 40,6% |
| banking77 | choice | 34,4% |
| swag | choice | 34,2% |
| race | choice | 32,6% |
| arc | choice | 31,8% |
| stsb | score | 31,2% |
| hellaswag | choice | 30,4% |

No se han publicado en la información disponible resultados comparativos con otros modelos en los mismos benchmarks, ni desgloses de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone tiene 149M parámetros, por lo que en fp32 ocupa aproximadamente 0,6 GB, en fp16 unos 0,3 GB y en int8 unos 0,15 GB; las cabezas de 302K parámetros son despreciables. En la práctica, cualquier GPU con 2 GB o más de VRAM es suficiente, y la inferencia en CPU es viable para lotes pequeños o moderados. Estas cifras son estimaciones derivadas del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: no se especifican. Dado el tamaño, cualquier GPU consumer sirve: RTX 3060, RTX 4060, RTX 4090, así como GPUs de datacenter (A100, H100) si se necesita procesar grandes volúmenes en paralelo.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM; también en CPU y en entornos sin acelerador.
- Opciones de despliegue: la vía documentada es la librería `krino` (`KrinoModel.from_pretrained`). No se especifica compatibilidad con vLLM, llama.cpp, Ollama, TGI u otros servidores de inferencia.
- Latencia y throughput estimados: no disponible. No se han publicado cifras de latencia ni de tokens o peticiones por segundo.

## Comparativa con modelos similares

No hay datos de benchmarks de alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| krino-modernbert-base-heads | 149M congelados + 302K entrenables | 8192 (heredado del backbone) | 48,8% agregado en 19 benchmarks (datos del autor) | MIT | Hugging Face (0 descargas, 0 likes) |
| ModernBERT-base (backbone) | 149M | 8192 | no disponible en la información proporcionada | Apache 2.0 | Hugging Face, ampliamente utilizado |
| DeBERTa-v3-base | 184M | 512 | no disponible en la información proporcionada | MIT | Hugging Face, ampliamente utilizado |

Alternativa funcional: usar un LLM generativo como clasificador mediante prompts. No se dispone de datos comparativos de rendimiento, coste ni latencia en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Rendimiento agregado bajo: 48,8% de precisión agregada en 19 benchmarks, con tareas claramente por debajo de lo esperable en un clasificador dedicado (hellaswag 30,4%, arc 31,8%, race 32,6%).
- Alta varianza entre tareas: la diferencia entre agnews (87,0%) y hellaswag (30,4%) indica que el modelo no generaliza de forma homogénea; conviene validar cada caso de uso con datos propios antes de desplegarlo.
- Solo inglés: el campo de idioma declarado es `en`; no hay evidencia de funcionamiento en castellano u otros idiomas.
- Sin información sobre sesgos: la model card no documenta evaluación de sesgos, toxicidad ni análisis de subgrupos.
- Riesgo de calibración: las cabezas producen probabilidades (sigmoide, softmax) y valores esperados, pero no se aportan métricas de calibración (ECE, Brier) que permitan confiar en los umbrales sin recalibrado propio.
- Riesgo de alucinación: al no ser un modelo generativo, no genera texto libre; el riesgo se traslada a falsos positivos y falsos negativos en la decisión, no a contenido inventado.
- Dependencia de la librería `krino`: la única vía de uso documentada requiere esa librería, no incluida en el repositorio como dependencia estándar de `transformers`.
- Estado del repositorio: 0 descargas, 0 likes y 0,0 GB de tamaño reportado, lo que sugiere un artefacto muy reciente y sin validación independiente por parte de la comunidad.
- Licencia: MIT permite uso comercial y modificación, pero debe verificarse la licencia del backbone ModernBERT-base (Apache 2.0) al redistribuir pesos derivados.
- Sin información sobre cuantizaciones ni formatos de pesos, lo que dificulta planificar el despliegue en entornos con restricciones de memoria o en runtimes como llama.cpp.

## Enlaces

- Hugging Face: https://huggingface.co/oaklight/krino-modernbert-base-heads
- Backbone: https://huggingface.co/answerdotai/ModernBERT-base
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron únicamente contenido no relacionado (sitios de webcams), por lo que no se incluyen enlaces adicionales. No se dispone de paper, blog, repositorio ni demo asociados en la información proporcionada.
