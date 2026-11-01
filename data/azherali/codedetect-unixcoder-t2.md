# azherali/CodeDetect-UniXCoder-T2

## Resumen

CodeDetect-UniXCoder-T2 es un modelo de clasificación de texto obtenido por fine-tuning supervisado de `microsoft/unixcoder-base`, un encoder tipo RoBERTa preentrenado sobre código fuente y lenguaje natural. Lo publica el usuario `azherali` en HuggingFace bajo licencia Apache 2.0. Por el nombre y la pipeline declarada (`text-classification`), el modelo está orientado a la detección de código en texto, aunque la model card no documenta explícitamente la tarea ni el dataset de entrenamiento.

El modelo tiene 125.938.187 parámetros (aproximadamente 126 M), lo que lo sitúa en la categoría de encoders pequeños, aptos para inferencia en CPU y GPU de consumo. Se distribuye en formato safetensors con un tamaño de repositorio de 2,5 GB, lo que sugiere la presencia de múltiples checkpoints de entrenamiento además de los pesos finales.

Su relevancia práctica es limitada pero concreta: reutiliza un backbone especializado en código (UniXcoder) y lo adapta mediante entrenamiento con `Trainer` de HuggingFace a una tarea de clasificación binaria o multiclase. Los resultados declarados en el conjunto de evaluación son modestos (accuracy 0,6569, F1 0,6143), y la model card está generada automáticamente sin documentación adicional, por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (base: microsoft/unixcoder-base) |
| Parametros totales | 125.938.187 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el backbone UniXcoder soporta hasta 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible via transformers/bitsandbytes, no documentada) |
| Idiomas soportados | no disponible (el backbone UniXcoder es multilingue en código; idiomas naturales no declarados) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `microsoft/unixcoder-base`, un encoder basado en la arquitectura RoBERTa entrenado originalmente con objetivos multimodales sobre código y lenguaje natural (modalidad de codigo, modalidad de comentarios y modalidad de documentación). Sobre ese backbone se ha aplicado una cabeza de clasificación de secuencias (`text-classification`) y se ha entrenado con la librería `transformers` mediante `Trainer`.

Los hiperparámetros declarados son: learning rate 2e-5, batch size 64 (entrenamiento y evaluación), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con warmup del 10 %, 5 épocas, seed 42 y precisión mixta nativa (AMP). El entrenamiento alcanzó 66.175 pasos. No se documenta el dataset utilizado (la model card indica "None dataset"), ni el número de tokens, ni si hubo etapas de RLHF/DPO (no aplicables en un encoder de clasificación). Tampoco se describe ninguna innovación técnica adicional más allá del fine-tuning estándar. Las versiones de framework declaradas son Transformers 5.13.1, PyTorch 2.11.0+cu130, Datasets 4.0.0 y Tokenizers 0.22.2.

## Capacidades

