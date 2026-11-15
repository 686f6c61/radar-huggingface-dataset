# ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_exp-k_signed-exp-v

## Resumen

El modelo `ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_exp-k_signed-exp-v` es un clasificador de imagenes basado en una arquitectura denominada bViT, entrenado por el usuario ais0430 en el marco de un proyecto de reproduccion experimental (bViT_circuit). El modelo se ha entrenado sobre el subconjunto ImageNet-100 y su unico objetivo declarado es la clasificacion de imagenes en 100 clases. Con 3.059.926 parametros totales, es un modelo de escala muy pequena, orientado mas a la experimentacion y al estudio de variantes arquitectonicas que a un uso en produccion.

La nomenclatura del identificador codifica buena parte de la configuracion del experimento: dimension de embedding de 462, 6 cabezas de atencion, 30 epocas de entrenamiento, batch de 128, tasa de aprendizaje de 5e-4, sin EMA (exponential moving average), y una variante de funcion de activacion o exponente denotada como `exp-k_signed-exp-v`. La mejor exactitud de evaluacion reportada es 0,4150 (41,5 %) sobre ImageNet-100.

El modelo es relevante unicamente como artefacto de investigacion reproducible: no hay model card detallada, no se declara licencia ni idiomas, y el repositorio no incluye pesos en formatos alternativos. Cualquier evaluacion adicional debe remitirse al repositorio GitHub del proyecto y al run de Weights & Biases enlazados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bViT (vision transformer con variante experimental bViT) |
| Parametros totales | 3.059.926 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; resolucion de entrada no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificacion de imagenes, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer de vision (ViT) bajo la etiqueta `bvit`, con un diseno experimental propio del proyecto bViT_circuit. El identificador indica una dimension de embedding de 462 y 6 cabezas de atencion, lo que da una dimension por cabeza de 77, un valor atipico que sugiere que el autor esta explorando configuraciones no estandar. No se dispone de informacion sobre el numero de capas, el tamano de parche, la resolucion de entrada ni el uso de componentes adicionales (por ejemplo, atencion lineal o modulos de tipo circuito).

El entrenamiento se realizo sobre ImageNet-100 durante 30 epocas con batch de 128 y learning rate de 5e-4, sin EMA. La variante `exp-k_signed-exp-v` sugiere una modificacion en la funcion exponencial o en el esquema de activacion/normalizacion, pero no se detalla en la model card. No hay informacion sobre el numero de tokens de entrenamiento, composicion del dataset mas alla del tag `imagenet100`, ni sobre el uso de RLHF/DPO (no aplicable a clasificacion). La mejor exactitud de evaluacion reportada es 0,4150.

## Capacidades

- Clasificacion de imagenes en 100 clases (ImageNet-100).
- Inferencia via pipeline `image-classification` de la libreria `transformers`.
- Compatible con endpoints (tag `endpoints_compatible`).
- No soporta generacion de texto, codigo, matematicas ni razonamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No dispone de modo thinking, vision generativa ni audio.

## Casos de uso

- Clasificacion experimental en investigacion: util como linea base reproducible para comparar variantes de la arquitectura bViT sobre ImageNet-100, dado que el identificador codifica todos los hiperparametros del experimento.
- Estudio de eficiencia en modelos pequenos: con solo 3,06 M de parametros, sirve para analizar el compromiso entre tamano y exactitud (41,5 %) en tareas de clasificacion de 100 clases.
- Reproduccion de experimentos: el enlace al repositorio bViT_circuit y al run de W&B permite replicar el entrenamiento y verificar resultados.
- Docencia y formacion: adecuado para ilustrar el flujo completo de entrenamiento y evaluacion de un ViT de escala reducida en un dataset controlado.
- Prototipado rapido de pipelines de clasificacion: integrable en `transformers` para probar extremo a extremo el pipeline `image-classification` antes de escalar a modelos mayores.
- Benchmarking de infraestructura: por su tamano minimo, es util para validar despliegues (endpoints, contenedores) sin coste computacional significativo.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| ImageNet-100 (eval accuracy, best) | 0,4150 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (3,06 M de parametros, ~12 MB de pesos); en la practica, el cuello de botella es el runtime de PyTorch, no el modelo.
- GPU recomendadas: cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) es suficiente; tambien funciona en CPU.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1-2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers` (pipeline `image-classification`), servidores compatibles con endpoints; no se han publicado conversiones a GGUF, ONNX ni TensorRT.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ais0430/in100_bvit (este modelo) | 3,06 M | no disponible | 41,5 % en ImageNet-100 | no disponible | Hugging Face |
| ViT-base (ImageNet-1k) | ~86 M | 224x224 | no comparable directamente (otro dataset) | Apache 2.0 (tipicamente) | Hugging Face |
| DeiT-tiny | ~5,7 M | 224x224 | no comparable directamente (ImageNet-1k) | Apache 2.0 (tipicamente) | Hugging Face |

No se dispone de resultados comparables en el mismo dataset (ImageNet-100) para estos modelos en la informacion proporcionada; la comparativa es solo orientativa por escala.

## Limitaciones y advertencias

- Modelo de investigacion sin model card detallada: no se documentan sesgos, datos de preprocesado ni metodologia de evaluacion.
- Riesgo de alucinacion no aplicable (no genera texto), pero si riesgo de clasificaciones erroneas dado el 41,5 % de exactitud.
- Limitado a 100 clases de ImageNet-100; no generaliza a otras taxonomias sin reentrenamiento.
- Sin informacion sobre licencia: no se puede asumir uso comercial permitido.
- Sin informacion sobre idiomas (no aplica) ni sobre resolucion de entrada o normalizacion esperada.
- Repositorio de 0,0 GB y 0 descargas: artefacto sin validacion externa ni comunidad.
- No hay pesos en formatos alternativos (GGUF, ONNX) ni cuantizaciones publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_exp-k_signed-exp-v
- Repositorio del proyecto: https://github.com/otia-0430/bViT_circuit
- Run de Weights & Biases: https://forge.coreweave.com/wandb/aito-paretto-/bvit/runs/ui59yyzh
