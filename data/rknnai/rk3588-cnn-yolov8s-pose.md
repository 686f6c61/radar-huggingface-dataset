# RKNNAI/RK3588-CNN-yolov8s-pose

## Resumen

`RKNNAI/RK3588-CNN-yolov8s-pose` es un paquete de despliegue del modelo YOLOv8s-pose en formato RKNN, preparado especificamente para ejecutarse sobre la NPU del SoC Rockchip RK3588. No se trata de un modelo entrenado desde cero por el autor del repositorio, sino de una conversion y publicacion de configuraciones listas para produccion a partir del modelo de origen alojado en `airockchip/ultralytics_yolov8`, que a su vez deriva del YOLOv8 de Ultralytics. El problema que resuelve es el de la puesta en marcha de estimacion de pose humana (deteccion de persona mas keypoints) en hardware de borde, evitando al desarrollador el proceso de exportacion, cuantizacion y validacion del grafo.

El repositorio publica una unica configuracion, `yolov8s-pose-640x640-w8a8-1`, con cuantizacion w8a8 (int8 en pesos y activaciones), resolucion de entrada 640x640, un solo nucleo NPU y compatibilidad declarada con RKNN Runtime v2.4.0. La relevancia actual viene del auge de la inferencia en el borde: el RK3588 es una plataforma habitual en placas SBC y equipos integrados, y disponer de artefactos RKNN ya verificados con sumas SHA-256 reduce el trabajo de integracion en productos con restricciones de consumo energetico y latencia.

