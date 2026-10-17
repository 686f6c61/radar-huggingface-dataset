# mradermacher/Irwan-LightOnOCR-3-0.8B-abliterated-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo `irwanworld/Irwan-LightOnOCR-3-0.8B-abliterated`, una variante "abliterated" (con la dirección de rechazo suprimida por manipulación de pesos) del OCR vision-language `lightonai/LightOnOCR-3-0.8B` de LightOn AI. El trabajo de cuantización lo firma mradermacher y cubre desde Q2_K hasta f16, además de los ficheros `mmproj` necesarios para procesar imágenes en llama.cpp. El modelo base declara 752.393.024 parámetros (0,75 B), licencia Apache 2.0 y soporte de inglés e indonesio.

LightOnOCR-3 es la tercera generación de la familia OCR end-to-end de LightOn, planteada como un único modelo compacto que resuelve transcripción de texto, análisis de maquetación (layout) y comprensión de imágenes y gráficos, con mejoras declaradas en velocidad y calidad de transcripción respecto a la generación anterior. Al ser un modelo de menos de mil millones de parámetros, su interés práctico está en el despliegue en hardware modesto: CPU, iGPU o GPUs de consumo con 4-8 GB de VRAM, sin depender de APIs externas.

La relevancia de esta ficha concreta es doble: por un lado permite ejecutar un OCR moderno en local vía llama.cpp; por otro, conviene tener presente que se trata de una variante abliterated de procedencia no documentada en detalle, cuyos efectos sobre la precisión de transcripción no han sido publicados, y de unas cuantizaciones estáticas (sin imatrix) para las que el autor no ha publicado métricas de perplejidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (pipeline image-text-to-text); etiquetada como `qwen3_5` en la model card. Detalles de capas y attention no disponibles |
| Parámetros totales | 752.393.024 (0,75 B), dato de safetensors del modelo base |
| Parámetros activos | No aplica (no hay evidencia de arquitectura MoE en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ficheros `mmproj` en Q8_0 y f16. Solo cuantizaciones estáticas, sin variantes ponderadas/imatrix publicadas por el autor |
| Idiomas soportados | Inglés (en) e indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base y en la variante sin cuantizar |
| Tamaño del repositorio | 7,8 GB (incluye todas las cuantizaciones) |
| Rango de tamaño de los ficheros | 0,2 GB (`mmproj-Q8_0`) a 1,6 GB (`f16`) |
| Etiquetas del pipeline | ocr, image-text-to-text, vision, document-parsing, abliterated, uncensored, conversational |
| Versión de cuantización | `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf` |
| Fecha de publicación | 17 de octubre de 2026 |

## Arquitectura y entrenamiento

La información disponible identifica la arquitectura como un transformer vision-language de tipo image-text-to-text, con la etiqueta `qwen3_5`, lo que sitúa la familia del modelo base en el linaje Qwen3.5 adaptado por LightOn para OCR. LightOn describe LightOnOCR-3 como una familia de modelos OCR end-to-end que cubren texto, layout, imagen y gráficos desde un único modelo compacto, con mejoras de velocidad y calidad de transcripción frente a la generación anterior y nuevas capacidades de comprensión visual. No se detallan en la información proporcionada el número de capas, las dimensiones ocultas, el mecanismo de atención ni el tipo de encoder visual.

Tampoco hay datos públicos en esta ficha sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO o el proceso de alineación del modelo original. Respecto a esta variante concreta, el sufijo "abliterated" indica que se ha aplicado una técnica de supresión de la dirección de rechazo sobre los pesos (habitualmente ortogonalización de activaciones o de matrices de proyección), práctica que elimina las negativas del modelo pero que puede degradar capacidades generales si no se controla. El autor de la variante abliterated es `irwanworld`; no se documentan en el repositorio ni el procedimiento exacto ni la evaluación posterior. Las cuantizaciones de mradermacher son conversiones estáticas desde safetensors en formato HF, sin recalibración con imatrix, lo que en la práctica suele implicar una perplejidad ligeramente superior a la de cuantizaciones ponderadas del mismo tamaño.

## Capacidades

- Transcripción OCR end-to-end de documentos: texto impreso en imágenes y páginas completas, con salida en formato conversacional.
- Análisis de maquetación (layout): identificación de bloques, orden de lectura y estructura del documento según las capacidades declaradas de la familia LightOnOCR-3.
- Extracción de tablas y formularios, según las etiquetas `tables`, `forms` y `document-parsing` del modelo base.
- Comprensión de imágenes y gráficos: interpretación de figuras y charts integrada en el mismo modelo, no como pipeline separado.
- Visual grounding: localización de regiones o elementos en la imagen, según la etiqueta `visual-grounding` del modelo base.
- Interfaz image-text-to-text conversacional: admite prompts en lenguaje natural sobre la imagen en lugar de una API de transcripción fija.
- Multilingüe limitado a inglés e indonesio.
- Modo "uncensored": el modelo no aplica rechazos aprendidos, lo que en OCR puede ser útil para documentos sensibles (con los riesgos indicados más abajo).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está orientado a percepción documental, no a planificación.
- Modo thinking, audio o vídeo: no disponible.

## Casos de uso

- Digitalización masiva de archivo administrativo: el modelo transcribe páginas escaneadas completas en una sola pasada y devuelve texto estructurado, lo que permite procesar lotes de PDF con un pipeline llama.cpp en CPU y evitar costes de API por página.
- Extracción de datos de facturas y albaranes: con la capacidad de tablas y formularios, se le puede pedir directamente un JSON con emisor, fecha, base imponible y líneas de detalle, usando el prompt conversacional en lugar de reglas posicionales frágiles.
- Ingesta de documentos para RAG: al conservar información de layout y orden de lectura, el texto extraído mantiene la estructura de secciones y tablas necesaria para trocear y generar embeddings con coherencia semántica.
- Procesamiento on-premise con requisitos de confidencialidad: con cuantizaciones Q4_K_M de 0,6 GB más el `mmproj`, el modelo cabe en cualquier portátil con 8 GB de RAM, lo que permite tratar documentación médica, legal o financiera sin que las imágenes salgan de la infraestructura propia (relevante para cumplimiento del RGPD).
- Enriquecimiento de informes con gráficos: al incluir comprensión de charts, puede generar descripciones textuales de figuras para informes anuales o artículos, alimentando resúmenes o metadatos de búsqueda.
- Anotación y recorte de regiones: la capacidad de visual grounding permite localizar campos concretos (sellos, firmas, casillas) y devolver coordenadas o descripciones para herramientas de revisión humana.
- Documentación en indonesio e inglés en contextos de comercio internacional: útil para digitalizar documentación aduanera o contractual en esos dos idiomas, que son los declarados por el modelo.
- Prototipado y evaluación comparativa de OCR: su tamaño reducido y su licencia Apache 2.0 lo hacen adecuado como línea base rápida frente a OCR clásico (Tesseract, PaddleOCR) o modelos VLM de mayor tamaño antes de comprometerse con una arquitectura en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización no incluye métricas, y las referencias públicas de LightOn mencionan mejoras de velocidad y calidad de transcripción frente a la generación anterior de LightOnOCR, pero sin cifras concretas en el material consultado. Tampoco hay datos de perplejidad comparando las cuantizaciones estáticas con las originales en f16.

## Requisitos de hardware

- VRAM estimada (pesos + `mmproj`, sin contar KV cache ni activaciones de imagen): f16 ≈ 1,9 GB; Q8_0 ≈ 1,1 GB; Q6_K ≈ 0,9 GB; Q4_K_M ≈ 0,8 GB; Q2_K ≈ 0,7 GB. Añadir entre 0,3 y 1,5 GB adicionales según resolución de imagen y longitud de contexto (estimación propia a partir del tamaño de los ficheros; no publicada por el autor).
- LLM Explorer cita 1,7 GB de VRAM para el modelo LightOnOCR-3-0.8B, coherente con pesos en bf16 más overhead.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM funciona con Q4_K_M o Q8_0 (GTX 1650, RTX 3050/4060, RTX A2000, T4). Para f16 y lotes grandes conviene 8 GB o más (RTX 3060 Ti/4070, L4). No requiere A100/H100.
- Cabe en GPU de consumo: sí, de forma holgada; también en iGPU con memoria unificada (Apple Silicon, AMD APU) y en CPU pura, donde el cuello de botella será el encoder visual más que el decodificador.
- Opciones de despliegue: llama.cpp (`llama-mtmd-cli` o `llama-server --mmproj`), LM Studio y derivados; transformers con los safetensors del modelo base. Soporte en vLLM, TGI u Ollama para esta combinación multimodal GGUF: no confirmado en la información disponible.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, un modelo denso de 0,75 B en Q4_K_M decodifica a decenas de tokens por segundo en CPU moderna y a cientos en GPU de consumo, pero el coste dominante en OCR es el preprocesado y codificado de la imagen, que no está medido aquí.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| mradermacher/Irwan-LightOnOCR-3-0.8B-abliterated-GGUF (este) | 0,75 B | No disponible | en, id | Apache 2.0 | GGUF (12 cuantizaciones + 2 mmproj) | Cuantización estática de una variante abliterated; sin métricas publicadas |
| irwanworld/Irwan-LightOnOCR-3-0.8B-abliterated | 0,75 B | No disponible | en, id | Apache 2.0 | Safetensors | Fuente de este repositorio; variante abliterated sin evaluación documentada |
| lightonai/LightOnOCR-3-0.8B | 0,75 B (aproximado, misma familia) | No disponible | en (la ficha del modelo original declara inglés) | Apache 2.0 | Safetensors | Modelo original de LightOn, sin modificación de pesos; opción conservadora para producción |
| mradermacher/LightOnOCR-3-0.8B-i1-GGUF | 0,75 B (aproximado) | No disponible | en | Apache 2.0 | GGUF (imatrix) | Cuantizaciones ponderadas del modelo original; previsiblemente mejor relación calidad/tamaño que las estáticas de esta ficha |

## Limitaciones y advertencias

- La abliteración modifica los pesos del modelo original para eliminar la dirección de rechazo; no hay evaluación publicada del impacto sobre la precisión de transcripción, la fidelidad al layout o la tasa de alucinación en OCR. Para producción documental conviene comparar contra el modelo original no abliterado.
- Riesgo de alucinación inherente a los modelos generativos aplicados a OCR: puede inventar texto en regiones ilegibles, borrosas o con ruido, y completar tablas con celdas que no existen. Es imprescindible validación posterior en flujos críticos.
- Idiomas declarados: inglés e indonesio. El rendimiento en castellano no está documentado en la información disponible, por lo que no debe asumirse para documentación en español sin una evaluación previa.
- Modelo de 0,75 B: previsiblemente frágil con escritura manuscrita, documentos densos, tipografías decorativas, escaneos de baja resolución o tablas muy complejas. No hay benchmarks que cuantifiquen estos límites.
- Al estar "uncensored", no aplica filtros de rechazo: si la imagen contiene contenido sensible, el modelo puede transcribirlo o describirlo sin restricciones. Esto es deseable en OCR legítimo, pero exige controles de acceso y trazabilidad en el pipeline.
- Contexto máximo no documentado: no se puede planificar la longitud de documento por pasada sin probarlo empíricamente.
- Cuantizaciones estáticas sin imatrix: el autor indica que las variantes ponderadas no estaban disponibles en el momento de la publicación; las IQ/Q de menor tamaño (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de transcripción.
- Es necesario descargar un fichero `mmproj` (Q8_0 o f16) además de los pesos; sin él, el modelo no procesa imágenes en llama.cpp.
- Licencia Apache 2.0, que permite uso comercial, pero la procedencia del dataset de entrenamiento y del proceso de abliterated no está documentada; conviene revisar la ficha del modelo original y del modelo base antes de un despliegue comercial.
- La fecha de publicación del repositorio (17 de octubre de 2026) y la ausencia de likes o discusiones implican escasa validación comunitaria: 411 descargas y 0 likes en el momento de redactar esta ficha.
- Repositorio de 7,8 GB: descargar la cuantización concreta, no el repo completo, para evitar consumo innecesario de disco y ancho de banda.

## Enlaces

- Repositorio HF de esta ficha: https://huggingface.co/mradermacher/Irwan-LightOnOCR-3-0.8B-abliterated-GGUF
- Modelo base de la cuantización: https://huggingface.co/irwanworld/Irwan-LightOnOCR-3-0.8B-abliterated
- Modelo original de LightOn: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
- Cuantizaciones imatrix del modelo original: https://huggingface.co/mradermacher/LightOnOCR-3-0.8B-i1-GGUF
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#Irwan-LightOnOCR-3-0.8B-abliterated-GGUF
- Anuncio de la familia LightOnOCR-3: https://www.lighton.ai/research/lightonocr-3
- Ficha en LLM Explorer (VRAM estimada): https://llm-explorer.com/model/lightonai%2FLightOnOCR-3-0.8B,4PHiKx0FrtOHBhaUqDNGwe
- Referencia en Papers with Code: https://paperswithcode.co/paper/123023
- Artículo arXiv citado por el modelo original: https://arxiv.org/abs/2601.14251
- Artículo arXiv adicional citado por el modelo original: https://arxiv.org/abs/2412.13663
- Guía de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
