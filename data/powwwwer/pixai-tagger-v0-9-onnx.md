# powwwwer/pixai-tagger-v0.9-onnx

## Resumen

El modelo `powwwwer/pixai-tagger-v0.9-onnx` es una versión exportada a formato ONNX del etiquetador de imágenes de PixAI, originalmente desarrollado por PixAI Labs y adaptado por la comunidad de deepghs. Se trata de un clasificador de imágenes multilabel diseñado específicamente para el etiquetado automático de ilustraciones y arte anime, capaz de predecir 13.461 etiquetas distintas que cubren características generales (pelo, ropa, postura, accesorios), identidades de personajes (más de 3.700 personajes) y derechos de autor (IPs). El modelo acepta imágenes de 448×448 píxeles y devuelve probabilidades para cada etiqueta, con umbrales configurados para separar etiquetas generales y de personajes.

Su relevancia radica en que ofrece una alternativa de código abierto (licencia Apache 2.0) y eficiente para anotar grandes volúmenes de imágenes, algo crítico en el entrenamiento de modelos generativos de imagen, la organización de bibliotecas de arte y la construcción de datasets. La versión ONNX facilita su despliegue en entornos de producción con diferentes backends de inferencia (CPU, GPU, móvil) sin depender de frameworks específicos de PyTorch, lo que lo hace más accesible para integraciones en herramientas de gestión de imágenes y pipelines de datos.

El modelo tiene 317,9 millones de parámetros y 620,9 GFLOPs por inferencia (310,1 GMACs). Su tamaño de repo es de 1,3 GB, y el repositorio en HuggingFace es mantenido por el usuario `powwwwer`, aunque la versión original y la documentación técnica provienen del ecosistema de deepghs.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificación de imágenes multilabel (backbone tipo CNN o ViT, no especificado) |
| Parametros totales | 317,9 M |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo de visión) |
| Tipos de cuantizacion | No disponible (formato ONNX, sin cuantizaciones predefinidas en la información) |
| Idiomas soportados | Inglés (etiquetas en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivos `.onnx`) |

## Arquitectura y entrenamiento

La arquitectura concreta del modelo no se detalla en la documentación proporcionada. Se sabe que es un clasificador de imágenes multilabel que procesa imágenes de 448×448 píxeles y produce una distribución de probabilidad sobre 13.461 etiquetas. El modelo original de PixAI Labs fue entrenado con un dataset de ilustraciones anime, aunque no se especifica el número de imágenes ni el método de entrenamiento (p. ej., si usó fine-tuning sobre un backbone preentrenado o entrenamiento desde cero). La versión ONNX es una exportación directa del modelo original, por lo que conserva las mismas características y comportamiento.

No se menciona el uso de técnicas como RLHF o DPO; al ser un clasificador, no aplican. La única innovación destacable es su amplia cobertura de etiquetas (13.461) en comparación con otros taggers como WD-Tagger, que suelen tener alrededor de 10.000 etiquetas. Además, incluye una categoría específica para personajes y para IPs, lo que facilita la identificación de personajes de franquicias concretas (por ejemplo, `hu_tao_(genshin_impact)`).

## Capacidades

- **Etiquetado de imágenes anime**: predice múltiples etiquetas simultáneamente (multilabel) para características generales como tipo de pelo, ropa, expresión facial, accesorios, etc.
- **Identificación de personajes**: reconoce personajes específicos de series, juegos o franquicias, devolviendo la probabilidad de cada personaje (por ejemplo, `hu_tao_(genshin_impact)` con una confianza de 0.999).
- **Detección de IPs (derechos de autor)**: asigna etiquetas de franquicia (por ejemplo, `genshin_impact`) y mapea personajes a sus IPs correspondientes.
- **Salida estructurada**: devuelve cuatro estructuras de datos: etiquetas generales, etiquetas de personaje, IPs y un mapeo entre personajes e IPs.
- **Umbrales configurables**: los umbrales de decisión para general (0.3) y personajes (0.85) se pueden ajustar según la necesidad de precisión o recall.
- **Integración con `dghs-imgutils`**: se puede usar directamente mediante la función `get_pixai_tags` de la librería `imgutils`, lo que facilita su integración en pipelines de procesamiento de imágenes.
- **Formato ONNX**: permite inferencia en múltiples plataformas (CPU, GPU, móvil) con distintos runtimes (ONNX Runtime, TensorRT, etc.).

## Casos de uso

