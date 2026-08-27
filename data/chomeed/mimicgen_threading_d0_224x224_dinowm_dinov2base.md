# chomeed/mimicgen_threading_d0_224x224_dinowm_dinov2base

## Resumen

El modelo `chomeed/mimicgen_threading_d0_224x224_dinowm_dinov2base` es un world model (modelo de dinámica) para robótica, desarrollado por el usuario chomeed, que predice la evolución de características visuales extraídas con un encoder DINOv2 congelado. Forma parte de una serie de experimentos que comparan diferentes encoders (small, base, large) para la tarea de enroscado (threading) del benchmark MimicGen. Este repositorio documenta un **resultado negativo**: al cambiar el encoder de dinov2-small a dinov2-base, el rendimiento empeora un 6,9 % en la métrica normalizada, a pesar de duplicar los parámetros del predictor. El objetivo del autor es evitar que otros investigadores repitan el mismo experimento y ahorrar tiempo de GPU.

El modelo está diseñado para ser usado con el predictor `DinoDynamics` y el encoder `facebook/dinov2-base` (ViT-B/14, 768 dimensiones, 86,6 M de parámetros). El predictor tiene 33,4 M de parámetros y se entrena sobre ventanas de 2 imágenes históricas con un horizonte de 8 pasos. No es un modelo de lenguaje ni de visión general, sino un componente de investigación para sistemas de control basados en modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (predictor) + encoder DINOv2-base congelado |
| Parametros totales | 120 M (86,6 M encoder + 33,4 M predictor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventanas de 2+8 pasos temporales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión/robótica) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente PyTorch .pt, no confirmado) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DINO-WM: un encoder DINOv2 congelado extrae características de cada frame, y un predictor transformer (depth 6, heads 6, mlp-dim 2048, d=768) predice las características futuras a partir de un historial de 2 frames y una acción de 7 dimensiones. El estado del robot se representa con 9 dimensiones. El predictor se entrena con 60 000 pasos, batch size 32, learning rate 5e-4 para el predictor y 3e-4 para el decoder, sobre una mezcla de tres datasets de MimicGen (éxitos y fallos) que suman 251 811 ventanas de entrenamiento y 15 889 de validación. No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado de regresión sobre características.

La innovación principal es el estudio sistemático del efecto del tamaño del encoder en un world model. El autor descarta tres hipótesis (sobreajuste, dificultad de predicción de características, y falta de escalado del learning rate) y concluye que un predictor más grande sobre características de mayor dimensión ajusta peor los datos de entrenamiento, un fenómeno sin mecanismo claro.

## Capacidades

- Predicción de características visuales futuras (world model) para control robótico.
- Soporte de entrada multimodal: imágenes (2 vistas) y acciones continuas (7 dimensiones).
- Generación de representaciones latentes para planificación de movimiento.
- No es un modelo generativo de texto ni de imágenes; no soporta tool calling ni agentes conversacionales.
- Capacidades multilingües: no aplica.
- No tiene modo de pensamiento (thinking mode) ni capacidades de audio.

## Casos de uso

- **Investigación en world models para robótica**: sirve como punto de comparación para estudiar cómo el tamaño del encoder afecta a la predicción de dinámica. El autor lo publica explícitamente como resultado negativo para evitar duplicar experimentos.
- **Evaluación de encoders visuales**: permite medir la "predecibilidad" de las características de DINOv2-base frente a otras variantes (small, large) en una tarea de manipulación.
- **Desarrollo de controladores basados en modelos (MPC)**: aunque el modelo es peor que la versión small, podría usarse como componente en un pipeline de planificación si se acepta la pérdida de precisión.
- **Análisis de escalado en aprendizaje profundo**: el fenómeno de "underfitting" con más parámetros es un caso de estudio para la comunidad de scaling laws.
- **Reproducibilidad de experimentos**: al estar disponible el checkpoint y el código de evaluación, otros investigadores pueden verificar los resultados y explorar variantes (por ejemplo, ajustar el learning rate por ancho).
- **Benchmark de dinámica en robótica**: puede integrarse en suites de evaluación de modelos de mundo para la tarea threading de MimicGen.

