# nxp/ultraface-slim-imx

## Resumen

Ultraface slim imx es una variante cuantizada y compilada del detector de rostros Ultraface slim, un modelo de deteccion de objetos disenado especificamente para dispositivos de borde. NXP ha adaptado el modelo original de Linzaer (Ultra-Light-Fast-Generic-Face-Detector-1MB) para ejecutarse en sus plataformas i.MX, incluyendo MPUs como i.MX 8M Plus, i.MX 93, i.MX 95 e i.MX 952, y MCUs como i.MX RT1170. El modelo recibe una imagen RGB de 320x240 y devuelve hasta 100 detecciones de rostros con sus coordenadas de caja y puntuaciones de confianza.

La relevancia de esta ficha radica en que ejemplifica el flujo de trabajo de despliegue de vision por computador en hardware embebido de NXP: el modelo original en PyTorch se convierte a TensorFlow Lite, se cuantiza a int8 y se compila para las NPU integradas (Ethos-U65 en i.MX 93, eIQ Neutron en i.MX 95/952, VX en i.MX 8M Plus) o se exporta como cabecera C para TensorFlow Lite Micro en el i.MX RT1170. Con solo 264.732 parametros y un tamano de archivo de 403 KB en int8, es un ejemplo extremo de eficiencia para deteccion facial en el borde.

El modelo no realiza reconocimiento facial ni identificacion: unicamente detecta la presencia y localizacion de rostros. Esta distincion es importante para evaluar su idoneidad en aplicaciones de privacidad, control de acceso o analitica de video en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional ligera (Ultraface slim, basada en el detector Ultra-Light-Fast-Generic-Face-Detector-1MB) |
| Parametros totales | 264.732 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | INT8 (cuantizacion post-entrenamiento completa); entrada uint8 (0-255) y salida float32 en la variante MPU; entrada int8 y salida int8 en la variante MCU |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | LiteRT (.tflite) para MPU; cabecera C con array de bytes para TensorFlow Lite Micro en MCU |
| Resolucion de entrada | 320x240 RGB (1, 240, 320, 3) |
| Salida | Tensor (100, 6) con hasta 100 rostros detectados (puntuacion de clase + coordenadas de caja) en MPU; tensor crudo (1, 4420, 6) en MCU |
| FLOPs | 168.707.432 |
| Tamano del archivo (int8) | 403 KB |
| Framework de origen | PyTorch (convertido a TensorFlow y TensorFlow Lite) |

## Arquitectura y entrenamiento

Ultraface slim es una red convolucional ligera disenada para deteccion facial en dispositivos de borde. La arquitectura original, publicada por Linzaer en el repositorio Ultra-Light-Fast-Generic-Face-Detector-1MB, sigue un diseno de detector de una sola etapa con extraccion de caracteristicas convolucional y cabeceras de regresion para cajas delimitadoras y puntuaciones de confianza. El modelo regresa cuatro coordenadas por rostro y una puntuacion de confianza, y en la variante MPU el decodificado de cajas y la supresion de no maximos (NMS) estan integrados en el grafo, produciendo directamente un tensor de salida fijo de (100, 6).

NXP realizo varias modificaciones sobre el modelo original. Primero, convirtio el modelo de PyTorch a TensorFlow y luego a TensorFlow Lite, aplicando un parche (`slim.patch`) que integra el post-procesado en el grafo exportado. Segundo, aplico cuantizacion post-entrenamiento completa a int8, calibrada con 100 imagenes de un subconjunto comercialmente usable de ImageNetV2 (WIDER FACE no pudo usarse por restricciones de licencia). Tercero, compilo el modelo para las NPU de NXP: Vela con configuracion `ethos-u65-256` y optimizacion de rendimiento para i.MX 93, y el SDK eIQ Neutron (versiones 3.1.3, 3.2.1 y 3.2.3) para i.MX 95 e i.MX 952. Para el i.MX RT1170, se exporto una cuantizacion diferente (int8 entrada/int8 salida, sin NMS en el grafo, salida cruda de (1, 4420, 6)) tomada del eIQ Media Processing Pipeline y empaquetada como cabecera C para TensorFlow Lite Micro.

No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre el dataset exacto utilizado en el entrenamiento original, mas alla de que el modelo base fue entrenado por Linzaer y que la calibracion de cuantizacion uso ImageNetV2. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de vision.

## Capacidades

