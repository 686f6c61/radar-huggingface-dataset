# prithivMLmods/inclusionAI-ZwZ2-4B-GGUF

## Resumen

ZwZ2-4B es un modelo vision-language (VLM) de pesos abiertos con 4.205 millones de parámetros, desarrollado por inclusionAI dentro de su colección "Zooming-without-Zooming-v2" y construido sobre la base `Qwen/Qwen3.5-4B`. Su objetivo es resolver un problema concreto de los VLM actuales: la comprensión visual de grano fino que tradicionalmente exige herramientas de zoom en tiempo de inferencia. ZwZ2-4B conecta evidencia entre regiones de una imagen (comparación, emparejamiento, agregación y razonamiento multi-paso) sin recurrir a recortes externos, trabajando directamente sobre la imagen completa con regiones resaltadas.

La propuesta técnica más destacable es su entrenamiento directamente con Group Relative Policy Optimization (GRPO), sin una etapa intermedia de fine-tuning supervisado (SFT), usando unos 20.000 ejemplos del dataset `inclusionAI/ZwZ2-RL-VQA` generados mediante el pipeline EvidenceConnect sobre imágenes de SA-1B. Según su model card, el modelo mejora a su base Qwen3.5-4B en los 25 benchmarks evaluados, elevando la precisión media ponderada del 49,41 % al 54,79 % (+5,38 puntos).

Esta ficha cubre la cuantización GGUF publicada por prithivMLmods (`prithivMLmods/inclusionAI-ZwZ2-4B-GGUF`), que permite ejecutar el modelo con llama.cpp y derivados, incluyendo el archivo de proyección multimodal `mmproj` necesario para la parte de visión. El modelo opera por defecto en modo non-thinking con decodificación greedy y envuelve sus respuestas finales en etiquetas `<answer>...</answer>`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model basado en Qwen3.5-4B (`Qwen3_5ForConditionalGeneration`) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0, mmproj-BF16 (proyección multimodal) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta versión); el modelo base también está disponible en safetensors BF16 con Transformers |

## Arquitectura y entrenamiento

ZwZ2-4B parte de la arquitectura de Qwen3.5-4B y añade capacidad multimodal de imagen-texto a texto (pipeline `image-text-to-text`). Su rasgo diferencial es metodológico: en lugar del pipeline clásico SFT + RL, el modelo se entrena directamente con GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo que optimiza grupos de respuestas comparativamente sin necesidad de modelo de recompensa crítico entrenado aparte. Esto elimina la etapa supervisada intermedia y reduce el riesgo de que el modelo memorice estilos de respuesta en lugar de razonar sobre la evidencia visual.

Los datos de entrenamiento provienen del dataset `inclusionAI/ZwZ2-RL-VQA`, con aproximadamente 20.000 ejemplos generados mediante el pipeline EvidenceConnect sobre imágenes de SA-1B (Segment Anything). El pipeline construye preguntas multi-región usando "privileged crops" (recortes privilegiados) solo durante la creación de datos; el entrenamiento y la inferencia se realizan sobre la imagen completa con regiones resaltadas, forzando al modelo a integrar evidencia de varias zonas sin zoom. La model card indica además que no se emplea MTP (multi-token prediction) para decodificación especulativa.

## Capacidades

- Comprensión visual-language: responde a preguntas sobre imágenes (VQA) trabajando con la imagen completa, sin herramientas de zoom en inferencia.
- Razonamiento visual multi-región: comparación, emparejamiento y agregación de evidencia entre distintas zonas de la imagen.
- Razonamiento multi-paso sobre contenido visual (multi-step visual reasoning).
- Comprensión visual de contexto largo, según los benchmarks de evaluación (MMLongBench* visual core).
- Capacidades orientadas a agentes multimodales (una de las categorías de los 25 benchmarks evaluados).
- Formato de salida estructurado: respuestas finales envueltas en `<answer>...</answer>` por defecto, útil para parseo automático en pipelines.
- Modo non-thinking por defecto con decodificación greedy; configurable mediante instrucciones de sistema personalizadas.
- Ejecución local en CPU/GPU mediante GGUF con llama.cpp, LM Studio, Ollama y derivados.
- No se ha documentado soporte de tool calling / function calling en la información disponible.

## Casos de uso

- VQA de grano fino sobre imágenes complejas: escenas con muchos objetos o personas donde hay que comparar o relacionar elementos en zonas distintas (por ejemplo, "¿qué porta la persona de la izquierda y coincide con algún objeto de la derecha?"). Es precisamente el caso de uso para el que se diseñó con EvidenceConnect.
- RAG visual (V-RAG): indexación y consulta de documentos escaneados, infografías o capturas donde el modelo debe localizar y conectar evidencia dispersa en la imagen.
- Auditoría de imágenes a gran escala: verificación de atributos en catálogos de producto, control de calidad visual en líneas de montaje o comprobación de cumplimiento en fotografías, gracias a su razonamiento multi-región sin zoom externo.
- Agentes multimodales: como módulo de percepción en agentes que procesan capturas de pantalla o entornos visuales, con salida parseable en `<answer>` para integración programática.
- Evaluación de comprensión espacial: tareas de relaciones espaciales entre objetos (izquierda/derecha, adyacencia, conteo relativo no numérico) en pipelines de evaluación o investigación.
- Despliegue en edge o estaciones de trabajo modestas: con cuantizaciones Q4_K_M (~2,71 GB) o Q4_K_S (~2,56 GB) más el mmproj (676 MB), el modelo completo cabe en GPUs de consumo de 8 GB o incluso en CPU con RAM suficiente.
- Investigación en RL puro para multimodalidad: al entrenarse solo con GRPO sin SFT, es un caso de estudio útil para grupos que exploran pipelines de entrenamiento sin etapa supervisada.

