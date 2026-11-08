# Qntology/stanza-cs

## Resumen

`Qntology/stanza-cs` es una conversión a ONNX del modelo Stanza para checo desarrollado originalmente por el Stanford NLP Group. Stanza es un conjunto de herramientas de análisis lingüístico que cubre desde la tokenización hasta el análisis sintáctico y el reconocimiento de entidades, y este repositorio empaqueta los procesadores necesarios para el pipeline completo de checo en formato ONNX, lo que permite su ejecución sin depender de PyTorch.

El modelo resuelve tareas de procesamiento de lenguaje natural a nivel lingüístico profundo sobre texto en checo: segmentación de tokens, expansión de palabras multitoken (MWT), etiquetado morfosintáctico (UPOS/XPOS y rasgos morfológicos), lematización y análisis de dependencias. Es relevante porque ofrece una alternativa de inferencia ligera y portable para pipelines de NLP en producción que necesitan análisis gramatical preciso sin el coste de un runtime de deep learning completo.

La conversión se ha generado a partir de los paquetes por defecto de Stanza 1.15.0 para checo (tokenize: `pdtc_nocharlm`, mwt: `pdtc`, pos: `pdtc_nocharlm`, lemma: `pdtc_nocharlm`, depparse: `pdtc_nocharlm`) mediante la herramienta `stanza-onnx-export`. El repositorio incluye dos formatos: el formato 1 en la raíz (compatible con versiones antiguas de logis-center) y el formato 2 en el subdirectorio `format2/`, previsto para logis-center a partir de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline Stanza con procesadores neuronales (tokenizer, MWT, POS, lemma, depparse) exportados a ONNX; arquitectura interna de los modelos base no detallada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los artefactos distribuidos son ficheros ONNX sin cuantizacion indicada) |
| Idiomas soportados | Checo (cs) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`tokenizer.onnx`, `pos.onnx`, `lemma.onnx`, `depparse.onnx`, `vocab.json`; en `format2/` ademas `lemma_encoder.onnx`, `lemma_decoder.onnx`, `mwt_encoder.onnx`, `mwt_decoder.onnx`, `lemma_dict.json`, `mwt_dict.json`, `pretrain_vocab.json`) |

## Arquitectura y entrenamiento

El modelo no es un transformer generativo monolitico, sino un pipeline de procesadores especializados de Stanza: tokenizacion, expansion de palabras multitoken, etiquetado POS (UPOS y XPOS con rasgos morfologicos), lematizacion y analisis de dependencias. Los pesos originales se entrenaron sobre los treebanks del Prague Dependency Treebank (PDTC) en el marco de Universal Dependencies, segun se deduce de los nombres de paquete (`pdtc_nocharlm`, `pdtc`) indicados en la model card. La variante `nocharlm` indica que estos procesadores no utilizan el modelo de lenguaje de caracteres en la etapa correspondiente.

La innovacion tecnica de este repositorio es la conversion a ONNX mediante `stanza-onnx-export` (commit `d56cf6f`), que separa los modulos de lematizacion y MWT en codificador y decodificador con diccionarios asociados (`lemma_dict.json`, `mwt_dict.json`). La conversion se ha validado de extremo a extremo contra el pipeline PyTorch de Stanza: sobre 19 textos en checo (278 en las 12 lenguas convertidas) los tokens, la expansion multitoken, UPOS, XPOS, rasgos, lemas, cabezas y relaciones de dependencia son identicos a la referencia. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Tokenizacion de texto en checo con soporte de segmentacion a nivel de frase y palabra.
- Expansion de palabras multitoken (MWT), relevante en checo por la fusion de preposiciones y pronombres con formas verbales.
- Etiquetado morfosintactico: UPOS, XPOS y rasgos morfologicos completos.
- Lematizacion con codificador y decodificador separados y diccionario de lemas.
- Analisis de dependencias sintacticas (cabezas y relaciones de dependencia).
- Inferencia en formato ONNX sin dependencia de PyTorch.
- Compatibilidad con dos formatos de distribucion (formato 1 en raiz y formato 2 en `format2/`) para distintos clientes de logis-center.
- No soporta generacion de texto, razonamiento, codigo, vision ni tool calling: es exclusivamente un modelo de token-classification linguistico.

