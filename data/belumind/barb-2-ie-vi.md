# belumind/barb-2-ie-vi

## Resumen

barb-2-ie-vi es un modelo de extracción conjunta de entidades y relaciones para vietnamita, desarrollado por belumind y publicado en HuggingFace con licencia Apache 2.0. Se construye sobre la arquitectura GLiNER (un encoder transformer con cabezas de clasificación de tokens que permite definir las etiquetas de entidades en tiempo de inferencia mediante prompting) y es un ajuste fino de knowledgator/gliner-relex-large-v1.0. Con 466.576.896 parámetros, pertenece a la variante "large" de la familia GLiNER y está especializado en un esquema de 10 tipos de entidad y 18 relaciones.

El problema que aborda es concreto: en GLiNER, las etiquetas de relación se codifican junto a las de entidad y la cabeza de entidades acaba dependiendo de ellas. En el modelo anterior de la misma serie (barb-1), llamar al modelo solo con etiquetas de entidad y una relación de relleno costaba 6,17 puntos de F1. barb-2 reduce esa brecha a 2,27 puntos, porque durante el entrenamiento se eliminaron las relaciones del 30 % de los ejemplos, forzando al modelo a localizar entidades sin ese contexto. Además de la mejora en calidad, esto tiene un efecto directo en el coste computacional: pasar 18 etiquetas de relación consume el 35 % del throughput (46,0 frente a 71,3 frases por segundo en una A100, fp32, batch 16).

La relevancia del modelo es doble. Por un lado, ofrece extracción de información conjunta (entidades y relaciones) en un idioma con relativamente pocos recursos como el vietnamita, con resultados auditados manualmente sobre 450 frases y 1.328 spans. Por otro lado, documenta de forma inusualmente transparente sus compromisos: gana 3,96 puntos de F1 en la llamada de solo entidades respecto a barb-1, empata en la llamada completa (+0,08) y cede 1,32 puntos en relaciones estrictas (intervalo de confianza que incluye el cero). El repositorio no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional con cabezas de clasificacion de tokens (familia GLiNER, variante large); extraccion conjunta de entidades y relaciones |
| Parametros totales | 466.576.896 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos en fp32 (model.safetensors y pytorch_model.bin, byte-identicos) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y pytorch_model.bin (PyTorch binario), byte-identicos |

Otros datos: biblioteca `gliner` (probado con `gliner==0.2.29`), pipeline `token-classification`, tamano del repositorio 3,7 GB, creado y actualizado el 21 de septiembre de 2026.

## Arquitectura y entrenamiento

barb-2-ie-vi sigue la receta de barb-1: ajuste fino supervisado desde knowledgator/gliner-relex-large-v1.0 durante 8.910 pasos, manteniendo las frases limpias y anadiendo copias degradadas junto a ellas. La unica modificacion respecto a barb-1 es que se eliminaron las relaciones del 30 % de los ejemplos de entrenamiento, de modo que el modelo tuvo que aprender a encontrar entidades sin esa senal en una parte de las iteraciones. El porcentaje del 30 % es un valor ajustado experimentalmente, no arbitrario: con el 50 % la ganancia en la llamada de solo entidades sube a 73,97 de F1, pero las relaciones caen a 60,53, un coste que los autores consideraron excesivo. El compromiso es continuo y la proporcion de la mezcla actua como dial.

La arquitectura es la de GLiNER: un encoder de texto que codifica tanto la entrada como las cadenas de las etiquetas proporcionadas por el usuario, y cabezas de clasificacion de tokens que puntuan spans candidatos. Esto implica que las etiquetas son, en si mismas, texto en vietnamita procesado por el mismo encoder, con las consecuencias practicas que se detallan en limitaciones. El repositorio incluye ademas un modulo auxiliar `barb_labels.py` con las funciones `extract`, la lista `ENTITY_LABELS` y una funcion `check_labels()` que lanza excepcion si detecta una etiqueta conocida sin diacriticos y avisa si contiene guiones bajos. Se trata de un modelo puramente extractivo: no genera texto libre ni incorpora un modo de razonamiento.

## Capacidades

- Deteccion conjunta de entidades nombradas y relaciones en vietnamita sobre un esquema fijo de 10 tipos de entidad: ngay, dia diem, van ban, to chuc, nguoi, tac pham, giai thuong, san pham, chuc vu y su kien.
- Extraccion de 18 tipos de relacion en la llamada completa.
- Llamada de solo entidades con coste reducido: la brecha respecto a la llamada completa es de 2,27 puntos de F1, frente a 6,17 en barb-1.
- Extraccion sin necesidad de conocer ni enumerar las relaciones, con solo pasar una etiqueta de relleno.
- Salida con claves en snake_case ASCII mediante la opcion `json_keys=True`, que mapea las etiquetas con diacriticos a claves compatibles con JSON.
- Robustez parcial ante texto degradado: mantiene 62,34 de F1 con diacriticos eliminados y 54,65 con texto en mayusculas.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de pensamiento.

## Casos de uso

