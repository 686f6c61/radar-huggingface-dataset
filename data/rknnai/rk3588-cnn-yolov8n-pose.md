# RKNNAI/RK3588-CNN-yolov8n-pose

## Resumen

RK3588-CNN-yolov8n-pose es un paquete de despliegue del modelo YOLOv8n-pose, publicado por el usuario RKNNAI, que convierte la red de estimacion de pose humana YOLOv8 (variante nano) al formato RKNN para ejecutarse sobre la NPU del SoC Rockchip RK3588. No es un modelo de lenguaje ni un modelo entrenado desde cero por este autor: se trata de una distribucion de inferencia derivada del repositorio airockchip/ultralytics_yolov8, reempaquetada con las configuraciones y artefactos necesarios para el runtime de Rockchip.

El modelo resuelve el problema de la deteccion de personas y la estimacion de keypoints (esqueleto corporal) en tiempo real sobre hardware de borde de bajo consumo. Su relevancia radica en que permite llevar una tarea de vision clasica a placas embebidas con NPU, sin depender de GPU de escritorio, lo que encaja en escenarios de robotica, videovigilancia o analitica de video en el edge.

El repositorio incluye una unica configuracion documentada, yolov8n-pose-640x640-w8a8-1, con cuantizacion de 8 bits para pesos y activaciones (w8a8), resolucion de entrada de 640x640 y un solo nucleo NPU. La licencia es AGPL-3.0, heredada del proyecto Ultralytics original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (YOLOv8-pose, escala nano), red de deteccion anchor-free con rama de estimacion de keypoints |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones en entero de 8 bits) |
| Idiomas soportados | no aplica / no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | RKNN (para runtime RKNN v2.4.0 sobre RK3588) |

Datos adicionales de la configuracion incluida:

| Configuracion | Chips soportados | Runtime RKNN | Cuantizacion | Nucleos NPU | Resolucion |
|---|---|---|---|---|---|
| yolov8n-pose-640x640-w8a8-1 | RK3588 | v2.4.0 | w8a8 | 1 | 640x640 |

## Arquitectura y entrenamiento

El modelo de origen es YOLOv8n-pose, una red convolucional de la familia YOLOv8 en su escala nano, orientada a la deteccion conjunta de personas (caja delimitadora) y de los puntos clave de su esqueleto. YOLOv8 es una arquitectura anchor-free con una cabeza de deteccion desacoplada y una rama especifica de keypoints; la variante nano es la mas ligera de la familia y esta pensada para inferencia de baja latencia en dispositivos con recursos limitados.

El repositorio no documenta el proceso de entrenamiento del modelo original (numero de tokens o imagenes, composicion del dataset, ni si hubo tecnicas de ajuste como RLHF/DPO, que por otra parte no aplican a un modelo de vision). Lo que si describe es el proceso de despliegue: la conversion del modelo fuente de Ultralytics a formato RKNN para el SoC RK3588, aplicando la precision indicada en cada configuracion (w8a8 en este caso). No se detallan innovaciones tecnicas propias de esta distribucion mas alla del propio proceso de cuantizacion y empaquetado para la NPU.

## Capacidades

- Deteccion de personas y estimacion de pose humana en imagenes o flujo de video, generando cajas delimitadoras y puntos clave del esqueleto.
- Inferencia acelerada sobre NPU del RK3588, con resolucion de entrada de 640x640.
- Ejecucion en el borde con cuantizacion w8a8, orientada a bajo consumo y despliegue embebido.
- Capacidades de tool calling / function calling: no disponibles (no es un modelo generativo ni agentico).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica.
- Modo de pensamiento (thinking mode), vision generativa o audio: no disponible; la unica tarea soportada es la estimacion de pose.

## Casos de uso

- Analitica de video en el borde: procesar la salida de una camara conectada al RK3588 para detectar personas y extraer su esqueleto en tiempo real, sin enviar el video a la nube.
- Gimnasia y entrenamiento deportivo: evaluar la postura y el rango de movimiento de un usuario a partir de los keypoints, ejecutando el modelo localmente en una placa embebida integrada en una maquina o espejo inteligente.
- Rehabilitacion y seguimiento clinico: monitorizar ejercicios de fisioterapia y contar repeticiones o detectar posturas incorrectas sobre hardware de bajo coste.
- Robotica e interaccion humano-robot: dotar a un robot basado en RK3588 de percepcion corporal para seguimiento de personas o evitacion de colisiones.
- Vigilancia y control de aforo: detectar y contar personas en un espacio mediante la rama de deteccion, con procesamiento totalmente local por motivos de privacidad.
- Sistemas de seguridad industrial: comprobar si un operario adopta posturas de riesgo o si permanece en zonas restringidas, a partir de la pose estimada.
- Prototipado de vision en el edge: servir como punto de partida para validar pipelines de RKNN y post-procesado (Box decoding, NMS, extraccion de keypoints y visualizacion de esqueletos) antes de desplegar modelos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma objetivo: SoC Rockchip RK3588 (la configuracion incluida soporta unicamente este chip).
- Runtime: RKNN Runtime v2.4.0.
- Memoria: no se especifica un requisito de VRAM; al ejecutarse sobre la NPU del RK3588, utiliza la memoria compartida del sistema (no aplica el concepto de VRAM dedicada de una GPU).
- Uso de NPU: la configuracion incluida emplea 1 nucleo NPU; el RK3588 dispone de varios nucleos, por lo que podrian plantearse variantes multiproceso, aunque no se documentan resultados en la informacion disponible.
- GPU de escritorio (A100, H100, RTX 4090, etc.): no aplica; el formato RKNN esta pensado para la NPU de Rockchip, no para CUDA.
- Consumer GPU: no disponible, el modelo no esta distribuido en un formato para GPU de consumo.
- Opciones de despliegue: RKNN Runtime sobre RK3588, integrable mediante rknn_model_zoo y ejemplos de terceros (por ejemplo wrappers en Go o C). Otros runtimes como vLLM, llama.cpp, Ollama o TGI no aplican a este modelo.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. A continuacion se comparan caracteristicas conocidas de alternativas del mismo tipo, marcando como "no disponible" los datos no verificados:

| Modelo | Tipo | Tarea | Formato de despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| RK3588-CNN-yolov8n-pose | CNN (YOLOv8n-pose) | Deteccion + pose | RKNN (RK3588) | AGPL-3.0 | Objeto de esta ficha |
| YOLOv8-pose (otras escalas: s/m/l) | CNN (YOLOv8-pose) | Deteccion + pose | PyTorch / ONNX / otras | AGPL-3.0 | Mas capacidad, mayor coste computacional; metricas no disponibles |
| Ultralytics YOLOv8-pose (original) | CNN | Deteccion + pose | PyTorch / ONNX | AGPL-3.0 | Modelo fuente del que deriva esta distribucion |
| Otras soluciones de pose en el edge (por ejemplo RTMPose, MediaPipe Pose, MoveNet) | CNN | Pose | Diversos (ONNX, TFLite, etc.) | Variables | No se dispone de comparativa cuantitativa en la informacion aportada |

## Limitaciones y advertencias

- El repositorio esta pensado exclusivamente para el chip RK3588 con el runtime RKNN v2.4.0; no es portable directamente a otras plataformas sin reconversion.
- La cuantizacion w8a8 puede reducir la precision de los keypoints respecto al modelo en punto flotante original, aunque no se aportan datos de dicha perdida.
- Se trata de una tarea de vis
