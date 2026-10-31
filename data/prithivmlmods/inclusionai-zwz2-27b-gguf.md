# prithivMLmods/inclusionAI-ZwZ2-27B-GGUF

## Resumen

ZwZ2-27B es un modelo vision-language (VLM) de pesos abiertos con 27 mil millones de parámetros desarrollado por inclusionAI, perteneciente a su colección Zooming-without-Zooming-v2. Está construido sobre la base Qwen3.6-27B y su objetivo es conectar evidencia visual entre distintas regiones de una imagen mediante comparación, emparejamiento, agregación y razonamiento multi-paso, sin necesidad de herramientas de zoom en tiempo de inferencia. Esto resuelve un problema habitual en los VLM: la pérdida de detalle al procesar imágenes completas en baja resolución.

Su relevancia radica en el enfoque de entrenamiento: se ha ajustado directamente con Group Relative Policy Optimization (GRPO), sin pasar por una etapa previa de fine-tuning supervisado, usando unos 20.000 ejemplos del dataset inclusionAI/ZwZ2-RL-VQA generados con el pipeline EvidenceConnect sobre imágenes de SA-1B. Según su model card, supera a su modelo base en los 25 benchmarks evaluados, elevando la precisión media ponderada del 55,52 % al 60,51 % (+4,99 puntos).

Esta ficha corresponde a la cuantización GGUF publicada por prithivMLmods, que permite ejecutar el modelo localmente con llama.cpp. El repositorio incluye cuantizaciones desde Q3_K_L hasta BF16, además del archivo de proyección multimodal (mmproj) necesario para la parte de visión. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones relevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model basado en Qwen3.6-27B (transformer) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q4_K_M, Q5_K_M, Q6_K (GGUF) |
| Idiomas soportados | Ingles (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors) |

## Arquitectura y entrenamiento

ZwZ2-27B es un modelo vision-language construido sobre Qwen3.6-27B. Su particularidad es el enfoque "Zooming without Zooming": en lugar de recurrir a herramientas de recorte o zoom durante la inferencia, el modelo aprende a razonar sobre múltiples regiones de una imagen completa. El pipeline EvidenceConnect genera preguntas multi-región a partir de 3 a 7 regiones relacionadas de imágenes de SA-1B, usando recortes privilegiados durante la construcción de datos, pero entrenando con la imagen completa y las regiones resaltadas.

El ajuste se realizó directamente con Group Relative Policy Optimization (GRPO), una técnica de aprendizaje por refuerzo, sin una etapa intermedia de SFT. Se emplearon aproximadamente 20.000 ejemplos del dataset inclusionAI/ZwZ2-RL-VQA. Según la model card, el modelo no incorpora decodificación especulativa mediante MTP (Multi-Token Prediction).

## Capacidades

- Comprensión de imagen-texto (pipeline image-text-to-text) con razonamiento visual multi-paso
- Conexión de evidencia entre regiones de una imagen: comparación, emparejamiento y agregación
- Percepción fine-grained sobre imágenes completas sin herramientas de zoom en inferencia
- Razonamiento espacial y comprensión visual de contexto largo
- Capacidades para agentes multimodales
- Generación de texto conversacional (tag conversational)
- Entrenado principalmente en inglés; soporte multilingüe: no disponible

## Casos de uso

- Respuesta a preguntas visuales multi-región: el modelo puede responder preguntas que requieren combinar información de 3 a 7 zonas distintas de una misma imagen, su caso de diseño principal gracias al pipeline EvidenceConnect.
- Análisis de documentos e infografías densas: al razonar sobre la imagen completa con regiones resaltadas, es adecuado para extraer y cruzar datos de documentos con múltiples paneles, tablas o diagramas sin recortes manuales.
- Sistemas RAG visuales (V-RAG): puede actuar como lector multimodal que contrasta el contenido de la imagen con consultas textuales, una de las tareas incluidas en su evaluación (MMLongBench V-RAG).
- Auditoría visual de imágenes complejas: comparación de elementos entre regiones (por ejemplo, detectar discrepancias entre partes de un esquema o entre fotografías de un conjunto) aprovechando su capacidad de matching y agregación.
- Agentes multimodales: su entrenamiento incluye tareas de agentes multimodales, por lo que puede integrarse en pipelines donde el modelo interprete capturas o imágenes como parte de un flujo de decisión.
- Razonamiento espacial: localización y relación de objetos en escenas, útil en robótica ligera, inspección visual o descripción estructurada de escenas.
- Despliegue local privado: la disponibilidad en GGUF permite ejecutar el modelo en estaciones de trabajo locales con llama.cpp, útil para entornos donde las imágenes no pueden salir a APIs externas.

