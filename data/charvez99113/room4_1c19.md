# Charvez99113/room4_1c19

## Resumen

`room4_1c19` es un detector de objetos basado en YOLO26n, publicado por el usuario Charvez99113 en Hugging Face, especializado en la deteccion de suciedad en habitaciones. El modelo identifica cinco clases de incidencias: derrames de liquido, papeleras, basura, moho y manchas. Su origen es un pipeline de mineria de modelos (worker-1) en el que se parte de los pesos de un detector previo (`worker-1-c16`) y se reentrena con rondas publicas de estilo reciente y destilacion de conocimiento densa desde dos profesores: `apexlabs-hq/sn44-dirtiness-v24` y `CEOMark6/Dirtiness_Nov05`.

El modelo se distribuye unicamente como grafo ONNX (`weights.onnx`), con entrada 1x3x704x704 y salida 1x9x10164, acompanado de un script de inferencia (`miner.py`) y un fichero de configuracion (`chute_config.yml`). No se publican pesos en formato PyTorch ni safetensors, ni una model card estandar de Hugging Face con licencia o idiomas declarados.

La relevancia de esta ficha es limitada: se trata de un artefacto de un experimento interno de mineria de modelos, con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado y sin licencia explicita. La informacion disponible proviene exclusivamente de la model card del autor, que describe con detalle el proceso de entrenamiento y validacion, pero no incluye especificaciones habituales como numero de parametros, contexto o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (detector de objetos de una etapa, derivado de Ultralytics), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se distribuye el grafo ONNX sin cuantizar declarado) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible en la model card; el padre YOLO26n es AGPL-3.0 segun la card |
| Formato de pesos | ONNX (`weights.onnx`); no se incluyen safetensors ni GGUF |
| Entrada | tensor 1x3x704x704 (imagen RGB, letterbox pad 114) |
| Salida | tensor 1x9x10164 (cabeza one-to-many cruda) |
| Clases | 0 liquid spillage, 1 bin, 2 litter, 3 mould, 4 stain |
| Nodos del grafo | 368 nodos, 223 inicializadores |
| Tamano del repo | 0.0 GB (segun Hugging Face) |

## Arquitectura y entrenamiento

El modelo es un detector YOLO26n (variante nano de la familia YOLO26 de Ultralytics) inicializado desde pesos COCO (`yolo26n.pt`, AGPL-3.0) y heredado del linaje `worker-1-c16`. Se entrena durante 15 epocas a 704 px, batch 16, semilla 2, con SGD (lr0 0.01, lrf 0.1, warmup 1, close_mosaic 3) sobre Ultralytics 8.4.165 y un entrenador de destilacion propio (`train_kd28.py`). La exportacion a ONNX conserva la cabeza one-to-many cruda, con el mismo grafo que `worker-1-c16` (368 nodos, 223 inicializadores, misma secuencia de operaciones).

El entrenamiento combina etiquetas duras con destilacion de conocimiento densa (`kd_merge=bestimg`): para cada imagen se elige el profesor que mejor concuerda con sus etiquetas entre `apexlabs-hq/sn44-dirtiness-v24` (fuerte en estilos antiguos) y `CEOMark6/Dirtiness_Nov05` (fuerte en el estilo mas reciente), con `kd_cls 0.5`, `kd_box 0.5` y `kd_hard 1`. Los datos provienen de la configuracion `dc-299`, que incluye etiquetas del propietario, rondas reconstruidas y rondas publicas de estilo reciente ponderadas x32 por encima del bloque 9531000 (x8 por debajo), con la ronda publica mas reciente en entrenamiento en 9534000. El objetivo declarado es recuperar recall en manchas y derrames sobre el estilo de imagen mas nuevo, donde el modelo desplegado `worker-1-c16` perdia rendimiento.

## Capacidades

- Deteccion de objetos en imagenes de habitaciones para cinco clases de suciedad: derrames de liquido, papeleras, basura, moho y manchas.
- Inferencia sobre imagenes individuales a 704x704 con letterbox y pad 114.
- Regla especifica de anidamiento para la clase basura (`nest_iomin` 0.8, `nest_classes` [2]).
- Umbral de confianza fijo de 0.25 para todas las clases, NMS 0.5 y `max_det` 100.
- Ejecucion via ONNX Runtime con `CUDAExecutionProvider` y fallback a CPU; hilos intra 2 / inter 1, OpenCV con 1 hilo.
- No soporta tool calling, agentes, razonamiento multi-paso, vision-lenguaje ni capacidades multilingues: es un detector puro de vision por computador.
- No dispone de modo thinking, audio ni generacion de texto.

