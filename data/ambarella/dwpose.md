# Ambarella/DWPose

## Resumen

DWPose es un framework de estimacion de pose humana de cuerpo completo (whole-body pose estimation) que detecta de forma unificada keypoints de cuerpo, rostro, manos y pies. Fue desarrollado originalmente por el grupo IDEA-Research (paper "Effective Whole-body Pose Estimation with Two-stages Distillation", arXiv:2307.15880) y esta pensado como componente de percepcion centrica de persona en tiempo real. La version publicada en este repositorio de Hugging Face corresponde a la variante Tiny (DWPose-t) portada y optimizada por Ambarella para sus SoCs de vision (N1-655, X7, CV7, CV72, CV75), con compresion de activaciones en fp16.

El modelo resuelve el problema de obtener poses densas (hasta 133 keypoints en la formulacion whole-body de COCO-WholeBody) con un coste computacional bajo, lo que lo hace adecuado para despliegue en dispositivos embebidos y pipelines de generacion de imagen/video condicionada por pose (por ejemplo, ControlNet). La relevancia actual viene de su uso extendido como preprocesador de pose en flujos de difusion y de su disponibilidad en formato binario compilado para hardware Ambarella, algo poco habitual en modelos de pose publicados en Hugging Face.

La informacion disponible en este repositorio es escasa: no se detallan parametros, contexto (no aplica, es vision), licencia ni idiomas. La model card se limita a describir la arquitectura, la configuracion (resolucion 3x256x192, dataset COCO) y los enlaces a los binarios por dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional para estimacion de pose 2D (top-down, two-stage distillation); variantes Tiny a Large |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, entrada 3x256x192) |
| Tipos de cuantizacion | compresion de activaciones fp16 (Activation_fp16); cuantizacion de pesos no disponible |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | binarios compilados por dispositivo (.bin) para N1-655, X7, CV7, CV72, CV75; pesos originales .pth (PyTorch) referenciados |

## Arquitectura y entrenamiento

DWPose emplea una arquitectura de estimacion de pose top-down con destilacion de conocimiento en dos etapas. La primera etapa destila desde un profesor de cuerpo completo hacia el estudiante, y la segunda refina la cabeza, las manos y los pies mediante destilacion especifica por region. El resultado es un unico modelo que predice keypoints de cuerpo, rostro, manos y pies, superando el enfoque de multiples modelos especializados. La variante publicada aqui es la Tiny (DWPose-t), la mas ligera de la familia, pensada para maximizar velocidad en hardware limitado.

El entrenamiento original se realiza sobre COCO (y COCO-WholeBody para la anotacion whole-body), con resolucion de entrada 3x256x192. En este repositorio no se documentan el numero de tokens de entrenamiento (no aplica), la composicion exacta del dataset ni si hubo etapas de RLHF/DPO (no aplica a vision). La innovacion destacable es la destilacion en dos etapas, que permite que un modelo Tiny alcance precision cercana a variantes mayores con una fraccion del coste. La version de Ambarella anade compilacion para NPU/SoC propietarios con activaciones en fp16.

## Capacidades

- Estimacion de pose 2D de cuerpo completo en una sola pasada: keypoints de cuerpo, rostro, manos y pies.
- Deteccion multi-persona en modo top-down (requiere un detector de personas previo, no incluido en el repositorio).
- Salida de keypoints con coordenadas y scores de confianza, apta para seguimiento temporal (pose tracking) al combinarse con asociacion entre frames.
- Condicionamiento de pose para generacion de imagen y video (por ejemplo, pipelines tipo ControlNet/OpenPose).
- Ejecucion en hardware Ambarella (N1-655, X7, CV7, CV72, CV75) mediante binarios compilados con SDK Cooper 2.5.4 / Foundry 2.3.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual.

## Casos de uso

