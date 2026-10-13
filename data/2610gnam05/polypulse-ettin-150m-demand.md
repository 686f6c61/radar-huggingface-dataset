# 2610gnam05/polypulse-ettin-150m-demand

## Resumen

PolyPulse — Ettin-Encoder-150M es un modelo de clasificación de texto en inglés desarrollado por el usuario 2610gnam05. Se trata de un ajuste fino (fine-tuning) del encoder `jhu-clsp/ettin-encoder-150m`, un transformer de tipo encoder con 149.607.171 parámetros (aproximadamente 150 millones), que clasifica preguntas propuestas en Polymarket en tres categorías de demanda de negociación: Low, Medium y High. El objetivo predicho es el volumen histórico de negociación en dólares (trading volume), no la probabilidad de que ocurra el evento subyacente.

El modelo resuelve un problema concreto de priorización dentro del ecosistema Polymarket (mercados de predicción): estimar qué preguntas propuestas generarían más actividad de mercado. Se entrenó sobre el dataset `SII-WANGZJ/Polymarket_data` con particiones cronológicas de 50K/3K/3K, durante 1 época, con ponderación de clases suave y una tasa de aprendizaje de 1e-5. El resultado reportado por el autor en el conjunto de test reservado es una exactitud de 0,7147 y un macro-F1 de 0,5619.

