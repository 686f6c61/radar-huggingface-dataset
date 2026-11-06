# Jawziyyah/efficientnet-b0-pizza-steak

## Resumen

EfficientNet-B0 pizza vs steak es un clasificador binario de imagenes obtenido por transfer learning sobre EfficientNet-B0 preentrenado en ImageNet. Lo publica el usuario Jawziyyah en Hugging Face como proyecto de aprendizaje, con licencia MIT y pesos en formato PyTorch (`.pth`). No es un modelo de lenguaje ni un modelo fundacional: es un cabezal de clasificacion ajustado para distinguir dos clases, pizza (indice 0) y steak (indice 1).

El modelo parte de la arquitectura EfficientNet-B0, una CNN con compound scaling (profundidad, anchura y resolucion escaladas de forma conjunta) que en su version original ronda los 5,3 millones de parametros. Aqui se sustituye la cabeza de 1000 clases de ImageNet por una cabeza minima: Dropout(0.2) seguido de una capa Linear(1280, 1) con activacion sigmoide, que devuelve la probabilidad de que la imagen sea steak.

Su relevancia es limitada fuera del ambito didactico: el propio autor lo describe como proyecto de principiante, con 1200 imagenes de entrenamiento y una unica tarea de dos clases. Resulta util como ejemplo reproducible de transfer learning en PyTorch y como baseline trivial para experimentos de clasificacion de imagenes, pero no esta pensado para produccion ni para tareas generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN con compound scaling) preentrenada en ImageNet, cabeza binaria adaptada |
| Parametros totales | no disponible (EfficientNet-B0 base: aproximadamente 5,3 M; la cabeza nueva anade 1281 parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos PyTorch en punto flotante) |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas de clase son pizza y steak) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pth`), acompanado de `config.json` y `model.py` |

## Arquitectura y entrenamiento

La base es EfficientNet-B0 de torchvision, preentrenada en ImageNet. Sobre ella se anade una cabeza nueva compuesta por Dropout(0.2), una capa Linear(1280, 1) y una sigmoide, de modo que la salida es la probabilidad de la clase 1 (steak); la clase 0 es pizza. El entrenamiento se hizo en dos fases: primero con el backbone congelado y solo la cabeza entrenable (Adam, lr 0,001, 5 epocas); despues se descongelaron los ultimos tres bloques de caracteristicas y se ajusto todo con Adam a lr 0,0001 durante 5 epocas mas. La funcion de perdida fue BCEWithLogitsLoss con batch size 32.

El conjunto de datos consta de 1200 imagenes de entrenamiento, 300 de validacion y 500 de test. La aumentacion aplicada fue random resized crop, volteo horizontal y color jitter. No se documenta el origen de las imagenes, la resolucion de entrada efectiva, el numero de tokens (no aplica) ni si hubo busqueda de hiperparametros. No se menciona ninguna innovacion tecnica adicional: es transfer learning estandar sin destilacion, sin decodificacion especulativa y sin tecnicas de atencion lineal.

## Capacidades

- Clasificacion binaria de imagenes en dos clases: pizza y steak.
- Salida de una probabilidad continua (sigmoide) interpretable como confianza de la clase steak.
- Inferencia sobre imagenes individuales mediante la funcion `predict` incluida en `model.py`.
- Carga de pesos y codigo auxiliar desde Hugging Face Hub con `hf_hub_download`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni procesamiento de texto.
- No dispone de modo thinking, vision general, audio ni ninguna capacidad multimodal mas alla de la clasificacion de imagen.

## Casos de uso

- Ejemplo didactico de transfer learning: sirve para ilustrar el flujo completo de congelar backbone, entrenar cabeza, descongelar bloques y evaluar en PyTorch, con un caso de dos clases facil de reproducir.
- Prototipo de filtrado en una aplicacion de recetas: clasificar fotos subidas por usuarios como pizza o steak para etiquetarlas automaticamente antes de una revision manual.
- Baseline en experimentos de clasificacion de alimentos: punto de partida para comparar tecnicas de aumentacion, fine-tuning o modelos mas grandes sobre el mismo dataset de dos clases.
- Prueba de integracion de pipelines de Hugging Face Hub: validar la descarga de pesos, config y codigo con `hf_hub_download` en un entorno de CI antes de adoptar modelos mayores.
- Demo educativa en un curso de vision por computador: mostrar el efecto del fine-tuning parcial (ultimos tres bloques) frente al entrenamiento solo de la cabeza.
- Etiquetado asistido de pequenos catalogos de imagenes gastronomicas: con 99,40 % de accuracy en test, puede preetiquetar lotes de fotos de pizza y steak para acelerar la anotacion manual, siempre con revision humana.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 99,40 % | Test propio (500 imagenes) |

No se han publicado resultados de benchmarks estandar (ImageNet, Food-101 ni similares) en la informacion disponible. El unico dato es la accuracy sobre el conjunto de test del propio autor, que no es comparable con resultados publicados de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el modelo completo; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para inferencia puntual. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es mas que suficiente.
- Cabe en GPU consumer: si, en practicamente todas, incluidas las de gama baja y las integradas con suficiente memoria compartida.
- Opciones de despliegue: PyTorch nativo con el `model.py` incluido; exportacion a TorchScript u ONNX no documentada pero viable; no se proporcionan pesos GGUF ni soporte para llama.cpp u Ollama (no aplica a un modelo de vision de este tipo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientNet-B0 pizza vs steak (Jawziyyah) | aprox. 5,3 M (base) | Clasificacion binaria pizza/steak | no aplica | MIT | Hugging Face |
| EfficientNet-B0 ImageNet (torchvision) | aprox. 5,3 M | Clasificacion 1000 clases | no aplica | BSD-3-Clause (torchvision) | torchvision |
| ResNet-18 (torchvision) | aprox. 11,7 M | Clasificacion 1000 clases | no aplica | BSD-3-Clause (torchvision) | torchvision |
| MobileNetV3-Small (torchvision) | aprox. 2,5 M | Clasificacion 1000 clases | no aplica | BSD-3-Clause (torchvision) | torchvision |

La comparacion es estructural: los tres alternativos son backbones genericos de vision, no clasificadores de dos clases. Frente a ellos, este modelo solo aporta la cabeza ajustada a pizza/steak y unas metricas validas unicamente en su propio conjunto de test.

## Limitaciones y advertencias

- El modelo solo conoce dos clases y siempre respondera con una de ellas, incluso ante fotos no relacionadas; no detecta "ninguna de las dos".
- La accuracy de 99,40 % procede de un test propio de 500 imagenes; no hay validacion cruzada ni evaluacion en dominios externos, por lo que la generalizacion es incierta.
- El dataset de entrenamiento es muy pequeno (1200 imagenes) y de origen no documentado; probablemente sesgado hacia un estilo fotografico concreto (iluminacion, encuadre, fondo).
- Riesgo de alucinacion en el sentido de falsos positivos confiados: al no haber clase de rechazo, la salida sigmoide puede ser alta para imagenes que no son ni pizza ni steak.
- No hay informacion sobre sesgos demograficos o culturales porque el modelo no procesa personas ni texto, pero el sesgo de dominio (tipos de comida, presentaciones) sigue siendo relevante.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no obstante, el modelo base de torchvision tiene su propia licencia BSD-3-Clause que conviene revisar.
- No apto para produccion sin un conjunto de validacion propio y una capa de rechazo o umbral de confianza calibrado.
- El repositorio ocupa 0,0 GB segun Hugging Face, lo que sugiere que los pesos pueden no estar realmente subidos o que el tamano reportado es incompleto; conviene verificar la descarga antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jawziyyah/efficientnet-b0-pizza-steak
- EfficientNet (paper original, Tan y Le, 2019): https://arxiv.org/abs/1905.11946
- EfficientNet-B0 en torchvision: https://pytorch.org/vision/stable/models/efficientnet.html
- Documentacion de `hf_hub_download`: https://huggingface.co/docs/huggingface_hub/guides/download
