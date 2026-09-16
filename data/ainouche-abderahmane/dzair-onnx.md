# ainouche-abderahmane/DZAIR-ONNX

## Resumen

DZAIR-ONNX es la exportacion a ONNX (opset 18) de DZAIR, un encoder de 105,3 millones de parametros especializado en deteccion de tokens reemplazados (*replaced-token detection*) para arabe argelino (darija, codigo `arq`) y arabizi. Lo publica el usuario `ainouche-abderahmane` y su proposito principal es permitir inferencia en CPU sin depender de PyTorch, a traves de la libreria `optimum[onnxruntime]`.

El modelo no introduce pesos nuevos: es una conversion numerica del modelo base. El autor declara una similitud coseno de 1,0 frente a las salidas de PyTorch y una diferencia absoluta maxima de 5,7e-06, validada por una puerta de fidelidad en la publicacion. El grafo exportado ocupa 423.700.767 bytes en fp32, lo que lo situa en el rango de modelos ligeros desplegables en hardware modesto.

Es relevante ahora porque los recursos de PLN para darija siguen siendo escasos y porque empaquetar el modelo en ONNX elimina la barrera de instalar PyTorch en entornos de produccion con CPU, servicios serverless o despliegues ligeros. El repositorio no tiene descargas ni likes y los metadatos indican fechas de creacion y actualizacion en septiembre de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (numero de capas, dimension oculta y cabezas de atencion: no disponible); exportado a ONNX opset 18 |
| Parametros totales | 105,3 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la entrada son `input_ids` y `attention_mask`; el autor indica envolver los fragmentos como `[CLS] ... [SEP]` sin especificar el maximo) |
| Tipos de cuantizacion | Solo se publica fp32; no hay variantes cuantizadas en el repositorio |
| Idiomas soportados | Arabe argelino (darija, `arq`) y arabizi (darija escrita en caracteres latinos) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, fp32, opset 18); tokenizer SentencePiece (`tokenizer.model`) |
| Entrada | `input_ids`, `attention_mask` |
| Salida | `last_hidden_state` (representaciones del encoder, no logits de clasificacion) |
| Pipeline declarado | `text-classification` (etiqueta del repositorio; el grafo exportado es de extraccion de caracteristicas) |
| Modelo base | `ainouche-abderahmane/DZAIR` |
| Tamaño del repositorio | 0,4 GB |
| Fechas de creacion / actualizacion | 2026-09-15 / 2026-09-15 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La informacion disponible describe DZAIR como un encoder de deteccion de tokens reemplazados con 105,3 millones de parametros. No se detalla en los datos proporcionados el numero de capas, la dimension oculta, el numero de cabezas de atencion, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO; el autor remite a la tarjeta principal del modelo base para la tabla completa de resultados, los datos de entrenamiento y la composicion de licencias.

La innovacion del artefacto es puramente de despliegue: la exportacion a ONNX opset 18 con verificacion de fidelidad numerica (similitud coseno 1,0 y diferencia absoluta maxima de 5,7e-06 respecto a las salidas de PyTorch). El tokenizer es el SentencePiece original y se acompaña de un fichero `tokenizer_rules.yaml` con reglas de normalizacion versionadas. El flujo de uso exige replicar el preprocesado del modelo base: envolver cada fragmento como `[CLS] ... [SEP]` y convertir a minusculas los tramos en caracteres latinos antes de tokenizar.

## Capacidades

- Extraccion de representaciones contextuales: devuelve `last_hidden_state` para cada token, utilizable como base de cabezas de clasificacion posteriores.
- Deteccion de tokens reemplazados: tarea principal para la que fue entrenado el modelo base.
- Clasificacion de sentimiento en arabizi: el autor reporta 65,52 en la metrica de sentimiento sobre arabizi (media de 10 semillas).
- Clasificacion de sentimiento en foros: el autor reporta 96,33 (media de 10 semillas).
- Procesamiento de darija escrita en alfabeto arabe y en alfabeto latino (arabizi), con reglas de normalizacion especificas para los tramos latinos.
- Inferencia en CPU sin PyTorch, mediante `optimum[onnxruntime]` y `ORTModelForFeatureExtraction`.
- No dispone de generacion de texto, razonamiento multi-paso, tool calling ni capacidades de agente: es un encoder, no un modelo causal de lenguaje.
- No tiene capacidades de vision ni de audio.
- No se documentan capacidades multilingues fuera del darija y el arabizi.
- No se documenta un modo de razonamiento explicito (*thinking mode*).

