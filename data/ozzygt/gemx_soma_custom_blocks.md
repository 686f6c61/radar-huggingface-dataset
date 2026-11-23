# OzzyGT/gemx_soma_custom_blocks

## Resumen

GEM-X SOMA Modular Diffusers es un conjunto de bloques modulares para la librería `diffusers` que adapta el modelo `nvidia/GEM-X` a la tarea de reconstrucción de movimiento 3D de una persona a partir de un vídeo. El autor de la adaptación es OzzyGT, y el modelo base es GEM-X, desarrollado por NVIDIA Labs (NVlabs). El resultado de la inferencia es una secuencia de movimiento en formato SOMA77 sobre el esqueleto neutro de Kimodo, es decir, rotaciones locales y globales por articulación, posiciones de las articulaciones, posición de la raíz y contactos de los pies, a 30 FPS y en metros.

La relevancia de esta ficha radica en que se trata de un componente especializado dentro de un pipeline de captura de movimiento (motion capture) y estimación de pose (pose estimation) sobre vídeo, no de un modelo de lenguaje. La adaptación separa los bloques de pipeline (este repositorio) de los pesos convertidos y el código del modelo (repositorio `OzzyGT/gemx_soma_diffusers`), lo que permite integrar la reconstrucción de movimiento en flujos de trabajo basados en `diffusers` con `ModularPipelineBlocks`.

El repositorio no contiene pesos: solo bloques de código bajo licencia Apache-2.0. Los pesos de GEM-X se rigen por la NVIDIA Open Model License. El modelo trabaja a 30 FPS, asume cámara fija salvo que se aporten rotaciones de cámara externas, y está pensado para clips de una sola persona, siguiendo a la persona de mayor tamaño en la imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (bloques modulares de `diffusers` sobre el modelo GEM-X; no se detalla la arquitectura interna de GEM-X en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de vídeo; trabaja sobre secuencias de fotogramas a 30 FPS, sin ventana de contexto textual especificada) |
| Tipos de cuantizacion | no disponible (el ejemplo usa `float32`; se menciona que `bfloat16` ahorra memoria pero altera el movimiento de forma notable) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | Apache-2.0 para los bloques; los pesos de GEM-X usan NVIDIA Open Model License |
| Formato de pesos | no disponible en este repositorio (no contiene pesos); los pesos convertidos están en `OzzyGT/gemx_soma_diffusers` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de GEM-X (tipo de transformer, número de parámetros, composición del dataset de entrenamiento, uso de RLHF/DPO u otras técnicas). Lo que sí se describe es la capa de integración: un conjunto de bloques `ModularPipelineBlocks` de `diffusers` que orquestan la inferencia de GEM-X y transforman su salida en parámetros de movimiento SOMA77 sobre el esqueleto neutro de Kimodo.

El pipeline requiere `diffusers>=0.41.0`, `transformers>=5.3.0`, PyTorch, `torchvision`, `opencv-python-headless` y `scipy`; el ejemplo de carga de vídeo añade `imageio` e `imageio-ffmpeg`. La inferencia se ejecuta con `trust_remote_code=True` (para cargar los bloques de este repositorio) y `trust_components_code=True` (para cargar el código del modelo en el repositorio de pesos), lo que implica ejecutar código Python descargado del Hub. El modelo opera a 30 FPS, por lo que es necesario remuestrear el vídeo de entrada antes de la inferencia. La salida incluye `local_rot_mats`, `global_rot_mats`, `posed_joints`, `root_positions` y `foot_contacts`, en metros y con +Y hacia arriba, y opcionalmente `soma_params` y `soma_params_camera` con los parámetros corporales SOMA, incluida la forma estimada del cuerpo, en espacio de mundo y de cámara.

## Capacidades

- Reconstrucción de movimiento 3D de una persona a partir de vídeo, expresada como SOMA77 sobre el esqueleto neutro de Kimodo.
- Estimación de pose 2D y esqueleto en espacio de cámara, además del movimiento en espacio de mundo.
- Salida de rotaciones locales y globales por articulación, posiciones de articulaciones (`posed_joints`), posición de la raíz (`root_positions`) y contactos de los pies (`foot_contacts`) a 30 FPS.
- Estimación de la forma corporal mediante parámetros SOMA (`soma_params`, `soma_params_camera`).
- Soporte de rotaciones de cámara externas (`camera_rotations`, matriz `(frames, 3, 3)` de mundo a cámara) para secuencias con cámara en movimiento o en mano.
- Soporte de matriz intrínseca de cámara (`intrinsics`, matriz `(3, 3)` en píxeles) si se conoce.
- Seguimiento de la persona de mayor tamaño en el clip.
- No se documentan capacidades de generación de texto, tool calling, agentes ni razonamiento multi-step; es un modelo de visión y movimiento.

## Casos de uso

