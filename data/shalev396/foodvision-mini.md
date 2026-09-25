# shalev396/foodvision-mini

## Resumen

FoodVision Mini es un clasificador de imagenes de comida desarrollado por shalev396 (Shalev Ben Moshe) dentro del proyecto ml-lab. Su unica tarea es determinar si una fotografia de un plato corresponde a pizza, steak o sushi, devolviendo una distribucion softmax sobre esas tres clases. No es un modelo generativo ni un LLM: es un clasificador de vision de tres clases con una salida muy acotada.

El modelo se construye por transfer learning sobre torchvision `efficientnet_b2` inicializado con pesos `EfficientNet_B2_Weights.IMAGENET1K_V1`. El backbone permanece congelado como extractor de caracteristicas y solo se entrena una cabeza nueva de `Dropout(0.3) -> Linear(1408, 3)`, es decir, 4.227 parametros entrenables sobre un total de 7,7 millones. El entrenamiento usa el subconjunto `pizza_steak_sushi_20_percent` de Food-101, con 450 imagenes de entrenamiento y 150 de test.

Su relevancia es practica y didactica: es un ejemplo minimo, ligero y rapido de despliegue de computer vision, pensado para ejecutarse en CPU y para servir como plantilla de transfer learning, de empaquetado en safetensors y de publicacion como Inference Endpoint y Space de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B2 (torchvision `efficientnet_b2`) con backbone congelado preentrenado en ImageNet y cabeza `Dropout(0.3) -> Linear(1408, 3)` |
| Parametros totales | 7.772.789 (safetensors); la model card declara 7.705.221, de los que 4.227 (la cabeza) fueron entrenados |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagenes, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica / no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La red es un EfficientNet-B2 de torchvision al que se le sustituye el clasificador original por una cabeza lineal de 3 salidas precedida de dropout 0,3. El backbone se inicializa con pesos de ImageNet y queda completamente congelado durante el entrenamiento, de modo que solo aprende la proyeccion final. El preprocesado es el de `model.get_transform()`: redimensionado bicubico a 288, center-crop de 288x288 y normalizacion con media y desviacion tipica de ImageNet. La entrada admite cualquier imagen RGB; la salida son probabilidades softmax para las clases `pizza`, `steak` y `sushi`.

El entrenamiento usa el subconjunto `pizza_steak_sushi_20_percent` del dataset Food-101, con 450 imagenes de entrenamiento (pizza 154, steak 146, sushi 150) y 150 de test (46 / 58 / 46). La receta es deliberadamente simple: entropia cruzada estandar, optimizador Adam con `lr=1e-3`, batch size 32, 10 epocas, semilla 42 y sin aumento de datos. Las capas BatchNorm permanecen en modo entrenamiento para que sus estadisticas se adapten a las fotos de comida, y se conserva la ultima epoca sin early stopping. El checkpoint publicado se convirtio 1:1 desde el `.pth` original (notebook 09 del PyTorch Deep Learning bootcamp, entrenado con torch 2.11 sobre Apple MPS), mapeando el `state_dict` a la clase `FoodVisionNet` y guardandolo en safetensors. No se registro el tiempo de entrenamiento.

## Capacidades

- Clasificacion de imagenes en tres clases cerradas: pizza, steak y sushi, con probabilidades softmax.
- Extraccion de caracteristicas de imagen mediante backbone EfficientNet-B2 preentrenado en ImageNet.
- Inferencia sobre CPU o CUDA; el Space publico se ejecuta con runtime `cpu-basic`.
- Carga sencilla en Python mediante `model.load(path, device)` y prediccion a partir de una ruta o de un objeto PIL.
- Servicio como Inference Endpoint con `handler.py`, aceptando imagenes en bytes crudos (`Content-Type: image/jpeg`) o JSON con base64.
- API HTTP en el Space que expone `/predict` y devuelve `[label, seconds, device]`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo de razonamiento, vision adicional, audio ni salida generativa.

## Casos de uso

- Clasificacion de fotos en apps de recetas o menus: el usuario sube una imagen y la app la etiqueta como pizza, steak o sushi; el modelo es lo bastante pequeno (7,7 M de parametros) para responder en CPU sin infraestructura GPU.
- Moderacion o etiquetado automatico en plataformas gastronomicas: filtrar o categorizar imagenes subidas por usuarios segun el tipo de plato antes de publicarlas.
- Ejecucion on-device en movil o edge: el peso del modelo en fp32 ronda los 31 MB, lo que permite empaquetarlo en aplicaciones locales sin depender de la nube.
- Demostracion educativa de transfer learning: sirve como plantilla reproducible (Colab + GitHub) para ensenar feature extraction, congelado de backbone y publicacion en safetensors.
- Despliegue como microservicio de inferencia: el repositorio incluye `handler.py` y `requirements.txt` para levantar un Inference Endpoint que devuelve el diccionario de probabilidades.
- Limpieza y etiquetado de datasets: clasificar rapidamente imagenes de comida en pipelines de curacion de datos antes de tareas de entrenamiento mayores.
- Punto de partida para modelos personalizados: al tener la cabeza separada del backbone, es sencillo sustituir la capa final y reentrenarla sobre nuevas categorias de comida.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados; `verified: false`). Evaluados sobre el split de test del subconjunto Food-101 pizza/steak/sushi al 20 %.

