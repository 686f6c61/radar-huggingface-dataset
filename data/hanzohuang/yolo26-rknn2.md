# HanzoHuang/YOLO26-RKNN2

## Resumen

YOLO26-RKNN2 es una coleccion de exportaciones del modelo YOLO26 convertidas al formato RKNN2 para su ejecucion sobre NPUs Rockchip, concretamente en los SoCs RK3576 y RK3588. El repositorio lo publica el usuario HanzoHuang y esta orientado a despliegues de vision por computador en dispositivos de borde (edge computing) con aceleracion hardware nativa de Rockchip, en lugar de GPU convencionales.

El paquete cubre seis tareas de vision: clasificacion (classify), estimacion de profundidad (depth), deteccion con cajas orientadas (obb), estimacion de pose (pose), segmentacion de instancias (segment) y segmentacion semantica (semantic). Cada tarea se distribuye en variantes y precisiones dentro de una jerarquia de directorios `models/<task>/<variant>/<chip>/<precision>/`, junto con un fichero `metadata.yaml` que registra checksums del modelo y de los metadatos.

La relevancia de este repositorio es practica: ofrece artefactos listos para desplegar en NPUs Rockchip sin necesidad de ejecutar el pipeline de conversion, que se realizo con RKNN Toolkit2 2.3.2. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un conjunto de binarios de inferencia derivados de YOLO26, y no se dispone de informacion sobre arquitectura interna, parametros o contexto en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de YOLO26; detalles internos no publicados en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (el repo organiza por `precision`, pero no se detallan los niveles) |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | RKNN (`.rknn`), generado con RKNN Toolkit2 2.3.2; checkpoints originales en `source/` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base YOLO26 ni los datos de entrenamiento. La model card unicamente indica que se trata de exportaciones "Rockchip-guided and custom YOLO" convertidas con RKNN Toolkit2 2.3.2 para los SoCs RK3576 y RK3588. Los checkpoints originales, los scripts de conversion y su procedencia se encuentran en el directorio `source/` del repositorio, junto con `source/weights.json`.

El repositorio esta estructurado por tarea (classify, depth, obb, pose, segment, semantic), con variantes por modelo, chip y precision. Incluye un manifiesto con checksums del modelo y de los metadatos, lo que permite verificar la integridad de los artefactos descargados. No se especifica el numero de tokens, la composicion del dataset ni si hubo etapas de ajuste fino, RLHF o DPO, ya que no aplican o no se documentan.

## Capacidades

- Deteccion de objetos en imagen, a traves de las variantes de la tarea de deteccion incluidas en el paquete.
- Deteccion con cajas orientadas (obb), adecuada para objetos rotados en imagenes aereas o de satelite.
- Segmentacion de instancias (segment) y segmentacion semantica (semantic).
- Estimacion de pose (pose), con puntos clave sobre personas u objetos.
- Estimacion de profundidad (depth) por imagen.
- Clasificacion de imagenes (classify).
- Inferencia acelerada en NPU Rockchip RK3576 y RK3588 mediante el runtime RKNN2.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje, por tratarse de un modelo de vision.

## Casos de uso

- Vigilancia y analitica de video en el borde: despliegue de las variantes de deteccion y pose sobre dispositivos con RK3588 para procesar flujos de camara localmente, sin enviar video a la nube y con la NPU dedicada a la inferencia.
- Inspeccion industrial: uso de las variantes de segmentacion y deteccion en lineas de produccion con SoCs RK3576, donde el bajo consumo y la NPU integrada permiten montar la inferencia junto a la camara.
- Agricultura de precision y teledeteccion: las variantes obb permiten detectar objetos orientados (vehiculos, cultivos, infraestructuras) en imagenes aereas capturadas por drones con placa Rockchip.
- Robotica y drones: la estimacion de profundidad y la segmentacion semantica proporcionan percepcion espacial a bordo para navegacion y evitacion de obstaculos en plataformas embebidas.
- Analisis de personas y deporte: las variantes pose permiten extraer esqueletos y puntos clave en tiempo real para aplicaciones de fitness, ergonomia o analisis deportivo en dispositivos de bajo consumo.
- Sistemas de conteo y clasificacion en retail o logistica: las variantes classify permiten clasificar productos o paquetes en cintas transportadoras con hardware Rockchip empotrado.
- Prototipado rapido en edge AI: al incluir `metadata.yaml` con checksums y artefactos preconvertidos, el repositorio reduce el trabajo de integracion en pipelines de despliegue sobre RKNN2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: NPUs integradas en los SoCs Rockchip RK3576 y RK3588. El repositorio no esta pensado para GPU convencionales (A100, H100, RTX 4090) ni para CPU generica, ya que los pesos estan en formato RKNN.
- VRAM estimada: no aplica; el consumo depende de la memoria compartida del SoC y del tamano de cada variante y precision, que no se detalla en la model card.
- GPU recomendadas: no aplica. Se requiere un dispositivo con NPU Rockchip compatible y el runtime RKNN2.
- Compatibilidad con GPU de consumo: no; el formato `.rknn` no es ejecutable directamente en GPUs NVIDIA o AMD.
- Opciones de despliegue: runtime RKNN2 de Rockchip sobre RK3576 y RK3588. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Tamano del repositorio: 1,8 GB, lo que incluye los artefactos de todas las tareas, variantes, chips y precisiones, ademas de los checkpoints y scripts en `source/`.

## Comparativa con modelos similares

| Modelo | Tipo | Hardware objetivo | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26-RKNN2 (HanzoHuang) | Exportacion YOLO26 a RKNN2 | NPU Rockchip RK3576 / RK3588 | classify, depth, obb, pose, segment, semantic | AGPL-3.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| YOLO26 original | Modelo de vision | GPU / CPU genericas | deteccion y tareas asociadas | no disponible en la informacion proporcionada | no disponible |
| Exportaciones YOLO a RKNN de otros autores | Exportacion a RKNN | NPU Rockchip | variable | variable | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia AGPL-3.0 es copyleft fuerte: el uso comercial en servicios en red puede obligar a liberar el codigo fuente derivado. Conviene revisar las implicaciones legales antes de integrarlo en productos propietarios.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-10); no hay evidencia de validacion por parte de la comunidad.
- No se documentan resultados de benchmarks, tasas de error ni metricas de precision por tarea, por lo que no es posible evaluar la calidad de las exportaciones sin probarlas.
- Los artefactos estan ligados a los SoCs RK3576 y RK3588; no son portables a otras plataformas sin reconversion.
- No se detalla que niveles de cuantizacion contiene cada carpeta `precision`, lo que puede afectar a la precision del modelo en produccion.
- No se especifican sesgos, riesgos de alucinacion ni limitaciones de idioma, ya que no es un modelo de lenguaje; los riesgos son los propios de los modelos de vision (falsos positivos, sensibilidad a condiciones de iluminacion, oclusiones, dominios no vistos).
- La procedencia de los checkpoints originales se remite a `source/weights.json`; conviene verificar esa trazabilidad antes de un despliegue en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HanzoHuang/YOLO26-RKNN2
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
