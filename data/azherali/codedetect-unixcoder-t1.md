# azherali/CodeDetect-UniXCoder-T1

## Resumen

CodeDetect-UniXCoder-T1 es un modelo de clasificación de texto especializado en detectar si un fragmento de código fuente ha sido escrito por un humano o generado por una IA. Lo desarrolla el usuario de Hugging Face azherali y se construye mediante fine-tuning del checkpoint `microsoft/unixcoder-base`, un encoder tipo RoBERTa preentrenado específicamente sobre código fuente. La tarea es de clasificación binaria: la etiqueta `0` corresponde a código humano y la `1` a código generado por IA.

El modelo tiene 125.931.266 parámetros (aproximadamente 126 millones), lo que lo sitúa en la categoría de encoders pequeños y eficientes, muy alejado de los LLM generativos. Su ventana de entrada está limitada a 512 tokens según el ejemplo de la model card, lo que condiciona el análisis a fragmentos de código relativamente cortos. Se distribuye en formato safetensors bajo licencia Apache 2.0, con un repositorio de 2,5 GB.

Su relevancia actual se enmarca en el interés creciente por la atribución de autoría de código y la detección de contenido generado por IA en entornos académicos, auditorías de repositorios y políticas de contribución. Al estar basado en UniXcoder, hereda una tokenización y un preentrenamiento orientados a lenguajes de programación, lo que lo hace más adecuado para esta tarea que un encoder genérico de texto natural. La información pública disponible es escasa: no hay detalles sobre el dataset de entrenamiento ni resultados de benchmarks declarados en el model-index.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (UniXcoder), clasificación de secuencias |
| Parámetros totales | 125.931.266 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (según el ejemplo de uso de la model card) |
| Tipos de cuantización | no disponible (pesos en safetensors; admite cuantización estándar de PyTorch, no documentada por el autor) |
| Idiomas soportados | no disponible (el modelo base está orientado a código fuente, no a lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en `microsoft/unixcoder-base`, que a su vez sigue la arquitectura de RoBERTa adaptada al código fuente. Sobre esa base se ha añadido una cabeza de clasificación de secuencias (`AutoModelForSequenceClassification`) con dos etiquetas: `Human` (id 0) y `AI` (id 1). El modelo se ha entrenado con la librería Transformers (versión 5.13.1) y PyTorch 2.11.0, usando el flujo `Trainer` estándar.

Los hiperparámetros declarados en la model card son: learning rate de 2e-05, batch size de 64 tanto en entrenamiento como en evaluación, semilla 42, optimizador AdamW fusionado con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con warmup del 10 %, 5 épocas y precisión mixta nativa (AMP). El entrenamiento se ejecutó durante 84.485 pasos. No se especifica la composición ni el tamaño del dataset de entrenamiento, ni si hubo aumento de datos, limpieza o balanceo de clases. Tampoco se documentan innovaciones técnicas adicionales más allá del fine-tuning supervisado estándar.

## Capacidades

- Clasificación binaria de fragmentos de código fuente en dos categorías: código escrito por humanos y código generado por IA.
- Salida de probabilidades por clase mediante softmax, lo que permite aplicar umbrales de decisión ajustables.
- Procesamiento de entradas de hasta 512 tokens, adecuado para funciones, métodos o bloques de código de tamaño moderado.
- Integración directa con la API de Transformers (`AutoTokenizer` y `AutoModelForSequenceClassification`).
- Compatibilidad con Text Embeddings Inference y endpoints de Hugging Face según las etiquetas del repositorio.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión ni audio.
- No se declaran capacidades multilingües de lenguaje natural; su dominio es el código fuente.

## Casos de uso

- Detección de plagio y atribución en entornos académicos: el modelo permite clasificar entregas de programación y señalar fragmentos sospechosos de haber sido generados por asistentes de IA, con una probabilidad asociada que el docente puede usar como indicio, no como prueba definitiva.
- Auditoría de repositorios y pull requests: integrado en un hook de CI/CD, puede analizar los diffs o los ficheros modificados y marcar contribuciones con alta probabilidad de origen sintético para revisión humana.
- Políticas de contribución en proyectos open source: permite aplicar reglas de gobernanza que exijan declarar el uso de IA generativa, clasificando automáticamente los commits entrantes.
- Moderación de plataformas de código: foros, plataformas de retos y concursos de programación pueden usar el clasificador para detectar soluciones generadas automáticamente y preservar la integridad de la competición.
- Investigación sobre procedencia de código: sirve como línea base ligera en estudios que comparan detectores de código generado por IA, dado su bajo coste computacional y su naturaleza de encoder pequeño.
- Filtrado de datasets de entrenamiento: al construir corpus de código para entrenar otros modelos, el clasificador puede etiquetar y separar muestras humanas de muestras sintéticas, útil para estudiar sesgos de distribución.
- Preprocesado en pipelines de análisis estático: puede ejecutarse como paso previo en herramientas de calidad de código para enriquecer los informes con metadatos de procedencia.

## Benchmarks y rendimiento

El model-index oficial del autor no declara resultados (`results: []`). Sin embargo, la model card incluye la tabla de resultados de validación generada automáticamente por el Trainer:

| Época | Paso | Validation loss | Accuracy | F1 | Precision | Recall |
|---|---|---|---|---|---|---|
| 1.0 | 16897 | 0.0631 | 0.9770 | 0.9770 | 0.9768 | 0.9772 |
| 2.0 | 33794 | 0.0553 | 0.9795 | 0.9794 | 0.9794 | 0.9794 |
| 3.0 | 50691 | 0.0655 | 0.9791 | 0.9790 | 0.9793 | 0.9789 |
| 4.0 | 67588 | 0.0852 | 0.9792 | 0.9792 | 0.9792 | 0.9791 |
| 5.0 | 84485 | 0.1039 | 0.9799 | 0.9799 | 0.9800 | 0.9799 |

No se aportan métricas sobre conjuntos de test independientes, ni comparaciones con otros detectores, ni detalles sobre la distribución del conjunto de validación. Tampoco se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que por otra parte no aplican a un modelo de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 0,5 GB para los pesos (126 M de parámetros × 4 bytes), más el overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- VRAM estimada en FP16/BF16: aproximadamente 0,25 GB para los pesos, con un consumo total por debajo de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está claramente sobredimensionado para estas últimas.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060 y superiores; también puede ejecutarse en CPU con latencias aceptables para volúmenes moderados.
- Opciones de despliegue: Transformers con PyTorch, Text Embeddings Inference (etiqueta `text-embeddings-inference` en el repositorio), endpoints de Hugging Face (etiqueta `endpoints_compatible`), ONNX Runtime tras exportación y TorchScript. No se documenta soporte nativo de vLLM, llama.cpp ni Ollama, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU y viable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CodeDetect-UniXCoder-T1 | 125,9 M | 512 tokens | Clasificación humano/IA | Apache 2.0 | Hugging Face |
| microsoft/unixcoder-base | 125,9 M | 512 tokens | Encoder de código (preentrenamiento) | MIT (según el modelo base) | Hugging Face |
| microsoft/codebert-base | 124,6 M | 512 tokens | Encoder de código (preentrenamiento) | MIT | Hugging Face |
| Detectores genéricos de texto IA (p. ej. clasificadores RoBERTa) | variable | variable | Clasificación texto humano/IA | variable | Hugging Face |

No se dispone de comparaciones de rendimiento publicadas entre este modelo y alternativas específicas de detección de código generado por IA. La comparación con los encoders base es estructural: CodeDetect-UniXCoder-T1 añade una cabeza de clasificación binaria sobre UniXcoder, mientras que los otros dos son modelos de preentrenamiento sin fine-tuning para esta tarea concreta. No se identifican en la información disponible otros detectores de código IA comparables con métricas públicas.

## Limitaciones y advertencias

- No se documenta el dataset de entrenamiento: se desconoce su tamaño, composición, balance de clases, lenguajes de programación cubiertos y procedencia de las muestras sintéticas, lo que impide evaluar sesgos de dominio.
- Riesgo de sobreajuste al estilo de generación de los modelos de IA usados para crear las muestras sintéticas: el detector puede fallar ante código generado por modelos nuevos o con prompts de estilo muy distinto.
- Ventana de 512 tokens: fragmentos largos se truncan, por lo que la clasificación de ficheros completos requiere segmentación previa y agregación de decisiones.
- Métricas de validación muy altas (accuracy ≈ 0,98) sin test independiente: pueden reflejar un conjunto de validación poco diverso o con fugas respecto al de entrenamiento; no deben tomarse como garantía de generalización.
- Riesgo de falsos positivos sobre código humano muy idiomático o generado con plantillas y asistentes de autocompletado, categoría intermedia que el modelo no distingue explícitamente.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base `microsoft/unixcoder-base` debe verificarse por separado; la model card no incluye cláusulas adicionales.
- Al ser un clasificador, no genera explicaciones: la salida es una probabilidad, no una justificación, lo que limita su uso como evidencia en contextos disciplinarios o legales.
- No hay información sobre idiomas de lenguaje natural soportados ni sobre sesgos demográficos o culturales en el código clasificado.
- El repositorio tiene pocas descargas (122) y ningún "like", sin validación comunitaria amplia; conviene tratarlo como un experimento y no como un detector de producción sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/azherali/CodeDetect-UniXCoder-T1
- Modelo base UniXcoder: https://huggingface.co/microsoft/unixcoder-base
- Repositorio oficial de UniXcoder (Microsoft): https://github.com/microsoft/CodeBERT
- Paper de UniXcoder: https://arxiv.org/abs/2203.03850
- Documentación de Transformers para clasificación de secuencias: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
