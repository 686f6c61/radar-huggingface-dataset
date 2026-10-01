# RKNNAI/RK3576-CNN-yolov8n-pose

## Resumen

RK3576-CNN-yolov8n-pose es un paquete de despliegue en formato RKNN del modelo de estimacion de pose yolov8n-pose, preparado especificamente para el SoC Rockchip RK3576. No se trata de un modelo entrenado desde cero por el autor que lo publica en HuggingFace, sino de una conversion y empaquetado del modelo original procedente de airockchip/ultralytics_yolov8 y distribuido a traves del RKNN Model Zoo. El repositorio lo mantiene el usuario RKNNAI y su proposito es facilitar la ejecucion de la deteccion de puntos clave (keypoints) corporales directamente sobre la NPU del RK3576.

El modelo es una red neuronal convolucional (CNN) de tipo YOLOv8 en su variante "nano" ("n" en el nombre), especializada en estimacion de pose, con entrada fija de 640x640 pixeles y cuantizacion w8a8 (8 bits para pesos y activaciones). La distribucion incluye la configuracion `yolov8n-pose-640x640-w8a8-1`, pensada para usar un unico nucleo NPU del chip y compatible con la version v2.4.0 del runtime RKNN. Este tipo de empaquetado es relevante para desarrolladores de sistemas embebidos y edge computing que necesitan desplegar vision por computador de baja latencia en hardware Rockchip sin recompilar ni reconvertir el modelo.

Al estar orientado a inferencia en el borde, el modelo resuelve el problema del despliegue reproducible de estimacion de pose en dispositivos con recursos limitados, un escenario comun en robótica, videovigilancia, analisis deportivo y aplicaciones industriales. La publicacion no incluye datos de rendimiento propios mas alla de la configuracion de despliegue, por lo que su evaluacion practica depende de la del modelo YOLOv8n-pose de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (familia YOLOv8, variante nano para estimacion de pose) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 640x640) |
| Tipos de cuantizacion | w8a8 (8 bits pesos y activaciones) |
| Idiomas soportados | no aplica (modelo de vision; la documentacion esta en ingles y chino) |
| Licencia | AGPL-3.0 |
| Formato de pesos | RKNN (runtime RKNN v2.4.0 para el chip RK3576) |

## Arquitectura y entrenamiento

La arquitectura corresponde a YOLOv8n-pose, una red CNN de deteccion de objetos y estimacion de puntos clave de la familia Ultralytics YOLOv8. El repositorio no describe el proceso de entrenamiento del modelo de origen: no se indica numero de tokens ni de imagenes, composicion del dataset, ni si se aplicaron tecnicas de ajuste fino como RLHF o DPO (conceptos, por otra parte, propios de modelos de lenguaje y no aplicables aqui). La informacion disponible se limita a la configuracion de despliegue: entrada de 640x640 pixeles, cuantizacion w8a8 y uso de un unico nucleo NPU del RK3576.

La innovacion tecnica que aporta esta publicacion no esta en la arquitectura, sino en el proceso de conversion al formato RKNN y en el empaquetado reproducible para un chip concreto. El repositorio incluye verificacion mediante SHA-256 de los ficheros de la configuracion, instrucciones de descarga desde ModelScope y HuggingFace, y documentacion en ingles y chino. El modelo origen procede de airockchip/ultralytics_yolov8, un fork mantenido por Rockchip para adaptar YOLOv8 a sus NPU.

## Capacidades

- Estimacion de pose humana: deteccion de puntos clave (keypoints) del cuerpo sobre imagenes de entrada de 640x640 pixeles.
- Deteccion de objetos integrada: al derivar de YOLOv8, el modelo detecta las personas u objetos e infiere la pose asociada segun el formato de salida de yolov8-pose.
- Inferencia en el borde sobre NPU: ejecucion acelerada en el chip RK3576 mediante el runtime RKNN v2.4.0.
- Despliegue reproducible: scripts e instrucciones de descarga con verificacion de integridad por SHA-256.
- Soporte de un unico nucleo NPU en la configuracion incluida (NPU Cores = 1).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, idiomas, thinking mode, vision adicional ni audio en la informacion disponible.

