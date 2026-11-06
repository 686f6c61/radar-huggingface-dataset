# niels-c/resnet50_simclr_linhead

## Resumen

ResNet-50 SimCLR with an ImageNet-1k linear head es un clasificador de imágenes compuesto por un backbone convolucional ResNet-50 preentrenado de forma autosupervisada con SimCLR sobre ImageNet-1k, al que se le ha añadido una cabeza lineal de 1000 clases entrenada mediante linear probe sobre el backbone congelado. Lo desarrolla Niels Thiemann (usuario niels-c), partiendo de los pesos del repositorio AndrewAtanov/simclr-pytorch, una reimplementación de Chen et al. (2020).

El modelo no está pensado como clasificador de producción, sino como artefacto de investigación para Brain-Score, el benchmark que mide la similitud entre modelos de visión artificial y el sistema visual de primates. La cabeza lineal aporta los logits de las 1000 clases de ImageNet-1k que los benchmarks conductuales de Brain-Score requieren, mientras que el backbone congelado permite extraer activaciones de capas para compararlas con datos neuronales de V1, V2, V4 e IT.

Su relevancia es acotada pero específica: forma parte del proyecto neuro-jepas, que compara arquitecturas de predicción conjunta (JEPA) y otros modelos autosupervisados en su alineación con el cerebro. El repositorio ocupa 0,2 GB y se distribuye en safetensors bajo licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN ResNet-50 (backbone convolucional) con cabeza lineal de clasificación |
| Parámetros totales | no disponible (ResNet-50 estándar: ~25,6 M en backbone; la model card no lo indica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 224 × 224 RGB) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp32/bf16; no se documentan variantes GGUF u otras) |
| Idiomas soportados | no aplica (modelo de visión; etiquetas en inglés correspondientes a las 1000 clases de ImageNet-1k) |
| Licencia | MIT (los pesos del backbone quedan además sujetos a la licencia de su repositorio de origen) |
| Formato de pesos | safetensors (`resnet50_simclr_linhead.safetensors`) |

## Arquitectura y entrenamiento

El backbone es una ResNet-50 convolucional estándar, preentrenada de forma autosupervisada con SimCLR sobre ImageNet-1k según la implementación de AndrewAtanov/simclr-pytorch. SimCLR aprende representaciones mediante augmentaciones y una pérdida de contraste entre vistas de la misma imagen, sin usar etiquetas. Sobre la salida globalmente promediada (global average pooling) de la última etapa, de 2048 dimensiones, se entrena una cabeza lineal para las 1000 clases de ImageNet-1k.

El entrenamiento de la cabeza se realizó con el backbone completamente congelado, incluidas las estadísticas de batch normalization, y solo la cabeza lineal se optimizó con pérdida de entropía cruzada. Se usaron 10 épocas (12.510 pasos), batch size de 1024, precisión mixta bf16 y el trainer del proyecto neuro-jepas. El preprocesado de entrenamiento consistió en random resized crop a 224 × 224 con escala 0,3–1,0, volteo horizontal aleatorio y sin normalización por media/desviación estándar: el backbone SimCLR espera píxeles en el rango [0, 1]. Los datos de la cabeza son el split de entrenamiento de ImageNet-1k (ILSVRC 2012; 1.281.167 imágenes, 1000 clases).

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1k mediante la cabeza lineal.
- Extracción de activaciones de capas intermedias y finales del backbone para análisis de representaciones.
- Comparación con datos neuronales y conductuales del sistema visual de primates (benchmarks de Brain-Score para V1, V2, V4 e IT).
- Evaluación como plugin de Brain-Score (`resnet50_simclr_linhead`) en benchmarks neuronales y conductuales.
- Sirve como línea base autosupervisada frente a arquitecturas JEPA y otros modelos en el proyecto neuro-jepas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente visual de clasificación.

## Casos de uso

