# cstr/camel-morph-msa-v1.0

## Resumen

Camel Morph MSA v1.0 es un analizador morfologico a gran escala para arabe estandar moderno (MSA), desarrollado por el equipo CAMeL Lab de la Universidad de Nueva York en Abu Dabi y publicado en LREC-COLING 2024. No es un modelo neuronal generativo, sino una base de datos lexica (ALMOR) que codifica la morfologia del arabe y que se distribuye como recurso de datos para el analizador implementado en `camel_tools`. El repositorio `cstr/camel-morph-msa-v1.0` es un bundle de redistribucion de CrispEmbed: contiene unicamente los ficheros de base de datos, sin codigo, empaquetados con manifiestos que fijan integridad por SHA-256.

La relevancia actual del recurso radica en que ofrece un analizador morfologico abierto (CC BY 4.0) de cobertura amplia, con lexicon sembrado desde CALIMA-Star/SAMA y revisado manualmente, que puede integrarse en pipelines de procesamiento de lengua arabe sin depender de servicios propietarios. El bundle incluye dos variantes: la base de datos completa y una version sin las probabilidades derivadas del Penn Arabic Treebank (`noprob/`), pensada para quien prefiera no usar estadisticas estimadas sobre treebank.

Al tratarse de un recurso de datos y no de un modelo de lenguaje, no dispone de parametros, contexto, cuantizacion ni pesos en safetensors o GGUF. Su tamano de repositorio es de 0,2 GB y su unico idioma soportado es el arabe (`ar`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es una base de datos lexica ALMOR para analisis morfologico) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | arabe (`ar`), arabe estandar moderno (MSA) |
| Licencia | CC BY 4.0 |
| Formato de pesos | no disponible (no aplica); formato de datos: base de datos SQLite (`.db`) con `manifest.json` por carpeta |

## Arquitectura y entrenamiento

El recurso no es un transformer ni un modelo generativo: es una base de datos morfologica en formato SQLite que materializa el lexicon ALMOR de Camel Morph. Segun la model card, el lexicon se sembro desde CALIMA-Star/SAMA y se re trabajo manualmente; el script `db_maker.py` de `camel_morph` escribe los valores `lex_logprob` y `pos_lex_logprob` a partir de log-probabilidades estimadas sobre el split de entrenamiento del Penn Arabic Treebank, mientras que `pos_logprob` se declara pero no lleva valores. La base de datos se consume mediante el analizador nativo de `camel_tools` (interfaz C `crispembed_ar_morph_*`), no mediante inferencia neuronal.

El bundle redistribuye dos carpetas autocontenidas: `full/` contiene `camel_morph_msa_v1.0.db`, byte a byte identica al release upstream (SHA-256 `110e03baa282874062d076e23d9671e985b6f76520b891d58cba4e55de0b8f60`, commit `aaa39653c2a53ebacf087f0b98e7f7cfb55cca81`), y `noprob/` contiene `camel_morph_msa_v1.0.noprob.db`, la misma base de datos sin los valores `pos_logprob`, `lex_logprob` y `pos_lex_logprob`. En la variante `noprob`, `camel_tools` informa del valor constante -99.0 en los campos eliminados, por lo que el ranking basado en verosimilitud recae en sus criterios de desempate. Los conjuntos de analisis y el resto de caracteristicas no cambian entre ambas variantes. No hay datos publicados sobre volumen de tokens de entrenamiento ni sobre fases de RLHF o DPO, porque no aplica a este tipo de recurso.

## Capacidades

- Analisis morfologico de palabras en arabe estandar moderno: descomposicion en prefijos, raiz, patron, sufijos y categorias gramaticales.
- Generacion de analisis alternativos con puntuacion de verosimilitud (en la variante `full/`, mediante `lex_logprob` y `pos_lex_logprob`).
- Ranking de candidatos morfologicos por probabilidad estimada sobre el Penn Arabic Treebank (solo en `full/`).
- Modo sin estadisticas de treebank (`noprob/`) para flujos que requieren analisis puramente lexicos.
- Integracion programatica a traves de la interfaz C `crispembed_ar_morph_*` del port de `camel_tools` de CrispEmbed.
- Verificacion de integridad de los ficheros mediante `manifest.json` con tamano y SHA-256 por fichero.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, agentes ni capacidades multilingues mas alla del arabe.

