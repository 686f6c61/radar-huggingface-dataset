# manateelazycat/ReaderLM-v2-Jetson-Runtime

## Resumen

ReaderLM-v2-Jetson-Runtime es un repositorio de artefactos de despliegue, no un modelo de pesos. Lo publica el desarrollador independiente manateelazycat y contiene imagenes Docker/OCI fijadas (pinned) para arquitectura arm64, destinadas a ejecutar la aplicacion LZC AI Pod ReaderLM v2 0.1.1 sobre plataformas NVIDIA Jetson Orin y Jetson Thor. El repositorio no incluye los pesos de ReaderLM-v2: estos deben descargarse por separado desde los repositorios manateelazycat/ReaderLM-v2-GGUF o manateelazycat/ReaderLM-v2-NVFP4.

El artefacto resuelve un problema de reproducibilidad en el despliegue en el borde (edge): fija versiones exactas de JetPack, CUDA, arquitecturas SM y frameworks de inferencia (llama.cpp nativo para Orin, vLLM con un commit concreto para Thor), de modo que el entorno de ejecucion sea identico al medido. Para Orin se especifica JetPack 6.2 / R36.4.3 / CUDA 12.6 / SM87; para Thor, JetPack 7.2 / R39.2 / CUDA 13.2 / SM110 con vLLM en el commit 635dd6aae656.

La relevancia es acotada pero practica: quien quiera servir ReaderLM-v2 en hardware Jetson dispone de imagenes verificadas por SHA-256 y un manifiesto runtimes.json que eliminan la variabilidad de compilacion. Conviene subrayar que la licencia del repositorio es "other" y que los pesos de ReaderLM-v2 se distribuyen aparte bajo CC-BY-NC-4.0, mientras que los componentes de NVIDIA, CUDA, Python y los frameworks de inferencia conservan sus propias licencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio no contiene pesos de modelo; es un runtime de despliegue) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | 32K maximo en la configuracion de Thor (BF16 KV, max 4 secuencias, 1.5 GiB de KV compartida) |
| Tipos de cuantizacion | GGUF (via repositorio ReaderLM-v2-GGUF) y NVFP4 (via ReaderLM-v2-NVFP4) |
| Idiomas soportados | No disponible |
| Licencia | other (repositorio de artefactos); pesos ReaderLM-v2 bajo CC-BY-NC-4.0; componentes de terceros con sus propias licencias |
| Formato de pesos | Imagenes Docker/OCI arm64; pesos separados en GGUF y NVFP4 |
| Plataforma objetivo | Jetson Orin (SM87) y Jetson Thor (SM110) |
| Version de JetPack | Orin: 6.2 / R36.4.3 / CUDA 12.6; Thor: 7.2 / R39.2 / CUDA 13.2 |
| Framework de inferencia | Orin: llama.cpp nativo fijado; Thor: vLLM (commit 635dd6aae656) |
| Tamano del repositorio | 20.2 GB |
| Verificacion de integridad | SHA256SUMS y runtimes.json con identidades, tamanos y SHA-256 |

## Arquitectura y entrenamiento

Este repositorio no documenta la arquitectura ni el entrenamiento del modelo ReaderLM-v2, porque no contiene sus pesos. Lo que describe es la capa de ejecucion: para Orin, un runtime nativo de llama.cpp fijado a una revision concreta sobre JetPack 6.2 y CUDA 12.6; para Thor, una compilacion de vLLM desde el commit 635dd6aae656 sobre JetPack 7.2 y CUDA 13.2. La ruta NVFP4 en Thor exige los flags `--quantization modelopt_fp4 --linear-backend cutlass`, con KV en BF16, contexto maximo de 32K, un maximo de 4 secuencias y 1.5 GiB de KV compartida.

En cuanto a innovaciones de empaquetado, el release de Thor elimina variables de entorno heredadas de publicacion de builds, el historial de comandos y las atestaciones de build, manteniendo sin cambios los digests de la capa de inferencia respecto a la imagen medida. El fichero comprimido `compressed_tensors/hadamards.safetensors` se identifica explicitamente como una constante de transformacion publica del framework, no como pesos de ReaderLM. La aplicacion fija revisiones inmutables tanto en ModelScope como en Hugging Face y verifica cada descarga.

## Capacidades

- Despliegue reproducible de ReaderLM-v2 en Jetson Orin y Jetson Thor mediante imagenes Docker/OCI arm64 fijadas.
- Ejecucion con llama.cpp nativo en Orin (SM87) y con vLLM en Thor (SM110).
- Soporte de cuantizacion NVFP4 en Thor con backend cutlass y KV en BF16.
- Contexto de hasta 32K tokens y hasta 4 secuencias concurrentes en la configuracion de Thor.
- Verificacion criptografica de artefactos mediante SHA256SUMS y runtimes.json.
- Fijado de revisiones inmutables en ModelScope y Hugging Face con verificacion de cada descarga.
- Gestion de cache de imagenes: solo se omite la transferencia tras verificacion exacta de identidad.
- No disponible: capacidades propias del modelo (generacion, razonamiento, tool calling, vision, audio), al no incluirse pesos ni model card del modelo base.

