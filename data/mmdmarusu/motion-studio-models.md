# mmdmarusu/motion-studio-models

## Resumen

Motion Studio Models es un repositorio agregado de pesos ONNX y checkpoints PyTorch que empaqueta los modelos de estimación necesarios para la herramienta Motion Studio, un utilitario que convierte vídeo en animaciones MMD (formato VMD, MikuMikuDance). No se trata de un modelo lingüístico ni de un modelo generativo entrenado por el autor: es una distribución de conveniencia que reúne cuatro componentes de terceros con la misma estructura de carpetas que espera la herramienta en su directorio `models/`.

El repositorio, publicado por el usuario mmdmarusu, contiene el detector de personas YOLOX-m de OpenMMLab, el estimador de pose 2D de 133 keypoints RTMW3D-x (convertido a ONNX), el modelo SAM 3D Body de Meta para reconstrucción 3D de cuerpo y manos, y el código de DINOv3 (sin pesos) que SAM 3D Body utiliza como backbone. El tamaño total del repositorio es de 3,3 GB y la licencia es mixta: cada componente conserva su licencia original (Apache-2.0 para los modelos de OpenMMLab, SAM License para los checkpoints de Meta y DINOv3 License para el código de DINOv3).

Su relevancia es práctica más que investigadora: simplifica el despliegue de un pipeline de captura de movimiento desde vídeo monoculo, permitiendo que la herramienta descargue todos los artefactos desde un único endpoint de Hugging Face mediante su script `library.bat`. No hay información sobre arquitecturas propias, datos de entrenamiento ni benchmarks en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline heterogéneo: YOLOX-m (detección), RTMW3D-x (pose 2D, 133 keypoints), SAM 3D Body con backbone DINOv3 (reconstrucción 3D de cuerpo y manos) |
| Parametros totales | no disponible (no se especifican recuentos por componente) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelos de visión, no procesan texto) |
| Tipos de cuantizacion | no disponible; los artefactos se distribuyen en ONNX (YOLOX-m, RTMW3D-x) y checkpoint PyTorch (SAM 3D Body) sin cuantización declarada |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la model card está en japonés) |
| Licencia | mixta: Apache-2.0 (rtmlib/YOLOX-m, RTMW3D-x), SAM License (SAM 3D Body), DINOv3 License (código DINOv3) |
| Formato de pesos | ONNX (`yolox_m_8xb8-300e_humanart-c2c7a14a.onnx`, `rtmw3d-x_8xb64_cocktail14-384x288-b0a0eab7_20240626.onnx`), PyTorch checkpoint (`model.ckpt`, `assets/mhr_model.pt`), YAML de configuración (`model_config.yaml`) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo propio: agrega artefactos de inferencia de terceros sin modificar los ficheros originales, según declara el autor. El pipeline subyacente encadena tres etapas. Primero, YOLOX-m, un detector de objetos de la familia YOLOX de OpenMMLab, localiza personas en cada fotograma. Después, RTMW3D-x estima 133 keypoints 2D del cuerpo completo a resolución de entrada 384x288, con un backbone de tipo RTMPose entrenado sobre el conjunto Cocktail14. Por último, SAM 3D Body de Meta, con backbone DINOv3, eleva esa información a una reconstrucción 3D de cuerpo y manos utilizando el modelo corporal MHR (`assets/mhr_model.pt`) y su configuración `model_config.yaml`.

No se dispone de información sobre el número de tokens o imágenes de entrenamiento, la composición exacta de los datasets más allá de las referencias a HumanArt (para YOLOX-m) y Cocktail14 (para RTMW3D-x), ni sobre si se aplicaron etapas de ajuste fino con RLHF o DPO, algo que en cualquier caso no aplica a este tipo de modelos de visión. La innovación técnica relevante no reside en el repositorio en sí, sino en los componentes que distribuye: la combinación de un estimador 2D de 133 keypoints con un reconstructor 3D basado en DINOv3 permite obtener movimiento corporal completo, incluidas manos, a partir de vídeo monoculo.

## Capacidades

