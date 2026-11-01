# niels-c/resnet50_untrained_linhead

## Resumen

`niels-c/resnet50_untrained_linhead` es un modelo de visión artificial publicado en HuggingFace por Niels Thiemann (usuario `niels-c`) que consiste en una ResNet-50 con inicialización aleatoria (nunca entrenada) sobre la que se ha entrenado únicamente una cabeza lineal de clasificación para ImageNet-1k. No es un modelo destinado a uso productivo: es un *baseline* experimental diseñado para medir cuánto de una puntuación de Brain-Score puede explicarse por la arquitectura sola, sin aprendizaje de representaciones.

El modelo forma parte del proyecto neuro-jepas, que compara arquitecturas de tipo joint-embedding predictive (JEPA) y otros modelos auto-supervisados en su similitud con el sistema visual de primates. La ResNet-50 sin entrenar actúa como referencia inferior: si un modelo auto-supervisado no supera a esta arquitectura con pesos aleatorios en las métricas neuronales y de comportamiento de Brain-Score, su ventaja no puede atribuirse al aprendizaje.

Técnicamente es una CNN ResNet-50 estándar (23,5 M de parámetros en el backbone) con una cabeza lineal de 2,05 M de parámetros, sumando 25.557.032 parámetros totales. El checkpoint ocupa 103 MB en safetensors float32 y su precisión top-1 en ImageNet-1k es de solo 2,9 %, lo que confirma que la cabeza lineal sobre características aleatorias apenas extrae señal útil para clasificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (CNN con conexiones residuales), backbone congelado con inicialización aleatoria de `timm` (seed 0) más cabeza lineal |
| Parametros totales | 25.557.032 (backbone 23.508.032 + cabeza 2.049.000) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224 × 224 RGB) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de visión; etiquetas en inglés de ImageNet-1k) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32), 103 MB |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-50 convencional de torchvision, con cuatro etapas de bloques residuales y *global average pooling* al final de la última etapa, que produce un vector de 2048 dimensiones. Sobre ese vector se aplica una capa lineal de 2048 → 1000 clases. El backbone conserva la inicialización por defecto de `timm` con semilla 0 y nunca se actualizó: tampoco se recalcularon las estadísticas de batch normalization, que quedan congeladas en su estado inicial.

El único componente entrenado es la cabeza lineal, ajustada sobre el split de entrenamiento de ImageNet-1k (ILSVRC 2012, 1.281.167 imágenes, 1000 clases) con pérdida de entropía cruzada sin label smoothing. El entrenamiento usó precisión mixta bf16, 10 épocas (12.510 pasos), batch size 1024, optimizador AdamW (betas 0.9/0.999, weight decay 0), learning rate pico de 1e-3 tras un warmup lineal de una época y decaimiento coseno hasta 1e-6. El preprocesado de entrenamiento aplica random resized crop a 224 × 224 (escala 0.3–1.0), flip horizontal aleatorio y normalización con media (0.485, 0.456, 0.406) y desviación (0.229, 0.224, 0.225).

La innovación aquí no es arquitectónica sino metodológica: el modelo sirve como control para aislar el efecto de la arquitectura frente al del aprendizaje en comparaciones con datos neurales. Al evaluar las activaciones de sus capas contra registros de V1, V2, V4 e IT, se obtiene una cota inferior de rendimiento atribuible únicamente a la topología de la red.

## Capacidades

- Extracción de activaciones de capas intermedias de una ResNet-50 para análisis de representaciones (neurociencia computacional).
- Clasificación en 1000 clases de ImageNet-1k, con precisión top-1 de 2,9 % (funcional solo como referencia, no como clasificador).
- Evaluación en Brain-Score como plugin `resnet50_untrained_linhead`, con benchmarks neuronales (V1, V2, V4, IT) y de comportamiento.
- Entrada de imágenes RGB de 224 × 224 píxeles con normalización ImageNet.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni capacidades multilingües.
- No dispone de modo *thinking* ni de ninguna capacidad generativa.

## Casos de uso

