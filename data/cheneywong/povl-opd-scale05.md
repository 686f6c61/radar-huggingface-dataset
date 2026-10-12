# CheneyWong/povl-opd-scale05

## Resumen

povl-opd-scale05 es un checkpoint de reconocimiento de tablas y parseo de documentos desarrollado por el usuario CheneyWong (CheneyWong/povl-opd-scale05 en HuggingFace). Se trata de un modelo vision-lenguaje de tipo image-text-to-text que recibe una imagen de tabla y devuelve su estructura en marcado OTSL (etiquetas `<fcel>`, `<ecel>`, `<ucel>`, `<lcel>`, `<xcel>`, `<nl>`). Con 905.601.648 parametros (unos 906 millones) y un repositorio de 1,8 GB, es un modelo de escala media, disenable en GPU de consumo.

El checkpoint procede de una destilacion on-policy (OPD) sobre PaddleOCR-VL-1.6, con el delta de peso del profesor fusionado sobre la base SFT `CheneyWong/povl-sft-2d-merge` aplicando un factor de escala extra de 0,5, que resulto ser el mejor punto de un barrido de alpha (0,25 -> +0,32; 0,5 -> +0,44; 0,75 -> -0,29; 1,5 -> -3,01).

Su relevancia es sobre todo metodologica y de trazabilidad experimental: la propia model card documenta que la mejora de +0,05 puntos sobre el checkpoint RL previo esta dentro del ruido de muestreo (+/- 0,5 pt), que se pago con una perdida de 4,4 puntos en dominio, y que una auditoria detecto que los ocho estudiantes de OPD de la ronda anterior fueron no-ops por un fallo de integracion del puente de recompensa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (image-text-to-text) basada en PaddleOCR-VL-1.6; detalles internos no disponibles |
| Parametros totales | 905.601.648 (~906 M) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se documentan cuantizaciones oficiales; el repo (1,8 GB para 906 M de parametros) es consistente con pesos en fp16/bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, con `custom_code` (requiere `trust_remote_code` en transformers) |

Otros datos de la ficha de HuggingFace: pipeline `image-text-to-text`, libreria `transformers`, tags `paddleocr_vl`, `table-recognition`, `document-parsing`, `otvl`, `conversational`, `endpoints_compatible`, 8 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo parte de PaddleOCR-VL-1.6 como base y se entrena en dos etapas documentadas: primero un ajuste supervisado (SFT) que da lugar a `CheneyWong/povl-sft-2d-merge`, y despues una destilacion on-policy en la que el delta de peso aprendido por el profesor se fusiona sobre esa base SFT con un factor de escala extra de 0,5. La card aclara que `povl-sft-2d-merge` no es el checkpoint de RL, sino la base SFT, lo que explica que este checkpoint ni supere ni siga claramente a la ronda 2.

El proceso de seleccion del factor de escala fue un barrido de alpha cuyos resultados se reportan: 0,25 -> +0,32; 0,5 -> +0,44; 0,75 -> -0,29; 1,5 -> -3,01 (con t = -12,42 en el ultimo caso). El autor describe el delta de destilacion como un "deslizador" que intercambia exactitud en dominio por exactitud en escenas reales, no como una mejora gratuita.

Un hallazgo relevante de la card es que una auditoria detecto que los ocho estudiantes de destilacion on-policy de la ronda anterior eran no-ops (`mean_r` fijado exactamente en -1,0000), porque una correccion del puente de recompensa nunca llego al plugin que se ejecutaba realmente. Segun el autor, la destilacion on-policy nunca ha sido validada de forma efectiva en este proyecto. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento de tablas a partir de una imagen: entrada de una unica imagen de tabla con el prompt `Table Recognition:` y salida en una sola pasada en marcado OTSL.
- Emision de marcado estructural OTSL con las etiquetas `<fcel>` (celda con contenido), `<ecel>` (celda vacia), `<ucel>` (celda fusionada hacia arriba), `<lcel>` (fusionada a la izquierda), `<xcel>` (fusionada en cruz) y `<nl>` (nueva fila).
- Parseo de documentos: la etiqueta `document-parsing` indica uso previsto en pipelines de conversion de documentos a estructura.
- Modalidad conversacional: el tag `conversational` esta presente en la ficha.
- Compatibilidad con endpoints de inferencia: tag `endpoints_compatible`.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (el campo de idiomas no se especifica).
- Modo "thinking", vision adicional o audio: no documentado; la entrada descrita es una imagen de tabla.
- Cuantizacion y formatos alternativos (GGUF, AWQ, GPTQ): no documentados.

## Casos de uso

