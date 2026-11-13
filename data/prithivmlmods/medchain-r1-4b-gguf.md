# prithivMLmods/MedChain-R1-4B-GGUF

## Resumen

MedChain-R1-4B-GGUF es la versión cuantizada en formato GGUF del modelo MedChain-R1-4B, un modelo vision-lenguaje de 4.205.751.296 parámetros desarrollado por adidukrembzuai y empaquetado por prithivMLmods para su uso con llama.cpp. Está construido sobre Qwen3.5-4B y su tarea principal es el grounding secuencial de imágenes médicas: dada una secuencia de imágenes (MRI, CT y otras modalidades) junto con una pregunta clínica, el modelo genera primero un razonamiento fundamentado en la imagen dentro de etiquetas `<think>` y después devuelve una única caja delimitadora en coordenadas de píxel.

El modelo se entrena con supervisión deliberativa de cadena de pensamiento (dCoT-SFT) sobre el corpus MedChain y posteriormente con GRPO usando una recompensa combinada de IoU y formato. El corpus MedChain contiene 182.573 razonamientos filtrados sobre las 8 tareas de MedSG-Bench y 10 modalidades de imagen. Este checkpoint concreto (dCoT-SFT checkpoint-2000 seguido de una pasada de GRPO, semilla 42) obtiene 75,97 mIoU y 83,67 Acc@0.5 sobre las 9.630 preguntas de test de MedSG-Bench.

Es relevante porque demuestra que un modelo de 4B puede superar al estado del arte supervisado de mayor tamaño (MedSeq-Grounder 7B, con 72,55 mIoU / 79,71 Acc@0.5) en una tarea médica especializada, y porque la distribución GGUF con cuantizaciones desde Q3 hasta BF16 lo hace desplegable en hardware de consumo. Se trata, no obstante, de un artefacto de investigación no validado para diagnóstico clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Qwen3.5-4B (transformer multimodal con proyector visual); detalles internos no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, mmproj-bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero de proyección multimodal mmproj-bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal al que se añade un proyector visual (mmproj) para procesar imágenes médicas. La tarea se formula como grounding secuencial: el modelo recibe una secuencia de imágenes y una pregunta clínica, genera un razonamiento en etiquetas `<think>` y emite una caja delimitadora en coordenadas de píxel. El entrenamiento combina dos fases: primero dCoT-SFT (supervisión de cadena de pensamiento deliberativa) sobre el corpus MedChain, y después una pasada de GRPO con recompensa de IoU más formato.

Los datos de entrenamiento son el corpus MedChain: 182.573 razonamientos filtrados sobre las 8 tareas de MedSG-Bench y 10 modalidades de imagen. Los razonamientos se generaron con un VLM médico (FlemingVL-38B) que redacta el borrador y un refinador multimodal (Qwen3.5-397B-A17B) que lo reescribe condicionado a la caja anotada. No se especifica el número total de tokens de entrenamiento. El modelo no emplea decodificación especulativa MTP (indicado explícitamente en la model card como "Speculative Decoding: No").

## Capacidades

- Razonamiento visual médico con cadena de pensamiento explícita en etiquetas `<think>` antes de la respuesta.
- Grounding visual secuencial: devuelve una caja delimitadora en coordenadas de píxel sobre imágenes médicas.
- Procesamiento multi-imagen: acepta secuencias de imágenes como entrada.
- Modalidades cubiertas: 10 modalidades de imagen, con mención explícita a radiología, MRI y CT.
- Tareas de MedSG-Bench: 8 tareas de grounding médico, incluyendo difference grounding, multi-view grounding, patch grounding y referring grounding.
- Generación de texto conversacional (pipeline image-text-to-text, tag "conversational").
- Compatible con text-generation-inference y llama-cpp.
- No se documentan capacidades de tool calling, function calling, agentes ni audio en la información disponible.

## Casos de uso

- Investigación en grounding médico: reproducción de experimentos sobre MedSG-Bench para comparar estrategias de supervisión (dCoT frente a answer-only) y de RL (GRPO) en tareas de localización anatómica.
- Anotación asistida de imágenes radiológicas: el modelo propone cajas delimitadoras sobre MRI o CT que un radiólogo puede revisar y corregir, acelerando el etiquetado de datasets.
- Evaluación de modelos vision-lenguaje en entornos con recursos limitados: con cuantización Q4_K_M (2,74 GB) se puede ejecutar en GPUs de consumo para pruebas de concepto de grounding médico.
- Docencia e investigación sobre razonamiento multimodal: el formato `<think>` permite inspeccionar la justificación previa a la localización, útil para estudiar la fidelidad del razonamiento.
- Comparación de modalidades de imagen: al soportar multi-imagen, permite estudiar diferencias entre vistas o estudios seriados en tareas de difference grounding.
- Prototipado de pipelines de análisis de imágenes médicas en llama.cpp: integración en aplicaciones locales con Ollama o llama.cpp para experimentación sin infraestructura en la nube.
- Benchmarking de cuantizaciones: los múltiples ficheros GGUF permiten medir la degradación de mIoU y Acc@0.5 según el nivel de cuantización en una tarea médica concreta.

