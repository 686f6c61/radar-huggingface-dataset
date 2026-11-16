# fastforks/efficientformerv2

## Resumen

EfficientFormerV2 es una familia de clasificadores de imágenes móviles desarrollada originalmente por Snap Research (Li et al., 2022). Combina etapas convolucionales con atención en las dos últimas etapas, lo que le permite mantener la eficiencia de una CNN en hardware móvil sin renunciar a la capacidad de modelado global de los transformers. El repositorio `fastforks/efficientformerv2` no contiene pesos propios: es una model card que actúa como envoltorio de los pesos oficiales publicados en los repositorios `timm`, verificados mediante SHA-256.

El modelo resuelve clasificación de imágenes sobre ImageNet-1k (ILSVRC 2012) y devuelve logits de 1000 clases. Se distribuye en cuatro variantes (L, S0, S1, S2) con distintos compromisos entre precisión y coste computacional. La entrada es fija a 224x224 píxeles RGB, con redimensionado del lado corto a 235 y recorte central.

La relevancia actual reside en su perfil de despliegue: es un clasificador ligero, con licencia Apache-2.0 y pesos en safetensors, que cabe en GPUs de consumo con un consumo de memoria inferior a 200 MiB en la variante más grande. El paquete `fastforks` añade una capa de verificación de integridad y benchmarks reproducibles sobre RTX 5060 Ti (sm_120), incluyendo comparativas con `torch.compile` y TensorRT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida convolucional + atención (EfficientFormerV2, Li et al. 2022) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imagen, entrada fija 224x224) |
| Tipos de cuantizacion | fp32, fp16 (probado); otras no disponibles |
| Idiomas soportados | no aplica (visión; etiquetas ImageNet-1k en inglés) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | safetensors (verificados por SHA-256) |

Variantes disponibles: `efficientformerv2_l`, `efficientformerv2_s0`, `efficientformerv2_s1`, `efficientformerv2_s2`, todas con sufijo `.snap_dist_in1k`.

## Arquitectura y entrenamiento

EfficientFormerV2 es una red híbrida: las primeras etapas usan bloques convolucionales (más eficientes en hardware móvil) y las dos últimas incorporan mecanismos de atención para capturar dependencias globales. Esta combinación busca el equilibrio entre el coste de una ViT pura y la capacidad representacional de la atención. El modelo se entrena sobre ImageNet-1k (ILSVRC 2012) para clasificación de 1000 clases.

El sufijo `snap_dist_in1k` indica que los pesos de `timm` corresponden a la versión destilada de Snap Research sobre ImageNet-1k. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, composición del dataset más allá de ImageNet-1k, ni detalles sobre RLHF/DPO (no aplicables a un clasificador). El repositorio `fastforks` no reentrena: descarga los pesos originales, verifica su SHA-256 y expone benchmarks de inferencia con backend `portable` (fp16) y comparativas con `torch.compile` y TensorRT.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1k; salida como logits.
- Entrada de una única imagen RGB a resolución fija 224x224 (redimensionado lado corto 235 + recorte central).
- Inferencia en fp32 y fp16; soporte de `torch.compile` y exportación a TensorRT fp16.
- Backend `portable` del paquete `fastforks`, con verificación de integridad de pesos por SHA-256.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo generativo ni multilingüe: no procesa texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- Moderación de contenido visual a gran escala: el modelo clasifica imágenes en 1000 categorías con latencias de 0,55–1,20 ms por imagen en TensorRT fp16 (variantes S0–L), lo que permite procesar lotes masivos en pipelines de moderación.
- Etiquetado automático de catálogos de producto: la variante S0 (7,62 ms en portable, 44 MiB pico) es adecuada para preetiquetar imágenes de e-commerce antes de revisión humana, con verificación SHA-256 de pesos en cada despliegue.
- Preprocesamiento para sistemas de búsqueda visual: los logits de ImageNet sirven como features o señales auxiliares en pipelines de recuperación de imágenes, con coste de memoria inferior a 200 MiB.
- Clasificación en dispositivos edge con GPU de consumo: la variante L cabe en 93 MiB pico en portable fp16, por lo que puede ejecutarse en GPUs modestas o en entornos con presupuesto de memoria estricto.
- Benchmarking de stacks de inferencia: el repositorio incluye comparativas reproducibles entre código original, backend portable, `torch.compile` y TensorRT, útil para evaluar el rendimiento de un stack antes de comprometerse con él.
- Filtrado previo en datasets de investigación: clasificación rápida de imágenes para separar clases de interés antes de un entrenamiento o anotación más costosa, con licencia Apache-2.0 que permite uso comercial.
- Verificación de integridad en producción: el mecanismo SHA-256 del paquete `fastforks` permite auditar que los pesos desplegados coinciden con los publicados por el autor, útil en entornos regulados.

## Benchmarks y rendimiento

Datos de inferencia sobre RTX 5060 Ti 16 GB (sm_120), entrada 224x224. Tiempos en ms; memoria pico en MiB (allocated / reserved).

