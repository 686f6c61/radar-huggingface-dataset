# Kasemcyber/Qwen2.5-VL-3B-Instruct-UNCENSORED-GGUF

## Resumen

Qwen2.5-VL-3B-Instruct-UNCENSORED-GGUF es una versión modificada del modelo vision-language Qwen2.5-VL-3B-Instruct desarrollado originalmente por el equipo Qwen de Alibaba. El autor Kasemcyber ha aplicado una técnica denominada Arbitrary-Rank Ablation (ARA) sobre las capas 14 a 31 del modelo para reducir la tasa de rechazos (refusals) ante peticiones que el modelo original declinaría, y ha publicado los pesos resultantes en formato GGUF para su uso con llama.cpp y herramientas derivadas.

El modelo base es un transformer multimodal de 3.085.938.688 parámetros que combina un codificador visual ViT con un LLM Qwen2.5 de 3B, capaz de procesar imágenes, vídeos y texto para tareas de image-text-to-text. La modificación ARA reduce los rechazos de 99/100 a 3/100 en la evaluación del autor, a costa de una divergencia KL de 0.3007 respecto al modelo original, lo que implica un cambio apreciable en la distribución de salida.

Este modelo es relevante para desarrolladores que necesitan un VLM compacto, desplegable en hardware de consumo, con capacidades de agente visual, localización de objetos y comprensión de documentos, y que quieran evitar los comportamientos de rechazo del modelo original. La licencia qwen-research del modelo base impone restricciones de uso comercial que deben verificarse antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: codificador visual ViT con window attention, SwiGLU y RMSNorm + LLM Qwen2.5 (transformer decoder) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF (el repositorio contiene múltiples cuantizaciones GGUF; los niveles concretos no se detallan en la informacion disponible) |
| Idiomas soportados | en (ingles) segun la model card; el modelo base Qwen2.5-VL soporta multiples idiomas, pero la ficha declara solo en |
| Licencia | qwen-research |
| Formato de pesos | GGUF (repo de 26.2 GB con cuantizaciones); el modelo original esta en safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-VL-3B-Instruct emplea un codificador visual ViT optimizado con window attention para acelerar entrenamiento e inferencia, y alineado estructuralmente con el LLM mediante SwiGLU y RMSNorm. El componente de lenguaje es un transformer decoder de la familia Qwen2.5. La innovación principal del modelo base es el entrenamiento con resolución dinámica y frame rate dinámico para vídeo: se adopta muestreo FPS dinámico y se actualiza mRoPE en la dimensión temporal con IDs y alineación de tiempo absoluto, lo que permite al modelo localizar momentos concretos en vídeos de más de una hora.

La modificación de esta ficha es una ablación de rango arbitrario (ARA) aplicada entre las capas 14 y 31, con los parámetros preserve_good_behavior_weight 0.8194, steer_bad_behavior_weight 0.3634, overcorrect_relative_weight 0.2414 y neighbor_count 9. No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni si hubo RLHF o DPO en el proceso de modificación. El modelo original Qwen2.5-VL-3B-Instruct fue entrenado por el equipo Qwen con datos no detallados en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de imágenes, vídeos y texto.
- Comprensión de documentos: análisis de textos, gráficos, iconos, layouts, facturas, formularios y tablas con salidas estructuradas (JSON).
- Localización visual: generación de bounding boxes y puntos para localizar objetos en imágenes, con salidas JSON estables de coordenadas y atributos.
- Comprensión de vídeo de más de una hora, con capacidad de identificar segmentos relevantes y eventos concretos.
- Capacidad de agente visual: razonamiento y direccionamiento dinámico de herramientas, incluyendo computer use y phone use.
- Soporte de tool calling y function calling implícito en su naturaleza de agente visual.
- Capacidades multilingües del modelo base (aunque la ficha declara solo inglés).
- Modo de comportamiento sin rechazos: la modificación ARA reduce los refusals de 99/100 a 3/100 según la evaluación del autor.
- No se dispone de información sobre capacidades de audio ni sobre un modo thinking explícito.

