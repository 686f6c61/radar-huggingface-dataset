# Hilmolini/my-item-detector

## Resumen

My Item Detector es un modelo de deteccion de objetos desarrollado por el usuario Hilmolini en el contexto del bootcamp CodingBN (sesiones 14 y 15). Se trata de un fine-tuning del modelo base YOLO26n de Ultralytics, entrenado sobre aproximadamente 50 fotografias propias etiquetadas manualmente en Roboflow. El modelo identifica 51 clases de herramientas manuales y utiles de ferreteria, como destornilladores, llaves inglesas, martillos, sierras, alicates y cintas metricas.

El modelo resuelve un problema muy acotado: la deteccion de herramientas concretas en imagenes capturadas en un entorno controlado (una habitacion y un telefono determinados). No es un detector de proposito general ni compite con modelos de deteccion de objetos de gran escala; es un artefacto educativo que demuestra el flujo completo de anotacion, entrenamiento y publicacion de un detector YOLO.

Su relevancia es limitada fuera del ambito formativo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamano del repo es de 0.0 GB (sin pesos publicados visibles) y la propia model card deja pendiente el valor de mAP50. La licencia AGPL-3.0 impide su uso comercial cerrado sin adquirir una licencia enterprise de Ultralytics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision); etiquetas de clase en ingles |
| Licencia | AGPL-3.0 (o licencia enterprise de Ultralytics) |
| Formato de pesos | no disponible (repo de 0.0 GB, sin pesos visibles) |

## Arquitectura y entrenamiento

El modelo se basa en YOLO26n, la variante nano de la familia YOLO26 de Ultralytics, un detector de objetos de una sola etapa basado en red neuronal convolucional. La eleccion de la variante "n" responde a la busqueda de un modelo ligero, adecuado para entrenamiento rapido en recursos limitados, tipico de un ejercicio de bootcamp.

El entrenamiento consistio en un fine-tuning sobre aproximadamente 50 fotografias tomadas por el propio autor y etiquetadas manualmente en Roboflow. No se documenta el numero de epochs, el tamano de imagen de entrada, el split train/val/test ni si se aplicaron tecnicas de aumento de datos. El conjunto de datos procede de una unica habitacion y un unico telefono, lo que limita severamente la variabilidad de fondos, iluminacion y angulos. La model card no reporta resultados de validacion (el campo mAP50 queda como marcador de posicion sin rellenar).

## Capacidades

- Deteccion de objetos en imagenes para 51 clases de herramientas manuales y utiles de ferreteria (destornilladores, llaves, martillos, sierras, alicates, cintas metricas, sargentos, lijadoras, etc.).
- Salida de cajas delimitadoras con clase y puntuacion de confianza, segun el pipeline `object-detection` de Hugging Face.
- Inferencia mediante la libreria `ultralytics`.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (las etiquetas estan en ingles).
- No dispone de modo thinking, vision multimodal ni audio.

## Casos de uso

- Demostracion educativa de un pipeline completo de vision por computador: sirve para ilustrar en un aula o bootcamp el flujo de anotacion en Roboflow, fine-tuning de YOLO y publicacion en Hugging Face, con un modelo reproducible en pocas horas.
- Prototipo de inventario de herramientas en un taller controlado: si se capturan imagenes con el mismo telefono y en la misma habitacion que en el entrenamiento, el modelo puede etiquetar herramientas sueltas sobre una mesa para un conteo aproximado.
- Prueba de concepto de control de calidad en un banco de trabajo: verificacion de que las herramientas esperadas estan presentes en la imagen antes de una tarea, siempre que el entorno coincida con el de entrenamiento.
- Base para un ejercicio de ampliacion de dataset: el modelo sirve como punto de partida para que estudiantes anadan clases o imagenes y midan la mejora de mAP50, comparando el antes y el despues.
- Ejemplo de integracion con `ultralytics` en un script de Python: util para aprender a cargar pesos, ejecutar inferencia y dibujar cajas sobre una imagen con la API de Ultralytics.
- Referencia negativa en estudios de robustez: permite demostrar empiricamente como un detector entrenado con 50 imagenes de un solo dominio falla al cambiar de fondo o iluminacion, y justificar la necesidad de datasets mas amplios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un campo "Result: add your mAP50 here" sin rellenar, por lo que no existe metrica de validacion reportada por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; al tratarse de una variante nano de YOLO, el consumo esperado es bajo (tipicamente por debajo de 2 GB en FP16), pero no hay datos confirmados en la informacion proporcionada.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente en teoria para un modelo nano; no se especifican modelos concretos en la documentacion.
- Cabe en GPU consumer: previsiblemente si, dado el tamano nano de la arquitectura, aunque no se confirma con datos del repositorio.
- Opciones de despliegue: la libreria `ultralytics` es la via documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de objetos).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| My Item Detector (Hilmolini) | YOLO26n fine-tuned | 51 herramientas | ~50 imagenes propias | AGPL-3.0 | Hugging Face, 0 descargas |
| YOLO26n (Ultralytics, base) | YOLO26n | 80 clases COCO | COCO | AGPL-3.0 / enterprise | Repositorio oficial de Ultralytics |
| YOLOv8n (Ultralytics) | YOLOv8n | 80 clases COCO | COCO | AGPL-3.0 / enterprise | Ampliamente disponible |
| YOLO11n (Ultralytics) | YOLO11n | 80 clases COCO | COCO | AGPL-3.0 / enterprise | Ampliamente disponible |

La comparacion con los modelos base de Ultralytics es la mas directa: comparten familia y licencia, pero los modelos oficiales se entrenan sobre COCO (80 clases genericas) y disponen de pesos publicados y metricas documentadas, mientras que este fine-tuning cubre 51 clases especificas de ferreteria con un dataset minimo y sin metricas reportadas.

## Limitaciones y advertencias

- Dataset extremadamente reducido (unas 50 imagenes) procedente de una sola habitacion y un solo telefono: la generalizacion a otros fondos, iluminaciones y dispositivos es practicamente nula.
- El modelo solo conoce las 51 clases listadas; cualquier otro objeto se ignora o se clasifica erroneamente.
- No se ha reportado mAP50 ni ninguna otra metrica de validacion, por lo que el rendimiento real es desconocido.
- Riesgo elevado de alucinacion de detecciones (falsos positivos) por sobreajuste al dominio de entrenamiento.
- La licencia AGPL-3.0 impide el uso comercial en productos cerrados sin adquirir una licencia enterprise de Ultralytics.
- El autor advierte explicitamente que no es apto para uso critico de seguridad ni comercial.
- El repositorio no muestra pesos publicados (0.0 GB), lo que puede impedir su uso directo sin que el autor los suba.
- No hay informacion sobre sesgos, aunque el sesgo de dominio (una unica habitacion, un unico telefono) es la limitacion dominante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hilmolini/my-item-detector
- Ultralytics (framework y modelos YOLO): https://github.com/ultralytics/ultralytics
- Roboflow (plataforma de anotacion citada por el autor): https://roboflow.com
- CodingBN (bootcamp donde se entreno el modelo): no disponible
