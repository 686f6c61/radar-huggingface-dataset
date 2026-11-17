# bariscagliyan/cabm-imagenet1k

## Resumen

CaBM ImageNet-1K es el clasificador de texto del método Caption Bottleneck Models (CaBM), presentado en el artículo homónimo aceptado en ECCV 2026 por Seref Baris Cagliyan, Umut Ozdemir, Merve Tapli y Emre Akbas. El modelo no procesa píxeles directamente: clasifica una imagen exclusivamente a partir de texto. Un modelo visión-lenguaje congelado (Qwen3-VL-8B-Instruct) genera K captions censurados de la imagen, este clasificador RoBERTa-base puntúa cada caption y los logits por caption se promedian para producir la predicción final sobre las 1000 clases de ImageNet-1K.

La relevancia del enfoque es la interpretabilidad: al forzar que toda la información pase por un cuello de botella textual, la decisión del clasificador es auditable en lenguaje natural, algo que un CNN o ViT opaco no ofrece. El repositorio ocupa 0,5 GB y se distribuye en formato safetensors con pesos PyTorch, bajo licencia MIT, lo que facilita su uso comercial y su integración en pipelines de investigación.

Técnicamente es un fine-tuning de `FacebookAI/roberta-base` con una cabeza lineal sobre el token [CLS] de la última capa, entrenado sobre el dataset de captions `cabm-captions/imagenet1k`. Alcanza un 73,90 % de top-1 y un 93,14 % de top-5 en el split de test, según los datos declarados por el autor (no verificados de forma independiente).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) con cabeza lineal sobre [CLS] de la última capa |
| Parametros totales | no disponible (RoBERTa-base como base; el total exacto no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens por caption (truncation=True, max_length=512 en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El modelo es un clasificador de texto basado en RoBERTa-base. La arquitectura completa de CaBM consta de dos etapas: primero, un captioner congelado (Qwen3-VL-8B-Instruct) genera K=3 captions por imagen con temperaturas de muestreo 0,0, 0,3 y 0,6; después, este clasificador RoBERTa-base puntúa cada caption y se promedian los logits de las tres captions para obtener la predicción de clase. El clasificador usa la representación [CLS] de la última capa seguida de una capa lineal de 1000 salidas.

El entrenamiento se realizó durante un máximo de 30 épocas con learning rate 2e-05, batch efectivo de 48, label smoothing de 0,1, layer-wise learning rate decay (LLRD) de 0,85, congelación de las dos capas inferiores y early stopping sobre la pérdida de validación. Los datos de entrenamiento son las captions del dataset `cabm-captions/imagenet1k`, derivadas de ImageNet-1K. No se declara el número total de tokens de entrenamiento ni si hubo etapas de RLHF o DPO; al tratarse de un clasificador supervisado, no se espera alineación por preferencias.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1K exclusivamente a partir de captions de texto.
- Agregación de múltiples captions por imagen mediante promedio de logits (K=3 en la configuración del autor).
- Interpretabilidad inherente: la decisión se puede trazar a las captions de entrada, que son legibles por humanos.
- Procesamiento de texto en inglés (idioma del captioner y del clasificador).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo generativo: no produce texto libre, solo logits de clasificación.
- No tiene modo thinking, visión nativa ni audio.

## Casos de uso

- Clasificación de imágenes interpretable en investigación: usar el pipeline completo (captioner congelado + este clasificador) para obtener predicciones de ImageNet-1K donde cada decisión se puede auditar a través de las captions generadas, útil en estudios de explicabilidad.
- Auditoría de sesgos en modelos visión-lenguaje: al depender de captions, se puede analizar cómo el captioner describe distintas clases y si esas descripciones inducen errores sistemáticos en el clasificador.
- Docencia y divulgación sobre concept bottleneck models: el repositorio y el código asociado permiten reproducir el flujo completo con un coste computacional moderado (RoBERTa-base es ligero comparado con el captioner).
- Evaluación de estrategias de agregación de captions: el modelo sirve como componente fijo para comparar variantes de generación de captions (temperaturas, prompts, número de captions K) sin reentrenar el clasificador.
- Prototipado de sistemas de clasificación con requisitos de transparencia: en dominios donde se exige justificar la predicción en lenguaje natural, este clasificador puede integrarse como etapa final de un pipeline caption-first.
- Investigación en destilación de conocimiento desde modelos visión-lenguaje: el clasificador demuestra que un modelo de texto pequeño puede alcanzar un 73,90 % de top-1 en ImageNet-1K usando solo captions de un VLM grande, lo que abre líneas de trabajo sobre destilación vía texto.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| ImageNet-1K | Top-1 accuracy (caption logit averaging) | 73,90 % |
| ImageNet-1K | Top-5 accuracy | 93,14 % |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni otros benchmarks estándar de texto, ya que el modelo es un clasificador de imágenes vía texto y no un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; RoBERTa-base en fp32 ocupa del orden de 0,5 GB de pesos, por lo que la inferencia del clasificador cabe holgadamente en cualquier GPU consumer. El captioner (Qwen3-VL-8B-Instruct) es el componente pesado del pipeline y requiere varios GB de VRAM, aunque no forma parte de este repositorio.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para el clasificador; para el pipeline completo con el captioner se recomienda una GPU de 16 GB o superior (A100, H100, RTX 4090, RTX 3090).
- Cabe en GPU consumer: sí, el clasificador por sí solo cabe en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo con el código del repositorio GitHub (`cabm.classifier.load_trained`); no se declaran integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de modelos comparables de la misma categoría (concept bottleneck models sobre ImageNet-1K) con métricas equiparables. La comparación con clasificadores de imagen convencionales (ResNet, ViT) no es directa porque CaBM no procesa píxeles y depende de un captioner externo.

| Modelo | Tipo | Top-1 ImageNet-1K | Licencia | Disponibilidad |
|---|---|---|---|---|
| CaBM ImageNet-1K (este) | Clasificador de texto sobre captions | 73,90 % (declarado) | MIT | Hugging Face + GitHub |
| Clasificadores de imagen convencionales | CNN/ViT sobre píxeles | no disponible en esta ficha | variable | variable |
| Otros concept bottleneck models | CBM sobre conceptos | no disponible | variable | variable |

## Limitaciones y advertencias

- Dependencia total del captioner: la calidad de la clasificación está acotada por la calidad de las captions de Qwen3-VL-8B-Instruct; errores u omisiones en las captions se propagan directamente a la predicción.
- Solo inglés: el clasificador y el pipeline están diseñados para captions en inglés; no se declara soporte multilingüe.
- Dominio restringido: entrenado exclusivamente para las 1000 clases de ImageNet-1K; no generaliza a otras taxonomías sin reentrenamiento.
- Riesgo de alucinación del captioner: el VLM puede describir objetos ausentes, lo que induce errores de clasificación difíciles de detectar sin inspección manual.
- Resultados no verificados: la accuracy de 73,90 % es un dato declarado por el autor (`verified: false`); no hay validación independiente en la información disponible.
- Restricciones de licencia: MIT permite uso comercial, pero el uso del captioner Qwen3-VL-8B-Instruct está sujeto a su propia licencia, que debe revisarse por separado.
- Sin soporte de cuantización declarado: no se documentan formatos GGUF ni cuantizaciones oficiales, lo que limita opciones de despliegue en entornos con restricciones de memoria.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de uso muy incipiente, sin comunidad que reporte incidencias.

## Enlaces

- Hugging Face: https://huggingface.co/bariscagliyan/cabm-imagenet1k
- Paper (arXiv): https://arxiv.org/abs/2607.00578
- Código: https://github.com/bariscagliyan/CaptionBottleneckModels
- Dataset de captions: `datasets/cabm-captions/imagenet1k` (referenciado en la model card)
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Captioner utilizado: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset de evaluación: https://huggingface.co/datasets/ILSVRC/imagenet-1k
