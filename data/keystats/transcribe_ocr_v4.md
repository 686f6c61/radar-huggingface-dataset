# keystats/Transcribe_ocr_v4

## Resumen

`keystats/Transcribe_ocr_v4` es un modelo multimodal de tipo imagen-a-texto publicado en HuggingFace por el usuario `keystats`. Se distribuye en formato `safetensors` para la librería `transformers` y su pipeline declarado es `image-text-to-text`, lo que implica que acepta entradas de imagen (y presumiblemente texto) y genera texto como salida. El repositorio ocupa 17,5 GB y los pesos reales suman 8.767.123.696 parámetros (aproximadamente 8,77 mil millones), una cifra coherente con un checkpoint almacenado en precisión bf16/fp16 (unos 2 bytes por parámetro).

La etiqueta `qwen3_vl` incluida en el repositorio apunta a que el modelo parte de la familia Qwen3-VL, aunque la model card no confirma la arquitectura base ni el proceso de ajuste. El nombre del modelo sugiere un ajuste fino orientado a transcripción y OCR, en su cuarta iteración, pero no hay documentación publicada que lo verifique. Es relevante precisamente por eso: se trata de un modelo con muy poca información pública (0 descargas y 0 likes en el momento de la consulta), sin licencia declarada, sin idiomas declarados y con una model card autogenerada por la plataforma que no ha sido completada por el autor.

