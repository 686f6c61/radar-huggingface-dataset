# changh95/centerpoint-p150

## Resumen

CenterPoint-p150 es un paquete de despliegue del detector 3D LiDAR CenterPoint, empaquetado para ejecutarse sobre hardware Tenstorrent p150 (acelerador de inferencia de la familia Blackhole). No se trata de un modelo de lenguaje, sino de una red de deteccion de objetos 3D en nubes de puntos LiDAR, derivada sin modificacion de pesos de `AutowareFoundation/lidar_centerpoint` (tag `v4.1`), el detector que Autoware emplea por defecto en su nodo `autoware_lidar_centerpoint`. El autor del empaquetado es `changh95` y el modelo original fue entrenado por TIER IV para el stack de conduccion autonoma Autoware.

La arquitectura combina un codificador de pilares PointPillars (PFN 9-16-32), un backbone SECOND, un cuello SECONDFPN y una cabeza CenterPoint de tarea unica sobre una rejilla de 480x480 (variante `base`) o 240x240 con primer bloque de stride 2 (variante `tiny`, un cuarto del computo de la base). La entrada es una nube de puntos en el frame `base_link` (una sola captura o la nube densificada de 2 barridos de Autoware) y la salida son cajas 3D de las clases CAR, TRUCK, BUS, TRAILER, BICYCLE y PEDESTRIAN equivalentes a los `DetectedObjects` de Autoware, con el pre y postprocesado del nodo original (voxelizacion, decodificacion, NMS circular, NMS por IoU y remapeo de clases por area).

Su relevancia es de nicho pero concreta: permite ejecutar el detector LiDAR por defecto de Autoware sobre aceleradores Tenstorrent en lugar de GPU convencionales, con un servidor HTTP propio que expone `/predict`. Esta empaquetado con `tt-model-manager` 0.1.0 (esquema de manifiesto 5.1) y el repositorio ocupa 3,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointPillars (PFN 9-16-32) + backbone SECOND + cuello SECONDFPN + cabeza CenterPoint |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de percepcion, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos empaquetados para p150; no se documentan formatos de cuantizacion) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (pesos originales de `AutowareFoundation/lidar_centerpoint` en el commit `494c8171def40bd36cc2feb323e0a5acbfab132b`, descargados aparte de la imagen Docker) |

## Arquitectura y entrenamiento

La red es un detector 3D LiDAR de una etapa. Un codificador PointPillars (con configuracion PFN 9-16-32) convierte la nube de puntos en pilares y genera una representacion pseudoimagen; un backbone SECOND procesa esa representacion, un cuello SECONDFPN fusiona las escalas y una cabeza CenterPoint predice mapas de calor de clase, regresiones de tamano, altura y orientacion sobre una rejilla de 480x480 en la variante `base`. La variante `tiny` reduce la rejilla a 240x240 aplicando stride 2 en el primer bloque, lo que rebaja el computo a una cuarta parte. Los pesos son los de TIER IV para Autoware, sin modificacion alguna; los detalles de entrenamiento (composicion del dataset, numero de muestras, regimen de aumentacion) se remiten a la model card original de `AutowareFoundation/lidar_centerpoint` y no se reproducen en esta ficha.

La innovacion tecnica del paquete no esta en la red sino en el despliegue: compilacion de kernels para el acelerador p150 en el primer arranque (proceso de varios minutos), perfiles de servicio `base` y `tiny` seleccionables con `--profile`, y un servidor HTTP propio en el puerto 20000 con endpoints `/predict`, `/health` e `/info`. El preprocesado incluye voxelizacion, y el postprocesado replica el del nodo de Autoware: umbralizado por clase y bin de distancia, NMS circular, NMS por IoU y remapeo de clases por area. Tambien admite densificacion de 2 barridos, bien en cliente mediante el campo `sweeps`, bien en servidor mediante `stream`.

## Capacidades

