# NbAiLab/nb-embed-edu-scorer

## Resumen

Borealis EDU scorer (`NbAiLab/nb-embed-edu-scorer`) es un clasificador ordinal de calidad documental orientado a medir la utilidad educativa de documentos web en lenguas nordicas. Lo desarrolla NbAiLab, el laboratorio de IA del National Library of Norway, y se construye como un ajuste fino del encoder `NbAiLab/borealis-embed-212m`: el modelo puntua cada documento con un valor continuo entre 0 y 5, donde los valores altos indican mayor utilidad educativa.

El problema que resuelve es el filtrado y la priorizacion de corpus web a gran escala en idiomas nordicos, una tarea para la que hasta ahora dominaban clasificadores entrenados casi exclusivamente en ingles (la familia de clasificadores tipo FineWeb-Edu). El modelo cubre ocho configuraciones linguisticas: danes, feroes, finlandes, islandes, noruego bokmal, noruego nynorsk, sami y sueco, lo que lo hace relevante para la construccion de datasets de preentrenamiento y para la curacion de colecciones digitales en lenguas de bajos recursos.

Tecnicamente es un encoder transformer de aproximadamente 212 millones de parametros (segun el nombre del modelo base) con un cabezal de clasificacion ordinal de cinco umbrales acumulativos. Los documentos se truncan a un maximo de 4096 tokens del tokenizador Borealis. El repositorio pesa 0,4 GB e incluye el encoder en `encoder/` y el cabezal en `ordinal_head.pt`, junto con un script de inferencia JSONL autonomo. La licencia no esta declarada en la ficha de HuggingFace y remite a los terminos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (Borealis Embed 212M) con mean pooling y cabezal de clasificacion ordinal de 5 umbrales acumulativos |
| Parametros totales | No disponible con exactitud; aproximadamente 212 millones segun el nombre del modelo base, mas el cabezal ordinal |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Documentos truncados a un maximo de 4096 tokens del tokenizador Borealis |
| Tipos de cuantizacion | No se documentan variantes cuantizadas; pesos en safetensors y cabezal en `ordinal_head.pt` (PyTorch) |
| Idiomas soportados | danes (da), feroes (fo), finlandes (fi), islandes (is), noruego bokmal (nb), noruego nynorsk (nn), sami (se), sueco (sv) |
| Licencia | No disponible; la model card indica que se deben cumplir la licencia y los terminos del modelo base `NbAiLab/borealis-embed-212m` |
| Formato de pesos | safetensors (encoder) + `ordinal_head.pt` (cabezal); formato personalizado, no cargable directamente con `AutoModelForSequenceClassification` |
| Tarea | text-classification / document-scoring (regresion ordinal, salida continua 0-5) |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (segun HuggingFace) | 2026-09-16 |

## Arquitectura y entrenamiento

La arquitectura parte del encoder de `NbAiLab/borealis-embed-212m` (revision `2ae20a7ca72bbfaf526d9b1b371c6b326ccfc7f2`). Sobre las representaciones del encoder se aplica un *mean pooling* de los estados de token y, a continuacion, un cabezal de regresion ordinal con cinco umbrales acumulativos que separan las seis etiquetas ordenadas de 0 a 5. Este diseno ordinal, en lugar de una clasificacion multiclase plana, respeta el orden inherente de la escala de calidad educativa y permite emitir una puntuacion continua `edu_score` dentro del rango 0-5.

El entrenamiento utiliza las ocho configuraciones linguisticas del dataset `NbAiLab/nb-fineweb2-edu-sample-v2-rated` (revision `af20ece2464419b70249ae4d0e934a9924473f81`): `dan`, `fao`, `fin`, `isl`, `nno`, `nob`, `sami` y `swe`. La configuracion `mixed-sample` del dataset se excluyo deliberadamente. Los documentos se truncan a 4096 tokens como maximo. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni el uso de tecnicas de alineacion como RLHF o DPO (no proceden en un modelo discriminativo de este tipo). El checkpoint publicado es el modelo seleccionado de una confirmacion de entrenamiento completo de tres ejecuciones.

## Capacidades

