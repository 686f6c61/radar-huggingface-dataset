# ngoctham/MoCapAnythingV2-weights

## Resumen

MoCapAnything V2 es un modelo de captura de movimiento (motion capture, mocap) de un solo paso que transforma un video monoculo en rotaciones articulares listas para exportar a BVH, sin necesidad de un paso analitico de cinematica inversa (IK) en el bucle. Lo desarrolla un equipo academico liderado por Kehong Gong y Hanwang Zhang, con codigo publicado en GitHub bajo el repositorio `phongdaot/MocapAnything` y pesos alojados en HuggingFace. El problema que resuelve es la captura de movimiento para esqueletos arbitrarios: en lugar de entrenar un modelo especifico por especie o rig, el sistema acepta una pose de referencia de un unico fotograma del esqueleto objetivo y generaliza a esa topologia.

El checkpoint publicado, `video2pos2rot_epoch60.pt` (unos 464 MB, repositorio de 0,5 GB), es un unico modelo `video2pose2rot` que mapea directamente video a rotaciones. Se apoya en dos componentes externos que se descargan en tiempo de ejecucion: el eliminador de fondo `briaai/RMBG-1.4` y el codificador de video `facebook/dinov2-large`. La relevancia actual esta en que elimina la dependencia de pipelines de IK especificos por esqueleto, lo que simplifica la produccion de animacion para humanos y animales a partir de video.