- Seguimiento de pose en tiempo real en videovigilancia y analitica de personas: el modelo Tiny procesa frames a 256x192 y permite tracking multi-persona al combinarse con un detector y asociacion entre frames, con coste bajo en SoC Ambarella.
- Reconocimiento de gestos y manos para interfaces humano-computador: la prediccion de keypoints de manos y rostro en el mismo modelo evita encadenar estimadores separados.
- Analitica deportiva: extraccion de esqueletos de cuerpo completo para calcular angulos articulares, velocidad de movimiento y postura en videos de entrenamiento.
- Animacion y motion capture: uso de los keypoints como senal de driving para rigs 2D/3D o para retargeting de animaciones a partir de video.
- Preprocesado para generacion de imagen/video condicionada por pose: DWPose se usa habitualmente como extractor de esqueletos en pipelines de difusion para transferir pose de una referencia a una imagen generada.
- Percepcion en dispositivos embebidos: despliegue en camaras inteligentes y drones con SoC Ambarella usando los binarios .bin con activaciones fp16, sin necesidad de GPU dedicada.
- Realidad aumentada y avatares: estimacion de pose de cuerpo completo para superponer avatares o efectos que requieren keypoints de manos y rostro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un modelo Tiny con entrada 3x256x192, la huella de memoria en GPU es muy reducida (tipicamente por debajo de 1 GB en fp16 para inferencia), pero no hay cifras oficiales en el repositorio.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 en adelante) puede ejecutar la variante Tiny con holgura; para despliegue en produccion a gran escala se usarian A100/H100 o T4/L4 en servidores de inferencia.
- Cabe en GPU consumer: si, en la practica totalidad de GPUs consumer actuales, dado el reducido tamano de la variante Tiny.
- Opciones de despliegue: PyTorch (pesos .pth originales), ONNX Runtime y TensorRT para GPUs; en el caso de Ambarella, SDK Cooper 2.5.4 y Cooper Foundry 2.3 con los binarios .bin por dispositivo. No hay soporte documentado para llama.cpp, Ollama, vLLM ni TGI (no son aplicables a un modelo de vision).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Keypoints | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DWPose-t (este repo) | no disponible (variante Tiny) | 3x256x192 | cuerpo, rostro, manos, pies | no disponible | Hugging Face (Ambarella) + pesos originales |
| DWPose original (IDEA-Research) | no disponible (Tiny a Large) | 3x256x192 | cuerpo, rostro, manos, pies | no disponible en esta ficha | GitHub IDEA-Research, Hugging Face yzd-v/DWPose |
| RTMPose | no disponible | variable | cuerpo, rostro, manos | no disponible en esta ficha | MMpose / OpenMMLab |
| OpenPose | no disponible | variable | cuerpo, rostro, manos, pies | no disponible en esta ficha | Repositorio CMU |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Es un modelo de vision: no genera texto, no razona y no soporta instrucciones en lenguaje natural.
- Requiere un detector de personas previo para el modo multi-persona top-down; el repositorio no incluye dicho detector.
- Rendimiento dependiente de la resolucion de entrada (3x256x192); poses muy pequenas, oclusiones severas o escenas con muchas personas pueden degradar la precision.
- Sesgos conocidos no documentados; el entrenamiento sobre COCO puede infrarrepresentar ciertas etnias, edades, vestimentas y condiciones de iluminacion.
- Licencia no disponible: antes de uso comercial es imprescindible verificar la licencia del repositorio y de los pesos originales de DWPose.
- Los binarios .bin estan compilados para SoC Ambarella concretos; no son portables a otras plataformas.
- El repositorio tiene un tamano de 0.0 GB y muy pocas descargas, lo que sugiere que el contenido puede no estar completamente subido o que los binarios se sirven por otra via; conviene verificar la integridad antes de desplegar.
- No hay garantias de mantenimiento ni versionado documentado mas alla de la compatibilidad con Cooper SDK 2.5.4 y Foundry 2.3.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ambarella/DWPose
- Paper: https://arxiv.org/abs/2307.15880
- Codigo oficial DWPose: https://github.com/IDEA-Research/DWPose
- Pesos originales DWPose-Tiny: https://huggingface.co/yzd-v/DWPose/blob/main/dw-tt_ucoco.pth
- Dataset COCO: https://cocodataset.org/#home
- Binario N1-655: https://huggingface.co/Ambarella/DWPose/blob/main/n1-655_dwpose_t_act16.bin
- Binario X7: https://huggingface.co/Ambarella/DWPose/blob/main/x7_dwpose_t_act16.bin
- Binario CV7: https://huggingface.co/Ambarella/DWPose/blob/main/cv7_dwpose_t_act16.bin
- Binario CV72: https://huggingface.co/Ambarella/DWPose/blob/main/cv72_dwpose_t_act16.bin
- Binario CV75: https://huggingface.co/Ambarella/DWPose/blob/main/cv75_dwpose_t_act16.bin
