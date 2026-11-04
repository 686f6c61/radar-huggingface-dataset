# latrompeababar/gemma-4-12B-it-oQ2e

## Resumen

gemma-4-12B-it-oQ2e es una cuantización mixta del modelo Gemma 4 de 12B parámetros en su variante instruct, publicada por el usuario latrompeababar en HuggingFace. El checkpoint ha sido procesado con oQ (oMLX v0.7.3), una herramienta de cuantización de precisión mixta orientada al ecosistema MLX de Apple Silicon, que combina distintos esquemas de cuantización afín y distintos tamaños de grupo según la sensibilidad de cada tensor. El resultado es un checkpoint de 11.960 millones de parámetros almacenado en 4.231 GiB, con un promedio efectivo de 3.039 bits por peso.

El modelo base es Gemma 4, la cuarta generación de la familia Gemma de Google, en su tamaño de 12B y variante instruct. La arquitectura declarada en los tags es `gemma4_unified`, lo que sugiere una arquitectura unificada multimodal que integra el codificador de visión dentro del propio checkpoint: la tabla de desglose de almacenamiento separa explícitamente 11.925B parámetros de lenguaje y 0.035B de visión. El modelo conserva capacidades de procesamiento de imagen además de texto.

La relevancia de esta ficha reside en que permite ejecutar un modelo de 12B con capacidades multimodales en hardware de consumo Apple Silicon con un footprint de menos de 5 GB en disco, a costa de una cuantización agresiva (predominantemente 2 y 3 bits) que previsiblemente degrada la calidad respecto al modelo original en BF16. Es un checkpoint de nicho, sin descargas ni validación comunitaria en el momento de la consulta, por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal unificada (`gemma4_unified`), con módulo de visión integrado |
| Parametros totales | 11.959.730.224 (11.960B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: affine 2-bit grupo 64, affine 3-bit grupo 128, affine 3-bit grupo 64, BF16; media efectiva 3.039 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un modelo entrenado desde cero. El modelo base es Gemma 4 12B instruct, cuya arquitectura el autor etiqueta como `gemma4_unified`, con un tronco de lenguaje de 11.925B parámetros y un módulo de visión de 0.035B parámetros. No se dispone de información sobre el número de capas, dimensión oculta, mecanismo de atención ni longitud de contexto del modelo original en la información proporcionada.

El proceso de cuantización aplica precisión mixta según la distribución de bits documentada por el autor: el 36,059% de los pesos lógicos (4.313B) se almacenan en affine 2-bit con grupo 64 (2,50 bits/peso efectivos); el 55,223% (6.605B) en affine 3-bit con grupo 128 (3,25 bits/peso); el 8,417% (1.007B) en affine 3-bit con grupo 64 (3,50 bits/peso); y un 0,301% (0,036B) se mantiene en BF16 (16 bits/peso). El almacenamiento total de tensores es de 4.231 GiB para 11.960B parámetros lógicos, lo que da la media de 3.039 bits/peso. No se documentan datos de entrenamiento, composición del dataset, ni fases de RLHF o DPO en la información disponible, ya que corresponden al modelo base y no se detallan en la model card de esta cuantización.

## Capacidades

- Generación de texto en modo instruct: el sufijo `-it` indica ajuste para seguir instrucciones conversacionales.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,035B parámetros, por lo que se espera soporte de entrada de imágenes junto a texto.
- Razonamiento y conversación multi-turno: capacidades propias de la variante instruct del modelo base.
- Generación de código y matemáticas: no confirmado explícitamente en la información disponible, pero esperable en un modelo instruct de esta familia.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados en la model card.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint está en formato MLX y ocupa 4,231 GiB, por lo que puede cargarse en un Mac con 8-16 GB de memoria unificada. Adecuado para prototipado y experimentación local sin GPU dedicada.
- Asistentes conversacionales de escritorio: al ser un modelo instruct de 12B, puede gestionar diálogos multi-turno en aplicaciones nativas de macOS integradas mediante MLX.
- Análisis de imágenes con descripción textual: el módulo de visión integrado permite tareas de image captioning o respuesta a preguntas sobre imágenes (VQA) en local, siempre que la cuantización agresiva no degrade en exceso la calidad perceptiva.
- Evaluación comparativa de cuantizaciones: útil como referencia para medir la pérdida de calidad de una cuantización mixta a ~3 bits frente al modelo en BF16, en el contexto de investigación sobre compresión de modelos.
- Prototipado de pipelines RAG ligeros: con 12B parámetros y un footprint de 4,6 GB en disco, puede desplegarse como generador en un pipeline de recuperación aumentada sobre corpus pequeños en un portátil.
- Desarrollo de demos offline: para entornos sin conectividad o con requisitos de privacidad estrictos, permite ejecutar un modelo multimodal de 12B completamente en local.
- Filtrado y clasificación de contenido: tareas de etiquetado o moderación de texto e imagen en lotes pequeños, aprovechando la ventaja de memoria del formato cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 4,231 GiB en disco; en inferencia MLX se necesita espacio adicional para cachés de atención y buffers, por lo que se recomienda un mínimo de 8 GB de memoria unificada, con 16 GB para mayor holgura en contextos largos.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra), dado que el formato es MLX. No es compatible directamente con CUDA sin conversión previa.
- GPU de consumo: cabe en cualquier Mac con 8 GB o más de memoria unificada; en GPUs NVIDIA no es desplegable tal cual por el formato MLX.
- Opciones de despliegue: MLX (librería `mlx`), herramientas del ecosistema oMLX; para otros backends sería necesaria una conversión a GGUF o safetensors estándar, no documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-12B-it-oQ2e | 11.960B | no disponible | oQ mixta ~3,04 bits | no disponible | safetensors (MLX) |
| Gemma 4 12B instruct (BF16, referencia) | ~12B | no disponible | BF16 | no disponible | safetensors |
| Otras cuantizaciones MLX de Gemma 4 12B | ~12B | no disponible | 4-bit / 8-bit típicas | no disponible | safetensors (MLX) |

No se dispone de datos de benchmarks ni de especificaciones del modelo base original en la información proporcionada, por lo que la comparativa se limita a parámetros, formato y esquema de cuantización.

## Limitaciones y advertencias

- Cuantización muy agresiva: el 91,3% de los pesos lógicos están almacenados a 2 o 3 bits, lo que previsiblemente introduce degradación de calidad frente al modelo en BF16, especialmente en tareas de razonamiento complejo, matemáticas y código.
- Sin validación comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia pública de que el checkpoint funcione correctamente.
- Licencia no declarada: no se especifica la licencia en la model card ni en los metadatos, lo que impide determinar si el uso comercial está permitido. Debe consultarse la licencia del modelo base Gemma 4 de Google antes de cualquier uso en producción.
- Idiomas no declarados: no se indica qué idiomas soporta, lo que dificulta evaluar su idoneidad para aplicaciones en castellano u otras lenguas.
- Contexto desconocido: no se documenta la longitud de contexto, dato crítico para planificar aplicaciones con documentos largos o conversaciones extensas.
- Dependencia de MLX: el formato solo es directamente utilizable en Apple Silicon; en otros entornos requiere conversión no documentada.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; la cuantización agresiva puede incrementarlo.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base, que no se detallan.
- Repositorio de autor único: no hay garantía de mantenimiento, corrección de errores ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/latrompeababar/gemma-4-12B-it-oQ2e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
