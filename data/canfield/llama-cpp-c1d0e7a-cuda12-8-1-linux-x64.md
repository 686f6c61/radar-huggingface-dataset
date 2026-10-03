# Canfield/llama.cpp-c1d0e7a-cuda12.8.1-linux-x64

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino una compilacion binaria de llama.cpp, el motor de inferencia en C/C++ para modelos en formato GGUF. En concreto, se trata de un build para Linux x86-64 con soporte CUDA 12.8.1, generado a partir del commit `c1d0e7a004015f23bc0233470b747b596f29b264` (release `b10621`) por el usuario Canfield. El motivo de su existencia es concreto: llama.cpp no publica un archivo Linux CUDA para ese commit, de modo que este artefacto cubre ese hueco con una receta de compilacion fijada y reproducible incluida en el propio repositorio.

El paquete ocupa 191.811.056 bytes (aproximadamente 0,2 GB) y contiene `llama-server` junto con sus bibliotecas, compiladas para las arquitecturas CUDA 50, 52, 60, 61, 70, 75, 80, 86, 89, 90, 100 y 120, con la interfaz web desactivada. Incluye un archivo `BUILD-INFO.txt` que registra el commit de origen, el digest de la imagen de compilacion, el compilador, el snapshot de Ubuntu, las versiones de los paquetes y el SHA-256 de cada archivo de la receta. No incorpora las bibliotecas de NVIDIA: el runtime de CUDA y cuBLAS deben descargarse aparte y colocarse junto al binario.

Su relevancia es de tipo operativo mas que de investigacion. Frente a los canales habituales de distribucion de llama.cpp, ofrece tres propiedades utiles en produccion: un nombre de archivo que fija el commit, un hash SHA-256 publicado que se mantiene valido porque los archivos nunca se sobrescriben, y una verificacion de reproducibilidad binaria en la que dos compilaciones independientes produjeron bytes identicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplicable (artefacto de software, no red neuronal) |
| Parametros totales | no aplicable |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (depende del modelo cargado; en la prueba de cualificacion se uso 32.768 tokens) |
| Tipos de cuantizacion | no aplicable al artefacto; soporta los tipos GGUF de llama.cpp (en la cualificacion se uso Q4_K_M) |
| Idiomas soportados | no disponible (depende del modelo cargado) |
| Licencia | MIT (llama.cpp y la receta de compilacion incluida en `recipe/`) |
| Formato de pesos | no aplicable; consume modelos en formato GGUF |
| Tipo de artefacto | build CUDA de llama.cpp, Linux x86-64 |
| Commit de origen | `c1d0e7a004015f23bc0233470b747b596f29b264` (release `b10621`) |
| Version de CUDA | 12.8.1 |
| Arquitecturas CUDA compiladas | 50, 52, 60, 61, 70, 75, 80, 86, 89, 90, 100, 120 |
| Archivo distribuido | `llama-c1d0e7a-cuda12.8.1-linux-x64.tar.gz` |
| Tamano del archivo | 191.811.056 bytes |
| SHA-256 del archivo | `7fd27fca6917b1f5aeae38eef9815eed932cf1f7c490227e0eb15612cb238a21` |
| Binario principal | `llama-server` (interfaz web desactivada) |
| Dependencias externas | `cuda_cudart-linux-x86_64-12.8.90-archive.tar.xz` (SHA-256 `8d566b5f...faca68`) y `libcublas-linux-x86_64-12.8.4.1-archive.tar.xz` (SHA-256 `21718957...323bb`) |
| Requisitos de controlador | no disponible en la informacion proporcionada; el controlador de GPU lo aporta el sistema |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-10-03 |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, por lo que no hay datos de entrenamiento, tokens, composicion de dataset ni fases de RLHF o DPO. El "contenido" de este repositorio es una cadena de compilacion aplicada al codigo fuente de llama.cpp, un motor de inferencia escrito en C/C++ que implementa kernels propios (backend ggml) para CPU y GPU y que consume modelos cuantizados en formato GGUF. El binario distribuido es `llama-server`, el servidor HTTP de llama.cpp con API compatible con la de OpenAI, compilado aqui sin la interfaz web.

La innovacion tecnica relevante no esta en el motor, sino en la reproducibilidad del build. La receta `recipe/scripts/build_runtime.sh` compila dentro de la imagen fijada `nvidia/cuda:12.8.1-devel-ubuntu22.04`, con paquetes procedentes de un snapshot fijo de Ubuntu y una marca de tiempo fija para cada archivo fuente. El compilador se ejecuta con la aleatorizacion de direcciones desactivada y con un PID fijo; se usa el perfil seccomp por defecto de Docker mas una regla de `personality`. Antes del empaquetado se contrasta la cache de CMake contra la configuracion esperada, y el script `recipe/scripts/check_runtime_reproducible.sh` compila dos veces y exige que el archivo resultante sea identico. En este caso lo fue: dos compilaciones independientes produjeron exactamente los mismos bytes. La politica de nombres garantiza que un archivo publicado nunca se sobrescriba, de modo que una URL fijada y su hash siguen siendo validos de forma conjunta.

