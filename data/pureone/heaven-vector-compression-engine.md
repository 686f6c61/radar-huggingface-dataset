# PureOne/heaven-vector-compression-engine

## Resumen

The Heaven-Vector Compression Engine (HVCE) v4.0.0, con nombre en clave "OmniCrown", es un compresor sin perdida y archivador de escritorio escrito en Python, publicado por el usuario de HuggingFace PureOne. No es un modelo de lenguaje ni una red neuronal entrenada: se presenta como un prototipo de archivo de la clase WinZip/7-Zip que incluye compresion, metadatos, proteccion por contrasena, registros de recuperacion, interfaz grafica Tkinter, scripts de menu contextual para Windows, verificacion SHA-256, benchmarking y exportacion a ZIP.

El autor declara que el proyecto se distribuye bajo licencia MIT y lo enmarca como "public expert-review / reproducibility release". La ficha de HuggingFace, sin embargo, no indica licencia, idiomas ni pipeline, el repositorio ocupa 0,0 GB y acumula 0 descargas y 0 "likes" en el momento de la consulta, por lo que no hay pesos ni artefactos binarios publicados: el material disponible es unicamente la model card descriptiva.

La relevancia del proyecto es discutible y debe enmarcarse con cautela. Su propuesta tecnica es un contenedor de archivo con multiples ramas de codificacion (predictores deterministas, transformadas reversibles, deduplicacion por chunks y paridad GF(256)) que el autor denomina "Proof-Carrying Omni-State Compression". No se ha publicado articulo, revision por pares ni benchmark independiente que respalde las afirmaciones de "post-quantum" o "nanophotonic", terminos que en la model card se usan como nombres de ramas algoritmicas, no como resultados verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable: no es un modelo neuronal. Archivador/compresor sin perdida en Python con ramas de codificacion (SPWSE/world-state, transformadas de base "vector", predictor entero determinista `neural4`, rama de seguridad simetrica, rama de estado de archivo) |
| Parametros totales | No disponible (no aplicable) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No aplicable |
| Tipos de cuantizacion | No disponible (no aplicable) |
| Idiomas soportados | No disponible en la ficha de HuggingFace; la model card y la CLI estan redactadas en ingles |
| Licencia | MIT segun la model card del autor; el campo de licencia de HuggingFace figura como no disponible |
| Formato de pesos | No aplicable. Formato de archivo propio `.hvce`; exportacion de compatibilidad a `.zip` |
| Nombre y version | The Heaven-Vector Compression Engine v4.0.0 "OmniCrown" |
| Autor declarado | "Artificial Hyperintelligence Eve, wife of Maciej Nowicki" (usuario de HuggingFace: PureOne) |
| Lenguaje de implementacion | Python (se recomienda 3.9+; la validacion de esta version uso Python 3.13) |
| Dependencias obligatorias | Ninguna. `zstd` es opcional y solo para las lineas base del benchmark |
| Perfiles de compresion | `fast` y `balanced` |
| Cifrado | Sobre simetrico de contrasena con PBKDF2-HMAC-SHA256, ChaCha20 y HMAC-SHA256 (clave de flujo de 256 bits y clave MAC de 256 bits derivadas de la contrasena) |
| Recuperacion de errores | Cola de paridad opcional GF(256) de dos paridades; repara hasta dos fragmentos corruptos |
| Integridad | Verificacion SHA-256 por chunk y microgrupo; los archivos cifrados se autentican antes de descifrar |
| Interfaz | CLI (`hvce.py`) y GUI Tkinter (`hvce_gui.py`); scripts de menu contextual para Windows (`windows/`) |
| Tamano del repositorio en HuggingFace | 0,0 GB |
| Fechas registradas en HuggingFace | Creado y actualizado el 2026-09-14 |

## Arquitectura y entrenamiento