- Puntuacion de calidad documental: asigna a cada documento un `edu_score` continuo en el rango 0-5, donde los valores altos indican mayor utilidad educativa.
- Clasificacion ordinal: mantiene el orden de la escala mediante umbrales acumulativos, lo que permite tanto ranking como umbralizacion en categorias discretas de 0 a 5.
- Medida de confianza heuristica: cada fila de salida incluye ademas una medida de confianza heuristica junto a la puntuacion.
- Cobertura multilingue nordica: ocho variantes linguisticas, incluidas lenguas de bajos recursos como el feroes, el islandes y el sami.
- Procesamiento por lotes: el script de inferencia incluido trabaja sobre JSONL, lo que facilita el scoring de corpus completos en pipelines de datos.
- Truncamiento controlado: los documentos largos se recortan a 4096 tokens, lo que acota el coste computacional por documento.
- No dispone de generacion de texto, razonamiento multi-paso, tool calling, capacidades de agente, vision ni audio: es un modelo puramente discriminativo.

## Casos de uso

- Filtrado de corpus de preentrenamiento: aplicar el scorer a los volcados web en lenguas nordicas para conservar unicamente los documentos con `edu_score` alto, reduciendo el ruido y el contenido de baja calidad antes de entrenar un modelo generativo.
- Curacion de datasets educativos al estilo FineWeb2: generar subconjuntos etiquetados por calidad educativa en danes, sueco, finlandes, islandes, feroes, sami y noruego, reutilizando la escala 0-5 para comparar contra anotaciones existentes.
- Priorizacion en bibliotecas digitales: ordenar colecciones de documentos digitalizados de una biblioteca nacional por utilidad educativa, de modo que el material mas didactico aparezca primero en los portales de consulta.
- Limpieza de archivos web a gran escala: puntuar millones de documentos de un *crawl* nordico y descartar los que se situan en los tramos bajos de la escala, usando el `edu_score` como senal de ranking o de filtrado.
- Enriquecimiento de pipelines RAG: almacenar el `edu_score` como metadato junto a los embeddings de Borealis Embed y usarlo para ponderar la recuperacion, dando mas peso a los fragmentos con mayor valor educativo.
- Analisis de cobertura linguistica: comparar la distribucion de puntuaciones entre las ocho lenguas para detectar desequilibrios de calidad en las fuentes disponibles de cada idioma, especialmente en sami y feroes.
- Auditoria y control de calidad de colecciones: revisar muestras con puntuaciones extremas para detectar sesgos de fuente o de anotacion antes de publicar un dataset.
- Enrutado de contenidos en plataformas educativas: clasificar automaticamente material subido por usuarios y dirigirlo a la seccion o nivel adecuado segun su puntuacion de utilidad educativa.

## Benchmarks y rendimiento

La model card publica resultados de validacion, no benchmarks generativos. La validacion emplea las particiones de validacion de cada configuracion linguistica (146.638 documentos en total). `nob` y `nno` reciben peso 3 y el resto de lenguas peso 1. La metrica de seleccion es la media de la MAE normalizada ponderada y la kappa cuadratica ponderada (QWK).

| Metrica | Valor |
|---|---:|
| MAE ponderada | 0,62663 |
| MAE normalizada ponderada | 0,87467 |
| QWK ponderada | 0,74604 |
| Puntuacion conjunta de seleccion | 0,81036 |

Desglose por idioma:

