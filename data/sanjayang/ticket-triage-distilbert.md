# SanjayanG/ticket-triage-distilbert

## Resumen

SanjayanG/ticket-triage-distilbert es un modelo basado en DistilBERT, la variante destilada del transformer BERT original, publicado por el usuario SanjayanG en Hugging Face. Por su nombre y tamano (66,9 millones de parametros), esta disenado para la clasificacion de tickets de soporte, es decir, la asignacion automatica de categoria, prioridad o cola de atencion a partir del texto de una incidencia. Es un modelo encoder-only, adecuado para tareas de clasificacion y no para generacion de texto.

El modelo no incluye informacion sobre el dataset de entrenamiento, el numero de clases, los idiomas soportados ni la licencia. El repositorio ocupa 0,3 GB y los pesos estan en formato safetensors. No se han publicado resultados de benchmarks ni una model card detallada en la informacion disponible, por lo que su evaluacion practica requerira una validacion propia antes de usarlo en produccion.

Su relevancia es la de un modelo pequeno y ligero para tareas de triaje en pipelines de atencion al cliente, donde el coste de inferencia y la latencia importan mas que la capacidad generativa. Con 66,9 millones de parametros puede ejecutarse en CPU con throughput alto, lo que lo hace atractivo para clasificacion masiva de tickets en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder-only destilado de BERT) |
| Parametros totales | 66.956.548 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT admite hasta 512 tokens como maximo arquitectonico, no confirmado para este modelo) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, un transformer encoder-only de 6 capas obtenido mediante destilacion de conocimiento a partir de BERT-base. DistilBERT reduce los parametros de BERT-base (110 millones) a unos 66 millones manteniendo aproximadamente el 97 % del rendimiento en tareas de comprension del lenguaje segun el paper original, con una velocidad de inferencia notablemente superior. El modelo es de tipo encoder, por lo que produce representaciones contextuales y una cabeza de clasificacion, no texto generado.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos, el numero de clases de triaje ni si se aplico fine-tuning adicional sobre el checkpoint destilado. Tampoco se documenta si hubo ajuste con datos especificos de tickets de soporte ni que estrategia de evaluacion se siguio. Esta ausencia de documentacion es la principal limitacion para reproducir o validar el modelo.

## Capacidades

- Clasificacion de texto: por el nombre y el tipo de modelo, se orienta a la clasificacion de tickets de soporte (categoria, prioridad o cola de atencion).
- Inferencia ligera: 66,9 millones de parametros permiten ejecucion en CPU y en GPUs de gama baja.
- Extraccion de embeddings: al ser un encoder, puede usarse para representaciones de frases y similitud semantica, aunque no se documenta esta capacidad.
- No soporta generacion de texto, tool calling, function calling ni razonamiento multi-paso: es un modelo encoder-only de clasificacion.
- Capacidades multilingues: no disponibles; no se documentan idiomas soportados.
- No se documentan modos especiales (thinking, vision, audio).

## Casos de uso

- Triaje automatico de tickets de soporte: clasificar cada ticket entrante en una categoria (facturacion, tecnico, cuenta, etc.) para enrutarlo a la cola adecuada; el modelo esta pensado para esta tarea y su tamano permite procesar lotes grandes con baja latencia.
- Priorizacion de incidencias: asignar una etiqueta de prioridad (alta, media, baja) a partir del texto del ticket, usando la cabeza de clasificacion afinada para ello.
- Enrutamiento en mesas de ayuda: integrar el modelo en un sistema de ticketing (Zendesk, Jira Service Management) para predecir la cola destino antes de la intervencion humana.
- Moderacion y filtrado de mensajes: clasificar mensajes de entrada en categorias predefinidas para derivar los que requieren revision humana.
- Analitica de volumen de tickets: clasificar grandes volumenes historicos de tickets para construir informes de distribucion por categoria y tendencias.
- Preetiquetado para anotacion humana: usar las predicciones como sugerencia inicial en flujos de etiquetado supervisado, reduciendo el tiempo de anotacion.
- Clasificacion en entornos con recursos limitados: desplegar en CPU o en GPUs pequenas donde modelos generativos grandes no son viables por coste o latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32 (66,9 millones de parametros x 4 bytes), menos de 0,2 GB en fp16; el repositorio ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3060, T4 y GPUs integradas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: transformers (PyTorch) con safetensors; ONNX Runtime y TorchScript son viables tras conversion, aunque no se publican artefactos. vLLM, llama.cpp y Ollama no aplican a un encoder de clasificacion de este tipo.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera throughput alto en CPU y muy alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SanjayanG/ticket-triage-distilbert | 66,9 M | no disponible | Clasificacion de tickets | no disponible | Hugging Face, 0 descargas |
| distilbert-base-uncased | 66,9 M | 512 tokens | Clasificacion/encoder general | Apache 2.0 | Hugging Face, ampliamente usado |
| bert-base-uncased | 110 M | 512 tokens | Clasificacion/encoder general | Apache 2.0 | Hugging Face, ampliamente usado |
| ModernBERT-base | 149 M | 8192 tokens | Clasificacion/encoder general | Apache 2.0 | Hugging Face |

La comparativa se limita a la arquitectura base, ya que no hay datos de rendimiento del modelo evaluado. Frente a distilbert-base-uncased y bert-base-uncased, este modelo parte de la misma familia pero no documenta su fine-tuning ni su evaluacion; frente a ModernBERT, ofrece un contexto mucho menor y no dispone de artefactos publicados de cuantizacion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de DistilBERT, hereda los sesgos del corpus de preentrenamiento original, no especificados para este checkpoint.
- Riesgo de alucinacion: bajo en sentido generativo (no genera texto), pero las clasificaciones pueden ser erroneas si el dominio de tickets difiere del de entrenamiento.
- Limitaciones de contexto e idioma: no se documenta la longitud de contexto efectiva ni los idiomas soportados; el maximo arquitectonico de DistilBERT es de 512 tokens.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar el uso comercial; es imprescindible verificarla antes de desplegar en produccion.
- Falta de documentacion: no hay model card con dataset, metricas ni clases; el modelo tiene 0 descargas y 1 like, lo que indica ausencia de validacion por la comunidad.
- Caveat para produccion: requiere validacion propia con datos representativos y una revision de la licencia y del origen de los datos de entrenamiento antes de cualquier uso real.

## Enlaces

- Hugging Face: https://huggingface.co/SanjayanG/ticket-triage-distilbert
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
- Paper de BERT: https://arxiv.org/abs/1810.04805