## Casos de uso

- Preprocesamiento morfologico en pipelines de NLP arabe: normalizar y analizar tokens antes de tareas de etiquetado, parsing o traduccion automatica, usando la variante `full/` para obtener candidatos ordenados por verosimilitud.
- Busqueda lexicografica y lematizacion: mapear formas superficiales a lemas y raices para construir indices de busqueda o diccionarios en aplicaciones de lengua arabe.
- Analisis linguistico y corpus research: obtener descomposiciones morfologicas detalladas (prefijo, raiz, patron, sufijo) para estudios de morfologia o anotacion de corpus.
- Sistemas de ensenanza de arabe: generar paradigmas y descomposiciones de palabras para herramientas didacticas, aprovechando la cobertura del lexicon sembrado desde CALIMA-Star/SAMA.
- Desambiguacion morfologica en produccion: integrar el analizador en servicios de procesamiento de texto arabe donde se necesite una alternativa abierta (CC BY 4.0) a analizadores propietarios.
- Reproducibilidad en investigacion: usar los manifiestos con SHA-256 para fijar exactamente la version del recurso en experimentos y garantizar resultados reproducibles.
- Flujos con restricciones sobre datos derivados de treebank: emplear `noprob/` cuando no se quieran usar estadisticas estimadas sobre el Penn Arabic Treebank, aceptando el ranking por desempate.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU: es una base de datos SQLite consumida por el analizador de `camel_tools`, por lo que la inferencia es CPU-bound.
- VRAM estimada: 0 GB (no aplica).
- GPU recomendadas: no aplica; cualquier CPU es suficiente.
- Cabe en cualquier equipo consumer; el repositorio ocupa 0,2 GB en disco.
- Opciones de despliegue: el analizador nativo de `camel_tools` (interfaz C `crispembed_ar_morph_*`) o el port de CrispEmbed; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Recurso | Tipo | Idioma | Licencia | Parametros/contexto | Disponibilidad |
|---|---|---|---|---|---|
| Camel Morph MSA v1.0 (este bundle) | Analizador morfologico (base de datos ALMOR) | Arabe (MSA) | CC BY 4.0 | no aplica | Hugging Face + GitHub upstream |
| CALIMA-Star/SAMA | Lexico morfologico (origen del sembrado) | Arabe | no disponible en la informacion | no aplica | no disponible en la informacion |
| `camel_tools` (analizador) | Software de analisis morfologico | Arabe | no disponible en la informacion | no aplica | GitHub CAMeL-Lab |

No se dispone de datos de rendimiento comparativo entre estos recursos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo y no soporta tool calling ni agentes.
- Cobertura limitada al arabe estandar moderno (MSA); no cubre dialectos arabes ni otros idiomas.
- La variante `noprob/` pierde el ranking por verosimilitud: `camel_tools` devuelve -99.0 en los campos eliminados y el orden depende de los criterios de desempate.
- Las probabilidades de `full/` derivan del split de entrenamiento del Penn Arabic Treebank, lo que puede introducir sesgos de dominio periodistico en el ranking.
- El bundle no incluye codigo; requiere el analizador de `camel_tools` o el port de CrispEmbed para funcionar.
- Licencia CC BY 4.0: permite uso comercial con atribucion a Camel Morph MSA v1.0, NYU Abu Dabi y los autores del paper; es obligatorio citar la fuente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.
- No se han publicado benchmarks de precision del analisis en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/cstr/camel-morph-msa-v1.0
- Repositorio upstream: https://github.com/CAMeL-Lab/camel_morph
- Herramientas de analisis: https://github.com/CAMeL-Lab/camel_tools
- Paper (LREC-COLING 2024): https://aclanthology.org/2024.lrec-main.240
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- NYU Abu Dabi: https://nyuad.nyu.edu