- Deteccion 3D de objetos LiDAR en seis clases: CAR, TRUCK, BUS, TRAILER, BICYCLE y PEDESTRIAN.
- Entrada de una nube de puntos en `base_link` en metros con campos `x, y, z` (la intensidad se ignora, como en Autoware); formatos `npz`, `npy`, `pcd`, `bin` o lista, codificados en base64.
- Densificacion de nubes con multiples barridos: en cliente (`sweeps` con `time_lag_s` y transformada `T_current_from_sweep`) o en servidor (`stream` con `id`, `timestamp_s` y `T_world_from_ego`).
- Parametrizacion fina del postprocesado: `score_threshold` (0,35 por defecto), `score_thresholds` por clase, `distance_bin_upper_limits` ([50, 90, 121, 200]), `yaw_norm_thresholds` (0,3; 0 para PEDESTRIAN), `z_range` ([-4, 6]), `circle_nms_dist_threshold` (0,5), `iou_nms_threshold` (0,1), `iou_nms_search_distance_2d` (10,0), `remap_classes` y `max_detections`.
- Salida en JSON por defecto o en NPZ con arrays sin perdida.
- Endpoints de estado: `GET /health` y `GET /info` (este ultimo lista todos los valores por defecto de parametros); `GET /v1/models` es un stub, no una API de chat.
- No soporta tool calling, function calling, razonamiento multi-paso, generacion de texto ni capacidades multilingues: no es un modelo de lenguaje ni una API compatible con OpenAI.

## Casos de uso

- Percepcion LiDAR en prototipos de conduccion autonoma sobre Autoware: el paquete reproduce exactamente el nodo `autoware_lidar_centerpoint`, de modo que se puede sustituir la inferencia en GPU por la del acelerador p150 manteniendo el mismo contrato de entrada y salida (`DetectedObjects`).
- Procesado offline de datos LiDAR grabados: enviando nubes en `.pcd` o `.bin` a `/predict` se obtienen cajas 3D con etiquetas, utiles para autolabeling o auditoria de percepcion en grandes lotes de grabaciones.
- Investigacion en deteccion 3D: la variante `tiny` (rejilla 240x240, un cuarto de computo) permite iterar experimentos de forma mas rapida y comparar el impacto de la resolucion de la cabeza sobre la calidad de deteccion.
- Despliegue en entornos con aceleradores Tenstorrent: util para equipos que ya trabajan con hardware Blackhole/p150 y quieren un detector LiDAR listo para servir sin recompilar la red.
- Validacion de pipelines de densificacion multi-barrido: los modos `sweeps` (cliente) y `stream` (servidor) permiten comparar ambos esquemas frente al comportamiento de Autoware con 2 barridos.
- Integracion en sistemas de registro y evaluacion: la salida NPZ sin perdida y las marcas de tiempo por etapa (`preprocess`, `device`, `postprocess`, `decode`, `model_call`) facilitan el analisis de latencia y la reproducibilidad en benchmarking interno.
- Demostracion y formacion: el repositorio incluye la nube de ejemplo `test.pcd` de Autoware en formato npz, lo que permite verificar el despliegue de extremo a extremo con un unico `curl`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica medida de rendimiento documentada es la latencia de una inferencia de ejemplo con la nube de prueba (perfil `base`, 48.048 puntos, 9.416 pilares, sin desbordamiento de pilares): preprocesado 4,807 ms, dispositivo 13,846 ms, postprocesado 4,768 ms, total 43,301 ms, con 19,532 ms de decodificacion y 23,452 ms de llamada al modelo. Se trata de una medicion puntual, no de un benchmark sistematico.

## Requisitos de hardware

