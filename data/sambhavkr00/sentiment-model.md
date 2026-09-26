# sambhavkr00/sentiment-model

## Resumen

`sentiment-model` es un checkpoint de clasificación de texto publicado por el usuario `sambhavkr00` en Hugging Face, obtenido mediante fine-tuning de `distilbert-base-uncased`. Se distribuye bajo licencia Apache 2.0, tiene 66.955.779 parámetros y pesos en formato safetensors, y está etiquetado para la tarea `text-classification` (análisis de sentimiento). El repositorio ocupa 0,3 GB y no registra descargas ni "likes" en el momento de la consulta.

El modelo aborda el problema clásico de asignar una etiqueta de polaridad a un texto corto. Al partir de DistilBERT, hereda un encoder transformer destilado de BERT-base: 6 capas, 768 de dimensión oculta y 12 cabezas de atención según la documentación del modelo base, con un límite posicional de 512 tokens.

Su relevancia práctica es limitada como componente de producción: la model card, generada automáticamente por el Trainer, informa de una exactitud de 0,6598, un F1 ponderado de 0,6493 y una pérdida de 0,7470 sobre un conjunto de evaluación cuyo dataset no se documenta. No se especifican el número de etiquetas, el dominio de entrenamiento ni los idiomas, y el array `model-index` está vacío, por lo que no hay benchmarks oficiales verificables.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT con destilación (DistilBERT); 6 capas, 768 de dimensión oculta y 12 cabezas según la documentación de `distilbert-base-uncased` |
| Parametros totales | 66.955.779 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (límite posicional del modelo base) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos safetensors en precisión completa (FP32). No hay GGUF, ONNX ni versiones cuantizadas |
| Idiomas soportados | no disponible; el modelo base (`distilbert-base-uncased`) se entrenó principalmente con texto en inglés y sin distinción de mayúsculas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

Otros datos del repositorio: pipeline `text-classification`, tamaño del repo 0,3 GB, tag `endpoints_compatible` (desplegable en Hugging Face Inference Endpoints), creado el 26 de septiembre de 2026 y actualizado el mismo día.

## Arquitectura y entrenamiento

La arquitectura es la de `distilbert-base-uncased`: un encoder transformer de 6 capas destilado de BERT-base, al que se le añade una cabeza de clasificación de secuencias para la tarea de sentimiento. El checkpoint resultante conserva la tokenización WordPiece sin distinción de mayúsculas y el límite de 512 posiciones del modelo base. No se documenta ninguna innovación técnica adicional (atención lineal, decodificación especulativa ni modificación del bloque transformer).

Los hiperparámetros de entrenamiento sí están recogidos en la model card: 3 épocas, tasa de aprendizaje 2e-5 con planificador lineal, tamaño de batch de 32 tanto en entrenamiento como en evaluación, semilla 42 y optimizador AdamW fusionado (betas 0,9/0,999, epsilon 1e-8). No se indica el número de pasos totales más allá de los 174 registrados, ni tampoco el dataset utilizado ("unknown dataset" en la propia model card), la composición de los datos, el número de clases o si hubo fases de RLHF/DPO. Tampoco se documentan los datos de evaluación. Las versiones de framework empleadas fueron Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

Evolución del entrenamiento declarada por el autor:

| Época | Paso | Pérdida de validación | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|
| 1.0 | 58 | 0.8737 | 0.6080 | 0.5529 | 0.5529 |
| 2.0 | 116 | 0.7226 | 0.6975 | 0.6881 | 0.6881 |
| 3.0 | 174 | 0.7117 | 0.6821 | 0.6736 | 0.6736 |

El mejor punto de validación se alcanza en la época 2; la época 3 no mejora la exactitud ni el F1, lo que sugiere un inicio de sobreajuste o un planificador de learning rate poco adecuado.

## Capacidades