## Casos de uso

- Despliegue en flotas de Jetson Orin: usar la imagen fijada con llama.cpp para garantizar que todos los dispositivos ejecutan exactamente la misma pila (JetPack 6.2, CUDA 12.6, SM87), eliminando divergencias de compilacion entre unidades.
- Inferencia de baja latencia en Jetson Thor con NVFP4: activar `--quantization modelopt_fp4 --linear-backend cutlass` para aprovechar la cuantizacion de 4 bits en SM110 con KV en BF16 y contexto de 32K.
- Pipelines de CI/CD de artefactos edge: integrar la verificacion de SHA256SUMS y runtimes.json como paso obligatorio antes de promover una imagen a produccion.
- Auditoria y cumplimiento de licencias: usar LICENSES.md y los avisos internos del archivo para separar la licencia CC-BY-NC-4.0 de los pesos de las licencias de componentes NVIDIA, CUDA, Python y frameworks.
- Reproducibilidad de experimentos: fijar el commit de vLLM (635dd6aae656) y la version de JetPack para que los resultados de evaluacion sean replicables entre laboratorios.
- Gestion de almacenamiento en nodos edge: planificar espacio temporal adicional para la importacion de archivos grandes, sabiendo que la cache solo evita la transferencia tras verificacion exacta de identidad.
- Servicio multiusuario limitado en Thor: configurar hasta 4 secuencias concurrentes con 1.5 GiB de KV compartida para cargas de trabajo ligeras en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware obligatorio: NVIDIA Jetson Orin (SM87) o NVIDIA Jetson Thor (SM110). No es ejecutable en GPU de escritorio x86 ni en Apple Silicon.
- Software obligatorio en Orin: JetPack 6.2 / R36.4.3 / CUDA 12.6.
- Software obligatorio en Thor: JetPack 7.2 / R39.2 / CUDA 13.2.
- VRAM: no disponible. La unica cifra publicada es 1.5 GiB de KV compartida en Thor, con KV en BF16 y maximo de 4 secuencias.
- Almacenamiento: el repositorio ocupa 20.2 GB; la importacion de archivos grandes requiere espacio temporal adicional.
- Aceleracion: NVFP4 en Thor requiere `--quantization modelopt_fp4 --linear-backend cutlass`.
- Opciones de despliegue: llama.cpp nativo (Orin) y vLLM (Thor), ambos dentro de imagenes Docker/OCI arm64.
- Latencia y throughput: no disponible.
- No cabe en GPU de consumo convencional (RTX 4090, etc.): el artefacto esta compilado exclusivamente para arquitecturas Jetson.

## Comparativa con modelos similares

| Criterio | ReaderLM-v2-Jetson-Runtime | Repositorios de pesos ReaderLM-v2 (GGUF / NVFP4) | Runtime generico de llama.cpp o vLLM |
|---|---|---|---|
| Contenido | Imagenes Docker/OCI arm64 fijadas | Pesos del modelo | Codigo de framework sin fijar |
| Plataforma | Jetson Orin y Thor | Multiples (segun formato) | Multiples |
| Version fijada | Si (JetPack, CUDA, commit de vLLM) | No aplica | No, salvo que se fije manualmente |
| Verificacion de integridad | SHA256SUMS y runtimes.json | No disponible | No disponible |
| Licencia | other (componentes de terceros) | CC-BY-NC-4.0 | Licencias respectivas del framework |

No se dispone de datos de rendimiento para comparar con alternativas equivalentes de despliegue en Jetson.

## Limitaciones y advertencias

- El repositorio no contiene pesos de ReaderLM-v2; sin descargar los repositorios GGUF o NVFP4 no hay modelo que ejecutar.
- La licencia "other" del repositorio no cubre uniformemente todos los componentes: NVIDIA, CUDA, Python y los frameworks de inferencia conservan sus propias licencias y pueden exigir acuerdos especificos de NVIDIA.
- Los pesos de ReaderLM-v2 estan bajo CC-BY-NC-4.0, lo que restringe el uso comercial de los pesos.
- Dependencia estricta de hardware NVIDIA Jetson compatible; no hay soporte para x86 ni para GPU de consumo.
- La configuracion de Thor limita a 32K de contexto, 4 secuencias concurrentes y 1.5 GiB de KV compartida; no es adecuada para cargas de alta concurrencia.
- La importacion de archivos grandes requiere espacio temporal adicional y la cache solo se reutiliza tras verificacion exacta de identidad.
- No se documentan sesgos, tasas de alucinacion ni limitaciones linguisticas del modelo base en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.
- No se han publicado benchmarks ni metricas de latencia o throughput.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/manateelazycat/ReaderLM-v2-Jetson-Runtime
- Pesos GGUF: https://huggingface.co/manateelazycat/ReaderLM-v2-GGUF
- Pesos NVFP4: https://huggingface.co/manateelazycat/ReaderLM-v2-NVFP4
- No disponible: paper, blog, repositorio de codigo o demo adicionales en la informacion proporcionada.
