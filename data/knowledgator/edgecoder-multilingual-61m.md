# knowledgator/EdgeCoder-Multilingual-61M

## Resumen

EdgeCoder-Multilingual-61M es un codificador de texto multilingue compacto desarrollado por Knowledgator Engineering, disenado para extraccion de caracteristicas y ajuste fino en tareas de clasificacion y generacion de embeddings. Se basa en la arquitectura DeBERTa-v2 (con atencion relativa desacoplada y sin posiciones absolutas) y emplea un esquema de preentrenamiento denominado ModernELECTRA, que combina la deteccion de tokens reemplazados (RTD) propia de ELECTRA y DeBERTaV3 con una tarea adicional de reconstruccion de ventana de frontera. El modelo se distribuye bajo licencia Apache 2.0 y esta pensado para entornos con recursos limitados, ya que su tamano es aproximadamente la mitad que el de otros codificadores multilingues pequenos (118M a 141M parametros).

El modelo cubre 46 idiomas, con el ingles como lengua dominante (alrededor del 47% de los tokens de preentrenamiento) y el resto muestreados de forma proporcional a la raiz cuadrada de los datos disponibles por idioma. Soporta una longitud de contexto de hasta 8192 tokens, lo que lo hace adecuado para tareas de clasificacion y recuperacion sobre documentos largos. El checkpoint publicado contiene unicamente el codificador discriminador, sin cabeza de modelado de lenguaje enmascarado, por lo que esta orientado a ajuste fino y extraccion de caracteristicas, no a fill-mask.

