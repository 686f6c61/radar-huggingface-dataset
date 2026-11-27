# nxp/scrfd-500m-imx

## Resumen

SCRFD-500M-KPS es un detector de caras ligerisimo basado en la arquitectura SCRFD (Sample and Computation Redistribution for Efficient Face Detection), publicada en el paper arXiv:2105.04714 y aceptada en ICLR 2022. El modelo original fue desarrollado por InsightFace (Jia Guo, Jiankang Deng, Alexandros Lattas y Stefanos Zafeiriou) y esta variante concreta ha sido reentrenada, cuantizada a int8 y compilada por NXP para su familia de procesadores i.MX y microcontroladores i.MX RT. Dada una imagen RGB, el modelo devuelve por cada cara una caja delimitadora, una puntuacion de confianza y cinco puntos faciales (ojos, nariz y comisuras de la boca).

La relevancia de esta ficha radica en que no es un modelo de lenguaje ni un modelo generativo: es un componente de vision por computador de 0,57 millones de parametros y aproximadamente 0,5 GFLOPs a resolucion VGA, disenado para ejecutarse en dispositivos de borde con recursos muy limitados. Se distribuye en formato LiteRT (`.tflite`) para MPUs y como cabeceras C de TensorFlow Lite Micro para MCUs, con variantes compiladas para las NPU Ethos-U65 (i.MX 93), eIQ Neutron (i.MX 95, i.MX 952) y Neutron-64 (i.MX RT700).

El repositorio incluye los pesos reentrenados, los assets cuantizados a cuatro resoluciones de entrada para MPU y tres para MCU, ademas de scripts de regeneracion (`recipe.sh`), un ejemplo de inferencia (`example.py`) y un script de evaluacion (`evaluate.py`). La licencia es MIT tanto para los pesos reentrenados por NXP como para el codigo original de InsightFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SCRFD (Sample and Computation Redistribution for Efficient Face Detection), red convolucional de deteccion con cabeceras por stride |
| Parametros totales | 0,57 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen de hasta 512x640) |
| Tipos de cuantizacion | int8 post-training quantization, entrada uint8 (0-255), salidas uint8 cuantizadas |
| Idiomas soportados | no aplica (modelo de vision, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | LiteRT (`.tflite`) para MPU; cabeceras C byte-array para TensorFlow Lite Micro (MCU); pesos originales reentrenados en PyTorch (`scrfd_500m_kps_retrained_epoch_640.pth`) |
| FLOPS | ~0,5 GFLOPs a VGA (640x480), escalable con la resolucion de entrada |
| Tamano de fichero (int8) | 794 KB |
| Resoluciones de entrada (MPU) | 128x128, 256x256, 256x320, 512x640 |
| Resoluciones de entrada (MCU) | 128x128, 256x256, 320x256 |
| Salidas | 9 tensores (scores, distancias de bbox y distancias de keypoints para strides 8, 16 y 32), uint8 cuantizados |

## Arquitectura y entrenamiento

SCRFD es una red convolucional de deteccion de caras que redistribuye el muestreo y el computo entre las distintas escalas del backbone y de las cabeceras de prediccion, lo que permite reducir drasticamente el coste computacional manteniendo una precision competitiva. La red produce predicciones en tres strides (8, 16 y 32), cada uno con una cabeza de clasificacion (score de cara) y dos cabezas de regresion (distancias de caja delimitadora y distancias de los cinco puntos faciales). El post-procesado (decodificacion de cajas y landmarks, y supresion de no maximos) se realiza fuera del modelo, en `utils/scrfd.py`.

El modelo original fue entrenado por InsightFace; NXP reentreno la variante SCRFD-500M-KPS sobre el dataset WIDER FACE. La conversion de formato siguio la cadena PyTorch -> ONNX (mediante `scrfd2onnx.py` de InsightFace) -> TensorFlow saved model -> TFLite, usando OpenVINO Model Optimizer y `openvino2tensorflow`. La cuantizacion int8 de los modelos MPU es post-training, con normalizacion de entrada `data / 255` y calibracion sobre aproximadamente 100 imagenes del subconjunto comercialmente usable de ImageNetV2 por cada resolucion. Los modelos para i.MX 93 se compilaron con Vela (`--accelerator-config ethos-u65-512 --optimise Performance`, tags `lf-6.18.20_2.0.0` y `lf-6.18.37_2.1.0`), y los de i.MX 95 / i.MX 952 con el eIQ Neutron SDK (versiones 3.1.3, 3.2.1 y 3.2.3). Los modelos MCU usan una cuantizacion int8 distinta de la misma red, tomada tal cual de eIQ Media Processing Pipeline (MPP), compilada para i.MX RT700 con eIQ Neutron SDK 3.2.2 y 3.2.3 y exportada como cabeceras C.

## Capacidades

- Deteccion de caras en imagenes RGB, con multiples caras por imagen.
- Localizacion de cinco puntos faciales por cara: ojo izquierdo, ojo derecho, punta de la nariz, comisura izquierda de la boca y comisura derecha de la boca.
- Salida de caja delimitadora y puntuacion de confianza por cara.
- Inferencia en dispositivos de borde con NPU: Ethos-U65 (i.MX 93), eIQ Neutron (i.MX 95 / i.MX 952) y Neutron-64 (i.MX RT700).
- Ejecucion en CPU de MPU (i.MX 8M Plus con delegado VX) y en MCU mediante TensorFlow Lite Micro.
- No realiza reconocimiento ni identificacion facial; solo deteccion y landmarks.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).

