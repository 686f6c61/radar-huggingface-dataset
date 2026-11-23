# illimax/YolPe

## Resumen

YolPe es un detector de personas de una sola clase (`0: person`) desarrollado por el usuario illimax, orientado a vigilancia CCTV de largo alcance donde las personas aparecen muy pequenas y se solapan en aglomeraciones. Parte de YOLO26s preentrenado en COCO y se afina sobre el dataset CrowdHuman, manteniendo el rendimiento en distancias cortas mientras mejora drasticamente la deteccion de personas lejanas. El modelo es relevante porque resuelve un problema concreto y mal cubierto por los detectores genericos: el conteo fiable de multitudes en planos amplios y elevados, con un coste computacional de variante "small".

La arquitectura es un detector YOLO end-to-end sin NMS, con entrada nativa de 1280 px y capacidad de hasta 1000 detecciones por imagen. Segun la model card, la mejora en recall de largo alcance sobre la base YOLO26s es de 3.5x (de 0.225 a 0.798 en cajas de altura inferior a 48 px) y el tamano minimo de persona detectable baja de 128 px a 24 px. El modelo se desplego en produccion en un servicio real de monitorizacion de aglomeraciones durante el evento AI Future Education Expo 2026, con mas de 3000 usuarios y sin caidas durante dos dias.

La licencia es AGPL-3.0, lo que condiciona fuertemente su uso comercial en servicios de red. La model card esta mayoritariamente en coreano y no declara idiomas soportados, algo poco relevante para una tarea puramente visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (Ultralytics), detector end-to-end sin NMS |
| Parametros totales | no disponible (descrito como "6.0x fewer parameters" que YOLO26x) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (exportable a ONNX/TensorRT segun la model card) |
| Idiomas soportados | no aplica (deteccion de objetos) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch/Ultralytics); exportable a ONNX y TensorRT |

## Arquitectura y entrenamiento

YolPe es un fine-tuning de YOLO26s preentrenado en COCO, con una unica clase de salida (`person`) y cajas de cuerpo completo que incluyen las partes ocluidas. La inferencia es end-to-end sin supresion de no maximos (NMS), lo que simplifica el despliegue y reduce latencia en escenas con muchas detecciones. La resolucion de entrada es 1280 px (tambien evaluada a 960 px) y el limite de deteccion recomendado es `max_det=1000`, ya que el valor por defecto de 300 trunca el conteo en escenas densas.

El entrenamiento usa CrowdHuman: 15 000 imagenes de entrenamiento y 4370 de validacion. Se aplico un tratamiento especifico de las regiones `mask` e `ignore` de CrowdHuman: en lugar de eliminar simplemente las etiquetas, esas zonas se pintaron de gris (valor 114) para evitar que el modelo aprendiera a interpretar multitudes densas y lejanas como "ausencia de persona", un detalle que segun el autor es clave para el rendimiento en largo alcance. La configuracion incluye `imgsz=1280`, 50 epocas con paciencia de 10, batch 8, mosaic 1.0 con `close_mosaic=10`, escala y flip horizontal a 0.5, sin flip vertical (camara fija) y `hsv_v=0.4` para variaciones de iluminacion interior. Se aplico early stopping en la epoca 47 y se selecciono el checkpoint de la epoca 37, la de mayor mAP50-95 en validacion. Framework: Ultralytics 8.4.163.

## Capacidades

- Deteccion de personas en una sola clase, con cajas de cuerpo completo incluyendo partes ocluidas.
- Deteccion de personas de muy pequeno tamano (hasta 24 px de altura de caja), adecuada para planos CCTV elevados y amplios.
- Conteo de multitudes densas con hasta 1000 detecciones por imagen mediante `max_det=1000`.
- Inferencia end-to-end sin NMS, lo que reduce latencia en escenas con solapamiento alto.
- Exportacion a ONNX y TensorRT (con `max_det` fijado en el grafo).
- Funcionamiento en CPU: la comparativa de campo se realizo en CPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues; es exclusivamente un modelo de vision para deteccion.

## Casos de uso

- Monitorizacion de aforo en recintos feriales y eventos: el modelo actualiza el conteo por zona cada 10 segundos procesando 5 fotogramas por ciclo desde un unico portatil, tal como se hizo en el AI Future Education Expo 2026 con mas de 3000 asistentes.
- Conteo de personas en CCTV de interior con camaras elevadas: su recall de 0.930 en cajas de 48-128 px y de 0.798 por debajo de 48 px lo hace adecuado para planos generales donde los detectores COCO fallan.
- Control de densidad en transporte publico (andenes, vestibulos): permite estimar ocupacion en tiempo real sobre streams de 640 px de ancho con hardware modesto.
- Analitica de flujo peatonal en retail: al detectar personas lejanas y ocluidas, mejora los mapas de calor y las metricas de trafico frente a YOLO estandar.
- Seguridad perimetral y deteccion de intrusion: la clase unica persona y el alto recall reducen los falsos negativos en zonas alejadas de la camara.
- Despliegue en edge con privacidad: el servicio de referencia solo publica imagenes con las personas difuminadas y no almacena video original, un patron replicable en cumplimiento de proteccion de datos.
- Procesamiento por lotes de grabaciones para auditoria de aforo: el modelo puede ejecutarse sobre fotogramas extraidos y exportarse a ONNX/TensorRT para acelerar el pipeline.

