# malinali-app/opus-mt-es-rw

## Resumen

`malinali-app/opus-mt-es-rw` es un paquete de pesos para traduccion automatica de espanol a kinyarwanda (ruandes), publicado por el desarrollador malinali-app. No es un modelo entrenado desde cero: consiste en una reempaquetado de los pesos del modelo `Helsinki-NLP/opus-mt-es-rw` de la familia OPUS-MT, convertidos a safetensors y acompanados de tokenizadores rapidos en formato JSON para su uso con el runtime Candle dentro de la aplicacion Malinali.

La relevancia del paquete es practica: OPUS-MT distribuye los pesos originales en formato Marian binario con tokenizadores SentencePiece, lo que complica su integracion en stacks modernos. Esta version ofrece `model.safetensors`, `config.json` y dos tokenizadores separados (codificador y decodificador) en formato Hugging Face fast tokenizer, lo que permite cargar el modelo con `transformers` o con `candle` sin conversion adicional. Con 76.105.067 parametros y un repositorio de 0,3 GB, esta pensado para inferencia en dispositivo (movil, escritorio, edge).

El modelo traduce exclusivamente en la direccion es → rw y esta orientado a un par linguistico de recursos limitados, con pocas alternativas publicas de calidad. La model card indica explicitamente que Malinali no reclama la propiedad del modelo entrenado y que la licencia debe seguirse segun la tarjeta del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder con atencion) |
| Parametros totales | 76.105.067 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los modelos OPUS-MT de Marian suelen entrenarse con secuencias de 512 tokens, sin confirmacion en esta ficha) |
| Tipos de cuantizacion | no disponible; solo se distribuyen pesos en safetensors sin variantes cuantizadas documentadas |
| Idiomas soportados | es (espanol), rw (kinyarwanda); direccion unica es → rw |
| Licencia | no disponible en HuggingFace; la model card remite a la del modelo original (Helsinki-NLP OPUS-MT, habitualmente CC-BY 4.0) |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` + tokenizadores fast JSON (`tokenizer-enc.json`, `tokenizer-dec.json`) |

## Arquitectura y entrenamiento

La arquitectura es MarianMT, un transformer secuencia a secuencia con encoder y decoder, desarrollado originalmente por el grupo Helsinki-NLP (Universidad de Helsinki) dentro del proyecto OPUS-MT. El modelo tiene 76.105.067 parametros, un tamano tipico de la familia Marian base, y fue entrenado con datos paralelos del corpus OPUS para el par es → rw. No hay informacion en la model card sobre el numero exacto de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO; los modelos OPUS-MT se entrenan tipicamente con aprendizaje supervisado estandar sobre corpus paralelos.

La innovacion del paquete publicado por malinali-app no esta en el entrenamiento, sino en el empaquetado: la conversion de los pesos Marian a safetensors y la conversion de los tokenizadores SentencePiece a JSON de tokenizador rapido de Hugging Face, con tokenizadores separados para fuente y destino. Esto habilita la ejecucion con Candle (a traves del componente `marian_flutter`) y con `transformers` sin pasos de conversion, algo poco habitual en modelos OPUS-MT. El autor declara explicitamente que solo reempaqueta pesos y convierte tokenizadores, sin reclamar autoria sobre el modelo entrenado.

## Capacidades

- Traduccion automatica de espanol a kinyarwanda, en una unica direccion.
- Generacion de texto condicionada por la entrada (pipeline `text2text-generation` / `translation`).
- Inferencia en dispositivo mediante Candle y mediante la libreria `transformers`.
- Tokenizacion rapida en origen y destino, con ficheros JSON independientes para cada lado.
- Compatibilidad con endpoints (`endpoints_compatible` segun las etiquetas del repositorio).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- No se documenta soporte multilingue mas alla del par es → rw; no hay evidencia de traduccion inversa rw → es en este repositorio.

## Casos de uso

- Traduccion offline en aplicaciones moviles: el modelo, con 76 M de parametros y 0,3 GB de repositorio, puede ejecutarse en el dispositivo con Candle sin conexion a red, lo que resulta adecuado para aplicaciones de traduccion en contextos con conectividad limitada.
- Ayuda humanitaria y cooperacion al desarrollo: traduccion de materiales informativos, formularios y comunicados de espanol a kinyarwanda para poblaciones desplazadas o comunidades de la diaspora, donde el par linguistico tiene pocos recursos comerciales.
- Comunicacion sanitaria: traduccion de instrucciones medicas, prospectos o mensajes de triaje desde espanol para personal sanitario que atiende a hablantes de kinyarwanda.
- Servicios legales y administrativos: traduccion de documentacion basica (citas, notificaciones, formularios de extranjeria) para facilitar la comprension inicial, siempre con revision humana posterior.
- Educacion y materiales didacticos: traduccion de guias, ejercicios o contenidos de formacion desde espanol a kinyarwanda para programas de alfabetizacion o formacion profesional.
- Localizacion de software y contenidos web: traduccion por lotes de cadenas de interfaz, mensajes de aplicacion y documentacion de producto para mercados de habla kinyarwanda.
- Preprocesado en pipelines de datos: generacion de traducciones sinteticas es → rw para aumento de datos o para alimentar sistemas de recuperacion de informacion multilingue.
- Integracion en canales de atencion al ciudadano: traduccion de mensajes entrantes/salientes en plataformas de chat, con supervision humana dado el caracter automatico del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas BLEU, chrF, MMLU, HumanEval ni ninguna otra, y la busqueda web realizada no aporto resultados tecnicos relevantes sobre este paquete concreto. No se deben asumir cifras de calidad para el par es → rw sin una evaluacion propia.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 0,3 GB para los pesos (76,1 M de parametros), mas memoria para activaciones y tokenizadores.
- VRAM estimada en FP16: aproximadamente 0,15 GB; en int8, en torno a 0,08 GB, aunque no se distribuyen variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no requiere A100/H100. Una RTX 4090 o una GPU consumer modesta quedan muy por encima de las necesidades del modelo.
- Cabe holgadamente en GPU consumer (GTX 1050, RTX 3060, etc.) y tambien en CPU, e incluso en dispositivos moviles, que es el objetivo declarado del paquete.
- Opciones de despliegue: `transformers` (PyTorch), Candle mediante `marian_flutter`, y cualquier runtime capaz de cargar safetensors con arquitectura Marian. No hay evidencia de soporte para vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles. Al ser un modelo de 76 M de parametros orientado a dispositivo, se espera una latencia baja, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-es-rw | 76.105.067 | no disponible | es → rw | no disponible (hereda la del modelo base) | safetensors + tokenizadores JSON |
| Helsinki-NLP/opus-mt-es-rw | no disponible en la informacion proporcionada | no disponible | es → rw | segun model card de OPUS-MT (habitualmente CC-BY 4.0) | pesos Marian + SentencePiece |
| Otros modelos OPUS-MT de la familia Helsinki-NLP | variable (tipicamente ~70-80 M en la variante base) | no disponible | multiples pares | CC-BY 4.0 en la mayoria de variantes | pesos Marian + SentencePiece |

No se dispone de informacion sobre modelos alternativos especificos para el par es → rw ni de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Traduccion en una unica direccion: solo es → rw; no hay soporte para rw → es en este repositorio.
- Par linguistico de bajos recursos: la calidad esperada para es → rw es inferior a la de pares con grandes volumenes de datos paralelos, y no hay metricas publicadas que la cuantifiquen.
- Riesgo de alucinacion y de traducciones erroneas, especialmente en terminologia especializada (medica, legal, tecnica) o en textos con jerga.
- Sesgos potenciales heredados de los corpus OPUS y del modelo base, sin auditar en esta publicacion.
- Longitud de contexto no documentada; entrada muy larga puede truncarse o degradar la calidad.
- Licencia no declarada en HuggingFace: el autor remite a la del modelo upstream. Antes de uso comercial es imprescindible verificar la licencia de `Helsinki-NLP/opus-mt-es-rw` (habitualmente CC-BY 4.0, que exige atribucion).
- El modelo es un reempaquetado, no un entrenamiento nuevo: las limitaciones del modelo original se mantienen intactas.
- No se documentan variantes cuantizadas ni garantias de compatibilidad con runtimes distintos de `transformers` y Candle.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Para uso en produccion se recomienda evaluacion propia con un conjunto de referencia es → rw y revision humana en dominios sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-es-rw
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-es-rw
- Proyecto OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app

Nota: la busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo ni sobre el par es → rw; los resultados obtenidos correspondian a dominios sin relacion con el tema y se han descartado.