- Deteccion de rostros en imagenes RGB de 320x240, devolviendo hasta 100 cajas delimitadoras con puntuaciones de confianza.
- Decodificado de cajas y supresion de no maximos integrados en el grafo para la variante MPU, lo que simplifica la integracion en aplicaciones.
- Inferencia cuantizada a int8 optimizada para NPU: Ethos-U65 en i.MX 93, eIQ Neutron en i.MX 95 e i.MX 952, y VX en i.MX 8M Plus.
- Ejecucion en microcontroladores mediante TensorFlow Lite Micro en i.MX RT1170, con post-procesado (umbral y NMS) a cargo de la aplicacion.
- No realiza reconocimiento facial ni identificacion de personas; solo detecta la presencia y localizacion de rostros.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision mas alla de la deteccion facial, ni procesamiento de audio.

## Casos de uso

- Deteccion de presencia de personas en sistemas de videovigilancia embebida: el modelo puede ejecutarse en un i.MX 8M Plus o i.MX 93 para detectar rostros en tiempo real sin enviar video a la nube, reduciendo el ancho de banda y preservando la privacidad.
- Control de acceso basado en deteccion facial: integrado en un lector de tarjetas o panel de entrada, el modelo detecta si hay un rostro presente antes de activar un modulo de reconocimiento separado, ahorrando energia y computo.
- Analitica de aforo en comercios: desplegado en camaras de bajo coste con i.MX RT1170, el modelo cuenta rostros en un area para estimar ocupacion, con post-procesado en el microcontrolador.
- Automatizacion de la experiencia de cliente en pantallas interactivas: el modelo detecta la presencia de un usuario frente a un kiosco y activa la interfaz, usando la NPU del i.MX 95 para mantener latencia baja.
- Vision artificial en robots de servicio: el detector puede integrarse en la pipeline de percepcion de un robot para localizar personas y evitar colisiones o iniciar interacciones, ejecutandose en la NPU junto a otros modelos.
- Sistemas de seguridad en el hogar con procesamiento local: el modelo detecta rostros en camaras domesticas y activa alertas solo cuando hay presencia humana, sin necesidad de conexion a internet.
- Prototipado rapido en MCU: gracias a la cabecera C para TensorFlow Lite Micro, desarrolladores pueden integrar deteccion facial en proyectos con i.MX RT1170 sin necesidad de un MPU, ideal para dispositivos wearables o sensores autonomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo esta disenado para ejecutarse en NPU o MCU con memoria integrada. El archivo int8 ocupa 403 KB, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no aplica; el modelo esta optimizado para NPU de NXP (Ethos-U65, eIQ Neutron, VX) y para MCU con TensorFlow Lite Micro.
- Compatibilidad con GPU de consumidor: no es el objetivo del modelo; podria ejecutarse en CPU o GPU mediante TensorFlow Lite, pero no esta optimizado para ello.
- Opciones de despliegue: LiteRT (TensorFlow Lite) con delegados NPU para i.MX 8M Plus, i.MX 93, i.MX 95 e i.MX 952; TensorFlow Lite Micro con eIQ Media Processing Pipeline para i.MX RT1170.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ultraface slim imx (NXP) | 264.732 | Imagen 320x240 | MIT | Hugging Face (nxp/ultraface-slim-imx) |
| Ultraface slim original (Linzaer) | Similar (modelo base) | Imagen 320x240 | MIT | GitHub (Linzaer/Ultra-Light-Fast-Generic-Face-Detector-1MB) |
| Otros detectores faciales ligeros (p. ej., MTCNN, RetinaFace) | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo detecta rostros; no realiza reconocimiento ni identificacion, por lo que no debe usarse para autenticacion biometrica.
- La cuantizacion a int8 puede introducir perdida de precision en comparacion con el modelo original en float32, especialmente en condiciones de iluminacion adversas o rostros pequenos.
- La calibracion de cuantizacion se realizo con ImageNetV2, no con WIDER FACE, debido a restricciones de licencia; esto podria afectar la robustez en dominios faciales especificos.
- La resolucion de entrada esta fijada a 320x240, lo que limita la deteccion de rostros muy pequenos o lejanos.
- El modelo esta optimizado para hardware NXP; su ejecucion en otras plataformas puede requerir conversion adicional y no estara optimizada.
- La licencia MIT permite uso comercial, pero se debe conservar el aviso de copyright y la licencia original.
- No se proporcionan datos sobre sesgos demograficos o de otro tipo; como todo detector facial, puede presentar sesgos segun el dataset de entrenamiento original.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero puede producir falsos positivos en la deteccion de rostros en imagenes sin personas.

## Enlaces

- Hugging Face: https://huggingface.co/nxp/ultraface-slim-imx
- Repositorio original de Ultraface: https://github.com/Linzaer/Ultra-Light-Fast-Generic-Face-Detector-1MB
- Vela (compilador Ethos-U): https://github.com/nxp-imx/ethos-u-vela
- Documentacion de eIQ Neutron SDK: no disponible en la informacion proporcionada
- Documentacion de eIQ Media Processing Pipeline: no disponible en la informacion proporcionada
