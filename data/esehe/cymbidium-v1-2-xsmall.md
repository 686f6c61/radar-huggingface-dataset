# esehe/Cymbidium-v1.2-xsmall

## Resumen

Cymbidium-v1.2-xsmall es un modelo de lenguaje en formato ONNX publicado por el desarrollador esehe en Hugging Face. Se distribuye como un artefacto autocontenido compuesto por tres ficheros: un manifiesto JSON que lee el motor de inferencia, el modelo ONNX ya cuantizado y un vocabulario en formato TSV hexadecimal. El modelo está especializado en japones y se deriva de unos pesos iniciales extraidos de Bletilla-v0.1-small, otro modelo del mismo autor.

La relevancia de este lanzamiento es limitada pero concreta: se trata de un modelo pequeno (sufijo "xsmall") empaquetado para despliegue ligero mediante ONNX Runtime, lo que facilita su integracion en entornos sin GPU dedicada o en aplicaciones de escritorio. La model card no documenta el numero de parametros, la longitud de contexto ni la arquitectura interna, por lo que la evaluacion tecnica queda restringida a lo que el autor expone.

El modelo se publica bajo licencia Apache-2.0, lo que permite uso comercial y modificacion. Su entrenamiento se apoya en un corpus japones compuesto por fuentes publicas (FineWeb-2, CC-100, HPLT 3.0, LLM-jp Corpus v4, Wikipedia, entre otras) con anotacion de lecturas (furigana) generada a partir de diccionarios como SudachiDict, UniDic y Mozc.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pesos derivados de Bletilla-v0.1-small) |
| Parametros totales | no disponible (sufijo "xsmall" sugiere modelo de baja escala, sin cifra publicada) |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | modelo distribuido ya cuantizado en ONNX; nivel de cuantizacion no especificado |
| Idiomas soportados | japones |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (modelo), JSON (manifiesto), TSV hexadecimal (vocabulario) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo: no se indica si es un transformer denso, un MoE ni variantes hibridas. Lo unico documentado es que los pesos iniciales proceden de un recorte de Bletilla-v0.1-small y que el resultado se exporta a ONNX con cuantizacion aplicada. El paquete incluye un manifiesto que el motor de inferencia lee para cargar el modelo y el vocabulario.

El entrenamiento se realizo sobre un corpus japones con anotacion de lecturas (furigana) en cada texto. Las fuentes incluyen FineWeb-2 japones, fineweb-2-edu-japanese, JetCopper-10B, CC-100 japones, HPLT 3.0 japones, mqa-ja, LLM-jp Corpus v4, Wikipedia en japones, J-ResearchCorpus, libros blancos gubernamentales, el corpus de noticias de livedoor, open2ch, ParallelFiction-Ja_En-100k, Amazon Reviews Multi japones, JESC y Aozora Bunko. La asignacion de lecturas se apoyo en los diccionarios SudachiDict, UniDic y Mozc. No se documenta el volumen total de tokens, la composicion exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto en japones, orientada a un registro que incluye contenido web, noticias, ficcion y resenas de productos segun la composicion del corpus.
- Anotacion de lecturas (furigana) en texto japones, dado que el entrenamiento incorpora lecturas en cada texto de entrenamiento.
- Inferencia mediante ONNX Runtime, lo que permite ejecucion en CPU y en entornos embebidos.
- Capacidades multilingues limitadas al japones segun la etiqueta de idioma declarada.
- Soporte de tool calling, function calling, agentes, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Anotacion de furigana en pipelines editoriales: el modelo se entreno con lecturas asociadas a cada texto, por lo que puede emplearse para generar ruby (furigana) sobre texto japones en flujos de publicacion digital.
- Procesamiento de texto japones en aplicaciones de escritorio: al distribuirse en ONNX cuantizado, puede integrarse en herramientas locales sin depender de servicios en la nube.
- Preprocesamiento de corpus japoneses: util para tareas de normalizacion, segmentacion o enriquecimiento de texto antes de alimentar modelos mayores.
- Generacion de texto auxiliar en entornos con recursos limitados: su tamano reducido y formato ONNX permiten desplegarlo en dispositivos sin GPU dedicada.
- Prototipado rapido de aplicaciones NLP en japones: el paquete autocontenido (manifiesto, modelo y vocabulario) simplifica la puesta en marcha en pruebas de concepto.
- Analisis de resenas y contenido de foros: el corpus de entrenamiento incluye Amazon Reviews Multi y open2ch, lo que puede aprovecharse para clasificacion o resumen de opiniones en japones.
- Experimentacion academica con modelos pequenos en japones: sirve como linea base para comparaciones con modelos de mayor escala bajo la misma licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo "xsmall" cuantizado en ONNX, es previsible que quepa en memoria de CPU, pero no se publica cifra.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no documentada; el formato ONNX permite ejecucion en CPU y potencialmente en GPU mediante ONNX Runtime, sin especificacion del autor.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo); otros runners no documentados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Cymbidium-v1.2-xsmall | no disponible | no disponible | japones | Apache-2.0 | ONNX |
| Bletilla-v0.1-small (origen de pesos) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta el numero de parametros, la arquitectura ni la longitud de contexto, lo que impide evaluar su idoneidad para tareas que requieran ventanas largas.
- El modelo esta especializado exclusivamente en japones; su uso en castellano u otros idiomas no esta soportado segun la etiqueta de idioma.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad frente a alternativas.
- El nivel de cuantizacion aplicada no se especifica, lo que puede afectar a la fidelidad de las salidas respecto al modelo original.
- Al derivarse de un recorte de Bletilla-v0.1-small, hereda las limitaciones y sesgos de ese modelo base, que no se documentan.
- El corpus de entrenamiento incluye fuentes de foros (open2ch) y resenas, lo que puede introducir sesgos de registro informal o contenido no filtrado.
- Riesgo de alucinacion no cuantificado; al ser un modelo de baja escala, es previsible una mayor tasa de errores facticos, aunque no hay datos que lo confirmen.
- La licencia Apache-2.0 permite uso comercial, pero las licencias de los datasets de entrenamiento (algunas con atribucion como CC BY-SA 4.0 o ODC-BY 1.0) pueden imponer obligaciones adicionales sobre los datos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/esehe/Cymbidium-v1.2-xsmall
- Modelo origen de pesos: https://huggingface.co/esehe/Bletilla-v0.1-small
- FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- fineweb-2-edu-japanese: https://huggingface.co/datasets/hotchpotch/fineweb-2-edu-japanese
- JetCopper-10B: https://huggingface.co/datasets/sudy-super/JetCopper-10B
- CC-100 japones: https://huggingface.co/datasets/range3/cc100-ja
- HPLT 3.0: https://huggingface.co/datasets/HPLT/HPLT3.0
- mqa-ja: https://huggingface.co/datasets/hpprc/mqa-ja
- LLM-jp Corpus v4: https://huggingface.co/datasets/llm-jp/llm-jp-corpus-v4
- J-ResearchCorpus: https://huggingface.co/datasets/kunishou/J-ResearchCorpus
- open2ch: https://huggingface.co/datasets/p1atdev/open2ch
- ParallelFiction-Ja_En-100k: https://huggingface.co/datasets/NilanE/ParallelFiction-Ja_En-100k
- JESC: https://huggingface.co/datasets/nntsuzu/JESC
- Aozora Bunko: https://www.aozora.gr.jp/
