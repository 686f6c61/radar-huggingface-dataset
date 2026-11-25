# Alissonerdx/Qwen3.5-9B-Minimax-H3

## Resumen

Qwen3.5-9B-Minimax-H3 es un conjunto de pesos auxiliares publicado por el usuario Alissonerdx que permite reutilizar el modelo de lenguaje Qwen/Qwen3.5-9B como codificador de condicionamiento multimodal para el modelo de generación de vídeo MiniMax-H3 (variante Ref2VA) dentro de ComfyUI. No se trata de un modelo generativo autónomo, sino de un adaptador compuesto por una proyección lineal con MLP residual (de 4096 a 5120 dimensiones) y un LoRA de rango 16 entrenado de forma conjunta para alinear las representaciones internas de Qwen3.5-9B con las del codificador profesor de MiniMax-H3, que es Qwen3-VL-32B.

El problema que resuelve es práctico: MiniMax-H3 depende de un codificador de texto y referencia visual de 32B parámetros (Qwen3-VL-32B), lo que encarece el despliegue. Este adaptador permite sustituirlo por un modelo de 9B con una pérdida medible de fidelidad, pero con un coste de inferencia y de VRAM notablemente menor. La relevancia es acotada al ecosistema ComfyUI y a pipelines de text-to-video con referencias de imagen, no al uso general como LLM.