- Clasificación de texto (text-classification), orientada a análisis de sentimiento según el nombre del modelo y su pipeline declarado.
- Inferencia sobre secuencias de hasta 512 tokens; los textos más largos se truncan con la estrategia por defecto del tokenizador.
- Compatible con la API `pipeline("text-classification")` de `transformers` y con `AutoModelForSequenceClassification`.
- Despliegue compatible con Hugging Face Inference Endpoints (tag `endpoints_compatible`).
- No hay evidencia documentada de generación de texto, razonamiento, código, matemáticas, visión, audio ni modo de pensamiento: la cabeza es de clasificación, no causal.
- No se documenta soporte de tool calling, function calling ni flujos de agentes multi-paso.
- Capacidad multilingüe: no disponible; el modelo base es de vocabulario inglés y sin distinción de mayúsculas.
- No se especifica el número de etiquetas de salida ni su nomenclatura (por ejemplo, positivo/negativo o incluir neutral), por lo que la interpretación de las predicciones requiere inspección del `config.json`.

## Casos de uso

- Prototipado y línea base en proyectos de análisis de sentimiento: sirve como referencia rápida para comparar contra fine-tunings propios, dado su tamaño reducido y su licencia permisiva, aunque su exactitud declarada (0,6598) exige validar antes cualquier promoción a producción.
- Pre-etiquetado en flujos de anotación humana o active learning: el modelo puede etiquetar grandes volúmenes de reseñas o comentarios y reservar la revisión manual para las muestras con menor confianza, reduciendo el coste de anotación.
- Triaje de tickets de soporte: clasificar el tono de quejas y solicitudes para enrutarlas por prioridad, siempre con umbrales de confianza y revisión humana dado el margen de error del checkpoint.
- Análisis de opiniones en encuestas abiertas o redes sociales: procesado por lotes de respuestas cortas con `batch_size` alto para obtener agregados de polaridad por segmento o periodo temporal.
- Enriquecimiento de metadatos en bases de datos de reseñas de producto: añadir una etiqueta de sentimiento a cada registro para habilitar filtros y dashboards, ejecutando la inferencia en CPU o en una GPU de gama baja.
- Docencia y experimentación académica: ejemplo de fine-tuning completo de DistilBERT con el Trainer, útil para reproducir un pipeline de entrenamiento y evaluar el impacto de la tasa de aprendizaje y las épocas (el autor observa degradación en la tercera época).
- Moderación preliminar de comentarios: señalizar contenido con polaridad negativa marcada como candidato a revisión por moderadores, nunca como decisión automática final.

## Benchmarks y rendimiento

El `model-index` de la model card está vacío (`"results": []`): no hay benchmarks oficiales publicados (MMLU, GLUE, SST-2, etc.). Los únicos datos disponibles son las métricas de evaluación declaradas por el autor:

| Metrica | Conjunto | Valor |
|---|---|---|
| Pérdida (loss) | evaluación (dataset no documentado) | 0.7470 |
| Accuracy | evaluación (dataset no documentado) | 0.6598 |
| F1 weighted | evaluación (dataset no documentado) | 0.6493 |
| F1 macro | evaluación (dataset no documentado) | 0.6493 |