## Capacidades

- Servidor de inferencia local: expone `llama-server`, con la API HTTP de llama.cpp y compatibilidad con el esquema de OpenAI, lo que permite sustituir un endpoint remoto por uno local sin reescribir el cliente.
- Ejecucion acelerada por GPU NVIDIA: cubre las arquitecturas CUDA 50 a 120, desde Maxwell hasta Blackwell, en un unico binario.
- Carga de modelos GGUF: admite los tipos de cuantizacion soportados por llama.cpp. En la prueba de cualificacion se empleo Qwen3.5-9B en Q4_K_M.
- Contexto largo: el caso validado funciono con 32.768 tokens de contexto con flash attention activada.
- Control del modo de razonamiento: la prueba se ejecuto con "thinking" desactivado, lo que indica que el servidor expone ese conmutador para modelos que lo soportan.
- Extraccion estructurada de informacion: el caso de cualificacion consistio en procesar facturas y extraer lineas de detalle con coincidencia exacta.
- Verificacion de integridad: `BUILD-INFO.txt` permite auditar commit, imagen, compilador, snapshot de paquetes y hashes de todos los archivos de la receta.
- No incluye interfaz web: el build se compila explicitamente con la web UI desactivada.
- Capacidades multimodales, tool calling, agentes o audio: no disponible (dependen del modelo cargado, no del motor).

## Casos de uso

- Despliegue de inferencia en servidores Linux con GPU NVIDIA: el archivo se descarga, se verifica su SHA-256 y se despliega `llama-server` con un commit fijado, lo que elimina la ambiguedad sobre que version del motor esta en ejecucion.
- Sustitucion de una API propietaria por una local: al mantener la compatibilidad con el esquema de OpenAI, un servicio existente puede apuntar a este servidor y ejecutar modelos GGUF en hardware propio sin tocar el codigo del cliente.
- Procesamiento documental por lotes: el escenario validado por el autor, 33 facturas con extraccion de lineas de detalle, se reproduce con un tiempo medio de 13,1 a 13,4 segundos por documento y un pico de 6.393 MiB de memoria grafica, lo que permite dimensionar un pipeline de digitalizacion contable.
- Pipelines con requisitos de reproducibilidad: si dos compilaciones del motor producen bytes identicos y las respuestas coinciden entre ejecuciones, el binario es apto para entornos donde hay que justificar que un cambio de resultados proviene del modelo y no del motor.
- Entornos con hardware heterogeneo: al cubrir arquitecturas desde la 50 hasta la 120, un mismo artefacto sirve para un parque mixto de tarjetas sin recompilar por generacion.
- Auditoria y cumplimiento de cadena de suministro: `BUILD-INFO.txt` y los hashes de la receta permiten reconstruir y verificar el origen del binario en un proceso de revision de dependencias.
- Investigacion en laboratorio o con datos sensibles: la ejecucion es local, sin llamadas a servicios externos, lo que facilita trabajar con documentos que no pueden salir de la red interna.
- Validacion de modelos GGUF antes de produccion: un servidor local de este tipo sirve como banco de pruebas para medir latencia, consumo de VRAM y calidad de extraccion de un modelo candidato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos en la informacion disponible. Lo que si se publica es una prueba de cualificacion del propio binario, ejecutada en una NVIDIA RTX 3090 con Qwen3.5-9B Q4_K_M (SHA-256 `cd76ec20...2a13`), contexto de 32.768 tokens, flash attention activada y modo thinking desactivado, sobre un conjunto de 33 facturas etiquetadas y repetido dos veces:

| Metrica | Valor observado |
|---|---|
| Documentos completados | 33 de 33 en cada ejecucion |
| Tiempo medio por documento | 13,1 s y 13,4 s |
| Documento mas lento | 41,1 s |
| Lineas de factura exactas | 271 de 273 en cada ejecucion |
| Coincidencia entre las dos ejecuciones | 33 de 33 respuestas identicas |
| Coincidencia con el build anterior | 33 de 33 respuestas identicas |
| Memoria grafica maxima del servidor | 6.393 MiB |

No se proporcionan cifras de throughput en tokens por segundo, TTFT ni comparaciones de rendimiento frente a otros motores.

## Requisitos de hardware

