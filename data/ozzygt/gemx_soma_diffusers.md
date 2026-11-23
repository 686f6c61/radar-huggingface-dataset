# OzzyGT/gemx_soma_diffusers

## Resumen

GEM-X SOMA Diffusers es una conversión al ecosistema Diffusers del modelo de cuerpo nativo77 de nvidia/GEM-X, un sistema que reconstruye el movimiento 3D de una persona a partir de un vídeo. El repositorio, publicado por el usuario OzzyGT, empaqueta los pesos, las configuraciones y el código del modelo: el detector de personas RT-DETR (PekingU/rtdetr_r101vd_coco_o365), el modelo de keypoints de GEM-X, el codificador de pose, el transformer de movimiento y el esqueleto neutro SOMA77 de Kimodo.

No se trata de un modelo de lenguaje, sino de un pipeline modular de visión por computador orientado a captura de movimiento (motion capture) y estimación de pose. Su relevancia radica en que traslada un modelo propietario de NVIDIA al formato Modular Diffusers, lo que permite cargarlo con `ModularPipelineBlocks` y ejecutarlo sobre vídeo a 30 FPS para obtener una secuencia de movimiento SOMA77 en metros con convención +Y hacia arriba.

El repositorio ocupa 7,4 GB y se distribuye bajo la NVIDIA Open Model License para los pesos de GEM-X, con componentes auxiliares bajo Apache-2.0. Está etiquetado únicamente para inglés y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline modular Diffusers: detector RT-DETR + modelo de keypoints + codificador de pose + transformer de movimiento |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vídeo/pose, no de texto) |
| Tipos de cuantización | no disponible; el autor recomienda float32 para coincidir con GEM-X |
| Idiomas soportados | en |
| Licencia | NVIDIA Open Model License (pesos GEM-X); Apache-2.0 (detector y código/skeleton de Kimodo) |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El pipeline combina varios componentes encadenados. Primero, un detector de personas basado en RT-DETR (PekingU/rtdetr_r101vd_coco_o365) localiza al sujeto en el vídeo. Después, el modelo de keypoints de GEM-X extrae la información de pose 2D, que se procesa mediante un codificador de pose y un transformer de movimiento para reconstruir la trayectoria 3D en el espacio mundial. La salida se expresa sobre el esqueleto neutro SOMA77 de Kimodo, con orden de articulaciones y convención de rotación propias de ese esqueleto.

El repositorio es una conversión de pesos, no un reentrenamiento: los pesos de GEM-X proceden del modelo original de NVIDIA y el detector se mantiene sin cambios. No se dispone de información sobre el número de tokens, la composición del dataset de entrenamiento ni el uso de RLHF/DPO, ya que el modelo card remite a la documentación original de nvidia/GEM-X para esos detalles. Una innovación destacable es el uso del sistema Modular Diffusers, que separa los bloques del pipeline en un repositorio independiente (`OzzyGT/gemx_soma_custom_blocks`) y permite cargar componentes remotos con `trust_remote_code` y `trust_components_code`.

## Capacidades

- Reconstrucción de movimiento 3D de una persona a partir de vídeo a 30 FPS.
- Estimación de pose 2D y esqueleto en espacio de cámara (camera-space skeleton y keypoints 2D).
- Generación de movimiento en espacio mundial (world motion) expresado en metros con +Y hacia arriba.
- Salida en formato SOMA77 con orden de articulaciones y convención de rotación de Kimodo.
- Posibilidad de devolver también los parámetros corporales SOMA.
- Detección automática de personas mediante RT-DETR integrado en el pipeline.
- Exportación de resultados a `.npz` comprimido para su uso posterior.
- No soporta tool calling, agentes ni razonamiento multi-step: es un modelo de visión especializado.
- Capacidades multilingües no aplicables; etiquetado solo para inglés.

## Casos de uso

