# illimax/Yolpe-nano-v1

## Resumen

Yolpe-nano-v1 es un modelo de deteccion de objetos especializado en la deteccion de personas, desarrollado por el usuario illimax y publicado en Hugging Face. Se trata de un fine-tuning del modelo YOLO26n preentrenado en COCO, adaptado al dataset CrowdHuman para operar en pipelines de analisis de aglomeraciones (crowd counting y monitorizacion de densidad de personas). El modelo resuelve una tarea concreta: detectar personas individuales en escenas con alta densidad de individuos, donde los detectores genericos suelen fallar por solapamiento y oclusion.

La arquitectura subyacente es YOLO26n, un detector end-to-end de la familia Ultralytics que elimina la necesidad de NMS (Non-Maximum Suppression) en la fase de postprocesado, lo que simplifica el despliegue en produccion y reduce la latencia del pipeline. El modelo se distribuye con un unico clase de salida (`person`) y se entrena a una resolucion de entrada de 1280 pixeles, lo que favorece la deteccion de instancias pequenas en escenas concurridas.

Es relevante porque cubre un nicho especifico (deteccion de personas en contextos de aglomeracion) con un modelo de tamano nano, apto para despliegue en hardware modesto o en el borde. No obstante, su licencia AGPL-3.0 y el origen no comercial de los datos de entrenamiento (CrowdHuman) imponen restricciones importantes para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics), detector end-to-end sin NMS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (exportable a ONNX/TensorRT segun la model card) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch/Ultralytics); exportable a ONNX y TensorRT |

## Arquitectura y entrenamiento

El modelo parte de YOLO26n preentrenado en COCO y se afina sobre CrowdHuman, un dataset de deteccion de personas en escenas concurridas. La arquitectura YOLO26 es un detector end-to-end que prescinde de NMS, lo que implica que el modelo produce directamente las detecciones finales. El entrenamiento se realizo con `imgsz` de 1280, 50 epocas, batch de 8 y paciencia de 10, segun el fichero `configs/train_26n.yaml` referenciado en la model card. El checkpoint publicado (`yolo26n-ywhob-v1.pt`) corresponde a la epoca 49, seleccionada por tener el mejor mAP50-95 en validacion.

No se especifican en la informacion disponible el numero de tokens (no aplica), la composicion detallada del dataset mas alla de CrowdHuman, ni si se aplicaron tecnicas de aumento de datos o regularizacion adicionales. Tampoco se detalla el proceso de anotacion ni el numero exacto de imagenes de entrenamiento y validacion.

## Capacidades

- Deteccion de personas en imagenes: salida de cajas delimitadoras con una unica clase (`0: person`).
- Deteccion en escenas de alta densidad: entrenado sobre CrowdHuman, orientado a aglomeraciones y oclusiones.
- Inferencia end-to-end sin NMS: el modelo YOLO26 genera detecciones finales directamente, lo que simplifica el postprocesado.
- Exportacion a ONNX y TensorRT: la model card indica que al exportar se debe configurar `max_det=1000`.
- Entrada a resolucion 1280: adecuado para objetos pequenos en escenas amplias.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (es un modelo de vision puro).

## Casos de uso

- Monitorizacion de aforo en espacios cerrados: el modelo puede contar personas en imagenes de camaras fijas para estimar ocupacion en tiempo real, aprovechando su entrenamiento en escenas concurridas.
- Gestion de aglomeraciones en eventos: deteccion de densidad de personas en recintos para activar alertas cuando se superan umbrales de aforo, con la salvedad de que la precision en CCTV real debe evaluarse aparte.
- Analisis de flujo de peatones: procesamiento por lotes de imagenes de calles o estaciones para generar mapas de calor de presencia de personas.
- Control de acceso y seguridad perimetral: deteccion de intrusiones humanas en zonas restringidas mediante camaras, integrado en pipelines de vision por computador.
- Investigacion en vision artificial: punto de partida para fine-tuning adicional sobre dominios especificos (retail, transporte, industria) gracias a la libreria Ultralytics.
- Prototipado rapido en el borde: al ser un modelo nano, puede desplegarse en dispositivos con recursos limitados para pruebas de concepto de deteccion de personas.
- Analisis post-hoc de grabaciones: procesamiento offline de videos para extraer metricas de ocupacion y densidad a lo largo del tiempo.

## Benchmarks y rendimiento

Resultados de validacion sobre CrowdHuman en la epoca 49, segun la model card:

| Metrica | Valor |
|---|---|
| Precision | 0.925 |
| Recall | 0.849 |
| mAP50 | 0.928 |
| mAP50-95 | 0.623 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni evaluaciones sobre datasets distintos de CrowdHuman.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; al ser un modelo nano, la huella es reducida y cabe en GPUs consumer de gama media, aunque no se especifica una cifra concreta.
- GPU recomendadas: no disponible; por tamano (nano), es plausible su ejecucion en RTX 3060/4060 o superiores, pero no se confirma en la model card.
- Cabe en GPU consumer: probablemente si, dado el tamano nano de la familia YOLO26, aunque sin cifras oficiales.
- Opciones de despliegue: Ultralytics (nativo), exportacion a ONNX y TensorRT (mencionadas en la model card). No se mencionan vLLM, llama.cpp ni TGI (no aplican a vision).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yolpe-nano-v1 | no disponible (nano) | no aplica | mAP50-95 0.623 en CrowdHuman val | AGPL-3.0 | Hugging Face |
| YOLO26n (COCO) | no disponible | no aplica | no disponible en esta ficha | AGPL-3.0 (Ultralytics) | Ultralytics |
| Otros detectores de personas sobre CrowdHuman | no disponible | no aplica | no disponible | variable | no disponible |

No se dispone de datos comparativos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Los datos de entrenamiento (CrowdHuman) tienen licencia de uso no comercial para investigacion; esto condiciona el uso del modelo derivado.
- La licencia del modelo es AGPL-3.0, lo que impone obligaciones de copyleft para uso en red y puede ser incompatible con productos comerciales cerrados.
- Las metricas reportadas son sobre el conjunto de validacion de CrowdHuman; la precision en escenas reales de CCTV no ha sido evaluada y debe medirse por separado.
- Riesgo de falsos positivos y negativos en condiciones de baja iluminacion, oclusiones severas o angulos no representados en el dataset de entrenamiento.
- Al ser un modelo de una sola clase, no detecta otros objetos ni proporciona atributos (genero, edad, pose).
- No se documentan sesgos demograficos ni de otro tipo; al entrenarse sobre CrowdHuman, hereda las limitaciones de representatividad de dicho dataset.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar el despliegue en produccion sin pruebas propias.
- Al exportar a ONNX/TensorRT es necesario configurar `max_det=1000`, segun advierte la model card.

## Enlaces

- Hugging Face: https://huggingface.co/illimax/Yolpe-nano-v1
- Ultralytics (libreria): https://github.com/ultralytics/ultralytics
- Dataset CrowdHuman: https://www.crowdhuman.org/
