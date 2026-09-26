# sagarstpatil/sentiment-model

## Resumen

`sagarstpatil/sentiment-model` es un modelo de clasificación de texto publicado por el usuario sagarstpatil en Hugging Face, resultado de un ajuste fino (*fine-tuning*) del modelo base `distilbert-base-uncased`. Se trata de un clasificador de sentimiento entrenado con la librería Transformers y la API `Trainer`, con 66.955.779 parámetros y un repositorio de 0,3 GB que contiene pesos en formato safetensors. La model card indica 3 épocas de entrenamiento, una tasa de aprendizaje de 2e-05 y un tamaño de lote de 32, pero no especifica el conjunto de datos utilizado, el número de clases ni el idioma de los textos de entrenamiento.

El interés de este modelo es limitado pero claro: sirve como ejemplo reproducible de un pipeline de ajuste fino sobre DistilBERT y como punto de partida barato (CPU o cualquier GPU consumer) para tareas de análisis de sentimiento en inglés. Sin embargo, su rendimiento declarado es modesto: en la evaluación final alcanza una *accuracy* de 0,6598, un F1 ponderado de 0,6493 y un F1 macro de 0,6493, con una pérdida de validación de 0,7470.

La relevancia práctica de esta ficha es sobre todo de advertencia: se trata de un modelo con cero descargas, un único *like*, una model card generada automáticamente y sin resultados en el `model-index`. Antes de considerarlo para cualquier uso real conviene reentrenarlo o compararlo con alternativas consolidadas de análisis de sentimiento, ya que su precisión está muy lejos de lo exigible en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT, destilado (DistilBERT); 6 capas, 768 de dimensión oculta y 12 cabezas de atención según el modelo base |
| Parámetros totales | 66.955.779 (66,96 M) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (límite del modelo base; no se especifica en la model card) |
| Tipos de cuantización | No se publican pesos cuantizados. Los safetensors en fp32 son compatibles con cuantización dinámica int8 estándar de PyTorch y con exportación a ONNX; no hay variantes GGUF ni GPTQ oficiales |
| Idiomas soportados | No disponible en la model card; el modelo base es *uncased* en inglés, por lo que no se espera rendimiento fuera del inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification |
| Modelo base | distilbert/distilbert-base-uncased |
| Tamaño del repositorio | 0,3 GB |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de publicación | 26 de septiembre de 2026 (creado y actualizado el mismo día) |
| Frameworks declarados | Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5, Tokenizers 0.23.1 |
| Etiquetas | transformers, safetensors, distilbert, text-classification, generated_from_trainer, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura subyacente es DistilBERT, una versión destilada de BERT-base que conserva aproximadamente la mitad de sus capas (6 frentes a 12) y alrededor del 60 % de sus parámetros, lo que reduce el coste de inferencia manteniendo una parte sustancial de las capacidades del modelo original. Al ser un modelo de la familia BERT, es un *encoder* bidireccional que produce representaciones contextuales y se remata con una cabeza de clasificación sobre el token `[CLS]`; no es un modelo generativo y no dispone de modo *thinking* ni de decodificación autorregresiva.

Los datos de entrenamiento no están documentados: la model card se generó automáticamente con la plantilla de `Trainer` y repite "More information needed" en las secciones de descripción, usos previstos, limitaciones y datos de evaluación. Lo único verificable es el procedimiento: 3 épocas, *learning rate* de 2e-05 con *scheduler* lineal, tamaño de lote de 32 en entrenamiento y evaluación, semilla 42 y optimizador AdamW con implementación fusionada (`ADAMW_TORCH_FUSED`). Con 3 épocas y 174 pasos totales, el conjunto de entrenamiento parece pequeño. No se declara ningún uso de RLHF, DPO ni ajuste por preferencias, algo esperable en un clasificador de este tipo. Tampoco se menciona ninguna innovación técnica adicional (atención lineal, decodificación especulativa, *Mixture of Experts*) más allá de la propia destilación del modelo base.

## Capacidades

