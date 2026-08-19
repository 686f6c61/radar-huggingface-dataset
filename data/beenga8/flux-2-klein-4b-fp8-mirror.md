# beenga8/flux-2-klein-4b-fp8-mirror

## Resumen

Este repositorio es un mirror byte-for-byte del modelo `black-forest-labs/FLUX.2-klein-4B` de Black Forest Labs, creado por el usuario `beenga8` con el propósito de garantizar la reproducibilidad de los builds del proyecto Beenga Image. No se trata de un modelo nuevo ni de un fine-tuning: es una copia exacta de los pesos originales en la revisión `e7b7dc27f91deacad38e78976d1f2b499d76a294`, conservada para que las reconstrucciones sean posibles incluso si el repositorio upstream se mueve, se restringe o se retira.

El modelo original, FLUX.2-klein-4B, pertenece a la familia FLUX.2 de Black Forest Labs y está diseñado para generación de imágenes. Este mirror se distribuye bajo licencia Apache 2.0, tal como la publica el autor original, e incluye el archivo `LICENSE.md` como parte de la copia. No se dispone en la información proporcionada de detalles sobre arquitectura, número de parámetros, longitud de contexto u otras especificaciones técnicas del modelo subyacente; estos datos deberían consultarse en el repositorio upstream.

La relevancia de este mirror radica en su utilidad para entornos de integración continua y desarrollo reproducible, donde la disponibilidad de una copia fija de los pesos es crítica. Sin embargo, para cualquier uso productivo se recomienda preferir el repositorio original de Black Forest Labs, que es la fuente de verdad y donde se aplicarán correcciones o actualizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion, segun el ecosistema diffusers) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el nombre del repo sugiere FP8, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repo de 4.1 GB, probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna del modelo en la documentacion de este mirror. Dado que se trata de una copia exacta del modelo `black-forest-labs/FLUX.2-klein-4B`, se espera que herede la arquitectura de la familia FLUX.2, que son modelos de difusion para generacion de imagenes a partir de texto. El entrenamiento fue realizado por Black Forest Labs, pero no se detallan datos como el numero de tokens, la composicion del dataset o el uso de tecnicas de alineacion (RLHF, DPO, etc.) en la informacion disponible.

El unico dato tecnico confirmado es que el repositorio utiliza la libreria `diffusers` de Hugging Face y que el tamaño del repositorio es de 4.1 GB. No se mencionan innovaciones tecnicas especificas en la model card del mirror.

## Capacidades

No se dispone de informacion detallada sobre las capacidades especificas del modelo en la documentacion proporcionada. Al ser un mirror del modelo FLUX.2-klein-4B, se espera que sea capaz de generar imagenes a partir de descripciones textuales, pero no se confirman caracteristicas como tool calling, razonamiento multi-paso, capacidades multilingues o modos especiales de thinking. Para conocer las capacidades reales, es necesario consultar la documentacion del modelo original en el repositorio upstream.

## Casos de uso

No se han documentado casos de uso especificos en la informacion proporcionada. Dado que se trata de un mirror destinado a la reproducibilidad de builds, su uso principal es como dependencia fija en pipelines de desarrollo. Para aplicaciones practicas de generacion de imagenes, se recomienda utilizar el modelo original `black-forest-labs/FLUX.2-klein-4B` directamente, ya que este mirror no aporta ninguna funcionalidad adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos comparativos de rendimiento con otros modelos de generacion de imagenes.

## Requisitos de hardware

Segun la busqueda web realizada, el modelo FLUX.2 [klein] 4B ocupa aproximadamente 13 GB de VRAM y es accesible en NVIDIA RTX 3090/4070 y superiores. Este dato corresponde al modelo original y es aplicable al mirror, ya que los pesos son identicos.

- VRAM estimada: ~13 GB para inferencia.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4070 o superiores.
- No se dispone de informacion sobre opciones de despliegue especificas (vLLM, llama.cpp, Ollama, TGI, etc.) para este mirror. Como modelo de difusion, es probable que se cargue mediante la libreria `diffusers` de Hugging Face.
- No se conocen datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos de generacion de imagenes. No se han proporcionado datos de rendimiento, parametros o contexto de modelos alternativos.

## Limitaciones y advertencias

- Este repositorio es un mirror mantenido por un tercero (`beenga8`), no por Black Forest Labs. No se garantiza que esté actualizado con respecto al repositorio upstream.
- Al ser una copia exacta, hereda todas las limitaciones del modelo original, pero no se detallan en la informacion proporcionada (sesgos, riesgo de alucinacion, limitaciones de idioma, etc.).
- La licencia Apache 2.0 permite uso comercial, pero puede estar sujeta a las politicas de uso de Black Forest Labs. Se recomienda revisar la documentacion del modelo original.
- No se dispone de informacion sobre restricciones adicionales de uso o distribucion.

## Enlaces

- Repositorio del mirror: [beenga8/flux-2-klein-4b-fp8-mirror](https://huggingface.co/beenga8/flux-2-klein-4b-fp8-mirror)
- Repositorio original: [black-forest-labs/FLUX.2-klein-4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B)
- Repositorio oficial de inferencia de FLUX.2 en GitHub: [black-forest-labs/flux2](https://github.com/black-forest-labs/flux2)