## Casos de uso

- Auditoria automatizada de limpieza en alojamientos turisticos: el modelo puede procesar fotografias de habitaciones y devolver cajas con clase y confianza para derrames, basura, moho y manchas, permitiendo priorizar incidencias antes de la entrada de huespedes.
- Control de calidad en cadenas de hotel: integrado en un pipeline por lotes con ONNX Runtime, permite puntuar cada habitacion segun el numero y tipo de detecciones y generar informes por planta o turno.
- Inspeccion de viviendas en alquiler: a partir de fotos subidas por el inquilino o el propietario, el detector identifica moho y manchas para activar protocolos de mantenimiento.
- Monitorizacion de espacios comunes (oficinas, gimnasios, comedores): con camaras fijas y capturas periodicas, el modelo detecta papeleras desbordadas o basura acumulada y dispara avisos al equipo de limpieza.
- Triaje en aplicaciones de reporte ciudadano: el usuario envia una foto de una incidencia y el modelo clasifica automaticamente si es derrame, basura, moho o mancha, reduciendo la carga de revision manual.
- Preprocesado para modelos de vision-lenguaje: las cajas y clases generadas pueden alimentar un sistema posterior que redacte descripciones o instrucciones de limpieza, dado que el detector es ligero (YOLO26n) y se ejecuta en CPU o GPU modesta.
- Filtrado de datasets de imagenes de interiores: el modelo puede etiquetar automaticamente grandes volumenes de fotos para entrenar o depurar otros detectores de suciedad.

## Benchmarks y rendimiento

Los datos de validacion de la model card se refieren a la metrica VEC (definida por el autor) sobre rondas reconstruidas, no a benchmarks estandar como COCO mAP. Se reproducen a continuacion.

Conjunto live limpio (rondas > 9534000, fuera de muestra, n=6: 5 FULL + 1 PARTIAL), VEC 0.6025 [0.5471, 0.6302]:

| Referencia | n | Diferencia (este menos referencia) | Rondas con abs(d) > 0.045 |
|---|---|---|---|
| room5_1c16 (worker-1-c16 live) | 6 | +0.0068 [+0.0000, +0.0201] | 0 de 6 |
| CEOMark6 Dirtiness_Nov05 (commit 9531969) | 5 | -0.0106 [-0.0317, +0.0000] | 1 de 5 |
| Cargile nova-772 | 6 | +0.0023 [-0.0131, +0.0200] | 0 de 6 |
| CVCompressor dirtiness_1646 | 6 | +0.0112 [-0.0197, +0.0445] | 2 de 6 |
| crimedetector dirty2 | 6 | +0.0037 [-0.0089, +0.0200] | 0 de 6 |
| crimedetector room-dirtiness_M | 6 | +0.1046 [+0.0000, +0.3113] | 1 de 6 |

Ventana > 9512777 (60 rondas, 46 FULL; en muestra hasta 9534000): VEC 0.5709 [0.5459, 0.5923]; MAP medio 0.9074; pilar FP medio 0.9767; AP por clase: liquido 0.8965, papelera 0.9370, basura 0.8477, moho 0.8889, mancha 0.8725; histograma de FP {0: 47, 1: 12, 2: 1}. Frente a room5_1c16 en 54 rondas comunes: +0.0174 [+0.0032, +0.0326], 11 de 54 distintas.

Rondas held-out (63 rondas reconstruidas anteriores al commit de Nov05, fuera de entrenamiento): VEC 0.6028 frente a 0.5784 de `worker-1-c16` (run e923), diferencia pareada +0.0244 [+0.0113, +0.0409]; 17 rondas arriba, 1 abajo.

Prueba T5.6 (similitud): P(no similar) 0.37 frente a Nov05 (9 rondas), 0.76 frente a room5_1c16, 0.86 frente a nova-772.

Gates de autotest (worker-1): G1-G4 y G8-G10 PASS (replica R-COMP); G5 PASS (init 0.62 s, llamada maxima 0.09 s, 4 descriptores, sin escrituras); G7 GPU vs CPU en 600 imagenes: proporcion que pasa 1.000, IoU medio minimo 0.9990; G11 proveedor CUDA en el entorno de servicio; G6 A/B frente a `worker-1-c16`: ratio de llamadas mas rapidas 0.989-1.000 (mismo grafo).