La informacion disponible no incluye detalles sobre el numero de parametros del modelo, la longitud de contexto (no aplica en el sentido de LLM, al ser un modelo de vision) ni resultados de benchmarks. La ficha se limita a lo que la model card y los metadatos del repositorio documentan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red end-to-end video → pose → rotacion (`video2pose2rot`); codificador de video DINOv2-large (`facebook/dinov2-large`) y eliminador de fondo RMBG-1.4 (`briaai/RMBG-1.4`) como componentes externos |
| Parametros totales | no disponible (checkpoint de ≈464 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pt`) |
| Idiomas soportados | no aplica; entrada de video, sin procesamiento de lenguaje |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (`video2pos2rot_epoch60.pt`) |

## Arquitectura y entrenamiento

La model card describe un unico checkpoint end-to-end que mapea un video monoculo, junto con una pose de referencia de un fotograma del esqueleto objetivo, directamente a rotaciones articulares exportables a BVH. La innovacion declarada es la ausencia de cinematica inversa analitica en el bucle: el modelo aprende el mapeo video → pose → rotacion de forma conjunta. El pipeline delega el preprocesado en dos modelos preentrenados de HuggingFace: `briaai/RMBG-1.4` para eliminar el fondo y `facebook/dinov2-large` como codificador de video. Ninguno de los dos se rehostea en el repositorio de pesos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO (no aplica a este tipo de modelo) ni detalles sobre la funcion de perdida o el esquema de entrenamiento mas alla del nombre del checkpoint (`epoch60`). Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. La generalizacion a "esqueletos arbitrarios" se logra mediante la pose de referencia de un fotograma, segun la descripcion del autor.

## Capacidades

- Captura de movimiento a partir de video monoculo: entrada de video, salida de rotaciones articulares.
- Generalizacion a esqueletos arbitrarios: acepta una pose de referencia de un fotograma de la especie o rig objetivo.
- Salida lista para BVH: exportacion directa a formato de animacion sin paso de IK analitico.
- Soporte de animales: las etiquetas del repositorio incluyen `animals`, y el titulo del paper menciona esqueletos arbitrarios.
- Retargeting: etiqueta `retargeting` en los metadatos del repositorio.
- Deteccion de keypoints: pipeline declarado `keypoint-detection`.
- Demo interactiva en Gradio (`demo/app.py`) e inferencia por linea de comandos (`inference/video2pose2rot.py`).
- No se documentan capacidades de generacion de texto, codigo, matematicas, tool calling, agentes ni vision multimodal en el sentido de LLM.

## Casos de uso

- Produccion de animacion 3D: a partir de un video de referencia se obtienen rotaciones articulares exportables a BVH, que se pueden cargar en Blender (la model card menciona una guia de render en `RUN.md`) para animar un personaje sin captura con traje de sensores.
- Captura de movimiento de animales: usando una pose de referencia de un fotograma del esqueleto del animal, el modelo generaliza a esa topologia, lo que permite animar cuadrupedos u otras especies sin un rig especifico entrenado.
- Retargeting entre rigs: al aceptar esqueletos arbitrarios mediante la pose de referencia, el mismo video puede mapearse a distintos personajes o esqueletos objetivo cambiando la referencia.
- Previsualizacion rapida de animacion en preproduccion: la demo de Gradio permite subir un video y obtener un BVH preliminar para validar timing y poses antes de una captura de mayor calidad.
- Investigacion en vision por computador y graficos: el codigo y los pesos permiten reproducir el pipeline `video2pose2rot` y experimentar con el mapeo directo video → rotacion frente a pipelines con IK.
- Generacion de datos sinteticos de movimiento: las rotaciones BVH resultantes pueden alimentar pipelines de entrenamiento de otros modelos de animacion o de deteccion de pose.
- Integracion en herramientas de creacion de contenido: al ser un checkpoint PyTorch con licencia MIT, puede integrarse en herramientas internas de estudio o de creacion de contenido que necesiten mocap desde video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El checkpoint pesa ≈464 MB, pero el pipeline completo incluye el codificador de video `facebook/dinov2-large` y el eliminador de fondo `briaai/RMBG-1.4`, cuyos requisitos no se detallan.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. No se especifica si cabe en tarjetas consumer como RTX 4090 o inferiores.
- Opciones de despliegue: inferencia via PyTorch con el repositorio `phongdaot/MocapAnything` (scripts `inference/video2pose2rot.py` y `demo/app.py` con Gradio). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion cuantitativa. Como referencia cualitativa, la propuesta del modelo es la captura de movimiento end-to-end sin IK analitico para esqueletos arbitrarios, frente a pipelines tradicionales que combinan estimacion de pose 2D/3D con ajuste por cinematica inversa; no se dispone de datos para contrastar resultados.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo; al entrenarse sobre datos de video no especificados, puede heredar sesgos de ese corpus.
- Riesgo de alucinacion de poses o rotaciones no disponible en la informacion; en modelos de estimacion de pose es habitual que aparezcan artefactos en oclusiones o movimientos rapidos, pero no se confirma para este checkpoint.
- Requiere una pose de referencia de un fotograma del esqueleto objetivo: sin ella no se puede aplicar a una topologia nueva.
- Depende de dos modelos externos (`briaai/RMBG-1.4` y `facebook/dinov2-large`) descargados en tiempo de ejecucion; sus licencias y condiciones deben verificarse por separado.
- Licencia MIT: permite uso comercial, pero conviene revisar las licencias de los componentes externos y de los datos de entrenamiento, no documentadas aqui.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el checkpoint se identifica como `epoch60`; no hay evidencia publica de validacion externa.
- No se documentan limitaciones de idioma (no aplica) ni de longitud de contexto; el modelo procesa video, no texto.
- Para produccion: no hay datos publicados de latencia, throughput ni robustez, por lo que la evaluacion previa en el caso de uso concreto es imprescindible.

## Enlaces

- HuggingFace (pesos): https://huggingface.co/ngoctham/MoCapAnythingV2-weights
- Paper en HF Papers: https://huggingface.co/papers/2604.28130
- arXiv: https://arxiv.org/abs/2604.28130
- Pagina del proyecto: https://animotionlab.github.io/MoCapAnythingV2/
- Codigo en GitHub: https://github.com/phongdaot/MocapAnything
- Guia de ejecucion (RUN.md): https://github.com/phongdaot/MocapAnything/blob/main/RUN.md
- Dataset de demo: https://huggingface.co/datasets/kehong/MoCapAnythingV2-data-sample
- Codificador de video (componente externo): https://huggingface.co/facebook/dinov2-large
- Eliminador de fondo (componente externo): https://huggingface.co/briaai/RMBG-1.4
