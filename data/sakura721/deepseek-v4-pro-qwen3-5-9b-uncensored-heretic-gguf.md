# Sakura721/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF es una conversión a formato GGUF del modelo `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`, publicada por el usuario Sakura721. Se trata de una cuantización Q4_K_M (5,02 bpw) pensada para su uso con llama.cpp, LM Studio, Ollama y llama-cpp-python, e incluye además un proyector visual independiente en F16 (mmproj) que preserva la ruta multimodal de imagen y vídeo.

El modelo subyacente es el resultado de una cadena de destilación: parte de `Qwen3.5-9B`, se somete a un proceso de SFT y RL por parte de Jackrong (`Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B`) y posteriormente recibe una ablación ARA con la técnica Heretic, que elimina los mecanismos de rechazo y alineación (modelo "abliterated" o "uncensored"). La arquitectura es `qwen3_5` (etiquetada como `qwen35` en GGUF), un transformer híbrido con atención lineal y atención completa intercaladas, más una cabeza MTP (multi-token prediction).

Con 8.954 millones de parámetros de texto y 456 millones en el proyector visual, el modelo ofrece una ventana de contexto nativa de 262.144 tokens. Su principal atractivo es la combinación de contexto largo, capacidades multimodales y ausencia de censura, todo ello en un paquete de 5,24 GiB que cabe en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` / `qwen35` (transformer híbrido: atención lineal + atención completa, 1 cabeza MTP) |
| Parametros totales | 8.953.803.264 (texto) + 456 M (proyector visual mmproj) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos (rope_theta 10.000.000, MRoPE intercalado `[11, 11, 10, 0]`) |
| Tipos de cuantizacion | Q4_K_M (5,02 bpw) en este repo; el modelo base admite otras cuantizaciones GGUF |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (217 tensores Q4_K, 33 Q6_K, 177 F32); mmproj en F16 |
| Tamano del repo | 12,2 GB |
| Vocabulario | 248.320 tokens (BPE, `tokenizer.ggml.pre = qwen35`) |
| Capas | 33 (32 transformer + 1 MTP) |
| Hidden size | 4096 |
| Cabezas Q / KV | 16 / 4, head_dim 256 |
| FFN | SwiGLU, intermediate 12.288 |
| Herramienta de conversion | llama.cpp build b12182 (`fd27b2034`) |

## Arquitectura y entrenamiento

La arquitectura `qwen3_5` es un transformer híbrido que intercala atención lineal (basada en SSM, con kernel de convolución 4, tamaño de estado 128, tamaño interno 4096, 16 grupos y rango de paso temporal 32) y atención completa en una proporción de 3 a 1: solo las capas con índices 3, 7, 11, 15, 19, 23, 27 y 31 mantienen caché KV creciente. Esto reduce drásticamente el coste del contexto largo: aproximadamente 32 KiB por token con caché KV en F16 (≈1 GiB a 32K, ≈8 GiB a 262K). El modelo incorpora además una cabeza MTP (multi-token prediction) que permite decodificación especulativa y acelera la generación.

El entrenamiento del modelo base sigue una cadena de destilación: parte de Qwen3.5-9B, recibe SFT y RL por parte de Jackrong para aproximarse al comportamiento de DeepSeek-V4-Pro, y después se somete a una ablación ARA con la técnica Heretic que elimina las capas de rechazo. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno con razonamiento explícito (los tokens de razonamiento se devuelven en `reasoning_content`, separados de la respuesta visible tras `</think>`).
- Razonamiento matemático y lógico (el modelo base se entrenó con RL para tareas de razonamiento).
- Generación y análisis de código.
- Procesamiento de imagen y vídeo mediante el proyector mmproj F16 (requiere ambos ficheros GGUF).
- Capacidades multilingües en inglés, chino, coreano, japonés, español y ruso.
- Soporte de tool calling / function calling a través de la API compatible con OpenAI de llama-server.
- Modo de razonamiento (thinking mode) con separación de tokens internos y respuesta final.
- Comportamiento sin censura ni rechazos (modelo abliterated), lo que permite abordar temas que otros modelos alineados rechazarían.
- Compatible con endpoints OpenAI (`/v1/chat/completions`).

## Casos de uso

- **Atención al cliente automatizada con contexto largo**: la ventana de 262.144 tokens y el bajo coste de caché KV (solo 8 capas con caché creciente) permiten mantener conversaciones multi-turno con historiales extensos o documentación de referencia adjunta sin degradación apreciable del rendimiento.
- **Análisis de documentos e imágenes en un solo paso**: gracias al proyector visual F16, el modelo puede recibir capturas, diagramas o fotogramas de vídeo junto con texto y responder preguntas sobre ellos, útil para soporte técnico o extracción de información de capturas de pantalla.
- **Asistente de programación local**: con 9B parámetros en Q4_K_M (5,24 GiB) cabe en una RTX 4090 o incluso en GPUs de 8 GB, y el soporte de tool calling permite integrarlo en pipelines de CI/CD para revisión de código, generación de tests o explicación de errores.
- **Investigación en seguridad y alineación**: al ser un modelo abliterated, sirve para estudiar el comportamiento de modelos sin capas de rechazo, analizar sesgos residuales y comparar respuestas frente a versiones alineadas.
- **Generación de contenido creativo sin restricciones**: escritura de ficción, guiones o material divulgativo sobre temas sensibles donde los modelos alineados aplican rechazos, con la ventaja de ejecución local y privacidad total.
- **Despliegue en el borde (edge) con LM Studio u Ollama**: el formato GGUF y el tamaño reducido permiten ejecutar el modelo en portátiles con GPU de consumo o incluso en CPU con llama.cpp, sin depender de servicios en la nube.
- **Procesamiento de vídeo para resumen automático**: la ruta multimodal admite vídeo a través de `llama-mtmd-cli`, lo que permite generar descripciones o resúmenes de clips cortos en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el fichero Q4_K_M ocupa 5,24 GiB; con caché KV en F16 a 16K de contexto se necesitan aproximadamente 0,5 GiB adicionales, por lo que el total ronda los 6-7 GiB. A 32K de contexto, unos 1 GiB extra de caché KV (≈7-8 GiB en total). A 262K de contexto, ≈8 GiB solo de caché KV, lo que exige GPUs de 24 GB o más.
- **GPU recomendadas**: RTX 4090 (24 GB) para contexto completo; RTX 3090/4080 (16-24 GB) para contexto medio-alto; RTX 4060 Ti 16 GB o RTX 3060 12 GB para contexto moderado (16-32K).
- **¿Cabe en GPU de consumo?**: sí. El modelo de texto solo (sin mmproj) cabe en GPUs de 8 GB con contexto reducido; con visión se recomienda al menos 12 GB.
- **Opciones de despliegue**: llama.cpp (build b12182 o superior), LM Studio (detecta automáticamente el prefijo `mmproj-`), Ollama (solo texto, el proyector no es cargable actualmente), llama-cpp-python, llama-server con API compatible con OpenAI.
- **Latencia y throughput**: no disponibles en la información proporcionada. La cabeza MTP y la atención lineal deberían mejorar el throughput frente a un transformer denso equivalente, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Cuantización GGUF |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (este) | 8,95 B | 262.144 | texto, imagen, vídeo | Apache 2.0 | Q4_K_M |
| Qwen3.5-9B (base upstream) | ~9 B | no disponible | texto (posiblemente multimodal) | no disponible | no disponible |
| Gemma 3 12B | ~12 B | 128.000 | texto, imagen | Gemma license | sí |
| Llama 3.1 8B | 8 B | 128.000 | texto | Llama 3.1 license | sí |

La comparativa se limita a los datos disponibles; no se dispone de información sobre benchmarks comparativos entre estos modelos en la documentación proporcionada.

## Limitaciones y advertencias

- **Modelo abliterated**: la ablación Heretic elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido sensible, ofensivo o inseguro sin filtros. No es adecuado para aplicaciones de cara al público sin moderación adicional.
- **Riesgo de alucinación**: como todo modelo de 9B, puede inventar datos, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- **Idiomas**: aunque soporta seis idiomas, el rendimiento en español, ruso, coreano y japonés puede ser inferior al de inglés y chino, dado el sesgo típico de los datasets de entrenamiento.
- **Contexto largo**: aunque la ventana nativa es de 262.144 tokens, el rendimiento en tareas de recuperación de información a distancias extremas puede degradarse; se recomienda validar con pruebas propias.
- **Visión limitada en Ollama**: el proyector mmproj no es cargable a través de Ollama en la fecha de publicación, por lo que la ruta multimodal solo está disponible en llama.cpp y LM Studio.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo base upstream puede tener restricciones adicionales no reflejadas en esta ficha; conviene verificar la licencia de `Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B` y de Qwen3.5-9B.
- **Fecha de creación**: el repositorio data de noviembre de 2026; verificar que la build de llama.cpp utilizada (b12182) siga siendo compatible con versiones posteriores.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Sakura721/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Modelo base (fp): https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo upstream (SFT+RL): https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
- Ollama: https://ollama.com/
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
