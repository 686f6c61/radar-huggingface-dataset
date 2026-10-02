# RKNNAI/RK3588-SEGMENT-MobileSAM

## Resumen

RK3588-SEGMENT-MobileSAM es una distribucion del modelo MobileSAM (Mobile Segment Anything) preparada por RKNNAI para ejecutarse sobre la NPU de los SoC Rockchip RK3588. No es un modelo de lenguaje: es un segmentador de imagenes que produce mascaras de objeto de alta calidad a partir de indicaciones (prompts) como puntos o cajas, manteniendo exactamente el mismo flujo que el Segment Anything Model (SAM) original salvo por la sustitucion del codificador de imagen por uno mas ligero.

El repositorio no distribuye los pesos fuente en PyTorch, sino su conversion al formato RKNN. Publica una unica configuracion, `MobileSAM-448x448-fp16-1`, con encoder y decoder en fp16, un nucleo NPU asignado a cada uno y una resolucion de entrada de 448x448 pixeles. El runtime RKNN requerido es la version v2.4.0.

Su relevancia es eminentemente practica: permite llevar segmentacion tipo SAM a dispositivos de borde con RK3588 (placas como Orange Pi 5, Radxa Rock 5 o tarjetas industriales equivalentes) sin necesidad de GPU dedicada, integrándose en el ecosistema de ejemplos de `rknn_model_zoo`. La licencia es Apache 2.0 y se conservan las atribuciones al proyecto de origen `airockchip/MobileSAM`. El repositorio no registra descargas ni likes, por lo que todavia no existe evidencia publica de uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de segmentacion tipo SAM (encoder de imagen + prompt encoder + mask decoder). El proyecto upstream de MobileSAM emplea un encoder TinyViT; la model card solo indica que el encoder es mas ligero que el de SAM |
| Parametros totales | no disponible en la model card (el proyecto upstream de MobileSAM declara un encoder de aproximadamente 5,8 M de parametros frente a los 632 M del encoder ViT-H de SAM) |
| Longitud de contexto | no aplica: modelo de vision con entrada de imagen fija de 448x448 px en la configuracion publicada |
| Tipos de cuantizacion | fp16 en encoder y fp16 en decoder (unica configuracion publicada); formato de despliegue RKNN |
| Idiomas soportados | no aplica: modelo de segmentacion de imagenes sin capacidades linguisticas. La documentacion de la model card esta en ingles y chino simplificado |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (`.rknn`), generado a partir del modelo fuente mediante conversion a RKNN; se incluye `SHA256SUMS` para verificacion de integridad |
| Resolucion de entrada | 448x448 px (configuracion `MobileSAM-448x448-fp16-1`) |
| Hardware objetivo | Rockchip RK3588 (encoder: 1 nucleo NPU; decoder: 1 nucleo NPU) |
| Runtime requerido | RKNN Runtime v2.4.0 |
| Version del repositorio | `v2.4.0` |

## Arquitectura y entrenamiento

MobileSAM sigue el diseno de tres componentes de SAM: un codificador de imagen que calcula el embedding de la imagen, un codificador de prompts que transforma puntos o cajas en tokens, y un decodificador de mascaras que genera la mascara final. La diferencia respecto a SAM reside unicamente en el codificador de imagen, que se sustituye por una variante compacta con el objetivo de reducir el coste computacional del paso mas caro del pipeline. El decodificador y el flujo de inferencia se mantienen equivalentes a los del SAM original, de modo que las mascaras resultantes son visualmente comparables a las del modelo de referencia.

Esta distribucion concreta no aporta informacion sobre el dataset de entrenamiento, el numero de tokens de imagen vistos, ni sobre si se aplicaron tecnicas de ajuste posteriores (RLHF, DPO u otras, en cualquier caso no habituales en modelos de segmentacion). Tampoco documenta innovaciones propias mas alla de la conversion a RKNN: la model card se limita a indicar que el modelo procede de `airockchip/MobileSAM`, que se ha convertido a formato RKNN para RK3588 con la precision declarada en cada configuracion y que los avisos de copyright y atribucion originales se conservan en el fichero de licencia. La distribucion incorpora una verificacion por hash SHA-256 de los ficheros de la configuracion antes del despliegue.

## Capacidades