## Casos de uso

- Moderacion de contenido en plataformas argelinas: el encoder puede clasificar comentarios en darija y arabizi para detectar mensajes toxicos o no deseados, apoyandose en las buenas cifras reportadas en dominios de foro (96,33).
- Analisis de sentimiento en redes sociales: monitorizacion de opiniones sobre marcas o eventos a partir de texto arabizi, un registro poco cubierto por modelos multilingues genericos y donde el autor reporta 65,52 de sentimiento en arabizi.
- Deteccion de manipulacion o sustitucion de tokens en corpus: la tarea nativa del modelo permite identificar fragmentos alterados en un texto, util para control de integridad de documentos y para auditar pipelines de datos.
- Control de calidad de corpus de darija: uso de las representaciones del encoder para filtrar, deduplicar o etiquetar grandes volumenes de texto recolectado de foros y redes antes de entrenar otros modelos.
- Clasificacion en produccion sobre CPU: al estar en ONNX y ocupar 423,7 MB en fp32, puede desplegarse en servicios con CPU, contenedores ligeros o funciones serverless donde instalar PyTorch no es viable.
- Busqueda semantica y recuperacion: los embeddings de `last_hidden_state` permiten construir indices vectoriales sobre documentacion en darija y arabizi para motores de busqueda internos.
- Analisis de opinion publica y estudios sociolinguisticos: clasificacion por temas o polaridad de grandes volumenes de mensajes de foros argelinos, con la ventaja de operar directamente sobre arabizi sin transliterar.
- Componente previo en un pipeline mayor: servir como extractor de caracteristicas congelado para un clasificador entrenado con pocos ejemplos etiquetados por el equipo, evitando ajuste fino completo.

## Benchmarks y rendimiento

| Tarea | Resultado | Metrica | Contexto |
|---|---|---|---|
| Sentimiento en arabizi | 65,52 | No especificada en la informacion disponible (el autor declara `accuracy` y `f1` en el repositorio) | Media de 10 semillas |
| Sentimiento en foros | 96,33 | No especificada en la informacion disponible (el autor declara `accuracy` y `f1` en el repositorio) | Media de 10 semillas |
| Fidelidad de la exportacion ONNX | Similitud coseno 1,0; diferencia absoluta maxima 5,7e-06 | Comparacion contra las salidas de PyTorch | Aceptada por la puerta de fidelidad de la publicacion |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas de referencia, ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,45 GB solo para los pesos (`model.onnx` = 423,7 MB), mas el overhead de activaciones y de la sesion de ONNX Runtime, que depende de la longitud de secuencia y del tamaño de lote.
- GPU recomendadas: cualquier GPU con 2 GB o mas de memoria es suficiente; no requiere A100 ni H100. Tarjetas tipo RTX 3060, RTX 4090 o T4 cubren el caso con holgura.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, e incluso en iGPU con memoria compartida.
- Inferencia en CPU: es el escenario objetivo declarado por el autor; el modelo fue exportado precisamente para funcionar sin PyTorch.
- Opciones de despliegue: ONNX Runtime mediante `optimum[onnxruntime]` (`ORTModelForFeatureExtraction.from_pretrained`). No aplican vLLM ni TGI, al no ser un modelo generativo. Son viables otras rutas de ejecucion de ONNX (OpenVINO, TensorRT) aunque no estan documentadas en la informacion disponible.
- Cuantizacion a INT8: no se publican variantes cuantizadas; podria generarse con las herramientas de ONNX Runtime, pero no hay datos de fidelidad ni de rendimiento para esas conversiones.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento reportado |
|---|---|---|---|---|---|
| DZAIR-ONNX | 105,3 M | No disponible | ONNX fp32 (opset 18) | Apache-2.0 | Sentimiento arabizi 65,52; foros 96,33 |
| DZAIR (modelo base) | 105,3 M | No disponible | Pesos PyTorch (safetensors/binario, segun la tarjeta principal) | Apache-2.0, con la misma salvedad sobre los textos de entrenamiento | Identicos resultados que DZAIR-ONNX (exportacion numerica equivalente) |
| Otros encoders para darija o arabe | No disponible | No disponible | No disponible | No disponible | No disponible |

