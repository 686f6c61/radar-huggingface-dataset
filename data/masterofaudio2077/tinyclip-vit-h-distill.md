# masterofaudio2077/tinyclip-vit-h-distill

## Resumen

TinyCLIP-ViT-H-Distill es un modelo de destilación de conocimiento que reemplaza al text encoder de OpenCLIP ViT-H/14 utilizado en Stable Diffusion 2.1. Desarrollado por el usuario masterofaudio2077, consiste en una torre de texto TinyCLIP-39M (9 capas, hidden size 512) acoplada a un adaptador MLP (Dense 2048 → ReLU → Dropout → Dense 1024) que proyecta las representaciones del estudiante al espacio de cross-attention del UNet de SD2.1 (1024 dimensiones). El entrenamiento sigue el método *step-following* de DistillT5 (arXiv:2503.19897): el profesor (text encoder ViT-H/14 congelado) condiciona un UNet congelado, y el estudiante se entrena para que sus embeddings produzcan la misma predicción de ruido en ese UNet, sin necesidad de imágenes reales. El modelo se distribuye bajo licencia MIT, con pesos en formato Keras (.h5) y soporte para carga en PyTorch puro vía transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyCLIP text tower (9 capas, hidden 512, 8 cabezas, intermediate 2048, activación GELU) + MLP adapter (Dense 2048 → ReLU → Dropout 0.1 → Dense 1024) |
| Parametros totales | 39M (text tower) + parámetros del adapter MLP (no especificados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens (típico de CLIP) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente inglés por los datasets, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | Keras .h5 (model_weights.h5); también cargable en PyTorch vía transformers |

## Arquitectura y entrenamiento

El modelo combina una torre de texto TinyCLIP-39M (configuración idéntica a la del checkpoint `wkcn/TinyCLIP-ViT-61M-32-Text-29M-LAION400M` de HuggingFace) con un adaptador MLP de dos capas densas. La destilación sigue el método *step-following* de DistillT5: se usa un UNet de SD2.1 congelado como función de pérdida, comparando las predicciones de ruido generadas con los embeddings del profesor (OpenCLIP ViT-H/14) y las del estudiante. La pérdida principal es MSE sobre las predicciones de ruido, complementada con una pérdida auxiliar de distancia coseno por token (solo tokens reales hasta EOT) cuyo peso se anula linealmente en los primeros 50k pasos. El entrenamiento se realizó con prompts únicamente (sin imágenes) de DiffusionDB (45%), LAION-6.5-aesthetics (35%) e ImageNet con captions JoyCaption (20%), usando el optimizador Lion (lr 1e-5, weight decay 1e-3), batch 16, 20 pasos de inferencia por trayectoria, guidance scale muestreada en [2.0, 5.0] y precisión mixta bf16. El hardware fue TPU v5e con JAX.

## Capacidades

- Generación de embeddings de texto de 1024 dimensiones por token (hasta 77 tokens), compatibles con el UNet de SD2.1 para cross-attention.
- Reemplazo directo del text encoder de OpenCLIP ViT-H/14 en pipelines de Stable Diffusion 2.1, con una fracción del tamaño original.
- Extracción de características de texto para tareas de text-to-image.
- Soporte de carga en Keras 3 (keras_hub) y en PyTorch puro (vía `transformers.CLIPTextModel`).
- No incluye capacidades de tool calling, agentes, visión, audio ni razonamiento multi-step; es exclusivamente un extractor de características de texto.

## Casos de uso

- Generación de imágenes con Stable Diffusion 2.1 en entornos con recursos limitados: al ser un text encoder mucho más pequeño, reduce la huella de memoria y acelera la inferencia en GPUs consumer.
- Despliegue de pipelines de text-to-image en dispositivos edge o servidores con VRAM restringida, donde el text encoder original de ViT-H/14 resulta demasiado pesado.
- Fine-tuning de modelos de difusión con un text encoder ligero, manteniendo la compatibilidad con el UNet de SD2.1 congelado.
- Investigación en destilación de conocimiento para modelos multimodales, como banco de pruebas para técnicas *step-following* sin necesidad de pares imagen-texto.
- Integración en aplicaciones de generación de imágenes en tiempo real (por ejemplo, editores de fotos, herramientas de diseño) donde la latencia es crítica.
- Sustitución del text encoder en proyectos que ya usan SD2.1 y buscan reducir el coste de cómputo sin reentrenar el UNet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, etc.) ni comparaciones numéricas con el profesor u otros modelos.

## Requisitos de hardware

- Al ser un modelo de ~39M parámetros más un adaptador MLP pequeño, la VRAM necesaria para inferencia es muy reducida (estimación inferior a 1 GB en precisión fp32; no se proporcionan datos exactos).
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) y también en entornos CPU con baja latencia.
- Opciones de despliegue: Keras 3 (JAX/TensorFlow), PyTorch con `transformers`, o exportación a ONNX/TFLite (no documentado explícitamente).
- No se especifican latencias ni throughput; al ser un modelo pequeño, se espera un rendimiento alto en comparación con el text encoder original.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con alternativas de la misma categoría (text encoders destilados para SD). El modelo se posiciona como un reemplazo ligero del text encoder de OpenCLIP ViT-H/14, pero no se proporcionan métricas de rendimiento relativo ni listas de competidores.

## Limitaciones y advertencias

- Al ser un modelo destilado, puede presentar pérdida de calidad en la generación de imágenes respecto al profesor, especialmente en prompts complejos o composicionales (aunque el entrenamiento se enfocó en esa región).
- La longitud de contexto está limitada a 77 tokens, igual que el CLIP original; prompts más largos se truncan.
- No se han documentado sesgos específicos, pero al entrenarse con datos de DiffusionDB, LAION e ImageNet, puede heredar sesgos presentes en esos conjuntos.
- El modelo solo procesa texto; no incluye capacidades de visión ni de audio.
- La licencia MIT permite uso comercial sin restricciones, pero el uso del UNet de SD2.1 (componente congelado) está sujeto a la licencia de Stability AI (CreativeML Open RAIL-M), que debe verificarse para aplicaciones comerciales.
- Para uso en producción, se recomienda validar la calidad de las imágenes generadas frente al text encoder original, ya que no hay benchmarks publicados.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/masterofaudio2077/tinyclip-vit-h-distill)
- [Paper de DistillT5 (arXiv:2503.19897)](https://arxiv.org/abs/2503.19897)
- [Checkpoint original de TinyCLIP (wkcn/TinyCLIP-ViT-61M-32-Text-29M-LAION400M)](https://huggingface.co/wkcn/TinyCLIP-ViT-61M-32-Text-29M-LAION400M)
- [OpenCLIP (proyecto del profesor)](https://github.com/mlfoundations/open_clip)