## Casos de uso

- Digitalización de facturas y formularios: el modelo puede extraer contenido estructurado en JSON de escaneos de facturas, tablas y formularios, lo que lo hace adecuado para pipelines financieros y comerciales automatizados.
- Automatización de atención al cliente con soporte visual: puede gestionar conversaciones multi-turno analizando capturas de pantalla o imágenes enviadas por el usuario, aunque la ventana de contexto concreta no está documentada en la información disponible.
- Agente de computer use y phone use: el modelo puede razonar sobre interfaces y dirigir herramientas para operar aplicaciones, con resultados de ScreenSpot de 55.5 y AndroidWorld_SR de 90.8.
- Análisis de vídeo para monitorización: su capacidad de comprender vídeos de más de una hora y localizar eventos permite usarlo en tareas de búsqueda de momentos concretos en grabaciones, con CharadesSTA/mIoU de 38.8.
- Generación de descripciones y análisis de imágenes en aplicaciones de accesibilidad: puede reconocer objetos, leer texto en imágenes y describir layouts, con DocVQA de 93.9 e InfoVQA de 77.1.
- Moderación de contenido y análisis de documentos sin rechazos: la reducción de refusals a 3/100 permite procesar contenido que el modelo original declinaría, útil en entornos donde se requiere análisis exhaustivo sin filtrado previo.
- Investigación en visión-lenguaje: al ser un modelo de 3B en GGUF, puede desplegarse en hardware de consumo para experimentación y fine-tuning ligero.

## Benchmarks y rendimiento

Resultados publicados por el autor y por el equipo Qwen para el modelo base Qwen2.5-VL-3B. No se han publicado resultados de benchmarks específicos para la versión modificada con ARA, salvo la métrica de refusals y KL divergence.

| Benchmark | InternVL2.5-4B | Qwen2-VL-7B | Qwen2.5-VL-3B |
|---|---|---|---|
| MMMU val | 52.3 | 54.1 | 53.1 |
| MMMU-Pro val | 32.7 | 30.5 | 31.6 |
| AI2D test | 81.4 | 83.0 | 81.5 |
| DocVQA test | 91.6 | 94.5 | 93.9 |
| InfoVQA test | 72.1 | 76.5 | 77.1 |
| TextVQA val | 76.8 | 84.3 | 79.3 |
| MMBench-V1.1 test | 79.3 | 80.7 | 77.6 |
| MMStar | 58.3 | 60.7 | 55.9 |
| MathVista testmini | 60.5 | 58.2 | 62.3 |
| MathVision full | 20.9 | 16.3 | 21.2 |

| Benchmark de vídeo | InternVL2.5-4B | Qwen2-VL-7B | Qwen2.5-VL-3B |
|---|---|---|---|
| MVBench | 71.6 | 67.0 | 67.0 |
| VideoMME | 63.6/62.3 | 69.0/63.3 | 67.6/61.5 |
| MLVU | 48.3 | no disponible | 68.2 |
| LVBench | no disponible | no disponible | 43.3 |
| MMBench-Video | 1.73 | 1.44 | 1.63 |
| EgoSchema | no disponible | no disponible | 64.8 |
| PerceptionTest | no disponible | no disponible | 66.9 |
| TempCompass | no disponible | no disponible | 64.4 |
| LongVideoBench | 55.2 | 55.6 | 54.2 |
| CharadesSTA/mIoU | no disponible | no disponible | 38.8 |

| Benchmark de agente | Qwen2.5-VL-3B |
|---|---|
| ScreenSpot | 55.5 |
| ScreenSpot Pro | 23.9 |
| AITZ_EM | 76.9 |
| Android Control High_EM | 63.7 |
| Android Control Low_EM | 22.2 |
| AndroidWorld_SR | 90.8 |
| MobileMiniWob++_SR | 67.9 |

