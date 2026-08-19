# janakhpon/monocr

## Resumen

MonOCR es un modelo de reconocimiento óptico de caracteres (OCR) a nivel de línea para el idioma Mon (mnw), desarrollado por janakhpon. El idioma Mon está clasificado por la UNESCO como lengua vulnerable, y este modelo pretende facilitar la digitalización de textos en esa lengua. Se publica únicamente en formato de artefactos de despliegue: ONNX y Core ML, sin checkpoint de PyTorch.

La arquitectura es una CRNN (red neuronal convolucional recurrente) que combina un extractor de características MobileNetV3-Large con un cuello de atención squeeze-excitation, seguido de dos BiLSTM de 512 unidades, una capa de autoatención de cuello de botella (256 dimensiones, 4 cabezas) y una proyección lineal a 277 clases con decodificación CTC. El modelo tiene 11 553 437 parámetros y acepta imágenes en escala de grises de forma `[batch, 1, 160, 1024]`.

La relevancia actual radica en que es uno de los pocos recursos de OCR específicos para una lengua minoritaria, con licencia MIT y artefactos listos para integrar en aplicaciones móviles (Core ML) o servidores (ONNX). La versión 3.5 introduce cambios importantes respecto a la v2: entrada estática de 1024 píxeles de ancho, mayor número de parámetros y un charset reducido a 276 caracteres.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Large + squeeze-excitation neck + 2×BiLSTM(512) + bottleneck self-attention (256-dim, 4 heads) + Linear(1024→277) + CTC |
| Parametros totales | 11 553 437 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen a texto) |
| Tipos de cuantizacion | FP32 (ONNX y Core ML) |
| Idiomas soportados | Mon (mnw) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), Core ML (.mlpackage) |

## Arquitectura y entrenamiento

La arquitectura es una CRNN clásica para OCR de línea: un backbone MobileNetV3-Large extrae características de la imagen, seguido de un cuello de atención squeeze-excitation, un band pooling que reduce la dimensión espacial, dos capas BiLSTM de 512 unidades para modelar secuencias, una capa de autoatención de cuello de botella (256 dimensiones, 4 cabezas) y una proyección lineal a 277 clases de salida. La decodificación se realiza con CTC greedy, donde el índice 0 corresponde al blank.

El entrenamiento se realizó sobre líneas de texto sintéticas renderizadas con diferentes tipografías. No se especifica el número total de tokens ni la composición del dataset, pero se menciona que el modelo fue entrenado con un generador sintético propio. No hay indicios de RLHF ni DPO. La selección del checkpoint se basó en una métrica de validación `val_cer` de 0.0210 (greedy) en el paso 93 645 (época 23), aunque esta métrica no constituye una evaluación con datos reservados.

Una innovación destacable es la inclusión de una capa de autoatención tras las BiLSTM, lo que permite capturar dependencias de largo alcance dentro de la línea. Además, los artefactos ONNX y Core ML están verificados contra el modelo PyTorch original con tolerancias estrictas (logits dentro de `rtol=atol=1e-3`), garantizando la fidelidad de las exportaciones.

## Capacidades

- Reconocimiento de texto Mon a nivel de línea, devolviendo una cadena de caracteres.
- Entrada de imagen en escala de grises, 1 canal, float32, con normalización `pixel / 127.5 - 1.0`.
- Decodificación CTC greedy con índice 0 como blank.
- Soporte de batch dinámico en el eje de lote (aunque la entrada estándar es de batch 1).
- Exportación a ONNX (opset 17) y Core ML, listos para integración en aplicaciones.
- Charset de 276 caracteres (índice 1 a 276), donde el primer carácter es un espacio (U+0020).
- No dispone de tool calling, ni capacidades de agente, ni visión general más allá del OCR.

## Casos de uso

