# cadrojasl/xlm-roberta-large-sarcasmo-spanish-2026

## Resumen

`cadrojasl/xlm-roberta-large-sarcasmo-spanish-2026` es un modelo de clasificación de texto en español especializado en detectar sarcasmo. Se trata de un ajuste fino (fine-tuning) del checkpoint multilingüe `FacebookAI/xlm-roberta-large` de Facebook AI, realizado por el usuario cadrojasl en el contexto de un taller final de PLN de una maestría en Ingeniería de Sistemas y Computación. El modelo resuelve una tarea binaria concreta: asignar a un texto la etiqueta `SARCASMO` o `NO_SARCASMO`.

La relevancia del modelo es acotada pero clara: el sarcasmo es un fenómeno pragmático difícil de capturar por modelos genéricos de análisis de sentimiento, y los recursos etiquetados en español son escasos. Este checkpoint ofrece una alternativa lista para usar sobre un dataset público específico (`Ernesto-1997/Sarcastic_spanish_dataset`), con métricas reportadas por el autor en el conjunto de prueba (F1 macro de 0,9324 y accuracy de 0,9357).

Arquitectónicamente es un transformer encoder-only de tipo RoBERTa con 559.892.482 parámetros (aproximadamente 560 M), sin capacidad generativa. Su utilidad principal es como componente de preprocesado o moderación en pipelines de NLP en español, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (XLM-RoBERTa-large) |
| Parametros totales | 559.892.482 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base XLM-RoBERTa-large soporta 512 tokens, pero el autor no lo especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (español) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-large`, un transformer encoder-only basado en RoBERTa con vocabulario multilingüe y alrededor de 560 M de parámetros. Sobre esa base se aplicó un ajuste fino supervisado para clasificación binaria de secuencias, con una cabeza de clasificación de dos etiquetas (`NO_SARCASMO`, `SARCASMO`).

El conjunto de entrenamiento es `Ernesto-1997/Sarcastic_spanish_dataset`. Según la model card, el autor seleccionó un batch size de 16, un máximo de 10 épocas con early stopping (mínimo 6), learning rate de 1e-05 y precisión bf16. No se documentan detalles sobre el número de ejemplos del dataset, la composición, el split train/validation/test ni si hubo aumentación de datos. Tampoco se indica si se aplicaron técnicas de regularización adicionales o búsqueda de hiperparámetros más allá de la configuración reportada.

## Capacidades

- Clasificación binaria de texto en español: devuelve `SARCASMO` o `NO_SARCASMO` para una secuencia de entrada.
- Análisis de pragmática y tono irónico en textos cortos (comentarios, tuits, reseñas, mensajes).
- Integración sencilla mediante `transformers.pipeline("text-classification", ...)`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo thinking, visión, audio ni generación de texto.
- Capacidad multilingüe limitada en la práctica: aunque el modelo base es multilingüe, el ajuste fino se ha realizado solo con datos en español y la model card declara únicamente `es`.

## Casos de uso

- Moderación de comunidades en español: clasificar comentarios potencialmente sarcásticos o burlescos para priorizar revisión humana, usando el pipeline de clasificación con umbrales de confianza sobre la probabilidad de `SARCASMO`.
- Análisis de sentimiento con matiz pragmático: enriquecer un pipeline de opiniones añadiendo una señal de sarcasmo que evite interpretar literalmente comentarios irónicos (por ejemplo, "¡Qué divertido, otro lunes de trabajo!").
- Monitorización de reputación de marca: detectar reseñas o menciones sarcásticas en redes sociales que un analizador de sentimiento estándar clasificaría erróneamente como positivas.
- Investigación en PLN en español: servir como baseline reproducible para experimentos sobre ironía y sarcasmo, dado que el checkpoint y el dataset son públicos y la licencia es MIT.
- Filtrado de datos para anotación: preetiquetar grandes volúmenes de texto y enviar solo los casos de alta confianza a etiquetado automático, reservando la revisión humana para los casos ambiguos.
- Detección de toxicidad encubierta: usar la señal de sarcasmo como feature auxiliar en sistemas de moderación que combinan varios clasificadores especializados.
- Enriquecimiento de datasets de diálogo: anotar turnos conversacionales con la etiqueta de sarcasmo para entrenar o evaluar modelos generativos con conciencia pragmática.

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto de prueba del dataset `Ernesto-1997/Sarcastic_spanish_dataset`:

| Metrica | Valor |
|---|---|
| Precision (macro) | 0.9344 |
| Recall (macro) | 0.9305 |
| F1 (macro) | 0.9324 |
| Accuracy | 0.9357 |

No se han publicado comparaciones con otros modelos en la información disponible, ni resultados desglosados por clase, ni métricas sobre otros datasets. Tampoco se documenta el tamaño del conjunto de prueba, lo que impide valorar la significación estadística de las cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB solo para pesos (560 M de parámetros × 4 bytes), más activaciones y overhead del runtime.
- VRAM estimada en fp16/bf16: alrededor de 1,1 GB para pesos, más overhead; cómodo en GPUs consumer.
- Cabe en GPUs consumer: sí, en cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). También puede ejecutarse en CPU para volúmenes moderados.
- GPUs recomendadas para throughput alto: A100, H100, L40S o RTX 4090 para procesamiento por lotes a gran escala.
- Opciones de despliegue: `transformers` (PyTorch), `optimum` con ONNX Runtime, TorchScript, y servidores de inferencia como TGI o Triton. No se documenta soporte GGUF/llama.cpp en la información disponible.
- Latencia y throughput: no disponibles. Al ser un encoder de 560 M, se espera latencia de pocos milisegundos por secuencia en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cadrojasl/xlm-roberta-large-sarcasmo-spanish-2026 | 559.892.482 | no disponible | Clasificación de sarcasmo en español | MIT | Hugging Face |
| FacebookAI/xlm-roberta-large | ~560 M | 512 tokens | Modelo base multilingüe (encoder) | MIT | Hugging Face |
| BETO (dccuchile/bert-base-spanish-wwm-cased) | ~110 M | 512 tokens | Modelo base en español (encoder) | MIT | Hugging Face |
| robertuito (pysentimiento/robertuito-base-uncased) | ~110 M | 128 tokens | Modelo base para español de redes sociales | MIT | Hugging Face |

La comparación directa con otros clasificadores de sarcasmo en español no está disponible en la información proporcionada. Frente al modelo base, este checkpoint añade la cabeza de clasificación y el ajuste específico; frente a BETO o robertuito, ofrece mayor capacidad (560 M frente a ~110 M) a costa de más memoria y latencia.

## Limitaciones y advertencias

- El modelo se ha entrenado exclusivamente sobre un dataset concreto (`Ernesto-1997/Sarcastic_spanish_dataset`); su generalización a otros dominios (prensa, literatura, conversación oral) no está validada.
- Las métricas reportadas son del propio autor y no han sido replicadas de forma independiente; además, se desconoce el tamaño del conjunto de prueba.
- Riesgo de sesgo de dominio y de estilo: el sarcasmo depende de contexto cultural, registro y variante dialectal del español; el modelo puede fallar en variedades no representadas en el dataset.
- Riesgo de alucinación no aplica en el sentido generativo (es un clasificador), pero sí de falsos positivos y falsos negativos con confianza alta.
- La longitud máxima de entrada no está documentada; el modelo base admite 512 tokens, por lo que textos más largos requerirán truncamiento y pueden perder la información contextual necesaria para detectar la ironía.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar también las condiciones del dataset de entrenamiento, que no se detallan en la información disponible.
- No apto para decisiones automatizadas de alto impacto sin revisión humana: la detección de sarcasmo es intrínsecamente ambigua y el modelo no proporciona calibración documentada.
- Modelo con muy poca tracción (21 descargas, 0 likes en el momento de la consulta): no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/cadrojasl/xlm-roberta-large-sarcasmo-spanish-2026
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Dataset de entrenamiento: https://huggingface.co/datasets/Ernesto-1997/Sarcastic_spanish_dataset
