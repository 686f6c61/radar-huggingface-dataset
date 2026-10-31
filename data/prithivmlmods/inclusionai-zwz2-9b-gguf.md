# prithivMLmods/inclusionAI-ZwZ2-9B-GGUF

## Resumen

ZwZ2-9B es un modelo vision-language (VLM) de pesos abiertos con 8.953.803.264 parámetros, desarrollado por inclusionAI dentro de su colección "Zooming-without-Zooming-v2". Está construido sobre `Qwen/Qwen3.5-9B` y su objetivo es conectar evidencia visual entre distintas regiones de una imagen (comparación, emparejamiento, agregación y razonamiento multi-paso) sin necesidad de herramientas de zoom en tiempo de inferencia. El repositorio aquí documentado es la cuantización GGUF publicada por prithivMLmods, que permite ejecutar el modelo con llama.cpp y derivados.

Su relevancia reside en el enfoque de entrenamiento: se ha ajustado directamente con Group Relative Policy Optimization (GRPO), sin etapa previa de fine-tuning supervisado, usando unos 20.000 ejemplos del dataset `inclusionAI/ZwZ2-RL-VQA` generados mediante el pipeline EvidenceConnect sobre imágenes de SA-1B. Según la model card, el modelo supera a su base Qwen3.5-9B en los 25 benchmarks evaluados, mejorando la precisión media ponderada de 51,63 % a 56,59 % (+4,96 puntos).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM basado en Qwen3.5-9B (clase `Qwen3_5ForConditionalGeneration`) |
| Parámetros totales | 8.953.803.264 (≈ 9B) |
| Parámetros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo) y safetensors/BF16 en el modelo base inclusionAI/ZwZ2-9B |

## Arquitectura y entrenamiento

ZwZ2-9B parte de Qwen3.5-9B al que se añade un proyector multimodal (distribuido como archivo `mmproj-bf16.gguf` de 922 MB en la versión GGUF) para tareas image-text-to-text. La model card no detalla el encoder visual concreto ni la longitud de contexto, por lo que estos datos no están disponibles.

El entrenamiento se realizó directamente con GRPO (reinforcement learning), sin etapa intermedia de SFT, sobre aproximadamente 20.000 ejemplos de `inclusionAI/ZwZ2-RL-VQA`. El pipeline EvidenceConnect genera preguntas multi-región a partir de 3-7 regiones relacionadas de imágenes SA-1B: utiliza recortes privilegiados ("privileged crops") para construir los datos, pero entrena sobre imágenes completas con las regiones resaltadas, forzando al modelo a razonar sobre regiones específicas sin recortar la imagen. Por defecto funciona en modo non-thinking con decodificación greedy y envuelve las respuestas finales en etiquetas de respuesta, salvo que se sobrescriba con un system message personalizado. No soporta decodificación especulativa vía MTP.

## Capacidades

- Comprensión conjunta de imagen y texto (pipeline image-text-to-text).
- Razonamiento visual multi-región: comparación, emparejamiento y agregación de evidencia entre 3-7 regiones de una misma imagen.
- Razonamiento de percepción fina (fine-grained perception) sin herramientas de zoom en inferencia.
- Comprensión visual de contexto largo (evaluado en los 25 tasks no-counting del núcleo visual de MMLongBench*).
- Tareas tipo agente multimodal y V-RAG (visual retrieval-augmented generation, según los benchmarks de evaluación).
- Generación conversacional con plantilla de chat incluida (`chat_template.jinja`).
- Inferencia en modo non-thinking con decodificación greedy por defecto.

## Casos de uso

- Análisis de documentos e imágenes densas: al entrenar con preguntas multi-región sobre imágenes completas, es adecuado para extraer y relacionar información de zonas distintas de una captura, diapositiva o documento escaneado.
- VQA sobre imágenes complejas: preguntas que requieren comparar objetos o atributos en varias partes de la imagen, donde un VLM convencional tiende a perder detalle fino.
- RAG visual (V-RAG): puede combinarse con un recuperador de imágenes para responder preguntas razonando sobre la evidencia visual recuperada, dado que se evaluó explícitamente en tareas de este tipo.
- Pruebas de aguja en un pajar multimodal (Image MM-NIAH): localización de información específica dentro de secuencias largas de imágenes, útil para auditar pipelines de ingesta visual.
- Agentes multimodales: su razonamiento multi-paso sobre evidencia visual lo hace candidato para agentes que necesitan interpretar capturas de pantalla o entornos gráficos.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones GGUF (desde 4,62 GB en Q3_K_M), puede ejecutarse en equipos sin GPU dedicada de gama alta mediante llama.cpp, LM Studio u Ollama.
- Prototipado e investigación en RL para VLMs: al publicarse el dataset ZwZ2-RL-VQA y el método (GRPO sin SFT), sirve como referencia reproducible para estudiar entrenamiento con RL puro en modelos multimodales.

