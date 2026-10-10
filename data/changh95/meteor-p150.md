# changh95/meteor-p150

## Resumen

METEOR es una red neuronal de conducción autónoma de vista envolvente (surround-view) y multiuso desarrollada por TIER IV y liberada por la Autoware Foundation. El modelo `changh95/meteor-p150` es un port de METEOR a una única tarjeta Tenstorrent Blackhole p150 mediante tt-nn, empaquetado y publicado con tt-model-manager 0.1.0 (esquema de manifiesto 5.1). La red original se distribuye como ONNX (`meteor_v157c3Z.onnx`, 335 MB) bajo el nombre interno `DepthSegIPMNetV52`.

Técnicamente es una CNN multiuso que combina un encoder ResNet-34 con FPN sobre ocho cámaras, un lift IPM con gating por profundidad hacia un único mapa bird's-eye-view (BEV) de 96 canales a 800×500 y 0.2 m por píxel, cabezas BEV, un planificador de ego y tres refinadores residuales. Declara 48,25 M de parámetros y 2,58 TFLOP por fotograma. Todo el grafo se ejecuta en el chip como una única traza metal por fotograma (4.678 programas), mientras que el redimensionado de imagen, las tablas de geometría del lift, las reglas de decodificación C++ y el estado temporal corren en el host.

Su relevancia es doble: por un lado, es un modelo end-to-end de percepción y planificación para conducción autónoma (detección 3D, ocupación, lane map, trayectorias del ego); por otro, demuestra el despliegue completo de una red de conducción sobre aceleradores Tenstorrent en lugar de GPU CUDA. No tiene paper asociado; la referencia técnica es una charla de GTC 2026 (S81897) y el repositorio `tier4/METEOR`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN multiuso multi-vista: encoder ResNet-34 + FPN sobre 8 camaras, lift IPM con gating por profundidad, cabezas BEV, planificador de ego y 3 refinadores residuales (`DepthSegIPMNetV52`) |
| Parametros totales | 48,25 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de percepcion; entrada de 8 imagenes de camara de al menos 768×432 RGB (raw y sin rectificar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision; no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX original (`meteor_v157c3Z.onnx`, 335 MB) portado a tt-nn para Tenstorrent Blackhole p150; repo con ~1,0 GB |

## Arquitectura y entrenamiento

METEOR es una red multicabecera que consume ocho imagenes de camara con sus intrínsecos y extrínsecos, y la velocidad del ego, y produce un lane map BEV, cajas 3D (vehiculo / VRU) con flags de estacionario y futuros de los agentes, cajas 2D por camara, segmentacion 2D y profundidad, ocupacion 3D, el semaforo relevante para el ego, un campo de riesgo y tres trayectorias del ego con direccion (steer), aceleracion y freno. La representacion intermedia central es un mapa BEV de 96 canales a 800×500, con una resolucion espacial de 0.2 m, construido mediante un lift IPM con gating por profundidad. La red se especifica como 48,25 M de parametros y 2,58 TFLOP por fotograma.

El codigo de entrenamiento esta disponible en `tier4/METEOR` (script `bevlane/train.py`). No se proporcionan en la informacion disponible el numero de tokens o muestras equivalente, la composicion del dataset Detalle, ni si se aplico RLHF/DPO y otras tecnicas de alineamiento. Tampoco se indica si hubo una fase de destilacion o decodificacion especulativa. La innovacion tecnica destacable del repo `changh95/meteor-p150` no es el entrenamiento, sino el despliegue: el grafo completo se ejecuta como una unica traza metal por fotograma, con dispatch sobre los nucleos ETH, 1 cola de comandos y una malla de computo de 12×10.

## Capacidades

- Deteccion 3D de objetos en vista envolvente: vehiculos y VRU (usuarios vulnerables de la via) con flags de estacionario y prediccion de futuros de los agentes.
- Generacion de lane map en bird's-eye-view (BEV) con canales de carril.
- Deteccion 2D por camara (cajas por cada una de las ocho vistas).
- Segmentacion semantica 2D y estimacion de profundidad por camara.
- Ocupacion 3D.
- Identificacion del semaforo relevante para el ego.
- Campo de riesgo.
- Planificacion del ego: tres trayectorias con salidas de direccion (steer), aceleracion y freno.
- Procesamiento multi-vista: entrada de las ocho camaras `CAM_FRONT_WIDE`, `CAM_FRONT_LEFT`, `CAM_FRONT_RIGHT`, `CAM_BACK_WIDE`, `CAM_BACK_LEFT`, `CAM_BACK_RIGHT`, `CAM_FRONT_NARROW` y `CAM_BACK_NARROW`, en cualquier orden.
- Estado temporal en el host (fusion de segmentacion BEV, suavizado de yaw y histeresis de modo de planificacion) a traves del parametro opcional `stream`.
- Manejo de camaras estrechas ausentes: una camara narrow omitida o con imagen todo a cero recibe una entrada cero y la pose de su donante, tal como se entreno.

## Casos de uso

- Percepcion 3D para conduccion autonoma: el modelo toma las ocho camaras de un vehiculo y devuelve cajas 3D de vehiculos y VRU con sus futuros, lo que permite alimentar un planificador o un sistema de seguridad con prediccion de trayectorias de agentes.
- Planificacion de trayectoria del ego: a partir del BEV y del estado temporal, produce tres trayectorias candidatas con steer, aceleracion y freno, utiles para seleccionar una accion de control en un bucle de conduccion.
- Fusion de sensores puramente por camara para Autoware: al publicarse bajo el paraguas de la Autoware Foundation y con un pipeline de robotics, encaja como modulo de percepcion en pilas basadas en Autoware que no quieran depender de LiDAR.
- Deteccion de VRU y peatones en entornos urbanos: las cabezas de VRU con flag de estacionario permiten sistemas de frenado de emergencia y alerta de colision.
- Mapeo de carriles y ocupacion para localizacion relativa: el lane map BEV y la ocupacion 3D sirven para construir una representacion del entorno utilizable por modulos de navegacion y de evitacion de obstaculos.
- Despliegue sobre hardware Tenstorrent en borde: al ejecutarse integramente en una Blackhole p150 mediante tt-nn, es adecuado para vehiculos o bancos de pruebas que apuesten por aceleradores no CUDA y quieran una sola traza por fotograma.
- Analisis offline de logs de conduccion: las salidas de segmentacion 2D, profundidad y cajas 2D/3D permiten anotar y auditar grabaciones multcamara para validacion y depuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas equivalentes; el modelo no es de lenguaje). Los unicos datos medidos que se aportan son de despliegue en la configuracion p150:

