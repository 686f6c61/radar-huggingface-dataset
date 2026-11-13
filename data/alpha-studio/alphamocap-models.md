# alpha-studio/alphamocap-models

## Resumen

AlphaMocap model pack es un repositorio de modelos ONNX empaquetados por alpha-studio para alimentar AlphaMocap, una herramienta de captura de movimiento que convierte un video de una persona en movimiento corporal. No se trata de un modelo único ni de un modelo de lenguaje: es una colección de detectores, estimadores de pose y regresores de movimiento, muchos de ellos exportados o modificados para funcionar sin PyTorch sobre ONNX Runtime con GPU NVIDIA. El repositorio ocupa 13,1 GB y esta pensado para ser descargado por el instalador de AlphaMocap.

Los componentes principales son un detector de personas YOLOX-X (OpenMMLab/MMPose), un modelo de pose de 77 keypoints GEM-X de NVIDIA, un regresor de movimiento GEM-X con cabeza de contacto, SAM 3D Body de Meta con el modelo corporal MHR, un decodificador de manos y un conjunto de modelos faciales de MediaPipe (detector, landmarks, blendshapes ARKit y malla facial). Cada archivo conserva su licencia original, y el autor advierte explicitamente que estos modelos no son suyos y que no tienen utilidad fuera del solver de AlphaMocap sin su codigo.

