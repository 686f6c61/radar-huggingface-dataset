# ilkerkara/yilki-izci-wikiner-100m

## Resumen

yilki-izci-wikiner-100m es un modelo de reconocimiento de entidades nombradas (NER) para turco, desarrollado por el usuario ilkerkara dentro de la familia Yılkı. Se trata de un ajuste fino del modelo base ilkerkara/yilki-kulun-100m (100 millones de parametros, preentrenado con 2.000 millones de tokens), especializado en la deteccion de 19 tipos de entidades sobre texto de Wikipedia en turco (WikiNER-TR). El modelo resuelve la tarea de token classification con etiquetado BIO y 39 etiquetas en total.

El modelo es relevante como ejemplo de ajuste fino de un transformer pequeno y abierto para una tarea concreta de PLN en un idioma de recursos medios como el turco, con dos semillas de entrenamiento publicadas y resultados de test reportados de forma transparente. No obstante, sus propios resultados lo sitúan por detras de referencias multilingues y especificas del turco (XLM-R, mBERT, ConvBERT, BERTurk, ModernBERT-tr) en el mismo protocolo.

La ficha se basa exclusivamente en la model card y los metadatos de Hugging Face. No se dispone de informacion adicional sobre arquitectura interna, composicion exacta del corpus de preentrenamiento ni detalles de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (token classification); detalles internos no disponibles |
| Parametros totales | 100.124.199 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con longitud maxima 256) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors (libreria transformers, requiere trust_remote_code) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (sin congelar el backbone) del modelo base Yılkı Kulun 100M 2B, un transformer de 100 millones de parametros preentrenado con 2.000 millones de tokens sobre FineWeb-2 (licencia ODC-BY 1.0). La cabeza de clasificacion de tokens se entrena especificamente para la tarea NER sobre el dataset turkish-wikiNER, compuesto por 17.967 documentos de entrenamiento y 1.000 de test. El etiquetado sigue el esquema BIO con 39 etiquetas que cubren 19 tipos de entidad (CARDINAL, DATE, EVENT, FAC, GPE, LANGUAGE, LAW, LOC, MONEY, NORP, ORDINAL, ORG, PERCENT, PERSON, PRODUCT, QUANTITY, TIME, TITLE, WORK_OF_ART).

El protocolo de entrenamiento emplea learning rate de 4e-4 para la tarea NER, 4e-3 para la cabeza, programacion coseno, calentamiento del 10 %, 3 epocas y longitud maxima de 256 tokens. Se publican dos semillas (0 en el directorio raiz y 1 en el subdirectorio `tohum-1/`). No se menciona uso de RLHF, DPO ni tecnicas de decodificacion especulativa; la innovacion principal es la publicacion de resultados con dos semillas para evaluar la varianza.

## Capacidades

- Reconocimiento de entidades nombradas en turco sobre 19 tipos de entidad con etiquetado BIO.
- Deteccion de entidades numericas y temporales: CARDINAL, ORDINAL, QUANTITY, PERCENT, MONEY, DATE, TIME.
- Deteccion de entidades geograficas y politicas: GPE, LOC, FAC, NORP.
- Deteccion de entidades organizativas y de producto: ORG, PRODUCT, EVENT, LAW, LANGUAGE, TITLE, WORK_OF_ART.
- Deteccion de personas (PERSON).
- Salida a nivel de token, apta para pipelines de extraccion de informacion.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue: no; solo turco.

## Casos de uso