No se han publicado resultados de benchmarks adicionales en la información disponible, ni comparaciones con otros modelos en la misma métrica y dataset.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 268 MB (66.955.779 parámetros × 4 bytes); en FP16/BF16 bajarían a unos 134 MB. El repositorio completo ocupa 0,3 GB.
- VRAM estimada para inferencia: por debajo de 1 GB en FP16 con lotes pequeños; del orden de 2-3 GB en FP32 con `batch_size` 32 y secuencias de 512 tokens (estimación orientativa, no medida por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente (GTX 1650, RTX 3050, T4, RTX 3060, RTX 4090, A100, H100). El modelo queda muy por debajo de la capacidad de las GPU de centro de datos.
- Cabe sin problemas en GPU de consumo e incluso en CPU: en CPU la latencia por frase es del orden de milisegundos a decenas de milisegundos con `batch_size` pequeño, aunque no hay mediciones publicadas.
- Opciones de despliegue: `transformers` (pipeline nativo), ONNX Runtime o TorchScript tras exportación, Hugging Face Inference Endpoints (tag `endpoints_compatible`), Text Embeddings Inference de Hugging Face (soporta modelos de clasificación de secuencias) y servidores propios con FastAPI.
- No hay pesos GGUF ni ONNX publicados, por lo que Ollama y llama.cpp no pueden consumirlo directamente sin una conversión previa; llama.cpp tampoco soporta de forma estándar las cabezas de clasificación de BERT. El soporte de vLLM para modelos encoder de clasificación es limitado y no está garantizado para este checkpoint.
- Latencia y throughput: no disponible; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento comparable |
|---|---|---|---|---|
| `sambhavkr00/sentiment-model` | 66.955.779 | 512 tokens | apache-2.0 | Accuracy 0.6598 y F1 weighted 0.6493 en su propio conjunto de evaluación no documentado |
| `distilbert-base-uncased` (modelo base) | 66,9 M aprox. | 512 tokens | apache-2.0 | no disponible (checkpoint preentrenado, sin cabeza de clasificación ajustada) |
| `distilbert-base-uncased-finetuned-sst-2-english` | 67 M aprox. | 512 tokens | apache-2.0 | no disponible en esta ficha; se trata de un fine-tuning sobre SST-2, con dataset y etiquetas documentados |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | 125 M aprox. | 512 tokens | no disponible en esta ficha | no disponible en esta ficha; orientado a texto de redes sociales en varios idiomas |

Las cifras de parámetros y contexto de los modelos alternativos proceden de la documentación pública de dichos checkpoints y no han sido verificadas en esta ficha. La comparación de rendimiento no es posible porque los benchmarks disponibles no comparten dataset ni métrica; además, este checkpoint no documenta el conjunto de evaluación, lo que impide cualquier comparación rigurosa.

## Limitaciones y advertencias

- Exactitud baja: 0,6598 de accuracy y 0,6493 de F1 macro sobre un conjunto no documentado. En tareas binarias equilibradas esto queda cerca de una línea base trivial, por lo que no es recomendable para decisiones automatizadas sin validación previa en el dominio objetivo.
- Pérdida de evaluación elevada (0,7470) y ausencia de mejoras en la tercera época: indicios de ajuste insuficiente o de sobreajuste, según la métrica observada.
- Dataset de entrenamiento y de evaluación desconocidos ("unknown dataset" en la propia model card), sin información sobre el número de clases, el equilibrio entre ellas, el idioma o el dominio. No se puede evaluar el sesgo ni la transferibilidad.
- Model card generada automáticamente por el Trainer y sin completar: las secciones de descripción, usos previstos y datos de entrenamiento aparecen como "More information needed".
- Idiomas no documentados: el modelo base es de vocabulario inglés y sin distinción de mayúsculas, por lo que el comportamiento en castellano u otros idiomas no está garantizado ni evaluado.
- Límite de 512 tokens: los documentos largos se truncan y pueden perder la información determinante para la clasificación.
- Riesgo de alucinación: no aplica en sentido estricto al ser un clasificador y no un modelo generativo; el riesgo equivalente es la clasificación errónea o sistemáticamente sesgada en textos fuera de distribución.
- Licencia Apache 2.0: permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se indiquen los cambios. La licencia del modelo base (`distilbert-base-uncased`) es asimismo Apache 2.0, por lo que no hay incompatibilidad conocida.
- Repositorio sin descargas ni "likes" y sin mantenimiento posterior al día de creación: no hay garantía de soporte, correcciones ni versiones actualizadas.
- Antes de cualquier uso en producción, conviene inspeccionar el `config.json` para conocer el número y la nomenclatura exactos de las etiquetas, y evaluar el modelo con un conjunto de validación propio y representativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sambhavkr00/sentiment-model
- Modelo base en Hugging Face: https://huggingface.co/distilbert-base-uncased
- Paper original de DistilBERT (Sanh et al., 2019), referencia de la arquitectura del modelo base, no citado en la model card: https://arxiv.org/abs/1910.01108
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos específicos de este checkpoint.
