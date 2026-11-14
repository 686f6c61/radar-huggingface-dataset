# Sakura721/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-GGUF es una conversión a formato GGUF del modelo `xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic`, publicada por el usuario Sakura721. Se trata de una cuantización Q4_K_M (5,13 bits por peso) pensada para su ejecución en `llama.cpp`, LM Studio, Ollama y `llama-cpp-python`, e incluye un proyector visual F16 independiente (`mmproj`) que preserva la ruta multimodal de imagen y vídeo.

El modelo subyacente es el resultado de una cadena de derivaciones: parte de una destilación SFT+RL de Qwen3.5-4B publicada como `Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B`, sobre la que se aplicó una ablación de rechazo estilo Heretic (ARA) para eliminar restricciones de alineación, y finalmente se cuantizó a GGUF. La arquitectura declarada es `qwen3_5` (`qwen35` en GGUF), híbrida con atención lineal y atención completa, y una cabeza MTP (multi-token prediction) adicional.

Es relevante por tres motivos: ofrece una ventana de contexto nativa de 262.144 tokens en un modelo de apenas 4.326 M de parámetros de texto, mantiene capacidades multimodales (texto, imagen y vídeo) en un paquete de menos de 3,3 GiB, y está liberado bajo licencia Apache 2.0. Todo ello lo sitúa en el segmento de modelos pequeños de largo contexto ejecutables en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (etiqueta GGUF `qwen35`); transformer híbrido con atención lineal y atención completa, más 1 cabeza MTP |
| Parámetros totales | 4.326 M (texto) + 0,34 M (proyector multimodal, según model card); el campo safetensors del repo indica 333.514.240 |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens nativos (rope_theta 10.000.000, MRoPE intercalado `[11, 11, 10, 0]`) |
| Tipos de cuantización | Q4_K_M (5,13 bpw) para el modelo principal; F16 para el `mmproj` |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`llama.cpp`, build b12182 / `fd27b2034`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de 33 capas (32 de transformer más 1 de MTP), con `hidden_size` de 2.560, FFN SwiGLU de dimensión intermedia 9.216, 16 cabezas de consulta y 4 de clave/valor con `head_dim` de 256, y vocabulario BPE de 248.320 tokens. El patrón de atención es de 3 capas de atención lineal por cada capa de atención completa (`full_attention_interval = 4`), con atención completa únicamente en las capas 3, 7, 11, 15, 19, 23, 27 y 31. La atención lineal emplea un mecanismo de tipo SSM con kernel de convolución 4, tamaño de estado 128, tamaño interno 2.560, 16 grupos y rango de paso temporal 32. Las embeddings están atadas (`output.weight` referencia a `token_embd.weight`, sin `lm_head` separado), y el RoPE es MRoPE intercalado con rotación parcial de 0,25.

El entrenamiento del modelo base no se detalla en la información disponible: la model card solo indica la cadena de derivación (destilación SFT+RL de Qwen3.5-4B por parte de Jackrong, seguida de una ablación Heretic ARA), sin especificar número de tokens, composición del dataset ni detalles de RLHF/DPO. La innovación técnica destacable es la combinación de atención lineal con atención completa: solo 8 de las 33 capas mantienen una caché KV creciente, lo que reduce el coste de contexto largo. La cuantización Q4_K_M asigna Q6_K a los tensores sensibles (`attn_v`, `ffn_down` y proyecciones de salida) y mantiene en F32 todas las normas, `ssm_dt`, `ssm_conv1d`, `A_log`, `dt_bias` y tensores de estado recurrente.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento explícito: los tokens de razonamiento se devuelven en `reasoning_content` y la respuesta visible llega tras el token `</think>`.
- Capacidad multimodal de imagen y vídeo, siempre que se cargue el archivo `mmproj` F16 junto al modelo principal.
- Razonamiento matemático y resolución de problemas paso a paso (la model card incluye ejemplos de demostraciones e integrales).
- Soporte multilingüe declarado para inglés, chino, coreano, japonés, español y ruso.
- Cabeza MTP (multi-token prediction) presente en el GGUF (4 tensores en `blk.32`), orientada a decodificación especulativa.
- Plantilla de chat embebida en el GGUF, por lo que `llama-cli -cnv` y `/v1/chat/completions` funcionan sin flags adicionales.
- Servidor compatible con la API de OpenAI mediante `llama-server`.
- No se documenta en la información disponible soporte explícito de tool calling o function calling, ni de agentes multi-paso.