- Captura de movimiento para animación: a partir de un vídeo de una persona actuando, el pipeline devuelve rotaciones y posiciones articulares listas para retargetizar a un rig 3D en un motor de animación, gracias a la salida SOMA77 y a la convención de rotaciones de Kimodo SOMA Modular.
- Análisis biomecánico y deportivo: la salida de `posed_joints` y `foot_contacts` en metros permite medir trayectorias, apoyos y posturas de un atleta en un clip grabado con cámara fija a 30 FPS.
- Reconstrucción de escenas para realidad virtual o aumentada: la combinación de movimiento en espacio de mundo y parámetros de cámara permite situar a un actor digital en una escena coherente con la grabación original.
- Generación de datos sintéticos para entrenar modelos de pose: el pipeline puede procesar lotes de clips y guardar las salidas en `.npz` para construir datasets de movimiento 3D con forma corporal estimada.
- Integración en pipelines de `diffusers`: al ser bloques `ModularPipelineBlocks`, se pueden encadenar con otros bloques del ecosistema para flujos de vídeo más amplios, como preprocesado, análisis o postprocesado de movimiento.
- Prototipado de herramientas de edición de vídeo con seguimiento de personas: la detección de la persona de mayor tamaño y la salida estructurada permiten construir funciones de seguimiento, estabilización o sustitución de actores en postproducción.
- Investigación en visión por computador: sirve como referencia reproducible para comparar métodos de reconstrucción de movimiento 3D a partir de vídeo monoculo, con salidas estandarizadas y licencia permisiva en los bloques.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El ejemplo oficial usa `float32`; se indica que `bfloat16` reduce el consumo de memoria pero altera el movimiento de forma perceptible.
- GPU recomendadas: no disponible. El ejemplo mueve el pipeline a CUDA (`pipe.to("cuda")`), pero no se especifican modelos de GPU concretos.
- Cabe en GPU de consumo: no disponible; no se confirma ni se descarta.
- Opciones de despliegue: el pipeline se ejecuta mediante `diffusers` con `ModularPipelineBlocks` y `trust_remote_code=True` / `trust_components_code=True`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vídeo de este tipo).
- Latencia y throughput: no disponibles. El modelo procesa a 30 FPS de vídeo, pero no se indica la velocidad de inferencia en hardware concreto.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de reconstrucción de movimiento 3D a partir de vídeo, ni datos de parámetros, contexto o rendimiento de alternativas.

## Limitaciones y advertencias

- El repositorio no contiene pesos; solo bloques de código. Los pesos están en `OzzyGT/gemx_soma_diffusers` y se rigen por la NVIDIA Open Model License, distinta de la Apache-2.0 de los bloques.
- Uso de `trust_remote_code=True` y `trust_components_code=True`: ejecuta código Python descargado del Hub. Solo debe usarse con repositorios de confianza y revisando el código antes de emplearlo.
- El modelo asume cámara fija. Para tomas con paneo o cámara en mano es necesario aportar `camera_rotations` desde un rastreador de cámara externo; de lo contrario, el movimiento en espacio de mundo será incorrecto.
- El movimiento en espacio de mundo no está anclado a los pies, por lo que estos pueden deslizar ligeramente. Si se requiere que queden fijos, hay que aplicar una limpieza (foot cleanup) a la salida.
- Las rotaciones de los dedos provienen del modelo corporal, no del modelo de manos de GEM-X, por lo que la articulación fina de la mano es aproximada.
- El seguimiento se limita a la persona de mayor tamaño del clip; no se documenta soporte para múltiples personas.
- El vídeo debe remuestrearse a 30 FPS antes de la inferencia; otros ritmos de fotogramas pueden degradar el resultado.
- El idioma declarado es inglés; no se documenta soporte multilingüe (poco relevante para una tarea de visión, pero relevante para cualquier texto auxiliar).
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo de estimación de pose, el riesgo principal es la imprecisión en la reconstrucción, no la generación de contenido falso.
- No se han publicado benchmarks en la información disponible, por lo que no se puede cuantificar su precisión frente a alternativas.

## Enlaces

- Repositorio de bloques en Hugging Face: https://huggingface.co/OzzyGT/gemx_soma_custom_blocks
- Repositorio de pesos y código convertidos: https://huggingface.co/OzzyGT/gemx_soma_diffusers
- Modelo base GEM-X en Hugging Face: https://huggingface.co/nvidia/GEM-X
- Repositorio de código de GEM-X (NVlabs): https://github.com/NVlabs/GEM-X
- Kimodo SOMA Modular: https://huggingface.co/OzzyGT/Kimodo_SOMA_Modular
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Vídeo de ejemplo (karate): https://huggingface.co/datasets/OzzyGT/diffusers-examples/resolve/main/gem-x/gemx_soma_karate.mp4
