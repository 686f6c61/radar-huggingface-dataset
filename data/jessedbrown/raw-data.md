# Jessedbrown/raw-data

## Resumen

`Jessedbrown/raw-data` no es un modelo de inteligencia artificial: es un repositorio alojado en HuggingFace por el usuario Jessedbrown (identificado en la model card como Jesse Daniel Brown, "OP-JESSE") cuyo contenido es un conjunto de ficheros de texto con la salida literal de varios scripts de Python, junto con los propios scripts y un registro de ocurrencias encadenado por hash. No contiene pesos, no define una arquitectura de red neuronal y no expone ninguna tarea de inferencia. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y no declara licencia, idiomas ni pipeline.

El material se organiza en torno a cinco ficheros `RAW-*.txt`, cada uno descrito por el autor como el stdout verbatim del script correspondiente capturado por redireccion: `RAW-01-session.txt` (de `search_session.py`), `RAW-02-agents.txt` (`search_agents.py`), `RAW-03-claims.txt` (`scan_claims.py`), `RAW-04-sentences.txt` (`extract_ctx.py`) y `RAW-05-chain.txt` (`verify_chain.py`). A estos se suman `OCCURRENCES.hbp`, su indice `OCCURRENCES.hbi`, su digest `.sha256` y el programa `build_occ.py`.

Su relevancia no es la de un modelo evaluable, sino la de un artefacto de procedencia y trazabilidad: el autor propone que cualquier linea pueda rederivarse ejecutando los scripts en lugar de confiar en el texto, y usa una cadena de hashes SHA-256 para imponer que el registro de ocurrencias sea solo anadible. Para un lector que busque un modelo generativo, esta ficha debe leerse como un aviso de que el artefacto no lo es.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (no es un modelo de red neuronal; es un conjunto de ficheros de texto y scripts de Python) |
| Parametros totales | no aplica / no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no declarado; el contenido de los ficheros esta en ingles) |
| Licencia | no disponible (no declarada en la model card) |
| Formato de pesos | no hay pesos. Formatos presentes: `.txt`, `.py`, `.hbp`, `.hbi`, `.sha256` |
| Autor | Jessedbrown |
| Fecha de creacion | 2026-10-16 (segun metadatos de HuggingFace) |
| Fecha de actualizacion | 2026-08-08 (segun metadatos de HuggingFace; anterior a la de creacion, inconsistencia de los metadatos) |
| Descargas / likes | 0 / 0 |
| Etiquetas | `region:us` |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. El repositorio no contiene pesos, tokenizador, configuracion de transformer, mezcla de expertos ni estado recurrente. Lo que contiene son cinco volcados de salida estandar de scripts de busqueda y escaneo sobre transcripciones locales, mas un registro de ocurrencias.

El unico mecanismo tecnico descrito es la cadena de integridad de `OCCURRENCES.hbp`: cada fila almacena `prev_event_hash` y `event_hash = sha256(row + "|prev_event_hash=" + prev)`, con genesis `0000…0000` (64 ceros). Segun el autor, editar cualquier fila invalida todos los hashes posteriores y `verify_chain.py` indica que fila se ha roto. El estado reportado en la model card es de 13 filas y 0 roturas, con head `db8d79d026b52409e309cac558c8a75de71de43435593cb101c5986aa695052e`. Este dato procede del propio autor y no se ha verificado de forma independiente.

El alcance de los escaneos esta delimitado por el autor: `scan_claims.py` y `extract_ctx.py` leen ficheros de transcripcion de agentes bajo un unico directorio local de proyecto, no leen contenido de repositorios y no miden commits ni lineas de codigo. El autor indica ademas que `INTERPRETATION.md` es un documento separado a proposito y que no forma parte de los datos.

## Capacidades

- No es un modelo: no genera texto, no razona, no ejecuta codigo ni atiende peticiones de inferencia.
- Contiene salida verbatim de scripts, reproducible mediante `python search_session.py`, `python search_agents.py`, `python scan_claims.py`, `python extract_ctx.py` y `python verify_chain.py OCCURRENCES.hbp`.
- Incluye los propios scripts, de modo que las lineas pueden rederivarse en lugar de aceptarse por confianza.
- Proporciona un registro de ocurrencias con cadena de hashes SHA-256 y verificacion de roturas por fila.
- No ofrece soporte de tool calling, function calling, agentes, capacidades multilingues ni modos de pensamiento, porque no es un componente ejecutable de ese tipo.
- Portabilidad limitada: segun el autor, los scripts leen un directorio local de transcripciones y, en otra maquina, las rutas de la cabecera de cada script deben reajustarse; la logica y el formato de salida se mantienen.

