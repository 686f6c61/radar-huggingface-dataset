# proofbird/gector-bert-es

## Resumen

`gector-bert-es` es un modelo de correccion gramatical del espanol desarrollado por Proofbird, un asistente de escritura que funciona en local. Se trata de un tagger secuencial de estilo GECToR construido sobre el encoder BETO (`dccuchile/bert-base-spanish-wwm-cased`) y exportado a ONNX en fp32 para ejecutarse en CPU sin GPU ni clave de API. Resuelve el problema de la correccion gramatical local: en lugar de reescribir el texto, predice una etiqueta de edicion por token (mantener, borrar, reemplazar, anadir, cambiar mayusculas o forma verbal) y aplica las ediciones de forma iterativa hasta cinco pasadas.

El modelo se publica para que cualquiera pueda inspeccionar que se ejecuta en su maquina, dado que forma parte de la aplicacion Proofbird. Su interes actual radica en que ofrece correccion gramatical en espanol totalmente on-device, con un diseno conservador que solo propone ediciones locales y nunca parafrasea, lo que lo hace adecuado para entornos con requisitos de privacidad estrictos.

La version documentada es la 1.4.0 (run `2026-11-24-1117`), con licencia CC BY 4.0 y un unico idioma soportado: espanol. El repositorio ocupa 1.3 GB y acumula 275 descargas en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BETO) con cabeza de etiquetado de ediciones (698 etiquetas) y cabeza de deteccion de errores, estilo GECToR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | exportacion ONNX en fp32 (no se documentan otras cuantizaciones) |
| Idiomas soportados | espanol (es) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (fp32) |

## Arquitectura y entrenamiento

El modelo sigue la formulacion GECToR: un encoder transformer (BETO, `bert-base-spanish-wwm-cased`) al que se anaden dos cabezas, una de etiquetado con 698 etiquetas de edicion y otra de deteccion de errores. En lugar de generar texto nuevo, el modelo predice por token una edicion (mantener, borrar, reemplazar por una palabra, anadir una palabra, cambiar mayusculas o cambiar una forma verbal); las ediciones se aplican y la frase se re-etiqueta hasta cinco veces. El tagger solo propone ediciones locales y nunca parafrasea.

El entrenamiento uso exclusivamente datos sinteticos: 3 250 000 frases en total, compuestas por 1 500 000 frases de Wikipedia en espanol (`wikimedia/wikipedia`, `20231101.es`), 1 500 000 frases de los procedimientos del Parlamento Europeo (Europarl v10, sesiones anteriores a mayo de 2011) y 250 000 frases de Tatoeba. Las frases se corrompieron con reglas de error escritas a mano para el espanol, en su mayoria un error por frase independientemente de su longitud; alrededor del 10 % permanecen limpias para que el modelo aprenda a no tocar texto correcto. Cada regla se valido contra el texto limpio y se leyo sobre frases reales antes de aplicarse, y se anadieron frases reales con patrones necesarios (concordancia verbo-sujeto, adjetivo-sustantivo, articulos, contracciones, acentos, signos de apertura) repartidas sobre 700 verbos, ademas de 203 000 frases de plantilla para preguntas, imperativos, primera y segunda persona y errores en una clausula posterior. Los acentos se tratan como una unica edicion con independencia de la palabra. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Correccion de concordancia sujeto-verbo (`Las nuevas normas garantiza` → `garantizan`).
- Correccion de la persona del verbo tras su pronombre (`Nosotros es amigos` → `somos`).
- Concordancia de genero y numero en articulos, adjetivos y participios, incluso a traves de una clausula (`La casa es blanco` → `blanca`).
- Correccion del genero del articulo (`un mesa` → `una mesa`; `el agua` se mantiene).
- Contracciones (`de el` → `del`, `a el` → `al`) y preposiciones duplicadas (`Vamos a al cine` → `al`).
- Acentos escritos (`cancion` → `canción`) y acentos diacriticos (`el`/`él`, `tu`/`tú`, `se`/`sé`, `esta`/`está`, interrogativos como `¿Como` → `¿Cómo`).
- Signos de apertura de interrogacion y exclamacion (`Cómo estás?` → `¿Cómo estás?`).
- Deteccion de palabras duplicadas y mayusculas al inicio de frase.
- Errores de registro cotidiano en preguntas, imperativos y primera y segunda persona.
- Devuelve sugerencias con posicion de caracter (`start`, `length`), texto original y reemplazo, aptas para subrayar y ofrecer la correccion.
- No soporta tool calling, function calling, agentes, vision ni audio segun la informacion disponible.

