# 3liel/marbert-arabic-tweet-sentiment-cosine

## Resumen

El modelo `3liel/marbert-arabic-tweet-sentiment-cosine` es un clasificador de sentimiento para tweets en árabe, obtenido mediante fine-tuning del modelo base `UBC-NLP/MARBERTv2`. MARBERTv2 es un transformer bidireccional (BERT) preentrenado sobre 1.000 millones de tweets árabes, que cubre tanto árabe dialectal como árabe moderno estándar (MSA). El autor, 3liel, ha ajustado este modelo para la tarea de clasificación de sentimiento, probablemente en categorías como positivo y negativo, aunque la model card no especifica las etiquetas exactas.

Con 162,8 millones de parámetros, el modelo tiene un tamaño moderado, adecuado para inferencia en GPUs de consumo y para integración en pipelines de análisis de texto. La principal relevancia reside en su especialización en tweets árabes, un dominio con variedades dialectales que los modelos multilingües genéricos suelen manejar peor. Sin embargo, la falta de información sobre el dataset de entrenamiento y la licencia limita su uso directo en producción sin una evaluación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only transformer) |
| Parametros totales | 162.843.651 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base MARBERTv2 usa 512 tokens, pero no se confirma) |
| Tipos de cuantizacion | no especificado (pesos en safetensors, cuantizacion posible con herramientas externas) |
| Idiomas soportados | Árabe (tweets, dialectal y MSA) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en MARBERTv2, un transformer encoder-only con arquitectura BERT, preentrenado en árabe mediante masked language modeling. El fine-tuning se realizó sobre un dataset no especificado en la model card, con los siguientes hiperparámetros: learning rate 2e-5, batch size 16, optimizador AdamW (fused), scheduler de tasa de aprendizaje con decaimiento coseno y 100 pasos de warmup, durante 8 épocas. La pérdida de validación final fue 1.8414, con accuracy 0.7284 y F1 0.7297. No se menciona el uso de técnicas como RLHF o DPO; es un ajuste supervisado clásico.

El nombre "cosine" en el identificador hace referencia al scheduler de aprendizaje, no a una innovación arquitectónica. El modelo no presenta ninguna modificación estructural respecto al base; es una capa de clasificación añadida sobre la salida del token `[CLS]`.

## Capacidades

- Clasificación de sentimiento en texto árabe, especialmente tweets, con salidas binarias (positivo/negativo) o multiclase (no confirmado).
- Manejo de árabe dialectal y MSA gracias al preentrenamiento de MARBERTv2.
- Inferencia rápida al ser un modelo de tamaño medio (162M parámetros).
- Compatible con la librería `transformers` y con `text-embeddings-inference` (según tags).
- No soporta generación de texto, tool calling, ni capacidades multimodales.

## Casos de uso

- **Monitoreo de opinión en redes sociales**: analizar tweets sobre una marca, producto o evento para medir la percepción pública. El modelo puede procesar grandes volúmenes de tweets gracias a su eficiencia.
- **Atención al cliente automatizada**: clasificar la polaridad de los mensajes de usuarios en árabe para priorizar respuestas a quejas o comentarios negativos.
- **Análisis de campañas políticas**: detectar el sentimiento hacia candidatos o partidos a partir de tweets, útil para estrategias de comunicación.
- **Investigación académica en lingüística computacional**: servir como baseline para estudios de análisis de sentimiento en árabe dialectal.
- **Filtrado de contenido**: identificar tweets negativos o abusivos en flujos de moderación, aunque no está específicamente entrenado para ofensividad.
- **Análisis de mercado**: evaluar la reacción del público a lanzamientos de productos en países de habla árabe.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks comparativos (model-index vacío). Los únicos datos disponibles son los de evaluación durante el entrenamiento, reportados por el autor:

| Metrica | Valor |
|---|---|
| Loss (validacion) | 1.8414 |
| Accuracy | 0.7284 |
| F1 | 0.7297 |

La evolución por épocas muestra un pico de accuracy 0.75 en la primera época, con descenso posterior, lo que sugiere posible sobreajuste. No se han publicado comparaciones con otros modelos de sentimiento en árabe.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para un modelo de 162M parámetros, en FP32 se requieren ~650 MB; en FP16 ~325 MB; en int8 ~160 MB. Cabe en GPUs con 2 GB o más.
- **GPU recomendadas**: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1660, RTX 2060, RTX 3060, o incluso CPU para inferencia por lotes pequeños.
- **Compatibilidad con consumer GPU**: sí, es un modelo ligero que se ejecuta sin problemas en tarjetas de gama media.
- **Opciones de despliegue**: se puede servir con `transformers` (Pipeline API), `vLLM` (aunque está orientado a generación, puede usarse para clasificación), `ONNX Runtime` o `text-embeddings-inference`. Para despliegue en CPU, `llama.cpp` no es adecuado (es para modelos GGUF, pero este modelo no tiene formato GGUF).
- **Latencia y throughput**: no se dispone de datos medidos; en una GPU moderna se esperan latencias de milisegundos por lote pequeño.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| 3liel/marbert-arabic-tweet-sentiment-cosine | 162M | no disponible | Sentimiento en tweets árabes | no disponible |
| iMeshal/arabic-sentiment-classifier-marbert | 162M (base MARBERTv2) | 512 tokens | Sentimiento binario (positivo/negativo) | no especificada |
| UBC-NLP/MARBERTv2 | 163M | 512 tokens | Preentrenamiento general en árabe | MIT (según GitHub) |

No se dispone de resultados de rendimiento comparativos. El modelo de iMeshal es similar en arquitectura y propósito, pero no se conocen sus métricas. MARBERTv2 es el modelo base, no un clasificador.

## Limitaciones y advertencias

- **Dataset de entrenamiento desconocido**: la model card no especifica qué datos se usaron para el fine-tuning, lo que impide evaluar posibles sesgos o cobertura dialectal.
- **Riesgo de sobreajuste**: la pérdida de validación aumenta después de la primera época, lo que sugiere que el modelo podría no generalizar bien a datos fuera del conjunto de entrenamiento.
- **Licencia no disponible**: no se puede determinar si el modelo puede usarse comercialmente sin restricciones.
- **Contexto limitado**: aunque no se confirma, MARBERTv2 tiene una longitud máxima de 512 tokens, lo que limita el análisis de textos largos.
- **Sesgos potenciales**: al estar entrenado con tweets, puede reflejar sesgos de género, geográficos o culturales presentes en ese tipo de datos.
- **Alucinación**: al ser un clasificador, no genera texto, por lo que el riesgo de alucinación es bajo; sin embargo, las predicciones pueden ser incorrectas en casos ambiguos.
- **Idioma restringido**: solo árabe; no funcionará con otros idiomas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/3liel/marbert-arabic-tweet-sentiment-cosine)
- [Modelo base UBC-NLP/MARBERTv2](https://huggingface.co/UBC-NLP/MARBERTv2)
- [Repositorio GitHub de MARBERT](https://github.com/UBC-NLP/marbert)
- [Artículo sobre detección de spam y sentimiento en tweets árabes con MARBERT](https://arxiv.org/abs/2606.25495)
