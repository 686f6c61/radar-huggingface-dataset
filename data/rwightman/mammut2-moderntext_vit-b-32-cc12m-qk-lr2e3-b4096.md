# rwightman/mammut2-moderntext_ViT-B-32.cc12m-qk-lr2e3-b4096

## Resumen

El modelo `mammut2-moderntext_ViT-B-32.cc12m-qk-lr2e3-b4096` es un checkpoint de investigación desarrollado por Ross Wightman (rwightman) dentro de un estudio comparativo de arquitecturas y objetivos de entrenamiento para modelos de visión-lenguaje. Se basa en el enfoque MaMMUT2, que combina un encoder de imagen tipo ViT-B/32 con un decoder de texto moderno que utiliza RoPE, RMSNorm, SwiGLU, atención con gating y qk-norm. El modelo fue entrenado sobre el dataset CC12M durante 32 épocas, con un objetivo que combina InfoNCE, pérdida de entropía cruzada para captions y z-loss, y un batch de 4096. Es un checkpoint de investigación, no un modelo de producción, y su propósito principal es evaluar el impacto de distintas configuraciones en métricas de clasificación zero-shot, recuperación y generación de captions.

Este modelo destaca por ser la mejor ejecución dentro de su serie comparativa, logrando un rendimiento cercano a los baselines CLIP con el mismo batch, aunque con un optimizador distinto (AdamW en lugar de NAdaMuon). Su relevancia radica en que aclara el efecto del batch, el optimizador y el objetivo de captions en el rendimiento de modelos de doble encoder, mostrando que la ventaja de CLIP en zero-shot se debe en gran parte al batch y al optimizador, mientras que el objetivo de captions mejora la recuperación de imagen a texto de forma independiente del batch. El modelo está disponible bajo licencia Apache 2.0 y se distribuye en formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT-B/32 para imagen + decoder de texto moderno (RoPE, RMSNorm, SwiGLU, gated attention, qk-norm) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 128 tokens (texto) |
| Tipos de cuantización | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (tokenizer tiktoken r50k, probablemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura dual típica de CLIP, con un encoder de imagen basado en ViT-B/32 y un decoder de texto moderno que incorpora normalización RMS, capas de atención con gating, y RoPE. El decoder emplea un tokenizador tiktoken r50k con vocabulario de 50260 tokens y contexto de 128. El entrenamiento se realizó sobre CC12M (pixparse/cc12m-wds) durante 32 épocas, con precisión bf16, weight decay 0.25, optimizador AdamW con learning rate 2e-3 y batch size 4096. La función de pérdida combina InfoNCE (contrastiva) con 2 veces la entropía cruzada de captions y un z-loss de 1e-5. No se aplicó RLHF ni DPO.

La principal innovación técnica es la sustitución del decoder de texto clásico por un decoder moderno con qk-norm, que permite duplicar el learning rate estable. Además, se evalúa el efecto del batch y del objetivo de captions en el rendimiento final. El modelo es capaz de generar captions mediante beam search, además de las tareas estándar de clasificación y recuperación.

## Capacidades

- Clasificación de imágenes zero-shot: puede asignar etiquetas a imágenes sin entrenamiento específico.
- Recuperación imagen-texto (I2T) y texto-imagen (T2I): recuperación cruzada entre modalidades.
- Generación de captions: genera descripciones textuales de imágenes (con beam search).
- Soporte para uso con Open_CLIP: carga directa mediante `open_clip.create_model_from_pretrained`.
- No incluye soporte para tool calling, agentes ni razonamiento multi-step.
- No se ha indicado capacidad multilingüe; el tokenizer es r50k (inglés).

## Casos de uso

- Evaluación de arquitecturas de visión-lenguaje: útil para investigadores que comparan variantes de decoders y objetivos en entornos de investigación.
- Clasificación zero-shot de imágenes en entornos académicos: permite probar la transferencia de conocimiento sin fine-tuning, aunque el rendimiento es limitado por el dataset de entrenamiento.
- Recuperación de imágenes por texto: puede usarse en sistemas de búsqueda multimodal, aunque con precaución por su naturaleza de investigación.
- Generación de captions para imágenes en prototipos: dado que soporta beam search, puede generar descripciones, aunque la calidad es baja (CIDEr 12.23) y el estilo está limitado por los alt-text de CC12M.
- Análisis de sensibilidad a hiperparámetros: sirve como punto de comparación para estudios de batch, learning rate y regularización.
- Base para fine-tuning en tareas específicas: al ser un checkpoint pequeño, puede ajustarse para dominios concretos, pero se recomienda partir de modelos más robustos para producción.

## Benchmarks y rendimiento

La model card proporciona resultados para este modelo y otras variantes comparadas. Se presentan los valores de la fila correspondiente a este checkpoint, junto con los de otras ejecuciones para contexto. Los métricas son: clasificación zero-shot en ImageNet (IN1K), ImageNet-V2, ImageNet-R, ImageNet-Sketch, recuperación I2T R@1, T2I R@1 y métricas de generación de captions (CIDEr, BLEU-4, METEOR) evaluadas en COCO Karpathy-test.

| Run | IN1K | IN-V2 | IN-R | IN-Sk | I2T R@1 | T2I R@1 | CIDEr | BLEU-4 | METEOR |
|---|---|---|---|---|---|---|---|---|---|
| clip-siglip | 42.72 | 36.44 | 54.38 | 32.08 | 34.84 | 25.95 | - | - | - |
| clip-naflex | 40.40 | 34.43 | 50.53 | 28.55 | 34.60 | 24.25 | - | - | - |
| mammut2 (no z) | 37.80 | 31.98 | 48.80 | 27.16 | 37.52 | 24.72 | 10.02 | 2.43 | 7.37 |
| mammut2 (+z) | 38.36 | 32.47 | 49.44 | 27.12 | 38.18 | 24.54 | 10.04 | 2.41 | 7.38 |
| mammut2-mt no-qk lr1e-3 | 38.07 | 32.78 | 50.84 | 27.28 | 37.44 | 25.18 | 10.96 | 3.58 | 7.69 |
| mammut2-mt qk lr2e-3 | 38.37 | 33.02 | 50.56 | 27.18 | 37.94 | 24.93 | 10.85 | 3.44 | 7.57 |
| **mammut2-mt qk lr2e-3 b4096 (este modelo)** | 40.00 | 34.21 | 53.91 | 29.81 | 37.70 | 25.37 | 12.23 | 3.91 | 7.99 |
| mammut2-mt qk lr3e-3 | 37.05 | 31.82 | 48.41 | 26.03 | 35.92 | 24.06 | 10.29 | 3.31 | 7.35 |

No se han publicado resultados en benchmarks estándar como MMLU o HumanEval, ya que el modelo no es de lenguaje general.

## Requisitos de hardware

- No se proporcionan datos de VRAM o GPU específicas en la información disponible.
- El modelo es de tamaño ViT-B/32, por lo que es relativamente ligero. Con safetensors de 1.6 GB, es plausible que quepa en GPU con 8-16 GB de VRAM, pero no se confirma.
- Para inferencia se puede usar la librería Open_CLIP, que funciona en GPU estándar (por ejemplo, RTX 30/40 series) y también en CPU, aunque con menor rendimiento.
- No se indican opciones de despliegue específicas como vLLM o Ollama, dado que es un modelo de visión-lenguaje y no un LLM puro.

## Comparativa con modelos similares

No hay comparativas con modelos externos como CLIP o SigLIP de tamaño B/32 en la información disponible. La única comparación es interna, entre variantes del mismo modelo y los baselines CLIP que se incluyen en la tabla de benchmarks. Estos baselines provienen de experimentos con optimizador NAdaMuon y batch 4096, mientras que las variantes MaMMUT usan AdamW. Esta comparación interna muestra que el modelo actual (con batch 4096) se acerca a los valores de CLIP en IN1K (40.0 vs 40.4 de clip-naflex) y supera a los baselines en recuperación I2T (40.0 vs 34.84 de clip-siglip). No obstante, no se dispone de datos de otros modelos como ViT-B/32 de OpenAI o SigLIP.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo de producción. No debe usarse en sistemas críticos sin una evaluación rigurosa.
- Entrenado únicamente sobre CC12M, un dataset de alt-text de imágenes web, lo que introduce sesgos en el estilo de captions y en las clases reconocidas.
- La generación de captions tiene baja calidad absoluta (CIDEr 12.23) y no es comparable con modelos de captions modernos.
- El vocabulario está limitado al tokenizer r50k (inglés), por lo que no soporta otros idiomas.
- No se han reportado sesgos específicos, pero al ser entrenado con datos web, puede reflejar los sesgos de ese conjunto.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo de investigación, no hay garantías de rendimiento ni soporte.

## Enlaces

- [Hugging Face: rwightman/mammut2-moderntext_ViT-B-32.cc12m-qk-lr2e3-b4096](https://huggingface.co/rwightman/mammut2-moderntext_ViT-B-32.cc12m-qk-lr2e3-b4096)
- [Perfil de GitHub de rwightman](https://github.com/rwightman)
- [Repositorio de rwightman en GitHub](https://github.com/rwightman?tab=repositories)
- [Dataset pixparse/cc12m-wds](https://huggingface.co/datasets/pixparse/cc12m-wds)
