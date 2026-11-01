# BalaJM/sentiment-model

## Resumen

`sentiment-model` es un modelo de clasificación de texto obtenido mediante fine-tuning de `distilbert-base-uncased`, publicado por el usuario BalaJM en HuggingFace. Se trata de un ajuste supervisado sobre un conjunto de datos no documentado por el autor, orientado a la clasificación de sentimiento. El modelo emplea la arquitectura DistilBERT, una versión destilada de BERT-base con 6 capas y 66,9 millones de parámetros, lo que lo sitúa en la gama ligera y permite su despliegue en hardware modesto.

La relevancia de esta ficha es limitada: el modelo cuenta con 20 descargas, 0 likes y una model card autogenerada por el `Trainer` de HuggingFace con secciones marcadas como "More information needed". El autor no ha documentado el dataset de entrenamiento, los idiomas soportados ni los usos previstos. Los resultados declarados en el conjunto de evaluación son modestos (accuracy 0,6598, F1 macro 0,6493), lo que sugiere un ajuste sobre un corpus pequeño o poco representativo.

A pesar de estas carencias, el modelo es funcional como punto de partida o como referencia para tareas de clasificación binaria o multiclase de sentimiento en inglés, dado que el modelo base está entrenado con vocabulario uncased en inglés. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.955.779 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (DistilBERT base soporta hasta 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, compatible con cuantizacion dinamica via PyTorch) |
| Idiomas soportados | No disponible (modelo base uncased en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una arquitectura transformer encoder con 6 capas, 12 cabezas de atencion y una dimension oculta de 768, destilada de BERT-base. Sobre esta base se ha anadido una cabeza de clasificacion de secuencia (`DistilBertForSequenceClassification`) cuyo numero de etiquetas no se especifica en la model card. El entrenamiento se realizo con el `Trainer` de HuggingFace usando AdamW con betas (0,9; 0,999), learning rate 2e-5, batch size 32, seed 42, scheduler lineal y 3 epocas. El conjunto de datos de entrenamiento no esta documentado ("unknown dataset" segun la model card).

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a un clasificador). La model card indica que el modelo fue generado automaticamente por el `Trainer` y no ha sido revisado por el autor. Las versiones de framework declaradas son Transformers 5.21.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Clasificacion de texto: el modelo devuelve una etiqueta de clase (presumiblemente sentimiento positivo/negativo o similar) con sus probabilidades asociadas.
- Pipeline `text-classification` de HuggingFace: integrable directamente con `pipeline("text-classification", model="BalaJM/sentiment-model")`.
- Inferencia sobre texto en ingles (heredado del tokenizer uncased del modelo base).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta generacion de texto, codigo, matematicas ni vision.
- Capacidades multilingues no documentadas; el vocabulario uncased del modelo base esta orientado al ingles.
- No dispone de modo "thinking" ni capacidades especiales adicionales.

## Casos de uso

- Clasificacion de resenas de productos en ingles: el modelo puede etiquetar resenas como positivas o negativas en un pipeline batch, dado su bajo coste computacional (66,9 M de parametros) y su capacidad de procesar lotes en CPU.
- Monitorizacion de redes sociales: analisis de sentimiento de tweets o comentarios en ingles para detectar tendencias de opinion, con la advertencia de que el accuracy declarado (0,66) limita la fiabilidad en produccion.
- Filtrado previo en pipelines de moderacion: uso como primera etapa de clasificacion para descartar contenido claramente positivo o negativo antes de un modelo mas costoso.
- Prototipado rapido de clasificadores de sentimiento: servir como baseline en experimentos academicos o pruebas de concepto, dado su tamano reducido y licencia permisiva.
- Analisis de encuestas abiertas: clasificacion de respuestas de texto libre en encuestas con opciones de sentimiento, siempre que el dominio y el idioma coincidan con los del entrenamiento (no documentados).
- Fine-tuning adicional: el modelo puede servir como punto de partida para ajustes sobre dominios especificos (finanzas, salud) con datasets propios, aprovechando su licencia Apache 2.0.
- Despliegue en entornos con recursos limitados: inferencia en CPU o GPUs de gama baja (por ejemplo, GTX 1650) gracias a su reducido numero de parametros.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluacion no documentado):

