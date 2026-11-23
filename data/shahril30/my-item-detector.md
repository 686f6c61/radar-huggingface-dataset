# Shahril30/my-item-detector

## Resumen

My Item Detector es un modelo de deteccion de objetos publicado por el usuario Shahril30 en Hugging Face, desarrollado como ejercicio practico del bootcamp CodingBN (sesiones 14 y 15). Se trata de un fine-tuning del detector YOLO26n de Ultralytics sobre un conjunto de aproximadamente 50 fotografias propias, etiquetadas manualmente en Roboflow, con el objetivo de reconocer cuatro clases de flores: `BlueFlower`, `Lion Flower`, `PinkFlower` y `YellowFlower`.

El modelo no es un modelo de lenguaje ni un sistema multimodal generalista, sino un detector visual de un solo dominio, entrenado con un dataset minimo y procedente de un unico entorno fisico (una habitacion) y un unico dispositivo de captura (un telefono). Su relevancia es, por tanto, exclusivamente didactica: sirve como ejemplo reproducible del flujo de trabajo de etiquetado, entrenamiento y publicacion de un detector YOLO, no como componente listo para produccion.

El repositorio tiene un tamano de 0.0 GB y no registra descargas ni interacciones en el momento de la consulta. La model card no incluye resultados de mAP50 (el autor deja un marcador de posicion sin rellenar), no documenta hiperparametros de entrenamiento ni proporciona informacion sobre el proceso de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (formato nativo de Ultralytics; exportacion a ONNX/TensorRT no documentada en la model card) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | AGPL-3.0 (alternativamente licencia Enterprise de Ultralytics) |
| Formato de pesos | no disponible (libreria `ultralytics`; el repositorio figura con 0.0 GB, sin artefactos de pesos confirmados) |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLO26n, la variante "nano" de la familia YOLO26 de Ultralytics, un detector de objetos de una sola etapa basado en red convolucional con cabeza de prediccion densa (cajas delimitadoras y clases). El modelo parte de los pesos preentrenados de YOLO26n y se somete a fine-tuning supervisado sobre un dataset propio de aproximadamente 50 imagenes capturadas con un telefono y etiquetadas en Roboflow con cuatro clases de flores.

No se documentan en la model card el numero de epochs, el tamano de imagen de entrada, el batch size, la resolucion de las imagenes, la estrategia de aumento de datos ni la particion train/val/test. Tampoco se indica si se aplicaron tecnicas de regularizacion o early stopping. La ausencia de estos datos impide reproducir el entrenamiento y evaluar su robustez. No consta uso de RLHF, DPO ni tecnicas de alineacion, algo por otra parte ajeno a un detector visual.

## Capacidades

- Deteccion de objetos en imagenes para cuatro clases cerradas: `BlueFlower`, `Lion Flower`, `PinkFlower` y `YellowFlower`.
- Localizacion mediante cajas delimitadoras y asignacion de clase con puntuacion de confianza (salida estandar de Ultralytics).
- Inferencia sobre imagenes individuales o lotes, segun la API de la libreria `ultralytics`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No tiene capacidades multilingues (no procesa lenguaje natural).
- No dispone de modo de razonamiento (thinking mode), vision-lenguaje, audio ni generacion de texto.

## Casos de uso

- Practica educativa de vision por computador: reproduccion del flujo completo de etiquetado en Roboflow, fine-tuning de YOLO26n y publicacion en Hugging Face, adecuado para cursos y bootcamps.
- Prototipado rapido de un detector de dominio muy acotado: validar la viabilidad de detectar cuatro tipos de flor en un entorno controlado antes de invertir en un dataset mayor.
- Pruebas de integracion con la libreria `ultralytics`: verificar pipelines de carga de pesos, inferencia y visualizacion de resultados en un entorno de desarrollo.
- Demostracion de limitaciones de datasets pequenos: usar el modelo como caso de estudio de sobreajuste y baja generalizacion en clase de evaluacion de modelos.
- Base para un fine-tuning ampliado: servir como punto de partida (pesos iniciales) para un reentrenamiento con mas imagenes, mas clases y mayor variedad de fondos e iluminacion.
- Documentacion de referencia de licencias AGPL-3.0 en el ecosistema Ultralytics: ejemplo para discutir implicaciones de licencia en proyectos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un marcador de posicion ("add your mAP50 here") sin valor numerico, y no se aportan metricas de precision, recall, mAP50 ni mAP50-95 sobre el conjunto de validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por la variante "nano" de YOLO26, el consumo esperado es bajo (tipicamente por debajo de 2 GB en FP16), pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no documentadas. Cualquier GPU consumer reciente (serie RTX 30/40, o incluso CPU) seria suficiente para un modelo de este tamano, aunque no hay datos oficiales.
- Compatibilidad con GPU consumer: probable por la escala "nano", sin confirmacion oficial.
- Opciones de despliegue: libreria `ultralytics` (Python). No se documentan exportaciones a ONNX, TensorRT, OpenVINO ni integraciones con vLLM, llama.cpp, Ollama o TGI (estas ultimas no aplican a un detector visual).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| My Item Detector (Shahril30) | YOLO26n fine-tuned | no disponible | no aplica | AGPL-3.0 | Hugging Face, 0 descargas |
| YOLO26n (Ultralytics, base) | YOLO26 nano | no disponible en la informacion | no aplica | AGPL-3.0 / Enterprise | Repositorio oficial de Ultralytics |
| YOLOv8n (Ultralytics) | YOLOv8 nano | no disponible en la informacion | no aplica | AGPL-3.0 / Enterprise | Ampliamente disponible |

La comparacion se limita a la familia YOLO de Ultralytics porque no se dispone de datos de rendimiento del modelo evaluado ni de alternativas con metricas publicadas en la informacion proporcionada. No es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Dataset de entrenamiento minimo (aproximadamente 50 imagenes) procedente de una sola habitacion y un solo telefono: alta probabilidad de sobreajuste y baja generalizacion a otros fondos, iluminaciones y dispositivos.
- Espacio de clases cerrado: solo reconoce las cuatro flores definidas; cualquier otro objeto se ignora o se clasifica erroneamente.
- Sin metricas publicadas: no hay evidencia cuantitativa de precision ni de recall, por lo que no puede evaluarse su calidad objetivamente.
- Riesgo elevado de falsos positivos y falsos negativos fuera del dominio de entrenamiento.
- No apto para uso en sistemas de seguridad critica ni para produccion comercial, tal y como advierte el propio autor.
- Licencia AGPL-3.0: el uso en servicios en red puede obligar a liberar el codigo fuente derivado; para uso comercial cerrado seria necesaria una licencia Enterprise de Ultralytics.
- El repositorio figura con 0.0 GB, por lo que no esta confirmada la presencia de artefactos de pesos descargables; conviene verificar los ficheros antes de intentar la inferencia.
- No se documentan sesgos demograficos (no aplica), pero si un sesgo de dominio claro hacia el entorno de captura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shahril30/my-item-detector
- Ultralytics (framework y modelos YOLO): https://github.com/ultralytics/ultralytics
- Documentacion de Ultralytics: https://docs.ultralytics.com/
- Roboflow (herramienta de etiquetado citada por el autor): https://roboflow.com/
- CodingBN (bootcamp donde se entreno el modelo): no disponible
