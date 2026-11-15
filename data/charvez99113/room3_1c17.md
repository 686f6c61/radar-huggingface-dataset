# Charvez99113/room3_1c17

## Resumen

worker-1-c17 (identificador interno worker-1-m013, run e938) es un detector de objetos YOLO26n especializado en la clasificacion de suciedad en habitaciones, publicado por el usuario Charvez99113 en Hugging Face. El modelo forma parte de una linea de trabajo denominada worker-1 y no es un modelo de lenguaje: es un detector de vision por computador que identifica cinco clases de suciedad (derrame de liquido, papelera, basura, moho y mancha) sobre imagenes de habitaciones. Su relevancia no reside en una mejora de precision, sino en ser una alternativa de latencia: sustituye todas las activaciones SiLU de su predecesor worker-1-c16 por ReLU, manteniendo la misma arquitectura, el mismo recetario de entrenamiento y el mismo rendimiento medido.

El modelo se distribuye como un unico fichero `weights.onnx` (exportacion ONNX de la cabeza one-to-many cruda) acompanado de un `miner.py` que implementa el pipeline de inferencia y de un `chute_config.yml`. El repositorio ocupa 0.0 GB segun los metadatos de Hugging Face, lo que es coherente con un YOLO26n (la variante nano de la familia YOLO26) exportado a ONNX. No se trata de un modelo generativo ni conversacional: no tiene tokenizador, no procesa texto y no admite tool calling.

La ficha se redacta a partir de la model card publicada por el autor y de los metadatos de Hugging Face. Muchos campos habituales (parametros, contexto, idiomas, licencia explicita) no estan disponibles como tales y se indican como tales; cuando la model card aporta informacion indirecta (por ejemplo, la licencia AGPL-3.0 del modelo COCO del que desciende), se senala con la debida cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (detector de objetos de una etapa, familia Ultralytics), con activaciones ReLU en lugar de SiLU; exportado a ONNX con la cabeza one-to-many cruda |
| Parametros totales | no disponible (variante nano de YOLO26; la model card no publica el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto); entrada de imagen fija de 704 px con letterbox y pad 114 |
| Tipos de cuantizacion | no disponible (solo se distribuye el ONNX en el formato exportado; no se documentan variantes INT8/FP16) |
| Idiomas soportados | no aplica (modelo de vision); las etiquetas de clase estan en ingles |
| Licencia | no disponible en los metadatos del repo; el modelo padre desciende de `yolo26n.pt` (COCO, AGPL-3.0) segun la model card |
| Formato de pesos | ONNX (`weights.onnx`); el entrenamiento original uso `last.pt` de Ultralytics, no distribuido |
| Entrada | imagen RGB redimensionada a 704 px (letterbox, pad 114) |
| Clases | 5: 0 liquid spillage, 1 bin, 2 litter, 3 mould, 4 stain |
| Umbral de confianza | 0.25 para todas las clases |
| NMS | IoU 0.5, max_det 100 |
| Runtime | ONNX Runtime, intra 2 / inter 1, OpenCV 1 hilo, CUDA con fallback a CPU |
| Fecha de creacion | 2026-11-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un YOLO26n, la variante nano de la familia YOLO26 de Ultralytics, un detector de objetos de una etapa con cabeza de prediccion densa. La unica modificacion estructural respecto a su predecesor worker-1-c16 es el reemplazo de todas las activaciones SiLU por ReLU, con carga estricta de todos los pesos (strict load). El modelo se exporta a ONNX conservando la cabeza one-to-many cruda, y el post-procesado (NMS, umbrales, regla de anidamiento de basura) se realiza en `miner.py`.