- Baseline en estudios de Brain-Score: se carga como plugin `resnet50_untrained_linhead` y se compara su puntuación neuronal y de comportamiento con la de modelos auto-supervisados de la misma arquitectura para determinar cuánto de la similitud con el cerebro se debe a la arquitectura y no al entrenamiento.
- Control en experimentos de representaciones: se extraen activaciones de capas concretas y se correlacionan con respuestas neuronales de V1, V2, V4 e IT, usando los pesos aleatorios como referencia inferior frente a modelos preentrenados.
- Validación de pipelines de análisis neuronal: al ser un modelo pequeño (103 MB) y de inferencia determinista, sirve para depurar el código de extracción de características y de alineamiento con datos neurales antes de pasar a modelos más costosos.
- Reproducibilidad de resultados: al fijar la semilla 0 y publicar el checkpoint exacto, permite reproducir las cifras del proyecto neuro-jepas y verificar que las diferencias con otros modelos no provienen de variaciones de inicialización.
- Docencia y divulgación: ilustra de forma tangible la diferencia entre una CNN con pesos aleatorios y una entrenada, mostrando que una cabeza lineal sobre características aleatorias apenas alcanza el 2,9 % top-1 en ImageNet-1k.
- Pruebas de infraestructura de inferencia: su reducido tamaño y su naturaleza de CNN permiten validar despliegues con torchvision, ONNX o TensorRT sin necesidad de GPUs de gran capacidad.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| ImageNet-1k top-1 (validación, 50.000 imágenes) | 2,9 % | Cabeza lineal sobre backbone aleatorio congelado |
| Brain-Score neural (V1, V2, V4, IT) | no disponible en la información proporcionada | Se evalúa mediante el plugin `resnet50_untrained_linhead` |
| Brain-Score behavioral | no disponible en la información proporcionada | Igual que el anterior |

No se han publicado en la información disponible resultados numéricos de Brain-Score ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5–1 GB en float32 para lotes pequeños; menos de 500 MB en fp16 o int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en GTX 1650, RTX 3050, RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Cabe holgadamente en GPU de consumo e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch/torchvision (vía `load_file` de safetensors), exportación a ONNX, TensorRT u OpenVINO; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera del orden de milisegundos por imagen en GPU moderna, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `niels-c/resnet50_untrained_linhead` | 25,56 M | 224 × 224 RGB | 2,9 % top-1 en ImageNet-1k | MIT | HuggingFace |
| ResNet-50 preentrenada en ImageNet-1k (torchvision) | 25,56 M | 224 × 224 RGB | ~76 % top-1 (referencia estándar de la arquitectura, no medida en esta ficha) | BSD-3-Clause (torchvision) | torchvision |
| Otros modelos del proyecto neuro-jepas (JEPA y auto-supervisados) | no disponible | no disponible | no disponible | no disponible | GitHub `neuro-jepas-submissions` |

La comparación relevante es con la ResNet-50 preentrenada de la misma arquitectura: el modelo aquí descrito existe precisamente para cuantificar la brecha entre pesos aleatorios y pesos entrenados en las métricas de Brain-Score.

## Limitaciones y advertencias

- No es un clasificador utilizable: 2,9 % top-1 en ImageNet-1k lo invalida para cualquier tarea de clasificación real.
- Hereda los sesgos de ImageNet-1k: selección de clases, desequilibrio geográfico y demográfico de las fotos y ruido en las etiquetas.
- Solo se entrenó la cabeza lineal; las características del backbone no están adaptadas a la clasificación, por lo que la precisión es muy inferior a la de un modelo ajustado.
- Espera imágenes de 224 × 224 RGB; la evaluación del probe usó resize a 256 y center crop a 224, mientras que Brain-Score redimensiona la imagen completa a 224 × 224, alterando la relación de aspecto.
- Los pesos corresponden a una única inicialización aleatoria (semilla 0); otras semillas darían resultados ligeramente distintos.
- No debe usarse en producción ni en sistemas de seguridad crítica, ni con imágenes fuera de la distribución de ImageNet-1k (médicas, satelitales, sintéticas) ni con etiquetas fuera de las 1000 clases.
- No debe emplearse para tomar decisiones sobre personas: las clases de ImageNet-1k no están diseñadas para describirlas.
- La licencia MIT permite uso comercial, pero el modelo carece de valor comercial como clasificador; su utilidad es exclusivamente como baseline de investigación.

## Enlaces

- HuggingFace: https://huggingface.co/niels-c/resnet50_untrained_linhead
- Repositorio del plugin Brain-Score: https://github.com/niels-c/neuro-jepas-submissions
- Código de entrenamiento: https://github.com/niels-c/neuro-jepas
- Plugin específico: https://github.com/niels-c/neuro-jepas-submissions/tree/main/models/resnet50_untrained_linhead
- Brain-Score Vision: https://www.brain-score.org/vision/
- Dataset ImageNet-1k: https://huggingface.co/datasets/ILSVRC/imagenet-1k
