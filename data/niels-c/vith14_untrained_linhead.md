# niels-c/vith14_untrained_linhead

## Resumen

`niels-c/vith14_untrained_linhead` es un clasificador de imágenes construido sobre un backbone Vision Transformer ViT-H/14 (arquitectura de `facebook/ijepa_vith14_1k`) que **nunca fue entrenado**: conserva la inicialización aleatoria por defecto de `transformers` con semilla 0. Sobre esa representación aleatoria se entrena únicamente una cabeza lineal de 1000 clases sobre el promedio de los 256 tokens de parche finales (1280 dimensiones), con el backbone completamente congelado, usando el split de entrenamiento de ImageNet-1k.

El modelo lo desarrolla y publica Niels Thiemann (usuario `niels-c`) en el contexto del proyecto neuro-jepas, cuyo objetivo es comparar arquitecturas de tipo JEPA y otros modelos auto-supervisados por su similitud con el sistema visual de primates. La relevancia de esta ficha no está en su utilidad como clasificador, sino en su papel metodológico: es la **línea base no entrenada** que permite cuantificar cuánto de una puntuación de Brain-Score se explica solo por la arquitectura, sin aprendizaje.

Con 632 M parámetros, 32 bloques transformer, parches de 14×14 sobre entradas de 224×224 y un checkpoint de 2,5 GB en safetensors, el modelo alcanza un 5,5 % de top-1 en ImageNet-1k, lo que confirma que es una referencia de control y no un modelo desplegable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-H/14), encoder I-JEPA de `facebook/ijepa_vith14_1k`; 32 capas, hidden size 1280, intermediate size 5120, 16 cabezas de atención, patch size 14 |
| Parametros totales | 632 M (backbone ViT-H/14) más la cabeza lineal de 1280×1000 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada de 224×224 píxeles RGB, 256 tokens de parche) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors sin cuantizar) |
| Idiomas soportados | No disponible (modelo de visión, sin capacidades de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (`vith14_untrained_linhead.safetensors`), compatible con `transformers>=5.19.0` |

## Arquitectura y entrenamiento

El backbone es un transformer de visión estándar con 32 bloques, dimensión oculta 1280 y parches de 14×14, correspondiente a la configuración de `IJepaConfig` de `facebook/ijepa_vith14_1k`. La innovación metodológica es que **el backbone no se entrena en ningún momento**: mantiene la inicialización aleatoria por defecto de `transformers` con semilla 0. Solo se entrena una capa lineal (`nn.Linear(1280, 1000)`) aplicada al promedio de los 256 tokens de parche finales, con el backbone congelado, incluidas las estadísticas de normalización por lotes.

El entrenamiento de la cabeza se realiza sobre el split de entrenamiento de ImageNet-1k (ILSVRC 2012; 1.281.167 imágenes, 1000 clases) con pérdida de entropía cruzada. No hay pretraining auto-supervisado, ni RLHF, ni DPO, ni ajuste fino del backbone. Para Brain-Score, el modelo expone además la salida de cada bloque transformer como una rejilla de 1280×16×16, de modo que las activaciones de tokens pueden tratarse como un mapa de características convolucional y compararse con respuestas neuronales de V1, V2, V4 e IT.

## Capacidades

- Extracción de activaciones de capas intermedias y finales como línea base no entrenada para comparación con datos neuronales y conductuales del sistema visual de primates.
- Clasificación en 1000 clases de ImageNet-1k mediante la cabeza lineal, con una precisión de top-1 del 5,5 % (muy por debajo de un modelo entrenado; no es un clasificador utilizable).
- Exposición de la salida de cada bloque como rejilla 1280×16×16 para su uso en benchmarks de Brain-Score (V1, V2, V4, IT) y en benchmarks conductuales.
- Integración como plugin `vith14_untrained_linhead` en `brainscore_vision`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni modo thinking; es exclusivamente un modelo de visión.
- Sin capacidades multilingües: no procesa lenguaje.

## Casos de uso

- **Línea base de control en neurociencia computacional**: extraer las activaciones de cada capa del backbone no entrenado y compararlas con las de modelos auto-supervisados de la misma arquitectura (I-JEPA, DINOv2, etc.) para aislar cuánto de la puntuación de Brain-Score proviene de la arquitectura y cuánto del aprendizaje. Es el uso principal declarado por el autor.
- **Ablación arquitectónica en estudios de representación visual**: usar el modelo como referencia en experimentos que varían la inicialización, la profundidad o el tamaño de parche, manteniendo fija la cabeza lineal, para medir el efecto de la arquitectura sobre la similitud con la corteza visual.
- **Validación de pipelines de Brain-Score**: el plugin `vith14_untrained_linhead` sirve para comprobar que un pipeline de evaluación neural y conductual funciona correctamente antes de ejecutar modelos costosos de entrenar.
- **Reproducibilidad de inicializaciones aleatorias**: al fijar la semilla 0, permite reproducir exactamente la misma inicialización en distintos entornos y comparar el efecto de otras semillas sobre los resultados de Brain-Score.
- **Docencia y divulgación sobre ViT**: ilustra de forma práctica la diferencia entre un backbone preentrenado y uno aleatorio con una sonda lineal, útil en cursos de visión por computador.
- **Investigación sobre sondas lineales**: sirve como caso extremo para estudiar qué información contiene una representación aleatoria de alta dimensión y cuánto puede extraerse con un probe lineal congelado.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| ImageNet-1k top-1 | 5,5 % | Cabeza lineal sobre backbone congelado y no entrenado |
| Brain-Score (V1, V2, V4, IT) | No disponible en la información proporcionada | Se evalúa como plugin `vith14_untrained_linhead` |
| Brain-Score (benchmarks conductuales) | No disponible en la información proporcionada | Se evalúa como plugin `vith14_untrained_linhead` |

No se han publicado resultados numéricos de Brain-Score en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el checkpoint pesa 2,5 GB en safetensors; en fp32 ocupa aproximadamente 2,5 GB de memoria, más activaciones. Con 632 M parámetros, una GPU con 8-12 GB es suficiente para inferencia en fp32 a 224×224.
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM (RTX 3070/4060 Ti o superiores, A10, L4). Para evaluación de Brain-Score a gran escala, se recomienda A100 o H100 por throughput.
- **Consumer GPU**: sí, cabe en GPUs de consumo con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4070). En CPU es posible pero lento y requiere varios GB de memoria, tal como advierte el autor.
- **Opciones de despliegue**: `transformers>=5.19.0` con `torch`, `torchvision`, `huggingface_hub` y `safetensors`; integración con `brainscore_vision` mediante el plugin del repositorio `neuro-jepas-submissions`. No se documentan soportes para vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- **Latencia y throughput**: no disponibles en la información proporcionada. El autor indica que la inferencia en CPU es lenta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `niels-c/vith14_untrained_linhead` | 632 M | 224×224 RGB | 5,5 % top-1 en ImageNet-1k | MIT | HuggingFace, plugin Brain-Score |
| `facebook/ijepa_vith14_1k` | ~632 M | 224×224 RGB | No disponible en la información proporcionada | No disponible en la información proporcionada | HuggingFace |
| Modelos auto-supervisados de la misma arquitectura evaluados en neuro-jepas | ~632 M | 224×224 RGB | No disponible en la información proporcionada | No disponible en la información proporcionada | Repositorio `neuro-jepas-submissions` |