El entrenamiento parte de worker-1-m007 (a su vez derivado del modelo COCO `yolo26n.pt` via worker-1-m006) y se afina durante 15 epochs a 704 px, batch 16, semilla 1, SGD con lr0 0.01, lrf 0.1, warmup 1 y close_mosaic 3, usando Ultralytics 8.4.165 y un entrenador de destilacion propio (`train_kd18.py`). Los datos corresponden a la configuracion dc-243, identica a la de worker-1-c13, c15 y c16: dc-233 (etiquetas de fusion de cajas sobre las imagenes del propietario mas etiquetas del propietario sobre 4214 imagenes nuevas) mas 151 rondas exactas de ground truth del propietario multiplicadas por 8 (`sillysilent/new-room-gt@0301c372`); la ronda publica mas reciente incluida en entrenamiento es la 9465600. Se aplica destilacion densa de conocimiento desde `apexlabs-hq/sn44-dirtiness-v24@f7e28a46` con kd_cls 0.5, kd_box 0.5, etiquetas duras conservadas y kd_hard 1. Respecto a worker-1-c16, solo cambia `weights.onnx` (ReLU en lugar de SiLU, semilla 1 en lugar de 2); `miner.py` y `chute_config.yml` son byte a byte identicos.

La innovacion declarada no es algoritmica sino de coste computacional: ReLU es mas barata que SiLU en CPU. Sobre 2 CPUs fijadas de un mismo complejo L3, la llamada mas rapida de c17 es 0.873-0.884x la de c16 en 4 de 4 ejecuciones, y el percentil 80 de llamada es 0.90-0.95x bajo throttling del host. La medicion sin fijar afinidad es ruidosa (ratios de 0.73 a 1.03 entre procesos).

## Capacidades

- Deteccion de objetos en imagenes de habitaciones con cinco clases de suciedad: derrame de liquido, papelera, basura, moho y mancha.
- Localizacion con cajas delimitadoras y puntuaciones de confianza por clase, con NMS configurado (IoU 0.5, max_det 100).
- Regla de post-procesado especifica para basura: agrupacion por `nest_iomin` 0.8 restringida a la clase 2 (litter), documentada en W1-2990, W1-2993 y W1-2999.
- Inferencia en CPU y en GPU (CUDA primero, con fallback a CPU), pensada para entornos con recursos limitados.
- Exportacion ONNX con cabeza one-to-many cruda, lo que permite integrar el modelo en pipelines propios sin depender de Ultralytics en tiempo de inferencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un detector visual.
- No tiene capacidades multilingues ni de vision-lenguaje; las etiquetas de clase estan en ingles.

## Casos de uso

- Monitorizacion automatizada de limpieza en instalaciones: el modelo puede procesar imagenes periodicas de habitaciones (hoteles, residencias, oficinas) y emitir alertas cuando detecta derrames, basura o manchas, con la ventaja de que la variante ReLU reduce el coste en CPU en entornos sin GPU.
- Despliegue en dispositivos de borde con CPU limitada: al requerir solo ONNX Runtime con 2 hilos intra y 1 inter, y al ser aproximadamente un 12 por ciento mas rapido que c16 en la llamada mas rapida sobre 2 CPUs fijadas, encaja en gateways o mini-PC que no pueden asumir SiLU.
- Inspeccion de higiene en el sector hostelero: deteccion de moho y manchas en superficies para priorizar inspecciones manuales, usando el umbral de confianza 0.25 y el max_det 100 ya calibrados en el pipeline.
- Auditoria de estado de contenedores y papeleras: la clase bin permite inventariar papeleras presentes en la escena y detectar su ausencia o desbordamiento combinado con la clase litter.
- Control de calidad en pipelines de vision existentes: al exportarse como ONNX con cabeza one-to-many cruda, puede sustituir a c16 en un `miner.py` ya desplegado cambiando solo el fichero de pesos, sin tocar la configuracion (`chute_config.yml` es identico).
- Generacion de datos etiquetados para reentrenamiento: las detecciones del modelo pueden servir como pre-etiquetado en un bucle de anotacion asistida, siempre que se revise manualmente dada la debilidad conocida en la clase litter (AP 0.82).
- Experimentacion academica sobre activaciones: al ser un par controlado SiLU/ReLU con el mismo recetario y datos, sirve para estudiar el impacto de la funcion de activacion en detectores nano sin cambiar otras variables.

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks estandar (MMLU, HumanEval, etc.), sino metricas internas del proyecto worker-1 sobre su propio conjunto de validacion reconstruido (`data/gt_n775`, 92 rondas hasta el bloque 9509700, FULL+PARTIAL). Se presentan tal cual, con la advertencia de que el ground truth es una reconstruccion a partir de las cajas de los mineros publicados, no el ground truth del validador.