## Benchmarks y rendimiento

La model card proporciona una comparación normalizada (ratio `val_mse / copy_mse`) entre encoders. No se han publicado resultados en benchmarks estándar como MMLU o HumanEval, ya que no es un modelo de lenguaje.

| Encoder | Predictor | Mejor ratio | Paso | Ratio final |
|---|---|---|---|---|
| dinov2-small (receta base) | 13,2 M | 0,318 | 54k | 0,335 |
| **dinov2-base (este modelo)** | 33,4 M | 0,340 | 60k | 0,340 |
| dinov2-large (parado pronto) | 50,9 M | 0,446 | 4k | — |

El modelo base es un 6,9 % peor que el small en el ratio final. Además, el autor reporta que el modelo base converge más rápido al principio pero satura peor, con un cruce alrededor del paso 3000.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero el modelo completo (encoder + predictor) ocupa aproximadamente 0,1 GB en el repositorio (pesos del predictor). El encoder DINOv2-base requiere unos 330 MB en FP32, por lo que la inferencia cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna (RTX 3060 o superior) es suficiente para inferencia; el entrenamiento de 60k pasos con batch 32 requeriría una GPU con al menos 12 GB (p. ej., RTX 3080/4090 o A100).
- Es desplegable en hardware de consumo (tarjetas de gama media) para inferencia.
- Opciones de despliegue: el código de ejemplo usa PyTorch y `transformers`; no se mencionan vLLM, llama.cpp ni Ollama (no es un LLM). Se puede integrar en pipelines de robótica con ROS o similares.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Encoder | Predictor | Ratio final | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chomeed/mimicgen_threading_d0_224x224_dinowm` | dinov2-small | 13,2 M | 0,335 | no disponible | HuggingFace |
| **`chomeed/mimicgen_threading_d0_224x224_dinowm_dinov2base`** | dinov2-base | 33,4 M | 0,340 | no disponible | HuggingFace |
| `chomeed/mimicgen_threading_d0_224x224_dinowm` (variante large, no publicada) | dinov2-large | 50,9 M | 0,446 (parado) | no disponible | no publicada |

La comparativa se limita a las variantes del mismo autor. No se dispone de otros world models comparables en la información proporcionada.

## Limitaciones y advertencias

- **Resultado negativo**: el modelo es deliberadamente peor que la versión con encoder small; no debe usarse como referencia de rendimiento.
- **Una sola semilla**: el autor advierte que la diferencia del 6,9 % está fuera del ruido de semilla (~1 %), pero el valor exacto podría variar con una re-ejecución.
- **Entrenamiento incompleto**: el modelo seguía descendiendo en el paso 60k, por lo que un entrenamiento más largo podría mejorar ligeramente el resultado.
- **Validación ruidosa**: la validación en entrenamiento usa solo 128 de 15 889 ventanas, con fluctuaciones de ±0,02–0,03; los ratios deben leerse como tendencia, no como valores puntuales.
- **Sin licencia especificada**: no se indica licencia, lo que impide su uso comercial sin consultar al autor.
- **Alcance limitado**: solo es aplicable a la tarea de threading de MimicGen con entradas de 224x224; no es un modelo general.
- **Riesgo de alucinación**: no aplica (no genera texto), pero la predicción de características puede ser inexacta en estados no vistos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/chomeed/mimicgen_threading_d0_224x224_dinowm_dinov2base)
- [Modelo baseline con dinov2-small](https://huggingface.co/chomeed/mimicgen_threading_d0_224x224_dinowm)
- [Dataset de entrenamiento (mezcla)](https://huggingface.co/datasets/chomeed/mimicgen_threading_d0_224x224)
- [Dataset de éxito con flujo mtdit](https://huggingface.co/datasets/chomeed/mimicgen_threading_d0_224x224_mtdit_flow_55k_success)
- [Repositorio oficial de DINOv2 (Meta AI)](https://github.com/facebookresearch/dinov2)
- [Demo de DINOv2](https://dinov2.metademolab.com/)
