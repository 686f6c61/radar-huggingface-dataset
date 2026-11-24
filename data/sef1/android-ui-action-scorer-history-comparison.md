# sef1/android-ui-action-scorer-history-comparison

## Resumen

`sef1/android-ui-action-scorer-history-comparison` es un repositorio de investigación que contiene dos checkpoints emparejados de un clasificador ModernBERT diseñado para puntuar y ordenar acciones candidatas en pantallas de Android. El modelo resuelve un problema concreto dentro del ámbito de los agentes que operan interfaces móviles: dada una pantalla, un objetivo de tarea y, opcionalmente, un historial de acciones previas, estimar qué acción candidata es la más probable como siguiente paso correcto. Lo desarrolla el usuario `sef1` y se publica como material de investigación, no como un producto listo para producción.

La relevancia del repositorio es metodológica: compara dos variantes idénticas en todo salvo en el uso de historial. La variante `no_history` no recibe acciones previas; la variante `history6` recibe hasta seis acciones crudas anteriores en orden cronológico. Ambas se entrenaron con la misma semilla, orden de datos, optimizador y checkpoint de partida, lo que permite aislar el efecto del historial. El resultado reportado es una mejora de 21 aciertos sobre 1.911 casos (de 69,754% a 70,853% de precisión), es decir, 1,099 puntos porcentuales en una comparación de una sola semilla.

Arquitectónicamente es un transformer ModernBERT de 22 capas, dimensión oculta 384 y 6 cabezas de atención, con pooling de media y una cabeza escalar. El contexto total está acotado a 607 tokens incluyendo marcadores, repartidos en secciones con topes fijos (objetivo 80, historial 255, pantalla 192, candidato 77). Los pesos están en safetensors y el repo ocupa 1,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder), clasificador con mean pooling y cabeza escalar |
| Parametros totales | no disponible (22 capas, hidden 384, 6 cabezas de atención) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 607 tokens totales incluyendo marcadores (objetivo 80, historial 255, pantalla 192, candidato 77, especiales de par 3); padding dinámico por pantalla |
| Tipos de cuantizacion | no disponible; el autor indica que la conversión a GGUF y la cuantización requieren validación separada de paridad de logits |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible; el modelo base mmBERT es MIT, el dataset AndroidControl tiene conflicto entre Apache 2.0 y una cláusula de uso no comercial en su datasheet |
| Formato de pesos | safetensors (con `SHA256SUMS` para integridad) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 22 capas con dimensión oculta 384 y 6 cabezas de atención, seguido de mean pooling y una cabeza escalar que produce una puntuación por par (contexto, candidato). La innovación técnica principal es una atención asimétrica personalizada: las consultas del prefijo (objetivo, historial y pantalla) no pueden leer los tokens del candidato, de modo que el prefijo se codifica una sola vez y sus K/V por capa se reutilizan para ramas independientes de candidatos. Esto reduce el coste de evaluar hasta 32 candidatos por pantalla. El autor advierte explícitamente que usar `AutoModelForSequenceClassification` estándar no reproduce este comportamiento; el código de referencia está en `shared_attention.py` y `score.py`.

El entrenamiento usó 54.557 pantallas durante una época con semilla 0, FP32 en pesos y estados AdamW, forward en BF16, cross-entropy en FP32, AdamW con learning rate 2e-5, weight decay 0,01, gradient clipping 1 y 4 pantallas por actualización con acumulación de pérdida por pantalla. Cada pantalla tiene hasta 32 candidatos y el entrenamiento usa pares independientes completos con las máscaras asimétricas de referencia, no el cálculo con prefijo compartido. No hubo segunda época ni selección de checkpoint por validación. La evaluación se hizo con scoring cacheado FP32/math SDPA y puertas numéricas frente a la referencia de pares completos. Las entradas combinan objetivo de tarea, historial opcional de hasta seis acciones crudas en JSON, resumen de pantalla actual y cada candidato ordenado; no se incluye instrucción humana del paso actual ni enriquecimiento con texto objetivo.

## Capacidades

