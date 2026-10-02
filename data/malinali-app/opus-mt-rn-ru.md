# malinali-app/opus-mt-rn-ru

## Resumen

El modelo `malinali-app/opus-mt-rn-ru` es un paquete de traduccion automatica neuronal que traduce de kirundi (rn) a ruso (ru). No se trata de un modelo entrenado desde cero, sino de una redistribucion de los pesos de `Helsinki-NLP/opus-mt-rn-ru`, el modelo publico del proyecto OPUS-MT de la Universidad de Helsinki, reempaquetado por el equipo de Malinali para su aplicacion de traduccion en dispositivo.

La relevancia de esta publicacion es fundamentalmente de despliegue: Malinali convierte el tokenizador original de SentencePiece a formato JSON de tokenizador rapido de Hugging Face (`tokenizer-enc.json` y `tokenizer-dec.json`) y expone los pesos en `safetensors`, de modo que el modelo puede ejecutarse con Candle (concretamente el modulo `marian_flutter`) sin depender de PyTorch en tiempo de inferencia. Esto permite traduccion local, sin conexion y con requisitos de memoria muy bajos.

Con 48.663.158 parametros y un repositorio de aproximadamente 0,2 GB, se trata de un modelo seq2seq pequeno, orientado a traducir un par de idiomas de bajos recursos (kirundi) hacia ruso. La ficha de HuggingFace no declara licencia propia: la model card remite a la del modelo original, que en OPUS-MT suele ser CC-BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq encoder-decoder (Marian NMT) |
| Parametros totales | 48.663.158 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | rn (kirundi) como origen, ru (ruso) como destino |
| Licencia | no disponible en el repositorio; la model card indica seguir la licencia del modelo upstream (habitualmente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`) |
| Tokenizadores | JSON de tokenizador rapido separados para codificador (`tokenizer-enc.json`) y decodificador (`tokenizer-dec.json`) |
| Tamano del repositorio | 0,2 GB |
| Libreria declarada | transformers |
| Modelo base | Helsinki-NLP/opus-mt-rn-ru |

## Arquitectura y entrenamiento

La arquitectura corresponde a Marian NMT, una familia de modelos transformer encoder-decoder disenada especificamente para traduccion automatica y utilizada de forma masiva en el proyecto OPUS-MT. El modelo base fue entrenado por Helsinki-NLP sobre corpus paralelos recopilados en el ecosistema OPUS. Los detalles concretos de entrenamiento (numero de tokens, composicion exacta del dataset, numero de capas y dimensiones del modelo) no estan disponibles en la informacion proporcionada; la configuracion exacta puede consultarse en el `config.json` del repositorio y en la model card del modelo upstream.

La innovacion aportada por esta publicacion es de ingenieria de despliegue, no de modelado. Malinali no reclama la propiedad del modelo entrenado: su trabajo consiste en reempaquetar los pesos en `safetensors` y convertir los tokenizadores SentencePiece originales a JSON de tokenizador rapido compatible con la libreria `tokenizers` de Hugging Face. Con ello el modelo puede cargarse desde Candle en Flutter para inferencia local en el dispositivo, sin requerir el stack de PyTorch. El repositorio incluye cuatro ficheros: `config.json` (configuracion Marian), `model.safetensors` (pesos), `tokenizer-enc.json` y `tokenizer-dec.json`.

## Capacidades

- Traduccion de texto directa de kirundi (rn) a ruso (ru), en direccion unica.
- Generacion de texto condicionada (pipeline `text2text-generation`), con soporte nativo en la libreria `transformers`.
- Inferencia en dispositivo mediante Candle, gracias a los tokenizadores convertidos a formato rapido.
- Compatibilidad declarada con endpoints de inferencia (`endpoints_compatible` en las etiquetas del repositorio).
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo de pensamiento.
- No se declara soporte multimodal (ni vision ni audio).
- El soporte multilingue se limita estrictamente al par rn → ru; no hay indicios de generalizacion a otros idiomas.

## Casos de uso

- Traduccion de documentos administrativos y civiles: textos oficiales en kirundi pueden traducirse a ruso de forma local, sin enviar contenido sensible a servicios en la nube, algo relevante en contextos de documentacion legal o migratoria.
- Aplicaciones moviles de traduccion sin conexion: al ejecutarse con Candle en Flutter, el modelo permite integrar traduccion rn → ru embebida en una app, con un peso de repositorio de 0,2 GB y sin coste de API por peticion.
- Atencion al publico en entornos con conectividad limitada o cara: por su tamano reducido (menos de 50 millones de parametros), puede ejecutarse repetidamente en hardware modesto para traducir consultas de usuarios en mostradores de atencion o puntos de informacion.
- Procesamiento por lotes de corpus para investigacion en linguistica: traduccion masiva de textos en kirundi a ruso para construir corpus de analisis, aprovechando el pipeline estandar de `transformers` y su ejecucion por lotes.
- Integracion en pipelines de traduccion multietapa: por su compatibilidad con `transformers`, el modelo puede encadenarse como eslabon intermedio (por ejemplo, rn → ru → otro idioma) mediante composicion de modelos.
- Traduccion de contenido editorial y periodistico: articulos o notas publicadas en kirundi pueden verterse al ruso para difusion en medios o boletines, con revision humana posterior.
- Base para ajuste fino: al publicar los pesos en `safetensors` y el tokenizador en formato estandar, sirve como punto de partida para fine-tuning supervisado del par rn → ru con datos propios de un dominio concreto.
- Verificacion y auditoria lingueistica local: el caracter local del paquete permite auditar el comportamiento del modelo en entornos cerrados, sin exponer datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace no incluye metricas BLEU, chrF ni comparaciones cuantitativas con otros sistemas, y la busqueda web no ha devuelto datos de evaluacion relacionados con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del numero de parametros (48,66 millones): en fp32, en torno a 0,2 GB de pesos; en fp16/bf16, en torno a 0,1 GB; en int8, en torno a 0,05 GB. Estas cifras son estimaciones derivadas del recuento de parametros, no datos publicados por el autor. A la memoria de pesos hay que anadir la memoria de activaciones y del tokenizador, que depende de la longitud de las secuencias.
- GPU recomendadas: no hay recomendaciones publicadas. Por tamano, el modelo es apto para cualquier GPU con al menos 1-2 GB de memoria libre, incluidas integradas.
- Viabilidad en GPU de consumo: si, con margen amplio. Cabe incluso en CPU y en dispositivos moviles, que es el escenario objetivo declarado por el autor (ejecucion on-device con Candle en Flutter).
- Opciones de despliegue: `transformers` (biblioteca declarada), Candle mediante `marian_flutter` para entornos Flutter, y cualquier runtime compatible con safetensors. No se ha confirmado soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| malinali-app/opus-mt-rn-ru | 48,66 M | rn → ru | no disponible | no disponible (remite al upstream) | HuggingFace, safetensors + tokenizadores fast | Reempaquetado para Candle; mismos pesos que el modelo base |
| Helsinki-NLP/opus-mt-rn-ru | no disponible en la informacion proporcionada | rn → ru | no disponible | habitualmente CC-BY 4.0 en OPUS-MT | HuggingFace, pesos originales | Modelo upstream del que deriva esta publicacion |
| NLLB-200-distilled-600M | 600 M | 200 idiomas, incluidos rn y ru | no disponible en la informacion proporcionada | CC-BY-NC 4.0 (uso no comercial) | HuggingFace | Mayor cobertura idiomatica y tamano muy superior; la licencia restringe el uso comercial |
| M2M-100 (418M) | 418 M | 100 idiomas | no disponible en la informacion proporcionada | MIT | HuggingFace | Alternativa multilingue de tamano intermedio |

Las cifras de parametros de NLLB-200-distilled-600M y M2M-100-418M corresponden a sus variantes mas conocidas; los valores de contexto y licencia deben verificarse en sus fichas respectivas antes de tomar decisiones de produccion.

## Limitaciones y advertencias

- Direccion unica: el modelo solo traduce de rn a ru. Para el sentido inverso es necesario un modelo distinto.
- Idioma de bajos recursos: el kirundi cuenta con menos datos paralelos que idiomas mayoritarios, lo que suele traducirse en menor calidad y mayor variabilidad en la salida. No hay metricas publicadas que cuantifiquen esta limitacion para este modelo concreto.
- Riesgo de alucinacion y de omisiones: como todo modelo seq2seq de traduccion, puede generar contenido no presente en el original, omitir fragmentos o repetir segmentos, especialmente con entradas largas, ruidosas o fuera de dominio.
- Longitud de contexto no documentada: se desconoce la ventana maxima soportada en esta publicacion. No deben enviarse documentos largos sin troceado previo y verificacion.
- Licencia no declarada en el repositorio: la model card remite a la del modelo upstream, que en OPUS-MT suele ser CC-BY 4.0, pero este dato no esta confirmado en la informacion proporcionada. Antes de un uso comercial debe verificarse la licencia exacta de `Helsinki-NLP/opus-mt-rn-ru` y las condiciones de atribucion.
- Cero adopcion verificable: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe evidencia comunitaria de calidad ni de comportamiento en produccion.
- Sin benchmarks ni evaluacion publicada: no hay BLEU, chrF ni comparaciones con sistemas comerciales que permitan estimar la calidad real de la traduccion.
- Fecha de publicacion atipica (2026-10-02 segun los metadatos) y ausencia de historial de actualizaciones: conviene tratar el repositorio como un artefacto sin mantenimiento confirmado.
- Los tokenizadores estan divididos en dos ficheros (codificador y decodificador), lo que exige cargar ambos y no es el esquema habitual de un unico `tokenizer.json`; hay que adaptar el codigo de carga en consecuencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/malinali-app/opus-mt-rn-ru
- Modelo base en HuggingFace: https://huggingface.co/Helsinki-NLP/opus-mt-rn-ru
- Proyecto OPUS-MT en GitHub: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app

Nota: la busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo (los resultados obtenidos corresponden a dominios de correo electronico sin relacion con el modelo). No se dispone de papers, blogs, demos ni repositorios adicionales asociados a esta publicacion.
