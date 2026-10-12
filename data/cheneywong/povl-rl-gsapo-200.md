# CheneyWong/povl-rl-gsapo-200

## Resumen

povl-rl-gsapo-200 es un checkpoint de un modelo de vision-lenguaje especializado en reconocimiento de tablas (table recognition) y parseo de documentos, publicado por el usuario CheneyWong en HuggingFace. Se trata de un ajuste fino derivado de CheneyWong/povl-rl-dapo-400 (ronda 1 de RL), que a su vez parte de PaddleOCR-VL-1.6 como modelo base. El checkpoint corresponde a la segunda ronda de aprendizaje por refuerzo, entrenada con el algoritmo que el autor denomina GSAPO durante 200 pasos, y se presenta como "el modelo entregado de esa ronda".

El modelo tiene 905.601.648 parametros (aproximadamente 0,91 mil millones), un tamano que lo situa en la gama de los VLM compactos y que lo hace desplegable en hardware de consumo. La tarea es acotada y muy especifica: recibe una unica imagen de tabla junto con el prompt `Table Recognition:` y emite, en una sola pasada, marcado OTSL con los tokens `<fcel>`, `<ecel>`, `<ucel>`, `<lcel>`, `<xcel>` y `<nl>`. No es, por tanto, un modelo conversacional generalista pese a llevar la etiqueta `conversational`.

Su relevancia es doble. Por un lado, ofrece una mejora medible frente al modelo base en varios conjuntos publicos (SynthTabNet +0,1124 TEDS; PubTables-v2 +0,0529), aunque con retrocesos en otros (OmniDocBench v1.6 -0,0332; CC-OCR -0,0430). Por otro, la propia model card documenta con honestidad que la optimizacion ha llegado a su suelo de ruido: tres rondas de RL juntas aportaron menos de 0,2 puntos, y el cuello de botella esta en la composicion de los datos de entrenamiento, no en el optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de vision-lenguaje derivado de PaddleOCR-VL-1.6; el repositorio usa `custom_code`) |
| Parametros totales | 905.601.648 (aproximadamente 0,91 B) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se han publicado variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas; menciona cohortes de escenas reales en chino entre los casos con regresion) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Datos adicionales: tamano del repositorio 1,8 GB; 3 descargas y 0 likes en el momento de la consulta; fecha de creacion 2026-10-12 y ultima actualizacion 2026-10-12; etiquetas del repositorio `paddleocr_vl`, `image-text-to-text`, `table-recognition`, `document-parsing`, `paddleocr-vl`, `otvl`, `conversational`, `custom_code`, `endpoints_compatible`.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna. La cadena de linaje declarada es lineal: PaddleOCR-VL-1.6 (base) como punto de partida, sobre el que se aplica la ronda 1 de RL (DAPO, 400 pasos) dando lugar a `CheneyWong/povl-rl-dapo-400`, y sobre ese checkpoint se aplica la ronda 2 de RL (GSAPO, 200 pasos) que produce este `povl-rl-gsapo-200`. El autor no especifica en la model card la composicion del dataset de RL, el numero de tokens de entrenamiento, ni si hubo etapas de SFT, RLHF o DPO adicionales mas alla de las dos rondas de RL mencionadas. Tampoco se describen innovaciones tecnicas propias (atencion lineal, decodificacion especulativa u otras).

El regimen de entrenamiento si queda caracterizado por sus resultados: el autor indica que tres rondas de RL en conjunto aportaron menos de 0,2 puntos porcentuales, lo que interpreta como que el algoritmo de optimizacion ha alcanzado su suelo de ruido y que el factor limitante es la composicion de los datos de entrenamiento. El modelo se evalua sobre 33.545 muestras segun el encabezado de la model card, aunque la tabla de resultados publica desglosa 13 conjuntos con un total de 20.767 muestras; la diferencia no se explica en la informacion proporcionada.

## Capacidades

- Reconocimiento de tablas a partir de imagen: entrada de una unica imagen de tabla y salida en una sola pasada de marcado OTSL.
- Emision de marcado OTSL con los tokens de celda `<fcel>` (celda con contenido), `<ecel>` (celda vacia), `<ucel>` (celda fusionada hacia arriba), `<lcel>` (fusionada a la izquierda), `<xcel>` (celda cubierta por otra fusion) y `<nl>` (salto de fila).
- Reconocimiento de estructura de tabla (TEDS-Struct), incluyendo celdas fusionadas y jerarquia de filas y columnas.
- Lectura del texto contenido en las celdas, combinada con la reconstruccion estructural.
- Parseo de documentos en el contexto de tablas (procesamiento de documentos escaneados con tablas como elemento central).
- Procesamiento de tablas financieras (evaluado en FinTabNet con notacion OTSL) y de tablas de publicaciones cientificas (PubTables-1M y PubTables-v2).
- No hay informacion disponible sobre soporte de tool calling, function calling, capacidades de agente, razonamiento multi-paso, modo de pensamiento explicito, audio o vision general mas alla de la imagen de tabla.

## Casos de uso