## Benchmarks y rendimiento

| Modelo | mIoU | Acc@0.5 | Conjunto |
|---|---|---|---|
| MedChain-R1-4B-GGUF (este checkpoint) | 75,97 | 83,67 | MedSG-Bench test (9.630 preguntas) |
| MedChain-R1-4B (fila GRPO del paper, otro checkpoint) | 75,32 | 82,89 | MedSG-Bench test |
| MedSeq-Grounder 7B (SOTA supervisado) | 72,55 | 79,71 | MedSG-Bench test |
| MedChain-R1-9B (hermano mayor) | 77,54 | 84,87 | MedSG-Bench test |

La model card indica que las ganancias varían por tarea: frente a un modelo 4B answer-only, la supervisión de razonamiento gana 14,7–16,1 mIoU en difference grounding pero pierde 2,2–3,2 en multi-view, patch y referring grounding, y que GRPO añade poco después de dCoT-SFT. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: BF16 8,42 GB; Q6_K 3,46 GB; Q5_K_M 3,09 GB; Q5_K_S 2,99 GB; Q4_K_M 2,74 GB; Q4_K_S 2,57 GB; Q3_K_L 2,49 GB; Q3_K_M 2,3 GB. Hay que añadir el fichero mmproj-bf16 (676 MB) para el procesamiento visual y el espacio de contexto/KV cache.
- GPU recomendadas: no especificadas por el autor. Por tamaño, las cuantizaciones Q3–Q6 caben en GPUs de consumo con 6–8 GB de VRAM; BF16 requiere al menos 10–12 GB.
- Cabe en GPU de consumo: sí, con cuantizaciones Q3_K_M a Q6_K en tarjetas de 6–8 GB (por ejemplo, RTX 3060, RTX 4060, RTX 4070). BF16 requiere tarjetas de gama alta o profesional.
- Opciones de despliegue: llama.cpp (cuantización realizada con esta herramienta), llama-cpp en general, text-generation-inference. No se documenta soporte explícito de vLLM, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.
- Restricciones de uso: la model card indica generar un ejemplo a la vez (el batching produce salidas degeneradas), usar el procesador incluido (uno de menor resolución cuesta 3–5 puntos) y añadir la instrucción exacta del autor a cada pregunta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | mIoU / Acc@0.5 (MedSG-Bench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedChain-R1-4B-GGUF | 4,2B | no disponible | 75,97 / 83,67 | Apache 2.0 | GGUF en HF |
| MedChain-R1-9B | no disponible | no disponible | 77,54 / 84,87 | no disponible | HF (según model card) |
| MedSeq-Grounder 7B | 7B | no disponible | 72,55 / 79,71 | no disponible | no disponible |
| Modelo 4B answer-only (referencia del paper) | 4B | no disponible | inferior en difference grounding, superior en multi-view, patch y referring | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto de investigación no validado para diagnóstico ni uso clínico; no debe emplearse en decisiones médicas reales.
- Evaluado únicamente en MedSG-Bench; no hay evidencia de generalización a otros conjuntos o poblaciones.
- Los razonamientos se redactaron conociendo la respuesta, por lo que pueden ser post-hoc y no reflejar fielmente el proceso de razonamiento del modelo.
- El modelo solo soporta inglés.
- El batching produce salidas degeneradas: hay que generar un ejemplo cada vez, lo que limita el throughput en producción.
- Es necesario usar el procesador incluido y añadir la instrucción exacta a cada pregunta; desviarse degrada el rendimiento (3–5 puntos con un procesador de menor resolución).
- Las ganancias del razonamiento varían por tarea y en algunas (multi-view, patch, referring grounding) el modelo pierde frente a un 4B answer-only.
- Riesgo de alucinación en la localización y en la justificación clínica; no se documentan sesgos específicos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación clínica hace desaconsejable cualquier aplicación médica en producción sin evaluación independiente.
- No se documenta longitud de contexto, por lo que no se puede garantizar el manejo de secuencias largas de imágenes.

## Enlaces

- Hugging Face: https://huggingface.co/prithivMLmods/MedChain-R1-4B-GGUF
- Modelo base: https://huggingface.co/adidukrembzuai/MedChain-R1-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/adidukrembzuai/MedChain-R1-data
- Dataset de evaluación: https://huggingface.co/datasets/MedSG-Bench/MedSG-Bench
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del cuantizador: https://huggingface.co/prithivMLmods
