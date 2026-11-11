# Kasemcyber/Qwen2.5-VL-3B-Instruct-UNCENSORED-GGUF

## Resumen

Qwen2.5-VL-3B-Instruct-UNCENSORED-GGUF es una cuantización en formato GGUF del modelo vision-language Qwen2.5-VL-3B-Instruct, publicada por el usuario Kasemcyber en Hugging Face. El modelo base lo desarrolla el equipo Qwen de Alibaba, y esta variante concreta se presenta como una versión "sin censura" (uncensored) del modelo instruct original, es decir, un ajuste que elimina total o parcialmente los mecanismos de rechazo y alineación de seguridad del modelo original. El repositorio contiene únicamente pesos cuantizados en GGUF, con un tamaño total de 26,2 GB, lo que indica que incluye múltiples niveles de cuantización (típicamente Q2 a Q8 y posiblemente F16).

El modelo base es un transformer multimodal de 3.085.938.688 parámetros (aproximadamente 3B) que procesa texto e imágenes, diseñado para tareas image-text-to-text. Incorpora un encoder visual ViT optimizado con window attention, SwiGLU y RMSNorm, y un LLM Qwen2.5 subyacente. Según la model card heredada del modelo original, soporta comprensión de imágenes, gráficos, tablas, documentos escaneados, vídeo de más de una hora y localización visual mediante bounding boxes o puntos.

La relevancia de esta ficha radica en dos aspectos: por un lado, la disponibilidad de un modelo multimodal de 3B en GGUF facilita el despliegue en hardware de consumo; por otro, la naturaleza "uncensored" introduce riesgos importantes de seguridad y de cumplimiento de licencia que deben considerarse antes de cualquier uso en producción. El modelo se publicó el 11 de noviembre de 2026 y, en el momento de la consulta, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (ViT + LLM Qwen2.5), vision-language |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-VL-3B soporta contexto largo, pero no se especifica el valor exacto) |
| Tipos de cuantizacion | GGUF (multiples niveles, inferido del tamano del repo de 26,2 GB; niveles exactos no disponibles) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | qwen-research |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-VL-3B-Instruct emplea una arquitectura de dos componentes: un encoder visual basado en ViT y un modelo de lenguaje Qwen2.5. El encoder visual incorpora window attention para acelerar entrenamiento e inferencia, y se ha alineado estructuralmente con el LLM mediante SwiGLU y RMSNorm. Para vídeo, el modelo utiliza muestreo dinámico de FPS y extiende el mRoPE (multimodal Rotary Position Embedding) a la dimensión temporal con IDs y alineación de tiempo absoluto, lo que permite localizar momentos concretos en secuencias de vídeo. La resolución también es dinámica, de modo que el modelo procesa imágenes a distintas resoluciones sin reescalado fijo.

En cuanto a los datos de entrenamiento, la model card original menciona el dataset `openai/MMMLU` como referencia y cita los papers arXiv:2309.00071, arXiv:2409.12191 y arXiv:2308.12966, pero no detalla el número de tokens, la composición del corpus ni si hubo RLHF o DPO en esta variante concreta. La modificación "UNCENSORED" no está documentada técnicamente en la información disponible: no se especifica qué dataset de desalineación se usó, cuántas épocas, ni qué metodología (fine-tuning, abliteration, DPO invertido u otra) se aplicó. Esta ausencia de documentación es un caveat relevante para cualquier evaluación rigurosa.

## Capacidades

- Generación de texto y razonamiento multimodal: responde preguntas sobre imágenes, gráficos, diagramas e iconos.
- Comprensión de documentos: análisis de facturas, formularios, tablas y scans con salida estructurada (JSON) de coordenadas y atributos.
- Localización visual: generación de bounding boxes y puntos para objetos dentro de una imagen.
- Comprensión de vídeo: procesamiento de vídeos de más de una hora y localización de eventos concretos en el tiempo.
- Capacidades de agente visual: uso de ordenador y teléfono (computer use, phone use), con razonamiento y dirección dinámica de herramientas.
- Soporte de tool calling y function calling: el modelo base está diseñado para integración en pipelines de agentes.
- Capacidades multilingües: limitadas al inglés según la model card, aunque el modelo base Qwen2.5-VL tiene soporte multilingüe más amplio no reflejado en esta ficha.
- Modo "uncensored": eliminación de rechazos de seguridad, lo que amplía el rango de respuestas generadas pero incrementa el riesgo de contenido dañino.

## Casos de uso

- Extracción de datos de facturas y formularios: el modelo puede procesar scans y devolver JSON estructurado con campos, coordenadas y atributos, adecuado para automatizar la digitalización en finanzas y comercio.
- Análisis de documentos técnicos y gráficos: interpretación de diagramas, tablas y layouts en imágenes, útil para asistentes de soporte técnico que necesitan leer capturas de pantalla o manuales escaneados.
- Automatización de atención al cliente multimodal: gestión de conversaciones multi-turno donde el usuario adjunta imágenes de productos, errores o recibos, con comprensión visual integrada.
- Agentes de automatización de interfaz (RPA visual): uso de las capacidades de computer use y phone use para pilotar aplicaciones mediante reconocimiento de pantalla y localización de elementos (ScreenSpot, Android Control).
- Moderación y análisis de vídeo: localización de eventos concretos en vídeos largos (más de una hora) para tareas de vigilancia, resumen o indexación de contenido.
- Investigación en seguridad y alineación: la variante "uncensored" puede emplearse en estudios controlados sobre robustez de filtros y comportamiento de modelos desalineados, siempre en entornos aislados.
- Prototipado en hardware de consumo: al estar en GGUF, permite ejecutar un modelo multimodal de 3B en estaciones de trabajo con GPU modesta para pruebas de concepto.