- Digitalizacion masiva de documentos financieros: el modelo convierte imagenes de tablas de informes anuales o balances en marcado OTSL, que despues puede transformarse a HTML, CSV o Markdown. Su rendimiento en FinTabNet (TEDS 0,9660) es el mas alto del conjunto de benchmarks publicados, lo que lo hace adecuado para este dominio.
- Procesamiento de tablas cientificas y de publicaciones: con TEDS 0,9499 en PubTables-v2 y 0,9276 en PubTables-1M, encaja en pipelines de extraccion de tablas de articulos academicos y preprints.
- Extraccion de tablas sinteticas y formularios generados: la mayor ganancia reportada esta en SynthTabNet (TEDS 0,9144 frente a 0,8093 de la base, +0,1051), lo que lo hace util en entornos con tablas generadas por software o plantillas.
- Preprocesado para RAG sobre documentos escaneados: la salida OTSL preserva estructura de filas, columnas y fusiones, lo que permite trocear el documento respetando la semantica de la tabla antes de indexarla en una base vectorial.
- Auditoria de calidad de OCR en produccion: dado que es un checkpoint de 906 M ejecutable en GPU de consumo, puede desplegarse como segundo modelo de contraste frente a un OCR generico y marcar discrepancias estructurales.
- Investigacion en destilacion on-policy: la card documenta todo el linaje, el barrido de alpha y los fallos de integracion detectados, por lo que sirve como caso de estudio reproducible de OPD aplicada a vision-lenguaje.
- Migracion de documentos historicos con re-escaneo: para escenas reales el modelo pierde algo de exactitud (Real5: TEDS 0,8738 frente a 0,8930 de la base), por lo que su uso en este escenario exige validacion previa con muestras del propio corpus.

## Benchmarks y rendimiento

Resultados TEDS y TEDS-S en datasets publicos, comparados con la base sin modificar (datos de la model card):

| Dataset | n | Base TEDS | Ours TEDS | d TEDS | Base TEDS-S | Ours TEDS-S | d TEDS-S |
|---|---:|---:|---:|---:|---:|---:|---:|
| PubTables-1M | 2000 | 0,9015 | 0,9276 | +0,0261 | 0,9243 | 0,9377 | +0,0133 |
| PubTables-v2 | 2000 | 0,9026 | 0,9499 | +0,0473 | 0,9239 | 0,9592 | +0,0353 |
| FinTabNet (OTSL) | 2000 | 0,9442 | 0,9660 | +0,0217 | 0,9524 | 0,9734 | +0,0209 |
| PubTabNet / ICDAR | 2000 | 0,9297 | 0,9296 | -0,0001 | 0,9464 | 0,9426 | -0,0038 |
| SynthTabNet | 2000 | 0,8093 | 0,9144 | +0,1051 | 0,8474 | 0,9283 | +0,0809 |
| TableVerse-5K | 4951 | 0,8608 | 0,8509 | -0,0099 | 0,9101 | 0,9026 | -0,0074 |
| OmniDocBench v1.5 | 512 | 0,9580 | 0,9449 | -0,0131 | 0,9797 | 0,9722 | -0,0075 |
| OmniDocBench v1.6 | 665 | 0,9492 | 0,9344 | -0,0148 | 0,9753 | 0,9666 | -0,0086 |
| CC-OCR | 300 | 0,8304 | 0,8048 | -0,0256 | 0,8762 | 0,8552 | -0,0210 |
| OCRBench-v2 | 681 | 0,8120 | 0,8069 | -0,0051 | 0,8526 | 0,8456 | -0,0070 |
| Real5 (re-shot OmniDoc) | 1320 | 0,8930 | 0,8738 | -0,0192 | 0,9307 | 0,9118 | -0,0189 |
| SPRINT-MUSTARD | 1429 | 0,2184 | 0,2203 | +0,0019 | 0,8754 | 0,8689 | -0,0065 |
| TABLET | 909 | 0,9048 | 0,8924 | -0,0123 | 0,9277 | 0,9136 | -0,0141 |
| Overall (peso igual) | - | 0,8395 | 0,8474 | +0,0078 | 0,9171 | 0,9214 | +0,0043 |

