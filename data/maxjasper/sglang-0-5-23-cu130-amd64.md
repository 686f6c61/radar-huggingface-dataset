# maxJasper/sglang-0.5.23-cu130-amd64

## Resumen

Este repositorio de Hugging Face no contiene un modelo de IA, sino un archivo de imagen de contenedor OCI (Open Container Initiative) del runtime de inferencia SGLang en su version 0.5.23, compilado para CUDA 13.0 y arquitectura amd64. Lo publica el usuario maxJasper como "relay de transporte controlado" para mover la imagen desde un entorno local hasta el registro interno de Al Ain Harbor (`registry.adeoaiengine.ecouncil.ae`), segun se describe en la model card.

SGLang es un framework de servicio de modelos de lenguaje de alto rendimiento, conocido por su gestor de cache KV (RadixAttention) y su lenguaje de programacion estructurado para generacion. Este artefacto empaqueta el runtime, no los pesos: el archivo `sglang-0.5.23-cu130-amd64.tar` ocupa 39.787.218.432 bytes (aproximadamente 39,8 GB) e incluye las dependencias CUDA 13.0 necesarias para ejecutar el servidor.

Su relevancia es operativa, no de modelado: sirve para desplegar SGLang en infraestructura con GPU NVIDIA en entornos donde no se puede acceder directamente a registros publicos. Para desarrolladores e investigadores que evaluan modelos, este repositorio es un medio de distribucion de software de inferencia, no un modelo evaluable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es una imagen de contenedor OCI del runtime SGLang 0.5.23) |
| Parametros totales | no disponible (no aplica; no contiene pesos) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del modelo que se sirva con el runtime) |
| Tipos de cuantizacion | no disponible (el runtime soporta las cuantizaciones del modelo cargado; no se especifican aqui) |
| Idiomas soportados | no disponible (depende del modelo servido) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el artefacto es un archivo `.tar` de imagen OCI, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: este repositorio no contiene un modelo entrenado. El artefacto es una imagen OCI de SGLang 0.5.23 compilada contra CUDA 13.0 para amd64, con digest de configuracion `sha256:ab8fc368a60473e329bde89157d84b20ce3bef8fddd5b6bf4999df65c4392cf5` y SHA-256 del archivo `570648111409bdece6ec93192643808a30787311059c90f451e487cfe145c20a`. El autor advierte que el archivo puede no preservar el tag de origen local, por lo que tras importarlo hay que inspeccionar la referencia real y retiquetarla explicitamente al destino previsto.

SGLang, como framework, implementa tecnicas como RadixAttention para reutilizacion de cache KV en prefijos compartidos, decodificacion especulativa y un frontend de lenguaje para generacion estructurada. Sin embargo, la model card no aporta detalles adicionales sobre el build concreto ni sobre las dependencias incluidas mas alla de la version de runtime y CUDA.

## Capacidades

- Distribucion de un runtime de inferencia SGLang 0.5.23 listo para importar en un registro OCI compatible.
- Ejecucion de servidores de modelos de lenguaje sobre GPU NVIDIA con CUDA 13.0 en plataforma amd64.
- Transporte controlado de artefactos entre entornos aislados (el autor lo describe como "relay de transporte").
- Verificacion de integridad mediante digest de configuracion y SHA-256 del archivo.
- No incluye capacidades de generacion, razonamiento, codigo, vision ni tool calling por si mismo; estas dependen del modelo que se cargue en el runtime.
- No soporta agentes ni razonamiento multi-paso de forma nativa; eso lo aporta el modelo servido.

## Casos de uso

- Despliegue de SGLang en clusters internos sin acceso a registros publicos: se importa el `.tar`, se verifica el digest y se retiqueta al destino `registry.adeoaiengine.ecouncil.ae/openinnovationai/platform/mlops/mlops-serving/sglang:0.5.23-cu130-amd64`.
- Replicacion de entornos de inferencia en air-gapped: el archivo de 39,8 GB permite mover el runtime completo a redes sin salida a Internet.
- Estandarizacion de versiones de serving: fijar SGLang 0.5.23 con CUDA 13.0 evita deriva de dependencias entre equipos.
- Auditoria de cadena de suministro: el SHA-256 del archivo y el digest de configuracion permiten verificar que la imagen desplegada coincide con la construida localmente.
- Base para pipelines MLOps de serving: integracion en flujos de CI/CD que promocionan imagenes entre registros (por ejemplo, de un registro de desarrollo a uno de produccion).
- Formacion de equipos: distribucion de un entorno reproducible de SGLang para practicas o pruebas de rendimiento con modelos cargados por el usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: al menos 39,8 GB libres para el archivo `.tar`, mas el espacio adicional tras la importacion en el registro (la imagen descomprimida puede ocupar un tamano distinto).
- GPU: no se especifica en la model card; el runtime esta compilado para CUDA 13.0, por lo que requiere drivers y GPUs NVIDIA compatibles con esa version de CUDA.
- VRAM: no disponible; depende del modelo que se sirva con SGLang.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo y de la version de CUDA soportada por el driver.
- Opciones de despliegue: importacion en un registro OCI compatible y ejecucion como contenedor; SGLang soporta servidores HTTP y modo offline, pero la model card no detalla la configuracion concreta del build.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Este artefacto no es un modelo, por lo que no procede compararlo con modelos de lenguaje. Como referencia de runtime, alternativas funcionales serian vLLM, TensorRT-LLM o TGI, pero la informacion proporcionada no incluye datos comparativos de rendimiento ni de versiones equivalentes.

## Limitaciones y advertencias

- No es un modelo: no debe evaluarse como tal ni usarse para inferencia directa sin cargar pesos aparte.
- Licencia no especificada: no se indica licencia en la model card ni en los metadatos, lo que impide confirmar condiciones de uso comercial o redistribucion.
- El autor advierte explicitamente de que la procedencia de la imagen es el build local del runtime, no una firma upstream de SGLang; no hay garantia de integridad criptografica mas alla de los hashes indicados.
- El archivo puede no preservar el tag de origen; es obligatorio inspeccionar y retiquetar antes de usar.
- Riesgo de seguridad: el repositorio es publico y el autor pide no subir credenciales, claves, modelos ni datos de clientes; cualquier uso debe validar el contenido antes de desplegarlo en produccion.
- CUDA 13.0 es una version relativamente reciente; puede no ser compatible con drivers o GPUs mas antiguas.
- Sin datos de benchmarks, latencia ni throughput, no es posible estimar su rendimiento frente a otras imagenes de serving.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/maxJasper/sglang-0.5.23-cu130-amd64
- Proyecto SGLang (referencia del runtime): no disponible en la informacion proporcionada
- Registro destino indicado por el autor: `registry.adeoaiengine.ecouncil.ae/openinnovationai/platform/mlops/mlops-serving/sglang:0.5.23-cu130-amd64`
