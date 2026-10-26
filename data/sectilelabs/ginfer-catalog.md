# SectileLabs/ginfer-catalog

## Resumen

`SectileLabs/ginfer-catalog` no es un modelo de lenguaje, sino un fichero de indice en formato JSON (`catalog.json`) que enumera los paquetes de modelos descargables por GChat, el cliente de la plataforma GInfer. El repositorio lo mantiene SectileLabs y su funcion es actuar como fuente unica de verdad para el cliente: GChat lee este unico fichero y, a partir de el, ofrece al usuario los modelos disponibles, sus URL de descarga fijadas a un commit concreto, su tamano exacto en bytes, su SHA-256, el grado de paralelismo tensorial soportado y el hardware en el que cada paquete ha sido probado.

El contenido es, por tanto, metadatos de distribucion: identidad del modelo y del paquete, URL de descarga, integridad criptografica, tamaños de tensor-parallel (1 o 2 GPUs), arquitecturas de GPU NVIDIA y memoria minima por GPU con la que se valido el paquete, tipos de procesador para paquetes de CPU (AVX2, AVX-512, AMX), capacidades declaradas (por ejemplo tools y vision) y los ajustes de lanzamiento probados que GChat ofrece al cargar el modelo. El esquema se declara con `manifest_version` y `schema_version` iguales a 1, y GChat solo acepta esa version de esquema.

Su relevancia es de infraestructura mas que de investigacion: no contiene pesos ni permite inferencia por si mismo. Los paquetes a los que apunta se ejecutan unicamente sobre GInfer y GChat y no son ficheros safetensors ni GGUF, de modo que este repositorio sirve para aprovisionamiento reproducible, verificacion de integridad y planificacion de capacidad, no para evaluar calidad de un modelo. El repositorio no registra descargas ni interacciones y su licencia declarada es Apache-2.0, mientras que la licencia de cada modelo distribuido figura en su repositorio correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: no es una red neuronal, es un indice de distribucion en JSON. Los paquetes referenciados corresponden a modelos cuya arquitectura no se detalla en la informacion disponible |
| Parametros totales | No aplica / no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El catalogo no describe formatos de cuantizacion; los paquetes no son safetensors ni GGUF |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 para el repositorio del catalogo; la licencia de cada modelo distribuido se indica en su repositorio de modelo |
| Formato de pesos | No contiene pesos. El fichero es JSON (`catalog.json`); los paquetes apuntados usan un formato propio de GInfer/GChat |
| Version de esquema | `manifest_version` = 1, `schema_version` = 1 (GChat solo acepta la version 1) |
| Campos por paquete | Nombre de paquete, identidad del modelo, URL de descarga fijada a commit, tamano exacto en bytes, SHA-256, tensor-parallel size (1 o 2), arquitecturas GPU NVIDIA y memoria minima por GPU probada, o tipo de procesador (AVX2, AVX-512, AMX) para CPU, capacidades declaradas y ajustes de lanzamiento probados |
| Verificacion de integridad | SHA-256 por fichero, comparado por GChat tras la descarga y equivalente al metadato de Hugging Face |
| Inmutabilidad de descargas | URL con patron `.../resolve/<commit>/<file>`, fijada al commit del repositorio de modelo |
| Runtime soportado | Exclusivamente GInfer y GChat |
| Metricas del repositorio | 0 descargas, 0 likes; creado y actualizado el 2026-10-26T18:43:08Z |

## Arquitectura y entrenamiento

No existe arquitectura de red ni proceso de entrenamiento que describir: el artefacto es un documento de datos estructurados. Su "diseno" consiste en un objeto raiz con los campos `manifest_version`, `schema_version`, `updated_at` y `models`; `models` es una lista de entradas de modelo y cada entrada contiene a su vez una lista `releases` con los paquetes publicados. Cada paquete aporta la informacion necesaria para que un cliente descargue, verifique y arranque el modelo sin consultar ninguna otra fuente.

