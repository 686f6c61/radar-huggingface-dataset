# JPMSA1212/distilbert-ner-masquener

## Resumen

distilbert-ner-masquener es un modelo de reconocimiento de entidades nombradas (NER) desarrollado por JPMSA1212, un fine-tuning completo de Davlan/distilbert-base-multilingual-cased-ner-hrl orientado a la deteccion y el enmascaramiento de datos personales en textos de Costa de Marfil. El objetivo es permitir que un navegador web identifique nombres de personas, lugares y organizaciones antes de enviar un texto a un asistente de IA, reduciendo asi la fuga de informacion personal en servicios en la nube.

El modelo mantiene la arquitectura, el tokenizer y las etiquetas del modelo base (O, B-/I-PER, B-/I-ORG, B-/I-LOC, B-/I-DATE), con 134,7 millones de parametros y distribucion en formato ONNX cuantizado a 8 bits (135 MB) para inferencia en el navegador mediante transformers.js. Se distribuye tambien con pesos PyTorch en safetensors. La licencia es AFL-3.0, heredada del modelo de partida de David Adelani.

Su relevancia actual radica en el enfoque de privacidad por diseno: el modelo fue entrenado exclusivamente con frases sinteticas (40.000 en total, ninguna con datos personales reales) y muestra mejoras notables en el dominio marfileno respecto al modelo de referencia, con un F1 estricto de 0,72 en personas sobre documentos administrativos reales (frente a 0,40 del modelo base) y un 84 % de nombres completamente enmascarados (frente al 68 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilacion de BERT) |
| Parametros totales | 134.741.001 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT estandar, tipicamente 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | ONNX int8 (q8, 135 MB); pesos PyTorch en safetensors sin cuantizar |
| Idiomas soportados | fr, en, es, nl, de, it, pt, ar, zh, lv (entrenamiento principal en frances para Costa de Marfil) |
| Licencia | AFL-3.0 |
| Formato de pesos | safetensors (PyTorch) y ONNX cuantizado int8 (transformers.js) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de Davlan/distilbert-base-multilingual-cased-ner-hrl (revision d421f57d), que a su vez es un DistilBERT multilingue con case sensitive entrenado para NER en diez idiomas. Conserva la misma cabeza de clasificacion token a token con las etiquetas O, B-/I-PER, B-/I-ORG, B-/I-LOC y B-/I-DATE, el mismo tokenizer y la misma estructura que la version ONNX de Xenova. No se introducen innovaciones arquitectonicas: el trabajo se concentra en la adaptacion del dominio.

El entrenamiento uso 40.000 frases divididas a partes iguales. La mitad son 20.000 frases sinteticas marfilenas generadas a partir de 88 plantillas (correspondencia administrativa, fichas, mensajes, peticiones a un asistente) rellenadas con listas publicas de ciudades, barrios, pueblos, escuelas, centros de salud, empresas (data.gouv.ci, OpenStreetMap) e instituciones. Los nombres de persona se componen recombinando nombres y apellidos aislados presentes en al menos dos personalidades de Wikidata, de modo que ningun nombre completo real aparece en el corpus. La otra mitad son 20.000 frases de revision (CoNLL 2002/2003 en, es, nl; WikiANN en 10 idiomas) con las etiquetas originales sustituidas por las predicciones del modelo de partida, aplicando destilacion para evitar el olvido catastrofico. El entrenamiento fue de 3 epocas, learning rate 3e-5, lotes de 32, en 2 GPU T4 (Kaggle) durante aproximadamente 10 minutos. No se menciona RLHF ni DPO.

## Capacidades

- Reconocimiento de entidades nombradas de tipo persona (PER), organizacion (ORG) y lugar (LOC) a nivel de subword, agrupables en entidades.
- Etiquetas B-/I-DATE presentes en el esquema, pero el modelo no predice fechas (igual que el modelo base); deben tratarse con reglas externas.
- Enmascaramiento de datos personales en el navegador mediante transformers.js, sin enviar el texto a un servidor.
- Soporte multilingue en diez idiomas (fr, en, es, nl, de, it, pt, ar, zh, lv), con especial enfasis en frances marfileno.
- Inferencia en Python con transformers y en JavaScript con @huggingface/transformers.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido: es un modelo de clasificacion de tokens puro.

