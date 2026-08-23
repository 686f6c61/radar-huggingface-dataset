# honeysandhu/sam3.1-int8-int4-convrot

## Resumen

SAM 3.1 Multiplex es la última versión del modelo de segmentación Segment Anything de Meta, que permite segmentar y rastrear objetos en imágenes y vídeo mediante prompts de texto, puntos, cajas o máscaras. El repositorio `honeysandhu/sam3.1-int8-int4-convrot` ofrece dos cuantizaciones nativas para ComfyUI del checkpoint oficial `facebook/sam3.1`: una variante INT8 (W8A8) de 1,19 GiB y una INT4 (W4A4) de 0,98 GiB, ambas obtenidas mediante la técnica ConvRot (transformada de Hadamard por bloques) aplicada selectivamente a los pesos lineales del transformer, mientras que las capas sensibles (CLIP, normalizaciones, cabezas de máscara) se mantienen en FP16.

El objetivo principal es reducir el tamaño del modelo y acelerar la inferencia sin degradar significativamente la calidad de las máscaras generadas. Según las pruebas del autor, la variante INT8 alcanza un IoU de 0,99765 respecto al FP16 en la imagen de demostración oficial, y la INT4 un IoU de 0,99652, con una reducción de tamaño del 63-70% frente al fuente FP32 de Meta. La relevancia actual radica en que ComfyUI incorporó soporte nativo para ConvRot en sus versiones v0.27.0 (INT8) y v0.28.0 (INT4), eliminando la necesidad de nodos de cuantización personalizados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de visión (SAM 3.1 Multiplex, de Meta) |
| Parámetros totales | No disponible (aprox. 3.500 millones según tamaño del checkpoint FP32 de 3,26 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de segmentación de imágenes, no de texto) |
| Tipos de cuantización | INT8 W8A8 (ConvRot) e INT4 W4A4 (ConvRot) |
| Idiomas soportados | No disponible (acepta prompts de texto en inglés, sin especificación multilingüe) |
| Licencia | sam-license (licencia de Meta para SAM, no comercial estándar) |
| Formato de pesos | safetensors (dos archivos: `sam3.1_multiplex_int8_convrot_selective_fp16clip_fp32source.safetensors` y `sam3.1_multiplex_w4a4_convrot_selective_fp16clip_fp32source.safetensors`) |

## Arquitectura y entrenamiento

SAM 3.1 Multiplex es una evolución de SAM 3, desarrollado por Meta AI, diseñado para segmentación promptable en imágenes y vídeo. A diferencia de versiones anteriores, incorpora "Object Multiplex", que permite rastrear múltiples objetos simultáneamente en secuencias de vídeo de forma más eficiente. La arquitectura combina un codificador de imagen (tipo ViT), un codificador de prompts (texto, puntos, cajas) y un decodificador de máscaras, con un módulo de seguimiento temporal para vídeo.

La cuantización ofrecida en este repositorio se basa en el checkpoint FP32 oficial de Meta (`sam3.1_multiplex.pt`, tamaño 3.502.755.717 bytes). El proceso de conversión, para cada uno de los 230 pesos lineales elegibles, realiza: (1) upcast a FP32, (2) transformación ConvRot por bloques (Hadamard), (3) selección de escala de recorte optimizada por MSE, y (4) almacenamiento de escalas por fila y metadatos de cuantización nativos de ComfyUI. La cuantización de activaciones es dinámica (W8A8 o W4A4), sin necesidad de conjunto de calibración incrustado. Los tensores no seleccionados se guardan en FP16, incluido el codificador CLIP para compatibilidad con ComfyUI estándar.

## Capacidades

- Segmentación promptable de imágenes: acepta prompts de texto, puntos, cajas y máscaras para segmentar objetos concretos.
- Seguimiento de objetos en vídeo (Object Multiplex): rastrea múltiples objetos simultáneamente en secuencias de vídeo, una novedad de SAM 3.1.
- Segmentación de vocabulario abierto: puede segmentar todas las instancias de un concepto especificado por una frase de texto corta, manejando más de 50x más conceptos que SAM 2.
- Refinamiento de máscaras: soporta pasos de refinamiento adicionales para mejorar la calidad de los bordes de las máscaras.
- Compatibilidad nativa con ComfyUI: carga mediante el nodo estándar `Load Checkpoint`, sin nodos de cuantización personalizados.
- Cuantización selectiva: mantiene en FP16 las capas sensibles (embeddings, normalizaciones, convoluciones, cabezas de geometría y máscara, proyecciones finales) para preservar la calidad.