Conviene subrayar que la ficha del repositorio en HuggingFace esta practicamente vacia en cuanto a metricas (0 descargas, 0 likes, 0.0 GB de tamano de repositorio) y que la model card no aporta informacion sobre dataset de entrenamiento, parametros totales ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (YOLOv8s-pose, deteccion de persona y estimacion de pose) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | w8a8 (int8 en pesos y activaciones) |
| Idiomas soportados | no disponible (no aplica a modelos de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | RKNN (`.rknn`) |
| Resolucion de entrada | 640x640 |
| Chip soportado | RK3588 |
| Nucleos NPU utilizados | 1 |
| Version de RKNN Runtime | v2.4.0 |
| Modelo de origen | `airockchip/ultralytics_yolov8` |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La informacion disponible solo identifica el tipo de modelo como CNN y remite al repositorio de origen `https://github.com/airockchip/ultralytics_yolov8`. No se detallan en la model card el numero de capas, la composicion del dataset de entrenamiento, el numero de tokens o imagenes vistas, ni si hubo fases de ajuste fino, RLHF o DPO. Tampoco se especifica el numero de parametros totales del modelo. Todo lo relativo al entrenamiento del modelo base debe consultarse en el repositorio de Ultralytics y en la documentacion de airockchip; esta publicacion se limita a la conversion y empaquetado del grafo.

La innovacion tecnica de esta publicacion es de despliegue, no de modelado. El proceso consiste en exportar el modelo a un formato intermedio (tipicamente ONNX), adaptar las salidas al limite de calculo matricial del RK3588 y generar el binario RKNN con cuantizacion w8a8 para aprovechar la NPU. Las notas de la comunidad recogidas en la busqueda web senalan que la etapa de post-procesado del propio YOLOv8 (generacion de bounding boxes y nodos asociados) suele exceder los limites del NPU en modo fisico, y que la practica habitual es recortar o reubicar esos nodos fuera del grafo NPU. El repositorio incluye verificacion de integridad mediante `SHA256SUMS`, lo que sugiere que el flujo de compilacion se considera reproducible.

## Capacidades

- Deteccion de personas y estimacion de pose humana sobre imagen o flujo de video, con salida de cajas envolventes y puntos clave.
- Ejecucion de inferencia en la NPU del RK3588, con cuantizacion w8a8 para maximizar el rendimiento por vatio.
- Entrada a resolucion fija de 640x640, adecuada para escenas de vigilancia, analitica deportiva y robotica.
- Despliegue mediante el ecosistema RKNPU (RKNN Runtime v2.4.0), con ejemplos de API en Python y C disponibles a traves de RKNN Model Zoo.
- Verificacion de integridad del artefacto descargado mediante sumas SHA-256.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (vision multimodal, audio, thinking mode): no disponible; el modelo es exclusivamente de vision y orientado a pose.

## Casos de uso

- Analitica deportiva en el borde: el modelo permite calcular angulos y trayectorias de articulaciones a partir de los keypoints directamente sobre una placa RK3588, sin enviar video a la nube, lo que reduce latencia y coste de ancho de banda.
- Monitorizacion de gimnasios y entrenamiento asistido: con entrada 640x640 y cuantizacion int8 se puede ejecutar en tiempo real sobre camaras fijas para corregir posturas y contar repeticiones.
- Videovigilancia con deteccion de caidas: la combinacion de deteccion de persona y pose permite activar alertas cuando la geometria del esqueleto indica una caida, todo procesado localmente en el dispositivo.
- Robotica e interaccion humano-maquina: un brazo robotico o un vehiculo autonomo equipado con RK3588 puede usar la pose estimada como senal de intencion del operador o para evitar colisiones con personas.
- Rehabilitacion y telemedicina: el modelo puede registrar la ejecucion de ejercicios prescritos y generar metricas objetivas de rango de movimiento, manteniendo las imagenes del paciente en el dispositivo por motivos de privacidad.
- Analitica de retail y espacios publicos: conteo de personas y analisis de flujos peatonales sin identificacion biometrica, apoyandose en la deteccion de pose para distinguir orientaciones y direcciones de movimiento.
- Vision artificial industrial: verificacion de posturas ergonomicas de operarios en linea de produccion, con integracion en sistemas de control locales.
- Prototipado rapido en SBC: al ser un artefacto RKNN ya verificado, sirve como punto de partida para validar un caso de uso en placas basadas en RK3588 antes de invertir en un pipeline propio de conversion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de mAP, precision de keypoints, latencia en milisegundos ni throughput en FPS para la configuracion `yolov8s-pose-640x640-w8a8-1`. Cualquier cifra de este tipo deberia medirse sobre el hardware objetivo con el RKNN Runtime v2.4.0 y la configuracion exacta publicada.

## Requisitos de hardware

- Plataforma objetivo: SoC Rockchip RK3588 exclusivamente, segun la matriz de compatibilidad declarada por el autor.
- Acelerador: NPU integrada del RK3588, con un unico nucleo NPU activado en esta configuracion.
- GPU dedicada: no aplica; el modelo esta disenado para la NPU, no para CUDA ni ROCm.
- VRAM: no disponible; el modelo corre sobre la memoria compartida del SoC, no sobre memoria de GPU discreta.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no contemplada en esta publicacion, ya que el formato de pesos es RKNN y no safetensors ni GGUF.
- Runtime necesario: RKNN Runtime v2.4.0, con toolchain RKNPU2 para conversion y ejecucion.
- Opciones de despliegue: SDK RKNPU2 con ejemplos de API en Python y C, RKNN Model Zoo (carpeta `examples/yolov8`), herramientas de descarga via ModelScope y HuggingFace. No compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Dependen del numero de nucleos NPU reservados, la frecuencia del SoC, el ancho de banda de memoria y el pipeline de pre/post-procesado en CPU.
- Almacenamiento: el repositorio declara 0.0 GB, por lo que el espacio en disco necesario no puede estimarse a partir de los metadatos disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye cifras de parametros, contexto ni rendimiento de alternativas, por lo que la comparacion se limita a caracteristicas estructurales verificables.

| Modelo | Familia | Formato | Plataforma objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RKNNAI/RK3588-CNN-yolov8s-pose | YOLOv8-pose (variante s) | RKNN (w8a8) | RK3588 | AGPL-3.0 | HuggingFace y ModelScope |
| YOLOv8n-pose | YOLOv8-pose (variante n) | PyTorch / ONNX / exportable | Multiples, previa conversion | AGPL-3.0 (Ultralytics) | Repositorio de Ultralytics |
| YOLOv8m-pose | YOLOv8-pose (variante m) | PyTorch / ONNX / exportable | Multiples, previa conversion | AGPL-3.0 (Ultralytics) | Repositorio de Ultralytics |
| SnifferGuardian/Yolov8_Pose_RKNN | YOLOv8-pose | RKNN | RK3588 y otras plataformas Rockchip | no disponible | GitHub |
| JoeFirmament/rknn_yolov8pose_rk3588_camera | YOLOv8-pose con entrada de camara | RKNN | RK3588 | no disponible | GitHub |

No se dispone de datos de rendimiento comparado entre estas opciones dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero si se distribuye el software o se ofrece como servicio en red, la obligacion de liberar el codigo fuente correspondiente se activa. Es un caveat critico para productos propietarios.
- El repositorio es un paquete de despliegue, no un modelo entrenado. La calidad final depende del modelo base de Ultralytics y de airockchip, no de esta publicacion.
- Compatibilidad restringida: solo se declara soporte para RK3588 con RKNN Runtime v2.4.0. Usar ficheros de configuraciones distintas o runtimes no coincidentes puede provocar fallos de carga o resultados incorrectos.
- El tamano de repositorio declarado es 0.0 GB y las descargas son 0, lo que impide confirmar que los artefactos esten efectivamente disponibles o hayan sido validados por terceros.
- No hay informacion sobre sesgos del modelo base, composicion demografica del dataset de entrenamiento ni rendimiento diferencial por tono de piel, genero o condicion fisica.
- Riesgo de falsos positivos y de keypoints mal estimados en escenas con oclusion, multitud, iluminacion adversa o resoluciones muy alejadas de 640x640.
- La cuantizacion w8a8 introduce una perdida de precision respecto al modelo en coma flotante que no se cuantifica en la informacion disponible.
- No se documentan limitaciones de idioma porque el modelo no procesa texto, pero tampoco se documentan limitaciones geograficas o normativas sobre tratamiento de imagenes de personas, que en la UE quedan bajo el RGPD.
- La presente ficha no ha podido contrastar resultados de benchmarks ni latencias reales, por lo que cualquier decision de produccion deberia ir precedida de una evaluacion propia sobre el hardware final.

## Enlaces

- HuggingFace: https://huggingface.co/RKNNAI/RK3588-CNN-yolov8s-pose
- Modelo de origen: https://github.com/airockchip/ultralytics_yolov8
- RKNN Model Zoo, ejemplo YOLOv8: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolov8
- Repositorio comunitario SnifferGuardian/Yolov8_Pose_RKNN: https://github.com/SnifferGuardian/Yolov8_Pose_RKNN
- Repositorio comunitario JoeFirmament/rknn_yolov8pose_rk3588_camera: https://github.com/JoeFirmament/rknn_yolov8pose_rk3588_camera
- Hilo del foro de Radxa sobre YOLOv8 en la NPU del RK3588: https://forum.radxa.com/t/use-yolov8-in-rk3588-npu/15838
- Guia de Seeed reComputer AI Lab para YOLOv8-pose en RK3588: https://sensecraft.seeed.cc/ai-lab/en/models/yolov8-pose/rk3588
- Blog sobre conversion de YOLOv8 de PyTorch a RKNN en RK3588: https://blog.kaylordut.com/2024/02/09/rk3588's-yolov8-model-conversion-from-pt-to-rknn/
