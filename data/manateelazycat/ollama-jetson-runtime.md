# manateelazycat/ollama-jetson-runtime

## Resumen

`manateelazycat/ollama-jetson-runtime` no es un modelo de lenguaje, sino un repositorio de imagenes Docker precompiladas de Ollama para plataformas NVIDIA Jetson AGX Thor y Orin. El autor, manateelazycat, lo publica como soporte para despliegues personalizados de modelos Ollama dentro de su ecosistema AI Pod. El repositorio contiene archivos de imagen exportados (`docker load`) sin pesos de modelos, datos de usuario ni credenciales de ejecucion.

El problema que resuelve es la falta de builds oficiales de Ollama adaptados a las arquitecturas SM87 (Orin) y SM110 (Thor) con las versiones concretas de JetPack y L4T. Cada imagen esta etiquetada contra una combinacion especifica de plataforma y runtime CUDA: `0.32.3` para Orin con JetPack 6.2 / L4T R36, `0.40.16-orin-r39.2-sm87` para Orin con JetPack 7.2 / L4T R39, y `0.32.3-thor-r38.4.0-sm110` para Thor con JetPack 7.2 / L4T R38/R39.

Es relevante para quienes despliegan inferencia en hardware Jetson de borde y necesitan una base reproducible: cada capa y archivo exportado esta verificado con SHA256, y los IDs de imagen y checksums se registran en `archives.json`. El repositorio pesa 10,2 GB, coherente con archivos de imagen Docker que incluyen runtime CUDA y dependencias, no con pesos de un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; es un runtime de inferencia empaquetado en Docker) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (el runtime soporta los formatos que gestione la version de Ollama empaquetada; no se detallan) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible como licencia unica del repo; el software Ollama incluido es MIT y los componentes NVIDIA/CUDA conservan sus licencias respectivas |
| Formato de pesos | no disponible (el repositorio contiene archivos de imagen Docker, no pesos) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: no hay un transformer ni un proceso de entrenamiento. El contenido son archivos de imagen Docker de Ollama compilados para las arquitecturas GPU de Jetson AGX Orin (SM87) y Thor (SM110), con las versiones de JetPack y L4T indicadas en cada etiqueta. Las imagenes se distribuyen tanto en `registry.lazycat.cloud/catdogai/jetson-ollama` como en copias de Docker Hub con configuracion y capas identicas.

La innovacion tecnica relevante es la trazabilidad de la cadena de suministro: cada capa de origen y cada archivo exportado esta verificado con SHA256, y los IDs de imagen y checksums quedan registrados en `archives.json`. La restauracion se hace con `docker load`, usando el runtime JetPack/CUDA correspondiente a cada plataforma. Se preservan los archivos de licencia del software upstream.

## Capacidades

- Proporciona un runtime Ollama funcional sobre Jetson AGX Orin con JetPack 6.2 / L4T R36 (imagen `0.32.3`).
- Proporciona un runtime Ollama sobre Orin con JetPack 7.2 / L4T R39 (imagen `0.40.16-orin-r39.2-sm87`).
- Proporciona un runtime Ollama sobre Thor con JetPack 7.2 / L4T R38/R39 (imagen `0.32.3-thor-r38.4.0-sm110`).
- Permite servir modelos mediante la API de Ollama una vez restaurada la imagen y descargado el modelo correspondiente.
- Verificacion de integridad SHA256 de capas y archivos exportados.
- Registro de IDs de imagen y checksums en `archives.json` para auditoria.
- No incluye pesos de modelos, datos de usuario ni credenciales.

## Casos de uso

