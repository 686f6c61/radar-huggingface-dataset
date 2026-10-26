# MayorChris/xlm-roberta-large-batch32-sarcasmo-finetuned-2026

## Resumen

`MayorChris/xlm-roberta-large-batch32-sarcasmo-finetuned-2026` es un modelo de clasificación de texto obtenido por ajuste fino (fine-tuning) supervisado de `FacebookAI/xlm-roberta-large` para la detección de sarcasmo. Lo publica el usuario MayorChris en HuggingFace con licencia MIT y pipeline `text-classification`. No es un modelo generativo: es un encoder Transformer que devuelve una etiqueta (y sus logits) para un texto de entrada, por lo que su utilidad está acotada a tareas de clasificación, no a diálogo ni a generación de código.

El modelo cuenta con 559.892.482 parámetros reales según los pesos en safetensors, lo que corresponde exactamente al tamano del encoder XLM-RoBERTa-large. El repositorio ocupa 22,4 GB, un tamano muy superior al de los pesos en precision simple (unos 2,2 GB), lo que sugiere la presencia de checkpoints intermedios o estados del optimizador de las 10 epocas de entrenamiento.

Su relevancia es limitada pero concreta: la model card declara métricas de evaluacion altas (exactitud 0,9387 y F1 macro 0,9355), aunque el autor no documenta el conjunto de datos, los idiomas ni el esquema de etiquetas. Es, por tanto, un artefacto util como punto de partida para moderacion de comentarios o analisis de opinion en espanol, pero que requiere validacion propia antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (familia RoBERTa / XLM-RoBERTa-large); 24 capas, 1024 de dimension oculta, 16 cabezas de atencion y vocabulario SentencePiece de 250 000 tokens segun el modelo base |
| Parametros totales | 559.892.482 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 514 tokens (limite de posiciones del encoder XLM-RoBERTa; no declarado en la model card) |
| Tipos de cuantizacion | no especificado por el autor; al ser un encoder BERT-like admite cuantizacion dinamica int8 (PyTorch), ONNX cuantizado y GGUF mediante herramientas externas |
| Idiomas soportados | no disponible (el modelo base XLM-R cubre 100 idiomas, pero la model card no declara el idioma ni la composicion del corpus de ajuste fino) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`); el repositorio incluye ademas checkpoints de entrenamiento (22,4 GB en total) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `FacebookAI/xlm-roberta-large`: un encoder Transformer de tipo RoBERTa preentrenado de forma multilingue con enmascaramiento de tokens sobre corpus en 100 idiomas, sin objetivo de prediccion de frase siguiente. Sobre esa base se anade una cabeza de clasificacion de secuencia (`XLMRobertaForSequenceClassification`) cuyo numero de etiquetas no se especifica en la model card. El autor no documenta ninguna modificacion estructural, atencion lineal ni decodificacion especulativa; se trata de un ajuste fino convencional.

Los hiperparametros declarados son: tasa de aprendizaje 1e-5, batch de entrenamiento 32, batch de evaluacion 64, 10 epocas, optimizador AdamW con `torch.fused` (betas 0,9 y 0,999, epsilon 1e-8), planificador lineal y semilla 42, con Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. El autor describe el conjunto de datos como "unknown dataset" y no indica numero de tokens ni de ejemplos; a partir del numero de pasos (478 por epoca con batch 32) se puede estimar un conjunto de entrenamiento de unos 15 300 ejemplos, cifra no confirmada oficialmente. El historial de entrenamiento muestra sobreajuste a partir de la cuarta epoca: la perdida de validacion baja hasta 0,2036 en la epoca 3 y luego asciende hasta 0,5187 en la epoca 10, mientras la perdida de entrenamiento cae hasta 0,0242.

## Capacidades

- Clasificacion de texto por secuencia: devuelve etiquetas y logits para una unica entrada de hasta 514 tokens.
- Deteccion de sarcasmo y, por extension, de ironia o carga pragmatica en textos cortos, segun el corpus de ajuste (no documentado).
- Analisis de sentimiento y moderacion de contenido si el esquema de etiquetas del ajuste fino lo contempla; el autor no publica el mapeo `id2label`.
- Potencial cobertura multilingue heredada de XLM-R, no verificada ni declarada para este checkpoint.
- Compatibilidad con `text-embeddings-inference` y con endpoints de HuggingFace, segun los tags del repositorio (orientado a inferencia de baja latencia).
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio.

## Casos de uso

- Moderacion de comentarios en foros y redes: clasificar respuestas potencialmente sarcasticas o toxicas como paso previo a la revision humana, con un encoder de 560 M parametros que cabe en una sola GPU y procesa lotes de 64 secuencias en decenas de milisegundos.
- Analisis de opinion en medios: detectar ironia en titulares y comentarios de lectores para no interpretar literalmente criticas sarcasticas en agregadores de sentimiento.
- Investigacion en linguistica computacional: usar el checkpoint como linea base reproducible (semilla 42, hiperparametros publicados) para comparar tecnicas de deteccion de sarcasmo en espanol.
- Etiquetado asistido en anotacion de corpus: preanotar grandes volumenes de texto para que los anotadores humanos solo corrijan, reduciendo el coste de crear datasets de sarcasmo.
- Filtrado de resenas de producto: separar opiniones sarcasticas de opiniones genuinas antes de calcular puntuaciones agregadas de satisfaccion.
- Enrutado en sistemas de atencion al cliente: marcar mensajes con alta probabilidad de sarcasmo para derivarlos a un agente humano o a un modelo generativo con instrucciones especificas de trato.
- Deteccion de ambiguedad en pipelines de datos: usar la confianza del clasificador para descartar ejemplos dudosos en la construccion de datasets de entrenamiento.

## Benchmarks y rendimiento

El campo `model-index` de la model card esta vacio (`results: []`), por lo que no hay resultados declarados en el formato estandar de HuggingFace. Las unicas cifras disponibles son las metricas de evaluacion del autor sobre un conjunto de validacion no documentado:

| Metrica | Valor final (epoca 10) |
|---|---|
| Loss | 0,5187 |
| Exactitud (accuracy) | 0,9387 |
| F1 macro | 0,9355 |
| F1 ponderado | 0,9386 |
| Recall macro | 0,9338 |
| Recall ponderado | 0,9387 |
| Precision macro | 0,9374 |
| Precision ponderado | 0,9386 |

Evolucion durante el entrenamiento (seleccion de epocas):

| Epoca | Paso | Loss validacion | F1 macro | Exactitud |
|---|---|---|---|---|
| 1 | 478 | 0,2390 | 0,9014 | 0,9084 |
| 3 | 1434 | 0,2036 | 0,9249 | 0,9293 |
| 4 | 1912 | 0,2793 | 0,9311 | 0,9346 |
| 6 | 2868 | 0,4131 | 0,9271 | 0,9314 |
| 8 | 3824 | 0,4897 | 0,9326 | 0,9359 |
| 10 | 4780 | 0,5187 | 0,9355 | 0,9387 |

No se han publicado resultados de benchmarks comparativos (MMLU, GLUE, HumanEval) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: unos 2,3 GB en fp32, unos 1,2 GB en fp16/bf16 y unos 0,6 GB con cuantizacion dinamica int8 (pesos mas activaciones y overhead de runtime).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM sirve; para alto throughput, A100 40 GB, H100 o L40S permiten lotes grandes (256 o mas secuencias cortas) y saturar el encoder.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090; tambien en GPUs de 4-6 GB como GTX 1650 Super o RTX 3050 portatil con cuantizacion.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (etiqueta `text-embeddings-inference` del repo), ONNX Runtime, TorchScript, o exportacion a GGUF para llama.cpp aunque el soporte de clasificacion en llama.cpp es limitado.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia estructural, un encoder de 24 capas y 560 M parametros procesa secuencias de 128 tokens en el orden de milisegundos por lote en GPU moderna, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (`xlm-roberta-large-batch32-sarcasmo-finetuned-2026`) | 559,9 M | 514 tokens | Clasificacion de sarcasmo | MIT | Metricas de validacion declaradas; dataset no documentado |
| `FacebookAI/xlm-roberta-large` | 559,9 M | 514 tokens | Encoder multilingue base | MIT | Requiere ajuste fino para clasificacion; sin metricas de sarcasmo |
| `FacebookAI/roberta-large` | 355 M | 514 tokens | Encoder en ingles | MIT | Menor coste computacional, solo ingles |
| `microsoft/mdeberta-v3-base` | ~86 M (backbone) | 512 tokens | Clasificacion multilingue | MIT | Mucho mas ligero; habitual como linea base en tareas de NLU multilingue |
| `cardiffnlp/twitter-roberta-base-irony` | ~125 M | 512 tokens | Ironia en tweets | MIT | Especifico de ingles y dominio Twitter; no comparable en idioma |

No se dispone de cifras de rendimiento publicadas para las alternativas en el mismo conjunto de evaluacion, por lo que la comparacion cuantitativa directa no esta disponible.

## Limitaciones y advertencias

- El autor no documenta el conjunto de datos de entrenamiento ni de evaluacion ("unknown dataset"), por lo que las metricas de 0,9387 de exactitud no son reproducibles ni comparables con la literatura.
- El esquema de etiquetas (`id2label`) y el numero de clases no se especifican; es imprescindible inspeccionar `config.json` antes de usar el modelo.
- Riesgo de sobreajuste: la perdida de validacion se multiplica por 2,5 entre la epoca 3 y la 10 mientras la de entrenamiento cae a 0,0242; el checkpoint publicado es el de la ultima epoca, no el mejor segun validacion.
- Sesgo desconocido: al no publicarse la composicion del corpus, no se puede evaluar el sesgo por origen, genero, dialecto o registro (formal frente a coloquial).
- Riesgo de alucinacion no aplicable en sentido estricto (no genera texto), pero si de falsos positivos y negativos con alta confianza en dominios distintos al de entrenamiento.
- Cobertura idiomatica no declarada: aunque XLM-R es multilingue, no hay garantia de que el ajuste fino no haya colapsado el modelo hacia un unico idioma o variedad dialectal.
- Limite de 514 tokens: textos mas largos se truncan, lo que puede eliminar la parte sarcastica de la frase.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; conviene conservar el aviso de copyright.
- Repositorio de 22,4 GB con checkpoints de entrenamiento: descarga costosa y posible exposicion de estados del optimizador; para produccion basta con los safetensors.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en la comunidad ni validacion externa.
- La fecha de creacion declarada (2026-10-25) y las versiones de framework (Transformers 5.20.2, PyTorch 2.11.0) son posteriores a las releases estables conocidas; conviene verificar la compatibilidad real del entorno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MayorChris/xlm-roberta-large-batch32-sarcasmo-finetuned-2026
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Paper de XLM-RoBERTa (Conneau et al., 2019): https://arxiv.org/abs/1911.02116
- Paper de RoBERTa (Liu et al., 2019): https://arxiv.org/abs/1907.11692
- Documentacion de `XLMRobertaForSequenceClassification`: https://huggingface.co/docs/transformers/model_doc/xlm-roberta
- Documentacion de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