## Casos de uso

- Control de acceso y presencia en dispositivos empotrados: el modelo detecta caras y devuelve landmarks que permiten alinear el rostro antes de pasarlo a un modulo de reconocimiento separado, todo ejecutandose en la NPU del i.MX 93 sin necesidad de nube.
- Videovigilancia de bajo consumo en camaras IP: con 0,57 M de parametros y 794 KB de pesos int8, el detector cabe en memoria de un MCU i.MX RT1170 y puede procesar fotogramas a 128x128 o 256x256 en tiempo real para disparar alertas de presencia de personas.
- Seguimiento de mirada y analisis de atencion: los cinco landmarks permiten estimar la orientacion de la cabeza y la direccion de la mirada en aplicaciones de senalizacion digital o analitica de audiencia en entornos comerciales.
- Preprocesado para reconocimiento facial en el borde: el detector actua como primera etapa de un pipeline (deteccion -> alineacion por landmarks -> embedding) en sistemas de autenticacion local en i.MX 8M Plus o i.MX 95.
- Automatizacion industrial y robotica: deteccion de operarios en zonas de riesgo o interaccion persona-robot en tiempo real sobre i.MX RT700 con la NPU Neutron-64, sin depender de conectividad.
- Aplicaciones de fotografia y edicion en camara: deteccion de caras para enfoque automatico, recorte inteligente o aplicacion de filtros alineados a los landmarks en dispositivos de consumo con MPU i.MX.
- Sistemas de conteo de personas en comercio minorista: procesamiento local de video para metricas de afluencia, con la ventaja de que los datos no salen del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de mAP, precision/recall ni latencias medidas para las distintas resoluciones y plataformas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (modelo de borde; no requiere GPU dedicada).
- GPU recomendadas: no aplica; el modelo esta disenado para NPU y CPU de NXP (i.MX 8M Plus, i.MX 93, i.MX 95, i.MX 952, i.MX RT1170, i.MX RT700).
- Cabe en consumer GPU: si, por su tamano (794 KB int8) cabria en cualquier GPU consumer, pero no es el objetivo de despliegue.
- Opciones de despliegue: LiteRT (TensorFlow Lite) con delegados NPU (VX para i.MX 8M Plus, Ethos-U para i.MX 93, Neutron para i.MX 95 / i.MX 952); TensorFlow Lite Micro mediante eIQ Media Processing Pipeline para MCU; Vela para compilacion Ethos-U65.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, el modelo pertenece a la familia SCRFD de InsightFace (variantes de 500M, 2.5G, 10G y 34G parametros aproximadamente), de la que esta es la variante mas pequena y la unica reentrenada y compilada por NXP para sus plataformas. Otras alternativas del ecosistema de deteccion facial en el borde (por ejemplo, RetinaFace o BlazeFace) no se han evaluado en la informacion disponible.

## Limitaciones y advertencias

- El modelo solo detecta caras y localiza cinco landmarks; no realiza reconocimiento ni identificacion de personas.
- No se han publicado metricas de precision (mAP, recall) ni de latencia en la model card, lo que impide validar su rendimiento real sin ejecutar `evaluate.py`.
- La cuantizacion int8 introduce una perdida de precision respecto al modelo en punto flotante que no se cuantifica en la informacion disponible.
- La calibracion de la cuantizacion se hizo sobre ~100 imagenes de ImageNetV2, no sobre un dataset especifico de caras, lo que podria afectar a la robustez en dominios visuales alejados de esa distribucion.
- El post-procesado (decodificacion y NMS) debe implementarse fuera del modelo; un error en esa etapa invalida las detecciones.
- Los modelos estan compilados para plataformas NXP concretas; no son portables directamente a otras NPU sin recompilacion.
- Aunque la licencia es MIT, conviene verificar los terminos del dataset WIDER FACE y de ImageNetV2 para uso comercial, ya que la model card solo menciona que el subconjunto de ImageNetV2 usado es comercialmente usable.
- Riesgo de sesgos: no se documenta la composicion demografica de WIDER FACE ni se reportan evaluaciones de equidad; el rendimiento puede variar segun iluminacion, oclusion, pose y origen etnico.
- No apto para aplicaciones de vigilancia masiva o identificacion biometrica sin las garantias legales y eticas correspondientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nxp/scrfd-500m-imx
- Paper SCRFD (arXiv:2105.04714): https://arxiv.org/abs/2105.04714
- Repositorio original de SCRFD en InsightFace: https://github.com/deepinsight/insightface/tree/master/detection/scrfd
- Dataset WIDER FACE: http://shuoyang1213.me/WIDERFACE/
- Vela (compilador Ethos-U de NXP): https://github.com/nxp-imx/ethos-u-vela
- openvino2tensorflow: https://github.com/PINTO0309/openvino2tensorflow
