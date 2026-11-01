# niels-c/resnet50_barlowtwins_linhead

## Resumen

ResNet-50 Barlow Twins con cabeza lineal para ImageNet-1k es un clasificador de imágenes construido a partir de un backbone convolucional ResNet-50 preentrenado de forma auto-supervisada con el método Barlow Twins sobre ImageNet-1k. El backbone procede de los pesos publicados por Meta AI en el repositorio `facebookresearch/barlowtwins` (Zbontar et al., 2021) y se mantiene congelado; sobre la salida globalmente promediada de la última etapa (2048 dimensiones) se entrena una cabeza lineal de 1000 clases mediante un linear probe. El empaquetado y el entrenamiento de la cabeza los realiza Niels Thiemann (`niels-c`).

El modelo no busca competir en precisión de clasificación generalista, sino servir como artefacto reproducible para neurociencia computacional. Se distribuye como plugin del benchmark Brain-Score, donde se evalúa frente a datos neuronales (V1, V2, V4, IT) y conductuales del sistema visual de primates. Forma parte del proyecto neuro-jepas, que compara arquitecturas de tipo JEPA y otros modelos auto-supervisados por su similitud con el cerebro.

Su relevancia es, por tanto, metodológica: proporciona un punto de referencia congelado y una cabeza lineal calibrada para el protocolo de Brain-Score, junto con un baseline no entrenado de la misma arquitectura (`resnet50_untrained_linhead`) para aislar el efecto del preentrenamiento. El repositorio ocupa 0,1 GB y se distribuye en safetensors bajo licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN ResNet-50 (backbone congelado) + cabeza lineal sobre pooling global (2048 → 1000) |
| Parámetros totales | no disponible (ResNet-50 estándar: ~25,6 M de parámetros, no confirmado en la model card) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224 × 224 RGB) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp32/bf16; no se documentan variantes GGUF u otras) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; etiquetas en inglés de ImageNet-1k) |
| Licencia | MIT (los pesos del backbone quedan además sujetos a la licencia de su repositorio de origen) |
| Formato de pesos | safetensors (`resnet50_barlowtwins_linhead.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-50 convolucional estándar, compatible con `torchvision.models.resnet50`, cuyo state dict se carga directamente desde el fichero safetensors. El backbone fue entrenado de forma auto-supervisada con Barlow Twins sobre ImageNet-1k: el objetivo reduce la redundancia entre las representaciones de dos vistas aumentadas de la misma imagen, empujando la matriz de correlación cruzada hacia la identidad. Los pesos del backbone, incluidas las estadísticas de batch normalization, se congelaron durante todo el entrenamiento de la cabeza.

Solo se entrena la cabeza lineal (2048 → 1000) con pérdida de entropía cruzada sin label smoothing. El entrenamiento usa el split de entrenamiento de ImageNet-1k (ILSVRC 2012; 1.281.167 imágenes, 1000 clases) del dataset `ILSVRC/imagenet-1k`, con precisión mixta bf16, 10 épocas (12.510 pasos), batch size 1024, optimizador AdamW (betas 0,9 y 0,999, weight decay 0), learning rate pico de 1e-3 tras un warmup lineal de una época con decaimiento coseno hasta 1e-6, y semilla 0. El aumento de datos consiste en random resized crop a 224 × 224 (escala 0,3 a 1,0) y flip horizontal aleatorio, con normalización ImageNet (media 0,485/0,456/0,406; desviación 0,229/0,224/0,225). No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa, por tratarse de un clasificador.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1k, devolviendo logits de dimensión 1000.
- Extracción de activaciones de capas intermedias para comparación con datos neuronales del sistema visual de primates (V1, V2, V4, IT).
- Evaluación en el benchmark Brain-Score como plugin `resnet50_barlowtwins_linhead`, con puntuaciones en benchmarks neuronales y conductuales.
- Sirve como representación visual congelada para tareas de linear probing y comparación de arquitecturas auto-supervisadas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual y discriminativo.
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Investigación en neurociencia computacional: puntuar el modelo en Brain-Score para medir su alineamiento con respuestas neuronales de V1, V2, V4 e IT, usando el plugin oficial que fija la revisión del checkpoint.
- Comparación de arquitecturas auto-supervisadas: emplear el modelo junto a `resnet50_untrained_linhead` como par controlado para aislar el efecto del preentrenamiento Barlow Twins en las métricas cerebrales.
- Linear probing sobre dominios específicos: congelar el backbone y entrenar una nueva cabeza lineal sobre las features de 2048 dimensiones para tareas de clasificación con pocos datos.
- Extracción de embeddings visuales: usar las activaciones del pooling global como descriptores de imagen para recuperación, clustering o análisis de representaciones.
- Reproducibilidad de experimentos: cargar el state dict en `torchvision.models.resnet50` para replicar exactamente los resultados del autor con el preprocesado documentado (resize 256, center crop 224).
- Docencia y divulgación: ejemplo autocontenido de cómo empaquetar un backbone auto-supervisado con una sonda lineal y publicarlo con pesos en safetensors y licencia permisiva.
- Baseline en pipelines de visión: referencia rápida de clasificación ImageNet-1k cuando se necesita un modelo pequeño (0,1 GB) y de licencia MIT, aceptando menor precisión que un modelo fine-tuned.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de accuracy top-1/top-5 en ImageNet-1k ni puntuaciones numéricas de Brain-Score; únicamente indica que la precisión es inferior a la de un modelo fine-tuned porque solo se entrena la cabeza lineal sobre un backbone congelado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para un ResNet-50 estándar (≈25,6 M de parámetros, no confirmado en la model card); el repositorio completo pesa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problemas en RTX 3060, RTX 4090, A100 y H100. También es viable en CPU para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: PyTorch + torchvision (vía `torchvision.models.resnet50` y `safetensors.torch.load_file`), exportación a TorchScript u ONNX no documentada pero plausible; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imágenes.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Preentrenamiento | Cabeza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| niels-c/resnet50_barlowtwins_linhead | ResNet-50 | Barlow Twins (auto-supervisado, ImageNet-1k) | Lineal congelada | MIT | HuggingFace, 0 descargas, 0 likes |
| niels-c/resnet50_untrained_linhead | ResNet-50 | Sin preentrenar | Lineal | no disponible | HuggingFace (baseline del autor) |
| ResNet-50 supervisado (torchvision) | ResNet-50 | Supervisado (ImageNet-1k) | Fully connected fine-tuned | BSD-3-Clause | torchvision |
| Backbone Barlow Twins original (facebookresearch) | ResNet-50 | Barlow Twins (auto-supervisado, ImageNet-1k) | Sin cabeza de clasificación | según repositorio de origen | GitHub |

La comparación directa de precisión no puede realizarse con los datos disponibles: la model card no publica accuracy ni puntuaciones de Brain-Score para este checkpoint ni para los alternativos.

## Limitaciones y advertencias

- El modelo hereda los sesgos de ImageNet-1k: selección de clases, sesgo geográfico y demográfico de las fotografías y ruido en las etiquetas.
- Solo se entrena la cabeza lineal; el backbone no se adapta a la clasificación, por lo que la precisión es inferior a la de un modelo fine-tuned.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas o mal calibradas fuera de la distribución de ImageNet-1k.
- Uso fuera de alcance: clasificación en producción o en sistemas críticos de seguridad, imágenes médicas, satelitales o sintéticas, etiquetas fuera de las 1000 clases de ImageNet-1k y cualquier decisión sobre personas (las clases de ImageNet-1k no están diseñadas para describir personas).
- Discrepancia de preprocesado: la sonda se evaluó con resize a 256 y center crop a 224, mientras que Brain-Score redimensiona la imagen completa a 224 × 224, alterando la relación de aspecto; esto puede afectar a la comparabilidad de resultados.
- La licencia MIT del checkpoint no exime de las condiciones de la licencia de los pesos del backbone original; conviene revisar el repositorio `facebookresearch/barlowtwins` antes de un uso comercial.
- El repositorio no registra descargas ni likes, lo que sugiere escasa validación externa; conviene contrastar con el baseline no entrenado antes de extraer conclusiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/niels-c/resnet50_barlowtwins_linhead
- Baseline no entrenado: https://huggingface.co/niels-c/resnet50_untrained_linhead
- Paper Barlow Twins: https://arxiv.org/abs/2103.03230
- Repositorio original de Barlow Twins: https://github.com/facebookresearch/barlowtwins
- Plugin Brain-Score (submissions): https://github.com/niels-c/neuro-jepas-submissions
- Código de entrenamiento (neuro-jepas): https://github.com/niels-c/neuro-jepas
- Brain-Score Vision: https://www.brain-score.org/vision/
- Dataset ImageNet-1k: https://huggingface.co/datasets/ILSVRC/imagenet-1k
- Perfil del autor: https://huggingface.co/niels-c
