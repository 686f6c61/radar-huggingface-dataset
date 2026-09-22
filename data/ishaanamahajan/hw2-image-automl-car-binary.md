# ishaanamahajan/hw2-image-automl-car-binary

## Resumen

`ishaanamahajan/hw2-image-automl-car-binary` es un clasificador binario de imagenes construido con AutoGluon MultiModal sobre el backbone `efficientnet_b0.ra_in1k` de timm. Resuelve una tarea muy acotada: predecir una etiqueta numerica (`0` o `1`) a partir de una imagen RGB de 128x128 pixeles procedente del dataset `Gwen1220/car-classification-image-dataset`. No es un modelo fundacional ni un modelo de lenguaje, sino un artefacto de AutoML con fines didacticos, generado en el marco de un trabajo academico ("hw2").

El modelo se obtuvo mediante una busqueda de como maximo 6 configuraciones en 900 segundos de presupuesto (420,39 segundos reales) sobre tres arquitecturas candidatas (ResNet-18, MobileNetV3-Small y EfficientNet-B0), con poda ASHA, parada temprana por paciencia de dos comprobaciones y retencion del mejor checkpoint segun F1 de validacion. Se entreno con fine-tuning completo (`optim.peft=None`) sobre una GPU Tesla T4 y un conjunto de datos minimo: 21 imagenes utiles de entrenamiento, 4 de validacion y 5 de prueba.

Su relevancia practica es limitada: sirve como ejemplo reproducible de pipeline AutoML de clasificacion de imagenes y como plantilla de integracion de AutoGluon, pero no como componente listo para produccion. El rendimiento declarado es accuracy 0,6000 y F1 binario 0,6667 sobre solo 5 imagenes de test (intervalo de confianza del 95 % de Wilson: 0,231-0,882), lo que implica una incertidumbre estadistica enorme. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta y un tamano de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (`efficientnet_b0.ra_in1k` de timm) con cabeza de clasificacion binaria, gestionado por AutoGluon MultiModal |
| Parametros totales | No disponible en la model card; el backbone EfficientNet-B0 de timm tiene del orden de 5,3 M de parametros, mas la cabeza de clasificacion |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificacion de imagenes; entrada RGB fija de 128x128 pixeles) |
| Tipos de cuantizacion | No disponible (no se documentan pesos cuantizados ni variantes GGUF/ONNX) |
| Idiomas soportados | No disponible (las etiquetas son numericas, sin nombres de clase semanticos ni metadatos de idioma) |
| Licencia | other (terminos concretos no especificados; los derechos de reutilizacion del dataset fuente no estan aclarados) |
| Formato de pesos | Checkpoint serializado de AutoGluon MultiModal, cargado con `MultiModalPredictor.load()`; no se indica safetensors, GGUF ni ONNX |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional EfficientNet-B0 preentrenada en ImageNet (variante `ra_in1k` de timm, con RandAugment) y adaptada a clasificacion binaria mediante fine-tuning completo. La entrada es RGB a 128x128 pixeles, con transformaciones de entrenamiento consistentes en `resize_shorter_side`, `center_crop` y `trivial_augment`, y transformaciones deterministas en validacion (`resize_shorter_side` y `center_crop`). El procesador guardado aplica la normalizacion propia del backbone. No se emplearon adaptadores de parametros eficientes: la configuracion resuelta fija `peft: null`, es decir, se ajustaron todos los pesos.

El entrenamiento lo controlo AutoGluon MultiModal 1.6.3. La busqueda exploro como maximo 6 ensayos en 900 segundos sobre ResNet-18, MobileNetV3-Small y EfficientNet-B0, junto con tasa de aprendizaje, weight decay, tamano de lote y limite de epocas; el muestreo fue secuencial, empezando con un ensayo por arquitectura y semilla 24679. La configuracion ganadora usa AdamW, learning rate 1,7441731553505803e-05, weight decay 0,0001, batch size 32 y un maximo de 8 epocas. El dataset de entrenamiento contiene 315 filas sinteticas con imagenes nulas que fueron excluidas (quedan auditadas en `*_missing_image_audit.csv`), y los identificadores y la procedencia se excluyeron de las entradas del modelo. No se documenta RLHF, DPO ni ninguna innovacion de decodificacion (no aplica a un clasificador).

## Capacidades