## Casos de uso

- **Edición de imágenes en ComfyUI**: el modelo puede generar máscaras precisas de objetos en fotografías para su posterior edición (eliminación de fondo, reemplazo de objetos, ajustes selectivos). Con la cuantización INT8, la carga es más rápida y la inferencia un 14,8% más rápida que FP16 en una RTX 3090, ideal para flujos de trabajo interactivos.
- **Seguimiento de objetos en vídeo**: gracias a Object Multiplex, permite rastrear varios objetos a la vez en secuencias de vídeo, útil para anotación de datos de entrenamiento o análisis de vídeo en tiempo real.
- **Segmentación de conceptos de vocabulario abierto**: puede segmentar todas las instancias de un concepto descrito por texto (p. ej., "coches rojos") sin entrenamiento adicional, útil para búsqueda visual y etiquetado automático.
- **Generación de máscaras para datasets**: puede usarse en pipelines de preprocesado para crear máscaras de segmentación para entrenar otros modelos, aprovechando el tamaño reducido para desplegar en entornos con poca memoria.
- **Automatización de flujos de trabajo en ComfyUI**: los archivos se cargan con el nodo estándar `Load Checkpoint`, por lo que se integran fácilmente en pipelines existentes de ComfyUI para procesamiento por lotes de imágenes.
- **Prototipado rápido en investigación**: dado que mantiene un IoU superior a 0,99 respecto al FP16, sirve para experimentos donde la precisión de la máscara es crítica pero se requiere velocidad o menor uso de memoria, como en aplicaciones de tiempo real.

## Benchmarks y rendimiento

La model card incluye pruebas de calidad y rendimiento realizadas por el autor:

**Calidad (IoU binario de máscara) en imagen `truck.jpg` de Meta, prompt `truck`, umbral 0.3, dos pasos de refinamiento:**

| Comparación | IoU |
|---|---|
| FP16 vs. FP32 fuente | 0,99999 |
| INT8 vs. FP16 | 0,99765 |
| INT4 vs. FP16 | 0,99652 |
| INT4 vs. INT8 | 0,99716 |

En una prueba separada con seis personas y refinamiento desactivado, el IoU de unión de máscaras respecto a FP16 fue de 0,99882 para INT8 y 0,9849 para INT4 (dato incompleto en la fuente).

**Rendimiento de inferencia (mediana de cuatro ejecuciones, RTX 3090, PyTorch 2.11 + CUDA 13.0, comfy-kitchen 0.2.22, entrada 1280×720, seis personas detectadas, umbral 0.3, dos pasos de refinamiento):**

| Checkpoint | Mediana | Diferencia vs. FP16 |
|---|---|---|
| FP16 | 1,933 s | — |
| INT8 | 1,647 s | 14,8% más rápido |
| INT4 | 1,396 s | 27,8% más rápido |

Con refinamiento desactivado, el perfil de operadores CUDA mostró una reducción del tiempo total de GPU de aproximadamente 17,5% para INT8, y una reducción del 32% en las operaciones lineales elegibles. En flujos de trabajo de un solo objeto, las mediciones de FP16 e INT8 rondaban ambas los 0,6–0,7 s, por lo que la aceleración no está garantizada en todos los escenarios.

## Requisitos de hardware

- **VRAM estimada**: el modelo INT8 ocupa 1,19 GiB y el INT4 0,98 GiB en disco; la VRAM de inferencia depende de la resolución de entrada y del número de objetos. En una RTX 3090 (24 GB) se ejecuta sin problemas, y en GPUs con 8 GB de VRAM (p. ej., RTX 3070, RTX 4060) también debería funcionar, especialmente con la variante INT4.
- **GPU recomendadas**: cualquier GPU compatible con CUDA (NVIDIA) o AMD con ROCm, siempre que ComfyUI v0.28.0+ (para INT4) o v0.27.0+ (para INT8) esté instalado. En hardware Turing o AMD, se recomienda mantener ComfyUI y `comfy-kitchen` actualizados para corregir backends de multiplicación de matrices.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de consumo como la RTX 3090, RTX 4070, etc., gracias a su pequeño tamaño.
- **Opciones de despliegue**: ComfyUI (con nodo `Load Checkpoint`), también compatible con `extra_model_paths.yaml` para directorios personalizados. No se recomienda usar cargadores INT8 antiguos.
- **Latencia y throughput**: los benchmarks muestran 1,647 s (INT8) y 1,396 s (INT4) en una RTX 3090 con entrada 1280×720 y seis objetos. Para un solo objeto, alrededor de 0,6–0,7 s. La velocidad varía según la resolución, el número de detecciones y los pasos de refinamiento.

