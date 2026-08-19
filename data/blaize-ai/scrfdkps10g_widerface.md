# Blaize-AI/SCRFDkps10G_Widerface

## Resumen

SCRFDkps10G_Widerface es un detector de caras basado en el modelo SCRFD (Sample and Computation Redistribution for Face Detection) original de InsightFace, que devuelve cajas delimitadoras y cinco puntos clave faciales. Ha sido optimizado por Blaize-AI para su despliegue en los aceleradores Blaize Xplorer mediante el Blaize Picasso SDK, aprovechando la arquitectura Graph Streaming Processor (GSP) de Blaize, diseñada para inferencia de IA en el borde con baja latencia y alta eficiencia energética. El modelo se distribuye en un formato propietario `.bm` con cuantización BF16 y resolución de entrada fija de 640×640 píxeles.

La relevancia de este modelo radica en su enfoque específico para hardware de edge AI, no para GPUs convencionales. Está pensado para aplicaciones de videovigilancia, análisis de vídeo en tiempo real y sistemas embebidos que requieran detección facial con puntos clave, todo ello bajo una licencia Apache-2.0. Sin embargo, la información pública disponible es limitada: no se especifican el número de parámetros, el contexto de entrenamiento ni benchmarks de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SCRFD (Sample and Computation Redistribution for Face Detection) con salida de 5 keypoints |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | BF16 (unica variante publicada); el README menciona INT8 y AMP como metodos disponibles pero no se incluyen en el repositorio |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.bm` (formato propietario de Blaize); el modelo original se distribuye en ONNX |

## Arquitectura y entrenamiento

SCRFD es un detector de caras de una sola etapa que introduce una estrategia de redistribucion de muestras y computacion para mejorar la eficiencia y la precision en la deteccion facial. El modelo original fue desarrollado por InsightFace y entrenado sobre el dataset WiderFace, que contiene imagenes de rostros en escenas variadas. La version publicada por Blaize-AI ha sido optimizada para el hardware GSP mediante el Picasso SDK, que incluye tecnicas de cuantizacion y ajuste de grafos de computacion. No se proporcionan detalles sobre el numero de tokens de entrenamiento (al ser un modelo de vision, este concepto no aplica), ni sobre el proceso de entrenamiento adicional realizado por Blaize. La unica variante disponible en el repositorio es la BF16 a 640×640, aunque el README menciona que tambien existen variantes INT8 y AMP, sin que se hayan subido los ficheros correspondientes.

## Capacidades

- Deteccion de caras con cajas delimitadoras y 5 puntos clave faciales (ojos, nariz y comisuras de la boca).
- Inferencia optimizada para aceleradores Blaize Xplorer con arquitectura GSP, aprovechando el procesamiento en grafo para reducir latencia y consumo.
- Soporte de cuantizacion BF16 para mantener precision en hardware de edge.
- Entrada fija de 640×640 píxeles, lo que simplifica el pipeline de preprocesado.
- No soporta tool calling, agentes ni capacidades de lenguaje; es exclusivamente un modelo de vision para deteccion facial.

## Casos de uso

- Videovigilancia en tiempo real: el modelo puede integrarse en sistemas de camaras IP para detectar y localizar rostros en flujos de video, gracias a su baja latencia en hardware Blaize Xplorer. Es adecuado para entornos de borde donde no se puede depender de la nube.
- Control de acceso biometrico: los 5 keypoints faciales permiten alinear rostros antes de pasarlos a un sistema de reconocimiento facial, mejorando la precision en entornos controlados.
- Analisis de aforo y conteo de personas: al detectar caras en imagenes de espacios publicos o privados, se puede estimar el numero de personas presentes sin necesidad de procesamiento centralizado.
- Sistemas embebidos en vehiculos: para monitorizacion del conductor (deteccion de somnolencia o distraccion) usando la posicion de ojos y boca a partir de los keypoints.
- Fotografia y edicion automatica: deteccion de rostros para aplicar efectos, recortes o mejoras en aplicaciones moviles o de escritorio que se ejecuten en dispositivos con acelerador Blaize.
- Pruebas de concepto en investigacion: como base para experimentar con optimizaciones de modelos de deteccion facial en hardware de edge, dado su codigo abierto y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de mAP en WiderFace, latencia, throughput ni comparaciones con otros detectores de caras en el repositorio de HuggingFace ni en la documentacion de Blaize consultada.

## Requisitos de hardware

- Requiere un acelerador Blaize Xplorer (o compatible con la arquitectura GSP) y el Blaize Picasso SDK instalado y configurado.
- No es compatible con GPUs convencionales (NVIDIA, AMD) ni con CPUs estandar, ya que el formato `.bm` es exclusivo del ecosistema Blaize.
- No se dispone de datos de VRAM, ya que la memoria depende del hardware concreto de Blaize.
- La inferencia se realiza mediante el runtime de Picasso SDK; el comando `blaize-modeltool` permite inspeccionar el modelo.
- No se ha especificado latencia ni throughput para la variante BF16 a 640×640.

## Comparativa con modelos similares

No disponible. No se han encontrado datos comparativos con otros detectores de caras como RetinaFace, YOLOv8-Face o el propio SCRFD original en formato ONNX. La informacion publica no incluye metricas de rendimiento ni precision que permitan una comparacion objetiva.

## Limitaciones y advertencias

- El modelo esta fuertemente acoplado al hardware Blaize; no se puede ejecutar en otros aceleradores sin una conversion previa que no esta documentada.
- El dataset de entrenamiento WiderFace tiene licencia CC-BY-NC-ND-4.0, que restringe el uso comercial del modelo si se considera que los pesos derivan de ese dataset. Aunque la licencia del modelo es Apache-2.0, el aviso legal de Blaize indica que el usuario debe evaluar los riesgos de propiedad intelectual.
- Solo se publica una variante BF16; las variantes INT8 y AMP mencionadas en el README no estan disponibles en el repositorio, lo que limita las opciones de despliegue.
- La resolucion fija de 640×640 puede ser suboptima para escenarios con rostros muy pequenos o muy grandes; no se ofrece un modo dinamico de entrada.
- No hay informacion sobre sesgos o alucinaciones (al ser un modelo de vision, el concepto de alucinacion se traduce en falsos positivos o negativos), pero no se han publicado evaluaciones de robustez.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere una adopcion muy limitada y posible falta de soporte comunitario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blaize-AI/SCRFDkps10G_Widerface
- Organizacion Blaize-AI en HuggingFace: https://huggingface.co/Blaize-AI
- Repositorio original de InsightFace (SCRFD): https://github.com/deepinsight/insightface/tree/master/detection/scrfd
- Dataset WiderFace: http://shuoyang1213.me/WIDERFACE/
- Web de Blaize: https://www.blaize.com/
- Productos de hardware Blaize: https://www.blaize.com/products/
