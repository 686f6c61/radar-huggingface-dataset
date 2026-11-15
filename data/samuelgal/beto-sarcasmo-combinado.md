# SamuelGal/beto-sarcasmo-combinado

## Resumen

BETO afinado para detección de sarcasmo en español (`SamuelGal/beto-sarcasmo-combinado`) es un modelo de clasificación de texto binaria desarrollado por Samuel Galindo en el marco del Taller 1 de Procesamiento del Lenguaje Natural de la Universidad del Valle (2026-II). Se construye mediante *fine-tuning* del checkpoint `dccuchile/bert-base-spanish-wwm-cased`, un BERT base entrenado con *whole word masking* sobre corpus en castellano, y resuelve una tarea concreta: decidir si una frase en español es sarcástica (`SARCASMO`) o no (`NO_SARCASMO`).

El modelo tiene 109.852.418 parámetros (aproximadamente 110 M, coherente con un BERT-base) y se distribuye en formato safetensors con un tamaño de repositorio de 0,4 GB. Está entrenado sobre el dataset **sarcasmo_combinado**, compuesto por 12.145 frases de entrenamiento y 3.037 de validación, mayoritariamente titulares y frases cortas con una mediana de unas 13 palabras y clases balanceadas al 50/50.

Su relevancia es acotada pero clara: cubre un hueco práctico en PLN en español, donde los recursos para detección de ironía y sarcasmo son escasos, y lo hace con una licencia MIT permisiva y un coste de inferencia muy bajo. No es un modelo generativo ni un LLM: es un clasificador encoder-only pensado para integrarse como componente en pipelines de análisis de opinión, moderación o investigación lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT base, BETO con whole word masking) |
| Parametros totales | 109.852.418 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (max_length de entrenamiento); ventana nativa del BERT base: 512 tokens, no verificada en este fine-tuning |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser un modelo de ~110 M es viable cuantizar a int8/fp16 con herramientas estándar) |
| Idiomas soportados | es (español) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-only de tipo BERT base, heredada de `dccuchile/bert-base-spanish-wwm-cased`: 12 capas, atención bidireccional completa, vocabulario en minúsculas y mayúsculas (cased) y *whole word masking* durante el preentrenamiento original. Sobre esa base se añade una cabeza de clasificación de secuencia con dos etiquetas (`NO_SARCASMO` / `SARCASMO`). El fine-tuning se realizó con la librería transformers, `max_length` de 128 tokens, fp16, learning rate 2e-05, weight decay 0,01, warmup del 10 % y scheduler lineal, con un máximo de 10 épocas y *early stopping* con paciencia 2 sobre F1 macro de validación. No se empleó QLoRA ni cuantización 4-bit durante el entrenamiento.

Se probaron tres tamaños de batch efectivo (8, 16 y 32, con acumulación de gradiente cuando no cabía en memoria). El modelo publicado corresponde a batch size 32, que obtuvo el mejor F1 macro de validación (0,9150) y convergió en 5 épocas, con la mejor época en la tercera. El dataset **sarcasmo_combinado** mezcla titulares satíricos y noticias reales, con clases balanceadas y frases cortas (casi ninguna supera las 40 palabras). No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación adicionales, algo esperable en un clasificador de este tipo.

## Capacidades

- Clasificación binaria de sarcasmo en español: devuelve `SARCASMO` o `NO_SARCASMO` con su puntuación de confianza.
- Procesamiento de frases cortas y titulares: el entrenamiento se centró en textos de mediana de 13 palabras.
- Integración directa con `transformers.pipeline("text-classification")` y con Text Embeddings Inference (etiqueta `text-embeddings-inference` y `endpoints_compatible` en el repo).
- Funcionamiento sobre texto en castellano con distinción de mayúsculas y minúsculas (tokenizador cased).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*: es un clasificador, no un modelo generativo.
- Capacidad multilingüe: limitada al español; no se reporta rendimiento en otras lenguas.

## Casos de uso

- **Análisis de opinión en redes sociales**: clasificar tuits y comentarios como sarcásticos antes de agregarlos en métricas de sentimiento, evitando que la ironía invierta la polaridad detectada por un modelo de sentimiento convencional.
- **Moderación de comunidades**: marcar mensajes potencialmente irónicos o burlescos para revisión humana en foros y plataformas, usando la puntuación de confianza como umbral configurable.
- **Investigación lingüística y PLN en español**: servir como línea base reproducible para experimentos sobre ironía, con métricas de validación publicadas (F1 macro 0,9150) y dataset descrito, lo que facilita comparaciones.
- **Enriquecimiento de datasets periodísticos**: etiquetar titulares satíricos frente a noticias reales en corpus de medios, aprovechando que el modelo fue entrenado precisamente con esa mezcla; útil para filtrar contenido de sátira en agregadores.
- **Preprocesado en pipelines de atención al cliente**: detectar respuestas sarcásticas de usuarios en encuestas o chats y derivarlas a revisión, dado el bajo coste de inferencia (modelo de 110 M, ejecutable en CPU).
- **Evaluación de sistemas conversacionales**: medir si las respuestas generadas por un chatbot contienen sarcasmo no deseado, clasificando cada turno con este modelo como componente de un arnés de evaluación.
- **Prototipado rápido en entornos con pocos recursos**: al pesar 0,4 GB y caber en CPU o en cualquier GPU consumer, permite desplegar un detector de sarcasmo en servicios pequeños o en el edge sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados en validación publicados por el autor (3.037 frases):