- Despliegue de inferencia en Jetson AGX Orin en produccion: restaurar la imagen `0.32.3` con `docker load` sobre JetPack 6.2 / L4T R36 y servir modelos a traves de la API de Ollama, evitando compilar Ollama manualmente contra CUDA para SM87.
- Despliegue en Jetson AGX Thor: usar la imagen `0.32.3-thor-r38.4.0-sm110` para aprovechar la GPU SM110 con JetPack 7.2, un escenario donde los builds genericos de Ollama no estan optimizados.
- Actualizacion controlada de runtime: migrar de la imagen de Orin para L4T R36 a la de L4T R39 (`0.40.16-orin-r39.2-sm87`) manteniendo la misma plataforma y validando checksums contra `archives.json`.
- Entornos de borde aislados: llevar los archivos de imagen por medios offline (el repositorio pesa 10,2 GB) y restaurarlos con `docker load` en dispositivos sin acceso a registros publicos.
- Auditoria de cadena de suministro: verificar que cada capa y archivo exportado coincide con el SHA256 registrado antes de desplegar en flotas de dispositivos Jetson.
- Reproducibilidad en laboratorio: fijar la version exacta de Ollama y del runtime CUDA en funcion de la placa y la version de JetPack, evitando discrepancias entre nodos de un mismo experimento.
- Integracion en el ecosistema AI Pod: desplegar modelos personalizados de Ollama sobre la infraestructura del autor usando las imagenes como base del contenedor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: NVIDIA Jetson AGX Orin (SM87) y Jetson AGX Thor (SM110). No es ejecutable en GPU de escritorio ni en CPU convencional como plataforma objetivo.
- Runtime requerido: JetPack 6.2 / L4T R36 para la imagen `0.32.3` de Orin; JetPack 7.2 / L4T R39 para la imagen `0.40.16-orin-r39.2-sm87`; JetPack 7.2 / L4T R38/R39 para la imagen de Thor.
- Almacenamiento: el repositorio ocupa 10,2 GB; hay que prever espacio adicional para las capas descomprimidas y para los pesos de los modelos que se descarguen despues.
- VRAM: no disponible; depende del modelo que se sirva con Ollama, no de la imagen.
- Despliegue: `docker load` de los archivos de imagen y ejecucion con el runtime CUDA/JetPack correspondiente. Ollama expone su API habitual una vez arrancado el contenedor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Alternativa | Tipo | Plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|
| `manateelazycat/ollama-jetson-runtime` | Imagenes Docker de Ollama precompiladas | Jetson AGX Orin (SM87) y Thor (SM110) | Ollama MIT; componentes NVIDIA/CUDA con sus licencias | Hugging Face y `registry.lazycat.cloud` |
| Imagen oficial de Ollama | Runtime generico | CPU y GPU de escritorio/servidor (CUDA x86) | MIT | Docker Hub |
| Build manual de Ollama contra CUDA para Jetson | Compilacion propia | Jetson segun toolchain | MIT | Requiere compilacion local |
| `jetson-containers` (proyecto comunitario) | Coleccion de contenedores para Jetson | Multiples plataformas Jetson | Varía por contenedor | GitHub / NGC |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni tiene capacidades cognitivas; es infraestructura de despliegue.
- La imagen esta ligada a una version concreta de JetPack/L4T y a la arquitectura GPU (SM87 o SM110); usar una combinacion distinta puede provocar fallos de carga o de ejecucion CUDA.
- El repositorio no incluye pesos de modelos; hay que descargarlos por separado, con el coste de almacenamiento y red asociado.
- La licencia del repositorio no esta declarada de forma explicita; solo se indica que Ollama es MIT y que los componentes de terceros conservan sus licencias. Conviene revisar los archivos de licencia incluidos antes de un uso comercial.
- La verificacion SHA256 cubre integridad, no autenticidad del autor; hay que confiar en el origen del repositorio y del registro `registry.lazycat.cloud`.
- No hay informacion sobre soporte, mantenimiento a largo plazo ni compatibilidad con versiones futuras de JetPack.
- Sin datos de benchmarks ni de rendimiento en inferencia para ningun modelo servido sobre estas imagenes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/manateelazycat/ollama-jetson-runtime
- Registro de imagenes: `registry.lazycat.cloud/catdogai/jetson-ollama` (etiquetas `0.32.3`, `0.40.16-orin-r39.2-sm87`, `0.32.3-thor-r38.4.0-sm110`)
- Proyecto Ollama (licencia MIT): https://github.com/ollama/ollama
- Perfil del autor en Hugging Face: https://huggingface.co/manateelazycat