- Digitalización de documentos históricos en Mon: el modelo puede procesar líneas de texto escaneadas o fotografiadas, siempre que se respete el contrato de entrada (redimensionado a 160 de alto y padding a 1024 de ancho).
- Preservación lingüística: permite convertir corpus impresos en Mon a texto digital, facilitando la creación de bases de datos y diccionarios.
- Aplicaciones móviles de traducción o aprendizaje: gracias al artefacto Core ML, puede integrarse en apps iOS para reconocer texto Mon en tiempo real.
- Automatización de archivos: en bibliotecas o instituciones que gestionen fondos en Mon, el modelo puede extraer texto de imágenes para indexación y búsqueda.
- Investigación lingüística: los investigadores pueden usar el modelo para transcribir corpus orales o escritos sin intervención manual.
- Sistemas de accesibilidad: convertir texto Mon impreso en voz o en formatos digitales accesibles para personas con discapacidad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque se trata de un modelo OCR especializado. La model card incluye dos métricas:

1. **Métrica de selección**: `val_cer` 0.0210 (greedy) sobre 4096 líneas sintéticas en una sola tipografía. Esta métrica no es una evaluación con datos reservados y no debe interpretarse como precisión real.
2. **Comparación contra v2** sobre 600 líneas renderizadas por cada conjunto, con texto restringido a los 273 caracteres comunes a ambos charsets:

| Conjunto de renderizado | n | v2 CER | v3.5 CER | Reducción de error |
|---|---:|---:|---:|---:|
| 32 diseños entrenados | 600 | 0.1470 | 0.0396 | 73 % |
| `namkhon` (no visto en v3.5) | 600 | 0.0521 | 0.0188 | 64 % |
| `pyidaungsu`, `yunghkio` (no vistos en v3.5) | 600 | 0.0342 | 0.0051 | 85 % |

Estos resultados son una comparación sintética entre dos versiones del mismo modelo, no una evaluación absoluta. Además, se midió el rendimiento en líneas anchas (240 líneas, mediana de 3 ventanas): dividir la línea en tiles de 1024 píxeles y unir los resultados obtuvo un CER de 0.0795, frente a 0.1434 al comprimir toda la línea en una sola ventana. **No existe evaluación con imágenes reales de páginas fotografiadas.**

## Requisitos de hardware

- El modelo ONNX FP32 ocupa 46 247 040 bytes (~46 MB), por lo que es ligero y puede ejecutarse en CPU sin problemas.
- La inferencia en GPU es posible, pero no se requiere una GPU específica; cualquier GPU con al menos 2 GB de VRAM es suficiente para el tamaño del modelo.
- El artefacto Core ML está pensado para dispositivos Apple (iPhone, iPad, Mac) y puede ejecutarse en CPU o Neural Engine, aunque no se ha verificado el comportamiento en este último (el compilador puede reasociar operaciones en fp16).
- Opciones de despliegue: ONNX Runtime, Core ML (Apple), o cualquier framework que soporte ONNX (vLLM, TGI, etc., aunque estos están orientados a LLM; para OCR se usaría ONNX Runtime directamente).
- No se proporcionan números de latencia ni throughput en la documentación disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables específicos para OCR en idioma Mon. La única comparación disponible es contra la versión anterior del mismo modelo (v2), que se detalla en la sección de benchmarks. En cuanto a OCR general, podrían mencionarse Tesseract o EasyOCR, pero ninguno soporta el idioma Mon de forma nativa, por lo que la comparación no es pertinente.

## Limitaciones y advertencias

- **Sin evaluación con datos reales**: no hay métricas sobre fotografías o páginas escaneadas; todos los números provienen de datos sintéticos renderizados.
- **Entrada de ancho fijo**: la imagen debe redimensionarse a 1024 píxeles de ancho (con padding a blanco). Cualquier otro ancho produce resultados incorrectos sin error explícito.
- **Charset específico**: el charset debe cargarse desde la misma revisión del modelo; un charset de otra revisión decodifica todos los índices a caracteres erróneos.
- **No es un reemplazo directo de v2**: los cambios en altura de entrada (128→160), ancho (dinámico→1024) y número de clases (316→277) requieren ajustes en las integraciones existentes.
- **Riesgo de alucinación**: al alimentar la red con valores uint8 sin normalizar, el modelo produce salidas confiadas pero incorrectas.
- **Idioma limitado**: solo soporta Mon (mnw); no hay capacidad multilingüe.
- **Licencia MIT**: permite uso comercial, pero el modelo no garantiza precisión en contextos de producción sin una validación adicional con datos reales.

## Enlaces

- HuggingFace: https://huggingface.co/janakhpon/monocr
- No se proporcionan otros enlaces (papers, repos, demos) en la información disponible.
