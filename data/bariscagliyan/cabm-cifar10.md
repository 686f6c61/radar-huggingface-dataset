# bariscagliyan/cabm-cifar10

## Resumen

CaBM-CIFAR-10 es el clasificador de texto del sistema Caption Bottleneck Models (CaBM), presentado en el paper homonimo aceptado en ECCV 2026 por Seref Baris Cagliyan, Umut Ozdemir, Merve Tapli y Emre Akbas. El modelo no procesa imagenes directamente: recibe un conjunto de K subtitulos (captions) generados por un modelo vision-lenguaje congelado (`Qwen/Qwen3-VL-2B-Instruct`) y predice la clase CIFAR-10 a partir de ellos. Se trata de un fine-tuning de `FacebookAI/roberta-base` con una cabeza lineal sobre el token [CLS] de la ultima capa.

La relevancia del modelo es metodologica: materializa la idea de un cuello de botella textual interpretable entre la imagen y la etiqueta. Al clasificar solo a partir de descripciones censuradas de la imagen, el sistema permite auditar que informacion textual esta conduciendo la decision, algo que un clasificador de vision convencional no ofrece. El pipeline declarado en Hugging Face es `text-classification`, aunque la tarea evaluada en la model card es clasificacion de imagenes CIFAR-10 mediante agregacion de logits por caption.

