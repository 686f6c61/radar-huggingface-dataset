# fehhmont/classificador-suporte-ifood

## Resumen

El modelo `fehhmont/classificador-suporte-ifood` es un clasificador de texto en portugues publicado en Hugging Face por el usuario fehhmont. A partir del identificador y la etiqueta `text-classification`, se infiere que esta disenado para tareas de clasificacion de tickets o mensajes de soporte, presumiblemente en el contexto de la plataforma de reparto iFood, aunque la model card no documenta el proposito concreto ni el dataset de entrenamiento.

Tecnicamente se trata de un modelo basado en BERT con 108.925.443 parametros totales, lo que corresponde a la configuracion estandar de `bert-base` (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion y un vocabulario de aproximadamente 30.000 tokens), con una cabeza de clasificacion anadida. Los pesos estan en formato safetensors y el repositorio ocupa 0,4 GB. La licencia es MIT y el unico idioma declarado es el portugues.

La relevancia de esta ficha es limitada: el modelo no tiene descargas ni likes, la model card es la plantilla autogenerada de Hugging Face sin contenido sustantivo y no se han publicado resultados de evaluacion. Se documenta aqui como referencia tecnica de un artefacto pequeno y de proposito especifico, util unicamente para quien necesite clasificar texto en portugues con un BERT base y quiera evaluarlo por su cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder bidireccional) con cabeza de clasificacion de texto |
| Parametros totales | 108.925.443 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la configuracion de BERT base suele limitarse a 512 tokens, pero no se confirma en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugues (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-classification |
| Tamano del repositorio | 0,4 GB |
| Etiquetas del modelo | transformers, safetensors, bert, text-classification, pt, arxiv:1910.09700, license:mit, text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura declarada es BERT, un transformer encoder con atencion bidireccional. El recuento de parametros (108,9 millones) coincide con el de `bert-base` mas una capa densa de clasificacion, lo que sugiere un fine-tuning sobre un checkpoint base. No obstante, la model card no especifica de que checkpoint preentrenado parte, ni si el vocabulario es el multilingue original o uno especifico de portugues (por ejemplo, BERTimbau), dato relevante para estimar el rendimiento real en portugues.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de las clases, el regimen de entrenamiento (fp32, fp16, bf16), hiperparametros, si hubo aumento de datos o si se aplico alguna tecnica de regularizacion. Tampoco se documenta ningun proceso de RLHF, DPO o ajuste por preferencias, algo esperable en un clasificador. La referencia `arxiv:1910.09700` que aparece en las etiquetas corresponde al articulo del calculador de impacto medioambiental de Lacoste et al., citado en la plantilla de la model card, y no a un paper propio del modelo.

## Capacidades

- Clasificacion de texto en portugues: el pipeline declarado es `text-classification`, por lo que la salida esperada es una etiqueta (o distribucion de etiquetas) por secuencia de entrada.
- Procesamiento de texto corto y medio: al tratarse de un encoder BERT, esta pensado para entradas de una sola secuencia, no para generacion autoregresiva.
- Integracion con el ecosistema transformers: compatible con `text-embeddings-inference` y con endpoints compatibles, segun las etiquetas del repositorio.
- Uso como extractor de representaciones: al ser un BERT, puede emplearse para obtener embeddings de frases si se usa la salida del token `[CLS]` o un pooling, aunque no esta documentado como modelo de embeddings.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.

## Casos de uso

- Clasificacion de tickets de soporte: el modelo puede asignar una categoria (por ejemplo, entrega, pago, cuenta, restaurante) a mensajes de usuarios en portugues, lo que permite enrutar automaticamente las solicitudes al equipo adecuado.
- Triaje de reclamaciones en plataformas de reparto: dado un texto libre de un cliente, el clasificador puede etiquetar el tipo de incidencia y priorizar los casos criticos, reduciendo el tiempo de primera respuesta.
- Moderacion de mensajes en un chat de atencion: integrado en un pipeline previo a la respuesta humana, puede marcar mensajes con lenguaje abusivo o contenido sensible para revision.
- Analitica de voz del cliente: procesar en lote conversaciones o encuestas abiertas en portugues para agrupar temas y medir la frecuencia de cada categoria de queja.
- Enrutamiento en un sistema de helpdesk: como componente de un flujo mayor, el modelo actua como clasificador de primera etapa que decide si un ticket se resuelve con respuestas automaticas o requiere agente humano.
- Etiquetado asistido para anotacion: usar las predicciones del modelo como preetiquetas en una herramienta de anotacion, acelerando la construccion de un dataset supervisado de mayor calidad.
- Filtrado de resenas o comentarios: clasificar opiniones de usuarios en categorias de sentimiento o tematica dentro de un panel de monitorizacion de la experiencia del cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo para los pesos (108,9 M de parametros x 4 bytes), mas memoria para activaciones y el tokenizador; en la practica, menos de 1 GB para lotes pequenos.
- VRAM estimada en fp16: aproximadamente 0,22 GB para los pesos, con un pico de memoria inferior a 1 GB en inferencia por lotes.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia por lotes con holgura. Tambien es viable en CPU para volumenes moderados.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, `text-embeddings-inference` (segun las etiquetas del repositorio), servidores de inferencia compatibles con endpoints de Hugging Face y exportacion a ONNX si se necesita optimizar en CPU.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fehhmont/classificador-suporte-ifood | 108,9 M | no disponible | portugues | MIT | Hugging Face, 0 descargas |
| BERTimbau base (neuralmind/bert-base-portuguese-cased) | 109 M aprox. | 512 tokens (estandar BERT) | portugues | MIT | Hugging Face, ampliamente usado |
| BERT base multilingue (bert-base-multilingual-cased) | 178 M aprox. | 512 tokens (estandar BERT) | 104 idiomas | Apache 2.0 | Hugging Face, muy usado |
| DistilBERT multilingue | 135 M aprox. | 512 tokens (estandar) | multilingue | Apache 2.0 | Hugging Face |

La comparativa se limita a arquitecturas y datos publicos de los modelos alternativos; no hay datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa. BERTimbau es la alternativa natural para portugues por su preentrenamiento especifico en ese idioma, mientras que el modelo multilingue de Google ofrece mayor cobertura linguistica a costa de mas parametros.

## Limitaciones y advertencias

- La model card es la plantilla autogenerada de Hugging Face y no contiene informacion sustantiva sobre el modelo, el dataset ni la evaluacion; cualquier uso en produccion requiere una validacion propia.
- No se documentan sesgos conocidos, pero al ser un fine-tuning sin datos publicados no es posible auditar la representatividad del corpus de entrenamiento ni el equilibrio entre clases.
- Riesgo de alucinacion no aplicable en sentido estricto (no es un modelo generativo), pero si riesgo de clasificaciones erroneas con alta confianza en entradas fuera de distribucion.
- El alcance linguistico declarado es solo portugues; el rendimiento en otros idiomas, incluido el castellano, no esta garantizado.
- La licencia MIT permite uso comercial y modificacion, pero no se ofrece ninguna garantia por parte del autor.
- No hay informacion sobre el numero de clases, el esquema de etiquetas ni el formato de salida esperado, lo que obliga a inspeccionar la configuracion del repositorio antes de integrarlo.
- El modelo tiene cero descargas y cero likes, sin senales de validacion por parte de la comunidad.
- No se dispone de informacion sobre la longitud maxima de secuencia configurada; si se supera el limite del tokenizador, las entradas se truncaran silenciosamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fehhmont/classificador-suporte-ifood
- Paper de referencia citado en la model card (Lacoste et al., 2019, impacto medioambiental): https://arxiv.org/abs/1910.09700
- Calculador de impacto medioambiental ML CO2: https://mlco2.github.io/impact
- Documentacion de BERT en transformers: https://huggingface.co/docs/transformers/model_doc/bert
- BERTimbau base (alternativa en portugues): https://huggingface.co/neuralmind/bert-base-portuguese-cased
- BERT base multilingue: https://huggingface.co/google-bert/bert-base-multilingual-cased
