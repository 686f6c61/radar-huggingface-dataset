# pablovela5620/egohand-fast-trt-sm120

## Resumen

`egohand-fast-trt-sm120` es un repositorio de artefactos precompilados de TensorRT para el stack de estimación de manos `egohand-fast` del proyecto posekit. No se trata de un modelo de lenguaje ni de un modelo fundacional entrenado por el autor, sino de un conjunto de motores (`.engine`) ya compilados junto con sus grafos ONNX de origen, listos para cargarse sin necesidad de recompilar. El autor es `pablovela5620`, vinculado al ecosistema de ejemplos de rerun-io.

El stack integra tres componentes: un detector de manos basado en RT-DETR, un backbone EgoHand DINOv3 cuantizado en NVFP4/FP8 y una cabeza EgoHand para la predicción de poses. Los motores están compilados específicamente para TensorRT 11.2.1.2, CUDA 13.0 y compute capability sm_120 (arquitectura Blackwell), sobre una RTX 5090. Esta especialización lo hace relevante para quienes despliegan percepción de manos en GPUs Blackwell y quieren evitar el coste de compilación y ajuste de precisión.

El repositorio ocupa 2.0 GB e incluye tanto los binarios de los motores como los manifiestos JSON y los grafos ONNX con sus ficheros de datos asociados. Su uso principal documentado es el Space `pablovela5620/egohand-rerun`, orientado a visualización y análisis de vídeo en primera persona con seguimiento de manos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de tres etapas: detector RT-DETR + backbone DINOv3 (EgoHand) + cabeza EgoHand |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | NVFP4 y FP8 en el backbone; motores TensorRT compilados |
| Idiomas soportados | no aplica (entrada de imagen/vídeo) |
| Licencia | no disponible |
| Formato de pesos | TensorRT `.engine` + manifiestos `.engine.json`; grafos `.onnx` y `.onnx.data` |
| Version de TensorRT | 11.2.1.2 |
| Version de CUDA | 13.0 |
| Compute capability | sm_120 (Blackwell) |
| Tamano del repositorio | 2.0 GB |

## Arquitectura y entrenamiento

El stack `egohand-fast` es una cadena de percepción para estimación de pose de manos en imágenes egocéntricas. La primera etapa es un detector de manos RT-DETR, que localiza las regiones de interés. La segunda es un backbone EgoHand basado en DINOv3, cuantizado en NVFP4/FP8 para acelerar la inferencia en hardware Blackwell. La tercera es una cabeza EgoHand que produce la predicción de pose a partir de las características extraídas.

Los artefactos se generaron con la herramienta `trtkit` a partir del repositorio `rerun-io/examples-monorepo` en el commit `3cf645894`, compilados sobre una RTX 5090. Cada motor va acompañado de un manifiesto `.engine.json`, y los ficheros ONNX permiten reconstruir el motor si es necesario, ya que `trtkit` indexa el motor por el hash de dichos grafos. No se dispone de información sobre el dataset de entrenamiento, el número de tokens o imágenes, ni sobre si se aplicaron técnicas de ajuste fino o destilación.

## Capacidades

- Detección de manos en imágenes, mediante el detector RT-DETR integrado en el stack.
- Estimación de pose de manos (landmarks) a partir de las regiones detectadas, con la cabeza EgoHand.
- Extracción de características visuales con backbone DINOv3 adaptado a dominio egocéntrico (EgoHand).
- Inferencia acelerada en GPUs Blackwell gracias a la compilación TensorRT con precisión NVFP4/FP8.
- Carga directa sin recompilación si los ficheros se colocan en `TRTKIT_TRT_CACHE` (por defecto `~/.cache/trtkit/trt`).
- Integración con el ecosistema rerun para visualización de resultados, según el Space asociado.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Análisis de vídeo egocéntrico en investigación: el stack procesa fotogramas de cámaras en primera persona para extraer poses de manos, adecuado para estudios de interacción manual y manipulación de objetos.
- Prototipado de interfaces gestuales: la detección y el tracking de manos permiten construir demos de control por gestos en tiempo real sobre una RTX 5090, aprovechando los motores precompilados.
- Visualización con rerun: el Space `egohand-rerun` usa estos motores para registrar detecciones y poses en el visor de rerun, útil para depurar pipelines de percepción.
- Evaluación de cuantización NVFP4/FP8: sirve como referencia para medir la pérdida de precisión del backbone DINOv3 al pasar a baja precisión en Blackwell.
- Despliegue en entornos con GPUs Blackwell: al evitar la compilación de TensorRT, reduce el tiempo de puesta en marcha en máquinas con sm_120.
- Benchmarking de latencia de un pipeline de tres etapas: permite medir el coste de detector, backbone y cabeza por separado usando los manifiestos y motores incluidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU con compute capability sm_120 (Blackwell); el autor indica que en otro modelo sm_120 TensorRT avisa de que el plan se compiló en un dispositivo distinto.
- Compilado y validado en una RTX 5090; no se documentan otras GPUs probadas.
- VRAM estimada: no disponible (el repositorio pesa 2.0 GB, pero no se detalla el consumo en ejecución).
- No es compatible con GPUs de arquitecturas anteriores (Ampere, Ada, Hopper) sin recompilar los motores.
- Despliegue mediante TensorRT 11.2.1.2 y CUDA 13.0, cargando los motores desde `TRTKIT_TRT_CACHE`.
- Alternativa de recompilación a partir de los ficheros `.onnx` y `.onnx.data` con `trtkit`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros stacks de estimación de manos comparables ni métricas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Especialización de hardware: los motores solo son válidos para sm_120; en otras GPUs es necesario recompilar desde los ONNX.
- Aviso de TensorRT al cargar en un modelo de GPU sm_120 distinto del usado para compilar (RTX 5090); puede afectar al rendimiento o a la estabilidad.
- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor y a los proyectos de origen.
- Sin información sobre sesgos, tasas de alucinación o precisión del modelo; no hay métricas publicadas.
- Dependencia de versiones concretas de TensorRT y CUDA; mezclar versiones puede invalidar los motores.
- El repositorio contiene artefactos binarios de 2.0 GB, lo que complica su distribución y versionado.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento multi-paso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pablovela5620/egohand-fast-trt-sm120
- Space asociado: https://huggingface.co/spaces/pablovela5620/egohand-rerun
- Repositorio de origen del stack: https://github.com/rerun-io/examples-monorepo (commit `3cf645894`)
