# kotoshu/grammar-en-cc

## Resumen

kotoshu/grammar-en-cc es un modelo de correccion gramatical automatica (GEC, *grammatical error correction*) para ingles, desarrollado por el usuario kotoshu y publicado bajo licencia Apache-2.0. Se presenta como la variante "commercial-clean" de kotoshu/grammar-en: comparte arquitectura de estilo GECToR con encoder roberta-base, un esquema de 5.000 etiquetas de edicion, cuantizacion int8 en formato ONNX y decodificacion iterativa de cuatro rondas, con una latencia declarada de unos 6 ms por frase en CPU.

La motivacion del modelo es exclusivamente de licencia. A diferencia de la mayoria de sistemas GEC de calidad, que se entrenan sobre corpus como Lang-8, NUCLE, W&I+LOCNESS o FCE y heredan terminos de uso solo para investigacion, esta variante se entrena unicamente con datos permisivos: 224.574 frases generadas mediante corrupciones tipadas verificadas por un modelo profesor (GLM-5.3-Flash) sobre texto base c4 (base ODC-BY). El resultado es un paquete de pesos Apache-2.0 que, segun el autor, se puede distribuir comercialmente sin restricciones heredadas.

Es relevante para desarrolladores porque apunta a un nicho concreto: correccion gramatical en tiempo real, totalmente local, con un peso de unos 130 MB en int8 e integrable mediante onnxruntime en entornos Ruby, Rust o TypeScript sin depender de APIs externas. Su contrapartida es que el propio autor reconoce que cede precision frente a la linea "flagship" (kotoshu/grammar-en, 0.496 F0.5) a cambio de una licencia sin ataduras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder roberta-base con esquema de etiquetas de edicion estilo GECToR (5.000 etiquetas) y decodificacion iterativa de 4 rondas |
| Parametros totales | no disponible (encoder roberta-base, en el entorno de 125 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (condicionada por el encoder roberta-base) |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`gec-tagger.int8.onnx`), acompanado de `labels.json`, `vocab.json` y `merges.txt` |
| Tamano del repositorio | 0,1 GB (~130 MB en int8 segun el autor) |
| Metrica declarada | F0.5 (resultados oficiales en curso) |
| Runtime de referencia | gema `kotoshu` (Ruby); biblioteca `onnxruntime` |
| Fecha de publicacion | 2026-10-06 |

## Arquitectura y entrenamiento

El modelo sigue la familia GECToR: en lugar de generar la frase corregida token a token, un encoder clasifica cada token de entrada con una etiqueta de transformacion (mantener, borrar, insertar, reemplazar, cambiar mayusculas, etc.) dentro de un esquema de 5.000 etiquetas. La decodificacion es iterativa y se aplica en cuatro rondas, de modo que las ediciones de una pasada alimentan la siguiente. El encoder es roberta-base y la inferencia se sirve en ONNX cuantizado a int8, lo que explica el tamano reducido del artefacto y su viabilidad en CPU.

En cuanto a los datos, la model card es explicita: el unico corpus de entrenamiento son 224.574 frases construidas aplicando corrupciones tipadas sobre texto base c4 (base ODC-BY), con las corrupciones y las salidas del profesor verificadas mediante GLM-5.3-Flash. El autor indica que no se ha usado Lang-8, NUCLE, W&I+LOCNESS ni FCE, de modo que el modelo no hereda los terminos de uso solo para investigacion de esos corpus. No se detallan en la informacion disponible el numero total de tokens, la composicion exacta de la mezcla, ni si hubo etapas de RLHF o DPO (en un modelo discriminativo de etiquetado como este, lo habitual seria entrenamiento supervisado con *cross-entropy* sobre las etiquetas, pero esto no se confirma en la informacion proporcionada).

## Capacidades

- Correccion de errores gramaticales en ingles mediante prediccion de etiquetas de edicion y decodificacion iterativa de 4 rondas.
- Inferencia totalmente local: no requiere llamadas a servicios externos ni conexion a internet.
- Ejecucion en CPU en tiempo real, con una latencia declarada de aproximadamente 6 ms por frase.
- Modelo compacto y embebible: ~130 MB en int8, integrable en aplicaciones Ruby, Rust y TypeScript a traves de onnxruntime.
- Uso comercial sin restricciones heredadas de corpus de investigacion, al estar los pesos y los datos de entrenamiento bajo licencias permisivas.
- No se documenta soporte de *tool calling*, *function calling*, razonamiento multi-paso, agentes, vision, audio ni modo de razonamiento explicito; no es un modelo generativo conversacional.
- Capacidad multilingue: no disponible; el modelo se declara solo para ingles.

## Casos de uso

- Correccion de textos en editores y CMS: integrado en un editor web o en un CMS, el modelo marca y reescribe errores gramaticales en ingles en unos 6 ms por frase sin enviar el texto del usuario a terceros, lo que simplifica el cumplimiento de RGPD.
- Herramientas de escritura para hablantes no nativos: en asistentes de redaccion academica o profesional, aplica correcciones conservadoras con decodificacion iterativa de 4 rondas y puede filtrarse por tipo de edicion para no alterar el estilo del autor.
- Preprocesado de datos para entrenamiento de LLM: limpieza gramatical de grandes volumenes de texto en ingles (por ejemplo, salidas de OCR o de ASR) antes de usarlos en pipelines de *fine-tuning*.
- Moderacion y normalizacion de contenido generado por usuarios: normalizacion de comentarios, tickets o resenas en ingles antes de almacenarlos o indexarlos, de forma local y con coste marginal nulo.
- Verificacion en pipelines de CI/CD para documentacion: comprobacion automatica de la gramatica de ficheros README, docs y cadenas de interfaz en ingles, como paso previo a la publicacion.
- Aplicaciones de escritorio y moviles *offline*: al ser un artefacto de ~130 MB sobre onnxruntime, puede embeberse en un cliente sin backend, algo inviable con APIs de correccion en la nube o con modelos generativos grandes.
- Servicio de correccion autoalojado: despliegue en un contenedor con onnxruntime para ofrecer correccion gramatical a una organizacion, evitando dependencias de proveedores y con licencia Apache-2.0 apta para redistribucion.

