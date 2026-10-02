# RKNNAI/RK3588-CNN-yolo11n

## Resumen

RK3588-CNN-yolo11n es un paquete de despliegue del detector de objetos YOLO11n en formato RKNN, preparado específicamente para ejecutarse sobre la NPU integrada en el SoC Rockchip RK3588. No es un modelo de lenguaje: es una red convolucional (CNN) de deteccion de objetos publicada por el usuario RKNNAI, derivada del modelo fuente mantenido por airockchip en el repositorio ultralytics_yolo11.

El repositorio no contiene pesos entrenados desde cero ni un modelo nuevo, sino una conversion del YOLO11n original a RKNN con cuantizacion de 8 bits para pesos y activaciones (w8a8), resolucion de entrada de 640x640 y runtime RKNN v2.4.0. La configuracion incluida (yolo11n-640x640-w8a8-1) esta pensada para consumir un unico nucleo de la NPU del RK3588, lo que la hace adecuada para escenarios de edge computing con presupuesto de energia y computo muy ajustado.

Su relevancia practica esta en que elimina el trabajo de conversion y calibracion previo: un desarrollador que trabaje con placas RK3588 puede descargar el artefacto, verificar los hashes SHA-256 y pasar directamente a la inferencia mediante las APIs Python o C de RKNN Model Zoo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano registrado de 0,0 GB, por lo que se trata de una publicacion reciente y sin traccion comunitaria conocida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (YOLO11n, detector de objetos de una sola etapa) |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 640x640 px) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones en 8 bits) |
| Idiomas soportados | no aplica (modelo de vision, no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | RKNN (artefacto precompilado para NPU Rockchip); modelo fuente en PyTorch/Ultralytics |
| Modelo fuente | airockchip/ultralytics_yolo11 |
| Chip soportado | RK3588 |
| Version de runtime RKNN | v2.4.0 |
| Nucleos NPU usados | 1 |
| Resolucion de entrada | 640x640 |
| Tarea | Deteccion de objetos (bounding boxes y clases) |
| Tamano del repositorio | 0,0 GB segun HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

YOLO11n es un detector de objetos de una sola etapa basado en una red convolucional con cuello de agregacion multi-escala, en la linea de las versiones anteriores de la familia YOLO. La variante "n" (nano) es la mas ligera de la familia y esta disenada para inferencia en tiempo real en hardware limitado. En este repositorio no se ha reentrenado ni ajustado el modelo: se parte del modelo publicado por airockchip en ultralytics_yolo11 y se convierte a formato RKNN para la NPU del RK3588.

El dato tecnico diferencial no es el entrenamiento, sino el pipeline de conversion: cuantizacion post-entrenamiento a 8 bits (w8a8) y compilacion con RKNN-Toolkit para el runtime v2.4.0 del RK3588, con una unica configuracion publicada que emplea un solo nucleo NPU a 640x640 de resolucion. La model card no documenta el numero de tokens, la composicion del dataset de entrenamiento ni si hubo fases de RLHF o DPO, ya que no son aplicables a un detector de objetos. Tampoco se detalla el conjunto de calibracion usado durante la cuantizacion.

## Capacidades

- Deteccion de objetos en imagenes y flujo de video a 640x640 píxeles de entrada, con salida de cajas delimitadoras y etiquetas de clase.
- Inferencia sobre la NPU del RK3588, no sobre CPU ni GPU, gracias al artefacto RKNN precompilado.
- Ejecucion en una unica configuracion validada: chip RK3588, runtime RKNN v2.4.0, cuantizacion w8a8, 1 nucleo NPU.
- Integracion mediante las APIs Python y C de RKNN Model Zoo (ejemplo oficial de YOLO11 incluido en el repositorio airockchip/rknn_model_zoo).
- Aptitud para pipelines de vision por computador en tiempo real combinados con captura de camara (por ejemplo, sensores IMX415 en placas RK3588).
- No dispone de tool calling, function calling, modo agente, razonamiento multi-paso, capacidades multilingues ni procesamiento de audio o texto.

## Casos de uso

- Videovigilancia y analitica de video en el borde: el modelo procesa directamente los fotogramas de una camara conectada al RK3588 sin enviar video a la nube, lo que reduce ancho de banda y exposicion de datos personales. Es adecuado porque el consumo de la NPU es bajo y la inferencia es local.
- Robots moviles y AGV: deteccion de obstaculos, personas y balizas en tiempo real sobre la propia placa de control, con latencia predecible y sin depender de conectividad.
- Inspeccion industrial en linea de produccion: deteccion de defectos visibles o piezas mal posicionadas en la cinta, integrada en un PLC o sistema SCADA mediante la API C cuando se exige sincronizacion estricta.
- Drones y UAV de bajo consumo: al ejecutarse en la NPU del RK3588 en lugar de una GPU discreta, el coste energetico y el peso del sistema se reducen, algo critico en plataformas con autonomia limitada.
- Retail y analisis de aforo: conteo de personas en entradas y pasillos, generacion de metricas de ocupacion y deteccion de aglomeraciones, con procesamiento completamente local por motivos de privacidad.
- Trafico y ciudad inteligente: deteccion de vehiculos, peatones y bicicletas en camaras urbanas, como etapa previa a un modulo de tracking y conteo.
- Etapa de preprocesado en pipelines mayores: uso del detector como primer nivel barato (propuesta de regiones) que alimenta modelos mas costosos de clasificacion o reconocimiento ejecutados en otro hardware.
- Prototipado rapido con RKNN Model Zoo: al existir un ejemplo oficial de YOLO11 y hashes de verificacion SHA-256, sirve como base para validar placas RK3588 antes de invertir en una conversion propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de mAP, mAP50, latencia ni FPS para el artefacto RKNN cuantizado, ni comparaciones con el modelo fuente en PyTorch. Los unicos parametros de rendimiento documentados son la configuracion de cuantizacion (w8a8), la resolucion de entrada (640x640), el numero de nucleos NPU utilizados (1) y la version de runtime exigida (RKNN v2.4.0).

## Requisitos de hardware

- Hardware objetivo obligatorio: SoC Rockchip RK3588 con su NPU integrada. El artefacto no esta pensado para ejecutarse en GPU de escritorio ni en CPU convencional.
- VRAM: no aplica. La inferencia se realiza sobre la memoria del SoC compartida con la NPU; no se ha publicado el consumo exacto de memoria del modelo RKNN.
- GPU recomendadas: ninguna. El modelo no esta compilado para CUDA, ROCm ni Metal.
- Cabe en hardware de consumo: si, en el sentido de que el RK3588 aparece en placas y mini-PC de gama media, pero no se ejecuta en una GPU de consumo tipo RTX 4090 ni similar.
- Configuracion de NPU: la unica configuracion publicada usa 1 nucleo de la NPU; segun las fuentes consultadas, el RK3588 dispone de tres nucleos NPU y existen pipelines que reparten la carga entre varios de ellos, aunque este repositorio no documenta una variante multi-nucleo.
- Runtime y SDK: RKNN Runtime v2.4.0 y RKNPU SDK / RKNN-Toolkit2 para la conversion y el despliegue.
- Opciones de despliegue: APIs Python y C de RKNN Model Zoo (directorio de ejemplo yolo11), rknn-toolkit-lite2 y el flujo documentado por Radxa para Ultralytics YOLO11 sobre RKNN. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Herramientas de verificacion: el repositorio incluye un fichero SHA256SUMS que debe validarse con sha256sum -c antes del despliegue.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de cifras de rendimiento del modelo analizado, por lo que la comparacion se limita a caracteristicas verificables. Los valores marcados como no disponibles no aparecen en la informacion consultada.

| Modelo | Formato | Cuantizacion | Chip objetivo | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| RKNNAI/RK3588-CNN-yolo11n | RKNN | w8a8, 640x640, 1 nucleo NPU | RK3588 (RKNN v2.4.0) | AGPL-3.0 | no disponible |
| airockchip/ultralytics_yolo11 (YOLO11n fuente) | PyTorch | sin cuantizar | GPU/CPU generica | AGPL-3.0 | no disponible en la informacion consultada |
| Ejemplos CNN de rknn_model_zoo | RKNN | depende del ejemplo | RK3562, RK3566, RK3568, RK3576, RK3588, RV1126B y otros | segun cada ejemplo | no disponible |
| Otros detectores de la familia YOLO en RKNN (por ejemplo variantes de YOLOv8) | RKNN | habitualmente int8 | familia RK35xx | segun el repositorio de origen | no disponible |

La diferencia principal frente a otras alternativas es de empaquetado y soporte: este repositorio fija una unica configuracion para RK3588 con runtime v2.4.0 y verificacion por SHA-256, mientras que los ejemplos de rknn_model_zoo cubren mas plataformas y suelen requerir la conversion por parte del usuario.

## Limitaciones y advertencias

- Ambito restringido: es un detector de objetos, no un modelo generativo. No responde a prompts, no genera texto y no admite instrucciones en lenguaje natural.
- Configuracion unica: solo se publica la variante yolo11n-640x640-w8a8-1 para RK3588. No hay versiones para otros chips, otras resoluciones ni otros niveles de cuantizacion en este repositorio.
- Compatibilidad estricta: es necesario usar los ficheros de la misma configuracion y la version de runtime RKNN indicada (v2.4.0). Mezclar artefactos de configuraciones distintas puede provocar fallos de carga.
- Sesgos: al derivar de un detector entrenado sobre un dataset no documentado en la model card, se desconocen los sesgos de clase, demografia y contexto. No hay informacion sobre el dataset de calibracion de la cuantizacion.
- Alucinacion: no aplica en el sentido de los modelos de lenguaje, pero si existe el riesgo habitual de falsos positivos y falsos negativos propios de un detector cuantizado, especialmente con objetos pequenos u oclusiones.
- Perdida de precision por cuantizacion: la conversion a w8a8 puede degradar la precision respecto al modelo en punto flotante. No se publican metricas comparativas que permitan cuantificar esa perdida.
- Idiomas y contexto: no aplica, el modelo no procesa lenguaje. La unica "ventana" relevante es la resolucion de imagen de 640x640.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero integrar el modelo en un servicio de red puede obligar a liberar el codigo fuente derivado bajo los mismos terminos. Conviene revisar el fichero LICENSE y las obligaciones de atribucion antes de un despliegue en produccion.
- Traccion nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validaciones externas conocidas. No hay garantia de mantenimiento ni de soporte por parte del autor.
- Atribucion obligatoria: la distribucion conserva los avisos de copyright del proyecto original airockchip/ultralytics_yolo11 y de RKNN Model Zoo; deben mantenerse en cualquier redistribucion.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/RKNNAI/RK3588-CNN-yolo11n
- Modelo fuente (ultralytics_yolo11): https://github.com/airockchip/ultralytics_yolo11
- RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo
- Ejemplo oficial de YOLO11 en RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolo11
- Documentacion de RKNN Model Zoo en DeepWiki: https://deepwiki.com/airockchip/rknn_model_zoo/5-model-examples
- Guia de despliegue de YOLO11 en RKNN (Radxa): https://docs.radxa.com/en/som/nx/nx5/ai-dev/rknn-ultralytics
- Tutorial de ejecucion de modelos CNN en RK3588 (Seeed Studio): https://sensecraft.seeed.cc/ai-lab/en/tools/rk/rk3588-cnn-rknn2-deploy
- Pipeline YOLOv11n INT8 sobre RK3588 con camara IMX415: https://github.com/Ebwai/Yolon11_RK3588
- Descarga alternativa en ModelScope: https://modelscope.cn/models/RKNNAI/RK3588-CNN-yolo11n
