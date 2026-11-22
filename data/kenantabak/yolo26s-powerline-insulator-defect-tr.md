# kenantabak/yolo26s-powerline-insulator-defect-tr

## Resumen

`kenantabak/yolo26s-powerline-insulator-defect-tr` es un modelo de deteccion de objetos en tiempo real especializado en la inspeccion de aisladores de lineas electricas de alta tension. Lo desarrolla Kenan Tabak dentro de la plataforma EVREN (SSYZ) y se entrena sobre el conjunto de datos turco "Elektrik İletim Hattı İzolatör Yüzey Hasarı ve Kusur Tespiti (2 Clase)", con dos clases orientadas a identificar aisladores y defectos superficiales. El modelo emplea la arquitectura `yolo26s` (Ultralytics YOLO26 Small) y se distribuye en formato PyTorch con un peso de 19,37 MB.

El interes de esta ficha radica en que cubre un nicho industrial concreto —el mantenimiento predictivo de infraestructura energetica— con metricas muy altas declaradas por el autor: 98,25 % de mAP@50, 76,12 % de mAP@50-95 y 96,95 % de F1 sobre el conjunto de validacion. Es, ademas, un ejemplo de modelo pequeno (variante "small") pensado para inferencia en tiempo real, lo que lo hace candidato a despliegues en borde o en drones de inspeccion.

La licencia CC-BY-4.0 permite uso comercial con atribucion, y el modelo declara soporte para turco e ingles. No obstante, se trata de un modelo de autor unico con cero descargas y cero likes en el momento de redactar esta ficha, y las metricas no estan verificadas de forma independiente (`verified: false` en el model-index).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO26 Small (`yolo26s`), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se publican pesos PyTorch `best.pt`; no se listan variantes ONNX, GGUF ni INT8) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`.pt`): `best.pt` y `yolo26s-powerline-insulator-defect-tr.pt`; tamano 19,37 MB |
| Tarea | Object detection (deteccion de objetos) |
| Numero de clases | 2 (segun el nombre del dataset: aislador y defecto/daño superficial) |
| Tamano de imagen de entrada | 640 px (valor usado en el ejemplo de inferencia) |
| Dataset de entrenamiento | "Elektrik İletim Hattı İzolatör Yüzey Hasarı ve Kusur Tespiti (2 Clase)" v1.0, tipo `evren-grade-a` |

## Arquitectura y entrenamiento

El modelo se basa en `yolo26s`, la variante "small" de la familia YOLO26 de Ultralytics. Se trata de un detector de objetos de una sola etapa (single-stage), disenado para equilibrar precision y latencia en inferencia en tiempo real. La model card no detalla la composicion interna de la red (backbone, neck, cabeza de deteccion), por lo que no se dispone de informacion sobre bloques concretos, mecanismos de atencion ni innovaciones especificas de la arquitectura mas alla de la denominacion comercial.

En cuanto al entrenamiento, el autor declara un coste computacional de 0,0769 GPU-horas sobre una unica GPU NVIDIA H200 o A100, lo que sugiere un ajuste fino relativamente corto sobre el dataset de dos clases. No se especifica el numero de imagenes, la composicion del dataset, el numero de epocas ni si se aplicaron tecnicas de aumento de datos, destilacion o ajuste de hiperparametros. Tampoco se documenta el uso de RLHF/DPO (no aplicable a un detector) ni de decodificacion especulativa. La informacion sobre el proceso de entrenamiento es, por tanto, escasa y se limita a los datos de configuracion recogidos en la tabla anterior.

## Capacidades

- Deteccion de objetos en imagenes en tiempo real con dos clases: aisladores de lineas de alta tension y defectos/daños superficiales en los mismos.
- Localizacion con cajas delimitadoras y puntuacion de confianza por deteccion (salida estandar de Ultralytics: `boxes`, `cls`, `conf`).
- Inferencia sobre imagenes individuales mediante `model.predict(source=..., imgsz=640, conf=0.25, iou=0.45)`.
- Integracion con el ecosistema Ultralytics (Python y CLI), lo que facilita el reentrenamiento, la exportacion a otros formatos y el despliegue.
- Capacidades multilingues limitadas a la documentacion y etiquetas en turco e ingles; el modelo en si no procesa texto.
- No dispone de tool calling, function calling, razonamiento multi-paso, agentes, vision-lenguaje, audio ni modo "thinking": es exclusivamente un detector visual.

## Casos de uso

- Inspeccion automatica de lineas de alta tension con drones: el modelo se embarca en la carga util de un dron que sobrevuela la linea y procesa fotogramas a 640 px para marcar aisladores dañados, reduciendo la necesidad de inspeccion manual en torres y tramos de dificil acceso.
- Mantenimiento predictivo en subestaciones: integrado en camaras fijas o robotizadas, detecta defectos superficiales en aisladores y genera alertas tempranas antes de que deriven en fallos de aislamiento.
- Revision de imagenes termograficas o RGB post-vuelo: procesamiento por lotes de las capturas de una campana de inspeccion para priorizar las torres que requieren intervencion, usando la confianza por deteccion como criterio de triaje.
- Control de calidad en fabricacion de aisladores: en linea de produccion, el detector verifica la integridad superficial de cada pieza y descarta unidades con defectos visibles.
- Sistemas de gestion de activos energeticos: alimentar un inventario geoespacial con las detecciones y su ubicacion para planificar sustituciones y presupuestos de mantenimiento.
- Prototipado rapido en investigacion aplicada: al ser un modelo pequeno (19,37 MB) y con licencia CC-BY-4.0, sirve como linea base para experimentos de deteccion de defectos en infraestructura o para comparar con otros detectores en el mismo dataset.
- Despliegue en borde (edge): su tamano reducido permite ejecutarlo en dispositivos con recursos limitados (Jetson, Raspberry Pi con acelerador) para inspeccion local sin conexion.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente; `verified: false`):