| Variante | Original fp32 | Original fp16 | Portable fp16 | `torch.compile` | TensorRT fp16 | Memoria portable |
|---|---|---|---|---|---|---|
| `efficientformerv2_l` | 19,9 ms | 29,0 ms | 17,1 ms | 7,32 ms | 1,20 ms | 93 / 144 |
| `efficientformerv2_s0` | 8,16 ms | 11,8 ms | 7,62 ms | 3,34 ms | 0,550 ms | 44 / 64 |
| `efficientformerv2_s1` | 10,1 ms | 14,9 ms | 8,91 ms | 3,91 ms | 0,632 ms | 50 / 88 |
| `efficientformerv2_s2` | 15,2 ms | 21,8 ms | 13,9 ms | 5,55 ms | 0,919 ms | 64 / 104 |

Tiempos de carga y primera llamada (segundos):

| Variante | Carga original | Carga portable | Primera llamada original | Primera llamada portable |
|---|---|---|---|---|
| `efficientformerv2_l` | 0,32 | 2,74 | 0,73 | 0,43 |
| `efficientformerv2_s0` | 0,17 | 1,88 | 1,76 | 0,50 |
| `efficientformerv2_s1` | 0,19 | 1,96 | 0,59 | 0,43 |
| `efficientformerv2_s2` | 0,24 | 2,68 | 0,86 | 0,44 |

Preparación: `torch.compile` requiere 11,3–20,7 s de primera llamada en frío; ONNX + construcción de engine TensorRT requiere 36,3–45,1 s. Memoria pico con TensorRT: 78–161 MiB (engine + torch).

No se han publicado resultados de precisión (top-1, top-5) en la información disponible; la sección de accuracy de la model card aparece truncada.

## Requisitos de hardware

- VRAM estimada en inferencia: 44–93 MiB pico (portable fp16) según variante; hasta 186 MiB en fp32 original para la variante L.
- GPU recomendadas: cualquier GPU con soporte CUDA y fp16; probado en RTX 5060 Ti 16 GB (sm_120).
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, entre otras.
- Opciones de despliegue: backend `portable` de `fastforks`, código original de `timm` (commit `0df212b369a5`), `torch.compile`, exportación ONNX y TensorRT fp16.
- Throughput estimado (1 imagen por llamada): ~58 img/s en portable (S0), ~83 img/s con `torch.compile` (S0), ~1.818 img/s con TensorRT fp16 (S0). Para la variante L: ~58 img/s portable, ~137 img/s con `torch.compile`, ~833 img/s con TensorRT fp16.
- Latencia: 0,550 ms (S0, TensorRT fp16) a 17,1 ms (L, portable fp16) por imagen.

## Comparativa con modelos similares

No se dispone de datos de precisión ni de comparativas con otros clasificadores en la información proporcionada. A continuación se comparan las variantes entre sí según los datos de rendimiento disponibles:

| Variante | Tiempo portable | Tiempo TensorRT fp16 | Memoria pico portable | Licencia |
|---|---|---|---|---|
| `efficientformerv2_l` | 17,1 ms | 1,20 ms | 93 MiB | Apache-2.0 |
| `efficientformerv2_s0` | 7,62 ms | 0,550 ms | 44 MiB | Apache-2.0 |
| `efficientformerv2_s1` | 8,91 ms | 0,632 ms | 50 MiB | Apache-2.0 |
| `efficientformerv2_s2` | 13,9 ms | 0,919 ms | 64 MiB | Apache-2.0 |

Comparativa con alternativas de la misma categoría (MobileNetV3, EfficientNet, DeiT-Ti): no disponible en la información proporcionada.

## Limitaciones y advertencias

- El repositorio `fastforks/efficientformerv2` no aloja pesos: solo contiene la model card y las referencias con hashes SHA-256. Cualquier uso requiere descargar los pesos desde los repositorios `timm`.
- Entrada fija a 224x224 RGB: no admite resoluciones variables ni otras modalidades.
- Clasificador limitado a 1000 clases de ImageNet-1k; no generaliza a categorías fuera de ese vocabulario sin reentrenamiento.
- Riesgo de sesgos heredados de ImageNet-1k (ILSVRC 2012): desequilibrios de clase y sesgos demográficos y culturales en las etiquetas.
- No es un modelo generativo: no produce texto, no razona y no soporta agentes ni tool calling.
- La model card indica "tier: experimental" y "research-use package"; aunque la licencia es Apache-2.0 y permite uso comercial, el autor recomienda revisar las cadenas de licencia antes de otros usos.
- La sección de accuracy de la model card está truncada en la información disponible; no se pueden validar las métricas de precisión publicadas.
- Los benchmarks se han medido en una única GPU (RTX 5060 Ti, sm_120); el rendimiento en otras arquitecturas puede diferir.
- El backend `kernels` aparece con celdas vacías ("–") en las tablas de rendimiento; no hay datos de su funcionamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/efficientformerv2
- Código del paquete fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original (timm, commit `0df212b369a5`): https://github.com/huggingface/pytorch-image-models
- Pesos variante L: https://huggingface.co/timm/efficientformerv2_l.snap_dist_in1k
- Pesos variante S0: https://huggingface.co/timm/efficientformerv2_s0.snap_dist_in1k
- Pesos variante S1: https://huggingface.co/timm/efficientformerv2_s1.snap_dist_in1k
- Pesos variante S2: https://huggingface.co/timm/efficientformerv2_s2.snap_dist_in1k
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Evidencia de licencia: https://huggingface.co/timm/efficientformerv2_s0.snap_dist_in1k/blob/aa226e91a076e760bc7957e5990f19f6ae322c5f/README.md