## Casos de uso

- Asistente de razonamiento local: el modelo puede resolver problemas matemáticos y demostraciones con trazas de pensamiento separadas, útil para entornos sin conexión donde no se quiere enviar datos a la nube.
- Análisis de documentos extensos: con 262.144 tokens de contexto nativo y solo 8 capas con caché KV creciente, es adecuado para resumir o consultar contratos, informes o bases de código largas en una sola pasada.
- Procesamiento de imágenes y vídeo en local: gracias al proyector `mmproj` F16, puede describir fotos, extraer texto de capturas o analizar fotogramas sin depender de servicios externos.
- Despliegue en estaciones de trabajo modestas: con 2,59 GiB para el modelo Q4_K_M, cabe en GPUs de consumo y permite servir una API compatible con OpenAI mediante `llama-server` en un portátil o mini-PC.
- Generación de contenido multilingüe: cubre inglés, chino, coreano, japonés, español y ruso, lo que permite redactar o traducir contenido en esos idiomas con un único modelo.
- Investigación sobre alineación y robustez: al ser una variante ablacionada (Heretic/ARA), sirve para estudiar el comportamiento de modelos sin rechazo y comparar con la versión original alineada.
- Prototipado de pipelines multimodales: la integración con `llama-cpp-python` y LM Studio facilita incorporar el modelo a scripts de Python o a interfaces de escritorio para pruebas rápidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,6 GiB para el modelo Q4_K_M en texto; unos 3,3 GiB adicionales si se carga el `mmproj` F16 para visión. El contexto consume memoria adicional según la caché KV, aunque solo 8 capas la mantienen creciente.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para texto (por ejemplo, RTX 3060, RTX 4060, RTX 4090); para visión conviene disponer de 6-8 GB.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060/4060/4070/4090 y equivalentes; también puede ejecutarse en CPU con `llama.cpp`.
- Opciones de despliegue: `llama.cpp` (CLI, `llama-server` y `llama-mtmd-cli` para multimodal), LM Studio, Ollama (solo texto, el `mmproj` no se carga hoy) y `llama-cpp-python`.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic (GGUF Q4_K_M) | 4.326 M (texto) + 0,34 M (mmproj) | 262.144 | texto, imagen, vídeo | Apache 2.0 | GGUF en Hugging Face |
| Sakura721/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF | no disponible en la información | no disponible | no disponible | no disponible | GGUF en Hugging Face |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic (base fp) | 4.326 M (texto) | 262.144 | texto, imagen, vídeo | Apache 2.0 | safetensors en Hugging Face |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B (upstream) | no disponible en la información | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de las alternativas para una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo ablacionado (Heretic/ARA): la eliminación del rechazo puede aumentar la probabilidad de generar contenido dañino, ofensivo o inexacto; requiere filtros y supervisión en producción.
- Riesgo de alucinación inherente a modelos de 4B, especialmente en tareas de conocimiento factual y contexto muy largo.
- La información sobre datos de entrenamiento y evaluación es escasa; no hay benchmarks publicados que permitan validar el rendimiento real.
- El soporte multimodal en Ollama no está disponible: el `mmproj` no se puede cargar a través de esa herramienta.
- El contexto nativo es de 262.144 tokens, pero el consumo de memoria y la calidad en contextos extremos no están documentados.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante sin alineación conlleva riesgos reputacionales y de cumplimiento que deben evaluarse.
- El modelo se publicó en noviembre de 2026 con 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- La discrepancia entre los parámetros declarados en la model card (4.326 M) y el campo safetensors del repo (333.514.240) debe tenerse en cuenta al planificar el despliegue.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Sakura721/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-GGUF
- Modelo base (fp): https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Modelo upstream (destilación): https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Variante 9B del mismo autor: https://huggingface.co/Sakura721/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
