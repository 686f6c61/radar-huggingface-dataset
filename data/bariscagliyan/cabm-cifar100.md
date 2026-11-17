# bariscagliyan/cabm-cifar100

## Resumen

CaBM (Caption Bottleneck Models) es una arquitectura de clasificación de imágenes que no procesa píxeles directamente: un modelo visión-lenguaje congelado genera varias descripciones textuales (captions) de la imagen y un clasificador de texto puntúa cada una de ellas. Este repositorio, `cabm-cifar100`, es el clasificador de texto asociado al conjunto CIFAR-100 (100 clases), construido mediante un fine-tuning de `FacebookAI/roberta-base` sobre captions censuradas generadas por `Qwen/Qwen3-VL-2B-Instruct`.

El modelo resuelve un problema de interpretabilidad: al forzar que toda la decisión de clasificación pase por un cuello de botella textual, se puede auditar exactamente qué información (en forma de caption) ha motivado la predicción. Es relevante para investigadores que trabajan en modelos interpretables, ya que separa la percepción visual (captioner congelado) del razonamiento clasificatorio (clasificador de texto entrenable).

El repositorio tiene un tamaño de 0,5 GB, se distribuye con licencia MIT y está pensado para su uso dentro del pipeline completo del proyecto (generación de captions + clasificación). El clasificador alcanza un 81,14 % de top-1 y un 95,97 % de top-5 en CIFAR-100 promediando logits sobre 5 captions por imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) con cabeza lineal sobre el token [CLS] de la ultima capa |
| Parametros totales | no disponible (roberta-base tiene ~125 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (truncation configurada en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch |

## Arquitectura y entrenamiento

El sistema completo es un pipeline de dos etapas. Primero, un captioner congelado (`Qwen/Qwen3-VL-2B-Instruct`) genera K = 5 captions censuradas por imagen, muestreadas con temperaturas 0.7, 0.9, 1.1, 1.3 y 1.5. Después, el clasificador de texto (RoBERTa-base con una cabeza lineal sobre el [CLS] de la capa final) puntúa cada caption de forma independiente y los logits se promedian para obtener la predicción final. Este diseño impone un cuello de botella textual explícito entre la imagen y la etiqueta.

El entrenamiento del clasificador se realizó sobre el dataset `datasets/cabm-captions/cifar100`, con un máximo de 30 épocas, learning rate 2e-05, batch efectivo 48, label smoothing 0.1, LLRD (layer-wise learning rate decay) de 0.85, congelación de las dos capas inferiores y early stopping sobre la pérdida de validación. No se documenta en la información disponible el uso de RLHF o DPO; el ajuste es supervisado sobre etiquetas de clase.

## Capacidades

- Clasificación de imágenes en 100 clases de CIFAR-100, pero exclusivamente a partir de texto (captions), no de píxeles.
- Clasificación de texto multi-etiqueta por caption con agregación por promedio de logits.
- Interpretabilidad nativa: cada predicción es trazable a las captions que la sustentan.
- Procesamiento de lotes de captions de una misma imagen (K captions por imagen en el flujo previsto).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (idioma declarado: en).
- No incluye visión, audio ni modo de pensamiento; la parte visual queda delegada al captioner externo.

## Casos de uso

- Investigación en interpretabilidad: auditar qué captions motivan cada predicción y detectar atajos o sesgos en el cuello de botella textual.
- Clasificación de imágenes de bajo coste computacional en inferencia: una vez generadas las captions, el clasificador es un RoBERTa-base ligero que puede ejecutarse en CPU.
- Experimentos controlados de sesgo visual-textual: comparar cómo varía la predicción al cambiar el captioner o las temperaturas de muestreo, manteniendo fijo el clasificador.
- Docencia y reproducción de papers: el repositorio incluye instrucciones de descarga y un ejemplo de inferencia con `cabm.classifier.load_trained`, útil para replicar el resultado del ECCV 2026.
- Prototipado de pipelines caption-then-classify: sirve como bloque de referencia para tareas de clasificación donde se quiera separar percepción y decisión.
- Evaluación de robustez frente a ruido textual: al promediar logits sobre 5 captions con temperaturas distintas, se puede estudiar la estabilidad de la predicción ante variaciones en el texto de entrada.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| CIFAR-100 | Top-1 accuracy (promedio de logits sobre captions) | 81,14 % |
| CIFAR-100 | Top-5 accuracy | 95,97 % |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni en otras tareas.

## Requisitos de hardware

- VRAM estimada para el clasificador: un RoBERTa-base en fp32 ocupa aproximadamente 0,5 GB de pesos; en fp16 en torno a 0,25 GB, más memoria de activaciones según el batch de captions.
- El clasificador cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso puede ejecutarse en CPU, como muestra el propio ejemplo de la model card.
- El pipeline completo requiere además el captioner `Qwen/Qwen3-VL-2B-Instruct`, cuyos requisitos de VRAM no se detallan en la información proporcionada.
- Opciones de despliegue: PyTorch nativo con el paquete `cabm` del repositorio de GitHub; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cabm-cifar100 (este) | no disponible (RoBERTa-base) | 512 tokens | Clasificacion via captions (cuello de botella textual) | MIT | Hugging Face + GitHub |
| Clasificadores CNN/ViT para CIFAR-100 | no disponible | no aplica | Clasificacion directa sobre pixeles | variable | amplia |
| RoBERTa-base estandar | ~125 M (no confirmado en la info) | 512 tokens | Clasificacion de texto generico | MIT | Hugging Face |

No se dispone en la información proporcionada de resultados de benchmarks de modelos alternativos para una comparación cuantitativa directa.

## Limitaciones y advertencias

- El modelo no procesa imágenes directamente: depende por completo de la calidad del captioner `Qwen/Qwen3-VL-2B-Instruct` y de las captions generadas.
- Solo soporta inglés; las captions en otros idiomas no están cubiertas.
- El rendimiento declarado (81,14 % top-1) no está verificado de forma independiente (`verified: false`).
- Riesgo de alucinación heredado del captioner: captions incorrectas o censuradas pueden inducir clasificaciones erróneas.
- La truncación a 512 tokens puede perder información en captions largas.
- El pipeline de inferencia requiere descargar y ejecutar también el captioner, además del código del repositorio de GitHub.
- Licencia MIT: permite uso comercial, pero conviene revisar las licencias del captioner base y de los datos de CIFAR-100 por separado.
- No hay información sobre sesgos específicos ni sobre evaluación fuera de CIFAR-100.

## Enlaces

- Hugging Face: https://huggingface.co/bariscagliyan/cabm-cifar100
- Paper (arXiv): https://arxiv.org/abs/2607.00578
- Código: https://github.com/bariscagliyan/CaptionBottleneckModels
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Captioner: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Dataset: https://huggingface.co/datasets/uoft-cs/cifar100
