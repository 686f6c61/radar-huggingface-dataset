# aaimn/aai-punctcap-mn-v1

## Resumen

aai-punctcap-mn-v1 es un modelo de clasificación de tokens (token-classification) desarrollado por el usuario aaimn, especializado en la tarea de restauración de puntuación y capitalización para mongol escrito en cirílico. El modelo parte de un fine-tuning de distilbert-base-multilingual-cased, una versión destilada de BERT multilingüe con 134.741.770 parámetros totales, y se distribuye en formato safetensors bajo una licencia propia denominada aai-research-education-1.0.

El problema que resuelve es recurrente en pipelines de ASR (reconocimiento automático del habla) y en textos generados sin formato: los flujos de salida suelen carecer de mayúsculas y signos de puntuación, lo que dificulta la legibilidad y el procesamiento posterior. Este modelo aborda esa carencia específicamente para el mongol, un idioma con relativamente pocos recursos en el ecosistema de PLN.

Es relevante por su especialización idiomática y por su tamaño contenido, que permite despliegue en infraestructura modesta. No obstante, el acceso está restringido (gated) y el modelo no registra descargas ni interacciones en el momento de la consulta, lo que indica que se trata de un artefacto de investigación reciente y de alcance limitado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT multilingüe) |
| Parámetros totales | 134.741.770 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | mongol (mn), escritura cirílica |
| Licencia | aai-research-education-1.0 (licencia propia, acceso restringido) |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

La arquitectura subyacente es DistilBERT, un transformer encoder con aproximadamente la mitad de capas que BERT-base, obtenido mediante destilación de conocimiento desde distilbert-base-multilingual-cased. El modelo resultante conserva la tokenización y el vocabulario multilingüe del modelo base y se ha ajustado finamente para una tarea de etiquetado a nivel de token orientada a predecir puntuación y capitalización sobre texto en mongol cirílico.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas más allá del fine-tuning supervisado estándar para token classification. Tampoco se documentan detalles sobre la estrategia de destilación adicional ni sobre el preprocesamiento del corpus mongol.

## Capacidades

- Restauración de puntuación: inserción de signos como puntos, comas y otros separadores en texto sin puntuar.
- Restauración de capitalización: aplicación de mayúsculas iniciales y otras convenciones de escritura del mongol.
- Etiquetado a nivel de token: salida compatible con el pipeline `token-classification` de Hugging Face.
- Procesamiento de texto en mongol cirílico como idioma principal y único declarado.
- Integración en pipelines de posprocesamiento de ASR y de texto generado.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Posprocesamiento de transcripciones ASR en mongol: el modelo recibe la salida cruda del reconocedor de voz, sin mayúsculas ni puntuación, y devuelve el texto etiquetado con signos y capitalización, mejorando la legibilidad de subtítulos y actas.
- Normalización de textos generados por otros modelos: se puede encadenar tras un LLM que produzca mongol sin formato para restaurar convenciones tipográficas antes de publicar el contenido.
- Preparación de corpus para entrenamiento: al puntuar y capitalizar textos planos, facilita la construcción de datasets paralelos alineados con textos de referencia bien formateados.
- Subtitulado automático: integrado en un pipeline de vídeo, mejora la presentación de subtítulos en mongol generados por ASR en tiempo casi real.
- Digitalización de archivos y documentos: reconstrucción de puntuación en textos extraídos por OCR que hayan perdido el formato original.
- Investigación lingüística y educativa: la licencia aai-research-education-1.0 sugiere un uso previsto en contextos de investigación y docencia, por ejemplo para estudiar convenciones de puntuación en mongol.
- Moderación y análisis de contenido: la segmentación correcta en frases facilita tareas posteriores de análisis sintáctico o de filtrado por unidades textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,5 GB solo para pesos (134,7 M de parámetros), más overhead de activaciones y tokenizador; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se requiere hardware de datacenter; una GTX 1660, RTX 3060 o superior es más que suficiente. También es viable en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con al menos 2 GB de VRAM.
- Opciones de despliegue: Hugging Face `transformers` con pipeline `token-classification`; exportación a ONNX para inferencia optimizada; integración en servicios FastAPI o similares. No se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aai-punctcap-mn-v1 | 134,7 M | no disponible | Puntuación y capitalización en mongol | aai-research-education-1.0 (restringida) | Gated en Hugging Face |
| distilbert-base-multilingual-cased | ~135 M | 512 tokens (estándar de la familia) | Codificación multilingüe genérica | Apache 2.0 | Abierta |
| bert-base-multilingual-cased | ~178 M | 512 tokens (estándar de la familia) | Codificación multilingüe genérica | Apache 2.0 | Abierta |

La comparación directa con alternativas especializadas en puntuación para mongol no está disponible en la información proporcionada. Los modelos de la familia BERT multilingüe se incluyen como referencia de arquitectura y tamaño, no como equivalentes funcionales.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en entornos automatizados.
- Licencia propia aai-research-education-1.0: las condiciones exactas no están detalladas en la información disponible; debe revisarse antes de cualquier uso comercial.
- Cobertura idiomática limitada al mongol cirílico; no se declara soporte para otros idiomas ni para otras escrituras del mongol.
- Sin datos publicados de evaluación: no hay benchmarks que permitan estimar la precisión real en puntuación y capitalización.
- Riesgo de alucinación en el sentido de inserción de puntuación incorrecta o capitalización errónea en contextos ambiguos, propio de los modelos de token classification.
- Sesgos potenciales heredados del corpus de entrenamiento y del modelo base multilingüe; no documentados.
- Longitud de contexto no especificada; para textos largos será necesario segmentar en fragmentos.
- Ausencia de tracción comunitaria (0 descargas, 0 likes) en el momento de la consulta: no hay evidencia de validación por terceros.
- No apto para tareas generativas, de razonamiento ni de tool calling; su alcance es exclusivamente el etiquetado de tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aaimn/aai-punctcap-mn-v1
- Modelo base: https://huggingface.co/distilbert/distilbert-base-multilingual-cased
