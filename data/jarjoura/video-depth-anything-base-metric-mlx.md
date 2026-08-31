# jarjoura/video-depth-anything-base-metric-mlx

## Resumen

Video Depth Anything Base (Metric) en formato MLX es una conversión del modelo homónimo desarrollado por ByteDance, presentado como destacado en CVPR 2025. Se trata de un sistema de estimación de profundidad monocular para video que produce mapas de profundidad métricos (en metros) con alta consistencia temporal entre fotogramas. La arquitectura combina un backbone DINOv2 con una cabeza DPT modificada que incorpora módulos de movimiento temporal, lo que permite procesar secuencias de video arbitrariamente largas sin degradación de calidad.

Esta versión MLX, creada por el usuario jarjoura, adapta los pesos del modelo original al framework de Apple para ejecución eficiente en hardware con silicio de Apple (M1, M2, M3 y posteriores). Con aproximadamente 114,5 millones de parámetros y un tamaño de repositorio de 0,5 GB, el modelo es ligero y adecuado para aplicaciones en tiempo real. La conversión ha sido validada contra la referencia en PyTorch, con un error relativo máximo del orden de 1e-5 en CPU y alrededor del 1% en GPU (Metal con fast-math). Su relevancia radica en ofrecer una alternativa rápida y de bajo coste computacional frente a métodos basados en difusión, manteniendo precisión y consistencia en secuencias largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 backbone + cabeza DPT temporal (Video Depth Anything) |
| Parametros totales | 114.531.521 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, procesa video) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin soporte de texto) |
| Licencia | apache-2.0 (segun el repositorio MLX; el modelo original usa cc-by-nc-4.0) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Video Depth Anything, que extiende Depth Anything V2 incorporando módulos de atención temporal entre fotogramas. El encoder es un DINOv2 preentrenado que extrae características visuales robustas, mientras que la cabeza DPT (Dense Prediction Transformer) se modifica con capas de fusión temporal para garantizar que las predicciones de profundidad sean coherentes a lo largo del tiempo. Esta combinación permite procesar secuencias de video de longitud arbitraria mediante estrategias de inferencia por ventanas deslizantes, sin perder generalización ni precisión.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. Se sabe que el modelo original fue entrenado por ByteDance con datos de video y profundidad métrica, y que la conversión MLX es una adaptación de pesos sin reentrenamiento. La principal innovación técnica reside en los módulos de movimiento temporal y en la estrategia de inferencia que mantiene la consistencia en secuencias largas, superando a los métodos basados en difusión en velocidad y eficiencia de parámetros.

## Capacidades

- Estimación de profundidad monocular métrica (en metros) para secuencias de video, fotograma a fotograma.
- Consistencia temporal: los mapas de profundidad generados son estables entre frames consecutivos, evitando parpadeos o saltos.
- Procesamiento de videos de longitud arbitraria mediante estrategias de ventanas deslizantes, sin pérdida de calidad.
- Generalización a dominios diversos (interiores, exteriores, escenas naturales y urbanas) gracias al backbone DINOv2.
- Inferencia eficiente en hardware Apple Silicon gracias a la conversión MLX, con soporte para CPU y GPU (Metal).
- Integración sencilla con la librería `mlx_vlm`, que proporciona cargadores y procesadores específicos para este modelo.

## Casos de uso

- Navegación robotica: un robot móvil puede usar los mapas de profundidad métrica en tiempo real para evitar obstáculos y planificar rutas, aprovechando la consistencia temporal para una percepción estable del entorno.
- Realidad aumentada: en aplicaciones de AR, el modelo permite insertar objetos virtuales con oclusión correcta y posicionamiento realista, calculando la profundidad de cada píxel del video capturado.
- Conduccion autonoma: los sistemas de asistencia al conductor pueden estimar distancias a vehículos, peatones y otros objetos en secuencias de video, mejorando la seguridad con información métrica precisa.
- Edicion de video profesional: los editores pueden aplicar efectos de desenfoque de profundidad, reiluminación o composición 3D basados en los mapas de profundidad generados, manteniendo coherencia entre fotogramas.
- Reconstruccion 3D de escenas: a partir de un video, el modelo permite generar nubes de puntos o mallas aproximadas del entorno, útil para arquitectura, arqueología o inspección industrial.
- Vigilancia y seguridad: en cámaras de videovigilancia, se puede medir la distancia de objetos o personas a puntos de referencia, facilitando la detección de intrusiones o el análisis de flujo.
- Asistencia a personas con discapacidad visual: una aplicación móvil puede convertir el video de la cámara en información de profundidad audible o háptica, ayudando a la navegación en entornos desconocidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia de rendimiento es la validacion realizada por el autor de la conversion MLX contra el modelo original en PyTorch: error relativo maximo de aproximadamente 1e-5 en CPU y 1% en GPU (Metal con fast-math). No se proporcionan metricas estandar como RMSE, delta1 o comparaciones con otros modelos en conjuntos de datos como KITTI o NYUv2.