- Investigación en neurociencia computacional: se carga como plugin de Brain-Score y se puntúa en benchmarks neuronales (V1, V2, V4, IT) y conductuales para cuantificar su alineación con el cerebro de primates.
- Estudio de representaciones autosupervisadas: se extraen activaciones de capas concretas del backbone congelado para analizar qué información codifica cada etapa frente a un ResNet-50 entrenado de forma supervisada.
- Línea base en comparativas JEPA vs. autosupervisión contrastiva: el proyecto neuro-jepas lo usa como referencia SimCLR frente a arquitecturas de predicción conjunta.
- Clasificación rápida de imágenes dentro del dominio ImageNet-1k en experimentos académicos, aprovechando la cabeza lineal y el preprocesado documentado.
- Reproducción de experimentos: el checkpoint fija una revisión concreta y permite reproducir los resultados del plugin con `brainscore_vision.load_model("resnet50_simclr_linhead")`.
- Comparación con el baseline no entrenado: junto a `resnet50_untrained_linhead` permite aislar cuánto de la similitud con el cerebro aporta el preentrenamiento SimCLR frente a la arquitectura por sí sola.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud en ImageNet-1k ni puntuaciones numéricas de Brain-Score; solo indica que el modelo se puntúa en los benchmarks neuronales (V1, V2, V4, IT) y conductuales de Brain-Score.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 para el modelo completo (ResNet-50 de ~25,6 M de parámetros más cabeza lineal de 1000 × 2048); el repositorio pesa 0,2 GB.
- GPU recomendadas: cualquier GPU moderna sirve; para lotes grandes en investigación conviene una A100 o H100, aunque no es necesario para inferencia individual.
- Cabe holgadamente en GPU de consumo: RTX 4090, RTX 3090, RTX 3060 e incluso GPUs con 4 GB o menos para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch + torchvision (carga directa del safetensors con `load_file`), `huggingface_hub` para la descarga y `brainscore_vision` para la evaluación en Brain-Score. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| niels-c/resnet50_simclr_linhead | ResNet-50 + cabeza lineal (SimCLR) | ~25,6 M (backbone) | 224 × 224 RGB | MIT | Hugging Face |
| niels-c/resnet50_untrained_linhead | ResNet-50 + cabeza lineal (sin preentrenar) | ~25,6 M (backbone) | 224 × 224 RGB | no disponible | Hugging Face (referenciado en la model card) |
| ResNet-50 supervisado (torchvision) | ResNet-50 + cabeza lineal | ~25,6 M | 224 × 224 RGB | BSD-3-Clause (torchvision) | torchvision |
| AndrewAtanov/simclr-pytorch | ResNet-50 SimCLR (sin cabeza de clasificación) | ~25,6 M (backbone) | 224 × 224 RGB | no disponible | GitHub |

La comparación de rendimiento numérico entre estos modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Hereda los sesgos de ImageNet-1k: selección de clases, sesgo geográfico y demográfico de las fotografías y ruido en las etiquetas.
- Solo se entrenó la cabeza lineal; el backbone no se adaptó a la clasificación, por lo que la exactitud es inferior a la de un modelo fine-tuned.
- No debe usarse en producción ni en aplicaciones críticas de seguridad: la cabeza es un linear probe sobre un backbone congelado y no se ajustó para robustez ni calibración.
- Fuera de dominio: imágenes médicas, satelitales o sintéticas, y etiquetas distintas de las 1000 clases de ImageNet-1k.
- No debe usarse para tomar decisiones sobre personas; las clases de ImageNet-1k no están diseñadas para describir personas.
- Normalización de entrada crítica: el backbone SimCLR se entrenó con píxeles en [0, 1] sin normalización por media/desviación estándar. Normalizar con la media y desviación de ImageNet produce características y logits incorrectos.
- Preprocesado distinto entre evaluación y Brain-Score: el probe se evaluó con resize a 256 y center crop de 224, mientras que Brain-Score redimensiona la imagen completa a 224 × 224, lo que cambia la relación de aspecto.
- Licencia: MIT para el conjunto, pero los pesos del backbone quedan sujetos además a la licencia de su repositorio de origen, lo que conviene verificar antes de un uso comercial.
- Al comparar en Brain-Score debe hacerse también contra el baseline no entrenado de la misma arquitectura para aislar el efecto del preentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niels-c/resnet50_simclr_linhead
- Baseline no entrenado: https://huggingface.co/niels-c/resnet50_untrained_linhead
- Repositorio del plugin de Brain-Score: https://github.com/niels-c/neuro-jepas-submissions
- Código de entrenamiento (neuro-jepas): https://github.com/niels-c/neuro-jepas
- Implementación SimCLR de referencia: https://github.com/AndrewAtanov/simclr-pytorch
- Paper SimCLR (Chen et al., 2020): https://arxiv.org/abs/2002.05709
- Brain-Score Vision: https://www.brain-score.org/vision/
- Dataset ImageNet-1k: https://huggingface.co/datasets/ILSVRC/imagenet-1k
