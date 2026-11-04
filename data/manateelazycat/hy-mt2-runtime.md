# manateelazycat/Hy-MT2-Runtime

## Resumen

Hy-MT2-Runtime es un repositorio de artefactos de despliegue, no un modelo de lenguaje en sentido estricto. Lo publica el usuario manateelazycat y contiene archivos Docker sin pesos ("model-weight-free Docker load archives") verificados para ejecutar Hy-MT2, el sistema de traducción automática de Tencent, sobre plataformas NVIDIA Jetson AGX Orin y AGX Thor. El repositorio está pensado para el instalador Hy-MT2 AI Pod v0.1.16 y su función es empaquetar el entorno de ejecución (runtime) con las bibliotecas CUDA tomadas del propio host Jetson, mientras los pesos del modelo se descargan por separado desde los repositorios upstream de Tencent.

El interés del artefacto es práctico: simplifica el despliegue de un modelo de traducción en hardware embebido de NVIDIA, evitando al usuario la compilación manual de dependencias CUDA y garantizando reproducibilidad mediante hashes SHA-256 documentados en el archivo `runtimes.json`. Se ofrecen variantes en BF16 para AGX Orin, y en BF16 y FP8 para AGX Thor, lo que permite elegir entre precisión completa y menor huella de memoria según la plataforma.

No se trata, por tanto, de un modelo con pesos publicados ni de una ficha de arquitectura de red neuronal: la información disponible se limita al empaquetado del runtime. Cualquier dato sobre parámetros, contexto o entrenamiento del modelo Hy-MT2 subyacente no está presente en este repositorio y debe consultarse en la fuente original de Tencent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene solo el runtime de despliegue) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (AGX Orin y AGX Thor) y FP8 (AGX Thor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica: archivos Docker load sin pesos; los pesos se descargan aparte desde repositorios de Tencent |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura del modelo Hy-MT2 en este repositorio, ya que no contiene pesos ni documentación de entrenamiento. El artefacto publicado es un conjunto de imágenes Docker cargables que constituyen el entorno de ejecución: bibliotecas CUDA montadas desde el host Jetson, dependencias del runtime y la configuración necesaria para lanzar el modelo de traducción. Las variantes disponibles son BF16 para AGX Orin, y BF16 y FP8 para AGX Thor.

La innovación técnica del repositorio es de ingeniería de despliegue: separar los pesos del runtime para reducir el tamaño del artefacto (8,7 GB en total del repositorio) y aprovechar las bibliotecas CUDA del sistema anfitrión, además de publicar hashes SHA-256 e identidades de imagen en `runtimes.json` para verificar la integridad de cada archivo. No se documentan detalles de dataset, tokens de entrenamiento ni técnicas de alineación como RLHF o DPO.

## Capacidades

- Despliegue del sistema de traducción automática Hy-MT2 de Tencent en plataformas NVIDIA Jetson AGX Orin y AGX Thor.
- Ejecución en precisión BF16 en ambas plataformas y en FP8 en AGX Thor.
- Integración con el instalador Hy-MT2 AI Pod v0.1.16.
- Verificación de integridad de los archivos mediante SHA-256 e identidades de imagen recogidas en `runtimes.json`.
- Uso de bibliotecas CUDA montadas desde el host Jetson, sin incluirlas en el archivo.
- Descarga separada de los pesos del modelo desde los repositorios upstream de Tencent.
- No se documentan en este repositorio capacidades de tool calling, agentes, visión, audio ni modos de razonamiento del modelo subyacente.

## Casos de uso

- Traducción automática en dispositivos embebidos: desplegar Hy-MT2 sobre una Jetson AGX Orin o AGX Thor en entornos con restricciones de conectividad o privacidad, usando el runtime BF16 o FP8 según la memoria disponible.
- Instalación reproducible con el AI Pod: utilizar el instalador v0.1.16 para cargar las imágenes Docker verificadas y arrancar el servicio de traducción sin compilar dependencias CUDA manualmente.
- Validación de integridad en producción: comprobar los hashes SHA-256 de `runtimes.json` antes de cargar los archivos en un despliegue crítico, asegurando que el runtime no ha sido alterado.
- Optimización de memoria en AGX Thor: emplear la variante FP8 para reducir la huella del runtime cuando el presupuesto de memoria del sistema es ajustado, manteniendo BF16 en Orin si no se requiere esa reducción.
- Actualización controlada de entornos: sustituir el runtime anterior por una nueva versión del archivo Docker sin tocar los pesos, que se gestionan por separado desde los repositorios de Tencent.
- Reparto de artefactos en equipos offline: distribuir el archivo de carga Docker a máquinas Jetson sin acceso a internet y descargar los pesos en un paso posterior desde un espejo interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataformas objetivo: NVIDIA Jetson AGX Orin (variante BF16) y NVIDIA Jetson AGX Thor (variantes BF16 y FP8).
- VRAM estimada para inferencia: no disponible; el repositorio no incluye los pesos, por lo que no se puede calcular la huella del modelo.
- GPU de escritorio recomendadas: no aplica; el runtime está empaquetado específicamente para Jetson.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga de archivos Docker (`docker load`) sobre el host Jetson, con bibliotecas CUDA montadas desde el sistema anfitrión; integración con el instalador Hy-MT2 AI Pod v0.1.16.
- Latencia y throughput: no disponibles.
- Tamaño del repositorio: 8,7 GB (archivos Docker sin pesos).

## Comparativa con modelos similares

| Artefacto | Plataforma | Precisión | Incluye pesos | Licencia | Verificación de integridad |
|---|---|---|---|---|---|
| Hy-MT2-Runtime (este repo) | Jetson AGX Orin y AGX Thor | BF16 y FP8 | No | Apache 2.0 | SHA-256 en `runtimes.json` |
| Pesos upstream de Hy-MT2 (Tencent) | Genérica | no disponible | Sí | no disponible | no disponible |
| Runtimes Jetson alternativos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros artefactos de runtime comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos del modelo; sin la descarga desde los repositorios de Tencent el runtime no es funcional.
- El despliegue está limitado a NVIDIA Jetson AGX Orin y AGX Thor; no se documenta compatibilidad con otras GPU o plataformas.
- Las bibliotecas CUDA se toman del host Jetson, por lo que la versión del sistema anfitrión debe ser compatible con el runtime; no se especifican las versiones requeridas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no cuenta con validación de la comunidad ni de terceros independientes.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas del modelo Hy-MT2 subyacente en esta fuente.
- La licencia Apache 2.0 se aplica al artefacto de runtime; las condiciones de uso de los pesos de Hy-MT2 dependen de la licencia de los repositorios upstream de Tencent, que no se detalla aquí.
- No se documentan requisitos de memoria, latencia ni throughput, lo que dificulta el dimensionamiento previo en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/manateelazycat/Hy-MT2-Runtime
- Archivo de metadatos del runtime (`runtimes.json`): referenciado en el repositorio, sin URL directa disponible
- Repositorios upstream de pesos de Hy-MT2 (Tencent): no disponibles en la información proporcionada
- Instalador Hy-MT2 AI Pod v0.1.16: no disponible en la información proporcionada