## Casos de uso

- Auditoria de procedencia de datos: usar los `RAW-*.txt` y los scripts como evidencia de como se genero cada cifra, reejecutando los programas en lugar de confiar en un resumen.
- Verificacion de integridad de registros: emplear el esquema `prev_event_hash` + `event_hash` de `OCCURRENCES.hbp` como patron reproducible para saber si un registro solo-anadible ha sido alterado y en que fila.
- Estudio de metodologia de trazabilidad: analizar el repositorio como ejemplo de separacion explicita entre datos (`RAW-*`) e interpretacion (`INTERPRETATION.md`), para disenar convenciones similares en proyectos propios.
- Reproduccion de experimentos de escaneo de transcripciones: reejecutar `scan_claims.py` y `extract_ctx.py` sobre un directorio local de transcripciones de agentes y comparar conteos por clase de frase, con la advertencia de que el alcance se limita a ese directorio.
- Docencia sobre limites de las metricas: usar el apartado de alcance para ilustrar como una afirmacion sobre contenidos de repositorios no queda respaldada por un escaneo que no lee repositorios.
- Archivado forense de sesiones: almacenar stdout capturado por redireccion y su digest `.sha256` como copia inmutable de una sesion de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no es un modelo evaluable y no presenta metricas de MMLU, HumanEval, GSM8K ni equivalentes. El unico dato numerico declarado es el estado de la cadena: 13 filas, 0 roturas, con el head indicado en la seccion de arquitectura. No se dispone de mediciones independientes de ese resultado.

## Requisitos de hardware

- VRAM para inferencia: no aplica. No hay pesos que cargar ni modelo que servir.
- GPU recomendadas: no aplica. El unico requisito descrito para reejecutar los scripts es un interprete de Python y acceso al directorio local de transcripciones.
- Ejecucion en GPU de consumo: no aplica, al no existir inferencia.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica. Ninguna de estas herramientas puede cargar este repositorio.
- Latencia y throughput: no disponible, y no definibles sin un modelo subyacente.
- Almacenamiento y red: los requisitos reales son los de descargar y conservar ficheros de texto, scripts y registros, mas el coste de computo de los escaneos sobre el directorio local que se indique.

## Comparativa con modelos similares

No disponible. Este repositorio no pertenece a una categoria de modelos comparables: no tiene parametros, contexto, licencia de uso ni rendimiento medible frente a alternativas. Cualquier comparacion con modelos de lenguaje, modelos de vision o modelos de embeddings seria improcedente. Lo mas cercano por naturaleza serian otros repositorios de datos y artefactos de procedencia, pero no se dispone de informacion sobre alternativas concretas en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo: si se busca inferencia de lenguaje, vision o audio, este repositorio no la proporciona.
- Licencia no declarada: no hay permiso explicito de uso comercial ni de redistribucion, lo que impide asumir derechos de reutilizacion.
- Ausencia de pipeline, idiomas y campos de model card convencionales: los metadatos de HuggingFace no describen ninguna tarea.
- Inconsistencia de fechas en los metadatos: la actualizacion (2026-08-08) es anterior a la creacion (2026-10-16); conviene tratarlas con cautela.
- Afirmaciones no verificadas: el estado de la cadena (13 filas, 0 roturas, head concreto) procede unicamente de la model card; no se aporta verificacion independiente.
- Alcance limitado y declarado por el autor: los escaneos leen un unico directorio local de transcripciones de agentes y no leen contenido de repositorios ni miden commits o lineas de codigo, por lo que no respaldan afirmaciones en ese sentido.
- Portabilidad: los scripts requieren reajustar rutas en otra maquina; sin la transcripcion original no pueden reproducirse las salidas.
- Riesgo de sobreinterpretacion: `INTERPRETATION.md` se presenta como una lectura separada y no como dato; tomar sus conclusiones como parte del registro seria un error de metodo.
- Contenido en ingles y con lenguaje reivindicativo sobre propiedad y autoria, sin relevancia tecnica para la evaluacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jessedbrown/raw-data
