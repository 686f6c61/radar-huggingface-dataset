# lightcella/face-pipeline-ncnn

## Resumen

Lightcella Face Models (ncnn) es un paquete de pesos convertidos al formato ncnn que reúne tres modelos independientes para un pipeline completo de análisis facial: detección de rostros (YuNet), estimación de 478 landmarks faciales 3D (MediaPipe Face Mesh) y extracción de embeddings faciales de 512 dimensiones (GhostFaceNet). Lo publica el usuario lightcella en Hugging Face y no entrena ningún modelo propio: se trata exclusivamente de conversiones de formato de pesos con licencias permisivas, validadas contra sus referencias ONNX en onnxruntime.

El objetivo es el despliegue en dispositivos de baja potencia, como una Raspberry Pi 4 o un NAS, donde ncnn ofrece inferencia eficiente en CPU sin dependencias de CUDA. Los tres modelos suman apenas unos 13 MB en disco (0,22 MB el detector, 4,8 MB el refiner de landmarks y 8,1 MB el embedder), lo que permite ejecutar el pipeline completo en memoria de un dispositivo embebido.

Es relevante para desarrolladores que necesitan reconocimiento facial on-device con licencias permisivas (dos MIT y una Apache-2.0) y sin depender de frameworks pesados. La ficha se limita a describir lo que la model card documenta; no hay información sobre idiomas, benchmarks ni parámetros de entrenamiento más allá de la procedencia de cada componente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de tres modelos CNN independientes: YuNet (detección), MediaPipe Face Mesh (landmarks) y GhostFaceNet W1.3 S2 (embeddings) |
| Parametros totales | no disponible (solo se indica el tamano en disco de cada componente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de visión, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ncnn; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica, es un pipeline de visión) |
| Licencia | other (mixed-permissive): YuNet MIT, Face Mesh Apache-2.0, GhostFaceNet MIT; mapa en LICENSE.md |
| Formato de pesos | ncnn (.param y .bin) |

## Arquitectura y entrenamiento

El repositorio no contiene modelos entrenados por el autor, sino conversiones de formato. YuNet es un detector facial de OpenCV Zoo (© 2020 Shiqi Yu) con salidas de clasificación, objectness, bounding box y keypoints en strides 8, 16 y 32 sobre una entrada RGB de 640×640. MediaPipe Face Mesh (Google, `face_landmarker.task`, 2023-05-03) produce 478 landmarks 3D más una puntuación de presencia a partir de un recorte facial RGB de 256×256. GhostFaceNet W1.3 S2 (HamadYA, ArcFace) genera un embedding de 512 dimensiones desde una cara RGB alineada de 112×112.

Las conversiones se realizaron con tf2onnx, onnxsim y pnnx, y el detector y el refiner se validaron contra su referencia ONNX en onnxruntime. Los artefactos originales, fijados con SHA-256, están archivados en `lightcella/face-pipeline-sources`. Los nombres de los blobs siguen la convención de pnnx (`in0` / `out0…`). No se documenta ningún proceso de entrenamiento, ajuste fino ni RLHF, ya que no se ha reentrenado nada.

## Capacidades

- Detección de rostros en imágenes RGB de 640×640 con cajas, puntuaciones y keypoints faciales (YuNet).
- Estimación de 478 landmarks faciales 3D y puntuación de presencia sobre recortes de 256×256 (Face Mesh).
- Extracción de embeddings faciales de 512 dimensiones para reconocimiento o verificación de identidad (GhostFaceNet).
- Inferencia en CPU mediante ncnn, orientada a hardware de baja potencia (Raspberry Pi 4, NAS).
- Pipeline completo encadenable: detección, recorte y alineación, landmarks y embedding.
- No soporta tool calling, agentes, generación de texto, razonamiento ni capacidades multilingües: es un conjunto de modelos de visión.

## Casos de uso

