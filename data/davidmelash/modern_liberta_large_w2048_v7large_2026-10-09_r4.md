# davidmelash/modern_liberta_large_w2048_v7large_2026-10-09_r4

## Resumen

El modelo `davidmelash/modern_liberta_large_w2048_v7large_2026-10-09_r4` es un clasificador de tokens (token classification, equivalente a reconocimiento de entidades nombradas) especializado en localizar datos personales dentro de resoluciones judiciales ucranianas con el fin de pseudonimizarlas. Lo desarrolla el usuario davidmelash y parte de `Goader/modern-liberta-large`, una adaptación al ucraniano de la arquitectura ModernBERT, sobre la que se ha hecho un ajuste fino supervisado. Cuenta con 409.799.689 parametros (aproximadamente 410 millones) almacenados en safetensors.

El problema que resuelve es concreto: el Registro Unificado Estatal de Resoluciones Judiciales de Ucrania publica sentencias con fragmentos anonimizados, y automatizar esa anonimización requiere detectar de forma fiable nombres de personas, direcciones, numeros identificativos y otra informacion sensible. El modelo define cuatro tipos de entidad: `ОСОБА` (persona), `АДРЕСА` (direccion), `НОМЕР` (numero) e `ІНФОРМАЦІЯ` (informacion).

Es relevante porque combina un encoder moderno de contexto largo con un dominio muy especifico y regulado (datos personales en textos judiciales), y porque se distribuye con licencia MIT, lo que facilita su integracion en sistemas de publicacion y cumplimiento normativo. El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, por lo que se trata de una publicacion muy reciente y sin validacion externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ModernBERT (familia del modelo base `Goader/modern-liberta-large`) |
| Parametros totales | 409.799.689 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens segun la nomenclatura del identificador (`w2048`); no confirmado de forma explicita en la model card. La arquitectura ModernBERT original admite hasta 8192 tokens |
| Tipos de cuantizacion | No se publican cuantizaciones en el repositorio. Al ser un modelo de ~410 M de parametros es cuantificable a int8/int4 con herramientas estandar (bitsandbytes, ONNX Runtime) o convertible a GGUF, pero no hay artefactos oficiales |
| Idiomas soportados | Ucraniano (`uk`) unicamente |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es ModernBERT en su variante ajustada al ucraniano (`Goader/modern-liberta-large`), un encoder transformer con mejoras de eficiencia respecto a BERT clasico: atencion alternativa (global y local), RoPE en lugar de embeddings posicionales absolutos, y soporte nativo de secuencias largas. Sobre esa base se ha realizado un ajuste fino supervisado para clasificacion de tokens, con una cabeza de etiquetado por token. El identificador del modelo sugiere una ventana de trabajo de 2048 tokens, aunque la model card no detalla la configuracion exacta de entrenamiento.

El entrenamiento se ha realizado sobre un dataset sintetico denominado `v7large`, construido a partir de resoluciones judiciales del Registro Unificado Estatal de Resoluciones Judiciales de Ucrania cuyos fragmentos anonimizados se han rellenado con valores generados. Las direcciones generadas provienen del directorio de Ukrposhta y de OpenStreetMap (© OpenStreetMap contributors, ODbL). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras.

## Capacidades

