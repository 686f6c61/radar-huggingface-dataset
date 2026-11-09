# AI-KSK/ksk-video-225-comfyui-workflows

## Resumen

AI-KSK/ksk-video-225-comfyui-workflows no es un modelo de pesos en sentido estricto, sino un repositorio de flujos de trabajo (workflows) para ComfyUI publicados como acompañamiento de un episodio divulgativo sobre WAI-ANIMA, una fusión (merge) construida sobre Anima Preview 3. El repositorio contiene tres grafos en formato JSON: texto-a-imagen con pase de upscaling latente 1,5x, imagen-a-imagen y upscaling por teselas. El tamaño del repositorio es de 0,0 GB, lo que confirma que no incluye pesos de modelo, solo los ficheros de definición de los grafos y la documentación asociada.

El interés del material es metodológico: el autor compara el upscaling latente frente al upscaling en espacio de píxeles y sostiene que el primero ofrece mejores resultados, además de situar en 1 y 4 megapíxeles los techos empíricos de resolución para este pipeline. Los flujos están orientados a generación de ilustración de estilo anime, con soporte de upscaling por teselas para resoluciones altas.

La relevancia es acotada: se trata de un recurso para usuarios de ComfyUI que quieran reproducir una configuración concreta de WAI-ANIMA, no de un modelo entrenado publicable. No hay información sobre arquitectura, número de parámetros ni datos de entrenamiento del modelo subyacente en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene workflows de ComfyUI, no pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de difusión texto-a-imagen, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | other (licencia personalizada, no especificada en detalle) |
| Formato de pesos | no disponible; el repositorio contiene ficheros JSON de workflow para ComfyUI |

## Arquitectura y entrenamiento

No disponible. La información proporcionada no describe la arquitectura de WAI-ANIMA ni de Anima Preview 3, ni detalla el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El repositorio en sí no contiene pesos ni scripts de entrenamiento: es un paquete de tres grafos de ComfyUI (16 nodos para texto-a-imagen con upscaling latente, 13 para imagen-a-imagen y 26 para upscaling por teselas), con los nombres de fichero de UNET, CLIP y VAE extraídos de los propios JSON.

La única innovación técnica documentada es de flujo de inferencia, no de arquitectura del modelo: el uso de un pase de hires con upscaling en espacio latente (1,5x) en lugar de upscaling en píxeles, y la presencia de un sampler especial cuyo parámetro `eta` se fija en 0,35, valor que el autor señala como determinante para el resultado.

## Capacidades

- Generación de imágenes de estilo anime a partir de texto (text-to-image) mediante el grafo de 16 nodos con pase de hires y upscaling latente 1,5x.
- Transformación imagen-a-imagen (image-to-image) con preservación de estilo condicionada al prefijo de artista en el prompt.
- Upscaling por teselas (tiled upscale) para llevar imágenes a resoluciones altas, con grafos de 26 nodos.
- Upscaling en espacio latente como alternativa al upscaling en píxeles, con mejora de nitidez según las pruebas del autor.
- Control fino del sampler mediante el parámetro `eta` (valor recomendado 0,35).
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento, por tratarse de un pipeline de difusión texto-a-imagen.

## Casos de uso

- Reproducción de un pipeline de ilustración anime en ComfyUI: cargar el JSON de texto-a-imagen con upscaling latente permite generar ilustraciones con un pase de hires controlado, útil para quien quiera partir de una configuración ya validada por el autor en lugar de construir el grafo desde cero.
- Comparación de estrategias de upscaling: el repositorio sirve para contrastar empíricamente upscaling latente frente a upscaling en píxeles sobre las mismas semillas, dado que el autor aporta su propio criterio y los límites de 1 y 4 megapíxeles.
- Restauración y ampliación de ilustraciones existentes: el grafo de imagen-a-imagen (13 nodos) permite reestilizar o ampliar una imagen de entrada manteniendo el prefijo de artista en el prompt, que según el autor es clave para conservar el estilo.
- Producción de imágenes de alta resolución para impresión o fondos: el grafo de upscaling por teselas (26 nodos) está pensado para superar los límites de resolución de una pasada única, a costa de cierta pérdida de detalle.
- Docencia y divulgación sobre ComfyUI: los tres JSON, con recuento de nodos y nombres de UNET, CLIP y VAE documentados, son material didáctico para explicar la estructura de un grafo de difusión con hires fix y tiled upscale.
- Integración en flujos de trabajo de estudio de anime: un equipo puede adoptar los grafos como plantilla base y sustituir los ficheros de modelo por sus propios checkpoints, manteniendo la topología de nodos y los parámetros del sampler.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta observaciones cualitativas y límites empíricos (techos de 1 y 4 megapíxeles, `eta` a 0,35), sin métricas cuantitativas como FID, CLIP score ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no publicarse pesos ni tamaño de parámetros, no es posible estimar el consumo de memoria del UNET, CLIP y VAE referenciados en los JSON.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI es el entorno previsto para ejecutar los grafos; también se ofrecen versiones alojadas en RunningHub para los tres flujos (tiled upscale, imagen-a-imagen y texto-a-imagen con upscaling latente), lo que permite ejecutarlos sin hardware local.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de parámetros, contexto ni rendimiento de WAI-ANIMA ni de Anima Preview 3, y no se identifican alternativas comparables con datos verificables en el material consultado.

## Limitaciones y advertencias

- Los límites de un millón y cuatro millones de píxeles son empíricos, obtenidos en las pruebas del propio autor, no proceden de documentación oficial del modelo.
- El upscaling por teselas pierde detalle aunque aumente la nitidez; el autor espera que una versión posterior del modelo lo corrija.
- Omitir el prefijo de artista en un pase de imagen-a-imagen degrada el estilo de forma acusada, según el autor; el prefijo cumple una función real en el condicionamiento.
- El repositorio no contiene pesos de modelo (tamaño 0,0 GB), solo workflows JSON y documentación; no es ejecutable por sí mismo sin los ficheros UNET, CLIP y VAE externos.
- La licencia es "other" y no se detallan sus términos en la información disponible; debe verificarse antes de cualquier uso comercial.
- El idioma declarado es únicamente inglés, lo que puede afectar a la calidad de los prompts en castellano.
- No se documentan sesgos, tasas de alucinación visual ni evaluaciones de seguridad; al ser un modelo de difusión de estilo anime, existe riesgo de reproducir sesgos estilísticos y de contenido del corpus de entrenamiento, no cuantificado en el material.
- El repositorio registra 0 descargas y 0 likes, sin validación comunitaria documentada hasta la fecha indicada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/ksk-video-225-comfyui-workflows
- Workflow WAI ANIMA tiled upscale en RunningHub: https://www.runninghub.ai/post/2046194195202838530/?inviteCode=rh-v1111
- Workflow WAI ANIMA image-to-image en RunningHub: https://www.runninghub.ai/post/2046194201804677121/?inviteCode=rh-v1111
- Workflow WAI ANIMA text-to-image con latent upscale y hires fix en RunningHub: https://www.runninghub.ai/post/2046194207995469826/?inviteCode=rh-v1111
- Tutorial en vídeo (YouTube): https://www.youtube.com/watch?v=4MlEMZ1NdEw
- Original en chino (Bilibili): https://www.bilibili.com/video/BV1q7drB7Ecp
