# fastforks/efficientformer

## Resumen

EfficientFormer es una familia de clasificadores de imagen que combina bloques de pooling sobre mapas de características con bloques transformer sobre tokens, propuesta por Li et al. (Snap Research) en 2022. El repositorio `fastforks/efficientformer` no aloja pesos: es una model card de integración que describe cómo el framework fastforks descarga los checkpoints originales publicados por el equipo de `timm` y los valida mediante SHA-256.

La ficha cubre tres variantes con pesos en formato safetensors: `efficientformer_l1.snap_dist_in1k`, `efficientformer_l3.snap_dist_in1k` y `efficientformer_l7.snap_dist_in1k`, todas entrenadas sobre ImageNet-1k (ILSVRC 2012) y con licencia Apache-2.0, lo que permite uso comercial. La tarea es clasificación de imágenes con salida de logits sobre las 1.000 clases de ImageNet, con entrada fija de 224x224 píxeles.

Su relevancia actual reside en que ofrece una alternativa híbrida (convolución/pooling + atención) a los ViT puros, con latencias muy bajas en GPU consumer: entre 3,72 ms y 9,65 ms por imagen en fp16 en una RTX 5060 Ti, y hasta 0,335 ms con TensorRT fp16 para la variante L1. Está marcado como tier experimental dentro de fastforks y solo soporta el backend `portable`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: bloques de pooling sobre mapas de características + bloques transformer sobre tokens |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (visión; entrada fija 224x224) |
| Tipos de cuantizacion | fp32 y fp16 documentados; otros no disponibles |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | safetensors |

Variantes disponibles:

| Variante | Pesos | SHA-256 (12 hex) | Uso comercial |
|---|---|---|---|
| `efficientformer_l1.snap_dist_in1k@1` | efficientformer_l1.snap_dist_in1k.safetensors | `dab9ad0e328f` | sí |
| `efficientformer_l3.snap_dist_in1k@1` | efficientformer_l3.snap_dist_in1k.safetensors | `ab0c5bfd7c18` | sí |
| `efficientformer_l7.snap_dist_in1k@1` | efficientformer_l7.snap_dist_in1k.safetensors | `c497103536ff` | sí |

## Arquitectura y entrenamiento

EfficientFormer sigue un diseño híbrido: una primera fase de bloques tipo pooling que operan sobre mapas de características (explotando la localidad espacial de forma eficiente en memoria) seguida de una fase de bloques transformer que operan sobre tokens. Esta combinación busca retener la eficiencia de las CNN en etapas tempranas y la capacidad de modelado global de la atención en etapas tardías, reduciendo el coste computacional frente a un ViT puro del mismo orden de magnitud.

Los pesos incluidos corresponden al entrenamiento supervisado sobre ImageNet-1k (ILSVRC 2012), con la variante `snap_dist_in1k` (destilación de Snap Research sobre ImageNet-1k). No se documentan en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset más allá de ImageNet-1k, ni si hubo etapas de RLHF/DPO (no aplicables en clasificación). La innovación técnica destacable es la propia arquitectura híbrida y el pipeline de validación de pesos por SHA-256 que implementa fastforks.

## Capacidades

- Clasificación de imágenes en las 1.000 clases de ImageNet-1k, con salida de logits.
- Entrada de imagen RGB única, redimensionada (lado corto 235) y recortada al centro a 224x224 fijos.
- Inferencia en fp32 y fp16; el backend `portable` funciona en CUDA y PyTorch.
- Compatible con `torch.compile` (aceleración de 2,2x a 2,6x sobre el backend portable).
- Compatible con exportación a ONNX y TensorRT fp16 (hasta 11x de aceleración frente a portable en L1).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador puro.
- No soporta multilingüismo ni modalidades distintas de imagen.

## Casos de uso

- Moderación de contenido visual: clasificar imágenes subidas por usuarios en categorías ImageNet para filtrar contenido no deseado antes de su publicación; la latencia de 3,72 ms (L1, fp16) permite procesar lotes grandes en tiempo real.
- Etiquetado automático de catálogos de producto: usar los logits de las 1.000 clases como base para un clasificador afinado sobre categorías propias del comercio, aprovechando el backbone preentrenado.
- Preprocesado en pipelines de visión: emplear el modelo como extractor de características o clasificador auxiliar en un sistema mayor, con la variante L1 para el edge y L7 para servidor.
- Detección de defectos en inspección industrial: clasificar imágenes de piezas en una línea de producción; el bajo consumo de memoria (93 MiB en L1 portable) permite desplegar en GPUs de gama baja.
- Filtrado y organización de fototecas: clasificación automática de imágenes en un servicio de almacenamiento, con la variante L3 como equilibrio entre precisión (83,16% top-1) y coste (6,37 ms).
- Prototipado rápido de aplicaciones de visión: al ser un checkpoint Apache-2.0 con validación SHA-256 y backend portable, sirve para validar ideas antes de invertir en modelos mayores.
- Benchmarking de hardware y frameworks: sus tiempos medidos (portable, compile, TensorRT) lo convierten en una referencia útil para comparar GPUs y toolchains de inferencia.

