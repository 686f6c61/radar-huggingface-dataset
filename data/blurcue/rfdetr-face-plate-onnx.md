# BlurCue/rfdetr-face-plate-onnx

## Resumen

RF-DETR Nano for BlurCue es un modelo de detección de objetos exportado a formato ONNX, derivado del modelo RF-DETR Nano de Roboflow. Lo publica el usuario BlurCue en Hugging Face y está orientado específicamente a la redacción de rostros y matrículas en vídeo. El modelo detecta cinco canales entrenados: cara, matrícula, bicicleta, persona y vehículo, aunque el uso previsto por el autor se centra en los dos primeros para tareas de anonimización.

Se distribuye como un único grafo ONNX de tipo "box-only", es decir, que emite únicamente cajas delimitadoras sin puntuaciones de máscara ni salidas de segmentación. La entrada es una imagen RGB de 384 × 384 píxeles y el preprocesado y decodificado de las salidas se documentan en el fichero `pack/manifest.toml` del propio repositorio, no en la model card.

El modelo es relevante para pipelines de redacción automática porque combina un detector DETR de bajo coste computacional con un formato de despliegue portable (ONNX), lo que permite integrarlo en aplicaciones de edición de vídeo sin depender del framework de entrenamiento original. El repositorio ocupa aproximadamente 0,1 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de detección de objetos (RF-DETR Nano, exportado a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 384 × 384 RGB) |
| Tipos de cuantizacion | no disponible (se distribuye como grafo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafo único, salida box-only) |

## Arquitectura y entrenamiento

El modelo se basa en RF-DETR Nano de Roboflow, un detector de objetos con arquitectura transformer basada en el paradigma DETR (Detection Transformer), que sustituye los componentes clásicos de detección (anclas, NMS) por un decodificador con consultas aprendidas. La variante Nano es la de menor tamaño de la familia RF-DETR, pensada para inferencia en tiempo real o en hardware limitado. La exportación a ONNX fija la entrada en una sola imagen RGB de 384 × 384 píxeles.

La model card indica que se trata de un modelo "project-trained", es decir, ajustado sobre un conjunto de datos propio del proyecto BlurCue, y que cubre cinco canales: cara, matrícula, bicicleta, persona y vehículo. No se especifican el número de tokens ni la composición del dataset de entrenamiento, ni si se aplicaron técnicas de RLHF/DPO (no aplicables en un detector de objetos). El autor incluye un hash SHA-256 del grafo (`b724d1bff02165258e7e875ff4fbbec2761541662fcf69b37e95318e4693fc77`) para verificación de integridad del artefacto.

## Capacidades

- Detección de objetos en imágenes RGB de 384 × 384 píxeles, con salida de cajas delimitadoras.
- Detección de rostros (canal "face"), orientada a redacción de caras en vídeo.
- Detección de matrículas (canal "plate"), orientada a redacción de placas de vehículos.
- Detección de personas, vehículos y bicicletas como canales adicionales entrenados.
- Salida "box-only": no produce máscaras de segmentación ni clases con puntuaciones de máscara.
- Despliegue portable mediante ONNX Runtime u otros runtimes compatibles con ONNX.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingües ni de generación de texto.

## Casos de uso

- Redacción automática de rostros en vídeo: el modelo detecta caras en cada fotograma y el pipeline de postprocesado aplica desenfoque o pixelado sobre las cajas devueltas, lo que permite anonimizar material audiovisual antes de su publicación.
- Redacción de matrículas en grabaciones de tráfico o videovigilancia: el canal "plate" permite localizar placas y ocultarlas para cumplir requisitos de privacidad en la difusión de imágenes.
- Preprocesado en pipelines de edición de vídeo: al ser un grafo ONNX de entrada fija (384 × 384), se puede integrar en herramientas de edición o en servidores de transcodificación que redimensionen fotogramas antes de la inferencia.
- Anonimización por lotes en archivos de vídeo: el modelo puede ejecutarse sobre fotogramas muestreados para generar listas de cajas que después se aplican con interpolación temporal, reduciendo el coste frente a la detección fotograma a fotograma.
- Detección auxiliar de personas y vehículos: los canales adicionales permiten reutilizar el mismo grafo para tareas de conteo o seguimiento aproximado en escenas urbanas, sin necesidad de un segundo modelo.
- Despliegue en entornos con requisitos de portabilidad: al distribuirse como ONNX, puede ejecutarse en CPU o GPU a través de ONNX Runtime, lo que facilita su integración en aplicaciones de escritorio o servicios sin dependencias del framework de entrenamiento.
- Verificación de integridad en producción: el hash SHA-256 publicado permite comprobar que el grafo desplegado coincide con el artefacto original antes de usarlo en un pipeline de redacción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un modelo Nano con entrada de 384 × 384 y exportación ONNX, se espera un consumo reducido, pero no se documentan cifras.
- GPU recomendadas: no disponible. No se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por el tamaño del repositorio (0,1 GB) y la variante Nano, es plausible que quepa en GPU de consumo, pero no se aportan datos que lo verifiquen.
- Opciones de despliegue: ONNX Runtime (CPU o GPU) es el runtime natural para el formato distribuido; no se documentan otras opciones como TensorRT, OpenVINO o TGI.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia por fotograma ni de FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RF-DETR Nano for BlurCue | no disponible | Imagen 384 × 384 RGB | no disponible | Apache 2.0 | ONNX en Hugging Face |
| RF-DETR Nano (Roboflow, original) | no disponible | Imagen (resolución configurable) | no disponible en la información proporcionada | no disponible en la información proporcionada | Repositorio de Roboflow |
| Otros detectores DETR de tamano Nano | no disponible | Imagen | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo de visión sin capacidades de lenguaje: no genera texto, no razona y no soporta tool calling; cualquier uso conversacional queda fuera de su alcance.
- Salida exclusivamente de cajas: no proporciona máscaras ni segmentación, lo que limita la precisión en la delimitación de rostros o matrículas en escenas con oclusiones.
- Entrada fija de 384 × 384: el pipeline debe redimensionar los fotogramas, lo que puede degradar la detección de objetos pequeños como matrículas lejanas.
- Entrenamiento específico del proyecto: los cinco canales (cara, matrícula, bicicleta, persona, vehículo) reflejan la distribución de datos de BlurCue; el rendimiento fuera de ese dominio no está documentado.
- El autor advierte explícitamente de que se revisen las detecciones antes de exportar el vídeo redactado, lo que indica que pueden producirse falsos negativos o falsos positivos.
- No se documentan sesgos demográficos, de iluminación ni de condiciones meteorológicas; no hay información sobre el dataset de entrenamiento que permita evaluarlos.
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí de detecciones espurias o ausencias en escenas no representadas en el entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías sobre el modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.
- No se especifican requisitos de versión de ONNX Runtime ni de opset, lo que puede complicar la integración en entornos con versiones antiguas.

## Enlaces

- Hugging Face: https://huggingface.co/BlurCue/rfdetr-face-plate-onnx
- RF-DETR de Roboflow (modelo base): no disponible en la información proporcionada
- Paper de RF-DETR: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