| batch_size | Épocas | Mejor época | F1 macro | F1 weighted | Accuracy | Precision | Recall | eval_loss | Minutos | Memoria (GB) |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 8 | 6 | 0,9137 | 0,9137 | 0,9137 | 0,9140 | 0,9137 | 0,7224 | 16,7 | 1,99 |
| 16 | 7 | 5 | 0,9134 | 0,9134 | 0,9134 | 0,9143 | 0,9134 | 0,6283 | 7,3 | 2,41 |
| 32 (publicado) | 5 | 3 | 0,9150 | 0,9150 | 0,9150 | 0,9153 | 0,9150 | 0,3086 | 3,5 | 3,23 |

F1 macro por longitud de frase (modelo publicado):

| Longitud | N | F1 macro |
|---|---|---|
| ≤10 palabras | 1.055 | 0,8798 |
| 11–25 palabras | 1.932 | 0,9285 |
| >25 palabras | 50 | 0,8831 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, algo esperable al tratarse de un clasificador y no de un modelo generativo.

## Requisitos de hardware

- **VRAM estimada**: en fp32, unos 0,44 GB de pesos; en fp16, unos 0,22 GB. Con activaciones y batch pequeño, el entrenamiento reportado consumió entre 1,99 y 3,23 GB según batch size.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM para inferencia; para entrenamiento o fine-tuning, 4 GB o más (los datos del autor muestran 3,23 GB con batch 32).
- **GPU consumer**: cabe holgadamente en cualquier RTX (3060, 4060, 4090), GTX 1650 o incluso en CPU para inferencia por lotes pequeños.
- **Opciones de despliegue**: `transformers` (pipeline de text-classification), Text Embeddings Inference (el repo incluye la etiqueta correspondiente), y servidores de inferencia compatibles con endpoints. No se documentan variantes GGUF ni soporte explícito de llama.cpp u Ollama en la información disponible.
- **Latencia y throughput**: no disponible de forma explícita; el autor reporta tiempos de entrenamiento (3,5 minutos con batch 32 en 5 épocas), lo que da una idea de la ligereza del modelo, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SamuelGal/beto-sarcasmo-combinado | 109,85 M | 128 tokens (entrenamiento) | Clasificación de sarcasmo en español | MIT | Hugging Face |
| dccuchile/bert-base-spanish-wwm-cased (base) | ~110 M | 512 tokens | Modelo base de lenguaje, sin cabeza de clasificación | no disponible en la información | Hugging Face |
| BETO afinado para análisis de sentimiento (variantes de la comunidad) | ~110 M | 128–512 tokens | Clasificación de sentimiento en español | variable según autor | Hugging Face |

No se dispone en la información proporcionada de resultados comparativos frente a otros detectores de sarcasmo en español, por lo que la comparación se limita a arquitectura, tamaño y licencia. El modelo base BETO es el referente natural, y este fine-tuning añade una cabeza específica de sarcasmo con métricas de validación publicadas.

## Limitaciones y advertencias

- **Sesgo de fuente y tema**: el dataset mezcla titulares satíricos y noticias reales, por lo que el modelo puede aprender pistas de fuente, tema o época (nombres de políticos, ciudades, años) en lugar de la intención irónica. El propio autor lo advierte.
- **Textos largos**: casi no hay frases de más de 40 palabras en el entrenamiento; el rendimiento en textos largos es menos fiable (F1 macro 0,8831 en el tramo >25 palabras, con solo 50 ejemplos).
- **Ambigüedad intrínseca**: el sarcasmo depende del contexto y del tono; una frase aislada puede ser ambigua incluso para personas, lo que limita la precisión en producción sin contexto adicional.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y negativos por sobreajuste a patrones superficiales.
- **Idioma**: solo español; no se reporta rendimiento en otras lenguas ni en variedades dialectales distintas de las representadas en el corpus.
- **Licencia**: MIT, permisiva para uso comercial, pero conviene revisar las condiciones del modelo base BETO y del dataset de origen antes de un despliegue comercial.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; es un trabajo académico sin validación externa ni mantenimiento documentado.
- **Contexto de 128 tokens**: frases más largas se truncan, lo que puede eliminar la parte irónica de un texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamuelGal/beto-sarcasmo-combinado
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Documentación de transformers (pipeline de text-classification): https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextClassificationPipeline
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