## Benchmarks y rendimiento

Resultados en CrowdHuman val (4370 imagenes, 99 481 personas), `imgsz=1280`, comparados con YOLO26s COCO filtrado a la clase person.

Recall por distancia (conf 0.35, cajas visibles, IoU 0.5):

| Distancia | Altura de caja | Personas | YOLO26s base | YolPe | Mejora |
|---|---|---|---|---|---|
| Largo alcance | < 48 px | 5535 | 0.225 | 0.798 | 3.5x |
| Medio alcance | 48-128 px | 14 966 | 0.559 | 0.930 | 1.7x |
| Corto alcance | >= 128 px | 27 703 | 0.852 | 0.969 | 1.14x |

Metricas globales:

| Metrica | Valor | Condiciones |
|---|---|---|
| Precision | 0.900 | conf 0.35 |
| Recall | 0.914 | conf 0.35 |
| Precision (max F1) | 0.940 | conf 0.371 |
| Recall (max F1) | 0.884 | conf 0.371 |
| mAP50 | 0.946 | conf 0.371 |
| Tasa de falsos positivos | ~10.0 % | tabla de confusion, CrowdHuman val |
| Tasa de falsos negativos | ~8.6 % | tabla de confusion, CrowdHuman val |
| Tamano minimo de persona detectable | 24 px | frente a 128 px de la base |

Comparativa de campo (un fotograma de CCTV real, CPU): YolPe detecto 4x mas personas que YOLO26s base a la misma velocidad, y igualo los resultados de YOLO26x corriendo 6.7x mas rapido con 6.0x menos parametros. Estas cifras son del autor y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Por el tamano de la variante "s" y la resolucion de 1280 px, se espera un consumo moderado, pero no hay dato publicado.
- GPU recomendadas: no especificadas en la model card. El despliegue de referencia se ejecuto en CPU sobre un unico portatil.
- Cabe en GPU de consumo: probablemente si, al tratarse de una variante small, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: Ultralytics (Python), exportacion a ONNX y TensorRT; no se mencionan vLLM, llama.cpp ni TGI (no aplican a vision).
- Latencia y throughput: el servicio real proceso 5 fotogramas por ciclo cada 10 segundos por camara, con streams de 640 px de ancho, en un solo portatil y sin interrupciones. No se publican FPS ni latencias absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Recall largo alcance | Licencia | Notas |
|---|---|---|---|---|---|
| YolPe | ~6.0x menos que YOLO26x | 1280 | 0.798 (< 48 px) | AGPL-3.0 | Fine-tuning de YOLO26s en CrowdHuman |
| YOLO26s (COCO) | Base de YolPe | 1280 | 0.225 (< 48 px) | AGPL-3.0 (Ultralytics) | Detector generico de 80 clases |
| YOLO26x (COCO) | ~6.0x mas que YolPe | 1280 | no disponible por distancia | AGPL-3.0 (Ultralytics) | Iguala el recall de campo de YolPe pero 6.7x mas lento |

No se dispone de comparacion con otros detectores especializados en CrowdHuman (por ejemplo variantes de Faster R-CNN o modelos especificos de crowd counting) en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado unicamente en CrowdHuman: puede generalizar peor a dominios muy distintos (vision nocturna, infrarrojo, camaras en movimiento) sin reentrenamiento.
- Una sola clase: no detecta otros objetos ni proporciona atributos (pose, genero, edad); cualquier uso de identificacion no esta soportado.
- Metricas de la model card calculadas sobre el dataset de validacion, no medidas en campo; el autor lo advierte explicitamente.
- Tasa de falsos positivos de aproximadamente 10.0 % y de falsos negativos de aproximadamente 8.6 % en CrowdHuman val, lo que exige umbrales ajustados para conteo de aforo critico.
- Licencia AGPL-3.0: el uso en servicios de red obliga a liberar el codigo fuente derivado; para uso comercial cerrado se requiere licencia alternativa de Ultralytics.
- En escenas densas es imprescindible fijar `max_det=1000`; el valor por defecto de 300 trunca el conteo.
- La model card esta en coreano y la documentacion en ingles es limitada; no hay ficha tecnica detallada de parametros ni de cuantizaciones.
- Riesgo de alucinacion no aplica (modelo de vision), pero si el riesgo de detecciones espurias en texturas y patrones que se parezcan a personas.
- Uso sujeto a normativa de proteccion de datos: el servicio de referencia difumina a las personas y no almacena video original; replicar ese patron es recomendable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/illimax/YolPe
- Demo (Hugging Face Space): https://huggingface.co/spaces/illimax/YolPe
- Codigo de entrenamiento: https://github.com/lkw-k/YolPe
- Codigo del servicio de monitorizacion (YOBA): https://github.com/lkw-k/YOBA
- Dataset CrowdHuman (referencia arXiv:1805.00123): https://arxiv.org/abs/1805.00123
- Ultralytics (framework): https://github.com/ultralytics/ultralytics