- Digitalizacion de tablas financieras: el modelo esta evaluado especificamente sobre FinTabNet (TEDS 0,9655 con notacion OTSL) y sobre tablas de balances y cuentas de resultados, por lo que encaja en pipelines que convierten informes financieros escaneados en estructuras explotables.
- Extraccion de tablas de literatura cientifica: los conjuntos PubTables-1M y PubTables-v2 son corpus de tablas de articulos academicos, donde el modelo alcanza 0,9412 y 0,9555 de TEDS respectivamente; es util para poblar bases de datos de resultados experimentales.
- Conversion de documentos escaneados a Markdown o HTML: al emitir OTSL como representacion intermedia, la salida se puede transformar de forma determinista a tablas HTML o Markdown para su publicacion o su indexacion.
- Preprocesado para RAG sobre documentos corporativos: extraer primero la estructura de tabla con este modelo permite trocear el documento respetando filas y columnas, en lugar de fragmentar por caracteres, lo que mejora la recuperacion posterior.
- Automatizacion de back office con formularios y facturas tabuladas: al ser un modelo de 0,91 B de parametros, se puede ejecutar en local o en GPU de gama media dentro de un flujo batch de documentos sin depender de APIs externas.
- Auditoria y control de calidad de digitalizaciones: comparar la estructura OTSL predicha con la esperada permite detectar tablas mal escaneadas o con celdas vacias mal reconstruidas; con SPRINT-MUSTARD el autor advierte que solo la metrica estructural (TEDS-S) es informativa.
- Extraccion de tablas en escenarios con tablas muy densas o generadas sinteticamente: la mayor mejora respecto al modelo base se da en SynthTabNet (+0,1124 TEDS), lo que sugiere buen comportamiento en tablas sinteticas o con maquetacion poco habitual.

## Benchmarks y rendimiento

Resultados publicados en la model card. Base = PaddleOCR-VL-1.6 sin modificar. TEDS-S es TEDS-Struct.

| Dataset | n | Base TEDS | Ours TEDS | d TEDS | Base TEDS-S | Ours TEDS-S | d TEDS-S |
|---|---:|---:|---:|---:|---:|---:|---:|
| PubTables-1M | 2000 | 0,9015 | 0,9412 | +0,0397 | 0,9243 | 0,9513 | +0,0270 |
| PubTables-v2 | 2000 | 0,9026 | 0,9555 | +0,0529 | 0,9239 | 0,9644 | +0,0405 |
| FinTabNet (OTSL) | 2000 | 0,9442 | 0,9655 | +0,0212 | 0,9524 | 0,9731 | +0,0207 |
| PubTabNet / ICDAR | 2000 | 0,9297 | 0,9284 | -0,0012 | 0,9464 | 0,9416 | -0,0048 |
| SynthTabNet | 2000 | 0,8093 | 0,9217 | +0,1124 | 0,8474 | 0,9340 | +0,0866 |
| TableVerse-5K | 4951 | 0,8608 | 0,8370 | -0,0238 | 0,9101 | 0,8923 | -0,0178 |
| OmniDocBench v1.5 | 512 | 0,9580 | 0,9327 | -0,0253 | 0,9797 | 0,9648 | -0,0150 |
| OmniDocBench v1.6 | 665 | 0,9492 | 0,9160 | -0,0332 | 0,9753 | 0,9543 | -0,0210 |
| CC-OCR | 300 | 0,8304 | 0,7873 | -0,0430 | 0,8762 | 0,8347 | -0,0415 |
| OCRBench-v2 | 681 | 0,8120 | 0,8013 | -0,0106 | 0,8526 | 0,8400 | -0,0126 |
| Real5 (re-shot OmniDoc) | 1320 | 0,8930 | 0,8560 | -0,0369 | 0,9307 | 0,8957 | -0,0350 |
| SPRINT-MUSTARD | 1429 | 0,2184 | 0,2180 | -0,0004 | 0,8754 | 0,8603 | -0,0151 |
| TABLET | 909 | 0,9048 | 0,8824 | -0,0224 | 0,9277 | 0,9031 | -0,0246 |
| Overall (equal weight) | - | 0,8395 | 0,8418 | +0,0022 | 0,9171 | 0,9161 | -0,0010 |

El encabezado de la model card declara, para el modelo entregado, TEDS 0,8473 y TEDS-Struct 0,9078 con pesos iguales sobre 33.545 muestras, cifras que no coinciden con la fila "Overall" de la tabla (0,8418 y 0,9161 sobre 20.767 muestras). La model card no explica la discrepancia. Sobre SPRINT-MUSTARD, el autor advierte que el ground truth no contiene texto de celda, de modo que su TEDS estructural no es interpretable en esa columna; solo TEDS-S es significativa.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 905.601.648 parametros y sin datos oficiales del autor: aproximadamente 1,8 GB solo en pesos a precision completa (fp16/bf16), 0,9 GB en int8 y 0,45 GB en int4. Hay que sumar el coste del codificador de vision y de las activaciones, por lo que un presupuesto realista en bf16 se situa en el entorno de 3 a 4 GB.
- Cabe sin problema en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090, ademas de portatiles con 6-8 GB de VRAM. Tambien es viable en CPU para procesamiento por lotes, aunque con mayor latencia.
- GPU de centro de datos (A100, H100, L40S) no son necesarias para inferencia; su interes estaria en el reentrenamiento o en el ajuste fino, no en el servicio.
- Opciones de despliegue: la libreria declarada es `transformers`, con `custom_code`, por lo que se requiere `trust_remote_code=True`. El repositorio lleva la etiqueta `endpoints_compatible`. No hay informacion disponible sobre soporte en vLLM, llama.cpp, Ollama, TGI o TensorRT-LLM, ni sobre variantes cuantizadas para esos motores.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