- El binario en si no consume VRAM: el consumo depende del modelo GGUF cargado, su cuantizacion y la longitud de contexto configurada.
- Referencia medida con Qwen3.5-9B Q4_K_M y 32.768 tokens de contexto: 6.393 MiB de memoria grafica en pico para el servidor, sobre una RTX 3090.
- GPU compatibles: cualquier GPU NVIDIA cuya arquitectura este entre las compiladas (50, 52, 60, 61, 70, 75, 80, 86, 89, 90, 100, 120). La RTX 3090 (arquitectura 86) esta verificada.
- Cabe en GPU de consumo: si, segun la evidencia disponible, con un modelo de aproximadamente 9.000 millones de parametros en Q4_K_M y 32.768 tokens de contexto cabe en una RTX 3090 con 6.393 MiB en pico.
- Dependencias obligatorias: `cuda_cudart` 12.8.90 y `cuBLAS` 12.8.4.1, descargados de `developer.download.nvidia.com/compute/cuda/redist/` y colocados junto al binario. Hay que copiar `libcudart.so*`, `libcublas.so*` y `libcublasLt.so*` desde sus carpetas `lib/`.
- Controlador de GPU: lo aporta el sistema operativo; la version concreta requerida no se especifica en la informacion disponible.
- Opciones de despliegue: el artefacto es especificamente `llama-server`. Alternativas como vLLM, Ollama o TGI no estan cubiertas por este paquete.
- Latencia observada: media de 13,1 s y 13,4 s por documento de factura, con maximo de 41,1 s, en la configuracion indicada. El throughput en tokens por segundo no esta disponible.

## Comparativa con modelos similares

La comparacion pertinente es entre distribuciones del mismo motor de inferencia, no entre modelos.

| Distribucion | Plataforma | Version CUDA | Commit fijado por nombre | Hash publicado | Reproducibilidad binaria verificada |
|---|---|---|---|---|---|
| Canfield/llama.cpp-c1d0e7a-cuda12.8.1-linux-x64 | Linux x86-64 | 12.8.1 | Si (`c1d0e7a`, release `b10621`) | Si | Si, dos builds con bytes identicos |
| Archivos oficiales de ggml-org/llama.cpp | Multiples | no disponible | no disponible | no disponible | no disponible |
| Paquetes de Ollama | Multiples | no disponible | no disponible | no disponible | no disponible |

Los datos de las dos alternativas no estan disponibles en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa de rendimiento, cobertura de arquitecturas CUDA o tamano de paquete.

## Limitaciones y advertencias

- No es un modelo: no genera texto por si mismo. Sin un archivo GGUF cargado, el servidor no tiene capacidades de inferencia.
- Dependencia externa no empaquetada: el runtime de CUDA y cuBLAS deben descargarse por separado de NVIDIA y colocarse manualmente junto al binario. El paquete por si solo no funciona.
- Compatibilidad de controlador: al no indicarse la version minima de controlador NVIDIA, existe riesgo de fallo en sistemas con controladores antiguos.
- Sin interfaz web: se compila con la web UI desactivada, de modo que la interaccion debe hacerse por API o con un cliente externo.
- Plataforma unica: solo Linux x86-64. No hay builds para Windows, macOS ni ARM.
- Procedencia: el artefacto lo publica un usuario individual, no el proyecto upstream. Aunque la receta y los hashes son auditables, en un entorno de produccion conviene verificar el SHA-256 y decidir si se acepta una cadena de suministro de terceros.
- Caducidad funcional: al estar fijado a la release `b10621` del commit `c1d0e7a`, no recibe correcciones ni mejoras posteriores de llama.cpp; actualizar implica cambiar de artefacto y de hash.
- Metricas de rendimiento incompletas: no hay datos de throughput, TTFT ni consumo con otros modelos o cuantizaciones distintos del caso validado.
- Cero adopcion visible: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de uso en produccion por parte de terceros.
- Licencia MIT: permisiva y compatible con uso comercial. La licencia del modelo GGUF que se cargue es independiente y debe revisarse aparte.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Canfield/llama.cpp-c1d0e7a-cuda12.8.1-linux-x64
- Codigo fuente de llama.cpp: https://github.com/ggml-org/llama.cpp
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Documentacion de llama.cpp en HuggingFace Inference Endpoints: https://huggingface.co/docs/inference-endpoints/engines/llama_cpp
- Sitio oficial de llama.app: https://llama.app/
- Repositorio de modelos Llama de Meta: https://github.com/meta-llama/llama-models/blob/main/README.md
- Guia practica de despliegue con Ollama: https://dev.to/primghostdev/run-your-own-ai-model-locally-a-practical-ollama-setup-guide-2026-2kk9
- Binarios redistribuibles de CUDA (origen de las dependencias): https://developer.download.nvidia.com/compute/cuda/redist/
