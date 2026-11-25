# mcxyz/swin-tiny-patch4-window7-224-finetuned-eurosat

## Resumen

El modelo `mcxyz/swin-tiny-patch4-window7-224-finetuned-eurosat` es un ajuste fino (fine-tuning) del clasificador de imágenes `microsoft/swin-tiny-patch4-window7-224` sobre un conjunto de datos no especificado en la model card, aunque el nombre del repositorio sugiere que se trata de EuroSAT, un dataset de clasificación de uso del suelo a partir de imágenes satelitales Sentinel-2. Lo desarrolla el usuario `mcxyz` y se publica bajo licencia Apache 2.0.

Se trata de un modelo de visión por computador para clasificación de imágenes, no de un modelo de lenguaje: no genera texto ni soporta tool calling. Su relevancia es acotada y practica: ofrece un clasificador Swin Transformer Tiny (27,5 millones de parámetros) con un accuracy declarado del 98,56 % en el conjunto de evaluación, lo que lo convierte en un candidato util para tareas de teledeteccion y etiquetado de coberturas terrestres cuando se dispone de imágenes de 224x224 píxeles.

La arquitectura es un Swin Transformer con patches de 4x4 y ventanas de atención de 7x7, preentrenado en ImageNet-1k y reajustado durante 3 epocas con un total de 570 pasos. El repositorio ocupa 0,3 GB y los pesos estan en formato safetensors, listos para `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer (jerarquico con atención por ventanas desplazadas) |
| Parametros totales | 27.527.044 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224x224 píxeles) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16 segun el checkpoint; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `microsoft/swin-tiny-patch4-window7-224`, un Swin Transformer Tiny con atencion local por ventanas de 7x7 y mecanismo de ventanas desplazadas entre etapas para permitir el intercambio de informacion entre ventanas vecinas. La entrada es de 224x224 píxeles con patches de 4x4, lo que produce una jerarquia de mapas de caracteristicas a distintas resoluciones. El modelo base fue preentrenado en ImageNet-1k; el ajuste fino se realizo sobre un dataset no identificado en la model card (presumiblemente EuroSAT, dado el nombre del repositorio).

El entrenamiento se ejecuto con los siguientes hiperparametros: learning rate 5e-05, batch de entrenamiento 32 con acumulacion de gradientes de 4 pasos (batch efectivo 128), 3 epocas, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y semilla 42. Se registran 570 pasos totales, es decir, 190 pasos por epoca. No se documenta el numero de tokens ni la composicion del dataset, ni si hubo aumentacion de datos, RLHF/DPO (no aplica) o tecnicas de destilacion.

## Capacidades

- Clasificación de imágenes: predicción de una clase por imagen de entrada de 224x224 píxeles.
- Extracción de caracteristicas visuales: al ser un Swin Transformer, el backbone puede reutilizarse como extractor para tareas downstream (deteccion, segmentacion, retrieval).
- Ajuste fino adicional: el checkpoint es compatible con `transformers` y puede reentrenarse sobre otros datasets de imágenes.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision-lenguaje, audio ni generacion de texto.

## Casos de uso

- Clasificacion de coberturas del suelo en imagenes Sentinel-2: el modelo puede etiquetar parcelas en categorias como bosque, cultivo, agua o zona urbana, aprovechando el ajuste sobre EuroSAT y su accuracy del 98,56 % en evaluacion.
- Monitorizacion medioambiental: procesar lotes de imagenes satelitales para detectar cambios en la cubierta vegetal o en masas de agua a lo largo del tiempo, usando el modelo como clasificador por tesela.
- Preetiquetado en pipelines de anotacion: generar etiquetas automaticas sobre grandes volumenes de imagenes para que anotadores humanos solo revisen los casos dudosos, reduciendo coste de etiquetado.
- Filtrado y enrutamiento de imagenes: clasificar imagenes entrantes en un sistema de ingesta (por ejemplo, un repositorio de teledeteccion) para dirigirlas al equipo o proceso correspondiente.
- Extraccion de embeddings para busqueda visual: usar las representaciones internas del backbone Swin para construir indices de similitud entre imagenes.
- Prototipado rapido en investigación: servir como baseline ligero (27,5 M de parametros) en experimentos de clasificacion de imagenes antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La model card declara los siguientes resultados en el conjunto de evaluacion durante el entrenamiento (datos del autor):

| Metrica | Valor |
|---|---|
| Loss (evaluacion final) | 0,0437 |
| Accuracy (evaluacion final) | 0,9856 |
| Accuracy (epoca 2) | 0,9793 |
| Accuracy (epoca 1) | 0,9744 |
| Training loss (epoca 3) | 0,1044 |

El `model-index` del repositorio no contiene resultados adicionales. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo de clasificacion de imagenes. Tampoco se han publicado comparaciones con otros modelos en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (27,5 M de parametros, aproximadamente 110 MB de pesos) mas el coste de activaciones para un batch de imagenes de 224x224; en la practica cabe en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna sirve; para throughput alto, A100, H100, L4 o RTX 4090. Para inferencia en CPU es viable con latencias de decenas de milisegundos por imagen.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: `transformers` (Pipeline de image-classification), TorchServe, ONNX Runtime (previa exportacion), Triton Inference Server. No se documentan variantes GGUF ni soporte nativo en llama.cpp u Ollama (no aplica a vision).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mcxyz/swin-tiny-patch4-window7-224-finetuned-eurosat | 27,5 M | 224x224 | Clasificacion de imagenes (uso del suelo) | Apache 2.0 | Hugging Face |
| microsoft/swin-tiny-patch4-window7-224 | 28,3 M (aprox.) | 224x224 | Clasificacion de imagenes (ImageNet-1k) | MIT (modelo base) | Hugging Face |
| ResNet-50 (ImageNet-1k) | 25,6 M | 224x224 | Clasificacion de imagenes | Apache 2.0 (torchvision) | torchvision |
| ViT-base-patch16-224 | 86 M | 224x224 | Clasificacion de imagenes | Apache 2.0 | Hugging Face |

No se dispone de resultados comparativos de accuracy entre estos modelos sobre EuroSAT en la informacion proporcionada. La comparativa se limita a tamano, tarea y licencia.

## Limitaciones y advertencias

- La model card indica explicitamente "More information needed" en las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento: no hay documentacion sobre el dataset, el preprocesado ni la metodologia de evaluacion.
- El accuracy del 98,56 % corresponde al conjunto de evaluacion del autor; no se especifica su tamano ni si hubo separacion estricta de train/validation/test, por lo que puede estar sobreestimado.
- Riesgo de sesgo: si el dataset es EuroSAT, las clases estan limitadas a un conjunto cerrado de categorias de uso del suelo en Europa; el modelo puede fallar en imagenes de otras regiones, sensores o resoluciones.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento. Cualquier uso que requiera lenguaje natural queda fuera de su alcance.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene validar el modelo sobre datos propios antes de desplegarlo en produccion.
- El repositorio tiene 29 descargas y 0 likes: es un modelo de bajo uso, sin validacion comunitaria.
- No se documentan limitaciones de contexto ni de idioma porque no aplican a un clasificador de imagenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcxyz/swin-tiny-patch4-window7-224-finetuned-eurosat
- Modelo base: https://huggingface.co/microsoft/swin-tiny-patch4-window7-224
- Paper de Swin Transformer: https://arxiv.org/abs/2103.14030
- Dataset EuroSAT (referencia por el nombre del repositorio, no confirmado en la model card): https://arxiv.org/abs/1709.00029
- Documentacion de `transformers` para image-classification: https://huggingface.co/docs/transformers/tasks/image_classification