La model card solo permite comparar con los modelos de su propia cadena de linaje; no se aportan comparaciones con alternativas externas.

| Modelo | Parametros | Contexto | TEDS (equal weight) | TEDS-S (equal weight) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| povl-rl-gsapo-200 | 0,91 B | no disponible | 0,8418 / 0,8473 (segun fuente) | 0,9161 / 0,9078 (segun fuente) | apache-2.0 | HuggingFace, safetensors |
| povl-rl-dapo-400 (RL ronda 1) | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | no disponible | HuggingFace |
| PaddleOCR-VL-1.6 (base) | no disponible (compatible con 0,91 B del derivado) | no disponible | 0,8395 | 0,9171 | no disponible | no disponible en la informacion proporcionada |

Comparativa con otros modelos de reconocimiento de tablas de la misma categoria: no disponible.

## Limitaciones y advertencias

- Regresion en escenas reales en chino: el autor senala como unica carencia sustantiva que todas las cohortes de escenas reales en chino retrocedieron entre 2 y 6 puntos, y que el 82 % de esos fallos son estructurales, no de no-terminacion.
- Optimizacion en el suelo de ruido: tres rondas de RL juntas aportaron menos de 0,2 puntos. Segun el propio autor, el cuello de botella es la composicion de los datos de entrenamiento y no el optimizador, por lo que mas RL sobre los mismos datos no cabe esperar que mejore sustancialmente el resultado.
- Retrocesos medibles frente al modelo base: OmniDocBench v1.5 (-0,0253 TEDS), v1.6 (-0,0332), CC-OCR (-0,0430), Real5 (-0,0369) y TableVerse-5K (-0,0238). El modelo no domina de forma uniforme a su base.
- Metrica no interpretable en SPRINT-MUSTARD: el ground truth de ese conjunto no incluye texto de celda, de modo que su TEDS mide la reproduccion de celdas vacias. Un test de perturbacion citado en la model card indica que una prediccion estructuralmente perfecta que lee correctamente el texto visible obtiene 0,33 TEDS y 1,00 TEDS-S. Solo TEDS-S es util ahi.
- Tarea muy restringida: el modelo trabaja con una unica imagen de tabla y el prompt fijo `Table Recognition:`, en una sola pasada. No hay evidencia de que soporte conversacion multi-turno, instrucciones abiertas, tool calling ni razonamiento multi-paso, pese a la etiqueta `conversational`.
- Idiomas: no declarados. El comportamiento multilingue y la cobertura de alfabetos distintos del chino y el ingles (presentes en los conjuntos de evaluacion) no estan documentados.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. En tareas de reconocimiento de tablas el riesgo tipico es la invencion de contenido de celda o la reconstruccion incorrecta de fusiones; el modelo se evalua con TEDS, que penaliza las discrepancias estructurales y de texto, pero la model card no incluye un analisis especifico de errores de contenido.
- Requiere `trust_remote_code`: el repositorio incluye codigo personalizado, lo que implica ejecutar codigo del autor del modelo. Conviene revisarlo antes de desplegarlo en entornos de produccion.
- Licencia: apache-2.0, que permite uso comercial, modificacion y redistribucion con las obligaciones habituales de atribucion y conservacion del aviso de licencia. No se especifican restricciones adicionales, pero la licencia del modelo base PaddleOCR-VL-1.6 no consta en la informacion proporcionada y conviene verificarla antes de un uso comercial.
- Madurez y trazabilidad: el repositorio tiene 3 descargas y 0 likes, y la model card no documenta la composicion del dataset de RL, los hiperparametros ni el procedimiento de evaluacion. La discrepancia entre la cifra global del encabezado y la fila "Overall" de la tabla no esta explicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CheneyWong/povl-rl-gsapo-200
- Checkpoint predecesor (RL ronda 1), referenciado en la model card como `CheneyWong/povl-rl-dapo-400`: https://huggingface.co/CheneyWong/povl-rl-dapo-400
- Modelo base citado en la model card como PaddleOCR-VL-1.6: no disponible (no se proporciona enlace)
- Papers, blogs, repositorios o demos adicionales: no disponible. La busqueda web realizada no devolvio resultados relacionados con el modelo; los unicos resultados obtenidos correspondian al servicio de streaming deportivo DAZN y no guardan relacion con este checkpoint.
