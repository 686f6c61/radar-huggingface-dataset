# OussamaBenSlama/qarai-guard-12M-v0

## Resumen

qarai-guard-12M-v0 es un modelo de clasificacion de texto obtenido mediante fine-tuning de asafaya/bert-mini-arabic, un encoder BERT en su variante mini adaptado al arabe. Lo publica el usuario OussamaBenSlama en HuggingFace y cuenta con 11.551.498 parametros (aproximadamente 11,55 millones), lo que lo situa en la gama de modelos ultraligeros aptos para inferencia en CPU y dispositivos con recursos muy limitados. La etiqueta del repositorio y el sufijo "guard" del nombre sugieren un uso orientado a tareas de filtrado o moderacion, aunque la model card no documenta explicitamente la finalidad.

El modelo se distribuye en formato safetensors y es compatible con la libreria transformers, con la libreria text-embeddings-inference y con endpoints compatibles. Resuelve, por tanto, problemas genericos de clasificacion de secuencias: asignar una o varias etiquetas a un texto de entrada. Su relevancia actual radica en su tamano reducido, que permite despliegues de bajisima latencia y coste energetico minimo alli donde un modelo grande no es viable.

La informacion publicada es escasa: no se especifican la licencia, los idiomas soportados, el conjunto de datos de entrenamiento, el numero de clases ni la longitud de contexto. Los unicos datos de rendimiento disponibles son las metricas de evaluacion del propio entrenamiento (accuracy 0,8960 y Macro F1 0,9247 en la segunda epoca). La model card conserva el aviso autogenerado por el Trainer y varios apartados con el texto "More information needed".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT-mini); fine-tune de asafaya/bert-mini-arabic |
| Parametros totales | 11.551.498 (11,55 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en los metadatos; el modelo base asafaya/bert-mini-arabic esta orientado al arabe |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un fine-tuning de asafaya/bert-mini-arabic, un BERT en configuracion mini adaptado al arabe. La arquitectura es, por tanto, un encoder Transformer bidireccional con atencion completa, del orden de 11,55 millones de parametros, disenado para producir representaciones contextuales del texto y no para generacion autorregresiva. Al ser un modelo de clasificacion, sobre la salida del encoder se situa una cabeza de clasificacion que proyecta la representacion agregada (habitualmente el token [CLS]) sobre el numero de clases, dato que no se especifica en la model card.

El entrenamiento se realizo durante 2 epocas con AdamW fused (betas 0,9 y 0,999, epsilon 1e-08), learning rate lineal de 2e-05 con 4125 pasos de warmup, batch de entrenamiento y evaluacion de 32, semilla 42 y precision mixta nativa (Native AMP). No se detalla el conjunto de datos, su composicion, su tamano en tokens ni si se aplicaron tecnicas de alineacion como RLHF o DPO; la model card indica "unknown dataset" y varios apartados sin completar. El registro de entrenamiento muestra dos puntos de evaluacion: en la epoca 1, perdida de validacion 0,8192 con accuracy 0,8894; en la epoca 2, perdida de validacion 0,9499 con accuracy 0,8960, lo que apunta a un cierto sobreajuste entre ambas epocas (la perdida de validacion sube mientras la accuracy mejora ligeramente). Las versiones de framework empleadas fueron Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

## Capacidades

- Clasificacion de texto: asigna etiquetas a secuencias de entrada mediante la pipeline text-classification de transformers.
- Inferencia ultraligera: con 11,55 millones de parametros, el modelo puede ejecutarse en CPU sin GPU dedicada.
- Codificacion de texto para embeddings: la compatibilidad declarada con text-embeddings-inference sugiere su uso como extractor de representaciones, aunque la model card no lo confirma de forma explicita.
- Soporte de tool calling / function calling: no disponible; es un modelo de clasificacion, no de generacion con llamada a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; la arquitectura no esta disenada para razonamiento secuencial ni planificacion.
- Capacidades multilingues: no disponibles; el modelo base esta orientado al arabe y no se documentan otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Moderacion y filtrado de contenido en arabe: dado el sufijo "guard" del nombre y la naturaleza de clasificador, puede emplearse para etiquetar textos como aptos o no aptos en pipelines de moderacion, aprovechando su baja latencia para procesar grandes volumenes de comentarios. La finalidad concreta no esta documentada, por lo que seria necesario validarla con datos propios antes de un uso en produccion.
- Clasificacion de tickets de soporte: integrado como paso previo al enrutado, permite asignar cada consulta entrante a una categoria (facturacion, tecnica, reclamacion) antes de derivarla al equipo correspondiente, con coste computacional minimo.
- Analisis de sentimiento a gran escala: procesamiento por lotes de resenas o publicaciones para obtener una etiqueta de polaridad, viable en CPU y en entornos sin GPU.
- Deteccion de spam o abuso en foros y redes: filtrado de primera linea en el que el modelo actua como clasificador rapido que descarta el grueso del trafico y reserva modelos mayores para los casos ambiguos.
- Etiquetado previo para anotacion humana: uso como preanotador que propone etiquetas a un equipo de anotadores, reduciendo el esfuerzo manual en proyectos de construccion de datasets en arabe.
- Clasificacion en el borde (edge): despliegue en dispositivos con memoria reducida (Raspberry Pi, moviles, contenedores ligeros) donde un modelo de miles de millones de parametros no cabe.
- Preprocesado en pipelines de busqueda o recomendacion: generacion de etiquetas tematicas que alimentan indices o sistemas de filtrado previo.

## Benchmarks y rendimiento

El model-index del autor no contiene resultados de benchmarks estandar (el array results esta vacio). Los unicos datos disponibles son las metricas de evaluacion registradas durante el entrenamiento:

| Metrica | Epoca 1 (step 6903) | Epoca 2 (step 13806) |
|---|---|---|
| Training loss | 0,3411 | 0,1993 |
| Validation loss | 0,8192 | 0,9499 |
| Accuracy | 0,8894 | 0,8960 |
| Macro F1 | 0,9164 | 0,9247 |
| Weighted F1 | 0,8906 | 0,8969 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores corresponden al conjunto de evaluacion interno del entrenamiento, cuyo origen y composicion no se detallan, por lo que no son directamente comparables con resultados publicados de otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 100 MB en cualquier precision. En FP32 el modelo ocupa aproximadamente 46 MB de pesos; en FP16, unos 23 MB; en int8, unos 12 MB. El consumo real dependera del tamano de lote y de la longitud de secuencia.
- GPU recomendadas: no requiere GPU. Funciona en cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100), aunque estas estarian enormemente sobredimensionadas para este modelo.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso integrada. Tambien se ejecuta en CPU de forma eficiente.
- Opciones de despliegue: transformers (pipeline text-classification), text-embeddings-inference (etiqueta declarada por el autor) y endpoints compatibles. No se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI, aunque al ser un modelo BERT pequeno su adaptacion a motores de inferencia habituales es sencilla.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, la latencia por peticion en CPU deberia ser del orden de milisegundos y el throughput en GPU, de miles de secuencias por segundo, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qarai-guard-12M-v0 | 11,55 M | no disponible | no disponible | HuggingFace (0 descargas, 0 likes) |
| asafaya/bert-mini-arabic (modelo base) | no disponible en la informacion | no disponible | no disponible | HuggingFace |
| Otros clasificadores BERT-mini arabe | no disponible | no disponible | no disponible | no disponible |

