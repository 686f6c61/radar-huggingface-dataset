# cubert-gmbh/XMR_Demo_Industrial_Foreign_Object_Detection_Lentils

## Resumen

XMR_Demo_Industrial_Foreign_Object_Detection_Lentils es un paquete de tres pipelines entrenados de Cuvis.AI para la deteccion de objetos extranos en lentejas sobre una cinta transportadora mediante imagen hiperespectral. Lo desarrolla cubert-gmbh, fabricante de la camara hiperespectral Ultris XMR, y se publica como demostracion industrial reproducible: no es un modelo de lenguaje, sino un detector de anomalias por pixel con un backbone DINOv2 ViT-B/14 congelado y una cabeza Dinomaly.

El problema que resuelve es el de la inspeccion de seguridad alimentaria sin lista de clases: el sistema se entrena solo con producto normal y puntua cada pixel segun lo lejos que quedan sus caracteristicas DINOv2 de lo observado, de modo que detecta tallos, piedras, esquirlas de aluminio, papel azul y blanco, moscas y goma sin haber visto esas categorias etiquetadas. Los tres pipelines comparten arquitectura y difieren unicamente en la proyeccion de tres canales que ve el backbone: una seleccion RGB visible, una seleccion color-infrarrojo y una seleccion aprendida en 542, 902 y 886 nm.