Nota del autor sobre SPRINT-MUSTARD: su ground truth no contiene texto de celda, por lo que su TEDS (~0,22) mide la reproduccion de celdas vacias y debe ignorarse; una prueba de perturbacion muestra que una prediccion estructuralmente perfecta que lee correctamente el texto visible obtiene 0,33 TEDS / 1,00 TEDS-S. Solo la columna TEDS-S es significativa en ese dataset.

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u equivalentes) en la informacion disponible; se trata de un modelo especializado en tablas, no de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 905.601.648 parametros): ~1,8 GB solo para pesos en fp16/bf16; ~3,6 GB en fp32. Hay que sumar el coste del encoder de vision, de los estados de activacion y del cache de atencion, no disponibles en la informacion proporcionada.
- Cabe con holgura en GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 (24 GB). Tambien en GPUs de 8 GB si el runtime y el encoder de vision lo permiten, aunque no se ha confirmado con datos oficiales.
- GPU de datacenter: A100, H100, L40S y A10 quedan sobredimensionadas para un modelo de esta escala; su interes estaria en el batching y el throughput agregado, no en la capacidad de VRAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via documentada (el repo incluye `custom_code` y esta marcado como `endpoints_compatible`). Compatibilidad con vLLM, TGI, llama.cpp u Ollama: no disponible.
- Cuantizacion a int8 (~0,9 GB) o int4 (~0,5 GB): estimaciones basadas en el numero de parametros; no hay artefactos de cuantizacion publicados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparativa dentro del propio linaje del proyecto, con los datos publicados en la model card:

| Modelo | Parametros | Contexto | TEDS global (peso igual) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| povl-opd-scale05 | 905.601.648 | No disponible | 0,8474 | Apache-2.0 | HuggingFace (CheneyWong/povl-opd-scale05) |
| PaddleOCR-VL-1.6 (base sin modificar) | No disponible | No disponible | 0,8395 | No disponible en la informacion | Base de referencia |
| Checkpoint RL (ronda 2) | No disponible | No disponible | No disponible (la card indica que este checkpoint esta +0,05 pt por encima, dentro del ruido) | No disponible | Referenciado en la card |
| CheneyWong/povl-sft-2d-merge | No disponible | No disponible | No disponible | No disponible | Base SFT del linaje |

Alternativas de terceros para reconocimiento de tablas: no disponible. La informacion proporcionada no incluye resultados comparables de otros modelos de la misma categoria con los que hacer una comparacion fiable.

## Limitaciones y advertencias

- La mejora global de +0,05 pt sobre el checkpoint RL previo esta, segun el propio autor, dentro del ruido de muestreo (+/- 0,5 pt) y no constituye una ganancia real.
- Esa mejora se obtuvo a costa de 4,4 puntos en dominio: el delta de destilacion funciona como un deslizador que intercambia exactitud en dominio por exactitud en escenas reales.
- Regresion en escenas reales: en Real5 (re-shot OmniDoc) cae a TEDS 0,8738 frente a 0,8930 de la base (-0,0192), y tambien baja en OmniDocBench v1.5 y v1.6, CC-OCR, OCRBench-v2 y TABLET.
- Casi sin cambios en PubTabNet / ICDAR (-0,0001 TEDS) y bajada en TableVerse-5K (-0,0099).
- Fiabilidad metodologica cuestionada: una auditoria detecto que los ocho estudiantes de destilacion on-policy de la ronda anterior eran no-ops (`mean_r` fijado en exactamente -1,0000) porque una correccion del puente de recompensa nunca llego al plugin que se ejecutaba. La OPD no ha sido validada efectivamente en este proyecto.
- El dataset SPRINT-MUSTARD no sirve para medir TEDS por carecer de texto de celda en su ground truth; solo su columna TEDS-S es interpretable.
- Tarea restringida: una unica imagen de tabla con el prompt `Table Recognition:` en una sola pasada; no esta documentado su comportamiento con prompts arbitrarios o conversaciones multi-turno.
- Riesgo de alucinacion en el contenido de celdas: no hay datos publicados sobre tasas de error de texto, solo metricas estructurales (TEDS / TEDS-S).
- Idiomas soportados: no disponibles. Si se necesita cobertura multilingue, hay que verificarla empiricamente.
- Requiere `trust_remote_code` en transformers por el `custom_code` incluido: hay que auditar el codigo del repositorio antes de ejecutarlo en produccion.
- Adopcion practicamente nula: 8 descargas y 0 likes en el momento de la consulta, sin mantenimiento documentado.
- Licencia Apache-2.0: permite uso comercial, pero la licencia de la base PaddleOCR-VL-1.6 no se especifica en la informacion proporcionada y deberia comprobarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CheneyWong/povl-opd-scale05
- Perfil de GitHub del autor: https://github.com/cheneyxwong/
- Paper relacionado (destilacion on-policy visual, OPD-V): https://arxiv.org/abs/2608.05131
- Paper relacionado (GFD-OPD, destilacion on-policy en difusion): https://arxiv.org/abs/2609.39692
- Leaderboard y benchmarks de modelos consultado durante la busqueda: https://benchlm.ai/