## Comparativa con modelos similares

| Modelo | Tamaño (checkpoint) | Cuantización | IoU vs. FP16 | Licencia | Despliegue |
|---|---|---|---|---|---|
| SAM 3.1 Multiplex FP16 (oficial) | 1,63 GiB | FP16 | — | sam-license | ComfyUI, PyTorch |
| SAM 3.1 INT8 ConvRot (este repo) | 1,19 GiB | INT8 W8A8 | 0,99765 | sam-license | ComfyUI nativo |
| SAM 3.1 INT4 ConvRot (este repo) | 0,98 GiB | INT4 W4A4 | 0,99652 | sam-license | ComfyUI nativo |
| SAM 3.0 (versión anterior) | ~3,5 GB (FP32) | FP32 | — | sam-license | PyTorch, ComfyUI |

No se dispone de comparativas con otros modelos de segmentación como SAM 2 o Grounding DINO, ya que la información proporcionada no incluye benchmarks frente a ellos. La principal diferencia frente a SAM 3.0 es la capacidad de seguimiento de vídeo (Object Multiplex) y la mejora en la segmentación de conceptos de vocabulario abierto.

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia `sam-license` de Meta no permite uso comercial sin autorización expresa; es una licencia de investigación no estándar.
- **Calidad de cuantización**: aunque el IoU es alto (0,99+), hay una ligera degradación en comparación con FP16, especialmente en la variante INT4 (IoU 0,99652 vs. 0,99765). Para aplicaciones de alta precisión médica o industrial, se recomienda validar en el dominio de uso.
- **Seguimiento de vídeo no probado**: el autor señala que el checkpoint contiene pesos de seguimiento de vídeo, pero no ha sido sometido al mismo nivel de pruebas que la segmentación de imágenes; puede haber errores en ese modo.
- **Rendimiento variable**: la aceleración no está garantizada; en flujos de trabajo simples la diferencia entre FP16 e INT8 es mínima. El rendimiento depende de la GPU, la resolución y el número de objetos.
- **Requisitos de versión**: se necesita ComfyUI v0.27.0+ para INT8 y v0.28.0+ para INT4; en hardware sin soporte de multiplicación INT4, ComfyUI puede degradar a INT8, reduciendo los beneficios.
- **Idioma de prompts**: no se especifica soporte multilingüe; los prompts de texto probablemente funcionan mejor en inglés, dado el entrenamiento de Meta.
- **Sesgos y alucinaciones**: no se han documentado sesgos específicos en la model card, pero como modelo de segmentación, puede fallar en objetos poco comunes o con prompts ambiguos. No hay riesgo de alucinación textual, pero sí de máscaras incorrectas en escenarios complejos.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/honeysandhu/sam3.1-int8-int4-convrot
- Repositorio de Meta SAM 3 (GitHub): https://github.com/facebookresearch/sam3
- Notas de lanzamiento de SAM 3.1: https://github.com/facebookresearch/sam3/blob/main/RELEASE_SAM3p1.md
- Checkpoint oficial de Meta en HuggingFace: https://huggingface.co/facebook/sam3.1
- Versión similar de Sparknight en HuggingFace: https://huggingface.co/Sparknight/sam3.1-int8-int4-convrot
- Página del modelo en Civitai: https://civitai.com/models/2823010/sam-31-int8-int4-native-convrot
- Modelo de SAM 3.1 en ModelScope: https://www.modelscope.cn/models/facebook/sam3.1
- Lanzamiento de ComfyUI v0.27.0 (soporte INT8): https://github.com/Comfy-Org/ComfyUI/releases/tag/v0.27.0
- Lanzamiento de ComfyUI v0.28.0 (soporte INT4): https://github.com/Comfy-Org/ComfyUI/releases/tag/v0.28.0
