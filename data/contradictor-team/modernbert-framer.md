# contradictor-team/modernbert-framer

## Resumen

ModernBERT Framer es un modelo de clasificación de texto desarrollado por el equipo `contradictor-team` mediante ajuste fino (fine-tuning) del modelo base `answerdotai/ModernBERT-base`. Su tarea es la clasificación de un único argumento en una de 15 categorías de "marcos interpretativos" (interpretative frames), siguiendo la taxonomía del Media Frame Corpus. Resuelve el problema del análisis automatizado de encuadres argumentativos en textos periodísticos y políticos en inglés, una tarea relevante para investigación en comunicación, análisis de discurso y monitorización de medios.

Arquitectónicamente es un transformer encoder de tipo ModernBERT con 149,6 millones de parámetros, diseñado para longitudes de contexto largas (hasta 8.192 tokens en el entrenamiento). El modelo se distribuye en formato safetensors con licencia MIT, lo que facilita su uso comercial y su integración en pipelines de análisis. Con 293 descargas en el momento de la consulta, es un modelo de nicho orientado a la investigación aplicada más que a uso generalista.

Su relevancia actual radica en que aplica una arquitectura de encoder moderna (ModernBERT) a una tarea de clasificación especializada, ofreciendo un punto de partida reutilizable para quienes necesiten etiquetar argumentos por marco interpretativo sin entrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder), `ModernBertForSequenceClassification` |
| Parametros totales | 149.616.399 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, pero no documentada por el autor) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base`, un transformer encoder con atención bidireccional y soporte para secuencias largas, al que se le añade una cabeza de clasificación de secuencia (`ModernBertForSequenceClassification`) con 15 clases de salida. El ajuste fino se realizó con la técnica "extended-lora-and-head": adaptadores LoRA con r=4 y α=8 aplicados sobre las proyecciones `Wqkv`, que posteriormente se fusionaron en los pesos base antes de guardar el modelo. El entrenamiento usó 3 épocas, tamaño de lote 2 con acumulación de gradiente 8 (lote efectivo 16), tasa de aprendizaje 2e-5, precisión bfloat16 en GPU y longitud máxima de secuencia de 8.192 tokens.

El conjunto de datos de entrenamiento es `jmLuis/MediaFrameCorpus-PhilippineFrameCorpus-Combined`, en inglés, con divisiones de 10.000 ejemplos de entrenamiento, 5.783 de validación y 5.783 de test. Las etiquetas (ids 0–14) se mapean posicionalmente a los `code_frames` 1–15 del Media Frame Corpus, y el mapeo se almacena en `model.config.id2label`. No se documenta el uso de RLHF ni DPO; se trata de un ajuste fino supervisado estándar para clasificación.

## Capacidades

- Clasificación de texto en 15 marcos interpretativos: Economic, Capacity and Resources, Morality, Fairness and Equality, Constitutionality and Legality, Policy Prescription and Evaluation, Crime and Justice, Security and Defense, Health and Safety, Quality of Life, Cultural Identity, Public Opinion, Political, External Regulation and Reputation, Other.
- Clasificación de etiqueta única (single-label) con distribución de probabilidades por clase vía softmax.
- Procesamiento de secuencias largas de hasta 8.192 tokens, adecuado para argumentos extensos o párrafos completos.
- Salida de logits y probabilidades por clase, lo que permite umbrales de confianza y análisis de ambigüedad.
- Capacidad multilingüe: no, solo inglés.
- Tool calling / function calling: no aplica (es un modelo de clasificación, no generativo).
- Agentes y razonamiento multi-paso: no aplica.
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- Análisis de discurso en medios: clasificar automáticamente argumentos extraídos de artículos periodísticos según su marco interpretativo, permitiendo estudios cuantitativos de encuadres a gran escala.
- Monitorización de debate político: procesar transcripciones o comunicados y etiquetar cada argumento por marco (económico, legal, moral, etc.) para detectar qué encuadres dominan en cada actor.
- Investigación en comunicación: construir corpus anotados de forma semiautomática, usando las probabilidades por clase para priorizar revisión humana en los casos de baja confianza.
- Moderación y análisis de contenido: identificar argumentos que apelan a marcos de seguridad, legalidad o moralidad en foros y redes, como señal para revisión editorial.
- Enriquecimiento de bases de datos documentales: añadir metadatos de marco interpretativo a repositorios de textos para búsqueda facetada y recuperación temática.
- Análisis comparativo de encuadres entre fuentes: clasificar el mismo tema cubierto por distintos medios y comparar la distribución de marcos, apoyándose en el contexto largo de 8.192 tokens para capturar argumentos completos.
- Docencia y anotación asistida: herramienta de apoyo para etiquetar manualmente corpus de análisis del discurso, reduciendo el esfuerzo de anotación inicial.

## Benchmarks y rendimiento

Resultados publicados por el autor en el split de test (5.783 ejemplos):

| Metrica | Valor |
|---|---|
| Accuracy | 0.6706 |
| Micro-F1 | 0.6706 |
| Macro-F1 | 0.5912 |
| Macro precision | 0.6202 |
| Macro recall | 0.5744 |

Resultados por clase (extracto representativo):

| Marco | Soporte | Precision | Recall | F1 |
|---|---|---|---|---|
| Economic | 368 | 0.7000 | 0.7038 | 0.7019 |
| Capacity and Resources | 115 | 0.4940 | 0.3565 | 0.4141 |
| Morality | 172 | 0.7368 | 0.5698 | 0.6426 |
| Fairness and Equality | 134 | 0.5758 | 0.2836 | 0.3800 |
| Constitutionality and Legality | 983 | 0.7509 | 0.8342 | 0.7904 |
| Policy Prescription and Evaluation | 446 | 0.5306 | 0.5448 | 0.5376 |
| Crime and Justice | 699 | 0.6971 | 0.7639 | 0.7290 |
| Security and Defense | 177 | 0.5909 | 0.4407 | 0.5049 |
| Health and Safety | 368 | 0.7158 | 0.7120 | 0.7139 |
| Quality of Life | 259 | 0.5294 | 0.4517 | 0.4875 |
| Cultural Identity | 288 | 0.5491 | 0.5243 | 0.5364 |
| Public Opinion | 286 | 0.6007 | 0.5629 | 0.5812 |
| Political | 1136 | 0.7367 | 0.7782 | 0.7568 |
| External Regulation and Reputation | 177 | 0.6802 | 0.6610 | 0.6705 |
| Other | 175 | 0.4144 | 0.4286 | 0.4213 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 149,6 M de parámetros, en fp32 ocupa aproximadamente 0,6 GB; en fp16/bfloat16 unos 0,3 GB; en cuantización de 8 bits, en torno a 0,15 GB. El consumo real depende del tamaño de lote y de la longitud de secuencia (hasta 8.192 tokens).
- GPU recomendadas: cualquier GPU con al menos 2–4 GB de VRAM para inferencia en fp16 con lotes pequeños; una NVIDIA T4, RTX 3060 o superior es suficiente. Para lotes grandes o secuencias largas, A100 o H100 ofrecen mayor throughput.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: transformers (referencia), Text Embeddings Inference (el modelo está etiquetado como compatible con `text-embeddings-inference` y `endpoints_compatible`), y en general cualquier runtime que cargue safetensors de transformers. No se documenta soporte específico de llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia estructural, el modelo base `answerdotai/ModernBERT-base` es el punto de comparación natural (misma arquitectura, sin cabeza de clasificación de marcos), pero no se han publicado métricas comparativas en esta ficha.

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| modernbert-framer | 149,6 M | 8.192 | Clasificación de 15 marcos | MIT |
| answerdotai/ModernBERT-base | no disponible en esta ficha | no disponible en esta ficha | Modelo base encoder | no disponible en esta ficha |

## Limitaciones y advertencias

- Solo soporta inglés; no está entrenado ni validado para otros idiomas.
- El rendimiento es desigual por clase: marcos con pocos ejemplos (Fairness and Equality, Capacity and Resources, Other) presentan F1 bajo (0,38–0,42), lo que genera falsos negativos y confusiones frecuentes.
- El macro-F1 (0,5912) es notablemente inferior al accuracy (0,6706), lo que indica que las clases minoritarias se predicen peor; en producción conviene revisar la distribución de clases esperada.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificación errónea con alta confianza; se recomienda usar umbrales de probabilidad y revisión humana en casos ambiguos.
- El modelo está ajustado sobre un corpus concreto (MediaFrameCorpus + PhilippineFrameCorpus); puede no generalizar bien a otros dominios, registros o variedades del inglés.
- Licencia MIT: permite uso comercial, pero se recomienda citar el modelo base y el corpus de entrenamiento según sus propias licencias.
- No se documentan sesgos específicos; al entrenarse sobre corpus periodísticos y políticos, es probable que herede sesgos de cobertura mediática y de anotación del corpus original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/contradictor-team/modernbert-framer
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset de entrenamiento: https://huggingface.co/datasets/jmLuis/MediaFrameCorpus-PhilippineFrameCorpus-Combined
- Métricas de evaluación: `evaluation_metrics.json` en el repositorio del modelo en Hugging Face
- Configuración de entrenamiento: `training_config.json` en el repositorio del modelo en Hugging Face