- **Organización de bibliotecas de imágenes**: en un repositorio de ilustraciones, se puede usar para etiquetar automáticamente cada imagen y permitir búsquedas por atributos (p. ej., "personaje con sombrero y cabello marrón"). La salida con umbrales evita etiquetas irrelevantes.
- **Generación de datasets para entrenamiento de modelos de difusión**: para crear conjuntos de datos con anotaciones ricas, se puede etiquetar miles de imágenes y filtrar por personajes o estilos, reduciendo el trabajo manual de anotación.
- **Moderación de contenido**: el modelo puede detectar etiquetas como `blurry` o `signature`, útiles para identificar imágenes de baja calidad o con marcas de agua, aunque no está diseñado para moderación de contenido explícito.
- **Herramientas de gestión de recursos creativos**: en plataformas de stock de imágenes, se puede automatizar el etiquetado de nuevas subidas, mejorando la indexación y la búsqueda.
- **Análisis de tendencias en ilustración**: agregando las etiquetas generales y de personajes en un conjunto de imágenes, se pueden obtener estadísticas sobre elementos populares (p. ej., frecuencia de personajes de cierta franquicia).
- **Aplicaciones de etiquetado interactivo**: se puede integrar en un GUI (como el proyecto `PixaiTaggerOnnxGui` de GitHub) para etiquetar imágenes localmente sin conexión, lo que permite a los usuarios organizar sus propias colecciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay comparaciones numéricas con otros modelos en la documentación del repositorio.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la información proporcionada.
- El modelo tiene 317,9 millones de parámetros, y su tamaño en ONNX es de 1,3 GB. Para inferencia en CPU, se recomienda al menos 4 GB de RAM libre y un procesador con soporte AVX2 (para ONNX Runtime). En GPU, una tarjeta con 4 GB de VRAM sería suficiente para la inferencia en lote pequeño, aunque la memoria exacta depende del runtime y del tamaño del batch.
- Se puede ejecutar en CPU con tiempos de inferencia de varios segundos por imagen (dependiendo del hardware). En GPU (p. ej., NVIDIA T4, RTX 3060), la inferencia suele ser inferior a 1 segundo por imagen.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT (GPU), OpenVINO (CPU), y también se puede usar a través de la librería `dghs-imgutils` que internamente usa PyTorch, pero con el formato ONNX se puede integrar con cualquier runtime ONNX.
- No hay datos de latencia/throughput específicos publicados.

## Comparativa con modelos similares

No se dispone de información comparativa cuantitativa en las fuentes proporcionadas. Sin embargo, se puede comparar cualitativamente con otros etiquetadores de imágenes anime:

| Modelo | Tamaño | Nº etiquetas | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| **PixAI Tagger v0.9 (ONNX)** | 317,9 M | 13.461 | Apache 2.0 | ONNX | Incluye etiquetas de personajes e IPs. |
| **WD Tagger** (deepdanbooru) | ~1.2 G | ~10.000 | MIT | PyTorch | Menos etiquetas, no distingue personajes. |
| **DeepDanbooru** | ~400 M | ~5.000 | MIT | PyTorch | Etiquetas más generales, sin personajes. |

No hay datos de rendimiento comparativo (mAP, precisión) en la información disponible.

## Limitaciones y advertencias

- **Sesgo en el dominio**: el modelo está entrenado principalmente con ilustraciones anime, por lo que su rendimiento es menor en fotografías reales u otros estilos de arte.
- **Alucinación de etiquetas**: como todo clasificador, puede producir etiquetas con baja confianza que no corresponden al contenido real. Los umbrales por defecto ayudan a mitigar, pero no eliminan el riesgo.
- **Idioma**: las etiquetas están en inglés, lo que puede limitar su uso en aplicaciones en otros idiomas si no se realiza traducción posterior.
- **Dependencia de la librería**: aunque el modelo es ONNX, la documentación recomienda usar la librería `dghs-imgutils` que es de Python y depende de PyTorch, lo que podría ser innecesario si se quiere usar el modelo de forma aislada.
- **Licencia**: la licencia Apache 2.0 permite uso comercial, pero hay que tener en cuenta las restricciones de las etiquetas de personajes con derechos de autor (p. ej., personajes de Genshin Impact). Aunque el modelo no reproduce contenido, el etiquetado de personajes puede implicar derechos de propiedad intelectual de los propietarios de las franquicias.
- **No apto para moderación**: no está diseñado para detectar contenido explícito o violento, por lo que no debe usarse como moderador automático sin una evaluación adicional.
- **Tamaño del repo**: el archivo ONNX ocupa 1,3 GB, lo que puede ser pesado para entornos con almacenamiento limitado.

## Enlaces

- Repositorio del modelo (HuggingFace): [https://huggingface.co/powwwwer/pixai-tagger-v0.9-onnx](https://huggingface.co/powwwwer/pixai-tagger-v0.9-onnx)
- Modelo original (pixai-labs): [https://huggingface.co/pixai-labs/pixai-tagger-v0.9](https://huggingface.co/pixai-labs/pixai-tagger-v0.9)
- Repositorio de deepghs con la versión ONNX original: [https://huggingface.co/deepghs/pixai-tagger-v0.9-onnx](https://huggingface.co/deepghs/pixai-tagger-v0.9-onnx)
- Documentación de la librería `imgutils`: [https://dghs-imgutils.deepghs.org/main/api_doc/tagging/pixai.html](https://dghs-imgutils.deepghs.org/main/api_doc/tagging/pixai.html)
- Repositorio de la librería `imgutils` en GitHub: [https://github.com/deepghs/imgutils](https://github.com/deepghs/imgutils)
- GUI de ejemplo basada en este modelo: [https://github.com/wai55555/PixaiTaggerOnnxGui](https://github.com/wai55555/PixaiTaggerOnnxGui)
