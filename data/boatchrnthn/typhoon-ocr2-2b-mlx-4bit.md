# boatchrnthn/typhoon-ocr2-2b-mlx-4Bit

## Resumen

`boatchrnthn/typhoon-ocr2-2b-mlx-4Bit` es una conversión a formato MLX con cuantización de 4 bits del modelo `typhoon-ai/typhoon-ocr2-2b`, un modelo especializado en OCR y parseo de documentos desarrollado por Typhoon AI (SCB 10X). El modelo original está afinado sobre una base de la familia Qwen 3.5 y está orientado a tareas de reconocimiento óptico de caracteres, análisis de layout, reconocimiento de tablas y extracción estructurada de información a partir de imágenes de documentos.

La relevancia de esta variante concreta radica en su formato: al estar convertida con `mlx-lm` 0.31.2 y cuantizada a 4 bits, está pensada para ejecutarse en hardware Apple Silicon (chips M1/M2/M3/M4) mediante el framework MLX, lo que permite desplegar un modelo de OCR multimodal en un portátil o Mac de sobremesa sin GPU dedicada. El repositorio ocupa 1,1 GB y contiene 1.881.825.088 parámetros en pesos safetensors.

El modelo soporta tailandés e inglés, lo que lo convierte en una opción poco habitual para pipelines de digitalización de documentos en contextos bilingües tailandés-inglés. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales. Cabe señalar que esta conversión concreta tiene cero descargas y cero likes en el momento de la consulta, por lo que debe tratarse como un artefacto de terceros no validado oficialmente por Typhoon AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen 3.5 (tag `qwen3_5`) |
| Parametros totales | 1.881.825.088 (~1,88 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX), formato derivado de `mlx-lm` 0.31.2 |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 1,1 GB |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base `typhoon-ai/typhoon-ocr2-2b` pertenece a la familia Qwen 3.5 (tag `qwen3_5`) y que se trata de un modelo multimodal de tipo image-text-to-text. Esto implica un codificador visual acoplado a un decoder de lenguaje, aunque no se detalla en la información proporcionada ni el tipo exacto de encoder visual, ni el número de capas, ni la dimensión oculta, ni el mecanismo de fusión multimodal.

El modelo original fue afinado específicamente para tareas de OCR y parseo de documentos (tags `ocr`, `document-parsing`, `layout-analysis`, `table-recognition`). No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o preferencia. La variante aquí descrita es únicamente una conversión de formato y cuantización realizada por un tercero (`boatchrnthn`) mediante `mlx-lm` 0.31.2, sin reentrenamiento adicional documentado. No se han publicado innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos, con soporte para texto tailandés e inglés.
- Parseo de documentos: extracción de estructura y contenido a partir de imágenes.
- Análisis de layout: identificación de regiones, bloques y organización espacial del documento.
- Reconocimiento de tablas: extracción de datos tabulares presentes en imágenes.
- Generación conversacional multimodal: el pipeline es `image-text-to-text` y el modelo acepta plantillas de chat (`apply_chat_template`), lo que permite interacción por turnos.
- Soporte bilingüe tailandés-inglés en las tareas anteriores.
- Ejecución en Apple Silicon mediante MLX (`mlx-lm`), con pesos cuantizados a 4 bits.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Digitalización de documentos administrativos tailandeses: el modelo puede procesar imágenes de formularios, contratos o facturas en tailandés e inglés y extraer el texto y la estructura, aprovechando su entrenamiento específico en OCR bilingüe.
- Extracción de tablas de informes financieros: gracias a su capacidad de table-recognition, permite convertir tablas impresas o escaneadas en datos estructurados para su posterior carga en bases de datos o hojas de cálculo.
- Análisis de layout en pipelines de gestión documental: el modelo identifica regiones y bloques del documento, lo que facilita el enrutamiento automático de documentos (por ejemplo, separar cabecera, cuerpo y pie en un flujo de archivo).
- Procesamiento local en Mac para equipos sin GPU dedicada: al estar en formato MLX 4 bits, permite ejecutar OCR multimodal en un MacBook con Apple Silicon, útil para prototipado, demos o entornos con requisitos de privacidad que impiden enviar documentos a la nube.
- Prototipado rápido de aplicaciones de lectura de documentos: la API de `mlx-lm` con plantilla de chat permite integrar el modelo en scripts Python en pocas líneas para validar casos de uso de OCR antes de invertir en infraestructura mayor.
- Investigación en OCR multilingüe tailandés-inglés: sirve como punto de partida para experimentos de evaluación o fine-tuning adicional en un dominio concreto, dado que la licencia Apache 2.0 lo permite.
- Preprocesamiento de corpus documentales para entrenamiento: extracción masiva de texto de imágenes escaneadas en entornos macOS como paso previo a la construcción de datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: el repositorio pesa 1,1 GB en cuantización 4 bits, por lo que se estima un consumo de memoria en torno a 1,5-2,5 GB incluyendo overhead del runtime MLX y el procesador de imágenes (estimación, no dato oficial).
- GPU recomendadas: hardware Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. No está pensado para GPUs NVIDIA/AMD en este formato.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada, dado el reducido tamaño del checkpoint.
- Opciones de despliegue: `mlx-lm` (versión 0.31.2 o superior) es la vía documentada. Para el modelo base en formato estándar se podría usar `transformers`; para otras plataformas sería necesario reconvertir desde el modelo original.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `boatchrnthn/typhoon-ocr2-2b-mlx-4Bit` (esta ficha) | ~1,88 B | no disponible | th, en | Apache 2.0 | safetensors MLX 4 bits |
| `typhoon-ai/typhoon-ocr2-2b` (modelo base) | ~1,88 B | no disponible | th, en | Apache 2.0 | safetensors (transformers) |
| Otras cuantizaciones/adaptadores de `typhoon-ocr2-2b` | ~1,88 B | no disponible | th, en | Apache 2.0 | variable (adapters, quantizations, merges) |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones detalladas de modelos alternativos de OCR de tamaño comparable para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de terceros: la conversión MLX la realiza el usuario `boatchrnthn`, no Typhoon AI; no hay validación oficial del artefacto y cuenta con cero descargas y cero likes, por lo que su fiabilidad no está contrastada por la comunidad.
- Especialización estrecha: está afinado para OCR y parseo de documentos; su rendimiento en tareas generales de lenguaje o razonamiento no está documentado y probablemente sea limitado.
- Cobertura lingüística restringida a tailandés e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación en la extracción de texto: los modelos de OCR generativo pueden producir contenido plausible pero ausente en la imagen, especialmente con documentos degradados o de baja resolución.
- Cuantización a 4 bits: puede degradar la precisión del reconocimiento respecto al modelo original en texto denso, tablas complejas o caracteres tailandeses poco frecuentes; no se han publicado evaluaciones comparativas.
- Sin datos de contexto máximo ni de composición del dataset de entrenamiento, lo que dificulta anticipar el comportamiento en documentos muy largos o dominios especializados.
- Dependencia de hardware Apple: el formato MLX no es portable directamente a GPUs NVIDIA ni a servidores x86 convencionales; para producción en esos entornos habría que usar el modelo base.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base `typhoon-ai/typhoon-ocr2-2b` y de la familia Qwen 3.5 subyacente antes de desplegar en producción.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/boatchrnthn/typhoon-ocr2-2b-mlx-4Bit
- Modelo base en Hugging Face: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Árbol de archivos del modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b/tree/main
- Fine-tunes y adaptadores del modelo base: https://huggingface.co/models?other=base_model%3Afinetune%3Atyphoon-ai%2Ftyphoon-ocr2-2b