| Metrica | Valor |
|---|---|
| Programas por traza metal | 4.678 |
| Carga en primer arranque (cache JIT vacia) | 799 s (unos 13 min) |
| Carga con cache de kernels caliente | 45-50 s (49,7 s medidos) |
| Codigo de decodificacion y estado temporal | en el host (C++ y estado temporal de METEOR) |
| Parametros | 48,25 M |
| Computo por fotograma | 2,58 TFLOP |

## Requisitos de hardware

- Acelerador obligatorio: una tarjeta Tenstorrent Blackhole p150 (malla `P150`); no se documenta soporte para GPU NVIDIA, AMD ni CPU.
- Entorno de software: tt-metal / ttnn en el commit `44d66500520` de tt-metal, con los parches `patches/tt-metal-eth-dispatch.patch` y `patches/tt-metal-reshape-rm-sys1419.patch` aplicados.
- Configuracion del chip: dispatch sobre los nucleos ETH, 1 cola de comandos y malla de computo 12×10.
- VRAM: no aplica en el sentido de GPU; el chip ejecuta el grafo como una unica traza metal. En el host se reserva espacio para el redimensionado de imagenes, las tablas de geometria del lift, las reglas de decodificacion C++ y el estado temporal.
- Almacenamiento: los pesos ONNX (`meteor_v157c3Z.onnx`, 335 MB) se descargan a la cache de Hugging Face; el repo ocupa aproximadamente 1,0 GB.
- Tiempo de carga: 799 s en un arranque con cache JIT vacia; 45-50 s con cache de kernels caliente (49,7 s medidos). La primera llamada es tan rapida como las posteriores porque la carga ejecuta el grafo completo de forma eager antes de capturar la traza.
- Opciones de despliegue: paquete Python propio (`tt_meteor`), instalable con `pip install -e .` y, opcionalmente, el servidor HTTP con `pip install -e ".[server,test]"`. ttnn no esta en PyPI, por lo que debe provenir del entorno tt-metal.
- No cabe en GPU consumer: no hay variante CUDA, GGUF, Ollama, vLLM ni TGI descrita.