| Referencia (ventana) | n | c17 menos referencia | rondas con abs(d) > 0.045 | P(no similar) |
|---|---|---|---|---|
| worker-1-c16, recomendado (> 9494809) | 40 | -0.0007 [-0.0047, +0.0033] | 0 de 40; 0 de 10 | - |
| apexlabs v24, lider (> 9494809) | 40 | +0.0083 [-0.0017, +0.0204] | 4 de 40; 1 de 10 | 0.32 |
| Targaryen101 olaf (> 9502225) | 22 | +0.0079 [-0.0125, +0.0327] | 5 de 22; 2 de 10 | 0.82 |
| Cargile comet-194 (> 9500489) | 27 | +0.0276 [+0.0026, +0.0625] | 3 de 27; 2 de 10 | 0.37 |
| worker-2-c13, desplegado (> 9494809) | 40 | +0.0350 [+0.0055, +0.0693] | 7 de 40; 3 de 10 | - |
| Cargile fern-488 (> 9494809) | 40 | +0.0200 [+0.0002, +0.0426] | 5 de 40; 1 de 10 | - |
| apexlabs v22 (> 9494809) | 40 | +0.0269 [+0.0069, +0.0498] | 10 de 40; 2 de 10 | - |

Metricas propias sobre la ventana v24 (40 rondas, `evidence/metrics.json`):

| Metrica | Valor |
|---|---|
| VEC | 0.5849, IC [0.5596, 0.6071] |
| MAP medio | 0.938 |
| AP liquid spillage | 1.0 |
| AP bin | 1.0 |
| AP litter | 0.8151 |
| AP mould | 0.9062 |
| AP stain | 0.8611 |
| Histograma de falsos positivos | {0: 32, 1: 7, 2: 1} |
| Floor / zero / below silent / without GT | 0.0 / 0.0 / 0.0 / 0.025 |

Puntuacion en el juez gt_n747 de worker-1: dos semillas ReLU leen 0.5766 y 0.5741, frente a una media de tres semillas SiLU de 0.5711 (W1-3045). En gt_n775 (n 40), la diferencia c17 menos c16 es -0.0007, con 0 de 40 rondas que difieran en mas de 0.045.

## Requisitos de hardware

- VRAM estimada: no disponible en la model card. Al ser un YOLO26n a 704 px, la huella es propia de un detector nano; no se publica una cifra concreta de VRAM ni de memoria RAM.
- GPU recomendadas: no se especifican modelos concretos. El pipeline usa CUDA primero con fallback a CPU; la comparacion de latencia se realizo sobre CPU (2 CPUs fijadas de un mismo complejo L3).
- Compatibilidad con GPU de consumo: no hay datos publicados. Por el tamano de la variante nano es plausible que quepa en GPU de consumo, pero no se confirma en la informacion disponible.
- Despliegue: ONNX Runtime (intra 2, inter 1), OpenCV con 1 hilo, `miner.py` como wrapper. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector ONNX.
- Latencia: la llamada mas rapida de c17 es 0.873-0.884x la de c16 en 4 de 4 ejecuciones sobre 2 CPUs fijadas; el percentil 80 es 0.90-0.95x bajo throttling. Sin fijar afinidad, los ratios varian de 0.73 a 1.03 entre procesos, por lo que la medicion es ruidosa.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Rendimiento (VEC en ventana v24) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| worker-1-c17 | YOLO26n ReLU, ONNX | no disponible | 704 px | 0.5849 [0.5596, 0.6071] | no disponible (padre AGPL-3.0) | Hugging Face, repo Charvez99113/room3_1c17 |
| worker-1-c16 | YOLO26n SiLU, ONNX | no disponible | 704 px | nivel con c17 (-0.0007) | no disponible (padre AGPL-3.0) | Hugging Face, repo del mismo autor |
| apexlabs-hq/sn44-dirtiness-v24 | detector de suciedad (profesor KD) | no disponible | no disponible | c17 esta +0.0083 frente a el | no disponible | Hugging Face, apexlabs-hq |
| Targaryen101 olaf | detector de suciedad | no disponible | no disponible | c17 esta +0.0079 frente a el | no disponible | Hugging Face, Targaryen101 |
| Cargile comet-194 | detector de suciedad | no disponible | no disponible | c17 esta +0.0276 frente a el | no disponible | Hugging Face, Cargile |
| worker-2-c13 | detector de suciedad desplegado | no disponible | no disponible | c17 esta +0.0350 frente a el | no disponible | Hugging Face, worker-2 |

