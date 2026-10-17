# caslca/quillfern-catalog

## Resumen

`caslca/quillfern-catalog` no es un modelo de inteligencia artificial. Es un repositorio de artefactos firmados que contiene un catalogo de revisiones fijadas (pinned revisions) de modelos, pensado para ser consumido por una aplicacion de escritorio. El propio autor lo indica de forma explicita en la model card: "Nothing here is a model".

El contenido se reduce a dos ficheros: `catalog.json`, que enumera repositorios, revisiones y hashes de ficheros, y `catalog.json.sig`, que es una firma Ed25519 calculada sobre los bytes exactos de `catalog.json`. La aplicacion cliente verifica esa firma con una clave publica embebida antes de aceptar el catalogo. El problema que resuelve, por tanto, es el de la integridad y autenticidad de un conjunto de dependencias de modelos: garantiza que la aplicacion descarga exactamente las revisiones que el publicador aprobo, y no otras.

Dado que no hay pesos, no hay arquitectura neuronal, no hay tokenizador y no hay datos de entrenamiento, la ficha que sigue documenta el artefacto como lo que es: un fichero de indice mas su firma. Toda la informacion sobre arquitectura, parametros, contexto, cuantizacion, idiomas y rendimiento se marca como no disponible porque no existe en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un catalogo JSON firmado) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | no aplica; los artefactos son `catalog.json` y `catalog.json.sig` (firma Ed25519) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio contiene un indice en JSON con tres campos por entrada, segun la model card: repositorio, revision y hash de fichero. La unica primitiva criptografica descrita es una firma Ed25519 sobre el flujo de bytes exacto de `catalog.json`, almacenada en `catalog.json.sig` y verificada por la aplicacion de escritorio mediante una clave publica embebida en el binario del cliente.

El modelo de seguridad es el habitual en distribucion de artefactos: la firma aporta autenticidad e integridad, pero no confidencialidad, y su garantia depende por completo de que la clave publica embebida en la aplicacion no haya sido sustituida. No se documentan en la informacion proporcionada ni el esquema concreto de `catalog.json`, ni la version del formato, ni el algoritmo de hash empleado para los ficheros listados.

## Capacidades

- Publicacion de un indice de revisiones de modelos: enumera repositorios, revisiones y hashes de ficheros para que un cliente los descargue de forma determinista.
- Verificacion de integridad y autenticidad: la firma Ed25519 permite detectar manipulacion de `catalog.json` antes de su uso.
- Fijacion de versiones (pinning): al referenciar revisiones concretas en lugar de ramas moviles, evita que el cliente reciba contenido distinto al aprobado.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues que documentar.
- No dispone de modo de pensamiento, audio ni ninguna otra capacidad especial de inferencia.

## Casos de uso

- Distribucion verificable de dependencias de modelos en una aplicacion de escritorio: el cliente descarga `catalog.json` y `catalog.json.sig`, valida la firma con la clave publica embebida y solo entonces procede a descargar las revisiones listadas. Es el caso de uso principal y el unico descrito por el autor.
- Actualizacion controlada de modelos en produccion: al fijar revisiones y hashes, un cambio de catalogo se convierte en un acto de publicacion explicito, lo que permite auditar que version concreta usa cada instalacion.
- Cadena de suministro y trazabilidad: los hashes de fichero permiten reconstruir que binarios exactos se sirvieron a cada cliente en un momento dado.
- Deteccion de repositorios comprometidos o reescritos: si un repositorio upstream cambia una revision fijada, la verificacion de hash falla y el cliente puede rechazar la descarga.
- Entornos con conectividad intermitente o air-gapped: un catalogo unico simplifica el espejado y la validacion offline de un conjunto cerrado de artefactos.
- Base para politicas de actualizacion por canal (estable, beta): distintos catalogos firmados pueden definir distintos conjuntos de revisiones sin tocar el codigo del cliente.
- Nota importante: ninguno de estos casos implica ejecutar inferencia; el repositorio no aporta capacidad de modelo alguna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No aplica: el repositorio no contiene un modelo evaluable con MMLU, HumanEval, GSM8K ni ninguna otra prueba de capacidad.

## Requisitos de hardware

- VRAM para inferencia: no aplica; no hay modelo que cargar.
- GPU recomendadas: no aplica; no se requiere GPU.
- Compatibilidad con GPU de consumo: no aplica; el unico coste es el almacenamiento de los ficheros JSON y su firma.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI; el consumo se realiza mediante el cliente de escritorio que implementa la verificacion de la firma Ed25519.
- Latencia y throughput: no disponibles; dependen del cliente y del volumen de entradas del catalogo, no de una carga de inferencia.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque `caslca/quillfern-catalog` no es un modelo. Sus equivalentes funcionales serian otros mecanismos de distribucion de artefactos firmados (por ejemplo, indices firmados o ficheros de bloqueo con verificacion criptografica), no modelos de lenguaje. La informacion proporcionada no incluye ninguna alternativa concreta con la que comparar parametros, contexto, licencia o rendimiento.

## Limitaciones y advertencias

- No es un modelo: no genera texto ni realiza inferencia de ningun tipo. Cualquier uso como modelo es un error de interpretacion.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso de uso comercial, redistribucion ni modificacion del catalogo o de la firma.
- La seguridad depende exclusivamente de la clave publica embebida en la aplicacion cliente. Si esa clave se filtra o se sustituye, la verificacion deja de aportar garantia.
- La firma cubre los bytes exactos de `catalog.json`; cualquier reformateo, normalizacion de saltos de linea o reserializacion invalida la verificacion.
- La firma aporta autenticidad e integridad, pero no confidencialidad: el contenido del catalogo es legible por cualquiera.
- No se documentan en la informacion disponible la version del esquema, el algoritmo de hash de los ficheros listados ni el procedimiento de rotacion de claves.
- Repositorio sin traccion publica: 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia externa sobre su uso en produccion.
- Los metadatos declaran creacion el 2026-10-16T23:25:10Z y actualizacion el 2026-10-16T23:25:13Z; conviene verificar la coherencia temporal antes de integrarlo en un pipeline.
- No se dispone de informacion sobre sesgos, alucinacion o limites de contexto e idioma porque no hay modelo subyacente al que atribuirlos.

## Enlaces

- HuggingFace: https://huggingface.co/caslca/quillfern-catalog
- No se han encontrado otros enlaces (papers, blogs, repositorios de codigo o demos) en la informacion proporcionada.