## Casos de uso

- Enmascaramiento de PII en el navegador antes de enviar texto a un asistente de IA: el modelo se ejecuta con transformers.js en el cliente, detecta nombres de personas, lugares y organizaciones y los sustituye por marcadores, de modo que el proveedor del servicio nunca recibe los datos originales.
- Tramitacion de documentos administrativos marfilenos: procesamiento de cartas, fichas y solicitudes con nombres de personas y localidades de Costa de Marfil, donde el modelo base falla con frecuencia (F1 de personas 0,40 frente a 0,72 del fine-tuning).
- Preprocesamiento de datasets para cumplimiento normativo: anonimizacion de corpus textuales antes de su publicacion o de su uso en entrenamiento de otros modelos, reduciendo el riesgo de exponer nombres reales.
- Filtrado de mensajes de usuarios en aplicaciones de mensajeria: deteccion de nombres y lugares en mensajes redactados sin mayusculas, con la advertencia de que pueden producirse errores de tipo (una ciudad clasificada como persona) aunque el nombre quede oculto igualmente.
- Analisis de entidades en textos multilingues de ONG y cooperacion: el modelo cubre diez idiomas y puede extraer PER, ORG y LOC de informes en frances, ingles, espanol, portugues, arabe o chino, aunque el rendimiento fuera del dominio marfileno es el del modelo base.
- Prototipado rapido en entornos sin GPU: el ONNX int8 de 135 MB cabe en cualquier navegador moderno y permite demos de privacidad sin infraestructura de servidor.
- Evaluacion comparativa de modelos NER en contextos africanos: util como referencia para medir el comportamiento en MasakhaNER 2.0 y en dominios con nombres propios poco representados en los corpus occidentales.

## Benchmarks y rendimiento

Los resultados publicados en la model card usan F1 estricto (tipo y limites exactos). La columna "Referencia" corresponde al modelo de partida medido con el mismo codigo.

| Conjunto | Referencia | MasqueNER v1 |
|---|---|---|
| Documentos administrativos marfilenos reales, 25 documentos, personas | 0,40 | 0,72 |
| Documentos administrativos marfilenos reales, lugares | 0,60 | 0,64 |
| Documentos administrativos marfilenos reales, proporcion de nombres completamente enmascarados | 68 % | 84 % |
| Frases marfilenas sinteticas (nombres y plantillas no vistos en entrenamiento) | 0,607 | 0,872 |
| CoNLL 2002/2003 (en, es, nl), media | 0,896 | 0,896 |
| MasakhaNER 2.0 (20 lenguas africanas), media | 0,439 | 0,445 |
| WikiANN (10 idiomas, etiquetas automaticas, indicativo), media | 0,560 | 0,564 |

El autor indica que el modelo paso un control automatico en el que ninguna medida bloqueante (CoNLL, MasakhaNER, frases sinteticas, corpus reales de personas y lugares, tasa de enmascaramiento) retrocede mas de 0,5 puntos. Ademas, la version ONNX cuantizada coincide con los pesos PyTorch en el 98,8 % de los subwords sobre 300 frases de prueba; la diferencia se atribuye a la cuantizacion. La nota ORG sobre documentos reales no es significativa por falta de anotacion de ministerios y direcciones.

## Requisitos de hardware