No se dispone de datos para comparar con detectores genericos de referencia (por ejemplo, variantes estandar de YOLO26n en COCO), ya que la model card solo reporta comparaciones dentro del ecosistema worker-1.

## Limitaciones y advertencias

- No es una mejora de puntuacion: c17 esta a la par de worker-1-c16 (-0.0007, intervalo de confianza que cruza cero) y es T5.6-similar a el. Su unica ventaja es la latencia en CPU; solo debe elegirse sobre c16 si el margen G6 de c16 se considera demasiado estrecho.
- La medicion de latencia es ruidosa en el host de pruebas: sin fijar afinidad, los ratios en proceso varian de 0.73 a 1.03 entre procesos por colocacion de hilos entre complejos L3 y throttling. La cifra estable es el suelo de computo fijado, 0.87-0.88x.
- Exposicion a desempate como c16: al ser alumno de v24, la probabilidad de que el test T5.6 del validador lo declare no similar es 0.32 frente a v24 y 0.82 frente a olaf.
- La clase litter sigue siendo la debil (AP 0.8151 en la ventana v24; evidencia en `evidence/fpfn_n775/`).
- El ground truth usado en la validacion es una reconstruccion a partir de las cajas de los mineros publicados, no el ground truth del validador; las metricas deben interpretarse con esa cautela.
- Licencia: los metadatos de Hugging Face no declaran licencia. El modelo padre desciende de `yolo26n.pt` (COCO, AGPL-3.0) segun la model card, lo que impone obligaciones de copyleft para uso comercial y de red; conviene verificar la licencia antes de un despliegue en produccion.
- Riesgo de falsos positivos y negativos en escenas con iluminacion o angulos distintos a los del conjunto de entrenamiento; el histograma de FP en la ventana v24 muestra 8 rondas con al menos un falso positivo de 40.
- No apto para tareas fuera de la deteccion de suciedad en habitaciones: no procesa texto, no razona y no generaliza a otras clases sin reentrenamiento.
- Sesgos conocidos: no documentados en la model card; el conjunto de datos proviene de imagenes del propietario y de rondas publicas, lo que puede introducir sesgo de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charvez99113/room3_1c17
- Modelo padre (worker-1-m007, derivado de worker-1-c10): no disponible como enlace directo en la informacion proporcionada
- Profesor de destilacion: https://huggingface.co/apexlabs-hq/sn44-dirtiness-v24
- Conjunto de ground truth del propietario: https://huggingface.co/datasets/sillysilent/new-room-gt
- Elemento de referencia: `manako/Detect-room-dirtiness-detection` (no se proporciona URL)
- Repositorio de Ultralytics (framework de entrenamiento y exportacion): https://github.com/ultralytics/ultralytics
- Paper de YOLO26: no disponible en la informacion proporcionada
- Demos: no disponibles