- Construccion de grafos de conocimiento en vietnamita: el modelo extrae entidades y relaciones en una sola pasada, de modo que la salida se puede volcar directamente como tripletas (sujeto, relacion, objeto) en una base de datos de grafo para enriquecer un indice documental.
- Analisis de prensa y seguimiento de medios: sobre articulos vietnamitas se pueden aislar de forma automatica organizaciones, personas, lugares y fechas, con una precision alta en tipos frecuentes (ngay 96,6 de F1, dia diem 81,7, van ban 80,0) para alimentar cuadros de mando de monitorizacion.
- Enriquecimiento de repositorios documentales y bibliotecas digitales: los tipos to chuc, nguoi y dia diem permiten etiquetar automaticamente colecciones de documentos y habilitar busqueda facetada por entidad.
- Procesamiento de alto volumen con presupuesto de computo ajustado: si el pipeline solo necesita entidades, omitir las 18 etiquetas de relacion multiplica el rendimiento hasta 71,3 frases por segundo en una A100 (fp32, batch 16), frente a 46,0 con la llamada completa, lo que abarata el coste por documento en tareas de indexacion masiva.
- Desambiguacion de menciones en sistemas de busqueda: la extraccion de relaciones estrictas (62,14 de F1) permite vincular personas con organizaciones, cargos o eventos, mejorando el ranking de resultados frente a una busqueda puramente lexica.
- Extraccion sobre texto normalizado o mal digitalizado: el modelo conserva 54,65 de F1 con entrada en mayusculas y 62,34 sin diacriticos, util para corpus procedentes de OCR o de sistemas antiguos que no preservan la acentuacion.
- Preanotacion para anotacion humana: con umbrales de precision alta (0,70 en entidades, 0,50 y 0,60 para entidades y relaciones respectivamente) se puede generar una primera capa de anotaciones que los linguistas revisan, reduciendo el coste de crear corpus etiquetados en vietnamita.
- Analisis de contratos, licitaciones o expedientes administrativos: los tipos van ban y ngay tienen un F1 de 80,0 y 96,6, lo que permite extraer referencias normativas y plazos temporales de documentos oficiales.

## Benchmarks y rendimiento

Evaluacion propia sobre 450 frases y 1.328 spans, auditadas manualmente. Cada fila se mide en su propio umbral optimo. Comparativa barb-1 frente a barb-2:

| Escenario (F1) | barb-1 | barb-2 |
|---|---|---|
| Texto limpio | 74,80 | 74,87 |
| Llamada solo entidades | 68,63 | 72,60 |
| Sin diacriticos | 63,25 | 62,34 |
| Todo en mayusculas | 56,06 | 54,65 |
| Relaciones (estricto) | 63,41 | 62,14 |
| Fronteras de cargos (55 spans) | 16 exactos, F1 23,36 | 17 exactos, F1 27,64 |

Bootstrap emparejado, barb-2 menos barb-1 sobre 450 frases:

| Medicion | Delta | IC 95 % | Remuestreos positivos |
|---|---|---|---|
| NER solo entidades | +3,96 | [+2,66, +5,43] | 100 % |
| NER llamada completa | +0,08 | [-0,86, +1,02] | 57 % |
| Relaciones (estricto) | -1,32 | [-3,93, +1,36] | 17 % |

Rendimiento por tipo de entidad en umbral 0,65:

