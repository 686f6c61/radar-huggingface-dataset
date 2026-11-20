# ChangChi7/shiro-korpora

## Resumen

Shiro-Korpora no es un modelo de lenguaje, sino un conjunto de datos de entrenamiento publicado en Hugging Face por el usuario ChangChi7. Se trata del material de entrenamiento del proyecto Shiro, un modelo de lenguaje a nivel de byte (byte-level) de 24 millones de parametros. El repositorio contiene dos archivos comprimidos con corpus ya fusionados y divididos en shards, pensados para alimentar dicho modelo.

El contenido de los corpus es marcadamente sintetico y orientado a tareas aritmeticas y de logica linguistica: sumas, ecuaciones, cadenas de operaciones, multiplicaciones y texto. Cada registro sigue un formato con marcadores que separan el enunciado de la tarea, el razonamiento paso a paso y la respuesta final, lo que lo hace util para entrenar modelos pequenos en tareas de razonamiento aritmetico con traza explicita.

El repositorio tiene un tamano de 0,2 GB y no incluye tarjeta de modelo con licencia, idiomas ni especificaciones de inferencia, ya que no se trata de pesos de un modelo. La documentacion esta redactada en aleman y remite al repositorio `LangLi7/shiro-train` para la herramienta de generacion (`mktool`) y la documentacion de resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (conjunto de datos, no modelo) |
| Parametros totales | no disponible (el proyecto asociado declara 24 millones de parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el contenido de los corpus parece orientado a tareas aritmeticas y texto; la model card esta en aleman) |
| Licencia | no disponible |
| Formato de pesos | no aplica; shards binarios con cabecera de 32 bytes y registros con longitud u16 en little-endian |

## Arquitectura y entrenamiento

No se describe arquitectura de red en la informacion disponible, porque el artefacto publicado es un corpus y no un modelo. La model card indica que el proyecto Shiro es un modelo de lenguaje a nivel de byte de 24 millones de parametros, y que estos corpus son su material de entrenamiento. La generacion de los datos se realiza con la herramienta `mktool` del repositorio `LangLi7/shiro-train`, y los corpus son deterministas y reproducibles a partir de las semillas documentadas en los respectivos runs.

El formato de los shards es un contenedor binario: cabecera de 32 bytes con la firma `BSHD`, version (u16), tamano de cabecera (u16), numero de registros (u64), reserva (u64) y la marca `mktool\0\0`; a continuacion, cada registro se codifica con una longitud u16 en little-endian seguida de los bytes. Cada registro contiene una tarea con su traza de razonamiento y su respuesta entre marcadores (`<AUFGABE>`, `<DENKWEG>`, `<ANTWORT>`, `<ENDE>`), lo que permite entrenar modelos en la produccion explicita de pasos intermedios antes de la respuesta final.

## Capacidades

- Generacion de corpus sinteticos de aritmetica basica: sumas, ecuaciones, cadenas de operaciones y multiplicaciones.
- Trazas de razonamiento paso a paso en formato estructurado con marcadores, aptas para entrenamiento supervisado de modelos pequenos.
- Dos variantes de corpus: `mix46` (40 774 registros, 7,9 MB) como referencia, y `mix77` (59 274 registros, 7,7 MB) que anade 20 000 multiplicaciones pequenas.
- Reproducibilidad determinista mediante semillas documentadas en los runs de generacion.
- Formato binario compacto con shards, pensado para lectura eficiente durante el entrenamiento.
- No se documentan capacidades de tool calling, agentes, vision, audio ni multilingue, al no tratarse de un modelo.

## Casos de uso

- Entrenamiento de modelos aritmeticos pequenos: los corpus permiten entrenar un modelo byte-level de 24 millones de parametros en tareas de suma, multiplicacion y ecuaciones con traza de razonamiento, usando los marcadores como senal de supervision.
- Investigacion en razonamiento paso a paso: el formato `<DENKWEG>` separa explicitamente el razonamiento de la respuesta, lo que facilita experimentos sobre chain-of-thought en modelos de escala reducida.
- Reproduccion de experimentos: al ser corpus deterministas con semillas documentadas, sirven para replicar exactamente una medicion publicada en el repositorio `shiro-train`.
- Ampliacion de datasets: la variante `mix77` anade 20 000 multiplicaciones pequenas respecto a `mix46`, util para estudiar el efecto de incrementar la dificultad aritmetica en el entrenamiento.
- Pruebas de pipelines de datos: el formato de shard con cabecera y registros de longitud prefijada permite validar herramientas de lectura y escritura de datos binarios en proyectos propios.
- Generacion de datos sinteticos: `mktool` y las semillas permiten regenerar o extender los corpus para nuevos runs con otros tamanos de modelo o semillas distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica para inferencia: el artefacto es un corpus de 0,2 GB, no un modelo con pesos.
- Almacenamiento: aproximadamente 0,2 GB para el repositorio completo; los dos archivos comprimidos ocupan 7,9 MB y 7,7 MB respectivamente.
- Memoria: los corpus descomprimidos son de escala muy reducida (decenas de miles de registros), por lo que caben en memoria en cualquier equipo de desarrollo convencional.
- Despliegue: no procede vLLM, llama.cpp, Ollama ni TGI; el consumo se realiza mediante la herramienta `mktool` o lectores propios del formato de shard.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Aspecto | Shiro-Korpora | Corpus aritmeticos sinteticos tipicos | Datasets de razonamiento general |
|---|---|---|---|
| Tipo de artefacto | Corpus en shards binarios | JSON/JSONL de tareas | Mezclas de texto y razonamiento |
| Tamano | 0,2 GB (7,7-7,9 MB por archivo) | Variable | Decenas a cientos de GB |
| Formato de traza | Marcadores explicitos (`<DENKWEG>`) | Variable | Variable |
| Reproducibilidad | Determinista con semillas documentadas | Rara vez documentada | Rara vez documentada |
| Licencia | no disponible | Variable | Variable |
| Modelo asociado | Shiro, byte-level, 24 M de parametros | No aplica | Modelos de gran escala |

No se dispone de datos de rendimiento comparativo con alternativas concretas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo: no puede usarse para inferencia directa ni para generar texto; es material de entrenamiento.
- Ambito muy restringido: el contenido se limita a aritmetica basica, ecuaciones, cadenas, multiplicaciones pequenas y algo de texto y logica linguistica.
- Licencia no declarada: no hay informacion sobre condiciones de uso comercial o redistribucion, lo que supone un riesgo para produccion.
- Idiomas no declarados: la model card esta en aleman y los marcadores tambien, pero no se especifica la composicion linguistica del texto incluido.
- Escala reducida: 40 774 y 59 274 registros respectivamente, insuficientes para entrenar modelos de proposito general.
- Dependencia de herramientas externas: el formato requiere `mktool` o un lector propio del shard; no hay documentacion de esquema mas alla de la cabecera descrita.
- Riesgo de sobreajuste a plantillas: las trazas siguen un formato fijo de marcadores, lo que puede limitar la generalizacion del modelo entrenado con ellas.
- Sin garantias de calidad: no se documentan procesos de filtrado, deduplicacion ni validacion de los registros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ChangChi7/shiro-korpora
- Repositorio de entrenamiento y herramienta `mktool`: https://github.com/LangLi7/shiro-train