## Casos de uso

- Analisis deportivo en el borde: el modelo puede extraer esqueletos de deportistas a partir de video en directo sobre un dispositivo RK3576, permitiendo analizar posturas y movimientos sin enviar video a la nube.
- Videovigilancia inteligente: deteccion de presencia y postura de personas en camaras IP conectadas a un SoC RK3576, con inferencia local de baja latencia y sin dependencia de conectividad.
- Robotica y automatizacion: estimacion de pose humana para interaccion persona-robot o para seguridad en entornos colaborativos, ejecutada en el propio robot con hardware Rockchip.
- Salud y rehabilitacion: seguimiento de ejercicios y posturas de pacientes en dispositivos portatiles o de sobremesa basados en RK3576, con procesamiento local que evita enviar imagenes sensibles a servidores externos.
- Analisis de ergonomia industrial: evaluacion de posturas de operarios en lineas de produccion para prevenir lesiones, integrando el modelo en camaras de planta con procesamiento en el propio dispositivo.
- Aplicaciones de fitness y realidad aumentada: deteccion de puntos clave en tiempo real para superponer graficos o corregir movimientos en aplicaciones moviles o de escritorio con hardware embebido.
- Investigacion en vision por computador: punto de partida reproducible para comparar el rendimiento de YOLOv8n-pose en NPU frente a GPU, gracias al empaquetado estandarizado y a la verificacion de integridad incluida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo no esta pensado para GPU de escritorio ni para VRAM convencional: se distribuye exclusivamente para el SoC Rockchip RK3576 y su NPU integrada.
- Chip compatible: RK3576 unicamente, segun la configuracion incluida.
- Version de runtime requerida: RKNN v2.4.0.
- Uso de NPU: un nucleo (NPU Cores = 1).
- Resolucion de entrada fija: 640x640 pixeles.
- Cuantizacion de despliegue: w8a8.
- Opciones de despliegue: runtime RKNN sobre el propio chip; la distribucion se descarga mediante ModelScope o HuggingFace CLI.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no aplica, dado que es un modelo de vision en formato RKNN y no un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones comparables de otros modelos de estimacion de pose, por lo que no es posible establecer una comparativa fiable con alternativas como otras variantes de YOLOv8-pose u otros estimadores de pose.

## Limitaciones y advertencias

- Licencia AGPL-3.0: se trata de una licencia copyleft fuerte. El uso comercial es posible, pero obliga a distribuir el codigo fuente de las obras derivadas y a respetar las condiciones de la licencia; conviene revisar implicaciones legales antes de integrarlo en productos propietarios.
- Dependencia de hardware: el modelo solo es compatible con el chip RK3576 y el runtime RKNN v2.4.0; no se puede ejecutar en GPU generica ni en otros SoC sin reconversion.
- Ausencia de datos de rendimiento: no se publican metricas de precision (mAP, OKS) ni de latencia, lo que dificulta evaluar su idoneidad en produccion sin pruebas propias.
- Riesgo de sesgo y alucinacion propio del modelo de origen: al derivar de YOLOv8n-pose, hereda los posibles sesgos y errores de deteccion del modelo base, especialmente en condiciones de oclusion, iluminacion adversa o poses poco comunes.
- Limitaciones de resolucion: la entrada esta fija en 640x640 pixeles, lo que puede afectar a la deteccion de personas pequenas o alejadas.
- Empaquetado con tamanos de repositorio reducidos: el repo figura con 0.0 GB, lo que sugiere que los artefactos pueden distribuirse en subdirectorios o mediante descarga aparte; conviene verificar la integridad con SHA-256 antes del despliegue.
- Falta de informacion sobre idiomas y capacidades adicionales: no aplica a un modelo de vision, pero implica que no hay soporte documentado de otras tareas.

## Enlaces

- HuggingFace: https://huggingface.co/RKNNAI/RK3576-CNN-yolov8n-pose
- RKNN Model Zoo (ejemplo yolov8): https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolov8
- Modelo origen: https://github.com/airockchip/ultralytics_yolov8
- Licencia (AGPL-3.0): incluida en el repositorio como fichero LICENSE
