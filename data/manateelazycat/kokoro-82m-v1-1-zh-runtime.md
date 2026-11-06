# manateelazycat/Kokoro-82M-v1.1-zh-Runtime

## Resumen

Kokoro-82M-v1.1-zh-Runtime es un repositorio de artefactos de despliegue publicado por el usuario manateelazycat, no un modelo de pesos en sentido estricto. Contiene archivos Docker verificados (runtime 0.1.2 para AGX Orin y runtime 0.1.3 para AGX Thor) destinados a ejecutar el modelo de sintesis de voz Kokoro 82M v1.1-zh sobre dispositivos NVIDIA Jetson dentro de la plataforma AI Pod LPK 0.1.9. El modelo subyacente es Kokoro, un TTS de 82 millones de parametros desarrollado por hexgrad, en su variante china v1.1-zh.

El repositorio resuelve un problema de empaquetado y reproducibilidad: distribuye imagenes ARM64 especificas por dispositivo que incluyen Python, PyTorch, bibliotecas CUDA, espeak-ng y las dependencias de inferencia de Kokoro, de modo que el usuario no tenga que reconstruir el entorno en cada Jetson. Los pesos del modelo y los 157 packs de voces no se incluyen y deben descargarse por separado desde los repositorios de hexgrad/AI-ModelScope.

Es relevante para quienes despliegan TTS en hardware edge NVIDIA (Orin, Thor) y necesitan un entorno CUDA preconfigurado y verificado por checksum. El repo ocupa 6,6 GB, no tiene descargas ni likes registrados, y su licencia figura como "other", heredando las condiciones de los componentes incluidos (Kokoro, PyTorch, CUDA, espeak-ng).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene runtimes de inferencia; el modelo subyacente es Kokoro, TTS de 82M) |
| Parametros totales | 82M (modelo Kokoro subyacente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (variante v1.1-zh del modelo subyacente); el resto no disponible |
| Licencia | other (cada componente conserva su propia licencia, incluidos avisos de runtime de NVIDIA) |
| Formato de pesos | no incluidos en el repo; se descargan por separado desde hexgrad/AI-ModelScope. El repo contiene archivos Docker (archivos tar para `docker load`) |

## Arquitectura y entrenamiento

Este repositorio no documenta la arquitectura ni el entrenamiento del modelo Kokoro; unicamente empaqueta el entorno de ejecucion. El modelo subyacente, Kokoro 82M v1.1-zh, es un sistema de sintesis de voz (text-to-speech) de 82 millones de parametros desarrollado por hexgrad; los detalles de su arquitectura, dataset y proceso de entrenamiento no estan disponibles en la informacion proporcionada.

La innovacion tecnica del repositorio es de ingenieria de despliegue: archives Docker especificos por dispositivo ARM64 (AGX Orin y AGX Thor) que no son intercambiables entre si, con verificacion de tamano y SHA256 mediante `checksums.json` antes de `docker load`, y verificacion posterior de la identidad de la imagen. El entorno incluye Python, PyTorch, bibliotecas CUDA y espeak-ng, ademas de las dependencias de inferencia de Kokoro.

## Capacidades

- Sintesis de voz (text-to-speech) en chino mediante el modelo Kokoro 82M v1.1-zh.
- Soporte de 157 packs de voces, descargados por separado desde los repositorios de hexgrad/AI-ModelScope.
- Ejecucion en dispositivos NVIDIA Jetson AGX Orin (runtime 0.1.2) y AGX Thor (runtime 0.1.3).
- Integracion con la plataforma AI Pod LPK 0.1.9.
- Verificacion de integridad de artefactos mediante `checksums.json` (tamano y SHA256).
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio de entrada ni modo de razonamiento.

## Casos de uso

- Despliegue de TTS en flotas de Jetson AGX Orin: el runtime 0.1.2 permite cargar la imagen Docker verificada y ejecutar Kokoro v1.1-zh sin reconstruir el entorno CUDA, lo que reduce el tiempo de puesta en marcha en cada dispositivo.
- Despliegue de TTS en Jetson AGX Thor: el runtime 0.1.3 cubre la generacion de hardware mas reciente; al ser archives no intercambiables, evita errores de compatibilidad binaria entre plataformas.
- Asistentes de voz en chino en dispositivos edge: el modelo subyacente sintetiza voz en chino y puede integrarse en interfaces conversacionales locales sin depender de servicios en la nube.
- Lectura de contenido en aplicaciones embebidas: narracion de texto en chino en kioscos, paneles o dispositivos industriales con Jetson.
- Validacion de cadena de suministro de artefactos: el flujo de verificacion con `checksums.json` y comprobacion de identidad de imagen sirve como control de integridad en pipelines de despliegue OTA.
- Reproducibilidad de entornos de inferencia: al incluir Python, PyTorch y CUDA fijados en la imagen, se garantiza que distintos dispositivos ejecuten exactamente la misma pila de software.
- Personalizacion de voces: la descarga separada de los 157 packs de voces permite seleccionar solo las voces necesarias y ajustar el consumo de almacenamiento en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: NVIDIA Jetson AGX Orin (runtime 0.1.2) y NVIDIA Jetson AGX Thor (runtime 0.1.3). Los archives son ARM64 y especificos por dispositivo; no son intercambiables.
- VRAM estimada: no disponible. El modelo subyacente tiene 82M de parametros, pero la informacion proporcionada no incluye requisitos de memoria.
- GPU de escritorio (A100, H100, RTX 4090): no soportadas por estos archives, que son especificos para Jetson ARM64.
- Almacenamiento: el repositorio ocupa 6,6 GB; los pesos del modelo y los 157 packs de voces se descargan aparte y anaden espacio adicional no cuantificado en la informacion disponible.
- Despliegue: carga mediante `docker load` previa verificacion de tamano y SHA256 en `checksums.json`, seguida de verificacion de la identidad de la imagen. Plataforma AI Pod LPK 0.1.9.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kokoro-82M-v1.1-zh-Runtime (este repo) | 82M (modelo subyacente) | no disponible | other | Hugging Face, 0 descargas | Runtimes Docker para Jetson Orin/Thor; pesos aparte |
| Kokoro 82M (hexgrad) | 82M | no disponible | no disponible en esta informacion | Repositorios hexgrad/AI-ModelScope | Modelo base; pesos y voces se descargan desde aqui |
| Alternativas TTS de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- El repositorio no contiene pesos del modelo ni voces; sin la descarga separada desde hexgrad/AI-ModelScope el runtime no es funcional.
- Los archives son especificos por dispositivo y no intercambiables entre AGX Orin y AGX Thor; usar el archive equivocado provoca fallo de despliegue.
- La licencia "other" implica que cada componente conserva su propia licencia, incluidos los avisos de runtime de NVIDIA; es necesario revisar las condiciones de Kokoro, PyTorch, CUDA y espeak-ng antes de uso comercial.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de validacion por parte de la comunidad.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma del modelo subyacente en la informacion disponible; la variante es especifica para chino.
- El proceso exige verificar tamano y SHA256 en `checksums.json` antes de `docker load`; omitir esta verificacion elimina la garantia de integridad del artefacto.
- No hay datos de latencia, throughput ni consumo de memoria en la informacion proporcionada, lo que impide estimar el rendimiento en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/manateelazycat/Kokoro-82M-v1.1-zh-Runtime
- Repositorios de pesos y voces: hexgrad/AI-ModelScope Kokoro (referenciados en la model card; sin URL directa en la informacion disponible)