La busqueda web realizada no devolvio resultados relevantes para esta ficha: los unicos enlaces recuperados apuntaban a YouTube y a sus aplicaciones, sin relacion con el modelo. No se dispone, por tanto, de comparativas externas verificables con alternativas como CAMeLBERT, MARBERT u otros encoders arabes.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni responde a instrucciones; solo genera representaciones (`last_hidden_state`) y necesita una cabeza de clasificacion externa para tareas concretas.
- El repositorio declara el pipeline `text-classification`, pero el grafo exportado no devuelve logits; conviene tenerlo en cuenta al integrarlo.
- La longitud maxima de contexto no esta documentada, lo que dificulta dimensionar lotes y truncamientos en produccion.
- La metrica exacta de los resultados reportados (exactitud o F1) no se especifica en la informacion disponible, pese a que el repositorio lista ambas.
- Cobertura linguistica limitada al darija y al arabizi; no hay soporte documentado de arabe estandar moderno, castellano ni otros idiomas.
- Es obligatorio replicar el preprocesado del modelo base: envolver los fragmentos como `[CLS] ... [SEP]` y convertir a minusculas los tramos en caracteres latinos. Omitirlo degrada los resultados.
- El uso de `trust_remote_code=True` implica ejecutar codigo del repositorio; conviene revisarlo antes de desplegarlo en entornos sensibles.
- La licencia es Apache-2.0 para pesos y codigo, pero el autor advierte de que se mantiene la salvedad sobre los textos de entrenamiento del modelo base y remite a la composicion de licencias de la tarjeta principal antes de redistribuir derivados.
- Riesgo de alucinacion: no aplica al no generar texto, pero si existe riesgo de falsos positivos y falsos negativos en la deteccion de tokens reemplazados y en la clasificacion de sentimiento, especialmente en registros muy informales.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible; un modelo entrenado sobre texto de foros puede heredar los sesgos de esas comunidades.
- Adopcion nula: cero descargas y cero likes, sin validacion independiente conocida.
- Metadatos anomalos: las fechas de creacion y actualizacion (2026-09-15) son posteriores a la fecha habitual de publicacion, lo que conviene verificar antes de citar el modelo.
- No se publican variantes cuantizadas ni datos de latencia, por lo que las estimaciones de rendimiento en produccion deben medirse en el entorno propio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ainouche-abderahmane/DZAIR-ONNX
- Modelo base DZAIR: https://huggingface.co/ainouche-abderahmane/DZAIR
- Tarjeta principal con resultados, datos de entrenamiento y composicion de licencias: https://huggingface.co/ainouche-abderahmane/DZAIR (enlazada desde la model card de DZAIR-ONNX)
- Grafo ONNX: https://huggingface.co/ainouche-abderahmane/DZAIR-ONNX/blob/main/model.onnx
- Reglas de normalizacion del tokenizer: https://huggingface.co/ainouche-abderahmane/DZAIR-ONNX/blob/main/tokenizer_rules.yaml
- Configuracion del modelo: https://huggingface.co/ainouche-abderahmane/DZAIR-ONNX/blob/main/config.json
- Paper, blog o repositorio adicional: no disponible
- Demo: no disponible
- Nota sobre la busqueda web: los resultados recuperados no guardaban relacion con el modelo (enlaces a YouTube y a sus aplicaciones), por lo que no se incluyen como fuentes.
