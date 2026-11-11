# bestornot04/imagenet100_scratch_20261105_300ep

## Resumen

Este repositorio, publicado por el usuario `bestornot04`, no es un modelo generativo al uso, sino una colección de checkpoints de investigación para clasificación de imágenes sobre ImageNet-100. Contiene cinco variantes entrenadas desde inicialización aleatoria con la misma semilla (seed 0) y el mismo protocolo de 300 épocas: un ViT-Base/16 denso, un MoE disperso, un control de capacidad MLP independiente, un MoE con self-attention por experto y un MoE con cross-attention por experto. El objetivo declarado es comparar arquitecturas bajo condiciones controladas, no ofrecer un modelo listo para producción.

La arquitectura base es ViT-Base/16 a 224 píxeles, con una representación tanh de 768 a 768 antes de la proyección a 100 clases. Las variantes MoE emplean ocho expertos con enrutamiento softmax top-4 normalizado y bloques dispersos en las posiciones `[0, 2, 4, 6, 8, 10]`. El entrenamiento usa AdamW durante 300 épocas con learning rate 3e-4, weight decay 0.3, warmup de 32 épocas y batch efectivo de 256, sin Mixup, CutMix, label smoothing ni RandAugment.

Su relevancia es metodológica: publica checkpoints best y last, configuraciones portables, métricas CSV y resultados de evaluación reproducibles, junto con el wheel `comoe_image` y las fuentes del paquete. La licencia no está especificada en la información disponible, lo que limita su uso comercial sin aclaración previa del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base/16) con variantes densa y Mixture-of-Experts |
| Parametros totales | no disponible (ViT-Base/16 base; el conteo exacto por variante no se publica) |
| Parametros activos | no disponible (MoE con 8 expertos y top-4, pero sin cifra de parámetros activos) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes a 224x224 píxeles) |
| Tipos de cuantizacion | no disponible (checkpoints en BF16 según la configuración guardada) |
| Idiomas soportados | en (etiquetas de clase en inglés) |
| Licencia | no disponible |
| Formato de pesos | checkpoints de PyTorch Lightning (`.ckpt`), con estado de optimizador y scheduler |

## Arquitectura y entrenamiento

El modelo base es un ViT-Base/16 que opera sobre parches de 16x16 a resolución 224, con una capa de representación tanh de 768 a 768 antes de la proyección final a 100 clases y dropout de 0.1. Sobre esta base se construyen cuatro variantes adicionales: un MoE disperso con ocho expertos y enrutamiento softmax top-4 normalizado (ancho oculto de experto 768, bloques dispersos en `[0, 2, 4, 6, 8, 10]`), un control de capacidad MLP independiente (`moe_mlp`, que aplica un MLP no lineal compartido a los estados de experto seleccionados antes de sumarlos, renombrado en la configuración actual como `moe_mlp_then_sum`), un MoE con self-attention por experto y un MoE con cross-attention por experto.

El entrenamiento se realizó desde inicialización aleatoria con seed 0 en las cinco variantes, usando AdamW durante 300 épocas, learning rate 3e-4, weight decay 0.3, warmup de 32 épocas y batch efectivo de 256. Se desactivaron explícitamente Mixup, CutMix, label smoothing y RandAugment. El dataset es `bestornot04/imagenet-100` fijado a la revisión `5238ec9e4711421604a48967bcc6245b4bbb9e4d`, con selección de clases CMC, deduplicación y splits con seed 42: 126.633 imágenes de entrenamiento, 2.500 de validación y 2.500 de test. El stack probado fue PyTorch 2.5.1 con CUDA 12.1 sobre una NVIDIA L40S de 48 GiB.

## Capacidades

- Clasificación de imágenes en 100 clases de ImageNet-100.
- Extracción de representaciones ViT-Base/16 a partir de los checkpoints densos.
- Variantes MoE con enrutamiento top-4 sobre ocho expertos para estudiar eficiencia condicional.
- Variantes con self-attention y cross-attention por experto para comparar mecanismos de agregación.
- Evaluación reproducible mediante el paquete `comoe_image` y el comando `comoe-evaluate`.
- Reanudación de entrenamiento con estado de optimizador, scheduler y data-sampler preservados.
- No soporta generación de texto, tool calling, agentes, visión multimodal ni capacidades multilingües más allá de las etiquetas de clase en inglés.

## Casos de uso

