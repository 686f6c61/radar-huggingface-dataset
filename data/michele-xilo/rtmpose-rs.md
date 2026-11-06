# michele-xilo/rtmpose-rs

## Resumen

RTMPose ONNX es una colección de exportaciones en formato ONNX de los modelos RTMPose, RTMW y RTMDet, desarrollados originalmente por OpenMMLab dentro del proyecto MMPose. El repositorio, publicado por el usuario michele-xilo, no contiene pesos entrenados desde cero, sino conversiones de los checkpoints oficiales de OpenMMLab pensadas para ser consumidas por la crate de Rust `rtmpose-rs`. Su función es proporcionar un pipeline completo de estimación de pose: un detector de personas (RTMDet nano) y estimadores de keypoints (RTMPose y RTMW) en dos variantes de tamaño cada uno.

La relevancia de esta publicación es práctica más que investigadora: empaqueta en un único repositorio de 0,5 GB todos los artefactos ONNX necesarios para ejecutar detección de pose en producción desde Rust, sin depender del ecosistema Python de OpenMMLab. RTMPose es una familia de modelos de estimación de pose 2D eficientes, y RTMW extiende la tarea al cuerpo completo con 133 keypoints (incluyendo manos y rostro). Los modelos operan sobre recortes de 256x192 píxeles y están entrenados sobre COCO, AI Challenger y, en el caso de RTMW, el conjunto Cocktail14.

La licencia declarada es Apache 2.0, si bien la propia model card advierte de que algunos de los datasets de entrenamiento tienen términos propios que conviene revisar antes de un uso comercial. No se dispone de información sobre número de parámetros, longitud de contexto (concepto no aplicable a un modelo de visión) ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RTMPose / RTMW (CNN para estimación de pose 2D) y RTMDet (detector de personas); exportados a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 256x192) |
| Tipos de cuantizacion | no disponible (los artefactos publicados son ONNX en precisión original) |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Los modelos subyacentes pertenecen a la familia RTMPose de OpenMMLab, basada en redes convolucionales para la regresión de mapas de calor y coordenadas de keypoints, con la variante SimCC (coordenadas simuladas) empleada en los checkpoints incluidos. RTMDet actúa como detector de personas previo, y RTMPose/RTMW estiman los keypoints sobre el recorte resultante. Las variantes incluidas son RTMPose-m y RTMPose-l para 17 keypoints corporales de COCO, y RTMW-m y RTMW-l para 133 keypoints de cuerpo completo (whole-body). Los nombres de fichero indican el dataset de entrenamiento: `aic_coco` para RTMPose y `cocktail14` para RTMW.

No se dispone de información sobre el número de tokens de entrenamiento (no aplica), la composición detallada de los datasets ni si hubo etapas de refinamiento posteriores. La model card únicamente indica que los checkpoints fueron entrenados sobre COCO, AI Challenger y Cocktail14. La innovación técnica relevante en este repositorio es la exportación a ONNX para su consumo desde Rust mediante la crate `rtmpose-rs`, lo que facilita el despliegue sin dependencias de Python.

## Capacidades