- Clasificacion binaria de imagenes: devuelve la etiqueta `0` o `1` para una imagen RGB de entrada a 128x128 pixeles.
- Inferencia sobre fotografia individual mediante `MultiModalPredictor.load(local_path).predict(pd.DataFrame({'image': ['/path/to/photo.png']}))`.
- Reutilizacion del procesador guardado (normalizacion del backbone incluida), con verificacion de que las predicciones se reproducen tras recargar el modelo.
- Reentrenamiento y extension: la configuracion resuelta (`resolved_configuration.json`), el espacio de busqueda (`search_space.json`), los resultados por ensayo (`search_trials.csv`) y las curvas (`training_curves.csv`) se conservan en el repositorio.
- Sin soporte de tool calling ni function calling: no es un modelo de lenguaje.
- Sin capacidades de agente ni de razonamiento multi-paso.
- Sin capacidades multilingues, de vision general (deteccion, segmentacion, VQA) ni de audio.
- Sin modo "thinking" ni generacion de texto de ningun tipo.
- Etiquetas numericas sin semantica conocida: el modelo no puede nombrar las clases que distingue.

## Casos de uso

- Docencia y practicas de AutoML: el repositorio documenta configuracion, espacio de busqueda, ensayos y curvas, por lo que sirve como material de clase para reproducir un pipeline completo de AutoGluon MultiModal de principio a fin.
- Plantilla de estructura de proyecto: su organizacion de ficheros (`resolved_configuration.json`, `search_space.json`, `search_trials.csv`, `training_curves.csv`, auditorias de imagenes ausentes) es reutilizable como esqueleto para proyectos de clasificacion de imagenes con trazabilidad.
- Prueba de humo de infraestructura: al ejecutarse en una Tesla T4 y consumir 420,39 segundos de busqueda, es util para validar que un entorno con CUDA, AutoGluon, PyTorch y Hugging Face Hub funciona correctamente antes de lanzar entrenamientos mayores.
- Punto de partida para anotacion asistida: con las debidas reservas, permite preetiquetar imagenes candidatas y que un humano las revise, acelerando la construccion de un conjunto etiquetado mas grande.
- Comparacion de backbones en un caso controlado: la configuracion conserva los candidatos ResNet-18, MobileNetV3-Small y EfficientNet-B0, lo que facilita reproducir la busqueda y estudiar como cambia la seleccion con otros presupuestos o resoluciones.
- Demostracion de inferencia embebida: un EfficientNet-B0 a 128x128 pixeles es lo bastante pequeno para prototipos de clasificacion en el borde o en CPU, util para validar latencias antes de elegir un modelo definitivo.
- Deteccion temprana de problemas de datos: el bajo rendimiento en test y el desequilibrio entre 21 imagenes de entrenamiento, 4 de validacion y 5 de prueba ilustran de forma realista por que hay que ampliar el dataset antes de invertir en modelado.
- Auditoria de sobreadaptacion: la separacion de identificadores entre particiones y la ausencia de aumento en las imagenes reservadas permiten estudiar empiricamente como el fondo, el color o el punto de vista dominan las predicciones.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de test del propio modelo, sobre 5 imagenes:

| Metrica | Valor | Conjunto | Intervalo de confianza del 95 % |
|---|---|---|---|
| Accuracy | 0,6000 | Test (n=5) | Wilson: 0,231-0,882 |
| F1 binario | 0,6667 | Test (n=5) | No disponible |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K o equivalentes de vision) en la informacion disponible. Tampoco se detallan los F1 de validacion de las arquitecturas descartadas durante la busqueda.

## Requisitos de hardware

- Entrenamiento documentado: una unica GPU Tesla T4, sobre Linux 6.6.122+ x86_64, Python 3.13.15, con `autogluon.multimodal` 1.6.3, `torch` 2.11.0+cu128, `transformers` 5.14.1, `datasets` 4.8.5, `huggingface_hub` 1.29.0, `scikit-learn` 1.6.1, `numpy` 2.1.3 y `pandas` 2.2.3.
- VRAM estimada para inferencia: no disponible en la model card. Como referencia de ingenieria, un EfficientNet-B0 a 128x128 con lotes pequenos ocupa del orden de menos de 1 GB en fp16 y de 1 a 2 GB en fp32, incluyendo el runtime de PyTorch; se trata de una estimacion, no de un dato medido.
- GPU recomendadas: cualquiera con soporte CUDA y al menos 4 GB de VRAM es suficiente; el propio autor uso una T4. Modelos como A100 o H100 no aportan ventaja practica a esta escala.
- Compatibilidad con GPU de consumo: si, cabe con holgura en tarjetas de consumo (por ejemplo, RTX 3060, RTX 4060 o superiores) e incluso es viable la inferencia en CPU para volumenes bajos.
- Opciones de despliegue: `MultiModalPredictor.load()` de AutoGluon MultiModal es la via documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imagenes. Tampoco se describe una exportacion a ONNX o TorchScript.
- Latencia y throughput: no disponibles. Solo se conoce el tiempo de busqueda (420,39 segundos para un maximo de 6 ensayos con hasta 8 epocas), no el coste de inferencia.