- Reproducción de experimentos académicos: permite replicar la comparación densa frente a MoE con la misma semilla y protocolo, usando los checkpoints best y last y las métricas CSV publicadas.
- Estudio de enrutamiento MoE: los checkpoints con top-4 sobre ocho expertos permiten analizar la distribución de carga entre expertos y el efecto de la dispersión en bloques concretos.
- Comparación de mecanismos de agregación: las variantes self-attention y cross-attention por experto sirven para medir el impacto de cada diseño sobre la precisión top-1 en un régimen controlado.
- Control de capacidad: la variante `moe_mlp` actúa como referencia para separar el efecto de la capacidad adicional del efecto del enrutamiento.
- Baseline para fine-tuning en dominios pequeños: el ViT-Base/16 denso puede servir como punto de partida para clasificación de 100 clases en datasets propios.
- Docencia y formación: el paquete `comoe_image` y el comando `comoe-evaluate` permiten demostrar un flujo completo de evaluación con splits de validación y test separados.
- Auditoría de reproducibilidad: el manifiesto `release_manifest.json` y `SHA256SUMS` permiten verificar la integridad de los artefactos publicados.

## Benchmarks y rendimiento

Resultados de validación top-1 sobre 2.500 imágenes, seleccionados por mejor validación y re-evaluados con la implementación compartida. Son resultados de validación, no de test reservado.

| Variante | Checkpoint best | Validación top-1 |
|---|---|---:|
| Dense | `dense_seed0/checkpoints/epoch292.ckpt` | 70,24% |
| Sparse MoE | `sparse_moe_seed0/checkpoints/epoch259.ckpt` | 70,16% |
| Independent MLP | `moe_mlp_seed0/checkpoints/epoch274.ckpt` | 70,44% |
| Expert self-attention | `moe_self_attention_seed0/checkpoints/epoch287.ckpt` | 69,32% |
| Expert cross-attention | `moe_cross_attention_seed0/checkpoints/epoch270.ckpt` | 69,20% |

No se han publicado resultados de benchmarks en la información disponible más allá de estos valores de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entorno probado usa una NVIDIA L40S de 48 GiB con precisión BF16.
- GPU recomendadas: NVIDIA L40S (48 GiB) es la única configuración documentada; GPUs de 24 GiB o más deberían ser suficientes para ViT-Base/16 a 224 en BF16, aunque no está verificado en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada; un ViT-Base/16 en BF16 ocupa del orden de cientos de MB de pesos, pero el checkpoint completo incluye estado de optimizador y scheduler, lo que eleva el tamaño del artefacto.
- Opciones de despliegue: el paquete `comoe_image` con `comoe-evaluate` (GPU con `--accelerator gpu`, CPU con `--accelerator cpu` en FP32); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bestornot04/imagenet100_scratch_20261105_300ep` (Dense) | ViT-Base/16 (conteo exacto no disponible) | 224x224, 100 clases | 70,24% top-1 validación | no disponible | Hugging Face, 0 descargas |
| `bestornot04/imagenet100_scratch_20261105_300ep` (Sparse MoE) | 8 expertos, top-4 (conteo exacto no disponible) | 224x224, 100 clases | 70,16% top-1 validación | no disponible | Hugging Face |
| ViT-Base/16 preentrenado en ImageNet-21k (referencia genérica) | ~86M | 224x224, 1000 clases | no disponible en esta ficha | según checkpoint original | ampliamente disponible |
| DeiT-Base (referencia genérica) | ~86M | 224x224, 1000 clases | no disponible en esta ficha | según checkpoint original | ampliamente disponible |

La comparación con alternativas externas no puede cuantificarse porque la información proporcionada no incluye resultados de esos modelos sobre este split concreto de ImageNet-100.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial sin confirmación del autor.
- Modelo de investigación: no está pensado como clasificador de producción ni como servicio listo para desplegar.
- Solo 100 clases de ImageNet-100; no cubre el vocabulario completo de ImageNet-1k.
- Los resultados publicados son de validación (2.500 imágenes), no de test reservado; la generalización real debe medirse con `--split test`.
- Entrenamiento sin Mixup, CutMix, label smoothing ni RandAugment, lo que limita la comparación directa con recetas estándar de la literatura.
- Riesgo de sobreajuste al split de validación por la selección del mejor checkpoint sobre esas mismas 2.500 imágenes.
- Sesgos heredados del subconjunto CMC de ImageNet-100 y de la deduplicación aplicada por el autor del dataset.
- El repositorio pesa 13,2 GB e incluye checkpoints completos con estado de optimizador; no es adecuado para descarga ligera.
- Solo idioma inglés en las etiquetas; no hay capacidades multilingües ni multimodales.
- No se documentan métricas de calibración, robustez ni comportamiento fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bestornot04/imagenet100_scratch_20261105_300ep
- Dataset: https://huggingface.co/datasets/bestornot04/imagenet-100
- Revisión del dataset: `5238ec9e4711421604a48967bcc6245b4bbb9e4d`
- Paquete de evaluación: `software/comoe_image-0.1.0-py3-none-any.whl` dentro del repositorio
- Manifiesto de release: `release_manifest.json` y `SHA256SUMS` dentro del repositorio
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
