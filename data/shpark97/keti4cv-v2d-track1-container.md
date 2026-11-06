# SHPark97/keti4cv-v2d-track1-container

## Resumen

`SHPark97/keti4cv-v2d-track1-container` no es un modelo de lenguaje, sino una imagen Docker de verificacion publicada por el equipo keti4cv para el Track 1 del desafio V2D (video-to-dataset). El repositorio empaqueta los diez "Final Submissions" seleccionados, el codigo en el commit exacto que los genero (checkouts limpios de https://github.com/shpark97/V2DChallenge), los entornos de ejecucion y las entradas necesarias para reconstruir los ficheros post-procesados. Su proposito es permitir que terceros reproduzcan y auditen la submission sin depender de infraestructura privada del equipo.

El artefacto principal es un `docker save` de la imagen `keti4cv-v2d-submission:final`, comprimido con zstd y dividido en nueve partes de 2000 MiB (18,1 GB en total), acompanado de sumas de comprobacion SHA-256 por parte y del tarball unido, mas el digest de la imagen. Los pesos de los modelos utilizados (56 GB) no estan incluidos: el script `run.sh fetch-weights` los descarga desde repositorios oficiales de Hugging Face en revisiones fijadas y verifica cada SHA-256.

La relevancia es acotada pero clara para quien participe en el desafio o quiera auditar el pipeline: el contenedor permite ejecutar el verificador `kit` sobre cada manifiesto en CPU, sin red y sin pesos, y reconstruir un final post-procesado a partir de las entradas almacenadas para compararlo con el fichero enviado. No se trata de un modelo entrenado por el autor, sino de un contenedor de reproducibilidad que orquesta modelos de terceros (Sapiens2, SAM, Hunyuan, MANO, FreeFlow, entre otros).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (contenedor Docker de inferencia; agrega varios modelos de terceros) |
| Parametros totales | no disponible (los pesos referenciados suman 56 GB, no incluidos en la imagen) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (los componentes de terceros conservan sus propias licencias) |
| Formato de pesos | no disponible (la imagen se distribuye como `docker save` en tar.zst; los pesos se descargan aparte desde repos oficiales) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un contenedor de verificacion. La imagen `keti4cv-v2d-submission:final` contiene los diez Final Submissions del Track 1, el codigo en el commit correspondiente a cada uno (checkouts limpios del repositorio GitHub del equipo), los entornos de ejecucion y las entradas y pasos necesarios para regenerar los ficheros post-procesados. El detalle operativo esta documentado en `/submission/README.md` dentro de la propia imagen.

El pipeline delega en modelos de terceros que no se empaquetan en la imagen: el comando `run.sh fetch-weights` los descarga desde repositorios oficiales de Hugging Face en revisiones fijadas y comprueba cada SHA-256. Entre los repositorios citados hay varios con acceso restringido (`facebook/sam3`, `sam-3d-body-vith`, `sam-3d-body-dinov3`, `sam-3d-objects`), que requieren solicitar acceso y proporcionar `HF_TOKEN`. El comando `run.sh reproduce` necesita esos pesos; el comando `run.sh verify` funciona en CPU, sin red y sin pesos.

## Capacidades

- Verificacion de manifiestos: ejecuta el verificador `kit` sobre cada manifiesto de la submission en CPU, sin red y sin pesos (`run.sh verify`).
- Reconstruccion reproducible: regenera un final post-procesado a partir de las entradas almacenadas y lo compara con el fichero enviado (`run.sh derive --label ... --dataset-root ... --output ...`).
- Reproduccion completa del pipeline: `run.sh reproduce` ejecuta el pipeline con GPU una vez descargados los pesos.
- Descarga verificada de pesos: `run.sh fetch-weights` obtiene los modelos de terceros en revisiones fijadas y valida cada SHA-256.
- Integridad criptografica: sumas SHA-256 por parte (`parts.sha256`), del tarball unido y digest de la imagen (`image_digest.txt`).
- Aislamiento de red: los comandos `verify` y `derive` se ejecutan con `--network none`.
- Procesamiento de video y datos del Track 1: el dataset se monta en `/data` con la estructura `track_1/{videos,data,meta}`.
- No disponible: generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, capacidades multilingues o modos de pensamiento. No aplica a este artefacto.

## Casos de uso

- Auditoria de la submission del Track 1: un revisor descarga las nueve partes, valida `parts.sha256`, une el tarball, comprueba el SHA-256 del conjunto y carga la imagen con `docker load` para inspeccionar los diez Final Submissions y el codigo asociado.
- Verificacion de manifiestos sin GPU: con `docker run --rm --network none keti4cv-v2d-submission:final /submission/run.sh verify` se valida cada manifiesto en CPU, sin red y sin pesos, lo que permite comprobaciones rapidas en cualquier maquina.
- Reconstruccion de un final concreto: `run.sh derive --label ab25_w015 --output /output --dataset-root /data` regenera el fichero post-procesado a partir de las entradas almacenadas y permite compararlo byte a byte con el enviado.
- Reproduccion end-to-end en GPU: tras `run.sh fetch-weights` y con `HF_TOKEN` para los repos con acceso restringido, `run.sh reproduce --label v15-cdo` ejecuta el pipeline completo con `--gpus all` y el dataset montado en modo lectura.
- Archivado a largo plazo del estado exacto de la submission: los checkouts limpios por commit y los entornos empaquetados permiten reconstruir el entorno original aunque el repositorio GitHub evolucione.
- Formacion y transferencia: el contenedor sirve como referencia practica de como estructurar una submission reproducible en un desafio de vision por computador con modelos de terceros y pesos externos.
- Integracion en CI de verificacion: los comandos `verify` y `derive` son deterministas y sin red, lo que facilita incorporarlos como pasos de comprobacion automatizada en un pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 18,1 GB para las nueve partes del `docker save` comprimido, mas el espacio temporal para el tarball unido y la imagen cargada; 56 GB adicionales para los pesos si se ejecuta `run.sh reproduce`.
- VRAM: no disponible. Depende de los modelos de terceros que orquesta el pipeline; la informacion proporcionada no detalla requisitos por componente.
- GPU: `run.sh reproduce` requiere GPU (`--gpus all`). No se especifican modelos concretos de GPU (A100, H100, RTX 4090, etc.) en la informacion disponible.
- CPU: suficiente para `run.sh verify` y `run.sh derive`, que se ejecutan sin red y sin pesos.
- Despliegue: Docker con soporte de `docker load`; `zstd` para descomprimir; `hf download` (CLI de Hugging Face) para la descarga; NVIDIA Container Toolkit para el modo GPU.
- Red: no necesaria para `verify` y `derive` (`--network none`); necesaria para `fetch-weights` y para solicitar acceso a los repos restringidos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada contenedores de verificacion comparables de otros equipos del desafio V2D ni artefactos equivalentes de la misma categoria.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, codigo ni realiza inferencia por si mismo; es un contenedor de verificacion y reproduccion.
- Los pesos (56 GB) no estan incluidos en la imagen; `run.sh reproduce` falla sin ellos.
- Varios repositorios de pesos estan restringidos (`facebook/sam3`, `sam-3d-body-vith`, `sam-3d-body-dinov3`, `sam-3d-objects`); es necesario solicitar acceso y proporcionar `HF_TOKEN`.
- Licencia `other`: los componentes de terceros conservan sus propias licencias (Sapiens2 License, SAM License, Tencent Hunyuan Community License, MANO license, CC BY-NC-SA 4.0 para FreeFlow, entre otras), y la model card indica que se incluyen unicamente para verificacion de la submission del desafio. Esto limita el uso comercial.
- El dataset no se distribuye con la imagen; debe montarse externamente en `/data` con la estructura `track_1/{videos,data,meta}`.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso o validacion por parte de la comunidad.
- No se dispone de informacion sobre sesgos, tasas de alucinacion, cobertura idiomatica ni latencias; no aplica el analisis habitual de riesgos de un modelo de lenguaje.
- Fechas de creacion y actualizacion registradas como 2026-11-05, posteriores a la fecha habitual de consulta; conviene verificar la vigencia del artefacto antes de depender de el.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SHPark97/keti4cv-v2d-track1-container
- Perfil del autor en Hugging Face: https://huggingface.co/SHPark97
- Listado de modelos del autor: https://huggingface.co/SHPark97/models
- Repositorio de codigo del equipo: https://github.com/shpark97/V2DChallenge
- Repositorios de pesos con acceso restringido citados: https://huggingface.co/facebook/sam3, https://huggingface.co/sam-3d-body-vith, https://huggingface.co/sam-3d-body-dinov3, https://huggingface.co/sam-3d-objects
