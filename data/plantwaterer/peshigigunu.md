# plantwaterer/peshigigunu

## Resumen

peshigigunu es un modelo de fusión (merge) de pesos desarrollado por el usuario plantwaterer, publicado bajo licencia Apache-2.0. No se trata de un modelo de lenguaje generativo al uso, sino de un sistema de decisión multimodal orientado a responder preguntas de opción múltiple sobre imágenes, devolviendo una probabilidad para cada opción en lugar de texto generado. El modelo parte de Qwen/Qwen3.8-27B (27.356.728.560 parámetros reales según safetensors) y combina los pesos de Rover00/WeMM-Decision con la mitad de la actualización de fine-tuning de plantwaterer/peshashaga.

La arquitectura subyacente es la de transformers `Qwen3_5ForConditionalGeneration`, un transformer híbrido que alterna capas de atención completa con capas recurrentes Gated DeltaNet, e incluye codificador visual para entrada image-text-to-text. El sistema completo integra además un motor OCR externo (PP-OCRv5 en su variante mobile) que extrae texto de las imágenes antes de construir el prompt, y un readout de 255 filas fp32 (una por código de respuesta A, B, C...) que se aplica sobre el estado oculto del último token del prompt para producir la distribución de probabilidad sobre las opciones.

Su relevancia es acotada pero específica: propone un patrón de "modelo como motor de decisión" con atención bidireccional sobre el prompt, thinking desactivado y salida determinista por softmax, en lugar de decodificación autoregresiva. El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y no declara idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + capas recurrentes Gated DeltaNet), `Qwen3_5ForConditionalGeneration` con codificador visual |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model-*.safetensors`, bf16, 54,7 GB) + `readout.safetensors` (fp32, 255 filas) |

## Arquitectura y entrenamiento

El modelo es una fusión aritmética de pesos: stock Qwen3.8-27B más 1× el delta de WeMM-Decision (revisión `1543fbfcb171c7990607369e4c17329d3a7a6385`) más 0.5× el delta de peshashaga (revisión `61320dc8fb90b40af79f0366098d4fb034630838`). No hay entrenamiento adicional sobre el merge: los pesos resultantes se distribuyen en el layout de `Qwen3_5ForConditionalGeneration` con el `config.json`, tokenizer, processor y chat-template originales de Qwen3.8-27B. La arquitectura base combina capas de atención completa con capas recurrentes Gated DeltaNet; en el motor de inferencia, las capas de atención completa reciben atención bidireccional sobre todo el prompt (cada token atiende a todos los tokens del prompt), mientras que las capas recurrentes permanecen causales.

El sistema no decodifica texto. La respuesta se obtiene multiplicando el estado oculto del último token del prompt por las filas del readout correspondientes a los códigos de las opciones de la pregunta, aplicando después un softmax a temperatura 1 sobre esas opciones. El readout es el fichero de WeMM-Decision sin modificar: 255 filas fp32 con similitud coseno de al menos 0,9998 respecto a las filas de la cabeza LM del modelo base para esos códigos, pero no idénticas. El prompt sigue el formato "d3" de WeMM-Decision (derivado de d3/Decision 3.0 del equipo vLLM Semantic Router), con un turno de sistema que instruye al modelo a actuar como motor de decisión y un turno de usuario que concatena imágenes, estado OCR, pregunta y opciones. El thinking está desactivado (`enable_thinking=False`).

## Capacidades

- Respuesta a preguntas de opción múltiple sobre imágenes, con una probabilidad por opción (hasta 255 códigos A, B, C...).
- Lectura de texto en imágenes mediante OCR externo (PP-OCRv5 mobile det + en rec), con hasta 60 líneas y 1.200 caracteres por imagen, score de reconocimiento mínimo 0,5.
- Procesamiento de imágenes redimensionadas a un rango de 589.824 a 1.638.400 píxeles manteniendo aspecto (las imágenes pequeñas se amplían).
- Atención bidireccional sobre el prompt en capas de atención completa, adecuada para tareas de decisión sobre contexto completo.
- Salida determinista por softmax sobre opciones, sin generación autoregresiva ni tool calling.
- No se documentan capacidades de agentes, multi-step reasoning, matemáticas, código ni audio.
- Capacidades multilingües: no disponibles (el OCR de reconocimiento es específicamente inglés, `en_PP-OCRv5_mobile_rec`).

## Casos de uso

- Evaluación automática de exámenes tipo test con imágenes: el modelo recibe la imagen del enunciado y las opciones y devuelve la probabilidad de cada una, útil para sistemas de corrección o de análisis de ítems.
- Clasificación de capturas de pantalla o formularios: con el OCR extrayendo el texto y el modelo puntuando opciones, se puede decidir la categoría o el estado de un documento visual.
- Moderación o triaje visual con criterios predefinidos: plantear la decisión como una pregunta de opción múltiple ("¿qué tipo de contenido es?") y usar la distribución de probabilidad como señal de confianza.
- Selección de respuesta en asistentes de accesibilidad: dado un entorno visual descrito por OCR, elegir entre opciones de acción predefinidas con una probabilidad asociada.
- Investigación sobre decisión multimodal: el sistema permite estudiar cómo un LLM fusionado puntúa opciones sobre contexto visual, con atención bidireccional y sin decodificación, como banco de pruebas controlado.
- Automatización de encuestas o cuestionarios basados en imágenes: procesar lotes de imágenes con preguntas fijas y obtener distribuciones de respuesta para análisis estadístico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: los pesos ocupan 54,7 GB, por lo que se necesita al menos una GPU con 80 GB (A100 80GB, H100 80GB) para cargar el modelo completo sin cuantizar.
- El sistema requiere además el wheel GPU de PaddlePaddle para el OCR, que corre en la misma GPU que el modelo.
- No cabe en GPUs de consumo (RTX 4090 24GB, RTX 3090 24GB) en bf16 sin cuantización, y no se documentan opciones de cuantización (GGUF, AWQ, GPTQ) en la información disponible.
- Despliegue: el autor proporciona un motor propio (`peshigigunu.py` + `decision_index`) sobre PyTorch SDPA y transformers, con instalación vía `uv` en Linux x86_64. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica que el tiempo de OCR forma parte de cada cifra de latencia, pero no publica valores concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| peshigigunu | 27,36 B | no disponible | Decisión multimodal por opciones | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.8-27B | ~27 B (base) | no disponible | LLM generativo multimodal | no disponible en la información | Hugging Face |
| Rover00/WeMM-Decision | no disponible | no disponible | Decisión multimodal | Apache-2.0 | Hugging Face |
| plantwaterer/peshashaga | no disponible | no disponible | Fine-tune de Qwen3.8-27B | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un merge aritmético de pesos sin evaluación publicada; su calidad real frente a los modelos de origen es desconocida.
- Depende de forma no opcional de un pipeline OCR externo (PP-OCRv5) y de un formato de prompt concreto ("d3"); usarlo fuera de ese entorno invalida las cifras del autor y probablemente el comportamiento esperado.
- El OCR de reconocimiento es exclusivamente inglés, lo que limita el sistema a texto en imágenes en ese idioma.
- No genera texto: solo puntúa opciones predefinidas; no sirve para generación abierta, tool calling ni razonamiento multi-paso.
- Riesgo de alucinación no evaluado; el softmax sobre opciones puede producir distribuciones planas o sobreconfiadas sin calibración publicada.
- Sesgos conocidos: no documentados.
- Licencia Apache-2.0 permite uso comercial, pero el NOTICE de WeMM-Decision debe reproducirse y se desconoce si los modelos base imponen restricciones adicionales.
- Requiere Linux x86_64, `uv`, PaddlePaddle GPU y una GPU de 80 GB en bf16; no hay soporte documentado para cuantización ni para stacks de despliegue estándar.
- El repositorio pesa 54,7 GB y el modelo tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/plantwaterer/peshigigunu
- Modelo base WeMM-Decision: https://huggingface.co/Rover00/WeMM-Decision/tree/1543fbfcb171c7990607369e4c17329d3a7a6385
- Modelo base peshashaga: https://huggingface.co/plantwaterer/peshashaga/tree/61320dc8fb90b40af79f0366098d4fb034630838
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Decision Index (motor): https://github.com/apolinario/decision-index
- d3 (Decision 3.0), vLLM Semantic Router Team: https://huggingface.co/vllm-sr/d3
- PP-OCRv5 (PaddleOCR): https://github.com/PaddlePaddle/PaddleOCR
- PP-OCRv5 mobile det: https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_det
- PP-OCRv5 mobile rec (inglés): https://huggingface.co/PaddlePaddle/en_PP-OCRv5_mobile_rec