- Acelerador Tenstorrent p150 obligatorio (familia Blackhole); el paquete no esta pensado para GPU convencionales ni CPU.
- No cabe en GPU de consumo: requiere el hardware Tenstorrent especifico y no se documenta ninguna ruta alternativa de ejecucion.
- Despliegue mediante la CLI de Tenstorrent (`uv tool install tenstorrent`) y Docker: `tt serve changh95/centerpoint-p150` o, sin tt-cli, `tt-model serve changh95/centerpoint-p150`.
- El primer arranque compila kernels para el dispositivo y tarda varios minutos; el servidor esta listo cuando registra `Application startup complete`.
- El servidor escucha en el puerto 20000 o en el siguiente libre.
- Los pesos se descargan del repositorio `AutowareFoundation/lidar_centerpoint` (commit `494c8171def40bd36cc2feb323e0a5acbfab132b`) a la cache de Hugging Face; no van incluidos en la imagen Docker.
- Latencia observada en el ejemplo: 43,301 ms totales por nube con el perfil `base`; no se documenta throughput agregado ni latencia del perfil `tiny`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| centerpoint-p150 (este paquete) | no disponible | no aplica | 43,3 ms por nube en el ejemplo (perfil `base`, p150) | apache-2.0 | Hugging Face, requiere p150 |
| AutowareFoundation/lidar_centerpoint | no disponible | no aplica | no disponible en esta ficha | no disponible en esta ficha | Hugging Face; pesos originales de TIER IV para Autoware |
| CenterPoint original (Yin et al., arXiv:2006.11275) | no disponible | no aplica | no disponible en esta ficha | no disponible en esta ficha | paper y codigo de referencia |

La comparacion relevante es frente al modelo base: centerpoint-p150 usa exactamente los mismos pesos que `AutowareFoundation/lidar_centerpoint` (tag `v4.1`), por lo que la diferencia es el empaquetado y el hardware de destino, no la calidad del detector. No se dispone de datos para comparar con otros detectores LiDAR 3D de la misma categoria.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta chat, tool calling ni agentes; `GET /v1/models` es un stub y la API no es compatible con OpenAI.
- Dependencia total del hardware Tenstorrent p150; no hay ruta documentada para GPU o CPU.
- Solo detecta seis clases (CAR, TRUCK, BUS, TRAILER, BICYCLE, PEDESTRIAN); cualquier otro objeto queda fuera.
- La nube debe estar en el frame `base_link`, en metros y con los campos `x, y, z`; la intensidad se ignora, lo que descarta senal util para algunos escenarios.
- Los umbrales por defecto (0,35 de score, NMS circular 0,5, IoU 0,1) estan calibrados para el caso de Autoware y pueden no ajustarse a otros sensores o densidades; conviene revisarlos con `params`.
- El primer arranque tarda varios minutos por la compilacion de kernels, lo que complica despliegues efimeros o autoescalado.
- Riesgo de alucinacion no aplica en el sentido linguistico, pero si existe riesgo de detecciones falsas o de omision en condiciones de baja densidad de puntos, lluvia o sensores distintos a los de entrenamiento; no se documentan metricas de robustez.
- No se documentan sesgos, cobertura geografica del dataset de entrenamiento ni evaluacion por subpoblaciones.
- Licencia apache-2.0 permite uso comercial, pero el modelo base y sus pesos deben verificarse por separado en su propia model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.

## Enlaces

- [Modelo en Hugging Face: changh95/centerpoint-p150](https://huggingface.co/changh95/centerpoint-p150)
- [Modelo base: AutowareFoundation/lidar_centerpoint](https://huggingface.co/AutowareFoundation/lidar_centerpoint)
- [Paper CenterPoint: Yin et al., arXiv:2006.11275](https://arxiv.org/abs/2006.11275)
- [Nodo autoware_lidar_centerpoint (autoware_universe)](https://github.com/autowarefoundation/autoware_universe/tree/9ceaccf026c31ffc5319bc9eeb4bd7bede0af3fd/perception/autoware_lidar_centerpoint)
- [tt-model-manager](https://github.com/tenstorrent/tt-model-manager)
- [Tenstorrent CLI (tt-cli), prerequisitos](https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md)
- [Nube de ejemplo test_pcd.npz](https://huggingface.co/changh95/centerpoint-p150/resolve/main/code/tt_centerpoint/samples/test_pcd.npz)
