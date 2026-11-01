# CollectionStudio/Florence-2-base

## Resumen

Florence-2-base es un modelo fundacional de visión por computador desarrollado por Microsoft Research, publicado originalmente en noviembre de 2023 y distribuido en HuggingFace a través del repositorio `CollectionStudio/Florence-2-base`, una réplica del repositorio oficial `microsoft/Florence-2-base`. El modelo aborda una amplia variedad de tareas visión-lenguaje mediante un enfoque basado en prompts textuales: el usuario introduce una instrucción como `<OD>` (detección de objetos) o `<CAPTION>` (descripción de imagen) y el modelo genera la salida correspondiente en formato texto estructurado.

La arquitectura es un transformer secuencia-a-secuencia con un encoder visual (DaViT) y un decoder autorregresivo, con 231.567.705 parámetros totales (aproximadamente 0,23B). Se entrenó sobre el dataset FLD-5B, que contiene 5.400 millones de anotaciones sobre 126 millones de imágenes, lo que le permite aprender múltiples tareas de forma conjunta en un único modelo. Es relevante porque demuestra que un modelo de tamaño reducido puede competir con modelos especializados en tareas como detección, segmentación y captioning, y porque su licencia MIT facilita su uso comercial e integración en producción.

Esta ficha describe la variante *base* preentrenada, no la versión ajustada (`Florence-2-base-ft`), que suele ofrecer mejores resultados en tareas downstream concretas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer secuencia-a-secuencia con encoder visual DaViT y decoder autorregresivo |
| Parámetros totales | 231.567.705 (≈0,23B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (entrenado en float16; compatible con cuantización estándar vía transformers/bitsandbytes, no documentado por el autor) |
| Idiomas soportados | No disponible (las tareas son principalmente visión-lenguaje en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (`pytorch_model.bin`), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

Florence-2 emplea una arquitectura secuencia-a-secuencia en la que un encoder visual procesa la imagen y un decoder autorregresivo genera texto. El modelo unifica tareas mediante prompts textuales: cada tarea se representa como una secuencia de texto (por ejemplo `<OD>`, `<CAPTION>`, `<CAPTION_TO_PHRASE_GROUNDING>`) y el modelo produce la salida correspondiente, incluyendo coordenadas de bounding boxes cuando la tarea lo requiere. Esta formulación permite tratar detección, segmentación, captioning y grounding como un problema único de generación texto-a-texto condicionada por la imagen.

El entrenamiento se realizó sobre FLD-5B, un dataset con 5.400 millones de anotaciones sobre 126 millones de imágenes, construido mediante un pipeline de anotación automática y verificación. El modelo se entrenó en float16. La model card no detalla si hubo fases de RLHF o DPO, ni el número exacto de tokens de texto utilizados. La innovación principal es el enfoque multi-tarea unificado basado en prompts, que evita mantener cabezas específicas por tarea y permite extender el modelo a nuevas tareas mediante ajuste fino supervisado.

## Capacidades

- Generación de descripciones de imagen en tres niveles de detalle: `<CAPTION>`, `<DETAILED_CAPTION>` y `<MORE_DETAILED_CAPTION>`.
- Detección de objetos con bounding boxes mediante el prompt `<OD>`, devolviendo etiquetas y coordenadas.
- Detección densa con descripción de región mediante `<DENSE_REGION_CAPTION>`.
- Propuesta de regiones mediante `<REGION_PROPOSAL>`.
- Grounding de frases sobre imagen: dado un texto descriptivo, localiza las regiones correspondientes con `<CAPTION_TO_PHRASE_GROUNDING>`.
- Segmentación y otras tareas visión-lenguaje soportadas por el modelo original (la model card se trunca en la información disponible; las tareas documentadas incluyen captioning, detección, region proposal y grounding).
- Procesamiento de una imagen por prompt con generación de hasta 1024 tokens nuevos.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo de razonamiento explícito.
- Capacidades multilingües no documentadas; el modelo está orientado a tareas visuales con prompts en inglés.

## Casos de uso

- **Moderación y etiquetado automático de imágenes en plataformas UGC**: usar `<CAPTION>` y `<OD>` para generar descripciones y detectar objetos en imágenes subidas por usuarios, alimentando pipelines de clasificación y revisión. El tamaño reducido (0,23B) permite procesar lotes grandes en una sola GPU.
- **Accesibilidad: generación de texto alternativo**: integrar `<DETAILED_CAPTION>` o `<MORE_DETAILED_CAPTION>` en un CMS para producir automáticamente atributos `alt` descriptivos en imágenes, reduciendo el trabajo manual de revisión.
- **Anotación asistida de datasets de visión**: usar `<REGION_PROPOSAL>` y `<OD>` para preanotar bounding boxes que luego se revisan y corrigen por anotadores humanos, acelerando la construcción de datasets de detección.
- **Búsqueda visual y grounding**: emplear `<CAPTION_TO_PHRASE_GROUNDING>` para localizar en una imagen los objetos mencionados en una consulta de texto, habilitando interfaces de búsqueda visual o recorte inteligente.
- **Automatización de inventario y retail**: detectar productos y sus posiciones mediante `<OD>` y `<DENSE_REGION_CAPTION>` en imágenes de estanterías o almacenes, generando inventarios estructurados a partir de fotografías.
- **Preprocesamiento en pipelines de visión documental**: combinar captioning y detección para extraer descripciones y regiones de interés en documentos escaneados o capturas, como paso previo a OCR o a modelos especializados.
- **Prototipado rápido en investigación**: al ser un modelo de 0,23B con licencia MIT, sirve como base para experimentos de ajuste fino multi-tarea en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 0,5 GB solo para pesos, más overhead de activaciones y del encoder visual; en la práctica, menos de 2 GB en FP16 para una imagen y 1024 tokens de salida.
- En float32, los pesos ocupan aproximadamente 0,9 GB; la VRAM total estimada se mantiene por debajo de 3-4 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) con enorme margen para batching.
- Puede ejecutarse en CPU para inferencia puntual, con latencia mayor.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el código personalizado del modelo). No se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Florence-2-base (esta ficha) | 0,23B | No disponible | Captioning, detección, grounding, region proposal | MIT | HuggingFace |
| Florence-2-large | 0,77B | No disponible | Mismas tareas que base | MIT | HuggingFace (`microsoft/Florence-2-large`) |
| Florence-2-base-ft | 0,23B | No disponible | Mismas tareas, ajustado en downstream | MIT | HuggingFace (`microsoft/Florence-2-base-ft`) |
| Florence-2-large-ft | 0,77B | No disponible | Mismas tareas, ajustado en downstream | MIT | HuggingFace (`microsoft/Florence-2-large-ft`) |

