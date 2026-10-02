# RKNNAI/RK3588-CNN-yolov5n

## Resumen

RKNNAI/RK3588-CNN-yolov5n es un paquete de despliegue del detector de objetos YOLOv5n convertido al formato RKNN para su ejecución sobre la NPU del SoC Rockchip RK3588. No se trata de un modelo entrenado desde cero por el autor, sino de una distribucion derivada de los modelos del RKNN Model Zoo de airockchip, que a su vez procede del repositorio airockchip/yolov5. El modelo se publica como una configuracion concreta: `yolov5n-640x640-w8a8-1`, es decir, entrada de 640x640 pixeles, cuantizacion de pesos y activaciones a 8 bits (w8a8) y uso de un unico nucleo NPU.

El problema que resuelve es la puesta en produccion de deteccion de objetos en hardware de borde. Convertir un modelo de vision a RKNN con cuantizacion INT8 permite ejecutar inferencia acelerada por NPU en placas RK3588 sin depender de GPU dedicada ni de servicios en la nube, lo que reduce latencia y coste por dispositivo. La relevancia actual esta en el despliegue de vision artificial embarcada en domotica, videovigilancia, robotica e inspeccion industrial.

La model card es escueta: identifica el modelo como de tipo CNN, indica el chip soportado, la version del runtime RKNN (`v2.4.0`), el esquema de cuantizacion y la resolucion, y remite a la licencia GPL-3.0 heredada del modelo original. No se documentan en la informacion disponible el numero de parametros, la composicion del dataset de entrenamiento ni resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (detector YOLOv5n, configuracion de despliegue RKNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 640x640) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | no aplica (modelo de vision, no procesa lenguaje) |
| Licencia | GPL-3.0 |
| Formato de pesos | RKNN (runtime RKNN v2.4.0); no se distribuyen safetensors ni GGUF |

Datos adicionales de la configuracion publicada:

| Parametro | Valor |
|---|---|
| Chip soportado | RK3588 |
| Nucleos NPU | 1 |
| Resolucion de entrada | 640x640 |
| Version de runtime RKNN | v2.4.0 |
| Modelo de origen | https://github.com/airockchip/yolov5 |
| Verificacion de integridad | SHA256SUMS incluido en el repositorio |
| Tamano del repositorio | 0,0 GB segun la ficha de HuggingFace |

## Arquitectura y entrenamiento

El modelo de origen es YOLOv5n, la variante mas ligera de la familia YOLOv5, un detector de objetos de una sola etapa. La model card lo clasifica explicitamente como `Model Type: CNN` y apunta al repositorio `airockchip/yolov5` como fuente. Lo que distribuye este repositorio no es el modelo entrenado en su formato original, sino una conversion a formato RKNN preparada para el toolchain RKNPU SDK y optimizada para la NPU del RK3588.

El proceso documentado consiste en exportar el modelo de origen a RKNN y ajustar la precision segun la configuracion (`w8a8`, es decir, cuantizacion de pesos y activaciones a INT8) con una resolucion fija de 640x640 y un solo nucleo NPU. No se detallan en la informacion proporcionada el numero de tokens o imagenes de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste fino, destilacion o calibracion especifica mas alla de la conversion. Tampoco se documentan innovaciones tecnicas adicionales (por ejemplo, decodificacion especulativa o mecanismos de atencion lineal), que en cualquier caso no aplican a este tipo de modelo convolucional.

El repositorio incluye un archivo `SHA256SUMS` para verificar la integridad de los ficheros antes del despliegue, lo que sugiere un enfoque orientado a reproducibilidad en entornos embebidos.

## Capacidades

- Deteccion de objetos en imagenes: genera cajas delimitadoras con clase y puntuacion de confianza sobre entradas de 640x640 pixeles.
- Inferencia acelerada por NPU: ejecutable a traves de la NPU del RK3588 mediante el runtime RKNN v2.4.0.
- Ejecucion en borde sin conexion: no requiere acceso a red ni a servicios en la nube para inferir.
- Integracion mediante API Python y API C: el RKNN Model Zoo proporciona ejemplos de uso con ambas interfaces.
- Cuantizacion INT8: reduce el consumo de memoria y acelera la inferencia en hardware con soporte de enteros.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni capacidades multilingues.
- No soporta tool calling ni function calling.
- No incorpora modo de razonamiento, vision multimodal, audio ni agentes multi-paso.
- El numero de clases detectadas y las etiquetas concretas no estan disponibles en la informacion proporcionada.

## Casos de uso