El repositorio ocupa aproximadamente 0,5 GB, tiene licencia MIT y esta pensado para usarse junto al codigo del proyecto en GitHub, que incluye el script `generate_captions.py` necesario para producir los subtitulos con el mismo captioner, prompt y temperaturas que en el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) con cabeza lineal sobre [CLS] de la ultima capa |
| Parametros totales | no disponible (el modelo base es `roberta-base`, ~125 M, pero la cifra exacta del checkpoint no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (truncation declarada en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

El clasificador es un `roberta-base` afinado de extremo a extremo (salvo las dos primeras capas, congeladas) con una cabeza lineal que proyecta el vector [CLS] de la ultima capa a las 10 clases de CIFAR-10. La innovacion no esta en el encoder sino en el pipeline: un VLM congelado (`Qwen/Qwen3-VL-2B-Instruct`) genera K=5 subtitulos censurados por imagen, con temperaturas de muestreo 0.7, 0.9, 1.1, 1.3 y 1.5. Cada caption se puntua de forma independiente y los logits se promedian antes del argmax. El entrenamiento usa los captions del dataset `datasets/cabm-captions/cifar10`, con un maximo de 30 epocas, learning rate 2e-05, batch efectivo 48, label smoothing 0.1, layer-wise learning rate decay 0.85, congelacion de las dos capas inferiores y early stopping sobre la perdida de validacion.

La consecuencia practica es que el modelo solo ve texto en inferencia: cualquier error del captioner (omisiones, sesgos descriptivos, alucinaciones) se propaga al clasificador, y el cuello de botella textual actua como mecanismo de interpretabilidad y de control. El paper esta publicado en el volumen 17036 de Lecture Notes in Computer Science (Springer), paginas 445-461.

## Capacidades

- Clasificacion de imagenes CIFAR-10 (10 clases) de forma indirecta, a partir de subtitulos textuales generados por un VLM externo.
- Procesamiento de multiples captions por imagen con agregacion por media de logits (K=5 en la configuracion de referencia).
- Clasificacion de texto generico segun el pipeline declarado (`text-classification`), heredada de la cabeza sobre `roberta-base`.
- Interpretabilidad por construccion: la decision es auditable a traves de los captions de entrada.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles (idioma declarado: `en`).
- No dispone de modo thinking, vision directa, audio ni otras modalidades nativas.

## Casos de uso

- Auditoria de sesgos en pipelines vision-lenguaje: al clasificar solo a partir de captions, se puede analizar que terminos descriptivos correlacionan con cada clase y detectar sesgos del captioner antes de desplegar un sistema multimodal.
- Investigacion en interpretabilidad: el cuello de botella textual permite trazar la decision hasta frases concretas, util para estudiar mecanismos de explicabilidad en clasificacion visual.
- Prototipado de clasificadores de bajo coste computacional: una vez generados los captions, la inferencia se ejecuta en CPU o GPU modesta con un encoder de ~125 M de parametros y contexto de 512 tokens.
- Evaluacion comparativa de captioners: manteniendo fijo este clasificador, se puede medir como distintos VLM afectan la precision final en CIFAR-10, aislando el efecto del generador de descripciones.
- Docencia y reproduccion de resultados: el repositorio incluye codigo de carga (`load_trained`) y scripts de generacion de captions, lo que facilita replicar el 96,42 % de top-1 en entornos academicos.
- Filtrado y anotacion asistida de datasets de imagen: en flujos donde ya existe un captioner en produccion, este modelo puede reutilizarse como etiquetador textual ligero sin anadir un segundo modelo de vision.
- Analisis de robustez ante descripciones censuradas: permite estudiar como la eliminacion de informacion en los captions degrada la clasificacion, informando el diseno de sistemas con restricciones de privacidad.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Image Classification | CIFAR-10 (`uoft-cs/cifar10`) | Top-1 accuracy (media de logits por caption) | 96,42 % |
| Image Classification | CIFAR-10 (`uoft-cs/cifar10`) | Top-5 accuracy | 99,93 % |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni en benchmarks de clasificacion de imagen convencionales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del encoder (~125 M de parametros en `roberta-base`) se puede ejecutar en CPU y en GPUs consumer con pocos GB de memoria.
- GPU recomendadas: no declaradas por el autor. Cualquier GPU con suficiente memoria para un encoder de ~0,5 GB en pesos es suficiente; el cuello de botella real esta en el captioner (`Qwen/Qwen3-VL-2B-Instruct`), que requiere hardware aparte.
- Cabe en GPU consumer: si, el clasificador por si solo es ligero; el VLM captioner es el componente exigente.
- Opciones de despliegue: el autor documenta uso con PyTorch y el paquete `cabm` del repositorio GitHub (`cabm.classifier.load_trained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de otros clasificadores CIFAR-10 ni de modelos de cuello de botella conceptual comparables, por lo que no se puede establecer una comparativa con datos verificables.

## Limitaciones y advertencias

- Dependencia total del captioner: si `Qwen/Qwen3-VL-2B-Instruct` omite informacion discriminativa o alucina, el clasificador no puede recuperarla; el techo de precision esta acotado por la calidad de los captions.
- Ambito restringido a CIFAR-10 (10 clases) y a ingles; no es un clasificador de imagenes general.
- El pipeline declarado en Hugging Face (`text-classification`) no coincide con la tarea evaluada (`image-classification`), lo que puede confundir a herramientas automaticas de descubrimiento.
- Riesgo de alucinacion heredado del captioner y del propio encoder de texto; no hay evaluacion publicada de calibracion ni de robustez fuera de CIFAR-10.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre captions de un VLM, puede heredar sesgos descriptivos de ese modelo.
- Licencia MIT permite uso comercial del checkpoint, pero el uso del captioner `Qwen/Qwen3-VL-2B-Instruct` esta sujeto a su propia licencia, que debe verificarse por separado.
- El resultado de 96,42 % esta marcado como no verificado (`verified: false`) en el model-index; conviene reproducirlo antes de usarlo como referencia en produccion.
- No apto para tool calling, agentes ni tareas generativas: es un clasificador, no un modelo de proposito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bariscagliyan/cabm-cifar10
- Paper (arXiv): https://arxiv.org/abs/2607.00578
- Codigo: https://github.com/bariscagliyan/CaptionBottleneckModels
- Dataset de captions: `datasets/cabm-captions/cifar10` (referenciado en la model card)
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Captioner: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Dataset CIFAR-10: https://huggingface.co/datasets/uoft-cs/cifar10
