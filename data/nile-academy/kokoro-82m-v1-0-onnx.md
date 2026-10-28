# nile-academy/kokoro-82m-v1.0-onnx

## Resumen

Kokoro 82M v1.0 ONNX es un espejo del modelo de sintesis de voz Kokoro v1.0 (familia publicada en enero de 2025), convertido a ONNX en precision FP32 por la comunidad ONNX y replicado sin cambios en el repositorio de nile-academy. El modelo resuelve texto a voz (TTS) en ocho idiomas —ingles, espanol, frances, hindi, italiano, japones, portugues y chino— con un total de 82 millones de parametros, lo que lo situa en la franja de modelos ligeros aptos para ejecucion en CPU o en GPU de consumo.

La relevancia de este repositorio concreto no esta en la arquitectura, sino en el formato de distribucion: pesos ONNX FP32 mas 54 tablas de presets de voz v1 y la tabla legacy `af.bin`, sin ficheros pickle ni fonemizador ejecutable. Es un paquete declarativo de datos de modelo, tokenizador y voces, pensado para ser consumido por una implementacion separada que aporte el fonemizador y el runtime. La model card es explicita al respecto: no se reclama un grafo ni un backend universal, y la cobertura de idiomas depende de un fonemizador cualificado de forma independiente.

El autor advierte tambien de que la calidad no es homogenea: `af_heart` se presenta como la referencia solida en ingles, mientras que el resto de presets son opcionales y estan calificados de forma desigual. Las verificaciones de inferencia nativa, inteligibilidad en todos los idiomas, estabilidad en textos largos y rendimiento sostenido en movil o navegador quedan pendientes segun la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; el repositorio lleva la etiqueta `style_text_to_speech_2` (familia StyleTTS2) |
| Parametros totales | 82M |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo TTS; la card no documenta ventana de contexto textual) |
| Tipos de cuantizacion | Solo FP32 en este repositorio (conversion ONNX Community FP32); no se incluyen variantes cuantizadas |
| Idiomas soportados | en, es, fr, hi, it, ja, pt, zh (cobertura de la familia upstream; requiere fonemizador aparte) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (FP32) + tablas de presets de voz en bruto: 54 tablas v1 y la tabla legacy `af.bin` |
| Tarea (pipeline) | text-to-speech |
| Voces incluidas | 54 presets v1 + `af.bin` legacy; `af_heart` como referencia fuerte en ingles |
| Tamano del repositorio | 0,4 GB |
| Autor del repositorio | nile-academy (espejo de la conversion ONNX Community) |
| Fecha de publicacion | 2026-10-28 (metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La model card de este repositorio no describe la arquitectura interna ni el proceso de entrenamiento: se limita a conservar los avisos originales sobre pesos y datos, la procedencia exacta de la fuente y los resultados de inspeccion estructural. La unica senal arquitectonica disponible es la etiqueta `style_text_to_speech_2`, que situa la familia en el linaje StyleTTS2. Cualquier afirmacion adicional sobre capas, atencion o modulos de duracion seria una extrapolacion no respaldada por la informacion proporcionada.

Lo que si documenta el autor es el contenido del paquete: pesos ONNX FP32, datos de tokenizador y de voces, y ficheros de procedencia (`source-manifest.json`, con revisiones inmutables, hashes y resultados de inspeccion estructural, y `files.json`, que fija el espejo exacto). Se verifica que las dimensiones y la finitud de las tablas en bruto pasan, asi como la integridad byte a byte del espejo. No hay ficheros pickle, ni fonemizador ejecutable, ni codigo Python/Node, ni binarios de runtime, ni SDK, ni audio generado. Las comprobaciones semanticas, nativas y de frontend de ONNX, la calidad por idioma y la inferencia Wekala quedan declaradas como pendientes.

## Capacidades

- Sintesis de voz a partir de texto en ocho idiomas: ingles, espanol, frances, hindi, italiano, japones, portugues y chino, sujeto a un fonemizador cualificado externo.
- Seleccion de timbre mediante presets: 54 tablas de voz v1 mas la tabla legacy `af.bin`, lo que permite cubrir distintos registros y generos dentro de la familia.
- Referencia de calidad declarada en `af_heart` para ingles, segun la evaluacion del publicador citada en la model card.
- Distribucion en ONNX FP32, consumible por runtimes ONNX estandar siempre que se aporte la implementacion de frontend y el fonemizador correspondientes.
- Paquete reproducible: manifiesto de origen con hashes y revisiones inmutables, util para pipelines con requisitos de procedencia.
- No incluye soporte de tool calling, function calling ni razonamiento multi-paso: es un modelo de sintesis, no un modelo de lenguaje.
- No incluye capacidades de vision ni de audio de entrada; la unica modalidad de entrada es texto (fonemizado) y la de salida, audio.

## Casos de uso

- Narracion de audiolibros y contenido largo: el modelo permite generar voz sintetica en varios idiomas con presets consistentes; conviene trocear el texto y validar la estabilidad en pasajes largos, ya que esa prueba figura como pendiente en la model card.
- Accesibilidad y lectura de pantalla: su tamano de 82M y su formato ONNX FP32 (aproximadamente 328 MB de pesos) facilitan integrarlo en aplicaciones de escritorio que lean documentos o interfaces para personas con discapacidad visual.
- Sistemas de atencion al cliente con respuesta vocal: genera locuciones para flujos IVR o respuestas predefinidas en ocho idiomas, aunque el texto debe pasar antes por un fonemizador cualificado para cada idioma.
- Localizacion y doblaje de material formativo: un mismo pipeline permite producir versiones en es, fr, it, pt o hi de un guion, manteniendo un preset de voz fijo por idioma para conservar coherencia de marca.
- Prototipado rapido de productos de voz: al ser un paquete ONNX sin dependencias de Python, encaja en prototipos de escritorio o servicios ligeros donde se quiere evitar arrastrar un stack de deep learning completo.
- Generacion de assets de audio en CI: el repositorio incluye manifiestos con hashes, de modo que la generacion de locuciones puede formar parte de un pipeline reproducible con verificacion de procedencia de pesos y voces.
- Pruebas de regresion de calidad TTS: al fijar el espejo con `files.json`, sirve como referencia estable para comparar cambios en el fonemizador o en el runtime sin que varíen los pesos.
-experimentacion comparativa en investigacion: al ser una copia compacta de la familia v1.0, es util como linea base ligera frente a modelos TTS de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la evidencia de seleccion del publicador en el fichero `EVAL.md` del repositorio original `hexgrad/Kokoro-82M`, pero no se incluyen cifras numericas en la informacion proporcionada, y el propio autor separa explicitamente la calidad reportada por el publicador de las mediciones independientes de Wekala.

| Metrica | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K u otros benchmarks de LLM | No aplica (modelo TTS) |
| Metricas TTS (MOS, WER, similitud de hablante) | No disponibles en la informacion proporcionada |
| Evaluacion por voz e idioma | Declarada como desigual y pendiente de verificacion; solo `af_heart` se destaca como referencia fuerte en ingles |
| Inferencia nativa ONNX | Pendiente segun la model card |
| Estabilidad en textos largos | Pendiente segun la model card |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP32 de 82M parametros ocupan aproximadamente 328 MB (calculo directo: 82 x 10^6 x 4 bytes), lo que es coherente con el tamano de repositorio de 0,4 GB. El consumo total de runtime sera algo superior por activaciones y buffers intermedios. No se publican cifras medidas.
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM libre deberia poder alojar los pesos; no se especifican modelos validados (A100, H100, RTX 4090 u otros) en la informacion disponible.
- GPU de consumo: si, es esperable que quepa en practicamente cualquier GPU de consumo reciente e incluso en iGPU con memoria compartida, dado el tamano del modelo; no hay datos de latencia publicados.
- CPU: el tamano hace plausible la inferencia en CPU, pero no se han publicado medidas de latencia ni de factor de tiempo real.
- Movil y navegador: el autor declara explicitamente que el rendimiento sostenido en movil y navegador es una puerta de aceptacion separada y aun no verificada.
- Opciones de despliegue: ONNX Runtime u otro runtime compatible con ONNX, acompanado de un fonemizador cualificado y de una implementacion de frontend. Herramientas orientadas a LLM como vLLM, TGI o llama.cpp no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| nile-academy/kokoro-82m-v1.0-onnx (este repositorio) | 82M | No aplica / no disponible | 8 | Apache-2.0 | ONNX FP32 + tablas de voces | Espejo de la conversion ONNX Community, replicado sin cambios; sin fonemizador ejecutable |
| hexgrad/Kokoro-82M (familia upstream citada en la card) | 82M | No aplica / no disponible | 8 | Apache-2.0 | Pesos originales del publicador | Fuente de la evidencia de seleccion (`EVAL.md`); la card no detalla su formato exacto en este repositorio |
| Otros modelos TTS ligeros (p. ej. familias tipo VITS o Piper) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible | No se han aportado datos comparativos en la busqueda web realizada |

## Limitaciones y advertencias

- Calidad desigual entre voces e idiomas: la model card indica que solo `af_heart` esta fuertemente calificada en ingles y que el resto de presets son opcionales y con evaluacion no uniforme. No debe asumirse calidad equivalente en los ocho idiomas.
- Dependencia de un fonemizador externo: el repositorio no incluye fonemizador ejecutable. La cobertura linguistica real depende de un fonemizador cualificado de forma independiente; sin el, el modelo no genera voz por si mismo.
- Sin verificacion de inferencia nativa: las comprobaciones semanticas, nativas y de frontend de ONNX figuran como pendientes, y el autor no reclama un grafo ni un backend universal.
- Estabilidad en textos largos no validada: la sintesis de pasajes extensos requiere pruebas propias antes de usarse en produccion.
- Rendimiento en movil y navegador no verificado: se declara como puerta de aceptacion separada.
- Licencia Apache-2.0: permite uso comercial sujeto a sus terminos, pero no otorga derechos sobre identidades de terceros, grabaciones de referencia ni contenido de la aplicacion. Los derechos sobre motores ejecutables, fonemizadores y librerias de watermark requieren registros separados.
- Ausencia de validacion comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.
- Trazabilidad de la busqueda web: los resultados obtenidos corresponden a entidades no relacionadas (el rio Nilo, una consultora de asuntos publicos y una marca de ropa), por lo que no aportan informacion tecnica sobre el modelo.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto libre, pero no se documentan evaluaciones de robustez frente a texto fuera de dominio, abreviaturas o ruido en la entrada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nile-academy/kokoro-82m-v1.0-onnx
- Evidencia de seleccion del publicador (EVAL.md, revision fijada): https://huggingface.co/hexgrad/Kokoro-82M/blob/f3ff3571791e39611d31c381e3a41a3af07b4987/EVAL.md
- Repositorio upstream de la familia Kokoro 82M: https://huggingface.co/hexgrad/Kokoro-82M
- Manifiesto de origen con revisiones y hashes: `source-manifest.json` (en la raiz del repositorio)
- Fichero de vinculacion del espejo: `files.json` (en la raiz del repositorio)
- Resultados de busqueda web: no relevantes (agencia de asuntos publicos, articulos sobre el rio Nilo y una marca de ropa)