- Clasificación de texto: salida de etiquetas con probabilidades sobre secuencias de entrada, orientada (por el nombre del modelo) a la detección de código.
- Codificación de representaciones: al derivar de UniXcoder, puede emplearse como extractor de embeddings para código y texto mixto.
- Procesamiento de entradas con código fuente y lenguaje natural combinados, gracias al preentrenamiento multimodal del backbone.
- No soporta tool calling ni function calling (es un encoder de clasificación, no un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- No soporta generación de texto.
- No se declaran capacidades de visión ni audio.
- Capacidades multilingües: no documentadas en la model card.

## Casos de uso

- Detección de fragmentos de código en texto libre: clasificar párrafos, mensajes o documentos para identificar si contienen código, útil en moderación de foros o filtrado de contenido técnico.
- Etiquetado de datasets mixtos código/texto: preprocesar corpus para separar ejemplos de código de ejemplos en lenguaje natural antes de entrenar otros modelos.
- Enrutamiento en pipelines de documentación: decidir si un bloque de texto debe procesarse con un analizador de código o con un analizador de lenguaje natural.
- Filtrado previo en sistemas de búsqueda técnica: marcar resultados que contienen código para aplicar resaltado de sintaxis o indexación especializada.
- Clasificación de issues y pull requests: usar el modelo como señal auxiliar para detectar si el contenido de un ticket incluye código reproducible.
- Prototipado rápido de clasificadores sobre código: al ser un encoder de 126 M, permite iterar en CPU o en una GPU de consumo con bajo coste.
- Extracción de características para clustering: generar embeddings de fragmentos mixtos para agrupar contenido técnico.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluación (model card):

| Metrica | Valor |
|---|---|
| Loss | 1,3991 |
| Accuracy | 0,6569 |
| F1 | 0,6143 |
| Precision | 0,6120 |
| Recall | 0,6191 |

Evolución por época según la model card:

| Epoca | Training loss | Validation loss | Accuracy | F1 | Precision | Recall |
|---|---|---|---|---|---|---|
| 1 | 0,9684 | 1,0380 | 0,6277 | 0,5885 | 0,5892 | 0,6279 |
| 2 | 0,7011 | 1,0398 | 0,6485 | 0,6099 | 0,6051 | 0,6334 |
| 3 | 0,4888 | 1,1497 | 0,6559 | 0,6108 | 0,6075 | 0,6221 |
| 4 | 0,3457 | 1,2836 | 0,6573 | 0,6139 | 0,6089 | 0,6235 |
| 5 | 0,2443 | 1,3991 | 0,6569 | 0,6143 | 0,6120 | 0,6191 |

No se han publicado comparaciones con otros modelos en la información disponible. El model-index del repositorio está vacío.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB para los pesos (126 M parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- VRAM estimada en FP16/BF16: aproximadamente 0,25 GB para los pesos.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para lotes pequeños.
- GPU recomendadas para producción de alto throughput: T4, L4, A10G, A100 o H100, aunque el modelo es lo bastante pequeño como para que la CPU sea viable en cargas moderadas.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), Text Embeddings Inference (el repo declara `text-embeddings-inference` y `endpoints_compatible`), y exportación a ONNX para inferencia optimizada. No se documenta soporte nativo de vLLM, llama.cpp u Ollama (no aplicables a un encoder de clasificación).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CodeDetect-UniXCoder-T2 | 125,9 M | no disponible | Clasificacion de texto | Apache 2.0 | HuggingFace |
| microsoft/unixcoder-base | ~126 M | 512 tokens (backbone) | Embeddings de codigo | MIT (según repositorio original) | HuggingFace |
| microsoft/codebert-base | ~125 M | 512 tokens | Embeddings de codigo | MIT | HuggingFace |
| RoBERTa-base | ~125 M | 512 tokens | Embeddings de texto general | MIT | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta la tarea exacta, el dataset de entrenamiento ni las etiquetas de salida; es necesario inspeccionar `config.json` para conocer el número y nombre de clases.
- El dataset de entrenamiento figura como "None dataset", lo que impide evaluar la representatividad y posibles sesgos.
- Los resultados de evaluación son modestos (accuracy 0,6569; F1 0,6143) y el validation loss aumenta a partir de la época 2, lo que indica sobreajuste; el modelo final (época 5) no es el mejor checkpoint en términos de pérdida de validación.
- Riesgo de alucinación no aplicable directamente (no es generativo), pero sí riesgo de clasificaciones erróneas en dominios distintos al de entrenamiento.
- No se declaran idiomas soportados; el comportamiento en textos en castellano no está verificado.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de `microsoft/unixcoder-base` conviene verificar la licencia del modelo base.
- El repositorio ocupa 2,5 GB pese a que los pesos finales rondan los 0,5 GB, probablemente por checkpoints intermedios; conviene descargar solo los archivos necesarios.
- Sin métricas de benchmarks comparativos ni evaluación independiente; no se recomienda su uso en producción sin una validación propia sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/azherali/CodeDetect-UniXCoder-T2
- Modelo base: https://huggingface.co/microsoft/unixcoder-base
- Paper de UniXcoder: https://arxiv.org/abs/2203.03850
- Repositorio de UniXcoder: https://github.com/microsoft/CodeBERT