La relevancia de este repositorio es practica: agrupa en un solo paquete los artefactos de inferencia necesarios para un pipeline completo de mocap monocular (deteccion, pose 2D/3D, manos, cara y regresion de movimiento), con pesos ya convertidos a ONNX y estadisticas de decodificacion. No es un modelo para generar texto ni para tareas de NLP, por lo que las secciones de esta ficha se adaptan a su naturaleza de pack de vision por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion heterogenea: YOLOX-X (detector), GEM-X (pose y regresor de movimiento), SAM 3D Body con MHR, MediaPipe Face Landmarker; todos exportados a ONNX |
| Parametros totales | no disponible (repositorio de 13,1 GB con multiples modelos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en ONNX (algunos con ficheros `.data` asociados) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | multiple: `alphamocap-model-pack` para el empaquetado, Apache-2.0 (YOLOX, MediaPipe, `videomocap.bin`), NVIDIA Open Model License (GEM-X), SAM License (SAM 3D Body) y Apache-2.0 para MHR |
| Formato de pesos | ONNX (`.onnx` + `.data`), mas `videomocap.bin` y `face_mesh.bin`; `manifest.json` con tamanos y SHA-256 |

## Arquitectura y entrenamiento

El pack no entrena ningun modelo propio: reutiliza y reempaqueta trabajos de terceros. `yolox.onnx` es el detector de personas YOLOX-X tal como lo distribuye el SDK RTMPose de MMPose, y `yolox_raw.onnx` es el mismo detector truncado antes de la supresion de no maximos (cajas y puntuaciones), pensado para captura en vivo. `vitpose.onnx` es el modelo de pose GEM-X de 77 keypoints de NVIDIA con los pesos reguardados en un unico fichero, y `gem.onnx` es el regresor de movimiento GEM-X con su cabeza de contacto restaurada. `sam3d.onnx` exporta SAM 3D Body completo hasta su token de pose y sus 70 keypoints (3D y 2D), con el modelo corporal MHR incluido; `sam3d_hand.onnx` es el decodificador de manos del mismo modelo.

El resto del pack son artefactos auxiliares: `videomocap.bin` contiene estadisticas del decodificador, esqueleto y modelo de esqueleto en reposo, derivados de GEM-X y NVIDIA SOMA; los ficheros `face_detector.onnx`, `face_landmarks.onnx`, `face_blendshapes.onnx` y `face_mesh.bin` son la conversion desde TFLite del MediaPipe Face Landmarker de Google, que aporta detector facial, landmarks, los 52 pesos de expresion ARKit y la malla facial canonica. No se documentan tokens de entrenamiento, composicion de dataset ni fases de RLHF/DPO, porque son modelos preentrenados por sus autores originales.

## Capacidades

- Deteccion de personas en imagen mediante YOLOX-X, con variante truncada (`yolox_raw`) que devuelve cajas y puntuaciones antes de NMS para captura en tiempo real.
- Estimacion de pose corporal de 77 keypoints con GEM-X (`vitpose`).
- Regresion de movimiento corporal con cabeza de contacto a partir de la pose (`gem`).
- Reconstruccion 3D del cuerpo con SAM 3D Body: token de pose y 70 keypoints en 2D y 3D, con el modelo corporal MHR integrado.
- Decodificacion de manos a partir de un recorte de la mano (`sam3d_hand`).
- Deteccion facial, landmarks faciales, 52 blendshapes de expresion ARKit y malla facial canonica (MediaPipe Face Landmarker).
- Salida de esqueleto y estadisticas de decodificacion para animacion (`videomocap.bin`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Captura de movimiento monocular para animacion 3D: el pipeline completo (deteccion, pose, regresion y esqueleto) convierte un video de una persona en movimiento corporal utilizable en Blender, que es precisamente el flujo para el que se empaqueta.
- Animacion de avatares en tiempo real: `yolox_raw.onnx` evita el NMS y entrega cajas y puntuaciones directamente, lo que reduce latencia en captura en vivo sobre GPU NVIDIA.
- Reconstruccion corporal 3D: `sam3d.onnx` aporta 70 keypoints 2D y 3D y el modelo MHR, adecuado para generar mallas o esqueletos con profundidad a partir de una sola camara.
- Captura de manos y dedos: `sam3d_hand.onnx` decodifica un recorte de mano a sus keypoints, util para gestos finos en animacion facial y de manos.
- Animacion facial y expresiones: los modelos de MediaPipe permiten obtener los 52 blendshapes ARKit y la malla facial para animar rostros en motores de juego o produccion audiovisual.
- Previsualizacion y prototipado en pipelines de VFX: al estar en ONNX y ejecutarse con ONNX Runtime, se pueden integrar en herramientas propias o en Blender sin depender de PyTorch.
- Investigacion en vision por computador: sirve como referencia de pesos exportados (YOLOX, GEM-X, SAM 3D Body, MediaPipe) para comparar o reutilizar componentes de forma aislada, respetando cada licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el pack completo ocupa 13,1 GB en disco y los requisitos dependen de que modelos se carguen simultaneamente.
- GPU recomendadas: NVIDIA, ya que el autor indica que los ficheros se ejecutan con ONNX Runtime sobre GPU NVIDIA; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no disponible; no se documenta si cabe en tarjetas consumer ni en cuales.
- Opciones de despliegue: ONNX Runtime con GPU NVIDIA; el pack esta disenado para el solver de AlphaMocap y no se documenta su uso con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AlphaMocap model pack | Pack ONNX de mocap monocular | no disponible | no aplica | Multiple (Apache-2.0, NVIDIA Open Model License, SAM License) | Hugging Face, 13,1 GB |
| MMPose RTMPose SDK (YOLOX-X) | Detector de personas | no disponible | no aplica | Apache-2.0 | OpenMMLab |
| NVIDIA GEM-X | Pose y regresion de movimiento | no disponible | no aplica | NVIDIA Open Model License | Hugging Face (nvidia/GEM-X) |
| Meta SAM 3D Body | Reconstruccion corporal 3D | no disponible | no aplica | SAM License; MHR Apache-2.0 | GitHub (facebookresearch/sam-3d-body) |
| Google MediaPipe Face Landmarker | Deteccion y landmarks faciales | no disponible | no aplica | Apache-2.0 | Google AI Edge |

## Limitaciones y advertencias

- El autor advierte que estos modelos no son suyos y que no sirven para nada fuera del solver de AlphaMocap sin su codigo; no se documenta una API publica independiente.
- Licencias multiples y restrictivas: la SAM License prohibe el uso con fines militares y somete el uso a controles de comercio; la NVIDIA Open Model License y la licencia `alphamocap-model-pack` tienen sus propios terminos que deben leerse en `LICENSES/` antes de usar cualquier fichero por separado.
- No hay informacion sobre sesgos, tasas de alucinacion o errores de estimacion; al ser modelos de vision, los riesgos se refieren a fallos de deteccion y pose (oclusiones, poses extremas, iluminacion), no documentados aqui.
- Dependencia de GPU NVIDIA y de ONNX Runtime: no se documenta soporte para CPU, AMD, Apple Silicon ni otros aceleradores.
- No es un modelo de lenguaje: no soporta contexto textual, tool calling, agentes ni capacidades multilingues; cualquier uso en esos ambitos queda fuera de su proposito.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se han publicado benchmarks ni metricas de latencia o precision.

## Enlaces

- Hugging Face: https://huggingface.co/alpha-studio/alphamocap-models
- Licencias del pack: https://huggingface.co/alpha-studio/alphamocap-models/blob/main/LICENSES/NOTICE.txt
- NVIDIA GEM-X: https://huggingface.co/nvidia/GEM-X
- Meta SAM 3D Body: https://github.com/facebookresearch/sam-3d-body
- Google MediaPipe Face Landmarker: https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker
