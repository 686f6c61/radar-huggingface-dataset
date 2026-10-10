# adamnaciri/tarjama-models

## Resumen

adamnaciri/tarjama-models no es un unico modelo, sino un repositorio que empaqueta cinco conjuntos de pesos listos para ejecutarse en el navegador, empleados por la aplicacion Tarjama para traducir en directo la jutba del viernes del arabe al italiano, al ingles o al frances. La inferencia se realiza sobre CPU dentro de Chrome mediante onnxruntime-web y transformers.js, sin GPU ni backend remoto.

El repositorio combina un modelo de reconocimiento automatico del habla en arabe (la cabeza CTC del FastConformer hibrido de NVIDIA, exportado y cuantizado por el autor) con varios modelos de traduccion OPUS-MT de Helsinki-NLP convertidos a ONNX en cuantizacion q8, incluyendo variantes en formato ORT de ONNX Runtime para dispositivos moviles. El repositorio ocupa 1,9 GB y su licencia es mixta.

Su relevancia actual es practica: demuestra un pipeline completo de voz a texto mas traduccion ejecutandose integramente en el cliente, lo que reduce costes de servidor y evita enviar audio a terceros. En contrapartida, el repositorio es reciente, no tiene descargas ni likes ni resultados de benchmarks publicados, y el autor solo ha realizado conversion de formato y cuantizacion, sin reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reconocimiento de voz: FastConformer hibrido con decodificacion CTC. Traduccion: transformer encoder-decoder tipo Marian (familia OPUS-MT) |
| Parametros totales | no disponible (no se declara en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ASR: int8, solo capas MatMul, cuantizacion por canal y rango reducido. Traduccion: q8 |
| Idiomas soportados | Entrada de audio: arabe. Traduccion documentada: arabe a italiano, arabe a ingles y arabe a frances. El modelo origen opus-mt-tc-bible-big-afa-fra_ita_por_spa declara destinos adicionales (portugues y espanol), pero en este repositorio solo se documenta el prefijo `>>ita<< ` |
| Licencia | Mixta (`license: other`, `license_name: mixed`): CC-BY-4.0 para los pesos de NVIDIA y Apache-2.0 para los modelos de Helsinki-NLP y las conversiones de Xenova |
| Formato de pesos | ONNX (para transformers.js) y ORT de ONNX Runtime (nivel de optimizacion "extended"; los ficheros de traduccion conservan la extension `.onnx`) |

## Arquitectura y entrenamiento

El componente de reconocimiento de voz corresponde al modelo `stt_ar_fastconformer_hybrid_large_pcd_v1.0` de NVIDIA, una arquitectura FastConformer hibrida, exportada en este repositorio utilizando su cabeza CTC. El autor no ha reentrenado ni ajustado los pesos: las unicas modificaciones declaradas son la conversion de formato (ONNX y ORT) y la cuantizacion de pesos. La cuantizacion aplicada al ASR es int8 restringida a las capas MatMul, con escala por canal y rango reducido, un ajuste que suele preservar mejor la precision en modelos acusticos.

Los componentes de traduccion son modelos Marian (transformer encoder-decoder) de la familia OPUS-MT de Helsinki-NLP. Se incluye una variante multilingue grande (`opus-mt-tc-bible-big-afa-fra_ita_por_spa`, que requiere el prefijo `>>ita<< ` para seleccionar el idioma destino) y variantes directas y mas ligeras arabe-italiano, arabe-ingles y arabe-frances. Todas se distribuyen en q8; las conversiones a ONNX de los modelos arabe-ingles proceden del trabajo publicado por Xenova. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta de los corpus, ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion principal del repositorio es de empaquetado y despliegue: el uso del formato ORT con optimizacion "extended" y pesos aplicados en el lugar reduce aproximadamente a la mitad el consumo de memoria respecto al ONNX equivalente, manteniendo una salida identica.

## Capacidades

- Reconocimiento automatico del habla en arabe con salida de transcripcion mediante cabeza CTC.
- Traduccion de texto arabe a italiano, con dos alternativas: el modelo multilingue grande (prefijo `>>ita<< `) y una variante ligera para telefonos.
- Traduccion de texto arabe a ingles y de texto arabe a frances, en versiones q8.
- Ejecucion en navegador sobre CPU con onnxruntime-web y transformers.js, sin aceleracion por GPU.
- Carga selectiva de pesos y ejecucion de los mismos ficheros en formato ONNX o ORT segun el dispositivo.
- Capacidad multilingue limitada al par arabe como origen y a los idiomas destino enumerados.
- No dispone de soporte documentado de tool calling, function calling, uso como agente, razonamiento multi-paso, vision, audio de salida ni modo de pensamiento extendido.

## Casos de uso

- Traduccion en directo de la jutba del viernes: el pipeline encadena el ASR FastConformer con el modelo OPUS-MT correspondiente para convertir audio arabe en subtitulos en italiano, ingles o frances dentro de una pestana de Chrome, sin servidor intermedio.
- Subtitulado de eventos religiosos y comunitarios: cualquier reunion con ponente arabofono puede subtitularse en el navegador del asistente, reutilizando el segmentado de audio de la aplicacion Tarjama.
- Accesibilidad para personas sordas: transcripcion y traduccion simultaneas de una alocucion en arabe, mostradas como texto en tiempo real sin depender de APIs en la nube.
- Procesamiento con requisitos de privacidad: al ejecutarse integramente en el cliente, el audio no abandona el dispositivo, lo que resulta adecuado para contextos sanitarios, legales o de consulta religiosa donde no se permite subir contenido a terceros.
- Despliegue en movil: la variante `opus-mt-ar-it-ort` esta pensada para telefonos y, junto al formato ORT, reduce la huella de memoria aproximadamente a la mitad respecto al ONNX equivalente.
- Prototipado con transformers.js: sirve como referencia de conversion y cuantizacion de modelos Marian y FastConformer para aplicaciones web, incluyendo la estructura de carpetas con variantes ONNX y ORT.
- Extensiones de navegador y PWA: integracion en complementos que traduzcan contenido audiovisual en arabe sin backend propio, aprovechando que los pesos se cargan bajo demanda.
- Transcripcion por lotes de grabaciones en arabe: el modelo FastConformer puede utilizarse de forma aislada sobre ficheros ya existentes para generar transcripciones en servidor con ONNX Runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de WER para el modelo acustico, ni de BLEU, chrF o COMET para los modelos de traduccion, ni comparaciones frente a los pesos originales sin cuantizar. Tampoco se documentan medidas de latencia, throughput ni consumo de memoria mas alla de la indicacion cualitativa de que el formato ORT reduce aproximadamente a la mitad la memoria.

## Requisitos de hardware

- Inferencia sobre CPU: el diseno del repositorio asume ejecucion en CPU dentro de Chrome con onnxruntime-web y transformers.js; no requiere GPU.
- VRAM estimada: no aplica para el escenario de navegador documentado; no se publican cifras de memoria para despliegues con aceleracion.
- GPU recomendadas: no disponible; el autor no documenta escenarios con GPU.
- Compatibilidad con GPU de consumo: no aplica al caso de uso principal, que es CPU. Los ficheros ONNX y ORT pueden ejecutarse en GPU mediante ONNX Runtime, pero no hay configuracion ni cifras publicadas por el autor.
- Tamano del repositorio: 1,9 GB en total, aunque la aplicacion carga solo el subconjunto necesario. La cuantizacion int8 y q8 reduce el peso de cada modelo, y las variantes ORT rebajan aproximadamente a la mitad el uso de memoria durante la ejecucion.
- Opciones de despliegue: onnxruntime-web y transformers.js en navegador (escenario documentado); ONNX Runtime en servidor o en el borde como opcion no documentada por el autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Categoria | Idiomas | Formato | Ejecutable en navegador | Licencia | Parametros |
|---|---|---|---|---|---|---|
| adamnaciri/tarjama-models | ASR arabe + traduccion desde arabe | ar; salidas it, en, fr | ONNX, ORT (int8/q8) | Si, via transformers.js y onnxruntime-web | Mixta (CC-BY-4.0 y Apache-2.0) | no disponible |
| NVIDIA stt_ar_fastconformer_hybrid_large_pcd_v1.0 | ASR arabe | ar | NeMo (.nemo), sin cuantizar | No | CC-BY-4.0 | no disponible |
| Helsinki-NLP/opus-mt-ar-en | Traduccion ar a en | ar, en | PyTorch, safetensors | No de forma nativa | Apache-2.0 | no disponible |
| Xenova/opus-mt-ar-en | Traduccion ar a en | ar, en | ONNX | Si, via transformers.js | Apache-2.0 | no disponible |

La diferencia frente a los originales es exclusivamente de formato y cuantizacion: este repositorio anade variantes ejecutables en el navegador y una ruta ligera para movil, pero no aporta mejoras de calidad. Frente a otras alternativas de traduccion multilingue (por ejemplo, la familia NLLB-200) no hay datos comparativos publicados en la informacion disponible.

## Limitaciones y advertencias

- Licencia mixta: cada subcarpeta se rige por su propia licencia. Los pesos de NVIDIA son CC-BY-4.0 y exigen atribucion; los modelos de Helsinki-NLP son Apache-2.0. Antes de un uso comercial es obligatorio revisar el fichero LICENSE del repositorio y las condiciones de cada componente.
- Ausencia de validacion comunitaria: cero descargas y cero likes, sin pruebas independientes ni resultados publicados que respalden la calidad de las versiones cuantizadas.
- No es un modelo entrenado por el autor: solo hay conversion de formato y cuantizacion, por lo que hereda integramente los sesgos de los modelos de origen.
- Riesgo de degradacion por cuantizacion: no se publica comparacion de WER o BLEU entre los pesos int8/q8 y los originales en precision completa.
- Sesgo de dominio: el modelo multilingue grande pertenece a la familia `tc-bible-big`, entrenada con corpus de dominio biblico, lo que puede producir un registro y un vocabulario poco adecuados para otros dominios.
- Riesgo de alucinacion en traduccion: los modelos Marian pueden repetir, omitir o inventar fragmentos en entradas ruidosas, y el repositorio no documenta ningun mecanismo de mitigacion ni de filtrado.
- Cobertura idiomatica restringida: el ASR solo reconoce arabe y no se documentan variedades dialectales soportadas; el modelo ligero arabe-italiano no admite otros idiomas destino.
- Restricciones del entorno: el escenario documentado es CPU en Chrome con onnxruntime-web, sin cifras de latencia; no hay garantias de rendimiento en tiempo real para audio continuo.
- Longitud de entrada y gestion de segmentos largos: no documentada en este repositorio.
- Carencia de soporte: no se documentan procesos de mantenimiento, versionado ni canal de incidencias.
- Advertencia de produccion: al no existir benchmarks ni pruebas de regresion, cualquier despliegue deberia acompanarse de una evaluacion propia de WER y BLEU antes de sustituir modelos consolidados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/adamnaciri/tarjama-models
- Aplicacion Tarjama (repositorio del autor): https://github.com/Blvkman/Tarjama
- Modelo original de reconocimiento de voz (NVIDIA NGC): https://catalog.ngc.nvidia.com/orgs/nvidia/teams/nemo/models/stt_ar_fastconformer_hybrid_large_pcd
- Modelo de traduccion multilingue original: https://huggingface.co/Helsinki-NLP/opus-mt-tc-bible-big-afa-fra_ita_por_spa
- Modelo de traduccion arabe-italiano ligero: https://huggingface.co/Helsinki-NLP/opus-mt-ar-it
- Modelo de traduccion arabe-ingles original: https://huggingface.co/Helsinki-NLP/opus-mt-ar-en
- Conversion ONNX de arabe-ingles por Xenova: https://huggingface.co/Xenova/opus-mt-ar-en
- Modelo de traduccion arabe-frances original: https://huggingface.co/Helsinki-NLP/opus-mt-ar-fr