- Clasificación de texto: el modelo devuelve una etiqueta y una puntuación de confianza mediante el pipeline `text-classification`.
- Análisis de sentimiento: es la tarea para la que fue ajustado, aunque no se documenta cuántas clases maneja (binaria, tres clases u otra configuración).
- Procesamiento por lotes: al ser un *encoder* de 6 capas y 66 M de parámetros, admite inferencia en lotes sobre CPU sin requisitos de GPU.
- Compatibilidad con *endpoints*: incluye la etiqueta `endpoints_compatible`, por lo que puede desplegarse en Hugging Face Inference Endpoints.
- Encoding de frases: al derivar de DistilBERT, las representaciones internas pueden reutilizarse como *embeddings* contextuales, aunque no se ha validado para *retrieval* ni similitud semántica.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües documentadas.
- No dispone de visión, audio, modo de razonamiento explícito ni generación de texto libre.

## Casos de uso

- Clasificación por lotes de encuestas y NPS: el modelo puede puntuar miles de respuestas abiertas en una sola pasada sobre CPU, lo que permite etiquetar verbatims de encuestas sin coste de GPU. Es adecuado por su tamaño reducido, aunque la precisión de 0,6598 obliga a revisar manualmente una parte de los resultados.
- Triaje de tickets de soporte: se puede usar como primera capa para marcar tickets con tono negativo y priorizarlos en la cola de atención. Funciona como filtro orientativo, no como sistema de enrutado automático, dado el nivel de F1 macro declarado.
- Monitorización de reseñas en comercio electrónico: extracción de la polaridad de reseñas de producto para alimentar cuadros de mando agregados de satisfacción. El límite de 512 tokens obliga a truncar o trocear reseñas largas.
- Escucha activa de marca en redes sociales: clasificación de menciones en inglés para detectar picos de sentimiento negativo. Solo es razonable si el contenido analizado está en inglés, ya que no hay soporte multilingüe declarado.
- Filtrado previo en pipelines de moderación: uso como señal auxiliar de bajo coste antes de pasar los casos dudosos a un modelo mayor o a revisión humana, reduciendo el volumen que llega a las etapas caras.
- Señal auxiliar en sistemas de recomendación: incorporar la polaridad de comentarios y reseñas como característica adicional para penalizar ítems con retroalimentación negativa.
- Inferencia local con requisitos de privacidad: al ocupar unos 268 MB en fp32 y funcionar en CPU, se puede ejecutar en la propia infraestructura del cliente o en un portátil, sin enviar textos a servicios externos.
- Extracción de series temporales de sentimiento: ejecuciones periódicas sobre un corpus fijo para construir series temporales de evolución del sentimiento por producto, campaña o periodo.

## Benchmarks y rendimiento

El array `results` del `model-index` está vacío, por lo que el autor no declara ningún benchmark estándar (MMLU, GLUE, SST-2 u otros). Los únicos datos disponibles son las métricas de validación de la propia model card.

| Métrica | Época 1 | Época 2 | Época 3 | Resultado final declarado |
|---|---|---|---|---|
| Pérdida de entrenamiento | 1,0498 | 0,8304 | 0,6785 | No disponible |
| Pérdida de validación | 0,8737 | 0,7226 | 0,7117 | 0,7470 |
| Accuracy | 0,6080 | 0,6975 | 0,6821 | 0,6598 |
| F1 ponderado | 0,5529 | 0,6881 | 0,6736 | 0,6493 |
| F1 macro | 0,5529 | 0,6881 | 0,6736 | 0,6493 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Además, existe una inconsistencia entre las métricas finales del encabezado de la model card (accuracy 0,6598 y pérdida 0,7470) y las de la tercera época de la tabla (accuracy 0,6821 y pérdida 0,7117), que conviene resolver antes de citar cualquier cifra.

## Requisitos de hardware

