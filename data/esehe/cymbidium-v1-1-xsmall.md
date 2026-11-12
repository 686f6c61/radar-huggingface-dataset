# esehe/Cymbidium-v1.1-xsmall

## Resumen

Cymbidium-v1.1-xsmall es un modelo de lenguaje de pequeno tamano especializado en japones, publicado por el usuario esehe en Hugging Face bajo licencia Apache-2.0. Se distribuye exclusivamente en formato ONNX cuantizado, acompanado de un manifiesto JSON que consume un motor de inferencia propio y de un fichero de vocabulario en TSV con codificacion hexadecimal. No se trata de un modelo pensado para uso generalista, sino de una pieza de un ecosistema de inferencia mas amplio definido por el autor.

El modelo deriva de un modelo anterior del mismo autor, Bletilla-v0.1-small, del que se extrajeron los pesos iniciales. El entrenamiento se realizo sobre un corpus japones compuesto por conjuntos de datos publicos como FineWeb-2, JetCopper-10B, CC-100, HPLT 3.0, LLM-jp Corpus v4, Wikipedia en japones, el corpus de noticias de livedoor, open2ch, JESC y Aozora Bunko, entre otros. Un rasgo distintivo es que los textos de entrenamiento incorporan anotaciones de lectura (furigana) generadas con diccionarios como SudachiDict, UniDic y Mozc.

La relevancia de este modelo es limitada y muy acotada: no hay pipeline declarado, el repositorio tiene un tamano de 0.0 GB (lo que sugiere que los pesos no estan efectivamente alojados o que el tamano reportado no refleja el contenido real), no tiene descargas ni likes, y la model card no proporciona informacion sobre arquitectura, numero de parametros ni longitud de contexto. Debe evaluarse como un experimento de nicho para procesamiento de japones con anotacion de lectura, no como una alternativa a modelos de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; por el nombre "xsmall" y el ecosistema del autor se infiere un transformer decoder-only de pequeno tamano, sin confirmacion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantizacion ya aplicada en el fichero ONNX (tipo exacto no disponible) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx`) mas manifiesto JSON y vocabulario TSV hexadecimal |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Los artefactos publicados son tres: un manifiesto JSON que lee el motor de inferencia del autor, el grafo ONNX cuantizado y un vocabulario en formato TSV con codificacion hexadecimal. La ausencia de configuracion estandar (config.json de Hugging Face Transformers) y de pesos en safetensors indica que el modelo no esta pensado para cargarse con las librerias habituales, sino con el runtime propio asociado al manifiesto.

El entrenamiento parte de pesos extraidos de Bletilla-v0.1-small y utiliza un corpus japones amplio y heterogeneo: web filtrada (FineWeb-2 y su variante educativa), texto de alta calidad (JetCopper-10B, LLM-jp Corpus v4), datos multilingues (CC-100, HPLT 3.0), Wikipedia, documentos gubernamentales (libros blancos), noticias (livedoor), foros (open2ch), resenas de Amazon, subtitulos (JESC) y literatura de dominio publico (Aozora Bunko). El elemento diferenciador es la anotacion de lectura: cada texto se acompana de su lectura en kana, generada consultando SudachiDict, UniDic y los diccionarios de Mozc. No se indica si hubo RLHF, DPO ni el numero total de tokens de entrenamiento.

## Capacidades

- Generacion de texto en japones, orientada presumiblemente a tareas de procesamiento morfologico y anotacion de lectura, aunque la model card no detalla las capacidades exactas.
- Manejo de texto japones con informacion de lectura (furigana), dado el diseno del corpus de entrenamiento.
- Cobertura de registros diversos (web, noticias, foros, literatura, documentos administrativos) gracias a la composicion del dataset.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo japones declarado.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Anotacion de lectura en japones: el modelo se entreno con textos que incluyen lecturas generadas por diccionarios morfologicos, por lo que es adecuado para experimentar con la asignacion automatica de furigana en pipelines de procesamiento de texto japones.
- Preprocesamiento linguistico en proyectos de NLP japones: puede integrarse como componente en flujos que requieran normalizacion o enriquecimiento de texto japones antes de pasarlo a un modelo mayor.
- Prototipado con ONNX Runtime: al distribuirse en ONNX cuantizado, sirve para validar despliegues de inferencia ligera en entornos donde no se dispone de GPUs o donde se prefiere un runtime portable.
- Experimentacion educativa: su tamano reducido (etiqueta "xsmall") y su licencia permisiva lo hacen util para estudiar el comportamiento de modelos pequenos entrenados exclusivamente en japones.
- Generacion de texto japones de dominio acotado: con un corpus que incluye noticias, foros y resenas, puede emplearse en tareas de continuacion o resumen de textos de esos registros, siempre con validacion humana.
- Investigacion sobre datos de entrenamiento: la model card documenta con detalle las fuentes y sus licencias, lo que permite reproducir o auditar la composicion del corpus en estudios sobre sesgos y procedencia de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un modelo "xsmall" cuantizado en ONNX, es probable que quepa en CPU y en GPUs de consumo, pero no hay datos confirmados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el etiquetado "xsmall" y la cuantizacion es plausible, pero no se puede afirmar sin especificaciones.
- Opciones de despliegue: el modelo requiere el motor de inferencia que consume el manifiesto JSON del autor; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. ONNX Runtime es el runtime natural para el fichero `.onnx`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Cymbidium-v1.1-xsmall | no disponible | no disponible | ja | Apache-2.0 | ONNX | Repositorio de 0.0 GB, sin descargas |
| Bletilla-v0.1-small (modelo origen) | no disponible | no disponible | ja (presumible) | no disponible | no disponible | Referenciado en la model card |
| Alternativas japonesas de proposito general (p. ej. familia LLM-jp) | no disponible en esta ficha | no disponible | ja | variable | safetensors | publicas en Hugging Face |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card no documenta arquitectura, parametros, contexto ni proceso de alineacion, lo que impide evaluar su calidad de forma rigurosa.
- El repositorio reporta un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar disponibles o que el contenido no se ha subido correctamente; conviene verificar antes de integrarlo.
- El modelo solo declara japones; no hay evidencia de capacidades en castellano ni en otras lenguas.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado por el autor.
- Dependencia de un motor de inferencia propietario del autor (manifiesto JSON); no es plug-and-play con el ecosistema estandar de Transformers.
- El corpus incluye fuentes con licencias diversas (ODC-BY, CC0, CC BY-SA, Apache-2.0, licencias de papers individuales); aunque el modelo se publica como Apache-2.0, la procedencia de los datos merece revision para usos comerciales sensibles.
- Sin descargas ni likes: no hay senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/esehe/Cymbidium-v1.1-xsmall
- Modelo origen Bletilla-v0.1-small: https://huggingface.co/esehe/Bletilla-v0.1-small
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