## Comparativa con modelos similares

La informacion disponible no incluye resultados de las arquitecturas alternativas evaluadas, por lo que la comparacion cuantitativa no es posible. La siguiente tabla recoge lo que si se sabe de los candidatos que AutoGluon exploro en la busqueda:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (EfficientNet-B0) | No disponible en la model card | No aplica | Accuracy 0,6000 / F1 0,6667 en test (n=5) | other | Repositorio Hugging Face, 0 descargas |
| ResNet-18 (candidato de la busqueda) | No disponible en la informacion | No aplica | No disponible (descartado por F1 de validacion) | No disponible | Como backbone de timm, no como artefacto entrenado |
| MobileNetV3-Small (candidato de la busqueda) | No disponible en la informacion | No aplica | No disponible (descartado por F1 de validacion) | No disponible | Como backbone de timm, no como artefacto entrenado |

No se dispone de datos de ningun otro modelo comparable entrenado sobre el mismo dataset, por lo que no se puede establecer una comparativa de rendimiento fiable.

## Limitaciones y advertencias

- Tamano de evaluacion insignificante: 5 imagenes de test y 4 de validacion producen estimaciones inestables; el intervalo de Wilson de la accuracy abarca de 0,231 a 0,882.
- Conjunto de entrenamiento minimo: solo 21 imagenes utiles. Las 315 filas sinteticas del dataset original tienen imagenes nulas y se excluyeron, lo que reduce drasticamente la diversidad disponible.
- Etiquetas sin semantica: no hay nombres de clase, por lo que no se puede interpretar que significa `0` ni `1`, ni verificar que la tarea se haya aprendido correctamente.
- Sesgos probables de atajos visuales: la propia model card advierte que el fondo, el color, la iluminacion, el punto de vista y las vistas duplicadas pueden estar determinando las predicciones en lugar del objeto.
- Inadecuado para decisiones reales: el autor declara explicitamente que el modelo no es apto para decisiones de reconocimiento de vehiculos sin mas datos y validacion.
- Licencia ambigua: la licencia figura como `other` sin terminos concretos, y los derechos de reutilizacion de las imagenes de origen no estan aclarados. El uso comercial es juridicamente arriesgado sin aclarar la procedencia del dataset.
- Obligacion de atribucion: hay que conservar la atribucion a Gwen1220 por el dataset y al backbone preentrenado de timm.
- Riesgo de alucinacion en sentido estricto: no aplica (no genera texto), pero si existe riesgo de predicciones confiadas y erroneas en imagenes fuera de la distribucion del conjunto.
- Sin soporte multilingue ni de lenguaje: cualquier uso conversacional queda fuera de su alcance.
- Sin inferencia demografica: el autor indica que no se pretende ningun uso de este tipo.
- Requisitos de seguridad al cargar: la model card recomienda cargar unicamente modelos serializados de confianza, ya que el checkpoint se deserializa con `MultiModalPredictor.load()`.
- Generacion asistida por IA: el propio autor declara que OpenAI Codex ayudo en la estructura del cuaderno, el codigo y la documentacion.
- Metadatos anomalos: el repositorio indica fecha de creacion 2026-09-21 y un tamano de 0,0 GB, con 0 descargas y 0 "likes", lo que sugiere un artefacto reciente o de entorno de pruebas poco contrastado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ishaanamahajan/hw2-image-automl-car-binary
- Dataset utilizado: https://huggingface.co/datasets/Gwen1220/car-classification-image-dataset
- Busqueda web: no se encontraron resultados relevantes sobre este modelo; las consultas devolvieron unicamente paginas de soporte no relacionadas (ayuda de inicio de sesion de Gmail), por lo que no hay papers, blogs, repositorios ni demos adicionales que enlazar.