- Extraccion de entidades en articulos de Wikipedia turca: el modelo identifica personas, organizaciones y lugares en textos enciclopedicos, que es exactamente la distribucion del corpus de entrenamiento (WikiNER-TR).
- Construccion de grafos de conocimiento: a partir de las entidades y sus tipos se pueden poblar bases de datos de relaciones para busqueda semantica o recomendacion.
- Enriquecimiento de corpus periodisticos en turco: deteccion de nombres propios, fechas y cantidades para indexacion y analisis de contenido.
- Anonimizacion asistida de documentos: la etiqueta PERSON permite localizar menciones a personas antes de un proceso de redaccion, con revision humana obligatoria por el riesgo de falsos negativos.
- Preprocesado para sistemas de respuesta a preguntas: identificar entidades en el contexto antes de aplicar un modelo generativo o de recuperacion.
- Etiquetado semiautomatico de datos: uso del modelo para preanotar corpus turcos y acelerar la creacion de datasets NER revisados por anotadores humanos.
- Analisis de documentos legales o administrativos en turco: extraccion de ORG, LAW y DATE para clasificacion y trazabilidad documental.

## Benchmarks y rendimiento

Resultados en el conjunto de test de WikiNER-TR con el protocolo del autor:

| Modelo | Test F1 |
|---|---|
| yilki-izci-wikiner-100m (semilla 0) | 0,7045 |
| yilki-izci-wikiner-100m (semilla 1) | 0,6999 |
| yilki-izci-wikiner-100m (media) | 0,702 |
| ConvBERT | 0,781 |
| XLM-R | 0,776 |
| mBERT | 0,774 |
| ModernBERT-tr | 0,766 |
| BERTurk | 0,759 |

El autor advierte que estas cifras se han medido con su propio protocolo y no deben compararse de forma literal con numeros publicados en otros trabajos. El modelo queda entre 0,06 y 0,08 puntos de F1 por detras de las referencias.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,4 GB solo de pesos; en fp16, unos 0,2 GB. La memoria real depende del tamano de lote y de la longitud de secuencia.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para volumenes moderados.
- GPU recomendadas: no se requieren GPU de datacenter (A100, H100); una GPU consumer es suficiente.
- Opciones de despliegue: transformers con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. Dado el requisito de codigo personalizado, la via mas directa es la API de transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 (test, protocolo del autor) | Licencia |
|---|---|---|---|---|
| yilki-izci-wikiner-100m | 100 M | no disponible | 0,702 | cc-by-sa-4.0 |
| BERTurk | no disponible | no disponible | 0,759 | no disponible |
| XLM-R | no disponible | no disponible | 0,776 | no disponible |
| mBERT | no disponible | no disponible | 0,774 | no disponible |
| ConvBERT | no disponible | no disponible | 0,781 | no disponible |
| ModernBERT-tr | no disponible | no disponible | 0,766 | no disponible |

Los datos de parametros, contexto y licencia de los modelos de referencia no se detallan en la informacion proporcionada; solo se dispone de sus puntuaciones F1 bajo el protocolo del autor.

## Limitaciones y advertencias

- Solo funciona en turco; el rendimiento cae fuera del dominio de Wikipedia, en lenguaje coloquial o en textos muy cortos.
- El F1 de 0,702 esta por debajo de las alternativas de referencia en el mismo protocolo; no es la mejor opcion para produccion si la precision es critica.
- Las metricas provienen de un unico conjunto de test de 1.000 documentos, con intervalos de confianza amplios.
- El modelo base se entreno con datos web y puede arrastrar sesgos y contener informacion incorrecta.
- Riesgo de reproduccion de datos personales: el autor indica que aproximadamente el 0,8 % de 492 fragmentos de datos personales del corpus de preentrenamiento se reprodujeron literalmente en el modelo base. Si aparecen datos personales en las salidas, no deben usarse ni difundirse.
- Licencia cc-by-sa-4.0 con posible conflicto: el modelo base es Apache-2.0, pero el dataset de ajuste fino es CC-BY-SA-4.0. El autor recomienda una evaluacion juridica propia antes de distribuirlo, especialmente para uso comercial.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar el codigo antes de desplegarlo.
- Sin datos publicados sobre cuantizacion, latencia ni integracion con servidores de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ilkerkara/yilki-izci-wikiner-100m
- Modelo base: https://huggingface.co/ilkerkara/yilki-kulun-100m
- Dataset de entrenamiento: https://huggingface.co/datasets/turkish-nlp-suite/turkish-wikiNER
