# maskjp/mtdit-spatial-multitask-spatial-nodrop

## Resumen

MTDiT-Spatial es una política de difusión multi-tarea (diffusion transformer) para robótica, desarrollada por Peng Jiang (maskjp) y publicada bajo licencia Apache 2.0. El modelo se entrena sobre 949 episodios reales de 7 tareas de manipulación con un brazo robótico, usando tres cámaras fijas y un encoder CLIP ViT-Base para visión y texto. Su propósito declarado es servir como resultado negativo: a pesar de ajustar bien los datos de entrenamiento (pérdida de validación de 0.0017), el modelo ignora en gran medida las cámaras de escena y predice las articulaciones del brazo a partir de la propiocepción, con una sensibilidad de cámara de brazo de 0.089 frente a un suelo nulo de 0.000 y una referencia de ~1.0.

La relevancia de este modelo radica en que documenta un fallo común en el aprendizaje de políticas condicionadas por visión: el atajo de la propiocepción. Cuando las acciones se expresan como objetivos de articulaciones absolutos (que correlacionan 0.96 con el estado actual), el modelo encuentra una solución degenerada que no utiliza la información visual. El autor publica cinco variantes del mismo barrido para mostrar que la mejor pérdida se correlaciona inversamente con el grounding visual, y que retener la propiocepción parcialmente (dropout 0.15) recupera 2.5–3.5× la sensibilidad de cámara a costa de un ~12% de pérdida. El checkpoint aquí descrito corresponde a la variante `spatial_nodrop` (visión con `spatial_softmax`, dropout de estado 0.00).

El modelo tiene 239.456.043 parámetros según los pesos safetensors (el autor menciona 450M en la model card, pero el peso real es menor). No se especifica longitud de contexto en el sentido de NLP; opera con un horizonte de 32 pasos de acción y 2 pasos de observación. No está pensado para despliegue en producción, sino como referencia para investigación en grounding visual, métricas de sensibilidad y reproducción de resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (MTDiT) con 4 capas, hidden 512, 8 cabezas, RoPE, dropout 0.1 |
| Parametros totales | 239.456.043 (según safetensors; el autor declara 450M en la model card) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (horizonte de 32 pasos de acción, 2 pasos de observación) |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible (modelo de robótica, no NLP) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un diffusion transformer multi-tarea (MTDiT) que utiliza el objetivo DDPM con 100 timesteps de entrenamiento, un horizonte de 32 pasos y 24 pasos ejecutados. La arquitectura consta de 4 capas transformer con 8 cabezas de atención, dimensión oculta 512 y codificación posicional rotatoria (RoPE). Los encoders de visión y texto son `openai/clip-vit-base-patch16`, con una tasa de aprendizaje reducida (×0.1) para la rama visual. Las imágenes de tres cámaras (480×640) se redimensionan a 240×320 y se recortan aleatoriamente a 224×224. La normalización usa MEAN_STD para visual, MIN_MAX para estado y acciones.

El entrenamiento se realizó sobre el dataset `l5vel-peng/base4-multitask-eef-merged-v30`, que contiene 7 tareas, 949 episodios y 1.524.905 frames a 50 Hz, con un split de validación del 5% por tarea. Se usaron 100.000 pasos con batch 64, semilla 1000, optimizador con tasa 3e-4, weight decay 0, sin warmup y decaimiento coseno. El espacio de acción son articulaciones absolutas de 10 dimensiones. El checkpoint de 30K se extendió a 100K reanudando el entrenamiento, lo que re-estiró el schedule coseno y provocó un aumento de pérdida en el paso 35K que se recuperó hacia el 65K; la pérdida ya había alcanzado su suelo en 30K (0.0017) y el cómputo adicional solo la movió 0.0001.

## Capacidades

- Generación de acciones de robot: produce secuencias de 10 dimensiones de articulaciones absolutas para control de un brazo robótico.
- Multi-tarea: entrenado en 7 tareas de manipulación, aunque no se especifica cuáles.
- Condicionamiento por visión: acepta tres flujos de cámara (izquierda, derecha y brazo) y una instrucción de texto, pero en la práctica ignora las cámaras de escena para el movimiento del brazo.
- Condicionamiento por texto: usa el encoder CLIP para procesar instrucciones en lenguaje natural, aunque no se detalla el vocabulario.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido de NLP.
- No tiene modo de pensamiento explícito ni capacidades multimodales fuera de la entrada visual y textual para control robótico.

## Casos de uso

