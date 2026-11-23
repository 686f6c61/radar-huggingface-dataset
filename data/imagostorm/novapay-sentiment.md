# imagostorm/novapay-sentiment

## Resumen

novapay-sentiment es un modelo de clasificación de texto obtenido mediante fine-tuning de distilbert-base-uncased, publicado por el usuario imagostorm en Hugging Face. Su propósito declarado, deducible del nombre y de la pipeline (`text-classification`), es el análisis de sentimiento en el dominio de pagos digitales (NovaPay), aunque la model card no documenta explícitamente el dataset de entrenamiento ni las etiquetas utilizadas.

Se trata de un modelo encoder-only de tipo DistilBERT, con 66.955.010 parámetros totales y un repositorio de 0,3 GB en formato safetensors. Al derivar de DistilBERT, su longitud de contexto operativa es de 512 tokens, muy inferior a la de los LLM generativos actuales, lo que lo posiciona como una pieza de infraestructura para tareas de clasificación rápida y de bajo coste, no como un modelo conversacional.

Su relevancia es limitada y muy específica: se publica sin métricas reproducibles más allá de las cifras de validación declaradas por el propio autor (accuracy 0,881 y F1 0,8816), sin información sobre el dataset, sin idiomas declarados y con cero descargas en el momento de la consulta. Es un artefacto de fine-tuning privado expuesto públicamente, útil únicamente como referencia o como punto de partida si se dispone del mismo corpus de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, destilación de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de DistilBERT; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; cuantización posible vía herramientas externas) |
| Idiomas soportados | no disponible (el modelo base es uncased en inglés; el fine-tuning no declara idioma) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert/distilbert-base-uncased`, un transformer encoder-only de 6 capas y 66 millones de parámetros obtenido por destilación de BERT-base. DistilBERT reduce el tamaño de BERT-base en aproximadamente un 40 % conservando alrededor del 97 % de su rendimiento en GLUE según sus autores originales; no se dispone de datos adicionales sobre modificaciones arquitectónicas en este fine-tuning concreto.

El entrenamiento se realizó con el `Trainer` de Transformers 5.22.1 sobre PyTorch 2.14.1+cu130, con los siguientes hiperparámetros: learning rate 2e-05, batch size de 16 en entrenamiento y evaluación, semilla 42, optimizador AdamW (variante `torch_fused`, betas 0,9/0,999, epsilon 1e-08), scheduler lineal y 2 épocas. El conjunto de entrenamiento no está documentado ("unknown dataset" según la propia model card), lo que impide evaluar la composición, el volumen de tokens o el balance de clases. No se menciona RLHF, DPO ni ninguna técnica de alineación, algo esperable en un clasificador encoder-only. Tampoco se documenta ninguna innovación técnica adicional.

## Capacidades

- Clasificación de texto (pipeline `text-classification`): salida de etiquetas con puntuaciones de probabilidad, presumiblemente orientadas a sentimiento (positivo/negativo/neutro u otro esquema no documentado).
- Análisis de sentimiento de dominio específico: el nombre sugiere entrenamiento sobre textos relacionados con pagos digitales, aunque no se confirma el corpus.
- Procesamiento de secuencias de hasta 512 tokens, suficiente para reseñas, tickets de soporte o mensajes cortos.
- Inferencia rápida y de bajo coste: al ser un encoder de 66 M de parámetros, es apto para CPU y para despliegues de alto throughput.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking: es un clasificador, no un modelo generativo.
- Capacidades multilingües: no declaradas; el modelo base es uncased en inglés, por lo que el rendimiento en castellano es dudoso sin evidencia.

## Casos de uso

- Clasificación de tickets de soporte en fintech: el modelo puede etiquetar automáticamente la polaridad de reclamaciones y consultas de clientes de una plataforma de pagos, siempre que el texto esté en el idioma y dominio de entrenamiento; su ventana de 512 tokens cubre la mayoría de tickets.
- Enrutamiento de feedback de usuarios: integrado en un pipeline de ingestión, permite separar comentarios positivos de negativos para priorizar la revisión manual por parte de equipos de producto.
- Análisis de reseñas de apps de pago: clasificación por lotes de reseñas de App Store o Google Play para alimentar dashboards de satisfacción, con throughput alto gracias al reducido tamaño del modelo.
- Moderación ligera de contenido textual: detección de mensajes con carga negativa en foros o chats de atención al cliente, como primera capa antes de un revisor humano.
- Enriquecimiento de datasets etiquetados: uso como etiquetador débil (weak labeler) para preanotar grandes volúmenes de texto y reducir el coste de anotación manual en proyectos de NLP financiero.
- Prototipado rápido en CPU: al caber en cualquier máquina y no requerir GPU, sirve para validar pipelines de clasificación antes de invertir en modelos mayores o en anotación propia.
- Despliegue en el edge o en entornos con restricciones de memoria: 0,3 GB de repositorio permiten ejecutarlo en contenedores pequeños o incluso en dispositivos con recursos limitados.

## Benchmarks y rendimiento

La model card declara los siguientes resultados sobre el conjunto de evaluación (datos del autor, sin especificar el dataset):

| Metrica | Valor |
|---|---|
| Loss (validación) | 0,3035 |
| Accuracy | 0,881 |
| F1 | 0,8816 |

Evolución durante el entrenamiento:

| Epoca | Step | Validation loss | Accuracy | F1 |
|---|---|---|---|---|
| 1 | 313 | 0,4708 | 0,82 | 0,8418 |
| 2 | 626 | 0,3035 | 0,881 | 0,8816 |

El `model-index` del repositorio no contiene resultados adicionales (lista `results` vacía). No se han publicado comparaciones con otros modelos ni métricas por clase, matriz de confusión o evaluación en un conjunto de test independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (66 M de parámetros ≈ 268 MB de pesos, más activaciones y overhead del runtime); en fp16 aproximadamente 134 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona igualmente bien en CPU. Para alto throughput, una T4, L4 o incluso una RTX 3060 son más que suficientes.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o una iGPU con suficiente memoria compartida; también en Raspberry Pi para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (TEI), Hugging Face Inference Endpoints, ONNX Runtime, o exportación a TorchScript. No se documenta soporte GGUF ni llama.cpp (no aplica a un encoder de clasificación).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput de miles de secuencias por segundo en GPU moderna y de cientos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| novapay-sentiment | 66,9 M | 512 tokens | apache-2.0 | Fine-tuning de DistilBERT, sin dataset documentado |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 tokens | apache-2.0 | Clasificador de sentimiento de referencia en Hugging Face, entrenado sobre SST-2 (inglés) |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 tokens | MIT | RoBERTa fine-tuned para sentimiento en redes sociales, con mayor cobertura de dominio |
| ProsusAI/finbert | ~110 M | 512 tokens | Apache 2.0 (según repositorio) | BERT fine-tuned en textos financieros, comparable en dominio pero no en tarea exacta |

La comparación es aproximada: no se dispone de métricas homogéneas entre estos modelos ni de evaluación de novapay-sentiment sobre un benchmark público, por lo que no es posible establecer una clasificación de rendimiento relativa.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica explícitamente "unknown dataset", lo que impide conocer la distribución de clases, el idioma y el dominio real. Las métricas declaradas no son reproducibles.
- Idiomas no declarados: el modelo base es uncased en inglés; no hay evidencia de que funcione en castellano u otros idiomas.
- Riesgo de sobreajuste al dominio NovaPay: al ser un fine-tuning específico, puede degradarse gravemente fuera de ese vocabulario y estilo.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas con alta confianza en entradas fuera de distribución.
- Sesgos: no documentados; al heredar de DistilBERT-base, puede arrastrar sesgos de género, raza o edad presentes en el corpus original de BERT, agravados por un fine-tuning no auditado.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia del dataset de fine-tuning antes de usarlo en producción regulada (por ejemplo, en el sector financiero bajo normativa de protección de datos).
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Model card autogenerada por el `Trainer`: secciones de "Intended uses", "Limitations" y "Training data" sin contenido, lo que reduce la trazabilidad del artefacto.
- Sin información sobre el esquema de etiquetas: es necesario inspeccionar `config.json` para conocer el mapeo `id2label` antes de integrarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/imagostorm/novapay-sentiment
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
- Documentación de Transformers sobre clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