| Metrica | Valor | Dataset |
|---|---:|---|
| mAP@50 (%) | 98,25 | Elektrik İletim Hattı İzolatör Yüzey Hasarı ve Kusur Tespiti (2 Clase) |
| mAP@50-95 (%) | 76,12 | Elektrik İletim Hattı İzolatör Yüzey Hasarı ve Kusur Tespiti (2 Clase) |
| F1 Score (%) | 96,95 | Elektrik İletim Hattı İzolatör Yüzey Hasarı ve Kusur Tespiti (2 Clase) |

La model card anade ademas, en su tabla de rendimiento, precision del 95,81 % y recall del 98,22 %, aunque estos valores no aparecen en el model-index estructurado. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Para un detector de ~19 MB en FP32, la huella de pesos es inferior a 100 MB; el consumo dominante sera el de activaciones y el tamano de lote. En la practica, cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: el autor cita NVIDIA H200 y A100 para el entrenamiento (0,0769 GPU-horas). Para inferencia, cualquier GPU moderna es suficiente; una RTX 4090, RTX 3090, A10, T4 o L4 cubren el caso con margen.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060, RTX 4070 o superiores; tambien en iGPU y aceleradores de borde si se exporta a ONNX/TensorRT.
- Opciones de despliegue: Ultralytics (Python/CLI) de forma nativa; exportacion a ONNX, TensorRT, OpenVINO u otros formatos mediante `model.export()` (no se documentan artefactos ya exportados en el repositorio). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector visual.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / entrada | mAP@50-95 | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| yolo26s-powerline-insulator-defect-tr | YOLO26 Small | no disponible | imagen 640 px | 76,12 (declarado) | CC-BY-4.0 | Hugging Face, 0 descargas |
| YOLO11s (Ultralytics) | YOLO11 Small | no disponible | imagen 640 px | no disponible (referencia general, no especializada) | AGPL-3.0 / Enterprise | Ampliamente disponible |
| YOLOv8s (Ultralytics) | YOLOv8 Small | no disponible | imagen 640 px | no disponible (referencia general) | AGPL-3.0 / Enterprise | Ampliamente disponible |

La comparativa es limitada: no se dispone de metricas de los modelos genericos sobre este dataset concreto, ni de otros detectores especializados en aisladores con los que contrastar. La ventaja principal de este modelo frente a los YOLO genericos es su ajuste especifico al dominio; su desventaja es la falta de validacion independiente y la ausencia de variantes exportadas.

## Limitaciones y advertencias

- Metricas no verificadas: el model-index marca los resultados como `verified: false`; proceden unicamente del autor y no han sido reproducidos de forma independiente.
- Modelo de autor unico con cero descargas y cero likes en el momento de la ficha: madurez y soporte comunitario muy limitados.
- Dataset de dominio muy concreto (aisladores de alta tension, dos clases): probable degradacion fuera de ese dominio o con condiciones de iluminacion, angulo y fondo distintas a las del entrenamiento.
- Riesgo de falsos positivos y negativos en escenarios de produccion; la precision del 95,81 % y el recall del 98,22 % declarados no eliminan la necesidad de revision humana en decisiones criticas de mantenimiento.
- Sesgos desconocidos: no se documenta la composicion del dataset (geografia, tipo de aislador, camara, condiciones meteorologicas), por lo que no puede evaluarse el sesgo de dominio.
- Limitacion idiomatica: el modelo no procesa texto; el soporte tr/en se refiere a la documentacion y etiquetas, no a capacidades multilingues reales.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero exige citar al autor y conservar el aviso de licencia; no hay garantias ni responsabilidad por parte del autor.
- No se publican artefactos ONNX/TensorRT/INT8 listos para usar; el despliegue en borde requiere exportacion y validacion propias.
- No se documentan curvas de entrenamiento, matriz de confusion ni rendimiento por clase, lo que dificulta evaluar el equilibrio entre las dos clases.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kenantabak/yolo26s-powerline-insulator-defect-tr
- Pagina del modelo en la plataforma EVREN (estado PRODUCTION): https://evren.ssyz.org.tr/models/u19979974710e/elektrik-iletim-hatti-izolator-ve-yuzey-hasari-tespiti
- Perfil del desarrollador en EVREN: https://evren.ssyz.org.tr/users/u19979974710e
- Catalogo de datasets turcos de vision por computador del autor: https://huggingface.co/datasets/kenantabak/evren-turkish-computer-vision-316-datasets
- Repositorio de Ultralytics (framework): https://github.com/ultralytics/ultralytics
