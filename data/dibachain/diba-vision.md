# Dibachain/Diba-Vision

## Resumen

Diba-Vision es un modelo vision-language (imagen + texto → texto) desarrollado por Dibachain, un proyecto iraní que mantiene la familia de modelos Diba (Diba-Base, Diba-Embed, Diba-Code, Diba-TTS, Diba-STT, entre otros). Su propuesta diferencial es ser "Persian-first": combina un codificador multimodal con la capacidad lingüística en persa (farsi) del resto de la familia, cubriendo un nicho donde la mayoría de los VLM abiertos rinden de forma pobre. Acepta una o varias imágenes junto a un prompt de texto y responde en el idioma de la pregunta, con conversación multi-turno.

El modelo tiene aproximadamente 4B parámetros según su model card, y el recuento real de pesos en safetensors asciende a 4.659.865.088 parámetros (≈4,66B). Se distribuye bajo licencia Apache 2.0, con pesos en safetensors y soporte para la librería transformers mediante `AutoModelForImageTextToText` y `trust_remote_code=True`, ya que incluye definición de modelo propia (custom_code).

Es relevante ahora por dos motivos: primero, amplía el conjunto de VLM abiertos con cobertura real de persa, un idioma con poca representación en modelos multimodales abiertos; segundo, su licencia permisiva y su tamaño moderado lo hacen desplegable en hardware de gama alta de consumo, algo poco habitual en VLM con capacidades OCR multilingües. El repositorio ocupa 18,7 GB, lo que sugiere pesos en precisión completa o bfloat16. El modelo no publica resultados de benchmarks ni detalles de arquitectura interna más allá de su naturaleza multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (imagen + texto → texto); codificador multimodal + modelo de lenguaje de la familia Diba. Detalle interno no disponible |
| Parametros totales | 4.659.865.088 (≈4,66B) segun safetensors; la model card indica ~4B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF, AWQ o GPTQ; el ejemplo oficial carga en bfloat16) |
| Idiomas soportados | Persa (farsi), ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` por definicion de modelo propia) |

## Arquitectura y entrenamiento

La model card describe Diba-Vision como la union de "la comprension visual de un codificador multimodal fuerte" con la capacidad de lenguaje persa de la familia Diba. No se especifica qué codificador visual se emplea, ni el número de capas, dimensión oculta, tipo de atención del componente de lenguaje, ni si se trata de un transformer denso, MoE o arquitectura híbrida. Tampoco se detalla la estrategia de alineación multimodal (proyector tipo MLP, cross-attention, resampler, etc.).

No hay información pública en la documentación proporcionada sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni sobre innovaciones técnicas concretas (decodificación especulativa, atención lineal, ventana deslizante). El único detalle operativo relevante es que el modelo requiere cargar código remoto (`trust_remote_code=True`), lo que implica que la clase de modelo y el procesador no están integrados en las versiones estándar de transformers y deben descargarse desde el repositorio.

## Capacidades

- Generación de descripciones de imágenes en persa y en inglés de forma fluida.
- Lectura de texto dentro de imágenes (capacidad tipo OCR): carteles, documentos, formularios y texto impreso con apariencia manuscrita, en persa y en inglés.
- Análisis de capturas de pantalla: interfaces de usuario, gráficos, tablas y capturas de código.
- Respuesta a preguntas visuales: qué ocurre en la escena, qué dice un cartel, qué problema presenta una interfaz.
- Razonamiento conjunto sobre imagen y texto dentro de una misma conversación.
- Entrada de una o múltiples imágenes junto con un prompt de texto.
- Conversación multi-turno.
- Salida en texto, en el idioma en que se formule la pregunta.
- No se documenta soporte de tool calling, function calling, uso agente ni modo de razonamiento explícito (thinking mode).
- No genera imágenes: es un modelo de comprensión, no de síntesis visual.

## Casos de uso

- Digitalización de documentos en persa: extracción de texto de facturas, formularios y documentos administrativos iraníes mediante comprensión tipo OCR, con salida en persa o inglés según convenga al pipeline posterior.
- Traducción asistida de carteles y señalética: el modelo lee texto en persa dentro de una fotografía y lo describe o traduce, útil en aplicaciones de viaje o señalización urbana.
- Atención al cliente con evidencia visual: un usuario envía una captura de su pantalla o un recibo y el modelo interpreta el contenido y responde en persa, manteniendo el contexto en conversaciones multi-turno.
- Revisión de interfaces de usuario: análisis de capturas de UI para detectar problemas de maquetación o contenido, aprovechando la capacidad declarada de evaluar "qué falla en esta interfaz".
- Accesibilidad para contenido en persa: generación de descripciones textuales de imágenes para lectores de pantalla o catálogos, en un idioma con poca cobertura en VLM abiertos.
- Procesamiento de capturas de código: lectura de fragmentos de código en pantalla para explicarlos o resumirlos, aunque para tareas puramente de código la propia model card remite a Diba-Base.
- Enriquecimiento de bases documentales: preprocesado de imágenes de archivo para generar metadatos o descripciones indexables, combinable con Diba-Embed para búsqueda semántica.
- Moderación o auditoría de contenido visual: descripción automática de imágenes entrantes para revisión humana posterior, siempre con supervisión dado el riesgo de error en textos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MMMU, DocVQA, TextVQA ni ningún otro conjunto de evaluación, ni comparaciones cuantitativas con modelos alternativos. Tampoco se documentan latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada en bfloat16: los 4,66B parámetros ocupan aproximadamente 9,3 GB solo en pesos, más overhead de activaciones y caché KV; en la práctica se necesitan del orden de 12-16 GB para inferencia con prompts e imágenes de tamaño moderado.
- VRAM estimada en int8: en torno a 5-6 GB de pesos, más overhead. No hay variantes cuantizadas oficiales publicadas, por lo que requeriría cuantización manual.
- VRAM estimada en int4: en torno a 3-4 GB de pesos, más overhead. Igualmente sin artefactos oficiales.
- GPU recomendadas: A100 (40/80 GB), H100, L40S para servidores; RTX 4090 (24 GB) y RTX 3090 (24 GB) como opciones de gama alta de consumo con margen amplio en bfloat16.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (RTX 4080/4090, RTX 3090, RTX A4000 16 GB con margen ajustado). En 12 GB sería necesario cuantizar.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` y `trust_remote_code=True` es la vía documentada oficialmente. No se confirma compatibilidad con vLLM, TGI, llama.cpp u Ollama; al usar código de modelo personalizado, estos motores probablemente requieran integración adicional no documentada.
- Latencia y throughput: no disponible.
- El repositorio pesa 18,7 GB, por encima de lo esperable para 4,66B parámetros en bfloat16 (≈9,3 GB), lo que sugiere que puede contener múltiples copias o pesos en mayor precisión; conviene verificar los archivos antes de planificar el despliegue.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de Diba-Vision, por lo que la comparación se limita a parámetros, licencia y disponibilidad. Los valores de contexto y calidad de los modelos alternativos no se declaran aquí salvo que sean datos ampliamente conocidos y verificables.

