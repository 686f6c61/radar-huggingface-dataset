# Inserloft-AI/Valdam-Vision-2.5

## Resumen

Valdam Vision 2.5 es un modelo de vision-lenguaje (VLM) publicado por Inserloft-AI bajo licencia Apache 2.0. Combina un codificador Vision Transformer preentrenado con un decodificador Transformer autorregresivo que aplica cross-attention sobre los embeddings de parches visuales. El modelo está orientado a tres tareas concretas: descripción de escenas, OCR con reconstrucción espacial de diseño y moderación de contenido en modo zero-shot.

Con 949.702.066 parámetros totales (aproximadamente 950 millones) y un repositorio de 3,8 GB en formato safetensors, se sitúa en la gama media de los VLM, lo que lo hace desplegable en hardware relativamente modesto. Soporta inglés y español, y su pipeline declarado en HuggingFace es `image-to-text`.

Su relevancia actual radica en la combinación de OCR espacial y moderación zero-shot en un único modelo de menos de mil millones de parámetros con licencia permisiva, un perfil poco habitual en el ecosistema open source, donde estas capacidades suelen requerir modelos de mayor tamaño o servicios propietarios. No obstante, la información pública disponible es limitada y no se han publicado resultados de benchmarks en la documentación accesible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (encoder) + Transformer decoder autorregresivo con cross-attention |
| Parametros totales | 949.702.066 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón encoder-decoder multimodal: un Vision Transformer preentrenado actúa como codificador de imagen y proyecta los parches visuales a un espacio de embeddings; un decodificador Transformer autorregresivo genera texto aplicando cross-attention sobre dichos embeddings. El repositorio incluye `architecture.py` con la definición de ambos componentes y `config.json` con los hiperparámetros.

La moderación de contenido (denominada "Valdam Shield") no se implementa como una cabeza de clasificación entrenada, sino mediante coincidencia de similitud semántica con CLIP ViT-L/14, lo que explica su carácter zero-shot. El OCR espacial reconstruye el orden de lectura y los párrafos a partir de coordenadas espaciales de los elementos detectados en el diseño.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de descripciones de escenas mediante generación autorregresiva de texto condicionada por la imagen.
- OCR con reconstrucción de layout: recupera orden de lectura y agrupación en párrafos a partir de coordenadas espaciales.
- Moderación de contenido zero-shot mediante similitud semántica CLIP ViT-L/14 (Valdam Shield).
- Generación de texto multimodal en inglés y español.
- Inferencia local con latencia declarada de aproximadamente 0,08 s en hardware estándar.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, audio ni modo de pensamiento explícito.

## Casos de uso

- Digitalización de documentos con layout complejo: el modelo reconstruye el orden de lectura y los párrafos a partir de coordenadas espaciales, adecuado para facturas, formularios y maquetas editoriales donde el OCR plano pierde la estructura.
- Moderación de contenido en plataformas UGC: el enfoque zero-shot basado en CLIP ViT-L/14 permite filtrar imágenes sin necesidad de reentrenar un clasificador específico por categoría.
- Descripción automática de imágenes para accesibilidad: generación de texto alternativo en inglés y español para catálogos, intranets o aplicaciones de lectura de pantalla.
- Etiquetado y enriquecimiento de datasets visuales: generación de descripciones y metadatos textuales a escala sobre lotes de imágenes antes de entrenar otros modelos.
- Preprocesado en pipelines de visión documental: extracción de texto y estructura previa a sistemas RAG o de gestión documental, con salida en texto plano.
- Prototipado rápido en local: con menos de mil millones de parámetros y pesos safetensors, permite iterar en una sola GPU sin depender de APIs externas, útil para pruebas de concepto en equipos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara métricas BLEU, METEOR y ROUGE en los metadatos, pero no incluye valores numéricos ni conjuntos de evaluación. El único dato de rendimiento declarado es una latencia media de inferencia de aproximadamente 0,08 s "en hardware estándar", sin especificar la GPU ni el tamaño de entrada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 2 GB solo para pesos (950 M de parámetros), más el codificador ViT y las activaciones; presupuesto realista de 4-6 GB según resolución de imagen y longitud de salida.
- VRAM estimada en fp32: aproximadamente 3,8 GB solo para pesos, más overhead del encoder y del contexto visual.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070); para mayor throughput, A10G, L4 o A100.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más, incluidas RTX 3060 Ti, RTX 4060 Ti y superiores.
- Opciones de despliegue: el autor proporciona `inference.py` con la clase `ValdamVisionLocalPredictor`; no se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse variantes GGUF, llama.cpp requeriría conversión manual.
- Latencia y throughput: latencia declarada de ~0,08 s por respuesta; no se especifican tokens por segundo ni condiciones de medición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Valdam Vision 2.5 | 949,7 M | no disponible | en, es | Apache 2.0 | VLM + OCR espacial + moderacion zero-shot |
| Qwen2-VL-2B | ~2 B | 32k (declarado por el autor de Qwen) | multilingue | Apache 2.0 | VLM generalista |
| Florence-2 (base) | ~0,23 B | no disponible | en | MIT | VLM multitarea (captioning, deteccion, OCR) |
| PaliGemma-3B | ~3 B | no disponible | multilingue | Gemma license | VLM generalista |

La comparación se ofrece a título orientativo: no se dispone de resultados de benchmarks de Valdam Vision 2.5, por lo que no es posible establecer una comparación cuantitativa de rendimiento con estas alternativas. La principal diferencia cualitativa es la inclusión de moderación zero-shot vía CLIP y OCR con reconstrucción de layout como capacidades de primera clase, frente al enfoque generalista de los modelos citados.

## Limitaciones y advertencias

- No se han publicado evaluaciones cuantitativas (MMLU, HumanEval, GSM8K, benchmarks de OCR o de moderación); el rendimiento real es desconocido.
- La moderación zero-shot basada en similitud CLIP ViT-L/14 es sensible a umbrales y a la formulación de las categorías; puede producir falsos positivos y falsos negativos sin calibración específica por dominio.
- Riesgo de alucinación en descripciones de escenas y en la transcripción OCR, especialmente con texto de baja resolución, tipografías no latinas o layouts densos.
- Cobertura lingüística limitada a inglés y español; no se documenta comportamiento en otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar el uso con documentos largos o muchas imágenes por consulta.
- El modelo tiene 42 descargas y 0 likes en el momento de la consulta, con un único commit: no hay evidencia de validación por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documenta procedencia de los datos de entrenamiento, lo que puede implicar riesgos de cumplimiento en despliegues regulados.
- La latencia de 0,08 s declarada no especifica hardware ni condiciones; debe medirse en el entorno de producción objetivo.

## Enlaces

- HuggingFace: https://huggingface.co/Inserloft-AI/Valdam-Vision-2.5
- Sitio del autor: https://research.inserloft.com