La innovacion tecnica relevante, en terminos de ingenieria de distribucion, es el anclaje a commit en las URL de descarga: aunque el repositorio del modelo reciba commits posteriores, la descarga resuelve siempre el mismo fichero que figura en el catalogo, y el tamano y el SHA-256 declarados coinciden con los metadatos de Hugging Face del fichero. A eso se suma la declaracion explicita de requisitos de ejecucion (tensor-parallel, familia de GPU y memoria minima por GPU probada, o extension ISA de CPU) y de los ajustes de lanzamiento validados, lo que permite al cliente filtrar paquetes compatibles con el hardware del usuario antes de iniciar cualquier descarga. No se dispone de informacion sobre el proceso de generacion del fichero (`updated_at`), su cadencia de actualizacion ni el procedimiento de validacion del esquema.

## Capacidades

- Publicacion de un indice de paquetes de modelos descargables por GChat, con identidad de modelo y nombre de paquete por entrada.
- Verificacion de integridad de descargas mediante SHA-256 por fichero.
- Descargas reproducibles gracias al anclaje de cada URL a un commit concreto del repositorio de modelo.
- Declaracion de parallelismos tensorial por paquete: 1 para una GPU, 2 para dos GPU.
- Declaracion de compatibilidad de hardware: arquitecturas de GPU NVIDIA con memoria minima por GPU probada, y tipos de procesador AVX2, AVX-512 y AMX para paquetes de CPU.
- Declaracion de capacidades del modelo a nivel de paquete, con ejemplos citados de soporte de herramientas (tools) y vision.
- Publicacion de ajustes de lanzamiento probados que GChat ofrece al cargar el modelo.
- Versionado explicito de esquema (`manifest_version` y `schema_version` = 1) con rechazo de versiones no soportadas por parte del cliente.
- No soporta: generacion de texto, razonamiento, codigo, matematicas, tool calling en ejecucion, agentes, capacidades multilingues ni modo thinking. El catalogo no ejecuta inferencia.

## Casos de uso

- Aprovisionamiento de clientes GChat: el cliente lee un unico fichero del repositorio y construye con el la lista de modelos ofrecidos, evitando consultas dispersas a multiples repositorios y centralizando el control de versiones del catalogo.
- Verificacion de integridad en pipelines de descarga: un script propio puede descargar cada paquete, calcular su SHA-256 y compararlo con el valor del catalogo antes de permitir su carga, lo que detecta ficheros truncados o sustituciones.
- Despliegue en entornos con air-gap o espejo interno: las URL ancladas a commit permiten replicar exactamente el mismo conjunto de ficheros en un servidor intermedio y servir el catalogo modificado, manteniendo la trazabilidad del commit de origen.
- Planificacion de capacidad de infraestructura: los campos de tensor-parallel size, familia de GPU y memoria minima por GPU probada permiten cruzar el catalogo con el inventario de hardware disponible y decidir que paquetes pueden desplegarse en cada nodo.
- Enrutado por capacidades en una aplicacion: si un flujo requiere tool calling o vision, la aplicacion puede filtrar los paquetes que declaran esas capacidades y descartar el resto antes de descargar, ahorrando ancho de banda y espacio en disco.
- Auditoria de procedencia y licencias: el catalogo identifica el repositorio de origen de cada paquete, lo que facilita revisar la licencia del modelo en su repositorio y mantener un registro de que artefactos se han distribuido y con que hash.
- Validacion de esquema en CI: un job de integracion continua puede comprobar que el fichero cumple la version 1 del esquema, que todos los campos obligatorios estan presentes, que los SHA-256 tienen formato valido y que ninguna URL carece de commit fijado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene pesos ni artefactos evaluables, por lo que no procede aplicar MMLU, HumanEval, GSM8K ni metricas equivalentes. Tampoco se han publicado mediciones de latencia o throughput de los paquetes referenciados.

## Requisitos de hardware

- VRAM para este repositorio: practicamente nula; el fichero es un JSON de indice y puede leerse en cualquier equipo. No se dispone del tamano exacto del fichero.
- VRAM para los modelos referenciados: no disponible en la informacion proporcionada. El catalogo declara, por paquete, la memoria minima por GPU con la que fue probado y el tensor-parallel size, pero esos valores concretos no se incluyen en los datos facilitados.
- GPU: el esquema contempla arquitecturas de GPU NVIDIA; no se especifica la lista de familias ni generaciones soportadas.
- CPU: contempla paquetes para procesadores con AVX2, AVX-512 y AMX, lo que cubre despliegues sin GPU en hardware x86 relativamente reciente.
- Cabe en GPU de consumo: no disponible. Depende de cada paquete y de la memoria minima declarada, que no se ha proporcionado.
- Opciones de despliegue: exclusivamente GInfer y GChat. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni otros runtimes, y los paquetes no son safetensors ni GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La categoria correcta no es "modelo", sino "indice de distribucion de modelos". La comparacion se plantea frente a otros mecanismos de catalogo, sin datos numericos disponibles para la mayoria de campos.

