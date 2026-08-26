# maskjp/mtdit_plate_croissant_jointbase

## Resumen

`maskjp/mtdit_plate_croissant_jointbase` es una política robótica basada en un Multi-Task Diffusion Transformer (MTDiT) entrenada con LeRobot para control de 10 grados de libertad (articulaciones del brazo + base móvil) en una tarea de manipulación de platos y cruasanes. El modelo ha sido desarrollado por Peng Jiang (maskjp) y se distribuye bajo licencia Apache 2.0. Resuelve el problema de aprender políticas de manipulación multi-tarea a partir de demostraciones, combinando entradas visuales de tres cámaras (izquierda, derecha y muñeca) con condicionamiento por lenguaje mediante un codificador CLIP congelado.

El modelo es relevante por dos razones: demuestra que el recorte aleatorio (random cropping) de 224×224 sobre fotogramas completos de 480×640 actúa como regularización implícita que evita el sobreajuste con apenas 93 episodios de entrenamiento, y es el único de siete configuraciones evaluadas en un barrido de hiperparámetros cuya pérdida en validación no dejó de descender hasta las 50.000 iteraciones. Tiene 443,0 millones de parámetros en total (379,9 millones entrenables) y usa un objetivo de difusión DDPM con 100 pasos de ruido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Task Diffusion Transformer (MTDiT) con cabezal de difusión DDPM (100 timesteps) |
| Parametros totales | 443.020.554 (443,0 M) |
| Parametros activos | 379,9 M entrenables (no es MoE) |
| Longitud de contexto | no aplicable (política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (condicionamiento por lenguaje via CLIP ViT-B/16 congelado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Transformer de difusión multi-tarea (MTDiT) con `hidden_dim` de 768, 8 capas y 12 cabezas de atención, con dropout 0.1 y RoPE (rotary position embeddings) activado. El objetivo es difusión denoising (DDPM) con 100 pasos de entrenamiento, horizonte de acción de 48 pasos, 40 pasos de acción ejecutada y 2 pasos de observación. El condicionamiento por lenguaje usa un codificador de texto CLIP ViT-B/16 congelado con una proyección lineal entrenable encima.

El entrenamiento se realizó sobre el dataset `l5vel-peng/base4-plate-croissant-eef-merged-v30` con 93 episodios de entrenamiento y 5 de validación, divididos a nivel de episodio y estratificados por tarea. Se usaron 50.000 pasos con batch de 64 en una sola GPU H100, optimizador AdamW con lr 3e-4, weight_decay 0 y sin warmup. El multiplicador de lr para el encoder de visión fue 0.1. La imagen no se redimensiona (`image_resize_shape=None`); en entrenamiento se aplica un recorte aleatorio de 224×224 sobre el fotograma completo de 480×640, mientras que en evaluación se usa un recorte central determinista. La augmentación de imágenes está desactivada.

## Capacidades

- Control de 10 grados de libertad (articulaciones del brazo + base móvil) a partir de observaciones de estado y tres cámaras (izquierda, derecha, muñeca).
- Condicionamiento por lenguaje mediante CLIP ViT-B/16 congelado, lo que permite dirigir la política por instrucciones textuales.
- Política de difusión con 100 pasos de ruido y horizonte de 48 pasos, con 40 pasos de acción ejecutada.
- Aprendizaje multi-tarea: entrenada sobre episodios de tareas de plato y cruasán con el mismo conjunto de parámetros.
- Integración nativa con LeRobot (`MultiTaskDiTPolicy.from_pretrained`), lo que facilita su carga y despliegue.
- No incluye capacidades de tool calling, agentes o razonamiento multi-step (es una política robótica, no un LLM).

## Casos de uso

- Manipulación robótica de objetos en mesa: la política puede ejecutar tareas de recogida y colocación de platos y cruasanes en un entorno de mesa, utilizando las tres cámaras para percibir el estado del escenario.
- Control de brazo con base móvil: el vector de acción de 10 dimensiones incluye tanto las articulaciones del brazo como la base, permitiendo desplazamiento y manipulación simultánea.
- Aprendizaje por imitación en producción: se puede usar como referencia para entrenar políticas robóticas con datasets pequeños (93 episodios), aprovechando la regularización implícita del recorte aleatorio para evitar sobrefitting.
- Benchmarking de políticas robóticas: sirve como baseline para comparar arquitecturas de difusión multi-tarea en tareas de manipulación real.
- Investigación en regularización de políticas de difusión: su diseño con recorte aleatorio como regularizador es un caso de estudio para datasets reducidos.
- Prototipado rápido en laboratorio: con LeRobot, se puede cargar en pocas líneas de código y evaluar en simulación o en robot real para validar hipótesis de control.

## Benchmarks y rendimiento

La model card reporta la pérdida de denoising en el split de validación (5 episodios, 93 de entrenamiento) para el checkpoint final:

| Paso | 5K | 15K | 25K | 35K | 45K | 50K |
|---|---|---|---|---|---|---|
| eval_loss | 0.0079 | 0.0051 | 0.0045 | 0.0042 | 0.0037 | **0.0038** |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque es una política robótica, no un modelo de lenguaje. El autor advierte explícitamente que la pérdida de denoising es un proxy débil del éxito en despliegue real, y que el checkpoint no ha sido validado en un robot físico.

## Requisitos de hardware

- El entrenamiento se realizó en una GPU H100 (50.000 pasos, batch 64).
- Para inferencia, con 443 M de parámetros en formato safetensors, el modelo es viable en GPUs de consumo (p. ej., RTX 3090/4090 con 24 GB) en la mayoría de los casos.
- VRAM estimada: no disponible en la información proporcionada; depende de la resolución de entrada (3 imágenes de 480×640) y del batch de inferencia.
- Despliegue: compatible con LeRobot (carga directa con `MultiTaskPolicy.from_pretrained`). No se mencionan vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de la misma categoría (políticas MTDiT para manipulación robótica) en la información proporcionada. Dentro del propio barrido de hiperparámetros del autor, el único dato comparativo es el ramo con `image_resize_shape=[240,320]`, que terminó con eval_loss de 0.0121 (una brecha entrenamiento/evaluación de 12×), frente a 0.0038 del modelo presentado. Esta comparación interna muestra que el recorte aleatorio sin redimensionamiento fue determinante para evitar el sobrefitting.

## Limitaciones y advertencias

- El campo `image_resize_shape` es `None`: en inferencia se recorta centralmente 224×224 de cada fotograma de 480×640, lo que equivale a ver aproximadamente el 16 % central de la imagen. Cualquier objeto que se desplace al borde del fotograma es invisible para la política, lo que puede parecer un fallo de la política cuando en realidad es un problema de encuadre de la cámara.
- El modelo no ha sido validado en un robot real; la pérdida de denoising es un proxy débil del éxito de despliegue.
- El dataset de entrenamiento es muy pequeño (93 episodios), lo que limita la generalización a escenarios no vistos.
- Las columnas `observation.eef_state` y `action.eef` están presentes en el dataset pero no se usan (LeRobot vincula solo `observation.state` y `action`), por lo que no se explota información de efector final.
- La augmentación de imágenes está desactivada; la regularización proviene únicamente del recorte aleatorio durante el entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero no hay garantías de rendimiento en entornos de producción sin validación previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maskjp/mtdit_plate_croissant_jointbase
- Dataset de entrenamiento: https://huggingface.co/datasets/l5vel-peng/base4-plate-croissant-eef-merged-v34
- Perfil del autor (Peng Jiang): https://huggingface.co/maskjp
- Repositorio de GitHub del autor: https://github.com/maskjp
