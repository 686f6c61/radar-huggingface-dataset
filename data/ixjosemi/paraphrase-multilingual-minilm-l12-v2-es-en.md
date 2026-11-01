# ixjosemi/paraphrase-multilingual-MiniLM-L12-v2-es-en

## Resumen

`ixjosemi/paraphrase-multilingual-MiniLM-L12-v2-es-en` es una variante optimizada del modelo de embeddings de frases `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, distribuida en formato ONNX y pensada para ejecutarse en el navegador o en Node.js mediante transformers.js. El autor, ixjosemi, no reentrena el modelo: recorta su vocabulario de 250.002 a 53.299 tokens para cubrir exclusivamente texto en espanol e ingles, manteniendo intactos los pesos del resto de la red.

El problema que resuelve es de eficiencia en el despliegue. En un modelo de embeddings de este tamano, la tabla de embeddings del vocabulario concentra buena parte del consumo de memoria una vez cargado el modelo. Al eliminar los tokens de idiomas no soportados, el proceso que carga el modelo con transformers.js pasa de unos 870 MB a unos 440 MB, y los ficheros del repositorio bajan de 129 MB a 43 MB.

Es relevante para aplicaciones de busqueda semantica y similitud de frases en espanol e ingles que necesitan ejecutarse en entornos con recursos limitados (navegador, edge, contenedores pequenos) sin renunciar a la calidad de los embeddings del modelo original. El autor lo emplea en la busqueda de la base de conocimiento de su proyecto Arche.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (MiniLM-L12), encoder de frases; exportacion ONNX |
| Parametros totales | no disponible (modelo base MiniLM-L12; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base es de 128 tokens de entrada) |
| Tipos de cuantizacion | ONNX q8 (cuantizacion de 8 bits); el autor indica `dtype: 'q8'` en el ejemplo de uso |
| Idiomas soportados | espanol (es) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (repositorio orientado a transformers.js) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer encoder de tipo BERT en su variante MiniLM-L12, entrenado originalmente por sentence-transformers para producir embeddings de frases mediante pooling de la salida del encoder. Esta variante no modifica la arquitectura ni los pesos; solo altera el vocabulario del tokenizador y, en consecuencia, la tabla de embeddings asociada.

El recorte del vocabulario conserva los tokens generados por las 200.000 palabras mas frecuentes del espanol y las 200.000 del ingles (en minuscula, capitalizada y mayuscula, aisladas y pegadas tras otro texto), todos los caracteres latinos, digitos y signos de puntuacion, y los tokens especiales, que mantienen sus ids. Los tokens conservados mantienen su orden, scores y pesos, de modo que un texto cuyos tokens esten todos en el vocabulario recortado obtiene exactamente el mismo embedding que con el modelo original; el resto de textos se fragmenta en piezas mas pequenas que si estan conservadas. Las frecuencias de palabras usadas para elegir el vocabulario provienen de `hermitdave/FrequencyWords` (OpenSubtitles 2018, CC-BY-SA-4.0). No se documenta un entrenamiento adicional ni ajuste fino.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y busqueda vectorial.
- Extraccion de caracteristicas (`feature-extraction`) con pooling medio y normalizacion, segun el ejemplo del autor.
- Soporte nativo de espanol e ingles en el mismo espacio de embeddings (modelo multilingue del que deriva).
- Ejecucion en navegador y en Node.js mediante transformers.js con cuantizacion q8.
- Tokenizacion sin `<unk>` para cualquier texto en alfabeto latino, gracias a la conservacion de caracteres, digitos y puntuacion.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es un encoder de embeddings.

## Casos de uso

- Busqueda semantica en bases de conocimiento bilingues espanol/ingles: el modelo indexa secciones de documentacion y recupera las mas cercanas a una consulta; el autor lo usa exactamente para esto en Arche, con resultados de recuperacion practicamente identicos al modelo original.
- Busqueda en el navegador sin backend: al ejecutarse con transformers.js y q8, permite indexar y consultar contenido local en una aplicacion web sin enviar texto a un servidor.
- Deduplicacion y agrupacion de textos: calcular similitud coseno entre articulos, tickets o descripciones para detectar duplicados en pipelines de datos.
- Clasificacion por similitud zero-shot: comparar un texto contra descripciones de categorias predefinidas y asignar la mas proxima, util en enrutado de tickets o moderacion.
- Sistemas de recomendacion basados en contenido: generar embeddings de items (titulos, resumenes) y recomendar por cercania vectorial en espanol o ingles.
- Deteccion de parafrasis y control de calidad de traducciones: medir la cercania semantica entre un original y su version en el otro idioma soportado.
- Despliegue en entornos con memoria limitada (funciones serverless, contenedores pequenos, edge): el recorte reduce el proceso de ~870 MB a ~440 MB y los ficheros de 129 MB a 43 MB.

## Benchmarks y rendimiento

El autor publica una evaluacion comparativa contra el modelo original sobre una base de conocimiento de 95 articulos en espanol e ingles (892 secciones):

| Metrica | Resultado |
|---|---|
| Similitud coseno media entre embeddings de cada seccion (vs. original) | 0,991 |
| Similitud coseno del 5% inferior | 0,96 |
| Tokens de la base de conocimiento fuera del vocabulario conservado | 0,075% |
| Coincidencia del primer resultado de busqueda (16 consultas) | 16 de 16 |
| Solapamiento del top 5 (16 consultas) | 93% |

No se han publicado resultados en benchmarks estandar (MMLU, MTEB, etc.) en la informacion disponible.

## Requisitos de hardware

- Memoria del proceso con transformers.js: aproximadamente 440 MB con el vocabulario recortado, frente a unos 870 MB del modelo original.
- Tamano de los ficheros del repositorio: 43 MB (frente a 129 MB del original).
- Cabe en GPU consumer de gama baja y en CPU; al ser un encoder MiniLM-L12, la inferencia es ligera y adecuada para navegador.
- Despliegue recomendado: transformers.js con `dtype: 'q8'`; al estar en formato ONNX, tambien puede ejecutarse con ONNX Runtime en servidor.
- VRAM especifica, latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ixjosemi/paraphrase-multilingual-MiniLM-L12-v2-es-en | no disponible (base MiniLM-L12) | no disponible | es, en | Apache 2.0 | ONNX (q8) | Vocabulario recortado; ~440 MB en proceso, 43 MB en disco |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | no disponible (base MiniLM-L12) | no disponible | multilingue (50+ idiomas) | Apache 2.0 | safetensors / PyTorch | Modelo original; mayor cobertura idiomatica y mayor huella de memoria |
| Xenova/paraphrase-multilingual-MiniLM-L12-v2 | no disponible (base MiniLM-L12) | no disponible | multilingue (50+ idiomas) | Apache 2.0 | ONNX | Exportacion ONNX del original; ~870 MB en proceso, 129 MB en disco |

## Limitaciones y advertencias

- Solo cubre espanol e ingles: el texto en otros idiomas se fragmentara en piezas latinas mas pequenas y perdera calidad de embedding respecto al modelo original.
- El 0,075% de los tokens de la base de conocimiento evaluada queda fuera del vocabulario; en dominios con jerga, nombres propios o alfabetos no latinos ese porcentaje puede crecer.
- La calidad de recuperacion no es identica al original: el top 5 coincide en un 93%, por lo que puede haber diferencias en resultados secundarios.
- Es un modelo de embeddings, no generativo: no produce texto ni razona; alucinacion no aplica en el sentido habitual, pero la similitud coseno puede dar falsos positivos en textos cortos o ambiguos.
- No se documentan sesgos especificos; al derivar de un modelo entrenado con datos web multilingues, hereda los sesgos del modelo base.
- Licencia Apache 2.0, que permite uso comercial; las listas de frecuencias usadas para el recorte son CC-BY-SA-4.0, aunque el autor indica que no se incluyen en el repositorio.
- El repositorio tiene muy poca adopcion (129 descargas, 0 likes) y una unica evaluacion interna del autor; conviene validar en el dominio propio antes de produccion.
- No se publican datos de contexto maximo ni de parametros totales en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ixjosemi/paraphrase-multilingual-MiniLM-L12-v2-es-en
- Modelo base (exportacion ONNX): https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2
- Modelo original: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Proyecto Arche: https://github.com/peaberry-studio/arche
- Script de recorte reproducible: https://github.com/peaberry-studio/arche/blob/main/scripts/trim-kb-search-model.py
- Frecuencias de palabras: https://github.com/hermitdave/FrequencyWords