## Benchmarks y rendimiento

Precisión en ImageNet-1k val (5.000 imágenes aleatorias, top-1 / top-5 %):

| Variante | Original fp32 | Original fp16 | Portable |
|---|---|---|---|
| `efficientformer_l1.snap_dist_in1k` | 81,14 / 95,22 | 81,16 / 95,24 | 81,14 / 95,12 |
| `efficientformer_l3.snap_dist_in1k` | 83,12 / 96,32 | 83,14 / 96,32 | 83,16 / 96,32 |
| `efficientformer_l7.snap_dist_in1k` | 84,44 / 96,68 | 84,44 / 96,66 | 84,38 / 96,68 |

Latencia y memoria (224x224, RTX 5060 Ti 16 GB, sm_120):

| Variante | Original fp32 (ms) | Original (ms) | Portable (ms) | Peak MiB portable (alloc/reserved) |
|---|---|---|---|---|
| L1 | 4,87 | 6,40 | 3,72 | 93 / 104 |
| L3 | 8,39 | 11,0 | 6,37 | 161 / 216 |
| L7 | 12,3 | 15,9 | 9,65 | 300 / 324 |

Con `torch.compile` y TensorRT fp16:

| Variante | Portable (ms) | Compile (ms) | TensorRT fp16 (ms) | Preparación compile (s) | Build ONNX+engine (s) |
|---|---|---|---|---|---|
| L1 | 3,72 | 1,69 | 0,335 | 9,10 | 35,4 |
| L3 | 6,37 | 2,57 | 0,750 | 11,8 | 39,4 |
| L7 | 9,65 | 3,69 | 1,40 | 14,4 | 40,0 |

## Requisitos de hardware

- VRAM estimada en inferencia: L1 ~0,1 GiB, L3 ~0,2 GiB, L7 ~0,3 GiB (fp16, backend portable).
- GPU recomendadas: cualquier GPU CUDA con al menos 1 GiB libre; probado en RTX 5060 Ti 16 GB (sm_120). Para máximo rendimiento, TensorRT fp16 sobre GPUs Ampere o superiores (A100, H100, RTX 4090).
- Cabe holgadamente en GPUs consumer: RTX 3060, 4060, 4090, etc.
- Opciones de despliegue: backend `portable` de fastforks (PyTorch/CUDA), `torch.compile`, exportación a ONNX y TensorRT fp16. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imagen).
- Latencia: 3,72–9,65 ms por imagen en portable fp16; 0,335–1,40 ms con TensorRT fp16. Carga del modelo entre 0,22 s (L1 original) y 2,27 s (L7 portable).

## Comparativa con modelos similares

No se han publicado en la información disponible comparativas directas con otros clasificadores (por ejemplo, ViT-B/16, DeiT o ConvNeXt). Los datos de precisión y latencia de las tres variantes de EfficientFormer sí permiten una comparación interna:

| Variante | Top-1 ImageNet | Latencia portable (ms) | Peak MiB |
|---|---|---|---|
| L1 | 81,14% | 3,72 | 93 |
| L3 | 83,16% | 6,37 | 161 |
| L7 | 84,38% | 9,65 | 300 |

La ganancia de precisión de L1 a L7 es de 3,24 puntos porcentuales a cambio de 2,6x más latencia y 3,2x más memoria. Comparativa con modelos de terceros: no disponible.

## Limitaciones y advertencias

- Modelo de clasificación de imagen exclusivamente; no genera texto ni soporta tareas multimodales.
- Entrada fija de 224x224: no admite resoluciones variables sin reentrenamiento o adaptación.
- Solo 1.000 clases de ImageNet; para dominios específicos requiere fine-tuning.
- Tier experimental dentro de fastforks y backend único `portable`; los kernels del backend `kernels` no están disponibles para este modelo (celdas marcadas con "–").
- Riesgo de sesgo heredado de ImageNet-1k: desequilibrios de clase y sesgos culturales/geográficos en las imágenes de entrenamiento.
- Riesgo de alucinación en el sentido de clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- La model card advierte de que el paquete es de uso de investigación y que deben revisarse las cadenas de licencia originales antes de cualquier otro uso, aunque los pesos figuran como Apache-2.0 y con uso comercial permitido.
- No se documentan idiomas ni capacidades multilingües (no aplica).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fastforks/efficientformer
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original (timm, commit `0df212b369a5`): https://github.com/huggingface/pytorch-image-models
- Pesos L1: https://huggingface.co/timm/efficientformer_l1.snap_dist_in1k
- Pesos L3: https://huggingface.co/timm/efficientformer_l3.snap_dist_in1k
- Pesos L7: https://huggingface.co/timm/efficientformer_l7.snap_dist_in1k
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Card de referencia (licencia): https://huggingface.co/timm/efficientformer_l1.snap_dist_in1k/blob/8738a58190800aaf5995f453b05f643df453a565/README.md
