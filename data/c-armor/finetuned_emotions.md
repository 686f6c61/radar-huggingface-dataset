# c-armor/finetuned_emotions

## Resumen

`c-armor/finetuned_emotions` es un modelo BERT en castellano ajustado para la deteccion multietiqueta de seis emociones (alegria, tristeza, ira, miedo, sorpresa y asco) en textos en espanol. Lo desarrolla el usuario de Hugging Face c-armor y parte de BETO (`dccuchile/bert-base-spanish-wwm-cased`), el modelo base de BERT entrenado especificamente sobre corpus en espanol por el equipo de DCC UChile. El modelo se emplea en la aplicacion "Mi Diario Emocional" y su proposito es clasificar publicaciones de texto libre en una o varias de esas seis categorias emocionales de forma simultanea.

Se trata de un fine-tuning de clasificacion, no de un modelo generativo: la salida es un vector de probabilidades por emocion con umbrales de decision calibrados por clase (0,5 para alegria, tristeza e ira; 0,3 para miedo, sorpresa y asco). El corpus de entrenamiento son 10.008 publicaciones de Reddit en espanol etiquetadas automaticamente con pysentimiento, divididas en 8.006 de entrenamiento, 1.001 de validacion y 1.001 de prueba. La version actual (v3) reentrena excluyendo las 200 muestras de evaluacion humana y los 15 textos de practica, con un filtrado de duplicados por identificador, texto identico y similitud coseno >= 0,80 entre 5-gramas de caracteres.

El modelo tiene 109.855.494 parametros (BERT-base) y una ventana de contexto de 512 tokens. Su relevancia practica es limitada pero concreta: ofrece un clasificador de emociones en espanol con licencia AGPL-3.0, pesos en safetensors y un rendimiento declarado de F1-macro 0,846 frente a las etiquetas de pysentimiento. Es importante subrayar que esas metricas miden el acuerdo con el etiquetador automatico, no con anotadores humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base, BETO en espanol) |
| Parametros totales | 109.855.494 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (`max_length` de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | espanol (es) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder BERT-base heredado de BETO: 12 capas, atencion multi-cabeza completa, embeddings WordPiece con whole word masking y casing preservado, y una cabeza de clasificacion multietiqueta sobre el token `[CLS]` con seis salidas sigmoidales. El preprocesamiento aplicado antes de la tokenizacion incluye conversion a minusculas, traduccion de emojis a texto mediante `emoji.demojize` en espanol, eliminacion de URLs, menciones y almohadillas, y reduccion de repeticiones de mas de dos caracteres a dos.

El ajuste fino se realizo durante 3 epocas con learning rate 2e-5, warmup de 500 pasos, weight decay 0,01, lote efectivo de 16, precision fp16, `max_length` de 512 y semilla 42; la mejor epoca se selecciono por F1-macro en validacion. Las etiquetas de entrenamiento no son anotaciones humanas, sino predicciones de pysentimiento sobre 10.008 publicaciones de Reddit en espanol, lo que convierte el proceso en una destilacion de ese etiquetador. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo coherente con un modelo discriminativo.

## Capacidades

- Clasificacion multietiqueta de seis emociones: alegria, tristeza, ira, miedo, sorpresa y asco.
- Asignacion simultanea de varias emociones a un mismo texto (no es una clasificacion excluyente).
- Umbrales de decision diferenciados por clase para equilibrar precision y recall.
- Procesamiento de textos de hasta 512 tokens, suficiente para publicaciones y parrafos de diario.
- Normalizacion de emojis y ruido tipico de redes sociales (URLs, menciones, hashtags, repeticiones).
- No soporta tool calling, function calling, agentes, vision, audio ni generacion de texto.
- Capacidad multilingue limitada al espanol; no se ha entrenado para otros idiomas.

## Casos de uso

- Diario emocional personal: la aplicacion "Mi Diario Emocional" usa el modelo para etiquetar automaticamente las entradas del usuario con una o varias emociones, permitiendo construir series temporales de estado animico sin anotacion manual.
- Moderacion y analisis de comunidades: clasificar publicaciones de foros o redes en espanol para detectar contenido con carga de ira o asco y priorizar la revision por parte de moderadores.
- Analisis de sentimiento granular en redes sociales: sustituir clasificadores binarios positivo/negativo por un desglose en seis emociones que capture matices como sorpresa o miedo en tuits y comentarios.
- Investigacion en psicologia y ciencias sociales: procesar corpus de textos en espanol para estudiar la distribucion emocional de una poblacion o de un evento concreto, con la salvedad de que las etiquetas de referencia son automaticas.
- Monitorizacion de reputacion de marca: analizar resenas y menciones en espanol para separar quejas por ira de expresiones de tristeza o sorpresa, y enrutar cada caso al equipo adecuado.
- Enriquecimiento de datasets para otros modelos: usar las salidas multietiqueta como caracteristicas adicionales en pipelines de recomendacion o de busqueda sensible al tono emocional.
- Filtrado previo en sistemas de atencion al cliente: clasificar el tono emocional de un mensaje entrante para escalar a un agente humano los casos con ira o miedo elevados.

## Benchmarks y rendimiento

Resultados declarados en el conjunto de prueba (1.001 muestras), tomando como referencia las etiquetas de pysentimiento:

| Metrica | Valor |
|---|---|
| F1-macro | 0,846 |
| F1-micro | 0,869 |
| Hamming loss | 0,054 |

| Emocion | F1 |
|---|---|
| alegria | 0,93 |
| tristeza | 0,92 |
| ira | 0,86 |
| miedo | 0,73 |
| sorpresa | 0,79 |
| asco | 0,84 |

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, etc.) en la informacion disponible. Las cifras anteriores miden el acuerdo con pysentimiento, no con anotadores humanos, y por tanto no son directamente comparables con evaluaciones sobre ground truth manual.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,45 GB en fp32 (109,9 M de parametros) y unos 0,22 GB en fp16; el repo ocupa 3,1 GB por incluir checkpoints y estados del optimizador.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; A100, H100 o RTX 4090 quedan sobredimensionadas para este modelo.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3060, RTX 4060 o incluso iGPU con suficiente memoria compartida.
- Tambien es viable en CPU: al ser un BERT-base, la inferencia por lote es rapida en procesadores modernos con `onnxruntime` o PyTorch.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, `TextClassificationPipeline`, TorchServe, ONNX Runtime o exportacion a TGI; no se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| c-armor/finetuned_emotions | 109,9 M | 512 | Clasificacion multietiqueta de 6 emociones (es) | AGPL-3.0 | Hugging Face |
| dccuchile/bert-base-spanish-wwm-cased (BETO) | 109,9 M | 512 | Modelo base en espanol, sin cabeza de clasificacion | Apache-2.0 | Hugging Face |
| pysentimiento (robertuito/bertweet-es) | no disponible en la informacion | no disponible | Analisis de sentimiento y emociones en espanol | no disponible en la informacion | GitHub / Hugging Face |