La comparación relevante es con los modelos preentrenados de la misma arquitectura ViT-H/14 (I-JEPA y otros auto-supervisados) que se evalúan en el mismo pipeline de Brain-Score; el modelo de esta ficha es la referencia inferior de esa comparación.

## Limitaciones y advertencias

- **No es un clasificador utilizable**: 5,5 % de top-1 en ImageNet-1k; el autor lo declara explícitamente fuera de alcance para cualquier tarea de clasificación en producción.
- **Sesgos heredados de ImageNet-1k**: selección de clases, sesgo geográfico y demográfico de las fotos y ruido en las etiquetas.
- **Backbone no adaptado**: solo se entrena la cabeza lineal; las características no están ajustadas a la clasificación, por lo que la precisión es inferior a la de un modelo afinado.
- **Preprocesado sensible**: espera 224×224 RGB; la sonda se evaluó con resize a 256 y center crop de 224, mientras que Brain-Score redimensiona la imagen completa a 224×224, lo que cambia la relación de aspecto y puede alterar los resultados.
- **Coste en CPU**: 632 M parámetros y 2,5 GB de checkpoint hacen la inferencia en CPU lenta y con varios GB de memoria, como ocurre en Brain-Score.
- **Una sola semilla**: los pesos corresponden a una única inicialización aleatoria (semilla 0); otras inicializaciones darían resultados algo distintos.
- **Fuera de alcance**: imágenes alejadas de la distribución de ImageNet-1k (médicas, satelitales, sintéticas), etiquetas fuera de las 1000 clases y cualquier decisión sobre personas.
- **Licencia MIT**: permite uso comercial, pero el modelo no tiene utilidad comercial como clasificador; debe usarse solo como referencia metodológica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/niels-c/vith14_untrained_linhead
- Repositorio del plugin de Brain-Score: https://github.com/niels-c/neuro-jepas-submissions
- Plugin concreto: https://github.com/niels-c/neuro-jepas-submissions/tree/main/models/vith14_untrained_linhead
- Código de entrenamiento neuro-jepas: https://github.com/niels-c/neuro-jepas
- Brain-Score Vision: https://www.brain-score.org/vision/
- Modelo de referencia de la arquitectura: https://huggingface.co/facebook/ijepa_vith14_1k
- Dataset ImageNet-1k: https://huggingface.co/datasets/ILSVRC/imagenet-1k