## Benchmarks y rendimiento

Datos publicados en la model card (evaluación del modelo base inclusionAI/ZwZ2-4B, no de las cuantizaciones GGUF):

| Benchmark / métrica | Qwen3.5-4B (base) | ZwZ2-4B |
|---|---|---|
| Precisión media ponderada (25 benchmarks) | 49,41 % | 54,79 % (+5,38) |
| Benchmarks mejorados | — | 25 de 25 |

Los 25 benchmarks cubren percepción de grano fino, razonamiento espacial, comprensión visual de contexto largo, agentes multimodales y razonamiento visual general. La evaluación incluye las 25 tareas no-counting del núcleo visual de MMLongBench*, que abarca V-RAG, Image MM-NIAH y VH-Multi. No se han publicado puntuaciones por benchmark individual en la información disponible, ni resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM para inferencia GGUF (solo pesos, sin KV cache ni overhead de runtime):
  - Q3_K_M: ~2,26 GB; Q3_K_L: ~2,42 GB
  - Q4_K_S: ~2,56 GB; Q4_K_M: ~2,71 GB (recomendada)
  - Q5_K_S: ~2,99 GB; Q5_K_M: ~3,07 GB
  - Q6_K: ~3,46 GB; Q8_0: ~4,48 GB
  - BF16: ~8,42 GB
  - Añadir ~676 MB por el archivo de proyección multimodal mmproj-BF16.
- GPUs de consumo: cualquier GPU con 6-8 GB de VRAM (RTX 3060, RTX 4060 Ti, RTX 4070) ejecuta cómodamente Q4-Q6; con 12-16 GB (RTX 4080/4090) cabe Q8_0 o BF16 con margen para contexto e imágenes. También es viable en CPU con 8-16 GB de RAM dada la cuantización.
- GPUs de datacenter (A100, H100, etc.): innecesarias para esta cuantización; solo relevantes para servir BF16 con Transformers a alto throughput.
- Despliegue con Transformers: la model card referencia `transformers==5.13.1` con `Qwen3_5ForConditionalGeneration` y `AutoProcessor` para inferencia BF16.
- Opciones de despliegue: llama.cpp (repositorio oficial: https://github.com/ggml-org/llama.cpp), y por extensión LM Studio, Ollama, GPT4All y cualquier runtime compatible con GGUF multimodal (mmproj). No se menciona soporte en vLLM o TGI para esta versión GGUF.
- Latencia y throughput: no disponible; al no usar decodificación especulativa (MTP: No), la velocidad dependerá del runtime y hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Entrenamiento destacado | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|---|
| ZwZ2-4B (inclusionAI) | ~4,2 B | Imagen-texto a texto | GRPO puro, sin SFT (20k ejemplos ZwZ2-RL-VQA) | Apache 2.0 | Sí (esta ficha) |
| Qwen3.5-4B (base) | ~4,2 B | Texto (base del modelo) | Preentrenamiento + postentrenamiento estándar | No disponible en la información facilitada | No disponible |
| Qwen2.5-VL-3B / 7B | 3B / 7B | Imagen-texto a texto | SFT + RL estándar | Apache 2.0 (Qwen2.5-VL) | Sí |

ZwZ2-4B se sitúa en el segmento de VLM pequeños (~4B) alternativos a Qwen2.5-VL-3B, con la ventaja declarada de razonamiento multi-región sin herramientas de zoom y una mejora medida de +5,38 puntos sobre su propia base. Frente a Qwen2.5-VL-7B, ofrece menor huella de memoria a costa de menor capacidad general; frente a la base Qwen3.5-4B, añade visión y mejora en los 25 benchmarks evaluados. Datos comparativos de benchmarks directos entre estos modelos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés (`language: en`). No hay soporte documentado para castellano ni otros idiomas; el uso en español no está garantizado.
- Alucinaciones: como todo VLM de 4B entrenado con RL, puede generar respuestas plausibles pero incorrectas sobre detalles finos de la imagen; el formato `<answer>` no implica veracidad. Se recomienda validación en aplicaciones críticas.
- Sesgos: el entrenamiento se realizó sobre ~20.000 ejemplos de imágenes SA-1B, un dataset con distribución concreta de escenas fotográficas; el rendimiento en dominios distintos (documentos, capturas de pantalla, imágenes médicas) no está documentado.
- Contexto: la longitud de ventana de contexto no está especificada en la información disponible; verificar antes de usar en tareas de contexto largo.
- Cuantización: los resultados de benchmarks corresponden al modelo BF16; las cuantizaciones Q3 pueden degradar apreciablemente la calidad, especialmente en percepción fina, que es el punto fuerte del modelo. Se recomiendan Q4_K_M o superiores.
- Sin decodificación especulativa (MTP: No), lo que puede limitar el throughput frente a modelos que la soportan.
- Formato de salida: por defecto envuelve las respuestas en `<answer>...</answer>`; los pipelines que no lo contemplen deben ajustar el system prompt o el parseo.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes más allá de la atribución de la licencia.
- Proyecto de terceros: esta versión GGUF es una cuantización publicada por prithivMLmods (1.003 descargas, 1 like en el momento de la ficha), no un release oficial de inclusionAI; conviene verificar la integridad y procedencia de los pesos antes de producción.

## Enlaces

- Ficha del modelo GGUF: https://huggingface.co/prithivMLmods/inclusionAI-ZwZ2-4B-GGUF
- Modelo base: https://huggingface.co/inclusionAI/ZwZ2-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/inclusionAI/ZwZ2-RL-VQA
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper, blog oficial y demo: no disponibles en la información proporcionada