| Idioma | MAE | QWK |
|---|---:|---:|
| Danes (`dan`) | 0,60926 | 0,79525 |
| Feroes (`fao`) | 0,64115 | 0,70458 |
| Finlandes (`fin`) | 0,65290 | 0,72897 |
| Islandes (`isl`) | 0,64745 | 0,71382 |
| Noruego nynorsk (`nno`) | 0,62981 | 0,76401 |
| Noruego bokmal (`nob`) | 0,57526 | 0,76587 |
| Sami (`sami`) | 0,74969 | 0,64146 |
| Sueco (`swe`) | 0,60389 | 0,77880 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible, ya que no son aplicables a un modelo de clasificacion documental.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder de aproximadamente 212 millones de parametros ocupa unos 0,85 GB en fp32, unos 0,42 GB en fp16/bf16 y unos 0,21 GB en int8, mas el cabezal ordinal. El repositorio de 0,4 GB es coherente con pesos en media precision. Con secuencias de hasta 4096 tokens, el consumo real esta dominado por las activaciones, por lo que conviene reservar entre 4 y 8 GB de VRAM para procesamiento por lotes en GPU.
- GPU recomendadas: cabe holgadamente en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090), asi como en GPUs de datacenter (A100, H100, L40S) cuando se necesita throughput alto sobre corpus masivos.
- Viabilidad en consumer: si, es ejecutable en GPU consumer e incluso en CPU para volumenes moderados, dado el tamano reducido del encoder.
- Opciones de despliegue: el repositorio incluye un script de inferencia JSONL autonomo (`inference.py`) que requiere unicamente `torch` y `transformers`. Al tratarse de un encoder discriminativo con cabezal personalizado, no se documenta soporte para vLLM, Ollama o TGI en la informacion disponible; para produccion son alternativas razonables la exportacion a ONNX Runtime o TensorRT y el servicio mediante FastAPI con inferencia por lotes.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de especificaciones verificadas de alternativas directas en la informacion proporcionada. La tabla siguiente recoge unicamente los datos documentados y marca como no disponibles los de los modelos de referencia de la categoria.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NbAiLab/nb-embed-edu-scorer | Aprox. 212 M mas cabezal | 4096 tokens (truncamiento) | da, fo, fi, is, nb, nn, se, sv | No disponible; hereda los terminos de Borealis Embed | HuggingFace |
| NbAiLab/borealis-embed-212m (modelo base) | 212 M segun el nombre | No disponible | Lenguas nordicas | No disponible en la informacion proporcionada | HuggingFace |
| Clasificadores de calidad educativa tipo FineWeb-Edu (p. ej. FineWeb-Edu classifier) | No disponible | No disponible | Principalmente ingles | No disponible | HuggingFace |

La diferencia funcional relevante frente a la categoria de clasificadores de calidad educativa en ingles es la cobertura de ocho lenguas nordicas, incluida la variante nynorsk del noruego y lenguas minoritarias como el sami y el feroes, no cubiertas por los modelos mayoritarios de esta familia.

## Limitaciones y advertencias

- Las etiquetas y el modelo reflejan valoraciones automaticas de calidad educativa, por lo que pueden codificar sesgos de lengua, de fuente y de anotacion.
- El rendimiento es mas debil en sami, el conjunto de validacion mas pequeno: MAE de 0,74969 y QWK de 0,64146, claramente por debajo del resto de idiomas.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de puntuaciones erroneas o mal calibradas en dominios alejados de los datos de entrenamiento.
- El truncamiento a 4096 tokens implica que en documentos largos solo se evalua la parte inicial; la puntuacion no representa el documento completo.
- La licencia no esta declarada en la ficha; el uso comercial queda supeditado a la licencia del modelo base `NbAiLab/borealis-embed-212m`, que debe consultarse antes de cualquier despliegue.
- El formato es personalizado (encoder en `encoder/` y cabezal en `ordinal_head.pt`), por lo que no se puede cargar con las clases estandar de `transformers` para clasificacion de secuencias; es necesario usar el codigo incluido en el repositorio.
- La model card advierte explicitamente de que la puntuacion debe usarse como senal de ranking o filtrado, nunca como juicio definitivo de calidad educativa ni como base unica para decisiones de alto impacto.
- Recomendacion del autor: evaluar el modelo en el dominio de destino antes de desplegarlo.
- El repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validacion independiente de la comunidad en el momento de redactar esta ficha.
- No se documentan evaluaciones humanas ni comparaciones contra anotadores expertos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NbAiLab/nb-embed-edu-scorer
- Modelo base (encoder): https://huggingface.co/NbAiLab/borealis-embed-212m
- Dataset de entrenamiento: https://huggingface.co/datasets/NbAiLab/nb-fineweb2-edu-sample-v2-rated
- Revision del dataset usada en el entrenamiento: `af20ece2464419b70249ae4d0e934a9924473f81`
- Revision del encoder base: `2ae20a7ca72bbfaf526d9b1b371c6b326ccfc7f2`
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada. La busqueda web realizada no devolvio resultados relacionados con este modelo (los resultados obtenidos versaban sobre certificaciones de mecanica automovilistica y no guardan relacion con el contenido de esta ficha).