## Benchmarks y rendimiento

| Benchmark / evaluación | Modelo base Qwen3.6-27B | ZwZ2-27B |
|---|---|---|
| Precisión media ponderada (25 benchmarks) | 55,52 % | 60,51 % (+4,99) |

La evaluación abarca 25 benchmarks de percepción fine-grained, razonamiento espacial, comprensión visual de contexto largo, agentes multimodales y razonamiento visual general, incluyendo las 25 tareas no-counting del núcleo visual de MMLongBench* (V-RAG, Image MM-NIAH y VH-Multi). No se han publicado resultados individuales por benchmark en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia GGUF:
  - Q3_K_L: ~14,3 GB de archivo (se recomiendan ~18-20 GB de memoria disponible)
  - Q4_K_M: ~16,5 GB (recomendada, ~20-22 GB disponibles)
  - Q5_K_M: ~19,2 GB (~24 GB disponibles)
  - Q6_K: ~22,1 GB (~26-28 GB disponibles)
  - BF16: ~53,8 GB (requiere multi-GPU o gran cantidad de RAM con offload)
  - Añadir ~931 MB para el mmproj-bf16
- GPU recomendadas: RTX 4090 (24 GB) para Q3_K_L/Q4_K_M con parte en CPU; RTX 5090, A100 40 GB o H100 para cuantizaciones altas y BF16
- Consumer GPU: cabe en una RTX 4090 de 24 GB con Q3_K_L o Q4_K_M (con cierto offload a CPU); en GPUs de 16 GB como la RTX 4080/4060 Ti 16 GB solo con offload parcial a RAM
- Opciones de despliegue: llama.cpp (formato nativo del repo), Ollama (vía GGUF), LM Studio; el modelo base en safetensors es compatible con transformers y text-generation-inference
- Latencia y throughput: no disponible; el modelo no soporta decodificación especulativa vía MTP

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Formato local |
|---|---|---|---|---|
| ZwZ2-27B (esta ficha) | ~27B | VLM, RL con GRPO | Apache 2.0 | GGUF |
| Qwen3.6-27B (base) | ~27B | VLM base | no disponible | safetensors |
| Qwen2.5-VL-32B | ~32B | VLM generalista | Apache 2.0 | safetensors, GGUF |
| InternVL3-26B (Qwen2.5-32B) | ~26-30B | VLM generalista | Apache 2.0 | safetensors, GGUF |

ZwZ2-27B se diferencia de los VLM generalistas de tamaño similar en su especialización: está optimizado por RL para razonamiento multi-región y contexto visual largo, donde reporta mejoras sobre su base, mientras que alternativas como Qwen2.5-VL o InternVL3 ofrecen un espectro de capacidades más amplio (OCR, vídeo, más idiomas) pero sin esa optimización específica.

## Limitaciones y advertencias

- Idioma: la model card declara solo inglés; no hay garantía de rendimiento en castellano ni en otros idiomas
- No soporta decodificación especulativa MTP, lo que puede limitar el throughput en inferencia
- Los datos de evaluación provienen de la model card del autor y no incluyen resultados por benchmark individuales ni comparaciones con modelos ajenos a su base
- Es una cuantización de terceros (prithivMLmods) del modelo de inclusionAI; conviene verificar la fidelidad de la conversión GGUF frente a los pesos originales
- Riesgo de alucinación: no disponible; como todo VLM, puede generar descripciones incorrectas de regiones visuales
- Sesgos: entrenado sobre imágenes de SA-1B (imágenes de personas y escenas), puede heredar sesgos del dataset; no disponible un análisis de sesgos
- Longitud de contexto: no especificada en la información disponible, pese a que el modelo se evalúa en tareas de contexto visual largo
- La licencia Apache 2.0 no impone restricciones comerciales relevantes, pero conviene revisar también la licencia del modelo base Qwen3.6-27B

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/prithivMLmods/inclusionAI-ZwZ2-27B-GGUF
- Modelo base: https://huggingface.co/inclusionAI/ZwZ2-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/inclusionAI/ZwZ2-RL-VQA
- Base arquitectural: https://huggingface.co/Qwen/Qwen3.6-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper, blog o demo: no disponibles en la información proporcionada