## Casos de uso

- Correccion gramatical en local dentro de un editor de texto: el modelo se ejecuta en CPU via ONNX Runtime y devuelve sugerencias con posiciones de caracter, de modo que la aplicacion puede subrayar el error y ofrecer el reemplazo sin enviar el texto a ningun servidor.
- Asistente de escritura con requisitos de privacidad: al ser on-device y no requerir API key ni GPU, encaja en productos donde el texto del usuario no puede salir de la maquina, como herramientas de escritura para sectores regulados.
- Preprocesado de corpus en espanol: puede aplicarse por lotes para normalizar acentos, contracciones y concordancias en textos antes de tareas posteriores de NLP, aprovechando que solo hace ediciones locales y no parafrasea.
- Revision de textos academicos o administrativos: corrige concordancias largas y errores de registro en frases extensas, ya que encuentra un unico error en una frase larga con una frecuencia similar a una corta.
- Integracion en navegador o aplicacion de escritorio: la exportacion ONNX fp32 y la dependencia de ONNX Runtime permiten desplegarlo en el cliente sin infraestructura de servidor.
- Filtrado y control de calidad de textos generados: al dejar intactas las grafias que la norma admite en ambas formas (`solo`/`sólo`, `este`/`éste`, `periodo`/`período`), sirve como capa de validacion que no introduce falsos positivos en variantes aceptadas.
- Generacion de pares para evaluacion de GEC: las sugerencias con posicion exacta permiten construir conjuntos de prueba y comparar correcciones a nivel de caracter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo se exporta a ONNX fp32 y esta disenado para ejecutarse en CPU, sin GPU.
- VRAM estimada: no aplica para la ruta ONNX en CPU; no se documenta el consumo de memoria en GPU.
- GPU recomendadas: no disponible (el diseno objetivo es on-device en CPU).
- Cabe en consumer GPU: no se documenta; la ruta oficial es CPU.
- Opciones de despliegue: ONNX Runtime (dependencias `onnxruntime`, `tokenizers`, `huggingface_hub`); se proporciona `quickstart.py` y un notebook de Colab.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| proofbird/gector-bert-es | no disponible | no disponible | CC BY 4.0 | ONNX fp32 | GECToR sobre BETO, on-device, solo espanol |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo propone ediciones locales: no parafrasea ni reescribe el texto, por lo que no corrige problemas de estilo o estructura que requieran reformulacion.
- Entrenado exclusivamente con datos sinteticos generados por reglas escritas a mano; los errores no cubiertos por esas reglas pueden no detectarse.
- Solo soporta espanol; no hay capacidades multilingues.
- No se documentan sesgos especificos, pero al entrenarse con Wikipedia, Europarl y Tatoeba puede heredar sesgos de registro y de dominio de esas fuentes.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos positivos o correcciones erroneas en construcciones que la norma admite de varias formas; el modelo deja intactas grafias como `solo`/`sólo`, `este`/`éste`, `periodo`/`período`, `guion`, `video` y `futbol`.
- La licencia CC BY 4.0 permite uso comercial con atribucion; debe verificarse el cumplimiento de los terminos de atribucion en produccion.
- La longitud de contexto no esta documentada; el rendimiento en frases muy largas mas alla de lo descrito no esta garantizado.
- Version fijada a `v1.4.0`; conviene anclar la revision (`revision="v1.4.0"`) para evitar cambios de comportamiento entre versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/proofbird/gector-bert-es
- Version fijada: https://huggingface.co/proofbird/gector-bert-es/tree/v1.4.0
- Demo en el navegador (Space): https://huggingface.co/spaces/proofbird/try-grammar
- Quickstart en Colab: https://colab.research.google.com/#fileId=https%3A//huggingface.co/proofbird/gector-bert-es/blob/main/quickstart.ipynb
- Script de inicio rapido: https://huggingface.co/proofbird/gector-bert-es/blob/main/quickstart.py
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Tatoeba: https://tatoeba.org
- Sitio de Proofbird: https://proofbird.app