- Reproducción de resultados negativos: sirve como punto de referencia para reproducir el fenómeno de ignorar la visión en políticas de difusión, permitiendo a otros investigadores verificar el atajo de propiocepción.
- Desarrollo de métricas de sensibilidad visual: el script `vision_sensitivity.py` incluido en el repositorio del plugin permite medir cuantitativamente cuánto depende una política de sus cámaras, útil para evaluar otras políticas.
- Baseline para investigación en grounding visual: comparar arquitecturas que sí utilizan la visión (como las variantes con dropout de estado) contra este modelo que no la usa, para estudiar qué cambios estructurales o de entrenamiento fomentan el uso de la información visual.
- Test de métodos de regularización: el modelo puede usarse como caso de estudio para probar técnicas que eviten atajos, como el dropout de propiocepción o la predicción de deltas de acción en lugar de objetivos absolutos.
- Evaluación de métricas offline: dado que no se reporta tasa de éxito en rollout, este modelo puede servir para validar métricas offline (pérdida, error de predicción) y su correlación con el comportamiento real.
- Comparación de variantes de arquitectura: junto con las otras cuatro variantes del barrido (`cls_nodrop`, `patch_tokens`, `spatial_mask`, `cls_mask`), permite estudiar el efecto de la ruta de visión (`spatial_softmax` vs `cls` vs `patch_tokens`) y del dropout de estado en el grounding visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque se trata de un modelo de robótica, no de lenguaje. La model card reporta las siguientes métricas offline:

| Metrica | Valor |
|---|---|
| Validation loss @ 100,000 | 0.0017 |
| Sensibilidad de camara de brazo | 0.089 |
| Sensibilidad de camara de pinza | 0.693 |
| Error de prediccion de brazo (held-out) | 0.092 |
| Test nulo (propias camaras) | 0.000 |

La sensibilidad de cámara se calcula manteniendo fijo el estado propioceptivo, intercambiando los tres flujos de cámara por frames de un episodio held-out diferente y midiendo el cambio medio en las articulaciones predichas. Una política que sigue la escena puntúa ~1.0; una que la ignora puntúa ~0. El test nulo (alimentar al modelo con sus propias cámaras) da 0.000, lo que confirma que el valor de 0.089 es señal, no ruido. Para referencia, bajo el mismo evaluador, `multi_task_dit` en LIBERO puntúa 0.92–1.10 y π₀.₅ en LIBERO 1.19–1.31.

## Requisitos de hardware

No se proporcionan requisitos específicos de hardware en la información disponible. El modelo tiene ~239M parámetros y usa un encoder CLIP ViT-Base, por lo que es probable que quepa en GPUs de consumo con al menos 8 GB de VRAM en precisión FP32, pero no hay datos confirmados. Las opciones de despliegue se limitan a la librería LeRobot, que requiere el plugin `mtdit_spatial` del repositorio `maskjp/lerobot_policy_mtdit_spatial`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

La comparación más directa es con las otras cuatro variantes del mismo barrido, publicadas por el mismo autor. La tabla siguiente resume las diferencias clave:

| Variante | Ruta de vision | State dropout | Val loss | Sensibilidad brazo | Sensibilidad pinza |
|---|---|---|---|---|---|
| `cls_nodrop` | `cls` | 0.00 | 0.0017 | 0.077 | 0.706 |
| `spatial_nodrop` (este) | `spatial_softmax` | 0.00 | 0.0017 | 0.089 | 0.693 |
| `patch_tokens` | `patch_tokens` | 0.00 | 0.0018* | * | * |
| `spatial_mask` | `spatial_softmax` | 0.15 | 0.0019 | 0.272 | 0.930 |
| `cls_mask` | `cls` | 0.15 | 0.0020 | 0.198 | 0.922 |

*`patch_tokens` es ~1.8× más lento por paso y aún estaba entrenando en el momento de la publicación; su pérdida de 0.0018 es en el paso 75K y sigue a `cls_nodrop` dentro de 0.0001 en cada checkpoint compartido.

No se dispone de comparaciones con otros modelos de políticas de difusión fuera de este barrido en la información proporcionada.

## Limitaciones y advertencias

- El modelo ignora las cámaras de escena para el movimiento del brazo; las cámaras izquierda y derecha contribuyen menos que la del brazo.
- Está entrenado con objetivos de articulaciones absolutos, que correlacionan 0.96 con el estado actual, lo que facilita el atajo de propiocepción. Los datasets con deltas por paso (como LIBERO, con correlación −0.14) no muestran este problema.
- Es un resultado negativo: no debe desplegarse como política condicionada por visión en producción.
- Solo se ha entrenado con un único robot, una única embodiment y tres poses de cámara fijas; no hay evidencia de generalización a otros entornos.
- No se reporta tasa de éxito en rollout; solo métricas offline (pérdida, error de predicción, sensibilidad).
- El checkpoint de 30K se extendió a 100K reanudando el entrenamiento, lo que provocó un re-estiramiento del schedule coseno y un aumento temporal de pérdida en el paso 35K.
- La discrepancia entre los 239M parámetros reales y los 450M declarados en la model card puede indicar que el autor se refiere a una arquitectura más amplia o a un error de documentación; se recomienda verificar antes de usar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maskjp/mtdit-spatial-multitask-spatial-nodrop
- Repositorio del plugin y script de sensibilidad: https://github.com/maskjp/lerobot_policy_mtdit_spatial
- Perfil del autor en HuggingFace: https://huggingface.co/maskjp
- Perfil del autor en GitHub: https://github.com/maskjp