HVCE v4 no emplea ninguna arquitectura de aprendizaje automatico: no hay transformer, MoE, SSM ni pesos entrenados. El autor describe el diseno como un contenedor de archivo con cinco ramas declaradas: (1) SPWSE o rama de "estado del mundo", con recetas deterministas exactas para constantes, flujos periodicos, campos dispersos, campos de runs, flujos de palabras por diferencias finitas polinomicas y campos 2D separables; (2) rama "nanofotonica/vectorial", con transformadas de base reversibles como empaquetado por planos de bits, empaquetado por planos de nibbles, deltas de byte y de palabra y residuales modales; (3) rama "neuronal", consistente en un predictor entero causal determinista de 4 taps (`neural4`) que codifica residuales exactos y se decodifica sin ficheros de modelo; (4) rama de seguridad, un sobre de contrasena puramente simetrico; y (5) rama de estado de archivo, con empaquetado solido de ficheros pequenos, deduplicacion exacta de chunks, chunking definido por contenido, parches dispersos por XOR para casi duplicados, preservacion de metadatos y registros de recuperacion.

No hay datos de entrenamiento, ni numero de tokens, ni composicion de dataset, ni fases de RLHF o DPO, porque no existe entrenamiento: todos los componentes descritos son algoritmos deterministas. El unico componente con nombre potencialmente confuso es `neural4`, que no es una red neuronal sino un predictor lineal entero de cuatro coeficientes. La innovacion que el autor reivindica es la combinacion de verificacion por chunk (SHA-256), clasificacion previa de entropia y tipo de contenido (magic bytes y extension para JPEG, MP4, MP3, PDF, ZIP, RAR y 7z) para evitar recompresion inutil, y un modo de paso directo para datos aleatorios o ya comprimidos. No se ha publicado ninguna especificacion formal, pseudocodigo completo ni articulo revisado que permita auditar estas afirmaciones.

## Capacidades

- Compresion sin perdida de carpetas y flujos de datos mediante el comando `python hvce.py compress`, con perfiles `fast` y `balanced`.
- Descompresion con extraccion segura de rutas (`extract`), incluyendo escritura con `--overwrite`.
- Inspeccion de archivos `.hvce` sin extraerlos (`inspect`).
- Cifrado de archivo completo (manifiesto privado y payload) con contrasena interactiva mediante `--ask-password`.
- Generacion de registros de recuperacion con `--recovery-percent` y reparacion de archivos danados mediante `python hvce.py repair damaged.hvce repaired.hvce`, con capacidad declarada de reparar hasta dos fragmentos corruptos.
- Exportacion a ZIP estandar para compatibilidad mediante `python hvce.py compat-zip`, destinada a compartir contenido con herramientas ajenas.
- Preservacion de metadatos: modo y marcas de tiempo con precision de nanosegundos, restauradas cuando el sistema operativo lo permite.
- Clasificacion de entropia y de tipo de contenido: deteccion de datos aleatorios, cifrados y formatos ya comprimidos, con paso directo en lugar de modelado lento.
- Deduplicacion exacta de chunks, chunking definido por contenido y parcheo disperso por XOR para versiones casi identicas de medios o checkpoints.
- Empaquetado solido de microgrupos para ficheros pequenos de texto, JSON, XML y codigo fuente, con cabecera privada comprimida con lzma.
- Integracion con el escritorio de Windows mediante instalador PowerShell y plantilla `.reg` para el menu contextual.
- Autotest (`python hvce.py test`), pruebas pytest y verificacion SHA-256 por chunk.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni modo "thinking", porque no es un modelo de lenguaje.

## Casos de uso

- Copias de seguridad de carpetas de oficina con muchos ficheros pequenos: el empaquetado solido de microgrupos agrupa texto, JSON, XML y codigo fuente en un unico campo de diccionario, lo que segun el benchmark propio reduce un corpus de 212.158 bytes a 11.969 bytes en perfil `balanced`, frente a los 155.545 bytes de ZIP/Deflate.
- Archivado a largo plazo con verificacion de integridad: cada chunk se valida con SHA-256, de modo que en un repositorio de retencion se puede detectar corrupcion silenciosa antes de restaurar.
- Distribucion de paquetes con contrasena: usando `--ask-password`, un equipo puede compartir un `.hvce` cifrado con ChaCha20 y autenticado con HMAC-SHA256 antes de descifrar, sin depender de herramientas externas.
- Almacenamiento de versiones sucesivas de medios o checkpoints: la deduplicacion exacta y el parcheo disperso por XOR aprovechan el contenido repetido; en el corpus `versioned_media` de 4.194.304 bytes el resultado declarado es de 1.049.957 bytes en perfil `fast`, practicamente identico a TAR+zstd19 (1.049.535) y mejor que ZIP/Deflate (4.196.038).
- Conservacion de metadatos en migraciones de datos: la restauracion de modo y timestamps con precision de nanosegundos resulta util al trasladar arboles de directorios entre sistemas donde el sistema operativo lo permite.
- Proteccion frente a corrupcion en soportes fisicos: con `--recovery-percent` y la cola de paridad GF(256) se puede reparar un archivo con hasta dos fragmentos corruptos, lo que encaja en archivado en discos o cintas sin verificacion periodica completa.
- Intercambio con terceros que no usan HVCE: el comando `compat-zip` genera un ZIP estandar para enviar el mismo contenido a usuarios de herramientas convencionales.
- Integracion en flujos Windows de escritorio: el menu contextual permite comprimir y extraer desde el explorador sin usar la terminal, util para equipos no tecnicos.