| Metrica | Valor |
|---|---|
| Accuracy | 0,96 |
| F1 macro | 0,960556 |
| Accuracy pizza | 0,956522 |
| Accuracy steak | 0,948276 |
| Accuracy sushi | 0,978261 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: minima. El modelo tiene 7.772.789 parametros, aproximadamente 31 MB en fp32 y unos 15,5 MB en fp16.
- GPU recomendadas: cualquiera; no requiere GPU dedicada. El Space oficial funciona con runtime `cpu-basic`. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es mas que suficiente y, de hecho, sobredimensionada.
- Cabe en cualquier GPU consumer e incluso en CPU sin aceleracion. No se necesita A100 ni H100.
- Opciones de despliegue: Python con PyTorch (`torch`, `torchvision`, `pillow`, `huggingface_hub`, `safetensors`), Inference Endpoints de Hugging Face mediante el `handler.py` incluido, y la API `/predict` del Space. Los runners de LLM como vLLM, llama.cpp, Ollama o TGI no aplican a este modelo.
- Latencia y throughput: no disponible. El Space devuelve el tiempo de inferencia en segundos en su respuesta, pero no se publican cifras concretas. El tiempo de entrenamiento tampoco se registro.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| foodvision-mini (este) | EfficientNet-B2 + cabeza lineal de 3 clases | 7.772.789 (safetensors) | no aplica | MIT | Hugging Face, Space y Endpoint |
| EfficientNet-B2 (ImageNet, torchvision) | EfficientNet-B2 completa | no disponible en la informacion | no aplica | licencia torchvision | torchvision |
| FoodVision Mini (AIGuardiansML) | EfficientNetB2 feature extractor | no disponible | no aplica | no disponible | Space en Hugging Face |
| FoodVision Mini (3u89) | EfficientNetB2 feature extractor | no disponible | no aplica | no disponible | Space en Hugging Face |

No se dispone de datos de rendimiento comparados entre estas alternativas en la informacion proporcionada. Las variantes de la tabla son implementaciones del mismo concepto (clasificador EfficientNet-B2 de pizza/steak/sushi) publicadas por otros autores en Spaces de Hugging Face.

## Limitaciones y advertencias

- Alcance cerrado: solo distingue tres clases (pizza, steak, sushi). Cualquier otra comida o imagen fuera de esas categorias se forzara a una de las tres etiquetas con una probabilidad asignada.
- Entrenamiento sobre datos muy reducidos: 450 imagenes de entrenamiento y 150 de test. La generalizacion fuera de esa distribucion puede degradarse con facilidad.
- Riesgo de sesgo por el dataset: Food-101 y su subconjunto pueden sobrerrepresentar ciertos estilos de presentacion, iluminacion o cocina, lo que afecta a imagenes atipicas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero el modelo siempre devuelve una clase concreta aunque la imagen no corresponda a ninguna de las tres.
- Cambio de BatchNorm: las capas BatchNorm se dejaron en modo entrenamiento, por lo que sus estadisticas son especificas de este modelo y no deben alterarse al reutilizarlo.
- Los resultados de rendimiento estan declarados por el autor y no estan verificados (`verified: false`).
- Licencia MIT: permite uso comercial y modificacion, conservando el aviso de copyright y la licencia.
- Para produccion: conviene reentrenar o ampliar clases si la aplicacion real difiere de pizza/steak/sushi, y validar el rendimiento sobre imagenes del dominio objetivo.
- Para despliegues en idioma distinto del ingles no aplica ninguna consideracion linguistica, al no procesar texto.
- Discrepancia menor entre el recuento de parametros de safetensors (7.772.789) y el declarado en la model card (7.705.221); conviene tenerlo en cuenta al documentar integraciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shalev396/foodvision-mini
- Space oficial: https://huggingface.co/spaces/shalev396/foodvision-mini
- Perfil del autor: https://huggingface.co/shalev396
- Codigo de entrenamiento (GitHub): https://github.com/shalev396/ml-lab/tree/main/foodvision-mini
- Notebook de entrenamiento (Colab): https://colab.research.google.com/github/shalev396/ml-lab/blob/main/foodvision-mini/training/notebook.ipynb
- Dataset Food-101: https://huggingface.co/datasets/ethz/food101
- Subconjunto pizza_steak_sushi_20_percent (zip): https://github.com/mrdbourke/pytorch-deep-learning/raw/main/data/pizza_steak_sushi_20_percent.zip
- FoodVision-Mini-App (GitHub): https://github.com/Saud-Shakeel/FoodVision-Mini-App
- FoodVision Mini (Space de AIGuardiansML): https://huggingface.co/spaces/AIGuardiansML/foodvision_mini_demo
- FoodVision Mini (Space de 3u89): https://huggingface.co/spaces/3u89/foodvision_mini
- Demos FoodVision (GitHub TRB7): https://github.com/TRB7/AI-pytorch-deep-learning/tree/main/demos
