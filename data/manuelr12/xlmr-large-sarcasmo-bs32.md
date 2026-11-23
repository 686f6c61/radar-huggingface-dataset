# ManuelR12/xlmr-large-sarcasmo-bs32

## Resumen

xlmr-large-sarcasmo-bs32 es un modelo de clasificación de texto en español especializado en detectar sarcasmo. Lo desarrolla ManuelR12 y parte de FacebookAI/xlm-roberta-large, un transformer encoder de tipo XLM-RoBERTa con 559.892.482 parámetros. El modelo se ha afinado como clasificador binario con dos etiquetas, `SARCASMO` y `NO_SARCASMO`, y se distribuye con licencia Apache 2.0 en formato safetensors (repo de 2,3 GB).

El problema que aborda es concreto: la detección automática de ironía y sarcasmo en textos en español, una tarea con aplicación directa en moderación de comunidades, análisis de opinión y filtrado de reseñas. La relevancia de esta ficha es limitada por su estado: el repositorio tiene 0 descargas y 0 likes, se publicó el 23 de noviembre de 2026 y no incluye dataset público ni evaluación fuera de su propio conjunto de validación.

Técnicamente es un fine-tuning estándar de clasificación sobre XLM-RoBERTa large, con longitud máxima de 128 tokens, batch efectivo de 32 mediante acumulación de gradientes en 4 tandas de 8 y un máximo de 10 épocas con early stopping sobre F1. El autor reporta un F1 macro de 0,9348 en validación, aunque la pérdida de validación asciende a partir de la época 2, lo que indica sobreajuste progresivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large), fine-tuning para clasificación de secuencias |
| Parametros totales | 559.892.482 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (longitud máxima usada en entrenamiento, con padding); la ventana nativa de XLM-RoBERTa large no se especifica en la información disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | es (español) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa large: un transformer encoder con atención multi-cabeza bidireccional, preentrenado de forma multilingüe y reutilizado aquí como extractor de representaciones para una cabeza de clasificación binaria. El fine-tuning se hizo sobre un dataset local no publicado en el Hub, compuesto por 12.145 frases de entrenamiento y 3.037 de validación, balanceadas 50/50 entre sarcasmo y no sarcasmo y formadas mayoritariamente por titulares de prensa. No se documenta el número de tokens totales de entrenamiento ni la composición detallada del corpus más allá de esa descripción.

Los hiperparámetros son: batch size 32 implementado como 4 tandas de 8 con acumulación de gradientes (el modelo no cabía en una GPU de 16 GB), learning rate 1e-05, hasta 10 épocas con early stopping de paciencia 2 monitorizando F1 de validación, y longitud máxima de 128 tokens con padding. Se completaron las 10 épocas y la mejor fue la décima. No se menciona RLHF, DPO ni ninguna técnica de alineación; es un ajuste supervisado convencional con entropía cruzada. No hay innovaciones destacables en decodificación ni atención: el modelo no genera texto, solo emite una etiqueta y su puntuación.

## Capacidades

- Clasificación binaria de texto en español: devuelve `SARCASMO` o `NO_SARCASMO` con una puntuación de confianza.
- Detección de ironía y sarcasmo en frases cortas, principalmente titulares de prensa.
- Integración directa con `transformers` mediante `pipeline("text-classification")`.
- Procesamiento por lotes de textos de hasta 128 tokens.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: es un encoder discriminativo, no un modelo generativo.
- Capacidad multilingüe limitada al español en la práctica, aunque el backbone base sea multilingüe.
- No dispone de modo thinking, visión, audio ni generación de texto.

## Casos de uso

- Moderación de comentarios en foros y redes: clasificar mensajes entrantes para marcar posibles sarcasmos que un filtro literal interpretaría mal, usando el pipeline de clasificación con umbral ajustable sobre la puntuación de `SARCASMO`.
- Análisis de opinión en prensa y redes: etiquetar titulares y comentarios para separar crítica irónica de crítica literal antes de agregar sentimiento, dado que el modelo se entrenó precisamente con titulares.
- Filtrado de reseñas de producto: detectar reseñas sarcásticas que puntúan alto pero expresan insatisfacción, procesando cada reseña en lotes de hasta 128 tokens.
- Enriquecimiento de datasets de NLP: preetiquetar corpus en español con una señal de sarcasmo para revisión humana posterior, aprovechando el F1 reportado de 0,9348 en su dominio de validación.
- Investigación en pragmática computacional: usar el modelo como línea base de comparación para experimentos de detección de ironía en español, con la ventaja de que el checkpoint es pequeño (2,3 GB) y la licencia Apache 2.0 permite redistribución.
- Preprocesado en pipelines de atención al cliente: marcar tickets con tono sarcástico para enrutarlos a agentes humanos, limitado a textos cortos y con validación previa porque el modelo no se entrenó con lenguaje conversacional.
- Detección de toxicidad encubierta: combinar la señal de sarcasmo con un clasificador de toxicidad para reducir falsos negativos en mensajes irónicos agresivos.