## Benchmarks y rendimiento

Los datos de benchmarks corresponden al modelo base Qwen2.5-VL-3B-Instruct, no a esta cuantización GGUF ni a la variante uncensored. Se presentan tal como figuran en la model card.

| Benchmark | InternVL2.5-4B | Qwen2-VL-7B | Qwen2.5-VL-3B |
|---|---|---|---|
| MMMU val | 52,3 | 54,1 | 53,1 |
| MMMU-Pro val | 32,7 | 30,5 | 31,6 |
| AI2D test | 81,4 | 83,0 | 81,5 |
| DocVQA test | 91,6 | 94,5 | 93,9 |
| InfoVQA test | 72,1 | 76,5 | 77,1 |
| TextVQA val | 76,8 | 84,3 | 79,3 |
| MMBench-V1.1 test | 79,3 | 80,7 | 77,6 |
| MMStar | 58,3 | 60,7 | 55,9 |
| MathVista testmini | 60,5 | 58,2 | 62,3 |
| MathVision full | 20,9 | 16,3 | 21,2 |

| Benchmark de video | InternVL2.5-4B | Qwen2-VL-7B | Qwen2.5-VL-3B |
|---|---|---|---|
| MVBench | 71,6 | 67,0 | 67,0 |
| VideoMME | 63,6/62,3 | 69,0/63,3 | 67,6/61,5 |
| MLVU | 48,3 | - | 68,2 |
| LVBench | - | - | 43,3 |
| MMBench-Video | 1,73 | 1,44 | 1,63 |
| EgoSchema | - | - | 64,8 |
| PerceptionTest | - | - | 66,9 |
| TempCompass | - | - | 64,4 |
| LongVideoBench | 55,2 | 55,6 | 54,2 |
| CharadesSTA/mIoU | - | - | 38,8 |

| Benchmark de agente | Qwen2.5-VL-3B |
|---|---|
| ScreenSpot | 55,5 |
| ScreenSpot Pro | 23,9 |
| AITZ_EM | 76,9 |
| Android Control High_EM | 63,7 |
| Android Control Low_EM | 22,2 |
| AndroidWorld_SR | 90,8 |
| MobileMiniWob++_SR | 67,9 |

No se han publicado resultados de benchmarks específicos para la variante uncensored ni para las cuantizaciones GGUF en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 3B en GGUF requiere aproximadamente 2-3 GB en cuantización Q4, 4-5 GB en Q8 y alrededor de 6-7 GB en F16, más el overhead del encoder visual y del contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para cuantizaciones altas; A100 o H100 para despliegues con concurrencia y contexto largo.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs con 8 GB o más usando cuantizaciones Q4/Q5; en 6 GB con cuantizaciones más agresivas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). Para el modelo base en safetensors, vLLM y TGI con soporte de Qwen2.5-VL.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen fuertemente del backend, la cuantización y el número de frames o resolución de imagen procesados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMMU val | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-VL-3B (esta variante) | 3,09B | No disponible | 53,1 | qwen-research | GGUF |
| InternVL2.5-4B | 4B | No disponible | 52,3 | No disponible | safetensors |
| Qwen2-VL-7B | 7B | No disponible | 54,1 | qwen-research | safetensors |

La comparativa se limita a los datos publicados en la model card. No se dispone de información sobre contexto, licencia exacta de InternVL2.5-4B ni disponibilidad de cuantizaciones GGUF para los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- La variante "UNCENSORED" elimina o reduce los mecanismos de rechazo del modelo original, lo que puede producir contenido dañino, ilegal o inexacto sin advertencia. No es apta para aplicaciones orientadas al público sin filtros adicionales.
- La metodología de desalineación no está documentada: se desconoce el dataset, el número de pasos y el impacto en las capacidades originales del modelo.
- La licencia qwen-research restringe el uso comercial y exige el cumplimiento de los términos del modelo base Qwen; el uso comercial de esta variante debe revisarse legalmente antes de cualquier despliegue.
- El modelo declara únicamente inglés como idioma soportado; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación en tareas de OCR, tablas y localización visual, especialmente con cuantizaciones agresivas (Q2/Q3).
- La cuantización GGUF puede degradar ligeramente la precisión respecto al modelo en safetensors, sobre todo en tareas de razonamiento matemático y localización fina.
- No hay datos publicados de benchmarks para esta variante concreta, por lo que las cifras de la model card corresponden al modelo base sin modificaciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria.
- El tamaño del repo (26,2 GB) sugiere múltiples cuantizaciones empaquetadas; conviene verificar los archivos individuales antes de descargar.

## Enlaces

- Hugging Face: https://huggingface.co/Kasemcyber/Qwen2.5-VL-3B-Instruct-UNCENSORED-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
- Blog de Qwen2.5-VL: https://qwenlm.github.io/blog/qwen2.5-vl/
- GitHub de Qwen2.5-VL: https://github.com/QwenLM/Qwen2.5-VL
- Chat de Qwen: https://chat.qwenlm.ai/
- Paper arXiv:2309.00071: https://arxiv.org/abs/2309.00071
- Paper arXiv:2409.12191: https://arxiv.org/abs/2409.12191
- Paper arXiv:2308.12966: https://arxiv.org/abs/2308.12966
- Dataset MMMLU: https://huggingface.co/datasets/openai/MMMLU
