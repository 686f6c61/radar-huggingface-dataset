# shomoukh/my_phishing_bert_model

## Resumen

`shomoukh/my_phishing_bert_model` es un modelo de tipo BERT publicado en Hugging Face por el usuario shomoukh. Por su nombre y su tamaño de parametros (109.483.778, es decir, aproximadamente 109 millones), se trata de un modelo encoder-only basado en la arquitectura BERT, presumiblemente afinado para la deteccion de phishing (clasificacion de URLs, correos o contenido fraudulento). El repositorio tiene 0 descargas y 1 like, lo que indica que es un experimento personal o un proyecto en fase muy temprana, sin adopcion por parte de la comunidad.

El modelo se distribuye en formato safetensors y ocupa 0,4 GB en el repositorio. No se ha publicado informacion sobre el pipeline, la licencia, los idiomas soportados, el dataset de entrenamiento ni resultados de evaluacion. Por tanto, la mayor parte de las especificaciones tecnicas que siguen deben considerarse "no disponibles" y el modelo no deberia usarse en produccion sin una evaluacion propia previa.

Su relevancia actual es limitada: sirve como ejemplo de modelo BERT afinado para una tarea de seguridad (deteccion de phishing) y puede resultar util como punto de partida para quien quiera reproducir o comparar aproximaciones de clasificacion de texto con BERT, pero carece de documentacion y de validacion publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only, transformer) |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es BERT, un transformer encoder-only con atencion bidireccional, adecuado para tareas de clasificacion y comprension del lenguaje. El numero de parametros (109,5 millones) es coherente con la configuracion de BERT-base (aproximadamente 110 millones), si bien no se dispone de la configuracion exacta de capas, dimensiones ocultas y cabezas de atencion.

No se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos, ni si hubo tecnicas de ajuste fino supervisado, RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica destacable (decodificacion especulativa, atencion lineal, etc.). Dado el nombre del modelo, es plausible que se haya realizado un fine-tuning sobre un corpus de URLs o mensajes de phishing, pero esto no esta confirmado en la informacion disponible.

## Capacidades

- Clasificacion de texto: por su naturaleza de encoder BERT, la capacidad principal esperada es la clasificacion de secuencias (por ejemplo, deteccion de phishing en URLs o correos), aunque no se especifica la tarea exacta.
- Generacion de texto: no soportada de forma nativa; BERT no es un modelo generativo autoregresivo.
- Razonamiento y matematicas: no disponible.
- Codigo: no disponible.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Deteccion de URLs de phishing: el modelo podria clasificar una URL o un fragmento de texto como legitimo o fraudulento, aprovechando el ajuste fino de BERT para clasificacion binaria. Requiere validacion previa con datos propios, ya que no hay metricas publicadas.
- Filtrado de correos sospechosos: integrado en una pasarela de correo, podria puntuar el cuerpo o el asunto de un mensaje para marcar posibles intentos de phishing antes de que lleguen al usuario.
- Analisis de mensajes en formularios web: clasificar el contenido enviado por usuarios en formularios de contacto o comentarios para detectar intentos de ingenieria social.
- Enriquecimiento de alertas de seguridad: como clasificador auxiliar en un SIEM o en una plataforma de gestion de incidentes, para priorizar alertas relacionadas con contenido fraudulento.
- Investigacion academica sobre deteccion de phishing: servir como baseline BERT-base afinado para comparar con otros enfoques (modelos mas grandes, LLM, reglas heuristicas).
- Prototipado rapido de clasificadores de texto: al ser un BERT-base de 109 millones de parametros, puede ejecutarse en CPU o en GPU consumer para experimentos de clasificacion con requisitos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en FP32 (109 millones de parametros x 4 bytes), alrededor de 0,2-0,3 GB en FP16 o INT8. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para inferencia por lotes pequenos. En GPU, cualquier modelo desde una GTX 1650 en adelante es suficiente; para alto throughput, una T4, L4 o RTX 4090 ofrecen margen de sobra.
- Cabe en consumer GPU: si, en practicamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, TorchScript, y servidores de inferencia como TGI o vLLM (aunque vLLM esta orientado a modelos generativos; para BERT es mas habitual usar transformers o ONNX). Tambien es posible convertirlo a otros formatos, aunque no se documenta ninguna conversion oficial.
- Latencia y throughput estimados: no disponibles; al tratarse de un BERT-base, la latencia por secuencia corta en GPU suele ser de pocos milisegundos, pero no hay datos publicados para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shomoukh/my_phishing_bert_model | 109,5 M | no disponible | Clasificacion (presuntamente phishing) | no disponible | Hugging Face, 0 descargas |
| bert-base-uncased | 110 M | 512 tokens | Modelo base BERT | Apache 2.0 | Ampliamente disponible |
| distilbert-base-uncased | 66 M | 512 tokens | Modelo base BERT destilado | Apache 2.0 | Ampliamente disponible |
| roberta-base | 125 M | 512 tokens | Modelo base RoBERTa | MIT | Ampliamente disponible |

La comparativa se limita a modelos base de la misma familia, ya que no se dispone de informacion sobre otros modelos especificos de deteccion de phishing con los que comparar directamente. El modelo de shomoukh no documenta metricas, licencia ni contexto, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card con descripcion de la tarea, el dataset, el preprocesado ni las metricas.
- Licencia no especificada: no se puede determinar si el uso comercial esta permitido; en la practica, esto bloquea su adopcion en produccion.
- Sin validacion publica: 0 descargas y 1 like indican que el modelo no ha sido revisado por la comunidad; el riesgo de comportamiento inesperado es alto.
- Riesgo de sesgos y alucinacion: al ser un clasificador, el riesgo principal es de falsos positivos y falsos negativos; sin datos de evaluacion no se puede estimar su precision ni su recall.
- Limitaciones de contexto e idioma: no se especifica la longitud maxima de secuencia ni los idiomas de entrenamiento; probablemente este limitado al ingles si se basa en BERT-base, pero no esta confirmado.
- Caveat para produccion: no deberia desplegarse sin un proceso de evaluacion propio con datos representativos del dominio objetivo y sin clarificar la licencia con el autor.

## Enlaces

- Hugging Face: https://huggingface.co/shomoukh/my_phishing_bert_model
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
