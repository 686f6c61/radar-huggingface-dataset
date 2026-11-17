# qhddz/yolo26-pose-rknn3-rk1828

## Resumen

YOLO26 Pose (RKNN3 / RK1828) es un conjunto de modelos de estimación de pose humana derivados de Ultralytics YOLO26, convertidos al formato RKNN3 para su ejecución sobre la NPU del SoC Rockchip RK1828. El repositorio, publicado por el usuario qhddz, incluye las variantes n, s y m del modelo en cuantización int8 y fp16, junto con un demo precompilado para host x86_64 conectado por PCIe. El modelo resuelve la detección de personas y la extracción de 17 keypoints por instancia en un único pase.

La relevancia del artefacto es práctica: no se trata de un modelo entrenado desde cero, sino de un paquete listo para desplegar en hardware de borde con NPU. El autor indica que los ficheros `.rknn` se convirtieron con los pipelines oficiales de `rknn3-model-zoo` y se verificaron en hardware RK1828 real, de modo que el usuario no necesita compilar ni convertir nada. Esto elimina una de las fricciones habituales del despliegue en NPU, donde la cadena de conversión suele ser específica de cada versión de toolkit.

La información publicada es escasa: no se detallan parámetros, contexto, composición del dataset de entrenamiento ni resultados de benchmarks más allá de una medición de latencia y confianza sobre una imagen de muestra. La licencia AGPL-3.0, heredada de Ultralytics, es un factor determinante para cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de detección y estimación de pose (Ultralytics YOLO26 pose), cabecera de persona + 17 keypoints |
| Parametros totales | no disponible (variantes n, s y m; recuento no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | int8 (`i8`) y fp16 |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.rknn` + fichero `.weight` (RKNN3) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Ultralytics YOLO26 en su variante de pose, una red convolucional de una sola etapa que predice simultáneamente cajas de persona y 17 keypoints por instancia. El repositorio no aporta detalles sobre el backbone, la composición del dataset de entrenamiento, el número de tokens o imágenes vistas, ni sobre si hubo fases de ajuste fino específicas. Toda esa información debe consultarse en la documentación de Ultralytics, no en esta model card.

La innovación relevante de este paquete no está en el modelo sino en el pipeline de despliegue: la conversión a RKNN3 mediante `rknn3-model_zoo` y la verificación en silicio RK1828. Se incluyen además las librerías de runtime y un demo C++ para x86_64 que se comunica con la NPU a través de PCIe, lo que permite probar el modelo desde un host convencional sin integrar previamente el SDK en la placa objetivo.

## Capacidades

- Detección de personas en imagen: devuelve cajas delimitadoras con puntuación de confianza.
- Estimación de pose: 17 keypoints por persona detectada, en el esquema estándar de COCO.
- Ejecución sobre NPU Rockchip RK1828 mediante RKNN3.
- Variantes de tamaño n, s y m para ajustar el compromiso entre latencia y precisión.
- Cuantización int8 para máximo rendimiento y fp16 para mayor fidelidad numérica.
- Inferencia por fotograma individual a través del demo C++ incluido; no se documenta soporte de vídeo en streaming ni de procesamiento por lotes.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modalities de texto, audio o vídeo más allá del fotograma de entrada.

## Casos de uso

- Análisis de postura en gimnasios y entrenamiento: el modelo entrega 17 keypoints por persona, suficientes para calcular ángulos articulares y detectar compensaciones en ejercicios; la variante int8 mantiene latencias compatibles con corrección en tiempo real.
- Control de aforo y seguridad en espacios: la detección de personas con confianza 0.929 medida en la imagen de muestra permite contar ocupantes y filtrar detecciones espurias antes de enviar alertas.
- Videovigilancia en borde: al ejecutarse en la NPU del RK1828 sin depender de la nube, el flujo de vídeo no sale del dispositivo, lo que simplifica el cumplimiento de protección de datos.
- Robótica e interacción humano-robot: la pose estimada sirve para que un brazo o una plataforma móvil ajuste su comportamiento a la posición de la persona; la variante n reduce la latencia a costa de precisión.
- Rehabilitación y seguimiento clínico: la extracción de keypoints permite registrar rangos de movimiento en sesiones grabadas o en directo, con la variante fp16 cuando se prioriza la estabilidad numérica de las articulaciones.
- Prototipado rápido en laboratorio: el demo x86_64 precompilado permite validar el modelo desde un PC con tarjeta RK1828 por PCIe antes de portar la integración a la plataforma final.
- Deporte y análisis de movimiento: el modelo puede alimentar pipelines de biomecánica que calculen trayectorias de extremidades fotograma a fotograma, siempre que se añada la lógica de seguimiento entre frames, que el repositorio no incluye.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Latencia | 152 ms/fotograma | yolo26m-pose int8 sobre RK1828 |
| Confianza de persona | 0.929 | Imagen de muestra `little_boy.jpg` |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni métricas estándar de pose como AP de keypoints en COCO. Los dos datos de la tabla son los únicos medidos y reportados por el autor.

## Requisitos de hardware

- NPU objetivo: Rockchip RK1828 con soporte RKNN3. No se documenta compatibilidad con otras NPU de Rockchip ni con versiones anteriores del toolkit.
- Host de desarrollo: x86_64 con conexión PCIe a la tarjeta RK1828, según el demo incluido.
- VRAM: no disponible; el modelo se ejecuta sobre la memoria de la NPU, no sobre VRAM de GPU convencional.
- GPU: no aplica. El paquete no incluye pesos en formatos ejecutables por CUDA (safetensors, GGUF, ONNX) y no se indica que se puedan obtener desde este repositorio.
- GPU de consumo: no aplica por el mismo motivo; para ejecutar YOLO26 pose en una RTX sería necesario obtener los pesos originales de Ultralytics y exportarlos por otra vía.
- Despliegue: runtime RKNN3 y demo C++ incluidos en `demo_x86_64.tar.gz`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de visión de este tipo.
- Latencia: 152 ms/fotograma para la variante m en int8, equivalente a unos 6.6 FPS en ese modelo concreto. No se publican cifras para las variantes n y s ni para fp16.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| YOLO26 pose (este repo) | no disponible (n/s/m) | Imagen | RKNN3 | AGPL-3.0 | Verificado en RK1828; 152 ms/frame en variante m int8 |
| YOLO11 pose (Ultralytics) | no disponible | Imagen | PyTorch, ONNX, TensorRT | AGPL-3.0 | Referencia upstream de la familia; requiere conversión propia a NPU |
| MediaPipe Pose | no disponible | Imagen | TFLite | Apache-2.0 | Orientado a dispositivos móviles; esquema de keypoints distinto |
| RTMPose (MMPose) | no disponible | Imagen | ONNX, TensorRT | Apache-2.0 | Familia de estimadores de pose con variantes ligeras para borde |

La comparación es cualitativa: no se dispone de métricas de precisión de este paquete frente a las alternativas, por lo que no es posible establecer un ranking de exactitud. La ventaja diferencial del repositorio es la disponibilidad inmediata en formato RKNN3 para RK1828; la desventaja, la licencia AGPL-3.0 frente a las alternativas Apache-2.0.

## Limitaciones y advertencias

- La licencia AGPL-3.0 de Ultralytics impone obligaciones de liberación del código fuente a quien distribuya o exponga por red un servicio basado en el modelo; es un obstáculo serio para productos comerciales cerrados.
- El repositorio solo contiene pesos en formato RKNN3; no se ofrecen safetensors, ONNX ni GGUF, lo que limita la portabilidad a otros aceleradores.
- No se publican métricas de precisión (AP de keypoints, mAP de personas) ni el comportamiento en escenas con oclusiones, multitud o poses atípicas.
- El modelo está entrenado para el esquema de 17 keypoints de COCO; no cubre keypoints faciales finos ni de manos.
- La única medición de latencia corresponde a la variante m en int8; las variantes n, s y fp16 no tienen cifras publicadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de validación por parte de la comunidad.
- No se documentan sesgos demográficos ni el equilibrio del dataset de entrenamiento original.
- El demo incluido se distribuye como tarball porque Hugging Face no permite ejecutables directos; conviene verificar su integridad antes de ejecutarlo.
- No se especifica la versión del toolkit RKNN3 ni del firmware RK1828 necesarios, lo que puede provocar incompatibilidades con instalaciones distintas a la del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qhddz/yolo26-pose-rknn3-rk1828
- Repositorio oficial de conversión: https://github.com/airockchip/rknn3_model_zoo
- Ultralytics (modelo upstream y licencia): https://github.com/ultralytics/ultralytics
- Documentación de Ultralytics sobre pose: https://docs.ultralytics.com/tasks/pose/
