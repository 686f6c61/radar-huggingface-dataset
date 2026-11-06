# fastforks/sam

## Resumen

SAM (Segment Anything Model) es un modelo de segmentación de imágenes prompable presentado por Meta AI Research (Kirillov et al., 2023). Resuelve el problema de la segmentación "zero-shot": dado un prompt (un punto, una caja o una máscara de baja resolución), devuelve máscaras de alta calidad para el objeto indicado sin necesidad de reentrenamiento específico por tarea. Su relevancia radica en que unifica la segmentación interactiva bajo una única arquitectura entrenada sobre el mayor dataset de máscaras publicado hasta la fecha, SA-1B.

Esta ficha corresponde al repositorio `fastforks/sam`, un paquete de terceros (fastforks) que no aloja pesos propios: descarga los checkpoints originales de Meta desde los enlaces oficiales y verifica su integridad mediante SHA-256. Ofrece tres variantes del encoder ViT (B, L y H) con backend PyTorch portable y un backend de kernels CUDA propios (`dpt_fused`).

La arquitectura combina un encoder de imagen ViT con atención global y ventanas, junto con un prompt encoder y un mask decoder ligeros. El encoder de imagen, que es la parte costosa, es el componente exportado como `module()` portable; el decoder de máscaras se ejecuta por prompt. El modelo es adecuado para pipelines de visión por computador que requieran segmentación interactiva o generación masiva de máscaras.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer ViT (encoder de imagen) + prompt encoder + mask decoder ligero |
| Parámetros totales | no disponible (tres variantes ViT: B, L, H) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen redimensionada a 1024x1024) |
| Tipos de cuantización | fp16 (por defecto en GPU), fp32 (CPU y referencia); no se documentan otras |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 (código y checkpoints) |
| Formato de pesos | `.pth` (PyTorch, descargados desde los enlaces oficiales de Meta) |

## Arquitectura y entrenamiento

SAM es un transformer de visión con tres componentes: un encoder de imagen ViT (con atención por ventanas y atención global, más posiciones relativas), un prompt encoder ligero que codifica puntos, cajas o máscaras, y un mask decoder que produce máscaras y puntuaciones de calidad (`iou_scores`). Las variantes disponibles son `sam-vit-b`, `sam-vit-l` y `sam-vit-h`, con encoders de tamaño creciente. La entrada se redimensiona internamente a 1024x1024; el encoder es el módulo portable exportado.

El entrenamiento se realizó sobre SA-1B, un dataset de 11 millones de imágenes con licencia y 1.100 millones de máscaras generadas automáticamente, según el paper original. El dataset está bajo la licencia de investigación SA-1B, mientras que los checkpoints y el código se publican bajo Apache-2.0. El repositorio de fastforks no aporta información adicional sobre el proceso de entrenamiento (RLHF, DPO u otros), por lo que no se dispone de más detalles.

## Capacidades

- Segmentación prompable con puntos, cajas o máscaras de entrada.
- Generación de máscaras con puntuaciones de calidad (`pred_masks`, `iou_scores`).
- Segmentación zero-shot sobre objetos no vistos durante el entrenamiento.
- Generación automática de máscaras (mask-generation) sobre una imagen completa.
- Soporte de backend portable (PyTorch) y backend de kernels CUDA propios (`dpt_fused`).
- Ejecución en GPU (CUDA) o CPU; fp16 por defecto en GPU.
- No dispone de tool calling, agentes, capacidades multilingües ni modo de razonamiento.

## Casos de uso

- Anotación asistida de datasets de visión: un operador hace clic en un objeto y el modelo devuelve la máscara, reduciendo el tiempo de etiquetado frente a la anotación manual polígono a polígono.
- Segmentación interactiva en herramientas de edición de imagen: el usuario selecciona con un punto o caja y el modelo genera la máscara del objeto para recorte o retoque.
- Generación masiva de máscaras para preentrenamiento: usar la modalidad de mask-generation para producir miles de máscaras por imagen y alimentar modelos downstream de detección o clasificación.
- Segmentación en pipelines de visión industrial: con `sam-vit-b` en backend kernels a ~37 ms por imagen 1024x1024, es viable procesar lotes en tiempo casi real en una GPU consumer.
- Investigación en segmentación zero-shot: servir como baseline o componente de comparación frente a modelos más recientes (por ejemplo SAM 3, mencionado en la model card para prompts de texto).
- Integración en aplicaciones de análisis médico o satelital donde se requiera delimitar regiones de interés con prompts mínimos, siempre que se valide el dominio fuera de SA-1B.

## Benchmarks y rendimiento

Rendimiento medido en RTX 5060 Ti 16 GB (sm_120), imagen sintética 1024x1024, fp16 salvo donde se indica fp32:

| Modelo | Tiempo original fp32 (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs portable | Memoria pico portable (MiB, alloc/reserved) | Memoria pico kernels (MiB, alloc/reserved) |
|---|---|---|---|---|---|---|
| `sam-vit-b` | 172,6 | 48,32 | 36,95 | 1,3x | 378 / 420 | 377 / 420 |
| `sam-vit-h` | 741,9 | 214,48 | 143,13 | 1,5x | 1484 / 2524 | 1480 / 1524 |
| `sam-vit-l` | 414,2 | 115,7 | 81,53 | 1,4x | 833 / 1262 | 831 / 862 |

Tiempos y memoria para resoluciones fijas (tiempo ms / memoria pico allocada / reservada en MiB):

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 |
|---|---|---|---|---|
| `sam-vit-b` | portable | 48,6 / 367 / 482 | 48,6 / 374 / 482 | 49,0 / 387 / 484 |
| `sam-vit-b` | kernels | 37,3 / 364 / 424 | 37,4 / 370 / 404 | 38,1 / 384 / 432 |
| `sam-vit-h` | portable | 216,1 / 1490 / 1882 | 215,4 / 1496 / 1902 | 215,7 / 1510 / 1916 |
| `sam-vit-h` | kernels | 143,6 / 1459 / 1712 | 144,4 / 1466 / 1704 | 145,1 / 1479 / 1714 |
| `sam-vit-l` | portable | 117,2 / 814 / 1052 | 116,5 / 820 / 1060 | 117,5 / 834 / 1048 |
| `sam-vit-l` | kernels | 82,0 / 812 / 930 | 81,6 / 818 / 946 | 83,2 / 833 / 922 |

Precisión respecto al código original: CPU fp32 con diferencia máxima |diff| ≤ 0,002; GPU fp16 con diferencia media ≤ 3 % y p99 ≤ 15 % del valor mediano de referencia.

## Requisitos de hardware

- VRAM estimada: `sam-vit-b` ~0,4 GiB en 1080x1920 fp16; `sam-vit-l` ~0,8 GiB; `sam-vit-h` ~1,5 GiB (mediciones del autor en RTX 5060 Ti 16 GB).
- Cabe holgadamente en GPUs consumer: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, RTX 5060 Ti. Incluso `sam-vit-h` ocupa menos de 2 GiB reservados.
- GPUs profesionales: A100, H100, L40S soportadas por el backend portable; el backend kernels requiere arquitectura CUDA precompilada y driver NVIDIA reciente.
- Despliegue: paquete `fastforks` (`pip install fastforks`), backend portable PyTorch; el backend kernels descarga binarios precompilados desde `huggingface.co/fastforks/kernels`.
- Latencia: entre ~37 ms (`sam-vit-b` kernels) y ~215 ms (`sam-vit-h` portable) por imagen 1024x1024; el tamaño de entrada no afecta al tiempo porque se redimensiona internamente.
- Arranque: carga entre 0,17 s (kernels, `sam-vit-b`) y 3,53 s (original, `sam-vit-h`).

## Comparativa con modelos similares

| Modelo | Tipo | Encoder | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SAM (este repo, fastforks) | Segmentación prompable | ViT B/L/H | Apache-2.0 | Pesos oficiales de Meta vía enlaces | Repo de terceros con verificación SHA-256 y kernels CUDA propios |
| SAM original (facebookresearch) | Segmentación prompable | ViT B/L/H | Apache-2.0 | GitHub oficial + checkpoints | Código de referencia, sin optimizaciones de fastforks |
| SAM 3 | Segmentación prompable con texto | no disponible | no disponible | Mencionado en la model card | Añade prompts de texto; detalles no disponibles en esta información |
| SAM 2 | Segmentación de vídeo e imagen | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

## Limitaciones y advertencias

- El repositorio no aloja pesos: depende de la disponibilidad de los enlaces de `dl.fbaipublicfiles.com`; si cambian, la descarga falla.
- El dataset SA-1B está bajo licencia de investigación; los checkpoints y el código son Apache-2.0, pero conviene revisar los términos antes de uso comercial en dominios sensibles.
- El backend kernels requiere una arquitectura CUDA precompilada y un driver NVIDIA reciente; en GPUs no cubiertas hay que usar el backend portable.
- El modelo no tiene capacidades lingüísticas ni de razonamiento; no admite tool calling ni agentes.
- Riesgo de máscaras imprecisas en objetos muy pequeños, oclusiones complejas o dominios alejados de SA-1B (médico, satelital, microscopía).
- La model card no documenta sesgos específicos ni evaluación por subgrupos; no se dispone de esa información.
- La variante `sam-vit-h` consume más memoria reservada en el backend portable (hasta ~2,5 GiB) que en kernels (~1,5 GiB), lo que puede afectar a despliegues con VRAM ajustada.
- El paquete es de terceros: la paridad con el código original está verificada (≤ 0,002 en CPU fp32, ≤ 3 % medio en GPU fp16), pero no sustituye a una validación propia en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fastforks/sam
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels CUDA: https://huggingface.co/fastforks/kernels
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Card TOML con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/promptable_segmentation/models/sam/card.toml
- Código original de Meta: https://github.com/facebookresearch/segment-anything (commit `dca509f`)
- Pesos `sam-vit-b`: https://dl.fbaipublicfiles.com/segment_anything/sam_vit_b_01ec64.pth
- Pesos `sam-vit-h`: https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth
- Pesos `sam-vit-l`: https://dl.fbaipublicfiles.com/segment_anything/sam_vit_l_0b3195.pth
- Paper: Kirillov et al., "Segment Anything" (2023), https://arxiv.org/abs/2304.02643
