# DanishMahdi/snd_sentiment_analysis

## Resumen

DanishMahdi/snd_sentiment_analysis es un modelo de clasificación de texto en sindhi (sd) obtenido por ajuste fino de FacebookAI/xlm-roberta-base sobre la tarea de análisis de sentimiento con tres clases: positivo, neutral y negativo. Lo publica el usuario DanishMahdi en Hugging Face bajo licencia MIT y está pensado explícitamente para investigación, experimentación y prototipado ligero en producción, no para decisiones de alto riesgo.

Arquitectónicamente es un transformer encoder de tipo XLM-RoBERTa base con 278.045.955 parámetros, adaptado a clasificación de secuencias mediante una cabeza de clasificación sobre el token especial de inicio. La longitud máxima de secuencia declarada en la model card es de 128 tokens, lo que lo orienta a textos cortos: reseñas, comentarios, publicaciones en redes sociales y fragmentos de feedback.

Su relevancia es acotada pero concreta: el sindhi es un idioma con muy pocos recursos y prácticamente no existen clasificadores de sentimiento publicados y abiertos para él. El modelo reporta en el checkpoint final una accuracy de 0,7553 y un F1 macro de 0,7549 sobre el split de test, aunque el repositorio no incluye ni el script de entrenamiento ni la tarjeta del dataset, lo que limita la reproducibilidad. Con cero descargas y cero likes, se trata de un artefacto reciente y sin validación independiente por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de secuencias |
| Parámetros totales | 278.045.955 |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 posiciones en la arquitectura base; la model card fija 128 tokens como longitud máxima de secuencia |
| Tipos de cuantización | no se publican pesos cuantizados en el repositorio; al ser un encoder de 278 M de parámetros admite cuantización dinámica int8 y exportación a ONNX en el ecosistema estándar |
| Idiomas soportados | sindhi (sd) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,1 GB, incluye tokenizer) |
| Tarea | text-classification (3 clases: positive, neutral, negative) |
| Modelo base | FacebookAI/xlm-roberta-base |
| Dataset de ajuste fino | alinawazmahar/Sindhi_Sentiment_dataset |
| Framework | Hugging Face Transformers |
| Compatibilidad de despliegue | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa base, un transformer encoder preentrenado con objetivo de masked language modeling sobre corpus multilingües de tipo CommonCrawl. La variante base consta de 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y un vocabulario de aproximadamente 250.000 tokens SentencePiece, con 278 M de parámetros. El ajuste fino sustituye la cabeza de lenguaje enmascarado por una cabeza lineal de clasificación con tres salidas, y la representación agregada se toma del token especial `<s>`, siguiendo el procedimiento estándar de Hugging Face para `XLMRobertaForSequenceClassification`.

La información disponible sobre el entrenamiento es muy limitada: la model card indica que el ajuste se hizo sobre el dataset `alinawazmahar/Sindhi_Sentiment_dataset`, con una longitud máxima de 128 tokens, pero no se incluye el script de entrenamiento, la tarjeta del dataset ni los hiperparámetros (tasa de aprendizaje, número de épocas, tamaño de lote, semilla, composición y balance de clases). No hay constancia de que se haya aplicado RLHF, DPO ni ninguna técnica de alineación, algo por otra parte esperable en un clasificador discriminativo. No hay innovaciones técnicas destacables: es un ajuste fino convencional, sin decodificación especulativa, atención lineal ni mecanismos híbridos.

## Capacidades

- Clasificación de sentimiento en sindhi en tres categorías mutuamente excluyentes: positivo, neutral y negativo.
- Funciona sobre textos cortos, con un límite práctico de 128 tokens por secuencia.
- Devuelve puntuaciones de confianza por clase a través del pipeline `text-classification` de Transformers.
- Inferencia por lotes mediante `pipeline`, `AutoModelForSequenceClassification` o servidores compatibles con Text Embeddings Inference.
- Capacidades multilingües: no. Aunque el modelo base es multilingüe, el ajuste fino está orientado únicamente al sindhi.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling, function calling ni uso como agente.
- No dispone de modo de razonamiento explícito (thinking mode) ni de salidas estructuradas más allá de las etiquetas de clase.

## Casos de uso

- Monitorización de opinión en redes sociales en sindhi: clasificar publicaciones y comentarios cortos en positivo, neutral o negativo para alimentar cuadros de mando de reputación de marca, aprovechando que el modelo está ajustado específicamente para textos breves.
- Análisis de reseñas de productos y servicios: procesar por lotes reseñas escritas en sindhi y agregar la distribución de sentimiento por producto, categoría o periodo temporal.
- Triaje de feedback de clientes: enrutar automáticamente los mensajes negativos hacia un equipo de atención prioritaria y dejar los neutros o positivos en colas de menor urgencia.
- Investigación sociolingüística y de opinión pública: etiquetar corpus de sindhi para estudios académicos sobre actitudes, polarización o evolución del discurso, siempre con revisión humana posterior.
- Moderación asistida de comunidades: detectar de forma preliminar contenido con carga negativa en foros o plataformas en sindhi, usando la salida como señal de priorización y no como decisión final.
- Enriquecimiento de datasets y anotación previa: usar el modelo como etiquetador débil para preanotar grandes volúmenes de texto en sindhi antes de una revisión manual, reduciendo el coste de anotación.
- Componente de analítica de producto: integrar la inferencia en un servicio FastAPI o en un endpoint compatible con Text Embeddings Inference para clasificar encuestas de satisfacción en tiempo casi real.
- Prototipado académico rápido: al ser un modelo de 278 M de parámetros con licencia MIT, sirve como línea base reproducible para comparar futuros ajustes finos sobre sindhi.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los que el propio repositorio guarda como salida de evaluación sobre el split de test retenido. No se publican comparaciones con otros modelos.

