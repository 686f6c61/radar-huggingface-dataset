# RKNNAI/RK3588-CNN-yolo11s

## Resumen

RK3588-CNN-yolo11s es un paquete de despliegue del modelo de deteccion de objetos YOLO11s en formato RKNN, optimizado para ejecutarse sobre la NPU del SoC Rockchip RK3588. Lo publica el usuario RKNNAI en Hugging Face y deriva del modelo original mantenido por airockchip en su fork de Ultralytics (ultralytics_yolo11), que a su vez procede del proyecto Ultralytics YOLO11. No se trata de un modelo de lenguaje, sino de una red convolucional (CNN) de vision por computador orientada a deteccion en tiempo real en dispositivos de borde (edge).

El repositorio no contiene pesos entrenados nuevos: su funcion es distribuir la conversion del modelo fuente a RKNN con cuantizacion de 8 bits en pesos y activaciones (w8a8), junto con los ficheros de configuracion necesarios para desplegarlo. La unica configuracion publicada corresponde a la variante yolo11s-640x640-w8a8-1, pensada para ejecutarse con el runtime RKNN v2.4.0 sobre una sola NPU del RK3588 y una resolucion de entrada de 640x640 pixeles.

Su relevancia es practica: facilita el despliegue de un detector YOLO11 de la variante "small" sobre hardware de bajo consumo como el RK3588, muy habitual en sistemas embebidos, camaras inteligentes y dispositivos de vision en el borde, sin necesidad de reexportar ni recalibrar el modelo desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (detector de objetos YOLO11s, familia Ultralytics YOLO11) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones en entero de 8 bits) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | RKNN (runtime RKNN v2.4.0) |

Datos adicionales de la configuracion publicada:

| Parametro | Valor |
|---|---|
| Configuracion | yolo11s-640x640-w8a8-1 |
| Chips soportados | RK3588 |
| Version de runtime RKNN | v2.4.0 |
| Nucleos NPU utilizados | 1 |
| Resolucion de entrada | 640x640 |
| Tipo de modelo declarado | CNN |
| Modelo fuente | airockchip/ultralytics_yolo11 |
| Tamano del repositorio | 0.0 GB (reportado) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La red subyacente es YOLO11s, el variante "small" de la familia YOLO11 de Ultralytics, que emplea una arquitectura convolucional para deteccion de objetos en una sola pasada. El repositorio distribuido por RKNNAI no entrena ni modifica la red: parte del modelo mantenido en el fork airockchip/ultralytics_yolo11 y lo convierte al formato RKNN que consume la NPU del RK3588, aplicando cuantizacion w8a8 mediante el flujo de trabajo del RKNPU SDK y del RKNN Model Zoo.

No se proporciona en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion del dataset, ni si hubo etapas de ajuste fino (por ejemplo RLHF/DPO, que en un detector de objetos no aplicaria del mismo modo). La innovacion tecnica del paquete es la propia conversion y calibracion a RKNN para ejecucion eficiente en NPU, no una aportacion de arquitectura nueva. El paquete incluye verificacion de integridad mediante SHA-256 (fichero SHA256SUMS) y documentacion en ingles y chino.

## Capacidades

- Deteccion de objetos en imagenes de entrada de 640x640 pixeles (una unica clase de tarea: deteccion, segun YOLO11).
- Inferencia cuantizada en NPU (INT8) sobre el SoC Rockchip RK3588, con un nucleo NPU asignado en esta configuracion.
- Ejecucion en el borde (edge computing) para flujos de vision en tiempo real.
- Integracion con el ecosistema RKNN Model Zoo, que aporta ejemplos de exportacion del modelo y de inferencia mediante API de Python y de C.
- No se documentan en la informacion disponible capacidades de segmentacion, pose, clasificacion, tool calling, agentes, capacidades multilingues ni modo de razonamiento, dado que no es un modelo de lenguaje.
- No se documentan modos especiales (thinking, vision multimodal, audio) mas alla de la deteccion visual propia de YOLO.

## Casos de uso