- Segmentacion de objetos arbitrarios en imagenes a partir de prompts de punto o de caja, siguiendo el flujo de SAM.
- Generacion de mascaras de alta calidad sobre objetos no vistos durante el entrenamiento (capacidad de segmentacion zero-shot propia de la familia SAM).
- Ejecucion sobre NPU embebida, lo que permite segmentacion local sin enviar imagenes a un servicio externo.
- Aplicable fotograma a fotograma en flujos de video, asumiendo el coste de una inferencia completa por imagen.
- Integracion en pipelines de vision por computador en C++ o Python mediante los ejemplos de `rknn_model_zoo`.
- Soporte de tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision general, audio, generacion de texto): no aplica. La unica salida del modelo son mascaras de segmentacion.
- Segun un despliegue de terceros basado en este mismo modelo en RKNN, el decodificador se ejecuta con un numero fijo de prompts; conviene verificar el numero exacto de prompts soportados en la configuracion `MobileSAM-448x448-fp16-1`.

## Casos de uso

- Etiquetado y anotacion asistida de datasets de vision: el modelo genera mascaras a partir de un clic o de una caja dibujada por el anotador, lo que reduce el tiempo de anotacion por imagen en herramientas internas de etiquetado ejecutadas sobre un RK3588.
- Control de calidad industrial en linea: segmentacion de piezas o defectos sobre la imagen capturada por una camara conectada a una placa RK3588, sin depender de conectividad a la nube ni de GPU dedicada.
- Robotica movil y drones: percepcion embebida para aislar objetos de interes (obstaculos, personas, material) a partir de prompts generados por un detector previo que actue como etapa de propuesta de cajas.
- Edicion de imagen en el borde: recorte automatico de sujetos y generacion de mascaras de primer plano en aplicaciones de fotografia o utilidades de escritorio que corran sobre hardware Rockchip.
- Analisis de lineal de retail: segmentacion de productos y huecos en estanterias a partir de imagenes de camara fija, con el modelo ejecutandose localmente en el propio punto de venta.
- Agricultura de precision: delimitacion de cultivo, maleza o fruto en imagenes de campo capturadas por equipos con RK3588, usando cajas propuestas por un detector para inicializar el segmentador.
- Anonimizado y privacidad en video: generacion de mascaras de personas o matriculas para aplicar desenfoque selectivo antes de almacenar o transmitir el flujo, procesando todo en el dispositivo.
- Preprocesado para pipelines de vision posteriores: uso de las mascaras como entrada de etapas de medicion, conteo o clasificacion que se ejecuten despues en el mismo SoC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

| Metrica | Resultado |
|---|---|
| mIoU / IoU de mascara | no disponible |
| Latencia por imagen en RK3588 | no disponible |
| Throughput (imagenes/s) | no disponible |
| Consumo o uso de NPU | no disponible |

## Requisitos de hardware

- Chip soportado: exclusivamente RK3588, segun la tabla de configuraciones de la model card. No se declara compatibilidad con RK3588S, RK3576, RK3566, RK3568 ni otras variantes de la familia.
- Acelerador: NPU del RK3588. La configuracion asigna un nucleo NPU al encoder y otro nucleo al decoder (`encoder: 1; decoder: 1`).
- Precision de ejecucion: fp16 en encoder y decoder.
- Resolucion de entrada: 448x448 px.
- VRAM: no aplica VRAM dedicada. El modelo reside en la memoria compartida del sistema del SoC; no se indica el consumo exacto de memoria.
- GPU de escritorio (A100, H100, RTX 4090, etc.): no aplica. Esta distribucion esta empaquetada para NPU Rockchip, no para CUDA.
- Si cabe en GPU de consumo: no aplica. El modelo esta pensado para ejecutarse en el propio SoC, no en una GPU de consumo.
- Runtime: RKNN Runtime (librknnrt) v2.4.0. La conversion desde el modelo fuente se realiza con las herramientas RKNN correspondientes.
- Opciones de despliegue: ejemplos oficiales de `airockchip/rknn_model_zoo` (carpeta `examples/mobilesam`), despliegues de terceros documentados para reComputer con RK3576/RK3588, y la documentacion de DeepWiki del propio model zoo. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Verificacion previa: ejecutar `sha256sum -c SHA256SUMS` dentro del directorio de la configuracion; todas las entradas deben reportar `OK` antes del despliegue.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Formato | Hardware objetivo | Licencia |
|---|---|---|---|---|---|---|
| RK3588-SEGMENT-MobileSAM (RKNNAI) | Segmentacion tipo SAM, conversion para NPU | no disponible en la model card | 448x448 px | RKNN (fp16) | RK3588 | Apache 2.0 |
| MobileSAM original (`airockchip/MobileSAM`) | Segmentacion tipo SAM | encoder de aproximadamente 5,8 M segun el proyecto upstream | no disponible en la informacion proporcionada | PyTorch / ONNX | GPU o CPU | Apache 2.0 |
| SAM original (ViT-H) | Segmentacion tipo SAM | encoder de 632 M segun la comparacion del proyecto upstream | no disponible en la informacion proporcionada | PyTorch | GPU con memoria elevada | Apache 2.0 |
| `happyme531/segment-anything-rknn2` | Conversion de SAM para RKNN2 | no disponible | no disponible | RKNN | NPU Rockchip | no disponible |
| MobileSAM RKNN de reComputer (Seeed) | Segmentacion tipo SAM, encoder y decoder como modelos RKNN | no disponible | no disponible | RKNN | RK3576 y RK3588 | no disponible |

