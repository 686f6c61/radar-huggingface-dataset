# mvdelibas/building-detection-aerial-yolo11s

## Resumen

`mvdelibas/building-detection-aerial-yolo11s` es un modelo de deteccion de objetos basado en la arquitectura Ultralytics YOLO11 en su variante small (yolo11s), ajustado para localizar edificios en ortofotos aereas con una resolucion aproximada de 0,6 metros por pixel. Lo desarrolla el usuario `mvdelibas` y se publica en Hugging Face bajo licencia AGPL-3.0. El modelo parte de los pesos preentrenados oficiales de YOLO11s sobre COCO y se reentrena con 36.332 teselas reales de NAIP (imagenes aereas del USDA, dominio publico) etiquetadas de forma automatica con huellas de edificios de OpenStreetMap.

El problema que resuelve es el precribado de edificios en ortofotos propias: deteccion de construcciones nuevas, huecos en cartografia existente o inventario rapido tras un evento. Al ser un modelo pequeno (aproximadamente 9,4 millones de parametros) puede ejecutarse en CPU de portatil o en GPU de gama media con latencia casi en tiempo real, lo que lo hace util como primera pasada antes de una revision manual o de un proceso de vectorizacion.

Es relevante ahora porque la version v4 multiplica por doce el volumen de entrenamiento respecto a la v2 (de 3.000 a 36.332 teselas) e incorpora texturas de construccion de regiones diversas, con una validacion sobre 7.267 teselas retenidas. La contrapartida es que solo se ha medido sobre imagenes de Estados Unidos y entrega cajas alineadas a los ejes, no poligonos de huella.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO11s (detector de objetos de una etapa) |
| Parametros totales | Aproximadamente 9,4 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible (se distribuyen pesos PyTorch `.pt` y ONNX; la cuantizacion no esta documentada) |
| Idiomas soportados | Ingles (en) y turco (tr) en la documentacion; los nombres de clase internos estan en turco (`bina`) |
| Licencia | AGPL-3.0 (pesos derivados de Ultralytics YOLO11); datos de entrenamiento NAIP dominio publico + OSM ODbL 1.0 |
| Formato de pesos | PyTorch (`.pt`) y ONNX |

## Arquitectura y entrenamiento

YOLO11s es un detector de una etapa con backbone y cuello convolucionales y una cabeza de prediccion densa que produce cajas y puntuaciones por ancla. El modelo se inicializa desde los pesos oficiales preentrenados en COCO y se ajusta fino sobre el dataset "Hava Goruntusunden Bina Tespiti (NAIP + OSM) v4.0", compuesto por 36.332 teselas NAIP de aproximadamente 0,6 m/pixel, divididas de forma estratificada en 25.432 de entrenamiento, 7.267 de validacion y 3.633 de prueba. Las etiquetas son huellas de edificios de OpenStreetMap convertidas a cajas, con una unica clase (`bina`).

El entrenamiento duro 60 epocas con paciencia 15, tamano de lote 24 e imagenes de 1024 x 1024, sobre una GPU en el cluster EVREN HPC, con un coste de 5,9 horas-GPU. El modelo convergio alrededor de la epoca 41 sin senales de sobreajuste (perdida de caja de entrenamiento y validacion de 1,21 en ambos casos). No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa; las innovaciones se limitan al aumento del volumen y la diversidad del dataset respecto a la version anterior.

## Capacidades

- Deteccion de edificios como cajas delimitadoras alineadas a los ejes en ortofotos aereas de aproximadamente 0,6 m/pixel.
- Deteccion de una unica clase (`bina`, "edificio" en turco); no distingue tipologias, alturas ni usos.
- Inferencia sobre teselas de 1024 x 1024 con parametros ajustables de confianza (`conf`) y numero maximo de detecciones (`max_det`).
- Ejecucion local sin necesidad de subir imagenes a un servicio externo: el modelo se distribuye solo como pesos.
- Exportacion a ONNX ademas del formato PyTorch nativo, lo que permite despliegue en runtimes fuera de Ultralytics.
- Entrenamiento sobre imagenes reales de NAIP con etiquetas OSM, lo que aporta robustez frente a variaciones de iluminacion y estacion en el dominio estadounidense.
- No soporta tool calling, agentes, razonamiento multi-paso, vision multimodal ni audio: es exclusivamente un detector visual de una clase.

## Casos de uso

- Precribado municipal de edificios nuevos: se teselan las ortofotos del municipio a 0,6 m/pixel en recortes de 1024 x 1024, se ejecuta el modelo con `conf` en torno a 0,3 y se revisan manualmente las detecciones para localizar construcciones no registradas en catastro.
- Deteccion de huecos en OpenStreetMap: se comparan las cajas predichas con las huellas OSM existentes para generar una capa de sugerencias que los mapeadores puedan validar, respetando la atribucion ODbL.
- Inventario rapido tras un desastre: como primera pasada para estimar cuantos edificios hay en una zona afectada antes de un analisis humano detallado, aprovechando que el modelo corre en hardware modesto y en local.
- Control de cambios en series temporales de ortofotos: al ejecutarse sobre teselas de la misma zona en fechas distintas, las diferencias entre detecciones senalan posibles obras o demoliciones para revision.
- Preentrenamiento para dominios regionales: sirve como inicializacion para ajuste fino con datos propios (por ejemplo, Turquia, donde el autor recomienda `tr-bina-yolo11m-v2` o datos locales) gracias a que parte de pesos COCO y ya ha aprendido texturas de edificios.
- Procesamiento por lotes en pipelines de cartografia: la exportacion a ONNX permite integrar el detector en servicios de inferencia propios y procesar grandes volumenes de teselas sin depender de la libreria Ultralytics en produccion.
- Analisis en dispositivos sin GPU: con aproximadamente 9,4 M de parametros, puede ejecutarse en CPU de portatil para pruebas exploratorias o demos sobre recortes pequenos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de validacion de 7.267 teselas:

| Metrica (validacion, 7.267 teselas) | Valor |
|---|---|
| Box mAP50 | 87,09 % |
| Box mAP50-95 | 60,04 % |
| Precision | 90,59 % |
| Recall | 81,44 % |
| F1 | 85,77 % |
| AP50 por clase (`bina`) | 87,1 % |

El autor advierte que la version v2 obtuvo un mAP50 del 83,05 % sobre un conjunto de validacion distinto (600 teselas), por lo que la comparacion directa entre versiones no es valida. No se han publicado comparaciones con otros detectores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con aproximadamente 9,4 M de parametros y entrada de 1024 x 1024, la huella es reducida y cabe holgadamente en GPU de consumo.
- GPU recomendadas: cualquier GPU moderna con al menos unos pocos GB de VRAM; el autor menciona GPU de gama media y CPU de portatil como objetivos de diseno.
- Cabe en GPU de consumo: si, por el tamano del modelo; no se especifican modelos concretos (RTX 4090, etc.) en la documentacion.
- Opciones de despliegue: Ultralytics (PyTorch), ONNX Runtime mediante el export ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector visual.
- Latencia y throughput: no disponibles; el autor solo indica que el modelo "funciona casi en tiempo real" en CPU de portatil y GPU de gama media, sin cifras.
- Entrenamiento de referencia: 1 GPU, 5,9 horas-GPU, lote 24 e imagenes de 1024 durante 60 epocas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| building-detection-aerial-yolo11s (este modelo) | ~9,4 M | Deteccion de edificios en ortofotos 0,6 m | Teselas 1024 x 1024 | AGPL-3.0 | Hugging Face, pesos `.pt` y ONNX |
| `tr-bina-yolo11m-v2` (citado por el autor) | No disponible | Deteccion de edificios en Turquia | No disponible | No disponible | Citado en la model card; no se aportan mas datos |
| YOLO11s preentrenado en COCO (Ultralytics) | ~9,4 M | Deteccion de 80 clases genericas | Entrada configurable | AGPL-3.0 | Pesos oficiales de Ultralytics |
| `bina-naip-v2-yolo11s-v1` (version anterior del mismo autor) | ~9,4 M | Deteccion de edificios en ortofotos | Teselas 1024 x 1024 | AGPL-3.0 | Entrenado con 3.000 teselas; mAP50 83,05 % sobre 600 teselas |

No se dispone de datos de benchmarks comparativos con otros detectores especializados en edificios en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio geografico limitado: solo se ha medido sobre imagenes de Estados Unidos; el autor advierte que en Turquia el rendimiento puede caer con edificios adosados, bloques de varias plantas y construcciones informales, y que ese escenario no se ha evaluado.
- Resolucion fija: entrenado para aproximadamente 0,6 m/pixel; en imagenes de satelite de 1 m o mas gruesas los edificios pequenos se pierden, y las imagenes de dron muy finas (5-30 cm) deben reescalarse antes de la inferencia.
- Etiquetas imperfectas: las anotaciones derivadas de OSM pueden omitir edificios no dibujados o cubiertos por arboles, y algunas detecciones correctas pueden contarse como falsos positivos en la validacion.
- Edificios adosados: pueden fusionarse en una sola caja o dividirse incorrectamente; las cubiertas bajo arboles y las sombras pueden escaparse.
- Salida en cajas alineadas a los ejes, no en poligonos de huella, lo que limita su uso directo como cartografia vectorial.
- Riesgo de falsos positivos en elementos con apariencia de edificio (naves industriales, piscinas, estructuras temporales) no cuantificado en la documentacion.
- Licencia AGPL-3.0: el uso en servicios en red puede obligar a liberar el codigo del servicio; conviene revisar las implicaciones antes de un despliegue comercial.
- Obligacion de atribucion: el modelo es un "Produced Work" bajo ODbL 1.0 y debe mantenerse la atribucion "© OpenStreetMap contributors" al usar o redistribuir el modelo y sus salidas.
- No se documentan sesgos demograficos ni de otro tipo mas alla del sesgo geografico y de tipologia constructiva ya citado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/building-detection-aerial-yolo11s
- Ultralytics YOLO11 (arquitectura base y pesos preentrenados): https://docs.ultralytics.com/models/yolo11/
- Repositorio de Ultralytics: https://github.com/ultralytics/ultralytics
- NAIP, USDA (imagenes de entrenamiento, dominio publico): https://www.fsa.usda.gov/programs-and-services/aerial-photography/imagery-programs/naip-imagery/
- OpenStreetMap (etiquetas, ODbL 1.0): https://www.openstreetmap.org/
- Licencia ODbL 1.0: https://opendatacommons.org/licenses/odbl/1-0/
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
