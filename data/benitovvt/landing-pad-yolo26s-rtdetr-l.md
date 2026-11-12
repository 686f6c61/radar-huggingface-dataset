# benitovvt/landing-pad-yolo26s-rtdetr-l

## Resumen

`benitovvt/landing-pad-yolo26s-rtdetr-l` es un repositorio que agrupa dos detectores de objetos de Ultralytics afinados desde pesos COCO para una tarea muy concreta: localizar una plataforma de aterrizaje con marca en H de 1 m × 1 m en imágenes cenitales de un dron simulado en Microsoft AirSim. Los modelos son YOLO26s (CNN, sin NMS) y RT-DETR-l (híbrido CNN + decoder transformer), ambos con una única clase (`landingsplatform`). El autor es benitovvt y el trabajo se enmarca en un proyecto de investigación estudiantil (Howest MCT, AI Engineer) sobre si un detector optimizado con TensorRT en una Jetson Orin Nano puede decidir en tiempo real si descender o abortar.

La relevancia del repositorio no está en los pesos en sí —entrenados sobre un único escenario sintético y con un conjunto de datos limpio— sino en la receta completa de cuantización y medición: comparativa FP32/FP16/INT8 en Jetson Orin Nano, calibración INT8 sobre un split separado y medición de FPS de cadena completa (captura en AirSim → JPEG por TCP → inferencia → decisión). El autor advierte explícitamente de que las métricas casi perfectas son un efecto techo del dataset y no evidencia de validez en un dron real.

El contexto de uso es, por tanto, reproducción de experimentos, docencia y línea base para sim-to-real o domain randomization. No es un modelo de lenguaje: es un par de detectores de visión por computador con licencia AGPL-3.0 y pesos en formato PyTorch (`.pt`) más motores TensorRT generados en destino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (CNN, NMS-free) y RT-DETR-l (hibrido CNN + decoder transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (vision por computador; entrada 640 × 640 px) |
| Tipos de cuantizacion | FP32, FP16, INT8 (TensorRT; RT-DETR-l INT8 es mixta) |
| Idiomas soportados | en (etiquetas y documentacion) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (Ultralytics) y motores TensorRT (`.engine`) generados en la Jetson |
| Tamano de los pesos | YOLO26s: 20 MB; RT-DETR-l: 66 MB |
| Clases | 1 (`0: landingsplatform`) |
| Resolucion de entrada | 640 × 640 (sin redimensionado respecto a la camara) |
| Dataset | benitovvt/airsim-landing-pad (train 3.000 / val 500 / test 1.000 / calib 300) |
| Libreria | Ultralytics 8.4.182 |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

YOLO26s es un detector CNN de la familia Ultralytics con decodificacion sin NMS, lo que simplifica el post-procesado y reduce latencia en el borde. RT-DETR-l combina un backbone CNN con un decoder transformer y usa consultas de objeto, lo que suele dar mejor rendimiento en angulos oblicuos a costa de mayor coste computacional. Ambos parten de pesos COCO preentrenados (`yolo26s.pt`, `rtdetr-l.pt`) y se afinan a una sola clase.

El entrenamiento usa el split `train` de 3.000 imágenes y `val` de 500 del dataset AirSim Landing Pad, con ángulos de inclinación θ ∈ [0°, 45°], distancias d ∈ [4, 32] m y aproximadamente un 10 % de negativos. Se entrenaron 100 épocas con paciencia de early stopping de 20 (RT-DETR-l se interrumpió tras la época 46 y se reanudó desde `last.pt`), batch 16 para YOLO26s y 4 para RT-DETR-l (limitado por una GPU de 6 GB), aumentación por defecto de Ultralytics más `flipud=0.5` y `fliplr=0.5` (válidas para una vista cenital de una marca simétrica), `seed=0` y `deterministic=True`. El stack fue Ultralytics 8.4.182, PyTorch 2.11.0 con CUDA 12.8, Python 3.12 y Windows 11 sobre una RTX 3060 Laptop de 6 GB. Los motores TensorRT se construyeron en la propia Jetson Orin Nano Super 8 GB (JetPack 6.2, TensorRT 10.7.0, modo de potencia 15 W) con calibración INT8 sobre un split `calib` separado de 300 imágenes.

## Capacidades

- Deteccion de una unica clase: plataforma de aterrizaje con marca en H de 1 m × 1 m en vista cenital.
- Funcionamiento en angulos de inclinacion de hasta 45° y distancias de 4 a 32 m.
- Inferencia en tiempo real en hardware de borde mediante motores TensorRT (FP32, FP16, INT8).
- Decodificacion sin NMS en YOLO26s, lo que simplifica el pipeline de post-procesado.
- Integracion con el ecosistema Ultralytics (entrenamiento, validacion, exportacion).
- Soporte de cuantizacion INT8 con calibracion sobre un split dedicado.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un detector de objetos, no un modelo generativo.
- No dispone de vision multimodal, audio ni modo de razonamiento.

## Casos de uso

- Reproduccion del experimento FP32/FP16/INT8 en Jetson: el repositorio incluye la receta de exportacion y las mediciones, de modo que un equipo puede replicar la comparativa de latencia y precision en su propia Jetson Orin Nano.
- Docencia en pipelines de aterrizaje de precision: sirve como ejemplo completo de captura en simulador, transporte de imagen por TCP, inferencia en el borde y logica de decision descend/abort.
- Linea base para sim-to-real: los pesos y el dataset permiten medir cuanto degrada un detector entrenado solo en sintetico al trasladarlo a imagenes reales o a escenarios con domain randomization.
- Prototipado de logica de aterrizaje en simulacion: con una unica clase y salida de caja, la decision de descender o abortar se puede implementar con umbrales de confianza y posicion, sin post-procesado complejo.
- Evaluacion comparativa de arquitecturas CNN frente a transformer en el borde: YOLO26s y RT-DETR-l comparten dataset y receta, lo que permite comparar latencia, tamano de motor y robustez en angulos oblicuos con las mismas condiciones.
- Estudio de cuantizacion mixta en TensorRT: el caso de RT-DETR-l INT8, donde TensorRT recurre a mayor precision en tensores del transformer y la cabeza de deteccion queda fuera de INT8, documenta un patron util para otros modelos con LayerNorm.
- Benchmark de latencia de cadena completa: las mediciones de FPS de cadena (captura + transporte + inferencia) sirven para dimensionar sistemas de borde donde la captura de imagen domina el coste.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados), sobre el split de test de 1.000 imágenes de `benitovvt/airsim-landing-pad`, en PyTorch sobre PC:

| Modelo | Precision | Recall | mAP50 | mAP50-95 | mAP50-95 a θ = 45° |
|---|---|---|---|---|---|
| YOLO26s | 1.000 | 1.000 | 0.995 | 0.976 | 0.928 |
| RT-DETR-l | 0.993 | 1.000 | 0.994 | 0.980 | 0.960 |

Motores TensorRT en Jetson Orin Nano (15 W), construidos en la propia Jetson:

| Motor | Tamano | Inferencia (media) | mAP50-95 | mAP50-95 a 30 m | Tasa de falsa alarma | FPS de cadena (media / p5) |
|---|---|---|---|---|---|---|
| YOLO26s FP32 | 39,9 MB | 19,0 ms | 0.984 | 0.972 | 0 % | 18,5 / 15,6 |
| YOLO26s FP16 | 22,7 MB | 9,4 ms | 0.984 | 0.972 | 0 % | 22,6 / 18,7 |
| YOLO26s INT8 | 13,2 MB | 6,8 ms | 0.919 | 0.843 | 0 % | 22,0 / 18,2 |
| RT-DETR-l FP32 | 131,3 MB | 65,0 ms | 0.981 | 0.967 | 0 % | 9,9 / 8,9 |
| RT-DETR-l FP16 | 67,5 MB | 36,1 ms | 0.974 | 0.935 | 0 % | 13,7 / 12,0 |
| RT-DETR-l INT8 (mixta) | 44,3 MB | 26,4 ms | 0.979 | 0.955 | 0 % | 15,9 / 13,6 |

Precision, recall y mAP50 se mantienen en 0,993–1,000 / 1,000 / 0,994–0,995 para los seis motores. El FPS de cadena incluye captura en AirSim en el PC (unos 24–28 ms), envio JPEG por TCP sobre USB-C (unos 1 ms), decodificacion JPEG y pre/post-procesado en la Jetson (unos 7–9 ms) e inferencia, medido sobre 500 frames con el dron a 10 m sobre la plataforma.

## Requisitos de hardware

