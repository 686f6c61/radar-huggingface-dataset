# CMM1204/my_awesome_food_model

## Resumen

`CMM1204/my_awesome_food_model` es un modelo de clasificacion de imagenes obtenido mediante fine-tuning de `google/vit-base-patch16-224-in21k`, un Vision Transformer (ViT) preentrenado por Google en ImageNet-21k. El autor, CMM1204, lo publica bajo licencia Apache 2.0 con el pipeline `image-classification` de Hugging Face Transformers. Por el nombre y la unica metrica reportada (accuracy de 0,884 sobre un conjunto de evaluacion no documentado), el modelo esta orientado a la clasificacion de imagenes de comida, aunque la model card no especifica el dataset ni las clases.

Se trata de un modelo pequeno (85,8 millones de parametros, unos 0,3 GB de pesos en safetensors) entrenado con el `Trainer` de Transformers y registrado en Trackio. No hay publicaciones, benchmarks formales ni documentacion adicional: la model card es la generada automaticamente por la herramienta de entrenamiento y contiene secciones con "More information needed". Es, por tanto, un artefacto experimental mas que un modelo listo para produccion.

Su relevancia es limitada y de nicho: sirve como ejemplo de fine-tuning de un ViT base para una tarea de clasificacion concreta y como punto de partida reproducible (hiperparametros documentados) para quien quiera adaptar ViT a un dominio alimentario. No debe confundirse con un modelo generativo ni con un sistema multimodal: es un clasificador de imagen a etiqueta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT), variante base patch16-224 |
| Parametros totales | 85.876.325 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 224x224 px) |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF, AWQ, GPTQ ni ONNX) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google/vit-base-patch16-224-in21k`: un transformer de vision con parches de 16x16 pixeles sobre imagenes de 224x224, preentrenado por Google en ImageNet-21k. El fine-tuning se realizo con el `Trainer` de Transformers 5.22.1 sobre PyTorch 2.14.1 y Datasets 4.8.5. Los hiperparametros documentados son: learning rate 5e-5, batch de entrenamiento 16 con acumulacion de gradientes de 4 (batch efectivo 64), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con warmup del 10 %, 3 epocas y semilla 42.

El entrenamiento consta de 189 pasos (63 por epoca). La perdida de validacion baja de 2,5414 en la primera epoca a 1,6035 en la tercera, con accuracy de 0,81, 0,864 y 0,884 respectivamente. No se documenta el dataset (la model card indica "unknown dataset"), ni el numero de ejemplos, ni el numero de clases, ni si hubo aumentacion de datos, regularizacion o tecnicas de RLHF/DPO (no aplicables a un clasificador). No hay innovaciones tecnicas destacables: es un fine-tuning estandar de clasificacion.

## Capacidades

- Clasificacion de imagenes en un unico paso (image classification), con salida de logits por clase.
- Especializacion probable en imagenes de comida segun el nombre del modelo; las clases concretas no estan documentadas.
- Entrada de imagen RGB de 224x224 pixeles con normalizacion estandar de ViT (media y desviacion de ImageNet).
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No dispone de modo thinking, vision generativa, audio ni otras capacidades especiales.
- No se documenta deteccion de objetos, segmentacion ni captioning.

## Casos de uso

- Clasificacion de fotos de platos en una aplicacion de recetas: el modelo recibe una imagen de 224x224 y devuelve la clase de comida mas probable, que puede usarse para sugerir recetas o filtrar contenido. Adecuado por su bajo coste computacional (85,8 M de parametros).
- Etiquetado automatico de catalogos de imagenes gastronomicas: procesar lotes de imagenes en un pipeline de clasificacion para asignar categorias a un dataset interno. Requiere validar previamente la lista de clases, que no esta documentada.
- Moderacion o filtrado de contenido en plataformas de recetas: descartar imagenes que no correspondan a comida antes de publicarlas. Solo viable si las clases del modelo cubren la distincion necesaria.
- Prototipo educativo de fine-tuning de ViT: sirve como referencia reproducible (hiperparametros y curvas de entrenamiento documentados) para cursos o talleres sobre clasificacion de imagenes con Transformers.
- Base para un clasificador de dominio alimentario mas amplio: partir de estos pesos y reentrenar con un dataset propio etiquetado, aprovechando que la licencia Apache 2.0 permite uso comercial y modificacion.
- Inferencia en dispositivos con recursos limitados: al ocupar unos 0,3 GB en safetensors y tener 85,8 M de parametros, puede ejecutarse en CPU o en GPU consumer (por ejemplo, RTX 3060 o superiores) para clasificacion en tiempo real de flujos de imagen.

## Benchmarks y rendimiento

La model card declara un `model-index` sin resultados (`results: []`). Los unicos datos numericos publicados son los de validacion durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Loss de evaluacion (epoca 3) | 1,6035 |
| Accuracy de evaluacion (epoca 3) | 0,884 |
| Loss de entrenamiento (epoca 3) | 1,5575 |
| Accuracy de validacion (epoca 1) | 0,81 |
| Accuracy de validacion (epoca 2) | 0,864 |

No se han publicado resultados de benchmarks estandar (ImageNet, Food-101, MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (85,8 M de parametros, unos 0,34 GB de pesos); en FP16 o bfloat16, aproximadamente 0,17 GB. El pico real depende del tamano de lote y del framework.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son mas que suficientes. Tambien funciona en CPU para lotes pequenos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU.
- Opciones de despliegue: `transformers` con `pipeline("image-classification")`, TorchScript o exportacion a ONNX (no documentada), y servidores de inferencia genericos. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no estan pensados para clasificadores ViT.
- Latencia y throughput: no disponibles. Por el tamano del modelo, se espera latencia de milisegundos por imagen en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CMM1204/my_awesome_food_model | 85,8 M | Clasificacion de imagenes (comida, presunto) | Imagen 224x224 | Apache 2.0 | Hugging Face, 0 descargas |
| google/vit-base-patch16-224-in21k | ~86 M | Vision general (preentrenado) | Imagen 224x224 | Apache 2.0 | Hugging Face, ampliamente usado |
| google/vit-base-patch16-224 | ~86 M | Clasificacion ImageNet-1k | Imagen 224x224 | Apache 2.0 | Hugging Face |
| openai/clip-vit-base-patch32 | ~151 M | Vision-lenguaje (zero-shot) | Imagen + texto | MIT | Hugging Face |

La comparacion con el modelo base es la mas directa: ambos comparten arquitectura y tamano, pero el modelo base esta preentrenado en ImageNet-21k y este ha sido ajustado para una tarea concreta no documentada. Frente a CLIP, este modelo no ofrece clasificacion zero-shot ni alineamiento texto-imagen. No se dispone de datos de rendimiento comparativo porque el autor no publica benchmarks.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado ("unknown dataset"): se desconoce el numero de clases, la distribucion de ejemplos y el dominio exacto. El nombre sugiere comida, pero no esta confirmado.
- La accuracy de 0,884 corresponde a un conjunto de evaluacion no descrito; no es comparable con benchmarks publicos y puede reflejar sobreajuste o un conjunto de validacion poco representativo.
- Riesgo de alucinacion en el sentido de clasificaciones erroneas con alta confianza: al ser un clasificador cerrado, asignara siempre una de sus clases aunque la imagen no pertenezca al dominio.
- Sesgos desconocidos: al no documentarse el dataset, no se pueden evaluar sesgos de representacion (cocinas, paises, iluminacion, calidad de imagen).
- Limitaciones de idioma: no aplica, es un modelo de vision; no procesa texto.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por la comunidad.
- Model card generada automaticamente con secciones incompletas ("More information needed"): no hay documentacion de usos previstos ni limitaciones declaradas por el autor.
- Para produccion se recomienda reentrenar o validar con un dataset propio antes de confiar en las predicciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMM1204/my_awesome_food_model
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Espacio de Trackio del autor: https://huggingface.co/spaces/CMM1204/huggingface-static-6ee700
- Repositorio de Trackio: https://github.com/gradio-app/trackio
- Paper de ViT (referencia del modelo base): https://arxiv.org/abs/2010.11929
- Documentacion de Transformers para image-classification: https://huggingface.co/docs/transformers/tasks/image_classification