Nota: las cifras de parametros de MobileSAM y SAM ViT-H proceden de la documentacion publica del proyecto upstream, no de la model card de esta distribucion.

## Limitaciones y advertencias

- El repositorio no registra descargas ni likes y su actualizacion se produjo 27 segundos despues de la creacion, por lo que no existe validacion independiente de la calidad de la conversion.
- La informacion de HuggingFace declara un tamano de repositorio de 0,0 GB, dato que conviene contrastar con el contenido real descargado antes de integrarlo en un pipeline.
- Solo se publica una configuracion (448x448, fp16) y solo para RK3588. Usar ficheros de configuraciones distintas o de otros chips no esta soportado por la documentacion.
- La resolucion de entrada esta fijada en 448x448 px; no se documentan variantes de mayor resolucion ni su impacto en la calidad de las mascaras.
- No hay resultados de benchmarks, curvas de IoU ni latencias publicadas, por lo que el rendimiento real en una aplicacion concreta debe medirse en el propio dispositivo.
- Riesgo de degradacion fuera de dominio: como cualquier modelo de segmentacion zero-shot, puede producir mascaras imprecisas en imagenes muy distintas a las de su distribucion de entrenamiento (imagenes medicas, industriales especializadas, baja iluminacion, etc.).
- Riesgo de alucinacion en sentido estricto: no aplica, ya que el modelo no genera texto; el riesgo equivalente es producir mascaras espurias o incompletas sobre regiones ambiguas.
- El numero de prompts simultaneos que acepta el decoder puede estar restringido en la conversion; hay que verificar este extremo antes de disenar la interfaz de usuario de una herramienta de anotacion.
- Licencia Apache 2.0: permite uso comercial, pero obliga a conservar los avisos de copyright y atribucion del proyecto de origen (`airockchip/MobileSAM` y, aguas arriba, MobileSAM/SAM). Conviene revisar el fichero `LICENSE` incluido en el repositorio.
- La model card y la documentacion auxiliar estan en ingles y chino simplificado; no se ofrece documentacion en castellano.
- El modelo no sustituye a un detector: necesita un prompt (punto o caja) o una estrategia de muestreo de prompts para segmentar sin intervencion humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RKNNAI/RK3588-SEGMENT-MobileSAM
- Repositorio fuente de MobileSAM para Rockchip: https://github.com/airockchip/MobileSAM
- Ejemplo oficial de MobileSAM en RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/mobilesam
- Documentacion de MobileSAM en DeepWiki (rknn_model_zoo): https://deepwiki.com/airockchip/rknn_model_zoo/5.1.2.1-mobilesam
- Despliegue MobileSAM RKNN en reComputer AI Lab (Seeed): https://sensecraft.seeed.cc/ai-lab/en/models/mobilesam-rknn
- Conversion alternativa de SAM para RKNN2: https://github.com/happyme531/segment-anything-rknn2
- Ejemplo de despliegue MobileSAM en RK3588 en RK3588-Omni-Sentinel: https://github.com/Davin-Liang/RK3588-Omni-Sentinel/blob/main/Software/tools/rknn_model_zoo/examples/mobilesam/README.md
- Copia en GitCode de un despliegue MobileSAM para RK3588: https://gitcode.com/qq_42910179/lxmyzzs/tree/main/RK3588/mobilesam_rk3588
- Paper original de MobileSAM (Faster Segment Anything: Towards Lightweight SAM for Mobile Applications): https://arxiv.org/abs/2306.14289