- Videovigilancia en el borde: desplegar el modelo en una placa RK3588 conectada a una camara IP para detectar intrusiones en tiempo real, sin enviar video a la nube y reduciendo el ancho de banda consumido.
- Control de aforo y analitica de personas: integrar la deteccion en un sistema de conteo para aforos en comercios o transporte, aprovechando que el modelo corre en local sobre NPU y no depende de conectividad.
- Robotica movil y AGV: usar la deteccion para que un robot identifique obstaculos u objetos de interes, con latencia baja al ejecutarse en el propio SoC del robot.
- Inspeccion industrial visual: detectar defectos o presencia/ausencia de piezas en una linea de produccion, con la cuantizacion INT8 como compromiso entre velocidad y precision en hardware embebido.
- Domotica y seguridad del hogar: alimentar un NVR o hub domotico basado en RK3588 que dispare alertas locales al detectar objetos concretos en las camaras del hogar.
- Drones y plataformas no tripuladas: deteccion a bordo con consumo energetico contenido, adecuado para cargas utiles limitadas en peso y bateria.
- Analitica de retail: medir trafico, ocupacion de zonas o interaccion con expositores en tiendas fisicas con procesamiento en el propio establecimiento.
- Prototipado y evaluacion de NPU: servir como referencia funcional para validar el toolchain RKNPU SDK y las APIs Python/C antes de invertir en modelos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica el concepto de VRAM: el modelo se ejecuta sobre la NPU del SoC RK3588 y utiliza memoria del sistema (RAM compartida), no memoria de GPU dedicada.
- Hardware objetivo: SoC Rockchip RK3588. La configuracion publicada declara soporte exclusivo para RK3588 con 1 nucleo NPU.
- No cabe en GPU de consumo en su formato RKNN, ya que el formato esta pensado para la NPU de Rockchip; no se distribuyen pesos en safetensors, GGUF ni ONNX en este repositorio.
- Runtime necesario: RKNN runtime version `v2.4.0`, con toolchain RKNPU SDK. Deben usarse los ficheros de la misma configuracion para evitar incompatibilidades.
- Opciones de despliegue: ejemplos de RKNN Model Zoo mediante API Python y API C; verificacion previa de integridad con `sha256sum -c SHA256SUMS`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento propios para establecer una comparacion cuantitativa. La tabla siguiente recoge alternativas presentes en el mismo ecosistema (RKNN Model Zoo), indicando solo lo que consta en la informacion consultada.

| Modelo | Arquitectura | Entrada | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK3588-CNN-yolov5n (este) | CNN YOLOv5n | 640x640 | w8a8 | GPL-3.0 | HuggingFace, ModelScope |
| YOLOv5 (otras variantes del zoo) | CNN YOLOv5 | no disponible | no disponible | GPL-3.0 segun el modelo de origen | RKNN Model Zoo |
| Otros detectores del RKNN Model Zoo | no disponible | no disponible | no disponible | no disponible | RKNN Model Zoo |

El RKNN Model Zoo cubre varios algoritmos y plataformas (RK3562, RK3566, RK3568, RK3576, RK3588, RV1126B, con soporte limitado de RV1103, RV1106, RV1109, RV1126 y RK1808), por lo que existen alternativas desplegables, pero sus especificaciones concretas no forman parte de la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos del modelo; al ser un detector entrenado sobre un dataset no especificado, el comportamiento en dominios visuales distintos al de entrenamiento es desconocido.
- Riesgo de falsos positivos y falsos negativos inherente a la deteccion de objetos; no hay metricas publicadas (mAP, precision, recall) para calibrar expectativas.
- La cuantizacion w8a8 puede degradar la precision respecto al modelo en punto flotante original; no se documenta la perdida de exactitud.
- Limitacion de dominio: no procesa texto ni lenguaje, por lo que cualquier caso de uso conversacional o de generacion queda fuera de alcance.
- Compatibilidad restringida: la configuracion declarada soporta unicamente RK3588 y requiere el runtime RKNN `v2.4.0`; mezclar ficheros de configuraciones distintas puede provocar fallos.
- Licencia GPL-3.0: es una licencia copyleft fuerte, lo que impone obligaciones de distribucion del codigo fuente en productos derivados. Conviene revisar la compatibilidad con el modelo de negocio antes de integrarlo en un producto comercial cerrado.
- No se distribuyen pesos en formatos estandar (safetensors, GGUF, ONNX) en este repositorio, lo que limita la portabilidad a otras plataformas de inferencia.
- El repositorio figura con 0 descargas y 0 likes, y un tamano declarado de 0,0 GB; conviene verificar los ficheros y las sumas SHA-256 antes de cualquier uso en produccion.
- Las fechas de creacion y actualizacion de la ficha son de octubre de 2026, posteriores a la fecha habitual de referencia; conviene confirmar la vigencia del contenido.

## Enlaces

- HuggingFace: https://huggingface.co/RKNNAI/RK3588-CNN-yolov5n
- RKNN Model Zoo (repositorio principal): https://github.com/airockchip/rknn_model_zoo
- Ejemplo de YOLOv5 en RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo/blob/main/examples/yolov5/README.md
- Ejemplo YOLOv5 en el arbol de ejemplos: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolov5
- Modelo de origen: https://github.com/airockchip/yolov5
- Espejo en Gitee del RKNN Model Zoo: https://gitee.com/darboy/rknn_model_zoo/
- Documentacion sobre la API del runtime RKNN y carga de modelos: https://deepwiki.com/yudongyuan/rk3588-dual-sensor-fusion/4.1-rknn-runtime-api-and-model-loading
- Vision general de ejemplos de modelos del zoo: https://deepwiki.com/airockchip/rknn_model_zoo/5-model-examples
