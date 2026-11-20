# Kausp11/querylm-annotator-gemma4-e4b-lora

## Resumen

QueryLM annotator es un adaptador LoRA de tipo PEFT construido sobre el modelo base `google/gemma-4-E4B-it` de Google. Su funcion no es la de un asistente conversacional general, sino la de un anotador de busqueda: lee un documento y decide, posicion por posicion, en que puntos una busqueda web ayudaria a predecir el texto siguiente, y redacta la consulta correspondiente para esa posicion. Fue desarrollado por el usuario Kausp11 y se publica como artefacto de investigacion vinculado al proyecto QueryLM.

El adaptador es de rango 16 con alpha 32 y dropout 0.05, aplicado sobre las proyecciones de atencion y feed-forward del decodificador de texto del modelo base. El repositorio contiene unicamente el adaptador (0,14 GB), por lo que requiere descargar el modelo base de Google por separado. Esta pensado para anotar corpus a gran escala dentro de un pipeline de datos, no para interaccion directa con usuarios.

Su relevancia actual reside en que documenta y hace reproducible el proceso de generacion de los datos de preentrenamiento y de ajuste fino de la familia QueryLM, publicados como datasets en Hugging Face. La licencia es Apache-2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder `google/gemma-4-E4B-it` |
| Parametros totales | no disponible (adaptador de 0,14 GB; el modelo base no se especifica en detalle) |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 tokens (truncado durante el entrenamiento) |
| Tipos de cuantizacion | no disponible (el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16, alpha 32 y dropout 0,05 insertado en las proyecciones de atencion y feed-forward del decodificador de texto del modelo base Gemma 4 E4B-it. No anade tokens al vocabulario: reutiliza los tokens nativos de herramienta de Gemma (`<|tool_call>`, `<tool_call|>`, `<|tool_response>`, `<tool_response|>`) para delimitar consultas y pasajes, que en los modelos y datasets QueryLM cumplen los mismos roles bajo los nombres `<WEB_QUERY>`, `</WEB_QUERY>`, `<WEB_RESPONSE>` y `</WEB_RESPONSE>`.

Los datos de entrenamiento proceden de unas 10.000 articulos de Wikipedia en ingles (primeros articulos del dump de noviembre de 2023, con entre 2.000 y 9.000 caracteres), anotados por un modelo profesor de mayor tamano en dos pasadas: primero marca donde una busqueda ayudaria a predecir un hecho proximo y despues redacta una consulta para cada posicion usando solo el texto precedente. Para cada consulta se recuperaron pasajes con BM25 sobre FineWeb-Edu y se comprimieron a una a tres frases, sin filtro de relevancia. Se generaron unas 20 consultas por articulo y 9.139 articulos para entrenamiento. La funcion de perdida es de siguiente token sobre el texto del documento, las consultas, los cuatro tokens de frontera y el marcador de fin de turno; la instruccion y los pasajes no contribuyen a la perdida. El entrenamiento uso AdamW con LR pico 2e-4, calentamiento del 3 %, decaimiento coseno, lotes de 32 secuencias, 3 epocas y 858 actualizaciones, sobre secuencias truncadas a 4.096 tokens. Se uso el checkpoint final, no uno seleccionado por perdida de validacion.

## Capacidades

- Deteccion de posiciones donde una busqueda web resulta util para predecir el texto siguiente, mediante la probabilidad del token de apertura de consulta.
- Generacion de la consulta de busqueda para cada posicion detectada, de forma voraz y con un maximo de 24 tokens.
- Anotacion de corpus completos: el pipeline descarta posiciones con probabilidad inferior a 0,05 y exige al menos 40 caracteres de separacion entre posiciones conservadas.
- Uso de los tokens nativos de herramienta de Gemma para estructurar consultas y respuestas, sin modificaciones del vocabulario.
- Capacidad de ejecucion en CPU en bfloat16, segun el ejemplo incluido en la model card.
- No soporta juicio de relevancia o correccion de los pasajes recuperados; esa filtracion corresponde al pipeline posterior.
- No es un asistente general ni un modelo conversacional; no se documentan capacidades de codigo, matematicas, vision, audio ni agentes multi-paso.

## Casos de uso

- Construccion de datos de preentrenamiento con busqueda intercalada: el adaptador anota articulos de Wikipedia o texto web marcando posiciones y consultas, que despues se completan con pasajes recuperados, reproduciendo el pipeline de los datasets QueryLM.
- Generacion de datos de ajuste fino para modelos con busqueda: permite crear pares de documento y consulta que sirven como supervision para entrenar modelos que decidan cuando buscar.
- Anotacion de corpus web a escala: aplicado sobre DCLM-Edu u otras colecciones, el adaptador produce bloques de busqueda de forma automatica con un umbral de probabilidad configurable.
- Estudio de politicas de busqueda: al exponer la probabilidad de busqueda por posicion, permite analizar en que puntos del texto un modelo considera necesario consultar fuentes externas.
- Investigacion sobre destilacion de profesor a alumno: reproduce con un modelo menor las anotaciones de un profesor de mayor tamano, lo que facilita experimentos de coste reducido.
- Prototipado de pipelines de recuperacion aumentada: sirve para generar consultas de prueba y evaluar recuperadores BM25 o densos sin anotacion manual.
- Reproducibilidad de experimentos: al publicarse el checkpoint final con hash sha256, permite replicar exactamente las anotaciones del proyecto QueryLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una salida de ejemplo del script de uso: para el documento "Albedo is the fraction of sunlight that is diffusely reflected by a body. It is measured on a scale from", el adaptador devuelve P(search here) = 0,076 y la consulta "Albedo scale fraction sunlight reflected body range".

## Requisitos de hardware

- El adaptador ocupa 0,14 GB; el requisito real lo determina el modelo base `google/gemma-4-E4B-it`.
- El ejemplo de la model card se ejecuta en CPU en bfloat16 con torch 2.8.0 y peft 0.13.2, por lo que la inferencia es viable sin GPU para volumentes pequenos.
- Para anotacion de corpus a gran escala se recomienda GPU; no se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- VRAM estimada: no disponible.
- Opciones de despliegue: transformers con peft (procedimiento documentado); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QueryLM annotator (este) | LoRA sobre Gemma 4 E4B-it | 4.096 tokens | Anotador de busqueda | Apache-2.0 | Hugging Face |
| Modelo base `google/gemma-4-E4B-it` | no disponible | no disponible | Asistente general | Apache-2.0 | Hugging Face |
| Otros anotadores de busqueda | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un asistente general; no debe usarse como chatbot ni como sistema de respuesta.
- Entrenado sobre articulos de Wikipedia y aplicado despues a texto web; el estilo de las consultas sigue las anotaciones del profesor, lo que puede introducir sesgos de estilo y de dominio.
- Decide donde buscar y que preguntar, pero no evalua si el pasaje recuperado es correcto o relevante; el pipeline debe filtrar las inserciones.
- Solo ingles.
- No se aplico filtro de relevancia a las consultas durante la generacion de datos, lo que puede producir consultas poco informativas.
- Se uso el checkpoint final sin seleccion por perdida de validacion, por lo que no hay garantia de que sea el mejor punto de entrenamiento.
- Riesgo de alucinacion en las consultas generadas: no se documentan evaluaciones al respecto.
- La licencia Apache-2.0 del adaptador se hereda del modelo base de Google, tambien Apache-2.0; conviene revisar los terminos del modelo base para uso comercial en produccion.
- El contexto de entrenamiento esta limitado a 4.096 tokens, lo que restringe la anotacion de documentos largos en una sola pasada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/querylm-annotator-gemma4-e4b-lora
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset de preentrenamiento (Wikipedia): https://huggingface.co/datasets/Kausp11/querylm-wiki-pretraining-data
- Dataset de preentrenamiento (DCLM-Edu): https://huggingface.co/datasets/Kausp11/querylm-dclm-pretraining-data
- Dataset de ajuste fino con busqueda: https://huggingface.co/datasets/Kausp11/querylm-search-sft-data
