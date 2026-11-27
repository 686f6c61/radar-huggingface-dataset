# mvdelibas/mars-terrain-seg-s5mars-yolo11s

## Resumen

Mars terrain seg s5mars yolo11s es un modelo de segmentacion de imagenes derivado de Ultralytics YOLO11s-seg, ajustado por el autor mvdelibas para la tarea S5Mars del benchmark Mars-Bench. Segmenta ocho clases de terreno en imagenes de la Mastcam del rover Curiosity: roca, cresta, agujero, rover, cielo, roca base, arena/suelo y huellas de las ruedas del rover. El objetivo es producir un mapa pixel a pixel del terreno que sirva de entrada a la planificacion de rutas de un rover.

El modelo parte de los pesos preentrenados oficiales de YOLO11s-seg y se afina sobre el conjunto mb-s5mars (Zenodo 17402881, CC BY 4.0), con imagenes de NASA/JPL-Caltech/MSSS. Devuelve simultaneamente cajas y mascaras por objeto, con un rendimiento en validacion de 68,8 % de mAP@50 en mascara y 70,1 % en caja. Es un modelo pequeno (variante "s") pensado para inferencia agil, no para cartografiado cientifico de alta precision.

Su relevancia es acotada: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, entrenado exclusivamente para imagenes de MSL Curiosity Mastcam. No es un modelo de lenguaje ni un sistema generalista; es un segmentador de vision por computador especifico de dominio, con licencia AGPL-3.0 heredada de Ultralytics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO11s-seg (detector-segmentador convolucional de una etapa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de 640 px durante el entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en .pt de PyTorch; no se documentan variantes GGUF, ONNX ni TensorRT) |
| Idiomas soportados | en, tr (etiquetas de clase en turco; la model card esta en ingles y turco) |
| Licencia | AGPL-3.0 (pesos derivados de Ultralytics YOLO11); datos de entrenamiento bajo CC BY 4.0 |
| Formato de pesos | .pt (PyTorch, via Ultralytics); fichero mars-arazi-seg-s5mars-yolo11s-seg.pt |

## Arquitectura y entrenamiento

YOLO11s-seg es un modelo de deteccion y segmentacion de instancias de una sola etapa, con backbone y cuello convolucionales y una cabeza que produce cajas y mascaras simultaneamente. El ajuste se realizo desde los pesos preentrenados oficiales de Ultralytics, a 640 px de resolucion, durante 60 epocas (mejor epoca en la 57), con lr0 = 0,001 y un factor de aumento de mosaico de 5,00. No se documenta el numero de tokens ni un pipeline de RLHF/DPO, ya que no es un modelo generativo de lenguaje.

Los datos proceden de Mars-Bench mb-s5mars (DOI 10.5281/zenodo.17402881), con imagenes de la Mastcam del Curiosity. La model card advierte que el conjunto original contenia imagenes duplicadas a nivel de byte: 5.997 imagenes en local frente a 5.800 elementos en la plataforma, con parte de las divisiones solapadas. El reparto de entrenamiento, validacion y test no se detalla mas alla de indicar que las metricas corresponden al split de validacion y que el split de test no se midio.

## Capacidades

