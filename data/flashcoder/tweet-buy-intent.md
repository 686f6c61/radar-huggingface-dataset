# flashcoder/tweet-buy-intent

## Resumen

Tweet Buy-Intent Head es una cabeza de clasificación (classification head) de 199 KB entrenada por flashcoder para puntuar publicaciones de X/Twitter según su intención de compra. No es un modelo de lenguaje completo, sino un clasificador binario ligero que se apoya en un embedder congelado (google/embeddinggemma-2) para convertir el texto en un vector de 768 dimensiones y, a partir de ahí, un perceptrón multicapa (MLP) de 768→64→1 con 49.000 parámetros emite una puntuación entre 0 y 1 que indica la probabilidad de que el autor esté buscando activamente una solución o recomendación de producto.

El modelo se ha destilado a partir de un profesor Gemini 2.5 Flash: el profesor etiquetó 7.866 publicaciones de X (2.850 de ellas con intención de compra) y la cabeza se entrenó para imitar esas etiquetas. El resultado es un componente extremadamente ligero que corre en CPU y que está pensado para integrarse en pipelines de lead mining, filtrando en tiempo real publicaciones que contienen frases como "is there an app that…", "anyone recommend…" o "I wish there was…".

Su relevancia reside en la eficiencia: frente a soluciones basadas en LLM para clasificación de intención, este clasificador requiere únicamente ejecutar un embedder pequeño y un MLP de 49k parámetros, lo que permite procesar grandes volúmenes de tuits en hardware modesto. La contrapartida es que las etiquetas de entrenamiento son sintéticas (generadas por Gemini) y no existe todavía un conjunto de referencia humano, por lo que las métricas publicadas miden acuerdo con el profesor, no verdad fundamental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (768→64→1) sobre embeddings congelados de google/embeddinggemma-2 |
| Parametros totales | 49.000 (cabeza) + embedder base congelado (no cuantificado en la ficha) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del embedder base) |
| Tipos de cuantizacion | no disponible (pesos en float32; el autor indica ejecución en CPU) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | head.pt (PyTorch state_dict) |

## Arquitectura y entrenamiento

La arquitectura es un clasificador de dos capas sobre embeddings: un MLP con una capa oculta de 64 neuronas, activación ReLU, dropout de 0,2 y una neurona de salida con sigmoide. La entrada son embeddings normalizados de 768 dimensiones producidos por google/embeddinggemma-2, que permanece congelado durante el entrenamiento. El conjunto de entrenamiento consta de 7.866 publicaciones de X, de las cuales 2.850 tienen intención de compra, etiquetadas por destilación de Gemini 2.5 Flash. El pipeline de generación de datos y entrenamiento está publicado en el repositorio github.com/flashclub/x-lead-intent-pipeline.

No se especifica en la información disponible el número de épocas, la tasa de aprendizaje, el esquema de validación cruzada ni si se aplicaron técnicas de aumento de datos. La innovación principal es la destilación de un profesor LLM hacia una cabeza de clasificación mínima que se ejecuta en CPU, lo que abarata drásticamente el coste de inferencia frente a usar el propio Gemini para puntuar cada tuit.

## Capacidades

- Clasificación binaria de intención de compra en publicaciones de X/Twitter, con salida continua entre 0 y 1.
- Detección de patrones de búsqueda de producto o recomendación ("is there an app that…", "anyone recommend…", "I wish there was…").
- Ejecución en CPU sin GPU dedicada, gracias al tamaño reducido de la cabeza y a un embedder que puede ejecutarse en float32.
- Integración en pipelines de lead mining para priorizar publicaciones con mayor probabilidad de conversión.
- Puntuación por lotes mediante sentence-transformers y PyTorch.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador.
- Capacidades multilingües: no disponibles en la información proporcionada (dependen del embedder base, no documentadas aquí).

## Casos de uso

- Filtrado de leads en tiempo real: el clasificador puntúa cada tuit entrante y solo los que superan un umbral (por ejemplo, 0,8) pasan a una cola de revisión comercial, reduciendo el ruido en el pipeline de captación.
- Monitorización de menciones de marca: al puntuar publicaciones que mencionan una categoría de producto, el equipo de marketing puede detectar usuarios que buscan activamente una solución y responder con contenido relevante.
- Generación de listas de prospectos para ventas B2B/B2C: procesar el histórico de publicaciones de una cuenta y ordenar por puntuación de intención de compra para priorizar el contacto.
- Automatización de respuestas en soporte: identificar tuits que expresan una necesidad no cubierta ("I wish there was…") y enrutarlos a un agente humano o a un flujo de respuesta automática.
- Investigación de mercado: agregar las puntuaciones por tema o categoría para estimar el volumen de demanda no satisfecha en X en un periodo dado.
- Enriquecimiento de CRM: añadir una señal de intención de compra a los contactos que ya están en la base de datos, cruzando sus publicaciones públicas con el clasificador para priorizar seguimientos.
- Moderación de comunidades: descartar publicaciones con intención comercial no deseada en foros o hilos donde se prohíbe la autopromoción, usando la puntuación como señal de filtro.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de test reservado (n=1.179):

| Métrica | Valor |
|---|---|
| precision@5 | 1,00 |
| precision@10 | 1,00 |
| accuracy @0,5 | 0,877 |

Advertencia del autor: las etiquetas son generadas por Gemini 2.5 Flash, sin conjunto de referencia humano; las métricas miden acuerdo con el profesor (aproximadamente 90% de acuerdo humano según una auditoría de 50 muestras), no verdad fundamental. La intención basada en quejas está infradetectada, lo que el autor describe como una dirección segura para colas de leads (se pierde recall, no pureza).

## Requisitos de hardware

- VRAM estimada: no aplica para la cabeza (49k parámetros, ~199 KB en disco); el embedder base google/embeddinggemma-2 requiere su propio presupuesto de memoria, no especificado en la información disponible.
- GPU recomendadas: no disponibles; el autor indica ejecución en CPU.
- Cabe en GPU de consumo: sí, la cabeza es trivial; el embedder base puede ejecutarse en GPU de consumo, pero no se documentan requisitos concretos.
- Opciones de despliegue: PyTorch en CPU con sentence-transformers y huggingface_hub; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un clasificador de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La categoría (cabeza de clasificación destilada sobre embedder congelado para intención de compra en redes sociales) no cuenta con referencias públicas incluidas en esta ficha.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| flashcoder/tweet-buy-intent | 49k (cabeza) + embedder base | no disponible | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son sintéticas (Gemini 2.5 Flash), sin conjunto de referencia humano; las métricas reflejan acuerdo con el profesor, no precisión real.
- La intención basada en quejas está infradetectada: el modelo tiende a perder recall en ese subtipo, lo que puede dejar fuera leads válidos.
- No se documentan sesgos demográficos, geográficos o lingüísticos; al depender del embedder base, hereda los sesgos de este, no evaluados aquí.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos en la puntuación (publicaciones que parecen intención de compra sin serlo).
- Idiomas soportados no documentados; el rendimiento en idiomas distintos del inglés es desconocido.
- Licencia MIT permite uso comercial, pero el embedder base google/embeddinggemma-2 tiene su propia licencia (Apache-2.0 según el autor) que debe verificarse por separado.
- El modelo no genera texto ni razona: cualquier uso que requiera explicaciones o justificaciones de la puntuación necesita un componente adicional.
- No hay información sobre latencia, throughput ni comportamiento en producción a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flashcoder/tweet-buy-intent
- Pipeline de datos y entrenamiento: https://github.com/flashclub/x-lead-intent-pipeline
- Embedder base: https://huggingface.co/google/embeddinggemma-2