- Detección de personas en vídeo o imágenes mediante YOLOX-m, con pesos preentrenados en HumanArt.
- Estimación de pose 2D con 133 keypoints (cuerpo completo, manos y rostro) mediante RTMW3D-x en formato ONNX.
- Reconstrucción 3D de cuerpo y manos con SAM 3D Body, incluyendo el modelo corporal MHR.
- Extracción de movimiento compatible con el formato VMD de MikuMikuDance a través de la herramienta Motion Studio, que consume estos modelos.
- Ejecución en CPU o GPU mediante ONNX Runtime para las etapas 2D y PyTorch para la etapa 3D.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Captura de movimiento desde vídeo para animación MMD: el pipeline detecta a la persona, estima 133 keypoints 2D y reconstruye la pose 3D para generar un fichero VMD que puede cargarse directamente en MikuMikuDance o en herramientas compatibles.
- Prototipado de animación para VTubers y creadores: un único repositorio de 3,3 GB permite montar el pipeline completo sin buscar cada checkpoint por separado, reduciendo el tiempo de configuración inicial.
- Investigación en reconstrucción 3D de cuerpo y manos: SAM 3D Body con DINOv3 puede utilizarse como referencia o baseline para comparar métodos de elevación 2D a 3D en vídeo monoculo.
- Preprocesado de datasets de movimiento: el estimador 2D RTMW3D-x permite anotar automáticamente keypoints en grandes volúmenes de vídeo antes de un entrenamiento posterior.
- Integración en herramientas de escritorio: Motion Studio descarga automáticamente los artefactos desde este repositorio mediante `library.bat` y el fichero `model_repo.txt`, lo que facilita distribuir la aplicación con un instalador ligero.
- Docencia y demostraciones de visión por computador: el repositorio sirve para ilustrar un pipeline completo de detección, pose 2D y reconstrucción 3D con modelos de código abierto y licencias permisivas o condicionadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; el repositorio ocupa 3,3 GB en disco, pero no se desglosa el tamaño de cada checkpoint ni su huella en memoria.
- GPU recomendadas: no especificadas por el autor. Por la naturaleza de los componentes (YOLOX-m y RTMW3D-x en ONNX, SAM 3D Body en PyTorch), se puede ejecutar en GPU de consumo, aunque no hay cifras oficiales.
- Compatibilidad con GPU de consumo: probable, pero no confirmada en la información disponible.
- Opciones de despliegue: ONNX Runtime para los modelos `.onnx` y PyTorch para `model.ckpt`; la herramienta Motion Studio orquesta la ejecución.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Motion Studio Models (este repo) | Agregado de detección + pose 2D + reconstrucción 3D | no disponible | no aplica | Mixta (Apache-2.0, SAM License, DINOv3 License) | Hugging Face, 0 descargas |
| SAM 3D Body (facebook/sam-3d-body-dinov3) | Reconstrucción 3D de cuerpo y manos | no disponible | no aplica | SAM License | Hugging Face, componente individual |
| RTMW3D-x (Soykaf/RTMW3D-x) | Pose 2D de 133 keypoints | no disponible | no aplica | Apache-2.0 | Hugging Face, componente individual |
| MMPose / RTMPose (OpenMMLab) | Familia de estimadores de pose 2D | no disponible | no aplica | Apache-2.0 | GitHub y documentación de OpenMMLab |

La comparativa es estructural: el repositorio agrupa componentes que ya existen por separado, por lo que su ventaja frente a ellos es la conveniencia de despliegue, no un rendimiento superior.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no admite instrucciones en lenguaje natural.
- La licencia es mixta y cada componente impone condiciones distintas; en particular, la SAM License y la DINOv3 License prohíben usos militares o relacionados con armamento y exigen conservar los textos de licencia al redistribuir.
- La SAM License solicita que las publicaciones científicas que usen SAM citen explícitamente su utilización.
- El autor declara que los ficheros no han sido modificados respecto a las distribuciones originales, pero no se aportan hashes ni verificaciones de integridad en la información disponible.
- No hay datos de benchmarks, latencia, precisión ni robustez frente a oclusiones, múltiples personas o ángulos difíciles.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni de validación por la comunidad.
- La model card está redactada en japonés y no documenta limitaciones técnicas del pipeline.
- El uso comercial está sujeto a la licencia de cada componente; conviene revisar la SAM License y la DINOv3 License antes de integrar el repositorio en un producto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mmdmarusu/motion-studio-models
- SAM 3D Body (Meta): https://huggingface.co/facebook/sam-3d-body-dinov3
- DINOv3 (Meta): https://github.com/facebookresearch/dinov3
- RTMW3D-x (conversión ONNX): https://huggingface.co/Soykaf/RTMW3D-x
- OpenMMLab (rtmlib, YOLOX, RTMPose): no se proporciona URL específica en la información disponible