- Entrenamiento: GPU de 6 GB suficiente para YOLO26s con batch 16 y para RT-DETR-l con batch 4; el autor uso una RTX 3060 Laptop de 6 GB.
- Inferencia en PC: YOLO26s tarda unos 15 ms y RT-DETR-l unos 36 ms en PyTorch sobre una RTX 3060 Laptop.
- Inferencia en borde: Jetson Orin Nano Super 8 GB, JetPack 6.2 (L4T R36.4.7), TensorRT 10.7.0, modo de potencia 15 W; contenedor `ultralytics/ultralytics:8.4.182-jetson-jetpack6`.
- VRAM estimada: no disponible de forma explícita; los tamanos de motor (13,2 MB a 131,3 MB) dan una idea del peso en memoria, pero no se publica el consumo total del proceso.
- Cabe en GPU de consumo: si, tanto en RTX 3060 Laptop como en Jetson Orin Nano; no se han publicado pruebas en otras GPU.
- Opciones de despliegue: Ultralytics (PyTorch) y exportacion a TensorRT; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 6,8 ms (YOLO26s INT8) a 65,0 ms (RT-DETR-l FP32) por inferencia en Jetson; FPS de cadena de 9,9 a 22,6 segun motor.
- Throughput: el mejor caso documentado es YOLO26s FP16 con 22,6 FPS de cadena de media y 18,7 FPS en el percentil 5.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / entrada | mAP50-95 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| YOLO26s (este repo) | CNN, NMS-free | no disponible | 640 × 640 px | 0.976 (PyTorch) / 0.984 (TensorRT FP16) | AGPL-3.0 | Hugging Face, 0 descargas |
| RT-DETR-l (este repo) | CNN + decoder transformer | no disponible | 640 × 640 px | 0.980 (PyTorch) / 0.974 (TensorRT FP16) | AGPL-3.0 | Hugging Face, 0 descargas |
| YOLO26s COCO (base) | CNN, NMS-free | no disponible | 640 × 640 px | no disponible en la informacion | AGPL-3.0 (Ultralytics) | Pesos oficiales de Ultralytics |
| RT-DETR-l COCO (base) | CNN + decoder transformer | no disponible | 640 × 640 px | no disponible en la informacion | AGPL-3.0 (Ultralytics) | Pesos oficiales de Ultralytics |

No se dispone de comparaciones con otros detectores de plataformas de aterrizaje ni con modelos especializados de la misma tarea en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado unicamente sobre imagenes sinteticas de un unico escenario simulado en AirSim; el autor advierte que las metricas casi perfectas son un efecto techo del dataset y no evidencia de funcionamiento en un dron real.
- Uso previsto limitado a reproducir experimentos, docencia y linea base para sim-to-real; fuera de alcance el vuelo real, las decisiones de seguridad critica, otras marcas o escenas, distancias menores de 4 m o mayores de 32 m y angulos oblicuos superiores a 45°.
- Una sola clase (`landingsplatform`); no detecta otros objetos ni distingue tipos de plataforma.
- El split de test usa direcciones de vision φ no vistas en entrenamiento, pero el dataset sigue siendo de un unico escenario, por lo que no cubre variabilidad de iluminacion, texturas o condiciones atmosfericas reales.
- La cuantizacion INT8 de YOLO26s degrada mAP50-95 de 0,984 a 0,919 y a 30 m de 0,972 a 0,843; conviene validar el impacto antes de desplegar INT8 en produccion.
- RT-DETR-l INT8 es un motor de precision mixta: TensorRT no encontro escalas INT8 para muchos tensores del transformer y la cabeza de deteccion queda fuera de INT8, lo que limita la ganancia de velocidad.
- La captura de imagen en AirSim domina el coste de la cadena, por lo que INT8 no supera a FP16 en FPS de extremo a extremo.
- Licencia AGPL-3.0: impone obligaciones de liberacion del codigo si se distribuye el modelo o se ofrece como servicio en red; revisar compatibilidad antes de uso comercial.
- Riesgo de alucinacion en sentido estricto no aplica, pero si el riesgo de falsos positivos o negativos fuera de la distribucion de entrenamiento; la tasa de falsa alarma reportada es 0 % solo en el test sintetico.
- No hay resultados publicados sobre latencia o precision en otras GPU distintas de la RTX 3060 Laptop y la Jetson Orin Nano.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/benitovvt/landing-pad-yolo26s-rtdetr-l
- Dataset AirSim Landing Pad: https://huggingface.co/datasets/benitovvt/airsim-landing-pad
- Codigo, receta de motores y mediciones: https://github.com/BenitoVanovervelt/jetson-quantized-landing
- Ultralytics (libreria y pesos base): https://github.com/ultralytics/ultralytics
- Microsoft AirSim: https://github.com/microsoft/AirSim