| Modelo | Parametros | Idiomas destacados | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Diba-Vision (Dibachain) | ≈4,66B | Persa, ingles | Apache 2.0 | HuggingFace, requiere `trust_remote_code` | No disponible |
| Qwen2-VL-7B (Alibaba) | ≈8,3B | Multilingue, incluye cobertura de arabe y otros idiomas de la region | Apache 2.0 | HuggingFace, integrado en transformers y vLLM | No comparable con datos disponibles aqui |
| PaliGemma-3B (Google) | ≈3B | Ingles principalmente | Licencia Gemma (con condiciones de uso) | HuggingFace, integrado en transformers | No comparable con datos disponibles aqui |
| LLaVA-1.6 (familia abierta) | 7B/13B/34B | Ingles principalmente | Apache 2.0 en las variantes Mistral | HuggingFace | No comparable con datos disponibles aqui |

La ventaja diferencial de Diba-Vision frente a estas alternativas no es el rendimiento bruto, sino la cobertura nativa de persa y una licencia Apache 2.0 sin condiciones adicionales, frente a las restricciones de uso de la licencia Gemma.

## Limitaciones y advertencias

- Sesgos: la model card reconoce explícitamente que el modelo "refleja los sesgos presentes en sus datos de entrenamiento". No se detalla la composición del dataset ni se documentan evaluaciones de sesgo.
- Alucinación: no se publica ninguna evaluación de veracidad. En tareas de OCR y descripción de documentos, un error de lectura puede propagarse como un dato falso con apariencia plausible.
- Texto pequeño o de baja calidad: la propia documentación advierte de que el texto muy pequeño, los escaneos de baja calidad y los diagramas altamente especializados pueden leerse mal.
- Cobertura de idiomas limitada a persa e inglés. No hay evidencia de soporte fiable en castellano u otros idiomas.
- Longitud de contexto desconocida: al no especificarse, no se puede garantizar el comportamiento en conversaciones largas o con muchas imágenes encadenadas.
- Licencia Apache 2.0: permisiva para uso comercial, sin las restricciones habituales de licencias como Gemma o Llama. No obstante, el uso de `trust_remote_code=True` implica ejecutar código del repositorio del autor; conviene auditar ese código antes de desplegarlo en producción.
- Sin benchmarks publicados: no hay ninguna métrica objetiva que respalde las capacidades declaradas, lo que dificulta la comparación con alternativas y la estimación de coste/beneficio.
- Sin variantes cuantizadas oficiales ni confirmación de soporte en motores de inferencia de alto rendimiento (vLLM, TGI), lo que complica el escalado en producción.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, con un historial de publicación muy reciente. No existe comunidad ni reportes independientes de uso.
- No genera imágenes; no debe emplearse para síntesis visual ni edición de imágenes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dibachain/Diba-Vision
- Sitio del desarrollador: https://dibachain.ir
- Demo de chat en GPU (Space): https://huggingface.co/spaces/DibaAi/diba-chat-gpu
- Diba-Base (modelo de texto y código): https://huggingface.co/Dibachain/Diba-Base
- Diba-Embed (búsqueda semántica): https://huggingface.co/Dibachain/Diba-Embed

Nota: la búsqueda web realizada no devolvió ningun resultado relevante sobre Diba-Vision ni sobre Dibachain; los enlaces anteriores proceden unicamente de la model card y de la ficha de HuggingFace del modelo. No se han encontrado papers, blogs tecnicos ni repositorios independientes asociados.