## Requisitos de hardware

- Al ser una conversion MLX, el modelo esta optimizado para Apple Silicon (M1, M2, M3 y generaciones posteriores). No es compatible con GPUs NVIDIA o AMD de forma nativa.
- Tamano del modelo: 0,5 GB en disco, con 114,5 millones de parametros. Cabe en la memoria unificada de cualquier Mac con al menos 8 GB de RAM, aunque se recomienda 16 GB para videos largos o alta resolucion.
- Inferencia en CPU (con rendimiento moderado) y en GPU via Metal (acelerada). El autor reporta un error relativo del 1% en GPU con fast-math, lo que sugiere que la precision es adecuada para la mayoria de aplicaciones.
- No se requieren GPUs dedicadas de alto rendimiento como A100 o H100; el modelo esta pensado para entornos de escritorio con silicio de Apple.
- Despliegue mediante la libreria `mlx_vlm` en Python. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que es un modelo de vision y no de lenguaje.
- La latencia y el throughput no estan especificados, pero dado el tamano reducido y la optimizacion MLX, se espera un rendimiento en tiempo real para resoluciones de video moderadas (por ejemplo, 512x512 a 15 fps).

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| jarjoura/video-depth-anything-base-metric-mlx | 114,5 M | MLX (safetensors) | apache-2.0 (repo MLX) | Conversion para Apple Silicon, sin reentrenamiento |
| depth-anything/Metric-Video-Depth-Anything-Base | 114,5 M | PyTorch | cc-by-nc-4.0 | Modelo original de ByteDance, requiere GPU NVIDIA |
| Depth Anything V2 (monocular) | 25 M a 1.3 B | PyTorch | cc-by-nc-4.0 | Estimacion de profundidad por imagen, sin consistencia temporal |

La comparativa se limita a aspectos de formato y licencia, ya que no se dispone de datos de rendimiento cuantitativos para este modelo MLX frente a sus alternativas. El modelo original en PyTorch es la referencia directa, pero su licencia restringe el uso comercial, mientras que la conversion MLX declara apache-2.0, aunque esta discrepancia deberia verificarse legalmente.

## Limitaciones y advertencias

- La licencia del modelo original (depth-anything/Metric-Video-Depth-Anything-Base) es cc-by-nc-4.0, que prohibe el uso comercial. Aunque el repositorio MLX indica apache-2.0, la conversion podria no estar autorizada para fines comerciales si el modelo base no lo permite. Se recomienda revisar los terminos de la licencia original antes de usar el modelo en produccion.
- No se han documentado sesgos especificos, pero al ser un modelo entrenado con datos de video, puede presentar errores en condiciones de iluminacion extrema, superficies reflectantes o texturas ambiguas, donde la profundidad es dificil de estimar.
- Riesgo de alucinacion en profundidad: en regiones sin informacion visual clara (por ejemplo, cielos uniformes o paredes sin textura), el modelo puede producir valores de profundidad incorrectos.
- Limitaciones de contexto: el modelo procesa video, pero no soporta entrada de texto ni otros idiomas. No es un modelo multimodal en el sentido de lenguaje.
- Dependencia de MLX: el modelo solo funciona en hardware Apple Silicon. No es portable a entornos con GPUs NVIDIA o AMD sin una conversion adicional.
- La fecha de creacion del repositorio (2026-08-31) es posterior a la fecha actual, lo que podria indicar un error en los metadatos o un modelo publicado de forma anticipada. Se recomienda verificar la disponibilidad y estabilidad del repositorio.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/jarjoura/video-depth-anything-base-metric-mlx
- Modelo original en HuggingFace: https://huggingface.co/depth-anything/Metric-Video-Depth-Anything-Base
- Repositorio GitHub de Video Depth Anything: https://github.com/DepthAnything/Video-Depth-Anything
- Pagina del proyecto: https://videodepthanything.github.io/
