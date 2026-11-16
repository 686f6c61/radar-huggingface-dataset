# ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_softtanh-V

## Resumen

El modelo `ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_softtanh-V` es un clasificador de imágenes basado en la arquitectura bViT (una variante de Vision Transformer), entrenado desde cero sobre el subconjunto ImageNet-100 (100 clases de ImageNet). Lo desarrolla el usuario ais0430 en el contexto de un proyecto de reproducción de bViT, cuyo código y notas de diseño están publicados en el repositorio `bViT_circuit` de GitHub. Se trata de un modelo de investigación de muy pequeño tamaño (aproximadamente 3,06 millones de parámetros) y sin model card detallada más allá de los hiperparámetros del entrenamiento.

El nombre del repositorio codifica la configuración del experimento: dimensión de embedding de 462, 6 cabezas de atención, 30 épocas de entrenamiento, batch de 128, learning rate de 5e-4, sin EMA y activación softtanh en la variante "V". El modelo alcanza una precisión de evaluación (best) de 0,4382 sobre ImageNet-100, un resultado modesto coherente con su reducido tamaño y su carácter experimental.

Su relevancia es limitada fuera del ámbito de la investigación: no hay información sobre licencia, idiomas ni datos de benchmarks más allá de la accuracy reportada. Es útil como referencia para estudiar el comportamiento de arquitecturas ViT de bajo parámetro en tareas de clasificación de imágenes y para reproducir experimentos del proyecto bViT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | bViT (Vision Transformer, variante del proyecto bViT_circuit) |
| Parámetros totales | 3.059.926 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificación de imágenes, sin contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura bViT, una variante de Vision Transformer propia del proyecto de reproducción `bViT_circuit`. La configuración concreta incluye una dimensión de embedding de 462 y 6 cabezas de atención. El nombre del experimento indica el uso de activación softtanh en la variante "V" y la ausencia de EMA (Exponential Moving Average) durante el entrenamiento. No se dispone de información detallada sobre el número de capas, el tamaño de parche ni la resolución de entrada en la información proporcionada.

El entrenamiento se realizó sobre el dataset ImageNet-100 durante 30 épocas, con un batch size de 128 y un learning rate de 5e-4. No hay datos sobre la composición exacta del dataset, el número total de tokens de entrenamiento ni sobre el uso de técnicas de ajuste fino como RLHF o DPO (no aplicables en un clasificador de imágenes). La accuracy de evaluación (best) reportada es de 0,4382. Los detalles de diseño y las decisiones técnicas se remiten al repositorio `bViT_circuit` (archivos `CLAUDE.md` y `docs/code_notes/`).

## Capacidades

- Clasificación de imágenes en 100 clases (ImageNet-100).
- Inferencia mediante la librería `transformers` (pipeline `image-classification`).
- Compatible con endpoints (tag `endpoints_compatible`).
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (es un modelo de visión).
- No dispone de modo thinking, visión generativa ni audio.

## Casos de uso

- Clasificación de imágenes en entornos de investigación: el modelo puede utilizarse como referencia para comparar variantes de bViT de bajo parámetro sobre ImageNet-100, dado que su accuracy de 0,4382 sirve como línea base reproducible.
- Reproducción de experimentos del proyecto bViT_circuit: sirve para validar configuraciones de embedding, número de cabezas y activaciones (softtanh) en un entorno controlado.
- Prototipado rápido de pipelines de clasificación con `transformers`: al ser un modelo pequeño (3,06 M de parámetros), se puede cargar y ejecutar en CPU o GPU de gama baja para pruebas de integración.
- Docencia y aprendizaje sobre Vision Transformers: su tamaño reducido y su configuración explícita en el nombre del repositorio lo hacen útil para estudiar el efecto de hiperparámetros en el rendimiento.
- Filtrado o etiquetado automático de imágenes en conjuntos de 100 clases: puede emplearse como clasificador preliminar en tareas de curación de datos, siempre que la precisión del 43,8 % sea aceptable para el caso.
- Evaluación comparativa de arquitecturas ViT: sirve como punto de comparación frente a modelos de mayor tamaño o configuraciones alternativas dentro del mismo proyecto de investigación.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| ImageNet-100 (eval accuracy, best) | 0,4382 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (3,06 M de parámetros, aproximadamente 12 MB de pesos), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: `transformers` (pipeline `image-classification`), endpoints compatibles; no se dispone de información sobre soporte en vLLM, llama.cpp, Ollama o TGI (no aplicables a un clasificador de imágenes de este tamaño).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_softtanh-V | 3.059.926 | no aplica | ImageNet-100 acc 0,4382 | no disponible | Hugging Face |
| ViT-base (referencia) | ~86 M | no aplica | no disponible en esta información | no disponible | Hugging Face |
| DeiT-tiny (referencia) | ~5,7 M | no aplica | no disponible en esta información | no disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada; la comparativa se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al entrenarse sobre ImageNet-100, hereda los sesgos de dicho dataset.
- Riesgo de alucinación: no aplica (modelo de clasificación, no generativo).
- Limitaciones de contexto o idioma: no aplica; es un modelo de visión sin capacidades lingüísticas.
- Restricciones de licencia para uso comercial: la licencia no está disponible, por lo que no se puede garantizar su uso comercial.
- Caveat importante para producción: la accuracy de 0,4382 sobre ImageNet-100 es modesta y el modelo tiene solo 3,06 M de parámetros; no es adecuado para aplicaciones de producción que requieran alta precisión.
- No hay información sobre la resolución de entrada, el número de capas ni el preprocesamiento esperado, lo que dificulta su uso directo sin consultar el repositorio del proyecto.
- El modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_softtanh-V
- Repositorio del proyecto: https://github.com/otia-0430/bViT_circuit
- Run de Weights & Biases: https://forge.coreweave.com/wandb/aito-paretto-/bvit/runs/i6dge3yo