## Casos de uso

- Analisis gramatical en pipelines de NLP para checo: el modelo se integra como etapa de preprocesado en sistemas de extraccion de informacion, proporcionando tokens, lemas y dependencias que alimentan etapas posteriores.
- Construccion de treebanks anotados automaticamente: la salida de POS, lemas y dependencias permite generar anotaciones con formato compatible con Universal Dependencies para revision humana o entrenamiento de otros modelos.
- Busqueda linguistica y motores de recuperacion: la lematizacion y el etiquetado POS permiten normalizar consultas y documentos en checo, mejorando la coincidencia morfologica en sistemas de busqueda.
- Traduccion automatica asistida: el analisis de dependencias y la lematizacion sirven como representacion intermedia en pipelines de traduccion basados en reglas o hibridos para checo.
- Analisis de sentimiento y mineria de opiniones: el etiquetado morfosintactico y las dependencias facilitan la identificacion de sujetos, objetos y modificadores en resenas y textos de opinion en checo.
- Herramientas educativas y de correccion gramatical: la salida de POS y dependencias permite detectar errores de concordancia o estructura en textos escritos por estudiantes de checo.
- Despliegue en entornos con recursos limitados: al distribuirse como ONNX, el pipeline puede ejecutarse en CPUs sin GPU y en contenedores ligeros, lo que lo hace adecuado para servicios de analisis linguistico de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion reportada es la equivalencia funcional con el pipeline PyTorch de Stanza: sobre 19 textos en checo (278 en las 12 lenguas convertidas) los tokens, la expansion multitoken, UPOS, XPOS, rasgos, lemas, cabezas y relaciones de dependencia son identicos a la referencia (`verify_onnx.py`, `reference_outputs.json`).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un pipeline ONNX de procesadores linguisticos, es previsible que pueda ejecutarse en CPU, pero no se especifican requisitos de memoria en la informacion disponible.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX permite en principio ejecucion en CPU y en GPU, pero no se detallan modelos concretos.
- Opciones de despliegue: cliente logis-center (formatos 1 y 2), runtime ONNX (ONNX Runtime) y el pipeline Stanza original en PyTorch como referencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| Qntology/stanza-cs | Checo (cs) | ONNX | Apache 2.0 | no disponible | Conversion ONNX validada contra Stanza PyTorch |
| stanfordnlp/stanza-cs | Checo (cs) | PyTorch | Apache 2.0 | no disponible | Modelo original del Stanford NLP Group |
| Stanza (otros idiomas) | 70 lenguas | PyTorch | Apache 2.0 | no disponible | Conjunto de pipelines por idioma |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monoidioma: solo procesa checo; no soporta otros idiomas.
- No es un modelo generativo: no puede producir texto, razonar, escribir codigo ni mantener conversaciones.
- Riesgo de errores en textos ruidosos, dominios muy alejados del treebank de entrenamiento (PDTC) o variedades no estandar del checo.
- La validacion de equivalencia se realizo sobre 19 textos en checo, una muestra limitada que no garantiza el comportamiento en todos los dominios.
- El repositorio incluye dos formatos con compatibilidad diferenciada por cliente (formato 1 para versiones antiguas de logis-center, formato 2 a partir de noviembre de 2026); usar el formato incorrecto puede provocar fallos de carga.
- No se detallan sesgos especificos ni tasas de alucinacion, aunque al ser un modelo de etiquetado linguistico el riesgo de "alucinacion" se manifiesta como errores de anotacion, no como texto inventado.
- Licencia Apache 2.0 permite uso comercial, pero conviene conservar los avisos de licencia y atribucion del modelo original de Stanford NLP.
- El tamano del repositorio (1.3 GB) puede ser elevado para despliegues con almacenamiento muy restringido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Qntology/stanza-cs
- Modelo original Stanza para checo: https://huggingface.co/stanfordnlp/stanza-cs
- Sitio web de Stanza: https://stanfordnlp.github.io/stanza
- Repositorio GitHub de Stanza: https://github.com/stanfordnlp/stanza
- Pagina de descarga de modelos Stanza: https://stanfordnlp.github.io/stanza/download_models.html
- Herramienta de exportacion a ONNX: https://github.com/sungu-che/stanza-onnx-export