| Métrica de modificación | Este modelo | Modelo original |
|---|---|---|
| Refusals | 3/100 | 99/100 |
| KL divergence | 0.3007 | 0 (por definición) |

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 3.085.938.688 parámetros en GGUF requiere aproximadamente 2 GB en cuantización Q4, 3.5 GB en Q8 y 6-7 GB en FP16, sin contar el codificador visual y el overhead de contexto. Los cálculos exactos dependen de la cuantización concreta del repositorio, que no se detalla en la información disponible.
- GPU recomendadas: el modelo cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y RTX 4090. Para despliegue en servidor, A100 y H100 son sobredimensionadas para este tamaño, pero ofrecen mayor throughput.
- Cabe en consumer GPU: sí, en la mayoría de GPUs con 8 GB o más de VRAM, dependiendo de la cuantización y de la longitud de contexto.
- Opciones de despliegue: llama.cpp, Ollama, y potencialmente vLLM y TGI si se convierte a safetensors. El repositorio está en formato GGUF, por lo que llama.cpp y Ollama son las opciones naturales.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dependen en gran medida de la cuantización, el hardware y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kasemcyber/Qwen2.5-VL-3B-Instruct-UNCENSORED-GGUF | 3.085.938.688 | no disponible | qwen-research | GGUF | Modificación ARA, refusals 3/100, KL 0.3007 |
| Qwen/Qwen2.5-VL-3B-Instruct | 3.085.938.688 | no disponible | qwen-research | safetensors | Modelo original, refusals 99/100 |
| InternVL2.5-4B | no disponible | no disponible | no disponible | no disponible | Comparable en benchmarks de imagen y vídeo |
| Qwen2-VL-7B | no disponible | no disponible | no disponible | no disponible | Mayor tamaño, comparable en benchmarks |

## Limitaciones y advertencias

- La modificación ARA altera el comportamiento del modelo con una divergencia KL de 0.3007 respecto al original, lo que puede afectar la calidad y coherencia de las respuestas en tareas no relacionadas con los rechazos.
- La reducción de refusals puede implicar que el modelo genere contenido que el original declinaría, con riesgos de seguridad y cumplimiento normativo en producción.
- Sesgos conocidos: no se dispone de información específica sobre sesgos del modelo modificado; el modelo base Qwen2.5-VL puede heredar sesgos de sus datos de entrenamiento.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado métricas específicas de alucinación para esta versión.
- Limitaciones de contexto o idioma: la ficha declara solo inglés, aunque el modelo base soporta múltiples idiomas. La longitud de contexto no está documentada en la información disponible.
- Restricciones de licencia: la licencia qwen-research del modelo base impone condiciones de uso, incluyendo posibles restricciones para uso comercial. Debe verificarse el texto completo de la licencia antes de cualquier despliegue.
- El autor del modelo modificado no ofrece garantías sobre el comportamiento del modelo; la evaluación de refusals y KL divergence es la única métrica publicada para la modificación.
- El repositorio tiene un tamaño de 26.2 GB, lo que incluye múltiples cuantizaciones GGUF; debe seleccionarse la cuantización adecuada según el hardware.

## Enlaces

- Hugging Face: https://huggingface.co/Kasemcyber/Qwen2.5-VL-3B-Instruct-UNCENSORED-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Licencia: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
- Blog Qwen2.5-VL: https://qwenlm.github.io/blog/qwen2.5-vl/
- GitHub Qwen2.5-VL: https://github.com/QwenLM/Qwen2.5-VL
- Chat Qwen: https://chat.qwenlm.ai/
- Paper Qwen2-VL (arXiv:2409.12191): https://arxiv.org/abs/2409.12191
- Paper Qwen2.5-VL (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
- Paper Qwen (arXiv:2308.12966): https://arxiv.org/abs/2308.12966
- Apoyo al autor: https://www.buymeacoffee.com/Kasemcyber