El unico punto de referencia claro es el modelo base asafaya/bert-mini-arabic, del que hereda tamano y arquitectura, aunque no se aportan sus especificaciones completas ni sus metricas.

## Limitaciones y advertencias

- Documentacion incompleta: la model card conserva el aviso autogenerado por el Trainer y apartados sin rellenar ("More information needed"), incluidos descripcion, usos previstos y datos de entrenamiento.
- Dataset de entrenamiento desconocido: se desconoce la composicion, el idioma exacto, el dominio y el numero de clases, lo que impide evaluar la validez del modelo fuera del contexto para el que fue entrenado.
- Sesgos: no disponibles. Al no documentarse los datos de entrenamiento, no es posible caracterizar sesgos demograficos, dialectales o de contenido.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto libre), pero si existe riesgo de clasificaciones erroneas o sobreconfiadas en entradas fuera de la distribucion de entrenamiento.
- Limitacion de contexto e idioma: la longitud maxima de secuencia no se especifica y solo se infiere un enfoque en arabe a partir del modelo base; no hay confirmacion de soporte multilingue.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso para uso comercial ni redistribucion. Es imprescindible contactar con el autor o consultar el repositorio antes de cualquier uso en produccion.
- Sobreajuste potencial: la perdida de validacion aumenta de la epoca 1 a la 2 (0,8192 a 0,9499) mientras la accuracy apenas mejora, lo que sugiere que la segunda epoca aporta poco y podria degradar la generalizacion.
- Adopcion nula: el modelo registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion ni validacion por terceros.
- Fecha de publicacion inusual: los metadatos indican fecha de creacion 2026-10-09, posterior a la fecha de referencia habitual, dato que conviene verificar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OussamaBenSlama/qarai-guard-12M-v0
- Modelo base: https://huggingface.co/asafaya/bert-mini-arabic