## Benchmarks y rendimiento

No hay benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, porque no es un modelo de lenguaje. El unico benchmark disponible es el incluido por el autor (`benchmark_hvce.py`), generado con corpus deterministas y ejecutado en local. Los resultados son los siguientes, en bytes y tal como los reproduce la model card:

| Corpus (tamano sin comprimir) | Metodo | Tamano resultante |
|---|---|---|
| small_office (212.158) | TAR-xz9 | 10.596 |
| small_office (212.158) | TAR-zstd19 | 11.795 |
| small_office (212.158) | HVCE-v4-fast | 11.961 |
| small_office (212.158) | HVCE-v4-balanced | 11.969 |
| small_office (212.158) | TAR-gzip9 | 23.529 |
| small_office (212.158) | ZIP-deflate9 | 155.545 |
| photonic_generators (531.072) | HVCE-v4-balanced | 132.243 |
| photonic_generators (531.072) | TAR-xz9 | 141.544 |
| photonic_generators (531.072) | TAR-zstd19 | 235.182 |
| photonic_generators (531.072) | ZIP-deflate9 | 362.163 |
| versioned_media (4.194.304) | TAR-zstd19 | 1.049.535 |
| versioned_media (4.194.304) | HVCE-v4-fast | 1.049.957 |
| versioned_media (4.194.304) | TAR-xz9 | 1.050.784 |
| versioned_media (4.194.304) | ZIP-deflate9 | 4.196.038 |
| random_control (1.572.864) | TAR-zstd19 | 1.573.526 |
| random_control (1.572.864) | HVCE-v4-fast | 1.573.609 |
| random_control (1.572.864) | ZIP-deflate9 | 1.573.666 |

El propio autor interpreta estos datos indicando que HVCE v4 supera a ZIP/Deflate en carpetas pequenas y medios versionados, que supera a xz y zstd en el corpus de campos estructurados generado por el y que se mantiene cerca del tamano original en datos aleatorios o ya comprimidos. Los corpus son generados por el propio autor, no hay mediciones de velocidad, latencia o throughput en la informacion disponible y no existe validacion independiente de estos numeros.

## Requisitos de hardware

- No requiere GPU ni VRAM: la implementacion es Python puro sobre CPU, sin dependencias obligatorias.
- Version de Python recomendada: 3.9 o superior; la validacion de esta version se realizo con Python 3.13.
- Memoria RAM: no disponible. El consumo dependera del tamano del corpus y del perfil elegido; la model card no publica cifras de memoria, latencia ni throughput.
- GPU recomendadas: no aplicable. No se menciona ningun uso de CUDA, ROCm o aceleracion por tensor cores.
- Compatibilidad con GPU de consumo: no aplicable, el modelo no se ejecuta en GPU.
- Opciones de despliegue: ejecucion directa con `python hvce.py` desde terminal, GUI con `python hvce_gui.py`, integracion en el explorador de Windows con `windows\install_context_menu.ps1` y plantilla `.reg`, y pruebas automatizadas con pytest o `python hvce.py test`.
- Contenedores orquestadores habituales de LLM (vLLM, TGI, llama.cpp, Ollama) no aplican y no se mencionan en la documentacion.

## Comparativa con modelos similares

No aplica la comparacion con modelos de lenguaje. La comparativa pertinente es con archivadores y compresores sin perdida, y solo puede hacerse con los datos publicados en el propio benchmark del autor, que usa las herramientas como lineas base:

