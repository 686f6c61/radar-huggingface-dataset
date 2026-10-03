# malinali-app/opus-mt-ee-en

## Resumen

malinali-app/opus-mt-ee-en es un modelo de traducción automática neuronal que traduce del par ee → en. No se trata de un entrenamiento nuevo: es un reempaquetado de los pesos de Helsinki-NLP/opus-mt-ee-en, de la colección OPUS-MT de Helsinki-NLP, publicado por el equipo de la aplicación Malinali. El pack distribuye los pesos en formato safetensors junto con dos tokenizers rápidos (origen y destino) convertidos desde SentencePiece a JSON de Hugging Face, pensados para inferencia en dispositivo con Candle.

El modelo tiene 74.200.811 parámetros (unos 74,2 M) y el repositorio ocupa 0,3 GB, lo que lo sitúa en la gama ligera de traducción neuronal. Su problema objetivo es la traducción local sin conexión: al no depender de una API en la nube, encaja en aplicaciones móviles o de escritorio con requisitos de privacidad, coste por inferencia nulo o conectividad limitada. La dirección es unidireccional (ee → en); este repositorio no incluye el sentido inverso.

La relevancia del pack es fundamentalmente práctica: el autor no reclama propiedad sobre el modelo entrenado y solo realiza el reempaquetado y la conversión de tokenizers para Candle (`marian_flutter`), de modo que el comportamiento del modelo es el del upstream. Conviene tener en cuenta que el repositorio no declara licencia propia y no presenta descargas ni validación comunitaria en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq tipo Marian (encoder-decoder), segun la etiqueta `marian` y el modelo base OPUS-MT |
| Parametros totales | 74.200.811 (74,2 M), dato real de safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos safetensors y no lista variantes GGUF, INT8, INT4 ni otras |
| Idiomas soportados | ee (origen) y en (destino). La ficha no desarrolla el nombre del idioma origen; en ISO 639-1 el codigo «ee» corresponde al ewe, dato que conviene verificar en la ficha del modelo base antes de usarlo en produccion |
| Licencia | no disponible en los metadatos de Hugging Face; la model card remite a la licencia del modelo base (habitualmente CC-BY 4.0 en la familia OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`), acompanado de `config.json`, `tokenizer-enc.json` y `tokenizer-dec.json` |
| Tamano del repositorio | 0,3 GB |
| Libreria declarada | transformers (pipeline: translation) |
| Modelo base | Helsinki-NLP/opus-mt-ee-en |

## Arquitectura y entrenamiento

La arquitectura corresponde a Marian, un transformer secuencia a secuencia con encoder y decoder, adecuado para traduccion automática neuronal. Los pesos son los del modelo Helsinki-NLP/opus-mt-ee-en de la coleccion OPUS-MT, por lo que no hay entrenamiento adicional, destilacion ni ajuste fino por parte de malinali-app: el autor indica explicitamente que solo reempaqueta pesos y convierte los tokenizers de SentencePiece a formato JSON de tokenizer rapido de Hugging Face.

La innovacion tecnica del pack no esta en el modelo, sino en el formato de distribucion: el repositorio separa el tokenizer de origen y el de destino en dos ficheros JSON independientes (`tokenizer-enc.json` y `tokenizer-dec.json`), lo que permite integrar el modelo en Candle mediante `marian_flutter` para inferencia nativa en dispositivo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO ni sobre tecnicas de decodificacion especulativa en la informacion proporcionada; esos detalles pertenecen al proyecto upstream OPUS-MT y no se documentan en esta ficha.

## Capacidades

- Traduccion automatica unidireccional de ee a en, a nivel de segmento o frase.
- Generacion de texto limitada al paradigma seq2seq de traduccion: no es un modelo de chat ni sigue instrucciones generales.
- Inferencia en dispositivo: los pesos safetensors y los tokenizers rapidos estan preparados para ejecutarse con Candle (`marian_flutter`), sin necesidad de servidor.
- Integracion con el ecosistema transformers mediante la pipeline `translation` y la libreria `transformers`.
- Cobertura linguistica restringida al par ee-en; no se documentan otros idiomas.
- No consta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento. La informacion disponible no menciona ninguna de estas capacidades.

## Casos de uso

- Traduccion en dispositivo en aplicaciones moviles: el pack esta disenado para Candle y `marian_flutter`, de modo que una app puede traducir texto en ee a ingles en local, con 74,2 M de parametros y 0,3 GB de repositorio, sin enviar contenido a un servidor y sin coste por inferencia.
- Localizacion de contenido editorial: traduccion de articulos, fichas de producto o paginas web redactadas en ee a ingles para ampliar la audiencia, procesando el texto por segmentos.
- Traduccion de subtitulos y transcripciones: al trabajar a nivel de frase, se puede aplicar segmento a segmento sobre ficheros SRT o VTT para generar una version en ingles.
- Normalizacion de entradas para pipelines de NLU: convertir consultas de usuario en ee a ingles permite reutilizar clasificadores de intencion, analisis de sentimiento o sistemas de respuesta entrenados unicamente en ingles.
- Moderacion de contenido: traducir el texto al ingles antes de aplicar clasificadores de toxicidad o politicas de contenido que solo existen en ese idioma.
- Documentacion tecnica y sanitaria en contextos con conectividad limitada: organizaciones que trabajan sobre el terreno pueden traducir materiales en local en portatiles sin GPU dedicada, dado el reducido tamano del modelo.
- Investigacion en linguistica y lenguas de bajos recursos: generacion de traducciones automaticas para ampliar corpus paralelos ee-en o para analisis comparativos entre sistemas.
- Aumento de datos para entrenamiento: uso del modelo como generador de traducciones en tareas de aumento de datos o back-translation dentro de un pipeline mayor, siempre que se valide la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de BLEU, METEOR, chrF ni evaluaciones tipo MMLU, HumanEval o GSM8K, que por otra parte no aplican a un modelo de traduccion. Al compartir pesos con Helsinki-NLP/opus-mt-ee-en, las metricas publicadas para el modelo upstream serian aplicables, pero deben consultarse en su ficha original y no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del recuento de parametros, no confirmado por el autor): en FP32 unos 297 MB, en FP16/BF16 unos 148 MB y en INT8 unos 74 MB, mas el espacio de activaciones y tokenizers.
- El repositorio ocupa 0,3 GB, por lo que el almacenamiento necesario es minimo incluso en movil.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o inferiores; tambien en GPUs integradas y en CPU.
- El escenario de despliegue previsto por el autor es el dispositivo final (on-device) mediante Candle y `marian_flutter`, lo que permite ejecucion en telefonos y equipos sin GPU dedicada.
- Opciones de despliegue documentadas en la informacion disponible: transformers con pipeline `translation` y Candle con los tokenizers JSON proporcionados. Otras alternativas como vLLM o TGI no constan como compatibles con esta arquitectura en la informacion disponible; herramientas de inferencia optimizada para modelos seq2seq (por ejemplo CTranslate2, que soporta arquitecturas Marian) requeririan conversion previa y no estan verificadas en esta ficha.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo de respuesta.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus fichas publicas y no estan verificados en la informacion proporcionada; se marcan como no disponibles aquellos campos que no se pueden confirmar.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-ee-en | 74,2 M | no disponible | ee → en | no disponible (remite al upstream, habitualmente CC-BY 4.0) | safetensors + tokenizers JSON para Candle |
| Helsinki-NLP/opus-mt-ee-en | mismos pesos que el reempaquetado | no disponible | ee → en | consultar ficha upstream | pesos originales Marian en el repositorio de Helsinki-NLP |
| Helsinki-NLP/opus-mt-tc-big-en-* / familia tc-big | no disponible | no disponible | multiples pares, con variantes de mayor tamano | consultar ficha upstream | pesos originales |
| facebook/nllb-200-distilled-600M | aproximadamente 600 M | no disponible en esta ficha | 200 idiomas, orientado a traduccion multilingue | licencia no comercial del proyecto NLLB | transformers |

Diferencias clave: frente al modelo base, este repositorio solo cambia el empaquetado y los tokenizers, por lo que la calidad de traduccion deberia ser identica. Frente a alternativas multilingues de mayor tamano, la ventaja es el tamano reducido y la ejecucion en dispositivo; la desventaja es la cobertura de un unico par de idiomas y la ausencia de variantes cuantizadas publicadas.

## Limitaciones y advertencias

- Licencia no declarada en los metadatos de Hugging Face: la model card remite a la licencia del modelo base (habitualmente CC-BY 4.0 en OPUS-MT), por lo que antes de un uso comercial hay que verificar la licencia del upstream y mantener la atribucion correspondiente.
- Riesgo de alucinacion y de traducciones incorrectas en entradas fuera de dominio, muy cortas, ambiguas o con ruido, comportamiento comun en modelos de traduccion neuronal de este tamano.
- Direccion unica: este repositorio solo traduce ee → en; no incluye el sentido inverso.
- Cobertura linguistica limitada al par ee-en; no se documentan otros idiomas ni variantes dialectales.
- Longitud maxima de secuencia no documentada en la informacion disponible: conviene segmentar el texto en frases y validar el comportamiento con entradas largas antes de usarlo en produccion.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Es un reempaquetado: cualquier error de conversion de tokenizers o de configuracion puede alterar los resultados respecto al modelo original, por lo que se recomienda comparar salidas contra Helsinki-NLP/opus-mt-ee-en.
- La ficha no explicita el nombre del idioma origen asociado al codigo «ee»; conviene confirmarlo antes de desplegarlo ante usuarios finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-ee-en
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ee-en
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