- VRAM estimada: unos 268 MB en fp32 (coincide con el tamaño de repositorio de 0,3 GB), aproximadamente 134 MB en fp16/bf16 y unos 67 MB en int8.
- GPU recomendadas: no requiere GPU. Cualquier GPU con 1 GB o más de VRAM es suficiente, incluidas GTX 1050, GTX 1650, RTX 3060, T4, L4, A10G o superiores.
- GPU consumer: cabe sobradamente en cualquier GPU de consumo actual e incluso en iGPU y en CPU. El cuello de botella en producción será el *tokenizador* y la gestión de lotes, no la memoria.
- Opciones de despliegue: pipeline de Transformers, Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), exportación a ONNX Runtime, TorchScript y servicio propio con FastAPI o similar. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que están orientados a modelos generativos y este es un *encoder* de clasificación.
- Latencia y throughput: no se publican mediciones. Por el tamaño (6 capas, 66 M de parámetros) es esperable un throughput alto en CPU por lotes, pero no hay cifras verificables en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento en sentimiento | Disponibilidad |
|---|---|---|---|---|---|
| sagarstpatil/sentiment-model | 66,96 M | 512 tokens | Apache-2.0 | Accuracy 0,6598; F1 macro 0,6493 (validación propia) | Hugging Face, 0 descargas |
| distilbert-base-uncased | 66,96 M | 512 tokens | Apache-2.0 | No ajustado para clasificación de sentimiento | Hugging Face, ampliamente utilizado |
| bert-base-uncased | 110 M | 512 tokens | Apache-2.0 | No ajustado para clasificación de sentimiento | Hugging Face, ampliamente utilizado |
| roberta-base | 125 M | 514 tokens | MIT | No ajustado para clasificación de sentimiento | Hugging Face, ampliamente utilizado |

Las cifras de parámetros, contexto y licencia de los tres modelos de referencia son especificaciones públicas de sus respectivos repositorios. La comparación de rendimiento en la tarea de sentimiento no es posible con los datos proporcionados: no hay métricas comparables publicadas para alternativas en la información disponible, y el `model-index` de este modelo no incluye resultados frente a terceros.

## Limitaciones y advertencias

- Rendimiento bajo: una *accuracy* de 0,6598 y un F1 macro de 0,6493 son insuficientes para automatizar decisiones. En un problema binario, la *accuracy* apenas supera el azar de forma limitada; en uno de tres clases, el margen es algo mayor pero sigue siendo pobre.
- Datos de entrenamiento desconocidos: se ignora el dominio, el tamaño, el idioma, el número de clases y la distribución de etiquetas. Esto impide anticipar el comportamiento fuera del conjunto de validación.
- Model card incompleta: las secciones de descripción, usos previstos, limitaciones y datos de entrenamiento contienen literalmente "More information needed".
- Inconsistencia en las métricas: los valores finales declarados no coinciden con los de la tabla por épocas, lo que resta fiabilidad a la evaluación publicada.
- Indicios de sobreajuste: la mejor validación se produce en la época 2 (accuracy 0,6975, F1 0,6881) y empeora en la época 3, mientras la pérdida de entrenamiento sigue bajando.
- Limitación de idioma: no se declaran idiomas soportados y el tokenizador del modelo base es *uncased* en inglés. No hay ninguna evidencia de funcionamiento correcto en castellano.
- Límite de contexto: 512 tokens. Los documentos más largos deben truncarse o dividirse en fragmentos, lo que puede degradar la clasificación en textos extensos.
- Sin capacidades de agente ni de generación: no soporta *tool calling*, razonamiento multi-paso ni salida de texto libre.
- Riesgo de sesgo: al desconocer el dataset, no se puede auditar el sesgo por dominio, registro, género, etnia o tema. Son esperables errores en ironía, sarcasmo, negaciones y lenguaje informal.
- Licencia: Apache-2.0 permite uso comercial del modelo, pero la procedencia y la licencia del conjunto de datos de entrenamiento son desconocidas, lo que introduce un riesgo legal no cuantificado si se reutiliza en producción.
- Adopción nula: cero descargas, un solo *like* y ninguna revisión independiente. No debe tratarse como un modelo validado por la comunidad.
- No usar como criterio único en decisiones sensibles (crédito, contratación, moderación con consecuencias legales) sin supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sagarstpatil/sentiment-model
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper original de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108

No se han encontrado otros enlaces (papers, blogs, repositorios o demos) asociados a este modelo concreto en la información disponible.