- Puntuación y ranking de acciones candidatas sobre pantallas de Android, no generación libre de acciones.
- Condicionamiento por objetivo de tarea (hasta 80 tokens) y resumen de pantalla (hasta 192 tokens).
- Uso opcional de historial de hasta seis acciones previas crudas, cronológicas, incluyendo navegación, esperas y acciones no emparejadas.
- Evaluación eficiente de múltiples candidatos por pantalla mediante prefijo compartido y atención asimétrica.
- Soporte de tooling de referencia en CPU y CUDA en FP32/math con `score.py`.
- Capacidad multilingüe: solo inglés.
- No soporta tool calling, function calling, agentes multi-paso autónomos, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre el valor del historial en agentes de UI: comparar `no_history` y `history6` con entradas idénticas permite medir el coste y la ganancia de incluir acciones previas en el ranking de candidatos.
- Ranking de candidatos en pipelines de evaluación offline de AndroidControl: usar el checkpoint como scorer para ordenar las acciones propuestas por otro componente y medir precisión sobre conjuntos fijos de 2.000 ejemplos.
- Análisis de ablación controlada: al compartir semilla, orden de entrenamiento y checkpoint inicial, sirve para aislar variables en experimentos académicos sobre memoria de acciones en agentes móviles.
- Prototipado de selectores de acción en asistentes de accesibilidad: puntuar candidatos extraídos de la pantalla para priorizar la siguiente acción en un flujo guiado, siempre con validación adicional.
- Estudio de eficiencia de atención con prefijo compartido: el código de `shared_attention.py` sirve como referencia para implementar y validar variantes cacheadas frente a pares completos.
- Referencia de reproducibilidad numérica: las puertas de paridad (1,53e-5 entre scoring cacheado y pares completos en CPU FP32/math) son útiles para validar portes a otros runtimes antes de desplegar.
- Base para experimentos de destilación o adaptación a otros dominios de UI, partiendo de un encoder compacto de 22 capas y 384 de dimensión oculta.

## Benchmarks y rendimiento

| Checkpoint | Pantallas de entrenamiento | Validación correcta | Precisión |
|---|---:|---:|---:|
| no_history | 54.557, una época | 1.333 / 1.911 | 69,754% |
| history6 | 54.557, una época | 1.354 / 1.911 | 70,853% |

La métrica principal excluye los 89 ejemplos de un solo candidato, que son predicciones forzadas. La comparación es de una sola semilla y el propio autor indica que no es evidencia de que cada acción adicional ayude. Los candidatos están asistidos por etiquetas (los nodos gold sobreviven al tope y pueden insertarse acciones gold sintéticas), por lo que la precisión es un resultado de ranking de candidatos en investigación, no de generación limpia para despliegue. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 22 capas y hidden 384 el modelo es pequeño, pero el repo pesa 1,2 GB por incluir dos checkpoints y tokenizers.
- GPU recomendadas: no disponibles; el autor solo menciona evaluación en CPU y CUDA en FP32/math.
- Cabe en GPU de consumo: probablemente sí por tamaño, pero no hay medición publicada de latencia ni de memoria en GPU de consumo.
- Opciones de despliegue: el wrapper de referencia `score.py` (CPU/CUDA, FP32/math); vLLM, llama.cpp, Ollama o TGI no están validados. La conversión a GGUF no ha sido validada y requiere paridad de logits separada.
- Latencia y throughput: no disponibles; el autor indica que la medición de tiempos debe incluir el trabajo de prefijo compartido además de los candidatos, y que el wrapper no constituye una afirmación de benchmark.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sef1/android-ui-action-scorer-history-comparison | 22 capas, hidden 384 | 607 tokens | Ranking de acciones UI Android | No disponible (base MIT, dataset con conflicto) | Hugging Face, 0 descargas |
| mmBERT (modelo base) | no disponible | no disponible | Encoder multilingüe general | MIT | Público |
| Alternativas de scoring de acciones UI | no disponible | no disponible | Ranking de acciones | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- No es un agente Android de extremo a extremo, ni un runtime móvil, ni una release GGUF; es un scorer de investigación.
- El uso de `AutoModelForSequenceClassification` estándar no reproduce el comportamiento: la atención asimétrica personalizada no está codificada en la configuración ordinaria, por lo que hay que mantener código y pesos juntos.
- La evaluación usa candidatos asistidos por etiquetas y un resumen de pantalla construido a partir de esos candidatos; la precisión no refleja generación limpia en producción.
- Comparación de una sola semilla; no se reclama replicación con otras semillas.
- El conjunto de evaluación se ha usado para investigación iterativa, lo que puede inflar la métrica.
- Sesgos conocidos: no documentados; el modelo solo maneja inglés y datos de AndroidControl.
- Riesgo de alucinación: aplica al ranking de candidatos, no a generación de texto; no se reportan tasas de error específicas.
- Licencia: el modelo base mmBERT es MIT, pero el dataset AndroidControl tiene un conflicto entre Apache 2.0 y una cláusula de uso no comercial en su datasheet; la aplicabilidad a la redistribución de pesos fine-tuned no está resuelta.
- La conversión a GGUF y la cuantización requieren validación de paridad de logits; un archivo cargable no es suficiente.
- No hay medición de latencia en teléfono ni evaluación completa de precisión en CPU.

## Enlaces

- Hugging Face: https://huggingface.co/sef1/android-ui-action-scorer-history-comparison
- Dataset AndroidControl (upstream): https://github.com/google-research/google-research/tree/master/android_control
- Cuestión de licencia del dataset: https://github.com/google-research/google-research/issues/3471