## Comparativa con modelos similares

La informacion disponible solo permite comparar el port con su modelo base; no se aportan datos de terceros comparables.

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `changh95/meteor-p150` | 48,25 M | 8 camaras de al menos 768×432 RGB | 2,58 TFLOP por fotograma; una traza metal de 4.678 programas en p150 | Apache 2.0 | Hugging Face, port a Tenstorrent Blackhole p150 |
| `AutowareFoundation/meteor` (base) | 48,25 M | mismas 8 camaras | misma red; distribuida como ONNX | Apache 2.0 | Hugging Face, commit fijado `01a5f6d71df` (tag v1.0) |
| Otras alternativas (BEVFormer, BEVFusion u otras pilas BEV) | no disponible | no disponible | no disponible | no disponible | no disponible: no se aportan datos en la informacion disponible |

## Limitaciones y advertencias

- Requiere hardware Tenstorrent Blackhole p150 y un entorno tt-metal en un commit concreto mas dos parches; no es portable a GPU consumer ni a CPU.
- Existe un cuelgue intermitente de los reshapes en formato row-major bajo dispatch ETH en Blackhole; el propio autor recomienda aplicar el parche `tt-metal-reshape-rm-sys1419.patch` para mitigarlo.
- El primer arranque compila kernels y puede tardar minutos (799 s medidos en un contenedor con cache JIT vacia), lo que complica el arranque en frio en produccion.
- ttnn no esta publicado en PyPI; la instalacion depende del entorno tt-metal, lo que anade friccion al despliegue.
- El modelo no ha sido entrenado por el autor del port: se trata de una adaptacion de `AutowareFoundation/meteor`; los riesgos de sesgo y alucinacion del modelo base no se documentan en la informacion disponible.
- Riesgo de alucinacion: no disponible de forma explicita, pero como red de percepcion puede producir detecciones falsas o trayectorias erroneas con entradas fuera de distribucion (clima, iluminacion, calibraciones distintas).
- La muestra incluida es un fotograma sintetico de una calle renderizada con un rig generico de ocho camaras; no sirve como validacion de rendimiento real. Hay que alimentar las ocho imagenes, la calibracion y la velocidad del propio vehiculo.
- Entrada de imagen cruda y sin rectificar, de al menos 768×432, redimensionada con semantica OpenCV INTER_AREA; no se documentan otros idiomas ni modalidades mas alla de vision.
- Restricciones de licencia: Apache 2.0, con enlace de licencia apuntando a `AutowareFoundation/meteor`; conviene revisar los terminos del modelo base antes de uso comercial.
- Senales de madurez: 0 descargas y 0 likes en el momento del analisis, sin paper asociado (solo una charla de GTC 2026), por lo que la validacion por parte de la comunidad es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/changh95/meteor-p150
- Modelo base y pesos v1.0: https://huggingface.co/AutowareFoundation/meteor
- Arbol de pesos v1.0 (commit `01a5f6d71df`): https://huggingface.co/AutowareFoundation/meteor/tree/01a5f6d71df5ecbbb5853ec600825481d57b9c6b
- Codigo del port: https://huggingface.co/changh95/meteor-p150/tree/main/code
- README de la muestra sintetica: https://huggingface.co/changh95/meteor-p150/tree/main/code/tt_meteor/samples/README.md
- Repositorio de METEOR (TIER IV): https://github.com/tier4/METEOR
- Codigo de entrenamiento (`bevlane/train.py`): https://github.com/tier4/METEOR/tree/dc193a81e9959de57b751e269127ae9b67e3f300
- Runtimes de despliegue (`deploy/cpp`): https://github.com/tier4/METEOR/tree/dc193a81e9959de57b751e269127ae9b67e3f300/deploy/cpp
- README de METEOR: https://github.com/tier4/METEOR/blob/dc193a81e9959de57b751e269127ae9b67e3f300/README.md
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Commit de tt-metal requerido: https://github.com/tenstorrent/tt-metal/commit/44d66500520fda9f2c7060c0f6b41ec48f7ab37e
- Paper: no disponible (referencia: charla de GTC 2026 S81897)
