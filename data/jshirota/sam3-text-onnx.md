# jshirota/sam3-text-onnx

## Resumen

El modelo `jshirota/sam3-text-onnx` es una exportación al formato ONNX del modelo SAM 3 de Meta, concretamente de su variante de segmentación de imágenes guiada por texto (text-promptable concept segmentation). Desarrollado por el usuario jshirota, este export resuelve el problema de ejecutar SAM 3 fuera del ecosistema Python/PyTorch, permitiendo su uso en navegadores, dispositivos móviles, C++, Rust o cualquier entorno con un runtime ONNX. Es relevante porque, según su autor, es la primera exportación pública de SAM 3 con soporte de prompts de texto; otras exportaciones comunitarias solo cubren la variante tracker con prompts de punto/caja.

El modelo se compone de tres submódulos exportados por separado: un codificador de visión (vision encoder), un codificador de texto (text encoder) y un decodificador (decoder). El repositorio incluye tres variantes de precisión: fp32 (3,3 GB), int8 con cuantización dinámica (839 MB) e int4 con cuantización MatMul (654 MB). El tamaño total del repositorio es de 8,4 GB. La licencia es la específica de SAM 3 (`sam-3-license`) y el pipeline declarado es `mask-generation`. No se especifica el número total de parámetros del modelo, ni la longitud de contexto (al ser un modelo de imagen no aplica), ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 3 (vision encoder + text encoder + decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; el texto se tokeniza a un maximo de 32 tokens) |
| Tipos de cuantizacion | fp32, int8 (cuantizacion dinamica), int4 (cuantizacion MatMul) |
| Idiomas soportados | no disponible |
| Licencia | sam-3-license (https://ai.meta.com/resources/models-and-libraries/sam-license/) |
| Formato de pesos | ONNX (archivos .onnx con pesos externos .data) |

## Arquitectura y entrenamiento

El modelo original `facebook/sam3` es un sistema de segmentación de imágenes de código abierto desarrollado por Meta. La variante exportada aquí corresponde a la configuración que acepta prompts de texto para segmentar conceptos (open-vocabulary). La arquitectura se divide en tres componentes: un vision encoder que procesa la imagen una sola vez y produce mapas de características multiescala (FPN) junto con codificaciones posicionales; un text encoder que proyecta el prompt de texto a un vector de características de 256 dimensiones; y un decoder que combina ambas salidas para generar máscaras, cajas delimitadoras (en formato xyxy normalizado) y puntuaciones de confianza. Esta separación permite que, al cambiar el prompt sobre la misma imagen, solo se re-ejecuten el text encoder y el decoder, que son computacionalmente baratos.

El autor del export indica que no utilizó `optimum-onnx` (que no soporta SAM 3 nativamente) ni las herramientas de Meta (que no incluyen exportación ONNX), sino que envolvió manualmente los tres submódulos de `Sam3Model` y llamó a `torch.onnx.export` directamente sobre cada uno. El resultado fue validado contra el modelo PyTorch original, comprobando que la detección de objetos y las ubicaciones de las cajas fueran bit-equivalentes en una imagen de prueba. No se proporcionan detalles sobre el entrenamiento del modelo base (número de tokens, dataset, técnicas de alineación), ya que son datos del modelo original de Meta y no se incluyen en la información disponible.

## Capacidades

- Segmentación de imágenes guiada por texto: dado un prompt como `"seed"`, `"cat"` o `"yellow school bus"`, el modelo genera máscaras de segmentación para todos los objetos que coinciden con el concepto.
- Segmentación de vocabulario abierto (open-vocabulary): no está limitado a clases predefinidas; puede segmentar cualquier concepto descrito en lenguaje natural.
- Segmentación por concepto (concept segmentation): identifica y separa instancias de una categoría semántica en la imagen.
- Generación de máscaras, cajas delimitadoras y puntuaciones de confianza como salida.
- Ejecución multiplataforma: al estar en ONNX, puede utilizarse en Python (onnxruntime), C++, Rust, navegadores (WebAssembly/WebGPU mediante transformers.js u onnxruntime-web) y dispositivos móviles.
- Reutilización de características de imagen: el vision encoder se ejecuta una vez por imagen; los cambios de prompt solo requieren re-ejecutar el text encoder y el decoder.
- Compatibilidad con `transformers` para preprocesadores: se usan `Sam3ImageProcessor` y `AutoTokenizer` de HuggingFace para preparar las entradas.

## Casos de uso

- Edición de imágenes y fotografía: seleccionar objetos por descripción textual (p. ej., "el coche rojo") para aplicar filtros, recortes o reemplazos de fondo sin necesidad de anotaciones manuales.
- Análisis de imágenes médicas: segmentar estructuras anatómicas o anomalías descritas en lenguaje clínico (p. ej., "nódulo pulmonar") en radiografías o tomografías, facilitando la revisión asistida.
- Agricultura de precisión: identificar y medir cultivos, malezas o zonas afectadas por plagas a partir de imágenes de drones, usando prompts como "plantas enfermas".
- Inspección industrial y control de calidad: localizar defectos en piezas manufacturadas mediante descripciones textuales (p. ej., "grieta en la superficie") en líneas de producción automatizadas.
- Búsqueda visual en bases de datos de imágenes: indexar y recuperar imágenes por contenido semántico (p. ej., "perro sentado en un sofá") sin etiquetas manuales previas.
- Aplicaciones web interactivas: integrar la segmentación en el navegador mediante transformers.js, permitiendo a usuarios finales seleccionar objetos con solo escribir una frase, sin necesidad de servidores dedicados.
- Sistemas de realidad aumentada: segmentar objetos del mundo real en tiempo real a partir de comandos de voz o texto para superponer información digital.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo menciona que la variante fp32 es bit-equivalente al modelo PyTorch original en cuanto a detección de objetos y ubicación de cajas, pero no proporciona métricas cuantitativas (mIoU, precisión, recall, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- Variante fp32: requiere aproximadamente 3,3 GB de almacenamiento en disco y una GPU con al menos 4 GB de VRAM para una inferencia cómoda (aunque también puede ejecutarse en CPU). Se recomienda una GPU moderna como RTX 3060 o superior.
- Variante int8: ocupa 839 MB en total; puede ejecutarse en CPU con razonable velocidad y en GPUs de gama baja (2-4 GB VRAM). Es la opción recomendada como "producción por defecto" según el autor.
- Variante int4: 654 MB en total; diseñada para navegadores y dispositivos móviles. Puede ejecutarse en CPU y en GPUs integradas, aunque con posible pérdida de precisión.
- El modelo es divisible en tres componentes, por lo que el vision encoder (el más pesado) puede ejecutarse una sola vez y cachear sus salidas, reduciendo el coste por prompt adicional.
- Opciones de despliegue: onnxruntime (Python, C++, Rust), transformers.js (navegador), onnxruntime-web (WebGPU/WebAssembly), o cualquier runtime compatible con ONNX.
- No se proporcionan datos de latencia ni throughput específicos; dependerán del hardware y de la variante de cuantización elegida.

## Comparativa con modelos similares

| Modelo | Formato | Prompt de texto | Prompt de punto/caja | Tamaño | Licencia |
|---|---|---|---|---|---|
| `jshirota/sam3-text-onnx` (este modelo) | ONNX | Sí | No | 654 MB - 3,3 GB según variante | sam-3-license |
| `facebook/sam3` (original) | PyTorch | Sí | Sí | no disponible | sam-3-license |
| `onnx-community/sam3-tracker-ONNX` | ONNX | No (solo punto/caja) | Sí | no disponible | no especificada |
| `vietanhdev/segment-anything-3-onnx-models` | ONNX | No (solo punto/caja) | Sí | no disponible | no especificada |

La comparativa se basa únicamente en las características declaradas en la información disponible; no hay datos de rendimiento para contrastar. La principal ventaja de este modelo es su soporte de prompts de texto en formato ONNX, único entre las exportaciones comunitarias conocidas.

## Limitaciones y advertencias

- Licencia restrictiva: la `sam-3-license` de Meta impone condiciones específicas para uso comercial; es necesario revisar el texto completo en el enlace proporcionado.
- No soporta prompts de punto o caja: esta variante está diseñada exclusivamente para prompts de texto; para anotaciones espaciales hay que usar la variante tracker.
- Cuantización int4: puede degradar la precisión de las máscaras y las cajas; se recomienda validar en el conjunto de datos objetivo antes de usarla en producción.
- El script de cuantización a fp16 está roto según la model card; no se debe usar esa ruta.
- El texto se tokeniza a un máximo de 32 tokens; prompts muy largos se truncarán, lo que podría afectar la calidad de la segmentación.
- No hay información sobre sesgos demográficos o culturales del modelo base; como modelo de segmentación, los resultados pueden variar según el dominio de las imágenes y el lenguaje del prompt.
- Riesgo de alucinación en la interpretación del prompt: el modelo puede generar máscaras para conceptos ambiguos o mal definidos; se recomienda validar las salidas en aplicaciones críticas.
- No se proporcionan datos de rendimiento cuantitativo (benchmarks) ni requisitos mínimos de memoria RAM durante la inferencia; estos deben determinarse empíricamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jshirota/sam3-text-onnx
- Modelo base en HuggingFace: https://huggingface.co/facebook/sam3
- Paper de SAM 3: https://arxiv.org/abs/2511.16719
- Repositorio oficial de Meta (facebookresearch/sam3): https://github.com/facebookresearch/sam3
- Licencia SAM 3: https://ai.meta.com/resources/models-and-libraries/sam-license/
- Export ONNX de la variante tracker (referencia): https://huggingface.co/onnx-community/sam3-tracker-ONNX
- Otra exportación ONNX (solo Python): https://huggingface.co/vietanhdev/segment-anything-3-onnx-models