- VRAM estimada: el ONNX int8 ocupa unos 135 MB, por lo que la inferencia cabe en CPU y en cualquier GPU con 1 GB o mas de memoria. Los pesos PyTorch en safetensors requieren aproximadamente 0,6-0,7 GB en FP32.
- GPU recomendadas: no necesita GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) acelera la inferencia sin ser necesaria.
- Cabe en GPU consumer: si, en todas las GPU consumer modernas y en portatiles sin GPU dedicada.
- Opciones de despliegue: transformers.js en navegador (con dtype q8), transformers en Python con pipeline de token-classification, ONNX Runtime, y potencialmente llama.cpp no aplica (no es un modelo generativo). vLLM y TGI no son adecuados para un encoder de clasificacion de tokens.
- Latencia y throughput: no se publican cifras especificas. El entrenamiento completo se realizo en 2 GPU T4 en unos 10 minutos, lo que da una idea del bajo coste computacional del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| JPMSA1212/distilbert-ner-masquener | 134,7 M | no disponible | 10 | AFL-3.0 | NER marfileno, enmascaramiento PII en navegador |
| Davlan/distilbert-base-multilingual-cased-ner-hrl | ~135 M | no disponible | 10 | AFL-3.0 | NER multilingue generico (modelo base) |
| Xenova/distilbert-base-multilingual-cased-ner-hrl | ~135 M | no disponible | 10 | AFL-3.0 | Version ONNX del modelo base para transformers.js |

La comparativa se limita al linaje directo porque no se dispone de datos de otros modelos NER especificos para Costa de Marfil en la informacion proporcionada. Frente al modelo base, MasqueNER mejora el F1 de personas en documentos reales de 0,40 a 0,72 y la tasa de enmascaramiento completo del 68 % al 84 %, manteniendo resultados equivalentes en CoNLL y ligeramente superiores en MasakhaNER y WikiANN. La version de Xenova es funcionalmente identica al modelo base en formato ONNX; MasqueNER anade la adaptacion al dominio marfileno conservando ese mismo formato y etiquetas.

## Limitaciones y advertencias

- Lugares aun con rendimiento medio: F1 de 0,64 en documentos reales; barrios y pueblos se escapan con frecuencia.
- Errores de tipo: un nombre puede enmascararse con la categoria equivocada (una ciudad tomada por persona), sobre todo en mensajes sin mayusculas. Para el enmascaramiento el nombre queda oculto igualmente, pero la etiqueta asignada puede ser incorrecta.
- Corpus real de evaluacion muy pequeno: 25 documentos, 120 nombres de personas y 165 lugares. Las organizaciones estan poco anotadas (ministerios y direcciones no aparecen), por lo que la metrica ORG no es significativa.
- Regresiones en lenguas africanas: la media de MasakhaNER sube 0,6 puntos, pero 9 de 20 lenguas retroceden, hasta -1,6 puntos en chichewa, -1,4 en suajili y -1,3 en setswana. El espanol de CoNLL retrocede 0,6 puntos.
- Solo frances para Costa de Marfil: no se ha trabajado dioula, baoule ni otras lenguas locales.
- Riesgo de fuga residual: como cualquier detector, puede dejar pasar nombres; reduce el riesgo de exposicion pero no lo elimina.
- Sesgos: el entrenamiento con plantillas sinteticas puede no cubrir la variedad real de redacciones y nombres; los nombres se componen de piezas de Wikidata, lo que puede infrarrepresentar nombres no registrados en esa base.
- Licencia AFL-3.0: permite uso comercial con obligaciones de atribucion y de compartir modificaciones bajo la misma licencia; conviene revisar los terminos antes de integrarlo en productos propietarios.
- No predice fechas pese a incluir las etiquetas B-/I-DATE en el esquema; requiere reglas externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JPMSA1212/distilbert-ner-masquener
- Modelo base: https://huggingface.co/Davlan/distilbert-base-multilingual-cased-ner-hrl
- Version ONNX del modelo base (Xenova): https://huggingface.co/Xenova/distilbert-base-multilingual-cased-ner-hrl
- Repositorio MasqueNER (codigo de agrupacion de subwords en entidades, onnx_ner.py): https://github.com/jpsangare/MasqueNER
- Documentacion de transformers.js: https://huggingface.co/docs/transformers.js