La comparativa se limita a las variantes del propio modelo porque la información disponible no incluye datos de benchmarks ni de modelos alternativos de otros autores. No se dispone de cifras de rendimiento comparativo.

## Limitaciones y advertencias

- La model card disponible está truncada; no se documentan sesgos conocidos ni evaluaciones de robustez.
- Riesgo de alucinación en descripciones y en coordenadas de bounding boxes, especialmente en imágenes ambiguas o con objetos poco representados en FLD-5B.
- El modelo está orientado a prompts en inglés; el rendimiento con prompts en otros idiomas no está documentado.
- La longitud de contexto no está especificada, lo que dificulta planificar entradas con muchas regiones o descripciones largas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar el código antes de desplegarlo en producción.
- Esta variante es la *base* preentrenada; para tareas downstream suele ser preferible `Florence-2-base-ft`, que está ajustada específicamente.
- La licencia MIT permite uso comercial, pero se recomienda verificar la procedencia del repositorio `CollectionStudio/Florence-2-base` frente al oficial de Microsoft antes de depender de él en producción.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso; no debe emplearse como sustituto de un LLM generalista.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/CollectionStudio/Florence-2-base
- Repositorio oficial (Microsoft): https://huggingface.co/microsoft/Florence-2-base
- Informe técnico (arXiv): https://arxiv.org/abs/2311.06242
- Notebook de inferencia y visualización (Florence-2-large): https://huggingface.co/microsoft/Florence-2-large/blob/main/sample_inference.ipynb
- Licencia MIT: https://huggingface.co/microsoft/Florence-2-base/resolve/main/LICENSE