- Reconocimiento de entidades nombradas sobre texto legal en ucraniano, con cuatro etiquetas: `ОСОБА`, `АДРЕСА`, `НОМЕР`, `ІНФОРМАЦІЯ`.
- Clasificacion a nivel de token, apta para extraccion de spans y posterior enmascaramiento o sustitucion (pseudonimizacion).
- Procesamiento de documentos largos dentro del limite de contexto del modelo, adecuado para secciones de sentencias.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas: es un encoder discriminativo, no un modelo generativo.
- No se documenta soporte de tool calling, function calling, uso como agente ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ucraniano; no se declaran otros idiomas.
- No se declaran capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Pseudonimizacion automatizada de resoluciones judiciales: el modelo marca los spans con datos personales en cada sentencia antes de su publicacion, sustituyendo el trabajo manual de anonimizacion por un preetiquetado que un revisor humano valida.
- Cumplimiento de proteccion de datos en portales judiciales: se integra en el pipeline de publicacion del registro para impedir que nombres, direcciones o numeros identificativos lleguen al dominio publico.
- Construccion de corpus legales desidentificados: permite generar datasets de investigacion sobre jurisprudencia ucraniana sin datos personales, requisito habitual para compartir corpus academicos.
- Preprocesado previo a modelos generativos: se ejecuta como filtro antes de enviar sentencias a un LLM, reduciendo el riesgo de trasladar datos personales a entornos externos.
- Auditoria de filtraciones en corpus existentes: se pasa el modelo sobre un archivo documental ya publicado para detectar posibles datos personales que no fueron enmascarados correctamente.
- Indexacion y busqueda documental en bases juridicas: las entidades extraidas enriquecen metadatos (por ejemplo, tipo de identificador o presencia de direccion) para filtrado y recuperacion, siempre sobre versiones anonimizadas.
- Apoyo a periodismo de investigacion y organizaciones civiles: anonimizacion de documentacion judicial antes de su difusion publica o de compartirla con terceros.
- Etiquetado asistido para reentrenamiento: las predicciones del modelo se usan como preetiquetado en herramientas de anotacion, reduciendo el coste de producir nuevos conjuntos de datos supervisados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall ni F1 sobre conjuntos de validacion o test, ni comparaciones con otros sistemas de anonimizacion en ucraniano.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en fp32, 0,9 GB en fp16/bf16 y 0,4-0,5 GB en int8. Son estimaciones derivadas del numero de parametros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia en fp16. Una RTX 3060, RTX 4060 o superior cubre el caso de uso con holgura.
- Cabe en GPU de consumo: si, practicamente cualquier GPU moderna de consumo, e incluso en CPU con latencias razonables dado el tamano del modelo.
- Ajuste fino: se estima necesario entre 12 y 16 GB de VRAM para entrenar con secuencias de 2048 tokens y batches moderados en fp16, o menos con gradient checkpointing y optimizadores de bajo consumo de memoria (estimacion, no dato publicado).
- Opciones de despliegue: `transformers` con pipeline `token-classification`, `ONNX Runtime` o `optimum` para inferencia optimizada, y conversion a GGUF para `llama.cpp` si se desea ejecucion en CPU. Compatible con `text-embeddings-inference`/`TEI` no esta confirmado; la etiqueta `endpoints_compatible` del repositorio indica compatibilidad con los endpoints de HuggingFace.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `davidmelash/modern_liberta_large_w2048_v7large_2026-10-09_r4` | 409,8 M | 2048 tokens (segun nomenclatura) | Clasificacion de tokens / anonimizacion en ucraniano | MIT | HuggingFace, repositorio de 1,6 GB |
| ModernBERT-large (arquitectura base de referencia) | ~395 M | hasta 8192 tokens | Encoder de proposito general; requiere ajuste | Apache 2.0 | Ampliamente disponible |
| `Goader/modern-liberta-large` (modelo base del que parte) | No disponible en la informacion proporcionada | No disponible | Encoder en ucraniano; requiere ajuste para NER | No disponible en la informacion proporcionada | HuggingFace |
| XLM-RoBERTa-large (alternativa multilingue habitual para NER) | ~560 M | 512 tokens | Clasificacion de tokens multilingue | MIT | Ampliamente disponible |

No hay datos de rendimiento comparativo entre estas opciones en la informacion disponible. Las cifras de parametros, contexto y licencia de los modelos de referencia corresponden a sus especificaciones publicas conocidas, no a una evaluacion realizada para esta ficha.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: entrenado sobre resoluciones judiciales ucranianas sinteticamente anonimizadas. Su comportamiento fuera de ese genero textual (por ejemplo, contratos, prensa o texto conversacional) no esta documentado y previsiblemente degradara.
- Entrenamiento sobre datos sinteticos: los valores que rellenan los fragmentos anonimizados son generados, lo que puede introducir una distribucion distinta a la de los datos reales y sesgar el modelo hacia patrones artificiales de nombres, direcciones o numeros.
- Cobertura de entidades limitada a cuatro etiquetas. No detecta otras categorias habituales de dato personal (correo electronico, telefono, identificador fiscal, datos de salud, filiacion, etc.) salvo que encajen en `ІНФОРМАЦІЯ` o `НОМЕР`.
- Riesgo de alucinacion entendido como falsos positivos y falsos negativos en el etiquetado: el modelo puede marcar texto no sensible o pasar por alto datos personales reales. No debe usarse como unico mecanismo de anonimizacion sin revision humana en contextos legales.
- Sin validacion publica: cero descargas y cero valoraciones, sin metricas de evaluacion en la model card. No hay evidencia externa de calidad.
- Un solo idioma: no procesa correctamente textos en ruso, ingles u otras lenguas presentes en documentacion mixta.
- Limite de contexto: si la ventana efectiva es de 2048 tokens, los documentos mas largos deben trocearse, con el riesgo de cortar entidades a mitad de span si el troceado no se hace con solapamiento.
- Licencia MIT: permite uso comercial y modificacion, pero conviene revisar las condiciones de los datos de origen. Las direcciones generadas derivan de OpenStreetMap bajo ODbL, que impone obligaciones de atribucion y posiblemente de comparticion de bases derivadas; la model card incluye la atribucion, pero el uso comercial de esa parte de los datos merece una verificacion juridica especifica.
- Al tratarse de una version con nombre que incluye fecha y sufijo de revision (`2026-10-09_r4`), es esperable que existan otras variantes del mismo autor con comportamientos distintos; conviene fijar la revision concreta en produccion.
- No se documenta el preprocesado, la tokenizacion especifica ni el esquema de etiquetado (por ejemplo, BIO/BILUO), lo que dificulta reproducir el entrenamiento o integrar el modelo sin inspeccionar la configuracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidmelash/modern_liberta_large_w2048_v7large_2026-10-09_r4
- Modelo base: https://huggingface.co/Goader/modern-liberta-large
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos adicionales.