## Benchmarks y rendimiento

Según la model card, el modelo se evaluó en 25 benchmarks que abarcan percepción fina, razonamiento espacial, comprensión visual de contexto largo, agentes multimodales y razonamiento visual general, incluyendo los 25 tasks no-counting del núcleo visual de MMLongBench* (V-RAG, Image MM-NIAH y VH-Multi). El único dato agregado publicado es:

| Benchmark agregado | Qwen3.5-9B (base) | ZwZ2-9B |
|---|---|---|
| Precisión media ponderada (25 benchmarks) | 51,63 % | 56,59 % (+4,96) |

No se han publicado resultados individuales por benchmark (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia GGUF (solo pesos LLM, sin el mmproj de 922 MB ni KV cache):
  - Q3_K_M: 4,62 GB — viable en portátiles con 8 GB de RAM o GPU de 6 GB.
  - Q4_K_M: 5,63 GB — viable en GPUs de 8 GB (RTX 3060 12 GB, RTX 4060 Ti) o 16 GB de RAM.
  - Q5_K_M: 6,47 GB y Q6_K: 7,36 GB — cómodos en GPUs de 8-12 GB.
  - Q8_0: 9,53 GB — requiere GPU de 12 GB (RTX 3060 12 GB, RTX 4070) o 16 GB de RAM.
  - BF16: 17,9 GB — requiere GPU de 24 GB (RTX 3090/4090) o 32 GB de RAM.
- GPU recomendadas: RTX 3060/4060 Ti para cuantizaciones Q4-Q5; RTX 4090 o A100 para BF16 y contextos largos.
- Cabe en GPUs de consumo a partir de 6-8 GB de VRAM con cuantizaciones Q3/Q4; también funciona en CPU pura con suficiente RAM, con menor throughput.
- Opciones de despliegue: llama.cpp (formato nativo del repo), LM Studio, Ollama y cualquier runtime compatible con GGUF multimodal (cargando `mmproj-bf16.gguf` como proyector). El modelo base BF16 se sirve con Hugging Face Transformers (`transformers==5.13.1`, `Qwen3_5ForConditionalGeneration`, `AutoProcessor`); no se menciona soporte en vLLM o TGI.
- Latencia y throughput: no disponible. Sin decodificación especulativa (MTP: No).

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Entrenamiento destacado | Licencia | Formato local |
|---|---|---|---|---|---|
| ZwZ2-9B (este) | 8,95B | VLM multi-región | GRPO puro, ~20k ejemplos (EvidenceConnect/SA-1B) | Apache 2.0 | GGUF, safetensors |
| Qwen3.5-9B (base) | ≈9B | VLM general | Preentrenamiento + alineación estándar | no disponible en la información proporcionada | safetensors |
| Qwen2.5-VL-7B | ≈7B | VLM general | SFT + RL estándar | Apache 2.0 | GGUF, safetensors |

ZwZ2-9B se diferencia de los VLM generales de tamaño similar en que su entrenamiento se centra específicamente en razonamiento multi-región sin zoom en inferencia, con mejoras medidas frente a su propia base (+4,96 puntos en 25 benchmarks). Comparativas de rendimiento directas con Qwen2.5-VL-7B no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado solo para inglés; no hay soporte declarado para castellano ni otros idiomas.
- Longitud de contexto: no documentada en la model card; verificar antes de usar en tareas de contexto largo real.
- Riesgo de alucinación: como todo VLM de 9B, puede alucinar detalles finos en imágenes densas; el entrenamiento multi-región mitiga pero no elimina este problema.
- El modelo responde por defecto en modo non-thinking con greedy decoding y envuelve las respuestas en etiquetas de respuesta; este comportamiento puede interferir con parsers aguas abajo si no se sobrescribe con un system message personalizado.
- La mejora publicada (+4,96 puntos) es relativa a su propio modelo base; no hay comparaciones publicadas frente a otros VLMs del estado del arte.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los componentes heredados (Qwen3.5-9B y el dataset SA-1B usado en el entrenamiento).
- Sesgos: entrenado sobre imágenes de SA-1B y preguntas sintéticas generadas por pipeline, lo que puede introducir sesgos de dominio hacia ese tipo de imagery y limitar la generalización a otros tipos de imágenes.
- Repositorio de terceros: esta cuantización GGUF la publica prithivMLmods, no inclusionAI; la calidad de la conversión depende del autor del repo (743 descargas y 1 like en el momento de la ficha).

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/inclusionAI-ZwZ2-9B-GGUF
- Modelo base: https://huggingface.co/inclusionAI/ZwZ2-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/inclusionAI/ZwZ2-RL-VQA
- Modelo base del backbone: https://huggingface.co/Qwen/Qwen3.5-9B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper, blog oficial o demos: no disponibles en la información proporcionada.
