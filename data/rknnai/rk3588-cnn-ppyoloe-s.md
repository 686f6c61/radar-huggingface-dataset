# RKNNAI/RK3588-CNN-ppyoloe-s

## Resumen

RK3588-CNN-ppyoloe-s es un paquete de despliegue del detector de objetos PP-YOLOE-s (variante "small") convertido al formato RKNN para ejecutarse sobre la NPU del SoC Rockchip RK3588. No se trata de un modelo de lenguaje ni de un modelo entrenado desde cero: es una distribucion de inferencia preparada por el usuario RKNNAI a partir del modelo original alojado en PaddlePaddle/PaddleDetection, con la configuracion `ppyoloe-s-640x640-w8a8-1` cuantizada a w8a8 (pesos y activaciones de 8 bits) y una resolucion de entrada fija de 640x640.

El interes de esta ficha es practico: permite llevar deteccion de objetos en tiempo real a placas embebidas RK3588 sin depender de una GPU dedicada, usando el runtime RKNPU v2.4.0 y un unico nucleo NPU. El repositorio esta publicado con licencia Apache 2.0, se distribuye mediante Hugging Face y ModelScope bajo la revision `v2.4.0`, e incluye sumas SHA-256 para verificar la integridad de los ficheros antes del despliegue.

Conviene subrayar que el repositorio aparece con 0 descargas y 0 likes y un tamano reportado de 0.0 GB en el momento de la consulta, por lo que se trata de una publicacion muy reciente y sin traccion comunitaria documentada. Toda la informacion disponible se limita a la model card, al repositorio RKNN Model Zoo de airockchip y a la documentacion de PaddleDetection.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (detector de objetos PP-YOLOE, familia PaddleDetection) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision con entrada fija de 640x640) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones de 8 bits) |
| Idiomas soportados | no aplica (modelo de vision; documentacion en ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (`.rknn`), runtime RKNPU v2.4.0 |
| Tipo de modelo | CNN, deteccion de objetos |
| Resolucion de entrada | 640x640 |
| Chips soportados | RK3588 |
| Nucleos NPU | 1 |
| Configuracion incluida | `ppyoloe-s-640x640-w8a8-1` |
| Revision de distribucion | `v2.4.0` |
| Verificacion de integridad | fichero `SHA256SUMS` incluido |
| Modelo de origen | PaddlePaddle/PaddleDetection (PP-YOLOE-s) |

## Arquitectura y entrenamiento

La model card identifica el modelo como de tipo CNN y lo vincula explicitamente a PaddlePaddle/PaddleDetection, del que procede el detector PP-YOLOE-s. El repositorio no describe la arquitectura interna (backbone, cabeza de deteccion, estrategia de asignacion de etiquetas) ni el proceso de entrenamiento del modelo original: numero de tokens o imagenes, composicion del dataset, tecnicas de aumento de datos o cualquier fase de ajuste fino. Esos datos no estan disponibles en la informacion proporcionada y deben consultarse en el repositorio upstream de PaddleDetection.

Lo que si documenta el repositorio es el proceso de conversion y despliegue: el modelo original se convierte a formato RKNN para RK3588 aplicando la precision cuantizada w8a8, y se empaqueta con el runtime RKNPU v2.4.0. La distribucion se apoya en el RKNN Model Zoo ([airockchip/rknn_model_zoo](https://github.com/airockchip/rknn_model_zoo)), que proporciona ejemplos de exportacion e inferencia mediante API de Python y de C para diversas plataformas Rockchip. No se menciona ninguna innovacion tecnica adicional introducida por esta conversion (por ejemplo, decodificacion especulativa, atencion lineal o tecnicas equivalentes), algo por otra parte esperable en un modelo de vision.

## Capacidades

- Deteccion de objetos en imagenes o fotogramas de video, con entrada fija de 640x640 pixeles.
- Inferencia sobre la NPU integrada del RK3588 mediante el runtime RKNN v2.4.0.
- Ejecucion con un unico nucleo NPU (configuracion `ppyoloe-s-640x640-w8a8-1`).
- Integracion en flujos de trabajo del RKNN Model Zoo mediante API de Python y API de C.
- Verificacion de integridad de los artefactos descargados mediante `SHA256SUMS`.
- Descarga reproducible mediante comandos de Hugging Face (`hf download`) y ModelScope (`modelscope download`) fijando la revision `v2.4.0`.
- No se documentan capacidades de vision-lenguaje, generacion de texto, tool calling, agentes, audio ni razonamiento multi-paso, ya que no es un modelo de ese tipo.

## Casos de uso

- Deteccion de objetos en tiempo real en dispositivos embebidos: el paquete esta preparado para ejecutarse en la NPU del RK3588 con cuantizacion w8a8, lo que permite integrar deteccion continua en equipos sin GPU dedicada.
- Videovigilancia y analitica de video en el borde: al operar sobre fotogramas de 640x640, encaja en pipelines de camaras IP o NVR que delegan la deteccion en una placa RK3588 en lugar de enviar el video a la nube.
- Robotica movil y vehiculos autononos de bajo coste: la deteccion de obstaculos o personas puede ejecutarse localmente sobre la NPU, reduciendo la latencia y la dependencia de conectividad.
- Inspeccion industrial automatizada: deteccion de defectos o presencia/ausencia de componentes en lineas de produccion, con el modelo desplegado en un controlador basado en RK3588.
- Sistemas de conteo y aforo: conteo de personas u objetos en accesos, comercios o transporte publico, aprovechando la inferencia local para evitar el envio de imagenes a servidores externos.
- Prototipado y evaluacion de soluciones de vision en Rockchip: sirve como punto de partida reproducible (revision fijada y sumas de verificacion) para validar el rendimiento de PP-YOLOE-s en RK3588 antes de invertir en un modelo propio.
- Integracion en aplicaciones de analitica con API de C o Python: el RKNN Model Zoo documenta ejemplos de compilacion de demos en C/C++, lo que facilita incrustar el modelo en aplicaciones nativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma objetivo: SoC Rockchip RK3588, utilizando su NPU integrada. El repositorio indica explicitamente que solo se soporta RK3588 para esta configuracion.
- Nucleos NPU: la configuracion `ppyoloe-s-640x640-w8a8-1` esta definida para 1 nucleo NPU.
- Runtime necesario: RKNPU v2.4.0.
- GPU dedicada: no aplica. El modelo esta pensado para ejecutarse en la NPU del RK3588, no en GPU de escritorio o servidor.
- Cuantizacion: w8a8, lo que reduce el uso de memoria y ancho de banda en comparacion con una ejecucion en coma flotante.
- Despliegue: mediante el toolchain RKNPU SDK y los ejemplos del RKNN Model Zoo, con soporte de API de Python y API de C. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.
- VRAM estimada: no aplica; el consumo relevante es de memoria del sistema y de la NPU en la propia placa RK3588.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la informacion proporcionada para establecer una comparativa cuantitativa fiable. A continuacion se indican alternativas de la misma categoria (detectores desplegables en RKNN sobre Rockchip) y los campos que no estan disponibles se marcan como tales.

| Modelo | Tipo | Chips objetivo | Cuantizacion | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| RK3588-CNN-ppyoloe-s (este modelo) | CNN, deteccion de objetos | RK3588 | w8a8 | Apache 2.0 | no disponible |
| YOLO11n convertido a RKNN | CNN, deteccion de objetos | RK3588 | no disponible | no disponible | no disponible |
| Otros detectores del RKNN Model Zoo | CNN | RK3562, RK3566, RK3568, RK3576, RK3588, RV1126B | no disponible | segun modelo upstream | no disponible |

No se han facilitado cifras de precision (mAP), latencia ni consumo que permitan una comparacion objetiva entre estas alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni razonamiento multi-paso, ni capacidades multilingues. Cualquier uso en esos escenarios seria un error de planteamiento.
- Compatibilidad restringida: la configuracion incluida solo declara soporte para RK3588. Usarla en otras plataformas Rockchip (RK3562, RK3566, RK3568, RK3576, RV1126B, etc.) no esta garantizado y puede requerir una conversion propia.
- Entrada fija: el modelo opera a 640x640, por lo que es necesario redimensionar o adaptar las imagenes de entrada, lo que puede afectar a la deteccion de objetos muy pequenos o con relaciones de aspecto extremas.
- Precision reducida por cuantizacion: al tratarse de una conversion w8a8, cabe esperar una perdida de precision respecto al modelo original en coma flotante. No se han publicado metricas que cuantifiquen esa perdida.
- Trazabilidad limitada: no se documentan los datos de entrenamiento del modelo original ni se detallan los sesgos potenciales heredados del dataset de PaddleDetection.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin evidencia publica de validacion por parte de terceros.
- Verificacion obligatoria: la propia model card recomienda comprobar `SHA256SUMS` y que todas las entradas reporten `OK` antes del despliegue.
- Restricciones de licencia: el modelo se distribuye bajo Apache 2.0, pero se recomienda revisar las condiciones del modelo upstream en PaddleDetection y conservar los avisos de copyright y atribucion incluidos en el fichero `LICENSE`.
- Documentacion parcial: mas alla de la configuracion y el proceso de descarga, no se aportan detalles de rendimiento, latencia ni consumo energetico, datos criticos para validar un despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RKNNAI/RK3588-CNN-ppyoloe-s
- RKNN Model Zoo (airockchip): https://github.com/airockchip/rknn_model_zoo
- Ejemplo de PP-YOLOE en RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/ppyoloe
- PaddleDetection (modelo de origen): https://github.com/PaddlePaddle/PaddleDetection
- Espejo del RKNN Model Zoo en Codeberg: https://codeberg.org/airockchip/rknn_model_zoo
- Ejemplo de despliegue de PP-YOLOE en RK3588 con API de C: https://github.com/exyexin/rk3588-example/blob/main/examples/ppyoloe/README.md
- Guia de ejecucion de modelos CNN en RK3588 (reComputer AI Lab): https://sensecraft.seeed.cc/ai-lab/en/tools/rk/rk3588-cnn-rknn2-deploy
- Documentacion sobre modelos RKNN para NPU Rockchip (DeepWiki): https://deepwiki.com/kaylorchen/ai_framework_demo/6.1-rknn-models-for-rockchip-npu