No se han publicado resultados de benchmarks estandar (COCO mAP, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Al ser un YOLO26n a 704x704 con salida 1x9x10164, la huella es reducida y cabe holgadamente en GPUs de consumo; no se proporciona una cifra concreta.
- GPU recomendadas: cualquier GPU con soporte CUDA para ONNX Runtime (`CUDAExecutionProvider`); el autor valida en GPU sin especificar modelo. Funciona tambien en CPU con fallback.
- GPU de consumo: si, previsiblemente en cualquier GPU consumer moderna (RTX 30/40, etc.), aunque no se aporta medicion concreta.
- Despliegue: ONNX Runtime (GPU o CPU) mediante el script `miner.py` incluido; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de vision).
- Latencia: init 0.62 s y llamada maxima 0.09 s en el autotest G5; ratio de llamadas mas rapidas 0.989-1.000 frente a `worker-1-c16` en G6 (mismo grafo).
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento (VEC, live set) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| room4_1c19 (este) | YOLO26n ONNX | no disponible | no aplica | 0.6025 [0.5471, 0.6302] | no disponible (padre AGPL-3.0) | Hugging Face, 0 descargas |
| worker-1-c16 (room5_1c16) | YOLO26n ONNX | no disponible | no aplica | 0.5957 aprox. (diferencia +0.0068) | no disponible | Hugging Face (referencia del autor) |
| CEOMark6 Dirtiness_Nov05 | detector de suciedad | no disponible | no aplica | 0.6131 aprox. (diferencia -0.0106) | no disponible | Hugging Face (profesor KD) |
| apexlabs-hq sn44-dirtiness-v24 | detector de suciedad | no disponible | no aplica | no disponible en la card | no disponible | Hugging Face (profesor KD) |

Las cifras de los comparadores se derivan de las diferencias pareadas publicadas en la model card; no se dispone de sus valores absolutos independientes. Los parametros y la licencia de los comparadores no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de vision especializado: no genera texto, no razona y no soporta tool calling ni agentes; no debe evaluarse como un LLM.
- La model card no declara licencia. El modelo padre (`yolo26n.pt`) es AGPL-3.0, lo que impone obligaciones de copyleft en despliegues derivados; conviene verificar antes de uso comercial.
- Solo se distribuye el grafo ONNX; no hay pesos PyTorch, safetensors ni GGUF, lo que limita el reentrenamiento y la inspeccion.
- El propio autor reconoce perdida de recall en manchas y derrames sobre el estilo de imagen mas nuevo en el modelo predecesor; esta version intenta corregirlo, pero la seccion "Known weaknesses" de la card aparece truncada en la informacion disponible.
- El conjunto de validacion "live" es muy pequeno (n=6) y el intervalo de confianza inferior de la mejora frente a `worker-1-c16` toca 0.0000, por lo que la ventaja no es concluyente.
- La ronda mas reciente (9536100) no pudo reconstruirse para validacion; el conjunto de prueba esta incompleto.
- Las etiquetas de ground truth son reconstruidas por el propio autor a partir de cajas publicadas por otros mineros, no la verdad del validador; puede haber sesgo circular.
- Umbrales fijos (conf 0.25, NMS 0.5) y reglas heuristicas (anidamiento de basura) que pueden no generalizar a otros dominios o estilos de imagen.
- Riesgo de falsos positivos en escenas con objetos ambiguos; el histograma reportado muestra 12 rondas con 1 FP y 1 ronda con 2 FP en la ventana de 60 rondas.
- Sin datos de sesgo demografico ni de robustez ante condiciones de iluminacion, resolucion o angulos distintos a los del conjunto de entrenamiento.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charvez99113/room4_1c19
- Profesor KD v24: https://huggingface.co/apexlabs-hq/sn44-dirtiness-v24
- Profesor KD Nov05: https://huggingface.co/CEOMark6/Dirtiness_Nov05
- Dataset de referencia del autor: https://huggingface.co/datasets/sillysilent/new-room-gt
- Elemento declarado: `manako/Detect-room-dirtiness-detection` (referencia interna, sin URL publica en la informacion disponible)
- Ultralytics (framework base): https://github.com/ultralytics/ultralytics
- ONNX Runtime: https://github.com/microsoft/onnxruntime