## Benchmarks y rendimiento

| Modelo | Metrica | Resultado | Protocolo |
|---|---|---|---|
| kotoshu/grammar-en-cc | F0.5 | en curso (no publicado en la informacion disponible) | CoNLL-2014, scorer M2, `noalt` gold, `--max_unchanged_words 2`, 4 rondas de decodificacion |
| kotoshu/grammar-en (linea flagship) | F0.5 | 0,496 | no disponible en detalle |

No se han publicado resultados de benchmarks completos en la informacion disponible. El autor indica que la evaluacion oficial sobre CoNLL-2014 esta "en curso" y que los numeros se publicaran junto con el protocolo de medida (scorer M2, gold `noalt`, `--max_unchanged_words 2`, decodificacion de 4 rondas). El unico dato numerico disponible es el 0,496 de F0.5 de la linea flagship, que no corresponde a este modelo.

## Requisitos de hardware

- VRAM para inferencia: no aplica en la configuracion declarada; el modelo esta pensado para ejecucion en CPU con onnxruntime.
- Huella en disco y memoria: en torno a 130 MB de pesos en int8, mas los ficheros de etiquetas y vocabulario.
- GPU recomendadas: no disponible; no se documenta ninguna GPU objetivo. El modelo cabe holgadamente en cualquier GPU consumer (por ejemplo, RTX 3060 o superior), pero no se declara una ruta de despliegue en GPU.
- Cabe en GPU consumer: si, con un uso de memoria minimo; tambien en dispositivos sin GPU dedicada.
- Opciones de despliegue: onnxruntime (Python, Rust, TypeScript mediante bindings) y la gema `kotoshu` para Ruby. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos y no a este tipo de clasificador de etiquetas.
- Latencia: aproximadamente 6 ms por frase en CPU, segun el autor. No se publican cifras de *throughput*, consumo de memoria en ejecucion ni latencias en GPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| kotoshu/grammar-en-cc | GECToR sobre roberta-base, ONNX int8 | no disponible (~125 M) | no disponible | Apache-2.0 | Entrenado solo con datos permisivos; uso comercial sin restricciones heredadas |
| kotoshu/grammar-en | GECToR sobre roberta-base | no disponible (~125 M) | no disponible | no disponible | Linea "flagship" del mismo autor, 0,496 F0.5; cede licencia a cambio de precision |
| GECToR original | Transformer encoder con etiquetas de edicion | depende del encoder (BERT/RoBERTa) | no disponible | no disponible (entrenado con Lang-8, NUCLE, W&I+LOCNESS, FCE) | Referencia academica del paradigma; arrastra terminos de uso solo para investigacion |
| LanguageTool | Basado en reglas con componentes neuronales | no disponible | no disponible | LGPL-2.1 con opcion comercial | Corrector local multilingue, no comparable en paradigma pero si en caso de uso |

Los datos de contexto, parametros y rendimiento de los modelos alternativos no estan disponibles en la informacion proporcionada; la comparativa se limita a lo que la model card declara sobre este modelo y su hermano.

## Limitaciones y advertencias

- Entrenamiento exclusivamente sintetico: los datos son corrupciones tipadas sobre texto c4 verificadas por un profesor (GLM-5.3-Flash). Esto puede reducir la generalizacion frente a errores reales de aprendices, que no siguen necesariamente esos patrones de corrupcion.
- Sin resultados oficiales de calidad: la evaluacion sobre CoNLL-2014 esta declarada como "en curso", por lo que no existe un numero verificado de F0.5 para este modelo concreto. El 0,496 citado pertenece a la linea flagship, no a esta variante.
- Solo ingles: el modelo no admite otros idiomas.
- Riesgo de correcciones incorrectas: al ser un modelo discriminativo de etiquetado, puede aplicar ediciones espurias sobre texto ya correcto o sobre dominios alejados de c4 (texto tecnico, jerga, nombres propios). No debe usarse sin revision en contextos legales, medicos o cientificos.
- Cuantizacion int8: la version publicada esta cuantizada, lo que puede degradar ligeramente la precision respecto a una version en punto flotante; no se documenta una variante fp16 o fp32.
- Sesgos heredados del corpus base: al derivar de c4, puede reproducir sesgos de representacion presentes en ese rastreo web.
- Madurez y adopcion: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, sin historial de uso en produccion conocido.
- Licencia: Apache-2.0 permite uso comercial y redistribucion, pero conviene verificar de forma independiente la procedencia de los datos de entrenamiento generados por el profesor antes de un despliegue en produccion regulada.
- Limitaciones de contexto e integracion: no se documentan la longitud de contexto efectiva, el comportamiento con parrafos largos ni el manejo de entradas que excedan la ventana del encoder roberta-base.
- Ambiguedad de fechas: la ficha de HuggingFace indica fechas de creacion y actualizacion de 2026, posteriores a la fecha de esta consulta; conviene contrastar la vigencia del repo antes de tomarlo como referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kotoshu/grammar-en-cc
- Modelo hermano (linea flagship): https://huggingface.co/kotoshu/grammar-en
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo: los resultados obtenidos corresponden a foros sin relacion con el contenido tecnico solicitado y se han descartado. No hay papers, blogs, repos ni demos adicionales disponibles en la informacion proporcionada.