## Benchmarks y rendimiento

Resultados reportados por el autor en su conjunto de validación (3.037 frases, mejor época, la 10):

| Metrica | Valor |
|---|---|
| F1 macro | 0.9348 |
| F1 ponderado | 0.9348 |
| Accuracy (epoca 10) | 0.9348 |
| Perdida de validacion (epoca 10) | 0.5823 |
| Perdida de entrenamiento (epoca 10) | 0.0214 |

Evolución por época (accuracy / F1):

| Epoca | Accuracy | F1 |
|---|---|---|
| 1 | 0.8209 | 0.8180 |
| 2 | 0.9055 | 0.9055 |
| 3 | 0.9187 | 0.9186 |
| 4 | 0.9144 | 0.9143 |
| 5 | 0.9272 | 0.9272 |
| 6 | 0.9272 | 0.9272 |
| 7 | 0.9318 | 0.9318 |
| 8 | 0.9305 | 0.9305 |
| 9 | 0.9335 | 0.9335 |
| 10 | 0.9348 | 0.9348 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible, ni comparaciones con otros detectores de sarcasmo en español.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 2,2-2,5 GB solo para pesos, más activaciones; con batch pequeño cabe holgadamente en GPUs de 8 GB.
- En fp16: aproximadamente 1,1-1,3 GB de pesos, apto para GPUs consumer de 4-6 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB para comodidad (RTX 3060, RTX 4060, RTX 4090, A100, H100); el modelo es pequeño y no aprovecha aceleradores de gama alta.
- Cabe en GPU consumer: sí, en todas las RTX modernas desde 6 GB, y también en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `pipeline`, TorchScript/ONNX si se exporta, y servidores de inferencia como TGI o vLLM (este último con soporte de classification limitado; verificar compatibilidad). No hay pesos GGUF publicados para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles; al ser un encoder de 560 M de parámetros con secuencias de 128 tokens, el coste por frase es bajo, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xlmr-large-sarcasmo-bs32 | 559.892.482 | 128 tokens (entrenamiento) | Clasificación de sarcasmo en español | apache-2.0 | Hugging Face, 0 descargas |
| FacebookAI/xlm-roberta-large (base) | ~560 M | 512 tokens (nativo) | Modelo base multilingüe | MIT (según el modelo base) | Hugging Face, ampliamente usado |
| BETO (dccuchile/bert-base-spanish-wwm-cased) | ~110 M | 512 tokens | Modelo base en español | Apache 2.0 | Hugging Face, muy usado |
| robertuito (pysentimiento/robertuito-base-uncased) | ~110 M | 128 tokens | Modelo base para español de redes sociales | MIT | Hugging Face, usado en análisis de sentimiento |

La comparación de rendimiento con alternativas específicas de detección de sarcasmo en español no está disponible: no se han publicado métricas cruzadas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado casi exclusivamente con titulares de prensa: puede apoyarse en el tema o el medio de la noticia en lugar de en la ironía real, y fallará con sarcasmo conversacional.
- Sesgo de dominio y de registro: jerga regional, español de América, lenguaje informal y memes quedan fuera de la distribución de entrenamiento.
- Longitud máxima de 128 tokens: textos largos se truncan y pierden la información necesaria para detectar la ironía.
- Sobreajuste: la pérdida de validación sube desde la época 2 (0,2361) hasta la 10 (0,5823) mientras el F1 apenas mejora; el modelo se vuelve muy confiado y sus errores pesan más. El checkpoint elegido es el más sobreajustado de la serie.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y negativos con puntuaciones de confianza engañosamente altas.
- Dataset de entrenamiento no publicado: no es posible auditar la composición, los sesgos ni reproducir los resultados.
- Sin evaluación externa ni comparativa con otros modelos: el F1 de 0,9348 procede de un conjunto de validación del propio autor y no debe extrapolarse a producción.
- Licencia Apache 2.0: permite uso comercial y redistribución, pero conviene revisar las condiciones del modelo base y citar adecuadamente.
- Repositorio sin tracción (0 descargas, 0 likes) y sin mantenimiento documentado: no hay garantía de soporte ni de correcciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ManuelR12/xlmr-large-sarcasmo-bs32
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Paper de XLM-RoBERTa (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- Documentación de `transformers` para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
