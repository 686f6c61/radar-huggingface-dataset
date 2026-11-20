# MLliu6/InternVL3_5-2B-HF-GPTQ-W4A16

## Resumen

InternVL3_5-2B-HF-GPTQ-W4A16 es una versión cuantizada del modelo multimodal InternVL3.5-2B de OpenGVLab, publicada por el usuario MLliu6. Se trata de un checkpoint derivado que aplica cuantización GPTQ asimétrica de 4 bits sobre los pesos del decodificador de lenguaje, manteniendo en FP16 la torre de visión, el proyector multimodal, los embeddings y la cabeza de salida. El resultado es un modelo image-text-to-text de aproximadamente 2.350 millones de parámetros que ocupa 2,6 GB en el repositorio, lo que facilita su despliegue en hardware modesto.

El modelo resuelve el problema de ejecutar un VLM compacto con requisitos de memoria reducidos sin reentrenar desde cero: la cuantización se aplica únicamente a las 196 proyecciones lineales de self-attention y MLP en las 28 capas del decodificador, mientras que los componentes sensibles a la precisión (visión, embeddings, normalización y cabeza de salida) permanecen en FP16. Esto lo hace relevante para escenarios de inferencia local, prototipado rápido y despliegue en GPUs de consumo.

La relevancia actual radica en que combina un modelo base de última generación (InternVL3.5) con un formato de pesos empaquetado (`compressed-tensors` pack-quantized) compatible con Transformers, lo que permite cargar el checkpoint directamente sin herramientas externas de cuantización. La licencia Apache 2.0 del modelo base se mantiene en esta derivada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de visión + proyector + decodificador de lenguaje de 28 capas), cuantización GPTQ W4A16 |
| Parametros totales | 2.348.347.392 (2,35 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GPTQ asimétrico 4 bits, group size 128, escalas FP16, zero-points empaquetados; componentes no lineales en FP16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con formato `compressed-tensors` pack-quantized |

## Arquitectura y entrenamiento

El modelo base InternVL3.5-2B sigue la arquitectura InternVL, que combina una torre de visión (vision encoder) con un proyector multimodal que mapea las representaciones visuales al espacio del decodificador de lenguaje. El decodificador consta de 28 capas con proyecciones lineales en self-attention y MLP. Esta versión cuantizada aplica GPTQ asimétrico de 4 bits con group size 128 y escalas FP16 sobre las 196 proyecciones lineales del decodificador, dejando en FP16 la torre de visión, el proyector, los embeddings, las normalizaciones y la cabeza de salida.

El proceso de calibración utilizó 128 peticiones multimodales del split `s0`, de las cuales 112 provenían de ShareGPT4V/COCO2017 y 16 de CORD-v2, reservando 32 peticiones adicionales para verificación. Se empleó ordenación estática de activaciones y un factor de damping de 0,01. El repacking preservó cada código de peso, zero-point y patrón de bits de los pesos FP16 reconstruidos en las 196 proyecciones. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre si se aplicaron técnicas de RLHF/DPO en esta derivada (la cuantización es post-entrenamiento, no altera el entrenamiento original).

## Capacidades

- Generación de texto e imagen-a-texto (image-text-to-text) mediante chat multi-turno.
- Comprensión de imágenes: descripción de contenido visual, respuesta a preguntas sobre imágenes (VQA).
- Razonamiento visual y respuesta a preguntas científicas (evaluado en ScienceQA-IMG).
- Reconocimiento óptico de caracteres (OCR) y comprensión de documentos (evaluado en OCRBench, calibrado con CORD-v2).
- Capacidades multilingües: no disponible en la información proporcionada (el modelo base podría soportarlas, pero no se confirma para esta derivada).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- **Atención al cliente con imágenes**: el modelo puede procesar capturas de pantalla o fotos enviadas por el usuario y responder preguntas sobre ellas en conversaciones multi-turno, gracias a su pipeline image-text-to-text y su formato de chat.
- **Extracción de datos de documentos**: con capacidades OCR evaluadas en OCRBench (83,30 %) y calibración sobre CORD-v2 (recibos), es adecuado para digitalizar facturas, tickets y formularios en pipelines de automatización documental.
- **Moderación de contenido visual**: clasificación y descripción de imágenes para detectar contenido inapropiado en plataformas, usando inferencia local en GPU de consumo gracias a los 2,6 GB del checkpoint.
- **Asistencia educativa**: respuesta a preguntas sobre diagramas, gráficos y material científico (ScienceQA-IMG 88,70 %), útil en tutores automáticos que interpretan figuras.
- **Prototipado rápido de aplicaciones VLM**: al cargarse directamente con Transformers y `compressed-tensors`, sirve para validar ideas de producto multimodal en entornos de desarrollo sin infraestructura dedicada.
- **Accesibilidad**: generación de descripciones de imágenes para personas con discapacidad visual, ejecutándose en hardware local (probado en RTX 5080 Laptop GPU).
- **Análisis de imágenes en el borde (edge)**: su tamaño reducido permite desplegarlo en estaciones de trabajo o portátiles con GPU consumer para tareas de inspección visual o clasificación.

## Benchmarks y rendimiento

Los resultados provienen de la evaluación de reconstrucción FP16 congelada del artefacto fuente, según la model card.

| Tarea | Puntuación | Ejemplos |
|---|---:|---:|
| ScienceQA-IMG | 88,70 % | 2.017 |
| OCRBench | 83,30 % | 1.000 |
| MMStar | 55,47 % | 1.500 |
| MMBench CN DEV (strict circular accuracy) | 74,14 % | 1.164 preguntas base, 4.329 rotaciones |

La model card indica que el checkpoint exportado superó una recarga offline en Transformers y coincidió exactamente con los logits FP16 reconstruidos del artefacto original en dos pasos de generación greedy, tanto para una entrada de texto como para una entrada imagen-texto. En una NVIDIA GeForce RTX 5080 Laptop GPU, la recarga offline devolvió "Red" para el prompt de imagen roja de ejemplo.

## Requisitos de hardware

- **VRAM estimada**: el repositorio ocupa 2,6 GB; con overhead de activaciones y contexto, se estima un uso de VRAM en torno a 3-4 GB en FP16 para inferencia básica (estimación, no confirmada en la información disponible).
- **GPU recomendadas**: el autor verificó funcionamiento en NVIDIA GeForce RTX 5080 Laptop GPU. Por tamaño, cabe en GPUs consumer como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090, así como en A100/H100 para despliegues de mayor throughput.
- **Cabe en GPU consumer**: sí, dado el tamaño del checkpoint (2,6 GB) y la cuantización W4A16.
- **Opciones de despliegue**: Transformers 4.57.6 con `compressed-tensors` 0.14.0.1 y `torch` 2.10.0 (entorno verificado). El backend de referencia de Transformers reconstruye los pesos empaquetados para ejecución lineal en FP16. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantización | Notas |
|---|---:|---|---|---|---|
| InternVL3_5-2B-HF-GPTQ-W4A16 (este) | 2,35 B | No disponible | Apache 2.0 | GPTQ W4A16 | Derivada cuantizada, 2,6 GB |
| OpenGVLab/InternVL3_5-2B-HF (base) | ~2,35 B | No disponible | Apache 2.0 | FP16/BF16 | Modelo original sin cuantizar |
| Alternativas de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de comparación en la información proporcionada |

No se dispone de información sobre otros modelos comparables de la misma categoría (VLM de ~2 B) en la documentación facilitada.

## Limitaciones y advertencias

- **Sesgos conocidos**: no disponibles en la información proporcionada; al derivar de un modelo entrenado con datos web, es probable que herede sesgos del modelo base, pero no se documentan.
- **Riesgo de alucinación**: inherente a los modelos generativos; no se han publicado evaluaciones específicas de fidelidad para esta derivada.
- **Limitaciones de contexto o idioma**: la longitud de contexto no está documentada; los idiomas soportados no se especifican. MMBench CN DEV sugiere capacidades en chino, pero no se confirma el alcance multilingüe.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero debe conservarse la atribución a OpenGVLab y el aviso de licencia incluido.
- **Caveats para producción**: la cuantización GPTQ puede introducir degradación en tareas sensibles a la precisión numérica; el entorno verificado es específico (transformers 4.57.6, compressed-tensors 0.14.0.1, torch 2.10.0) y otras versiones podrían no cargar el formato pack-quantized. El modelo tiene 0 descargas y 0 likes, por lo que su validación comunitaria es nula. La model card solo verifica coincidencia de logits en dos pasos greedy, no una evaluación exhaustiva de la degradación por cuantización.

## Enlaces

- [Hugging Face: MLliu6/InternVL3_5-2B-HF-GPTQ-W4A16](https://huggingface.co/MLliu6/InternVL3_5-2B-HF-GPTQ-W4A16)
- [Modelo base: OpenGVLab/InternVL3_5-2B-HF](https://huggingface.co/OpenGVLab/InternVL3_5-2B-HF)
- [Repositorio del modelo base (revisión referenciada)](https://huggingface.co/OpenGVLab/InternVL3_5-2B-HF/tree/3f301ffcf3dcbb47893afae6650ea3e78d96fb6d)
