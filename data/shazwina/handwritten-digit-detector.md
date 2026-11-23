# Shazwina/handwritten-digit-detector

## Resumen

Handwritten Digit Detector es un modelo de deteccion de objetos basado en YOLO26n de Ultralytics, afinado por el usuario Shazwina durante el bootcamp CodingBN (sesiones 14 y 15). Su tarea es localizar y clasificar digitos manuscritos (del 0 al 9) en imagenes, devolviendo cajas delimitadoras con la clase correspondiente. No es un modelo de lenguaje ni un sistema OCR completo: es un detector visual de una sola etapa, pensado como ejercicio formativo.

El modelo parte de los pesos preentrenados de YOLO26n y se ha reentrenado sobre un conjunto muy reducido de aproximadamente 50 fotografias tomadas por el propio autor y etiquetadas manualmente en Roboflow. Las clases del detector son literalmente `Datasets-0` a `Datasets-9`, una nomenclatura heredada del proceso de anotacion que conviene remapear en produccion.

Su relevancia es limitada y de caracter didactico: sirve para ilustrar el flujo completo de anotacion, entrenamiento y validacion de un detector con Ultralytics, pero no esta pensado para uso comercial ni para entornos con requisitos de robustez. El autor reporta un mAP50 de 0,79 sobre sus propias imagenes de validacion, un valor que no debe extrapolarse a dominios distintos del de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | AGPL-3.0 (o licencia Enterprise de Ultralytics) |
| Formato de pesos | no disponible en la informacion (repo de 0.0 GB; libreria `ultralytics`, habitualmente `.pt`) |

## Arquitectura y entrenamiento

La arquitectura es YOLO26n, la variante nano de la familia YOLO26 de Ultralytics, un detector de objetos de una sola etapa con backbone convolucional y cabeza de deteccion densa. El modelo se inicializa con los pesos preentrenados de YOLO26n y se afina (fine-tuning) sobre un dataset propio de aproximadamente 50 fotografias capturadas con un telefono movil en una unica habitacion.

El etiquetado se realizo manualmente en Roboflow, con diez clases correspondientes a los digitos 0-9. No se documenta el numero de tokens ni de imagenes de augmentacion, la composicion exacta del dataset, el numero de epocas, el optimizador ni si se aplicaron tecnicas de aumento de datos mas alla de las que Ultralytics aplica por defecto. Tampoco se menciona RLHF, DPO ni innovaciones tecnicas adicionales; se trata de un fine-tuning estandar con la libreria `ultralytics`.

## Capacidades

- Deteccion de objetos: localiza instancias de digitos manuscritos y devuelve cajas delimitadoras con clase y puntuacion de confianza.
- Clasificacion en diez clases: `Datasets-0` a `Datasets-9`, correspondientes a los digitos 0-9.
- Inferencia sobre imagenes estaticas mediante la API de Ultralytics (`ultralytics.YOLO`).
- Entrenamiento y validacion reproducibles con el pipeline de Ultralytics (exportacion a otros formatos sujeta a las herramientas de la libreria).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision general, audio ni procesamiento de texto.

## Casos de uso

- Practica formativa de vision por computador: reproduccion del flujo anotacion-entrenamiento-validacion con Ultralytics y Roboflow en un entorno de bootcamp, usando el modelo como referencia de como se comporta un detector con pocos datos.
- Prototipo de lectura de digitos en condiciones controladas: captura de una imagen de un digito manuscrito sobre fondo similar al de entrenamiento y extraccion de la caja y la clase predicha para alimentar un pipeline posterior.
- Demostracion de data augmentation y fine-tuning: comparar el rendimiento del modelo afinado frente al YOLO26n base para ilustrar el efecto de un dataset pequeno y homogeneo.
- Generacion de datasets sinteticos de prueba: usar el detector para preetiquetar imagenes de digitos y revisar manualmente las predicciones antes de incorporarlas a un conjunto de entrenamiento mayor.
- Evaluacion de robustez ante dominio: medir la caida de mAP al cambiar fondo, iluminacion o dispositivo de captura, como ejercicio de analisis de sesgo de dominio.
- Integracion en un cuaderno de Jupyter o script de Python con `ultralytics` para tareas de docencia o talleres, sin requisitos de produccion.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| mAP50 | 0,79 | Imagenes de validacion propias del autor |

No se han publicado resultados de benchmarks estandar (COCO, VOC, MNIST, etc.) en la informacion disponible. El unico dato reportado es el mAP50 sobre el conjunto de validacion del propio autor, no comparable con resultados de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion; por el tamano nano de YOLO26, es esperable que quepa en GPUs de consumo, pero no se aporta una cifra concreta.
- GPU recomendadas: no disponible. Para entrenamiento se puede usar cualquier GPU compatible con PyTorch y Ultralytics; para inferencia, CPU o GPU de gama baja suelen ser suficientes en modelos nano.
- Cabe en GPU de consumo: previsiblemente si (variante nano), aunque no se documenta el consumo real.
- Opciones de despliegue: API de Python de `ultralytics`; exportacion a ONNX, TensorRT u otros formatos a traves de las herramientas de Ultralytics (no confirmada en la model card).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Shazwina/handwritten-digit-detector | YOLO26n afinado | no disponible | no aplica | mAP50 0,79 (validacion propia) | AGPL-3.0 | Hugging Face |
| YOLO26n (Ultralytics, base) | Detector de una etapa | no disponible | no aplica | no disponible en esta ficha | AGPL-3.0 / Enterprise | Ultralytics |
| YOLOv8n (Ultralytics) | Detector de una etapa | no disponible | no aplica | no disponible en esta ficha | AGPL-3.0 / Enterprise | Ultralytics |
| Detectores OCR de digitos (p. ej. basados en CNN + CTC) | CNN + secuencia | no disponible | no aplica | no disponible en esta ficha | variable | variable |

La comparacion con alternativas especificas de deteccion de digitos manuscritos no esta disponible en la informacion proporcionada; los modelos citados son referencias genericas de la misma familia o categoria.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeno (aproximadamente 50 imagenes) y homogeneo: una sola habitacion y un unico telefono. El rendimiento caera drasticamente con otros fondos, iluminaciones, dispositivos o estilos de escritura.
- Solo reconoce las diez clases indicadas; cualquier otro objeto se ignora o se clasifica erroneamente como un digito.
- Nomenclatura de clases (`Datasets-0`...`Datasets-9`) heredada del proceso de anotacion; requiere remapeo antes de usarse en produccion.
- Riesgo alto de sobreajuste y de falsos positivos/negativos fuera del dominio de entrenamiento.
- El autor declara explicitamente que no es apto para uso critico para la seguridad ni para uso comercial.
- Licencia AGPL-3.0: el uso comercial requiere licencia Enterprise de Ultralytics; la obligacion de copyleft de AGPL puede afectar a servicios en red que utilicen el modelo.
- No se documentan sesgos demograficos ni etnicos porque el modelo no procesa personas, pero si existe sesgo de dominio (fondo, dispositivo, iluminacion).
- No se han publicado evaluaciones independientes ni benchmarks estandar; el unico dato de rendimiento es autodeclarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shazwina/handwritten-digit-detector
- Ultralytics (libreria y modelos YOLO): https://github.com/ultralytics/ultralytics
- Documentacion de Ultralytics: https://docs.ultralytics.com/
- Roboflow (plataforma de anotacion usada por el autor): https://roboflow.com/
- CodingBN (bootcamp donde se entreno el modelo): no disponible
- Paper o blog tecnico del modelo: no disponible