- Control de acceso en dispositivos embebidos: el pipeline completo (detección con YuNet, alineación y embedding con GhostFaceNet) cabe en unos 13 MB y puede ejecutarse en una Raspberry Pi 4 para verificar identidades sin enviar imágenes a la nube.
- Reconocimiento facial en un NAS doméstico: ncnn permite procesar lotes de fotografías en CPU y agrupar caras por similitud de embeddings de 512 dimensiones sin GPU dedicada.
- Etiquetado automático de fotos: Face Mesh aporta 478 landmarks que permiten recortar y alinear rostros antes de generar embeddings, mejorando la agrupación por persona.
- Anonimización de vídeo o imagen: la detección de YuNet localiza caras para aplicar desenfoque o pixelado en tiempo casi real sobre hardware modesto.
- Análisis de expresiones y puntos faciales: los 478 landmarks 3D sirven como entrada para estimación de pose de cabeza, seguimiento de mirada o animación de avatares.
- Verificación de identidad en kioscos o terminales de borde: el embedder de 8,1 MB permite comparar la cara capturada con un embedding de referencia almacenado localmente, con latencia baja en CPU.
- Preprocesado para pipelines de visión mayores: usar YuNet y Face Mesh como etapas de detección y alineación antes de un modelo de reconocimiento o análisis posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que el detector y el refiner se validaron contra su referencia ONNX en onnxruntime, sin cifras de precisión, latencia ni throughput.

## Requisitos de hardware

- VRAM: no aplica; ncnn está pensado para inferencia en CPU. No se documentan requisitos de memoria más allá del tamaño de los pesos (0,22 MB + 4,8 MB + 8,1 MB).
- GPU recomendadas: no disponible. El formato ncnn soporta aceleración Vulkan, pero la model card no documenta configuración de GPU.
- Cabe en hardware consumer y embebido: el autor cita explícitamente Raspberry Pi 4 y NAS como objetivos de despliegue.
- Opciones de despliegue: ncnn (formato nativo de los pesos). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Componentes | Tamano | Formato | Licencia |
|---|---|---|---|---|
| Lightcella Face Models (ncnn) | YuNet + Face Mesh + GhostFaceNet | ~13 MB | ncnn | MIT + Apache-2.0 + MIT |
| OpenCV Zoo face_detection_yunet_2023mar | YuNet (solo detección) | 0,22 MB | ONNX | MIT |
| MediaPipe face_landmarker.task | Face Mesh (solo landmarks) | 4,8 MB (convertido) | task/ONNX | Apache-2.0 |
| HamadYA/GhostFaceNets | GhostFaceNet (solo embeddings) | 8,1 MB (W1.3 S2 convertido) | varios | MIT |

La ventaja diferencial de este repositorio es empaquetar los tres componentes ya convertidos a ncnn con procedencia verificada; los modelos upstream no ofrecen esa conversión lista para ncnn. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: cualquier mejora o corrección debe venir de los proyectos upstream (OpenCV Zoo, MediaPipe, GhostFaceNets).
- Solo se validaron contra ONNX el detector y el refiner; el embedder no se menciona como validado en la model card.
- La licencia del repositorio es `other` (mixed-permissive) porque combina dos MIT y una Apache-2.0; es imprescindible revisar LICENSE.md y las licencias de cada subdirectorio antes de uso comercial.
- El reconocimiento facial está sujeto a regulación específica (RGPD, AI Act) en la Unión Europea; el uso en producción requiere base legal y evaluación de impacto.
- Riesgo de sesgo: no se documenta la composición demográfica de los datos de entrenamiento de los modelos upstream, por lo que el rendimiento puede variar según etnia, edad o condiciones de iluminación.
- El pipeline requiere alineación y recorte correctos; errores en la detección degradan los embeddings.
- No hay información sobre idiomas, benchmarks ni latencia, lo que limita la evaluación previa a un despliegue en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lightcella/face-pipeline-ncnn
- Fuentes archivadas con SHA-256: https://huggingface.co/lightcella/face-pipeline-sources
- ncnn (Tencent): https://github.com/Tencent/ncnn
- OpenCV Zoo, face_detection_yunet: https://github.com/opencv/opencv_zoo/tree/main/models/face_detection_yunet
- GhostFaceNets (HamadYA): https://github.com/HamadYA/GhostFaceNets