| Criterio | SectileLabs/ginfer-catalog | Registro de modelos de vLLM | Biblioteca de Ollama | Repositorio Hugging Face |
|---|---|---|---|---|
| Naturaleza | Fichero JSON unico con esquema versionado | Registro en codigo dentro del propio runtime | Manifiestos por modelo con digest de blob | Repositorios de pesos con metadatos |
| Formato de pesos referenciado | Formato propio de GInfer/GChat | safetensors y otros | GGUF | safetensors, GGUF, otros |
| Verificacion de integridad | SHA-256 por fichero en el catalogo | No disponible en la informacion | Digest por capa/blob | Hash por fichero (LFS) |
| Anclaje a commit | Si, en la URL de descarga | No disponible | No disponible | Si, por commit o revision |
| Metadatos de hardware | Tensor-parallel, familia de GPU, memoria minima probada, ISA de CPU | No disponible | No disponible | Parcial, dependiente del autor |
| Licencia | Apache-2.0 (catalogo); por modelo en su repositorio | No disponible | No disponible | Definida por cada autor |
| Ambito de uso | Solo GInfer/GChat | vLLM | Ollama | Generico |

No se dispone de datos para comparar con catalogos propietarios equivalentes de otros fabricantes.

## Limitaciones y advertencias

- No es un modelo: no genera texto ni ejecuta inferencia. Cualquier expectativa de evaluacion de capacidades sobre este repositorio es un error de categoria.
- Dependencia total de GInfer y GChat: los paquetes no son safetensors ni GGUF y no pueden cargarse con vLLM, llama.cpp, Ollama ni TGI. El catalogo no tiene utilidad fuera de ese ecosistema.
- Compatibilidad de esquema estricta: GChat solo acepta `schema_version` 1. Un cambio de esquema en el catalogo puede dejar inoperativos los clientes antiguos.
- Licencia: el repositorio del catalogo es Apache-2.0, pero esa licencia no se extiende a los modelos distribuidos; cada modelo tiene su propia licencia en su repositorio, y es responsabilidad del usuario revisarla antes de un uso comercial.
- Trazabilidad incompleta en los datos disponibles: no se especifican los modelos concretos incluidos, ni el numero de entradas, ni el tamano del fichero, ni la politica de actualizacion.
- Riesgo de obsolescencia silenciosa: si un paquete se retira del repositorio de origen, la URL anclada al commit dejara de resolver y la descarga fallara; el catalogo no documenta un mecanismo de fallback.
- Confianza en el canal: el SHA-256 protege la integridad del fichero descargado, pero la autenticidad del propio catalogo depende de como lo obtenga el cliente; no se documenta firma del catalogo.
- Ausencia de senales de comunidad: 0 descargas y 0 likes, creado y actualizado en la misma marca temporal, sin historial de mantenimiento verificable.
- Sin datos de sesgo, alucinacion o limitaciones linguisticas aplicables al catalogo; esas advertencias deberan evaluarse en la ficha del modelo concreto que se descargue.
- Referencia externa no verificada: el resultado de busqueda web sobre "GLM-5.3-Flash" y "Strata" no confirma que ese modelo este incluido en este catalogo; no se ha usado como dato.

## Enlaces

- Repositorio del catalogo en Hugging Face: https://huggingface.co/SectileLabs/ginfer-catalog
- Referencia externa no verificada (hilo de Reddit sobre GLM 5.3 Flash y Strata): https://www.reddit.com/r/LocalLLaMA/comments/1x1wxdt/strata_for_glm_53_flash/
- Repositorios de modelos de SectileLabs: no disponible la lista concreta; el catalogo apunta a ficheros bajo repositorios de modelo de SectileLabs mediante URL del tipo `.../resolve/<commit>/<file>`
- Documentacion de GInfer o GChat, paper tecnico y repositorio de codigo: no disponibles en la informacion proporcionada