En consecuencia, esta ficha refleja únicamente los metadatos verificables del repositorio (tamaño, formato, pipeline, etiquetas) y marca explícitamente como «no disponible» todo aquello que el autor no ha documentado. Cualquier evaluación seria de este checkpoint requiere inspección directa de los pesos, del tokenizador y del `config.json` antes de considerarlo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; la etiqueta del repositorio indica `qwen3_vl`, lo que sugiere una base Qwen3-VL (transformer multimodal con torre de visión), sin confirmar |
| Parametros totales | 8.767.123.696 (8,77 B), dato real de los safetensors |
| Parametros activos | No disponible (no hay indicios de que sea MoE; la etiqueta apunta a un modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene pesos `safetensors`, presumiblemente en bf16/fp16 (17,5 GB para 8,77 B de parámetros). No se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (librería `transformers`) |

Otros metadatos verificables: pipeline `image-text-to-text`, etiquetas `transformers`, `safetensors`, `qwen3_vl`, `conversational`, `endpoints_compatible`, `region:us`; fecha de creación 2026-09-13; última actualización 2026-09-13; 0 descargas y 0 likes.

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna, el proceso de entrenamiento, el volumen de datos, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. La model card del repositorio es la plantilla autogenerada por HuggingFace y todos los campos relevantes (`Model type`, `Training Data`, `Training Procedure`, `Training Hyperparameters`, `Evaluation`) aparecen como `[More Information Needed]`. La única pista estructural es la etiqueta `qwen3_vl`, que sugiere una arquitectura de transformer multimodal con codificador de visión y decodificador de lenguaje, probablemente heredada de un checkpoint Qwen3-VL y posteriormente ajustada.

Tampoco se documenta ninguna innovación técnica específica (decodificación especulativa, atención lineal, modo de razonamiento explícito, etc.). El número de parámetros (8,77 B) y el tamaño del repositorio (17,5 GB) son los dos únicos puntos de anclaje técnicos: el cociente entre ambos (aproximadamente 2 bytes por parámetro) es consistente con pesos en bf16 o fp16 sin cuantizar. La referencia `arxiv:1910.09700` que aparece en las etiquetas corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono, citado en la plantilla estándar de model cards; no es un paper sobre este modelo.

## Capacidades

- Generación de texto condicionada por imagen (pipeline `image-text-to-text`), es decir, respuestas en lenguaje natural a partir de entradas visuales.
- Interacción conversacional: la etiqueta `conversational` indica soporte de formato de chat con turnos múltiples, aunque no se detalla la plantilla exacta.
- Compatibilidad declarada con endpoints gestionados de HuggingFace (`endpoints_compatible`).
- Orientación probable a transcripción y OCR, inferida únicamente del nombre del modelo (`Transcribe_ocr_v4`); no confirmada por el autor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Capacidades especiales (modo thinking, audio, vídeo, grounding): no disponible.
- Longitud de contexto efectiva, resolución de imagen soportada y número de tokens visuales por imagen: no disponible.

## Casos de uso

Advertencia previa: al no existir documentación del autor, los casos siguientes son escenarios plausibles derivados del pipeline declarado (`image-text-to-text`) y del nombre del modelo, no capacidades verificadas. Requieren validación empírica antes de cualquier despliegue.

- Digitalización de documentos escaneados: extracción de texto de facturas, contratos o formularios en PDF rasterizado, usando el modelo como motor de OCR que devuelve texto estructurado. Es el caso más coherente con el nombre del checkpoint, pero hay que comprobar la tasa de error por tipo de documento antes de sustituir un OCR clásico.
- Extracción de campos estructurados: envío de una imagen de documento con una instrucción de tipo «devuelve JSON con fecha, emisor e importe» para alimentar un pipeline de contabilidad. Depende de la capacidad de seguir instrucciones de formato, no documentada.
- Accesibilidad: descripción automática de imágenes para lectores de pantalla en aplicaciones internas, aprovechando el pipeline imagen-a-texto.
- Moderación de contenido visual: clasificación y descripción de imágenes subidas por usuarios para detectar contenido no permitido, siempre que se valide el sesgo del modelo en dominios sensibles.
- Automatización de soporte con capturas de pantalla: el usuario adjunta una captura de un error y el modelo describe el problema en texto para enrutarlo a un sistema de tickets.
- Preprocesado para RAG multimodal: convertir imágenes de informes, gráficos o pizarras en texto indexable dentro de una base vectorial, de modo que los documentos no textuales entren en el corpus de recuperación.
- Anotación asistida de datasets: generación de descripciones o transcripciones preliminares que luego revisa un anotador humano, reduciendo el coste por muestra en proyectos de visión por computador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye la sección de evaluación cumplimentada (todos los campos aparecen como `[More Information Needed]`), el autor no ha publicado tabla comparativa alguna y las búsquedas web realizadas no han devuelto ningún resultado relacionado con este modelo. No se dispone por tanto de datos de MMLU, HumanEval, GSM8K, DocVQA, OCRBench, TextVQA ni de ninguna otra métrica.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento real de parámetros (8,77 B) y del tamaño del repositorio (17,5 GB), no datos publicados por el autor:

- Pesos en bf16/fp16: aproximadamente 17,5 GB en disco y en memoria. Es la única precisión disponible en el repositorio.
- VRAM estimada para inferencia en bf16: en torno a 20-24 GB considerando pesos, caché KV y memoria de activaciones, que en un modelo de visión aumenta con el número de tokens de imagen por petición.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, L40S 48 GB o A6000 48 GB para bf16 con margen; para lotes pequeños podría bastar una GPU de 24 GB.
- GPU de consumo: cabe en una RTX 3090 o RTX 4090 de 24 GB en bf16 con contexto y resolución de imagen moderados; en GPUs de 16 GB o menos sería necesario cuantizar, y no se publican pesos cuantizados.
- Despliegue: al ser un repositorio `transformers` con `safetensors` y etiqueta `endpoints_compatible`, la vía natural es HuggingFace Transformers, Text Generation Inference o vLLM. La disponibilidad de soporte específico para esta arquitectura concreta en vLLM, llama.cpp u Ollama no está confirmada y debe verificarse contra los pesos reales.
- Latencia y throughput: no disponible. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

No hay datos suficientes sobre el modelo evaluado para una comparativa rigurosa: su licencia, contexto, idiomas y rendimiento son «no disponible». La tabla siguiente recoge la comparación estructural posible. Los datos de las alternativas provienen de sus model cards públicas y deben verificarse en la fuente original; se incluyen como referencia de categoría (modelos multimodales densos de 7-9 B de parámetros), no como medición de este checkpoint.

| Modelo | Parametros | Licencia | Contexto | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| keystats/Transcribe_ocr_v4 | 8,77 B (dato real) | No disponible | No disponible | Solo `safetensors` en HuggingFace; 0 descargas, 0 likes | No disponible |
| Qwen2.5-VL-7B | En torno a 7,6 B | Apache 2.0 | 128 000 tokens | Pesos oficiales en HuggingFace, versiones cuantizadas comunitarias | Publicado en su model card |
| Qwen3-VL-8B | En torno a 8 B | Apache 2.0 | 256 000 tokens nativos | Pesos oficiales en HuggingFace | Publicado en su model card |
| InternVL3-8B | En torno a 8 B | Apache 2.0 | No disponible en esta ficha | Pesos oficiales en HuggingFace | Publicado en su model card |

Advertencia: no está confirmado que `Transcribe_ocr_v4` derive de Qwen3-VL-8B, por lo que la fila de comparación con esa base es una hipótesis basada en la etiqueta del repositorio. Cualquier decisión de sustitución entre estos modelos debe apoyarse en una evaluación propia sobre el dominio objetivo.

## Limitaciones y advertencias

- Model card vacía: la información pública se limita a metadatos de plataforma; no hay descripción, guía de uso, código de ejemplo ni procedimiento de entrenamiento.
- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial. En la práctica, la ausencia de licencia equivale a «todos los derechos reservados» por defecto en muchas jurisdicciones, por lo que su uso en producción requiere contacto previo con el autor.
- Riesgo de alucinación: no cuantificado ni evaluado. En tareas de OCR y transcripción, una alucinación se traduce directamente en texto inventado dentro de un documento, un fallo especialmente peligroso en contextos legales, médicos o financieros.
- Sesgos: no documentados. Un modelo multimodal puede heredar sesgos de su base y de los datos de ajuste en la descripción de personas, culturas o contextos geográficos.
- Cobertura idiomática desconocida: no se declara ningún idioma, por lo que el comportamiento en castellano es una incógnita hasta que se pruebe.
- Longitud de contexto desconocida: limita el diseño de aplicaciones con documentos largos o conversaciones multi-turno prolongadas.
- Procedencia dudosa del ajuste: no se especifica el checkpoint base, la fecha del ajuste ni el dataset utilizado, lo que impide auditar la trazabilidad de los datos.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones públicas. No hay comunidad que haya validado el modelo.
- Fecha de publicación futura en los metadatos (2026-09-13), incoherente con la consulta; conviene verificar si el repositorio se ha actualizado después.
- Sin versiones cuantizadas: la ausencia de GGUF, AWQ o GPTQ dificulta el despliegue en hardware de consumo o en entornos con VRAM limitada.
- Antes de usarlo en producción se recomienda: inspeccionar `config.json` y el tokenizador, verificar la plantilla de chat, medir la tasa de error en el dominio objetivo y confirmar la licencia con el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/keystats/Transcribe_ocr_v4
- Perfil del autor: https://huggingface.co/keystats
- Referencia citada en las etiquetas (Lacoste et al., 2019, sobre estimación de emisiones de carbono, no específica de este modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automático mencionada en la plantilla: https://mlco2.github.io/impact

No se han encontrado papers, blogs, repositorios de código ni demos asociados a este modelo. Las búsquedas web realizadas no devolvieron resultados relacionados con `keystats/Transcribe_ocr_v4` ni con el autor.