Su relevancia actual radica en que los codificadores basados en RTD suelen ser fuertes en clasificacion pero debiles como backbone para modelos de embeddings; este modelo pretende conservar la calidad de clasificacion del RTD y, al mismo tiempo, ser ajustable como modelo de embeddings, todo ello con un coste computacional reducido. La version en ingles, EdgeCoder-31M, se publica por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (atencion relativa desacoplada, sin posiciones absolutas) |
| Parametros totales | 141.992.809 (dato del repositorio safetensors); la model card declara 61,0M para el encoder (28,4M sin la tabla de embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 46 idiomas: arabe, bielorruso, bengali, bosnio, bulgaro, chino mandarin, croata, checo, danes, neerlandes, ingles, estonio, finlandes, frances, aleman, griego, hebreo, hindi, hungaro, indonesio, irlandes, italiano, japones, coreano, latin, leton, lituano, macedonio, malayo, maltes, noruego bokmal, polaco, portugues, rumano, ruso, serbio, eslovaco, esloveno, espanol, suajili, sueco, turco, ucraniano, urdu, vietnamita, yidis |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos tecnicos: 16 capas, hidden de 384, FFN de 1536, 6 cabezas de atencion; embedding de tokens factorizado (tabla de 128 dimensiones con proyeccion lineal a 384); tokenizador mDeBERTa-v3 SentencePiece con 251.000 tokens; tamano del repositorio de 0,3 GB.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DeBERTa-v2, que sustituye las posiciones absolutas por atencion relativa desacoplada, y consta de 16 capas con hidden de 384, FFN de 1536 y 6 cabezas de atencion. La tabla de embeddings de tokens esta factorizada: una tabla de 128 dimensiones se proyecta linealmente a 384, lo que reduce el numero de parametros asociados al vocabulario de 251.000 tokens del tokenizador mDeBERTa-v3 SentencePiece.

El preentrenamiento utiliza ModernELECTRA, un esquema de deteccion de tokens reemplazados (RTD) al estilo de ELECTRA y DeBERTaV3, complementado con una tarea de reconstruccion de ventana de frontera. El objetivo declarado es conservar la calidad de clasificacion propia de los codificadores RTD y, a la vez, producir un backbone apto para ajuste fino como modelo de embeddings. La distribucion de datos de preentrenamiento asigna al ingles cerca del 47% de los tokens, mientras que el resto de idiomas se muestrea con participaciones proporcionales a la raiz cuadrada de sus datos disponibles. El modelo se entreno con los kernels de FlashDeBERTa, una implementacion de atencion eficiente en memoria que se recomienda tambien para inferencia con entradas largas, ya que la atencion estandar de DeBERTa escala de forma cuadratica con la longitud de secuencia.

## Capacidades

- Extraccion de caracteristicas: genera representaciones contextuales de 384 dimensiones por token a partir de entradas de hasta 8192 tokens.
- Clasificacion de secuencias: ajustable con `AutoModelForSequenceClassification` para tareas como analisis de sentimiento, deteccion de temas o clasificacion de documentos.
- Clasificacion de tokens: ajustable con `AutoModelForTokenClassification` para etiquetado de secuencias, reconocimiento de entidades nombradas y tareas similares.
- Question answering y multiple choice: FlashDeBERTa proporciona cabezas especificas para estas tareas sobre el mismo checkpoint.
- Generacion de embeddings: el modelo esta disenado para poder ajustarse como modelo de embeddings, a diferencia de otros codificadores RTD.
- Multilingue: cobertura de 46 idiomas, con transferencia cross-lingual zero-shot evaluada en XTREME.
- Contexto largo: ventana de 8192 tokens, con soporte recomendado mediante FlashDeBERTa para evitar el crecimiento cuadratico de memoria.
- Sin tool calling ni capacidades de agente: es un encoder, no un modelo generativo; no soporta function calling ni razonamiento multi-paso.
- Sin modo thinking, vision ni audio.

## Casos de uso

- Clasificacion de documentos multilingues: ajuste fino con `AutoModelForSequenceClassification` para categorizar tickets, correos o articulos en cualquiera de los 46 idiomas soportados, aprovechando la transferencia cross-lingual zero-shot evaluada en XTREME.
- Reconocimiento de entidades nombradas (NER): ajuste fino con `AutoModelForTokenClassification` para extraer personas, organizaciones y lugares en textos multilingues, con un coste de inferencia bajo gracias a sus 61M parametros de encoder.
- Recuperacion semantica y busqueda: ajuste como modelo de embeddings para indexar y recuperar documentos, con la ventaja de una ventana de 8192 tokens que permite codificar pasajes largos sin truncamiento agresivo.
- Moderacion de contenido: clasificacion de mensajes en multiples idiomas en entornos con recursos limitados, donde un encoder de 61M parametros puede desplegarse en CPU o en GPU de gama baja.
- Analisis de resenas y encuestas: clasificacion de sentimiento y deteccion de temas sobre resenas de producto en varios idiomas, con ajuste fino sobre datos etiquetados en ingles y evaluacion en el resto de lenguas.
- Question answering extractivo: uso de las cabezas de FlashDeBERTa para localizar respuestas en pasajes largos, util en asistentes de documentacion tecnica o bases de conocimiento internas.
- Procesamiento en el borde (edge): despliegue en dispositivos con memoria limitada para tareas de clasificacion en tiempo real, dado el reducido tamano del checkpoint (0,3 GB en el repositorio).

## Benchmarks y rendimiento

Resultados de GLUE (dev, ingles), segun el paper, con una sola semilla y la mejor ejecucion de un barrido de hiperparametros que sigue el protocolo Ettin:

| Modelo | Parametros | CoLA | SST-2 | MRPC | STS-B | QQP | MNLI | QNLI | RTE | Media |
|---|---|---|---|---|---|---|---|---|---|---|
| mDistilBERT | 134,7M | 34,7 | 89,4 | 90,5 | 87,5 | 86,6 | 79,0 | 87,5 | 73,3 | 77,5 |
| Multilingual MiniLM | 117,7M | 25,4 | 91,6 | 91,3 | 88,6 | 87,7 | 82,1 | 89,7 | 75,8 | 78,3 |
| mmBERT-small | 140,5M | 61,8 | 93,1 | 91,6 | 90,3 | 88,6 | 85,8 | 91,9 | 81,9 | 84,7 |
| EdgeCoder-Multilingual-61M | 61,0M | 58,3 | 91,4 | 92,1 | 90,2 | 91,5 | 84,8 | 91,2 | 81,6 | 85,1 |

Resultados de XTREME (transferencia cross-lingual zero-shot) en los 26 idiomas de XTREME sobre los que el modelo fue preentrenado:

| Modelo | Parametros | XNLI | PAWS-X | XCOPA | XQuAD | MLQA | TyDiQA | WikiANN | UDPOS | Media |
|---|---|---|---|---|---|---|---|---|---|---|
| mDistilBERT | 134,7M | 60,8 | 79,6 | 53,5 | 50,1 | 45,5 | 40,3 | 59,7 | 72,5 | 57,7 |
| Multilingual MiniLM | 117,7M | 71,1 | 83,2 | 58,8 | 67,2 | 61,1 | 58,5 | 58,9 | 79,4 | 67,3 |
| mmBERT-small | 140,5M | 73,8 | 85,4 | 62,8 | 73,0 | 66,2 | 66,8 | 59,4 | 72,4 | 70,0 |
| EdgeCoder-Multilingual-61M | 61,0M | 71,5 | 83,5 | 59,1 | 69,4 | 62,0 | 62,0 | 57,4 | 77,9 | 67,8 |

La model card menciona tambien una evaluacion sobre todos los idiomas de XTREME, incluidos 16 que el modelo nunca vio, pero la tabla correspondiente aparece truncada en la informacion disponible; no se reproducen sus cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 0,3 GB en el repositorio; en precision FP32 el encoder de 61M parametros requiere aproximadamente 0,25 GB de pesos, y en FP16 alrededor de 0,13 GB. La memoria adicional depende de la longitud de secuencia y del batch.
- GPU recomendadas: cualquier GPU moderna es suficiente; para secuencias de 8192 tokens se recomienda usar FlashDeBERTa para evitar el crecimiento cuadratico de memoria de la atencion estandar. GPU de clase A100 o H100 solo serian necesarias para lotes grandes o entrenamiento.
- Cabe en GPU de consumo: si, en tarjetas como RTX 4090, RTX 3090 o incluso modelos con 8 GB de VRAM, siempre que se gestione la longitud de secuencia.
- Opciones de despliegue: `transformers` con `AutoModel`; FlashDeBERTa (`pip install flashdeberta`) para inferencia eficiente y cabezas de clasificacion, question answering y multiple choice; el tag `text-embeddings-inference` sugiere compatibilidad con TEI; tambien aparece el tag `endpoints_compatible`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GLUE (media) | XTREME (media, 26 idiomas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EdgeCoder-Multilingual-61M | 61,0M | 8192 | 85,1 | 67,8 | Apache 2.0 | Hugging Face |
| mDistilBERT | 134,7M | no disponible | 77,5 | 57,7 | no disponible | Hugging Face |
| Multilingual MiniLM | 117,7M | no disponible | 78,3 | 67,3 | no disponible | Hugging Face |
| mmBERT-small | 140,5M | no disponible | 84,7 | 70,0 | no disponible | Hugging Face |

El modelo logra la mejor media en GLUE con aproximadamente la mitad de parametros que sus competidores, y queda cerca de mmBERT-small en XTREME pese a su menor tamano. La comparativa se limita a los datos publicados en la model card; no se dispone de informacion sobre contexto, licencia ni disponibilidad de los modelos alternativos mas alla de lo indicado.

## Limitaciones y advertencias

- No es un modelo generativo: el checkpoint contiene solo el encoder discriminador, sin cabeza de modelado de lenguaje enmascarado; no sirve para fill-mask ni para generacion de texto.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; al ser un modelo multilingue entrenado con datos web, es probable que herede sesgos de esos datos, pero no se aportan detalles.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero las cabezas de clasificacion y QA pueden producir predicciones erroneas con alta confianza en dominios alejados de los datos de entrenamiento.
- Limitaciones de contexto: la ventana es de 8192 tokens, pero la atencion estandar de DeBERTa escala de forma cuadratica con la longitud; sin FlashDeBERTa, las secuencias largas pueden agotar la memoria.
- Limitaciones de idioma: aunque se declaran 46 idiomas, el ingles representa cerca del 47% de los tokens de preentrenamiento; el rendimiento en lenguas con pocos datos puede ser inferior, y 16 idiomas de XTREME no se vieron durante el preentrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datos de preentrenamiento, no detalladas en la informacion disponible.
- Caveat para produccion: los resultados de benchmarks son de una sola semilla y con la mejor ejecucion de un barrido de hiperparametros, por lo que pueden no reflejar el rendimiento medio esperado; conviene validar en el dominio concreto antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/knowledgator/EdgeCoder-Multilingual-61M
- Version en ingles (EdgeCoder-31M): https://huggingface.co/knowledgator/EdgeCoder-31M
- Repositorio FlashDeBERTa: https://github.com/Knowledgator/FlashDeBERTa
- Knowledgator Engineering: https://knowledgator.com
- Paper (ModernELECTRA): referencia arXiv:2611.31495; el enlace directo figura como pendiente en la model card.