| Métrica | Valor |
|---|---|
| Accuracy | 0,7553 |
| Precisión macro | 0,7604 |
| Recall macro | 0,7554 |
| F1 macro | 0,7549 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni tampoco métricas desagregadas por clase, matrices de confusión o intervalos de confianza.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32, unos 0,6 GB en fp16/bf16 y unos 0,3 GB en int8 dinámico. Son cifras derivadas del recuento de parámetros, no medidas publicadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como RTX 3060, RTX 4060, RTX 4090, T4, L4, A10, A100 o H100 funcionan sin problema, pero están enormemente sobredimensionados para este modelo.
- Cabe holgadamente en GPU de consumo e incluso en CPU: la inferencia en CPU es perfectamente viable para cargas moderadas dadas las 278 M de parámetros y el límite de 128 tokens.
- Opciones de despliegue: pipeline de Hugging Face Transformers, `AutoModelForSequenceClassification`, servidores Text Embeddings Inference (el repositorio está etiquetado como `text-embeddings-inference` y `endpoints_compatible`), exportación a ONNX Runtime, envoltorios propios con FastAPI o TorchServe y contenedores Docker. No es un modelo generativo, por lo que vLLM, TGI o llama.cpp no son las vías naturales de despliegue.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo, y en un clasificador la métrica relevante serían secuencias por segundo, que depende por completo del hardware y del tamaño de lote.

## Comparativa con modelos similares

No se han identificado en la información disponible otros clasificadores de sentimiento en sindhi publicados con los que comparar directamente. La única referencia sólida es el modelo base del que deriva.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DanishMahdi/snd_sentiment_analysis | 278 M | 128 tokens (512 en la arquitectura base) | Clasificación de sentimiento en sindhi, 3 clases | MIT | Hugging Face, 0 descargas |
| FacebookAI/xlm-roberta-base | 278 M | 512 tokens | Masked language modeling multilingüe, sin cabeza de clasificación | MIT | Hugging Face, ampliamente utilizado |
| Otros ajustes finos de XLM-R para sentimiento | no disponible | no disponible | Clasificación de sentimiento | no disponible | no disponible |

La comparación con el modelo base no es de rendimiento, sino de adecuación: `xlm-roberta-base` no produce etiquetas de sentimiento y requeriría un ajuste fino adicional para esta tarea.

## Limitaciones y advertencias

- Generalización limitada entre dialectos y estilos de escritura del sindhi, tal como advierte la propia model card. El rendimiento puede degradarse fuera del dominio del dataset de entrenamiento.
- La clase neutral es más difícil de predecir que las clases positiva y negativa, según reconoce el autor, lo que se traduce en errores concentrados en textos sin carga afectiva clara.
- Ventana de 128 tokens: los documentos largos deben truncarse o dividirse, con la consiguiente pérdida de contexto y posible sesgo en el resultado agregado.
- Los valores de confianza no están calibrados explícitamente; no deben interpretarse como probabilidades fiables sin un análisis de calibración previo.
- El repositorio no incluye el script de entrenamiento ni la tarjeta del dataset, por lo que no es posible auditar la composición de los datos, el balance de clases ni los hiperparámetros. La reproducibilidad es, por tanto, muy baja.
- Riesgo de sesgo heredado del corpus de preentrenamiento multilingüe y del dataset de ajuste fino, cuyo origen, tamaño y procedencia de anotación se desconocen.
- Riesgo de alucinación en sentido estricto no aplica, porque el modelo no genera texto; el riesgo equivalente es la asignación de etiquetas erróneas con alta confianza.
- Licencia MIT, que permite uso comercial sin restricciones adicionales más allá de la atribución habitual. Conviene verificar que la licencia del dataset de ajuste fino no imponga condiciones adicionales, dato que no está disponible.
- No debe utilizarse como única base para decisiones de alto impacto sobre personas u organizaciones, tal como indica el propio autor.
- Con cero descargas y cero likes, no existe validación independiente ni evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DanishMahdi/snd_sentiment_analysis
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Dataset de ajuste fino: https://huggingface.co/datasets/alinawazmahar/Sindhi_Sentiment_dataset
- Paper de XLM-RoBERTa (referencia del modelo base): https://arxiv.org/abs/1911.02116
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference

Nota: la búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo; los resultados obtenidos eran páginas de ayuda de servicios de software sin relación con el contenido de la ficha.