Es relevante ahora porque ejemplifica el paso de la vision hiperespectral industrial desde papers a artefactos desplegables con pesos, manifiestos con verificacion sha256 y un dataset companero publico, todo bajo licencia Apache-2.0 y con un SDK open source (Cuvis.AI) que permite reproducir la inferencia en GPU o CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de anomalias: backbone DINOv2 ViT-B/14 congelado + cabeza Dinomaly + decididor binario en dos etapas (gate de imagen y umbral por cuantil) |
| Parametros totales | no disponible (pesos `.pt` por pipeline; tamano de repo 3,6 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen a 448 px por el backbone, cubo hiperespectral de 61 bandas (430-910 nm) |
| Tipos de cuantizacion | no disponible (pesos `.pt` en punto flotante; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch) junto a YAML de pipeline; backbone DINOv2 ViT-B/14 con registers descargado aparte |

## Arquitectura y entrenamiento

Cada pipeline es un grafo de nodos Cuvis.AI: un selector de bandas que reduce el cubo hiperespectral a tres canales, un backbone DINOv2 ViT-B/14 con registers congelado que opera a 448 px, una cabeza Dinomaly que modela la distribucion de caracteristicas del producto normal y un decididor que primero aplica un gate sobre la media del 0,1 % de pixeles con mayor puntuacion de anomalia (`image_threshold`) y, si la imagen se alarma, marca los pixeles por encima del cuantil 0,995 de esa misma imagen. La salida es una mascara semantica de anomalia, no instancias de objeto.

El entrenamiento usa exclusivamente producto normal: secuencias de cinta transportadora multifichero del mismo producto bajo iluminacion de cinta controlada. Los umbrales se ajustaron sobre un split de validacion por F1 de pixel para la grabacion de demostracion (0,140 para RGB y CIR, 0,151 para el selector aprendido). La grabacion publicada en el dataset companero es una sesion de evaluacion retenida, capturada con Ultris XMR, optica de 50 mm, modo video, 15 ms de integracion, 4 fps, 61 bandas en 430-910 nm y 1080 x 1000 pixeles, con referencias blanca y oscura.

## Capacidades

- Deteccion de anomalias por pixel sin lista de clases: puntua cada pixel por distancia de caracteristicas DINOv2 al producto normal aprendido.
- Segmentacion semantica de anomalias: genera mascara binaria por imagen alarmada, no cajas ni instancias.
- Tres modos espectrales complementarios: RGB visible (diferencias de color), color-infrarrojo (humedad y dispersion superficial) y seleccion aprendida de bandas (542, 902 y 886 nm) optimizada para la linea de lentejas.
- Gate a nivel de imagen para reducir falsos positivos por fotograma antes de la segmentacion por pixel.
- Procesamiento de cubos hiperespectrales de 61 bandas a 4 fps en modo video.
- Inferencia en GPU CUDA o, mas lenta, en CPU con el backbone ViT-B/14 a 448 px.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual e industrial.

## Casos de uso

- Inspeccion de seguridad alimentaria en linea de lentejas: el pipeline `dinomaly_custom_selector_full_pipeline` procesa cada fotograma de la cinta y emite una mascara de anomalia cuando la media del 0,1 % de pixeles mas anomalos supera 0,151, lo que permite expulsar tallos, piedras o esquirlas antes del envasado.
- Deteccion de contaminantes metalicos: las esquirlas de aluminio se separan del producto por su firma espectral en el infrarrojo cercano, escenario donde el pipeline CIR es preferible al RGB.
- Control de cuerpos extranos organicos: moscas y restos de goma se detectan sin haber sido etiquetados en entrenamiento, gracias al enfoque de anomalia one-class.
- Clasificacion de residuos de papel y carton: papel azul y blanco se identifican por su respuesta en visible e infrarrojo, util en lineas con descarte manual posterior.
- Despliegue en rig de demostracion o laboratorio: con Cuvis.AI 0.17 o superior y `cuvis-ai-dinomaly` v0.8.0 se restaura el pipeline desde el YAML y los `.pt` y se valida sobre la grabacion publicada del dataset companero.
- Calibracion en una linea nueva: ejecutar el pipeline sobre producto normal, leer las puntuaciones de imagen y fijar `image_threshold` por encima del fotograma normal mas alto, manteniendo el cuantil 0,995.
- Prototipado de inspeccion hiperespectral en otros productos: la arquitectura gate-then-quantile y la seleccion de bandas son reutilizables cambiando el selector y reentrenando la cabeza Dinomaly con producto normal del nuevo material.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta los umbrales ajustados por F1 de pixel sobre un split de validacion de la grabacion de demostracion (`image_threshold` 0,140 / 0,140 / 0,151 y `quantile` 0,995 en los tres pipelines), sin cifras de precision, recall o mAP.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el backbone es un ViT-B/14 a 448 px, lo que tipicamente requiere unos pocos GB en FP32 y menos en FP16, pero el autor no publica cifras.
- GPU: cualquier GPU CUDA es suficiente segun la model card; no se especifican modelos recomendados (A100, H100, RTX 4090) porque el cuello de botella es el backbone ViT-B, no un LLM.
- CPU: el pipeline funciona en CPU con el backbone a 448 px, descrito por el autor como "lento".
- Despliegue: Cuvis.AI 0.17 o superior con el plugin `cuvis-ai-dinomaly` v0.8.0, `cuvis-ai-dataloader[cu3s]` y el SDK Cuvis para leer grabaciones `.cu3s`; tambien CuvisNEXT o descarga directa con `fetch.py` / `hf download`.
- Latencia y throughput: la camara captura a 4 fps; no se publican latencias de inferencia por fotograma.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XMR_Demo (este) | Detector de anomalias hiperespectral | DINOv2 + Dinomaly one-class | Cubo de 61 bandas, 430-910 nm | Apache-2.0 | Pesos `.pt` + YAML en Hugging Face |
| Dinomaly (paper original) | Detector de anomalias visual | DINOv2 + reconstruccion | Imagenes RGB | Codigo abierto (repo del paper) | Repositorio de investigacion |
| PatchCore / PaDiM | Deteccion de anomalias industrial | Memoria de caracteristicas / gaussianas | Imagenes RGB | Apache-2.0 / MIT | Implementaciones en anomalib |
| Modelos de segmentacion RGB (SAM, etc.) | Segmentacion general | Promptable / zero-shot | Imagenes RGB | Apache-2.0 / permisivas | Amplia |

La diferencia clave frente a las alternativas RGB es el uso de 61 bandas espectrales, que permite separar contaminantes con firma espectral similar en visible, a costa de requerir una camara hiperespectral Ultris XMR y el SDK Cuvis. No se dispone de comparativas cuantitativas publicadas con estos modelos.

## Limitaciones y advertencias

- Los umbrales (`image_threshold` y `quantile`) estan calibrados para la grabacion de demostracion; en otra linea o producto deben recalibrarse o el detector producira falsos positivos o perdidas.
- Entrenado solo con producto normal: cualquier variacion legitima del producto (iluminacion, humedad, lote) puede disparar alarmas.
- Salida como mascara semantica de anomalia, sin instancias ni clases; no identifica que tipo de objeto extrano es.
- Requiere hardware especifico: camara hiperespectral Ultris XMR y lectores `.cu3s` del SDK Cuvis; no es un modelo reutilizable con imagenes RGB convencionales sin adaptacion.
- Dependencia de versiones concretas: Cuvis.AI 0.17+, `cuvis-ai-dinomaly` v0.8.0 y DINOv2 ViT-B/14 con registers descargado en el primer uso.
- Licencia Apache-2.0 permite uso comercial, pero la licencia del backbone DINOv2 y de los pesos de terceros debe verificarse por separado.
- No hay datos publicados de sesgos, robustez ante cambios de iluminacion extrema ni tasas de falso positivo/negativo en produccion.
- El modelo no procesa texto ni lenguaje: no admite prompts, tool calling ni razonamiento; cualquier expectativa de LLM es inaplicable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cubert-gmbh/XMR_Demo_Industrial_Foreign_Object_Detection_Lentils
- Dataset companero: https://huggingface.co/datasets/cubert-gmbh/XMR_Demo_Industrial_Foreign_Object_Detection_Lentils
- Documentacion Cuvis.AI: https://docs.cuvis.ai
- Repositorio Cuvis.AI: https://github.com/cubert-hyperspectral/cuvis-ai
- Plugin Dinomaly: https://github.com/cubert-hyperspectral/cuvis-ai-dinomaly
- DINOv2 (Meta): https://github.com/facebookresearch/dinov2
