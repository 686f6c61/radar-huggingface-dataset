# BiliSakura/AnyUp-transformers

## Resumen

AnyUp es un modelo de upsampling universal de características para visión por computador, desarrollado por Thomas Wimmer y colaboradores (presentado como ICLR 2026 Oral). El modelo toma un mapa de características de baja resolución procedente de cualquier encoder de visión (DINO, CLIP, SAM, ResNet, etc.) y lo re-muestrea a una resolución espacial superior, guiado por una imagen RGB de alta resolución. No está atado a un encoder específico: los mismos pesos funcionan con números arbitrarios de canales y resoluciones, lo que lo convierte en una herramienta versátil para integrar en pipelines de visión.

La implementación publicada en Hugging Face por BiliSakura es una conversión fiel de los pesos oficiales (`anyup_paper.pth` y `anyup_multi_backbone.pth`) al formato Transformers, con `config.json`, `model.safetensors`, procesador de imágenes y pipeline registrado. Se cargan con `trust_remote_code=True`. La arquitectura emplea atención cruzada multi-cabeza con ventanas (windowed multi-head cross-attention), con una variante opcional basada en NATTEN para mayor eficiencia. El tamaño exacto del modelo (número de parámetros) no se indica en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención cruzada multi-cabeza con ventanas (windowed multi-head cross-attention); opcionalmente NATTEN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, procesa imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesa imágenes; la documentación está en inglés) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AnyUp es un modelo de atención cruzada que combina dos entradas: un mapa de características de baja resolución `(B, C, h, w)` y una imagen RGB de alta resolución que actúa como guía. Internamente, la imagen guía se procesa con un encoder (no especificado en la documentación) y sus características se utilizan para atender a las características de baja resolución mediante atención multi-cabeza con ventanas. La salida es un mapa de características upsampled `(B, C, H, W)` donde `H` y `W` coinciden con la resolución de la imagen guía, o con una resolución personalizada si se especifica `output_size`.

Se publican dos checkpoints: `anyup`, entrenado con características de DINOv2 ViT-S/14 (el modelo del paper), y `anyup-multi-backbone`, entrenado con una mezcla de DINOv2 (S), DINOv2-R (S), CLIP (B), SigLIP (B) y ViT-B. No se detallan los datos de entrenamiento (número de imágenes, composición del dataset, ni si hubo fases de RLHF/DPO, que no aplican a un modelo de visión). La conversión a Hugging Face mantiene las claves del checkpoint idénticas al árbol `nn.Module` original, por lo que es una carga estricta mediante `load_state_dict`. El parámetro `q_chunk_size` permite controlar el equilibrio entre velocidad y memoria: para atención multi-cabeza se refiere a tokens de consulta, mientras que para NATTEN se refiere a filas de baja resolución.

## Capacidades

- Upsampling universal de características de visión: acepta mapas de características de cualquier encoder (DINO, CLIP, SAM, ResNet, etc.) con cualquier número de canales y resoluciones.
- Guiado por imagen RGB de alta resolución: la imagen guía proporciona contexto espacial para el re-muestreo.
- Generalización a características no vistas: los mismos pesos funcionan con encoders no incluidos en el entrenamiento.
- Salida a resolución personalizada: permite especificar `output_size` para adaptarse a necesidades concretas (por ejemplo, parches de 14 píxeles en una tesela de 2016 píxeles → 144×144).
- Compatible con el pipeline `image-feature-extraction` de Transformers, cargable mediante `trust_remote_code=True`.
- Soporte opcional de NATTEN: kernel de atención con ventanas más eficiente en memoria y velocidad, activable mediante `model.enable_natten()` o `use_natten=True`.
- Procesamiento de tensores ya normalizados con ImageNet: se puede omitir el procesador si la entrada ya está normalizada.

## Casos de uso

- Segmentación semántica: upsampling de los mapas de características de baja resolución de un backbone (por ejemplo, DINOv2) a la resolución completa de la imagen para alimentar decodificadores densos que requieren alta resolución espacial.
- Detección de objetos: refinar las características de propuestas de regiones (ROI) mediante upsampling guiado por la imagen original, mejorando la precisión de los bounding boxes.
- Estimación de profundidad: re-muestrear características de baja resolución de un encoder ligero para producir mapas de profundidad densos y de alta resolución.
- Superresolución: guiar el upsampling de características latentes con la imagen de baja resolución como referencia, facilitando la reconstrucción de imágenes de alta resolución.
- Segmentación de imágenes médicas: upsampling de características de encoders pre-entrenados en dominios específicos (por ejemplo, radiografías) para segmentar estructuras anatómicas con detalle fino.
- Visión robótica en tiempo real: combinar encoders rápidos con AnyUp para procesar imágenes de alta resolución en sistemas embebidos, aprovechando la variante NATTEN o la implementación MLX para dispositivos Apple Silicon.
- Integración en pipelines de Transformers: al ser compatible con el pipeline `image-feature-extraction`, se puede insertar directamente en flujos existentes de Hugging Face para extraer características upsampled.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación menciona que AnyUp logra "state-of-the-art performance" en el paper, pero no se proporcionan cifras concretas (MMLU, HumanEval, etc.) en la model card ni en los resultados de búsqueda. No se incluyen comparativas numéricas con otros métodos de upsampling.

## Requisitos de hardware

No se dispone de información detallada sobre requisitos de hardware. La documentación solo indica que la activación de NATTEN requiere una compilación específica que coincida con las versiones de CUDA y PyTorch del entorno. No se especifican valores de VRAM, GPUs recomendadas, latencia o throughput. Dado que el modelo procesa imágenes y no texto, su huella de memoria dependerá del tamaño de la imagen guía y del número de canales de las características de entrada. Se recomienda probar en GPUs con al menos 8 GB de VRAM para resoluciones moderadas, aunque este dato no está confirmado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen otros métodos de upsampling de características en la literatura (por ejemplo, CARAFE, FPN, o atención deformable), pero no se han incluido datos comparativos en la model card ni en los resultados de búsqueda. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La calidad del upsampling depende de la calidad y resolución de la imagen guía; si la guía es de baja calidad, el resultado puede verse afectado.
- El checkpoint `anyup` está entrenado únicamente con características de DINOv2 ViT-S/14; el checkpoint `anyup-multi-backbone` cubre un conjunto más amplio de backbones, pero puede no generalizar perfectamente a encoders muy diferentes a los vistos durante el entrenamiento.
- NATTEN es un componente opcional que no está incluido en `model.safetensors`; su activación requiere una compilación específica de NATTEN compatible con CUDA y PyTorch, lo que puede complicar el despliegue en entornos controlados.
- No se proporcionan métricas de rendimiento ni benchmarks, por lo que es difícil evaluar objetivamente su eficacia frente a alternativas.
- La licencia CC BY 4.0 permite uso comercial siempre que se atribuya la autoría, pero conviene revisar los términos completos de la licencia.
- El modelo está pensado para tareas de visión; no tiene capacidades de generación de texto ni procesamiento de lenguaje natural.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/BiliSakura/AnyUp-transformers
- Paper original (arXiv): https://arxiv.org/abs/2510.12764
- Código oficial en GitHub: https://github.com/wimmerth/anyup
- Perfil del autor de la conversión: https://huggingface.co/BiliSakura
