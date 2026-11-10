# radical-ai/semsketch

## Resumen

SemSketch es un extractor de características visuales desarrollado por Radical-AI como componente del proyecto SemSketch, una herramienta de segmentación interactiva orientada a imágenes de microscopía. El modelo parte del backbone DINOv3 ViT-S/16 de Meta (`timm/vit_small_patch16_dinov3.lvd1689m`) y lo modifica sustituyendo los embeddings posicionales rotatorios (RoPE) por un sesgo de distancia ALiBi compartido, para después destilarlo sobre OpenImages a resolución de 512 píxeles durante 20 épocas.

La motivación técnica es concreta: al eliminar las posiciones absolutas, las características densas del modelo se mantienen consistentes ante cambios arbitrarios de tamaño de imagen y recortes, algo crítico en flujos de segmentación interactiva donde el usuario aplica crops y zoom sobre regiones de la imagen. El checkpoint publicado es el de entrenamiento sin modificar, con los pesos bajo la clave `model` junto con metadatos de entrenamiento y estado del optimizador.

Es relevante para quien necesite un embedder de parches robusto a variaciones de escala en pipelines de visión por computador, especialmente en microscopía, aunque su uso está condicionado por la licencia DINOv3 y por el hecho de que el sesgo ALiBi no vive en el checkpoint sino en el código de SemSketch, lo que obliga a usar su loader para obtener características fieles al entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-S/16) derivado de DINOv3, con RoPE eliminado y sesgo ALiBi compartido en atención |
| Parametros totales | no disponible (backbone ViT-S/16; el repo pesa 0,4 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrenado a 512 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | DINOv3 License (etiquetada como `other`; no es la GPL de SemSketch) |
| Formato de pesos | checkpoint PyTorch `.pth` (`alibi_dv3_vits16_best.pth`, 359.784.265 bytes) |

## Arquitectura y entrenamiento

El modelo es un ViT-S/16 (patch de 16x16, variante small de DINOv3) al que se le han retirado los embeddings posicionales rotatorios propios de DINOv3 y se les ha sustituido por un sesgo de distancia ALiBi compartido entre cabezas de atención. Ese sesgo no forma parte del fichero de pesos: se implementa en `semsketch.model.feats.upsampler.SharedAlibiBias`, por lo que cargar el checkpoint con `timm` y poner `model.rope = None` deja el modelo sin información posicional a menos que se use el loader de SemSketch. El resultado es un extractor cuyas características densas no dependen de posiciones absolutas y se mantienen estables ante cambios de resolución y recortes.

El entrenamiento consistió en una destilación sobre OpenImages a 512 píxeles durante 20 épocas, partiendo del backbone DINOv3 preentrenado. La model card no detalla el número de tokens vistos, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO (no aplicables a un extractor de características). El checkpoint publicado conserva metadatos de entrenamiento y estado del optimizador, lo que permite reanudar o inspeccionar el proceso. En el pipeline por defecto de SemSketch (`dino+ssd1b+sam3+vulture`), este checkpoint se usa con upsampling bilineal; las demás fuentes de características (SSD-1B, SAM3, Vulture) provienen de sus repositorios originales y no se alojan aquí.

## Capacidades

- Extracción de características densas por parche para imágenes, con pipeline `image-feature-extraction`.
- Consistencia de características ante cambios arbitrarios de tamaño de imagen y recortes, gracias a la ausencia de posiciones absolutas.
- Segmentación interactiva como parte del pipeline SemSketch (combinado con SSD-1B, SAM3 y Vulture).
- Integración con `timm` mediante `create_model("vit_small_patch16_dinov3.lvd1689m", pretrained=False, num_classes=0, dynamic_img_size=True)`.
- Soporte de tamaño de imagen dinámico (`dynamic_img_size=True`).
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües: es exclusivamente un modelo visual.

## Casos de uso

- Segmentación interactiva de imágenes de microscopía: el embedder alimenta el pipeline de SemSketch para que el usuario seleccione regiones y el modelo proponga máscaras, aprovechando que las características no se degradan al hacer zoom o recortar la imagen.
- Preprocesado de imágenes histológicas en pipelines de análisis: extracción de features por parche para clasificación o detección aguas abajo, con independencia de la resolución de captura del microscopio.
- Segmentación de objetos en imágenes aéreas o satelitales con recortes de distinto tamaño: la invariancia a posición absoluta evita artefactos al aplicar tiles de dimensiones variables.
- Indexación y búsqueda visual por similitud: las features densas sirven como embedding para recuperación de imágenes médicas o científicas en bases de datos.
- Anotación asistida en herramientas de etiquetado: el modelo actúa como backend de un segmentador interactivo que reduce el esfuerzo manual en datasets de imagen científica.
- Investigación en representaciones visuales invariantes a traslación: el checkpoint permite estudiar el efecto de sustituir RoPE por ALiBi en ViTs pequeños con un punto de partida reproducible.
- Extracción de features para modelos de downstream con resolución variable: al usar `dynamic_img_size=True`, se puede alimentar el backbone con imágenes de tamaños no vistos durante el entrenamiento sin reescalar a 512 px.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint ocupa 0,4 GB, por lo que un ViT-S/16 en fp32 requiere del orden de 1-2 GB de VRAM para lotes pequeños, pero no hay cifras oficiales.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU con al menos 4 GB de VRAM debería poder ejecutar el backbone.
- Cabe en GPU de consumo: previsiblemente sí (ViT-S/16 es un modelo pequeño), aunque no hay confirmación del autor.
- Opciones de despliegue: `timm` + PyTorch (vía `hf_hub_download` y `torch.load`); el loader de SemSketch es necesario para reproducir el sesgo ALiBi. No se documentan exportaciones a ONNX, GGUF ni integraciones con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Posicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SemSketch (este) | ViT-S/16 | 512 px entrenamiento, tamaño dinámico | ALiBi compartido, sin RoPE | DINOv3 License | Hugging Face |
| `timm/vit_small_patch16_dinov3.lvd1689m` | ViT-S/16 | 512 px | RoPE (DINOv3 original) | DINOv3 License | Hugging Face / timm |
| DINOv2 ViT-S/14 | ViT-S/14 | 518 px | Embeddings posicionales aprendidos | Apache 2.0 (DINOv2) | Hugging Face |

La comparación con DINOv2 se ofrece como referencia de categoría (ViT small para features densas), pero no se dispone de métricas comparativas publicadas para este checkpoint.

## Limitaciones y advertencias

- El sesgo ALiBi no está en el checkpoint: cargarlo solo con `timm` y `model.rope = None` produce features que no coinciden con el entrenamiento. Es obligatorio usar el loader de SemSketch.
- Licencia DINOv3: los pesos son derivados de Meta DINOv3 y se distribuyen bajo la DINOv3 License, no bajo la GPL de SemSketch. Revisar las condiciones antes de uso comercial.
- Modelo especializado en extracción de features y segmentación; no genera texto ni soporta instrucciones en lenguaje natural.
- Entrenado sobre OpenImages a 512 px: puede degradarse en dominios muy alejados (microscopía de modalidades no representadas, imágenes médicas con distribuciones distintas).
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de segmentaciones incorrectas en regiones ambiguas o de bajo contraste.
- No se documentan sesgos demográficos ni de otro tipo, ni evaluaciones de robustez fuera del dominio de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.
- El fichero incluye estado del optimizador y metadatos de entrenamiento, lo que aumenta el tamaño respecto a un checkpoint de solo pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/radical-ai/semsketch
- Repositorio SemSketch: https://github.com/Radical-AI/SemSketch
- Licencia DINOv3: https://huggingface.co/radical-ai/semsketch/blob/main/LICENSE-DINOv3.md
- Modelo base en timm: https://huggingface.co/timm/vit_small_patch16_dinov3.lvd1689m