- Captura de movimiento para animación: procesar un vídeo de una persona y obtener una secuencia SOMA77 lista para retargeting en un motor de animación o herramienta 3D, gracias a la salida en metros y con convención +Y arriba.
- Análisis deportivo: extraer la trayectoria 3D de un atleta desde vídeo a 30 FPS para estudiar la mecánica de un gesto (por ejemplo, una patada o un salto) y comparar ejecuciones entre repeticiones.
- Previsualización de motion capture sin traje: sustituir un sistema de captura con marcadores por un pipeline de vídeo único cuando la precisión absoluta no es crítica.
- Generación de datasets de movimiento: producir pares vídeo-movimiento para entrenar modelos de generación de animación o de pose, aprovechando la exportación a `.npz`.
- Reconstrucción de escenas para VFX: obtener el movimiento del actor en espacio mundial para integrarlo en una escena 3D con cámara virtual.
- Investigación en visión por computador: usar el pipeline modular como referencia reproducible de un sistema de reconstrucción de movimiento basado en transformer, con componentes separados y sustituibles.
- Prototipado en robótica o biomecánica: analizar la cinemática de una persona a partir de vídeo monocámara para estudios preliminares de movimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 7,4 GB y el autor recomienda ejecutar en float32, lo que implica una huella de memoria superior a la del peso en disco.
- GPU recomendadas: no disponibles en la información proporcionada; el ejemplo oficial usa `pipe.to("cuda")` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; la recomendación de float32 y el tamaño del pipeline sugieren que requiere una GPU con VRAM considerable, pero no se aportan cifras.
- Opciones de despliegue: Diffusers (>=0.41.0) con ModularPipelineBlocks, junto con transformers (>=5.3.0), torchvision (>=0.25), opencv-python-headless (>=4.10), scipy (>=1.11), imageio e imageio-ffmpeg.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GEM-X SOMA Diffusers (este) | Pipeline modular Diffusers | Vídeo 30 FPS | Movimiento SOMA77 3D | NVIDIA Open Model License + Apache-2.0 | Hugging Face |
| nvidia/GEM-X (original) | Modelo nativo | Vídeo | Movimiento 3D | NVIDIA Open Model License | Hugging Face |
| RT-DETR r101vd (componente) | Detector de objetos | Imagen | Cajas de personas | Apache-2.0 | Hugging Face |

No se dispone de información sobre otros modelos comparables de reconstrucción de movimiento 3D en la documentación proporcionada, ni de datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El vídeo de entrada debe estar exactamente a 30 FPS; otras frecuencias requieren remuestreo previo.
- El movimiento en espacio mundial no está anclado a los pies (no foot-locked), por lo que puede producirse deslizamiento de pies.
- Solo se reconstruye el movimiento de una persona por vídeo.
- El modelo está etiquetado únicamente para inglés, aunque al ser un modelo de visión el impacto del idioma es limitado.
- Riesgo de alucinación no aplicable en el sentido de los LLM, pero sí existe riesgo de estimaciones de pose erróneas en oclusiones, movimientos rápidos o ángulos de cámara desfavorables.
- La licencia NVIDIA Open Model License impone condiciones para uso comercial; es necesario revisar el acuerdo y el archivo NOTICE antes de desplegar en producción.
- El uso de `trust_remote_code=True` y `trust_components_code=True` ejecuta código descargado del Hub; solo debe hacerse con repositorios de confianza.
- El repositorio no registra descargas ni validación comunitaria, por lo que la fiabilidad de la conversión no está contrastada de forma independiente.
- No se han publicado benchmarks que permitan estimar la precisión frente al modelo original de NVIDIA.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OzzyGT/gemx_soma_diffusers
- Bloques modulares del pipeline: https://huggingface.co/OzzyGT/gemx_soma_custom_blocks
- Modelo original: https://huggingface.co/nvidia/GEM-X
- Repositorio de código de GEM-X: https://github.com/NVlabs/GEM-X
- Detector RT-DETR: https://huggingface.co/PekingU/rtdetr_r101vd_coco_o365
- Código y esqueleto de Kimodo: https://github.com/nv-tlabs/kimodo
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Vídeo de ejemplo: https://huggingface.co/datasets/OzzyGT/diffusers-examples/resolve/main/gem-x/gemx_soma_karate.mp4