- Videovigilancia urbana o industrial en el borde: el modelo se ejecuta en la NPU del RK3588, de bajo consumo, permitiendo detectar objetos en camaras IP (por ejemplo IMX415 en proyectos de referencia) sin enviar video a la nube.
- Control de aforo y conteo de peatones o vehiculos: al estar cuantizado en w8a8 y correr en una sola NPU, encaja en dispositivos empotrados que procesan multiples canales de video en tiempo real.
- Robotica movil y AGV: un detector YOLO11s en formato RKNN se integra en la cadena de percepcion de un robot basado en RK3588 para localizar obstaculos o personas.
- Automatizacion de lineas de produccion: deteccion de defectos o presencia/ausencia de piezas en cintas transportadoras, con inferencia local que reduce la latencia frente a soluciones en servidor.
- Drones o dispositivos autononos alimentados por bateria: el consumo reducido de la NPU del RK3588 frente a una GPU permite ejecutar deteccion a bordo.
- Puertas de acceso y analitica de comercio: la configuracion a 640x640 ofrece un equilibrio habitual entre precision y coste computacional para deteccion de personas y objetos en puntos de entrada.
- Prototipado rapido de soluciones de vision embebida: gracias a los ejemplos de inferencia en Python y C del RKNN Model Zoo, se puede validar el modelo en placa antes de portar a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma objetivo: SoC Rockchip RK3588 con NPU; la configuracion publicada usa 1 nucleo NPU.
- Runtime necesario: RKNN runtime v2.4.0, junto con el RKNPU SDK/RKNN Model Zoo.
- VRAM: no aplica; se trata de inferencia en NPU integrada, no de GPU dedicada.
- Memoria/peso del modelo: no disponible (el repositorio figura como 0.0 GB en los metadatos, valor probablemente incompleto).
- GPU dedicada: no requerida para el despliegue final; el modelo esta pensado para la NPU del RK3588.
- Entorno de conversion: la conversion y calibracion a RKNN se realiza en un PC (el material de referencia cita Ubuntu) y despues se despliega en la placa por SSH/SCP.
- Opciones de despliegue: RKNN Runtime en el RK3588 con ejemplos de Python y C++ del RKNN Model Zoo; no orientado a vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Formato / plataforma | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK3588-CNN-yolo11s (este modelo) | Deteccion de objetos | RKNN / RK3588 | w8a8 | AGPL-3.0 | Hugging Face, ModelScope |
| YOLO11n INT8 en RK3588 | Deteccion de objetos | RKNN / RK3588 | INT8 | AGPL-3.0 (upstream) | Repositorio de terceros (Ebwai/Yolon11_RK3588) |
| Ultralytics YOLO11 (original) | Deteccion, segmentacion, pose, clasificacion | PyTorch (varios formatos de exportacion) | FP32 / FP16 / INT8 segun exportacion | AGPL-3.0 / Enterprise | Repositorio oficial Ultralytics |

Nota: no se dispone de datos de rendimiento comparativos (precision, mAP, latencia) en la informacion proporcionada para establecer una comparacion cuantitativa entre estas variantes.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso comercial y la integracion en productos propietarios estan sujetos a las obligaciones de esta licencia (entre ellas, la apertura del codigo derivado en determinadas circunstancias). Conviene revisar las condiciones antes de un despliegue en produccion.
- Compatibilidad restringida: solo se declara soporte para el RK3588 y unicamente para la configuracion yolo11s-640x640-w8a8-1, con runtime RKNN v2.4.0. No se garantiza funcionamiento en otros chips ni con otras versiones del runtime.
- Debe emplearse el conjunto de ficheros de una misma configuracion; mezclar ficheros de configuraciones distintas no esta soportado.
- Es un modelo de vision, no un modelo de lenguaje: no genera texto, no razona y no admite tool calling ni agentes.
- La cuantizacion w8a8 puede degradar la precision respecto al modelo en punto flotante; no se aportan metricas (mAP u otras) en la informacion disponible para cuantificar esa perdida.
- Riesgo de falsos positivos y falsos negativos inherente a un detector de objetos; no se documentan umbrales de confianza recomendados ni clases soportadas.
- No se documentan sesgos concretos del modelo; al derivar de un modelo entrenado con datasets no especificados en esta ficha, pueden heredarse sesgos de dichos datos.
- El repositorio presenta 0 descargas y 0 likes, sin historial de validacion por parte de la comunidad, lo que aconseja verificar los hashes SHA-256 y validar el modelo en el caso de uso concreto antes de produccion.
- No se aportan datos de idiomas, contexto ni rendimiento energetico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RKNNAI/RK3588-CNN-yolo11s
- Perfil del autor en Hugging Face: https://huggingface.co/RKNNAI
- Modelo fuente (fork de Ultralytics YOLO11): https://github.com/airockchip/ultralytics_yolo11
- RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo
- Ejemplo YOLO11 en RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolo11
- Documentacion oficial de Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11
- Referencia externa de despliegue YOLOv11n INT8 en RK3588: https://github.com/Ebwai/Yolon11_RK3588
- Guia de ejecucion de modelos CNN en RK3588 (Seeed SenseCraft): https://sensecraft.seeed.cc/ai-lab/en/tools/rk/rk3588-cnn-rknn2-deploy
- Descarga via ModelScope (revision v2.4.0): https://modelscope.cn/models/RKNNAI/RK3588-CNN-yolo11s
