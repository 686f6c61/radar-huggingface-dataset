# sanjithrj/FeelWise

## Resumen
FeelWise Emotion es un clasificador de texto ligero desarrollado por Sanjith RJ y Shaik Bavikadi Al Hafeez que predice la emocion expresada en un texto corto en ingles. Su particularidad es que el codificador Transformer (autoatencion multi-cabeza, capas feed-forward, conexiones residuales y layer normalization) se implemento desde cero en PyTorch y se entreno desde inicializacion aleatoria, sin pesos preentrenados.

El modelo resuelve una tarea acotada de clasificacion emocional en seis categorias (sadness, joy, love, anger, fear, surprise) sobre mensajes tipo Twitter. Con 13.591.302 parametros totales y un repositorio de apenas 0,1 GB, es un modelo muy pequeno pensado para inferencia rapida y despliegue en entornos con recursos limitados.

Es relevante como referencia educativa y como ejemplo de arquitectura Transformer minima funcional: una sola capa de encoder, hidden size de 256 y contexto maximo de 500 tokens. No compite con modelos preentrenados grandes, pero sirve para tareas de clasificacion emocional de baja latencia y para estudiar el pipeline completo de un transformer construido desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only para clasificacion de secuencias (implementacion custom en PyTorch) |
| Parametros totales | 13.591.302 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 500 tokens (max sequence length) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Otros datos de arquitectura: 1 capa de encoder, hidden size (d_model) de 256, 8 cabezas de atencion, tamano feed-forward (d_ff) de 1024, vocabulario de 50.000 tokens, dropout de 0,1 y 6 clases de salida.

## Arquitectura y entrenamiento
El modelo es un transformer encoder-only de una sola capa. El pipeline descrito en la model card es: embeddings de tokens mas codificacion posicional, autoatencion multi-cabeza, Add & Norm, feed-forward, Add & Norm, mean pooling y una capa lineal de clasificacion. La implementacion es custom, por lo que requiere `trust_remote_code=True` al cargarse con Transformers, ya que no usa una clase de modelo integrada en la libreria.

El entrenamiento se realizo desde inicializacion aleatoria, sin pesos preentrenados, sobre el dataset `dair-ai/emotion`, compuesto por mensajes de Twitter en ingles etiquetados con seis emociones. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (en un clasificador de este tipo no seria lo habitual). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades
- Clasificacion de emociones en texto corto en ingles con seis etiquetas: sadness, joy, love, anger, fear y surprise.
- Extraccion de caracteristicas (tag `feature-extraction`) ademas de la clasificacion.
- Inferencia sobre secuencias de hasta 500 tokens.
- Salida de logits y probabilidades por clase mediante softmax.
- No soporta tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: solo ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso
- Moderacion de comunidades y redes sociales: clasificar mensajes de usuarios en tiempo real para detectar emociones negativas (anger, fear, sadness) y priorizar su revision por moderadores, aprovechando su baja latencia y tamano reducido.
- Analisis de sentimiento emocional en soporte al cliente: procesar transcripciones de tickets o chats para etiquetar el estado emocional del cliente y enrutar los casos de frustracion o enfado a agentes especializados.
- Monitorizacion de reputacion de marca: ingerir menciones en Twitter u otras plataformas y agregar la distribucion emocional por periodo, producto o campana.
- Investigacion en psicologia computacional o linguistica: usar el modelo como linea base reproducible (entrenado desde cero, licencia MIT) para comparar con modelos preentrenados en tareas de clasificacion emocional.
- Filtrado previo en pipelines de datos: etiquetar grandes volumenes de texto corto antes de un analisis mas costoso, gracias a sus 13,6 millones de parametros y su capacidad de ejecutarse en CPU.
- Docencia y prototipado: servir como ejemplo didactico de un transformer completo implementado desde cero, util para cursos de deep learning y para experimentar con arquitecturas minimas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un apartado de evaluacion que aparece truncado, sin cifras concretas de accuracy, F1 ni comparaciones.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB con pesos en fp32 (13,6 millones de parametros equivalen a unos 54 MB en fp32 y unos 27 MB en fp16).
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; funciona en CPU sin problema. Una RTX 4090, A100 o H100 no aportan ventaja significativa frente a una GPU de gama baja.
- Cabe en cualquier GPU consumer, incluidas GTX 1050, RTX 3050 o incluso en Raspberry Pi para inferencia en CPU.
- Opciones de despliegue: PyTorch nativo con Transformers (`trust_remote_code=True`), TorchServe o FastAPI para servir la inferencia. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en CPU y throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| FeelWise (este modelo) | 13,6 M | 500 tokens | Ingles | MIT | Entrenado desde cero, 1 capa de encoder |
| DistilBERT-base (fine-tuned en emociones) | 66 M | 512 tokens | Ingles (multilingue en variantes) | Apache 2.0 (base) | Preentrenado, mayor capacidad de generalizacion |
| RoBERTa-base (fine-tuned en emociones) | 125 M | 512 tokens | Ingles | MIT (base) | Preentrenado, habitualmente mejor accuracy en dair-ai/emotion |
| BERT-tiny | 4,4 M | 512 tokens | Ingles | Apache 2.0 | Preentrenado, alternativa minima |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias
- Entrenado solo con mensajes de Twitter en ingles; el dominio y el registro pueden no generalizar a otros tipos de texto.
- Al entrenarse desde cero con una sola capa, es probable que su capacidad de representacion sea limitada frente a modelos preentrenados, con mayor riesgo de errores en casos ambiguos o ironia.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de clasificaciones erroneas con alta confianza.
- Solo soporta ingles; el rendimiento en otros idiomas no esta garantizado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo custom del autor; conviene auditar el codigo antes de usarlo en produccion.
- Licencia MIT permite uso comercial, pero no se ofrecen garantias ni soporte por parte del autor.
- La model card no documenta sesgos especificos ni evaluacion de robustez; conviene realizar una evaluacion propia antes de desplegarlo en un caso sensible.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/sanjithrj/FeelWise
- Dataset de entrenamiento: https://huggingface.co/datasets/dair-ai/emotion