La arquitectura subyacente es la del transformer denso de Qwen3.5-9B, sobre el que se aplican dos artefactos: una proyección `4096 -> 5120` con tap en la capa 20 y un LoRA de rango 16 sobre 34 módulos lineales. El repositorio ocupa 28,3 GB, coherente con pesos en precisión completa o bf16 del modelo base más los adaptadores. La licencia declarada es Apache 2.0 y el idioma indicado en la model card es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-9B) + proyección lineal 4096→5120 con MLP residual + LoRA rango 16 |
| Parametros totales | 9B en el modelo base (adaptadores no disponibles en recuento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, int8_convrot, w4a8_gptq (según Comfy-Org/Qwen3.5) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`minimax_h3_qwen3.5_9b_projection.safetensors`, `minimax_h3_qwen3.5_9b_lora.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se compone de dos piezas entrenadas conjuntamente contra el codificador profesor de MiniMax-H3 (Qwen3-VL-32B). La primera es una proyección `4096 -> 5120` con MLP residual que toma las activaciones de la capa 20 (`tap=20`) del transformer de Qwen3.5-9B y las mapea al espacio de 5120 dimensiones esperado por MiniMax-H3. La segunda es un LoRA de rango 16 aplicado a 34 módulos lineales: `model.visual.merger` (`linear_fc1`, `linear_fc2`), que adapta la proyección de parches de imagen de referencia `<Picture 1..N>` al flujo del lenguaje, y las capas de lenguaje 12–19 (`o_proj`, `gate_proj`, `up_proj`, `down_proj`, `out_proj`), que alinean los estados ocultos justo antes del tap de la capa 20.

El entrenamiento se realizó durante al menos 3 épocas, seleccionándose la época 3 como mejor checkpoint. En tiempo de carga, el nodo de ComfyUI fusiona el LoRA directamente en los pesos lineales base (`W += (alpha / r) * B @ A`), de modo que no hay sobrecoste de inferencia por el adaptador. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Los logs y métricas se almacenan en `training_artifacts/`.

## Capacidades

- Condicionamiento multimodal de text-to-video: acepta texto y hasta N imágenes de referencia (`<Picture 1..N>`) para alimentar MiniMax-H3 Ref2VA.
- Codificación de referencias visuales para preservar identidad y fidelidad de referencia en el vídeo generado.
- Integración nativa con ComfyUI mediante nodo personalizado que descarga y fusiona los pesos automáticamente.
- Sustitución de un codificador de 32B por uno de 9B con pérdida controlada de fidelidad (coseno de texto 0,9507 y de visión 0,8879 frente al profesor).
- No es un modelo de chat, razonamiento, código ni tool calling: su función es exclusivamente la codificación de condicionamiento.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Generación de vídeo con referencias de personaje en ComfyUI: el adaptador permite introducir una o varias imágenes de referencia y un prompt textual para que MiniMax-H3 mantenga la identidad del sujeto a lo largo del clip, con PSNR de 18,353 dB y correlación de fotogramas de 0,8359 en el caso de una referencia.
- Despliegue de MiniMax-H3 en hardware más modesto: al reemplazar Qwen3-VL-32B por Qwen3.5-9B más proyección y LoRA, se reduce el coste de VRAM del codificador, lo que facilita ejecutar el pipeline en GPUs de gama alta consumer.
- Prototipado rápido de pipelines text-to-video: el nodo de ComfyUI descarga los pesos automáticamente, lo que agiliza la experimentación sin gestionar manualmente el emparejamiento de codificadores.
- Investigación sobre destilación de codificadores multimodales: las métricas publicadas (coseno de texto y visión, PSNR, correlación de fotogramas) sirven como referencia para estudiar la transferencia de representaciones entre un profesor de 32B y un alumno de 9B.
- Evaluación comparativa de fidelidad con múltiples referencias: los casos 01 a 04 documentan el comportamiento con 1, 2, 3 y 4 referencias, útil para decidir cuántas imágenes de referencia incluir en producción.
- Integración en flujos de creación de contenido audiovisual: estudios y creadores pueden montar un pipeline local de vídeo con referencias sin depender de APIs externas, dentro de las limitaciones de licencia Apache 2.0.

## Benchmarks y rendimiento

| Variante | Coseno texto | Coseno visión (`refs`) | Puntuación global | PSNR medio de vídeo | Correlación de fotogramas |
|---|---|---|---|---|---|
| Solo proyección (sin LoRA) | 0,8919 | 0,7873 | 0,8396 | 12,877 dB | 0,4410 |
| LoRA + proyección, época 1 | 0,9417 | 0,8801 | 0,9109 | no disponible | no disponible |
| LoRA + proyección, época 2 | 0,9492 | 0,8867 | 0,9180 | no disponible | no disponible |
| LoRA + proyección, época 3 (actual) | 0,9507 | 0,8879 | 0,9193 | 14,764 dB | 0,6310 |

Resultados por caso con la variante época 3:

| Caso | Referencias | PSNR | Correlación de fotogramas |
|---|---|---|---|
| Case 01 | 1 | 18,353 dB | 0,8359 |
| Case 02 | 2 | 14,858 dB | 0,8223 |
| Case 03 | 3 | 14,743 dB | 0,3852 |
| Case 04 | 4 | 11,104 dB | 0,4808 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no está orientado a tareas de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 28,3 GB, lo que sugiere pesos en bf16 del modelo de 9B más adaptadores. En bf16 el codificador requeriría del orden de 18–20 GB solo para pesos, más activaciones y el modelo de vídeo.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cabría esperar A100, H100 o RTX 4090 para el codificador en bf16; las variantes int8_convrot y w4a8_gptq de Comfy-Org/Qwen3.5 permitirían reducir requisitos.
- Cabe en GPU consumer: probablemente en RTX 4090 (24 GB) usando cuantización int8 o w4a8; no confirmado en la información disponible.
- Opciones de despliegue: ComfyUI mediante el nodo personalizado `alisson-anjos/ComfyUI-Qwen3.5-H3`; los codificadores cuantizados se distribuyen en Comfy-Org/Qwen3.5. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Minimax-H3 (este) | 9B + adaptadores | no disponible | Codificador de condicionamiento para MiniMax-H3 | Apache 2.0 | Hugging Face + nodo ComfyUI |
| Qwen3-VL-32B (profesor de MiniMax-H3) | 32B | no disponible | Codificador de texto y visión original | no disponible en la información | Uso interno en MiniMax-H3 |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | LLM multimodal de propósito general | no disponible en la información | Hugging Face |

La comparativa con alternativas de la misma categoría (adaptadores de codificador para modelos de vídeo) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es un LLM utilizable de forma autónoma: solo funciona como codificador de condicionamiento para MiniMax-H3 Ref2VA en ComfyUI.
- La fidelidad respecto al profesor Qwen3-VL-32B es imperfecta: coseno de visión 0,8879 y PSNR medio de vídeo 14,764 dB, con degradación notable al aumentar el número de referencias (caso 04 con 4 referencias baja a 11,104 dB y correlación 0,4808).
- Idioma limitado al inglés según la model card; no se garantiza comportamiento en castellano u otros idiomas.
- Riesgo de alucinación y de deriva de identidad en las referencias visuales, especialmente con muchas imágenes de referencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni evidencia de uso en producción.
- El autor es un particular (Alissonerdx), no un laboratorio consolidado; la licencia Apache 2.0 permite uso comercial, pero no hay garantías de soporte ni mantenimiento.
- Dependencia del nodo de ComfyUI y de la versión concreta de MiniMax-H3; cambios en el pipeline pueden romper la compatibilidad.
- No se especifican sesgos conocidos ni datos de entrenamiento, lo que dificulta evaluar riesgos de representación.

## Enlaces

- Hugging Face: https://huggingface.co/Alissonerdx/Qwen3.5-9B-Minimax-H3
- Nodo ComfyUI: https://github.com/alisson-anjos/ComfyUI-Qwen3.5-H3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Codificadores Qwen3.5 para ComfyUI: https://huggingface.co/Comfy-Org/Qwen3.5/tree/main/text_encoders
- Artefactos de entrenamiento: https://huggingface.co/Alissonerdx/Qwen3.5-9B-Minimax-H3/tree/main/training_artifacts
