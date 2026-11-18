# arrow-hf/vllm-ascend-docker-v0.30.0

## Resumen

`arrow-hf/vllm-ascend-docker-v0.30.0` no es un modelo de lenguaje, sino un archivo Docker de la imagen `quay.io/ascend/vllm-ascend:v0.30.0`, publicada en Hugging Face como repositorio de artefacto. Contiene la imagen de vLLM Ascend en versión 0.30.0 para plataforma `linux/arm64`, empaquetada como tar cargable con `docker load` y generada con crane v0.22.1. El repositorio pesa 8,8 GB y no incluye pesos de modelos.

El propósito del artefacto es facilitar el despliegue de vLLM sobre aceleradores Ascend (NPU de Huawei) en servidores ARM64, evitando tener que descargar la imagen desde el registro original. Es relevante para equipos que trabajan con hardware Ascend y necesitan reproducibilidad en la puesta en marcha de inferencia, ya que el archivo preserva la configuración, la etiqueta y todas las capas de la imagen.

No se dispone de información sobre parámetros, contexto, idiomas, licencia ni benchmarks, porque el repositorio aloja una imagen de contenedor y no un modelo. Cualquier dato relativo a modelos concretos dependerá de los pesos que el usuario cargue por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto Docker; imagen de vLLM Ascend v0.30.0) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene un tar de imagen Docker, no pesos) |

## Arquitectura y entrenamiento

No aplica: el repositorio no contiene un modelo entrenado. El artefacto es una imagen de contenedor para `linux/arm64` que empaqueta vLLM Ascend v0.30.0, la integración de vLLM con el backend de aceleradores Ascend. La imagen se generó con crane v0.22.1 y conserva configuración, etiqueta y capas comprimidas.

El archivo incluye únicamente el contenido de la imagen. No incluye drivers del host, directorios montados, estado de contenedor en ejecución ni pesos de modelos descargados por separado. Por tanto, no hay datos de entrenamiento, RLHF, DPO ni innovaciones de arquitectura que describir.

## Capacidades

- Despliegue de inferencia con vLLM sobre NPU Ascend en servidores ARM64.
- Carga offline de la imagen mediante `docker load`, sin depender de `quay.io` en el momento del despliegue.
- Verificación de integridad mediante el fichero `vllm-ascend.tar.sha256` incluido en el repositorio.
- Reproducibilidad de la imagen: se preservan configuración, etiqueta y capas.
- No incluye capacidades de generación, razonamiento, código, visión ni tool calling por sí mismo; estas dependen del modelo que se sirva con vLLM.
- No incluye pesos de modelos: deben descargarse y montarse aparte.

## Casos de uso

- Despliegue en entornos air-gapped: descargar el tar con `hf download`, verificar el sha256 y cargarlo con `docker load` en servidores ARM64 con NPU Ascend sin acceso a registros externos.
- Estandarización de versiones en un clúster: fijar vLLM Ascend v0.30.0 como imagen base reproducible para todos los nodos, evitando deriva entre despliegues.
- Servicio de modelos en infraestructura Ascend: usar la imagen como runtime para servir pesos descargados por separado con el motor vLLM.
- Pipeline de CI/CD: incorporar el tar al almacén de artefactos interno y validar la integridad con `sha256sum -c` antes de cada despliegue.
- Replicación de entornos de investigación: distribuir la misma imagen entre equipos que trabajan con aceleradores Ascend para garantizar resultados comparables.
- Archivado a largo plazo: conservar una copia del tar en Hugging Face como respaldo de la imagen original ante posibles cambios o retiradas en el registro `quay.io`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma obligatoria: `linux/arm64`.
- Acelerador: NPU Ascend (la imagen es la integración vLLM Ascend, orientada a servidores Ascend actuales).
- Almacenamiento: al menos 8,8 GB para el tar, más el espacio adicional de la imagen desplegada y de los pesos de los modelos que se sirvan.
- Drivers del host: no incluidos en el archivo; deben instalarse por separado en el servidor.
- Pesos de modelos: no incluidos; deben descargarse y montarse de forma independiente.
- VRAM/HBM: no disponible.
- GPUs recomendadas: no aplica; el artefacto está orientado a NPU Ascend, no a GPU NVIDIA o AMD.
- Opciones de despliegue: `docker load -i vllm-ascend.tar` seguido de ejecución del contenedor; descarga previa con `hf download arrow-hf/vllm-ascend-docker-v0.30.0 --local-dir .`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Plataforma | Versión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arrow-hf/vllm-ascend-docker-v0.30.0 | Imagen Docker (tar) | linux/arm64, Ascend | vLLM Ascend v0.30.0 | no disponible | Hugging Face (0 descargas) |
| quay.io/ascend/vllm-ascend:v0.30.0 | Imagen Docker (registro) | linux/arm64, Ascend | vLLM Ascend v0.30.0 | no disponible | Registro Quay |
| vLLM upstream (imágenes oficiales) | Imagen Docker | linux/amd64/arm64, GPU NVIDIA/AMD | según release | Apache 2.0 (upstream) | Registro vLLM |

No se dispone de datos para comparar rendimiento, ya que el artefacto no incluye benchmarks ni pesos.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, tokenizador ni configuración de inferencia; no puede usarse para generar texto por sí solo.
- Solo para `linux/arm64`: no funcionará en hosts x86_64 sin emulación, y la emulación no es viable para cargas de inferencia en NPU.
- Requiere hardware Ascend: no es compatible con GPU NVIDIA o AMD.
- No incluye drivers del host, directorios montados ni estado de contenedor; el entorno de ejecución debe prepararse aparte.
- Los pesos de los modelos no están incluidos y deben descargarse y montarse de forma independiente.
- Licencia no declarada en el repositorio: conviene verificar los términos de la imagen original en `quay.io/ascend/vllm-ascend` antes de uso comercial.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni validación externa.
- Fecha de creación y actualización en 2026: verificar que la versión v0.30.0 siga siendo la adecuada para el hardware y los modelos objetivo.
- Verificar siempre la integridad con `sha256sum -c vllm-ascend.tar.sha256` antes de cargar la imagen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/arrow-hf/vllm-ascend-docker-v0.30.0
- Imagen original en Quay: https://quay.io/ascend/vllm-ascend
- Proyecto vLLM Ascend: https://github.com/vllm-project/vllm-ascend
- Proyecto vLLM: https://github.com/vllm-project/vllm
- Herramienta crane: https://github.com/google/go-containerregistry