La comparacion con pysentimiento es especialmente relevante porque es el etiquetador que genero el corpus de entrenamiento y la referencia de evaluacion: el modelo ajustado aproxima sus salidas con un encoder BERT-base, lo que puede resultar util para despliegues con menos dependencias o menor coste. BETO actua como base arquitectonica y no es un competidor directo al carecer de cabeza de clasificacion emocional.

## Limitaciones y advertencias

- Las metricas publicadas miden acuerdo con pysentimiento, no con anotadores humanos; el rendimiento real sobre ground truth manual puede diferir.
- El corpus de entrenamiento son publicaciones de Reddit en espanol, con el sesgo de registro, tematica y demografia de esa plataforma; el modelo puede generalizar mal a otros dominios (literatura, prensa formal, conversacion oral).
- Las etiquetas de entrenamiento son automaticas y heredan los sesgos y errores de pysentimiento.
- El rendimiento por emocion es desigual: miedo (F1 0,73) y sorpresa (0,79) son claramente inferiores a alegria (0,93) y tristeza (0,92).
- La licencia AGPL-3.0 impone obligaciones copyleft fuertes: el uso en servicios en red puede exigir la publicacion del codigo fuente del servicio que integre el modelo; conviene revisarlo antes de un despliegue comercial.
- Solo soporta espanol; no se ha validado para otras lenguas ni para variantes dialectales distintas de las presentes en el corpus.
- Ventana de 512 tokens: textos mas largos deben truncarse o dividirse, lo que puede perder contexto emocional.
- Los umbrales de decision estan fijados de forma estatica por clase; en produccion puede ser necesario recalibrarlos segun el dominio.
- Riesgo de falsos positivos en textos ironicos o sarcasticos, no cubiertos explicitamente por el entrenamiento.
- No es un modelo generativo: no puede explicar sus predicciones ni mantener conversacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/c-armor/finetuned_emotions
- Perfil del autor: https://huggingface.co/c-armor
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Evaluacion de cumplimiento normativo (Nerq): https://nerq.ai/agent/c0059bfc-e1dd-4dcb-b00e-22c1c71c7bab