Es relevante ahora por dos motivos: primero, aplica un encoder eficiente de la familia ModernBERT a un dominio de datos financieros/de mercados de predicción poco cubierto por modelos generalistas; segundo, su autor advierte de un detalle de implementación crítico: la predicción por defecto de `pipeline()` no es la afinada, ya que hay que cargar `polypulse_config.json` y sumar `logit_biases` a los logits antes del softmax/argmax. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ModernBERT (etiqueta `modernbert`), ajustado para clasificación de secuencias |
| Parametros totales | 149.607.171 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el `max_length` real se define en `polypulse_config.json`; la model card no lo especifica) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification |
| Clases de salida | Low, Medium, High (3 clases) |
| Dataset de entrenamiento | SII-WANGZJ/Polymarket_data (50K/3K/3K, divisiones cronológicas) |
| Formato de entrada | `Question: {question} [SEP] Event: {event_title}` |
| Tamaño del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/ettin-encoder-150m`, un encoder de la familia ModernBERT según la etiqueta declarada, con unos 150 millones de parámetros totales. Sobre esa base se añade una cabeza de clasificación de tres clases (Low/Medium/High de demanda de negociación). No es un modelo generativo ni un MoE: es un encoder bidireccional orientado a clasificación de texto, por lo que su salida es una etiqueta con su distribución de probabilidad, no texto libre.

El entrenamiento se realizó durante 1 época con ponderación de clases suave (mild class weighting) y una tasa de aprendizaje de 1e-5, sobre las particiones cronológicas preparadas del dataset `SII-WANGZJ/Polymarket_data` (50K de entrenamiento, 3K de validación y 3K de test). La entrada debe respetar el formato usado en entrenamiento: `Question: {question} [SEP] Event: {event_title}`. Un aspecto técnico destacable es que el autor indica que las predicciones afinadas requieren cargar `polypulse_config.json` y sumar `logit_biases` a los logits del modelo antes de aplicar softmax/argmax; además, en ese mismo fichero se encuentran el `max_length` y los umbrales históricos en USD que definen las categorías. No se documentan en la model card técnicas como RLHF o DPO (no aplican a un clasificador), ni innovaciones de decodificación.

## Capacidades

- Clasificación de texto en inglés: asigna una pregunta propuesta de Polymarket a una de tres categorías de demanda de negociación (Low, Medium, High).
- Predicción orientada a volumen: estima la demanda de negociación (volumen histórico en USD), no la probabilidad de que el evento ocurra.
- Procesamiento de pares pregunta/evento: consume la concatenación `Question: {question} [SEP] Event: {event_title}`, aprovechando el contexto del título del evento.
- Salida probabilística: produce logits sobre las tres clases (requiere el ajuste de `logit_biases` para replicar el resultado afinado).
- Ajuste de umbrales: las fronteras en USD que separan las clases se configuran externamente en `polypulse_config.json`.
- No soporta generación de texto, tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso: es exclusivamente un clasificador de secuencias.
- Capacidad multilingüe: no, únicamente inglés.

## Casos de uso

- Priorización de preguntas propuestas en Polymarket: dado un lote de preguntas candidatas, el modelo asigna a cada una una categoría de demanda esperada para que el equipo de curación centre su revisión en las de alta demanda potencial. Es adecuado por su velocidad de inferencia como encoder de 150M y por estar ajustado específicamente a este dominio.
- Filtrado previo a la publicación: descartar o marcar para revisión manual preguntas con probabilidad baja de generar volumen, reduciendo el coste de curación de mercados.
- Enrutado de recursos de market-making: usar la categoría predicha para decidir en qué mercados conviene asignar más liquidez inicial o atención operativa.
- Señal auxiliar para analistas cuantitativos: incorporar la clase predicha como una feature más en modelos de previsión de volumen o liquidez, siempre como señal complementaria.
- Clasificación por lotes en pipelines de datos: procesar grandes volúmenes de preguntas históricas para etiquetar datasets de investigación sobre mercados de predicción.
- Monitorización y alertas: detectar preguntas propuestas con etiqueta High para activar avisos internos y revisarlas antes de su listado.
- Análisis retrospectivo de mercados: etiquetar preguntas ya resueltas y estudiar la relación entre la demanda predicha y el volumen real observado.

## Benchmarks y rendimiento

Los únicos datos disponibles son las métricas del propio autor sobre el conjunto de test reservado, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), que no aplican o no se han publicado. No se dispone de resultados comparativos con otros modelos en la información proporcionada.

| Metrica | Valor |
|---|---|
| Exactitud en test (held-out tuned test accuracy) | 0,7146666666666667 |
| Macro-F1 en test (held-out tuned test macro-F1) | 0,5618585976753574 |
| Épocas de entrenamiento | 1 |
| Tasa de aprendizaje | 1e-5 |

Nota: el autor advierte que la exactitud varía entre clases de demanda y que las puntuaciones del modelo no son probabilidades calibradas garantizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp32 (coherente con los 149,6M de parámetros y el tamaño del repo de 0,6 GB) y del orden de 0,3 GB en fp16/bf16, más el overhead de activaciones según el `max_length` y el tamaño de lote. Cifra exacta no disponible en la información proporcionada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para este modelo (RTX 3060, RTX 4090, A100, H100, etc.); no requiere GPU de gama alta.
- Cabe en GPU de consumo: sí, holgadamente, en prácticamente cualquier GPU de consumo moderna, e incluso es viable en CPU para lotes pequeños.
- Opciones de despliegue: Hugging Face Transformers (`pipeline()` de text-classification, con la advertencia de aplicar `logit_biases` para el resultado afinado), exportación a ONNX, y servidores de inferencia compatibles con modelos encoder como TGI o vLLM (soporte de clasificación variable; no verificado en la información disponible).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento comparativos en la información proporcionada. La comparación se limita a parámetros, tarea, licencia y disponibilidad.

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 2610gnam05/polypulse-ettin-150m-demand | 149,6M | Clasificación de demanda (3 clases) | No disponible | No disponible | Hugging Face |
| jhu-clsp/ettin-encoder-150m (modelo base) | ~150M | Encoder de propósito general | No disponible | No disponible | Hugging Face |
| Encoders de tamaño similar (ModernBERT-base, DeBERTa-v3-base) | ~140-180M | Clasificación/representación general | No disponible | No disponible | Hugging Face |

No se conocen alternativas públicas directamente comparables para la tarea específica de predecir demanda de negociación en Polymarket.

## Limitaciones y advertencias

- La exactitud varía entre clases de demanda; el macro-F1 (0,56) es notablemente inferior a la exactitud (0,71), lo que indica rendimiento desigual entre clases y probable desequilibrio.
- Los scores del modelo no son probabilidades calibradas; no deben interpretarse como estimaciones fiables de probabilidad.
- La predicción por defecto de `pipeline()` no reproduce el resultado afinado: es obligatorio cargar `polypulse_config.json` y sumar `logit_biases` a los logits antes de softmax/argmax.
- Debe respetarse exactamente el formato de entrada de entrenamiento (`Question: {question} [SEP] Event: {event_title}`); otro formato degrada el resultado.
- Licencia no disponible: no puede confirmarse la legalidad del uso comercial ni las condiciones de redistribución.
- El modelo predice volumen histórico de negociación, no la probabilidad de que ocurra el evento; no es asesoramiento financiero ni de inversión.
- Solo soporta inglés, lo que limita su uso en preguntas de mercados en otros idiomas.
- El `max_length` real y los umbrales en USD no se especifican en la model card, solo se referencian en `polypulse_config.json`; deben recuperarse de ese fichero.
- Métricas basadas en una única partición de test y un entrenamiento de solo 1 época: poca evidencia sobre robustez y generalización fuera de la distribución temporal de los datos.
- Repositorio con 0 descargas y 0 likes: madurez y validación por terceros no demostradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2610gnam05/polypulse-ettin-150m-demand
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-150m
- Dataset de entrenamiento: https://huggingface.co/datasets/SII-WANGZJ/Polymarket_data
- Fichero de configuración referenciado (no enlazado en la model card): `polypulse_config.json` (dentro del repositorio del modelo)
- Paper, blog o demo: no disponible en la información proporcionada.