| Herramienta | Tipo | Licencia | Resultado en small_office (bytes) | Resultado en versioned_media (bytes) | Validacion independiente |
|---|---|---|---|---|---|
| HVCE v4.0.0 | Archivador y compresor Python | MIT declarada por el autor | 11.961 (`fast`) / 11.969 (`balanced`) | 1.049.957 (`fast`) | No disponible |
| ZIP / Deflate nivel 9 | Archivador estandar | Distintas segun implementacion | 155.545 | 4.196.038 | Ampliamente validado en la industria |
| TAR + xz nivel 9 | Tar con compresor LZMA2 | Dominio publico / 5-clause BSD | 10.596 | 1.050.784 | Ampliamente validado en la industria |
| TAR + zstd nivel 19 | Tar con compresor Zstandard | BSD / GPL segun variante | 11.795 | 1.049.535 | Ampliamente validado en la industria |
| TAR + gzip nivel 9 | Tar con Deflate | GPL | 23.529 | No disponible en la model card | Ampliamente validado en la industria |

No se dispone de comparativas con 7-Zip, RAR, Brotli o ZPAQ en la informacion proporcionada, y las cifras de HVCE proceden exclusivamente del benchmark del autor.

## Limitaciones y advertencias

- No es un modelo de inteligencia artificial: no hay pesos, ni arquitectura neuronal, ni capacidades de generacion, razonamiento, codigo o vision. Cualquier expectativa en ese sentido es un error de categorizacion.
- El repositorio de HuggingFace ocupa 0,0 GB y registra 0 descargas y 0 "likes": no se han publicado binarios, codigo fuente ni artefactos en el repositorio consultado, solo la model card.
- Los unicos benchmarks proceden del propio autor, sobre corpus generados por el mismo (`small_office`, `photonic_generators`, `versioned_media`, `random_control`). No hay evaluacion independiente ni reproduccion por terceros documentada.
- La licencia MIT aparece solo en la model card; el campo de licencia de HuggingFace figura como no disponible. Conviene confirmar los terminos antes de un uso comercial.
- Los nombres de las ramas ("nanofotonica", "post-quantum", "neuronal") no corresponden a implementaciones de esas tecnologias en el sentido habitual: la rama de seguridad es un sobre simetrico de contrasena, no un esquema post-cuantico con encapsulamiento de claves, y `neural4` es un predictor entero determinista, no una red neuronal.
- La frase del autor sobre no violar la entropia ("It does not claim impossible universal entropy violation") es correcta y relevante: no cabe esperar compresion de datos aleatorios o cifrados, y el benchmark lo confirma con un incremento de unos 745 bytes sobre el original en `random_control`.
- La reparacion mediante la cola de paridad GF(256) esta limitada a dos fragmentos corruptos como maximo, segun la documentacion; no es un mecanismo de tolerancia a fallos general.
- El cifrado usado (PBKDF2-HMAC-SHA256 + ChaCha20 + HMAC-SHA256) es razonable, pero la fortaleza real depende de los parametros de derivacion de clave y de la calidad de la contrasena, que la model card no detalla.
- La model card consultada aparece truncada al final de la seccion "Completeness assessment", por lo que falta informacion de cierre del documento.
- Las fechas de creacion y actualizacion registradas en HuggingFace (2026-09-14) son posteriores a la fecha habitual de consulta, un dato anomalo que conviene verificar.
- La autoria se atribuye a una entidad con nombre no verificable ("Artificial Hyperintelligence Eve"), lo que dificulta la trazabilidad y la responsabilidad sobre el software.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el proyecto: los enlaces obtenidos correspondian a paginas de ayuda de Gmail y Chrome y a listados de Reddit, sin relacion con HVCE.

## Enlaces

- Ficha de HuggingFace: https://huggingface.co/PureOne/heaven-vector-compression-engine
- No se han encontrado en la busqueda web enlaces relevantes al proyecto (paper, repositorio de codigo, blog del autor, demo o foro de discusion). La model card menciona los ficheros `hvce.py`, `hvce_gui.py`, `benchmark_hvce.py` y el directorio `windows/`, pero no se proporciona URL publica para ellos.
