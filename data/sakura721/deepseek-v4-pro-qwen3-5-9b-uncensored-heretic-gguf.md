# Sakura721/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF es una conversión a formato GGUF del modelo xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, publicada por el usuario Sakura721. Se trata de una destilación (SFT + RL) del modelo Qwen3.5-9B realizada por Jackrong, sobre la que posteriormente se aplicó una ablación ARA (Heretic) para eliminar los mecanismos de rechazo y censura, dando lugar a una variante "uncensored" o "abliterated". Esta versión concreta está cuantizada a Q4_K_M para su uso con llama.cpp, LM Studio, Ollama y llama-cpp-python, e incluye un proyector de visión F16 separado (mmproj) que preserva la capacidad multimodal.

El modelo emplea la arquitectura `qwen3_5` (etiquetada como `qwen35` en GGUF), una arquitectura híbrida que combina capas de atención lineal con capas de atención completa en una proporción de 3 a 1. Cuenta con 8.954 mil millones de parámetros en el tronco más 0.249 mil millones en una cabeza MTP (Multi-Token Prediction), y un proyector visual de 0.456 mil millones. Su ventana de contexto nativa es de 262.144 tokens, lo que lo sitúa en la gama alta de modelos de ~9B para tareas de contexto largo.

La relevancia actual del modelo reside en tres factores: su naturaleza multimodal (texto, imagen y vídeo), su enorme contexto nativo y su condición de modelo "sin censura", que lo hace atractivo para investigación sobre alineación, red-teaming y aplicaciones donde los rechazos del modelo base resultan un obstáculo. La licencia Apache 2.0 facilita su uso comercial, aunque la ablación introduce caveats importantes de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` / `qwen35` — transformer híbrido con atención lineal + atención completa (intervalo 4: 3 lineales + 1 completa) y 1 cabeza MTP |
| Parametros totales | 9.197.093.888 (~9.2 B; 8.954 B tronco + 0.249 B MTP) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos (rope_theta 10.000.000, MRoPE intercalado `[11, 11, 10, 0]`, rotary parcial 0.25) |
| Tipos de cuantizacion | Q4_K_M (5.02 bpw) en el tronco + cabeza MTP en F16; distribución: 217 tensores Q4_K, 33 Q6_K, 177 F32, 15 F16 |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp build b12182, commit fd27b2034); proyector de visión en GGUF F16 separado |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de 33 capas (32 de transformer más 1 de MTP), con un tamaño oculto de 4096 y FFN SwiGLU con dimensión intermedia de 12.288. La innovación principal es la disposición de atención: por cada grupo de 4 capas, 3 usan atención lineal (modelo de espacio de estados, con kernel de convolución 4 y tamaño de estado 128) y 1 usa atención completa (capas en los índices 3, 7, 11, 15, 19, 23, 27 y 31). Esta combinación reduce el coste computacional en contextos largos manteniendo la capacidad de atención global. La atención completa usa 16 cabezas de consulta y 4 de clave/valor, con dimensión de cabeza 256, y RoPE MRoPE intercalado con secciones `[11, 11, 10, 0]` y theta de 10.000.000. El vocabulario es de 248.320 tokens con tokenizador BPE (`qwen35`).

El entrenamiento sigue una cadena de destilación: parte de Qwen3.5-9B, sobre el que Jackrong aplicó SFT y RL para producir DeepSeek-V4-Pro-Qwen3.5-9B, y posteriormente xtools-at aplicó una ablación ARA (Heretic) para eliminar los comportamientos de rechazo. La model card no especifica el número de tokens de entrenamiento ni la composición exacta del dataset. La cabeza MTP (Multi-Token Prediction) permite decodificación especulativa nativa, prediciendo varios tokens por paso para acelerar la generación. Los tensores sensibles (`attn_v`, `ffn_down`, proyecciones de salida) se mantienen en Q6_K, mientras que normas, `ssm_dt`, `ssm_conv1d`, `A_log`, `dt_bias` y estados recurrentes permanecen en F32.

## Capacidades

- Generación de texto conversacional multi-turno con modo de razonamiento explícito (los tokens de razonamiento se devuelven en `reasoning_content`, visibles antes del token `</think>`).
- Razonamiento matemático y resolución de problemas paso a paso (el modelo base se entrenó con RL para reasoning).
- Comprensión de imágenes y vídeo mediante el proyector mmproj F16 (pipeline `image-text-to-text`).
- Capacidades multilingües en inglés, chino, coreano, japonés, español y ruso.
- Decodificación especulativa nativa mediante la cabeza MTP, que acelera la inferencia.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Comportamiento "uncensored": la ablación Heretic elimina los rechazos del modelo base ante peticiones sensibles.
- Plantilla de chat embebida en el GGUF, compatible con endpoints OpenAI (`/v1/chat/completions`).
- Soporte de tool calling y function calling: no confirmado explícitamente en la model card; se indica como no disponible.

## Casos de uso

- Investigación sobre alineación y red-teaming: el modelo, al carecer de mecanismos de rechazo, permite estudiar cómo responde un LLM ante prompts adversarios sin la interferencia de filtros, útil para evaluar robustez y diseñar salvaguardas.
- Análisis de documentos largos: con 262.144 tokens de contexto nativo, puede procesar libros completos, expedientes legales o bases de código extensas en una sola pasada, resumiendo o extrayendo información sin truncar.
- Asistencia multimodal en atención al cliente: combinando el tronco Q4_K_M con el proyector mmproj, el modelo puede analizar capturas de pantalla o fotos enviadas por usuarios y responder en varios idiomas (español, inglés, chino, etc.).
- Generación y revisión de código en local: desplegado con llama.cpp o LM Studio, sirve para autocompletado, explicación de fragmentos y revisión en entornos sin conexión, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Procesamiento de vídeo para moderación de contenido: la ruta multimodal acepta vídeo, lo que permite clasificar o describir secuencias audiovisuales en pipelines de moderación, aunque la ausencia de censura exige supervisión humana.
- Despliegue en hardware de consumo: al ocupar 5,7 GiB en Q4_K_M, cabe en GPUs de 8 GB de VRAM, lo que habilita prototipado y demos en estaciones de trabajo sin infraestructura de datacenter.
- Experimentación con decodificación especulativa: la cabeza MTP permite medir ganancias de throughput en comparación con decodificación autoregresiva estándar, útil para investigación en optimización de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~5,7 GiB para el tronco Q4_K_M en solitario; ~6,6 GiB si se carga también el proyector mmproj F16 (875,6 MiB). Con contexto de 16.384 tokens hay que sumar la caché KV, que para 32 capas con 4 cabezas KV y dimensión 256 es moderada pero crece con el contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 para despliegues de mayor concurrencia. Cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en Q4_K_M.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más (RTX 3060, RTX 4060, RTX 3070, etc.). Para contexto muy largo (más de 32K tokens) conviene 12-16 GB.
- Opciones de despliegue: llama.cpp (build b12182 o superior), llama-server con endpoint compatible con OpenAI, llama-mtmd-cli para visión, LM Studio (detección automática del prefijo `mmproj-`), Ollama (solo texto; el proyector no es cargable hoy), llama-cpp-python.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La cabeza MTP está diseñada para acelerar la decodificación mediante predicción multi-token, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (este) | 9,2 B | 262.144 | Sí (texto, imagen, vídeo) | Apache 2.0 | Ablación Heretic, MTP, híbrido lineal/completa |
| Qwen3.5-9B (base upstream) | ~9 B | no disponible | no disponible | no disponible | Modelo original sin destilación ni ablación; mantiene rechazos |
| Modelos densos de ~9B con contexto largo (p. ej. familia Llama 3.1 8B) | ~8 B | 128.000 | No | Llama license | Sin capacidades multimodales ni MTP; contexto menor |

La comparativa detallada con alternativas concretas no está disponible en la información proporcionada; los datos de la fila de Llama 3.1 8B se incluyen como referencia de categoría y deben verificarse en sus fichas oficiales.

## Limitaciones y advertencias

- La ablación Heretic elimina los rechazos de seguridad del modelo base; el modelo puede generar contenido dañino, ilegal o éticamente problemático sin filtros. No es apto para despliegues orientados al público sin salvaguardas externas.
- Riesgo de alucinación inherente a los modelos de ~9B, especialmente en tareas de razonamiento complejo o con contexto muy largo; la destilación y la cuantización Q4_K_M pueden acentuar imprecisiones.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al modelo en punto flotante; los tensores sensibles se mantienen en Q6_K, pero tareas de matemáticas finas o generación de código pueden degradarse.
- El soporte de tool calling y function calling no está confirmado en la model card; conviene validarlo antes de usarlo en pipelines de agentes.
- La capacidad de visión requiere cargar el archivo mmproj F16 junto al tronco; Ollama no soporta el proyector, por lo que en ese entorno el modelo es solo de texto.
- El contexto nativo es de 262.144 tokens, pero la VRAM necesaria para la caché KV crece con el contexto; en GPUs de 8 GB hay que limitar `n_ctx` (la model card usa 8.192-16.384 en los ejemplos).
- Idiomas soportados: seis (en, zh, ko, ja, es, ru); el rendimiento en español no está cuantificado y puede ser inferior al de inglés o chino.
- Aunque la licencia es Apache 2.0, el modelo base upstream y la cadena de destilación pueden tener condiciones adicionales; conviene revisar las fichas de Jackrong y xtools-at antes de uso comercial.
- El modelo se publicó en noviembre de 2026 y depende de un build específico de llama.cpp (b12182); versiones anteriores pueden no cargar correctamente la arquitectura `qwen35` ni la cabeza MTP.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Sakura721/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Modelo base (fp): https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Upstream de destilación: Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (referenciado en la model card; sin URL directa en la información disponible)
- llama.cpp: no se proporciona URL en la información disponible (build b12182, commit fd27b2034)
- LM Studio: no se proporciona URL en la información disponible
- Ollama: no se proporciona URL en la información disponible