| Metrica | Valor |
|---|---|
| Loss (evaluacion final) | 0,7470 |
| Accuracy | 0,6598 |
| F1 weighted | 0,6493 |
| F1 macro | 0,6493 |

Evolucion durante el entrenamiento:

| Epoca | Step | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|
| 1 | 58 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 2 | 116 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 3 | 174 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, SST-2, etc.) en la informacion disponible. El `model-index` del modelo contiene una entrada sin resultados (`results: []`).

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 268 MB solo para pesos (66,9 M parametros x 4 bytes), mas overhead de activaciones y tokenizer; en la practica, menos de 1 GB.
- En FP16: aproximadamente 134 MB para pesos.
- Cabe holgadamente en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 4090) y en CPU.
- GPU recomendadas: no requiere GPU dedicada; una GPU consumer basica es suficiente. Para lotes grandes, una T4 o A10 es mas que suficiente.
- Opciones de despliegue: `transformers` (PyTorch), `optimum` (ONNX Runtime), `vLLM` (soporte limitado para clasificadores), `llama.cpp` no aplica (no es un modelo generativo), `TGI` no es la via habitual para clasificadores. Tambien desplegable via HuggingFace Inference Endpoints (el tag `endpoints_compatible` esta presente).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de milisegundos por muestra en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Accuracy declarada | Disponibilidad |
|---|---|---|---|---|---|
| BalaJM/sentiment-model | 66,9 M | No disponible | Apache 2.0 | 0,6598 (eval. propia) | HuggingFace |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 tokens | Apache 2.0 | No disponible en esta ficha | HuggingFace |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 tokens | MIT | No disponible en esta ficha | HuggingFace |
| ProsusAI/finbert | ~110 M | 512 tokens | Apache 2.0 | No disponible en esta ficha | HuggingFace |

La comparativa se limita a modelos de la misma categoria (clasificacion de sentimiento basada en encoders ligeros). No se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada para esta ficha, por lo que la comparacion cuantitativa no es posible. El modelo de BalaJM presenta un accuracy declarado inferior al tipico de clasificadores de sentimiento bien documentados, aunque la diferencia de conjuntos de evaluacion impide una comparacion directa.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: se desconoce el dominio, el tamano y la composicion del corpus, lo que impide evaluar la generalizacion del modelo.
- Accuracy declarada baja (0,6598) y F1 macro de 0,6493: insuficiente para la mayoria de aplicaciones en produccion sin validacion adicional.
- Idiomas no documentados: el modelo base es uncased en ingles, por lo que el rendimiento en castellano u otros idiomas es previsiblemente pobre o nulo.
- Numero de etiquetas no especificado: la model card no indica cuantas clases maneja el clasificador ni su significado.
- Riesgo de alucinacion no aplicable (es un clasificador, no un generador), pero si riesgo de clasificaciones erroneas con alta confianza.
- Sesgos: no documentados; al derivar de DistilBERT, puede heredar sesgos de genero, raza o religion presentes en el corpus original de BERT.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, pero el autor no ofrece garantias.
- Model card autogenerada sin revision: varias secciones contienen "More information needed", lo que indica falta de validacion por parte del autor.
- Sin soporte de contexto largo mas alla de los 512 tokens tipicos de DistilBERT (no confirmado en la ficha).
- Sin mantenimiento aparente: 20 descargas y 0 likes sugieren un modelo de uso marginal sin comunidad activa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BalaJM/sentiment-model
- Modelo base DistilBERT: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentacion de Transformers para clasificacion de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la informacion proporcionada.