- Detección de personas con RTMDet nano (`rtmdet_nano_person.onnx`), como etapa previa al recorte.
- Estimación de pose corporal 2D con 17 keypoints COCO mediante RTMPose-m y RTMPose-l.
- Estimación de pose de cuerpo completo con 133 keypoints (cuerpo, manos y rostro) mediante RTMW-m y RTMW-l.
- Inferencia sobre recortes de imagen de 256x192 píxeles.
- Ejecución en formato ONNX, compatible con runtimes ONNX estándar y con la crate de Rust `rtmpose-rs`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente de visión.
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Análisis de movimiento deportivo: RTMPose-l permite extraer los 17 keypoints corporales por fotograma para calcular ángulos articulares y trayectorias en vídeo de entrenamiento, con la variante large como opción de mayor precisión.
- Captura de movimiento para animación: RTMW-l, con 133 keypoints incluyendo manos y rostro, es adecuado para retargeting de movimiento en pipelines de animación 3D donde se requiere detalle facial y de dedos.
- Control de calidad ergonómico en puestos de trabajo: el pipeline RTMDet + RTMPose puede estimar posturas de operarios en imágenes de cámara fija para detectar posturas de riesgo, ejecutándose en local gracias al formato ONNX.
- Aplicaciones de fitness en tiempo real: RTMPose-m ofrece un equilibrio entre precisión y coste computacional adecuado para contar repeticiones o corregir posturas en dispositivos con recursos limitados.
- Integración en servicios escritos en Rust: la crate `rtmpose-rs` permite incorporar estimación de pose directamente en backends Rust sin depender de Python, usando los ficheros ONNX de este repositorio.
- Investigación en visión por computador: los checkpoints exportados sirven como línea base reproducible para comparar detectores o estimadores de keypoints sobre COCO o Cocktail14 sin reinstalar MMPose.
- Preprocesado para sistemas de análisis de vídeo: el detector RTMDet nano puede emplearse como etapa de filtrado para recortar personas antes de pasarlas a un estimador de pose de mayor coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 0,5 GB en total, lo que da una cota superior del peso de los cinco ficheros ONNX juntos.
- GPU recomendadas: no disponibles; al tratarse de modelos convolucionales ligeros de estimación de pose, no requieren GPUs de datacenter como A100 o H100, aunque no se dispone de datos concretos de rendimiento.
- Compatibilidad con GPU de consumo: no confirmada explícitamente, pero el tamaño reducido de los artefactos y la naturaleza de la tarea sugieren que pueden ejecutarse en GPUs de consumo; no se dispone de cifras verificadas.
- Opciones de despliegue: runtime ONNX estándar (ONNX Runtime, tract u otros), y la crate de Rust `rtmpose-rs` para la que fueron exportados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Keypoints | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RTMPose ONNX (este repo) | RTMPose / RTMW / RTMDet | 17 (RTMPose) y 133 (RTMW) | ONNX | Apache 2.0 | Hugging Face |
| MMPose (checkpoints originales) | RTMPose / RTMW / RTMDet | 17 y 133 | PyTorch | Apache 2.0 | GitHub OpenMMLab |
| Otros estimadores de pose 2D | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre benchmarks comparativos ni sobre modelos alternativos concretos con los que contrastar rendimiento en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones; cualquier expectativa de generación de texto o razonamiento es inaplicable.
- La model card advierte de que los checkpoints se entrenaron sobre COCO, AI Challenger y Cocktail14, algunos con términos propios; es necesario revisarlos antes de un uso comercial, pese a la licencia Apache 2.0 del código y los checkpoints de MMPose.
- El repositorio es una exportación de terceros (michele-xilo), no una publicación oficial de OpenMMLab; la procedencia y fidelidad de la conversión a ONNX no están verificadas en la información disponible.
- Sin datos publicados de precisión (AP, PCK) para estas exportaciones concretas; el rendimiento puede diferir del de los checkpoints originales en PyTorch.
- Sin información sobre sesgos: al ser un modelo de visión, los sesgos potenciales dependerían de la distribución de los datasets de entrenamiento (COCO, AI Challenger, Cocktail14), no documentada aquí.
- La entrada está fijada a recortes de 256x192 píxeles; el rendimiento en poses muy alejadas, oclusiones severas o resoluciones muy distintas no está documentado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/michele-xilo/rtmpose-rs
- Crate de Rust `rtmpose-rs`: https://github.com/michele-xilo/rtmpose-rs
- Proyecto RTMPose en MMPose (OpenMMLab): https://github.com/open-mmlab/mmpose/tree/main/projects/rtmpose
- Licencia de MMPose: https://github.com/open-mmlab/mmpose/blob/main/LICENSE