- Segmentacion semantica/instancias de ocho clases de terreno marciano: ana_kaya, delik, sirt, kaya, gezgin, kum_toprak, gokyuzu y gezgin_tekerlek_izi (nombres de clase en turco dentro del modelo).
- Produccion conjunta de cajas delimitadoras y mascaras por objeto en una sola pasada.
- Deteccion del propio rover (gezgin) y de sus huellas (gezgin_tekerlek_izi), util para excluir el cuerpo del vehiculo del mapa de terreno.
- Inferencia sobre imagenes individuales mediante la API de Ultralytics (`model.predict`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de vision.
- Capacidades multilingues limitadas a la nomenclatura de clases (turco) y a la documentacion (ingles y turco); no procesa lenguaje.

## Casos de uso

- Planificacion de rutas de rover en investigacion: el mapa de mascaras por clase permite estimar zonas transitables (kum_toprak, sirt) frente a obstaculos (kaya, delik, ana_kaya) y alimentar un planificador de trayectorias en simulacion.
- Exclusion del cuerpo del rover en el pipeline de percepcion: la clase gezgin (AP50 97,9 %) permite enmascarar el vehiculo y sus ruedas antes de construir el mapa de terreno.
- Deteccion de huellas propias: la clase gezgin_tekerlek_izi sirve para el seguimiento de trayectorias recorridas, aunque su AP50 de 39,4 % exige validacion adicional.
- Segmentacion de horizonte y cielo: la clase gokyuzu (AP50 93,8 %) puede usarse para recortar la parte superior de la imagen y estimar la linea del horizonte en tareas de odometria visual.
- Generacion de etiquetas preliminares para anotacion humana: las mascaras del modelo pueden servir como propuesta inicial que un anotador revise, acelerando la creacion de nuevos conjuntos de datos marcianos.
- Evaluacion comparativa de segmentadores en el benchmark Mars-Bench: el modelo sirve como referencia de linea base YOLO11s-seg para la tarea S5Mars frente a otros enfoques.
- Docencia y demostraciones de vision por computador en ciencia planetaria: permite ilustrar segmentacion de instancias sobre imagenes reales de Curiosity con un modelo ligero y reproducible.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre el split de validacion (200 imagenes segun la seccion en turco):

| Metrica | Mascara | Caja |
|---|---:|---:|
| mAP@50 | 68,8 % | 70,1 % |
| mAP@50-95 | 50,3 % | 55,2 % |
| Precision | 0,709 | 0,717 |
| Recall | 0,615 | 0,622 |

Rendimiento por clase (AP@50 en caja):

| Clase | AP@50 | Precision | Recall |
|---|---:|---:|---:|
| gezgin | 97,9 % | 0,80 | 0,92 |
| gokyuzu | 93,8 % | 0,78 | 0,91 |
| sirt | 88,7 % | 0,79 | 0,88 |
| delik | 72,0 % | 0,60 | 0,54 |
| ana_kaya | 61,8 % | 0,40 | 0,78 |
| kum_toprak | 54,7 % | 0,57 | 0,51 |
| kaya | 47,9 % | 0,36 | 0,62 |
| gezgin_tekerlek_izi | 39,4 % | 0,59 | 0,43 |

No se han publicado resultados del split de test ni comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por tratarse de una variante "s" de YOLO11-seg, es esperable que quepa en GPUs de consumo con varios GB de VRAM, pero no se aportan cifras.
- GPUs recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no documentada; el tamano del repositorio es de 0,0 GB (redondeado), lo que sugiere pesos pequenos, pero no se confirma.
- Opciones de despliegue: Ultralytics (Python, `ultralytics.YOLO`); no se documentan exportaciones a ONNX, TensorRT, OpenVINO ni integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de comparacion con otros segmentadores de terreno marciano en la informacion proporcionada. Como referencia estructural, el modelo se basa en YOLO11s-seg de Ultralytics, pero no se aportan metricas de la variante base ni de alternativas como Mask R-CNN o Segment Anything adaptadas al dominio.

| Modelo | Parametros | Contexto/entrada | mAP mascara @50 | Licencia |
|---|---|---|---|---|
| mars-terrain-seg-s5mars-yolo11s | no disponible | 640 px (entrenamiento) | 68,8 % | AGPL-3.0 |
| YOLO11s-seg (base Ultralytics) | no disponible | no disponible | no disponible | AGPL-3.0 |
| Alternativas de segmentacion marciana | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Clases muy desbalanceadas: delik, gezgin y gezgin_tekerlek_izi tienen muy pocos poligonos; la model card advierte explicitamente de que no se debe confiar en su salida.
- Fronteras entre clases ambiguas: la separacion entre ana_kaya y kaya, o entre kum_toprak y ana_kaya, es interpretativa; las etiquetas de origen de Mars-Bench se corrigieron adicionalmente.
- Dominio restringido: solo se entreno con imagenes de MSL Curiosity Mastcam; el rendimiento con otras camaras, resoluciones o estilos de imagen sera inferior y debe validarse con datos propios.
- Datos duplicados: el conjunto original tenia imagenes identicas a nivel de byte repartidas entre splits, lo que puede inflar las metricas de validacion.
- Sin medicion en test: el split de test no se evaluo en esta model card.
- Uso previsto de investigacion: no debe emplearse como unico sistema para cartografiado cientifico ni para decisiones de mision.
- Licencia AGPL-3.0: impone obligaciones de copyleft para uso en red y redistribucion; ademas se mantiene la atribucion CC BY 4.0 de los datos (Purohit et al., 2025).
- Riesgo de falsos negativos en rocas y huellas (recall de 0,62 y 0,43 respectivamente), relevante si se usa para evitar obstaculos.
- Modelo sin traccion ni validacion comunitaria: cero descargas y cero likes en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/mvdelibas/mars-terrain-seg-s5mars-yolo11s
- Dataset Mars-Bench mb-s5mars: https://doi.org/10.5281/zenodo.17402881
- Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11/
- Repositorio Ultralytics: https://github.com/ultralytics/ultralytics
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
- Imagenes: NASA/JPL-Caltech/MSSS (Mastcam del rover Curiosity)
