# evelnap/indobertweet-metadata-s1

## Resumen

`evelnap/indobertweet-metadata-s1` es un modelo de clasificación de texto en indonesio obtenido mediante fine-tuning del checkpoint `indolem/indobertweet-base-uncased`. Lo desarrolla el usuario de Hugging Face `evelnap` y su tarea concreta es la clasificación binaria de toxicidad con dos etiquetas: `non_toxic` y `toxic`. Se publicó en noviembre de 2026 y, a fecha de la información disponible, acumula 16 descargas y ningún "like", lo que indica un modelo de nicho, probablemente ligado a un experimento o trabajo académico personal.

Arquitectura y tamaño lo hereda íntegramente del modelo base: es un transformer BERT-base con 110.559.746 parámetros totales (aproximadamente 110,6 M), pesos en formato safetensors y un repositorio de 0,9 GB. El modelo base, IndoBERTweet, es una adaptación de BERT entrenada específicamente sobre corpus de Twitter en indonesio, de ahí su utilidad para texto informal, abreviaturas, emojis y menciones.

Su relevancia es limitada pero clara: cubre una necesidad concreta (moderación de contenido tóxico en indonesio) sobre una base lingüística ya adaptada al dominio de redes sociales. No obstante, la documentación publicada es mínima (no hay métricas, ni detalles del dataset, ni licencia declarada), por lo que cualquier evaluación rigurosa debe hacerse por cuenta del usuario antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), base `indolem/indobertweet-base-uncased` |
| Parametros totales | 110.559.746 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base BERT usa 512 tokens como maximo habitual) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; admite cuantizacion estandar via herramientas de transformers, pero no se documenta) |
| Idiomas soportados | Indonesio (`id`) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia BERT, concretamente una inicialización desde `indolem/indobertweet-base-uncased`, que a su vez es un BERT-base adaptado al indonesio de Twitter. Sobre esa base se ha añadido una cabeza de clasificación de secuencias (`AutoModelForSequenceClassification`) con dos salidas, `non_toxic` y `toxic`, y se ha realizado un fine-tuning supervisado de clasificación monoetiqueta (`single_label_classification`).

La model card indica que los hiperparámetros se buscaron con Optuna, lo que sugiere un proceso de ajuste automático (probablemente learning rate, batch size, épocas y warmup). No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo aumento de datos ni si se aplicaron técnicas de desbalanceo de clases. Tampoco se documenta ningún proceso de RLHF, DPO ni innovación arquitectónica adicional: es un fine-tuning convencional sobre un encoder preexistente. La única indicación técnica relevante es que el autor recomienda aplicar al texto de entrada el mismo preprocesado usado en entrenamiento (minúsculas, normalización de emojis, menciones y URLs) para mantener la coherencia de las predicciones.

## Capacidades

- Clasificación binaria de toxicidad en texto en indonesio: devuelve una de dos etiquetas, `non_toxic` o `toxic`.
- Procesamiento de texto informal propio de redes sociales, gracias a la base IndoBERTweet (emojis, menciones, URLs, abreviaturas), siempre que se aplique el preprocesado adecuado.
- Integración directa con la librería `transformers` mediante `AutoTokenizer` y `AutoModelForSequenceClassification`.
- Compatibilidad declarada con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints (`endpoints_compatible`).
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio: es exclusivamente un clasificador.
- Capacidad multilingüe: limitada al indonesio; no se declaran otros idiomas.

## Casos de uso

- Moderación de comentarios en plataformas indonesias: el modelo puede puntuar cada comentario como tóxico o no tóxico y alimentar una cola de revisión humana o un filtro automático previo a la publicación.
- Filtrado de respuestas en foros y comunidades: integrado en el backend, permite descartar o marcar mensajes tóxicos antes de que se muestren a otros usuarios.
- Análisis de sentimiento social y monitorización de marca: clasificar grandes volúmenes de tuits o comentarios para medir la proporción de contenido tóxico dirigido a una marca o figura pública.
- Construcción de datasets etiquetados: usar el modelo como etiquetador débil para preanotar corpus en indonesio y acelerar la creación de conjuntos de entrenamiento para modelos mayores.
- Investigación en NLP indonesio: servir como línea base en experimentos de detección de toxicidad o como punto de comparación frente a modelos multilingües.
- Preprocesado en pipelines de análisis de datos: aplicar el clasificador como paso previo en un ETL que descarte contenido tóxico antes de agregar métricas o entrenar otros modelos.
- Enrutado en sistemas de atención al cliente: derivar automáticamente los mensajes clasificados como tóxicos a un equipo especializado en lugar de al agente estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 0,45 GB solo para pesos (110,6 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- VRAM estimada en FP16/BF16: aproximadamente 0,22 GB para pesos, con un consumo total por debajo de 0,5 GB.
- Cabe holgadamente en cualquier GPU consumer: GTX 1650, RTX 3060, RTX 4090, e incluso en CPU para lotes pequeños.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir muchos lotes concurrentes; para uso individual, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- Opciones de despliegue: `transformers` (PyTorch), Text Embeddings Inference (declarado compatible), ONNX Runtime, y servidores de inferencia estándar compatibles con modelos de clasificación. No se documenta soporte explícito de vLLM ni llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por lote en GPU moderna, pero es una estimación, no un dato publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `evelnap/indobertweet-metadata-s1` | 110,6 M | No disponible | Clasificación de toxicidad (indonesio) | No disponible | Hugging Face |
| `indolem/indobertweet-base-uncased` | ~110 M (BERT-base) | 512 tokens (habitual en BERT) | Modelo base de lenguaje (indonesio) | No disponible en la informacion | Hugging Face |
| `indobert-base-uncased` (IndoBERT) | ~110 M | 512 tokens (habitual en BERT) | Modelo base de lenguaje (indonesio) | No disponible en la informacion | Hugging Face |

La comparación se limita al modelo base y a IndoBERT por ser los referentes directos en indonesio; no se dispone de datos de rendimiento del modelo evaluado ni de alternativas específicas de clasificación de toxicidad en indonesio en la información proporcionada.

## Limitaciones y advertencias

- No se declara licencia: no está claro si se permite uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- No se publican métricas (accuracy, F1, precisión/recall por clase): no hay evidencia cuantitativa de su calidad.
- No se documenta el dataset de entrenamiento, por lo que se desconocen sesgos de dominio, de anotación y de desbalanceo de clases.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación, con impacto directo en moderación (censura indebida o contenido tóxico no filtrado).
- Dependencia crítica del preprocesado: si el texto de entrada no se normaliza igual que en entrenamiento, las predicciones pueden degradarse.
- Cobertura lingüística limitada al indonesio; no se garantiza funcionamiento en malayo, javanés ni en indonesio informal con code-switching.
- Modelo de nicho con muy pocas descargas (16) y sin validación comunitaria: tratarlo como experimental.
- Longitud de contexto no documentada; textos largos pueden truncarse según la configuración del tokenizador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/evelnap/indobertweet-metadata-s1
- Modelo base: https://huggingface.co/indolem/indobertweet-base-uncased