| Tipo | Precision | Exhaustividad | F1 |
|---|---|---|---|
| ngay | 95,3 | 97,8 | 96,6 |
| dia diem | 84,2 | 79,3 | 81,7 |
| van ban | 92,3 | 70,6 | 80,0 |
| to chuc | 83,7 | 63,6 | 72,3 |
| nguoi | 69,8 | 70,0 | 69,9 |
| tac pham | 70,6 | 37,5 | 49,0 |
| giai thuong | 41,2 | 25,0 | 31,1 |
| san pham | 46,2 | 23,1 | 30,8 |
| chuc vu | 71,4 | 15,2 | 25,0 |
| su kien | 22,2 | 11,1 | 14,8 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 1,87 GB (466,6 M de parametros x 4 bytes). El repositorio ocupa 3,7 GB porque incluye dos copias identicas de los pesos en formatos distintos.
- Pesos en fp16 o bf16: aproximadamente 0,93 GB (estimacion a partir del numero de parametros; no es una medida publicada por el autor).
- Pesos en int8: aproximadamente 0,47 GB (estimacion). No se documentan versiones cuantizadas oficiales ni ficheros GGUF.
- Consumo total en inferencia: con fp16 y lotes pequenos deberia caber en GPUs consumer desde 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070). En fp32 el uso ronda los 2-3 GB mas activaciones, por lo que tambien entra en GPUs de 8-12 GB.
- GPU de referencia en las mediciones del autor: una A100, fp32, batch 16.
- Throughput medido: 71,3 frases por segundo con la llamada de solo entidades y 46,0 frases por segundo con las 18 etiquetas de relacion (la inclusion de relaciones cuesta un 35 % del rendimiento).
- Despliegue: la via documentada es la libreria `gliner` (version 0.2.29) sobre PyTorch, con `GLiNER.from_pretrained("belumind/barb-2-ie-vi").to("cuda")`.
- Opciones como vLLM, llama.cpp, Ollama, TGI u ONNX Runtime: no documentadas en la informacion disponible.
- Latencia por frase no publicada de forma desagregada; puede derivarse del throughput (aproximadamente 14 ms por frase solo entidades y 22 ms por frase con relaciones en la configuracion medida).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 llamada completa | F1 solo entidades | Relaciones (estricto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| barb-2-ie-vi | 466,6 M | no disponible | 74,87 | 72,60 | 62,14 | Apache 2.0 | HuggingFace, biblioteca gliner |
| barb-1 (misma serie) | no disponible | no disponible | 74,80 | 68,63 | 63,41 | no disponible | HuggingFace |
| knowledgator/gliner-relex-large-v1.0 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | HuggingFace, modelo base |

Notas sobre la comparacion: barb-2 mejora a barb-1 en 3,96 puntos de F1 cuando solo se piden entidades (intervalo de confianza estrictamente positivo), empata en la llamada completa (+0,08, intervalo que incluye el cero) y cede 1,32 puntos en relaciones estrictas (intervalo que incluye el cero). En texto degradado barb-1 sigue siendo ligeramente mejor (63,25 frente a 62,34 sin diacriticos; 56,06 frente a 54,65 en mayusculas). En el subconjunto de fronteras de cargos, barb-2 obtiene 17 aciertos exactos sobre 55 frente a 16 de barb-1 y 16 del modelo base en el mismo umbral. No se dispone de datos comparativos con otros modelos de extraccion de informacion en vietnamita.

## Limitaciones y advertencias

- Los cinco tipos de entidad raros rinden mal, y el fallo es de exhaustividad, no de precision: su kien 14,8 de F1, chuc vu 25,0, san pham 30,8, giai thuong 31,1 y tac pham 49,0. La causa esta medida: el 96 % de los spans de entrenamiento pertenecen a los cuatro tipos frecuentes, que ocupan de 2,2 a 3,4 tokens de media, mientras que los tipos debiles son los de span mas largo del esquema. El modelo aprendio una preferencia por spans cortos.
- Se probaron y descartaron seis correcciones baratas para ese problema (umbrales por tipo, dos tipos de postprocesado de fronteras, un cambio de inicializacion, una hipotesis de falsos negativos y sobremuestreo x8); ninguna supero una prueba con datos reservados. Los autores estiman que harian falta unas 3.000 anotaciones nuevas o una funcion de perdida sensible a la longitud.
- Los cargos (chuc vu) son especialmente problematicos: solo 17 de 55 fronteras correctas en el conjunto de referencia, mejor que barb-1 (16) y que el modelo base (16), pero bajo en terminos absolutos.
- Ligero retroceso respecto a barb-1 en texto degradado (62,34 frente a 63,25 sin diacriticos; 54,65 frente a 56,06 en mayusculas). Si el pipeline siempre pasa la lista completa de relaciones y la entrada carece de diacriticos, barb-1 sigue siendo la opcion preferible.
- Las etiquetas deben conservar sus diacriticos. Puesto que GLiNER codifica la cadena de la etiqueta con el mismo encoder que el texto, una etiqueta sin diacriticos degrada el resultado de forma silenciosa: pasar "to chuc" en ASCII cuesta 35,0 puntos de F1 y "to_chuc" en snake_case ASCII cuesta 45,2 (medido sobre barb-1 en umbral 0,65). `check_labels()` ayuda a detectarlo.
- La ganancia de las relaciones reales no se explica por la longitud del prompt: 18 etiquetas sin sentido puntuan 69,1 y 18 etiquetas desordenadas 68,6, frente a 74,8 de la lista real. El contenido semantico importa.
- El modelo es extractivo, por lo que no genera texto libre ni puede alucinar contenido fuera de los spans de entrada; el riesgo equivalente es la produccion de spans espurios (precision del 22,2 en su kien, por ejemplo) en textos con vocabulario alejado del dominio de entrenamiento.
- La cobertura linguistica se limita al vietnamita. No se documenta ningun otro idioma ni capacidad de traduccion.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar el aviso de licencia y el archivo de cambios. No se imponen restricciones adicionales conocidas.
- El modelo tiene 0 descargas y 0 "likes" en el momento de la consulta y fue publicado en septiembre de 2026, por lo que carece de validacion independiente por parte de terceros.
- El rendimiento cae de forma notable al anadir las relaciones (35 % de throughput) y no se documentan ficheros cuantizados, GGUF ni soporte para servidores de inferencia de alto rendimiento, lo que limita las opciones de optimizacion en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/belumind/barb-2-ie-vi
- Modelo base: https://huggingface.co/knowledgator/gliner-relex-large-v1.0
- Repositorio de la biblioteca GLiNER: https://github.com/urchade/GLiNER
- Modelo anterior de la serie (barb-1), referenciado en la model card: no se proporciona URL en la informacion disponible
- Paper de GLiNER y articulo de GLiNER multi-task: no se proporcionan URL en la informacion disponible
- La busqueda web realizada no devolvio resultados relacionados con el modelo: los enlaces recuperados corresponden a una empresa francesa de limpieza ajena por completo a este modelo, por lo que se descartan.
